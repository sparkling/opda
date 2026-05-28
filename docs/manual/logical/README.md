---
status: proposed
date: 2026-05-28
tags: [logical-model, documentation, ontology]
supersedes: []
depends-on: []
implements:
  - ../../information-architecture/logical-model-ia.md
---

# OPDA Logical Model

This tier shows the entity-relationship structure of OPDA's ontology in platform-independent form. Audience: data engineers, solution architects, integration architects, technical product managers. The reader is expected to be comfortable with entity-relationship modelling but should not need to read RDF, SHACL, or SKOS Turtle.

## Reading order

1. [`index.md`](./index.md) — module catalogue, entity index, master ER diagram
2. The seven module directories (in IC-dependency order):
   - [`foundation/`](./foundation/) — six foundation classes (UFO meta-classes, ValidationContext, generator provenance)
   - [`property/`](./property/) — Property + Address + LegalEstate + RegisteredTitle + LeaseTerm + lifecycle events
   - [`agent/`](./agent/) — Person + Organisation + Roles + Relators
   - [`transaction/`](./transaction/) — Transaction Relator + Milestone + TransactionChain
   - [`claim/`](./claim/) — Claim + Evidence subtypes + VerificationActivity
   - [`governance/`](./governance/) — DPV mapping records + special-category data
   - [`descriptive/`](./descriptive/) — Survey + Valuation + EPC + Search + Comparable
3. Per-module `enumerations/` subdirectories — typed value sets (SKOS schemes) bound by each module's attributes.

## What's in each entity file

Every entity follows the same nine-section shape:

1. **Summary** — one paragraph; UFO meta-category in brackets; back-link to Concept tier
2. **Attributes** — typed table with cardinality + identity-bearing flags
3. **Relationships** — typed table with cardinality + inverse predicate
4. **Identity key** — typed shape of the Identity Criterion
5. **Constraints** — non-cardinality business rules with SHACL severity tier
6. **Derived attributes** — attributes computed from SHACL-AF rules
7. **ER diagram** — Mermaid `erDiagram` of the entity + direct neighbours
8. **Source ODR + ADR** — link targets only (no quoted text)

## Cross-tier traceability

Every Logical-tier entity maps 1:1 to:

- the Concept-tier file at `../concept/<module>/<entity>.md` (business-language narrative)
- one `owl:Class` URI in the Physical-Ontology tier (TBox specifics)
- one or more named graphs in the Physical-Database tier (deployment specifics)

The same `<module>/<entity>.md` path shape is used across all four tiers.

## Out of scope at this tier

- Business prose, hard cases, anti-pattern rationale → Concept tier
- Named-graph layout, derived profiles, BASPI5 overlay composition → Physical-Database tier
- OWL / SHACL / SKOS / Turtle syntax → Physical-Ontology tier

## Provenance

Generated from the 24 emitted TTLs at `source/03-standards/ontology/` per the IA spec at [`../../information-architecture/logical-model-ia.md`](../../information-architecture/logical-model-ia.md). The ODR corpus is the modelling-decision audit trail and is referenced as link targets only.
