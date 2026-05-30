# Session 025 (R2) — Ian Davis, Devil's Advocate — Working Position

**Role:** Devil's Advocate (linked-data deployment at scale; BBC `/programmes/` and `/music`, 2009, `bbc.co.uk/ontologies/po`; UK-Gov / data.gov.uk publishing cookbook; ex-Talis). Publish-first: *Linked Data is about **publishing** the data you have, not re-modelling it into something tidier — and not pre-fragmenting it before a consumer forces the seam.*
**Methodology:** ODR-0001 §Roles — I ATTACK the proposition and find what fragmenting the module *now* breaks. Per ODR-0001 I MUST, per question, state a **withdrawal condition** and declare **WITHDRAW** or **HOLD**. I expect to lose votes; I lose them honestly.
**This session's target:** premature fragmentation. The proposition is to split monolithic ODR-0008 into UFO-axis sub-modules **ODR-0008a** (`property-qualities`) / **ODR-0008b** (`property-modes`) / **ODR-0008c** (`legal-estate-attributes`).

> **My one-sentence brief:** ODR-0008 §Q2a deliberately keeps the module **monolithic** and *spawns* sub-modules only on a **fired trigger** — §Q2a(a): "when Quality / Mode / Substance-Kind-label distinctions are **operationally load-bearing for consumer queries**." That trigger has **not fired**. The curated Category-G walk that would make the three UFO axes *countable* has **not happened** — only a 182-name **candidate** set exists, and it is a flat last-segment projection, not a UFO partition. Splitting now is splitting on a guess. I argue: **ratify the framework/criteria at most; do NOT mint ODR-0008a/b/c; keep ODR-0008 monolithic until a named consumer query needs Quality-vs-Mode entailment.**

---

## The governing fact: this council is running *against its own roadmap's stop-sign*

I open here because it is dispositive, and it is the project's own ratified text, not my opinion.

**ODR-0023 — the roadmap that scheduled this very session — classifies R2 as `GATED`, and names the trigger that has not fired, in three places:**

1. **§Rules, the roadmap table, R2 row:** *Trigger status* = **"GATED on the Category-G walk (ODR-0022) populating the axes."** Not "ready," not "soft" — **gated**.
2. **§Rules → Findings carried from S023, R2 bullet (verbatim):** *"R2 — gated, not deferred-forever. The G walk (ODR-0022, ~181 curated descriptive properties) is the event that makes the Quality/Mode/Substance-Kind-label axes countable; only then can §Q2a(a) judge whether the sub-module split is 'operationally load-bearing.' **Running R2 before the G walk would be guessing.**"*
3. **§Alternatives, rejected option (verbatim):** *"**Spawn all four ODRs now** — premature for R2/R3 (their triggers have not fired; running them is guessing) and wasteful (the G walk reshapes R2's input)."*

And §Sequencing: *"R2 and R3 stay **gated** — do not convene until their named trigger fires (R2: the G walk)."* And §Anti-pattern: *"Do not convene a gated session (R2, R3) without recording **which trigger fired**."*

**No trigger has fired, so none can be recorded.** I therefore note, on the record, that this session proceeds **provisionally under a directing-authority override of R2's gate** — which I respect as the authority's prerogative. But an override of the *convening* gate is not a discharge of the *substantive* trigger. §Q2a(a)'s "operationally load-bearing for consumer queries" is a condition on the *decision*, not merely on the *calendar*. The override lets us *meet*; it does not make Quality-vs-Mode load-bearing. My entire position is: **meet, ratify the framework, but do not mint the split the substantive trigger does not yet license.**

---

## Verified state I checked myself (not taken on trust)

| Claim I needed to test | Verified? | What I found |
|---|---|---|
| The Category-G walk has produced a **UFO-axis partition** (Quality / Mode / Substance-Kind) | ❌ **NO** | `descriptive-category-binning.json` (the categoriser's output, ADR-0030 §G1) has top-level keys `counts / total / candidate_g / residue / assignment`. `candidate_g` is `{distinct_name_count, names}` — **a flat list of 182 names**. There is **no** `Quality`/`Mode`/`Kind`/`axis`/`ufo` key anywhere. The three axes ODR-0008a/b/c are named for **do not exist as data**. R2's input is absent. |
| The 182 set is "**candidate**," not curated | ✅ | ADR-0030 build-status line (verbatim): *"counted **182 candidate** Category-G distinct names (validating ODR-0022's ~181 projection)."* §G1: the report writes *"the **candidate** Category-G set (182 distinct names)"* and the generator *"pointedly does **not** emit … the 182 Category-G permanent IRIs"* — they are *"reserved for the WG curated pass."* **The IRIs are deliberately unminted.** |
| The candidate set is actually a clean set of "genuine descriptive concepts of a Property" | ❌ **NO** | First 18 names include `accountName`, `accountNumber`, `amount`, `address`, `ageRange`, `applicationDate`, `applicationType`. These are **not** per-Property descriptive facts. `address` is **Category F** by ODR-0022's own rule (*"reuse ODR-0015 … **never** re-mint"*); `accountNumber`/`accountName` are payment fields; `applicationDate`/`applicationType` are search/application metadata. **The candidate set still contains leaves the curation pass will route OUT of G.** Splitting it now partitions noise. |
| ODR-0022's own flagship G exemplars are in the candidate set | ❌ **NO** | `currentEnergyRating`, `councilTaxBand`, `builtForm` — the three canonical **Quale-in-Region** examples named in ODR-0022 §G *and* the S008 §Q5a binding table — **do not appear** as distinct names in `candidate_g`. Nor do `tenureKind` or `ownershipType` (the S008 Substance-Kind/ownership exemplars; also my S023 phantom-`tenureKind` finding). **The set the categoriser produced and the set the ODRs describe do not agree.** R2 cannot place `currentEnergyRating` into ODR-0008a if it can't find it in G. |
| The counts are stable enough to partition | ⚠️ | Current `counts`: A 251 / B 86 / C 159 / D 315 / E 145 / F 158 / **G 379 leaves = 182 distinct**. These differ from ODR-0022's projections (A ~407, E ~200, F ~133). The binning is **still settling**; `residue` = 16 leaves not yet placed. You do not draw sub-module seams across a set whose membership is in flux. |
| §Q2a actually demands "operationally load-bearing **for consumer queries**" | ✅ | S008 record, Q2 synthesis (verbatim): *"when ≥1 sub-module's leaf-set populates such that Quality / Mode / Substance-Kind-label distinctions are operationally load-bearing **for consumer queries**, spawn ODR-0008a/b/c."* The trigger is a **consumer-query** condition, not a tidiness condition. **No consumer query has been exhibited** that needs Quality-vs-Mode entailment. |

These cut **one way** and I report it honestly because honesty is the role: the data that R2 exists to partition **is not there**. The axes are not countable; the candidate set is not clean; the flagship members are missing; the IRIs are reserved. Every check the roadmap said must pass before R2 is "not guessing" comes back **not-yet**.

---

## Q1 — Split ODR-0008 at all? (monolithic vs UFO-axis sub-modules)

### Attack — the working monolith has no consumer forcing a seam; YAGNI bites
ODR-0008 is a **working monolith**. It carries seven `## Operational specifications` subsections (Q1a–Q7a), a per-leaf binding table, a class-promotion test, a citation-grain discipline — all ratified 10-0 at S008, all coherent in one record. The proposition is to fracture it into three by UFO meta-category. My BBC `/programmes/` deployment (Davis, 2009) is the counter-case the brief points me to and I stand on it squarely: the Programmes Ontology is **one coherent ontology** spanning brands, series, episodes, versions, broadcasts, segments — facets that an academically-tidy modeller would have split into a "temporal module," a "publication module," a "service module." We did **not** fragment it by facet, because **fragmentation is a cost paid up-front against a benefit that only materialises when a consumer needs one facet in isolation** — and no such consumer existed, so the split would have been pure overhead: three namespaces to govern, three import graphs to keep consistent, three `depends-on` chains where a reasoner now has to load three documents to answer one question that lived in one. **"Don't split a working monolith until a consumer forces it"** is not conservatism; it is the 5★-LOD discipline that the *publication* is the deliverable, and a fragmented publication is harder to consume, not easier.

S008 Q2 already had this exact fight and resolved it **10-0 FOR "monolithic-for-now."** Guizzardi+Baker argued *for* the three UFO sub-modules then; they **lost 10-0**, and the compromise was the §Q2a *trigger* — split **only** when load-bearing. Re-running the split as the default at R2, before the trigger, is not honouring that compromise; it is quietly reversing a 10-0 verdict by treating "we scheduled a session to *check* the trigger" as "the trigger fired." It did not.

The deepest objection: **UFO meta-category is not a stable partition key for a TBox module boundary.** A single leaf can shift axis under refinement — `priceQualifier` is listed in the S008 binding table as *"Mode / Quality Value"* (it straddles two of the three axes by the ODR's own hand); `ownershipType` is a Quale-in-Region of `LegalEstate` (so does it live in ODR-0008a *qualities* or ODR-0008c *legal-estate*?). If the very examples the council wrote down **don't sort cleanly into the three bins**, then the bins are not a module boundary — they are an analytic lens, and you do not mint permanent `w3id.org` namespaces around an analytic lens that re-sorts under the next reasoner pass.

### Vote
**AGAINST** splitting ODR-0008 now. **FOR** keeping it monolithic until §Q2a(a)'s named consumer-query trigger fires. I do not oppose the *framework* (the three named axes + the named stewards are fine **as a spawn plan**); I oppose **executing** it absent the trigger.

### Withdrawal condition
I **WITHDRAW** the moment a **named consumer query is exhibited that requires Quality-vs-Mode (or vs Substance-Kind) entailment** — i.e. a query whose *correct answer-set differs* depending on whether a leaf is typed as a Quality or a Mode, reviewable in this session's synthesis (the same standard S008 Q6 set for hierarchy admission: a query whose answer changes under the distinction). Absent that one artefact, **HOLD** against the split. (This is the mildest possible hold: I am asking the proposition to satisfy *its own §Q2a(a) trigger*, not a new bar.)

### Citation
BBC Programmes Ontology (`po:`), Davis/BBC 2009 — one coherent ontology, **not** fragmented by facet; consumers dereference `/programmes/...` against a single model. ODR-0008 §Q2a (monolithic; spawn on fired trigger) + S008 Q2 **10-0 FOR monolithic** (the split lost once already). YAGNI / 5★-LOD (a fragmented publication costs every consumer; the cost of an unneeded seam exceeds the cost of a monolith that a future consumer *might* want split).

---

## Q2 — If split, per-axis trigger: which of the three axes is *individually* load-bearing now?

### Attack — none of the three axes is load-bearing, because the axis assignment does not exist
§Q2a(a) is precise: the spawn fires *"when **≥1 sub-module's leaf-set populates** such that [its] distinctions are operationally load-bearing."* This is a **per-axis** condition — at least one of `property-qualities`, `property-modes`, `legal-estate-attributes` must (a) have a *populated leaf-set* and (b) be *load-bearing*. I checked the only artefact that could populate them — the categoriser's binning report — and **there is no per-axis population at all.** `candidate_g` is one flat list. The categoriser binned leaves *into Category G*; it did **not** partition G *into the three UFO axes*. So for **every** axis, condition (a) fails: the leaf-set is not populated, because the partition that would populate it has not been computed. You cannot judge whether `property-modes` is load-bearing when you cannot yet say which of the 182 names *are* modes.

Take the axes one at a time, on the evidence:

- **ODR-0008a `property-qualities`** — would hold the Quale-in-Region leaves. But its three flagship members per ODR-0022 §G — `currentEnergyRating`, `councilTaxBand`, `builtForm` — are **absent from `candidate_g`**. So the module would be minted *not even containing the examples it was named for*. Population: **unverified**. Load-bearing: **unshown** (no query needs "all Qualities of this Property" as a typed set).
- **ODR-0008b `property-modes`** — would hold Mode/Relator leaves. But the S008 table's Mode exemplars (`priceQualifier`, `marketingTenure`) are flagged *"Mode / Quality Value"* — **they straddle**, and one of them (`priceQualifier`) is *"S007 territory"* (the listing Relator), i.e. arguably not ODR-0008's at all. Population: **contested at the membership level**. Load-bearing: **unshown**.
- **ODR-0008c `legal-estate-attributes`** — would hold `LegalEstate`-attached facts (`tenureKind`, `ownershipType`, `councilTaxBand`, `groundRent`, `serviceCharge`). But `tenureKind` and `ownershipType` are **absent from `candidate_g`** (my S023 phantom-`tenureKind` finding, now confirmed against the categoriser). Population: **unverified**. Load-bearing: **unshown** — and note this axis is really *attachment-class* (`LegalEstate` vs `Property`), which is **Kendall's four-way alternative held-as-live** (S008 Q2), a *different* split axis the council explicitly parked, not the UFO axis.

So per-axis: **zero of three** pass condition (a), and **zero of three** have an exhibited consumer query for condition (b). The honest finding is that R2 cannot run its own per-axis test because the per-axis data is the output of the very curation pass that gates it.

### Vote
**AGAINST** spawning **any** of the three axis sub-modules. There is no axis whose leaf-set is populated *and* load-bearing; both conjuncts fail for all three. If the council insists on ranking, the *least* unjustified is **none** — and the *most* dangerous is `legal-estate-attributes`, because it quietly conflates the UFO axis with Kendall's parked attachment-class four-way.

### Withdrawal condition
**Per axis**, I **WITHDRAW** against that *specific* axis the moment **both** hold for it: (1) the curation pass emits a **counted, UFO-typed leaf-set** for that axis (not the flat `candidate_g` list — an actual `{axis: [...]}` partition), and (2) a **named consumer query** is exhibited whose answer-set depends on that axis's distinction. Until a given axis has both, I **HOLD** against spawning *that* axis. (All three currently lack both → I hold against all three.)

### Citation
`descriptive-category-binning.json` (no axis partition; `candidate_g` is a flat 182-name list) + ADR-0030 §G1 ("candidate" set; G IRIs *"reserved for the WG curated pass,"* unminted). ODR-0008 §Q5a binding table (`priceQualifier` = *"Mode / Quality Value … S007 territory"*; the Mode exemplar straddles and may not even be ODR-0008's). S008 Q2 — Kendall's **four-way held-as-live** (attachment-class split ≠ UFO split; parked). My S023 finding (`tenureKind` absent from the canonical dict; now confirmed absent from `candidate_g`).

---

## Q3 — Now, or framework-only? (mint ODR-0008a/b/c vs ratify criteria + defer minting)

### Attack — minting now is irreversible on a set that is still a projection; framework-only loses nothing
This is the question where I can give the council a clean, honest landing, so let me be constructive rather than purely obstructive.

**Why minting now is the one genuinely costly mistake available tonight.** ADR-0030 is explicit that the generator **withholds** the 182 G IRIs precisely because they are *"permanent and unreversible"* (it cites ADR-0028 §14) and *"reserved for the WG curated pass."* If R2 mints ODR-0008a/b/c **now**, it does one of two bad things: either (i) it mints three **empty** module shells (axes with no curated members — governance overhead for nothing, three namespaces a reader must load to find they're stubs), or (ii) worse, it **forces** an axis assignment of the 182 *candidate* names in order to populate the shells — and since the candidate set still contains `address` (Category F), `accountNumber`, `applicationDate` (not Property facts at all), that forced assignment would **bake mis-binned leaves into permanent module memberships** before the curation pass that ejects them has run. ODR-0022 G1 is unambiguous: *"The ~181 G-set is a **projection** until the rule runs; it becomes a **counted set before any IRI is minted**."* Minting sub-modules around a projection violates G1 directly.

**Why framework-only loses nothing.** The three axis names, the three stewards (Allemang / Guizzardi+Pandit / Kendall), the per-axis trigger condition, and the criterion "split when a consumer query needs the distinction" — **all of that can be ratified tonight as the spawn specification**, and it costs nothing because §Q2a *already names them* and ODR-0023 *already schedules them*. Ratifying the framework sharpens the trigger (we can pin the exact form of the "named consumer query" each axis needs) **without minting a single permanent IRI**. That is the publish-first move: publish the *plan*, which is cheap and reversible; withhold the *terms*, which are expensive and permanent, until the data forces them. The asymmetry is the whole of my discipline: an unminted module you needed is a one-line schedule entry away; a minted module around a mis-binned projection is a permanent `w3id.org` namespace you cannot cleanly retract.

**The only thing framework-only gives up** is the satisfaction of "closing" R2 tonight — and ODR-0023 already tells us R2 is *gated, not deferred-forever*. Framework-only **is** the gate, honoured: keep the schedule entry live, ratify the criteria, re-convene to mint when the curated UFO-typed G set exists and one axis shows a load-bearing query.

### Vote
**FOR framework-only.** **AGAINST minting ODR-0008a/b/c now.** Ratify: the three named axes, the three stewards, the per-axis trigger (populated UFO-typed leaf-set **+** a named consumer query whose answer-set depends on the distinction), and the discipline that the curation pass must emit the axis partition *before* any sub-module IRI is minted. Mint **nothing** tonight.

### Withdrawal condition
I **WITHDRAW** my objection to *minting* the instant **all three** hold: (1) the curation pass has produced a **counted, UFO-typed** G partition (replacing the flat `candidate_g` projection), with the mis-binned non-Property leaves (`address`, `accountNumber`, `applicationDate`, …) **ejected**; (2) **at least one** axis exhibits a **named consumer query** whose answer-set depends on its distinction; (3) the mint is scoped to *that* axis (not all three reflexively). On all three, the split is *forced*, not *guessed*, and I drop the hold for that axis. Until then, **HOLD** against minting — **framework-only is my affirmative proposal, not merely my objection.**

### Citation
ODR-0022 §2 G1 (*"projection until the rule runs … counted set **before any IRI is minted**"*) + §6 anti-pattern (*"Do NOT collapse / pre-commit Category G … term-grain, one dereferenceable IRI per concept"* — minted **after** curation, not before). ADR-0030 §G1 + build-status (G IRIs *unminted, "reserved for the WG curated pass," "permanent and unreversible"*). ODR-0023 §Decision (*"ratified-as-scheduled behind a named trigger … It schedules; it does not itself make the ontological commitments"*) + §Consequences (*"R2 … remain trigger-gated; this roadmap is the place a reviewer checks before proposing them"*). UK-Gov / data.gov.uk cookbook — publish the plan (cheap, reversible); withhold the IRIs (expensive, permanent) until forced.

---

## Cross-talk

### To the axis-stewards (Allemang on qualities / Guizzardi+Pandit on modes / Kendall on legal-estate) — I am not attacking your axes, I am attacking the *clock*
You will, rightly, defend the *ontological soundness* of the three UFO axes — Quale-in-Region vs Mode vs Substance-Kind-label is a real and principled cut (Guizzardi 2005; the S011 seven-category framework), and I concede it without reservation. **My objection is not that the axes are wrong; it is that the set you would partition does not exist yet.** Guizzardi+Baker: you argued *for* exactly this split at S008 and lost 10-0 to the *trigger* compromise — and the trigger you accepted was "operationally load-bearing for consumer queries," not "ontologically distinguishable in principle." Everything is ontologically distinguishable in principle; that is why §Q2a uses a *consumer-query* trigger and not a *philosophical-distinctness* trigger. Give me one query whose answer changes under Quality-vs-Mode and you have me. Kendall: your axis (`legal-estate-attributes`) is the one I flag hardest — it is closer to your *own* parked **four-way attachment-class** alternative (`LegalEstate` vs `Property` attachment) than to the UFO axis, and conflating them would quietly resurrect a held-as-live dissent as a default. Keep them distinct.

**Where we converge:** the *framework* — three axes, three stewards, the per-axis trigger — I will sign tonight (Q3 framework-only). It is the *minting* I hold against, and the minting is the only part that is permanent. You lose nothing by ratifying the spawn-spec and withholding the IRIs until the curated G partition lands on your desks.

### To the Queen — what I am NOT contesting, so the record is clean
I do **not** contest: (a) the three UFO axes are a sound *eventual* partition; (b) the named stewards are right; (c) R2 is *gated, not abandoned* — it will run, and should, when its trigger fires; (d) the directing-authority override of the *convening* gate is the authority's prerogative and I respect it. My live contribution is **one structural fact + one constructive alternative**: the fact that the **UFO-axis partition of Category G does not exist** (the categoriser produced a flat 182-name *candidate* list, IRIs deliberately unminted), and the alternative that the council **ratify the framework and mint nothing** — which honours §Q2a(a)'s trigger, ODR-0022's G1 "counted-before-minted," and ODR-0023's "schedules, does not commit," all at once. Pass framework-only and I have no dissent left to carry.

---

## Scorecard — votes + WITHDRAW/HOLD

| Q | Vote | Withdraw / Hold | Named withdrawal condition |
|---|---|---|---|
| **Q1 — Split at all?** | **AGAINST** splitting now; **FOR** monolithic until trigger | **HOLD** against the split | A **named consumer query requiring Quality-vs-Mode (or vs Kind) entailment** — answer-set differs under the distinction (the §Q6 standard). Absent it, hold. |
| **Q2 — Per-axis trigger** | **AGAINST** spawning **any** of the three axes | **HOLD** against all three (each fails *populated* **and** *load-bearing*) | **Per axis**: a **counted, UFO-typed leaf-set** for that axis (not flat `candidate_g`) **+** a named consumer query whose answer depends on its distinction. Withdraw per-axis as each gets both. |
| **Q3 — Now or framework-only** | **FOR framework-only**; **AGAINST minting** ODR-0008a/b/c now | **HOLD** against minting (framework-only is my affirmative proposal) | Curated **UFO-typed** G partition exists (mis-bins ejected) **+** ≥1 axis shows a load-bearing query **+** mint scoped to that axis. Then mint *that* axis. |

## The line I hold (one sentence)
**I do not contest that the three UFO axes are a sound eventual partition or that R2 will rightly run when its trigger fires — but I HOLD, in the mildest possible form, that the council must ratify the framework and mint *nothing*, because §Q2a(a)'s "operationally load-bearing for consumer queries" trigger has not fired, the curated UFO-axis partition of Category G does not exist (the categoriser produced a flat 182-name *candidate* list with `address`/`accountNumber`/`applicationDate` still mis-binned and the flagship `currentEnergyRating`/`councilTaxBand`/`builtForm`/`tenureKind` absent, IRIs deliberately unminted), and ODR-0023's own roadmap says in plain words that "running R2 before the G walk would be guessing."**
