"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/finance";
import type { CategorySpend } from "@/lib/types";

// Fixed hue order (never cycled/re-ranked) so a category keeps its color as
// amounts change and the ranking shuffles. "Uncategorized" gets a neutral
// (it isn't a real identity), everything else falls back to a stable hash so
// a future custom category still gets a consistent color.
const CATEGORY_COLOR_ORDER = [
  "Groceries & Food",
  "Drinks Outside",
  "Furniture & Equipment",
  "Leisure",
  "Utilities",
];

function hashToSlot(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % CATEGORY_COLOR_ORDER.length;
}

function colorFor(item: CategorySpend): string {
  if (item.categoryId === null) return "var(--text-muted)";
  const idx = CATEGORY_COLOR_ORDER.indexOf(item.name);
  const slot = idx >= 0 ? idx : hashToSlot(item.name);
  return `var(--chart-series-${slot + 1})`;
}

const CX = 100;
const CY = 100;
const R_OUTER = 86;
const R_INNER = 54;
const PAD_DEG = 1.6; // half-gap on each side of a segment, in degrees

function polarToCartesian(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function donutPath(startDeg: number, endDeg: number): string {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const startOuter = polarToCartesian(R_OUTER, startDeg);
  const endOuter = polarToCartesian(R_OUTER, endDeg);
  const startInner = polarToCartesian(R_INNER, endDeg);
  const endInner = polarToCartesian(R_INNER, startDeg);
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

interface Segment {
  key: string;
  item: CategorySpend;
  value: number;
  fraction: number;
  start: number;
  end: number;
}

export default function SpendingPieChart({ items }: { items: CategorySpend[] }) {
  const [active, setActive] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + Number(i.total), 0);

  if (items.length === 0 || total <= 0) {
    return <p className="empty-state">No spending recorded this month yet.</p>;
  }

  const filtered = items.filter((i) => Number(i.total) > 0);
  const segments: Segment[] = filtered.map((item, index) => {
    const value = Number(item.total);
    const fraction = value / total;
    const start = filtered
      .slice(0, index)
      .reduce((sum, prev) => sum + (Number(prev.total) / total) * 360, 0);
    const end = start + fraction * 360;
    return {
      key: item.categoryId ?? "uncategorized",
      item,
      value,
      fraction,
      start,
      end,
    };
  });

  const activeSegment = segments.find((s) => s.key === active) ?? null;

  return (
    <div className="pie-chart">
      <svg
        viewBox="0 0 200 200"
        className="pie-svg"
        role="img"
        aria-label={`Spending by category. Largest: ${segments[0].item.name}, ${formatCurrency(segments[0].item.total)}.`}
      >
        {segments.map((seg) => {
          const span = seg.end - seg.start;
          const hasPad = segments.length > 1 && span > PAD_DEG;
          const start = hasPad ? seg.start + PAD_DEG / 2 : seg.start;
          const end = hasPad ? seg.end - PAD_DEG / 2 : seg.end;
          const isActive = active === seg.key;
          return (
            <path
              key={seg.key}
              d={donutPath(start, end)}
              fill={colorFor(seg.item)}
              opacity={active === null || isActive ? 1 : 0.45}
              tabIndex={0}
              onMouseEnter={() => setActive(seg.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(seg.key)}
              onBlur={() => setActive(null)}
              aria-label={`${seg.item.name}: ${formatCurrency(seg.item.total)}, ${Math.round(seg.fraction * 100)}%`}
            >
              <title>{`${seg.item.name}: ${formatCurrency(seg.item.total)} (${Math.round(seg.fraction * 100)}%)`}</title>
            </path>
          );
        })}

        {segments
          .filter((seg) => seg.fraction >= 0.08)
          .map((seg) => {
            const mid = (seg.start + seg.end) / 2;
            const pos = polarToCartesian((R_OUTER + R_INNER) / 2, mid);
            return (
              <text
                key={`label-${seg.key}`}
                x={pos.x}
                y={pos.y}
                className="pie-slice-label"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {Math.round(seg.fraction * 100)}%
              </text>
            );
          })}

        <text x={CX} y={CY - 8} textAnchor="middle" className="pie-center-label">
          {activeSegment ? activeSegment.item.name : "Total spent"}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" className="pie-center-value">
          {formatCurrency(activeSegment ? activeSegment.value : total)}
        </text>
      </svg>

      <table className="pie-legend">
        <caption className="sr-only">Spending by category, this month</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Amount</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => (
            <tr
              key={seg.key}
              className={active === seg.key ? "is-active" : ""}
              onMouseEnter={() => setActive(seg.key)}
              onMouseLeave={() => setActive(null)}
            >
              <td>
                <span
                  className="pie-swatch"
                  style={{ background: colorFor(seg.item) }}
                  aria-hidden="true"
                />
                {seg.item.name}
              </td>
              <td className="pie-amount">{formatCurrency(seg.value)}</td>
              <td className="pie-amount">{Math.round(seg.fraction * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
