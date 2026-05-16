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
mentioned_but_not_owned: []
---
