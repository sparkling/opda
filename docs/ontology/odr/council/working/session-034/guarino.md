# Session 034 — Position of Nicola Guarino (DOLCE / OntoClean; truth-maker + identity-criterion rigour)

> Lens: a profile shape's `dct:source` is a **truth-maker claim** — "this constraint holds *relative to* this named, dereferenceable source." My S010 withdrawal condition (ODR-0010 §Rules, "`opda:ValidationContext` reification"; my own S001/S010 Q5 working position) accepted the overlay mechanism **only on condition** that a profile constraint be "a constraint *of a named context* … relative to a named, dereferenceable context" — it must have a truth-maker. Q2 is mine: is a JSON-schema leaf-path a legitimate truth-maker / `dct:source` anchor, and does eager enumeration produce shapes whose provenance is sound rather than hollow?

---

## Grounding actually read (this session)

- **ODR-0010** §Decision + §Rules in full — Knublauch's 5-rule mapping (Rule 4: per-leaf `baspi5Ref`/`ntsRef` → `dct:source` → a *minted, dereferenceable form-question IRI*, e.g. `<https://opda.uk/forms/baspi5#B1.3.2>`, "forming a shape → question → form chain"); my own **`opda:ValidationContext` reification** as the recorded withdrawal condition.
- **session-010 record** — confirms it verbatim: my S001 Q5 "no fixed model theory" carry was discharged by reifying `opda:ValidationContext` (Q1 10-0; my Q5 withdrawal trigger was "reify a first-class `ValidationContext`; no free-floating conditional axioms"). The 5-property reification carries `dct:source` to the form-document; Q3 ratified the form-question IRI mint `…/forms/<form>?v=<version>#<question-id>`.
- **My S001 DA working file (guarino-da.md)** — Q5 in my own words: "is the proposition 'every Property has ≥1 UPRN' *true*, or true-relative-to-a-profile? … an axiom about *a validation context*." That is the exact instrument I bring to Q2.
- **ODR-0022** §Rules.2 — Gate **G2**: every collapsed-category instance and every G property MUST carry `dct:source` to its **schema leaf path** (the form-question IRI, ODR-0008 §Q3a per-overlay array) — **NOT** to the deciding ODR. Anti-pattern §6: "Do NOT point `dct:source` at the deciding ODR."
- **ODR-0008d** — `opda:Search`/`opda:RiskAssessment` etc. are **Information Objects** on the PROV-O backbone; identity = ⟨generating activity, source peril/dataset, subject property, generation time⟩; each `prov:wasGeneratedBy` an authority's activity; a re-run is a *new* result. These are **reports retrieved from a register**, not form answers.
- **ADR-0029** — the one-go directive (Option A; Option C demand-pulled rejected); S023 amendment requires per-leaf enumeration to carry G3 round-trip, each shape's `dct:source` → schema-leaf-path (G2).
- **ODR-0021** — YAGNI counter-discipline: "a form is its SHACL overlay graph and nothing wraps it"; a standards-grounded "this is idiomatic" is **not** a trigger. **F6** records explicitly: "Guarino's S010 truth-maker is satisfied by the **named graph itself**."

**Emitted artefacts inspected directly (this session) — they decide Q2:**

- **`baspi5.ttl` (831 lines)** — *every* shape carries `dct:source <https://www.basp.uk/forms/baspi5#<questionRef>>`: `#A1.1.1` (address line 1), `#B1.3.2` ("Personal Representative / Power of Attorney … requires sellersCapacityDetails + attachments"), `#A1.8.3.1` (EPC rating), etc. And `opda:Baspi5ValidationContext … opda:sourcedFrom <https://www.basp.uk/forms/baspi5> ; opda:formVersion "5.0.3"`. This **is** the shape → question → form chain: each constraint's truth-maker is a *form question a human is asked and answers*. A genuine interrogative-act truth-maker.
- **`oc1.ttl` and `llc1.ttl` (23 lines each, THIN)** — header + community tag only, **no shapes**. Their *only* `dct:source` is `<…/adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout>` — i.e. **pointed at the deciding ADR**, the precise anti-pattern ODR-0022 §6/G2 forbids ("Do NOT point `dct:source` at the deciding ODR"). They carry `dct:subject opda:PropertyDataServicesContext` — the *authority/data-services* community, **not** `opda:EstateAgencyContext` (baspi5's). Zero form-question refs is confirmed in the artefact, and the descriptions self-describe them as "OC1 Official Copy of Register and Title Plan" / "LLC1 Local Land Charges Search" — **retrieved records, not questionnaires.**

So the verified facts are not merely asserted in the brief — they are visible in the emitted Turtle, and they map exactly onto my two-axis test below: baspi5's anchor is a *form question*; oc1/llc1 today have only the *hollow deciding-ADR anchor* I forbade, and their correct non-hollow anchor is the **schema leaf-path of a retrieved register record**, not a form question (because there is none).

---

## The truth-maker test, stated precisely

A `sh:minCount 1` / `sh:in` constraint is, on my S010 reading, **not** a free-floating axiom. Reified through `opda:ValidationContext`, it asserts: *"under context C, property p is required of node n."* The `dct:source` on that shape is the **truth-maker anchor** — the entity in virtue of which the constraint is true. For "required relative to a named context" to be non-vacuous, the anchor must dereference to a real, stable entity whose existence *grounds* the requirement.

Two distinct questions hide inside Q2, and conflating them is the category error I exist to prevent:

1. **Is `<$id>#/path` a sound *structural* truth-maker?** — does it dereference to a real, stable schema node?
2. **Is that schema node a *form question* — a speech-act someone performs?** — or is it merely a *location* in a transport document?

My answer differs across the two, and that fork is my whole contribution.

### On (1): a JSON-schema leaf-path IS a sound structural anchor — G2 is satisfied

ODR-0022 G2 names the truth-maker **for me**: `dct:source` MUST point at "its schema leaf path (the form-question IRI, ODR-0008 §Q3a per-overlay array)." The leaf-path `<$id>#/path` dereferences — the overlay schema is a real, versioned, addressable artefact (a nested upstream repo: read-only, but *present and stable*). It is **exactly the entity G2 designates**, and it is the **opposite** of the hollow anchor I spent S010/S001-Q5 forbidding: the failure mode I attacked was the free-floating axiom and (its emitted form, per G2) `dct:source → the deciding ODR` — a constraint whose "truth" is "because we decided so," circular and self-grounding. **This is not hypothetical: the emitted `oc1.ttl`/`llc1.ttl` today carry exactly that hollow anchor — their only `dct:source` is `…/adr/ADR-0029…`.** A schema-leaf-path is *external* to the decision; it is the upstream artefact the constraint is *about*. So on the structural axis: **AFFIRM** — the leaf-path is a legitimate `dct:source` anchor, and adopting it would *replace* the current deciding-ADR hollow anchor with a sound one. A shape sourced to `<oc1.json>#/…/titleNumber` has a real truth-maker: it is true *relative to* a node that demonstrably exists in a dereferenceable document.

This is decisive and *narrowly* decisive. It does **not** carry the second claim.

### On (2): oc1/llc1 are NOT "forms" — they are authority-retrieved register extracts; calling their enumeration a "form overlay" is a category error

Here OntoClean cuts the other way, and the brief is right to flag it. ODR-0010 Rule 4's truth-maker is a **form-question IRI** — `…/forms/baspi5#B1.3.2`. B1.3.2 is a *genuine speech-act*: the BASPI form **asks** it; a human **answers** it; the chain is shape → *question* → form. "`sellersCapacityDetails` required when capacity = Attorney" is true *because the form poses that demand* — a truth-maker of the right **kind**: an interrogative act with an asker and an answerer.

oc1 (Official Copy, HMLR register) and llc1 (Local Land Charges) are **not** that. Per ODR-0008d, authority-retrieved artefacts are **Information Objects** that `prov:wasGeneratedBy` an authority's activity — *reports retrieved from a register*, not questionnaires filled by a party. Their leaves are **fields of a returned record**, not **questions posed to a respondent**. The brief confirms what the artefact class already implies: oc1/llc1 carry **zero** form-question refs (oc1 0, llc1 0) — and that is **not an omission to patch, it is ontologically correct**: a register extract has no form-question because **no one asks a form question to produce it**. HMLR's activity generates it; you retrieve it.

So "is a leaf-path a valid *form-question* truth-maker for oc1/llc1?" is **mis-posed** — there is no form question. A leaf-path can be a sound *structural* anchor (axis 1) without being a *form-question* truth-maker (axis 2). To enumerate oc1/llc1 *as form overlays* with `dct:source → leaf-path` and treat the result as the same artefact class as baspi5's shape → question → form chain is to assert a truth-maker of the **wrong kind** — to dress a register-field as an interrogative speech-act. That is the hollow-provenance move one level up from the deciding-ODR error: not "no anchor," but **an anchor mislabelled as a question that was never asked.**

### The reconciliation: enumerate, but name what you are enumerating

Honour both axes by a **distinction of kind**, not a refusal:

- A baspi5 / ta6 / piq / TA-family profile is a **form overlay**: its shapes' truth-maker is a *form question* (a speech-act). `dct:source → …/forms/<form>#<questionRef>` where a question ref exists.
- An oc1/llc1 profile, **if** enumerated, is an **authority-artefact validation profile** (ODR-0008d-flavoured): its shapes constrain the *shape of a retrieved register record*; its truth-maker is the **schema leaf-path of that record** (G2's structural anchor) — *not* a form question, because there is none. Its `opda:ValidationContext` should be typed/annotated to say so: this context validates *retrieved-artefact conformance*, not *form completion*.

Both have sound truth-makers; they are **different** truth-makers (interrogative act vs. record-field), and the model must not pretend they are one. That is exactly the OntoClean discipline: do not let two things with different identity-grounds wear one label.

---

## Verdicts

### Q1 (KEYSTONE) — "Complete B1 by EAGER full enumeration now" → **REVISE**

Eager-vs-gated is Davis's and Knublauch's axis; mine is orthogonal — **truth-maker soundness**. On *my* axis the rule is: **enumerate every leaf whose shape will carry a sound truth-maker of a correctly-named kind; do not manufacture shapes with hollow or mislabelled provenance.** For the genuine form overlays (baspi5 + the TA/PIQ/FME/etc. family, which carry form-question refs or whose leaves are genuine form answers), eager enumeration is sound *and* discharges ODR-0022 G3 round-trip — I do not block it. For oc1/llc1, eager enumeration *as form overlays* is unsound; enumerate them only **re-typed** as authority-artefact validation profiles (Q2). So I cannot vote clean AFFIRM ("eager, full coverage, one kind of shape") nor REJECT (the form-overlay majority is sound and ADR-0029's one-go directive is legitimate where the truth-makers hold). **REVISE**: eager for the form-overlay set; oc1/llc1 enumerated under a *named distinct artefact-profile kind*; nothing minted with a truth-maker of the wrong kind. — cite: ODR-0010 §Rules (`ValidationContext`; Rule 4 form-question chain) + ODR-0022 G2.

### Q2 — "A JSON-schema leaf-path is a valid ODR-0022 §2 G2 `dct:source` anchor → oc1/llc1 enumerable" → **REVISE**

The leaf-path **IS** a valid G2 `dct:source` anchor — structurally sound, dereferenceable, exactly the entity ODR-0022 G2 designates; it is the *cure* for the deciding-ODR anti-pattern I forbade. **AFFIRM that half.** But it does **not** make oc1/llc1 *form* overlays: they are HMLR/LA authority-retrieved register extracts (ODR-0008d Information Objects, `prov:wasGeneratedBy` an authority — **zero** form-question refs is *correct*, not a gap). Enumerate them **only** as **authority-artefact validation profiles** whose truth-maker is the record leaf-path, with the `opda:ValidationContext` typed "validates retrieved-artefact conformance, not form completion." A leaf-path is a sound *schema* anchor; it is **not** a *form-question* truth-maker, and the two must not wear one label. — cite: ODR-0022 G2 + §6 anti-pattern; ODR-0008d Rule 1/3 (Information Object; provenance identity); ODR-0010 Rule 4 (form-*question* IRI).

### Q3 — "Ratify the corpus-driven bind-only-what-exists resolver (resolved local-name → emitted `opda:` predicate with one `rdfs:domain` → bind; else GAP; never fabricate/guess; one ref → one `sh:path`)" → **AFFIRM**

This is the rule my whole lens demands. Binding a leaf to a predicate whose `rdfs:domain` you *guessed* asserts a **false inherence** — it claims "this value is a Quality/Mode of *that* bearer" on no evidence: a textbook OntoClean violation (an identity/inherence assertion with no truth-maker). **GAP-not-guess** is the only honest disposition: an unresolved leaf has *no* sound truth-maker for a binding, so the correct act is to record the absence, not invent the inherence. "One ref → one `sh:path`" keeps each truth-maker singular and traceable (no many-to-one provenance smearing). The "one `rdfs:domain`" guard is exactly right — the corpus *attests* the bearer rather than the emitter *assuming* it; where two domains or none exist, the bearer is under-determined and binding would fabricate inherence. Strongest affirm of the four. — cite: ODR-0022 G2 (sourced, never invented) + ODR-0008d Rule 1(b) (identity grounded in attested provenance, not assumed values).

### Q4 — "Amend ADR-0029 'full coverage' → 'full coverage of BINDABLE leaves + honest emitted gap register'" → **AFFIRM**

"Full coverage" read literally forces shapes onto leaves with no sound truth-maker — the hollow-provenance minting I forbid. Re-scoping to **bindable** leaves + an **emitted gap register** is the truth-maker-faithful reading: "covered" comes to mean "covered with sound provenance," and every un-bindable leaf becomes a *recorded* gap, not a *fabricated* binding. This mirrors ODR-0022 §5's residue register ("collapsed MUST mean *recorded as collapsed*; never silently dropped") and ODR-0021's discipline that the form layer adds nothing it cannot ground. The gap register IS the honest truth-maker ledger: it names what has no anchor yet rather than pretending one exists. — cite: ODR-0022 §5 residue register + §6 anti-pattern; ODR-0021 standing rule.

---

## KEY ARGUMENT

A profile shape's `dct:source` is a truth-maker claim — the constraint is true *relative to* the entity it points at — and that was the entire price of my S010 acceptance (the reified `opda:ValidationContext`). On the **structural** axis a JSON-schema leaf-path is a *sound* anchor: it dereferences, it is external to the decision, and it is precisely the entity ODR-0022 G2 designates — it is the cure for, not an instance of, the deciding-ODR hollow-anchor I forbade. But on the **kind** axis, oc1/llc1 are authority-retrieved register extracts (ODR-0008d Information Objects, `prov:wasGeneratedBy` an authority), **not** human-filled forms; their zero form-question refs is ontologically *correct*, and enumerating them as "form overlays" with a leaf-path `dct:source` mislabels a record-field as an interrogative speech-act never performed. The honest course: enumerate where the truth-maker is sound, **re-type oc1/llc1 as authority-artefact validation profiles** (same leaf-path anchor, a *different and correctly-named* truth-maker kind), GAP-not-guess every unbindable leaf, and re-scope "full coverage" to "full coverage of bindable leaves + an emitted gap register."

## STRONGEST OPPOSING POINT YOU CONCEDE

ODR-0021 F6 already records that "Guarino's S010 truth-maker is satisfied by the **named graph itself**" — so one may fairly argue the named, dereferenceable profile graph (plus its `owl:Ontology` header and `dct:subject`) *already* supplies the truth-maker, and my form-question-vs-record-field distinction is a refinement the ratified baseline does not require as a gate. I concede the named graph discharges the *minimum* S010 condition; my Q2 distinction is therefore a soundness *refinement* (don't mislabel the artefact kind), not a veto on enumerating oc1/llc1 — which is why my Q1/Q2 are REVISE, not REJECT.
