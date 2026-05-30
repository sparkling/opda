# Handover — Bounded-Context Build Pass (2026-05-30)

**Author:** Henrik (with Claude). **Scope:** one build session executing the P1–P6 plan from [`HANDOVER-2026-05-30-bounded-context-execution-plan.md`](./HANDOVER-2026-05-30-bounded-context-execution-plan.md). **Status:** **sound slice shipped and green; two coupled remainders deferred by decision.** Everything below is **uncommitted** in the working tree.

> This doc records what the build *did*. The design source of truth is the execution-plan handover (now carrying an Execution Status table) + the ADRs. The deliberation history is in `council/session-021-*.md` + `session-022-*.md`.

---

## TL;DR

The P1–P6 emission build was executed. The **sound, unblocked work shipped and is green** (full `opda-gen` pytest suite + byte-identity + three-graph + profile-contract CI all pass). The **935-leaf descriptive walk (P2)** was found *not* to be the mechanical pass ADR-0028 assumed and was **deferred to a curated WG pass by decision** — which in turn keeps the *full-fidelity* half of the profile rollout (P4) and one output-neutral refactor (baspi5 shape data-fication) deferred with it. The bounded-context scheme and the **form→community map for all 31 forms** are now machine-readable.

---

## What shipped (green)

| Phase | Status | What landed |
|---|---|---|
| **P1 — context scheme (ADR-0026)** | ✅ done | `emitters/contexts.py` → `opda-contexts.ttl`: `opda:BoundedContextScheme` + 6 industry `skos:Concept`s (`inScheme`+`topConceptOf`+`prefLabel`+`definition`+`hasSteward`+`dct:source`) + `opda:consumesFrom` (`owl:AnnotationProperty`, `rdfs:subPropertyOf prov:wasInfluencedBy`). |
| **P3 — profile emitter (ADR-0029)** | ✅ sound slice | S022 correctness on baspi5 + generic `ProfileSpec`/`_build_profile` + `OVERLAY_COMMUNITY` map. |
| **P4 — 31 profiles (ADR-0029)** | ✅ thin-sound | All 31 in-scope profiles emitted; 3 legacy asserted absent. |
| **P5 — `servesContext` query (ODR-0020)** | ✅ done | Documented as a reviewable **non-emitted** constant in `contexts.py`. |
| **P6 — regenerate/verify + re-index** | ✅ done | All CI green; AgentDB re-index delta done + verified traversable. |

### P1 detail
- `opda-contexts.ttl` emits the scheme + 6 concepts + `consumesFrom`. Per the **S022-final** design, **no** `opda:servesContext` / `opda:overlaysContext` / `opda:definedInContext` predicate is emitted, and **no** dormant CONSTRUCT / cross-check shape ships.
- Wired into the `emit` umbrella, byte-identity CI, and a new `emit-contexts` CLI command. Foundation `owl:versionInfo` + pinned date/sentinel bumped (ADR-0026 work-item 5).
- Tests: exactly 1 scheme / 6 concepts / `topConceptOf` / `consumesFrom` decl; **F1 firewall** (no domain term `skos:inScheme` the scheme); "no retired predicates"; byte-stable.

### P3 detail
- **S022 correctness on `baspi5.ttl`**: dropped `opda:requires` + the mis-targeted `opda:overlaysContext`; added the one `dct:subject → opda:EstateAgencyContext`. baspi5's `opda:ValidationContext` retained per ODR-0010 (`profileURI`/`sourcedFrom`/`formVersion`). The `profiles.py:250` defect is moot (predicate gone).
- **`OVERLAY_COMMUNITY`** map for all 31 in-scope overlays (the form→community assignment).
- **Generic `ProfileSpec` + `_build_profile(spec)`**: emits the shared ontology header + `dct:subject` community tag, delegating SHACL shapes to an optional `shape_builder`. The header/community scaffolding is generalized and tested once.

### P4 detail
- `PROFILE_FILENAMES` extended to the **31 in-scope** overlays (15 active main + 16 NTS2 extensions). The 30 non-baspi5 profiles emit via `_build_profile` as **thin** graphs (header + `dct:subject` community). Each artefact's `dct:description` + comment header states inline that per-leaf constraints await ADR-0028.
- Tests: catalogue coverage (31 present / 3 legacy absent), every-profile-has-exactly-one-community-tag.

### P6 detail — AgentDB re-index (delta)
- ODR records updated: `ODR-0001` (cross-talk amendment), `ODR-0019`, `ODR-0020` (S022 amendments); **new** `ODR-0021`.
- ADR records: **new** `ADR-0028`, `ADR-0029`; `ADR-0026` updated.
- 7 hierarchical records (`semantic`), 7 `*-patterns` memory entries, 28 causal edges (forward + derived inverses). Verified traversable (`agentdb_causal-query` both directions). Amended records' frontmatter relations were unchanged, so no stale edges.

---

## The decision that shaped this build — P2 deferred

The **935-leaf descriptive walk (ADR-0028)** is *not* the ~90%-mechanical projection ADR-0028 / S021 assumed. Investigated against `data-dictionary-canonical.json`:

- **No leaf→term map exists.** `source/00-deliverables/semantic-models/{mappings,ontology,shapes}/` are empty; nothing references `opda:`. The existing ~23 descriptive datatype properties were each **hand-curated** (semantic short names; hand-assigned `rdfs:domain` Property vs LegalEstate vs Address; comments citing UFO category + scheme + form anchor). No mechanical name/domain derivation exists to extend.
- **Naive naming collides catastrophically.** Of **1,521** annotated base leaves, only **250** have a unique final path-segment — `details` recurs in 269 distinct leaves, `price` in 99, `comments` in 96. Last-segment naming would collapse 1,521 distinct attributes into ~351 colliding properties. "Declare-once" (ODR-0008) reconciles the *same* attribute across *overlays*, not every base leaf sharing a final segment.
- **The IRIs are permanent.** ~900 published, stable `opda:` identifiers; an auto-derived scheme can't be cleanly reversed.

**Decision (Henrik, 2026-05-30):** defer the walk to a **curated pass with the WG** rather than auto-emit. The BASPI5 slice stands.

---

## What remains (deferred — not open design questions)

1. **P2 — the curated 935-leaf descriptive walk.** Needs WG-curated names/domains/comments for ~900 leaves (or a ratified naming convention). This is the bulk of the schema→ontology coverage gap. Tracked at ADR-0005 §G11 + the ADR-0028 implementation note.
2. **P4 full fidelity — per-leaf profile constraints.** The 30 thin profiles gain real `sh:path`/`sh:in`/`sh:minCount` shapes only once P2 supplies term-grain `opda:` properties. ADR-0029 is explicitly co-delivered with ADR-0028.
3. **baspi5 shape data-fication** (ADR-0029 work-item 1, remainder). Routing baspi5's ~30 shapes through `_build_profile` via a `shape_builder` is **output-neutral** (baspi5.ttl stays byte-identical); payoff only matters once other forms have terms. Deferred with (1)/(2). Left as proven-bespoke (`_build_baspi5_profile`) — the byte-parity regression gate is satisfied trivially.
4. **WG ratification.** `ADR-0028`/`ADR-0029` are `proposed`; `ODR-0019`/`0020`/`0021`/`ADR-0026` carry pending-WG amendment notes. Human track, parallel to the build.

---

## Files touched (all uncommitted)

**Generator (new):** `tools/opda-gen/src/opda_gen/emitters/contexts.py`; `tools/opda-gen/tests/test_contexts.py`.
**Generator (modified):** `cli.py`, `ci/byte_identity.py`, `emitters/foundation.py`, `emitters/profiles.py`, `tests/test_byte_identity.py`, `tests/test_profiles.py`.
**Emitted TTLs:** new `opda-contexts.ttl`; 30 new `profiles/*.ttl` (thin); regenerated `profiles/baspi5.ttl`, `foundation.ttl`, `opda-classes.ttl`, `opda-shapes.ttl`, `opda-annotations.ttl`.
**Records:** `docs/adr/ADR-0026` (EXECUTED note), `ADR-0028` (DEFERRED note + finding), `ADR-0029` (PARTIALLY-EXECUTED note); `HANDOVER-2026-05-30-bounded-context-execution-plan.md` (Execution Status table); this doc.
**AgentDB:** 7 `odr/`+`adr/` records, 7 `*-patterns` memory, 28 edges (delta).

---

## Next steps

1. **Commit** the green P1/P3/P4/P5/P6 work + doc updates (was left for Henrik's call). Deploys via CI on push to `main` (Cloudflare Pages) — do not `wrangler pages deploy` manually.
2. **Convene the WG / curated pass for P2** — agree a naming convention (or curate per-leaf) for the ~900 descriptive datatype properties, then the 30 thin profiles + baspi5 data-fication follow mechanically.
3. **WG ratification** of `ADR-0028`/`ADR-0029` (`proposed` → `accepted`).

## Key pointers

- **Execution plan + Status table:** `docs/HANDOVER-2026-05-30-bounded-context-execution-plan.md`.
- **Generator:** `tools/opda-gen/` — run `opda-gen emit` (regenerate), `opda-gen ci-byte-identity` / `ci-three-graph` / `ci-profile-contract`, `pytest -q`.
- **Profile catalogue + community map:** `profiles.py` (`PROFILE_FILENAMES`, `OVERLAY_COMMUNITY`, `ProfileSpec`/`_build_profile`).
- **`servesContext` on-demand query:** the documented constant in `emitters/contexts.py` (never emitted).
- **Overlay inventory source of truth:** `src/pages/modelling/overlays.astro` (34 files; 31 in scope). **Contexts (6):** `src/pages/modelling/bounded-contexts.astro`.
- **Why P2 is hard:** `data-dictionary-canonical.json` (8,458 path entries; 1,521 annotated base leaves; collisions per the finding above).
