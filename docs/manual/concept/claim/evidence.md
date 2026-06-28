---
entityUri: opda:Evidence
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: concept
title: Evidence
---

# Evidence

Evidence is the supporting artefact behind a Claim. OPDA recognises three deliberately-distinct kinds of evidence — Document, Electronic Record, and Vouch — and explicitly does *not* collapse them, because they carry different lifecycles, different verification mechanics, and different assurance ceilings.

## Why it matters

The three subtypes correspond to the OIDC4IDA and eIDAS evidence categories. A Document Evidence (e.g. grant of probate) lives on paper or in a scan with a HMCTS issuance chain; an Electronic Record Evidence lives in a structured API response from an authoritative source; a Vouch Evidence is a regulated professional's attestation. They are *qualitatively different* — and treating them uniformly hides the data downstream consumers need to make verification decisions.

If you are an integrator surfacing evidence to a verification activity, this is the supertype whose subtype dispatch you need.

## Hard cases

- **Subtype confusion.** A scanned paper Document recorded as an Electronic Record. The IC discriminates by *source provenance*, not by digital format — a scanned paper artefact is still Document Evidence.
- **Mixed evidence chain.** One Claim supported by a Document, an Electronic Record, and a Vouch in combination. The three coexist as distinct Evidence instances; no collapse.
- **Evidence withdrawn.** A Document is invalidated post-hoc (e.g. probate revoked). The Evidence record persists with a withdrawal annotation; downstream Verification Activities that relied on it inherit a status change.

## Identity Criterion

An Evidence record is identified by its **(subtype, source-authority record-id)** pair. Two records refer to the same Evidence only if both components match. See the [Logical tier →](../../logical/claim/evidence.md) for the typed structure and the subtype-dispatching SHACL shape.

## Related Kinds

- [Document Evidence](./document-evidence.md) — paper or scanned authoritative artefact
- [Electronic Record Evidence](./electronic-record-evidence.md) — API-retrieved authoritative record
- [Vouch Evidence](./vouch-evidence.md) — regulated professional's attestation
- [Claim](./claim.md) — Claims are supported by Evidence
- [Verification Activity](./verification-activity.md) — verifies a Claim using Evidence

### Related-Kinds graph

![evidence-related-kinds-neighbourhood-graph](diagrams/evidence/evidence-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Evidence related-Kinds neighbourhood graph
    accDescr: Evidence as the supertype of three deliberately-distinct subtypes — Document, Electronic Record, Vouch — each with its own provenance chain and assurance ceiling; supports Claims and is used by Verification Activities.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Evidence["Evidence<br/>(supertype)"]:::centre
    DocEv["DocumentEvidence<br/>(HMCTS, etc.)"]:::cls
    ERecEv["ElectronicRecordEvidence<br/>(HMRC API, etc.)"]:::cls
    VouchEv["VouchEvidence<br/>(SRA-licensed)"]:::cls
    Claim["Claim"]:::cls
    Verification["VerificationActivity"]:::cls

    Evidence --> DocEv
    Evidence --> ERecEv
    Evidence --> VouchEv
    Claim -->|"supportedBy"| Evidence
    Verification -->|"uses"| Evidence
```

</details>

## Source ODR

[ODR-0009 — Claims, evidence, provenance §Q1](/modelling/odr/odr-0009)
