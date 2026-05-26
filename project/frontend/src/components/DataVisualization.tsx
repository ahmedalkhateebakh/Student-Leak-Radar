import type { CSSProperties, ReactNode } from "react";

export type RiskBand = "high" | "medium" | "low";

export interface RiskArcIndicatorProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export interface ActivitySparklineProps {
  values: number[];
  width?: number;
  height?: number;
  label?: string;
  className?: string;
}

export interface StudentRiskTooltipData {
  lastLogin: string;
  sessionTimeChangePct: number;
  lateSubmissionsCount: number;
}

export interface StudentRiskTooltipProps {
  children: ReactNode;
  tooltip: StudentRiskTooltipData;
  align?: "left" | "right";
  className?: string;
}

export interface StudentRiskVisualRowProps {
  studentId: string | number;
  riskScore: number;
  activityTrend: number[];
  tooltip: StudentRiskTooltipData;
  level?: string;
}

const riskPalette: Record<RiskBand, { color: string; bg: string; label: string }> = {
  high: { color: "#e24b4a", bg: "rgba(226,75,74,0.12)", label: "High" },
  medium: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", label: "Medium" },
  low: { color: "#5eead4", bg: "rgba(94,234,212,0.12)", label: "Low" },
};

export function getRiskBand(value: number): RiskBand {
  if (value > 70) return "high";
  if (value >= 40) return "medium";
  return "low";
}

export function RiskArcIndicator({
  value,
  size = 52,
  strokeWidth = 6,
  label,
  showValue = true,
  className = "",
}: RiskArcIndicatorProps) {
  const safeValue = clamp(value, 0, 100);
  const band = getRiskBand(safeValue);
  const palette = riskPalette[band];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeValue / 100) * circumference;
  const center = size / 2;

  return (
    <span
      className={`risk-arc ${className}`}
      style={
        {
          "--risk-color": palette.color,
          "--risk-bg": palette.bg,
          width: size,
          minWidth: size,
        } as CSSProperties
      }
      aria-label={label || `${palette.label} risk, ${Math.round(safeValue)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          className="risk-arc__progress"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--risk-color)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={
            {
              "--risk-circumference": circumference,
              "--risk-dashoffset": dashOffset,
            } as CSSProperties
          }
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {showValue && <strong className="risk-arc__value">{Math.round(safeValue)}%</strong>}
    </span>
  );
}

export function ActivitySparkline({
  values,
  width = 92,
  height = 34,
  label = "7-day activity trend",
  className = "",
}: ActivitySparklineProps) {
  const normalized = normalizeSeven(values);
  const maxValue = Math.max(...normalized, 1);
  const gap = 4;
  const barWidth = (width - gap * 6) / 7;

  return (
    <span className={`activity-sparkline ${className}`} aria-label={label}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
        <title>{label}</title>
        {normalized.map((value, index) => {
          const barHeight = Math.max(4, (value / maxValue) * (height - 4));
          const x = index * (barWidth + gap);
          const y = height - barHeight;
          const isLatest = index === normalized.length - 1;

          return (
            <rect
              key={`${value}-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={isLatest ? "#5eead4" : "rgba(94,234,212,0.42)"}
            />
          );
        })}
      </svg>
    </span>
  );
}

export function StudentRiskTooltip({
  children,
  tooltip,
  align = "left",
  className = "",
}: StudentRiskTooltipProps) {
  const sessionTone = tooltip.sessionTimeChangePct >= 0 ? "positive" : "negative";

  return (
    <span className={`student-risk-tooltip ${align} ${className}`}>
      {children}
      <span className="student-risk-tooltip__panel" role="tooltip">
        <span>
          <span className="student-risk-tooltip__label">Last login</span>
          <strong>{tooltip.lastLogin}</strong>
        </span>
        <span>
          <span className="student-risk-tooltip__label">Session time</span>
          <strong className={`student-risk-tooltip__${sessionTone}`}>
            {tooltip.sessionTimeChangePct > 0 ? "+" : ""}
            {tooltip.sessionTimeChangePct}%
          </strong>
        </span>
        <span>
          <span className="student-risk-tooltip__label">Late submissions</span>
          <strong>{tooltip.lateSubmissionsCount}</strong>
        </span>
      </span>
    </span>
  );
}

export function StudentRiskVisualRow({
  studentId,
  riskScore,
  activityTrend,
  tooltip,
  level,
}: StudentRiskVisualRowProps) {
  const band = getRiskBand(riskScore);
  const palette = riskPalette[band];

  return (
    <StudentRiskTooltip tooltip={tooltip}>
      <span className="student-risk-row">
        <span className="student-risk-row__id">{studentId}</span>
        <RiskArcIndicator value={riskScore} size={48} />
        <ActivitySparkline values={activityTrend} />
        <span className="student-risk-row__level" style={{ color: palette.color, background: palette.bg }}>
          {level || palette.label}
        </span>
      </span>
    </StudentRiskTooltip>
  );
}

export function DataVisualizationUsageExample() {
  return (
    <StudentRiskVisualRow
      studentId="Ahmed K."
      riskScore={78}
      level="High Risk"
      activityTrend={[24, 20, 18, 15, 12, 9, 7]}
      tooltip={{
        lastLogin: "2 days ago",
        sessionTimeChangePct: -34,
        lateSubmissionsCount: 3,
      }}
    />
  );
}

export const dataVisualizationCss = `
  .risk-arc {
    position: relative;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    color: var(--risk-color);
    background: var(--risk-bg);
  }

  .risk-arc__progress {
    filter: drop-shadow(0 0 8px color-mix(in srgb, var(--risk-color) 55%, transparent));
    animation: riskArcDraw .72s ease both;
    transition: stroke-dashoffset .65s ease, stroke .25s ease;
  }

  .risk-arc__value {
    position: absolute;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .activity-sparkline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    background: rgba(255,255,255,0.035);
  }

  .activity-sparkline rect {
    transform-origin: bottom;
    animation: sparklineRise .45s ease both;
  }

  .student-risk-tooltip {
    position: relative;
    display: inline-flex;
    width: 100%;
  }

  .student-risk-tooltip__panel {
    position: absolute;
    z-index: 30;
    left: 0;
    bottom: calc(100% + 10px);
    display: grid;
    grid-template-columns: repeat(3, max-content);
    gap: 14px;
    min-width: 360px;
    padding: 14px 16px;
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 14px;
    color: rgba(255,255,255,0.72);
    background: rgba(8,13,20,0.96);
    box-shadow: 0 18px 50px rgba(0,0,0,0.35);
    opacity: 0;
    pointer-events: none;
    transform: translateY(6px);
    transition: opacity .2s ease, transform .2s ease;
  }

  .student-risk-tooltip.right .student-risk-tooltip__panel {
    left: auto;
    right: 0;
  }

  .student-risk-tooltip:hover .student-risk-tooltip__panel,
  .student-risk-tooltip:focus-within .student-risk-tooltip__panel {
    opacity: 1;
    transform: translateY(0);
  }

  .student-risk-tooltip__label {
    display: block;
    margin-bottom: 4px;
    color: rgba(255,255,255,0.38);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .student-risk-tooltip__positive {
    color: #5eead4;
  }

  .student-risk-tooltip__negative {
    color: #e24b4a;
  }

  .student-risk-row {
    display: grid;
    grid-template-columns: minmax(92px, 1fr) 52px 108px auto;
    align-items: center;
    gap: 14px;
    width: 100%;
  }

  .student-risk-row__id {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  .student-risk-row__level {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 84px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  @keyframes sparklineRise {
    from { transform: scaleY(.3); opacity: .35; }
    to { transform: scaleY(1); opacity: 1; }
  }

  @keyframes riskArcDraw {
    from { stroke-dashoffset: var(--risk-circumference); }
    to { stroke-dashoffset: var(--risk-dashoffset); }
  }
`;

function normalizeSeven(values: number[]): number[] {
  const numbers = values.map((value) => (Number.isFinite(value) ? Math.max(0, value) : 0));
  if (numbers.length >= 7) return numbers.slice(-7);
  return [...Array(7 - numbers.length).fill(0), ...numbers];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
