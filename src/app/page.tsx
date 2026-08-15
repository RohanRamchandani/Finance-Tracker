import {
  getCategoryBreakdown,
  getMonthlySummary,
  getOrCreateDefaultUser,
  listCategories,
  listTransactions,
} from "@/lib/queries";
import { currentMonth, monthLabel } from "@/lib/finance";
import SummaryCards from "@/components/SummaryCards";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import CategoryBreakdown from "@/components/CategoryBreakdown";

// Reads live data from the database on every request.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const month = currentMonth();
  const user = await getOrCreateDefaultUser();

  const [categories, transactions, summary, breakdown] = await Promise.all([
    listCategories(user.id),
    listTransactions(user.id),
    getMonthlySummary(user.id, month),
    getCategoryBreakdown(user.id, month, "EXPENSE"),
  ]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Finance Tracker</h1>
        <p>{monthLabel(month)} · income &amp; spending at a glance</p>
      </header>

      <SummaryCards summary={summary} />

      <div className="columns">
        <section className="panel">
          <h2>Add transaction</h2>
          <AddTransactionForm categories={categories} />
        </section>

        <div>
          <section className="panel">
            <h2>Recent transactions</h2>
            <TransactionList transactions={transactions} />
          </section>
          <section className="panel">
            <h2>Spending by category</h2>
            <CategoryBreakdown items={breakdown} />
          </section>
        </div>
      </div>
    </main>
  );
}
