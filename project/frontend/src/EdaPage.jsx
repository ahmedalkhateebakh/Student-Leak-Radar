/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FileSpreadsheet,
  GraduationCap,
  RefreshCcw,
  Upload,
} from "lucide-react";
import Papa from "papaparse";
import { styles } from "./styles";
import { RecoveryPrompt, useAnalytics, usePersistentDraft, useToast, useUnsavedChanges, useUrlState } from "./enterpriseUx";

const MODEL_FEATURES = [
  "avg_score_until_cutoff",
  "submitted_assessments_until_cutoff",
  "arab_active_days_equivalent_until_cutoff",
  "avg_submission_delay_arab_days_until_cutoff",
  "homepage",
  "age_band",
  "forumng",
  "unique_sites_until_cutoff",
  "unique_activity_types_until_cutoff",
  "clicks_per_active_day_until_cutoff",
  "resource",
  "subpage",
  "url",
  "oucontent",
  "quiz",
  "highest_education",
  "imd_band",
];

const ACTIVITY_COLUMNS = [
  "homepage",
  "forumng",
  "resource",
  "subpage",
  "url",
  "oucontent",
  "quiz",
  "dataplus",
  "externalquiz",
  "oucollaborate",
  "ouwiki",
  "page",
  "total_clicks",
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const API_FALLBACK_BASE = "http://127.0.0.1:8000";

function apiUrl(base, path) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function apiFetch(path, options) {
  const primaryUrl = apiUrl(API_BASE, path);
  try {
    const response = await fetch(primaryUrl, options);
    if (response.ok || API_BASE !== "/api") return response;
  } catch (error) {
    if (API_BASE !== "/api") throw error;
  }
  try {
    return await fetch(apiUrl(API_FALLBACK_BASE, path), options);
  } catch {
    throw new Error("Backend is not running on http://127.0.0.1:8000");
  }
}

async function readApiError(response) {
  try {
    const data = await response.json();
    return data.detail || data.message || `Backend returned ${response.status}`;
  } catch {
    return `Backend returned ${response.status}`;
  }
}

const ui = {
  pageIntro: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: 18,
    alignItems: "stretch",
    marginBottom: 20,
  },
  panel: {
    border: "1px solid rgba(148,163,184,.18)",
    background: "linear-gradient(180deg, rgba(15,23,42,.78), rgba(2,6,23,.58))",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 24px 80px rgba(0,0,0,.26)",
  },
  uploadPanel: {
    border: "1px dashed rgba(94,234,212,.46)",
    background: "linear-gradient(135deg, rgba(56,189,248,.14), rgba(234,179,8,.08))",
    borderRadius: 24,
    padding: 20,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  wide: {
    gridColumn: "1 / -1",
  },
  card: {
    border: "1px solid rgba(148,163,184,.16)",
    background: "rgba(2,6,23,.38)",
    borderRadius: 20,
    padding: 18,
    minHeight: 260,
  },
  stat: {
    border: "1px solid rgba(148,163,184,.16)",
    background: "linear-gradient(180deg, rgba(30,41,59,.68), rgba(15,23,42,.58))",
    borderRadius: 18,
    padding: 16,
  },
  label: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },
  value: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: 950,
    letterSpacing: "-.05em",
    marginTop: 8,
  },
  hint: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    margin: 0,
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: 950,
    letterSpacing: "-.025em",
  },
  subtitle: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.55,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#a7f3d0",
    border: "1px solid rgba(45,212,191,.25)",
    background: "rgba(56,189,248,.12)",
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 900,
  },
  fileInput: {
    width: "100%",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,.28)",
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    background: "rgba(2,6,23,.50)",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(148,163,184,.22)",
    color: "#cbd5e1",
    background: "rgba(15,23,42,.62)",
    borderRadius: 15,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 18,
    marginTop: 14,
  },
  table: {
    width: "100%",
    minWidth: 860,
    borderCollapse: "collapse",
    color: "#e2e8f0",
    background: "rgba(2,6,23,.38)",
  },
  th: {
    textAlign: "left",
    color: "#a7f3d0",
    borderBottom: "1px solid rgba(148,163,184,.16)",
    padding: "13px 14px",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".10em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid rgba(148,163,184,.09)",
    padding: "12px 14px",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
};

const responsiveStyles = `
  .eda-svg { width: 100%; height: 250px; display: block; overflow: visible; }
  .eda-axis { stroke: rgba(148,163,184,.20); stroke-width: 1; }
  .eda-label { fill: #94a3b8; font-size: 11px; font-weight: 700; }
  .eda-value { fill: #f8fafc; font-size: 12px; font-weight: 900; }
  .eda-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
  .eda-progress {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    align-items: center;
    margin-top: 12px;
    color: #dbeafe;
    font-size: 12px;
    font-weight: 900;
  }
  .eda-progress progress {
    grid-column: 1 / -1;
    width: 100%;
    height: 8px;
    border: 0;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(148,163,184,.16);
  }
  .eda-progress progress::-webkit-progress-bar { background: rgba(148,163,184,.16); }
  .eda-progress progress::-webkit-progress-value { background: linear-gradient(90deg, #5eead4, #38bdf8); }

  @media (max-width: 980px) {
    .eda-page-intro, .eda-grid-2 { grid-template-columns: 1fr !important; }
    .eda-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  }

  @media (max-width: 640px) {
    .eda-grid-4 { grid-template-columns: 1fr !important; }
  }
`;

export default function EdaPage() {
  const [urlState, setUrlState] = useUrlState({ view: "overview", risk: "", sort: "" });
  const { notify } = useToast();
  const { track } = useAnalytics();
  const [backendData, setBackendData] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [backendLoading, setBackendLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({ visible: false, stage: "", percent: 0 });

  const loadEda = async (alive = true) => {
    setBackendLoading(true);
    setBackendError("");
    try {
      const response = await apiFetch("/eda");
      if (!response.ok) throw new Error(await readApiError(response));
      const data = await response.json();
      if (alive) setBackendData(data);
    } catch (error) {
      if (alive) setBackendError(error.message || "Backend EDA summary is unavailable.");
    } finally {
      if (alive) setBackendLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    loadEda(alive);
    return () => {
      alive = false;
    };
  }, []);

  const analytics = useMemo(() => {
    if (rows.length) return buildUploadedAnalytics(rows);
    if (backendData) return buildBackendAnalytics(backendData);
    return null;
  }, [backendData, rows]);
  const isDirty = rows.length > 0 || Boolean(fileName);
  const sessionSnapshot = useMemo(() => ({ rows: rows.slice(0, 3000), fileName, view: urlState.view, risk: urlState.risk, sort: urlState.sort }), [fileName, rows, urlState.risk, urlState.sort, urlState.view]);

  useUnsavedChanges("intelligence-lab", isDirty);
  const recovery = usePersistentDraft("slr:draft:intelligence-lab", sessionSnapshot, {
    enabled: isDirty,
    onRestore: (draft) => {
      setRows(Array.isArray(draft.rows) ? draft.rows : []);
      setFileName(draft.fileName || "");
      setUrlState({ view: draft.view || "overview", risk: draft.risk || "", sort: draft.sort || "" });
      notify({ title: "Previous lab session restored", tone: "success" });
    },
  });

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setUploadProgress({ visible: true, stage: "Uploading dataset...", percent: 20 });
    try {
      setUploadProgress({ visible: true, stage: "Processing...", percent: 62 });
      const importedRows = await parseImportedDataset(file);
      if (!importedRows.length) throw new Error("No student records found. Upload a valid dataset to continue.");
      setRows(importedRows);
      setUploadProgress({ visible: true, stage: "Dataset ready", percent: 100 });
      notify({ title: "Dataset uploaded", message: `${importedRows.length} records loaded in Intelligence Lab.`, tone: "success" });
      track("Dataset Uploaded", { page: "Intelligence Lab", rows: importedRows.length });
      window.setTimeout(() => setUploadProgress((prev) => ({ ...prev, visible: false })), 900);
    } catch (error) {
      setRows([]);
      setParseError(error.message || "Could not parse the selected data file.");
      setUploadProgress({ visible: false, stage: "", percent: 0 });
      notify({ title: "Error loading dataset", message: error.message || "Could not parse the selected data file.", tone: "error" });
    }
  };

  const resetUpload = () => {
    setRows([]);
    setFileName("");
    setParseError("");
    recovery.clear();
  };

  return (
    <div className="fade-in" style={styles.card}>
      <style>{responsiveStyles}</style>
      <RecoveryPrompt candidate={recovery.candidate} onRestore={recovery.restore} onDiscard={recovery.discard} />

      <div className="eda-page-intro" style={ui.pageIntro}>
        <section style={ui.panel}>
          <span style={styles.eyebrow}>Notebook EDA</span>
          <h2 style={styles.stepTitle}>Student behavior, outcomes, and early-warning signals</h2>
          <p style={styles.stepDesc}>
            A clearer EDA view based on the notebook flow: final outcomes, module distribution,
            demographic context, assessment scores, VLE activity, and model feature readiness.
          </p>
          <div style={ui.actionRow}>
            <span style={ui.pill}>
              <Database size={15} />
              {rows.length ? `${fmt(rows.length)} uploaded rows` : backendData ? "Backend OULAD snapshot" : "Waiting for data"}
            </span>
            {fileName && <span style={ui.pill}>{fileName}</span>}
            {urlState.view && <span style={ui.pill}>View: {pretty(urlState.view)}</span>}
            {urlState.risk && <span style={ui.pill}>Risk: {pretty(urlState.risk)}</span>}
            {urlState.sort && <span style={ui.pill}>Sort: {pretty(urlState.sort)}</span>}
          </div>
        </section>

        <aside style={ui.uploadPanel}>
          <span style={ui.pill}>
            <Upload size={15} />
            Optional upload
          </span>
          <h3 style={{ ...ui.title, marginTop: 12 }}>Inspect another dataset</h3>
          <p style={ui.subtitle}>
            Upload CSV, Excel, or JSON to recreate the same notebook-style charts on your own feature table.
          </p>
          <input style={ui.fileInput} type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFile} />
          {uploadProgress.visible && (
            <div className="eda-progress" role="status" aria-live="polite">
              <span>{uploadProgress.stage}</span>
              <strong>{uploadProgress.percent}%</strong>
              <progress value={uploadProgress.percent} max="100" aria-label={uploadProgress.stage} />
            </div>
          )}
          <div style={ui.actionRow}>
            <button type="button" style={ui.ghostButton} onClick={resetUpload}>
              <RefreshCcw size={15} />
              Use backend data
            </button>
          </div>
          {parseError && <p style={{ ...ui.subtitle, color: "#fecaca" }}>{parseError}</p>}
        </aside>
      </div>

      {!analytics ? (
        <section style={ui.panel}>
          <p style={ui.subtitle}>{backendError || (backendLoading ? "Loading EDA summary from the backend..." : "No student records found. Upload a valid dataset to continue.")}</p>
          {backendError && (
            <button type="button" style={{ ...ui.ghostButton, marginTop: 14 }} onClick={() => loadEda(true)}>
              <RefreshCcw size={15} />
              Retry
            </button>
          )}
        </section>
      ) : (
        <NotebookDashboard analytics={analytics} />
      )}
    </div>
  );
}

function NotebookDashboard({ analytics }) {
  return (
    <>
      <section className="eda-grid-4" style={ui.grid4}>
        <Metric icon={Database} label="Records" value={fmt(analytics.totalRows)} hint="student-course attempts" />
        <Metric icon={GraduationCap} label="Students" value={fmt(analytics.uniqueStudents)} hint="unique learners" />
        <Metric icon={BookOpen} label="Modules" value={fmt(analytics.modules)} hint="course modules" />
        <Metric icon={Activity} label="Success rate" value={`${num(analytics.successRate, 0)}%`} hint="Pass + Distinction" />
      </section>

      <section className="eda-grid-2" style={ui.grid2}>
        <ChartCard title="Final Result Distribution" subtitle="Same first question from the notebooks: how outcomes are distributed.">
          <DonutChart data={analytics.finalResult} />
        </ChartCard>
        <ChartCard title="Outcome Count by Module" subtitle="Module pressure view for Pass, Distinction, Fail, and Withdrawn records.">
          <StackedModuleBars data={analytics.moduleOutcomes} />
        </ChartCard>
      </section>

      <section className="eda-grid-2" style={ui.grid2}>
        <ChartCard title="Assessment Score Distribution" subtitle="Histogram of submitted assessment scores or model-ready average score features.">
          <Histogram data={analytics.scoreBins} />
        </ChartCard>
        <ChartCard title="VLE Activity Mix" subtitle="Top learning platform activity types and click-based engagement columns.">
          <HorizontalBars data={analytics.activityMix} valueLabel="clicks" />
        </ChartCard>
      </section>

      <section className="eda-grid-2" style={ui.grid2}>
        <ChartCard title="Demographic Profile" subtitle="Gender, age, education, and IMD bands used as baseline context.">
          <SmallMultiples groups={analytics.demographics} />
        </ChartCard>
        <ChartCard title="Model Feature Readiness" subtitle="Coverage of the 17 selected Random Forest features used by the prediction console.">
          <FeatureReadiness readiness={analytics.readiness} />
        </ChartCard>
      </section>

      <section style={ui.panel}>
        <div className="eda-card-head">
          <div>
            <h3 style={ui.title}>EDA Sample Table</h3>
            <p style={ui.subtitle}>A notebook-like preview of the loaded table after normalizing common OULAD column names.</p>
          </div>
          <span style={ui.pill}>
            <FileSpreadsheet size={14} />
            {analytics.source}
          </span>
        </div>
        <SampleTable rows={analytics.sampleRows} />
      </section>
    </>
  );
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div style={ui.stat}>
      <span style={ui.pill}>
        <Icon size={14} />
        {label}
      </span>
      <div style={ui.value}>{value}</div>
      <p style={ui.hint}>{hint}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section style={ui.card}>
      <div className="eda-card-head">
        <div>
          <h3 style={ui.title}>{title}</h3>
          <p style={ui.subtitle}>{subtitle}</p>
        </div>
        <span style={ui.pill}>
          <BarChart3 size={14} />
          EDA
        </span>
      </div>
      {children}
    </section>
  );
}

function DonutChart({ data }) {
  const total = sum(data.map((item) => item.count));
  if (!total) return <EmptyChart message="No final_result data available." />;
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const segments = data.reduce(
    (acc, item) => {
      const length = (item.count / total) * circumference;
      acc.items.push({ ...item, length, offset: acc.offset });
      acc.offset += length;
      return acc;
    },
    { offset: 0, items: [] }
  ).items;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18, alignItems: "center" }}>
      <svg viewBox="0 0 220 220" style={{ width: "100%", maxWidth: 220 }}>
        <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(15,23,42,.9)" strokeWidth="28" />
        {segments.map((item, index) => {
          const strokeDasharray = `${item.length} ${circumference - item.length}`;
          const strokeDashoffset = -item.offset;
          return (
            <circle
              key={item.label}
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={colorFor(index, item.label)}
              strokeWidth="28"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 110 110)"
            />
          );
        })}
        <text x="110" y="104" textAnchor="middle" fill="#f8fafc" fontSize="34" fontWeight="950">
          {fmt(total)}
        </text>
        <text x="110" y="128" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="900">
          records
        </text>
      </svg>
      <Legend data={data} total={total} />
    </div>
  );
}

function Legend({ data, total }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {data.map((item, index) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto", gap: 10, alignItems: "center" }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: colorFor(index, item.label) }} />
          <span style={{ color: "#e2e8f0", fontWeight: 900 }}>{item.label}</span>
          <span style={{ color: "#94a3b8", fontWeight: 850 }}>{num((item.count / total) * 100, 1)}%</span>
        </div>
      ))}
    </div>
  );
}

function StackedModuleBars({ data }) {
  if (!data.length) return <EmptyChart message="No module outcome data available." />;
  const labels = ["Distinction", "Pass", "Fail", "Withdrawn", "At Risk", "Lower Risk"];
  const visibleLabels = labels.filter((label) => data.some((row) => row[label] > 0));
  const maxTotal = Math.max(...data.map((row) => row.total), 1);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {data.slice(0, 8).map((row) => (
        <div key={row.module} style={{ display: "grid", gridTemplateColumns: "80px 1fr 58px", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#cbd5e1", fontWeight: 900 }}>{row.module}</span>
          <div style={{ height: 28, background: "rgba(2,6,23,.66)", borderRadius: 999, overflow: "hidden", display: "flex", width: `${Math.max(9, (row.total / maxTotal) * 100)}%` }}>
            {visibleLabels.map((label, index) => (
              <span
                key={label}
                title={`${label}: ${row[label] || 0}`}
                style={{
                  width: `${((row[label] || 0) / row.total) * 100}%`,
                  background: colorFor(index, label),
                }}
              />
            ))}
          </div>
          <span style={{ color: "#94a3b8", textAlign: "right", fontWeight: 850 }}>{fmt(row.total)}</span>
        </div>
      ))}
    </div>
  );
}

function Histogram({ data }) {
  if (!data.length) return <EmptyChart message="No score column found." />;
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <svg className="eda-svg" viewBox="0 0 620 250" preserveAspectRatio="none">
      <line className="eda-axis" x1="34" y1="218" x2="600" y2="218" />
      {data.map((item, index) => {
        const width = 42;
        const gap = 12;
        const x = 42 + index * (width + gap);
        const height = (item.count / max) * 160;
        const y = 218 - height;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={width} height={height} rx="8" fill={index < 5 ? "#5eead4" : index < 7 ? "#38bdf8" : "#fb7185"} opacity=".9" />
            <text className="eda-label" x={x + width / 2} y="238" textAnchor="middle">{item.label}</text>
            <text className="eda-value" x={x + width / 2} y={Math.max(16, y - 8)} textAnchor="middle">{fmt(item.count)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBars({ data, valueLabel }) {
  if (!data.length) return <EmptyChart message="No activity columns found." />;
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {data.slice(0, 10).map((item, index) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "125px 1fr 90px", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pretty(item.label)}</span>
          <div style={{ height: 22, borderRadius: 999, background: "rgba(2,6,23,.65)", overflow: "hidden" }}>
            <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${colorFor(index, item.label)}, #38bdf8)`, borderRadius: 999 }} />
          </div>
          <span style={{ color: "#94a3b8", fontSize: 12, textAlign: "right", fontWeight: 850 }}>
            {fmt(item.count)} {valueLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

function SmallMultiples({ groups }) {
  const visible = groups.filter((group) => group.data.length);
  if (!visible.length) return <EmptyChart message="No demographic fields found." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
      {visible.map((group) => (
        <div key={group.title} style={{ border: "1px solid rgba(148,163,184,.12)", borderRadius: 16, padding: 13, background: "rgba(15,23,42,.38)" }}>
          <h4 style={{ margin: "0 0 10px", color: "#f8fafc", fontSize: 14 }}>{group.title}</h4>
          <HorizontalBars data={group.data.slice(0, 4)} valueLabel="" />
        </div>
      ))}
    </div>
  );
}

function FeatureReadiness({ readiness }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 18, alignItems: "center" }}>
        <svg viewBox="0 0 160 160" style={{ width: "100%" }}>
          <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(15,23,42,.9)" strokeWidth="18" />
          <circle
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke={readiness.percent >= 80 ? "#5eead4" : readiness.percent >= 50 ? "#38bdf8" : "#fb7185"}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${readiness.percent * 3.64} 364`}
            transform="rotate(-90 80 80)"
          />
          <text x="80" y="76" textAnchor="middle" fill="#f8fafc" fontSize="30" fontWeight="950">{readiness.percent}%</text>
          <text x="80" y="98" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="900">coverage</text>
        </svg>
        <div>
          <p style={ui.subtitle}>
            {readiness.available.length} of {MODEL_FEATURES.length} selected model features were detected.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {readiness.missing.slice(0, 9).map((feature) => (
              <span key={feature} style={{ ...ui.pill, color: "#fecaca", background: "rgba(239,68,68,.11)", borderColor: "rgba(239,68,68,.26)" }}>
                {pretty(feature)}
              </span>
            ))}
            {!readiness.missing.length && <span style={ui.pill}>All selected features found</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleTable({ rows }) {
  if (!rows.length) return <EmptyChart message="No rows to preview." />;
  const columns = Object.keys(rows[0]).slice(0, 9);
  return (
    <div style={ui.tableWrap}>
      <table style={ui.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={ui.th}>{pretty(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column} style={ui.td}>{formatCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ minHeight: 180, display: "grid", placeItems: "center", color: "#94a3b8", border: "1px dashed rgba(148,163,184,.18)", borderRadius: 16 }}>
      {message}
    </div>
  );
}

function buildBackendAnalytics(data) {
  const finalResult = sortOutcome(data.final_result || []);
  const moduleCounts = data.module || [];
  const scoreBins = (data.score_bins || []).map((item) => ({ label: item.bin, count: item.count }));
  const activityMix = (data.vle_activities || []).map((item) => ({ label: item.label, count: item.count }));
  const totalRows = Number(data.total_rows || sum(finalResult.map((item) => item.count)));
  const successRate = totalRows ? (sum(finalResult.filter((item) => ["Pass", "Distinction", "Lower Risk"].includes(item.label)).map((item) => item.count)) / totalRows) * 100 : 0;

  return {
    source: "Backend raw EDA",
    totalRows,
    uniqueStudents: Number(data.unique_students || 0),
    modules: Number(data.modules || moduleCounts.length || 0),
    successRate,
    finalResult,
    moduleOutcomes: moduleCounts.map((item) => ({ module: item.label, total: item.count, Pass: item.count, Distinction: 0, Fail: 0, Withdrawn: 0 })),
    scoreBins,
    activityMix,
    demographics: [
      { title: "Gender", data: data.gender || [] },
      { title: "Age band", data: data.age_band || [] },
      { title: "Education", data: data.highest_education || [] },
      { title: "IMD band", data: data.imd_band || [] },
    ],
    readiness: { percent: 0, available: [], missing: MODEL_FEATURES },
    sampleRows: makeBackendSample(data),
  };
}

function buildUploadedAnalytics(rows) {
  const normalized = rows.map(normalizeRow);
  const finalResult = sortOutcome(countBy(normalized, (row) => resolveOutcome(row)));
  const totalRows = normalized.length;
  const uniqueStudents = new Set(normalized.map((row) => text(row.id_student || row.student_id || row.id)).filter(Boolean)).size || totalRows;
  const moduleSet = new Set(normalized.map((row) => text(row.code_module || row.module)).filter(Boolean));
  const successRate = totalRows ? (normalized.filter((row) => isSuccessful(resolveOutcome(row))).length / totalRows) * 100 : 0;

  return {
    source: "Uploaded dataset",
    totalRows,
    uniqueStudents,
    modules: moduleSet.size || 1,
    successRate,
    finalResult,
    moduleOutcomes: buildModuleOutcomes(normalized),
    scoreBins: buildScoreBins(normalized),
    activityMix: buildActivityMix(normalized),
    demographics: [
      { title: "Gender", data: countBy(normalized, (row) => row.gender) },
      { title: "Age band", data: countBy(normalized, (row) => row.age_band) },
      { title: "Education", data: countBy(normalized, (row) => row.highest_education) },
      { title: "IMD band", data: countBy(normalized, (row) => row.imd_band || "Unknown") },
    ],
    readiness: inspectReadiness(normalized),
    sampleRows: normalized.slice(0, 8),
  };
}

function buildModuleOutcomes(rows) {
  const grouped = groupBy(rows, (row) => text(row.code_module || row.module) || "Unknown");
  return Object.entries(grouped)
    .map(([module, items]) => {
      const row = { module, total: items.length };
      items.forEach((item) => {
        const outcome = resolveOutcome(item);
        row[outcome] = (row[outcome] || 0) + 1;
      });
      return row;
    })
    .sort((a, b) => b.total - a.total);
}

function buildScoreBins(rows) {
  const scores = rows
    .map((row) => firstNumber(row, ["score", "avg_score", "avg_score_until_cutoff", "assessment_score_mean", "assessment_weighted_score_mean"]))
    .filter(Number.isFinite)
    .map((value) => clamp(value, 0, 100));
  if (!scores.length) return [];
  const bins = Array.from({ length: 10 }, (_, index) => ({ label: `${index * 10}-${(index + 1) * 10}`, count: 0 }));
  scores.forEach((score) => {
    bins[Math.min(9, Math.floor(score / 10))].count += 1;
  });
  return bins;
}

function buildActivityMix(rows) {
  return ACTIVITY_COLUMNS
    .map((column) => ({ label: column, count: sum(rows.map((row) => number(row[column]))) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function inspectReadiness(rows) {
  const columns = new Set(Object.keys(rows[0] || {}).map(normalizeKey));
  const available = MODEL_FEATURES.filter((feature) => columns.has(normalizeKey(feature)));
  const missing = MODEL_FEATURES.filter((feature) => !columns.has(normalizeKey(feature)));
  return {
    percent: Math.round((available.length / MODEL_FEATURES.length) * 100),
    available,
    missing,
  };
}

function makeBackendSample(data) {
  const rows = [];
  (data.final_result || []).forEach((item) => {
    rows.push({ table: "studentInfo", field: "final_result", label: item.label, count: item.count });
  });
  (data.module || []).slice(0, 4).forEach((item) => {
    rows.push({ table: "studentInfo", field: "code_module", label: item.label, count: item.count });
  });
  (data.vle_activities || []).slice(0, 4).forEach((item) => {
    rows.push({ table: "vle", field: "activity_type", label: item.label, count: item.count });
  });
  return rows;
}

async function parseImportedDataset(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const result = Papa.parse(await file.text(), { header: true, skipEmptyLines: true, dynamicTyping: true });
    if (result.errors?.length) throw new Error(result.errors.slice(0, 3).map((error) => error.message).join(" | "));
    return cleanImportedRows(result.data);
  }
  if (name.endsWith(".json")) {
    const parsed = JSON.parse(await file.text());
    const rows = Array.isArray(parsed) ? parsed : parsed.rows || parsed.data || parsed.items || [];
    if (!Array.isArray(rows)) throw new Error("JSON must be an array or contain rows/data/items array.");
    return cleanImportedRows(rows);
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return cleanImportedRows(XLSX.utils.sheet_to_json(firstSheet, { defval: "" }));
  }
  throw new Error("Unsupported file type. Upload CSV, Excel (.xlsx/.xls), or JSON.");
}

function cleanImportedRows(rows) {
  return rows.filter((row) => Object.keys(row || {}).some((key) => row[key] !== null && row[key] !== undefined && row[key] !== ""));
}

function normalizeRow(row) {
  const out = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    out[normalizeKey(key)] = value;
  });
  return out;
}

function resolveOutcome(row) {
  const raw = text(row.final_result || row.target || row.predicted_target || row.prediction_level || row.risk_prediction || row.at_risk);
  const lower = raw.toLowerCase();
  if (["1", "at_risk", "risk", "high risk", "medium risk"].includes(lower)) return "At Risk";
  if (["0", "successful", "lower_risk", "low risk"].includes(lower)) return "Lower Risk";
  if (["pass", "distinction", "fail", "withdrawn"].includes(lower)) return titleCase(lower);
  return raw || "Unknown";
}

function isSuccessful(outcome) {
  return ["Pass", "Distinction", "Lower Risk", "successful"].includes(outcome);
}

function sortOutcome(items) {
  const order = ["Distinction", "Pass", "Fail", "Withdrawn", "Lower Risk", "At Risk", "Unknown"];
  return [...items].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
}

function countBy(items, getKey) {
  const counts = {};
  items.forEach((item) => {
    const key = text(getKey(item)) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function firstNumber(row, keys) {
  for (const key of keys) {
    const value = number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return NaN;
}

function number(value) {
  if (value === null || value === undefined || value === "") return NaN;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function sum(values) {
  return values.reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0);
}

function normalizeKey(key) {
  return String(key || "").trim().replace(/\s+/g, "_").replace(/-/g, "_").toLowerCase();
}

function pretty(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (char) => char.toUpperCase());
}

function text(value) {
  return String(value ?? "").trim();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function fmt(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "-";
  return Number(value || 0).toLocaleString();
}

function num(value, digits = 1) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "-";
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? fmt(value) : num(value, 2);
  return String(value);
}

function colorFor(index, label = "") {
  const semantic = {
    Distinction: "#5eead4",
    Pass: "#22c55e",
    Fail: "#38bdf8",
    Withdrawn: "#fb7185",
    "At Risk": "#fb7185",
    "Lower Risk": "#5eead4",
  };
  return semantic[label] || ["#5eead4", "#38bdf8", "#fb7185", "#60a5fa", "#c084fc", "#5eead4", "#60a5fa"][index % 7];
}
