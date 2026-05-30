# Session 024 (R1) — Cagle, Devil's Advocate (R1 position)

**Role:** Devil's Advocate. **Mandate:** attack the promotion of the per-peril search/environmental result to a new `opda:RiskAssessment` **class**. Defend Kendall's alternative **(d)** — the six-field result is a *structured value bag* hung on the existing `opda:Search`, not a class with its own identity criterion.

**Genuinely-opposed published position (cited throughout):** my SHACL-first practitioner line — *The Cagle Report* / "The Ontologist" essays and the *Working Ontologist* DA discipline I carried at OPDA S008: **"a distinction earns its keep only when a SHACL shape treats two cases differently"** and **"most of what looks like classes/properties in a form schema is reference data or structured values; don't over-promote."** I argued *flatten* at S001 Q3 ("that nesting is form ergonomics, not ontology — flatten it", recorded verbatim in [ODR-0008 §Context]) and I authored the S008 §Q4a three-criterion class-promotion test that the panel adopted — **the test that promoted exactly five classes and stopped, with `RiskAssessment` deliberately not among them** ([S008 §Q4a; cagle-da.md]).

**The pivot of my whole position (read before the per-question votes):** the load-bearing fact is in the emitted ontology, not in the proposition. `opda:riskIndicator` **already ships as a flat `owl:DatatypeProperty` on `opda:Property`** (`opda-property.ttl` L232–238, `dct:source` → ODR-0008 §Q5a, bound to a YesNoScheme). And `opda:Search` **already ships as a bare class** whose scopeNote reads, verbatim, *"Covers CON29R / LLC1 / environmental / flood / coal-mining searches"* (`opda-descriptive.ttl` L41–47). So the flat treatment and the host class **both already exist and already validate**. The proposition asks the Council to mint a *second* home (`RiskAssessment`) for fields one of which is already emitted flat and all of which are already in `Search`'s declared scope. That is reification competing with shipped reality — and the burden is on the proposer (my S008 §Q5a "stay-as-datatype default; burden of SKOS/class promotion on the proposer", [cagle-da.md]).

I concede the proposition is **not all wrong**: the cross-peril query (Q2/Q6) and the peril SKOS scheme are real and I vote FOR them. My fight is narrow and surgical: **does the result need its own *class*, or is it `Search` + the peril scheme + ~6 datatype props (alternative d)?**

---

## Q1 — `RiskAssessment` as a class? (its identity criterion)

**Attack.** This is the question the whole session turns on, and the proposition has no answer to the only question that matters: **what individuates one `RiskAssessment` instance from another?** Name "the flood-risk assessment for property X" and "the coal-mining assessment for property X." What tells them apart? Only the **peril value**. Strip the peril and the two instances are six structurally-identical fields differing in nothing else. That is the textbook signature of a **value-keyed structured datum**, not a Substance Kind with its own IC. An entity whose entire identity reduces to one of its property values does not have an identity *criterion* — it has a *key*. Guarino & Welty's OntoClean is explicit ([Guarino & Welty 2002, *Evaluating Ontological Decisions with OntoClean*, CACM 45(2), the +I/−I meta-property]): a type that supplies no identity *over and above* a discriminating attribute value fails the carries-identity test and should be a value, attribute, or quale — not a sortal Kind.

Compare the five classes my own S008 test *did* promote. `Survey`, `EPCCertificate`, `Valuation`, `Comparable`, `Search` each have an IC the emitted Turtle states independently of any single attribute: `Search` is individuated by "local-authority issuance chain; ordered / returned / superseded" (`opda-descriptive.ttl` L44); `EPCCertificate` by "10-year validity; supersession on re-assessment" (L36). Those are **lifecycle ICs** — the artefact is issued, re-issued, withdrawn, superseded as a *whole*, and that lifecycle is its identity. The per-peril result block has **no independent lifecycle**: it is issued, superseded, and re-run **exactly when its parent `Search` is** — it `prov:wasGeneratedBy` the same search activity. It borrows the `Search`'s lifecycle wholesale. An entity whose lifecycle is identical to its container's, and whose only distinguishing attribute is one coded value, is a **structured value on that container** (alternative d), full stop.

And the SHACL test — my own discipline — confirms it. *"A distinction earns its keep when a SHACL shape treats two cases differently"* ([Cagle, *Working Ontologist* DA discipline, cited S008 §6]). Show me the SHACL shape that targets `opda:RiskAssessment` and constrains it **differently from a property shape over `Search`'s six fields keyed by peril**. There isn't one: the six fields validate identically (`riskIndicator` ∈ YesNoScheme, `actionAlertRating` ∈ a rating scheme, three free-text strings, one attribution). A `sh:NodeShape` on `RiskAssessment` and a `sh:PropertyShape` block on `Search` produce **byte-identical validation reports**. Under my SHACL-first test, a class that no shape distinguishes is decorative reification — exactly what I attacked, and won, on the annotation-graph clause at S001 Q5.

**The one thing that would change my vote** — and I state it because the proposition gestures at it: if a `RiskAssessment` can exist and be queried **detached from any `Search`** — i.e. a risk dataset arrives from a peril authority (a Coal Authority dataset, a flood-zone overlay) that is *not* the product of an ordered search and has its own issuance/refresh cadence independent of any `Search` instance — then it has an IC of its own (dataset-edition lifecycle) and *is* a class. The evidence (S024-EVIDENCE L14) says these are *"produced by a search provider / data authority"* — which reads as *generated by a search*, i.e. dependent. If the panel can name a real instance where the risk result outlives or precedes its `Search`, I fold.

**Vote:** AGAINST (a distinct `RiskAssessment` class). FOR a structured value on `Search` (alternative d) with a peril-keyed property block.
**Withdrawal condition:** WITHDRAW iff the panel states an identity criterion for `RiskAssessment` that does **not** reduce to "the peril value" and is **not** simply the parent `Search`'s lifecycle re-stated — concretely, a named case where a risk result has issuance/supersession *independent of* any `Search` instance. **HOLD** if the only IC offered is "it's the result for peril P of search S" (that is a key on `Search`, not an IC).
**Status: HELD.**

---

## Q2 — the peril/dataset axis (SKOS scheme vs 12 subclasses vs string)

**Attack — but here I largely concede, and I say why precisely.** A 12-member peril scheme is *correct*, and I will not pretend otherwise: a lender's offer condition that **names the coal-mining search** (S023; S024-EVIDENCE L26) requires the peril to be a **dereferenceable, queryable concept**, not an opaque string. An opaque string fails the AI/LLM-retrieval and reconciliation discipline I argue for in *The Ontologist* ([Cagle, "Taxonomies as the backbone of knowledge graphs", *The Cagle Report*]) — a string can't carry `skos:prefLabel`/`skos:definition`/`dct:source` to the governing authority, can't be mapped, can't be dereferenced. So I'm FOR the scheme.

Where I attack is the **subclass** alternative (c): twelve OWL subclasses `FloodRisk`, `CoalMiningRisk`, … is exactly the over-promotion I exist to stop. It explodes the TBox into twelve rigid sortals that no shape distinguishes (same SHACL-first test as Q1), it forces reasoner-dependence to query "all perils uniformly" (you must UNION twelve subclasses or rely on entailment — my S008 §Q6a reasoner-independence test, [cagle-da.md], fails it), and it conflates the **value axis** (which peril) with the **type axis** (what kind of thing). The peril is a *value*; values belong in SKOS `skos:Concept`s under `skos:broader`/`skos:narrower`, not in `rdfs:subClassOf`. This is the cleanest case in the whole session: **value-space → SKOS scheme; never subclasses.** (And note this scheme stands whether or not Q1 mints a class — it keys the property block on `Search` just as well as it would type a `RiskAssessment`.)

**Vote:** FOR — a first-class 12-member peril/dataset SKOS scheme; AGAINST 12 subclasses; AGAINST opaque string.
**Withdrawal condition:** already aligned with the majority on the scheme; I HOLD only the rider that the scheme is the **value axis** and must not be smuggled back in as `rdfs:subClassOf` (alt c) — re-open if anyone proposes subclassing the peril.
**Status: WITHDRAWN** (concede the SKOS scheme; rider noted, not a dissent).

---

## Q3 — one family class or two? (environmental-search vs local-authority/CON29)

**Attack.** The proposition's own framing defeats it here. If we're debating whether the search result is *one* class or *two* (`RiskAssessment` for environmental perils vs a CON29/local-authority class), we are already two reifications deep — and the emitted ontology answers the question without minting either: **`opda:Search` already covers both.** Its scopeNote (verbatim, `opda-descriptive.ttl` L47): *"Covers CON29R / LLC1 / environmental / flood / coal-mining searches per PDTF v3 propertyPack.localSearches."* The class that already exists and was ratified at S008 spans **both** the CON29 local-authority results **and** the environmental perils. So the answer to "one family class or two?" is **zero new family classes** — the family is `Search`, and the environmental-vs-CON29 difference is a **peril/dataset value** (Q2's scheme) on the one `Search`, exactly as `localSearches` (185 leaves) and the 12 perils both live under `propertyPack.localSearches` in the source.

Two classes would be the worst outcome on offer: it fractures one settled concept (`Search`) into per-source synonyms — the *precise* defect I named and the panel rejected at S001 Q3 ("per-form synonyms", [ODR-0008 §Context / Alternatives]). Allemang's "earns its keep" discipline (which I invoked at S008 §Q4a) kills it: a second class earns nothing a `datasetCategory`/peril value on `Search` doesn't already give you.

**Vote:** AGAINST two classes; AGAINST even one new family class. The "family" is the existing `opda:Search`; environmental-vs-CON29 is a peril/dataset SKOS value on it.
**Withdrawal condition:** WITHDRAW the "two classes" objection (no one is seriously proposing two) and align that the answer is "one home" — but I HOLD that the one home is the **already-emitted `Search`**, not a new `RiskAssessment`. Re-open only if a distinct **PII regime** (my S008 §Q4a criterion (c)) is shown to fall on CON29 results but not environmental results, or vice-versa — that, and only that, would split them.
**Status: WITHDRAWN on "two", HELD on "the one home is `Search`, not a new class".**

---

## Q4 — the `riskSubcategories[]` recursion (self-referential vs flat sub-result list)

**Attack.** The proposition wants a **self-referential `RiskAssessment`** — a result bearing sub-results — to model the 12 perils × 2 (the peril + its `riskSubcategories[]`, S024-EVIDENCE L11). This is the over-engineering tell of the session. A self-referential class is the heaviest possible modelling of what the source data shows is **one structural level of nesting** (peril → its subcategories), and recursion you don't need is a standing maintenance and query liability: every SPARQL query over results must now guard against arbitrary depth, every SHACL shape must handle a recursive target (and SHACL recursion is famously under-specified — [W3C SHACL Recommendation §1.5, recursion left implementation-defined; my standing SHACL-practitioner caution against recursive shapes, *The Ontologist*]). YAGNI: the data is peril-then-subcategory, a **flat sub-result list keyed by the same peril scheme** (Q2), not an unbounded tree.

And note this attack **lands hardest under alternative (d), which makes my case stronger, not weaker**: if the result is a structured value block on `Search`, "subcategories" is just the same peril-keyed property block at a `skos:narrower` concept — no self-reference, no recursive shape, no class at all. The recursion only *looks* necessary if you've already (wrongly, Q1) decided the result is a class that must contain instances of itself. Drop the class, and the recursion problem evaporates. That's a tell that the class was never load-bearing.

**Vote:** AGAINST self-referential `RiskAssessment`. FOR a flat sub-result list keyed by the peril SKOS scheme (`skos:broader`/`narrower` carries the peril → subcategory structure; the result block does not recurse).
**Withdrawal condition:** WITHDRAW iff the panel produces a **named consumer query** that requires *unbounded-depth* recursion over results (not the one peril→subcategory level the source shows) AND a SHACL shape that validates it without relying on implementation-defined recursion. Absent both, the flat list wins.
**Status: HELD.**

---

## Q5 — provenance + IC + the five existing classes' internals

**Attack — and here I split: concede the PROV-O hook entirely, attack only its misuse as a class-promotion argument.**

*Conceded, fully:* hanging the family off ODR-0009 PROV-O via `prov:wasGeneratedBy` is **right**, and I vote FOR it. A search/environmental result is generated by a search-provider activity; that derivation belongs on a shared dereferenceable standard ([ODR-0009 §PROV-O backbone; W3C PROV-O REC §3.2]). Giving the five **already-promoted** classes (`Search`, `Survey`, `EPCCertificate`, `Valuation`, `Comparable`) their internal property structure is also overdue and correct — they shipped as bare classes with identity-key shapes and now need their datatype/object internals. No objection.

*Attacked:* the proposition smuggles a fallacy — **"it bears provenance, therefore it's a class."** That does not follow, and ODR-0009 itself proves it: in PROV-O, *anything* can be a `prov:Entity`. A **structured value** is as good a `prov:Entity` as a class instance — `prov:wasGeneratedBy` attaches to the value block on `Search` just as cleanly as to a freestanding `RiskAssessment`. ODR-0009's own boundary table models five eIDAS elements (`trust_framework`, `digest`, assurance level, etc.) as **values/annotations around PROV, not as classes** ([ODR-0009 §"The ~80% boundary"]). So provenance-bearing is *necessary* for class promotion under my S008 §Q4a criterion (a) but **nowhere near sufficient**: criterion (a) is satisfied by the **`Search`** (the search has the provenance chain and the lifecycle); the per-peril result merely shares it. To promote `RiskAssessment` you must satisfy (a)/(b)/(c) **independently of the parent `Search`** — and Q1 showed you can't.

**The asymmetry that decides it:** the five existing classes each pass my test on a criterion the *result block does not independently hold*. `Survey` has its own issuance/withdrawal lifecycle (criterion b). `EPCCertificate` has its own 10-year validity + register (a + b). `Search` has the local-authority issuance chain (a + b). The per-peril result has **none of its own** — its provenance is the `Search`'s provenance, its lifecycle is the `Search`'s lifecycle, its only own feature is the peril value. So under the very test that promoted the five, the result is **not** the sixth class. State `RiskAssessment`'s IC here, independent of `Search`, or it isn't one. (Stated ICs I'll accept for the others: `Search` — local-authority/provider issuance chain, ordered/returned/superseded; `Survey`/`EPC`/`Valuation`/`Comparable` — per the emitted scopeNotes. For `RiskAssessment` the proposition offers none that survives Q1.)

**Vote:** FOR the PROV-O hook (`prov:wasGeneratedBy`) and FOR giving the five existing classes their internals. AGAINST treating provenance-bearing as sufficient to promote `RiskAssessment` — the result block is a `prov:Entity` *structured value* on `Search`, not a sixth class.
**Withdrawal condition:** WITHDRAW the class-promotion half iff the panel discharges criterion (a) **or** (b) **or** (c) of my S008 §Q4a test for `RiskAssessment` **independently of its parent `Search`** (own provenance source, own lifecycle, or own PII regime). The PROV-O-hook half is already a FOR, not a dissent.
**Status: WITHDRAWN on the PROV-O hook + the five internals; HELD on "provenance ≠ class for `RiskAssessment`".**

---

## Q6 — the four-way: which of Kendall's (a)–(d) wins, and on what criterion?

**Attack / verdict.** The criterion must be the SHACL-first earns-its-keep test, not aesthetic completeness. Apply it to the four:

- **(a) Flat datatype-bag on `Search`** — six flat props, no peril scheme. **Rejected**, and I reject it *against* my own flatten instinct: it loses the cross-peril uniform query (a lender querying `actionAlertRating` across *all* perils can't, because there's no peril key) and the per-peril `dct:source`-to-authority. The proposition is right that (a) is too flat. I concede this cleanly.
- **(c) Per-peril subclasses** — **rejected** at Q2: value axis masquerading as type axis; reasoner-dependent; twelve rigid sortals no shape distinguishes.
- **(b) `RiskAssessment` class + peril scheme** — **rejected on the IC failure of Q1/Q5**: the class has no identity criterion beyond the peril value and no lifecycle beyond its parent `Search`. The scheme half of (b) is right; the *class* half is reification no SHACL shape earns.
- **(d) Reuse `opda:Search` — fold the result into the existing `Search` as a structured datatype/value block, keyed by the peril SKOS scheme, with `prov:wasGeneratedBy` on the block.** **Wins.** It is the only option that simultaneously: (i) reuses the **already-emitted, already-ratified** `Search` class whose scopeNote *already* claims the perils (`opda-descriptive.ttl` L47); (ii) carries the cross-peril uniform query via the peril key (defeating (a)'s flaw — a lender queries `?s a opda:Search ; opda:resultForPeril skos-concept:coalMining ; opda:actionAlertRating ?r` uniformly across all perils); (iii) keeps the peril as a dereferenceable SKOS value (the half of (b)/(c) that's correct); (iv) hangs cleanly off ODR-0009 PROV-O (the value block is a `prov:Entity`); and (v) mints **zero** new classes — honouring the burden-on-proposer default and the S001 Q3 flatten precedent.

The decisive criterion, stated plainly: **(d) answers every competency question (b) answers, and passes the SHACL-distinguishability and reasoner-independence tests that (b) and (c) fail.** When two models answer the same queries and one mints a class the other doesn't, the one without the class wins — that is the entire content of "a distinction earns its keep when a shape treats two cases differently."

**The honest concession that scopes my dissent:** the cross-peril query (lender querying `actionAlertRating` across all perils uniformly) is **real and load-bearing**, and it is the strongest argument *for* structure over alternative (a). I grant it fully. But it argues for a **peril-keyed property block + the SKOS scheme** — which (d) supplies — **not** for a `RiskAssessment` *class*. If the panel can show a competency query that (d)-on-`Search` genuinely *cannot* express but (b)-with-a-class *can*, I withdraw and concede the class. I do not believe such a query exists, because a structured value block keyed by the peril scheme is queryable on exactly the same axes as a class instance.

**Vote:** FOR (d) — reuse `opda:Search`, structured peril-keyed value block, peril SKOS scheme, PROV-O hook, no new class. AGAINST (b)'s class, (c)'s subclasses, (a)'s scheme-less flat bag.
**Withdrawal condition:** WITHDRAW (concede (b)) iff a named competency query is produced that **(d)-on-`Search` cannot express but a `RiskAssessment` class can** — equivalently, an IC for `RiskAssessment` independent of the peril value and the parent `Search` (the Q1 condition). Otherwise **HOLD** (d) as the winner.
**Status: HELD.**

---

## DA scorecard (for the Queen's tally appendix)

| Q | Vote | Status | One-line |
|---|---|---|---|
| Q1 | AGAINST class / FOR alt (d) | **HELD** | No IC beyond the peril value; lifecycle is the parent `Search`'s |
| Q2 | FOR SKOS scheme; AGAINST subclasses/string | **WITHDRAWN** | Concede the 12-peril scheme; rider: it's a value axis, never `rdfs:subClassOf` |
| Q3 | AGAINST two/one new class | **WITHDRAWN on "two", HELD on "home = `Search`"** | `Search` scopeNote already covers CON29 + environmental perils |
| Q4 | AGAINST self-reference | **HELD** | One nesting level → flat peril-keyed list; SHACL recursion under-specified |
| Q5 | FOR PROV-O hook + 5 internals; AGAINST provenance⇒class | **WITHDRAWN on hook/internals, HELD on provenance≠class** | A structured value is a `prov:Entity` too; (a) of §Q4a is the `Search`'s, not the result's |
| Q6 | FOR (d) | **HELD** | (d) answers every query (b) does, mints zero classes, passes the SHACL/reasoner tests |

**Net:** 2 WITHDRAWN (Q2, and the value-half of Q5) + partial-withdraw Q3 + **3 HELD dissents (Q1, Q4, Q6) converging on one proposition: reuse `opda:Search` (alt d); do not mint `opda:RiskAssessment`.**

**Single withdrawal trigger that collapses all three held dissents at once:** a stated **identity criterion for `RiskAssessment` that is independent of (i) the peril value and (ii) the parent `Search`'s lifecycle** — concretely, a named real case where a risk result has its own issuance/supersession cadence, or a competency query (d)-on-`Search` cannot express. Meet it on Q1 and I withdraw Q4 and Q6 with it.

**Citations (named, per ODR-0001 §Citation grounding):**
1. **Guarino & Welty 2002**, *Evaluating Ontological Decisions with OntoClean*, CACM 45(2) — the carries-identity (+I) meta-property: a type supplying no identity beyond a discriminating value is not a sortal Kind (Q1, Q5).
2. **Cagle**, *The Ontologist* / *The Cagle Report* + the *Working Ontologist* DA discipline carried at OPDA S008 — **"a distinction earns its keep only when a SHACL shape treats two cases differently"** and "don't over-promote form reference-data/structured-values to classes" (S001 Q3 flatten; S008 §Q4a three-criterion test I authored; §Q5a stay-as-datatype default, burden on proposer) (Q1–Q6).

**Headline (HELD dissent for the synthesis):** *Cagle DA holds dissent on Q1, Q4, Q6 — the six-field per-peril result is a peril-keyed structured value on the already-emitted `opda:Search` (Kendall alternative d), not a new `opda:RiskAssessment` class. `riskIndicator` already ships flat on `opda:Property`; `Search`'s scopeNote already covers flood/coal-mining/environmental searches; the result has no identity criterion beyond the peril value and no lifecycle beyond its parent search. Withdrawal condition: state an IC for `RiskAssessment` independent of the peril value and the parent `Search`, or a competency query (d) cannot express.*
