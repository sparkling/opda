# Handover & Execution Plan — Bounded-Context + Forms + Descriptive Layer (2026-05-30, FINAL)

**Author:** Henrik (with Claude). **Scope:** one working session — bounded-context representation, the form/profile layer, and the descriptive-attribute walk, settled across two councils (S021, S022) and three governance directives. **Status:** decisions recorded in ODRs/ADRs; design final-as-proposed. **Build partially executed 2026-05-30 — see the Execution Status block below.**

> This doc is the **single current source of truth** for the arc. It consolidates and supersedes the earlier layered drafts of this file; the full deliberation history lives in `council/session-021-*.md` + `council/session-022-*.md` (and git).

---

## Execution status (updated 2026-05-30 — build pass)

The P1–P6 build (§5) was partially executed. Everything landed is green: full `opda-gen` pytest suite + byte-identity + three-graph + profile-contract CI all pass. Uncommitted in the working tree.

| Phase | Status | Detail |
|---|---|---|
| **P1 — context scheme (ADR-0026)** | ✅ **done** | `emitters/contexts.py` → `opda-contexts.ttl` (scheme + 6 concepts + `consumesFrom`). Umbrella/CI/CLI wired; foundation `versionInfo` bumped; F1 firewall + structural tests green. S022-final: no `servesContext`/`overlaysContext`/`definedInContext` emitted. |
| **P2 — 935-leaf walk (ADR-0028)** | ⏸️ **deferred (decision)** | Found **not mechanical** — no leaf→term map; existing 23 props hand-curated; 1,521 annotated leaves collapse to 351 colliding permanent IRIs under naive naming. Henrik chose a curated WG pass over auto-emit. BASPI5 slice stands. See ADR-0028 implementation note. |
| **P3 — profile emitter (ADR-0029)** | ✅ **sound slice done** | S022 correctness on baspi5 (`dct:subject` added; `requires`/`overlaysContext` dropped); `OVERLAY_COMMUNITY` (31); generic `ProfileSpec`/`_build_profile` (header + community, tested once). baspi5's shape data-fication is the remaining **output-neutral** piece (deferred with P2). |
| **P4 — 31 profiles (ADR-0029)** | ✅ **thin-sound done** | All 31 in-scope profiles emitted (15 active main + 16 NTS2 ext); 3 legacy asserted absent. The 30 non-baspi5 are **thin** (header + community `dct:subject`) — per-leaf constraints await P2's terms (each artefact says so inline). Coverage + community-tag tests green. |
| **P5 — `servesContext` query (ODR-0020)** | ✅ **done** | Documented as a reviewable **non-emitted** constant in `contexts.py` (never materialised). |
| **P6 — regenerate/verify + re-index** | ✅ **done** | All CI green; AgentDB re-index delta done (ODR-0001/0019/0020 updated, ODR-0021 + ADR-0028/0029 new, ADR-0026 updated; 7 records, 7 memory, 28 edges; verified traversable). |

**Net deliverable:** the bounded-context scheme + the form→community map (ODR-0020 Rule 6 half) are now machine-readable for all 31 forms. The two coupled remainders — the **935-leaf descriptive walk (P2)** and, behind it, the **rich per-leaf profile constraints + baspi5 shape data-fication** — are deferred to a curated WG pass. WG ratification of the `proposed` records (ADR-0028/0029) is the parallel human track.

> **The §4/§5 text below is the original pre-build plan, retained for provenance.** Where it says "not started" / "one-go full coverage," read it against the Execution Status table above: P2 and the full-fidelity half of P4 were deferred by decision, not executed.

---

## TL;DR

A first council (S021) planned the bounded-context implementation and proposed *adding* machinery (an authored `opda:definedInContext` home per term). A second council (S022), grounded in published convention, plus three governance directives, **subtracted** instead: the over-engineering was real and got cut twice. The settled design is **maximally lean** — the SHACL already does the work; we add almost nothing.

- **Forms:** a form **is** its SHACL overlay graph (ODR-0010). Nothing wraps it. No `prof:Profile`, no `opda:ValidationContext` additions, no `opda:overlaysContext`, no `opda:requires`, no PROF, no spike.
- **Bounded context:** a 6-concept SKOS scheme + three standard term annotations (`rdfs:isDefinedBy`, `dct:source`, `dct:subject`) + `opda:consumesFrom` for upstream. `opda:definedInContext` **retired**; `opda:servesContext` is an on-demand **query**, not stored.
- **Descriptive layer:** the full **935-leaf walk** emits the missing datatype properties (the bulk of the schema→ontology gap).
- **Overlays:** **31 in scope** (15 active main + 16 NTS2 extensions); 3 legacy editions skipped; 1 emitted (`baspi5`).

---

## 1. Is everything captured in ODRs/ADRs? — YES.

Every decision in this arc is in a record. There are **no undecided design questions** left. What remains is **execution, ratification, indexing, and explicit by-design deferrals** (§4) — not uncaptured decisions.

## 2. Records created / updated THIS session

**New records:**

| Record | What |
|---|---|
| [ODR-0021](ontology/odr/ODR-0021-deferred-form-profile-layer-enhancements.md) | **Deferred Form/Profile-Layer Enhancements** — register of 10 things we could do to forms (F1–F10: PROF, conneg, DCTAP-artefact, wrappers, materialised usage, …) each behind a named trigger; the anti-pattern that stops re-litigation. `kind: architecture`, `accepted`. |
| [ADR-0028](adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) | **Descriptive-layer walk** — the full 935-leaf datatype-property emission + `rdfs:isDefinedBy → module`. `proposed`. |
| [ADR-0029](adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) | **Overlay-profile rollout** — `ProfileSpec`/`_build_profile` refactor + the 31 in-scope profiles (shapes + `dct:subject`, no wrapper). `proposed`. |
| [session-021](ontology/odr/council/session-021-bounded-context-implementation-plan.md) + `working/session-021/` (6) | Council 1 — implementation plan (incl. §Governance directive: one-go/no-gates). |
| [session-022](ontology/odr/council/session-022-form-shacl-profile-convention.md) + `working/session-022/` (6) | Council 2 — convention review (incl. §Governance directive: no-PROF/no-wrapper). |
| *this file* | the consolidated handover + execution plan. |

**Amended records:**

| Record | Change this session |
|---|---|
| [ODR-0019](ontology/odr/ODR-0019-bounded-context-representation.md) | Rule 5 (`definedInContext` **retired** → `rdfs:isDefinedBy` + `dct:source` + gated `dct:subject`); Rule 8 (gate restored, S021 un-gate withdrawn); References. |
| [ODR-0020](ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) | Rules 4/5/6 (home via standards; `servesContext` = derived query; `overlaysContext`/`requires` dropped; F1 kept, F2/F3/total-cover dropped); References. |
| [ADR-0026](adr/ADR-0026-bounded-context-scheme-emission.md) | S021 amendment then S022 amendment + governance: scheme + `consumesFrom` kept; no `definedInContext`/cross-check/CI; no wrapper. |
| [ODR-0008](ontology/odr/ODR-0008-property-descriptive-attributes.md) | References pointer — the 935-leaf walk is scheduled (ADR-0028), home = `rdfs:isDefinedBy`. |
| [adoption.md](ontology/odr/council/adoption.md) | S021 + S022 track-record rows + governance-override notes. |

*(ODR-0019/0020/ADR-0026 were authored in the prior session but never committed; this session reversed their membership rules to the final no-wrapper design. ODR-0021/ADR-0028/ADR-0029/session-021/022 are wholly new this session.)*

## 3. The final settled design (current state)

### Forms (ODR-0010 + ODR-0021 + governance directive)
- A form **= its named SHACL overlay graph**. **Nothing wraps it.**
- **form → base** it constrains: the shapes' **`sh:targetClass`** (structural).
- **form → community** that owns it: **one `dct:subject` triple** on the form graph's `owl:Ontology` header.
- **which terms required:** read from the shapes (`sh:minCount`/`sh:path`).
- **dropped:** `opda:overlaysContext`, `opda:requires`. **Not added:** `prof:Profile`, `prof:isProfileOf`, `ValidationContext` re-typing, PROF, spike. (`profiles.py:250` bug is moot.)
- **deferred (ODR-0021 F1–F10):** PROF typing, conneg-by-profile, DCTAP-as-artefact, explicit requires/overlaysContext, reified profile node, materialised `servesContext`, ownership-at-scale, polysemy machinery, per-form versioning — each behind a named trigger.

### Bounded context (ODR-0019 + ODR-0020)
- **6-context SKOS scheme** `opda:BoundedContextScheme` (Estate Agency, Conveyancing, Mortgage Lending, Surveying, Property Data Services, Property Tech) — emitted to `opda-contexts.ttl`.
- **term home / concern → `rdfs:isDefinedBy`** → owning module IRI (modules partition by concern, *not* by context).
- **provenance → `dct:source`** (already emitted per term).
- **community-ownership → `dct:subject`** → a context concept — **authored-or-absent, never derived, gated; none today.**
- **usage → `opda:servesContext`** = an **on-demand derived query** (not stored, not a shipped rule).
- **upstream → `opda:consumesFrom`** → `opda:Organisation` (the one justified local predicate; `rdfs:subPropertyOf prov:wasInfluencedBy`).
- **retired:** `opda:definedInContext`. **kept:** F1 firewall (no domain term `skos:inScheme` the scheme). **dropped:** F2/F3, total-cover CI, cross-check shape.

### Descriptive layer (ODR-0008 + ADR-0028)
- The **full 935-leaf walk**: every annotated leaf → `owl:DatatypeProperty` on `opda:Property`/`LegalEstate` (label, comment, domain, **`xsd:string`-default** range, `dct:source`), **flat** (no `subPropertyOf`), + `rdfs:isDefinedBy → module`. ~900 properties.
- Q4a class promotions: the 5 ratified (`Survey`, `EPCCertificate`, `Search`, `Valuation`, `Comparable`) emit; **`Building`/`Room` deferred** (held-as-live, until a round-trip query needs sub-Property reasoning).

### Overlay inventory (ADR-0029, source of truth `/modelling/overlays`)
- **34 total** = 18 main + 16 extension. **31 in scope** = 15 active main + 16 NTS2 extensions. **Skipped:** 3 legacy editions `baspi4`/`nts`/`ntsl`. **Emitted:** 1 (`baspi5`).

## 4. Open items, deferments, dissents (the honest "what's left")

**No open *design* questions.** The following are execution, governance, or by-design deferrals:

1. **THE BUILD (next — "everything").** Generator code + regenerated TTL. Not started. See §5.
2. **WG ratification.** Records are `proposed` (ODR-0021 `accepted` as a register; ODR-0019/0020 stay `accepted` with pending-WG amendment notes; ADR-0028/0029 `proposed`). Adoption flows through OPDA WG → Modelling Sub-Committee (adoption.md §3). The build can proceed in parallel; status flips on ratification.
3. **AgentDB re-index.** ODR-0021 is registered. **ODR-0019/0020 (amended) + ADR-0028/0029 (new) are NOT yet re-indexed** — run `odr-index` + `adr-index`. **ODR-0001 (council methodology) was also amended 2026-05-30** (Author-only self-amendment: cross-talk transport `SendMessage`/Agent-Teams promoted to recommended default, queen-composed demoted — a *separate* workstream from this arc, but the same `odr-index` run picks it up) — fold it into this batch so the index reflects it.
4. **By-design deferrals (recorded, trigger-gated — not open questions):**
   - ODR-0021 **F1–F10** form-layer enhancements (PROF, conneg, DCTAP-artefact, …) — each re-opens only on its named trigger.
   - ADR-0028 **`Building`/`Room`** class promotions — until a BASPI5 round-trip query exercises sub-Property reasoning.
   - The 3 **legacy overlays** — re-open only if backward-compat validation of a superseded edition is required.
   - `dct:subject` community-ownership at scale — gated to a named consumer (none today).
5. **Held-as-live dissent (recorded, governance-overruled, non-blocking):** Davis (DA) — *one-go bundling* (carried S021→S022); the WG may still choose to stage delivery.
6. **Tangential outstanding (prior session, NOT this arc — flag so it's not lost):** [ADR-0027](adr/ADR-0027-council-session-indexing-in-agentdb.md) — council-session indexing into AgentDB — written, **not executed**. Separate from the bounded-context/forms build.

## 5. EXECUTION PLAN — "do everything next" (one delivery, dependency-ordered)

Build-order is causal (not gated). Regenerate + re-pin byte-identity **once** at the end. Per the governance directives: **one go, no staging, no wrapper, no PROF, no spike.**

```
generator: tools/opda-gen/src/opda_gen/

P1. emitters/contexts.py → opda-contexts.ttl                          [ADR-0026]
    • opda:BoundedContextScheme (skos:ConceptScheme) + 6 skos:Concepts
      (each skos:inScheme + skos:topConceptOf + prefLabel + definition + hasSteward Literal)
    • declare opda:consumesFrom (owl:AnnotationProperty, rdfs:subPropertyOf prov:wasInfluencedBy)
    • NO definedInContext, NO servesContext predicate, NO overlaysContext
    • wire under owl:imports from foundation; bump foundation owl:versionInfo
    → blocks nothing; this is the join target the forms' dct:subject points at

P2. descriptive 935-leaf walk: emitters/{descriptive,property,agent}.py [ADR-0028]
    • every annotated dict leaf → owl:DatatypeProperty
      (rdfs:label/comment, rdfs:domain opda:Property|LegalEstate, rdfs:range xsd:string default,
       dct:source <form-question IRI>, rdfs:isDefinedBy <owning module IRI>)
    • FLAT — no rdfs:subPropertyOf (ODR-0008 §Q6a)
    • Q4a class promotions: 5 ratified emit; Building/Room deferred
    • emit rdfs:isDefinedBy → module on existing ~81 terms too (mechanical; 0× today)

P3. profile-emitter refactor: emitters/profiles.py                     [ADR-0029]
    • extract _build_profile(spec: ProfileSpec); generalise _build_baspi5_profile
    • REGRESSION GATE: baspi5.ttl byte-for-byte identical after refactor
    • ProfileSpec fields → SHACL: required→sh:minCount, enum_subset→merged sh:in,
      oneOf→sh:xone, leaf_refs→dct:source, ui→dash:/sh:order/sh:group, community→dct:subject
    • drop opda:requires + opda:overlaysContext emission (governance directive)

P4. emit the 31 in-scope profiles                                      [ADR-0029]
    • 15 active main (ta6→piq→fme1→rds→lpe1→ta7→ta10→oc1→llc1→con29R→con29DW→sr24→nts2→ntsl2;
      baspi5 done) — 3 legacy (baspi4/nts/ntsl) SKIPPED
    • 16 NTS2 extension fragments (v3/overlays/extensions/*.json)
    • each form graph: its SHACL shapes + ONE dct:subject → community (OVERLAY_COMMUNITY map)

P5. servesContext = an on-demand SPARQL query (documented, NOT emitted)  [ODR-0020]
    • "which contexts use term X" = term in form F's shapes ∧ F dct:subject community C
    • no stored triples, no dormant rule artefact (governance directive)

P6. regenerate + verify ONCE                                           [ADR-0007 §6a]
    • byte-identity (2nd run identical; baseline re-pinned once)
    • baspi5 refactor parity; coverage test (31 profiles; 3 legacy asserted absent;
      16 extensions present); flat-default ASK; totality (935 leaves emit or are ratified
      promotions); F1 firewall; every term has rdfs:isDefinedBy; every form has one dct:subject

POST. AgentDB re-index (odr-index + adr-index — `odr-index` also covers the amended ODR-0001 cross-talk-transport change, separate workstream); WG ratification (proposed → accepted)
```

**Dependency order:** P1 (scheme) → P2 (terms) → P3 (refactor, baspi5 parity) → P4 (profiles reference terms + point dct:subject at the scheme) → P5 (query, no artefact) → P6 (regenerate/verify once). **What's NOT built:** any wrapper, PROF, `definedInContext`, `overlaysContext`, `requires`, stored `servesContext`, cross-check shape, total-cover CI — all deleted/deferred.

### Swarm configuration (the agents that run P1–P6)

> Per-record swarm configs live **here**, in the execution plan — not in the ADRs/ODRs. The ODR DCAP lint (`odr-review` Lint 4) forbids extra H2 sections in ODR-0019/0020; the governance records stay design-only.

**Default = one delivery, one swarm — not five.** The one-go governance directive (§5) + ADR-0098 anti-sprawl forbid a reflexive swarm per record. The build is a **single `hierarchical-mesh` delivery swarm** whose per-record rosters are **sub-teams**, dependency-ordered P1→P6: the hierarchical spine carries the causal order + the byte-identity gate; the mesh carries the parallel fan-out (935 leaves, 31 profiles). The queen owns the **single** P6 regenerate/verify + baseline re-pin.

```bash
# one swarm for the whole delivery (CLI auto-reuses a matching running one — no --new, ADR-0098)
npx @sparkleideas/cli@latest swarm init \
  --topology hierarchical-mesh --max-agents 12 --strategy development --auto-scale
```
Then spawn the rosters below via the Task tool (`run_in_background: true`, all spawns in one message per CLAUDE.md), honouring P1→P6: **P1 first** (it is the join target), the **P3 refactor gate before the P4 fan-out**. After spawning: STOP and wait — do not poll.

**Topology options** (`swarm init -t`): `hierarchical` · `mesh` · `ring` · `star` · `hybrid` · `hierarchical-mesh` (default).
**Strategy options** (`-s`): `specialized` · `balanced` · `adaptive` · `research` · `development` · `testing` · `optimization` · `maintenance` · `analysis`. Other flags: `--max-agents` (def 15) · `--auto-scale` (def true) · `--new` + `--reason` (ADR-0098, only for a genuinely parallel swarm).

| Record | Phase | Standalone config (`-t / --max-agents / -s`) | Roster — agent type → responsibility |
|---|---|---|---|
| **ADR-0026** | P1 | `star / 3 / development` | `backend-dev` → `emitters/contexts.py` (scheme + 6 concepts + `consumesFrom` decl, `owl:imports` wiring); `tester` → structural tests (1 scheme / 6 concepts / predicate decls / **F1 firewall**); `code-analyzer` → foundation `versionInfo` bump + byte-identity |
| **ADR-0028** | P2 | `mesh / 5 / development` | `backend-dev` → 935-leaf datatype-property walk (`descriptive/property/agent.py`); `backend-dev` → `rdfs:isDefinedBy → module` home-pass (mechanical); `coder` → Q4a class promotions (5 ratified emit; Building/Room asserted-deferred); `tester` → totality + flat-default `ASK` + range-restraint; `reviewer` → model-the-data-you-have restraint (no invented ranges/hierarchy) |
| **ADR-0029** | P3→P4 | `hierarchical-mesh / 8 / specialized` | `system-architect` → `ProfileSpec` + `_build_profile(spec)` design (ODR-0010 rule→SHACL map); `backend-dev` → refactor + **baspi5 byte-parity GATE** (blocks fan-out); 3× `coder` → author 15 active-main + 16 NTS2-extension specs (parallel); `tester` → coverage (31 present / 3 legacy asserted absent) + three-rule contract + enum-union; `reviewer` → `dct:subject` community tags + no-wrapper/no-PROF governance check |
| **ODR-0019** | P6 (conformance) | `star / 2 / testing` | `tester` → **F1 firewall** (no domain term `skos:inScheme` the scheme); `analyst` → `odr-review` lint extension (flag context-prefix IRIs / `subClassOf`+`rdf:type` a context / `owl:sameAs` between homonyms). Realised through ADR-0026/0028 — rides P6, not a separate swarm. |
| **ODR-0020** | P5 + P6 | `star / 2 / analysis` | `coder` → `servesContext` CONSTRUCT as **documented on-demand query, NOT emitted** (no stored rule artefact); `tester` → assert no stored `servesContext` / no hand-authored membership (shares ODR-0019's F1). Rides P5 + P6. |

**The standalone-config column applies only if the WG elects staged delivery** (Davis's held-as-live one-go dissent, §4.5) — each record then inits its own swarm with those flags. The default path uses the single composite init above and treats the rosters as sub-teams.

**Sizing rationale:** ADR-0029 is the long pole (refactor gate + 31-profile fan-out) → most agents; ADR-0026 is one small emitter; ADR-0028 is volume-not-coordination (mesh over leaf families); the two ODRs are conformance/query rosters realised through the ADRs, so they ride P5/P6. Total concurrent ≤ 12 with auto-scale; the queen serialises the one P6 re-pin.

## 6. Key pointers

- **Final design + verdict:** `session-022` (esp. §Governance directive); the deferred form options: `ODR-0021`.
- **What/why per record:** ADR-0026 (scheme + `consumesFrom`), ADR-0028 (935-leaf walk + `rdfs:isDefinedBy`), ADR-0029 (31 profiles + `dct:subject`, no wrapper).
- **Overlay inventory source of truth:** `/modelling/overlays` (`src/pages/modelling/overlays.astro`) — 34 files (18 main + 16 ext), active/legacy, overlay→community map.
- **Membership source of truth:** the data-dictionary per-overlay leaf table (`source/00-deliverables/semantic-models/data-dictionary*.json`).
- **Context source of truth (6):** `src/pages/modelling/bounded-contexts.astro`.
- **The (now-moot) bug:** `tools/opda-gen/src/opda_gen/emitters/profiles.py:250` — `overlaysContext` is dropped, so the mis-target vanishes.
- **Prior-session handover (different threads):** `docs/HANDOVER-2026-05-30-ontology-coverage-context-indexing.md`.

## 7. Everything is uncommitted

All of §2 is in the working tree, uncommitted. Records are `proposed`/`accepted` pending WG ratification. The build (§5) is the next action.
