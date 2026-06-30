# Allemang (pragmatic / coverage-by-test) — session-051 working file

Citations: *Semantic Web for the Working Ontologist* 3rd ed. Ch.6 ("Modelling for reuse" — a model earns its keep by the queries it answers), Ch.10 (OWL-Time intervals as values), Ch.12 ("SPARQL-driven validation" — the test is the artefact, not a claim one is writable), Ch.5 (RDFS inference made visible); schema.org `domainIncludes` prior art.

## Opening

Every candidate is either exemplified or PROV-designed, so the disconnection is a *navigability* defect, not cosmetic. Opening voted GATE broadly (incl. info-objects on "the query is obvious").

## Cross-talk FINAL — conceded I mis-applied my own bar

I verified the convener's fact: zero exemplars type any of Survey/Search/Comparable/NearbyFacility as a subject; Milestone/Transaction/`concerns` do. **Bar (b) is coverage-*by-test*, not coverage-by-assertion** — when I folded §G3 into §R1 at session-047, the discipline was a *committed* worked query over a *committed* exemplar (*SWWO* Ch.12), not "obviously writable." So for the four info-objects bar (b) is unmet today. Honesty about my own confusion: I concede.

**(1) Info-objects → RESIDUE-PENDING, not DEFERRED.** Guarino + Davis are right on the bar; but RESIDUE-PENDING is correct because Moreau's point holds — PROV's `wasGeneratedBy`/`wasInformedBy` carry *generation*, not *aboutness*, so a subject→Property edge IS warranted, just unexercised. Register `opda:aboutProperty` (Survey/Search/Comparable/NearbyFacility → Property) with reason "no committed info-object exemplar+query"; gate the instant a consumer commits one (§R1 register requires named disposition+reason — no collapse-by-silence).

**(2) Milestone→Transaction & `concerns` clear bar (b); the info-objects don't — engaging Guarino.** `partOfTransaction` appears five times in `simple-transaction-with-milestones.ttl`, `concerns`/`concernsProperty` in two exemplars — a query is committable against *existing* triples. The four info-objects have +I endpoints but no committed subject to query over — exactly Guarino's distinction: identity-warranted ≠ retrieval-exercised. Declare+gate the predicates (in the ABox, undeclared in the TBox); don't mint.

**(3) Comparable→Valuation + chain.** Comparable→Valuation = USE-EXISTING `prov:wasInformedBy` (ODR-0008d Rule 3; `opda-descriptive.ttl:28`) — do not mint; it rides the register only for its *Property* aboutness edge. Chain: my "no exemplar" defer is stale (`dependsOnTransaction` exercised in `chain-of-transactions.ttl`); move to RESIDUE-PENDING, gated on the committed recursion query ("all transactions upstream of T_C").

## Final votes
Q1 Milestone→Transaction GATED; LeaseExtensionEvent GATED; UPRNSuccessionEvent GATED; NameChangeEvent DEFERRED. *(Allemang holds the lease/UPRN events at GATE on their exemplified `appliesTo`/`updatesRegistryRecord`/`wasDerivedFrom` predicates; the panel majority lands these at RESIDUE-PENDING — see synthesis.)*
Q2 Comparable→Valuation GATED-reuse-PROV (`prov:wasInformedBy`); Survey/Search/Comparable/NearbyFacility→Property RESIDUE-PENDING (`opda:aboutProperty`).
Q3 LeaseTerm VALUE-SLOT.
Q4 VerificationActivity→Evidence GATED-reuse-PROV (`prov:used`, ODR-0009 §62); AttachedDocument GATED-reuse-PROV.
Q5 `concerns` GATED; chain RESIDUE-PENDING.
Q6 FOR.
