import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Download, FileSpreadsheet, RefreshCcw } from "lucide-react";
import Papa from "papaparse";
import { styles } from "./styles";
import { useAnalytics, useToast } from "./enterpriseUx";

function readDraft() {
  try {
    return JSON.parse(window.localStorage.getItem("slr:draft:prediction-console") || "null");
  } catch {
    return null;
  }
}

function downloadText(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ModelOutputPage() {
  const [searchParams] = useSearchParams();
  const { notify } = useToast();
  const { track } = useAnalytics();
  const [draft, setDraft] = useState(() => readDraft());
  const [stage, setStage] = useState("");
  const dataset = searchParams.get("dataset") || "latest";
  const risk = searchParams.get("risk") || "";
  const snapshot = draft?.snapshot || {};

  const rows = useMemo(() => {
    if (Array.isArray(snapshot.batchResults) && snapshot.batchResults.length) return snapshot.batchResults;
    if (snapshot.prediction) return [{ id: "Current student", ...snapshot.prediction }];
    return [];
  }, [snapshot.batchResults, snapshot.prediction]);

  const filteredRows = useMemo(() => {
    if (risk !== "high") return rows;
    return rows.filter((row) => Number(row.riskScore ?? row.risk_score ?? 0) >= 70 || String(row.level || "").toLowerCase().includes("high"));
  }, [risk, rows]);

  const exportRows = () => {
    setStage("Preparing report...");
    track("Export Clicked", { page: "Model Output", dataset, rows: filteredRows.length });
    window.setTimeout(() => setStage("Creating CSV..."), 180);
    window.setTimeout(() => {
      downloadText(Papa.unparse(filteredRows), "model_output.csv", "text/csv;charset=utf-8");
      setStage("Export ready");
      notify({ title: "Export generated", message: "Model output CSV is ready.", tone: "success" });
      window.setTimeout(() => setStage(""), 1200);
    }, 420);
  };

  return (
    <main className="fade-in" style={styles.card}>
      <section style={styles.sectionIntro}>
        <span style={styles.eyebrow}>Model Output</span>
        <h1 style={styles.stepTitle}>Latest prediction output</h1>
        <p style={styles.stepDesc}>
          Review saved prediction results from the current browser session. Deep links preserve dataset, risk, and export context.
        </p>
      </section>

      <div style={styles.resultStatsRow}>
        <OutputStat label="Dataset" value={dataset} />
        <OutputStat label="Rows" value={filteredRows.length || 0} />
        <OutputStat label="Filter" value={risk || "All"} />
      </div>

      {!filteredRows.length ? (
        <section style={{ ...styles.previewBox, marginTop: 22 }}>
          <AlertTriangle size={24} color="#38bdf8" />
          <h2 style={{ ...styles.previewTitle, marginTop: 12 }}>No student records found.</h2>
          <p style={styles.resultText}>Run a prediction or upload a valid dataset to continue.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Link to="/prediction-console?tab=data" style={{ ...styles.primaryBtn, textDecoration: "none" }}>
              Open Prediction Console
            </Link>
            <button type="button" style={styles.secondaryBtn} onClick={() => setDraft(readDraft())}>
              <RefreshCcw size={15} />
              Retry
            </button>
          </div>
        </section>
      ) : (
        <>
          <section style={{ ...styles.exportPanel, width: "100%", maxWidth: "none", marginTop: 22 }}>
            <div>
              <div style={styles.exportTitle}>Export workflow</div>
              <p style={styles.exportDesc}>{stage || "Download the latest prediction output as CSV."}</p>
            </div>
            <button type="button" style={styles.exportPrimaryBtn} onClick={exportRows}>
              <Download size={15} />
              CSV
            </button>
          </section>
          <div style={{ ...styles.tableWrap, marginTop: 18 }}>
            <table style={styles.resultsTable}>
              <thead>
                <tr>
                  <th style={styles.tableHead}>Student</th>
                  <th style={styles.tableHead}>Risk Score</th>
                  <th style={styles.tableHead}>Level</th>
                  <th style={styles.tableHead}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, 50).map((row, index) => (
                  <tr key={`${row.id || "student"}-${index}`} style={styles.tableRow}>
                    <td style={styles.tableCell}>{row.id || `Student ${index + 1}`}</td>
                    <td style={styles.tableCell}>{row.riskScore ?? row.risk_score ?? "-"}</td>
                    <td style={styles.tableCell}>{row.level || "-"}</td>
                    <td style={styles.tableCell}>{row.confidence ? `${row.confidence}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function OutputStat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>
        <FileSpreadsheet size={13} />
        {label}
      </span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}
