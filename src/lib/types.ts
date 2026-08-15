// Serializable data-transfer shapes passed from server components to the client.
// Money is always carried as a fixed-point string (e.g. "1250.00") to preserve
// precision across the server/client boundary — never as a Prisma.Decimal
// (not serializable) or a JS number (lossy).

export type TxType = "INCOME" | "EXPENSE";

export interface CategoryDTO {
  id: string;
  name: string;
  type: TxType;
}

export interface TransactionDTO {
  id: string;
  amount: string; // fixed 2dp, e.g. "42.50"
  description: string;
  type: TxType;
  occurredAt: string; // ISO date string
  category: { id: string; name: string } | null;
}

export interface MonthlySummary {
  month: string; // "YYYY-MM"
  income: string; // fixed 2dp
  expenses: string; // fixed 2dp
  net: string; // income - expenses, fixed 2dp (may be negative)
}

export interface CategorySpend {
  categoryId: string | null;
  name: string;
  total: string; // fixed 2dp
}
