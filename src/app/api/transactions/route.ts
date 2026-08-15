import {
  categoryIsValid,
  createTransaction,
  getOrCreateDefaultUser,
  listTransactions,
} from "@/lib/queries";
import { normalizeAmount } from "@/lib/finance";
import type { TxType } from "@/lib/types";

const MAX_DESCRIPTION = 200;

export async function GET() {
  const user = await getOrCreateDefaultUser();
  const transactions = await listTransactions(user.id);
  return Response.json({ transactions });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Expected a JSON object." }, { status: 400 });
  }
  const data = body as Record<string, unknown>;

  // amount
  const amount = normalizeAmount(data.amount);
  if (amount === null) {
    return Response.json(
      { error: "Amount must be a positive number with up to 2 decimals." },
      { status: 400 },
    );
  }

  // description
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  if (description.length === 0) {
    return Response.json(
      { error: "Description is required." },
      { status: 400 },
    );
  }
  if (description.length > MAX_DESCRIPTION) {
    return Response.json(
      { error: `Description must be ${MAX_DESCRIPTION} characters or fewer.` },
      { status: 400 },
    );
  }

  // type
  if (data.type !== "INCOME" && data.type !== "EXPENSE") {
    return Response.json(
      { error: "Type must be INCOME or EXPENSE." },
      { status: 400 },
    );
  }
  const type = data.type as TxType;

  // occurredAt (optional, defaults to now)
  let occurredAt = new Date();
  if (data.occurredAt !== undefined && data.occurredAt !== null) {
    if (typeof data.occurredAt !== "string") {
      return Response.json(
        { error: "occurredAt must be an ISO date string." },
        { status: 400 },
      );
    }
    const parsed = new Date(data.occurredAt);
    if (Number.isNaN(parsed.getTime())) {
      return Response.json(
        { error: "occurredAt is not a valid date." },
        { status: 400 },
      );
    }
    occurredAt = parsed;
  }

  const user = await getOrCreateDefaultUser();

  // categoryId (optional; must belong to the user and match the type)
  let categoryId: string | null = null;
  if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== "") {
    if (typeof data.categoryId !== "string") {
      return Response.json(
        { error: "categoryId must be a string." },
        { status: 400 },
      );
    }
    const valid = await categoryIsValid(user.id, data.categoryId, type);
    if (!valid) {
      return Response.json(
        { error: "Category not found or doesn't match the transaction type." },
        { status: 400 },
      );
    }
    categoryId = data.categoryId;
  }

  const transaction = await createTransaction(user.id, {
    amount,
    description,
    type,
    occurredAt,
    categoryId,
  });

  return Response.json({ transaction }, { status: 201 });
}
