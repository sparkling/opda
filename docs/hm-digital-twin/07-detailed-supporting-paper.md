# Detailed Supporting Paper: H&M Enterprise Digital Twin and Agentic Operating System

## 1. Thesis

H&M Group should create an enterprise digital twin as the foundation for an
AI-native operating model. The twin should be linked-data-based, live,
action-aware, and designed for agents from the start.

This is not a conventional data programme with an AI layer added at the end.
It is a new strategic capability: a shared world model of the business, used to
compress the time between market signal, decision, and execution.

The programme should focus on supply chain and logistics, inventory and stock
allocation, product lifecycle, and the full enterprise operating model. It
should serve stores, ecommerce, global supply chain, all markets, and all H&M
Group brands over time.

The central claim:

H&M can leapfrog data immaturity by building a linked-data digital twin that
forces business-critical data into an operational model and lets AI agents use
that model to simulate, recommend, and execute.

## 2. Strategic Context

H&M is operating in a market where fashion demand moves faster than traditional
planning cycles. Social signals, search, creators, weather, local events,
competitor moves, and macroeconomic shocks can change demand before long-cycle
planning has time to react.

At the same time, H&M has global scale:

- SEK 228.285 billion net sales in full-year 2025.
- SEK 18.395 billion operating profit in full-year 2025.
- 4,050 stores at 28 February 2026.
- Online just over 30 percent of sales in Q1 2026.
- Over 554 commercial product suppliers and over 969 tier 1 factories,
  according to H&M's public supply chain transparency page.
- 12 local production offices and around 1.1 million people employed by tier 1
  and tier 2 supplier factories H&M works with.

This scale creates a compounding coordination problem. A decision about one
product is not only a product decision. It touches:

- Store availability.
- Ecommerce promise.
- Supplier capacity.
- Logistics routes.
- Working capital.
- Markdown risk.
- Carbon and sustainability.
- Marketing.
- Returns.
- Product lifecycle.
- Customer trust.

The enterprise digital twin addresses this coordination problem by making
relationships first-class.

## 3. Why Linked Data

Retail operating problems are relationship problems.

Examples:

- Which SKUs share the same material, factory, supplier, and risk exposure?
- Which stores are likely to sell through this product before transfer lead time
  makes action useless?
- Which ecommerce orders could be fulfilled from store stock without hurting
  local availability?
- Which supplier can respond fastest without increasing quality or compliance
  risk?
- Which products should be extended, substituted, marked down, repaired, resold,
  or retired?
- Which shipment delays create the highest revenue risk because of the specific
  products, stores, markets, and campaigns affected?

These questions are awkward in siloed systems and brittle in flat reporting
models. They are natural in a linked-data enterprise model:

- Business entities represent real products, suppliers, factories, stores,
  channels, shipments, decisions, and actions.
- Relationships represent dependencies and operational consequences.
- Properties represent state, confidence, freshness, cost, and constraints.
- Events represent changes over time.
- Actions represent decisions that alter the state of the enterprise.

A linked-data model also supports AI agents better than a warehouse-only
approach. Agents need to understand how entities relate before they can
recommend action. Without that, they can summarise documents or query tables,
but they cannot reliably reason about operational consequences.

## 4. Digital Twin Definition for H&M

For H&M, a digital twin should be defined as:

A live, linked-data representation of H&M's product, demand, inventory,
supply, logistics, channel, store, lifecycle, constraint, and decision state,
connected to simulations, agents, and action systems.

This definition excludes three weaker interpretations:

1. A dashboard is not a twin. It may visualise part of the twin.
2. A data lake is not a twin. It may store data used by the twin.
3. A 3D scene is not an enterprise twin. It may represent a store or warehouse
   component of the twin.

The H&M twin should have four properties:

- Live: updated by events and source systems.
- Connected: relationship-based, not only tabular.
- Simulatable: able to model scenarios and trade-offs.
- Action-aware: linked to permissions, workflows, APIs, and outcomes.

## 5. Why Agents Matter

The twin is the world model. Agents are the operating layer.

An AI agent should be able to:

- Detect an event or receive a goal.
- Query the twin.
- Retrieve relevant context and history.
- Check policies and permissions.
- Run simulations or optimisation tools.
- Compare options.
- Explain assumptions and risks.
- Prepare a recommendation package.
- Route for approval or execute within policy.
- Monitor the outcome.
- Learn from overrides and results.

This is very different from a chatbot. The agent is not valuable because it can
write fluent text. It is valuable because it can coordinate across data,
models, tools, workflows, and actions.

For H&M, useful agents include:

- Trend agents.
- Product response agents.
- Allocation agents.
- Replenishment agents.
- Supplier agents.
- Logistics agents.
- Markdown agents.
- Lifecycle agents.
- Finance agents.
- Governance agents.

## 6. Public Evidence from H&M

H&M's public statements show the company already recognises the core levers.

In full-year 2025 reporting, H&M attributed progress to:

- Strengthening the product offering.
- Improving customer experience and brands.
- More efficient purchasing.
- Shorter decision paths.
- Better ability to capture trends.
- Supply chain improvements.
- Closer supplier cooperation.
- Better inventory efficiency.

In Q1 2026 reporting, H&M highlighted:

- Improved inventory efficiency.
- Good stock-in-trade situation.
- Shorter decision paths.
- Deeper supplier collaboration.
- Higher share of product purchases in season.
- Physical-store improvements in technology, layout, and presentation.
- New European warehouses coming into use during 2026 to improve growth
  capacity, availability, channel flexibility, and network structure.

These are exactly the operating levers an enterprise twin should support.

## 7. Public Evidence from the Market

### Inditex

Inditex shows the strategic value of integrated store, online, logistics, and
technology capabilities. Its 2025 annual report describes store technologies
such as Click & Collect silos, sorters, assisted self-checkouts, pick-up points,
and AI Try-On in 26 markets.

Lesson:

Speed and customer relevance come from operating-model integration, not isolated
technology projects.

### Walmart

Walmart publicly describes global supply chain transformation using real-time
AI, automation, reusable platforms, self-healing inventory, and agentic AI. It
also describes tools that convert store supply issues into insights and
recommended next steps.

Lesson:

Large retailers are moving AI into operational decision loops.

### Lowe's

Lowe's store digital twin combines spatial data, product location, and
historical order information to help associates and planners. It demonstrates
how retail twins can connect physical space, inventory, and operations.

Lesson:

Retail twins are practical when they support frontline and central operational
decisions.

### McKinsey and BCG

Consulting research consistently frames digital twins as tools for visibility,
simulation, decision speed, and optimisation. Reported benefits vary by context,
but include fulfilment cost reduction, distribution centre utilisation
improvement, forecast accuracy improvement, and delay reduction.

Lesson:

The value is in trade-off decisions under uncertainty.

## 8. Business Value Logic

H&M's 2025 sales base means small improvements create material value.

Revenue:

- Better availability and faster trend response can increase sales.
- A 1 percent uplift on 2025 sales is SEK 2.28 billion.
- At 53.4 percent gross margin, that is around SEK 1.22 billion gross profit.

Margin:

- Better allocation and markdown avoidance can improve gross margin.
- 50 bps of sales is around SEK 1.14 billion.

Working capital:

- Q1 2026 stock-in-trade was SEK 34.608 billion.
- A 10 percent improvement would release around SEK 3.46 billion cash.

Cost:

- Logistics, planning, exception handling, and manual analysis are likely large
  cost pools.
- Even modest efficiency improvements can matter if applied globally.

The full mature-scale value range should be tested internally, but an indicative
range of SEK 2-9 billion annual recurring profit contribution is credible as a
scenario, not a promise.

## 9. Priority Use Case: In-Season Allocation

The first use case should create P&L evidence quickly.

In-season allocation and stock rebalancing is a strong candidate because it
connects:

- Product.
- Demand.
- Store.
- Ecommerce.
- Inventory.
- Logistics.
- Margin.
- Markdown.
- Customer availability.

Example workflow:

1. Agent detects a sell-through spike in one market and slow movement in another.
2. Agent queries stock on hand, in transit, reservations, returns, and forecast.
3. Agent runs transfer, ecommerce-pooling, replenishment, and markdown-avoidance
   scenarios.
4. Finance agent estimates margin, revenue, and working-capital impact.
5. Logistics agent estimates feasibility and cost.
6. Governance agent checks rules and approval thresholds.
7. Recommendation package is routed to the responsible human.
8. Approved action is written back to the target systems.
9. Outcome is monitored and compared to simulation.

This is the minimum version of the target operating model.

## 10. Priority Use Case: Trend-to-Assortment

Trend response is strategically powerful but more complex.

Target capability:

- Detect signals from ecommerce search, product views, basket behaviour, store
  sell-through, returns, social, competitors, events, and weather.
- Map signals to product attributes, families, materials, and current styles.
- Estimate opportunity size and confidence.
- Check supplier capacity and lead time.
- Simulate responses such as colour expansion, reorder, substitute product,
  near-shore production, campaign activation, or transfer.

Agent roles:

- Trend agent creates the signal brief.
- Product agent maps the signal to H&M's assortment.
- Supplier agent checks feasibility.
- Finance agent estimates margin and cash effect.
- Governance agent checks risk and approvals.

This is the flagship strategic capability once the core semantic spine exists.

## 11. Product Lifecycle Twin

Fashion product lifecycle decisions are often fragmented:

- Concept.
- Design.
- Materials.
- Supplier selection.
- Production.
- Launch.
- Allocation.
- Sell-through.
- Return.
- Quality issue.
- Markdown.
- Resale.
- Repair.
- Recycle.
- Retirement.
- Learning into next season.

The product lifecycle twin connects these stages. It lets H&M ask:

- Which design attributes drove returns?
- Which suppliers created quality issues?
- Which products deserve extension?
- Which products should be retired early?
- Which materials increase carbon or compliance risk?
- Which products are best suited for resale?
- Which end-of-life route has the best commercial and sustainability outcome?

This twin creates long-term learning, not only immediate operational decisions.

## 12. Supplier and Factory Twin

H&M does not own most production. That makes supplier coordination central.

The supplier/factory twin should represent:

- Supplier identity.
- Factory identity.
- Tier and relationship.
- Product categories.
- Capacity.
- Lead times.
- Cost.
- Quality.
- Compliance.
- Sustainability.
- Material dependencies.
- Historical performance.
- Production office relationships.
- Risk exposure.

Agents can then answer:

- Which suppliers can support an in-season reorder fastest?
- What capacity exists for a trend response?
- Which orders are exposed to port disruption?
- Which factories have quality risk in a product family?
- Which supplier relationships are strategically important?

This is especially important where H&M relies on long lead-time production
markets and many third-party factories.

## 13. Logistics Twin

The logistics twin connects inventory to movement and promise.

Core entities:

- Warehouse.
- Distribution centre.
- Store.
- Ecommerce fulfilment node.
- Shipment.
- Container.
- Carrier.
- Route.
- Port.
- Customs event.
- Delivery promise.
- Delay.
- Cost.
- Carbon estimate.

Use cases:

- Reroute delayed shipments.
- Prioritise scarce stock.
- Balance ecommerce and store availability.
- Simulate warehouse capacity.
- Consolidate transfers.
- Reduce expedites.
- Manage new European warehouse activation and network design.

## 14. Governance by Design

The user context says H&M has immature data management, no governance, siloed
systems, and technical debt. The proposed approach should not deny that. It
should exploit it as the reason to build differently.

The linked-data model makes governance executable:

- Each entity type has an owner.
- Each relationship has a meaning.
- Each data source has lineage.
- Each field has freshness and confidence.
- Each decision has a policy.
- Each agent action has permissions.
- Each write-back has audit.

Instead of trying to govern every field across every system before creating
value, govern the data needed for high-value decisions first.

## 15. Technical Principles

1. Relationship-first, not table-first.
2. Event-aware, not batch-only.
3. Action-aware, not dashboard-only.
4. Simulation before execution.
5. Agents use tools; they do not replace optimisation engines.
6. Every material action has a policy and audit trail.
7. Human approval remains required for material decisions until trust and
   controls are proven.
8. Source systems are wrapped before they are replaced.
9. Data quality is measured at decision points.
10. The enterprise semantic model is treated as a product with versioning and
   ownership.

## 16. Target Architecture

The architecture should include:

- Source connectors.
- Streaming/event platform.
- Entity resolution.
- H&M-owned linked-data graph/twin substrate.
- Time-series and state store.
- Vector index for unstructured context.
- Simulation and optimisation services.
- Agent runtime.
- Policy and permission layer.
- API/action layer.
- Decision workspace.
- Observability and evaluation.
- Audit ledger.

The architecture should not require one monolithic vendor and should not be
presented as a generic graph database decision. H&M can combine internal
engineering, open-source linked-data patterns, and selected components while
retaining control of semantics, decision rights, and action governance.

## 17. Operating Model

The programme needs both platform and value squads.

Platform teams:

- Semantic twin platform.
- Data integration.
- Agent runtime.
- Simulation and optimisation.
- Security and governance.

Value squads:

- Inventory allocation.
- Trend response.
- Supplier and production.
- Logistics.
- Product lifecycle.

Each squad should include business, product, data, engineering, design,
architecture, and finance roles. The finance role is important because value
measurement must be built in from the start.

## 18. Roadmap

### Mobilise

Build one vertical slice and a scale case.

Deliverables:

- Linked-data model slice.
- Live data feeds.
- Agentic recommendation workflow.
- Decision and action ledger.
- Value baseline.
- Board investment case.

### Build Spine

Build core entities and relationships:

- Product.
- SKU.
- Store.
- Ecommerce.
- Inventory.
- Supplier.
- Factory.
- Purchase order.
- Shipment.
- Decision.
- Action.

### Scale

Expand across:

- In-season allocation.
- Replenishment.
- Trend response.
- Supplier risk.
- Logistics.
- Lifecycle.
- Markdown.

### Operate

Make the twin the default decision environment. Agents become embedded in
planning, product, supply, logistics, sales, and finance workflows.

## 19. Board Ask

Approve a strategic mobilisation phase for the H&M Enterprise Digital Twin and
Agentic Operating System.

The mobilisation phase should:

- Build a real vertical slice, not a demo.
- Prove the semantic model.
- Prove agentic recommendations.
- Prove action governance.
- Quantify first value.
- Define investment needed for enterprise scale.

Recommended first vertical slice:

In-season allocation and stock rebalancing.

Alternative:

Trend-to-assortment response in a high-velocity product category.

## 20. Research Method and Evidence Standard

This section turns the paper from an argument into a research dossier. It is
intended to preserve the evidence, reasoning, assumptions, and analytical
choices that sit underneath the executive briefing, strategy memo, business
case, architecture note, and board deck.

The research standard is:

- Public information only.
- No H&M internal data.
- Sponsor-provided H&M context treated as assumption, not as public fact.
- Public sources separated from inference.
- Implementation choices kept at strategic level.
- Palantir used as an operating-model comparator, not as a database vendor.
- Generic graph vendors excluded from the strategic evidence base.
- Linked data and H&M-owned semantics treated as the strategic approach.
- Agentic AI considered as an operating-model shift, not as chatbot
  productivity.

The core question is not "which tool should H&M buy?" The core question is:

Can H&M create a live, linked-data operating model of the enterprise that lets
humans and AI agents sense, simulate, decide, execute, and learn faster than the
current planning and execution model?

The answer developed in this dossier is "yes, but only if the programme is
framed as an enterprise operating model transformation." A technical platform
programme will be too narrow. A data governance programme will be too slow. A
set of isolated AI pilots will be too shallow. A supply-chain planning upgrade
will leave product, channel, lifecycle, and action governance disconnected.

The research is organised around five layers:

1. Public facts about H&M scale, operating priorities, and supply-chain shape.
2. Adjacent market examples where digital twins, agentic AI, real-time
   inventory, and semantic operating models are already visible.
3. Transferability analysis: what carries over to H&M, and what does not.
4. H&M-specific strategic design: why linked data, why agents, why action
   governance, why use-case-led transformation.
5. Business-case and roadmap logic: how the programme creates measurable value.

## 21. Public Facts and Sponsor Assumptions

### Public Facts Used

The public H&M facts used in this dossier include:

- H&M Group full-year 2025 net sales of SEK 228.285 billion.
- H&M Group full-year 2025 gross profit of SEK 121.821 billion.
- H&M Group full-year 2025 operating profit of SEK 18.395 billion.
- H&M Group full-year 2025 operating margin of 8.1 percent.
- H&M Group Q1 2026 net sales of SEK 49.607 billion.
- H&M Group Q1 2026 gross margin of 50.7 percent.
- H&M Group Q1 2026 stock-in-trade of SEK 34.608 billion.
- H&M Group Q1 2026 stock-in-trade down 16 percent year on year.
- H&M Group Q1 2026 stock-in-trade equal to 15.6 percent of rolling
  12-month sales.
- Online sales at just over 30 percent of sales in Q1 2026.
- 4,050 stores at 28 February 2026.
- Over 554 commercial product suppliers.
- Over 969 tier 1 factories.
- China and Bangladesh as the largest clothing production markets.
- Around 1.1 million people employed by tier 1 and tier 2 supplier factories
  H&M works with.
- 12 local production offices with over 1,300 colleagues working with suppliers.
- Public H&M commentary on shorter decision paths, better trend capture,
  supply-chain improvements, closer supplier cooperation, better inventory
  efficiency, in-season purchasing, and AI/data-driven decision-making.

These facts are enough to establish the strategic case for a live operating
model:

- H&M is large enough that small percentage changes are financially material.
- H&M is complex enough that isolated decision systems cannot see the whole
  trade-off.
- H&M's public strategy already points toward speed, responsiveness, supplier
  collaboration, inventory efficiency, and AI.
- H&M's supplier footprint makes coordination and optionality central.

### Sponsor Assumptions Used

The user supplied additional context:

- H&M has immature data management.
- Governance is weak or underdeveloped.
- Systems are siloed.
- Technical debt is heavy.
- Long lead times and planning horizons limit responsiveness.
- Chinese factory planning cycles are a particular constraint.
- Stock control is poor.
- Planning is siloed.
- Many third-party factories must be managed.
- H&M wants a transformative, provocative, AI-heavy programme.
- The intended implementation direction is linked data and a custom graph
  solution, not a vendor-led digital twin.

These points are treated as programme assumptions. They are not presented as
publicly proven facts. They matter because they change the design answer:

- The programme must not assume clean master data.
- It must not wait for a multi-year data-governance clean-up before value.
- It must use high-value decisions to force entity ownership and data quality.
- It must create visible value quickly enough to earn executive permission.
- It must build H&M-owned semantics rather than outsourcing operating meaning
  to an external platform.

### Implication

The public facts establish the opportunity. The sponsor assumptions define the
transformation challenge. Together they imply that the digital twin should be a
business transformation vehicle, not a technology platform replacement.

## 22. Evidence Register

The table below records the main claims used in the executive artefacts and the
evidence or reasoning behind each one.

| Claim | Evidence Basis | Analysis | Confidence |
|---|---|---|---|
| H&M has enough scale for small improvements to be material | FY2025 sales, gross profit, operating profit, Q1 2026 stock-in-trade | 50 bps of sales is over SEK 1bn; 1 percent sales uplift at gross margin is over SEK 1bn gross profit | High |
| H&M's supply chain is relationship-heavy | Supplier transparency page: 554+ suppliers, 969+ tier 1 factories, largest production markets, production offices | Products, factories, suppliers, materials, orders, markets, channels, and compliance are connected; flat reports hide dependencies | High |
| H&M's public strategy already points toward the twin | Full-year and Q1 references to shorter decision paths, trend capture, inventory efficiency, supplier cooperation, AI/data-driven decisions | The twin operationalises stated priorities rather than introducing an unrelated technology agenda | High |
| Retail AI is moving into operations | Walmart agentic AI and supply chain AI publications | Agentic AI is no longer only customer service or content; it is entering inventory, logistics, and operational workflows | Medium-high |
| Digital twins are valuable when tied to decisions | McKinsey, BCG, Maersk, Lowe's examples | Visibility alone is insufficient; value comes from scenario comparison, optimisation, and action | High |
| Fashion lacks a mature public enterprise-twin reference model | Public retail examples are mostly store twins, supply-chain twins, planning platforms, or AI assistants | H&M can define a category rather than copy a mature pattern | Medium |
| Linked data is the right strategic model | H&M problem is relationships, provenance, identity, constraints, and actions | Linked data lets H&M model meaning across systems without forcing early system replacement | High |
| Agents need a governed world model | Palantir Ontology comparator, Walmart agentic direction, general agent reliability requirements | Without a semantic model and policy/action layer, agents become brittle RAG or UI automation | High |
| First value slice should be in-season allocation | Strong P&L link, measurable outcomes, manageable entity scope | Connects product, stock, store, ecommerce, logistics, margin, and approval in one visible workflow | High |
| Trend-to-assortment is the strategic flagship | Fashion advantage depends on sensing demand and responding faster | More complex than allocation but more transformative once core semantic spine exists | Medium-high |
| Governance should be built through use cases | Sponsor assumption: immature data management and weak governance | High-value workflows create practical ownership, lineage, confidence, and policy requirements | High |

## 23. Source-by-Source Research Notes

### H&M Annual and Sustainability Report 2025

What it contributes:

- Financial baseline.
- Business performance context.
- Sustainability and supply-chain context.
- Risk and governance context.
- Public language around AI, digitalisation, customer data, privacy, and
  operational priorities.

Research interpretation:

The annual report supplies the scale argument. H&M is not a small test case:
it is a global enterprise where small changes in availability, markdown,
inventory, cost, or speed can create large financial impact. This justifies
board-level attention.

The report also reinforces the need for a governed approach. Customer data,
privacy, product safety, supply-chain responsibility, cyber risk, and
information security all matter. An agentic digital twin cannot be framed as
"move fast and automate everything." It must be designed with permissions,
audit, approval, and policy from the beginning.

### H&M Q1 2026 Three-Month Report

What it contributes:

- Most recent quarter available in this research pack.
- Stock-in-trade at SEK 34.608 billion.
- Stock-in-trade as 15.6 percent of rolling 12-month sales.
- Online at just over 30 percent of sales.
- Store base of 4,050 stores.
- Management commentary on inventory efficiency, in-season purchasing, shorter
  decision paths, deeper supplier collaboration, and warehouses.

Research interpretation:

The Q1 report is the strongest public support for the first use case. Inventory
and channel availability are live management topics. H&M's scale makes stock
allocation, replenishment, transfers, ecommerce pooling, and markdown avoidance
board-relevant. The report also supports the argument that store and ecommerce
must be treated as one operating system.

### H&M Supply Chain Transparency

What it contributes:

- Supplier and factory counts.
- Tier 1 factory context.
- China and Bangladesh as largest clothing production markets.
- Production office network.
- Workforce scale in supplier factories.

Research interpretation:

This source is essential for the linked-data argument. H&M's problem is not
just "more data." It is many relationships across commercial, operational,
ethical, geographic, and temporal dimensions. The twin must connect products,
materials, suppliers, factories, purchase orders, logistics movements, quality,
compliance, sustainability, and demand.

### H&M Responsible Purchasing Practices

What it contributes:

- Supplier relationship management.
- Production plans provided in advance for high-performing suppliers.
- Supplier development and assessment processes.
- Recognition that purchasing practices affect supplier operations.

Research interpretation:

This is important because responsiveness cannot be achieved only by pushing
factories harder. A twin should support better forward visibility, fairer
trade-offs, capacity planning, and supplier collaboration. It should help H&M
make better decisions with suppliers, not simply optimise stock after the fact.

### H&M AI Creative Exploration

What it contributes:

- H&M is publicly exploring generative AI in creative contexts.
- H&M frames AI as a way to amplify and elevate creative processes.

Research interpretation:

This source is not evidence that H&M has an operational AI twin. It does show
that H&M is willing to explore AI in visible brand and creative contexts. The
strategic programme should extend AI from content and creativity into
operational decision-making, with stronger governance because operational
actions affect margin, suppliers, stores, customers, and risk.

### Inditex Annual Report 2025

What it contributes:

- Strong fashion comparator.
- Public evidence of store and online integration.
- Store technology ecosystem.
- AI Try-On in multiple markets.
- Global scale with thousands of stores.

Research interpretation:

The transfer to H&M is not a recommendation to copy Inditex systems. The
lesson is that technology must be embedded in the operating model. Fashion
speed is organisational, not only technical. Store, ecommerce, logistics,
product, data, and customer experience must reinforce each other.

### Walmart Agentic AI and Supply Chain AI

What it contributes:

- Public signal that large retailers are moving AI into core operations.
- Purpose-built agentic AI tools for retail-specific tasks.
- Self-healing inventory and real-time signals to action.
- AI-enabled supply-chain orchestration.

Research interpretation:

Walmart is not a fashion comparator, but it is the clearest public signal that
retail AI is moving beyond dashboards and copilots. The transferable pattern is
real-time operational intelligence linked to action. For H&M, the equivalent
would be agents for allocation, replenishment, supplier feasibility, logistics,
markdown, product response, and governance.

### Lowe's Store Digital Twin

What it contributes:

- Public retail digital twin example.
- Combines spatial data, product location, and order history.
- Supports store operations and planning.

Research interpretation:

Lowe's is useful because it shows a twin has to be operationally grounded. But
H&M should not over-index on 3D stores. The strategic lesson is that a twin is
valuable when it connects the physical and digital reality of operations. For
H&M, the larger prize is not a 3D store twin. It is an enterprise state twin
across product, demand, stock, supply, logistics, stores, ecommerce, lifecycle,
and decisions.

### McKinsey Digital Twin Research

What it contributes:

- Definition of digital twins as virtual replicas linked to real data.
- Digital twins used for simulation and decision-making.
- Supply-chain examples involving real-time visibility, predictive and
  prescriptive analytics, dynamic policy changes, distribution-centre
  utilisation, fulfilment cost, and safety-stock decisions.

Research interpretation:

McKinsey supports the claim that the value of twins is not visualisation. It is
decision quality under uncertainty. The strongest transfer to H&M is dynamic
inventory policy, fulfilment cost/service trade-offs, customer promise, and
operational resilience.

### BCG Value Chain Digital Twin

What it contributes:

- Digital twins combine internal and external signals.
- Benefits cited for early adopters include forecast accuracy improvement,
  broader planning coverage, and delay/downtime reduction.
- Technology-agnostic architecture and value-centric deployment.

Research interpretation:

BCG reinforces two points. First, the twin should connect H&M internal data with
external signals such as ports, shipping, macro shocks, weather, events, social
signals, and market demand. Second, architecture should be value-led and
technology-agnostic. This supports H&M's desire not to make the programme a
generic graph vendor selection exercise.

### Maersk Digital Twin and Supply Chain Research

What it contributes:

- Logistics and supply-chain digital twin patterns.
- Simulation of near-term operational states.
- Recognition that many digital twins can become siloed.
- Supply-chain applications including inventory, warehousing, product
  lifecycle, new product introduction, reverse logistics, routing, and
  proactive issue detection.

Research interpretation:

Maersk is relevant because H&M's product lifecycle and logistics are deeply
interdependent. Launch timing, inbound delays, warehouse capacity, ecommerce
availability, returns, and end-of-life all affect margin and customer promise.
Maersk also warns against siloed twins. H&M should avoid separate product,
store, logistics, and supplier twins that do not interoperate.

### Palantir Ontology

What it contributes:

- Publicly described pattern where an ontology contains semantic elements
  such as objects, properties, and links.
- Kinetic elements such as actions, functions, and dynamic security.
- Humans and AI agents collaborate across operational workflows.
- Actions, logic, permissions, write-back, feedback, and learning loops are
  part of the operating model.

Research interpretation:

Palantir is not used here as a database vendor or preferred implementation. It
is a comparator for the operating-model pattern H&M needs: a semantic business
model connected to logic, actions, permissions, workflows, and agents.

The lesson for H&M is not "buy Palantir." The lesson is that agentic AI needs
more than data access. It needs a governed model of what the enterprise is, how
things relate, which actions are allowed, how write-back works, and how outcomes
are learned.

## 24. What The Digital Twin Must Be For H&M

The term "digital twin" is overloaded. For H&M, the twin should not mean:

- A 3D visualisation.
- A supply-chain control tower.
- A data lake.
- A dashboard.
- A planning application.
- A static knowledge graph.
- A chatbot interface.
- A master data programme with better branding.

The H&M enterprise digital twin should mean:

A live, governed, linked-data operating model of products, stock, demand,
suppliers, factories, logistics, stores, ecommerce, lifecycle, risks,
constraints, decisions, actions, and outcomes.

This definition matters because it creates clear design tests:

- If it is not live, it is a model, not an operating twin.
- If it has no relationships, it is a data mart, not an enterprise twin.
- If it cannot simulate, it cannot support scenario planning.
- If it cannot recommend, it remains analytical.
- If it cannot write back through governed actions, it does not change
  operations.
- If it has no decision ledger, it cannot learn or be audited.
- If it is not understood by humans, it cannot become the operating model.

The enterprise twin must become the place where H&M can ask:

- What is happening?
- Why is it happening?
- What will happen next?
- What are the available actions?
- What are the trade-offs?
- What is the risk?
- Who is allowed to decide?
- What did we do?
- What happened after we acted?
- What should we learn?

## 25. Why Linked Data, Not Just Data Integration

The H&M problem is not only fragmented data. It is fragmented meaning.

A conventional integration programme can move data from systems into a lake,
warehouse, or reporting layer. That is necessary, but insufficient. It does not
automatically answer:

- Are these two supplier records the same real-world supplier?
- Which factory actually made this SKU?
- Which product attributes matter for this demand signal?
- Which product lifecycle state is authoritative?
- Which stock quantity is available for ecommerce without harming store
  availability?
- Which purchase order is affected by a delay?
- Which decision changed the outcome?
- Which policy permitted an action?

Linked data is strategic because it explicitly models:

- Identity.
- Relationships.
- Meaning.
- Context.
- Provenance.
- Constraints.
- Change over time.
- Actions and outcomes.

For H&M, linked data creates an enterprise semantic layer that can sit above
siloed systems while the systems are gradually modernised. This is essential
because the sponsor context says H&M has immature data management, weak
governance, siloed systems, and technical debt.

The programme should therefore use linked data to do three things at once:

1. Create the world model for AI agents.
2. Create executable governance around high-value decisions.
3. Create a bridge from current systems to future operating model.

## 26. Why Agents Need The Twin

Agents without a twin can still be useful. They can summarise documents, answer
questions, generate SQL, monitor inboxes, and operate user interfaces. But they
are not reliable enough for enterprise operational decisions because they lack a
grounded model of the business.

An allocation agent must know:

- What a SKU is.
- Which style, option, colour, and size it belongs to.
- Where stock exists.
- Whether stock is available, reserved, blocked, in transit, returned, or
  committed.
- What demand signals exist by market, store, and channel.
- Which transfers are feasible.
- What transfer cost and lead time apply.
- What markdown risk exists.
- Which action policy applies.
- Who must approve.
- Which system must receive the write-back.

A trend response agent must know:

- Which signals are meaningful.
- Which product attributes match the signal.
- Which current products can satisfy demand.
- Which suppliers can respond.
- Which factories have capacity.
- Which materials are available.
- Which markets have demand.
- What the margin, cash, and risk implications are.

A supplier agent must know:

- Which supplier relationships exist.
- Which factories belong to which suppliers.
- Which factories produce which categories.
- Which lead times are realistic.
- Which quality and compliance history applies.
- Which production offices own the relationship.

This is why the twin is the world model and agents are the operating layer. The
agent should not invent the model in the prompt. It should operate against the
enterprise model, retrieve evidence, call tools, and produce a decision package.

## 27. Agentic Operating Model

The agentic operating model has six stages:

1. Sense.
2. Contextualise.
3. Simulate.
4. Recommend.
5. Execute through governed action.
6. Learn.

### Sense

Signals include:

- POS sales.
- Ecommerce search.
- Product views.
- Basket behaviour.
- Returns.
- Store inventory.
- Warehouse inventory.
- In-transit inventory.
- Supplier updates.
- Quality events.
- Social and cultural signals.
- Weather.
- Local events.
- Competitor behaviour.
- Logistics disruption.
- Port disruption.
- Currency and tariff shifts.

The twin turns signals into events connected to entities.

### Contextualise

An event is not useful by itself. A sell-through spike needs context:

- Product hierarchy.
- Available stock.
- In-transit stock.
- Supplier feasibility.
- Margin.
- Transfer cost.
- Demand forecast.
- Market priorities.
- Campaign timing.
- Lifecycle state.
- Approval policy.

The linked-data model supplies this context.

### Simulate

Simulation should compare practical options:

- Transfer stock.
- Hold stock.
- Replenish.
- Place in-season order.
- Substitute product.
- Reallocate ecommerce pool.
- Local promotion.
- Delay markdown.
- Accelerate markdown.
- Reroute shipment.
- Expedite selectively.

Simulation should estimate:

- Revenue.
- Gross margin.
- Stockout risk.
- Markdown risk.
- Customer promise.
- Logistics cost.
- Working capital.
- Carbon impact.
- Supplier impact.
- Confidence.

### Recommend

The recommendation should not be a vague answer. It should be a structured
decision package:

- Trigger.
- Evidence.
- Options considered.
- Recommended option.
- P&L effect.
- Cash effect.
- Operational effect.
- Risk.
- Confidence.
- Assumptions.
- Required approval.
- Required action.
- Target system.
- Monitoring plan.

### Execute

Execution should be policy-bound. Some actions remain human-approved. Some
low-risk actions may become automated over time.

Examples:

- Create transfer task.
- Change ecommerce allocation rule.
- Reserve stock for market.
- Release stock to store.
- Raise supplier capacity query.
- Trigger replenishment recommendation.
- Create markdown review task.
- Reroute shipment for approval.

### Learn

Every action should be compared with expected outcome:

- Did sales lift?
- Did markdown reduce?
- Did stockout avoid?
- Did transfer arrive in time?
- Did margin improve?
- Was the recommendation accepted?
- Was it overridden?
- Why?
- What should change in the model or policy?

This is how the twin becomes a learning system rather than a one-time model.

## 28. H&M Operating Domains The Twin Must Cover

### Product and Assortment

Entities:

- Brand.
- Collection.
- Product family.
- Style.
- Option.
- SKU.
- Size.
- Colour.
- Fit.
- Material.
- Bill of materials.
- Supplier.
- Factory.
- Lifecycle state.
- Sustainability attributes.
- Compliance attributes.
- Product image and copy.

Key questions:

- Which products are similar enough to substitute?
- Which attributes are driving demand?
- Which attributes are driving returns?
- Which styles should be extended?
- Which products should be retired?
- Which products should be localised by market?

### Demand

Entities:

- Market.
- Region.
- Store.
- Ecommerce locale.
- Customer segment.
- Search term.
- Product view.
- Basket.
- Conversion.
- Sell-through.
- Return.
- Campaign.
- Weather event.
- Local event.
- Social signal.

Key questions:

- Which signals are real demand rather than noise?
- Which markets are leading indicators?
- Which demand signals map to existing products?
- Which signals need product response?
- Which signals need allocation response?

### Inventory

Entities:

- Stock on hand.
- Available to promise.
- Reserved stock.
- Blocked stock.
- In-transit stock.
- Returned stock.
- Aged stock.
- Ecommerce pool.
- Store stock.
- Warehouse stock.
- Markdown candidate.

Key questions:

- Where is stock truly available?
- Which stock should be moved?
- Which stock should be protected?
- Which stock should be exposed to ecommerce?
- Which stock should be marked down?
- Which stock is misallocated relative to demand?

### Supply and Production

Entities:

- Supplier.
- Factory.
- Production office.
- Production line.
- Capacity.
- Lead time.
- Purchase order.
- Material availability.
- Quality event.
- Compliance event.
- Audit.
- Cost.

Key questions:

- Which suppliers can respond fastest?
- Which capacity is real versus planned?
- Which orders are at risk?
- Which factories create quality risk?
- Which supplier relationship is strategically critical?
- Which response is commercially attractive but ethically or operationally
  risky?

### Logistics and Channel Promise

Entities:

- Warehouse.
- Distribution centre.
- Fulfilment node.
- Store.
- Carrier.
- Route.
- Shipment.
- Container.
- Port.
- Customs event.
- Delivery promise.
- Delay.
- Transfer.
- Cost.
- Carbon estimate.

Key questions:

- Which delays matter most commercially?
- Which reroutes are worth the cost?
- Which warehouse constraints affect availability?
- Which ecommerce promises are at risk?
- Which transfer is too slow to matter?
- Which network changes improve speed and flexibility?

### Decision and Action

Entities:

- Trigger.
- Scenario.
- Recommendation.
- Decision.
- Approval.
- Override.
- Action.
- Write-back.
- Outcome.
- Policy.
- Constraint.
- Confidence.
- Evidence.

Key questions:

- Why was this recommendation made?
- Who approved it?
- Which data was used?
- What assumptions were made?
- What action happened?
- Which system was changed?
- What was the outcome?
- What did we learn?

## 29. Detailed Use-Case Backlog

The programme should not start with every use case. But it should maintain a
clear backlog so the architecture is shaped by future value, not only the first
prototype.

### Use Case 1: In-Season Allocation and Rebalancing

Problem:

Stock is in the wrong place relative to demand. Current systems and planning
cycles are too slow to detect and act on imbalance across stores, ecommerce,
warehouses, and markets.

Twin capability:

- Product/SKU/store/channel entity model.
- Sales, stock, returns, forecast, and in-transit state.
- Transfer feasibility and cost.
- Markdown risk.
- Decision and action ledger.

Agent capability:

- Detect imbalance.
- Explain why it matters.
- Simulate move, hold, ecommerce pool, reorder, or markdown options.
- Produce P&L and cash impact.
- Route for approval.
- Monitor outcome.

Value:

- Sales capture.
- Markdown avoidance.
- Stockout reduction.
- Inventory productivity.
- Customer promise.

### Use Case 2: Trend-to-Assortment Response

Problem:

H&M struggles to respond rapidly to trends because planning horizons and supply
constraints are long.

Twin capability:

- Demand signals mapped to product attributes.
- Current assortment and product lifecycle states.
- Supplier capacity and lead time.
- Material availability.
- Market and channel demand.

Agent capability:

- Detect trend signal.
- Match signal to product attributes.
- Identify response options.
- Check supplier feasibility.
- Estimate revenue and margin.
- Draft decision package for merchandising, buying, and supply teams.

Value:

- Faster trend capture.
- Better product relevance.
- Reduced missed demand.
- More precise in-season buying.

### Use Case 3: Supplier Capacity and Risk Response

Problem:

Supplier and factory data is complex, distributed, and often used reactively.
H&M needs faster optionality without harming supplier relationships or
compliance.

Twin capability:

- Supplier/factory/product/category relationships.
- Lead time, capacity, quality, compliance, and sustainability attributes.
- Production office ownership.
- Material dependencies.

Agent capability:

- Identify feasible suppliers for a response.
- Compare capacity, lead time, cost, risk, and relationship impact.
- Flag compliance or quality constraints.
- Recommend supplier engagement options.

Value:

- Production responsiveness.
- Supplier optionality.
- Reduced disruption.
- Better risk governance.

### Use Case 4: Logistics Delay Impact and Rerouting

Problem:

Not all delays are equal. Some shipments are commercially critical because of
the products, markets, campaigns, or stock positions affected.

Twin capability:

- Shipment, product, purchase order, route, store, ecommerce, campaign, and
  inventory relationships.
- Delay and cost events.
- Customer promise and availability.

Agent capability:

- Detect delay.
- Estimate commercial impact.
- Compare reroute, expedite, wait, transfer, or reallocation options.
- Produce recommended action.

Value:

- Availability protection.
- Reduced expedite waste.
- Better customer promise.
- More resilient logistics.

### Use Case 5: Markdown Prevention

Problem:

Markdown often reflects earlier failures in allocation, demand sensing,
assortment, and timing.

Twin capability:

- Aged stock.
- Sell-through.
- Demand signals.
- Transfer feasibility.
- Channel availability.
- Margin and pricing.

Agent capability:

- Identify markdown risk early.
- Simulate transfer or ecommerce exposure before markdown.
- Recommend targeted promotion versus blanket markdown.
- Monitor result.

Value:

- Gross margin improvement.
- Reduced waste.
- Better stock productivity.

### Use Case 6: Returns and Product Learning

Problem:

Returns contain product, fit, quality, customer expectation, and market-signal
information, but the learning often does not flow back into design, buying, and
supplier decisions quickly enough.

Twin capability:

- Return reason linked to SKU, style, size, material, supplier, market, and
  customer context.
- Quality events.
- Product content and imagery.

Agent capability:

- Identify return patterns.
- Link patterns to product attributes and suppliers.
- Recommend content change, sizing guidance, product change, supplier action,
  or lifecycle decision.

Value:

- Reduced returns.
- Better product quality.
- Better customer trust.
- Faster learning into next season.

### Use Case 7: Product Lifecycle and Circularity

Problem:

End-of-life choices are commercial, operational, and sustainability decisions,
but they are often disconnected from product lifecycle data.

Twin capability:

- Lifecycle state.
- Resale suitability.
- Repair suitability.
- Recycle route.
- Margin, cost, carbon, and compliance.

Agent capability:

- Recommend end-of-life route.
- Compare commercial and sustainability impact.
- Capture learning for design and buying.

Value:

- Better lifecycle margin.
- Reduced waste.
- Stronger sustainability execution.

## 30. Business Case Mechanics

The board case should avoid false precision. With public information only, the
business case should be expressed as value pools and scenarios.

### Revenue Capture

Baseline:

- FY2025 net sales: SEK 228.285 billion.

Scenario:

- 1 percent sales uplift = SEK 2.283 billion revenue.
- At 53.4 percent gross margin, gross profit effect is approximately
  SEK 1.219 billion.

Mechanisms:

- Better availability.
- Faster trend response.
- Reduced stockouts.
- Better channel exposure.
- Improved local assortment.

Evidence needed in discovery:

- Lost sales estimates.
- Stockout rate by product/channel/market.
- Demand fulfilment gap.
- Search with no stock.
- Store availability and conversion.
- Ecommerce availability and conversion.

### Gross Margin and Markdown Avoidance

Baseline:

- FY2025 net sales: SEK 228.285 billion.

Scenario:

- 50 basis points of sales = approximately SEK 1.141 billion.

Mechanisms:

- Earlier imbalance detection.
- Better allocation.
- Transfer before markdown.
- Targeted markdown rather than broad markdown.
- More precise in-season replenishment.

Evidence needed in discovery:

- Markdown rate by category/market.
- Markdown timing.
- Stock imbalance before markdown.
- Transfer cost and lead time.
- Sell-through curves.
- Margin by product lifecycle stage.

### Working Capital

Baseline:

- Q1 2026 stock-in-trade: SEK 34.608 billion.

Scenario:

- 5 percent release = SEK 1.730 billion.
- 10 percent release = SEK 3.461 billion.

Mechanisms:

- Better allocation.
- Better production timing.
- Better stock positioning.
- Reduced overproduction.
- Faster returns processing.
- Better lifecycle decisions.

Evidence needed in discovery:

- Inventory by lifecycle state.
- Aged inventory.
- Stock cover by market/channel.
- Excess and obsolete stock.
- Transferable stock.
- Supplier order flexibility.

### Operating Cost and Productivity

Potential cost pools:

- Planning effort.
- Manual reporting and reconciliation.
- Expediting.
- Transfers.
- Warehouse handling.
- Exception management.
- Supplier coordination.
- Logistics planning.
- Customer service contacts caused by availability issues.

Mechanisms:

- Reduced manual analysis.
- Faster exception resolution.
- Better routing and consolidation.
- Fewer emergency actions.
- Agent-assisted data mapping and lineage.
- Agent-generated scenarios and decision packages.

Evidence needed in discovery:

- Manual planning hours.
- Exception volumes.
- Expedite costs.
- Transfer costs.
- Warehouse handling costs.
- Cost per decision cycle.

### Resilience and Option Value

This value pool is harder to quantify but strategically important.

Mechanisms:

- Faster response to supplier disruption.
- Faster response to port disruption.
- More supplier optionality.
- Better stock visibility.
- Better scenario planning.
- Better decision traceability.

Evidence needed in discovery:

- Historical disruption events.
- Cost of delayed response.
- Supplier concentration risk.
- Factory/category dependency.
- Port and route exposure.
- Recovery time by disruption type.

## 31. Transformation Logic

H&M should not run this transformation in the traditional sequence:

1. Fix all data.
2. Build common platform.
3. Add use cases.
4. Add AI.
5. Change operating model.

That sequence will take too long and will probably fail to hold executive
attention. It also underestimates the effect of AI and linked data on delivery.

The recommended sequence is parallel compression:

1. Select a high-value decision flow.
2. Build the minimum linked-data slice required for that decision.
3. Wrap source systems rather than replace them.
4. Use agents to accelerate data mapping, entity matching, testing, scenario
   drafting, lineage documentation, and workflow design.
5. Build the decision and action ledger from the first slice.
6. Use the first slice to define enterprise semantic patterns.
7. Scale by adding adjacent entities and decisions.

This approach treats the first use case as the first piece of the future
operating model, not as a throwaway demo.

## 32. Governance and Control Model

Agentic AI changes the governance problem. It is not enough to govern data.
H&M must govern:

- Entities.
- Relationships.
- Models.
- Prompts.
- Tools.
- Actions.
- Permissions.
- Approvals.
- Write-backs.
- Outcomes.
- Learning loops.

The control model should include:

- Entity ownership.
- Relationship ownership.
- Data-source lineage.
- Freshness thresholds.
- Confidence scoring.
- Decision policies.
- Agent tool permissions.
- Human approval thresholds.
- Write-back policies.
- Immutable action ledger.
- Outcome monitoring.
- Override capture.
- Incident review.

The principle is:

Every material recommendation should be explainable, and every material action
should be traceable.

## 33. Human Role and Operating Change

The programme should not imply that agents replace H&M decision-makers.

Agents should:

- Detect more signals.
- Assemble evidence faster.
- Simulate more options.
- Prepare decision packages.
- Execute low-risk tasks within policy.
- Monitor outcomes.
- Capture learning.

Humans should:

- Set strategy.
- Define taste and brand judgment.
- Own trade-offs.
- Approve material decisions.
- Manage supplier relationships.
- Set guardrails.
- Resolve exceptions.
- Challenge recommendations.
- Own accountability.

The operating model should make H&M leaders faster, not less accountable.

## 34. Data Products and Semantic Products

The programme should define semantic products, not only data products.

A semantic product includes:

- Entity definitions.
- Relationship definitions.
- Source mappings.
- Ownership.
- Lineage.
- Freshness.
- Confidence.
- Allowed actions.
- Policies.
- APIs.
- Example decisions.
- Test cases.

Examples:

- Product/SKU semantic product.
- Store/channel semantic product.
- Supplier/factory semantic product.
- Inventory state semantic product.
- Shipment semantic product.
- Decision/action semantic product.

This is how H&M can make governance executable. A steward does not merely own a
spreadsheet definition. They own the meaning and safe use of an operational
entity in the twin.

## 35. Architecture Implications Without Vendor Prescription

The architecture should be described as capabilities:

- Source integration.
- Event capture.
- Entity resolution.
- Linked-data model.
- Operational state.
- Scenario state.
- Time-series history.
- Unstructured evidence retrieval.
- Simulation tools.
- Optimisation tools.
- Agent runtime.
- Policy engine.
- Action APIs.
- Decision workspace.
- Observability.
- Audit ledger.

The architecture should avoid:

- Selecting generic graph vendors in the strategy deck.
- Treating a warehouse or lake as the twin.
- Treating a dashboard as the twin.
- Treating an LLM as the twin.
- Treating 3D visualisation as the enterprise twin.
- Locking H&M semantics into a vendor operating model.

The implementation can use open-source linked-data patterns and H&M's own
custom graph capability. The board does not need the technical detail yet. The
board needs to understand why H&M must own the semantic and action model.

## 36. Risks, Objections, and Responses

### Objection: H&M data is too immature.

Response:

That is exactly why the programme should not start as a reporting platform. A
decision-led linked-data slice can create practical governance around the data
that matters most. Waiting for perfect enterprise data would delay value.

### Objection: This is too ambitious.

Response:

It is ambitious at enterprise scale, but the first step is a bounded vertical
slice. The ambition is in the direction of travel, not in building the entire
twin at once.

### Objection: Agents are risky.

Response:

Agents are risky if they act without policy, evidence, approval, and audit. The
programme design makes the twin, policy layer, and action ledger non-negotiable.
Human approval remains required for material decisions until trust is proven.

### Objection: Existing planning systems already do this.

Response:

Planning systems cover parts of the decision space. The proposed twin connects
product, stock, demand, supplier, logistics, channel, lifecycle, decision, and
action across systems. It should integrate with planning tools rather than
replace all of them immediately.

### Objection: This sounds like another data platform.

Response:

The twin is not a passive platform. It is an operating model: live state,
relationships, scenarios, recommendations, action governance, and outcomes.

### Objection: The business case is speculative.

Response:

The public business case is scenario-based by necessity. The mobilisation phase
should replace assumptions with internal baselines for stockout, markdown,
transfer, expedite, inventory, manual effort, and decision latency.

## 37. Discovery Questions

### Financial Baseline

- What is markdown cost by category, market, channel, and lifecycle stage?
- What is estimated lost sales from stockouts?
- What is inventory by lifecycle state?
- What is excess stock by product family and market?
- What is the cost of transfers and expedites?
- What manual planning effort exists by process?

### Operating Baseline

- How long does an in-season allocation decision take today?
- How many systems are involved?
- Where are decisions recorded?
- How often are recommendations overridden?
- Which teams own final decisions?
- Where does ecommerce availability conflict with store availability?

### Data Baseline

- Which product identifier is most trusted?
- Which supplier/factory identifier is most trusted?
- Which inventory state is authoritative?
- How fresh is store inventory?
- How fresh is ecommerce inventory?
- How reliable is in-transit stock?
- How are returns linked to SKU, reason, and supplier?

### Agent Readiness

- Which workflows can safely start as recommendation-only?
- Which actions could later be automated under policy?
- What approval thresholds are needed?
- What evidence must every recommendation include?
- What logs are required for audit?

### Supplier and Production

- Which suppliers can respond to in-season demand?
- Which lead times are fixed versus negotiable?
- Which production constraints are material-specific?
- Where does H&M have supplier optionality?
- Where does H&M have concentration risk?

## 38. Proposed Mobilisation Scope

The mobilisation phase should last approximately 12 weeks, but the exact timing
should be validated with internal systems access.

### Mobilisation Objective

Prove that H&M can build a production-grade vertical slice of the enterprise
twin that improves a real decision flow.

### Recommended Scope

In-season allocation and stock rebalancing.

### Minimum Scope

- One product family or category.
- Limited set of markets.
- Store plus ecommerce availability.
- Stock on hand and in transit.
- Sales and sell-through.
- Transfer feasibility.
- Markdown risk proxy.
- Decision/action ledger.
- Recommendation workflow.

### Required Outputs

- Linked-data model slice.
- Source mapping and lineage.
- Data quality report at decision points.
- Agentic recommendation package.
- Simulation or scenario comparison.
- Approval workflow.
- Action ledger.
- Value baseline.
- Scale architecture.
- Board readout.

### Success Measures

- Decision latency reduced.
- Recommendation quality accepted by business users.
- Data gaps made explicit.
- At least one measurable value lever quantified.
- Action governance proven.
- Architecture reusable for next use case.

## 39. Research Conclusions

The evidence supports a strong strategic conclusion:

H&M should build an enterprise digital twin as a linked-data operating model,
not as a dashboard, vendor implementation, or isolated AI pilot.

The core reasons are:

- H&M's scale makes small improvements material.
- Fashion demand requires faster sensing and response.
- H&M's supply chain is relationship-heavy.
- Public H&M strategy already points to shorter decision paths, trend capture,
  supplier collaboration, inventory efficiency, and AI.
- Adjacent market evidence shows digital twins and agentic AI moving toward
  operational decision-making.
- Agents need a governed world model, not just data access.
- Linked data lets H&M own semantics while working across current systems.
- The first value slice can be narrow enough to execute and broad enough to
  prove the operating model.

The strongest first move remains:

Build a production-grade vertical slice for in-season allocation and stock
rebalancing, while designing the semantic spine for trend response, supplier
responsiveness, logistics, lifecycle, and markdown.

The board-level message should be:

This is a speed, margin, cash, and resilience programme. It uses linked data and
agents to turn fragmented enterprise data into governed operational decisions.

## 40. Source List

- H&M Group Annual and Sustainability Report 2025:
  https://hmgroup.com/investors/annual-and-sustainability-report/
- H&M Group Q1 2026 three-month report:
  https://hmgroup.com/wp-content/uploads/2026/03/H-M-Hennes-Mauritz-AB-Three-month-report-2026.pdf
- H&M Group supply chain transparency:
  https://hmgroup.com/sustainability/leading-the-change/transparency/supply-chain/
- H&M Group supplier list:
  https://hmgroup.com/sustainability/leading-the-change/supplier-list.html
- H&M Group responsible purchasing practices:
  https://hmgroup.com/sustainability/leading-the-change/transparency/responsible-purchasing-practices/
- H&M Group working conditions:
  https://hmgroup.com/sustainability/fair-and-equal/working-conditions/
- H&M Group annual report press release:
  https://hmgroup.com/news/h-m-hennes-mauritz-ab-publishes-its-annual-and-sustainability-report-2025/
- H&M Group full-year 2025 report:
  https://hmgroup.com/news/h-m-hennes-mauritz-ab-full-year-report-2025/
- H&M Group AI creative exploration:
  https://hmgroup.com/news/hm-continues-its-exploration-of-creativity-with-ai/
- Inditex Annual Report 2025:
  https://annualreport.inditex.com/anrpxxvui/en/our-drivers
- Lowe's digital twin:
  https://corporate.lowes.com/newsroom/press-releases/lowes-unveils-industry-first-digital-twin-giving-associates-superpowers-better-serve-customers-09-20-22
- Walmart agentic AI:
  https://corporate.walmart.com/news/2025/05/29/inside-walmarts-strategy-for-building-an-agentic-future
- Walmart Retail Rewired report 2025:
  https://corporate.walmart.com/content/corporate/en_us/news/2025/06/04/walmarts-retail-rewired-report-2025-agentic-ai-at-the-heart-of-retail-transformation.html
- Walmart supply chain AI:
  https://corporate.walmart.com/news/2025/07/17/walmarts-us-supply-chain-playbook-goes-global-and-its-reinventing-retail-at-scale
- Palantir Ontology overview:
  https://www.palantir.com/docs/foundry/ontology/overview
- Palantir Ontology system:
  https://www.palantir.com/docs/foundry/architecture-center/ontology-system
- McKinsey digital twins:
  https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-digital-twin-technology
- McKinsey supply chain digital twins:
  https://www.mckinsey.com/capabilities/quantumblack/our-insights/digital-twins-the-key-to-unlocking-end-to-end-supply-chain-growth
- BCG supply chain digital twins:
  https://www.bcg.com/publications/2024/using-digital-twins-to-manage-complex-supply-chains
- BCG supply chain digital twins PDF:
  https://web-assets.bcg.com/pdf-src/prod-live/using-digital-twins-to-manage-complex-supply-chains.pdf
- Maersk supply chain digital twins:
  https://www.maersk.com/insights/digitalisation/2024/05/30/digital-twins-supply-chain
- Maersk transforming decision-making with digital twins:
  https://www.maersk.com/news/articles/2023/01/20/transforming-decision-making-in-supply-chain-logistics-with-digital-twins
