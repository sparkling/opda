# Session 026 (R3) — Working notes: Nicola Guarino

> **Nicola Guarino** (ISTC-CNR — formal ontology theory; OntoClean meta-properties; DOLCE; identity criteria). Reduced Council, `agent-fan-out`. Lens: do `opda:Building` and `opda:Room` carry **distinct identity criteria** warranting first-class status, or are they **parts** of `opda:Property` adequately captured by datatype properties until a consumer reasons over their identity?

**Standing on the gate.** This R3 runs *provisionally* under a directing-authority override of R3's own gate — the consumer-query trigger that S008 Q4 attached to Building/Room has not fired (no named BASPI5 round-trip query exercises Building/Room reasoning beyond Property aggregation). I frame every verdict at the **criteria level** per the convening instruction: I state the IC test that *would* justify promotion and judge whether it is met **today**. I do not vote to promote a class whose promotion trigger has not fired; neither do I deny the eventual IC. This is precisely the posture OntoClean licenses — identity is a property of the *kind*, but a kind earns a *class in the artefact* only when a consumer reasons over instances of that identity.

Inputs read: [ODR-0005 §2a/§3a](../../../ODR-0005-property-land-identity-crux.md) (3-class commitment; sub-Property granularity deferred "gated on a named consumer query" — Allemang DA Q1 withdrawal condition) · [S008 §Q4 transcript](../../session-008-property-descriptive-attributes.md#q4) (three-criterion class-promotion test; Building/Room held-as-live AGAINST by Davis) · [S008 working: Guizzardi+Baker Q4](../session-008/guizzardi-baker.md) (the UFO Kind/IC + DCMI prefLabel-substructure dual test that nominated Building/Room) · [davis-da-r3 brief] (promote-now-or-hold / firing trigger / interim datatype treatment).

---

## The OntoClean frame (what is actually being asked)

The question is **not** "do Building and Room have identity criteria?" Almost everything spatial-material does, trivially. The question OntoClean forces is sharper and two-pronged:

1. **Do Building and Room carry their *own* IC — an IC *not inherited from, and not reducible to,* the IC of `opda:Property`?** (Guarino & Welty 2002, *OntoClean*, the **+I** / **+O** meta-properties: a sortal supplies an IC; a type that *carries its own* identity, distinct from its supertype's, is **+O**.) If `Room`'s identity just *is* a region of `Building`'s identity which just *is* a region of `Property`'s spatial-material continuity, then Building/Room are not independent identity-bearers — they are **mereological parts** under a single continuant's IC, and OntoClean says they need no separate class *qua identity*.

2. **Even granting a distinct IC, does a consumer reason over that identity?** This is the OntoClean **discipline of parsimony** read through DOLCE's modelling pragmatics: a meta-category commitment is *decorative* (ODR-0001 A9 §(b) — "without [the IC over hard cases] the commitment is decorative") unless the IC does work. The IC does work only when some query distinguishes instances *by their identity* — i.e., asks a question whose answer changes depending on whether two Building/Room descriptions denote the same Building/Room.

My verdict, in one line: **Building and Room *would* be Substance-Kind-like parts with their own ICs — prong 1 is satisfiable — but prong 2 is not met today, so the IC is not yet load-bearing and promotion is premature.** I agree with Davis on *timing* and affirm the *eventual* IC.

---

## The IC test that WOULD justify promotion (criteria-level, one statement)

> **Building/Room earn a class iff (a) they bear a *segregated* identity criterion — a unity + persistence condition that can diverge from `opda:Property`'s spatial-material-continuity IC over a named hard case (i.e. there exists a case where the Building/Room persists-or-perishes *differently* from the Property containing it) — AND (b) a consumer query reasons over that segregated identity (counts, joins, or re-identifies Building/Room instances *as individuals*, not as datatype-valued attributes of a Property).**

Both conjuncts are required. (a) is the OntoClean **carries-own-identity (+O)** test under a **unity criterion** (Guarino & Welty 2002, §on Unity — a whole bounded by a topological/functional closure). (b) is the **consumer-query gate** ODR-0005 §2a already made the rule for sub-Property granularity, which OntoClean's anti-decoration discipline independently demands.

**Is (a) met?** *Yes, in principle, and the divergence case already exists in our corpus.* ODR-0005 §3a hard-case 4 ("Replacement") is exactly the segregation witness: a built structure **may persist when Property identity changes**, and conversely a Property persists through routine knock-down-rebuild where the *building* does not. That is a genuine divergence of persistence conditions — `Building`'s IC is therefore **not** reducible to `Property`'s. Guizzardi named this at S008 (Guizzardi+Baker Q4); I concur it is a real +O signal. For `Room`: a Room has a **unity criterion** independent of Building — a bounded interior space closed by its enclosing surfaces, individuated by location-within-Building + function (Guarino & Welty 2002 treat *bona fide* vs *fiat* boundaries here; a room is largely *bona fide*-bounded by walls/floor/ceiling, with fiat elements for open-plan). So prong (a) is **satisfiable** — Building and Room are not mere fiat-slices of Property.

**Is (b) met?** *No — today.* No consumer query in the corpus re-identifies a Building or Room *as an individual*. `numberOfFloors`, `roomDimensions`, `bedrooms`/`roomCount` (S008 Q4) are answered today by **datatype properties on `opda:Property`** with zero loss: nobody asks "is this the same Room across two surveys?" or "which Building does this Room belong to, transitively, for cross-Property reasoning?" Until such a query exists, the Room/Building IC distinguishes nothing a consumer observes — it is precisely the *decorative* commitment ODR-0001 A9 §(b) warns against. This is the same posture I took as Queen of S005: an IC must be stated *over hard cases a consumer faces*, not over hard cases that merely *could* be constructed.

**The OntoClean one-liner (for the FINAL MESSAGE):** *A part earns a class when it carries a segregated IC (unity + divergent persistence — met for Building/Room) AND a consumer re-identifies its instances by that IC (not met today).*

---

## Q1 — Promote `opda:Building` / `opda:Room` to classes now, or hold?

**HOLD.** The IC test's conjunct (a) is met — Building and Room carry segregated, +O identity criteria (Building's persistence diverges from Property's at ODR-0005 §3a hard-case 4; Room has a bona-fide-bounded unity criterion). But conjunct (b) is **not** met: no consumer query re-identifies Building/Room instances *qua* individuals. Promoting now mints a permanent URI (Baker's S008 asymmetry caveat — "minting a Class is asymmetric; the URI is permanent and downstream consumers will dereference") for an identity nothing yet reasons over, producing a class whose IC is decorative against ODR-0001 A9 §(b).

This is the **same gate** ODR-0005 §2a already set for sub-Property granularity ("Sub-kind granularity (Site / BuiltStructure / etc.) NOT committed … Deferred … gated on a named consumer query"). Building/Room are *exactly* that sub-Property granularity. To promote them now without the query is to override not just R3's procedural gate but the substantive ontological rule S005 ratified — and the OntoClean rationale for that rule (a kind is reified as a class when its identity is *exercised*) has not changed. I agree with Davis on timing; I record, against his position, that the *eventual* IC is sound and the divergence witness already exists, so this is a **deferral, not a denial**.

> **Citation.** Guarino & Welty 2002, *Evaluating Ontological Decisions with OntoClean*, Communications of the ACM 45(2) — the +O (carries-own-identity) and Unity meta-properties; the discipline that a type with no *distinct* identity work collapses into its supertype. Cross-ref ODR-0005 §2a (the consumer-query gate, which this generalises).

**Vote:** HOLD — `**Vote:** AGAINST` (promote-now). *(Against promoting today; FOR the deferral.)*

---

## Q2 — What is the firing trigger? (when does the gate open?)

**FOR the S008 trigger, sharpened to an *identity-reasoning* query, not merely a *Building/Room-mentioning* query.** S008 Q4 set it as "first named BASPI5 round-trip query exercising Building / Room reasoning **beyond Property aggregation**." OntoClean lets me state precisely what "beyond Property aggregation" must mean, so the trigger is falsifiable rather than a matter of taste:

The trigger fires when a consumer query meets **either** segregation witness:

1. **Cross-Property part identity.** A query that re-identifies the *same Building* across two Properties (e.g. a building subdivided into flats, each its own `opda:Property` per ODR-0005 §3a hard-case 2 "Subdivision", but sharing one physical Building) — i.e. a query whose answer requires `Building` to be an individual joined *across* Property instances. Datatype properties on Property **cannot** express this; it needs `Building` as a first-class node. (This is the flat-with-split-UPRN territory of ODR-0005 §7a, viewed from the building side.)
2. **Within-Property part re-identification over time.** A query that asks whether a Room/Building is the *same individual* across two dated surveys (Guizzardi's informational-Kind lineage at S008 Q4 — `Survey1 prov:wasDerivedFrom InspectionVisit1`; if a consumer joins survey results *per Room over time*, Room must bear identity).

A query that merely *aggregates* (counts rooms, sums floor areas, lists building parts of one Property) does **not** fire the trigger — aggregation is answered by datatype/structured properties on Property with no identity work, so the Room/Building IC stays decorative. The distinguishing test is the OntoClean one: *does the answer change depending on whether two Building/Room descriptions co-refer?* If yes → identity is exercised → fire. If no → aggregation → hold.

This sharpening protects the gate against premature firing on a query that *names* rooms but never *re-identifies* them. It also gives the Reduced Council a clean re-convene condition: the first such query is recorded, and a Reduced Council (Building/Room sub-Property promotion) convenes — mirroring Davis's S005 Q5 held-as-live re-open precedent and S008 Q4's 18-month review.

> **Citation.** Guarino 1998, *Formal Ontology and Information Systems*, §3 (the conceptualisation/ontology distinction — a class is justified by the conceptualisation a *consumer* commits to, not by what is metaphysically constructible). ODR-0005 §7a (subdivision / split-UPRN as the concrete cross-Property part-identity witness).

**Vote:** `**Vote:** FOR` (the sharpened identity-reasoning trigger; either segregation witness fires it).

---

## Q3 — Interim datatype treatment (how to model Building/Room *until* the gate fires)?

**FOR datatype/structured-property treatment on `opda:Property`, with a recorded `skos:scopeNote` flagging the deferred-class status — and NO premature mereological machinery.** Until the gate fires, the building/room information is adequately and losslessly carried as:

- **Quality-valued datatype properties on `opda:Property`** for the aggregate facts: `opda:numberOfFloors`, `opda:bedrooms`/`opda:roomCount`, `opda:internalArea` (already Guizzardi's S008 Q1 "intrinsic Quality of Property" cut; `internalArea` vs `grossExternalArea` as sibling predicates with IPMS scope-notes per Baker's S008 Q6). These are **Qualia-in-Region of Property** (DOLCE — Masolo et al. 2003, D18 §4.3), not reified individuals.
- **Structured datatype** (an `rdf:List` or repeatable blank-node structure with `sh:datatype`-constrained fields) for per-room dimensions where a form needs them — `roomDimensions` as a structured value, **not** a `Room` class. This is Baker's S008 Q4 default: "Default should be `xsd:` datatype property + `sh:datatype` constraint; class-mint is the reasoned move when both tests fire" — and only conjunct (a) of the two tests fires today.

**What I explicitly forbid in the interim** (OntoClean hygiene): do **not** introduce a part-whole object property (`opda:hasRoom`, `opda:partOfBuilding`) pointing at reified Room/Building individuals *before* the class is promoted — that smuggles in the very identity commitment the gate defers, and would create dangling individuals with no IC (an OntoClean violation: an instance asserted without an identity criterion). Mereology (`opda:Room opda:partOf opda:Building opda:partOf opda:Property`) is the **correct** model *once* both conjuncts fire — it is held, per ODR-0002 §Change-log Q11 (Kendall+Guizzardi CONDITIONAL OBO-RO mereology, routed to S005 IC discipline). Until then, the part structure lives as **datatype facts on the Property**, which is exactly OntoClean's prescription: model the part as an attribute of the whole until the part's identity is independently exercised.

This interim posture is **reversible and additive**: when the gate fires, the datatype properties are *re-homed* onto the new `Room`/`Building` classes via a `prov:wasDerivedFrom`-style migration note (the same discipline ODR-0005 §6a uses for UPRN succession), with no `owl:sameAs` and no loss. The deferred-class `skos:scopeNote` on each affected Property predicate records the open trigger so the re-home is mechanical, not archaeological.

> **Citation.** Masolo, Borgo, Gangemi, Guarino, Oltramari 2003, *The WonderWeb Library of Foundational Ontologies*, D18 §4.3 (Quality / Quale-in-Region — the category the interim datatype properties commit to) and §4.1 (Endurant / part-of — the mereology held for the promoted state). Guarino & Welty 2002, *OntoClean* (an instance must not be asserted without an IC — the rule that forbids premature reified Room/Building individuals).

**Vote:** `**Vote:** FOR` (datatype/structured treatment on Property + deferred-class scope-note; no premature mereology).

---

## Summary

| Question | Verdict | Citation anchor |
|---|---|---|
| Q1 — Promote now or hold? | **HOLD** (IC conjunct (a) met, (b) not met today) | Guarino & Welty 2002 (+O / Unity); ODR-0005 §2a gate |
| Q2 — Firing trigger? | **FOR** sharpened identity-reasoning trigger (cross-Property part identity OR within-Property part re-identification over time; aggregation does NOT fire) | Guarino 1998 §3; ODR-0005 §7a |
| Q3 — Interim treatment? | **FOR** datatype/structured on Property + deferred-class scope-note; NO premature reified part individuals | Masolo et al. 2003 D18 §4.3/§4.1; Guarino & Welty 2002 |

**Agreement with Davis (DA framing).** I align with Davis on the *timing* verdict (HOLD) and on the *gate* (a named consumer query). I differ in emphasis: Davis's published position (BBC/UK-Gov pragmatism — model what consumers query, nothing speculative) reaches HOLD *because no one asks*; I reach HOLD because the IC, though sound and segregated, is **not yet exercised** — a stronger ontological statement that (i) affirms the eventual class is correct, (ii) names the divergence witness (ODR-0005 §3a hard-case 4) that proves the IC is +O rather than inherited, and (iii) sharpens the trigger to *identity-reasoning* queries so the gate cannot be tripped by a merely Building/Room-*mentioning* query. No held-as-live dissent from me; this is a clean deferral with a falsifiable re-open condition.

**Pre-commitment for synthesis.** If the Queen records a verdict, it should state at the criteria level: *Building/Room carry segregated +O identity criteria (divergence witness: ODR-0005 §3a hard-case 4) but the IC is not yet consumer-exercised; HOLD under ODR-0005 §2a's consumer-query gate; re-open on the first identity-reasoning (not aggregation) query per Q2.* This keeps the promotion **deferred, not denied**, and leaves a mechanical re-home path (datatype → class) for when the gate fires.

**Cited published sources** (per ODR-0001 §Citation grounding):

- Guarino, N. & Welty, C. 2002, *Evaluating Ontological Decisions with OntoClean*, Communications of the ACM 45(2):61–65 (the +I/+O/Unity meta-properties; the rule that a type with no distinct identity work collapses into its supertype; instances require an IC). [Also the canonical OntoClean reference cited in ODR-0005 §References.]
- Guarino, N. 1998, *Formal Ontology and Information Systems*, Proc. FOIS'98, IOS Press, §3 (the conceptualisation/ontology distinction — a class is justified by the consumer's commitment).
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N. & Oltramari, A. 2003, *The WonderWeb Library of Foundational Ontologies* (DOLCE), D18 §4.1 (Endurant / part-of), §4.3 (Quality / Quale-in-Region).
- Guizzardi, G. 2005, *Ontological Foundations for Conceptual Modeling with Applications*, Ch. 4 (Substance Kind / Sortal supplying IC) — concurring with the S008 nomination of Building/Room as Substance-Kind-like parts.
