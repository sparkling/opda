# Cagle (SHACL / facet design) — session-051 working file

Citations: W3C SHACL Core §2.3 (property shapes), §4.1 (`sh:class`), §4.6 (`sh:or`); ODR-0027 classification-over-inheritance (the facet-not-subclass spirit); "Taxonomies are not class hierarchies" (Cagle, *The Ontologist*).

## Opening (position held into synthesis — Q6 lead voice; no rebuttal required)

Type-pinning doctrine: documentary `rdfs:range` + a confirming `sh:class` property shape (the enforced gate, never entailed — ADR-0035); multi-bearer → repeated `rdfs:domain` "any-of" + `sh:or` over `sh:class` alternatives, never `owl:unionOf`.

- **Q1** Milestone→Transaction GATED — pin `opda:partOfTransaction` with `sh:targetClass opda:Milestone; sh:path opda:partOfTransaction; sh:class opda:Transaction; sh:maxCount 1; sh:nodeKind sh:IRI` (SHACL Core §2.3). LeaseExtension/UPRNSuccession/NameChange RESIDUE-PENDING (no competency query yet, no settled single bearer).
- **Q2** Info-objects GATED via ONE predicate `opda:aboutProperty`, `rdfs:domain` "any-of" over each, validated by a subject-guarded `sh:or` of `sh:class` alternatives (§4.6), `sh:targetSubjectsOf opda:aboutProperty`, `sh:class opda:Property; sh:nodeKind sh:IRI`. *(Cross-talk majority moved to RESIDUE-PENDING on the zero-exemplars bar-(b) ground — the SHACL pinning recipe above is the one to use when it gates.)*
- **Q3** LeaseTerm VALUE-SLOT — `time:hasBeginning`/`hasEnd` datatype path, not a class edge.
- **Q4** VerificationActivity GATED (`sh:path prov:used; sh:class AttachedDocument/InfoObject via sh:or; sh:minCount 1`); AttachedDocument GATED as that range target. *(Cross-talk: this is USE-EXISTING `prov:used` — the SHACL shape pins the PROV edge's co-domain; no opda predicate minted.)*
- **Q5** Transaction→LegalEstate GATED — `opda:concerns`, `sh:targetClass opda:Transaction; sh:path opda:concerns; sh:class opda:LegalEstate; sh:minCount 1`; chain DEFERRED (→ RESIDUE-PENDING per convener's exemplar verification).

## Q6 (lead) — render `rdfs:subClassOf`: FOR, muted-optional layer

ODR-0027 forbids *building* coded-facet concepts as subclass trees; it says nothing against *depicting* the handful of authored `subClassOf` edges and external `prov:`/`time:` supers. Per "Taxonomies are not class hierarchies," drawing a documented super-edge is description, not a modelling commitment — and SHACL targets are value-keyed (`sh:targetSubjectsOf`), so the diagram never implies enforcement-by-class. A separate **muted/optional** layer grouping orphan events under `prov:Activity` and info-objects under `prov:Entity` resolves "18 disconnected" honestly without inventing a taxonomy.
**Vote Q6: FOR — muted-optional-layer** (toggleable, de-emphasised hierarchy; never primary object-property edges).

## Final votes
Q1 Milestone→Transaction GATED; other events RESIDUE-PENDING. Q2 Survey/Search/Comparable/NearbyFacility→Property RESIDUE-PENDING (`opda:aboutProperty`, one subject-guarded `sh:or` shape). Q3 LeaseTerm VALUE-SLOT. Q4 VerificationActivity/AttachedDocument USE-EXISTING `prov:used` (SHACL-pinned co-domain). Q5 `concerns` GATED; chain RESIDUE-PENDING. Q6 FOR (muted-optional layer).
