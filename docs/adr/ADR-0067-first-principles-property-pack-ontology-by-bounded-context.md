---
status: accepted
date: 2026-08-03
tags: [ontology, property-pack, greenfield, bounded-context, common-boundary, interoperability, skos, shacl, provenance, authorisation]
supersedes: []
depends-on: [ADR-0039, ADR-0066]
implements: []
---

# Model the Property Pack from first principles with bounded-context ownership

## Context and Problem Statement

ADR-0066 fixes the initial coverage boundary for the new ontology at the 451 data
points marked `Required` in the Property Pack workbook. It deliberately leaves their
semantic treatment unresolved. A source path or JSON datatype does not decide whether
a data point represents a resource, relationship, attribute, classification, rule or
controlled value.

The previous ontology was generated from JSON Schemas and form overlays. That work is
useful evidence, but it inherited document-tree structure, uneven definitions and
form-support decisions that were never established as domain meaning. Repairing that
model in place, or allowing its classes and predicates to seed the replacement, would
carry those assumptions into the new work.

The sibling `semantic-modelling` project provides a broader fourteen-category ontology
model in ODR-0071. It was designed for a source-code extraction pipeline and therefore
contains concerns that do not belong in this OPDA model, including process modelling,
service and enterprise architecture, capability modelling, source-to-ontology mappings
and data-product packaging. It also contains concerns OPDA does need, including domain
structure, vocabularies, governance, validation, provenance, time, sensitivity and
authorisation.

The Property Pack is not itself a bounded context. It is a delivery profile that draws
on meanings owned in several domain contexts. OPDA therefore also needs a firm rule for
where each modelled resource belongs, how genuinely shared concepts enter the common
boundary, and how different context-specific meanings remain connected without being
collapsed.

This ADR decides the target architecture for the first greenfield Property Pack
ontology. It does not author the ontology or publish a replacement for the current
website.

## Decision Drivers

- Cover every one of the 451 required Property Pack data points without turning the
  workbook or JSON tree into the ontology structure.
- Model identity and meaning from first principles, evidence and established domain
  practice.
- Give every OPDA-defined resource one accountable semantic home.
- Preserve legitimate differences between bounded contexts while making exchange
  explicit.
- Keep governance, provenance, validation, time, sensitivity and authorisation as
  first-class modelling concerns.
- Reuse established linked-data standards instead of inventing OPDA equivalents.
- Keep legacy artefacts available as attributed evidence without granting them
  semantic authority or allowing them to expand the closed Property Pack scope.
- Avoid coupling the ontology to Semantic Builder or to any particular agentic
  implementation.

## Considered Options

- **Option A — Repair and extend the existing schema-derived ontology.** Improve its
  terms and definitions while retaining its resource and relationship structure.
- **Option B — Adopt the complete ODR-0071 pipeline model and Semantic Builder.** Use
  all fourteen categories and the source-extraction architecture that motivated them.
- **Option C — Model the 451-item scope from first principles, adopt only the relevant
  ODR-0071 concerns, and assign every resource to a bounded context or the common
  boundary (chosen).**

## Decision Outcome

Chosen option: **Option C — a first-principles, context-owned ontology constrained by
the 451-item Property Pack coverage boundary.**

The ontology will be designed afresh. The 451 required Property Pack items determine
what the initial model must be able to represent; they do not determine its classes,
predicates, nesting, identities or number of ontology terms. One item may require
several semantic constructs, and several items may be represented by one well-founded
construct. No source item may disappear without an explicit coverage disposition.

The ontology model is independent of Semantic Builder. AI agents and expert councils
may assist with evidence analysis, candidate generation and review, but they are an
authoring method rather than part of the ontology's architecture or authority. The
maintained OPDA artefacts, evidence links, review state and recorded decisions remain
the source of authority.

### 1. Evidence hierarchy and scope guard

The evidence hierarchy for this work is:

1. **Property Pack coverage authority** — the 451 required source-item IDs define the
   closed initial business-data scope.
2. **Domain evidence** — working-group material, recognised standards, legislation,
   common industry practice and expert review establish candidate meaning.
3. **Legacy OPDA evidence** — the existing ontology, business glossary, data
   dictionary, JSON Schemas, mappings and form overlays may explain history, expose
   implementation expectations and support migration analysis.
4. **Generated proposals** — AI-produced definitions, classifications and model
   structures remain candidates until reviewed under OPDA governance.

Legacy material must never silently introduce an optional field, overlay concern,
resource, relationship, cardinality or vocabulary into the new business-data scope.
It may be cited when it supports a decision about one or more of the 451 items.

Modelling from first principles may introduce the classes, relationships, policy
concepts and other scaffolding required to represent the 451 items correctly. Every
new business construct must trace to one or more Property Pack source-item IDs. A
supporting technical or governance construct that is not itself a Property Pack item
must trace to a retained modelling concern, a named standard and a documented need; it
must not enlarge the Property Pack's business-data scope.

### 2. Resource-home rule

Every OPDA-defined ontology resource must have exactly one semantic home:

- one of the six property bounded contexts: **Finance and Banking**,
  **Conveyancing**, **Estate Agency**, **Surveying and Valuation**,
  **Property Data Services**, or **Property Technology**;
- the **DBT Smart Data scheme context**, where the resource expresses scheme-level
  trust, consent, authorisation or participation semantics rather than property-domain
  meaning; or
- the deliberately small **common boundary**, governed by the Interoperability Working
  Group.

This home rule applies to OPDA-minted classes, properties, relationships, shapes,
vocabulary schemes and concepts. An externally governed resource keeps its external
home; OPDA records which context reuses it and any local constraint or mapping.
Semantic home records definition ownership and governance; it does not require a
namespace per context or prevent one resource from being used by several contexts.

Each Property Pack source item receives one candidate semantic home—one context or the
common boundary—and may name additional consuming contexts. Usage by several contexts
does not automatically move a resource into the common boundary. A resource enters the
common boundary only when multiple contexts require the same identity criterion and
stable exchange meaning, and the Interoperability Working Group approves that shared
definition.

Where the same label has materially different meanings in different contexts, the
contexts keep distinct resources and the Interoperability Working Group records the
relationship between them. Cross-context mappings connect meanings; they do not force
one context to adopt another context's internal model.

The common boundary is therefore an explicit semantic home, not a miscellaneous
shared folder or a default for unresolved ownership.

### 3. ODR-0071 adoption profile

ODR-0071 is adopted as a taxonomy of modelling concerns, not as a wholesale pipeline
architecture. OPDA retains nine of its fourteen categories:

| # | ODR-0071 concern | OPDA decision | Application to the Property Pack ontology |
|---:|---|---|---|
| 1 | Domain Structure | **Retain** | Resources, identity, classes, relationships, attributes and documentary OWL structure. |
| 2 | Vocabulary & Taxonomy | **Retain** | Business terms, labels, definitions, controlled vocabularies and broader/narrower taxonomies using SKOS. |
| 3 | Process Modelling | **Exclude** | Operational workflows and BPMN are outside this domain-model scope. |
| 4 | Service Architecture | **Exclude** | Applications, interfaces and enterprise/service architecture are implementation concerns. |
| 5 | Classification Metadata | **Retain** | Subject, status, lifecycle, regulatory relevance and stewardship classifications. |
| 6 | Governance & Compliance | **Retain** | Ownership, stewardship, approval, obligations, regulatory basis and auditability. |
| 7 | Validation & Constraints | **Retain** | SHACL shapes for agreed cardinality, datatype, value and cross-field rules. |
| 8 | Cross-Domain Mappings | **Retain** | The DDD context map and governed mappings between context-owned resources and vocabularies. |
| 9 | Provenance & Quality | **Retain, adapted** | Source, attribution, derivation, confidence, currency and quality evidence; not limited to source-code extraction. |
| 10 | Temporal State & History | **Retain** | Valid time, recorded time, state, version and change history where the 451-item semantics require them. |
| 11 | Access Control & Data Sensitivity | **Retain** | Sensitivity, personal data, purpose, consent, retention, access roles and **authorisation** semantics. |
| 12 | Capability & Intent | **Exclude** | Goals, capabilities, KPIs and enterprise intent belong to strategy and architecture work. |
| 13 | Source Mapping | **Exclude** | RML/R2RML mappings from code, databases or legacy schemas are migration artefacts, not part of the greenfield domain model. |
| 14 | Data Product | **Exclude** | Product packaging, ports and operational lifecycle are delivery concerns; the Property Pack remains a profile over the domain models. |

The nine retained categories are a completeness check, not a demand for nine separate
ontology files. For practitioner review they may continue to be presented as the
eleven OPDA lenses already used in the working-group material: controlled vocabulary
and taxonomy are shown separately, and the common boundary is shown explicitly beside
cross-domain mappings. That presentation does not add new formal categories.

The access-control category models the meaning of sensitivity, consent, roles,
purposes and authorisation. It does not by itself implement a runtime security system
or grant access to data.

Coverage links from Property Pack source-item IDs to model constructs are requirements
traceability and provenance. They are not executable RML/R2RML source mappings and do
not reinstate Category 13.

### 4. Required semantic package

The first candidate must keep the following outputs aligned:

- the context-owned RDF/OWL domain ontologies and small common-boundary ontology;
- a plain-language business glossary;
- a data dictionary tied to the 451 source items;
- SKOS controlled vocabularies and taxonomies;
- SHACL data shapes and validation rules;
- the DDD context map and cross-domain mappings;
- governance, provenance, quality, temporal, sensitivity and authorisation metadata;
- a coverage matrix from all 451 source-item IDs to their semantic home and resulting
  semantic constructs.

Generated JSON Schemas, forms, documentation and other familiar representations may
be produced from the governed model later. They are projections of the semantic
agreement and must not become independent sources of meaning.

### 5. Modelling and review gates

Before the first ontology candidate is eligible for working-group review:

1. all 451 source items have an explicit candidate semantic home;
2. every proposed OPDA resource has exactly one home and evidence for that choice;
3. every proposed business resource or rule traces to at least one source-item ID;
4. every supporting construct traces to a retained concern and named standard;
5. every source item maps to one or more model constructs, or has an explicit unresolved
   or challenged disposition—never silent omission;
6. candidate definitions clearly distinguish evidence, machine drafting and human
   approval;
7. common-boundary candidates have a multi-context justification and are reviewed by
   the Interoperability Working Group;
8. context mappings preserve local meaning and avoid unjustified `owl:sameAs` or
   premature merging;
9. the nine retained concerns each have a recorded disposition: `model here`, `reuse
   shared`, `boundary contribution`, or `not applicable` with rationale;
10. the five excluded concerns have not re-entered the ontology by accident;
11. SHACL and catalogue validation pass, with conditional requiredness and repeatable
    structures preserved rather than flattened; and
12. no legacy path, nesting decision, predicate or definition has been adopted without
    an attributable semantic decision.

The field-to-term identity, split/consolidation rules and final context assignments
must still be ratified in the fresh ontology decision record required by ADR-0066
before any semantic release. This ADR supplies that work with its architectural
constraints; it does not pre-approve the resulting ontology terms.

### Consequences

- Good, because the new model is accountable to a finite, stakeholder-recognisable
  scope without copying the JSON document tree.
- Good, because every resource has a named semantic owner and cross-context differences
  can remain explicit.
- Good, because the common boundary stays small and governed rather than becoming a
  universal property model.
- Good, because authorisation, privacy, provenance, quality, time and validation remain
  first-class even though process, enterprise architecture and source mapping are out
  of scope.
- Good, because the existing ontology, glossary and dictionary remain useful evidence
  without controlling the new design.
- Good, because ontology authoring can use agentic assistance without a dependency on
  Semantic Builder or one LLM implementation.
- Neutral, because correct modelling may produce more or fewer than 451 ontology terms.
- Neutral, because some Property Pack items will be represented through common
  resources or relationships rather than one direct datatype property.
- Bad, because every resource-home and split/consolidation decision now requires
  explicit evidence and review.
- Bad, because the new candidate will initially diverge structurally from the current
  published ontology and legacy JSON Schemas.
- Bad, because a small common boundary and separate context meanings require ongoing
  mapping and version governance.

### Confirmation

- ADR-0066's deterministic catalogue continues to report exactly 451 required source
  items.
- A generated coverage report accounts for every source-item ID and flags duplicate,
  missing and unresolved dispositions.
- A resource register demonstrates exactly one home for every OPDA-defined resource.
- The Interoperability Working Group reviews every common-boundary term and every
  cross-context mapping before release-candidate status.
- Each bounded context can review its glossary, dictionary, model diagrams,
  vocabularies and constraints without needing to edit RDF or JSON Schema.
- The ontology and SHACL corpus pass the project's deterministic validation gates.
- A provenance audit can distinguish Property Pack source facts, external standards,
  legacy OPDA evidence, AI-generated proposals and human approvals.
- No build or validation step requires Semantic Builder.
- Publication or replacement of the current website remains separately authorised.

## More Information

- [ADR-0066 — the 451 required Property Pack data points as the greenfield seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0039 — linked data as the standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0063 — proposed domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — proposed AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [Property Pack 451 evidence validation](../research/property-pack-451-evidence-validation.md)
- [ODR-0071 — Ontology Modelling Category Framework](https://github.com/hm-group/semantic-modelling/blob/main/docs/ontology/odr/ODR-0071-ontology-modelling-category-framework.md)

## Amendments

- **2026-08-03 — Accepted by operator.** The operator selected a first-principles,
  Property-Pack-scoped ontology; rejected a Semantic Builder dependency and the five
  non-OPDA ODR-0071 concerns; retained authorisation and the other nine concerns; and
  required every OPDA-defined resource to live in one bounded context or the common
  boundary.
