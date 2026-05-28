---
status: accepted
date: 2026-03-12
tags:
- documentation
supersedes: []
depends-on:
- ADR-0002
- ODR-0010
- ODR-0014
- ODR-0015
- ODR-0020
- ODR-0022
- ODR-0025
- ODR-0027
- ODR-0028a
- ODR-0028b
- ODR-0030
- ODR-0036
implements: []
---

# SDS Concept Model Documentation

## Context and Problem Statement

The SDS (Supplier and Distribution Setup) ontology contains 99 classes across 9 modules, 53+ properties, and 10 SKOS enumeration schemes. This concept model currently exists only as Turtle files with inline AI preambles and editorial notes. While these are machine-readable and useful for ontology engineers, they are inaccessible to the broader audience of data engineers, domain SMEs, architects, and compliance officers who need to understand the SDS data model.

The ontology is governed by 36 Ontology Decision Records (ODR-0010 through ODR-0036) that encode design patterns, naming conventions, and architectural choices. These decisions shape the model but are scattered across ODR files — no single document explains the model holistically.

**What is needed:** A concept model manual that explains the SDS ontology as a coherent data model, with visual diagrams, cross-references, and business context. It must be maintainable, navigable, and usable by people who have never read a Turtle file.

This ADR and the manual it describes are **independent** from ADR-0002 (Ontology Website Information Model). Both derive from the same Turtle source files but serve different delivery channels: the manual is zero-dependency Markdown; the website is an interactive browser. The website may link to the manual for narrative context in future.

## Decision Drivers

* Audience diversity: Data engineers need property types and cardinalities; SMEs need business definitions; architects need relationship patterns and cross-module dependencies
* Modular maintainability: As the ontology grows, documentation must scale without requiring a single massive rewrite
* Visual communication: Class hierarchies, role patterns, and cross-module relationships are best communicated through diagrams
* Self-navigable: Each page must orient the reader and link to related pages — no assumed reading order (Mark Baker's "Every Page is Page One" methodology)
* Functional domain alignment: Documentation modules mirror ontology modules (ODR-0027) grouped by functional domain, not strict 1:1 file mapping
* Diagram tooling: Mermaid for GitHub-renderable diagrams with PNG export for offline use

## Considered Options

* Single monolithic document — one large Markdown file covering all 99 classes
* One page per class (99 files) — individual page per ontology class, wiki-style
* Functionally-aligned pages with cross-cutting pattern pages — 7 module pages + 2 prerequisite pages + hub + glossary; groups modules by functional domain

## Decision Outcome

Chosen option: "Functionally-aligned pages with cross-cutting pattern pages", because it mirrors the ontology structure, keeps pages navigable, and scales with the model.

Approved by Expert Hive Council Session 46 (10-0 on Q1, Q2a, Q3, Q5, Q6; Q2b 4-6 resulted in customs/exceptions split; Q4 0-10 resulted in layered vocabulary amendment).

### Consequences

* Good, because functional domain mapping aligns ontology modules and documentation pages
* Good, because each page is self-contained (9-20 classes per page)
* Good, because cross-cutting patterns get dedicated treatment as prerequisite reading
* Good, because it scales naturally as new modules are added
* Bad, because some reader journeys cross page boundaries (mitigated: cross-links, wayfinding)

### Confirmation

Compliance with this decision is confirmed when:

* Every SDS class (99) appears in exactly one module page
* Every module page has: business context, TOC, class hierarchy diagram, relationship diagram, data flow diagram, class reference section
* Every class reference has: label, definition, property table, classification facets
* Every diagram has a legend with Kind/Role/Phase/SubKind markers
* Cross-module links are bidirectional (A links to B, B links to A)
* Glossary covers all terms used in the manual that a non-ontologist would not know
* All Mermaid diagrams render correctly on GitHub
* All formal terms are glossary-linked on first use per page
* design-principles.md covers all 6 core design patterns
* cross-cutting-patterns.md covers all 5 shared patterns (incl. Kind/Role decision tree)
* Expert Hive Council has reviewed and approved the documentation strategy (Session 46, done)

## Pros and Cons of the Options

### Single monolithic document

* Good, because it is simple to maintain as one file
* Bad, because it is unnavigable at scale (estimated 4000+ lines)
* Bad, because it violates ODR-0027 principle (AI/LLM-friendly file organization)
* Bad, because of merge conflicts when multiple contributors edit

### One page per class (99 files)

* Good, because of maximum granularity
* Bad, because of excessive file count; reader must open many files to understand a module
* Bad, because relationships between classes in the same module are fragmented
* Bad, because of maintenance overhead for 99+ files

### Functionally-aligned pages with cross-cutting pattern pages

* Good, because of functional domain mapping between ontology modules and documentation pages
* Good, because each page is self-contained (9-20 classes per page)
* Good, because cross-cutting patterns get dedicated treatment as prerequisite reading
* Good, because it scales naturally as new modules are added
* Bad, because some reader journeys cross page boundaries (mitigated: cross-links, wayfinding)

## More Information

* [ODR-0010: Multi-Faceted Classification Framework](../ontology/odr/ODR-0010-multi-faceted-classification-framework.md)
* [ODR-0025: Role/View Modeling Pattern](../ontology/odr/ODR-0025-role-view-modeling-pattern.md)
* [ODR-0027: AI/LLM-Friendly File Organization](../ontology/odr/ODR-0027-ai-friendly-file-organization.md)
* [ODR-0030: OWL-as-Documentation Framework](../ontology/odr/ODR-0030-owl-as-documentation-framework.md)
* [ADR-0002: Ontology Website Information Model](ADR-ADR-ADR-0002-ontology-website-information-model.md)
* [Council Transcript: Session 46](../ontology/odr/council/session-46-adr-0003-concept-model-docs.md)
* [MADR Template](https://adr.github.io/madr/)

## Content Architecture

### Directory Structure

```
docs/manual/sds/model/concept/
├── index.md                      — Hub: overview, navigation map, stats, alphabetical class index
├── design-principles.md          — ODR-derived design rules (prerequisite reading)
├── cross-cutting-patterns.md     — Shared patterns: roles, reification, classification (prerequisite)
├── country-reference-data.md     — Country module (12 classes)
├── market-geography.md           — Market + market-temporal modules (20 classes)
├── currency-finance.md           — Currency module (11 classes)
├── customs-trade.md              — Customs + delivery modules (17 classes)
├── trade-exceptions.md           — Exception classes (9 classes)
├── organization-structure.md     — Organization module (15 classes)
├── calendar-time.md              — Calendar module (15 classes)
└── glossary.md                   — Term definitions for non-ontologists
```

11 files: 7 module pages + 2 prerequisite pages + hub + glossary.

### Page Design (Every Page is Page One)

Each module page follows a consistent structure:

| Section | Purpose |
|---------|---------|
| **Breadcrumb** | `Manual > SDS > Concept Model > {Page}` |
| **Overview** | 2-3 sentence module summary; subject area; class count |
| **Business context** | Why this module exists; what business processes it supports |
| **Table of contents** | Markdown TOC linking to all sections |
| **Class hierarchy diagram** | Mermaid class diagram with Kind/Role/Phase/SubKind markers |
| **Relationship diagram** | Mermaid flowchart showing cross-module links |
| **Data flow diagram** | Mermaid flowchart showing dbo table to ontology class mapping |
| **Class reference** | Per-class: label, definition, properties table, classification facets |
| **Enumerations** | SKOS ConceptSchemes used in this module |
| **Cross-module dependencies** | Which other modules this one references and is referenced by |
| **Related decisions** | Links to ODRs that govern this module |
| **Where next?** | Wayfinding: suggested next pages based on reader interest |

### Diagram Requirements (Council Session 46)

| Diagram | Mermaid type | Required | Notes |
|---------|--------------|----------|-------|
| Class hierarchy | `classDiagram` | Mandatory | Kind/SubKind/Role/Phase stereotypes; legend |
| Relationship map | `flowchart LR` | Mandatory | Cross-class and cross-module ObjectProperty links |
| Data flow | `flowchart TD` | Mandatory | dbo table to ontology class mapping |
| Module overview | `flowchart` | index.md only | All modules and inter-module relationships |

All diagrams must include a legend. Diagrams with more than ~15 elements should be split (30-second comprehension test).

### Vocabulary Strategy (Council Amendment — Layered Approach)

The blanket "no jargon" rule was unanimously rejected (0-10, Session 46 Q4). Instead:

| Context | Vocabulary |
|---------|-----------|
| Prose and business context sections | Business-friendly labels primary |
| Property tables and technical reference | Formal terms (`xsd:string`, `sh:minCount`) in dedicated columns |
| Cross-cutting pattern pages | Modeling terms (Kind, Role, Phase, SubKind, Reification) |
| All pages | Glossary-linked on first use per page |

### Cross-Cutting Pages

**design-principles.md** (prerequisite) — Normative rules derived from ODRs:
- OWL-as-documentation mode (ODR-0030/0036)
- Role/view modeling pattern (ODR-0025): roleOf vs subClassOf vs phaseOf
- 7-facet classification framework (ODR-0010)
- Domain/range as documentation (ODR-0014)
- Bounded context autonomy (ODR-0015)
- Instance namespace conventions (ODR-0020)

**cross-cutting-patterns.md** (prerequisite) — Recurring structural patterns:
- Kind/Role/SubKind/Phase decision tree (ODR-0025) — placed first
- PublishStatus (27 classes reference it)
- Temporal reification pattern (CurrencyAssignment, GBCCostPeriod, etc.)
- Business key pattern (ODR-0022)
- Currency promotion pattern (ODR-0028)

**glossary.md** — Terms for non-ontologists:
- Business terms (Fiscal Country, Planning Market, Incoterm)
- Modeling terms (Role, SubKind, Phase, Reification)
- Classification terms (Subject Area, Data Classification, Governance Tier)

### Linking Strategy

Every page includes:
- Breadcrumb: `Manual > SDS > Concept Model > {Page}`
- "Where next?" wayfinding section at bottom
- Inline links to glossary terms on first use per page
- Links to ODRs for design decisions
- Bidirectional cross-module links

## Design Decisions

1. **Module grouping:** Market + market-temporal in one page (both subject:Geography, shared business concern). Customs + delivery in one page (logistics, 17 classes). Exceptions split to separate page (Council Q2b, 4-6 vote: ontologically distinct reified qualifiers, different stakeholders).

2. **Business context first:** Every module page opens with a business context section explaining what business processes the module supports, before diagrams. (Council Q1 amendment, Allemang/Guarino)

3. **Diagram-first after context:** After business context, class hierarchy diagram provides visual orientation before detailed prose. All diagrams require legends with Kind/Role/Phase/SubKind markers. (Council Q3, Guizzardi/Davis)

4. **Properties shown in context:** Property tables appear within their class reference, not as a separate flat list. This matches how data engineers think: "what properties does PlanningMarket have?"

5. **Layered vocabulary:** Business labels primary in prose; formal terms (`xsd:string`, `sh:minCount`) in property table columns; modeling terms (Kind, Role, Phase) in cross-cutting pages. All glossary-linked on first use. (Council Q4 unanimous amendment)

6. **Mermaid with PNG export:** All diagrams authored as Mermaid for GitHub rendering. PNG exports for offline/presentation use via /diagramming and /export skills.

7. **Classification facets shown as badges:** Each class reference shows its 7-facet values as a compact badge row, not as a separate table.

8. **Prerequisite framing:** design-principles.md and cross-cutting-patterns.md are framed as prerequisite reading, not supplementary. (Council Q1, Guizzardi)
