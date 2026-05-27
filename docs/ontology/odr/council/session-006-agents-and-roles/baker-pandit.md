# Baker + Pandit — Governance-pair position on S006

## Pair summary

ODR-0006's gate is the **Person/Organisation IC pair**, and that pair is **load-bearing PII territory** — every identifier the Person IC composes from is a `dpv-pd:OfficialID`-tagged datum under a named regulator's stewardship discipline. Our pair contributes two cross-cutting governance disciplines that the IC work and the SKOS scheme work this ODR introduces must inherit: **(Baker — DCMI Usage Board / FIBO `LegalEntity` registry)** every new SKOS scheme S006 introduces (role enrichments under evidenced-authority; participantStatus; capacity additions) names a steward per ODR-0011 §1a discipline; every external superclass adoption (W3C Org Ontology for Organisation; vCard reuse from S015 for contact addresses) carries `dct:source` resolving to the upstream Recommendation; every Person-identifier predicate cites the regulator-authority verbatim per ODR-0011 §4a; **(Pandit — DPV)** every Person-identifier predicate carries a DPV co-annotation at the **property level, not just the class level** — the Person IC tuple is composed entirely of PII-bearing predicates (NI number, passport number, dateOfBirth, name), each a distinct `dpv-pd` category with its own lawful-basis trigger. Q7's `participantStatus` Phase commitment is a DPV processing-event trigger per S011 §8a — confirmed at the S006 instance level. We concur with the panel's likely FIBO-multi-identifier IC verdict on Q1 (with the DPV co-annotation amendment), defer to formal-pair on Q2 RoleMixin and Q3 Proprietorship, agree the two-predicate Capacity/Authority split on Q4 with DPV refinement, concede Q5 to S015 closure, AGREE Q6 W3C Org adoption with DCMI superclass-discipline, and concede Q7 Phase commitment with the DPV processing-event-trigger confirmation.

## Per-question positions

### Q1 — Person Kind and Organisation Kind ICs

**Baker:** AGREE the FIBO multi-identifier IC pattern for both Kinds — distinct from the ODR-0005 Endurant pattern's spatial-material-continuity IC (which is `opda:Property`-specific), this is **identifier-tuple-with-regulator-stewardship** for natural and legal persons. The DCMI Usage Board discipline (Baker, Bechhofer, Isaac, Miles 2013 §Design choices; FIBO `LegalEntity` IC bound to ISO 17442 — Kendall et al. 2020) applied to Person: each identifier in the IC tuple cites a named regulator authority, **verbatim** per ODR-0011 §4a (regulator-governed concepts MUST cite regulator text without paraphrase — Pandit DPV-PD §Scope discipline).

The Person IC's `dct:source` is **plural** — one URI per regulator-governed identifier:

| Person-IC identifier predicate | Regulator authority | `dct:source` content |
|---|---|---|
| `opda:niNumber` | HMRC (UK Government Digital Service) | HMRC published NI-number-issuance scheme (lifecycle: letter changes; reissuance under bereavement; fraud-related re-issue) |
| `opda:passportNumber` | HM Passport Office (HMPO) | HMPO published passport scheme (lifecycle: renewal-with-new-number; emergency-replacement) |
| `opda:driverLicenceNumber` | DVLA | DVLA published driver-licence scheme (lifecycle: renewal-preserves-number for adults; address changes; fraud-related re-issue) |
| `opda:dateOfBirth` | (no regulator governs the date itself — the *evidence* is regulator-issued) | Cited via evidence — birth-certificate authority (General Register Office) |

The IC text the ODR commits to MUST cite each authority verbatim per ODR-0011 §4a. Paraphrase introduces audit-trail risk that downstream compliance audits (HMRC; ICO under SAR processing) cannot rely on.

For **Organisation**, the FIBO LEI pattern (Kendall et al. 2020) is the precedent — primary identifier is the LEI (ISO 17442), with Companies House CRN (UK domestic) as the secondary `skos:closeMatch` identifier. Both authorities cited per DCMI discipline. The organisation-with-merger exemplar's three-individuals-with-PROV-derivation pattern is the IC's correct discrimination over the entity-merger hard case (matches FIBO LEI's multi-entity dissolution-incorporation precedent).

**Pandit (decisive — DPV property-level co-annotation):** Person identity is **DPV PII territory** under GDPR. The Person IC tuple is composed entirely of PII-bearing predicates. The DPV co-annotation discipline that ODR-0012 will eventually consume MUST land **at the property level, not just the class level** — `dpv-pd:hasPersonalDataCategory` annotations attach to each identifier predicate individually, because each carries a distinct `dpv-pd` category with its own lawful-basis trigger:

| Person IC predicate | DPV class | Lawful-basis trigger |
|---|---|---|
| `opda:niNumber` | `dpv-pd:OfficialID` (national-insurance subclass) | GDPR Art. 9 (special category by association with tax/benefit data); UK GDPR public-task or contract |
| `opda:passportNumber` | `dpv-pd:OfficialID` (identity-document subclass) | UK GDPR contract (KYC/AML); identity-verification lawful basis |
| `opda:driverLicenceNumber` | `dpv-pd:OfficialID` (driver-credential subclass) | UK GDPR contract / public-task per consumer use-case |
| `opda:dateOfBirth` | `dpv-pd:DateOfBirth` | UK GDPR contract (age-verification component); always-PII |
| `opda:currentName` / `opda:formerName` | `dpv-pd:Name` (with `dpv-pd:FormerName` subclass for the deed-poll case in the person-with-name-change exemplar) | UK GDPR contract; name-change events are PII-history (GDPR Art. 5(1)(d) accuracy) |

The class-level `opda:Person dpv-pd:hasPersonalDataCategory dpv-pd:DataSubject` baseline (S015 §7a precedent for Address) is **necessary but insufficient** here — the IC tuple's *predicates each carry their own DPV category*. Property-level DPV co-annotation is the load-bearing input ODR-0012 inherits.

**PROV-O succession for identifier lifecycle** (re-instantiates ODR-0017 SHACL-AF non-blocking-data-quality-rules pattern — **potential fifth citing site**): identifier-succession events (NI-number letter change; passport renewal with new number; driver-licence re-issue) are materialised via reified `opda:IdentifierSuccessionEvent` with `prov:wasDerivedFrom` chain. The SHACL-AF rule materialises the succession-chain at `sh:Info` severity per ODR-0017 §2a. GDPR Art. 5(1)(d) accuracy requires the predecessor identifier to remain dereferenceable for retention window (HMRC: indefinite for NI; HMPO: 10y post-expiry; DVLA: 7y).

**For Organisation** — the FIBO LEI multi-identifier pattern carries, with one Pandit observation: **registered-organisation data is published-personal-data when the registered organisation is a sole-proprietor or has individual directors** (Companies House publishes director PNs and home-or-service addresses; ICO has confirmed published company-director data as personal data subject to the public-task lawful basis — same precedent as S005 §3c RegisteredTitle PII regime). ODR-0012 inherits this as a class-level conditional: `opda:Organisation` whose `opda:directorshipKind` includes a natural-person director carries the same published-PII regime as `opda:RegisteredTitle`.

**Pair vote draft on Q1:** **FOR FIBO multi-identifier IC for both Person and Organisation**, with two amendments:

- **Amendment 1 (Baker — DCMI Usage Board / ODR-0011 §4a verbatim-citation):** Person IC's `dct:source` is plural — one URI per regulator-governed identifier (HMRC NI scheme; HMPO passport scheme; DVLA driver-licence scheme; GRO birth-record scheme for dateOfBirth evidence). Organisation IC's `dct:source` cites ISO 17442 LEI + Companies House CRN scheme. Each authority cited verbatim; no paraphrase in `skos:definition` (`skos:scopeNote` for OPDA context).
- **Amendment 2 (Pandit — DPV property-level co-annotation):** Person IC predicates each carry `dpv-pd:hasPersonalDataCategory` annotation at the **property level**: NI number → `dpv-pd:OfficialID` (national-insurance); passport → `dpv-pd:OfficialID` (identity-document); driver-licence → `dpv-pd:OfficialID` (driver-credential); dateOfBirth → `dpv-pd:DateOfBirth`; name → `dpv-pd:Name` (+ `dpv-pd:FormerName` subclass for deed-poll case). PROV-O succession via reified `opda:IdentifierSuccessionEvent` + SHACL-AF rule per ODR-0017 (potential fifth citing site). Organisation: published-personal-data regime when sole-proprietor / individual-director (ICO public-task; ODR-0005 §3c precedent).

Vote: FOR Q1's FIBO multi-identifier framing + Amendments 1 + 2.

### Q2 — RoleMixin vs Role distinction

**Baker:** CONCEDE to formal-pair (Guizzardi / Guarino) on the UFO modelling. The RoleMixin-vs-Role discrimination is upstream formal-ontology authority, not DCMI stewardship territory. Our amendment is observational only: each new role-class S006 mints (Seller, Buyer, Proprietor, Conveyancer, EstateAgent, Surveyor, Lender, Insurer) becomes a SKOS concept under the `role` scheme per S011 §8a (Role label UFO category) and inherits the named-steward discipline (ODR-0011 §1a). Baker recommends the OPDA WG names a single role-scheme steward per FIBO precedent (one named expert with deputy).

**Pandit:** Ratify Baker's deferral. The DPV concern is orthogonal — Role-instances **do** carry DPV co-annotations, but only when they record processing events (a Conveyancer-role being played triggers KYC/AML processing under FCA/HMT regime; a Lender-role triggers credit-assessment processing under FCA/CRA regime; a Surveyor-role triggers professional-services processing). The Role's PII regime is a *function of the Relator it founds* (Transaction Relator → KYC processing; Mortgage Relator → credit-assessment); ODR-0012 owns the instance-level DPV authoring per founding-Relator. Routed to S007 / S009 / S012 for the instance-level work.

**Pair vote draft on Q2:** **CONCEDE — formal-pair settles the UFO RoleMixin/Role/sortal-Role layering**, with one observation:

- **Joint observation (Baker — SKOS scheme stewardship; Pandit — DPV per founding-Relator):** each role-class becomes a SKOS concept under the `role` scheme (S011 §8a Role label category); WG names a role-scheme steward per ODR-0011 §1a + FIBO precedent. Role-instance DPV co-annotations are a function of the founding-Relator's regulatory regime; routed to ODR-0012.

Vote: CONCEDE to formal-pair on Q2 + observation.

### Q3 — Proprietorship Relator

**Baker:** CONCEDE to formal-pair on the Relator modelling (UFO Relator with mediating Proprietor Role instances per the multi-proprietor exemplar). DCMI stewardship contribution: the **`tenancyKind` SKOS scheme** S006 introduces for joint-tenancy / tenants-in-common discrimination becomes a Quale-in-Region scheme per S011 §8a, with `dct:source` to HMLR Practice Guide 24 (Co-ownership) cited verbatim per ODR-0011 §4a (regulator-governed concept).

**Pandit:** Ratify Baker's deferral with the load-bearing PII observation: **Proprietor Role instances are PII-bearing when the proprietor is a natural person** (HMLR open-register publishes proprietor names; ICO public-task lawful basis applies — direct carry from S005 §3c RegisteredTitle PII regime). The Proprietorship Relator binds Proprietor Roles to a RegisteredTitle whose PII regime is already public-personal-data; the Role-instance inherits that regime when its bearer is an `opda:Person`. ODR-0012 inherits this as: `opda:Proprietor opda:rolePlayer ?p` where `?p a opda:Person` → DPV class-level co-annotation `dpv:hasLawfulBasis dpv:PublicTask` (HMLR open-register; matches S015 §7a `addressVariant "title"` variant-conditional refinement pattern).

The multi-proprietor exemplar's joint-tenancy case manifests this PII regime concretely: both Person bearers' names appear on the HMLR open register; both Proprietor Role-instances carry the public-task lawful basis.

**Pair vote draft on Q3:** **CONCEDE to formal-pair on UFO Proprietorship Relator modelling**, with two amendments:

- **Amendment 1 (Baker — `tenancyKind` SKOS scheme stewardship):** the joint-tenancy / tenants-in-common discrimination becomes a SKOS scheme (Quale-in-Region per S011 §8a); `dct:source` to HMLR Practice Guide 24 (Co-ownership) cited verbatim; WG names a scheme steward.
- **Amendment 2 (Pandit — Proprietor Role PII regime when bearer is Person):** Proprietor Role-instances with Person bearers carry HMLR-open-register public-task lawful basis (S005 §3c RegisteredTitle PII regime carries to the Role-instance via the Relator's RegisteredTitle binding). Routed to ODR-0012 for class-level DPV co-annotation pattern.

Vote: CONCEDE on UFO + Amendments 1 + 2.

### Q4 — Capacity vs Authority

**Baker:** AGREE the two-predicate split: `opda:assertedCapacity` (SKOS-typed → `sellersCapacity` scheme per S011 §8a Method/plan code category) and `opda:evidencedAuthority` (link to evidence Activity in ODR-0009). The `sellersCapacity` scheme already exists in the S011 framework; S006 adds enrichments for evidenced-authority discrimination (probate, power-of-attorney, court-order, statutory-appointment) — each new concept added with steward declaration per ODR-0011 §1a and `dct:source` to its statutory authority cited verbatim per §4a (HM Courts & Tribunals Service for court-order; HMRC for grant-of-probate; Office of the Public Guardian for power-of-attorney; Ministry of Justice for statutory-appointment). The DCMI Usage Board discipline: each enrichment is a registry entry maintained by the named scheme steward.

**Pandit (DPV amendment — load-bearing):** AGREE the two-predicate split with the DPV refinement: **`opda:evidencedAuthority` is a `prov:wasAttributedTo` link that REFERENCES the evidence Activity** (S009 territory — the evidence-collection Activity is where PROV-O attribution lives), and the DPV co-annotation on the link records the lawful-basis chain:

| `evidencedAuthority` source | Lawful basis | DPV pattern |
|---|---|---|
| Regulated profession (solicitor under SRA; conveyancer under CLC) | `dpv:PublicTask` (professional regulator); contract (client engagement) | `dpv:hasLawfulBasis dpv:PublicTask , dpv:Contract` on the attribution link |
| Statutory appointment (executor under grant-of-probate; LPA attorney under OPG registration) | `dpv:LegalObligation` (statutory authority) | `dpv:hasLawfulBasis dpv:LegalObligation` on the attribution link |
| Private grant (informal POA; transactional consent) | `dpv:Consent` (data-subject consent) | `dpv:hasLawfulBasis dpv:Consent` on the attribution link |

The DPV co-annotation on the link discriminates the regime — regulated profession is public-task; statutory appointment is legal-obligation; private grant is consent. ODR-0012 inherits this as instance-level DPV authoring per `evidencedAuthority` lawful-basis-trigger discrimination.

The evidence-Activity reference also creates an ODR-0017 citing site: the `evidencedAuthority` link's PROV-O attribution chain is materialised via SHACL-AF rule at `sh:Info` (capacity-exercise events are correct under their lawful-basis scope; the rule is informative).

**Pair vote draft on Q4:** **FOR two-predicate split (`assertedCapacity` + `evidencedAuthority`)**, with two amendments:

- **Amendment 1 (Baker — `sellersCapacity` scheme enrichments under DCMI discipline):** each new evidenced-authority concept (probate, POA, court-order, statutory-appointment) added under ODR-0011 §1a steward discipline; `dct:source` to statutory authority cited verbatim per §4a (HMCTS / HMRC / OPG / MoJ).
- **Amendment 2 (Pandit — `evidencedAuthority` as PROV attribution link with DPV lawful-basis discrimination):** `evidencedAuthority` is a `prov:wasAttributedTo` link to an evidence Activity (ODR-0009); DPV co-annotation on the link discriminates lawful basis (regulated-profession → public-task; statutory → legal-obligation; private-grant → consent). ODR-0012 owns instance-level authoring.

Vote: FOR Q4 + Amendments 1 + 2.

### Q5 — Address reuse

**Baker + Pandit:** **CONCEDE — S015 settled the question.** ODR-0015 ratified `opda:Address` as a UFO Substance Kind with `addressVariant` particularising Quality (S015 §2a) and `vcard:Address` superclass for personal-contact reuse (S015 §4a). S006's contribution is **consume**, not author: participants' contact addresses are `opda:Address` instances with `addressVariant "marketing"` (or `"title"` when registered) and `opda:identifiesSameProperty` linking to the participant's residential Property. The S015 §7a class-level DPV baseline (`opda:Address dpv-pd:hasPersonalDataCategory dpv-pd:Address`) + variant-conditional refinements carry forward as load-bearing input to ODR-0012.

**Pair vote draft on Q5:** **CONCEDE — S015 owns the Address modelling; S006 consumes** (`vcard:Address` reuse for participant contact; `opda:hasAddress` join predicate from S005 §6b carries; DPV class-level + variant-conditional refinements from S015 §7a inherit to ODR-0012).

Vote: CONCEDE on Q5.

### Q6 — W3C Org Ontology vs bespoke `opda:Organisation`

**Baker (decisive — DCMI superclass-reuse discipline):** AGREE adopt **W3C Org Ontology as superclass** for `opda:Organisation`. The DCMI Usage Board discipline (Baker, Bechhofer, Isaac, Miles 2013 §Reuse discipline; FIBO `LegalEntity` precedent of layering FIBO over external upper ontologies) is unambiguous: where an authoritative external Recommendation governs the domain, layer the OPDA class **as a sub-class with `dct:source` to the Recommendation**, rather than re-minting in isolation. FOAF is ruled out programme-wide per S001 (Q3); W3C Org Ontology Recommendation (Reynolds ed., 2014) IS the authoritative external Recommendation for Organisation modelling.

Concrete commitment:

```turtle
opda:Organisation a owl:Class ;
    rdfs:subClassOf org:Organization ;
    opda:ufoCategory "SubstanceKind" ;
    dct:source <https://www.w3.org/TR/vocab-org/> ,
               <https://www.inf.ufes.br/~gguizzardi/ufo.owl> ;
    rdfs:comment "A legal-institutional entity (UFO Substance Kind / DOLCE NonPhysicalEndurant) with identity supplied by ISO 17442 LEI + jurisdiction-specific registration number. Layered as sub-class of W3C Org Ontology Organization for cross-ontology consumer surface (Reynolds 2014)." .
```

This mirrors the S015 `opda:Address rdfs:subClassOf vcard:Address` pattern. Org Ontology consumer surface (`org:hasMember`, `org:Site`, `org:Role`) becomes available to OPDA consumers without OPDA re-minting; OPDA adds the FIBO LEI identity layer + UFO Substance Kind commitment that Org Ontology does not carry.

The Org Ontology's `org:Role` does NOT supersede S006's UFO RoleMixin/Role layering — Org Ontology Role is a thin role-association concept; OPDA's UFO Role is identity-supplying. The two layer cleanly: `opda:Seller rdfs:subClassOf org:Role` (where applicable for organisational sellers) gives the cross-ontology surface; UFO `ufo:isRole true` annotation carries the OPDA-side identity discipline.

**Pandit:** Ratify Baker. The DPV side adds one observation: Org Ontology's `org:hasMember` predicate, when bearer is `opda:Person`, carries the same property-level DPV co-annotation discipline as Q1 — the membership-link itself is PII when the member is a natural person (`dpv-pd:Membership` category; ICO published-list precedent for company directors / partnership members).

**Pair vote draft on Q6:** **FOR adopt W3C Org Ontology as superclass of `opda:Organisation`**, with two amendments:

- **Amendment 1 (Baker — DCMI superclass-reuse + `dct:source` to W3C Org Recommendation):** `opda:Organisation rdfs:subClassOf org:Organization`; `dct:source` cites W3C Org Ontology Recommendation (Reynolds 2014) per DCMI Usage Board discipline. Mirrors S015 `vcard:Address` layering pattern. UFO Substance Kind commitment + ISO 17442 LEI identity layer are OPDA-side additions.
- **Amendment 2 (Pandit — DPV co-annotation on `org:hasMember` when bearer is Person):** Org Ontology membership predicates carry property-level DPV co-annotation when the member is a natural person (`dpv-pd:Membership`); ODR-0012 owns the instance-level authoring.

Vote: FOR Q6 + Amendments 1 + 2.

### Q7 — `participantStatus` as UFO Phase

**Baker:** CONCEDE — S011 §8a settled `participantStatus` as **Phase label** UFO category. The contribution from our pair: the `participantStatus` SKOS scheme carries DCMI Usage Board stewardship discipline per ODR-0011 §1a (named steward + WG-declared update protocol). Each phase value (`active`, `withdrawn`, `replaced`, `superseded`) cites the originating regulator authority where one governs (FCA Handbook for regulated-profession status transitions; SRA for solicitor-status; CLC for conveyancer-status) per ODR-0011 §4a verbatim-citation.

**Pandit (decisive — DPV processing-event confirmation):** S011 §8a already flagged `participantStatus` as **"DPV processing-event trigger"** in the governance-sensitivity column. CONFIRMED at the S006 instance level: each `participantStatus` transition (active → withdrawn; active → replaced; active → superseded) IS a DPV processing event under UK GDPR Art. 6 — it changes the lawful basis under which the participant's PII is being processed (active = contract; withdrawn = legitimate-interest for retention; replaced = legal-obligation for audit-trail).

This makes `participantStatus` transitions **ODR-0017 citing sites** (potential): the phase-transition history materialises via SHACL-AF rule at `sh:Info` per ODR-0017 §2a (with-succession when a successor participant is named; `sh:Warning` for `withdrawn` without successor). ODR-0012 inherits this as: each `participantStatus` transition records a `dpv:hasProcessingEvent` annotation citing the lawful-basis change.

**Pair vote draft on Q7:** **CONCEDE — S011 §8a Phase label commitment carries**, with two amendments:

- **Amendment 1 (Baker — `participantStatus` scheme stewardship under ODR-0011 §1a):** named steward + WG update protocol; each value cites originating regulator authority verbatim per §4a (FCA / SRA / CLC).
- **Amendment 2 (Pandit — DPV processing-event trigger confirmation at instance level):** each `participantStatus` transition records a `dpv:hasProcessingEvent` annotation per ODR-0012; phase-transition history is materialised via SHACL-AF rule per ODR-0017 (potential additional citing site).

Vote: CONCEDE + Amendments 1 + 2.

## Replies to anticipated DA (Allemang) attacks

### Allemang on Q1 — Person IC's multi-regulator tuple is overspecified

We anticipate Allemang attacks the Person IC on operational grounds: *"the Person IC is overspecified — a single state-issued ID + dateOfBirth is the conveyancer's working discriminator; HMRC NI scheme + HMPO passport scheme + DVLA driver-licence scheme + GRO birth-record scheme is four regulators where one would do. The fast-path IC is dateOfBirth + any one state-issued ID; the rest is post-MVP refinement."*

**Our pair reply:** The multi-regulator citation IS the IC's audit-trail substance, not decoration. ICO Subject Access processing (the consumer that the S005 Q5 PII-regime analysis named) requires the data controller to identify the data subject from ANY of the identifier predicates the data subject presents — a SAR is filed citing NI number; another SAR is filed citing passport number; a third cites driver-licence. The IC text MUST tell the controller that all three (and dateOfBirth as auxiliary discriminator) constitute identifiers for the same Person individual. A single-identifier IC fails the multi-channel-SAR consumer case. The four-regulator tuple is the minimum the consumer requires, not maximum the ontology gold-plates.

### Allemang on Q4 — `evidencedAuthority` as PROV attribution link is overspecified

We anticipate Allemang attacks the `evidencedAuthority` modelling on operational grounds: *"two predicates (`assertedCapacity` enum + `evidencedAuthority` link) is fine, but routing the link as a `prov:wasAttributedTo` to an evidence Activity (S009 territory) creates a cross-module dependency the MVP doesn't need. A simple `opda:evidencedAuthority` property linking to a document URI is sufficient for value-proving."*

**Our pair reply:** The PROV attribution link is the minimum that supports the DPV lawful-basis discrimination Pandit's amendment surfaced. Without it, the lawful-basis annotation has nowhere to land — the controller cannot record "this capacity-exercise was lawful under public-task because the conveyancer is SRA-regulated" without a PROV-attributable Activity to attach the lawful basis to. The cross-module dependency is real but is satisfied by S009 being **also Phase 3a** (per the plan §S009: Claims, Evidence & Provenance, Queen Moreau, after S006). S006 + S009 sequence cleanly; the dependency is recorded in `## Consequences` as a downstream module ordering constraint, not a blocker.

### Allemang on Q6 — bespoke `opda:Organisation` is simpler

We anticipate Allemang attacks the W3C Org Ontology adoption on minimum-modelling grounds: *"adopting W3C Org as superclass adds an external dependency and consumer surface (Org Ontology `org:Site`, `org:hasMember`, `org:Role`) the MVP doesn't use. Bespoke `opda:Organisation` is simpler; we can layer Org Ontology in Phase 4 if a consumer needs it."*

**Our pair reply:** This is the inverse of the FOAF-exclusion argument (S001 Q3). The DCMI Usage Board discipline (Baker, Bechhofer, Isaac, Miles 2013 §Reuse) is unambiguous: where an authoritative external Recommendation exists for the domain, **adopt as superclass at the gate session, not retrofit later**. Retrofitting layering after consumers have minted instances against `opda:Organisation` as a root class forces every consumer to migrate; pre-committing the superclass at S006 means consumers receive Org Ontology surface automatically. The cost is zero (Org Ontology imports `rdf:`, `rdfs:`, `owl:`, `skos:`, all already in the OPDA core); the benefit is the FIBO/W3C inter-ontology cross-reference surface that Phase 4 cannot retroactively grant.

---

**Cross-references.** Our pair's Q1 amendments (multi-regulator citation for Person; LEI+CRN for Organisation; property-level DPV co-annotation) feed forward into ODR-0012 (instance-level DPV co-annotation authoring) as load-bearing input; the Person IC's PII-bearing-predicates list + Organisation IC's published-PII conditions are explicitly cited in ODR-0012's downstream inheritance. Our Q4 amendments (`evidencedAuthority` PROV attribution + lawful-basis discrimination) feed forward into ODR-0009 (Claims, Evidence & Provenance — the evidence Activity owning attribution + DPV lawful-basis annotation). Our Q6 W3C Org Ontology adoption establishes the **third citing site for the DCMI external-superclass-reuse pattern** (after vCard/INSPIRE in S015 §4a; FIBO LegalEntity precedent in foundational discussion). If S007 (Transaction Relator) produces a fourth citing site (e.g. `opda:Transaction rdfs:subClassOf fibo-fbc-pas-fpas:FinancialTransaction`), the `pattern`-extraction spawn-rule fires per ODR-0001 A9 §Artefact identity test — extract "external-Recommendation-as-superclass-with-dct:source" as a shared `pattern` ODR. Our Q1 PROV-O identifier-succession materialisation creates the **potential fifth citing site for ODR-0017** (SHACL-AF non-blocking-data-quality-rules); the rule's instantiation is mechanically deterministic given the pattern is now extracted.
