---
page: 48
slot: 48
title: Evidence, documents & declarations
voice: reference-prose-with-opinion
regions:
  intro: |
    Every leaf on every other Schema page carries a Decl / Evid / Deriv
    badge. This page is where the *Evidence* layer is documented in detail:
    the W3C Verifiable Credential envelope (`vc:Credential` / `vc:Issuer` /
    `vc:Subject` / `vc:Proof`), the attachment pattern (`*.attachments[]`)
    that binds sealed documents to schema leaves, and the declaration
    metadata that gives every assertion a provenance trail.
  why_this_exists: |
    The other pages USE evidence; this page MODELS it. A reader who arrives
    here is asking "how does PDTF make a fact verifiable?" — and the
    answer is the Verifiable Credential envelope plus the declaration
    metadata plus the attachment hash. None of those answers belongs on
    a domain page; all of them belong here.
  pull_quote: "Every signed assertion in PDTF is a Verifiable Credential — this page is where the envelope itself becomes the subject."
  gap_notes: |
    Today PDTF mixes embedded JSON-LD evidence with attached PDF/binary
    evidence at the leaf level. A unified evidence model (JSON-LD always,
    PDFs as attachments WITH a JSON-LD wrapper) would let SHACL validate
    the trust chain end-to-end. Section 3 of the trust framework v2 spec
    plans this; this page reflects the v1 model as-built.
  er_diagram: |
    erDiagram
      CREDENTIAL    ||--|| ISSUER       : "issued by"
      CREDENTIAL    ||--|{ SUBJECT      : "describes"
      CREDENTIAL    ||--|| PROOF        : "signed with"
      CREDENTIAL    ||--o{ EVIDENCE     : "evidenced by"
      CREDENTIAL    ||--o{ TERMS_OF_USE : "access-controlled"
      EVIDENCE      ||--o| ATTACHMENT   : "via"
      ATTACHMENT    ||--|| HASH         : "verified by"
      ATTACHMENT    ||--|| URL          : "located at"
      PROOF         ||--|| TYPE         : "of"
      PROOF         ||--|| METHOD       : "via"
      ISSUER {
        string id "did:web identifier"
        string name
      }
      PROOF {
        string type "DataIntegrityProof"
        string proofPurpose "assertionMethod"
        string created
      }
      ATTACHMENT {
        string url
        string mimeType
        string contentHash
      }
  er_caption: |
    Internal mechanics: a Verifiable Credential pairs an issuer with one or
    more claims about subjects, signs the bundle with a cryptographic proof,
    and optionally evidences external documents via attachments with
    content hashes. The whole thing is the unit of trust in PDTF v2.
  diagrams:
    - type: sequence
      source: |
        sequenceDiagram
          autonumber
          participant Seller
          participant Issuer as Issuer<br/>(HMLR · EPB · LA)
          participant PDTF as PDTF-compliant<br/>platform
          participant Buyer
          participant Verifier as Buyer's<br/>conveyancer

          Seller->>PDTF: request title / EPC / search
          PDTF->>Issuer: forward request (DID-authenticated)
          Issuer-->>PDTF: signed Verifiable Credential
          PDTF->>PDTF: store credential + hash attachments
          PDTF-->>Seller: credential available
          Seller->>Buyer: share credential reference
          Buyer->>Verifier: forward credential
          Verifier->>Issuer: resolve issuer DID
          Issuer-->>Verifier: DID document + public key
          Verifier->>Verifier: verify proof signature
          Verifier->>Verifier: verify content hash
          Verifier-->>Buyer: credential verified
      caption: |
        Issuance and verification flow for a Verifiable Credential. The
        seller never sees the issuer's signing key; the buyer's
        conveyancer never sees the seller's private data. The whole loop
        is signature-anchored to public DIDs — that's the trust model.
    - type: flowchart
      source: |
        flowchart LR
          classDef src fill:#B3E5FC,stroke:#0277BD,stroke-width:2px,color:#01579B
          classDef trust fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C
          classDef vc fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#BF360C

          A[Seller declaration<br/>TA6 answer]:::src --> VC[VC envelope]:::vc
          B[Authority evidence<br/>HMLR · EPB · LA]:::src --> VC
          C[Derived value<br/>apportionment]:::src --> VC
          VC --> P[Signed proof]:::trust
          VC --> H[Content hashes]:::trust
          VC --> A2[Attached docs]:::trust
          P --> R[Verifier]
          H --> R
          A2 --> R
      caption: |
        Three kinds of fact (declaration · evidence · derivation) all
        flow through the same VC envelope and present to a verifier as a
        signed bundle. The envelope normalises trust; the kind tells the
        verifier whose seal closes the challenge.
mentioned_but_not_owned: []
---
