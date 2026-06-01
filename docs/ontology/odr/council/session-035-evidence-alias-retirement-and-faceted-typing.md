# Council Session 035 — Evidence-class alias retirement & faceted-vs-inheritance typing (Full Council)

- **Date:** 2026-06-01
- **Records:** No new ODR minted by the session itself; routes **REVISE** dispositions to **ADR-0011** (retire the alias; supersede within-engineering option (b)), **ODR-0009** (evidence model: role recast + Vouch re-sort + emit the unbuilt per-subtype validation), **ADR-0012** (emit the dispatch shape), **ODR-0026 §R2/§R3** (drop the 3 `owl:equivalentClass` axioms from the excluded-construct inventory; record the alias re-examination as resolved). Produced proposal `status: proposed` pending WG ratification.
- **Queen:** Elisa Kendall (enterprise ontology patterns / FIBO; class-vs-datum framing; SKOS-scheme-alongside-OWL-class is routine FIBO practice).
- **Devil's Advocate:** Ian Davis (publish-first / scope-discipline / YAGNI — genuinely opposed: change a published model only on demand-pull, never on taste).
- **Panel:** Giancarlo Guizzardi (gUFO/OntoUML anti-patterns; rigidity taxonomy) · Nicola Guarino (OntoClean; rigidity/identity/dependence) · Kurt Cagle (SHACL; structured-value-not-a-class; faceting) · Holger Knublauch (SHACL co-author; `sh:targetSubjectsOf`/`qualifiedValueShape`; DASH) · Tom Baker (DCMI; SKOS-scheme stewardship; namespace governance) · Antoine Isaac / Alistair Miles (W3C SKOS Reference; concept-vs-class boundary; label discipline).
- **Voices:** 8 (Queen + DA + 6 panellists), across 7 background teammates.
- **`consensus-mode`:** `agent-fan-out` + **Agent-Teams `SendMessage` cross-talk** (team `council-035`, one opening + one rebuttal pass). **No hive-mind** — no verdict was structurally conditional on another (the byzantine trigger did not fire).
- **Format:** Full Council (~7 runs).
- **Input:** `source/03-standards/ontology/opda-claim.ttl`, `opda-claim-shapes.ttl`, `opda-claim-annotations.ttl`, `opda-vocabularies.ttl`; ADR-0011, ADR-0012; ODR-0005, ODR-0006, ODR-0008 §Q5a, ODR-0009, ODR-0011, ODR-0013, ODR-0024 §R7, ODR-0025/0026. Working positions: [`working/session-035/`](working/session-035/).

## Context

The directing author judged opda's evidence-class short/long-name alias pattern an anti-pattern, on three bundled claims: (P1) the `owl:equivalentClass` aliases (`opda:DocumentEvidence ≡ opda:Document`, …; ADR-0011 "within-engineering option (b)") are an anti-pattern; (P2) rigid subclass inheritance is wrong for evidence typing and evidence-kind should be a **facet**; (P3) facets-vs-inheritance was never weighed.

The panel verified the artefact directly and surfaced facts decisive to all three questions:

- **The evidence-kind facet already exists, ratified and orphaned.** `opda:EvidenceMethodScheme` (`opda-vocabularies.ttl:179–187, 1108–1130`) is a SKOS `ConceptScheme` whose three members are the OIDC4IDA `evidence.type` values **`{Document, Electronic-Record, Vouch}`** — sourced verbatim to the OpenID spec, `opda:ufoCategory "Quality Value"`, stewarded "Moreau (S009 Q3)". A tree-wide grep found **no property and no shape references it.** The corpus minted the discriminator twice (scheme + subclass tree) and wired the scheme to nothing.
- **The promised per-subtype validation was never emitted.** `opda:Evidence`'s `rdfs:comment` (`opda-claim.ttl:83`) and ODR-0009 promise an `sh:xone` subtype dispatch "(ADR-0012 emits the shape)". `opda-claim-shapes.ttl` contains **no `sh:xone` and no leaf-targeting shape** — the only evidence shape is `EvidenceIdentityKeyShape sh:targetClass opda:Evidence` (a lone `opda:digest sh:maxCount 1`). Evidence is validated only at the supertype.
- **The aliases are inert and serve 3 lines.** Under ODR-0025 §R2 / ODR-0026 §R3 `owl:equivalentClass` is authored-but-not-evaluated; an instance typed `a opda:Document` is **not** inferred to be `opda:DocumentEvidence` (and never was — pyshacl `inference="rdfs"` never entailed it). The short names are typed in **exactly three** hand-authored exemplar lines (`claim-with-{document,electronic-record,vouch}-evidence.ttl:44/44/45`) — nowhere else.
- **Vouch is categorially different.** `opda:attestedBy rdfs:domain opda:VouchEvidence` (`opda-claim.ttl:131`); a vouch is `prov:wasAttributedTo` an Agent — "an attestation, not a document derivation" (ODR-0009). Document/ElectronicRecord are `prov:wasDerivedFrom` artefacts.

## Question 1 — Is the `owl:equivalentClass` short/long alias an anti-pattern to retire?

**8–0–0 FOR (retire). DA WITHDRAWN.** Unanimous — the alias goes; replace with `skos:altLabel`/`rdfs:label` (the short name) on the one canonical `…Evidence` class + (Q2) `skos:exactMatch` to the kind concept.

- **Guarino:** AFFIRM — a rigid-Kind-name (`Document`) made co-extensional with an anti-rigid-role-name (`DocumentEvidence`) invites the role/Kind conflation ODR-0024 §R7 had to legislate against; reframe — the harm is naming-induced, not a live merge (ODR-0026 §R2 de-fanged the entailment). *Guarino & Welty 2009; ODR-0024 §R7.*
- **Isaac-Miles:** AFFIRM — this is a controlled-vocabulary **synonymy** need ("Document" = altLabel of "Document Evidence") mis-encoded as a TBox identity axiom; SKOS Reference §5.3 (S13/S14) supplies `skos:altLabel`. The axiom is doubly defective: inert under the regime (fails its stated "one OWL identity" job) yet a latent transitive-explosion hazard under any external DL reasoner (the risk ODR-0025 §R2 cites).
- **Cagle:** AFFIRM — not "abuse of `owl:equivalentClass`" (it is standard W3C) but a **double-mint redundancy**: the OIDC4IDA axis modelled both as the orphaned `EvidenceMethodScheme` and as a class tree needing alias glue. The defect is *needing the alias at all*.
- **Guizzardi:** REVISE(retire) — the **synonym-as-class / redundant-classifier** anti-pattern (Guizzardi 2014; Sales & Guizzardi OntoUML anti-pattern catalogue); it sits on the identity axis and proves nothing about inheritance.
- **Knublauch:** REVISE(retire) — worse than latent: exemplars typed `a opda:Document, prov:Entity` are caught by **no** emitted evidence shape (the supertype shape never matches them), an **active silent-pass** today (SHACL §2.1.3.1 class targets are entailment-relative).
- **Baker:** REVISE(retire) — a duplicate-term defect by DCMI one-concept-one-URI + opda's own `ci-dup-declaration` + ODR-0024 R2/R7; clean generator-level deletion, no §5a deprecation event (zero external dereferencers).
- **Davis (DA):** opening `REJECT` (recorded, validated, runtime-inert; not an AntiPattern per Brown 1998 — needs recurrence + harm) → **WITHDRAWN** after verifying his own cost claim was wrong by 5×: the short names are 3 hand-authored exemplar lines, retyping them does not perturb the byte-identity emitter; the alias is a latent shape-trap that buys nothing once you see it serves 3 lines.
- **Kendall (Queen):** FOR — `owl:equivalentClass` asserts same-extension-in-every-model, not "alternate label"; the correct vehicle is `skos:altLabel`. Retire.

**Vote Q1: 8–0–0 FOR** (retire the three aliases → `skos:altLabel`; re-type the 3 exemplars canonically).

## Question 2 — Rigid subclass vs facet for evidence typing?

**8–0–0 FOR a REVISE that rejects the proposition's "facet *instead of* inheritance" — adopt the dual layer** (keep the subclasses as structure-bearers; add a governed SKOS evidence-kind facet bound by `skos:exactMatch`; recast the evidence *role*; re-sort Vouch). DA **CONCEDED** the dual layer, **HELD** the narrow "facet must not *replace* the subclass" sub-point.

The decisive move: **"facet vs inheritance" is a false dichotomy** (Isaac-Miles, **SKOS Reference §3.5.1** — a resource may be both a `skos:Concept` and an `owl:Class`; the spec makes "no statement" forcing one over the other). Every voice landed on *both layers*:

- **Cagle:** REVISE(facet) — kind × assurance is a two-facet classification; bind `opda:evidenceType` to the **existing** `EvidenceMethodScheme` (not a new mint) + assurance to `AssuranceLevelScheme`; per-kind obligations via `sh:qualifiedValueShape` (ODR-0013's own `oneOf`→discriminated mapping; **SHACL Core** §4.8 — no `advanced=True`). Conceded the Vouch `attestedBy` asymmetry is the one real pro-subclass kernel → absorbed by one dispatch branch.
- **Knublauch:** REVISE(facet) — re-key off a **value** not class membership: `sh:targetSubjectsOf opda:evidenceType` fires with **no entailment dependency** (exactly opda's emitted `ownerType` pattern, `opda-agent-shapes.ttl:47–94`); the subclass `sh:targetClass` model is entailment-fragile and DASH-unrenderable (a class hierarchy is not a property). Vouch⇒eIDAS-Low cap lands in **Core** via `sh:qualifiedValueShape`.
- **Baker:** REVISE — governed SKOS kind-facet via the **renamed** `EvidenceMethodScheme` (it is mislabelled — its members are `evidence.type`, not method), `opda:ufoCategory "Substance Kind label"` (the §Q8a row that *carries* the `skos:exactMatch`-to-subclass mandate), **retain** the subclasses as structure-bearers. ODR-0011 §Alternatives already rejected OWL-class-per-value; ODR-0024 R6/R4 ("namespace landmines") is the live precedent.
- **Isaac-Miles:** REVISE — keep the subclasses **and** add the facet, bridged by `skos:exactMatch` (SKOS §10; ODR-0011 §8a — NEVER `owl:sameAs`); deleting the subclasses would orphan the (ratified, unemitted) ODR-0009 per-subtype obligations and split one scheme across concept+subclass vs concept-only members.
- **Guizzardi:** AFFIRM the three as **rigid sub-kinds** (they partition by provenance **origin** — rigid, not anti-rigid; disjoint property profiles make subclasses *lighter* than a single-slot facet), **REJECTS** "facet instead"; narrow REVISE — re-sort `VouchEvidence` to an attestation **Relator**; the genuinely anti-rigid evidence-*role* lives at the `AttachedDocument`→`DocumentEvidence` seam the repo already models (ODR-0024 §R7). *Guizzardi 2005 Ch.4 §4.2.*
- **Guarino:** REVISE — evidence-*hood* is anti-rigid (`Student`/`Enrolment` shape); recast `opda:Evidence` as a **RoleMixin** founded by the latent `opda:Verification` **Relator** (mirroring the ratified ODR-0006 Seller/Buyer); bearer Kinds stay rigid; Vouch is an Agent-founded attestation **Relator** (two-relata dependence → Relator, not Mode). Explicitly **rejected the flat facet** after Guizzardi's decline (§D). *Guarino & Welty 2009 §4.*
- **Davis (DA):** REJECT(facet) / FOR role-of-a-Kind — **HOLD**: a value-space facet *as the dispatch discriminator* destroys the disjoint property signatures (`attestedBy` Vouch-only `:131`; `⊑ AttachedDocument` Document-only `:60`) and re-admits the conditional soup ODR-0009 §R5 forbids; both UFO experts keep the bearer Kinds. **Re-open trigger:** a named consumer query needing all evidence through one uniform property set.
- **Kendall (Queen):** FOR the dual layer — FIBO routinely runs a SKOS scheme *alongside* the OWL class hierarchy bound by `skos:exactMatch`; the subclasses carry structure/constraints a coded value cannot, the scheme carries a governable, regulator-cited, extensible value-space. Both, bridged — not either/or.

**Vote Q2: 8–0–0 FOR the dual-layer REVISE** ¹ (reject "facet instead of inheritance"; keep the `…Evidence` subclasses as structure-bearers + recast the evidence *role*; wire the governed kind-facet via the reused scheme, `skos:exactMatch`-bound; re-sort Vouch as a Relator). ¹*The amendment substantially rewrites the proposition; the residual enforcement-keying fork is held — see scorecard.*

## Question 3 — Disposition / migration + ODR-0025/0026 + ADR-0011 interaction

**8–0–0 FOR a staged, near-free REVISE.** Migration is bounded and **ODR-0025/0026-reinforcing** (it *removes* three excluded constructs; closure unaffected): retire the 3 aliases (ADR-0011 amendment); rename/repurpose `EvidenceMethodScheme` → evidence-**kind** (`ufoCategory "Substance Kind label"`); emit 3 `skos:exactMatch` concept→subclass links; re-type 3 exemplars canonically; re-point 3 `opda:DPVMappingRefinement` records (`opda-claim-annotations.ttl:28–53`, already value-keyed — lawful bases PublicTask/LegitimateInterest/Consent survive intact); **emit the long-overdue per-subtype validation** (ADR-0012; `sh:qualifiedValueShape` per ODR-0013); re-sort `VouchEvidence` (ODR-0009 amendment); and amend **ODR-0026 §R2/§R3** to drop the 3 `equivalentClass` axioms from the excluded inventory and record the alias re-examination as resolved. **"Never weighed" (P3): REVISED** — it *was* weighed for the document case (ODR-0024 §R7) but never generalised to a facet-vs-subclass adjudication; this session is that adjudication. Zero edits to existing shapes (nothing targets the subtypes today). All voices FOR; DA WITHDRAWN on alias-retirement (verified near-free), HELD on facet-as-dispatch (per Q2).

## Synthesis (Queen — Kendall)

The proposition is **half-affirmed and half-rejected, and the council improved on both halves.**

**P1 (the alias) — AFFIRMED, 8–0–0, reframed.** The three `owl:equivalentClass` aliases are a genuine anti-pattern, but not for the reason proposed (live harm): ODR-0026 §R3 already rendered them inert. They are a *synonymy need mis-encoded as a logic axiom* (Isaac-Miles, SKOS §5.3), a *double-mint redundancy* against the orphaned scheme (Cagle), and an *active silent-pass* today because exemplars type the short name that no shape matches (Knublauch, verified). The DA's own verification (the cost is 3 hand-authored lines) collapsed the only argument to keep them, and he **withdrew**. Retire → `skos:altLabel` + `skos:exactMatch`.

**P2 (facet vs inheritance) — the proposition's remedy is REJECTED; its diagnosis is partly right.** "Make evidence-kind a facet *instead of* the subclasses" is a **false dichotomy** (SKOS §3.5.1; FIBO practice): the corpus should run **both** layers — the OWL subclasses as the rigid, structure-bearing, constraint-home (they partition by provenance *origin*, which Guizzardi's rigidity test shows is rigid, not anti-rigid — so the proposition's "rigid subclass is wrong" over-reaches), **and** a governed SKOS kind-facet (the already-ratified, currently-orphaned `EvidenceMethodScheme`) bound to them by `skos:exactMatch`. What the proposition got *right*: the model needs change — the alias must go, the orphaned scheme must be wired, and the genuinely anti-rigid **evidence-role** (a document is evidence only *qua* a verification using it) must be named, which the repo already does correctly at the `AttachedDocument → DocumentEvidence` seam (ODR-0024 §R7) and should complete via a RoleMixin recast founded by the latent `opda:Verification` Relator (Guarino/Guizzardi, mirroring ODR-0006).

**The one categorial correction the whole panel converged on independently:** `VouchEvidence` is **not** an Information-Object sibling of the document evidences — it is an Agent-founded **attestation Relator** (`attestedBy → prov:Agent`; two-relata existential dependence). ODR-0009 §R5's "do NOT collapse the three" is therefore *ontologically* correct, not merely cautious — one of the three is a different fundamental category, which is precisely why a flat facet that dissolves the bearers would be wrong.

**The residual fork I resolve via Isaac-Miles's reconciliation.** Cagle/Knublauch would key SHACL enforcement on the coded `opda:evidenceType` value; Davis/Guarino/Guizzardi/Baker keep the subclasses as the dispatch/structure home. `skos:exactMatch` makes the two **interoperable** — a consumer may dispatch on `rdf:type` (retained subclass) *or* on the coded value and get the same answer. **Ruling:** retain the subclasses as structure-bearers (documentary under ODR-0026 §R2) *and* emit the enforcement shape keyed on the coded value per ODR-0013's discriminated-`oneOf`→`sh:qualifiedValueShape` pattern (SHACL Core). This gives the SKOS/SHACL camp their entailment-free, DASH-renderable validation **and** the UFO camp their structure-bearing classes. The DA's HELD caution — never let the facet *replace* the subclasses into `sh:xone`-soup (ODR-0009 §R5) — is satisfied by retention and recorded as the re-open trigger.

**A through-line worth recording (Isaac-Miles/Cagle):** the alias and the phantom `sh:xone` comment are two instances of *one* defect class — **annotations/axioms asserting semantics the artefact never performs**. The remediation is to *build the missing thing* (emit the dispatch; wire the scheme), not merely delete the wrong thing.

Produced disposition is `status: proposed`; the WG/Modelling Sub-Committee ratifies (the Council shapes the proposal). Downstream this unblocks the ADR-0012 evidence-validation emission that ODR-0009 has owed since S009.

## Tally appendix

| Voice | Q1 | Q2 | Q3 |
|---|---|---|---|
| Kendall (Queen) | FOR | FOR | FOR |
| Guizzardi | FOR | FOR ² | FOR |
| Guarino | FOR | FOR ² | FOR |
| Cagle | FOR | FOR | FOR |
| Knublauch | FOR | FOR | FOR |
| Baker | FOR | FOR | FOR |
| Isaac-Miles | FOR | FOR | FOR |
| Davis (DA) | FOR ³ | FOR ⁴ | FOR ³ |
| **Tally** | **8–0–0** | **8–0–0** | **8–0–0** |

² FOR the dual-layer amendment, explicitly **rejecting** the proposition's "facet instead of inheritance"; both retain the subclasses (Guizzardi: rigid sub-kinds; Guarino: rigid bearer Kinds under a RoleMixin role).
³ Opening REJECT → **WITHDRAWN** (verified the migration is 3 hand-authored exemplar lines + a routine re-pin; the alias is a near-free-to-remove latent silent-pass).
⁴ FOR the dual layer (keep subclasses + governed scheme, `skos:exactMatch`-bound); **HELD** against the facet *as a dispatch replacement*.

### DA scorecard (Davis)

| Q | Disposition | Condition |
|---|---|---|
| Q1 | **WITHDRAWN** | "the alias's sole support (migration cost) is verified to be 3 hand-authored exemplar lines + a routine byte-identity re-pin, not corpus churn… retiring it removes a latent shape trap and buys nothing to keep" |
| Q2 | **CONCEDED** (dual layer) / **HELD** (facet-as-dispatch) | Held: the facet must be a `skos:exactMatch`-bound kind-**label**, NOT a replacement for the subclass/`sh:qualifiedValueShape` dispatch. **Re-open trigger:** a named consumer query needing all evidence through one uniform property set, OR a proposal to collapse enforcement into `sh:xone`-over-`evidenceType` (which would breach ODR-0009 §R5). |
| Q3 | **WITHDRAWN** (alias retirement) / **HELD** (no facet-collapse) | Withdrew "no demand-pull": the **ratified-but-orphaned `EvidenceMethodScheme` + the unemitted ODR-0009 dispatch are the pull** (an unfinished obligation the corpus owns), which clears the ODR-0026 §Alternatives bar; signs the phased, documentary-retention migration. |

**Held-as-live dissent:** the evidence-kind facet must remain a *bound label / governable value-space* over **retained** structure-bearing subclasses; it must not become the SHACL dispatch discriminator that dissolves the subclasses. **Re-open trigger:** a named uniform-evidence consumer query, or any proposal to replace subclass/property dispatch with `sh:xone`-over-`evidenceType`. Recorded here and to be carried into the ODR-0009 amendment's §Alternatives.

### Per-question count

Q1 8–0–0 · Q2 8–0–0 · Q3 8–0–0. No question below threshold; the unanimity is on a **heavily amended** proposition (the literal "facet instead of inheritance" remedy drew zero support — see ² and the synthesis).

## A9 note

The verdict is `pattern`-grade (evidence-role modelling). Its full UFO commitments and IC are owned by the **ODR-0009 amendment** this session routes, which must name: **UFO categories** — `opda:Evidence` = anti-rigid **RoleMixin** founded by the `opda:Verification` Relator; `AttachedDocument`/the record-bearer = rigid Information-Object **Kinds**; `VouchEvidence` = Agent-founded attestation **Relator**. **IC over hard cases** — a probate document filed-but-never-verified is an `AttachedDocument`, **not** evidence (identity by content+issuing-activity, not by the verification); two verifications using one physical document are two evidence items; a vouch has no document content (individuated by the attestation). **Artefact realisation** — retained `…Evidence` subclasses + reused `EvidenceMethodScheme` (`skos:exactMatch`-bound) + `opda:evidenceType` + `sh:qualifiedValueShape` dispatch (SHACL Core) + `skos:altLabel` short names. `odr-review` to lint the produced amendment.

## Findings (independent of the proposition — route regardless of P2's outcome)

1. **`EvidenceMethodScheme` is orphaned and mislabelled** — a ratified SKOS scheme referenced by nothing, whose members are `evidence.type` values, not "method" values. → rename/repurpose to the evidence-kind axis; wire it via `opda:evidenceType`.
2. **The ODR-0009 per-subtype `sh:xone` dispatch was never emitted** — evidence is validated only at the supertype (`opda:digest sh:maxCount 1`). A standing ADR-0012 emission defect. → emit it.
3. **`opda:Evidence` `rdfs:comment` (`:83`) overclaims** "ADR-0012 emits the shape" — it does not. Same defect class as the inert alias. → emit the shape or correct the comment.
4. **`VouchEvidence` is mis-categorised** as a flat artefact-sibling. → re-sort to an attestation Relator (ODR-0009 amendment).
5. **Bearer-Kind asymmetry** — only `DocumentEvidence` has its neutral bearer Kind (`AttachedDocument`, ODR-0024 §R7); ElectronicRecord/Vouch do not. → complete by symmetry, **gated on a consumer query** (held-as-live per ODR-0024 §R4/§R10 discipline).

## Disposition routing

- **ADR-0011 §Amendment** — supersede within-engineering option (b): short-name compatibility is met by `skos:altLabel` + canonical exemplar typing, not a second `owl:Class` + `owl:equivalentClass`. (Retire the 3 aliases.)
- **ODR-0009 amendment** (modelling) — recast `opda:Evidence` as a RoleMixin founded by the `opda:Verification` Relator; re-sort `VouchEvidence` to an attestation Relator; rename/repurpose `EvidenceMethodScheme` → evidence-kind (`ufoCategory "Substance Kind label"`); add `opda:evidenceType` + the three `skos:exactMatch` concept→subclass links; clarify §R5 ("do NOT collapse into one *undiscriminated* pattern"). `status: proposed`; carries the A9 IC + the held dissent in §Alternatives.
- **ADR-0012** — emit the per-subtype enforcement shape (`sh:qualifiedValueShape`, SHACL Core) + the Vouch⇒eIDAS-Low cap in Core; correct the `opda:Evidence` comment.
- **ODR-0026 §R2/§R3** — drop the 3 `owl:equivalentClass` evidence aliases from the excluded-construct inventory; note the alias re-examination resolved here (retire-and-replace-with-SKOS), since a safe evaluable substitute exists.
- **Held-as-live dissent + re-open trigger** recorded above and to be mirrored in the ODR-0009 amendment.
- **WG handoff** — all of the above `proposed`; the Modelling Sub-Committee ratifies.
