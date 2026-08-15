# Personal Finance & Investment Intelligence App

A personal finance application built to give the creator (and eventually others) real clarity over day-to-day finances — where money goes, how much is coming in, and whether it's being put to good use. It goes beyond tracking by layering in investment evaluation, live market data, and (long-term) a custom-trained AI model that understands the user's financial behavior and gives personalized guidance.

**Vision:** Financial confidence — giving everyday users the same clarity and decision-making support once reserved for financial professionals.

This is being built primarily for the creator's own use first. More features will be added once the core pillars below are solid.

## Status

**Current phase:** Planning / feature definition. No pillar has been built yet. Feature 1 (Dashboard) is next up.

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

Not yet decided — web app vs. desktop/mobile. Decision should be based on wherever the creator would find it most accessible day-to-day.

## Open Questions

Tracked here so they aren't forgotten. Update/remove as decisions are made.

- Bank integration approach for instant transaction sync (e.g., Plaid or equivalent)
- Is investment evaluation limited to stocks, or also real estate, business ventures, etc.?
- Is budgeting/goal-setting (per-category spend limits) in scope alongside pure tracking?
- Does investment evaluation tie into a tracked net worth/portfolio, or stay a standalone "should I invest in X" calculator?
- Tech stack (frontend, backend, database, live market data source)
- Approach to training the custom AI model (what data, what framework, how much is realistic to build solo)
- What does "financial freedom" mean in calculable terms for this app (multiple of annual expenses? net worth target? passive income covering costs? needs a defined formula)
- How much does risk tolerance / user input (age, goals, risk appetite) factor into save-vs-invest recommendations, and where does that get captured?

## Changelog

- **2026-08-14** — Project initialized. README and CLAUDE.md created from initial feature spec. No code written yet.
