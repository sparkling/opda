# Session 021 — Dean Allemang

*Lens: derive-don't-declare / generator-first / model-the-data-you-have. Grounding per ODR-0001: Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist*, 3rd ed., Morgan Kaufmann 2020 — esp. Ch. 3 (RDF as data, not schema-first), Ch. 7–8 (model the instance data you actually have), Ch. 13 (good/bad modelling: single source of truth, "don't model what you can't populate").*

## Verified state I am reasoning from (read, not assumed)

- `profiles.py:248–251` emits `opda:overlaysContext <https://w3id.org/opda/profiles/foundation>` — a **profile-LAYER** IRI. Confirmed. The ODR-0020 derivation reads `overlaysContext` to find a term's context, so today it derives **nothing mappable**.
- `opda:requires` in the BASPI5 ValidationContext (`profiles.py:244–247`) points at **seven classes** (`Property, Address, LegalEstate, Seller, Buyer, EPCCertificate, Survey`) — **not** at per-leaf datatype properties. This is decisive and under-discussed in ODR-0020: the derivation `?vc opda:requires ?term` currently can only ever yield **class-grain** `servesContext`, never the term-grain ODR-0019 Rule 8 gate is written around.
- `opda-descriptive.ttl` = **5 classes, 0 datatype properties**. The 935-leaf descriptive walk is ratified-as-discipline (ODR-0008) but **not mechanically executed**.
- Total emitted datatype properties across all module TTLs = **31** (23 property + 4 agent + 2 transaction + 1 claim + 1 classes). Against ~935 annotated leaves. ADR-0005 §G11 closed the BASPI5 slice (17 property + 2 agent + a few identity predicates); "the remaining ~44 [Q5a] leaves land per downstream demand" — and the far larger ~900 non-Q5a descriptive leaves were never scheduled at all.
- `opda-contexts.ttl`: does not exist. `emitters/contexts.py`: does not exist. Nothing bounded-context is emitted.
- Data dictionary canonical: 8,458 entries (the flat leaf list); ~1,556 unique leaves, 935 annotated.

So the council is planning on top of an ontology that has executed **~3%** of its own descriptive discipline and **0%** of its bounded-context discipline. That ratio shapes every answer below. My governing rule: **derive what has a maintained source; generate what the data dictionary mechanically yields; declare by hand only the residue that neither covers — and don't model what we can't yet populate** (SWWO 3e, Ch. 13).

---

## Q1 — Membership authority

**Vote: FOR derive-from-profiles as the *mechanism*, but AGAINST the *current* ODR-0020 framing that the SHACL `requires` edge is the authoritative source. Net: HYBRID, with a correction. ABSTAIN on nothing.**

### Steelman of pure derivation (my own instinct, made as strong as it goes)

Derive-don't-declare is right and I will defend it against Evans-Vernon and Guizzardi. The argument is DRY applied to ontology (SWWO 3e Ch. 13, "single source of truth"): a hand-authored `servesContext` table is a *second* assertion of a fact the profiles already carry, and the moment a profile moves context the table is silently wrong. ODR-0019/0020 are correct that hand-authored membership is "a drift-prone second source of truth." The profiles are **real, maintained artifacts** — they are not a convenience invented to back-derive a taxonomy; they exist because every PDTF payload validates through exactly one of them. That is a genuine, load-bearing, independently-motivated source. So the *direction* (derive) is not in question for me.

### Where I break with the current ODR-0020 framing (this is the architect's Claim B, and the architect is half-right)

The question ODR-0020 does not cleanly answer: **is the SHACL `requires` edge the *authoritative* source for conceptual membership, or merely the *convenient* one?** Two facts say "merely convenient as currently wired":

1. **Grain mismatch (verified).** `opda:requires` today targets **classes**, not the descriptive datatype properties the 935-leaf walk will mint. The derivation rule `?vc opda:overlaysContext ?ctx ; opda:requires ?term` therefore derives `opda:Property servesContext opda:EstateAgencyContext` — true but coarse. It will **never** derive `opda:builtForm servesContext opda:EstateAgencyContext` until someone adds ~935 `opda:requires` edges (one per leaf, per profile) to the ValidationContexts. So "derive from profiles" is not free: it presupposes a **second mechanical walk** that enumerates per-leaf `requires` edges into ~15 ValidationContexts. That walk is itself generator work, and its *source* is the data dictionary's per-overlay leaf table — not the SHACL file. The SHACL file is the **carrier**, the dictionary is the **source**.

2. **The more-authoritative single source already exists, and it is data.** The architect's instinct that "bounded contexts belong to the ontology, not the SHACL schemas" lands on something true: the authoritative statement of which leaf appears in which form is **the data dictionary's cross-context table** (`data-dictionary.md`, the per-form overlay columns: baspi5 318, rds 196, piq 184, ta6 178, …). The SHACL `requires` edges are *generated from that table*. So the genuinely authoritative source is the dictionary; the profiles are a **derived projection** of it; and `servesContext` is a **second derivation off the first**. Deriving membership "from the profiles" is therefore deriving-from-a-derivation. That is still better than hand-authoring — but the honest single source of truth is **the per-overlay leaf table in the data dictionary**, and both `requires` and `servesContext` should be generated from it in one pass.

### My resolution (the Allemang answer): derive, but name the real source, and emit both edges from it

- **Single source of truth = the data dictionary's per-overlay leaf table.** It already states, per leaf, which forms carry it. This is the authoritative fact; it is *data*, it is *maintained* (it is regenerated from the schemas), and it is the thing the architect is reaching for when they say membership "belongs to the ontology."
- **`opda:requires` (per-leaf, per ValidationContext) is generated from that table** — promoting the BASPI5 `requires`-targets-classes stub to `requires`-targets-the-leaf-properties-the-form-actually-asks. This is the missing mechanical step ODR-0020 glossed.
- **`opda:servesContext` is then derived from `requires` + `overlaysContext`** exactly as ODR-0020 Rule 5 says — the CONSTRUCT is correct *once the inputs are correct*.
- So membership is **authored once, as data, in the dictionary**; **projected mechanically** into `requires`; **derived** into `servesContext`. No hand-authored `servesContext`. Zero drift. Evans-Vernon get their "the ontology owns it" (the source is the dictionary the ontology is built from, not an incidental SHACL artifact); I keep derive-don't-declare (nobody hand-edits `servesContext`); the architect's Claim B is honoured (the partition is not *inverted out of* the forms — it is *projected from* the same dictionary that produces both the forms and the classes).

**Hybrid carve-out, minimal:** `opda:definedInContext` stays hand-applied for genuine homonyms only (ODR-0019 Rule 4 / Rule 8; corpus attests **zero** today). That is the *only* hand-authored context edge, and it is authored because no profile can derive a definitional-origin claim. Everything else derives.

**Vote restated:** FOR derivation as mechanism; AGAINST "the SHACL `requires` edge is the authority" (it is a carrier); the authority is the dictionary's per-overlay table, from which both `requires` and `servesContext` are generated.

---

## Q2 — Placement method & coverage

**Vote: FOR a single mechanical placement function with four buckets, computed — not authored — for every entity. The completeness check is a generator assertion, not a review checklist.**

The ODR-0020 four-bucket table (A single-context / B spanning / C upstream / D untagged) is correct and I support it. My contribution is to make it **total and computable**, because a placement method that a human applies entity-by-entity will be incomplete the day after it is written (SWWO 3e Ch. 13 on generated views).

### Placement as a pure function over data the generator already holds

For every minted `opda:` term `t`, define `place(t)` deterministically:

```
inputs (all already in the generator):
  REQUIRES   = { (overlay, term) }          # from the per-leaf requires walk (Q1)
  CONTEXT_OF = { overlay -> Context }        # the map ADR-0026 adds to profiles.py
  SOURCE(t)  = the dct:source tier+target    # from term_sourcing.py (ADR-0007 §7a)

place(t):
  ctxs = { CONTEXT_OF[o] : (o, t) in REQUIRES }
  if SOURCE(t) is an external authority (slot-3 regulator / upstream org):
        return C: consumesFrom <Organisation>          # never servesContext
  elif |ctxs| == 1:  return A: one servesContext -> the ctx
  elif |ctxs| >= 2:  return B: one servesContext per ctx   # multiplicity IS the spanning
  else:              return D: untagged                    # absence-of-tag = kernel/scaffolding
```

This is mechanical, total (every term lands in exactly one of A/B/C/D), and re-runs on every build. No entity is "forgotten" because the function ranges over *all* minted terms, not over a curated list.

### The hard cases ODR-0020 named — resolved within the function, not as exceptions

- **Multi-membership (`opda:Address` across ~10 contexts):** bucket B, naturally — ten `requires` edges → ten `servesContext` edges. The "spanning" is the cardinality of the derived set; no `SharedKernel` flag, no `serves-all` literal (which is a fiction the moment a 7th profile lands — ODR-0020 Rule 4 is right).
- **Shared kernel:** is **bucket D plus high derived-degree** — a kernel term is one that *either* no profile requires (pure foundation: `DiagnosticExemplar`, `GeneratorRun` → D, untagged) *or* that nearly all require (`Address` → B with degree ≈ all). Kernel-ness is **read off the degree**, never declared. This is the truest expression of derive-don't-declare: "shared kernel" is an *observation about the derived graph*, not an *input*.
- **Upstream-as-Organisation (`RegisteredTitle` ← HMLR):** bucket C, gated by `SOURCE(t)` being an external authority. `consumesFrom opda:HMLandRegistry`, never `servesContext`. The function checks provenance *first*, so an authority-sourced term can never accidentally fall into A/B even if some profile happens to require it.
- **Spanning concerns (lifecycle, participants):** these are **not terms placed by this function** — they are the ODR-0006 RoleMixin family and the ODR-0007 phase-space. Their "spanning" surfaces as bucket-B multiplicity on the *terms within them* (a `Phase` required by two profiles gets two `servesContext` edges). No `CrossCuttingConcernScheme`. Correct in ODR-0020; I just note the function never needs a fifth bucket for them.
- **Untagged:** D is the **default and the safe one**. A term no profile requires and no authority sources gets *no edge*. Absence is the signal. This is what lets placement be complete without being exhaustive-by-hand: the long tail of foundation/scaffolding terms is placed by *not placing them*, which is free and correct.

### Completeness check = a generator assertion (CI), not a deliberation

ODR-0008 §Q7a already established the pattern of CI `ASK` tests. Extend it:

1. **Totality:** every `opda:` term resolves to exactly one of {A,B,C,D} — assert in the generator (a term in A/B *and* C is a bug; a term in neither A/B/C/D is D by construction, so totality is automatic, but assert no term is double-bucketed).
2. **Firewall (ODR-0020 Rule 5):** `ASK { ?t skos:inScheme opda:BoundedContextScheme . FILTER NOT EXISTS { ?t a skos:Concept } }` → FALSE.
3. **No hand-authored servesContext:** the source TTLs contain zero `opda:servesContext` triples (it exists only in the derived/CONSTRUCT output). `grep` guard in CI.
4. **Authority-never-context:** `ASK { ?t opda:consumesFrom ?o . ?t opda:servesContext ?c }` → FALSE.

Coverage is thus *proven on every build*, not asserted by a reviewer. That is the only kind of completeness check that survives the corpus growing.

**Placement does NOT require all 935 leaves first** — see Q3. The *function* is total over whatever terms exist; it places 31 terms today and 935 later, identically. Placement and the walk are decoupled.

---

## Q3 — Missing-ontology creation & sequencing (the 935-leaf walk + ~14 overlay emitters)

**Vote: FOR executing the 935-leaf walk as deterministic generator output NOW, gated by "model the data you have"; FOR per-leaf `requires` emission as the same walk's second output; AGAINST blocking placement on walk completion.** This is the heart of my brief.

### What is mechanical (generate it — no council)

The overwhelming majority of the 935-leaf walk is **pure mechanical projection** from the data dictionary, and ODR-0008 already ratified it ("Generated, then deliberated"; "the mechanical leaf → datatype-property mapping is generated from the data dictionary"). ADR-0007 already specifies the deterministic emitter. **Nothing new needs deciding to emit these.** Concretely, for each annotated leaf the generator emits, deterministically (ADR-0007 §6a ordering, byte-identical):

```turtle
opda:<leafLocalName>
    a owl:DatatypeProperty ;
    rdfs:label "<dictionary label>"@en ;
    rdfs:comment "<dictionary description text>"@en ;
    rdfs:domain opda:Property ;                 # or LegalEstate per Q4a placement
    rdfs:range  <xsd type from dictionary, default xsd:string> ;
    dct:source  <form-question IRI per ODR-0004 §7a precedence> ;
    .
```

That is ~900 properties the generator can emit **today** from inputs it already parses. The BASPI5 slice (G11) proves the emitter works — it emitted 23 this exact way. Scaling 23 → ~900 is **not 39× the deliberation; it is 39× the same loop**. This is the single biggest lever in the whole plan and it is being treated as "demand-deferred" when it is in fact *mechanical-and-ready*.

### What needs deliberation (the genuine residue — small)

Per ODR-0008's own carve-outs, deliberation is reserved for:

1. **Class promotions (Q4a three-criterion test):** which `object`-typed leaves become classes (`Survey`, `EPCCertificate`, `Search`, `Valuation`, `Comparable` — already ratified; `Building`, `Room` — held-as-live). This is a **bounded** list — the dictionary's `object`-typed leaves are countable, and the test is mechanical *once the criteria are applied*. Estimate: low dozens, not hundreds.
2. **Datatype-vs-SKOS binding (Q5a):** §8a-named schemes → SKOS; one-shot enums → `xsd:string + sh:in`. The binding table exists; extending it is per-leaf and mostly mechanical (the dictionary marks enum leaves).
3. **Genuinely ambiguous reconciliations:** spanning leaves where two overlays disagree on meaning (not just cardinality). ODR-0008 §Q1a makes detection mechanical (SHACL shape-target convergence) and fires deliberation **only on a consumer-query trigger** — so this is demand-paced and small.

**Ratio:** of ~935 leaves, the mechanical datatype-property emission is ~90%+; class promotions + SKOS bindings + ambiguous reconciliations are the <10% residue. The council should **not** spend its scarce deliberation on the 90% the generator can emit unattended.

### "Don't model what you can't populate" — the one place I restrain the walk

SWWO 3e Ch. 13's discipline cuts both ways. I am *for* emitting all ~900 mechanical properties because **we have the data** — the dictionary populates `rdfs:label`, `rdfs:comment`, `dct:source`, and a defaulted `xsd:range` for every annotated leaf. That is real content, not speculation. But I am **against**:

- **Inventing `rdfs:range` precision we don't have.** Where the dictionary gives no type, emit `xsd:string` — do **not** hand-curate `xsd:decimal`/`xsd:gYear`/`xsd:integer` for 900 leaves in this pass. Range-tightening is a *later, demand-driven* refinement (a SHACL `sh:datatype` in a profile when a consumer needs it), not a blocker. Model the string we have, not the decimal we wish we had.
- **Emitting property hierarchies (`rdfs:subPropertyOf`).** ODR-0008 §Q6a already mandates flat-default + reasoner-independence test. Honour it: zero `subPropertyOf` in this emission. Hierarchy is decorative until a named consumer query needs parent-entailment.
- **Emitting `Building`/`Room` sub-structure** until the first BASPI5 round-trip query exercises sub-Property reasoning (Q4a held-as-live, Davis dissent). Don't model the sub-part graph we can't yet query.

So the discipline is: **emit every leaf we have content for (the flat datatype-property layer); withhold every refinement we'd be guessing at (ranges, hierarchies, sub-structure).** That is exactly "model the data you have."

### Per-leaf `requires` emission — the second output of the same walk

The walk that emits ~900 datatype properties should, **in the same pass**, emit the per-leaf `opda:requires` edges into each form's ValidationContext, driven by the dictionary's per-overlay columns:

```turtle
opda:Baspi5ValidationContext opda:requires opda:builtForm, opda:yearOfBuild, opda:currentEnergyRating, … .
opda:Ta6ValidationContext    opda:requires opda:floodRisk, opda:japaneseKnotweed, … .
```

This is what upgrades the derivation from class-grain to term-grain (the Q1 gap). It is mechanical — the per-overlay column *is* the edge set. Emitting it is free once the walk runs.

### The ~14 overlay profile emitters

Today: **1 of ~15** profiles emitted (baspi5 only). The other forms (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29…) are unwritten. Each is a `profiles.py`-shaped emitter: a ValidationContext + `overlaysContext`→its industry context + `requires`→its leaf set + DASH groups + per-form `sh:minCount`/`sh:in` from the dictionary's per-form required/enum columns. These are **mechanical** too (the dictionary has the per-form columns), but each is a discrete artifact. They are the real backlog ODR-0020/ADR-0026 surfaced. **Placement does not block on them** — bucket A/B membership is *incomplete* (fewer profiles = fewer derived edges) but *correct* for the profiles that exist, and grows monotonically as each profile lands.

### Does placement block on the walk? **No — and this is the key sequencing claim.**

- The **scheme + six concepts + predicates** (ADR-0026 Option A) emit independently of the walk — they depend on nothing but the `/modelling/bounded-contexts` table. Ship them first.
- The **`overlaysContext` fix** (`profiles.py:250`) is a one-line bug fix, independent of the walk. Ship it with the scheme.
- The **dormant CONSTRUCT** ships with the scheme; it fires nothing until the gate opens.
- The **walk** (datatype properties + per-leaf `requires`) makes the derivation *term-grain* and *rich*, but the derivation *mechanism* is valid the moment the scheme + fix + class-grain `requires` exist. So: scheme → walk → richer derivation, monotonic, no blocking.

**Determinism/byte-identity (ADR-0007 §6a):** the walk emits in canonical order (alphabetised datatype properties), SHA-256 blank-node skolemisation, LF/no-BOM/final-newline. Second run byte-identical. The CI baseline re-pins in the same commit. Emitting 900 properties does not threaten determinism — the emitter is the same deterministic single-pass; it just ranges over more leaves. **This is the proof that "generate it all now" is safe: the discipline that makes 31 properties reproducible makes 935 reproducible identically.**

---

## Q4 — ODR/ADR scaffolding

**Vote: FOR no new ODR (the decisions are ratified); FOR two fresh ADRs (programme retired → ontology work lands as ADRs); FOR a light ADR-0026 revision. Enumerated below.**

The programme is retired (ADR-0005 §G), so new *ontology* work lands as fresh ADRs, and the *decisions* are already made — ODR-0008 (walk discipline), ODR-0010 (overlays), ODR-0019/0020 (bounded contexts) are all `accepted`. **Do not re-deliberate via new ODRs what these already settle.** What's missing is *execution*, which is ADR-shaped.

**No new ODR needed**, with one possible exception:
- **Amend ODR-0020, do not replace.** Add a one-paragraph clarification to ODR-0020 Rule 5 (Author-only amendment, the methodology's lightweight path): the single source of truth is the **data dictionary's per-overlay leaf table**, from which both `opda:requires` (per-leaf) and `opda:servesContext` (derived) are generated; the SHACL `requires` edge is the *carrier*, not the *authority*. This resolves the architect's Claim B without re-opening the council. It also records the **grain correction** (requires targets leaf-properties, not only classes).
- **Amend ODR-0008** similarly-light: note that the mechanical 935-leaf walk is **ready for execution now** (inputs complete), reclassifying it from "demand-deferred" (ADR-0005 §G11's framing for the *non*-BASPI5 remainder) to "scheduled mechanical emission," with the range/hierarchy/sub-structure restraints above. This is the substantive change to the status quo and it belongs in ODR-0008's consequences as an Author amendment, not a new ODR.

**Fresh ADRs (two):**
1. **ADR-0028 — Descriptive datatype-property walk emission.** `implements: [ODR-0008, ODR-0007]`. Specifies: the per-leaf datatype-property emitter (extending the G11 emitter from 23 → ~900); `rdfs:range` defaulting to `xsd:string`; flat (no `subPropertyOf`); the Q4a class-promotion pass (bounded list); per-leaf `requires` emission into ValidationContexts; byte-identity baseline re-pin. This is the big one.
2. **ADR-0029 — Form-profile emitter rollout.** `implements: [ODR-0010, ODR-0020]`. Specifies the ~14 remaining profile emitters (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29…), each wiring `overlaysContext`→industry context (via the `CONTEXT_OF` map ADR-0026 adds) + per-form `requires`/`sh:minCount`/`sh:in`. Can be phased one-form-per-PR.

**ADR-0026 revision (light):** ADR-0026 is sound as written for the *scheme + fix + dormant rule*. Add one line to its "Downstream" / Consequences: the term-grain derivation **depends on ADR-0028's per-leaf `requires` emission**; until then `servesContext` is class-grain only. This makes the grain-staging explicit rather than implied. No structural change.

So: **0 new ODRs (2 Author-amendments), 2 new ADRs (0028, 0029), 1 one-line ADR-0026 touch.** Minimal scaffolding; maximal execution.

---

## Q5 — Implementation plan (phases, gates, emission order)

**Vote: FOR a four-phase plan, scheme-first, walk-second, profiles-third, derivation-activation-last. Gates are byte-identity + structural assertions at each phase.**

Emission order is chosen so each phase is independently shippable, byte-identity holds at every step, and the derivation gets richer monotonically.

### Phase 0 — Author-amendments (no code)
- Amend ODR-0020 Rule 5 (source = dictionary table; grain correction) and ODR-0008 consequences (walk = scheduled, with restraints). Author-only, same-day, per methodology.
- **Gate:** `odr-review` passes; no council convened.

### Phase 1 — Bounded-context scaffold (ADR-0026, already written — just execute)
- Emit `opda-contexts.ttl`: scheme + six concepts + 3 annotation properties (`servesContext`, `consumesFrom`, `definedInContext`). Wire `owl:imports` from foundation.
- Fix `profiles.py:250`: `CONTEXT_OF` map; `overlaysContext`→`opda:EstateAgencyContext` for baspi5.
- Author the dormant CONSTRUCT in `shapes.py`, excluded from active validation set.
- **Emission order within phase:** classes-graph (scheme) → shapes-graph (dormant rule) → fix profiles.py → regenerate → re-pin baseline.
- **Gates:** byte-identity (2nd run identical); structural test (1 scheme, 6 concepts, each `topConceptOf`); firewall test (no domain term `skos:inScheme`); bug-fix test (baspi5 emits `overlaysContext opda:EstateAgencyContext`); dormancy test (CONSTRUCT parses, fires zero results on the 15 exemplars). *These are exactly ADR-0026's Confirmation tests — Phase 1 = ADR-0026 as specified.*

### Phase 2 — The descriptive walk (ADR-0028) — the coverage close
- Extend the G11 emitter: enumerate all ~900 annotated non-class leaves → `owl:DatatypeProperty` with label/comment/domain/`xsd:string`-default-range/`dct:source`. Flat (no `subPropertyOf`).
- Run the Q4a class-promotion pass over `object`-typed leaves (apply the three-criterion test mechanically; the ratified five promote; `Building`/`Room` stay deferred).
- Emit per-leaf `opda:requires` into the BASPI5 ValidationContext (upgrading it from class-grain to term-grain), driven by the dictionary's baspi5 column.
- **Emission order:** datatype properties (alphabetised) → class promotions → `requires` edges → regenerate → re-pin baseline.
- **Gates:** byte-identity; totality assertion (every annotated leaf emits exactly one DP or is a ratified class promotion — no silent omissions, per G11's tightened closure); flat-default test (`ASK` no `subPropertyOf` in initial emission, ODR-0008 §Q6a); range-restraint check (no hand-curated non-string ranges this pass). **This phase is the ~3%→~95% coverage jump.** It is mechanical and gated; it does not need the council in the loop per-leaf.

### Phase 3 — Form-profile rollout (ADR-0029) — phased, one form per PR
- For each of ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29: emit ValidationContext + `overlaysContext`→its context + per-leaf `requires` + per-form `sh:minCount`/`sh:in` from the dictionary's per-form columns + DASH groups.
- **Emission order across forms:** by the ODR-0008 volume ranking (ta6 178, rds 196, piq 184, lpe1 136…) or by consumer demand — either is fine; each PR is independent.
- **Gates per form:** byte-identity; `overlaysContext`→a context concept (never the layer IRI); enum-union test (ODR-0008 §Q7a: union of per-profile `sh:in` = SKOS scheme members). Membership coverage grows monotonically as each lands.

### Phase 4 — Derivation activation (gated by ODR-0019 Rule 8 — likely NOT in this cycle)
- When a **named term-grain consumer** issues `?term opda:servesContext ?ctx` (Rule 8's gate), move the CONSTRUCT from dormant → active validation set. By then Phases 2–3 have made `requires` term-grain, so the derived `servesContext` graph is rich and correct.
- **Gate:** the Rule 8 two-part condition (≥3 attested collisions / named consumer). Until met, the rule stays dormant. **Do not activate speculatively** — that would be modelling a query we don't have (SWWO 3e Ch. 13).

### What to generate vs author, summarised (the Allemang one-liner)

| Layer | Generate (mechanical) | Author (by hand) |
|---|---|---|
| Scheme + 6 concepts | ✓ from `/modelling/bounded-contexts` table | — |
| `servesContext` | ✓ derived from `requires`+`overlaysContext` | **never** |
| `requires` (per-leaf) | ✓ from dictionary per-overlay columns | — |
| ~900 datatype properties | ✓ from dictionary annotated leaves | — |
| `rdfs:range` beyond `xsd:string` | — (defer to demand) | — (defer) |
| Class promotions (5 ratified) | ✓ emit; criteria applied | criteria *decided* (done) |
| `definedInContext` | — | ✓ homonyms only (zero today) |
| Property hierarchies | — (defer per §Q6a) | — (defer) |

**Bottom line:** the council's scarce judgement belongs on the <10% residue (class promotions, ambiguous reconciliations, SKOS bindings) and on the *source-of-truth correction* (dictionary table, not SHACL edge). The 90%+ — the descriptive walk, the `requires` edges, the `servesContext` derivation, the scheme — is generator work that ADR-0007 already makes deterministic and ADR-0026 already scaffolds. **Generate it; don't deliberate it. Model the data we have; defer the refinements we'd be guessing at. The biggest unforced error in the current plan is leaving the mechanical 935-leaf walk parked as "demand-deferred" when it is mechanical-and-ready and is the bulk of the coverage gap.**

---

## On the architect's two claims

- **Claim A ("overlays should only validate, not define"):** I agree, and derive-don't-declare *enforces* it — `servesContext` is a *generated view* off the overlays, it does not *define* anything; the overlays carry per-form constraint (`sh:minCount`/`sh:in`), the TBox carries the term (declared once, ODR-0008). The overlays never define the ontology; they validate, and we *read membership off* them. No inversion there.
- **Claim B ("contexts belong to the ontology, not the SHACL schemas; deriving the partition from forms may be an inversion"):** half-right, and worth honouring. The fix is **not** to hand-author membership (that reintroduces the drift ODR-0019/0020 outlawed). The fix is to name the **real** authoritative source — the **data dictionary's per-overlay leaf table** — and generate *both* the SHACL `requires` edges *and* `servesContext` from it. Then the partition is not "inverted out of the SHACL"; it is *projected from the same dictionary the ontology itself is built from*. The ontology and the partition share one source. That is the deepest form of derive-don't-declare, and it dissolves the inversion worry without conceding to hand-authoring.
