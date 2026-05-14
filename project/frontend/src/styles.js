export const globalStyles = `
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
  bgOrbOne: { position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "rgba(16,185,129,.18)", filter: "blur(80px)", top: -150, left: -120 },
  bgOrbTwo: { position: "fixed", width: 460, height: 460, borderRadius: "50%", background: "rgba(245,158,11,.12)", filter: "blur(90px)", bottom: -180, right: -120 },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, rgba(0,0,0,.8), transparent)", pointerEvents: "none" },
  shell: { position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto" },
  header: { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 30, textAlign: "center" },
  heroContent: { width: "100%", maxWidth: 980, margin: "0 auto", padding: "8px 0 4px" },
  kicker: { display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#6ee7b7", fontSize: 12, fontWeight: 900, letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 12, padding: "8px 14px", border: "1px solid rgba(110,231,183,.18)", borderRadius: 999, background: "rgba(16,185,129,.07)", boxShadow: "0 14px 50px rgba(16,185,129,.10)" },
  title: { margin: 0, fontSize: "clamp(42px, 7vw, 82px)", lineHeight: .9, letterSpacing: "-.075em", fontWeight: 950, color: "#f8fafc", textShadow: "0 22px 70px rgba(0,0,0,.55)" },
  subtitleCard: { position: "relative", maxWidth: 900, margin: "26px auto 0", padding: "22px 28px", borderRadius: 28, background: "linear-gradient(135deg, rgba(15,23,42,.72), rgba(2,6,23,.50))", border: "1px solid rgba(110,231,183,.16)", boxShadow: "0 30px 90px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.05)", backdropFilter: "blur(18px)", overflow: "hidden" },
  subtitleAccent: { display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10, color: "#fbbf24", fontSize: 12, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" },
  subtitle: { maxWidth: 820, margin: "0 auto", color: "#dbeafe", fontSize: "clamp(16px, 1.65vw, 20px)", lineHeight: 1.75, fontWeight: 650, textAlign: "center", letterSpacing: "-.015em" },

  // Page navigation tabs
  pageNav: { display: "flex", gap: 6, padding: 6, border: "1px solid rgba(255,255,255,.10)", background: "rgba(2,6,23,.48)", borderRadius: 18, marginBottom: 20 },
  pageNavBtn: { flex: 1, border: 0, color: "#94a3b8", background: "transparent", padding: "11px 20px", borderRadius: 14, cursor: "pointer", fontWeight: 900, fontSize: 15 },
  pageNavActive: { color: "#020617", background: "linear-gradient(135deg,#6ee7b7,#fbbf24)" },

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
  chartBadge: { height: 28, color: "#a7f3d0", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 99, padding: "6px 10px", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" },
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

  // EDA page
  edaStatGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14, marginBottom: 24 },
  edaStatCard: { border: "1px solid rgba(255,255,255,.10)", background: "rgba(15,23,42,.52)", borderRadius: 22, padding: 22, textAlign: "center" },
  edaStatNum: { fontSize: 38, fontWeight: 950, letterSpacing: "-.06em", background: "linear-gradient(135deg,#fff,#6ee7b7)", WebkitBackgroundClip: "text", color: "transparent" },
  edaStatDesc: { color: "#94a3b8", fontSize: 13, marginTop: 6 },
  edaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px,1fr))", gap: 18, marginBottom: 24 },
  hBarRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  hBarLabel: { width: 160, fontSize: 13, color: "#cbd5e1", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  hBarTrack: { flex: 1, height: 22, borderRadius: 999, background: "rgba(2,6,23,.55)", overflow: "hidden" },
  hBarFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#10b981,#f59e0b)", transition: "width .6s ease" },
  hBarValue: { width: 60, fontSize: 13, color: "#94a3b8", flexShrink: 0, textAlign: "right" },
  loadingBox: { textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 18 },
  errorBox: { border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.10)", color: "#fecaca", borderRadius: 18, padding: 24, textAlign: "center", marginTop: 20 },
};
