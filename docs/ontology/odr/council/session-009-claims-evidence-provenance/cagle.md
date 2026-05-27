# Cagle — Solo position on S009

## Stance summary

ODR-0009 is **Phase 4 — Claims/Evidence/Provenance** and my load is its SHACL underbelly: how do the PROV-O backbone, the evidence-type discriminator, and the cryptographic-digest envelope actually drive validation? My S005 §6a precedent (SHACL-AF rule materialising UPRN succession into the validation report at `sh:Info`) was re-instantiated four times before ODR-0017 extracted the pattern as a `kind: pattern` ODR on 2026-05-27. **S009 brings one further candidate citing site** — verification-activity succession (re-verification with updated evidence after expiry) — and it is the FIRST citing site explicitly anticipated in ODR-0017 §References as "ODR-0009 — PROV-O Claims/Evidence rule (anticipated when S009 ratifies its PROV-O rule)". My job is to author it.

My load this session: **Q7 LOAD-BEARING** (the `sh:xone` evidence-type dispatch — three sub-shapes for `DocumentEvidence` / `ElectronicRecordEvidence` / `VouchEvidence`, each with its own required-predicate property shapes); **Q2 DEPTH** (qualified attribution SHACL — `prov:qualifiedAttribution` cardinality and `prov:hadRole` enforcement); **Q4 DEPTH** (cryptographic digest SHACL — `sh:pattern` per algorithm via `sh:or`); and the **ODR-0017 ninth citing site** for verification-activity succession (the re-verification chain). I concur with stub framing on Q1 (PROV-O coverage — 80/5 boundary holds), Q3 (assurance-level scheme — Isaac's S011 authority), Q5 (`opda:TrustFramework` reification — Moreau's PROV-O Plan authority), Q6 (DPV co-annotation seam — one-paragraph pointer to ODR-0012 per Scope-Check 1 Q5 refinement), and Q8 (W3C VC interop — deferred to ODR-0016 per the named-deferred rule).

I engage **Guarino DA** on the load-bearing line he conceded in S001: PROV-O ≠ assurance, and S009 must preserve the boundary by ensuring the SHACL apparatus does not blur the layer. The PROV-O subclasses (`opda:DocumentEvidence` et al.) carry the provenance shape; the assurance-layer terms (`opda:digest`, `opda:assuranceLevel`) carry the regulated judgement; the SHACL shapes target both without conflating them. Guarino's discipline is preserved by separation of shape graphs — provenance shapes in `opda-shapes.ttl` per ODR-0004 §3a; assurance-layer shapes in the same file but in their own namespace section.

I expect this session ratifies the PROV-O backbone at the deliberative level. The namespace-string block from ODR-0004 carries (this session's `opda:` declarations emit with `dct:status "draft"`); the deliberative gate clears on the operational mechanisms.

## Per-question positions

### Q1 — PROV-O coverage (concur with stub)

Concur with Moreau's 80% / 5-residue split as stated in ODR-0009 §"The ~80% boundary — five exceptions modelled around PROV". The five residues (trust framework; validation-vs-verification method; cryptographic digest; assurance level; verifier `txn`) hold against re-scrutiny — none of them is a PROV-O primitive; each lands cleanly in `dct:` / SKOS / local `opda:`. The stub's standing-review-obligation (re-test the line on every upstream schema change) is the correct discipline.

Vote: FOR stub 80/5 framing.

### Q2 — Qualified attribution (DEPTH — SHACL operationalisation)

Concur with stub's qualified-form commitment — `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole`, NOT the binary `prov:wasAttributedTo` / `prov:wasAssociatedWith` shortcuts. The binary forms discard `validation_method` / `verification_method`; the qualified form preserves them.

**My operational addition.** The qualified form must be SHACL-checkable. Sketch:

```turtle
opda:VerificationShape a sh:NodeShape ;
    sh:targetClass opda:Verification ;
    sh:property [
        sh:path prov:qualifiedAttribution ;
        sh:minCount 1 ;
        sh:class prov:Attribution ;
        sh:severity sh:Violation ;
        sh:message "Verification {$this} MUST carry prov:qualifiedAttribution to a prov:Attribution resource (qualified form preserves validation_method / verification_method)."
    ] .

opda:AttributionShape a sh:NodeShape ;
    sh:targetClass prov:Attribution ;
    sh:property [
        sh:path prov:agent ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class prov:Agent ;
        sh:severity sh:Violation ;
        sh:message "Attribution {$this} MUST carry exactly one prov:agent (the verifier organisation or voucher)."
    ] ;
    sh:property [
        sh:path prov:hadRole ;
        sh:minCount 1 ;
        sh:severity sh:Violation ;
        sh:message "Attribution {$this} MUST carry prov:hadRole (records validation_method / verification_method per OIDC4IDA bifurcation)."
    ] .
```

The `prov:hadRole` requirement is load-bearing — it is the SHACL apparatus that prevents downstream regression to the binary shortcut form. Without it, an emitter could produce `prov:wasAttributedTo` triples and the qualified-form commitment becomes decorative.

Vote: FOR qualified-attribution SHACL shapes as drafted; the `prov:hadRole` `minCount 1` is the load-bearing requirement.

### Q3 — Assurance-level vocabulary (defer to S011 / Isaac)

Defer substantive authority on `opda:AssuranceLevelScheme` to Isaac (S011 Queen). My operational note: the assurance-level concept is a SKOS scheme per ODR-0011 §1 (every JSON enum becomes a `skos:ConceptScheme`); per ODR-0011 §8a it falls under the **QualeInRegion** UFO category (the assurance level is a graded judgement value in a banded region — eIDAS Low/Substantial/High plus PDTF-specific tiers). SHACL targeting (per my S011 Q8 table): targets the Claim node carrying the assurance judgement; `sh:in` on the concept URI enforces closed-scheme discipline. The scheme itself emits `opda:ufoCategory "QualeInRegion"` per ODR-0011 §8a B3 pilot.

Vote: DEFER to Isaac on substantive scheme content. FOR QualeInRegion UFO category + `sh:in` SHACL targeting on the consuming Claim.

### Q4 — Cryptographic digest (DEPTH — SHACL operationalisation)

Concur with stub's local-terms commitment — `opda:digest` (or the stub's `opda:digestAlg` / `opda:digestValue` pair). PROV-DM models no signature notion and forcing one in would violate the reuse driver. The local terms are bespoke and stand.

**My operational addition.** The digest's lexical form must be SHACL-checkable per algorithm, using `sh:or` to dispatch across the admitted algorithms. Sketch:

```turtle
opda:DigestShape a sh:PropertyShape ;
    sh:path opda:digest ;
    sh:datatype xsd:string ;
    sh:or (
        [ sh:pattern "^sha256:[0-9a-f]{64}$" ]
        [ sh:pattern "^sha384:[0-9a-f]{96}$" ]
        [ sh:pattern "^sha512:[0-9a-f]{128}$" ]
    ) ;
    sh:severity sh:Violation ;
    sh:message "Digest {$this} MUST match one of: sha256:<64-hex>, sha384:<96-hex>, sha512:<128-hex>." .
```

The `sh:or` branches dispatch across the three SHA-2 family algorithms admitted by OIDC4IDA / Data Integrity. The `sh:pattern` regex enforces lexical form per algorithm — sha256 requires exactly 64 hex digits; sha384 requires 96; sha512 requires 128. An ill-formed digest (wrong length; non-hex characters; missing algorithm prefix) fires `sh:Violation`. This is the per-S005-Q4 falsifiable-test discipline: the shape produces an outcome the consumer can act on.

**Alternative form (algorithm + value as separate predicates).** If the stub's `opda:digestAlg` / `opda:digestValue` pair is preferred over the colon-separated form, the shape splits accordingly:

```turtle
opda:DigestAlgShape a sh:PropertyShape ;
    sh:path opda:digestAlg ;
    sh:in ( "sha256" "sha384" "sha512" ) ;
    sh:severity sh:Violation .

opda:DigestValueShape a sh:NodeShape ;
    sh:targetClass opda:Verification ;
    sh:sparql [
        sh:select """
            SELECT $this ?alg ?value WHERE {
                $this opda:digestAlg ?alg ; opda:digestValue ?value .
                FILTER (
                    (?alg = "sha256" && !REGEX(?value, "^[0-9a-f]{64}$")) ||
                    (?alg = "sha384" && !REGEX(?value, "^[0-9a-f]{96}$")) ||
                    (?alg = "sha512" && !REGEX(?value, "^[0-9a-f]{128}$"))
                )
            }
        """ ;
        sh:severity sh:Violation ;
        sh:message "Verification {$this} digestValue does not match expected length for digestAlg {?alg}."
    ] .
```

Either form is admissible; the colon-prefix form (`sha256:<hex>`) is more compact and matches Data Integrity's published `multibase` convention more closely; the separated form is more strictly RDF-idiomatic. The Author records both and lets the Queen pick.

Vote: FOR per-algorithm digest SHACL (either colon-prefix `sh:or` form or separated `sh:in` + SPARQL form).

### Q5 — Trust framework (concur with stub)

Concur with stub's `dct:conformsTo` placement on the verification activity. The `trust_framework: "uk_pdtf"` literal is a governance regime, not a provenance primitive — Moreau's S001 framing holds. The conformance target is `opda:TrustFramework` reified as a `skos:Concept` in `opda:TrustFrameworkScheme` (per ODR-0011) with `dct:source` to the OPDA TF specification document. Plan-shaped methods (`validation_method` / `verification_method`) hang off the activity's `prov:Association` `prov:hadPlan`, separately from the trust-framework conformance.

Vote: FOR stub `dct:conformsTo` + `opda:TrustFramework` SKOS reification.

### Q6 — DPV co-annotation seam (concur with Scope-Check 1 Q5 refinement)

Concur with the moved-to-ODR-0012 disposition per Scope-Check 1 Q5 refinement (vote 8-1, Pandit's authorship-routing refinement adopted). ODR-0009 carries a one-paragraph pointer at the DPV co-annotation seam; the authoritative listing lives in ODR-0012. The pointer text names which evidence subclasses bear PII (all three — document, electronic-record, vouch — bear PII; vouch additionally carries third-party PII about the voucher) and points to ODR-0012's `## Rules` for the full co-annotation grid.

Vote: FOR pointer-only seam; FOR ODR-0012 owning authoritative listing.

### Q7 — SHACL-over-PROV (LOAD-BEARING — `sh:xone` evidence-type dispatch)

This is the load-bearing operational question. The PDTF schema's `evidence.type` discriminator (`document` / `electronic_record` / `vouch`) is a JSON-Schema `oneOf` — each discriminator value selects a sub-schema with its own required predicates. The SHACL operationalisation is `sh:xone` over per-type shapes targeting the evidence subclass.

**The three sub-shapes** (one per evidence type, each enforcing its required predicates per the PDTF schema):

```turtle
opda:DocumentEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:DocumentEvidence ;
    sh:property [
        sh:path opda:documentType ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class skos:Concept ;
        sh:severity sh:Violation ;
        sh:message "DocumentEvidence {$this} MUST carry exactly one opda:documentType (SKOS concept; e.g. passport, driving-licence, utility-bill)."
    ] ;
    sh:property [
        sh:path opda:issuerAuthority ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class prov:Agent ;
        sh:severity sh:Violation ;
        sh:message "DocumentEvidence {$this} MUST carry exactly one opda:issuerAuthority (prov:Agent — e.g. HMPO, DVLA, utility provider)."
    ] ;
    sh:property [
        sh:path opda:documentReference ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:severity sh:Violation ;
        sh:message "DocumentEvidence {$this} MUST carry opda:documentReference (passport number, licence number, account reference)."
    ] ;
    sh:property [
        sh:path opda:issuedOn ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:date ;
        sh:severity sh:Violation ;
        sh:message "DocumentEvidence {$this} MUST carry opda:issuedOn (issue date as xsd:date)."
    ] .

opda:ElectronicRecordEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:ElectronicRecordEvidence ;
    sh:property [
        sh:path opda:apiEndpoint ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:nodeKind sh:IRI ;
        sh:severity sh:Violation ;
        sh:message "ElectronicRecordEvidence {$this} MUST carry exactly one opda:apiEndpoint (IRI of the queried register, e.g. HMLR, Companies House)."
    ] ;
    sh:property [
        sh:path opda:apiResponseId ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:severity sh:Violation ;
        sh:message "ElectronicRecordEvidence {$this} MUST carry opda:apiResponseId (correlation identifier returned by the register API)."
    ] ;
    sh:property [
        sh:path opda:retrievedAt ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:dateTime ;
        sh:severity sh:Violation ;
        sh:message "ElectronicRecordEvidence {$this} MUST carry opda:retrievedAt (xsd:dateTime of API retrieval)."
    ] .

opda:VouchEvidenceShape a sh:NodeShape ;
    sh:targetClass opda:VouchEvidence ;
    sh:property [
        sh:path opda:voucherRegulator ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:class prov:Agent ;
        sh:severity sh:Violation ;
        sh:message "VouchEvidence {$this} MUST carry exactly one opda:voucherRegulator (regulatory body authorising the voucher — e.g. SRA, Law Society, ICAEW)."
    ] ;
    sh:property [
        sh:path opda:voucherLicenseNumber ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:severity sh:Violation ;
        sh:message "VouchEvidence {$this} MUST carry opda:voucherLicenseNumber (regulator-issued licence reference)."
    ] ;
    sh:property [
        sh:path opda:attestationDate ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:date ;
        sh:severity sh:Violation ;
        sh:message "VouchEvidence {$this} MUST carry opda:attestationDate (xsd:date the vouch was made)."
    ] ;
    sh:property [
        sh:path opda:attestationStatement ;
        sh:minCount 1 ; sh:maxCount 1 ;
        sh:datatype xsd:string ;
        sh:severity sh:Violation ;
        sh:message "VouchEvidence {$this} MUST carry opda:attestationStatement (the voucher's signed statement text)."
    ] .
```

**The dispatching shape** (`sh:xone` ensures exactly one of the three sub-shapes matches):

```turtle
opda:EvidenceShape a sh:NodeShape ;
    sh:targetClass opda:Evidence ;
    sh:xone (
        opda:DocumentEvidenceShape
        opda:ElectronicRecordEvidenceShape
        opda:VouchEvidenceShape
    ) ;
    sh:severity sh:Violation ;
    sh:message "Evidence {$this} MUST conform to exactly one of DocumentEvidence / ElectronicRecordEvidence / VouchEvidence (PDTF evidence-type discriminator)." .
```

**The discipline.** `sh:xone` is exclusive-one — a node MUST match exactly one branch. A node typed as both `opda:DocumentEvidence` AND `opda:VouchEvidence` (which would be a category error per stub Rule "Do not collapse the three evidence types into one pattern") fires `sh:Violation`. A node typed as `opda:Evidence` but matching none of the three sub-shapes (e.g. missing required predicates for its declared subtype) also fires. This is the SHACL operationalisation of the PDTF `oneOf` discriminator — the JSON schema's "exactly one of these branches" semantics is preserved as "exactly one of these node shapes" in SHACL.

**Three-part operational test for Q7** (falsifiable per ODR-0004 §6a discipline):

1. **Conforming-document-evidence test.** A node typed `opda:DocumentEvidence` with all four required predicates (`documentType`, `issuerAuthority`, `documentReference`, `issuedOn`) MUST produce no violation. Exemplar: a passport-based identity verification.
2. **Conforming-electronic-record-evidence test.** A node typed `opda:ElectronicRecordEvidence` with all three required predicates (`apiEndpoint`, `apiResponseId`, `retrievedAt`) MUST produce no violation. Exemplar: a HMLR title-register check.
3. **Conforming-vouch-evidence test.** A node typed `opda:VouchEvidence` with all four required predicates (`voucherRegulator`, `voucherLicenseNumber`, `attestationDate`, `attestationStatement`) MUST produce no violation. Exemplar: a solicitor's vouch attestation.

Plus a fourth diagnostic exemplar (not gate-critical): a malformed node typed `opda:DocumentEvidence` missing `issuerAuthority` MUST produce one violation; this confirms the property shape fires correctly.

Vote: FOR `sh:xone` evidence-type dispatch + three sub-shapes as drafted + four-part exemplar pass.

### Q8 — W3C VC interop (defer to ODR-0016 per named-deferred rule)

Concur with Scope-Check 1 Q7c — VC/DID activation triggers (S009 Q8 surfacing VC-side decisions; S012 consent receipts; real wallet/DID consumer arrival) are owned by ODR-0016 (deferred). S009 records the question as "interop deferred to ODR-0016"; the substantive binding (`opda:Claim` ↔ `cred:VerifiableCredential`; `opda:Verifier` ↔ `cred:Verifier`; `opda:Verification` ↔ `cred:VerificationResult` or comparable) is named in ODR-0016 when the activation trigger fires.

My operational note: when the binding lands, the SHACL apparatus for evidence-type dispatch (Q7) MUST survive the VC/DID profile overlay. The `cred:VerifiableCredential` envelope adds outer-wrapping predicates (`cred:proof`, `cred:issuanceDate`, `cred:credentialSubject`) without disturbing the inner evidence structure — the VC binding is overlay, not replacement. ODR-0010's Overlay Profile Mechanism is the consumption path.

Vote: DEFER to ODR-0016; FOR the operational note (VC binding as overlay, not replacement; Q7 shapes survive).

## ODR-0017 ninth citing site — verification-activity succession

ODR-0017's §References anticipates ODR-0009 as a citing site: *"ODR-0009 — PROV-O Claims/Evidence rule (anticipated when S009 ratifies its PROV-O rule)."* This is the first explicitly-anticipated citing site beyond the four that triggered the pattern-extraction. I author the rule.

**The use case.** A `opda:Verification` activity is superseded when re-verification occurs — typically driven by evidence expiry (a passport expires; a HMLR title-register check goes stale after 60 days; a vouch attestation requires re-affirmation under updated AML guidance). The original verification is not invalidated (the historical claim was correctly verified under the evidence then available); it is *superseded* by a new verification activity using updated evidence. The chain must be materialised so that downstream consumers — including LLM tooling per Hellmann et al. (DBpedia 2017) — can determine which verification is current without falling back to natural-language heuristics in `rdfs:comment`.

**The SHACL-AF rule** (re-instantiating ODR-0017 §1a template; `sh:Info` severity per §2a tier-1 — substantive succession via `prov:wasInformedBy`):

```turtle
opda:VerificationActivitySuccessionRule a sh:NodeShape ;
    sh:targetClass opda:Verification ;
    sh:sparql [
        sh:select """
            SELECT $this ?currentVerification ?priorVerification WHERE {
                $this prov:endedAtTime ?currentTime .
                BIND($this AS ?currentVerification)
                OPTIONAL {
                    $this prov:wasInformedBy ?priorVerification .
                    ?priorVerification a opda:Verification ;
                                       prov:endedAtTime ?priorTime .
                    FILTER (?priorTime < ?currentTime)
                }
            }
        """ ;
        sh:severity sh:Info ;
        sh:message "Verification {$this} (current) chains from {?priorVerification} (prior) via prov:wasInformedBy succession (re-verification with updated evidence)."
    ] .
```

The rule fires `sh:Info` when a Verification activity chains via `prov:wasInformedBy` to a prior Verification. The chain is materialised into the validation report; the consumer (LLM, lint, audit-trail) reads the `sh:resultMessage` template form per ODR-0017 §3a machine-consumability requirement.

**`implements:` retrofit.** ODR-0009 §References + frontmatter `implements:` line gains `ODR-0017`. The citing-site list in ODR-0017 §References §"Citing sites (`implements:` retrofit pending)" updates the ODR-0009 line from "anticipated when S009 ratifies" to the live `#section-link` URL anchored to ODR-0009's §"Verification-activity succession" subsection (this rule's home).

**Discharge of ODR-0017's (a)/(b)/(c) discipline** (per A9 §What an ODR records (per-kind discipline)):

- **(a) UFO/DOLCE meta-category — Method/plan code.** Per ODR-0017 §4a, the rule is a procedural plan for materialising verification-activity succession as data-quality assertion. `dct:source` chain inherits ODR-0017 §4a's Guizzardi & Wagner 2010 anchor + Guizzardi 2005 Ch. 4.
- **(b) IC over named hard cases.** Inherits ODR-0017 §5a's five hard cases (rule extension; severity adjustment; target-class change; message-template refinement; graph relocation). This rule's `sh:targetClass` is `opda:Verification`; severity is `sh:Info`; relocation between shape modules tracked via ODR-0017 §5a case 5.
- **(c) Artefact realisation.** The Turtle above, placed in `opda-shapes.ttl` per ODR-0004 §3a three-graph separation.

This is the first ODR explicitly anticipated by ODR-0017's §References; the discipline propagates cleanly. ODR-0017's citing-site count moves from four (ODR-0005 §6a, ODR-0009 anticipated, ODR-0015 §4a, ODR-0011 §5a) to five live, with ODR-0009 now ratified. Pattern consolidation continues.

## Replies to anticipated objections

### Guarino DA on Q7 — "the sh:xone dispatch blurs the PROV-O ≠ assurance line"

Anticipated attack: *"You're authoring SHACL shapes on `opda:DocumentEvidence` / `opda:ElectronicRecordEvidence` / `opda:VouchEvidence` — which are PROV-O entity subclasses — and the property shapes (`issuerAuthority`, `voucherRegulator`) drag assurance-layer concerns into the provenance graph. The PROV-O ≠ assurance line you've claimed to preserve is blurred by the SHACL apparatus."*

Reply: The shapes target the **PROV-O entity** because that is what the PDTF schema's `evidence` object is — a provenance entity carrying type-specific predicates. The required predicates I enumerate (`issuerAuthority`, `voucherRegulator`, `apiEndpoint`) are *provenance predicates*: they record who issued the evidence, where it was retrieved from, who attested it. These are PROV-O-shaped — `issuerAuthority` is a `prov:Agent` reference (the issuing authority is the agent who minted the document); `voucherRegulator` is a `prov:Agent` reference (the regulatory body authorising the voucher); `apiEndpoint` is a derivation-source reference (the register that produced the response). None of them is an assurance-layer concern — the assurance-layer concerns (`opda:digest`, `opda:assuranceLevel`, `dct:conformsTo` to trust-framework) sit on the **Verification activity**, not on the evidence entity. The shape graph preserves the boundary you defended in S001.

Withdrawal condition (offered): I withdraw the `sh:xone` dispatch if Guarino names a single property shape (above) that drags assurance-layer content into a provenance-typed entity. (My expectation: he won't; the boundary is intact.)

### Moreau (potential rebuttal on Q2 qualified-form SHACL strictness)

Possible attack: *"Your `prov:hadRole minCount 1` is too strict. PROV-O permits `prov:Attribution` without a role — the role is optional in the spec. Forcing it as a SHACL `sh:Violation` over-constrains the model."*

Reply: PROV-O permits `prov:hadRole` to be absent at the *modelling* layer (the spec admits attribution without role-qualification). The OPDA Trust Framework profile *adds* the role-requirement because the eIDAS / OIDC4IDA semantics depend on it — without `prov:hadRole`, the `validation_method` vs `verification_method` distinction cannot be preserved (per S001 Q6 deliberation; the qualified-form discipline you authored is *because* the binary forms discard those distinctions). The shape is profile-specific; the OPDA conformance is stricter than vanilla PROV-O on this point, by design. If a downstream consumer wants vanilla PROV-O without the OPDA profile, they overlay-out the shape per ODR-0010.

### Gandon DA — "the ODR-0017 ninth citing site is over-eager"

Possible attack: *"You're authoring a SHACL-AF rule for verification-activity succession when no exemplar in S009's scope demonstrates re-verification. The rule is speculative engineering for a case that doesn't appear in the current exemplar set."*

Reply: The case appears in the **PDTF v3 schema** (the `verifiedClaims` envelope explicitly admits multiple `verification` blocks for sequential re-verification under updated evidence — the schema author anticipated the use case) and in **operational practice** (AML re-checks are statutorily required; HMLR title-register checks expire and must be re-run). The rule is not speculative; it operationalises a discipline the schema commits to. ODR-0017 explicitly anticipated this citing site in §References; the anticipation is now ratified. Without the rule, an LLM consumer querying for "is this verification current?" falls back to `rdfs:comment` heuristics — exactly the Hellmann et al. (DBpedia 2017) failure mode the pattern was created to prevent. The pattern is operating as designed.

Withdrawal condition (offered): I withdraw the rule if Gandon produces an operational alternative that makes verification-supersession state mechanically consumable AND does not require duplicating SPARQL across each consumer. (My expectation: he won't; inline `prov:wasInformedBy` alone fails the mechanical-consumability test.)

## Cross-references

- My Q2 qualified-attribution SHACL feeds forward into **ODR-0013** (SHACL Validation & Severity — ratifies the `sh:Violation` floor on `prov:hadRole minCount 1` as an OPDA-profile-specific constraint above vanilla PROV-O) and into **ODR-0010** (Overlay Profile Mechanism — vanilla PROV-O consumers overlay-out the role-strictness; OPDA profile retains it).
- My Q4 digest SHACL (per-algorithm `sh:pattern` via `sh:or`) feeds forward into **ODR-0013** (severity floor) and into **ODR-0011** (the algorithm list `{sha256, sha384, sha512}` is a closed SKOS scheme `opda:DigestAlgorithmScheme` — UFO category Method/plan code per §8a).
- My Q7 `sh:xone` evidence-type dispatch is the **load-bearing operational artefact** for ODR-0009. It feeds forward into **ODR-0010** (overlay profiles per evidence type — e.g. a BASPI overlay may restrict to document-only evidence) and into **ODR-0012** (DPV co-annotation grid keyed by evidence subtype).
- My ODR-0017 ninth citing site (`opda:VerificationActivitySuccessionRule`) updates ODR-0017's §References anticipated→live transition for ODR-0009. The pattern's citing-site count moves to five live; the discipline continues to operate.
- ODR-0005 §6a (UPRN succession SHACL-AF rule) is the upstream precedent. ODR-0011 §5a (deprecation chain), ODR-0015 §4a (INSPIRE succession), and now ODR-0009's `VerificationActivitySuccessionRule` re-instantiate the pattern. The discipline propagates: every machine-consumable lineage claim is in a typed SHACL-AF rule, not in `rdfs:comment`.
- ODR-0004 §3a (three-graph separation) constrains where my shapes live: `opda:EvidenceShape`, the three sub-shapes, `opda:VerificationShape`, `opda:AttributionShape`, `opda:DigestShape`, and `opda:VerificationActivitySuccessionRule` all sit in `opda-shapes.ttl`, NOT in `opda-annotations.ttl` (the CI test `ASK { GRAPH opda:annotations { ?s a sh:NodeShape } }` returns false for each).
