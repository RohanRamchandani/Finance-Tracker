# CLAUDE.md — Finance Tracker Project Context

## What this is

A personal finance web app, being built for the creator's own use first. Core goal: give clear, real-time visibility into income/spending, then layer on investment evaluation tools, live market data, a savings/financial-freedom planner, and eventually a custom-trained AI model that ties it all together.

Full feature breakdown lives in `README.md` in this repo — read that for the complete feature list and long-term roadmap. This file is for day-to-day build context and conventions.

@README.md

## Current phase

Building **Feature 1: Expense & Earnings Dashboard** — the foundation. Nothing else is built yet.

For v1, transactions are entered manually (no bank integration yet — that's a later phase via Plaid or equivalent).

## Tech stack — STRICT, do not deviate

These are locked decisions. Do not suggest, substitute, or default to alternative frameworks, databases, or libraries without being explicitly asked to reconsider.

- **Frontend:** React, via Next.js
- **Backend:** Next.js API routes (comes bundled with the Next.js package — no separate backend framework/server for the main app)
- **Database:** PostgreSQL, hosted on Supabase specifically (not Neon, not Vercel Postgres, not any other provider)
- **ORM:** Prisma — all schema and queries go through Prisma, not raw SQL, unless there's a specific documented reason to drop down
- **Language:** TypeScript throughout the Next.js app (not plain JS) — money-handling code benefits from strict typing
- **Money values:** Store as Decimal/Numeric in Postgres (via Prisma's Decimal type), never as floating-point numbers — avoids rounding errors
- **Future AI/ML component:** a separate Python microservice, built specifically for the AI-powered investment evaluation tool (machine learning model to assess investment decisions). This is the only place Python enters the stack — it is not a replacement for the Next.js backend, and it is not built until that feature phase is reached. The Next.js backend will call this microservice over HTTP when it exists.

## Architecture decisions & reasoning

- Chose Next.js full-stack (React + API routes, one language, one deployment) over a separate React + Python backend to prioritize build speed for v1.
- Python is deliberately scoped to a single future responsibility: the ML-based investment evaluation microservice. It is not used anywhere else in the stack, and is not introduced until that feature is actively being built.
- Supabase was chosen over other Postgres hosts (e.g. Neon) as the single source of truth for the database — do not introduce a second hosting provider.

## Data model notes (for Feature 1)

Core entities needed:

- **Transaction** — amount (Decimal), merchant/description, category, timestamp, type (income/expense)
- **Category** — name, type (income/expense), user-defined or preset
- **User** — for auth, even in solo-use v1 (matters more once bank integration is added later)

## Conventions

- Prefer TypeScript strict mode
- Keep API routes and business logic (e.g. spending calculations) separate from UI components
- No bank/Plaid integration yet — don't add it prematurely; manual entry only for now

## Open questions (not yet decided — see README.md for full list)

- Budgeting/spend-limit features in scope for v1 or later?
- Exact "financial freedom" formula for Feature 4
- Bank integration approach when that phase starts