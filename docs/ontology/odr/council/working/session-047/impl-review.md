# ADR-0048 / ODR-0032 Implementation Review (adversarial)

**Reviewer:** adversarial reviewer (team adr48-impl)
**Date:** 2026-06-17
**Status:** IN PROGRESS — baseline captured; awaiting re-emitted corpus from "emitter" + gate from "gate".

Ground truth: `docs/ontology/odr/ODR-0032-...md` (§R1 amended, §R2 dispositions, §Decision detail, §Confirmation); `docs/adr/ADR-0048-...md` (Implementation Plan AS AMENDED); `docs/ontology/odr/council/session-047-...md` (Q1–Q6 + DA scorecard).

Method: verify every claim at file:line against the real corpus + opda-gen source. Do NOT trust summaries. The project has twice shipped agent "green" that hid real defects.

---

## BASELINE (pre-implementation) — verified at file:line, working tree @ ddd723e

Captured before any emitter change (tasks #1–#5 still pending/just-started). This is the BEFORE state every AFTER claim is diffed against.

### Council corpus claims — independently re-verified (all TRUE)

| Council claim | Verified | Evidence |
|---|---|---|
| `opda:founds` rangeless + "Design-time, NEVER reasoned" | TRUE | `opda-agent.ttl:192-196`: `owl:ObjectProperty`, no `rdfs:domain`/`rdfs:range`; comment cites ODR-0030 Rule 1 / ODR-0031 |
| `opda:mediates` rangeless + "NEVER reasoned" | TRUE | `opda-agent.ttl:214-218`: `owl:ObjectProperty`, no domain/range; comment cites ODR-0029/0031 |
| `ProprietorshipMediationShape` has `sh:minCount 2` but NO `sh:class` on object ("range-unpinned in both graphs") | TRUE | `opda-agent-shapes.ttl:59-63` → blank `_:b107f8e173fa2` (`:81-85`): `sh:path opda:mediates` + `sh:minCount 2`, no `sh:class` |
| `opda:playedBy`/`opda:plays` absent | TRUE | grep: zero matches in any class-graph TTL |
| `opda:hasEvidencedAuthority` is the lone real inter-class edge | TRUE | `opda-agent.ttl:206-212`: domain Seller, range Claim |
| `hasAddress` has `Property`-only `rdfs:domain` | TRUE | `opda-property.ttl:704-710`: `rdfs:domain opda:Property` + `rdfs:range opda:Address` |
| `NameChangeEvent` names the Person (string-literal names), promote-trigger NOT fired | TRUE | `opda-agent.ttl:34` event; `opda-agent-shapes.ttl:33-39` IdentifierSuccessionRule construct `?event prov:wasAssociatedWith ?person`; exemplar `person-with-name-change.ttl` carries `opda:formerName`/`opda:previousName` string literals |

### Baseline object-property census (the BEFORE numbers)

- **64** `owl:ObjectProperty` declarations total across the class graph (agent 6, transaction 1, property 24, claim 3, descriptive 28, governance 2, classes 0).
- **25** of those have `rdfs:range opda:<class>` — BUT 18 range to `opda:MonetaryAmount` and 1 to `opda:RoomDimension` (descriptive structured-value classes, not the inter-entity spine). The genuine inter-*entity* edges by range are few; `hasEvidencedAuthority` (Seller→Claim) is the agent/transaction-relationship one the ODR calls "the lone existing inter-class edge."
- **3 rangeless** `owl:ObjectProperty`: `opda:founds`, `opda:mediates` (the council's two targets) **and `opda:baselineCategory`** (governance) — see positive-control PC-0 below.

### Positive control PC-0 (REAL, pre-existing) — `opda:baselineCategory`

The corpus already contains a third rangeless object property the ODR/ADR/council never mention:

- `opda-governance.ttl:40-45`: `opda:baselineCategory` — `owl:ObjectProperty`, `rdfs:domain opda:DPVMappingRecord`, **NO `rdfs:range`**.
- Its only SHACL shape is `baselineCategoryDomainShape` (`opda-shapes.ttl:311-317`): `sh:targetSubjectsOf opda:baselineCategory` — a **subject/domain guard**, NOT a `sh:class`/`sh:node` **value-type** shape on the object.
- Actual usage (`opda-governance.ttl:59`): `opda:baselineCategory dpv-pd:OfficialID` — object is an **external DPV-PD concept IRI** (referenced-not-imported per ODR-0012/0018).

Under the council's gate rule (§Confirmation / ADR-0048 Phase 4): **FAIL on any `owl:ObjectProperty` rangeless AND shapeless (no `rdfs:range` AND no SHACL `sh:class`/`sh:node` value-type shape).** By that rule `baselineCategory` is rangeless ✓ and has no value-type shape ✓ → **the honest corpus-wide gate MUST either flag it, or carve it out on a stated principle** (e.g. "object ranges to an externally-referenced vocabulary"). What the gate must NOT do is silently scope itself to only the relationship-layer predicates and skip it — that is exactly the dishonest gate-narrowing this review exists to catch.

**Check to perform on the delivered gate:** does `ci-object-property-coverage --strict` report `baselineCategory`? If clean, WHY — is there a documented carve-out, or did the gate quietly narrow scope?

---

## Standards the new gate is held to (from the precedent `category_g_coverage_test.py`)

The new `object_property_coverage_test.py` MUST match the precedent gate's honesty idioms (`tools/opda-gen/src/opda_gen/ci/category_g_coverage_test.py`):

1. **Pure report fn separated from `run(ontology_dir)`** (precedent: `build_coverage_report()` vs `run()`, lines 146-181) — so the positive-control unit tests can drive it without a corpus on disk. A gate that can only be exercised end-to-end is weaker.
2. **Semantic parse via rdflib `Graph().parse()`**, not regex (precedent lines 84-100). A regex-only gate is a weakness.
3. **Corpus-wide TTL enumeration** (precedent `_module_ttls()` = all top-level `*.ttl`, lines 76-81). This is why PC-0 (`baselineCategory` in `opda-governance.ttl`) is unambiguously in scope: any gate reusing this enumeration sees it. A gate that only reads agent/transaction TTLs has narrowed scope.
4. **Violations reported by name, never silently omitted** (ADR-0028 totality).
5. **Must NOT over-skip.** The precedent skips (`available=False`) only because it needs the gitignored data dictionary. The object-property gate reads the corpus directly and needs no external input → it must ALWAYS run, never report `available=False` to dodge a failure. An unexpected skip is a red flag.

## VERIFICATION (post re-emit) — verified at file:line against the re-emitted corpus

Working tree: corpus re-emitted (all module TTLs + exemplars + expected-reports modified vs HEAD). Gate + residue + competency modules landed. Verified each brief item independently — not from summaries.

### Item-by-item (brief items 1–9)

**1. founds/mediates — PASS.**
- `opda:founds` (opda-agent.ttl, re-emitted): `owl:ObjectProperty`, domain=[], range=[] (STILL rangeless in OWL); "Design-time, NEVER reasoned" comment KEPT. SHACL: a property-shape pins `sh:class opda:Role` (Relator→Role) + a `sh:targetSubjectsOf` subject-guard. Gate classifies `founds` as gated **via shacl** (not rangeless_shapeless).
- `opda:mediates`: `owl:ObjectProperty`, rangeless in OWL, "NEVER reasoned" KEPT. SHACL `ProprietorshipMediationShape` now carries `sh:class opda:Proprietor` + `sh:minCount 2` (owner targetClass Proprietorship) + subject-guard. This is the council's "first real catch" fix (was `sh:minCount 2` only) — verified added. Neither gained rdfs:domain/range → council preserved, comment not falsified.

**2. playedBy/plays — PASS.** `opda:playedBy`: `owl:ObjectProperty`, `rdfs:domain opda:Role` only, range=[], `owl:inverseOf opda:plays`. Bearer disjunction Person∪Organisation in SHACL `sh:or ([sh:class Person][sh:class Organisation])` on a generic role-play shape AND on Seller/Buyer shapes — NOT an rdfs:range/owl:unionOf. NO `sh:minCount` forcing a self-edge (verified absent). `opda:plays`: inverse, no domain/range, SHACL `sh:class opda:Role` object pin. Subject-guard present.

**3. hasParticipant / concernsProperty / hasRegisteredTitle — PASS.**
- `hasParticipant`: domain=Transaction (universally-true subject), range=[] in OWL; range Seller∪Buyer via SHACL `HasParticipantRangeShape` `sh:targetObjectsOf` + `sh:or ([sh:class Seller][sh:class Buyer])` — NOT rdfs:range union. Verified.
- `concernsProperty`: domain=Transaction, `rdfs:range opda:Property` (OWL range OK — single-domain, no never-reasoned commitment). 
- `hasRegisteredTitle`: domain=Proprietorship, `rdfs:range opda:RegisteredTitle`.

**4. dependsOnTransaction / chainMembers NOT emitted — PASS.** Both ABSENT from the TBox (not emitted). Both recorded DEFERRED in the residue register (object_property_residue.py:151-164) with non-empty reason + blocking_record ODR-0007. `deferred_predicates()` returns exactly `{dependsOnTransaction, chainMembers}`.

**5. opda:Name not a class; no hasName object property — PASS.** `opda:Name` NOT minted as `owl:Class` (verified across all module TTLs). `hasName` ABSENT as an object property; recorded VALUE-SLOT in the register. `opda:name` datatype property unchanged (DatatypeProperty, range xsd:string, no domain).

**6. hasAddress — PASS.** `opda:hasAddress` (opda-property.ttl, re-emitted): `Property`-only `rdfs:domain` DROPPED (domain=[]); `rdfs:range opda:Address` KEPT. SHACL: `sh:targetObjectsOf` shape pins `sh:class opda:Address` (object) + a subject-guard. `opda:Address` class/IC unchanged (no new IC asserted; recorded PENDING-upstream-IC, blocking ODR-0015). Bearer-typing pushed to SHACL per council.

**7. THE GATE (positive control — the critical check) — PASS. The gate has REAL teeth and is corpus-wide + honest.**
- Ran the unit suite: **24/24 pass** (`tests/test_object_property_coverage.py`), including the brief's controls: `test_rangeless_and_shapeless_is_a_violation`, `test_rangeless_but_shacl_pinned_passes`, `test_subject_bearer_predicate_with_domain_is_a_violation`, `test_malformed_reference_is_not_excused`, `test_shacl_path_without_value_type_is_not_pinned`.
- **My INDEPENDENT positive controls (mutating copies of the REAL corpus, not the implementer's hand-built graphs):**
  - **PC-1 (rangeless+shapeless flagged + corpus-wide):** planted `opda:reviewerPlantedDeadEdge` (rangeless, shapeless) into **opda-property.ttl** (a NON-agent, NON-§R2 file) → gate flagged it limb (a), is_complete=False. **Proves the gate is corpus-wide, not narrowed to §R2** (team-lead check #3 ✓).
  - **PC-2 (rangeless-but-SHACL-pinned passes):** `founds`/`mediates` (rangeless in OWL, SHACL-pinned) → NOT in rangeless_shapeless, classified gated "via shacl". ✓
  - **PC-3 (multi-bearer + single rdfs:domain flagged):** injected `rdfs:domain opda:Person` on `hasAddress` in the real corpus → gate flagged limb (b) "not-universally-true rdfs:domain". ✓
  - **PC-0 / team-lead check #2 (residue register has teeth):** removing `baselineCategory`'s disposition from the register → gate flags it rangeless+shapeless, is_complete=False. With the disposition present it is excused into the `reference` bucket. So the carve-out is NOT a free pass.
  - **team-lead check #1:** `baselineCategory` is recorded in `object_property_residue.py` (REFERENCE disposition, non-empty reason, lines 175-182), and is NOT hardcoded/excused anywhere in the gate code (grep clean). Data-driven.
- **Running `ci-object-property-coverage --strict` against the re-emitted corpus: PASS (exit 0)** — 68 GATED edges; residue 1 VALUE-SLOT + 1 PENDING + 2 DEFERRED + 1 REFERENCE; competency-query coverage 9 covered / 0 deferred-to-register / 0 uncovered. The banner explicitly surfaces the `baselineCategory` REFERENCE EXEMPTION (never silently excused).
  - NOTE: an EARLIER run (mid-regeneration, before the emitter migrated the exemplars) correctly FAILED with 7 limb-(c) violations (founds/playedBy/plays/hasParticipant/concernsProperty/hasRegisteredTitle/hasEvidencedAuthority asserted-but-not-retrievable). That failure was the coverage-by-test bar working exactly as designed — the gate refused to pass edges no exemplar traversed. It cleared only after the emitter added the participant-relationship facets to the exemplars (task #11). Strong evidence the gate is not a rubber stamp.

**8. Byte-identity — PASS.** `opda-gen emit --output /tmp/...` diffed against the committed corpus = **0 differing files** (deterministic). `ci-byte-identity`: PASS. `emit-exemplar-reports` regenerated = no drift vs the 17 committed expected-reports. NO non-determinism in TTL or expected-report emission.

**9. Edge count — before→after.** Gate's GATED metric (OWL-range OR SHACL-pinned): **61 → 68 (+7)**. OWL-class-ranged object properties specifically: **25 → 27 (+2)** (concernsProperty, hasRegisteredTitle carry rdfs:range; founds/mediates/playedBy/plays/hasParticipant are SHACL-pinned). The 7-new GATED relationship edges match the ODR-0032 §R2 GATED inventory.

### Regression sweep (existing CI gates over the re-emitted corpus)

- `ci-three-graph`: PASS (8 checks) · `ci-dup-declaration`: PASS · `ci-inference-closure`: PASS · `ci-byte-identity`: PASS · `ci-profile-contract`: PASS · `ci-descriptive-roundtrip`: PASS · `ci-baspi5-roundtrip`: PASS.
- `ci-category-g-coverage --strict`: reports 1 violation (`organisation` uncovered). **PRE-EXISTING** — present unchanged in HEAD; NOT a regression, out of ADR-0048 scope.

### DEFECTS / OPEN ITEMS

**D1 (BLOCKER for deploy — task #5 marked "completed" but this part is NOT done): `src/data/ontology-model.json` is STALE.** Re-checked after task #5 flipped to completed: the committed model STILL has **0 occurrences** of playedBy/plays/hasParticipant/concernsProperty/hasRegisteredTitle and is **unmodified in git**. `public/data/ontology-graph-elements.json` likewise unmodified. Task #5 ("regenerate corpus + verify byte-identity") delivered the TTL byte-identity but NOT the JSON deploy-artefact regeneration that ADR-0048 §5 also lists. The AWS deploy gate `deploy-aws.yml:84-85` runs `git diff --exit-code -- src/data/ontology-model.json` AFTER `build:data` regenerates it from the corpus → **the deploy WILL FAIL** until these artefacts are regenerated (`npm run build:data` / `ontology:model` + `ontology-graph`) and committed. `make ci` does not catch this (needs a running Fuseki). STILL OPEN despite the task status.

**D2 (must-do-before-green — wiring, task #10 "propose wiring"): the gate is NOT wired into any CI surface.** `Makefile` `ci-ontology` (line 100) does not call `ci-object-property-coverage`; no reference in `three_graph_test.py`, `.github/workflows/*`, or `package.json`. ADR-0048 §Confirmation requires it be "wired into `make ci` + the three-graph CI surface + the AWS deploy gates." The gate engineer PROPOSED exact diffs (impl-gate.md §8) but they are not applied. Until wired, the gate exists but never runs the corpus-level `--strict` check in CI (the pytest suite IS picked up by `ci-ontology`'s `pytest -q`). Confirm whether wiring is in-scope for this change.

**D3 (stale doc, non-blocking): impl-gate.md §7/§7a is mid-regeneration-stale.** It states `opda:plays` is "rangeless-AND-shapeless" and lists orphan predicates (`opda:rolePlayer`, `opda:proprietorshipOf`) — neither holds in the CURRENT corpus (plays is SHACL-pinned; rolePlayer/proprietorshipOf not present; the live exemplars use the ratified predicates and limb (c) is fully green). The doc's substance (coverage-by-test caught the gap; it cleared when exemplars migrated) is correct, but the specific residual list is outdated. Should be refreshed to the final state.

**D4 (CONFIRMED REAL silent data-loss — task #12; CORRECTS my earlier assessment): `profiles/rds.ttl` lost its `hasAddress` binding.** The emitter's deeper investigation found it and I confirmed it at the diff level — **my earlier "could not reproduce a live loss" was WRONG; I under-investigated** (I checked file-count + byte-identity, which both pass; the loss is *within* rds.ttl content). Evidence: `git diff HEAD -- profiles/rds.ttl` shows the removal of `sh:path opda:hasAddress` + its `dct:source .../propertyPack/address`, and the header coverage count drops from "6 bindable leaves enumerated; 103 GAPped" to "5 bindable leaves enumerated; 104 GAPped **[no-domain: 1, ...]**". Root cause (mechanically confirmed): the `profiles.py`/ADR-0029 enumerator binds a leaf "with exactly one `rdfs:domain` as `sh:targetClass`"; when ADR-0048 (correctly) DROPPED `hasAddress`'s `rdfs:domain`, the enumerator could no longer derive a `sh:targetClass` → it silently reclassified the rds address leaf from bindable→GAPped and emitted **no shape**. So a leaf that WAS bound is now silently unbound. **UNCAUGHT by any gate**: `ci-profile-contract` PASS, `ci-descriptive-roundtrip` PASS (240 addressable, 0 unaddressable), `ci-byte-identity` PASS — nothing detects the regression (the new output is self-consistent). rds-SPECIFIC: baspi5 still binds hasAddress (HEAD=1, NOW=1 — it binds via an explicit targetClass, not the domain-derived path). This is a real downstream regression and a SIDE-EFFECT of the (correct) council-mandated domain-drop, NOT a relationship-layer modelling defect. The fix belongs in `profiles.py` (derive `sh:targetClass` for a now-domain-less predicate from the leaf's container type or the SHACL bearer shape, instead of None-→GAP). Disposition is team-lead's (task #12). The emitter handled it correctly: found it, disclosed it, flagged to team-lead, scoped it as not-theirs-to-fix. **It does warrant a decision before this ships** — silent loss of an emitted binding is the project's stated worst failure mode.

**D6 (CONFIRMED defect — emitter `PlaysRangeShape` is a structural no-op; `opda:plays` co-domain is UNENFORCED + the gate false-passes it).** I proved via pyshacl that `opda-x:person opda:plays opda-x:aProperty` (a clearly-wrong co-domain) **conforms=True** — NOT caught. Root cause: `PlaysRangeShape` (opda-*-shapes.ttl) has `sh:targetObjectsOf opda:plays` (focus = the object of `plays`, i.e. a Role) but then wraps its `sh:or [Role, RoleMixin]` inside `sh:property [sh:path opda:plays; …]` — which asks whether *that Role* has its own `plays`→Role/RoleMixin edge (vacuous: Roles have no `plays` edge). The correct form is node-level `sh:or` for focus-node typing, exactly as the emitter's OWN `HasParticipantRangeShape` does it. This **directly contradicts the emitter's claim #5** ("I hit + fixed a false-positive there … worth re-checking I got all of them") — they did not fix `PlaysRangeShape`. Contrast verified: `playedBy`'s co-domain IS correctly enforced (role playedBy a Property → conforms=False), because its shapes focus on the *subject* (the Role) and `sh:path playedBy` correctly reaches the value. So this is `plays`-specific. **Two consequences:** (1) emitter — `plays`'s co-domain is silently unconstrained; (2) gate (latent) — its Pattern-2 SHACL-pin detection sees `sh:path opda:plays` + a value-type and marks `plays` "SHACL-pinned", so it PASSES limb (a) despite the shape being a no-op → a gate false-positive (it checks syntactic presence of `sh:path`+`sh:class`, not that the targeting focus-node is coherent). Severity: a no-op causes NO false violations (claim #7 holds, expected-reports clean), so CI stays green — but `plays` is effectively un-type-pinned. One-line structural fix (move the `sh:or` to the node shape). Should be fixed before ship; the gate should ideally also detect targetObjectsOf-shape value-typing via node-level `sh:or`/`sh:class` rather than a nested `sh:path` re-traversal.

**D5 (non-blocking, out of ADR-0048 scope — ABox hygiene): an exemplar uses a TBox-undeclared predicate.** `opda:partOfTransaction` is used in `exemplars/simple-transaction-with-milestones.ttl` but is declared NOWHERE in the TBox as an object property. (The gate engineer's residual note also named `opda:concerns`, but I verified that one IS declared in `opda-transaction.ttl` — so the hygiene item is the single predicate `partOfTransaction`, not two.) Verified this breaks NO gate: three-graph PASS, object-property `--strict` PASS, dup-declaration PASS — the object-property gate intentionally covers the *declared* object-property layer + retrievability of the ratified §R2 edges, not whether exemplars also carry other undeclared predicates. Legitimate follow-on cleanup; explicitly outside ADR-0048's object-property-coverage scope.

**Note on a `playedBy` model change between deliveries (verified, an IMPROVEMENT):** the second emitter delivery DROPPED `playedBy`'s `rdfs:domain opda:Role` (prior delivery had it) — now domain-less with subject-typing in `RolePlaySubjectShape sh:or [Role, RoleMixin]`. Rationale (verified sound): Seller/Buyer are `RoleMixin`, Proprietor is `Role` — siblings; `rdfs:domain opda:Role` would wrongly exclude the RoleMixin roles. This is MORE correct than the prior delivery. NB it makes the gate engineer's Interpretation-2 rationale ("playedBy's subject `rdfs:domain opda:Role` is universally true, so legitimate") moot — the emitter concluded the opposite (it is NOT universally true across Seller/Buyer/Proprietor) and dropped it. Both land on a passing state; the divergent rationale is worth reconciling in the docs but is not a defect.

**Superseded doc-nit:** my earlier note that `PlaysRangeShape`'s sh:class "location is imprecise but net effect correct" is WITHDRAWN — see D6: the location IS the bug (the shape is a vacuous no-op; `plays` is not actually pinned). The `opda:concerns` mischaracterisation (D5) stands as cosmetic.

**Two interpretation calls (impl-gate.md §4) — both council-faithful, both surfaced for ratification, neither silently decided:**
- I1: `baselineCategory` REFERENCE disposition (vs remodel with a cited-unimported range class). Ratified by team-lead as deliberate.
- I2: limb (b) "multi-bearer" = bearer-IS-SUBJECT only → set restricted to `{hasName, hasAddress}`, excluding `playedBy`/`hasParticipant` (whose subject is single+universally-true, disjunction on the object side in SHACL `sh:or`). Council-grounded (§R1 "rdfs:domain only where subject-type entailment is universally true"). **Caveat I verified:** because `hasName` is struck (never emitted), limb (b)'s only LIVE target is `hasAddress`. The check is sound and PC-3 proves it fires, but it is narrow — a NEW subject-bearer predicate added later with a bad domain would only be caught if added to `MULTI_BEARER_PREDICATES`. Also: limb (b) checks `rdfs:domain` only, NOT a not-universally-true `rdfs:range` (e.g. if a future edit put `rdfs:range opda:Seller` on `hasParticipant`, no limb catches it — it would pass via the OWL range pin). Minor latent gap vs the ADR's "domain/range" wording; not a current defect.

### VERDICT (updated after the 2nd emitter delivery)

The relationship-layer modelling + the gate remain **substantively correct and high-quality**: all 9 brief items verify PASS at file:line; the gate has real teeth (corpus-mutation positive controls + the mid-regen limb-(c) failure that cleared honestly), is corpus-wide, two-graph-separated, never silently excuses; `--strict` PASSES (68 GATED, 9/9 competency covered); byte-identity holds. `playedBy` domain-drop in the 2nd delivery is an improvement.

**NOT green for merge/deploy.** Blocking / decision-required:
- **D1 (deploy BLOCKER, still open despite task #5 = "completed"):** `src/data/ontology-model.json` + `public/data/ontology-graph-elements.json` not regenerated → AWS model-drift gate (`deploy-aws.yml:84-85`) will fail. The TTL byte-identity half of task #5 is done; the JSON-artefact half is not.
- **D2 (must-do-before-green):** gate still unwired from `make ci` / three-graph / deploy-aws.yml (team-lead owns).
- **D4 (decision-required — CONFIRMED real silent loss, corrects my earlier under-assessment):** `profiles/rds.ttl` silently lost its `hasAddress` binding as a side-effect of the correct domain-drop; uncaught by any gate. Needs a `profiles.py` fix or an explicit accept-the-loss decision before ship.
- **D6 (should-fix):** `PlaysRangeShape` is a structural no-op → `opda:plays` co-domain unenforced and the gate false-passes it. One-line emitter fix; gate pin-detection ideally hardened too.

Non-blocking: D3 (stale gate-doc §7), D5 (one undeclared exemplar predicate, out of scope), the I2 rationale reconciliation. Net: the core ADR-0048 deliverable (typed relationship layer + honest coverage gate) is sound; D1/D2 are follow-through, D4/D6 are real defects this change introduced (one silent data-loss, one ineffective shape) that should be dispositioned before it ships.
