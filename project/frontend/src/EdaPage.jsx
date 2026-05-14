import { useEffect, useState } from "react";
import { styles } from "./styles";

export default function EdaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/eda")
      .then((r) => {
        if (!r.ok) throw new Error(`Backend returned ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load EDA data."); setLoading(false); });
  }, []);

  if (loading) return <div style={styles.loadingBox}>Loading dataset analytics…</div>;
  if (error) return (
    <div style={styles.errorBox}>
      <strong>Could not load EDA data</strong>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>{error}</p>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "#94a3b8" }}>Make sure the backend is running and the raw CSV files are in <code>project/backend/data/raw/</code></p>
    </div>
  );

  const passRate = data.final_result
    ? Math.round(((data.final_result.find((r) => r.label === "Pass")?.count ?? 0) + (data.final_result.find((r) => r.label === "Distinction")?.count ?? 0)) / data.total_rows * 100)
    : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <span style={styles.eyebrow}>Dataset Insights</span>
        <h2 style={styles.stepTitle}>OULAD Exploratory Analysis</h2>
        <p style={styles.stepDesc}>Open University Learning Analytics Dataset — {data.total_rows?.toLocaleString()} student-module-presentation records across {data.modules} modules.</p>
      </div>

      {/* Summary stat cards */}
      <div style={styles.edaStatGrid}>
        <StatCard num={data.total_rows?.toLocaleString()} desc="Total Records" />
        <StatCard num={data.unique_students?.toLocaleString()} desc="Unique Students" />
        <StatCard num={data.modules} desc="Modules" />
        <StatCard num={data.presentations} desc="Presentations" />
        <StatCard num={`${passRate}%`} desc="Pass / Distinction Rate" />
      </div>

      {/* Chart grid — 2 columns on wide screens */}
      <div style={styles.edaGrid}>
        {data.final_result && (
          <EDACard title="Final Result Distribution" subtitle="All student-module-presentation outcomes">
            <HBarChart data={data.final_result} />
          </EDACard>
        )}

        {data.module && (
          <EDACard title="Students per Module" subtitle="Course enrollment distribution">
            <HBarChart data={data.module} />
          </EDACard>
        )}

        {data.gender && (
          <EDACard title="Gender Split" subtitle="Proportion of male vs female students">
            <HBarChart data={data.gender} colorFrom="#8b5cf6" colorTo="#06b6d4" />
          </EDACard>
        )}

        {data.age_band && (
          <EDACard title="Age Band Distribution" subtitle="Student age group breakdown">
            <HBarChart data={data.age_band} colorFrom="#f59e0b" colorTo="#ef4444" />
          </EDACard>
        )}

        {data.highest_education && (
          <EDACard title="Highest Education" subtitle="Prior qualification level at registration">
            <HBarChart data={data.highest_education} colorFrom="#14b8a6" colorTo="#10b981" />
          </EDACard>
        )}

        {data.imd_band && (
          <EDACard title="IMD Band (Deprivation Index)" subtitle="Socioeconomic deprivation band — higher band = less deprived">
            <HBarChart data={data.imd_band} colorFrom="#fb7185" colorTo="#f59e0b" />
          </EDACard>
        )}

        {data.score_bins && data.score_bins.length > 0 && (
          <EDACard title="Assessment Score Distribution" subtitle="Frequency of student scores across all assessments">
            <ScoreHistogram bins={data.score_bins} />
          </EDACard>
        )}

        {data.vle_activities && data.vle_activities.length > 0 && (
          <EDACard title="VLE Activity Types" subtitle="Number of learning resources per activity category">
            <HBarChart data={data.vle_activities} colorFrom="#6ee7b7" colorTo="#8b5cf6" />
          </EDACard>
        )}
      </div>
    </div>
  );
}

// ─── Shared EDA components ────────────────────────────────────────────────────

function StatCard({ num, desc }) {
  return (
    <div style={styles.edaStatCard}>
      <div style={styles.edaStatNum}>{num}</div>
      <div style={styles.edaStatDesc}>{desc}</div>
    </div>
  );
}

function EDACard({ title, subtitle, children }) {
  return (
    <div style={{ ...styles.chartCard, minHeight: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={styles.chartTitle}>{title}</h3>
        {subtitle && <p style={styles.chartSubtitle}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function HBarChart({ data, colorFrom = "#10b981", colorTo = "#f59e0b" }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div>
      {data.map((d) => (
        <div key={d.label} style={styles.hBarRow}>
          <div style={styles.hBarLabel} title={d.label}>{d.label}</div>
          <div style={styles.hBarTrack}>
            <div style={{ ...styles.hBarFill, width: `${(d.count / max) * 100}%`, background: `linear-gradient(90deg,${colorFrom},${colorTo})` }} />
          </div>
          <div style={styles.hBarValue}>{d.count.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreHistogram({ bins }) {
  const max = Math.max(...bins.map((b) => b.count));
  const height = 140;
  const barW = Math.floor(360 / bins.length) - 4;
  return (
    <svg viewBox={`0 0 380 ${height + 24}`} style={{ width: "100%", display: "block" }}>
      {bins.map((b, i) => {
        const barH = Math.max(4, Math.round((b.count / max) * height));
        const x = 10 + i * (barW + 4);
        const y = height - barH;
        return (
          <g key={b.bin}>
            <rect x={x} y={y} width={barW} height={barH} rx="5" fill={i === Math.floor(bins.length / 2) ? "#10b981" : "#334155"} />
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fill="#64748b" fontSize="9">{b.bin.split("-")[0]}</text>
          </g>
        );
      })}
      <line x1="10" y1={height} x2="370" y2={height} stroke="rgba(148,163,184,.2)" />
    </svg>
  );
}
