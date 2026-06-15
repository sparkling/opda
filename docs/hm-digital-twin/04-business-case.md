# Business Case: H&M Enterprise Digital Twin and Agentic Operating System

## Purpose

This document gives an indicative business case for a linked-data enterprise
digital twin at H&M Group. It is not a forecast and should not be used as a
financial commitment without internal validation. It translates public financial
and operational baselines into value pools that can be tested during discovery.

## Public Financial Baseline

H&M Group full-year 2025:

| Metric | Value |
|---|---:|
| Net sales | SEK 228.285bn |
| Gross profit | SEK 121.821bn |
| Gross margin | 53.4% |
| Operating profit | SEK 18.395bn |
| Operating margin | 8.1% |
| Profit after tax | SEK 12.085bn |

H&M Group Q1 2026:

| Metric | Value |
|---|---:|
| Net sales | SEK 49.607bn |
| Gross margin | 50.7% |
| Operating profit | SEK 1.512bn |
| Operating margin | 3.0% |
| Stock-in-trade | SEK 34.608bn |
| Stock-in-trade change YoY | -16% |
| Stock-in-trade as % rolling 12-month sales | 15.6% |
| Online share | Just over 30% |
| Store count at 28 Feb 2026 | 4,050 |

## Value Pool Summary

The programme should target five value pools:

| Value Pool | Primary Mechanism | Main KPI |
|---|---|---|
| Revenue capture | Better availability, trend response, localisation | Incremental sales, conversion, stockout reduction |
| Gross margin | Lower markdowns, better allocation, in-season buys | Markdown rate, full-price sell-through, gross margin |
| Working capital | Lower average stock and aged stock | Stock-in-trade, turns, aged stock |
| Operating cost | Fewer expedites, better logistics, automated analysis | Fulfilment cost, logistics cost, manual planning hours |
| Strategic resilience | Faster scenario planning and supplier/logistics optionality | Disruption recovery time, supplier risk exposure |

## Indicative Scenario Ranges

These ranges are intentionally conservative at the low end and ambitious at the
high end. They should be validated with internal data.

### 1. Revenue Capture

Mechanisms:

- Reduced stockouts.
- Better size and colour availability.
- Faster local allocation.
- Better ecommerce/store fulfilment decisions.
- Faster response to proven demand signals.

Scenario:

| Case | Net Sales Uplift | Incremental Sales | Gross Profit at 53.4% |
|---|---:|---:|---:|
| Low | 0.5% | SEK 1.14bn | SEK 0.61bn |
| Base | 1.0% | SEK 2.28bn | SEK 1.22bn |
| High | 2.0% | SEK 4.57bn | SEK 2.44bn |

### 2. Gross Margin and Markdown Avoidance

Mechanisms:

- Better initial allocation.
- Fewer stranded-stock pockets.
- Faster transfers before markdown.
- More in-season buying when demand is proven.
- Better balance between full-price sales and promotion.

Scenario:

| Case | Gross Margin Improvement | Annual Gross Profit Impact |
|---|---:|---:|
| Low | 25 bps of sales | SEK 0.57bn |
| Base | 50 bps of sales | SEK 1.14bn |
| High | 150 bps of sales | SEK 3.42bn |

### 3. Working Capital Release

Mechanisms:

- Lower average inventory.
- Better inventory mix.
- Faster sell-through.
- Less aged stock.
- Better purchase timing.

Using Q1 2026 stock-in-trade of SEK 34.608bn:

| Case | Stock Reduction | Cash Released |
|---|---:|---:|
| Low | 5% | SEK 1.73bn |
| Base | 10% | SEK 3.46bn |
| High | 15% | SEK 5.19bn |

This is primarily cash and capital efficiency, not direct operating profit.

### 4. Operating Cost and Productivity

Mechanisms:

- Lower manual planning effort.
- Fewer exception meetings.
- Better warehouse and logistics planning.
- Fewer expedites.
- Better route and capacity decisions.
- More automated decision preparation.

Because H&M's public accounts do not isolate all addressable logistics and
planning costs, this uses an addressable cost-pool assumption.

| Case | Addressable Annual Cost Pool | Efficiency | Annual Impact |
|---|---:|---:|---:|
| Low | SEK 25bn | 3% | SEK 0.75bn |
| Base | SEK 30bn | 5% | SEK 1.50bn |
| High | SEK 40bn | 8% | SEK 3.20bn |

This must be validated internally by mapping fulfilment, logistics, planning,
expedite, warehouse, and manual exception costs.

### 5. Strategic Resilience and Option Value

This value is harder to annualise but critical:

- Faster response to supplier disruption.
- Better tariff and trade scenario planning.
- Better near/far sourcing mix.
- Lower cost of demand shocks.
- Faster product substitution when a material, supplier, or route is constrained.
- Better compliance and traceability readiness.

The value should be measured as avoided loss, avoided expedite cost, avoided
markdown, and faster recovery time.

## Combined Annual Profit Contribution

Illustrative mature-state annual recurring profit contribution:

| Case | Revenue Gross Profit | Margin/Markdown | Operating Cost | Total Profit Contribution |
|---|---:|---:|---:|---:|
| Low | SEK 0.61bn | SEK 0.57bn | SEK 0.75bn | SEK 1.93bn |
| Base | SEK 1.22bn | SEK 1.14bn | SEK 1.50bn | SEK 3.86bn |
| High | SEK 2.44bn | SEK 3.42bn | SEK 3.20bn | SEK 9.06bn |

Rounded board range:

SEK 2-9bn annual recurring profit contribution at mature scale, plus SEK
1.7-5.2bn potential working-capital release from inventory improvement.

This assumes enterprise-scale adoption. A first vertical slice should target a
measurable subset, not the full range.

## Investment Logic

The business case should be staged:

### Mobilisation Case

Fund a 12-week prototype and programme design.

Success proof:

- Live linked-data slice.
- At least one agentic workflow.
- Measured baseline and simulated value.
- Board-level scale case.

### Scale Case

Fund the core twin spine and first 3-5 value flows.

Success proof:

- Operational use in real decisions.
- Recommendation adoption.
- Improved decision latency.
- Measurable inventory, margin, and working-capital movement.

### Enterprise Case

Fund global scale and deeper automation.

Success proof:

- Twin used as common decision environment.
- Agents execute approved low-risk actions.
- Decision ledger links recommendations to outcomes.
- Business KPIs move materially.

## Benefit Measurement Framework

For each use case, capture:

- Baseline decision cycle time.
- Baseline decision quality.
- Baseline stock, margin, revenue, cost, and cash metrics.
- Recommendation accuracy.
- Recommendation adoption rate.
- Override rate and reason.
- Action execution time.
- Outcome versus simulation.
- User trust and adoption.

Example: in-season allocation

| KPI | Baseline | Target Direction |
|---|---|---|
| Time to identify stock imbalance | Days/weeks | Hours/minutes |
| Time to recommend action | Manual cycle | Agent generated |
| Transfer recommendation adoption | Unknown | Track by market/category |
| Lost sales from stockout | Baseline by SKU/store | Reduce |
| Aged stock | Baseline by SKU/market | Reduce |
| Markdown exposure | Baseline by SKU/market | Reduce |
| Full-price sell-through | Baseline by product family | Increase |

## Cost Categories

Expected investment categories:

- Linked-data twin substrate.
- Data integration and event streaming.
- Entity resolution and master data remediation.
- Agent runtime and orchestration.
- AI model consumption and evaluation.
- Optimisation and simulation engines.
- Security, permissions, and audit.
- API and action-layer integration.
- Product and engineering teams.
- Business process redesign and training.
- Change management and operational adoption.

The cost should be evaluated against a multi-billion-SEK value pool. The
programme should not be starved into a demo.

## CFO Questions to Answer in Discovery

1. What is the true annual markdown cost by category, market, channel, and age?
2. What is the stockout/lost-sales estimate by SKU/store/channel?
3. What share of transfers, replenishment, and allocation actions are manual?
4. How much is spent on expedites and logistics exceptions?
5. What percentage of inventory is aged, stranded, or unavailable to the best
   demand location?
6. What is the margin difference between initial allocation quality bands?
7. How many planning decisions are reworked due to data inconsistency?
8. What are the top 20 recurring cross-functional decisions that consume time?
9. Which decisions could be recommended by agents but still approved by humans?
10. Which low-risk actions could be automated first?

## Source Notes

Financial baseline uses H&M Group public reports. Scenario ranges are
management-case assumptions, not sourced forecasts.

Sources:

- H&M Group Annual and Sustainability Report 2025:
  https://hmgroup.com/investors/annual-and-sustainability-report/
- H&M Group Q1 2026 three-month report:
  https://hmgroup.com/wp-content/uploads/2026/03/H-M-Hennes-Mauritz-AB-Three-month-report-2026.pdf
- H&M Group full-year 2025 report:
  https://hmgroup.com/news/h-m-hennes-mauritz-ab-full-year-report-2025/
- McKinsey supply chain digital twins:
  https://www.mckinsey.com/capabilities/quantumblack/our-insights/digital-twins-the-key-to-unlocking-end-to-end-supply-chain-growth
- BCG supply chain digital twins:
  https://www.bcg.com/publications/2024/using-digital-twins-to-manage-complex-supply-chains
