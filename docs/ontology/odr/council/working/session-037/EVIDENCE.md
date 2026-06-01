# Session 037 — EVIDENCE: the opda/pdtf URL scheme

## Proposition (as drafted in ADR-0006 amendment 2026-06-01)

opda revises its IRI/namespace scheme for the (pre-publication, greenfield) PDTF ontology. The directing-authority rules:

1. **`opda` = organisation, `pdtf` = standard** → ontology base `https://w3id.org/opda/pdtf/`.
2. **Slash, not hash** — per-term URIs, no `#` anywhere.
3. **No version segment** in IRIs — version via an `owl:versionInfo` literal.
4. **No module segment** in term IRIs — one flat term namespace (the 6 module TTLs are file splits).
5. **Standard entities vs physical resources** split: `…/pdtf/` holds ONLY abstract published standard entities (ontology classes, properties, SKOS schemes + concepts). A second namespace `https://w3id.org/opda/harness/` holds physical resources (data-dictionary PDTF data fields, instance/test data, named graphs) + governance/build (ADRs, ODRs, exemplars).

## The questions

- **Q1 — Org/standard split + base path.** Is `https://w3id.org/opda/pdtf/` (org `opda`, standard `pdtf`) the right base, vs a single `https://w3id.org/opda/` or `https://w3id.org/pdtf/`?
- **Q2 — Hash vs slash.** Slash-based per-term URIs, no hash — correct for a vocabulary of opda's size/shape? (DPV uses hash; hm uses slash. httpRange-14 / Cool URIs / dereference cost.)
- **Q3 — Versioning.** No version segment in IRIs; version carried by `owl:versionInfo` — best practice vs versioned namespace / dated PURL?
- **Q4 — Modules / flat namespace.** Flat term namespace (no module segment) vs hm's `/ns/pf/`,`/ns/sds/` and DPV's `/dpv/pd`,`/dpv/legal` sub-namespaces. Is flattening sound?
- **Q5 — Standard-entity vs physical-resource split.** Partitioning the namespace into `/pdtf/` (the standard) vs `/harness/` (about/supporting it) — sound linked-data practice, or over-engineering (one namespace + rdf:type)?
- **Q6 — data-dictionary placement.** The 582 data-dictionary entries are physical PDTF data fields → `/harness/` (not standard entities). Correct?
- **Q7 — SHACL shapes placement.** Shape *entities* (base shapes + profile shapes, in the `opda:` namespace) → `/pdtf/` vs a dedicated `/shacl/` vs `/harness/`; shape/profile *documents* → `/harness/`. Where do shape NODES live?
- **Q8 — Profiles.** Per-form overlay profiles (baspi5, ta6, con29R, llc1, … 31 forms, each a SHACL overlay `dct:source`-linked to an external form question) — standard entities (`/pdtf/profiles/`) or physical resources (`/harness/profiles/`)?

## Current scheme (what's emitted today)

| Family | ~Count | Current form |
|---|---|---|
| Ontology terms (`opda:`) | 147 + enums | `https://w3id.org/opda/#Property`, `…/#role/Buyer` (HASH) |
| data-dictionary | 582 | `…/opda/data-dictionary#propertyPack.environmentalIssues.flooding` (HASH) |
| ODR anchors | 356 | `…/opda/odr/ODR-0011#section-5a` (HASH) |
| Version IRI | 63 | `…/opda/1.0.0/` |
| Per-module ontology/shape/annotation IRIs | ~30 | `…/opda/property`, `…/opda/property-shapes`, `…/opda/property/1.0.0/` |
| SKOS concept schemes | 45 | `…/opda/vocabularies/<scheme>` |
| Profiles | ~70 | `…/opda/profiles/baspi5`, `…/profiles/baspi5/0.1.0/` |
| Named graphs | ~8 | `…/opda/graph/foundation`, `…/graph/inferred/entailment` |
| Instance/test data | ~30 | `…/opda/data/baspi5-conformant/…`, `…/data/exemplar-reports/…` |
| ADR/exemplar links | ~300 | `https://openpropdata.org.uk/adr/ADR-NNNN-slug`, `…/data/exemplar/<stem>` |

## Proposed new forms (the scheme under review)

- term: `https://w3id.org/opda/pdtf/Property` · concept: `…/pdtf/role/Buyer` · scheme: `…/pdtf/role`
- data-dictionary: `…/opda/harness/data-dictionary/propertyPack.environmentalIssues.flooding`
- version: `…/opda/pdtf/` + `owl:versionInfo "1.0.0"`
- named graph: `…/opda/harness/graph/foundation` · instance data: `…/opda/harness/data/…`
- ADR: `…/opda/harness/adr/ADR-0007-slug` · ODR anchor: `…/opda/harness/odr/ODR-0011/section-5a`
- profiles / shapes: UNDER REVIEW (Q7/Q8)

## Prior art (verified 2026-06-01)

**hm / semantic-modelling (sibling project):**
- Term namespace `https://hm.com/ns/` — **SLASH, no hash**.
- **Sub-namespaces per bounded context**: `https://hm.com/ns/pf/` (property facts), `https://hm.com/ns/sds/` — i.e. hm DOES use module/context segments (contradicts proposed rule 4).
- Named graphs: `urn:hm:graph:<NN-category>:<filename>` — a **URN** scheme, not http (contradicts the proposed `…/harness/graph/<name>` http form).
- Assembler-config dataset; Jena toolchain (shared with opda's ADR-0036/0037).

**DPV (W3C Data Privacy Vocabulary — the precedent ADR-0006 cites, Pandit principal author):**
- `https://w3id.org/dpv/` with **slash sub-vocabularies/modules**: `dpv/pd`, `dpv/legal`, `dpv/legal/eu/gdpr` (contradicts proposed rule 4).
- **HASH for terms within each module**: `w3id.org/dpv/pd#Address`, `w3id.org/dpv/legal/eu/gdpr#A6-1-a` (contradicts proposed rule 2).
- Versioning: unversioned namespace + dated releases (relevant to Q3).

## Prior records

- **ADR-0006** (this amendment) — w3id.org/opda namespace + the 2026-06-01 revision under review.
- **ODR-0004 §Rules.1** — committed (S004, 9-0, Knublauch DA) to a "single `opda:` **HASH** namespace". The proposal (rule 2, slash) **overrides** this — a directing-authority override of a council-ratified decision, on greenfield/pre-publication grounds.
- **ODR-0002** — pins SHACL 1.2. **ODR-0010/0013** — overlay profile mechanism (Q7/Q8).
- **[[opda-greenfield-no-wg-gate]]** — directing authority ratifies modelling decisions directly for this greenfield build; gates still apply.

## Constraint

This blocks the namespace migration (emitter + all TTLs + loader + ODRs/ADRs + scripts/docs regenerate/reload). The Jena toolchain (ADR-0035/0036/0037, Fuseki-local + pyshacl retired) is already built + green on branch `fix/epccertificate-emitter-domain-mismatch`.
