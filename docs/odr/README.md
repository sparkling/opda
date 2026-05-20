# Ontology Decision Records (ODRs)

Formal decision records for OPDA's linked-data work — ontology design, namespace strategy, vocabulary selection, mapping conventions, validation patterns, and anything else that materially shapes the property-data knowledge graph and its trust-framework expression.

ODRs are distinct from [ADRs](../adr/README.md): ADRs cover framework/governance/tooling decisions at project level; ODRs cover the semantic modelling decisions inside the ontology. Both registers run their own sequential numbering.

## Conventions

- **Sequential, global numbering.** `0001-…`, `0002-…`, `0003-…`. New ODRs pick the next free number; do not skip or re-use.
- **Flat directory.** All ODRs live directly under `docs/odr/`. Council session transcripts live under `docs/odr/council/`.
- **File name = `NNNN-kebab-case-slug.md`.** The slug describes the decision in 3–6 words.
- **Status.** One of: `Proposed`, `Accepted`, `Implemented`, `Superseded by NNNN`, `Deprecated`.
- **Council-reviewed ODRs** record the session ID, Queen, Devil's Advocate, vote tallies, and dissent in the body. See [ODR-0001](./0001-linked-data-council-methodology.md) for the convening protocol.

## Index

| # | Title | Status |
|---|---|---|
| [0001](./0001-linked-data-council-methodology.md) | Linked Data Council — review methodology | Accepted |
| [0002](./0002-ontology-language-adoption.md) | Ontology languages and vocabularies adopted | Proposed |
| [0003](./0003-pdtf-ontology-programme.md) | **PDTF → Ontology: programme & work breakdown (anchor)** | Proposed |
| [0004](./0004-pdtf-ontology-foundation.md) | Foundation — namespace, URIs & ontology structure | Proposed |
| [0005](./0005-property-land-identity-crux.md) | Property & Land: the identity crux *(gate)* | Proposed |
| [0006](./0006-agents-and-roles.md) | Agents & Roles | Proposed |
| [0007](./0007-transactions-and-lifecycle.md) | Transactions & Lifecycle | Proposed |
| [0008](./0008-property-descriptive-attributes.md) | Property descriptive attributes | Proposed |
| [0009](./0009-claims-evidence-provenance.md) | Claims, Evidence & Provenance | Proposed |
| [0010](./0010-overlay-profile-mechanism.md) | Overlay Profile Mechanism | Proposed |
| [0011](./0011-enumeration-vocabularies.md) | Enumeration Vocabularies | Proposed |
| [0012](./0012-data-governance-layer.md) | Data-Governance Layer (DPV) | Proposed |
| [0013](./0013-shacl-validation-and-severity.md) | SHACL Validation & Severity | Proposed |
| [0014](./0014-vocabulary-catalogue-amendments.md) | Vocabulary catalogue amendments (amends 0002) | Proposed |

**ODR 0003–0014** are the PDTF-JSON-Schema → ontology programme. [ODR-0003](./0003-pdtf-ontology-programme.md) is the anchor — start there. They were planned in [Council Session 001](./council/session-001-pdtf-schema-to-ontology.md) (full per-expert positions in [`council/working/`](./council/working/)). All are planning stubs to be fleshed out in their own follow-up sessions; ODR-0005 is the gating crux.

## Authoring a new ODR

1. Copy an existing ODR as a template.
2. Use the next sequential number (check this index).
3. Lead with `# ODR NNNN — <decision title>`.
4. Required sections: Status, Date, Context, Options rejected, Decision, Rationale, Consequences. Council-reviewed ODRs also need a Track record / Verdict section.
5. Cross-link sibling ODRs (the "Related" field at the top).
6. If a council session was convened, file the transcript under `docs/odr/council/session-NNN-<slug>.md` and link it from the ODR.
7. Update this index.

ODRs are immutable history once accepted. After ratification, edit them only to:

- update the Status line (e.g. when superseded)
- record "Resolved during review" outcomes from a follow-up session
- fix typos or broken cross-references

Never rewrite the original analysis. Reversals are documented as new sessions that reference the prior verdict.
