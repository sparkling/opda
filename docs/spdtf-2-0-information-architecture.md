# Proposed SPDTF 2.0 information architecture

Status: **proposed for review**<br>
Date: 2026-08-18<br>
Decision record: [ADR-0074](./adr/ADR-0074-organise-site-around-spdtf-2-0-and-pdtf-1-0.md)<br>
Review artefact: [HTML presentation](./spdtf-2-0-information-architecture.html)

## Executive decision

Reorganise the documentation around six global destinations:

1. **Programme**
2. **SPDTF 2.0 Development**
3. **Working groups** — a direct shortcut into the SPDTF 2.0 development workspace
4. **PDTF 1.0**
5. **Governance**
6. **Resources**

This is an asymmetric continuation structure. It distinguishes PDTF 1.0 from SPDTF
2.0 work in development, while governance, participation and source resources remain
shared services. It avoids mirrored sites with competing definitions of authority.

The proposal changes no live navigation or route. It defines the information
architecture and the gates that a later coherent implementation must pass.

## Terminology and authority

- **SPDTF** means **Smart Property Data Trust Framework**. It is the current name of
  the programme and standardisation process.
- **PDTF** without a version is deprecated as the name for current work. Keep it only
  where historically or technically exact: original records, quotations, package
  names, legacy URLs and stable `/pdtf/**` identifiers.
- **PDTF 1.0** is the existing schema-led implementation and the semantic corpus
  derived from it. It is the published implementation against which continuity is
  assessed. No replacement has been authorised. Support status is not defined by
  this publication.
- **SPDTF 2.0 development** is the continuation of the programme through a
  domain-led, evidence-up modelling process. “2.0” is a development-generation
  label, not a release, ratification or approval claim. It does not mean “current
  standard”, “approved model” or “replacement implementation”.
- **SPDTF 2.0 development inputs** are material prepared before or during the change
  in method. The existing `/v2` Property Pack model is a machine-generated seed:
  structured and reviewable, but non-normative and not reviewed by a working group.

## Why the structure must change

The current header presents thirteen peer sections. It mixes programme context,
governance, policy, the published implementation, a machine-generated seed and
historical resources. A reader cannot reliably infer which material is operative,
proposed, historical or under review.

The programme is continuing from one materially different modelling approach to
another:

| Dimension | PDTF 1.0 | SPDTF 2.0 development |
|---|---|---|
| Starting point | JSON Schemas, overlays, dictionaries, glossary, documents and implementation material | Participant evidence, recognised sources, domain questions and attributed PDTF 1.0 evidence |
| Method | Schema-led; ontology and related views derived from the existing corpus | Domain-led, evidence-up ontology modelling in bounded contexts |
| Authority | PDTF 1.0 implementation; no replacement authorised | Human working groups own domain meaning; governance controls later promotion |
| Primary outputs | Schemas, overlays, derived ontology, mappings, model views, implementation and adoption evidence | Reviewable model candidates, evidence lineage, questions, dispositions and governed downstream projections |

PDTF 1.0 is not discarded. Its dictionary, glossary, documentation, ontology and
mappings are attributed semantic evidence. Its JSON Schemas are especially useful
for compatibility, constraints, coverage and migration, but should not determine
SPDTF 2.0 identities or relationships merely because their data has already been
encoded in a tree structure.

## Evidence for this proposal

The proposal is grounded in:

- the [current-site route inventory](./current-site-information-architecture.md),
  which accounts for 2,552 canonical pages and 3,436 routable HTML URLs;
- the working-group presentation, especially its “evolution, not replacement”,
  evidence-to-candidate loop, bounded-context and human-review material;
- [ADR-0063](./adr/ADR-0063-domain-led-bounded-context-working-groups.md), which
  adopts domain-led bounded-context working groups;
- [ADR-0064](./adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md),
  which requires a coherent follow-on IA and preserves the existing implementation
  pending migration;
- [ADR-0066](./adr/ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
  and [ADR-0067](./adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md),
  which distinguish source scope, machine proposals and human semantic authority;
- the accepted council protocol in ADR-0067 and the project’s current OPDA design
  contract.

## How DBT Smart Data fits

DBT Smart Data is a UK government programme for secure, trusted data sharing across
the economy. Part 1 of the [Data (Use and Access) Act 2025](https://www.legislation.gov.uk/ukpga/2025/18/notes/division/4/index.htm)
provides regulation-making powers for schemes that can give customers or authorised
third parties access to customer and business data. [Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy)
sets the cross-economy direction.

Property is a prospective scheme area, not a designated operating scheme. DBT’s
[8 July 2026 call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence)
says property use cases still require feasibility analysis, governance design, legal
assessment and formal consultation before regulatory change. The
[Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap)
likewise commits government to evidence gathering and a later property-scheme
consultation. It recognises OPDA’s trust-framework testing as market activity and
says government will work with industry on accreditation criteria for data standards;
it does not designate OPDA, PDTF 1.0 or SPDTF 2.0 as the statutory scheme or its
approved standard.

The site must therefore use this relationship:

- **DBT Smart Data** is external government policy, statutory enablement and scheme
  design context.
- **SPDTF** is an OPDA-led standards programme that contributes evidence and tested
  approaches to prospective property Smart Data work.
- **Programme** owns the canonical UK Smart Data context page; **Governance** owns
  the external-constraint view; **Resources** holds the official sources; and
  **SPDTF 2.0 Development** links the relevant evidence into modelling work.
- The [Smart Data Council](https://www.gov.uk/government/groups/smart-data-council)
  is advisory. OPDA representation is a participation channel, not government
  authority for SPDTF.
- The accepted OPDA working-group roster includes a **DBT Smart Data cross-sector
  scheme-design group**. It is an OPDA-internal group and modelling lens; its name
  and work do not make it a government-established property-scheme body.

Safe summary: **SPDTF contributes to the UK’s prospective property Smart Data work;
it is not an approved statutory property Smart Data scheme.**

## Audiences and tasks

| Audience | Primary task | First destination |
|---|---|---|
| Working-group participant | Understand scope, contribute evidence, review meaning and see dispositions | Working groups |
| Domain steward or facilitator | Manage evidence, questions, candidate versions and review records | Develop SPDTF → Working groups |
| Interoperability representative | Compare context meanings and agree boundaries or mappings | Develop SPDTF → Interoperability |
| Current implementer | Find the published schemas, validation and implementation guidance | PDTF 1.0 → Implementation |
| Governance reviewer | Determine authority, maturity, unresolved issues and decision history | Governance |
| Researcher or auditor | Trace a claim from source through proposal, review and decision | Resources plus the record’s evidence panel |

The home page should expose six task shortcuts without adding global destinations:

- review developing SPDTF work;
- join or visit a working group;
- implement PDTF 1.0;
- check authority and maturity;
- find a term, source or decision;
- understand the continuation from PDTF 1.0 into SPDTF 2.0.

## Options considered

### Option A — mirrored generations

Create parallel PDTF 1.0 and SPDTF 2.0 trees, each with modelling, governance,
implementation and resources.

Rejected because it duplicates authority and lifecycle definitions, makes PDTF 1.0
look retired, and can make developing machine proposals look like the current
standard.

### Option B — keep the thirteen-section header

Retain the present structure and add work-area banners to individual pages.

Rejected because banners cannot repair the underlying task and authority mixture.
It would also leave “V2” as a misleading global concept.

### Option C — asymmetric task-and-authority structure

Distinguish PDTF 1.0 from work in development, give working-group review a direct
task path, and share Programme, Governance and Resources across the continuing
programme.

Chosen because it keeps implementation continuity visible while making participant
review the centre of SPDTF 2.0 development.

## Global navigation contract

| Position | Label | Purpose | Canonical landing |
|---:|---|---|---|
| 1 | Programme | Purpose, continuation, roadmap and policy context | `/programme` |
| 2 | SPDTF 2.0 Development | Current development method, work products and interoperability | `/spdtf-2` |
| 3 | Working groups | Task shortcut to the single SPDTF 2.0 working-group family | `/spdtf-2/working-groups` |
| 4 | PDTF 1.0 | Published implementation and derived semantic corpus | `/pdtf-1` |
| 5 | Governance | One authority, status, lifecycle and decision system | `/governance` |
| 6 | Resources | Source registry, library, glossary and historical records | `/resources` |

“Working groups” is not a second content owner. It links to the exact canonical
landing inside Develop SPDTF. Candidate, evidence, question and disposition records
exist once.

Home is provided by the wordmark. Search, glossary, design system, account and
feedback controls are utilities rather than primary destinations.

## Proposed hierarchy

```text
Home /
├── Programme /programme
│   ├── Purpose and scope
│   ├── Why the method changed
│   ├── PDTF 1.0 → SPDTF 2.0 relationship
│   ├── Roadmap and current programme status
│   ├── UK Smart Data policy, DUAA and prospective property-scheme context
│   ├── Organisations and forums
│   ├── Naming and identifier policy
│   └── SPDTF 2.0 development inputs
│       └── Property Pack seed — machine-generated, non-normative
├── SPDTF 2.0 Development /spdtf-2
│   ├── Overview: what SPDTF 2.0 development is and is not
│   ├── Evidence-up modelling method
│   ├── Inputs to the first ontology draft
│   │   └── Government Smart Data evidence and use-case constraints
│   ├── Working groups /spdtf-2/working-groups
│   │   ├── Finance and Banking
│   │   ├── Conveyancing
│   │   ├── Estate Agency
│   │   ├── Surveying and Valuation
│   │   ├── Property Data Services
│   │   ├── Property Technology
│   │   └── DBT Smart Data scheme-design group
│   │       └── OPDA-internal; no government status
│   ├── Interoperability working group
│   │   ├── Remit and membership
│   │   ├── Context map
│   │   ├── Small common boundary
│   │   ├── Cross-context mappings
│   │   ├── Shared conventions
│   │   └── Programme coverage matrix
│   ├── Candidate register
│   ├── Open questions and changes
│   └── Generated outputs and validation evidence
├── PDTF 1.0 /pdtf-1
│   ├── Overview, limitations and continuation
│   ├── Modelling — PDTF 1.0 material only
│   ├── Model
│   ├── Ontology — PDTF 1.0-derived ontology
│   ├── Mapping
│   ├── Schema and overlays
│   ├── Implementation
│   ├── Adoption evidence
│   └── Versions, compatibility and migration notices
├── Governance /governance
│   ├── Authority and decision rights
│   ├── Canonical status and provenance registry
│   ├── Standards lifecycle [proposed until separately accepted]
│   ├── Change, versioning and deprecation
│   ├── Assurance, conformance and validation
│   ├── Data stewardship, security, privacy and risk
│   ├── External statutory and prospective-scheme constraints
│   ├── Decisions, issues and feedback disposition
│   └── ADR and ODR registers, faceted by work area
└── Resources /resources
    ├── Source registry
    ├── Participant resources
    ├── Programme documents
    ├── Glossary and terminology
    ├── Meetings, recordings and transcripts
    ├── External standards, policy and research
    ├── Official Smart Data sources
    ├── Historical snapshots
    └── Machine-readable artefact manifests
```

The DBT Smart Data scheme-design group is the accepted OPDA cross-sector working
group for participants, roles, trust, consent, authorisation, accreditation,
liability, data-sharing obligations and cross-sector alignment. It is not a
government-established group and cannot confer statutory status. Interoperability
is a peer of the domain working groups, not a child of one group. Its SPDTF 2.0 work
lives in one place; Governance defines its decision rights.

## Standard working-group workspace

Every group uses one information shape:

```text
Working-group home
├── Charter, scope and decision owner
├── Participation and meeting routes
├── Evidence register
├── Glossary and data dictionary
├── Taxonomies and controlled vocabularies
├── Resources, relationships and constraints
├── Candidate versions
│   └── Plain-language model → evidence → questions → review → dispositions
├── Eight-category coverage statement
├── Change history and session records
└── Technical views and exports
```

Groups that are not convened must say so. Registration or a machine-generated page
does not confer membership, consensus or standards authority.

## Current-to-proposed placement

| Current global section | Proposed owner | Treatment |
|---|---|---|
| Strategy | Programme | Use SPDTF in current prose; retain URLs initially. |
| Governance | Governance | Keep one cross-programme authority tree. |
| DBT Smart Data | Programme; cross-link Governance, Resources and the OPDA-internal scheme-design group | Treat government policy as external context. Do not imply that the internal group is a designated property scheme body or that SPDTF is government-approved. |
| Engagement | Working groups for live actions; Resources for records | Keep DPMSG and OPDA groups explicitly distinct. |
| Modelling | PDTF 1.0 material | SPDTF 2.0 ADR/ODR records are faceted into SPDTF 2.0 Development or Governance. |
| Model | PDTF 1.0 | Label every tier as a PDTF 1.0 view. |
| V2 | Programme → SPDTF 2.0 development input | Rename in reader-facing navigation; preserve `/v2/**` and link it from SPDTF 2.0 inputs. |
| Ontology | PDTF 1.0 | Describe as the PDTF 1.0-derived ontology, not the unqualified SPDTF ontology. |
| Mapping | PDTF 1.0 | Retain as evidence, traceability and migration support. |
| Schema | PDTF 1.0 | Keep directly findable for implementers. |
| Implementation | PDTF 1.0 | Reachable within two interactions from every primary landing. |
| Adoption | PDTF 1.0 | Existing implementation evidence, not evidence that SPDTF 2.0 is adopted. |
| Library | Resources | Separate source records from internal working material by provenance. |

### Standalone and generated surfaces

| Current surface | Proposed treatment |
|---|---|
| `/` and `/home` | One future task gateway; retain both until a separate canonical/redirect decision. |
| `/glossary` | Resources utility with work-area and source facets. |
| `/design-system` | Utility/footer link, outside standards authority. |
| `/working-groups/join/**` | Working groups participation path. |
| `/presentation/working-group-kickoff` | Working-group orientation resource, not evidence or a decision. |
| `/modelling/property-pack` | Property Pack source-scope view; link to its SPDTF 2.0 development-input context. |
| `/modelling/adr/**`, `/modelling/odr/**` | Preserve URLs; assign navigation/search ownership per record work area. |
| `/pdtf/**` and `.ttl` | Preserve stable identifiers and label their PDTF 1.0 or historical naming context. |
| `/ontology/tools/**` | Preserve as PDTF 1.0 technical renderings. |
| Generated model, schema, mapping and ontology families | Apply owner/status once per generator, not by manual page moves. |
| `/resource`, data files, redirects and 404 | Preserve as utilities; include in the migration ledger. |

## The V2/Property Pack seed

Retire “V2” as a reader-facing information-architecture label. That technical path
name does not express authority, maturity or its relationship to SPDTF 2.0.

Use this full statement on the current corpus:

> **SPDTF 2.0 development input · Machine-generated Property Pack pre-draft ·
> Non-normative · No working-group review or approval recorded**

The seed is more than raw evidence: it is a structured, immutable and reviewable
pre-draft artefact. It may inform the first evidence-up work orders, but it must not
be called the SPDTF 2.0 ontology, a working-group candidate, an approved SPDTF model
or a replacement contract.

Keep `/v2/**` stable. Add contextual and forward links before considering any
canonical move.

## Candidate-review page contract

Every substantive SPDTF 2.0 development page should expose, in this order:

1. **Purpose and non-claim** — what is being reviewed and what authority it lacks.
2. **Five-field status line** — work area, authority, maturity, version and provenance.
3. **Plain-language model** — definitions, examples, relationships and diagram.
4. **Changes** — what changed since the previous immutable cut and why.
5. **Evidence** — participant, external, PDTF 1.0 and machine contributions separated.
6. **Open questions** — affected terms, evidence needed and decision owner.
7. **Review action** — how to challenge, contribute or confirm the content.
8. **Feedback disposition** — accepted, needs evidence, deferred or not accepted,
   with a reason and resulting change.
9. **Technical views** — RDF, OWL, SKOS, SHACL and generated schema beneath the
   business-language view.
10. **History and receipts** — sessions, work order, validation scope and artefacts.

Status must be readable in text, print and assistive technology. Colour or badges
may reinforce the words but never carry authority alone.

## Canonical status and provenance model

One versioned registry owned by Governance supplies five independent fields:

| Field | Examples | Question answered |
|---|---|---|
| Work area | PDTF 1.0; SPDTF 2.0 development input; SPDTF 2.0 development; cross-programme | Which body of work? |
| Authority | Published implementation; non-normative; governed release | What may a reader rely on? |
| Maturity | Evidence record; machine seed; under review; first working-group draft | What review has occurred? |
| Version | PDTF 1.0 release; candidate identifier; immutable cut | Which exact version? |
| Provenance | Participant-supplied; observed source; derived from PDTF 1.0; machine-generated; human-reviewed | Where did it come from? |

The vocabulary ceiling is **first working-group draft — non-normative** until a
separate accepted governance decision defines later promotion states. ADR-0068 is
currently Proposed, so its lifecycle cannot be presented as operative.

A successful machine validation proves conformance to encoded checks, not semantic
agreement. “Accepted ADR” also does not mean every confirmation condition is
operational.

## Route and migration contract

Navigation is a view over stable content addresses. Reorganisation does not require
moving thousands of generated pages.

### Required sequence

1. **Freeze the baseline inventory.** Use
   [the current-site IA](./current-site-information-architecture.md) as the mandatory
   migration ledger.
2. **Classify every entry.** Every authored route, generated family, bundled artefact,
   utility and alias receives: `keep`, `reframe`, `redirect` or `retire`; canonical
   content owner from the six-section taxonomy; accountable governance body where one
   exists; five-field status source; search facet; and cross-work-area relationship.
3. **Add context before movement.** Introduce landing pages, status strips,
   breadcrumbs, search facets and cross-links while existing URLs continue to work.
4. **Change global navigation coherently.** Do not mix old and new authority labels
   across route families.
5. **Redirect only semantic equivalents.** Test the destination’s claim, fragments,
   inbound links, refresh behaviour and previous/next navigation.
6. **Publish an explicit migration manifest.** Machine-readable dispositions and
   deterministic route tests become the release evidence.

### Non-negotiable URL rules

- Preserve `/pdtf/**` identifiers and their representations unless a separate
  identifier-governance decision authorises change.
- Keep `/v2/**` as the immutable seed cut during the first release.
- Treat each generated route family as an atomic unit.
- Do not duplicate content under new paths to make the hierarchy look symmetrical.
- Search for “PDTF” must find relevant SPDTF material while labelling historical
  results.
- A PDTF 1.0 to SPDTF 2.0 link must state whether the relationship is evidence,
  corroboration, compatibility, comparison, projection or supersession.

## Implementation sequence for a later decision

1. Create the canonical taxonomy, status registry and migration manifest schema.
2. Add the new landing pages and task paths without moving existing content.
3. Apply inherited work-area/status metadata to every route-family generator.
4. Build one standard working-group workspace and its review records.
5. Reframe the Property Pack seed and add forward links.
6. Replace the global navigation, breadcrumbs, search facets and home tasks as one
   coherent release.
7. Run route, accessibility, content-authority and task-finding gates.
8. Introduce redirects only for approved, tested semantic equivalents.

This proposal authorises none of those implementation changes by itself.

## Acceptance and release gates

The later implementation is not complete unless all of these pass:

- Every entry in the current-site inventory has an explicit migration disposition.
- Every generated page inherits work area, authority, maturity, version and provenance.
- A participant can reach their group, evidence, questions and review action without
  knowing RDF vocabulary.
- A current implementer can reach schema and validation guidance within two
  interactions and without entering anything labelled “archive”.
- A governance reviewer can identify who may decide and whether a decision occurred.
- Any deep-linked existing route and fragment still resolves or has a tested,
  semantically equivalent redirect.
- Search results expose work area and authority and treat PDTF as a historical alias.
- No page equates technical validation with semantic approval.
- Interoperability remains a peer of domain groups and has one canonical home in
  SPDTF 2.0 development.
- The whole release passes the project’s route crawl, accessibility, responsive,
  keyboard, visual-regression, unit and build gates.

## Council record

The proposal was developed through a hierarchical, specialised Ruflo council using
Raft consensus. The chair was non-voting. Independent priors were produced before
cross-examination.

| Seat | Native provider/model | Effort | Contribution |
|---|---|---:|---|
| Information architect | OpenAI `gpt-5.6-terra` | high | Task model, hierarchy, placement and migration |
| Standards historian | OpenAI `gpt-5.6-terra` | high | Terminology, ADR standing and authority boundaries |
| Devil’s Advocate | OpenAI `gpt-5.6-sol` | xhigh | Hard-fail conditions and scored adversarial review |
| Fable experience authority | Anthropic `claude-fable-5` | max for independent prior; high/medium for bounded review | Working-group surface, page patterns, usability and continuity challenge |

The first synthesis scored 83/100 because it treated PDTF 1.0 as an archive and
assigned the seed too strongly to the new work. The corrected synthesis
scored 98/100 with no hard failures from the Devil’s Advocate. Fable then required
three mechanical corrections: one canonical working-group family, work-area-aware
decision-record filing, and a complete inventory-bound migration ledger. Those
corrections are part of this proposal, and Fable’s regrade accepted it at 98/100 with
no hard failure.

### Held dissent

- Fable would place PDTF 1.0 before SPDTF 2.0 Development in the navigation
  because implementation is the majority task today. The chosen order is
  programme-first; task testing must validate it before implementation.
- The information architect prefers describing the seed as a structured pre-draft
  candidate rather than “evidence” alone. The full label therefore says SPDTF 2.0
  development input and machine-generated pre-draft, and the body records its
  structured nature.
- “Working groups” must remain visibly and technically a shortcut into SPDTF 2.0
  Development, not become a second owner.

## Unresolved governance decisions

1. Whether PDTF 1.0 receives a defined support period during migration.
2. The future SPDTF IRI/namespace policy and relationship to `/pdtf/**`.
3. Promotion states above first working-group draft and their decision thresholds.
4. Consent, access and confidentiality rules for participant evidence and discussion.
5. Whether `/` and `/home` should eventually become one canonical landing.
6. The discussion system, moderation policy and durable feedback-disposition record.
7. Whether navigation ordering should favour current implementers or SPDTF 2.0 work.
