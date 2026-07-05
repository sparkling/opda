# Claim

The Claim module covers verifiable assertions about a Property, a Transaction, or any party in them — and the evidence, verification, and trust framework that scope each Claim's validity.

The core triangle is **Claim → Evidence → Verification Activity**, with each Verification carrying an Assurance Level (eIDAS Low / Substantial / High) and citing the Trust Framework under which it was performed.

Evidence comes in three subtypes that are deliberately *not* collapsed:

- **Document Evidence** — paper or scanned artefacts issued by an authoritative source (e.g. grant of probate);
- **Electronic Record Evidence** — API-retrieved structured records from an authoritative source (e.g. HMRC tax-record API);
- **Vouch Evidence** — formal attestations by a regulated professional (e.g. SRA-licensed solicitor).

The three short-name aliases (Document, Electronic Record, Vouch) exist for ergonomic compatibility with worked-example data; they are equivalent to the long-name forms.

## Entities

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

## Module-internal relationships

The Claim → Evidence → Verification triangle, the three Evidence subtypes (with their short-name aliases), and the Trust Framework + Assurance Level scoping:

![claim-module-internal-relationships](diagrams/README/claim-module-internal-relationships.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
---
config:
  layout: elk
---
%%{init: {"theme": "base"}}%%
flowchart LR
    accTitle: Claim module internal relationships
    accDescr: Claim supported by Evidence; Evidence specialises into Document, Electronic Record, and Vouch (with short-name aliases); Verification Activity produces a verified Claim from Evidence, assigning an Assurance Level and citing a Trust Framework.

    classDef cls fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
    classDef alias fill:#FFF9C4,stroke:#F57F17,stroke-width:2px,color:#E65100
    classDef ext fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238

    %% Core
    Claim["Claim<br/>(verifiable assertion)"]:::cls
    Evidence["Evidence<br/>(supertype)"]:::cls
    Verification["VerificationActivity"]:::cls
    Assurance["AssuranceLevel<br/>(Low | Substantial | High)"]:::cls
    Framework["TrustFramework"]:::cls

    %% Evidence subtypes
    DocEv["DocumentEvidence"]:::cls
    ERecEv["ElectronicRecordEvidence"]:::cls
    VouchEv["VouchEvidence"]:::cls

    %% Short-name aliases
    Doc["Document<br/>(alias)"]:::alias
    ERec["ElectronicRecord<br/>(alias)"]:::alias
    Vouch["Vouch<br/>(alias)"]:::alias

    %% Cross-module
    Seller["Seller<br/>(agent module)"]:::ext
    Person["Person<br/>(agent module)"]:::ext

    %% Subtype hierarchy
    Evidence --> DocEv
    Evidence --> ERecEv
    Evidence --> VouchEv

    %% OWL equivalence aliases
    DocEv ===|"owl:equivalentClass"| Doc
    ERecEv ===|"owl:equivalentClass"| ERec
    VouchEv ===|"owl:equivalentClass"| Vouch

    %% Core relationships
    Claim -->|"supportedBy (1..*)"| Evidence
    Verification -->|"verifies"| Claim
    Verification -->|"uses"| Evidence
    Verification -->|"assigns"| Assurance
    Verification -->|"underFramework"| Framework
    Framework -->|"defines"| Assurance

    %% Cap rule
    VouchEv -.->|"caps at eIDAS Low"| Assurance

    %% Cross-module attachment
    Seller -.->|"asserts authority Claim"| Claim
    Person -.->|"asserts identity Claim"| Claim
```

</details>

## Lifecycle: Claim verification chain (assurance levels)

How a Claim is promoted (or downgraded) through the eIDAS assurance tiers depending on the Evidence chain backing it:

![claim-verification-chain-lifecycle](diagrams/README/claim-verification-chain-lifecycle.png)

<details>
<summary>Mermaid Source</summary>

```mermaid
%%{init: {"theme": "base"}}%%
stateDiagram-v2
    accTitle: Claim verification chain lifecycle
    accDescr: A Claim starts as an unverified assertion, is promoted via Verification Activity to Low, Substantial, or High assurance depending on its Evidence chain; Vouch-only Evidence caps at Low; downgrade is possible if Evidence is withdrawn.

    [*] --> Asserted : Claim created<br/>(no Verification yet)

    Asserted --> LowAssurance : Verification Activity<br/>backed by Vouch only<br/>or weak Electronic Record
    Asserted --> SubstantialAssurance : Verification Activity<br/>backed by Document<br/>or live Electronic Record
    Asserted --> HighAssurance : Verification Activity<br/>backed by court Document<br/>+ corroborating evidence

    LowAssurance --> SubstantialAssurance : evidence strengthened<br/>(fresh Verification)
    SubstantialAssurance --> HighAssurance : evidence strengthened<br/>(fresh Verification)

    HighAssurance --> SubstantialAssurance : evidence weakened<br/>(downgrade Verification)
    SubstantialAssurance --> LowAssurance : evidence withdrawn<br/>(downgrade Verification)
    LowAssurance --> Contested : second Verification<br/>produces divergent verdict

    Contested --> [*] : governance decision<br/>(out-of-band)
    HighAssurance --> [*] : Claim verified<br/>at policy ceiling
```

</details>
