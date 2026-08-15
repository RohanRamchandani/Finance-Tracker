# Personal Finance & Investment Intelligence App

A personal finance application built to give the creator (and eventually others) real clarity over day-to-day finances — where money goes, how much is coming in, and whether it's being put to good use. It goes beyond tracking by layering in investment evaluation, live market data, and (long-term) a custom-trained AI model that understands the user's financial behavior and gives personalized guidance.

**Vision:** Financial confidence — giving everyday users the same clarity and decision-making support once reserved for financial professionals.

This is being built primarily for the creator's own use first. More features will be added once the core pillars below are solid.

## Status

**Current phase:** Building Feature 1 (Expense & Earnings Dashboard). The dashboard is scaffolded and building — the app, database schema, API, and UI are in place. The remaining step to run it is connecting a Supabase database (see **Getting Started** below). For v1, transactions are entered manually — bank integration (Plaid or equivalent) is a later phase, not part of the initial build.

**What's built so far (Feature 1):**
- Next.js (App Router, TypeScript) app with a dashboard at `/`
- Prisma schema: `User`, `Category`, `Transaction` (money stored as `Decimal`)
- API routes: create/list/delete transactions, list categories (with validation)
- Dashboard UI: monthly income/expenses/net summary, add-transaction form, recent transactions list, spending-by-category breakdown
- Seed script with preset categories + sample data
- Single default user (no login yet — auth is a later phase)

## Build Order

Pillars are sequenced intentionally — each should be functional before starting the next:

1. **Dashboard** (tracking + insights)
2. **Investment Evaluation Tool**
3. **Live Market / Multi-Asset Data** (built alongside or after #2)
4. **Savings & Financial Freedom Planner** (bridges #1 and #2/#3)
5. **Custom AI Model** (layered in once there's real data to learn from)

## Features

### 1. Expense & Earnings Dashboard (build first)
The foundation. Turns raw income/expense data into an always-current picture of what the user has and where it's going.

- **Instant transaction capture (bank-linked)** — auto-record every transaction the moment it happens, no manual entry. Each transaction stores at minimum: amount, merchant/description, category (auto-tagged where possible), timestamp.
- **Automatic income/expense logging** — transactions sorted into income vs. expense in real time.
- **Spending pattern analysis** — surfaces where the user is spending the most (e.g., "You're spending a lot on X this month").
- **Smart notifications** — proactive alerts when a spending pattern stands out relative to the user's norm or income.
- **Predictive savings suggestions** — goes beyond reporting to actively predict savings opportunities (e.g., "cut back on coffee, save ~$X/month").
- More sub-features to be added as the dashboard evolves — this list is not final.

### 2. Investment Evaluation Tool (build after dashboard)
User inputs a potential investment; the app calculates whether it's worth pursuing using real financial evaluation methods rather than guesswork.

- Time Value of Money (TVM)
- Net Present Value (NPV)
- Internal Rate of Return (IRR)
- Payback period
- Risk-adjusted return comparisons

**Output:** an interpretable verdict (good opportunity vs. risky/poor), not just raw numbers.

### 3. Live Market & Multi-Asset Data
Shows how different investment opportunities are performing day-to-day so users can explore options beyond what they're personally evaluating.

- Stocks — live daily price data, shown as graphs
- Other assets — gold, silver, and other investment-worthy assets (list to expand)
- Calculations layered on top of raw price feeds — trend analysis, volatility, comparative performance — to help judge if something is "worth investing"

### 4. Savings & Financial Freedom Planner
Connects the dashboard's real income/expense data to the investment side.

- **Recommended savings amount** — based on actual cash flow, not a generic rule of thumb.
- **Goal-based targets** — given a target (financial freedom number, emergency fund, purchase goal) and timeline, calculate required savings per week/month.
- **Flexible saving suggestions** — sensible default amounts for users without a specific goal.
- **Bridge to investing** — once a savings amount is calculated, point to which investments/stocks might be worth considering for that amount, using the same evaluation logic (TVM/NPV/IRR) and live market data from Features 2 & 3. Saving stops being passive and starts feeding the investment-evaluation loop.

### 5. AI-Powered Insights (Custom-Trained Model)
The intelligence layer tying everything together. A custom-trained model (not just a generic LLM wrapper) so financial understanding and recommendations are as accurate as possible for real personal use — this is a "get it right" priority since the creator intends to use it for real decisions.

- Understand the user's financial data (spending, earnings, investment behavior) in context
- Offer personalized recommendations
- Spot patterns the user might not notice themselves
- Tie into the dashboard, investment tools, and savings planner over time

## Platform

**Decided:** Web app, built as a full-stack Next.js application.

## Tech Stack

Locked decisions — see `CLAUDE.md` for the full rationale and build conventions.

- **Frontend:** React, via Next.js
- **Backend:** Next.js API routes (no separate backend server for the main app)
- **Database:** PostgreSQL, hosted on Supabase
- **ORM:** Prisma (no raw SQL unless there's a documented reason)
- **Language:** TypeScript throughout, strict mode preferred
- **Money values:** stored as Decimal/Numeric (Prisma's Decimal type) — never floating-point
- **Future AI/ML component:** a separate Python microservice, scoped specifically to the AI-powered investment evaluation tool (Feature 5). This is the only place Python enters the stack, and it isn't built until that feature phase is reached.

## Getting Started

Prerequisites: Node.js 20+ and a free [Supabase](https://supabase.com) project.

1. **Install dependencies** (also generates the Prisma client):
   ```bash
   npm install
   ```

2. **Connect Supabase.** Copy the env template and paste your connection string:
   ```bash
   cp .env.example .env
   ```
   In the Supabase dashboard: your project → **Connect** → **ORMs / Connection string**. Use the **direct** connection or the **Session** pooler (port 5432) — both support migrations. Keep `?sslmode=require`, and URL-encode any special characters in the password. Paste it as `DATABASE_URL` in `.env`.

3. **Create the database tables** (generates and applies the first migration):
   ```bash
   npm run db:migrate
   ```

4. **Seed preset categories + sample data** (optional but recommended for a non-empty dashboard):
   ```bash
   npm run db:seed
   ```

5. **Run the app:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

Handy scripts: `npm run db:studio` (browse data in Prisma Studio), `npm run build` (production build), `npm run lint`.

> **Note on Prisma 7:** this project uses Prisma's new driver-adapter setup (`@prisma/adapter-pg` + `pg`), the `prisma-client` generator (output at `src/generated/prisma`, git-ignored and regenerated on install), and `prisma.config.ts` for datasource/env config. Re-run `npm run db:generate` after any schema change.

## Open Questions

Tracked here so they aren't forgotten. Update/remove as decisions are made.

- Bank integration approach for instant transaction sync (e.g., Plaid or equivalent) — deferred past v1
- Is investment evaluation limited to stocks, or also real estate, business ventures, etc.?
- Is budgeting/goal-setting (per-category spend limits) in scope for v1 or a later phase?
- Does investment evaluation tie into a tracked net worth/portfolio, or stay a standalone "should I invest in X" calculator?
- Live market data source/provider (which API for stocks, gold, silver, etc.)
- Approach to training the custom AI model (what data, what framework, how much is realistic to build solo)
- What does "financial freedom" mean in calculable terms for this app (multiple of annual expenses? net worth target? passive income covering costs? needs a defined formula)
- How much does risk tolerance / user input (age, goals, risk appetite) factor into save-vs-invest recommendations, and where does that get captured?

## Changelog

- **2026-08-14** — Project initialized. README and CLAUDE.md created from initial feature spec. No code written yet.
- **2026-08-14** — Tech stack locked in: Next.js (React + API routes) full-stack, TypeScript, PostgreSQL via Supabase, Prisma ORM. Platform decided as web app. Python scoped exclusively to a future AI investment-evaluation microservice. Build started on Feature 1 (Dashboard), v1 using manual transaction entry (bank integration deferred).
- **2026-08-14** — Feature 1 dashboard scaffolded: Next.js 16 (App Router, TS strict) + Prisma 7 (driver adapters, `prisma-client` generator) schema for User/Category/Transaction with Decimal money, API routes for transaction CRUD + categories, and a dashboard UI (monthly summary, add-transaction form, recent list, category breakdown). Single default user (no auth yet). Typecheck + production build + lint all pass; pending a Supabase connection to run end-to-end.
