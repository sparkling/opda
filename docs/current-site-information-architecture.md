# Current site information architecture

Status: current-state inventory  
Captured: 2026-08-18  
Implementation baseline: `3e06f29`  
Site: `https://opda.org.uk`

## Purpose and scope

This document records the information architecture implemented by the current Astro site before any restructuring. It covers canonical pages, generated page families, standalone public experiences, utility pages, bundled ontology-tool output, and redirects. It describes what exists; it does not propose a replacement hierarchy.

Every authored or index page is listed individually. Repeated generated records are listed by route family, exact count, child grouping, and common page contents. This keeps the inventory reviewable while still accounting for every emitted route; the corresponding index pages enumerate the individual records.

The inventory is derived from:

- `src/lib/site.ts`, the primary-header and sidebar taxonomy;
- every route under `src/pages/`, including each `getStaticPaths()` family;
- `src/content.config.ts` and the ADR, ODR, manual, ontology and V2 registries;
- the locally rendered `dist/sitemap-0.xml` and emitted HTML;
- the static ontology documentation bundles under `public/ontology/`;
- redirects in `astro.config.mjs`.

The governing IA decisions are Accepted: ADR-0002 (semantic folder hierarchy), ADR-0003 (build-time Astro navigation), ADR-0016 (generated model/manual routes), ADR-0042 (`/manual` renamed to `/model`), ADR-0059 (Mapping placed between Ontology and Schema), ADR-0062 (DBT Smart Data section), and ADR-0064 (the separate V2 candidate surface, updated 2026-08-16).

## Route totals

| Surface | Logical routes | Notes |
|---|---:|---|
| Canonical sitemap pages | 2,552 | 230 authored/index pages plus 2,322 generated detail pages. |
| Non-sitemap utility pages | 2 | The 404 page and resource viewer. |
| Bundled ontology HTML | 653 | 652 content pages and one internal WIDOCO redirect. |
| Legacy application redirects | 229 | 227 `/manual` aliases and two renamed-page aliases. |
| Total routable HTML URLs | 3,436 | One logical URL per page or redirect. |

The current macOS build contains 3,435 physical HTML files because the case-sensitive canonical resources `/pdtf/LeaseTerm` and `/pdtf/leaseTerm` collide on a case-insensitive filesystem. They remain two logical routes and can be emitted separately on Linux.

## Global hierarchy and navigation

The primary application header exposes thirteen sections in this order:

1. Strategy
2. Governance
3. DBT Smart Data
4. Engagement
5. Modelling
6. Model
7. V2
8. Ontology
9. Mapping
10. Schema
11. Implementation
12. Adoption
13. Library

Each registered section has an overview page and a left sidebar organised into subject groups. Schema alone uses a recursively nested sidebar. Breadcrumbs and previous/next links follow the same `src/lib/site.ts` order. Generated V2 detail pages belong to the V2 shell but do not appear individually in the sidebar.

The public entry page, application home, design system, glossary, working-group campaign and presentation deck sit outside the thirteen-section hierarchy. Three canonical content pages are also not registered in `src/lib/site.ts`: `/modelling/property-pack`, `/ontology/datatypes`, and `/ontology/namespaces`.

## Authored and index pages

### Entry points and shared references — 4 pages

| Page | What it contains |
|---|---|
| `/` | Public OPDA gateway: proposition, entry link to the knowledge site, association-site link, four subject previews, and source/status strip. |
| `/home` | Main knowledge-site landing: hero, eight task pathways, content-status explanation, provenance cues, and footer shortcuts. |
| `/glossary` | Searchable acronyms and key terms grouped into organisations, legislation, standards and property-data terminology, with source notes. |
| `/design-system` | The OPDA brand, foundations, tokens, typography, components, interaction states, accessibility rules, evidence and implementation contract. |

### Strategy — 7 pages

| Page | What it contains |
|---|---|
| `/strategy` | Section overview of policy context, Smart Data sequencing, programme phases and roadmap. |
| `/strategy/strategy-overview` | Why OPDA exists, intended outcomes and measures of progress. |
| `/strategy/project-roadmap` | Sequenced semantic-modelling and governance deliverables from discovery through implementation. |
| `/strategy/programme-phases` | Sandbox, live trust-framework and national-rollout phases with transition criteria. |
| `/strategy/industrial-strategy` | UK Industrial Strategy and property as a priority Smart Data sector under the DMCC Act. |
| `/strategy/mhclg-roadmap` | MHCLG's Home Buying and Selling Reform Roadmap and its intended market outcomes. |
| `/strategy/reading-list` | Government and industry sources behind the strategy, Smart Data scheme and property reform. |

### Governance — 23 pages

| Page | What it contains |
|---|---|
| `/governance` | Section overview of authority, standards development, conformance, change, lifecycle and risk. |
| `/governance/uk-initiative` | Five-tier map of the UK Smart Property Data initiative, from legislation to standards. |
| `/governance/legislation` | Statutes and policy documents that authorise and constrain the initiative. |
| `/governance/departments` | Government departments and bodies, their ownership boundaries and live responsibilities. |
| `/governance/steering-forums` | DPMSG, Smart Data Council, HBSG and other cross-stakeholder coordination forums. |
| `/governance/opda-members` | Founding firms, association members and Technical Certification holders. |
| `/governance/sandbox` | The live Smart Property Data Trust Framework Sandbox, partners, funding and governance. |
| `/governance/toip-governance` | The four-layer Trust Over IP governance model and the documents required at each layer. |
| `/governance/strategic-alignment` | Five external strategies and frameworks to which PDTF is presented as aligned. |
| `/governance/standards-lifecycle` | Proposed human-governed path from evidence and candidate models to ratified standards. |
| `/governance/change-management` | Current constitutional and technical change processes, separated from the proposed lifecycle. |
| `/governance/lifecycle-versioning` | Compatibility, deprecation, support, release and retirement policy questions. |
| `/governance/conformance-scheme` | Current self-certification and proposed technical conformance/certification tiers. |
| `/governance/accreditation-directory` | Accredited firms, assurance-level coverage and capability-maturity scoring. |
| `/governance/risk-liability` | Allocation of responsibility when shared property data is wrong, late or missing. |
| `/governance/deferred-work` | Living mirror of deferred tasks, owners and triggering conditions from ADR-0005. |
| `/governance/council` | Index of ontology council sessions, persona verdicts, scope checks and adoption ledger. |
| `/governance/data-stewardship` | Decision rights for domain meaning, interoperability, assurance, risk and ratification. |
| `/governance/meetings-and-feedback` | Relationship between meetings, asynchronous review, public feedback and durable decisions. |
| `/governance/stakeholder-engagement` | Participation routes for members, invitees, regulators, government and the public. |
| `/governance/overlay-attachments` | File, integrity, retention and consent policy for unstructured overlay attachments. |
| `/governance/data-quality` | Six data-quality dimensions, measurement protocols and accreditation reporting. |
| `/governance/data-security` | Issuer onboarding, keys, signatures, revocation and audit controls. |

### DBT Smart Data — 9 pages

| Page | What it contains |
|---|---|
| `/dbt-smart-data` | Section overview of the Guidebook and the capabilities it asks PDTF to encode. |
| `/dbt-smart-data/preamble` | Ten cross-cutting principles, risk taxonomy and Guidebook governance. |
| `/dbt-smart-data/identity` | Chapter 1: minimum viable identity, roles, credentials, trust registries and PDTF overlap. |
| `/dbt-smart-data/governance-compliance` | Chapter 2: governance layers, accreditation, enforcement, accountability and liability. |
| `/dbt-smart-data/user-lifecycle` | Chapter 3: six-stage user lifecycle, consent, withdrawal, delegation and consumer response. |
| `/dbt-smart-data/stewardship-privacy-ethics` | Chapter 4: stewardship, provenance, lineage, derived data, privacy, ethics and AI disclosure. |
| `/dbt-smart-data/security-risk-fraud` | Chapter 5: security standards, assurance, dynamic trust, fraud and incident response. |
| `/dbt-smart-data/pdtf-overlap` | Guidebook obligations split between scheme operation and data-standard responsibilities, checked against the TTL corpus. |
| `/dbt-smart-data/gap-register` | Ranked PDTF capability gaps, evidence and proposed closing moves. |

### Engagement — 6 pages

| Page | What it contains |
|---|---|
| `/engagement` | Section overview of working groups, meetings, updates, videos and transcripts. |
| `/engagement/engagement-overview` | Map of programme bodies, meetings and content streams. |
| `/engagement/meetings-decisions` | DPMSG and OPDA meeting chronology with available materials and decisions. |
| `/engagement/working-groups` | Six DPMSG working groups, remits, OPDA involvement and archive locations. |
| `/engagement/video-library` | OPDA and Smart Data Challenge videos with dates, duration and transcript pointers. |
| `/engagement/transcripts` | Index of video, member-update and DPMSG transcripts. |

### Modelling — 13 index and subject pages

| Page | What it contains |
|---|---|
| `/modelling` | Section overview of semantic modelling, dictionaries, taxonomy, ontology, constraints and mappings. |
| `/modelling/standards-stack` | Five-layer technical publishing stack, repositories, overlays and version state. |
| `/modelling/bounded-contexts` | DDD-style industry contexts and PDTF as their shared published language. |
| `/modelling/overlays` | Main and extension overlays, JSON Schema composition and relationship to contexts. |
| `/modelling/data-dictionary` | 1,538 deduplicated schema-derived entities/properties with suggested RDF identifiers. |
| `/modelling/business-glossary` | Merged OPDA and schema-derived SKOS business glossary. |
| `/modelling/concept-taxonomy` | Core, bounded-context and code-list concept schemes with cross-scheme reconciliation. |
| `/modelling/ontology` | OWL class/property model and reused external vocabularies. |
| `/modelling/shacl-shapes` | Generated and manually added SHACL validation rules. |
| `/modelling/jsonld-mappings` | Per-overlay JSON-LD contexts connecting JSON properties to ontology terms. |
| `/modelling/property-pack` | Local review view of the V2 Property Pack candidate and its 451-item evidence coverage; not in the section sidebar. |
| `/modelling/odr` | Filterable index of all 36 Ontology Decision Records and their status/kind. |
| `/modelling/adr` | Filterable index of all 73 Architecture Decision Records and their status. |

### Model — 3 authored pages

| Page | What it contains |
|---|---|
| `/model` | Audience-oriented index to the concept, logical, physical-database, physical-ontology and relational tiers. |
| `/model/information-architecture` | Index of the five specifications governing the model documentation's four-tier structure and traceability. |
| `/model/validation-report` | Generated validation report for source discipline, entity inventory, cross-tier links and diagrams. |

### V2 Property Pack candidate — 13 index and assurance pages

| Page | What it contains |
|---|---|
| `/v2` | Clearly non-normative candidate overview, boundaries, resources, constraints, vocabularies and traceability. |
| `/v2/comparison` | Evidence-backed comparison between the current schema-derived model and V2 candidate. |
| `/v2/model` | Complete atlas of 159 resources and 229 asserted structural links. |
| `/v2/contexts` | Index of common, six industry and DBT Smart Data semantic homes. |
| `/v2/resources` | Index of candidate classes, object properties and datatype properties. |
| `/v2/relationships` | Structured reference for subclass, object-property and datatype-property relationships. |
| `/v2/data-dictionary` | Searchable 451-row source dictionary with candidate traceability. |
| `/v2/vocabularies` | Index of 14 SKOS schemes, 85 controlled values and the separate topic layer. |
| `/v2/shapes` | Index of 45 node shapes and 100 property constraints. |
| `/v2/coverage` | Exact source-to-candidate coverage for all 451 Property Pack items. |
| `/v2/standards` | RDF, SHACL, SPARQL, OWL, SKOS, DCMI and PROV targets and explicit non-claims. |
| `/v2/validation` | Results of 56 machine checks, tool versions, assurance boundaries and checked-tree digest. |
| `/v2/artefacts` | Download/reference manifest for ontology, SHACL, SKOS, projection and validation files. |

### Ontology reference — 22 index and subject pages

| Page | What it contains |
|---|---|
| `/ontology` | Authoritative reference landing that joins generated tools, custom reference and authored guidance. |
| `/ontology/foundation` | UFO categories, three-graph separation, bounded contexts and inference/validation boundary. |
| `/ontology/identity` | Property identity crux and the facet/SKOS classification doctrine. |
| `/ontology/foundational-ontology` | Sourced critique and comparison of UFO, BFO, DOLCE, SUMO, GFO, gist and lightweight alternatives. |
| `/ontology/modelling-frameworks` | How OPDA uses UFO and OntoClean as design-time lenses while shipping pragmatic RDF/SHACL/SKOS. |
| `/ontology/graph` | Interactive whole-ontology graph with switchable Mermaid, Graphviz and graph-engine views. |
| `/ontology/classes` | Classes grouped by module with definitions and canonical `/pdtf` links. |
| `/ontology/category` | Index of UFO foundational categories and their classified OPDA classes. |
| `/ontology/properties` | Object and datatype property indexes with domain/range and module grouping. |
| `/ontology/datatypes` | Literal datatypes and the properties that use them; canonical but absent from the sidebar. |
| `/ontology/vocabularies` | SKOS scheme index, concepts, category metadata and alternate tool views. |
| `/ontology/shapes` | Node-shape inventory, severity model and asserted/entailed validation boundary. |
| `/ontology/profiles` | Index of 31 form/overlay profiles and their binding gaps. |
| `/ontology/exemplars` | Index of 17 conformant/non-conformant round-trip instance examples. |
| `/ontology/glossary` | A–Z index of every named class, property, concept and scheme. |
| `/ontology/claims` | PROV-O-backed claims, evidence, verification and assurance model. |
| `/ontology/governance` | DPV references, PII annotations, lawful basis and governance mappings. |
| `/ontology/provenance` | ODR, ADR, council, source and ratification lineage for the ontology and reference. |
| `/ontology/known-issues` | Dated issue register with governing decisions and consumer impact. |
| `/ontology/namespaces` | Kind-split OPDA and external prefix map; canonical but absent from the sidebar. |
| `/ontology/usage` | Consumer guide: namespaces, queries, content negotiation, validation and downloads. |
| `/ontology/bake-off` | Embedded third-party documentation renderings and layer-by-layer operator scorecard. |

### Mapping — 5 index and guidance pages

| Page | What it contains |
|---|---|
| `/mapping` | Section overview of the machine-checked bridge between ontology and JSON Schema. |
| `/mapping/how-it-works` | RMLMapper/Jena pipeline, verification gates and enumeration-to-SKOS technique. |
| `/mapping/triplesmaps` | Searchable TriplesMap index by ontology resource and JSON Schema path. |
| `/mapping/coverage` | Coverage denominator, mapped resources, exemptions and remaining gaps. |
| `/mapping/validate` | Reproduction commands, harness files and validation workflow. |

### Schema — 104 pages

The Schema hierarchy is the deepest authored branch. Landing pages introduce aggregates or clusters; leaf pages document their assigned JSON Schema fields, provenance badges, overlays and diagrams.

#### Schema root and process

| Page | What it contains |
|---|---|
| `/schema` | Overview of the complete schema organised by lifecycle and authority. |
| `/schema/transaction-participants` | Transaction parties, identities, roles, contacts and seller capacity. |
| `/schema/chain-milestones` | Lifecycle, linked chain transactions, milestones and contract artefacts. |
| `/schema/property` | Property identifiers and references across the Property Pack. |
| `/schema/utilities-energy` | Heating, energy, water, drainage, broadband, mobile and EPC fields. |
| `/schema/overlays-tasks` | Cross-cutting overlay membership and task-driven question views. |

#### Legal estate, title and ownership

| Page | What it contains |
|---|---|
| `/schema/legal-estate` | Landing for tenure, title, ownership and boundaries/rights. |
| `/schema/legal-estate/tenure` | Tenure fields. |
| `/schema/legal-estate/title` | Landing for Official Copy summary and full-register data. |
| `/schema/legal-estate/title/oc-summary` | Landing for the Official Copy summary cluster. |
| `/schema/legal-estate/title/oc-summary/title-number` | Title number and extent fields. |
| `/schema/legal-estate/title/oc-summary/oc-meta` | Official Copy metadata and property fields. |
| `/schema/legal-estate/title/oc-summary/oc-owners` | Proprietorship and lease fields. |
| `/schema/legal-estate/title/oc-summary/oc-charges-main` | Main charge fields. |
| `/schema/legal-estate/title/oc-summary/oc-charges-other` | Other charges and restrictions. |
| `/schema/legal-estate/title/oc-summary/oc-notices-main` | Main notice fields. |
| `/schema/legal-estate/title/oc-summary/oc-notices-other` | Cautions, bankruptcy and rights. |
| `/schema/legal-estate/title/oc-full` | Full HMLR register representation. |
| `/schema/legal-estate/ownership` | Landing for freehold, leasehold and managed ownership disclosures. |
| `/schema/legal-estate/ownership/freehold` | Freehold-transfer fields. |
| `/schema/legal-estate/ownership/leasehold` | Leasehold-transfer cluster landing. |
| `/schema/legal-estate/ownership/leasehold/lease-term` | Lease term and shared-ownership fields. |
| `/schema/legal-estate/ownership/leasehold/lease-contacts-list` | Leasehold contact list. |
| `/schema/legal-estate/ownership/leasehold/lease-contacts-roles` | Service-contact roles. |
| `/schema/legal-estate/ownership/leasehold/lease-management` | Management arrangements. |
| `/schema/legal-estate/ownership/leasehold/lease-rent` | Ground-rent fields. |
| `/schema/legal-estate/ownership/leasehold/lease-charges` | Service-charge and insurance cluster landing. |
| `/schema/legal-estate/ownership/leasehold/lease-charges/service-charge` | Service-charge fields. |
| `/schema/legal-estate/ownership/leasehold/lease-charges/buildings-insurance` | Buildings-insurance fields. |
| `/schema/legal-estate/ownership/leasehold/lease-legal` | Consents, restrictions, alterations and safety cluster landing. |
| `/schema/legal-estate/ownership/leasehold/lease-legal/consents-alterations` | Consent and alteration fields. |
| `/schema/legal-estate/ownership/leasehold/lease-legal/restrictions-enfranchisement` | Restrictions and enfranchisement. |
| `/schema/legal-estate/ownership/leasehold/lease-legal/building-safety` | Building Safety Act fields. |
| `/schema/legal-estate/ownership/leasehold/lease-legal/lease-transfer` | Transfer and registration fields. |
| `/schema/legal-estate/ownership/leasehold/lease-misc` | Disputes, general answers and documents cluster landing. |
| `/schema/legal-estate/ownership/leasehold/lease-misc/disputes` | Leasehold disputes. |
| `/schema/legal-estate/ownership/leasehold/lease-misc/general` | General and confirmation fields. |
| `/schema/legal-estate/ownership/leasehold/lease-misc/required-docs` | Required leasehold documents. |
| `/schema/legal-estate/ownership/managed` | Managed-ownership disclosure cluster landing. |
| `/schema/legal-estate/ownership/managed/contacts` | Managed-property contacts. |
| `/schema/legal-estate/ownership/managed/transfer` | Transfer and confirmation fields. |
| `/schema/legal-estate/ownership/managed/service-charge` | Managed service-charge fields. |
| `/schema/legal-estate/ownership/managed/insurance` | Managed insurance fields. |
| `/schema/legal-estate/ownership/managed/disputes-docs` | Managed disputes and documents. |
| `/schema/legal-estate/boundaries-rights` | Boundary and property-right fields. |

#### Built form, fixtures, surveys and valuation

| Page | What it contains |
|---|---|
| `/schema/built-form` | Landing for built form, condition, fixtures, surveys and valuation. |
| `/schema/built-form/built-form-form` | Construction and built-form fields. |
| `/schema/built-form/condition` | Property-condition fields. |
| `/schema/built-form/fixtures` | Fixtures-and-fittings cluster landing. |
| `/schema/built-form/fixtures/fixtures-summary` | Items included in or removed from the sale. |
| `/schema/built-form/fixtures/basic` | Basic fittings. |
| `/schema/built-form/fixtures/kitchen` | Kitchen fixtures. |
| `/schema/built-form/fixtures/bathroom` | Bathroom fixtures. |
| `/schema/built-form/fixtures/carpets` | Carpet fields. |
| `/schema/built-form/fixtures/curtains` | Curtains, blinds and rails. |
| `/schema/built-form/fixtures/lights` | Light fittings. |
| `/schema/built-form/fixtures/units` | Fitted units. |
| `/schema/built-form/fixtures/outdoor` | Outdoor fixtures. |
| `/schema/built-form/fixtures/services` | TV, telephone, fuel and other service items. |
| `/schema/built-form/surveys` | Survey cluster landing. |
| `/schema/built-form/surveys/meta` | Report metadata and declaration. |
| `/schema/built-form/surveys/grounds` | Grounds observations. |
| `/schema/built-form/surveys/inside-structure` | Internal roof, ceiling and wall observations. |
| `/schema/built-form/surveys/inside-features` | Floors, fireplaces and built-in fittings. |
| `/schema/built-form/surveys/inside-finishes` | Woodwork, bathroom fittings and other finishes. |
| `/schema/built-form/surveys/outside-roof` | Chimney, roof and rainwater observations. |
| `/schema/built-form/surveys/outside-envelope` | External walls, windows and doors. |
| `/schema/built-form/surveys/outside-extras` | Conservatory, joinery and other exterior items. |
| `/schema/built-form/surveys/services-energy` | Electricity, gas/oil, heating and water-heating observations. |
| `/schema/built-form/surveys/services-water` | Water, drainage and common services. |
| `/schema/built-form/surveys/legal` | Legal matters and guarantees. |
| `/schema/built-form/surveys/valuation` | Survey valuation block. |
| `/schema/built-form/surveys/advice` | Advice, risks and matters for legal advisers. |
| `/schema/built-form/valuation` | Standalone valuation fields. |

#### Local context and searches

| Page | What it contains |
|---|---|
| `/schema/local-context` | Landing for CON29R, LLC1 and environmental searches. |
| `/schema/local-context/con29r` | Local-authority CON29R cluster landing. |
| `/schema/local-context/con29r/identity` | Local-authority identity. |
| `/schema/local-context/con29r/searches` | Local-authority searches cluster landing. |
| `/schema/local-context/con29r/searches/planning-building` | Planning and building regulations. |
| `/schema/local-context/con29r/searches/roads` | Roads and public rights of way. |
| `/schema/local-context/con29r/searches/other-planning-notices` | Other planning notices and enforcement. |
| `/schema/local-context/con29r/searches/other-finance` | Community finance and assets. |
| `/schema/local-context/con29r/searches/other-road-rail` | Road and rail schemes. |
| `/schema/local-context/con29r/searches/other-environmental` | Other environmental searches. |
| `/schema/local-context/con29r/searches/other-compulsory` | Compulsory purchase and public works. |
| `/schema/local-context/con29r/listing-conservation` | Listing and conservation. |
| `/schema/local-context/llc1` | Local Land Charges search fields. |
| `/schema/local-context/environmental` | Environmental-search cluster landing. |
| `/schema/local-context/environmental/flooding` | Flood-risk fields. |
| `/schema/local-context/environmental/mining-ground` | Mining and ground stability. |
| `/schema/local-context/environmental/pollution-radon` | Pollution and radon. |
| `/schema/local-context/environmental/coast-climate` | Coastal and climate risks. |
| `/schema/local-context/environmental/infra-policy` | Infrastructure, energy, transport and planning context. |

#### Encumbrances, evidence and declarations

| Page | What it contains |
|---|---|
| `/schema/encumbrances` | Encumbrances and completion cluster landing. |
| `/schema/encumbrances/council-tax-insurance` | Council-tax and insurance fields. |
| `/schema/encumbrances/guarantees` | Guarantees, warranties and indemnities. |
| `/schema/encumbrances/occupiers-notices` | Occupiers and notices. |
| `/schema/encumbrances/letting-completion` | Letting and completion. |
| `/schema/evidence` | Evidence, documents and declarations cluster landing. |
| `/schema/evidence/documents` | Documents and attachments. |
| `/schema/evidence/declarations` | Sale-ready declarations. |
| `/schema/evidence/additional` | Additional information and disclosures. |
| `/schema/evidence/disputes` | Disputes and complaints. |
| `/schema/evidence/specialist` | Specialist and other issues. |

### Implementation — 6 pages

| Page | What it contains |
|---|---|
| `/implementation` | Section overview of schemas, overlays, validation, verified claims and JSON-LD. |
| `/implementation/implementation-overview` | Five-piece implementation stack and how the parts fit. |
| `/implementation/quickstart` | Install schemas, compose a transaction and validate it. |
| `/implementation/schema-composition` | Overlay deep-merge rules, worked examples and failure cases. |
| `/implementation/validation` | Ajv-backed transaction and verified-claim validation. |
| `/implementation/verified-claims` | Wrapping transaction fragments as W3C Verifiable Credentials. |

### Adoption — 6 pages

| Page | What it contains |
|---|---|
| `/adoption` | Section overview of implementations, pilots and adoption evidence. |
| `/adoption/adoption-overview` | Adoption definitions, headline measures and public evidence map. |
| `/adoption/member-implementations` | Public member implementations grouped by bounded context. |
| `/adoption/sandbox-pilots` | Sandbox operation, certified sources, providers, consent and liability tests. |
| `/adoption/smart-data-challenge` | Smart Data Challenge entry, award and submission archive. |
| `/adoption/hmlr-llc` | HMLR Local Land Charges digitisation programme and migration/quality status. |

### Library — 6 pages

| Page | What it contains |
|---|---|
| `/library` | Section overview of documents, transcripts, recordings and external evidence. |
| `/library/library-overview` | Shape, themes and locations of the project archive. |
| `/library/document-archive` | Project documents, reports, decks and plans grouped by theme. |
| `/library/transcript-archive` | Archived video, member-update and DPMSG transcripts. |
| `/library/resources` | File-level index into the source archive through the resource viewer. |
| `/library/external-references` | Government, NTS and standards-body sources outside OPDA. |

### Standalone presentation and recruitment — 3 pages

| Page | What it contains |
|---|---|
| `/presentation/working-group-kickoff` | Full-screen finance-and-banking working-group orientation deck with keyboard slide controls. |
| `/working-groups/join` | Public campaign narrative and expression-of-interest form for bounded-context working groups. |
| `/working-groups/join/privacy` | Privacy notice for working-group expressions of interest. |

## Generated page families — 2,322 pages

| Route family | Pages | What every page contains |
|---|---:|---|
| `/mapping/triplesmaps/{id}` | 158 | One RML TriplesMap: mapped ontology resource, JSONPath iterator, predicate/object rows, source paths and adjacent-record navigation. |
| `/model/information-architecture/{spec}` | 5 | One documentation specification: audience, purpose, file layout, mandatory page shape, diagrams, voice and traceability. |
| `/model/concept/{...slug}` | 47 | SME-facing tier/module/entity narratives with classification, attributes, relationships, constraints and sources. |
| `/model/logical/{...slug}` | 69 | Engineering tier pages for entities and enumerations, with logical structures and cross-tier links. |
| `/model/physical-database/{...slug}` | 23 | Deployment pages for named graphs, content negotiation, profiles, operations, modules and BASPI5 deployment. |
| `/model/physical-ontology/{...slug}` | 72 | Turtle-oriented pages for modules, classes, shapes, annotations, rules, profiles, exemplars and vocabularies. |
| `/model/physical-relational/{...slug}` | 8 | Tier landing plus one relational schema/ER view for each model module. |
| `/modelling/adr/{id}` | 73 | One Architecture Decision Record with status, date, context, decision, consequences and linked evidence. |
| `/modelling/odr/{id}` | 36 | One Ontology Decision Record with kind/status, problem, options, outcome, rules and council context. |
| `/ontology/category/{slug}` | 8 | One UFO category, its definition, classified OPDA classes and related links. |
| `/ontology/context/{slug}` | 8 | One ontology module with its classes, properties, shapes and schemes. |
| `/ontology/exemplar/{slug}` | 17 | One diagnostic input graph, expected SHACL report and related resources. |
| `/ontology/profile/{slug}` | 31 | One overlay profile with bound shapes or thin-profile status, sources and gaps. |
| `/pdtf/{...name}` | 1,090 | Canonical dereference page for one class, property, shape, concept or scheme, including identity, definition, relationships, constraints, sources and downloads. |
| `/v2/contexts/{context}` | 8 | One V2 semantic home with summary, full diagram, owned resources, relationships, constraints, vocabularies and source scope. |
| `/v2/data-dictionary/{id}` | 451 | One required Property Pack datum: source identity/constraints, candidate interpretation, ontology constructs and evidence trace. |
| `/v2/resources/{context}/{id}` | 159 | One candidate class or property: meaning, structure, constraints, vocabularies and source evidence. |
| `/v2/shapes/{context}/{target}` | 45 | One candidate node shape and all of its property constraints. |
| `/v2/vocabularies/{context}/{id}` | 14 | One candidate SKOS scheme, its concepts and source evidence. |

### Generated hierarchy breakdown

- Model information-architecture specs: concept model, logical model, overview, physical database and physical ontology.
- Concept tier (47): landing 1; agent 8; claim 11; descriptive 6; foundation 7; governance 3; property 7; transaction 4.
- Logical tier (69): landing 1; agent 12; claim 12; descriptive 6; foundation 7; governance 3; property 22; transaction 6.
- Physical-database tier (23): landing 1; content negotiation 3; derived profiles 4; modules 8; named graphs 1; operations 4; overlay deployment 2.
- Physical-ontology tier (72): landing 1; agent 4; claim 4; descriptive 4; exemplars 16; foundation 3; governance 4; profiles 2; property 4; severity 1; SHACL-AF rules 1; graph separation 1; transaction 4; vocabularies 23.
- Physical-relational tier (8): landing plus foundation, property, agent, transaction, claim, governance and descriptive module views.
- Ontology category pages: collective, event, information object, quality/value, relator, role, RoleMixin and substance kind.
- Ontology context pages: foundation, property, agent, transaction, claim, governance, descriptive and annotations.
- Ontology exemplars: 17 named conformant/non-conformant transaction, claim, identity, ownership and property scenarios, all enumerated by `/ontology/exemplars`.
- Ontology profiles: 31 named form/overlay records, all enumerated by `/ontology/profiles`.
- `/pdtf` resources (1,090): 41 classes, 75 object properties, 205 datatype properties, 402 shapes, 319 concepts and 48 schemes.
- V2 contexts (8): common, conveyancing, estate agency, finance and banking, property data services, property technology, surveying and valuation, and DBT Smart Data.
- V2 resources (159): common 2; conveyancing 53; DBT Smart Data 3; estate agency 18; finance and banking 10; property data services 48; property technology 10; surveying and valuation 15.
- V2 shapes (45): common 1; conveyancing 13; DBT Smart Data 1; estate agency 6; finance and banking 4; property data services 12; property technology 4; surveying and valuation 4.
- V2 vocabularies (14): common 1; conveyancing 4; estate agency 2; property data services 3; property technology 1; surveying and valuation 3.

## Bundled ontology documentation — 653 HTML routes

These files are copied as static published artefacts rather than generated by Astro routing, so they do not appear in the sitemap or application sidebar.

| Route family | Pages | What it contains |
|---|---:|---|
| `/ontology/artefacts/source` | 1 | Download/reference page for the source TTL corpus. |
| `/ontology/tools/custom` | 1 | OPDA-authored composite view of ontology-specific layers. |
| `/ontology/tools/ontospy/**` | 644 | Vendored Ontospy class, property, concept, scheme and index renderings. |
| `/ontology/tools/pylode` | 1 | pyLODE rendering of the PDTF ontology. |
| `/ontology/tools/shaclplay` | 1 | SHACL Play rendering of OPDA governance shapes. |
| `/ontology/tools/skosmos/schemes.html` | 1 | Skosmos-style scheme browser. |
| `/ontology/tools/widoco/doc/index-en.html` | 1 | WIDOCO ontology reference. |
| `/ontology/tools/widoco/doc/provenance/provenance-en.html` | 1 | WIDOCO provenance report. |
| `/ontology/tools/widoco/doc/webvowl` | 1 | WebVOWL visualisation. |
| `/ontology/tools/widoco` | 1 | Redirect to the WIDOCO reference under `doc/index-en.html`. |

## Utility and representation routes

| Route | Type | What it contains |
|---|---|---|
| `/404` | HTML utility | Branded not-found page with recovery links; excluded from the sitemap. |
| `/resource?path={archive-path}` | HTML utility | Client-side source/archive file viewer used by library and council pages; excluded from the sitemap. |
| `/pdtf/{...name}.ttl` | Turtle representation | Machine-readable Turtle representation paired with each of the 1,090 dereference pages. |
| `/data/property-pack-required.json` | JSON data | Required Property Pack catalogue consumed by candidate/reference pages. |

Authentication, comments and the working-group submission API are runtime services rather than content pages, so they are outside the page hierarchy.

## Redirects and compatibility aliases

| Source | Destination | Count and purpose |
|---|---|---|
| `/manual` and `/manual/**` | Matching `/model` route | 227 aliases preserving links after the accepted section rename. |
| `/governance/smart-data-guidebook` | `/dbt-smart-data` | Preserves the original single-page Guidebook URL after the section expansion. |
| `/presentations/finance-banking-kickoff` | `/presentation/working-group-kickoff` | Preserves the deck's temporary development URL. |

## Structural observations for the reorganisation phase

- Generated reference records are 91% of canonical routes (2,322 of 2,552); the reorganisation therefore needs route-family rules, not a manual page-by-page migration.
- The top-level application navigation has thirteen peer sections, while the home page promotes only eight task pathways.
- `Modelling`, `Model`, `V2` and `Ontology` are separate top-level destinations with related subject matter but different authority, audience and maturity.
- `/` and `/home` form two successive landing layers: a public gateway and the application home.
- Schema is the deepest authored hierarchy; record/reference depth is otherwise handled by generated routes and contextual links.
- The design system, glossary, public recruitment flow and presentation deck are standalone experiences rather than children of a primary section.
- Three canonical pages are unregistered in the section taxonomy, and most ontology/PDTF generated details rely on contextual links rather than sidebar placement.
- The V2 surface consistently labels itself as a candidate and keeps its resources, shapes, vocabularies and evidence separate from the current ontology reference.
