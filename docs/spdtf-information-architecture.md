# SPDTF information architecture

Status: **implementation in progress on `main`; publication pending**<br>
Date: 2026-08-23<br>
Decision records: [ADR-0074](./adr/ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md) · [ADR-0077](./adr/ADR-0077-place-pdtf-schema-beneath-spdtf-as-third-party-input.md)<br>
Review artefact: [HTML presentation](./spdtf-information-architecture.html)
## Executive decision

Reorganise the documentation around six global destinations, in this order:

1. **Programme**
2. **Governance**
3. **Semantic modelling**
4. **SPDTF Development**
5. **Working groups** — a direct shortcut into the SPDTF workspace
6. **Resources**

`SPDTF Development` is the global-navigation label for `/spdtf`; it does not rename SPDTF, create a numbered generation or imply adoption. Semantic modelling is a peer destination at `/semantic-modelling/**`, not a branch beneath SPDTF Development. This remains an asymmetric schema-to-scheme structure: the existing PDTF schema is a third-party input beneath SPDTF Development, its separately derived evidence retains a distinct draft status, and stable `/pdtf/**` RDF identifiers remain unchanged.

The navigation, hierarchy, status model and preservation gates form one coherent system. Implementing that system does not by itself publish or deploy the production site. ADR-0075 authorises the no-redirect Property Pack move; ADR-0077 authorises the no-redirect PDTF-schema input move while preserving `/pdtf/**` identifiers.
## Terminology and authority

- **SPDTF** means **Smart Property Data Trust Framework**. It is the first collaboratively authored scheme draft, developed with industry working groups and stakeholders. It remains under development until its governance records say otherwise.
- **PDTF schema** means the existing Digital Property Pack JSON Schema package, overlays, dictionary and glossary. It is not an OPDA-endorsed prior scheme.
- **Schema-derived ontology** means the separate draft semantic corpus extracted from PDTF-schema material. It is attributed evidence, not part of the schema and not an endorsed scheme.
- **PDTF** remains technically exact in package names, source records and stable `/pdtf/**` identifiers; those identifiers do not confer scheme endorsement.
- **The Property Pack ontology** is a machine-generated, non-normative component of SPDTF. The Technical Working Group determination is pending; later domain-group review remains a separate status. It is not merely an external development input and it is not the whole SPDTF ontology.

## Why the structure must change
The previous header presented thirteen peer sections. It mixed programme context, governance, policy, the existing schema implementation, a machine-generated seed and historical resources. A reader could not reliably infer which material was operative, proposed, historical or under review.

The programme is moving from a schema-led exchange artefact to a collaboratively governed scheme:

| Dimension | PDTF schema and separately labelled derived evidence | SPDTF |
|---|---|---|
| Starting point | JSON Schemas, overlays, dictionaries, glossary, documents and implementation material | Participant evidence, recognised sources, domain questions and attributed PDTF schema evidence |
| Method | Schema-led; ontology and related views derived from the existing corpus | Domain-led, evidence-up ontology modelling in bounded contexts |
| Authority | Existing schema package; supporting and derived artefacts retain their own status | Human working groups own domain meaning; governance controls later promotion |
| Primary outputs | Schemas, overlays, dictionary, glossary and implementation material; a separate schema-derived ontology and mappings | Reviewable model candidates, evidence lineage, questions, dispositions and governed downstream projections |

The PDTF schema is not discarded. Its dictionary, glossary, documentation and JSON Schemas remain useful for compatibility, constraints, coverage and migration. The schema-derived ontology and mappings are separately attributed evidence; neither should determine SPDTF identities or relationships merely because meanings were previously encoded in a tree or extracted model.

## Evidence and implementation proof

The architecture is grounded in:

- the [current-site route inventory](./current-site-information-architecture.md), which accounts for 2,552 canonical pages and 3,436 routable HTML URLs;
- the working-group presentation, especially its schema-to-scheme progression, evidence-to-candidate loop, bounded-context and human-review material;
- [ADR-0063](./adr/ADR-0063-domain-led-bounded-context-working-groups.md), which adopts domain-led bounded-context working groups;
- [ADR-0064](./adr/ADR-0064-modelling-website-revamp-before-strategy-publication.md), which requires a coherent follow-on IA and preserves the existing implementation pending migration;
- [ADR-0066](./adr/ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md) and [ADR-0067](./adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md), which distinguish source scope, machine proposals and human semantic authority;
- the accepted council protocol in ADR-0067 and the project’s current OPDA design contract.

The implementation is made auditable by:

- an executable route, ownership and status contract in `src/lib/site-ia.mjs`;
- a frozen before/after route manifest covering 3,436 baseline routes and every retained fragment, plus classified records for 64 new routes;
- exact path, size and SHA-256 manifests for high-risk source, council, ontology,
  data, UI, image, tool and Property Pack route families;
- end-to-end journeys for authentication, comments, source viewing/download and
  working-group submissions; and
- fail-closed build, route, accessibility, responsive, keyboard, visual and
  information-preservation gates before deployment credentials are available.

Three explicit exceptions replace the earlier retain-by-default route policy. The Property Pack corpus moves to `/spdtf/property-pack/**`; PDTF-schema documentation moves beneath `/spdtf/inputs/pdtf-schema/**` as third-party input; and semantic-modelling reader pages move from `/spdtf/ontologies/**` to `/semantic-modelling/**`. None emits an old route or redirect. Move-aware receipts bind every old route, information block and fragment to its declared replacement. The published `/pdtf/**` RDF identifiers are not documentation aliases and remain exact.

The build counts describe different surfaces: Astro reports 2,607 pages it renders; preservation and the crawler see 3,489 HTML files after copied/generated static HTML is included; the crawler's 5,289 emitted files also include non-HTML data and support assets. All three denominators are therefore expected and independently gated.

## How DBT Smart Data fits

DBT Smart Data is a UK government programme for secure, trusted data sharing across the economy. Part 1 of the [Data (Use and Access) Act 2025](https://www.legislation.gov.uk/ukpga/2025/18/notes/division/4/index.htm) provides regulation-making powers for schemes that can give customers or authorised third parties access to customer and business data. [Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy) sets the cross-economy direction.

Property is a prospective scheme area, not a designated operating scheme. DBT’s [8 July 2026 call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence) says property use cases still require feasibility analysis, governance design, legal assessment and formal consultation before regulatory change. The [Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap) likewise commits government to evidence gathering and a later property-scheme consultation. It recognises OPDA’s trust-framework testing as market activity and says government will work with industry on accreditation criteria for data standards; it does not designate OPDA, PDTF schema or SPDTF as the statutory scheme or its approved standard.

The site must therefore use this relationship:

- **DBT Smart Data** is external government policy, statutory enablement and scheme design context.
- **SPDTF** is an OPDA-led standards programme that contributes evidence and tested approaches to prospective property Smart Data work.
- **Programme** owns the canonical UK Smart Data context page; **Governance** owns the external-constraint view; **Resources** holds the official sources; and **SPDTF** links the relevant evidence into modelling work.
- The [Smart Data Council](https://www.gov.uk/government/groups/smart-data-council) is advisory. OPDA representation is a participation channel, not government authority for SPDTF.
- The accepted OPDA working-group roster includes a **DBT Smart Data cross-sector scheme-design group**. It is an OPDA-internal group and modelling lens; its name and work do not make it a government-established property-scheme body.

Safe summary: **SPDTF contributes to the UK’s prospective property Smart Data work; it is not an approved statutory property Smart Data scheme.**

## Why ontologies and how SPDTF uses them

JSON Schema is effective at saying where a value belongs in one document or exchange. An ontology answers a different question: what a thing means, how it is identified and how it relates to other things across documents, organisations and professional contexts.

| Need | What the ontology contributes |
|---|---|
| Shared meaning | Explicit definitions, identities, relationships and rules that do not depend on one form’s tree structure. |
| Local precision | Context-owned models let professions use precise local meanings instead of flattening them into one universal vocabulary. |
| Safe exchange | A small common boundary and governed mappings state how meanings cross context boundaries. |
| Traceability | Terms and decisions link to evidence, provenance, questions, review and dispositions. |
| Reusable delivery | One governed semantic package can support tested schemas, forms, APIs, validation and documentation without making RDF a participant prerequisite. |

An ontology does not make source data true, approve a standard, grant runtime access or guarantee a correct projection. Deterministic checks prove only the rules they execute; working groups judge domain meaning and recorded governance authorises promotion.

### From evidence to governed outputs

```text
Attributed evidence + competency questions
→ context-owned glossary, dictionary, resources, relationships and vocabularies
→ ontology candidate + constraints + provenance + coverage receipt
→ deterministic conformance checks
→ readable candidate, questions, review and disposition
→ immutable governed version
→ tested JSON Schema, forms, APIs, validation and documentation projections
```

Domain working groups own local meaning. The Interoperability Working Group owns the small common boundary, context map, cross-context mappings and shared conventions. Governance owns lifecycle and promotion; Resources owns source records. AI may extract, compare and draft, but it receives no standards authority.

The workshop exposes six reviewable kinds of semantic content: **business glossary, data dictionary, taxonomies, controlled vocabularies, resources and relationships**. RDF/OWL, SKOS, SHACL, JSON Schema, forms and documentation are aligned representations or projections of that agreement, not independent specifications.

### Coverage: eight formal concerns and eleven workshop themes

Every group must assess the eight formal ontology-coverage concerns from accepted [ADR-0063](./adr/ADR-0063-domain-led-bounded-context-working-groups.md) and [ADR-0067](./adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md): **Domain structure; Vocabulary and taxonomy; Classification metadata; Provenance and quality; Access control and data sensitivity; Validation and constraints; Temporal state and history; Cross-domain mappings.** Each receives one disposition: `model here`, `reuse shared`, `boundary contribution` or `not applicable` with a rationale.

The presentation uses a separate, participant-facing completeness lens:

| Workshop lens | Eleven plain-language themes | Formal treatment |
|---|---|---|
| Meaning | Domain structure; Controlled vocabulary; Taxonomy; Classification | Maps to the first three formal concerns. |
| Trust | Governance and compliance; Provenance and quality; Sensitivity and access | Governance is an operating concern; the other two map to formal concerns. |
| Correctness | Validation constraints; Time and history | Maps to validation and temporal concerns. |
| Exchange | Cross-domain mappings; Common ontology | Mapping is a formal concern; the common ontology is a small architectural boundary, not a ninth category. |

### Standards and modelling profile

The Semantic modelling standards page must record, for every item: purpose; exact version and conformance level; `reuse`, `reference`, `map` or `mint` mechanism; decision status; owner; evidence/decision; and re-open trigger. It must begin with this bounded profile:

| Profile role | Standards and technologies | Current standing |
|---|---|---|
| Core semantics | RDF 1.2 Basic, RDFS, OWL 2 and SKOS | Accepted modelling targets; each candidate declares the features actually used. |
| Query and constraints | Portable SPARQL 1.2 subset; SHACL 1.2 Core initially | Accepted targets, tested fail-closed. No full RDF 1.2 or SHACL Union claim without feature evidence. |
| Metadata, provenance and time | Dublin Core Terms, DCAT 3, PROV-O, DQV and OWL-Time | Concern-specific candidates, adopted only where a documented requirement and decision justify them. |
| Sensitivity and authorisation | DPV, DPV-PD and DPV-LEGAL; ODRL where justified | Concern-specific semantic candidates; they do not implement runtime access control. |
| Cross-context alignment | SKOS mapping predicates; SSSOM mapping records | SKOS is an accepted bounded target but no mapping predicates are currently emitted. SSSOM is a deferred candidate for mapping-record exchange only. Avoid unjustified `owl:sameAs`. |
| Domain and methodology references | FIBO, GeoSPARQL, Schema.org, VC/DID, ORG, ISO 23386, UFO/OntoClean and alternatives | Evidence to assess, not inherited adoption or wholesale imports. |
| Delivery projections | JSON Schema, JSON-LD, forms, APIs, website, PDF and Markdown | Tested downstream representations; never the source of semantic authority. |

“Mapping” must always be qualified: PDTF schema **RML schema–ontology verification**; planned legacy **JSON-LD contexts**; SPDTF **cross-context semantic mappings**; Property Pack **source-item coverage links** (not RML/R2RML); or an optional deployment **transformation runtime**. These records must not share an ambiguous status or owner.

## Audiences and tasks

| Audience | Primary task | First destination |
|---|---|---|
| Reader learning about ontologies | Understand ontology purpose, terminology and how to read the model | Semantic modelling |
| Working-group participant | Understand scope, contribute evidence, review meaning and see dispositions | Working groups |
| Domain steward or facilitator | Manage evidence, questions, candidate versions and review records | SPDTF Development → Working groups |
| Interoperability representative | Compare context meanings and agree boundaries or mappings | SPDTF Development → Interoperability |
| Current implementer | Find the existing schemas, validation and implementation guidance | SPDTF Development → Third-party inputs |
| Governance reviewer | Determine authority, maturity, unresolved issues and decision history | Governance |
| Researcher or auditor | Trace a claim from source through proposal, review and decision | Resources plus the record’s evidence panel |

The public home page should mirror the six global destinations in their accepted order, expressed as audience-led tasks:
- understand the programme purpose, direction, roadmap and policy context;
- check governance, authority, maturity and lifecycle;
- learn about ontologies or follow the SPDTF semantic-modelling method;
- review developing SPDTF candidates, questions, outputs and attributed inputs;
- join or visit a working group; and
- trace a term, source, standard, recording or decision.

Current implementers still reach the PDTF schema through **SPDTF Development → Third-party inputs**. It remains findable without becoming a peer homepage destination or SPDTF's organising story.

## Options considered

| Option | Disposition | Reason |
|---|---|---|
| Mirrored generations | Rejected | Duplicates authority and makes developing material look like a parallel standard. |
| Keep thirteen-section header | Rejected | Page banners cannot repair the mixed task and authority model or the misleading “V2” label. |
| Asymmetric task-and-authority structure | Chosen | Keeps implementation continuity visible while centring participant review and sharing governance/resources. |

## Global navigation contract

| Position | Label | Purpose | Canonical landing |
|---:|---|---|---|
| 1 | Programme | Purpose, schema-to-scheme transition, roadmap and policy context | `/programme` |
| 2 | Governance | One authority, status, lifecycle and decision system | `/governance` |
| 3 | Semantic modelling | Plain-language ontology learning and the modelling method used for SPDTF | `/semantic-modelling` |
| 4 | SPDTF Development | Collaborative scheme-development work products, candidates and inputs | `/spdtf` |
| 5 | Working groups | Task shortcut to the single SPDTF working-group family | `/spdtf/working-groups` |
| 6 | Resources | Source registry, library, glossary and historical records | `/resources` |

Semantic modelling is a peer reader destination and route family, but it acquires no independent standards authority: human working groups still own domain meaning and Governance controls promotion. “Working groups” is not a second content owner. It links to the exact canonical landing inside SPDTF Development. Candidate, evidence, question and disposition records exist once.

ADR-0074 amends only the top-level placement clauses in ADR-0002, ADR-0041, ADR-0059 and ADR-0062. Their generation, traceability and provenance decisions survive. ADR-0074 is Accepted while this navigation correction is implemented and validated on `main`; ADR-0075 governs the authorised Property Pack consolidation described below, without authorising publication.

Home is reached through the wordmark. Programme is the home task gateway's content owner and may therefore be shown as current there. Search, glossary, design system, account and feedback controls are utilities rather than primary destinations. In every left rail, each category heading is the category's canonical page link; a separate 44px disclosure controls its children, the landing is not repeated as a child, and the category page remains in breadcrumbs and the previous/next sequence.

## Accepted hierarchy

```text
Home /
├── Programme /programme
│   ├── Purpose and scope
│   ├── Why the method changed
│   ├── PDTF schema → SPDTF relationship
│   ├── Roadmap and current programme status
│   ├── UK Smart Data policy, DUAA and prospective property-scheme context
│   ├── Organisations and forums
│   ├── Naming and identifier policy
│   └── Evidence and external programme context
├── Governance /governance
│   ├── UK initiative context
│   ├── OPDA organisation
│   ├── Standards landscape
│   ├── OPDA rules — current, draft and proposed status retained per page
│   ├── Operating Model
│   ├── Quality and security
│   ├── Architecture and ontology decision indexes
│   └── Programme decisions
├── Semantic modelling /semantic-modelling
│   ├── Understand ontologies /semantic-modelling/why-ontologies
│   │   ├── How to read the model
│   │   ├── The semantic package and context boundaries
│   │   └── Standards, evidence, mappings, validation and projections
│   └── How we model SPDTF /semantic-modelling/modelling-method
│       ├── Modelling rules and lenses
│       └── Coverage checklist
├── SPDTF Development /spdtf
│   ├── Overview: the first collaborative scheme draft, its scope and status
│   ├── Property Pack ontology /spdtf/property-pack
│   │   ├── Definition and 451-item scope
│   │   ├── PDTF schema lineage and incomplete semantic crosswalk
│   │   ├── Model, contexts, resources, relationships and vocabularies
│   │   ├── Candidate source coverage, shapes, standards and validation
│   │   ├── Technical Working Group determination — due by end September 2026
│   │   └── Later domain review, versions and releases
│   ├── Candidate register
│   ├── Open questions and changes
│   ├── Third-party inputs /spdtf/inputs
│   │   └── PDTF schema /spdtf/inputs/pdtf-schema
│   │       ├── Schema and supporting material /spdtf/inputs/pdtf-schema/schema-and-supporting-material
│   │       │   ├── JSON Schemas and overlays /spdtf/inputs/pdtf-schema/schema-and-supporting-material/schema
│   │       │   ├── Data dictionary /spdtf/inputs/pdtf-schema/schema-and-supporting-material/data-dictionary
│   │       │   ├── Business glossary /spdtf/inputs/pdtf-schema/schema-and-supporting-material/business-glossary
│   │       │   ├── Implementation guidance /spdtf/inputs/pdtf-schema/schema-and-supporting-material/implementation
│   │       │   └── Usage and implementation evidence /spdtf/inputs/pdtf-schema/schema-and-supporting-material/adoption
│   │       └── Schema-derived ontology /spdtf/inputs/pdtf-schema/schema-derived-ontology
│   │           ├── Lineage, provenance and verification /spdtf/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification
│   │           ├── Model views by audience /spdtf/inputs/pdtf-schema/schema-derived-ontology/model-views-by-audience
│   │           ├── Concepts and architecture /spdtf/inputs/pdtf-schema/schema-derived-ontology/concepts-and-architecture
│   │           ├── Terms and model resources /spdtf/inputs/pdtf-schema/schema-derived-ontology/terms-and-model-resources
│   │           ├── Validation and examples /spdtf/inputs/pdtf-schema/schema-derived-ontology/validation-and-examples
│   │           ├── Trust, governance and limitations /spdtf/inputs/pdtf-schema/schema-derived-ontology/trust-governance-and-limitations
│   │           └── Use and tooling /spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling
│   └── Generated outputs and validation evidence
├── Working groups /spdtf/working-groups
│   ├── Member guide: access; Teams; SharePoint evidence; meetings; model review
│   └── Group workspaces
│       ├── Six property contexts
│       ├── DBT Smart Data scheme-design group — OPDA-internal; no government status
│       └── Interoperability — peer owner of boundaries, mappings and shared conventions
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
is a peer of the domain working groups, not a child of one group. Its SPDTF work
lives in one place; Governance defines its decision rights.

The member guide is operational guidance, not a second standards process. It states
which Microsoft workspaces are implemented, keeps private links and rosters out of the
public site, and labels the ADR-0065 modelling method and ADR-0068 lifecycle as proposed.

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
├── Coverage: eight formal concerns plus four workshop lenses / eleven themes
├── Change history and session records
└── Technical views and exports
```

Groups that are not convened must say so. Registration or a machine-generated page
does not confer membership, consensus or standards authority.

## Current-to-implemented placement

| Current global section | Canonical owner | Implemented treatment |
|---|---|---|
| Strategy | Programme | Use SPDTF in current prose; retain URLs initially. |
| Governance | Governance | Keep one cross-programme authority tree. |
| DBT Smart Data | Programme; cross-link Governance, Resources and the OPDA-internal scheme-design group | Treat government policy as external context. Do not imply that the internal group is a designated property scheme body or that SPDTF is government-approved. |
| Engagement | Working groups for live actions; Resources for records | Keep DPMSG and OPDA groups explicitly distinct. |
| Modelling | Semantic modelling; schema-derived ontology evidence | Move historical method pages under schema-derived-ontology lineage; keep ADR/ODR routes Governance-owned. Re-author reusable lessons into the top-level Semantic modelling destination with provenance. |
| Model | Schema-derived ontology evidence | Move the complete model-view family beneath the derived ontology; retain each tier and child artefact's own maturity. |
| V2 Property Pack corpus | SPDTF → Property Pack ontology | Move the complete 690-page technical family to `/spdtf/property-pack/**`; remove `/v2/**` without redirects. |
| Ontology | PDTF schema | Move the reader reference beneath `/spdtf/inputs/pdtf-schema/schema-derived-ontology`; preserve route-level status and the separate `/pdtf/**` identifier namespace. |
| Mapping | PDTF schema; cross-link SPDTF | Move beneath qualified lineage/verification while retaining its independent bridge role; do not confuse RML with JSON-LD, semantic mapping or coverage links. |
| Schema | PDTF schema | Move beneath `/spdtf/inputs/pdtf-schema/schema-and-supporting-material`; keep directly findable and treat future schemas as governed projections. |
| Implementation | PDTF schema | Move beneath the schema-and-supporting-material branch and remain reachable within two interactions. |
| Adoption | PDTF schema | Move as explicitly labelled evidence; it neither becomes normative nor proves SPDTF adoption. |
| Library | Resources | Separate source records from internal working material by provenance. |

### Standalone and generated surfaces

| Current surface | Implemented treatment |
|---|---|
| `/` | Public Programme-owned gateway: SPDTF purpose, visible status and six audience/task cards in the canonical global order. |
| `/home` | Separate member task gateway; retain it until a canonical/redirect decision is made. |
| `/glossary` | Resources utility with work-area and source facets. |
| `/design-system` | Utility/footer link, outside standards authority. |
| `/working-groups/join/**` | Working groups participation path. |
| `/presentation/working-group-kickoff` | Working-group orientation resource, not evidence or a decision. |
| `/modelling/property-pack` | Move the complete interactive source catalogue to `/spdtf/property-pack/definition-and-scope`; remove the old route without a redirect. |
| `/spdtf/ontologies/**` | Move the complete reader family by exact suffix to `/semantic-modelling/**`; remove every old route without a redirect, rewrite alias or duplicate page. |
| `/modelling/adr/**`, `/modelling/odr/**` | Preserve URLs; assign navigation/search ownership per record work area. |
| `/pdtf/**` and `.ttl` | Preserve stable identifiers and label their PDTF schema or historical naming context. |
| `/ontology/tools/**` | Move atomically to `/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/**`; preserve the complete technical-rendering inventory. |
| `/ontology/artefacts/**` (27 files) | Move atomically to `/spdtf/inputs/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**`; preserve bytes, internal links and per-file authority. |
| `/council/**` and its manifest (261 Markdown files) | Governance owns decision/status context; Resources owns raw evidence. Preserve paths, deterministic generation and rewritten links. |
| `/resources/**` and `/resource?path=source/**` (1,620 source records) | Resources source registry: preserve logical paths, checksums, open/download behaviour, provenance, rights and the production origin contract. |
| `/data/**` (46 build outputs) | Preserve paths or regenerate deterministically; record each output's semantic owner, checksum and consumers. |
| Generated model, schema, mapping and ontology families | Apply owner/status once per generator, not by manual page moves. |
| `/ui/**` and `/images/**` support assets | Preserve or replace only with verified consuming-page presentation and interaction parity. |
| `/resource`, redirects and 404 | Preserve as utilities; include in the migration ledger. |
| Authentication, comments and working-group submissions | Cross-cutting runtime services, not content pages; record dependencies, data ownership, permissions and continuity in a separate service ledger. |

## The Property Pack ontology

Retire “V2” as a reader-facing label and path. The exact no-redirect mapping is: old
`/v2` → `/spdtf/property-pack`; old `/v2/comparison` → `/spdtf/property-pack/pdtf-schema-lineage`; every other old `/v2/{suffix}` → `/spdtf/property-pack/{suffix}`; and old `/modelling/property-pack` → `/spdtf/property-pack/definition-and-scope`.

Use this full statement on the current corpus:

> **SPDTF · Property Pack ontology candidate · Machine-generated · Non-normative · Technical Working Group determination pending · Later domain review pending**

The candidate is a priority component of SPDTF, not the whole ontology or an
approved exchange contract. Its current `0.1.0-draft` source cut remains immutable;
a determination or later revision receives a distinct version and change record.

The old `/v2/**` and `/modelling/property-pack` paths are intentionally absent. Route
compatibility was declined; content, fragments and comment identity are preserved by
the migration contract rather than redirects.

## Candidate-review page contract

Every substantive SPDTF page should expose, in this order:

1. **Purpose and non-claim** — what is being reviewed and what authority it lacks.
2. **Five-field status line** — work area, authority, maturity, version and provenance.
3. **Plain-language model** — definitions, examples, relationships and diagram.
4. **Changes** — what changed since the previous immutable cut and why.
5. **Evidence** — participant, external, PDTF schema and machine contributions separated.
6. **Open questions** — affected terms, evidence needed and decision owner.
7. **Review action** — how to challenge, contribute or confirm the content.
8. **Feedback disposition** — accepted, needs evidence, deferred or not accepted,
   with a reason and resulting change.
9. **Technical views** — RDF, OWL, SKOS, SHACL and generated schema beneath the
   business-language view.
10. **History and receipts** — sessions, competency questions, standards-profile
    version, coverage receipt, immutable diff, validation scope and artefacts.

Status must be readable in text, print and assistive technology. Colour or badges may reinforce the words but never carry authority alone.

## Canonical status and provenance model

One versioned registry owned by Governance supplies five independent fields:

| Field | Examples | Question answered |
|---|---|---|
| Work area | PDTF schema; SPDTF; Property Pack ontology; cross-programme | Which body of work? |
| Authority | Existing schema; non-normative candidate; governed release | What may a reader rely on? |
| Maturity | Evidence record; machine seed; under review; first working-group draft | What review has occurred? |
| Version | PDTF schema release; candidate identifier; immutable cut | Which exact version? |
| Provenance | Participant-supplied; observed source; derived from PDTF schema; machine-generated; human-reviewed | Where did it come from? |

The vocabulary ceiling is **first working-group draft — non-normative** until a
separate accepted governance decision defines later promotion states. ADR-0068 is
currently Proposed, so its lifecycle cannot be presented as operative.

A successful machine validation proves conformance to encoded checks, not semantic
agreement. “Accepted ADR” also does not mean every confirmation condition is
operational.

## Route and migration contract

Navigation is normally a view over stable content addresses. ADR-0074, ADR-0075 and
ADR-0077 authorise three bounded no-redirect moves with explicit receipts: the
semantic-modelling reader family, the Property Pack family and all PDTF-owned reader
documentation. RDF identifiers remain outside them.

### Required sequence

1. **Freeze the baseline inventory.** Use
   [the current-site IA](./current-site-information-architecture.md) plus the dependency
   families above as the mandatory migration ledger.
2. **Classify every entry.** Every authored route, generated family, bundled artefact,
   source/archive record, machine representation, runtime service, support-asset dependency,
   utility and alias receives: `keep`, `reframe`, `redirect` or `retire`; canonical
   content owner from the six-destination taxonomy; accountable governance body where one
   exists; five-field status source; search facet; cross-work-area relationship; current
   path, content checksum, preserved destination and consumers.
3. **Add context before movement.** Introduce landing pages, status strips,
   breadcrumbs, search facets and cross-links before changing a route family.
4. **Change global navigation coherently.** Do not mix old and new authority labels
   across route families.
5. **Record an explicit route decision.** Retain by default; redirect only semantic
   equivalents; remove without redirect only with operator authority and a move receipt.
6. **Publish an explicit migration manifest.** Machine-readable dispositions and
   deterministic route tests become the release evidence.

### Non-negotiable URL rules

- Preserve `/pdtf/**` identifiers and representations exactly; they are not old documentation routes or compatibility aliases.
- Move `/spdtf/ontologies` to `/semantic-modelling` and preserve every descendant suffix beneath `/semantic-modelling/**`; emit no old route, redirect, rewrite alias or duplicate page.
- Apply the exact Property Pack mapping above atomically; emit no compatibility route.
- Apply ADR-0077's owner-based PDTF schema route map atomically; emit no old documentation route, `/manual/**` alias, redirect or duplicate canonical page.
- Treat each generated route family as an atomic unit and preserve logical comment identity.
- Do not duplicate content under new paths to make the hierarchy look symmetrical.
- Search for “PDTF” must distinguish the current PDTF schema label, the separately
  status-labelled schema-derived ontology and SPDTF records that cite either source.
- A PDTF schema to SPDTF link must state whether the relationship is evidence,
  corroboration, compatibility, comparison, projection or supersession.

## Implementation plan and record

1. The canonical taxonomy, status registry and migration-manifest schema are executable.
2. New landing pages and task paths must preserve existing information; authorised
   obsolete semantic-modelling, Property Pack and PDTF schema documentation URLs are
   removed without redirects.
3. Work-area/status metadata is resolved centrally for every classified route family.
4. All eight working groups use one truthful pre-convening workspace contract, with empty candidate/output registers rather than fabricated decisions.
5. The 690 technical Property Pack routes must move atomically beneath the canonical
   branch; the 451-item catalogue is folded into it and lifecycle pages are added.
6. Global navigation, breadcrumbs, search facets and home tasks change together.
7. The migration receipt composes the documentation cuts into `/semantic-modelling/**`, `/spdtf/inputs/pdtf-schema/**` and `/spdtf/**`, while keeping 1,090 `/pdtf/**` identifier-family pages unchanged.
8. Route, accessibility, content-authority, task-finding and runtime-continuity gates run before release.
9. No redirect is introduced without a semantic-equivalence receipt and test.

This implementation record authorises no publication by itself. Deployment remains a separate, explicit and fail-closed operation.

## Acceptance and release gates

The implementation is not releasable unless all of these pass:

- Every entry in the current-site inventory has an explicit migration disposition.
- Source objects, council records, ontology artefacts, data/support assets and runtime
  services have owners plus count, checksum, consumer, endpoint and journey parity checks.
- Every generated page inherits work area, authority, maturity, version and provenance.
- The Semantic modelling destination explains why ontologies, the evidence-to-release loop,
  the six semantic outputs and the boundary between meaning and projections.
- Every group exposes the exact eight formal concerns and four allowed dispositions;
  the separate four-lens/eleven-theme workshop crosswalk remains intact.
- Every standards-profile entry records status, mechanism, owner, version/conformance,
  evidence and re-open trigger; legacy standards claims are not inherited.
- RML, JSON-LD, cross-context, coverage and runtime mappings are unambiguous.
- All six semantic outputs and technical projections cite one versioned package
  manifest; no representation becomes an independent source of meaning.
- A participant can reach their group, evidence, questions and review action without
  knowing RDF vocabulary.
- A current implementer can reach schema and validation guidance within two interactions and without entering anything labelled “archive”.
- A governance reviewer can identify who may decide and whether a decision occurred.
- The public root renders the six canonical destination labels and URLs in exact order, centres collaborative SPDTF purpose and status, and gives PDTF no standalone promotion.
- Every route is retained or covered by an explicitly authorised move/retirement
  receipt; every retained or moved fragment resolves at its destination, and every
  retired `/spdtf/ontologies/**` or PDTF documentation route is absent without a redirect.
- Search results expose work area and authority and distinguish the PDTF schema from SPDTF records that cite it.
- No page equates technical validation with semantic approval.
- Interoperability remains a peer of domain groups and has one canonical home in
  SPDTF.
- The whole release passes the project’s route crawl, accessibility, responsive,
  keyboard, visual-regression, unit and build gates.

## Council record

The full multi-model council evidence, scores, gates and dissent are recorded in ADR-0074. Its 2026-08-23 amendment records the operator's global-navigation and semantic-modelling route correction. ADR-0075 records the later correction that Property Pack is an accelerated SPDTF ontology component; Working groups remains a shortcut to one owner. Neither review authorises publication.

## Unresolved governance decisions

1. PDTF schema support period and the future SPDTF IRI/namespace relationship to `/pdtf/**`.
2. Promotion states above first working-group draft and their decision thresholds.
3. Consent, access, confidentiality, moderation and durable feedback disposition.
4. Whether `/` and `/home` should eventually become one canonical landing.
5. Which candidate vocabularies and modelling frameworks the standards profile accepts, defers or excludes.
