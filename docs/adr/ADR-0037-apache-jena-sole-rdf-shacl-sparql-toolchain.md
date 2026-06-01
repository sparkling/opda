---
status: accepted
date: 2026-06-01
tags: [toolchain, jena, shacl-1-2, rdf-1-2, sparql, pyshacl, rdflib, conformance]
supersedes: []
depends-on: [ODR-0025, ADR-0035, ADR-0036, ADR-0014]
implements: []
---

# Apache Jena as opda's Sole RDF/SHACL/SPARQL 1.2 Toolchain

## Context and Problem Statement

opda's RDF work is currently split across two stacks: a Node loader (`scripts/fuseki-load.mjs`) populates Jena Fuseki for build-time page generation (ADR-0021), while validation runs on **pyshacl** (`rdflib`-backed; ADR-0014). ODR-0025 commits opda to **RDF 1.2** and **SHACL 1.2**. The problem: the Python stack cannot meet those specifications — **pyshacl** tracks SHACL 1.0 / the 2017 Recommendation (no 1.2), and **`rdflib`** (7.x) cannot parse RDF 1.2 triple-term syntax. Using either silently degrades conformance: 1.2 constructs are skipped or mis-parsed with no error raised. ADR-0035 (inference) and ADR-0036 (validation) already moved their pieces to Jena. This ADR makes the general rule explicit so it is not re-litigated per component.

## Decision Drivers

* ODR-0025 pins RDF 1.2 + SHACL 1.2; the toolchain must **conform**, not silently degrade.
* A single conformant toolchain beats a split one — no per-tool capability matrix to track, no silent-skip failure modes at the seams.
* Apache **Jena 6.1.0** (`riot`, `jena-shacl`, ARQ, TDB2) implements RDF 1.2, SHACL 1.2 (incl. SHACL-AF), and SPARQL 1.2; it is the reference-grade JVM implementation.
* The cost of a wrong/silent validation or parse in a master-data ontology is high (ODR-0010: "silently incorrect with no reasoner to catch it").

## Considered Options

* **A — Apache Jena as the sole RDF/SHACL/SPARQL toolchain; pyshacl/`rdflib` prohibited** from every RDF path.
* **B — Mixed stack** — Jena where 1.2 is needed, pyshacl/`rdflib` elsewhere.
* **C — pyshacl/`rdflib` primary, Jena only for the 1.2 gaps.**

## Decision Outcome

Chosen option: **A**. Apache Jena is opda's sole implementation for every RDF operation — parse/serialise (`riot`), inference materialisation (ARQ SPARQL `UPDATE`; ADR-0035), SHACL validation (`jena-shacl`; ADR-0036), and querying (ARQ; ADR-0021). **pyshacl and `rdflib` are prohibited** from opda's parse/serialise/validate/infer/query paths. Rationale: Jena is the only implementation that conforms to the RDF 1.2 and SHACL 1.2 specifications opda has adopted; any `rdflib`/pyshacl step silently degrades that conformance, and a split toolchain forces per-tool capability tracking with silent-failure modes. **Pin Jena 6.1.0.**

### Consequences

* Good, because every RDF operation is spec-conformant by construction — no silent skips of 1.2 constructs.
* Good, because one toolchain: no capability matrix to track across two stacks, no seam where 1.2 data meets a 1.0 tool.
* Good, because it unblocks RDF 1.2 triple-term syntax end-to-end (ODR-0025 §R5).
* Bad, because a JVM/Jena dependency enters every RDF path and CI; Python contributors must invoke Jena (`riot`/`shacl`/`arq`, e.g. via subprocess or a small JVM step) rather than `import rdflib`.
* Bad, because the BASPI5 round-trip harness (ADR-0014, pyshacl `0.25.0`) must be re-implemented on Jena — gated on the ADR-0036 parity check before the pyshacl path is removed.
* Neutral, because `opda-gen` may remain Python for **non-RDF** logic (reading PDTF JSON, templating, orchestration, building TTL as text); the prohibition is specifically on Python **RDF parse/serialise/validate/infer/query** (use Jena), not on Python generally.

### Confirmation

* A CI dependency-scan gate: fail if `rdflib` or `pyshacl` appears in the requirements of any RDF parse/validate path.
* Validation runs on `jena-shacl` (ADR-0036); inference on ARQ (ADR-0035); the round-trip harness, once migrated, invokes Jena.
* **Jena pinned to 6.1.0** (RDF 1.2 / SHACL 1.2 capable) wherever the toolchain is installed or containerised.

## Pros and Cons of the Options

### A — Jena sole toolchain

* Good, because spec-conformant everywhere; a single stack.
* Bad, because a JVM enters every RDF path; Python RDF steps must shell out to Jena.

### B — Mixed stack

* Good, because it keeps existing Python where it "works".
* Bad, because pyshacl/`rdflib` silently miss 1.2; per-tool capability gaps; the exact silent-degradation ODR-0025 forbids.

### C — pyshacl/`rdflib` primary

* Good, because lightest for Python contributors.
* Bad, because neither tool conforms to RDF/SHACL 1.2 — a non-starter against ODR-0025.

## More Information

- Governs (general policy over): ADR-0035 (inference via Jena/ARQ) and ADR-0036 (SHACL 1.2 via `jena-shacl`) — both are specific applications of this toolchain mandate.
- Realises the toolchain half of: ODR-0025 §R5 (full RDF 1.2 on a Jena toolchain; no `rdflib`).
- Migrates: ADR-0014 (BASPI5 round-trip — pyshacl → Jena, gated on the ADR-0036 parity check).
- Cross-project rationale: `docs/hm-handoff-rdf-1.2-triple-term-jena-fix.md` (the `rdflib`-driven RDF-1.2 downgrade opda avoids).
- Why Jena: it is the reference JVM implementation tracking RDF 1.2, SHACL 1.2 (+ SHACL-AF) and SPARQL 1.2 — opda pins **6.1.0**; pyshacl tracks SHACL 1.0/2017, and `rdflib` 7.x cannot parse RDF 1.2 triple terms.
