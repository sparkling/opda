---
status: accepted
date: 2026-06-03
updated: 2026-08-22
tags: [strategy, direction, linked-data, ontology, pdtf-schema, spdtf, model-driven, governance, rbac, ai, mcp, standards-development]
supersedes: []
depends-on: [ODR-0003, ADR-0006, ADR-0007, ADR-0014]
implements: []
---

# Linked-data model as the foundation and direction of SPDTF development

## Context and Problem Statement

The existing **PDTF schema** is a JSON Schema corpus — a base
`pdtf-transaction.json` (~37k lines, 1,557 fields) plus statutory form overlays
(BASPI, TA6/7/10, NTS, LPE1, CON29, LLC1, FME1), a data dictionary, a business
glossary and a `verifiedClaims` envelope. It is the existing Digital Property Pack
technical input. It was not created collaboratively across all parties and was not an
OPDA-endorsed scheme.

JSON Schema is excellent at describing the *shape* of a document, but it cannot by
itself express which things have stable real-world **identity**, the **semantics** that
let independent systems agree on meaning, the **governance/privacy** classification of
fields, **validation beyond structure**, **machine reasoning**, or **interoperable,
dereferenceable identifiers**. Every consumer otherwise re-encodes meaning by hand, and
the ambiguity that results (for example a UPRN appearing across several fields with no
join, or "capacity" carried as free text) surfaces as integration cost, transaction
fall-throughs and fraud risk.

Over the earlier linked-data programme (ODR-0003 and ADRs 0006–0038), OPDA took the
PDTF schema corpus and, using an AI-assisted "Linked Data Council" methodology,
constructed a formal **schema-derived linked-data / OWL ontology**. It re-expresses the
schema's data, governance/privacy layer and actors/roles/authority layer using W3C and
community semantic-web standards (RDF/OWL, SHACL, SKOS, PROV-O, DPV, gUFO/UFO, …).
The artefact is SHACL-validated, deterministically generated, round-tripped against
BASPI5 and published at `https://opda.org.uk/pdtf/`. That publication proves a technical
derivation and compatibility path; it does not turn the schema or derived ontology into
an endorsed predecessor scheme.

This ADR settles the role of linked data in **SPDTF**, the first scheme draft being
written collaboratively across industry and stakeholders. It records the technical
direction for moving from the existing schema evidence to a governed semantic scheme,
as the basis for working-group proposals and human decisions.

## Decision Drivers

The requirements below were stated by the directing authority; they are the acceptance
criteria for the direction.

* **R1 — Formal semantic foundation.** Develop SPDTF as a linked-data model
  that captures identity, real-world semantics, governance, and the actors/roles/authority
  (RBAC) layer, using a *multitude of established linked-data standards* rather than a
  bespoke format.
* **R2 — The model drives the scheme.** Use the linked-data model to drive **governance
  and standards development, releases, modules, and extensibility** — the scheme is
  governed and evolved *through* the model, with an audit trail.
* **R3 — SHACL as the data-shape contract.** Define data shapes in **SHACL** as the
  canonical, machine-checkable conformance contract.
* **R4 — Model-driven generation (single source of truth).** Generate downstream artefacts
  **from** the model: **JSON Schemas, APIs, code, database schemas and DDLs, interfaces,
  forms, UI/UX, and markdown documentation** — all as artefacts of the linked data, so one
  change propagates without drift. (Markdown model documentation already exists — the
  website "modelling" section.)
* **R5 — AI substrate.** Treat the linked data as high-value context for AI: a governed
  model of *all aspects of data and governance* that makes the AI and the AI harness more
  intelligent and capable.
* **R6 — End-user delivery.** Provide **APIs and MCP servers** for end users to interact
  with, **installable locally**, together with **embeddings and vectors** for semantic
  retrieval.
* **R7 — Trust & reproducibility.** The scheme must be rigorous and reproducible —
  recorded decisions, deterministic generation, byte-identity, and round-trip fidelity to
  data represented by the existing PDTF schema.
* **R8 — Schema-to-scheme continuity.** Treat the PDTF schema and schema-derived ontology
  as attributed evidence, coverage, compatibility and migration inputs. They do not
  determine SPDTF domain meaning and do not establish a predecessor/successor version chain.
* **R9 — Strategic alignment.** Support OPDA's published direction — "from PDFs to APIs",
  consent-based APIs, Digital Property Packs, and "fixing the data foundations".

## Considered Options

* **A — Remain schema-only.** Continue evolving the PDTF schema and form overlays;
  treat semantic modelling as an experiment rather than develop a collaborative scheme.
* **B — Ontology as reference/documentation only.** Keep the schema-derived ontology as a
  semantic *view* beside the PDTF schema, but do not use governed linked data to drive
  SPDTF generation, governance or tooling.
* **C — Linked-data model as the SPDTF foundation and semantic source of truth (this ADR).**
  Develop SPDTF through a governed linked-data model; drive releases, modularity and
  extensibility through it; generate downstream artefacts (JSON Schema, APIs, code, DDL,
  forms, UI, docs) from it; and expose it as an AI substrate (APIs, locally installable
  MCP servers, embeddings/vectors). Preserve attributable compatibility with the PDTF
  schema without letting inherited schema topology decide domain meaning.

## Decision Outcome

Chosen option: **C — the linked-data model as the foundation and direction of SPDTF
development**, because it is the only option that satisfies R1–R9: it gives the scheme a
formal semantic foundation (R1), makes the governed model the source for SPDTF evolution
(R2, R3), enables single-source-of-truth generation of downstream artefacts (R4), and
turns the scheme into an actionable substrate for APIs, AI and MCP tooling (R5, R6).
It also preserves attributable coverage, compatibility and migration evidence from the
PDTF schema (R7, R8) without treating that schema or its derived ontology as semantic
authority. Option A leaves the structural limits unaddressed; Option B captures semantics
but forgoes the downstream and governance benefits, so the model would rot as a side
artefact.

Scope committed by this decision:

* The ontology at `https://opda.org.uk/pdtf/` remains the canonical **schema-derived
  technical baseline** (RDF/OWL + SHACL + SKOS + PROV-O + DPV + UFO/gUFO …), modularised
  by ontological concern and validated/served via Apache Jena/Fuseki. Its stable
  `/pdtf/**` identifiers remain unchanged. It is evidence and an implementation input,
  not the pre-approved semantic starting point for SPDTF.
* Governed SPDTF candidates are developed from participant evidence and explicit human
  decisions under ADR-0063, ADR-0066 and ADR-0067. **SHACL profiles** are the intended
  conformance contract and pivot for downstream generation;
  statutory forms are SHACL **overlays** over the base, not forks (the extensibility
  mechanism).
* Standards development is governed through the decision-record process (ODRs for
  modelling, ADRs for engineering) feeding the OPDA working-group / modelling
  sub-committee / AGM ratification path.
* Downstream generation (JSON Schema, OpenAPI/APIs, code, DB/DDL, forms, UI, docs) and the
  AI-substrate delivery (APIs, locally-installable MCP servers, embeddings/vectors) are
  adopted as the **roadmap direction**, delivered in phases — several already proven in
  seed form, others planned (see Confirmation).

The technical direction is accepted, but every SPDTF semantic candidate remains subject
to working-group review and OPDA governance. A directing authority may sponsor the
technical direction; that act cannot retrospectively endorse the PDTF schema as a scheme
or substitute for collaborative agreement and recorded ratification.

### Consequences

* Good, because SPDTF gains a formal, machine-readable, dereferenceable foundation
  that expresses identity, semantics, governance and roles — closing ambiguities JSON
  Schema cannot (e.g. the property/estate/title identity split; asserted vs evidenced
  authority).
* Good, because a single governed model as source of truth eliminates drift across forms,
  APIs, databases and docs, and makes conformance machine-checkable via SHACL.
* Good, because the model is an actionable substrate for the "PDFs-to-APIs" and
  consent-based-API direction, and for the AI tooling (grounding, provenance, validation)
  the industry is adopting.
* Good, because rigour is demonstrable: recorded decisions with an audit trail,
  deterministic byte-identity generation, and BASPI5 round-trip fidelity — the technical
  output is reproducible, not opinion.
* Good, because continuity is explicit: the PDTF schema and schema-derived ontology remain
  traceable compatibility and migration inputs while SPDTF meanings are decided collaboratively.
* Neutral, because the PDTF schema remains an existing consumer-facing technical artefact;
  future SPDTF projections are generated only from governed semantic decisions.
* Bad, because most downstream generation (APIs, code, DB/DDL, forms, UI) and the end-user
  MCP/embedding products are **not yet built** — they are a phased roadmap (🔵), and this
  ADR must not be read as claiming them as done.
* Bad, because the **authorisation/RBAC** layer today is a *role + capacity + evidenced-
  authority* model (UFO roles + SKOS + SHACL); machine-readable **permission/consent
  policies (ODRL)** are adopted-but-deferred — "RBAC" must be stated as substrate-now,
  policies-later.
* Neutral, because **OWL reasoning is shallow today** (only RDFS subclass entailment
  materialises) and richer inference depends on future axiomatisation.
* Neutral, because the approach needs linked-data/semantic-web skills and toolchain (Jena,
  SHACL, SPARQL) less common than JSON tooling across member firms — mitigated precisely by
  generating familiar artefacts (JSON Schema, OpenAPI, SDKs) from the model (R4).

### Confirmation

This is an **accepted technical direction**; the requirements R1–R9 are its acceptance
criteria. It does not make any individual SPDTF model adopted, and it does not change the
authority of the PDTF schema or schema-derived ontology.
Implementation status today (legend: ✅ built · 🟡 partial · 🔵 planned):

* ✅ Schema-derived linked-data ontology built and published at `https://opda.org.uk/pdtf/` (41 classes;
  226 datatype + 30 object properties; 47 SKOS schemes; 90 SHACL shapes; 31 form profiles)
  — ADRs 0006–0037 (R1).
* ✅ Deterministic generation under a byte-identity CI gate; SHACL 1.2 validation + OWL-RL
  inference via Apache Jena; 8 CI gates — ADR-0007/0008/0035/0036/0037 (R7).
* ✅ BASPI5 round-trip harness green — JSON → ontology → validated RDF → JSON with full
  provenance — ADR-0014 — the seed of model-driven JSON generation (R4) and the proof of
  PDTF schema traceability (R8).
* ✅ Markdown model documentation generated to the website "modelling" section (ADR-0015–
  0024) and ✅ SPARQL-as-REST entity pages via grlc (ADR-0021) (R4/R6, partial).
* 🟡 DPV governance/privacy layer + SHACL sensitivity gate (R1/R2); 🟡 DASH-driven form
  hints (R4); 🟡 role + evidenced-authority model (R1, RBAC substrate).
* 🔵 Full downstream generation (OpenAPI, code, DB/DDL, forms, UI), ODRL permission/consent
  policies (R2/R5), and the end-user MCP servers + embeddings/vectors (R6) — phased roadmap.

The direction remains confirmed while: (a) SPDTF working groups use it as the semantic
development method; (b) a phased roadmap for R4–R6 is maintained; and (c) each subsequent
phase lands behind the existing CI gates (byte identity, traceability, profile contract)
without silently regressing declared compatibility with the PDTF schema.

A comprehensive supporting knowledgebase is maintained at `docs/linked-data-initiative/`.

## More Information

* **Knowledgebase:** `docs/linked-data-initiative/` — facet documents covering context &
  market, model architecture, the standards used, governance/privacy, authorisation/RBAC,
  the AI-council methodology, the generator/pipeline/CI, namespace/versioning, model-driven
  generation, the AI/MCP ecosystem, and standards-development/extensibility, plus a verified
  fact-sheet.
* **Prior decisions this builds on:** ODR-0003 (ontology programme), ADR-0006 (namespace),
  ADR-0007/0008 (generator), ADR-0014 (BASPI5 round-trip MVP), ADR-0035/0036/0037 (inference
  + Jena/SHACL toolchain); the ODR corpus (`docs/ontology/odr/`, 28 modelling decision
  records) and the AI Linked Data Council methodology (ODR-0001).
* **Honesty caveats (do not over-claim):** authorisation policies (ODRL) and most downstream
  generation are roadmap, not done; OWL reasoning is currently shallow. See the knowledgebase
  "Built vs planned" tables.
* **Meeting context:** OPDA quarterly workshop, 2026-06-05 — v3.6 of the PDTF schema was being
  approved at the same meeting; this ADR frames Henrik's "next steps".
* **Index note:** `docs/adr/README.md`'s index table is only maintained through ADR-0005, so
  this ADR was filed without a misleading partial table edit; the full index can be
  regenerated separately.

## Amendments

- **2026-06-16 — RATIFIED (operator).** Status `proposed` → `accepted`. The operator ratified the strategic linked-data and model-driven direction; the substrate-now (RBAC) / adopted-but-deferred (ODRL policies) dispositions in §Decision stand. This technical ratification did not constitute OPDA endorsement of inherited draft scheme material.
- **2026-08-03 — GREENFIELD SCOPE CORRECTION (ADR-0066).** The linked-data and model-driven direction remains accepted, but ADR-0066 overrides the claim that the current schema-derived ontology is the semantic starting point for future modelling. The new ontology starts from the closed set of 451 required Property Pack source data points and re-decides resources, relationships, attributes, identities, contexts, constraints and vocabularies. Requirement R8 and full-schema round-trip language remain evidence and compatibility goals for the legacy corpus; they are not acceptance gates for the greenfield model. The existing schema-derived ontology remains the technical baseline until a separately governed migration is approved.
- **2026-08-22 — Chair-authority terminology correction.** Maria Harris, OPDA Chair,
  clarified that the inherited version-numbered draft technical scheme was not created
  collaboratively and was not endorsed by OPDA. This living decision now establishes
  the linked-data model as the direction for **SPDTF**, the first collaboratively authored
  scheme draft. The existing body of work is the **PDTF schema** and its separately
  identified **schema-derived ontology**. They remain attributed evidence, compatibility
  and migration inputs; they are not a predecessor scheme or semantic authority for
  SPDTF. The programme transition is schema to scheme. Historical provenance and stable
  `/pdtf/**` identifiers remain unchanged.
