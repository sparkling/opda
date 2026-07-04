---
status: accepted
date: 2026-07-04
kind: architecture
tags: [rml, provenance, traceability, skos, verification]
scope: [pdtf-v3]
supersedes: []
depends-on: [ODR-0004, ODR-0011]
implements: [ODR-0003]
---

# RML as OPDA's Bidirectional Schema-Provenance Verification Mechanism

## Context and Problem Statement

[ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) §7a establishes the term-sourcing-and-provenance convention: every minted `opda:` term carries a `dct:source` citation to its authoritative origin, resolved by a five-tier precedence (W3C spec > OPDA Trust Framework > regulator > business glossary > canonical schema-dictionary leaf). This is a real, working discipline — but it has two structural limits that ODR-0004 does not address.

First, `dct:source` is a single-valued citation of a term's *authoritative definitional origin*, not a record of every place the term's data actually occurs in the PDTF v3 JSON schemas. A shared, domain-less property (`opda:name`, `opda:price`, `opda:amount`) legitimately occurs at dozens of distinct schema locations, but carries exactly one `dct:source` — the convention has no way to express "and also here, and here." Second, and more materially: nothing independently verifies that a `dct:source` citation actually resolves to something real. Auditing the ontology's own `dct:source` citations against the canonical schema dictionary this session found 8 citations with a precise, locatable path drift (the field exists, cited under a stale or incomplete nesting) and 16 with no matching field anywhere in the current v3 schema at all — defects that predate this work and that the generator's own emission process never caught, because nothing checked the citations *back* against the schema.

Dublin Core Terms itself gives no help here: `dct:source` is formally "a related resource from which the described resource is derived" — a plain resource-to-resource relationship. DCMI is silent on structural or positional references within a document; OPDA's practice of encoding a dotted JSON path into the citation target's IRI local name is an internal convention, not something DCMI provides or requires.

The problem: OPDA needs a mechanism that (a) can express many-to-one and one-to-many correspondence between schema locations and ontology terms, (b) is independently, mechanically checkable in both directions — every resource traces to a real schema location, and every schema location that has been used traces to a resource — and (c) does not require inventing a bespoke correspondence format when a W3C-track standard already exists for exactly this problem.

## Considered Options

* **Option A — Rely solely on the existing `dct:source` convention (status quo).** Rejected: single-valued, cannot express multiplicity, and — demonstrated this session — nothing verifies the citations resolve to anything real. The drift found (8 stale, 16 unresolved of 570 citations) was invisible under this convention alone.
* **Option B (chosen) — Adopt RML (RDF Mapping Language) as an independent, bidirectional, machine-checkable provenance trace, used purely as declarative documentation.** RML is a W3C submission purpose-built for expressing structural correspondence between a source format (here, JSON Schema) and RDF — native support for iteration, joins, and per-value multiplicity that `dct:source`'s single citation cannot express. Adopted here explicitly as a **documentation and verification artefact, not an executable ETL pipeline** — no PDTF transaction instance data is used or generated as part of this decision; the mapping is validated structurally against the ontology and the canonical schema dictionary, never against live instance data.
* **Option C — Invent a bespoke correspondence format (e.g. custom JSON-Pointer annotations, ad hoc SPARQL CONSTRUCT rules).** Rejected: reinvents a solved problem. RML already has tooling (morph-kgc), a test-suite lineage, and a community of implementations; a bespoke format would have none of that and would need its own parser, validator, and documentation from scratch.

## Decision Outcome

Chosen option: "Adopt RML as an independent, bidirectional, machine-checkable provenance trace" (Option B), because it is the only option that both expresses the real multiplicity `dct:source` cannot and is independently, mechanically verifiable — and because a purpose-built W3C-track standard exists for exactly this correspondence problem, so inventing a bespoke format would be pure waste.

RML does not replace `dct:source`. The two mechanisms answer different questions and are verified independently, by design:

- `dct:source` answers *"which single authoritative source defines this term's meaning"* — an editorial/precedence decision that is frequently not the schema at all (89 of 570 `dct:source` citations across the ontology resolve to an ODR/council decision, not a JSON location).
- RML answers *"where, structurally, does this term's data actually live in the PDTF v3 schemas, and how many places"* — a positional/navigational question `dct:source`'s single-valued convention cannot express.

Where both exist for the same term, they are expected to *usually* agree (verified this session: 68 of 73 directly comparable predicates do) but are **not required to** — a shared property citing one authoritative `dct:source` while RML legitimately records several real schema occurrences is correct behaviour, not drift.

### Consequences

* Good, because it caught real, previously-invisible defects in the existing `dct:source` discipline: 8 stale-path citations and 16 unresolved citations, none of which the generator's own emission process had ever verified.
* Good, because it can express what `dct:source`'s single-valued convention structurally cannot — every real occurrence of a shared/collapsed property, not just its one authoritative origin.
* Good, because it reuses a purpose-built, W3C-track standard (RML) rather than inventing a bespoke correspondence format.
* Bad, because it introduces a second provenance-recording mechanism alongside `dct:source`, which future contributors must understand are complementary, not redundant, and are not expected to always agree.
* Neutral, because the RML mapping's own coverage of the full schema-generated ontology surface is partial as of this record (roughly a third of resources traced) — closing the remainder is ongoing, separate work, not a precondition of adopting the mechanism itself.

### Confirmation

Verified by the RML-provenance validation harness (see the companion ADR for the concrete engineering: engine, checks, and file locations) — three checks: RML-to-ontology term consistency, resource-to-schema-location tracing, and schema-location-to-resource tracing; plus an independent audit of the ontology's own `dct:source` citations against the canonical schema dictionary.

## Rules

- RML mapping content lives under `source/03-standards/rml/`, alongside the ontology and the schemas it traces (not under `tools/`) — it is a standards artefact, not a build tool.
- The RML mapping is documentation and verification tooling. It MUST NOT be treated as, or repurposed into, an executable ETL pipeline against PDTF transaction instance data as part of this decision; no instance data is required for, or produced by, verifying it.
- `dct:source` and the RML mapping are independently verified and are not required to agree term-for-term. A disagreement is only a defect if the RML-cited path fails to resolve in the canonical schema dictionary at all (a broken trace), not merely because it differs from that term's single `dct:source` citation.
- Where a schema location is referenced by RML but does not correspond to any minted `opda:` term, that is a genuine, honestly-reported gap — not silently dropped and not fabricated to close it.

## More Information

- Depends on [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) (term-sourcing/`dct:source` five-tier precedence, which this record extends with independent verification, not replacement).
- Depends on [ODR-0011](./ODR-0011-enumeration-vocabularies.md) (SKOS concept schemes for enums) — the RML mapping traces enum-value bindings against schemes this record establishes; the concrete RML technique for that binding is an engineering decision recorded in the companion ADR, not here.
- Companion engineering record: ADR-0057 (RML mapping implementation — engine, validation harness, file layout).
- Related principle: [ODR-0026](./ODR-0026-owl-rl-safe-ruleset-and-unevaluated-modelling-axioms.md) "model-but-don't-evaluate" — the same shape of idea applies here: RML traces are documentary/verification content that coexists with `dct:source` without either evaluating or superseding the other.
