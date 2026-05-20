# Council Session 001 — Converting the PDTF v3 JSON Schema into an Ontology

- **Date:** 2026-05-20
- **Convened by:** OPDA semantic-modelling lead
- **Format:** ODR-0001 Linked Data Council with Devil's Advocate
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO methodology)
- **Devil's Advocate:** Nicola Guarino (ISTC-CNR — DOLCE, OntoClean, identity criteria)
- **Method:** Each panellist deliberated independently as a separate agent (a real agent-team teammate, own context window), wrote a position file, and the Queen synthesised. This transcript records genuine splits — it is **not** a unanimous ratification. Full per-expert positions are preserved in [`working/`](./working/): `allemang-hendler.md`, `kendall-davis.md`, `shacl-trio.md`, `provenance-trio.md`, `guizzardi.md`, `guarino-da.md`.

## Panel (12 expert voices across 6 teammates)

| Teammate | Experts | Lens |
|---|---|---|
| allemang-hendler | Dean Allemang; Jim Hendler | Pragmatic RDF; OWL formal semantics + web architecture |
| kendall-davis | **Elisa Kendall (Queen)**; Ian Davis | FIBO enterprise method; UK-gov publish-first |
| shacl-trio | Kurt Cagle; Fabien Gandon; Holger Knublauch | AI-RDF pragmatism; RDF-standards rigor; SHACL/DASH (owns Q5) |
| provenance-trio | Tom Baker; Luc Moreau; Harshvardhan Pandit | Dublin Core commons; PROV-O (owns Q6); DPV governance |
| guizzardi | Giancarlo Guizzardi | UFO/OntoUML foundational categories |
| guarino-da | **Nicola Guarino (DA)** | DOLCE; identity criteria; the immune system against Council theatre |

## Input documents

- `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` (37,224 lines) + `compactSkeleton.txt` (3,324-line leaf tree)
- `source/03-standards/schemas/src/schemas/v3/overlays/` — BASPI4/5, TA6/7/10 (via extensions), NTS/NTS2, CON29R/DW, LLC1, LPE1, FME1
- `source/03-standards/schemas/src/schemas/verifiedClaims/pdtf-verified-claims.json` — OIDC4IDA/eIDAS-style envelope
- `source/_content/schema/*.md` + `src/pages/schema/*.astro` — the web-app schema section (11 pages, 3,561 leaves, 15 overlays cross-referenced); `src/pages/implementation/schema-composition.astro` — overlay deep-merge rules
- ODR-0001 (methodology), ODR-0002 (vocabulary catalogue)

## Convening constraints

1. **Data model only** — TBox; no instance-data deliverable.
2. **Vocabulary floor** — Core (RDF/RDFS/OWL/XSD/SHACL/SKOS/Dublin Core/VANN) + DASH + PROV-O + data-governance (DPV family, ODRL).
3. **Excluded** — BBO (BPMN) and other non-relevant Conditional vocabularies.
4. **Output** — a set of ODRs partitioning the work, fleshed out later; an anchor ODR linking them. (See ODR-0003.)

---

## Q1 — Genuine deliberation, or mechanical translation?

**Synthesis.** Eleven of twelve hold this is genuine modelling, not Schema-to-RDF rewriting — but for four distinct reasons, each of which became a design rule:

- **Allemang:** the mechanical half (named slot → `DatatypeProperty` with `xsd:` range) should be *generated*, reserving Council cycles for the genuinely ambiguous moves (aggregate boundaries, cross-overlay synonymy, `oneOf`-as-subclass-vs-state). → **rule: generator-first.**
- **Hendler:** the deliberation is fundamentally about *which things get URIs*, because JSON Schema has slot-names, not global identifiers. → **rule: URI policy is the first deliverable.**
- **Kendall (Queen):** PDTF v3 is a *requirements artefact*, not a translation target — re-express what it implies (Participant is a role, not a class; Property ≠ OwnershipInterest ≠ TitleRegistration), don't replicate its defects.
- **Davis:** genuine but **time-box it** — most of what looks ontological is a missing URL; fix a small set of blocking conceptual defects and publish.

**Devil's Advocate (Guarino): DISAGREE.** "Data model only, no instance data" is a category error: a class *is* a unary property with an identity criterion, and an IC is unintelligible — untestable — without exemplars. A TBox whose ICs never meet an individual is a set of unfalsifiable assertions.

**Resolution.** The panel **accepted Guarino's amendment**: admit **diagnostic exemplars** — three or four non-deliverable worked cases (registered freehold house; unregistered house pre-first-registration; flat whose UPRN was split) used solely to pressure-test identity criteria. TBox/ABox remains the *deliverable* boundary, not the *thinking* boundary. Guarino withdrew.

**Verdict:** Genuine deliberation. Generator-first for the mechanical half; URI policy first; diagnostic exemplars admitted to test ICs. **11-0-1 → consensus after amendment (Guarino withdrew).**

---

## Q2 — Vocabulary set

**Core (RDF/RDFS/OWL/XSD/SHACL/SKOS/Dublin Core/VANN):** unanimous IN. Baker's amendment carried: **Dublin Core is reclassified from "administrative metadata" to "commons substrate"** — DCAT, PROV-O, SKOS and VANN all already depend transitively on `dct:`, so adopting it merely formalises the implicit. **DASH:** IN, unconditional for form-driving shapes (Knublauch). **PROV-O:** IN — Moreau's amendment carried: *mandatory* in the verifiedClaims and milestone layers, absent elsewhere (no provenance triple on every descriptive leaf).

**Genuine splits recorded:**

| Vocabulary | Split | Outcome |
|---|---|---|
| **OWL-Time** | IN: Hendler, Guizzardi, Gandon (+Guarino attacks the exclusion). Defer: Allemang, Davis, Kendall, and the SHACL trio's centre. | **ADOPT Conditional — reverses the earlier exclusion.** Decisive argument (Guizzardi/Gandon): adopting PROV-O's `prov:atTime` (an *instant*) while proprietorship, lease terms and claim-validity *intervals* go unmodelled is incoherent. Dissent (Allemang/Davis): "defer until a concrete consumer." **≈6-3, adopt.** → ODR-0014. |
| **SSSOM/SEMAPV** | Cagle pushes IN (per-leaf `baspi5Ref` *is* a mapping problem). Gandon + Knublauch defer (`dct:source` to a form-question IRI suffices for single-source internal refs; SSSOM earns its place mapping to *external* vocabularies — FIBO, INSPIRE). | **Defer; `dct:source` now, SSSOM when external mappings arrive. Cagle dissent recorded. ≈5-4.** |
| **DPV** | Pandit (owns): Phase-1 annotation-only is the floor — but **dissents**, arguing the lawful-basis/consent/purpose *class vocabulary* (not instances) is TBox-expressible and wrongly deferred. Kendall: reference-not-import. | **Phase-1 annotation adopted; Pandit's broader-TBox dissent recorded as a live question for ODR-0012.** |
| **ODRL** | Hendler: IN now. Allemang: scope-limit to data-rights. Guarino: **contradiction** — ODRL `Policy`/`Permission` bite only on *instances*, which the brief forbids; an ODRL TBox alone asserts nothing. Pandit: defer to Phase 2. | **Adopt the vocabulary in catalogue; defer authoring policies until consent/policy instances enter scope (resolves Guarino's contradiction).** |
| **DCAT** | Davis: promote to Core. Baker: firm Conditional. Others: defer. | **Conditional** (ontology-as-published-dataset + reference data). → ODR-0014. |
| **OBO RO** | Kendall: ADD for transitive part-of (flat→block→estate). Davis: reject (biology-flavoured; use `dct:isPartOf`). | **No consensus — open question, not adopted.** |
| **FOAF** | Guarino: `prov:Agent` is deliberately thin (no person/org distinction, no name structure); the participant model is FOAF/org-ontology-shaped. | **Open question for ODR-0006** (FOAF vs `prov:Agent` vs org ontology). |
| **BBO, ArchiMate** | — | **OUT / Defer**, unanimous. No process- or capability-modelling task. |

**Verdict:** Core + DASH + PROV-O (mandatory in claims/milestone layers) + DPV Phase-1 + ODRL-deferred + **OWL-Time Conditional (new)** + DCAT Conditional + SSSOM deferred. Catalogue changes captured in ODR-0014 (amends ODR-0002).

---

## Q3 — Work partition

**Synthesis — strong consensus AGAINST the by-aggregate-page partition** (option A from the convening brief and the basis of the earlier placeholder ODRs). Every panellist who addressed it rejected mirroring the JSON tree / web-app pages:

- Cagle: "that nesting is form ergonomics, not ontology — flatten it."
- Guarino: the pages were authored as documentation grouped by lifecycle + authority; that is good didactics, not ontological cohesion; **Evidence and VerifiedClaims are cross-cutting relations, not modules.**
- Guizzardi: partition by **UFO meta-category** — Substance Kinds / Roles & Phases / Relators & Claims.
- Kendall: partition by **FIBO-style ontological concern** — Agents&Roles / Property&Land / Transactions&Lifecycle / Claims&Evidence&Provenance — so reused entities (Address) are declared once.
- Gandon + Knublauch: the cut that matters operationally — **keep the OWL/RDFS class model and the SHACL shapes in separate graphs** (open-world vs closed-world must not leak).
- Davis: modules are an *editorial* convenience; **do not put them in the URLs** (flat namespace, conceptual grouping via `rdfs:isDefinedBy`).

**Resolution.** Partition by **ontological concern**, reconciling Kendall's FIBO modules with Guizzardi's Kind/Role/Relator layering; **Evidence + VerifiedClaims promoted to cross-cutting** (Guarino); **OWL graph separated from SHACL graph** (Gandon/Knublauch); **flat published namespace, modules editorial only** (Davis). **NOT by aggregate page.**

**Verdict:** Concern/UFO/FIBO partition; cross-cutting Evidence/Claims/Enums/Governance/Validation; class-graph ≠ shapes-graph. This **supersedes the by-aggregate breakdown** of the earlier placeholder stubs. **Consensus against page-partition; sub-divergence on module-vs-flat-URL resolved as editorial-modules / flat-URLs.**

---

## Q4 — The implicit Property defect (the crux)

**Diagnosis — unanimous.** Page 37's defect (UPRN in four leaf paths, address in many, INSPIRE ID, title-linked address, zero schema-level joins) is a **missing class with no identity criterion.** Restore the class.

**Two genuine fault lines:**

**(a) How many classes?**
- Kendall: one `Property` Kind + *alternative identifiers* + SHACL co-reference (the FIBO `LegalEntity`/LEI pattern).
- Allemang: two — `Property` (physical) + `LegalEstate`, related by `hasLegalEstate`.
- Hendler / Guizzardi: **distinct Kinds** — physical `Property` **and** `RegisteredTitle` (Hendler adds `LegalEstate` as a third, instantiated-on-assertion entity). One property can bear multiple titles; titles and parcels need not coincide.
- → **Convergence on a multi-class split** (physical Property distinct from the legal/registered thing). Exact cardinality (2 vs 3) deferred to the crux ODR.

**(b) What is the key — and is UPRN even a key?**
- SHACL trio (Cagle, Knublauch, Gandon): **`dash:uniqueValueForClass` on `opda:uprn` is the primary, *checkable* mechanism** — it fires a violation report and **degrades gracefully when UPRN is absent** (new-build, first-registration), which `owl:hasKey` does not. `owl:hasKey` is at most a secondary semantic annotation, valid only if UPRN is truly identifying (Gandon's caveat).
- Guizzardi: `owl:hasKey` on the rigid Kind (UPRN for Property, title number for RegisteredTitle); **never on a Role.** Cagle's challenge to him — "a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation, what does yours *do*?" — went unrebutted.
- **DA (Guarino), anchor objection — DISAGREE:** UPRN is a **contingent administrative identifier** (retired, split, merged, re-issued) — it cannot be a rigid identity criterion. Address-as-key is worse (a mode of presentation, not a bearer). The defensible move is **two endurants with explicit ICs**: a physical `Site/BuiltStructure` (IC: spatial-material continuity, *defined over demolition / subdivision / merger*) and a `LegalEstate` (IC: title-register identity) — UPRN and address demoted to scheme-scoped contingent identifiers.
- **Unanimous:** **NO `owl:sameAs`** to join the UPRN surfaces (Gandon, Hendler, Allemang all warn of irreversible inference propagation). Use the key + SHACL co-reference, or a controlled `opda:identifiesSameProperty`.

**Resolution.** Explicit Property class is **unanimous**. The operational key is **SHACL/DASH uniqueness (primary, checkable)**; `owl:hasKey` optional/secondary. Guarino's deeper objection is **not dismissed** — it sets the bar for the crux ODR (ODR-0005), which **must**: (i) commit each entity to a DOLCE category (Endurant), (ii) state an IC over the hard cases, (iii) settle UPRN's status (checkable key vs contingent identifier), all **validated against diagnostic exemplars** before downstream modules proceed. Guarino withdraws *iff* ODR-0005 meets those three conditions.

**Verdict:** Multi-class split (≥2: physical Property + legal Title/Estate); SHACL/DASH uniqueness primary; no `owl:sameAs`; **identity criteria are the gating crux** → ODR-0005, exemplar-validated. **Diagnosis 12-0; cure converges but the IC question is explicitly deferred, not closed.**

---

## Q5 — Overlays → SHACL profiles (owned by Knublauch)

**Synthesis — overlays are SHACL profiles, not classes** (unanimous on the core). Knublauch's canonical mapping:

1. **required-array union → `sh:minCount 1`** property shapes — purely additive on graph union.
2. **enum union → a single merged `sh:in`** — *documented as a build-step profile-composition rule, not an OWL entailment* (Gandon's insistence): you replace the `sh:in` node with the union list; you do **not** stack two `sh:in` (that is conjunction = intersection, the opposite of intent). "Loaded profile = active vocabulary."
3. **`oneOf` → `sh:xone`** (faithful exactly-one), with `sh:qualifiedValueShape` on the discriminator (`role`/`sellersCapacity`); `sh:or` only for "at least one."
4. **per-leaf `baspi5Ref`/`ntsRef` → `dct:source`** to a minted form-question IRI (`…/forms/baspi5#B1.3.2`) by default; SSSOM records *if* later admitted (Cagle's contested push).
5. **DASH for rendering** — `dash:propertyRole`/`viewer`/`editor`, `sh:order`/`sh:group` reproduce the form. Loading BASPI5 yields a graph that both validates a transaction *and* generates the BASPI form with full `dct:source` traceability — the canonical round-trip.

**Recorded disputes:**
- **Cagle vs Knublauch+Gandon** on `opda:aiHint`: Cagle wants advisory LLM-consumer annotations *inline* in the shapes graph; Knublauch refuses any invented term that could masquerade as a SHACL constraint; Gandon agrees. **Resolution: advisory annotations go in a *separate annotation graph* keyed to shape IRIs** (consistent with the Q3 class/shapes/annotation separation). Knublauch/Gandon prevail; **Cagle dissent recorded (~7-2).**
- **DA (Guarino) — DISAGREE:** "loaded profile = active requirement" promotes a build-config artefact to ontological status; `sh:minCount 1` becomes a function of which files a build call passed, with no fixed model theory (overlay order even affects `oneOf`). **Withdraws iff** conditionality is **reified** as a first-class `opda:ValidationContext`/profile node — "required under the Conveyancer profile" is a coherent proposition; "required (depending)" is not.
- Guizzardi's gate: **no overlay may declare or override a Kind's identity/key.**

**Resolution.** Overlays = named, dereferenceable SHACL profile graphs over a fixed TBox; **profile reified as `opda:ValidationContext`** (Guarino's fix accepted); composition is a documented build-step graph-union (Gandon/Knublauch); `dct:source` traceability; no-identity-override gate (Guizzardi); advisory annotations in a separate graph. → ODR-0010.

**Verdict:** Profiles confirmed; ValidationContext reified; aiHint exiled to annotation graph. **Core 12-0; aiHint ~7-2; Guarino withdrew on the reification amendment.**

---

## Q6 — verifiedClaims → PROV-O (owned by Moreau)

**Synthesis — PROV-O is the right backbone** (unanimous), and the highest-leverage piece of the conversion (Kendall, Davis). Moreau's mapping: Claim→`prov:Entity`; Verification→`prov:Activity` (`prov:endedAtTime`); `prov:used` evidence; `prov:wasAssociatedWith` verifier-as-`prov:Agent`; evidence types `document`/`electronic_record`/`vouch`→`prov:Entity` subclasses; `prov:wasDerivedFrom` (claim←evidence); `prov:wasInformedBy` (identity→AML→source-of-funds chaining); `prov:hadPlan` (MLR-2017 CDD procedures). Gandon's amendment: use **qualified forms** (`prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole`) so `validation_method`/`verification_method` aren't lost to binary shortcuts. Knublauch's: **SHACL over the PROV structure** so provenance is itself validated (the `if/then`-on-evidence-type → `sh:xone`). Pandit's: **DPV co-annotation** — evidence entities are saturated with PII (`document_number` = `dpv-pd:OfficialID`; a voucher is itself a data subject).

**DA (Guarino) — DISAGREE:** PROV-O answers "who derived what from what"; it has **no** vocabulary for the validation/verification distinction, assurance level, or jurisdiction-bound claim certainty. Forcing eIDAS onto PROV-O alone flattens evidential weight into a causal trace.

**Notable convergence:** Moreau's own analysis independently reaches the same boundary — **~80% of verifiedClaims maps natively; five things do not** and must be modelled *around* PROV, not *into* it: `trust_framework`→`dct:conformsTo`; validation-vs-verification split→two sub-plans or SKOS method codes; cryptographic `digest`→local `opda:` terms (PROV has no signature notion); assurance level→SKOS `opda:assuranceLevel`; `txn`→`dct:identifier`.

**Resolution.** PROV-O for the derivation backbone **plus a dedicated assurance/evidence-weight layer** (`opda:assuranceLevel` SKOS + `dct:` + local terms) for the eIDAS envelope; qualified forms; SHACL-over-PROV; DPV co-annotation. Guarino's withdrawal condition is **met by Moreau's own design** — Guarino withdrew. → ODR-0009.

**Verdict:** PROV-O backbone + separate assurance layer. **12-0 on the backbone; Guarino's purist objection resolved by the assurance-layer separation (withdrawn).**

---

## Q7 — Order of work and MVP

**Synthesis.** Strong consensus on three things:

- **URI/namespace policy is the first deliverable** (Hendler's "Round 0"; Kendall's Phase 1; Davis's day-14 publish; Baker's `vann:` header; Guizzardi's layer-segregated naming; Gandon's "don't ship URIs you don't serve"). Single `opda:` **hash** namespace (Cagle/Gandon/Knublauch, 9-0), `sh:prefixes` node for SHACL-SPARQL (Knublauch).
- **The identity crux gates everything** — nothing downstream is sound until Property's IC is settled (Guarino, Allemang).
- **Spike-then-scale, not a 15-ODR programme up front** (Guarino's strongest Q7 point, echoed by Davis's publish-first and Allemang's "MVP = the referring layer"). Prove one **BASPI5 vertical slice** end-to-end — it stresses the hard constructs (`sh:xone`, `sellersCapacity`, DASH editors, `dct:source`); if it round-trips (JSON → profile → rendered form + validated provenance), the remaining overlays are largely mechanical (Cagle, Knublauch).

**Recorded sequence dispute:** Cagle (BASPI-first) vs Gandon (PROV-O claims *before* the full profile build, because provenance is foundational to a *trust* framework and higher integrity-risk than a form overlay). **≈7-2.** Resolution: the MVP includes *both* a first PROV-O claims slice *and* the BASPI5 profile; Gandon's ordering applies within the MVP (provenance backbone lands before profile scale-out).

**Verdict — MVP = Foundation (URI policy) → Property identity crux (exemplar-gated) → [Agents&Roles + PROV-O claims/assurance] → one BASPI5 SHACL profile.** Everything else scales after the crux survives contact with the exemplars. **Consensus on spike-then-scale; intra-MVP ordering ≈7-2 (PROV-O before profile scale-out).**

---

## Synthesis & output

**Headline reversals from the convening brief / earlier placeholder:**

1. **Partition is by ontological concern, NOT by aggregate page** (Q3) — the earlier by-page ODR stubs are superseded.
2. **OWL-Time is adopted (Conditional)** despite the brief's exclusion (Q2) — the PROV-O-instant-vs-needed-intervals incoherence argument carried.
3. **The Property identity criterion is an unresolved crux, not a settled 2-class verdict** (Q4) — it gates the programme and must be exemplar-validated.
4. **Diagnostic exemplars are admitted** (Q1) — the TBox/ABox split is a deliverable boundary, not a thinking boundary.
5. **Profiles are reified as `opda:ValidationContext`** (Q5); **PROV-O gets a separate assurance layer** (Q6).

**Devil's Advocate scorecard:** Guarino voted DISAGREE on all seven with named withdrawal conditions. Withdrawn on Q1 (exemplars admitted), Q5 (ValidationContext reified), Q6 (assurance layer separated). **Held / deferred-to-crux** on Q4 (the IC condition is now ODR-0005's gating requirement). Q2 (ODRL contradiction → policies deferred; OWL-Time exclusion → reversed) and Q3 (Evidence/Claims → cross-cutting) substantially conceded by the panel. Q7 spike-then-scale adopted. This is the DA functioning as designed — six of seven objections converted into amendments that strengthened the proposal.

**Output ODRs** (anchor + work breakdown — see ODR-0003):

| ODR | Title | Phase |
|---|---|---|
| 0003 | **PDTF → Ontology: programme & work breakdown** (anchor) | — |
| 0004 | Foundation — URI/namespace, ontology header, graph separation, generator + exemplar policy | Spike (gate) |
| 0005 | **Property & Land identity crux** — classes, Endurant commitment, ICs over hard cases, key mechanism | Spike (gate) |
| 0006 | Agents & Roles — Person/Org Kinds, Seller/Buyer RoleMixins, Proprietor Role + Proprietorship Relator | Module |
| 0007 | Transactions & Lifecycle — Transaction relator, milestones, status, OWL-Time intervals | Module |
| 0008 | Property descriptive attributes — built form, condition, valuation, EPC, utilities, searches, encumbrances | Module |
| 0009 | Claims, Evidence & Provenance — PROV-O backbone + assurance layer | Cross-cutting |
| 0010 | Overlay Profile Mechanism — SHACL profiles, ValidationContext, dct:source traceability | Cross-cutting |
| 0011 | Enumeration Vocabularies — JSON enums → SKOS concept schemes | Cross-cutting |
| 0012 | Data-Governance Layer — DPV Phase-1 (+ Pandit's recorded dissent), ODRL deferred | Cross-cutting |
| 0013 | SHACL Validation & Severity — constraint mapping, severity tiering, DASH UI, annotation-graph split | Cross-cutting |
| 0014 | Vocabulary catalogue amendments (amends ODR-0002) — OWL-Time IN, DCAT Conditional, SSSOM deferred | Amendment |

Each ODR is a **planning stub to be fleshed out in its own follow-up Council session.** ODR-0005 must clear its exemplar gate before the module ODRs (0006–0008) are drafted in anger.
