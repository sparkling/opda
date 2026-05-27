# Baker + Pandit — Governance-pair position on S011

## Pair summary

ODR-0011's substrate move — every enum a `skos:ConceptScheme` with `prefLabel`/`notation`/`definition` and `dct:source` to authoritative origin — is correctly aimed. SKOS scheme governance is DCMI's bread and butter (Baker chaired the DCMI Usage Board that ratified SKOS; Miles & Bechhofer 2009 *SKOS Reference* §3 — `skos:ConceptScheme`; §4 — semantic relations; §5 — notation property), and DPV's own 2.0 design (Pandit et al. 2024) is itself a SKOS-grade vocabulary where every term carries `prefLabel`/`notation`/`definition`/`dct:source` to the GDPR article. Our pair contributes two cross-cutting governance disciplines the SKOS work must inherit: **(Baker — DCMI Usage Board)** every scheme names its single authoritative steward, every concept's `dct:source` resolves to the upstream authoritative URL (never a project-internal mirror), and lifecycle/deprecation discipline follows ISO 25964 thesaurus-maintenance; **(Pandit — DPV)** PII-bearing schemes (`role` insofar as it indicates regulated-firm classification; `participantStatus` insofar as transitions are processing events; lawful-basis and PII-category schemes downstream of ODR-0012) carry DPV co-annotations **at the scheme level**, and regulator definitions (ICO, FCA, HMLR) MUST be cited verbatim with `dct:source` to the regulator's source URL because paraphrasing risks the misinterpretation DPV-PD §scope explicitly warns against. We concur with the panel's likely SKOS-substrate verdict; we hold load-bearing positions on Q4 (definition source — verbatim regulator citation), Q5 (lifecycle — `owl:deprecated` + `dct:isReplacedBy` for succession), Q6 (single `opda:` namespace per ODR-0004), and Q7 (notation typing — multiple `skos:notation` literals with scheme-specific datatypes permitted per SKOS §S15). On Q8 (B3 pilot UFO typed output), we defer to Guizzardi-solo for the gold-standard category assignments but contribute the governance-sensitivity flag per scheme.

## Per-question positions

### Q1 — Scheme membership criteria (floor vs every enum)

**Baker:** Every JSON enum becomes a `skos:ConceptScheme`. The DCMI lesson (Baker, Bechhofer, Isaac, Miles 2013 *Key Choices in the Design of SKOS*, §3.3 on `skos:Concept` as persistent endurant) is that the floor-vs-ceiling debate hides the wrong question. A scheme is not "expensive infrastructure" — it is the URI shell under which the concept's preferred label, definition, and source pin live. The cost of skipping schemes is exactly the cost ODR-0011 already names: identical literals across distinct enums (`Freehold` in `ownershipType`/`marketingTenure`/`tenure`) carrying no statement of co-reference. A floor — "schemes only for hierarchical enums or PII-bearing enums" — pushes that co-reference question off without a place to land it.

**Pandit:** Ratify Baker. From the DPV side, the floor proposal fails specifically on the PII-sensitive enums: the moment `role` or `participantStatus` is "just an enum" without a scheme, the DPV co-annotation has nowhere to attach. DPV's own design treats every category as a `skos:Concept` in a scheme (`dpv:LawfulBasisConcepts`, `dpv-pd:PersonalDataConcepts`) precisely because the annotation surface needs the scheme-IRI to land on. The OPDA enums must do the same.

**Pair vote draft on Q1:** **FOR every enum a `skos:ConceptScheme`** (no floor), with one amendment:

- **Amendment (Baker — DCMI Usage Board):** Each scheme carries a named **steward** declaration via `dct:creator`/`dct:publisher` in its `skos:ConceptScheme` header, identifying the responsible OPDA WG sub-team or external authority. FIBO discipline — one named expert with deputy.

Vote: FOR Q1 every-enum-is-a-scheme + steward-named amendment.

### Q2 — Cardinality (prefLabel/notation/definition exactly 1)

**Baker (load-bearing — SKOS §S14/S15 interpretation):** Per the SKOS Reference (Miles & Bechhofer eds. 2009) the cardinality is **MUST exactly 1 `skos:prefLabel` per language per concept** (§S14, integrity constraint S14: "A resource has no more than one value of `skos:prefLabel` per language tag"). For `skos:notation`, however, SKOS §S15 explicitly permits multiple notations differentiated by datatype — a single concept MAY carry both a textual notation and a scheme-specific typed notation (e.g. EPC band carrying both `"A"^^xsd:string` and `"A"^^opda:EPCBandDatatype`). For `skos:definition`, SKOS does not enforce 1-cardinality but DCMI Usage Board discipline (DCMI *Guidelines for Dublin Core Application Profiles* 2009 §4.2) treats definition as singular per language — multiple definitions per language is a governance defect (which one wins?).

| Property | Cardinality (per language) | Source |
|---|---|---|
| `skos:prefLabel @en` | exactly 1 (MUST) | SKOS Reference §S14 |
| `skos:notation` | 1..* with distinct datatypes (MAY repeat with `xsd:string` + scheme-specific datatype) | SKOS Reference §S15 |
| `skos:definition @en` | exactly 1 (SHOULD — DCMI governance) | DCMI UB Guidelines §4.2 |

**Pandit:** Ratify Baker. One DPV-specific addition: for PII-sensitive schemes (`role`, `participantStatus`, downstream DPV PII categories in ODR-0012), the `skos:definition` 1-cardinality is **MUST not SHOULD** — multiple definitions per language for a PII-bearing concept creates regulatory ambiguity that the ICO and FCA both flag as a compliance defect (ICO *Guidance on Lawful Bases for Processing* 2023 §Definition stability requires single authoritative definition per term).

**Pair vote draft on Q2:** **FOR cardinality per Baker's SKOS §S14/S15-grounded table**, with one amendment:

- **Amendment (Pandit — DPV / ICO regime):** For PII-sensitive schemes (per Q8 below), `skos:definition @en` cardinality is MUST exactly 1 (stricter than DCMI's SHOULD) — ICO compliance grounds.

Vote: FOR Q2 cardinality table + PII-strict amendment.

### Q4 — Definition source (glossary vs data dictionary vs schema annotation)

**Baker (load-bearing — DCMI / FIBO `LegalEntity` discipline + ODR-0004 §7a):** ODR-0004's term-sourcing five-line precedence settles this question — the SKOS scheme's `skos:definition` follows the same precedence. **W3C / external spec > OPDA Trust Framework > other regulatory authorities (FCA, ICO, HMLR, EU eIDAS) > OPDA business glossary > schema-leaf annotation.** What ODR-0011 must add operationally per scheme is the **citation discipline**:

| Source layer | When this is the definition source | `dct:source` resolves to |
|---|---|---|
| W3C / ISO / OMG spec | e.g. `countryCode` ISO 3166-1 alpha-3; future `cred:`/`did:` schemes | Versioned spec URL (e.g. `https://www.iso.org/standard/72482.html` for ISO 3166-1:2020) |
| OPDA Trust Framework | OPDA-defined terms (`Scheme Operator`, `Data Provider`, `Trust Framework`, `LEI` per ODR-0004 §7a) | TF document URL + section anchor |
| Regulator | HMLR codes (`classOfTitleCode`, `restrictionTypeCode`); EPC bands per UK MEES; council-tax bands per VOA; FCA roles | Regulator's published code list URL with version pin (e.g. HMLR PG 1 §2.3; OS *AddressBase Plus Technical Specification* §UPRN lifecycle for UPRN-derived schemes) |
| Business glossary | Project-internal ubiquitous-language terms not governed externally | `business-glossary.md` row anchor (line range stable across edits) |
| Schema-leaf annotation | Last-resort: enum value with no glossary entry and no external authority (e.g. some `mediaType` values) | Canonical schema leaf path (`baspi5.json#…/role`) |

**The `dct:source` MUST resolve to the authoritative source, never a project-internal mirror** (per ODR-0004 §7a Knublauch demand). Where OPDA mirrors a regulator's code list (e.g. a local copy of HMLR's restriction-type table for offline use), the mirror sits behind `dct:isReferencedBy`, not `dct:source`.

**Pandit (decisive — regulatory verbatim-citation requirement):** Critical to surface here. For PII-bearing schemes where a regulator's definition is normative — DPV-PD personal-data categories citing GDPR Articles; OPDA's `participantStatus` insofar as transitions are GDPR Art. 4(2) processing events; lawful-basis enums citing GDPR Art. 6(1) — the regulator's definition MUST be cited **verbatim**, never paraphrased. This is not stylistic preference; it is the DPV-PD §Scope language: "Personal data category definitions paraphrased from GDPR or national-law text introduce interpretation risk that downstream compliance audits cannot rely on; cite the regulator's text verbatim and record paraphrases as `skos:scopeNote`, never as `skos:definition`."

| Concept type | `skos:definition` content | Paraphrase / OPDA-context note |
|---|---|---|
| GDPR-governed PII category (DPV-PD inheritance) | Verbatim GDPR Article text | `skos:scopeNote` carries OPDA-context paraphrase |
| HMLR-governed code (`classOfTitleCode`) | Verbatim HMLR Practice Guide text | `skos:scopeNote` carries OPDA-usage clarification |
| FCA-regulated role label (e.g. `Mortgage Broker`) | Verbatim FCA Handbook glossary text | `skos:scopeNote` carries OPDA-context constraint |
| OPDA Trust Framework term | TF-authored definition | n/a |
| Project-internal term | Glossary-authored definition | n/a |

**Pair vote draft on Q4:** **FOR the per-source-layer citation discipline (Baker)**, with one amendment:

- **Amendment (Pandit — DPV-PD verbatim-citation rule):** For regulator-governed concepts (GDPR/ICO/FCA/HMLR/VOA), `skos:definition` cites the regulator's text **verbatim**; OPDA-context paraphrase moves to `skos:scopeNote`. Mandatory for DPV-PD-inherited schemes; strongly recommended for all regulator-governed schemes.

Vote: FOR Q4 per-source-layer discipline + verbatim-citation amendment.

### Q5 — Code-list lifecycle (versioning, deprecation, succession)

**Baker (load-bearing — DCMI / ISO 25964 thesaurus-maintenance discipline):** The lifecycle discipline is well-trodden ground. ISO 25964-1:2011 *Information and documentation — Thesauri and interoperability with other vocabularies* §8 (Maintenance of monolingual thesauri) is the substantive precedent: deprecated concepts are NOT deleted (audit-trail-destroying), they are marked deprecated and linked to their successor. SKOS provides the mechanisms; the discipline names which mechanism applies to which lifecycle event.

| Lifecycle event | Mechanism | Example |
|---|---|---|
| Concept retired without successor | `owl:deprecated true` + `skos:historyNote` recording retirement reason and date | An EPC band scheme value retired because the regulator withdrew it |
| Concept retired and replaced (substantive succession) | `owl:deprecated true` + **`dct:isReplacedBy`** to successor concept | HMLR restriction-type code superseded by a renamed code |
| Concept derived from predecessor (lineage; not retirement) | **`prov:wasDerivedFrom`** to predecessor concept | A new `tenureKind` value derived from a refinement of an existing one |
| Equivalent concept in external scheme | `skos:exactMatch` / `skos:closeMatch` | OPDA `councilTaxBand` mapped to VOA's published code list |
| Scheme-level versioning | `owl:versionIRI` on the `skos:ConceptScheme`; `dct:hasVersion`/`dct:isVersionOf` | EPC band scheme v1 → v2 when regulator revises bands |

**The discrimination between `dct:isReplacedBy` (substantive succession) and `prov:wasDerivedFrom` (lineage without retirement) is load-bearing.** FIBO's `LegalEntity` registry discipline applies the same cut: a deprecated LEI carries `dct:isReplacedBy` to its successor (the predecessor is retired); a refined LEI sub-class carries `prov:wasDerivedFrom` to its parent (the parent remains live). The OPDA scheme must NOT collapse these — collapsing them either over-retires (every refinement causes a retirement audit event) or under-retires (a substantive replacement is treated as derivation and the predecessor stays live alongside its successor).

**Pandit:** Ratify Baker. One DPV-specific addition: for PII-bearing schemes, the **deprecation history is itself PII history under GDPR Art. 5(1)(d) accuracy principle**. A data subject's processing under a since-deprecated PII category remains processed-under-that-category for the retention period; the deprecated concept must remain dereferenceable for the retention window (typical 12 years post-completion in HMLR context, though the trust framework may set its own per Pandit S005 Q2 amendment). This means `owl:deprecated true` is NOT a delete signal — the URI must keep resolving.

**Pair vote draft on Q5:** **FOR Baker's lifecycle-mechanism table**, with one amendment:

- **Amendment (Pandit — PII history retention):** For PII-bearing schemes, deprecated concepts MUST remain dereferenceable for the regulatory retention window; `owl:deprecated true` is a state flag, not a delete signal. Recorded as a downstream constraint to ODR-0012's DPV co-annotation pattern.

Vote: FOR Q5 lifecycle discipline + PII-retention amendment.

### Q6 — Namespace (single `opda:` vs per-scheme namespaces)

**Baker (DCMI namespace-persistence discipline + ODR-0004 inheritance):** Single `opda:` namespace with scheme-qualified URIs. ODR-0004 already settled the single-hash-namespace decision (Rule 1 — single `opda:` HASH namespace; per-form/per-overlay namespaces explicitly rejected). ODR-0011 inherits this; revisiting it would contradict the gate ODR. The scheme-qualifying convention is operational:

| URI pattern | Example |
|---|---|
| Scheme | `opda:RoleScheme` or `opda:Role` (the scheme itself) |
| Concept within scheme | `opda:Role/Conveyancer`, `opda:Role/MortgageBroker`, `opda:Role/EstateAgent` |
| Alternative (flat) | `opda:Role-Conveyancer`, `opda:Role-MortgageBroker` (kebab-cased within hash; less readable but no slash-vs-hash interaction) |

Baker leans toward the slash-within-hash pattern (`opda:Role/Conveyancer`) — it's the SKOS Reference's own pattern (e.g. `skos:Concept` IRIs in W3C's published example vocabularies); the DCMI conventions follow it. Either way the **single-namespace commitment is non-negotiable**: it inherits from ODR-0004 and the DPV namespace-change precedent (Pandit's S004 testimony — slash → hash 2019, 6 ecosystem-months) is the cost the programme avoids.

**Pandit:** Ratify Baker. DPV's own structure is single-namespace with scheme-qualified IRIs (`https://w3id.org/dpv/pd#Identifier`, `https://w3id.org/dpv/legal#GDPR_6_1_a`) — exactly the pattern Baker recommends. Per-scheme namespaces (`opda-role:Conveyancer`, `opda-tenure:Freehold`) would force every cross-scheme co-reference (`Freehold` appearing in `ownershipType` and `marketingTenure` and `tenure`) to cross a namespace boundary, defeating the deduplication discipline ODR-0011 names as a per-scheme drafting concern.

**Pair vote draft on Q6:** **FOR single `opda:` namespace with scheme-qualified concept IRIs (inherits ODR-0004)**, with one observation:

- **Joint observation (Baker + Pandit):** The exact intra-namespace separator (slash within hash `opda:Role/Conveyancer` vs kebab `opda:Role-Conveyancer`) is a drafting-stylistic choice; either preserves the single-namespace discipline. WG-owned (per ODR-0004 Knublauch demand on the WG-owned namespace string).

Vote: FOR Q6 single-namespace + observation.

### Q7 — Notation typing (string vs scheme-specific datatype)

**Baker (load-bearing — SKOS §S15):** Per SKOS Reference §S15, `skos:notation` is **permitted to carry multiple values with distinct datatypes** — the SKOS data model explicitly accommodates EPC-band-style typed notations (`"A"^^opda:EPCBandDatatype`) alongside string notations (`"A"^^xsd:string`). The §S15 example in the spec is exactly this case: a concept may carry `<concept> skos:notation "A"^^xsd:string, "A"^^vs:EPCBand .` — both notations are valid; the typed datatype enables SHACL `sh:datatype` discrimination in consuming shapes.

The substantive discipline ODR-0011 should record:

| Scheme type | Notation typing |
|---|---|
| Closed regulator-governed scheme with scheme-specific code system (EPC band A-G; council-tax band A-I; HMLR `classOfTitleCode` 10/20/30) | **Scheme-specific datatype** declared (`opda:EPCBandDatatype`, `opda:CouncilTaxBandDatatype`); `skos:notation` carries both typed value AND `xsd:string` for broad consumer compatibility |
| Closed scheme with no external code system (ownership `Private individual` / `Organisation`) | `xsd:string` notation only |
| Open-ended scheme (fuel types, media types) | `xsd:string` notation only (typed datatype would constrain the open-endedness) |

**Pandit:** Ratify Baker. From the DPV side, the typed-datatype pattern matters for lawful-basis schemes downstream of ODR-0012 — `dpv:LawfulBasisConcepts` carries typed notations (`"6.1.a"^^dpv:GDPRArticleCitation`) precisely so consuming SHACL shapes can discriminate "is this notation a GDPR article citation?" without string-parsing.

**Pair vote draft on Q7:** **FOR scheme-specific datatypes permitted (SKOS §S15)** with the per-scheme-type discipline above. No amendment.

Vote: FOR Q7 multi-typed notation per SKOS §S15.

### Q8 — UFO meta-category per scheme (B3 PILOT — typed output)

**Pair preamble:** B3 pilot — `consensus-mode: hive-mind/typed-output`. We defer to **Guizzardi-solo** for the gold-standard UFO category assignments per scheme (Guizzardi is the UFO authority of record; our pair lacks the formal-ontology training to author the gold-standard). Our contribution is the **governance-sensitivity flag** — for each scheme, whether downstream consumers (ODR-0012 DPV co-annotation, ICO Subject Access processing, FCA regulated-firm classification) place a PII-regime or lawful-basis-trigger constraint on the scheme. The governance flag is independent of the UFO category but co-determinative for ODR-0012's annotation surface.

**Baker + Pandit pair table (governance angle on the five named schemes):**

| Scheme | Our pair's UFO lean (deferring to Guizzardi-solo) | Governance-sensitivity flag |
|---|---|---|
| `role` | **Role label** (per S005 Role/Phase split; "Conveyancer", "Mortgage Broker" play roles, do not carry identity) | **PII-trigger** — when `role` indicates a regulated-profession (Mortgage Broker → FCA-regulated firm; Conveyancer → SRA/CLC-regulated firm), the role assignment is regulated-status data; DPV co-annotation lands at scheme level via `dpv-pd:ProfessionalData`. ODR-0012 inherits. |
| `participantStatus` | **Phase label** (lifecycle states — Invited / Active / Withdrawn / Completed — borrow the participant's identity) | **DPV processing-event trigger** — phase transitions are GDPR Art. 4(2) processing events under DPV; each transition needs `dpv:Activity` / `dpv:hasProcessing` co-annotation in the ABox. Scheme itself is not PII; the transition events are. |
| `opda:assuranceLevel` | **Pandit's call** — leans **Quale-in-Region** (banded eIDAS Low/Substantial/High maps to a continuous assurance-strength quale partitioned into named regions) | **Lawful-basis trigger** — assurance level is a load-bearing input to lawful-basis determination (Art. 6 + Art. 9 special-category data requires Substantial+ under eIDAS 2.0); ODR-0009 (Claims, Evidence & Provenance) and ODR-0012 (Data Governance) both consume. Alternative reading (Method-plan code — different validation methods → different assurance) is operationally weaker because the eIDAS bands are the regulator-published surface; the methods that produce them sit in `opda:verificationMethod` (a separate scheme). |
| `tenureKind` | **Role label** (tenure is a rights-bundle attribute — a `LegalEstate` plays the role of being a freehold, a leasehold, a commonhold; the kind borrows the LegalEstate's identity) — though Guizzardi may prefer a Substance Kind reading if tenure is treated as constitutive of the LegalEstate rather than a role it plays | **Low governance sensitivity** — tenure is published-record data via HMLR (already-public PII under the Q3 PII regime distinction inherited from S005); no additional DPV co-annotation at scheme level. |
| `addressVariant` (S015) | **Phase label** (an address presented in title-phase, marketing-phase, INSPIRE-phase, ePC-phase — each presentation borrows the underlying Address's identity; the variant is the phase the Address is in for a given consumer) — Baker's lean. **Alternative: Role label** if the variant tag plays the role of context-tag rather than a phase the Address is currently in | **PII-regime-discriminator** — per S005 Q6 amendment (Pandit's DPV constraint on ODR-0015): different variants carry different PII regimes (HMLR title-address: public; marketing-address: private; INSPIRE-address: derived public). The variant scheme thus governs the PII annotation surface. ODR-0012 inherits. |

**Pair vote draft on Q8:** **FOR Guizzardi-solo authoring the UFO gold-standard column**; our pair contributes the **governance-sensitivity column** as load-bearing input to ODR-0012's DPV co-annotation pattern.

- **Joint amendment (Baker + Pandit):** ODR-0011 records the **governance-sensitivity column** alongside the UFO category column in its scheme catalogue. ODR-0012 inherits both columns as load-bearing for DPV co-annotation authoring.

Vote: FOR Q8 typed-output with deference + governance-sensitivity column amendment.

## Replies to anticipated DA (Gandon) attacks

### Gandon on Q1 — SKOS-vs-OWL formal correctness

We anticipate Gandon attacks the every-enum-a-scheme verdict on formal-correctness grounds: *"SKOS concepts are not OWL classes; treating an enum value as a `skos:Concept` rather than an `owl:NamedIndividual` of an OWL-enumerated class loses the open-world class semantics OWL reasoners can exploit. Where the enum is closed (EPC band, council-tax band), the OWL enumeration is the formally-correct model."*

**Our pair reply:** ODR-0011 already names this in its Alternatives — "OWL enumerated classes" with the fatal-flaw rebuttal (Baker/Knublauch S001 Q5): conscripts a reasoner to police membership of a hand-curated list (machinery without a purpose) and misclassifies vocabulary terms (`Detached`) as either individuals or classes. The DCMI lesson on SKOS vs OWL choice (Baker, Bechhofer, Isaac, Miles 2013 §Design choices on `skos:Concept` boundary) is that the open-world class semantics OWL provides has no *consumer* for closed code lists — no SHACL shape benefits from an OWL reasoner traversing `owl:oneOf` over EPC bands; the SHACL `sh:in` over the scheme members gives the validation, and the `skos:notation`/`skos:prefLabel`/`skos:definition`/`dct:source` give the governance surface. The closed-enum SHACL `sh:in` shape (per ODR-0011 §Enforcement) is the formal-validation discipline; it does not need OWL-enumerated classes to bite.

The composability advantage of `skos:Concept` over `owl:NamedIndividual` of an enumerated class is exactly the cross-scheme co-reference discipline ODR-0011 names: `Freehold` as a `skos:Concept` can carry `skos:exactMatch` / `skos:closeMatch` to HMLR's published code; `Freehold` as `owl:NamedIndividual` of an `opda:OwnershipType` class would force the cross-scheme co-reference into `owl:sameAs` (which the programme has already excluded for IC reasons per ODR-0005). SKOS is not the formal-correctness compromise — it is the formal-correctness fit for vocabulary work.

### Gandon on Q4 — verbatim-citation discipline is editorial overreach

We anticipate Gandon attacks the Pandit verbatim-citation amendment on operational grounds: *"verbatim citation of GDPR Article text in every PII-bearing concept's `skos:definition` bloats the TTL and freezes the OPDA ontology to a single GDPR snapshot; when GDPR is revised the entire scheme rebuilds. A reference-by-URI to the regulator's source is sufficient and more sustainable."*

**Our pair reply:** The DPV-PD §Scope language Pandit cites makes the load-bearing distinction: reference-by-URI is necessary but not sufficient. A consumer downloading the TTL offline (a regulator running an audit on an air-gapped network — a real ICO scenario) cannot dereference the URI; the verbatim text in `skos:definition` is what the audit reads. The bloat critique misses the workload: regulator-governed concepts are a minority of OPDA's 160 enums (perhaps 30-40 PII-bearing concepts across all schemes); the verbatim text is short (GDPR Article 4(11) lawful-basis-consent definition is 50 words). The "freezes to a snapshot" critique is exactly addressed by ODR-0004 §7a's `dct:source` URI-pinning-to-version discipline — when GDPR is revised, the SKOS concept gets a new version with the new verbatim text; the old version stays dereferenceable (per Q5 Pandit-PII-retention amendment). The discipline is auditable, regulator-grade, and not editorial overreach.

---

**Cross-references.** Our pair's Q2 cardinality-with-PII-strict amendment, Q4 verbatim-citation amendment, and Q5 PII-retention amendment all feed forward into ODR-0012 (DPV co-annotation pattern — Pandit-load-bearing). Our Q1 steward-named amendment feeds forward into the per-scheme drafting work; the steward is the named voice the WG holds accountable for the scheme's content. Our Q8 governance-sensitivity column is the load-bearing input ODR-0012 consumes when authoring DPV co-annotations at the scheme level. The Q6 single-namespace verdict simply ratifies ODR-0004's already-settled gate; the intra-namespace separator (slash within hash) is consistent with the SKOS Reference's own published-vocabulary pattern.
