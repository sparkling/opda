---
status: accepted
date: 2026-03-18
tags:
- documentation
supersedes: []
depends-on:
- ADR-0003
- ODR-0010
- ODR-0014
- ODR-0015
- ODR-0020
- ODR-0022
- ODR-0025
- ODR-0030
- ODR-0036
implements: []
---

# PF Concept Model Documentation

## Context and Problem Statement

The PF (Product Framework) ontology contains 127 classes across 12 modules, 90+ object properties, 44+ datatype properties, and 20 SKOS enumeration/taxonomy schemes. This concept model currently exists only as Turtle files with inline AI preambles and editorial notes. While these are machine-readable and useful for ontology engineers, they are inaccessible to the broader audience of data engineers, domain SMEs, architects, and product planners who need to understand the PF data model.

PF covers the full product lifecycle: from development and design through commercialization, planning, supply chain management, and logistics delivery. It is governed by the same 36+ Ontology Decision Records (ODR-0010 through ODR-0039) that govern SDS, plus PF-specific decisions on junction classes, rough deal estimation, and PPLAN satellite integration.

ADR-0003 established the documentation pattern for SDS (91 classes, 9 modules). PF is larger (127 classes, 12 modules) and structurally different — it uses Phase classes (lifecycle transitions), junction classes (ProductChannel, ArticleChannel, ArticleMarket), and a rough estimation subsystem not present in SDS.

**What is needed:** A concept model manual that explains the PF ontology as a coherent data model, following the ADR-0003 template but adapted for PF's unique patterns and larger scope. It must be maintainable, navigable, and usable by people who have never read a Turtle file.

## Decision Drivers

* ADR-0003 consistency: follow the same page structure, diagram conventions, and vocabulary strategy established for SDS
* PF-specific patterns: junction classes, Phase modeling, rough deal estimation, and multi-channel product distribution require dedicated treatment
* Larger scope: 127 classes across 12 modules requires thoughtful page grouping to keep each page navigable (target: 8-20 classes per page)
* Audience diversity: product planners need business definitions; data engineers need property types; architects need relationship patterns
* Cross-BC navigation: readers moving between SDS and PF documentation should find a familiar structure
* Functional domain alignment: documentation pages group modules by product lifecycle stage, not strict 1:1 file mapping

## Considered Options

* Option 1 — Extend SDS documentation with PF content
* Option 2 — Mirror SDS structure exactly (7 module pages)
* Option 3 — Functionally-aligned pages adapted for PF scope

## Decision Outcome

Chosen option: "Option 3 — Functionally-aligned pages adapted for PF scope", because it maintains consistency with the SDS documentation while adapting to PF's larger scope and different structural patterns. 8 module pages + 2 prerequisite pages + hub + glossary, grouped by product lifecycle stage.

### Directory Structure

```
docs/manual/pf/model/concept/
├── index.md                        — Hub: overview, navigation map, stats, alphabetical class index
├── design-principles.md            — ODR-derived design rules (same framework as SDS, PF examples)
├── cross-cutting-patterns.md       — PF-specific patterns: junctions, phases, rough deals, multi-use props
├── product-taxonomy.md             — Product + Appearance + Sizing modules (29 classes)
├── commercial-pricing.md           — Commercial module (21 classes)
├── planning-temporal.md            — Planning module (15 classes)
├── supply-chain-orders.md          — Supply Chain module (14 classes)
├── logistics-delivery.md           — Logistics module (11 classes)
├── development-manufacturing.md    — Development module (9 classes)
├── organization-enterprise.md      — Organization + Enterprise modules (11 classes)
├── geography-markets.md            — Geography module (9 classes) + Rough Estimates (8 classes)
└── glossary.md                     — Term definitions for non-ontologists
```

12 files: 8 module pages + 2 prerequisite pages + hub + glossary.

### Page Design (Every Page is Page One)

Identical structure to ADR-0003:

| Section | Purpose |
|---------|---------|
| **Breadcrumb** | `Manual > PF > Concept Model > {Page}` |
| **Overview** | 2-3 sentence module summary; subject area; class count |
| **Business context** | Why this module exists; what business processes it supports |
| **Table of contents** | Markdown TOC linking to all sections |
| **Class hierarchy diagram** | Mermaid class diagram with Kind/Role/Phase/SubKind markers |
| **Relationship diagram** | Mermaid flowchart showing cross-module links |
| **Class reference** | Per-class: label, definition, properties table, classification facets |
| **Enumerations** | SKOS ConceptSchemes used in this module |
| **Cross-module dependencies** | Which other modules this one references and is referenced by |
| **Related decisions** | Links to ODRs that govern this module |
| **Where next?** | Wayfinding: suggested next pages based on reader interest |

### Module Grouping Rationale

| Page | Modules | Classes | Rationale |
|------|---------|---------|-----------|
| Product Taxonomy | product, appearance, sizing | 29 | Core product identity + visual/size attributes |
| Commercial Pricing | commercial | 21 | Pricing, deals, quantities, commercial beliefs |
| Planning Temporal | planning | 15 | Seasons, collections, buying strategies, ISW |
| Supply Chain Orders | supplychain | 14 | Suppliers, purchase requests, orders, execution |
| Logistics Delivery | logistics | 11 | Lead times, transport, delivery terms |
| Development Manufacturing | development | 9 | BOM, CMT, product quotes, samples |
| Organization Enterprise | organization, enterprise | 11 | Departments, divisions, brands, systems, roles |
| Geography Markets | geography, rough-estimates | 17 | Countries, regions, rough deal estimation |

### Cross-Cutting Pages

**design-principles.md** (prerequisite) — Same 6 normative rules as SDS (shared framework), with PF-specific examples:

* OWL-as-documentation mode (ODR-0030/0036)
* Role/Phase modeling pattern (ODR-0025): Phase examples from PF (Candidate, RoughDealToday)
* 7-facet classification framework (ODR-0010)
* Domain/range as documentation (ODR-0014)
* Bounded context autonomy (ODR-0015) — PF is independent from SDS
* Instance namespace conventions (ODR-0020)

**cross-cutting-patterns.md** (prerequisite) — PF-specific patterns:

* Kind/Role/SubKind/Phase decision tree (ODR-0025) — Phase examples prominent
* Junction class pattern (ProductChannel, ArticleChannel, ArticleMarket, ArticleMarketWeekSelection)
* Multi-use property pattern (composedOf, basedOn, hasAttributeGroup, denominatedIn)
* SKOS enumeration pattern (20 schemes: 12 CLOSED + 8 OPEN-ENDED)
* Business key pattern (ODR-0022)
* Rough deal estimation pattern (RoughDeal snapshots and phases)

**glossary.md** — PF-specific terms:

* Business terms (Article, Colourway, ISW, Deal, BOM, CMT, GPO)
* Modeling terms (Kind, Role, Phase, SubKind, Junction class)
* Classification terms (Subject Area, Data Classification, Governance Tier)

### Design Decisions

1. **Product+Appearance+Sizing grouping:** These three modules form the core product identity. Appearance and Sizing are attribute modules of Product (4-7 classes each), too small for standalone pages.
2. **Geography+Rough Estimates grouping:** Rough estimates are commercially significant but small (8 classes). They share geographic planning context (RoughDeal per planning market/region).
3. **Phase modeling prominence:** PF uses Phase classes (Candidate, MainCandidate, RoughDealToday, RoughDealTomorrow, RoughQuantity, RoughInPrice) that SDS does not. The cross-cutting patterns page gives Phase modeling prominent treatment.
4. **Junction class pattern:** PF's ProductChannel, ArticleChannel, ArticleMarket, and ArticleMarketWeekSelection are junction entities (not reifiers) that carry business attributes. This pattern gets dedicated treatment as it has no SDS equivalent.
5. **Named individuals documented:** PF includes 9 NamedIndividuals (5 SystemTools, 4 Roles) that have no SDS equivalent. These appear in the Organization Enterprise page.
6. **20 SKOS schemes:** PF has twice as many enumeration schemes as SDS (20 vs 10), split between CLOSED (12) and OPEN-ENDED (8). The enumeration pattern section covers both types.

### Consequences

* Good, because it follows the ADR-0003 template for consistency with SDS
* Good, because it adapts groupings to PF's lifecycle-oriented structure
* Good, because each page is 9-29 classes (navigable)
* Good, because PF-specific patterns (junctions, phases, rough deals) get dedicated treatment
* Bad, because there are more pages than SDS. (Mitigated: consistent structure aids navigation.)

### Confirmation

* Every PF class (127) appears in exactly one module page
* Every module page has: business context, TOC, class hierarchy diagram, relationship diagram, class reference section
* Every class reference has: label, definition, classification facets
* Cross-module links are bidirectional (A links to B, B links to A)
* Glossary covers all PF-specific terms used in the manual
* All Mermaid diagrams render correctly on GitHub
* design-principles.md covers all 6 core design patterns with PF examples
* cross-cutting-patterns.md covers all 6 PF-specific patterns
* Consistent structure with ADR-0003 (SDS concept model documentation)

## Pros and Cons of the Options

### Option 1 — Extend SDS documentation with PF content

Add PF classes to existing SDS pages.

* Bad, because it violates bounded context autonomy (ODR-0015)
* Bad, because SDS and PF have different structures, audiences, and lifecycle stages
* Bad, because it would make SDS pages unmanageably large

### Option 2 — Mirror SDS structure exactly (7 module pages)

Use the same number of documentation pages as SDS.

* Bad, because PF has 12 modules vs SDS's 9 — some pages would be overloaded (25+ classes)
* Bad, because it forces awkward groupings that don't match PF's lifecycle-oriented structure

### Option 3 — Functionally-aligned pages adapted for PF scope

8 module pages + 2 prerequisite pages + hub + glossary. Groups by product lifecycle stage.

* Good, because it follows ADR-0003 template for consistency with SDS
* Good, because it adapts groupings to PF's lifecycle-oriented structure
* Good, because each page is 9-29 classes (navigable)
* Good, because PF-specific patterns (junctions, phases, rough deals) get dedicated treatment
* Bad, because more pages than SDS

## More Information

* [ADR-0003: SDS Concept Model Documentation](ADR-ADR-ADR-0003-sds-concept-model-documentation.md)
* [ODR-0010: Multi-Faceted Classification Framework](../ontology/odr/ODR-0010-multi-faceted-classification-framework.md)
* [ODR-0025: Role/View Modeling Pattern](../ontology/odr/ODR-0025-role-view-modeling-pattern.md)
* [ODR-0027: AI/LLM-Friendly File Organization](../ontology/odr/ODR-0027-ai-friendly-file-organization.md)
* [ODR-0030: OWL-as-Documentation Framework](../ontology/odr/ODR-0030-owl-as-documentation-framework.md)
* [ODR-0038: PPLAN Integration](../ontology/odr/ODR-0038-pplan-planproductdomain-ontology-integration.md)
* [ODR-0039: PPLAN Satellite Repo Gap Analysis](../ontology/odr/ODR-0039-pplan-satellite-repo-gap-analysis.md)
* [MADR Template](https://adr.github.io/madr/)
