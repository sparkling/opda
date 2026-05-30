# Davis (DA) — Session 026 (R3): `opda:Building` / `opda:Room` Class Promotion

**Role:** Ian Davis, Devil's Advocate — Linked Data Council (ODR-0001), Reduced Council, `consensus-mode: agent-fan-out`.
**Held position carried in:** S008 §Q4a (Davis held-as-live AGAINST Building/Room class promotion; "no current consumer query"). This file is that dissent, held as live.
**Procedural note:** This council convenes **provisionally under a directing-authority override of the R3 gate**. The R3 firing trigger — *a named BASPI5 round-trip query that traverses Property→Building→Room* — **has not fired.** I record that the question is being deliberated *ahead of its own gate*, and my vote reflects the world as it actually is on 2026-05-30, not a hypothetical future consumer.

## Headline

**HOLD. Do not promote `opda:Building` / `opda:Room` to classes.** No consumer dereferences a room or a building as a thing today; the descriptive facts that *would* hang off them (`numberOfFloors`, `builtForm`, `roomDimensions`, `rooms`) are not even emitted yet, and the one that is — `builtForm` — already sits correctly as a Quale-in-Region datatype property on `opda:Property`. Minting these classes now manufactures resources nothing resolves — the precise failure §Q4a's conditional gate was written to prevent.

---

## Q1 — Promote `opda:Building` / `opda:Room` to classes now, or hold?

**Attack.** The promotion has no consumer. The S008 verdict records this verbatim: *"Building / Room: Davis held-as-live (no current consumer query); … convene on first BASPI5 round-trip evidence"* (session-008, Verdict line) and *"Davis HELD-AS-LIVE AGAINST Building / Room (no current consumer query exercises Building/Room reasoning beyond Property aggregation)"* (session-008, Q4 panel). Nothing has changed in the corpus to fire that trigger. The override that convened this R3 is an authority *instruction to deliberate*, not a *consumer query* — and the gate's currency is a consumer query, not a directive.

The state of the actual artefact makes the case overwhelming, not merely cautious:

1. **Building/Room exist as ZERO classes today.** A grep of every `source/03-standards/ontology/*.ttl` for a `Building`/`Room` class declaration returns nothing. There is no half-built thing to "complete" — promotion is a *de novo* mint.
2. **The facts that would attach to them are not emitted.** `numberOfFloors`, `yearOfBuild`, `internalArea`, `rooms`, `roomDimensions`, `bedrooms` — none appear in `opda-property.ttl`. The 935-leaf descriptive walk is still pending (ADR-0028, `proposed`), and S023 (10–0/11–0) **replaced** the 1:1 mechanical walk with *category import*: of ~1,493 annotated leaves only ~181 (~12%) are genuine descriptive concepts. There is no Property→Building→Room edge to traverse because the intermediate predicates don't exist in the TBox yet.
3. **The one emitted built-form fact already works without a class.** `opda:builtForm` is an `owl:DatatypeProperty`, `rdfs:domain opda:Property`, UFO Quale-in-Region (opda-property.ttl:96–102). It validates and round-trips today with zero Building class. This is the existence proof that descriptive form-facts do **not** need Building/Room to be classes.
4. **The escape hatch is already wired and dormant.** `opda-vocabularies.ttl:275` (PropertyTypeScheme scope note) already states members *"may bind to OWL sub-classes of `opda:Property` via `skos:exactMatch` when conditional Building/Room class promotions trigger (per ODR-0008 §Q4a held-as-live)."* The non-disruptive upgrade path is *pre-built*. Holding costs nothing; promoting early spends modelling and review budget on a class no SHACL shape targets and no SPARQL query selects.

**Citation.** BBC `/programmes/` ontology, deployed 2009 (`bbc.co.uk/ontologies/po`, ODR-0001 §Citation grounding): a class is minted only when a consumer dereferences its instances as first-class things — `/programmes/<pid>` exists because users and aggregators resolve a programme as a resource. The BBC did not mint `Segment`-grain classes speculatively against a future query; they followed published-data demand. Promoting Building/Room with no `/rooms-above-4m²` consumer inverts that discipline. Reinforced by ODR-0008 §Q4a, which lists Building/Room explicitly as **conditional** promotions, gated on "first named BASPI5 round-trip query exercising sub-Property reasoning."

**Vote:** AGAINST.
**Withdrawal condition:** A named, runnable BASPI5 round-trip query whose answer set *cannot* be produced from `opda:Property` datatype properties alone and *requires* dereferencing a Building or Room instance (see Q2 for the exact shape). Until such a query is tabled, **HOLD.**

---

## Q2 — What is the precise firing trigger (the named query shape)?

**Attack.** A trigger that is "Building/Room reasoning" in the abstract is not a trigger — it is an invitation to mint on aesthetics. The gate must be a *query that fails on the flat model and succeeds only on the promoted model*. That is the only test that distinguishes a real consumer need from ontological tidiness. I make the trigger concrete and falsifiable:

> **Firing query (the named shape):** a BASPI5-sourced SPARQL query that must **bind a Room (or Building) as an independent subject and filter/aggregate on a per-Room (or per-Building) attribute that cannot be expressed as a single-valued datatype property on the parent `opda:Property`.**
>
> Canonical exemplar: *"Return rooms with floor area > 4 m² located on the top floor of the property"* —
> ```sparql
> SELECT ?room ?area WHERE {
>   ?prop a opda:Property ; opda:hasRoom ?room .
>   ?room opda:roomFloor ?floor ; opda:roomArea ?area .
>   ?prop opda:numberOfFloors ?top .
>   FILTER (?floor = ?top && ?area > 4.0)
> }
> ```
> This **cannot** be answered if `rooms`/`roomDimensions` are a structured datatype bag on `opda:Property`, because the per-room area and per-room floor must be *jointly* selected and filtered on the *same room individual* — that is exactly the multi-valued, co-varying, individually-addressable structure that forces a class (UFO: a Room is then an Endurant bearing its own Qualities, not a Quale of the Property).

The reasoner-independence test from ODR-0008 §Q6a applies by analogy and tightens the trigger: if the demanded answer set can be produced by a UNION/aggregate over datatype-property values on `opda:Property` under an entailment-OFF SPARQL endpoint, the promotion is **decorative** and the trigger has NOT fired. The trigger fires only when joint per-instance selection is unavoidable.

**Two guards against a soft trigger:**
- **Not** "a form has a rooms array" — array shape in the source JSON is form ergonomics (ODR-0008 §Context: *"that nesting is form ergonomics, not ontology — flatten it"* — Cagle Q3). A repeated structure in BASPI5 is not a consumer query.
- **Not** "a stakeholder might want per-room data someday" — speculative demand is the YAGNI failure. The query must be *named and runnable* against a real BASPI5 slice.

**Citation.** ODR-0008 §Q6a (hierarchy/structure admission: "named consumer query asking for parent-level entailment with query text reviewable" + "reasoner-independence test (UNION-over-children must equal entailed-parent answer-set; if they differ, the hierarchy is decorative under entailment-off SPARQL endpoints)"). The same discipline that governs predicate hierarchies governs class promotion: the query text must be reviewable, and the flat model must demonstrably fail it.

**Vote:** FOR (defining the trigger precisely; the trigger itself, not the promotion). I vote **FOR adopting this query shape as the §Q4a firing trigger of record**, replacing the under-specified "exercising sub-Property reasoning" phrasing with a falsifiable, runnable test.
**Withdrawal condition:** n/a — this is my affirmative contribution; I hold that the trigger MUST be this concrete to mean anything. If the council waters it down to "any per-room interest," I **HOLD** dissent against the soft trigger.

---

## Q3 — Interim: do `rooms` / `roomDimensions` stay as structured datatype properties on `opda:Property` until then?

**Attack.** Yes — and this is not a compromise, it is the *correct* model until Q2's query exists. There is no defect in carrying room dimensions as a structured datatype value (or a small bag of `opda:` datatype properties) on `opda:Property`. The defect ODR-0008 was written to kill is **blank-node attachment to `propertyPack`** (ODR-0008 §Context, §Rules "Attachment"), not "datatype properties on a real class." `opda:builtForm`, `opda:numberOfFloors` (when emitted) and a structured `roomDimensions` literal *all* attach to the real `opda:Property` subject — the blank-node defect is already cured without any Building/Room class.

Three reinforcing points:
1. **S023 already routes this.** S023's category taxonomy (ODR-0022, `proposed`) handles room/dimension leaves under curated category G (~181 genuine descriptive concepts) and structured micro-patterns, **not** under class promotion. The standing decision of the most recent descriptive-layer council is *flat/structured datatype*, not *new class*. Promoting Building/Room now would contradict S023's import strategy, not extend it.
2. **Reversibility is free and total.** Because the SKOS `skos:exactMatch` upgrade path is pre-wired (opda-vocabularies.ttl:275) and the foundation regenerates every build (ADR-0023/0024 immutable-enriched emission), moving `roomDimensions` from a Property datatype property to a `opda:Room` class attribute *when the trigger fires* is a generator change, not a breaking migration of published data — because no Room IRIs have been minted and dereferenced in the interim. Holding preserves every future option at zero cost.
3. **Promoting now incurs real cost.** A `opda:Room` class needs: an identity criterion stated over hard cases (ODR-0001 A9 requirement (b) — what makes two room-observations the *same* room across a re-survey? this is genuinely hard and currently unanswered), a minting policy (Room IRIs — opaque? derived from Property + ordinal?), SHACL shapes, and provenance. Spending that adjudication budget against a query that does not exist is exactly the speculative over-engineering YAGNI and publish-first reject.

**Citation.** ODR-0008 §Rules "Attachment" (descriptive properties attach to `opda:Property` and legal-estate classes — *"Never to a `propertyPack` blank node"*; intermediate built-form classes are admitted *"where the fact is about a sub-part"* — and no consumer today asks about a sub-part as a subject). Reinforced by `data.gov.uk` linked-data publishing practice (Davis, UK-Gov cookbook): publish the data flat against stable real-world subjects first; promote sub-structure only when a consumer of the *published* data demonstrably needs it.

**Vote:** FOR (structured datatype properties on `opda:Property` in the interim).
**Withdrawal condition:** Same as Q1 — when a named Q2-shaped BASPI5 round-trip query requires per-Room/per-Building individual addressing, migrate the affected leaves from Property datatype properties to the newly-promoted class (via the pre-wired `skos:exactMatch` path). Until then, **HOLD** on flat/structured datatype.

---

## DA Scorecard (per ODR-0001 §Two-artefact discipline)

| Q | Vote | Status | Withdrawal condition (verbatim) |
|---|---|---|---|
| Q1 — Promote now or hold | AGAINST | **HOLD** | Named BASPI5 round-trip query that requires dereferencing a Building/Room instance and cannot be answered from `opda:Property` datatype properties alone. |
| Q2 — Precise firing trigger | FOR (the trigger) | **HOLD** (against any soft trigger) | n/a — affirmative; hold if the trigger is weakened below "joint per-instance selection unavoidable." |
| Q3 — Interim datatype on Property | FOR | **HOLD** | Migrate via pre-wired `skos:exactMatch` only when the Q2 query fires; flat/structured datatype until then. |

**Held position:** All three resolve to **HOLD**. The directing-authority override convened the deliberation; it did not fire the gate. The gate's currency is a runnable consumer query, and none exists on 2026-05-30.

---

## Citations (grounded per ODR-0001 §Citation grounding)

1. **BBC `/programmes/` ontology, deployed 2009** (`bbc.co.uk/ontologies/po`) — mint a class only when consumers dereference its instances as things; demand-led, not speculative. (Documented deployment, Davis.)
2. **ODR-0008 §Q4a** (three-criterion class-promotion test; Building/Room listed as **conditional** promotions, "convene on first named BASPI5 round-trip query exercising sub-Property reasoning — Davis dissent") + **§Q6a** reasoner-independence test (UNION-equals-entailed ⇒ decorative). The conditional gate and its falsifiability test are corpus-internal authority.
