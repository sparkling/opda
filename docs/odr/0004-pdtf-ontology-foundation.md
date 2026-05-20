# ODR 0004 — Foundation: Namespace, URIs & Ontology Structure

- **Status:** Proposed (planning stub — flesh out in a follow-up Council session)
- **Date:** 2026-05-20
- **Phase:** Spike (critical path — blocks ODR-0005 onward)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q1, Q3, Q7)

## Scope

The shared substrate every other PDTF-ontology ODR depends on.

- **Namespace & URIs.** Single canonical `opda:` namespace; **hash URIs** for the TBox (Cagle/Gandon/Knublauch, 9-0). Candidate `https://opda.uk/ns/` vs `https://trust.propdata.org.uk/ontology/` — needs WG input. Instance-URI *pattern* declared (e.g. `…/property/uprn/{n}`) though no instances are minted this round.
- **Layer-segregated naming** (Guizzardi): a reader must see from the URI alone whether a class is a **sortal/Kind** (carries identity) or a **role/phase** (borrows it). Naming convention, not separate namespaces.
- **Ontology header pattern.** Every file's `owl:Ontology`: `dct:title`/`creator`/`issued`/`modified`, `vann:preferredNamespacePrefix`/`Uri`, `owl:versionIRI`, plus an `sh:prefixes` declaration node so SHACL-SPARQL constraints resolve prefixes (Knublauch).
- **Graph separation** (Gandon/Knublauch): the OWL/RDFS **class graph** and the SHACL **shapes graph** are separate artefacts; shapes reference classes via `sh:targetClass`, never `owl:imports`. Open-world (OWL) and closed-world (SHACL) must not leak — an `owl:minCardinality` is *not* a `sh:minCount`.
- **Generator-first policy** (Allemang): mechanical slot→property translation is tooled; ODR review is reserved for ambiguous moves.
- **Diagnostic-exemplar policy** (Guarino, Q1): permit 3–4 non-deliverable worked individuals solely to pressure-test identity criteria. Defines what an exemplar is and where it lives.
- **Dereferenceability commitment** (Gandon/Hendler/Davis): if URIs are minted they must resolve (at minimum to the TBox); record the persistence commitment honestly, or scope to local-copy consumption.

## Vocabularies

Core only (RDF/RDFS/OWL/XSD/Dublin Core/VANN); SHACL + DASH *declared* but shapes authored in ODR-0010/0013.

## Open questions

- Exact base namespace URI + versioning scheme (calendar vs semantic mirroring schema 3.4.0) — WG decision.
- Repo location for the TTL (`source/03-standards/ontology/` peer to `schemas/`).

## Deliverables (when fleshed out)

`foundation.ttl` skeleton + ontology-header template; namespace/URI policy note; the diagnostic-exemplar harness location; a generator spec for the mechanical half.
