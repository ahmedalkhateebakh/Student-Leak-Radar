import { useEffect, useMemo, useState } from "react";
import {
  Database,
  FileUp,
  Gauge,
  Layers3,
  Play,
  RotateCcw,
  ShieldAlert,
  Target,
  Upload,
  WandSparkles,
} from "lucide-react";
import Papa from "papaparse";
import { styles } from "./styles";

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
];

const MODEL_FEATURES = {
  25: [
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
  ],
  50: [
    "avg_score_until_cutoff",
    "submitted_assessments_until_cutoff",
    "arab_active_days_equivalent_until_cutoff",
    "avg_submission_delay_arab_days_until_cutoff",
    "homepage",
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
  ],
};

const ui = {
  panel: {
    border: "1px solid rgba(255,255,255,.13)",
    background: "linear-gradient(180deg, rgba(15,23,42,.82), rgba(2,6,23,.66))",
    borderRadius: 26,
    boxShadow: "0 24px 80px rgba(0,0,0,.30)",
    padding: 22,
    backdropFilter: "blur(20px)",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.08fr .92fr",
    gap: 16,
    marginBottom: 18,
  },
  uploadBox: {
    border: "1px dashed rgba(94,234,212,.48)",
    background:
      "linear-gradient(135deg, rgba(20,184,166,.15), rgba(8,47,73,.24) 48%, rgba(234,179,8,.09))",
    borderRadius: 22,
    padding: 20,
  },
  card: {
    border: "1px solid rgba(148,163,184,.16)",
    background:
      "linear-gradient(180deg, rgba(15,23,42,.72), rgba(2,6,23,.48)), radial-gradient(circle at top left, rgba(244,63,94,.12), transparent 34%)",
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
  },
  compactCard: {
    border: "1px solid rgba(148,163,184,.14)",
    background: "rgba(2,6,23,.34)",
    borderRadius: 18,
    padding: 15,
  },
  cardTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: "-.02em",
  },
  cardSub: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.58,
  },
  note: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.65,
  },
  toolbarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  controlGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: ".08em",
    marginBottom: 7,
    fontWeight: 900,
  },
  input: {
    width: "100%",
    color: "#e2e8f0",
    border: "1px solid rgba(148,163,184,.24)",
    borderRadius: 14,
    padding: "12px 13px",
    background: "rgba(2,6,23,.64)",
    outline: "none",
  },
  fileInput: {
    width: "100%",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,.25)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(2,6,23,.42)",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    minHeight: 46,
    border: 0,
    borderRadius: 15,
    padding: "12px 16px",
    color: "#04111f",
    fontWeight: 950,
    cursor: "pointer",
    background: "linear-gradient(135deg, #5eead4, #facc15)",
    boxShadow: "0 16px 44px rgba(20,184,166,.16)",
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    minHeight: 46,
    border: "1px solid rgba(148,163,184,.22)",
    borderRadius: 15,
    padding: "12px 16px",
    color: "#cbd5e1",
    fontWeight: 900,
    cursor: "pointer",
    background: "rgba(15,23,42,.56)",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#99f6e4",
    background: "rgba(20,184,166,.11)",
    border: "1px solid rgba(45,212,191,.25)",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 850,
  },
  dangerPill: {
    color: "#fecaca",
    background: "rgba(239,68,68,.13)",
    border: "1px solid rgba(239,68,68,.28)",
  },
  warningPill: {
    color: "#fde68a",
    background: "rgba(245,158,11,.13)",
    border: "1px solid rgba(245,158,11,.28)",
  },
  successPill: {
    color: "#a7f3d0",
    background: "rgba(16,185,129,.13)",
    border: "1px solid rgba(16,185,129,.28)",
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  step: {
    border: "1px solid rgba(148,163,184,.15)",
    background: "rgba(15,23,42,.50)",
    borderRadius: 18,
    padding: 14,
  },
  stepActive: {
    borderColor: "rgba(94,234,212,.44)",
    background: "linear-gradient(135deg, rgba(20,184,166,.14), rgba(234,179,8,.08))",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    margin: "18px 0",
  },
  metric: {
    border: "1px solid rgba(148,163,184,.16)",
    background: "linear-gradient(180deg, rgba(30,41,59,.76), rgba(15,23,42,.62))",
    borderRadius: 18,
    padding: 16,
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: ".08em",
    fontWeight: 900,
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: 950,
    marginTop: 8,
    letterSpacing: "-.045em",
  },
  metricHint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 5,
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  wide: {
    gridColumn: "1 / -1",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 780,
    fontSize: 13,
    color: "#cbd5e1",
  },
  th: {
    textAlign: "left",
    color: "#99f6e4",
    borderBottom: "1px solid rgba(148,163,184,.18)",
    padding: "11px 10px",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: ".07em",
  },
  td: {
    borderBottom: "1px solid rgba(148,163,184,.10)",
    padding: "11px 10px",
  },
};

const responsiveStyles = `
  @media (max-width: 980px) {
    .eda-top-grid, .eda-chart-grid { grid-template-columns: 1fr !important; }
    .eda-metric-grid, .eda-steps { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  }

  @media (max-width: 640px) {
    .eda-control-grid, .eda-toolbar-grid, .eda-metric-grid, .eda-steps { grid-template-columns: 1fr !important; }
  }
`;

export default function EdaPage() {
  const [backendData, setBackendData] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [checkpoint, setCheckpoint] = useState("50");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [riskThreshold, setRiskThreshold] = useState(0.55);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/eda")
      .then((response) => {
        if (!response.ok) throw new Error(`Backend returned ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (alive) setBackendData(data);
      })
      .catch((error) => {
        if (alive) setBackendError(error.message || "Backend EDA summary is unavailable.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const modules = useMemo(
    () => unique(rows.map((row) => text(normalizeRow(row).code_module)).filter(Boolean)),
    [rows]
  );
  const prepared = useMemo(
    () => prepareRows(rows, { checkpoint, threshold: riskThreshold, moduleFilter }),
    [rows, checkpoint, riskThreshold, moduleFilter]
  );
  const schema = useMemo(() => inspectSchema(rows, checkpoint), [rows, checkpoint]);
  const analytics = useMemo(() => buildAnalytics(prepared), [prepared]);
  const activeStep = !rows.length ? 1 : !hasRun ? 2 : 4;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    setParseError("");
    setHasRun(false);
    if (!file) return;
    setFileName(file.name);

    try {
      const importedRows = await parseImportedDataset(file);
      if (!importedRows.length) throw new Error("The selected file is empty or has no valid rows.");
      setRows(importedRows);
    } catch (error) {
      setRows([]);
      setParseError(error.message || "Could not parse the selected data file.");
    }
  };

  const runAnalysis = () => {
    if (!rows.length) {
      setParseError("Upload CSV, Excel, or JSON data before running the intelligence dashboard.");
      return;
    }
    setHasRun(true);
  };

  const resetWorkflow = () => {
    setRows([]);
    setFileName("");
    setParseError("");
    setHasRun(false);
    setModuleFilter("all");
  };

  return (
    <div className="fade-in">
      <style>{responsiveStyles}</style>
      <IntroHeader fileName={fileName} hasData={rows.length > 0} />
      <WorkflowSteps activeStep={activeStep} />

      <div style={ui.panel}>
        <div className="eda-top-grid" style={ui.topGrid}>
          <section style={ui.uploadBox}>
            <span style={ui.pill}>
              <Upload size={15} />
              Unified data workflow
            </span>
            <h3 style={{ ...ui.cardTitle, marginTop: 14 }}>Load the academic dataset</h3>
            <p style={ui.note}>
              Supports feature-ready, prediction-output, and OULAD-style engineered CSV, Excel, or JSON files.
              The dashboard detects assessment, VLE, delay, target, and prediction columns,
              then turns them into explainable risk intelligence.
            </p>
            <div style={{ marginTop: 16 }}>
              <input style={ui.fileInput} type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFile} />
            </div>
            {parseError && <p style={{ color: "#fecaca", fontSize: 13, marginTop: 10 }}>{parseError}</p>}
          </section>

          <section style={ui.card}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h3 style={ui.cardTitle}>Control desk</h3>
                <p style={ui.cardSub}>
                  Choose the early-warning checkpoint, filter a module, and decide how strict
                  the at-risk threshold should be before generating the dashboard.
                </p>
              </div>
              <span style={{ ...ui.pill, ...(rows.length ? ui.successPill : {}) }}>
                <Database size={14} />
                {rows.length ? `${fmt(rows.length)} rows` : "No file"}
              </span>
            </div>

            <div className="eda-control-grid" style={ui.controlGrid}>
              <Control label="Checkpoint">
                <select
                  style={ui.input}
                  value={checkpoint}
                  onChange={(event) => {
                    setCheckpoint(event.target.value);
                    setHasRun(false);
                  }}
                >
                  <option value="25">25% early warning</option>
                  <option value="50">50% early warning</option>
                </select>
              </Control>
              <Control label="Module filter">
                <select
                  style={ui.input}
                  value={moduleFilter}
                  onChange={(event) => setModuleFilter(event.target.value)}
                  disabled={!modules.length}
                >
                  <option value="all">All modules</option>
                  {modules.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </Control>
              <Control label="Risk threshold">
                <input
                  style={ui.input}
                  type="number"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={riskThreshold}
                  onChange={(event) => {
                    setRiskThreshold(Number(event.target.value));
                    setHasRun(false);
                  }}
                />
              </Control>
              <Control label="Detected readiness">
                <div style={{ ...ui.input, color: "#f8fafc", fontWeight: 900 }}>{schema.readiness}% coverage</div>
              </Control>
            </div>

            <div className="eda-toolbar-grid" style={ui.toolbarGrid}>
              <button type="button" style={ui.button} onClick={runAnalysis}>
                <Play size={16} fill="currentColor" />
                Run intelligence
              </button>
              <button type="button" style={ui.ghostButton} onClick={resetWorkflow}>
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </section>
        </div>

        {!rows.length && <LandingPreview backendData={backendData} backendError={backendError} />}
        {rows.length > 0 && !hasRun && <SchemaPreview schema={schema} fileName={fileName} checkpoint={checkpoint} />}
        {rows.length > 0 && hasRun && (
          <ResultsDashboard
            analytics={analytics}
            prepared={prepared}
            schema={schema}
            checkpoint={checkpoint}
            threshold={riskThreshold}
          />
        )}
      </div>
    </div>
  );
}

function IntroHeader({ fileName, hasData }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <span style={styles.eyebrow}>Dataset Intelligence</span>
      <h2 style={styles.stepTitle}>Risk analytics that look designed, not dumped</h2>
      <p style={styles.stepDesc}>
        {hasData
          ? `Active dataset: ${fileName}. The lab is ready to score, explain, and prioritize intervention signals.`
          : "A merged EDA and prediction dashboard for feature readiness, risk distribution, behavior gaps, module pressure, and student-level priorities."}
      </p>
    </div>
  );
}

function WorkflowSteps({ activeStep }) {
  const steps = [
    ["01", "Upload", "Load feature-ready, prediction-output, or engineered academic data."],
    ["02", "Audit", "Check model features and compatible source columns."],
    ["03", "Score", "Use model outputs or transparent risk preview logic."],
    ["04", "Act", "Read charts, hotspots, and intervention priorities."],
  ];

  return (
    <div className="eda-steps" style={ui.steps}>
      {steps.map(([number, title, body], index) => (
        <div key={title} style={{ ...ui.step, ...(index + 1 <= activeStep ? ui.stepActive : {}) }}>
          <span style={ui.pill}>{number}</span>
          <h3 style={{ ...ui.cardTitle, fontSize: 15, marginTop: 10 }}>{title}</h3>
          <p style={{ ...ui.cardSub, fontSize: 12 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

function Control({ label, children }) {
  return (
    <label>
      <span style={ui.label}>{label}</span>
      {children}
    </label>
  );
}

function LandingPreview({ backendData, backendError }) {
  return (
    <section style={ui.card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h3 style={ui.cardTitle}>Before upload: live system snapshot</h3>
          <p style={ui.cardSub}>
            If the backend is running, this panel shows a quick EDA summary. Uploading a dataset
            unlocks the richer frontend intelligence view.
          </p>
        </div>
        <span style={ui.pill}>
          <WandSparkles size={14} />
          Creative merge
        </span>
      </div>

      {backendData ? (
        <div className="eda-metric-grid" style={ui.metricGrid}>
          <Metric label="Backend rows" value={fmt(backendData.total_rows)} hint="raw EDA endpoint" />
          <Metric label="Students" value={fmt(backendData.unique_students)} hint="unique learners" />
          <Metric label="Modules" value={fmt(backendData.modules)} hint="course modules" />
          <Metric label="Pass rate" value={`${backendPassRate(backendData)}%`} hint="pass + distinction" />
        </div>
      ) : (
        <div style={{ ...ui.compactCard, marginTop: 16 }}>
          <p style={ui.note}>
            {backendError || "Waiting for backend EDA summary. You can still upload CSV, Excel, or JSON data and use the full frontend lab."}
          </p>
        </div>
      )}

      <div className="eda-chart-grid" style={{ ...ui.chartGrid, marginTop: 16 }}>
        <CapabilityCard icon={FileUp} title="Feature readiness">
          Audits required 25% and 50% model columns before scoring.
        </CapabilityCard>
        <CapabilityCard icon={Gauge} title="Prediction preview">
          Uses existing risk columns or transparent scoring logic until backend prediction is wired.
        </CapabilityCard>
        <CapabilityCard icon={Layers3} title="Multi-source EDA">
          Merges the useful ideas from module risk, activity mix, heatmaps, delay impact, and scatter views.
        </CapabilityCard>
        <CapabilityCard icon={ShieldAlert} title="Intervention queue">
          Ranks students by weak scores, low activity, late submissions, and risk probability.
        </CapabilityCard>
      </div>
    </section>
  );
}

function CapabilityCard({ icon: Icon, title, children }) {
  return (
    <div style={ui.compactCard}>
      <span style={ui.pill}>
        <Icon size={14} />
        {title}
      </span>
      <p style={ui.cardSub}>{children}</p>
    </div>
  );
}

function SchemaPreview({ schema, fileName, checkpoint }) {
  return (
    <section style={ui.card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          <h3 style={ui.cardTitle}>Dataset readiness check</h3>
          <p style={ui.cardSub}>Review what the interface detected before running the intelligence dashboard.</p>
        </div>
        <span style={{ ...ui.pill, ...ui.successPill }}>{fileName}</span>
      </div>

      <div className="eda-metric-grid" style={ui.metricGrid}>
        <Metric label="Rows" value={fmt(schema.totalRows)} hint="loaded records" />
        <Metric label="Columns" value={fmt(schema.totalColumns)} hint="detected fields" />
        <Metric label="Readiness" value={`${schema.readiness}%`} hint="model feature coverage" />
        <Metric label="Checkpoint" value={`${checkpoint}%`} hint="selected model view" />
      </div>

      <div className="eda-chart-grid" style={ui.chartGrid}>
        <section style={ui.compactCard}>
          <h3 style={{ ...ui.cardTitle, fontSize: 15 }}>Detected columns</h3>
          <p style={ui.cardSub}>
            {schema.available.slice(0, 34).join(", ")}
            {schema.available.length > 34 ? ", ..." : ""}
          </p>
        </section>
        <section style={ui.compactCard}>
          <h3 style={{ ...ui.cardTitle, fontSize: 15 }}>Missing model features</h3>
          <p style={ui.cardSub}>
            {schema.missing.length ? schema.missing.join(", ") : "No required model features are missing for this checkpoint."}
          </p>
        </section>
      </div>
    </section>
  );
}

function ResultsDashboard({ analytics, prepared, schema, checkpoint, threshold }) {
  const temporalStory = buildTemporalStory(prepared, checkpoint);
  return (
    <>
      <div className="eda-metric-grid" style={ui.metricGrid}>
        <Metric label="Analyzed rows" value={fmt(analytics.totalRows)} hint="after filters" />
        <Metric label="At-risk" value={`${analytics.atRiskRate}%`} hint={`threshold ${Math.round(threshold * 100)}%`} />
        <Metric label="Average risk" value={`${analytics.avgRisk}%`} hint="probability signal" />
        <Metric label="Average score" value={num(analytics.avgScore, 1)} hint="assessment performance" />
      </div>

      <section style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span style={ui.pill}>Temporal Intelligence</span>
            <h3 style={{ ...ui.cardTitle, fontSize: 22, marginTop: 12 }}>Date-linked model story</h3>
            <p style={ui.cardSub}>
              These Intelligence Lab visuals connect date/course-day signals with score, engagement,
              submissions, delay pressure, and predicted risk after filtering the uploaded dataset.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={ui.pill}>{temporalStory.timeline.length} timeline points</span>
            <span style={ui.pill}>{temporalStory.pressure.length} pressure signals</span>
          </div>
        </div>
        <div className="eda-chart-grid" style={ui.chartGrid}>
          <ChartCard title="Date-linked Feature Trajectory" subtitle="Score, engagement, submissions, and risk aligned to detected date/course-day signals.">
            <DateFeatureTimeline data={temporalStory.timeline} checkpoint={temporalStory.checkpoint} />
          </ChartCard>
          <ChartCard title="Checkpoint Feature Pressure" subtitle="Feature intensity around the selected early-warning checkpoint.">
            <FeaturePressureBoard items={temporalStory.pressure} />
          </ChartCard>
        </div>
      </section>

      <div className="eda-chart-grid" style={ui.chartGrid}>
        <ChartCard title="Risk distribution" subtitle="Student count by predicted risk tier.">
          <RiskDonut data={analytics.riskTiers} />
        </ChartCard>
        <ChartCard title="Risk by module" subtitle="At-risk concentration across course modules.">
          <StackedRiskBars data={analytics.moduleRisk} />
        </ChartCard>
        <ChartCard title="Score and engagement map" subtitle="Each point compares assessment performance with learning activity.">
          <ScatterPlot data={analytics.scatter} />
        </ChartCard>
        <ChartCard title="Submission delay impact" subtitle="Average score across early, on-time, and late submissions.">
          <DelayImpact data={analytics.delayImpact} />
        </ChartCard>
        <ChartCard title="Learning behavior heatmap" subtitle="Average VLE activity by risk group." wide>
          <ActivityHeatmap data={analytics.activityHeatmap} />
        </ChartCard>
        <ChartCard title="Risk signal strength" subtitle="Largest feature gaps between at-risk and lower-risk students." wide>
          <FeatureGapChart data={analytics.featureGaps} />
        </ChartCard>
        <ChartCard title="Activity mix" subtitle="Total interaction share across VLE activity types.">
          <ActivityDonut data={analytics.activityMix} />
        </ChartCard>
        <ChartCard title="Risk probability histogram" subtitle="Distribution of risk probabilities.">
          <Histogram data={analytics.riskHistogram} />
        </ChartCard>
        <ChartCard title="Recommended intervention cards" subtitle="Actions generated from the strongest risk signals." wide>
          <InterventionCards interventions={analytics.interventions} />
        </ChartCard>
        <ChartCard title="Highest priority students" subtitle="Rows ranked by risk probability and behavior signals." wide>
          <StudentsTable rows={analytics.topStudents} />
        </ChartCard>
        <ChartCard title="Model feature coverage" subtitle="Checkpoint feature readiness for the uploaded dataset." wide>
          <CoverageBar readiness={schema.readiness} checkpoint={checkpoint} missing={schema.missing} />
        </ChartCard>
      </div>
    </>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div style={ui.metric}>
      <div style={ui.metricLabel}>{label}</div>
      <div style={ui.metricValue}>{value}</div>
      {hint && <div style={ui.metricHint}>{hint}</div>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, wide }) {
  return (
    <section style={{ ...ui.card, ...(wide ? ui.wide : {}) }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={ui.cardTitle}>{title}</h3>
        {subtitle && <p style={ui.cardSub}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function DateFeatureTimeline({ data, checkpoint }) {
  if (!data.length) return <EmptyChart message="No compatible date or feature values were detected." />;
  const width = 520;
  const height = 260;
  const pad = 38;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const series = [
    { key: "score", label: "Score", color: "#5eead4" },
    { key: "engagement", label: "Engagement", color: "#38bdf8" },
    { key: "submissions", label: "Submissions", color: "#facc15" },
    { key: "risk", label: "Risk", color: "#fb7185" },
  ];
  const xFor = (index) => pad + (index / Math.max(1, data.length - 1)) * innerW;
  const yFor = (value) => pad + (1 - clamp(value, 0, 100) / 100) * innerH;
  const checkpointX = pad + (clamp(checkpoint.percent, 0, 100) / 100) * innerW;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id="edaTimelineGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#5eead4" stopOpacity=".24" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity=".12" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity=".16" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="22" fill="rgba(2,6,23,.32)" />
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = yFor(tick);
          return <line key={tick} x1={pad} y1={y} x2={width - pad} y2={y} stroke="rgba(148,163,184,.14)" />;
        })}
        <rect x={pad} y={pad} width={innerW} height={innerH} fill="url(#edaTimelineGlow)" opacity=".58" />
        <line x1={checkpointX} y1={pad - 9} x2={checkpointX} y2={height - pad + 9} stroke="#facc15" strokeDasharray="5 6" strokeWidth="2.5" />
        <text x={checkpointX} y={pad - 14} textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="900">
          {checkpoint.label}
        </text>
        {series.map((item) => {
          const points = data.map((point, index) => `${xFor(index)},${yFor(point[item.key])}`).join(" ");
          return (
            <g key={item.key}>
              <polyline points={points} fill="none" stroke={item.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {data.map((point, index) => (
                <circle key={`${item.key}-${point.label}-${index}`} cx={xFor(index)} cy={yFor(point[item.key])} r="4" fill={item.color} stroke="#07111f" strokeWidth="2.5" />
              ))}
            </g>
          );
        })}
        {data.map((point, index) => (
          <text key={point.label} x={xFor(index)} y={height - 12} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {point.label}
          </text>
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        {series.map((item) => (
          <span key={item.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#cbd5e1", fontSize: 13, fontWeight: 850 }}>
            <span style={{ width: 11, height: 11, borderRadius: 999, background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturePressureBoard({ items }) {
  if (!items.length) return <EmptyChart message="No feature pressure values were available." />;
  return (
    <div style={{ display: "grid", gap: 13 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13, marginBottom: 7 }}>
            <strong>{item.label}</strong>
            <span>{Math.round(item.value)}%</span>
          </div>
          <div style={{ height: 19, borderRadius: 999, background: "rgba(2,6,23,.72)", overflow: "hidden", border: "1px solid rgba(148,163,184,.12)" }}>
            <div
              style={{
                width: `${clamp(item.value, 0, 100)}%`,
                height: "100%",
                borderRadius: 999,
                background: item.tone === "risk" ? "linear-gradient(90deg,#fb7185,#f97316)" : "linear-gradient(90deg,#38bdf8,#5eead4)",
              }}
            />
          </div>
          <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

function RiskDonut({ data }) {
  if (!data.length) return <EmptyChart message="No risk data available." />;
  const total = Math.max(1, data.reduce((sumValue, item) => sumValue + item.count, 0));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
      <svg viewBox="0 0 160 160" style={{ width: 170, height: 170 }}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(30,41,59,.9)" strokeWidth="22" />
        {data.map((item, index) => {
          const previous = data.slice(0, index).reduce((sumValue, entry) => sumValue + (entry.count / total) * circumference, 0);
          const offset = 25 + previous;
          const dash = (item.count / total) * circumference;
          const circle = (
            <circle
              key={item.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="22"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          );
          return circle;
        })}
        <text x="80" y="78" textAnchor="middle" fill="#f8fafc" fontSize="22" fontWeight="900">
          {fmt(total)}
        </text>
        <text x="80" y="98" textAnchor="middle" fill="#94a3b8" fontSize="11">
          rows
        </text>
      </svg>
      <div style={{ display: "grid", gap: 9 }}>
        {data.map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13 }}>
            <span>
              <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, background: item.color, marginRight: 8 }} />
              {item.label}
            </span>
            <strong>{fmt(item.count)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedRiskBars({ data }) {
  if (!data.length) return <EmptyChart message="Module or target columns are required for this view." />;
  const max = Math.max(...data.map((item) => item.total), 1);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {data.slice(0, 9).map((item) => {
        const riskWidth = item.total ? (item.atRisk / item.total) * 100 : 0;
        const safeWidth = 100 - riskWidth;
        return (
          <div key={item.module}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13, marginBottom: 6 }}>
              <strong>{item.module}</strong>
              <span>{item.riskRate}% risk | {fmt(item.total)} rows</span>
            </div>
            <div style={{ height: 16, borderRadius: 999, background: "rgba(30,41,59,.88)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.max(3, (item.total / max) * 100)}%`, display: "flex" }}>
                <div style={{ width: `${riskWidth}%`, background: "linear-gradient(90deg,#ef4444,#f97316)" }} />
                <div style={{ width: `${safeWidth}%`, background: "linear-gradient(90deg,#14b8a6,#22c55e)" }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScatterPlot({ data }) {
  if (!data.length) return <EmptyChart message="Score and engagement columns are required for this chart." />;
  const width = 520;
  const height = 260;
  const pad = 34;
  const maxX = Math.max(...data.map((point) => point.activity), 1);
  const maxY = Math.max(...data.map((point) => point.score), 100);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", display: "block" }}>
      <rect x="0" y="0" width={width} height={height} rx="18" fill="rgba(2,6,23,.25)" />
      {[0, 1, 2, 3, 4].map((index) => {
        const y = pad + index * ((height - pad * 2) / 4);
        return <line key={index} x1={pad} y1={y} x2={width - pad} y2={y} stroke="rgba(148,163,184,.12)" />;
      })}
      {data.slice(0, 700).map((point, index) => {
        const x = pad + (point.activity / maxX) * (width - pad * 2);
        const y = height - pad - (point.score / maxY) * (height - pad * 2);
        return (
          <circle
            key={`${point.id}-${index}`}
            cx={x}
            cy={y}
            r={point.atRisk ? 4.8 : 3.5}
            fill={point.atRisk ? "#fb7185" : "#5eead4"}
            opacity={point.atRisk ? .82 : .58}
          />
        );
      })}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(148,163,184,.34)" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="rgba(148,163,184,.34)" />
      <text x={width / 2} y={height - 8} fill="#94a3b8" fontSize="11" textAnchor="middle">Learning activity</text>
      <text x="12" y={height / 2} fill="#94a3b8" fontSize="11" transform={`rotate(-90 12 ${height / 2})`} textAnchor="middle">Score</text>
    </svg>
  );
}

function DelayImpact({ data }) {
  if (!data.length) return <EmptyChart message="Submission delay and score columns are required." />;
  const max = Math.max(...data.map((item) => item.avgScore), 1);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {data.map((item) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13, marginBottom: 6 }}>
            <strong>{item.label}</strong>
            <span>{num(item.avgScore, 1)} avg score | {fmt(item.count)} rows</span>
          </div>
          <div style={{ height: 24, background: "rgba(30,41,59,.88)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${(item.avgScore / max) * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: item.label === "Late" ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#0ea5e9,#22c55e)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityHeatmap({ data }) {
  if (!data.length) return <EmptyChart message="Activity columns are required for the heatmap." />;
  const max = Math.max(...data.flatMap((row) => row.values.map((item) => item.value)), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={ui.table}>
        <thead>
          <tr>
            <th style={ui.th}>Group</th>
            {data[0].values.map((item) => (
              <th key={item.label} style={ui.th}>{item.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.group}>
              <td style={ui.td}><strong>{row.group}</strong></td>
              {row.values.map((item) => {
                const alpha = Math.max(.08, item.value / max);
                return (
                  <td key={item.label} style={{ ...ui.td, background: `rgba(20,184,166,${alpha * .34})` }}>
                    {num(item.value, 1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureGapChart({ data }) {
  if (!data.length) return <EmptyChart message="No comparable numeric feature gaps were detected." />;
  const shown = data.slice(0, 9);
  const max = Math.max(...shown.map((item) => Math.abs(item.delta)), 1);
  return (
    <div style={{ display: "grid", gap: 11 }}>
      {shown.map((item) => (
        <div key={item.label} style={{ display: "grid", gridTemplateColumns: "220px 1fr 90px", gap: 12, alignItems: "center" }}>
          <div style={{ color: "#cbd5e1", fontSize: 13 }}>{item.label}</div>
          <div style={{ height: 14, borderRadius: 999, background: "rgba(30,41,59,.88)", overflow: "hidden" }}>
            <div
              style={{
                width: `${(Math.abs(item.delta) / max) * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: item.delta < 0 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#14b8a6,#facc15)",
              }}
            />
          </div>
          <strong style={{ color: item.delta < 0 ? "#fb923c" : "#5eead4", fontSize: 13 }}>{num(item.delta, 2)}</strong>
        </div>
      ))}
    </div>
  );
}

function ActivityDonut({ data }) {
  if (!data.length) return <EmptyChart message="No VLE activity columns detected." />;
  const total = data.reduce((sumValue, item) => sumValue + item.value, 0) || 1;
  const palette = ["#5eead4", "#facc15", "#fb7185", "#60a5fa", "#a78bfa", "#f97316", "#22c55e", "#eab308"];
  return (
    <div style={{ display: "grid", gap: 9 }}>
      {data.slice(0, 8).map((item, index) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13, marginBottom: 6 }}>
            <span>{item.label}</span>
            <strong>{Math.round((item.value / total) * 100)}%</strong>
          </div>
          <div style={{ height: 12, borderRadius: 999, overflow: "hidden", background: "rgba(30,41,59,.88)" }}>
            <div style={{ width: `${(item.value / total) * 100}%`, height: "100%", borderRadius: 999, background: palette[index % palette.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Histogram({ data }) {
  if (!data.length) return <EmptyChart message="No risk probabilities available." />;
  const max = Math.max(...data.map((item) => item.count), 1);
  const width = 520;
  const height = 220;
  const barWidth = Math.max(16, Math.floor((width - 44) / data.length) - 6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", display: "block" }}>
      {data.map((bin, index) => {
        const barHeight = Math.max(4, (bin.count / max) * 154);
        const x = 24 + index * (barWidth + 6);
        const y = 174 - barHeight;
        const hot = bin.from >= 0.6;
        return (
          <g key={bin.label}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill={hot ? "#fb7185" : "#334155"} />
            <text x={x + barWidth / 2} y="196" textAnchor="middle" fill="#64748b" fontSize="10">{bin.label}</text>
            <text x={x + barWidth / 2} y={Math.max(14, y - 6)} textAnchor="middle" fill="#94a3b8" fontSize="10">{bin.count}</text>
          </g>
        );
      })}
      <line x1="20" y1="174" x2={width - 20} y2="174" stroke="rgba(148,163,184,.20)" />
    </svg>
  );
}

function InterventionCards({ interventions }) {
  if (!interventions.length) return <EmptyChart message="No intervention signals were generated." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {interventions.map((item) => (
        <div key={item.title} style={ui.compactCard}>
          <span style={{ ...ui.pill, ...(item.severity === "High" ? ui.dangerPill : item.severity === "Medium" ? ui.warningPill : ui.successPill) }}>
            <Target size={14} />
            {item.severity}
          </span>
          <h3 style={{ ...ui.cardTitle, fontSize: 16, marginTop: 12 }}>{item.title}</h3>
          <p style={ui.cardSub}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function StudentsTable({ rows }) {
  if (!rows.length) return <EmptyChart message="No student rows available." />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={ui.table}>
        <thead>
          <tr>
            <th style={ui.th}>Student</th>
            <th style={ui.th}>Module</th>
            <th style={ui.th}>Risk tier</th>
            <th style={ui.th}>Risk probability</th>
            <th style={ui.th}>Score</th>
            <th style={ui.th}>Activity</th>
            <th style={ui.th}>Delay</th>
            <th style={ui.th}>Main signal</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 14).map((row, index) => (
            <tr key={`${row.id}-${index}`}>
              <td style={ui.td}>{row.id}</td>
              <td style={ui.td}>{row.module}</td>
              <td style={ui.td}>
                <span style={{ ...ui.pill, ...(row.tier === "High" ? ui.dangerPill : row.tier === "Medium" ? ui.warningPill : ui.successPill) }}>
                  {row.tier}
                </span>
              </td>
              <td style={ui.td}>{Math.round(row.riskProbability * 100)}%</td>
              <td style={ui.td}>{num(row.score, 1)}</td>
              <td style={ui.td}>{num(row.activity, 1)}</td>
              <td style={ui.td}>{num(row.delay, 1)}</td>
              <td style={ui.td}>{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoverageBar({ readiness, checkpoint, missing }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: 13, marginBottom: 8 }}>
        <strong>{checkpoint}% checkpoint feature coverage</strong>
        <span>{readiness}%</span>
      </div>
      <div style={{ height: 18, borderRadius: 999, background: "rgba(51,65,85,.75)", overflow: "hidden" }}>
        <div style={{ width: `${readiness}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#5eead4,#facc15,#fb7185)" }} />
      </div>
      <p style={ui.cardSub}>
        {missing.length ? `Missing features: ${missing.join(", ")}` : "All selected model features are present in the uploaded dataset."}
      </p>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ minHeight: 132, display: "grid", placeItems: "center", border: "1px dashed rgba(148,163,184,.18)", borderRadius: 16, color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 16 }}>
      {message}
    </div>
  );
}

function prepareRows(rows, { checkpoint, threshold, moduleFilter }) {
  return rows
    .map((row, index) => {
      const normalized = normalizeRow(row);
      const probability = resolveRiskProbability(normalized, checkpoint);
      const prediction = resolvePrediction(normalized, probability, threshold);
      const score = firstNumber(normalized, ["avg_score_until_cutoff", "avg_score", "score", "mean_score"]);
      const activity = firstNumber(normalized, [
        "arab_active_days_equivalent_until_cutoff",
        "active_days_until_cutoff",
        "total_active_days",
        "arab_active_days_equivalent",
        "clicks_per_active_day_until_cutoff",
        "total_clicks",
      ]);
      const delay = firstNumber(normalized, [
        "avg_submission_delay_arab_days_until_cutoff",
        "avg_submission_delay_arab_days",
        "avg_submission_delay_until_cutoff",
        "avg_submission_delay",
      ]);

      return {
        ...normalized,
        __rowIndex: index,
        __riskProbability: clamp(probability, 0, 1),
        __riskPrediction: prediction,
        __riskTier: riskTier(probability),
        __isAtRisk: prediction === "At Risk",
        __score: score,
        __activity: activity,
        __delay: delay,
        __reason: mainSignal(normalized),
      };
    })
    .filter((row) => moduleFilter === "all" || text(row.code_module) === moduleFilter);
}

function buildAnalytics(rows) {
  const totalRows = rows.length;
  const atRiskRows = rows.filter((row) => row.__isAtRisk);
  const lowerRiskRows = rows.filter((row) => !row.__isAtRisk);
  const atRiskRate = totalRows ? Math.round((atRiskRows.length / totalRows) * 100) : 0;
  const avgRisk = Math.round(mean(rows.map((row) => row.__riskProbability)) * 100) || 0;
  const avgScore = mean(rows.map((row) => row.__score));

  return {
    totalRows,
    atRiskRate,
    avgRisk,
    avgScore,
    riskTiers: buildRiskTiers(rows),
    moduleRisk: buildModuleRisk(rows),
    featureGaps: buildFeatureGaps(atRiskRows, lowerRiskRows),
    activityMix: buildActivityMix(rows),
    scatter: rows
      .map((row) => ({
        id: text(row.id_student) || `Row ${row.__rowIndex + 1}`,
        score: safeNumber(row.__score),
        activity: safeNumber(row.__activity),
        atRisk: row.__isAtRisk,
      }))
      .filter((point) => point.score || point.activity),
    delayImpact: buildDelayImpact(rows),
    activityHeatmap: buildActivityHeatmap(atRiskRows, lowerRiskRows),
    riskHistogram: buildRiskHistogram(rows),
    interventions: buildInterventions(atRiskRows, rows),
    topStudents: rows
      .slice()
      .sort((a, b) => b.__riskProbability - a.__riskProbability || interventionPriority(b) - interventionPriority(a))
      .map((row) => ({
        id: text(row.id_student) || `Row ${row.__rowIndex + 1}`,
        module: text(row.code_module) || "Unknown",
        tier: row.__riskTier,
        riskProbability: row.__riskProbability,
        score: row.__score,
        activity: row.__activity,
        delay: row.__delay,
        reason: row.__reason,
      })),
  };
}

function buildTemporalStory(rows, checkpoint) {
  const checkpointPercent = Number(checkpoint);
  const timeKey = findTemporalKey(rows);
  const timeline = timeKey ? buildDetectedTimeline(rows, timeKey) : buildSyntheticTimeline(rows, checkpointPercent);
  const pressure = buildTemporalPressure(rows);
  return {
    checkpoint: { percent: checkpointPercent, label: `${checkpointPercent}% checkpoint` },
    timeline,
    pressure,
  };
}

function buildDetectedTimeline(rows, timeKey) {
  const raw = rows
    .map((row, index) => ({
      order: parseTemporalOrder(row[timeKey], index),
      label: formatTemporalLabel(row[timeKey], index),
      score: safeNumber(row.__score),
      engagement: safeNumber(row.__activity),
      submissions: chartFirstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]),
      risk: safeNumber(row.__riskProbability) * 100,
    }))
    .sort((a, b) => a.order - b.order);

  const grouped = compressTemporalPoints(raw, 7);
  const maxEngagement = Math.max(...grouped.map((point) => point.engagement), 1);
  const maxSubmissions = Math.max(...grouped.map((point) => point.submissions), 1);

  return grouped.map((point) => ({
    label: point.label,
    score: clamp(point.score, 0, 100),
    engagement: clamp((point.engagement / maxEngagement) * 100, 0, 100),
    submissions: clamp((point.submissions / maxSubmissions) * 100, 0, 100),
    risk: clamp(point.risk, 0, 100),
  }));
}

function buildSyntheticTimeline(rows, checkpointPercent) {
  const checkpointDay = checkpointPercent === 25 ? 60 : 120;
  const score = clamp(mean(rows.map((row) => row.__score)) || 62, 0, 100);
  const activeDays = mean(rows.map((row) => row.__activity)) || checkpointDay * 0.24;
  const submissions = mean(rows.map((row) => chartFirstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]))) || 1;
  const delay = mean(rows.map((row) => row.__delay)) || 0;
  const risk = clamp((mean(rows.map((row) => row.__riskProbability)) || 0.35) * 100, 0, 100);
  const engagement = clamp((activeDays / Math.max(20, checkpointDay * 0.34)) * 82, 0, 100);
  const submissionSignal = clamp((submissions / 5) * 100, 0, 100);
  const delayPenalty = clamp(delay * 4, 0, 28);

  return [
    { label: "Day 1", score: Math.max(34, score - 18), engagement: Math.max(18, engagement - 28), submissions: 0, risk: clamp(risk + 12, 0, 100) },
    { label: `Day ${Math.round(checkpointDay * 0.45)}`, score: Math.max(38, score - 10), engagement: Math.max(22, engagement - 13), submissions: Math.max(8, submissionSignal * 0.35), risk: clamp(risk + 5, 0, 100) },
    { label: `Day ${checkpointDay}`, score, engagement, submissions: submissionSignal, risk },
    { label: `Day ${checkpointDay + Math.max(1, Math.round(Math.max(0, delay)))}`, score: clamp(score - delayPenalty, 0, 100), engagement: clamp(engagement - delayPenalty * 0.7, 0, 100), submissions: submissionSignal, risk: clamp(risk + delayPenalty * 0.55, 0, 100) },
    { label: "Projection", score: clamp(score + (risk < 45 ? 7 : -5), 0, 100), engagement: clamp(engagement + (risk < 45 ? 8 : -6), 0, 100), submissions: clamp(submissionSignal + 12, 0, 100), risk: clamp(risk + (risk < 45 ? -6 : 9), 0, 100) },
  ];
}

function buildTemporalPressure(rows) {
  const score = mean(rows.map((row) => row.__score)) || 60;
  const activity = mean(rows.map((row) => row.__activity)) || 12;
  const clicks = mean(rows.map((row) => chartFirstNumber(row, ["clicks_per_active_day_until_cutoff", "clicks_per_active_day"]))) || 2;
  const submissions = mean(rows.map((row) => chartFirstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]))) || 1;
  const delay = mean(rows.map((row) => row.__delay)) || 0;
  const risk = (mean(rows.map((row) => row.__riskProbability)) || 0.35) * 100;

  return [
    { label: "Assessment weakness", value: clamp(100 - score, 0, 100), tone: "risk", hint: "Higher when the average score feature is below the healthy band." },
    { label: "Engagement drag", value: clamp(72 - activity * 2 + Math.max(0, 5 - clicks) * 6, 0, 100), tone: "risk", hint: "Combines active days and clicks per active day." },
    { label: "Submission readiness", value: clamp((submissions / 5) * 100, 0, 100), tone: "safe", hint: "Shows how much assessment evidence exists at the checkpoint." },
    { label: "Delay pressure", value: clamp(delay * 12, 0, 100), tone: "risk", hint: "Late submissions push the intervention pressure upward." },
    { label: "Predicted risk output", value: clamp(risk, 0, 100), tone: risk >= 50 ? "risk" : "safe", hint: "Average predicted risk for the filtered Intelligence Lab dataset." },
  ];
}

function compressTemporalPoints(points, maxPoints) {
  if (points.length <= maxPoints) return points;
  const size = Math.ceil(points.length / maxPoints);
  const buckets = [];
  for (let index = 0; index < points.length; index += size) {
    const slice = points.slice(index, index + size);
    const middle = slice[Math.floor(slice.length / 2)];
    buckets.push({
      label: middle.label,
      score: mean(slice.map((point) => point.score)),
      engagement: mean(slice.map((point) => point.engagement)),
      submissions: mean(slice.map((point) => point.submissions)),
      risk: mean(slice.map((point) => point.risk)),
      order: middle.order,
    });
  }
  return buckets;
}

function findTemporalKey(rows) {
  const candidates = [
    "date",
    "course_day",
    "day",
    "days_from_start",
    "activity_date",
    "assessment_date",
    "submission_date",
    "date_submitted",
    "date_registration",
  ];
  return candidates.find((key) => rows.some((row) => row[key] !== undefined && row[key] !== ""));
}

function parseTemporalOrder(value, fallback) {
  const numeric = number(value);
  if (Number.isFinite(numeric)) return numeric;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.getTime();
  return fallback;
}

function formatTemporalLabel(value, fallback) {
  const numeric = number(value);
  if (Number.isFinite(numeric)) return `Day ${Math.round(numeric)}`;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `Point ${fallback + 1}`;
}

function chartFirstNumber(row, keys) {
  for (const key of keys) {
    const value = number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function buildRiskTiers(rows) {
  return [
    { label: "High risk", count: rows.filter((row) => row.__riskTier === "High").length, color: "#fb7185" },
    { label: "Medium risk", count: rows.filter((row) => row.__riskTier === "Medium").length, color: "#facc15" },
    { label: "Low risk", count: rows.filter((row) => row.__riskTier === "Low").length, color: "#5eead4" },
  ];
}

function buildModuleRisk(rows) {
  const grouped = groupBy(rows, (row) => text(row.code_module) || "Unknown");
  return Object.entries(grouped)
    .map(([module, items]) => ({
      module,
      total: items.length,
      atRisk: items.filter((row) => row.__isAtRisk).length,
      riskRate: items.length ? Math.round((items.filter((row) => row.__isAtRisk).length / items.length) * 100) : 0,
    }))
    .sort((a, b) => b.riskRate - a.riskRate || b.total - a.total);
}

function buildFeatureGaps(atRiskRows, lowerRiskRows) {
  const features = [
    ["Average score", "__score"],
    ["Active days", "arab_active_days_equivalent_until_cutoff", "active_days_until_cutoff", "total_active_days"],
    ["Submission delay", "__delay", "avg_submission_delay_arab_days_until_cutoff", "avg_submission_delay"],
    ["Submitted assessments", "submitted_assessments_until_cutoff", "submitted_assessments"],
    ["Clicks per active day", "clicks_per_active_day_until_cutoff", "clicks_per_active_day"],
    ["Unique sites", "unique_sites_until_cutoff", "unique_sites"],
    ["Activity types", "unique_activity_types_until_cutoff", "unique_activity_types"],
    ...ACTIVITY_COLUMNS.map((column) => [pretty(column), column]),
  ];

  return features
    .map(([label, ...keys]) => {
      const riskAvg = mean(atRiskRows.map((row) => firstNumber(row, keys)));
      const safeAvg = mean(lowerRiskRows.map((row) => firstNumber(row, keys)));
      const delta = safeAvg ? ((riskAvg - safeAvg) / Math.abs(safeAvg)) * 100 : riskAvg - safeAvg;
      return { label, delta };
    })
    .filter((item) => Number.isFinite(item.delta) && Math.abs(item.delta) > 0.001)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function buildActivityMix(rows) {
  return ACTIVITY_COLUMNS
    .map((column) => ({ label: column, value: sum(rows.map((row) => number(row[column]))) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function buildDelayImpact(rows) {
  const scoreRows = rows.filter((row) => Number.isFinite(row.__score) && Number.isFinite(row.__delay));
  return [
    { label: "Early", test: (value) => value < 0 },
    { label: "On time", test: (value) => value === 0 },
    { label: "Late", test: (value) => value > 0 },
  ]
    .map((bucket) => {
      const items = scoreRows.filter((row) => bucket.test(row.__delay));
      return { label: bucket.label, count: items.length, avgScore: mean(items.map((row) => row.__score)) };
    })
    .filter((item) => item.count > 0);
}

function buildActivityHeatmap(atRiskRows, lowerRiskRows) {
  const columns = ACTIVITY_COLUMNS
    .filter((column) => atRiskRows.concat(lowerRiskRows).some((row) => Number.isFinite(number(row[column]))))
    .slice(0, 7);
  if (!columns.length) return [];
  return [
    { group: "At risk", rows: atRiskRows },
    { group: "Lower risk", rows: lowerRiskRows },
  ].map((group) => ({
    group: group.group,
    values: columns.map((column) => ({ label: column, value: mean(group.rows.map((row) => number(row[column]))) })),
  }));
}

function buildRiskHistogram(rows) {
  const bins = Array.from({ length: 10 }, (_, index) => ({
    from: index / 10,
    label: `${index * 10}-${(index + 1) * 10}`,
    count: 0,
  }));
  rows.forEach((row) => {
    const index = Math.min(9, Math.floor(row.__riskProbability * 10));
    bins[index].count += 1;
  });
  return bins;
}

function buildInterventions(atRiskRows, rows) {
  const interventions = [];
  const lowScoreCount = atRiskRows.filter((row) => safeNumber(row.__score) > 0 && safeNumber(row.__score) < 55).length;
  const lowActivityCutoff = percentile(rows.map((row) => row.__activity), 35);
  const lowActivityCount = atRiskRows.filter((row) => safeNumber(row.__activity) <= lowActivityCutoff).length;
  const lateCount = atRiskRows.filter((row) => safeNumber(row.__delay) > 3).length;
  const noSubmissionCount = atRiskRows.filter((row) => firstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]) <= 1).length;

  if (lowScoreCount) {
    interventions.push({
      severity: "High",
      title: "Academic recovery sprint",
      body: `${fmt(lowScoreCount)} at-risk students show weak scores. Prioritize targeted practice, review sessions, and instructor follow-up.`,
    });
  }
  if (lowActivityCount) {
    interventions.push({
      severity: "High",
      title: "Engagement reactivation",
      body: `${fmt(lowActivityCount)} at-risk students sit in the lowest engagement band. Send structured nudges and short weekly tasks.`,
    });
  }
  if (lateCount) {
    interventions.push({
      severity: "Medium",
      title: "Deadline coaching",
      body: `${fmt(lateCount)} at-risk students show delayed submissions. Use checkpoint reminders and advisor accountability.`,
    });
  }
  if (noSubmissionCount) {
    interventions.push({
      severity: "Medium",
      title: "Assessment completion push",
      body: `${fmt(noSubmissionCount)} at-risk students submitted very few assessments. Trigger outreach before the next graded item.`,
    });
  }
  if (!interventions.length) {
    interventions.push({
      severity: "Low",
      title: "Monitor combined signals",
      body: "No dominant intervention trigger was detected. Keep watching risk probability, activity level, and assessment performance.",
    });
  }
  return interventions.slice(0, 6);
}

function inspectSchema(rows, checkpoint) {
  const columns = Object.keys(rows[0] || {});
  const normalized = columns.map((column) => normalizeKey(column));
  const modelFeatures = MODEL_FEATURES[checkpoint] || MODEL_FEATURES[50];
  const missing = modelFeatures.filter((feature) => !normalized.includes(normalizeKey(feature)));
  const readiness = modelFeatures.length ? Math.round(((modelFeatures.length - missing.length) / modelFeatures.length) * 100) : 0;

  return {
    totalRows: rows.length,
    totalColumns: columns.length,
    available: columns,
    missing,
    readiness,
  };
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

function resolveRiskProbability(row, checkpoint) {
  const existingProbability = firstNumber(row, ["risk_probability", "risk_score", "probability", "at_risk_probability"]);
  if (existingProbability > 1) return existingProbability / 100;
  if (existingProbability > 0) return existingProbability;

  const predictionText = text(row.risk_prediction || row.prediction || row.target || row.final_result).toLowerCase();
  if (["at_risk", "fail", "withdrawn", "high risk", "risk", "1"].includes(predictionText)) return 0.82;
  if (["successful", "pass", "distinction", "low risk", "safe", "0"].includes(predictionText)) return 0.22;

  const score = firstNumber(row, ["avg_score_until_cutoff", "avg_score", "score", "mean_score"]);
  const activeDays = firstNumber(row, ["arab_active_days_equivalent_until_cutoff", "active_days_until_cutoff", "total_active_days"]);
  const submissions = firstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]);
  const delay = firstNumber(row, ["avg_submission_delay_arab_days_until_cutoff", "avg_submission_delay"]);
  const uniqueSites = firstNumber(row, ["unique_sites_until_cutoff", "unique_sites"]);
  const clicksPerDay = firstNumber(row, ["clicks_per_active_day_until_cutoff", "clicks_per_active_day"]);

  let risk = 0.35;
  if (score > 0) risk += score < 50 ? 0.28 : score < 65 ? 0.16 : score > 80 ? -0.12 : 0;
  else risk += 0.12;
  risk += activeDays < (checkpoint === "25" ? 8 : 16) ? 0.18 : activeDays > (checkpoint === "25" ? 20 : 35) ? -0.08 : 0;
  risk += submissions <= 1 ? 0.15 : submissions >= 4 ? -0.07 : 0;
  risk += delay > 5 ? 0.12 : delay < -2 ? -0.05 : 0;
  risk += uniqueSites < 5 ? 0.07 : uniqueSites > 15 ? -0.05 : 0;
  risk += clicksPerDay < 2 ? 0.05 : clicksPerDay > 8 ? -0.04 : 0;

  return clamp(risk, 0.03, 0.97);
}

function resolvePrediction(row, probability, threshold) {
  const predictionText = text(row.risk_prediction || row.prediction || row.target || row.final_result).toLowerCase();
  if (["at_risk", "fail", "withdrawn", "high risk", "risk", "1"].includes(predictionText)) return "At Risk";
  if (["successful", "pass", "distinction", "low risk", "safe", "0"].includes(predictionText)) return "Lower Risk";
  return probability >= threshold ? "At Risk" : "Lower Risk";
}

function riskTier(probability) {
  if (probability >= 0.7) return "High";
  if (probability >= 0.45) return "Medium";
  return "Low";
}

function mainSignal(row) {
  const score = firstNumber(row, ["avg_score_until_cutoff", "avg_score", "score"]);
  const activeDays = firstNumber(row, ["arab_active_days_equivalent_until_cutoff", "active_days_until_cutoff", "total_active_days"]);
  const submissions = firstNumber(row, ["submitted_assessments_until_cutoff", "submitted_assessments"]);
  const delay = firstNumber(row, ["avg_submission_delay_arab_days_until_cutoff", "avg_submission_delay"]);

  if (score > 0 && score < 55) return "Weak assessment performance";
  if (activeDays < 12) return "Low learning engagement";
  if (submissions <= 1) return "Limited assessment submissions";
  if (delay > 3) return "Delayed submissions";
  return "Combined academic behavior";
}

function interventionPriority(row) {
  const scoreRisk = row.__score ? Math.max(0, 75 - row.__score) : 18;
  const activityRisk = row.__activity ? Math.max(0, 24 - row.__activity) : 14;
  const delayRisk = Math.max(0, row.__delay || 0) * 2;
  return scoreRisk + activityRisk + delayRisk + row.__riskProbability * 40;
}

function backendPassRate(data) {
  const resultRows = data.final_result || [];
  const pass = resultRows
    .filter((row) => ["Pass", "Distinction"].includes(row.label))
    .reduce((sumValue, row) => sumValue + Number(row.count || 0), 0);
  return data.total_rows ? Math.round((pass / data.total_rows) * 100) : 0;
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
  return 0;
}

function number(value) {
  if (value === null || value === undefined || value === "") return NaN;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function sum(values) {
  return values.reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0);
}

function mean(values) {
  const filtered = values.map(Number).filter(Number.isFinite);
  return filtered.length ? filtered.reduce((acc, value) => acc + value, 0) / filtered.length : 0;
}

function percentile(values, p) {
  const filtered = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!filtered.length) return 0;
  const index = Math.floor((p / 100) * (filtered.length - 1));
  return filtered[index];
}

function normalizeKey(key) {
  return String(key || "").trim().replace(/\s+/g, "_").replace(/-/g, "_").toLowerCase();
}

function pretty(value) {
  return String(value || "").replaceAll("_", " ");
}

function text(value) {
  return String(value ?? "").trim();
}

function unique(items) {
  return [...new Set(items)];
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
