# Council Session 034 — Overlay-profile leaf-enumeration discipline (B1 / ADR-0029 gap 1 completion)

- **Date:** 2026-06-01
- **Records:** **Amends [ADR-0029](../../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md)** (the "one-go full coverage" directive → "full coverage of *bindable* leaves + an emitted per-form gap register"; ratifies the bind-only-what-exists resolver as the gap-1 mechanism) and **[ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md)** §Rules.2 G2 (a JSON-pointer schema-leaf-path is an admissible `dct:source` anchor); records oc1/llc1 as **[ODR-0008d](../ODR-0008d-authority-retrieved-artefacts.md)** authority-retrieved register artefacts (not form overlays); clarifies the **[ODR-0021](../ODR-0021-deferred-form-profile-layer-enhancements.md)** YAGNI boundary (enumerating a form's own leaves IS the form, not a fenced wrapper). Plan item **B1**.
- **Queen / synthesis:** **Knublauch** (lead author of SHACL; owns ODR-0010 overlay mechanism). **Devil's Advocate:** **Davis** (BBC linked-data; demand-pulled watching-brief — the voice ADR-0029 names + rejects as "Option C"). **Panel:** Allemang (led ODR-0022; owns gates G1/G2/G3), Cagle (SHACL/DCTAP; the DCTAP→SHACL framing), Guarino (DOLCE/OntoClean; ValidationContext truth-maker), Kendall (reference-vs-message-model; "identifiers are commitments").
- **Voices:** 6 across 6 teammates (working files in `working/session-034/`).
- **`consensus-mode`:** `agent-fan-out` (parallel `Task` spawn; file-based positions). **No hive-mind** — scope-check confirmed Q1 does not *condition* Q2–Q4 (each stands under either Q1 outcome; the only coupling, Q2↔Q4 both needing the G3 authority-prefix generalised, is an implementation-sequencing note, not a Byzantine trigger).
- **Format:** Full Council (~6 runs).
- **Input:** ODR-0010, ODR-0021, ODR-0022, ODR-0008d, ADR-0029; `tools/opda-gen/src/opda_gen/emitters/profiles.py`; the orphan `tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py`; the emitted `source/03-standards/ontology/profiles/*.ttl`.
- **Outcome:** **REVISE** — the proposition carries in **amended (eager-on-bindable + gap-register)** form. Q1 3–3 (REVISEs converge on Q4); Q2 decomposed (anchor mechanism AFFIRM 5–1; oc1/llc1-as-forms-now REJECT 4–2); Q3 AFFIRM 5–1 with must-fix conditions; Q4 AFFIRM 6–0. DA WITHDRAWN on Q1/Q3, CONCEDED Q4, **HELD on Q2** (oc1/llc1, aligned with the majority).

## Context + the pre-flight finding

B1 (ADR-0029) is mid-completion: 31 in-scope overlay profiles are emitted, but only `baspi5` enumerates its leaves into SHACL property shapes; the other 30 are **thin** (`owl:Ontology` header + one `dct:subject` community tag). gap-2 (route `baspi5` through the generic `_build_profile`, byte-identical) landed at commit `8753784`. What remains is **gap-1**: enumerate the other forms' leaves.

ADR-0029's stated reason for the thin profiles — *"their leaves have no term-grain `opda:` property paths to constrain until ADR-0028's descriptive walk lands"* — is **now largely spent**. The pre-flight verified (and the panel re-verified) the descriptive TBox is substantially complete: **254 emitted `opda:` predicates** (225 datatype + 29 object); the curated Category-G walk at **239/239**; the **monetary walk executed 2026-05-31** (`opda:MonetaryAmount` + 16 per-economic-kind money properties, ODR-0024 R3 / ADR-0005 §G22); Category-C status schemes, Category-D `FixtureItemScheme`, Category-E `RiskAssessment`/`PerilScheme`, `opda:disclosureDetail`, `opda:schoolType` all emitted. **The terms the thin profiles would bind now exist.** So the thin profiles are thin by *omission*, not necessity — and an empty SHACL shape validates nothing, so a thin profile is a silent no-op masquerading as a form.

**The apparent tension S034 exists to rule:** ADR-0029's directing-governance directive — *"one-go, full coverage, no staging"* (it explicitly rejected "Option C — emit profiles incrementally / demand-pulled (Davis's watching-brief)") — versus ODR-0021's standing rule — *"the SHACL overlay IS the form; stop wrapping it"* + YAGNI (*"each addition must earn its keep against a real consumer, not a tidy-architecture argument"*). The Council rules the un-councilled **enumeration layer** only; the leaf→category **mappings are settled and built** (ODR-0022, ODR-0024 R1–R12, ODR-0008d, ADR-0028/0030/0031/0033) and were out of scope (the scope fence held — no voice re-litigated a mapping).

## Proposition P

Complete B1 (ADR-0029 gap-1) by **eager full enumeration** of every in-scope overlay's bindable leaves now — binding each form leaf to its emitted `opda:` predicate via a corpus-driven resolver, citing the schema-leaf-path as `dct:source` — versus **consumer-gated** enumeration (a form is enumerated only when a validating consumer needs it).

## Questions + verdicts

- **Q1 (keystone) — Enumeration discipline.** "Complete B1 by eager full enumeration of every overlay's *bindable* leaves now." **REVISE (carries as eager-on-bindable + gap register). AFFIRM 3 (Knublauch, Allemang, Cagle) / REVISE 3 (Davis, Guarino, Kendall) / REJECT 0.**
- **Q2 — Ref-less forms + the anchor.** "A JSON-schema leaf-path (`<$id>#/path`) is a valid ODR-0022 G2 `dct:source` anchor → oc1/llc1 enumerable." **Decomposed. Anchor mechanism: AFFIRM 5 / REJECT 1 (Davis). Enumerating oc1/llc1 as form overlays now: AFFIRM 2 (Allemang, Cagle) / REVISE 3 (Knublauch, Guarino, Kendall) / REJECT 1 (Davis) → they stay thin / re-typed as ODR-0008d artefacts.**
- **Q3 — Enumerator mechanism.** "Ratify the corpus-driven bind-only-what-exists resolver." **AFFIRM 5 / REVISE 1 (Davis: tests first) / REJECT 0 — carries with must-fix conditions.**
- **Q4 — Coverage honesty.** "Amend ADR-0029 'full coverage' → 'full coverage of bindable leaves + an honest emitted per-form gap register'." **AFFIRM 6–0** (Davis CONCEDED).

## Dialectic

**The tension dissolves on a precise reading of ODR-0021 (Knublauch, Queen — the decisive framing).** ODR-0021's YAGNI fence guards *wrappers on top of* the SHACL — `prof:Profile`, content-negotiation, reified profile nodes, a stored `opda:requires` digest (F1–F10). Enumerating a form's **own leaves** into its shapes is not a wrapper — *it IS the SHACL overlay*. ODR-0021 §F4 even defers the stored requires-digest *because it is "derivable from the shapes"* — which presupposes the shapes carry the leaves. So eager enumeration is the completion ODR-0021 assumes, not the over-build it forbids. Allemang concurred from the gates side: he wrote G1–G3 to convert a completeness *veto* into acceptance *criteria*, and binding leaves to terms that **now exist** is "model the data you have" — the mechanical projection (the DCTAP→SHACL step S022 already ratified as idiomatic), minting nothing.

**The "mints nothing" crux (Kendall — the lever that separates this from a YAGNI violation).** "Identifiers are commitments" — but enumerating a bindable leaf *adds an `sh:path` reference to an `opda:` predicate the reference ontology already committed, inside a profile graph that already exists and is byte-identically re-pinnable.* It mints **no new published IRI** and creates **no new maintenance surface**. By Kendall's own Session-001 precedent (an overlay is a *use* of committed identifiers, not a new commitment), YAGNI does not bite on *activating a paid-for asset* — it bites only on *new* commitments. So the live risk is "enumerate the **un-bindable**" (which would force fabrication), not "enumerate now." This is why the verdict is bounded to *bindable* leaves.

**Davis's attack, and what defeats it (DA — WITHDRAWN with conditions adopted).** Davis pressed the strongest case: the "walk is done, so enumerate" premise is a bait-and-switch — *terms existing is a tidy-architecture argument, exactly what ODR-0021 calls "NOT a trigger"*; the one-go directive predates the new facts (it rode the "~90% mechanical" bet that already failed once at the ADR-0028 deferral); and G3 has a **consumer-query limb** (ODR-0022 G3(b): coverage "ratified ONLY when a worked SPARQL query retrieves a leaf") that 28 consumer-less profiles cannot discharge. He **withdrew on Q1** on the condition — adopted here — that enumeration is recorded as the cheap, byte-reversible *activation* of the already-paid-for TBox (gap-2 / `8753784`), every shape is sound (`report.violations == []` kept honestly green — no doubly-bound, no untraceable shapes, GAPs kept *out of the coverage denominator*), a per-form gap register is **emitted**, and it is recorded as **NOT** discharging G3's worked-query limb (that limb stays a real, separate gate that fires per consumer). His Q1 re-open trigger: any form ships without its gap register, OR the hard gate is made green by suppression, OR a shape is presented as G3-"covered" while its worked-query limb has never run.

**Q2 — the anchor is sound; oc1/llc1 are not forms (Guarino — the truth-maker distinction).** Two axes. *Structural:* a profile shape's `dct:source` is a truth-maker claim ("this constraint holds relative to this named source"). A JSON-pointer leaf-path (`<$id>#/path`) dereferences to a real schema node and is external to the deciding ODR — it **IS** "the schema-leaf-path" G2 designates (Allemang, who wrote G2 as "the schema-leaf-path, NOT the deciding ODR", confirmed). It is therefore an *admissible, more-precise* G2 anchor — and adopting it **cures a live defect**: Guarino verified the emitted `oc1.ttl`/`llc1.ttl` currently carry `dct:source` → ADR-0029 (the deciding-ADR), the exact anti-pattern ODR-0022 §6/G2 forbids. *Kind:* but oc1/llc1 are ODR-0008d **authority-retrieved register extracts** (`prov:wasGeneratedBy` HMLR / a local authority) — register records, not human-filled forms. Their **zero form-question refs is ontologically correct**, not a gap to paper over; labelling a register-field as an interrogative form-question never performed is a category error. Majority (Davis, Kendall, Guarino, Knublauch): do **not** enumerate oc1/llc1 as form overlays now — they stay thin, re-typed as ODR-0008d authority-artefact validation profiles, enumerable later on the leaf-path anchor when a register-data consumer appears. Davis HELD with the precise re-open trigger; this aligns with the ruling rather than dissenting from it.

**Q3 — the resolver is right, but the orphan is broken (Cagle — the soundness audit).** The contract is exactly correct SHACL discipline (Knublauch: "never a fabricated `sh:path`, never a guessed `sh:targetClass`"; Guarino: binding to a guessed-domain predicate asserts a *false inherence* — an OntoClean violation; GAP-not-guess is mandatory). But Cagle and Davis audited the untracked `leaf_resolver.py` and found it must not be wired until fixed — these become **ratification conditions** (see As-built findings). Davis's REVISE ("no resolver test demonstrates the three branches") is itself one of the conditions, not opposition.

**Q4 — unanimous (Davis CONCEDED).** "Full coverage of bindable leaves + an honest emitted per-form gap register" is the only formulation that makes ADR-0029's coverage claim true without forcing fabrication (Allemang: the gap register IS ODR-0022 §5 residue discipline applied to profiles). Constraint (Cagle): the register is **internal generator output**, not a published DCTAP artefact — it must not re-open ODR-0021 F3.

## As-built findings (panel-verified; load-bearing for the implementer)

These are conditions on Q3's ratification and the work-list for completing B1:

1. **`leaf_resolver.py` does not import** — its `from ..namespaces import OPDA` targets a non-existent module; `OPDA` is defined inline in ~17 emitter files. It cannot load as written (Cagle, verified). *(Fix: inline `OPDA` like the siblings.)*
2. **The 16 NTS2 extensions key on `ntsRef`, not `{code}Ref`** — the walker's `f"{form_id}Ref"` heuristic would silently walk every extension to **zero leaves** (Knublauch, verified). *(Fix: ref-key override for the extension set.)*
3. **The G3 gate recognises only the `https://www.basp.uk/forms/` authority** (`_is_form_leaf()` / `FORMS_AUTHORITY_PREFIX`), while every non-baspi5 overlay's `$id` is under `https://trust.propdata.org.uk/.../overlays/` — the new forms' refs would not be counted/checked (Knublauch + Davis, verified). *(Fix: generalise the prefix. Q2↔Q4 shared dependency.)*
4. **`COLLAPSED` is name-keyed, not path-keyed** — the resolver's G1 path-awareness is presently "upstream-circumstantial"; it must be path-aware *in its own right* to avoid the `details`×269 / `price`×99 last-segment collisions ODR-0022 G1 forbids (Cagle). *(Fix: path-aware binding; never bind on last-segment alone where the name is a known collider.)*
5. **No resolver test exercises the three branches** (single-domain → bind; zero-domain → GAP; multiple-domain → GAP) — Davis's withdrawal condition; required before the resolver drives any non-baspi5 form.
6. **`leaf_resolver.py` has zero importers** (the mechanism is genuinely unwired; `_thin_specs()` still ships all 30 with `shape_builder=None`) — "ratify the resolver" and "complete B1 gap-1" are the same act (Cagle).
7. **G3 is now a HARD gate** — `test_full_round_trip_coverage_gate` asserts `report.violations == []` (ADR-0031), no longer soft-tolerant (Davis's own correction, cutting in his favour: eager enumeration of a referenced-but-GAPped leaf would trip a red build unless GAPs are kept out of the *referenced-leaf* set — i.e. a GAPped leaf emits **no** `dct:source` ref, so it is neither addressable-nor-referenced, not an unaddressable violation).

## Tally appendix

| Voice | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| Knublauch (Queen) | AFFIRM | REVISE¹ | AFFIRM | AFFIRM |
| Allemang | AFFIRM | AFFIRM | AFFIRM | AFFIRM |
| Cagle | AFFIRM² | AFFIRM | AFFIRM³ | AFFIRM |
| Guarino | REVISE | REVISE¹ | AFFIRM | AFFIRM |
| Kendall | REVISE | REVISE¹ | AFFIRM | AFFIRM |
| Davis (DA) | REVISE⁴ | REJECT⁵ | REVISE⁶ | AFFIRM (conceded) |
| **Count** | **3 AFFIRM / 3 REVISE** | **anchor 5–1; oc1/llc1-as-forms 2–4** | **5 AFFIRM / 1 REVISE** | **6 AFFIRM** |

¹ affirms the leaf-path-is-a-valid-G2-anchor *mechanism*; revises on *not* enumerating oc1/llc1 as form overlays now (stay thin / re-type as ODR-0008d). ² conditional on Q3 soundness. ³ conditional on the As-built fixes C1 (path-aware) + C2 (import/floor) + C3 (wire it). ⁴ revises toward eager-on-bindable + gap register = the Q4 amendment. ⁵ rejects both the anchor (weakens G2) and enumerating register-data; HELD. ⁶ revises to "tests first" (a condition, not opposition).

### DA scorecard (Davis)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** | met by Q4 amendment + "activation-not-commitment" framing (Kendall) + emitted gap register + recording that enumeration does NOT discharge G3's worked-query limb. **Re-open trigger:** any form ships without its gap register, OR the hard gate is greened by suppression, OR a shape is called G3-"covered" while its worked-query limb never ran. |
| Q2 | **HELD** (aligned with majority) | **Re-open trigger:** a named consumer issues a worked SPARQL query against an oc1/llc1 leaf → then model it as an ODR-0008d register anchor, **NOT** by redefining the G2 form-question anchor. |
| Q3 | **WITHDRAWN** | met iff a resolver test covers single-domain bind / zero-domain GAP / multiple-domain GAP (green) **before** the resolver drives any non-baspi5 form. |
| Q4 | **CONCEDED** | the amendment *is* the gap-honesty discipline he would otherwise demand; load-bearing condition: "emitted" is literal (the register ships alongside the shapes). |

### Per-question count

Q1 3–3–0 (REVISEs converge on the Q4-amended form; no REJECT) · Q2 anchor 5–1, oc1/llc1-as-forms-now 2–4 · Q3 5–1–0 · Q4 6–0–0. Lowest comfortable FOR: Q1's eager camp at 3, rescued to effective-unanimity by the Q4 fold-in — flagged as the load-bearing reconciliation, not a bare majority.

## Verdict + dispositions — REVISE (eager-on-bindable + gap register)

1. **Q1 + Q4 → amend [ADR-0029](../../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md).** B1 completes by **eager enumeration of every in-scope form's *bindable* leaves now**; "full coverage" is redefined as **full coverage of the bindable set + an honest, emitted per-form gap register** (GAPs kept out of the coverage denominator; the register is internal generator output, not a published DCTAP — ODR-0021 F3 stays deferred). The ADR-0029 ↔ ODR-0021 tension is recorded as *dissolved*: enumerating a form's own leaves IS the SHACL overlay (not a YAGNI-fenced wrapper); it activates already-committed terms and mints nothing. Enumeration does **not** discharge G3's worked-query limb — that stays a per-consumer gate (Davis's withdrawal condition).
2. **Q2 anchor → amend [ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md) §Rules.2 G2.** A JSON-pointer schema-leaf-path (`<$id>#/path`) is an **admissible G2 `dct:source` anchor** — it *is* "the schema-leaf-path." This cures the live oc1/llc1 anti-pattern (their `dct:source` currently points at the deciding ADR). Generalise the G3 gate's forms-authority recognition beyond `basp.uk` to include the overlay `$id` authority.
3. **Q2 oc1/llc1 → note in [ODR-0008d](../ODR-0008d-authority-retrieved-artefacts.md) + ODR-0022.** oc1/llc1 are authority-retrieved register extracts, **not** form overlays; their zero form-question refs is correct. They stay **thin** now; when enumerated, it is as **authority-artefact validation profiles** keyed on the leaf-path anchor, on the held re-open trigger (a register-data consumer query). Held-as-live (Davis).
4. **Q3 → ratify the bind-only-what-exists resolver in [ADR-0029](../../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md)** as the gap-1 mechanism: bind a leaf IFF its resolved local-name (last-segment name-match + the ODR-0024 `COLLAPSED` register + settled category routing) is an emitted `opda:` predicate **with exactly one `rdfs:domain`** (→ `sh:targetClass`); else **GAP** (never fabricate a predicate, never guess a domain); one ref → one `sh:path` (no double-bind). **Ratification is conditional on the seven As-built fixes** (broken import; `ntsRef` extension key; G3 authority prefix; intrinsic path-awareness; three-branch resolver tests; wiring; GAP-emits-no-ref so the hard gate stays green).

**Record-routing note (why no new ODR/ADR):** the verdict is REVISE throughout — it amends existing ratified records (ADR-0029 owns the rollout + names gap-1 as its remaining work; ODR-0022 owns G2; ODR-0008d owns register artefacts; ODR-0021 owns the YAGNI fence). A dedicated ADR for the resolver was considered and rejected as fragmenting ADR-0029's owned rollout (cf. the S031 record-proliferation error). This mirrors S033's reconcile-and-amend routing.

## Held-as-live dissent + re-open triggers

**Held-as-live (Davis, DA — Q2, aligned with the council majority):** oc1/llc1 are **not** enumerated as form overlays in this rollout. **Re-open trigger:** a named consumer issues a worked SPARQL query against an oc1/llc1 register leaf — at which point they are modelled as ODR-0008d authority-artefact validation profiles on the leaf-path anchor, never by redefining the G2 form-question anchor. **Standing Q1 guard (Davis, withdrawal-conditional):** the eager rollout re-opens if any enumerated form ships without its gap register, if the G3 hard gate is greened by suppression, or if a shape is presented as G3-"covered" while its worked-query limb has never run for that form.

## A9 note

No new `kind: pattern` / `kind: mapping` ODR. The leaf→category mapping ICs are owned by ODR-0022 / ODR-0024 / ODR-0008d (all ratified, out of scope here); the overlay mechanism's truth-maker IC is ODR-0010 §Q1 (`opda:ValidationContext`). S034 rules the enumeration *discipline + mechanism* (architecture/engineering) and amends existing records — A9 relaxed.

## Consequences

- **ADR-0029** §Implementation-status + §Decision-Outcome amended: gap-1 completes by eager-on-bindable enumeration; "full coverage" redefined (bindable + emitted gap register); the bind-only-what-exists resolver ratified as the mechanism with the seven As-built conditions; the ADR-0029↔ODR-0021 tension recorded as dissolved.
- **ODR-0022** §Rules.2 G2 amended: JSON-pointer schema-leaf-path admitted as a `dct:source` anchor; G3 forms-authority recognition generalised.
- **ODR-0008d** + **ODR-0021** gain a one-line pointer (oc1/llc1 are register artefacts not forms; enumerating-own-leaves is not a fenced wrapper).
- **Plan B1** moves from "blocked / largely-unblocked" to "ratified scope: enumerate the 12 ref-carrying main forms' bindable leaves + the 16 extensions (via `ntsRef`); oc1/llc1 stay thin (held); honest gap register; resolver fixed + tested + wired."
- Greenfield first-cut; **no WG** — the Council + directing authority ratify (adoption.md §Real-world Governance Handoff). A live DA dissent stands (oc1/llc1), bound by its re-open trigger.

## References

- **Amends:** [ADR-0029](../../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (overlay-profile emitter rollout — owns gap-1); [ODR-0022](../ODR-0022-descriptive-layer-import-strategy.md) §Rules.2 (gates G1/G2/G3) + §Consequences (names B1); [ODR-0008d](../ODR-0008d-authority-retrieved-artefacts.md) (oc1/llc1 register artefacts); [ODR-0021](../ODR-0021-deferred-form-profile-layer-enhancements.md) (the YAGNI fence; F3 published-DCTAP deferral; F4 derivable-digest).
- **Mechanism under review:** [ODR-0010](../ODR-0010-overlay-profile-mechanism.md) (overlay-profile mechanism; §Q1 `opda:ValidationContext` truth-maker; Rule 4 `dct:source` form-question chain); `tools/opda-gen/src/opda_gen/emitters/profiles.py`; `tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py` (orphan resolver — ratified-with-conditions).
- **Mappings (settled; scope-fenced):** [ODR-0024](../ODR-0024-curated-category-g-walk-dispositions.md) R1–R12; [ADR-0028](../../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) / [ADR-0030](../../../adr/ADR-0030-category-based-descriptive-emission-pipeline-and-import-gates.md) / [ADR-0031](../../../adr/ADR-0031-category-g-curated-walk-execution-plan.md) / [ADR-0033](../../../adr/ADR-0033-room-dimension-value-structure-emission.md).
- **Working positions (verbatim):** [`working/session-034/`](./working/session-034/) — knublauch.md (Queen), davis-da.md (DA), allemang.md, cagle.md, guarino.md, kendall.md.
- **Methodology:** [ODR-0001](../ODR-0001-linked-data-council-methodology.md) (§Format-tiers, §Consensus-mode-framework, §Citation-grounding, §Two-artefact-discipline). Plan: [outstanding-work-and-modelling §B1](../../../plan/outstanding-work-and-modelling.md).
- **Grounding cited by the panel:** W3C SHACL Recommendation (Knublauch et al. 2017) §Core + Advanced Features; Allemang, Hendler & Gandon *Semantic Web for the Working Ontologist* (3e); Kendall & McGuinness *Ontology Engineering* (identifiers-as-commitments); Guarino & Welty OntoClean (truth-maker / false-inherence); DCMI DCTAP (2022); Davis BBC `/programmes/` linked-data deployment + "A Little Semantics Goes a Long Way" (Hendler).
