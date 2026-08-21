---
status: accepted
date: 2026-08-21
tags: [website, information-architecture, pdtf-1-0, routing, migration, ontology, authority, preservation]
supersedes: []
amends: [ADR-0002, ADR-0041, ADR-0042, ADR-0044, ADR-0059, ADR-0060, ADR-0074, ADR-0075]
depends-on: [ADR-0006, ADR-0039, ADR-0044, ADR-0074, ADR-0075]
implements: [src/lib/pdtf1-routes.mjs]
---

# Consolidate PDTF 1.0 documentation under hierarchy-reflecting routes

## Context and Problem Statement

ADR-0075 established that PDTF 1.0 has two reader-facing parts: the original
JSON-based standard and the ontology extracted from it. The implemented navigation
expresses that distinction, but most page URLs still expose the older thirteen-section
architecture: `/schema`, `/implementation`, `/adoption`, `/modelling`, `/model`,
`/ontology` and `/mapping`. Navigation, breadcrumbs and URLs therefore describe
different hierarchies.

The directing authority has authorised a clean route break. Old PDTF 1.0
documentation routes are to disappear without redirects or compatibility pages. This
amends the stable-documentation-route clauses of the earlier ADRs listed above.

One similarly named family is not documentation compatibility surface:
`https://opda.org.uk/pdtf/**` is the published RDF identifier namespace established by
ADR-0006, ADR-0039 and ADR-0044. Its HTML pages dereference the identifiers and its
`.ttl` siblings provide machine-readable representations. Moving those paths would
remint ontology IRIs, so their paths and semantic identities remain stable. Reader
chrome and links on the HTML representations may follow the new documentation IA.

## Decision Drivers

- Make URLs, breadcrumbs and navigation express one PDTF 1.0 hierarchy.
- Keep the original standard distinct from its extracted ontology.
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
- **Move only PDTF-owned documentation under `/pdtf-1` and retain `/pdtf/**` as the
  identifier exception (chosen).** This creates one documentation home without
  coupling semantic identity to a mutable editorial taxonomy.

## Decision Outcome

All PDTF-owned reader documentation is consolidated beneath `/pdtf-1`. The exact
canonical hierarchy is:

```text
/pdtf-1
├── /original-standard
│   ├── /schema/**
│   │   └── /overlays
│   ├── /data-dictionary
│   ├── /business-glossary
│   ├── /implementation/**
│   └── /adoption/**
└── /extracted-ontology
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

The original-standard branch distinguishes its core artefacts from material about
their use. JSON Schemas and overlays, the data dictionary and the business glossary
are the original standard inputs identified by ADR-0075. Implementation guidance and
adoption evidence are supporting records about that standard; their placement does
not make them additional normative specification components. Adoption evidence does
not establish adoption of SPDTF 2.0.

The extracted-ontology branch uses substantive linked landings rather than label-only
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
  status. Placement under use and tooling never demotes a normative serialisation into
  tool evidence or promotes a bake-off output into the standard.

### Route migration contract

| Retired route | Canonical replacement |
|---|---|
| `/schema/**` | `/pdtf-1/original-standard/schema/**` |
| `/modelling/overlays` | `/pdtf-1/original-standard/schema/overlays` |
| `/modelling/data-dictionary` | `/pdtf-1/original-standard/data-dictionary` |
| `/modelling/business-glossary` | `/pdtf-1/original-standard/business-glossary` |
| `/implementation/**` | `/pdtf-1/original-standard/implementation/**` |
| `/adoption/**` | `/pdtf-1/original-standard/adoption/**` |
| PDTF-owned `/modelling/**` pages | `/pdtf-1/extracted-ontology/lineage-provenance-and-verification/historical-modelling/**` |
| `/mapping/**` | `/pdtf-1/extracted-ontology/lineage-provenance-and-verification/schema-to-ontology-verification/**` |
| `/ontology/provenance` | `/pdtf-1/extracted-ontology/lineage-provenance-and-verification/decision-provenance` |
| `/model/**` | `/pdtf-1/extracted-ontology/model-views-by-audience/**` |
| `/manual/**` | the same canonical model-view targets as `/model/**`; aliases are removed |
| `/ontology/context/{slug}` | `/pdtf-1/extracted-ontology/concepts-and-architecture/contexts/{slug}` |
| `/ontology/category/{slug}` | `/pdtf-1/extracted-ontology/terms-and-model-resources/categories/{slug}` |
| `/ontology/profile/{slug}` | `/pdtf-1/extracted-ontology/validation-and-examples/profiles/{slug}` |
| `/ontology/exemplar/{slug}` | `/pdtf-1/extracted-ontology/validation-and-examples/exemplars/{slug}` |
| other `/ontology/**` reference pages | the matching linked category beneath `/pdtf-1/extracted-ontology/**` |
| `/ontology/tools/**` | `/pdtf-1/extracted-ontology/use-and-tooling/tools/**` |
| `/ontology/artefacts/**` | `/pdtf-1/extracted-ontology/use-and-tooling/artefacts/**` |

`/modelling/adr/**` and `/modelling/odr/**` remain Governance-owned routes and do not
move merely because they share a prefix with historical modelling. `/pdtf/**` and its
`.ttl` representations remain canonical identifiers. SPDTF 2.0, Programme, Resources,
Governance, API and source-viewer routes are outside this migration.

Every retired documentation URL returns not found. There are no redirects, rewrite
aliases, duplicate pages or canonical-link compatibility shells. Preserving an existing
Artalk thread by keeping its old page key on the new page is information preservation,
not route compatibility.

### Authority and status contract

The route hierarchy does not inherit authority downward. Every page and generated
family keeps the five independent fields required by ADR-0074: work area, authority,
maturity, version and provenance. In particular:

- the published schema status does not promote dictionaries, glossaries, models,
  mappings, stubs, generated renderings or adoption claims;
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
`/pdtf-1{,/original-standard}` landings remain. No PDTF-owned route may be unclassified.

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
- the ontology-artefact manifest distinguishes normative serialisations from
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
- [ADR-0074 — Site information architecture](./ADR-0074-organise-site-around-spdtf-2-0-and-pdtf-1-0.md)
- [ADR-0075 — PDTF 1.0 two-part structure](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-2-0-component.md)
- [SPDTF 2.0 information architecture](../spdtf-2-0-information-architecture.md)
