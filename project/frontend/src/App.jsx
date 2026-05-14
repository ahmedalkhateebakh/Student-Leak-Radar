import { useState } from "react";
import { globalStyles, styles } from "./styles";
import PredictWizard from "./PredictWizard";
import EdaPage from "./EdaPage";

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

export default function App() {
  const [page, setPage] = useState("predict");

  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      <div style={styles.bgOrbOne} />
      <div style={styles.bgOrbTwo} />
      <div style={styles.bgGrid} />
      <div className="particle-layer">
        {particles.map((p) => (
          <span key={p.id} className="particle" style={{ "--x": p.x, "--y": p.y, "--delay": p.delay, "--duration": p.duration }} />
        ))}
      </div>

      <main style={styles.shell}>
        <Header />

        <nav style={styles.pageNav}>
          <button
            style={{ ...styles.pageNavBtn, ...(page === "predict" ? styles.pageNavActive : {}) }}
            onClick={() => setPage("predict")}
          >
            Predict
          </button>
          <button
            style={{ ...styles.pageNavBtn, ...(page === "eda" ? styles.pageNavActive : {}) }}
            onClick={() => setPage("eda")}
          >
            Explore Data
          </button>
        </nav>

        {page === "predict" ? <PredictWizard /> : <EdaPage />}
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
