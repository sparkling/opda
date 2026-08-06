---
status: accepted
date: 2026-07-19
updated: 2026-08-06
tags: [strategy, ontology, bounded-context, working-groups, ddd, skos, shacl, interoperability, provenance, temporal, dpv, dcat]
supersedes: []
depends-on: [ADR-0026, ADR-0039, ODR-0019, ODR-0020]
implements: []
---

# Domain-led bounded-context working groups for the next modelling phase

## Context and Problem Statement

OPDA's first linked-data phase started with the existing PDTF JSON Schema standard and
generated an ontology, mappings, glossary, dictionary, shapes and website views from
that technical source. The current outputs are available through:

- `https://opda.org.uk/ontology`
- `https://opda.org.uk/mapping`
- `https://opda.org.uk/schema/`

That phase proved that the existing standard can be traced into a linked-data
representation. It also exposed a more important finding: a document schema is not a
sufficient source of domain meaning.

The generated model has several diagnostic weaknesses:

- semantic definitions are often weak or inherited from field-level annotations;
- depth is uneven, reflecting different levels of historical engagement;
- some areas are overdeveloped while others are underdeveloped;
- form-support concerns entered through overlays without first establishing whether
  they belong in the domain standard or how they relate to the whole;
- the result risks becoming a single, centrally designed "cathedral" model whose scope
  is too broad for domain experts to review effectively.

The existing ontology remains valuable as a diagnostic baseline, traceability
artefact and source of requirements. The next phase does not discard it or "start
again"; it changes how domain meaning becomes authoritative.

This ADR decides how the next models are to be developed and governed.

Supporting evidence and the stakeholder case are recorded in
[`docs/research/bounded-context-working-group-approach.md`](../research/bounded-context-working-group-approach.md).

## Decision Drivers

- **Domain correctness** — meanings and relationships must be agreed by practitioners
  who make decisions in the domain.
- **Balanced coverage** — each part of the property journey needs deliberate attention,
  rather than inheriting the participation pattern of the existing schemas and forms.
- **Bounded scope** — a group must be able to understand and review its model without
  taking responsibility for the whole property ecosystem.
- **Bottom-up modelling** — domain meaning should be developed from practitioner
  evidence inside each bounded context, rather than imposed by one top-down model.
- **Non-technical participation** — contributors must be able to work through
  diagrams, definitions, examples and business rules rather than RDF, OWL, SHACL or
  JSON Schema syntax.
- **Explicit interoperability** — different domains must be connected deliberately,
  without flattening legitimate differences in language or practice.
- **Governable outputs** — every term, rule and mapping needs a clear owning group and
  review path.
- **Complete modelling coverage** — every group needs a common checklist covering
  domain meaning, vocabularies, classification, governance, validation, mappings,
  provenance, time and access.
- **Incremental value** — useful domain increments should be publishable without
  waiting for a complete sector-wide model.

## Considered Options

- **Option A — Continue refining the schema-derived ontology centrally.** Retain the
  current ontology as the primary model and improve definitions and coverage through a
  general review process.
- **Option B — Build one new sector-wide ontology centrally.** Convene a single
  cross-industry modelling group and attempt to design the complete property model.
- **Option C — Domain-led bounded-context groups plus an Interoperability Working Group
  (chosen).** Develop each domain model with its own experts, using existing OPDA
  artefacts and external standards as evidence rather than presumed authority, then
  govern boundary concepts and mappings through a group composed of delegates from
  every domain group.

## Decision Outcome

Chosen option: **Option C — domain-led bounded-context groups plus an Interoperability
Working Group.**

The next phase will not treat the current JSON Schemas, their overlays, or the generated
ontology as the authority for domain meaning. They remain valuable evidence,
traceability, implementation and migration inputs throughout the work. Each working
group determines meaning through its agreed scope, use cases, practitioner language and
reviewed evidence. This is a shift from one top-down, schema-derived model to
bottom-up modelling within explicit bounded contexts, not a restart of the programme.

### 1. Working-group roster

OPDA will establish eight working groups: six property bounded-context groups, one
cross-sector scheme group and one cross-cutting Interoperability Working Group.

| Working group | Initial scope |
|---|---|
| **Finance and Banking** | Mortgage journey, lending decisions, parties, evidence, risk and finance-data exchange |
| **Conveyancing** | Instruction, legal transfer, enquiries, searches, exchange and completion |
| **Estate Agency** | Marketing, listings, material information, viewings, offers and seller-provided information |
| **Surveying and Valuation** | Inspection, condition, valuation, professional evidence and property risk |
| **Property Data Services** | Registries, searches, authoritative sources, provenance, currency and reuse |
| **Property Technology** | Platforms, workflow, integration, APIs, implementation and operational feedback |
| **DBT Smart Data** | Smart Data scheme semantics: participants, roles, trust, consent, authorisation, accreditation, liability, data-sharing obligations and cross-sector alignment |
| **Interoperability Working Group** | Common boundary ontology, context map, cross-domain mappings and shared exchange conventions, with representatives selected from the other working groups |

The boundary and name of a context remain reviewable. They are hypotheses to validate
with practitioners, not partitions mechanically derived from current form overlays.
DBT Smart Data is the scheme working group, not being asserted as a seventh property
bounded context. Its terminology, policy lifecycle, cross-sector authority and
scheme-level questions are distinct from the property-transaction domains. It must not
redefine the internal meanings owned by those groups.

Each domain and scheme group contains subject-matter experts and practitioners,
supported by ontology and data-modelling facilitators. Domain members own the meaning;
facilitators help make that meaning explicit, consistent and machine-readable. The
Interoperability Working Group includes selected representatives from across those
groups so that every context can explain its own language when boundary agreements are
made.

The same real-world property may therefore have distinct, useful representations in
lending, conveyancing, surveying, agency and other contexts. The programme will map
those representations at their boundaries instead of forcing every group to adopt one
universal definition. This preserves local precision while keeping exchange explicit.

### 2. Required outputs and publication artefacts

Every bounded-context and scheme group produces one coherent semantic package with six
aligned content outputs:

1. **Business glossary** — agreed plain-language definitions, examples, scope notes,
   synonyms and ownership.
2. **Data dictionary** — the data elements used in the context, with definitions,
   value expectations, provenance and stewardship.
3. **Taxonomies** — agreed hierarchical organisations of domain concepts, including
   broader and narrower meanings.
4. **Controlled vocabularies** — governed terms, labels, definitions, codes and value
   sets used by the context.
5. **Resources** — the identifiable domain things and concepts that need stable
   meaning, descriptions and provenance.
6. **Relationships** — the meaningful links, roles and constraints that connect those
   resources.

The content is published through several artefacts for different consumers:

- a machine-readable **ontology in RDF**, including validation shapes where
  appropriate;
- generated **JSON Schemas** for implementers who work with schema and form tooling;
- human-readable **website pages**, with exportable **PDF** and **Markdown** views;
- an optional **runtime for ontology-to-schema mapping**, validation and related
  translation where a deployment needs it.

These are different representations of one agreement, not independent specifications.
They must not carry conflicting meanings. The working groups review the business
meaning; they are not expected to author RDF, SHACL or JSON Schema syntax.

### 3. Eight ontology categories required from every group

The outputs above say what each group agrees and the artefacts say how that agreement
is published. The following eight categories say what kinds of meaning the ontology
must consider. They adopt the subset of the 14-category framework in the
`semantic-modelling` sibling project retained by ADR-0067.

| Area | # | Ontology category | OPDA concern | Related linked-data standards |
|---|---:|---|---|---|
| **Meaning** | 1 | **Domain structure** | Things, identities, relationships and rules | RDF, RDFS, OWL 2 |
| **Meaning** | 2 | **Vocabulary and taxonomy** | Governed values, preferred terms, codes and broader/narrower concept structures | SKOS |
| **Meaning** | 5 | **Classification metadata** | Subject, lifecycle, regulatory relevance, status and other facets | Dublin Core Terms, DCAT 3, SKOS |
| **Trust** | 9 | **Provenance and quality** | Source, attribution, derivation, confidence, lineage and quality evidence | PROV-O, DQV |
| **Trust** | 11 | **Access control and data sensitivity** | Personal data, purpose, consent, access roles and authorisation semantics | DPV, DPV-PD, DPV-LEGAL; ODRL where justified |
| **Correctness** | 7 | **Validation and constraints** | Testable business rules, completeness and consistency | SHACL 1.2, SHACL-AF; DASH where a UI annotation is needed |
| **Correctness** | 10 | **Temporal state and history** | Valid time, recorded time, state transitions and version chains | OWL-Time, PROV-O |
| **Exchange** | 8 | **Cross-domain mappings** | Context-map relationships and meaning-preserving translations | SKOS Mapping, SSSOM |

Categories 3 (process modelling), 4 (service architecture), 6 (governance and
compliance), 12 (capability and intent), 13 (source mapping) and 14 (data product)
remain outside OPDA's required ontology coverage. Governance remains an operating
concern recorded in ADRs and procedures, not an ontology output. The deliberately
small common ontology is an architectural boundary governed by the Interoperability
Working Group rather than a ninth formal category.

The eight adopted categories form a completeness framework, not an instruction to
over-model. For each category, every group records one disposition:

- **model here** — the group owns substantive domain content;
- **reuse shared** — the group uses a common or externally governed model;
- **boundary contribution** — the group supplies requirements or mappings for the
  Interoperability Working Group;
- **not applicable** — permitted only with a recorded rationale.

The category assessment is maintained alongside the outputs and reviewed at each
release. It prevents silent gaps without forcing every group to create eight separate
files or duplicate common terms.

### 4. Interoperability Working Group

The cross-cutting group is named the **Interoperability Working Group**, replacing the
less precise working label “Common Modelling Working Group”.

Each domain and scheme group appoints representatives to the Interoperability Working
Group. This group does not redesign domain models. It owns the agreements required at
their boundaries:

- a deliberately small **common boundary ontology** containing concepts genuinely
  required for exchange;
- a **context map** showing where meanings originate, where information crosses a
  boundary, and which group owns each decision;
- **mappings between controlled vocabularies and taxonomies**, using SKOS mapping
  relationships where appropriate;
- shared conventions for identifiers, provenance, versioning and change control where
  cross-context consistency is required.

The Interoperability Working Group also maintains the programme-wide eight-category
coverage matrix and the shared standards profile. The common ontology must remain small. A
concept belongs there because multiple contexts need a stable exchange agreement, not
because centralisation is convenient.

### 5. Working method

Each group follows an iterative, evidence-led method:

1. agree scope, users, exclusions and competency questions;
2. collect the language, rules, documents, forms, examples, diagrams, recordings and
   representative scenarios used by practitioners, subject to consent and information
   handling controls;
3. use an evidence-grounded council of AI agents, expert perspectives and multiple
   models to propose an ontology and its related semantic outputs;
4. publish diagrams, definitions, examples, questions and machine-readable artefacts
   as a reviewable website increment;
5. let practitioners challenge the draft in business language, then ingest the
   feedback and publish a visible revision;
6. distinguish domain entities and relationships from glossary terms, dictionary
   entries and controlled classifications;
7. complete the eight-category assessment, explicitly recording shared and
   not-applicable dimensions;
8. test the package against examples, competency questions and agreed validation
   rules;
9. refer genuine cross-context dependencies to the Interoperability Working Group;
10. repeat until the group considers the model stable enough to publish as its
    official first draft.

Most participants encounter data through schemas and electronic forms, which present a
tree-shaped view. The ontology presents the connected business model as a graph. That
distinction should be explained in plain language, but working sessions do not require
participants to learn either ontology syntax or schema engineering. Existing schemas
and mappings remain inputs for traceability, migration and implementation, and new
schemas can be generated and published from the governed ontology through tested
transformations. Participants supply evidence and judgement; facilitators produce the
formal artefacts. The operational controls for the AI-assisted cycle are defined by
ADR-0065.

### 6. First group: Finance and Banking

The first working-group kick-off is Finance and Banking.

The Financial Industry Business Ontology (FIBO) is an established ontology for the
finance domain. It is a useful reference and potential source of reusable concepts.
Participants are not expected to know FIBO or ontology engineering, and the group will
not import it wholesale before agreeing the bounded context's scope and questions.

The session should use diagrams, semantic descriptions, a glossary, a data dictionary,
examples and business-language validation outcomes. The current OPDA website may be
shown as a demonstration of how models can be explored and discussed, but its current
model must not be presented as the new Finance and Banking model.

The first phase is resource-first: OPDA will ask participants for the standards,
schemas, forms, definitions, policies, examples and other material they already use.
The modelling facilitator will use that evidence, with AI assistance, to produce and
publish the first candidate model for review. The group will then improve successive
candidates through evidence, discussion and feedback rather than attempting to model
the ontology live in the kick-off meeting.

### 7. Relationship to existing decisions and artefacts

This ADR does not rewrite historical records or delete the current generated corpus.
ADR-0026, ADR-0039, ODR-0019 and ODR-0020 accurately record how the existing model and
bounded-context scheme were derived and implemented.

If this ADR is accepted, the next governance step is to identify and formally supersede
or amend the normative claims in those records that make schemas, form overlays or the
generated corpus authoritative for future domain modelling. Until that work is
ratified:

- the existing site and ontology continue to document the current implementation;
- the new working-group outputs remain a separate development stream;
- no new domain model silently replaces an existing published term;
- migration and compatibility decisions are deferred until the new models have enough
  substance to compare.

### Consequences

- Good, because domain definitions are challenged by the people who use them rather
  than inferred from document structure.
- Good, because each context receives dedicated attention and a clear owner.
- Good, because non-technical experts can participate directly.
- Good, because controlled vocabularies, taxonomies and validation rules are
  first-class concerns rather than afterthoughts.
- Good, because the eight-category checklist catches cross-cutting omissions such as
  classification, provenance, time and privacy.
- Good, because cross-context differences remain visible and are mapped explicitly.
- Good, because groups can publish useful increments without completing a universal
  model.
- Bad, because parallel domain groups create coordination and versioning work for the
  Interoperability Working Group.
- Bad, because eight categories can become bureaucratic if treated as eight
  mandatory models; the four-disposition rule and recorded `not applicable` outcome
  mitigate this.
- Bad, because some concepts will be modelled differently before mappings and common
  boundaries are agreed; this is expected discovery, not immediate convergence.
- Bad, because the eventual migration from the current corpus will require a separate,
  evidence-based plan.
- Neutral, because the current schema-derived artefacts remain useful for traceability
  and comparison but lose their presumed authority over future domain meaning.

### Confirmation

- Every active domain group has a written charter naming its scope, exclusions,
  competency questions, membership and steward.
- All six bounded-context working groups, the DBT Smart Data scheme working group and
  the Interoperability Working Group are chartered.
- Every domain and scheme group plans all six required content outputs and the listed
  publication artefacts, and maintains an eight-category coverage statement using
  the four permitted dispositions.
- The Interoperability Working Group includes a representative from every active
  domain and scheme group and has an explicit "boundary agreements, not domain
  redesign" remit; it maintains the programme-wide coverage matrix and standards
  profile.
- Workshop material is understandable without knowledge of JSON Schema, RDF, OWL,
  SKOS or SHACL syntax.
- Participants can contribute source evidence and review model drafts without
  manipulating ontology syntax; AI-generated proposals retain source provenance and
  remain subject to human governance under ADR-0065.
- Finance and Banking is the first application of the method and records lessons before
  further groups adopt it.
- A follow-on governance record identifies the precise ODR/ADR amendments required
  before any new model becomes normative.
- No public website content is migrated piecemeal; publication follows ADR-0064.

## More Information

- [Research — bounded-context working-group approach](../research/bounded-context-working-group-approach.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow with human-governed review](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [Research — AI-assisted working-group method](../research/ai-assisted-working-group-method.md)
- [Presentation plan — July 2026 Exec and Finance and Banking workshop](../plan/2026-07-exec-and-finance-banking-presentations.md)
- [ADR-0064 — redesign the modelling website before publishing the new approach](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
- [ADR-0039 — linked-data model as the PDTF standards foundation](./ADR-0039-linked-data-model-as-pdtf-standards-foundation.md)
- [ADR-0026 — bounded-context scheme emission](./ADR-0026-bounded-context-scheme-emission.md)
- [ODR-0019 — bounded-context representation](../ontology/odr/ODR-0019-bounded-context-representation.md)
- [ODR-0020 — bounded-context scheme and mapping](../ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md)
