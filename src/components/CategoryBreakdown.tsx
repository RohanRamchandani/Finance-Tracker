import { formatCurrency } from "@/lib/finance";
import type { CategorySpend } from "@/lib/types";

export default function CategoryBreakdown({
  items,
}: {
  items: CategorySpend[];
}) {
  if (items.length === 0) {
    return <p className="empty-state">No spending recorded this month yet.</p>;
  }

  // Scale each bar relative to the largest category so the biggest fills the row.
  const max = Math.max(...items.map((i) => Number(i.total)), 0);

  return (
    <div>
      {items.map((item) => {
        const value = Number(item.total);
        const width = max > 0 ? Math.round((value / max) * 100) : 0;
        return (
          <div className="cat-row" key={item.categoryId ?? "uncategorized"}>
            <div className="cat-head">
              <span>{item.name}</span>
              <span className="cat-amount">{formatCurrency(item.total)}</span>
            </div>
            <div className="cat-bar">
              <div className="cat-bar-fill" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
