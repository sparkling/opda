# Council Session 021 — Bounded-Context Implementation Plan

- **Date:** 2026-05-30
- **Records under review:** [ODR-0019](../ODR-0019-bounded-context-representation.md), [ODR-0020](../ODR-0020-bounded-context-scheme-and-mapping.md), [ODR-0008](../ODR-0008-property-descriptive-attributes.md), [ODR-0010](../ODR-0010-overlay-profile-mechanism.md); [ADR-0026](../../../adr/ADR-0026-bounded-context-scheme-emission.md)
- **Queen:** Elisa Kendall (FIBO / EDM Council — enterprise-ontology methodology + synthesis)
- **Devil's Advocate:** Ian Davis (BBC `/programmes/` · UK-Gov · publish-first — the credible opposition to the architect's claims; defends derive-from-the-artifact)
- **Panel:**

  | Voice(s) | Teammate | Lens |
  |---|---|---|
  | Eric Evans & Vaughn Vernon | `evans-vernon` | Domain-Driven Design (Bounded Context, Published Language, Shared Kernel, Context Map) |
  | Giancarlo Guizzardi | `guizzardi` | UFO / OntoClean (Kind/Role/Phase/Relator/Mode/Quality; identity vs usage) |
  | Kurt Cagle & Holger Knublauch | `cagle-knublauch` | SHACL Core + SHACL-AF; TopBraid profile-composition |
  | Dean Allemang | `allemang` | derive-don't-declare / generator-first / model-the-data-you-have |
  | Tom Baker | `baker` | namespace + SKOS vocabulary governance (DCMI) |
  | Ian Davis | `davis` | **DA** — linked-data deployment at scale; publish-first |

- **Input Documents:** ODR-0008 / ODR-0010 / ODR-0017 / ODR-0019 / ODR-0020; ADR-0005 §G, ADR-0007, ADR-0026; `src/pages/modelling/bounded-contexts.astro`; `source/03-standards/ontology/opda-descriptive.ttl`; `tools/opda-gen/src/opda_gen/emitters/profiles.py`; the verified state survey (≈81 emitted entities; 935 annotated leaves; `opda-descriptive.ttl` = 5 classes / 0 datatype properties; `profiles.py:250` mis-target; 1-of-~18 overlay profiles emitted; `definedInContext` emitted on **zero** terms).
- **Working files:** `working/session-021/{evans-vernon,guizzardi,cagle-knublauch,allemang,baker,davis-da}.md`
- **`consensus-mode`:** `agent-fan-out` (per-question votes independent; substrate = `swarm_init` bookkeeping + Claude `Agent` fan-out; cross-talk via **SendMessage / Agent Teams** team `council-021`, one opening + one rebuttal pass)
- **Format tier:** Full Council

---

## Context

The user set the goal: produce **a plan** to (1) implement bounded-context representation in the OPDA ontology, (2) place every entity in its correct bounded context, (3) create all missing ontology parts not yet mapped/emitted, (4) associate everything with its correct context, (5) determine what new ODRs/ADRs (if any) are needed, and (6) sequence it as a phased implementation plan.

The deliberation sits on a live architectural critique (the "architect's two claims"):

- **Claim A** — SHACL overlays should ONLY validate already-defined entities/properties; they must NOT *define* the ontology (the JSON-schema-overlay semantics: select/constrain a base, never mint concepts).
- **Claim B** — Bounded contexts belong to the **ontology/domain**, not the SHACL schemas; deriving the term→context partition from form artifacts (ODR-0020's `opda:servesContext` CONSTRUCT) may be a **layering inversion**.

The decisive verified fact behind the dispute: ODR-0019 Rule 5 introduced `opda:definedInContext` as the *authored* conceptual-home predicate, but ODR-0020 Rule 4 gated it to "genuine homonyms only," and the corpus attests **zero** homonyms — so today the partition is, in practice, **100 % form-derived and 0 % authored**. That is exactly the inversion Claim B names.

Five questions were put. Per-question votes are tallied `N-M-K` by voice (8 panel voices + Queen = 9); the DA scorecard and held-as-live dissents follow in the appendix.

---

## Question 1 — Membership authority: authored at the ontology layer / derived from the SHACL overlays / hybrid?

**All nine voices voted FOR a hybrid** — and converged hard on the *shape* of the hybrid: `opda:servesContext` (usage) is **derived**, the scheme + six concepts are **authored reference data**, and `opda:consumesFrom` (upstream) is **authored**. The genuine split was a sub-question: **does every owned term get an authored `opda:definedInContext` (un-gate ODR-0019 Rule 8), or does `definedInContext` stay homonym-gated while membership is derived?**

**The "author the home" camp (Evans-Vernon, Guizzardi, Cagle-Knublauch).** Evans & Vernon drew the load-bearing DDD distinction: *"'Which context's Published Language uses this term?' and 'Which context owns (authors, stewards, defines) this term?' are two different questions. The first is read off the forms. The second is a Context-Map fact and must be authored."* A Published Language is by construction the part of the model **not owned by any one context**, so a form can never encode ownership. Guizzardi gave it the OntoClean reading: `definedInContext` is *"a quasi-identity / provenance-of-conception relation … (near-)functional: a Universal has one conceptual home, even when used everywhere,"* whereas `servesContext` is *"a usage / participation relation … many-valued by nature."* He named the present defect precisely: *"With `definedInContext` emitted on zero terms, the system's only operative answer to 'which context does X belong to?' is `servesContext` … using an anti-rigid, externally-dependent participation relation as the sole identity-locating relation"* — a level-confusion OntoClean exists to forbid. Cagle & Knublauch supplied the SHACL-architecture proof: *"A SHACL-AF CONSTRUCT … is a perfectly legitimate mechanism for materialising a derived view. But a projection is not a source of truth. `opda:requires` inside a form-profile answers 'what must a BASPI5 payload carry?' — a closed-world validation question. It does not answer 'what does the Estate-Agency community of practice conceptually own?'"* Their verdict: keep the derivation machinery, **invert the authority**.

**The "derive — and name the real source" camp (Allemang, Baker, Davis).** Allemang steel-manned derivation, then made the synthesis-unlocking move: he refused to let the SHACL `requires` edge be called the source at all. *"The genuinely authoritative source is the **data dictionary's per-overlay leaf table** … the SHACL `requires` edges are generated from that table. So membership is authored once, as data, in the dictionary; projected mechanically into `requires`; derived into `servesContext`. No hand-authored `servesContext`. Zero drift."* Baker gave the governance frame: module-of-definition and context-of-use are **orthogonal axes** (*"1:1 partition vs M:N relation … different authorities … you cannot derive one from the other"*) — which is *why* ODR-0020's firewall is sound — and the scheme + concepts are authored reference data while membership is derived. Davis (DA) held the line against hand-authored membership and issued the binding challenge: *"Name the non-form, non-hand-authored authoritative source for membership. If you cannot, you are proposing exactly the hand-maintained second-source-of-truth ODR-0019 Rule 3 and ODR-0020 Rule 4 deliberately killed."*

**Cross-talk → the synthesis (Queen).** Davis's challenge was answered *inside the session* by the opposing camp's own mechanism. Guizzardi (messaging on home-vs-usage) and Evans-Vernon both located the home **in provenance the term already carries at mint time**: *"a descriptive property's home is fixed by its `dct:source` provenance the instant it is minted"* (Guizzardi PE-Q3.1). Allemang independently named the same artifact — the data-dictionary table — as the maintained, dereferenceable source. **These are the same source.** That dissolves the 3–3 split:

> **`opda:definedInContext` is authored at the ontology layer but GENERATED-FROM-PROVENANCE — not hand-curated, and not gated to homonyms.** The generator emits it during the descriptive walk from each leaf's `dct:source` / data-dictionary originating-form signal (mechanical default: single-source → that context; `propertyPack`-level / many-source → foundation/shared-kernel), with a small adjudicated residue routed through ODR-0008 §Q1a's existing reconciliation register.

This satisfies **Claim B** (the home is an ontology-layer fact, not read off "which form requires it"), **Guizzardi's OntoClean** (the rigid home is recorded, not supplied by a usage projection), **Allemang's derive-don't-declare** (it is *generated from the dictionary*, never hand-maintained, so it cannot drift), and **Davis's anti-drift condition** (the home is generated and, by construction, does not move when a form moves context). It keeps every line of the ODR-0020 derivation machinery for `servesContext`.

**Vote Q1: 9–0–0 FOR the hybrid.** The un-gating refinement (author a home for every owned term, generated-from-provenance) carried **6–3** — Allemang/Baker/Davis preferred the minimal homonym-gated reading, but the generated-from-provenance mechanism adopts their core requirement (no hand-maintained second source), and Davis's named withdrawal condition is met (see scorecard).

---

## Question 2 — Placement method & coverage (assign EVERY entity to its correct context)

Consensus on the **method**, a real split on **how much coverage is in scope now**.

**Method (converged).** Every emitted `opda:` term resolves to exactly one *ownership* answer, layered over the derived *usage* tags:

| Signal | Source | Meaning |
|---|---|---|
| `opda:definedInContext` → an industry context | **generated-from-provenance** (authored layer) | this context **owns/authors** the term |
| `opda:definedInContext` → foundation / shared-kernel home | **generated** | **deliberate Shared Kernel** (Address, UPRN, Participant) — *one home, many uses* |
| `opda:consumesFrom` → `opda:Organisation` | authored (ODR-0020 Rule 2/C) | **upstream-owned** (DDD Conformist; HMLR, LA, MHCLG, DSIT, W3C) |
| 0+ `opda:servesContext` | **derived** (ODR-0020 Rule 5 CONSTRUCT) | which form profiles *use* it (buckets A/B; multiplicity = spanning) |
| *(explicit scaffolding allow-list)* | authored | un-owned infra (`GeneratorRun`, `DiagnosticExemplar`) |

Evans-Vernon supplied the discriminator that ODR-0020's buckets miss: a **deliberate Shared Kernel** ("jointly governed … changes require consultation," Evans 2003) is categorically different from **incidental co-occurrence** (bucket-B multiplicity) and from **scaffolding** (bucket-D silence) — all three of which currently collapse into "no/many `servesContext` tags." Guizzardi made the completeness test UFO-grounded: *"every named `owl:` term is either (a) a Role/Phase that inherits, or (b) a Kind/Relator/Mode/Quality with exactly one authored home-decision recorded — even if that decision is 'FoundationLayer / shared kernel / no industry home.' A term with no home-decision at all is the gap signal."* Cagle-Knublauch, Allemang and Baker independently expressed the **same completeness as a generated CI assertion, not a hand-walk** — Cagle's `ContextPlacementCompletenessShape` (`sh:Violation` if a domain class has neither `definedInContext`, kernel marker, nor `consumesFrom`); Allemang's total `place()` function over all minted terms; Baker's three set-identity guards (F1 firewall / F2 upstream-never-context / F3 no-hand-authored-`servesContext`) + a set-complement coverage check. Guizzardi's **D1/D2 split** (shared-kernel-with-home vs scaffolding-no-home) converts ODR-0020 bucket-D's ambiguous silence into a positive, checkable assertion.

**The split — Davis (DA), scope.** Davis attacked "place EVERY entity" head-on: the programme retired (ADR-0005 §G) on a **single BASPI5 round-trip**, not coverage; ODR-0019 Rule 8 (his own S020 binding dissent) gates building beyond demand. *"Who is the named consumer of the full context map? … 'place every entity' by hand-walking 42 classes into contexts is precisely the drift-prone hand-authoring Q1 rejected — it just wears a 'completeness' costume."*

**Queen ruling.** Two things defuse most of the objection: (i) completeness here is a **generated home-pass + CI total-cover assertion**, *not* a hand-walk — Davis's cost objection ("hand-walking 42 classes") does not apply to a generated default + CI check + small adjudicated residue; (ii) scaffolding stays **untagged by an explicit allow-list** (his bucket-D-by-default, preserved). What remains is a genuine governance disagreement: the **user has named completeness as the objective**, and under ODR-0001 the adopting project's governance (here, the user directing the programme) sets the goal a Council verdict serves. So the plan pursues complete placement — but adopts Davis's discipline wholesale on *how*: generated not hand-authored, scaffolding untagged, profiles demand-ordered, derivation dormant. Davis's YAGNI objection is **preserved as a held-as-live dissent** (the honest cost).

**Vote Q2: 8–1–0 FOR the generated-home + total-cover-CI placement method** (D1/D2 split; scaffolding allow-list). Davis against forced completeness — **held-as-live**.

---

## Question 3 — Missing-ontology creation & sequencing (the 935-leaf walk + the ~14 overlay-profile emitters)

**Unanimous (9–0): placement does NOT block on the descriptive walk or the profile emitters.** The dependency is asymmetric and was stated four ways:

- The **scheme + six concepts + three predicates** depend on nothing but the `/modelling/bounded-contexts` table — emit now (Baker, Allemang, Davis, Cagle-Knublauch).
- The **authored home** (`definedInContext`) comes from the TBox + each leaf's `dct:source` — *"home does not wait on usage"* (Guizzardi); it is captured **inside** the 935-leaf walk, *"a by-product of the walk, not a follow-on to it"* (Guizzardi PE-Q3.1), so it is unblocked for existing classes and grows with the walk.
- The **derived `servesContext`** hard-blocks on the profile emitters (and the `profiles.py:250` fix) — but it **ships dormant** (ODR-0019 Rule 8), so its incompleteness is *"the correct dormant state … not gating"* (Cagle-Knublauch).

**Two operational findings that shaped the plan:**

1. **Allemang — the walk is mechanical-and-ready, not "demand-deferred."** *"Of ~935 leaves, the mechanical datatype-property emission is ~90 %+ … scaling 23 → ~900 is not 39× the deliberation; it is 39× the same loop."* The generator already holds the inputs (label, comment, domain, `dct:source`, defaulted `xsd:string` range). Restraint per "model the data you have": **no** hand-curated non-string ranges, **no** `rdfs:subPropertyOf` (ODR-0008 §Q6a flat-default), **no** `Building`/`Room` sub-structure — defer all refinement to demand. He also surfaced the **grain gap**: `baspi5`'s `opda:requires` today targets **7 classes**, not the descriptive datatype properties — so the same walk must emit **per-leaf `requires`** to make the derivation term-grain.
2. **Cagle-Knublauch — `profiles.py` has no generic composer.** Verified: `_build_baspi5_profile()` is *"420 lines of hand-coded, BASPI5-specific shape construction,"* and `emit_profile` raises `NotImplementedError` for anything else. **"The other ~14 profiles" is not a config change — each is currently a bespoke builder.** Therefore: **refactor to a data-driven `ProfileSpec` + `_build_profile(spec)` composer first** (proving byte-identity is preserved on `baspi5`), then author 14 *specs*, not 14 builders.

**Vote Q3: 9–0 that placement is non-blocking; 8–1 to execute the walk now as mechanical generator work** (Davis demand-defers — held; see scorecard). Fix `profiles.py:250` **first**; refactor to `ProfileSpec` before the 14; order the profiles by volume/demand (Cagle: `ta6 → piq → fme1 → rds → lpe1/ta7/ta10 → oc1/llc1/con29` — `piq` is the first real bucket-B spanning test; `oc1/llc1/con29` the bucket-C `consumesFrom` test).

---

## Question 4 — ODR/ADR scaffolding: do we need a separate ODR?

**Strong consensus: NO new standalone ODR for the decision/pattern.** The bounded-context pattern is already owned by ODR-0019 (representation) + ODR-0020 (scheme + mapping); the refinement this session produces (authority split + un-gated generated home) is a *refinement of that `kind: pattern`*, which ODR-0001's self-amendment discipline places **in-place** in the owning records — not in a new ODR. Five of six teammates voted no-new-ODR (Baker alone preferred a *thin* sequencing/governance ODR, but explicitly accepted "an amendment block inside ODR-0020" as an alternative). Davis: *"A new ODR-0021 for 'implementation plan' is ceremony. Don't mint it."*

**The agreed scaffolding (enumerated):**

1. **Amend ODR-0019 Rule 8 (in place)** — split the gate: the YAGNI gate stays for **polysemy machinery** (per-context `skos:scopeNote` registries, SKOS-XL, sense registers); `opda:definedInContext` is **exempted** and re-cast as an always-emitted, generated-from-provenance home relation. *This is the minimal change that cures Claim B's inversion.*
2. **Amend ODR-0020 Rule 4/5 (in place)** — add the **ownership dimension** to the four usage-buckets (the home table from Q2); add the **D1/D2 split** (shared-kernel-with-home vs scaffolding); record the **authority note** (the data-dictionary table is the single source from which `requires` and `servesContext` are both generated; the SHACL `requires` edge is the *carrier*, not the *authority*); keep the firewall, promoted to CI (Baker F1/F2/F3).
3. **Revise ADR-0026 (in place; written, not executed)** — declare `opda:definedInContext` **authoritative** and `opda:servesContext` **derived/advisory**; add the dormant **cross-check shape** (Cagle: `sh:Warning` when derived `servesContext` has no authored `definedInContext` backing); add the **total-cover CI** + F2/F3; pin the **two house-style deltas** Baker identified (every context concept carries `skos:topConceptOf`; keep the context scheme **out** of the ODR-0011 §8a value-vocabulary `ufoCategory` lint — it is a perspectival facet, none of the seven value categories; fire the §8a eighth-category re-open trigger only if tooling demands a triple).
4. **Two fresh ADRs for execution** (programme retired → new ontology work lands as fresh ADRs, ADR-0005 §G):
   - **ADR-0028 — Descriptive-layer walk emission** (`implements: [ODR-0008, ODR-0007]`): the 935-leaf mechanical datatype-property walk (23 → ~900), `xsd:string`-default range, flat (no `subPropertyOf`), the Q4a class-promotion pass, **per-leaf `requires` emission**, and the **generated `definedInContext` home-pass**, with byte-identity baseline re-pin.
   - **ADR-0029 — Overlay-profile emitter generalisation + rollout** (`implements: [ODR-0010, ODR-0020]`): the `ProfileSpec` / `_build_profile` refactor (byte-identity-preserving on `baspi5`) + the ~14 form profiles, each wiring `overlaysContext` via `CONTEXT_OF`.
5. **One ADR-0005 §G-style deferred-work register row** tracking the demand-ordered profile/walk remainder (Davis's discipline; the project's existing deferred-work convention).

**Vote Q4: 8–1–0 — NO new standalone ODR; amend ODR-0019 + ODR-0020 in place, revise ADR-0026, create ADR-0028 + ADR-0029** (Baker's thin-sequencing-ODR preference recorded; he conceded the amendment route).

---

## Question 5 — Implementation plan (phases, dependencies, gates, emission order)

The plan adopts Evans-Vernon's and Guizzardi's **two-parallel-track** structure (home/authored ∥ usage/derived), Davis's **shippable-first** discipline, Cagle's **`ProfileSpec`-refactor-before-14**, and Allemang's **mechanical-walk** execution.

```
PHASE 0 — Records (no emission)                       gate: odr-review / adr-review green
  0.1 Amend ODR-0019 Rule 8     (definedInContext un-gated, generated-from-provenance;
                                 polysemy gate retained)
  0.2 Amend ODR-0020 Rule 4/5   (ownership dimension on buckets; D1/D2 split;
                                 data-dictionary-as-source authority note; firewall→CI)
  0.3 Revise ADR-0026           (definedInContext authoritative; servesContext advisory;
                                 cross-check shape; total-cover CI; 2 house-style deltas)
  0.4 Write ADR-0028 (walk)  +  ADR-0029 (profile generalisation + rollout)
  0.5 Add ADR-0005 §G register row for the demand-ordered remainder

PHASE 1 — Scheme + bug-fix  (= ADR-0026; SHIPPABLE INCREMENT)   gate: byte-identity re-pinned
  1.1 emitters/contexts.py → opda-contexts.ttl : BoundedContextScheme + 6 concepts
       (each skos:inScheme + skos:topConceptOf + prefLabel + definition + hasSteward Literal)
       + 3 annotation predicates (servesContext, consumesFrom, definedInContext;
         each rdfs:isDefinedBy the amended ODR + dct:source)
  1.2 fix profiles.py:250 + CONTEXT_OF map  (baspi5 → opda:EstateAgencyContext;
       profile-layer link, if still needed, moves to opda:profileLayer)
  1.3 dormant servesContext CONSTRUCT + dormant cross-check shape in shapes.py
  → blocks on NOTHING new.  After 1.1–1.3 the partition is real and authoritative in the
    ontology even with one profile.  [Davis Increment 1 — must-ship]

PHASE 2A — HOME track  (authored/generated; NOT gated by profiles)   gate: total-cover CI
  2A.1 generated definedInContext home-pass over the ~81 existing entities
       (default: descriptive → foundation/shared-kernel; per-term exceptions:
        Surveying owns valuation concepts; Conveyancing owns charge/search; HMLR-sourced
        → consumesFrom opda:Organisation); Q4a class promotions homed at promotion time
  2A.2 CI total-cover assertion: every domain term has definedInContext OR consumesFrom
       OR is on the scaffolding allow-list (D1/D2 distinct).   ← the "every entity placed" gate

PHASE 2B — USAGE track  (derived; long pole; can lag, ships dormant)   gate: per-profile round-trip
  2B.1 ADR-0028 935-leaf descriptive walk: dict-leaves → datatype props (xsd:string default,
       flat) + Q4a promotions + per-leaf opda:requires (upgrades derivation to term-grain)
  2B.2 ADR-0029: refactor _build_profile(ProfileSpec) — prove baspi5 byte-identical — then
       author 14 specs (ta6 → piq → fme1 → rds → lpe1/ta7/ta10 → oc1/llc1/con29),
       each overlaysContext → its industry concept via CONTEXT_OF
  2B.3 servesContext fills in mechanically as each profile lands; stays DORMANT
       (ODR-0019 Rule 8) until a named term-grain consumer

PHASE 3 — Join / coherence  (after 2A + 2B)        gate: cross-check report dispositioned
  3.1 home-vs-usage cross-check (sh:Warning): a term serving a context with no authored
      home is a placement-review flag, never a redefinition
  3.2 activate the CONSTRUCT only on the Rule 8 named-consumer trigger (likely future)
```

**Dependencies:** Phase 0 → all; Phase 1 is the shared substrate (scheme + predicates + bug-fix) → 2A and 2B; **2A is independent of 2B** (the load-bearing claim — placement-by-ownership does not wait on the 14 profile emitters); 2B is internally a demand-ordered backlog. **Emission order:** `opda-contexts.ttl` → `baspi5.ttl` (re-pointed) → descriptive TTL(s) + `definedInContext` → `ProfileSpec` refactor → remaining profiles (each re-pointed). **Gates:** byte-identity CI (ADR-0007 §6a) at every emission; **total-cover CI** is the "every entity placed" gate; BASPI5 round-trip (ODR-0010 §Q7) is the usage-path MVP; derivation stays dormant (ODR-0019 Rule 8).

**Vote Q5: 8–1–0 FOR the phased two-track plan** (Davis FOR Increment 1 / Phase 1; held against the completeness gate — same axis as Q2).

---

## Synthesis (Queen Kendall)

The architect's instinct was right and the council can say *where*. **Claim A is settled corpus law and is not violated** — ODR-0008's "ontology DEFINES; SHACL CONSTRAINS" and ODR-0010's "overlays are views over a fixed TBox" already hold; no form mints a term. **Claim B identified a real inversion**, but a narrow one: not in *deriving `servesContext`* (sound), and not even in ODR-0019/0020's design — it is that **ODR-0020 Rule 4 gated `definedInContext` to homonyms, and with zero homonyms the authored home layer was emitted on nothing, leaving the partition 100 % form-derived.** Guizzardi named it as an OntoClean level-confusion; Evans-Vernon as a Published-Language/ownership conflation; Cagle-Knublauch as closed-world validation leaking into open-world identity.

The cross-talk produced the resolution that unifies the 3–3 split: **`opda:definedInContext` is authored at the ontology layer but GENERATED FROM PROVENANCE** (each term's `dct:source` / data-dictionary originating-form), with a mechanical default (descriptive → foundation/shared-kernel) and a small adjudicated residue through ODR-0008 §Q1a's existing register. This is simultaneously (a) ontology-layer ownership (Claim B, Evans-Vernon, Guizzardi), (b) generated-not-hand-maintained, zero-drift (Allemang's derive-don't-declare; the data-dictionary *is* the named source Davis demanded), and (c) governed reference data with a clean firewall (Baker). `opda:servesContext` is retained verbatim as the derived, dormant, advisory usage view; a `sh:Warning` cross-check surfaces — never decides — divergence.

**On the user's goal of completeness:** the council delivers it as a **generated home-pass + total-cover CI assertion** (cheap, complete, not a hand-walk), with scaffolding explicitly untagged and the 14 profile emitters demand-ordered behind a `ProfileSpec` refactor. The bounded-context emission (Phase 1 = ADR-0026) ships first and independently; the descriptive walk is executed as the mechanical generator work Allemang showed it to be (~90 % mechanical), not parked as "demand-deferred."

**Answer to "do we need a separate ODR?" — No.** Amend **ODR-0019** (Rule 8 gate-split) and **ODR-0020** (ownership dimension + D1/D2 + authority note + firewall-CI) in place; revise **ADR-0026** (authority inversion + cross-check shape + CI + house-style deltas); create **ADR-0028** (descriptive walk + generated home-pass) and **ADR-0029** (`ProfileSpec` refactor + 14-profile rollout); add one ADR-0005 §G register row. The refinement is a `kind: pattern` refinement of records that already own the predicates — ODR-0001's self-amendment discipline places it in-place, not in a fresh ODR.

**Real-world governance handoff (ODR-0001 / adoption.md §3):** this verdict is a *proposal*. The amendments to accepted records (ODR-0019/0020) and the new ADRs are drafted under the methodology but require the OPDA WG / Modelling Sub-Committee to ratify; records stay `proposed` accordingly.

---

## Governance directive (2026-05-30) — SUPERSEDES the phased framing of Q5

Per ODR-0001 (*"Council verdicts shape proposals; the project's governance shapes adoption"*), the directing programme authority issued a binding directive after synthesis:

> **Everything is implemented in ONE GO. No stages. No gates. No phasing, no demand-deferral, no watching-briefs, no "ship-an-increment-then-stop." This is non-negotiable.**

This **supersedes the phased Q5 plan and the two-track sequencing above**, and **overrides Davis's held-as-live dissent** (the completeness/YAGNI/demand-pull objection): full coverage is the objective and is delivered as a single body of work. The council's *technical* findings stand unchanged (they say *what* to build and the *dependency order within the single delivery*); only the *staging* is struck.

**The single delivery includes ALL of the following, together:**

1. **Scheme + predicates + bug-fix** — `emitters/contexts.py` → `opda-contexts.ttl` (`opda:BoundedContextScheme` + 6 industry concepts + `opda:servesContext` / `opda:consumesFrom` / `opda:definedInContext`); fix `profiles.py:250` + `CONTEXT_OF`; ODR-0026's emission.
2. **The full 935-leaf descriptive walk** — every annotated leaf → `owl:DatatypeProperty` (dictionary-sourced, `xsd:string`-default range, flat per §Q6a) + the Q4a class-promotion pass + per-leaf `opda:requires` (term-grain). Not a slice; not demand-deferred — the complete walk (ADR-0028).
3. **All overlay-profile emitters** — the `ProfileSpec`/`_build_profile` refactor + **every** remaining form profile (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29, … — all ~14–18), each wired `overlaysContext` → its context (ADR-0029). All of them, this delivery.
4. **The generated `definedInContext` home-pass over every term** — authored-from-provenance for the full corpus (existing + walked), default descriptive → foundation/shared-kernel; D1/D2 split; upstream → `consumesFrom`.
5. **The `servesContext` derivation + the cross-check shape** — emitted and run over the now-complete profile set.

**Dependency order is build-order within the one delivery, not gates:** the scheme must exist before profiles point `overlaysContext` at its concepts; `profiles.py:250` must be fixed before derivation yields anything; the walk's terms must exist before profiles `require` them and before the derivation is term-grain. These are causal ordering inside a single commit/PR — **not** checkpoints that pause or defer work.

**Two points surfaced as caveats (acted on, not negotiated):**
- **Byte-identity / test verification is retained** — not as a staging *gate* but as the correctness check that the one-go delivery passes (ADR-0007 §6a determinism is a ratified build invariant, not an implementation phase). The CI baseline is re-pinned once, for the complete delivery.
- **`servesContext` CONSTRUCT activation** — emitting and *running* the derivation is in-scope this delivery; whether the CONSTRUCT also joins the **active validation set** vs. stays advisory is governed by **ODR-0019 Rule 8** (a ratified ontological rule about named-consumer activation, distinct from implementation staging). Delivering it active is compatible with "one go"; if Rule 8's dormancy is to be lifted too, that is a one-line ODR-0019 amendment folded into Phase 0's record edits. Flagged, not gated.

The Q4 scaffolding answer is unchanged (**no new ODR**; amend ODR-0019/0020, revise ADR-0026, create ADR-0028 + ADR-0029) — but ADR-0028 and ADR-0029 are now executed in the **same delivery** as ADR-0026, not sequenced behind it, and **no ADR-0005 §G "deferred remainder" row is created** (nothing is deferred).

---

## Tally appendix (two-artefact discipline)

### Per-voice vote table

| Voice | Q1 authority | Q2 placement/coverage | Q3 create & sequence | Q4 scaffolding | Q5 plan |
|---|---|---|---|---|---|
| Evans & Vernon | FOR hybrid (un-gate) | FOR (4-signal + total-cover CI) | FOR (home parallel; usage blocks) | amend 0019/0020 + 2 ADRs; no new ODR | FOR (2-track) |
| Guizzardi | FOR hybrid (un-gate, typed) | FOR (UFO home-pass; invariant) | FOR (home into the walk) | amend 0019/0020 + 1 ADR; no new ODR | FOR (2-track + coherence) |
| Cagle & Knublauch | FOR hybrid (invert authority) | FOR (SHACL completeness shape) | FOR (fix :250 first; ProfileSpec) | amend 0020 + new ADR; no new ODR | FOR (scheme-first) |
| Allemang | FOR hybrid (source = dict table) | FOR (computed place(); CI) | FOR (execute walk now, mechanical) | 0 new ODR; ADR-0028 + ADR-0029 | FOR (4-phase) |
| Baker | FOR hybrid (derive + governed) | FOR (firewall CI; set-complement) | AGAINST blocking (async backlog) | thin new sequencing ODR *or* amend | FOR (5-phase) |
| Davis (DA) | FOR derive; AGAINST author membership | AGAINST "every entity" | FOR independent; AGAINST bundling | no new ODR; execute ADR-0026 | Increment-1-only |
| **Kendall (Queen)** | **FOR hybrid (generated-from-provenance)** | **FOR (generated home + total-cover CI)** | **FOR (execute walk; non-blocking)** | **amend 0019/0020 + revise 0026 + ADR-0028/0029; no new ODR** | **FOR (2-track phased)** |

### Per-question count (by voice; 9 = 8 panel voices + Queen)

| Question | Tally `FOR–AGAINST–ABSTAIN` | Verdict |
|---|---|---|
| Q1 — membership authority (hybrid) | **9–0–0** (un-gating refinement carried 6–3) | Hybrid: `servesContext` derived; `definedInContext` authored, **generated-from-provenance**, un-gated |
| Q2 — placement & coverage | **8–1–0** | Generated home-pass + total-cover CI; D1/D2 split; scaffolding allow-list. Davis dissent **held-as-live** |
| Q3 — create & sequence | **9–0** non-blocking; **8–1** execute-walk-now | Walk is mechanical generator work; placement non-blocking; fix `:250` first; `ProfileSpec` before 14 |
| Q4 — scaffolding | **8–1–0** | No new ODR; amend ODR-0019 + ODR-0020; revise ADR-0026; create ADR-0028 + ADR-0029; §G row |
| Q5 — implementation plan | **8–1–0** | Two-track phased plan; Phase 1 shippable; total-cover CI gate; derivation dormant |

### DA scorecard (Ian Davis) — withdraw / hold per contested question

| Q | DA verdict | Named condition / disposition |
|---|---|---|
| Q1 | **WITHDRAWN** | Condition was "a dereferenceable, independently-maintained, non-form source for membership needing no manual update when a form moves." Met: `servesContext` stays derived; `definedInContext` is **generated from the data-dictionary provenance** (not hand-maintained) and, being a *home*, does not move when a form moves context. |
| Q2 | **HELD-AS-LIVE** | "Place every entity" has no named full-map consumer; Rule 8 / his S020 binding dissent stand. Re-open/withdraw trigger preserved verbatim below. (Cost objection answered — completeness is generated + CI, not a hand-walk — but the *gate-on-completeness* objection holds.) |
| Q3 | **WITHDRAWN** (scheme/sequencing) + **partial HOLD** (build-all-now) | Withdrew on context-scheme creation and on non-blocking sequencing (the plan makes nothing a precondition). Holds on scheduling the full 935 / 14 ahead of demand — folded into the Q2 held dissent. |
| Q4 | **WITHDRAWN** | His position (no new ODR; execute ADR-0026; §G register row) is the adopted verdict. |
| Q5 | **WITHDRAWN** (Increment 1) + **HOLD** (completeness gate) | Endorses Phase 1 as the shippable increment; holds against the total-cover CI being a *gate* — same axis as Q2. |

### Held-as-live dissent (recorded verbatim, per ODR-0001 §Roles)

> **Davis (DA), Q2/Q5 — held-as-live:** "AGAINST any 'place every entity' pass … The programme retired on a single BASPI5 round-trip; the MVP gate was never coverage. Who is the named consumer of the full context map? Name the query that the BASPI5-only slice cannot answer. If you can't, 'place every entity' violates Rule 8 and my S020 binding dissent."
>
> **Named re-open / withdrawal trigger:** Davis withdraws — for *exactly the entities a named query touches*, not the whole corpus — when a real consumer query is named that the BASPI5-slice-derived map plus the bucket-D/scaffolding default cannot answer. Until then the dissent stands against treating completeness as a build *gate* (it does not oppose the generated home-pass itself, which is cheap and non-drifting).
>
> **Queen disposition:** recorded — then **overruled by the directing governance (2026-05-30; see §Governance directive).** The synthesis adopts the parts of Davis's discipline that are *method, not staging* (generated-not-hand-authored homes; scaffolding explicitly untagged via the D2 allow-list; firewall + cross-check as guards). But his *staging* position — "ship one increment, defer the rest behind named-consumer triggers" — does **not** bind: governance ruled completeness is the objective, delivered in ONE GO, no demand-ordering, no deferral, no gates. Davis's objection is preserved here as the recorded minority position, **overruled by governance**, not withdrawn by him.

### Other positions recorded

- **Baker — thin sequencing ODR (not adopted):** Baker preferred a thin new implementation-sequencing/governance ODR over in-place amendments, but explicitly accepted "an amendment block inside ODR-0020" as the alternative; the council took the amendment route. Baker's governance deliverables (firewall CI guards F1/F2/F3; scheme rides foundation `owl:versionIRI`; `opda:hasSteward` Literal at two governance levels; `skos:exactMatch` to steward vocabularies deferred) are folded into the ADR-0026 revision and the ODR-0020 amendment.
- **UFO category of the context scheme (Baker → Guizzardi, for the WG):** the six contexts are an anti-rigid perspectival facet — none of ODR-0011 §8a's seven value-vocabulary categories. Recommendation: keep the context scheme **outside** the §8a `ufoCategory` value-lint regime (it is governed by ODR-0019/0020, not ODR-0011); fire the §8a eighth-category re-open trigger only if tooling demands an explicit triple.

---

## Downstream record impact

- **Amend (in place, WG-ratifiable):** ODR-0019 Rule 8 (gate-split); ODR-0020 Rule 4/5 (ownership dimension + D1/D2 + authority note + firewall-CI).
- **Revise:** ADR-0026 (authority inversion; cross-check shape; total-cover CI; house-style deltas).
- **Create (all in the SAME delivery, per the §Governance directive — not sequenced behind ADR-0026):** ADR-0028 (descriptive walk + generated home-pass) **and** ADR-0029 (`ProfileSpec` refactor + **all** profile emitters). **No ADR-0005 §G "deferred remainder" row** — nothing is deferred.
- **No new ODR.**
- Records touched stay `proposed` pending OPDA WG / Modelling Sub-Committee ratification (adoption.md §Real-world Governance Handoff).
