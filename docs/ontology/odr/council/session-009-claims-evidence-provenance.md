# Council Session 009 — Claims, Evidence & Provenance (Phase 4 lead)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0009 — Claims, Evidence & Provenance](../ODR-0009-claims-evidence-provenance.md) (`kind: pattern`).
- **Queen:** **Luc Moreau** (PROV-O editor; W3C Recommendation 2013; extended panel).
- **Devil's Advocate:** Nicola Guarino (PROV-O ≠ assurance — holds his S001 Q6 line).
- **Panel (4 teammates + DA + Queen synthesis):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | formal-pair | Guizzardi + Gandon | [gandon-guizzardi.md](./session-009-claims-evidence-provenance/gandon-guizzardi.md) |
  | shacl-solo | Kurt Cagle | [cagle.md](./session-009-claims-evidence-provenance/cagle.md) |
  | dpv-odrl-extended | Harshvardhan Pandit + Renato Iannella | [pandit-iannella.md](./session-009-claims-evidence-provenance/pandit-iannella.md) |
  | da-solo | **Nicola Guarino (DA)** | [guarino-da.md](./session-009-claims-evidence-provenance/guarino-da.md) |

- **Input Documents:** ODR-0009 stub (well-developed; PROV-O backbone + separate assurance layer); ODR-0005 §3a-c (3-class IC); ODR-0006 (Agent Kinds; evidencedAuthority link); ODR-0011 §8a (Quality Region for assurance level); ODR-0015 §7a (DPV class-level baseline pattern); ODR-0017 (SHACL-AF non-blocking pattern — anticipated ninth citing site here). S009 exemplars: claim-with-document-evidence; claim-with-electronic-record-evidence; claim-with-vouch-evidence. W3C: PROV-O Recommendation; SHACL Core; SHACL-AF.
- **`consensus-mode`:** `agent-fan-out` with two-artefact discipline (DEFAULT per ODR-0001 EXPAND).
- **Format tier:** Full Council. Phase 4 lead.

## Context

ODR-0009 is the Claims, Evidence & Provenance module — Phase 4 lead. The stub is substantially developed (PROV-O backbone + separate assurance layer per S001 Q6 Moreau analysis). The session ratifies the stub's commitments + discharges A9 inline for the **sixth `kind: pattern` ODR** under the methodology.

The session inherits a substantial substrate from S005 + S006 + S011 + S015 + S017 + S007. PROV-O carries the derivation graph; assurance layer carries the regulated judgement; Guarino DA holds the "PROV-O ≠ assurance" line throughout.

## Pre-flight scope check

Outcome: **ratify-as-is**. Stub coherent; Phase 4 lead unblocked; A9 application direct.

## Question-by-question verdicts

### Q1 — PROV-O coverage (80%/5-residue split)

**Verdict: 10-0 CONCEDE 80%/5-residue.** Guizzardi UFO meta-categorisation table confirmed: Claim/Verifier/three evidence subtypes as UFO Substance Kinds (DOLCE Endurants); Verification as `prov:Activity` (Perdurant / Event). Five residue items confirmed: trust_framework, validation/verification distinction, digest, assurance level, txn. Three candidates for a sixth residue item explicitly rejected (time; evidence.type; access_token). Guarino DA concedes (his S001 framing ratified).

### Q2 — Qualified attribution

**Verdict: 10-0 FOR `prov:qualifiedAttribution` with `prov:hadRole`** per PROV-O Recommendation §3.6. SHACL: `opda:VerificationShape` requires `prov:qualifiedAttribution` with cardinality 1+; `opda:AttributionShape` requires `prov:agent` (cardinality 1) and `prov:hadRole` (cardinality 1+). Bearer-class `sh:or` disjunction per ODR-0006 Q2 RoleMixin discipline. Vouch exemplar exercises the two-Attribution pattern (subject + voucher each with their own qualified attribution).

### Q3 — Assurance level vocabulary (Guarino DA PRIMARY VIGILANCE)

**Verdict: 10-0 CONCEDE to ODR-0011 §8a** Quality Region. `opda:AssuranceLevelScheme` settled. Pandit lawful-basis-trigger amendment adopted (assurance level is load-bearing input to GDPR Art. 6 + Art. 9 lawful-basis determinations — eIDAS Low/Substantial/High maps to Art. 9(2)(g) substantial-public-interest thresholds; ODR-0012 inherits as load-bearing input).

**Guarino DA Q3 PRIMARY VIGILANCE WITHDRAWN.** ODR-0009 §Rules will state explicitly per formal-pair amendment: *"PROV-O is the derivation graph; assurance is the regulated judgement the regulator makes ABOUT the derivation. `opda:assuranceLevel` is the regulator's conclusion; it is NOT derivable from PROV-O graph traversal."* The PROV-O ≠ assurance line is preserved in the §Rules text.

### Q4 — Cryptographic digest

**Verdict: 10-0 FOR `opda:digest`** literal + `opda:DigestAlgorithmScheme` SKOS scheme (Method/plan code per ODR-0011 §8a). SHACL via `sh:pattern` per ODR-0011 §7a default (no custom datatypes); colon-prefix form `"^(sha256|sha384|sha512):[0-9a-f]+$"`. Pandit caveat in §Rules: digest is integrity-check on verifiedClaims envelope, NOT cryptographic signature — signature semantics route to W3C Data Integrity / VC (Q8 → ODR-0016).

### Q5 — `trust_framework` modelling (Guarino DA MILD ATTACK)

**Verdict: 10-0 FOR dual modelling** — `opda:TrustFramework rdfs:subClassOf dct:Standard` (Substance Kind / Social Object per Searle 1995) + SKOS reification in `opda:TrustFrameworkScheme`. `skos:exactMatch` binding (NEVER `owl:sameAs` per ODR-0005 Anti-pattern §5).

**Guarino DA Q5 MILD ATTACK WITHDRAWN.** Per formal-pair amendment: ODR-0009 §Rules names `dct:conformsTo opda:TrustFramework` as **primary W3C-grade interop predicate**; SKOS reification recorded as **OPDA-internal governance supplement** (discovery + framework-registry stewardship under DPV governance discipline per Pandit). Two layers; clear primacy; W3C interop preserved.

### Q6 — DPV co-annotation seam

**Verdict: 10-0 FOR one-paragraph pointer to ODR-0012.** Per Scope-Check 1 Q5 refinement (settled): ODR-0012 owns DPV co-annotation authoring; ODR-0009 carries the pointer. Pandit text drafted: *"Evidence subclasses bearing PII (DocumentEvidence with proprietor names; ElectronicRecordEvidence with HMRC API responses; VouchEvidence with voucher solicitor names) inherit the DPV class-level co-annotation pattern from ODR-0012. The handoff is mechanical: ODR-0009 declares Evidence subclasses + envelope-field PII-bearing predicates → ODR-0012 authors class-level DPV triples → instance-level lawful-basis at generation."*

**Fourth citing site for the class-level DPV pattern** (S005 + S015 §7a + S006 amendment + S009 §6); fires ODR-0001 A9 §Artefact identity test spawn-rule for a future `opda-dpv-class-level-coannotation` pattern ODR. **Flagged for follow-up Author-only session.**

### Q7 — SHACL-over-PROV `sh:xone`

**Verdict: 10-0 FOR Cagle's three-branch `sh:xone` dispatch** on `opda:Evidence`. Full SHACL Turtle for `opda:DocumentEvidenceShape` + `opda:ElectronicRecordEvidenceShape` + `opda:VouchEvidenceShape` each enforcing type-specific required predicates per the S009 exemplars. Pandit note: same discrimination drives DPV co-annotation dispatch in `opda-annotations.ttl`.

**ODR-0017 ninth citing site lands:** `opda:VerificationActivitySuccessionRule` materialises re-verification chains at `sh:Info` per Cagle's amendment (first citing site explicitly anticipated in ODR-0017 §References as "ODR-0009 — PROV-O Claims/Evidence rule"). ODR-0009 retrofits `implements: [ODR-0003, ODR-0017]`.

### Q8 — W3C VC interop

**Verdict: 10-0 DEFER to ODR-0016.** Per Scope-Check 1 Q7c (Phase 7 deferred-until-trigger). Structural compatibility recorded without commitment. Cagle operational note: Q7 SHACL shapes survive any future VC overlay (composition-friendly under SHACL Core §4.6.4).

## Synthesis

This session ratifies ODR-0009 as the sixth `kind: pattern` ODR under A9 (6-of-6 clean discharge). Seven moves:

1. **PROV-O backbone with 5-residue assurance layer** (Moreau S001 framing ratified).
2. **`prov:qualifiedAttribution` with `prov:hadRole`** (W3C-grade per Gandon).
3. **Assurance level as Quality Region SKOS scheme** (ODR-0011 §8a settled; Pandit lawful-basis-trigger amendment).
4. **`opda:digest` + algorithm SKOS scheme** (integrity-check, NOT signature; Pandit caveat in §Rules).
5. **Trust framework dual modelling** (`dct:conformsTo opda:TrustFramework` primary; SKOS reification supplement — Guarino DA mild attack withdrawn).
6. **DPV co-annotation seam** — one-paragraph pointer to ODR-0012 (Pandit authoring authority; fourth citing site of class-level DPV pattern).
7. **SHACL-over-PROV `sh:xone` three-branch dispatch** + **ODR-0017 ninth citing site** (Cagle VerificationActivitySuccessionRule).

**Guarino DA "PROV-O ≠ assurance" line preserved.** §Rules text explicitly states: "PROV-O is the derivation graph; assurance is the regulated judgement; the regulator's conclusion is in `opda:assuranceLevel`, not derivable from PROV-O graph traversal." Held-as-live re-open trigger: if 18 months / downstream ODRs treat PROV-O derivation history as the regulator's assurance judgement, S009 re-opens.

**Downstream:** ODR-0012 (Data-Governance Layer) UNBLOCKED. Inherits Evidence-subclass PII-bearing predicates list + assurance-level lawful-basis-trigger.

**Pattern-extraction candidate flagged:** Class-level DPV co-annotation pattern reaches fourth citing site (S005 + S015 + S006 + S009); ODR-0001 A9 §Artefact identity test spawn-rule fires; spawn `opda-dpv-class-level-coannotation` pattern ODR in follow-up Author-only session.

## Two-artefact structured tally

| Voice | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| Guizzardi (formal-pair) | F | F | F | F | F | F | F | F-defer |
| Gandon (formal-pair) | F | F | F | F | F | F | F | F-defer |
| Cagle (shacl-solo) | F | F | F | F | F | F | F | F-defer |
| Pandit (dpv-extended) | F | F | F | F | F | F | F | F-defer |
| Iannella (dpv-extended) | F | F | F | F | F | F | F | F-defer |
| Guarino (DA) | C | C | W | C | W | C | C | C |

| Q | F | A | H | W/C | Verdict |
|---|---|---|---|---|---|
| Q1 | 5 | 0 | 0 | 1 C | 10-0 CONCEDE 80%/5-residue |
| Q2 | 5 | 0 | 0 | 1 C | 10-0 FOR qualified attribution |
| Q3 | 5 | 0 | 0 | 1 W | 10-0 FOR assurance as Quality Region + PROV-O-≠-assurance §Rules text |
| Q4 | 5 | 0 | 0 | 1 C | 10-0 FOR opda:digest + algorithm SKOS scheme |
| Q5 | 5 | 0 | 0 | 1 W | 10-0 FOR dual modelling with `dct:conformsTo` primary |
| Q6 | 5 | 0 | 0 | 1 C | 10-0 FOR ODR-0012 pointer (4th DPV class-level citing site → spawn) |
| Q7 | 5 | 0 | 0 | 1 C | 10-0 FOR SHACL-over-PROV + ODR-0017 9th citing site |
| Q8 | 5 | 0 | 0 | 1 C | 10-0 DEFER to ODR-0016 |

**Guarino DA scorecard:** 6 CONCEDED (Q1, Q2, Q4, Q6, Q7, Q8) + 2 WITHDREW on §Rules-text amendment (Q3 PROV-O-≠-assurance preserved; Q5 `dct:conformsTo` primary). 8 of 8 closed. Held-as-live re-open trigger preserved.

## Track record

- **Session 009 — ODR-0009 Claims, Evidence & Provenance** (Phase 4 lead). Full Council (5 runs: formal-pair + Cagle-solo + dpv-odrl-extended + Guarino-DA + Queen Moreau synthesis). Two-artefact discipline. Queen Moreau (PROV-O editor); DA Guarino (PROV-O ≠ assurance — 6 conceded / 2 withdrew on §Rules-text amendments). **Sixth `kind: pattern` ODR to discharge under A9 — 6-of-6 clean.** Q1 10-0 CONCEDE 80%/5-residue; Q2 10-0 FOR `prov:qualifiedAttribution` + `prov:hadRole`; Q3 10-0 FOR Quality Region with Guarino DA withdrawal on §Rules text preserving "PROV-O is derivation; assurance is regulated judgement; not derivable from PROV-O traversal"; Q4 10-0 FOR `opda:digest` + algorithm SKOS scheme + Pandit integrity-vs-signature caveat; Q5 10-0 FOR dual modelling (`dct:conformsTo opda:TrustFramework` primary + SKOS reification supplement; Guarino DA withdrew on primacy clarification); Q6 10-0 FOR one-paragraph pointer to ODR-0012 — **fourth citing site of class-level DPV co-annotation pattern; spawn-rule fires for shared pattern ODR**; Q7 10-0 FOR Cagle SHACL-over-PROV `sh:xone` + **ODR-0017 NINTH citing site** (VerificationActivitySuccessionRule — first explicitly anticipated citing site landed); Q8 10-0 DEFER to ODR-0016. ODR-0009 amended: `council: session-009`; `depends-on` extends to ODR-0006/0011/0015; `implements: [ODR-0003, ODR-0017]` retrofit. **status:proposed retained** per namespace block. Downstream: ODR-0012 UNBLOCKED.
