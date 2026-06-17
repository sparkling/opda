# ADR-0048 — Emitter implementation log (TBox + SHACL + corpus regeneration)

**Engineer:** emitter (team adr48-impl)
**Scope:** the relationship-layer object-property emitters, the role-play/relator
SHACL shapes, the `hasAddress` predicate extension, and the corpus regeneration.
Realises [ODR-0032](../../ODR-0032-relationship-layer-object-properties.md) §R2 /
[ADR-0048](../../../../adr/ADR-0048-relationship-emission-walk-and-object-property-coverage-gate.md)
Phases 1–3 + 5, exactly as amended by Council session-047. The gate (Phase 4
`ci-object-property-coverage`) is the `gate` teammate's; the residue register is
theirs.

## Files changed (generator source)

| File | Change |
|---|---|
| `tools/opda-gen/src/opda_gen/emitters/modules/agent.py` | + `opda:playedBy` / `opda:plays` / `opda:hasRegisteredTitle` object properties; `OBJECT_PROPERTIES` tuple extended; `founds`/`mediates` left rangeless + "NEVER reasoned" comments PRESERVED (no change to them); module `owl:versionIRI` 1.0.0 → 1.1.0. |
| `tools/opda-gen/src/opda_gen/emitters/modules/transaction.py` | + `opda:hasParticipant` / `opda:concernsProperty`; `OBJECT_PROPERTIES` extended; `owl:versionIRI` 1.0.0 → 1.1.0. |
| `tools/opda-gen/src/opda_gen/emitters/modules/property.py` | `opda:hasAddress` — DROPPED `rdfs:domain opda:Property`; KEPT `rdfs:range opda:Address`; comment updated; `owl:versionIRI` 1.0.0 → 1.1.0. |
| `tools/opda-gen/src/opda_gen/emitters/shapes.py` | + `_sh_class_or()` helper (builds an `sh:or` of `[sh:class C]` disjuncts); `ProprietorshipMediationShape` gains `sh:class opda:Proprietor`; + `FoundsRangeShape`, `RelatorSpineSubjectShape`, `RolePlayShape`, `SellerShape`, `BuyerShape`, `PlaysRangeShape` (agent); + `HasParticipantRangeShape` (transaction); + `HasAddressBearerShape` (property). `_ODR_0015_S3A` source ref added. |
| `tools/opda-gen/src/opda_gen/__init__.py` | `__version__` 1.0.1 → 1.0.2 + changelog entry. |

## New predicate inventory (for the gate / reviewer)

All terms in `https://opda.org.uk/pdtf/` (prefix `opda:`).

| Predicate | `rdfs:domain` | `rdfs:range` | Co-domain type-pin | Notes |
|---|---|---|---|---|
| `opda:playedBy` | `opda:Role` | — (none) | SHACL `sh:or [Person,Organisation]` (RolePlayShape/Seller/BuyerShape) | OPTIONAL/distinct-node-only; `owl:inverseOf opda:plays` |
| `opda:plays` | — | — | SHACL `sh:class opda:Role` (PlaysRangeShape) | inverse of playedBy |
| `opda:hasRegisteredTitle` | `opda:Proprietorship` | `opda:RegisteredTitle` | rdfs (single-domain, no never-reasoned) | |
| `opda:hasParticipant` | `opda:Transaction` | — (none) | SHACL `sh:or [Seller,Buyer]` (HasParticipantRangeShape) | |
| `opda:concernsProperty` | `opda:Transaction` | `opda:Property` | rdfs (single-domain) | |
| `opda:founds` | — (kept) | — (kept) | SHACL `sh:class opda:Role` (FoundsRangeShape) + RelatorSpineSubjectShape | "NEVER reasoned" preserved |
| `opda:mediates` | — (kept) | — (kept) | SHACL `sh:class opda:Proprietor` (ProprietorshipMediationShape) + RelatorSpineSubjectShape | "NEVER reasoned" preserved |
| `opda:hasAddress` | **dropped** | `opda:Address` (kept) | SHACL `sh:or [Property,Person,Organisation]` (HasAddressBearerShape) | bearer-extended per Q6 |

**DEFERRED (NOT emitted):** `opda:dependsOnTransaction`, `opda:chainMembers` — gate's residue register.
**STRUCK (not emitted):** `opda:Name` class, `opda:hasName` object property.

## New SHACL shape inventory (all `https://opda.org.uk/pdtf/shape/`)

- `ProprietorshipMediationShape` — EXTENDED: `sh:class opda:Proprietor` added to the `opda:mediates` property node (was `sh:minCount 2` only). → `opda-agent-shapes.ttl`
- `FoundsRangeShape` — `sh:targetObjectsOf opda:founds` + `sh:class opda:Role`. → agent-shapes
- `RelatorSpineSubjectShape` — `sh:targetSubjectsOf opda:founds, opda:mediates` + `sh:class opda:Relator` (subject-guard). → agent-shapes
- `RolePlayShape` — `sh:targetSubjectsOf opda:playedBy` + `sh:property[sh:path playedBy ; sh:or [Person,Organisation]]`. → agent-shapes
- `SellerShape` / `BuyerShape` — `sh:targetClass opda:Seller`/`opda:Buyer` + `sh:property[sh:path playedBy ; sh:or [Person,Organisation]]`. OPTIONAL. → agent-shapes
- `PlaysRangeShape` — `sh:targetObjectsOf opda:plays` + `sh:property[sh:path plays ; sh:class opda:Role]`. → agent-shapes
- `HasParticipantRangeShape` — `sh:targetObjectsOf opda:hasParticipant` + `sh:or [Seller,Buyer]` (on the node shape). → `opda-transaction-shapes.ttl`
- `HasAddressBearerShape` — `sh:targetSubjectsOf opda:hasAddress` + `sh:or [Property,Person,Organisation]` (on the node shape). REPLACES the dropped `hasAddressDomainShape`. → `opda-property-shapes.ttl`

Auto-derived (ODR-0029 R3 `build_domain_range_constraint_shapes`, → `opda-shapes.ttl`):
`hasRegisteredTitleDomainShape`+`RangeShape`, `concernsPropertyDomainShape`+`RangeShape`,
`hasParticipantDomainShape`, `playedByDomainShape`; `hasAddressRangeShape` retained;
**`hasAddressDomainShape` REMOVED** (its `rdfs:domain` was dropped).

## SHACL-design correctness fix (caught during regeneration)

First emit produced a **false-positive `sh:Violation`** on `HasAddressBearerShape`
and `HasParticipantRangeShape`: the class-union `sh:or` was nested inside a
`sh:property [sh:path …]`, so SHACL applied it to the **value nodes** (the Address
/ participant objects) instead of the **focus node** (the bearer / the participant
itself). Every well-typed `opda:Property` bearer of `hasAddress` in the exemplars
was reported non-conformant (verified on `flat-no-uprn-newly-converted` +
`baspi5-conformant`). **Fix:** for focus-node class-union typing the `sh:or` goes
**directly on the NodeShape** (focus reached via `sh:targetSubjectsOf` /
`sh:targetObjectsOf`), mirroring `RelatorSpineSubjectShape`. The `playedBy`
shapes were already correct (there the value-node IS the bearer). After the fix,
**zero exemplar expected-report drift** (only version-header lines change).

## Verification (in-scope)

- `opda-gen emit` + `emit-foundation` + `emit-shapes` + `emit-exemplar-reports`
  run clean; **re-emitted 3×, byte-identical** (deterministic).
- `opda-gen ci-byte-identity` → PASS.
- `opda-gen ci-three-graph` → PASS (8 checks; shapes stay in the shapes graph).
- `opda-gen ci-dup-declaration` → PASS (every new term in one module).
- `opda-gen ci-inference-closure` → PASS (object properties + dropped domain +
  inverseOf all OWL-RL-safe).
- `opda-gen ci-object-property-coverage` → limbs (a)/(b)/(d) GREEN; 68 GATED edges
  type-pinned. **Limb (c) RED** — see below (not a type-pinning defect).
- New SHACL shapes fire on **no existing exemplar** (verified): the proprietorship
  exemplar's `mediates`/`Proprietor`/`Relator` satisfy the new `sh:class`
  guards; all `hasAddress` bearers are `opda:Property` ∈ the bearer `sh:or`.

## Open items requiring a team decision

### Exemplar ABox migration (ADR-0048 §5 — team-lead assigned, DONE)

Each orphan predicate mapped to the **semantically correct** ratified predicate
(NOT force-fitted):

- `simple-transaction-with-milestones.ttl`: `rolePlayer`→`playedBy` (both roles);
  added `transaction founds/hasParticipant {seller,buyer}-role`,
  `concernsProperty property`, and `seller-person plays seller-role` (explicit
  inverse — the competency limb runs WITHOUT inference, so `?s opda:plays ?o`
  needs an asserted triple). KEPT `mediates` (relator spine) + `concerns`→estate.
- `proprietorship-relator-multi-proprietor.ttl`: `rolePlayer`→`playedBy`;
  `proprietorshipOf`→`hasRegisteredTitle` (mediates already present).
- `claim-with-document-evidence.ttl`: added a `seller-role a opda:Seller` Patricia
  plays, `hasEvidencedAuthority` → the probate authority `opda:Claim` (ODR-0006
  §Q4 capacity/authority seam).

**`opda:partOfTransaction` NOT mapped** (team-lead caveat honoured): it is
`milestone → transaction` (a perdurant/part relation), NOT a §R2 inter-entity
edge. Left as the legitimate non-§R2 orphan it is. `concerns`→estate likewise
retained (a distinct Transaction→LegalEstate relation, not `concernsProperty`).

Result: `ci-object-property-coverage` limb (c) **GREEN** (9 covered, 0 uncovered).
The 3 edited exemplars' expected-reports re-pinned with **no new SHACL
violations** (paired `claim`/`proprietorship` expected-reports byte-unchanged
besides the version header).

### Correction during exemplar validation — `playedBy` had a wrong `rdfs:domain`

Adding `playedBy` to the Seller-role exemplars surfaced that my initial
`opda:playedBy rdfs:domain opda:Role` was **wrong**: `opda:Seller`/`opda:Buyer`
are `rdfs:subClassOf opda:RoleMixin`; only `opda:Proprietor` is `subClassOf
opda:Role`. `Role` and `RoleMixin` are **siblings** (ODR-0006 §Q2), so
`rdfs:domain opda:Role` was NOT universally true and the auto `playedByDomainShape`
fired `sh:Violation` on every Seller/Buyer role. **Fix:** dropped `playedBy`'s
`rdfs:domain`; added `opda:RolePlaySubjectShape` (`sh:targetSubjectsOf
opda:playedBy` + `sh:or [Role, RoleMixin]`); widened `PlaysRangeShape`'s
co-domain `Role` → `sh:or [Role, RoleMixin]`. Same
only-assert-`rdfs:domain`-where-universally-true rule the council mandated.

### `test_modules.py` reconciliation

`test_module_has_owl_ontology_header` hardcoded `1.0.0` per module → replaced with
a `_MODULE_VERSION_IRI` map (agent/transaction/property → 1.1.0; rest → 1.0.0).
All 389 opda-gen tests pass.

### Final gate/test state

`ci-byte-identity` PASS · `ci-three-graph` PASS (8) · `ci-dup-declaration` PASS ·
`ci-inference-closure` PASS · `ci-object-property-coverage` **PASS** (limb c
green) · `ci-baspi5-roundtrip` PASS · 389/389 pytest. Re-emitted twice →
identical (deterministic).

## Open item requiring a team decision

1. **`profiles/rds.ttl` silent-loss side effect (latent `profiles.py` bug,
   ADR-0029).** Dropping `hasAddress`'s `rdfs:domain` makes the `rds` overlay
   ENUMERATOR (`_build_enumerated_shapes_for`) bind the `propertyPack/address`
   leaf to a `None` target class: it counts the leaf "bound" in the header
   coverage string but emits NO shape (rdflib drops the `sh:targetClass None`
   triple) — a SILENT loss that violates the emitter's own "GAPped leaves are
   named in the gap register" contract. `bind()` succeeds before the domain is
   checked, so the existing `no-domain` GAP branch is dead code for this case.
   **`baspi5.ttl` is UNAFFECTED** (its `Baspi5_PropertyShape` binds `hasAddress`
   via the hand-curated path with an explicit `sh:targetClass opda:Property`, not
   `rdfs:domain`). This is an ADR-0029 profile-emitter concern outside my
   ADR-0048 emitter scope; flagged to team-lead. Options: (a) teach the
   enumerator to classify a domainless bound predicate as a real GAP (so it's
   named, not silently dropped); (b) bind domainless predicates via the SHACL
   bearer union; (c) accept the `rds` address-leaf GAP and fix the header
   count. NOT fixed unilaterally (would touch profiles.py + change rds.ttl
   semantics).
