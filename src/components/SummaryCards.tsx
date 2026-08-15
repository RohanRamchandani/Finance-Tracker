import { formatCurrency } from "@/lib/finance";
import type { MonthlySummary } from "@/lib/types";

export default function SummaryCards({
  summary,
}: {
  summary: MonthlySummary;
}) {
  const netValue = Number(summary.net);

  return (
    <div className="summary-grid">
      <div className="stat-card">
        <div className="stat-label">Income</div>
        <div className="stat-value pos">{formatCurrency(summary.income)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Expenses</div>
        <div className="stat-value neg">{formatCurrency(summary.expenses)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Net</div>
        <div
          className={`stat-value ${netValue > 0 ? "pos" : netValue < 0 ? "neg" : ""}`}
        >
          {formatCurrency(summary.net)}
        </div>
      </div>
    </div>
  );
}
