# ODR 0009 — Claims, Evidence & Provenance

- **Status:** Proposed (planning stub)
- **Date:** 2026-05-20
- **Phase:** Cross-cutting (high-leverage — part of MVP)
- **Anchor:** [ODR-0003](./0003-pdtf-ontology-programme.md) · **Session:** [001](./council/session-001-pdtf-schema-to-ontology.md) (Q6 — owned by Moreau)
- **Dependencies:** ODR-0004; co-annotates ODR-0006/0012

## Scope

Re-express the `pdtf-verified-claims.json` OIDC4IDA/eIDAS envelope as PROV-O **plus a dedicated assurance layer**. Identified in Session 001 as the highest-leverage piece — the seam where PDTF interoperates with the VC/wallet ecosystem and where a *Trust* Framework earns the name.

### PROV-O backbone (Moreau's canonical mapping — ~80% native)

- Claim → `prov:Entity` (`opda:Claim rdfs:subClassOf prov:Entity`); verified claim is a derived entity.
- Verification → `prov:Activity` (`prov:endedAtTime`; `prov:generatedAtTime` on the result).
- `prov:used` evidence; `prov:wasAssociatedWith` verifier-as-`prov:Agent`; **`prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole`** (Gandon — keep the *how/when*, don't lossy-compress to binary shortcuts).
- Evidence subtypes as `prov:Entity` subclasses: `opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`, `opda:VouchEvidence` (a vouch is `prov:wasAttributedTo` an Agent, not a document derivation — Cagle).
- `prov:wasDerivedFrom` (claim ← evidence); `prov:wasInformedBy` (identity → AML → source-of-funds chaining); `prov:hadPlan` (MLR-2017 CDD).
- **SHACL over the PROV structure** (Knublauch): the schema's `if/then`-on-`evidence.type` → `sh:xone` per-type shapes, so provenance is *validated*, not just described.

### Assurance layer (the eIDAS envelope PROV-O does NOT carry)

Moreau flagged five non-mappings (independently matching the DA's Q6 attack) — model these *around* PROV, not into it:

| eIDAS / OIDC4IDA element | Home |
|---|---|
| `trust_framework` (`"uk_pdtf"`) | `dct:conformsTo` on the activity |
| validation_method vs verification_method | two sub-plans / SKOS method codes (genuine OIDC4IDA bifurcation PROV can't express) |
| cryptographic `digest` (alg + value), `access_token` | local `opda:digestAlg`/`opda:digestValue` (PROV has no signature notion) |
| assurance level (eIDAS LoA) | SKOS `opda:assuranceLevel` quality annotation on the claim |
| `txn` (verifier ref) | `dct:identifier` on the activity |

### DPV co-annotation (Pandit)

Evidence entities are saturated with PII — `document_number`/`personal_number` = `dpv-pd:OfficialID`; a `vouch` voucher is itself a data subject. PROV and DPV co-annotate the same nodes (→ ODR-0012).

## Vocabularies

PROV-O (mandatory here), Core (`dct:`), SKOS (method codes, assurance level), SHACL (validate PROV shape), DPV (co-annotation), OWL-Time (`prov:atTime` → intervals where needed).

## Deliverables (when fleshed out)

`claims-provenance.ttl` (PROV-O subclasses + assurance vocabulary); SHACL shapes validating the provenance structure; worked PROV-O Turtle examples alongside the JSON (Davis); the `opda:assuranceLevel` SKOS scheme (→ ODR-0011).
