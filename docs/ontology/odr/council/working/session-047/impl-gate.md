# ADR-0048 — `ci-object-property-coverage` gate: implementation design

**Engineer:** gate (team `adr48-impl`)
**Realises:** ADR-0048 work-item 4 (the gate, AS AMENDED by Council session-047)
+ ODR-0032 §R1/§Confirmation + session-047 Q2/Q5.
**Status:** implemented + unit-tested; CI/deploy wiring PROPOSED (team-lead applies).

This is the object-property analogue of how `ci-category-g-coverage` (ADR-0032)
gates the descriptive datatype-leaf layer. The descriptive layer got a walk
*and* a gate; this brings the relationship layer to parity.

---

## 1. Files

| File | Role |
|---|---|
| `tools/opda-gen/src/opda_gen/ci/object_property_coverage_test.py` | The gate: `CoverageReport` dataclass, pure `build_report()`, `run(ontology_dir)`, the SHACL-pin detection (`extract_shape_facts`) + class-graph extraction (`extract_object_property_facts`). |
| `tools/opda-gen/src/opda_gen/ci/competency_query_test.py` | Limb (c): the `R2_GATED_INVENTORY`, the `WORKED_QUERIES` map (one worked SPARQL SELECT per GATED §R2 edge), `run_competency()` over the combined exemplar graph. |
| `tools/opda-gen/src/opda_gen/inputs/object_property_residue.py` | The residue register (`RESIDUE_REGISTER`): predicate → `(disposition, reason)`. Modelled on `inputs/category_g_curation.COLLAPSED`. |
| `tools/opda-gen/src/opda_gen/cli.py` | `ci-object-property-coverage` command (`--ontology-dir`, `--strict`). |
| `tools/opda-gen/tests/test_object_property_coverage.py` | 24 unit tests incl. the positive controls. |

---

## 2. The gate logic (the four limbs, session-047-final)

Every opda: `owl:ObjectProperty` MUST be a DECLARED predicate whose co-domain is
type-pinned by EITHER `rdfs:range` OR a SHACL `sh:class`/`sh:node` value-type
shape. The gate FAILs on:

- **(a) rangeless-AND-shapeless** — no `rdfs:range` AND no SHACL value-type pin.
  NOT rangeless per se: `founds`/`mediates` are intentionally rangeless-in-OWL
  but SHACL-pinned (preserving "Design-time, NEVER reasoned", ODR-0029/0030/0031),
  so they PASS via the SHACL limb. **Corpus-wide** (every object property).
- **(b) not-universally-true `rdfs:domain`/`rdfs:range`** — a targeted check on
  the **subject-bearer** predicates (`hasName`/`hasAddress`): they MUST carry NO
  single `rdfs:domain` (bearer-typing → SHACL `sh:or`, else "every addressed
  Person is a Property" / "every name-bearing Organisation is a Person").
  **Corpus-wide** in principle, materialised as the council-named subject-bearer
  set. **`playedBy`/`hasParticipant` are EXCLUDED** — see §4 (interpretation 2).
- **(c) GATED §R2 edge with no worked competency query** — the ODR-0022 §G3
  coverage-by-test discipline. **Scoped to the §R2 inventory** (Council
  session-047): a GATED object property OUTSIDE §R2 (a descriptive value-slot
  edge like `opda:builtForm`) is NOT subject to it.
- **(d) malformed residue entry** — a register row with an empty/"TODO"
  disposition (collapse-by-silence is never available; ODR-0032 §R1).

**Two-graph separation (ODR-0013):** the class-graph dead-edge check (limb a +
the rangeless side) reads the module **class** TTLs; the shapes-graph bearer
check (the SHACL pin read + limb b) reads the `*-shapes.ttl` files. The two
graphs are read SEPARATELY — never unioned for this check.

**`build_report()` is pure** — it takes `(object-property facts, shape facts,
residue register, competency result)` and is unit-testable on hand-built rdflib
graphs without the live corpus (mirrors `build_coverage_report`). `run()` does
the I/O (parse class TTLs, parse shape TTLs, run the competency limb) then calls
`build_report()`.

### SHACL-pin detection (matches the emitter byte-for-byte)

`extract_shape_facts` recognises BOTH targeting patterns the emitter uses —
verified against the regenerated corpus:

1. `?shape sh:targetObjectsOf <pred>` + the shape carries `sh:class`/`sh:node`
   (the `founds` RangeShape form: `opda-agent-shapes.ttl` `sh:targetObjectsOf
   opda:founds`).
2. a property shape `?ps sh:path <pred>` carrying `sh:class`/`sh:node` directly,
   OR via an `sh:or`/`sh:and`/`sh:xone` member list (the `mediates`
   `ProprietorshipMediationShape` `sh:class opda:Proprietor`; the `playedBy`
   `sh:or ([sh:class Person][sh:class Organisation])` bearer disjunction).

A `sh:path` with only `sh:minCount` and no value type is NOT a pin — exactly the
`mediates` defect session-047 Q5 caught (and now fixed by the emitter).

---

## 3. Residue register contents (`RESIDUE_REGISTER`)

Seeded from the Council session-047 dispositions over the ODR-0032 §R2
inventory. Every entry is gate-checked (non-empty, non-"TODO" reason).

| Predicate (key) | Disposition | Reason (abridged) | Blocking |
|---|---|---|---|
| `hasName` | **VALUE-SLOT** | −I endpoint, no bearer-independent IC; served by the structured datatype path + SHACL `NameShape`, not an `owl:ObjectProperty` (session-047 Q3 strike). Promote-trigger corpus-verified not fired. | — |
| `Address` | **PENDING-upstream-IC** | `opda:Address` class/IC pending ODR-0015 (Mode-vs-Resource, ODR-0005 §6b). The `hasAddress` PREDICATE is extended + emitted (GATED); the gate must not manufacture an Address class (session-047 Q6). | ODR-0015 |
| `dependsOnTransaction` | **DEFERRED** | No GATED chain exemplar + worked query yet — ODR-0007 §S007-Q4 comment-ware (session-047 Q2 defers the chain pair only). | ODR-0007 |
| `chainMembers` | **DEFERRED** | (as above) | ODR-0007 |
| `baselineCategory` | **REFERENCE** | Co-domain is an external DPV-PD category IRI cited reference-not-import (ODR-0012/ODR-0018); intentionally un-ranged + un-pinned. Pre-existing, outside §R2. **See §4 interpretation 1.** | ODR-0018 |

`Disposition` enum: `VALUE_SLOT`, `PENDING_UPSTREAM_IC`, `DEFERRED`, `REFERENCE`.
(`GATED` is deliberately ABSENT — a gated edge is not residue; it is the emitted
corpus, detected by the gate against the TTLs.)

---

## 4. Two interpretation calls (flagged for ratification)

The council adjudicated the §R2 relationship inventory. Two findings fall just
outside what session-047 enumerated; I disposed them in the most council-faithful
way and surface them here rather than deciding silently.

**Interpretation 1 — `baselineCategory` is REFERENCE, not a limb-(a) failure.**
`opda:baselineCategory` (governance module, pre-existing, NOT in §R2) is an
`owl:ObjectProperty` with no `rdfs:range` and no SHACL pin **by design**: its
co-domain is an external DPV-PD category URI that ODR-0012 §Reference-not-import
/ ODR-0018 §Rule 4 deliberately do NOT import. The corpus-wide limb (a) catches
it. Rather than carve a syntactic exception into limb (a), I added a `REFERENCE`
disposition to the residue register: a well-formed REFERENCE entry excuses its
predicate from limb (a) (the exception is *recorded*, never silently excused; a
*malformed* REFERENCE entry is still a limb-(d) violation AND is not excused).
**Ratification ask:** is `REFERENCE` an acceptable fourth disposition, or should
`baselineCategory` instead be remodelled (e.g. `rdfs:range dpv:PersonalData` as
a cited-but-unimported class)? Either is a one-line change.

**Interpretation 2 — limb (b) "multi-bearer" = bearer-IS-SUBJECT only.**
ADR-0048 §4(b) names `hasName`/`hasAddress`/`playedBy` as multi-bearer. The
decisive session-047 Q5 anti-pattern is "`rdfs:domain opda:Person` on a
name/address predicate would entail every name/address-bearing Organisation is a
Person" — a **subject-side** disjunction (the bearer is the *subject* of
`hasName`/`hasAddress`). `playedBy`/`hasParticipant` have a **single,
universally-true subject** (`opda:Role` / `opda:Transaction`) and their
disjunction (Person∪Org / Seller∪Buyer) is on the **object** side, handled by
SHACL `sh:or`. §R1 says "rdfs:domain asserted ONLY where the subject-type
entailment is universally true" — which it IS for those two. So I restricted the
limb-(b) set to `{hasName, hasAddress}` and EXCLUDED `playedBy`/`hasParticipant`
— otherwise the gate would false-flag the emitter's legitimate `rdfs:domain
opda:Role` on `playedBy` and `rdfs:domain opda:Transaction` on `hasParticipant`.
**Ratification ask:** confirm this subject-vs-object reading of "multi-bearer".
(If the WG instead wants `playedBy`/`hasParticipant` domain-less too, drop two
`rdfs:domain` lines in the emitter and add them to `MULTI_BEARER_PREDICATES`.)

---

## 5. Competency-query coverage (honest)

Limb (c) runs one worked SPARQL SELECT per GATED §R2 edge against the combined
exemplar graph (TBox + every `exemplars/*.ttl` except the `*-expected-report.ttl`
SHACL reports), mirroring `inference_closure_test`'s in-process TBox+ABox load.

**`WORKED_QUERIES` covers** (the GATED, non-deferred §R2 edges): `founds`,
`foundedBy`, `mediates`, `playedBy`, `plays`, `hasRegisteredTitle`,
`hasParticipant`, `concernsProperty`, `hasEvidencedAuthority`, `hasAddress`.

**Honest partition reported** (covered / covered-via-inverse / deferred-to-register
/ uncovered):

- **covered** — the edge's own query returns ≥1 row against the exemplar ABox.
- **covered-via-inverse** — an edge declared `owl:inverseOf` an edge that is
  *covered* above is itself covered-via-inverse (**team-lead ruling on
  `opda:plays`**): it is the SAME relation in the other direction, so the
  inverse partner's data exercises it — the inverse query traverses it the other
  way. NOT a violation; recorded explicitly (`opda:plays→opda:playedBy`) so the
  coverage is honest/visible, and so the exemplar is NOT denormalised with a
  redundant explicit `plays` assertion. The gate reads `owl:inverseOf` from the
  TBox; covered-via-inverse only excuses an edge whose partner is ACTUALLY
  covered-by-query (if BOTH directions are absent, both are uncovered — no free
  pass; unit-tested both ways).
- **deferred** — a DEFERRED §R2 edge (the chain pair) is routed to the register
  and reported as deferred, NOT failed on an empty result (never a silent skip).
  NOTE: `chain-of-transactions.ttl` DOES carry `dependsOnTransaction`/
  `chainMembers` ABox today, but the Council deferred them at the *modelling*
  layer (no GATED worked-query acceptance yet), so the limb reports them deferred
  rather than gating on them; they graduate to GATED when a chain exemplar +
  worked query is ratified.
- **uncovered** — a GATED §R2 edge whose worked query returns empty AND is not
  covered-via-inverse (the edge is asserted but not retrievable) → limb-(c)
  violation. (This was the mid-regen state for the edges whose exemplar facets
  the emitter had not yet migrated; all green now.)

A GATED §R2 edge with NEITHER a worked query NOR a residue disposition NOR an
inverse-covered partner is reported uncovered (the gate refuses to pass an edge
it cannot retrieve and refuses to silently skip it). The live invariant
(unit-tested): every non-deferred §R2 edge HAS a worked query.

**Coverage is honest, not inflated:** the report enumerates covered vs deferred
vs uncovered by name. Nothing is silently skipped; the deferred edges are logged.

---

## 6. Positive controls (unit-tested, brief requirement)

- `test_rangeless_and_shapeless_is_a_violation` — a rangeless-AND-shapeless
  property MUST produce a violation. **PASS.**
- `test_rangeless_but_shacl_pinned_passes` — a rangeless-but-SHACL-pinned
  property MUST pass via the SHACL limb. **PASS.**
- plus: range-pinned-via-OWL passes; subject-bearer-with-domain violates;
  `playedBy`/`hasParticipant` with domain passes; malformed residue violates;
  REFERENCE excuses limb (a); malformed REFERENCE is NOT excused; competency-empty
  violates; both SHACL patterns (`sh:targetObjectsOf`, nested `sh:path`+`sh:or`)
  detected; `sh:path`+`sh:minCount`-only is NOT a pin.

24/24 tests pass.

---

## 7. Verification against the final re-emitted corpus — FULLY GREEN

The gate is RUNNING and PASSING against the final corpus. Through the
regeneration it caught — and as the emitter converged, cleared — exactly the
right defects. **End state: `ci-object-property-coverage --strict` exits 0;
9/9 §R2 competency edges covered; 0 uncovered; `baselineCategory` EXEMPT line
surfaced.** The progression (each a real catch the gate made, then the emitter
fixed):

- ✅ caught `founds`/`mediates` rangeless-AND-shapeless (the session-047 Q5
  "first real catch"); CLEARED via the emitter's `sh:class` + subject-guard.
- ✅ caught `hasAddress` `Property`-only `rdfs:domain` (limb b); CLEARED after
  the emitter dropped it.
- ✅ caught `opda:plays` rangeless-AND-shapeless (the inverse of `playedBy`, a
  genuine defect — it was emitted with no range and no pin); CLEARED via the
  emitter's `PlaysRangeShape` (`sh:targetObjectsOf opda:plays` + `sh:class
  opda:Role`).
- ✅ caught all 7 §R2 edges uncovered-by-query (the coverage-by-test bar working
  — the exemplars used undeclared orphan predicates; see §7a); CLEARED after the
  emitter migrated the exemplar ABox to the ratified predicates + re-pinned the
  expected-reports.
- ✅ `baselineCategory` excused via REFERENCE (recorded, surfaced in the banner).
- ✅ no false-flag on `playedBy`/`hasParticipant` `rdfs:domain` (interpretation 2).

Reviewer independently verified (non-rubber-stamp): planted a rangeless+shapeless
object property in `opda-property.ttl` (non-§R2) → limb (a) flagged it (corpus-wide
scope proven); injected `rdfs:domain opda:Person` on `hasAddress` → limb (b)
flagged it; removed `baselineCategory`'s disposition → gate flags it (REFERENCE
is not a free pass); watched the mid-regen run correctly FAIL with 7 limb-(c)
violations before the exemplar migration.

### 7a. ORPHAN-PREDICATE FINDING — RESOLVED

The 7 (initially) uncovered §R2 edges were NOT merely "exemplar facets not yet
regenerated" — the committed exemplars used **orphan legacy predicates that were
NOT declared as object properties anywhere in the TBox**, so they never exercised
the ratified relationship layer:

| Exemplar orphan predicate (was undeclared) | Ratified §R2 predicate (now used) |
|---|---|
| `opda:rolePlayer` | `opda:playedBy` |
| `opda:concerns` (→ estate) | `opda:concernsProperty` (→ Property) |
| `opda:partOfTransaction` | `opda:founds` / `opda:hasParticipant` |
| `opda:proprietorshipOf` | `opda:hasRegisteredTitle` |

A latent defect *independent of the gate* (ADR-0048 §5 requires the diagnostic
exemplars to "gain participant-relationship facets that validate against the new
role-play/relator shapes"). Limb (c) surfaced it (the coverage-by-test bar
working as designed). **Resolution (DONE):** the **emitter** (team-lead's
ownership ruling — it touches the byte-identity + `emit-exemplar-reports`
pipeline) migrated the exemplar ABox to the ratified predicates, added an
`opda:plays` ABox edge in `simple-transaction-with-milestones.ttl` (making the
inverse genuinely navigable per its "query from either end" rationale), and
re-pinned the expected-reports. The gate flipped all those edges green
automatically; the worked queries matched the ratified predicates byte-for-byte.

(Residual, NOT in this gate's scope: the exemplars *retain* the legacy
`opda:concerns`/`opda:partOfTransaction` predicates alongside the ratified ones
— these are still undeclared in the TBox. That is an ABox-hygiene concern for
undeclared predicates, orthogonal to this gate, which gates the *declared*
object-property layer + its retrievability. Flagged for a possible follow-on,
not a blocker.)

---

## 8. PROPOSED wiring (team-lead applies — deploy-critical config)

The gate needs NO gitignored input (reads only the committed corpus +
exemplars), so — unlike `ci-category-g-coverage` (local-only, needs the
gitignored data dictionary) — it CAN and SHOULD run in CI under `--strict`.

### 8a. `Makefile` — `ci-ontology` target (after the `ci-baspi5-roundtrip` line, ~line 105)

```make
	$(OPDA_GEN) opda-gen ci-baspi5-roundtrip --ontology-dir ../../$(ONTOLOGY_DIR)
	$(OPDA_GEN) opda-gen ci-object-property-coverage --strict --ontology-dir ../../$(ONTOLOGY_DIR)
	$(MAKE) verify-ontology
```

Also update the target's doc comment (line 100) to list the new gate:
`## All opda-gen CI gates (byte-identity, three-graph, dup, profile, baspi5, object-property-coverage) — mirrors the GH workflows`

### 8b. `.github/workflows/ontology-byte-identity.yml` (the three-graph surface; after the `ci-profile-contract` step, ~line 173)

```yaml
      - name: Object-property coverage CI (ADR-0048)
        working-directory: tools/opda-gen
        run: opda-gen ci-object-property-coverage --strict --ontology-dir ../../source/03-standards/ontology
```

### 8c. `.github/workflows/deploy-aws.yml` (after `npm run build:data`, before the model doc-drift gate, ~line 78)

```yaml
      # ADR-0048 — relationship-layer object-property coverage gate. Fail the
      # deploy if any owl:ObjectProperty is rangeless-AND-shapeless, a
      # subject-bearer predicate carries a not-universally-true rdfs:domain, the
      # residue register is malformed, or a GATED §R2 edge is not retrievable by
      # its worked competency query.
      - name: Object-property coverage gate (ADR-0048)
        working-directory: tools/opda-gen
        run: opda-gen ci-object-property-coverage --strict --ontology-dir ../../source/03-standards/ontology
```

(Place it alongside the other ontology gates. It runs in seconds, no Fuseki/JDK
dependency — it is a static rdflib check over the committed TTLs + exemplars.)

### 8d. Note on `make ci` / `ci-ontology`

`ci-ontology` already runs `pytest -q`, which picks up
`tests/test_object_property_coverage.py` automatically (24 tests). The explicit
`--strict` subcommand in 8a is the corpus-level gate (the analogue of the other
explicit `ci-*` subcommands); pytest covers the pure logic.

---

## 9. Honest status summary for team-lead

- Gate logic: **complete**, all four limbs implemented exactly per session-047.
- Positive controls: **pass** (rangeless-AND-shapeless violates; SHACL-pinned
  passes).
- SHACL detection: **matches the emitter byte-for-byte** (both targeting
  patterns verified against the regenerated corpus).
- Residue register: **seeded + well-formed** (5 entries, gate-checked).
- Competency coverage: **honest** — covered/deferred/uncovered enumerated by
  name; the chain pair deferred-and-logged; the currently-uncovered edges clear
  automatically when the emitter's exemplar facets land.
- Two ratifiable interpretation calls surfaced (§4) — neither blocks; both are
  one-line reversals.
- CI/deploy wiring: **proposed, not applied** (§8) — team-lead owns deploy
  config.
- Unit tests: **24/24 pass.**
