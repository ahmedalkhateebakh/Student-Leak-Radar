import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChartScatter,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListChecks,
  MessageSquareText,
  Radar,
  Rocket,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  UsersRound,
} from "lucide-react";
import { workspaceCards } from "./dataGuides";

const workspaceRouteMap = {
  predict: "/prediction-console",
  eda: "/intelligence-lab",
  requirements: "/csv-requirements",
  output: "/model-output",
};

const headlineWords = ["Identify", "At-Risk", "Students"];
const headlineAccentWords = ["Before", "They", "Drop", "Behind."];
const RISK_RED = "#fb7185";

const heroFeatures = [
  { icon: LayoutDashboard, label: "Early Risk Detection" },
  { icon: BrainCircuit, label: "AI Risk Prediction" },
  { icon: ListChecks, label: "Bulk Student Screening" },
];

const heroRiskCards = [
  { name: "Ahmed K.", risk: "High Risk • 78%", tone: RISK_RED, delay: ".35s", position: "top", urgent: true, trend: "M20 34 C36 26 44 31 58 20 S82 10 98 14" },
  { name: "Sara M.", risk: "Monitor • 52%", tone: "#5eead4", delay: ".55s", position: "middle", trend: "M20 24 C34 22 42 18 55 21 S80 27 98 20" },
  { name: "Omar H.", risk: "At Risk • 66%", tone: "#38bdf8", delay: ".75s", position: "bottom", trend: "M20 30 C34 28 45 21 58 24 S82 18 98 16" },
];

const heroSteps = [
  {
    index: "01",
    color: "#5eead4",
    title: "Monitor Learning Activity",
    text: "Track engagement patterns, assessments, and interaction behavior throughout the course lifecycle.",
  },
  {
    index: "02",
    color: "#38bdf8",
    title: "Predict Risk Early",
    text: "Generate actionable risk scores at critical milestones before academic outcomes deteriorate.",
  },
  {
    index: "03",
    color: RISK_RED,
    title: "Prioritize Intervention",
    text: "Surface the students who require immediate support and focus educator attention where it matters most.",
  },
];

const profileSkills = [
  "Machine Learning",
  "NLP",
  "Python",
  "Predictive Modeling",
  "FastAPI",
];

const homeStyles = {
  hero: {
    position: "relative",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    minHeight: "calc(100vh - 80px)",
    margin: 0,
    padding: "clamp(16px, 2.8vh, 30px) 0 52px",
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(94,234,212,0.055), transparent 42%), #0d1b2a",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "clamp(36px, 5vw, 76px)",
    alignItems: "start",
    width: "100%",
    maxWidth: 1500,
    minHeight: "auto",
    margin: "0 auto",
    padding: "0 clamp(24px, 4vw, 48px)",
  },
  heroPattern: {
    position: "absolute",
    inset: 0,
    opacity: .03,
    pointerEvents: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='white'/%3E%3C/svg%3E\")",
    backgroundSize: "28px 28px",
  },
  heroHeadlineGlow: {
    position: "absolute",
    left: "6%",
    top: "15%",
    width: "54%",
    height: "58%",
    background: "radial-gradient(circle at 72% 50%, rgba(94,234,212,0.05) 0%, transparent 68%)",
    pointerEvents: "none",
  },
  heroMain: {
    position: "relative",
    zIndex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "clamp(18px, 4vh, 42px)",
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    minHeight: 38,
    color: "#DFFCF8",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: "none",
    marginBottom: 18,
    padding: "10px 18px",
    alignSelf: "flex-start",
    border: "1px solid rgba(94,234,212,.18)",
    borderRadius: 999,
    background: "rgba(94,234,212,.08)",
    boxShadow: "0 14px 40px rgba(94,234,212,.10), inset 0 1px 0 rgba(255,255,255,.05)",
    backdropFilter: "blur(14px)",
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "#5eead4",
    boxShadow: "0 0 14px rgba(94,234,212,.80)",
    flexShrink: 0,
  },
  title: {
    margin: "18px 0 16px",
    fontSize: "clamp(46px, 7vw, 88px)",
    lineHeight: .9,
    letterSpacing: "-.065em",
    fontWeight: 950,
  },
  accent: { color: "#cffafe" },
  storyTitle: {
    margin: "0 0 20px",
    color: "#f8fafc",
    maxWidth: 720,
    fontSize: "clamp(46px, 5.9vw, 82px)",
    lineHeight: .98,
    letterSpacing: 0,
    fontWeight: 900,
    wordSpacing: "normal",
    whiteSpace: "normal",
  },
  storyAccent: { color: "#38bdf8", display: "block" },
  subtitle: {
    margin: 0,
    maxWidth: 620,
    color: "rgba(255,255,255,0.62)",
    fontSize: "clamp(15px, 1.25vw, 18px)",
    lineHeight: 1.72,
    fontWeight: 500,
  },
  heroTagRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    color: "rgba(255,255,255,.74)",
    border: "1px solid rgba(255,255,255,.1)",
    background: "rgba(255,255,255,.05)",
    borderRadius: 999,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 900,
    backdropFilter: "blur(8px)",
    transition: "all .3s ease",
  },
  storyFlow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 11,
    marginTop: 18,
    maxWidth: "100%",
  },
  storyStep: {
    borderLeft: "3px solid var(--step-color)",
    background: "rgba(255,255,255,.04)",
    borderRadius: 10,
    padding: "14px 18px 16px",
    transition: "all .3s ease",
  },
  storyStepIndex: {
    display: "inline-grid",
    placeItems: "center",
    position: "relative",
    width: 34,
    height: 34,
    color: "var(--step-color)",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  stepRingSvg: {
    position: "absolute",
    inset: 0,
    width: 34,
    height: 34,
    overflow: "visible",
  },
  storyStepTitle: { display: "block", margin: "0 0 6px", color: "#fff", fontSize: 15, lineHeight: 1.25, fontWeight: 850 },
  storyStepText: { margin: 0, color: "rgba(226,232,240,.70)", fontSize: 13, lineHeight: 1.55, fontWeight: 500 },
  heroSide: {
    position: "relative",
    zIndex: 1,
    minHeight: 560,
    display: "grid",
    gridTemplateRows: "minmax(400px, auto) auto",
    gap: 16,
    alignItems: "center",
    overflow: "visible",
  },
  radarStage: {
    position: "relative",
    width: "100%",
    height: 400,
    minHeight: 400,
    display: "grid",
    placeItems: "center",
    overflow: "visible",
  },
  radarSvg: {
    position: "absolute",
    inset: "50% auto auto 50%",
    width: "min(70%, 330px)",
    height: "min(100%, 330px)",
    transform: "translate(-50%, -50%)",
    overflow: "visible",
    filter: "drop-shadow(0 0 42px rgba(94,234,212,.12))",
    zIndex: 1,
  },
  riskMiniCard: {
    position: "absolute",
    zIndex: 3,
    display: "grid",
    gap: 3,
    minWidth: 148,
    padding: "10px 12px 10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.09)",
    borderLeft: "4px solid var(--risk-color)",
    background: "rgba(8,19,31,.78)",
    color: "#fff",
    boxShadow: "0 20px 54px rgba(0,0,0,.34), 0 0 28px color-mix(in srgb, var(--risk-color) 18%, transparent)",
    backdropFilter: "blur(14px)",
    transition: "all .3s ease",
  },
  riskCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  riskUrgentBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    color: "#ffe4ea",
    background: "rgba(251,113,133,.16)",
    border: "1px solid rgba(251,113,133,.34)",
    borderRadius: 999,
    padding: "3px 7px",
    fontSize: 9,
    fontWeight: 950,
    letterSpacing: ".08em",
    textTransform: "uppercase",
  },
  riskName: { fontSize: 12, color: "rgba(255,255,255,.62)", fontWeight: 800 },
  riskValue: { fontSize: 14, color: "var(--risk-color)", fontWeight: 950 },
  riskMeta: { fontSize: 10, color: "rgba(255,255,255,.38)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 900 },
  riskSparkline: {
    width: "100%",
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: "all .3s ease",
  },
  heroStepStack: {
    width: "100%",
    maxWidth: 520,
    justifySelf: "center",
  },
  controlHeader: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" },
  controlTitle: { margin: "8px 0 6px", color: "#fff", fontSize: 26, letterSpacing: "-.045em", lineHeight: 1 },
  controlText: { margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.55 },
  controlBadge: {
    display: "none",
    color: "#020617",
    background: "linear-gradient(135deg,#5eead4,#38bdf8)",
    borderRadius: 999,
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  checkpointGrid: { display: "grid", gap: 11 },
  checkpointCard: {
    border: "1px solid rgba(148,163,184,.16)",
    borderRadius: 20,
    padding: 16,
    background: "rgba(2,6,23,.36)",
  },
  checkpointTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  checkpointTitle: { color: "#fff", fontSize: 17, fontWeight: 950, letterSpacing: "-.025em" },
  checkpointPercent: { color: "#020617", background: "linear-gradient(135deg,#5eead4,#38bdf8)", borderRadius: 999, padding: "7px 11px", fontWeight: 950 },
  checkpointMeta: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 11 },
  checkpointChip: {
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,.16)",
    background: "rgba(15,23,42,.54)",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 11,
    fontWeight: 850,
  },
  flowLine: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 2 },
  flowItem: {
    border: "1px solid rgba(94,234,212,.18)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(56,189,248,.08)",
  },
  flowValue: { display: "block", color: "#fff", fontWeight: 950, fontSize: 14, marginBottom: 4 },
  flowLabel: { color: "#94a3b8", fontSize: 11, lineHeight: 1.35 },
  metric: {
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.34)",
    borderRadius: 20,
    padding: 16,
  },
  metricLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".13em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  metricValue: { display: "block", color: "#fff", fontSize: 30, fontWeight: 950, letterSpacing: "-.04em", lineHeight: 1.08 },
  metricText: { margin: "8px 0 0", color: "#94a3b8", fontSize: 13, lineHeight: 1.55 },
  section: {
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(180deg, rgba(15,23,42,.72), rgba(2,6,23,.50))",
    borderRadius: 30,
    padding: "clamp(20px, 3vw, 30px)",
    marginBottom: 20,
    boxShadow: "0 28px 90px rgba(0,0,0,.24)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".20em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "9px 0 8px",
    color: "#fff",
    fontSize: "clamp(30px, 3.8vw, 44px)",
    lineHeight: 1,
    letterSpacing: "-.055em",
  },
  sectionDesc: { margin: 0, color: "#94a3b8", lineHeight: 1.65, maxWidth: 980 },
  storyGrid: { display: "grid", gridTemplateColumns: "1.06fr .94fr", gap: 16 },
  overviewSection: {
    position: "relative",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "hidden",
    background: "#0b1620",
    padding: "80px 0",
    margin: 0,
  },
  overviewGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at 20% 50%, rgba(94,234,212,0.04), transparent 60%)",
    pointerEvents: "none",
  },
  overviewInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 1500, margin: "0 auto", padding: "0 48px" },
  overviewHeader: { marginBottom: 48 },
  overviewLabel: {
    display: "block",
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  overviewTitle: {
    margin: "0 0 16px",
    maxWidth: 700,
    color: "#fff",
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: 0,
  },
  overviewDesc: {
    margin: 0,
    maxWidth: 680,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 1.8,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.22fr) minmax(0, 1fr)",
    gap: 36,
    alignItems: "stretch",
  },
  overviewPanel: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 32,
    background: "rgba(255,255,255,0.03)",
  },
  overviewPanelTitle: { margin: "0 0 12px", color: "#fff", fontSize: 18, fontWeight: 600, letterSpacing: 0 },
  overviewPanelText: { margin: "0 0 28px", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.75 },
  overviewStatsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 },
  overviewSource: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    lineHeight: 1.4,
  },
  overviewFeatureList: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100%",
  },
  overviewFeatureItem: {
    display: "flex",
    gap: 14,
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    transition: "all .3s ease",
  },
  overviewFeatureIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    color: "#5eead4",
    background: "linear-gradient(135deg, rgba(94,234,212,0.15), rgba(94,234,212,0.05))",
    border: "1px solid rgba(94,234,212,0.2)",
    transition: "all .3s ease",
  },
  overviewFeatureTitle: { display: "block", marginBottom: 6, color: "#fff", fontSize: 15, fontWeight: 700, transition: "all .3s ease" },
  overviewFeatureText: { margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 },
  statement: {
    border: "1px solid rgba(148,163,184,.16)",
    borderRadius: 24,
    padding: 20,
    background: "rgba(2,6,23,.34)",
  },
  statementTitle: { margin: "0 0 10px", color: "#fff", fontSize: 22, letterSpacing: "-.03em" },
  muted: { margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.65 },
  dataStrip: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginTop: 16 },
  dataPill: {
    position: "relative",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    minHeight: 142,
    padding: "22px 24px 18px",
    background: "rgba(255,255,255,0.05)",
    transition: "all .2s ease",
    overflow: "visible",
  },
  dataValue: { display: "block", color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: 0, transition: "all .2s ease" },
  dataLabel: { display: "block", marginTop: 8, color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 850, textTransform: "uppercase", letterSpacing: 2 },
  dataProgressTrack: {
    display: "block",
    height: 4,
    width: "100%",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginTop: 18,
    lineHeight: 0,
  },
  dataProgressFill: {
    display: "block",
    height: "100%",
    width: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #5eead4, #38bdf8)",
    transformOrigin: "left",
  },
  dataTooltip: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: "calc(100% + 10px)",
    zIndex: 5,
    opacity: 0,
    transform: "translateY(6px)",
    pointerEvents: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "9px 10px",
    color: "rgba(255,255,255,0.72)",
    background: "rgba(8,13,20,0.94)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.28)",
    fontSize: 12,
    lineHeight: 1.5,
    transition: "all .2s ease",
  },
  stack: { display: "grid", gap: 12 },
  miniCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    border: "1px solid rgba(148,163,184,.15)",
    borderRadius: 20,
    padding: 16,
    background: "rgba(15,23,42,.44)",
  },
  iconWrap: {
    width: 42,
    height: 42,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 15,
    color: "#020617",
    background: "linear-gradient(135deg,#5eead4,#38bdf8)",
  },
  miniTitle: { display: "block", color: "#f8fafc", fontWeight: 950, marginBottom: 5 },
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
    alignItems: "stretch",
  },
  impactCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    minHeight: 390,
    border: "0.5px solid rgba(32,200,160,0.18)",
    borderRadius: 12,
    padding: 32,
    background: "#081826",
    boxShadow: "none",
    transition: "border-color .25s ease, transform .25s ease",
  },
  impactFeatured: {
    border: "0.5px solid rgba(32,200,160,0.18)",
    background: "#081826",
  },
  impactIcon: {
    width: 40,
    height: 40,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    color: "#20c8a0",
    background: "rgba(32,200,160,0.12)",
    border: "0.5px solid rgba(32,200,160,0.18)",
    marginBottom: 22,
  },
  impactTag: {
    display: "block",
    color: "#20c8a0",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  impactFeaturedTag: { color: "#20c8a0", marginBottom: 8 },
  impactNumber: { display: "block", color: "#fff", fontSize: 20, fontWeight: 500, letterSpacing: 0, lineHeight: 1.3, margin: 0 },
  impactText: { margin: "16px 0 0", color: "#7a9ab8", fontSize: 14, lineHeight: 1.7 },
  impactVisualDock: {
    display: "grid",
    alignItems: "end",
    width: "100%",
    marginTop: "auto",
    paddingTop: 32,
  },
  impactCardFooter: {
    display: "grid",
    gap: 14,
    width: "100%",
  },
  accuracyPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "0.5px solid rgba(32,200,160,0.42)",
    background: "transparent",
    color: "#20c8a0",
    fontSize: 12,
    fontWeight: 850,
    padding: "6px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap",
  },
  checkpointStatBlock: { display: "grid", gap: 13 },
  checkpointStatRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
  },
  checkpointStatValue: {
    minWidth: 68,
    color: "#20c8a0",
    fontSize: 36,
    fontWeight: 850,
    lineHeight: 1,
  },
  checkpointStatLabel: {
    color: "#7a9ab8",
    fontSize: 13,
    lineHeight: 1.35,
  },
  checkpointProgressTrack: {
    height: 6,
    width: "100%",
    borderRadius: 999,
    background: "rgba(122,154,184,0.16)",
    overflow: "hidden",
  },
  checkpointProgressFill: {
    display: "block",
    width: "var(--checkpoint-progress-target, 25%)",
    height: "100%",
    borderRadius: 999,
    background: "#20c8a0",
  },
  accuracyRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  signalPanel: { width: "100%" },
  signalPanelBox: {
    display: "grid",
    gap: 12,
  },
  signalPanelTop: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  signalPanelLabel: {
    color: "#7a9ab8",
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: ".08em",
    textTransform: "uppercase",
  },
  signalPanelValue: {
    color: "#20c8a0",
    fontSize: 13,
    fontWeight: 850,
  },
  stackedSignalBar: {
    display: "grid",
    gridTemplateColumns: "1.15fr .95fr .8fr 1.1fr .9fr",
    height: 24,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(122,154,184,0.12)",
  },
  stackedSignalSegment: {
    height: "100%",
    background: "#20c8a0",
  },
  signalLabelRow: {
    display: "grid",
    gridTemplateColumns: "1.15fr .95fr .8fr 1.1fr .9fr",
    gap: 4,
  },
  signalSegmentLabel: {
    color: "#7a9ab8",
    fontSize: 11,
    lineHeight: 1.3,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  outputTierBar: {
    display: "flex",
    width: "100%",
    height: 34,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(122,154,184,0.12)",
  },
  outputTierBarShell: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  outputTierSegment: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#06111f",
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1,
  },
  outputThreshold: { color: "#7a9ab8", fontSize: 13, lineHeight: 1.45 },
  decisionFlowList: {
    display: "grid",
    gap: 0,
    border: "0.5px solid rgba(32,200,160,0.18)",
    borderRadius: 10,
    overflow: "hidden",
  },
  decisionFlowRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    padding: "0 14px",
    color: "#d8eef2",
    fontSize: 14,
    fontWeight: 700,
  },
  decisionFlowDivider: { height: 1, background: "rgba(32,200,160,0.14)" },
  decisionChevron: { marginLeft: "auto", color: "#20c8a0", flexShrink: 0 },
  decisionIcon: { color: "#20c8a0", flexShrink: 0 },
  modelSection: {
    position: "relative",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "hidden",
    background: "#0d1b2a",
    padding: "80px 0",
    margin: 0,
  },
  modelGlow: {
    position: "absolute",
    inset: 0,
    background: "transparent",
    pointerEvents: "none",
  },
  modelPattern: {
    position: "absolute",
    inset: 0,
    opacity: .025,
    pointerEvents: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='white'/%3E%3C/svg%3E\")",
    backgroundSize: "28px 28px",
  },
  modelInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 1500, margin: "0 auto", padding: "0 48px" },
  modelHeader: { marginBottom: 48 },
  modelLabel: {
    display: "block",
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  modelTitle: {
    margin: 0,
    maxWidth: 750,
    color: "#fff",
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: 0,
  },
  modelDesc: {
    margin: "16px 0 0",
    maxWidth: 700,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 1.8,
  },
  teamGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 },
  memberCard: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: 360,
    border: "0.5px solid rgba(32,200,160,0.18)",
    borderRadius: 12,
    padding: 32,
    background: "#081826",
    boxShadow: "none",
    transition: "border-color .18s ease",
  },
  memberTop: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  memberIdentity: { display: "flex", alignItems: "center", gap: 16, minWidth: 0 },
  avatar: {
    width: 52,
    height: 52,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 15,
    letterSpacing: ".04em",
  },
  avatarFa: {
    color: "#a89ee8",
    background: "rgba(120,100,220,0.2)",
  },
  avatarAk: {
    color: "#20c8a0",
    background: "rgba(32,200,160,0.15)",
  },
  memberTitleWrap: { minWidth: 0 },
  memberName: { display: "block", color: "#e8f0f7", fontSize: 18, fontWeight: 500, letterSpacing: 0, lineHeight: 1.25 },
  memberRole: { display: "block", color: "#20c8a0", fontSize: 13, fontWeight: 400, letterSpacing: ".04em", marginTop: 4, lineHeight: 1.35 },
  memberSubtitle: { display: "block", color: "#7a9ab8", fontSize: 13, fontWeight: 400, marginTop: 3, lineHeight: 1.35 },
  memberHeadline: {
    position: "relative",
    zIndex: 1,
    maxWidth: 890,
    margin: "4px 0 12px",
    color: "#f8fafc",
    fontSize: "clamp(30px, 4.1vw, 56px)",
    fontWeight: 950,
    lineHeight: 1.02,
    letterSpacing: 0,
  },
  memberSummaryLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".14em",
    textTransform: "uppercase",
  },
  memberText: {
    margin: "0 0 28px",
    color: "#b6c7d8",
    fontSize: 14,
    lineHeight: 1.75,
  },
  memberSectionLabel: {
    display: "block",
    marginBottom: 8,
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".14em",
    textTransform: "uppercase",
  },
  memberCapabilityGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 8, margin: "0 0 14px" },
  memberCapabilityCard: {
    minHeight: 118,
    border: "1px solid rgba(148,163,184,0.16)",
    borderRadius: 14,
    padding: 10,
    background: "rgba(255,255,255,0.045)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045)",
    backdropFilter: "blur(18px)",
    transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease",
  },
  memberCapabilityIcon: {
    width: 30,
    height: 30,
    display: "grid",
    placeItems: "center",
    marginBottom: 8,
    borderRadius: 10,
    color: "#5eead4",
    background: "linear-gradient(135deg, rgba(94,234,212,0.15), rgba(56,189,248,0.08))",
    border: "1px solid rgba(94,234,212,0.2)",
  },
  memberCapabilityTitle: { display: "block", marginBottom: 5, color: "#f8fafc", fontSize: 12, fontWeight: 900, lineHeight: 1.18 },
  memberCapabilityText: { margin: 0, color: "#8ea3b7", fontSize: 10.5, lineHeight: 1.38 },
  memberTagRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  memberTag: {
    display: "inline-flex",
    alignItems: "center",
    border: "0.5px solid rgba(32,200,160,0.2)",
    background: "rgba(32,200,160,0.08)",
    color: "#20c8a0",
    fontSize: 12,
    fontWeight: 500,
    padding: "5px 11px",
    borderRadius: 20,
  },
  memberStatsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 12 },
  memberStatCard: {
    minHeight: 62,
    display: "grid",
    alignContent: "center",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "10px 12px",
    color: "#f8fafc",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
  },
  memberStatValue: { display: "block", color: "#f8fafc", fontSize: 16, fontWeight: 950, lineHeight: 1.12 },
  memberStatLabel: { display: "block", marginTop: 4, color: "#7a9ab8", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" },
  memberStackSection: { margin: "0 0 14px" },
  memberStackIntro: { margin: "-2px 0 10px", maxWidth: 820, color: "#8ea3b7", fontSize: 12, lineHeight: 1.5 },
  memberStackGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 },
  memberStackGroupCard: {
    minHeight: 148,
    border: "1px solid rgba(148,163,184,0.16)",
    borderRadius: 14,
    padding: 11,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)), radial-gradient(circle at 18% 0%, rgba(94,234,212,0.08), transparent 38%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.055)",
    backdropFilter: "blur(18px)",
    transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease",
  },
  memberStackGroupHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 9 },
  memberStackIcon: {
    width: 30,
    height: 30,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: 10,
    fontSize: 15,
    background: "rgba(94,234,212,0.10)",
    border: "1px solid rgba(94,234,212,0.18)",
    boxShadow: "0 0 24px rgba(94,234,212,0.08)",
  },
  memberStackGroupTitle: { display: "block", color: "#f8fafc", fontSize: 12, fontWeight: 950, lineHeight: 1.2 },
  memberStackPillGrid: { display: "flex", flexWrap: "wrap", gap: 6 },
  memberStackRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  memberStackChip: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 26,
    padding: "0 8px",
    borderRadius: 999,
    color: "#dbeafe",
    background: "rgba(15,23,42,0.72)",
    border: "1px solid rgba(148,163,184,0.16)",
    fontSize: 11,
    fontWeight: 800,
  },
  memberStackSkillPill: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 25,
    padding: "0 8px",
    borderRadius: 999,
    color: "#dffcf8",
    background: "rgba(15,23,42,0.62)",
    border: "1px solid rgba(94,234,212,0.15)",
    fontSize: 10.5,
    fontWeight: 850,
    lineHeight: 1,
    transition: "transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease",
  },
  memberFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
  },
  memberDivider: { height: 1, background: "rgba(32,200,160,0.12)", margin: "16px 0" },
  socialRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", flexShrink: 0 },
  socialLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    color: "#7a9ab8",
    textDecoration: "none",
    border: "0.5px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 9,
    transition: "background .18s ease, border-color .18s ease, color .18s ease",
  },
  teamSection: {
    position: "relative",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "hidden",
    background: "#0d1b2a",
    padding: "80px 0",
    margin: 0,
  },
  teamGlow: {
    position: "absolute",
    inset: 0,
    background: "transparent",
    pointerEvents: "none",
  },
  teamInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 1500, margin: "0 auto", padding: "0 48px" },
  teamHeader: { marginBottom: 48 },
  teamLabel: {
    display: "block",
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  teamTitle: {
    margin: 0,
    maxWidth: 780,
    color: "#fff",
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: 0,
  },
  teamDesc: {
    margin: "16px 0 0",
    maxWidth: 700,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 1.8,
  },
  teamInfoGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16, marginTop: 16 },
  teamInfoCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: 300,
    border: "0.5px solid rgba(32,200,160,0.18)",
    borderTop: "0.5px solid var(--team-info-color)",
    borderRadius: 12,
    padding: 32,
    background: "#081826",
    boxShadow: "none",
  },
  teamInfoIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    color: "var(--team-info-color)",
    background: "var(--team-info-icon-bg)",
    border: "0.5px solid var(--team-info-border)",
  },
  teamInfoTitle: { margin: "16px 0 18px", color: "#e8f0f7", fontSize: 18, fontWeight: 500, lineHeight: 1.3 },
  teamInfoText: { margin: 0, color: "#7a9ab8", fontSize: 14, lineHeight: 1.75 },
  roadmapList: { display: "grid", gap: 12, margin: "18px 0 0", padding: 0, listStyle: "none" },
  roadmapItem: { display: "flex", alignItems: "center", gap: 11, color: "#7a9ab8", fontSize: 14, lineHeight: 1.45 },
  roadmapDot: { width: 6, height: 6, borderRadius: 999, background: "#a89ee8", flexShrink: 0 },
  workspaceSection: {
    position: "relative",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "hidden",
    background: "#0d1b2a",
    padding: "80px 0",
    margin: 0,
  },
  workspaceGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 18% 72%, rgba(94,234,212,0.03), transparent 48%), radial-gradient(ellipse at 82% 72%, rgba(83,74,183,0.03), transparent 48%)",
    pointerEvents: "none",
  },
  workspacePattern: {
    position: "absolute",
    inset: 0,
    opacity: .025,
    pointerEvents: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.3' fill='white'/%3E%3C/svg%3E\")",
    backgroundSize: "28px 28px",
  },
  workspaceInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 1500, margin: "0 auto", padding: "0 48px" },
  workspaceHeader: { marginBottom: 48 },
  workspaceLabel: {
    display: "block",
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  workspaceTitle: {
    margin: 0,
    maxWidth: 780,
    color: "#fff",
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: 0,
  },
  workspaceDesc: {
    margin: "16px 0 0",
    maxWidth: 700,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 1.8,
  },
  portalGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16, marginTop: 24 },
  portalCard: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid var(--workspace-border)",
    borderRadius: 16,
    padding: 32,
    background: "var(--workspace-bg)",
    display: "flex",
    flexDirection: "column",
    minHeight: 390,
    transition: "all .25s ease",
  },
  portalActive: {
    borderColor: "rgba(94,234,212,.38)",
    background: "linear-gradient(135deg, rgba(94,234,212,.14), rgba(56,189,248,.10))",
  },
  portalTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  portalIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    color: "var(--workspace-color)",
    background: "var(--workspace-icon-bg)",
    border: "1px solid var(--workspace-icon-border)",
  },
  portalEyebrow: {
    display: "block",
    color: "var(--workspace-color)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  portalTitle: { margin: "12px 0 8px", color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: 0, lineHeight: 1.15 },
  portalSummary: { margin: "0 0 20px", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.75 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 850,
  },
  chipDot: { width: 6, height: 6, borderRadius: 999, background: "var(--workspace-color)" },
  portalOutput: {
    margin: "0 0 20px",
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    lineHeight: 1.7,
  },
  openButton: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    width: "100%",
    minHeight: 48,
    marginTop: "auto",
    border: 0,
    borderRadius: 10,
    padding: "0 16px",
    color: "var(--workspace-button-color)",
    background: "var(--workspace-button-bg)",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    overflow: "hidden",
    transition: "all .25s ease",
  },
  workspaceSystem: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16, marginBottom: 0 },
  workspaceStep: {
    position: "relative",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px 28px",
    background: "rgba(255,255,255,0.03)",
    transition: "all .25s ease",
  },
  workspaceStepIndex: {
    display: "inline-grid",
    placeItems: "center",
    position: "relative",
    width: 38,
    height: 38,
    color: "#5eead4",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 16,
  },
  workspaceStepTitle: { display: "block", color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 8 },
  workspaceStepText: { margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 },
  footer: {
    position: "relative",
    overflow: "hidden",
    width: "100vw",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.5)",
    borderRadius: 0,
    background: "#080d14",
    marginTop: 0,
  },
  footerGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse at 0% 100%, rgba(94,234,212,0.03), transparent 55%)",
    pointerEvents: "none",
  },
  footerInner: { position: "relative", zIndex: 1, width: "100%", maxWidth: 1500, margin: "0 auto", padding: "56px 48px 0" },
  footerMain: {
    display: "grid",
    gridTemplateColumns: "1.75fr 1fr 1fr 1.25fr",
    gap: 48,
    alignItems: "flex-start",
  },
  footerBrand: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  footerLogo: { color: "#fff", fontSize: 17, fontWeight: 700, letterSpacing: 0 },
  footerLogoAccent: { color: "#38bdf8" },
  footerText: { margin: "10px 0 0", color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.75, maxWidth: 260 },
  footerColTitle: {
    display: "block",
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  footerItem: {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 12,
    paddingLeft: 0,
    borderLeft: "2px solid transparent",
    fontSize: 13,
    lineHeight: 1.35,
    textDecoration: "none",
    transition: "all .2s ease",
  },
  footerDivider: { height: 1, background: "rgba(255,255,255,0.05)", marginTop: 72 },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "20px 0",
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
  },
  footerBottomRight: { textAlign: "right" },
};

const impactItems = [
  {
    icon: ShieldCheck,
    label: "Early Warning",
    value: "25% alert + 50% confirmation",
    text: "Start with an early warning, then confirm the risk once richer course activity is available.",
  },
  {
    icon: Database,
    label: "Selected Features",
    value: "17 model-ready signals",
    text: "Academic performance, timing, VLE behavior, engagement diversity, and student context feed the model.",
  },
  {
    icon: LineChart,
    label: "Output",
    value: "Low / Medium / High Risk",
    text: "The raw probability is translated into a reviewer-friendly intervention band.",
  },
  {
    icon: UsersRound,
    label: "Decision Flow",
    value: "Single student + batch cohort",
    text: "Score one student manually or upload a cohort file to build an intervention queue.",
  },
];

const goals = [
  { icon: Radar, title: "Detect risk before the final result", text: "The system looks for early signs of failure or withdrawal while intervention is still meaningful." },
  { icon: BarChart3, title: "Use real learning behavior", text: "It combines assessment scores, submissions, delays, active days, clicks, resource diversity, and profile context." },
  { icon: GraduationCap, title: "Support teachers, not replace them", text: "The model highlights students who may need outreach, academic support, or additional follow-up." },
];

const faresCapabilities = [
  {
    icon: BrainCircuit,
    title: "Machine Learning",
    description: "Designing and deploying predictive models, feature engineering pipelines, model evaluation workflows, and scalable ML solutions for real-world applications.",
  },
  {
    icon: MessageSquareText,
    title: "Natural Language Processing",
    description: "Building intelligent NLP systems for text classification, semantic understanding, information extraction, embeddings, and language-driven AI experiences.",
  },
  {
    icon: Code2,
    title: "Python Engineering",
    description: "Developing clean, maintainable, and production-ready backend systems, automation workflows, data pipelines, and AI services using Python.",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    description: "Transforming historical and real-time data into actionable forecasts, business insights, decision-support systems, and intelligent predictions.",
  },
  {
    icon: ServerCog,
    title: "FastAPI Development",
    description: "Creating high-performance APIs and scalable AI-powered backend services optimized for integration, deployment, and production environments.",
  },
];

const ahmedCapabilities = [
  {
    icon: MessageSquareText,
    title: "NLP Pipelines",
    description: "Transforming unstructured language data into structured features, searchable datasets, and decision-support signals for applied AI workflows.",
  },
  {
    icon: Sparkles,
    title: "LLM Applications",
    description: "Building RAG-enabled and LangChain/LangGraph-powered applications that connect model reasoning with practical operational decisions.",
  },
  {
    icon: ServerCog,
    title: "FastAPI Services",
    description: "Shipping backend services for model inference, API integration, data validation, and production-oriented AI application delivery.",
  },
  {
    icon: Database,
    title: "PostgreSQL Systems",
    description: "Designing reliable data layers for structured records, retrieval workflows, analytics-ready tables, and application state.",
  },
  {
    icon: Rocket,
    title: "Production Integration",
    description: "Connecting Dockerized services, data workflows, and AI features into usable systems for healthcare, operations, and product teams.",
  },
];

const teamMembers = [
  {
    initials: "FA",
    name: "Fares Alnamla",
    role: "AI Engineer | ML Specialist | NLP",
    subtitle: "Data Science & Artificial Intelligence Graduate",
    headline: "Building Intelligent AI Systems That Transform Data Into Decisions",
    summaryLabel: "Profile Overview",
    text: "AI Engineer specializing in Machine Learning, Natural Language Processing, and RAG-powered applications. Experienced in building intelligent data pipelines, predictive models, and production-ready AI solutions using Python, FastAPI, and modern ML technologies.",
    capabilities: faresCapabilities,
    highlights: ["Machine Learning", "Natural Language Processing", "RAG Systems", "Predictive Analytics", "FastAPI"],
    stats: ["3+ AI Projects", "5+ ML Models", "10+ Technologies", "End-to-End Development"],
    stackTitle: "AI & Data Stack",
    stackIntro: "Technologies used to design, develop, evaluate, and deploy intelligent AI solutions.",
    stackGroups: [
      {
        icon: "🧠",
        title: "AI & Machine Learning",
        items: ["Python", "Scikit-learn", "XGBoost", "Machine Learning", "Predictive Modeling"],
      },
      {
        icon: "💬",
        title: "NLP & LLM Applications",
        items: ["Natural Language Processing", "Text Classification", "TF-IDF", "Embeddings", "Semantic Search", "RAG Systems", "Hugging Face"],
      },
      {
        icon: "📊",
        title: "Data & Analytics",
        items: ["Pandas", "NumPy", "SQL", "PostgreSQL", "Feature Engineering", "Model Evaluation"],
      },
      {
        icon: "⚡",
        title: "Backend & Deployment",
        items: ["FastAPI", "REST APIs", "Git", "GitHub", "Docker"],
      },
    ],
    linkedin: "https://www.linkedin.com/in/faresalnamla-ai-engineer-ml-nlp",
    github: "https://github.com/FaresAlnamla",
  },
  {
    initials: "AK",
    name: "Ahmed Alkhateeb",
    role: "Data Scientist | NLP Specialist",
    subtitle: "Data Science & Artificial Intelligence Graduate",
    headline: "Turning Language Data Into Production AI Workflows",
    summaryLabel: "Profile Overview",
    text: "Data Scientist and NLP Specialist focused on text pipelines, predictive modeling, and LLM-powered applications. Experienced with RAG, LangChain/LangGraph, FastAPI, PostgreSQL, Docker, and production-oriented AI workflows.",
    capabilities: ahmedCapabilities,
    highlights: ["Natural Language Processing", "RAG Systems", "LLM Applications", "Predictive Analytics", "FastAPI"],
    stats: ["NLP Systems", "LLM Apps", "Data Pipelines", "Production Focus"],
    stack: ["Python", "LangChain", "LangGraph", "FastAPI", "PostgreSQL", "Docker"],
    linkedin: "https://www.linkedin.com/in/ahmedai",
    github: "https://github.com/ahmedalkhateebakh",
  },
];

const homeHeroCss = `
  :root {
    --home-motion-fast: 200ms;
    --home-motion-base: 300ms;
    --home-motion-slow: 900ms;
    --home-motion-card: 650ms;
  }

  body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: .03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
    mix-blend-mode: screen;
  }

  .section-divider {
    width: 100%;
    height: 18px;
    margin: 0;
    background: linear-gradient(180deg, rgba(13,27,42,0), rgba(94,234,212,0.012), rgba(13,27,42,0));
    position: relative;
    pointer-events: none;
  }

  .section-divider::after {
    content: "";
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(94,234,212,0.015),
      transparent
    );
    pointer-events: none;
  }

  .section-divider::before {
    content: "";
    position: absolute;
    left: 12%;
    right: 12%;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,234,212,0.16), rgba(56,189,248,0.1), transparent);
  }

  .home-hero::after {
    content: none;
  }

  .home-hero::before,
  .home-overview-section::before,
  .home-model-section::before,
  .home-team-section::before,
  .home-workspace-section::before,
  .home-footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.04),
      transparent
    );
    pointer-events: none;
  }

  .home-headline-word {
    display: inline-block;
    opacity: 0;
    transform: translateY(18px);
    animation: homeWordFadeUp .55s ease forwards;
    will-change: transform, opacity;
  }

  .home-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity var(--home-motion-card) ease,
      transform var(--home-motion-card) ease,
      border-color var(--home-motion-base) ease,
      background var(--home-motion-base) ease;
    transition-delay: var(--reveal-delay, 0ms);
    will-change: transform, opacity;
  }

  .home-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .home-section-title-motion.home-reveal {
    transform: translateY(12px);
    transition: none;
  }

  .home-section-title-motion.home-reveal.is-visible {
    animation: sectionTitleReveal .5s ease 100ms both;
    will-change: transform, opacity;
  }

  .home-premium-card.home-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition:
      transform 250ms ease,
      border-color 250ms ease,
      box-shadow 250ms ease;
  }

  .home-premium-card.home-reveal.is-visible {
    animation: cardReveal 550ms cubic-bezier(0.22, 1, 0.36, 1) var(--card-reveal-delay, 0ms) both;
    will-change: transform, opacity;
  }

  .home-impact-card-1,
  .home-team-card-1 { --card-reveal-delay: 0ms; }
  .home-impact-card-2,
  .home-team-card-2 { --card-reveal-delay: 80ms; }
  .home-impact-card-3,
  .home-team-card-3 { --card-reveal-delay: 160ms; }
  .home-impact-card-4,
  .home-team-card-4 { --card-reveal-delay: 240ms; }

  .home-premium-card.home-reveal.is-visible:hover {
    transform: translateY(-4px) !important;
    border-color: rgba(92,245,230,0.45) !important;
    box-shadow: 0 18px 40px rgba(0,0,0,0.18) !important;
  }

  .home-impact-chip,
  .home-contribution-tag {
    transition: transform 180ms ease, box-shadow 180ms ease;
    will-change: transform;
  }

  .home-impact-chip:hover,
  .home-contribution-tag:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 24px rgba(32,200,160,0.12);
  }

  .home-impact-card.is-visible .home-checkpoint-stat-value {
    animation: checkpointStatIn .32s ease-out var(--stat-delay) both;
    will-change: transform, opacity;
  }

  .home-impact-card.is-visible .home-checkpoint-progress-fill {
    animation: checkpointFill .7s ease-out .3s both;
  }

  .home-signal-segment {
    transform-origin: left center;
    will-change: transform;
  }

  .home-impact-card.is-visible .home-signal-segment {
    animation: barReveal .45s ease-out var(--segment-delay) both;
  }

  .home-signal-label {
    will-change: opacity;
  }

  .home-impact-card.is-visible .home-signal-label {
    animation: signalLabelIn .2s ease-out var(--label-delay) both;
  }

  .home-impact-card.is-visible .home-output-tier-bar {
    animation: riskExpand .7s ease-out .2s both;
  }

  .home-impact-card.is-visible .home-output-tier-label {
    animation: outputLabelIn .2s ease-out .9s both;
    will-change: opacity;
  }

  .home-impact-card.is-visible .home-output-threshold {
    animation: outputLabelIn .2s ease-out 1.1s both;
    will-change: opacity;
  }

  .home-decision-flow-row {
    will-change: transform, opacity;
  }

  .home-impact-card.is-visible .home-decision-flow-row {
    animation: slideRight .4s ease-out var(--row-delay) both;
  }

  .home-decision-chevron {
    will-change: transform;
  }

  .home-impact-card.is-visible .home-decision-chevron {
    animation: nudge .4s ease-out .6s both;
  }

  .home-section-label {
    position: relative;
    display: inline-block !important;
    transform: translateX(-18px);
    opacity: 0;
    transition: opacity .6s ease, transform .6s ease;
    will-change: transform, opacity;
  }

  .home-section-label::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -7px;
    width: 100%;
    height: 1px;
    border-radius: 999px;
    background: linear-gradient(90deg, #5eead4, transparent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .75s ease .12s;
  }

  .home-section-label.is-visible {
    transform: translateX(0);
    opacity: 1;
  }

  .home-section-label.is-visible::after {
    transform: scaleX(1);
  }

  .home-kicker-dot {
    animation: homeDotPulse 1.7s ease-in-out infinite;
  }

  .home-hero-category {
    opacity: 0;
    transform: translateY(4px);
    animation: homeCategoryIn 210ms cubic-bezier(0.22,1,0.36,1) 120ms both;
  }

  .home-feature-pill:hover {
    border-color: rgba(94,234,212,0.4) !important;
    color: #5eead4 !important;
    transform: translateY(-2px);
  }

  .home-feature-pill,
  .home-workspace-button {
    position: relative;
    overflow: hidden;
  }

  .home-feature-pill::after,
  .home-workspace-button::after {
    content: "";
    position: absolute;
    inset: -80% auto -80% -40%;
    width: 34px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent);
    transform: translateX(-120%) rotate(24deg);
    transition: transform .55s ease;
    pointer-events: none;
  }

  .home-feature-pill:hover::after,
  .home-workspace-button:hover::after {
    transform: translateX(780%) rotate(24deg);
  }

  .home-hero .home-story-flow {
    grid-template-columns: 1fr !important;
  }

  .home-step-card:hover {
    transform: translateX(5px);
    border-left-color: color-mix(in srgb, var(--step-color) 72%, white) !important;
    background: rgba(255,255,255,.065) !important;
  }

  .home-data-card:hover {
    border-color: rgba(94,234,212,0.3) !important;
  }

  .home-data-card:hover .home-data-tooltip {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }

  .home-data-card .home-data-progress-fill {
    transform: scaleX(0);
    transition: transform 1.8s cubic-bezier(.16,1,.3,1);
  }

  .home-data-card.is-counting .home-data-progress-fill,
  .home-data-card.is-visible .home-data-progress-fill {
    transform: scaleX(var(--stat-progress-scale, 1));
  }

  .home-data-card:hover strong {
    color: #5eead4 !important;
  }

  .home-overview-feature:hover {
    transform: translateX(4px);
  }

  .home-overview-feature:hover .home-overview-feature-icon {
    border-color: rgba(94,234,212,0.5) !important;
  }

  .home-overview-feature:hover .home-overview-feature-title {
    color: #f0f4f8 !important;
  }

  .home-impact-card:hover {
    border-color: rgba(92,245,230,0.45) !important;
    transform: translateY(-4px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.18) !important;
  }

  .home-member-card:hover {
    border-color: rgba(92,245,230,0.45) !important;
    box-shadow: 0 34px 110px rgba(0,0,0,0.34), 0 0 44px rgba(94,234,212,0.08) !important;
  }

  .home-member-card::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 23px;
    pointer-events: none;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.08), transparent 26%),
      radial-gradient(circle at var(--glow-x, 14%) var(--glow-y, 0%), rgba(94,234,212,0.12), transparent 34%);
    opacity: .9;
  }

  .home-member-card::after {
    content: "";
    position: absolute;
    left: 24px;
    right: 24px;
    top: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(94,234,212,0.62), rgba(127,119,221,0.48), transparent);
    pointer-events: none;
  }

  .home-member-card > * {
    position: relative;
    z-index: 1;
  }

  .home-member-cta {
    transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;
  }

  .home-member-cta:hover {
    transform: translateY(-2px);
  }

  .home-member-cta.primary:hover {
    box-shadow: 0 18px 42px rgba(56,189,248,0.22) !important;
  }

  .home-member-cta.secondary:hover {
    border-color: rgba(255,255,255,0.24) !important;
    background: rgba(255,255,255,0.085) !important;
  }

  .home-capability-card {
    opacity: 0;
    transform: translateY(12px);
  }

  .home-member-card.is-visible .home-capability-card {
    animation: capabilityFadeUp 460ms cubic-bezier(0.22,1,0.36,1) var(--capability-delay, 0ms) both;
  }

  .home-capability-card:hover {
    transform: translateY(-5px) !important;
    border-color: rgba(94,234,212,0.34) !important;
    background: rgba(255,255,255,0.065) !important;
    box-shadow: 0 18px 46px rgba(0,0,0,0.22), 0 0 28px rgba(94,234,212,0.08) !important;
  }

  .home-capability-card:hover .home-capability-icon {
    border-color: rgba(94,234,212,0.42) !important;
    color: #cffafe !important;
    box-shadow: 0 0 22px rgba(94,234,212,0.13);
  }

  .home-member-stat-card,
  .home-stack-chip,
  .home-stack-skill-pill,
  .home-stack-group-card {
    transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
  }

  .home-member-stat-card:hover,
  .home-stack-chip:hover {
    transform: translateY(-2px);
    border-color: rgba(94,234,212,0.28) !important;
  }

  .home-stack-group-card:hover {
    transform: translateY(-4px);
    border-color: rgba(94,234,212,0.34) !important;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035)),
      radial-gradient(circle at 18% 0%, rgba(94,234,212,0.13), transparent 42%) !important;
    box-shadow: 0 18px 46px rgba(0,0,0,0.22), 0 0 28px rgba(94,234,212,0.08) !important;
  }

  .home-stack-group-card:hover .home-stack-icon {
    border-color: rgba(94,234,212,0.36) !important;
    box-shadow: 0 0 26px rgba(94,234,212,0.15);
  }

  .home-stack-skill-pill:hover {
    transform: translateY(-2px);
    border-color: rgba(94,234,212,0.32) !important;
    background: rgba(94,234,212,0.10) !important;
    box-shadow: 0 10px 24px rgba(94,234,212,0.08);
  }

  .home-team-info-card:hover {
    border-color: rgba(92,245,230,0.45) !important;
    box-shadow: 0 18px 40px rgba(0,0,0,0.18) !important;
  }

  .home-team-social {
    transition:
      transform 200ms ease,
      background 200ms ease,
      border-color 200ms ease,
      color 200ms ease,
      box-shadow 200ms ease !important;
    will-change: transform;
  }

  .home-team-social.lbtn-li:hover {
    color: #0a66c2 !important;
    border-color: rgba(10,102,194,0.5) !important;
    background: rgba(10,102,194,0.2) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(10,102,194,0.16);
  }

  .home-team-social.lbtn-gh:hover {
    color: #f0f0f0 !important;
    border-color: rgba(255,255,255,0.35) !important;
    background: rgba(255,255,255,0.12) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255,255,255,0.10);
  }

  .home-team-social svg {
    width: 18px;
    height: 18px;
    display: block;
  }

  .home-workspace-step:hover {
    border-color: rgba(94,234,212,0.2) !important;
    transform: translateY(-2px);
  }

  @media (min-width: 1101px) {
    .home-workspace-step:not(:last-child)::after {
      content: "";
      position: absolute;
      top: 50%;
      right: -17px;
      width: 18px;
      border-top: 1px dashed rgba(255,255,255,0.08);
      transform: translateY(-50%);
      clip-path: inset(0 100% 0 0);
      pointer-events: none;
    }

    .home-workspace-step.is-visible:not(:last-child)::after {
      animation: homeDashDraw .8s ease forwards .35s;
    }
  }

  .home-workspace-card.predict:hover {
    border-color: rgba(94,234,212,0.25) !important;
    transform: translateY(-2px);
  }

  .home-workspace-card.eda:hover {
    border-color: rgba(83,74,183,0.25) !important;
    transform: translateY(-2px);
  }

  .home-workspace-button:hover {
    opacity: .9;
    transform: translateY(-1px);
    box-shadow: 0 16px 34px var(--workspace-shadow);
  }

  .home-workspace-button svg {
    transition: transform .42s cubic-bezier(.2,1.4,.3,1);
  }

  .home-workspace-button:hover svg {
    transform: translateX(4px);
  }

  .home-contribution-tag {
    transition: transform var(--home-motion-fast) ease, background var(--home-motion-fast) ease, color var(--home-motion-fast) ease;
  }

  .home-contribution-tag:hover {
    transform: scale(1.05);
    background: rgba(94,234,212,0.1) !important;
    color: rgba(255,255,255,0.78) !important;
  }

  .home-footer-link:hover {
    color: #5eead4 !important;
    border-left-color: var(--footer-accent) !important;
    padding-left: 8px !important;
    transform: translateX(3px);
  }

  .home-radar-wave {
    transform-origin: center;
    transform-box: fill-box;
    stroke-dasharray: 6 10;
    animation: homeRadarPulse 3s ease-in-out infinite;
  }

  .home-radar-wave:nth-of-type(2) { animation-delay: .45s; }
  .home-radar-wave:nth-of-type(3) { animation-delay: .9s; }

  .home-radar-sweep {
    transform-origin: 200px 200px;
    animation: homeRadarSweep 3s linear infinite;
  }

  .home-radar-trail {
    transform-origin: 200px 200px;
    animation: homeRadarSweep 3s linear infinite, homeRadarTrail 1s ease-out infinite;
  }

  .home-risk-card {
    opacity: 0;
    transform: translateY(16px);
    animation:
      homeRiskCardIn .62s ease forwards,
      homeRiskBreathe 2s ease-in-out infinite,
      homeRiskHit 3s ease-in-out infinite;
    box-shadow: 0 20px 54px rgba(0,0,0,.34), 0 0 0 rgba(0,0,0,0);
  }

  .home-risk-card.top { top: 28px; right: 4%; animation-delay: var(--risk-in-delay), 0s, .55s; }
  .home-risk-card.middle { left: 2%; top: 154px; animation-delay: var(--risk-in-delay), .2s, 1.45s; }
  .home-risk-card.bottom { top: 280px; right: 7%; bottom: auto; animation-delay: var(--risk-in-delay), .35s, 2.25s; }

  .home-risk-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,.16) !important;
    box-shadow: 0 26px 70px rgba(0,0,0,.45), 0 0 28px color-mix(in srgb, var(--risk-color) 38%, transparent) !important;
  }

  .home-risk-card:hover .home-risk-sparkline {
    height: 34px !important;
    opacity: 1 !important;
    margin-top: 7px;
  }

  .home-risk-urgent {
    animation: homeUrgentBlink 3s ease-in-out infinite;
  }

  .home-step-ring-progress {
    stroke-dasharray: 88;
    stroke-dashoffset: 88;
    transition: stroke-dashoffset .8s ease, filter .25s ease;
  }

  .home-step-card.is-visible .home-step-ring-progress,
  .home-workspace-step.is-visible .home-step-ring-progress {
    stroke-dashoffset: 18;
  }

  .home-step-card:hover .home-step-ring-progress,
  .home-workspace-step:hover .home-step-ring-progress {
    stroke-dashoffset: 0;
    filter: drop-shadow(0 0 8px var(--step-color, #5eead4));
  }

  @keyframes homeWordFadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes cardReveal {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes sectionTitleReveal {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardEntry {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes capabilityFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes checkpointStatIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes checkpointFill {
    from { width: 0; }
    to { width: var(--checkpoint-progress-target); }
  }

  @keyframes barReveal {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  @keyframes signalLabelIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes riskExpand {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes outputLabelIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes nudge {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }

  @keyframes homeDotPulse {
    0%, 100% { transform: scale(.78); opacity: .62; }
    50% { transform: scale(1.22); opacity: 1; }
  }

  @keyframes homeRadarPulse {
    0%, 100% { opacity: .34; transform: scale(1); }
    50% { opacity: .12; transform: scale(1.05); }
  }

  @keyframes homeRadarSweep {
    to { transform: rotate(360deg); }
  }

  @keyframes homeRiskCardIn {
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes homeMeshDrift {
    0% { transform: translate3d(-1%, -1%, 0) scale(1); }
    50% { transform: translate3d(1.2%, .8%, 0) scale(1.03); }
    100% { transform: translate3d(-.6%, 1.4%, 0) scale(1.01); }
  }

  @keyframes homeRadarTrail {
    0% { opacity: .7; }
    100% { opacity: .2; }
  }

  @keyframes homeRiskBreathe {
    0%, 100% {
      border-color: color-mix(in srgb, var(--risk-color) 55%, rgba(255,255,255,.09));
    }
    50% {
      border-color: color-mix(in srgb, var(--risk-color) 90%, white);
    }
  }

  @keyframes homeRiskHit {
    0%, 76%, 100% {
      box-shadow: 0 20px 54px rgba(0,0,0,.34), 0 0 0 rgba(0,0,0,0);
    }
    84% {
      box-shadow: 0 24px 64px rgba(0,0,0,.42), 0 0 34px color-mix(in srgb, var(--risk-color) 46%, transparent);
    }
  }

  @keyframes homeUrgentBlink {
    0%, 76%, 100% { opacity: .72; }
    82% { opacity: 1; box-shadow: 0 0 16px rgba(251,113,133,.45); }
  }

  @keyframes homeCategoryIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes homeDashDraw {
    to { clip-path: inset(0 0 0 0); }
  }

  @media (max-width: 1100px) {
    .home-hero-content, .home-overview-grid, .home-confidence-grid, .home-team-grid, .home-team-info-grid, .home-workspace-system, .home-portal-grid {
      grid-template-columns: 1fr !important;
    }

    .home-hero-visual {
      min-height: auto !important;
    }

    .home-team-grid,
    .home-team-info-grid {
      grid-template-columns: 1fr !important;
    }

    .home-member-capability-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .home-member-stack-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .home-hero {
      min-height: auto !important;
      padding: 42px 0 56px !important;
    }

    .home-hero-content {
      gap: 32px !important;
    }

    .home-radar-stage {
      height: 420px !important;
      min-height: 420px !important;
      max-width: 680px;
      margin: 0 auto;
    }

    .home-risk-card.top { top: 24px; right: 8%; }
    .home-risk-card.middle { left: 8%; top: 158px; }
    .home-risk-card.bottom { top: 294px; right: 10%; bottom: auto; }
  }

  @media (max-width: 768px) {
    .home-radar-sweep,
    .home-radar-trail,
    .home-radar-wave,
    .home-risk-card,
    .home-hero::after {
      animation-duration: 2.1s, .7s !important;
    }

  }

  @media (max-width: 680px) {
    .home-hero,
    .home-overview-section,
    .home-model-section,
    .home-team-section,
    .home-workspace-section {
      padding: 56px 0 !important;
    }

    .home-section-inner {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    .home-hero-title {
      font-size: 42px !important;
    }

    .home-risk-card {
      min-width: 132px !important;
      padding: 10px 12px !important;
    }

    .home-radar-stage {
      height: auto !important;
      min-height: auto !important;
      display: grid !important;
      justify-items: center !important;
      align-content: start !important;
      gap: 12px !important;
      overflow: visible !important;
      padding: 0 !important;
    }

    .home-radar-stage > .home-radar-visual-svg {
      position: relative !important;
      inset: auto !important;
      width: min(88%, 320px) !important;
      height: 260px !important;
      margin: 0 auto 4px !important;
      transform: none !important;
    }

    .home-risk-card,
    .home-risk-card.top,
    .home-risk-card.middle,
    .home-risk-card.bottom {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      bottom: auto !important;
      width: min(100%, 320px) !important;
      min-width: 0 !important;
    }

    .home-overview-title {
      font-size: 34px !important;
    }

    .home-overview-stats {
      grid-template-columns: 1fr !important;
    }

    .home-model-title {
      font-size: 34px !important;
    }

    .home-team-title {
      font-size: 34px !important;
    }

    .home-workspace-title {
      font-size: 34px !important;
    }

    .home-profile-header,
    .home-member-footer {
      grid-template-columns: 1fr !important;
    }

    .home-profile-header {
      display: block !important;
    }

    .home-profile-actions {
      margin-top: 16px !important;
    }

    .home-member-capability-grid,
    .home-member-stack-grid,
    .home-member-stats-grid {
      grid-template-columns: 1fr !important;
    }

    .home-member-footer {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .home-team-social-row {
      justify-content: flex-start !important;
    }

    .home-footer-main {
      grid-template-columns: 1fr 1fr !important;
      gap: 34px !important;
    }
  }

  @media (max-width: 680px) {
    .home-footer-main {
      grid-template-columns: 1fr !important;
    }

    .home-footer-bottom {
      flex-direction: column !important;
    }

    .home-footer-bottom-right {
      text-align: left !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }

    .home-reveal,
    .home-section-label,
    .home-headline-word,
    .home-risk-card {
      opacity: 1 !important;
      transform: none !important;
    }

    .home-step-ring-progress,
    .home-data-progress-fill {
      stroke-dashoffset: 0 !important;
      transform: none !important;
    }
  }
`;

function useHomeScrollReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(".home-reveal, .home-section-label, .home-step-card, .home-workspace-step"));
    if (!targets.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((target, index) => {
      if (target.classList.contains("home-reveal")) {
        target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 150}ms`);
      }
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.05) {
        target.classList.add("is-visible");
      } else {
        observer.observe(target);
      }
    });

    const fallback = window.setTimeout(() => {
      targets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.15) target.classList.add("is-visible");
      });
    }, 600);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);
}

export default function HomePage({ onOpenWorkspace }) {
  useHomeScrollReveal();
  const navigate = useNavigate();
  const openWorkspace = (id) => {
    const path = workspaceRouteMap[id] || "/";
    if (onOpenWorkspace) onOpenWorkspace(id);
    else navigate(path);
  };

  return (
    <div className="fade-in">
      <style>{homeHeroCss}</style>
      <header className="home-hero" style={homeStyles.hero}>
        <div style={homeStyles.heroPattern} />
        <div style={homeStyles.heroHeadlineGlow} />
        <div className="home-section-inner home-hero-content" style={homeStyles.heroContent}>
          <section style={homeStyles.heroMain}>
            <h1
              className="home-hero-title"
              style={homeStyles.storyTitle}
              aria-label="Identify at-risk students before they drop behind."
            >
              {headlineWords.map((word, index) => (
                <Fragment key={word}>
                  <span
                    className="home-headline-word"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {word}
                  </span>
                  {index < headlineWords.length - 1 ? " " : " "}
                </Fragment>
              ))}
              <span style={homeStyles.storyAccent}>
                {headlineAccentWords.map((word, index) => (
                  <Fragment key={word}>
                    <span
                      className="home-headline-word"
                      style={{ animationDelay: `${(headlineWords.length + index) * 50}ms` }}
                  >
                    {word}
                  </span>
                    {index < headlineAccentWords.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </span>
            </h1>
            <p style={homeStyles.subtitle}>
              Student Leak Radar analyzes engagement, assessment activity, and learning behavior to
              identify students at risk and help educators prioritize intervention before academic
              performance declines.
            </p>
            <div style={homeStyles.heroTagRow}>
              {heroFeatures.map(({ icon: Icon, label }) => (
                <span className="home-feature-pill" style={homeStyles.heroTag} key={label}>
                  <Icon size={15} strokeWidth={2.4} />
                  {label}
                </span>
              ))}
            </div>
          </section>

          <aside className="home-hero-visual" style={homeStyles.heroSide}>
            <HeroRadarVisual />
            <HeroStepStack />
          </aside>
        </div>
      </header>

      <div className="section-divider" aria-hidden="true" />

      <section className="home-overview-section" style={homeStyles.overviewSection}>
        <div style={homeStyles.overviewGlow} />
        <div className="home-section-inner" style={homeStyles.overviewInner}>
          <div style={homeStyles.overviewHeader}>
            <span className="home-section-label" style={homeStyles.overviewLabel}>System Overview</span>
            <h2 className="home-overview-title" style={homeStyles.overviewTitle}>
              Turning learning traces into timely student support
            </h2>
            <p style={homeStyles.overviewDesc}>
              Student Leak Radar helps universities and instructors notice academic risk before it
              becomes visible in final exams or withdrawal records. The project is especially useful
              in online, blended, and crisis-affected education contexts, where manual follow-up is
              difficult and students may disengage gradually because of weak communication, pressure,
              unstable access, or repeated interruptions.
            </p>
          </div>
          <div className="home-overview-grid" style={homeStyles.overviewGrid}>
            <article style={homeStyles.overviewPanel}>
              <h3 style={homeStyles.overviewPanelTitle}>Built from learning-platform evidence</h3>
              <p style={homeStyles.overviewPanelText}>
                The prototype uses OULAD, a real online-learning analytics dataset close to the data
                structure of LMS platforms such as Moodle. Raw course, assessment, VLE activity, and
                student-profile tables are converted into features that describe academic performance,
                engagement regularity, resource diversity, submission timing, and course progress.
              </p>
              <div className="home-overview-stats" style={homeStyles.overviewStatsGrid}>
                <DataPill value="32,593" label="course attempts" />
                <DataPill value="28,785" label="students" />
                <DataPill value="10M+" label="VLE clicks" />
                <DataPill value="173,912" label="submissions" />
              </div>
              <div style={homeStyles.overviewSource}>
                Source: OULAD Dataset — Open University Learning Analytics
                <ExternalLink size={12} strokeWidth={2.2} />
              </div>
            </article>
            <div style={homeStyles.overviewFeatureList}>
              {goals.map((item) => (
                <OverviewFeature key={item.title} icon={item.icon} title={item.title}>
                  {item.text}
                </OverviewFeature>
              ))}
              <OverviewFeature icon={Clock3} title="Arab-semester time mapping">
                Course events are normalized to relative progress and mapped to a 150-day semester,
                making 25% and 50% checkpoints easier to adapt to Arab university contexts.
              </OverviewFeature>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section className="home-model-section" style={homeStyles.modelSection}>
        <div style={homeStyles.modelGlow} />
        <div style={homeStyles.modelPattern} />
        <div className="home-section-inner" style={homeStyles.modelInner}>
          <div style={homeStyles.modelHeader}>
            <span className="home-section-label" style={homeStyles.modelLabel}>Random Forest Model</span>
            <h2 className="home-model-title home-section-title-motion home-reveal" style={homeStyles.modelTitle}>
              Two checkpoints for faster student support
            </h2>
            <p style={homeStyles.modelDesc}>
              The prediction workflow uses selected-feature Random Forest models at 25% and 50%
              of course progress. Reviewers get an early alert first, then a stronger mid-course
              confirmation with clearer evidence for intervention.
            </p>
          </div>
          <div className="home-confidence-grid" style={homeStyles.impactGrid}>
            {impactItems.map((item, index) => (
              <ImpactCard key={item.label} item={item} featured={index === 0} index={index} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section className="home-team-section" style={homeStyles.teamSection}>
        <div style={homeStyles.teamGlow} />
        <div className="home-section-inner" style={homeStyles.teamInner}>
          <div style={homeStyles.teamHeader}>
            <span className="home-section-label" style={homeStyles.teamLabel}>AI Engineer Profile</span>
            <h2 className="home-team-title home-section-title-motion home-reveal" style={homeStyles.teamTitle}>
              Professional AI and machine learning portfolio
            </h2>
            <p style={homeStyles.teamDesc}>
              A focused profile block for applied machine learning, NLP systems, predictive
              analytics, and AI-powered application development.
            </p>
          </div>
          <div className="home-team-grid" style={homeStyles.teamGrid}>
            {teamMembers.map((member, index) => (
              <TeamMember key={member.name} member={member} index={index} />
            ))}
          </div>
          <div className="home-team-info-grid" style={homeStyles.teamInfoGrid}>
            <TeamInfoCard icon={ShieldCheck} color="#20c8a0" title="Decision-support AI" revealIndex={2}>
              The model is positioned as decision support: it helps instructors prioritize outreach,
              academic support, and follow-up, without replacing human academic judgment.
            </TeamInfoCard>
            <TeamInfoCard
              icon={Rocket}
              color="#a89ee8"
              title="Future integration path"
              bullets={[
                "Moodle API integration",
                "SHAP explanations",
                "Teacher feedback loop",
                "Google Classroom support",
              ]}
              revealIndex={3}
            />
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <section className="home-workspace-section" style={homeStyles.workspaceSection}>
        <div style={homeStyles.workspaceGlow} />
        <div style={homeStyles.workspacePattern} />
        <div className="home-section-inner" style={homeStyles.workspaceInner}>
          <div style={homeStyles.workspaceHeader}>
            <span className="home-section-label" style={homeStyles.workspaceLabel}>Product Workspaces</span>
            <h2 className="home-workspace-title" style={homeStyles.workspaceTitle}>
              A complete workflow from prediction to intervention
            </h2>
            <p style={homeStyles.workspaceDesc}>
              The product is organized around the way academic reviewers actually work: validate the
              data contract, run model scoring, inspect cohort behavior, then move the highest-priority
              students into an intervention queue.
            </p>
          </div>
          <div className="home-workspace-system" style={homeStyles.workspaceSystem}>
            <WorkspaceStep index="01" title="Prepare the signal">
              Confirm CSV columns and feature readiness before the prediction flow starts.
            </WorkspaceStep>
            <WorkspaceStep index="02" title="Score the risk">
              Use the Prediction Console for one learner or a batch of students.
            </WorkspaceStep>
            <WorkspaceStep index="03" title="Explain the cohort">
              Use Intelligence Lab to inspect behavior, outcomes, and readiness patterns.
            </WorkspaceStep>
          </div>
          <div className="home-portal-grid" style={homeStyles.portalGrid}>
            {workspaceCards.map((card) => (
              <WorkspaceCard key={card.id} card={card} onOpen={() => openWorkspace(card.id)} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      <footer className="home-footer" style={homeStyles.footer}>
        <div style={homeStyles.footerGlow} />
        <div className="home-section-inner" style={homeStyles.footerInner}>
          <div className="home-footer-main" style={homeStyles.footerMain}>
            <div style={homeStyles.footerBrand}>
              <strong style={homeStyles.footerLogo}>
                Student <span style={homeStyles.footerLogoAccent}>Leak</span> Radar
              </strong>
              <p style={homeStyles.footerText}>
                AI-powered early warning for online and blended education, built to help institutions
                move from late reaction to timely student support.
              </p>
            </div>
            <FooterColumn title="System" accent="#5eead4" items={["Early warning", "Risk scoring", "Batch review"]} />
            <FooterColumn title="Data" accent="#38bdf8" items={["OULAD-based prototype", "17 selected signals", "CSV contracts"]} />
            <FooterColumn title="Team" accent="#7F77DD" items={["Fares Alnamla", "Ahmed Alkhateeb", "AI collaboration"]} />
          </div>
          <div style={homeStyles.footerDivider} />
          <div className="home-footer-bottom" style={homeStyles.footerBottom}>
            <span>&copy; 2026 Student Leak Radar. All rights reserved.</span>
            <span className="home-footer-bottom-right" style={homeStyles.footerBottomRight}>
              Responsible AI for intelligent education and early student support.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroRadarVisual() {
  return (
    <div className="home-radar-stage" style={homeStyles.radarStage}>
      <svg className="home-radar-visual-svg" style={homeStyles.radarSvg} viewBox="0 0 400 400" role="img" aria-label="Animated student risk radar">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(94,234,212,.34)" />
            <stop offset="100%" stopColor="rgba(94,234,212,0)" />
          </radialGradient>
          <linearGradient id="radarSweep" x1="200" y1="200" x2="360" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(94,234,212,.42)" />
            <stop offset="100%" stopColor="rgba(94,234,212,0)" />
          </linearGradient>
          <linearGradient id="radarTrail" x1="200" y1="200" x2="356" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(94,234,212,.32)" />
            <stop offset=".45" stopColor="rgba(94,234,212,.14)" />
            <stop offset="1" stopColor="rgba(94,234,212,0)" />
          </linearGradient>
          <filter id="centerGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="200" cy="200" r="156" fill="url(#radarGlow)" opacity=".38" />
        <circle className="home-radar-wave" cx="200" cy="200" r="86" fill="none" stroke="rgba(94,234,212,0.15)" strokeWidth="3" />
        <circle className="home-radar-wave" cx="200" cy="200" r="86" fill="none" stroke="rgba(94,234,212,0.15)" strokeWidth="3" />
        <circle className="home-radar-wave" cx="200" cy="200" r="86" fill="none" stroke="rgba(94,234,212,0.15)" strokeWidth="3" />
        <circle cx="200" cy="200" r="64" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="5 9" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" strokeDasharray="5 11" />
        <circle cx="200" cy="200" r="172" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" strokeDasharray="5 13" />
        <line x1="200" y1="28" x2="200" y2="372" stroke="rgba(255,255,255,.035)" strokeWidth="1" />
        <line x1="28" y1="200" x2="372" y2="200" stroke="rgba(255,255,255,.035)" strokeWidth="1" />
        <path className="home-radar-trail" d="M200 200 L350 118 A180 180 0 0 1 372 206 Z" fill="url(#radarTrail)" opacity=".55" />
        <path className="home-radar-sweep" d="M200 200 L358 168 A162 162 0 0 1 354 232 Z" fill="url(#radarSweep)" opacity=".75" />
        <circle cx="200" cy="200" r="10" fill="#5eead4" filter="url(#centerGlow)" />
        <circle cx="200" cy="200" r="3" fill="#effff7" />
      </svg>
      {heroRiskCards.map((card) => (
        <div
          key={card.name}
          className={`home-risk-card ${card.position}`}
          style={{
            ...homeStyles.riskMiniCard,
            "--risk-color": card.tone,
            "--risk-in-delay": card.delay,
          }}
        >
          <span style={homeStyles.riskCardTop}>
            <span style={homeStyles.riskName}>{card.name}</span>
            {card.urgent && <span className="home-risk-urgent" style={homeStyles.riskUrgentBadge}>URGENT</span>}
          </span>
          <strong style={homeStyles.riskValue}>{card.risk}</strong>
          <span style={homeStyles.riskMeta}>intervention queue</span>
          <span className="home-risk-sparkline" style={homeStyles.riskSparkline} aria-hidden="true">
            <svg width="116" height="34" viewBox="0 0 116 40">
              <path d={card.trend} fill="none" stroke="var(--risk-color)" strokeWidth="3" strokeLinecap="round" />
              <path d={card.trend} fill="none" stroke="var(--risk-color)" strokeWidth="8" strokeLinecap="round" opacity=".1" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}

function HeroStepStack() {
  return (
    <div className="home-story-flow" style={{ ...homeStyles.storyFlow, ...homeStyles.heroStepStack }}>
      {heroSteps.map((step) => (
        <StoryStep key={step.index} index={step.index} color={step.color} title={step.title}>
          {step.text}
        </StoryStep>
      ))}
    </div>
  );
}

function OverviewFeature({ icon: Icon, title, children }) {
  return (
    <article className="home-overview-feature" style={homeStyles.overviewFeatureItem}>
      <span className="home-overview-feature-icon" style={homeStyles.overviewFeatureIcon}>
        <Icon size={18} strokeWidth={2.3} />
      </span>
      <div>
        <strong className="home-overview-feature-title" style={homeStyles.overviewFeatureTitle}>{title}</strong>
        <p style={homeStyles.overviewFeatureText}>{children}</p>
      </div>
    </article>
  );
}

function DataPill({ value, label }) {
  const statConfigs = {
    "32,593": { start: 28000, end: 32593, progress: 88, tooltip: "Total course attempts used to model student-course outcomes." },
    "28,785": { start: 24000, end: 28785, progress: 82, tooltip: "Unique learner records represented in the learning analytics dataset." },
    "10M+": { start: 8100000, end: 10000000, progress: 94, compact: true, tooltip: "Learning-platform clicks converted into engagement and behavior signals." },
    "173,912": { start: 160000, end: 173912, progress: 76, tooltip: "Assessment submissions used to understand timing and performance patterns." },
  };
  const config = statConfigs[value] || { start: 0, end: Number(String(value).replace(/\D/g, "")) || 0, progress: 70, tooltip: "" };

  return (
    <div className="home-data-card home-reveal" style={homeStyles.dataPill}>
      <span className="home-data-tooltip" style={homeStyles.dataTooltip}>{config.tooltip}</span>
      <strong style={homeStyles.dataValue}>
        <CountUpValue {...config} original={value} />
      </strong>
      <span style={homeStyles.dataLabel}>{label}</span>
      <span style={homeStyles.dataProgressTrack}>
        <span
          className="home-data-progress-fill"
          style={{ ...homeStyles.dataProgressFill, "--stat-progress-scale": config.progress / 100 }}
        />
      </span>
    </div>
  );
}

function CountUpValue({ start, end, compact = false, original }) {
  const ref = useRef(null);
  const [value, setValue] = useState(start);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          node.closest(".home-data-card")?.classList.add("is-counting");
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;
    const duration = 1800;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, start, end]);

  const formatted = compact ? `${Math.min(10, value / 1000000).toFixed(value >= end ? 0 : 1)}M${value >= end ? "+" : ""}` : value.toLocaleString();
  return <span ref={ref}>{value >= end ? original : formatted}</span>;
}

function StoryStep({ index, color, title, children }) {
  return (
    <div className="home-step-card home-reveal" style={{ ...homeStyles.storyStep, "--step-color": color }}>
      <span style={homeStyles.storyStepIndex}>
        <StepRing color={color} />
        {index}
      </span>
      <strong style={homeStyles.storyStepTitle}>{title}</strong>
      <p style={homeStyles.storyStepText}>{children}</p>
    </div>
  );
}

function StepRing({ color = "#5eead4", size = 34 }) {
  const center = size / 2;
  const radius = center - 3;
  return (
    <svg style={homeStyles.stepRingSvg} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
      <circle
        className="home-step-ring-progress"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}

function ImpactCard({ item, featured = false, index = 0 }) {
  const Icon = item.icon;
  const cardClass = `home-impact-card home-premium-card home-impact-card-${index + 1} home-impact-card--${item.label.toLowerCase().replace(/\s+/g, "-")} home-reveal`;
  const title = featured ? item.value.replace("\n", " · ") : item.value;
  return (
    <article
      className={cardClass}
      style={{ ...homeStyles.impactCard, ...(featured ? homeStyles.impactFeatured : {}) }}
    >
      <span style={homeStyles.impactIcon}>
        <Icon size={22} strokeWidth={2.5} />
      </span>
      <span style={{ ...homeStyles.impactTag, ...(featured ? homeStyles.impactFeaturedTag : {}) }}>
        {item.label}
      </span>
      <strong style={homeStyles.impactNumber}>{title}</strong>
      <p style={homeStyles.impactText}>{item.text}</p>
      <ImpactCardExtra label={item.label} />
    </article>
  );
}

function ImpactCardExtra({ label }) {
  if (label === "Early Warning") {
    return (
      <div style={homeStyles.impactVisualDock}>
        <div style={homeStyles.impactCardFooter}>
          <div style={homeStyles.checkpointStatBlock}>
            <div style={homeStyles.checkpointStatRow}>
              <strong
                className="home-checkpoint-stat-value"
                style={{ ...homeStyles.checkpointStatValue, "--stat-delay": ".2s" }}
              >
                25%
              </strong>
              <span style={homeStyles.checkpointStatLabel}>course progress &middot; alert</span>
            </div>
            <span style={homeStyles.checkpointProgressTrack} aria-label="25 percent course progress">
              <span
                className="home-checkpoint-progress-fill"
                style={{ ...homeStyles.checkpointProgressFill, "--checkpoint-progress-target": "25%" }}
              />
            </span>
            <div style={homeStyles.checkpointStatRow}>
              <strong
                className="home-checkpoint-stat-value"
                style={{ ...homeStyles.checkpointStatValue, "--stat-delay": ".4s" }}
              >
                50%
              </strong>
              <span style={homeStyles.checkpointStatLabel}>course progress &middot; confirmation</span>
            </div>
            <span style={homeStyles.checkpointProgressTrack} aria-label="50 percent course progress">
              <span
                className="home-checkpoint-progress-fill"
                style={{ ...homeStyles.checkpointProgressFill, "--checkpoint-progress-target": "50%" }}
              />
            </span>
          </div>
          <div style={homeStyles.accuracyRow}>
            <span className="home-impact-chip" style={homeStyles.accuracyPill}>~80% accuracy at 25%</span>
            <span className="home-impact-chip" style={homeStyles.accuracyPill}>~86% accuracy at 50%</span>
          </div>
        </div>
      </div>
    );
  }

  if (label === "Selected Features") {
    const signals = [
      { label: "Academic", opacity: 0.9 },
      { label: "Timing", opacity: 0.72 },
      { label: "VLE", opacity: 0.55 },
      { label: "Engagement", opacity: 0.38 },
      { label: "Context", opacity: 0.2 },
    ];
    return (
      <div style={homeStyles.impactVisualDock}>
        <div style={homeStyles.signalPanel} aria-label="Selected feature signal groups">
          <div style={homeStyles.signalPanelBox}>
            <div style={homeStyles.signalPanelTop}>
              <span style={homeStyles.signalPanelLabel}>Model input</span>
              <span style={homeStyles.signalPanelValue}>17 signals across 5 groups</span>
            </div>
            <div style={homeStyles.stackedSignalBar}>
              {signals.map((signal, index) => (
                <span
                  key={signal.label}
                  className="home-signal-segment"
                  title={signal.label}
                  style={{
                    ...homeStyles.stackedSignalSegment,
                    opacity: signal.opacity,
                    "--segment-delay": `${(index + 1) / 10}s`,
                  }}
                />
              ))}
            </div>
            <div style={homeStyles.signalLabelRow}>
              {signals.map((signal, index) => (
                <span
                  key={signal.label}
                  className="home-signal-label"
                  style={{ ...homeStyles.signalSegmentLabel, "--label-delay": `${(index + 1) / 10 + 0.55}s` }}
                >
                  {signal.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (label === "Output") {
    const tiers = [
      { label: "Low", percent: "40%", color: "#20c8a0", width: "40%" },
      { label: "Medium", percent: "35%", color: "#f6c85f", width: "35%" },
      { label: "High", percent: "25%", color: "#fb7185", width: "25%" },
    ];
    return (
      <div style={homeStyles.impactVisualDock}>
        <div style={homeStyles.impactCardFooter}>
          <div style={homeStyles.outputTierBarShell}>
            <div className="home-output-tier-bar" style={homeStyles.outputTierBar} aria-label="Risk output distribution">
              {tiers.map((tier) => (
                <span
                  key={tier.label}
                  style={{
                    ...homeStyles.outputTierSegment,
                    width: tier.width,
                    background: tier.color,
                  }}
                >
                  <span className="home-output-tier-label">{tier.label} {tier.percent}</span>
                </span>
              ))}
            </div>
          </div>
          <span className="home-output-threshold" style={homeStyles.outputThreshold}>probability threshold: 0.42</span>
        </div>
      </div>
    );
  }

  if (label === "Decision Flow") {
    const flows = [
      { label: "Single student review", icon: User, iconClass: "ti-user" },
      { label: "Batch cohort upload", icon: Upload, iconClass: "ti-upload" },
    ];
    return (
      <div style={homeStyles.impactVisualDock}>
        <div style={homeStyles.decisionFlowList}>
          {flows.map((flow, index) => {
            const FlowIcon = flow.icon;
            return (
              <Fragment key={flow.label}>
                <span
                  className="home-decision-flow-row"
                  style={{ ...homeStyles.decisionFlowRow, "--row-delay": `${index === 0 ? 0.1 : 0.25}s` }}
                >
                  <FlowIcon className={flow.iconClass} size={16} strokeWidth={2.3} style={homeStyles.decisionIcon} />
                  {flow.label}
                  <ChevronRight className="ti-chevron-right home-decision-chevron" size={16} strokeWidth={2.4} style={homeStyles.decisionChevron} />
                </span>
                {index < flows.length - 1 && <span style={homeStyles.decisionFlowDivider} />}
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function WorkspaceStep({ index, title, children }) {
  return (
    <article className="home-workspace-step home-reveal" style={homeStyles.workspaceStep}>
      <span style={{ ...homeStyles.workspaceStepIndex, "--step-color": "#5eead4" }}>
        <StepRing color="#5eead4" />
        {index}
      </span>
      <strong style={homeStyles.workspaceStepTitle}>{title}</strong>
      <p style={homeStyles.workspaceStepText}>{children}</p>
    </article>
  );
}

function FooterColumn({ title, items, accent }) {
  return (
    <div>
      <strong style={homeStyles.footerColTitle}>{title}</strong>
      {items.map((item) => (
        <span
          key={item}
          className="home-footer-link"
          style={{ ...homeStyles.footerItem, "--footer-accent": accent }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SocialBrandIcon({ type }) {
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" focusable="false">
        <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" focusable="false">
      <path d="M6.94 8.98H3.75V20h3.19V8.98ZM5.35 4a1.86 1.86 0 1 0 0 3.72A1.86 1.86 0 0 0 5.35 4Zm15.15 9.68c0-3.12-1.67-4.57-3.89-4.57-1.79 0-2.59.98-3.04 1.67v-1.8h-3.18c.04 1.03 0 11.02 0 11.02h3.18v-6.15c0-.33.02-.66.12-.9.26-.66.85-1.34 1.85-1.34 1.3 0 1.82 1 1.82 2.45V20h3.19l-.05-6.32Z" />
    </svg>
  );
}

function TeamInfoCard({ icon: Icon, color, title, children, bullets, revealIndex = 0 }) {
  const isPurple = color === "#a89ee8";
  const iconBg = isPurple ? "rgba(127,119,221,0.15)" : "rgba(32,200,160,0.12)";
  const iconBorder = isPurple ? "rgba(168,158,232,0.22)" : "rgba(32,200,160,0.18)";
  return (
    <article
      className={`home-team-info-card home-premium-card home-team-card-${revealIndex + 1} home-reveal`}
      style={{
        ...homeStyles.teamInfoCard,
        "--team-info-color": color,
        "--team-info-icon-bg": iconBg,
        "--team-info-border": iconBorder,
      }}
    >
      <div>
        <span style={homeStyles.teamInfoIcon}>
          <Icon size={22} strokeWidth={2.3} />
        </span>
        <h3 style={homeStyles.teamInfoTitle}>{title}</h3>
      </div>
      {bullets ? (
        <ul style={homeStyles.roadmapList}>
          {bullets.map((item) => (
            <li key={item} style={homeStyles.roadmapItem}>
              <span style={homeStyles.roadmapDot} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={homeStyles.teamInfoText}>{children}</p>
      )}
    </article>
  );
}

function TeamMember({ member, index = 0 }) {
  const tags = member.highlights || member.skills || profileSkills;
  const avatarTone = member.initials === "AK" ? homeStyles.avatarAk : homeStyles.avatarFa;

  return (
    <article className={`home-member-card home-premium-card home-team-card-${index + 1} home-reveal`} style={homeStyles.memberCard}>
      <div className="home-profile-header" style={homeStyles.memberTop}>
        <div className="home-profile-identity" style={homeStyles.memberIdentity}>
          <span style={{ ...homeStyles.avatar, ...avatarTone }}>{member.initials}</span>
          <div style={homeStyles.memberTitleWrap}>
            <strong style={homeStyles.memberName}>{member.name}</strong>
            <span style={homeStyles.memberRole}>{member.role}</span>
            <span style={homeStyles.memberSubtitle}>{member.subtitle}</span>
          </div>
        </div>
      </div>

      <p style={homeStyles.memberText}>{member.text}</p>

      <div className="home-member-footer" style={homeStyles.memberFooter}>
        <div style={homeStyles.memberTagRow}>
          {tags.map((tag) => (
            <span key={tag} className="home-contribution-tag" style={homeStyles.memberTag}>{tag}</span>
          ))}
        </div>

        <div className="home-team-social-row" style={homeStyles.socialRow}>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} LinkedIn`}
            className="home-team-social lbtn-li"
            style={homeStyles.socialLink}
          >
            <SocialBrandIcon type="linkedin" />
          </a>
          <a
            href={member.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} GitHub`}
            className="home-team-social lbtn-gh"
            style={homeStyles.socialLink}
          >
            <SocialBrandIcon type="github" />
          </a>
        </div>
      </div>
    </article>
  );
}

function WorkspaceCard({ card, onOpen }) {
  const isPredict = card.id === "predict";
  const Icon = isPredict ? Radar : ChartScatter;
  const color = isPredict ? "#5eead4" : "#7F77DD";
  const colorRgb = isPredict ? "94,234,212" : "83,74,183";
  const buttonBg = isPredict
    ? "linear-gradient(135deg, #5eead4, #a8e86b)"
    : "linear-gradient(135deg, #534AB7, #7F77DD)";
  return (
    <article
      className={`home-workspace-card home-reveal ${card.id}`}
      style={{
        ...homeStyles.portalCard,
        "--workspace-color": color,
        "--workspace-bg": `rgba(${colorRgb},0.04)`,
        "--workspace-border": `rgba(${colorRgb},0.12)`,
        "--workspace-icon-bg": `rgba(${colorRgb},0.1)`,
        "--workspace-icon-border": `rgba(${colorRgb},0.2)`,
        "--workspace-button-bg": buttonBg,
        "--workspace-button-color": isPredict ? "#0d1117" : "#fff",
        "--workspace-shadow": `rgba(${colorRgb},0.22)`,
      }}
    >
      <div style={homeStyles.portalTop}>
        <div>
          <span style={homeStyles.portalEyebrow}>{card.eyebrow}</span>
          <h3 style={homeStyles.portalTitle}>{card.title}</h3>
          <p style={homeStyles.portalSummary}>{card.summary}</p>
        </div>
        <span style={homeStyles.portalIcon}>
          <Icon size={20} strokeWidth={2.4} />
        </span>
      </div>
      <div style={homeStyles.chipRow}>
        {card.bestFor.map((item) => (
          <span key={item} style={homeStyles.chip}>
            <span style={homeStyles.chipDot} />
            {item}
          </span>
        ))}
      </div>
      <p style={homeStyles.portalOutput}>{card.output}</p>
      <button type="button" className="home-workspace-button" style={homeStyles.openButton} onClick={onOpen}>
        Open {card.title}
        <ArrowRight size={17} strokeWidth={2.2} />
      </button>
    </article>
  );
}
