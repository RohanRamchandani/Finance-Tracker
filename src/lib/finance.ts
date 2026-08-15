// Pure, client-safe finance helpers. No Prisma / DB imports here so this file
// can be bundled into client components. Precise summation lives server-side
// (Postgres NUMERIC + Prisma Decimal aggregates); this file only parses a single
// user-entered value and formats for display.

// At most two decimal places, positive. We validate with a regex rather than
// parsing to a float so we never introduce rounding error at the input boundary.
const MONEY_REGEX = /^\d{1,10}(\.\d{1,2})?$/;

/**
 * Validate and canonicalize a user-entered amount to a fixed 2dp string.
 * Returns null if the input isn't a valid positive money value.
 */
export function normalizeAmount(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const trimmed = String(raw).trim();
  if (!MONEY_REGEX.test(trimmed)) return null;

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;

  // Canonicalize to exactly two decimals. Safe: MONEY_REGEX already capped the
  // input at <= 10 integer digits and <= 2 decimals, well within float range.
  return value.toFixed(2);
}

/** Format a fixed-point money string (or number) for display. */
export function formatCurrency(
  value: string | number,
  currency = "USD",
  locale = "en-US",
): string {
  const num = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(safe);
}

/** "2026-08" -> "August 2026". */
export function monthLabel(month: string, locale = "en-US"): string {
  const [year, m] = month.split("-").map(Number);
  if (!year || !m) return month;
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Current month as "YYYY-MM". */
export function currentMonth(now: Date = new Date()): string {
  const year = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${m}`;
}
