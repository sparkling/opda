# Gandon + Guizzardi — formal-pair on S012

*Joint pair voice. **Neither is Queen for this session** — Queen is Pandit (DPV — owns; his S001 dissent is centre-stage and has been vindicated by ODR-0018's four-citing-site spawn) and DA is Kendall (reference-not-import; keep TBox lean). The pair is panel teammate. The work is layered: Guizzardi-led on the load-bearing UFO question (ODR-0012 kind-discipline as `kind: architecture`, NOT `kind: pattern` — the seventh `kind: architecture` ODR-level discharge that the relaxed A9 regime carries through), Gandon-led on the W3C/artefact questions (DPV Recommendation alignment; co-annotations in `opda-annotations.ttl` per ODR-0004 §3a; W3C VC consent receipts deferred to ODR-0016). The pair is joint throughout. ODR-0018 (the DPV class-level co-annotation pattern, spawned by S009 Q6 on the fourth-citing-site threshold) is the load-bearing input — its `## Rules` clause 7 states "**ODR-0012 is the authoring authority**", and §Consequences clause 3 names ODR-0012 as inheriting the pattern as authoring contract. S012's work is to consume ODR-0018's mapping tables and author the actual DPV triples + variant-conditional refinements — application, not invention.*

## Stance summary

ODR-0012 is `kind: architecture` (not `kind: pattern`). Per the S005/S015/S011/S006/S007/S009 distinction, `kind: pattern` ODRs discharge A9 §Per-kind discipline (a)/(b)/(c) inline (UFO meta-category + IC over hard cases + artefact realisation); `kind: architecture` ODRs (ODR-0001/0003/0004) author the *system* that the patterns implement. ODR-0012 is an architectural layer authoring DPV co-annotations *across* the PII-bearing Kinds the pattern ODRs declared; it is the seventh `kind: architecture` discharge after ODR-0001 (methodology), ODR-0003 (programme), ODR-0004 (foundation). The pattern itself lives at ODR-0018; ODR-0012 consumes ODR-0018's pattern + ODR-0011's SKOS framework + the four citing sites' Kinds and *authors* the DPV triples.

What S012 must add: (a) Phase-1 DPV co-annotation triples authored per ODR-0018 §3a Turtle template (curated set from the four citing sites' Kinds, NOT every PII property); (b) lawful-basis class vocabulary at TBox level (Pandit's S001 dissent vindicated by ODR-0018 four-site spawn — class vocabulary IS TBox-expressible); (c) Article-10 / special-category SHACL `sh:Warning` gate at TBox level (concede load-bearing depth to Pandit); (d) ODRL policy-authoring DEFER per S002 Q10 + Iannella-extended (activation trigger = consent-receipt instance data); (e) SHACL-AF rule at `sh:Warning` for any new PII-bearing predicate minted without DPV co-annotation (Cagle territory — would be a 10th ODR-0017 citing site, pattern density continues); (f) W3C VC consent receipts DEFER to ODR-0016 per Scope-Check 1 Q7c; (g) boundary with Claims settled per ODR-0009 Q6 + ODR-0018 authoring contract.

The depth questions we own: Q1 (curated set vs every-PII-property — joint, Gandon-led on the W3C-reuse driver, Guizzardi-led on the architectural minimalism); Q2 (lawful-basis class vocabulary — Pandit-led; we concede with TBox-expressibility framing from ODR-0018 §3a); Q3 (Article-10 special category — Pandit-led depth; we concede); Q4 (ODRL deferral activation — Gandon-led W3C-side per Iannella ODRL spec); Q5 (PII discovery SHACL-AF hook — joint, ODR-0017 lineage); Q6 (W3C VC consent receipts — Gandon-led deferral to ODR-0016); Q7 (boundary with Claims — settled per ODR-0009 Q6 + ODR-0018; pointer-only).

What is at stake for the methodology if S012 settles wrong: ODR-0012 is the first `kind: architecture` ODR-level discharge under the relaxed A9 regime (post-A9 amendment 2026-05-27). If S012 mistakes itself for `kind: pattern` and tries to re-discharge (a)/(b)/(c) inline, it will duplicate ODR-0018's pattern-extraction work; if it omits authoring the actual DPV triples (claiming "ODR-0018 already authored them"), the four citing sites are left with mapping tables and no instance-graph emission. The architectural kind-discipline is what separates the pattern record (ODR-0018, mechanism) from the architectural layer (ODR-0012, application). Both must exist; both must respect their kind.

## Per-question positions

### Q1 — DPV Phase-1 scope: curated set or every PII property?

**Guizzardi (lead).** **FOR curated set (the four ODR-0018 citing sites' Kinds) — REJECT every-PII-property baseline.** Architectural minimalism: ODR-0012 authors DPV co-annotations only for the Kinds the pattern ODRs (ODR-0005/0006/0009/0015) have *declared* as PII-bearing.

**The curated set (per ODR-0018 §References citing sites):**

- **`opda:Person`** (ODR-0006) — class-level `dpv-pd:Person` + property-level on identifier predicates (`opda:niNumber`/`opda:passportNumber`/`opda:driverLicence` → `dpv-pd:OfficialID`).
- **`opda:Organisation`** (ODR-0006) — class-level `dpv-pd:Identifying` *conditional* on sole-trader / individual-director variants.
- **`opda:Address`** (ODR-0015) — class-level `dpv-pd:Address` baseline + three variant refinements (`title`/`marketing`/`inspire`).
- **`opda:RegisteredTitle`** (ODR-0005 §3c) — class-level `dpv-pd:Identifying` under HMLR PublicTask. `opda:LegalEstate` private until registration.
- **Evidence subclasses** (ODR-0009 §Q6) — DocumentEvidence / ElectronicRecordEvidence / VouchEvidence + voucher third-party PII.

**Why NOT every PII property.** The PDTF schema has ~935 annotated leaves (per ODR-0008 deferred); blanket DPV-tagging would bloat `opda-annotations.ttl` beyond meaningful CI validation, duplicate ODR-0018 §1a class-level baseline authoring, and conflate ODR-0012 (architectural layer) with the pattern records. The curated set is the architectural seam; instance-level emission per generator handles the rest.

**Pair vote on Q1.**

- **Gandon vote: FOR curated set per the four ODR-0018 citing sites + Kendall DA TBox-lean discipline + REJECT every-PII-property baseline.**
- **Guizzardi vote: FOR same** — the four citing sites' Kinds are the architectural seam.

---

### Q2 — Lawful-basis class vocabulary (Pandit's S001 dissent)

**Guizzardi (lead).** **FOR lawful-basis class vocabulary at TBox level — Pandit's S001 dissent vindicated by ODR-0018 four-site spawn.** The class vocabulary IS TBox-expressible per ODR-0018 §3a Operational specifications (mapping tables consumed by generator).

**The argument.** Pandit's S001 position: defining a vocabulary is a TBox act; only *populating* it with instances is Phase 2. ODR-0018 §3a operationalises this exactly — the mapping table `opda:AddressVariantLawfulBasisMap a opda:DPVMappingTable` IS the lawful-basis class vocabulary in TBox form. The variant-conditional entries (`opda:variantValue "title"` → `dpv:PublicTask`) are class-level rules; instance-level emission lands at generation time per ODR-0004 §6a deterministic-emission discipline.

**What ODR-0012 authors (consumed from ODR-0018 §3a + the four citing sites):**

```turtle
# Class-level baseline + mapping tables in opda-annotations.ttl
opda:Person dpv-pd:hasPersonalDataCategory dpv-pd:Person ;
    dct:source <https://w3id.org/dpv/pd> .

opda:RegisteredTitle dpv:hasLawfulBasis dpv:PublicTask ;
    dct:source <https://www.gov.uk/government/organisations/land-registry> ;
    skos:scopeNote "HMLR open-register; ICO public-task lawful basis per ODR-0005 §3c."@en .

opda:AddressVariantLawfulBasisMap a opda:DPVMappingTable ;
    opda:mapsKind opda:Address ;
    opda:mapsVariantPredicate opda:addressVariant ;
    opda:mappingEntry [ opda:variantValue "title" ; opda:lawfulBasis dpv:PublicTask ] ,
                      [ opda:variantValue "marketing" ; opda:lawfulBasis dpv:Consent ] ,
                      [ opda:variantValue "inspire" ; opda:lawfulBasis dpv:PublicTask ] .
```

The mapping table maps *variant values* (SKOS concepts per ODR-0011 §1a) to *DPV class-level lawful-basis URIs*. No instance-graph data is created; the table is a TBox-level routing rule.

**Pair vote on Q2.**

- **Guizzardi (lead) vote: FOR lawful-basis class vocabulary at TBox level per ODR-0018 §3a mapping-table mechanism + Pandit's S001 dissent vindicated.**
- **Gandon vote: FOR same + W3C grounding: DPV 2.0 (Pandit et al. 2024) treats `dpv:hasLawfulBasis` as class-level annotation property — both TBox and ABox range admissible.**

---

### Q3 — Article-10 / special-category (`cautionOrConviction`, AML outcomes)

**Gandon (lead).** **CONCEDE to Pandit's load-bearing depth.** Article-10 / special-category handling needs Pandit's DPV-owned expertise; formal-pair concedes question ownership while supporting the architectural pattern (class-level `dpv:hasSpecialCategoryPersonalData` baseline + SHACL `sh:Warning` gate at TBox level).

**What we commit to (without binding Pandit's authoring).**

- **Class-level `dpv:hasSpecialCategoryPersonalData` baseline** on PII-bearing Kinds that carry Article-10 territory:
  - `opda:DocumentEvidence` with `documentType "caution-or-conviction"` → `dpv-pd:CriminalRecord` (Article 10 special category).
  - `opda:VouchEvidence` where attestation concerns AML outcomes → `dpv-pd:CriminalOffenceOrConviction` baseline.
  - `opda:Person` bearing `opda:cautionOrConviction` predicate (PDTF schema leaf) → conditional `dpv-pd:CriminalRecord` baseline.
- **SHACL `sh:Warning` gate** at TBox level (per stub `## Rules` SHACL sensitivity gate): any property annotated `dpv:hasPersonalDataCategory` of a special category lacking a sensitivity marker fires `sh:Warning`. The shape lives in `opda-shapes.ttl` (per ODR-0004 §3a — NOT in annotation graph).
- **Variant-conditional lawful basis** per ODR-0018 §3a: AML-outcome evidence → `dpv:LegalObligation` (MLR 2017 CDD); voluntary disclosure → `dpv:Consent`; regulator-mandated → `dpv:LegalObligation`.

**Why we concede depth to Pandit.** Article 10 GDPR is the most-regulated PII category in the corpus (criminal-offence data; AML outcomes adjacent); the lawful-basis framework (Art. 10 admits processing only under narrow conditions — `dpv:LegalObligation` for regulated AML, `dpv:Consent` only with explicit consent, `dpv:PublicTask` for statutory bodies) requires the DPV-domain expertise Pandit owns. The pair supports the SHACL gate + class-level baseline architecture; the specific lawful-basis assignments are Pandit's authoring.

**Pair vote on Q3.**

- **Gandon vote: CONCEDE depth to Pandit; SUPPORT class-level baseline + SHACL `sh:Warning` gate at TBox level + variant-conditional lawful-basis per ODR-0018 §3a.** Pandit owns the specific Art. 10 assignments.
- **Guizzardi vote: CONCEDE** — Article 10 territory is Pandit's published-methodology load-bearing depth; UFO grounding (special category as `dpv:hasSpecialCategoryPersonalData` Quality-of-bearer) is unaffected by the concession.

---

### Q4 — ODRL deferral activation trigger

**Gandon (lead).** **FOR DEFER ODRL policy authoring per S002 Q10 + Iannella-extended; activation trigger = consent-receipt instance data entering scope (Phase-2 W3C VC).** Guarino's S001 contradiction holds: ODRL `Policy`/`Permission` constructs bite only on *instances*; an ODRL TBox alone asserts nothing in this round.

**The activation triggers (named, falsifiable):**

1. **W3C VC consent receipts enter scope** (Phase-2; ODR-0016 activation) — `cred:VerifiableCredential` instances carrying consent receipts require ODRL `odrl:Policy` authoring to express the consent-derived permissions.
2. **A specific overlay carries ODRL-shaped policy** (e.g. data-sharing-agreement overlay) — the overlay's consumer query requires policy-instance dispatch ODRL operationalises.
3. **Regulatory trigger** — ICO publishes guidance requiring machine-readable policy expressions; OPDA Trust Framework charter mandates ODRL policy emission.

**What ODR-0012 commits to in Phase-1 (without binding ODRL authoring):**

- **ODRL catalogue admission stands** (per ODR-0002 + ODR-0014 amendment) — `odrl:` prefix is admitted; no policy authoring.
- **The trigger registry is named in `## Consequences`** — when any of the three triggers fires, ODR-0012 amends (or a new ODR is spawned per ODR-0001 §6 spawn rule) to author the policy layer.
- **W3C Recommendation grounding** — Iannella et al. 2018 ODRL 2.2 W3C Recommendation §1 Scope statement confirms ODRL is a *policy expression* language; TBox-only adoption is conformant (per §1.2 Conformance — vocabulary admission without instance commitments is valid).

**Why this resolves Guarino's S001 contradiction.** Guarino's objection was that an ODRL TBox-only adoption asserts nothing — true. The resolution: ODR-0012 confirms the **absence** of any authored `odrl:Policy`/`odrl:Permission`/`odrl:Duty` in the Phase-1 deliverable; the catalogue admission is preparation for activation, not assertion. The Phase-1 conformance test: `ASK { ?s a odrl:Policy }` returns false; `ASK { ?s a odrl:Permission }` returns false; etc. The TBox-only state is operational (catalogue carries the prefix; SHACL shapes can be authored against it) without committing instance data the brief forbids.

**Pair vote on Q4.**

- **Gandon (lead) vote: FOR DEFER ODRL policy authoring + three named activation triggers + Phase-1 absence-confirmation conformance test + W3C ODRL 2.2 §1.2 Conformance grounding.**
- **Guizzardi vote: FOR same** — TBox-only ODRL admission without instance authoring is methodologically conformant; Guarino's S001 contradiction is resolved by the absence-confirmation discipline.

---

### Q5 — PII discovery automation hook

**Guizzardi + Gandon (joint).** **FOR SHACL-AF rule at `sh:Warning` when new PII-bearing predicate minted without DPV co-annotation — TENTH citing site of ODR-0017's SHACL-AF pattern.** Cagle territory; pattern density continues per ODR-0017 §Consequences.

**The SHACL-AF rule (per ODR-0017 §1a template):**

```turtle
opda:UnannotatedPIIPredicateRule a sh:NodeShape ;
    sh:targetClass rdf:Property ;
    sh:sparql [
        sh:select """
            SELECT $this WHERE {
                $this a rdf:Property ; rdfs:domain ?domainClass .
                ?domainClass dpv-pd:hasPersonalDataCategory ?cat .
                FILTER NOT EXISTS { $this dpv-pd:hasPersonalDataCategory ?ownCat }
                FILTER NOT EXISTS { $this dpv:hasLawfulBasis ?lb }
            }
        """ ;
        sh:severity sh:Warning ;
        sh:message "Predicate {$this} bears PII-domain {?domainClass} but lacks DPV co-annotation; standing-cost review required (ODR-0012 stub §Rules)."
    ] .
```

**Standing-cost operationalisation.** Per ODR-0012 stub §Rules: any new personal-data-bearing field is a governance event requiring Council review. The rule fires `sh:Warning` in CI; CI fails on un-resolved warnings (per ODR-0013 when ratified); developer cannot land the predicate without engaging the review.

**10th citing site of ODR-0017.** Count: ODR-0005 §6a + ODR-0011 §5a + ODR-0015 §4a (the three original spawn-rule sites) + ODR-0006 (Person/Organisation/Proprietorship/ParticipantStatus — four sub-sites) + ODR-0009 (PROV-O Verification chain per S009 Q7 — sixth) + ODR-0012 (this rule — tenth). Sub-pattern extraction candidate (governance-layer SHACL-AF rules family) flagged per ODR-0001 §6 spawn rule.

**Pair vote on Q5.**

- **Guizzardi + Gandon joint vote: FOR SHACL-AF rule at `sh:Warning` per ODR-0017 §1a template + standing-cost operationalisation + 10th ODR-0017 citing site + sub-pattern extraction flagged.**

---

### Q6 — W3C VC consent receipts (Phase-2 ambition)

**Gandon (lead).** **DEFER to ODR-0016 per Scope-Check 1 Q7c.** Phase-1 does NOT prepare consent-receipt authoring; ODR-0016 owns the W3C VC / DID binding deliberation when activated.

**Why this defers cleanly.** Per Scope-Check 1 Q7c: ODR-0002 admits `cred:` and `did:` prefixes; ODR-0016 (deferred-until-trigger) owns the binding. Activation triggers (per programme plan §S016 + Scope-Check 1 Q7c): (a) Session 009 Q8 surfaces VC-side decisions (already deferred there); (b) **Session 012 Phase-2 consent receipts** (this question's deferral routes here); (c) a real wallet/DID consumer arrives. The trigger family is the same; ODR-0016 inherits all three at once when activated.

**What S012 commits to without binding:**

- **Structural compatibility preserved.** ODR-0012's DPV co-annotation pattern (per ODR-0018) is compatible with W3C VC consent receipts — a VC carrying a `dpv-gdpr:Consent` instance would have its `credentialSubject` annotated per ODR-0018 §3a mechanism; the structural mapping is preserved by the class-level baseline discipline.
- **No `cred:` / `did:` authoring in S012.** Declaring `opda:Consent rdfs:subClassOf cred:VerifiableCredential` in this ODR would pre-empt Session 016's deliberation. The deferral is genuine — VC-side decisions (signature suite; revocation registry; consent-withdrawal mechanism) cannot be adjudicated without ODR-0016.

**Pair vote on Q6.**

- **Gandon vote: DEFER to ODR-0016 per Scope-Check 1 Q7c + structural compatibility preserved + no `cred:`/`did:` authoring in S012.**
- **Guizzardi vote: DEFER** — UFO grounding (Consent as Substance Kind / Social Object) is unaffected by the deferral; class-level identity preserved across the binding.

---

### Q7 — Boundary with Claims (ODR-0009): DPV co-annotation seam

**Gandon + Guizzardi (joint).** **SETTLED per ODR-0009 Q6 + ODR-0018 authoring contract.** ODR-0009 carries the one-paragraph pointer; ODR-0012 authors per ODR-0018 mapping-table mechanism. No new authoring in S012 beyond confirming the seam.

**The settled state (per S009 Q6 + Scope-Check 1 Q5):**

- **ODR-0009 owns the pointer.** Per S009 Q6 (Gandon-led, Guizzardi-concurred): one-paragraph pointer to ODR-0012 identifying class-level PII-bearing seams (DocumentEvidence / ElectronicRecordEvidence / VouchEvidence + the voucher Person as third-party PII).
- **ODR-0012 owns authoring.** Per ODR-0018 §Rules clause 7: "ODR-0012 is the authoring authority. Consuming ODRs declare the PII-bearing Kinds + variants + mapping tables; ODR-0012 authors the actual DPV triples + lawful-basis assignments."
- **Forward-supersession mechanism retained.** Per Scope-Check 1 Q5 refinement vote 8-1: if S012 deliberation surfaces a tighter pattern that *changes* ODR-0009's pointer text, `## Supersession scope:` from ODR-0012 onto ODR-0009 is the amendment vehicle. Otherwise no supersession needed.

**What S012 commits to under this seam (per ODR-0018 §3a Turtle template):**

```turtle
# DocumentEvidence DPV authoring (consumed from ODR-0009 Q6 + ODR-0018 §3a)
opda:DocumentEvidence dpv-pd:hasPersonalDataCategory dpv-pd:OfficialID ;
    dct:source <https://w3id.org/dpv/pd> .

opda:DocumentEvidenceLawfulBasisMap a opda:DPVMappingTable ;
    opda:mapsKind opda:DocumentEvidence ;
    opda:mapsVariantPredicate opda:documentType ;
    opda:mappingEntry [ opda:variantValue "grant-of-probate" ; opda:lawfulBasis dpv:LegalObligation ] ,
                      [ opda:variantValue "passport" ; opda:lawfulBasis dpv:LegalObligation ] ,
                      [ opda:variantValue "driving-licence" ; opda:lawfulBasis dpv:LegalObligation ] .

# VouchEvidence + voucher third-party PII
opda:VouchEvidence dpv-pd:hasPersonalDataCategory dpv-pd:Identifying ;
    dct:source <https://w3id.org/dpv/pd> ;
    skos:scopeNote "Voucher Person bears third-party PII; GDPR Art. 14 third-party data rules apply."@en .
```

**Why the seam is settled.** S009 settled the pointer authority; ODR-0018 settled the pattern mechanism; ODR-0012 (this session) authors per the settled discipline. The boundary is operational, not contested. Pair confirmation only.

**Pair vote on Q7.**

- **Gandon + Guizzardi joint vote: SETTLED per ODR-0009 Q6 + ODR-0018 §Rules clause 7 + Scope-Check 1 Q5 forward-supersession mechanism retained.** Pair confirms the seam; ODR-0012 authors per the settled discipline; no new boundary work in S012.

---

## Cross-cutting concerns

**Thread 1: `kind: architecture` discharge.** ODR-0012 is `kind: architecture`, not `kind: pattern` — it authors the *system* (DPV co-annotations across the corpus) the pattern records (ODR-0018) operationalise. The architectural discharges in the corpus: ODR-0001 (methodology); ODR-0003 (programme anchor); ODR-0004 (foundation); ODR-0012 (governance layer). Pattern ODRs (ODR-0005/0006/0009/0011/0015/0017/0018) discharge A9 §Per-kind discipline inline; ODR-0012 does not — it consumes the patterns' mapping tables and emits the actual DPV triples. ODR-0018 §Consequences clause 3 confirms: "ODR-0012 inherits this pattern as authoring contract … will reference ODR-0018 as the canonical mechanism + author the actual DPV triples + variant mapping tables."

**Thread 2: Three-graph separation honoured (per ODR-0004 §3a + ODR-0018 §3a CI tests).** DPV co-annotations land in `opda-annotations.ttl` only; the three CI tests per ODR-0018 §3a operationalise the discipline (`ASK` over `opda:shapes` and `opda:classes` MUST return false for DPV triples; `ASK` over `opda:annotations` MUST return true). The Q5 SHACL-AF *rule* is excepted (lives in shapes graph per ODR-0017 §1a); the rule's *annotations* still live in annotations graph.

**Thread 3: Reference-not-import discipline (Kendall DA).** Canonical DPV URIs cited (`dpv`, `dpv-pd`, `dpv-legal`, `dpv-gdpr`); local SHACL enforces usage; **no `owl:imports`**. Only the curated set (Q1) gets DPV tags — ODR-0012 does NOT import the full DPV vocabulary into the OPDA graph. Reference-not-import preserves the W3C-hosted canonical definitions while keeping the TBox lean.

---

## DA anticipation — Elisa Kendall (reference-not-import; TBox lean)

Kendall's published methodology (FIBO module-system parsimony; ODR-0002 Q2 reference-not-import — owned) carries two opposition lines.

**Line 1 (Q2): mapping tables bloat the TBox; the mapping is procedural — encode in generator code, not RDF.** Engagement: the consumer query requiring RDF encoding is the **`odr-review` lint extension** per ODR-0018 §Consequences. SPARQL ASK against `opda:annotations` validates `implements: ODR-0018` conformance; tables in generator code would lose the lint check. Cagle's DBpedia 2017 LLM-fallback lesson (per ODR-0018 §Alternatives) applies — structured RDF beats procedural code for LLM-consumer and lint discipline. **Anticipated outcome: partial-concession**; TBox-lean concern preserved as standing review obligation (any new mapping table is a governance event).

**Line 2 (Q3): Article-10 SHACL severity should be `sh:Violation`, not `sh:Warning`.** Engagement: severity-tier decision routes to S013 Q1 (per programme phasing); ODR-0012 *recommends* `sh:Violation` for special-category omissions as input to S013 deliberation, but the canonical severity authority is ODR-0013. **Anticipated outcome: partial-withdrawal**; severity escalation acknowledged; S013 owns the final ruling.

**Lines no dissent expected.** Q1 curated set (TBox-lean concurrence); Q4 ODRL deferral (reference-not-import family); Q5 SHACL-AF (CI/lint runtime cost bounded; no query-time impact); Q6/Q7 (deferral + settled-seam — no architectural pressure).

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind / Quality).
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18 §4.2 (DOLCE NonPhysicalEndurant — Trust Framework as Social Object); §4.3 (Quality Region — DPV PII category as Quality value).
- Searle, J. (1995). *The Construction of Social Reality* (legal-institutional objects — DPV regulatory framework grounding).
- Pandit, H. et al. (2024). *DPV 2.0 — Data Privacy Vocabulary Specification*. DPVCG W3C Community Group Recommendation. (Class-level annotation property semantics — Q2 lawful-basis class vocabulary grounding.)
- Iannella, R., Villata, S., eds. (2018). *ODRL Information Model 2.2*. W3C Recommendation. §1 Scope (policy expression language); §1.2 Conformance (TBox-only admission valid — Q4 deferral grounding).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §5.2.6 SPARQL-based constraints (Q5 SHACL-AF rule).
- GDPR Regulation (EU) 2016/679 — Art. 5 (lawful basis); Art. 6 (lawful processing); Art. 9-10 (special category + criminal records — Q3 grounding); Art. 14 (third-party data — Q7 voucher PII).
- ICO (2023). *Guidance on Public Authorities Lawful Bases*. (Q1 RegisteredTitle PublicTask grounding.)
- Hillmann, D., Westbrook, J. (2008). *Dublin Core Metadata Initiative Recommendation*. DCMI Usage Board. (`dct:source` semantics — DPV co-annotation lineage per ODR-0018 §3a.)
- Hellmann, S. et al. (2017). *DBpedia 2017 — LLM fallback failure modes on natural-language `rdfs:comment`*. (Q2 mapping-tables-as-RDF grounding vs procedural code.)
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment 2026-05-27. ODR-0012 is the **fourth `kind: architecture` ODR-level discharge** under the relaxed A9 regime (after ODR-0001/0003/0004).
- ODR-0004 §3a (three-graph separation — DPV co-annotations in `opda-annotations.ttl`); §6a (deterministic emission — generator consumes mapping tables); §7a (term-sourcing five-line precedence — DPV `dct:source` to W3C-hosted canonical URIs).
- ODR-0005 §3c (RegisteredTitle PII regime — Q1 curated set citing site).
- ODR-0006 §Q1+Q4 (Person identifier predicates + Organisation registration data — Q1 curated set citing site).
- ODR-0009 §Q6 (DPV co-annotation seam pointer — Q7 settled boundary; ODR-0012 authoring authority).
- ODR-0011 §1a (SKOS scheme membership — DPV category schemes; verification-method schemes); §8a (seven-category UFO framework — DPV Quality categorisation).
- ODR-0015 §7a (Address class-level + three variant refinements — Q1 curated set citing site; Q2 ODR-0018 §3a mapping table source).
- ODR-0017 (SHACL-AF non-blocking data-quality rules pattern) — **10th citing site in this session for PII-discovery rule** (Q5). Sub-pattern extraction (governance-layer SHACL-AF family) flagged for future session.
- ODR-0018 (DPV class-level co-annotation pattern) — **load-bearing input**. §Rules clause 7 names ODR-0012 as authoring authority; §3a Turtle template consumed; §Consequences clause 3 confirms ODR-0012's inheritance.
- ODR-0016 (W3C VC / DID Compatibility Layer — deferred-until-trigger) — Q6 deferral routes here; activation triggers per Scope-Check 1 Q7c.
- ODR-0013 (SHACL Validation & Severity — Phase 6 closing session) — Q3 severity-tier decision routed here; ODR-0012 recommends `sh:Violation` for special-category omissions.
- Scope-Check 1 (2026-05-26) Q5 (DPV co-annotation authorship routing — ODR-0012 owns authoring; Q7 settled boundary); Q7c (W3C VC/DID admission triggers — Q6 deferral).
- S001 Q2 (DPV/ODRL deliberation — Pandit's dissent now vindicated by ODR-0018 four-site spawn); S001 Q6 (DPV evidence co-annotation — Moreau-led; settled by S009 Q6).
- S012 plan §S012 (Queen Pandit; DA Kendall; teammates default + dpv-odrl); ODR-0012 stub (the proposal under deliberation).
