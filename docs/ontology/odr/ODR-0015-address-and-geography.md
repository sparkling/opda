---
status: proposed
date: 2026-05-26
kind: pattern
tags: [address, geography, reuse, module, gate]
scope:
  - pdtf-v3:propertyPack.address
  - pdtf-v3:propertyPack.uprn
  - pdtf-v3:propertyPack.inspireId
  - pdtf-v3:propertyPack.titleAddress
  - pdtf-v3:propertyPack.marketingAddress
  - pdtf-v3:participants.address
  - pdtf-v3:energyEfficiency.certificate.address
  - pdtf-v3:chain.onwardPurchase.address
  - pdtf-v3:verifiedClaims.verification.evidence.document.issuer.address
council: scope-check-1
supersedes: []
depends-on: [ODR-0004, ODR-0005]
implements: [ODR-0003]
---

# Address & Geography

## Context

`Address` is the most-reused subject in the PDTF v3 corpus. The base schema and overlays touch it from at least five distinct contexts — property identification (with UPRN and INSPIRE Identifier), participant contact, evidence-document issuer, chain transactions, EPC certificate location — yet no current ODR declares it. Plan §4.1 routes "Address class location" as a shared question between ODR-0006 (Agents & Roles) and ODR-0008 (Property descriptive attributes); Scope-Check 1 (2026-05-26) ruled 8-1 that this is the wrong forum and that Address requires its own ODR.

The defect mirrors the implicit-Property defect that ODR-0005 cured: a heavily-reused entity with no declaring module produces three risks. (1) Three modules independently invent overlapping `Address` classes and a Phase-2 reconciliation has to merge them. (2) The most-cited URI gets fixed by the first consumer who happens to need it — the URI-persistence failure the W3C TAG explicitly warns against. (3) The relationship between physical address (where post is delivered), legal-title address (what the Land Registry holds), marketing address (how an agent presents the property), and INSPIRE Identifier (a spatial-feature pointer) is collapsed into one slot rather than modelled as the distinct things they are.

The hard question is not "what fields does an Address class carry?" but **what is an Address, ontologically?** Guarino's session-001 Q4 argument about UPRN ("a mode of presentation, not a bearer") applies here at one layer of remove. Three UFO readings are live: Address as **Kind** (a substance with its own identity criteria, independent of any Property it locates — the INSPIRE Address-as-feature position); as **Quale-in-a-Region** (a value in a spatial-presentation region, a structured datatype, no identity, no co-reference across rows — the present 0008 default); as **Mode** (a particularised property inhering in a Property Kind, no identity independent of it but reified enough to bear its own predicates). The three give different answers on multi-address properties, marketing-vs-title-address co-reference, and `uprn`-linked vs `inspireId`-linked records. The choice is gate-shaped: it cascades into ODR-0006 (participant addresses), ODR-0008 (property addresses), ODR-0009 (evidence-issuer addresses), ODR-0012 (DPV PII tags on address fields).

Geography is admitted in the same ODR. GeoSPARQL was deferred in ODR-0002; this ODR is the home for that deferral and for `geoX`/`geoY`/INSPIRE polygons / `titleExtents` GeoJSON / search polygons / plot boundaries when their consumers (overlays beyond BASPI5; Local Land Charges) enter scope.

## Decision

Declare **`opda:Address`** as a first-class endurant in its own module, distinct from `opda:Property` (ODR-0005), with co-existence patterns for the three reading-distinct surfaces (`titleAddress`, `marketingAddress`, INSPIRE-Identifier-linked) and `prov:wasDerivedFrom` succession over UPRN-linked vs UDPRN-linked vs free-text-with-postcode rows. The Kind-vs-Quale-vs-Mode question is the gate; the answer is exemplar-validated as in ODR-0005.

Geography (GeoSPARQL, INSPIRE polygons) is admitted in this ODR as an *interface*; encoded geometries land in module-specific overlays as consumers materialise.

## Rules

> **Scope-Check 1 verdict.** Vote 8-1 to spawn this ODR (Davis withdraw-conditional; Baker softer "flag-not-commit"; others spawn-mandatory). All `## Rules` below are *placeholder* — the substantive content lands when Session 015 ratifies the ODR. The plan slots Session 015 as a **Phase 2.6** Reduced Council between the IC gate (ODR-0005) and the Agents gate (ODR-0006).

**To be ratified by Session 015 (Reduced Council, Queen TBD):**

1. **UFO meta-category for `opda:Address`** — Kind, Quale-in-Region, or Mode? (Gate question; cascades into 0006/0008.)
2. **Identity criterion.** If Kind, what is the IC over `titleAddress` vs `marketingAddress` vs `inspireId`-linked rows? (Same shape as ODR-0005's IC discipline.)
3. **`opda:Address` class structure.** Structured datatype with `opda:line1`/`opda:line2`/`opda:postcode`/`opda:country`, or a class with property shapes?
4. **External alignment.** INSPIRE Identifier as contingent identifier (per UPRN pattern); `vcard:Address` for personal-contact use; OS AddressBook / Ordnance Survey AddressBase relations.
5. **GeoSPARQL deferral.** What is the *interface* (`opda:hasGeometry`) and what is the trigger for admitting GeoSPARQL encoded geometries?
6. **Co-reference shape.** SHACL co-reference shape across `titleAddress` / `marketingAddress` / `inspireId`-derived rows; when present and referring to the same instance, must agree. Where they disagree, data-quality finding, not modelling failure.
7. **PII tagging.** DPV co-annotation handoff to ODR-0012 (every Address bears `dpv-pd:Address`; some bear stricter category tags — depends on Q1).
8. **Reuse seams.** ODR-0006 participants reuse `opda:Address`. ODR-0008 property descriptive attributes reuse. ODR-0009 evidence-issuer addresses reuse. ODR-0012 PII annotations attach to the shared class.

**Convening constraints for Session 015.**

- **Format: Reduced Council.** Queen + DA + the UFO-category panel slice that matters (Guizzardi for the Kind/Quale/Mode framing; Gandon for the URI-architecture framing). One panel teammate beyond Queen+DA.
- **Queen TBD.** Guizzardi if the UFO-category framing is decisive; Gandon if the URI-architecture framing is decisive. The convening block resolves.
- **DA: Allemang** (working-ontologist pushback: "show me a consumer that fails if Address is a structured datatype").
- **Diagnostic exemplars** (per ODR-0004 exemplar policy): flat with no UPRN (newly converted from one freehold); listed building with title address ≠ marketing address; a property with INSPIRE Identifier but no UPRN (rural plot pre-first-registration).
- **MUST clear before Sessions 006 and 008.**

## Alternatives

- **Address-in-Foundation (Davis's withdraw-conditional position)** — declare `opda:Address` inside ODR-0004 as part of URI policy. Rejected by scope-check majority (7-1): Address has its own identity-criterion work that ODR-0004's Foundation scope (URI + graph separation) cannot carry; routing it into 0004 buries it under namespace concerns.
- **Routed to Session 006 (the current plan's §4.1 routing)** — Address class location decided in Agents & Roles. Rejected by scope-check (8-1): wrong forum (Guizzardi optimising for Kind/Role/Phase, not for INSPIRE/ISO 19160/OS AddressBase relations).
- **Routed to Session 008 (Property descriptive attributes)** — Address as a sub-section of property attrs. Rejected: orphans the four non-property consumers (participants, evidence issuers, EPC certificate, search authorities).

## Consequences

- ODR-0006 (Agents & Roles) consumes `opda:Address` declared here; the Q5 "Address class location" shared question (plan §4.1) is removed.
- ODR-0008 (Property descriptive attributes) consumes; the Address-attachment ambiguity for `propertyPack.address` / `titleAddress` / `marketingAddress` is settled here.
- ODR-0009 (Claims, Evidence & Provenance) consumes for evidence-issuer addresses.
- ODR-0012 (Data-Governance) attaches DPV PII tags here once; all consumers inherit.
- The IC question gates Sessions 006 and 008 in addition to ODR-0005's IC gate — two single-point gates in Phase 2.
- GeoSPARQL deferral (ODR-0002) now has an explicit home; re-opening reduces to amending this ODR rather than amending the catalogue.
- If Phase-2 admits encoded geometries (title extents, search polygons), the *interface* (`opda:hasGeometry`) declared here is the seam; the encoding lands in module-specific overlays.

## References

- Council methodology: [ODR-0001](./ODR-0001-linked-data-council-methodology.md).
- Programme anchor: [ODR-0003](./ODR-0003-pdtf-ontology-programme.md).
- Foundation: [ODR-0004](./ODR-0004-pdtf-ontology-foundation.md) (exemplar policy reused).
- Identity-crux precedent: [ODR-0005](./ODR-0005-property-land-identity-crux.md) (UPRN-as-contingent-identifier pattern; multi-class split).
- Downstream consumers: [ODR-0006](./ODR-0006-agents-and-roles.md), [ODR-0008](./ODR-0008-property-descriptive-attributes.md), [ODR-0009](./ODR-0009-claims-evidence-provenance.md), [ODR-0012](./ODR-0012-data-governance-layer.md).
- Deliberation provenance: [Scope-Check 1 — Programme cut](./council/scope-check-1-programme.md), Q7a. To be ratified by Session 015 (Phase 2.6 Reduced Council).
- External standards: INSPIRE Identifier (Annex I, Theme: Addresses); ISO 19160 (Addressing); OS AddressBase; OGC GeoSPARQL; `vcard:Address` (W3C vCard ontology).
- Source inputs: `pdtf-transaction.json` (address surfaces across 9+ leaf paths); data dictionary entries for `address`, `uprn`, `inspireId`, `titleAddress`, `marketingAddress`.
