import { useMemo, useState } from "react";
import { styles } from "./styles";

const STEPS = ["Start", "Model", "Data", "Review", "Results"];
const INPUT_METHODS = { manual: "manual", file: "file" };

const initialFormData = {
  selectedModel: "model_25",
  inputMethod: "manual",
  avg_score_until_cutoff: "",
  submitted_assessments_until_cutoff: "",
  arab_active_days_equivalent_until_cutoff: "",
  avg_submission_delay_arab_days_until_cutoff: "",
  homepage: "",
  age_band: "",
  forumng: "",
  unique_sites_until_cutoff: "",
  unique_activity_types_until_cutoff: "",
  clicks_per_active_day_until_cutoff: "",
  resource: "",
  subpage: "",
  url: "",
  oucontent: "",
  quiz: "",
  highest_education: "",
};

const numericFields = [
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
];

const featureGroups = [
  {
    id: "academic",
    label: "Academic Performance",
    hint: "Assessment strength and submission behavior",
    color: "#10b981",
    fields: [
      { name: "avg_score_until_cutoff", label: "Average Score Until Cutoff", placeholder: "76.5" },
      { name: "submitted_assessments_until_cutoff", label: "Submitted Assessments", placeholder: "3" },
      { name: "avg_submission_delay_arab_days_until_cutoff", label: "Avg Submission Delay", placeholder: "1.25" },
    ],
  },
  {
    id: "engagement",
    label: "Engagement Behavior",
    hint: "How consistently the student interacts with the course",
    color: "#f59e0b",
    fields: [
      { name: "arab_active_days_equivalent_until_cutoff", label: "Active Days Equivalent", placeholder: "22" },
      { name: "clicks_per_active_day_until_cutoff", label: "Clicks Per Active Day", placeholder: "14.7" },
      { name: "unique_sites_until_cutoff", label: "Unique Sites Visited", placeholder: "18" },
      { name: "unique_activity_types_until_cutoff", label: "Unique Activity Types", placeholder: "7" },
    ],
  },
  {
    id: "vle",
    label: "VLE Activity Counts",
    hint: "Detailed click signals across learning resources",
    color: "#14b8a6",
    fields: [
      { name: "homepage", label: "Homepage", placeholder: "80" },
      { name: "forumng", label: "ForumNG", placeholder: "35" },
      { name: "resource", label: "Resource", placeholder: "22" },
      { name: "subpage", label: "Subpage", placeholder: "14" },
      { name: "url", label: "URL", placeholder: "9" },
      { name: "oucontent", label: "OU Content", placeholder: "45" },
      { name: "quiz", label: "Quiz", placeholder: "12" },
    ],
  },
  {
    id: "profile",
    label: "Student Profile",
    hint: "Demographic and education indicators",
    color: "#fb7185",
    fields: [
      { name: "age_band", label: "Age Band", type: "select", options: ["", "0-35", "35-55", "55<="] },
      {
        name: "highest_education",
        label: "Highest Education",
        type: "select",
        options: ["", "No Formal quals", "Lower Than A Level", "A Level or Equivalent", "HE Qualification", "Post Graduate Qualification"],
      },
    ],
  },
];

function buildFeatures(source) {
  return {
    avg_score_until_cutoff: Number(source.avg_score_until_cutoff || 0),
    submitted_assessments_until_cutoff: Number(source.submitted_assessments_until_cutoff || 0),
    arab_active_days_equivalent_until_cutoff: Number(source.arab_active_days_equivalent_until_cutoff || 0),
    avg_submission_delay_arab_days_until_cutoff: Number(source.avg_submission_delay_arab_days_until_cutoff || 0),
    homepage: Number(source.homepage || 0),
    age_band: source.age_band || "0-35",
    forumng: Number(source.forumng || 0),
    unique_sites_until_cutoff: Number(source.unique_sites_until_cutoff || 0),
    unique_activity_types_until_cutoff: Number(source.unique_activity_types_until_cutoff || 0),
    clicks_per_active_day_until_cutoff: Number(source.clicks_per_active_day_until_cutoff || 0),
    resource: Number(source.resource || 0),
    subpage: Number(source.subpage || 0),
    url: Number(source.url || 0),
    oucontent: Number(source.oucontent || 0),
    quiz: Number(source.quiz || 0),
    highest_education: source.highest_education || "HE Qualification",
    imd_band: source.imd_band || "Unknown",
  };
}

export default function PredictWizard() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [dragOver, setDragOver] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [uploadedRows, setUploadedRows] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const filledCount = useMemo(
    () => Object.entries(formData).filter(([key, value]) => !["selectedModel", "inputMethod"].includes(key) && value !== "").length,
    [formData]
  );
  const totalFeatures = 16;
  const progressPercent = Math.round((filledCount / totalFeatures) * 100);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseCsvText = (text) => {
    const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const parseLine = (line) =>
      line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((cell) => cell.replace(/^"|"$/g, "").trim());
    const headers = parseLine(lines[0]);
    return lines.slice(1).map((line, index) => {
      const values = parseLine(line);
      const row = { row_number: index + 1 };
      headers.forEach((header, i) => { row[header] = values[i] ?? ""; });
      return row;
    });
  };

  const addFiles = (incomingFiles) => {
    const selected = Array.from(incomingFiles || []);
    setFiles((prev) => [...prev, ...selected]);
    setFileError("");
    setUploadedRows([]);
    setBatchResults([]);
    const csvFile = selected.find((f) => f.name.toLowerCase().endsWith(".csv"));
    if (!csvFile) { setFileError("Please upload a CSV file for batch prediction."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCsvText(String(e.target.result || ""));
        if (!rows.length) { setFileError("The CSV file is empty or has no valid rows."); return; }
        setUploadedRows(rows);
      } catch { setFileError("Could not parse this CSV file. Please check the format."); }
    };
    reader.onerror = () => setFileError("Could not read this file. Please try again.");
    reader.readAsText(csvFile);
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.length) { setUploadedRows([]); setBatchResults([]); setFileError(""); }
      return next;
    });
  };

  const runPrediction = async () => {
    setLoading(true);
    setApiError("");
    try {
      if (formData.inputMethod === INPUT_METHODS.file) {
        const rows = uploadedRows.map((row) => ({
          id: row.id_student || row.student_id || row.id || null,
          features: buildFeatures(row),
        }));
        const res = await fetch("/api/predict/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: formData.selectedModel, rows }),
        });
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const data = await res.json();
        const results = data.results.map((r, i) => ({
          id: r.id || `Student ${i + 1}`,
          riskScore: r.risk_score,
          level: r.level,
          confidence: r.confidence,
          avgScore: uploadedRows[i]?.avg_score_until_cutoff || "-",
          activeDays: uploadedRows[i]?.arab_active_days_equivalent_until_cutoff || "-",
          submissions: uploadedRows[i]?.submitted_assessments_until_cutoff || "-",
        }));
        setBatchResults(results);
        const avgRisk = Math.round(results.reduce((s, r) => s + r.riskScore, 0) / results.length);
        setPrediction({
          riskScore: avgRisk,
          level: results.some((r) => r.level === "High Risk") ? "Batch Contains High Risk" : "Batch Processed",
          confidence: results[0]?.confidence ?? 74,
        });
        setStep(4);
        return;
      }
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: formData.selectedModel, features: buildFeatures(formData) }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setPrediction({ riskScore: data.risk_score, level: data.level, confidence: data.confidence });
      setBatchResults([]);
      setStep(4);
    } catch (err) {
      setApiError(err.message || "Prediction failed. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const canContinueFromData = formData.inputMethod === INPUT_METHODS.file ? uploadedRows.length > 0 : filledCount > 0;

  return (
    <>
      <Stepper step={step} setStep={setStep} />
      <section style={styles.card}>
        {step === 0 && (
          <StartStep
            inputMethod={formData.inputMethod}
            setInputMethod={(m) => setFormData((p) => ({ ...p, inputMethod: m }))}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <ModelStep
            selectedModel={formData.selectedModel}
            setSelectedModel={(m) => setFormData((p) => ({ ...p, selectedModel: m }))}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <DataStep
            inputMethod={formData.inputMethod}
            setInputMethod={(m) => setFormData((p) => ({ ...p, inputMethod: m }))}
            files={files}
            uploadedRows={uploadedRows}
            fileError={fileError}
            addFiles={addFiles}
            removeFile={removeFile}
            dragOver={dragOver}
            setDragOver={setDragOver}
            formData={formData}
            handleChange={handleChange}
            filledCount={filledCount}
            totalFeatures={totalFeatures}
            progressPercent={progressPercent}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            canContinue={canContinueFromData}
          />
        )}
        {step === 3 && (
          <ReviewStep
            formData={formData}
            files={files}
            filledCount={filledCount}
            totalFeatures={totalFeatures}
            loading={loading}
            apiError={apiError}
            onBack={() => setStep(2)}
            onSubmit={runPrediction}
          />
        )}
        {step === 4 && prediction && (
          <ResultsStep
            prediction={prediction}
            formData={formData}
            filledCount={filledCount}
            totalFeatures={totalFeatures}
            files={files}
            batchResults={batchResults}
            onReset={() => {
              setPrediction(null);
              setUploadedRows([]);
              setBatchResults([]);
              setFiles([]);
              setFileError("");
              setApiError("");
              setStep(0);
            }}
            onBack={() => setStep(3)}
          />
        )}
      </section>
    </>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function Stepper({ step, setStep }) {
  return (
    <nav style={styles.stepper}>
      {STEPS.map((label, index) => (
        <button key={label} type="button" onClick={() => setStep(index)} style={styles.stepButton}>
          <span style={{ ...styles.stepDot, ...(index < step ? styles.stepDone : index === step ? styles.stepActive : styles.stepIdle) }}>
            {index < step ? "✓" : index + 1}
          </span>
          <span style={{ ...styles.stepLabel, color: index === step ? "#fff" : index < step ? "#a7f3d0" : "#64748b" }}>{label}</span>
          {index < STEPS.length - 1 && (
            <span style={{ ...styles.stepLine, background: index < step ? "linear-gradient(90deg,#8b5cf6,#06b6d4)" : "#1e293b" }} />
          )}
        </button>
      ))}
    </nav>
  );
}

function StartStep({ inputMethod, setInputMethod, onNext }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 01" title="How do you want to provide student data?" desc="Start by choosing the input path. You can either upload a dataset file or manually enter the exact model features for one student." />
      <div style={styles.choiceGrid}>
        <ChoiceCard
          active={inputMethod === INPUT_METHODS.manual}
          icon="⌨️"
          title="Manual Feature Input"
          desc="Enter the 16 model features directly. Best for testing a single student case."
          bullets={["Fast single prediction", "Feature-level control", "No file required"]}
          onClick={() => setInputMethod(INPUT_METHODS.manual)}
        />
        <ChoiceCard
          active={inputMethod === INPUT_METHODS.file}
          icon="📦"
          title="Upload Dataset File"
          desc="Upload a CSV file with student feature columns. Best for batch prediction."
          bullets={["Batch-ready flow", "CSV format", "Backend-powered scoring"]}
          onClick={() => setInputMethod(INPUT_METHODS.file)}
        />
      </div>
      <div style={styles.navRow}>
        <div />
        <button style={styles.primaryBtn} onClick={onNext}>Continue to Model →</button>
      </div>
    </div>
  );
}

function ModelStep({ selectedModel, setSelectedModel, onBack, onNext }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 02" title="Choose prediction checkpoint" desc="Select the trained model version. The 25% model is earlier but less certain, while the 50% model has richer behavior signals." />
      <div style={styles.modelGrid}>
        <ModelCard
          active={selectedModel === "model_25"}
          percent="25%"
          title="Early Detection Model"
          desc="Designed for first-quarter detection. Useful when intervention speed matters most."
          metrics={["Fastest alert", "Higher uncertainty", "Early intervention"]}
          onClick={() => setSelectedModel("model_25")}
        />
        <ModelCard
          active={selectedModel === "model_50"}
          percent="50%"
          title="Mid-Course Model"
          desc="Uses richer academic and behavioral signals. Better for more confident prediction."
          metrics={["Stronger signal", "Higher confidence", "Better behavior context"]}
          onClick={() => setSelectedModel("model_50")}
        />
      </div>
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <button style={styles.primaryBtn} onClick={onNext}>Continue to Data →</button>
      </div>
    </div>
  );
}

function DataStep(props) {
  const { inputMethod, setInputMethod, files, uploadedRows, fileError, addFiles, removeFile, dragOver, setDragOver, formData, handleChange, filledCount, totalFeatures, progressPercent, onBack, onNext, canContinue } = props;
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 03" title="Provide the prediction data" desc="You can switch between upload and manual entry anytime before submitting." />
      <div style={styles.segmentedControl}>
        <button style={{ ...styles.segmentBtn, ...(inputMethod === INPUT_METHODS.manual ? styles.segmentActive : {}) }} onClick={() => setInputMethod(INPUT_METHODS.manual)} type="button">Manual Input</button>
        <button style={{ ...styles.segmentBtn, ...(inputMethod === INPUT_METHODS.file ? styles.segmentActive : {}) }} onClick={() => setInputMethod(INPUT_METHODS.file)} type="button">File Upload</button>
      </div>
      {inputMethod === INPUT_METHODS.file
        ? <UploadPanel files={files} uploadedRows={uploadedRows} fileError={fileError} addFiles={addFiles} removeFile={removeFile} dragOver={dragOver} setDragOver={setDragOver} />
        : <ManualFeaturePanel formData={formData} handleChange={handleChange} filledCount={filledCount} totalFeatures={totalFeatures} progressPercent={progressPercent} />
      }
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <button style={{ ...styles.primaryBtn, opacity: canContinue ? 1 : 0.45 }} disabled={!canContinue} onClick={onNext}>Review Data →</button>
      </div>
    </div>
  );
}

function ReviewStep({ formData, files, filledCount, totalFeatures, loading, apiError, onBack, onSubmit }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 04" title="Review before prediction" desc="Verify the payload before sending to the Random Forest model endpoint." />
      <div style={styles.reviewGrid}>
        <ReviewCard icon="🧠" label="Selected Model" value={formData.selectedModel === "model_25" ? "25% Early Detection" : "50% Mid-Course"} />
        <ReviewCard icon="🧩" label="Input Method" value={formData.inputMethod === "manual" ? "Manual Features" : "File Upload"} />
        <ReviewCard icon="📊" label="Feature Status" value={`${filledCount}/${totalFeatures} filled`} />
        <ReviewCard icon="📁" label="Files" value={`${files.length} attached`} />
      </div>
      {formData.inputMethod === "manual" && filledCount > 0 && (
        <div style={styles.previewBox}>
          <h3 style={styles.previewTitle}>Filled Features</h3>
          <div style={styles.tagGrid}>
            {Object.entries(formData)
              .filter(([key, value]) => !["selectedModel", "inputMethod"].includes(key) && value !== "")
              .map(([key, value]) => (
                <div style={styles.tag} key={key}>
                  <span style={styles.tagKey}>{key.replaceAll("_", " ")}</span>
                  <strong style={styles.tagValue}>{value}</strong>
                </div>
              ))}
          </div>
        </div>
      )}
      {apiError && <div style={{ ...styles.fileError, marginTop: 18 }}>{apiError}</div>}
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack} disabled={loading}>← Back</button>
        <button style={styles.successBtn} onClick={onSubmit} disabled={loading}>
          {loading ? "Running…" : "Run Prediction →"}
        </button>
      </div>
    </div>
  );
}

function ResultsStep({ prediction, formData, filledCount, totalFeatures, files, batchResults, onReset, onBack }) {
  const risk = prediction.riskScore;
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 05" title="Prediction results & analytics" desc="Results computed by the trained Random Forest model." />
      <div style={styles.resultHero}>
        <RiskGauge score={risk} level={prediction.level} />
        <div style={styles.resultSummary}>
          <div style={styles.resultLabel}>Prediction Summary</div>
          <h2 style={styles.resultTitle}>{prediction.level}</h2>
          <p style={styles.resultText}>
            {risk >= 70
              ? "This student is at high risk of withdrawal or failure. Immediate academic support is recommended."
              : risk >= 40
              ? "This student shows moderate risk signals. Close monitoring and proactive outreach is advised."
              : "This student shows low risk signals and is on a healthy academic trajectory."}
          </p>
          <div style={styles.resultStatsRow}>
            <Stat label="Confidence" value={`${prediction.confidence}%`} />
            <Stat label="Model" value={formData.selectedModel === "model_25" ? "25%" : "50%"} />
            <Stat label="Input" value={formData.inputMethod === "manual" ? "Manual" : "File"} />
          </div>
        </div>
      </div>
      {formData.inputMethod === "file" && batchResults.length > 0 && <BatchResultsTable results={batchResults} />}
      <div style={styles.chartGrid}>
        <ChartCard title="Activity Over Time" subtitle="Engagement trend demo"><LineChart /></ChartCard>
        <ChartCard title="Student vs Average" subtitle="Radar comparison demo"><RadarChart /></ChartCard>
        <ChartCard title="Risk Score Gauge" subtitle="Current prediction score"><MiniGauge score={risk} /></ChartCard>
        <ChartCard title="Student Score Distribution" subtitle="Histogram demo"><Histogram /></ChartCard>
      </div>
      <div style={styles.reviewGrid}>
        <ReviewCard icon="📊" label="Features" value={`${filledCount}/${totalFeatures}`} />
        <ReviewCard icon="📁" label="Files" value={`${files.length}`} />
        <ReviewCard icon="⚡" label="Recommended Action" value={risk >= 70 ? "Urgent intervention" : risk >= 40 ? "Monitor closely" : "Normal follow-up"} />
        <ReviewCard icon="✅" label="Model" value={formData.selectedModel === "model_25" ? "25% Random Forest" : "50% Random Forest"} />
      </div>
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back to Review</button>
        <button style={styles.primaryBtn} onClick={onReset}>Start New Prediction</button>
      </div>
    </div>
  );
}

// ─── Panel components ─────────────────────────────────────────────────────────

function UploadPanel({ files, uploadedRows, fileError, addFiles, removeFile, dragOver, setDragOver }) {
  return (
    <div>
      <div
        style={{ ...styles.dropZone, borderColor: dragOver ? "#10b981" : "rgba(148,163,184,0.22)", background: dragOver ? "rgba(16,185,129,0.08)" : "rgba(15,23,42,0.55)" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="interactive-icon smoke-hover" style={styles.dropIcon}>⇪</div>
        <h3 style={styles.dropTitle}>Drop files here or click to browse</h3>
        <p style={styles.dropText}>Upload a CSV file with feature columns matching the 17 model inputs.</p>
        <input id="fileInput" type="file" multiple accept=".csv" style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
      </div>
      {fileError && <div style={styles.fileError}>{fileError}</div>}
      {uploadedRows.length > 0 && (
        <div style={styles.batchPreviewBox}>
          <div>
            <div style={styles.batchPreviewTitle}>CSV Loaded Successfully</div>
            <div style={styles.batchPreviewText}>{uploadedRows.length} student rows are ready for batch prediction.</div>
          </div>
          <div style={styles.batchPreviewCount}>{uploadedRows.length}</div>
        </div>
      )}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} style={styles.fileItem}>
              <div className="interactive-icon smoke-hover" style={styles.fileBadge}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.fileName}>{file.name}</div>
                <div style={styles.fileMeta}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button style={styles.removeBtn} onClick={() => removeFile(index)} type="button">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManualFeaturePanel({ formData, handleChange, filledCount, totalFeatures, progressPercent }) {
  return (
    <div>
      <div style={styles.progressBox}>
        <div>
          <div style={styles.progressTitle}>Feature Completion</div>
          <div style={styles.progressDesc}>{filledCount} of {totalFeatures} features filled</div>
        </div>
        <div style={styles.progressCircle}>{progressPercent}%</div>
      </div>
      {featureGroups.map((group) => (
        <div key={group.id} style={styles.featureGroup}>
          <div style={styles.featureGroupHeader}>
            <div style={{ ...styles.groupColor, background: group.color }} />
            <div>
              <h3 style={styles.featureGroupTitle}>{group.label}</h3>
              <p style={styles.featureGroupHint}>{group.hint}</p>
            </div>
          </div>
          <div style={styles.fieldGrid}>
            {group.fields.map((field) => (
              <div key={field.name} style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>{field.label}</label>
                {field.type === "select" ? (
                  <select name={field.name} value={formData[field.name]} onChange={handleChange} style={styles.fieldInput}>
                    {field.options.map((o) => <option key={o || "empty"} value={o}>{o || "Select value"}</option>)}
                  </select>
                ) : (
                  <input type="number" name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} style={styles.fieldInput} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BatchResultsTable({ results }) {
  const high = results.filter((r) => r.level === "High Risk").length;
  const medium = results.filter((r) => r.level === "Medium Risk").length;
  const low = results.filter((r) => r.level === "Low Risk").length;
  return (
    <div style={styles.batchResultsBox}>
      <div style={styles.batchResultsHeader}>
        <div>
          <div style={styles.resultLabel}>Batch Prediction Results</div>
          <h3 style={styles.batchResultsTitle}>Students Risk Overview</h3>
          <p style={styles.batchResultsDesc}>Each CSV row scored by the trained Random Forest model.</p>
        </div>
        <div style={styles.batchStatsWrap}>
          <Stat label="High Risk" value={high} />
          <Stat label="Medium" value={medium} />
          <Stat label="Low" value={low} />
        </div>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.resultsTable}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Student</th>
              <th style={styles.tableHead}>Risk Score</th>
              <th style={styles.tableHead}>Level</th>
              <th style={styles.tableHead}>Confidence</th>
              <th style={styles.tableHead}>Avg Score</th>
              <th style={styles.tableHead}>Active Days</th>
              <th style={styles.tableHead}>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((s) => (
              <tr key={s.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{s.id}</td>
                <td style={styles.tableCell}><strong>{s.riskScore}%</strong></td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.riskPill, ...(s.level === "High Risk" ? styles.highRiskPill : s.level === "Medium Risk" ? styles.mediumRiskPill : styles.lowRiskPill) }}>
                    {s.level}
                  </span>
                </td>
                <td style={styles.tableCell}>{s.confidence}%</td>
                <td style={styles.tableCell}>{s.avgScore}</td>
                <td style={styles.tableCell}>{s.activeDays}</td>
                <td style={styles.tableCell}>{s.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared small components ──────────────────────────────────────────────────

function ChoiceCard({ active, icon, title, desc, bullets, onClick }) {
  return (
    <button type="button" style={{ ...styles.choiceCard, ...(active ? styles.choiceActive : {}) }} onClick={onClick}>
      <div style={styles.choiceTop}>
        <div className="interactive-icon smoke-hover" style={styles.choiceIcon}>{icon}</div>
        <div style={active ? styles.activeBadge : styles.idleBadge}>{active ? "Selected" : "Choose"}</div>
      </div>
      <h3 style={styles.choiceTitle}>{title}</h3>
      <p style={styles.choiceDesc}>{desc}</p>
      <div style={styles.bulletList}>{bullets.map((b) => <span key={b} style={styles.bullet}>✓ {b}</span>)}</div>
    </button>
  );
}

function ModelCard({ active, percent, title, desc, metrics, onClick }) {
  return (
    <button type="button" style={{ ...styles.modelCard, ...(active ? styles.modelActive : {}) }} onClick={onClick}>
      <div style={styles.modelPercent}>{percent}</div>
      <h3 style={styles.modelTitle}>{title}</h3>
      <p style={styles.modelDesc}>{desc}</p>
      <div style={styles.metricList}>{metrics.map((m) => <span key={m} style={styles.metricPill}>{m}</span>)}</div>
      {active && <div style={styles.checkMark}>✓</div>}
    </button>
  );
}

function ReviewCard({ icon, label, value }) {
  return (
    <div style={styles.reviewCard}>
      <div className="interactive-icon smoke-hover" style={styles.reviewIcon}>{icon}</div>
      <div style={styles.reviewLabel}>{label}</div>
      <div style={styles.reviewValue}>{value}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <div>
          <h3 style={styles.chartTitle}>{title}</h3>
          <p style={styles.chartSubtitle}>{subtitle}</p>
        </div>
        <span style={styles.chartBadge}>Result</span>
      </div>
      {children}
    </div>
  );
}

function RiskGauge({ score, level }) {
  const rotation = -120 + (score / 100) * 240;
  return (
    <div style={styles.gaugeWrap}>
      <div style={styles.gaugeOuter}>
        <div style={styles.gaugeNeedleWrap}>
          <div style={{ ...styles.gaugeNeedle, transform: `rotate(${rotation}deg)` }} />
        </div>
        <div style={styles.gaugeInner}>
          <div style={styles.gaugeScore}>{score}</div>
          <div style={styles.gaugeLabel}>Risk Score</div>
        </div>
      </div>
      <div style={styles.gaugeLevel}>{level}</div>
    </div>
  );
}

function MiniGauge({ score }) {
  return (
    <div style={styles.miniGaugeBox}>
      <div style={{ ...styles.miniGaugeFill, width: `${score}%` }} />
      <div style={styles.miniGaugeText}>{score}% risk</div>
    </div>
  );
}

function LineChart() {
  const points = "10,120 70,92 130,98 190,65 250,80 310,42 370,54";
  return (
    <svg viewBox="0 0 390 150" style={styles.svgChart}>
      <path d="M10 130 H380 M10 100 H380 M10 70 H380 M10 40 H380" stroke="rgba(148,163,184,.12)" />
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {[10, 70, 130, 190, 250, 310, 370].map((x, i) => (
        <circle key={x} cx={x} cy={[120, 92, 98, 65, 80, 42, 54][i]} r="5" fill="#fff" stroke="#10b981" strokeWidth="3" />
      ))}
    </svg>
  );
}

function RadarChart() {
  return (
    <svg viewBox="0 0 220 180" style={styles.svgChart}>
      <polygon points="110,20 180,65 158,145 62,145 40,65" fill="none" stroke="rgba(148,163,184,.18)" />
      <polygon points="110,45 155,74 142,125 78,126 64,74" fill="none" stroke="rgba(148,163,184,.18)" />
      <polygon points="110,32 166,75 132,132 74,118 57,68" fill="rgba(16,185,129,.24)" stroke="#10b981" strokeWidth="3" />
      <polygon points="110,48 148,77 150,130 80,136 68,80" fill="rgba(245,158,11,.16)" stroke="#f59e0b" strokeWidth="3" />
      <text x="110" y="14" textAnchor="middle" fill="#94a3b8" fontSize="10">Score</text>
      <text x="190" y="68" fill="#94a3b8" fontSize="10">Clicks</text>
      <text x="160" y="166" fill="#94a3b8" fontSize="10">Quiz</text>
      <text x="24" y="166" fill="#94a3b8" fontSize="10">Forum</text>
      <text x="4" y="68" fill="#94a3b8" fontSize="10">Active</text>
    </svg>
  );
}

function Histogram() {
  const bars = [35, 58, 82, 110, 74, 52, 28];
  return (
    <svg viewBox="0 0 390 150" style={styles.svgChart}>
      <path d="M20 130 H370" stroke="rgba(148,163,184,.2)" />
      {bars.map((h, i) => (
        <rect key={i} x={35 + i * 48} y={130 - h} width="28" height={h} rx="8" fill={i === 3 ? "#10b981" : "#334155"} />
      ))}
    </svg>
  );
}

function SectionIntro({ eyebrow, title, desc }) {
  return (
    <div style={styles.sectionIntro}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2 style={styles.stepTitle}>{title}</h2>
      <p style={styles.stepDesc}>{desc}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}
