# Session 034 — Position of Kurt Cagle

**Lens:** SHACL-is-the-contract; the overlay table is a DCTAP and the SHACL graph
is its compiled contract. I decide the **enumerator mechanism (Q3)** and the
DCTAP→SHACL framing. My AFFIRM on eager completion (Q1) is **conditional** on the
Q3 mechanism being sound — a generated shape that binds a fabricated `sh:path` or
a guessed domain is a *broken contract*, worse than no shape at all.

---

## Framing: this is a DCTAP→SHACL compile, and that is correct

At S022 the council ruled — 6–0, council-ratified — that the `ProfileSpec` /
`_build_profile` refactor "IS a DCTAP→SHACL step": the data-dictionary per-overlay
table is a DC Tabular Application Profile, and `profiles.py` is its compiler
(ADR-0029 amendment, S022; ODR-0021 row F3 records the same identity —
"`profiles.py` already performs the data-dictionary→SHACL generation … that *is* a
TAP→SHACL step"). So generating per-form SHACL from a spec is not over-engineering;
it is the *idiomatic* realisation. Hand-authoring 30 more 400-line builders (the
status quo — `_build_baspi5_shapes` is ~430 lines of hand-written `sh:path`s) is the
anti-pattern S021/ADR-0029 Option B already rejected.

**Crucial scope distinction I will police all session:** using DCTAP *discipline
internally* to compile SHACL (in scope — exactly what `leaf_resolver` +
`_build_profile` do) is **not** the same as *publishing a DCTAP artefact*
(ODR-0021 **F3**, ratified-as-deferred behind a named trigger: "external parties
authoring profiles, OR a decision to publish the constraint tables as standalone
data"). Nothing in S034 fires that trigger. We must not let "DCTAP→SHACL" rhetoric
drift into re-opening F3. We compile *from* the table; we do not publish the table.

---

## Q3 (MY KEYSTONE) — the mechanism. **AFFIRM, with three ratification conditions.**

I read `leaf_resolver.py` closely against the traps my lens demands I check.

### What the resolver does (verified, lines cited)
- `emitted_predicates(ontology_dir)` (ll. 46–75) parses the emitted `opda-*.ttl`
  graphs and returns `{local_name: EmittedPredicate}` for every `owl:DatatypeProperty`
  / `owl:ObjectProperty` in the `opda:` namespace. Critically:
  `dom = str(domains[0]) if len(domains) == 1 else None` (l. 65) — **a predicate
  with zero OR multiple `rdfs:domain` gets `domain_iri = None`.**
- `bind(leaf_name, predicates)` (ll. 99–113) returns the predicate **iff** the
  resolved name is an emitted predicate (`pred is None → GAP`, l. 110) **and** it
  has a single domain (`pred.domain_iri is None → GAP`, l. 112). Otherwise `None` =
  a GAP. **It never fabricates a predicate and never guesses a domain.** This is
  precisely the contract I require: bind a real predicate to a real target class,
  or emit nothing and record the gap. The core contract is *sound*.

### Trap (b) — no/multiple domains: **PASS.** Handled at l. 65 + l. 112.
A predicate the TBox left domain-less, or domain-ambiguous, is a GAP, not a
bind-to-`owl:Thing` guess. Correct, and the right failure direction. Consequence
for the record: the resolver's yield is *floored by TBox domain hygiene* — every
flat Category-G property must carry exactly one `rdfs:domain` or it silently gaps.
That makes "bindable-leaf count" a function of TBox completeness — which is why my
Q1 AFFIRM is conditional and why the Q4 gap register matters.

### Trap (a) — last-segment name collisions (`details`/`price` trap): **PARTIAL — condition C1.**
ODR-0022 **G1** is explicit and load-bearing: the leaf→category rule MUST be
**path-aware, not last-segment**; it MUST place `propertyPack.priceInformation.price`
in **G** and `propertyPack.fixturesAndFittings.*.price` in **D**; a name-only rule
mis-bins, and the mis-mint is permanent (ADR-0028 §14).

The walker (`_walk`, ll. 158–187) **does** compute a full dotted `leaf_path`
(l. 181) and carries it on every `FormLeaf` — so path is *available*. But the
binding path is **name-keyed, not path-keyed**: `resolve(leaf_name)` (ll. 90–96)
does `COLLAPSED.get(leaf_name, leaf_name)` on the **last segment only**, and
`COLLAPSED` (category_g_curation.py ll. 68–103) is a flat
**`{local_name: opda_local_name}`** dict (`"description": "disclosureDetail"`,
`"uprn": "hasUPRN"`, `"address": "hasAddress"`, the five schoolType bands …). There
is **no `leaf_path` key anywhere in the resolve/bind path.**

So the resolver inherits G1-safety **only by construction of the upstream Category-G
TBox, not by its own logic.** It is safe *today* because the path-aware A/C/D/E/F
binning ran upstream in `leaf_categoriser.py`, so a fixtures `price` was never
minted as a flat G predicate — there is no `price` in `COLLAPSED`, a `price` leaf
resolves to identity, finds no emitted `opda:price`, and **gaps** (correct outcome;
ODR-0024 R3 also withdrew the false `opda:price` monetary collapse — the docstring
even cites the honest 167/188). But the *resolver itself* cannot distinguish two
same-named leaves on different paths: any future `COLLAPSED` key whose last segment
is path-ambiguous would bind **both** leaf occurrences to one predicate, blind to
path. That is a latent G1 violation one curation edit away.

**Condition C1:** make the binding contract path-aware *in its own right*, not
merely path-safe-by-upstream-accident. Minimal, non-speculative (this is exactly
the surgical discipline G1 already mandates — no new abstraction): the binder's
authoritative input is the path-aware categoriser's verdict for *this `leaf_path`*
(it already exists — G1 is enforced in `leaf_categoriser`); bind a leaf only if the
categoriser routed *that path* to G, then resolve the collapsed name, falling back
to name-keyed `COLLAPSED` only for genuinely path-invariant shared targets
(`uprn`→`hasUPRN`, `address`→`hasAddress`, the schoolType bands — safe because the
*target* concept is path-invariant). If C1-as-code is judged outside S034's
enumeration-layer remit, I accept **C1-as-a-test**: the G3 harness hard-fails any
`COLLAPSED` key whose last segment is non-unique across the enumerated leaf-paths
(the existing double-bind guard generalised to name-collision). The contract is not
*sound* until path-disambiguation is **guaranteed**, not **circumstantial**.

### Trap (c) — collapsed register + category routing: **PASS, with C1's caveat.**
`COLLAPSED` correctly carries *only* non-identity mappings, with identity leaves
implicit via `.get(name, name)`. The register is well-shaped — it even documents
*why* monetary leaves are deliberately NOT collapsed (incompatible value semantics;
ODR-0024 R3), which is the kind of provenance a DCTAP source column should preserve.
Routing is sound *given* the upstream path-aware binning; C1 makes it sound
*independently*.

### Trap — namespace source + the orphan does not even import: **condition C2 (sharpened).**
`leaf_resolver.py` strips `_OPDA_STR = str(OPDA)` where `OPDA` is
`from ..namespaces import OPDA` (l. 23, l. 26). **Verified in-session: there is no
`opda_gen/namespaces.py` module** — `OPDA` is defined *inline* in `profiles.py`
(l. 67), `term_sourcing.py` (l. 30), `composer.py` (l. 21) and `emitters/__init__.py`
(l. 8), never in a `namespaces` package. So the resolver's very first import target
is **absent**, and a bare `import opda_gen.inputs.leaf_resolver` raises
`ModuleNotFoundError` — the orphan **does not load as written.** (Good news for the
*string*: every inline `OPDA` is byte-identical to the emitted TTL prefix
`@prefix opda: <https://w3id.org/opda/#>`, so once the import is repointed the
namespace match itself is sound — my mismatch fear is *latent*, not active.) **C2,
sharpened:** (i) repoint l. 23 to wherever `OPDA` is canonically sourced (introduce
a real `namespaces.py` or import from the existing inline home), and (ii) a test
MUST assert `emitted_predicates(<emitted dir>)` is **non-empty** and that its key
set intersects known flagship G terms (`builtForm`, `currentEnergyRating`,
`councilTaxBand`, `constructionYear`) *before* any profile is emitted from it — a
green "all gaps" run is otherwise indistinguishable from a namespace/import typo.

### Trap — the mechanism is an UNTRACKED, NON-IMPORTING ORPHAN: **condition C3.**
`leaf_resolver.py` is **untracked** (`?? tools/.../leaf_resolver.py`, verified) and
**no emitter or test imports it** (a corpus grep for `leaf_resolver` / `walk_form` /
`emitted_predicates` / `ParsedForm` / `FormLeaf` outside its own file returned
nothing). `profiles.py`'s `_thin_specs()` still ships all 30 non-baspi5 forms with
`shape_builder=None` (ll. 281–305) — i.e. the resolver this council is asked to
ratify is **not yet wired into emission at all**, and (per C2) it does not even
import. That is acceptable for a *proposed* mechanism, but it means "ratify the
resolver" (Q3) and "complete B1" (Q1) are the **same act**: ratification must come
with **C3 — fix the import, then wire `leaf_resolver` into a generic `shape_builder`
that `_thin_specs` installs**, so the contract I am vouching for is the contract that
actually runs. An orphan that does not load cannot carry G3.

**Q3 verdict: AFFIRM the corpus-driven bind-only-what-exists resolver.** Its core
contract — real predicate + single real domain, else GAP, never fabricate — is
sound and is the correct DCTAP→SHACL binder. **Conditional on C1 (path-aware
binding in its own right — ODR-0022 G1), C2 (namespace / non-empty-predicate-set
floor), and C3 (wire the orphan into emission).** All three live inside the
enumeration layer S034 governs; none re-opens a settled mapping.

---

## Q1 (KEYSTONE) — eager full enumeration now. **AFFIRM (conditional on Q3 C1+C2+C3).**

A DCTAP→SHACL compile is *mechanical by design* — that is the whole point of
data-fying the spec (ADR-0029 Option A, the chosen option; S022). Once the binder
is sound and wired, emitting bindable shapes for all 30 forms is one pass over
already-walked leaves against an already-emitted TBox (239/239 G-grade per the
brief). The expensive things — the TBox and the binder — are built; the marginal
cost of eager emission is near-zero. ADR-0029 rejected demand-pulled Option C under
the S021 one-go directive; I see no new fact reversing that. **But "eager" means
eager over what the sound binder can honestly bind**, not eager-fabrication to hit a
coverage number. My AFFIRM is for **eager emission of bindable shapes + an emitted
gap register in the same pass** — which is exactly Q4. Eager and honest are not in
tension; eager-and-fabricated is the only thing I reject, and Q3's contract already
forbids it.

---

## Q2 — JSON-schema leaf-path as a valid G2 `dct:source` anchor → enumerable. **AFFIRM.**

oc1 + llc1 have **zero** `<form>Ref` references (HMLR/LA register data — verified:
ta6 365 … oc1 0, llc1 0). Is a JSON-schema leaf-path (`$id#/path/to/leaf`) a
legitimate DCTAP **source anchor** when no form-question ref exists? Yes.

ODR-0022 **G2** requires `dct:source` to point at "the **schema leaf path** (the
form-question IRI, ODR-0008 §Q3a per-overlay array)" — i.e. *the leaf's identity in
the schema*, not necessarily a human form-question number. Where a form carries
`<form>Ref` numbers (baspi5's `baspi5Ref`), the ref IS the anchor. For a
register-data overlay carrying none, the leaf's **`$id`-rooted JSON Pointer**
(`walk_form` already captures `schema_id = data.get("$id")`, l. 199, and the full
`leaf_path`, l. 181) is the canonical, dereferenceable, stable identity of that leaf
— exactly what a DCTAP `propertyID`/source column is. A JSON-Pointer into a
published schema `$id` is a perfectly good IRI anchor — *more* precise than a coarse
form-question number, not less. G2's intent is "never lose which leaf this came
from, in both directions"; `$id#leaf_path` satisfies that fully.

So oc1/llc1 leaves are **enumerable on the strength of their `$id#leaf_path`
anchor**, no `<form>Ref` required. Note the mechanism needs a small in-scope tweak:
the walker today emits *only* ref-bearing leaves (`if not isinstance(ref, str):
return`, l. 175 — "only ref-bearing leaves are enumerable (ODR-0022 G2)"), so to
enumerate oc1/llc1 it must treat a missing `<form>Ref` as "anchor = `$id#leaf_path`"
rather than skipping the leaf. That changes no settled mapping. Caveat I concede: a
`$id#path` anchor is only as stable as the upstream schema's `$id` and structure —
but the overlay schemas are a **pinned read-only upstream repo**, so stability holds
for the pinned revision; an upstream re-path is the same re-pin event that already
governs every walked artefact.

---

## Q4 — "full coverage" → "full coverage of BINDABLE leaves + honest emitted gap register." **AFFIRM.**

This is the cleanest possible DCTAP coverage statement and the only honest one given
Q3's contract. "Full coverage" cannot mean "a shape for every leaf," because some
leaves have **no bindable `opda:` predicate** (the binder GAPs them by design — no
emitted term, or no single domain; the ~18 monetary leaves are a live example,
deferred to the held monetary walk). Forcing those to coverage means fabricating
paths/domains — the broken contract I reject outright. So "full coverage" *must*
mean **full coverage of the bindable set, with every non-bindable leaf recorded in
an emitted, queryable gap register** — a DCTAP profile with a complete coverage
report: every leaf accounted for, *bound* or *gapped-with-reason*, nothing silently
dropped (ODR-0022 §5 "no silent loss"; the residue-register discipline already used
by `ci-category-g-coverage`'s honest 167/188). An emitted gap register also makes
the descriptive-TBox frontier *measurable*: each gap is a concrete "this leaf wants
an `opda:` term that doesn't yet exist, or wants a domain the TBox didn't give it" —
the honest backlog, not a hidden failure.

ADR-0029's original "one-go, full coverage" rested on "no terms yet"; the brief
notes that rationale is "largely spent" (254 predicates, 239/239 G). The amendment
doesn't *weaken* the one-go directive — it *operationalises* it against the reality
that coverage = bindable ∪ honestly-registered-gaps. **AFFIRM**, and I'd have the
gap register be an emitted artefact (a small report TTL) so G3's harness can assert
"bound + gapped == all walked leaves" as a coverage *test*, not a claim.

**Guard on Q4:** the gap register is an *internal coverage report*, not a published
DCTAP. It must not become the camel's nose for ODR-0021 **F3** ("DCTAP as a
published artefact"). Emit it for our own G3 gate; do not publish it as a standalone
tabular profile absent F3's named trigger.

---

## VOTES

- **Q1:** AFFIRM (conditional on Q3 C1+C2+C3) — DCTAP→SHACL is mechanical and
  correct; eager = eager over *bindable* shapes, marginal cost now near-zero.
  cite: ADR-0029 Option A (chosen) + S022 amendment.
- **Q2:** AFFIRM — a `$id#leaf_path` JSON-Pointer is a legitimate, more-precise G2
  source anchor; oc1/llc1 enumerable without a `<form>Ref`. cite: ODR-0022
  §Rules.2 G2 + leaf_resolver `walk_form` (schema_id l.199 / leaf_path l.181).
- **Q3:** AFFIRM with C1 (path-aware binding in its own right — G1) + C2
  (namespace / non-empty-predicate floor) + C3 (wire the untracked orphan into
  emission). Core contract sound: real predicate + single domain else GAP, never
  fabricate. cite: leaf_resolver.bind ll.99–113 + COLLAPSED ll.68–103 vs ODR-0022
  G1.
- **Q4:** AFFIRM — coverage = bindable ∪ honest emitted gap register = a clean
  DCTAP coverage report; register internal-only (do not trip ODR-0021 F3).
  cite: ODR-0022 §5 (no silent loss) + ADR-0029 "full coverage."

## KEY ARGUMENT
The overlay table is a DCTAP and SHACL is its compiled contract, so spec-driven
enumeration of all 30 forms is the idiomatic completion of B1, not over-engineering —
and the `leaf_resolver` contract (bind a real predicate with a single real domain,
else GAP, never fabricate a path or guess a domain) is exactly the soundness a
compiled contract requires. I therefore AFFIRM eager full enumeration (Q1) and the
resolver (Q3), but my AFFIRM is *conditional*: the binder is presently G1-safe only
by upstream accident (name-keyed `COLLAPSED`, not path-keyed), a namespace mismatch
would silently gap everything, and the module is an untracked orphan not yet wired
into emission — all three must be closed by test-or-code (C1, C2, C3) before "honest
gaps" can be trusted to mean honest binds. "Full coverage" must be redefined (Q4) as
full coverage of the *bindable* set plus an emitted gap register, because forcing
non-bindable leaves to coverage is precisely the broken-contract fabrication the
mechanism is built to refuse.

## STRONGEST OPPOSING POINT YOU CONCEDE
The YAGNI/ODR-0021 voice is right that eager enumeration of 30 forms whose leaves
mostly GAP (oc1/llc1 at 0 refs; the monetary leaves and other single-domain-less
terms deliberately uncovered) risks emitting near-empty shape graphs that constrain
almost nothing today — coverage-as-a-number satisfied while real validation value is
thin — so a consumer-gated middle (enumerate where the bindable yield clears a
threshold, register the rest) is a defensible reading of the same facts, and the
honest gap register I demand is itself the evidence for *how* thin some forms
currently are.
