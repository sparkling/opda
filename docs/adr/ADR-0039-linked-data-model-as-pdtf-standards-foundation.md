---
status: accepted
date: 2026-06-03
tags: [strategy, direction, linked-data, ontology, pdtf, model-driven, governance, rbac, ai, mcp, standards-development]
supersedes: []
depends-on: [ODR-0003, ADR-0006, ADR-0007, ADR-0014]
implements: []
---

# Linked-data model as the foundation and direction of PDTF standards development

## Context and Problem Statement

The Property Data Trust Framework (PDTF) data standard is defined as JSON Schema — a base
`pdtf-transaction.json` (~37k lines, 1,557 fields) plus a dozen statutory form overlays
(BASPI, TA6/7/10, NTS, LPE1, CON29, LLC1, FME1) and a `verifiedClaims` envelope. JSON
Schema is excellent at describing the *shape* of a document, but as the backbone of a
multi-party industry **standard** it has structural limits: it cannot express which things
have stable real-world **identity**, the **semantics** that let independent systems agree
on meaning, the **governance/privacy** classification of fields, **validation beyond
structure**, **machine reasoning**, or **interoperable, dereferenceable identifiers**.
Every consumer re-encodes meaning by hand, and the ambiguity that results (e.g. a UPRN
appearing across several fields with no join; "capacity" carried as free text) surfaces as
integration cost, transaction fall-throughs, and fraud risk.

Over the last programme (ODR-0003 and ADRs 0006–0038) OPDA has taken the PDTF JSON schemas
and, using an AI-assisted "Linked Data Council" methodology, constructed a formal
**linked-data / OWL ontology** that re-expresses the model — its data, its governance/
privacy layer, and its actors/roles/authority (RBAC-style) layer — across a broad set of
W3C and community semantic-web standards (RDF/OWL, SHACL, SKOS, PROV-O, DPV, gUFO/UFO, …).
The model is validated by SHACL, generated deterministically under a byte-identity CI gate,
reasoned over with OWL-RL in Apache Jena, round-tripped against the BASPI5 form, and
published at `https://opda.org.uk/pdtf/`.

This ADR settles **what role the linked-data model should play going forward** — a
curiosity/reference artefact, or the **foundation and driver of the standard's technical
direction** — and **records the directing authority's requirements** for that direction, as
the basis for the proposal to the OPDA working group (quarterly workshop, 2026-06-05;
Henrik's slot: "Review of data schema feedback and next steps").

## Decision Drivers

The requirements below were stated by the directing authority; they are the acceptance
criteria for the direction.

* **R1 — Formal semantic foundation.** Re-express the PDTF standard as a linked-data model
  that captures identity, real-world semantics, governance, and the actors/roles/authority
  (RBAC) layer, using a *multitude of established linked-data standards* rather than a
  bespoke format.
* **R2 — The model drives the standard.** Use the linked-data model to drive **governance
  and standards development, releases, modules, and extensibility** — the standard is
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
* **R7 — Trust & reproducibility.** The standard must be rigorous and reproducible —
  recorded decisions, deterministic generation, byte-identity, and round-trip fidelity to
  the existing PDTF data.
* **R8 — Continuity, not a fork.** Remain compatible with the existing PDTF JSON schema
  (the model round-trips to/from it); this is an evolution of the standard, not a competing
  fork.
* **R9 — Strategic alignment.** Support OPDA's published direction — "from PDFs to APIs",
  consent-based APIs, Digital Property Packs, and "fixing the data foundations".

## Considered Options

* **A — Status quo: JSON-Schema-only.** Continue evolving PDTF purely as hand-authored JSON
  Schema + form overlays; treat the ontology as an experiment.
* **B — Ontology as reference/documentation only.** Keep the linked-data model as a semantic
  *view* published alongside the JSON schema, but do not let it drive generation, governance
  or tooling.
* **C — Linked-data model as the foundation and single source of truth (this ADR).** Adopt
  the linked-data model as the canonical foundation; drive governance, releases, modularity
  and extensibility through it; generate downstream artefacts (JSON Schema, APIs, code, DDL,
  forms, UI, docs) from it; and expose it as an AI substrate (APIs, locally-installable MCP
  servers, embeddings/vectors). Preserve continuity with PDTF JSON via round-trip.

## Decision Outcome

Chosen option: **C — the linked-data model as the foundation and direction of PDTF
standards development**, because it is the only option that satisfies R1–R9: it gives the
standard a formal semantic foundation (R1), makes the model the governing source for the
standard's evolution (R2, R3), enables single-source-of-truth generation of every
downstream artefact (R4), and turns the standard into an actionable substrate for APIs, AI
and MCP tooling (R5, R6) — while preserving continuity with the existing PDTF JSON schema
through round-trip fidelity (R7, R8) and advancing OPDA's published "data foundations /
PDFs-to-APIs" strategy (R9). Option A leaves the structural limits unaddressed; Option B
captures the semantics but forgoes every downstream and governance benefit, so the model
would rot as a side artefact.

Scope committed by this decision:

* The canonical model is the OPDA linked-data ontology at `https://opda.org.uk/pdtf/`
  (RDF/OWL + SHACL + SKOS + PROV-O + DPV + UFO/gUFO …), modularised by ontological concern
  and validated/served via Apache Jena/Fuseki.
* **SHACL profiles** are the conformance contract and the pivot for downstream generation;
  statutory forms are SHACL **overlays** over the base, not forks (the extensibility
  mechanism).
* Standards development is governed through the decision-record process (ODRs for
  modelling, ADRs for engineering) feeding the OPDA working-group / modelling
  sub-committee / AGM ratification path.
* Downstream generation (JSON Schema, OpenAPI/APIs, code, DB/DDL, forms, UI, docs) and the
  AI-substrate delivery (APIs, locally-installable MCP servers, embeddings/vectors) are
  adopted as the **roadmap direction**, delivered in phases — several already proven in
  seed form, others planned (see Confirmation).

This is a **proposal to the working group**; the directing authority owns the technical
direction, and ratification of the standard's evolution follows the OPDA governance handoff.

### Consequences

* Good, because the standard gains a formal, machine-readable, dereferenceable foundation
  that expresses identity, semantics, governance and roles — closing ambiguities JSON
  Schema cannot (e.g. the property/estate/title identity split; asserted vs evidenced
  authority).
* Good, because a single governed model as source of truth eliminates drift across forms,
  APIs, databases and docs, and makes conformance machine-checkable via SHACL.
* Good, because the model is an actionable substrate for the "PDFs-to-APIs" and
  consent-based-API direction, and for the AI tooling (grounding, provenance, validation)
  the industry is adopting.
* Good, because rigour is demonstrable: recorded decisions with an audit trail,
  deterministic byte-identity generation, and BASPI5 round-trip fidelity — the standard is
  reproducible, not opinion.
* Good, because continuity is preserved: the model round-trips to the existing PDTF JSON, so
  adoption is additive, not a disruptive re-standardisation.
* Neutral, because the JSON Schema remains the consumer-facing artefact for now; the model
  sits behind it and is *generated to* it until downstream generation matures.
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

This is a **proposed** direction; the requirements R1–R9 are the acceptance criteria.
Implementation status today (legend: ✅ built · 🟡 partial · 🔵 planned):

* ✅ Linked-data ontology built and published at `https://opda.org.uk/pdtf/` (41 classes;
  226 datatype + 30 object properties; 47 SKOS schemes; 90 SHACL shapes; 31 form profiles)
  — ADRs 0006–0037 (R1).
* ✅ Deterministic generation under a byte-identity CI gate; SHACL 1.2 validation + OWL-RL
  inference via Apache Jena; 8 CI gates — ADR-0007/0008/0035/0036/0037 (R7).
* ✅ BASPI5 round-trip harness green — JSON → ontology → validated RDF → JSON with full
  provenance — ADR-0014 — the seed of model-driven JSON generation (R4) and the proof of
  continuity (R8).
* ✅ Markdown model documentation generated to the website "modelling" section (ADR-0015–
  0024) and ✅ SPARQL-as-REST entity pages via grlc (ADR-0021) (R4/R6, partial).
* 🟡 DPV governance/privacy layer + SHACL sensitivity gate (R1/R2); 🟡 DASH-driven form
  hints (R4); 🟡 role + evidenced-authority model (R1, RBAC substrate).
* 🔵 Full downstream generation (OpenAPI, code, DB/DDL, forms, UI), ODRL permission/consent
  policies (R2/R5), and the end-user MCP servers + embeddings/vectors (R6) — phased roadmap.

The direction is confirmed when: (a) the working group endorses it in principle at the
quarterly review; (b) a phased roadmap for R4–R6 is agreed; and (c) each subsequent phase
lands behind the existing CI gates (byte-identity, round-trip, profile-contract) without
regressing PDTF JSON compatibility.

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
* **Meeting context:** OPDA quarterly workshop, 2026-06-05 — v3.6 of the JSON schema is being
  approved at the same meeting; this ADR frames Henrik's "next steps".
* **Index note:** `docs/adr/README.md`'s index table is only maintained through ADR-0005, so
  this ADR was filed without a misleading partial table edit; the full index can be
  regenerated separately.

## Amendments

- **2026-06-16 — RATIFIED (operator).** Status `proposed` → `accepted`. The operator ratifies the strategic direction — the linked-data model as the foundation and direction of PDTF standards development; the substrate-now (RBAC) / adopted-but-deferred (ODRL policies) dispositions in §Decision stand.
