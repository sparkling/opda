# Session 023 — Baker + Isaac (vocabulary-governance + SKOS pair)

**Panel position.** Tom Baker (DCMI Metadata Terms; *Dublin Core Application Profiles* / Singapore Framework — Nilsson, Baker, Johnston 2008; DCMI dumb-down principle; DCMI Usage Board reuse-before-mint discipline) + Antoine Isaac / Alistair Miles (*SKOS Reference*, W3C Rec 2009 — §3 concept schemes, §4 mapping properties, §8 semantic relations, §9 documentation/notation). One joint position; `[Baker]` / `[Isaac]` where we differ. OPDA weights Baker heavily (adoption.md §Project Weighting).

**Headline.** Endorse category-based import as the disciplined vocabulary-governance outcome. 900 form-slot IRIs are an *ungovernable vocabulary*: a vocabulary is governed by what terms earn their keep, and ~88% of these earn nothing — they are repeated micro-structure, reused value-spaces, reference data, or already-modelled. The 54 enum value-sets and the ~89-item fixtures checklist are textbook `skos:ConceptScheme`s; minting 378 + 315 properties for them violates reuse-before-mint and misreads what SKOS Reference §3 is *for*. We are the vocabulary-hygiene voice, and on hygiene grounds the answer is unambiguous: collapse most, curate few.

One standing caution (Isaac): SKOS schemes are not a licence to discard provenance — every concept still needs `dct:source` per SKOS Reference §9 and ODR-0011 §Rules. Mappings and provenance are first-class, not an afterthought of collapse.

---

## Q1 — Diagnosis: conceptual richness, or form-ergonomics + repeated micro-structure?

**Position.** Form-ergonomics + repeated micro-structure. This is not "poor modelling" — it is correct-for-a-form-transport, wrong-altitude-for-a-TBox. The two are different artefacts governed by different disciplines.

The diagnostic that settles it is the **DCMI dumb-down principle** (DCMI Abstract Model; Baker, *Libraries and the Semantic Web* 2000-onward): a metadata term earns its place only if a naïve consumer who ignores its refinement still gets something coherent. Apply it to S023-EVIDENCE §B: 269 distinct `…details` leaves "dumb down" to *one* statement — "free-text elaboration of the preceding question." 99 `…price` leaves dumb down to one — "the £ figure for a checklist item." The refinement that distinguishes `boilerImmersionHeater.price` from `radiatorsWallHeaters.price` is carried by the **path**, i.e. by *which question*, not by a different *concept of price*. A TBox term per leaf asserts 269 concepts where the dumb-down test sees one — it manufactures conceptual richness that the data does not contain.

The corroborating empirical fact is the build pass (HANDOVER-2026-05-30-build-pass §"Naive naming collides catastrophically", cited "S023-EVIDENCE §D" via the same source): of 1,521 annotated base leaves only **250 have a unique final segment**; `yesNo` is referenced **1,135 times** and is "not 1,135 unique concepts" (audit.json, S023-EVIDENCE §B). A vocabulary in which 1,271 of 1,521 names are non-unique tails is, by the DCMI Usage Board's own test, **structure masquerading as terms**.

[Isaac] The SKOS-Reference lens reaches the same verdict from the value-space side: §3 distinguishes the *concept scheme* (the governed value-space) from the *property* that ranges over it. PDTF's enums repeat the value-space 54 times under 378 leaf names — the richness is in the value-spaces (which are real and governable), not in the 378 slots (which are one property reused).

**`builtForm`, `councilTaxBand`, `yearOfBuild` are the genuine article** — 181 distinct names (S023-EVIDENCE §C Category G). The diagnosis is *not* "nothing here is conceptual"; it is "12% is, 88% is transport ergonomics." That asymmetry is the whole finding.

**Vote:** FOR — *form-ergonomics + repeated micro-structure; correct-for-transport, wrong-altitude-for-TBox; ~12% genuine.*

---

## Q2 — The category taxonomy A–G as the decision-cut

**Position.** A–G is the right cut, *and it is the right kind of cut*: it routes each value-space to the realising record that governs that kind of thing, which is precisely the DCMI Application Profile discipline (Singapore Framework — Nilsson, Baker, Johnston 2008: a profile is *terms drawn from one or more namespaces, assembled and constrained for an application*, never a fresh mint per slot). The categories are the "draw from a namespace" decision made explicit.

Our refinements, per category, with the UFO/SKOS routing we own:

- **A (disclosure/free-text tails, ~407).** Correct. One reusable property (`opda:disclosureDetail`) + path-via-`dct:source`. These are below term-grade: by the dumb-down principle they are `rdfs:comment`-altitude prose, not concepts. **No SKOS scheme** — free text has no value-space to govern. [Baker] Resist any temptation to mint 407 annotation sub-properties; one suffices, refinement carried by `dct:source`.
- **B (evidence/attachment envelope).** Correct — reuse ODR-0009 Evidence + PROV-O. Reuse-before-mint; nothing to add.
- **C (status enums, 378 → 54 value-sets).** **54 `skos:ConceptScheme`s, one shared property per value-space.** This is the load-bearing category for us (Q5).
- **D (fixtures checklist, ~315 = ~89 items × 3).** The ~89 items are **one `skos:ConceptScheme` of fixture-item concepts** (reference data) + 3 shared properties (`inclusionStatus`, `comment`, `price`). See Q5.
- **E (search/risk result, ~200).** A `SearchResult`/`RiskAssessment` class (~6 props) + a **peril/dataset `skos:ConceptScheme`**. Reuse ODR-0009 provenance; the ~24 datasets are concepts in a scheme, not 24 copies of six properties.
- **F (identity/address/contact/geo, ~133).** **MUST reuse — never re-mint.** ODR-0015 already settled `opda:Address ⊑ vcard:Address` (Substance Kind, S015); `line1/postcode/country` are *vcard property shapes*, not new OPDA terms; contact reuses `vcard`; agents reuse ODR-0006 / W3C Org. Re-minting `opda:line1` where `vcard:streetAddress` exists is the textbook reuse-before-mint violation. Geo deferred (GeoSPARQL interface, ODR-0015 §5a).
- **G (genuine descriptive attributes, 181 distinct).** The only per-leaf WG category. Routes to ODR-0008's Q5a binding table (Quale-in-Region SKOS vs `xsd:string + sh:in` vs plain string — already adjudicated per-leaf there).

**One steward per scheme (ODR-0011 §1a / FIBO precedent).** Every C/D/E scheme MUST name a `dct:creator`/`dct:publisher` steward with deputy — this is the DCMI Usage Board governance pattern, and an unstewarded scheme is as ungovernable as 900 unstewarded properties. We are trading *900 ungoverned terms* for *~60 governed schemes*; the trade only holds if each scheme is stewarded.

**Vote:** FOR — *A–G is the right cut and the right kind of cut (Application-Profile draw-from-namespace); C/D/E → SKOS schemes; F reuse-only; G the curated residue.*

---

## Q3 — Whole or part? (the core decision)

**Position.** Import **by category**. Do **not** import all annotated leaves 1:1 as flat datatype properties.

This is, for us, the single clearest call in the session, and it is a *vocabulary-governance* call before it is an ontology call. Reuse-before-mint (DCMI Usage Board policy; restated in Heath & Bizer, *Linked Data: Evolving the Web* 2011 §2.5 as "reuse existing terms wherever possible") is not advisory decoration — it is the rule that keeps a published vocabulary maintainable. Minting 900 permanent `opda:` IRIs, ~840 of which (S023-EVIDENCE §B: 56% are 16 generic tails) restate the same ~16 slots, produces a vocabulary whose maintenance cost is unbounded and whose terms cannot be reasoned about as a set.

The decisive, non-reversible fact is from the build pass (S023-EVIDENCE §D): **the IRIs are permanent** (~900 published, stable identifiers; "an auto-derived scheme can't be cleanly reversed"), **no leaf→term map exists** (the existing ~23 were hand-curated), and **naïve naming collapses 1,521 → ~351 colliding IRIs**. So the "mechanical 935-leaf walk" is a false choice: it is *neither* mechanical (no map) *nor* clean (it collides 1,521 distinct attributes into ~351 names, silently merging `boilerImmersionHeater.price` with `radiatorsWallHeaters.price`). A walk that requires hand-disambiguation of ~900 permanent IRIs is exactly as expensive as curation — but produces an *ungovernable* result instead of a governed one. There is no efficiency argument left for the 1:1 walk; there is only the governance argument against it.

[Isaac] And the parts that *are* mechanical-and-clean are the SKOS schemes: the 54 value-sets and the 89-item checklist generate deterministically from the data dictionary (one `skos:ConceptScheme` per distinct value-set; `skos:Concept` per member with `dct:source`), because SKOS Reference §3 gives them a target structure that the flat-property walk lacks. The category route is *more* mechanizable than the 1:1 walk, not less.

**Vote:** FOR — *import by category; the 1:1 walk is neither mechanical nor reversible — it mints an ungovernable 900-term vocabulary.*

---

## Q4 — Recurring micro-patterns (A, B, E)

**Position.** Reusable property/class patterns, not per-leaf datatype properties.

- **A — disclosure tail.** One `opda:disclosureDetail` annotation property. Justification is the dumb-down principle: 269 `details` leaves carry one statement-type. Per-leaf properties here would be 269 terms each asserting "this is free text" — pure noise in the vocabulary. [Baker] If a downstream consumer ever needs to address *the disclosure for question X specifically*, the address is `?disclosure dct:source <…/sprayFoamInsulation/details>` — the path is the addresser, exactly as ODR-0008 Q3a's per-overlay `dct:source` array already establishes.
- **B — evidence envelope.** Reuse ODR-0009 Evidence + PROV-O. ~3 properties (`fileName`, doc metadata) + the existing Evidence class. Nothing to mint; the envelope already exists.
- **E — search/risk result.** A `SearchResult`/`RiskAssessment` class with ~6 properties (`riskIndicator`, `actionAlertRating`, `result`, `summary`, `recommendations`, `datasetAttribution`) **+ a `skos:ConceptScheme` of perils/datasets** (the ~24 datasets). [Isaac] The ~24 datasets are *not* 24 structural copies — they are 24 concepts in a value-space, related by `skos:broader`/`skos:narrower` where the evidence shows recursive `riskSubcategories[]` nesting (SKOS Reference §8 semantic relations). Modelling them as 200 flat leaves both explodes the vocabulary *and* discards the subcategory hierarchy SKOS §8 is built to express. The result *bears provenance* (PROV-O, ODR-0009) because a search result is an authority-retrieved artefact — which is also why ODR-0008 Q4a would promote it to a class on the "authority-retrieved provenance" criterion independently.

**Vote:** FOR — *one disclosure property; reuse ODR-0009 Evidence; SearchResult/RiskAssessment class + peril SKOS scheme with broader/narrower.*

---

## Q5 — Checklist + enums (D, C) — our core category

**Position.** This is where the SKOS Reference is dispositive, and where we are most emphatic.

**C — the 54 enum value-sets → 54 `skos:ConceptScheme`s, shared property per value-space.** SKOS Reference §3 is explicit: a concept scheme is "a set of concepts, optionally including statements about semantic relationships" — *enumerated value-spaces are concept schemes of `skos:Concept`s, not classes and not properties.* The 378 enum-bearing leaves draw on only 54 distinct value-sets (S023-EVIDENCE §B: `(Excluded,Included,None)`×89, `(Attached,To follow)`×79, `(No,Yes)`×77). Minting 378 datatype properties to carry 54 value-spaces is a category error twice over: it mistakes *value-spaces* for *properties*, and it fractures one reused value-space (`Yes`/`No`, used 77× as a value-set, `yesNo` referenced 1,135× as a leaf) into dozens of synonymous slots that carry **no statement of co-reference** — the exact fatal flaw ODR-0011 §Alternatives records against bare-string-constraints. ODR-0011 already ratified "every enum a scheme, no floor" (S011 Q1, 4-0) with the seven-category UFO framework (§8a). This session's Category C *is* ODR-0011's mechanism applied at scale; we are not proposing new doctrine, we are insisting the standing doctrine governs the 378 leaves.

The shared property per value-space follows from §3 + reuse-before-mint: `(No,Yes)` is carried by *one* `opda:yesNo`-typed predicate wherever it recurs (the value lives in the scheme; the predicate ranges over it), not 77 predicates. ODR-0008 Q5a's binding table already encodes the split — §8a-named value-sets (`councilTaxBand`, `builtForm`, `tenureKind`) become SKOS schemes; genuine one-shot internal enums stay `xsd:string + sh:in`. The 54 here are the reused value-sets, which is the §8a side.

**D — fixtures checklist (~315 = ~89 items × 3) → a `skos:ConceptScheme` of fixture-item concepts + 3 shared properties.** The ~89 chattels (`boilerImmersionHeater`, `radiatorsWallHeaters`, `nightStorageHeaters`, …) are a **controlled list of items** — the textbook definition of a controlled vocabulary (ISO 25964-1:2011 §"controlled vocabulary"; SKOS Reference §3). They are *reference data*, not 315 property concepts. Each item is a `skos:Concept` in `opda:fixtureChecklistScheme`; the three repeating fields become three shared properties (`opda:inclusionStatus` → ranges over the `(Excluded,Included,None)` scheme from Category C; `opda:fixtureComment` → free text; `opda:fixturePrice` → `xsd:decimal`). 89 concepts + 3 properties replaces 315 datatype properties — a 25× reduction with *no loss*: the instance data `[ fixtureItem opda:boilerImmersionHeater ; inclusionStatus :Included ; price 250 ]` carries every fact the 315-property version did.

[Isaac] Note the `inclusionStatus` of Category D *reuses* the Category C scheme — `(Excluded,Included,None)` is one value-space whether it appears in the checklist or elsewhere. This is the cross-scheme reuse SKOS §3 enables and the flat-property explosion forbids: 54 + the fixture-item scheme are not 55 isolated lists; they interlink by shared property and `skos:exactMatch` (§4).

**Against the 315-property reading [Baker]:** ODR-0011 §Alternatives already rejected OWL-enumerated-classes as "machinery without a purpose; misclassifies vocabulary terms as classes." The same verdict, mutatis mutandis, rejects 315 datatype properties as *misclassifying reference-data items as predicates*. A fixture-item is a thing you can include or exclude — a `skos:Concept` you point at — not a column.

**Vote:** FOR — *54 enum value-sets → 54 SKOS schemes + shared property each; fixtures → 1 SKOS scheme of ~89 item concepts + 3 props; reuses C's status scheme.*

---

## Q6 — Coverage, round-trip & residual scope (Davis's crux)

**Position.** Category-based import satisfies BASPI5 round-trip and consumer queries **without** 1:1 leaves, and Category G (~181 distinct names) is the right bounded residual.

**Round-trip.** The form is regenerated from its **SHACL overlay profile** (ODR-0010), not from a 1:1 datatype-property catalogue. ODR-0008 §Q7a already places per-form structure (`sh:minCount`, `sh:in`, ordering) in the profile layer; S022 ratified that a PDTF form *is* a DCAP whose SHACL shapes are its Description Set Profile. So round-trip fidelity is a property of *the profile*, not of how many flat IRIs exist in the base TBox. A fixture-checklist form regenerates from a profile that enumerates the 89 `skos:Concept`s and the 3 property shapes — identically whether the base has 3 properties or 315. **Collapsing does not lose round-trip; it relocates the per-form structure to the layer S008/S010/S022 already assigned it.**

**Consumer addressability (Davis's "give me `boilerImmersionHeater.price`").** Addressing survives, by two mechanisms that S008 already ratified. (1) **`dct:source` path-addressing** (ODR-0008 Q3a per-overlay `dct:source` array): the instance `[ fixtureItem opda:boilerImmersionHeater ; price 250 ]` *is* addressable as "price where fixtureItem = boilerImmersionHeater" — a SPARQL `?x fixtureItem opda:boilerImmersionHeater ; price ?p` returns it. The leaf is reachable as a **concept-keyed lookup**, which is strictly *more* queryable than 315 opaque predicates (you can ask "all fixtures priced > £200" — impossible across 99 distinct `…price` predicates without UNION-ing 99 terms). (2) The path-IRI itself is preserved as `dct:source`, so a consumer who genuinely holds the form-question IRI dereferences straight to it.

[Isaac] This is the SKOS payoff Davis's 1:1 framing misses: a `skos:ConceptScheme` makes the value-space *itself* queryable and dereferenceable (SKOS §3 — each concept has a URI), whereas 315 datatype properties make the *slots* dereferenceable but the *value-space* invisible. For a public-interest dataset the value-space is the more valuable query surface.

**Residual scope.** Category G — 181 distinct names — is the right, bounded per-leaf WG target. It is bounded *because* the dumb-down principle and the SKOS-scheme test have already extracted everything that is structure, value-space, reference-data, or upstream-reuse. What remains is, by construction, the irreducibly conceptual residue ODR-0008 envisaged ("the real per-Property/LegalEstate facts"). Curating 181 with hand-assigned domains/comments/UFO-category (the ODR-0008 Q5a discipline) is tractable WG work; curating 900 with forced IRI-collision-disambiguation is not.

**On the standing dissent.** We engage Davis directly in §Cross-talk. Our verdict does not *defer* coverage (we are aligned with the 2026-05-30 one-go directive); it *delivers full coverage by category* — every leaf is represented (as a scheme member, a profile shape, a reused upstream term, or a G-property), none is dropped. Completeness-as-a-gate is satisfied; what is rejected is *completeness-as-900-flat-IRIs*, which is a granularity claim, not a coverage claim.

**Vote:** FOR — *round-trip lives in the SHACL profile (S008 Q7a/S022 DCAP); addressing survives via dct:source + concept-keyed query; G (~181) is the bounded residue; full coverage, not deferred coverage.*

---

## Cross-talk

### → Ian Davis (DA) — reuse-before-mint vs publish-everything

Ian, your publish-first instinct and OPDA's BBC-`/programmes/`-style discipline are why the project weights you (adoption.md), and we are not arguing for *less* coverage — we are arguing that **publishing 900 flat IRIs is publishing a worse artefact, not a more complete one**. Three points where we expect you to press, and our answer:

1. **"A collapsed TBox can't regenerate all 31 forms."** It can, and the regeneration source was never the flat-property count — it is the SHACL overlay profile (ODR-0010), which S022 (you were DA) confirmed *is* the form-as-DCAP. The 89-concept fixture scheme + 3 property shapes regenerate the checklist byte-identically. If you hold this dissent, name **one form field that a profile-over-schemes cannot reconstruct that a flat property could** — we believe the set is empty, and the build pass agrees (the profiles "follow mechanically" once the schemes exist, HANDOVER §"P2").

2. **"A consumer asks for `boilerImmersionHeater.price`."** Answered in Q6: `dct:source` path-addressing + concept-keyed query return it, and return *more* (cross-fixture aggregate queries that 99 distinct `…price` predicates make impossible). Your own completeness-as-a-gate test — "a named consumer query the slice cannot answer" — is *better* met by schemes than by flat properties. We would adopt your held-as-live trigger verbatim, repointed: *re-open if a named consumer query is answerable over 1:1 flat properties but not over schemes-plus-`dct:source`.* We predict it never fires.

3. **The reuse-before-mint rule itself.** This is DCMI Usage Board policy, not OPDA preference (Singapore Framework; Heath & Bizer 2011 §2.5). "Publish everything" and "mint everything" are different commitments — you can publish *complete coverage* over *reused and schemed* terms. Minting 900 permanent IRIs that 56% restate 16 tails is not publish-first; it is publish-*unmaintainable*. The build pass's "the IRIs are permanent / can't be cleanly reversed" is the cost you'd be locking in.

Where we concede ground: you are right that **coverage is non-negotiable** and that a granularity argument must not become a deferral argument. It does not here — Category G is delivered in the same one-go pass, and every other leaf is represented, not dropped (Q6). If the panel reads "collapse" as "defer," that reading is wrong and we'll say so to the Queen.

### → Elisa Kendall — traceability (we agree)

Elisa, we are aligned, and we want to reinforce your traceability requirement with the SKOS mechanism. Your standing concern (S008 Q3a — citation grain; "SKOS for all category-likes" held-as-live) is *strengthened*, not threatened, by category import:

- **Traceability is per-concept `dct:source`, and it is mandatory** (Isaac's standing caution above; ODR-0011 §Rules; SKOS Reference §9). Every `skos:Concept` in the 54 + fixture + peril schemes carries `dct:source` to its originating leaf path. So collapsing 315 fixture leaves into 89 concepts *preserves* 315 source-references (one `dct:source` per concept, plus the per-overlay array of ODR-0008 Q3a) — nothing is lost from the audit trail; it is *re-homed onto the concept*, which is the more stable carrier.
- Your **"SKOS for all category-likes" held-as-live (S008 Q5a)** is, in effect, *vindicated at scale* by this session: Categories C and D are exactly the category-likes, and we vote them to SKOS. We'd record this as converging evidence toward closing your trigger, not re-opening it.
- One place we'd ask you to hold us to account: the **steward requirement** (Q2). Traceability without stewardship decays — a scheme with `dct:source` but no `dct:creator`/`dct:publisher` is traceable-to-origin but not *governable-forward*. We've made steward-per-scheme a MUST; we'd welcome you policing it in synthesis as a completeness criterion alongside your citation-grain discipline.
