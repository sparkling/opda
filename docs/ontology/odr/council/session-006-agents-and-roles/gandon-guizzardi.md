# Gandon + Guizzardi — formal-pair on S006

*Joint pair voice. **Guizzardi is Queen** for this session per plan §S006 ("Queen: Giancarlo Guizzardi; DA: Dean Allemang"); the position file therefore writes Guizzardi-led on UFO-load-bearing questions (Q1 ICs, Q2 RoleMixin/Role, Q3 Proprietorship Relator, Q4 Capacity/Authority split, Q7 Phase confirmation) and Gandon-led on the W3C/artefact questions (Q5 Address consumption from S015, Q6 W3C Org Ontology adoption). The pair is joint throughout — this session is the first to discharge the per-kind discipline (A9) AGAINST the precedent set by S005, S015 and S011. The methodology pressure is real: ODR-0006 inherits the IC discipline (SHACL primary; no `owl:sameAs`; PROV-O succession) and the seven-category UFO framework from ODR-0011 §8a. The work is to apply, not to invent.*

## Stance summary

ODR-0006 is `kind: pattern` (the fourth `kind: pattern` ODR to discharge under A9 in this session-batch). The stub is already well-developed: §Decision commits to a Kind/RoleMixin/Role layering with Person/Organisation as Kinds, Seller/Buyer as RoleMixins, Proprietor/Conveyancer/EstateAgent/Surveyor/Lender/Insurer as Roles; capacity is split into asserted (SKOS-typed) and evidenced (link to evidence per ODR-0009); SHACL shapes constrain role-play to Person/Organisation bearers. The freeze gate is the W3C Org vs bespoke `opda:` choice (Q6) plus inheritance from ODR-0005's identity-criterion gate (now cleared) and ODR-0015's Address class (now declared).

What S006 must add to clear A9 §Per-kind discipline (b): (a) UFO/DOLCE meta-category commitments for Person, Organisation, Seller/Buyer, Proprietor, and the Proprietorship Relator; (b) IC over named hard cases for Person (name-change / gender-recognition / death) and Organisation (merger / demerger / dissolution); (c) artefact realisation via SHACL shapes + PROV-O succession + (the **fifth** citing site of ODR-0017's SHACL-AF pattern — Person/Org identity succession). The three exemplars (person-with-name-change.ttl, organisation-with-merger.ttl, proprietorship-relator-multi-proprietor.ttl) are the gate test.

The depth questions we own: Q1 (Person + Organisation ICs — Guizzardi-led UFO Substance Kind commitments + IC over the hard cases that the exemplars name); Q2 (RoleMixin vs Role — the canonical UFO 2005/2015 distinction; cross-sortal vs sortal-specific); Q3 (Proprietorship as Relator — the proprietorship-relator-multi-proprietor.ttl exemplar is load-bearing); Q4 (Capacity vs Authority — two predicates not one; SKOS-typed asserted-capacity + evidenced-authority link); Q7 (`participantStatus` as Phase — S011 §8a settled it, brief confirmation that the Phase-label framing operationalises here). Gandon owns Q5 (Address from S015 — brief consumption confirmation) and Q6 (W3C Org adoption + the bespoke Kind layer for IC discipline).

What is at stake for UFO theory and for the methodology if S006 settles wrong: this is the **second domain-modelling `pattern` ODR** to discharge under A9 (S005 was first; S015 was second; S011 was third domain — enumeration vocabularies; S006 is the second domain entity-modelling pattern). If Person/Organisation ICs cannot be stated cleanly over the exemplar hard cases, downstream sessions (S007 transaction agents-on-milestones, S009 `prov:wasAssociatedWith` Agent classes, S012 DPV PII tags on Person) inherit ambiguity. The per-kind discipline must continue to operate — the methodology proves itself by applying to entity domains beyond Property.

## Per-question positions

### Q1 — Person Kind, Organisation Kind: ICs

**Guizzardi (lead, Queen).** Both Person and Organisation commit to DOLCE Endurant as UFO Substance Kinds — and they are *different* sub-cases of Endurant, which matters for the IC discipline. Per Guizzardi 2005 Ch. 4 and the UFO 2007/2011/2015 lineage:

- **`opda:Person` — UFO Substance Kind / DOLCE Endurant / PhysicalEndurant.** Person is a physical-and-biological individual — has spatial extent, biological continuity, dateOfBirth as an intrinsic Quality. DOLCE classifies this as PhysicalEndurant (matches Masolo et al. 2003 D18 §4.1 — material objects). Person is Sortal (provides counting principle — one Person per natural human), Rigid (cannot stop being a Person without ceasing to exist), supplies own IC.

- **`opda:Organisation` — UFO Substance Kind / DOLCE Endurant / NonPhysicalEndurant.** Organisation is a Searle 1995 social object — a legal-institutional entity constructed by collective acceptance + registration with an authority (Companies House for UK CRN, GLEIF for LEI). DOLCE classifies as NonPhysicalEndurant (matches D18 §4.2). Organisation is Sortal, Rigid (cannot stop being an Organisation without dissolution), supplies own IC.

**ICs over named hard cases.** The exemplar files supply the hard cases that the IC must answer over.

**Person IC = (dateOfBirth, state-issued-ID-set) tuple persistence under PROV-O succession over name-attribute changes.**

Five hard cases (matching the structure used in ODR-0005 §3a/3b/3c — five rules per IC):

1. **Name change.** A Person with deed-poll name change (`person-with-name-change.ttl` — Alex Smith → Alex Wright, deed-poll 2019) → same Person individual. IC reads (dateOfBirth, NI-number) tuple, which persists. The name attribute is a *contingent Quality* of the Person (UFO Quality — see ODR-0011 §8a Quality Value category); name-attribute changes are reified `opda:NameChangeEvent` instances per ODR-0017 SHACL-AF pattern at `sh:Info` severity.

2. **Gender recognition.** A Person obtains Gender Recognition Certificate (GRC, Gender Recognition Act 2004) → same Person individual. IC reads (dateOfBirth, NI-number) tuple, which persists. Gender attribute is a contingent Quality (analogous to name); change reified as `opda:GenderRecognitionEvent`. **Particular care**: pre-GRC gender record may carry GRA s.22 confidentiality (criminal offence to disclose post-recognition gender history without consent) — DPV co-annotation routed to ODR-0012 with `dpv:hasLawfulBasis dpv:Consent | dpv:LegalObligation` (GRA s.22 confidentiality).

3. **Death.** A Person dies → Person individual ceases to exist (Endurant ceases at temporal-extent end). The Person's `opda:dateOfDeath` Quality is set; the individual no longer participates in new Relators (cannot be Proprietor of a future estate). PROV-O records the temporal-extent end via `prov:wasInvalidatedBy` an `opda:DeathEvent` — re-instantiating the ODR-0005 §3c RegisteredTitle `prov:wasInvalidatedBy` discipline. Estate succession (probate; intestacy) is *NOT* identity succession of the Person — it is a transfer of LegalEstates and Proprietor Roles to new Person bearers (their executors / beneficiaries). The dead Person stays in the graph for historical reference (audit trail; PROV-O backbone); they no longer bear active Roles.

4. **State-ID-set element change.** A Person changes NI-number (rare — fraud prevention / witness protection) or passport-number (renewal) → same Person individual. IC reads (dateOfBirth, **set** of state-IDs) — the set is what persists, not individual elements. PROV-O succession via reified `opda:StateIDSuccessionEvent` (this is the fifth citing site of ODR-0017's SHACL-AF rule pattern — Person identity Quality succession at `sh:Info`). The fourth citing site was ODR-0011 §5a; per ODR-0001 A9 §Artefact identity test the pattern was extracted in ODR-0017 already. ODR-0006 §Rules cites `implements: [ODR-0017]`.

5. **Date-of-birth correction.** A Person's dateOfBirth was recorded incorrectly (administrative error; refugee-context unknown DOB; deed-of-correction) → same Person individual under one reading; new Person individual under a competing reading. **Default**: same individual under data-error correction, recorded via `prov:wasRevisionOf` (administrative-error class). New individual ONLY if the correction reveals the original record was about a different human (rare; fraud cases — investigated case-by-case). The IC's authoritative-source resolves to the issuing authority (HMRC for NI-number; HM Passport Office for passport; General Register Office for birth certificate).

**Authoritative source for the Person IC** (cited via `dct:source` per ODR-0004 §7a five-line precedence): HMRC NI-number issuance discipline; HM Passport Office passport renewal/replacement discipline; UK Government deed-poll registry (`gov.uk/change-name-deed-poll`); Gender Recognition Act 2004 (statute); General Register Office birth/death certificate issuance.

**Organisation IC = (registration-number, jurisdiction) tuple persistence under PROV-O succession over corporate-event changes.**

Five hard cases (matching the structure):

1. **Merger.** Two Organisations merge into a new entity (`organisation-with-merger.ttl` — Acacia Estates CRN 12345678 + Bramble Properties CRN 23456789 dissolved 2023-04-30; Acacia & Bramble CRN 34567890 incorporated 2023-05-01 by merger). → Three individuals: two predecessors (ceased at dissolution-event) + one successor (new individual). The successor `prov:wasDerivedFrom` BOTH predecessors. **NEVER** `owl:sameAs` between predecessor and successor (would propagate every triple from predecessor to successor irreversibly — inherits ODR-0005 Rule 5 anti-pattern).

2. **Demerger.** One Organisation splits into two or more new Organisations (mirrors ODR-0005 §3a rule 2 Property subdivision). Predecessor ceases at dissolution-event; each successor is a new individual with `prov:wasDerivedFrom` chain to the predecessor.

3. **Dissolution.** An Organisation is dissolved (struck off; voluntary; compulsory liquidation) → Organisation individual ceases to exist (Endurant temporal-extent end). `prov:wasInvalidatedBy` an `opda:DissolutionEvent`; the dissolved Organisation stays in the graph for historical reference; no new Relators (cannot be Proprietor of a future estate; the Land Registry will record the bona-vacantia transfer to the Crown).

4. **Re-incorporation under new CRN (rare).** An Organisation's CRN changes — Companies House administrative reissue; cross-border re-incorporation (UK → Jersey); merger-by-absorption (CRN preserved is the absorber's; absorbed-CRN ceases). → Default: new individual with `prov:wasDerivedFrom` to predecessor. **The FIBO LegalEntity / LEI pattern (Kendall S005 Q4 + Q5 precedent) applies to multi-identifier-on-one-Kind cases** — an Organisation with both UK CRN and LEI is *one* Organisation with two contingent identifiers (parallel to UPRN on Property). Re-incorporation produces multiple Kind instances, not multiple identifiers on one Kind. FIBO LEI pattern is for the within-Kind identifier-set; merger/demerger is the between-Kind succession case.

5. **Trading-name change.** An Organisation changes its trading name (no CRN change) → same individual. Trading name is a contingent Quality (UFO Quality); the change is recorded via `prov:wasRevisionOf`. This is the Organisation-side parallel to Person name-change (Q1 case 1).

**Authoritative source for the Organisation IC**: Companies House (UK CRN issuance + dissolution); GLEIF (LEI registry); FIBO LegalEntity ontology (Kendall framework — the FIBO LegalEntity is the Kind layer for the within-Kind identifier-set).

**Gandon.** Concur with the IC content. The W3C-side grounding for the identity discipline:

- **The two ICs share the structural pattern of ODR-0005 §3a/3b/3c**: a tuple-of-stable-attributes that persists under PROV-O succession over named hard cases. The pattern's general shape is now load-bearing for entity-modelling `pattern` ODRs. A future maintainer reading the methodology should be able to write the Person IC and the Organisation IC mechanically from the precedent.

- **URI architecture (ODR-0004 §Rule 2 layer-segregated naming)**: `opda:Person`, `opda:Organisation` are CamelCase Sortal-Kind nouns in the `opda:` hash namespace; their predicates (`opda:dateOfBirth`, `opda:niNumber`, `opda:ukCRN`, `opda:lei`) are lowerCamelCase. Each Kind's `rdfs:comment` carries the IC verbatim per the ODR-0005 §3a Gandon-amended discipline (artefact-encoding requirement — IC in `rdfs:comment` with `dct:source` to ODR-0006).

- **SHACL operationalisation**: `dash:uniqueValueForClass` on `opda:niNumber` for Persons (graceful degradation when absent — homeless / refugee / new-arrival cases); on `opda:ukCRN` for UK-domiciled Organisations (graceful degradation for non-UK Organisations). LEI is the universal alternative for non-UK Organisations. NEVER `owl:sameAs` across Person-NI surfaces or Organisation-CRN surfaces (inherits ODR-0005 Rule 5).

**Pair vote on Q1.**

- **Gandon vote: FOR Person + Organisation as UFO Substance Kinds + (dateOfBirth, state-ID-set) IC for Person + (registration-number, jurisdiction) IC for Organisation + PROV-O succession via ODR-0017 SHACL-AF pattern (fifth citing site).** ICs stated as `rdfs:comment` per ODR-0005 §3a artefact-encoding discipline; exemplars wired as CI regression tests per ODR-0004 §8a.
- **Guizzardi (Queen) vote: FOR same** — Person = PhysicalEndurant; Organisation = NonPhysicalEndurant; five hard cases each; PROV-O succession; the discipline matches ODR-0005's per-kind framework as the methodology requires.

---

### Q2 — RoleMixin vs Role

**Guizzardi (lead).** The UFO 2005 Ch. 4 + UFO 2015 distinction is canonical and load-bearing here. The PDTF v3 `participants[].role` enum carries values that map cleanly to the two UFO categories — and the mapping must be made, not left implicit.

**`opda:Seller` and `opda:Buyer` are UFO RoleMixins.** A RoleMixin is anti-rigid (instances cease to be Sellers when the transaction completes, without ceasing to exist as Persons or Organisations), externally founded (the founding Relator is the `opda:Transaction` — per ODR-0007 stub), and **cross-sortal** (played by either a `opda:Person` OR an `opda:Organisation`). Per Guizzardi 2005 Ch. 4 §RoleMixin: a RoleMixin's distinguishing property is that its bearers may belong to different Substance Kinds — there is no single Kind that all Sellers belong to (a Seller may be a natural person selling their home OR a corporate entity selling its premises).

**`opda:PersonSeller` and `opda:OrganisationSeller` are UFO Roles.** A Role is anti-rigid + externally founded + **sortal-specific** — every PersonSeller is a Person; every OrganisationSeller is an Organisation. The stub's `opda:Seller` RoleMixin specialises into two sortal Roles per the Kind of the bearer; the SHACL shape `opda:SellerShape` constrains role-play via the `sh:or` disjunction (per the ODR-0006 stub Turtle).

**`opda:Proprietor` is a UFO Role, NOT a RoleMixin.** A Proprietor is the legal-record discipline of being named on the Proprietorship register of a `opda:RegisteredTitle`. Per HMLR Practice Guide 24 (joint property ownership) and the title-register discipline, proprietors are natural persons OR organisations — so it *could* in principle be modelled as a RoleMixin. **But the proprietorship-relator-multi-proprietor.ttl exemplar settles it**: the canonical case is a Person-borne Proprietor. The Allemang DA push-back is anticipated here — see DA section below. Default: Role (sortal-specific to Person; organisational proprietors handled by `opda:OrganisationProprietor` sub-Role when needed, mirroring the Seller/PersonSeller/OrganisationSeller pattern).

**`opda:Conveyancer`, `opda:EstateAgent`, `opda:Surveyor`, `opda:Lender`, `opda:Insurer` — UFO Roles** (sortal-specific to Organisation, mostly; `opda:Conveyancer` may be borne by a Person who is a sole practitioner, but the typical bearer is a regulated firm). Each is founded by a different Relator: Conveyancer by the conveyancing engagement-relator; EstateAgent by the listing engagement-relator; Surveyor by the survey engagement-relator; Lender by the mortgage-relator; Insurer by the insurance-policy-relator. These will be elaborated in ODR-0007 (Transactions & Lifecycle) where the engagement-relators get formal treatment.

**The operational test for RoleMixin vs Role.** Per Guizzardi & Wagner 2010 + the UFO 2015 OntoUML profile: a class is a RoleMixin iff its bearers may belong to different Substance Kinds AND it is anti-rigid AND externally founded. If any of the three conditions fails, it is a Role (or, if rigid, a Kind). For Seller/Buyer all three hold (cross-sortal: Person OR Org; anti-rigid: Sellers stop being Sellers when transaction completes; externally founded: by the Transaction Relator). For Proprietor only sortal-specific holds *naturally* (typical case is Person), but the FIBO LegalEntity precedent suggests the methodology should admit Organisation-borne Proprietors via a sub-Role — so the default-to-Role choice is defensible.

**Gandon.** Concur with the RoleMixin/Role distinction. The W3C-side grounding:

- **The RoleMixin pattern matches the OWL design pattern for anti-rigid classes.** OWL has no native rigidity meta-property, but the convention is to annotate via `ufo:isRoleMixin true` (per the OntoUML profile's RDF translation) + use SHACL shapes to enforce the cross-sortal disjunction (the stub's `opda:SellerShape` does this).

- **Operational concern**: SHACL shapes targeting RoleMixins must use `sh:or` rather than `sh:class` constraints. The stub's `opda:SellerShape` already does this correctly: `sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] )`. This is the canonical SHACL pattern for cross-sortal role-play (per Knublauch SHACL Core §4.6).

- **The participants[].role enum from PDTF v3** maps as follows: `Buyer`, `Seller` → RoleMixins; `Estate Agent`, `Seller's Conveyancer`, `Buyer's Conveyancer`, `Prospective Buyer`, `Buyer's Agent` → Roles (most sortal-specific to Organisation; some Person-borne by sole practitioners). The SKOS scheme for `role` (per ODR-0011 §8a — Role label category) carries each enum value as a `skos:Concept` with `opda:ufoCategory` declaration (RoleMixin or Role per the framework above).

**Pair vote on Q2.**

- **Guizzardi (Queen) vote: FOR RoleMixin for Seller/Buyer + Role for Proprietor/Conveyancer/EstateAgent/Surveyor/Lender/Insurer** — canonical UFO 2005 Ch. 4 distinction; cross-sortal disjunction enforced via SHACL `sh:or`; the participants[].role enum maps cleanly. Operational, not noise.
- **Gandon vote: FOR same + SHACL operationalisation** — `sh:or`-style cross-sortal constraint for RoleMixins; `sh:class` for sortal-specific Roles. SKOS scheme inheritance from ODR-0011 §8a.

---

### Q3 — Proprietorship Relator with mediating Proprietor Roles

**Guizzardi (lead).** The proprietorship-relator-multi-proprietor.ttl exemplar is load-bearing. The exemplar has:

- One `opda:RegisteredTitle` (NK112233, freehold, joint proprietors per HMLR Practice Guide 24).
- Two `opda:Person` individuals (Sarah Holroyd + James Holroyd — joint tenants).
- Two `opda:Proprietor` Role instances (one per Person; each borrows identity from its Person bearer via `opda:rolePlayer`).
- One `opda:Proprietorship` Relator with `opda:tenancyKind "joint-tenancy"`; `opda:mediates` both Proprietor Roles; `opda:proprietorshipOf` the Title.

**The UFO Relator pattern (Guizzardi 2005 Ch. 4 + UFO 2015).** A Relator is a truthmaker for a material relation between multiple entities. It is *itself* an individual with its own identity; it mediates Role instances; the Role instances borrow identity from their bearers (per UFO's Role-bearer dependence). The Proprietorship Relator's identity is given by the tuple (RegisteredTitle, set-of-Persons, tenancyKind):

- **Joint-tenancy** vs **tenants-in-common** vs **sole-proprietorship** are three values of `opda:tenancyKind`. The first two are multi-Person cases (the Relator mediates 2 or more Proprietor Roles); the third is single-Person (the Relator mediates one Role; a degenerate-but-valid Relator). The exemplar covers joint-tenancy; tenants-in-common and sole-proprietorship are parallel cases the IC must handle.

- **The Relator's IC** = (RegisteredTitle individual, set-of-Person individuals, tenancyKind value) tuple persistence. Hard cases:

  1. **Proprietor addition.** A new joint-proprietor is added (deed of gift; transfer-of-part) → new Relator (different Persons-set); `prov:wasDerivedFrom` to predecessor.
  2. **Proprietor removal.** A joint-proprietor is removed (death; transfer-out; bankruptcy) → new Relator; predecessor ceased via `prov:wasInvalidatedBy` event.
  3. **Tenancy kind change.** Joint-tenancy converted to tenants-in-common (severance by notice; statutory severance on bankruptcy) → new Relator; predecessor ceased.
  4. **Title transfer.** The RegisteredTitle is transferred to a new proprietor-set → new Relator; the LegalEstate the title records persists per ODR-0005 §3b rule 1 (estate-transfer preserves estate identity); the Proprietorship Relator does not.
  5. **Title closure.** The RegisteredTitle is closed (merger; determination) → Relator ceased; PROV-O records the closure.

**Why Proprietor must be a Role and NEVER keyed.** Per ODR-0005 Anti-pattern §3 ("a keyed Role" — a Proprietor has no identity *qua* Proprietor). The Role borrows identity from its Person bearer; the Role-instance URI (e.g. `opda-x:proprietor-role-a`) is a graph-internal identifier for the role-borrowing relation, not a stable cross-context key. SHACL shapes on `opda:Proprietor` MUST NOT include `dash:uniqueValueForClass` constraints on any Role-identifying predicate.

**Operational consequence.** The exemplar's `opda:rolePlayer` predicate (from Role → Person) is the canonical link; the inverse `opda:plays` (from Person → Roles) is admissible as a convenience predicate but not load-bearing. SHACL shape `opda:ProprietorShape` constrains:

```turtle
opda:ProprietorShape a sh:NodeShape ;
    sh:targetClass opda:Proprietor ;
    sh:property [ sh:path opda:rolePlayer ; sh:class opda:Person ; sh:minCount 1 ; sh:maxCount 1 ] .

opda:ProprietorshipShape a sh:NodeShape ;
    sh:targetClass opda:Proprietorship ;
    sh:property [ sh:path opda:mediates ; sh:class opda:Proprietor ; sh:minCount 1 ] ;
    sh:property [ sh:path opda:proprietorshipOf ; sh:class opda:RegisteredTitle ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path opda:tenancyKind ; sh:in ("sole" "joint-tenancy" "tenants-in-common") ; sh:minCount 1 ; sh:maxCount 1 ] .
```

The exemplar passes (`sh:minCount 1` on `opda:mediates` matches two Roles; `proprietorshipOf` matches NK112233; `tenancyKind` matches "joint-tenancy").

**Gandon.** Concur. The W3C-side grounding:

- **The UFO Relator pattern maps to OWL via `ufo:isRelator true` annotation on the class** (analogous to `ufo:isKind true`, `ufo:isRoleMixin true`). The annotation is informational; SHACL shapes carry the operational discipline.

- **The Proprietorship Relator's URI** is `opda:Proprietorship` (CamelCase Sortal-equivalent — Relators are individuals with their own URIs, like Kinds but with mediating semantics rather than identity-supplying semantics).

- **PROV-O succession for Relator lifecycle**: the five hard cases above each map to a `prov:Activity` reification (transfer-of-part event; severance event; etc.). This is the consistent pattern across the programme (ODR-0005 §6a for Property/UPRN succession; ODR-0011 §5a for concept deprecation; ODR-0017 as the extracted pattern). The fifth citing site Person/Organisation succession (Q1 above); the sixth could be Proprietorship succession (Q3 here). Pattern extraction has already happened in ODR-0017; ODR-0006 cites `implements: [ODR-0017]`.

**Pair vote on Q3.**

- **Guizzardi (Queen) vote: FOR Proprietorship as UFO Relator + Proprietor as Role borrowing identity from Person bearer + IC over five hard cases + SHACL shapes per stub + no keyed Role (ODR-0005 Anti-pattern §3).**
- **Gandon vote: FOR same + the Relator's URI in the `opda:` hash namespace + PROV-O succession via ODR-0017 SHACL-AF pattern + `opda:rolePlayer` as canonical predicate.**

---

### Q4 — Capacity vs Authority

**Guizzardi (lead).** Two predicates, not one. The stub's §Capacity split is correct in shape; we make the operational detail explicit and ground it in the UFO Method/plan-code framework (ODR-0011 §8a).

**`opda:assertedCapacity` — SKOS-typed Method/plan code.** Per ODR-0011 §8a, `sellersCapacity` is classified as Method/plan code — labels for procedural methods or plans authorising an Activity. The PDTF v3 `sellersCapacity` enum carries values like "Beneficiary under Trust of Land", "Personal Representative", "Power of Attorney", "Court of Protection Deputy" — each is a procedural method by which the Seller asserts authority to convey. The SKOS scheme `opda:sellersCapacityScheme` (per ODR-0011 §1a) carries each enum value as a `skos:Concept` with `opda:ufoCategory "MethodPlanCode"`.

**`opda:evidencedAuthority` — link to evidence Activity in ODR-0009's PROV-O backbone.** When a Seller asserts capacity (e.g. "Personal Representative"), the evidenced-authority link points to the evidence Activity that establishes the authority — a Grant of Probate; a registered Power of Attorney; a Court of Protection order. The evidence is a `prov:Entity` (the document) `prov:wasAttributedTo` an authority (Probate Registry; Office of the Public Guardian; Court of Protection) via a `prov:Activity` (the issuance event). ODR-0009 owns the PROV-O backbone; ODR-0006 commits to the `opda:evidencedAuthority` predicate as the join.

**Why two predicates, not one with a status.** A single-predicate approach (e.g. `opda:capacityWithEvidence` carrying a structured value combining the capacity-claim and the evidence-link) collapses two distinct claims:

- The *assertion* (the Seller claims to be acting as Personal Representative) — present from the start of the transaction; revisable on disclosure of conflicting evidence.
- The *evidence* (the document substantiating the authority) — may be absent (asserted but not yet evidenced); may be sub-strength (informal document not meeting regulator threshold); may be revoked (e.g. POA revoked after the assertion but before the transaction completes).

The two have distinct lifecycles, distinct sources, distinct SHACL constraints. Keeping them as two predicates lets each evolve independently. The pattern matches ODR-0005 §6a UPRN-as-Quality-with-PROV-succession: the *value* (UPRN literal) and the *provenance* (succession event) are two distinct things; capacity-assertion and authority-evidence is the Q4 parallel.

**The founding grant as the missing Relator.** The stub already names this in §Capacity split: "The founding grant (probate, POA) is modelled as the missing Relator." The Grant-of-Probate Relator binds (Deceased Person, Personal-Representative Role, Probate-Registry, Grant-document) into a truthmaker for the PR-acting-on-behalf-of-Deceased material relation. This is **a deferred ODR-0006 elaboration** — the Relator is named here but not detailed; the full treatment lands in S007 (Transactions & Lifecycle — engagement-relators) or a S006a follow-on. For S006 we commit to the predicate split (assertedCapacity + evidencedAuthority) and the SKOS scheme.

**SHACL shape on the assertion+evidence pairing.** The stub already drafts this:

```turtle
opda:SellerShape a sh:NodeShape ;
    sh:targetClass opda:Seller ;
    sh:property [
        sh:path opda:assertedCapacity ;
        sh:node opda:RegulatedCapacityRequiresEvidence ;
    ] .
```

The `opda:RegulatedCapacityRequiresEvidence` shape is referenced but not defined in the stub; we propose:

```turtle
opda:RegulatedCapacityRequiresEvidence a sh:NodeShape ;
    sh:property [
        sh:path opda:evidencedAuthority ;
        sh:minCount 1 ;
        sh:severity sh:Warning ;
        sh:message "Asserted capacity {?capacity} requires evidenced authority for regulatory compliance."
    ] .
```

Severity is `sh:Warning` not `sh:Violation`: the assertion may legitimately precede the evidence (e.g. before the Grant of Probate is filed); the shape flags the gap without blocking. This matches the ODR-0017 SHACL-AF pattern severity discipline (`sh:Info` for substantive succession; `sh:Warning` for substantive gap; `sh:Violation` for normative-breaking only).

**Gandon.** Concur. The W3C-side grounding:

- **The PROV-O backbone for evidence is established in ODR-0009** (per session-001 Q6 Moreau). ODR-0006 commits to the predicate; ODR-0009 owns the PROV-O Activity reification for the evidence-issuance event. Cross-reference: `opda:evidencedAuthority` is typed `prov:Entity` (the evidence document); the document is `prov:wasGeneratedBy` an issuance Activity.

- **The SKOS scheme for `sellersCapacity`** lives in ODR-0011's enumeration vocabulary catalogue (per §8a Method/plan code category). ODR-0006 consumes the scheme via the `opda:assertedCapacity` predicate (range = `opda:SellersCapacityConcept`, a class membership constrained to the scheme).

**Pair vote on Q4.**

- **Guizzardi (Queen) vote: FOR two predicates: `opda:assertedCapacity` (SKOS-typed Method/plan code) + `opda:evidencedAuthority` (link to evidence per ODR-0009). NOT one combined predicate. NOT a status enum. The founding-grant Relator is named (Grant of Probate, POA) but detailed in S006a / S007.**
- **Gandon vote: FOR same + SHACL `opda:RegulatedCapacityRequiresEvidence` shape at `sh:Warning` severity + SKOS scheme inheritance from ODR-0011 + PROV-O backbone from ODR-0009.**

---

### Q5 — Address reuse

**Gandon (lead).** **SETTLED by ODR-0015.** Brief confirmation only — the work was done at Session 015 (2026-05-27; Reduced Council; Queen Guizzardi; DA Allemang — 5 withdrawn / 3 conceded / 1 held-as-live on Q3 class-structure).

The S005 §6b pre-commitment (`opda:hasAddress` as the join predicate) now resolves to:

- **`opda:Address` is declared in ODR-0015** as a UFO Substance Kind / DOLCE NonPhysicalEndurant with `rdfs:subClassOf vcard:Address` (per ODR-0015 §2a + §4a).
- **ODR-0006 consumes `opda:Address`** via `opda:hasAddress` on `opda:Person` (personal-contact address) and on `opda:Organisation` (registered-office address; trading address). Both consumers benefit from the `vcard:Address` superclass: a Person's contact address inherits both OPDA discipline (IC over name-change / gender-recognition / death) AND vCard consumer surface (export to vCard 4.0 RFC 6350 for CRM tooling).
- **`opda:addressVariant` for personal-contact addresses**: a Person's address is typically `addressVariant "personal-contact"` (a fourth variant beyond ODR-0015's three: "title" / "marketing" / "inspire" / "personal-contact"). ODR-0015's variant scheme is **closed** at three for property-side variants; **ODR-0006 adds a fourth variant for participant-side addresses via Author-only amendment** to ODR-0015 (recorded here as a flagged follow-up) — OR ODR-0006 introduces a new scheme `opda:participantAddressVariantScheme` for the personal/business/registered-office distinctions.

**The cleaner option (Gandon recommendation):** keep ODR-0015's scheme at three (property-side variants) + introduce a sibling scheme `opda:participantAddressVariantScheme` with values "personal-contact" / "business-contact" / "registered-office" / "trading-address". The two schemes are sister vocabularies; SHACL shape `opda:AddressShape` (per ODR-0015 §3b) admits either scheme via a `sh:or` constraint.

**Guizzardi (Queen).** Concur. Q5 is brief. The UFO grounding is unchanged — Address is a Substance Kind (per ODR-0015 §2a); the variant is a Quality particularising the instance within the Kind (per ODR-0011 §8a Quality Value category). Personal-contact addresses for participants do not change the UFO category; they introduce a new variant value in a sibling scheme.

**Pair vote on Q5.**

- **Gandon vote: FOR consume `opda:Address` from ODR-0015 + introduce `opda:participantAddressVariantScheme` as sibling SKOS scheme + `opda:hasAddress` on Person + Organisation per ODR-0015's `opda:hasAddress` pre-commitment from ODR-0005 §6b + `vcard:Address` superclass for vCard consumer surface.**
- **Guizzardi vote: FOR same** — settled by S015; brief confirmation.

---

### Q6 — W3C Org Ontology vs bespoke `opda:Organisation`

**Gandon (lead).** **Adopt W3C Org Ontology as superclass; keep bespoke `opda:Organisation` for the OPDA Kind layer IC discipline.** This is the FIBO LegalEntity / LEI registry pattern (Kendall+Davis position from session-001 Q3 + carried through S005 Q4/Q5 framing).

**The W3C Org Ontology** (Reynolds & Bouquet eds. 2014, W3C Recommendation) defines `org:Organization` and related classes (`org:FormalOrganization`, `org:OrganizationalUnit`, `org:Membership`, `org:Site`) for general-purpose organisation modelling. It is widely deployed (UK government data, BBC, schema.org alignment via `schema:Organization`).

**`opda:Organisation rdfs:subClassOf org:Organization`** — this is the load-bearing commitment. The OPDA bespoke layer:

- **Adds the IC discipline** (`(ukCRN | LEI, jurisdiction)` tuple persistence over named hard cases — Q1 above). The W3C Org Ontology does not commit to ICs; OPDA does. The OPDA layer is what makes the Substance Kind discipline work.

- **Adds OPDA-specific predicates**: `opda:ukCRN`, `opda:lei`, `opda:companyStatus`, `opda:incorporatedOn`, `opda:dissolvedOn`, `opda:tradingName`. These are domain-specific to UK property data + FIBO LegalEntity inheritance; W3C Org's vocabulary doesn't carry them.

- **Adds PROV-O succession** (merger / demerger / dissolution via reified events + ODR-0017 SHACL-AF pattern at `sh:Info`/`sh:Warning`).

**Why subclass, not replace.** The W3C Org Ontology is widely consumed; an `opda:Organisation` that *did not* subclass `org:Organization` would force every consumer to learn OPDA-specific vocabulary for what is fundamentally the standard organisational concept. Subclassing means: OPDA consumers see the IC discipline + jurisdiction-specific identifiers; W3C-Org-aware consumers see a familiar `org:Organization` they can navigate; downstream sessions (S007 transaction agents; S009 evidence-issuer organisations) inherit both surfaces.

**FOAF is ruled out** programme-wide per session-001 Q2 (FOAF overlaps Org confusingly; FOAF carries no governance discipline; FOAF's `foaf:Organization` is community-blessed but not W3C-Recommendation). The stub's §Decision already states this — adopt W3C Org or bespoke; FOAF excluded.

**`opda:Person` subclassing analysis.** A parallel question: should `opda:Person` subclass anything (`schema:Person`, `foaf:Person`)? **Default: NO**. `opda:Person` is the Kind layer for the IC discipline; `schema:Person` and `foaf:Person` are general-purpose person-attributes-and-relationships vocabularies that do not commit to an IC. Subclassing would import their open-ended attribute surface (which is mostly fine) but also their implicit conflations (e.g. `foaf:knows` carries no privacy discipline; `schema:Person` overlaps with `schema:PostalAddress` without the variant-scheme structure). **Bespoke `opda:Person` only**; no subclass; `vcard:Address` consumption for personal-contact via the address class only (per Q5).

**Guizzardi.** Concur with the W3C Org adoption + bespoke Kind layer split. The UFO grounding:

- **`opda:Organisation rdfs:subClassOf org:Organization`** is a class-hierarchy subclass relation; UFO meta-category-wise, both are Substance Kinds (`org:Organization` is implicitly a Substance Kind in the W3C Org Ontology, though Reynolds & Bouquet don't use UFO vocabulary). The subclass relation is consistent with UFO's `is-a` hierarchy among Kinds.

- **`opda:Person` standalone** is the UFO default for a domain-Kind. Adding a subclass relation to `schema:Person` or `foaf:Person` would add general-purpose attribute surface without IC discipline — net negative. The same logic applied to `opda:Property` in ODR-0005 (bespoke; no subclass to `schema:Place` or similar).

**Pair vote on Q6.**

- **Gandon (lead) vote: FOR `opda:Organisation rdfs:subClassOf org:Organization` (W3C Org Ontology adoption as superclass) + bespoke `opda:Organisation` for IC discipline + bespoke `opda:Person` (no subclass; standalone Kind layer) + FOAF excluded (session-001 Q2 carried).**
- **Guizzardi (Queen) vote: FOR same** — UFO meta-category preserved (Substance Kind); subclass relation consistent with UFO `is-a`; bespoke Person is the UFO domain-Kind default.

---

### Q7 — `participantStatus` as a UFO Phase

**Guizzardi (Queen, lead).** **SETTLED by ODR-0011 §8a.** Brief confirmation — `participantStatus` is classified as Phase label in the seven-category UFO framework (per Session 011 Q8 verdict, 4-0 typed-output verdict 2026-05-27).

**The Phase framing operationalises here as follows.** A Phase (Guizzardi 2005 Ch. 4) is an intra-Kind state through which a Substance Kind passes — distinct from a Role (which is anti-rigid and externally-founded) and from a Quality (which is a particularised property). A Phase has its own SKOS-scheme of phase-values; transitions between phases are reified as `prov:Activity` lifecycle events.

**Operational consequence for ODR-0006.** A Participant (the role-bearer in a `participants[]` entry) has a `participantStatus` value drawn from the SKOS scheme `opda:participantStatusScheme` (per ODR-0011 §1a). The scheme's members (e.g. "active", "withdrawn", "completed", "deceased") are `skos:Concept` instances with `opda:ufoCategory "PhaseLabel"`.

**Status transitions are reified `prov:Activity` lifecycle events.** When a Participant transitions from "active" to "withdrawn" (e.g. a Buyer withdraws from the chain), the transition is recorded as a `opda:ParticipantStatusTransitionEvent` reification:

```turtle
opda-x:withdrawal-event
    a opda:ParticipantStatusTransitionEvent ;
    prov:atTime "2024-09-15T14:32:00Z"^^xsd:dateTime ;
    opda:previousStatus opda:participantStatus/active ;
    opda:newStatus opda:participantStatus/withdrawn ;
    opda:appliesTo opda-x:buyer-role-instance ;
    opda:reason "Failed mortgage offer" ;
    dct:source <https://opda.uk/regulation/participant-withdrawal-reasons> .
```

This is consistent with the ODR-0017 SHACL-AF pattern at `sh:Info` severity — a status transition is informative (a real lifecycle event), not normative-breaking. The pattern citing site count is **now five** (Person/Org succession in Q1 above + Proprietorship succession in Q3 above + concept deprecation in ODR-0011 §5a + UPRN succession in ODR-0005 §6a + INSPIRE succession in ODR-0015 §4a + ParticipantStatusTransition here — multiple new sites in S006 alone). The pattern was already extracted in ODR-0017 after the fourth citing site fired; ODR-0006 cites `implements: [ODR-0017]` and re-instantiates per the canonical template.

**No new UFO-category decision needed.** Q7 is brief because S011 §8a settled it. The work here is mechanical: confirm the Phase-label framing operationalises; emit the SKOS scheme generator output per the §8a generator emission discipline (per-scheme `opda:ufoCategory` triple + dual `dct:source` to upstream Guizzardi 2005 Ch. 4 + ODR-0011).

**Gandon.** Concur. The W3C-side concern (machine-consumability per ODR-0017 §3a): the `opda:ParticipantStatusTransitionEvent` reification produces SHACL-AF rule output that LLM tooling, `odr-review` lint, and audit-trail consumers can parse mechanically (per Hellmann et al. 2017 DBpedia LLM-fallback rebuttal — natural-language status transitions in `rdfs:comment` fail; structured reified events succeed).

**Pair vote on Q7.**

- **Guizzardi (Queen) vote: FOR `participantStatus` as Phase label per ODR-0011 §8a (S011 Q8 settled) + reified `opda:ParticipantStatusTransitionEvent` lifecycle events + ODR-0017 SHACL-AF pattern at `sh:Info`.**
- **Gandon vote: FOR same** — machine-consumability discipline preserved; SKOS scheme generator emission per §8a.

---

## Cross-cutting concerns

**Thread 1: A9 per-kind discipline contract (fourth `kind: pattern` ODR to discharge).** ODR-0005 was first (Property identity crux); ODR-0015 was second (Address); ODR-0011 was third (Enumeration vocabularies). ODR-0006 is the fourth. The A9 discipline (a) UFO/DOLCE meta-category + (b) IC over named hard cases + (c) artefact realisation continues to operate. Each new `kind: pattern` ODR is now writing from a template not from first principles — the methodology has stabilised. The Q1-Q4-Q7 work in this position file produces a §Operational specifications section in ODR-0006 with subsections 2a (UFO category per class: Person + Org + Seller + Buyer + Proprietor + Proprietorship), 3a (Person IC over five hard cases), 3b (Organisation IC over five hard cases), 3c (Proprietorship Relator IC over five hard cases), 4a (capacity/authority predicate split), 7a (Phase label confirmation from ODR-0011 §8a), 8a (exemplar walkthrough across three exemplars).

**Thread 2: ODR-0017 SHACL-AF pattern fifth/sixth citing sites.** ODR-0017 was authored as Author-only follow-up to S011 after the fourth citing site fired (per S011 §Consequences spawn-rule). S006 produces MULTIPLE new citing sites in one session: Person identity succession (Q1 case 4 — state-ID-set-element change); Organisation identity succession (Q1 — merger; demerger; dissolution; re-incorporation; trading-name change); Proprietorship Relator succession (Q3 — five hard cases); Participant status transitions (Q7). Each `implements: ODR-0017` and re-instantiates the §1a template. The pattern is becoming dense; the methodology should monitor for further sub-pattern extraction (e.g. should we extract "agent-relator succession" as a sub-pattern of ODR-0017? — flagged for future session, not blocking).

**Thread 3: The SKOS-binding to OWL sub-class hierarchy discipline.** ODR-0011 §8a flagged the Substance Kind label cross-scheme consistency check: each scheme member MUST carry `skos:exactMatch` from the SKOS concept to the corresponding OWL sub-class. For ODR-0006, this applies to the `role` scheme (Role label) — each `skos:Concept` in `opda:roleScheme` carries `skos:exactMatch` to the corresponding OWL class (`opda:roleScheme/Seller skos:exactMatch opda:Seller`; `opda:roleScheme/Proprietor skos:exactMatch opda:Proprietor`). NEVER `owl:sameAs` (inherits ODR-0005 Rule 5).

**Thread 4: PII regime for Person + Organisation (ODR-0012 routing).** Person carries DPV PII tags via class-level `dpv-pd:hasPersonalDataCategory dpv-pd:Identifying` baseline. Person attributes carry variant-specific PII regimes:

- `opda:dateOfBirth` — `dpv-pd:DateOfBirth` (high-sensitivity; ICO age-of-consent considerations).
- `opda:niNumber` — `dpv-pd:NationalIdentificationNumber` (HMRC governed; restricted lawful basis).
- `opda:currentName`, `opda:formerName` — `dpv-pd:Name` (lower-sensitivity; standard contact-data lawful basis).
- Gender-recognition history — GRA s.22 confidentiality (criminal offence to disclose); `dpv:hasLawfulBasis dpv:Consent | dpv:LegalObligation`.

Organisation has a different PII regime — corporate identifying data is generally not "personal data" under GDPR Art. 4 (data about legal persons is out of scope), BUT a sole-trader Organisation may be a natural person trading as an entity (mixed regime). ODR-0012 owns the instance-level authoring; ODR-0006 commits to the class-level baseline only.

**Thread 5: The W3C alignment story (consistent with the precedents).** Q1 ICs align with FIBO LegalEntity / LEI (Kendall S005 precedent); Q2 RoleMixin/Role aligns with UFO 2005/2015 + OntoUML profile; Q3 Proprietorship Relator aligns with UFO 2005 Ch. 4 + HMLR Practice Guide 24; Q4 capacity/authority split aligns with PROV-O attribution + ODR-0011 §8a Method/plan codes; Q5 Address consumes ODR-0015 + vCard 4.0 (RFC 6350); Q6 W3C Org Ontology adoption (Reynolds & Bouquet 2014 W3C Rec); Q7 Phase confirms ODR-0011 §8a + Guizzardi 2005 Ch. 4. The verdicts cohere as a single W3C-and-foundational-ontology-grounded modelling; the artefact realisation discharges what the commitment requires; the commitment discharges what A9 requires.

---

## DA anticipation — Dean Allemang (working-ontologist push-back)

The Devil's Advocate selection criterion (ODR-0001 §Roles) requires the DA's published methodology to be genuinely opposed to the framing the proposition carries. Allemang's *Semantic Web for the Working Ontologist* (3rd ed. 2020, with Hendler + Gandon) carries multiple positions that genuinely contest the S006 framing. We anticipate three opposition lines.

### Line 1: RoleMixin/Role distinction is academic — pragmatic enterprise KGs flatten it

**Anticipated Allemang position.** "Q2's RoleMixin/Role distinction is the kind of UFO-academic over-modelling I push back against in Ch. 12 (Beyond OWL). The PDTF v3 `participants[].role` enum is a flat string; the enterprise consumer reads it and writes it; introducing a Kind layer (RoleMixin Seller; sortal Role PersonSeller / OrganisationSeller) inserts three URI types where one was sufficient. Show me a downstream consumer query that needs to discriminate RoleMixin from Role. If you cannot, this is gold-plating."

**Engagement.** Allemang is right on the minimal-modeling discipline; the question is what is minimal *here*. The flat-string approach has a fatal flaw for the OPDA programme: it cannot represent the cross-sortal disjunction (Seller is a Person OR an Organisation). A flat `opda:role "Seller"` enum on a `opda:participant` instance does not constrain the bearer to be a Person or Organisation; SHACL `sh:in` on a string enum cannot enforce the bearer-class restriction. Without RoleMixin + sortal Roles, the SHACL shape collapses to "any participant can be any role" — which is the exact defect the implicit-Property modelling produced for Property identity (ODR-0005 Context).

The Allemang withdrawal condition (Q2): "show me a downstream consumer query that needs to discriminate RoleMixin from Role." The query is **the conveyancing engagement enforcement query** — "find all Sellers in this transaction; for each, check that the bearer is either a Person (then check Person-side regulatory compliance — age-of-majority, mental capacity) or an Organisation (then check Org-side compliance — Companies House active status, regulated-profession FCA registration)." This query requires the SHACL shape that disjuncts on bearer-class — which requires the RoleMixin / Role distinction.

We expect Allemang DA withdrawal on Q2 with the query-driven condition met. Recorded verbatim: "Allemang DA withdrew on Q2; conveyancing engagement enforcement query demonstrates the bearer-class disjunction the RoleMixin / Role distinction operationalises."

### Line 2: W3C Org adoption is right-sized but Person standalone is under-modelled

**Anticipated Allemang position.** "Q6 W3C Org adoption is correct — that is the working-ontologist move. But Q6's Person-standalone-no-subclass position is one bridge too far. `schema:Person` is the most-consumed Person vocabulary on the planet (deployed by every search engine, every CRM, every contact-management tool). An `opda:Person` that does NOT subclass `schema:Person` (or at least carry `owl:equivalentClass`) cuts itself off from the working ontologist's toolbox. Why is Organisation OK to subclass but Person is not?"

**Engagement.** The asymmetry is intentional. `org:Organization` (W3C Org) is a well-governed W3C Recommendation with stable semantics and no implicit conflations; subclassing imports useful structure (memberships; sub-organisations; sites) without surprise. `schema:Person` is community-blessed (schema.org governance is consensus-driven not W3C-process) and carries open-ended attribute surface (`schema:knows`, `schema:relatedTo`, `schema:colleague`) without privacy discipline. For a public-interest property data programme with PII governance load-bearing (ODR-0012), importing `schema:Person`'s open attribute surface is net negative.

**Counter-amendment (admit if Allemang holds).** `opda:Person owl:equivalentClass schema:Person` could be added at the **instance-export profile** (per ODR-0010 overlay profile mechanism — when a consumer needs schema.org export, the profile materialises the equivalence). The Kind-layer ODR-0006 commits to bespoke `opda:Person`; the export profile (S010 territory) decides equivalence-relation export per consumer.

We expect Allemang DA withdrawal on Q6 with the export-profile carve-out. Recorded verbatim: "Allemang DA withdrew on Q6; W3C Org adoption ratified as superclass; Person-standalone in ODR-0006 with `schema:Person` equivalence routed to export profile (ODR-0010 territory) when consumer demands it."

### Line 3: Capacity/Authority split is two predicates where one suffices in practice

**Anticipated Allemang position.** "Q4's two-predicate split (`opda:assertedCapacity` + `opda:evidencedAuthority`) is the academically-correct decomposition, but enterprise property-transaction tooling tracks 'capacity with evidence' as one structured field (capacity-claim + evidence-document-reference + verification-date + verifier-identity). One predicate carrying a structured value is more pragmatic than two predicates with separate lifecycles. Show me a use case where the two lifecycles diverge in a way that the structured-value approach cannot capture."

**Engagement.** Allemang's pragmatic structured-value approach works **if** the capacity-claim and the evidence are always present together. They are not. Three distinct lifecycles emerge in real-world conveyancing:

1. **Capacity asserted before evidence.** A Seller claims "Personal Representative" capacity at the start of the transaction; the Grant of Probate is filed weeks later. The two are present together only at the end.
2. **Evidence revoked while capacity is asserted.** A POA is revoked (e.g. donor revokes; donor dies) after the Seller's assertion; the assertion may still stand in the contract but the evidence no longer substantiates it. The two diverge in their validity.
3. **Capacity-without-evidence is regulatory-sufficient in some contexts.** A trust-of-land beneficiary acting as Seller may not need a Grant of Probate (no death involved); the capacity is asserted and the SHACL `RegulatedCapacityRequiresEvidence` shape fires `sh:Warning` (not `sh:Violation`) — flagging the gap without blocking.

The two-predicate split lets each lifecycle evolve independently. The structured-value approach forces them to evolve together (or to carry implicit nulls that downstream consumers must interpret).

We expect Allemang DA withdrawal on Q4 with the lifecycle-divergence cases demonstrated. Recorded verbatim: "Allemang DA withdrew on Q4; three lifecycle-divergence cases (capacity-before-evidence, evidence-revoked-while-capacity-stands, capacity-without-evidence-regulatory-sufficient) demonstrate the two-predicate split is operationally necessary."

### Lines we expect Allemang to hold (held-as-live dissent candidates)

- **Q3 Proprietorship-as-Relator vs simpler `opda:proprietorOf` predicate.** Allemang's published methodology favours the simpler reification (Ch. 7 — RDF reification minimisation). We expect Allemang to engage; we expect to converge on Relator adoption via the multi-proprietor exemplar; if Allemang holds dissent, the named re-open trigger is "if 18 months of downstream sessions produce zero multi-proprietor cases beyond joint-tenancy, the Relator framing becomes a re-open consideration." We do not anticipate this; the exemplar is strong; but we admit the held-as-live possibility.

- **None of Q1, Q5, Q7 are expected dissent sites** — Q1 is IC discipline (Allemang concurs with the methodology); Q5 is settled by ODR-0015 (Allemang already engaged at S015); Q7 is settled by ODR-0011 §8a (Allemang did not participate at S011 substrate-mode but the SKOS Phase-label framing is unobjectionable to pragmatic-modeling discipline).

---

## References

- Guizzardi, G. (2005). *Ontological Foundations for Conceptual Modeling with Applications*. CTIT PhD Series 05-74. Ch. 4 (UFO Substance Kind, Role, RoleMixin, Phase, Relator, Mode, Quality, Quale taxonomy).
- Guizzardi, G. et al. (2015). *Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story*. Applied Ontology 10(3-4). UFO 2007/2011/2015 lineage.
- Guizzardi, G., Wagner, G. (2010). *Using the Unified Foundational Ontology (UFO) as a Foundation for General Conceptual Modeling Languages*. Theory and Applications of Ontology. (Method/plan code framework.)
- Masolo, C., Borgo, S., Gangemi, A., Guarino, N., Oltramari, A. (2003). *The WonderWeb Library of Foundational Ontologies*. D18 §4.1-4.2 (DOLCE PhysicalEndurant / NonPhysicalEndurant).
- Searle, J. (1995). *The Construction of Social Reality* (legal-institutional objects — basis for Organisation as NonPhysicalEndurant).
- Guarino, N., Welty, C. (2002, 2009). *An Overview of OntoClean* (meta-properties — Rigidity for Substance Kind; anti-Rigidity for Role/RoleMixin/Phase).
- Reynolds, D., Bouquet, P., eds. (2014). *The Organization Ontology*. W3C Recommendation. (`org:Organization` adoption.)
- Iannella, R., McKinney, J., eds. (2014). *vCard Ontology*. W3C Working Group Note. (`vcard:Address` superclass — inherited from ODR-0015 §4a.)
- Moreau, L., Missier, P., eds. (2013). *PROV-O: The PROV Ontology*. W3C Recommendation. §3 (`prov:wasDerivedFrom`, `prov:wasGeneratedBy`, `prov:wasInvalidatedBy`, `prov:wasAttributedTo`).
- Knublauch, H., Kontokostas, D., eds. (2017). *Shapes Constraint Language (SHACL)*. W3C Recommendation. §4.6 (`sh:or` cross-sortal constraint).
- Allemang, D., Hendler, J., Gandon, F. (2020). *Semantic Web for the Working Ontologist*, 3rd ed. Ch. 7 (RDF reification); Ch. 8 (Minimal modeling); Ch. 12 (Beyond OWL); Ch. 13 (FIBO and Enterprise Ontologies).
- HMLR Practice Guide 24 — *Joint property ownership* (Proprietorship register; joint-tenancy vs tenants-in-common).
- Gender Recognition Act 2004 §22 (confidentiality of gender-recognition history).
- ODR-0001 §What an ODR records (per-kind discipline) — A9 amendment landed 2026-05-27. ODR-0006 is the fourth `kind: pattern` to discharge under it.
- ODR-0004 §Rule 2 (layer-segregated naming); §3a (three-graph separation); §6a (deterministic emission); §7a (term-sourcing five-line precedence); §8a (exemplar harness).
- ODR-0005 §3a/3b/3c (IC over hard cases — the template ODR-0006 inherits); §6a (UPRN succession SHACL-AF rule precedent); §6b (Address routed to ODR-0015 with `opda:hasAddress` pre-committed); Anti-pattern §3 (never key a Role); Rule 5 (no `owl:sameAs`).
- ODR-0011 §1a/2a/4a/5a/7a/8a (SKOS scheme discipline; seven-category UFO framework; Method/plan code for `sellersCapacity`; Phase label for `participantStatus`; Role label for `role`).
- ODR-0015 §2a (Address as UFO Substance Kind / DOLCE NonPhysicalEndurant); §4a (vCard superclass + INSPIRE feature ID succession); §3b (class with property shapes); Q3 held-as-live dissent (Allemang).
- ODR-0017 (SHACL-AF non-blocking data-quality rules pattern) — fifth+ citing site in this session for Person identity succession + Organisation succession + Proprietorship Relator succession + ParticipantStatusTransition.
- Diagnostic exemplars: `source/03-standards/ontology/exemplars/person-with-name-change.ttl`, `organisation-with-merger.ttl`, `proprietorship-relator-multi-proprietor.ttl` — the three IC tests the Q1 + Q3 verdicts discharge.
- S001 Q3 transcript (Kind layer partition); S005 Q4 + Q5 (FIBO LegalEntity / LEI precedent — Kendall+Davis position); ODR-0006 stub (the proposal under deliberation).
