---
status: accepted
date: 2026-08-19
updated: 2026-08-21
tags: [information-architecture, property-pack, pdtf-1-0, spdtf-2-0, ontology, technical-working-group, governance, government, provenance]
supersedes: []
amends: [ADR-0066, ADR-0067, ADR-0074]
depends-on: [ADR-0039, ADR-0063, ADR-0066, ADR-0067, ADR-0074]
implements: [src/pages/spdtf-2/property-pack, src/lib/site-navigation.ts, src/lib/site-ia.mjs]
---

# Treat the Property Pack ontology as an accelerated SPDTF 2.0 component

> Update 2026-08-20: the semantic-documentation portion is implemented as two linked
> audience paths. Understand ontologies teaches the concepts and how to read the model;
> How we model SPDTF 2.0 documents the evidence-up method, semantic package, contexts,
> modelling rules, standards, evidence, validation and coverage. This partial
> implementation does not change this ADR's Accepted status or make Proposed
> ADR-0065/0068 lifecycle policy operative.
>
> Update 2026-08-21: the two-part PDTF 1.0 hierarchy is implemented. The canonical
> `/ontology` branch now uses linked task-category pages, nested model tiers and a
> context index to organise every existing technical route without moving it or
> changing page-level status. Expandable labels remain links; separate controls
> disclose their children.

## Context and Problem Statement

PDTF 1.0 has two distinct parts:

1. the original standard: JSON Schemas and overlays, the data dictionary and the
   business glossary; and
2. the ontology extracted from those artefacts, together with its model views,
   qualified mappings and provenance.

The original PDTF 1.0 schema contains the Property Pack definition. The extracted
PDTF 1.0 ontology should therefore contain the corresponding Property Pack model,
although it may not expose that coverage as one explicit, governed module or profile.
The current repository proves that every one of the 451 required Property Pack paths
occurs in the local v3.5 schema. It does not yet prove complete semantic equivalence
between those paths and the extracted ontology: only 34 complete required paths have
exact entries in the current ontology provenance index. Consolidation, one-to-many
modelling and provenance gaps mean that this is not a semantic coverage percentage.
It establishes the need for a proper crosswalk.

The former `/v2/**` corpus is the Property Pack ontology generated from the Property Pack
definition. “V2” was the original label because this work belongs to SPDTF 2.0. It is
not an external input sitting beside SPDTF 2.0 and it is not the whole future SPDTF
2.0 ontology. It is a priority component that the wider ontology will identify as its
Property Pack part or profile.

The Property Pack is the standardised bundle of property data that accompanies a
transaction. In ontology terms it is an exchange or delivery profile spanning several
semantic contexts, not one universal bounded context. Its 451 required source items
define the initial coverage boundary; they do not prescribe 451 ontology properties or
the structure of the legacy JSON tree.

The Property Pack ontology follows an accelerated governance sequence. The Technical
Working Group must review the current candidate and make a determination by the end of
September 2026 so that it can support other government-scheme work and OPDA's case to
be recognised as the authoritative steward. There is not enough time to require prior
feedback from every domain working group. After the technical determination, the wider
working groups may review the relevant parts and propose controlled changes.

ADR-0074 is already implemented in code, but its “development input” placement and
authority text no longer describe this programme model. ADR-0067 also assumes affected
domain-working-group review before promotion and therefore needs this explicit, scoped
governance amendment.

## Decision Drivers

- Make the September Technical Working Group milestone visible and actionable.
- Present the Property Pack ontology as part of SPDTF 2.0 without implying that it is
  the whole SPDTF 2.0 ontology.
- Show the actual lineage through both parts of PDTF 1.0.
- Preserve the current candidate and its citations while allowing later governed
  revisions.
- Separate technical determination from later domain review, publication, adoption
  and external recognition.
- Prevent “Property Pack”, its source definition, its ontology and an approved exchange
  contract from becoming interchangeable labels.
- Keep DBT policy, OPDA's Smart Data modelling group and the candidate DBT semantic
  context distinct.

## Considered Options

- **Keep Property Pack under a generic Development input branch.** Rejected because it
  misstates ownership, hides the priority workstream and flattens unrelated page types.
- **Wait for every domain working group before making a determination.** Rejected
  because it cannot meet the September milestone.
- **Repair the extracted PDTF 1.0 ontology in place.** Rejected as the sole method
  because inherited schema topology would obscure which SPDTF 2.0 meanings were
  deliberately reconsidered.
- **Use an accelerated Technical Working Group determination followed by controlled
  wider review (chosen).** This preserves the deadline while making later semantic
  improvement explicit rather than pretending broader consensus already exists.

## Decision Outcome

The Property Pack ontology is a first-class workstream within SPDTF 2.0 Development.
The reader-facing hierarchy becomes:

```text
SPDTF 2.0 Development
├── Overview and programme status
├── Property Pack ontology
│   ├── What a Property Pack is
│   ├── Purpose, government use and September milestone
│   ├── Definition and 451-item scope
│   ├── PDTF 1.0 lineage and semantic crosswalk
│   ├── Current ontology model
│   ├── Technical Working Group determination
│   ├── Versions, validation and artefacts
│   └── Later domain-working-group review
├── Ontologies and semantic modelling
│   ├── Understand ontologies
│   │   └── How to read the model
│   └── How we model SPDTF 2.0
│       ├── Evidence-up modelling
│       ├── Semantic package and context boundaries
│       ├── Modelling rules and upper-ontology lenses
│       ├── Standards, evidence and qualified mappings
│       └── Coverage, validation and projections
└── Wider SPDTF 2.0 ontology development
    ├── Domain and scheme working groups
    ├── Interoperability Working Group
    └── Candidate, question and change registers
```

PDTF 1.0 exposes its two-part structure:

```text
PDTF 1.0
├── Original standard
│   ├── JSON Schemas and overlays
│   ├── Data dictionary
│   ├── Business glossary
│   ├── Implementation guidance
│   └── Adoption evidence
└── Extracted PDTF 1.0 ontology
    ├── Lineage, provenance and verification
    │   ├── Historical modelling record
    │   └── Independent schema-to-ontology verification
    ├── Model views by audience and nested implementation tiers
    ├── Concepts and architecture, including ontology contexts
    ├── Terms and model resources
    ├── Validation and examples
    ├── Trust, governance and limitations
    └── Use and tooling
```

### Property Pack route and version contract

- `/spdtf-2/property-pack/**` is the single canonical Property Pack ontology family.
- The 690-page technical corpus moves there as one atomic family: old `/v2` maps to
  `/spdtf-2/property-pack`, old `/v2/comparison` maps to
  `/spdtf-2/property-pack/pdtf-1-lineage`, and every other old `/v2/{suffix}` maps to
  `/spdtf-2/property-pack/{suffix}`.
- The complete `/modelling/property-pack` source catalogue moves to
  `/spdtf-2/property-pack/definition-and-scope`; it is not a competing landing page.
- `/v2/**` and `/modelling/property-pack` are removed without redirects. The operator
  explicitly accepted that URL break on 2026-08-19; this is not a compatibility promise.
- A later determination or revision receives an explicit version and immutable change
  record. It must not silently rewrite the evidence for the September determination.
- The migration receipt maps every old page and fragment to its exact canonical
  replacement and proves that neither retired family is emitted.

### PDTF 1.0 to Property Pack crosswalk

The maintained crosswalk must account for all 451 source items and support many-to-one
and one-to-many semantic treatment:

```text
Property Pack source item
→ PDTF 1.0 schema path
→ extracted PDTF 1.0 ontology construct(s) or recorded gap
→ SPDTF 2.0 Property Pack construct(s)
→ retained, revised, consolidated, split or missing disposition
```

Lexical equality and exact source-path matches may assist the audit but cannot establish
semantic equivalence by themselves.

### Accelerated determination and later review

The governance sequence is:

1. preserve the current Property Pack ontology candidate and its evidence;
2. present it as-is to the Technical Working Group with explicit review questions;
3. record the group's determination and every qualification or required change;
4. version the determined Property Pack ontology and its validation evidence;
5. allow its use in wider government-scheme work to the extent actually authorised;
6. invite the domain, scheme and Interoperability working groups to review relevant
   meanings later; and
7. process later proposals through controlled change, impact assessment and a new
   version rather than silently changing the determined baseline.

The Technical Working Group is not the Property Technology bounded-context group.
Before the September determination is represented as authoritative, Governance must
record the Technical Working Group's canonical identity, delegated remit, decision
owner, quorum or decision rule, evidence set, allowed outcomes and escalation path.

### Independent status dimensions

Every Property Pack page must distinguish:

1. source-definition status;
2. ontology candidate and version status;
3. Technical Working Group determination status;
4. later domain-working-group review status;
5. implementation or release status; and
6. external government-use or authority-recognition status.

Technical validation does not by itself prove semantic agreement. A Technical Working
Group determination does not imply that every domain group has reviewed the result.
Government use supports OPDA's authority case but does not, by itself, prove that OPDA
has received a defined statutory or externally delegated authority role.

### DBT Smart Data boundary

- External DBT Smart Data policy and official evidence remain under Programme.
- The OPDA-internal Smart Data scheme-design group remains under Working groups and
  makes no claim to be a DBT or statutory body.
- The machine-proposed DBT Smart Data semantic context remains inside the Property
  Pack ontology's context map and must be labelled as a model component.

These three records cross-link; they do not share an unqualified navigation label or
authority status. Wider government use of the Property Pack must not automatically be
described as DBT use.

### Consequences

- Good, because the site reflects the actual September delivery and decision path.
- Good, because the Property Pack is visibly part of SPDTF 2.0 while remaining a
  bounded profile rather than the entire ontology.
- Good, because the PDTF 1.0 ontology's expected Property Pack coverage becomes an
  auditable claim rather than an assumption.
- Good, because later working-group review can improve the model without erasing the
  technical determination used by government consumers.
- Bad, because the current implemented navigation and status registry now require a
  coherent follow-up change.
- Bad, because a complete 451-item semantic crosswalk is additional work.
- Bad, because circulated `/v2/**` and `/modelling/property-pack` URLs intentionally
  stop resolving; the cleaner information architecture is preferred over compatibility.

### Confirmation

This decision remains **Accepted** while its full governance and lineage contract is
completed. The operator additionally authorised the no-redirect route consolidation on
2026-08-19. The route slice is independently complete only when the atomic move,
information-retention receipts, navigation, status and browser gates all pass.

Implementation requires all of the following:

- one canonical Property Pack hub and one unambiguous nested navigation branch;
- the implemented two-part PDTF 1.0 navigation;
- a machine-readable 451-row lineage crosswalk;
- a recorded Technical Working Group governance contract and September deadline;
- independent status fields for determination, later review, release and external
  authority;
- distinct DBT policy, internal-group and model-context labels;
- removal of generic modelling guidance from the SPDTF 2.0 root in favour of the
  ontology-method branch;
- preservation of every current Property Pack information block and fragment at its
  declared canonical replacement, with the old route families absent; and
- unit and browser tests for hierarchy, ownership, search facets, breadcrumbs,
  status wording, route preservation, accessibility and responsive behaviour.

No publication or deployment is authorised by this ADR.

## More Information

- [ADR-0063 — Domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0066 — Property Pack 451-item scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — First-principles Property Pack ontology](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [ADR-0074 — SPDTF 2.0 and PDTF 1.0 information architecture](./ADR-0074-organise-site-around-spdtf-2-0-and-pdtf-1-0.md)
- [Property Pack evidence validation](../research/property-pack-451-evidence-validation.md)
- [Current information-architecture specification](../spdtf-2-0-information-architecture.md)
