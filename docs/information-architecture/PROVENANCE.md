# Provenance

This directory was imported from the H&M `semantic-modelling` project on 2026-05-28 as a reference for organising OPDA's own ontology documentation. The full set is provided as-is; OPDA may adapt or supersede individual artefacts.

## Source

- Repository: `/Users/henrik/source/hm/semantic-modelling` (private)
- Source commit: `7d9d6d38`
- Source path: `docs/information.architecture/` (note the dotted folder name; renamed to `information-architecture/` here to match OPDA's hyphenated convention)
- Additional sources:
  - 7 governing ADRs (under `governing-adrs-from-hm/`) copied from `docs/adr/`
  - `logical-model-spec.md` copied from `docs/ontology/information-model-logical.md`

## What this is

The H&M semantic-modelling project organises ontology documentation as a 3-tier architecture (per ADR-0035 imported here):

1. **Concept Model** (`docs/manual/<context>/model/concept/`) — business-oriented, non-technical. Domain SMEs and business stakeholders.
2. **Logical Model** (`docs/manual/<context>/model/logical/`) — normalised entity-relationship view; platform-independent typed attributes and cardinalities. Data engineers and architects.
3. **Physical Model** (`docs/manual/<context>/model/physical/`) — OWL/SHACL Turtle + database DDL + SKOS schemes. Ontology engineers and DBAs.

The **information architecture** that describes how this 3-tier documentation is structured, served, and queried lives in:

| Asset | Role |
|---|---|
| `README.md` | Top-level overview |
| `openAPI/` | OpenAPI 3.1 spec for the domain-model REST API (per ADR-0006 in source repo) |
| `schemas/` | 13 JSON Schema (2020-12) + XSD definitions for the metadata entities (per ADR-0005 in source repo) |
| `sparql/` | GRLC-decorated SPARQL queries mapping API endpoints to the triplestore (per ADR-0007 in source repo) |
| `logical-model-spec.md` | Logical information-model spec for the documentation website |
| `governing-adrs-from-hm/` | 7 ADRs that govern the per-tier documentation layers |

## Governing ADRs (imported)

| Source ADR | Scope |
|---|---|
| `ADR-0003-sds-concept-model-documentation.md` | Concept tier — SDS bounded context |
| `ADR-0036-pf-concept-model-documentation.md` | Concept tier — PF bounded context |
| `ADR-0035-logical-model-documentation.md` | Logical tier — both bounded contexts |
| `ADR-0034-sds-physical-ontology-documentation.md` | Physical (ontology) — SDS |
| `ADR-0037-pf-physical-ontology-documentation.md` | Physical (ontology) — PF |
| `ADR-0004-sds-physical-database-documentation.md` | Physical (database) — SDS only (PF has no SQL DB) |
| `ADR-0083-concept-model-diagrams.md` | Diagram conventions for the concept tier |

The numbering reflects the source project's ADR sequence; do **not** treat these as OPDA ADRs. If/when OPDA adopts the 3-tier pattern, those decisions should land as fresh OPDA ADRs in `docs/adr/`, citing these as `## More Information` references.

## Differences vs the source

- Folder renamed from `information.architecture/` to `information-architecture/` (OPDA hyphen convention).
- Internal cross-references in the README files still point at the source's `../../adr/ADR-NNNN-...md` paths; those resolve to the imported copies under `governing-adrs-from-hm/` rather than the source repo. Treat broken-looking links as imports-to-relocate rather than missing content.
- Namespace `https://hm.com/ns/ia/` is the source project's namespace. OPDA would mint its own namespace (e.g. `https://w3id.org/opda/ns/ia/`) if adopting this pattern in production.

## Out of scope

- The actual 3-tier documentation content (`docs/manual/sds/` and `docs/manual/pf/` in the source repo, ~14 MB / 337 files) was **NOT** imported. Only the IA — the structure-describing layer — was copied. If OPDA wants the H&M domain content as reference, that's a separate import.
- Diagrams under `governing-adrs-from-hm/diagrams/` were not separately copied; the ADR markdown files reference them inline.
