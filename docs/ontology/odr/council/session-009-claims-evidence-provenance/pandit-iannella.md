# Pandit + Iannella — Governance/Policy-pair position on S009

> **Pair voice.** Pandit (DPV — modular extension pattern; PII-strict discipline from S005 §3c + S011 §4a/§5a/§8a) and Iannella (W3C ODRL — policy expression). Joint position where the pair concurs; attributed separately on Q6 (Pandit-load-bearing — DPV co-annotation authoring authority per Scope-Check 1 Q5 refinement) and Q8 (Iannella-leaning — ODRL-as-future-extension awareness; deferral inherited from S002 Q10 carries to S009 without re-litigation). Queen Moreau; DA Guarino.

## Pair summary (≤120 words)

PROV-O 80% / 5-exception split (Q1) carries; qualified attribution (Q2) carries; assurance-level SKOS scheme (Q3) lands as **S011 §8a Quality Region** with Pandit's **lawful-basis-trigger** governance-sensitivity flag — eIDAS Low/Substantial/High alignment is **load-bearing input** to GDPR Art. 6 / Art. 9 lawful-basis determination for ODR-0012. Q4 `opda:digest` carries with Pandit caveat: digest is integrity-check on the verifiedClaims envelope, **not** cryptographic signature (signature is W3C Data Integrity / VC interop territory → Q8 → ODR-0016). Q5 `dct:conformsTo opda:TrustFramework` with SKOS reification of framework-registry values. **Q6 load-bearing (Pandit):** ODR-0009 carries a one-paragraph pointer; ODR-0012 owns DPV co-annotation authoring per Scope-Check 1 Q5 refinement. Q7 SHACL-over-PROV carries (Cagle). Q8 deferral to ODR-0016 (VC interop); ODRL deferral carries from S002 Q10 — **S009 does not bind to ODRL**.

## Per-question positions

### Q1 — PROV-O 80% backbone with 5-residue exception layer

**Joint position: CONCEDE.** The 80%/5-residue split is correct. PROV-O is the only W3C-recommended provenance vocabulary; the residue (trust_framework, validation-vs-verification, digest, assurance-level, txn) is correctly modelled *around* PROV in a dedicated assurance layer, because PROV-DM deliberately does not model signatures, assurance tiers, or external-system correlation keys.

**Pandit note (DPV-side concur):** DPV co-annotates the PROV-O backbone *cleanly* on the 80% side — `prov:Entity` (the Claim) and `prov:Entity` (the Evidence) and `prov:Agent` (the Verifier) all admit `dpv-pd:hasPersonalDataCategory` triples without disturbing the PROV semantics. The 5-residue exceptions are non-PII-bearing (envelope-fields) and do not require DPV co-annotation. Clean separation.

**Pair vote draft:** **9-0-0** (anticipating universal concur; Cagle DA likely concur on the engineering pragmatism).

### Q2 — Qualified attribution (prov:qualifiedAttribution + prov:hadRole)

**Joint position: CONCEDE qualified form.** The qualified form is required to preserve `validation_method`/`verification_method` — binary `prov:wasAttributedTo`/`prov:wasAssociatedWith` shortcuts would discard them.

**Pandit note:** Qualified attribution is also load-bearing for PII-history audit-trail under GDPR Art. 5(1)(d) accuracy principle. The reified `prov:Attribution` carries `dct:source`-pinned PII-history; ODR-0012's DPV co-annotation attaches `dpv:hasLawfulBasis` to the Attribution node, not to the binary shortcut. Qualified form is governance-compatible; binary shortcut is not.

**Iannella note:** Qualified attribution is also the ODRL-readable shape — an `odrl:Permission`/`odrl:Prohibition` would attach to a qualified Attribution node by `odrl:assigner`/`odrl:assignee` predicates if ODR-0012 ever activates ODRL policy expression (per S002 Q10 trigger). Qualified form is forward-compatible; binary shortcut is not.

**Pair vote draft:** **9-0-0**.

### Q3 — Assurance-level SKOS scheme + ODR-0011 §8a Quality Region

**Joint position: CONCEDE S011 §8a Quality Region.** The `opda:assuranceLevel` scheme is the canonical Quality Region exemplar from S011 Q8 (the scheme **IS** the region — eIDAS Low/Substantial/High is the ordered range itself, not labels for a Quality bearer).

**Pandit load-bearing amendment (DPV governance-sensitivity flag):**

The S011 §8a per-scheme typed-output table marks `opda:assuranceLevel` with the governance-sensitivity flag **lawful-basis-trigger**. This is not decorative. Assurance level is a **load-bearing input** to GDPR Art. 6 (lawful basis for processing) and Art. 9 (special-category data lawful basis) determinations:

- **eIDAS Low** evidence does NOT satisfy Art. 9(2)(g) "substantial public interest" thresholds for special-category data (criminal-conviction-adjacent AML processing, biometric identity verification).
- **eIDAS Substantial** evidence satisfies most Art. 6 lawful-basis requirements but may not satisfy Art. 9(2)(g) without supplementary controls (per ICO *Guidance on Lawful Bases for Processing Special Category Data* 2023 §Substantial public interest).
- **eIDAS High** evidence satisfies Art. 9(2)(g) for the regulated-property-transaction use case (AML MLR 2017 CDD).

**Therefore:** ODR-0009's `opda:assuranceLevel` triple on a Claim is consumed by ODR-0012's DPV co-annotation layer to derive `dpv:hasLawfulBasis`. The Quality Region's ordered range maps to a Method/plan-code-style lawful-basis decision tree. **ODR-0012 inherits this as a load-bearing input** (named in Consequences).

**Iannella note:** Concur. Assurance-level is also the natural ODRL `odrl:Constraint` value if policy expression activates — an `odrl:Permission` with `odrl:constraint [ odrl:leftOperand opda:assuranceLevel ; odrl:operator odrl:gte ; odrl:rightOperand "Substantial" ]` would be the policy shape. Not authored here; flagged for ODR-0012 Q4 / ODR-0016.

**Pair vote draft:** **9-0-0** with Pandit lawful-basis-trigger amendment landed in `## Consequences`.

### Q4 — opda:digest + algorithm SKOS scheme

**Joint position: CONCEDE `opda:digest` + algorithm SKOS scheme.** Local terms `opda:digestAlg` / `opda:digestValue` are bespoke OPDA terms with no PROV-O counterpart (PROV-DM deliberately models no signature notion).

**Pandit caveat (load-bearing distinction):** `opda:digest` is an **integrity-check on the verifiedClaims envelope**, NOT a cryptographic signature. The distinction matters:

- **Integrity-check** — a SHA-256 hash of the canonical JSON-shape of the verifiedClaims structure, computed at verification time, allowing a consumer to detect tampering. No key material; no asserter identity binding. `opda:digestAlg` + `opda:digestValue` is sufficient.
- **Cryptographic signature** — a W3C Data Integrity / VC Data Model 2.0 proof binding the claim to an issuer's key. Requires `cred:`/`did:` infrastructure (Defer-tier per ODR-0002 Q13).

Conflating the two would over-promise: a consumer reading `opda:digest` should NOT infer issuer-key-binding. Signature lives in W3C VC interop territory; **defer to ODR-0016** (per Scope-Check 1 Q7c admission of `cred:`/`did:` to Defer).

**Iannella note:** Concur. ODRL policy expressions also rely on signature-as-distinct-from-integrity (ODRL `odrl:Policy` can carry a `proof:` block per VC integration patterns); the same Q4 / Q8 separation applies symmetrically.

**Pair vote draft:** **9-0-0** with Pandit "integrity-check, not signature" caveat in `## Rules`.

### Q5 — `dct:conformsTo opda:TrustFramework` + SKOS reification of trust-framework values

**Joint position: FOR `dct:conformsTo opda:TrustFramework` (class) + SKOS reification of trust-framework values.**

Two-layer pattern:

1. **`opda:TrustFramework` is a class.** `dct:conformsTo` on the `prov:Activity` (verification) points to a TrustFramework individual. This is the canonical interop predicate (DCMI; OIDC4IDA-compatible) — every Verification activity carries `dct:conformsTo` to whatever framework it claims conformance with.
2. **Trust-framework values reified as `skos:ConceptScheme`.** The framework registry — `opda:UKPropertyDataTrustFramework`, `opda:UKEIDAS`, ... — lives as a SKOS concept scheme under DPV governance discipline (S011 §1a steward declaration; S011 §4a verbatim regulator citation). Each framework concept carries `skos:prefLabel`, `skos:definition` verbatim from the framework's published spec, `dct:source` to the spec URL.

**Pandit load-bearing amendment (governance-grade scheme registry):** The trust-framework registry is **a governance-grade SKOS scheme** — admission to the registry requires the steward-declaration discipline from S011 §1a (named steward + deputy + DCMI Usage Board test). This is not a free-form `xsd:string` list; it is a governed register that downstream `dpv:hasLawfulBasis` decisions depend on (Art. 6 / Art. 9 lawful-basis determinations rely on trust-framework conformance as one input).

**Iannella note:** Concur with the SKOS-reification pattern. ODRL's `odrl:Policy` similarly references named policy frameworks via SKOS schemes in the W3C ODRL Vocabulary — same pattern, different vocabulary. Forward-compatible with ODRL policy authoring at ODR-0012 / ODR-0016 if activated.

**Pair vote draft:** **9-0-0**.

### Q6 — DPV co-annotation pattern (Pandit LOAD-BEARING per Scope-Check 1 Q5)

**Pandit position: ODR-0009 carries a one-paragraph pointer; ODR-0012 owns DPV co-annotation authoring authority.**

Scope-Check 1 Q5 refinement (2026-05-26) settled that DPV co-annotation **authoring authority** lives at ODR-0012, not at the consuming modules. ODR-0009 names the seam (which Evidence subclasses bear PII, which envelope-fields bear PII) but does NOT author the DPV co-annotation pattern itself. The one-paragraph pointer carries:

> **Proposed text for ODR-0009 §Rules:**
>
> > Evidence subclasses bearing PII (`opda:DocumentEvidence` with proprietor names + issuer details; `opda:ElectronicRecordEvidence` with HMRC API responses + NI numbers; `opda:VouchEvidence` with voucher solicitor names + voucher-licence-numbers) inherit the DPV class-level co-annotation pattern from [ODR-0012 §pending](../../ODR-0012-data-governance-layer.md). The handoff is mechanical: ODR-0012's DPV authoring consumes ODR-0009's Evidence subclass list + ODR-0006 §pending Person/Organisation PII-bearing-predicates list. The Q3 lawful-basis-trigger flag on `opda:assuranceLevel` is similarly consumed by ODR-0012 for Art. 6 / Art. 9 lawful-basis decisions.

**Mechanical handoff (named):**

1. ODR-0009 declares Evidence subclasses + envelope-field PII-bearing predicates.
2. ODR-0012 (S012, pending) authors class-level `dpv-pd:hasPersonalDataCategory` triples on the declared classes.
3. Instance-level `dpv:hasLawfulBasis` triples authored at instance generation per ODR-0012's Art. 6 / Art. 9 decision tree (consuming Q3 assurance-level + Q5 trust-framework conformance).

**Pandit note:** This is the same handoff pattern S015 §7a applied for `opda:Address` (class-level baseline `dpv-pd:hasPersonalDataCategory dpv-pd:Address` declared at ODR-0015; variant-conditional refinements routed to ODR-0012). The S015 precedent is now a third citing site for the pattern; **S009 is the fourth citing site**, which fires the ODR-0001 A9 §Artefact identity test spawn-rule (per ODR-0011 §Consequences citing this pattern at four sites).

**Iannella note:** Concur on the seam-pointer pattern. ODRL policy authoring would follow the same handoff pattern if activated (S002 Q10 trigger); ODR-0009 would carry the seam-pointer, ODR-0016 (or a future ODRL-policy ODR) authors the policy shape.

**Pair vote draft:** **9-0-0** on the pointer-only commitment with explicit "ODR-0012 owns" language.

### Q7 — SHACL-over-PROV with sh:xone for evidence-type discrimination (Cagle's framing)

**Joint position: CONCEDE Cagle SHACL-over-PROV.** The schema's `allOf`/`if`/`then`-on-`evidence.type` conditional shape maps cleanly to `sh:xone` over per-type shapes. SHACL-over-PROV-O is the right validation layer.

**Pandit note:** The SHACL shape's `sh:xone` discrimination is also load-bearing for DPV co-annotation dispatch — different Evidence subclasses bear different DPV personal-data categories (`opda:DocumentEvidence` issuer-fields are `dpv-pd:OfficialID`; `opda:VouchEvidence` voucher-fields are `dpv-pd:Identifying` on a *second* data subject). The `sh:xone` dispatch in `opda-shapes.ttl` makes the discrimination machine-readable; the DPV co-annotation in `opda-annotations.ttl` (per ODR-0004 §3a three-graph separation) consumes the same discrimination.

**Iannella note:** Concur.

**Pair vote draft:** **9-0-0**.

### Q8 — VC/DID interop deferral to ODR-0016; ODRL deferral carries from S002 Q10

**Joint position: DEFER to ODR-0016 (W3C VC interop) per Scope-Check 1 Q7c admission of `cred:`/`did:` to Defer tier.**

S009 does NOT bind to W3C VC Data Model 2.0 or DID Core 1.0 today. The Claim/Verifier/Issuer/Holder business-glossary terms align *semantically* to VCDM 2.0 terms but `cred:`/`did:` admission is Defer-tier per ODR-0002 Q13. Activation trigger: when the first VC issuance / DID resolution enters the corpus (consumer-driven, not anticipatory).

**Iannella load-bearing note (ODRL deferral carries from S002 Q10):**

ODRL is the W3C policy-expression standard. Vouch evidence (`opda:VouchEvidence` attestation) is the closest S009 analogue — an attestation is a permission-style statement ("I attest that ..."). **However:** S002 Q10 settled programme-wide that ODRL policy-authoring activates *only* when consent instances enter the corpus (DPV-tagged consent records, W3C VC consent receipts, ODRL `odrl:Permission`/`odrl:Prohibition` instances). The Guarino contradiction (ODRL bites on instances; TBox alone asserts nothing) is the load-bearing reason ODRL stays vocabulary-admitted-but-policy-deferred.

**S009 does NOT bind to ODRL.** The seam-pointer carries: ODR-0009 names the policy-expression deferral; ODR-0012 Q4 owns the activation trigger; ODR-0016 (or a future ODRL-policy ODR) authors the policy shape when consent instances materialise.

Iannella's contribution to S009 is the **ODRL-as-future-extension awareness** without binding here. The qualified attribution form (Q2) is forward-compatible with ODRL; the assurance-level Quality Region (Q3) is forward-compatible with `odrl:Constraint`; the trust-framework SKOS scheme (Q5) is forward-compatible with `odrl:Policy` framework references. **Nothing is authored as ODRL today.**

**Pandit note:** Concur. VC interop and ODRL policy expression are two distinct deferrals (Q8 covers VC; S002 Q10 covers ODRL) with two distinct activation triggers. ODR-0009 names both without authoring either.

**Pair vote draft:** **9-0-0** on deferral; activation triggers named in `## Consequences`.

## Pair-disagreement record

**None.** Pandit and Iannella concur on all eight questions. Pandit's Q3 lawful-basis-trigger amendment and Q4 integrity-vs-signature caveat are pair-joint positions, not divergences. Iannella's Q8 ODRL-deferral-carries-from-S002-Q10 is pair-joint.

## Replies to anticipated DA (Guarino) attacks

Guarino's DA brief is to attack **assurance-tier modelling** — the pair's Q3 position is the load-bearing target.

### Guarino on Q3 — "assurance level is not a Quality Region; it's a meta-property of the verification process"

**Attack reconstructed:** "S011 §8a's Quality Region commitment for `opda:assuranceLevel` treats assurance as if it lived *in* the claim. But assurance level is a meta-property of the *verification process* — a judgement about how strong the chain is. Modelling it as a Quality Region on the Claim entity conflates Quale (the value) with Quality (the bearer relation). Per UFO discipline this is category-incorrect."

**Reply (Pandit):** The S011 §8a Quality Region commitment is precisely the *region* category, not Quality-bearer category. The scheme **IS** the region (Low/Substantial/High as the ordered range itself); the Claim's `opda:assuranceLevel` triple binds the Claim to a *value in* the region. This is the Quale-in-Region pattern Masolo et al. 2003 D18 §4.3 names; it is not the Quality-bearer relation that would conflate.

**Reply (Iannella):** And operationally, the value's `dct:source` resolves to the verification-process metadata (the `prov:Activity`'s `opda:verificationMethod` + `dct:conformsTo` trust-framework). The Claim carries the value; the Activity carries the rationale. Two triples, two layers — no conflation.

### Guarino on Q5 — "trust-framework is a Relator, not a class"

**Attack reconstructed:** "A trust framework is the relator that founds the verification-conformance relationship. Modelling it as a class with SKOS-reified members reifies the relationship-target. Per UFO discipline the Relator pattern is the right structure."

**Reply (Pandit):** The relator/class distinction is the load-bearing modelling question. We argue **class** because the trust framework is a *governance regime* (a socially-recognised, authority-stewarded ConceptScheme) with its own lifecycle, its own steward (UK MHCLG; eIDAS regulator; OPDA itself), and its own published spec URL. The conformance *relation* (`dct:conformsTo`) is what the Activity bears; the framework itself is a class instance, not a relator. ODR-0006's Relator pattern is for cases where the relationship-target has no independent identity (a Proprietorship has no identity outside the proprietor-property-time triple); a TrustFramework has independent identity (the framework persists across all verifications conforming to it).

**Reply (Iannella):** And W3C ODRL's `odrl:Policy` similarly references named frameworks as class instances, not relators. The pattern is consistent across W3C policy/governance vocabularies.

### Guarino on Q6 — "the seam-pointer is a deferral, not a decision"

**Attack reconstructed:** "Pandit's load-bearing Q6 position is to defer DPV authoring to ODR-0012. But Scope-Check 1 Q5 refinement already settled that. S009 is supposed to *make decisions*, not point at future sessions."

**Reply (Pandit):** S009 *does* make decisions on Q6 — five mechanical decisions: (1) which Evidence subclasses bear PII (DocumentEvidence + ElectronicRecordEvidence + VouchEvidence — named); (2) which envelope-fields bear PII (none — confirmed); (3) the seam handoff is mechanical, not deliberative; (4) ODR-0012 consumes the declared list as load-bearing input; (5) the Q3 lawful-basis-trigger flag on `opda:assuranceLevel` is consumed by ODR-0012's Art. 6 / Art. 9 decision tree. Five decisions; one pointer. The pointer is the *output* of the decisions, not a replacement for them.

## Citation-grounding readiness

Pandit's positions cite:

- *Data Privacy Vocabulary 2.0* (Pandit, Polleres, Bos, Brennan, Bruegger et al. 2024 — W3C Community Group Final Report 2024-06-04), specifically §3 *Modules* and DPV-PD specification.
- ICO *Guidance on Lawful Bases for Processing* 2023 and ICO *Guidance on Lawful Bases for Processing Special Category Data* 2023 (Art. 6 / Art. 9 lawful-basis decision criteria).
- GDPR Art. 5(1)(d) accuracy principle (PII-history audit-trail under qualified attribution).
- eIDAS Regulation (EU) No 910/2014 §Levels of Assurance (Low/Substantial/High definitions).
- ODR-0005 §3c PII regime distinction; ODR-0011 §8a Quality Region exemplar + §4a verbatim citation discipline + §1a steward-declaration discipline; ODR-0015 §7a class-level DPV baseline + variant-conditional refinements (third citing site).
- Scope-Check 1 Q5 refinement (DPV authoring authority at ODR-0012) and Q7c (`cred:`/`did:` Defer admission).

Iannella's positions cite:

- W3C *ODRL Information Model 2.2* (Iannella, Villata 2018 — W3C Recommendation 2018-02-15); W3C *ODRL Vocabulary & Expression 2.2*.
- S002 Q10 settled disposition (ODRL vocabulary admitted; policy-authoring activation deferred to ODR-0012 Q4 owner).
- W3C VC Data Model 2.0 (vouch-as-attestation forward-compatibility).

All within ODR-0001 §Citation grounding standards. No source cited without a stable retrievable URL or named-document anchor.
