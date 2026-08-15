"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/finance";
import type { TransactionDTO } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionList({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="empty-state">
        No transactions yet. Add your first income or expense to get started.
      </p>
    );
  }

  return (
    <ul className="tx-list">
      {transactions.map((tx) => {
        const isIncome = tx.type === "INCOME";
        return (
          <li key={tx.id} className="tx-row">
            <div className="tx-main">
              <div className="tx-desc">{tx.description}</div>
              <div className="tx-meta">
                {formatDate(tx.occurredAt)}
                {tx.category ? ` · ${tx.category.name}` : ""}
              </div>
            </div>
            <div className={`tx-amount ${isIncome ? "income" : "expense"}`}>
              {isIncome ? "+" : "−"}
              {formatCurrency(tx.amount)}
            </div>
            <button
              type="button"
              className="tx-delete"
              aria-label={`Delete ${tx.description}`}
              onClick={() => handleDelete(tx.id)}
              disabled={deletingId === tx.id}
            >
              ×
            </button>
          </li>
        );
      })}
    </ul>
  );
}
