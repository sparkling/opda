# Session 034 — Position of Elisa Kendall

> Lens: identifiers are commitments; reference-ontology vs message-model discipline.
> The question I bring to every artefact: *what does this commit us to, and who needs it?*

---

## 0. The move that decides my whole vote: mint vs. activate

My lens is often read as a YAGNI lens. It is not — or not only. YAGNI guards against
**new speculative commitments**. My discipline is narrower and sharper: *do not mint or
publish an identifier you cannot ground in a committed term and (ideally) a consumer.*
The crux of S034 is therefore a factual one, and it is the question Davis and I may split on:

> **Does enumerating a form profile MINT any new committed identifier — or does it only
> add `sh:path` REFERENCES to `opda:` predicates that already exist, inside profile graphs
> that already exist and are already generated?**

I read the records as settling this:

- **ODR-0010 (Decision):** the overlay "does not mint terms; it constrains the use of
  existing ones." THIN is the floor; enumeration is "richer"; enumeration level is an
  *already-sanctioned per-form choice*.
- **Session 001, my own carried point:** "the overlay references terms; it does not mint
  them. Minting happens once, in the reference ontology. An overlay is a *use* of committed
  identifiers, not a new commitment."
- **ODR-0022 (Decision):** the overlay "references reference-ontology terms by IRI; it does
  not import … and it does not mint reference terms." A `sh:path` is a *reference*.

Therefore: **enumerating a bindable leaf mints nothing.** It points an `sh:property/sh:path`
at an `opda:` predicate that the descriptive TBox already published (brief: 254 predicates,
G 239/239). The published-IRI surface is **unchanged** by enumeration. What changes is that
a paid-for asset gets *activated*.

This is the distinction I want on the record: **YAGNI bites on new commitment; it does not
bite on activation of an existing commitment.** And the activation here is of a *generated,
byte-identically re-pinnable, reversible* artefact (brief; ADR-0029 §Decision) — which is
the lowest-governance-cost asset class there is. A hand-authored profile would raise the bar;
a generated one lowers it. So on the *bindable* leaves, my commitment-axis objection is
**absent**, and I do not get to borrow Davis's demand-pull objection to manufacture one.

Where my objection is **present and decisive**: (a) any leaf that does *not* resolve to a
committed term — enumerating that would be the exact error I exist to prevent (a `sh:path`
to nothing, or worse a *guessed* binding); and (b) forms with **zero** anchorable
form-questions, where there is no leaf to reference and the artefact would be reference-side
scaffolding for a message-model register with no consumer (Q2: oc1, llc1).

---

## Q1 (KEYSTONE) — "Complete B1 by EAGER full enumeration now"

**Vote: REVISE.**

Eager enumeration of every **bindable** leaf: I affirm. It mints nothing new (§0); it
activates already-committed terms inside already-generated graphs; the artefact is generated
and reversible. ADR-0029's instinct — one uniform code path, no per-form "does a consumer
exist yet?" branching — is *sound emitter hygiene*, and a conditional emitter is itself a
maintenance commitment I would not pay for. On the bindable set, Davis's YAGNI and ADR-0029's
one-go converge, and I side with completion.

But "EAGER FULL enumeration" as literally worded over-reaches on two counts my lens cannot
wave through:

1. **It would force enumeration of un-bindable leaves**, i.e. emit `sh:path`s that reference
   no committed term, or invite a guessed binding. That is minting-by-the-back-door and the
   precise failure ODR-0022/G2 and the resolver forbid.
2. **It implies enumerating oc1/llc1** (0 refs), which have nothing to enumerate (see Q2).

So I REVISE to: **eager, full coverage of the *bindable* surface, now, in one go; un-bindable
leaves go to an honest emitted GAP register, not to a fabricated `sh:path`.** That is Q4's
wording, and Q1 should be decided *as* Q4. This is not Option C (demand-pull) — I am not
gating on consumers; I am gating on *groundedness*, which is a different and stricter axis.

*cite:* ODR-0010 §Decision (THIN floor / enumeration richer, no minting); Session 001
(Kendall carried point); ODR-0022 §Decision (references, never mints); ADR-0029 §Decision
(uniform emitter rationale).

---

## Q2 — "A JSON-schema leaf-path is a valid G2 `dct:source` anchor → enumerable"
### (oc1 + llc1: ZERO form-question refs; HMLR / LA register data)

**Vote: REVISE.**

Two halves; they pull opposite ways and the proposition fuses them.

- **The abstract claim — a JSON-schema leaf-path *is* a valid G2 `dct:source` anchor:**
  I AFFIRM this in principle. G2 requires every bound leaf to anchor to a `dct:source`
  provenance anchor in the form schema (ODR-0022 §G2). A schema leaf-path *is* a provenance
  locator in the schema; it is exactly the right kind of thing to anchor a binding. There is
  no minting in citing a source path. So the *anchor mechanism* is valid.

- **The applied claim — therefore oc1/llc1 are "enumerable":** here my lens objects. oc1 and
  llc1 carry **zero form-question refs**; they are HMLR / LA *register extracts*. In my
  vocabulary these are **message-model register data**, not reference-side form shapes. A
  profile over them would be a validation surface for data nobody, on the reference side,
  has asked to validate. There are *no leaves to reference* (0 refs) — so "enumerable" is
  vacuous: enumeration of zero leaves is a THIN profile by another name. Emitting a
  ceremonially-"enumerated" oc1/llc1 commits us to maintain a shape with no content and no
  consumer — the one place YAGNI *does* bite here, because there is no paid-for asset being
  activated; there is nothing there.

**REVISE to:** the G2-anchor principle is ratified (a schema leaf-path is a valid `dct:source`);
but oc1/llc1 with 0 refs are **not** enumerated — they remain THIN, and acquire `sh:path`s
**only if/when** register-data validation becomes a consumer requirement. This keeps the
reference/message line clean: we do not build reference-side validation for a register extract
on spec.

*cite:* ODR-0022 §Context + §G2 (message-model vs reference-ontology; `dct:source` anchor);
verified facts (oc1 0, llc1 0 refs); ODR-0021 §Decision (consumer-gated, the genuinely
content-free case).

---

## Q3 — Ratify the corpus-driven bind-only-what-exists resolver

**Vote: AFFIRM.**

This is my discipline rendered as code, and I back it without reservation. Reading
`leaf_resolver.py`:

- **Bind only a resolved local-name → an emitted `opda:` predicate with exactly one
  `rdfs:domain`** (rule 2). One unambiguous reference; one `sh:path`. Correct.
- **No match ⇒ GAP; never fabricate, never guess** (rule 3, and the module docstring:
  "No fabrication, no guessing"). This *is* "don't commit an identifier you can't ground."
- **>1 match ⇒ do not pick; surface a double-bind, hard-fail downstream** (rule 4). Refusing
  to silently disambiguate is exactly right: a silent pick would be the emitter *asserting* a
  commitment the corpus does not license. Hard-fail is the honest failure mode.

"One ref → one `sh:path`" is the message-model contract done properly: the profile says only
what the corpus already commits, no more. The harness today recognises only baspi5's authority
(ODR-0022 §G3) and tolerates soft gaps while hard-failing double-binds — the resolver's
semantics line up with that gate exactly. Nothing to revise.

*cite:* `tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py` (docstring; `resolve_leaf`
rules 1–4); ODR-0022 §G3 (baspi5 authority, soft-gap tolerated, double-bind hard-fail).

---

## Q4 — Amend ADR-0029 "full coverage" → "full coverage of BINDABLE leaves + honest emitted gap register"

**Vote: AFFIRM.**

This is the governance hygiene I advocate, and it is the same disposition as my Q1 REVISE
stated at the right altitude. ADR-0029's literal "full coverage" was written when its premise
was "no terms yet" — a premise the brief records as **largely spent** now that the descriptive
TBox is substantially complete. "Full coverage" must now mean *coverage of what is groundable*,
because the alternative — covering un-groundable leaves — would force the very fabrication the
resolver and G2 forbid (§0, Q1).

The **emitted gap register** is the part I most want ratified. An honest, machine-readable
record of "these leaves resolved to no committed term" is superior governance to silence: it
makes the unbound surface *visible and auditable*, turns each gap into a tracked, demand-pull
candidate (the legitimate home for Davis's axis), and prevents a gap from being quietly
"resolved" by a guess later. A gap register is not a new identifier commitment — it commits
*nothing* in the published namespace; it is provenance about absence. That is pure hygiene.

This amendment does **not** gut ADR-0029: the one-go, uniform-emitter, no-per-form-branching
directive survives intact for the bindable set. It only narrows "full" from "every leaf" to
"every *bindable* leaf," and adds the honest accounting for the remainder.

*cite:* ADR-0029 §Context (the "now that the TBox is complete" premise) + §Decision
(one-go/uniform); brief (ADR-0029 "no terms yet" rationale LARGELY SPENT); ODR-0022 §G2
(no source ⇒ no binding); `leaf_resolver.py` (GAP, never guess).

---

## Summary of votes

| Q | Vote | One line |
|---|---|---|
| Q1 | REVISE | Eager now for *bindable* leaves (mints nothing — activation, not commitment); un-bindable → gap, not fabricated `sh:path`. |
| Q2 | REVISE | Schema leaf-path *is* a valid G2 anchor (affirm); but oc1/llc1 at 0 refs have nothing to enumerate — stay THIN until a register-data consumer exists. |
| Q3 | AFFIRM | Bind-only-what-exists is "never commit an ungroundable identifier" in code; GAP not guess; double-bind hard-fail. |
| Q4 | AFFIRM | "Full" = full of the *groundable*; the emitted gap register commits nothing published and makes absence auditable. |

## Key argument

Enumerating a bindable leaf adds an `sh:path` reference to an `opda:` predicate that the
reference ontology has *already* committed, inside a profile graph that is *already* generated
and byte-identically re-pinnable — so it mints no new published identifier and creates no new
maintenance surface. By my own Session-001 precedent (an overlay is a *use* of committed
identifiers, not a new commitment), YAGNI simply does not bite on activating a paid-for asset;
it bites only on *new* commitments. The live commitment risk is therefore not "enumerate now"
but "enumerate the *un-bindable*" — so the right ruling is eager full coverage of the bindable
surface plus an honest emitted gap register, which is exactly ADR-0029-as-amended (Q4).

## Strongest opposing point I concede

Davis is right that a profile, once emitted, *is* a standing artefact someone may later read
as load-bearing — even a generated one — and that "it regenerates cheaply" understates the
governance reality that consumers can come to *depend* on an enumerated shape we built before
anyone asked. If a downstream party hardens against an eagerly-enumerated profile, my "just
regenerate, it's reversible" loses force; reversibility of the *file* is not reversibility of
the *commitment a consumer has formed*. That is a real cost my mint-vs-activate framing
understates, and it is the strongest case for gating even bindable enumeration on demand.
