---
entityUri: opda:VerificationActivity
kind: entity
module: claim
sourceTtl: source/03-standards/ontology/opda-claim.ttl
tier: concept
title: Verification Activity
---

# Verification Activity

A Verification Activity is the **activity that produces a verified Claim from Evidence**. It records the verifier, the verification method, the completion timestamp, and the resulting Assurance Level.

## Why it matters

A Claim on its own is just an assertion; a Claim that has gone through a Verification Activity is a *verified* Claim — with a known verifier, a known method, and a known assurance grade. The Verification Activity is the entity that closes the audit loop: who verified, how, when, and to what standard.

If you are a compliance officer or auditor following the evidentiary trail, this is the entity that connects the dots.

## Hard cases

- **Multiple verifications of one Claim.** Different verifiers, different methods, possibly divergent verdicts. Each is its own Verification Activity; the model does not collapse them.
- **Verification method discarded.** A naive design records "verified=true" and loses the method. The model deliberately uses a qualified-attribution pattern so the validation_method / verification_method facets cannot be discarded.
- **Verification that ends without a verdict.** A verifier starts but does not complete. The Activity record persists in an incomplete state; the Claim is not promoted to verified until the Activity ends with a verdict.

## Identity Criterion

A Verification Activity is identified by its **(Claim, verifier, completion timestamp)** triple — what was verified, by whom, when. See the [Logical tier →](../../logical/claim/verification-activity.md) for the typed structure (PROV-O qualified attribution, validation/verification method capture).

## Related Kinds

- [Claim](./claim.md) — the Claim being verified
- [Evidence](./evidence.md) — the Evidence the Activity uses
- [Assurance Level](./assurance-level.md) — the grade the Activity assigns
- [Trust Framework](./trust-framework.md) — the governance regime the Activity conforms to

### Related-Kinds graph

![verification-activity-related-kinds-neighbourhood-graph](diagrams/verification-activity/verification-activity-related-kinds-neighbourhood-graph.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Verification Activity related-Kinds neighbourhood graph
    accDescr: Verification Activity verifies a Claim using one or more Evidence records, assigns an Assurance Level, and cites the Trust Framework under which it was performed; identified by the (Claim, verifier, completion-timestamp) triple.

    classDef centre fill:#E1BEE7,stroke:#6A1B9A,stroke-width:3px,color:#4A148C
    classDef cls fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B

    Verification["VerificationActivity"]:::centre
    Claim["Claim"]:::cls
    Evidence["Evidence<br/>(any subtype)"]:::cls
    Assurance["AssuranceLevel"]:::cls
    Framework["TrustFramework"]:::cls

    Verification -->|"verifies"| Claim
    Verification -->|"uses"| Evidence
    Verification -->|"assigns"| Assurance
    Verification -->|"underFramework"| Framework
```

</details>

## Source ODR

[ODR-0009 — Claims, evidence, provenance §Q1](/modelling/odr/odr-0009)
