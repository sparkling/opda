---
status: accepted
date: 2026-08-21
updated: 2026-08-22
tags: [website, information-architecture, pdtf-schema, routing, migration, ontology, authority, preservation]
supersedes: []
amends: [ADR-0002, ADR-0041, ADR-0042, ADR-0044, ADR-0059, ADR-0060, ADR-0074, ADR-0075]
depends-on: [ADR-0006, ADR-0039, ADR-0044, ADR-0074, ADR-0075]
implements: [src/lib/pdtf-schema-routes.mjs]
---

# Consolidate PDTF schema documentation under hierarchy-reflecting routes

## Context and Problem Statement

ADR-0075 established two related but independently governed reader-facing bodies: the
PDTF schema and supporting material, and the schema-derived ontology extracted from
them. The implemented navigation
expresses that distinction, but most page URLs still expose the older thirteen-section
architecture: `/schema`, `/implementation`, `/adoption`, `/modelling`, `/model`,
`/ontology` and `/mapping`. Navigation, breadcrumbs and URLs therefore describe
different hierarchies.

The directing authority has authorised a clean route break. Old PDTF schema
documentation routes are to disappear without redirects or compatibility pages. This
amends the stable-documentation-route clauses of the earlier ADRs listed above.

One similarly named family is not documentation compatibility surface:
`https://opda.org.uk/pdtf/**` is the published RDF identifier namespace established by
ADR-0006, ADR-0039 and ADR-0044. Its HTML pages dereference the identifiers and its
`.ttl` siblings provide machine-readable representations. Moving those paths would
remint ontology IRIs, so their paths and semantic identities remain stable. Reader
chrome and links on the HTML representations may follow the new documentation IA.

## Decision Drivers

- Make URLs, breadcrumbs and navigation express one PDTF schema hierarchy.
- Keep the schema and supporting material distinct from the schema-derived ontology.
- Preserve RDF identity and dereferenceability independently of editorial IA.
- Retain every information block, fragment, generated family and feedback thread even
  though the old documentation URLs intentionally stop resolving.
- Prevent route containment from changing authority, maturity or provenance.
- Move complete generated and bundled families atomically, not page by page.

## Considered Options

- **Retain the old URLs beneath a new navigation tree.** Rejected because the URL and
  breadcrumb continue to contradict the reader hierarchy.
- **Move the documentation and redirect every old URL.** Rejected by explicit operator
  direction; it would also retain two public address families indefinitely.
- **Move both documentation and `/pdtf/**`.** Rejected because that would remint
  published ontology identifiers and violate the identity boundary rather than tidy the
  documentation IA.
- **Move only PDTF schema documentation under `/pdtf-schema` and retain `/pdtf/**` as the
  identifier exception (chosen).** This creates one documentation home without
  coupling semantic identity to a mutable editorial taxonomy.

## Decision Outcome

All PDTF schema reader documentation is consolidated beneath `/pdtf-schema`. The exact
canonical hierarchy is:

```text
/pdtf-schema
├── /schema-and-supporting-material
│   ├── /schema/**
│   │   └── /overlays
│   ├── /data-dictionary
│   ├── /business-glossary
│   ├── /implementation-guidance/**
│   └── /usage-and-implementation-evidence/**
└── /schema-derived-ontology
    ├── /lineage-provenance-and-verification
    │   ├── /historical-modelling/**
    │   ├── /schema-to-ontology-verification/**
    │   └── /decision-provenance
    ├── /model-views-by-audience/**
    ├── /concepts-and-architecture/**
    ├── /terms-and-model-resources/**
    ├── /validation-and-examples/**
    ├── /trust-governance-and-limitations/**
    └── /use-and-tooling/**
```

The schema-and-supporting-material branch distinguishes its core technical artefacts
from material about their use. JSON Schemas and overlays, the data dictionary and the
business glossary are the PDTF schema inputs identified by ADR-0075. Implementation
guidance and usage evidence are supporting records; their placement does not make them
additional normative specification components or imply that the PDTF schema was an
OPDA-endorsed scheme. Usage evidence does not establish adoption of SPDTF.

The schema-derived ontology branch uses substantive linked landings rather than label-only
folders or a second reference home. Its classifications are navigational, not
ontological or authoritative assertions:

- historical modelling records how the extraction was performed; it is not current
  normative method;
- schema-to-ontology verification is the independent RML bridge retained from
  ADR-0059, not ontology derivation, semantic approval or executable ETL;
- model views remain audience presentations of the extracted model;
- `governance` beneath trust means the ontology's data-governance and PII layer, not
  OPDA decision authority; and
- tool renderings and downloadable ontology artefacts retain their own provenance and
  status. Placement under use and tooling never demotes a canonical technical
  serialisation into tool evidence or promotes a bake-off output into the canonical
  technical corpus.

### Route migration contract

| Retired route | Canonical replacement |
|---|---|
| `/schema/**` | `/pdtf-schema/schema-and-supporting-material/schema/**` |
| `/modelling/overlays` | `/pdtf-schema/schema-and-supporting-material/schema/overlays` |
| `/modelling/data-dictionary` | `/pdtf-schema/schema-and-supporting-material/data-dictionary` |
| `/modelling/business-glossary` | `/pdtf-schema/schema-and-supporting-material/business-glossary` |
| `/implementation/**` | `/pdtf-schema/schema-and-supporting-material/implementation-guidance/**` |
| `/adoption/**` | `/pdtf-schema/schema-and-supporting-material/usage-and-implementation-evidence/**` |
| PDTF schema `/modelling/**` pages | `/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/**` |
| `/mapping/**` | `/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/schema-to-ontology-verification/**` |
| `/ontology/provenance` | `/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/decision-provenance` |
| `/model/**` | `/pdtf-schema/schema-derived-ontology/model-views-by-audience/**` |
| `/manual/**` | the same canonical model-view targets as `/model/**`; aliases are removed |
| `/ontology/context/{slug}` | `/pdtf-schema/schema-derived-ontology/concepts-and-architecture/contexts/{slug}` |
| `/ontology/category/{slug}` | `/pdtf-schema/schema-derived-ontology/terms-and-model-resources/categories/{slug}` |
| `/ontology/profile/{slug}` | `/pdtf-schema/schema-derived-ontology/validation-and-examples/profiles/{slug}` |
| `/ontology/exemplar/{slug}` | `/pdtf-schema/schema-derived-ontology/validation-and-examples/exemplars/{slug}` |
| other `/ontology/**` reference pages | the matching linked category beneath `/pdtf-schema/schema-derived-ontology/**` |
| `/ontology/tools/**` | `/pdtf-schema/schema-derived-ontology/use-and-tooling/tools/**` |
| `/ontology/artefacts/**` | `/pdtf-schema/schema-derived-ontology/use-and-tooling/artefacts/**` |

`/modelling/adr/**` and `/modelling/odr/**` remain Governance-owned routes and do not
move merely because they share a prefix with historical modelling. `/pdtf/**` and its
`.ttl` representations remain canonical identifiers. SPDTF, Programme, Resources,
Governance, API and source-viewer routes are outside this migration.

Every retired documentation URL returns not found. There are no redirects, rewrite
aliases, duplicate pages or canonical-link compatibility shells. Preserving an existing
Artalk thread by keeping its old page key on the new page is information preservation,
not route compatibility.

### Authority and status contract

The route hierarchy does not inherit authority downward. Every page and generated
family keeps the five independent fields required by ADR-0074: work area, authority,
maturity, version and provenance. In particular:

- technical publication of the PDTF schema does not confer OPDA scheme endorsement or
  promote dictionaries, glossaries, models, mappings, stubs, generated renderings or
  usage claims;
- technical validation proves only the declared technical property;
- RML coverage is qualified schema-to-ontology verification, not semantic equivalence;
- a generated page does not acquire human standards authority; and
- historical prose and immutable ADR/ODR evidence keep historically exact route and
  namespace references. Current links and amendment notes point to this decision rather
  than rewriting the past.

### Consequences

- Good, because URL, breadcrumb and navigation now express the same two-part model.
- Good, because the stable RDF namespace is explicitly separated from documentation
  routing and cannot be reminted accidentally.
- Good, because every generated family has a deterministic owner-based disposition.
- Bad, because all external links to the retired documentation families break by
  design and must be rediscovered through the new hierarchy or search.
- Bad, because the migration touches thousands of generated and copied pages plus
  source links, tests, comments, sitemap and search metadata.
- Neutral, because internal collection and generator names such as `manual` may remain
  implementation details when they do not leak into public URLs.

### Confirmation

The accepted route baseline contains 2,581 PDTF-owned HTML routes. A release receipt
must classify them exactly: 1,489 documentation or alias routes move to 1,262 unique
canonical targets; 227 `/manual/**` aliases collapse onto their `/model/**` content;
1,090 HTML pages in the `/pdtf` identifier family remain at exact paths; and the two existing
`/pdtf-schema{,/schema-and-supporting-material}` landings remain. No PDTF schema route may be unclassified.

Release is fail-closed unless all of these gates pass:

- one machine-readable old-to-new manifest covers every moved canonical page and every
  removed alias; every old documentation route is absent and emits no redirect;
- every accepted information block and DOM fragment appears at its declared new route,
  with exact, hash-bound or provenance-bound preservation evidence;
- all generated model, mapping, profile, exemplar, category, context, tool and artefact
  families move atomically and retain their complete member/file inventories;
- every `/pdtf/**` HTML/`.ttl` pair remains addressable at the same IRI, with local-name
  case and content-negotiation semantics unchanged, including distinct `LeaseTerm` and
  `leaseTerm` resources on a case-sensitive release filesystem;
- links, canonical metadata, sitemap, search, breadcrumbs and previous/next sequences
  use only the new documentation routes while identifier links continue to use
  `/pdtf/**`;
- Artalk page keys preserve the `/model/**` thread for each canonical model page and
  preserve every other moved page's existing thread identity;
- the ontology-artefact manifest distinguishes canonical technical serialisations from
  provenance, test and bake-off outputs despite their common download placement;
- current OPDA-controlled documents are link-audited; immutable historical evidence is
  not rewritten; and
- `make test`, `make ci-ontology`, the full data build, route crawl, strict preservation,
  accessibility, responsive, keyboard and visual gates pass on two deterministic
  production builds.

This ADR authorises the local implementation and validation of the route migration. It
does not authorise publication or deployment.

## More Information

- [ADR-0006 — Ontology namespace](./ADR-0006-w3id-opda-ontology-namespace.md)
- [ADR-0041 — Ontology reference generation](./ADR-0041-ontology-reference-document-generation.md)
- [ADR-0044 — Dereferenceable ontology pages](./ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md)
- [ADR-0059 — RML mapping section](./ADR-0059-rml-mapping-section-positioned-between-ontology-and-schema.md)
- [ADR-0074 — Site information architecture](./ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md)
- [ADR-0075 — PDTF schema and schema-derived ontology structure](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md)
- [SPDTF information architecture](../spdtf-information-architecture.md)

## Amendments

- **2026-08-22 — Chair-authority terminology correction.** Maria Harris, OPDA Chair,
  clarified that the inherited version-numbered draft technical scheme was not created
  collaboratively and was not endorsed by OPDA. This route decision now names the
  existing **PDTF schema and supporting material** and the separate
  **schema-derived ontology** without promoting either to scheme status. **SPDTF** is
  the first collaboratively authored scheme draft. Reader routes use
  `/pdtf-schema/**`; the editorial migration must never remint or alter stable
  `/pdtf/**` RDF identifiers. Git history, source records and route migration receipts
  retain factual provenance.
