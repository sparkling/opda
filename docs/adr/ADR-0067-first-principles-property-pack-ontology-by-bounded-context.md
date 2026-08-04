---
status: accepted
date: 2026-08-03
updated: 2026-08-04
tags: [ontology, property-pack, greenfield, bounded-context, common-boundary, interoperability, governance, council, ai-assisted, model-routing, source-security, release, skos, shacl, provenance, authorisation]
supersedes: []
depends-on: [ADR-0039, ADR-0066]
implements: [config/calibration/property-pack-v1.json, scripts/property-pack-calibration.mjs, scripts/property_pack_candidate.py, src/data/property-pack/candidate-model, source/03-standards/ontology-candidates/property-pack/0.1, src/pages/modelling/property-pack.astro]
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
structure, vocabularies, validation, provenance, time, sensitivity and authorisation.

The Property Pack is not itself a bounded context. It is a delivery profile that draws
on meanings owned in several domain contexts. OPDA therefore also needs a firm rule for
where each modelled resource belongs, how genuinely shared concepts enter the common
boundary, and how different context-specific meanings remain connected without being
collapsed.

This ADR decides the target architecture for the first greenfield Property Pack
ontology. Its implementation may generate isolated review candidates; it neither approves
their meaning nor publishes a replacement for the current website.

## Decision Drivers

- Cover every one of the 451 required Property Pack data points without turning the
  workbook or JSON tree into the ontology structure.
- Model identity and meaning from first principles, evidence and established domain
  practice.
- Give every OPDA-defined resource one accountable semantic home.
- Preserve legitimate differences between bounded contexts while making exchange
  explicit.
- Keep provenance, validation, time, sensitivity and authorisation as first-class
  modelling concerns.
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

The ontology model and durable corpus are independent of Semantic Builder. The authoring
programme nevertheless adopts a pinned OPDA execution profile over Semantic Builder's
accepted contracts for workcells, model routing, source isolation, candidate branches,
deterministic conformance, councils, authority and releases. These contracts govern how
candidate models are produced and challenged; they do not become ontology dependencies
or grant an agent authority over OPDA decisions.

Semantic Modelling ODR-0104 is deprecated and relocated to Semantic Builder ADR-0021; it
is historical provenance rather than a governing record. The earlier OPDA ODR-0001
protocol also does not govern this greenfield programme: its voting Queen, vote tallies
and selectable consensus machinery are replaced here by the Builder configuration's
non-voting lead, independent priors, bounded cross-examination and escalation of
unresolved disagreement. Historical sessions remain evidence, not authority.

AI agents and expert councils assist with evidence analysis and candidate generation;
they have no vote or ontology authority. Deterministic tools certify conformance, while
real domain participants judge meaning and recorded OPDA decisions remain authoritative.

OPDA authority follows its Constitution and Articles: the General Assembly is the
overall decision-making body; the Executive Committee oversees the Trust Framework and may
delegate work; and the directors retain management and delegation powers. Within that chain,
the affected domain working group reviews local meaning; the Interoperability Working Group
reviews common-boundary terms and mappings without overriding local meaning; Technical Review
applies change and conformance controls, with Compliance and Risk input for major or sensitive
changes; and only the Executive Committee, Board or a recorded delegate may authorise promotion.

The current PDTF governance SOP is the process baseline, not a complete release charter:
its placeholders, working-group decision rules, conflicts, appeals and final release
delegation still require recorded approval. Until ratified, outputs remain non-normative
candidates: AI agreement, informal consensus or validation cannot authorise release alone.

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
supporting technical construct that is not itself a Property Pack item must trace to a
retained modelling concern, a named standard and a documented need; it must not enlarge
the Property Pack's business-data scope.

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
Semantic home records definition responsibility; it does not require a namespace per
context or prevent one resource from being used by several contexts.

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
architecture. OPDA retains eight of its fourteen categories:

| # | ODR-0071 concern | OPDA decision | Application to the Property Pack ontology |
|---:|---|---|---|
| 1 | Domain Structure | **Retain** | Resources, identity, classes, relationships, attributes and documentary OWL structure. |
| 2 | Vocabulary & Taxonomy | **Retain** | Business terms, labels, definitions, controlled vocabularies and broader/narrower taxonomies using SKOS. |
| 3 | Process Modelling | **Exclude** | Operational workflows and BPMN are outside this domain-model scope. |
| 4 | Service Architecture | **Exclude** | Applications, interfaces and enterprise/service architecture are implementation concerns. |
| 5 | Classification Metadata | **Retain** | Subject, status, lifecycle and regulatory-relevance classifications. |
| 6 | Governance & Compliance | **Exclude** | OPDA standards governance remains in ADRs, operating procedures and decision records rather than the property ontology. |
| 7 | Validation & Constraints | **Retain** | SHACL shapes for agreed cardinality, datatype, value and cross-field rules. |
| 8 | Cross-Domain Mappings | **Retain** | The DDD context map and governed mappings between context-owned resources and vocabularies. |
| 9 | Provenance & Quality | **Retain, adapted** | Source, attribution, derivation, confidence, currency and quality evidence; not limited to source-code extraction. |
| 10 | Temporal State & History | **Retain** | Valid time, recorded time, state, version and change history where the 451-item semantics require them. |
| 11 | Access Control & Data Sensitivity | **Retain** | Sensitivity, personal data, purpose, consent, retention, access roles and **authorisation** semantics. |
| 12 | Capability & Intent | **Exclude** | Goals, capabilities, KPIs and enterprise intent belong to strategy and architecture work. |
| 13 | Source Mapping | **Exclude** | RML/R2RML mappings from code, databases or legacy schemas are migration artefacts, not part of the greenfield domain model. |
| 14 | Data Product | **Exclude** | Product packaging, ports and operational lifecycle are delivery concerns; the Property Pack remains a profile over the domain models. |

The eight retained categories are a completeness check, not a demand for eight separate
ontology files. Working-group presentation lenses are not formal ontology categories.
Governance remains an operating concern for authoring, review and release, but is not an
ontology output or a source of property-domain terms.

The access-control category models the meaning of sensitivity, consent, roles,
purposes and authorisation. It does not by itself implement a runtime security system
or grant access to data.

Coverage links from Property Pack source-item IDs to model constructs are requirements
traceability and provenance. They are not executable RML/R2RML source mappings and do
not reinstate Category 13.

### 4. Required semantic package

The first candidate must keep the following outputs aligned:

- the context-owned RDF 1.2 and OWL 2 domain ontologies and small common-boundary ontology;
- a plain-language business glossary;
- a data dictionary tied to the 451 source items;
- SKOS controlled vocabularies and taxonomies;
- SHACL 1.2 data shapes and validation rules;
- the DDD context map and cross-domain mappings;
- provenance, quality, temporal, sensitivity and authorisation metadata;
- a coverage matrix from all 451 source-item IDs to their semantic home and resulting
  semantic constructs.

Generated JSON Schemas, forms, documentation and other familiar representations may
be produced from the governed model later. They are projections of the semantic
agreement and must not become independent sources of meaning.

### 5. Semantic Builder execution profile

The reference baseline is Semantic Builder commit
`b64e4288bc07277198abad83bd7978db5c938b6b`. OPDA inherits behaviour, not a binary
dependency:

| Builder contract | OPDA adoption |
|---|---|
| ADR-0003/0008/0009 — typed mechanisms, one kernel, escalation and termination | Adopt the tool → specialist → small panel → council → human ladder and preserve unresolved disagreement. |
| ADR-0007/0021 — harmonisation and expert-council protocol | Adopt the lens pool, non-voting lead, genuine Devil's Advocate, clean priors, bounded cross-examination and separate cross-context council. |
| ADR-0011 — every source is untrusted data | Adopt source/control separation, screening, quarantine, provenance and taint through derived candidates. |
| ADR-0006 plus the model-portfolio manifests — role-aware routing | Adopt exact route identity, independence groups, frozen task envelopes, qualification, expiry and no silent fallback. |
| ADR-0026 — branchable candidates and separated promotion authority | Adopt isolated candidate branches/deltas; agents cannot mutate or promote the accepted corpus. |
| ADR-0039 — replaceable orchestration and memory | Adopt swarms, retrieval and memory only as disposable coordination/context capabilities, never ontology or citation authority. |
| ADR-0040/0041 — exact graph context and deterministic conformance | Target RDF 1.2, SPARQL 1.2 and SHACL 1.2 with pinned standards/tool profiles, explicit conformance levels, semantic feature probes, complete coverage states and fail-closed validation. |
| ADR-0012 — stable releases over a living corpus | Adopt immutable releases, ontology-aware compatibility, deprecation/supersession and a machine-readable change record. |

This ADR does **not** import the complete fourteen-category target, code-analysis and RML
pipeline, Data Product packaging, H&M-specific governance bodies or role names, gold/training/
Darwin machinery, unattended autonomy, exact Jena version, signed-ledger implementation or
deployment topology. Excluding those mechanisms does not exclude OPDA governance. Semantic
Builder's Fable/Sol **build-collaboration** policy is not an ontology-runtime model policy.

#### 5.1 Bounded work orders and untrusted evidence

The 451 items are grouped into evidence-backed concept packages, not treated as 451
predetermined ontology properties. Each immutable work order records its item IDs,
candidate semantic home, allowed read/write graphs, evidence snapshot and citations,
retained concerns, target standards profile, competency questions and hard cases,
chosen mechanism, model route and budget, expected outputs, validation plan and human
decision owner.

All uploaded files, emails, transcripts, standards, spreadsheets, schemas and legacy
artefacts are untrusted **data**, even when supplied by OPDA. They enter prompts only as
delimited evidence with source identity, media type, digest, source span and limits;
they cannot select instructions, tools, models, policy or destinations. Baseline checks
cover decoding, secrets, personal/prohibited data, instruction-like content, archives,
licensing and resource limits. Findings are quarantined for human disposition rather
than silently obeyed or discarded. Source provenance and taint follow every derivative.

Agents write only a candidate delta in an isolated workspace. They receive no authority
to edit the accepted corpus, common boundary, policy, evaluator or release. Initially,
reviewed Git history and recorded OPDA approval remain the durable authority; stronger
ledger, signing and fencing mechanics need their own implementation ADR.

#### 5.2 Agents, reviews and councils

Every work order uses the least costly sufficient mechanism:

1. deterministic tools for extraction, normalisation, coverage, graph queries and validation;
2. one typed specialist for routine bounded authoring;
3. a linked pair or small panel for a known dependency;
4. a council only for underdetermined, high-lock-in, cross-profile or failed-specialist cases; and
5. the responsible working group or Interoperability Working Group for durable meaning.

The initial typed roles are evidence reader, ontology router, ontology author,
conformance repairer and council panellist. OPDA excludes Builder's Category-13 source
mapper and any generic model judge: deterministic gates assess conformance, while
domain experts and OPDA governance judge meaning and promotion.

There is no generic AI "quality reviewer" and no second council over every result.
Verification consists of deterministic conformance, targeted evidence-based challenge,
real domain review and the distinct cross-context harmonisation concern. Review agents
may flag contradictions, unsupported claims, likely duplication and impact; they cannot
certify truth or overrule human governance.

A creation council seats only the four to six ADR-0021 lenses needed for a named crux,
such as identity, class-versus-value, reuse-versus-mint, constraints, lifecycle,
provenance, authorisation or context ownership. Specialist guests cover SHACL, SKOS,
PROV-O, DPV/ODRL, classification or time when required. Named experts are simulated,
citation-grounded methodological lenses—not claims of participation or endorsement—and
at least one real domain expert reviews every material package.

The lead is a non-voting protocol officer. The Devil's Advocate is selected because a
published methodology genuinely opposes a load-bearing premise, never because it uses
another provider. Councils preserve: R1 clean-context independent priors; R2 bounded
cross-examination with reasons for every change and no visible tally; and R3 re-poll,
held dissent and escalation. Infrastructure consensus and model agreement never decide
ontology meaning.

The Interoperability Council is a separate ownership mode, not a creation-model review.
It compares two or more context candidates using identity, SKOS/SSSOM and DDD lenses,
plus the affected human domain stewards. Its default is **map before merge**; only the
Interoperability Working Group may approve durable mappings or common-boundary promotion.

#### 5.3 Role-aware multi-model routing

Semantic Builder defines the portfolio roles and a **provisional development roster**; its manifest labels that roster `development-hypotheses` and its catalogue marks the named routes
unavailable pending refresh and its prices as placeholders. OPDA therefore adopts that design,
but pins an active OPDA roster before the first governed run. `claude-fable-5` through Claude
Code and `gpt-5.6-sol` through Codex/ChatGPT are the first routes to qualify. Routine work uses
one role-qualified route; high-risk, uncertain or calibration work uses both model families
under one work order, followed by blinded comparison and whole-candidate revalidation.

Expert-lens diversity and model-family diversity remain separate: opposed published
lenses create methodological variety; providers provide a robustness check. A model
route receives no vote. Role qualification records the exact provider, model and
returned identity; underlying independence group; supported context and structured
output; privacy/residency; latency/cost; evidence; reviewer and expiry. Mutable aliases,
automatic routing and silent model/provider fallback are inadmissible evidence routes.

An outage may produce a clearly marked single-route draft, but cannot satisfy a
dual-evidence gate. Replacement or changed routes require requalification. Calibration
will assign champion, least-cost routine, independent challenger and declared fallback
per role; it will not hard-code provider specialisms before measurement.

#### 5.4 Deterministic validation, promotion and releases

Agents may propose RDF 1.2, SKOS, SHACL 1.2 and repairs; they never run, suppress or certify the
validation gate. A trusted deterministic attempt pins the candidate, base graph,
standards/tool profile, applicable OPDA concerns and evidence, then parses RDF 1.2, checks
write scope and provenance, builds the exact graph view, runs SHACL 1.2, OWL 2, SPARQL 1.2 and
competency queries, and seals the results. Each required validation cell is one of
`pass`, `fail`, `not-applicable`, `not-run` or `infrastructure-error`; missing output,
unsupported semantics or an empty report cannot become `pass`.

The standards family is RDF 1.2, SPARQL 1.2 and SHACL 1.2. Each candidate declares the exact
conformance level it actually uses and tests: the initial Property Pack candidate uses valid
RDF 1.2 Basic syntax, targets SHACL 1.2 Core, and tests a portable SPARQL 1.2 subset. Full RDF
1.2 and the SHACL 1.2 Union Profile are not claimed until a qualified engine and positive and
negative feature probes demonstrate them. Jena/Fuseki is an implementation, not the standards
boundary; unsupported or inert required behaviour blocks the run. Six excluded concerns are
predeclared `not-applicable`.

Only a human disposition authorised through the OPDA authority chain above can move a
validated candidate into the governed corpus. Published releases are immutable named
cuts. Later changes supersede rather than rewrite history, classify compatibility for
generated schemas and other consumers, retain deprecated terms for a declared window,
and emit a machine-readable change record. Publication remains separately authorised.

#### 5.5 Calibration and implementation boundary

The calibration harness pins 24 difficult Property Pack items across eight cases and compares
the GPT and Claude routes under the same evidence contract. It measures
conformance, unsupported claims, identity/resource-home errors, human correction,
defensibility, reliability, latency and cost. Councils remain escalation-driven unless
they demonstrate material value for the work class.

The first dual-provider execution produced all 16 case candidates and divergent fingerprints
for every pair, but remains `incomplete`: Claude returned an attested model identity, the Codex
CLI exposed only the requested route, and semantic RDF/SHACL validation was not run inside that
calibration. The result is evidence for human disposition, not a route qualification or winner.

Semantic Builder has substantial typed contracts and tested foundations but no
production-composed ontology-build command, qualified active runtime portfolio or
council executor. OPDA may initially orchestrate this profile manually or through
another substrate, provided work-order isolation, route/evidence receipts, clean priors,
deterministic validation and human authority are preserved. No OPDA build or validation
step may require Semantic Builder to be running.

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
9. the eight retained concerns each have a recorded disposition: `model here`, `reuse
   shared`, `boundary contribution`, or `not applicable` with rationale;
10. the six excluded concerns have not re-entered the ontology by accident;
11. every evidence snapshot has passed the source-policy boundary and retains source,
    digest, span and taint through its candidate derivatives;
12. every model-produced candidate records its exact route and work-order binding, and
    no agent has written directly to an accepted or common graph;
13. the deterministic validation matrix has no required `fail`, `not-run` or
    `infrastructure-error`, with conditional and repeatable structures preserved; and
14. no legacy path, nesting decision, predicate or definition has been adopted without
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
- Good, because OPDA reuses Semantic Builder's work-order, routing, isolation,
  conformance and release contracts without making its corpus depend on that runtime.
- Good, because uploaded evidence cannot become agent control and AI-generated changes
  remain isolated proposals until deterministic checks and human approval.
- Good, because routine modelling is not burdened with council ceremony, while
  high-lock-in decisions receive opposed, citation-grounded review.
- Good, because the Interoperability Council maps context meanings without becoming a
  central authority over each bounded context.
- Good, because agent convergence cannot silently replace working-group and OPDA
  governance.
- Good, because immutable releases and explicit compatibility changes give generated
  schemas and other consumers a stable surface.
- Neutral, because correct modelling may produce more or fewer than 451 ontology terms.
- Neutral, because some Property Pack items will be represented through common
  resources or relationships rather than one direct datatype property.
- Bad, because every resource-home and split/consolidation decision now requires
  explicit evidence and review.
- Bad, because the new candidate will initially diverge structurally from the current
  published ontology and legacy JSON Schemas.
- Bad, because a small common boundary and separate context meanings require ongoing
  mapping and version governance.
- Bad, because screening, immutable work orders, route qualification, candidate
  isolation, validation receipts and release records add operational work.
- Bad, because the inherited Builder profile must initially be orchestrated without a
  production council executor.

### Confirmation

- ADR-0066's deterministic catalogue continues to report exactly 451 required source
  items.
- A generated coverage report accounts for every source-item ID and flags duplicate,
  missing and unresolved dispositions.
- A resource register demonstrates exactly one home for every OPDA-defined resource.
- The Interoperability Working Group reviews every common-boundary term and every cross-context mapping before release-candidate status.
- Each bounded context can review its glossary, dictionary, model diagrams, vocabularies and constraints without needing to edit RDF or JSON Schema.
- The ontology and SHACL corpus pass the project's deterministic validation gates.
- A provenance audit can distinguish Property Pack source facts, external standards,
  legacy OPDA evidence, AI-generated proposals and human approvals.
- Adversarial source fixtures cannot select instructions, tools, models, policy or destinations, and quarantined evidence cannot reach a candidate unnoticed.
- Model receipts identify the actual provider, family and route; high-risk comparison
  uses independent families, and no silent fallback counts as evidence.
- Every council activation is traceable to a documented escalation reason or the
  calibration experiment, and its lead has no vote or durable write authority.
- Council records preserve clean-context priors, reasons for changed positions,
  unresolved disagreement and the responsible human disposition.
- A calibrated comparison demonstrates whether a strong agent, typed specialists or a
  council is the proportionate mechanism for each modelling work class.
- Only recorded human authority can promote a validated candidate; releases are
  immutable, and later changes carry compatibility, supersession and deprecation data.
- No build or validation step requires Semantic Builder.
- Publication or replacement of the current website remains separately authorised.

## More Information

- [ADR-0066 — the 451 required Property Pack data points as the greenfield seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0039 — linked data as the standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0063 — proposed domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — proposed AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [OPDA Constitution](../../source/01-organisation/constitution-and-policies/OPDA%20Constitution%202026.pdf) and [Articles of Association](../../source/01-organisation/constitution-and-policies/Articles%20of%20Association%202026.pdf)
- [PDTF technical governance process](../../source/03-standards/trust-framework/docs/governance.md) and [website status summary](../../src/pages/governance/index.astro)
- [Property Pack 451 evidence validation](../research/property-pack-451-evidence-validation.md)
- [ODR-0071 — Ontology Modelling Category Framework](https://github.com/hm-group/semantic-modelling/blob/main/docs/ontology/odr/ODR-0071-ontology-modelling-category-framework.md)
- [Pinned Semantic Builder baseline](https://github.com/hm-group/semantic-builder/tree/b64e4288bc07277198abad83bd7978db5c938b6b)
- Builder [ADR-0003 — typed agent topology](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0003-reasoner-agent-topology.md) and [ADR-0006 — model routing](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0006-model-layer-routing-hosting-specialization.md)
- Builder [ADR-0007 — harmonisation](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0007-cross-boundary-harmonisation-council.md), [ADR-0008 — escalation](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0008-council-architecture.md), [ADR-0009 — termination](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0009-council-convergence-and-termination.md) and [ADR-0021 — expert protocol](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0021-council-of-experts.md)
- Builder [ADR-0011 — untrusted sources](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0011-reasoner-security-posture.md) and [ADR-0012 — stable releases](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0012-consumer-release-contract.md)
- Builder [ADR-0026 — candidate branches and authority](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0026-adopt-agenticow-runtime-memory-branching-primitive.md) and [ADR-0039 — replaceable Ruflo capabilities](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0039-admit-ruflo-capabilities-behind-local-runtime-contracts.md)
- Builder [ADR-0040 — semantic standards plane](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0040-adopt-apache-jena-semantic-standards-plane.md), [ADR-0041 — deterministic validation](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/docs/adr/ADR-0041-odr-compiled-deterministic-validation-and-promotion-gate.md) and the [development model portfolio](https://github.com/hm-group/semantic-builder/blob/b64e4288bc07277198abad83bd7978db5c938b6b/config/model-portfolios/portfolio.development.v1.json)

## Amendments

- **2026-08-03 — Accepted by operator.** Selected a first-principles Property-Pack scope; rejected a Builder dependency and five non-OPDA concerns; retained the other nine; and required one bounded-context or common-boundary home for every OPDA resource.
- **2026-08-03 — Pinned Builder execution profile adopted.** Inherit Builder's accepted authoring and assurance contracts without its runtime or excluded target categories; human working groups retain meaning and promotion authority.
- **2026-08-03 — OPDA governance clarified.** Constitutional authority and the technical change process govern human review and promotion; incomplete release mechanics must be ratified before a normative ontology release.
- **2026-08-04 — Governance excluded from ontology scope.** Category 6 remains an operational Builder and OPDA control; the ontology retains eight concerns and excludes six.
- **2026-08-04 — Semantic standards target fixed.** Generate RDF 1.2, SPARQL 1.2 and SHACL 1.2 output with explicit conformance levels and fail-closed qualification; do not claim full RDF or SHACL Union support without feature evidence.
- **2026-08-04 — Candidate implementation recorded.** Generated an isolated 451-item, context-owned review candidate and dual-provider calibration evidence. Deterministic candidate gates pass; route qualification and every semantic disposition remain pending human review.
