# Session 021 — Cagle & Knublauch (SHACL voices)

**Methodology:** ODR-0001, Full Council, agent-fan-out.
**Lens:** SHACL Core + SHACL-AF; TopBraid/TopQuadrant profile-composition and constraint-reuse practice. SHACL validates *data* against a TBox and is conventionally **downstream** of definition. Our whole contribution is to keep the *mechanism* (a SHACL-AF CONSTRUCT materialising a view) cleanly separated from the *source-of-truth* (what is authoritative for conceptual membership).

We have read: ODR-0010, ODR-0017, ODR-0019, ODR-0020, ADR-0026, ADR-0007, ODR-0008, `profiles.py`, `baspi5.ttl`.

---

## Headline position

The architect's two claims are **both substantially right, and they are the same claim seen twice.**

- **Claim A** ("overlays should only validate pre-defined terms, not define the ontology") is already ratified law in this corpus: ODR-0010 §Decision — "Overlays are views over a fixed TBox — they constrain, they do not declare." We do not need to re-decide it; we need to stop *violating* it.
- **Claim B** ("bounded contexts belong to the ontology, not the SHACL schemas — deriving the partition from forms may be a layering inversion") is the live one. ODR-0019/0020 made *the SHACL overlay profiles the single source of truth for conceptual membership* (ODR-0020 Rule 5; ODR-0019 Rule 3). That is the inversion. **A SHACL profile is a closed-world validation artefact; it is the wrong place to keep an open-world conceptual fact.**

Our reconciliation — and it is the spine of every vote below — is the distinction the SHACL-AF spec itself draws between a **rule** and a **constraint**:

- **A SHACL-AF `CONSTRUCT` (sh:rule / SHACL-AF §2 "Rules") is a perfectly legitimate mechanism** for materialising a derived *view*. We have used exactly this four times already (ODR-0017). Deriving `opda:servesContext` by CONSTRUCT is sound *as a projection*.
- **But a projection is not a source of truth.** `opda:requires` inside a form-profile answers the question *"what must a BASPI5 payload carry?"* — a closed-world validation question. It does **not** answer *"what does the Estate-Agency community of practice conceptually own?"* — an open-world ontology question. ODR-0020 currently makes the first the authority for the second. That is the layering inversion the architect smells, and SHACL's own Core-vs-AF / closed-vs-open-world architecture says it is real.

So we land on a **hybrid that inverts the authority direction without throwing away the derivation machinery**: author conceptual membership at the ontology layer (`opda:definedInContext`), keep the SHACL-AF CONSTRUCT as a *cross-check and convenience view* (`opda:servesContext` as a **derived, second-class, advisory** projection), and make divergence between the two a `sh:Warning` — never a definition. This is the TopBraid house pattern: shapes *reference* the model by targeting; they never *constitute* it.

---

## Q1 — MEMBERSHIP AUTHORITY

**Vote: AGAINST "derived from SHACL overlays as source-of-truth" (current ODR-0020 Rule 5). FOR a hybrid in which the ONTOLOGY layer is authoritative and the SHACL-AF CONSTRUCT is a derived cross-check.**

### Argument

SHACL is, by the Recommendation's own framing, a language for *validating RDF graphs against a set of conditions* (SHACL Core §1.1 "Introduction"). Its constraint components (Core §4) are closed-world presence/cardinality/value tests over *data*. SHACL-AF (the Advanced Features Note) adds **Rules** (§2) — `sh:rule`, `sh:TripleRule`, `sh:SPARQLRule` — explicitly to *infer/construct new triples*, and adds Functions (§5) and Node Expressions (§6). Crucially, SHACL-AF §2.1 frames rules as producing **entailments scoped to a shapes graph** — a *derived view*, computed from inputs, recomputable, discardable. Nothing in SHACL-AF positions a rule's *inputs* as the authoritative home of the *concept* the rule projects.

ODR-0020 Rule 5 reads `?vc opda:overlaysContext ?ctx ; opda:requires ?term` and CONSTRUCTs `?term opda:servesContext ?ctx`. Mechanically: fine. As source-of-truth: **inverted.** It makes `opda:requires` — a per-form *validation requirement* ("BASPI5 demands this leaf be present") — the authority for *conceptual membership* ("this term is conceptually of the Estate-Agency context"). Those are different propositions:

- `opda:requires` is **anti-monotonic under form evolution**: drop a leaf from BASPI5 v6 and the term silently loses its context membership, even though the concept never moved. Membership of a *community of practice* (ODR-0019's own characterisation: a perspectival Role-like community) is not supposed to evaporate because a form template was edited. SHACL-AF rules are *recomputed on every run* — so the conceptual partition would flicker with every form revision. That is a closed-world artefact leaking open-world identity, the precise confusion ODR-0010 §Graph-separation warns against ("`sh:minCount 1` is not `owl:minCardinality`; open-world OWL/RDFS must not be confused with closed-world SHACL").
- It is **silent on the non-overlay majority.** ODR-0020 Bucket D ("untagged scaffolding — no edge") means every foundation term has *no* derivable context at all. If the profiles are the source of truth, the kernel of the ontology is, by construction, context-*less*. That is acceptable for a *view* (absence = "no form references this") but indefensible for a *definition* (the kernel obviously belongs *somewhere* conceptually — `opda:Address` is conceptually shared-kernel, not "nowhere").

**TopBraid/TopQuadrant practice** (Knublauch's own house style at TopQuadrant, and the EDG modelling discipline) is unambiguous on this: the *taxonomy/ontology* layer owns conceptual classification; SHACL *shapes* reference it via `sh:targetClass` / `sh:targetNode` and never originate it. In EDG, a "subject area" or "collection" membership is asset metadata on the model, and shapes *validate against* it — you would never reverse-engineer the subject-area partition by reading which forms happen to require which fields. Reasoning over SKOS taxonomies for *classification* sits at the model layer; SHACL sits over the data.

### Therefore — the hybrid (concrete)

1. **`opda:definedInContext` becomes the authoritative, hand-authored (or generator-authored-from-an-ontology-input) membership predicate** for the six industry contexts and for kernel terms. This already exists in ODR-0019 Rule 5 as an `owl:AnnotationProperty`. We promote it from "homonym-only exception" to **the primary membership statement** at the ontology layer. It lives in the *classes* graph context-block, not the shapes graph.
2. **`opda:servesContext` stays exactly the SHACL-AF CONSTRUCT of ODR-0020 Rule 5 — but is re-labelled in intent as a DERIVED VIEW, not the source of truth.** It answers a genuinely useful, distinct question: *"which forms, in practice, route payloads bearing this term?"* That is real and worth materialising. It is just **not** the definition of conceptual membership.
3. **The cross-check shape (our signature contribution — see Q3) raises `sh:Warning` when the derived `opda:servesContext` set diverges from the authored `opda:definedInContext` / declared kernel set** — i.e. a term a profile requires that nobody authored into that context, or a term authored into a context no profile exercises. Divergence is *information* (an Info/Warning per ODR-0017 §2a severity tiers), never a *redefinition*.

This **keeps every line of the ODR-0020 derivation machinery** (the architect is not asking us to throw away SHACL-AF), **fixes the inversion** (authority moves to the ontology), and **discharges Claim B**. It is a one-predicate change of *role*, not a rebuild.

> **Direct rebuttal to "membership is derived because hand-authoring drifts" (ODR-0019 Rule 3 / ODR-0020 Alt-rejected).** The anti-drift argument is correct *for validation requirements* — you should not hand-maintain "BASPI5 requires UPRN" when the form schema already says so. But conceptual context membership is **not** a fact the form carries; it is a fact *about the concept*. Deriving it from forms doesn't eliminate a second source of truth — **it manufactures one**, by promoting a validation artefact to a conceptual authority it was never fit to be. The genuine anti-drift win (don't duplicate form requirements) is preserved: `opda:servesContext` *stays* derived. We only refuse to let the derived thing *be* the definition.

---

## Q2 — PLACEMENT METHOD & COVERAGE

**Vote: FOR a complete two-source placement method; the SHACL contribution is the completeness CHECK, not the placement itself.**

Placement of *every* entity cannot come from the profiles alone — ODR-0020 Bucket D proves it (kernel/scaffolding = no profile edge = no placement). Our method, consistent with Q1:

### Placement method (per entity)

| Source of the placement | Predicate | When |
|---|---|---|
| **Authored at ontology layer** (the conceptual home, decided by the modeller per ODR-0019 Rule 4 IC-test) | `opda:definedInContext` → one Context concept (or none, for a deliberate shared-kernel term) | The **primary** statement. Every domain class gets *either* a `definedInContext` *or* an explicit shared-kernel marker. No silent gaps. |
| **Derived from profiles** (the usage projection) | `opda:servesContext` → 0..n Context concepts (SHACL-AF CONSTRUCT) | Computed, advisory. Multiplicity = ODR-0020 Bucket B "spanning". |
| **Upstream provenance** (Conformist) | `opda:consumesFrom` → `opda:Organisation` | ODR-0020 Rule 2 / Bucket C. We agree entirely — an upstream authority is an Agent, not a perspective; `consumesFrom` is correct and is *not* a SHACL concern. |

**Multi-membership:** handled natively — `opda:servesContext` is 0..n (a term required by `piq`+`ta6` derives two edges, ODR-0020 Bucket B). `opda:definedInContext` is conceptually 1 for a Kind with a single home, but MAY be multi for a genuine shared-kernel concept; we recommend the *shared-kernel* case be modelled as **no `definedInContext` + an explicit `opda:isSharedKernel true` (or membership of an `opda:SharedKernelContext`)**, so "kernel" is a *positive authored assertion*, not the *absence* of a tag. (ODR-0020 Rule 4 Bucket D makes absence-of-tag the kernel signal — we think that is fragile; see the completeness check below. This is our one real friendly amendment to ODR-0020.)

**Untagged:** under our method there is no "untagged by accident" — the completeness CI shape (below) fails the build if a domain class has neither `definedInContext`, nor a shared-kernel marker, nor a `consumesFrom`. Absence becomes detectable rather than meaningful-by-convention.

**Upstream-as-Organisation / spanning:** we concur with ODR-0020 Rules 2 & 3 verbatim. These are not SHACL questions and we have no quarrel. Spanning-as-multiplicity is elegant and we endorse it *for the derived `servesContext` view*; the *authored* layer should still be able to say "this is deliberately shared-kernel" positively.

### Completeness check (SHACL — our deliverable)

A `sh:Violation` node shape over the domain classes asserting *placement totality*:

```turtle
opda:ContextPlacementCompletenessShape a sh:NodeShape ;
    sh:targetClass owl:Class ;            # every minted OPDA class …
    sh:or (
        [ sh:path opda:definedInContext ; sh:minCount 1 ]
        [ sh:path opda:isSharedKernel ;   sh:hasValue true ]
        [ sh:path opda:consumesFrom ;     sh:minCount 1 ]
    ) ;
    sh:severity sh:Violation ;
    sh:message "Every OPDA domain class MUST declare a context home: opda:definedInContext, or opda:isSharedKernel true, or opda:consumesFrom an Organisation." .
```

(Targeting refinement needed so it fires on *domain* classes, not on infrastructural/`owl:Ontology`/SKOS-scheme resources — see Q3 targeting note. SHACL Core §2.1.3 `sh:targetSubjectsOf` / a marker class like `opda:DomainClass` is the clean way.)

This is the SHACL-correct expression of "place EVERY entity": not by *deriving* placement, but by *failing the build* if any entity lacks an authored placement. **SHACL's job here is to guarantee coverage, not to invent it.**

---

## Q3 — MISSING-ONTOLOGY CREATION & SEQUENCING (the operational plan)

This is the heart of our brief. Three deliverables, in dependency order.

### 3.1 — Fix `profiles.py:250` FIRST (the precondition for everything)

**Verified bug** (we read it): `profiles.py:250-251` emits

```python
g.add((vctx, OPDA.overlaysContext,
       URIRef("https://w3id.org/opda/profiles/foundation")))
```

This is a profile-LAYER IRI. Every derivation in ODR-0020 Rule 5 reads `overlaysContext` to find the context — so today it yields a *profile layer*, which is unmappable. The fix (ADR-0026 work-item 3, which we endorse):

1. Add a `CONTEXT_OF` map at module scope in `profiles.py`:
   ```python
   CONTEXT_OF: dict[str, URIRef] = {
       "baspi5": OPDA.EstateAgencyContext,
       "ta6":    OPDA.ConveyancingContext,
       "ta7":    OPDA.ConveyancingContext,
       "ta10":   OPDA.ConveyancingContext,
       "lpe1":   OPDA.ConveyancingContext,
       "fme1":   OPDA.MortgageLendingContext,
       "piq":    OPDA.SurveyingContext,
       "rds":    OPDA.PropertyDataServicesContext,
       "oc1":    OPDA.PropertyDataServicesContext,
       "llc1":   OPDA.PropertyDataServicesContext,
       "con29":  OPDA.PropertyDataServicesContext,
       "base":   OPDA.PropertyTechnologyContext,
   }
   ```
   (The mapping is ODR-0020 Rule 6's table verbatim. Note `base`→PropertyTechnology is ODR-0020 Rule 6's own assignment; we flag it as the one we'd ask Davis/Allemang to sanity-check, because "the base transaction belongs to PropTech" is itself a conceptual placement, not a form fact — which is *exactly* our Q1 point in microcosm: even the overlay→context map is **authored**, not derived. Someone *decided* baspi5→EstateAgency. That decision lives in code as authored data, confirming membership authority is conceptual.)
2. Replace line 250-251 with `g.add((vctx, OPDA.overlaysContext, CONTEXT_OF[overlay]))`.
3. If ODR-0010 still needs the profile-layer link (it does, for composition layering), retain it under a **distinct predicate** `opda:profileLayer` — do not overload `overlaysContext`. (ADR-0026 work-item 3 says the same.)
4. **Byte-identity consequence:** `baspi5.ttl` line 75 changes from `opda:overlaysContext <https://w3id.org/opda/profiles/foundation>` to `opda:overlaysContext opda:EstateAgencyContext`. The CI baseline MUST be re-pinned in the same commit (ADR-0007 §6a; ADR-0026 Confirmation "bug-fix test").

**This fix is independent of the Q1 authority debate** and should land regardless: even as a *derived view*, `servesContext` is empty/wrong until `overlaysContext` points at a context. It is the single highest-leverage line in the whole programme.

### 3.2 — The ~14 overlay-profile emitters (operational build-list)

**Critical finding from reading the code:** `profiles.py` does **not** have a generic profile-composition engine. `_build_baspi5_profile()` (lines 188-608) is **420 lines of hand-coded, BASPI5-specific shape construction** — per-class NodeShapes, per-leaf `_add_property_shape(...)` calls with hardcoded paths/anchors/groups, a hand-built `sh:xone` for `sellersCapacity`. `PROFILE_FILENAMES` (line 98) lists only `baspi5`; `emit_profile` (line 666-669) hard-branches `if overlay == "baspi5"` and raises `NotImplementedError` for anything else. **So "the other 14 profiles" is not a config change — each is currently a bespoke builder to write.**

That is a smell. Before authoring 14 more 400-line hand-builders, **refactor to a data-driven composition function** — this is the TopBraid/TopQuadrant constraint-reuse discipline (don't re-hand-author shapes; compose them from a declarative spec + shared shape library). Operational plan:

**Phase 3.2a — Extract a generic `_build_profile(spec: ProfileSpec) -> Graph`.** Generalise the BASPI5 builder so the per-form variation is *input data*, not *code*. A `ProfileSpec` (dataclass / JSON / parsed from the overlay's `*.json` schema under `source/03-standards/schemas/src/schemas/v3/overlays/`) carries, per the ODR-0010 §Rules canonical mapping (Knublauch's 12-0 mapping):

| ProfileSpec field | ODR-0010 Rule | SHACL output |
|---|---|---|
| `required: [path,…]` | Rule 1 (required-array union) | `sh:property [ sh:path … ; sh:minCount 1 ]` |
| `enum_subset: {path: [members]}` | Rule 2 (enum union → **merged** `sh:in`, build-step **replacement** not stacking) | single `sh:in (…)` — **never two `sh:in` on one path** |
| `oneOf: {discriminator, branches}` | Rule 3 (`oneOf` → `sh:xone`, nested) | `sh:xone (…)` with `sh:qualifiedValueShape` on the discriminator |
| `leaf_refs: {path: anchor}` | Rule 4 (`baspi5Ref` → `dct:source`) | `dct:source <…/forms/<form>#<anchor>>` |
| `ui: {path: {viewer,editor,order,group}}` | Rule 5 (DASH) | `dash:viewer`/`dash:editor`/`sh:order`/`sh:group` |
| `requires: [class,…]` | ODR-0010 §Q1 | `vctx opda:requires <class>` |
| `context` | ODR-0020 Rule 6 | `vctx opda:overlaysContext CONTEXT_OF[id]` |

The `sh:minCount`/`sh:in`/`severity` per-form values are exactly the fields above. Severity defaults to `sh:Violation` (the ODR-0013 floor, already the helper default at `profiles.py:140`); descriptive-range warnings sit at `sh:Warning` per ODR-0008 Q7a / ODR-0013.

**Phase 3.2b — Author the 14 specs, NOT 14 builders.** Each overlay becomes a `ProfileSpec` populated by walking its overlay JSON (the same well-known-structure walk BASPI5 uses, lines 188-608, but parameterised). Build order — **drive it by ODR-0008 leaf coverage + context priority**, not alphabetically:

1. **`ta6` (Conveyancing)** — highest-volume conveyancing form (178 leaves per ODR-0008); proves the generic builder on a second context and a second discriminator family.
2. **`piq` (Surveying, 184 leaves)** — proves Surveying; shares `floodRisk`/condition leaves with ta6 → **first real Bucket-B spanning test** (two `servesContext` edges materialise).
3. **`fme1` (Mortgage Lending)** — proves the Mortgage context; smaller, fast win.
4. **`rds` (Property Data Services, 196 leaves)** — largest; exercises the descriptive-layer reconciliation hard.
5. **`lpe1`, `ta7`, `ta10`** (Conveyancing) — same context, incremental specs.
6. **`oc1`, `llc1`, `con29`** (PropertyDataServices / authority-sourced) — these stress **Bucket C** (`consumesFrom` HMLR/LA), the cleanest test that authority-sourced terms get `consumesFrom`, *not* `servesContext`.

**Each new profile, when emitted, MUST:** (a) set `overlaysContext` via `CONTEXT_OF` (3.1); (b) pass the three-rule contract test (`profile_contract_test.py`, already wired per `profiles.py` docstring lines 11-14); (c) re-pin byte-identity.

### 3.3 — The 935-leaf walk: does placement BLOCK on it?

**Partially — and the dependency is precise.** Verified state: `opda-descriptive.ttl` is a 5-class stub with **0 datatype properties**; only the BASPI5 subset (17+2) is emitted; the 935-leaf walk (ODR-0008 §Consequences "the mechanical 935-leaf walk now begins") is **not executed**. The BASPI5 `ValidationContext` `opda:requires` only 7 classes (`profiles.py:245-249`), not the descriptive leaves.

The dependency chain for *derivation to produce anything meaningful*:

```
935-leaf walk (ODR-0008)  ──produces──▶  the opda: terms that profiles reference
        │
        ▼
profile emitters (3.2)    ──set──▶  opda:requires <term> + opda:overlaysContext <context>
        │
        ▼
profiles.py:250 fix (3.1) ──makes──▶  overlaysContext point at a real context
        │
        ▼
SHACL-AF CONSTRUCT (3.4)  ──derives──▶  opda:servesContext (the view)
```

**So:**
- **The scheme + the six concepts (ADR-0026 work-item 1) do NOT block on the walk.** Emit `opda-contexts.ttl` now — it is pure SKOS reference data plus three annotation-property declarations. This is the MVP and should ship first.
- **`opda:definedInContext` authored placement (our Q1 authority) does NOT block on the walk** for the *classes that already exist* (~81 entities). Place those now.
- **The derived `opda:servesContext` view is empty-and-correct until both 3.2 (profiles requiring real terms) AND 3.3 (the walk emitting those terms) progress.** It ships **dormant** anyway (ODR-0019 Rule 8) — so "empty" is the *correct* dormant state. **Derivation does not block; it is gated.** This is the clean part: the dormancy gate (Rule 8) means we are *not* on a critical path to a working CONSTRUCT — we are on a critical path to a working *authored* placement, which is exactly where authority should sit.

**Verdict:** Placement (authored) blocks on *nothing* for existing classes — do it now. Placement of descriptive-leaf terms blocks on the 935-leaf walk, which is independent ODR-0008 backlog. The *derivation view* blocks on both but is dormant, so it is not gating. **This is a strong argument for our Q1 hybrid: the authored layer can be complete for the real ontology today; the derived layer cannot, and shouldn't be the authority for something that can't be computed yet.**

### 3.4 — The SHACL-AF CONSTRUCT + the cross-check shape (ship together, both dormant)

Author in `emitters/shapes.py` → `opda-shapes.ttl`, both excluded from the active validation set (dormant, ODR-0017 + ODR-0019 Rule 8):

**(a) The derivation rule** (ODR-0020 Rule 5, a `sh:TripleRule` / SHACL-AF §2.2 form so the triple can enter the data graph, OR a `sh:SPARQLRule` §2.3 with the CONSTRUCT body):

```turtle
opda:ServesContextDerivationRule a sh:NodeShape ;
    sh:targetClass opda:ValidationContext ;
    sh:rule [ a sh:SPARQLRule ;
        sh:construct """
            CONSTRUCT { ?term opda:servesContext ?ctx }
            WHERE { $this opda:overlaysContext ?ctx ; opda:requires ?term .
                    FILTER( STRSTARTS(STR(?term), STR(opda:)) ) }
        """ ;
        sh:condition opda:ServesContextDerivationRule ] .
```

**(b) The cross-check shape (our signature deliverable — operationalises Claim B as a guard rather than a redefinition):**

```turtle
opda:ContextDerivationCrossCheckShape a sh:NodeShape ;
    sh:targetClass owl:Class ;
    sh:sparql [
        sh:select """
            SELECT $this ?derivedCtx WHERE {
                $this opda:servesContext ?derivedCtx .
                FILTER NOT EXISTS { $this opda:definedInContext ?derivedCtx }
                FILTER NOT EXISTS { $this opda:isSharedKernel true }
            }
        """ ;
        sh:severity sh:Warning ;     # NEVER sh:Violation — a divergence is information, not a definition
        sh:message "Derived servesContext {?derivedCtx} on {$this} has no authored opda:definedInContext backing it — a form requires this term in a context the ontology has not claimed. Review placement."
    ] .
```

This is `implements: ODR-0017` (SHACL-AF non-blocking quality-rule pattern): severity ∈ {Info, Warning}, placed in `opda-shapes.ttl`, machine-parseable `sh:message`, no `owl:sameAs` materialised — it satisfies all seven ODR-0017 Rules. It is the SHACL embodiment of our Q1 stance: **the derived view CROSS-CHECKS the authored truth; it never overwrites it.** When a profile requires a term into a context no one authored, that is a *finding* a modeller should look at — maybe the placement is missing (author it), maybe the form is over-reaching (a form smell). Either way SHACL *surfaces* it; it does not *decide* it.

> **Targeting caveat (SHACL Core §2.1):** `sh:targetClass owl:Class` over-targets — it would fire on infrastructural resources. Use a `sh:target` with a SPARQL selector, or a marker (`opda:DomainClass`), or `sh:targetSubjectsOf opda:definedInContext` for the cross-check. The generator already knows which terms are domain classes (it mints them); emit the marker.

---

## Q4 — ODR/ADR SCAFFOLDING

**Vote: FOR a focused amendment to ODR-0020 (the authority inversion) + a new ADR for the profile-emitter refactor + a revision to ADR-0026. AGAINST a brand-new ODR for the membership question (ODR-0019/0020 already own it — amend, don't proliferate).**

Enumerated:

1. **Amend ODR-0020 Rule 5 + Rule 4 (authority inversion).** This is the substantive Council output of S021. Change: `opda:servesContext` is re-scoped from "the single source of truth" (current Rule 5) to "a derived, dormant, advisory VIEW that cross-checks the authoritative `opda:definedInContext`." Add the cross-check-shape obligation. Add the shared-kernel positive marker (our Q2 amendment). **This is an amendment, not a new ODR** — it refines the record that owns the decision, per ODR-0001 self-amendment. *If* the Council judges the inversion large enough to warrant its own record, a thin `kind: pattern` ODR-0021 "Conceptual-membership authority vs derived-usage view" is defensible — but our preference is amend-in-place, because the IC-test and UFO grounding already live in ODR-0019/0020 and splitting them weakens both.
2. **New ADR-0027 (or next free number) — "Overlay-profile emitter generalisation."** The verified finding that `profiles.py` hand-codes each profile (no generic composer; `NotImplementedError` for non-baspi5) is an *architecture* decision, not an ontology one. It deserves its own ADR: the `ProfileSpec` data model, the `_build_profile(spec)` refactor, the build order (3.2b), the per-form severity/`sh:in`/`sh:minCount` derivation, and the byte-identity re-pin cadence across 14 emissions. ADR-0026 is scoped to the *scheme* emission and explicitly defers the profiles ("downstream work … their own ADR" — ADR-0026 Consequences, line 53). This is that ADR.
3. **Revise ADR-0026** to reflect Q1: work-item 2 currently declares `opda:servesContext` as the membership predicate; it should declare `opda:definedInContext` as **authoritative** and `opda:servesContext` as **derived/advisory**, and add the cross-check shape to work-item 4 (dormant derivation). The `profiles.py:250` fix (work-item 3) and `CONTEXT_OF` are correct as written — keep them. The Confirmation section gains the cross-check-shape dormancy test.
4. **No change to ODR-0010, ODR-0017, ODR-0008.** ODR-0010 already says overlays constrain-not-declare (we're enforcing it, not amending it). ODR-0017 is the pattern both dormant rules implement (cite it). ODR-0008's 935-leaf walk is independent backlog.

---

## Q5 — IMPLEMENTATION PLAN (phases, gates, emission order)

Sequenced so that each phase is independently byte-identity-CI-green and nothing ships non-dormant before its gate.

**Phase 0 — `profiles.py:250` fix + `CONTEXT_OF` (3.1).** Smallest, highest-leverage. One predicate, one map. Gate: `baspi5.ttl` emits `opda:overlaysContext opda:EstateAgencyContext`; **byte-identity baseline re-pinned in the same commit** (ADR-0007 §6a). This must precede everything because every derivation reads `overlaysContext`.

**Phase 1 — `emitters/contexts.py` → `opda-contexts.ttl` (ADR-0026 work-item 1+2).** The scheme + six concepts + three annotation-property declarations (`opda:definedInContext`, `opda:servesContext`, `opda:consumesFrom`, + our `opda:isSharedKernel`). Wire under `owl:imports` from foundation (ADR-0011). Bump `foundation.ttl` `owl:versionInfo`. Gate: ADR-0026 structural tests (one scheme, six concepts, each `skos:topConceptOf`); byte-identity re-pin. **Does not block on the walk.** This is the MVP.

**Phase 2 — Authored placement of the ~81 existing classes (`opda:definedInContext` / `opda:isSharedKernel`).** The Q1 authoritative layer, for the ontology that exists today. Emit from a generator input (an authored context-map, mirroring how `CONTEXT_OF` is authored code). Gate: the `ContextPlacementCompletenessShape` (Q2) passes for all existing domain classes — **no silent gaps**. This is where Claim B is *discharged in artefact*: the partition now lives in the ontology, authored, before any form derivation exists.

**Phase 3 — Dormant SHACL-AF CONSTRUCT + cross-check shape (3.4) in `opda-shapes.ttl`.** Both excluded from the active validation profile (ODR-0017 + ODR-0019 Rule 8). Gate (ADR-0026 dormancy test, extended): both shapes parse, are present, and fire **zero** results on the 15 exemplars in the active set. Byte-identity re-pin.

**Phase 4 — Profile-emitter generalisation (new ADR-0027): `ProfileSpec` + `_build_profile`.** Refactor BASPI5 to flow through the generic path; prove byte-identity is *preserved* (the refactor must emit `baspi5.ttl` byte-for-byte identical — this is the regression gate that proves the generalisation is behaviour-preserving). Gate: `baspi5.ttl` unchanged after refactor; `profile_contract_test.py` green.

**Phase 5 — Author the 14 profile specs, in the 3.2b order (ta6 → piq → fme1 → rds → lpe1/ta7/ta10 → oc1/llc1/con29).** Each lands its `ValidationContext` with `overlaysContext` + `requires`; each re-pins byte-identity; each grows the (still-dormant) derived `servesContext` view. **`piq` is the milestone** — first real Bucket-B spanning (floodRisk → Surveying + Conveyancing), the first time the cross-check shape has something non-trivial to potentially warn about. **`oc1`/`llc1`/`con29` are the Bucket-C milestone** — proves authority-sourced terms get `consumesFrom`, not `servesContext`.

**Phase 6 — Walk-gated descriptive terms.** As ODR-0008's 935-leaf walk emits descriptive datatype properties, profiles' `requires` lists extend to them and the derived view fills out. Independent backlog; not gating the context model.

**Phase 7 — Rule-8 activation (future, out of S021 scope).** When a named term-grain consumer arrives, flip the CONSTRUCT + cross-check from dormant to active. At that point the cross-check `sh:Warning`s become a live placement-review queue. Not now.

### Gates summary

- **Byte-identity / CI** (ADR-0007 §6a) re-pinned at **every** phase that emits (0,1,2,3,4,5,6). Non-negotiable.
- **MVP gate** = Phase 1 (scheme emitted) + Phase 2 (existing classes placed). After these, the bounded-context model is *real and authoritative in the ontology* even with zero profiles beyond baspi5.
- **Three-rule contract** (`profile_contract_test.py`) green on every emitted profile (Phases 4,5).
- **Dormancy** (ODR-0017 / ODR-0019 Rule 8): both derived shapes fire zero on the active exemplar set until Phase 7.
- **Completeness** (`ContextPlacementCompletenessShape`): every domain class has an authored home; build fails on a gap.

### Emission order (canonical, per ADR-0007 deterministic-emission)

`opda-contexts.ttl` (new) → re-pin; `baspi5.ttl` (overlaysContext fix) → re-pin; classes-graph context-block (`definedInContext`/`isSharedKernel`) → re-pin; `opda-shapes.ttl` (+ 2 dormant shapes) → re-pin; then each new `profiles/<form>.ttl` → re-pin in turn. `foundation.ttl` `versionInfo` bumps with the contexts artefact (the scheme rides the foundation `owl:versionIRI`, ADR-0026 work-item 5).

---

## Citations

- **SHACL Core** (W3C Rec, Knublauch & Kontokostas 2017): §1.1 (validation of RDF graphs — SHACL is over *data*); §2.1 (targets — `sh:targetClass`/`sh:targetNode`/`sh:targetSubjectsOf`; shapes *reference* the model, never constitute it); §4 (Core constraint components — closed-world presence/cardinality/value); §5.2.6 (SPARQL-based constraints — the cross-check shape's form); §6.5 (severity — `sh:Info`/`sh:Warning`/`sh:Violation`).
- **SHACL-AF** (W3C WG Note, Knublauch/Allemang/Kontokostas): §2 (Rules — `sh:rule`); §2.2 (`sh:TripleRule`); §2.3 (`sh:SPARQLRule` — the CONSTRUCT derivation); §2.1 (rules produce a *derived view* scoped to a shapes graph — **a projection, not a source of truth**); §5/§6 (Functions / Node Expressions). The rule/constraint distinction is the crux of our Q1 vote.
- **TopBraid / TopQuadrant practice** (Knublauch, TopBraid EDG / DASH): the ontology/taxonomy layer owns conceptual classification (subject areas, collections, asset metadata); SHACL shapes validate *against* it via targeting and never reverse-engineer the partition from validation requirements. Constraint-reuse via shared shape libraries + declarative specs (the `ProfileSpec` discipline) over hand-authored per-form shapes. DASH (`dash:viewer`/`editor`) for form rendering, per ODR-0010 Rule 5.
- **ODR corpus**: ODR-0010 §Decision + §Graph-separation (overlays constrain-not-declare; closed-world SHACL ≠ open-world OWL — Claim A is already law); ODR-0017 §Rules 1-7 + §2a (the non-blocking pattern both dormant shapes implement); ODR-0019 Rule 3/4/5/8 (the inversion we contest + the dormancy gate we endorse + `definedInContext` we promote); ODR-0020 Rule 5/6 (the CONSTRUCT we keep-as-view + the `overlaysContext` fix); ADR-0007 §6a (byte-identity); ADR-0026 (scheme emission + the `profiles.py:250` fix we endorse and the profile backlog we ADR-ise).

---

## One-paragraph settle

Claim A is settled corpus law; we enforce it. Claim B is correct: ODR-0020 made a closed-world SHACL validation artefact (`opda:requires` in a form-profile) the source of truth for an open-world conceptual fact (community-of-practice membership), and that is a layering inversion the SHACL-AF rule/constraint architecture itself diagnoses. **Fix:** keep the derivation machinery, invert the authority. `opda:definedInContext` authored at the ontology layer is the truth; the SHACL-AF `CONSTRUCT` of `opda:servesContext` is a dormant, advisory *view*; a `sh:Warning` cross-check shape flags where the view diverges from the truth, surfacing placement gaps without ever redefining them. Operationally: fix `profiles.py:250` first (one predicate, the precondition for any derivation), emit the scheme + author placement for the 81 existing classes (the MVP, blocked on nothing), refactor the hand-coded profile builder into a data-driven `ProfileSpec` composer before authoring the other 14 (each a spec, not a 400-line builder), ship both derived shapes dormant behind Rule 8, and re-pin byte-identity at every step.
