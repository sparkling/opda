---
status: proposed
date: 2026-05-20
kind: architecture
tags: [vocabulary, catalogue]
scope: []
supersedes: [ODR-0014]
depends-on: [ODR-0001]
implements: []
---

# Ontology Languages and Vocabularies Adopted

## Context

OPDA's linked-data work needs a declared, bounded set of ontology languages and vocabularies. Without a published list, modellers will reach for whatever they know — producing redundant terms, unprincipled mixing of W3C Recommendations with community drafts, and an unreviewable surface area.

The H&M semantic-modelling programme has spent two years pressure-testing this question across roughly 90 ODRs and 250 Council sessions. A survey of every `@prefix` declaration in its `src/` ontology (~90 `.ttl` files) identifies 18 external standard vocabularies in active use. Every vocabulary admitted here is a W3C Recommendation, a maintained community standard, or a research-community ontology with broad linked-data uptake; the novelty is the OPDA-specific scoping — which vocabularies we adopt, with what conditions, in which layer.

The question this ODR answers: what closed, tiered catalogue should bound OPDA's vocabulary surface, and on what adoption discipline?

## Decision

Adopt a three-tier survey-grounded catalogue — **Core / Conditional / Defer** — porting the H&M `src/` survey and rescoping for OPDA. It is the only option that bounds the vocabulary surface to a reviewable, authority-grounded set while documenting non-adoption as durably as adoption.

## Rules

### Core — adopt unconditionally

The RDF stack and the small set of vocabularies every OPDA linked-data file is expected to use.

| Vocabulary | Prefix | Canonical URI | Role |
|---|---|---|---|
| **RDF 1.2** | `rdf` | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` | Foundation — triples, types, lists; RDF 1.2 adds triple terms for statement-level annotation (native to the provenance/annotation layers, superseding reification) |
| **RDF Schema** | `rdfs` | `http://www.w3.org/2000/01/rdf-schema#` | Basic class/property hierarchy, labels, comments |
| **OWL 2** | `owl` | `http://www.w3.org/2002/07/owl#` | Formal class/property semantics, equivalence, restrictions |
| **XML Schema Datatypes** | `xsd` | `http://www.w3.org/2001/XMLSchema#` | Literal datatypes (string, date, integer, etc.) |
| **SHACL 1.2** | `sh` | `http://www.w3.org/ns/shacl#` | Validation shapes — the contract between the ontology and consuming applications; SHACL 1.2 (W3C Data Shapes WG) for expanded constraint expressivity |
| **SKOS** | `skos` | `http://www.w3.org/2004/02/skos/core#` | Concept schemes, taxonomies, controlled vocabularies (e.g. property-type lists, classification facets) |
| **Dublin Core Terms** | `dct` | `http://purl.org/dc/terms/` | Administrative metadata (`title`, `creator`, `issued`, `modified`, `identifier`). The hidden lingua franca of every other vocabulary listed below — adoption merely formalises what is already implicit |
| **VANN** | `vann` | `http://purl.org/vocab/vann/` | Vocabulary annotation — `vann:preferredNamespacePrefix`, `vann:preferredNamespaceUri` on `owl:Ontology` headers |

### Conditional — adopt where the use case is present

Admitted only in the layers/files where the corresponding modelling concern arises. Outside those layers they are not used (SHACL gates will be added to enforce this — see H&M ADR-0147 R12 for the pattern).

| Vocabulary | Prefix | Canonical URI | Adopt for | Notes |
|---|---|---|---|---|
| **DASH** | `dash` | `http://datashapes.org/dash#` | UI/display hints on SHACL shapes (`dash:propertyRole`, `dash:viewer`, `dash:labelProperty`) | TopQuadrant-maintained. Required only on shapes that drive form generation |
| **PROV-O** | `prov` | `http://www.w3.org/ns/prov#` | Provenance — who, when, by what process a triple or dataset was produced | Pattern: canonical URIs + local SHACL, no `owl:imports` |
| **DCAT 3** | `dcat` | `http://www.w3.org/ns/dcat#` | Dataset catalogue records (OPDA-published datasets, PDTF reference data) | W3C Rec. Built on `dct:*`, so depends on the Dublin Core core adoption above |
| **OWL-Time** | `time` | `http://www.w3.org/2006/time#` | Temporal modelling — Instant, Interval, durations. **Actively-adopted** for proprietorship / lease-term / claim-validity intervals per Session 001 Q2 (≈6-3 over "await a concrete consumer" dissent). | W3C Rec 2020. PROV-O's `prov:atTime` (instant) without OWL-Time intervals is incoherent for the interval-bearing entities (Guizzardi/Gandon). |
| **DPV** (+ `dpv-gdpr`, `dpv-pd`, `dpv-legal`) | `dpv`, `dpv-gdpr`, `dpv-pd`, `dpv-legal` | `https://w3id.org/dpv#`, `https://w3id.org/dpv/legal/eu/gdpr#`, `https://w3id.org/dpv/pd#`, `https://w3id.org/dpv/legal#` | Data-privacy classification — personal-data flags, processing purposes, lawful basis, regulatory tagging. **Phase-1 annotation adopted** per Session 001 Q2; **lawful-basis / consent / purpose class vocabulary** is a recorded Pandit dissent — TBox-expressible debate routed to [ODR-0012](./ODR-0012-data-governance-layer.md). | Directly relevant to property data carrying buyer/seller/agent personal data. |
| **ODRL** | `odrl` | `http://www.w3.org/ns/odrl/2/` | Machine-readable consent and data-licensing policies. **Vocabulary admitted; policy-authoring deferred to Phase 2** per Session 001 Q2 (Guarino: ODRL `Policy`/`Permission` bite only on instances — TBox alone asserts nothing). | Restrict to layers concerned with access-control / data-rights expression; **not** for governance-process modelling. Trigger for policy authoring owned by [ODR-0012](./ODR-0012-data-governance-layer.md). |
| **SSSOM** | `sssom` | `https://w3id.org/sssom/` | Mapping metadata (mapping justification, confidence, mapping author) on cross-vocabulary mappings. **Deferred for internal overlay refs** per Session 001 Q2 (use `dct:source` to minted form-question IRIs instead; SSSOM earns its place mapping to *external* vocabularies — FIBO, INSPIRE, HMLR). **Cagle dissent recorded (≈5-4).** | Pair with `semapv:` for the process side when external mappings activate. |
| **SEMAPV** | `semapv` | `https://w3id.org/semapv/vocab/` | Mapping-process vocabulary (manual, lexical-match, logical-reasoning, etc.). Deferred alongside SSSOM. | Used inside SSSOM mapping records once SSSOM activates. |

### Defer — reviewed and not adopted (yet)

Listed explicitly so future modellers know the question has been asked and the answer was "not now."

| Vocabulary | Prefix | Why deferred | Revisit when |
|---|---|---|---|
| **schema.org** | `schema` | Overlaps SKOS, Dublin Core, DCAT in confusing ways; no benefit inside the ontology core. H&M Council Session 371 deferred adoption (1-3-5 vote) | A concrete open-web publication use case materialises (e.g. JSON-LD embedding for SEO of OPDA documents). Even then, scope to publication outputs, not the ontology source |
| **DCAT-AP / DCAT-AP EU** | `dcatap` | Adds EU-government catalogue profile constraints that may not match OPDA's UK-property-data scope. H&M S371 deferred (3-3-3 deadlock) | OPDA actually needs to publish to data.europa.eu or a UK government open-data portal that requires it |
| **FIBO** | `fibo` | Financial Industry Business Ontology — large surface area; not used in H&M `src/`. Property-transaction finance touches FIBO but PDTF v2 does not depend on it | A property-transaction-finance modelling task arises that would otherwise require reinventing FIBO concepts |
| **SOSA/SSN, QUDT, GeoSPARQL** | (various) | Sensor, units-of-measurement, and geospatial vocabularies. Not in H&M `src/`. Plausibly relevant to OPDA (energy-performance sensors, EPC ratings with units, property-location geometry) but no current consumer | A pipeline producing the corresponding data starts (e.g. EPC/MEES ingestion, plot-boundary linked data) |
| **FOAF** | `foaf` | Person/Agent modelling — superseded by `prov:Agent` + Dublin Core for our purposes. Not in H&M `src/`. Session 001 Q2 briefly reopened this; **ruled out** (programme decision — see References) | Not adopted (decided). The Kind-layer choice — W3C Org ontology vs bespoke `opda:`, `prov:Agent` for provenance only — is settled in [ODR-0006](./ODR-0006-agents-and-roles.md) |
| **BBO (BPMN-Based Ontology)** | `bbo` | Process modelling — no current property-transaction workflow-publishing target. **Out for this programme** per Session 001 Q2 (unanimous). | A concrete workflow-publishing use case materialises. |
| **ArchiMate 3.2 (Motivation + Strategy + Application layers)** | `archimate` | Capability/intent and service-architecture modelling — no current consumer. **Out for this programme** per Session 001 Q2 (unanimous). | A concrete capability or service-catalogue use case materialises. |
| **W3C Verifiable Credentials Data Model 2.0** | `cred` | Verifiable Credentials — `cred:VerifiableCredential`, `cred:VerifiablePresentation`, related issuer/holder/verifier roles. Catalogue-admitted by Scope-Check 1 (Q7c, 2026-05-26); activation deferred to [ODR-0016](./ODR-0016-w3c-vc-did-compatibility.md). | Session-009 Q8 surfaces real VC-side decisions, OR session-012 Phase-2 consent receipts land, OR a real wallet/DID consumer enters scope. |
| **W3C DID Core 1.0** | `did` | Decentralised Identifiers — `did:web`, `did:key`, `did:jwk` resolution; DID Documents; signature suites. Catalogue-admitted by Scope-Check 1 (Q7c); activation deferred to [ODR-0016](./ODR-0016-w3c-vc-did-compatibility.md). | Same as `cred:` — VC ecosystem and DID resolution arrive together. |

### Change log

This catalogue is governed in place: amendments to tiering or rationale are recorded as rows here, attributed to the Council session that authored them. The amendment-ODR pattern (formerly ODR-0014) is **retired** by Scope-Check 1 (2026-05-26, Q4 vote 7-1-1) on FIBO / DCMI / W3C-WD-discipline grounds; provenance is preserved here, not in a parallel record. Hendler's dissent on the retirement ("every governance act stays permanently") is recorded in the follow-up plan's risks (`docs/ontology/plan/council-followup-sessions.md` §9), not silenced.

| Date | Source | Row(s) affected | What changed |
|---|---|---|---|
| 2026-05-20 | [Council Session 001](./council/session-001-pdtf-schema-to-ontology.md) Q2 | OWL-Time | Promoted to actively-adopted Conditional (was Conditional-deferred; PDTF brief had excluded it). Reason: PROV-O instants without OWL-Time intervals is incoherent for proprietorship / lease / claim-validity intervals (Guizzardi/Gandon). Vote ≈6-3 over "await a concrete consumer" dissent (Allemang/Davis). |
| 2026-05-20 | Session 001 Q2 | DCAT 3 | Confirmed Conditional (Davis wanted Core; Baker held Conditional). Reason: ontology-as-published-dataset + reference data; near-zero marginal cost over `dct:`. Not Core — no catalogue-publishing task this round. |
| 2026-05-20 | Session 001 Q2 | SSSOM / SEMAPV | Deferred for internal overlay refs; use `dct:source` to form-question IRIs in the interim. SSSOM earns its place mapping to *external* vocabularies (FIBO, INSPIRE, HMLR RDF). **Cagle dissent recorded (≈5-4).** Re-open trigger (per Session 014's owner role): external mapping work activates SSSOM. |
| 2026-05-20 | Session 001 Q2 | ODRL | Vocabulary adopted; policy-authoring deferred to Phase 2. Reason: ODRL `Policy`/`Permission` bite only on instances — TBox alone asserts nothing (Guarino). Policy-activation trigger owned by [ODR-0012](./ODR-0012-data-governance-layer.md) Q4. |
| 2026-05-20 | Session 001 Q2 | DPV family | Phase-1 annotation adopted. Pandit's broader-TBox dissent (lawful-basis / consent / purpose class vocabulary) recorded as live, routed to [ODR-0012](./ODR-0012-data-governance-layer.md). |
| 2026-05-20 | Session 001 Q2 | Dublin Core | Rationale reclassified: "commons substrate" (was "administrative metadata"). No tier change. DCAT, PROV-O, SKOS, VANN all already depend transitively on `dct:` (Baker); adopting it formalises the implicit. |
| 2026-05-20 | Session 001 Q2 | BBO, ArchiMate | Moved Conditional → Defer (out for this programme). Unanimous — no process- or capability-modelling task. |
| 2026-05-20 | Session 001 Q2 | OBO RO | Question raised (Kendall: transitive part-of; Davis: biology-flavoured, use `dct:isPartOf`). No consensus; left open; routed to [ODR-0005](./ODR-0005-property-land-identity-crux.md). |
| 2026-05-20 | Session 001 Q2 | FOAF | Briefly reopened; **ruled out programme-wide**. Defer-row negative on FOAF stands. Kind-layer choice (W3C Org vs bespoke `opda:`) routed to [ODR-0006](./ODR-0006-agents-and-roles.md); `prov:Agent` for provenance role only. |
| 2026-05-26 | [Scope-Check 1 — Programme cut](./council/scope-check-1-programme.md) Q7c | `cred:`, `did:` | Admitted to Defer tier (W3C VCDM 2.0; DID Core 1.0). Activation deferred to [ODR-0016](./ODR-0016-w3c-vc-did-compatibility.md). Vote 8-1 (Davis + Pandit spawn-now; majority defer-with-named-spawn; Cagle defer-without-spawn). |
| 2026-05-26 | Scope-Check 1 Q4 | Catalogue governance pattern | ODR-0014 (Vocabulary Catalogue Amendments) retired. Amendments now live here as `## Change log` rows; no parallel amendment-record. Vote 7-1-1 (Hendler dissent on permanence preserved in plan §9). |

### Adoption pattern (applies to every Conditional entry)

1. **Canonical URI** — use the vocabulary's published namespace, not a local re-mint.
2. **Local SHACL enforcement** — write SHACL shapes in the relevant OPDA layer/file that constrain usage (cardinality, datatype, severity).
3. **No `owl:imports`** — reference by URI only; let external consumers fetch the upstream ontology themselves.
4. **`vann:` header on every `owl:Ontology`** — declare the preferred prefix so dereferencers can render snippets consistently.
5. **Recorded provenance** — when an external vocabulary appears in a new layer for the first time, the introducing commit or ODR cites the use case.

### Enforcement

- Each row above declares canonical URI, role, and constraint; modellers MUST reference the canonical URI and MUST NOT re-mint terms in `opda:` that duplicate adopted-tier semantics.
- Conditional-tier gating is honour-system until SHACL gates are written; the follow-up is tracked in `docs/governance/deferred-work`.
- The Defer tier is reviewable on a schedule (annual, or whenever a triggering use case arises). Promotion/demotion is recorded in `### Change log` above, attributed to the Council session that authored the change.
- The amendment-ODR pattern is retired: changes to this catalogue land as new rows in `### Change log`, not in a parallel record.

## Alternatives

- **"Use whatever vocabulary fits the modeller's preference"** — produces redundant terms and unreviewable surface area within a year.
- **"Adopt every vocabulary in active linked-data community use"** — surface area becomes a multi-person-year mapping problem with no business return.
- **"Reinvent the necessary terms under an `opda:` namespace"** — discards two decades of W3C linked-data work and isolates OPDA outputs from external consumers.

## Consequences

- Reference the published catalogue when introducing any external vocabulary; do not debate the choice per file.
- Use canonical, dereferenceable URIs throughout — external consumers depend on them resolving.
- When a recurring "why don't we use schema.org / FOAF?" question is raised, point at the Defer column; do not relitigate without a triggering use case.
- Write SHACL gates for Conditional-tier scope as soon as the H&M ADR-0147 R12 pattern is portable; until then, conditional-tier compliance is honour-system and reviewers MUST check it manually.
- Pin versions explicitly in ODRs only where currently declared (RDF 1.2, SHACL 1.2). When DPV / DCAT 3 / DASH undergo a *breaking* version change, raise a follow-up ODR.
- Keep the catalogue alive: when a vocabulary good for OPDA but absent from H&M is proposed, do not reject on "no precedent" alone — amend the catalogue.
- Treat ArchiMate and BBO as candidates for demotion to Defer at the first Council review if no process- or capability-modelling use case has materialised.

## References

- **Catalogue change log** lives in `## Rules` above. Sessions amending the catalogue: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q2 (multi-row amendment); [Scope-Check 1](./council/scope-check-1-programme.md) Q4 (governance-pattern: retire ODR-0014 — fold here) and Q7c (admit `cred:`, `did:`).
- **Superseded artefact**: [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md) — formerly carried the Session 001 amendments as a partial-supersession record; retired 2026-05-26 per Scope-Check 1 Q4 (vote 7-1-1; Hendler dissent preserved). ODR-0014 retained as historical anchor for Council Session 001 provenance; its content is folded into `### Change log` above.
- **FOAF — ruled out.** Session 001 Q2 briefly reopened the Defer-tier FOAF entry (because `prov:Agent` is deliberately thin — no person/organisation distinction, no structured name), but FOAF has since been ruled out. The Kind layer uses the W3C Org ontology or a bespoke `opda:` model, with `prov:Agent` for the provenance role only. Settled in [ODR-0006](./ODR-0006-agents-and-roles.md); recorded in the change log above.
- **W3C VC / DID Compatibility Layer**: `cred:` and `did:` admitted to Defer per Scope-Check 1 Q7c; activation deferred to [ODR-0016](./ODR-0016-w3c-vc-did-compatibility.md).
- **Provenance**: catalogue ported from a survey of the H&M `src/` ontology `@prefix` declarations. The adoption pattern (canonical URIs + local SHACL + no `owl:imports`) is inherited from H&M ONT-0071c/i/j and ONT-0086.
- **Related**: Council methodology [ODR-0001](./ODR-0001-linked-data-council-methodology.md); programme anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md). Relates contextually to ADR-0001 (DCAM/DMBOK adoption); not a typed dependency.
