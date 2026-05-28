---
status: accepted
date: 2026-03-12
tags:
- documentation
supersedes: []
depends-on:
- ODR-0014
- ODR-0025
implements: []
---

# SDS Physical Ontology Documentation

## Context and Problem Statement

The SDS ontology physical model comprises 91 classes across 8 modules, ~120 properties, 10 SKOS ConceptSchemes, 17 temporal reification classes (RDF 1.2), and multiple cross-cutting design patterns (Role/SubKind/Phase, business keys, 7-facet classification, disjointness enforcement). This model is documented only in Turtle source files, ODRs, and the ontology builder's manual.

Stakeholders — data engineers, architects, domain SMEs, new team members — need browsable, diagram-rich reference documentation that explains:

* What classes exist and how they relate
* Why design patterns were chosen and how they are applied
* How modules connect across bounded context boundaries
* How validation (SHACL), classification (SKOS), and inferencing (OWL) work together

The documentation must be maintainable alongside the ontology source files and serve as both onboarding material and ongoing reference.

### Model Statistics

| Module | File | Classes | Key Patterns |
|--------|------|---------|-------------|
| Country | `sds-country.ttl` | 11 | Role (5 country roles), SubKind, standalone Kind |
| Market | `sds-market.ttl` | 9 | Role (4 market roles), cross-module references |
| Calendar | `sds-calendar.ttl` | 14 | SubKind (quarter types), Phase (GroundSeason), 5-way disjointness |
| Organization | `sds-organization.ttl` | 14 | 4-way org level disjointness, deep hierarchy |
| Currency | `sds-currency.ttl` | 11 | common:Currency promotion, 2 reifiers, disjoint rate types |
| Customs | `sds-customs.ttl` | 12 | 3-source cost determination, 2 reifiers |
| Delivery | `sds-delivery.ttl` | 3 | Business key, ICC standard codes |
| Market Temporal | `sds-market-temporal.ttl` | 9 | 9 temporal reifiers (RDF 1.2), SHACL Rules |
| Exceptions | `sds-exceptions.ttl` | 8 | 4 exception reifiers, shared filter shape, SPARQL detection |

## Decision Drivers

* Audience diversity: data engineers need property details; architects need pattern rationale; SMEs need business context
* Navigability: readers should find any class, pattern, or relationship within 2-3 clicks
* Diagram density: complex relationships require visual explanation; Mermaid diagrams must be integrated throughout
* Maintainability: documentation must track ontology evolution without becoming stale
* Modularity: large documentation must be split into focused files with clear cross-references
* Progressive disclosure: overview to architecture to patterns to module reference to glossary

## Considered Options

* Option 1 — Single monolithic document
* Option 2 — Per-formalism split (OWL doc, SHACL doc, SKOS doc)
* Option 3 — Hierarchical modular documentation

## Decision Outcome

Chosen option: "Option 3 — Hierarchical modular documentation", because it serves the widest audience range while keeping individual documents focused and maintainable. 22 files organized in overview, architecture, patterns, modules, reference hierarchy with consistent templates and extensive cross-linking.

### Information Architecture

```
docs/manual/sds/model/physical/ontology/
├── index.md                          # Landing page, overview, navigation map
├── architecture.md                   # Module boundaries, design principles, formalism stack
├── modules/
│   ├── index.md                      # Module comparison matrix, statistics
│   ├── country.md                    # Country module (11 classes)
│   ├── market.md                     # Market module (9 classes)
│   ├── calendar.md                   # Calendar module (14 classes)
│   ├── organization.md              # Organization module (14 classes)
│   ├── currency.md                   # Currency module (11 classes)
│   ├── customs.md                    # Customs module (12 classes)
│   ├── delivery.md                   # Delivery module (3 classes)
│   ├── market-temporal.md           # Market Temporal module (9 classes)
│   └── exceptions.md               # Exceptions module (8 classes)
├── patterns/
│   ├── index.md                     # Pattern catalog with decision rationale
│   ├── role-subkind-phase.md       # UFO-based entity classification
│   ├── business-key.md             # Cross-context join key pattern
│   ├── temporal-reification.md     # RDF 1.2 temporal modeling
│   ├── disjointness.md            # OWL+SHACL disjointness enforcement
│   └── exception-architecture.md  # Exception modeling with filter dimensions
├── frameworks/
│   ├── classification.md           # 7-facet classification (ODR-0010)
│   ├── validation.md              # SHACL 1.2 + DASH tier adoption
│   └── inferencing.md             # OWL selective inferencing (ODR-0036)
├── cross-references.md            # Module interdependency map
└── glossary.md                    # Terms, abbreviations, ODR cross-references
```

**File count:** 22
**Estimated scope:** 800-1200 lines per module page, 400-600 per pattern/framework page

### Module Page Template

Every module page follows a consistent template:

| Section | Content | Diagram |
|---------|---------|---------|
| **Header** | Module name, source file, class/property counts | — |
| **Table of Contents** | Auto-generated from headings | — |
| **Overview** | 2-3 paragraph business narrative | — |
| **Class Hierarchy** | Inheritance, roles, subkinds | `classDiagram` |
| **Classes** | Per-class: definition, 7-facet table, properties, relationships | — |
| **Property Inventory** | Complete table: name, type, cardinality, source | — |
| **Relationships** | Inter-class and cross-module connections | `graph TD` or `erDiagram` |
| **Disjointness** | `owl:AllDisjointClasses` declarations | — |
| **Cross-Module Refs** | Links to classes in other modules | — |
| **ODR References** | Governing decision records | — |

### Pattern Page Template

| Section | Content | Diagram |
|---------|---------|---------|
| **Header** | Pattern name, governing ODR, applicable modules | — |
| **Table of Contents** | Auto-generated from headings | — |
| **Problem** | What problem this pattern solves | — |
| **Solution** | How the pattern works | `classDiagram` or `graph` |
| **Examples** | Concrete SDS instances | `classDiagram` |
| **Rules** | When to apply, when not to apply | — |
| **Related Patterns** | Links to other pattern pages | — |

### Diagram Strategy

| Diagram Type | Mermaid Syntax | Purpose | Where Used |
|-------------|---------------|---------|-----------|
| Class hierarchy | `classDiagram` | Inheritance, roles, subkinds | Every module page |
| Entity relationships | `erDiagram` | Cross-module entity relationships | Architecture, cross-references |
| Module boundaries | `graph TD` | Architecture overview, module map | Index, architecture |
| Data flow | `flowchart LR` | Exception resolution, temporal assignment | Customs, exceptions, market-temporal |
| Classification | `mindmap` | 7-facet taxonomy | Classification framework |
| State | `stateDiagram-v2` | Lifecycle states, publish workflow | Validation framework |

**Density rule:** Minimum 2, maximum 5 diagrams per page.

**Fallback:** Use DOT/Graphviz via `dot-export` skill when Mermaid syntax cannot express required semantics (multiple inheritance, complex cardinality annotations).

### Cross-Referencing Strategy

* **Relative Markdown links** between all documents (e.g. `[Country module](modules/country.md)`)
* **Anchor links** to specific class sections (e.g. `country.md#hmcountry`)
* **Back-references** — module pages link to patterns they use; pattern pages link to modules that use them
* **Breadcrumb navigation** — every page opens with: `[SDS Ontology](../index.md) > [Modules](index.md) > Country`
* **See Also** sections at the bottom of every page

### Design Decisions

1. **Template consistency.** Every module page follows the same template (header, overview, class hierarchy diagram, classes, properties, relationships, disjointness, cross-references, ODR references). Readers learn the layout once.
2. **Breadcrumb navigation.** Every page opens with a breadcrumb path: `[SDS Ontology](../index.md) > [Modules](index.md) > Country`. Provides spatial orientation without a sidebar.
3. **Ontological nature annotation.** Class diagrams annotate each class with its ontological category: Kind, Role, SubKind, Phase (per ODR-0025). This bridges formal and business understanding.
4. **Diagram-first sections.** The class hierarchy diagram appears before the class-by-class detail. Readers see the forest before the trees.
5. **SHACL property tables as the reference.** Property tables derive from SHACL shapes (authoritative for cardinality, type, constraints) rather than from OWL domain/range (which is informative per ODR-0014).
6. **ODR traceability.** Every design pattern and architectural decision links to its governing ODR. Readers can trace any choice to its rationale.
7. **Glossary as navigation aid.** The glossary links every term to the page where it is defined in context. Serves as both definition list and secondary index.
8. **Mermaid default with DOT fallback.** Use Mermaid for all diagrams where its syntax suffices. Use DOT/Graphviz (via `dot-export` skill) for diagrams requiring features Mermaid lacks (multiple inheritance, complex cardinality annotations).

### Consequences

* Good, because non-technical stakeholders can navigate without ontology expertise
* Good, because each module page is independently maintainable
* Good, because patterns are documented once and referenced everywhere (DRY)
* Good, because progressive disclosure flows from overview to detail
* Good, because diagrams are embedded in context, not in a separate appendix
* Good, because there is full ODR traceability on every design decision
* Bad, because 22 files require cross-reference maintenance
* Bad, because link paths are deep from documentation root to ODR files
* Bad, because template changes must be applied across all module pages

### Confirmation

* All 91 SDS classes appear in at least one module page
* All ~120 properties appear in property inventory tables
* Every module page has minimum 2, maximum 5 Mermaid diagrams
* Every pattern page has at least 1 diagram and 2 concrete SDS examples
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

### Option 1 — Single monolithic document

One large Markdown file covering all 91 classes, properties, and patterns.

* Good, because it is simple with no cross-referencing overhead
* Bad, because 10,000+ lines is impossible to navigate
* Bad, because a module cannot be updated without touching the entire document
* Bad, because every ontology change creates merge conflicts

### Option 2 — Per-formalism split (OWL doc, SHACL doc, SKOS doc)

Three documents, one per semantic web formalism.

* Good, because it mirrors source file structure
* Bad, because it splits a single class across three documents
* Bad, because it forces readers to understand OWL vs SHACL vs SKOS
* Bad, because it violates progressive disclosure

### Option 3 — Hierarchical modular documentation

22 files organized in overview, architecture, patterns, modules, reference hierarchy with consistent templates and extensive cross-linking.

* Good, because each file is self-contained (400-1200 lines)
* Good, because there is a natural progression from high-level to detailed
* Good, because patterns and modules are separate concerns
* Good, because individual modules can be updated without touching others
* Good, because diagram-per-section keeps visuals contextual
* Bad, because cross-referencing overhead is non-trivial (mitigated: consistent link templates)
* Bad, because there is risk of link rot on restructuring (mitigated: flat directories, stable file names)

## More Information

* [ODR-0010: Multi-Faceted Classification Framework](../ontology/odr/ODR-0010-multi-faceted-classification-framework.md)
* [ODR-0011: Documentation Annotation Strategy](../ontology/odr/ODR-0011-documentation-annotation-strategy.md)
* [ODR-0014: Domain/Range as Documentation](../ontology/odr/ODR-0014-domain-range-as-documentation.md)
* [ODR-0015: Bounded Context Autonomy](../ontology/odr/ODR-0015-bounded-context-autonomy.md)
* [ODR-0021: Expert Hive Review Methodology](../ontology/odr/ODR-0021-expert-hive-review-methodology.md)
* [ODR-0022: Business Key Property](../ontology/odr/ODR-0022-business-key-property.md)
* [ODR-0025: Role/View Modeling Pattern](../ontology/odr/ODR-0025-role-view-modeling-pattern.md)
* [ODR-0027: AI-Friendly File Organization](../ontology/odr/ODR-0027-ai-friendly-file-organization.md)
* [ODR-0028b: Disjointness Enforcement](../ontology/odr/ODR-0028b-disjointness-enforcement.md)
* [ODR-0031: API Ontology Extension](../ontology/odr/ODR-0031-api-ontology-extension.md)
* [ODR-0033: RDF/SPARQL 1.2 Adoption](../ontology/odr/ODR-0033-rdf-sparql-12-adoption.md)
* [ODR-0034: SHACL 1.2 Extension Framework](../ontology/odr/ODR-0034-shacl12-extension-framework.md)
* [ODR-0035: DASH Vocabulary Adoption](../ontology/odr/ODR-0035-dash-vocabulary-adoption.md)
* [ODR-0036: SHACL Rules and OWL Inferencing](../ontology/odr/ODR-0036-shacl-rules-and-owl-inferencing.md)
* [ADR-0002: Ontology Website Information Model](ADR-ADR-ADR-0002-ontology-website-information-model.md)
* [Ontology Builder's Manual](../ontology/ontology-builders-manual.md)
* [MADR Template](https://adr.github.io/madr/)

## Expert Hive Council Review (ODR-0021, Session 46)

**Panel:** 9 standing experts + Riona MacNamara (Google, technical writing).

### Q1: Is hierarchical modular documentation the right structure for a 91-class physical ontology model?

| Expert | Position | Vote |
|--------|----------|------|
| Allemang | Mirrors Working Ontologist chapter structure; module-per-bounded-context is natural | For |
| Hendler | Web architecture: small documents with hyperlinks are discoverable and linkable | For |
| Kendall | FIBO documentation uses exactly this pattern: overview then module then class | For |
| Cagle | Matches how SHACL practitioners browse: pattern first, then per-shape detail | For |
| Gandon | Linked Data principles extend to documentation: each concept should have its own dereferenceable section | For |
| Baker | Dublin Core's namespace documentation is modular by design vocabulary; proven pattern | For |
| Davis | BBC Linked Data Platform documentation followed module-per-domain successfully at scale | For |
| Guizzardi | UFO documentation separates foundational patterns from domain applications; same principle | For |
| Guarino | DOLCE documentation is pattern-then-domain; aligns with conceptual clarity | For |
| MacNamara | Google's documentation style guide mandates progressive disclosure with modular pages; single-concept pages outperform long-scroll docs in task completion rates | For |

**Verdict: 10-0.** Unanimous.

### Q2: Should design patterns be documented separately from modules, or inline within each module page?

| Expert | Position | Vote |
|--------|----------|------|
| Allemang | Patterns are cross-cutting; duplicating them in each module violates DRY and risks drift | Separate |
| Hendler | Separate + link is canonical web architecture | Separate |
| Kendall | FIBO has a "patterns" section independent of domains; cross-references liberally | Separate |
| Cagle | SHACL patterns like NodeShape composition are documented once, referenced per use | Separate |
| Gandon | W3C Primer documents are pattern-first; specifications are reference-second | Separate |
| Baker | DCMI Application Profiles document the pattern, domain docs link to it | Separate |
| Davis | Each module page should show the pattern *applied*, with link to the canonical pattern doc | Separate with inline examples |
| Guizzardi | UFO patterns (Kind, Role, Phase) are defined once; domain models reference them | Separate |
| Guarino | Pattern identity requires single locus of documentation | Separate |
| MacNamara | Google's API docs pattern: "Concepts" section defines patterns; "Reference" section shows usage. Always separate. Include a 2-line summary and link when referencing | Separate |

**Verdict: 10-0.** Patterns documented in `patterns/`, inline summaries with links in module pages.

### Q3: What diagram types should be used, and what is the right density?

| Expert | Position | Vote |
|--------|----------|------|
| Allemang | Class diagrams for hierarchy, ER diagrams for relationships — proven in every ontology textbook | For proposed |
| Hendler | Formal semantics benefit from visual representation; 1 diagram per major concept cluster | For proposed |
| Kendall | FIBO uses UML class diagrams extensively; 1-2 per module minimum | For proposed |
| Cagle | Add mindmap for classification facets and state diagrams for lifecycle; visual diversity aids comprehension | For proposed + additions |
| Gandon | W3C specs use multiple diagram types (sequence, class, state); appropriate variety is key | For proposed |
| Baker | Standardize on 3-4 core types; too many diagram types confuses | For proposed (limit types) |
| Davis | BBC used ER + flowchart consistently; consistency beats variety | For proposed |
| Guizzardi | OntoUML stereotypes on class diagrams are essential for showing Kind/Role/Phase visually | For proposed |
| Guarino | Class diagrams must annotate ontological nature of each class | For proposed |
| MacNamara | Every section describing relationships needs a diagram. Minimum 2 per module page. Cap at 5 to prevent cognitive overload. Flowcharts for processes, class diagrams for structures, mindmaps for taxonomies | For proposed |

**Verdict: 10-0.** Use `classDiagram`, `erDiagram`, `graph`, `mindmap`, `stateDiagram`, `flowchart`. Minimum 2 diagrams per module page. Maximum 5 per page. Annotate ontological nature (Kind/Role/Phase/SubKind) on class diagrams.

**Amendment (Cagle challenge #3):** Mermaid is the default diagramming tool. Fall back to DOT/Graphviz via `dot-export` skill when Mermaid syntax cannot express the required semantics (multiple inheritance display, complex cardinality annotations on associations).

### Q4: How should cross-module relationships be documented?

| Expert | Position | Vote |
|--------|----------|------|
| Allemang | Dedicated cross-reference page + inline links in module pages | Dedicated + inline |
| Hendler | Both are needed: the graph view for architects, inline for practitioners | Dedicated + inline |
| Kendall | FIBO has explicit module dependency diagrams; essential for understanding imports | Dedicated + inline |
| Cagle | Cross-module SHACL paths need a single diagram showing property flow across modules | Dedicated + inline |
| Gandon | RDF cross-references are the whole point of linked data; document them prominently | Dedicated + inline |
| Baker | Keep the cross-reference page focused: dependency graph + property list, not prose | Dedicated + inline |
| Davis | Bidirectional linking is critical: if A references B, B must reference A | Dedicated + inline |
| Guizzardi | Cross-module relationships often reveal implicit domain assumptions; worth highlighting | Dedicated + inline |
| Guarino | The ontological commitments at module boundaries deserve special attention | Dedicated + inline |
| MacNamara | The cross-reference page serves as a system map. Every module page has a Related Resources section linking outward. Include a full module dependency diagram | Dedicated + inline |

**Verdict: 10-0.** `cross-references.md` for the system view + inline links in every module page.

### Q5: What level of technical depth is appropriate?

| Expert | Position | Vote |
|--------|----------|------|
| Allemang | Show Turtle only in expandable/collapsible sections; lead with business descriptions | Business-first |
| Hendler | Technical precision matters but should not be the entry point | Business-first |
| Kendall | FIBO documentation leads with business glossary, then drills to formal model | Business-first |
| Cagle | Show SHACL constraint tables prominently; they are the validation contract | Business-first + SHACL |
| Gandon | Lead with what-it-means, follow with how-it-is-modeled | Business-first |
| Baker | Metadata must be human-readable first; machine-readable is an implementation concern | Business-first |
| Davis | BBC found that business context is what gets documentation read; technical detail is for search | Business-first |
| Guizzardi | Ontological categories (Kind/Role/Phase) bridge business and technical; include them in class descriptions | Business-first + annotations |
| Guarino | Formal definitions serve both audiences when written clearly | Business-first |
| MacNamara | Google's API docs: Overview (business), Concepts (model), Reference (technical). Progressive disclosure within each page. Never start with the schema | Business-first + progressive |

**Verdict: 10-0.** Lead with business context and definitions. Progressive disclosure: narrative, then classification, then properties, then relationships, then validation details. Include ontological nature annotations (Kind/Role/Phase/SubKind) at class level.

### Devil's Advocate: Cagle

Cagle raised 3 challenges:

1. **"22 files for 91 classes is too many files"** — Withdrawn after MacNamara cited Google's internal findings that modular docs with consistent navigation outperform monoliths in time-to-answer. Davis added that BBC's 200+ entity documentation worked well with per-domain pages.
2. **"Pattern pages will duplicate content already in ODRs"** — Withdrawn after Kendall distinguished "ODR as decision record" from "pattern doc as implementation guide." Different audiences, different purposes. ODRs capture *why*; pattern docs show *how*.
3. **"Mermaid has rendering limitations for OWL class diagrams"** — Partially accepted. Committee agreed to note Mermaid limitations and use DOT/Graphviz fallback for diagrams requiring features Mermaid lacks. See amendment on Q3.

### Summary Verdict

| Question | Vote | Outcome |
|----------|------|---------|
| Q1: Hierarchical modular structure | 10-0 | Accepted |
| Q2: Separate pattern documentation | 10-0 | Accepted |
| Q3: Diagram types and density | 10-0 | Accepted (+ Mermaid/DOT fallback amendment) |
| Q4: Cross-module documentation | 10-0 | Accepted |
| Q5: Business-first progressive disclosure | 10-0 | Accepted |
