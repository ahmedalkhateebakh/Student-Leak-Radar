export const globalStyles = `
  :root {
    --font-display: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --spacing-xs: 6px;
    --spacing-sm: 10px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 36px;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --shadow-sm: 0 10px 28px rgba(0,0,0,.18);
    --shadow-md: 0 18px 48px rgba(0,0,0,.24);
    --shadow-lg: 0 30px 100px rgba(0,0,0,.38);
    --transition-fast: 160ms cubic-bezier(0.22,1,0.36,1);
    --transition-normal: 260ms cubic-bezier(0.22,1,0.36,1);
    --transition-slow: 520ms cubic-bezier(0.22,1,0.36,1);
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #0d1b2a; }
  button, input, select { font-family: inherit; }
  button:disabled { cursor: not-allowed; }

  .fade-in {
    animation: fadeIn .28s ease both;
  }

  .ui-reveal {
    animation: fadeSlideUp .4s ease both;
    will-change: transform, opacity;
  }

  .selection-card {
    will-change: transform, opacity;
  }

  .selection-card:hover {
    transform: translateY(-2px) !important;
  }

  .selection-card.is-selected {
    border-color: #5eead4 !important;
    background: rgba(94,234,212,0.05) !important;
  }

  .primary-action .action-arrow {
    display: inline-block;
    transition: transform .2s ease;
  }

  .primary-action:hover .action-arrow {
    transform: translateX(4px);
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

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
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
      radial-gradient(circle at 70% 30%, rgba(96,165,250,.22), transparent 55%);
    opacity: 0;
    filter: blur(14px);
    transform: scale(.75);
    transition: .32s ease;
    z-index: -1;
  }

  .smoke-hover:hover {
    transform: translateY(-4px) scale(1.08) rotate(-4deg);
    filter: drop-shadow(0 18px 28px rgba(94,234,212,.25));
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

  button:active:not(:disabled),
  a:active {
    transform: scale(.97);
  }

  input:focus,
  select:focus {
    border-color: rgba(110, 231, 183, .75) !important;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, .12);
  }

  @media (max-width: 900px) {
    .hide-mobile { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "radial-gradient(circle at top left, #0f172a 0%, #0b1220 42%, #020617 100%)",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif",
    padding: "28px 16px 56px",
  },
  bgOrbOne: { position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "rgba(94,234,212,.18)", filter: "blur(80px)", top: -150, left: -120 },
  bgOrbTwo: { position: "fixed", width: 460, height: 460, borderRadius: "50%", background: "rgba(96,165,250,.12)", filter: "blur(90px)", bottom: -180, right: -120 },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.8), transparent)", pointerEvents: "none" },
  shell: { position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto" },
  header: { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 30, textAlign: "center" },
  heroContent: { width: "100%", maxWidth: 980, margin: "0 auto", padding: "8px 0 4px" },
  kicker: { display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#5eead4", fontSize: 12, fontWeight: 900, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 12, padding: "8px 14px", border: "1px solid rgba(94,234,212,.24)", borderRadius: 999, background: "rgba(94,234,212,.10)", boxShadow: "0 14px 50px rgba(94,234,212,.10)" },
  title: { margin: 0, fontSize: "clamp(42px, 7vw, 82px)", lineHeight: .9, letterSpacing: "-.075em", fontWeight: 950, color: "#f8fafc", textShadow: "0 22px 70px rgba(0,0,0,.55)" },
  subtitleCard: { position: "relative", maxWidth: 900, margin: "26px auto 0", padding: "22px 28px", borderRadius: 28, background: "linear-gradient(135deg, rgba(15,23,42,.72), rgba(2,6,23,.50))", border: "1px solid rgba(110,231,183,.16)", boxShadow: "0 30px 90px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05)", backdropFilter: "blur(18px)", overflow: "hidden" },
  subtitleAccent: { display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10, color: "#38bdf8", fontSize: 12, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" },
  subtitle: { maxWidth: 820, margin: "0 auto", color: "#dbeafe", fontSize: "clamp(16px, 1.65vw, 20px)", lineHeight: 1.75, fontWeight: 650, textAlign: "center", letterSpacing: "-.015em" },

  // Page navigation tabs
  pageNav: { display: "flex", gap: 6, padding: 6, border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.48)", borderRadius: 18, marginBottom: 20 },
  pageNavBtn: { flex: 1, border: 0, color: "#94a3b8", background: "transparent", padding: "11px 20px", borderRadius: 14, cursor: "pointer", fontWeight: 900, fontSize: 15 },
  pageNavActive: { color: "#020617", background: "linear-gradient(135deg,#5eead4,#38bdf8)" },

  statBox: { padding: "14px 16px", border: "1px solid rgba(255,255,255,.10)", borderRadius: 18, background: "rgba(15,23,42,.58)", backdropFilter: "blur(16px)", minWidth: 100 },
  statLabel: { display: "block", color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: 800, letterSpacing: ".12em", marginBottom: 6 },
  statValue: { color: "#fff", fontSize: 18 },
  statDanger: { color: "#fecaca", borderColor: "rgba(248,113,113,.42)", background: "linear-gradient(135deg, rgba(248,113,113,.20), rgba(15,23,42,.64))", boxShadow: "0 18px 48px rgba(248,113,113,.14)" },
  statWarning: { color: "#dbeafe", borderColor: "rgba(96,165,250,.42)", background: "linear-gradient(135deg, rgba(96,165,250,.18), rgba(15,23,42,.64))", boxShadow: "0 18px 48px rgba(96,165,250,.12)" },
  statCalm: { color: "#bfdbfe", borderColor: "rgba(96,165,250,.40)", background: "linear-gradient(135deg, rgba(96,165,250,.16), rgba(15,23,42,.64))", boxShadow: "0 18px 48px rgba(96,165,250,.10)" },
  statDriver: { color: "#ffe4ea", borderColor: "rgba(251,113,133,.44)", background: "linear-gradient(135deg, rgba(251,113,133,.18), rgba(56,189,248,.08))", boxShadow: "0 18px 48px rgba(251,113,133,.12)" },
  stepper: { display: "flex", alignItems: "center", gap: 0, padding: 16, border: "1px solid rgba(255,255,255,.10)", borderRadius: 26, background: "rgba(15,23,42,.70)", backdropFilter: "blur(18px)", marginBottom: 20, overflowX: "auto" },
  stepButton: { display: "flex", alignItems: "center", flex: 1, border: 0, background: "transparent", cursor: "pointer", minWidth: 130 },
  stepDot: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 },
  stepDone: { background: "linear-gradient(135deg,#5eead4,#60a5fa)", color: "#020617", boxShadow: "0 0 0 6px rgba(94,234,212,.12)" },
  stepActive: { background: "#fff", color: "#0f172a", boxShadow: "0 0 0 6px rgba(255,255,255,.08)" },
  stepIdle: { border: "1px solid #334155", color: "#64748b", background: "rgba(15,23,42,.5)" },
  stepLabel: { marginLeft: 10, marginRight: 14, fontWeight: 850, whiteSpace: "nowrap" },
  stepLine: { height: 2, flex: 1, minWidth: 42, borderRadius: 99 },
  card: { border: "1px solid rgba(255,255,255,.11)", borderRadius: 34, background: "linear-gradient(180deg, rgba(15,23,42,.88), rgba(2,6,23,.78))", backdropFilter: "blur(22px)", boxShadow: "0 30px 100px rgba(0,0,0,.42)", padding: "clamp(22px, 4vw, 42px)" },
  sectionIntro: { marginBottom: 28 },
  eyebrow: { color: "#38bdf8", fontWeight: 900, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase" },
  stepTitle: { margin: "8px 0 8px", fontSize: "clamp(26px, 4vw, 42px)", lineHeight: 1, letterSpacing: "-.04em" },
  stepDesc: { margin: 0, color: "#94a3b8", lineHeight: 1.7, maxWidth: 800 },
  choiceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 18 },
  choiceCard: { textAlign: "left", border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.58)", color: "#fff", borderRadius: 28, padding: 24, cursor: "pointer", transition: ".2s", minHeight: 260 },
  choiceActive: { borderColor: "rgba(94,234,212,.85)", background: "linear-gradient(135deg, rgba(94,234,212,.15), rgba(96,165,250,.10))", transform: "translateY(-2px)", boxShadow: "0 24px 70px rgba(94,234,212,.13)" },
  choiceTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  choiceIcon: { width: 50, height: 50, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#dbeafe" },
  activeBadge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#99f6e4", border: "1px solid rgba(94,234,212,.45)", background: "rgba(94,234,212,.16)", borderRadius: 99, padding: "7px 11px", fontWeight: 900 },
  idleBadge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", border: "1px solid rgba(148,163,184,.2)", borderRadius: 99, padding: "7px 11px", fontWeight: 900 },
  choiceTitle: { margin: "0 0 10px", fontSize: 22, letterSpacing: "-.02em" },
  choiceDesc: { color: "#94a3b8", lineHeight: 1.65, margin: "0 0 18px" },
  bulletList: { display: "flex", flexWrap: "wrap", gap: 8 },
  bullet: { color: "#99f6e4", background: "rgba(94,234,212,.12)", border: "1px solid rgba(94,234,212,.24)", padding: "7px 10px", borderRadius: 99, fontSize: 12, fontWeight: 800 },
  modelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 18 },
  modelCard: { position: "relative", textAlign: "left", border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.58)", color: "#fff", borderRadius: 30, padding: 26, cursor: "pointer", minHeight: 280, overflow: "hidden" },
  modelActive: { borderColor: "rgba(94,234,212,.9)", background: "linear-gradient(135deg, rgba(94,234,212,.18), rgba(96,165,250,.08))", boxShadow: "0 24px 80px rgba(94,234,212,.14)" },
  modelPercent: { fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 950, letterSpacing: 0, lineHeight: .95, color: "#fff", margin: "12px 0 18px" },
  modelTitle: { fontSize: 24, margin: "0", paddingRight: 118 },
  modelDesc: { color: "#94a3b8", lineHeight: 1.65, margin: "0 0 20px" },
  metricList: { display: "flex", flexWrap: "wrap", gap: 8 },
  metricPill: { color: "#cffafe", background: "rgba(94,234,212,.08)", border: "1px solid rgba(94,234,212,.18)", padding: "7px 10px", borderRadius: 99, fontSize: 12, fontWeight: 800 },
  modelSelectionBadge: { position: "absolute", top: 22, right: 22 },
  segmentedControl: { display: "inline-flex", padding: 6, gap: 6, border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.48)", borderRadius: 18, marginBottom: 24 },
  segmentBtn: { border: 0, color: "#94a3b8", background: "transparent", padding: "11px 16px", borderRadius: 14, cursor: "pointer", fontWeight: 900 },
  segmentActive: { color: "#020617", background: "linear-gradient(135deg,#5eead4,#38bdf8)" },
  dropZone: { border: "2px dashed", borderRadius: 30, minHeight: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", padding: 30, transition: ".2s" },
  dropIcon: { width: 58, height: 58, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#EAF2FF", marginBottom: 12, border: "1px solid rgba(220,231,245,0.14)", borderRadius: 18, background: "rgba(255,255,255,0.035)", backdropFilter: "blur(12px)", boxShadow: "none" },
  dropTitle: { margin: "0 0 8px", fontSize: 24 },
  dropText: { margin: 0, color: "#94a3b8", maxWidth: 560, lineHeight: 1.7 },
  fileList: { display: "grid", gap: 10, marginTop: 18 },
  fileItem: { display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.55)" },
  fileBadge: { width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18, color: "#DCE7F5", border: "1px solid rgba(220,231,245,0.14)", background: "rgba(255,255,255,0.035)", backdropFilter: "blur(12px)", boxShadow: "none" },
  fileName: { color: "#fff", fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileMeta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  removeBtn: { border: 0, width: 36, height: 36, borderRadius: "50%", background: "rgba(239,68,68,.12)", color: "#fecaca", cursor: "pointer", fontSize: 22 },
  progressBox: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.45)", borderRadius: 24, padding: 20, marginBottom: 22 },
  progressTitle: { fontWeight: 950, fontSize: 17 },
  progressDesc: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  progressCircle: { width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#5eead4,#60a5fa)", color: "#020617", fontWeight: 950 },
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
  gaugeWrap: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "radial-gradient(circle at center, rgba(251,113,133,.14), rgba(15,23,42,.62))", padding: 24, textAlign: "center" },
  gaugeOuter: { position: "relative", width: 220, height: 220, borderRadius: "50%", margin: "0 auto", background: "conic-gradient(from 220deg, #5eead4, #60a5fa, #ef4444, #1e293b 72%)", display: "flex", alignItems: "center", justifyContent: "center" },
  gaugeNeedleWrap: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  gaugeNeedle: { width: 4, height: 90, background: "#fff", transformOrigin: "50% 100%", borderRadius: 99, marginTop: -90 },
  gaugeInner: { width: 150, height: 150, borderRadius: "50%", background: "#07111f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, border: "1px solid rgba(255,255,255,.12)" },
  gaugeScore: { fontSize: 48, fontWeight: 950, letterSpacing: "-.04em" },
  gaugeLabel: { maxWidth: 116, color: "#94a3b8", fontSize: 11, lineHeight: 1.2, fontWeight: 900 },
  gaugeLevel: { marginTop: 18, fontSize: 24, fontWeight: 950 },
  resultSummary: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "rgba(15,23,42,.52)", padding: 28 },
  resultLabel: { color: "#38bdf8", fontWeight: 900, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase" },
  resultTitle: { fontSize: 44, lineHeight: 1, margin: "12px 0", letterSpacing: "-.05em" },
  resultText: { color: "#94a3b8", lineHeight: 1.7, maxWidth: 620 },
  resultStatsRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 },
  riskBandGuide: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 28, background: "rgba(15,23,42,.50)", padding: 20, marginBottom: 20 },
  riskBandGuideHeader: { marginBottom: 16 },
  riskBandGuideTitle: { margin: "7px 0 0", color: "#f8fafc", fontSize: 24, letterSpacing: "-.04em" },
  riskBandGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  riskBandCard: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 20, padding: "18px 16px 16px" },
  riskBandTop: { display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(148,163,184,.14)", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 900, letterSpacing: ".035em", marginBottom: 14 },
  riskBandDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0 },
  riskBandName: { display: "block", color: "#fff", fontSize: 20, fontWeight: 950, letterSpacing: "-.03em" },
  riskBandCount: { color: "#fff", fontSize: 28, fontWeight: 950, letterSpacing: "-.04em", margin: "12px 0 8px" },
  riskBandMeta: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", color: "#94a3b8", fontSize: 12, lineHeight: 1.45 },
  dashboardSection: { border: "1px solid rgba(255,255,255,.08)", borderRadius: 30, background: "linear-gradient(180deg, rgba(15,23,42,.44), rgba(2,6,23,.22))", padding: 18, marginBottom: 20 },
  dashboardSectionHeader: { display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 16 },
  dashboardSectionEyebrow: { color: "#5eead4", fontSize: 12, fontWeight: 950, letterSpacing: ".16em", textTransform: "uppercase" },
  dashboardSectionTitle: { margin: "7px 0 6px", color: "#fff", fontSize: 24, letterSpacing: "-.04em" },
  dashboardSectionDesc: { margin: 0, color: "#94a3b8", maxWidth: 760, lineHeight: 1.6, fontSize: 13 },
  contextGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 16, alignItems: "stretch" },
  contextChartCard: { minHeight: 470, padding: 20 },
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16, marginBottom: 0 },
  chartCard: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 26, background: "rgba(15,23,42,.52)", padding: 18, minHeight: 260 },
  chartCardWide: { gridColumn: "1 / -1", minHeight: 420 },
  chartHeader: { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  chartTitle: { margin: 0, fontSize: 17 },
  chartSubtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 12 },
  chartBadge: { height: 28, color: "#99f6e4", background: "rgba(94,234,212,.14)", border: "1px solid rgba(94,234,212,.30)", borderRadius: 99, padding: "6px 10px", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" },
  svgChart: { width: "100%", height: 170, display: "block" },
  insightSummaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 },
  edaPanelWrap: { display: "grid", gap: 18 },
  edaStatStrip: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 },
  plotlyChart: { width: "100%", minHeight: 315 },
  plotlyLoading: { minHeight: 315, display: "grid", placeItems: "center", borderRadius: 22, border: "1px dashed rgba(94,234,212,.22)", color: "#94a3b8", background: "rgba(2,6,23,.28)", fontSize: 13 },
  plotlyFallbackNote: { marginBottom: 12, border: "1px solid rgba(56,189,248,.22)", color: "#cffafe", background: "rgba(56,189,248,.08)", borderRadius: 14, padding: "10px 12px", fontSize: 12, fontWeight: 800 },
  vleMixList: { display: "grid", gap: 13, paddingTop: 4 },
  vleMixRow: { display: "grid", gridTemplateColumns: "128px minmax(160px,1fr) 108px", alignItems: "center", gap: 14 },
  vleMixLabel: { color: "#e2e8f0", fontSize: 13, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  vleMixTrack: { height: 24, borderRadius: 999, background: "rgba(2,6,23,.62)", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" },
  vleMixFill: { height: "100%", borderRadius: 999, transition: "width .55s ease" },
  vleMixValue: { color: "#94a3b8", fontSize: 12, textAlign: "right", whiteSpace: "nowrap" },
  demographicGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 },
  demographicCard: { border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, background: "rgba(2,6,23,.28)", padding: 15, minHeight: 160 },
  demographicTitle: { margin: "0 0 14px", color: "#f8fafc", fontSize: 14, letterSpacing: "-.02em" },
  demographicRows: { display: "grid", gap: 12 },
  demographicRow: { display: "grid", gridTemplateColumns: "minmax(110px,1fr) minmax(62px,.72fr) 30px", alignItems: "center", gap: 10 },
  demographicLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: 850, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  demographicTrack: { height: 18, borderRadius: 999, background: "rgba(2,6,23,.70)", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" },
  demographicFill: { height: "100%", minWidth: 6, borderRadius: 999, boxShadow: "0 0 18px rgba(94,234,212,.24)" },
  demographicValue: { color: "#94a3b8", fontSize: 12, textAlign: "right" },
  chartLegendRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "12px 14px", borderRadius: 16, background: "rgba(2,6,23,.36)", border: "1px solid rgba(255,255,255,.08)" },
  legendHelp: { color: "#94a3b8", fontSize: 12, lineHeight: 1.5, flex: "1 1 260px" },
  tierHeroGrid: { display: "grid", gridTemplateColumns: "minmax(180px,.42fr) 1fr", gap: 14, alignItems: "stretch", marginBottom: 14 },
  tierTotalCard: { border: "1px solid rgba(251,113,133,.24)", background: "linear-gradient(180deg, rgba(251,113,133,.13), rgba(15,23,42,.46))", borderRadius: 20, padding: 18 },
  tierTotalValue: { display: "block", color: "#fff", fontSize: 38, fontWeight: 950, letterSpacing: "-.06em", marginTop: 8 },
  tierTotalText: { margin: "8px 0 0", color: "#94a3b8", fontSize: 13, lineHeight: 1.55 },
  tierStackWrap: { display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, border: "1px solid rgba(255,255,255,.08)", background: "rgba(2,6,23,.28)", borderRadius: 20, padding: 18 },
  tierStackBar: { display: "flex", height: 38, borderRadius: 999, overflow: "hidden", background: "rgba(2,6,23,.72)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" },
  reviewOrderBox: { border: "1px solid rgba(255,255,255,.08)", background: "rgba(2,6,23,.30)", borderRadius: 22, padding: 18 },
  reviewOrderTitle: { margin: "6px 0 14px", color: "#f8fafc", fontSize: 18, letterSpacing: "-.02em" },
  reviewOrderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  reviewOrderStep: { display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid rgba(255,255,255,.10)", borderRadius: 18, padding: 14 },
  reviewOrderIndex: { width: 28, height: 28, borderRadius: 999, color: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, flexShrink: 0 },
  reviewOrderStepTitle: { display: "block", color: "#fff", fontSize: 14, marginBottom: 4 },
  reviewOrderStepText: { margin: 0, color: "#94a3b8", fontSize: 12, lineHeight: 1.5 },
  driverExplainBox: { display: "grid", gap: 4, border: "1px solid rgba(251,113,133,.22)", background: "linear-gradient(135deg, rgba(251,113,133,.10), rgba(56,189,248,.07))", borderRadius: 18, padding: 14, color: "#cbd5e1", lineHeight: 1.55, fontSize: 13 },
  driverRow: { border: "1px solid rgba(255,255,255,.08)", background: "rgba(2,6,23,.32)", borderRadius: 18, padding: 14 },
  driverHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 8 },
  driverName: { color: "#f8fafc", fontSize: 15, fontWeight: 950 },
  driverMeaning: { margin: "5px 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.45 },
  driverScore: { color: "#fff", fontSize: 22, fontWeight: 950, letterSpacing: "-.04em" },
  driverMetaRow: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, color: "#64748b", fontSize: 12, marginBottom: 9 },
  driverTrack: { height: 18, borderRadius: 999, background: "rgba(2,6,23,.78)", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)" },
  miniGaugeBox: { position: "relative", height: 54, borderRadius: 999, overflow: "hidden", background: "rgba(2,6,23,.75)", border: "1px solid rgba(255,255,255,.10)", marginTop: 70 },
  miniGaugeFill: { height: "100%", background: "linear-gradient(90deg,#5eead4,#60a5fa,#ef4444)", borderRadius: 999 },
  miniGaugeText: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950 },
  fileError: { marginTop: 14, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.10)", color: "#fecaca", borderRadius: 16, padding: "12px 14px", fontWeight: 800 },
  batchPreviewBox: { marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,0.05)", borderRadius: 22, padding: 18, overflow: "visible" },
  batchPreviewTitle: { color: "#99f6e4", fontWeight: 950, fontSize: 16 },
  batchPreviewText: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  batchPreviewCount: { width: "fit-content", maxWidth: "100%", minWidth: 62, display: "grid", alignItems: "center", justifyContent: "center", textAlign: "center", borderRadius: 16, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(220,231,245,0.14)", color: "#FFFFFF", fontWeight: 800, padding: "10px 14px", lineHeight: 1.05, boxShadow: "none" },
  batchResultsBox: { border: "1px solid rgba(255,255,255,.10)", borderRadius: 30, background: "rgba(15,23,42,.52)", padding: 22, marginBottom: 20 },
  batchResultsHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 18 },
  batchResultsIntro: { flex: "1 1 560px", minWidth: 0 },
  batchResultsTitle: { margin: "8px 0 6px", fontSize: 26, letterSpacing: "-.04em" },
  batchResultsDesc: { margin: 0, color: "#94a3b8", lineHeight: 1.6, maxWidth: 620 },
  batchStatsWrap: { display: "flex", gap: 10, flexWrap: "wrap" },
  tableWrap: { width: "100%", overflowX: "auto", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)" },
  resultsTable: { width: "100%", borderCollapse: "collapse", minWidth: 880, background: "rgba(2,6,23,.36)" },
  interventionTable: { width: "100%", borderCollapse: "collapse", minWidth: 900, background: "rgba(2,6,23,.36)", tableLayout: "fixed" },
  tableHead: { textAlign: "left", padding: "14px 16px", color: "#99f6e4", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", borderBottom: "1px solid rgba(255,255,255,.10)", whiteSpace: "nowrap" },
  tableRow: { borderBottom: "1px solid rgba(255,255,255,.07)" },
  tableCell: { padding: "14px 16px", color: "#e2e8f0", fontSize: 13, whiteSpace: "nowrap" },
  studentCell: { display: "inline-flex", color: "#fff", fontSize: 14, fontWeight: 500 },
  riskScoreCell: { display: "grid", gap: 7, width: "min(100%, 170px)" },
  riskScoreTopLine: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  riskScoreNumber: { fontSize: 26, lineHeight: 1, fontWeight: 950, letterSpacing: "-.04em" },
  riskScoreLevel: { fontSize: 12, fontWeight: 950, whiteSpace: "nowrap" },
  riskScoreTrack: { height: 6, borderRadius: 999, background: "rgba(148,163,184,.14)", overflow: "hidden" },
  riskScoreFill: { display: "block", height: "100%", borderRadius: 999, boxShadow: "0 0 18px rgba(251,113,133,.22)" },
  metricStack: { display: "inline-grid", gap: 3, minWidth: 86 },
  metricStackCompact: { marginLeft: 16 },
  metricStackLabel: { color: "#64748b", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  metricStackValue: { color: "#f8fafc", fontSize: 15, fontWeight: 850 },
  nextActionPill: { display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#dbeafe", background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.24)", borderRadius: 999, padding: "8px 11px", fontSize: 12, fontWeight: 900 },
  riskPill: { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 950 },
  highRiskPill: { color: "#fecaca", background: "rgba(239,68,68,.13)", border: "1px solid rgba(239,68,68,.25)" },
  mediumRiskPill: { color: "#cffafe", background: "rgba(96,165,250,.13)", border: "1px solid rgba(96,165,250,.25)" },
  lowRiskPill: { color: "#bfdbfe", background: "rgba(96,165,250,.16)", border: "1px solid rgba(96,165,250,.34)" },
  navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.10)" },
  resultFooter: { display: "grid", gridTemplateColumns: "minmax(220px, 280px) minmax(360px, 1fr) minmax(220px, auto)", alignItems: "center", gap: 18, marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.10)", overflow: "visible" },
  resultFooterRight: { display: "flex", justifyContent: "flex-end", minWidth: 0, overflow: "visible" },
  footerNavBtn: { width: 258, minHeight: 62, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 16, fontSize: 16 },
  resultActionGroup: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" },
  exportPanel: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", justifyContent: "space-between", gap: 24, width: "100%", minWidth: 0, minHeight: 92, padding: "18px 20px", border: "1px solid rgba(148,163,184,.18)", borderRadius: 20, background: "linear-gradient(135deg, rgba(15,23,42,.72), rgba(2,6,23,.44))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)" },
  exportInfo: { minWidth: 0, alignSelf: "center" },
  exportTitle: { color: "#f8fafc", fontSize: 15, lineHeight: 1.15, fontWeight: 950, letterSpacing: ".02em" },
  exportDesc: { margin: "8px 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.45, maxWidth: 390 },
  exportActions: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexShrink: 0 },
  exportPrimaryBtn: { minHeight: 46, border: 0, color: "#020617", background: "#5eead4", borderRadius: 14, padding: "0 18px", fontWeight: 950, cursor: "pointer" },
  exportSecondaryBtn: { minHeight: 46, border: "1px solid rgba(148,163,184,.20)", color: "#e2e8f0", background: "rgba(15,23,42,.66)", borderRadius: 14, padding: "0 18px", fontWeight: 950, cursor: "pointer" },
  primaryBtn: { height: 52, minHeight: 52, width: "fit-content", maxWidth: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid rgba(220,231,245,0.16)", color: "#EAF2FF", background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "0 28px", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", cursor: "pointer", boxShadow: "0 10px 22px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06)", whiteSpace: "nowrap", overflow: "visible" },
  secondaryBtn: { border: "1px solid rgba(255,255,255,.12)", color: "#cbd5e1", background: "rgba(15,23,42,.55)", borderRadius: 16, padding: "13px 18px", fontWeight: 900, cursor: "pointer" },
  successBtn: { border: 0, color: "#020617", background: "linear-gradient(135deg,#5eead4,#38bdf8)", borderRadius: 16, padding: "13px 20px", fontWeight: 950, cursor: "pointer", boxShadow: "0 16px 46px rgba(94,234,212,.18)" },

  // EDA page
  edaStatGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14, marginBottom: 24 },
  edaStatCard: { border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.52)", borderRadius: 22, padding: 22, textAlign: "center" },
  edaStatNum: { fontSize: 38, fontWeight: 950, letterSpacing: "-.06em", background: "linear-gradient(135deg,#fff,#38bdf8)", WebkitBackgroundClip: "text", color: "transparent" },
  edaStatDesc: { color: "#94a3b8", fontSize: 13, marginTop: 6 },
  edaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px,1fr))", gap: 18, marginBottom: 24 },
  hBarRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  hBarLabel: { width: 160, fontSize: 13, color: "#cbd5e1", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  hBarTrack: { flex: 1, height: 22, borderRadius: 999, background: "rgba(2,6,23,.55)", overflow: "hidden" },
  hBarFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#5eead4,#60a5fa)", transition: "width .6s ease" },
  hBarValue: { width: 60, fontSize: 13, color: "#94a3b8", flexShrink: 0, textAlign: "right" },
  loadingBox: { textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 18 },
  errorBox: { border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.10)", color: "#fecaca", borderRadius: 18, padding: 24, textAlign: "center", marginTop: 20 },
};
