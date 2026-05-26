/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, FileSpreadsheet, FileText, Keyboard, Loader2, Sparkles } from "lucide-react";
import Papa from "papaparse";
import { styles } from "./styles";
import { dataVisualizationCss } from "./components/DataVisualization";
import { RecoveryPrompt, useAnalytics, usePersistentDraft, useToast, useUnsavedChanges, useUrlState } from "./enterpriseUx";

const INPUT_METHODS = { manual: "manual", file: "file" };
const LOW_RISK_COLOR = "#5eead4";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const API_FALLBACK_BASE = "http://127.0.0.1:8000";
const STEP_TABS = ["input", "model", "data", "results"];
const TOTAL_PROCESSING_STEPS = 4;
const MODEL_PROGRESS_GRADIENT = "linear-gradient(90deg, #5eead4, #38bdf8)";

const PROCESSING_STAGES = {
  "Preparing dataset": {
    step: 1,
    percent: 18,
    task: "Preparing dataset",
    message: "Preparing uploaded dataset and validating student rows...",
  },
  "Extracting features": {
    step: 2,
    percent: 38,
    task: "Extracting features",
    message: "Analyzing student activity, assessment behavior, and profile signals...",
  },
  "Running prediction model": {
    step: 3,
    percent: 62,
    task: "Running prediction model",
    message: "Calculating risk probabilities with the selected model...",
  },
  "Calculating risk scores": {
    step: 3,
    percent: 76,
    task: "Calculating risk scores",
    message: "Converting model output into student-level risk classifications...",
  },
  "Generating results": {
    step: 4,
    percent: 90,
    task: "Generating results",
    message: "Building prediction summary and intervention recommendations...",
  },
  "Prediction Complete": {
    step: 4,
    percent: 100,
    task: "Prediction Complete",
    message: "Finalizing results...",
    complete: true,
  },
};

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const predictionConsoleCss = `
  .prediction-console {
    --font-display: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  .prediction-console h1,
  .prediction-console h2 {
    font-family: var(--font-display);
  }

  .prediction-console .pc-step-shell {
    position: sticky;
    top: 64px;
    z-index: 12;
    margin-bottom: 18px;
    padding: 6px 0 8px;
    background: linear-gradient(180deg, rgba(13,27,42,.92), rgba(13,27,42,.58));
    backdrop-filter: blur(10px);
  }

  .prediction-console .pc-top-progress {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: rgba(255,255,255,.08);
    overflow: hidden;
  }

  .prediction-console .pc-top-progress span {
    display: block;
    height: 100%;
    width: var(--pc-progress);
    background: linear-gradient(90deg, #5eead4, #38bdf8);
    transition: width .35s ease;
  }

  .prediction-console .pc-step-pills {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .prediction-console .pc-step-pill {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(148,163,184,.38);
    transition: all .34s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .prediction-console .pc-step-pill.is-active {
    width: 24px;
    border-radius: 4px;
    border-color: rgba(94,234,212,.72);
    background: #5eead4;
    box-shadow: 0 0 18px rgba(94,234,212,.28);
  }

  .prediction-console .pc-choice-card,
  .prediction-console .pc-model-card {
    position: relative;
    will-change: transform, opacity;
    transition: transform .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .prediction-console .pc-choice-card:hover,
  .prediction-console .pc-model-card:hover {
    transform: translateY(-2px);
  }

  .prediction-console .pc-choice-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(105deg, transparent 40%, rgba(94,234,212,0.06) 50%, transparent 60%);
    background-size: 200% 100%;
    opacity: 0;
  }

  .prediction-console .pc-choice-card:hover::before {
    opacity: 1;
    animation: shimmer 1.1s linear;
  }

  .prediction-console .pc-choice-card.is-selected,
  .prediction-console .pc-model-card.is-selected {
    border-color: #5eead4 !important;
    background: rgba(94,234,212,0.05) !important;
  }

  .prediction-console .pc-model-card .pc-model-accuracy {
    margin-top: 14px;
  }

  .prediction-console .pc-model-card:active,
  .prediction-console button:active {
    transform: scale(.97);
  }

  .prediction-console .pc-choice-card.is-selected {
    animation: pulseBorder 2.5s infinite;
  }

  .prediction-console .pc-choice-card.is-selected::after {
    content: "";
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 0;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #5eead4, #38bdf8);
  }

  .prediction-console .pc-model-accuracy {
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    overflow: hidden;
    margin-top: 18px;
  }

  .prediction-console .pc-model-accuracy span {
    display: block;
    height: 100%;
    width: var(--accuracy-width);
    border-radius: inherit;
    background: var(--accuracy-color);
    transition: width .8s cubic-bezier(0.34,1,0.64,1);
  }

  .prediction-console .pc-number-input,
  .prediction-console .pc-field-input {
    font-family: var(--font-mono);
    background: rgba(255,255,255,0.04) !important;
  }

  .prediction-console .pc-number-input:focus,
  .prediction-console .pc-field-input:focus {
    border-color: #5eead4 !important;
  }

  .prediction-console .primary-action .action-arrow {
    display: inline-block;
    transition: transform .2s ease;
  }

  .prediction-console .primary-action:hover .action-arrow {
    transform: translateX(4px);
  }

  .prediction-console .pc-result-score {
    font-family: var(--font-display);
    font-size: 64px;
    line-height: .9;
  }

  .prediction-console .pc-result-fill {
    height: 10px;
    width: var(--risk-width);
    border-radius: 999px;
    background: linear-gradient(90deg, #5eead4, #38bdf8, #fb7185);
    transition: width .8s cubic-bezier(0.34,1,0.64,1);
  }

  .prediction-console .progressive-status {
    border: 1px solid rgba(94,234,212,.20);
    border-radius: 18px;
    padding: 13px 14px;
    background: rgba(2,6,23,.42);
  }

  .prediction-console .progressive-status > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #dbeafe;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .prediction-console .progressive-status progress {
    width: 100%;
    height: 8px;
    overflow: hidden;
    border: 0;
    border-radius: 999px;
    background: rgba(148,163,184,.16);
  }

  .prediction-console .progressive-status progress::-webkit-progress-bar {
    background: rgba(148,163,184,.16);
    border-radius: 999px;
  }

  .prediction-console .progressive-status progress::-webkit-progress-value {
    background: linear-gradient(90deg, #5eead4, #38bdf8);
    border-radius: 999px;
  }

  .prediction-console .prediction-processing-card {
    width: min(640px, 100%);
    margin: 20px auto 0;
    border: 1px solid rgba(94,234,212,.22);
    border-radius: 22px;
    background:
      radial-gradient(circle at 18% 0%, rgba(94,234,212,.12), transparent 38%),
      linear-gradient(180deg, rgba(15,23,42,.78), rgba(2,6,23,.58));
    box-shadow: 0 24px 70px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05);
    backdrop-filter: blur(18px);
    padding: 18px;
    animation: processingIn 220ms cubic-bezier(0.22,1,0.36,1) both;
  }

  .prediction-console .processing-top-row,
  .prediction-console .processing-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .prediction-console .processing-top-row {
    justify-content: center;
  }

  .prediction-console .processing-title {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #f8fafc;
    font-size: 14px;
    font-weight: 900;
  }

  .prediction-console .processing-icon {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: #5eead4;
    background: rgba(94,234,212,.10);
    box-shadow: 0 0 28px rgba(94,234,212,.18);
  }

  .prediction-console .prediction-processing-card.is-complete .processing-icon {
    color: #06111f;
    background: linear-gradient(135deg, #5eead4, #38bdf8);
  }

  .prediction-console .processing-step {
    color: #94a3b8;
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
  }

  .prediction-console .processing-middle {
    display: grid;
    gap: 6px;
    padding: 18px 2px 16px;
    text-align: center;
  }

  .prediction-console .processing-task {
    color: #dffcf8;
    font-size: 18px;
    font-weight: 950;
    letter-spacing: 0;
    animation: stageFade 240ms cubic-bezier(0.22,1,0.36,1) both;
  }

  .prediction-console .processing-message {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.55;
  }

  .prediction-console .processing-percent {
    color: #f8fafc;
    font-size: 20px;
    font-weight: 950;
  }

  .prediction-console .processing-track {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(28px, 1fr));
    gap: 6px;
    max-width: 250px;
  }

  .prediction-console .processing-segment {
    height: 4px;
    border-radius: 999px;
    background: rgba(148,163,184,.18);
    overflow: hidden;
  }

  .prediction-console .processing-segment::after {
    content: "";
    display: block;
    height: 100%;
    width: var(--segment-fill, 0%);
    border-radius: inherit;
    background: linear-gradient(90deg, #5eead4, #38bdf8);
    box-shadow: 0 0 18px rgba(94,234,212,.22);
    transition: width 260ms cubic-bezier(0.22,1,0.36,1);
  }

  .prediction-console .processing-pulse {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #5eead4;
    box-shadow: 0 0 0 0 rgba(94,234,212,.32);
    animation: processingPulse 1.5s ease-in-out infinite;
  }

  .prediction-console .prediction-processing-card.is-complete .processing-pulse {
    animation: none;
    background: #38bdf8;
    box-shadow: 0 0 18px rgba(56,189,248,.38);
  }

  .prediction-console .progressive-spinner {
    animation: spin 900ms linear infinite;
  }

  .prediction-console .pc-loaded-card {
    align-items: center;
    background: rgba(255,255,255,0.05) !important;
    border-color: rgba(255,255,255,0.10) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
    overflow: visible;
  }

  .prediction-console .pc-loaded-file-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 16px;
    color: #eaf2ff;
    border: 1px solid rgba(220,231,245,.14);
    background: rgba(255,255,255,.035);
    backdrop-filter: blur(12px);
    box-shadow: none;
  }

  .prediction-console .pc-loaded-card strong {
    display: block;
    color: #fff;
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
  }

  .prediction-console .pc-loaded-card .pc-rows-label {
    display: block;
    margin-top: 4px;
    color: rgba(234,242,255,0.65);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .prediction-console .slr-cta-btn,
  .prediction-console .primary-action {
    min-height: 52px !important;
    height: 52px !important;
    width: fit-content !important;
    max-width: 100% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    border-radius: 16px !important;
    border: 1px solid transparent !important;
    padding: 0 28px !important;
    background: linear-gradient(135deg, #5EEAD4 0%, #38BDF8 100%) !important;
    color: #06111F !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    letter-spacing: -0.01em !important;
    box-shadow: 0 10px 22px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06) !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }

  .prediction-console .pc-row-count-number {
    font-size: 24px !important;
    color: #fff !important;
    font-weight: 800 !important;
  }

  .prediction-console .slr-cta-btn:hover:not(:disabled),
  .prediction-console .primary-action:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    border-color: rgba(94,234,212,0.34) !important;
    background: linear-gradient(135deg, #5EEAD4 0%, #38BDF8 100%) !important;
    box-shadow: 0 16px 34px rgba(94,234,212,0.18), inset 0 1px 0 rgba(255,255,255,0.18) !important;
  }

  .prediction-console .slr-cta-btn:active:not(:disabled),
  .prediction-console .primary-action:active:not(:disabled) {
    transform: scale(.98) !important;
  }

  .prediction-console .slr-cta-btn:disabled,
  .prediction-console .primary-action:disabled {
    opacity: .45 !important;
    filter: saturate(.65) !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .prediction-console .pc-outlined-file-icon svg,
  .prediction-console .pc-loaded-file-icon svg {
    color: #EAF2FF;
    stroke: #EAF2FF;
    fill: none;
  }

  .prediction-console .pc-outlined-file-icon,
  .prediction-console .pc-loaded-file-icon {
    background: rgba(255,255,255,0.035) !important;
    border-color: rgba(220,231,245,0.14) !important;
    box-shadow: none !important;
    filter: none !important;
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes pulseBorder {
    0%, 100% { box-shadow: 0 0 0 0 rgba(94,234,212,0); }
    50% { box-shadow: 0 0 0 4px rgba(94,234,212,0.15); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes processingIn {
    from { opacity: 0; transform: translateY(8px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes stageFade {
    from { opacity: .55; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes processingPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(94,234,212,.26); }
    50% { box-shadow: 0 0 0 7px rgba(94,234,212,0); }
  }

  @media (max-width: 900px) {
    .prediction-console .pc-result-footer {
      grid-template-columns: 1fr !important;
    }
    .prediction-console .pc-result-footer-right {
      justify-content: stretch !important;
    }
    .prediction-console .pc-result-footer > button,
    .prediction-console .pc-result-footer .slr-cta-btn {
      width: 100% !important;
    }
  }

  @media (max-width: 640px) {
    .prediction-console .pc-loaded-card {
      flex-direction: column;
      align-items: flex-start !important;
    }
    .prediction-console .slr-cta-btn,
    .prediction-console .primary-action {
      width: 100% !important;
    }
    .prediction-console .prediction-processing-card {
      width: 100%;
    }
    .prediction-console .processing-top-row,
    .prediction-console .processing-bottom-row {
      align-items: flex-start;
    }
    .prediction-console .processing-bottom-row {
      flex-direction: column;
    }
    .prediction-console .processing-track {
      width: 100%;
      max-width: none;
    }
    .prediction-console .pc-export-panel {
      grid-template-columns: 1fr !important;
      justify-items: stretch !important;
    }
    .prediction-console .pc-export-actions {
      justify-content: stretch !important;
    }
    .prediction-console .pc-export-actions button {
      flex: 1 1 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prediction-console *,
    .prediction-console *::before,
    .prediction-console *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

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
  imd_band: "",
};

const featureGroups = [
  {
    id: "academic",
    label: "Academic Performance",
    hint: "Assessment strength and submission behavior",
    color: LOW_RISK_COLOR,
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
    color: "#60a5fa",
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
    color: "#38bdf8",
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
      {
        name: "imd_band",
        label: "IMD Band",
        type: "select",
        options: ["", "0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%", "Unknown"],
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

function cleanImportedRows(rows) {
  return rows
    .map((row, index) => ({ row_number: row.row_number || index + 1, ...row }))
    .filter((row) => Object.keys(row || {}).some((key) => row[key] !== null && row[key] !== undefined && row[key] !== ""));
}

function buildPredictionExportRows({ formData, uploadedRows, batchResults, prediction }) {
  if (formData.inputMethod === INPUT_METHODS.file && uploadedRows.length && batchResults.length) {
    return uploadedRows.map((row, index) => {
      const result = batchResults[index] || {};
      return enrichPredictionRow(row, result, formData.selectedModel);
    });
  }
  if (formData.inputMethod === INPUT_METHODS.manual && prediction) {
    return [enrichPredictionRow(buildFeatures(formData), prediction, formData.selectedModel)];
  }
  return [];
}

function enrichPredictionRow(row, result, selectedModel) {
  const riskScore = Number(result.riskScore ?? result.risk_score ?? 0);
  const level = result.level || predictionLevelFromRisk(riskScore);
  return {
    ...row,
    predicted_target: targetFromLevel(level, riskScore),
    prediction_level: level,
    predicted_risk_score: riskScore,
    prediction_confidence: result.confidence ?? "",
    selected_model: selectedModel === "model_25" ? "25_percent" : "50_percent",
  };
}

function targetFromLevel(level, riskScore) {
  const normalized = String(level || "").toLowerCase();
  if (normalized.includes("high") || normalized.includes("medium") || riskScore >= 40) return "at_risk";
  return "lower_risk";
}

function predictionLevelFromRisk(riskScore) {
  if (riskScore >= 70) return "High Risk";
  if (riskScore >= 40) return "Medium Risk";
  return "Low Risk";
}

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

function riskPillStyle(level, riskScore) {
  const score = Number(riskScore);
  const normalized = String(level || predictionLevelFromRisk(score)).toLowerCase();
  if (normalized.includes("high") || score >= 70) return styles.highRiskPill;
  if (normalized.includes("medium") || score >= 40) return styles.mediumRiskPill;
  return styles.lowRiskPill;
}

function formatModelName(selectedModel) {
  return selectedModel === "model_25" ? "25% Random Forest" : "50% Random Forest";
}

const calculateRate = (part, total) => {
  if (!total || total <= 0) return 0;
  return (part / total) * 100;
};

function isAtRiskPrediction(row) {
  const target = String(row?.predicted_target || row?.target || "").toLowerCase();
  const level = String(row?.level || row?.prediction_level || "").toLowerCase();
  const score = toNumber(row?.riskScore ?? row?.risk_score ?? row?.predicted_risk_score);
  if (target.includes("lower")) return false;
  if (target.includes("at_risk") || target.includes("at risk")) return true;
  return level.includes("high") || level.includes("medium") || score >= 40;
}

function formatPercent(value, digits = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return (0).toFixed(digits);
  return parsed.toFixed(digits);
}

function formatApproxPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0%";
  return `${Math.round(parsed)}%`;
}

const formatRate = formatPercent;

const VLE_ACTIVITY_FIELDS = [
  { key: "homepage", label: "Homepage", color: LOW_RISK_COLOR },
  { key: "oucontent", label: "Oucontent", color: "#38bdf8" },
  { key: "forumng", label: "Forumng", color: "#fb7185" },
  { key: "resource", label: "Resource", color: "#60a5fa" },
  { key: "subpage", label: "Subpage", color: "#a78bfa" },
  { key: "quiz", label: "Quiz", color: "#5eead4" },
  { key: "url", label: "Url", color: "#60a5fa" },
];

const DEMOGRAPHIC_GROUPS = [
  { title: "Gender", keys: ["gender"], fallback: "Unknown", color: LOW_RISK_COLOR },
  { title: "Age band", keys: ["age_band"], fallback: "Unknown", color: "#38bdf8" },
  { title: "Education", keys: ["highest_education"], fallback: "Unknown", color: "#60a5fa" },
  { title: "IMD band", keys: ["imd_band"], fallback: "Unknown", color: "#a78bfa" },
];

function downloadRowsAsCsv(rows, fileName) {
  downloadText(Papa.unparse(rows), fileName, "text/csv;charset=utf-8");
}

function downloadRowsAsJson(rows, fileName) {
  downloadText(JSON.stringify(rows, null, 2), fileName, "application/json;charset=utf-8");
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

export default function PredictWizard() {
  const [urlState, setUrlState] = useUrlState({ tab: "input", model: "model_25", input: INPUT_METHODS.manual });
  const { notify } = useToast();
  const { track } = useAnalytics();
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
  const [uploadProgress, setUploadProgress] = useState({ visible: false, stage: "", percent: 0 });
  const [operationStage, setOperationStage] = useState("");
  const [processingResult, setProcessingResult] = useState(null);
  const [exportStage, setExportStage] = useState("");
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    const tabIndex = STEP_TABS.indexOf(urlState.tab);
    if (tabIndex >= 0 && tabIndex !== step) setStep(tabIndex);
  }, [step, urlState.tab]);

  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      if (urlState.model && ["model_25", "model_50"].includes(urlState.model)) next.selectedModel = urlState.model;
      if (urlState.input && Object.values(INPUT_METHODS).includes(urlState.input)) next.inputMethod = urlState.input;
      return next.selectedModel === prev.selectedModel && next.inputMethod === prev.inputMethod ? prev : next;
    });
  }, [urlState.input, urlState.model]);

  useEffect(() => {
    let alive = true;
    apiFetch("/health")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (alive && Array.isArray(data?.models)) setAvailableModels(data.models);
      })
      .catch(() => {
        if (alive) setAvailableModels([]);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!availableModels.length || availableModels.includes(formData.selectedModel)) return;
    const nextModel = availableModels[0];
    setFormData((prev) => ({ ...prev, selectedModel: nextModel }));
    setUrlState({ model: nextModel });
  }, [availableModels, formData.selectedModel, setUrlState]);

  const filledCount = useMemo(
    () => Object.entries(formData).filter(([key, value]) => !["selectedModel", "inputMethod"].includes(key) && value !== "").length,
    [formData]
  );
  const totalFeatures = 17;
  const progressPercent = Math.round((filledCount / totalFeatures) * 100);
  const isDirty = filledCount > 0 || uploadedRows.length > 0 || batchResults.length > 0 || Boolean(prediction) || formData.inputMethod !== INPUT_METHODS.manual || formData.selectedModel !== "model_25";
  const sessionSnapshot = useMemo(
    () => ({
      step,
      formData,
      uploadedRows: uploadedRows.slice(0, 2000),
      batchResults: batchResults.slice(0, 2000),
      prediction,
      files: files.map((file) => ({ name: file.name, size: file.size || 0 })),
    }),
    [batchResults, files, formData, prediction, step, uploadedRows]
  );

  useUnsavedChanges("prediction-console", isDirty);
  const recovery = usePersistentDraft("slr:draft:prediction-console", sessionSnapshot, {
    enabled: isDirty,
    onRestore: (draft) => {
      const restoredStep = Number.isInteger(draft.step) ? draft.step : 0;
      setFormData({ ...initialFormData, ...(draft.formData || {}) });
      setUploadedRows(Array.isArray(draft.uploadedRows) ? draft.uploadedRows : []);
      setBatchResults(Array.isArray(draft.batchResults) ? draft.batchResults : []);
      setPrediction(draft.prediction || null);
      setFiles(Array.isArray(draft.files) ? draft.files : []);
      setStep(restoredStep);
      setUrlState({ tab: STEP_TABS[restoredStep], model: draft.formData?.selectedModel, input: draft.formData?.inputMethod });
      notify({ title: "Previous session restored", tone: "success" });
    },
  });

  const goToStep = (nextStep) => {
    setStep(nextStep);
    setUrlState({ tab: STEP_TABS[nextStep] });
  };

  const showProcessingStage = async (stage, delay = 260) => {
    setOperationStage(stage);
    await wait(delay);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    track("Filter Applied", { field: name });
  };

  const parseUploadedFile = async (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv")) {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
      if (result.errors?.length) throw new Error(result.errors.slice(0, 2).map((error) => error.message).join(" | "));
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
  };

  const addFiles = async (incomingFiles) => {
    const selected = Array.from(incomingFiles || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected]);
    setFileError("");
    setUploadedRows([]);
    setBatchResults([]);
    setUploadProgress({ visible: true, stage: "Uploading dataset...", percent: 12 });
    try {
      const supported = selected.find((file) => /\.(csv|json|xlsx|xls)$/i.test(file.name));
      if (!supported) throw new Error("Please upload CSV, Excel (.xlsx/.xls), or JSON data for batch prediction.");
      setUploadProgress({ visible: true, stage: "Reading file...", percent: 35 });
      const rows = await parseUploadedFile(supported);
      setUploadProgress({ visible: true, stage: "Processing rows...", percent: 72 });
      if (!rows.length) throw new Error("No student records found. Upload a valid dataset to continue.");
      setUploadedRows(rows);
      setUploadProgress({ visible: true, stage: "Dataset ready", percent: 100 });
      notify({ title: "Dataset uploaded", message: `${rows.length} student records loaded.`, tone: "success" });
      track("Dataset Uploaded", { rows: rows.length, fileType: supported.name.split(".").pop() });
      window.setTimeout(() => setUploadProgress((prev) => ({ ...prev, visible: false })), 900);
    } catch (error) {
      setFileError(error.message || "Could not parse this file. Please check the format.");
      setUploadProgress({ visible: false, stage: "", percent: 0 });
      notify({ title: "Error loading dataset", message: error.message || "Could not parse this file.", tone: "error" });
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.length) { setUploadedRows([]); setBatchResults([]); setFileError(""); }
      return next;
    });
  };

  const resetWorkflow = () => {
    setStep(0);
    setUrlState({ tab: STEP_TABS[0], model: "model_25", input: INPUT_METHODS.manual });
    setFormData(initialFormData);
    setPrediction(null);
    setUploadedRows([]);
    setBatchResults([]);
    setFiles([]);
    setFileError("");
    setApiError("");
    setLoading(false);
    setUploadProgress({ visible: false, stage: "", percent: 0 });
    setOperationStage("");
    setProcessingResult(null);
    setExportStage("");
    recovery.clear();
  };

  const runPrediction = async () => {
    setLoading(true);
    setApiError("");
    setProcessingResult(null);
    await showProcessingStage("Preparing dataset", 240);
    track("Prediction Started", { inputMethod: formData.inputMethod, selectedModel: formData.selectedModel });
    try {
      if (formData.inputMethod === INPUT_METHODS.file) {
        await showProcessingStage("Extracting features", 240);
        const rows = uploadedRows.map((row) => ({
          id: row.id_student || row.student_id || row.id || null,
          features: buildFeatures(row),
        }));
        await showProcessingStage("Running prediction model", 180);
        const res = await apiFetch("/predict/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: formData.selectedModel, rows }),
        });
        if (!res.ok) throw new Error(await readApiError(res));
        await showProcessingStage("Calculating risk scores", 220);
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
        const atRiskStudents = results.filter(isAtRiskPrediction).length;
        setPrediction({
          riskScore: results.reduce((s, r) => s + r.riskScore, 0) / results.length,
          level: results.some((r) => r.level === "High Risk") ? "Batch Contains High Risk" : "Batch Processed",
          confidence: results[0]?.confidence ?? 74,
        });
        await showProcessingStage("Generating results", 260);
        setProcessingResult({ totalStudents: results.length, atRiskStudents });
        await showProcessingStage("Prediction Complete", 760);
        goToStep(3);
        notify({ title: "Prediction completed", message: `${atRiskStudents} students flagged as at risk.`, tone: "success" });
        track("Prediction Completed", { mode: "batch", rows: results.length, avgRisk, atRiskStudents });
        return;
      }
      await showProcessingStage("Extracting features", 220);
      await showProcessingStage("Running prediction model", 180);
      const res = await apiFetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: formData.selectedModel, features: buildFeatures(formData) }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      await showProcessingStage("Calculating risk scores", 220);
      const data = await res.json();
      setPrediction({ riskScore: data.risk_score, level: data.level, confidence: data.confidence });
      setBatchResults([]);
      await showProcessingStage("Generating results", 260);
      setProcessingResult({ totalStudents: 1, atRiskStudents: isAtRiskPrediction(data) ? 1 : 0 });
      await showProcessingStage("Prediction Complete", 760);
      goToStep(3);
      notify({ title: "Prediction completed", message: `${isAtRiskPrediction(data) ? 1 : 0} students flagged as at risk.`, tone: "success" });
      track("Prediction Completed", { mode: "single", riskScore: data.risk_score, level: data.level });
    } catch (err) {
      setApiError(err.message || "Prediction failed. Make sure the backend is running on port 8000.");
      notify({ title: "Prediction failed", message: err.message || "Make sure the backend is running.", tone: "error" });
    } finally {
      setLoading(false);
      setOperationStage("");
      setProcessingResult(null);
    }
  };

  const canContinueFromData = formData.inputMethod === INPUT_METHODS.file ? uploadedRows.length > 0 : filledCount > 0;

  return (
    <div className="prediction-console">
      <style>{dataVisualizationCss}</style>
      <style>{predictionConsoleCss}</style>
      <RecoveryPrompt candidate={recovery.candidate} onRestore={recovery.restore} onDiscard={recovery.discard} />
      <section style={styles.card}>
        {step === 0 && (
          <StartStep
            inputMethod={formData.inputMethod}
            setInputMethod={(m) => {
              setFormData((p) => ({ ...p, inputMethod: m }));
              setUrlState({ input: m });
            }}
            onNext={() => goToStep(1)}
          />
        )}
        {step === 1 && (
          <ModelStep
            selectedModel={formData.selectedModel}
            availableModels={availableModels}
            setSelectedModel={(m) => {
              setFormData((p) => ({ ...p, selectedModel: m }));
              setUrlState({ model: m });
              track("Model Selected", { model: m });
            }}
            onBack={() => goToStep(0)}
            onNext={() => goToStep(2)}
          />
        )}
        {step === 2 && (
          <DataStep
            inputMethod={formData.inputMethod}
            setInputMethod={(m) => setFormData((p) => ({ ...p, inputMethod: m }))}
            files={files}
            uploadedRows={uploadedRows}
            fileError={fileError}
            uploadProgress={uploadProgress}
            addFiles={addFiles}
            removeFile={removeFile}
            dragOver={dragOver}
            setDragOver={setDragOver}
            formData={formData}
            handleChange={handleChange}
            filledCount={filledCount}
            totalFeatures={totalFeatures}
            progressPercent={progressPercent}
            loading={loading}
            operationStage={operationStage}
            processingResult={processingResult}
            apiError={apiError}
            onBack={() => goToStep(1)}
            onNext={runPrediction}
            canContinue={canContinueFromData}
          />
        )}
        {step === 3 && prediction && (
          <ResultsStep
            prediction={prediction}
            formData={formData}
            filledCount={filledCount}
            totalFeatures={totalFeatures}
            files={files}
            batchResults={batchResults}
            uploadedRows={uploadedRows}
            onReset={resetWorkflow}
            onBack={() => goToStep(2)}
            exportStage={exportStage}
            setExportStage={setExportStage}
          />
        )}
        {step === 3 && !prediction && (
          <EmptyResultsStep onReset={resetWorkflow} />
        )}
      </section>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function StartStep({ inputMethod, setInputMethod, onNext }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Input" title="How do you want to provide student data?" desc="Start by choosing the input path. You can either upload a dataset file or manually enter the exact model features for one student." />
      <div style={styles.choiceGrid}>
        <ChoiceCard
          active={inputMethod === INPUT_METHODS.manual}
          Icon={Keyboard}
          title="Manual Feature Input"
          desc="Enter the 17 model features directly. Best for testing a single student case."
          bullets={["Fast single prediction", "Feature-level control", "No file required"]}
          onClick={() => setInputMethod(INPUT_METHODS.manual)}
        />
        <ChoiceCard
          active={inputMethod === INPUT_METHODS.file}
          Icon={FileSpreadsheet}
          title="Upload Dataset File"
          desc="Upload CSV, Excel, or JSON data with student feature columns. Best for batch prediction."
          bullets={["Batch-ready flow", "CSV / Excel / JSON", "Backend-powered scoring"]}
          onClick={() => setInputMethod(INPUT_METHODS.file)}
        />
      </div>
      <div style={styles.navRow}>
        <div />
        <button className="primary-action slr-cta-btn" style={styles.primaryBtn} onClick={onNext}>
          Continue to Model <span className="action-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

function ModelStep({ selectedModel, availableModels, setSelectedModel, onBack, onNext }) {
  const hasModelManifest = availableModels.length > 0;
  const isModelAvailable = (model) => !hasModelManifest || availableModels.includes(model);
  const canContinue = isModelAvailable(selectedModel);

  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Model" title="Choose prediction checkpoint" desc="Select the trained model version. The 25% model is earlier but less certain, while the 50% model has richer behavior signals." />
      <div style={styles.modelGrid}>
        <ModelCard
          active={selectedModel === "model_25"}
          disabled={!isModelAvailable("model_25")}
          percent="25%"
          title="Early Detection Model"
          desc="Designed for first-quarter detection. Useful when intervention speed matters most."
          metrics={["Fastest alert", "Higher uncertainty", "Early intervention"]}
          accuracy={80}
          accuracyColor={MODEL_PROGRESS_GRADIENT}
          onClick={() => setSelectedModel("model_25")}
        />
        <ModelCard
          active={selectedModel === "model_50"}
          disabled={!isModelAvailable("model_50")}
          percent="50%"
          title="Mid-Course Model"
          desc="Uses richer academic and behavioral signals. Better for more confident prediction."
          metrics={["Stronger signal", "Higher confidence", "Better behavior context"]}
          accuracy={86}
          accuracyColor={MODEL_PROGRESS_GRADIENT}
          onClick={() => setSelectedModel("model_50")}
        />
      </div>
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <button className="primary-action slr-cta-btn" style={styles.primaryBtn} onClick={onNext} disabled={!canContinue}>
          Continue to Data <span className="action-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

function DataStep(props) {
  const { inputMethod, files, uploadedRows, fileError, uploadProgress, addFiles, removeFile, dragOver, setDragOver, formData, handleChange, filledCount, totalFeatures, progressPercent, loading, operationStage, processingResult, apiError, onBack, onNext, canContinue } = props;
  const selectedPath = inputMethod === INPUT_METHODS.file ? "File Upload" : "Manual Feature Input";
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Data" title="Provide the prediction data" desc={`Using the ${selectedPath} path selected in the input stage.`} />
      <div style={{ ...styles.previewBox, marginBottom: 22 }}>
        <div style={styles.resultLabel}>Selected Input</div>
        <h3 style={{ ...styles.previewTitle, marginBottom: 6 }}>{selectedPath}</h3>
        <p style={{ ...styles.resultText, margin: 0 }}>
          Go back to the input stage if you want to change the input path. This keeps the workflow clean and prevents accidental switching before prediction.
        </p>
      </div>
      {inputMethod === INPUT_METHODS.file
        ? <UploadPanel files={files} uploadedRows={uploadedRows} fileError={fileError} uploadProgress={uploadProgress} addFiles={addFiles} removeFile={removeFile} dragOver={dragOver} setDragOver={setDragOver} />
        : <ManualFeaturePanel formData={formData} handleChange={handleChange} filledCount={filledCount} totalFeatures={totalFeatures} progressPercent={progressPercent} />
      }
      {apiError && (
        <div style={{ ...styles.fileError, marginTop: 18 }}>
          <div>{apiError}</div>
          <button type="button" className="slr-cta-btn" style={{ ...styles.primaryBtn, marginTop: 14 }} onClick={onNext}>Retry</button>
        </div>
      )}
      {loading && <PredictionProcessingCard stage={operationStage || "Preparing dataset"} result={processingResult} />}
      <div style={styles.navRow}>
        <button style={styles.secondaryBtn} onClick={onBack} disabled={loading}>← Back</button>
        <button className="slr-cta-btn" style={styles.primaryBtn} disabled={!canContinue || loading} onClick={onNext}>
          {loading ? "Running..." : "Run Prediction"}
        </button>
      </div>
    </div>
  );
}

function ResultsStep({ prediction, formData, batchResults, uploadedRows, onReset, onBack, exportStage, setExportStage }) {
  const exportRows = useMemo(
    () => buildPredictionExportRows({ formData, uploadedRows, batchResults, prediction }),
    [formData, uploadedRows, batchResults, prediction]
  );
  const analytics = useMemo(
    () => buildPredictionAnalytics({ prediction, formData, uploadedRows, batchResults }),
    [prediction, formData, uploadedRows, batchResults]
  );
  const sourceRows = uploadedRows.length ? uploadedRows : [buildFeatures(formData)];
  const risk = analytics.averageRiskScore;
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Model Output" title="Prediction EDA Dashboard" desc="Notebook-style model output: cohort risk, score/activity signals, and intervention priorities." />
      <div style={styles.resultHero}>
        <RiskGauge score={risk} level={analytics.headline} analytics={analytics} />
        <div style={styles.resultSummary}>
          <div style={styles.resultLabel}>Prediction Summary</div>
          <h2 style={styles.resultTitle}>{analytics.summaryTitle}</h2>
          <p style={styles.resultText}>
            {analytics.narrative}
          </p>
          <div style={styles.resultStatsRow}>
            <SummaryMetric label="Total Students" value={analytics.totalStudents} color="#60a5fa" />
            <SummaryMetric label="At-Risk Students" value={analytics.atRiskStudents} color="#fb7185" />
            <SummaryMetric label="At-Risk Rate" value={`${analytics.atRiskRateLabel}%`} color="#38bdf8" />
            <SummaryMetric label="Lower-Risk Rate" value={`${analytics.lowerRiskRateLabel}%`} color="#5eead4" />
            <SummaryMetric label="Model" value={formatModelName(formData.selectedModel)} color="#a78bfa" />
          </div>
        </div>
      </div>
      <DashboardSection eyebrow="Input Context" title="Activity and profile signals" desc="A clean read of the uploaded batch before reviewing model-risk charts.">
        <div style={styles.contextGrid}>
          <ChartCard title="VLE Activity Mix" subtitle="Top learning-platform activity types across the uploaded rows." badge="EDA" style={styles.contextChartCard}>
            <VleActivityMix rows={sourceRows} />
          </ChartCard>
          <ChartCard title="Demographic Profile" subtitle="Gender, age, education, and IMD context used as baseline signals." badge="EDA" style={styles.contextChartCard}>
            <DemographicProfile rows={sourceRows} />
          </ChartCard>
        </div>
      </DashboardSection>
      <RiskBandGuide analytics={analytics} />
      <DashboardSection eyebrow="Model Results" title="Risk distribution and intervention signals" desc="The charts below use the same risk-band colors, so the story stays consistent from one visual to the next.">
        <div style={styles.chartGrid}>
        <ChartCard title="Risk Tier Distribution" subtitle="Cohort split by intervention urgency, including percentages and action priority." wide><RiskTierBars analytics={analytics} /></ChartCard>
        <ChartCard title="Risk Score Distribution" subtitle="Where the predicted risk scores concentrate across low, medium, and high bands." wide><RiskHistogram rows={analytics.rows} /></ChartCard>
        <ChartCard title="Score vs Risk" subtitle="Each dot is a student. Left/top means weaker score with higher predicted risk." wide><ScoreRiskScatter rows={analytics.rows} /></ChartCard>
        <ChartCard title="Main Risk Drivers" subtitle="Higher bars mean a stronger visible intervention signal in the uploaded batch." wide><DriverBars drivers={analytics.drivers} /></ChartCard>
        </div>
      </DashboardSection>
      <InterventionPanel analytics={analytics} />
      <BatchResultsTable results={analytics.rows} />
      <div className="pc-result-footer" style={styles.resultFooter}>
        <button style={{ ...styles.secondaryBtn, ...styles.footerNavBtn }} onClick={onBack}>← Back to Data</button>
        <PredictionExportPanel rows={exportRows} inputMethod={formData.inputMethod} exportStage={exportStage} setExportStage={setExportStage} />
        <div className="pc-result-footer-right" style={styles.resultFooterRight}>
          <button className="slr-cta-btn" style={styles.primaryBtn} onClick={onReset}>Start New Prediction</button>
        </div>
      </div>
    </div>
  );
}

function EmptyResultsStep({ onReset }) {
  return (
    <div className="fade-in">
      <SectionIntro eyebrow="Model Output" title="No prediction is loaded" desc="Start a new prediction to generate model output." />
      <button className="slr-cta-btn" style={styles.primaryBtn} onClick={onReset}>Start New Prediction</button>
    </div>
  );
}

// Panel components

function buildPredictionAnalytics({ prediction, formData, uploadedRows, batchResults }) {
  const rows = batchResults.length
    ? batchResults.map((result, index) => normalizePredictionRow(result, uploadedRows[index]))
    : [normalizePredictionRow(
        {
          id: "Current student",
          riskScore: prediction.riskScore,
          level: prediction.level,
          confidence: prediction.confidence,
        },
        buildFeatures(formData)
      )];

  const count = rows.length;
  const totalStudents = count;
  const averageRiskScore = mean(rows.map((row) => row.riskScore));
  const avgRisk = Math.round(averageRiskScore);
  const highCount = rows.filter((row) => row.riskScore >= 70).length;
  const mediumCount = rows.filter((row) => row.riskScore >= 40 && row.riskScore < 70).length;
  const lowCount = rows.filter((row) => row.riskScore < 40).length;
  const atRiskStudents = rows.filter(isAtRiskPrediction).length;
  const lowerRiskStudents = totalStudents - atRiskStudents;
  const atRiskRate = calculateRate(atRiskStudents, totalStudents);
  const lowerRiskRate = calculateRate(lowerRiskStudents, totalStudents);
  const headline = atRiskRate >= 70 ? "High Cohort Risk" : atRiskRate >= 40 ? "Elevated Cohort Risk" : "Lower Cohort Risk";
  const summaryTitle = count > 1
    ? atRiskRate >= 70
      ? "High At-Risk Cohort"
      : atRiskRate >= 40
      ? "Mixed-Risk Cohort Review"
      : "Lower-Risk Cohort Review"
    : rows[0]?.level || prediction.level;
  const drivers = buildPredictionDrivers(rows);
  const topDriver = drivers[0]?.label?.toLowerCase() || "combined model signals";
  const narrative = count > 1
    ? `${atRiskStudents} of ${totalStudents} students are currently classified as at risk (${formatPercent(atRiskRate)}%). ${sentenceCase(topDriver)} remains the strongest risk indicator across the cohort. Prioritize intervention for high-risk students first, then monitor the ${lowerRiskStudents} lower-risk students for emerging behavioral changes.`
    : singleStudentNarrative(avgRisk, topDriver);

  return {
    rows: rows.sort((a, b) => b.riskScore - a.riskScore),
    count,
    totalStudents,
    averageRiskScore,
    averageRiskScoreLabel: formatRate(averageRiskScore, 1),
    avgRisk,
    highCount,
    mediumCount,
    lowCount,
    atRiskCount: atRiskStudents,
    atRiskStudents,
    lowerRiskStudents,
    atRiskRate,
    atRiskRateLabel: formatRate(atRiskRate),
    lowerRiskRate,
    lowerRiskRateLabel: formatRate(lowerRiskRate),
    headline,
    summaryTitle,
    narrative,
    drivers,
  };
}

function normalizePredictionRow(result, source = {}) {
  const riskScore = Math.round(toNumber(result.riskScore ?? result.risk_score ?? result.predicted_risk_score));
  const level = result.level || predictionLevelFromRisk(riskScore);
  return {
    id: result.id || source.id_student || source.student_id || source.id || source.row_number || "Student",
    riskScore,
    level,
    confidence: Math.round(toNumber(result.confidence ?? result.prediction_confidence ?? 0)),
    avgScore: toNumber(result.avgScore ?? source.avg_score_until_cutoff ?? source.avg_score ?? source.score),
    activeDays: toNumber(result.activeDays ?? source.arab_active_days_equivalent_until_cutoff ?? source.active_days_until_cutoff ?? source.total_active_days),
    submissions: toNumber(result.submissions ?? source.submitted_assessments_until_cutoff ?? source.submitted_assessments),
    delay: toNumber(source.avg_submission_delay_arab_days_until_cutoff ?? source.avg_submission_delay ?? 0),
    clicksPerDay: toNumber(source.clicks_per_active_day_until_cutoff ?? source.clicks_per_active_day ?? 0),
  };
}

function buildPredictionDrivers(rows) {
  const avgScore = mean(rows.map((row) => row.avgScore).filter((value) => value > 0));
  const avgActive = mean(rows.map((row) => row.activeDays).filter((value) => value > 0));
  const avgSubmissions = mean(rows.map((row) => row.submissions).filter((value) => value >= 0));
  const avgDelay = mean(rows.map((row) => row.delay));
  const avgClicks = mean(rows.map((row) => row.clicksPerDay).filter((value) => value > 0));

  return [
    { label: "Assessment weakness", value: clamp(100 - avgScore, 0, 100), detail: `Average score: ${formatMetric(avgScore)}`, meaning: "Scores are lower than expected, so academic support may matter more than activity nudges." },
    { label: "Engagement gap", value: clamp(100 - (avgActive / 35) * 100, 0, 100), detail: `Active days: ${formatMetric(avgActive)}`, meaning: "Students are not showing up consistently in the learning environment." },
    { label: "Submission gap", value: clamp(100 - (avgSubmissions / 5) * 100, 0, 100), detail: `Submitted assessments: ${formatMetric(avgSubmissions)}`, meaning: "Few submitted assessments suggest missing work or weak course participation." },
    { label: "Delay pressure", value: clamp(avgDelay * 10, 0, 100), detail: `Avg delay: ${formatMetric(avgDelay)} days`, meaning: "Late submissions increase concern even when some work is completed." },
    { label: "Click intensity gap", value: clamp(100 - (avgClicks / 15) * 100, 0, 100), detail: `Clicks per active day: ${formatMetric(avgClicks)}`, meaning: "Low click depth can mean students visit briefly without meaningful study activity." },
  ]
    .filter((driver) => Number.isFinite(driver.value))
    .sort((a, b) => b.value - a.value);
}

function singleStudentNarrative(risk, topDriver) {
  if (risk >= 70) return `This student is in the high-risk band. The clearest visible driver is ${topDriver}, so the next step should be immediate academic follow-up.`;
  if (risk >= 40) return `This student is in the medium-risk band. The clearest visible driver is ${topDriver}, so close monitoring and proactive outreach are recommended.`;
  return "This student is in the lower-risk band. Keep the record visible, but no urgent intervention is suggested by the current model output.";
}

function RiskTierBars({ analytics }) {
  const data = [
    { label: "High Risk", count: analytics.highCount, color: "#fb7185", action: "Immediate outreach", range: "70-100" },
    { label: "Medium Risk", count: analytics.mediumCount, color: "#38bdf8", action: "Monitor this week", range: "40-69" },
    { label: "Low Risk", count: analytics.lowCount, color: "#5eead4", action: "Normal follow-up", range: "0-39" },
  ];
  const total = Math.max(analytics.count, 1);
  const atRiskPct = formatRate(calculateRate(analytics.atRiskStudents, total));
  return (
    <div>
      <div style={styles.tierHeroGrid}>
        <div style={styles.tierTotalCard}>
          <span style={styles.statLabel}>Intervention Band</span>
          <strong style={styles.tierTotalValue}>{analytics.atRiskStudents}/{analytics.totalStudents}</strong>
          <p style={styles.tierTotalText}>{atRiskPct}% of students need medium or high priority review.</p>
        </div>
        <div style={styles.tierStackWrap}>
          <div style={styles.tierStackBar}>
            {data.map((item) => (
              <div
                key={item.label}
                title={`${item.label}: ${item.count}`}
                style={{
                  width: `${Math.max(analytics.count ? (item.count / analytics.count) * 100 : 0, item.count ? 7 : 0)}%`,
                  background: item.color,
                  boxShadow: `0 0 22px ${item.color}44`,
                }}
              />
            ))}
          </div>
          <div style={styles.chartLegendRow}>
            <span style={styles.legendHelp}>The stacked colors follow the Risk Band Guide above. Wider color sections mean more students in that priority band.</span>
          </div>
        </div>
      </div>
      <div style={styles.reviewOrderBox}>
        <div>
          <span style={styles.statLabel}>Recommended Review Order</span>
          <h4 style={styles.reviewOrderTitle}>Start where intervention can change the outcome fastest</h4>
        </div>
        <div style={styles.reviewOrderGrid}>
          <ReviewOrderStep step="1" title="High risk first" detail={`${analytics.highCount} students need immediate academic outreach.`} color="#fb7185" />
          <ReviewOrderStep step="2" title="Medium + weak score" detail="Prioritize medium-risk students whose scores are already slipping." color="#38bdf8" />
          <ReviewOrderStep step="3" title="Medium + weak engagement" detail="Review students with low active days or light click activity." color="#60a5fa" />
          <ReviewOrderStep step="4" title="Low risk monitoring" detail={`${analytics.lowCount} students stay on normal follow-up.`} color="#5eead4" />
        </div>
      </div>
    </div>
  );
}

function VleActivityMix({ rows }) {
  const data = useMemo(
    () => VLE_ACTIVITY_FIELDS.map((field) => ({
      ...field,
      value: rows.reduce((sum, row) => sum + toNumber(row[field.key]), 0),
    }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value),
    [rows]
  );

  if (!data.length) return <EmptyResultChart message="No VLE activity columns were available." />;

  const max = Math.max(...data.map((item) => item.value), 1);
  const totalClicks = data.reduce((sum, item) => sum + item.value, 0);
  const topActivity = data[0];
  return (
    <div style={styles.edaPanelWrap}>
      <div style={styles.edaStatStrip}>
        <MiniInsight label="Total Clicks" value={formatMetric(totalClicks)} color={LOW_RISK_COLOR} />
        <MiniInsight label="Top Activity" value={topActivity.label} color={topActivity.color} />
        <MiniInsight label="Activity Types" value={data.length} color="#60a5fa" />
      </div>
      <ActivityPlotlyChart data={data} max={max} />
    </div>
  );
}

function ActivityPlotlyChart({ data, max }) {
  const chartRef = useRef(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let plotlyInstance = null;
    const chartElement = chartRef.current;

    import("plotly.js-dist-min")
      .then((plotlyModule) => {
        if (cancelled || !chartElement) return;
        const Plotly = plotlyModule.default || plotlyModule;
        plotlyInstance = Plotly;
        setLoadError("");
        Plotly.newPlot(
          chartElement,
          [
            {
              type: "bar",
              orientation: "h",
              y: data.map((item) => item.label).reverse(),
              x: data.map((item) => item.value).reverse(),
              marker: {
                color: data.map((item) => item.color).reverse(),
                line: { color: "rgba(255,255,255,.18)", width: 1 },
              },
              text: data.map((item) => `${formatMetric(item.value)} clicks`).reverse(),
              textposition: "outside",
              textfont: { color: "#cbd5e1", size: 12, family: "Inter, Segoe UI, Arial" },
              hovertemplate: "<b>%{y}</b><br>%{x:,} clicks<extra></extra>",
              cliponaxis: false,
            },
          ],
          {
            autosize: true,
            height: 315,
            margin: { l: 112, r: 96, t: 12, b: 42 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(2,6,23,.28)",
            bargap: 0.34,
            xaxis: {
              title: { text: "Total clicks", font: { color: "#94a3b8", size: 12 } },
              range: [0, max * 1.22],
              showgrid: true,
              gridcolor: "rgba(148,163,184,.12)",
              zeroline: false,
              tickfont: { color: "#64748b", size: 11 },
            },
            yaxis: {
              tickfont: { color: "#e2e8f0", size: 12, family: "Inter, Segoe UI, Arial" },
              automargin: true,
            },
            hoverlabel: {
              bgcolor: "#0f172a",
              bordercolor: "rgba(94,234,212,.35)",
              font: { color: "#f8fafc", family: "Inter, Segoe UI, Arial" },
            },
          },
          {
            displayModeBar: false,
            responsive: true,
          }
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError("Interactive chart could not load. Showing static activity view.");
      });

    return () => {
      cancelled = true;
      if (plotlyInstance && chartElement) plotlyInstance.purge(chartElement);
    };
  }, [data, max]);

  if (loadError) return <StaticActivityBars data={data} max={max} message={loadError} />;

  return <div ref={chartRef} style={styles.plotlyChart} />;
}

function StaticActivityBars({ data, max, message }) {
  return (
    <div>
      {message && <div style={styles.plotlyFallbackNote}>{message}</div>}
      <div style={styles.vleMixList}>
        {data.map((item) => (
          <div key={item.key} style={styles.vleMixRow}>
            <span style={styles.vleMixLabel}>{item.label}</span>
            <div style={styles.vleMixTrack}>
              <div
                style={{
                  ...styles.vleMixFill,
                  width: `${Math.max((item.value / max) * 100, 4)}%`,
                  background: `linear-gradient(90deg, ${item.color}, #38bdf8)`,
                  boxShadow: `0 0 22px ${item.color}44`,
                }}
              />
            </div>
            <strong style={styles.vleMixValue}>{formatMetric(item.value)} clicks</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemographicProfile({ rows }) {
  const groups = DEMOGRAPHIC_GROUPS.map((group) => ({
    ...group,
    values: countCategoricalValues(rows, group.keys, group.fallback).slice(0, 4),
  }));

  if (!rows.length) return <EmptyResultChart message="No demographic rows were available." />;

  return (
    <div style={styles.demographicGrid}>
      {groups.map((group) => {
        const max = Math.max(...group.values.map((item) => item.count), 1);
        return (
          <div key={group.title} style={styles.demographicCard}>
            <h4 style={styles.demographicTitle}>{group.title}</h4>
            <div style={styles.demographicRows}>
              {group.values.map((item) => (
                <div key={`${group.title}-${item.label}`} style={styles.demographicRow}>
                  <span title={item.label} style={styles.demographicLabel}>{trimLabel(item.label)}</span>
                  <div style={styles.demographicTrack}>
                    <div
                      style={{
                        ...styles.demographicFill,
                        width: `${Math.max((item.count / max) * 100, 8)}%`,
                        background: `linear-gradient(90deg, ${group.color}, #38bdf8)`,
                      }}
                    />
                  </div>
                  <strong style={styles.demographicValue}>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RiskHistogram({ rows }) {
  const bins = Array.from({ length: 10 }, (_, index) => ({ label: `${index * 10}-${(index + 1) * 10}`, count: 0 }));
  rows.forEach((row) => {
    bins[Math.min(9, Math.floor(row.riskScore / 10))].count += 1;
  });
  const max = Math.max(...bins.map((bin) => bin.count), 1);
  const sorted = rows.map((row) => row.riskScore).sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const peak = bins.reduce((best, bin) => (bin.count > best.count ? bin : best), bins[0]);
  const highShare = rows.length ? Math.round((rows.filter((row) => row.riskScore >= 70).length / rows.length) * 100) : 0;
  return (
    <div>
      <div style={styles.insightSummaryGrid}>
        <MiniInsight label="Median Risk" value={`${median}%`} color={median >= 70 ? "#fb7185" : median >= 40 ? "#38bdf8" : "#5eead4"} />
        <MiniInsight label="Peak Range" value={peak.label} color="#60a5fa" />
        <MiniInsight label="High Risk Share" value={`${highShare}%`} color="#fb7185" />
      </div>
      <svg viewBox="0 0 680 285" style={{ ...styles.svgChart, height: 285 }}>
        <rect x="52" y="30" width="560" height="174" rx="18" fill="rgba(2,6,23,.25)" />
        <rect x="52" y="30" width="224" height="174" rx="18" fill="rgba(94,234,212,.06)" />
        <rect x="276" y="30" width="168" height="174" fill="rgba(56,189,248,.07)" />
        <rect x="444" y="30" width="168" height="174" rx="18" fill="rgba(251,113,133,.08)" />
        <path d="M52 204 H612" stroke="rgba(148,163,184,.25)" />
        <path d="M276 30 V204 M444 30 V204" stroke="rgba(148,163,184,.16)" strokeDasharray="6 8" />
        <text x="270" y="222" fill="#94a3b8" fontSize="11">40</text>
        <text x="438" y="222" fill="#94a3b8" fontSize="11">70</text>
        {bins.map((bin, index) => {
          const h = Math.max(bin.count ? 8 : 0, (bin.count / max) * 132);
          const x = 68 + index * 52;
          const color = index >= 7 ? "#fb7185" : index >= 4 ? "#38bdf8" : "#5eead4";
          return (
            <g key={bin.label}>
              <rect x={x} y={204 - h} width="34" height={h} rx="10" fill={color} opacity=".95" />
              <rect x={x} y={204 - h} width="34" height={h} rx="10" fill={`url(#riskGlow${index})`} opacity=".22" />
              <text x={x + 17} y="228" textAnchor="middle" fill="#64748b" fontSize="11">{index * 10}</text>
              {bin.count > 0 && <text x={x + 17} y={Math.max(22, 194 - h)} textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">{bin.count}</text>}
              <defs>
                <linearGradient id={`riskGlow${index}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor={color} />
                </linearGradient>
              </defs>
            </g>
          );
        })}
        <text x="52" y="257" fill="#64748b" fontSize="12">Buckets use the same colors as the guide above. The vertical markers show the 40 and 70 thresholds.</text>
      </svg>
      <div style={styles.chartLegendRow}>
        <span style={styles.legendHelp}>Tall bars toward the right mean more urgent concentration. Middle-range bars mean students can still be moved back with early support.</span>
      </div>
    </div>
  );
}

function ScoreRiskScatter({ rows }) {
  const points = rows.filter((row) => row.avgScore > 0).slice(0, 80);
  if (!points.length) return <EmptyResultChart message="No assessment score values were available." />;
  const avgScore = Math.round(mean(points.map((row) => row.avgScore)));
  const avgRisk = mean(points.map((row) => row.riskScore));
  const highWithLowScore = points.filter((row) => row.riskScore >= 70 && row.avgScore < 50).length;
  return (
    <div>
      <div style={styles.insightSummaryGrid}>
        <MiniInsight label="Avg Score" value={avgScore} color="#5eead4" />
        <MiniInsight label="Mean Risk" value={`${formatPercent(avgRisk)}%`} color={avgRisk >= 70 ? "#fb7185" : avgRisk >= 40 ? "#38bdf8" : "#5eead4"} />
        <MiniInsight label="High Risk + Low Score" value={highWithLowScore} color="#fb7185" />
      </div>
      <svg viewBox="0 0 640 260" style={{ ...styles.svgChart, height: 260 }}>
        <rect x="64" y="28" width="500" height="164" rx="18" fill="rgba(2,6,23,.25)" />
        <rect x="64" y="28" width="250" height="82" rx="16" fill="rgba(251,113,133,.08)" />
        <rect x="314" y="110" width="250" height="82" rx="16" fill="rgba(94,234,212,.08)" />
        <path d="M64 192 H564" stroke="rgba(148,163,184,.26)" />
        <path d="M64 28 V192" stroke="rgba(148,163,184,.26)" />
        <path d="M314 28 V192 M64 110 H564" stroke="rgba(148,163,184,.12)" strokeDasharray="5 8" />
        <text x="64" y="220" fill="#64748b" fontSize="12">0 score</text>
        <text x="502" y="220" fill="#64748b" fontSize="12">100 score</text>
        <text x="14" y="36" fill="#64748b" fontSize="12">100 risk</text>
        <text x="22" y="194" fill="#64748b" fontSize="12">0 risk</text>
        <text x="82" y="52" fill="#fb7185" fontSize="12" fontWeight="900">Priority review</text>
        <text x="420" y="178" fill="#5eead4" fontSize="12" fontWeight="900">Healthy zone</text>
        {points.map((row, index) => {
          const x = 64 + clamp(row.avgScore, 0, 100) * 5;
          const y = 192 - clamp(row.riskScore, 0, 100) * 1.64;
          const color = row.riskScore >= 70 ? "#fb7185" : row.riskScore >= 40 ? "#38bdf8" : "#5eead4";
          return (
            <g key={`${row.id}-${index}`}>
              <circle cx={x} cy={y} r="7" fill={color} opacity=".88" />
              <circle cx={x} cy={y} r="12" fill={color} opacity=".12" />
            </g>
          );
        })}
      </svg>
      <div style={styles.chartLegendRow}>
        <span style={styles.legendHelp}>Dot colors follow the Risk Band Guide above. Use the upper-left dots first: those students combine higher model risk with weaker assessment scores.</span>
      </div>
    </div>
  );
}

function DriverBars({ drivers }) {
  if (!drivers.length) return <EmptyResultChart message="No feature signals were available." />;
  return (
    <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
      <div style={styles.driverExplainBox}>
        <strong>How to read this</strong>
        <span>These are not model coefficients. They summarize visible batch signals into an intervention checklist. The longest bar is the first area to review with students.</span>
      </div>
      {drivers.slice(0, 5).map((driver, index) => (
        <div key={driver.label} style={styles.driverRow}>
          <div style={styles.driverHeader}>
            <div>
              <span style={styles.driverName}>{driver.label}</span>
              <p style={styles.driverMeaning}>{driver.meaning}</p>
            </div>
            <span style={styles.driverScore}>{Math.round(driver.value)}%</span>
          </div>
          <div style={styles.driverMetaRow}>
            <span>{driver.detail}</span>
            <span>{index === 0 ? "Top signal" : "Supporting signal"}</span>
          </div>
          <div style={styles.driverTrack}>
            <div style={{ width: `${driver.value}%`, height: "100%", borderRadius: 999, background: index < 2 ? "linear-gradient(90deg,#fb7185,#60a5fa)" : "linear-gradient(90deg,#38bdf8,#5eead4)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InterventionPanel({ analytics }) {
  const highRows = analytics.rows.filter((row) => row.riskScore >= 70).slice(0, 5);
  const title = analytics.highCount ? "Immediate intervention queue" : analytics.mediumCount ? "Monitoring queue" : "Healthy cohort watch";
  const body = analytics.highCount
    ? "Start with the high-risk students below, then move to medium-risk students with low scores or weak engagement."
    : analytics.mediumCount
    ? "No high-risk concentration is visible, but medium-risk students should be reviewed before the next assessment checkpoint."
    : "The current prediction output is mostly lower-risk. Keep tracking engagement and submissions.";

  return (
    <div style={styles.batchResultsBox}>
      <div style={styles.batchResultsHeader}>
        <div style={styles.batchResultsIntro}>
          <div style={styles.resultLabel}>Intervention Readout</div>
          <h3 style={styles.batchResultsTitle}>{title}</h3>
          <p style={styles.batchResultsDesc}>{body}</p>
        </div>
        <div style={styles.batchStatsWrap}>
          <Stat label="Priority" value={analytics.highCount ? "Urgent" : analytics.mediumCount ? "Watch" : "Normal"} tone={analytics.highCount ? "danger" : analytics.mediumCount ? "warning" : "calm"} />
          <Stat label="Top Driver" value={analytics.drivers[0]?.label || "Combined"} tone="driver" />
        </div>
      </div>
      {highRows.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.interventionTable}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Student</th>
                <th style={styles.tableHead}>Risk Score</th>
                <th style={styles.tableHead}>Academic Signal</th>
                <th style={styles.tableHead}>Engagement</th>
                <th style={styles.tableHead}>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {highRows.map((row) => (
                <tr key={`priority-${row.id}`} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.studentCell}>{row.id}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <RiskScoreCell row={row} showLevel />
                  </td>
                  <td style={styles.tableCell}>
                    <MetricStack label="Avg score" value={formatMetric(row.avgScore)} />
                  </td>
                  <td style={styles.tableCell}>
                    <MetricStack label="Active days" value={formatMetric(row.activeDays)} />
                    <MetricStack label="Submissions" value={formatMetric(row.submissions)} compact />
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.nextActionPill}>{riskActionLabel(row.riskScore)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyResultChart({ message }) {
  return (
    <div style={{ minHeight: 150, display: "grid", placeItems: "center", color: "#94a3b8", border: "1px dashed rgba(148,163,184,.18)", borderRadius: 16 }}>
      {message}
    </div>
  );
}

function countCategoricalValues(rows, keys, fallback) {
  const counts = rows.reduce((acc, row) => {
    const rawValue = keys.map((key) => row[key]).find((value) => value !== null && value !== undefined && String(value).trim() !== "");
    const label = String(rawValue || fallback).trim();
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function trimLabel(label) {
  const text = String(label || "Unknown");
  return text.length > 18 ? `${text.slice(0, 16)}...` : text;
}

function sentenceCase(value) {
  const text = String(value || "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function mean(values) {
  const filtered = values.map(Number).filter(Number.isFinite);
  return filtered.length ? filtered.reduce((sum, value) => sum + value, 0) / filtered.length : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function formatMetric(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function PredictionProcessingCard({ stage, result }) {
  const meta = PROCESSING_STAGES[stage] || PROCESSING_STAGES["Preparing dataset"];
  const complete = Boolean(meta.complete);
  const message = complete && result
    ? `${result.totalStudents} students analyzed. ${result.atRiskStudents} students flagged as at risk.`
    : meta.message;
  const segmentFills = Array.from({ length: TOTAL_PROCESSING_STEPS }, (_, index) => {
    const segmentStart = index * 25;
    return clamp((meta.percent - segmentStart) * 4, 0, 100);
  });

  return (
    <section
      className={`prediction-processing-card${complete ? " is-complete" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`${meta.task}. ${Math.round(meta.percent)} percent complete.`}
    >
      <div className="processing-top-row">
        <span className="processing-title">
          <span className="processing-icon" aria-hidden="true">
            {complete ? <CheckCircle2 size={17} strokeWidth={2.6} /> : <Sparkles size={17} strokeWidth={2.4} />}
          </span>
          AI Prediction Processing
        </span>
      </div>
      <div className="processing-middle" key={stage}>
        <strong className="processing-task">{complete ? "Prediction Complete" : meta.task}</strong>
        <p className="processing-message">{message}</p>
      </div>
      <div className="processing-bottom-row">
        <span className="processing-pulse" aria-hidden="true" />
        <div className="processing-track" aria-hidden="true">
          {segmentFills.map((fill, index) => (
            <span className="processing-segment" style={{ "--segment-fill": `${fill}%` }} key={index} />
          ))}
        </div>
        <strong className="processing-percent">{formatPercent(meta.percent, 0)}%</strong>
      </div>
    </section>
  );
}

function ProgressiveStatus({ label, percent }) {
  return (
    <div className="progressive-status" role="status" aria-live="polite" style={{ marginTop: 16 }}>
      <div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Loader2 className="progressive-spinner" size={16} />
          {label}
        </span>
        <strong>{Math.round(percent)}%</strong>
      </div>
      <progress value={percent} max="100" aria-label={label} />
    </div>
  );
}

function UploadPanel({ files, uploadedRows, fileError, uploadProgress, addFiles, removeFile, dragOver, setDragOver }) {
  return (
    <div>
      <div
        style={{ ...styles.dropZone, borderColor: dragOver ? LOW_RISK_COLOR : "rgba(148,163,184,0.22)", background: dragOver ? "rgba(94,234,212,0.12)" : "rgba(15,23,42,0.55)" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="interactive-icon pc-outlined-file-icon" style={styles.dropIcon}>
          <FileSpreadsheet size={34} strokeWidth={2} color="#EAF2FF" fill="none" />
        </div>
        <h3 style={styles.dropTitle}>Drop files here or click to browse</h3>
        <p style={styles.dropText}>Upload CSV, Excel, or JSON data with columns matching the 17 model inputs.</p>
        <input id="fileInput" type="file" multiple accept=".csv,.json,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
      </div>
      {uploadProgress?.visible && <ProgressiveStatus label={uploadProgress.stage} percent={uploadProgress.percent} />}
      {fileError && <div style={styles.fileError}>{fileError}</div>}
      {uploadedRows.length > 0 && (
        <div className="pc-loaded-card" style={styles.batchPreviewBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <span className="pc-loaded-file-icon" aria-hidden="true">
              <FileText size={26} strokeWidth={2} color="#EAF2FF" fill="none" />
            </span>
            <div style={{ minWidth: 0 }}>
            <div style={styles.batchPreviewTitle}>Data Loaded Successfully</div>
            <div style={styles.batchPreviewText}>{uploadedRows.length} student rows are ready for batch prediction from CSV, Excel, or JSON.</div>
            </div>
          </div>
          <div style={styles.batchPreviewCount}><strong className="pc-row-count-number">{uploadedRows.length}</strong><span className="pc-rows-label">Rows</span></div>
        </div>
      )}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} style={styles.fileItem}>
              <div className="interactive-icon pc-outlined-file-icon" style={styles.fileBadge}>
                <FileText size={22} strokeWidth={2} color="#DCE7F5" fill="none" />
              </div>
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
        <CompletionRing percent={progressPercent} />
      </div>
      {featureGroups.map((group) => (
        <div key={group.id} style={{ ...styles.featureGroup, borderLeft: `4px solid ${group.color}`, borderLeftColor: group.color }}>
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
                  <select className="pc-field-input" name={field.name} value={formData[field.name]} onChange={handleChange} style={styles.fieldInput}>
                    {field.options.map((o) => <option key={o || "empty"} value={o}>{o || "Select value"}</option>)}
                  </select>
                ) : (
                  <input className="pc-number-input" type="number" name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} style={styles.fieldInput} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompletionRing({ percent }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent <= 33 ? "#fb7185" : percent <= 66 ? "#38bdf8" : "#5eead4";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={`${percent}% complete`}>
      <circle cx="26" cy="26" r={radius} fill="rgba(2,6,23,.52)" stroke="rgba(255,255,255,.10)" strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dashoffset .35s ease, stroke .25s ease" }}
      />
      <text x="26" y="30" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">{percent}%</text>
    </svg>
  );
}

function RiskScoreCell({ row, showLevel = false }) {
  const color = row.riskScore >= 70 ? "#fb7185" : row.riskScore >= 40 ? "#38bdf8" : "#5eead4";
  return (
    <div style={styles.riskScoreCell}>
      <div style={styles.riskScoreTopLine}>
        <strong style={{ ...styles.riskScoreNumber, color }}>{row.riskScore}</strong>
        {showLevel && (
          <span style={{ ...styles.riskScoreLevel, color }}>
            {row.level}
          </span>
        )}
      </div>
      <div style={styles.riskScoreTrack} aria-hidden="true">
        <span style={{ ...styles.riskScoreFill, width: `${row.riskScore}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricStack({ label, value, compact = false }) {
  return (
    <div style={{ ...styles.metricStack, ...(compact ? styles.metricStackCompact : {}) }}>
      <span style={styles.metricStackLabel}>{label}</span>
      <strong style={styles.metricStackValue}>{value}</strong>
    </div>
  );
}

function riskActionLabel(score) {
  if (score >= 70) return "Immediate review";
  if (score >= 40) return "Monitor closely";
  return "Normal follow-up";
}

function BatchResultsTable({ results }) {
  const sampleRows = results.slice(0, 5);
  return (
    <div style={styles.batchResultsBox}>
      <div style={styles.batchResultsHeader}>
        <div>
          <div style={styles.resultLabel}>Batch Prediction Results</div>
          <h3 style={styles.batchResultsTitle}>Students Risk Overview</h3>
          <p style={styles.batchResultsDesc}>
            Each uploaded row scored by the trained Random Forest model. Showing 5 example rows from the full prediction output.
          </p>
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
            {sampleRows.map((s) => (
              <tr key={s.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <span style={styles.studentCell}>{s.id}</span>
                </td>
                <td style={styles.tableCell}>
                  <RiskScoreCell row={s} />
                </td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.riskPill, ...riskPillStyle(s.level, s.riskScore) }}>
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

function PredictionExportPanel({ rows, inputMethod, exportStage, setExportStage }) {
  const { notify } = useToast();
  const { track } = useAnalytics();
  if (!rows.length) return null;
  const title = inputMethod === INPUT_METHODS.file ? "Export enriched dataset" : "Export prediction row";
  const desc = inputMethod === INPUT_METHODS.file
    ? "Download the uploaded rows with model output and target labels."
    : "Download the current prediction with the generated model output.";
  const runExport = (format) => {
    const stages = format === "CSV" ? ["Preparing report...", "Creating CSV...", "Export ready"] : ["Preparing report...", "Generating JSON...", "Export ready"];
    setExportStage(stages[0]);
    track("Export Clicked", { format, rows: rows.length });
    window.setTimeout(() => setExportStage(stages[1]), 180);
    window.setTimeout(() => {
      if (format === "CSV") downloadRowsAsCsv(rows, "student_predictions_with_target.csv");
      else downloadRowsAsJson(rows, "student_predictions_with_target.json");
      setExportStage(stages[2]);
      notify({ title: "Export generated", message: `${format} is ready.`, tone: "success" });
      window.setTimeout(() => setExportStage(""), 1200);
    }, 420);
  };
  return (
    <div className="pc-export-panel" style={styles.exportPanel}>
      <div style={styles.exportInfo}>
        <div style={styles.exportTitle}>{title}</div>
        <p style={styles.exportDesc}>{exportStage || desc}</p>
      </div>
      <div className="pc-export-actions" style={styles.exportActions}>
        <button type="button" style={styles.exportPrimaryBtn} onClick={() => runExport("CSV")}>
          CSV
        </button>
        <button type="button" style={styles.exportSecondaryBtn} onClick={() => runExport("JSON")}>
          JSON
        </button>
      </div>
    </div>
  );
}

// ─── Shared small components ──────────────────────────────────────────────────

function SelectionBadge({ active }) {
  return (
    <div style={active ? styles.activeBadge : styles.idleBadge}>
      {active && <Check size={15} strokeWidth={3} />}
      <span>{active ? "Selected" : "Choose"}</span>
    </div>
  );
}

function ChoiceCard({ active, Icon, title, desc, bullets, onClick }) {
  return (
    <button type="button" className={`pc-choice-card${active ? " is-selected" : ""}`} style={{ ...styles.choiceCard, ...(active ? styles.choiceActive : {}) }} onClick={onClick}>
      <div style={styles.choiceTop}>
        <div className="interactive-icon smoke-hover" style={styles.choiceIcon}><Icon size={42} strokeWidth={1.8} /></div>
        <SelectionBadge active={active} />
      </div>
      <h3 style={styles.choiceTitle}>{title}</h3>
      <p style={styles.choiceDesc}>{desc}</p>
      <div style={styles.bulletList}>{bullets.map((b) => <span key={b} style={styles.bullet}>✓ {b}</span>)}</div>
    </button>
  );
}

function ModelCard({ active, disabled = false, percent, title, desc, metrics, accuracy, accuracyColor, onClick }) {
  return (
    <button
      type="button"
      className={`pc-model-card${active ? " is-selected" : ""}`}
      style={{ ...styles.modelCard, ...(active ? styles.modelActive : {}), ...(disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}) }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div style={styles.modelSelectionBadge}>
        <SelectionBadge active={active} />
      </div>
      <h3 style={styles.modelTitle}>{title}</h3>
      <div style={styles.modelPercent}>{percent}</div>
      <p style={styles.modelDesc}>{desc}</p>
      <div style={styles.metricList}>{metrics.map((m) => <span key={m} style={styles.metricPill}>{m}</span>)}</div>
      {disabled && <div style={{ ...styles.metricPill, width: "fit-content", marginTop: 12 }}>Unavailable until model URL is configured</div>}
      <div className="pc-model-accuracy" aria-hidden="true">
        <span style={{ "--accuracy-width": active ? `${accuracy}%` : "0%", "--accuracy-color": accuracyColor }} />
      </div>
    </button>
  );
}

function RiskBandGuide({ analytics }) {
  const bands = [
    { label: "High Risk", range: "70-100", count: analytics.highCount, color: "#fb7185", action: "Immediate outreach" },
    { label: "Medium Risk", range: "40-69", count: analytics.mediumCount, color: "#38bdf8", action: "Monitor this week" },
    { label: "Low Risk", range: "0-39", count: analytics.lowCount, color: "#5eead4", action: "Normal follow-up" },
  ];
  const total = Math.max(analytics.count, 1);
  return (
    <div style={styles.riskBandGuide}>
      <div style={styles.riskBandGuideHeader}>
        <span style={styles.resultLabel}>Risk Band Guide</span>
        <h3 style={styles.riskBandGuideTitle}>One color key for all charts below</h3>
      </div>
      <div style={styles.riskBandGrid}>
        {bands.map((band) => {
          const pct = formatRate(calculateRate(band.count, total));
          return (
            <div key={band.label} style={{ ...styles.riskBandCard, borderColor: `${band.color}45`, background: `linear-gradient(180deg, ${band.color}12, rgba(2,6,23,.34))` }}>
              <div style={{ ...styles.riskBandTop, color: band.color, borderColor: `${band.color}38`, background: `${band.color}12` }}>
                <span style={{ ...styles.riskBandDot, background: band.color, boxShadow: `0 0 18px ${band.color}88` }} />
                <span>Risk score {band.range}</span>
              </div>
              <strong style={styles.riskBandName}>{band.label}</strong>
              <div style={styles.riskBandCount}>{band.count} students</div>
              <div style={styles.riskBandMeta}>
                <span>{pct}% of cohort</span>
                <span>{band.action}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, color }) {
  return (
    <div style={{ ...styles.statBox, borderColor: `${color}66`, background: `linear-gradient(180deg, ${color}1f, rgba(15,23,42,.62))`, boxShadow: `0 18px 38px ${color}12` }}>
      <span style={{ ...styles.statLabel, color }}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

function MiniInsight({ label, value, color }) {
  return (
    <div style={{ ...styles.statBox, minWidth: 0, padding: "12px 14px", borderColor: `${color}55`, background: `${color}12` }}>
      <span style={{ ...styles.statLabel, color }}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

function ReviewOrderStep({ step, title, detail, color }) {
  return (
    <div style={{ ...styles.reviewOrderStep, borderColor: `${color}55`, background: `linear-gradient(180deg, ${color}14, rgba(2,6,23,.28))` }}>
      <span style={{ ...styles.reviewOrderIndex, background: color }}>{step}</span>
      <div>
        <strong style={styles.reviewOrderStepTitle}>{title}</strong>
        <p style={styles.reviewOrderStepText}>{detail}</p>
      </div>
    </div>
  );
}

function DashboardSection({ eyebrow, title, desc, children }) {
  return (
    <section style={styles.dashboardSection}>
      <div style={styles.dashboardSectionHeader}>
        <div>
          <span style={styles.dashboardSectionEyebrow}>{eyebrow}</span>
          <h3 style={styles.dashboardSectionTitle}>{title}</h3>
          <p style={styles.dashboardSectionDesc}>{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartCard({ title, subtitle, children, wide = false, badge = "Result", style }) {
  return (
    <div style={{ ...styles.chartCard, ...(wide ? styles.chartCardWide : {}), ...style }}>
      <div style={styles.chartHeader}>
        <div>
          <h3 style={styles.chartTitle}>{title}</h3>
          <p style={styles.chartSubtitle}>{subtitle}</p>
        </div>
        <span style={styles.chartBadge}>{badge}</span>
      </div>
      {children}
    </div>
  );
}

function RiskGauge({ score, level, analytics }) {
  const high = analytics?.highCount || 0;
  const medium = analytics?.mediumCount || 0;
  const low = analytics?.lowCount || 0;
  const total = Math.max(analytics?.count || 1, 1);
  const highWidth = (high / total) * 100;
  const mediumWidth = (medium / total) * 100;
  const lowWidth = (low / total) * 100;
  return (
    <div style={styles.gaugeWrap}>
      <div style={{ ...styles.gaugeOuter, background: `conic-gradient(#fb7185 0 ${highWidth}%, #60a5fa ${highWidth}% ${highWidth + mediumWidth}%, #5eead4 ${highWidth + mediumWidth}% ${highWidth + mediumWidth + lowWidth}%, #1e293b 0)` }}>
        <div style={styles.gaugeInner}>
          <div style={styles.gaugeScore}>{formatApproxPercent(score)}</div>
          <div style={styles.gaugeLabel}>Average Risk Score</div>
        </div>
      </div>
      <div style={styles.gaugeLevel}>{level}</div>
    </div>
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

function Stat({ label, value, tone }) {
  const toneStyle =
    tone === "danger"
      ? styles.statDanger
      : tone === "warning"
      ? styles.statWarning
      : tone === "driver"
      ? styles.statDriver
      : tone === "calm"
      ? styles.statCalm
      : {};
  return (
    <div style={{ ...styles.statBox, ...toneStyle }}>
      <span style={{ ...styles.statLabel, ...(toneStyle.color ? { color: toneStyle.color } : {}) }}>{label}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}
