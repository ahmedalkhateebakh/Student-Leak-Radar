import { useState } from "react";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  GitCompare,
  KeyRound,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { intelligenceLabColumns, predictionConsoleColumns } from "./dataGuides";
import { styles } from "./styles";

const pageStyles = {
  page: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    background: "radial-gradient(circle at 18% 0%, rgba(56,189,248,.16), transparent 34%), radial-gradient(circle at 88% 10%, rgba(94,234,212,.13), transparent 32%), #07111f",
  },
  hero: {
    position: "relative",
    border: "1px solid rgba(94,234,212,.22)",
    background: "linear-gradient(135deg, rgba(15,23,42,.82), rgba(8,47,73,.42), rgba(2,6,23,.64))",
    borderRadius: 26,
    padding: "clamp(24px, 4vw, 42px)",
    marginBottom: 18,
    boxShadow: "0 28px 90px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.06)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  heroIndicators: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  eyebrow: {
    color: "#5eead4",
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: ".16em",
    textTransform: "uppercase",
  },
  title: {
    margin: "9px 0 8px",
    color: "#fff",
    fontSize: "clamp(32px, 5vw, 58px)",
    lineHeight: .95,
    letterSpacing: "-.06em",
  },
  desc: { margin: 0, color: "#94a3b8", lineHeight: 1.7, maxWidth: 920 },
  comparison: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  comparisonItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid rgba(94,234,212,.16)",
    borderRadius: 20,
    padding: 15,
    background: "linear-gradient(135deg, rgba(15,23,42,.66), rgba(2,6,23,.34))",
  },
  comparisonIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    color: "#020617",
    background: "linear-gradient(135deg,#5eead4,#5eead4)",
    flexShrink: 0,
  },
  schemaGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 },
  schemaCard: {
    position: "relative",
    border: "1px solid rgba(148,163,184,.16)",
    background: "linear-gradient(180deg, rgba(15,23,42,.78), rgba(2,6,23,.54))",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 24px 80px rgba(0,0,0,.24)",
    transition: "transform .22s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease",
    overflow: "hidden",
  },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 16 },
  cardTitle: { margin: "8px 0 8px", color: "#fff", fontSize: 26, letterSpacing: "-.04em" },
  cardIcon: {
    width: 54,
    height: 54,
    display: "grid",
    placeItems: "center",
    borderRadius: 18,
    color: "#020617",
    background: "linear-gradient(135deg,#5eead4,#38bdf8)",
    flexShrink: 0,
  },
  overview: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 16 },
  metric: {
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 18,
    padding: 14,
    background: "rgba(2,6,23,.34)",
  },
  metricLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".10em",
    textTransform: "uppercase",
    marginBottom: 7,
  },
  metricValue: { color: "#fff", fontSize: 24, fontWeight: 950, letterSpacing: "-.05em" },
  fieldGroups: { display: "grid", gap: 12, marginTop: 14 },
  fieldGroup: {
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 18,
    background: "rgba(2,6,23,.28)",
    padding: 14,
  },
  fieldGroupHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  fieldGroupTitle: { display: "flex", alignItems: "center", gap: 8, color: "#f8fafc", margin: 0, fontSize: 15 },
  fieldPills: { display: "flex", flexWrap: "wrap", gap: 8 },
  fieldPill: {
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
    borderRadius: 999,
    padding: "7px 11px",
    color: "#dbeafe",
    background: "linear-gradient(135deg, rgba(15,23,42,.82), rgba(8,47,73,.30))",
    border: "1px solid rgba(148,163,184,.18)",
    fontSize: 12,
    fontWeight: 850,
    overflowWrap: "anywhere",
    lineHeight: 1.25,
  },
  stepper: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 0,
    margin: "18px 0",
    border: "1px solid rgba(94,234,212,.14)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(2,6,23,.34)",
  },
  step: {
    position: "relative",
    display: "grid",
    gap: 7,
    padding: "13px 12px",
    borderRight: "1px solid rgba(148,163,184,.10)",
  },
  stepIcon: {
    width: 22,
    height: 22,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    color: "#02111a",
    background: "linear-gradient(135deg,#5eead4,#5eead4)",
  },
  stepLabel: {
    color: "#dbeafe",
    fontSize: 11,
    fontWeight: 900,
    lineHeight: 1.25,
  },
  detailBox: {
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 18,
    background: "rgba(15,23,42,.36)",
    marginTop: 14,
    overflow: "hidden",
  },
  detailSummary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    cursor: "pointer",
    color: "#e2e8f0",
    fontWeight: 950,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(15,23,42,.56)",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 850,
  },
  tableWrap: { width: "100%", maxHeight: 430, overflow: "auto", borderTop: "1px solid rgba(148,163,184,.14)" },
  table: { width: "100%", minWidth: 720, borderCollapse: "collapse", background: "rgba(2,6,23,.38)" },
  th: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    textAlign: "left",
    color: "#99f6e4",
    background: "#07111f",
    borderBottom: "1px solid rgba(148,163,184,.20)",
    padding: "12px 13px",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: ".10em",
    textTransform: "uppercase",
  },
  td: { borderBottom: "1px solid rgba(148,163,184,.09)", padding: "11px 13px", color: "#e2e8f0", fontSize: 12, verticalAlign: "top" },
  required: { color: "#fecaca", fontWeight: 950 },
  recommended: { color: "#cffafe", fontWeight: 950 },
  optional: { color: "#93c5fd", fontWeight: 950 },
};

const csvCss = `
  .csv-contract-card:hover {
    transform: translateY(-4px);
    border-color: rgba(94,234,212,.38) !important;
    box-shadow: 0 30px 95px rgba(0,0,0,.30), 0 0 0 1px rgba(94,234,212,.10) !important;
    background: linear-gradient(180deg, rgba(15,23,42,.84), rgba(8,47,73,.38)) !important;
  }

  .csv-contract-card:focus-within {
    outline: 2px solid rgba(94,234,212,.38);
    outline-offset: 3px;
  }

  .csv-toggle {
    border: 1px solid rgba(94,234,212,.22);
    background: rgba(56,189,248,.12);
    color: #99f6e4;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 950;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .csv-toggle:focus-visible,
  .csv-detail-summary:focus-visible {
    outline: 2px solid rgba(94,234,212,.55);
    outline-offset: 3px;
  }

  @media (max-width: 1080px) {
    .csv-schema-grid,
    .csv-comparison-strip {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 720px) {
    .csv-contract-overview,
    .csv-contract-stepper {
      grid-template-columns: 1fr !important;
    }
    .csv-card-top {
      flex-direction: column !important;
    }
  }
`;

export default function CsvRequirementsPage() {
  return (
    <main className="fade-in" style={{ ...styles.card, ...pageStyles.page }}>
      <style>{csvCss}</style>
      <header style={pageStyles.hero}>
        <div style={pageStyles.heroTop}>
          <span style={pageStyles.eyebrow}>CSV Requirements</span>
          <div style={pageStyles.heroIndicators}>
            <span style={pageStyles.chip}><ShieldCheck size={14} /> CSV Contracts</span>
            <span style={pageStyles.chip}><ListChecks size={14} /> Data Dictionary</span>
          </div>
        </div>
        <h1 style={pageStyles.title}>Data requirements, organized by purpose</h1>
        <p style={pageStyles.desc}>
          Prediction and intelligence analysis use different CSV shapes. This page keeps the
          contracts separate so the dashboard stays clean and every upload path has a clear data
          dictionary.
        </p>
      </header>

      <ComparisonStrip />

      <div className="csv-schema-grid" style={pageStyles.schemaGrid}>
        <SchemaCard
          title="Prediction Console CSV"
          subtitle="Use this for direct risk scoring. The model requires the 17 feature columns; id and gender can help display context."
          columns={predictionConsoleColumns}
        />
        <SchemaCard
          title="Intelligence Lab CSV"
          subtitle="Use this for broader analysis, cohort EDA, feature readiness, and outcome explanation."
          columns={intelligenceLabColumns}
        />
      </div>
    </main>
  );
}

function ComparisonStrip() {
  return (
    <section className="csv-comparison-strip" style={pageStyles.comparison} aria-label="CSV contract comparison">
      <article style={pageStyles.comparisonItem}>
        <span style={pageStyles.comparisonIcon}><FileSpreadsheet size={20} /></span>
        <div>
          <span style={pageStyles.eyebrow}>Prediction Console</span>
          <p style={{ ...pageStyles.desc, marginTop: 4 }}>Model scoring input for direct risk prediction.</p>
        </div>
      </article>
      <article style={pageStyles.comparisonItem}>
        <span style={pageStyles.comparisonIcon}><GitCompare size={20} /></span>
        <div>
          <span style={pageStyles.eyebrow}>Intelligence Lab</span>
          <p style={{ ...pageStyles.desc, marginTop: 4 }}>Analysis and explainability input for cohort EDA.</p>
        </div>
      </article>
    </section>
  );
}

function SchemaCard({ title, subtitle, columns }) {
  const counts = summarizeColumns(columns);
  const groups = groupColumns(columns);
  return (
    <article className="csv-contract-card" style={pageStyles.schemaCard}>
      <div className="csv-card-top" style={pageStyles.cardTop}>
        <div>
          <span style={pageStyles.eyebrow}>Contract</span>
          <h2 style={pageStyles.cardTitle}>{title}</h2>
          <p style={pageStyles.desc}>{subtitle}</p>
        </div>
        <span style={pageStyles.cardIcon}>
          <FileSpreadsheet size={25} strokeWidth={2.5} />
        </span>
      </div>
      <div className="csv-contract-overview" style={pageStyles.overview}>
        <StatBox label="Columns" value={columns.length} />
        <StatBox label="Core" value={counts.core} />
        <StatBox label="Optional" value={counts.optional} />
      </div>
      <ContractStepper />
      <div style={pageStyles.fieldGroups}>
        {groups.map((group) => <FieldGroup key={group.title} group={group} />)}
      </div>
      <details style={pageStyles.detailBox}>
        <summary className="csv-detail-summary" style={pageStyles.detailSummary}>
          Full column dictionary
          <span style={pageStyles.chip}>{columns.length} fields</span>
        </summary>
        <div style={pageStyles.tableWrap}>
          <table style={pageStyles.table}>
            <thead>
              <tr>
                <th style={pageStyles.th}>Column</th>
                <th style={pageStyles.th}>Need</th>
                <th style={pageStyles.th}>Type</th>
                <th style={pageStyles.th}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((column) => (
                <tr key={column.name}>
                  <td style={pageStyles.td}><code>{column.name}</code></td>
                  <td style={pageStyles.td}><span style={needStyle(column.required)}>{column.required}</span></td>
                  <td style={pageStyles.td}>{column.type}</td>
                  <td style={pageStyles.td}>{column.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

function ContractStepper() {
  const steps = ["Required Columns", "Core Features", "Optional Context", "Dictionary Ready"];
  return (
    <div className="csv-contract-stepper" style={pageStyles.stepper} aria-label="Contract readiness">
      {steps.map((step, index) => (
        <div key={step} style={{ ...pageStyles.step, borderRight: index === steps.length - 1 ? 0 : pageStyles.step.borderRight }}>
          <span style={pageStyles.stepIcon}><CheckCircle2 size={14} /></span>
          <span style={pageStyles.stepLabel}>{step}</span>
        </div>
      ))}
    </div>
  );
}

function FieldGroup({ group }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 10;
  const visibleItems = expanded ? group.items : group.items.slice(0, limit);
  const hasMore = group.items.length > limit;
  return (
    <section style={pageStyles.fieldGroup}>
      <div style={pageStyles.fieldGroupHeader}>
        <h3 style={pageStyles.fieldGroupTitle}>
          <group.icon size={15} strokeWidth={2.5} />
          {group.title}
        </h3>
        {hasMore && (
          <button className="csv-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? "Collapse" : `Show ${group.items.length - limit} more`}
            <ChevronDown size={13} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
          </button>
        )}
      </div>
      <div style={pageStyles.fieldPills}>
        {visibleItems.map((column) => <FieldChip key={column.name} column={column} />)}
      </div>
    </section>
  );
}

function FieldChip({ column }) {
  return <span title={column.description} style={pageStyles.fieldPill}>{column.name}</span>;
}

function StatBox({ label, value }) {
  return (
    <div style={pageStyles.metric}>
      <span style={pageStyles.metricLabel}>{label}</span>
      <strong style={pageStyles.metricValue}>{value}</strong>
    </div>
  );
}

function needStyle(value) {
  if (value === "Required") return pageStyles.required;
  if (value === "Recommended") return pageStyles.recommended;
  return pageStyles.optional;
}

function summarizeColumns(columns) {
  return {
    core: columns.filter((column) => column.required === "Required" || column.required === "Recommended").length,
    optional: columns.filter((column) => column.required === "Optional").length,
  };
}

function groupColumns(columns) {
  return [
    {
      title: "Identity and profile",
      icon: KeyRound,
      items: columns.filter((column) => /id|gender|age|education|imd|region|disability|credits|attempt/i.test(column.name)),
    },
    {
      title: "Learning activity",
      icon: Boxes,
      items: columns.filter((column) => /click|active|homepage|forum|resource|subpage|url|oucontent|quiz|site|activity|vle/i.test(column.name)),
    },
    {
      title: "Assessment and outcome",
      icon: BarChart3,
      items: columns.filter((column) => /score|assessment|submission|delay|result|target|workload|module|presentation/i.test(column.name)),
    },
    {
      title: "Contract status",
      icon: ListChecks,
      items: columns.filter((column) => /target|result|selected|confidence|model/i.test(column.name)),
    },
  ].filter((group) => group.items.length);
}
