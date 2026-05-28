---
status: accepted
date: 2026-03-18
tags:
- documentation
supersedes: []
depends-on:
- ADR-0034
- ODR-0010
- ODR-0025
- ODR-0036
implements: []
---

# PF Physical Ontology Documentation

## Context and Problem Statement

The PF (Product Framework) ontology physical model comprises 127 classes across 12 modules, ~165 properties, 20 SKOS ConceptSchemes (12 closed, 8 open-ended), 9 named individuals, and multiple cross-cutting design patterns (Role/SubKind/Phase, Junction Classes, Multi-use Properties, Business Keys, SKOS Enumerations, Rough Deal Estimation). This model is documented only in Turtle source files, ODRs, and the ontology builder's manual.

Stakeholders — data engineers, architects, domain SMEs, new team members — need browsable, diagram-rich reference documentation that explains:

* What classes exist and how they relate
* Why design patterns were chosen and how they are applied
* How modules connect across bounded context boundaries
* How validation (SHACL), classification (SKOS), and inferencing (OWL) work together

The documentation must be maintainable alongside the ontology source files and serve as both onboarding material and ongoing reference. The PF documentation follows the same hierarchical modular approach proven by the SDS documentation ([ADR-0034](ADR-ADR-ADR-0034-sds-physical-ontology-documentation.md)), adapted for PF's product-centric domain and different pattern inventory.

### Model Statistics

| Module | File | Classes | Key Patterns |
|--------|------|---------|-------------|
| Product | `pf-product.ttl` | 18 | Phase (Candidate, MainCandidate), Junction (ProductChannel, ArticleChannel, ArticleMarket), Business Key, Disjointness |
| Commercial | `pf-commercial.ttl` | 21 | Multi-use (composedOf, denominatedIn), Disjointness (price types), SKOS enums (6 schemes) |
| Planning | `pf-planning.ttl` | 15 | Junction (ArticleMarketWeekSelection), Business Key, SKOS enum (PlanLevel) |
| Supply Chain | `pf-supplychain.ttl` | 14 | Order workflow, SKOS enum (RejectType) |
| Logistics | `pf-logistics.ttl` | 11 | Phase (RoughLeadTime), SubKind (lead time types), Business Key |
| Development | `pf-development.ttl` | 9 | SKOS enum (ProductDevelopmentStatus) |
| Geography | `pf-geography.ttl` | 9 | Role (6 country roles), Junction (PlanningRegionMarket) |
| Enterprise | `pf-enterprise.ttl` | 7 | Named individuals (5 systems, 4 roles) |
| Appearance | `pf-appearance.ttl` | 7 | Multi-use (isComponentOf) |
| Sizing | `pf-sizing.ttl` | 4 | Season dependency |
| Organization | `pf-organization.ttl` | 4 | Business Key (4 classes), Disjointness (4-way), Hierarchy |
| Rough Estimates | `pf-rough-estimates.ttl` | 8 | SubKind (RoughDealToday/Tomorrow), Phase (RoughQuantity, RoughInPrice), Snapshot, Disjointness |

## Decision Drivers

* Consistency with SDS: both bounded contexts share the same formalism stack, design principles, and ODR governance; documentation structure should mirror SDS for cross-context navigability
* Audience diversity: data engineers need property details; architects need pattern rationale; SMEs need business context
* Navigability: readers should find any class, pattern, or relationship within 2-3 clicks
* Diagram density: complex relationships require visual explanation; Mermaid diagrams must be integrated throughout
* Maintainability: documentation must track ontology evolution without becoming stale
* Modularity: large documentation must be split into focused files with clear cross-references
* Progressive disclosure: overview to architecture to patterns to module reference to glossary

## Considered Options

* Option 1 — Reuse SDS documentation structure verbatim
* Option 2 — Flat documentation (one file per module, no patterns/frameworks)
* Option 3 — Adapted hierarchical modular documentation

## Decision Outcome

Chosen option: "Option 3 — Adapted hierarchical modular documentation", because it leverages the proven SDS documentation structure while accommodating PF's distinct domain patterns and module inventory. Mirror SDS structure but with PF-specific pattern pages and module groupings.

### Information Architecture

```
docs/manual/pf/model/physical/ontology/
├── index.md                          # Landing page, overview, navigation map
├── architecture.md                   # Module boundaries, design principles, formalism stack
├── modules/
│   ├── index.md                      # Module comparison matrix, statistics
│   ├── product.md                    # Product module (18 classes)
│   ├── commercial.md                 # Commercial module (21 classes)
│   ├── planning.md                   # Planning module (15 classes)
│   ├── supplychain.md                # Supply Chain module (14 classes)
│   ├── logistics.md                  # Logistics module (11 classes)
│   ├── development.md                # Development module (9 classes)
│   ├── geography.md                  # Geography module (9 classes)
│   ├── enterprise.md                 # Enterprise module (7 classes + 9 individuals)
│   ├── appearance.md                 # Appearance module (7 classes)
│   ├── sizing.md                     # Sizing module (4 classes)
│   ├── organization.md              # Organization module (4 classes)
│   └── rough-estimates.md           # Rough Estimates module (8 classes)
├── patterns/
│   ├── index.md                     # Pattern catalog with decision rationale
│   ├── role-subkind-phase.md       # UFO-based entity classification (adapted for PF)
│   ├── junction-class.md           # ProductChannel, ArticleChannel, ArticleMarket relators
│   ├── multi-use-property.md       # composedOf, basedOn, hasAttributeGroup, inTaxonomy, isComponentOf
│   ├── business-key.md             # Cross-context join key pattern (10 classes)
│   ├── skos-enumeration.md         # 20 ConceptSchemes: 12 closed, 8 open-ended
│   └── rough-deal-estimation.md    # RoughDeal/RoughQuantity/RoughInPrice with snapshot pattern
├── frameworks/
│   ├── classification.md           # 7-facet classification (ODR-0010) — shared with SDS
│   ├── validation.md              # SHACL 1.2 + DASH tier adoption — shared with SDS
│   └── inferencing.md             # OWL selective inferencing (ODR-0036) — shared with SDS
├── cross-references.md            # Module interdependency map
└── glossary.md                    # Terms, abbreviations, ODR cross-references
```

**File count:** 25
**Estimated scope:** 800-1200 lines per module page, 400-600 per pattern/framework page

### Module Page Template

Every module page follows the same consistent template used in SDS ([ADR-0034](ADR-ADR-ADR-0034-sds-physical-ontology-documentation.md)):

| Section | Content | Diagram |
|---------|---------|---------|
| **Header** | Module name, source file, class/property counts | — |
| **Table of Contents** | Auto-generated from headings | — |
| **Overview** | 2-3 paragraph business narrative | — |
| **Class Hierarchy** | Inheritance, roles, subkinds, phases | `classDiagram` |
| **Classes** | Per-class: definition, 7-facet table, properties, relationships | — |
| **Property Inventory** | Complete table: name, type, cardinality, source | — |
| **Relationships** | Inter-class and cross-module connections | `graph TD` or `erDiagram` |
| **Disjointness** | `owl:disjointWith` declarations (where applicable) | — |
| **Cross-Module Refs** | Links to classes in other modules | — |
| **ODR References** | Governing decision records | — |

### Pattern Page Template

| Section | Content | Diagram |
|---------|---------|---------|
| **Header** | Pattern name, governing ODR, applicable modules | — |
| **Table of Contents** | Auto-generated from headings | — |
| **Problem** | What problem this pattern solves | — |
| **Solution** | How the pattern works | `classDiagram` or `graph` |
| **Examples** | Concrete PF instances | `classDiagram` |
| **Rules** | When to apply, when not to apply | — |
| **Related Patterns** | Links to other pattern pages | — |

### Diagram Strategy

| Diagram Type | Mermaid Syntax | Purpose | Where Used |
|-------------|---------------|---------|-----------|
| Class hierarchy | `classDiagram` | Inheritance, roles, subkinds, phases | Every module page |
| Entity relationships | `erDiagram` | Cross-module entity relationships | Architecture, cross-references |
| Module boundaries | `graph TD` | Architecture overview, module map | Index, architecture |
| Data flow | `flowchart LR` | Order workflow, rough deal estimation | Supply Chain, Rough Estimates |
| Classification | `mindmap` | 7-facet taxonomy | Classification framework |
| State | `stateDiagram-v2` | Lifecycle states | Validation framework |

**Density rule:** Minimum 2, maximum 5 diagrams per page.

**Fallback:** Use DOT/Graphviz via `dot-export` skill when Mermaid syntax cannot express required semantics.

### Cross-Referencing Strategy

* **Relative Markdown links** between all documents (e.g. `[Product module](modules/product.md)`)
* **Anchor links** to specific class sections (e.g. `product.md#pfproduct`)
* **Back-references** — module pages link to patterns they use; pattern pages link to modules that use them
* **Breadcrumb navigation** — every page opens with: `[PF Ontology](../index.md) > [Modules](index.md) > Product`
* **See Also** sections at the bottom of every page

### Design Decisions

1. **Template consistency.** Every module page follows the same template as SDS module pages. Readers learn the layout once.
2. **Breadcrumb navigation.** Every page opens with a breadcrumb path: `[PF Ontology](../index.md) > [Modules](index.md) > Product`.
3. **Ontological nature annotation.** Class diagrams annotate each class with its ontological category: Kind, Role, SubKind, Phase (per ODR-0025).
4. **Diagram-first sections.** The class hierarchy diagram appears before the class-by-class detail.
5. **SHACL property tables as the reference.** Property tables derive from SHACL shapes (authoritative for cardinality, type, constraints).
6. **ODR traceability.** Every design pattern and architectural decision links to its governing ODR.
7. **PF-specific patterns.** Junction Class, Multi-use Property, SKOS Enumeration, and Rough Deal Estimation are PF-specific pattern pages not present in SDS documentation.
8. **Mermaid default with DOT fallback.** Use Mermaid for all diagrams where its syntax suffices.

### Consequences

* Good, because cross-context readers navigate PF and SDS documentation with the same mental model
* Good, because PF-specific patterns (junction classes, rough deal estimation) get proper documentation
* Good, because shared frameworks (classification, validation, inferencing) are documented once and linked
* Good, because progressive disclosure flows from overview to detail
* Good, because diagrams are embedded in context
* Bad, because 25 files require cross-reference maintenance
* Bad, because template changes must propagate across all module pages
* Bad, because framework pages are shared and must be coordinated

### Confirmation

* All 127 PF classes appear in at least one module page
* All ~165 properties appear in property inventory tables
* Every module page has minimum 2, maximum 5 Mermaid diagrams
* Every pattern page has at least 1 diagram and 2 concrete PF examples
* All cross-module relationships are documented bidirectionally
* Breadcrumb navigation is present on every page
* Table of Contents is present on every page
* Every class section includes: definition, 7-facet table, properties table, ontological nature
* All internal links are valid (no dead links)
* Glossary contains entries for all technical terms used across documents
* Every ODR referenced in the text links to the actual ODR file
* No page exceeds 1500 lines
* Diagrams render correctly in GitHub Markdown preview

## Pros and Cons of the Options

### Option 1 — Reuse SDS documentation structure verbatim

Copy the SDS structure and adapt content only.

* Good, because it gives maximum consistency between BCs
* Bad, because PF has different pattern inventory (junction classes, rough deals) that SDS lacks
* Bad, because PF has 12 modules vs SDS's 8 — different grouping

### Option 2 — Flat documentation (one file per module, no patterns/frameworks)

Simpler structure with fewer cross-references.

* Good, because fewer files to maintain
* Bad, because patterns are duplicated across modules
* Bad, because there is no progressive disclosure

### Option 3 — Adapted hierarchical modular documentation

Mirror SDS structure but with PF-specific pattern pages and module groupings.

* Good, because it is consistent with SDS for cross-context readers
* Good, because PF-specific patterns (junction classes, rough deals) get dedicated pages
* Good, because the same template governs both BCs
* Good, because shared frameworks are documented once and linked from both
* Bad, because 25 files require cross-reference maintenance
* Bad, because template changes must be applied across all module pages

## More Information

* [ADR-0034: SDS Physical Ontology Documentation](ADR-ADR-ADR-0034-sds-physical-ontology-documentation.md)
* [ODR-0010: Multi-Faceted Classification Framework](../ontology/odr/ODR-0010-multi-faceted-classification-framework.md)
* [ODR-0011: Documentation Annotation Strategy](../ontology/odr/ODR-0011-documentation-annotation-strategy.md)
* [ODR-0014: Domain/Range as Documentation](../ontology/odr/ODR-0014-domain-range-as-documentation.md)
* [ODR-0015: Bounded Context Autonomy](../ontology/odr/ODR-0015-bounded-context-autonomy.md)
* [ODR-0021: Expert Hive Review Methodology](../ontology/odr/ODR-0021-expert-hive-review-methodology.md)
* [ODR-0022: Business Key Property](../ontology/odr/ODR-0022-business-key-property.md)
* [ODR-0025: Role/View Modeling Pattern](../ontology/odr/ODR-0025-role-view-modeling-pattern.md)
* [ODR-0027: AI-Friendly File Organization](../ontology/odr/ODR-0027-ai-friendly-file-organization.md)
* [ODR-0028b: Disjointness Enforcement](../ontology/odr/ODR-0028b-disjointness-enforcement.md)
* [ODR-0030: OWL as Documentation Framework](../ontology/odr/ODR-0030-owl-as-documentation-framework.md)
* [ODR-0033: RDF/SPARQL 1.2 Adoption](../ontology/odr/ODR-0033-rdf-sparql-12-adoption.md)
* [ODR-0034: SHACL 1.2 Extension Framework](../ontology/odr/ODR-0034-shacl12-extension-framework.md)
* [ODR-0035: DASH Vocabulary Adoption](../ontology/odr/ODR-0035-dash-vocabulary-adoption.md)
* [ODR-0036: SHACL Rules and OWL Inferencing](../ontology/odr/ODR-0036-shacl-rules-and-owl-inferencing.md)
* [ODR-0038: PPLAN Integration](../ontology/odr/ODR-0038-pplan-planproductdomain-ontology-integration.md)
* [ODR-0039: PPLAN Satellite Repo Gap Analysis](../ontology/odr/ODR-0039-pplan-satellite-repo-gap-analysis.md)
* [Ontology Builder's Manual](../ontology/ontology-builders-manual.md)
* [MADR Template](https://adr.github.io/madr/)
