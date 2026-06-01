# Council Session 036 — Classification over inheritance (the load-bearing cascade) (Full Council)

- **Date:** 2026-06-01
- **Records:** No new ODR. Codifies the principle into **ODR-0011 §8a** (amendment) + cross-ref ODR-0008 §Q5a; amends **ODR-0009 §R5** (graduated evidence audit) and the `opda:tenureKind`/§8a **dangling-subclass overstatement**; routes two "asserts-more-than-it-performs" findings to ADR-0012 / the emitter; **AFFIRMS the in-tree session-035 evidence model** (no collapse). Directing-authority directive ratified as a *tested default*, not a slogan.
- **Queen:** Elisa Kendall (FIBO; class-vs-datum framing).
- **Devil's Advocate:** Giancarlo Guizzardi (gUFO/OntoUML — genuinely opposed: a rigid sub-Kind with its own structure *is* a class; flattening it to a code is the atomic-class-collapse anti-pattern).
- **Panel:** Nicola Guarino (OntoClean cascade) · Kurt Cagle (structured-value-not-a-class) · Holger Knublauch (SHACL value-keyed vs class-keyed) · Tom Baker (DCMI/SKOS governance) · Antoine Isaac / Alistair Miles (SKOS §3.5.1 concept-vs-class) · Dean Allemang (RDFS-Plus earn-its-keep).
- **Voices:** 8 (Queen + DA + 6), across 8 background teammates.
- **`consensus-mode`:** `agent-fan-out` + **Agent-Teams `SendMessage` cross-talk** (team `council-036`, opening + rebuttal). **No hive-mind.**
- **Format:** Full Council (~8 runs).
- **Input:** [session-035](session-035-evidence-alias-retirement-and-faceted-typing.md); the post-035 emitted `opda-claim.ttl`/`opda-claim-shapes.ttl`/`opda-vocabularies.ttl`; ODR-0005/0006/0008/0009/0011/0013/0024/0025/0026. Working positions: [`working/session-036/`](working/session-036/).

## Context

The directing authority directed: **"Always prefer classification over inheritance where you can"** — model a kind-distinction as a coded SKOS facet on one class, not an OWL subclass tree, keeping inheritance only where *load-bearing*. This re-examines session-035 (which kept the three `…Evidence` subclasses + added the `opda:evidenceType` facet).

The empirical keystone (Kendall, verified): **opda's own flagship precedent already follows the directive.** ODR-0011 §8a's "Substance Kind label" rule *says* each scheme member binds to an OWL sub-class via `skos:exactMatch` — but for `tenureKind` (Freehold/Leasehold/Commonhold) **those subclasses do not exist**: `opda:tenureKind` is a `DatatypeProperty` + SHACL `sh:in`, no subclass tree, and its `rdfs:comment` promises a binding to classes that were never emitted (the `skos:exactMatch` targets dangle). `ownerType` is likewise coded-only. So the directive is **already opda's de-facto rule**; the live questions are (a) state it precisely, (b) is evidence the genuine exception, (c) fix the overstatement.

## Question 1 — Adopt "prefer classification over inheritance unless load-bearing" as a principle? (+ the test)

**8–0–0 FOR a REVISE: adopt the directive's *diagnosis* (classification is the correct default — already ratified law for the §8a Quale/Quality-Value families) but REJECT the word "always"; codify the load-bearing test in ODR-0011 §8a (not a new ODR).** DA Guizzardi **WITHDREW** his opening conjunctive-AND test for Guarino's cascade.

The adopted canonical form — **Guarino's OntoClean load-bearing cascade** (Guarino & Welty 2009 §4; Guizzardi 2005 Ch.4):

1. **−R (anti-rigid)** → **classify** (Role/Phase/RoleMixin/coded facet — never a rigid subclass).
2. **+R ∧ −I** (rigid, no distinct identity criterion) → **classify** — *the directive's true and largest target*: `tenureKind`, `ownerType`, `builtForm` (a coded facet + `sh:in` on the one Kind).
3. **+R ∧ +I ∧ +D** (own IC + multi-relata dependence) → **Relator** (the categorial exit the directive is blind to — `VouchEvidence`).
4. **+R ∧ +I ∧ −D** → **subclass, mandatory** (a facet would discard the IC).

**Rigidity is the gate** (necessary, not sufficient); **+I (own identity criterion, latent or emitted) is the warrant**; **Δ (an emitted disjoint property signature) is *evidence of* +I, not a substitute — thin-Δ ≠ −I** (Guarino's decisive distinction). Bind the coded facet *alongside* any retained subclass by `skos:exactMatch` (the dual layer; NEVER instead-of, NEVER `owl:sameAs`). Baker's three-tier governance test (facet-only · dual-layer-on-warrant · bare-subclass-never) is the same lattice, governance-framed. Allemang's "earn-its-keep / cost-conjuncts-first" is the modeller-facing presentation. **Vote Q1: 8–0–0 FOR.**

## Question 2 — Evidence: collapse the subclasses to classification, or are they load-bearing?

**8–0–0 FOR: REJECT the collapse — keep all three (the dual layer), apply the cascade per sub-kind.** This is NOT "facet instead of inheritance" and NOT "keep because 035 did" — it is the cascade landing on each member:

- **`VouchEvidence` — KEEP (cell 3 Relator).** `a opda:Relator`; `opda:attestedBy → prov:Agent` (Vouch-only); two-relata Agent↔Claim dependence a coded value categorially cannot carry. Decisive, uncontested.
- **`DocumentEvidence` — KEEP (cell 4).** Load-bearing via `⊑ opda:AttachedDocument` (ODR-0024 §R7) — the filing-metadata signature + content/issuing-activity IC; "evidence is a role a document plays" (the role-seam), a flat code cannot say "AttachedDocument standing in the evidence role."
- **`ElectronicRecordEvidence` — KEEP, realisation-incomplete (cell 4, +I latent).** Verified: no property is `rdfs:domain` it, no neutral bearer Kind beneath it (the S035 Finding-5 asymmetry), Δ absent today. **But thin-Δ ≠ −I** — it carries a genuine *latent* IC (source-register + retrieval-activity), so per the **`opda:Building` precedent (ODR-0024 §R10)** — genuine latent IC → decline to mint the empty bearer Kind but **never deny the IC, never collapse** — it is retained as documentary (ODR-0026 §R2, zero closure cost). **Trigger = EMIT, never delete:** the unbuilt ODR-0009 §R5 `record.source.name` obligation is a value-conditional required field (`sh:qualifiedValueShape`/material-implication keyed on `opda:evidenceType`, entailment-free, ODR-0013:59) — it rides the facet; a *distinct-identity record-source bearer* (ODR-0008 §Q4a(a)) is the separate, narrower trigger for a bearer Kind. "A required field is a facet-branch; a distinct identity is a class."

The ER residual (collapse-if-inert vs retain) was **resolved against collapse** by Guarino's +I-vs-Δ distinction: a latent IC is not inertness. **Vote Q2: 8–0–0 FOR (reject collapse; dual layer).**

## Question 3 — Disposition / migration

**8–0–0 FOR a REVISE (codification, + value-keyed enforcement fixes); REJECT re-collapse.** Reversing a unanimous one-day-old session-035 on a *general preference* with *no new consumer evidence* fails the ODR-0009 §Amendment re-open trigger — the legitimate output is to **codify the invariant that explains session-035**, plus the concrete fixes the re-examination surfaced:

1. **Codify the cascade in ODR-0011 §8a** + cross-ref ODR-0008 §Q5a (unanimous siting — a new ODR "would fork a doctrine ODR-0011 owns and orphan itself from the §8a lint," Baker).
2. **Fix the `tenureKind`/§8a dangling-subclass overstatement** (Kendall's keystone — the highest-value, evidence-independent edit): §8a and `opda:tenureKind`'s comment promise a Freehold/Leasehold/Commonhold subclass binding that does not exist. Re-word; drop/scope the dangling `skos:exactMatch`-to-subclass mandate to load-bearing labels only.
3. **Value-keyed enforcement (Knublauch + DA Guizzardi — = the directing-authority's "enforcement is value-keyed not class-keyed").** The in-tree `opda:VouchEvidenceShape` targets `sh:targetClass opda:VouchEvidence` — the entailment-relative form that silently passes a Vouch recorded by value without the leaf type. **Re-key onto the value:** the Vouch⇒`attestedBy` obligation becomes a value-guarded material implication on `sh:targetSubjectsOf opda:evidenceType` (SHACL Core, entailment-free) — realised as the promised-but-unbuilt **`opda:EvidenceFacetShape`**. The subclasses **stay** (structure-bearers); only enforcement moves to the value.
4. **The one principled class-keyed exception — `opda:EvidenceClassCoherenceShape`** (Guizzardi's residue, accepted by Knublauch): value-keyed enforcement is `rdf:type`-blind, so a dedicated coherence shape (class ⇒ matching code, and code ⇒ not a conflicting sibling class; SHACL Core, `sh:Violation`) enforces in SHACL what `skos:exactMatch` only documents (ODR-0026 §R2 leaves it unevaluated). Three shapes, three jobs: value legal? (EvidenceTypeValueShape) · obligations met? (EvidenceFacetShape) · type agrees with value? (EvidenceClassCoherenceShape).
5. **Fix the phantom `opda:EvidenceFacetShape` comment** (`opda:Evidence` `rdfs:comment` promised a shape never declared) — now realised by (3).
6. **Amend ODR-0009 §R5** with the graduated audit (Vouch cell-3 Relator; Document cell-4 bearer-IC; ER cell-4 +I-realisation-incomplete, documentary, EMIT-trigger).
7. **Close the ODR-0009 §Deferred scheme-IRI rename as no-op / withhold permanently** (Baker + Isaac-Miles — Cool-URIs doctrine: an IRI is opaque denotation, not a label; renaming `EvidenceMethodScheme` is ODR-0024 §R4 namespace-landmine churn) + a `skos:scopeNote` safeguard.
8. **ODR-0026 unchanged** (the invariant reinforces §R2). **Vote Q3: 8–0–0 FOR.**

## Synthesis (Queen — Kendall)

The directive is **right as a default and already opda's de-facto law** — `tenureKind`/`ownerType` are coded facets with `sh:in`, no subclass trees, exactly as directed; the `owl:oneOf`/subclass-per-value tree is the anti-pattern opda already rejects (ODR-0011 §Alternatives; ODR-0024 §R4 "namespace landmines"). The word **"always" is rejected** only because the cascade names four genuine exits, two of which (+R∧+I∧+D → Relator; +R∧+I∧−D → subclass) are real and present in evidence. The deliverable is the **OntoClean load-bearing cascade** codified in ODR-0011 §8a: *default to a coded SKOS facet on the one Kind; promote to a subclass only on a distinct identity criterion (latent or emitted) — rigidity gates, +I warrants, Δ is evidence of +I not a substitute; bind facet alongside any subclass by `skos:exactMatch`.*

Evidence is the **justified exception, member-by-member**, not as a block: Vouch (Relator), Document (bearer-IC), ElectronicRecord (+I latent, the `opda:Building` precedent). The directive's "facet *instead of* inheritance for evidence" is rejected because it would dissolve Vouch's Relator sort and Document's bearer-IC and re-create the conditional soup ODR-0009 §R5 forbids.

But the directive's **enforcement half is upheld and was under-realised in-tree**: Knublauch (SHACL co-author) and DA Guizzardi independently showed the per-subtype obligation must key on the **coded value**, not the class (`sh:targetClass` is entailment-relative and silently passes a value-recorded Vouch). So session-036 *does* change the artefact: re-key the Vouch obligation to value-keyed (`EvidenceFacetShape`), add the one principled class-keyed coherence shape, and fix the phantom comment — **"classification for per-kind obligations (entailment-free); class-consultation only for inter-layer coherence."** That is the directing authority's "value-keyed not class-keyed," landed precisely.

The re-examination also surfaced **two fresh instances of the exact defect class session-035 was about** — *annotations/axioms asserting structure the artefact never performs*: the `tenureKind`/§8a dangling subclass-binding, and the phantom `EvidenceFacetShape` comment. Both are routed. That the directive's re-examination surfaced two more is itself the argument for codifying it.

## Tally appendix

| Voice | Q1 | Q2 | Q3 |
|---|---|---|---|
| Kendall (Queen) | FOR | FOR | FOR |
| Guizzardi (DA) | FOR ¹ | FOR | FOR |
| Guarino | FOR | FOR | FOR |
| Cagle | FOR | FOR | FOR |
| Knublauch | FOR | FOR ² | FOR ² |
| Baker | FOR | FOR | FOR |
| Isaac-Miles | FOR | FOR | FOR |
| Allemang | FOR | FOR | FOR ³ |
| **Tally** | **8–0–0** | **8–0–0** | **8–0–0** |

¹ DA **WITHDREW** his conjunctive-AND test for Guarino's cascade, crediting Kendall's verified coded-only-`tenureKind` keystone; held "always must die; codify the invariant."
² Knublauch's decisive contribution: enforcement must be **value-keyed** (the in-tree class-keyed `VouchEvidenceShape` silently passes a value-recorded Vouch); + the coherence-shape residue.
³ Allemang **HELD against re-collapse** (reversing a unanimous 1-day-old session on a general preference fails the re-open trigger) — satisfied by codify-don't-relitigate.

### DA scorecard (Guizzardi)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** (conjunctive-AND → cascade) | "your verified coded-only tenureKind fact + rigidity-is-a-gate-not-a-conjunct point" — adopted Guarino's cascade |
| Q2 | **HELD → CONVERGED** | Defended Vouch-as-Relator (decisive, adopted by all); conceded ER is realisation-incomplete-not-collapse on Guarino's +I ground. No residual dissent. |
| Q3 | **WITHDRAWN** (re-collapse) / contributed the coherence shape | Re-collapse rejected (no new evidence vs unanimous S035); contributed `EvidenceClassCoherenceShape` as the one principled class-keyed exception |

**Held-as-live dissent:** none blocks the disposition. The session-035 enforcement dissent (no `sh:xone`-over-`evidenceType` *collapse* of the subclasses) is **carried forward and reconciled**: enforcement is value-keyed, subclasses are retained as structure-bearers, class-targeting survives only in the coherence shape. **Re-open trigger (ER):** EMIT the §R5 `record.source.name` obligation (value-keyed) — never delete; a distinct-identity record-source bearer (ODR-0008 §Q4a(a)) is the separate bearer-Kind trigger.

### Per-question count

Q1 8–0–0 · Q2 8–0–0 · Q3 8–0–0. Unanimous on all three; the directive ratified as a tested default (the cascade), the in-tree evidence model affirmed, enforcement re-keyed to value per the directive.

## A9 note

`pattern`-grade (the classification-vs-inheritance modelling rule). Its UFO commitments live in the **ODR-0011 §8a amendment** (the cascade): **UFO categories** — the four cascade cells (anti-rigid → facet/Role; +R∧−I → coded facet; +R∧+I∧+D → Relator; +R∧+I∧−D → subclass). **IC over hard cases** — `tenureKind` (+R∧−I → facet, tenure-change is a value change not a re-typing); `VouchEvidence` (+R∧+I∧+D → Relator); `ElectronicRecordEvidence` (+R∧+I-latent → subclass realisation-incomplete, the `opda:Building` precedent). **Artefact realisation** — coded `sh:in` facet via `sh:targetSubjectsOf` + `skos:exactMatch`-bound subclass on warrant; value-keyed SHACL enforcement + a class-keyed coherence shape. `odr-review` lints the §8a amendment.

## Findings (route regardless — two instances of the "asserts-more-than-it-performs" defect class)

1. **`tenureKind`/§8a dangling-subclass overstatement** (Kendall, verified) — fix the §8a prose + `opda:tenureKind` comment; drop/scope the dangling `skos:exactMatch`-to-subclass mandate.
2. **Phantom `opda:EvidenceFacetShape`** (Baker, verified) — the `opda:Evidence` comment promised a shape never declared; now realised as the value-keyed Vouch-obligation shape (Q3 item 3).

## Disposition routing

- **ODR-0011 §8a amendment** (the cascade + the `tenureKind` overstatement fix); cross-ref ODR-0008 §Q5a.
- **ODR-0009 §R5 amendment** (graduated evidence audit + the ER EMIT-trigger) + close the §Deferred scheme-IRI rename as no-op.
- **Emitter (ADR-0012 lineage):** re-key the Vouch obligation to value-keyed `opda:EvidenceFacetShape`; add `opda:EvidenceClassCoherenceShape`; fix the `opda:Evidence` phantom-shape comment.
- **AFFIRM in-tree session-035** evidence model (RoleMixin/Relator/`evidenceType`/subclasses) — no collapse.
- **ODR-0026 unchanged.** Greenfield; directing-authority-ratified.
