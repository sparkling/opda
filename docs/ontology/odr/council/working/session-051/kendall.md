# Kendall (Queen) — session-051 working file

Citations: Kendall & McGuinness, *Ontology Engineering* (2019) Ch.3 ("relationships as first-class objects" vs attribute slots; "subject-of" is a first-class relationship, not a lineage attribute); FIBO relationship patterns.

## Opening

The §R1 endpoint-IC test is the discipline: an `owl:ObjectProperty` earns its place only where BOTH endpoints are +I first-class entities AND a worked competency query motivates the edge. Where PROV-O or `time:` already carries the navigation, we do NOT mint a parallel opda predicate.

- **Q1** Milestone→Transaction GATED (exemplar+query, both +I); NameChangeEvent→Person VALUE-SLOT (name −I; `prov:wasRevisionOf` carries it); UPRNSuccessionEvent RESIDUE-PENDING; LeaseExtensionEvent DEFERRED.
- **Q2** info-objects → use existing PROV (Comparable `prov:wasInformedBy` Valuation); do not mint an opda edge. *(revised in cross-talk — see below)*
- **Q3** LeaseTerm VALUE-SLOT (−I `time:ProperInterval`; OWL-Time §4 `hasBeginning`/`hasEnd`).
- **Q4** VerificationActivity→Claim/Evidence/AttachedDocument GATED-via-PROV (emit the ODR-0009-designed `prov:used`/`qualifiedAttribution`, +I endpoints).
- **Q5** Transaction→LegalEstate `concerns` GATED (both +I, exemplar exists); chain DEFERRED (no exemplar+query).
- **Q6** FOR rendering subClassOf (distinct style; FIBO mixed isA + association views).

## Cross-talk ruling (Queen)

**Concession to Moreau, by name.** PROV-O is silent on *aboutness*: `prov:specializationOf` (PROV-O §3) is entity→more-general-entity, not entity→subject. There is no PROV term for "this Survey *is about* Property X." My "PROV suffices" overstated PROV's reach — it suffices for derivation/influence, not topic. So `opda:aboutProperty` would NOT duplicate PROV; Moreau's rebuttal stands (the FIBO subject-of-is-first-class distinction I should have held).

**Q2 ruling — two edges, two dispositions:** Comparable→Valuation USE-EXISTING `prov:wasInformedBy` (no mint); aboutness Survey/Search/Comparable/NearbyFacility→Property — predicate justified (Moreau), but §R1 bar (b) unmet today (convener-verified ZERO exemplars). Name `opda:aboutProperty` in the residue register now, RESIDUE-PENDING, single shared gate condition (first exemplar + worked query → auto-promote to GATED). Records Moreau's point without minting a property no consumer exercises (meets Davis-DA's defer-until-consumer: named, not dropped).

**Chain ruling:** the session-047 "no exemplar" defer is stale (convener verified the exemplar exists; `dependsOnTransaction`/`chainMembers` USED-but-UNDECLARED). I move chain from DEFERRED → **RESIDUE-PENDING** (declare+gate when the recursion query text lands, not now).

Common thread for the ADR: **declare-and-gate** where a predicate is already *used* in an exemplar (`partOfTransaction`, `concerns`, chain on query); **use-existing-PROV** where PROV already carries the semantics (`wasInformedBy`, `used`); **register-and-defer** where the relation is sound but exemplar-less (`aboutProperty`). Never mint a parallel opda predicate for a relation PROV already names; never gate a predicate no exemplar exercises.

## Final votes
Q1: Milestone→Transaction GATED · NameChangeEvent VALUE-SLOT · UPRNSuccession RESIDUE-PENDING · LeaseExtension DEFERRED.
Q2: Comparable→Valuation USE-EXISTING-PROV · aboutness→Property RESIDUE-PENDING (`opda:aboutProperty`) · AttachedDocument→Property RESIDUE-PENDING.
Q3: LeaseTerm VALUE-SLOT.
Q4: VerificationActivity→Evidence/AttachedDocument GATED-via-PROV (`prov:used`) · qualifiedAttribution→Agent GATED.
Q5: `concerns` GATED · `dependsOnTransaction`/`chainMembers` RESIDUE-PENDING.
Q6: FOR (muted/optional toggle layer; isA visually separated from association edges).
