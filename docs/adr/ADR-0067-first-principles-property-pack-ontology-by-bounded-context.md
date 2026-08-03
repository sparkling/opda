---
status: accepted
date: 2026-08-03
tags: [ontology, property-pack, greenfield, bounded-context, common-boundary, interoperability, council, swarm, ai-assisted, skos, shacl, provenance, authorisation]
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
- Use an auditable, escalation-driven agentic authoring method without making the
  ontology corpus depend on Semantic Builder, one agent substrate or one LLM family.
- Preserve material disagreement for human resolution instead of manufacturing
  consensus through agent votes.

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

The ontology model and durable corpus are independent of Semantic Builder. The
authoring programme will nevertheless follow Semantic Builder's accepted council
configuration: ADR-0007 for cross-boundary harmonisation, ADR-0008 for typed execution
and escalation, ADR-0009 for convergence and termination, and ADR-0021 for the expert
lens pool and running protocol. These records configure how candidate models are
produced and challenged; they do not become ontology dependencies or grant an agent
authority over OPDA decisions.

Semantic Modelling ODR-0104 is deprecated and relocated to Semantic Builder ADR-0021;
it is historical provenance rather than a governing record. The earlier OPDA
ODR-0001 protocol also does not govern this greenfield programme: its voting Queen,
vote tallies and selectable consensus machinery are replaced here by the Builder
configuration's non-voting lead, independent priors, bounded cross-examination and
escalation of unresolved disagreement. Historical sessions remain part of the
evidence trail for the previous ontology, not authority for the replacement model.

AI agents and expert councils assist with evidence analysis, candidate generation and
review. They are an authoring method rather than part of the ontology's architecture
or authority. The maintained OPDA artefacts, evidence links, review state and recorded
human decisions remain the source of authority.

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

### 5. Agentic authoring and council configuration

#### 5.1 Swarm and council are different mechanisms

A swarm is the execution substrate used to route bounded work, run independent agents
and collect their artefacts. A council is a deliberation protocol used only when a
specific semantic decision warrants multiple opposed lenses. Swarm topology,
model-provider diversity, a vote tally or a Ruflo consensus primitive does not by
itself constitute an ontology council or establish semantic truth.

Every work order starts with the least costly sufficient mechanism:

1. a deterministic tool for exact extraction, normalisation, coverage and validation;
2. one typed specialist for routine bounded authoring;
3. a linked pair or small specialist panel for a known dependency;
4. an ontology council for underdetermined, high-lock-in, cross-profile or
   failed-specialist questions; and
5. the relevant OPDA working group or Interoperability Working Group when durable
   authority, contested correspondence or the common boundary is involved.

The 451 source items must therefore be grouped into evidence-backed concept packages
and bounded-context work orders. They must not be sent individually to a standing
451-item voting fleet, nor may the source paths be treated as 451 predetermined
ontology properties.

#### 5.2 Per-bounded-context creation councils

Each bounded-context working group has a creation mode that reads its own evidence and
the common boundary, proposes only within its candidate context namespace, and cannot
write into the common boundary. A creation council is convened only for a defined
semantic crux such as:

- identity criteria, kind/role/phase distinctions or class-versus-value choices;
- competing OWL, SKOS, SHACL or structured-value patterns;
- reuse of an external standard versus minting an OPDA resource;
- conflicting evidence about cardinality, lifecycle, provenance or authorisation;
- candidate bounded-context ownership; or
- failure of a single specialist to produce a defensible, validated candidate.

The available creation-council pool is drawn from Semantic Builder ADR-0021. A session
seats only the subset required for its question, normally four to six lenses including
one explicitly opposed Devil's Advocate:

| Lens | Primary contribution to OPDA modelling |
|---|---|
| Dean Allemang | Pragmatic RDF, simplest sufficient model and reuse-versus-mint. |
| Jim Hendler or Fabien Gandon | RDF/OWL semantics, web architecture and W3C conformance. |
| Elisa Kendall | Enterprise patterns, FIBO awareness and class-versus-datum choices. |
| Kurt Cagle | SHACL and the structured-value-versus-class challenge. |
| Tom Baker | Namespaces, vocabulary stewardship and SKOS. |
| Giancarlo Guizzardi | Kinds, roles, phases, relators and rigidity. |
| Nicola Guarino | Formal identity criteria and dependence. |
| Eric Evans or Vaughn Vernon | Bounded contexts and strategic domain integration. |

Guests are seated only when the question requires them: Holger Knublauch for SHACL;
Antoine Isaac or Alistair Miles for SKOS; Luc Moreau for provenance; Harshvardhan
Pandit or Renato Iannella for privacy, consent, authorisation and rights; and a
Ranganathan/ISO 25964 lens for classification and thesauri. A temporal specialist must
be selected when OWL-Time or material valid-time/recorded-time semantics are on the
docket rather than assuming that the standing pool covers that concern.

These names denote simulated, citation-grounded methodological lenses. They do not
claim the named person's participation, approval or endorsement. At least one real
working-group domain expert must review every material candidate package. The AI
panel's output is a proposal; actual domain participants own its business meaning and
OPDA governance owns adoption.

The lead is a non-voting protocol officer. It frames the propositions and disclosed
evidence, enforces scope and clean contexts, routes challenges and composes the
synthesis. It has no merit vote, no additional tally and no durable write authority.
The Devil's Advocate must be chosen because a published methodology genuinely opposes
a load-bearing premise, not merely to fill a role or because it uses another LLM.

#### 5.3 Interoperability Council

Cross-context harmonisation is a separate ownership mode, not a review of creation
councils. It begins only when two or more contexts have candidate definitions to
compare. Its primary outputs are context-map relationships and governed mappings;
promotion into the common boundary is exceptional.

The Interoperability Council draws from:

- Guarino and Guizzardi for identity, dependence and rigidity;
- Isaac or Miles for SKOS mapping semantics;
- an SSSOM mapping-set and provenance specialist;
- Evans or Vernon for DDD strategic context mapping;
- an ontology-matching or logical-coherence challenger; and
- one real domain steward from every bounded context under comparison.

Its default is **map before merge**. It keeps context-specific meanings separate when
they merely share a label, records the most defensible mapping with provenance, and
recommends common-boundary promotion only when the contexts share the same identity
criterion and stable exchange meaning. Only the Interoperability Working Group may
approve that promotion or a durable cross-context mapping.

#### 5.4 Three-round council protocol

Every council follows the Builder protocol:

1. **Independent priors.** Each lens receives a clean context, verifies load-bearing
   source facts and records its verdict and rationale before seeing peers.
2. **Bounded adversarial cross-examination.** The lead reveals the independent
   positions and Devil's Advocate challenge. First-round positions remain in the
   record; every change requires a reason; no running tally is shown. One or two
   bounded rounds sharpen or separate the alternatives rather than manufacturing
   agreement.
3. **Re-poll and escalate.** The record compares initial and revised positions.
   Persistent disagreement is an explicit output for the relevant human governance
   body. Fast unanimity, off-task convergence or unexplained position changes are
   failure signals that reopen the work.

Majority, weighted, quorum, Byzantine, Raft or other infrastructure consensus is not
an ontology decision rule. A council maps the disagreement surface; it does not vote
OPDA meaning into existence.

Each session must preserve the work order and evidence bundle, Property Pack item IDs,
bounded-context and write scope, competency questions and hard cases, independent
positions, cross-examination, reasons for changed positions, held dissents, synthesis,
deterministic validation results and the human disposition. Claims attributed to a
named lens must be grounded in a verifiable publication or standard.

#### 5.5 Multiple models and calibration

Expert-lens diversity and LLM-family diversity are separate. Opposed published lenses
provide the council's methodological variety. Different underlying LLM families may
replicate or challenge high-risk results as a robustness test, but their outputs are
not independent votes. Two providers routing the same underlying model do not create
independence.

For a cross-model comparison, the evidence snapshot, work order, tools, target law,
budget and output contract must remain fixed. Provider and model identity should be
hidden from the evaluator where practical, and every synthesized candidate must pass
the same deterministic validation and human review.

Before council use is expanded, a representative calibration set of approximately
20–30 semantically difficult Property Pack items will be run through:

1. one strong agent with the same evidence and tools;
2. typed specialists with deterministic validation; and
3. the council protocol.

The comparison records reference conformance, unsupported claims, identity and
resource-home errors, human correction effort, defensibility, reliability, latency
and cost. Council activation must demonstrate material value for the relevant work
class; otherwise the specialist path remains primary.

#### 5.6 Implementation boundary

Semantic Builder currently supplies the governing architecture, typed contracts and
configuration, but does not yet provide a production-composed ontology-build command,
active model portfolio or council executor. OPDA may run the protocol manually or on
another agent substrate, including staged fan-out when concurrency is constrained,
provided that clean first-round contexts and the required session artefacts are
preserved. This ADR makes no claim that the current Semantic Builder runtime executes
the council end to end.

### 6. Modelling and review gates

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
- Good, because routine modelling is not burdened with council ceremony, while
  high-lock-in decisions receive opposed, citation-grounded review.
- Good, because the Interoperability Council maps context meanings without becoming a
  central authority over each bounded context.
- Good, because agent convergence cannot silently replace working-group and OPDA
  governance.
- Neutral, because correct modelling may produce more or fewer than 451 ontology terms.
- Neutral, because some Property Pack items will be represented through common
  resources or relationships rather than one direct datatype property.
- Bad, because every resource-home and split/consolidation decision now requires
  explicit evidence and review.
- Bad, because the new candidate will initially diverge structurally from the current
  published ontology and legacy JSON Schemas.
- Bad, because a small common boundary and separate context meanings require ongoing
  mapping and version governance.
- Bad, because auditable council sessions require preserved evidence, independent
  positions, dissent records and human dispositions.
- Bad, because the Builder council configuration must initially be orchestrated without
  a production council executor.

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
- Every council activation is traceable to a documented escalation reason or the
  calibration experiment, and its lead has no vote or durable write authority.
- Council records preserve clean-context priors, reasons for changed positions,
  unresolved disagreement and the responsible human disposition.
- A calibrated comparison demonstrates whether a strong agent, typed specialists or a
  council is the proportionate mechanism for each modelling work class.
- No build or validation step requires Semantic Builder.
- Publication or replacement of the current website remains separately authorised.

## More Information

- [ADR-0066 — the 451 required Property Pack data points as the greenfield seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0039 — linked data as the standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0063 — proposed domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — proposed AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [Property Pack 451 evidence validation](../research/property-pack-451-evidence-validation.md)
- [ODR-0071 — Ontology Modelling Category Framework](https://github.com/hm-group/semantic-modelling/blob/main/docs/ontology/odr/ODR-0071-ontology-modelling-category-framework.md)
- [Semantic Builder ADR-0007 — Cross-boundary harmonisation council](https://github.com/hm-group/semantic-builder/blob/main/docs/adr/ADR-0007-cross-boundary-harmonisation-council.md)
- [Semantic Builder ADR-0008 — Council architecture](https://github.com/hm-group/semantic-builder/blob/main/docs/adr/ADR-0008-council-architecture.md)
- [Semantic Builder ADR-0009 — Council convergence and termination](https://github.com/hm-group/semantic-builder/blob/main/docs/adr/ADR-0009-council-convergence-and-termination.md)
- [Semantic Builder ADR-0021 — Council roster and running protocol](https://github.com/hm-group/semantic-builder/blob/main/docs/adr/ADR-0021-council-of-experts.md)
- [Semantic Builder implementation reality audit](https://github.com/hm-group/semantic-builder/blob/main/docs/reviews/semantic-builder-implementation-reality-audit-2026-08-03.html)

## Amendments

- **2026-08-03 — Accepted by operator.** The operator selected a first-principles,
  Property-Pack-scoped ontology; rejected a Semantic Builder dependency and the five
  non-OPDA ODR-0071 concerns; retained authorisation and the other nine concerns; and
  required every OPDA-defined resource to live in one bounded context or the common
  boundary.
- **2026-08-03 — Builder council configuration adopted.** The operator required this
  programme to follow Semantic Builder's accepted execution, roster, harmonisation and
  termination configuration; deprecated Semantic Modelling ODR-0104 remains historical
  provenance. The ontology remains runtime-independent, the lead does not vote,
  councils are escalation-driven, unresolved disagreement goes to human governance,
  and common-boundary promotion remains the Interoperability Working Group's decision.
