---
status: proposed
date: 2026-05-20
tags: [claims, evidence, provenance, prov-o, assurance]
supersedes: []
depends-on: [ONT-0004, ONT-0005]
implements: [ONT-0003]
---

# Claims, Evidence & Provenance

## Context and Problem Statement

PDTF carries its assurance story in a separate envelope: `pdtf-verified-claims.json`, an OIDC4IDA (OpenID Connect for Identity Assurance) / eIDAS-shaped structure layered over the base transaction. A `verification` block (`trust_framework: "uk_pdtf"`, a single `time`, an `evidence[]` array) sits beside a `claims` object keyed by JSON-pointer paths back into the transaction (e.g. the value at `/participants/0/name`). Each evidence entry is discriminated by an `evidence.type` enum — `document` / `electronic_record` / `vouch` — with type-specific sub-objects (`document_details` with `document_number`, `date_of_issuance`, `issuer`; `record.source` for an authoritative register; `attestation` + `voucher` for a vouch), plus cross-cutting envelope fields: `validation_method` and `verification_method`, a cryptographic `digest` (algorithm + value), an assurance/level tier, and a verifier `txn` correlation reference.

This is the seam where PDTF stops being a property-data form and becomes a *Trust* Framework — the place where "who asserted this, who verified it, by what process, on what evidence, to what standard" must be made first-class and queryable. Council Session 001 identified it (Kendall, Davis) as the **highest-leverage piece of the whole conversion**: it is the interface to the W3C VC / DID / ToIP ecosystem the business glossary already names (Claim, Issuer, Holder, Verifier, Trust Framework), and a `verifiedClaims` structure expressed as opaque JSON cannot participate in that ecosystem.

The question (Q6, owned by Moreau): how do we re-express the `verifiedClaims` envelope as linked data without (a) re-minting under `opda:` a derivation vocabulary that already exists, or (b) flattening the evidential weight of the eIDAS envelope into a bare causal trace? The verifiedClaims structure is *mostly* a provenance graph — but not entirely, and the residue is exactly the part a trust framework cannot afford to lose.

This is a **cross-cutting** record (Q3 promoted Evidence and VerifiedClaims out of the by-module partition into spanning relations) drafted after at least one module exists, and it is part of the MVP: Gandon's intra-MVP ordering (Q7, ≈7-2) lands the PROV-O claims slice *before* the overlay profiles scale out, because provenance is foundational to a trust framework and higher integrity-risk than a form overlay.

## Decision Drivers

* **Reuse over reinvention** (ONT-0002 adoption pattern; Baker's commons argument) — PROV-DM's three core types (Entity, Activity, Agent) fall almost one-to-one onto the verifiedClaims shape; re-minting a derivation vocabulary under `opda:` where PROV-O fits would, in Moreau's words, be malpractice.
* **Provenance must be validated, not merely described** (Knublauch) — a trust framework's deliverable is a *checkable* contract; the schema's conditional `allOf`/`if`/`then` on `evidence.type` must survive as SHACL over the PROV structure, not evaporate into prose.
* **Evidential weight must not be flattened** (Guarino, Devil's Advocate) — PROV-O answers "who derived what from what"; it has no native vocabulary for the validation/verification distinction, assurance level, or jurisdiction-bound certainty. Forcing the eIDAS envelope onto PROV-O alone collapses a regulated assurance judgement into a causal edge.
* **Don't lossy-compress provenance** (Gandon) — binary shortcuts (`prov:wasAttributedTo`) discard `validation_method`/`verification_method`; the qualified forms must be used so the *how/when* survives.
* **Evidence is saturated with personal data** (Pandit) — evidence entities carry document numbers, issuers, and (for a vouch) a second natural person's PII; the provenance layer and the governance layer must co-annotate the same nodes (→ ONT-0012).
* **A claim mints into a transaction context, not a vacuum** — `txn`, `trust_framework`, and the claims' JSON-pointer targets tie the assurance graph to the Property (ONT-0005) and Transaction (ONT-0007) entities; the record depends on the identity crux being settled so claim subjects resolve.

## Considered Options

* **PROV-O only** — map the entire `verifiedClaims` envelope, including trust framework, method bifurcation, digests and assurance level, into PROV-O constructs (forcing `prov:Plan`, `prov:atTime`, and ad-hoc `prov:` extensions to carry the eIDAS envelope). Rejected — it flattens evidential weight into a causal trace and would require inventing `prov:` extensions for signatures and assurance tiers that PROV-DM deliberately does not model.
* **PROV-O backbone + a dedicated assurance/evidence-weight layer** (chosen) — PROV-O for the who/what-process/from-what-evidence skeleton (≈80% of the envelope, native), with the residual eIDAS envelope (trust framework, validation-vs-verification, cryptographic digest, assurance level, txn) modelled *around* PROV in a separate layer built from `dct:`, SKOS and local `opda:` terms.
* **Bespoke `opda:` claims model** — design a native OPDA claims/evidence/verification vocabulary from scratch, ignoring PROV-O. Rejected — it discards the interoperability that is the entire point of going to linked data, isolating OPDA from the VC/wallet ecosystem it exists to join.

## Decision Outcome

Chosen option: **PROV-O backbone plus a separate assurance layer**, because it is the only option that places the derivation graph on a shared, dereferenceable standard while keeping the regulated assurance judgement — the part that makes this a *trust* framework — in a vocabulary that can actually express it. The decisive evidence is that two independent analyses converged on the same boundary: Moreau's own honest accounting of where PROV-O stops, and Guarino's purist objection that it stops exactly there. The cure is the same in both: separate the layers.

**PROV-O backbone (Moreau's canonical mapping — unanimous, 12-0).**

- **Claim → `prov:Entity`.** `opda:Claim rdfs:subClassOf prov:Entity`. Each asserted `claims` entry is an entity; the *verified* claim — claim plus its verification bundle — is a derived entity.
- **Verification → `prov:Activity`.** `opda:Verification rdfs:subClassOf prov:Activity`. The OIDC4IDA single `time` is the completion instant → `prov:endedAtTime`, with `prov:generatedAtTime` on the resulting verified entity.
- **`prov:used` (evidence).** The Verification activity `prov:used` each evidence item it consumed.
- **`prov:wasAssociatedWith` (verifier-as-`prov:Agent`).** `opda:Verifier rdfs:subClassOf prov:Agent`; `verifier.organization` is a `prov:Organization`, a human voucher a `prov:Person`. Gandon's amendment (carried, 9-0): use the **qualified form** — `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole` — so `validation_method`/`verification_method` are not discarded by the binary `prov:wasAttributedTo` / `prov:wasAssociatedWith` shortcuts.
- **Evidence subtypes as `prov:Entity` subclasses.** The `evidence.type` enum becomes `opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`, `opda:VouchEvidence`, each `rdfs:subClassOf prov:Entity` and carrying its type-specific facets (`document_details`; `record.source`; `attestation` + `voucher`). A vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation (Cagle's caveat: do not collapse all three evidence types into one pattern).
- **`prov:wasDerivedFrom` (claim ← evidence).** The load-bearing edge: the verified claim entity `prov:wasDerivedFrom` each evidence entity it rests on, making "this name was confirmed *from* this passport" a first-class, queryable triple.
- **`prov:wasInformedBy` (chaining).** Where one verification consumes the output of an earlier one, the activities chain — `identity` → `AML` → `source-of-funds` — expressing a multi-stage assurance pipeline without flattening it into one opaque step.
- **`prov:hadPlan` (standardised process).** A named procedure (UK AML / MLR 2017 customer due diligence, or a named identity-assurance profile) is a `prov:Plan`; the activity's `prov:Association` `prov:hadPlan` that plan. This is where the OIDC4IDA `validation_method`/`verification_method` objects land — they describe *how* the check was done, which is plan-shaped, not entity-shaped.
- **SHACL over the PROV structure** (Knublauch's amendment, 9-0). The schema's conditional requirements (`allOf`/`if`/`then` on `evidence.type`; e.g. `electronic_record` requires `record.source.name`) map to `sh:xone` over per-type shapes and conditional `sh:property` constraints, so provenance is *validated*, not merely described (→ ONT-0013).
- **DPV co-annotation** (Pandit's amendment). Evidence entities are co-annotated by the governance layer: `document_number`/`personal_number` are `dpv-pd:OfficialID` / `dpv-pd:Identifying`; a `vouch` voucher (`voucher.birthdate`, `voucher.name`, `voucher.occupation`) is third-party PII about a second data subject. PROV says "this entity was used to verify"; DPV says "this entity is official-ID data about a natural person." The two co-annotate the same nodes (→ ONT-0012).

**The ~80% boundary and the five exceptions (Moreau's own analysis).** Roughly 80% of `verifiedClaims` maps to PROV-O natively. **Five elements must be modelled *around* PROV, not *into* it** — this is the dedicated assurance/evidence-weight layer that sits alongside the PROV-O skeleton:

| eIDAS / OIDC4IDA element | Why PROV-O can't carry it | Home in the assurance layer |
|---|---|---|
| `trust_framework` (`"uk_pdtf"`) | a governance regime, not a provenance primitive | `dct:conformsTo` on the verification activity |
| `validation_method` vs `verification_method` | a genuine OIDC4IDA bifurcation (validation = is the evidence genuine; verification = does it bind to *this* person) that PROV's single `prov:Plan` blurs | two sub-plans, or a SKOS-coded method (→ ONT-0011) |
| cryptographic `digest` (alg + value), `access_token` | PROV-O has no notion of a signature or a hash | local `opda:digestAlg` / `opda:digestValue` |
| assurance level (eIDAS LoA / OIDC trust tiering) | not a PROV concept; it is a quality judgement on the claim | SKOS-coded `opda:assuranceLevel` annotation on the claim (→ ONT-0011) |
| `txn` (verifier's transaction reference) | an external-system correlation key, not a PROV relation | `dct:identifier` on the activity |

### Consequences

* Good, because the derivation skeleton reuses a W3C-recommended standard (PROV-O), so an OPDA verified claim dereferences into terms a stranger's triplestore already understands — the interoperability that justifies the move to linked data.
* Good, because `prov:wasDerivedFrom`, `prov:wasInformedBy` and the qualified attribution forms make the assurance pipeline queryable and lossless, turning an opaque verification blob into "this claim, from this evidence, by this verifier, under this plan."
* Good, because separating the assurance layer keeps evidential weight (assurance level, validation/verification split, cryptographic integrity) expressible in vocabularies that can actually state it, resolving the Devil's Advocate's central objection rather than papering over it.
* Good, because SHACL-over-PROV makes the schema's conditional evidence-type requirements a checkable contract, which is the trust-framework deliverable, not a description of one.
* Bad, because the layer boundary is a standing maintenance obligation: the ~80%/five-exceptions line must be re-tested whenever the upstream `verifiedClaims` schema changes (Moreau's standing-review point, Q7), or envelope fields silently regress into the wrong layer.
* Bad, because `opda:digestAlg`/`opda:digestValue` are bespoke local terms with no external counterpart — the one place this record knowingly mints, accepted because PROV-DM models no signature notion and forcing one in would be the malpractice the reuse driver forbids.
* Neutral, because evidence-type, verification-method and assurance-level enumerations are delegated to ONT-0011 (SKOS concept schemes) rather than resolved here, and the PII-category annotations are delegated to ONT-0012 (DPV), so this record fixes the *structure* and defers the *vocabulary fill*.

### Confirmation

- SHACL shapes (ONT-0013) validate the PROV structure itself: every `opda:Claim` carries at least one `prov:wasDerivedFrom` *or* an explicit "unverified" marker — an unprovenanced claim in a trust framework is a contradiction (Moreau, `sh:Violation`); the `if/then`-on-`evidence.type` conditionality is reproduced as `sh:xone` over per-type shapes (e.g. `electronic_record` → `sh:minCount 1` on `record.source.name`).
- A governance gate (Pandit, `sh:Warning` minimum) fires where a property annotated `dpv:hasPersonalDataCategory` of a special category (AML, conviction-adjacent) lacks a sensitivity marker.
- The mapping is validated against worked PROV-O Turtle examples rendered alongside the JSON (Davis's publish-first): at minimum a document-evidence identity verification, an electronic-record check against an authoritative register, and a vouch (Agent attestation), plus a chained identity → AML → source-of-funds pipeline exercising `prov:wasInformedBy`.
- Method, evidence-type and assurance-level SKOS concepts (ONT-0011) carry `skos:prefLabel`/`skos:definition` and `dct:source` back to the verifiedClaims schema leaf or the business glossary's external VC/eIDAS terms.

## Pros and Cons of the Options

### PROV-O only

* Good, because it is a single, uniform vocabulary with no layer boundary to police.
* Bad, because it has no native term for the validation/verification distinction, assurance level, or trust framework, so these must be either dropped or smuggled into ill-fitting PROV constructs.
* Bad, because cryptographic integrity (digest, signature) has no PROV idiom at all; carrying it would require inventing `prov:` extensions — the precise malpractice the reuse driver names.

### PROV-O backbone + separate assurance layer

* Good, because each concern is modelled in the vocabulary built for it: derivation in PROV-O, governance regime and identifiers in `dct:`, quality tiers and method codes in SKOS, cryptographic facets in narrow local terms.
* Good, because it is honest about PROV-O's limits — Moreau's five flagged non-mappings are annotated, not forced — which is what converted Guarino's DISAGREE into a withdrawal.
* Bad, because two co-annotating layers over the same nodes are more to specify, validate and maintain than one.

### Bespoke `opda:` claims model

* Good, because a from-scratch model could fit the eIDAS envelope exactly with no boundary.
* Bad, because it severs the interoperability that is the entire rationale for the conversion — an `opda:`-only claims graph speaks to no other VC/wallet/eIDAS consumer and re-mints what PROV-O already standardises.

## More Information

- **Vocabularies**: PROV-O (mandatory in this layer per Q2 — Moreau's amendment: required wherever a claim, verification, evidence item or lifecycle transition is modelled, absent on plain descriptive leaves); Core (`dct:conformsTo`, `dct:identifier`, and `dct:` descriptive metadata on PROV entities/agents per Baker — `title`/`issued`/`creator`/`format` of an evidence document); SKOS for method and assurance-level schemes (→ ONT-0011); SHACL to validate the PROV shape (→ ONT-0013); DPV for PII co-annotation (→ ONT-0012); OWL-Time where a claim-validity *interval* (not just `prov:endedAtTime`'s instant) is needed (→ ONT-0014). Local terms minted here: `opda:assuranceLevel`, `opda:digestAlg`, `opda:digestValue`.
- **Glossary & external standards as inputs**: the business glossary records the VC/DID/ToIP terms this layer interoperates with — **Claim** ("a statement about a subject", W3C VCDM 2.0), **Subject**, **Issuer**, **Holder**, **Verifier** ("the entity that receives verifiable credentials and validates their authenticity"), **Verifiable Credential**, and **Trust Framework** (ToIP: "an agreed set of rules… that govern how entities exchange verifiable data"). The `opda:Verifier`/`prov:Agent` and `opda:Claim`/`prov:Entity` terms align to these; SKOS method and assurance concepts carry `dct:source` to the glossary row or the verifiedClaims schema leaf. See ONT-0004 for the general term-sourcing and provenance convention.
- **Source schema**: `source/03-standards/schemas/src/schemas/verifiedClaims/pdtf-verified-claims.json` (the OIDC4IDA/eIDAS envelope).
- **Deliverables (when fleshed out)**: `claims-provenance.ttl` (PROV-O subclasses + the assurance vocabulary); SHACL shapes validating the provenance structure (→ ONT-0013); the `opda:assuranceLevel` and verification-method SKOS schemes (→ ONT-0011); DPV PII co-annotations on evidence/voucher entities (→ ONT-0012); worked PROV-O Turtle examples alongside the JSON.
- **Related**: anchor [ONT-0003](./ONT-0003-pdtf-ontology-programme.md); foundation [ONT-0004](./ONT-0004-pdtf-ontology-foundation.md); the gating crux [ONT-0005](./ONT-0005-property-land-identity-crux.md) (claim subjects resolve to Property/Title entities); agents and the asserted/evidenced-authority hook [ONT-0006](./ONT-0006-agents-and-roles.md); transactions and milestones [ONT-0007](./ONT-0007-transactions-and-lifecycle.md); enumerations [ONT-0011](./ONT-0011-enumeration-vocabularies.md); governance/DPV [ONT-0012](./ONT-0012-data-governance-layer.md); validation [ONT-0013](./ONT-0013-shacl-validation-and-severity.md); catalogue [ONT-0014](./ONT-0014-vocabulary-catalogue-amendments.md). Council deliberation: [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q6 (owned by Moreau), with the detailed mapping in [`working/provenance-trio.md`](./council/working/provenance-trio.md).

## Vote and Dissent

Full deliberation in [session-001](./council/session-001-pdtf-schema-to-ontology.md) Q6 and [`working/provenance-trio.md`](./council/working/provenance-trio.md).

- **PROV-O backbone — 12-0.** Unanimous that PROV-O is the right TBox for the who/what-process/from-what-evidence skeleton, and the highest-leverage piece of the conversion (Kendall, Davis).
- **Amendments carried**: Gandon's qualified forms (`prov:qualifiedAttribution`/`prov:Attribution` + `prov:hadRole`, 9-0) so the method distinction is not lossy-compressed; Knublauch's SHACL-over-PROV (9-0) so provenance is validated; Pandit's DPV co-annotation of evidence/voucher entities; Baker's `dct:` for descriptive metadata on PROV entities (abstained on the mapping mechanics, in favour of `dct:` labelling).
- **Devil's Advocate (Guarino) — DISAGREE, then WITHDRAWN.** Guarino held that PROV-O has no vocabulary for the validation/verification distinction, assurance level, or jurisdiction-bound claim certainty, and that forcing eIDAS onto PROV-O alone flattens evidential weight into a causal trace. The objection was **not dismissed**: it is satisfied by Moreau's own design, which independently reaches the same boundary (the ~80%/five-exceptions split) and separates a dedicated assurance/evidence-weight layer from the PROV-O skeleton. Guarino **withdrew** on that separation. The five exceptions stand as the recorded substance of the resolved objection.
- No further dissent specific to this layer beyond Pandit's broader DPV-scope dissent, which is recorded against ONT-0012 (the lawful-basis/consent/purpose class vocabulary), not here.
