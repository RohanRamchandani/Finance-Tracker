# CLAUDE.md

Instructions for Claude when working in this repository. Read this at the start of every session before doing anything else — it is the source of truth for what this project is and how to work on it.

## What this project is

A personal finance and investment intelligence app, built by Rohan primarily for his own use. The goal is not just to track spending — it's to give financial clarity and, eventually, personalized AI-driven guidance on spending, saving, and investing.

See `README.md` for the full feature spec, build order, and open questions. **Keep README.md up to date as decisions get made** — it's the living project doc that future sessions rely on. This file (CLAUDE.md) is for *how to work*, not *what the features are*; don't duplicate feature detail here, link to README.md instead.

## Build order — respect it

The five pillars are intentionally sequenced. Do not jump ahead to a later pillar (e.g. building AI insights or live market data) before the earlier ones are functional, unless Rohan explicitly asks for it:

1. Dashboard (expense/earnings tracking + insights) — **current focus**
2. Investment Evaluation Tool (TVM, NPV, IRR, payback period, risk-adjusted returns)
3. Live Market & Multi-Asset Data
4. Savings & Financial Freedom Planner (bridges #1 and #2/#3)
5. Custom AI Model

Check the "Status" section of README.md for what phase we're actually in before assuming.

## How Rohan wants to work

- This is a learning project as much as a product — Rohan is using personal projects like this to build ML/AI/data analytics/visualization skills. Prefer explaining the *why* behind non-obvious technical choices, not just implementing silently.
- No pillar has been built yet as of project init (2026-08-14). Tech stack, platform (web vs. desktop/mobile), and data sources are all still open — don't assume a stack that hasn't been decided. Check the Open Questions section in README.md before making architectural decisions, and flag when a task requires resolving one of those questions first.
- Accuracy matters more than speed for anything touching real financial calculations (TVM/NPV/IRR, savings math, spending analysis) — Rohan intends to use this for real personal financial decisions. Don't approximate or hand-wave financial formulas; get them right, cite the standard formula, and test them against known examples.
- When a new architectural or product decision gets made during a session, update README.md's relevant section (and Open Questions / Changelog) as part of that work, not as an afterthought.

## Sensitive data

This app will eventually handle bank-linked transaction data (via Plaid or similar) and other personal financial information.

- Never commit real credentials, API keys, account numbers, or actual transaction data to the repo. Use `.env` / secrets management once a stack is chosen, and make sure `.gitignore` excludes them.
- When building/testing bank-linking or transaction features, use sandbox/mock data, not Rohan's real account data, unless he explicitly says otherwise.

## Working conventions

- Don't add features or infrastructure for a pillar before its predecessor pillar is functional — check README's Status section.
- When you resolve one of the Open Questions (stack, bank integration approach, "financial freedom" formula, etc.), record the decision in README.md and remove it from Open Questions.
- Keep this file (CLAUDE.md) about process/instructions; keep README.md about product/feature state. If something belongs in both, put the detail in README.md and link to it from here.
