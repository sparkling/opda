# Council Session 043 — Transaction lifecycle phase + ufoCategory dereferenceability (Full Council)

- **Date:** 2026-06-15
- **Records:** amends **ODR-0007** §Rules (realises `opda:transactionStatus`); **confirms** ODR-0030 Rule 7b + ODR-0031 §Confirmation/R4 (the `/pdtf/ufoCategory` dereference is an execution gap against standing rules — **no new ODR**); records the Q5 site-model surfacing decision as an ODR-0031 note. Resolves the two engineering follow-ups left after deploy fix `4905c6b`.
- **Queen:** Elisa Kendall (OMG / EDM Council; FIBO; *Ontology Engineering* 2019 — "does it serve a named consumer at warranted cost?").
- **Devil's Advocate:** Ian Davis (BBC / UK-Gov linked-data; publish-first / scope-discipline — genuinely opposed to BOTH "mint it now" framings; OPDA-weighted DA per the adoption record).
- **Panel:** Giancarlo Guizzardi (NEMO / UniLu — UFO phase/Relator, endurant-vs-perdurant), Luc Moreau (KCL — PROV-O event-vs-state, pre-elected), Tom Baker (DCMI — SKOS scheme governance, OPDA-weighted), Fabien Gandon (W3C / Inria — linked-data dereferenceability + OWL annotation semantics).
- **Voices:** 6 across 6 teammates (Queen + DA + 4 panellists).
- **`consensus-mode`:** `agent-fan-out` (file-based positions in `working/session-043/` + anticipatory cross-talk; queen-composed synthesis — the synchronous `Agent` tool cannot set `team_name`, so live `SendMessage` Agent Teams was unavailable; transport fell to file-based per methodology §Cross-talk transport).
- **Format:** Full Council (~6 runs).
- **Input:** `working/session-043/BRIEF.md` + the five position files; ODR-0007, ODR-0011 §8a, ODR-0030 (R7b), ODR-0031 (§Confirmation/R4), ADR-0045; session-011, session-032; the three exemplars (`chain-of-transactions`, `lease-extension-transaction`, `simple-transaction-with-milestones`); `scripts/ontology-model.mjs`; `src/lib/ontology-model.ts`; `opda-annotations.ttl`.

## Context

The 2026-06-15 deploy fix (`4905c6b`) removed three transaction exemplars' borrowed `opda:status` (a Search-domain predicate) and guarded the `/pdtf/ufoCategory` shape links, leaving two modelling questions deliberately unresolved and flagged as "future ODR/council call". This session resolves both: **(A)** whether/how a Transaction expresses lifecycle phase, and **(B)** whether the inert annotation property `opda:ufoCategory` should dereference. Two genuinely-split clusters (UFO-phase + PROV vs SKOS-governance vs linked-data/OWL-annotation), so Full Council; pre-flight = ratify-as-is. The decisive empirical findings the panel verified: `opda:TransactionStatusScheme` (Listed/Offered/Accepted/Exchanged/Completed) **already exists** but no property carries it; `chain-of-transactions` and `lease-extension` carry **no reified milestones** (so a derive-only phase leaves them stateless); the proposed coarse tokens collide with `opda:ParticipantStatusScheme`; and `scripts/ontology-model.mjs` extracts every resource kind **except `owl:AnnotationProperty`**, so `/pdtf/ufoCategory` 404s against a standing ODR-0030 R7b / ODR-0031 §Confirmation mandate.

---

## Question 1 — Direct lifecycle-phase property, or phase derivable only from reified milestones?

**REVISE/AFFIRM 3–1–2 FOR — mint a single current-phase property on the `opda:Transaction` Relator AND retain reified milestones; where a milestone event-log exists, the phase is a derived projection (`prov:wasDerivedFrom` the terminal milestone). Davis (DA) HOLDS "mint nothing".**

**Guizzardi:** REVISE / FOR. "A Phase is an *anti-rigid sortal that partitions a kind by a contingent change in the bearer's intrinsic state* … A Milestone … is a **perdurant/event** … The event is *not* the state: an event happens and is over; the phase is a standing condition the Relator occupies *between* events." The falsifier against milestones-only: "`chain-of-transactions.ttl` and `lease-extension-transaction.ttl` carry **no milestones at all** yet manifestly have a lifecycle standing … an event-only model leaves them stateless." (Guizzardi 2005, Ch. 4 §4.3; ODR-0007 §Rules "Milestones and status as anti-rigid Phases".)

**Moreau:** REVISE / FOR. PROV-DM §5.7.2 makes the event-log primary "where the log exists you mint nothing new for the *history*", **but** "`chain-of-transactions` and `lease-extension` carry **no milestone events whatsoever** … a materialised current-phase property … is the only available carrier when the producer emits no event-log — its absence is not 'phase unknown', it is 'phase unrepresentable', which is a model gap." Amendment: where a log exists, the snapshot is `prov:wasDerivedFrom` the terminal milestone "making the drift-risk auditable rather than hidden".

**Kendall (Queen):** REVISE / FOR — breaks toward the property on the FIBO test. The named consumer is concrete and already in the corpus: the two log-less exemplars have no other way to state their phase, and a queryable current-state facet is the standard FIBO lifecycle-status pattern (coded facet on the entity, *Ontology Engineering* 2019). The cost is warranted *because* Moreau's derive-where-a-log-exists rule removes the drift objection — the only thing Davis's deployment experience rightly fears.

**Davis (DA):** AFFIRM the no-mint reading / AGAINST. "The BBC `/programmes/` ontology shipped a … spine where state … was *derived from* the events … never stamped as a redundant parallel string — because a denormalised status field drifts." For the log-less exemplars "an invented 'active' is **fabricated state** … a projection returning nothing is the *honest* answer." **HOLD.** Re-open trigger: "a verified consumer query that cannot be answered by projection over reified milestones *and* an exemplar where milestones exist to project from — i.e. a real bottleneck, measured, not anticipated."

**Baker:** REVISE / ABSTAIN on the grain (UFO/PROV territory) — records only that "the value-space already exists either way", so a property is a *binding*, not a mint. **Gandon:** REVISE / ABSTAIN (out of lens) — insists only that the value be a dereferenceable `skos:Concept`, not a bare string.

**Vote Q1: 3–1–2** (FOR Kendall, Guizzardi, Moreau; AGAINST Davis; ABSTAIN Baker, Gandon). The Moreau derive-where-possible rider is adopted; Davis's drift concern is answered by it, his "mint nothing" held-as-live for the log-less case.

---

## Question 2 — Reuse `opda:TransactionStatusScheme`, or mint a new coarse scheme? Bearer?

**AFFIRM 4–0–2 FOR reuse — bind `opda:transactionStatus` to the existing `opda:TransactionStatusScheme`; bearer = the Transaction Relator (S032); do NOT mint a coarse scheme. Adopted amendment: correct the scheme's `skos:definition` "Substance Kind" → "Relator".**

**Baker** (core): "REJECT the new scheme; AFFIRM reuse." Three SKOS-governance tests fail the mint: reuse-before-mint (the scheme is "1 of 47 emitted … ADR-0010-named … every member `prov:wasDerivedFrom` its data-dictionary `status` enum"); **token collision** — "`opda:ParticipantStatusScheme` … has notations `Proposed / Invited / Active / Removed`; the proposed coarse Transaction tokens … reuse `Proposed` and `Active` **verbatim** … identical surface tokens across two bearer-distinct schemes is a catalogue-hygiene hazard"; one-primary-scheme integrity (ODR-0011 §1a) — "a coarse *view* … is a `skos:Collection`, never a new `skos:ConceptScheme`." (SKOS Reference §S27–S31; S032 §Refinement.)

**Guizzardi:** AFFIRM / FOR. Bearer settled 5–0–0 at S032 ("milestone-Phase bears on the Relator; `participantStatus` bears on the role-play"). On the scheme: "a Phase partition is exhaustive and disjoint by construction … two schemes over the same axis is not a modelling choice, it is an incoherent double partition" (ODR-0011 §1a one-primary-scheme IC).

**Moreau:** AFFIRM / FOR. "There is a clean **homomorphism** between the milestone-completion *events* and the status *values*" — `offerAccepted→Accepted`, `exchange→Exchanged`, `completion→Completed`; "the status scheme enumerates the *resting states between events*; the milestone scheme enumerates the *transitions*. They are two projections of one state machine." Flags the same definition defect: the scheme says "Substance Kind" but the bearer is the Relator (REVISE-rider, non-blocking).

**Davis (DA):** REJECT a new scheme; **ABSTAIN** on reuse-vs-nothing (moot under his Q1). His binding-target counter-proposal — bind `opda:MilestoneScheme` rather than `TransactionStatusScheme` — is overruled by the transitions-vs-resting-states distinction Moreau and Guizzardi drew (a *status* property carries resting states). **HOLD** with a single named condition: "no property may bind either scheme until [the] `skos:definition` … name[s] the Relator/role-play bearer" — **condition MET by the adopted definition-fix amendment**.

**Kendall (Queen):** FOR reuse. My own S032 DA attack withdrew "on the data — the corpus carries no role-divergent lifecycle"; the identical evidentiary discipline kills a coarse mint here. **Gandon:** ABSTAIN (out of lens), reuse-before-mint-leaning (AWWW "do not mint a new URI for a thing that already has one").

**Vote Q2: 4–0–2** (FOR Kendall, Guizzardi, Moreau, Baker; ABSTAIN Davis, Gandon). Adopted amendments: bind `TransactionStatusScheme` (resting-states), bearer = Transaction Relator, **fix the "Substance Kind" → "Relator" definition string** (independently found by Davis, Moreau, Baker).

---

## Question 3 — Exemplar value-mapping: what do the removed `active` / `completed` map to?

**REVISE 5–0–1 FOR — `completed → Completed` (unanimous); `active → Offered` adopted as the conservative, operator-confirmable default (NOT `Accepted`); the chain-level `opda:chainStatus` stays on the `TransactionChain`. The exact `active` target is the one live sub-dispute (bounds: Davis "drop" / Moreau "Accepted").**

`completed → Completed` is unanimous and clean (a CamelCase `skos:notation` normalisation; **Baker** §S15; **Moreau** the `registration`/`completion` milestone `prov:endedAtTime`; **Davis** projects it from the already-reified completion event). The split is `active`: **Guizzardi** — "`active` … is not a member of *this* partition at all — it is a member of the *participant*-status partition … the honest mapping is the weakest commitment consistent with 'ongoing': **`Offered`** … surfaced as operator-confirmable, not asserted" (S026 anti-speculation). **Baker** — "no `Active` notation in `TransactionStatusScheme` … maps to `Offered` … else `Listed`; absent any offer evidence … preferably **omit**." **Moreau** — `active → Accepted` (under-offer). **Davis (DA)** — drop it: "those Transactions reify no milestone and the data attests no phase"; **HOLD**. **Gandon** — ABSTAIN; insists the value land as a concept IRI not a bare string. **Kendall (Queen)** adjudicates to **`Offered`** (Guizzardi's conservative reading, within Baker's range, avoids inventing the more-advanced `Accepted`), flagged operator-adjustable in the exemplars; the value is a `skos:Concept` per Gandon.

**Vote Q3: 5–0–1** (FOR Kendall, Guizzardi, Moreau, Baker, Davis-on-`completed`; ABSTAIN Gandon). `completed→Completed` 6–0; `active` target held-as-live (Davis drop / Moreau Accepted as recorded bounds).

---

## Question 4 — Should the inert `opda:ufoCategory` dereference at `/pdtf/ufoCategory`?

**AFFIRM 6–0–0 FOR — it must dereference with its 3-part DOLCE disclosure. This realises ODR-0030 Rule 7b + ODR-0031 §Confirmation (an execution gap, not a new decision). Davis (DA) WITHDRAWN.**

The panel is unanimous that *inertness and dereferenceability are orthogonal*. **Gandon** (core): "`opda:ufoCategory` is a minted `https://opda.org.uk/pdtf/` HTTP URI … a minted opda: URI that 404s is a broken promise ('Cool URIs don't 404') … `rdfs:label` is itself an `owl:AnnotationProperty` … and it dereferences at w3.org … inertness is a reason the page is *safe*, not a reason to withhold it" (Berners-Lee rules 2/3; httpRange-14; OWL 2 §10.1). **Guizzardi:** "a claim that is *constitutively documentary* is exactly the kind of resource that *most* needs a dereferenceable page" — the 404 "is a *broken promise of ODR-0031 R4*, not scope-creep". **Baker:** "a 404 at `/pdtf/ufoCategory` is a dangling published term — a catalogue defect — regardless of its OWL semantics … the council has already decided this (R4 5–0–1 + §Confirmation); Q4 is enforcement." **Moreau:** "a predicate that *asserts its own sources* but 404s at its own IRI is internally inconsistent with the linked-data contract."

**Davis (DA):** **WITHDRAWN** from REJECT. *Verbatim:* "ODR-0030 Rule 7(b) + ODR-0031 §Confirmation are co-signed binding records mandating the disclosure page, and ODR-0031 R4's 'read-side SPARQL projection … (so they cannot entrench)' removes the entrenchment risk that was my sole objection. I hold no live dissent on *whether* it dereferences." His opposition converts to a Q5 condition: not via the first-class term template; disclosure as the spine. **Kendall (Queen):** FOR — the named consumer is anyone following OPDA's own minted URI; warranted at near-zero cost since the disclosure already ships in `opda-annotations.ttl`.

**Vote Q4: 6–0–0** (all FOR; Davis withdrawn, condition routed to Q5).

---

## Question 5 — How should the site model surface annotation properties?

**REVISE 5–0–1 FOR — a distinct `entryKind: 'annotation'` (never folded into `'property'`); an inert badge ("documentary; no logical consequence; never reasoned over", cite OWL 2 §10.1); the 3-part DOLCE disclosure as the page spine; the `closeMatch`→gUFO rendered as a mapping that never reaches the reasoner; built as a read-side projection (ODR-0031 R4) so it cannot entrench, leaving the predicate-range operator-open. Davis (DA) WITHDRAWN.**

**Gandon** (core, the exact engineering): add an `owl:AnnotationProperty` extraction to `scripts/ontology-model.mjs` reading `opda-annotations.ttl` (carrying `rdfs:label`/`comment`/`dct:source`/the `skos:scopeNote` disclosure + the `UFOCategoryScheme` value-space); a new `entryKind: 'annotation'` in `src/lib/ontology-model.ts` surfaced by `allResources()` so `/pdtf/[...name].astro` emits the page and `hasResource('ufoCategory')` flips true; a new `AnnotationDetail.astro` whose spine is the disclosure. "Folding annotation properties into the `'property'` kind … would be the category confusion Davis rightly fears … a distinct `entryKind` makes the page template's *structure* carry the honesty … the engineering act IS the ontological act" (OWL 2 §5.5; SKOS §10 — `closeMatch` is a mapping, no entailment). **Baker:** the distinct `entryKind` "*is* that type discriminator … it also generalises cleanly to the annotation-property family (the IAO crosswalk, any future advisory predicate)". **Guizzardi:** endorses all three devices; one caveat — surface the value-axis as the 9-concept `UFOCategoryScheme` (OntoClean signatures + gUFO `closeMatch`), and do **not** re-show the register-deference scheme axis as UFO categorial work (ODR-0030 R2 / ODR-0031 R1). **Davis (DA):** **WITHDRAWN** — "surfacing is mandated (R7b/§Confirmation) and the read-side-projection + distinct-`entryKind` design makes the surfacing honest and non-entrenching." Pushes back on Baker only to keep the predicate range open (don't prejudge string vs concept-IRI). **Moreau:** ABSTAIN (out of lens); asks only that `dct:source` + the scopeNote render verbatim as the page spine.

**Vote Q5: 5–0–1** (FOR Kendall, Guizzardi, Baker, Gandon, Davis; ABSTAIN Moreau).

---

## Synthesis (Queen — Kendall)

The session resolves both follow-ups with strong convergence and two precisely-bounded Davis holds.

**(A) Transaction phase.** Mint **`opda:transactionStatus`** — an `owl:DatatypeProperty`, `rdfs:domain opda:Transaction` (the Relator, per S032's two-bearer ruling), value-space the **existing** `opda:TransactionStatusScheme` (`Listed/Offered/Accepted/Exchanged/Completed`) via `sh:in`; **mint no new scheme**. The decisive argument is Guizzardi's and Moreau's jointly: a current lifecycle phase is an anti-rigid Phase *standing on the endurant Relator*, categorially distinct from the perdurant `opda:Milestone` events that effect transitions — and the two log-less exemplars (`chain-of-transactions`, `lease-extension`) prove the property *necessary*, not redundant, because an event-only model leaves them with no expressible phase ("phase unrepresentable … a model gap" — Moreau). Davis's deployment-grounded drift objection (a denormalised status drifts from its events) is answered, not dismissed: where a milestone log exists, **`opda:transactionStatus` is emitted `prov:wasDerivedFrom` the terminal milestone** (Moreau's rider, adopted), making any drift a detectable inconsistency rather than a silent lie. Two amendments adopted from the floor: (i) the value-mapping `completed→Completed`, `active→Offered` (operator-confirmable; `active` is not a native transaction-phase token — it leaked from `participantStatus`), the chain-level `opda:chainStatus` left on the `TransactionChain`; (ii) **correct the `opda:TransactionStatusScheme` (and `ParticipantStatusScheme`) `skos:definition` "Substance Kind" → "Relator"** — independently caught by Davis, Moreau, and Baker, and the exact content of Davis's Q2 withdrawal condition.

**(B) ufoCategory.** **Dereference `/pdtf/ufoCategory`** with its 3-part DOLCE disclosure — unanimous (6–0). This is **enforcement of standing rules** (ODR-0030 R7b + ODR-0031 §Confirmation name the page; R4 fixes the mechanism), not a new decision, so **no new ODR** issues; the session confirms them and records the *how*. The how (Q5, 5–0–1): a distinct **`entryKind: 'annotation'`** in the site model — never folded into the reasoned `'property'` arm — surfaced by extending `scripts/ontology-model.mjs` to read `owl:AnnotationProperty` from `opda-annotations.ttl`; an `AnnotationDetail` page whose **spine is the disclosure** and which leads with an inert badge ("documentary; no logical consequence; never reasoned over", OWL 2 §10.1); the `closeMatch`→gUFO shown as a mapping that never reaches the reasoner (the ODR-0031 R2 red line); built as a read-side projection so it cannot entrench and leaves the predicate-range operator-open. Gandon's framing is decisive: "the honest answer is **dereference + disclose**, not **withhold**; a 404 is not honesty, it is silence." Davis's anti-masquerade dissent is *fully met* by the distinct `entryKind` + badge — he withdrew on both Q4 and Q5.

**Downstream.** Amend **ODR-0007 §Rules** to record the `opda:transactionStatus` realisation (property + binding + derive-where-a-log-exists discipline + definition fix + value-mapping); status stays `proposed` (OPDA WG / Modelling Sub-Committee ratifies adoption). The ufoCategory work realises ODR-0030 R7b / ODR-0031 — recorded as an ODR-0031 §Confirmation note. The engineering (mint the property + re-attach exemplars + regenerate; add the annotation `entryKind` + `/pdtf/ufoCategory` page) is the implementation of this proposal, to ship with all `opda-gen` byte-identity / three-graph / doc-drift gates green and the model-JSON regen riding the same `make build-data` ADR-0045 §Confirmation flagged.

**Held-as-live dissent (Davis, DA).** Q1: "mint nothing" — milestones model phase; the property is denormalisation. Held for the case where a transaction *has* a milestone log. **Re-open trigger:** a verified consumer query unanswerable by projection over reified milestones *and* an exemplar where milestones exist to project from (a measured bottleneck, not anticipated). Q3: drop `active` for the no-milestone chain transactions rather than map it to `Offered`. **Re-open trigger:** the WG supplies PDTF source recording a transaction-level phase independently of milestone events. Both recorded in ODR-0007 §Held dissent.

---

## Tally appendix

| Voice | Q1 phase-property | Q2 reuse scheme | Q3 value-mapping | Q4 dereference | Q5 annotation entryKind |
|---|---|---|---|---|---|
| Kendall (Queen) | FOR | FOR | FOR | FOR | FOR |
| Guizzardi | FOR | FOR | FOR | FOR | FOR |
| Moreau | FOR | FOR | FOR¹ | FOR | ABSTAIN |
| Baker | ABSTAIN² | FOR | FOR | FOR | FOR |
| Gandon | ABSTAIN² | ABSTAIN² | ABSTAIN² | FOR | FOR |
| Davis (DA) | **AGAINST** (HELD) | ABSTAIN³ (**WITHDRAWN** on definition-fix) | FOR-`completed` / **HELD**-`active` | FOR (**WITHDRAWN**) | FOR (**WITHDRAWN**) |
| **Tally** | **3–1–2** | **4–0–2** | **5–0–1** | **6–0–0** | **5–0–1** |

¹ Moreau maps `active→Accepted` (vs the adopted `Offered`) — a sub-amendment, still FOR a canonical mapping. ² ABSTAIN = out of lens (Baker/Gandon on UFO/PROV grain; Gandon on value-mapping), not opposition. ³ Davis ABSTAINS on reuse-vs-nothing (moot under his Q1 AGAINST) but is AGAINST minting a *new* scheme — aligned with the reuse verdict.

### DA scorecard (Davis)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **HELD** (mint nothing) | "a verified consumer query unanswerable by milestone-projection *and* an exemplar with milestones to project from" → **still unmet** (held-as-live) |
| Q2 | **WITHDRAWN** | "correct the schemes' `skos:definition` to name the Relator bearer" → **met** by the adopted "Substance Kind → Relator" fix; his bind-`MilestoneScheme` counter overruled (status binds resting-states, not transitions) |
| Q3 | **HELD** (drop `active`) | "WG supplies source recording a transaction-level phase independent of milestones" → **unmet** (held-as-live); `completed→Completed` conceded |
| Q4 | **WITHDRAWN** | "ODR-0030 R7b + ODR-0031 §Confirmation + R4 read-side projection" → **met** (binding records mandate the page; entrenchment risk removed) |
| Q5 | **WITHDRAWN** | "distinct `entryKind` + inert badge + disclosure-spine, not the first-class template" → **met** by the adopted amendment. **Re-open:** if folded into the `'property'` `entryKind` or rendered via the first-class template without the badge + disclosure |

### Per-question count

Q1 3–1–2 · Q2 4–0–2 · Q3 5–0–1 · Q4 6–0–0 · Q5 5–0–1. The lowest FOR count is **Q1 (3)** — the genuinely contested question; carried on the log-less-exemplar necessity argument with Davis's "mint nothing" held-as-live (bounded re-open trigger). Q2/Q3 abstentions are out-of-lens, not opposition. Q4 unanimous.
