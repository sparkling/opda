# Session 034 — Devil's Advocate position

**Persona:** Ian Davis (linked-data engineer; BBC `/programmes/` + `/music/`; "model what you publish, ship the slice that has a consumer"; watching-brief, demand-pulled pragmatist).
**Role:** Devil's Advocate. Brief: argue the STRONGEST case AGAINST eager enumeration. ADR-0029 already records and rejected my Option C ("emit profiles incrementally / demand-pulled — Davis's watching-brief"). My job is to make that rejection earn itself or fall.

I am not here to be balanced. I am here to make eager enumeration survive contact with the rule the project itself wrote down — ODR-0021 — and with its own gate, G3. Where it survives, I withdraw and name the condition that defeated me. Where it does not, I hold and name the precise re-open trigger.

---

## The frame I am attacking

The keystone proposition (Q1) is: *"Complete B1 by EAGER full enumeration of every in-scope overlay's bindable leaves now."* The motivating story is that ADR-0029's original reason for thin profiles — "no `opda:` terms to bind until the walk lands" — is now **spent**, because the descriptive TBox is substantially complete (254 emitted predicates; Category-G 239/239; the monetary walk executed 2026-05-31). So, the argument runs, the only thing standing between us and "full coverage" is the mechanical act of enumerating 28 more forms' leaves into SHACL.

I accept every one of those *facts*. I reject the *inference*. The inference is a bait-and-switch, and the bait is the word "spent."

---

## Attack 1 — "The walk is done, so enumerate" is precisely the trigger ODR-0021 forbids

ODR-0021 is the canonical record of *why the profiles are thin*, and it is unambiguous about what is and is not a trigger.

- Its YAGNI rule (§4, restated in §3.1): *"each addition must earn its keep against a real consumer, not a tidy-architecture argument."*
- Its rejection of exactly this proposition (§4): *"**Eager full enumeration now.** Rejected: builds shapes nobody validates against. Violates the YAGNI rule that each addition earn its keep against a real consumer, not a tidy-architecture argument."*
- Its §6 closing instruction: *"If a future session enumerates leaves without a named consumer, it is violating this ODR and should be reverted (cf. the reverted session-031 reframing)."*

Now read the two re-open triggers ODR-0021 actually wrote for the enumeration items:

- D1 (enumerate leaves as `sh:property`): re-open when *"A consumer needs per-question validation (e.g. form-fill UI, completeness check)."*
- D2 (bind leaves to `opda:` predicates): re-open when *"Descriptive walk completes **and** a consumer queries leaf-level data."* — note the conjunction. **Walk completion is one of two conjuncts, not the trigger.**

The S034 proposition has discharged the *first* conjunct of D2 and is presenting it as if it discharged the trigger. It has not. The walk completing is the thing ODR-0021 explicitly anticipated and explicitly said is **insufficient on its own**. "The TBox now has terms to bind" is the textbook tidy-architecture argument — "we *can*, the shapes would be neat" — which §4 names and rejects by name. The "largely spent" framing in the shared brief is true of the *first* conjunct of D2 and silently drops the second.

So the keystone, read against the project's own governing rule, is a re-litigation of a settled rejection on a premise (walk-done) that ODR-0021 pre-emptively ruled non-dispositive. That is not new information. That is the same Option-A-vs-Option-C fight with one conjunct ticked off.

## Attack 2 — The "one-go, full coverage" directive was bought with a coin that has since bounced

ADR-0029 chose Option A ("one delivery, full coverage, no staging") and rejected my Option C. Fine. But *why* was the shell-rollout judged cheap? Because a profile shell is "cheap" and "auditable" — and, underneath, because the whole overlay programme was sold on a mechanical-cheapness bet. The shared brief states it plainly: the S021 one-go directive rode on a "~90% mechanical" estimate.

That bet has already failed once, and the failure is in the record. The opda-gen CHANGELOG:

> "ADR-0028: monetary-leaf treatment **deferred** once (the '~90% mechanical' walk hit per-leaf judgement calls on R3 monetary forms; needed its own ODR/walk)."

So the mechanical-cheapness premise that justified "one-go, full coverage" is not a safe premise. The moment enumeration needs per-leaf judgement — and ADR-0028 is direct evidence it does — the directive that was *predicated on cheapness* should not silently bind. A directive premised on "this is mechanical" does not survive the discovery that it is not. ADR-0029 even concedes the seam: it says leaf enumeration "happens **only when ODR-0021's re-open triggers fire**." ADR-0029 does not order eager enumeration; it *defers to* ODR-0021's triggers. Q1 cannot lean on ADR-0029's "full coverage" for the leaf layer, because ADR-0029 itself routes the leaf layer to ODR-0021 — and ODR-0021 says "consumer, not tidy-architecture."

This is the cleanest hole in the keystone: **ADR-0029's "full coverage" was about the *shells*, which it shipped. For *leaves*, ADR-0029 explicitly hands the decision to ODR-0021's consumer gate.** Q1 reads "full coverage" as covering leaves. ADR-0029's own text refutes that reading.

## Attack 3 — Eager enumeration manufactures shapes that *cannot be gate-validated* (the G3 consumer-query limb)

This is my strongest structural attack, and it is grounded in the gate the project built, not in my preference.

ODR-0022 §2.2 G3: coverage is *"ratified **only when a worked SPARQL query retrieves the leaf's data**."* §2.3 calls this "the YAGNI guard at the descriptive layer — we do not manufacture coverage we cannot demonstrate." §4 rejects eager full coverage *at the done threshold*: "Binning can be eager; *done* cannot."

Now the implementation, which I read. The G3 enforcer lives in `tools/opda-gen/src/opda_gen/ci/descriptive_roundtrip_test.py`. Two facts from that file sharpen this attack rather than blunt it.

**First, G3 is structurally indifferent to consumers — and that is the problem, not the rescue.** The harness computes coverage purely as a graph property: a form leaf is `addressable` iff *exactly one* profile property-shape carries both `sh:path` and a `dct:source` form-leaf IRI (`build_coverage_report`, lines 245–282). There is no SPARQL-consumer limb in the *passing* gate at all. ODR-0022 §2.2 G3 has **two** conjuncts — (a) round-trip on the collapsed TBox **and** (b) "a worked SPARQL query retrieves a collapsed leaf by path + a Category-G leaf by dereferenceable term." The CI realises (a) as a hard gate but reduces (b) to *scaffolding* — `retrieve_by_path`/`retrieve_by_term` are functions "correct today … [that] simply return empty sets until the walk binds the leaves" (lines 304–305), exercised against baspi5 only. So eager enumeration can make 28 forms pass conjunct (a) — every leaf bound by exactly one path — while conjunct (b), the *consumer-query* limb, is demonstrated for **one** form. The gate that ODR-0022 §2.3 calls "the YAGNI guard … we do not manufacture coverage we cannot demonstrate" would report green on 28 forms whose worked-query limb nobody has run. That is *exactly* manufacturing coverage we cannot demonstrate, dressed as a passing test.

**Second — and this is the genuinely dangerous part — the gate is HARD (ADR-0031).** `test_full_round_trip_coverage_gate` asserts `report.violations == []` unconditionally, and `test_baspi5_round_trip_coverage_is_complete` asserts `report.is_complete` and `not report.gaps`. The harness used to "surface gaps without raising"; that xfail was flipped to a passing lock-in. The `violations` list hard-fails on `unaddressable` leaves, `doubly_bound` leaves, **and** `untraceable_shapes` (a `sh:path` with no form-leaf `dct:source`). Read that against eager enumeration of 28 forms: the instant the resolver GAPs a leaf (no unique-domain predicate) but the walker still emits a `dct:source` for that form question with no bound `sh:path`, you get an `unaddressable` form leaf → a **hard CI failure**, not a soft gap. Eager enumeration therefore does not quietly sit at soft-gap; under the current gate it is a *tripwire*. To get 28 forms green you must drive every referenced leaf to either a clean single-path bind or out of the `form_leaves` denominator entirely — precisely the per-leaf judgement ADR-0028 already proved is not mechanical, now multiplied across 28 forms and enforced by a red build. The "one-go, full coverage" directive collides head-on with its own hard gate.

So the gate is on my side twice over. It will not let a half-bound form pass quietly (the hard limb), and it cannot *ratify* a bound form as covered without the worked-query limb (the consumer limb). The only thing that takes a form from "structurally bound" to "G3-ratified covered" is **a consumer writing a query** — which is, definitionally, demand. Eager enumeration manufactures the structural half of coverage for 28 forms while the consumer half — the half ODR-0022 §2.3 names as the YAGNI guard — waits for a demand that, for most of these forms, no one has shown exists.

## Attack 4 — oc1/llc1 is the tell: enumerating for completeness, not for a consumer

Q2 asks the Council to declare a JSON-schema leaf-path a valid ODR-0022 §2 G2 `dct:source` anchor, *so that* oc1 and llc1 become enumerable. Look at what oc1/llc1 are. I read both emitted profiles: each is THIN — an `owl:Ontology` header carrying `dct:subject opda:PropertyDataServicesContext` and nothing else, its own `dct:description` recording that "Per-leaf constraint shapes are added as the descriptive-layer terms (ADR-0028) land … currently header + community only." Critically, both carry **zero form-question refs** (verified fact in the shared brief): OC1 (Official Copy of Register and Title Plan) and LLC1 (Local Land Charges Search) are HMLR / local-authority **register** data, ODR-0008d-flavoured — *authority-retrieved register extracts, not human-filled forms.* There is nothing a human answered on a question to anchor a `formRef` to.

The walker proves this structurally. `leaf_resolver.walk_form` only emits a `FormLeaf` for a leaf that carries a `"<form_id>Ref"` key — "only ref-bearing leaves are enumerable (ODR-0022 G2)" (line 175). oc1/llc1 have none, so the walker returns an empty leaf set for them. Q2 is an attempt to *route around the walker's own G2 guard* by redefining what counts as the anchor: substitute the JSON `leaf_path` (a structural coordinate — `"property.uprn"`) for the missing `formRef`. A schema leaf-path is not a form question; it is where a value sits in a document tree.

Why does anyone want oc1/llc1 enumerated? Not because a consumer is asking for leaf-level validation of a register extract — none is named. The only motive on the table is **symmetry**: "31 in-scope, let's not leave 2 thin." That is completeness-for-completeness. It is the purest instance of the tidy-architecture argument ODR-0021 forbids, and the fact that it requires *redefining what a `dct:source` anchor is* — and bypassing the walker's ref-bearing guard — to even become possible is the tell that we are bending the gate to fit the goal rather than letting demand drive the work. The overlay JSON schemas are a read-only nested upstream repo (verified) — we *cannot* retrofit real `formRef`s — so the only way to claim G2 for oc1/llc1 is to weaken G2's definition for every form. That is a high price for symmetry no consumer requested.

## Bonus — the Q3 mechanism is not yet trustworthy enough to ratify "as the rule"

Even setting policy aside: Q3 asks the Council to *ratify* the corpus-driven resolver in `leaf_resolver.py` as the bind-only-what-exists rule. I read the file. The *rule* it states is sound and I support its conservatism — `emitted_predicates()` records `domain_iri` as `None` whenever the predicate has zero **or multiple** `rdfs:domain` (lines 63–65), and `bind()` returns `None` (a GAP) when there is no emitted predicate **or** no single resolvable domain (lines 107–113). Unique-domain → bind; zero → GAP; ambiguous → GAP; never fabricate; one ref → one `sh:path` (the walker emits one `FormLeaf` per ref-bearing leaf). That is the right shape of rule, and it is exactly the gap-honest posture I would insist on.

My reservation is evidentiary, not architectural. The resolver is the load-bearing mechanism that would drive 28 forms, yet I find **no resolver test in the tree** demonstrating its three branches — the single-domain bind, the zero-domain GAP, and (the subtle one) the *multiple*-domain GAP that depends entirely on the `len(domains) == 1` guard in `emitted_predicates`. ODR-0022 G3's whole ethos is "test, don't assert." Ratifying a mechanism "as the rule" before its own discriminating behaviour is demonstrated is ratifying an intention, not a tool — especially the ambiguity branch, where a one-character change (`>= 1` instead of `== 1`) would silently start fabricating domains across every form. A resolver we lean on for 28 forms should itself be under test first.

---

## Where I can be defeated — my WITHDRAW conditions, stated honestly

I am defeasible, and the brief is right that there *is* a version of this that I should not block. My watching-brief objects to **new commitments built for tidiness with no consumer**. It does **not** object to **cheap, reversible activation of an already-paid-for asset, provided each shape is sound and the gaps are told honestly**. If the Council can show all of the following, my objection to Q1 dissolves:

1. **Activation, not commitment.** Enumeration is framed and recorded as *activating* the already-emitted TBox (the 254 predicates exist; binding is a read-only projection of them into SHACL `sh:path`s), creating **no new ABox/TBox commitment** and adding nothing the gap register cannot retract.
2. **Reversible and consumer-agnostic.** The enumerated shapes are byte-reproducible from corpus + resolver (gap-2 already proved the generic emitter reproduces baspi5 byte-identically, commit 8753784), so re-deriving or dropping them is mechanical, not a migration.
3. **Every shape sound AND the hard gate stays green.** Each bound leaf passes the unique-domain rule; **zero `doubly_bound`** and **zero `untraceable_shapes`** (both are `report.violations` hard-fails under the flipped ADR-0031 gate); every GAPped leaf is kept *out of the `form_leaves` denominator* (no orphan container-shape `dct:source`) so it does not become an `unaddressable` hard failure; ambiguous and unmatched leaves go to GAP, never fabricated. If the build is green honestly (not by suppressing the gate), the shapes are sound by the project's own test.
4. **Gap-honesty is emitted, not implied.** Each form ships an honest per-form gap register (Q4) so a reader sees exactly which leaves are bound, which are GAPs (no bindable predicate), and which are bound-but-not-yet-consumer-queried — no shape *implies* the worked-query limb of G3 it has not discharged.
5. **The mechanism is demonstrated.** A resolver test covers the single-domain bind, the zero-domain GAP, and the multiple-domain GAP (the `len(domains) == 1` guard) before the resolver is leaned on for 28 forms — G3's "test, don't assert" applied to the tool itself.

If 1–5 hold, eager enumeration is no longer "shapes nobody validates against" — it is the honest, cheap, reversible projection of an asset the project already bought, with its incompleteness told to the reader's face. That is publishable linked data with the *gap itself* as a first-class published fact. I withdraw on that condition, and only that condition.

---

## Per-question disposition

### Q1 (KEYSTONE) — eager full enumeration of every in-scope overlay's bindable leaves now

**Vote: REVISE.** I cannot AFFIRM unqualified eager: ODR-0021 forbids enumeration on a tidy-architecture trigger, ADR-0029 routes the *leaf* layer to ODR-0021's consumer gate (it only ordered full coverage of the *shells*), and the flipped-hard G3 gate (ADR-0031) turns every GAPped-but-still-referenced leaf into a build-breaking `unaddressable`/`untraceable_shapes` failure — the per-leaf judgement ADR-0028 proved non-mechanical, now ×28 and enforced red. I do not REJECT outright, because gap-2 makes enumeration genuinely cheap/reversible and the TBox is genuinely paid-for — *if* it is framed as activation + emitted gap register and the hard gate is kept honestly green, it stops being speculative. The middle: enumerate **bindable** leaves as a reversible projection, **emit a per-form gap register**, keep `report.violations == []` honestly (no `doubly_bound`, no `untraceable_shapes`, GAPs kept out of the denominator), and record that this is activation of an existing asset, **not** discharge of G3's worked-SPARQL-query limb (forms stay un-consumer-validated until a real query lands).
**Disposition: WITHDRAWN — conditional.** Defeating condition: WITHDRAW conditions 1–5 above are all met (activation-not-commitment; byte-reversible; every shape sound with the hard gate honestly green; gap register emitted; resolver demonstrated). **HELD** on any unmet condition, re-open trigger: *any enumerated form ships without its gap register, OR the G3 hard gate (`report.violations`) is made green by suppression rather than by sound binds, OR a shape is presented as G3-"covered" while its worked-SPARQL-query limb has never been run.*

### Q2 — JSON-schema leaf-path as a valid G2 `dct:source` anchor → oc1/llc1 enumerable

**Vote: REJECT.** A schema leaf-path is a structural coordinate, not a form question; oc1/llc1 carry zero refs because they are authority-retrieved register data (ODR-0008d), and the upstream schemas are read-only so no real `formRef` can ever be added. Redefining G2 to admit leaf-paths weakens the anchor for *all* forms purely to buy symmetry no consumer requested — the exact tidy-architecture move ODR-0021 forbids.
**Disposition: HELD.** Re-open trigger: *a named consumer issues a worked SPARQL query against an oc1/llc1 leaf (discharging ODR-0022 G3 for register data), at which point the register-data anchor is justified by demand and should be modelled as an ODR-0008d register anchor — not by quietly redefining the G2 form-question anchor.*

### Q3 — ratify the corpus-driven bind-only-what-exists resolver

**Vote: REVISE.** The *rule* (unique-domain → bind; zero/ambiguous → GAP; never fabricate; one ref → one `sh:path`) is correct and I endorse its conservatism — it is faithfully coded in `bind()` and `emitted_predicates()`. But no resolver test in the tree demonstrates the three branches, and the ambiguity (multiple-domain) GAP turns on a single `== 1` guard that, if loosened, fabricates domains silently. Ratify the rule; condition the ratification on the mechanism being demonstrated.
**Disposition: WITHDRAWN — conditional.** Defeating condition: a resolver test covers the single-domain bind, the zero-domain GAP, and the multiple-domain GAP (green) **before** the resolver drives any non-baspi5 form. **HELD** until then, re-open trigger: *the resolver is used to enumerate any form while its single/zero/multiple-domain behaviour is undemonstrated by test.*

### Q4 — amend ADR-0029 "full coverage" → "full coverage of BINDABLE leaves + an honest, emitted per-form gap register"

**Vote: AFFIRM.** This is the amendment that converts eager enumeration from a YAGNI violation into honest published data. "Full coverage of *bindable* leaves" concedes (correctly) that unbindable leaves are not coverage, and "an honest, emitted per-form gap register" makes the incompleteness a first-class published fact rather than something a reader infers from missing shapes. This is "model what you publish" applied to the gaps themselves — exactly my brief. It is also the precondition for my Q1 withdrawal: without Q4, Q1 ships shapes that over-claim; with Q4, the gap register keeps every shape honest.
**Disposition: CONCEDED.** This amendment *is* the gap-honesty discipline I would otherwise be demanding; affirming it requires no condition from me. (Caveat for the record: the gap register must be **emitted** alongside the shapes, not merely promised — that is the load-bearing word in the amendment.)

---

## One-paragraph summary for the Queen

I do not block enumeration; I block *unconditioned* enumeration. ODR-0021 forbids enumerating on a "the TBox now has terms" trigger (a tidy-architecture argument, not a consumer); ADR-0029 itself routes the *leaf* layer to ODR-0021's consumer gate and only ever ordered full coverage of the *shells*; and the G3 worked-SPARQL-query limb is discharged for exactly one form (baspi5), so eager enumeration of 28 more makes the *structural* gate green while leaving the *consumer* limb undemonstrated — manufacturing coverage we cannot demonstrate, which §2.3 forbids by name. Worse, the gate was flipped hard (ADR-0031): a GAPped-but-referenced leaf is now a red build, not a soft gap, so "one-go, full coverage" runs straight into per-leaf judgement (ADR-0028's proven-non-mechanical work) ×28, enforced by CI. The defensible path is the one Q4 describes: enumerate **bindable** leaves as a cheap, byte-reversible *activation* of the already-paid-for TBox, **emit a per-form gap register** so the incompleteness is published rather than implied, keep `report.violations == []` honestly (not by suppression), and record that this is activation — **not** discharge of G3's worked-query limb, so each form stays un-consumer-validated until a real query lands. On that framing I withdraw Q1 and Q3 and concede Q4. I hold Q2: do not redefine the G2 form-question anchor to admit JSON-schema leaf-paths for register-data forms (oc1/llc1) that no consumer has queried — model that as an ODR-0008d register anchor when demand actually arrives.
