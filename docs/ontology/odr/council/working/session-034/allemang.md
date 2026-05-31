# Session 034 — Position of Dean Allemang

*Queen of S023 (ODR-0022); author of gates G1 (path-aware binning) / G2 (schema-leaf-path `dct:source`) / G3 (coverage-by-test). My lens: do these gates I wrote ACCEPT eager enumeration, or do they need consumer-pull to be discharged?*

Grounded in: ODR-0022 §Rules.2 (G1/G2/G3) + §Consequences (B1 directive) + §Rules.5 (residue register); ADR-0029 (one-go directive; S023 amendment tying B1 to G2/G3) + ODR-0021 (the YAGNI deferred-options register); `tools/opda-gen/src/opda_gen/inputs/leaf_resolver.py` (the Q3 mechanism). Verified: oc1.json carries 0 `oc1Ref`, llc1.json 0 `llc1Ref`; 30 thin profiles (~1.8 KB header + one `dct:subject`) vs baspi5 enumerated (23.5 KB).

---

## The frame I am bound by: I wrote G1–G3 to convert a VETO into CRITERIA

At S021, the Devil's Advocate (Davis) raised *completeness-as-a-gate*: the descriptive collapse must not silently lose form-questions. I did not answer that with "trust us." I answered it with three **operational acceptance tests** (ODR-0022 §Rules.2): the collapse is ratified **only behind** G1+G2+G3, and "on G1+G2+G3 passing, the DA's S021 *completeness-as-a-gate* dissent is withdrawn in full." That sentence is the constitution of this session. So my Q1 vote is not ideological — it is the answer to one mechanical question: **does eager enumeration discharge G2 and G3 as I wrote them?** If yes, the gate I built *requires* me to accept it; refusing would be repudiating my own acceptance criteria.

It does. And ODR-0022 §Consequences already named this as the work: *"The ADR-0029 overlay profiles MUST enumerate each form's leaves in their `sh:path`/`sh:minCount`/`dct:source` shapes (they are currently emitted thin) — this is what carries round-trip under G3."* I wrote "MUST enumerate." That is not a deferred option awaiting a trigger; it is the standing requirement of the record I authored. B1 gap-1 is the discharge of a ratified MUST, not a new speculative commitment.

---

## Q1 (KEYSTONE) — AFFIRM (eager full enumeration of bindable leaves, now)

**The reconciliation ADR-0029 ↔ ODR-0021 turns on one distinction: enumeration is a PROJECTION, not a COMMITMENT.**

ODR-0021's YAGNI discipline (which I respect, and which Davis rightly guards) gates *new structure that does not yet earn its keep*: PROF wrappers (F1), conneg (F2), stored `opda:requires` digests (F4), reified profile nodes (F6). Every F-item in that register is **a thing that does not exist that someone proposes to mint**. Read the register's anti-pattern (ODR-0021 §Anti-pattern): "Do NOT re-propose F1–F10 without citing a fired trigger… a standards-grounded 'this is the idiomatic way' argument is **not** a trigger." That fence is aimed at *minting machinery*.

Enumeration mints no machinery. It runs the projection the gates were built to accept. The data dictionary already carries each form's leaves + refs; the emitted TBox already carries 254 `opda:` predicates (Category-G 239/239). Binding `ta6`'s 365 leaves to terms that **NOW EXIST** is the mechanical `DCTAP→SHACL` step ADR-0029's S022 amendment already ratified as idiomatic — exactly "model the data you have." There is no new ontological commitment in writing `sh:path opda:councilTaxBand ; dct:source <…ta6#…>` when `opda:councilTaxBand` is already an emitted term with one `rdfs:domain`. The shape is a *report* of a binding that already holds, not a new claim about the world.

So the two records do not actually conflict on the keystone: ODR-0021 forbids minting un-needed *wrappers*; ADR-0029 (and my ODR-0022 §Consequences) requires *projecting existing terms into shapes*. Different objects. The "one-go, full coverage" directive (ADR-0029 Option A, rejecting Davis's demand-pulled Option C) is the projection done once, deterministically, re-pinned once — which is *cheaper and less drift-prone* than a demand-pulled trickle that re-pins the byte-identity baseline N times. Eager-now is the YAGNI-respecting choice here, because the projection is mechanical and the alternative (consumer-gated) leaves G3 un-dischargeable for 30 of 31 forms indefinitely.

The honest scope bound (and the only reason this is AFFIRM-of-eager and not a blank cheque): **eager over BINDABLE leaves**. A leaf whose resolved name has no emitted term, or whose term has no single `rdfs:domain`, is a GAP — emitted to the §Rules.5 residue register, never fabricated into a shape. That is Q4. Eager enumeration + honest gap register = full coverage under G3 without a single speculative IRI.

---

## Q2 — AFFIRM (a JSON-schema leaf-path IS a valid G2 `dct:source` anchor; oc1/llc1 are enumerable)

**This is a question about what G2 already MEANS, and I wrote G2, so I can say.**

G2 (ODR-0022 §Rules.2): "Every collapsed-category instance and every G property MUST carry `dct:source` to its **schema leaf path** (the form-question IRI, ODR-0008 §Q3a per-overlay array) — **NOT** to the deciding ODR." The load-bearing word is **schema-leaf-path**. I wrote it as the schema path precisely *in opposition to* the deciding ODR — the whole point of G2 was to stop `dct:source` pointing at `…/odr/ODR-0008#section-Q5a` and make it point at where the leaf lives in the form schema. A `$id#/path` JSON pointer (or the `<form>Ref`-anchored leaf, where one exists) **is** that schema leaf path. G2 never said "a human form-question number"; it said the schema leaf path. The JSON `$id` + path satisfies the letter and the intent.

oc1 and llc1 carry **zero** form-question refs (verified: 0 `oc1Ref`, 0 `llc1Ref`) because they are HMLR / LA register *outputs*, not human-filled forms — there is no "question 4.2" to cite. But they have a schema with an `$id` and addressable leaf paths. The leaf_resolver walker (`_walk`, line 175) today **skips** any leaf lacking a `<form>Ref` string ("only ref-bearing leaves are enumerable (ODR-0022 G2)"). Read literally against forms-with-refs that is correct; but for a ref-less register schema it would make oc1/llc1 **un-enumerable**, which would silently zero-out their coverage — exactly the silent loss G2+§Rules.5 forbid. So I AFFIRM with a mechanism note: where a form has no `<form>Ref`, the `$id#<json-pointer>` IS the valid G2 anchor and the walker must enumerate on the JSON path. (The overlay schemas are a nested read-only upstream repo — VERIFIED, so we cannot retrofit refs upstream; the `$id#/path` anchor is not just *valid*, it is the *only* honest anchor available, and it is sufficient.)

Caveat I will not paper over: oc1/llc1 leaves bind only if their resolved names hit emitted predicates with a single domain. Many register-output leaves may GAP. That is fine — AFFIRM means *enumerable and anchorable*, not *guaranteed-bindable*. The gaps land in the §Rules.5 register (Q4).

---

## Q3 — AFFIRM (ratify the corpus-driven bind-only-what-exists resolver)

This resolver (`leaf_resolver.py`) is my §Rules.5 residue discipline and the reuse-before-mint principle (ODR-0022 Alternatives; Singapore Framework) **expressed in code**, and it is exactly right:

- **Reuse-before-mint**: `bind()` resolves a leaf via `COLLAPSED` then looks up an *already-emitted* predicate; it never creates one. (leaf_resolver.py:99–113.)
- **Bind IFF emitted AND single `rdfs:domain`** (lines 109–113): no term → `None` (GAP); `domain_iri is None` (absent OR — per `emitted_predicates` lines 65–66 — *multiple* domains collapsed to None) → `None` (GAP). This is precisely G1's discipline projected onto binding: a term with an ambiguous domain is NOT silently attached to a guessed class. Refusing a multi-domain bind is the code-level expression of "the mis-mint is permanent" (G1 rationale).
- **Never fabricate** (module docstring lines 9–13; "We never invent a predicate or guess a domain"): this IS §Rules.5 ("'Collapsed' MUST mean *recorded as collapsed*; a leaf is **never** silently dropped") — a leaf that cannot bind becomes a recorded GAP, not a minted IRI.
- **Pure + corpus-driven** (derives the legal `sh:path` universe from the emitted `opda-*.ttl`, no dependency on the gitignored data dictionary): this is the right architecture — the binder's universe is *what was actually emitted and ratified*, not an external wishlist. It cannot drift ahead of the TBox.
- **One ref → one `sh:path`**: each `FormLeaf` (lines 121–130) carries one path/ref/enum; the projection is 1:1 leaf→shape. No stacking, no invention.

One thing I want the record to nail (not a REVISE — an instruction to the emitter layer): the resolver correctly returns `None` for a GAP, but G3 + §Rules.5 require the GAP to be **emitted**, not merely *not-bound*. Ratifying the resolver is necessary; it is sufficient only if the emitter writes every `None` to the honest gap register (Q4). With that, AFFIRM in full — this is the cleanest expression of the gates I authored that I have seen in the build.

---

## Q4 — AFFIRM (amend ADR-0029 'full coverage' → 'full coverage of BINDABLE leaves + an honest emitted gap register')

**This amendment does not weaken ADR-0029; it makes its "full coverage" claim *true* and *gated* instead of *aspirational*.**

"Full coverage" read as "every leaf gets a constraining shape" is undischargeable and would *force fabrication* — it would demand a `sh:path` for a leaf with no emitted term, which is exactly the accidental-IRI minting ODR-0022 exists to prevent (Anti-patterns: "Do NOT mint one `owl:DatatypeProperty` per annotated leaf"). The honest meaning of "full coverage" under my gates was always *coverage of what can be soundly bound, with everything else recorded*. The honest emitted gap register **is** ODR-0022 §Rules.5, the residue register, and it is what makes G3's "coverage preserved" claim auditable: coverage = (bound shapes) ⊎ (recorded gaps), and that union is provably the whole leaf set. An un-amended "full coverage" makes G3 either a lie (gaps hidden) or a fabrication engine (gaps minted). The amendment is the only formulation consistent with the gate.

This also closes the loop with Davis's original dissent properly: completeness-as-a-gate is satisfied not by *binding everything* (impossible without fabrication) but by *accounting for everything* (bound or gapped). That is the discipline I promised at S023.

REVISE-not-AFFIRM was tempting only on wording — I would make the amendment cite ODR-0022 §Rules.5 explicitly so the "honest gap register" is not a new artefact but the named residue register. Treat that as a drafting rider on an AFFIRM, not a downgrade.

---

## KEY ARGUMENT

I wrote G1–G3 to convert Davis's completeness *veto* into acceptance *criteria*, and eager enumeration of bindable leaves is precisely what those criteria accept: it discharges G2 (each shape's `dct:source` → the schema leaf-path, including `$id#/path` for ref-less register forms like oc1/llc1) and G3 (round-trip + path-retrieval coverage), while minting nothing. ODR-0021's YAGNI fence guards *un-needed machinery* (PROF, digests, reified nodes) — different objects entirely; enumeration runs the projection of already-emitted terms, the "model the data you have" step ADR-0029's S022 amendment already ratified as idiomatic. The bind-only-what-exists resolver + an honest emitted gap register is §Rules.5 in code: coverage = bound shapes ⊎ recorded gaps, provably whole, with zero fabricated IRIs.

## STRONGEST OPPOSING POINT YOU CONCEDE

Davis is right that "full coverage of 31 forms, eagerly, now" *smells* like the over-build YAGNI exists to stop — and the resemblance is not nothing: a thin profile that no consumer validates against is, today, un-exercised weight, and 30 forms of enumerated shapes is a large surface that ODR-0021's discipline would normally make us justify against a named consumer. My answer is that the consumer is the gate itself (G3 round-trip is the ratification test ODR-0022 already mandates, not a speculative future need), but I concede the burden is on the eager side to prove every enumerated shape is *bound to an existing term* and not quietly fabricated — which is exactly why Q4 (the honest gap register) is load-bearing and not optional: without it, Davis's smell becomes a real defect.
