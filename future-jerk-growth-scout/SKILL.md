---
name: future-jerk-growth-scout
description: Identify, evaluate, compare, and rank public companies that may become future jerk-growth winners before the market fully prices them in. Use when Codex needs to find, screen, rank, compare, or investigate potential future jerk-growth companies; determine whether a company is merely accelerating or is entering a true jerk-growth regime; move from a theme, sector, value chain, macro, regulatory, consumer, capex, or platform shift to candidate companies; turn a company, watchlist, peer set, screener universe, geography, market-cap bucket, or sector list into a ranked jerk-growth assessment; or compare several companies to choose the best future jerk-growth candidate. Do not use for pure technical-analysis requests, generic value-investing questions, broad news summaries without a company-selection objective, purely historical/company-biography questions, or chart-pattern requests without fundamental expectation-revision evidence.
---

# Future Jerk Growth Scout

## Objective

Find and evaluate future jerk-growth companies.

Keep the skill narrowly focused on one job:

- find and evaluate future jerk-growth companies
- avoid generic stock research
- avoid pure chart analysis
- avoid broad news summarization
- avoid generic value-investing work

Assume these defaults unless the user specifies otherwise:

- public equities only
- a forward-looking discovery horizon of 6-24 months

State any default assumptions and proceed.

## Use the operating definition

Start from this premise:

- expected growth is usually already priced in
- a one-off beat or guidance raise can create a step-up in price
- acceleration means growth is improving
- jerk growth means the rate of positive forward expectation revision is itself increasing

Treat true jerk growth as a setup where:

- multiple growth engines are stacking
- visibility and duration are improving
- future earnings power is being revised upward repeatedly
- the market's model of the company keeps getting rewritten

Separate these three tracks on every run:

1. Business acceleration
2. Expectation or estimate revision acceleration
3. Stock-price confirmation

Never classify a company as jerk growth from price action alone. Use price only as confirmation.

## Use the standard labels

Classify each company with one label:

| Label | Use when this is true |
| --- | --- |
| **Step-up only** | One-off beat, raise, or event reset exists, but persistence and duration evidence are weak |
| **Acceleration only** | Business momentum is improving, but expectation revision acceleration is not strong enough yet |
| **True early jerk candidate** | Business acceleration and revision acceleration are both present, engines are stacking, and recognition is still low to medium |
| **Confirmed jerk regime** | Repeated upward revisions, durable operating confirmation, and price confirmation are all present across multiple periods |
| **Crowded / late jerk** | Business and revisions remain strong, but recognition and crowdedness are already high |
| **Hype without business support** | Narrative or price strength exists without strong primary-source evidence of durable business and revision support |

Use these guardrails before finalizing the label:

- classify as **Hype without business support** when price confirmation is high but business and revision evidence are weak
- classify as **Step-up only** when only one quarter or one event supports the case
- classify as **Acceleration only** when business momentum is clear but revision acceleration is still tentative
- classify as **True early jerk candidate** when business acceleration, revision acceleration, and improving duration are all present while recognition is still low to medium
- classify as **Confirmed jerk regime** when repeated business and revision confirmation spans multiple quarters
- classify as **Crowded / late jerk** when the regime is real but already obvious and crowded

## Choose the research mode

State the mode choice in one sentence at the start of the answer.

- Choose **bottom-up** when the user starts with a company, watchlist, peer set, screener universe, or constrained equity universe.
- Choose **top-down** when the user starts with a technology shift, regulatory change, capex wave, value-chain inflection, consumer behavior change, infrastructure bottleneck, platform transition, or macro driver.
- Choose **hybrid** when both theme mapping and company selection matter, or when the request is broad enough that mapping the value chain first is useful.

## Follow the evidence rules

Use primary sources first whenever possible:

- earnings releases
- 10-K, 10-Q, 20-F, annual reports, and interim reports
- earnings call transcripts
- investor-day materials
- investor presentations
- official guidance and KPI disclosures
- regulatory filings
- management commentary on demand, capacity, duration, and mix

Use secondary sources only as supplements or clearly labeled proxies.

Apply these rules on every run:

- back every important factual claim with a source
- make every important claim date-aware
- use exact fiscal periods whenever possible
- prefer direct company disclosures over summaries
- separate **Known**, **Inferred**, and **Missing**
- surface at least one disconfirming risk for every bullish candidate

If direct consensus is unavailable, use a clearly labeled proxy such as prior company guidance, analyst summaries, or visible estimate-revision evidence.

## Follow the workflow

1. Parse the request and extract constraints such as geography, market cap, sector, time horizon, risk tolerance, and requested output shape.
2. Choose the research mode and explain it in one sentence.
3. Build the universe from the user input, or map the value chain first if the request is top-down or hybrid.
4. Gather at least one primary source per company before ranking it when possible.
5. Separate business momentum, revision momentum, and price confirmation for each company.
6. Apply sector-specific leading indicators from [references/sector-indicators.md](references/sector-indicators.md).
7. Run anti-false-positive checks and surface the strongest disconfirming evidence.
8. Score and classify the names using [references/scoring-framework.md](references/scoring-framework.md).
9. Use the matching output shape from [references/output-templates.md](references/output-templates.md).
10. Report why now, what would confirm the thesis over the next 2-4 quarters, what would falsify it, and what data remain missing.

When multiple companies, subsegments, or evidence streams can be researched independently, investigate them in parallel and synthesize only after enough evidence exists to classify or rank.

## Use the references deliberately

Load only the reference file needed for the current request:

- use [references/sector-indicators.md](references/sector-indicators.md) for sector-specific leading indicators
- use [references/scoring-framework.md](references/scoring-framework.md) for scoring, score interpretation, and score-to-label synthesis
- use [references/output-templates.md](references/output-templates.md) for screen, deep-dive, comparison, top-down, and fast-answer output shapes

Do not load every reference by default.

## Agent behavior

- avoid verbose progress chatter
- investigate in parallel when multiple companies, subsegments, or evidence streams can be researched independently
- synthesize only after enough evidence exists to classify or rank
- be explicit about uncertainty
- never pretend thin evidence is strong evidence
- never call something jerk growth solely because the stock chart looks strong
- prefer being slightly cautious and provisional over overstating the thesis
