# OPDA Knowledge Base

This repository is the working knowledge base, public documentation site and semantic-model
toolchain for the [Open Property Data Association](https://openpropdata.org.uk/). It supports
the development of the **Smart Property Data Trust Framework (SPDTF)**: a shared language for
property information, developed through evidence-led semantic modelling and human working-group
review.

The public knowledge base is [opda.org.uk](https://opda.org.uk/).

> **Status and authority:** SPDTF is in development. It is not an adopted OPDA standard or an
> approved statutory property Smart Data scheme. The existing PDTF schema, the separate ontology
> derived from it, and the Property Pack ontology candidate each retain their own provenance and
> maturity. Publication, machine validation or AI agreement does not promote any of them.

## Programme context

OPDA is moving from a schema-led exchange artefact to a collaboratively governed scheme:

- the existing **PDTF schema** describes Digital Property Pack data in JSON Schema, overlays,
  a data dictionary, a business glossary and implementation material;
- the separate **schema-derived ontology** makes concepts, relationships, constraints and
  provenance from that corpus inspectable as linked data; and
- **SPDTF** uses those materials as attributed evidence alongside practitioner knowledge,
  recognised sources, examples and competency questions. Working groups decide domain meaning.

The UK government context is important but bounded. The Data (Use and Access) Act 2025 provides
regulation-making powers for Smart Data schemes, and
[Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy) sets the
cross-economy direction. Property remains a prospective scheme area subject to feasibility,
governance, legal assessment and consultation; see the
[multi-sector call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence)
and the
[Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap).
OPDA contributes evidence and tested approaches. Participation in government forums does not
confer government or statutory authority on OPDA, PDTF or SPDTF.

## How the bodies of work relate

| Body of work | Role in this repository | Current authority boundary |
|---|---|---|
| **PDTF schema** | Existing Digital Property Pack JSON Schema package, overlays, dictionary, glossary and implementation evidence. It is presented under SPDTF inputs for compatibility, migration and review. | A source-specific third-party technical input; it was not produced through the SPDTF working-group process and does not determine SPDTF meaning. |
| **Schema-derived ontology** | OPDA-produced draft linked-data extraction from PDTF-schema material, with RDF/OWL, SKOS, SHACL, mappings, model views and validation evidence. Stable technical identifiers use `/pdtf/**`. | Separate technical evidence: not part of the PDTF schema, not SPDTF and not evidence of working-group consensus. |
| **SPDTF** | The first Smart Property Data Trust Framework scheme draft being authored collaboratively across industry and stakeholders. | In development and non-normative. Human working groups own meaning; recorded governance controls promotion. |
| **Property Pack ontology candidate** | A greenfield SPDTF component built from the closed scope of 451 required Property Pack source items. The candidate has proposed context homes, RDF/OWL, SKOS, SHACL, registers and deterministic validation receipts. | Machine-proposed and non-normative. The accelerated Technical Working Group determination and later domain review are distinct, pending authority stages. |

The Property Pack is a cross-context delivery profile, not a universal bounded context and not
the whole SPDTF ontology. Its 451 source items are coverage requirements, not 451 pre-decided RDF
properties. The candidate deliberately does not inherit the PDTF schema tree or schema-derived
ontology topology as semantic authority.

Useful entry points:

- [Programme overview](https://opda.org.uk/programme)
- [SPDTF development workspace](https://opda.org.uk/spdtf)
- [Property Pack ontology candidate](https://opda.org.uk/spdtf/property-pack)
- [PDTF schema and schema-derived ontology inputs](https://opda.org.uk/spdtf/inputs/pdtf-schema)

## Semantic-modelling method

The project works evidence-up rather than treating a document tree as the business model:

1. Name the bounded context, accountable owner, scope, exclusions and practitioner-language
   competency questions.
2. Register attributed evidence, including participant language, examples, counterexamples,
   documents, datasets, standards and relevant PDTF material. Record source, version,
   permission, sensitivity, confidence and dissent.
3. Align six reviewable outputs as one versioned semantic package: **business glossary, data
   dictionary, taxonomies, controlled vocabularies, resources and relationships**.
4. Encode the candidate within a declared RDF/RDFS/OWL, SKOS and SHACL feature boundary.
5. Run reproducible syntax, graph, constraint, coverage and competency-query checks.
6. Publish readable definitions, diagrams, evidence, validation receipts and open questions for
   practitioner review.
7. Record the human disposition and preserve the candidate version and immutable diff. Review
   may return the work for more evidence or revision.

Every OPDA-defined resource has one semantic home. Domain groups own local meaning;
Interoperability owns only the small common boundary, context map, qualified mappings and shared
exchange conventions. Generated JSON Schema, JSON-LD, forms, APIs and documentation are
downstream projections of a governed package, not independent sources of meaning.

The authority behind the method is deliberately explicit:

- [ADR-0063](docs/adr/ADR-0063-domain-led-bounded-context-working-groups.md) accepts the
  domain-led bounded-context structure and evidence-led sequence.
- [ADR-0067](docs/adr/ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
  accepts the first-principles architecture for the Property Pack candidate.
- [ADR-0065](docs/adr/ADR-0065-ai-assisted-evidence-to-model-workflow.md) and
  [ADR-0068](docs/adr/ADR-0068-govern-opda-standards-lifecycle.md) remain proposed as
  SPDTF-wide operating and promotion policy. They must not be described as operative rules.

See the public [semantic-modelling guide](https://opda.org.uk/semantic-modelling) and the
repository's [linked-data initiative notes](docs/linked-data-initiative/00-INDEX.md) for the
long-form method and architecture.

## Working groups and governance

The accepted modelling roster contains six property bounded-context groups:

- Finance and Banking;
- Conveyancing;
- Estate Agency;
- Surveying and Valuation;
- Property Data Services; and
- Property Technology.

It also contains an OPDA-internal **DBT Smart Data** scheme-design group and a peer
**Interoperability Working Group**. The DBT-named group is not government-established and cannot
confer statutory status. The separate **Technology Working Group** provides cross-cutting
implementation evidence and technical assurance; it is not a ninth modelling context and does
not decide domain meaning.

The accepted operational pattern uses a private Microsoft Team for discussion and a separate
SharePoint source-intake site with organisation-isolated folders. Finance and Banking and the
cross-cutting Technology group have implemented workspaces; the other modelling workspaces are
planned. These systems support participation but do not create standards authority. The public
[`/join`](https://opda.org.uk/join) route collects expressions of interest; registration does not
automatically grant membership, Microsoft access, voting rights or publication approval.

The proposed standards lifecycle distinguishes evidence records, editor's candidates, Working
Drafts, Public Review Drafts, Release Candidates and ratified OPDA Standards. Because
ADR-0068 remains proposed, those later promotion stages are not yet an operative OPDA rule.
Across current work, the safe invariant is simpler: tools and AI may extract, compare, draft and
test; practitioners judge meaning; only a recorded, authorised human decision can change a
candidate's standing.

[ADR-0001](docs/adr/ADR-0001-adopt-dcam-dmbok-elements.md) selectively adopts useful DCAM v3
and DAMA-DMBOK2 vocabulary and controls for OPDA's operating model, business-data knowledge,
quality, security and evidence-based conformance. It is not a wholesale DCAM implementation or a
licence to reproduce DCAM's proprietary capability text. Individual governance workstreams and
pages keep their own accepted, proposed or deferred status.

## Public knowledge base

The Astro site has six reader-oriented destinations, in this order:

1. **Programme** — purpose, roadmap and public-policy context;
2. **Governance** — authority, status, lifecycle and decisions;
3. **Modelling** — ontology concepts and the SPDTF modelling method;
4. **Development** — candidates, questions, outputs and attributed inputs;
5. **Groups** — the canonical SPDTF working-group family; and
6. **Resources** — source records, glossary, library and historical material.

The site is public. Optional member sign-in supports comments only; it is not a reading gate.
The design and accessibility contract is [DESIGN.md](DESIGN.md). A page being visible on the
site does not make its content normative: status, authority, version and provenance remain
separate metadata.

## Repository map

| Path | Purpose |
|---|---|
| `src/pages/` | Astro routes, including the public programme, governance, modelling, SPDTF, Property Pack and generated PDTF-reference families. |
| `src/components/`, `src/layouts/`, `src/lib/`, `src/styles/` | Shared interface, navigation, content contracts, model loaders and design-system implementation. |
| `src/data/` | Maintained and generated site inputs, including the Property Pack catalogue, working-group data, route receipts and committed ontology model. |
| `public/` | Unprocessed static assets and generated public data bundles copied into `dist/`. |
| `docs/` | ADRs, ontology decision records, generated manual content, plans, research, specifications and supporting working documents. Only configured content collections are rendered automatically. |
| `source/` | Evidence and standards material. It combines tracked semantic sources with a large, mostly gitignored research/upstream archive; see [source/README.md](source/README.md). |
| `source/03-standards/ontology/` | Canonical committed schema-derived ontology corpus consumed by `opda-gen`, Fuseki and CI. |
| `source/03-standards/ontology-candidates/property-pack/` | Isolated, versioned Property Pack candidate artefacts and validation receipts. |
| `tools/opda-gen/` | Python 3.11 deterministic generator and ontology CI gates. |
| `scripts/` | Site/data build orchestration, resource bundles, Property Pack generation, drift checks and operational helpers. |
| `src/api/` | Build-time GRLC-style SPARQL-to-REST API queried while generating static entity pages. |
| `config/` | Fuseki, AWS, calibration and operational configuration. |
| `tests/` | Node contract tests, Python schema tests, ontology fixtures and Playwright release gates. |
| `.github/workflows/` | AWS site/infra pipelines and dedicated ontology and BASPI5 round-trip workflows. |
| `Makefile` | Canonical task entry point. Run `make help` for the complete grouped command list. |

Local runtime caches and build outputs such as `node_modules/`, `.astro/`, `dist/`, `.fuseki/`,
`.jena/` and `run/` are not source artefacts.

## Prerequisites

For the site alone:

- Node.js (CI uses Node 22);
- Corepack; and
- pnpm 11.17.0, pinned by `package.json`.

For data-backed and ontology work:

- Java 17 or newer for Apache Jena/Fuseki and SHACL (CI uses Java 21);
- Python 3.11 exactly for `tools/opda-gen`; and
- Docker only for the optional Skosmos browser.

The Jena/Fuseki distributions are downloaded, checksum-verified and cached locally when required.

## Local development

```bash
corepack enable
make install
make dev
```

`make dev` starts the Astro development server on the first free loopback port from 4330 to
4339. The wrapper detects and reuses an existing server for this project so two processes do not
corrupt the shared Vite cache.

Common site commands:

| Command | Result |
|---|---|
| `make help` | Show the complete command catalogue. |
| `make install` | Install the CI-locked pnpm dependency graph. |
| `make dev` | Run the ordinary Astro development server. |
| `make build` | Build the static site into `dist/` without starting a triplestore. |
| `make preview` | Build and serve `dist/` with Astro preview. |
| `make build-data` | Run ephemeral Fuseki and the build-time API, refresh generated ontology views, build `dist/`, then stop the services. Requires Java 17+. |
| `make css` | Rebuild the generated Tailwind stylesheet and design-module facade. |

The Astro development middleware exposes selected `source/` and `_build/` files on loopback for
the resource viewer. Those directories are not copied wholesale into the production bundle.

## Data, API and ontology tooling

Create the Python 3.11 environment before the first `opda-gen` task:

```bash
python3.11 -m venv tools/opda-gen/.venv
make ontology-install
```

Some profile and traceability gates also read the gitignored upstream PDTF schema checkout at
`source/03-standards/schemas/`. The dedicated ontology workflows clone a pinned upstream revision;
a local full ontology run requires the corresponding archive to be present.

Key commands:

| Command | Purpose |
|---|---|
| `make serve-data` | Start local Fuseki on port 3031 and the build-time API on port 3002; keep both running for development. |
| `make jena-load` | Clear and reload canonical ontology Turtle files into an already-running Fuseki. |
| `make api` | Run the SPARQL-to-REST API alone against Fuseki on port 3031. |
| `make ontology-model` | Refresh `src/data/ontology-model.json` from a running Fuseki. |
| `make skosmos` | Browse local SKOS vocabularies at port 9090 using Docker; requires `make serve-data`. |
| `make ontology-test` | Run the `opda-gen` pytest unit suite. |
| `make verify-ontology` | Regenerate into a temporary directory and prove byte identity with the canonical ontology corpus. |
| `make ci-ontology` | Run the complete local ontology gate set, including unit, profile, coverage, description and byte-identity checks. |
| `make ci-ontology-doc` / `make ci-ontology-graph` | Check that committed human-reference and graph projections match the ontology corpus/model. |
| `make ci-ontology-model` | Re-extract the committed model from live Fuseki and check drift; requires `make serve-data`. |
| `make property-pack-candidate` | Regenerate the isolated Property Pack candidate from maintained catalogue/model sources. |
| `make validate-property-pack-candidate` | Run RDF, SHACL, SPARQL and coverage checks without rewriting the candidate. |
| `make verify-property-pack-candidate` | Regenerate in a temporary directory and prove candidate byte identity. |
| `make ci-property-pack-candidate` | Run both non-publishing Property Pack candidate gates. |
| `make data` | Regenerate public JSON resource bundles from the available local `source/` archive. |
| `make resources-manifest` | Rebuild the committed resource manifest from the gitignored local archive; local/out-of-band only. |

Fuseki and `src/api/` are build-time/local services. They are not deployed as a public production
triplestore or ontology API; production receives static HTML and assets generated into `dist/`.

## Tests and CI boundaries

There is no `lint` script. Use the checks that correspond to the changed surface:

| Command | Scope |
|---|---|
| `make test` | Root Node test suite: Markdown transforms plus site, data, IA, Property Pack and operational contracts. |
| `make test-schema` / `make check-schema-drift` | Schema reproducibility boundary and strict generated-page drift. |
| `make check-design-system` | Generated design-module facade drift. |
| `make check-ia-preservation` | Route, artefact, service and support-asset preservation receipts. |
| `make check-adr` | Generated ADR registry drift. |
| `make check-links` / `make check-resource-links` | Internal ontology/PDTF link and source-resource receipt checks after `make build-data`. |
| `make ci` | Locally checkable unit, schema, design, IA, ADR, SPDTF-IA and ontology gates. It does not run the full data build or browser suite. |
| `make ci-browser` | Full data build followed by IA, route and Playwright release gates against the resulting `dist/`. |
| `make test-smoke`, `make test-e2e`, `make test-a11y`, `make test-visual` | Focused Playwright gates. Build `dist/` first; the tests serve that built output. |

The AWS site workflow adds the full data build, unit/schema checks, route/resource crawls,
browser/accessibility gates, generated-model drift, ontology relationship coverage and internal
link checks before deployment credentials are configured. Dedicated workflows independently
check ontology byte identity and the BASPI5 round-trip harness.

## Deployment and publication boundaries

Production is an AWS deployment: GitHub Actions builds the static site, synchronises `dist/` to
S3 and invalidates CloudFront. Fuseki and the build-time API are torn down before publication.
CloudFormation manages the site and narrowly scoped runtime services such as working-group
registration, member comment sessions and comments.

- `make deploy` is **not** a local deploy: it pushes `main` to `origin`, allowing the AWS workflow
  to build, validate and deploy applicable production changes.
- `make deploy-manual` invokes the retired Cloudflare/Wrangler escape hatch. It is not the
  canonical production route and should normally be avoided.
- `make publish-resources` synchronises the large local source archive to its public S3 resource
  bucket. It is an explicit, out-of-band publication action, not a CI step.

Do not run any deploy, push, resource publication or infrastructure workflow merely to validate a
local change. Publication always requires explicit current-task authority.

## Documentation and decision records

Repository documents and public pages have different roles:

- [AGENTS.md](AGENTS.md) is the shared contributor and execution contract.
- [DESIGN.md](DESIGN.md) is the normative human contract for the web interface.
- [`docs/adr/`](docs/adr/README.md) records project, governance, architecture and tooling
  decisions. ADR status is authoritative; proposed material must remain visibly proposed.
- [`docs/ontology/odr/`](docs/ontology/odr/) records modelling decisions for the
  schema-derived ontology and its historical programme.
- `docs/manual/`, `docs/ontology/odr/` and `docs/adr/` are loaded as Astro content collections;
  other plans, research and working documents are not automatically public site content.
- `src/pages/` is the maintained source for public route content. Moving a fact into a page does
  not change its decision status or authority.

ADRs use a flat, globally numbered MADR 4.x convention:

- filename `ADR-NNNN-lowercase-slug.md`, with the next unused four-digit number;
- YAML frontmatter for status, date, tags and typed relations;
- status from the exact project enum documented in [`docs/adr/README.md`](docs/adr/README.md);
- required context, considered-options, decision, consequences and confirmation sections; and
- explicit dated amendments for substantive corrections—never a silent rewrite of decision
  history.

After changing ADR files, run `make gen-adr` to refresh `src/lib/adr-pages.mjs`, then
`make check-adr`. Preserve original evidence, stable identifiers and provenance unless another
authorised decision explicitly changes them.

## Contributing

Before changing the repository, read [AGENTS.md](AGENTS.md), the relevant accepted ADRs and the
nearest source documentation. In particular:

1. Keep the distinction between source evidence, machine proposals, human review and normative
   decisions visible in code, data and prose.
2. Add or update tests first where behaviour changes. Run `make test` and `make build` at minimum
   for code changes; add data, ontology and browser gates in proportion to the affected surface.
3. Validate input at system boundaries, use typed public interfaces and do not hardcode secrets,
   credentials or personal data. Never commit `.env` files.
4. Keep files below 500 lines and place new material in the existing `src/`, `tests/`, `docs/`,
   `config/` or `scripts/` structure rather than the repository root.
5. Treat upstream, research and participant material as attributed evidence. Preserve source,
   version, rights, sensitivity and provenance; do not assume inclusion authorises republication.
6. Use conventional commits (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`),
   stage only in-scope changes and do not push without explicit permission.

No top-level `LICENSE` file currently grants a repository-wide licence. Imported and upstream
materials retain their own terms; confirm rights before reuse or redistribution.

## Related links

- [OPDA association website](https://openpropdata.org.uk/)
- [OPDA Knowledge Base](https://opda.org.uk/)
- [PDTF schema documentation in the Knowledge Base](https://opda.org.uk/spdtf/inputs/pdtf-schema/schema-and-supporting-material)
- [Canonical PDTF transaction JSON Schema](https://trust.propdata.org.uk/schemas/v3/pdtf-transaction.json)
- [Property Data Trust Framework GitHub organisation](https://github.com/Property-Data-Trust-Framework)
- [Repository ADR index](docs/adr/README.md)
