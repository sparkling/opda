---
status: proposed
date: 2026-05-20
kind: pattern
tags: [claims, evidence, provenance, prov-o, assurance]
scope:
  - pdtf-v3:verifiedClaims
  - pdtf-v3:verifiedClaims.verification
  - pdtf-v3:verifiedClaims.verification.evidence
  - pdtf-v3:verifiedClaims.claims
council: session-009
supersedes: []
depends-on: [ODR-0004, ODR-0005, ODR-0006, ODR-0011, ODR-0015]
implements: [ODR-0003, ODR-0017]
---

# Claims, Evidence & Provenance

## Context

PDTF carries its assurance story in a separate envelope: `pdtf-verified-claims.json`, an OIDC4IDA / eIDAS-shaped structure layered over the base transaction. A `verification` block (`trust_framework: "uk_pdtf"`, a single `time`, an `evidence[]` array) sits beside a `claims` object keyed by JSON-pointer paths back into the transaction. Each evidence entry is discriminated by `evidence.type` (`document` / `electronic_record` / `vouch`) with type-specific sub-objects, plus cross-cutting envelope fields: `validation_method`, `verification_method`, cryptographic `digest`, assurance level, and a verifier `txn` reference.

This is the seam where PDTF stops being a property-data form and becomes a *Trust* Framework. It is the interface to the W3C VC / DID / ToIP ecosystem the business glossary already names (Claim, Issuer, Holder, Verifier, Trust Framework), and a `verifiedClaims` structure expressed as opaque JSON cannot participate in that ecosystem. The verifiedClaims structure is *mostly* a provenance graph — but not entirely, and the residue is exactly the part a trust framework cannot afford to lose.

## Decision

Adopt a **PROV-O backbone plus a separate assurance layer**: PROV-O carries the who/what-process/from-what-evidence skeleton (≈80% of the envelope, native), and the residual eIDAS envelope (trust framework, validation-vs-verification, cryptographic digest, assurance level, txn) is modelled *around* PROV in a dedicated layer built from `dct:`, SKOS and narrow local `opda:` terms. Chosen because it is the only option that places the derivation graph on a shared, dereferenceable standard while keeping the regulated assurance judgement in vocabularies that can actually express it.

## Rules

### PROV-O backbone (canonical mapping)

- **Claim → `prov:Entity`.** `opda:Claim rdfs:subClassOf prov:Entity`. Each asserted `claims` entry is an entity; the *verified* claim (claim plus verification bundle) is a derived entity.
- **Verification → `prov:Activity`.** `opda:Verification rdfs:subClassOf prov:Activity`. The OIDC4IDA single `time` is the completion instant → `prov:endedAtTime`, with `prov:generatedAtTime` on the resulting verified entity.
- **`prov:used` (evidence).** The Verification activity `prov:used` each evidence item it consumed.
- **Qualified attribution (verifier-as-`prov:Agent`).** `opda:Verifier rdfs:subClassOf prov:Agent`; `verifier.organization` is a `prov:Organization`, a human voucher a `prov:Person`. Use the **qualified form** — `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole` — so `validation_method`/`verification_method` are not discarded by the binary `prov:wasAttributedTo` / `prov:wasAssociatedWith` shortcuts.
- **Evidence subtypes as `prov:Entity` subclasses.** `opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`, `opda:VouchEvidence`, each `rdfs:subClassOf prov:Entity` and carrying its type-specific facets (`document_details`; `record.source`; `attestation` + `voucher`). A vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation. Do not collapse the three evidence types into one pattern.
- **`prov:wasDerivedFrom` (claim ← evidence).** Load-bearing edge: the verified claim entity `prov:wasDerivedFrom` each evidence entity it rests on.
- **`prov:wasInformedBy` (chaining).** Where one verification consumes the output of an earlier one, the activities chain (`identity` → `AML` → `source-of-funds`) without flattening into one opaque step.
- **`prov:hadPlan` (standardised process).** A named procedure (UK AML / MLR 2017 CDD; a named identity-assurance profile) is a `prov:Plan`; the activity's `prov:Association` `prov:hadPlan` that plan. OIDC4IDA `validation_method`/`verification_method` objects land here — they are plan-shaped, not entity-shaped.

### The ~80% boundary — five exceptions modelled *around* PROV

| eIDAS / OIDC4IDA element | Why PROV-O can't carry it | Home in the assurance layer |
|---|---|---|
| `trust_framework` (`"uk_pdtf"`) | a governance regime, not a provenance primitive | `dct:conformsTo` on the verification activity |
| `validation_method` vs `verification_method` | a genuine OIDC4IDA bifurcation (validation = is the evidence genuine; verification = does it bind to *this* person) that PROV's single `prov:Plan` blurs | two sub-plans, or a SKOS-coded method (→ ODR-0011) |
| cryptographic `digest` (alg + value), `access_token` | PROV-O has no notion of a signature or a hash | local `opda:digestAlg` / `opda:digestValue` |
| assurance level (eIDAS LoA / OIDC trust tiering) | not a PROV concept; a quality judgement on the claim | SKOS-coded `opda:assuranceLevel` annotation on the claim (→ ODR-0011) |
| `txn` (verifier's transaction reference) | an external-system correlation key, not a PROV relation | `dct:identifier` on the activity |

Local terms minted here: `opda:assuranceLevel`, `opda:digestAlg`, `opda:digestValue`. These are the only bespoke `opda:` terms in this layer; everything else reuses PROV-O, `dct:`, SKOS, or DPV.

### SHACL over the PROV structure

The schema's conditional requirements (`allOf`/`if`/`then` on `evidence.type`; e.g. `electronic_record` requires `record.source.name`) map to `sh:xone` over per-type shapes and conditional `sh:property` constraints — provenance is *validated*, not merely described (→ ODR-0013). Enforcement notes:

- Every `opda:Claim` carries at least one `prov:wasDerivedFrom` *or* an explicit "unverified" marker — an unprovenanced claim in a trust framework is a contradiction (`sh:Violation`).
- The `if/then`-on-`evidence.type` conditionality reproduces as `sh:xone` over per-type shapes (e.g. `electronic_record` → `sh:minCount 1` on `record.source.name`).
- A governance gate (`sh:Warning` minimum) fires where a property annotated `dpv:hasPersonalDataCategory` of a special category (AML, conviction-adjacent) lacks a sensitivity marker.

### DPV co-annotation

Evidence entities are co-annotated by the governance layer: `document_number`/`personal_number` are `dpv-pd:OfficialID` / `dpv-pd:Identifying`; a `vouch` voucher (`voucher.birthdate`, `voucher.name`, `voucher.occupation`) is third-party PII about a second data subject. PROV says "this entity was used to verify"; DPV says "this entity is official-ID data about a natural person." The two co-annotate the same nodes (→ ODR-0012).

### Worked examples (required)

The mapping is validated against worked PROV-O Turtle examples rendered alongside the JSON: at minimum a document-evidence identity verification, an electronic-record check against an authoritative register, and a vouch (Agent attestation), plus a chained identity → AML → source-of-funds pipeline exercising `prov:wasInformedBy`.

### Vocabulary delegation

Method, evidence-type and assurance-level SKOS concepts (ODR-0011) carry `skos:prefLabel`/`skos:definition` and `dct:source` back to the verifiedClaims schema leaf or the business-glossary external VC/eIDAS terms. This record fixes the *structure*; the *vocabulary fill* is delegated to ODR-0011 (enumerations) and ODR-0012 (DPV).

## Alternatives

- **PROV-O only** — flattens evidential weight into a causal trace and requires inventing `prov:` extensions for signatures and assurance tiers that PROV-DM deliberately does not model.
- **Bespoke `opda:` claims model** — discards the interoperability that is the entire point of going to linked data, isolating OPDA from the VC/wallet ecosystem it exists to join.

## Consequences

- Publish `claims-provenance.ttl` defining the PROV-O subclasses (`opda:Claim`, `opda:Verification`, `opda:Verifier`, the three evidence subclasses) and the assurance-layer terms (`opda:assuranceLevel`, `opda:digestAlg`, `opda:digestValue`).
- Land SHACL shapes (ODR-0013) validating the PROV structure and reproducing the `evidence.type` conditional schema as `sh:xone`.
- Mint method, evidence-type and assurance-level SKOS schemes (ODR-0011) with `dct:source` back to the verifiedClaims schema leaves.
- Apply DPV co-annotations (ODR-0012) on evidence and voucher entities — special-category gates fire on AML/conviction-adjacent evidence.
- Maintain the ~80%/five-exceptions boundary as a standing review obligation: re-test the line whenever the upstream `verifiedClaims` schema changes; envelope fields must not silently regress into the wrong layer.
- Ship worked Turtle examples (document, electronic-record, vouch, chained identity → AML → source-of-funds) alongside the JSON before downstream overlays consume the layer.
- Accept that `opda:digestAlg`/`opda:digestValue` are bespoke local terms with no external counterpart — PROV-DM models no signature notion and forcing one in would violate the reuse driver.

## References

- **Target versions**: RDF 1.2 and SHACL 1.2, per the Core-tier pin in [ODR-0002](./ODR-0002-ontology-language-adoption.md).
- **Vocabularies**: PROV-O (mandatory in this layer); Core `dct:` (`dct:conformsTo`, `dct:identifier`, and descriptive metadata on PROV entities/agents — `title`/`issued`/`creator`/`format` on evidence documents); SKOS for method and assurance-level schemes (→ ODR-0011); SHACL to validate the PROV shape (→ ODR-0013); DPV for PII co-annotation (→ ODR-0012); OWL-Time where a claim-validity *interval* (not just `prov:endedAtTime`'s instant) is needed (→ ODR-0014).
- **Glossary & external standards**: business-glossary VC/DID/ToIP terms — **Claim** (W3C VCDM 2.0), **Subject**, **Issuer**, **Holder**, **Verifier**, **Verifiable Credential**, **Trust Framework** (ToIP). The `opda:Verifier`/`prov:Agent` and `opda:Claim`/`prov:Entity` terms align to these; SKOS method and assurance concepts carry `dct:source` to the glossary row or verifiedClaims schema leaf. See [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) for the general term-sourcing convention.
- **Source schema**: `source/03-standards/schemas/src/schemas/verifiedClaims/pdtf-verified-claims.json` (the OIDC4IDA/eIDAS envelope).
- **Related ODRs**: anchor [ODR-0003](./ODR-0003-pdtf-ontology-programme.md); foundation [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md); gating crux [ODR-0005](./ODR-0005-property-land-identity-crux.md); agents and the asserted/evidenced-authority hook [ODR-0006](./ODR-0006-agents-and-roles.md); transactions and milestones [ODR-0007](./ODR-0007-transactions-and-lifecycle.md); enumerations [ODR-0011](./ODR-0011-enumeration-vocabularies.md); governance/DPV [ODR-0012](./ODR-0012-data-governance-layer.md); validation [ODR-0013](./ODR-0013-shacl-validation-and-severity.md); catalogue [ODR-0014](./ODR-0014-vocabulary-catalogue-amendments.md).
- **Council deliberation**: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q6 (owned by Moreau), with the detailed mapping in [`working/provenance-trio.md`](./council/working/provenance-trio.md).
