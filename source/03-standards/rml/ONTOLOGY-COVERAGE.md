# RML ↔ ontology coverage audit

> **SUPERSEDED — 2026-07-05.** The classification below (categories A/B/C,
> 296-resource / 66-predicate baseline) is a point-in-time snapshot from
> early in the gap-closing effort. The current, authoritative,
> mechanically-regenerable state is `build/final-gap.json` (regenerate with
> `python3 build/final_scope2.py` from this directory): **465/472
> schema-generated resources mapped (98.5%)**, all of category A's "real
> gaps" and all of category B's "ambiguous" classes have since been closed.
> The 7 remaining gaps (2 classes, 5 distinct properties) map onto what was
> category C here, re-verified against the FULL invariant JSON schema corpus
> (not just `pdtf-transaction.json`) and confirmed permanently out of RML's
> reach — see `gap-register.md`'s superseded-notice for the full current
> list and reasoning, and
> `HANDOVER-2026-07-05-rml-mapping-and-ontology-gap-closing.md` /
> `docs/adr/ADR-0057-rml-mapping-implementation.md`'s Amendments for the
> per-item detail, including several items this category C originally
> miscategorised as having no real JSON basis — `opda:NameChangeEvent`,
> `opda:LeaseExtensionEvent`, and the `verifiedClaims`-sourced cluster
> (`opda:evidenceType`/`opda:digest`/`opda:attestedBy`/`opda:Verifier`) all
> had real, structured JSON behind them and are now closed — plus one case
> (`opda:potentialCost`) where the ontology's own declared range, not the
> JSON, was the actual defect (a batch-decision oversight, now fixed).

Cross-references every resource (`owl:Class`, `owl:DatatypeProperty`,
`owl:ObjectProperty`) declared in `public/ontology/artefacts/opda-merged.ttl`
against what `mapping/opda-pdtf.rml.ttl` actually uses (`rr:class`,
`rr:predicate`). Superseded the earlier, weaker completeness claim, which was
scoped only to leaves occurring in the 4 test fixtures — this audit checks the
**full ontology surface**, not just test-data-driven coverage.

## RML → ontology (soundness) — unchanged, still holds

Every `rr:class` / `rr:predicate` the mapping uses exists in the ontology.
**Zero invented terms**, confirmed by direct extraction (not string-grep):

```
rml_classes_not_in_ontology:     []
rml_predicates_not_in_ontology:  []
```

## Ontology → RML (completeness) — the new, stronger check

| | count |
|---|---|
| Ontology classes | 40 |
| Ontology datatype properties | 226 |
| Ontology object properties | 30 |
| **Total ontology resources** | **296** |
| Classes used by the RML mapping (`rr:class`) | 11 (27.5%) |
| Predicates used by the RML mapping (`rr:predicate`) | 66 (25.8%) |

At face value, **~74% of the ontology has no RML mapping.** That number is
misleading taken alone — see the classification below, which splits it into
what's actually a gap vs. what cannot be an RML target by construction.

## Classification

A resource can only be an RML mapping target if PDTF JSON is where opda-gen
itself says the term came from — i.e. it (or, for classes, some property whose
domain/range is it) carries a `dct:source` anchor into the data dictionary
(`…/harness/data-dictionary/{leaf_path}`). That's the same ground-truth
inversion `provenance-index.json` already uses.

### A. REAL GAP — data-anchored, not yet wired (needs new TriplesMaps)

**6 classes**: `EPCCertificate`, `NearbyFacility`, `Proprietorship`,
`RiskAssessment`, `RoomDimension`, `Valuation`

**148 properties** (134 datatype + 14 object), grouped by JSON region:

| region | unmapped |
|---|---|
| `propertyPack.ownership` | 46 |
| `propertyPack.waterAndDrainage` | 14 |
| `valuationComparisonData` | 13 |
| `propertyPack.buildInformation` | 10 |
| `propertyPack.nearbyFacilities` | 10 |
| `propertyPack.localSearches` | 9 |
| `propertyPack.electricity` | 6 |
| `propertyPack.residentialPropertyFeatures` | 6 |
| `propertyPack.localAuthority` | 4 |
| 20 further regions (1–3 each) | 21 |
| `chain` | 1 |

This is the genuine, actionable gap: the current mapping was built to satisfy
4 test fixtures (a sale transaction), so entire regions the fixtures never
touch — titles/estates (`ownership`), drainage, comparables/valuation,
searches, nearby facilities — are completely unmapped even though opda-gen
anchored real predicates to them. **Full completeness requires closing this**,
which is a mapping-authorship task roughly 3× the size of the current
483-line RML file, not a quick fix.

### B. AMBIGUOUS — has some ontology connection, but not JSON-anchored

**7 classes**: `Address`, `Claim`, `DPVMappingRecord`, `Evidence`,
`Proprietor`, `RoleMixin`, `TransactionChain`

Each has ≥1 property with `rdfs:domain`/`rdfs:range` pointing at it, but none
of those properties carry a `dct:source` data-dictionary anchor. `Address` is
notable: `opda:hasAddress` (range `Address`) and `opda:addressVariant` (domain
`Address`) exist, but every address leaf actually anchored in the ontology
(`line1`/`town`/`postcode`/…) is bound **flat** onto the bearer (Person/
Property) per ODR-0008 §Q6a, not onto a minted `opda:Address` node — so
`Address` may be a declared-but-currently-unbound class by ontology design,
not an RML gap. Needs an ontology-side ruling per class, not a mapping fix.

### C. NO JSON SOURCE AT ALL — cannot be an RML target

**16 classes**, zero domain/range connections in the ontology at all:
`AssuranceLevel`, `Comparable`, `DiagnosticExemplar`, `GeneratorRun`,
`LeaseExtensionEvent`, `LeaseTerm`, `Milestone`, `NameChangeEvent`, `Relator`,
`Role`, `SpecialCategoryScheme`, `Survey`, `TrustFramework`,
`UPRNSuccessionEvent`, `ValidationContext`, `VerificationActivity`.

Pattern: most are `prov:Activity`/`prov:Entity`/`skos:ConceptScheme`
subclasses with no data properties at all — consistent with being populated
by SHACL-AF inference rules or by the ontology-generation harness itself
(release/audit/exemplar metadata), not extracted from a PDTF transaction
instance. **Not independently verified** which mechanism populates each one —
that would need per-class confirmation from the ontology owners. What IS
verified: no PDTF JSON leaf that opda-gen bound a term to reaches these
classes, so no RML mapping — sound by definition — could ever target them.
Asserting "every ontology resource must have an RML mapping" without this
carve-out would force fabricating source data that doesn't exist.

## Bottom line

- **Sound**, confirmed again: 0 invented terms.
- **NOT complete against the full ontology.** The previous "sound + complete"
  claim was accurate only for its stated, narrower scope (layer-1 leaves
  occurring in 4 test fixtures). Against the full ontology: 6 classes +
  148 properties are genuine, closeable gaps; 7 classes are ontology-design
  questions; 16 classes are architecturally out of RML's reach.
- Closing category A is a real, substantial next task (new TriplesMaps across
  ~30 JSON regions). Category B needs ontology-owner input before any mapping
  decision. Category C should not be mapped — there is nothing to map.
