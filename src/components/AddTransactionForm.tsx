"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryDTO, TxType } from "@/lib/types";

function todayInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AddTransactionForm({
  categories,
}: {
  categories: CategoryDTO[];
}) {
  const router = useRouter();
  const [type, setType] = useState<TxType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const options = categories.filter((c) => c.type === type);

  function switchType(next: TxType) {
    setType(next);
    setCategoryId(""); // categories are type-specific
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          type,
          categoryId: categoryId || null,
          occurredAt: new Date(`${date}T00:00:00`).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setAmount("");
      setDescription("");
      setCategoryId("");
      router.refresh();
    } catch {
      setError("Network error — is the app connected to the database?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className="form-error">{error}</p>}

      <div className="field">
        <div className="type-toggle">
          <button
            type="button"
            className={type === "INCOME" ? "active-income" : ""}
            onClick={() => switchType("INCOME")}
            aria-pressed={type === "INCOME"}
          >
            Income
          </button>
          <button
            type="button"
            className={type === "EXPENSE" ? "active-expense" : ""}
            onClick={() => switchType("EXPENSE")}
            aria-pressed={type === "EXPENSE"}
          >
            Expense
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          placeholder={type === "INCOME" ? "e.g. Paycheck" : "e.g. Groceries"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Uncategorized</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Adding…" : `Add ${type === "INCOME" ? "income" : "expense"}`}
      </button>
    </form>
  );
}
