# Council Session 006 — Agents & Roles (Phase 3a gate)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0006 — Agents & Roles](../ODR-0006-agents-and-roles.md) (`kind: pattern`; A9 §Per-kind discipline (b) applies).
- **Queen / Moderator:** **Giancarlo Guizzardi** (UFO/OntoUML — Kind/RoleMixin/Role/Phase/Relator authority). Queen sits inside formal-pair with Gandon (W3C standards) per ODR-0001 §Roles.
- **Devil's Advocate:** Dean Allemang (TopQuadrant alumnus; *Working Ontologist* 3rd ed.; pragmatic ontology practitioner).
- **Panel (5 teammates + DA + Queen synthesis; Full Council with extended bounded-context pair):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | **Giancarlo Guizzardi (Queen)** + Fabien Gandon | [gandon-guizzardi.md](./session-006-agents-and-roles/gandon-guizzardi.md) |
  | enterprise-pair | Elisa Kendall + Ian Davis | [kendall-davis.md](./session-006-agents-and-roles/kendall-davis.md) |
  | governance-pair | Tom Baker + Harshvardhan Pandit | [baker-pandit.md](./session-006-agents-and-roles/baker-pandit.md) |
  | bounded-context (extended) | Eric Evans + Vaughn Vernon | [evans-vernon.md](./session-006-agents-and-roles/evans-vernon.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-006-agents-and-roles/cagle.md) |
  | da-solo | **Dean Allemang (DA)** | [allemang-da.md](./session-006-agents-and-roles/allemang-da.md) |

- **Input Documents:**
  - [ODR-0006 — Agents & Roles](../ODR-0006-agents-and-roles.md) (well-developed stub with detailed §Rules already).
  - [ODR-0001 §What an ODR records (per-kind discipline)](../ODR-0001-linked-data-council-methodology.md) + §Two-artefact discipline (DEFAULT per S011 EXPAND).
  - [ODR-0005 §Operational specifications](../ODR-0005-property-land-identity-crux.md) (3-class commitment; IC pattern; `opda:identifiesSameProperty`).
  - [ODR-0011 §8a seven-category UFO framework](../ODR-0011-enumeration-vocabularies.md) (Role label, Phase label, Method/plan code for `role`, `participantStatus`, `sellersCapacity`).
  - [ODR-0015 §6b](../ODR-0015-address-and-geography.md) (`opda:Address` declared; `opda:hasAddress` join predicate pre-committed; vCard superclass).
  - [ODR-0017](../ODR-0017-shacl-af-quality-rules-pattern.md) (SHACL-AF non-blocking-data-quality-rules pattern; S006 introduces 5th and potentially 6th citing sites).
  - Diagnostic exemplars (per ODR-0004 §8a; committed `7f46029`): [`person-with-name-change.ttl`](../../../../source/03-standards/ontology/exemplars/person-with-name-change.ttl); [`organisation-with-merger.ttl`](../../../../source/03-standards/ontology/exemplars/organisation-with-merger.ttl); [`proprietorship-relator-multi-proprietor.ttl`](../../../../source/03-standards/ontology/exemplars/proprietorship-relator-multi-proprietor.ttl).
- **`consensus-mode`:** `agent-fan-out` with **two-artefact discipline** (narrative + structured tally) per ODR-0001 §Two-artefact discipline (DEFAULT for Full + Reduced Council post-S011 EXPAND).
- **Format tier:** **Full Council.** Phase 3a gate.

## Context

ODR-0006 is the Agents & Roles module — Phase 3a gate for ODR-0007 / ODR-0008 / ODR-0009 / ODR-0012. The stub is substantially developed: Person/Org Kinds; Seller/Buyer RoleMixins; Proprietor Role + Proprietorship Relator; capacity-vs-evidenced-authority split. The session's task is to (a) pressure-test the existing rules against S005's 3-class precedent + S015's Address commitment + S011's seven-category UFO framework + ODR-0017's SHACL-AF pattern; (b) discharge A9 per-kind discipline inline at the Kind level; (c) deliver the per-question verdicts and downstream consequence catalogue.

This is the **fourth `kind: pattern` ODR to discharge under A9** (after ODR-0005, ODR-0015, ODR-0011). The methodology has stabilised — application from template, not first-principles invention.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is**. Coherent proposition; gate for 4 downstream modules; no retire/re-scope signal.

## Question-by-question verdicts

### Q1 — Person + Organisation Kind identity criteria

**Positions:**

- **Gandon+Guizzardi (Queen):** FOR Person + Org as UFO Substance Kinds / DOLCE Endurants. Person = PhysicalEndurant; IC = `(dateOfBirth, state-ID-set)` over 5 hard cases (name-change / gender-recognition / death / multi-jurisdiction-IDs / state-ID-reissuance). Organisation = NonPhysicalEndurant (Searle 1995 social object); IC = `(registration-number, jurisdiction)` over 5 hard cases (merger / demerger / dissolution / re-incorporation / cross-jurisdiction-rebinding).
- **Kendall+Davis:** FOR FIBO LegalEntity/LEI multi-identifier pattern (Kendall lead). NI primary in UK PDTF context + passport + driver's licence + others (Davis BBC `/programmes/` precedent for stable per-person identifier).
- **Baker+Pandit:** FOR + amendments — (Baker) plural `dct:source` verbatim regulator citation (HMRC NI / HMPO passport / DVLA driver's licence / GRO birth record / Companies House CRN / GLEIF LEI) per ODR-0011 §4a; (Pandit) DPV co-annotation at **property level** in addition to class level — each identifier predicate carries its own `dpv-pd` category with distinct lawful-basis trigger; PII-bearing predicates list as load-bearing input to ODR-0012.
- **Evans+Vernon (extended):** FOR Substance Kind + DDD aggregate root framing.
- **Cagle:** FOR + **SHACL-AF identifier-succession rule (fifth citing site of ODR-0017 pattern)** — `opda:PersonIdentifierSuccessionRule` materialises name-change / GRC / state-ID-reissue chains at `sh:Info`; `opda:OrganisationLEISuccessionRule` for merger lineage.
- **Allemang DA:** CONCEDE Substance Kind + FIBO pattern; light attack on Cagle's SHACL-AF rule unless named KYC consumer. **WITHDRAWAL CONDITION:** named consumer that needs the succession chain.

**Verdict:** **10-0 FOR** Person + Org as Substance Kinds with FIBO multi-identifier IC pattern. Adopted amendments:

- **Baker plural `dct:source`** for each identifier scheme citing the authoritative regulator verbatim per ODR-0011 §4a.
- **Pandit property-level DPV** on every identifier predicate (load-bearing input to ODR-0012).
- **Cagle SHACL-AF succession rule (ODR-0017 fifth citing site)** — `opda:PersonIdentifierSuccessionRule` + `opda:OrganisationLEISuccessionRule`. Named consumer = KYC pipeline traversing pre/post identifier-change records + LLM tooling per DBpedia 2017 (Hellmann et al.) heuristic-fallback rebuttal.

**Allemang DA: WITHDRAWN on Q1.** KYC consumer named; ODR-0017 citing site discipline satisfied.

### Q2 — RoleMixin vs Role (PRIMARY DA ATTACK)

**Positions:**

- **Gandon+Guizzardi:** FOR — Seller/Buyer as cross-sortal RoleMixins (played by Person OR Organisation per UFO RoleMixin definition); Proprietor/Conveyancer/EstateAgent/Surveyor/Lender/Insurer as sortal Roles (specific to Person or Org bearer-Kind). SHACL `sh:or` enforces cross-sortal disjunction per Knublauch DASH.
- **Kendall+Davis:** AGREE CONDITIONAL — Davis applies BBC `/programmes/` "consumer-query test": named consumer where RoleMixin distinction is load-bearing. **Test passes** for conveyancing-engagement enforcement query ("find all Sellers without an evidenced engagement letter" — must return Person-Sellers + Org-Sellers from the same query; under separate PersonSeller + OrgSeller classes, requires two queries `UNION`-ed).
- **Baker+Pandit:** CONCEDE to formal-pair on UFO modelling. DPV concern is orthogonal — Role-instances carry DPV co-annotations when they record processing events.
- **Evans+Vernon:** AGREE distinction — Ch. 9 "Making Implicit Concepts Explicit"; RoleMixin admits both Kinds as Sellers without forcing Kind hierarchy to know about Role.
- **Cagle:** AGREE — TBox commitment via `opda:rigidity "-R"` OntoClean annotation; SHACL `sh:or` enforces cross-sortal disjunction. SHACL `sh:targetClass opda:Seller` + `sh:property [ sh:path prov:wasAttributedTo ; sh:or ([sh:class opda:Person] [sh:class opda:Organisation]) ; sh:minCount 1 ; sh:maxCount 1 ]`.
- **Allemang DA — PRIMARY ATTACK:** AGAINST RoleMixin commitment in `## Rules` unless consumer-query evidence. **WITHDRAWAL CONDITION:** named consumer query / SHACL case where RoleMixin distinction is load-bearing.

**Verdict:** **10-0 FOR RoleMixin commitment.** Allemang DA's withdrawal condition met by the named conveyancing-engagement-enforcement query (Kendall+Davis + Cagle convergence): the query "find all Sellers without an evidenced engagement letter" returns Person-Sellers + Org-Sellers in one SHACL pass under RoleMixin; without RoleMixin, it requires two parallel queries (one per sortal class) joined with `UNION`, doubling the query surface and breaking the cross-sortal coherence the methodology requires.

**Allemang DA: WITHDRAWN on Q2.** Withdrawal condition met (named SHACL case + named consumer query for cross-sortal Seller traversal).

### Q3 — Proprietorship Relator with mediating Proprietor Roles

**Positions:**

- **Gandon+Guizzardi:** FOR UFO Relator pattern. IC = `(RegisteredTitle, Persons-set, tenancyKind)`. 5 hard cases. Proprietor Role borrows identity from Person bearer per ODR-0005 Anti-pattern §3 (never key a Role).
- **Kendall+Davis:** AGREE — FIBO `Relator` precedent for legal-institutional binding.
- **Baker+Pandit:** CONCEDE; Pandit notes Proprietor Role instances are PII-bearing when proprietor is a natural person (HMLR open-register PII regime carries from S005 §3c).
- **Evans+Vernon:** AGREE — UFO Relator pattern matches DDD Aggregate boundary for joint-tenancy invariant ("all Proprietors must consent to disposal").
- **Cagle:** AGREE + SHACL on Relator (MUST mediate ≥1 Proprietor Role) + Proprietor Role (MUST have rolePlayer); tenancyKind as Relator property (not Role property).
- **Allemang DA:** CONCEDE pattern; mild attack on URI dereferenceability — "does any consumer fetch `<opda:proprietorship/title-NK112233>` independently?". **WITHDRAWAL CONDITION:** named consumer.

**Verdict:** **10-0 FOR Proprietorship as UFO Relator** with mediated Proprietor Roles. Allemang DA's mild attack on URI dereferenceability is rebutted: HMLR's proprietorship-register entry IS dereferenceable independently of the title (HMLR's open-register API exposes proprietor data via `/proprietorship/<title-number>` endpoints); LLM tooling per DBpedia 2017 framing consumes the Relator URI to retrieve the proprietor-set.

**Allemang DA: WITHDRAWN on Q3.**

### Q4 — Capacity vs Authority (STRONG consensus FOR two-predicate split)

**Positions:**

- **Gandon+Guizzardi:** FOR two predicates — `opda:assertedCapacity` (SKOS-typed per ODR-0011 §8a Method/plan code) + `opda:evidencedAuthority` (link to evidence per ODR-0009). SHACL `RegulatedCapacityRequiresEvidence` at `sh:Warning` (gap-flag).
- **Kendall+Davis:** AGREE — two predicates.
- **Baker+Pandit:** AGREE + Pandit amendment: `evidencedAuthority` is `prov:wasAttributedTo` link with DPV lawful-basis discrimination (regulated-profession → public-task; statutory → legal-obligation; private grant → consent).
- **Evans+Vernon (LOAD-BEARING):** FOR two-predicate split as **non-negotiable bounded-context seam** between Sales (assertedCapacity on Seller) and Conveyancing (evidencedAuthority on verification Activity). Evans 2003 Ch. 14 "Maintaining Model Integrity"; Vernon 2013 Ch. 2.
- **Cagle:** AGREE — three-tier severity SHACL-AF match rule (potential sixth citing site of ODR-0017): `sh:Info` matched / `sh:Warning` mismatched / `sh:Violation` null-evidence-in-regulated-context (Conveyancing-Solicitor's-Code obligation).
- **Allemang DA:** STRONG SUPPORT — CONCEDE.

**Verdict:** **10-0 FOR two-predicate split** with bounded-context-leakage-avoidance framing (Evans+Vernon load-bearing). Adopted amendments:

- **Pandit DPV lawful-basis discrimination** on `evidencedAuthority` link (regulated-profession → public-task; statutory → legal-obligation; private grant → consent).
- **Cagle three-tier severity SHACL-AF match rule** (potential sixth citing site of ODR-0017): `opda:CapacityAuthorityMatchRule` at `sh:Info`/`sh:Warning`/`sh:Violation` per match state. **ODR-0017 sixth citing site flagged** for ODR-0017 §IC consistency check (the new use is the same individual under §5a Rule 1 — rule extension preserves identity).

### Q5 — Address reuse

**Verdict:** **10-0 CONCEDE to ODR-0015.** `opda:Address` declared in ODR-0015; ODR-0006 consumes via `opda:hasAddress` (S005 §6b + S015 Q3). For personal-contact: `vcard:Address` superclass per S015 §4a. Formal-pair recommends sibling `opda:participantAddressVariantScheme` (personal / business / registered-office) rather than extending ODR-0015's three variants — flagged as ODR-0006 §Rules amendment.

### Q6 — W3C Org Ontology vs bespoke `opda:Organisation` (MILD DA ATTACK)

**Positions:**

- **Gandon+Guizzardi:** FOR `opda:Organisation rdfs:subClassOf org:Organization` for interoperability + bespoke OPDA Kind layer for IC discipline. **`opda:Person` standalone** (no `schema:Person` subclass — schema.org's open attribute surface lacks privacy discipline; equivalence relegated to ODR-0010 export profiles).
- **Kendall+Davis:** AGREE — same pattern S015 used for `vcard:Address` superclass. FOAF ruled out programme-wide per S001.
- **Baker+Pandit:** AGREE + Baker amendment: `dct:source` to W3C Org Ontology Recommendation per DCMI discipline. **Third citing site for "external-Recommendation-as-superclass" pattern** (after S015 vcard:Address + S006 org:Organization); if S007 produces fourth, spawn `external-recommendation-superclass` pattern record.
- **Evans+Vernon:** AGREE — Org Ontology as DDD Shared Kernel; OPDA's `opda:Organisation` is Sales/Conveyancing domain's specialisation.
- **Cagle:** AGREE — `rdfs:subClassOf` NOT `owl:sameAs` (inherits ODR-0005 Anti-pattern §5).
- **Allemang DA — MILD ATTACK:** AGAINST `rdfs:subClassOf` as default; `org:Membership` apparatus is heavy and may produce empty inferred triples. **WITHDRAWAL CONDITION:** named consumer query exercising Org Ontology machinery beyond class declaration; otherwise `rdfs:subClassOf` replaced by `dct:source` reference.

**Verdict:** **9-1 FOR `opda:Organisation rdfs:subClassOf org:Organization`** with **Allemang DA held-as-live dissent on Q6** preserved.

**Allemang DA held-as-live dissent (Q6):** Verbatim — *"Adopting `rdfs:subClassOf org:Organization` imports the full Org Ontology machinery (`org:Membership`, `org:Site`, etc.) which OPDA's `opda:Organisation` may never consume. The reasoner-inferred empty membership triples will look like data-quality bugs."* Named re-open trigger: **"If 18 months of downstream sessions produce zero consumer queries exercising Org Ontology machinery beyond the class declaration, the `rdfs:subClassOf org:Organization` reduces to `dct:source <https://www.w3.org/TR/vocab-org/>` reference."**

This dissent does NOT block the verdict; it preserves a falsifiable re-open path tied to a named consumer-query absence threshold. Same shape as Allemang's S005 Q5 + S015 Q3 held-as-live dissent disciplines.

### Q7 — `participantStatus` as UFO Phase

**Verdict:** **10-0 CONCEDE to ODR-0011 §8a** (Phase label SKOS scheme). Status transitions are reified `prov:Activity` lifecycle events; Pandit confirms DPV processing-event trigger at instance level.

## Synthesis

This session ratifies ODR-0006 as the fourth `kind: pattern` ODR under A9. Five load-bearing moves:

1. **Person + Organisation as UFO Substance Kinds with FIBO multi-identifier IC pattern + plural-regulator-citation discipline + property-level DPV + Cagle SHACL-AF identifier-succession rule (ODR-0017 fifth citing site).**

2. **RoleMixin commitment for cross-sortal Seller/Buyer** + sortal Role for Proprietor/Conveyancer/etc. Allemang DA's named-consumer-query withdrawal condition met by the conveyancing-engagement-enforcement query.

3. **Proprietorship as UFO Relator** with mediated Proprietor Roles. IC over 5 hard cases. HMLR open-register API as the dereferenceability proof for Allemang DA's URI concern.

4. **Capacity vs Authority two-predicate split** as the **non-negotiable bounded-context seam** between Sales and Conveyancing (Evans+Vernon load-bearing). Cagle three-tier severity match rule potentially **sixth citing site of ODR-0017** (rule extension preserves pattern identity per ODR-0017 §IC §1).

5. **W3C Org Ontology as superclass for `opda:Organisation`** (with Allemang DA held-as-live dissent on Q6 + named 18-month re-open trigger). **`opda:Person` standalone** (no schema.org Person subclass — schema.org's privacy-discipline gap).

**Downstream consequences:**

- **ODR-0007 (Transactions & Lifecycle) UNBLOCKED.** Inherits 3-class commitment + Seller/Buyer RoleMixins + Transaction-as-Relator pattern parallel to Proprietorship-as-Relator. Lease-extension exemplar (S007 prep) demonstrates the Hendler S005 Q5 consumer-fails case manifest under the 3-class + S006 Role framework.

- **ODR-0008 (Property Descriptive Attributes) STILL DEFERRED** on S005 cardinality (Kendall+Davis S005 Q5+Q8 amendment). S006 closure does NOT release this deferral.

- **ODR-0009 (Claims, Evidence & Provenance) UNBLOCKED.** Inherits `opda:evidencedAuthority` link + `prov:wasAttributedTo` discipline + Person identifier-succession SHACL-AF rule + DPV lawful-basis discrimination.

- **ODR-0012 (Data-Governance Layer) inherits** Person identifier PII-bearing-predicates list + Organisation PII conditions (sole-trader / individual-director) + Role-instance PII annotations on processing-event Role-bearers.

- **ODR-0013 (SHACL Validation & Severity) inherits** the three-tier severity for Cagle's `opda:CapacityAuthorityMatchRule` (Q4) + the cross-sortal `sh:or` SHACL discipline for RoleMixins.

- **ODR-0017 SHACL-AF pattern citing sites now 5 (Q1 identifier-succession) potentially 6 (Q4 capacity-authority match).** Both retrofitted to `implements: [..., ODR-0017]` when SHACL Turtle lands.

**A9 pressure-test passes (fourth `kind: pattern` ODR — methodology stabilised; 4-of-4 discharge cleanly).**

## B2/B3 EXPAND — structured tally appendix (now DEFAULT per ODR-0001)

### Per-voice votes

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair, Queen) | F | F | F | F | C | F | C |
| Gandon (formal-pair) | F | F | F | F | C | F | C |
| Kendall (enterprise-pair) | F | F-cond | F | F | C | F | C |
| Davis (enterprise-pair) | F | F-cond | F | F | C | F | C |
| Baker (governance-pair) | F | F | F | F | C | F | C |
| Pandit (governance-pair) | F | F | F | F | C | F | C |
| Evans (extended) | F | F | F | F | C | F | C |
| Vernon (extended) | F | F | F | F | C | F | C |
| Cagle (shacl-solo) | F | F | F | F | C | F | C |
| Allemang (DA) | W | W | W | C | C | **H** | C |

Codes: F = FOR; F-cond = conditional FOR (consumer-query-test gating); W = withdrew; C = conceded; **H** = held-as-live.

### Per-question tally

| Q | F | A | H | W/C | Verdict |
|---|---|---|---|---|---|
| Q1 | 9 | 0 | 0 | 1 W | **10-0 FOR** Substance Kinds + FIBO multi-identifier + ODR-0017 fifth citing site |
| Q2 | 9 | 0 | 0 | 1 W | **10-0 FOR** RoleMixin/Role distinction (Allemang DA condition met by conveyancing query) |
| Q3 | 9 | 0 | 0 | 1 W | **10-0 FOR** Proprietorship as UFO Relator |
| Q4 | 9 | 0 | 0 | 1 C | **10-0 FOR** two-predicate split (bounded-context seam) |
| Q5 | 9 | 0 | 0 | 1 C | **10-0 CONCEDE** to ODR-0015 |
| Q6 | 9 | 0 | **1 H** | 0 | **9-1 FOR** `rdfs:subClassOf org:Organization` (Allemang DA held-as-live, 18-month re-open trigger) |
| Q7 | 9 | 0 | 0 | 1 C | **10-0 CONCEDE** to ODR-0011 §8a Phase label |

### Allemang DA scorecard

| Q | DA position | Withdrawal condition | Outcome |
|---|---|---|---|
| Q1 | Light attack on Cagle SHACL-AF | Named KYC consumer | **WITHDRAWN** (KYC pipeline + LLM-DBpedia named) |
| **Q2** | PRIMARY ATTACK on RoleMixin | Named consumer query/SHACL case | **WITHDRAWN** (conveyancing-engagement query named) |
| Q3 | Mild attack on URI dereferenceability | Named dereferencing consumer | **WITHDRAWN** (HMLR open-register API named) |
| Q4 | Strong support | (none) | **CONCEDED** |
| Q5 | Settled by S015 | (none) | **CONCEDED** |
| **Q6** | Mild attack on Org Ontology depth | Named consumer query exercising machinery beyond class | **HELD** (18-month re-open trigger; downgrade to `dct:source` if no consumer surfaces) |
| Q7 | Settled by S011 | (none) | **CONCEDED** |

**DA scorecard summary:** 3 WITHDRAWN + 3 CONCEDED + 1 HELD = 7 of 7 contested questions addressed. **Held dissent on Q6 preserved with named re-open trigger.**

## Track record (for adoption.md §Track Record)

- **Session 006 — ODR-0006 Agents & Roles** (Phase 3a gate). Full Council (8 runs: 1 formal-pair + 1 enterprise-pair + 1 governance-pair + 1 bounded-context-extended + 1 shacl-solo + 1 DA + 1 Queen synthesis). Two-artefact discipline (DEFAULT per ODR-0001 EXPAND from S011). Queen Guizzardi; DA Allemang (3 withdrawn / 3 conceded / **1 held-as-live on Q6**). **Fourth `kind: pattern` ODR to discharge under A9 — methodology stabilised; 4-of-4 `kind: pattern` ODRs discharge cleanly.** Q1 10-0 FOR Person/Org as Substance Kinds + FIBO multi-identifier IC + plural-regulator-citation + property-level DPV + Cagle SHACL-AF identifier-succession rule (**ODR-0017 fifth citing site**); Q2 10-0 FOR RoleMixin/Role distinction (Allemang DA withdrew on conveyancing-engagement consumer query); Q3 10-0 FOR Proprietorship as UFO Relator (Allemang DA withdrew on HMLR open-register dereferenceability); Q4 10-0 FOR two-predicate Capacity/Authority split (bounded-context seam between Sales and Conveyancing — Evans+Vernon load-bearing) + Cagle three-tier severity match rule (**ODR-0017 sixth citing site candidate**); Q5 10-0 CONCEDE to ODR-0015; Q6 **9-1 FOR `rdfs:subClassOf org:Organization`** with Allemang DA held-as-live dissent + named 18-month re-open trigger; Q7 10-0 CONCEDE to ODR-0011 §8a Phase label. **Downstream:** ODR-0007 + ODR-0009 + ODR-0012 + ODR-0013 unblocked; ODR-0008 STILL deferred on S005 cardinality. **`status: proposed` retained** per inherited ODR-0004 namespace block; `council: session-006` set; `implements: [ODR-0003, ODR-0017]` retrofit when SHACL Turtle lands.
