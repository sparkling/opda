# Session 034 — Position of Holger Knublauch (Queen / Moderator)

**Role:** Queen and voting member. I own ODR-0010 (overlay-profile mechanism) and its
canonical mapping (`required`→`sh:minCount`; enum→merged `sh:in`; `oneOf`→`sh:xone`;
leaf-ref→`dct:source`; UI→DASH). I designed SHACL so a shapes graph is an *activatable,
checkable view over a fixed class model*. That discipline — **shapes constrain, they do not
declare** — is the lens I bring to every question below.

What follows is grounded in records I read in full this session: ODR-0010, ODR-0021,
ODR-0022, ADR-0029, `tools/opda-gen/src/opda_gen/emitters/profiles.py`,
`tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py`, the G3 CI gate
`tools/opda-gen/src/opda_gen/ci/descriptive_roundtrip_test.py`, and
`tools/opda-gen/src/opda_gen/inputs/category_g_curation.py` — plus direct inspection of the
overlay JSON corpus.

---

## Verified state (what I checked, not what I was told)

1. **gap-2 is genuinely done and output-neutral.** Commit `8753784` routes baspi5 through
   the generic `_build_profile` via a `shape_builder` callback; `_build_baspi5_shapes` carries
   the ~470 lines of shapes; `baspi5.ttl` is byte-identical; the `if overlay == "baspi5"`
   special case is gone. This is exactly the TopBraid discipline ADR-0029 §Decision-Driver 1
   demanded: per-form variation as *input data*, constraint logic tested once. I confirm it.

2. **30 of 31 profiles are THIN** (header + one `dct:subject` only). Confirmed by reading
   `_thin_specs()` and `_thin_description()` in `profiles.py`: every non-baspi5 spec ships
   `shape_builder=None` and a `dct_source` pinned to ADR-0029 (the prov citation, *not* a
   form-question IRI). So today only baspi5 enumerates leaves.

3. **The descriptive TBox is substantially complete — ADR-0029's original excuse is spent.**
   Counted from the emitted corpus: `opda-property.ttl` carries 254 datatype/object
   predicates, `opda-monetary.ttl` 16 (the monetary walk *executed* — `opda:MonetaryAmount`
   + the money properties are real), plus agent/evidence/provenance modules. ADR-0029 gap (1)
   was justified by "their leaves have no `opda:` property paths to constrain until ADR-0028's
   walk lands." That walk has largely landed. **The terms exist.** The thin profiles are now
   thin by *omission*, not by *necessity*. This is the fact that decisively reframes Q1.

4. **`leaf_resolver.py` is written but NOT WIRED.** `grep` across `src` and `tests` returns
   **zero importers** of `leaf_resolver`. The corpus-driven resolver, the `walk_form` walker,
   the `EmittedPredicate`/`bind` machinery — all present, none called by any emitter or test.
   This is precisely why Q3 is a live question and not a fait accompli: the mechanism is a
   *proposal awaiting ratification*, exactly as it should be after the session-031 mistake.

5. **The G3 gate already encodes my session-023 co-signed discipline.**
   `descriptive_roundtrip_test.py` computes: *every form-question leaf is the `dct:source` of
   exactly one property-shape `sh:path` — none unaddressable, none doubly-bound.* It currently
   **reports** gaps (`gaps`) rather than hard-failing (`violations`), tolerating the thin state.
   The honesty machine I need for Q4 is **already built** — it is being run in soft mode.

6. **The authority-recognition is BASPI5-only — a real defect for rollout.** The gate's
   `FORMS_AUTHORITY_PREFIX = "https://www.basp.uk/forms/"` and `_is_form_leaf()` recognise
   *only* that namespace. But I confirmed every non-baspi5 overlay carries
   `$id = https://trust.propdata.org.uk/schemas/v3/overlays/<form>.json`. So the moment a real
   form-question `dct:source` is emitted under the trust.propdata authority, `_is_form_leaf`
   returns False and the gate **does not even see it**. This blocks Q4 and conditions Q2.

7. **The walker's ref-key heuristic is wrong for all 16 extension overlays.**
   `walk_form` builds `ref_key = f"{form_id}Ref"`. I grep-confirmed the corpus directly: the
   14 active main forms each use `{form_id}Ref` exactly (ta6→`ta6Ref` ×365, con29R→`con29RRef`
   ×123, con29DW→`con29DWRef`, nts2→`nts2Ref`, ntsl2→`ntsl2Ref`, sr24→`sr24Ref`), so the naive
   heuristic is **correct for every main form**. But all **16 NTS2 extension fragments** carry
   **`ntsRef`** — NOT `asRef`/`jkRef`/`sfRef` etc. (verified: as, jk, sf, fd, la all use
   `ntsRef`; they share the NTS 2023 base ref-key). So the walker, asked to walk extension `as`,
   would build `ref_key = "asRef"`, find none, and emit **zero** ref-bearing leaves — *false*
   thinness on 16 of 31 profiles, indistinguishable from a genuinely ref-less form. This is a
   bind-only-what-exists correctness bug (Q3) AND a coverage-honesty hole (Q4): a form that
   emits zero leaves because of a key-name miss must NOT masquerade as "no bindable leaves."
   The fix is a per-form ref-key override: extensions map to `ntsRef`, mains default to
   `f"{form_id}Ref"`.

8. **oc1/llc1 are genuinely ref-less AND non-BASPI5-authority.** Confirmed: `oc1Ref` count = 0,
   `llc1Ref` count = 0; both `$id` under trust.propdata. These are HMLR/local-authority
   *register-retrieved* artefacts (ODR-0008d-flavoured), not human-filled forms. The walker
   correctly skips them today (zero ref-bearing leaves). Q2 asks whether a JSON-schema leaf-path
   is a valid anchor that would make them enumerable anyway.

---

## Q1 (KEYSTONE) — Enumeration discipline → **AFFIRM (eager), with a stated reconciliation**

**Proposition:** "Complete B1 by EAGER full enumeration of every in-scope overlay's bindable
leaves now" (ADR-0029 one-go). I vote **AFFIRM**.

This is the question on which my ownership of ODR-0010 most directly bears, and I want to be
precise about *why* eager is right here and how it reconciles with my own YAGNI standing rule
in ODR-0021 — because superficially they collide, and Davis (the demand-pulled objection the
brief asks me to engage head-on) will press exactly that collision.

**The reconciliation — these two records govern different objects.** ODR-0021's standing rule
is: *"each addition must earn its keep against a real consumer, not a tidy-architecture
argument"* — and it governs **wrappers around the form** (PROF typing, conneg, DCTAP-as-artefact,
reified profile nodes, F1–F10). Read ODR-0021 §Decision precisely: *"a form is its SHACL overlay
graph (ODR-0010) and nothing wraps it."* The YAGNI fence is around things layered **on top of**
the SHACL. **Enumerating the form's own leaves into SHACL is not a wrapper — it IS the SHACL.**
A profile that names its form's bindable leaves with `sh:path`/`sh:minCount`/`dct:source` is not
an *addition* to the form; under ODR-0010 it is *the form's own substance*. The thin profile is
not the minimal form — it is an **incomplete** form. ODR-0021 §F4 is the tell: it defers a
*stored `opda:requires` digest* precisely because *"derivable from the shapes
(`sh:minCount`/`sh:path`)."* That deferral **presupposes the shapes carry the leaves.** You
cannot defer-as-derivable a digest of an enumeration that was itself never performed. So ODR-0021,
read correctly, does not just permit enumeration — it *assumes* it.

**Why eager rather than demand-pulled (Davis's watching-brief).** I concede Davis's instinct has
teeth in general: don't build for absent consumers. But three things defeat it *here*:

- **The consumer is named and ratified.** ODR-0022 §Consequences: *"The ADR-0029 overlay
  profiles MUST enumerate each form's leaves in their `sh:path`/`sh:minCount`/`dct:source`
  shapes ... this is what carries round-trip under G3."* Gate G3 — the BASPI5 round-trip and
  the worked SPARQL retrieval — is the consumer. It is not speculative; it is an *acceptance
  gate already in the codebase*. Demand has already been pulled; what's missing is supply.

- **The cost asymmetry runs the other way for SHACL.** Davis's watching-brief economics assume
  each increment is cheap to add later and the artefact is inert until consumed. But a *partial*
  shapes graph is not inert — it is **actively misleading**. A consumer that loads ta6.ttl and
  finds one `dct:subject` triple will reasonably conclude "ta6 constrains nothing," which is
  false. An empty shape validates nothing (ODR-0010 §Graph-separation: *"a shape with no target
  validates nothing"*) — so a thin profile is a *silent no-op masquerading as a form*. That is
  worse than absent. The eager completion removes a standing footgun.

- **Governance already ruled, and ADR-0029 explicitly rejected Option C.** ADR-0029
  §Considered-Options records *"Option C — emit profiles incrementally / demand-pulled (Davis's
  watching-brief). Rejected by the S021 governance directive (one-go, full coverage)."* The
  directing programme authority ruled one-go. The session-031 precedent the brief cites is the
  warning: a unilateral mid-implementation reframing got reverted. S034 must *ratify*, not
  re-improvise. Reopening Option C would be exactly the unilateral reframing the Council exists
  to prevent — unless a *new* fact has emerged. None has; the opposite has (the terms now exist,
  strengthening eager).

**Governing discipline I propose the Council adopt (the synthesis of ADR-0029 ↔ ODR-0021/0022):**

> *Enumerate eagerly because the leaf→shape binding IS the form, not a wrapper, and a named
> ratified consumer (G3 round-trip) already requires it. But enumeration is bounded by
> bindability and policed by honesty: bind every leaf that resolves to a real emitted term with
> real provenance (Q3), GAP the rest, and emit the GAPs (Q4). "Eager" governs effort; "bindable"
> governs scope; "honest" governs the definition of done. YAGNI (ODR-0021) continues to forbid
> wrappers ON the form — it never forbade completing the form.*

This is AFFIRM, not REVISE: I am not proposing a middle position on *whether* to enumerate
eagerly (I say yes, fully, now). The bindability bound and the gap register are not hedges on
Q1 — they are the *content* of Q3 and Q4, which is why each stands as its own question. Q1's
answer is unconditionally eager.

---

## Q2 — Ref-less forms (oc1, llc1) → **REVISE**

**Proposition:** "A JSON-schema leaf-path (`<schema $id>#/path/to/field`) is a valid ODR-0022 §2
G2 `dct:source` anchor → oc1/llc1 are enumerable." AFFIRM = leaf-path valid; REJECT = G2 needs a
real form-question ref; REVISE = a middle. I vote **REVISE**.

I cannot vote AFFIRM as stated, and I cannot vote REJECT either — both get the SHACL principle
half-right. Here is the principle, from my own design intent restated in ODR-0010 §Enforcement:
*"Profile and form-question URIs MUST dereference."* A `dct:source` is a **traceability claim to
something a consumer can resolve.** The test for a valid G2 anchor is therefore not "is it a
human form question?" — it is **"is it a stable, dereferenceable identifier of the thing this
shape constrains the answer to?"**

**Why not REJECT.** REJECT says G2 requires a *human form-question ref*, so oc1/llc1 stay thin
forever. But oc1 and llc1 are not under-specified — they are HMLR Official-Copy and
Local-Land-Charges *register* data. Their leaves are perfectly real, dereferenceable schema
positions; they simply were never authored with a human `*Ref` because no human fills them in.
To leave them permanently thin on the grounds that "there's no form question" would enshrine the
exact footgun I named in Q1: two silent no-op graphs that *look* like forms. ODR-0008d already
recognises authority-retrieved artefacts as first-class. Refusing them a profile would be
inconsistent with that. So the *register-retrieved* nature is not a reason to exclude them — it
is a reason their anchor is an authority/schema identifier rather than a form-question one.

**Why not AFFIRM as worded.** The proposition's anchor form is `<schema $id>#/path/to/field` —
i.e. a JSON Pointer fragment hung off the overlay's `$id`
(`https://trust.propdata.org.uk/schemas/v3/overlays/oc1.json#/properties/...`). That is
*structurally* a fine dereferenceable identifier — I have no SHACL objection to a JSON-Pointer
anchor in principle. **But it would walk straight into the defect I found in finding (6):** the
G3 gate's `_is_form_leaf()` recognises *only* `https://www.basp.uk/forms/`. A
`trust.propdata.org.uk/...` anchor is invisible to the gate — it would neither count as coverage
nor be flagged as a gap. So AFFIRM-as-worded would emit anchors the honesty machine cannot see,
producing *false thinness*. That is precisely the silent-partial failure Q4 exists to kill.
AFFIRM without fixing authority-recognition is unsafe.

**My REVISE — the middle that satisfies the SHACL principle and the gate:**

> *A JSON-schema leaf-path IS a valid G2 `dct:source` anchor — provenance traces to a
> dereferenceable identifier, which a schema `$id`+JSON-Pointer is — SO oc1/llc1 ARE enumerable,
> NOT permanently thin. BUT this is ratified only jointly with two conditions: (i) the anchor is
> minted against the form's own published authority (its `$id` base), not faked under the BASPI5
> `basp.uk` namespace; and (ii) the G3 gate's authority-recognition is generalised — replace the
> single `basp.uk/forms/` prefix with the set of per-form authorities (the baspi5 `basp.uk` base
> PLUS the `trust.propdata.org.uk/.../overlays/` base) — so a JSON-Pointer anchor counts as
> coverage and a missing one is flagged as a gap. A G2 anchor the gate cannot see is not
> traceability; it is invisible provenance.*

In short: oc1/llc1 are enumerable, by JSON-Pointer anchor, but only once the gate can *recognise*
that anchor. The mechanism and the honesty-check must land together — which is the same coupling
that makes Q2 and Q4 reinforce each other (see SCOPE-CHECK).

---

## Q3 — Enumerator mechanism (the corpus-driven resolver) → **AFFIRM, with a named correction**

**Proposition:** "Ratify the corpus-driven bind-only-what-exists resolver: bind a leaf IFF (a)
its resolved local-name (last-segment name-match + the ODR-0024 COLLAPSED register + settled
category routing) is an emitted `opda:` datatype/object property AND (b) that predicate has
exactly ONE `rdfs:domain` (→ `sh:targetClass`); else GAP it — NEVER fabricate a predicate or
guess a domain; one ref → one `sh:path`." I vote **AFFIRM**.

This is the most important vote I cast, because it is the embodiment of the principle I built
SHACL around. The thing I warned against in ODR-0010 §Context was *"misusing SHACL so a profile
validates the wrong thing."* A shape with a **fabricated `sh:path`** constrains a predicate that
does not exist — it is a no-op at best and a lie about the model at worst. A shape with a
**guessed `rdfs:domain`/`sh:targetClass`** points the constraint at the wrong class — it validates
the wrong nodes. Both are the canonical SHACL misuse. The resolver's binding rule —
**bind IFF the predicate is emitted AND has exactly one domain, else GAP** — is the *correct*
discipline mechanised. I read `leaf_resolver.py:bind()` line by line:

```python
def bind(leaf_name, predicates):
    target = resolve(leaf_name)          # COLLAPSED register, else identity
    pred = predicates.get(target)
    if pred is None:        return None  # not emitted -> GAP (no fabrication)
    if pred.domain_iri is None: return None  # no single domain -> GAP (no guess)
    return pred
```

And `emitted_predicates()` correctly sets `domain_iri = None` when there are zero OR multiple
`rdfs:domain` values (`len(domains) == 1` else None). So a property with an ambiguous domain is
*refused a `sh:targetClass`*, not arbitrarily assigned one. This is exactly right. A shape must
know unambiguously what it targets; an ambiguous-domain predicate cannot yield a sound
`sh:targetClass`, so GAPping it is the only safe move. **This is bind-only-what-exists done as a
SHACL author would do it.** I affirm the rule without reservation.

The `resolve()` layering is also sound: it consults the `COLLAPSED` register
(`category_g_curation.py`) first, so `uprn`→`hasUPRN`, `address`→`hasAddress`, the five
`schoolType` bands, the Category-A prose tails→`disclosureDetail` all route to their *real*
shared predicate rather than minting or fabricating. That register is the SCOPE-FENCED settled
mapping; the resolver consuming it (not re-deciding it) is correct.

**My named correction (why AFFIRM-with-correction, not bare AFFIRM — but still AFFIRM, because
this is a wiring fix, not a rule change).** The *binding rule* is correct and I ratify it as-is.
But the *walker that feeds it* has a concrete defect I verified against the corpus, and the
Council should ratify the rule **with this correction noted as a blocking implementation
condition**, so it does not ship broken:

- `walk_form()` builds `ref_key = f"{form_id}Ref"`. I grep-confirmed this is **correct for all
  14 active main forms** (ta6→`ta6Ref` ×365, con29R→`con29RRef` ×123, con29DW→`con29DWRef`,
  nts2→`nts2Ref`, ntsl2→`ntsl2Ref`, sr24→`sr24Ref`). But it is **wrong for all 16 NTS2 extension
  fragments**: each carries **`ntsRef`** (the shared NTS 2023 base key), not `asRef`/`jkRef`/
  `sfRef` (verified on as, jk, sf, fd, la). Under the naive heuristic the walker would build
  `asRef`, find none, and walk every extension to **zero ref-bearing leaves** — *false* thinness
  on 16 of 31 profiles, identical in appearance to a genuinely ref-less form. The fix is a small
  per-form ref-key override map (`REF_KEY = { ext: "ntsRef" for ext in _EXTENSION_OVERLAYS }`),
  defaulting to `f"{form_id}Ref"` for the mains.

This does not weaken the binding rule — it ensures the rule is *fed the right leaves*. The
"never fabricate / never guess / one ref → one `sh:path`" core is exactly what I want enforced;
the correction just stops the walker from silently starving the 16 extensions. Crucially, this
defect is *also* an argument FOR Q4: without the gap register, a key-name miss is invisible. With
it, an extension emitting zero leaves would scream in the gap register and be caught.

One scope note for the synthesis: `bind()` returns at most one predicate per resolved name, and
the proposition's "one ref → one `sh:path`" holds per shape — but a single coarse `*Ref` can
legitimately cover >1 distinct schema leaf on distinct entities (the gate already sanctions this
for baspi5's `A1.1.5` via `_SCHEMA_SANCTIONED_SHARED_REFS`). The resolver must preserve that:
"one ref → one `sh:path`" means *per property shape*, not *globally per ref*. The existing gate
machinery handles it; the rollout must not regress it.

---

## Q4 — Coverage honesty → **AFFIRM**

**Proposition:** "Amend ADR-0029's 'full coverage' to 'full coverage of BINDABLE leaves + an
honest, emitted per-form gap register' so 'done' is well-defined, not silently partial." I vote
**AFFIRM**.

This is the vote I feel most strongly about as the owner of the round-trip gate, and it is nearly
forced by the facts I found. "Full coverage" as written in ADR-0029 is *not machine-checkable* —
and an acceptance criterion that cannot be checked is not an acceptance criterion. My governing
instinct, restated from the G3 gate I co-signed at session-023: **the test is the definition of
done.** ODR-0022 §G3 says "coverage preserved" is ratified *only* by a passing round-trip, not by
assertion — *"Test, don't assert."* That principle applied to ADR-0029 yields Q4 directly: "done"
must be the state in which **every bindable leaf is bound (G3 `violations` empty) and every
unbindable leaf is recorded as a GAP (so `violations`-empty is honest, not vacuous).**

The honesty register is not new machinery to invent — it **already exists**. The G3 gate's
`CoverageReport` already computes `addressable`, `unaddressable`, `doubly_bound`, and
`untraceable_shapes`, and already distinguishes `gaps` (soft) from `violations` (hard). What Q4
ratifies is: **(i)** flip the relationship so a *bindable* leaf left unbound is a `violation`
(hard fail), while a *legitimately-unbindable* leaf (no emitted term — a real TBox gap, e.g. the
deferred residue) is an *emitted, recorded GAP* — present in the artefact, not silent; and
**(ii)** the gap register is per-form and *emitted* (e.g. an `rdfs:comment` / `dct:description`
enumerating the form's unbound leaves with reasons), so a consumer reading ta6.ttl can see "these
N leaves are bound; these M are GAPs because their predicates are not yet emitted" rather than
inferring nothing from silence.

**Why this is necessary, grounded in what I found:**

- **Sixteen extension forms can silently emit zero leaves (Q3 finding).** Without an emitted gap
  register, the extensions' `ntsRef` key-miss produces 16 thin files indistinguishable from
  "done." The register makes zero-leaf emission *loud*.
- **The authority-recognition defect (finding 6) makes silent partiality the default failure
  mode.** A `trust.propdata` anchor invisible to `_is_form_leaf` is neither coverage nor gap —
  it vanishes. Q4 plus the Q2 gate-generalisation closes this: every leaf is either addressable,
  or an emitted GAP; nothing vanishes.
- **It converts Davis's objection into an asset.** Davis's demand-pulled instinct (Q1) is right
  that we must not *pretend* coverage we don't have. Q4 is the mechanism that makes the eager
  rollout *honest*: we enumerate everything bindable now (Q1 eager), and we *declare* what we
  couldn't bind (Q4 gaps). The deferred monetary leaves' precedent in `category_g_curation.py`
  is the model — the docstring records *"the honest 167/188, not the prior false 185/188."*
  That same honest-denominator discipline is exactly what Q4 brings to the profile layer.

I would have the amendment word "done" as: **"full coverage of bindable leaves (G3 `violations`
empty under generalised authority-recognition) + an emitted per-form gap register naming every
unbound leaf and its reason."** That is well-defined, machine-checkable, and indifferent to the
silent-partial trap.

---

## Scope-check (byzantine-escalation trigger or agent-fan-out?)

**Does Q1's outcome genuinely CONDITION Q2–Q4?** No — each stands alone under either Q1 outcome,
so this stays agent-fan-out, not a byzantine escalation. Reasoning:

- **Q3 (the bind-only-what-exists rule) is correct regardless of Q1.** Whether you enumerate
  eagerly (AFFIRM) or demand-pulled (REJECT), *when* you bind a leaf you must bind only real
  terms and never fabricate/guess. Q3 governs *how* a bind is done, not *when*. It is invariant
  under Q1.

- **Q4 (coverage honesty) is, if anything, MORE needed under Q1=REJECT, not less.** A
  demand-pulled rollout is *inherently* partial-by-design, so "what's done vs deferred" needs an
  honest register even more urgently. Under Q1=AFFIRM it makes "done" checkable; under
  Q1=REJECT it makes "deferred" honest. Q4 stands under both.

- **Q2 (ref-less forms) turns on a SHACL traceability principle + a gate-recognition defect,
  neither of which depends on Q1.** Whether oc1/llc1 are enumerable at all is a question about
  what counts as a valid `dct:source` anchor — true or false independent of eager-vs-pulled.

The real coupling in this session is **Q2 ↔ Q4**, not Q1 ↔ anything: both require generalising
the G3 gate's authority-recognition beyond `basp.uk` (Q2 so JSON-Pointer anchors are *seen*; Q4
so non-baspi5 coverage/gaps are *counted*). That shared dependency is a clean implementation
sequencing note, not a consensus-escalation trigger. Agent-fan-out is the right mode.

---

## Summary of votes

| Q | Vote | One-line |
|---|---|---|
| Q1 | **AFFIRM** | Enumerate eagerly — the leaf→shape binding IS the form, not a wrapper; ODR-0021 YAGNI fences wrappers, never completion; G3 is the named consumer. |
| Q2 | **REVISE** | JSON-Pointer leaf-path is a valid anchor (provenance = dereferenceable id), so oc1/llc1 ARE enumerable — but only jointly with generalising the gate's authority-recognition off `basp.uk`. |
| Q3 | **AFFIRM** | The bind-IFF-emitted-AND-single-domain-else-GAP rule is bind-only-what-exists done correctly; ratify it — with the 16-extension `ntsRef` ref-key override as a blocking wiring fix. |
| Q4 | **AFFIRM** | "Done" = full coverage of bindable leaves (G3 `violations` empty) + an emitted per-form gap register; the test is the definition of done; the `CoverageReport` machinery already exists. |
