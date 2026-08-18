---
status: accepted
date: 2026-08-18
updated: 2026-08-18
tags: [website, information-architecture, pdtf-1-0, spdtf-2-0, ontology, semantic-modelling, standards, migration, governance]
supersedes: []
depends-on: [ADR-0002, ADR-0039, ADR-0041, ADR-0059, ADR-0062, ADR-0063, ADR-0064, ADR-0066, ADR-0067, ADR-0073]
implements: [docs/spdtf-2-0-information-architecture.md]
---

# Organise the site around SPDTF 2.0 and PDTF 1.0

> Update 2026-08-18: the user accepted this decision and authorised implementation
> in a separate feature worktree. Acceptance changes no production site; the ADR
> becomes Implemented only after the migration and release gates pass.

## Context and Problem Statement

The website currently presents thirteen peer navigation sections. Seven of them —
Modelling, Model, Ontology, Mapping, Schema, Implementation and Adoption — document
the PDTF 1.0 schema implementation and derived semantic corpus. Those descendants do
not have uniform authority: the schema implementation is published while individual
ontology, model, mapping and stub pages retain their own maturity and review status.

The current programme name is SPDTF, the Smart Property Data Trust Framework. SPDTF
2.0 continues that work through a different method: domain-led, evidence-up modelling
through bounded-context working groups, with a separate Interoperability Working
Group and human authority over meaning. PDTF 1.0 material and participant resources
are inputs; its JSON Schemas contribute compatibility, constraints, coverage and
migration evidence but do not determine new domain meaning.

The current navigation mixes programme context, PDTF 1.0 implementation, the
machine-generated Property Pack seed, current governance and resources. It therefore
cannot reliably tell readers which material is published, under development,
non-normative or historically named.

It also provides no canonical current journey explaining why ontologies are used, how
the working groups turn evidence into context-owned candidates, which semantic outputs
stay aligned, how the eight formal modelling concerns differ from the presentation’s
eleven themes, or which standards are targets, candidates, projections or legacy tools.

DBT Smart Data is an external, cross-economy government programme enabled by the
Data (Use and Access) Act 2025. Property is under evidence gathering and prospective
scheme design; no operating statutory property scheme or government-approved SPDTF
standard has been identified. OPDA work is recognised as market activity and evidence,
not as delegated government authority.

ADR-0064 requires a follow-on decision for the coherent information architecture,
status model, migration plan and release gate. It remains the current governing
decision until this proposal is accepted and implemented.

## Decision Drivers

- Make SPDTF 2.0 participant review the primary development surface.
- Keep PDTF 1.0 directly findable.
- Prevent machine-generated material from acquiring human standards authority.
- Use SPDTF for current work and preserve PDTF only where historically exact.
- Define one cross-programme authority and status system.
- Explain the ontology method in business language without conflating semantic meaning,
  validation, downstream projections or approval.
- Make standards status, conformance scope and mapping type explicit.
- Preserve stable routes and semantic identifiers before changing navigation paths.
- Apply migration rules to complete generated route families, not individual pages.

## Considered Options

- **Mirror PDTF 1.0 and SPDTF 2.0.** Give each generation its own modelling, governance,
  implementation and resources tree.
- **Keep the thirteen-section navigation.** Add work-area and status banners to the
  current structure.
- **Use an asymmetric task-and-authority architecture (proposed).** Separate the two
  bodies of work while sharing Programme, Governance and Resources, and expose a
  direct Working groups task path.

## Decision Outcome

Accepted: adopt six global destinations:

1. Programme.
2. SPDTF 2.0 Development.
3. Working groups — a shortcut to the single canonical family within SPDTF 2.0
   development.
4. PDTF 1.0.
5. Governance.
6. Resources.

SPDTF 2.0 is current work in development, not the current or adopted standard. PDTF
1.0 contains the published schema implementation and derived artefacts with their own
status; no replacement is authorised and support status is not defined here.

The existing `/v2/**` corpus is labelled **SPDTF 2.0 development input —
machine-generated Property Pack pre-draft — non-normative — no working-group review
or approval recorded**. It remains structured and reviewable, but is not called the
SPDTF 2.0 ontology, a working-group candidate or a replacement contract.

Governance owns one versioned registry with separate fields for work area, authority,
maturity, version and provenance. Interoperability is a peer of domain working groups
within SPDTF 2.0 development and links to Governance for its decision rights.

SPDTF 2.0 Development contains one canonical **Ontologies and semantic modelling**
branch: Why ontologies; How we use them and the six-part semantic package; Bounded
contexts and common boundary; Coverage; Standards and vocabularies; Evidence,
provenance and mappings; Validation, conformance, lifecycle and generated projections.

The branch distinguishes three taxonomies:

- six reviewable semantic outputs — glossary, dictionary, taxonomies, controlled
  vocabularies, resources and relationships;
- eleven participant-facing workshop themes arranged under Meaning, Trust,
  Correctness and Exchange; and
- eight formal ontology-coverage concerns from ADR-0063/0067, each disposed as
  `model here`, `reuse shared`, `boundary contribution` or `not applicable`.

Its standards profile records purpose, exact version/conformance, mechanism, status,
owner, evidence/decision and re-open trigger. RDF 1.2 Basic, a portable SPARQL 1.2
subset and SHACL 1.2 Core are bounded targets; broader claims require feature evidence.
External vocabularies and modelling frameworks are assessed rather than inherited.
JSON Schema, JSON-LD, forms, APIs and documentation are tested projections, not
independent semantic authorities.

“Mapping” is always qualified: legacy RML schema–ontology verification, planned
JSON-LD contexts, current cross-context semantic mapping, Property Pack coverage links,
or an optional runtime transformation. Coverage links are not RML/R2RML.

Programme owns the canonical DBT Smart Data context. Governance describes external
statutory and prospective-scheme constraints, Resources holds official sources, and
SPDTF 2.0 development links relevant evidence as an input. In accordance with
ADR-0063, the working-group roster includes an OPDA-internal DBT Smart Data
cross-sector scheme-design group. It is not a government-established property-scheme
body and cannot confer statutory or government-approved status on SPDTF.

The complete hierarchy, route placement, page contract and migration gates are
defined in
[`docs/spdtf-2-0-information-architecture.md`](../spdtf-2-0-information-architecture.md).

If accepted, this ADR supersedes only the **top-level navigation and content-owner
placement clauses** of ADR-0002, ADR-0041, ADR-0059 and ADR-0062. Their stable routes,
ontology-generation rules, mapping provenance, Smart Data source treatment and other
technical decisions remain. Acceptance changes only those placement clauses.

### Consequences

- Good, because SPDTF 2.0 development and PDTF 1.0 become unambiguous.
- Good, because participants can enter through working groups and review meaning in
  business language.
- Good, because implementers retain a two-interaction path to schemas and validation.
- Good, because one status system prevents competing work-area-specific authority claims.
- Good, because participants gain a plain-language ontology journey while implementers
  retain qualified technical views.
- Good, because six outputs, eleven themes and eight formal concerns cannot silently
  collapse into one misleading taxonomy.
- Good, because the current route inventory becomes a deterministic migration ledger.
- Bad, because six new labels will disrupt familiarity with the thirteen-item header.
- Bad, because coherent status metadata must be applied across thousands of pages.
- Neutral, because existing routes remain in place during the first implementation.

### Confirmation

This ADR is Accepted for implementation on the isolated `feat/spdtf-2-ia` branch. It
authorises the navigation and content-ownership change described here, but no
publication or deployment.

Implementation requires:

- a disposition for every route, generated family, bundled artefact, published source
  object and compatibility alias in the current-site IA inventory;
- checksum/consumer preservation ledgers for sources, council records, ontology/data
  artefacts, support assets and runtime authentication, comments and submissions;
- one canonical working-group URL family under SPDTF 2.0 Development;
- one canonical Ontologies and semantic modelling branch with the exact six/eleven/eight
  distinction and four category dispositions;
- a status-controlled standards profile and unambiguous mapping vocabulary;
- a versioned semantic-package manifest, competency questions, coverage receipts and
  immutable candidate diffs so projections cannot become independent meaning sources;
- inherited five-field status metadata on every generated page;
- a machine-readable migration manifest;
- task tests for participant, implementer and governance journeys;
- complete route, fragment, search, accessibility, responsive, keyboard, visual,
  unit and build gates;
- a coherent release rather than piecemeal changes.

ADR-0064 remains operative until those conditions are completed and this ADR is marked
Implemented.

## Rules

- Use SPDTF for the current programme and SPDTF 2.0 for its work in development.
- Use PDTF 1.0 for the existing implementation; preserve historically exact PDTF
  names in immutable records and stable technical identifiers.
- Do not call PDTF 1.0 an archive while its replacement and support status remain
  undecided.
- Do not call SPDTF 2.0 the current or adopted standard.
- Do not present SPDTF as an approved statutory property Smart Data scheme or treat
  OPDA participation in government forums as delegated authority.
- Do not classify the Property Pack seed as working-group reviewed.
- Do not present technical validation as semantic approval.
- Do not infer child-artifact authority from the PDTF 1.0 parent label.
- Do not inherit legacy standards or modelling-framework choices into SPDTF 2.0 without
  an explicit profile disposition.
- Do not conflate the six semantic outputs, eleven workshop themes or eight formal
  ontology-coverage concerns.
- Do not use an unqualified “mapping” label.
- Do not create duplicate governance, status, glossary or working-group records.
- Do not redirect a route without a recorded semantic-equivalence decision and test.

## Vote and Dissent

A non-voting chair convened a hierarchical, specialised council using Raft consensus.
Independent native-model priors came from OpenAI `gpt-5.6-terra` at high effort,
OpenAI `gpt-5.6-sol` at xhigh effort, and Anthropic `claude-fable-5` at maximum effort.
Bounded cross-examination used Fable at high and medium effort.

The final OpenAI ballot accepted the original core proposal three to zero. Its 98/100
Devil’s Advocate and Fable results predate the ontology expansion and are retained only
as scoped history. A fresh fail-closed review of the expanded ontology, preservation,
Markdown/HTML parity and accessibility scope scored 100/100 with no hard failures.

Held dissent: Fable would order PDTF 1.0 before SPDTF 2.0 Development because
implementation is the majority task today. Navigation task testing must decide the
final order before implementation.

## More Information

- [Proposed SPDTF 2.0 information architecture](../spdtf-2-0-information-architecture.md)
- [Current site information architecture](../current-site-information-architecture.md)
- [ADR-0039 — linked data as the standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0063 — Domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0064 — Modelling website revamp](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
- [ADR-0066 — Property Pack seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — First-principles ontology by bounded context](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [DBT — Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy)
- [DBT — Smart Data multi-sector call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence)
- [MHCLG — Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap)
