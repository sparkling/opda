# Gandon + Guizzardi — formal-pair on S009

*Joint pair voice. **Neither is Queen for this session** — Queen is Moreau (PROV-O — extended panel) and DA is Guarino (PROV-O ≠ assurance; PROV-O is not an assurance ontology). The pair is panel teammate. The work is layered: Guizzardi-led on UFO-load-bearing questions (Q1 PROV-O coverage UFO-meta-categorisation; Q5 trust-framework reification; Q7 SHACL-over-PROV evidence-subtype IC discipline), Gandon-led on the W3C/artefact questions (Q2 qualified attribution, Q3 SKOS scheme consume-from-S011, Q4 digest + algorithm enum, Q6 DPV pointer, Q8 VC defer). The pair is joint throughout — this session is the **sixth `kind: pattern` ODR to discharge under A9** (S005 first; S015 second; S011 third; ODR-0017 fourth pattern-extraction record; S006 fifth; S009 sixth). The methodology has stabilised — we write from a template, not from first principles. ODR-0009 inherits the IC discipline (SHACL primary; no `owl:sameAs`; PROV-O succession) plus the seven-category UFO framework from ODR-0011 §8a plus the SHACL-AF non-blocking-rule pattern from ODR-0017 plus the Person/Organisation/Address/Agent classes from ODR-0006/0015. The work is to apply, not to invent.*

## Stance summary

ODR-0009 is the well-developed stub from session-001 Q6 (owned by Moreau). The §Decision commits to a **PROV-O backbone plus separate assurance layer**: PROV-O carries ≈80% of the OIDC4IDA/eIDAS envelope (claim-as-Entity; verification-as-Activity; verifier-as-Agent; evidence-as-Entity-subclass; derivation chains); the residual 5 items (trust_framework, validation-vs-verification, cryptographic digest, assurance level, txn) are modelled *around* PROV in a dedicated layer built from `dct:`, SKOS and narrow local `opda:` terms. The three exemplars (document-evidence Grant of Probate; electronic-record HMRC API; vouch SRA-regulated solicitor) are the §8a gate test.

What S009 must add to clear A9 §Per-kind discipline (b): (a) UFO meta-category commitments for `opda:Claim`, `opda:Verification`, the three evidence subtypes (`opda:DocumentEvidence` / `opda:ElectronicRecordEvidence` / `opda:VouchEvidence`), the `opda:TrustFramework` class; (b) IC over named hard cases for each evidence subtype (the differentia between attestation event and documentary instrument is load-bearing — Guizzardi-side commitment); (c) artefact realisation via SHACL `sh:xone` shapes per evidence-type + PROV-O reified events + the **sixth citing site of ODR-0017's SHACL-AF rule pattern** (PROV-O Claims rule — anticipated at ODR-0017 §References).

The depth questions we own: Q1 (80%/5-residue pressure-test — Guizzardi-led UFO categorisation of each PROV-O term used); Q2 (qualified attribution discipline — Gandon-led W3C PROV-O Recommendation grounding); Q4 (cryptographic digest + algorithm enum — Gandon-led local terms minted per ODR-0011 §7a); Q5 (trust-framework reification — Guizzardi-led UFO Method/plan code vs Social Object distinction); Q7 (SHACL-over-PROV `sh:xone` dispatch + evidence-subtype IC discipline — joint). Q3 concedes to S011 §8a (settled — Quality Region scheme for `opda:assuranceLevel`). Q6 is a one-paragraph pointer to ODR-0012 per Scope-Check 1 Q5 (settled). Q8 defers to ODR-0016 (per Scope-Check 1 Q7c — `cred:` / `did:` activation triggers named there).

What is at stake for UFO theory and for the methodology if S009 settles wrong: the three evidence subtypes are **the first cleanly-disjoint sub-Kind family** the programme has modelled (Person/Organisation are sibling Kinds but not within a common discriminator superclass; Address-variants are values not Kinds). The evidence subtypes share the `prov:Entity` discriminator but have genuinely different UFO Substance Kinds with **different ICs** (the attestation event IC differs from the documentary instrument IC differs from the API-response IC). If Q7's `sh:xone` dispatch fails to discriminate the three properly, downstream sessions (S012 DPV PII tags on evidence; S010 verifiedClaims overlay; S013 SHACL severity on PII) inherit a flat-evidence anti-pattern that mirrors the implicit-Property defect ODR-0005 already exorcised.

## Per-question positions

### Q1 — PROV-O coverage: 80%/5-residue pressure-test

**Guizzardi (lead).** The stub's 80%/5-residue split is correct in shape; we pressure-test it against the three exemplars and the UFO meta-category framework (ODR-0011 §8a).

**The 80% PROV-O coverage maps cleanly to UFO meta-categories.**

| Stub commitment | UFO meta-category | DOLCE category | Source |
|---|---|---|---|
| `opda:Claim rdfs:subClassOf prov:Entity` | **Substance Kind** (proposition-as-individual; Searle 1995 social object) | NonPhysicalEndurant | Guizzardi 2005 Ch. 4; Searle 1995 |
| `opda:Verification rdfs:subClassOf prov:Activity` | **Perdurant / Event** (temporal-extent with `prov:atTime`) | Perdurant | Guizzardi 2005 Ch. 4; PROV-O §3 |
| `opda:Verifier rdfs:subClassOf prov:Agent` | **Substance Kind** (carrier of capacity; Person OR Organisation) | Endurant | Guizzardi 2005 Ch. 4; ODR-0006 inheritance |
| `opda:DocumentEvidence rdfs:subClassOf prov:Entity` | **Substance Kind** (documentary instrument; IC = (issuer, instrument-type, identifier)) | NonPhysicalEndurant | Guizzardi 2005 Ch. 4 |
| `opda:ElectronicRecordEvidence rdfs:subClassOf prov:Entity` | **Substance Kind** (API-response-as-record; IC = (source-system, response-timestamp, payload-digest)) | NonPhysicalEndurant | Guizzardi 2005 Ch. 4 |
| `opda:VouchEvidence rdfs:subClassOf prov:Entity` | **Substance Kind** (attestation event reified as Entity; IC = (voucher-Agent, attestation-date, statement)) | NonPhysicalEndurant | Guizzardi 2005 Ch. 4 |

The three evidence subtypes are sibling Substance Kinds under a common `prov:Entity` discriminator — they share the PROV-O grounding but have **genuinely different ICs**. This is the cleanest sub-Kind family the programme has modelled; it requires the per-subtype IC discipline that Q7 operationalises via `sh:xone`.

**Pressure-test the 5-item residue.** The exemplars and the stub's §Decision table each name five items. We confirm all five and reject candidates for a sixth.

| Residue item | Why PROV-O cannot carry it | Modelled in assurance layer via |
|---|---|---|
| `trust_framework: "uk_pdtf"` | Governance regime, not provenance primitive | `dct:conformsTo opda:UKPropertyDataTrustFramework` (Q5) |
| `validation_method` vs `verification_method` | OIDC4IDA bifurcation PROV's single `prov:Plan` blurs | Two sub-plans + SKOS-coded methods (ODR-0011) |
| Cryptographic `digest` (alg + value) | PROV has no signature/hash notion | `opda:digest` literal + algorithm SKOS scheme (Q4) |
| `opda:assuranceLevel` (eIDAS Low/Substantial/High) | Quality judgement, not provenance relation | SKOS Quality Region scheme (Q3 — settled by ODR-0011 §8a) |
| `txn` (verifier transaction reference) | External-system correlation key | `dct:identifier` on `opda:Verification` |

**Candidates for a sixth residue item — rejected.**

1. **`time` (the single OIDC4IDA verification time).** Not a sixth — `time` maps cleanly to `prov:atTime` on the Verification Activity and `prov:generatedAtTime` on the resulting verified-claim Entity. Within the 80% PROV coverage. (Exemplars confirm: `opda-x:verification-activity prov:atTime "2024-03-12T11:30:00Z"^^xsd:dateTime`.)
2. **`evidence.type` discriminator.** Not a sixth — the discriminator is itself the type-of-Entity classification (per Q7); it is the *mechanism* for the per-subtype IC discipline, not a residue. SKOS-coded scheme via ODR-0011.
3. **`access_token` (for electronic-record API responses).** Folded into the digest residue — same governance class (cryptographic credential infrastructure PROV does not model). The stub's §Decision table already names it parenthetically next to digest.

**Pair vote on Q1.**

- **Gandon vote: FOR 80%/5-residue split confirmed.** Five-item residue holds under pressure-test; PROV-O coverage maps to clean UFO meta-categories (Substance Kind for Entity-derivatives; Event for Activity; Substance Kind for Agent). Re-confirm whenever upstream `verifiedClaims` schema changes (standing review obligation per stub §Consequences).
- **Guizzardi vote: FOR same** — three evidence subtypes are sibling Substance Kinds; each has its own IC; the discipline is operational, not noise.

---

### Q2 — Qualified attribution discipline

**Gandon (lead).** **FOR qualified form.** `prov:qualifiedAttribution` with `prov:hadRole` is the W3C-grade form per PROV-O Recommendation §3.6 (Moreau & Missier 2013). The binary `prov:wasAttributedTo` shortcut discards `validation_method`/`verification_method` information — operationally fatal for OIDC4IDA conformance.

**The vouch exemplar settles the discipline.** The exemplar already encodes:

```turtle
opda-x:vouch-attribution
    a prov:Attribution ;
    prov:agent opda-x:solicitor-andrea-kessler ;
    prov:hadRole opda:VoucherRole .

opda-x:claim-attribution
    a prov:Attribution ;
    prov:agent opda-x:aaron-patel ;
    prov:hadRole opda:VerifiedResidencySubjectRole .
```

Two Attributions, each with `prov:hadRole` declaration — the voucher's role is `opda:VoucherRole`; the claim's subject is `opda:VerifiedResidencySubjectRole`. Both Roles are sortal UFO Roles (per ODR-0006 §Role layer), founded by the Verification Activity.

**SHACL operationalisation.**

```turtle
opda:VerificationShape a sh:NodeShape ;
    sh:targetClass opda:Verification ;
    sh:property [
        sh:path prov:qualifiedAttribution ;
        sh:class prov:Attribution ;
        sh:minCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Verification activity must have at least one prov:qualifiedAttribution carrying validation_method/verification_method via prov:hadRole."
    ] .

opda:AttributionShape a sh:NodeShape ;
    sh:targetClass prov:Attribution ;
    sh:property [
        sh:path prov:hadRole ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Attribution must carry exactly one prov:hadRole (the validation_method or verification_method)."
    ] ;
    sh:property [
        sh:path prov:agent ;
        sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] ) ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Attribution's prov:agent must be Person or Organisation (ODR-0006 §Kind layer)."
    ] .
```

The bearer-class disjunction reuses the ODR-0006 §Q2 SHACL pattern (`sh:or` for cross-sortal Role-bearer constraints). The `prov:hadRole` value is drawn from the `opda:VerificationMethodScheme` SKOS scheme (ODR-0011 §1a; Method/plan code UFO category per §8a).

**Guizzardi.** Concur. UFO grounding: `prov:Attribution` is itself a Relator (it mediates the (Entity, Agent, Role) triple); the `prov:hadRole` value is a sortal Role (anti-rigid; externally founded by the Verification Activity). The pattern matches ODR-0006 §Q3 Proprietorship Relator discipline exactly — Attribution-as-Relator mediating sortal-specific Roles.

**Pair vote on Q2.**

- **Gandon vote: FOR `prov:qualifiedAttribution` qualified form + `prov:hadRole` SKOS-coded from `opda:VerificationMethodScheme` + SHACL `sh:Violation` on missing qualified form + bearer-class disjunction `sh:or` per ODR-0006 §Q2.** W3C-grade discipline; OIDC4IDA conformance preserved.
- **Guizzardi vote: FOR same** — Attribution-as-Relator matches the ODR-0006 §Q3 Proprietorship Relator pattern; sortal-Role mediation is canonical UFO.

---

### Q3 — Assurance level vocabulary

**Gandon (lead).** **CONCEDE to S011 §8a Quality Region.** Q3 is brief — the work was done at Session 011 (2026-05-27; Full Council; substrate mode; B3 pilot typed-output verdict 4-0).

The `opda:assuranceLevel` scheme is settled as **Quality Region** in the seven-category UFO framework per ODR-0011 §8a. Members carry `opda:ufoCategory "QualityRegion"`; values are eIDAS-aligned (Low / Substantial / High) per the OIDC4IDA spec. The scheme is **owned by ODR-0011** (per ODR-0011 §Rules — Domain ownership clause); ODR-0009 consumes the scheme via the `opda:assuranceLevel` predicate.

**Provenance/assurance schemes domain-ownership confirmed:** ODR-0011 §Rules states "the **provenance/assurance schemes** (`evidence type`, `verification-method` code, `opda:assuranceLevel`) are owned by ODR-0009". This conflicts with the S011-settled position — Quality Region scheme membership is authored at ODR-0011 §8a, NOT in ODR-0009. **Resolution: ODR-0011's §Rules clause refers to *content authoring* (which values exist); ODR-0011 §8a authors the *UFO meta-category* (Quality Region) for the scheme.** ODR-0009 owns the assuranceLevel scheme's *content* (Low / Substantial / High + any PDTF-specific extensions); ODR-0011 owns the scheme's *meta-category classification*. The two are non-overlapping.

**Guizzardi.** Concur. Quality Region is the correct UFO meta-category: assurance level is a **quality value** of the verified Claim Entity, drawn from a Region (the SKOS scheme) per Masolo et al. 2003 D18 §4.3. The Region is *not* a Substance Kind — Substance Kinds supply identity; the Region supplies value-of-Quality. The three exemplars confirm: `opda:assuranceLevel "Low"` (vouch); `"Substantial"` (document; electronic-record). The literal-with-Region pattern is mechanically identical to `opda:councilTaxBand "B"` (ODR-0008 territory; per ODR-0011 §8a Quality Region precedent).

**Pair vote on Q3.**

- **Gandon vote: CONCEDE to S011 §8a Quality Region.** Brief confirmation; no new work; ODR-0009 consumes the scheme + emits the per-instance `opda:assuranceLevel` predicate.
- **Guizzardi vote: CONCEDE** — Quality Region is correct UFO; literal-with-Region is mechanical.

---

### Q4 — Cryptographic digest

**Gandon (lead).** **FOR `opda:digest` local term + algorithm SKOS scheme + `sh:pattern` for canonical hash form.** Three components, each justified.

**1. `opda:digest` as bespoke local term.** PROV-DM models no signature notion (per Moreau & Missier 2013 §1 Scope statement). Forcing a `prov:` extension violates the reuse driver. Bespoke `opda:digest` is one of three bespoke `opda:` terms in this layer (with `opda:assuranceLevel` and the verification-method predicates; per stub §Rules "These are the only bespoke `opda:` terms in this layer"). Range: `xsd:string` with `sh:pattern` constraint per ODR-0011 §7a (no custom datatype; pattern over `xsd:string` is the W3C-grade interop form).

**2. Algorithm SKOS scheme `opda:DigestAlgorithmScheme`.** Algorithm choices (SHA-256, SHA-3-512, BLAKE3, etc.) are a controlled vocabulary — per ODR-0011 §1a discipline, every enum becomes a `skos:ConceptScheme`. UFO meta-category: **Method/plan code** (per ODR-0011 §8a) — algorithms are procedural methods for digest computation. `dct:source` to NIST FIPS 180-4 (SHA-2 family) + NIST FIPS 202 (SHA-3 family).

**3. SHACL `sh:pattern` for the canonical hash form.** The PDTF v3 schema encodes digest values as `alg:value` strings (e.g. `"sha256:9b8d4f..."`). The SHACL discipline:

```turtle
opda:DigestShape a sh:NodeShape ;
    sh:targetClass opda:Evidence ;
    sh:property [
        sh:path opda:digest ;
        sh:datatype xsd:string ;
        sh:pattern "^(sha256|sha384|sha512|sha3-256|sha3-512):[0-9a-f]+$" ;
        sh:severity sh:Violation ;
        sh:message "opda:digest must match canonical 'algorithm:hex-value' form; algorithm must be in opda:DigestAlgorithmScheme."
    ] .
```

The pattern admits hex-encoded values for the SHA-2 and SHA-3 families; additional algorithms (BLAKE3; future post-quantum) require pattern extension via ODR amendment (anticipated as the scheme grows).

**Co-existence with W3C Data Integrity (Verifiable Credentials Data Integrity 1.0).** W3C VC-DI is the canonical layer for *signed* VCs; `opda:digest` is a *content-hash* (integrity verification), not a *signature* (authenticity verification). The two layers compose: a VC carries both `opda:digest` (content-hash for the claim payload) AND a `sec:proof` (Data Integrity signature). ODR-0016 (deferred — VC/DID binding) owns the integration. ODR-0009 commits to `opda:digest` for the content-hash layer; ODR-0016 will own the signature layer when activated.

**Guizzardi.** Concur. UFO grounding for the digest layer:

- `opda:digest` is a **Quality** of the Evidence Entity — a particularised property whose value persists with the Entity. Reading per Guizzardi 2005 Ch. 4: Quality is a particular (not a value); the value is the literal `"sha256:9b8d4f..."`; the Quality is the relation between the Evidence Entity and the value. SHACL `sh:datatype xsd:string` + `sh:pattern` operationalises the Quality-to-value binding.
- The algorithm scheme is **Method/plan code** (per ODR-0011 §8a) — the algorithm is a *procedure* for computing the digest. Method/plan codes have the right UFO grain for algorithm classification.

**Pair vote on Q4.**

- **Gandon vote: FOR `opda:digest` (xsd:string with sh:pattern) + `opda:DigestAlgorithmScheme` SKOS scheme + SHACL `sh:Violation` on malformed digest + W3C Data Integrity composition deferred to ODR-0016.** Three bespoke `opda:` terms in this layer maintained; no PROV-extension; no custom datatype.
- **Guizzardi vote: FOR same** — digest is a Quality; algorithm scheme is Method/plan code; UFO categorisation is operational.

---

### Q5 — `trust_framework: "uk_pdtf"` reification

**Guizzardi (lead).** **FOR dual modelling: `dct:conformsTo opda:TrustFramework` (class) PLUS reified as SKOS concept in `opda:TrustFrameworkScheme` (sister vocabulary).** The two are non-redundant — they discharge different operational roles.

**`opda:TrustFramework` as a class (UFO Substance Kind / DOLCE NonPhysicalEndurant — Social Object).** Per Searle 1995 + Guizzardi 2005 Ch. 4: a Trust Framework is a legal-institutional entity constructed by collective acceptance + governance authority. It is a Substance Kind (rigid, identity-supplying, sortal — every Trust Framework is one Trust Framework, with its own governance authority and lifecycle). `opda:UKPropertyDataTrustFramework` is the OPDA instance; other instances (eIDAS itself; ToIP; the BBfS GLEIF trust framework) are sibling instances of the Kind. The exemplars use `dct:conformsTo <opda:UKPropertyDataTrustFramework>` — the predicate is the W3C-grade interop form (Dublin Core Terms Recommendation; standardised dereferencing). 

**Trust framework reified as SKOS concept.** The same trust framework also exists as a `skos:Concept` in `opda:TrustFrameworkScheme` — `opda:trust-framework/uk-pdtf` `skos:prefLabel` "UK Property Data Trust Framework"@en. This admits the trust framework to discovery (SKOS scheme navigation; `skos:broader`/`narrower` relations to broader trust-framework families if any); enables `skos:exactMatch` to external trust-framework registers (ToIP Trust Registry Service; UK government trust framework directory); supports governance (SKOS scheme membership criteria from ODR-0011 §1a/§5a — adding/deprecating frameworks via the standard lifecycle).

**Why dual modelling (not just one).**

- **Class-only** would lose the SKOS scheme governance — frameworks would be minted as opaque class instances without the deprecation lifecycle (per ODR-0011 §5a three-case lifecycle) or the cross-scheme `skos:exactMatch` mapping.
- **SKOS-only** would lose the `dct:conformsTo` interop predicate — downstream consumers expecting Dublin Core conformance (the W3C/DCMI mainstream pattern) would receive a `skos:Concept` URI where they expect a class URI. The two predicates are operationally different.

The dual modelling is consistent with the Property pattern (ODR-0005 §Q4 FIBO LegalEntity + LEI registry — class layer + identifier-scheme layer). The Trust Framework is the Provenance-layer parallel.

**The class-to-concept binding** is `opda:UKPropertyDataTrustFramework skos:exactMatch opda:trust-framework/uk-pdtf`. NEVER `owl:sameAs` (inherits ODR-0005 Rule 5 anti-pattern — `owl:sameAs` propagates irreversibly under reasoning; `skos:exactMatch` is the bounded equivalence).

**Gandon.** Concur. W3C-side grounding:

- **`dct:conformsTo` is Dublin Core Terms canonical (Hillmann & Westbrook 2008; DCMI Usage Board).** The predicate's range is `dct:Standard` (per DCMI Type Vocabulary) — `opda:TrustFramework rdfs:subClassOf dct:Standard` lands the class in the right superclass.
- **SKOS scheme operations** (`skos:broader` to broader trust-framework families; `skos:exactMatch` to external registers) are SKOS Reference §4.4 canonical. The `opda:TrustFrameworkScheme` is mechanically the sister of `opda:DigestAlgorithmScheme` (Q4) and `opda:VerificationMethodScheme` (Q2) — three Method/plan code / Substance-Kind-of-Standard sister vocabularies in the assurance layer.

**Pair vote on Q5.**

- **Guizzardi (lead) vote: FOR dual modelling — `opda:TrustFramework` class (UFO Substance Kind / DOLCE NonPhysicalEndurant Social Object) + reified `skos:Concept` in `opda:TrustFrameworkScheme` + `skos:exactMatch` binding the two (NEVER `owl:sameAs`).** Class for `dct:conformsTo` interop; scheme for governance + discovery.
- **Gandon vote: FOR same + `opda:TrustFramework rdfs:subClassOf dct:Standard` Dublin Core superclass for `dct:conformsTo` range alignment + SKOS scheme operations per ODR-0011 §1a/§5a.**

---

### Q6 — DPV co-annotation seam

**Gandon (lead).** **FOR one-paragraph pointer to ODR-0012 per Scope-Check 1 Q5 (settled).** No authoring here; just confirm the seam.

The Scope-Check 1 vote 8-1 (with Pandit's authorship-routing refinement adopted) settled the question: ODR-0012 owns DPV co-annotation **authoring**; ODR-0009 carries a **one-paragraph pointer** at the DPV co-annotation seam. The forward-supersession mechanism (`## Supersession scope:` from ODR-0012 onto ODR-0009) is retained as the amendment vehicle if ODR-0012's deliberation surfaces material changes.

**The pointer paragraph (proposed text for ODR-0009 §Rules — DPV co-annotation section).**

> Evidence Entities and Voucher Agents bear PII subject to DPV co-annotation. The `document_number` / `personal_number` predicates on `opda:DocumentEvidence` are `dpv-pd:OfficialID` / `dpv-pd:Identifying`; a `opda:Vouch`'s `voucher.name` / `voucher.birthdate` / `voucher.occupation` are third-party PII about a Person who is not the Claim's subject. **DPV co-annotation authoring lives in ODR-0012** (per Scope-Check 1 Q5 refinement vote 8-1, 2026-05-26). This ODR identifies the seam: which Entity-subtypes bear PII; which predicates carry sensitive categories; the handoff to ODR-0012's per-instance authoring. The forward-supersession mechanism (`## Supersession scope:` from ODR-0012 onto ODR-0009) is the amendment vehicle if Q5 deliberation in S012 surfaces material change.

**The PII-bearing subtypes the pointer identifies** (class-level only — instance-level authoring in ODR-0012):

- `opda:DocumentEvidence` — bears `opda:documentNumber` (OfficialID), `opda:personalNumber` (Identifying), `opda:issuerName` (Organisation reference, generally non-PII).
- `opda:ElectronicRecordEvidence` — bears `opda:apiResponsePayload` (may contain PII depending on source; HMRC API response carries tax-identifying data → `dpv-pd:NationalIdentificationNumber`).
- `opda:VouchEvidence` — bears `opda:voucherName`, `opda:voucherBirthdate`, `opda:voucherOccupation` (third-party PII about the voucher Person, who is NOT the Claim's subject — GDPR Art. 14 third-party data rules apply).

**Guizzardi.** Concur. The pointer paragraph is the right grain — class-level identification of PII-bearing seams; instance-level authoring routed to ODR-0012. UFO grounding: PII is a Quality of the Person Entity (per ODR-0006 §Thread 4 — Person carries DPV PII tags via class-level `dpv-pd:hasPersonalDataCategory dpv-pd:Identifying` baseline); the evidence-Entity-borne PII is the Person Entity's Quality surfaced through the evidence (the voucher's identifying data IS the voucher Person's Quality, surfaced via the Vouch's `opda:voucherName` predicate). The DPV layer authors the Quality-classification; ODR-0009 declares the predicate exists.

**Pair vote on Q6.**

- **Gandon vote: FOR one-paragraph pointer to ODR-0012; no authoring in S009 + identify class-level PII-bearing seams (DocumentEvidence; ElectronicRecordEvidence; VouchEvidence) + retain forward-supersession mechanism.** Brief confirmation; settled by Scope-Check 1 Q5.
- **Guizzardi vote: FOR same** — class-level seam identification is the right grain; ODR-0012 owns instance-level authoring.

---

### Q7 — SHACL-over-PROV `sh:xone` dispatch

**Guizzardi (lead, joint with Gandon).** **FOR `sh:xone` dispatch on `opda:evidenceType` with three per-subtype shapes.** This is the load-bearing IC discipline — each evidence subtype has its own IC and its own SHACL discipline.

**The three per-subtype shapes.**

```turtle
opda:EvidenceShape a sh:NodeShape ;
    sh:targetClass opda:Evidence ;
    sh:xone (
        opda:DocumentEvidenceShape
        opda:ElectronicRecordEvidenceShape
        opda:VouchEvidenceShape
    ) ;
    sh:severity sh:Violation ;
    sh:message "Every opda:Evidence must conform to exactly one of the three evidence-subtype shapes (sh:xone over DocumentEvidence | ElectronicRecordEvidence | VouchEvidence)." .

opda:DocumentEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:DocumentEvidence ;
    sh:property [
        sh:path opda:documentType ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "DocumentEvidence requires opda:documentType (e.g. 'grant-of-probate'; 'passport'; 'driving-licence')."
    ] ;
    sh:property [
        sh:path opda:documentIssuer ;
        sh:or ( [ sh:class opda:Organisation ] [ sh:class opda:Person ] ) ;
        sh:minCount 1 ;
        sh:message "DocumentEvidence requires opda:documentIssuer (Organisation or Person — typically an authority: HMCTS, HM Passport Office, DVLA)."
    ] ;
    sh:property [
        sh:path opda:digest ; sh:datatype xsd:string ; sh:pattern "^(sha256|sha384|sha512|sha3-256|sha3-512):[0-9a-f]+$" ; sh:severity sh:Warning ;
        sh:message "DocumentEvidence SHOULD carry opda:digest (per Q4 discipline)."
    ] .

opda:ElectronicRecordEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:ElectronicRecordEvidence ;
    sh:property [
        sh:path opda:apiEndpoint ; sh:datatype xsd:anyURI ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "ElectronicRecordEvidence requires opda:apiEndpoint (the dereferenceable API URL)."
    ] ;
    sh:property [
        sh:path opda:apiResponseTimestamp ; sh:datatype xsd:dateTime ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "ElectronicRecordEvidence requires opda:apiResponseTimestamp (real-time API verification trace)."
    ] ;
    sh:property [
        sh:path opda:apiSourceAuthority ; sh:class opda:Organisation ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "ElectronicRecordEvidence requires opda:apiSourceAuthority (HMRC, Companies House, GLEIF, etc.)."
    ] .

opda:VouchEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:VouchEvidence ;
    sh:property [
        sh:path opda:voucherAgent ;
        sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] ) ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "VouchEvidence requires opda:voucherAgent (Person OR Organisation — sortal Voucher Role bearer)."
    ] ;
    sh:property [
        sh:path opda:attestationDate ; sh:datatype xsd:date ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "VouchEvidence requires opda:attestationDate (date the voucher signed the attestation)."
    ] ;
    sh:property [
        sh:path opda:attestationStatement ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ;
        sh:message "VouchEvidence requires opda:attestationStatement (the substantive content of the vouch)."
    ] .
```

**The shapes test against the three exemplars.**

- `claim-with-document-evidence.ttl` (Grant of Probate) → conforms to `opda:DocumentEvidenceShape` (documentType "grant-of-probate"; documentIssuer HMCTS; digest present). Fails the other two (no apiEndpoint; no voucherAgent). `sh:xone` returns exactly-one-conforming. PASS.
- `claim-with-electronic-record-evidence.ttl` (HMRC API) → conforms to `opda:ElectronicRecordEvidenceShape` (apiEndpoint present; apiResponseTimestamp present; apiSourceAuthority HMRC). Fails the other two. PASS.
- `claim-with-vouch-evidence.ttl` (SRA solicitor vouch) → conforms to `opda:VouchEvidenceShape` (voucherAgent the solicitor; attestationDate present; attestationStatement present). Fails the other two. PASS.

**Why `sh:xone` and not `sh:or`.** `sh:or` admits multiple conforming branches; `sh:xone` requires exactly-one. The evidence subtypes are mutually exclusive — a single Evidence Entity is *either* a Document *or* an ElectronicRecord *or* a Vouch, never two. `sh:xone` operationalises the mutual-exclusion discipline (per SHACL Core §4.6.4). Hypothetical hybrid cases (e.g. a digitally-signed-document-issued-by-an-API) would be modelled as two separate Evidence Entities, not one Entity belonging to both subtypes.

**Gandon.** Concur. W3C-side grounding: `sh:xone` is SHACL Core §4.6.4 canonical for exactly-one-of constraints. The shapes graph placement is `opda-shapes.ttl` (per ODR-0004 §3a three-graph separation); the per-instance evidence Entities live in the data graph (`opda-instances.ttl` or per-Property graphs).

**The sixth citing site of ODR-0017 SHACL-AF pattern.** ODR-0009 commits to a SHACL-AF non-blocking rule for PROV-O succession (when one Verification consumes another Verification's output, the `prov:wasInformedBy` chain is materialised at `sh:Info` severity per the ODR-0017 §1a template). The rule:

```turtle
opda:VerificationChainNonBlockingRule a sh:NodeShape ;
    sh:targetClass opda:Verification ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentClaim ?priorVerification ?priorClaim WHERE {
                $this prov:generated ?currentClaim .
                OPTIONAL {
                    $this prov:wasInformedBy ?priorVerification .
                    ?priorVerification prov:generated ?priorClaim .
                }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "{$this} generated {?currentClaim} ← informed by {?priorVerification} generating {?priorClaim} (where defined)"
    ] .
```

The rule materialises the identity → AML → source-of-funds verification chain (per stub §Worked examples) into the validation report at `sh:Info`. ODR-0017 §References cites ODR-0009 as the sixth citing site (anticipated; flagged for ODR-0017 author-only retrofit).

**Pair vote on Q7.**

- **Guizzardi vote: FOR `sh:xone` over three per-subtype shapes (Document / ElectronicRecord / Vouch) + per-subtype IC discipline operationalised + the three exemplars as `sh:xone` regression tests + sixth citing site of ODR-0017 SHACL-AF pattern for PROV-O Verification chain materialisation.**
- **Gandon vote: FOR same + SHACL Core §4.6.4 `sh:xone` canonical form + shapes-graph placement per ODR-0004 §3a + the sixth citing site retrofit to ODR-0017 References.**

---

### Q8 — W3C VC interop

**Gandon (lead).** **DEFER to ODR-0016 per Scope-Check 1 Q7c.** Q8 is brief — Session 016 owns the `cred:` / `did:` binding; activation triggers are named there.

**The deferral terms.** Per Scope-Check 1 Q7c: ODR-0002 admits the `cred:` and `did:` prefixes; ODR-0016 (Session 016, deferred-until-trigger) owns the binding deliberation. Activation triggers: (a) Session 009 Q8 surfaces VC-side decisions (this question); (b) Session 012 Phase-2 consent receipts; (c) a real wallet/DID consumer arrives.

**What S009 commits to (without binding).**

- **`opda:Claim` is structurally compatible with `cred:VerifiableCredential`.** The PROV-O backbone (`prov:Entity` discriminator; `prov:wasGeneratedBy` to a Verification Activity; `prov:wasAttributedTo` to an Issuer Agent) maps cleanly to the VC Data Model 2.0 structure (the `credentialSubject` is the verified Claim; the `issuer` is the Verifier; the `proof` is the Data Integrity signature). The structural mapping is preserved by the `opda:Claim rdfs:subClassOf prov:Entity` commitment.
- **The mapping is *not* declared in ODR-0009.** Declaring `opda:Claim rdfs:subClassOf cred:VerifiableCredential` in this ODR would pre-empt Session 016's binding deliberation. The deferral is genuine — there are VC-side decisions (signature suite selection; credential-status mechanism; revocation registry binding) that S009 cannot adjudicate without ODR-0016.

**What ODR-0016 will own when activated.**

- The `opda:Claim rdfs:subClassOf cred:VerifiableCredential` (or `owl:equivalentClass`) declaration.
- The `opda:digest` (Q4) ↔ `sec:proof` (W3C Data Integrity) composition.
- The Issuer mechanism: `cred:issuer` vs `prov:wasAttributedTo` (the qualified attribution per Q2).
- DID method admission (`did:key`, `did:web`, etc.) — currently deferred per Scope-Check 1.

**Guizzardi.** Concur. Q8 deferral is the right move — the structural compatibility is preserved by the PROV-O grounding; the binding decision waits for ODR-0016 activation. UFO grounding is unaffected — `opda:Claim` is a Substance Kind regardless of whether it is also a `cred:VerifiableCredential`; the subclass relation when declared adds W3C-VC interop without changing the UFO category.

**Pair vote on Q8.**

- **Gandon vote: DEFER to ODR-0016 per Scope-Check 1 Q7c + record structural compatibility (PROV-O backbone preserves VC interop without commitment) + Q8 ratification triggers Session 016 activation.** No binding here; named-deferred per programme plan.
- **Guizzardi vote: DEFER** — structural compatibility preserved; UFO grounding unaffected by the deferral.

---

## Cross-cutting concerns

**Thread 1: A9 per-kind discipline contract (sixth `kind: pattern` ODR to discharge).** ODR-0005 was first (Property identity crux); ODR-0015 was second (Address); ODR-0011 was third (Enumeration vocabularies); ODR-0017 was fourth (the pattern-extraction record itself); ODR-0006 was fifth (Agents & Roles); ODR-0009 is the sixth. The A9 discipline (a) UFO/DOLCE meta-category + (b) IC over named hard cases + (c) artefact realisation continues to operate. ODR-0009 produces a §Operational specifications section with subsections 2a (UFO category per class: Claim + Verification + Verifier + DocumentEvidence + ElectronicRecordEvidence + VouchEvidence + TrustFramework), 3a (per-evidence-subtype IC over hard cases — the SHACL `sh:xone` shapes operationalise this), 4a (cryptographic digest discipline), 5a (trust-framework dual modelling), 7a (SHACL-over-PROV `sh:xone` dispatch), 8a (the three exemplars as gate test).

**Thread 2: ODR-0017 SHACL-AF pattern sixth citing site.** The Verification-chain non-blocking rule (Q7) is the sixth citing site of ODR-0017 (after ODR-0005 §6a UPRN succession; ODR-0011 §5a concept deprecation; ODR-0015 §4a INSPIRE succession; ODR-0006 multiple — Person identity, Organisation succession, Proprietorship succession, ParticipantStatusTransition). The pattern is becoming dense — the same template (`sh:NodeShape sh:sparql sh:select ... sh:severity sh:Info`) re-instantiates across six domains. Future sub-pattern extraction (e.g. PROV-O-specific Verification-chain pattern) may surface — flagged for future session, not blocking S009.

**Thread 3: The three bespoke `opda:` terms in the assurance layer.** Per stub §Rules "These are the only bespoke `opda:` terms in this layer". The pair confirms:

- `opda:digest` (Q4) — bespoke; no PROV-extension; xsd:string with sh:pattern.
- `opda:assuranceLevel` (Q3 — settled by S011) — bespoke; SKOS Quality Region scheme.
- The verification-method predicates (Q2) — `opda:validationMethod`, `opda:verificationMethod` — bespoke; SKOS Method/plan code schemes (per ODR-0011 §8a).

The three bespoke terms minted in the assurance layer are operationally minimal — everything else reuses PROV-O, `dct:`, SKOS, or DPV (per stub §Decision). The minimality discipline matches ODR-0011 §Rules domain-ownership: each layer mints only what it must.

**Thread 4: The W3C alignment story (consistent with the precedents).** Q1 PROV-O coverage aligns with PROV-O Recommendation (Moreau & Missier 2013); Q2 qualified attribution aligns with PROV-O §3.6; Q3 assurance level concedes to ODR-0011 §8a Quality Region (S011 settled); Q4 digest aligns with NIST FIPS 180-4/202 algorithm vocabularies; Q5 trust framework aligns with Dublin Core `dct:conformsTo` + SKOS scheme governance; Q6 DPV pointer routes to ODR-0012 (Scope-Check 1 Q5 settled); Q7 SHACL `sh:xone` aligns with SHACL Core §4.6.4; Q8 defers to ODR-0016 (Scope-Check 1 Q7c). The verdicts cohere as a single W3C-and-foundational-ontology-grounded modelling.

**Thread 5: The PROV-O succession discipline operationalised here.** Per ODR-0001 A9 §Artefact identity test inheritance: each `kind: pattern` ODR re-instantiates the PROV-O succession discipline for its own subject matter. ODR-0009 re-instantiates for evidence-Entity lifecycle (revocation; supersession; chain-of-derivation). The discipline holds: no `owl:sameAs` across evidence-Entity surfaces (inherits ODR-0005 Rule 5); reified events for lifecycle transitions; `prov:wasInformedBy` for verification chaining; `prov:wasRevisionOf` for evidence-Entity revisions. The sixth-citing-site SHACL-AF rule (Q7) operationalises the Verification-chain materialisation.

---

## DA anticipation — Nicola Guarino (PROV-O ≠ assurance)

The Devil's Advocate selection criterion (ODR-0001 §Roles) requires the DA's published methodology to be genuinely opposed to the framing the proposition carries. Guarino's published positions (UFO-OntoClean lineage; the session-001 Q6 "PROV-O is not an assurance ontology" objection he conceded then) carry the relevant opposition lines. We anticipate two opposition lines.

### Line 1: The 80%/5-residue boundary is gerrymandered to make PROV-O fit

**Anticipated Guarino position.** "Q1's pressure-test claims the residue is exactly five items. But the boundary is gerrymandered — `prov:atTime` carries the OIDC4IDA `time` field because PROV-O happens to have a time predicate; but PROV-O's `time` semantics (the instant of the activity's completion) is not the same as OIDC4IDA's `time` semantics (the verification timestamp — which is also the point at which trust is established, not just process completion). You are using lexical similarity to claim semantic alignment. Show me the conformance test that proves the two times are interchangeable; if you cannot, the boundary is rhetoric not engineering."

**Engagement.** Guarino is correct that lexical similarity is not semantic alignment. The conformance test: the OIDC4IDA spec §5.1 defines `time` as "the time at which the verification took place" — an instant, not an interval, and corresponding to the *completion* of verification (not its initiation). PROV-O `prov:atTime` (used on Activities) corresponds to the instant at which the Activity occurred. The two semantics match: the verification *Activity*'s instant IS the verification's completion instant. The exemplars confirm: `opda-x:verification-activity prov:atTime "2024-03-12T11:30:00Z"^^xsd:dateTime` — the timestamp is the moment of verification completion, which is what OIDC4IDA `time` carries.

**Where the alignment fails (admitted).** If a verification is *interval*-extended (e.g. an AML check that takes 48 hours from initiation to completion), the single `prov:atTime` instant cannot carry both endpoints. The OWL-Time profile (ODR-0014 — when activated) addresses this via `time:Interval` + `time:hasBeginning` / `time:hasEnd`. For S009 we commit to the instant-mapping; interval cases are routed to OWL-Time via ODR-0014 (per the stub §References pre-commitment).

We expect Guarino DA withdrawal on Q1 with the OIDC4IDA §5.1 conformance test demonstrated. Recorded verbatim: "Guarino DA withdrew on Q1; OIDC4IDA §5.1 `time` semantics (instant at completion) matches PROV-O `prov:atTime` (instant of Activity); interval cases routed to OWL-Time per ODR-0014."

### Line 2: SHACL `sh:xone` over three evidence subtypes is over-modelling

**Anticipated Guarino position.** "Q7's `sh:xone` over three per-subtype shapes is academically correct but operationally over-modelled. The PDTF v3 schema discriminates evidence by a `type` string field (`document` / `electronic_record` / `vouch`); enterprise consumers read the string and dispatch on it. Introducing three SHACL shapes plus an `sh:xone` dispatcher adds four shape declarations where one `sh:in` over the type-string suffices. Show me a consumer query that needs the per-subtype Substance Kind discrimination; if you cannot, this is gold-plating."

**Engagement.** Guarino is right on the minimal-modeling pressure; the question is what is minimal *here*. The consumer query that requires the per-subtype discrimination: **the eIDAS assurance-level derivation query** — "given an Evidence Entity, derive the maximum assurance-level its subtype admits." A `DocumentEvidence` (court-issued instrument) admits eIDAS Substantial; an `ElectronicRecordEvidence` (real-time API) admits Substantial; a `VouchEvidence` (regulated-professional attestation) admits *only* Low. The query requires SHACL shapes that distinguish the subtypes — a flat `sh:in` over the type-string cannot drive the assurance-level derivation because the derivation depends on subtype-specific properties (court-issuance for DocumentEvidence; API-source-authority for ElectronicRecordEvidence; voucher-regulator for VouchEvidence).

The vouch exemplar's scopeNote spells this out: "the assurance-level downgrades: vouch-only evidence is eIDAS 'Low' (Q3 SKOS scheme; S011 Quality Region) regardless of voucher quality — confirmation by a regulated professional is corroborative, not authoritative." The Substance Kind discipline is what makes this rule expressible.

We expect Guarino DA withdrawal on Q7 with the eIDAS-derivation-query demonstrated. Recorded verbatim: "Guarino DA withdrew on Q7; eIDAS assurance-level derivation query requires per-evidence-subtype Substance Kind discrimination the `sh:xone` shape operationalises."

### Lines we expect Guarino to hold (held-as-live dissent candidates)

- **Q5 dual modelling — `dct:conformsTo opda:TrustFramework` (class) + `skos:Concept` in `opda:TrustFrameworkScheme`.** Guarino's published OntoClean discipline favours single canonical-form representation (Guarino & Welty 2002; meta-property analysis). Dual modelling may strike him as redundant. We expect engagement; we expect to converge on dual modelling via the FIBO LegalEntity / LEI precedent (ODR-0005 §Q4 — class + identifier-scheme); if Guarino holds dissent, the named re-open trigger is "if 18 months produce zero downstream consumer queries requiring the SKOS scheme operations on trust-frameworks (no `skos:broader`/`narrower`; no `skos:exactMatch` to external register), the SKOS-side of the dual modelling becomes a re-open consideration." We do not anticipate this; the FIBO precedent is strong; but we admit the held-as-live possibility.

- **None of Q2, Q3, Q4, Q6, Q8 are expected dissent sites** — Q2 is W3C-grade qualified attribution (Guarino concurs with PROV-O Recommendation); Q3 is settled by S011 §8a (Guarino did not contest the Quality Region framing); Q4 is bespoke local-term discipline matching the stub's three-terms-only commitment; Q6 is settled by Scope-Check 1 Q5 (one-paragraph pointer; no authoring); Q8 is named-deferred to ODR-0016 (Guarino has no published VC-side position).

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind / Role / Relator / Quality / Method-plan code).
- Guizzardi, G., Wagner, G. (2010). *Using the Unified Foundational Ontology (UFO) as a Foundation for General Conceptual Modeling Languages*. Theory and Applications of Ontology. (Method/plan code framework — algorithm scheme grounding in Q4.)
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18 §4.1-4.3 (DOLCE PhysicalEndurant / NonPhysicalEndurant / Quality Region).
- Searle, J. (1995). *The Construction of Social Reality* (legal-institutional objects — basis for Trust Framework as Social Object NonPhysicalEndurant).
- Guarino, N., Welty, C. (2002, 2009). *An Overview of OntoClean* (meta-properties — single canonical form for representations; Q5 dual-modelling pressure-test).
- Moreau, L., Missier, P., eds. (2013). *PROV-O: The PROV Ontology*. W3C Recommendation. §1 (Scope — no signature notion, grounds Q4 bespoke `opda:digest`); §3 (`prov:wasDerivedFrom`, `prov:wasGeneratedBy`, `prov:wasAttributedTo`); §3.6 (qualified attribution — grounds Q2); §5 (`prov:wasInformedBy` — grounds Q7 verification chain).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §4.6.4 (`sh:xone` exactly-one — Q7 dispatch); §4.6.2 (`sh:or` — Q2 bearer disjunction); §5.2.6 (SPARQL-based constraints — Q7 SHACL-AF rule).
- Hillmann, D., Westbrook, J. (2008). *Dublin Core Metadata Initiative — Recommendation*. DCMI Usage Board. (`dct:conformsTo` semantics for Q5 trust framework.)
- W3C Verifiable Credentials Data Model 2.0 (deferred — ODR-0016 owns binding per Scope-Check 1 Q7c — Q8 deferral).
- W3C Verifiable Credentials Data Integrity 1.0 (deferred — Q4 `opda:digest` ↔ `sec:proof` composition routed to ODR-0016).
- NIST FIPS 180-4 (SHA-2 family — Q4 digest algorithm scheme `dct:source`).
- NIST FIPS 202 (SHA-3 family — Q4 digest algorithm scheme `dct:source`).
- OIDC4IDA spec §5.1 (verification `time` semantics — DA Line 1 conformance test).
- eIDAS Regulation (EU) 910/2014 — assurance-level tiers (Q3 SKOS Quality Region values).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment 2026-05-27. ODR-0009 is the sixth `kind: pattern` to discharge under it.
- ODR-0004 §Rule 2 (layer-segregated naming); §3a (three-graph separation — Q7 shapes in `opda-shapes.ttl`); §6a (deterministic emission); §7a (term-sourcing five-line precedence — Q4 algorithm scheme `dct:source` to NIST FIPS; Q5 trust framework `dct:source` to OPDA TF charter); §8a (exemplar harness — three exemplars as gate test).
- ODR-0005 §3a/3b/3c (IC over hard cases — Q7 per-evidence-subtype IC inherits the template); §6a (UPRN succession SHACL-AF rule precedent — Q7 sixth citing site); Anti-pattern §3 (never key a Role — applied to Voucher Role); Rule 5 (no `owl:sameAs` — applied to evidence Entity surfaces, trust framework class-to-concept binding).
- ODR-0006 §Q2 (RoleMixin / Role discipline — Q2 Attribution-mediated Voucher Role grounding); §Q3 (Proprietorship Relator precedent — Q2 Attribution-as-Relator); §Q4 (capacity vs authority — Q2 evidencedAuthority link composition).
- ODR-0011 §1a (SKOS scheme membership — Q3 assuranceLevel scheme; Q4 algorithm scheme; Q5 trust framework scheme); §5a (three-case lifecycle discipline — applies to evidence-Entity revocation); §7a (xsd:string + sh:pattern discipline — Q4 digest); §8a (seven-category UFO framework — Q1 categorisation; Q3 Quality Region; Q4 Method/plan code).
- ODR-0015 §2a (Address Substance Kind — referenced by Person/Organisation in ODR-0006); §4a (INSPIRE succession SHACL-AF rule — Q7 sixth citing site lineage).
- ODR-0017 (SHACL-AF non-blocking data-quality rules pattern) — **sixth citing site in this session for PROV-O Verification chain materialisation**. ODR-0009 cites `implements: [ODR-0017]`; ODR-0017 §References retrofits to cite ODR-0009 (author-only follow-up).
- ODR-0012 (Data Governance Layer) — owns DPV co-annotation authoring per Scope-Check 1 Q5; ODR-0009 carries one-paragraph pointer per Q6.
- ODR-0016 (W3C VC / DID Compatibility Layer) — owns VC binding deliberation per Scope-Check 1 Q7c; ODR-0009 Q8 deferral routes here.
- Diagnostic exemplars: `source/03-standards/ontology/exemplars/claim-with-document-evidence.ttl`, `claim-with-electronic-record-evidence.ttl`, `claim-with-vouch-evidence.ttl` — the three IC tests the Q7 `sh:xone` discipline discharges.
- Scope-Check 1 (2026-05-26) Q5 (DPV co-annotation authorship routing — Q6 settled); Q7c (VC/DID admission triggers — Q8 deferral); Q3 (UFO meta-category per scheme — Q3 Quality Region inheritance).
- S009 plan §S009 (Queen Moreau; DA Guarino; teammates default + dpv-odrl); S001 Q6 transcript (Moreau's original PROV-O backbone proposal); ODR-0009 stub (the proposal under deliberation).
