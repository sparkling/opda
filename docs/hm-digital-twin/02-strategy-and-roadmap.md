# Strategy and Roadmap: H&M Enterprise Digital Twin

## Strategic Intent

The programme should be positioned as an AI-native enterprise transformation,
not as a data-management clean-up.

The goal is to create an operating system for fashion responsiveness:

- A live linked-data model of the enterprise.
- A set of simulation and optimisation engines.
- A mesh of AI agents that can reason over the twin, run scenarios, recommend
  action, and trigger controlled execution.
- A redesigned decision model that compresses trend response, allocation,
  replenishment, supplier coordination, and lifecycle decisions.

This is a chance to leapfrog because a linked-data + agents approach can make
data governance practical. Instead of asking every function to clean data for
an abstract future benefit, the twin forces clarity around the entities,
relationships, events, ownership, and actions needed to make decisions now.

## The New Operating Model

H&M today should be assumed to operate with many local optimisations:

- Product teams optimise assortment.
- Supply and production teams optimise supplier and factory plans.
- Logistics teams optimise movement.
- Sales teams optimise channels and markets.
- Finance teams optimise margin, cash, and risk.
- Sustainability teams optimise traceability, materials, emissions, and
  supplier standards.

The digital twin creates a shared decision fabric:

- One representation of product, demand, stock, supply, movement, market, and
  constraint.
- One place to ask "what is true now?"
- One place to ask "what happens if?"
- One place to capture "what did we decide, who approved it, what happened?"

The programme's success metric is not how many systems are integrated. It is how
many high-value decisions become faster, more accurate, and more executable.

## Strategic Bets

### Bet 1: Treat the Semantic Model as the Product

The semantic model is not a data integration by-product. It is the core product.

It should represent the nouns and verbs of H&M's operating model:

- Nouns: products, SKUs, options, materials, suppliers, factories, purchase
  orders, shipments, stores, warehouses, markets, campaigns, returns, customers,
  trend signals, constraints.
- Verbs: forecast, buy, allocate, replenish, transfer, reroute, delay, cancel,
  substitute, markdown, promote, recall, retire, resell, recycle.

Every agent, workflow, report, API, and simulation should operate against this
shared model.

### Bet 2: Build Actionable Twins, Not Passive Twins

The twin must not stop at visualisation. Each insight should connect to:

- Available actions.
- Expected impact.
- Required approval.
- Risk.
- Reversibility.
- System write-back path.
- Audit trail.

An operational twin answers:

- What is happening?
- Why is it happening?
- What will happen if we do nothing?
- What options do we have?
- Which option should we take?
- What can be executed automatically?
- What must be escalated?

### Bet 3: Put Agents in Workflows

Agents should be deployed in the decision loops where H&M loses value:

- Trend sensing to product response.
- Initial allocation to store/ecommerce balancing.
- In-season replenishment to supplier capacity.
- Inventory imbalance to transfer or markdown action.
- Supplier risk to mitigation.
- Logistics disruption to rerouting.
- Product lifecycle to circularity and end-of-life.

Avoid isolated chatbots. A chatbot is an interface. The value is in the
agent's access to state, policies, tools, simulations, and action rights.

### Bet 4: Governance Through Use Cases

Data governance should be embedded in the semantic model and decision workflows:

- Entity ownership.
- Data quality thresholds.
- Confidence scores.
- Source lineage.
- Decision rights.
- Action policies.
- Escalation rules.
- Compliance constraints.

This converts governance from committee work into operational software.

## Priority Value Flows

### 1. Trend-to-Assortment Acceleration

Problem:

Fashion demand moves faster than long planning cycles. The business needs to
detect trend signals, map them to products and suppliers, and act in-season
where possible.

Twin capability:

- Connect search, social, ecommerce, store sell-through, returns, regional
  demand, product attributes, supplier capacity, lead time, and margin.
- Detect emerging demand patterns.
- Simulate product response options: reorder, modify colour, shift allocation,
  activate near-shore capacity, launch capsule, or promote substitutes.

Agent capability:

- Trend agents create opportunity briefs.
- Product agents map trend signals to product families and options.
- Supplier agents evaluate feasible capacity.
- Finance agents estimate margin and markdown risk.

### 2. Inventory and Stock Allocation

Problem:

The same stock can be a missed sale in one market and a markdown risk in
another.

Twin capability:

- Live stock model across stores, ecommerce, DCs, in-transit shipments, returns,
  purchase orders, reservations, and ageing.
- Demand forecast by market/channel/store/SKU.
- Constraints for transfer cost, labour, service promise, store capacity, and
  margin.

Agent capability:

- Allocation agents recommend transfers, ecommerce pooling, replenishment, or
  markdown avoidance actions.
- Store agents surface local anomalies and action tasks.
- Logistics agents simulate movement costs and feasibility.

### 3. Supplier and Production Responsiveness

Problem:

H&M works with independent suppliers and multiple tiers. Public H&M data says
the group does business with over 554 commercial product suppliers and over 969
tier 1 factories, with China and Bangladesh the largest production markets for
clothing.

Twin capability:

- Supplier/factory model including capacity, lead time, quality, cost,
  compliance, sustainability, material availability, and geopolitical exposure.
- Multi-tier visibility where public or supplier-provided data exists.
- Scenario planning for supplier shifts, capacity changes, tariffs, freight
  changes, and disruption.

Agent capability:

- Supplier agents monitor capacity, risk, quality, and compliance events.
- Production agents recommend feasible changes in order timing, split,
  substitution, or factory assignment.

### 4. Logistics and Channel Promise

Problem:

Customer promise, logistics cost, and inventory availability are linked but
often managed through separate views.

Twin capability:

- Network model of DCs, warehouses, routes, carriers, stores, ecommerce demand,
  and service promises.
- Event stream for shipment, warehouse, port, carrier, and customs status.
- Scenario engine for routing, consolidation, delay mitigation, and channel
  fulfilment.

Agent capability:

- Logistics agents reroute or recommend rerouting.
- Channel agents balance store fulfilment, ecommerce promise, and margin.

### 5. Product Lifecycle Twin

Problem:

Product decisions continue after launch. Returns, quality, resale, recycling,
compliance, and end-of-life affect revenue, cost, sustainability, and brand.

Twin capability:

- Lifecycle state for each product from concept to retirement.
- Links to materials, suppliers, orders, sales, returns, quality issues,
  sustainability attributes, resale, and recycling paths.

Agent capability:

- Lifecycle agents identify products for extension, discontinuation, markdown,
  resale, repair, recycling, or design learning.

## Roadmap Principle

Do not run this as a slow sequential transformation:

1. Fix all data.
2. Build platform.
3. Build use cases.
4. Change processes.
5. Add AI.

That sequence will underuse AI and lose momentum.

Run it as parallel compression:

- Build the enterprise semantic spine from the first day.
- Build use-case vertical slices from the first day.
- Use agents to accelerate data mapping, entity resolution, documentation,
  lineage capture, testing, and scenario generation.
- Let high-value workflows force data ownership and quality improvements.
- Keep the architecture modular so immature source systems can be wrapped before
  they are replaced.

## Suggested Waves

The dates below are directional. The point is sequencing, not a waterfall plan.
AI and agentic engineering should compress delivery, but legacy systems,
operating-model change, and trust-building still create real constraints.

### Wave 0: Mobilise and Prove

Duration: approximately 12 weeks.

Output:

- One executive digital twin prototype.
- One linked-data model slice.
- One agentic workflow that produces auditable recommendations.
- One value baseline.
- One scale architecture.

Best candidate:

In-season stock allocation and transfer decisions, because the data is close to
revenue, margin, stores, ecommerce, logistics, and inventory.

Alternative:

Trend-to-assortment response for a high-velocity product category.

### Wave 1: Build the Core Twin Spine

Duration: approximately 3-9 months after mobilisation.

Scope:

- Product/SKU model.
- Store/ecommerce/market model.
- Inventory state model.
- Supplier/factory model.
- Purchase order and shipment model.
- Decision and action ledger.
- Integration adapters for priority systems.
- Agent framework with permissioning, tool access, and audit.

Outcomes:

- Cross-functional view of stock and supply.
- Scenario planning for allocation and replenishment.
- First controlled actions through existing systems.

### Wave 2: Scale to Product and Supply Decisions

Duration: approximately 9-18 months after mobilisation.

Scope:

- Trend sensing.
- Product lifecycle.
- Supplier capacity and risk.
- Logistics optimisation.
- Markdown and pricing scenario support.
- Expanded store/ecommerce integration.

Outcomes:

- Faster in-season decisions.
- Better supplier collaboration.
- Lower avoidable markdowns.
- Better inventory productivity.

### Wave 3: Enterprise Operating Model

Duration: approximately 18-36 months, depending on systems and adoption.

Scope:

- Enterprise twin at scale.
- Agentic control tower across supply, logistics, inventory, product, and sales.
- Deeper autonomous execution within guardrails.
- Product lifecycle and circularity integration.
- Continuous simulation for executive planning.

Outcomes:

- Twin becomes a standard decision environment.
- AI agents become operational co-workers.
- Planning cycles become more continuous and responsive.

## Decision Rights and Guardrails

Agents should not be granted blanket autonomy. Action rights should be tiered:

| Action Class | Example | Agent Role | Human Role |
|---|---|---|---|
| Read and explain | Explain stock risk in France | Retrieve and reason | Consume insight |
| Recommend | Recommend transfer from Market A to B | Simulate and rank options | Approve or reject |
| Prepare action | Draft replenishment order | Generate action package | Review and submit |
| Execute low-risk | Trigger allowed report, create task | Execute within policy | Monitor |
| Execute material | Reallocate stock, change PO, adjust markdown | Stage and justify | Approve |
| Emergency action | Reroute delayed shipment | Recommend playbook | Senior approval |

Every recommendation and action should have:

- Source data.
- Confidence.
- Assumptions.
- Simulated impact.
- Policy basis.
- Approver.
- Write-back record.
- Outcome tracking.

## Organisational Design

Recommended core teams:

- Enterprise twin product team: owns the semantic model and user workflows.
- Semantic twin platform team: owns entity resolution, APIs, performance, and
  the H&M-owned linked-data substrate.
- Agent platform team: owns agent runtime, tools, permissions, observability,
  evaluation, and safety.
- Use-case squads: cross-functional teams for inventory, supply, product,
  logistics, and lifecycle.
- Decision governance team: defines policy, action rights, escalation, audit,
  and risk controls.
- Data stewardship network: embedded owners for product, supplier, inventory,
  logistics, and commercial entities.

Avoid separating "data" from "business". The twin is only useful if product,
supply, sales, logistics, finance, and tech co-own it.

## Executive Metrics

North-star outcomes:

- Decision latency: time from signal to recommended action.
- Execution latency: time from approved action to system execution.
- Inventory productivity: stock-in-trade as percentage of rolling sales,
  inventory turns, aged stock, and stuck stock.
- Margin quality: markdown rate, full-price sell-through, gross margin.
- Revenue capture: stockout rate, lost sales, size availability, conversion.
- Responsiveness: share of assortment bought in season, time to replenish,
  time to launch trend response.
- Resilience: disruption recovery time, supplier risk exposure, logistics delay
  impact.
- Trust: recommendation adoption rate, override rate, recommendation accuracy,
  agent incident rate.

## Failure Modes to Avoid

- Treating the twin as a BI dashboard.
- Building a semantic model without action semantics.
- Building agents without a governed semantic model.
- Building governance as policy documents rather than software-enforced
  decision rights.
- Choosing too many initial use cases.
- Using vendor demos as architecture.
- Letting source-system limitations dictate the future model.
- Trying to replace all systems before building the twin.
