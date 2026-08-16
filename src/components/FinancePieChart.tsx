import { formatCurrency } from "@/lib/finance";
import type { MonthlySummary } from "@/lib/types";

// Donut geometry (SVG user units — the wrapping div controls on-screen size).
const SIZE = 220;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 6; // arc-length gap between segments, only applied when >1 segment

type SegmentKey = "spend" | "save";

interface Segment {
  key: SegmentKey;
  fraction: number;
  color: string;
  glow: string;
}

export default function FinancePieChart({
  summary,
}: {
  summary: MonthlySummary;
}) {
  const income = Number(summary.income);
  const expenses = Number(summary.expenses);
  const net = Number(summary.net);

  const hasIncome = income > 0;
  const isEmpty = income === 0 && expenses === 0;
  const isOverspent = !isEmpty && net < 0;

  // Manual entry means these numbers can land anywhere — handle every shape:
  // nothing logged yet, a normal month, and spending past what was earned.
  const segments: Segment[] = [];
  if (isOverspent) {
    segments.push({
      key: "spend",
      fraction: 1,
      color: "var(--fin-spend)",
      glow: "var(--fin-spend-glow)",
    });
  } else if (!isEmpty) {
    const spendShare = hasIncome ? expenses / income : 0;
    const saveShare = hasIncome ? net / income : 0;
    if (spendShare > 0) {
      segments.push({
        key: "spend",
        fraction: spendShare,
        color: "var(--fin-spend)",
        glow: "var(--fin-spend-glow)",
      });
    }
    if (saveShare > 0) {
      segments.push({
        key: "save",
        fraction: saveShare,
        color: "var(--fin-save)",
        glow: "var(--fin-save-glow)",
      });
    }
  }

  let cumulative = 0;
  const hasGap = segments.length > 1;
  const arcs = segments.map((seg) => {
    const len = seg.fraction * CIRCUMFERENCE;
    const visibleLen = hasGap ? Math.max(len - GAP, 0) : len;
    const dashoffset = -(cumulative + (hasGap ? GAP / 2 : 0));
    cumulative += len;
    return {
      ...seg,
      dasharray: `${visibleLen} ${CIRCUMFERENCE - visibleLen}`,
      dashoffset,
    };
  });

  const spendPct = hasIncome ? Math.round((expenses / income) * 100) : null;
  const savePct = hasIncome ? Math.round((net / income) * 100) : null;

  let centerLabel: string;
  let centerValue: string;
  let centerClass: "pos" | "neg" | "neutral";
  let caption: string | null;

  if (isEmpty) {
    centerLabel = "No data yet";
    centerValue = "—";
    centerClass = "neutral";
    caption = "Add a transaction to see your flow";
  } else if (isOverspent) {
    centerLabel = "Overspent";
    centerValue = formatCurrency(net);
    centerClass = "neg";
    caption = `${formatCurrency(expenses)} spent on ${formatCurrency(income)} earned`;
  } else {
    centerLabel = "Net saved";
    centerValue = formatCurrency(net);
    centerClass = net > 0 ? "pos" : "neutral";
    caption = savePct !== null ? `${savePct}% of income` : null;
  }

  return (
    <section
      className="panel fin-panel"
      aria-label="Monthly income, spending, and savings breakdown"
    >
      <div className="fin-head">
        <span className="fin-eyebrow">Monthly flow</span>
        <span className="fin-income-caption">
          {hasIncome ? `Earned ${formatCurrency(income)}` : "No income logged"}
        </span>
      </div>

      <div className="fin-donut-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%" aria-hidden="true">
          <defs>
            <filter id="fin-glow-blur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--fin-track)"
            strokeWidth={STROKE}
          />

          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((arc) => (
              <circle
                key={`${arc.key}-glow`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.glow}
                strokeWidth={STROKE * 1.7}
                strokeLinecap="round"
                strokeDasharray={arc.dasharray}
                strokeDashoffset={arc.dashoffset}
                filter="url(#fin-glow-blur)"
                opacity={0.5}
                className={isOverspent ? "fin-arc-pulse" : undefined}
              />
            ))}
            {arcs.map((arc) => (
              <circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={arc.dasharray}
                strokeDashoffset={arc.dashoffset}
              >
                <title>
                  {arc.key === "spend"
                    ? `Spending: ${formatCurrency(expenses)}`
                    : `Savings: ${formatCurrency(net)}`}
                </title>
              </circle>
            ))}
          </g>
        </svg>

        <div className="fin-center">
          <div className="fin-center-label">{centerLabel}</div>
          <div className={`fin-center-value ${centerClass}`}>{centerValue}</div>
          {caption && <div className="fin-center-caption">{caption}</div>}
        </div>
      </div>

      <div className="fin-legend">
        <div className="fin-legend-row">
          <span className="fin-dot fin-dot-spend" />
          <span className="fin-legend-label">Spending</span>
          <span className="fin-legend-value">{formatCurrency(expenses)}</span>
          <span className="fin-legend-pct">{spendPct !== null ? `${spendPct}%` : "—"}</span>
        </div>
        <div className="fin-legend-row">
          <span className="fin-dot fin-dot-save" />
          <span className="fin-legend-label">Savings (net)</span>
          <span className={`fin-legend-value ${net < 0 ? "neg" : ""}`}>
            {formatCurrency(net)}
          </span>
          <span className="fin-legend-pct">{savePct !== null ? `${savePct}%` : "—"}</span>
        </div>
      </div>
    </section>
  );
}
