import { useMemo, useState } from "react";

const STEPS = ["Start", "Model", "Data", "Review", "Results"];
const INPUT_METHODS = {
  manual: "manual",
  file: "file",
};

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
        options: [
          "",
          "No Formal quals",
          "Lower Than A Level",
          "A Level or Equivalent",
          "HE Qualification",
          "Post Graduate Qualification",
        ],
      },
    ],
  },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [dragOver, setDragOver] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [uploadedRows, setUploadedRows] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [fileError, setFileError] = useState("");

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
    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const parseLine = (line) =>
      line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((cell) => cell.replace(/^"|"$/g, "").trim());

    const headers = parseLine(lines[0]);

    return lines.slice(1).map((line, index) => {
      const values = parseLine(line);
      const row = { row_number: index + 1 };
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] ?? "";
      });
      return row;
    });
  };

  const addFiles = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setFileError("");
    setUploadedRows([]);
    setBatchResults([]);

    const csvFile = selectedFiles.find((file) => file.name.toLowerCase().endsWith(".csv"));

    if (!csvFile) {
      setFileError("Please upload a CSV file to preview batch prediction results in this frontend demo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rows = parseCsvText(String(event.target.result || ""));
        if (!rows.length) {
          setFileError("The CSV file is empty or does not contain valid rows.");
          return;
        }
        setUploadedRows(rows);
      } catch (error) {
        setFileError("Could not read this CSV file. Please check the file format.");
      }
    };
    reader.onerror = () => setFileError("Could not read this file. Please try uploading it again.");
    reader.readAsText(csvFile);
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const nextFiles = prev.filter((_, fileIndex) => fileIndex !== index);
      if (nextFiles.length === 0) {
        setUploadedRows([]);
        setBatchResults([]);
        setFileError("");
      }
      return nextFiles;
    });
  };

  const cleanPayload = () => {
    const cleanedFeatures = Object.fromEntries(
      Object.entries(formData)
        .filter(([key]) => !["selectedModel", "inputMethod"].includes(key))
        .map(([key, value]) => [key, numericFields.includes(key) ? (value === "" ? null : Number(value)) : value])
    );

    return {
      model: formData.selectedModel,
      inputMethod: formData.inputMethod,
      features: cleanedFeatures,
      files,
    };
  };

  const calculateStudentRisk = (source) => {
    const avgScore = Number(source.avg_score_until_cutoff || 0);
    const submissions = Number(source.submitted_assessments_until_cutoff || 0);
    const activeDays = Number(source.arab_active_days_equivalent_until_cutoff || 0);
    const clicks = Number(source.clicks_per_active_day_until_cutoff || 0);
    const delay = Number(source.avg_submission_delay_arab_days_until_cutoff || 0);

    let risk = 68;
    risk -= avgScore * 0.35;
    risk -= submissions * 4;
    risk -= activeDays * 0.55;
    risk -= clicks * 0.6;
    risk += delay * 4.5;
    risk += formData.selectedModel === "model_25" ? 8 : 0;
    risk = Math.max(6, Math.min(94, Math.round(risk)));

    return {
      riskScore: risk,
      level: risk >= 70 ? "High Risk" : risk >= 40 ? "Medium Risk" : "Low Risk",
      confidence: formData.selectedModel === "model_50" ? 86 : 74,
    };
  };

  const runPrediction = () => {
    const payload = cleanPayload();
    console.log("Student-Leak-Radar backend payload:", payload);

    if (formData.inputMethod === INPUT_METHODS.file) {
      const results = uploadedRows.map((row, index) => {
        const result = calculateStudentRisk(row);
        return {
          id: row.id_student || row.student_id || row.id || `Student ${index + 1}`,
          rowNumber: row.row_number || index + 1,
          avgScore: row.avg_score_until_cutoff || "-",
          activeDays: row.arab_active_days_equivalent_until_cutoff || "-",
          submissions: row.submitted_assessments_until_cutoff || "-",
          ...result,
        };
      });

      setBatchResults(results);
      setPrediction({
        riskScore: results.length
          ? Math.round(results.reduce((sum, item) => sum + item.riskScore, 0) / results.length)
          : 0,
        level: results.some((item) => item.level === "High Risk") ? "Batch Contains High Risk" : "Batch Processed",
        confidence: formData.selectedModel === "model_50" ? 86 : 74,
        payload: { ...payload, rows: uploadedRows },
      });
      setStep(4);
      return;
    }

    const singleResult = calculateStudentRisk(formData);

    setPrediction({
      ...singleResult,
      payload,
    });
    setBatchResults([]);
    setStep(4);
  };

  const canContinueFromData = formData.inputMethod === INPUT_METHODS.file ? uploadedRows.length > 0 : filledCount > 0;

const particles = [
  { id: 0, x: "8%", y: "14%", delay: "0s", duration: "9s" },
  { id: 1, x: "18%", y: "68%", delay: "1.2s", duration: "12s" },
  { id: 2, x: "28%", y: "32%", delay: "2.4s", duration: "10s" },
  { id: 3, x: "38%", y: "82%", delay: "3.1s", duration: "14s" },
  { id: 4, x: "48%", y: "18%", delay: "0.7s", duration: "11s" },
  { id: 5, x: "58%", y: "56%", delay: "2.8s", duration: "13s" },
  { id: 6, x: "68%", y: "24%", delay: "4.2s", duration: "9s" },
  { id: 7, x: "78%", y: "72%", delay: "1.7s", duration: "15s" },
  { id: 8, x: "88%", y: "40%", delay: "3.8s", duration: "12s" },
  { id: 9, x: "12%", y: "88%", delay: "5.1s", duration: "10s" },
  { id: 10, x: "22%", y: "44%", delay: "0.4s", duration: "13s" },
  { id: 11, x: "32%", y: "10%", delay: "2.1s", duration: "11s" },
  { id: 12, x: "42%", y: "64%", delay: "4.6s", duration: "14s" },
  { id: 13, x: "52%", y: "30%", delay: "1.4s", duration: "9s" },
  { id: 14, x: "62%", y: "86%", delay: "3.3s", duration: "12s" },
  { id: 15, x: "72%", y: "12%", delay: "5.5s", duration: "15s" },
  { id: 16, x: "82%", y: "58%", delay: "0.9s", duration: "10s" },
  { id: 17, x: "92%", y: "26%", delay: "2.6s", duration: "13s" },
  { id: 18, x: "6%", y: "50%", delay: "4.1s", duration: "11s" },
  { id: 19, x: "96%", y: "92%", delay: "1.9s", duration: "14s" },
];



  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      <div style={styles.bgOrbOne} />
      <div style={styles.bgOrbTwo} />
      <div style={styles.bgGrid} />
      <div className="particle-layer">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="particle"
            style={{
              "--x": particle.x,
              "--y": particle.y,
              "--delay": particle.delay,
              "--duration": particle.duration,
            }}
          />
        ))}
      </div>

      
      <main style={styles.shell}>
        <Header />
        <Stepper step={step} setStep={setStep} />

        <section style={styles.card}>
          {step === 0 && (
            <StartStep
              inputMethod={formData.inputMethod}
              setInputMethod={(method) => setFormData((prev) => ({ ...prev, inputMethod: method }))}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <ModelStep
              selectedModel={formData.selectedModel}
              setSelectedModel={(model) => setFormData((prev) => ({ ...prev, selectedModel: model }))}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <DataStep
              inputMethod={formData.inputMethod}
              setInputMethod={(method) => setFormData((prev) => ({ ...prev, inputMethod: method }))}
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
                setStep(0);
              }}
              onBack={() => setStep(3)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.heroContent}>
        <div style={styles.kicker}>AI EARLY WARNING SYSTEM</div>
        <h1 style={styles.title}>Student Leak Radar</h1>

        <div style={styles.subtitleCard}>
          <div style={styles.subtitleAccent}>AI-powered early risk intelligence</div>
          <p style={styles.subtitle}>
            Transform student engagement, assessment performance, and learning behavior
            into clear early-warning signals—so academic teams can detect vulnerable
            students sooner and take confident, data-driven action.
          </p>
        </div>
      </div>
    </header>
  );
}


function Stepper({ step, setStep }) {
  return (
    <nav style={styles.stepper}>
      {STEPS.map((label, index) => (
        <button key={label} type="button" onClick={() => setStep(index)} style={styles.stepButton}>
          <span
            style={{
              ...styles.stepDot,
              ...(index < step ? styles.stepDone : index === step ? styles.stepActive : styles.stepIdle),
            }}
          >
            {index < step ? "✓" : index + 1}
          </span>
          <span style={{ ...styles.stepLabel, color: index === step ? "#fff" : index < step ? "#a7f3d0" : "#64748b" }}>{label}</span>
          {index < STEPS.length - 1 && <span style={{ ...styles.stepLine, background: index < step ? "linear-gradient(90deg,#8b5cf6,#06b6d4)" : "#1e293b" }} />}
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
          desc="Upload CSV, Excel, or any supported dataset file. Best for batch prediction later."
          bullets={["Batch-ready flow", "CSV / XLSX / files", "Backend-ready payload"]}
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
  const {
    inputMethod,
    setInputMethod,
    files,
    uploadedRows,
    fileError,
    addFiles,
    removeFile,
    dragOver,
    setDragOver,
    formData,
    handleChange,
    filledCount,
    totalFeatures,
    progressPercent,
    onBack,
    onNext,
    canContinue,
  } = props;

  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 03" title="Provide the prediction data" desc="You can switch between upload and manual entry anytime before submitting." />

      <div style={styles.segmentedControl}>
        <button style={{ ...styles.segmentBtn, ...(inputMethod === INPUT_METHODS.manual ? styles.segmentActive : {}) }} onClick={() => setInputMethod(INPUT_METHODS.manual)} type="button">Manual Input</button>
        <button style={{ ...styles.segmentBtn, ...(inputMethod === INPUT_METHODS.file ? styles.segmentActive : {}) }} onClick={() => setInputMethod(INPUT_METHODS.file)} type="button">File Upload</button>
      </div>

      {inputMethod === INPUT_METHODS.file ? (
        <UploadPanel files={files} uploadedRows={uploadedRows} fileError={fileError} addFiles={addFiles} removeFile={removeFile} dragOver={dragOver} setDragOver={setDragOver} />
      ) : (
        <ManualFeaturePanel formData={formData} handleChange={handleChange} filledCount={filledCount} totalFeatures={totalFeatures} progressPercent={progressPercent} />
      )}

      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <button style={{ ...styles.primaryBtn, opacity: canContinue ? 1 : 0.45 }} disabled={!canContinue} onClick={onNext}>Review Data →</button>
      </div>
    </div>
  );
}

function UploadPanel({ files, uploadedRows, fileError, addFiles, removeFile, dragOver, setDragOver }) {
  return (
    <div>
      <div
        style={{ ...styles.dropZone, borderColor: dragOver ? "#10b981" : "rgba(148,163,184,0.22)", background: dragOver ? "rgba(16,185,129,0.08)" : "rgba(15,23,42,0.55)" }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          addFiles(event.dataTransfer.files);
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="interactive-icon smoke-hover" style={styles.dropIcon}>⇪</div>
        <h3 style={styles.dropTitle}>Drop files here or click to browse</h3>
        <p style={styles.dropText}>Supports CSV, XLSX, PDF, images, or any file type until backend validation is added.</p>
        <input id="fileInput" type="file" multiple accept=".csv" style={{ display: "none" }} onChange={(event) => addFiles(event.target.files)} />
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
                <div style={styles.fileMeta}>{(file.size / 1024).toFixed(1)} KB · Ready for backend</div>
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
                    {field.options.map((option) => <option key={option || "empty"} value={option}>{option || "Select value"}</option>)}
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

function ReviewStep({ formData, files, filledCount, totalFeatures, onBack, onSubmit }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 04" title="Review before prediction" desc="This is the final payload preview before sending it to the backend prediction endpoint." />

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

      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <button style={styles.successBtn} onClick={onSubmit}>Run Prediction →</button>
      </div>
    </div>
  );
}

function ResultsStep({ prediction, formData, filledCount, totalFeatures, files, batchResults, onReset, onBack }) {
  const risk = prediction.riskScore;

  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Step 05" title="Prediction results & analytics" desc="Charts appear only after prediction, exactly like a real dashboard result screen." />

      <div style={styles.resultHero}>
        <RiskGauge score={risk} level={prediction.level} />
        <div style={styles.resultSummary}>
          <div style={styles.resultLabel}>Prediction Summary</div>
          <h2 style={styles.resultTitle}>{prediction.level}</h2>
          <p style={styles.resultText}>Risk score is calculated now as a frontend demo. Later, this value should come directly from your trained backend model.</p>
          <div style={styles.resultStatsRow}>
            <Stat label="Confidence" value={`${prediction.confidence}%`} />
            <Stat label="Model" value={formData.selectedModel === "model_25" ? "25%" : "50%"} />
            <Stat label="Input" value={formData.inputMethod === "manual" ? "Manual" : "File"} />
          </div>
        </div>
      </div>

      {formData.inputMethod === "file" && batchResults.length > 0 && (
        <BatchResultsTable results={batchResults} />
      )}

      <div style={styles.chartGrid}>
        <ChartCard title="Activity Over Time" subtitle="Line chart demo">
          <LineChart />
        </ChartCard>
        <ChartCard title="Student vs Average" subtitle="Radar / spider demo">
          <RadarChart />
        </ChartCard>
        <ChartCard title="Risk Score Gauge" subtitle="Current prediction score">
          <MiniGauge score={risk} />
        </ChartCard>
        <ChartCard title="Student Score Distribution" subtitle="Histogram demo">
          <Histogram />
        </ChartCard>
      </div>

      <div style={styles.reviewGrid}>
        <ReviewCard icon="📊" label="Features" value={`${filledCount}/${totalFeatures}`} />
        <ReviewCard icon="📁" label="Files" value={`${files.length}`} />
        <ReviewCard icon="⚡" label="Recommended Action" value={risk >= 70 ? "Urgent intervention" : risk >= 40 ? "Monitor closely" : "Normal follow-up"} />
        <ReviewCard icon="✅" label="Payload" value="Printed in console" />
      </div>

      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back to Review</button>
        <button style={styles.primaryBtn} onClick={onReset}>Start New Prediction</button>
      </div>
    </div>
  );
}

function BatchResultsTable({ results }) {
  const highRiskCount = results.filter((item) => item.level === "High Risk").length;
  const mediumRiskCount = results.filter((item) => item.level === "Medium Risk").length;
  const lowRiskCount = results.filter((item) => item.level === "Low Risk").length;

  return (
    <div style={styles.batchResultsBox}>
      <div style={styles.batchResultsHeader}>
        <div>
          <div style={styles.resultLabel}>Batch Prediction Results</div>
          <h3 style={styles.batchResultsTitle}>Students Risk Overview</h3>
          <p style={styles.batchResultsDesc}>Each CSV row is processed as one student record using the same frontend demo scoring logic.</p>
        </div>
        <div style={styles.batchStatsWrap}>
          <Stat label="High Risk" value={highRiskCount} />
          <Stat label="Medium" value={mediumRiskCount} />
          <Stat label="Low" value={lowRiskCount} />
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
            {results.map((student) => (
              <tr key={`${student.id}-${student.rowNumber}`} style={styles.tableRow}>
                <td style={styles.tableCell}>{student.id}</td>
                <td style={styles.tableCell}><strong>{student.riskScore}%</strong></td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.riskPill,
                    ...(student.level === "High Risk" ? styles.highRiskPill : student.level === "Medium Risk" ? styles.mediumRiskPill : styles.lowRiskPill),
                  }}>
                    {student.level}
                  </span>
                </td>
                <td style={styles.tableCell}>{student.confidence}%</td>
                <td style={styles.tableCell}>{student.avgScore}</td>
                <td style={styles.tableCell}>{student.activeDays}</td>
                <td style={styles.tableCell}>{student.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChoiceCard({ active, icon, title, desc, bullets, onClick }) {
  return (
    <button type="button" style={{ ...styles.choiceCard, ...(active ? styles.choiceActive : {}) }} onClick={onClick}>
      <div style={styles.choiceTop}>
        <div className="interactive-icon smoke-hover" style={styles.choiceIcon}>{icon}</div>
        <div style={active ? styles.activeBadge : styles.idleBadge}>{active ? "Selected" : "Choose"}</div>
      </div>
      <h3 style={styles.choiceTitle}>{title}</h3>
      <p style={styles.choiceDesc}>{desc}</p>
      <div style={styles.bulletList}>{bullets.map((item) => <span key={item} style={styles.bullet}>✓ {item}</span>)}</div>
    </button>
  );
}

function ModelCard({ active, percent, title, desc, metrics, onClick }) {
  return (
    <button type="button" style={{ ...styles.modelCard, ...(active ? styles.modelActive : {}) }} onClick={onClick}>
      <div style={styles.modelPercent}>{percent}</div>
      <h3 style={styles.modelTitle}>{title}</h3>
      <p style={styles.modelDesc}>{desc}</p>
      <div style={styles.metricList}>{metrics.map((metric) => <span key={metric} style={styles.metricPill}>{metric}</span>)}</div>
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
      {[10, 70, 130, 190, 250, 310, 370].map((x, i) => <circle key={x} cx={x} cy={[120, 92, 98, 65, 80, 42, 54][i]} r="5" fill="#fff" stroke="#10b981" strokeWidth="3" />)}
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
      {bars.map((height, index) => (
        <rect key={index} x={35 + index * 48} y={130 - height} width="28" height={height} rx="8" fill={index === 3 ? "#10b981" : "#334155"} />
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

const globalStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #020617; }
  button, input, select { font-family: inherit; }
  button:disabled { cursor: not-allowed; }

  .fade-in {
    animation: fadeIn .28s ease both;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .particle-layer {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .particle {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(110, 231, 183, 0.58);
    box-shadow: 0 0 18px rgba(110, 231, 183, 0.85);
    animation: floatParticle var(--duration) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .particle::after {
    content: "";
    position: absolute;
    inset: -10px;
    border-radius: inherit;
    background: radial-gradient(circle, rgba(245, 158, 11, .24), transparent 68%);
    filter: blur(6px);
  }

  @keyframes floatParticle {
    0%, 100% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: .22;
    }
    50% {
      transform: translate3d(38px, -52px, 0) scale(1.8);
      opacity: .88;
    }
  }

  .interactive-icon {
    transition:
      transform .28s cubic-bezier(.2,.8,.2,1),
      filter .28s ease,
      box-shadow .28s ease,
      background .28s ease;
    will-change: transform;
  }

  .smoke-hover {
    position: relative;
    z-index: 1;
  }

  .smoke-hover::after {
    content: "";
    position: absolute;
    inset: -12px;
    border-radius: inherit;
    background:
      radial-gradient(circle, rgba(110,231,183,.25), transparent 58%),
      radial-gradient(circle at 70% 30%, rgba(245,158,11,.22), transparent 55%);
    opacity: 0;
    filter: blur(14px);
    transform: scale(.75);
    transition: .32s ease;
    z-index: -1;
  }

  .smoke-hover:hover {
    transform: translateY(-4px) scale(1.08) rotate(-4deg);
    filter: drop-shadow(0 18px 28px rgba(16,185,129,.25));
  }

  .smoke-hover:hover::after {
    opacity: 1;
    transform: scale(1.18);
    animation: smokePulse 1.6s ease-in-out infinite;
  }

  @keyframes smokePulse {
    0%, 100% { opacity: .45; transform: scale(1.05); }
    50% { opacity: .85; transform: scale(1.28); }
  }

  button {
    transition:
      transform .22s ease,
      box-shadow .22s ease,
      border-color .22s ease,
      background .22s ease,
      opacity .22s ease;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  input:focus,
  select:focus {
    border-color: rgba(110, 231, 183, .75) !important;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
  }

  @media (max-width: 900px) {
    .hide-mobile { display: none; }
  }
`;




const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "radial-gradient(circle at top left, #0f172a 0%, #0b1220 42%, #020617 100%)",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif",
    padding: "28px 16px 56px",
  },
  bgOrbOne: { position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "rgba(16,185,129,.18)", filter: "blur(80px)", top: -150, left: -120 },
  bgOrbTwo: { position: "fixed", width: 460, height: 460, borderRadius: "50%", background: "rgba(245,158,11,.12)", filter: "blur(90px)", bottom: -180, right: -120 },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.8), transparent)", pointerEvents: "none" },
  shell: { position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    textAlign: "center",
  },
  heroContent: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: "8px 0 4px",
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    marginBottom: 12,
    padding: "8px 14px",
    border: "1px solid rgba(110,231,183,.18)",
    borderRadius: 999,
    background: "rgba(16,185,129,.07)",
    boxShadow: "0 14px 50px rgba(16,185,129,.10)",
  },
  title: {
    margin: 0,
    fontSize: "clamp(42px, 7vw, 82px)",
    lineHeight: .9,
    letterSpacing: "-.075em",
    fontWeight: 950,
    color: "#f8fafc",
    textShadow: "0 22px 70px rgba(0,0,0,.55)",
  },
  subtitleCard: {
    position: "relative",
    maxWidth: 900,
    margin: "26px auto 0",
    padding: "22px 28px",
    borderRadius: 28,
    background: "linear-gradient(135deg, rgba(15,23,42,.72), rgba(2,6,23,.50))",
    border: "1px solid rgba(110,231,183,.16)",
    boxShadow: "0 30px 90px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter: "blur(18px)",
    overflow: "hidden",
  },
  subtitleAccent: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: ".14em",
    textTransform: "uppercase",
  },
  subtitle: {
    maxWidth: 820,
    margin: "0 auto",
    color: "#dbeafe",
    fontSize: "clamp(16px, 1.65vw, 20px)",
    lineHeight: 1.75,
    fontWeight: 650,
    textAlign: "center",
    letterSpacing: "-.015em",
  },
  statBox: { padding: "14px 16px", border: "1px solid rgba(255,255,255,.10)", borderRadius: 18, background: "rgba(15,23,42,.58)", backdropFilter: "blur(16px)", minWidth: 100 },
  statLabel: { display: "block", color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: 800, letterSpacing: ".12em", marginBottom: 6 },
  statValue: { color: "#fff", fontSize: 18 },
  stepper: { display: "flex", alignItems: "center", gap: 0, padding: 16, border: "1px solid rgba(255,255,255,.10)", borderRadius: 26, background: "rgba(15,23,42,.70)", backdropFilter: "blur(18px)", marginBottom: 20, overflowX: "auto" },
  stepButton: { display: "flex", alignItems: "center", flex: 1, border: 0, background: "transparent", cursor: "pointer", minWidth: 130 },
  stepDot: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 },
  stepDone: { background: "linear-gradient(135deg,#10b981,#f59e0b)", color: "#020617", boxShadow: "0 0 0 6px rgba(16,185,129,.10)" },
  stepActive: { background: "#fff", color: "#0f172a", boxShadow: "0 0 0 6px rgba(255,255,255,.08)" },
  stepIdle: { border: "1px solid #334155", color: "#64748b", background: "rgba(15,23,42,.5)" },
  stepLabel: { marginLeft: 10, marginRight: 14, fontWeight: 850, whiteSpace: "nowrap" },
  stepLine: { height: 2, flex: 1, minWidth: 42, borderRadius: 99 },
  card: { border: "1px solid rgba(255,255,255,.11)", borderRadius: 34, background: "linear-gradient(180deg, rgba(15,23,42,.88), rgba(2,6,23,.78))", backdropFilter: "blur(22px)", boxShadow: "0 30px 100px rgba(0,0,0,.42)", padding: "clamp(22px, 4vw, 42px)" },
  sectionIntro: { marginBottom: 28 },
  eyebrow: { color: "#6ee7b7", fontWeight: 900, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" },
  stepTitle: { margin: "8px 0 8px", fontSize: "clamp(26px, 4vw, 42px)", lineHeight: 1, letterSpacing: "-.04em" },
  stepDesc: { margin: 0, color: "#94a3b8", lineHeight: 1.7, maxWidth: 800 },
  choiceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 18 },
  choiceCard: { textAlign: "left", border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.58)", color: "#fff", borderRadius: 28, padding: 24, cursor: "pointer", transition: ".2s", minHeight: 260 },
  choiceActive: { borderColor: "rgba(16,185,129,.85)", background: "linear-gradient(135deg, rgba(16,185,129,.15), rgba(245,158,11,.10))", transform: "translateY(-2px)", boxShadow: "0 24px 70px rgba(16,185,129,.13)" },
  choiceTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  choiceIcon: { fontSize: 42 },
  activeBadge: { fontSize: 12, color: "#a7f3d0", border: "1px solid rgba(16,185,129,.35)", background: "rgba(16,185,129,.12)", borderRadius: 99, padding: "7px 11px", fontWeight: 900 },
  idleBadge: { fontSize: 12, color: "#94a3b8", border: "1px solid rgba(148,163,184,.2)", borderRadius: 99, padding: "7px 11px", fontWeight: 900 },
  choiceTitle: { margin: "0 0 10px", fontSize: 22, letterSpacing: "-.02em" },
  choiceDesc: { color: "#94a3b8", lineHeight: 1.65, margin: "0 0 18px" },
  bulletList: { display: "flex", flexWrap: "wrap", gap: 8 },
  bullet: { color: "#a7f3d0", background: "rgba(16,185,129,.10)", border: "1px solid rgba(16,185,129,.20)", padding: "7px 10px", borderRadius: 99, fontSize: 12, fontWeight: 800 },
  modelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 18 },
  modelCard: { position: "relative", textAlign: "left", border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.58)", color: "#fff", borderRadius: 30, padding: 26, cursor: "pointer", minHeight: 280, overflow: "hidden" },
  modelActive: { borderColor: "rgba(16,185,129,.9)", background: "linear-gradient(135deg, rgba(16,185,129,.18), rgba(245,158,11,.08))", boxShadow: "0 24px 80px rgba(16,185,129,.14)" },
  modelPercent: { fontSize: 74, fontWeight: 950, letterSpacing: "-.08em", lineHeight: .9, background: "linear-gradient(135deg,#ffffff,#6ee7b7)", WebkitBackgroundClip: "text", color: "transparent", marginBottom: 16 },
  modelTitle: { fontSize: 22, margin: "0 0 10px" },
  modelDesc: { color: "#94a3b8", lineHeight: 1.65, margin: "0 0 20px" },
  metricList: { display: "flex", flexWrap: "wrap", gap: 8 },
  metricPill: { color: "#fde68a", background: "rgba(245,158,11,.10)", border: "1px solid rgba(245,158,11,.20)", padding: "7px 10px", borderRadius: 99, fontSize: 12, fontWeight: 800 },
  checkMark: { position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950 },
  segmentedControl: { display: "inline-flex", padding: 6, gap: 6, border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.48)", borderRadius: 18, marginBottom: 24 },
  segmentBtn: { border: 0, color: "#94a3b8", background: "transparent", padding: "11px 16px", borderRadius: 14, cursor: "pointer", fontWeight: 900 },
  segmentActive: { color: "#020617", background: "linear-gradient(135deg,#6ee7b7,#fbbf24)" },
  dropZone: { border: "2px dashed", borderRadius: 30, minHeight: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", padding: 30, transition: ".2s" },
  dropIcon: { fontSize: 64, color: "#6ee7b7", marginBottom: 12 },
  dropTitle: { margin: "0 0 8px", fontSize: 24 },
  dropText: { margin: 0, color: "#94a3b8", maxWidth: 560, lineHeight: 1.7 },
  fileList: { display: "grid", gap: 10, marginTop: 18 },
  fileItem: { display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.55)" },
  fileBadge: { width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: "rgba(16,185,129,.12)" },
  fileName: { color: "#fff", fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileMeta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  removeBtn: { border: 0, width: 36, height: 36, borderRadius: "50%", background: "rgba(239,68,68,.12)", color: "#fecaca", cursor: "pointer", fontSize: 22 },
  progressBox: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.45)", borderRadius: 24, padding: 20, marginBottom: 22 },
  progressTitle: { fontWeight: 950, fontSize: 17 },
  progressDesc: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  progressCircle: { width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10b981,#f59e0b)", fontWeight: 950 },
  featureGroup: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 26, background: "rgba(15,23,42,.42)", padding: 20, marginBottom: 16 },
  featureGroupHeader: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 },
  groupColor: { width: 12, height: 42, borderRadius: 99, flexShrink: 0 },
  featureGroupTitle: { margin: 0, fontSize: 18 },
  featureGroupHint: { color: "#64748b", margin: "5px 0 0", fontSize: 13 },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 },
  fieldWrap: {},
  fieldLabel: { display: "block", marginBottom: 8, color: "#cbd5e1", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  fieldInput: { width: "100%", border: "1px solid rgba(148,163,184,.22)", background: "rgba(2,6,23,.70)", color: "#fff", borderRadius: 16, padding: "13px 14px", outline: "none", fontSize: 14 },
  reviewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))", gap: 14, marginBottom: 18 },
  reviewCard: { border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.52)", borderRadius: 22, padding: 18 },
  reviewIcon: { fontSize: 28, marginBottom: 12 },
  reviewLabel: { color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 900, marginBottom: 6 },
  reviewValue: { color: "#fff", fontWeight: 950 },
  previewBox: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 24, padding: 20, background: "rgba(2,6,23,.40)" },
  previewTitle: { margin: "0 0 14px", fontSize: 17 },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  tag: { border: "1px solid rgba(139,92,246,.22)", background: "rgba(139,92,246,.10)", borderRadius: 14, padding: "8px 10px", display: "flex", gap: 8, alignItems: "center" },
  tagKey: { color: "#c4b5fd", fontSize: 12 },
  tagValue: { color: "#fff", fontSize: 13 },
  resultHero: { display: "grid", gridTemplateColumns: "minmax(240px,.75fr) 1.25fr", gap: 20, alignItems: "stretch", marginBottom: 20 },
  gaugeWrap: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "radial-gradient(circle at center, rgba(139,92,246,.18), rgba(15,23,42,.62))", padding: 24, textAlign: "center" },
  gaugeOuter: { position: "relative", width: 220, height: 220, borderRadius: "50%", margin: "0 auto", background: "conic-gradient(from 220deg, #22c55e, #f59e0b, #ef4444, #1e293b 72%)", display: "flex", alignItems: "center", justifyContent: "center" },
  gaugeNeedleWrap: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  gaugeNeedle: { width: 4, height: 90, background: "#fff", transformOrigin: "50% 100%", borderRadius: 99, marginTop: -90 },
  gaugeInner: { width: 150, height: 150, borderRadius: "50%", background: "#07111f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, border: "1px solid rgba(255,255,255,.12)" },
  gaugeScore: { fontSize: 54, fontWeight: 950, letterSpacing: "-.06em" },
  gaugeLabel: { color: "#94a3b8", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  gaugeLevel: { marginTop: 18, fontSize: 24, fontWeight: 950 },
  resultSummary: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "rgba(15,23,42,.52)", padding: 28 },
  resultLabel: { color: "#6ee7b7", fontWeight: 900, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase" },
  resultTitle: { fontSize: 44, lineHeight: 1, margin: "12px 0", letterSpacing: "-.05em" },
  resultText: { color: "#94a3b8", lineHeight: 1.7, maxWidth: 620 },
  resultStatsRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 },
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16, marginBottom: 20 },
  chartCard: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 26, background: "rgba(15,23,42,.52)", padding: 18, minHeight: 260 },
  chartHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  chartTitle: { margin: 0, fontSize: 17 },
  chartSubtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 12 },
  chartBadge: { height: 28, color: "#a7f3d0", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 99, padding: "6px 10px", fontSize: 11, fontWeight: 900 },
  svgChart: { width: "100%", height: 170, display: "block" },
  miniGaugeBox: { position: "relative", height: 54, borderRadius: 999, overflow: "hidden", background: "rgba(2,6,23,.75)", border: "1px solid rgba(255,255,255,.10)", marginTop: 70 },
  miniGaugeFill: { height: "100%", background: "linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)", borderRadius: 999 },
  miniGaugeText: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950 },
  fileError: { marginTop: 14, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.10)", color: "#fecaca", borderRadius: 16, padding: "12px 14px", fontWeight: 800 },
  batchPreviewBox: { marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px solid rgba(16,185,129,.28)", background: "linear-gradient(135deg, rgba(16,185,129,.12), rgba(245,158,11,.06))", borderRadius: 22, padding: 18 },
  batchPreviewTitle: { color: "#d1fae5", fontWeight: 950, fontSize: 16 },
  batchPreviewText: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  batchPreviewCount: { width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18, background: "linear-gradient(135deg,#10b981,#f59e0b)", color: "#020617", fontWeight: 950, fontSize: 20 },
  batchResultsBox: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "rgba(15,23,42,.52)", padding: 22, marginBottom: 20 },
  batchResultsHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 18 },
  batchResultsTitle: { margin: "8px 0 6px", fontSize: 26, letterSpacing: "-.04em" },
  batchResultsDesc: { margin: 0, color: "#94a3b8", lineHeight: 1.6, maxWidth: 620 },
  batchStatsWrap: { display: "flex", gap: 10, flexWrap: "wrap" },
  tableWrap: { width: "100%", overflowX: "auto", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)" },
  resultsTable: { width: "100%", borderCollapse: "collapse", minWidth: 820, background: "rgba(2,6,23,.36)" },
  tableHead: { textAlign: "left", padding: "14px 16px", color: "#a7f3d0", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", borderBottom: "1px solid rgba(255,255,255,.10)", whiteSpace: "nowrap" },
  tableRow: { borderBottom: "1px solid rgba(255,255,255,.07)" },
  tableCell: { padding: "14px 16px", color: "#e2e8f0", fontSize: 13, whiteSpace: "nowrap" },
  riskPill: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 950 },
  highRiskPill: { color: "#fecaca", background: "rgba(239,68,68,.13)", border: "1px solid rgba(239,68,68,.25)" },
  mediumRiskPill: { color: "#fde68a", background: "rgba(245,158,11,.13)", border: "1px solid rgba(245,158,11,.25)" },
  lowRiskPill: { color: "#a7f3d0", background: "rgba(16,185,129,.13)", border: "1px solid rgba(16,185,129,.25)" },
  navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.10)" },
  primaryBtn: { border: 0, color: "#020617", background: "linear-gradient(135deg,#10b981,#f59e0b)", borderRadius: 16, padding: "13px 20px", fontWeight: 950, cursor: "pointer", boxShadow: "0 16px 46px rgba(16,185,129,.16)" },
  secondaryBtn: { border: "1px solid rgba(255,255,255,.12)", color: "#cbd5e1", background: "rgba(15,23,42,.55)", borderRadius: 16, padding: "13px 18px", fontWeight: 900, cursor: "pointer" },
  successBtn: { border: 0, color: "#fff", background: "linear-gradient(135deg,#059669,#10b981)", borderRadius: 16, padding: "13px 20px", fontWeight: 950, cursor: "pointer", boxShadow: "0 16px 46px rgba(16,185,129,.16)" },
};
