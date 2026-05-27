# Kendall — Devil's Advocate on S012

## DA framing

The panel will reach for governance-completeness on this question — Pandit (as Queen and DPV author) will press the lawful-basis / consent / purpose class vocabulary as TBox-expressible *now*, vindicating his S001 Q2 dissent; Iannella will press ODRL activation triggers and the consent-receipt seam; Cagle will press a SHACL-AF PII-discovery rule that flags new PII-bearing predicates without DPV tags (an Nth citing site of ODR-0017's pattern); Guarino will press the PROV-O ≠ DPV-PII boundary carried over from S009; Pandit + Iannella will press the Article-10 special-category depth that the AML / `cautionOrConviction` surface requires. Every position is correctly framed within the DPV backbone. My job as DA is to hold the line I established at **S002 Q4 — reference-not-import as normative discipline**: every Conditional-tier entry adopts by reference, not import; `slice-import` requires per-row justification; `full-import` is reserved for Core. ODR-0012 is the first authoring ODR that consumes DPV as a *class hierarchy* (not just an annotation surface); the temptation to slip from reference into import is operationally largest here.

The S002 Q4 carry: I authored the three-value `adoption-mode` field (`reference-only` / `slice-import` / `full-import`) and the rule that any choice other than `reference-only` MUST justify in the row's Notes column with attribution to the Council session that authored the choice. ODR-0012 is the first ODR that has to make that choice for DPV explicitly. The discipline is FIBO's (Kendall et al. 2020 *Production-tier discipline*) — FIBO's foundational modules reference `dct:` without `owl:imports`; the import boundary is reserved for modules whose class hierarchy is genuinely load-bearing on FIBO SHACL shapes. The W3C TAG persistence rule applied to imports: don't import URIs you haven't committed to maintaining. ODR-0018 §7 has already named ODR-0012 as the *authoring authority* for DPV co-annotations following the class-level pattern; the authoring discipline is the test.

The DA frame I bring: each per-question position below tests whether the reference-not-import line holds. Most concede — the panel has done the structural work and the four citing sites of ODR-0018 already commit to verbatim regulator citation per ODR-0011 §4a (Pandit's S011 amendment). The one place I press is **Q2 — lawful-basis class vocabulary at TBox level**. Pandit's S001 dissent is admissible IFF the class vocabulary stays REFERENCE-not-import. The mapping tables in ODR-0018 §3a are the artefact; the DPV TBox itself stays external. If ODR-0012 §Rules names lawful-basis vocabulary as imported-by-reference (with `dct:source` to the DPV CG specification, version-pinned per ODR-0004 §7a, and the verbatim-regulator-citation discipline of ODR-0018 §6 inherited), the dissent vindicates without breaching the catalogue discipline. If ODR-0012 imports the DPV TBox itself, the catalogue's `reference-only` default has been bypassed without the per-row `slice-import` justification S002 Q4 requires.

## Per-question DA positions

### Q1 — DPV Phase-1 scope (curated set vs every PII-bearing property)

**DA position:** CONCEDE the curated-set scope. A curated set is *leaner* than a baseline-everything scan, and leanness is exactly what reference-not-import requires: tag only the predicates whose PII regime is operationally load-bearing for a downstream consumer (SHACL sensitivity gate per ODR-0013; KYC / AML audit trail; ICO public-task lawful-basis disambiguation). The data dictionary's enumerated leaves — `name`, `firstName`, `lastName`, `maidenName`, `title`, `dateOfBirth`, `address`, `email`/`emailAddress`, `telephone`, identity/`document_number`, `aged17OrOverNames`, `cautionOrConviction`, AML results — are the curated set; "every property" would tag every datatype literal in the ontology, including non-PII counts and structural identifiers. The curated set is the FIBO discipline: tag what bears the regime, not what *might* be PII under a maximally cautious read.

No DA attack. CONCEDE.

**Per-voice vote: FOR curated-set scope from data dictionary enumeration.** Concede.

### Q2 — Lawful-basis class vocabulary at TBox level (PRIMARY VIGILANCE)

**DA position (PRIMARY VIGILANCE):** Concede Pandit's S001 dissent *in principle* — the lawful-basis / consent / purpose class vocabulary IS TBox-expressible without instance data; defining a vocabulary is a TBox act; only *populating* it with instances is Phase 2. The structural answer is correct, and the S001 record names the dissent as live precisely because the modelling theory does not require instance data to author the class vocabulary. **What I will hold the line on is the *mechanism* by which the class vocabulary lands in ODR-0012.**

Reference-not-import (the S002 Q4 amendment I authored) is the canonical discipline. Lawful-basis class vocabulary lands as **referenced-by-`dct:source`** to the DPV CG specification, with a version pin per ODR-0004 §7a (the term-sourcing five-line precedence) and verbatim regulator citation per ODR-0011 §4a (Pandit's S011 amendment hoisted ODR-0018 §6 inheritance). The mapping tables in ODR-0018 §3a (the Turtle template under `opda:DPVMappingTable`) are the *artefact* — they reify the lawful-basis-to-variant mapping inside `opda-annotations.ttl` without importing the DPV TBox. The DPV class hierarchy (`dpv:PublicTask broader dpv:LegalBasis`; `dpv:Consent broader dpv:LegalBasis`; `dpv:LegitimateInterest broader dpv:LegalBasis`) stays *external* — OPDA consumers dereference the canonical URI; OPDA SHACL shapes constrain *use* of the URI (cardinality, datatype, `sh:in` over the small enumerated set OPDA recognises) without inheriting the DPV TBox axioms.

The contrast case. Pandit's S002 Q4 ODR-0012-side concern (recorded in the catalogue change log) was that `dpv-pd` *might* surface a runtime PII-hierarchy validation case requiring `slice-import` (a named profile slice imported via `owl:imports` of the slice URI). That concern stays open as ODR-0012 *implementation* — the catalogue rule is `reference-only` by default; ODR-0012 may author `slice-import` if and when the lawful-basis class vocabulary surfaces a SHACL validation case the reference cannot serve. The bar is high: the `slice-import` choice MUST be justified in the row's Notes column with attribution to S012 (per S002 Q4); the slice MUST be a *named* DPV CG-published profile, not an ad-hoc subset; the slice MUST be small (lawful-basis enumeration only, not DPV's full apparatus).

**Withdrawal condition:** ODR-0012 §Rules names lawful-basis vocabulary as **imported-by-reference** (`dct:source` to DPV CG specification URL with version pin per ODR-0004 §7a + ODR-0018 §6 verbatim regulator citation discipline) — NOT as full DPV TBox import. The mapping tables in ODR-0018 §3a are the artefact; the DPV TBox itself stays external. If ODR-0012 §Rules instead declares `owl:imports <https://w3id.org/dpv>` (or a slice equivalent) without the S002 Q4 per-row justification + attribution, the reference-not-import discipline is breached and Q2 is held-as-live as a methodology violation.

**Per-voice vote: CONDITIONAL FOR — concede Pandit's dissent IFF mechanism is reference-not-import + withdrawal condition stated.** Concede the structural modelling; hold-as-live on the import mechanism.

### Q3 — Article-10 / special-category (`cautionOrConviction`, AML outcomes)

**DA position:** CONCEDE Pandit's Article-10 depth. Special-category PII (Article 10 GDPR — criminal-conviction-and-offence data; Article 9 — racial/ethnic, religious, health, biometric, sexual-orientation) is load-bearing for compliance — the regulatory regime *demands* explicit annotation at TBox level, not as advisory metadata. `dpv:hasSpecialCategoryPersonalData` MUST be authored on `cautionOrConviction` and the AML-result properties (`amlCheckOutcome`, `pep` flag, `sanctions` flag, `adverseMedia` flag). The SHACL sensitivity gate per ODR-0013 raises `sh:Warning` where a special-category property lacks the annotation — an un-annotated Article-10 leaf is a validation finding, exactly the right severity for downstream conveyancer / lender / AML-programme consumers.

This depth does NOT breach reference-not-import. The DPV special-category URIs (`dpv-pd:CriminalConviction`, `dpv-pd:RacialOrEthnicOrigin`, etc.) are *referenced* (used as object of `dpv:hasSpecialCategoryPersonalData`); no DPV TBox machinery is imported. The pattern is identical to ODR-0018's class-level baseline + variant-conditional refinement: the URI is the *value* the annotation takes; the URI's class hierarchy stays in DPV's namespace.

No DA attack. CONCEDE.

**Per-voice vote: FOR Article-10 depth + special-category annotation discipline.** Concede.

### Q4 — ODRL deferral conditions (activation triggers)

**DA position (MILD ATTACK on trigger naming):** CONCEDE ODRL deferral. ODRL `Policy`/`Permission`/`Duty` constructs bite only on instances (Guarino's S001 Q2 framing was correct; the S002 Q10 catalogue confirmation made the deferral mechanical); writing ODRL TBox without instances asserts nothing. The deferral itself is settled.

The mild attack is on **trigger naming** — exactly *which* future events activate ODRL policy authoring. S002 Q10 named three named-event triggers (any one activates): (1) ODR-0012 authors consent-receipt instance in published Turtle; (2) ODR-0009 authors VC-tied policy instance (`cred:VerifiableCredential` + `odrl:Policy`); (3) external policy-authoring consumer cites OPDA OR requests ODRL-typed Turtle. S012's §Rules MUST inherit those three triggers verbatim — Iannella (ODRL co-author) should press for them to be named in §Rules so re-opening is mechanical when one fires. If §Rules leaves the trigger to be discovered downstream, the deferral becomes indefinite and the future Council session that re-opens ODRL cannot trace its trigger to a S012 commitment.

The triggers I will press for naming: **Phase-2 VC consent receipts (Iannella's primary path); OPDA TF policy instances (when a Trust Framework rule fires that demands ODRL expression); named consumer regulatory requirement (FCA / ICO / EU eIDAS 2.0 / UK MEES guidance cites OPDA in architecture documentation OR requests ODRL-typed Turtle from OPDA's namespace).** All three are S002 Q10 inheritances; S012 records them as the binding set.

**Withdrawal condition:** ODR-0012 §Rules explicitly names the three Iannella-triggers (Phase-2 VC consent receipts; OPDA TF policy instances; named consumer regulatory requirement) so future re-opening is mechanical. If §Rules treats ODRL deferral as "defer until a trigger surfaces" without naming the triggers, the deferral is incomplete and Q4 is held-as-live.

**Per-voice vote: CONDITIONAL FOR — concede deferral iff three triggers named verbatim.** Concede the deferral; hold-as-live on trigger naming.

### Q5 — PII discovery automation hook (SHACL-AF PII-flag)

**DA position:** CONCEDE Cagle's SHACL automation hook. A SHACL-AF rule that fires `sh:Warning` on any new PII-bearing predicate (detected by datatype + property-name heuristic: `email` / `name` / `dob` / `phone` / `address` / `id` substring; or `xsd:string` datatype on a class flagged as data-subject-bearing) without a `dpv:hasPersonalDataCategory` annotation is the right operationalisation. The rule materialises the PII-discovery concern into a validation report; the report drives the SHACL sensitivity gate per ODR-0013; downstream consumers (CI build, `odr-review` lint, LLM-side query layer per Hellmann et al. DBpedia 2017) read the report and refuse to land the un-annotated predicate.

The rule is an Nth citing site of ODR-0017's SHACL-AF pattern; the pattern's load-bearing test is satisfied here because the consumer is named (the SHACL sensitivity gate produces a validation report; the CI build reads it). This is the materialisation form Guarino's S009 DA position called admissible (not the derivation form he warned against).

No DA attack. CONCEDE.

**Per-voice vote: FOR Cagle's SHACL-AF PII-discovery rule.** Concede.

### Q6 — W3C VC consent receipts (Phase-1 preparation)

**DA position:** CONCEDE deferral to ODR-0016. Scope-Check 1 Q7c (vote 8-1) named ODR-0016 (Session 016, deferred-until-trigger) as the binding-deliberation owner for W3C VC / DID integration; S012 Q6 records the question and confirms its scoping; the binding lives in ODR-0016 when its trigger fires. The S002 Q10 + Q13 cross-trigger discipline means a single Phase-2 consent-receipt event activates BOTH ODRL (Q4 trigger) AND `cred:`/`did:` (ODR-0016 trigger) — the coupled-trigger event records a single Change Log row. This is settled by Scope-Check 1; no DA attack.

No DA attack. CONCEDE.

**Per-voice vote: FOR deferral to ODR-0016.** Concede.

### Q7 — Boundary with Claims (ODR-0009 co-annotation handoff)

**DA position:** CONCEDE — the boundary is settled by ODR-0009 + ODR-0018. ODR-0009 §Q6 carries a one-paragraph pointer to ODR-0012 (per Scope-Check 1 Q5 refinement, vote 8-1); ODR-0018 §7 names ODR-0012 as the authoring authority for DPV co-annotations following the class-level pattern; ODR-0012's authoring discipline consumes ODR-0009's evidence subclasses (`DocumentEvidence` / `ElectronicRecordEvidence` / `VouchEvidence`) and authors the variant-conditional lawful-basis mappings per ODR-0018 §3a. The forward-supersession mechanism (`## Supersession scope:` from ODR-0012 onto ODR-0009) is retained as the amendment vehicle if ODR-0012's deliberation surfaces a tighter pattern that *changes* ODR-0009's pointer text — otherwise no supersession is needed.

This is settled by ODR-0009 + ODR-0018; no DA attack.

**Per-voice vote: FOR ODR-0009 + ODR-0018 boundary settlement.** Concede.

## Held-as-live re-open trigger (the reference-not-import line)

The primary DA framing concern lives across the ODR-0012 boundary into 18-month implementation. One scenario triggers a re-open of S012 on the §Rules text:

**18-month DPV TBox import drift.** If 18 months / ODR-0012's authoring imports DPV TBox beyond `dct:source` references — e.g. `owl:imports <https://w3id.org/dpv>` lands in `governance.ttl` without the S002 Q4 per-row `slice-import` justification + attribution; OR DPV class-hierarchy axioms (`dpv:PublicTask rdfs:subClassOf dpv:LegalBasis` etc.) appear in OPDA's class graph; OR a SHACL shape constrains over a *DPV-side* class restriction rather than an `sh:in` enumeration of OPDA-recognised URI values — the reference-not-import discipline has been breached and S012 re-opens to tighten the §Rules text. The re-open is mechanical: the next session that touches ODR-0012 (or any downstream ODR consuming ODR-0012's authoring) checks for DPV `owl:imports` in `governance.ttl` and DPV class-hierarchy axioms in the class graph; if either fires, S012 reconvenes with the specific §Rules tightening on the table.

The 18-month timer is the FIBO discipline (Kendall et al. 2020) — the production-tier review cadence for `owl:imports` decisions is 18 months because import-boundary drift takes 12-18 months to surface in downstream consumer queries that produce reasoner-empty results.

## DA scorecard target

Target concession profile: **7 of 7 concedes** IFF Q2 + Q4 withdrawal conditions are met (Q2 reference-not-import discipline preserved; Q4 ODRL activation triggers named explicitly). If Pandit's S001 dissent vindicates *via* reference-not-import (lawful-basis vocabulary lands as `dct:source` to DPV CG spec + ODR-0018 §3a mapping tables; no DPV TBox import) AND Q4 §Rules names the three Iannella-triggers verbatim, full withdrawal lands on every question.

If the Queen synthesis adopts the reference-not-import mechanism for the lawful-basis class vocabulary (Q2 withdrawal condition met) AND names the three ODRL activation triggers verbatim (Q4 withdrawal condition met), the scorecard lands at 7-of-7 outright. If reference-not-import discipline is breached on Q2 (DPV TBox imported without S002 Q4 per-row justification), Q2 is held-as-live with the 18-month re-open trigger named above.

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | (already conceded) | — | (Curated-set scope from data dictionary enumeration) |
| **Q2** | **Yes** | **Yes (mechanism)** | **§Rules names lawful-basis vocabulary as imported-by-reference (`dct:source` + version pin per ODR-0004 §7a + ODR-0018 §6 verbatim citation) — NOT as full DPV TBox import** |
| Q3 | (already conceded) | — | (Article-10 special-category depth + `dpv:hasSpecialCategoryPersonalData` on `cautionOrConviction` + AML outcomes) |
| **Q4** | **Yes** | **Mild (trigger naming)** | **§Rules explicitly names the three Iannella-triggers (Phase-2 VC consent receipts; OPDA TF policy instances; named consumer regulatory requirement)** |
| Q5 | (already conceded) | — | (Cagle's SHACL-AF PII-discovery rule — materialisation form) |
| Q6 | (already conceded) | — | (Deferral to ODR-0016 per Scope-Check 1 Q7c) |
| Q7 | (already conceded) | — | (ODR-0009 + ODR-0018 boundary settlement; forward-supersession mechanism retained) |

**Held-dissent text (for the Queen's record if my Q2 withdrawal condition is unmet):**

- **Q2 held:** "The lawful-basis class vocabulary is TBox-expressible *in principle* (Pandit's S001 dissent stands on modelling theory), but the S002 Q4 reference-not-import discipline I authored requires the class vocabulary to land as **imported-by-reference** (`dct:source` to DPV CG specification with version pin per ODR-0004 §7a + ODR-0018 §6 verbatim regulator citation), NOT as full DPV TBox import. If ODR-0012 §Rules declares `owl:imports <https://w3id.org/dpv>` (or a slice equivalent) without the S002 Q4 per-row `slice-import` justification + attribution to this session, the catalogue's `reference-only` default has been bypassed without the discipline the Council ratified 9-0. Withdraw on §Rules text that explicitly names reference-not-import as the mechanism and the mapping tables in ODR-0018 §3a as the artefact. (Kendall et al. 2020 *FIBO Production-tier discipline* — `owl:imports` reserved for modules whose class hierarchy is load-bearing on SHACL shapes; W3C TAG 'Cool URIs Don't Change' 2008 — don't import URIs you haven't committed to maintaining; ODR-0002 §Reference-not-import normative 9-0 vote 2026-05-27.)"

## DA discipline note (for the Queen)

Per ODR-0001 §Roles + §Two-artefact discipline, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition (specifically the reference-not-import mechanism for Q2 and the three-trigger naming for Q4), and records "Kendall DA withdrew on Q[n] on condition met: [verbatim condition]" or "Kendall DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Kendall DA aligned with majority" — the alignment must trace to the specific §Rules text that names the mechanism.

The S002 Q4 precedent matters: I authored reference-not-import as normative discipline with the three-value `adoption-mode` field (`reference-only` / `slice-import` / `full-import`); Cagle DA withdrew on the three-value qualification meeting the per-row-justification requirement. That commitment is binding methodology for S012; I do not get to re-litigate it from S012. But S012 is the *first authoring ODR* that consumes DPV as a class hierarchy (not just an annotation surface); the discipline is operationally tested here. The four citing sites of ODR-0018 already commit to verbatim regulator citation per ODR-0011 §4a (Pandit's amendment); ODR-0012 inherits this discipline.

The cited authority for every position above: Kendall, Bobbin & McGuinness 2020 *FIBO Production-tier discipline — owl:imports as Authority Boundary*, EDM Council technical guidance (the `owl:imports` reserved for load-bearing class hierarchy precedent); W3C TAG 2008 *Cool URIs Don't Change* §"Persistence" (the symmetric persistence rule applied to imports — don't import URIs you haven't committed to maintaining); ODR-0002 §Reference-not-import normative subsection (Session 002 Q4, 9-0 vote 2026-05-27, my own amendment); ODR-0018 §7 (the four-citing-site extraction record that names ODR-0012 as authoring authority for DPV co-annotations following the class-level pattern). These citations meet ODR-0001 §Citation grounding ("a documented standard the expert led or co-authored"; "a W3C Technical Architecture Group finding — named document + section"; "the Council session record the expert authored the position in").
