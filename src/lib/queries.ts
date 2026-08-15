import { prisma } from "@/lib/prisma";
import { Prisma, TransactionType } from "@/generated/prisma/client";
import type {
  CategoryDTO,
  CategorySpend,
  MonthlySummary,
  TransactionDTO,
  TxType,
} from "@/lib/types";

// --- Default single-user (no auth in v1) ------------------------------------
// Every record hangs off a User so real auth can be added later without a data
// migration. For now we transparently ensure one owner user exists.

const DEFAULT_USER_EMAIL = "owner@finance-tracker.local";

export async function getOrCreateDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Owner" },
  });
}

// --- Date helpers ------------------------------------------------------------

/** Half-open [start, end) UTC range for a "YYYY-MM" month. */
function monthRange(month: string): { start: Date; end: Date } {
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1));
  const end = new Date(Date.UTC(year, m, 1));
  return { start, end };
}

// --- Mapping -----------------------------------------------------------------

function toDTO(tx: {
  id: string;
  amount: Prisma.Decimal;
  description: string;
  type: TransactionType;
  occurredAt: Date;
  category: { id: string; name: string } | null;
}): TransactionDTO {
  return {
    id: tx.id,
    amount: tx.amount.toFixed(2),
    description: tx.description,
    type: tx.type,
    occurredAt: tx.occurredAt.toISOString(),
    category: tx.category
      ? { id: tx.category.id, name: tx.category.name }
      : null,
  };
}

// --- Categories --------------------------------------------------------------

export async function listCategories(userId: string): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return rows.map((c) => ({ id: c.id, name: c.name, type: c.type }));
}

// --- Transactions ------------------------------------------------------------

export async function listTransactions(
  userId: string,
  limit = 25,
): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { category: { select: { id: true, name: true } } },
  });
  return rows.map(toDTO);
}

export interface CreateTransactionInput {
  amount: string; // normalized 2dp string
  description: string;
  type: TxType;
  occurredAt: Date;
  categoryId: string | null;
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput,
): Promise<TransactionDTO> {
  const tx = await prisma.transaction.create({
    data: {
      userId,
      amount: new Prisma.Decimal(input.amount),
      description: input.description,
      type: input.type as TransactionType,
      occurredAt: input.occurredAt,
      categoryId: input.categoryId,
    },
    include: { category: { select: { id: true, name: true } } },
  });
  return toDTO(tx);
}

/** Delete scoped to the owner. Returns true if a row was removed. */
export async function deleteTransaction(
  userId: string,
  id: string,
): Promise<boolean> {
  const { count } = await prisma.transaction.deleteMany({
    where: { id, userId },
  });
  return count > 0;
}

/** Confirm a category exists, belongs to the user, and matches the tx type. */
export async function categoryIsValid(
  userId: string,
  categoryId: string,
  type: TxType,
): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, type: type as TransactionType },
    select: { id: true },
  });
  return category !== null;
}

// --- Spending calculations (kept out of the UI) ------------------------------

export async function getMonthlySummary(
  userId: string,
  month: string,
): Promise<MonthlySummary> {
  const { start, end } = monthRange(month);
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  const sumFor = (type: TransactionType): Prisma.Decimal =>
    rows.find((r) => r.type === type)?._sum.amount ?? new Prisma.Decimal(0);

  const income = sumFor(TransactionType.INCOME);
  const expenses = sumFor(TransactionType.EXPENSE);

  return {
    month,
    income: income.toFixed(2),
    expenses: expenses.toFixed(2),
    net: income.minus(expenses).toFixed(2),
  };
}

export async function getCategoryBreakdown(
  userId: string,
  month: string,
  type: TxType = "EXPENSE",
): Promise<CategorySpend[]> {
  const { start, end } = monthRange(month);
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: type as TransactionType,
      occurredAt: { gte: start, lt: end },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  if (rows.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  return rows.map((r) => ({
    categoryId: r.categoryId,
    name: r.categoryId
      ? (nameById.get(r.categoryId) ?? "Unknown")
      : "Uncategorized",
    total: (r._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
  }));
}
