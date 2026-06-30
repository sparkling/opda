# Guarino (OntoClean / DOLCE) — session-051 working file

Citations: Masolo, Borgo, Gangemi, Guarino, Oltramari, *The WonderWeb Library of Foundational Ontologies* D18 (2003) §4.2 (non-physical endurant; quality-region), §4.4 (perdurant); Guarino & Welty, OntoClean (2002/2009) — identity/rigidity meta-properties. (Author of the §R1 endpoint-IC rekey, session-047, carried 7–0.)

## Opening

I apply §R1 strictly: the gate is endpoint-IC + a worked SPARQL query, never source-containment, never a −I value path. Opening leaned DEFERRED on the events/info-objects (no exemplar+query) and VALUE-SLOT on LeaseTerm/NameChangeEvent.

## Cross-talk FINAL — moved on the verified facts

Convener fact verified against the corpus: `opda:partOfTransaction` is asserted on five Milestones (`simple-transaction-with-milestones.ttl:93–172`) and `opda:concerns` on Transactions (`chain-of-transactions.ttl:46–57` → titles; `simple-transaction-with-milestones.ttl:82` → estate), **neither declared** in the gated TBox. These are *dangling committed edges*, not new reifications — the act is declare+gate, and my over-reification guard does not bite. I move on both.

**(1) Milestone→Transaction & `concerns`: DEFERRED/RESIDUE-PENDING → GATED.** Allemang's own §G3 standard is the hinge: ODR-0022 §G3 gated against *a committed worked query*, not a hypothetical. My session-047 bar was "no exemplar+query yet"; that ground has moved (exemplar committed; convener commits the query). Endpoints satisfy §R1(a): Milestone is a DOLCE perdurant (+I temporal IC, D18 §4.4), Transaction a +I Relator, `concerns`' verified objects (`title-*`/`estate`) are RegisteredTitle/LegalEstate (+I non-physical endurants, D18 §4.2). A declared-but-undeclared edge is exactly the `founds`/`mediates` rangeless defect §R1's type-pinning targets; leaving it undeclared is worse. Declare with documentary `rdfs:domain`+`rdfs:range` (session-050) AND SHACL `sh:class` + subject-guard.

**(2) Q2 info-objects: DEFERRED → RESIDUE-PENDING.** I accept Moreau: PROV is silent on aboutness (`wasInformedBy` records derivation, not subject-matter), so an about-relation IS warranted and must not be silently dropped. But bar (b) is genuinely unmet — zero exemplars, zero query — so it cannot be GATED without manufacturing the motivating data (the §R1(b) violation I exist to block). "Warranted edge, no committed consumer yet" = RESIDUE-PENDING with named predicate + reason, not bare DEFERRED. Survey/Search/Comparable are +I extrinsic-IC Information Objects (ODR-0008d); they graduate the moment an exemplar+query lands. **NearbyFacility stays VALUE-SLOT** — its tie is `opda:distanceInMiles`, a −I quality, not an about-edge.

**(3) LeaseTerm & NameChangeEvent VALUE-SLOT — confirmed.** `opda:LeaseTerm rdfs:subClassOf time:ProperInterval` is a DOLCE temporal/quality-region (−I; D18 §4.2). NameChangeEvent re-describes the −I name STRUCK at session-047; the corpus already names the +I Person via `prov:wasAssociatedWith`.

## Final votes
Q1 Milestone→Transaction GATED; LeaseExtension DEFERRED; UPRNSuccession DEFERRED; NameChangeEvent VALUE-SLOT.
Q2 Survey/Search/Comparable RESIDUE-PENDING (`opda:aboutProperty`); NearbyFacility VALUE-SLOT (`distanceInMiles`).
Q3 LeaseTerm VALUE-SLOT.
Q4 VerificationActivity DEFERRED (PROV subject-tie suffices); AttachedDocument DEFERRED (evidence already carried by role-via-`opda:evidenceType`, ODR-0027 §R6 / ODR-0024 R7).
Q5 `concerns` GATED; `concernsProperty` GATED (already conformant); chain DEFERRED (no chain query yet).
Q6 FOR (subsumption is genuine connectivity; defuses the false motive to mint edges for graph-cosmetics).
