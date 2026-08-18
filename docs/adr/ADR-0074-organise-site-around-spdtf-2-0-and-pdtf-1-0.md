---
status: proposed
date: 2026-08-18
tags: [website, information-architecture, pdtf-1-0, spdtf-2-0, modelling, migration, governance]
supersedes: []
depends-on: [ADR-0063, ADR-0064, ADR-0066, ADR-0067, ADR-0073]
implements: [docs/spdtf-2-0-information-architecture.md]
---

# Organise the site around SPDTF 2.0 and PDTF 1.0

## Context and Problem Statement

The website currently presents thirteen peer navigation sections. Seven of them —
Modelling, Model, Ontology, Mapping, Schema, Implementation and Adoption — document
PDTF 1.0, the schema-led published implementation. Its ontology was derived from the
existing schemas, overlays, dictionaries, glossary, documents and resources.

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

Proposed: adopt six global destinations:

1. Programme.
2. SPDTF 2.0 Development.
3. Working groups — a shortcut to the single canonical family within SPDTF 2.0
   development.
4. PDTF 1.0.
5. Governance.
6. Resources.

SPDTF 2.0 is current work in development, not the current or adopted standard. PDTF
1.0 is the published implementation; no replacement is authorised and support status
is not defined by this publication.

The existing `/v2/**` corpus is labelled **SPDTF 2.0 development input —
machine-generated Property Pack pre-draft — non-normative — no working-group review
or approval recorded**. It remains structured and reviewable, but is not called the
SPDTF 2.0 ontology, a working-group candidate or a replacement contract.

Governance owns one versioned registry with separate fields for work area, authority,
maturity, version and provenance. Interoperability is a peer of domain working groups
within SPDTF 2.0 development and links to Governance for its decision rights.

Programme owns the canonical DBT Smart Data context. Governance describes external
statutory and prospective-scheme constraints, Resources holds official sources, and
SPDTF 2.0 development links relevant evidence as an input. In accordance with
ADR-0063, the working-group roster includes an OPDA-internal DBT Smart Data
cross-sector scheme-design group. It is not a government-established property-scheme
body and cannot confer statutory or government-approved status on SPDTF.

The complete hierarchy, route placement, page contract and migration gates are
defined in
[`docs/spdtf-2-0-information-architecture.md`](../spdtf-2-0-information-architecture.md).

### Consequences

- Good, because SPDTF 2.0 development and PDTF 1.0 become unambiguous.
- Good, because participants can enter through working groups and review meaning in
  business language.
- Good, because implementers retain a two-interaction path to schemas and validation.
- Good, because one status system prevents competing work-area-specific authority claims.
- Good, because the current route inventory becomes a deterministic migration ledger.
- Bad, because six new labels will disrupt familiarity with the thirteen-item header.
- Bad, because coherent status metadata must be applied across thousands of pages.
- Neutral, because existing routes remain in place during the first implementation.

### Confirmation

This ADR is Proposed. It makes no navigation, route, content-authority, publication or
deployment change.

Acceptance requires explicit human approval. Implementation then requires:

- a disposition for every route and route family in the current-site IA inventory;
- one canonical working-group URL family under SPDTF 2.0 Development;
- inherited five-field status metadata on every generated page;
- a machine-readable migration manifest;
- task tests for participant, implementer and governance journeys;
- complete route, fragment, search, accessibility, responsive, keyboard, visual,
  unit and build gates;
- a coherent release rather than piecemeal changes.

ADR-0064 remains operative until those conditions are authorised and completed.

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
- Do not create duplicate governance, status, glossary or working-group records.
- Do not redirect a route without a recorded semantic-equivalence decision and test.

## Vote and Dissent

A non-voting chair convened a hierarchical, specialised council using Raft consensus.
Independent native-model priors came from OpenAI `gpt-5.6-terra` at high effort,
OpenAI `gpt-5.6-sol` at xhigh effort, and Anthropic `claude-fable-5` at maximum effort.
Bounded cross-examination used Fable at high and medium effort.

The final OpenAI ballot accepted the proposal three to zero. The Devil’s Advocate
scored it 98/100 with no hard failure after the archive, support and seed-authority
errors were corrected. Fable required one canonical group family, work-area-aware
decision-record filing and a complete inventory-bound migration ledger; all three are
binding in the proposed outcome. Fable’s corrected regrade also accepted the proposal
at 98/100 with no hard failure.

Held dissent: Fable would order PDTF 1.0 before SPDTF 2.0 Development because
implementation is the majority task today. Navigation task testing must decide the
final order before implementation.

## More Information

- [Proposed SPDTF 2.0 information architecture](../spdtf-2-0-information-architecture.md)
- [Current site information architecture](../current-site-information-architecture.md)
- [ADR-0063 — Domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0064 — Modelling website revamp](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
- [ADR-0066 — Property Pack seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — First-principles ontology by bounded context](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [DBT — Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy)
- [DBT — Smart Data multi-sector call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence)
- [MHCLG — Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap)
