---
title: "Member-firm VC submission spec — draft"
purpose: "Define the shape, signing, submission interface, and intake validation for member-firm quarterly Verifiable Credentials feeding the Accreditation Directory build pipeline."
source: "ADR-0005 register item C2; ADR-0004 §5 (Data schema — VC-backed self-attestation)"
owner: "Technical WG (build) + Engagement WG (firm-side adoption)"
status: "Draft scaffold · pending C1 build pipeline · WG to validate"
last_updated: "2026-05-19"
---

# Member-firm VC submission spec — draft

## Context

[ADR-0005](../adr/ADR-0005-deferred-work-register.md) register item C2 carves out the member-firm tooling for minting and submitting the quarterly Verifiable Credentials that the C1 build pipeline (`scripts/build-accreditation-directory.mjs`) consumes. C1 is the aggregator; C2 is what firms run on their side to produce its inputs.

C2 depends on:

- **C1 shipping first.** Until the build script exists, the VC consumer interface isn't fixed.
- **Member firms being ready.** As of 2026-05-19 the credentials directory has **zero** submissions — there are no production VCs yet. The dependency on first-firm readiness is real, not nominal.

The artefact lives downstream of [ADR-0004](../adr/ADR-0004-accreditation-directory.md) §5, which sets the schema-of-truth as a W3C Verifiable Credential signed by the firm's accredited issuer DID. This document expands that into something a firm engineer can actually implement against.

## Required VC shape

The VC follows [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) and embeds OPDA-specific claim shape per ADR-0004 §5.

Fields the intake validator MUST find:

| Field | Source | Notes |
|---|---|---|
| `@context` | W3C VC v2 base + OPDA accreditation context | ADR-0004 sketches `https://w3id.org/opda/accreditation/v1`. ***WG decision required:*** confirm the final JSON-LD context URL and host it. |
| `type` | `["VerifiableCredential", "AccreditationStatement"]` | The `AccreditationStatement` type is OPDA's; defined in the OPDA context. |
| `issuer` | did:web DID of the issuing firm | Must resolve via the Trust Registry per `source/03-standards/trust-framework/docs/governance.md` §B. |
| `validFrom` | ISO 8601 timestamp at submission | Per VC 2.0 (`issuanceDate` is deprecated in favour of `validFrom`). |
| `validUntil` | ISO 8601 timestamp | ***WG decision required:*** does the credential expire at the next quarter's submission deadline, at end of next quarter, or remain indefinite until superseded? |
| `credentialSubject.firm` | DID of the firm being scored (identical to `issuer` for self-attestation) | The self-attestation case is the default; audit-attested score-5/6 evidence claims arrive as separate VCs signed by the auditor (ADR-0004 §6, evidence tier 5–6). |
| `credentialSubject.quarter` | `YYYY-Qn` string (e.g. `2026-Q2`) | Must match the submission window. |
| `credentialSubject.assuranceLevels` | Array of AL strings (`AL1`–`AL4`) | Per ADR-0004 §2 (hybrid scoring). |
| `credentialSubject.capabilities` | Array of capability score objects | Shape below. |
| `proof` | Cryptographic proof block | See §"Signing pattern". |

**Capability score object** — one per capability the framework defines (ADR-0004 §2 anticipates ~30–50 once DQ + Security ship):

```json
{
  "key": "dq.accuracy",
  "engagement": 5,
  "process": 4,
  "evidence": 3,
  "evidenceRefs": ["https://firm.example.com/audits/dq-2026-q1.pdf"]
}
```

The `key` namespace mirrors the published capability bundles — `dq.*` from the Data Quality framework, `sec.*` from the Data Security framework, `gov.*` / `arch.*` / `bdk.*` from the placeholder Phase 1 capabilities. ***WG decision required:*** the canonical key list. Drawn from the PDTF schemas in `source/03-standards/schemas/` only insofar as the capability bundles reference specific overlays; the keys themselves are governance-layer, not schema-layer.

DO NOT fabricate dimension scales here — they come from ADR-0004 §6 (1–6 scale, three tiers).

## Signing pattern

The VC is signed by the firm's did:web key per the existing Data Security framework (forthcoming) and the DID Auth / OAuth 2 spec referenced in `source/03-standards/trust-framework/docs/governance.md`.

Two proof families are W3C-compliant; both are in use across the VC ecosystem:

1. **JSON Web Signature (JWS)** via [`vc-jose-cose`](https://www.w3.org/TR/vc-jose-cose/) — the credential is serialised as a JWT or SD-JWT. Tooling-rich; widely supported.
2. **Linked Data Proofs** via [VC Data Integrity](https://www.w3.org/TR/vc-data-integrity/) — proof block embedded directly in the JSON-LD document. Preserves the linked-data graph for downstream reasoning.

***WG decision required:*** which proof type the Accreditation Directory mandates. Trade-off: JOSE is more interoperable with off-the-shelf identity tooling; Data Integrity preserves the JSON-LD semantics that the rest of the PDTF stack relies on. The Technical WG should pick one and document it. A "both accepted at intake" stance is possible but doubles the validator surface.

Key material:

- Issuer key is the did:web key advertised by the firm's DID document.
- Signature is verified at intake against the Trust Registry's current state for that DID (active, not revoked).
- Key rotation follows the existing PDTF did:web rotation pattern — no new mechanism needed.

## Submission interface

ADR-0004 §5 specifies the **storage layout** the build pipeline reads from: `source/04-governance-bodies/accreditation/credentials/{firm-did}/{YYYY-Qn}.json`.

As of 2026-05-19, the directory `source/04-governance-bodies/accreditation/credentials/` **does not yet exist** in the repository. Creating it is part of C1 or the first C2 submission, whichever lands first.

For the firm-facing submission interface itself, three shapes are plausible and the WG should choose:

| Interface | What firms do | Trade-offs |
|---|---|---|
| **Direct PR / commit** | Firm submits a PR adding their VC file to `source/04-governance-bodies/accreditation/credentials/{firm-did}/{YYYY-Qn}.json` | Lowest infrastructure cost; assumes firms are comfortable with GitHub workflows. Probably the right default for the first quarterly publish. |
| **CLI helper** | OPDA-published CLI (`opda-attest mint --quarter 2026-Q2 …`) generates and signs the VC; either writes locally for PR or pushes to an OPDA endpoint | Smoother DX; OPDA owns more tooling. ***WG decision required:*** is this Technical WG capacity in the first cycle? |
| **Web form** | Authenticated portal where firms fill in capability scores; OPDA backend mints the VC on the firm's behalf using a key the firm has delegated | Lowest firm-side complexity; highest OPDA-side complexity (delegation, custody concerns). Likely a Phase 5+ artefact, not a first-publish artefact. |

***WG decision required:*** which interface is supported at first quarterly publish ([ADR-0005](../adr/ADR-0005-deferred-work-register.md) register item C3). Recommend starting with PR / commit and layering a CLI later.

## Validation rules at intake

The C1 build script runs these checks when ingesting each VC. A failure means the firm is excluded from the current quarter's publish with a notice (see §"Error handling").

1. **JSON-LD / schema validation.** The VC parses against the W3C VC v2 model and the OPDA accreditation context.
2. **Signature verification.** The `proof` block verifies against the issuer's did:web key as recorded in the Trust Registry.
3. **Issuer status check.** The issuer DID is currently active in the Trust Registry (not revoked, not expired). Revocation status pulled from the existing status-list mechanics.
4. **Claim shape check.** Each entry in `credentialSubject.capabilities` has the required keys; scores fall in the 1–6 range; evidence-tier ≥3 carries an `evidenceRefs` URL; evidence-tier ≥5 carries an audit-attestation VC reference.
5. **Quarter-tag check.** `credentialSubject.quarter` matches the build's target quarter (no submitting a Q3 VC during the Q2 build window).
6. **Firm-in-Trust-Registry check.** The `credentialSubject.firm` DID is a current OPDA member; ex-members handled per ADR-0004 Q5 (deferred).
7. **Capability-key allowlist.** All `key` values come from the current published capability bundle. Unknown keys flagged for WG review — they may signal a firm has implemented a capability OPDA hasn't catalogued yet, or a typo. ***WG decision required:*** strict reject vs warn-and-include.

## Error handling and resubmission

Two failure modes need clear paths:

- **Hard intake failure** (signature invalid, schema invalid, wrong issuer): the VC is rejected. The firm is notified within 48h with the failure code and offending field. The firm has until the publish-day cutoff (per C3 checklist) to resubmit a corrected VC. A firm with no valid submission at cutoff appears in the Directory with the "stale" badge from ADR-0004 §4 if they were present in the prior quarter, or simply absent if first-time.
- **Soft warning** (capability key not in allowlist, evidence URL returns 404 at intake-time): the VC is accepted but the offending capability is held out of the publish until the warning is resolved. Same notification path; same cutoff.

Resubmission window: ***WG decision required:*** propose 7 days from notification, capped at publish-day cutoff, whichever is earlier.

## Open questions

1. **JSON-LD context URL.** ADR-0004 §5 sketches `https://w3id.org/opda/accreditation/v1`. Who hosts it, on what schedule, with what versioning policy?
2. **Proof type mandate.** JWS vs Data Integrity vs both. Trade-off between identity-tooling interop and JSON-LD semantic preservation. Technical WG call.
3. **Submission interface for first publish.** PR / commit is the cheapest start; CLI helper is the better DX. What does the Technical WG have capacity for in the first cycle?
4. **Capability-key governance.** Who owns the canonical allowlist? Likely C&R WG (DQ + Security) + Technical WG (overlays + architecture). How are new keys added between quarterly publishes — by ad-hoc PR, or batched into the quarter-end refresh?
5. **Validity window semantics.** Does a VC expire at end-of-quarter, at next submission, or remain indefinite-until-superseded? Affects how the Directory handles a firm that submits in Q2 and skips Q3 — show Q2 data with "stale" badge, or drop entirely?

## References

- [ADR-0005](../adr/ADR-0005-deferred-work-register.md) §C2 — the register entry this spec operationalises.
- [ADR-0004](../adr/ADR-0004-accreditation-directory.md) §5–§6 — VC schema sketch + evidence requirements per score level.
- [ADR-0001](../adr/ADR-0001-adopt-dcam-dmbok-elements.md) Wave 2 — three-axis capability scoring (Engagement / Process / Evidence) the VC payload reflects.
- `source/03-standards/trust-framework/docs/governance.md` §B — Trust Registry mechanics the signature verification relies on.
- `source/03-standards/schemas/` — PDTF schemas; capability keys cross-reference overlays defined here but live in the governance layer.
- W3C VC Data Model 2.0 · VC Data Integrity · vc-jose-cose — external specs the implementation conforms to.
