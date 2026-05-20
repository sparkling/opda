# Working positions — Baker · Moreau · Pandit (provenance / commons / data-governance trio)

> Independent positions for Council Session 001 (PDTF v3 → linked-data TBox).
> Three voices: **Tom Baker** (Dublin Core / terminological commons), **Luc Moreau** (PROV-O / verifiedClaims), **Harshvardhan Pandit** (DPV / personal-data governance).
> TBox only — no instance data this round. Vocabulary floor: Core + DASH + PROV-O + DPV family + ODRL; BBO excluded.

---

## Tom Baker — Dublin Core, vocabularies as a common language

### Q1 — Overall ontology strategy

**Position.** Build the OPDA ontology as a *thin layer of OPDA-specific terms over a thick base of shared vocabularies*, exactly as ODR-0002 already proposes. Do not mint an `opda:title`, `opda:created`, `opda:identifier` or `opda:Agent`. The whole value of linked data is that an OPDA transaction dereferences into terms a stranger's triplestore already understands.

**Reasoning.** This is the *Vocabularies as a Common Language* argument (DCMI). A vocabulary earns its keep not by being expressive but by being *shared* — the cost of a term is paid once by the minter and again by every consumer who must learn it. PDTF's compact skeleton has dozens of places that are plainly `dct:` shaped: `officialCopyDateTime`, `editionDate`, `registrationDate`, `creationDate`, `lodgementDate`, every `attachments` `desc`/`url`. Re-minting those isolates OPDA from the very ecosystem it wants to join.

**Vote.** In favour of the thin-layer-over-shared-base strategy.

**Challenge (to the panel).** The risk is the opposite failure: over-reaching for foundational ontology (Guizzardi/Guarino territory) before the commons layer is even nailed down. Get `dct:`/`skos:`/`prov:` right first; UFO-style identity criteria can come later if they earn their place.

### Q2 — Vocabulary tiers (Core / Conditional / Defer)

**Position.** The **strongest single argument in ODR-0002 is the one for Core-tier Dublin Core**, and it is currently under-stated. Promote it from "administrative metadata" to "the terminological commons on which every other adopted vocabulary already depends." Concretely: **DCAT is built on `dct:`** (it re-uses `dct:title`, `dct:description`, `dct:issued`, `dct:publisher`, `dct:license`); **PROV-O recommends `dct:` for descriptive metadata** on entities and agents; **SKOS concept schemes carry `dct:title`/`dct:creator`**; **VANN annotations sit beside `dct:` on the `owl:Ontology` header**. You cannot adopt the Conditional tier *without* Dublin Core — it is not one vocabulary among eight, it is the connective tissue.

**Reasoning.** Every other vocabulary in scope already has a transitive dependency on `dct:`. Adopting it explicitly merely *formalises what is already implicit* (ODR-0002's own words). That is the textbook DCMI position: the 15 elements / DCTERMS are deliberately small, stable, and domain-neutral precisely so they can be the lingua franca rather than a competing model.

**Vote.** In favour. Core tier as drafted, with Dublin Core's rationale strengthened to "commons substrate," not "admin metadata."

**Challenge.** On the "decide" vocabularies (ArchiMate, OWL-Time, DCAT, SSSOM, SEMAPV): I would **keep DCAT in Conditional** (it is pure `dct:` extension, near-zero marginal learning cost, and OPDA *will* publish reference datasets), and **demote ArchiMate and BBO to Defer** — they are enterprise-architecture and process-modelling concerns with no instance data and no consumer this round. SSSOM/SEMAPV: Conditional, but only in mapping files, never in the transaction TBox.

### Q6 — verifiedClaims → PROV-O

**Position.** Defer to Moreau on the mapping mechanics. My only contribution: whatever `prov:` structure he lands on, the *descriptive* metadata on those entities and activities (`title`, `created`/`issued`, `creator`/`publisher` of an evidence document, `format` of an attachment) should be `dct:`, not bespoke. PROV-O models the *shape* of provenance; Dublin Core labels the *things*.

**Vote.** Abstain on the mapping; in favour of `dct:` for descriptive annotation of PROV entities.

### Q3 / Q4 / Q5 / Q7 (namespacing, SHACL, classification, governance)

**Position (brief).** Namespace governance is my standing concern: one OPDA namespace, dated or versioned, with `vann:preferredNamespacePrefix` on the ontology header so dereferencers render `opda:` consistently (Q3). Property-type lists, role enums (`Seller`/`Buyer`/`Agent`/`Conveyancer`), capacity enums, `priceQualifier`, tenure — these are **SKOS concept schemes**, not OWL classes; that keeps them governable as controlled vocabularies without dragging in OWL semantics (Q5). On governance (Q7): a closed, ODR-gated catalogue is correct — new vocabulary admissions should always cost a Council session, never accrete silently.

**Vote.** In favour across Q3/Q5/Q7; abstain Q4 (SHACL severity — defer to the SHACL voices).

---

## Luc Moreau — PROV-O / PROV-DM, verifiedClaims provenance

### Q1 — Overall strategy

**Position.** Endorse the thin-layer strategy, and insist PROV-O is **Core-adjacent, not merely Conditional**, *for the verifiedClaims and milestone layers*. A property-data trust framework whose entire premise is "who asserted this, who verified it, by what process, on what evidence" is a provenance system wearing a property-data hat. PROV-O is not an optional enrichment here — it is the backbone of the assurance story.

**Reasoning.** PROV-DM's three core types — Entity, Activity, Agent — map almost one-to-one onto the verifiedClaims data shape I read in `pdtf-verified-claims.json`. Where a data model falls this cleanly into Entity/Activity/Agent, PROV-O is the right tool and reinventing it under `opda:` would be malpractice.

**Vote.** In favour; with the amendment that PROV-O is mandatory (not conditional) in the verifiedClaims and transaction-milestone layers.

### Q2 — Tiers

**Position.** Agree with ODR-0002's placement of PROV-O in Conditional **with the scope note made sharper**: PROV-O is *required* wherever a claim, verification, evidence item, or lifecycle transition is modelled, and *absent* everywhere else (the `propertyPack` descriptive leaves do not need provenance triples on every field). The "canonical URIs + local SHACL, no `owl:imports`" pattern is exactly right for PROV — importing the full PROV-O ontology with its OWL axioms would burden consumers for no gain when SHACL can enforce the local shape.

**Vote.** In favour.

### Q6 — verifiedClaims → PROV-O *(Moreau owns this)*

**Position — the canonical mapping.** The verifiedClaims structure is an **OIDC4IDA (OpenID Connect for Identity Assurance)** envelope: a `verification` block (`trust_framework: "uk_pdtf"`, `time`, `evidence[]`) plus a `claims` object keyed by JSON-pointer paths. It maps to PROV-O as follows.

1. **Claim → `prov:Entity`.** Each asserted claim (a `claims` entry — e.g. the value at JSON path `/participants/0/name`) is a `prov:Entity`. The *verified* claim — claim-plus-its-verification-bundle — is a derived `prov:Entity`. Model the OPDA class `opda:Claim rdfs:subClassOf prov:Entity`.

2. **Verification → `prov:Activity`.** The `verification` object is a `prov:Activity` (`opda:Verification rdfs:subClassOf prov:Activity`). Its `time` becomes `prov:startedAtTime` / `prov:endedAtTime` (the OIDC4IDA single `time` is the completion instant → `prov:endedAtTime`, with `prov:generatedAtTime` on the resulting verified entity).

3. **`prov:used` (evidence).** The Activity `prov:used` each evidence item. Each `evidence[]` entry is a `prov:Entity` consumed by the verification.

4. **`prov:wasAssociatedWith` (verifier as `prov:Agent`).** The `verifier.organization` (and, for vouch, the `voucher`) is a `prov:Agent` — specifically `prov:Organization` for the org, `prov:Person` for a human voucher. The Verification activity `prov:wasAssociatedWith` that agent. Model `opda:Verifier rdfs:subClassOf prov:Agent`.

5. **Evidence subtypes as `prov:Entity` subclasses.** The `evidence.type` enum `["document", "electronic_record", "vouch"]` becomes three subclasses:
   - `opda:DocumentEvidence rdfs:subClassOf prov:Entity` (carries `document_details`: type, `document_number`, `date_of_issuance`, `date_of_expiry`, `issuer`).
   - `opda:ElectronicRecordEvidence rdfs:subClassOf prov:Entity` (carries `record.source` — the authoritative register).
   - `opda:VouchEvidence rdfs:subClassOf prov:Entity` (carries `attestation` + `voucher`).

6. **`prov:wasDerivedFrom` (claim ← evidence).** The verified claim entity `prov:wasDerivedFrom` each evidence entity it rests on. This is the load-bearing edge: it makes "this name was confirmed *from* this passport" a first-class, queryable triple.

7. **`prov:wasInformedBy` (chaining).** Where one verification consumes the output of an earlier one — e.g. an AML check that relies on a prior identity verification — chain the activities with `prov:wasInformedBy`. This is how a multi-stage assurance pipeline (identity → AML → source-of-funds) is expressed without flattening it into one opaque step.

8. **`prov:hadPlan` (standardised processes).** A standardised verification procedure — UK AML / MLR 2017 customer due diligence, or a named identity-assurance profile — is a `prov:Plan`. The Verification activity is part of a `prov:Association` that `prov:hadPlan` that plan. This is exactly where the OIDC4IDA `validation_method` / `verification_method` objects land: they describe *how* the check was done, which is plan-shaped, not entity-shaped.

**Where eIDAS / OIDC4IDA does *not* map cleanly to PROV-O — be honest:**

- **`trust_framework` has no PROV equivalent.** `"uk_pdtf"` is a governance regime, not a provenance primitive. It is best a `dct:conformsTo` annotation on the verification activity, *not* forced into PROV. Pretending otherwise overloads PROV.
- **`validation_method` vs `verification_method` is a genuine OIDC4IDA distinction** (validation = is the evidence genuine; verification = does it bind to *this* person) that PROV's single `prov:Plan` blurs. PROV can record *that* a method was used; it cannot natively express the validation/verification *bifurcation*. Two sub-plans, or a `dash:`/`skos:`-typed method code, is the honest workaround — not a clean PROV idiom.
- **Cryptographic assurance does not map at all.** The `digest` (alg + base64 value), `access_token`, `expires_in` on attachments are integrity/eIDAS-envelope concerns. PROV-O has no notion of a signature or a hash. Do **not** invent `prov:` extensions for these — annotate them locally (`opda:digestAlg`, `opda:digestValue`) and leave PROV to model the activity graph.
- **Assurance *level* (the eIDAS LoA / OIDC `evidence` trust tiering)** is not a PROV concept. It belongs on the claim as a quality annotation (a SKOS-coded `opda:assuranceLevel`), not as a PROV relation.
- **`txn` (the verifier's transaction reference)** is an external-system correlation key; model it as `dct:identifier` on the activity, not a PROV term.

**Net.** PROV-O is the right TBox for the *who/what-process/from-what-evidence* skeleton — and roughly 80% of verifiedClaims maps natively. The eIDAS *envelope* (trust framework, validation/verification split, cryptographic digests, assurance level) sits *around* that skeleton and must be modelled with `dct:` + local OPDA terms, not bent into PROV.

**Vote.** In favour of the canonical PROV-O mapping above, with the five honestly-flagged non-mappings annotated rather than forced.

### Q3 / Q4 / Q5 / Q7

**Position (brief).** Provenance URIs must be stable and dereferenceable (Q3) — `prov:` canonical, OPDA subclasses under the one OPDA namespace. SHACL should enforce that every `opda:Claim` has at least one `prov:wasDerivedFrom` *or* an explicit "unverified" marker — an unprovenanced claim in a trust framework is a contradiction (Q4, `sh:Violation`). Evidence-type and verification-method enums are SKOS schemes (Q5). On Q7: I support a standing provenance-review check whenever the verifiedClaims schema changes upstream.

**Vote.** In favour Q3/Q4/Q5/Q7.

---

## Harshvardhan Pandit — DPV, personal-data governance

### Q1 — Overall strategy

**Position.** Endorse the thin-layer strategy, but register that for a transaction carrying **names, dates of birth, addresses, phone, email, identity-document numbers, personal numbers, AML results, conveyancer notes, occupier names, and seller-capacity evidence**, *data-governance is not an afterthought layer* — it is a primary concern that should shape the TBox from the start. The participants aggregate (`35-transaction-participants.md`) and the verifiedClaims evidence (passport/document numbers, `voucher.birthdate`) are dense with special-category-adjacent and high-sensitivity personal data.

**Reasoning.** DPV exists precisely because GDPR-relevant semantics (what *is* personal data, what *category*, under what jurisdiction) were being left implicit and therefore un-auditable. Leaving them implicit in OPDA would repeat the mistake DPV was built to fix.

**Vote.** In favour, with a flagged tension (see Q2).

### Q2 — DPV scope *(Pandit owns this)*

**Position — and an honest tension with the brief.** The brief says "DPV family allowed, **no instance data**." That constraint is real and it *bites DPV harder than any other vocabulary*, because much of DPV's value is realised in the ABox. I therefore split DPV adoption into two phases and recommend **Phase 1 only this round** — while stating plainly that I would *want* more.

**Phase 1 — TBox-expressible, adopt now (annotation-only):**

- **`dpv:hasPersonalData`** — used at the TBox level to *type* OPDA classes/properties as carrying personal data. e.g. `opda:Participant dpv:hasPersonalData true`-style class annotation; `opda:dateOfBirth`, `opda:email`, `opda:phone`, `opda:address` flagged as personal-data-bearing.
- **`dpv:hasPersonalDataCategory`** — attach DPV PD categories to properties *as schema-level annotations*: `dpv-pd:Name`, `dpv-pd:DateOfBirth`, `dpv-pd:Address`, `dpv-pd:EmailAddress`, `dpv-pd:TelephoneNumber`, `dpv-pd:Identifying` (for `document_number` / `personal_number`). These are statements about the *property definition*, not about any individual — fully TBox-expressible.
- **`dpv-legal:` jurisdiction tagging** — `dpv-legal-uk:` / UK-GDPR + DPA 2018 as the governing regime annotation on the relevant ontology module. Again a TBox statement: "this module models data processed under UK GDPR."
- **Sensitivity flag for AML / criminal-adjacent data** — `cautionOrConviction` (skeleton line ~2096) and AML results are special-category / Article-10-adjacent. DPV can *type* these at TBox level (`dpv:hasSpecialCategoryPersonalData` annotation on the class), which is exactly the kind of thing that must be declared once, in the model, not rediscovered per record.

**Phase 2 — deferred (requires instances or policy decisions OPDA has not made):**

- **Lawful basis** (`dpv:hasLegalBasis`, `dpv-gdpr:Consent`, `dpv-gdpr:LegitimateInterest`, contract necessity) — lawful basis is *per-processing-operation* and varies by purpose; it is an ABox/policy statement, not a TBox fact. Defer.
- **Consent records** (`dpv:hasConsent`, consent state, withdrawal) — inherently instance data. The schema *has* consent fields (`authorisationToShare`, occupier consents, `changesInTermOfLease` consents), but modelling *given* consent is Phase 2. Defer.
- **ODRL policies** — machine-readable data-sharing/usage policies (`odrl:Policy`, permissions/prohibitions/duties) are instance-level rules. The TBox can declare the *vocabulary is in scope*, but writing actual policies is deferred. Defer (consistent with ODR-0002 restricting ODRL to access-control layers and *not* governance-process modelling).
- **Processing purposes** (`dpv:hasPurpose`) — purpose is tied to operations and largely instance-shaped. A *controlled vocabulary* of candidate purposes (SKOS/`dpv:Purpose` subclasses — e.g. `opda:IdentityVerification`, `opda:AntiMoneyLaundering`, `opda:ConveyancingDueDiligence`) **is** TBox-expressible and I would allow that sliver into Phase 1; binding a purpose to an actual processing event is Phase 2.

**The tension, stated honestly (not council theatre).** I am *not fully satisfied* with annotation-only DPV. A trust framework that records identity-document numbers and AML outcomes but defers lawful-basis and consent modelling is leaving the most consequential governance semantics for "later," and "later" has a way of never arriving. My genuine preference is to bring the **lawful-basis and consent *class hierarchy*** (the TBox vocabulary, not the instances) into Phase 1 now — declaring *that* `opda:` recognises `dpv-gdpr:Consent`, `dpv:hasLegalBasis`, and the purpose taxonomy — so the slots exist the moment instance data lands. The brief's "no instance data" rule does **not** actually forbid this: defining the purpose/lawful-basis *vocabulary* is a TBox act. What it forbids is *populating* it. So I'd push the Phase-1 line slightly further than ODR-0002 implies: **adopt the DPV purpose and lawful-basis class vocabulary now (TBox), defer only the per-record assertions.** I will defer to the panel if they judge that over-reaches the round's scope, but I want the disagreement on the record.

**Vote.** In favour of Phase-1 DPV (annotation-only) as the floor; **dissent** insofar as I would extend Phase 1 to include the lawful-basis/consent/purpose *class vocabulary* (not instances), which I argue is TBox-expressible and wrongly deferred.

### Q6 — verifiedClaims → PROV-O (DPV interaction)

**Position.** Moreau's PROV mapping is correct; my addition is that the evidence entities are **saturated with personal data** and the PROV layer must carry DPV annotations. `opda:DocumentEvidence` holds `document_number`, `personal_number`, `issuer` — these are `dpv-pd:Identifying` / `dpv-pd:OfficialID`. `opda:VouchEvidence` holds `voucher.birthdate`, `voucher.name`, `voucher.occupation` — third-party personal data about the *voucher*, not the subject, which is a distinct DPV concern (a vouch processes a second person's PII). The `prov:Agent` who is a human voucher is *also* a data subject. So PROV and DPV must co-annotate the same nodes: PROV says "this entity was used to verify"; DPV says "this entity is `dpv-pd:OfficialID` about a natural person."

**Vote.** In favour, conditional on DPV co-annotation of evidence/voucher entities.

### Q3 / Q4 / Q5 / Q7

**Position (brief).** Personal-data classes need stable URIs but should be *modularised* so the PII-bearing part of the ontology is identifiable as a unit (Q3). SHACL should enforce that any property annotated `dpv:hasPersonalDataCategory` of a special category (AML, conviction) carries a sensitivity marker — a governance gate, `sh:Warning` minimum (Q4). DPV PD categories and purposes are SKOS-style schemes layered on DPV classes (Q5). On Q7: data-governance review must be a *standing* gate whenever a new personal-data-bearing field enters the schema — this is the one place silent accretion is genuinely dangerous, and it should cost a Council session every time.

**Vote.** In favour Q3/Q4/Q5; emphatically in favour Q7.

---

## Trio summary (for the Queen)

| Q | Baker | Moreau | Pandit |
|---|-------|--------|--------|
| Q1 strategy | In favour (thin layer; commons first) | In favour (PROV mandatory in claims layer) | In favour (governance is primary, not afterthought) |
| Q2 tiers / DPV scope | In favour; strengthen Dublin Core to "commons substrate"; DCAT→Conditional, ArchiMate/BBO→Defer | In favour; PROV required in verifiedClaims/milestone layers | In favour Phase-1 DPV; **dissent** — would add lawful-basis/consent/purpose *class vocab* (TBox) now |
| Q3 namespace | In favour (one ns, `vann:` header) | In favour (`prov:` canonical) | In favour (modularise PII) |
| Q4 SHACL | Abstain | In favour (`sh:Violation` for unprovenanced claim) | In favour (sensitivity gate, `sh:Warning`+) |
| Q5 classification | In favour (SKOS for enums) | In favour (SKOS evidence/method codes) | In favour (SKOS PD categories/purposes) |
| Q6 verifiedClaims→PROV-O | Abstain on mechanics; `dct:` for descriptive metadata | **Owns: canonical mapping + 5 honest non-mappings** | In favour, conditional on DPV co-annotation |
| Q7 governance | In favour (ODR-gated catalogue) | In favour (provenance-review on upstream change) | Emphatically in favour (PII fields cost a session) |

**Live disagreements for the DA (Guarino) to probe:**

1. **Pandit vs the brief** — is defining the lawful-basis/consent/purpose *class vocabulary* (without instances) a legitimate TBox act, or scope-creep past "no instance data"? Pandit says legitimate and wrongly deferred; ODR-0002 implies deferred. Genuine, recorded.
2. **Moreau's 80%** — the eIDAS envelope (trust_framework, validation/verification split, crypto digests, assurance level) does *not* map to PROV. Is annotating these with `dct:` + local terms acceptable, or does it signal PROV-O is the wrong frame for the *whole* verifiedClaims layer? Moreau says PROV is right for the skeleton; a purist could push back.
3. **Baker's DCAT/ArchiMate calls** — promoting DCAT to firm Conditional and demoting ArchiMate/BBO to Defer is a tiering change to ODR-0002, not just an endorsement.
