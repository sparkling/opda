# Session 021 — Ian Davis, Devil's Advocate — Working Position

**Role:** Devil's Advocate (linked-data deployment at scale; BBC `/programmes/`; UK-Gov / data.gov.uk; ex-Talis). Publish-first.
**Methodology:** ODR-0001. Per ODR-0001 I MUST WITHDRAW or HOLD on every contested question with a named condition.
**Stance:** I am the credible OPPOSITION to the architect's two claims — I defend **deriving-from-the-artifact** (the profiles), and I attack the **plan's scope** harder than I attack anyone's ontology.

> The architect says (A) overlays should ONLY validate, not define the ontology; (B) bounded contexts belong to the ontology, not the SHACL schemas — deriving from forms is an inversion. I say: the council already answered B **7–0 twice** (S019 R1, S020), and the plan in front of us is trying to boil the ocean off the back of a single emitted profile that is itself mis-wired.

---

## Verified state I checked myself (not taken on trust)

| Claim | Verified? | Evidence |
|---|---|---|
| `opda:overlaysContext` mis-points at the profile-LAYER IRI | ✅ | `profiles.py:250` → `URIRef("https://w3id.org/opda/profiles/foundation")`. The ONLY context edge in the graph points at a layer, not a context. The derived map is **empty/broken today**. |
| Only 1 profile emitted | ✅ (worse than briefed) | `source/03-standards/ontology/profiles/` holds exactly `baspi5.ttl`. **19** overlay JSON forms exist in `…/v3/overlays/` → ~18 main profiles UNWRITTEN, not "5/6". The derivation substrate is **1-of-~18**. |
| Nothing bounded-context emitted | ✅ | Zero `servesContext` / `definedInContext` / `consumesFrom` / `BoundedContextScheme` triples in any source TTL. No `opda-contexts.ttl`. ADR-0026 **written, not executed**. |
| Descriptive 935-leaf walk NOT executed | ✅ | `opda-descriptive.ttl` = 5 class-promotions (Comparable/EPCCertificate/Survey/Valuation/Search), **0 datatype properties**. Only the BASPI5 subset (G11: 17 property + 2 agent) landed. |
| The entire derivation INPUT today | ✅ | `baspi5.ttl` `opda:requires` = exactly **7 classes** (Address, Buyer, EPCCertificate, LegalEstate, Property, Seller, Survey). That 7-edge set — mis-wired — is the WHOLE map. |
| Programme retired on ONE round-trip | ✅ | ADR-0005 §G final amendment: "PROGRAMME RETIRED… MVP round-trip cleared." The bar was a single BASPI5 round-trip, **never full coverage**. New work = fresh ADRs. |
| Homonyms attested | ✅ (S019) | duplicate-prefLabel = **0**; same-label/two-definition = 1, free-text boilerplate. `definedInContext` has **zero** live targets. |

These facts are my ammunition. They cut one way: the artifact (profiles) is the maintained thing; everything else is prospective or hand-work.

---

## Q1 — MEMBERSHIP AUTHORITY (authored at ontology layer / derived from overlays / hybrid?)

### Attack
The architect's Claim B — "bounded contexts belong to the ontology, not the SHACL schemas; deriving from forms is an inversion" — **is a re-litigation of a closed question.** S019 Round 1 went **7–0 AGAINST** hand-authored membership and **7–0** that an entity belongs to many contexts (the forcing function: one IRI, one namespace → multi-membership forces duplication or forbidden `owl:sameAs`). S020 reaffirmed it: Rule 5 firewall, "derive-don't-declare." ODR-0019 Rule 3 is normative text: *"Which terms serve which context is **derived** from the SHACL overlay profiles… a generated view, never hand-edited. The profiles are the single source of truth."*

So I put the demand the brief tells me to put, to **evans-vernon, guizzardi, baker**:

> **Name the non-form, non-hand-authored authoritative source for membership. If you cannot, you are proposing exactly the hand-maintained second-source-of-truth ODR-0019 Rule 3 and ODR-0020 Rule 4 deliberately killed.**

There is no such source. "The ontology" is not a source — it is the *output*. The profiles are the only **falsifiable, dereferenceable, maintained** artifact: a `ValidationContext opda:requires <term>` edge is a fact a payload either satisfies or fails. This is the BBC `/programmes/` lesson — membership ("this brand is in this genre") was *derived from the schedule data that already existed and was already maintained*, never a parallel hand-curated genre-membership table, because the parallel table rots the instant a programme moves. A form moving context (e.g. an NTS leaf migrating Estate Agency → Material Information) updates membership **for free** under derivation and **silently rots** under hand-authoring.

The architect's framing inverts cause and effect. Deriving membership from the profiles is not "letting SHACL define the ontology." The ontology **defines the terms** (their Kinds, their `dct:source`, their identity criteria — all authored in the TBox); the profiles **observe which perspective uses which term**. Use is not definition. ODR-0020 Rule 5's firewall is exactly this distinction: the six contexts ARE `skos:Concept`s authored in the scheme; a domain term is NEVER `skos:inScheme` — it merely *points* via a derived `servesContext` annotation. Authoring the contexts ≠ authoring the membership.

**Where I concede ground to the architect:** the *concepts themselves* (the six `skos:Concept`s, their labels, definitions, stewards) ARE authored at the ontology layer — ODR-0020 Rule 1 says so, ADR-0026 §1 emits them. And `opda:definedInContext` (the genuine-homonym escape hatch, ODR-0019 Rule 4(i)) IS hand-applied. So the honest answer is **"hybrid, but the split is already drawn and is NOT 'author the membership'":** author the *scheme + concepts + the zero-to-few homonym `definedInContext` triples*; **derive the membership** (`servesContext`) from the profiles. That is ODR-0020 verbatim. The architect's "ontology-layer ownership of membership" loses.

### Vote
**AGAINST** authoring membership at the ontology layer. **FOR** derivation (`servesContext` from corrected `overlaysContext` + `requires`), with the already-ratified authored slice (scheme, six concepts, homonym `definedInContext`). This is ODR-0020 Rule 4/5 — no amendment needed.

### WITHDRAW / HOLD
**HOLD against hand-authored membership.**
**Withdrawal condition:** I withdraw the instant the architect (or evans-vernon / guizzardi / baker) names a **specific, dereferenceable, independently-maintained non-form source of truth for `servesContext` membership** that is NOT a hand-curated table and does NOT require manual update when a form changes context. Absent that named source, the HOLD binds and ODR-0020's derivation stands. (I expect no such source exists — so this is effectively a settled "derive" with a courtesy door.)

### Citation
ODR-0019 Rule 3 + Rule 5 firewall + Alternative "Hand-authored SKOS membership tags — Rejected"; ODR-0020 Rule 4 (bucket D) + Rule 5 + Alternative "Hand-author `servesContext` — Rejected"; S019 R1 tally 7–0; S020 Queen synthesis ("derive… kernel UNTAGGED"). Evans 2003 (Published Language is *unowned* — the contexts don't own the shared term, they use it). BBC `/programmes/` derived-membership precedent (Davis/Talis).

### ⟳ MOVEMENT IN CROSS-TALK — the predicate split (I was moved; recorded honestly)

Evans-Vernon and Guizzardi independently put the SAME strong argument and **moved me on a sub-point**. The split, which I now accept:

- **`servesContext` (USAGE)** — "instances appear on payloads validated under overlay C." Anti-rigid, many-valued, externally-dependent. **DERIVE** (my win; they both conceded it). A form CAN falsify a usage claim — the CONSTRUCT just stops emitting the edge.
- **`definedInContext` (HOME)** — "this Universal was *individuated* within community C." Functional, one-home-per-Kind, **true at mint-time**. A form can NEVER falsify a home claim, because the form never encoded home. So `definedInContext` is **"authored vs ABSENT," not "authored vs rots."**

**What I concede:** my anti-rot argument was aimed at *usage* membership and does **not** reach the *home* relation — different relation, different falsifiability. Guizzardi's category-slip test ("'required by form F' is sound for usage but a slip for home — Address is required by ~10 forms, individuated in none") is correct; I accept it unreservedly. And the textual reading is theirs: **ODR-0019 Rule 8's MUST-NOT-build object is enumerated as *machinery*** ("per-context `skos:scopeNote` registries, SKOS-XL label resources, a sense register") — the bare `definedInContext` annotation is **not** in that list. Recording a home is ordinary Context-Map authoring (Evans 2003 ch.14), not polysemy scaffolding. So 8(a)'s ≥3-collision trigger gates the machinery, not the annotation. Their further point also lands: at zero homonyms, gating `definedInContext` to Rule 8 emits it on ZERO terms → `servesContext` becomes the system's SOLE home-locating relation, which is the rigidity violation OntoClean forbids.

**What I still HOLD (narrowed):** I accept `definedInContext` is **authored-not-derived**, **always-emittable per-minted-term from the leaf's own `dct:source`** (Guizzardi's mechanism — ~one annotation per Universal, no new machinery), and **defaulted to the foundation home as ONE rule** for the 935 descriptive leaves with a short exception list (Evans-Vernon point 2). I refuse only **Evans-Vernon's TOTAL-COVER CI as a day-one build-breaker** — an "un-homed term FAILS THE BUILD" gate presupposes the 935-leaf walk is *complete*, which couples the one-day context emission to a months-long programme (today: 0 of ~42 classes carry `definedInContext`; the walk emitted 0 datatype properties). **Withdrawal condition on the last point:** flip TOTAL-COVER from a build-breaker to an **incremental completeness report** that goes green as terms get homed — then I have zero daylight with either of them. Home-tagging **rides each term's emission whenever the walk resumes**; it does not gate Increment 1.

**Net Q1 verdict (refined):** Membership authority is a **clean split** — `servesContext` DERIVED (settled, 7–0 twice); `definedInContext` AUTHORED, dormant, emitted opportunistically per-minted-term, NOT gated on homonyms, NOT a day-one coverage build-breaker. The architect's "ontology-layer ownership of *membership*" still loses (usage is derived); but the architect's instinct that *home* is authored-at-the-ontology-layer is **correct for `definedInContext`** — and was always compatible with ODR-0019/0020. No amendment to ODR-0020 is required; this is a clarification that `definedInContext` emission is not blocked by Rule 8(a). If the council wants it on the record, a one-line ODR-0019 Rule 8 clarification ("the gate binds the *machinery*; the bare `definedInContext` annotation is authorable below the gate") would suffice — an inline amendment, not a new ODR.

---

## Q2 — PLACEMENT METHOD & COVERAGE (complete method to place EVERY entity)

### Attack — SCOPE CREEP, head-on
The goal says "place EVERY entity in its correct context." **Why is "every" suddenly the bar?** The programme retired (ADR-0005 §G) on a **single BASPI5 round-trip**. The MVP gate was never coverage. Nobody has named a consumer who needs all ~42 classes + 23 schemes tagged. ODR-0019 **Rule 8** is the binding YAGNI gate, and S020 recorded *my* dissent as binding: *"nothing beyond the flat 6 built until a consumer query the 6-flat + org-model cannot satisfy."*

So the demand, per brief, to the whole council:

> **Who is the named consumer of the full context map? Name the query that the BASPI5-only slice cannot answer. If you can't, "place every entity" violates Rule 8 and my S020 binding dissent.**

There is a deeper problem the "complete method" hides: **placement is mostly NOT a decision — it's a derivation, and the derivation has almost no input.** Under ODR-0020 Rule 4, an entity's bucket is *read off* how it reaches the graph:
- Bucket A/B (`servesContext`): **mechanical** from `overlaysContext`+`requires`. But today that input is **7 classes from 1 mis-wired profile.** You cannot "place every entity" by derivation when ~18 of ~18 profiles that would supply the edges **do not exist.** The method is sound; the *fuel* is 1-of-18.
- Bucket C (`consumesFrom` an Organisation): authored, but tiny and stable (5 upstream authorities, ODR-0020 Rule 2).
- Bucket D (untagged): **the default for everything no profile requires** — "absence-of-tag is the kernel/scaffolding signal" (Rule 4). Most of the 42 classes are bucket D *and correctly carry no edge at all.*

So "a complete method to place every entity" is a category error dressed as rigour. The correct method is: **author the 6 concepts; fix `profiles.py:250`; turn the derivation on for the profiles that exist; leave everything else UNTAGGED (bucket D) until a profile or a named consumer pulls it in.** "Placing every entity" by hand-walking 42 classes into contexts is precisely the drift-prone hand-authoring Q1 rejected — it just wears a "completeness" costume.

### Vote
**AGAINST** any "place every entity" pass. **FOR** the four-bucket derivation method with bucket-D-by-default, fuelled by *whatever profiles exist*, expanded only as profiles land or a consumer names a gap.

### WITHDRAW / HOLD
**HOLD against complete-coverage placement.**
**Withdrawal condition:** I withdraw when someone names **a real consumer query that the BASPI5-slice-derived map plus the bucket-D default cannot answer.** On the naming of that query, I concede placement for *exactly the entities that query touches* — not the whole corpus. (ODR-0019 Rule 8; my S020 binding dissent.)

### Citation
ODR-0019 Rule 8 (verbatim activation gate); ODR-0020 Rule 4 bucket D + "kernel terms are NEVER blanket-tagged"; S020 Outcome ("Davis's YAGNI gate binds"); verified: 7 `requires` edges, 1-of-18 profiles, 0 emitted context triples.

---

## Q3 — MISSING-ONTOLOGY CREATION & SEQUENCING (935-leaf walk + ~14 emitters; block or independent?)

### Attack — DO NOT BUNDLE THE OCEAN INTO THIS PLAN
Two distinct bodies of missing work are being smuggled together:
1. **The bounded-context emission** — `opda-contexts.ttl` (6 concepts) + the `profiles.py:250` fix + dormant CONSTRUCT. This is **ADR-0026, already written, ~a day's work, self-contained.**
2. **The ~18 unwritten profile emitters + the 935-leaf descriptive walk.** This is *months*, and crucially **ADR-0026 itself disclaims it as downstream** ("the term→context map is incomplete until the five unwritten form-profile emitters land… downstream work").

Conflating them is the trap. The honest dependency is: **the context scheme does NOT block on the profiles, and the profiles do NOT block on the context scheme.** ADR-0026 ships the scheme + corrected wiring for the *one* profile that exists + the *dormant* derivation. The derivation being **dormant** (ODR-0019 Rule 8) is the whole point — it doesn't NEED the other 17 profiles to ship; it sleeps until a consumer wakes it, by which time however many profiles exist supply however many edges.

The 935-leaf walk is a **red herring for THIS council.** It belongs to ODR-0008's descriptive backlog (ADR-0005 §G11 closed BASPI5's slice; "the rest land per downstream BASPI5/TA6/NTS/LPE1 overlay demand. Engineering choice per-leaf, not Council route"). Dragging it into the bounded-context plan is how a one-day scheme emission becomes a six-month programme that never ships. **Bounded-context emission is independent of and must not block on the descriptive walk or the profile backlog.**

> To **allemang** (ally-pressure): you'll say "derive, generator-first" — and you're right. But press the question on yourself: is even *deriving* over-scoped if we author 6 concepts and emit a CONSTRUCT that, run today, produces **at most 7 `servesContext` edges from 1 mis-wired profile**? My answer: no — because emitting the scheme + fixing the bug + shipping the rule **dormant** is cheap, correct, and unblocks nothing it shouldn't. But emitting it and then *also* committing to write 18 profiles + walk 935 leaves "to make the map complete" is the over-scope. Hold the line at: scheme + bug-fix + dormant rule. Stop.

### Vote
**FOR** bounded-context emission (ADR-0026) as an **independent, non-blocking** increment. **AGAINST** bundling the 935-leaf walk or the ~18 profile emitters into the bounded-context plan or making either a blocker/gate.

### WITHDRAW / HOLD
**WITHDRAW** my objection to *creating the context scheme* — it is cheap, ratified (ODR-0020), and ADR-0026 already specifies it. I do not oppose that work.
**HOLD** against sequencing the 935-leaf walk / 18 profiles as part of, or a precondition of, this plan.
**Withdrawal condition (for the HOLD):** I withdraw if a named downstream consumer needs a *specific* additional profile or descriptive leaf-set — in which case write *that* profile / *those* leaves, not all 18 / all 935. Coverage follows demand, never precedes it.

### Citation
ADR-0026 §Consequences ("incomplete until the five unwritten… downstream work") + Decision Outcome item 4 (dormant); ADR-0005 §G11 ("per downstream demand. Engineering choice per-leaf, not Council route"); ODR-0019 Rule 8.

---

## Q4 — ODR/ADR SCAFFOLDING (new ODR vs amend? fresh ADR(s)? Enumerate.)

### Attack — RECORD PROLIFERATION FOR CEREMONY
We already have **ODR-0019** (pattern), **ODR-0020** (scheme + mapping), and **ADR-0026** (emission). That is the complete decision surface. A *new* ODR for "the implementation plan" would mint a record for a decision **already made** — ODR-0020 + ADR-0026 cover concepts, exclusions, the 4-bucket rule, the firewall, the generator, the `profiles.py` fix, and the dormant rule. The ODR/ADR boundary S020 itself drew (*"if a fact about the domain changes when stated differently → ODR; if only bytes change → ADR"*) tells us a *plan* is neither — it's project sequencing, which lives in **ADR-0005 §G-style register entries**, not a fresh ODR.

So I press: **what new domain fact, or what new byte-level decision, is NOT already in ODR-0019 / ODR-0020 / ADR-0026?** If the answer is "none," we do not mint. We *execute* ADR-0026 and, at most, add a register row.

**What I'd accept as genuinely new:**
- **A fresh ADR for the profile-emitter backlog** — IF and WHEN someone commits to writing profiles ta6/lpe1/fme1/piq/etc. That is real byte-level work with its own sequencing (ADR-0026 already flags it as "their own ADR or the descriptive-layer backlog"). But it's triggered by demand, not minted now.
- **An inline amendment to ADR-0026** (not a new record) if the `profiles.py:250` fix needs `opda:profileLayer` retained as a distinct predicate — ADR-0026 §3 already anticipates this.
- **An ADR-0005 §G-style register entry** to track "bounded-context emission executed; 17 profiles + 935 leaves remain demand-deferred." This is the deferred-work discipline that *already* exists (G1–G21 precedent) — use it, don't reinvent it.

A new ODR-0021 for "implementation plan" is ceremony. **Don't mint it.**

### Vote
**AGAINST** a new ODR. **FOR** executing ADR-0026 + (a) inline ADR-0026 amendments as needed, (b) a fresh ADR *only* when a profile-emitter backlog is actually picked up, (c) an ADR-0005 §G register row for the deferred remainder.

### WITHDRAW / HOLD
**WITHDRAW** opposition to ADR-0026 execution (it's ratified and correct).
**HOLD** against a new ODR and against pre-minting a profile-backlog ADR.
**Withdrawal condition:** I withdraw the HOLD-against-new-ODR if a contested **domain fact** surfaces that ODR-0020 does not already settle (e.g. a genuine 7th context with an overlay, or an attested homonym tripping Rule 8(a)+(b)) — *that* would be a new ODR, correctly. I withdraw the HOLD-against-backlog-ADR when a profile is actually being written.

### Citation
S020 ODR-vs-ADR boundary rule; ODR-0020 + ADR-0026 coverage; ADR-0005 §G deferred-work register precedent (G1–G21); ADR-0026 §3 (`opda:profileLayer` already anticipated).

---

## Q5 — IMPLEMENTATION PLAN (phase/sequence + gates)

### Attack — demand a MINIMAL, time-boxed, shippable Week-1 increment
A "phased implementation plan" with "complete coverage" gates is the boil-the-ocean failure mode. Publish-first says: **what ships this week and gets exercised?** Everything else is a watching brief.

The plan must be inverted from "phases toward completeness" to "smallest correct thing that ships, then demand-driven increments."

### The LEANER plan I endorse (and will hold the council to)

**Increment 1 — SHIPPABLE NOW (the only thing I'd gate as "must ship"):** Execute ADR-0026 exactly as written.
- Emit `opda-contexts.ttl`: `opda:BoundedContextScheme` + 6 `skos:Concept`s (labels/definitions/stewards from the `/modelling/bounded-contexts` table — already authored prose, zero new deliberation).
- Declare `opda:servesContext` / `opda:consumesFrom` / `opda:definedInContext` as `owl:AnnotationProperty`.
- **Fix `profiles.py:250`** → `opda:EstateAgencyContext` (the bug fix; precondition for any derivation ever working).
- Author the dormant SHACL-AF CONSTRUCT in `shapes.py`, **excluded from the active validation set** (ODR-0019 Rule 8).
- Re-pin byte-identity baseline; foundation `owl:versionInfo` bump.
- **Gate:** structural tests in ADR-0026 §Confirmation (1 scheme, 6 concepts, firewall holds, `baspi5.ttl` emits `overlaysContext opda:EstateAgencyContext`, CONSTRUCT parses + fires zero results on the 15 exemplars). Byte-identity green on 2nd run.
- **Cost:** ~1 day. **What gets exercised:** the scheme is dereferenceable, the one real profile is correctly wired, the derivation is proven to parse and stay dormant. **This ships and is used.**

**Increment 2 — WATCHING BRIEF (do NOT build now):** the ~17 remaining profile emitters + the 935-leaf descriptive walk.
- **Trigger:** a named consumer needs a specific form's context coverage, OR a downstream module ADR cites a profile that doesn't exist (the ADR-0005 §G8 pattern).
- **When triggered:** write *that* profile (re-using the now-correct `CONTEXT_OF` map ADR-0026 §3 ships ready), which *automatically* extends the derived map for free. No re-deliberation.
- **Gate:** none needed up front — it's demand-pulled, one profile at a time.

**Increment 3 — DORMANT-RULE ACTIVATION (do NOT build now):** turn the CONSTRUCT on / promote to active validation.
- **Trigger:** ODR-0019 Rule 8 — a named term-grain consumer issues `?term opda:servesContext ?ctx` that the dormant view can't satisfy.
- **Gate:** the Rule 8 named-consumer test. Until then it sleeps.

**No "place every entity" phase. No "complete the map" gate. No new ODR.** The deferred remainder gets ONE ADR-0005 §G register row.

> I'll say it plainly to the Queen: the temptation here is to treat the bounded-context work as a programme. It is not. It is a one-day emission of 6 concepts + a one-line bug fix + a dormant rule, sitting behind a ratified YAGNI gate. The 935 leaves and 17 profiles are real work that real demand will pull — but pulling them *now*, unbidden, to make a map "complete" that no consumer reads, is exactly the hand-maintenance-by-another-name that ODR-0019 outlawed.

### Vote
**FOR** Increment-1-only as the shippable plan, with Increments 2–3 as triggered watching briefs. **AGAINST** any plan whose gates require coverage of the corpus, the profiles, or the descriptive walk.

### WITHDRAW / HOLD
**WITHDRAW** all opposition to **Increment 1** — it is ratified, cheap, correct, and ships.
**HOLD** against gating the plan on completeness and against building Increments 2–3 ahead of their triggers.
**Withdrawal condition:** each later increment's HOLD lifts on its named trigger firing (a named consumer / a citing ADR / a Rule 8 term-grain query) — and then for *that increment's scope only*, never the whole corpus.

### Citation
ADR-0026 Decision Outcome (5 work items) + §Confirmation (the gate); ODR-0019 Rule 8; ADR-0005 §G (register discipline + demand-deferral precedent); S020 Outcome (my YAGNI gate binds).

---

## Scorecard — votes + WITHDRAW/HOLD

| Q | Vote | Withdraw / Hold | Named withdrawal condition |
|---|---|---|---|
| **Q1 Membership authority** | **SPLIT** (post-cross-talk): `servesContext` DERIVE (won 7–0×2); `definedInContext` AUTHORED, dormant, emitted opportunistically per-minted-term, NOT gated on homonyms | **HOLD** vs hand-authored *usage*; **WITHDRAWN** the anti-rot objection to authoring *home* (`definedInContext`); **HOLD** only vs TOTAL-COVER-CI-as-build-breaker | (usage) a non-form maintained source for `servesContext` — none expected. (home) flip TOTAL-COVER CI from build-breaker → incremental completeness report; then zero daylight with Evans-Vernon/Guizzardi. |
| **Q2 Placement & coverage** | **Against "every entity"**; FOR 4-bucket derivation + bucket-D default | **HOLD** vs complete-coverage placement | A named consumer query the BASPI5-slice + bucket-D map cannot answer → place *only* the entities that query touches. |
| **Q3 Missing-ontology & sequencing** | FOR context emission as **independent/non-blocking**; against bundling 935 leaves / 18 profiles | **WITHDRAW** on context-scheme creation; **HOLD** on bundling the walk/profiles | A named consumer needs a *specific* profile/leaf-set → write that one, not all. |
| **Q4 ODR/ADR scaffolding** | **No new ODR**; execute ADR-0026 + inline amendments + ADR-0005 §G row; fresh ADR only when profile backlog is picked up | **WITHDRAW** on ADR-0026; **HOLD** vs new ODR & pre-minted backlog ADR | A contested *domain fact* ODR-0020 doesn't settle (true 7th context / Rule-8 homonym) → then a new ODR. |
| **Q5 Implementation plan** | **Increment-1-only ships**; 2–3 are triggered watching briefs | **WITHDRAW** on Increment 1; **HOLD** vs completeness gates & early 2–3 | Each later increment lifts on its named trigger, for that increment's scope only. |

## The minimal shippable increment I endorse (one line)
**Execute ADR-0026 verbatim: emit `opda-contexts.ttl` (1 scheme + 6 concepts + 3 annotation predicates), fix `profiles.py:250` → `opda:EstateAgencyContext`, ship the SHACL-AF CONSTRUCT dormant, re-pin byte-identity. ~1 day. Everything else — 17 profiles, 935 leaves, rule activation, the "complete map" — is a demand-triggered watching brief, tracked in one ADR-0005 §G row. No new ODR.**
