# Guarino — Devil's Advocate on S009

## DA framing

The panel will reach for PROV-O completeness on this question — Moreau (as Queen) will press the canonical PROV-O mapping; Knublauch will press SHACL-over-PROV `sh:xone` shapes; Pandit will press DPV co-annotation; Cagle will press his rules-on-rules pattern; Gandon will press qualified forms. Every position is correctly framed within the PROV-O backbone. My job as DA is to hold the line I conceded — *but did not abandon* — in [S001 Q6](../session-001-pdtf-schema-to-ontology.md#q6-—-verifiedclaims--prov-o-owned-by-moreau): **PROV-O answers "who derived what from what"; it has no vocabulary for the validation/verification distinction, the assurance level, or the jurisdiction-bound claim certainty. Forcing eIDAS onto PROV-O alone flattens evidential weight into a causal trace.** Moreau's own S001 analysis converged with that framing — ~80% of `verifiedClaims` maps natively to PROV-O; the residue (trust framework, validation-vs-verification, digest, assurance level, txn) does not — and the ODR-0009 stub correctly puts the residue in a "separate assurance layer." The PROV-O ≠ assurance line was my withdrawal condition at S001; it is the line that must remain defensible against S009's downstream consumers (ODR-0010 overlays; ODR-0012 governance; ODR-0013 SHACL severity).

The S001 carry: I voted DISAGREE on Q6 with the named withdrawal condition that the assurance-layer concerns be modelled *around* PROV-O, not *into* PROV-O. Moreau's own design met that condition; I withdrew. The structural concession was real and stands. What did not concede — and what this S009 position is built to defend — is the **semantic** line: assurance is a *regulated judgement* that the regulator makes *about* the derivation history; it is not derivable from PROV-O graph traversal, however richly the graph is shaped. The DA frame this session: hold that line where the PROV-O backbone tempts the panel to subsume assurance-layer concerns under PROV-O semantics.

The risk is not the structural separation S001 ratified (assurance terms live in their own layer; that is settled). The risk is *semantic drift across ODR boundaries*: as ODR-0010 overlays consume the PROV-O backbone, as ODR-0012 governance co-annotates the evidence entities, as ODR-0013 lands SHACL severity over the PROV structure, the assurance-layer terms may be silently re-interpreted as PROV-O properties — implying that more derivation equals higher assurance, or that the derivation graph itself constitutes the regulator's evidence judgement. Guarino & Welty 2002 *OntoClean* §"Rigidity, Identity, Unity, Dependence" warns this exact failure mode: when a meta-property (here, *regulated quality judgement*) is silently inherited by an entity that does not bear it (here, the PROV-O derivation graph), the resulting ontology cannot be defended against its own consumers. Guarino 2008 *On the Need for an Explicit Treatment of Domain Concepts* §3 says the same in the methodological frame: domain concepts (here, *assurance level under eIDAS*) must be *explicitly* committed and *kept distinct* from the generic vocabulary they ride on top of.

The DA frame I bring: each per-question position below tests whether the PROV-O ≠ assurance line holds. Most concede — the panel has done the structural work and Moreau's mapping is correct. The one place I press is Q3 (assurance level SKOS scheme) and to a lesser extent Q5 (trust_framework dual-modelling), because that is where the line is operationally tested. Q3 is the load-bearing question; the rest are settled or near-settled.

## Per-question DA positions

### Q1 — PROV-O coverage (80% / 5-residue split)

**DA position:** CONCEDE. The 80%/5-residue split was my own S001 Q6 framing (Moreau's analysis converged on the same boundary; the S001 transcript records it as "Moreau's own analysis independently reaches the same boundary"). The five residue items — `trust_framework`, validation-vs-verification distinction, cryptographic digest, assurance level, txn — are correctly identified as PROV-O-untranslatable. The ratification of this split in `## Rules` is the structural commitment my S001 withdrawal condition required. No DA attack.

**Per-voice vote: FOR the 80%/5-residue split.** Concede.

### Q2 — Qualified forms

**DA position:** CONCEDE. `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole` is the W3C-grade pattern; it is exactly what `validation_method` and `verification_method` need to ride on without being discarded by binary shortcuts. Gandon's S001 amendment was correct; the S009 stub adopts it; cardinality and SHACL discipline land cleanly. No DA attack.

**Per-voice vote: FOR qualified forms with `prov:hadRole`.** Concede.

### Q3 — Assurance level vocabulary (PRIMARY VIGILANCE)

**DA position (PRIMARY VIGILANCE):** Concede the *modelling commitment* — `opda:AssuranceLevelScheme` as a SKOS scheme under S011 §8a Quality Region (the band IS the region; eIDAS Low / Substantial / High are values in the trust-strength region; the Q8 PILOT typed-output assignment correctly placed it there). The structural answer is correct. **What I will hold the line on is the §Rules text** that frames the assurance-layer's relation to the PROV-O backbone.

Assurance level is a *regulated judgement*. eIDAS Low / Substantial / High are not properties of the derivation — they are the regulator's *conclusion about* the derivation, taken in light of the trust framework, the validation method, the verification method, the issuing authority, and the legal regime governing the claim. Two PROV-O graphs with identical derivation history can land at different assurance levels under different trust frameworks; one PROV-O graph can have its assurance level *change* under regulatory amendment without the derivation history changing at all. The assurance level is data the regulator writes *onto* the claim; it is not data the graph traversal can read *out of* the claim.

The three exemplars exhibit this directly. The grant-of-probate exemplar lands at `assuranceLevel "Substantial"` because the issuing authority is a court (HMCTS) and the trust framework rates court-issued instruments as Substantial; the same PROV-O derivation structure with a different issuing authority (e.g. self-attested probate) lands at `Low` despite identical graph shape. The HMRC API exemplar lands at `Substantial` via regulator-side API authority; the same `prov:wasGeneratedBy` shape against a private-sector API would land at `Low`. The solicitor vouch exemplar lands at `Low` regardless of voucher quality — the regulator's judgement is that vouches are corroborative, not authoritative. The assurance-level verdict is *not in the graph*; it is the regulator's commitment about the graph.

The §Rules text must say this explicitly. The S009 stub's Rules row (`opda:assuranceLevel` SKOS-coded annotation on the claim) is *structurally* correct, but the text as it stands does not name the PROV-O ≠ assurance distinction in semantic terms — only structural ones. Guarino & Welty 2002 *OntoClean* §"Identity and Unity" makes the case: a meta-property's *bearer* must be named; an `opda:assuranceLevel` triple's bearer is the claim-as-evidence-judgement, not the claim-as-derivation-product. The two are co-extensive on a per-claim basis but ontologically distinct. The Q8 PILOT assignment of `opda:AssuranceLevelScheme` to Quality Region is correct on the *value-space* — the region is the band — but the §Rules text must additionally name the *bearer*: the claim *qua* regulated judgement, not the claim *qua* derivation product.

**Withdrawal condition:** ODR-0009 §Rules explicitly states (in the assurance-layer rows or in a §Rules-adjacent note) that "PROV-O is the *derivation* graph; the assurance level is a *regulated judgement* the regulator makes *about* the derivation; the assurance level is the regulator's conclusion captured in `opda:assuranceLevel`, NOT derivable from PROV-O graph traversal." Without this text, the SKOS scheme commitment is structurally complete but semantically under-defended; downstream ODRs (0010, 0012, 0013) may extend PROV-O semantics to cover assurance-layer ground.

**Per-voice vote: CONDITIONAL FOR — concede on §Rules text + withdrawal condition stated.** Concede the modelling; hold-as-live on the §Rules text framing.

### Q4 — Cryptographic digest

**DA position:** CONCEDE `opda:digest` as a literal triple on the claim. PROV-DM has no signature notion (Moreau & Missier 2013 *PROV-O Recommendation* §3 — `prov:Entity` carries no integrity-check vocabulary); this is the unambiguous case for a local `opda:` term. The S009 stub correctly mints `opda:digestAlg` and `opda:digestValue` as bespoke terms in the assurance layer.

**One scoping note for the §References, not a withdrawal condition:** `opda:digest` is an *integrity-check* triple — it asserts what hash a claim's content reduces to under a named algorithm. It is *not* a *cryptographic-signature* triple — it does not assert who signed the claim under what verification key with what trust anchor. The signature semantics belongs to W3C Verifiable Credentials Data Integrity (Q8 → ODR-0016), not here. The §References should note this distinction so downstream consumers do not over-load `opda:digest` to bear signature semantics it cannot carry.

**Per-voice vote: FOR `opda:digest` as literal + integrity-vs-signature scoping note.** Concede.

### Q5 — `trust_framework` modelling

**DA position (MILD ATTACK on dual-modelling):** The `dct:conformsTo opda:TrustFramework` (class) framing is the W3C-grade interop signal. That is the load-bearing predicate; any external consumer can read it and understand what trust regime the claim claims conformance to. Concede that.

The mild attack is on the *additional* SKOS reification — turning `opda:UKPropertyDataTrustFramework` into both an `opda:TrustFramework` instance AND a `skos:Concept` in a separate scheme. The SKOS reification is admissible (it gives OPDA an internal governance pointer for trust-framework lifecycle: amendment, supersession, deprecation) but it is *OPDA-internal governance machinery*, not the W3C-grade interop. If `## Rules` presents the dual-modelling without naming the primary, downstream consumers may load both and produce ambiguous answers about what the trust-framework *is*.

The right framing in §Rules: `dct:conformsTo opda:TrustFramework` is the **primary** W3C-grade interop predicate; the SKOS reification is an **OPDA-internal supplement** for governance lifecycle (versioning, deprecation, succession). Guarino 2008 *On the Need for an Explicit Treatment of Domain Concepts* §4 names this exact discipline: when two representations of one entity co-exist, the ODR must name which one is canonical for external consumers and which is internal-governance-only. Without that nomination, the dual-modelling becomes a footgun.

**Withdrawal condition:** ODR-0009 §Rules explicitly names `dct:conformsTo opda:TrustFramework` as the primary W3C-grade interop predicate AND the SKOS reification (if retained) as an OPDA-internal supplement, with the two roles distinguished in the text. If §Rules treats the two as co-equal alternatives, the attack is held-as-live.

**Per-voice vote: CONDITIONAL FOR — concede dual-modelling iff §Rules names the primary + withdrawal condition stated.** Concede the structural pattern; hold-as-live on the §Rules nomination.

### Q6 — DPV co-annotation seam

**DA position:** CONCEDE. Pandit's pointer-to-ODR-0012 framing (per Scope-Check 1 Q5 refinement, vote 8-1) is the right routing: ODR-0009 carries a one-paragraph pointer at the DPV co-annotation seam; the authoritative listing lives in ODR-0012. The forward-supersession mechanism (`## Supersession scope:`) is retained as the amendment vehicle. This is settled by Scope-Check 1; no DA attack.

**Per-voice vote: FOR one-paragraph pointer to ODR-0012.** Concede.

### Q7 — SHACL-over-PROV `sh:xone`

**DA position:** CONCEDE. Cagle's three-branch dispatch on `evidence.type` (`sh:xone` over document / electronic-record / vouch shapes, with the `if/then`-on-`evidence.type` schema conditionality reproduced as `sh:xone` over per-type shapes) is the right SHACL operationalisation. Knublauch 2017 *SHACL Recommendation* §3.7.1 (`sh:xone`) is the W3C-grade authority; the S009 stub adopts it correctly. The exemplar set discharges the three branches cleanly. No DA attack.

**Per-voice vote: FOR `sh:xone` three-branch dispatch.** Concede.

### Q8 — W3C VC interop

**DA position:** CONCEDE deferral to ODR-0016. Scope-Check 1 Q7c (vote 8-1) named ODR-0016 (Session 016, deferred-until-trigger) as the binding-deliberation owner for W3C VC / DID integration. S009 Q8 records the question and its scoping; the binding lives in ODR-0016 when its trigger fires. This is settled by Scope-Check 1; no DA attack.

**Per-voice vote: FOR deferral to ODR-0016.** Concede.

## Replies to anticipated panel positions

### Moreau on Q1 — the 80%/5-residue boundary may shift

**Anticipated:** Moreau (as Queen and PROV-O author) may surface that fresh analysis of `pdtf-verified-claims.json` has identified additional residue items — e.g. claim-validity-interval (vs PROV-O's instant), or jurisdiction-bound certainty markers — pushing the residue from five items to six or seven.

**DA reply:** Concede the analysis if it surfaces; the boundary is empirical, not theoretical. What matters for my framing is *not* the count (5 vs 7) but the *kind* of residue: each item must be a regulated-judgement or institutional-fact concern, not a derivation-history concern. If Moreau's expanded list adds items that are PROV-O-untranslatable for the right reason (regulated judgement), the boundary shift strengthens my framing. If the expanded list adds items that *could* have been PROV-O properties but Moreau is over-isolating, that is a separate concern not in my DA scope.

### Knublauch on Q7 — SHACL-over-PROV may need shape inheritance

**Anticipated:** Knublauch may surface that the three-branch `sh:xone` over `evidence.type` requires shape inheritance discipline (a base `opda:Evidence` shape with per-type sub-shapes) to avoid validation drift across overlays (ODR-0010 territory).

**DA reply:** Concede the structural pattern; the inheritance discipline is W3C-grade SHACL practice (Knublauch & Kontokostas 2017 *SHACL Recommendation* §3.4). One scoping concern: the shape inheritance must be in the *shapes graph*, not in the assurance-layer terms. If shape inheritance leaks into `opda:Evidence` as a class-level assurance criterion (e.g. "valid evidence = passes SHACL shape"), the PROV-O ≠ assurance line has crossed into the SHACL layer. The right place for SHACL-shape conformance is ODR-0013 (Validation & Severity), not ODR-0009.

### Pandit on Q6 — DPV co-annotation may need supersession from ODR-0012

**Anticipated:** Pandit (per Scope-Check 1 Q5 routing) may surface that ODR-0012's DPV authoring needs to amend ODR-0009's one-paragraph pointer if a material change surfaces (e.g. evidence-class PII inheritance discipline).

**DA reply:** Concede the supersession mechanism (`## Supersession scope:` from 0012 onto 0009) as already adopted in the stub. My only DA scoping note: any DPV co-annotation must respect the PROV-O ≠ assurance line. DPV tags PII; PII tagging is a regulator-mandated *constraint* on data handling; it is not a *derivation* property. The PROV-O backbone carries the evidence-derivation graph; the DPV layer carries the PII handling constraints; the assurance layer carries the regulated-judgement levels. Three distinct concerns, three distinct vocabularies. If ODR-0012 conflates DPV PII tagging with PROV-O derivation under amendment, the conflation is a separate methodology concern routed back to Scope-Check.

### Cagle on rules-on-rules (carryover from S005 §6a discipline)

**Anticipated:** Cagle may surface his SHACL-AF rules-on-rules pattern (the fifth+ citing site of ODR-0017's pattern) for materialising assurance-level derivations into validation reports — e.g. a SHACL-AF rule that fires `sh:Info` on every claim and emits its assurance level into the report for downstream consumers (LLM tooling, audit-trail consumer).

**DA reply:** *Strong scoping concern.* A SHACL-AF rule that *materialises* the assurance level into the validation report is admissible — the assurance level is already a regulator-set property; the rule just surfaces it. A SHACL-AF rule that *derives* the assurance level from PROV-O graph features (e.g. "evidence-type = document AND verifier-is-court → assurance-level Substantial") is **not admissible** under the PROV-O ≠ assurance line. The derivation rule would make assurance a *function of* the derivation graph, exactly the conflation this DA position guards against. If Cagle's proposed rule is the materialisation form, concede; if it is the derivation form, hold-as-live as a re-open trigger.

## Held-as-live re-open trigger (the PROV-O ≠ assurance line)

The primary DA framing concern lives across the ODR-0009 boundary into downstream sessions. Two scenarios trigger a re-open of S009 on the §Rules text:

1. **Downstream PROV-O semantic extension.** If ODR-0010 (Overlay Profile Mechanism), ODR-0012 (Data-Governance Layer), or ODR-0013 (SHACL Validation & Severity) extends PROV-O semantics to cover assurance-layer commitments — e.g. deriving an assurance-level value from PROV-O graph traversal, or treating `prov:wasDerivedFrom` chain length as an assurance signal — the §Rules text on the PROV-O ≠ assurance line has failed its load-bearing test and S009 re-opens to tighten the text.

2. **18-month consumer-side conflation check.** If 18 months / downstream consumers (OPDA's own tooling; LLM-side query layer per Hellmann et al. DBpedia 2017 framing) treat the PROV-O derivation history as if it were the regulator's assurance judgement — i.e. produce outputs of the form "this claim has assurance level X because its PROV-O graph has property Y" — the consumer-side conflation indicates the §Rules text did not preserve the distinction operationally and S009 re-opens.

The re-open triggers are mechanical: the next session that touches ODR-0009 (or any downstream ODR consuming the PROV-O backbone) checks for both trigger conditions and records the result; if either fires, S009 reconvenes with the specific §Rules tightening on the table.

## DA scorecard target

Target concession profile: **7 of 8 concedes** (Q1 + Q2 + Q4 + Q6 + Q7 + Q8 outright; one of Q3 OR Q5 withdrawn on its specific §Rules nomination). The PROV-O backbone framing is correct; the structural commitments are settled; only the §Rules text on the PROV-O ≠ assurance line remains as the load-bearing condition. If the Queen synthesis adopts both Q3 and Q5 withdrawal conditions, the scorecard lands at 8-of-8 concedes (full withdrawal on every question).

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | (already conceded) | — | (80%/5-residue split — my own S001 framing, ratified) |
| Q2 | (already conceded) | — | (Qualified forms with `prov:hadRole` — W3C-grade) |
| **Q3** | **Yes** | **Yes (§Rules text)** | **§Rules text names "PROV-O is the derivation graph; assurance is a regulated judgement the regulator makes about the derivation; not derivable from PROV-O graph traversal"** |
| Q4 | (already conceded) | — | (`opda:digest` literal + integrity-vs-signature scoping note) |
| **Q5** | **Yes** | **Mild (§Rules text)** | **§Rules names `dct:conformsTo opda:TrustFramework` as primary W3C-grade interop predicate; SKOS reification as OPDA-internal supplement** |
| Q6 | (already conceded) | — | (One-paragraph pointer to ODR-0012 per Scope-Check 1 Q5) |
| Q7 | (already conceded) | — | (`sh:xone` three-branch dispatch per Knublauch SHACL §3.7.1) |
| Q8 | (already conceded) | — | (Deferral to ODR-0016 per Scope-Check 1 Q7c) |

**Held-dissent texts (for the Queen's record if my withdrawal conditions are unmet):**

- **Q3 held:** "The PROV-O backbone in ODR-0009 §Rules is structurally complete but semantically under-defended. The S001 Q6 withdrawal condition — that assurance-layer concerns be modelled *around* PROV-O, not *into* PROV-O — was met structurally by the assurance-layer separation, but the §Rules text does not explicitly state that the assurance level is a *regulated judgement* the regulator makes *about* the derivation, not derivable from PROV-O graph traversal. Without this text, downstream ODRs (0010, 0012, 0013) may silently extend PROV-O semantics to cover assurance-layer commitments. Withdraw on §Rules text that explicitly names the distinction. (Guarino & Welty 2002 *OntoClean* §'Rigidity, Identity, Unity, Dependence'; Guarino 2008 *On the Need for an Explicit Treatment of Domain Concepts* §3-4; Moreau & Missier 2013 *PROV-O Recommendation* §3 'Entity' — PROV-DM models derivation, not regulated judgement.)"

- **Q5 held:** "The `dct:conformsTo opda:TrustFramework` predicate is the W3C-grade interop signal; the SKOS reification of `opda:UKPropertyDataTrustFramework` as a `skos:Concept` is admissible OPDA-internal governance machinery but is NOT co-equal to the `dct:conformsTo` predicate for external consumers. Without §Rules text nominating `dct:conformsTo` as primary, downstream consumers may load both representations and produce ambiguous answers about what the trust framework *is*. Withdraw on §Rules text that names the primary. (Guarino 2008 *On the Need for an Explicit Treatment of Domain Concepts* §4 — when two representations of one entity co-exist, the ODR must name which one is canonical for external consumers.)"

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition (specifically the §Rules text framings for Q3 and Q5), and records "Guarino DA withdrew on Q[n] on condition met: [verbatim condition]" or "Guarino DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Guarino DA aligned with majority" — the alignment must trace to the specific §Rules text that names the distinction.

The S001 Q6 precedent matters: I conceded the structural separation between PROV-O backbone and assurance layer because Moreau's own design met my withdrawal condition. That concession is binding; I do not get to reopen the structural commitment from S009. But the concession was *structural*, not semantic — the semantic line (PROV-O ≠ assurance as a *kind* of claim, not just as a *layer* of modelling) is what this S009 position holds. The structural pattern is settled; the §Rules text is the test.

The cited authority for every position above: Guarino & Welty 2002, *Evaluating Ontological Decisions with OntoClean*, Communications of the ACM 45(2) §"Rigidity, Identity, Unity, Dependence" (the meta-property discipline that distinguishes regulated judgement from derivation history); Guarino 2008, *On the Need for an Explicit Treatment of Domain Concepts*, Proc. EKAW 2008 §3-4 (the domain-concept commitment discipline that requires assurance-level to be its own bearer); Moreau & Missier eds. 2013, *PROV-O Recommendation* W3C (the authoritative scope of PROV-O's `prov:Entity` and `prov:Activity` — derivation, not regulated judgement). These citations meet ODR-0001 §Citation grounding ("a peer-reviewed paper authored by the expert"; "a W3C Recommendation, Working Draft, or Note — named spec + section number").
