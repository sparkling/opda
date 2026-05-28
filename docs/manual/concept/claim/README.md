# Claim

The Claim module covers verifiable assertions about a Property, a Transaction, or any party in them — and the evidence, verification, and trust framework that scope each Claim's validity.

The core triangle is **Claim → Evidence → Verification Activity**, with each Verification carrying an Assurance Level (eIDAS Low / Substantial / High) and citing the Trust Framework under which it was performed.

Evidence comes in three subtypes that are deliberately *not* collapsed:

- **Document Evidence** — paper or scanned artefacts issued by an authoritative source (e.g. grant of probate);
- **Electronic Record Evidence** — API-retrieved structured records from an authoritative source (e.g. HMRC tax-record API);
- **Vouch Evidence** — formal attestations by a regulated professional (e.g. SRA-licensed solicitor).

The three short-name aliases (Document, Electronic Record, Vouch) exist for ergonomic compatibility with worked-example data; they are equivalent to the long-name forms.

## Entities

- [Assurance Level](./assurance-level.md) — quality grade on a Claim's verification
- [Claim](./claim.md) — a verifiable assertion supported by evidence
- [Document](./document.md) — short-name alias for Document Evidence
- [Document Evidence](./document-evidence.md) — paper or scanned authoritative artefact
- [Electronic Record](./electronic-record.md) — short-name alias for Electronic Record Evidence
- [Electronic Record Evidence](./electronic-record-evidence.md) — API-retrieved authoritative record
- [Evidence](./evidence.md) — the generic evidence supertype
- [Trust Framework](./trust-framework.md) — governance regime that scopes claim validity
- [Verification Activity](./verification-activity.md) — the activity that produces a verified claim
- [Vouch](./vouch.md) — short-name alias for Vouch Evidence
- [Vouch Evidence](./vouch-evidence.md) — formal attestation by a regulated professional
