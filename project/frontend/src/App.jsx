import { useMemo, useState } from "react";
import { Activity, BarChart3, Brain, Database, Gauge, Sparkles } from "lucide-react";
import { globalStyles } from "./styles";
import PredictWizard from "./PredictWizard";
import EdaPage from "./EdaPage";

const tabs = [
  {
    id: "predict",
    label: "Prediction Console",
    icon: Gauge,
    summary: "Run single-student or batch scoring through the trained model workflow.",
  },
  {
    id: "eda",
    label: "Intelligence Lab",
    icon: BarChart3,
    summary: "Upload a dataset and inspect risk, behavior, readiness, and intervention signals.",
  },
];

const pulseNodes = [
  { left: "6%", top: "18%", size: 5, delay: "0s" },
  { left: "18%", top: "72%", size: 7, delay: "1.4s" },
  { left: "33%", top: "28%", size: 4, delay: "2.1s" },
  { left: "46%", top: "84%", size: 6, delay: "3.2s" },
  { left: "62%", top: "16%", size: 5, delay: "1.1s" },
  { left: "78%", top: "62%", size: 8, delay: "2.7s" },
  { left: "92%", top: "34%", size: 5, delay: "3.8s" },
];

const shellStyles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial, sans-serif",
    background:
      "linear-gradient(135deg, #111827 0%, #052e2b 34%, #281b3f 68%, #1f1f13 100%)",
    padding: "28px 16px 60px",
  },
  texture: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
    backgroundSize: "46px 46px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,.9), rgba(0,0,0,.32))",
    pointerEvents: "none",
  },
  glow: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(120deg, rgba(20,184,166,.18), transparent 28%, rgba(244,63,94,.12) 58%, rgba(234,179,8,.16))",
  },
  shell: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: 1220,
    margin: "0 auto",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: 22,
    alignItems: "stretch",
    marginBottom: 22,
  },
  heroMain: {
    border: "1px solid rgba(255,255,255,.13)",
    background: "linear-gradient(135deg, rgba(17,24,39,.76), rgba(8,47,73,.46))",
    borderRadius: 26,
    padding: "clamp(24px, 5vw, 44px)",
    boxShadow: "0 24px 80px rgba(0,0,0,.30)",
    backdropFilter: "blur(20px)",
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#99f6e4",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    border: "1px solid rgba(45,212,191,.28)",
    background: "rgba(20,184,166,.10)",
    borderRadius: 999,
    padding: "8px 12px",
  },
  title: {
    margin: "18px 0 14px",
    fontSize: "clamp(42px, 7vw, 78px)",
    lineHeight: .92,
    letterSpacing: "-.06em",
    fontWeight: 950,
  },
  titleAccent: {
    color: "#fde68a",
  },
  subtitle: {
    margin: 0,
    maxWidth: 820,
    color: "#dbeafe",
    fontSize: "clamp(15px, 1.45vw, 19px)",
    lineHeight: 1.75,
    fontWeight: 600,
  },
  heroSide: {
    border: "1px solid rgba(255,255,255,.13)",
    background: "rgba(15,23,42,.62)",
    borderRadius: 26,
    padding: 20,
    display: "grid",
    gap: 14,
    boxShadow: "0 24px 80px rgba(0,0,0,.24)",
    backdropFilter: "blur(20px)",
  },
  signalCard: {
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.32)",
    borderRadius: 20,
    padding: 16,
  },
  signalTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#cbd5e1",
    fontWeight: 900,
    marginBottom: 8,
  },
  signalText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.55,
  },
  nav: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(2,6,23,.42)",
    borderRadius: 22,
    padding: 8,
    marginBottom: 20,
    backdropFilter: "blur(18px)",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    minHeight: 78,
    border: "1px solid transparent",
    borderRadius: 16,
    padding: "14px 16px",
    textAlign: "left",
    cursor: "pointer",
    color: "#cbd5e1",
    background: "transparent",
  },
  navActive: {
    color: "#04111f",
    background: "linear-gradient(135deg, #5eead4, #facc15)",
    borderColor: "rgba(255,255,255,.28)",
    boxShadow: "0 18px 48px rgba(20,184,166,.18)",
  },
  navLabel: {
    display: "block",
    fontSize: 15,
    fontWeight: 950,
  },
  navSummary: {
    display: "block",
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.45,
    opacity: .78,
  },
  iconWrap: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: 14,
    background: "rgba(255,255,255,.12)",
  },
};

const localStyles = `
  ${globalStyles}

  .radar-node {
    position: fixed;
    left: var(--left);
    top: var(--top);
    width: var(--size);
    height: var(--size);
    border-radius: 999px;
    background: #fef3c7;
    box-shadow: 0 0 0 8px rgba(250,204,21,.08), 0 0 30px rgba(45,212,191,.55);
    animation: radarPulse 5s ease-in-out infinite;
    animation-delay: var(--delay);
    pointer-events: none;
    z-index: 1;
  }

  @keyframes radarPulse {
    0%, 100% { opacity: .22; transform: translateY(0) scale(.8); }
    50% { opacity: .85; transform: translateY(-22px) scale(1.35); }
  }

  @media (max-width: 920px) {
    .app-hero { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 680px) {
    .app-nav { grid-template-columns: 1fr !important; }
  }
`;

export default function App() {
  const [page, setPage] = useState("predict");
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === page) || tabs[0], [page]);

  return (
    <div style={shellStyles.page}>
      <style>{localStyles}</style>
      <div style={shellStyles.texture} />
      <div style={shellStyles.glow} />
      {pulseNodes.map((node, index) => (
        <span
          key={index}
          className="radar-node"
          style={{
            "--left": node.left,
            "--top": node.top,
            "--size": `${node.size}px`,
            "--delay": node.delay,
          }}
        />
      ))}

      <main style={shellStyles.shell}>
        <header className="app-hero" style={shellStyles.hero}>
          <section style={shellStyles.heroMain}>
            <span style={shellStyles.kicker}>
              <Sparkles size={15} strokeWidth={2.6} />
              AI Early Warning System
            </span>
            <h1 style={shellStyles.title}>
              Student <span style={shellStyles.titleAccent}>Leak</span> Radar
            </h1>
            <p style={shellStyles.subtitle}>
              A focused command center for academic risk: score students, audit model-ready
              features, explore learning behavior, and translate noisy course data into
              intervention decisions that frontend reviewers can actually feel.
            </p>
          </section>

          <aside style={shellStyles.heroSide} aria-label="System highlights">
            <Signal icon={Brain} title="Explainable risk logic">
              Combines trained-model flow with transparent fallback scoring when prediction
              columns already exist in uploaded data.
            </Signal>
            <Signal icon={Database} title="Multi-source analytics">
              Reads assessment, VLE activity, course module, delay, and target columns from
              engineered OULAD-style datasets.
            </Signal>
            <Signal icon={Activity} title="Action-oriented output">
              Surfaces readiness, cohort risk, behavior gaps, and an intervention queue in
              one polished workspace.
            </Signal>
          </aside>
        </header>

        <nav className="app-nav" style={shellStyles.nav} aria-label="Primary workspace">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                style={{ ...shellStyles.navBtn, ...(active ? shellStyles.navActive : {}) }}
                onClick={() => setPage(tab.id)}
              >
                <span>
                  <span style={shellStyles.navLabel}>{tab.label}</span>
                  <span style={shellStyles.navSummary}>{tab.summary}</span>
                </span>
                <span style={shellStyles.iconWrap}>
                  <Icon size={22} strokeWidth={2.5} />
                </span>
              </button>
            );
          })}
        </nav>

        {page === "predict" ? <PredictWizard /> : <EdaPage />}
      </main>
    </div>
  );
}

function Signal({ icon: Icon, title, children }) {
  return (
    <div style={shellStyles.signalCard}>
      <div style={shellStyles.signalTop}>
        <Icon size={18} strokeWidth={2.5} />
        <span>{title}</span>
      </div>
      <p style={shellStyles.signalText}>{children}</p>
    </div>
  );
}
