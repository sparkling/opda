# OPDA — Linked Data Council Adoption Record

Per [ODR-0001 §Adoption hooks](../ODR-0001-linked-data-council-methodology.md), this record declares the project-specific context for OPDA's adoption of the Linked Data Council methodology. The methodology body itself is portable; this record fills its declared slots.

- **Project:** OPDA — Open Property Data Association linked-data programme
- **Adopting date:** 2026-05-20 (initial)
- **Methodology version:** see [ODR-0001](../ODR-0001-linked-data-council-methodology.md) frontmatter `date` field — the canonical version pointer (currently 2026-05-27)

---

## §Project Weighting

Within the standing 9, OPDA weights the following experts more heavily because the project's domain — public-interest residential-property data in England & Wales — directly engages their published methodology:

| Expert | Why OPDA weights them more |
|---|---|
| **Ian Davis** | UK-government linked-data conventions are directly relevant. OPDA produces a public-interest dataset and aspires to UK-Gov-style publishing discipline (BBC `/programmes/` model; `data.gov.uk` cookbook). Davis's publish-first / time-box framings are load-bearing for OPDA's MVP discipline. |
| **Tom Baker** | Metadata-standards and vocabulary-governance practice. OPDA's catalogue discipline (ODR-0002 Core/Conditional/Defer tiering with change-log absorption) follows the DCMI hygiene pattern Baker codified. |

This weighting is recorded in convening blocks but does NOT override panel composition — all 9 standing experts still appear in every Full Council session. The weighting affects DA selection (Davis is the natural DA for sessions where publish-first / scope-discipline framings are credible opposition).

## §Domain-Extended Panel

OPDA pre-elects these extended-panel candidates as routinely applicable because the linked-data programme genuinely turns on their expertise:

| Expert | Why pre-elected |
|---|---|
| **Holger Knublauch** | SHACL is load-bearing for `verifiedClaims`, the overlay-profile mechanism (ODR-0010), and the validation severity scheme (ODR-0013). Knublauch authored the SHACL spec and runs TopBraid customer governance — his operational opinions on profile composition and severity tiering are first-tier for OPDA. |
| **Antoine Isaac / Alistair Miles** | SKOS is the substrate for enumeration vocabularies (ODR-0011) and the per-scheme UFO meta-category declarations (Scope-Check 1 Q3 sub-finding). OPDA's 160+ JSON enums all map to SKOS schemes. |
| **Harshvardhan Pandit** | DPV is load-bearing for the governance layer (ODR-0012) and the DPV co-annotation pattern on Claims/Evidence. Pandit's session-001 dissent on lawful-basis/consent/purpose class vocabulary is a live methodological position. |
| **Renato Iannella** | ODRL is admitted in the catalogue with policy-authoring deferred. When the activation trigger fires (consent instances entering scope), Iannella's expertise becomes immediately load-bearing. |
| **Luc Moreau** | PROV-O is the backbone of Claims, Evidence & Provenance (ODR-0009). The 80%/5-residue boundary in the verifiedClaims-to-PROV-O mapping is Moreau's own analysis. |
| **Manu Sporny / Drummond Reed** | W3C VC / DID / Trust Framework interop is the deferred Phase-7 work (ODR-0016). Activates on wallet consumer or DID-method instance data entering scope. |

Other extended-panel candidates (Dehghani, Alani/Domingue, Ranganathan/ISO 25964, Evans/Vernon) remain case-by-case — convened when a specific question genuinely depends on their expertise.

## §Real-world Governance Handoff

Council verdicts shape *proposals*; adoption flows through OPDA's real-world governance:

1. **OPDA Working Groups** — domain-specific WGs (e.g. PDTF Schema WG, Trust Framework WG, AML WG) review Council proposals against operational reality and stakeholder concerns.
2. **OPDA Modelling Sub-Committee** — cross-WG body that ratifies linked-data modelling proposals into draft adopted decisions.
3. **OPDA AGM ratification** — annual general meeting where adopted decisions receive formal stakeholder endorsement.

A Council verdict is **not** a ratified OPDA decision. Records produced by Council sessions remain `proposed` until the Sub-Committee draft-adopts them; `accepted` only after AGM ratification (per project convention). The methodology's `accepted` status is necessary but not sufficient for adopted-decision status in OPDA.

## §Track Record

OPDA Council sessions, meta-Councils, and Author-only amendments convened to date. Per the methodology, every convened session — Full Council, Reduced Council, or Author-only — appears here.

| Date | Session | Format | Queen | DA | Subject | Verdict (one-line) |
|---|---|---|---|---|---|---|
| 2026-05-20 | [session-001](./session-001-pdtf-schema-to-ontology.md) | Full Council (12 voices / 6 teammates) | Elisa Kendall | Nicola Guarino | PDTF v3 schema → ontology (Q1–Q7) | Genuine modelling; concern/UFO partition; identity crux gated; spike-then-scale → ODR-0003 (anchor) + stubs ODR-0004 through ODR-0014 |
| 2026-05-26 | [scope-check-1-programme](./scope-check-1-programme.md) | Full Council — meta-Council (9 voices / 6 teammates) | Elisa Kendall | Ian Davis | Are ODR-0002…ODR-0014 the right cut? (Q1–Q8) | 8-1 APPROVE; nine amendments A1–A9 → spawn ODR-0015, name deferred ODR-0016, retire ODR-0014, DPV authoring → 0012, 0011 UFO-per-scheme, 0010↔0013 three-rule contract, defer 0008 split, six termination signals, Gandon-Guizzardi methodology gap routed to A9 |
| 2026-05-26 | [scope-check-2-hive-vs-swarm](./scope-check-2-hive-vs-swarm.md) | Reduced Council — meta-Council (6 voices / 4 teammates) | Elisa Kendall | Ian Davis | Hive-mind vs Agent fan-out: which session shapes should switch? (Q1–Q6) | 5-1 SELECTIVE; eight amendments B1–B8 → two pilots (S005 hive-mind/byzantine; S011 Q8 hive-mind/typed-output); B1 ratified later as direct ODR-0001 amendment; Byzantine framing reframed to structural vote acknowledgement; Davis Q1/Q5/Q6 dissents preserved |
| 2026-05-27 | ODR-0001 amendment (first) | Author-only (1 run; self-amendment) | Henrik (acting per the self-amendment process) | — | Make ODR-0001 portable; factor OPDA-specifics into this adoption record | Methodology body becomes project-agnostic; added citation-grounding, pre-flight scope check, format tiers, consensus-mode framework + full swarm/hive-mind config tables, working-file convention, meta-Council type, standing-panel amendment protocol, self-amendment process, adoption hooks |
| 2026-05-27 | ODR-0001 amendment (second) | Author-only (1 run; self-amendment) | Henrik (acting per the self-amendment process) | — | Add five hive-mind-advanced items to ODR-0001 | (i) Pattern lineage — Council Hive is Pattern 1; siblings out of scope. (ii) DA explicit withdraw-or-hold per contested question — silent alignment violation. (iii) Queen-composes-does-not-fabricate. (iv) One-message parallel spawn. (v) Worker failure protocol — 60s, retry-once with lineage, default-abstain |
| 2026-05-27 | ODR-0001 amendment (third) | Author-only (1 run; self-amendment) | Henrik (acting per the self-amendment process) | — | Add four hive-mind-advanced items (3, 6, 7, 8) to ODR-0001 | Cross-talk transport selection (queen-composed / SendMessage / MCP memory / file-based); multi-day session resumability (export/import/resume); sub-queen escalation for hierarchical-mesh; calling convention (Queen + sub-agents call MCP directly; SendMessage for inter-sub-agent) |
| 2026-05-27 | [session-003](./session-003-pdtf-ontology-programme.md) | Author-only (1 run; Queen synthesis) | Elisa Kendall | — | Programme operational frame for ODR-0003 — phase ordering, fast-path option, retirement criterion, status-discipline protocol, shared-question routing | ODR-0003 moves `proposed → accepted` (council: session-003); plan §5 phase order recorded as binding; plan §5.1 fast-path named as first-class alternative; plan §4.1 shared-question routing cited as single source of truth; bidirectional-update protocol (anchor + adoption-record + cross-refs) tightened. No fresh deliberation; every item plan- or precedent-sourced (Session 001, Scope-Check 1, Scope-Check 2). |
| 2026-05-27 | [session-a9](./session-a9-gandon-guizzardi-methodology-gap.md) | Reduced Council (4 runs: 2 panel teammates + 1 DA + 1 Queen synthesis) | Elisa Kendall | Nicola Guarino (DA — withdrew on all four conditions met) | Gandon-vs-Guizzardi methodology gap — what does an ODR record? Artefact-engineering decision vs ontological commitment | 2-1 BOTH-WITH-BOUNDARY at the `kind` enum (Guizzardi + Guarino DA; Gandon primary ARTEFACT-ENGINEERING with BOTH-WITH-BOUNDARY accepted as fallback). ODR-0001 amended in-place per §Self-amendment process: new §What an ODR records (per-kind discipline) subsection added to §Rules between §Citation grounding and §Cross-talk transport. For `kind: pattern \| mapping`, MUST state (a) UFO/DOLCE meta-category, (b) IC over named hard cases, (c) artefact realisation; `methodology`/`architecture`/`programme` relaxed. Gandon's artefact identity test adopted as operational supplement for `pattern` extraction. `odr-review` lint update flagged for next skill release. Pressure-test schedule: S005 + S011 are first two ratifiability tests. Gandon partial-alignment recorded; Guarino DA withdrew. |
| 2026-05-27 | [session-002](./session-002-vocabulary-catalogue.md) | Full Council (8 runs: 4 panel pairs + 1 DA + 1 Queen synthesis) | Tom Baker | Kurt Cagle (DA — withdrew on Q1, Q3–Q13; partial-withdraw on Q2) | Vocabulary Catalogue meta-discipline + absorbed-S014 codification (13 questions: 6 native + 7 absorbed) | 12 questions land 9-0 or 8-1 with full Cagle DA withdrawal (Q1, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q12, Q13); partial-withdraw on Q2. Q11 OBO RO lands DEFER 5-2-2 with Kendall + Guizzardi held-as-live positions routed to ODR-0005 follow-up. ODR-0002 amended: new `## Rules` subsections (Promotion and demotion criteria, four-condition Conditional→Core; Profile-pinning ownership, module-owner-proposes; Reference-not-import normative + three-value `adoption-mode` field); new Conditional-table columns (W3C status, Adoption mode, Profile pin); FOAF Change Log row tightened with two-reason rule-out; per-question Change Log rows Q7–Q13 codifying named-event triggers for OWL-Time demotion, DCAT promotion, SSSOM re-open, ODRL activation, cred/did activation. Pandit Q4 `dpv-pd` bundled-import divergence routed to ODR-0012 implementation. Council:session-002 set; status:proposed retained (per Scope-Check 1 Q4 — catalogue evolves through Change Log; status flips when consuming modules ratify). |
| 2026-05-27 | [session-004](./session-004-pdtf-ontology-foundation.md) | Full Council (8 runs: 4 panel pairs + 1 DA + 1 shacl-solo + 1 Queen synthesis) | Fabien Gandon | Holger Knublauch (DA — extended panel — withdrew on all 7 questions) | PDTF Ontology Foundation — Phase 1 gate (7 questions: hash/slash, layer-segregated naming, three-graph separation, term-sourcing precedence, generator-first policy, diagnostic-exemplar policy, namespace string + version scheme) | 7 questions × 9-0 vote; full Knublauch DA withdrawal on all four primary attacks (Q3 three-graph operational rule + Q4 term-sourcing five-line precedence + Q5 generator byte-identity CI + Q7 namespace-as-blocker). ODR-0004 amended: new §Operational specifications subsections 3a/6a/7a/8a — three-graph source-graphs + derived-consumer-profiles + five-part CI test (Q3); deterministic generator emission + version-pin + byte-identity CI + diff-explosion canary tests (Q5); five-line term-sourcing precedence + conflict-recording protocol + version-IRI pinning (Q4); exemplar `expected-report.ttl` pairing + parent-repo storage discipline (Q6). New Consequences: namespace-string-as-blocker on `status: accepted`; `w3id.org/opda/` recorded as named alternative for WG consideration; hash-vs-slash reopening-trigger threshold deferred to WG; `odr-review` lint specification deferred to next skill release; `opda:ValidationContext` reification routed to ODR-0010/0013 as `pattern`-extraction candidate per A9. **ODR-0004 stays `status: proposed`** until WG ratifies the namespace string (Knublauch DA primary demand: namespace decision is the gating event for the programme). Phase 1 Council gate cleared; formal Phase-1 close awaits WG namespace ratification. Session 001 Q5 carry preserved verbatim. |
| 2026-05-27 | [session-005](./session-005-property-land-identity-crux.md) | Full Council (8 runs: 1 formal-pair + 1 enterprise-pair + 1 hendler-solo + 1 governance-pair + 1 shacl-solo + 1 DA + 1 Queen synthesis); **B2 pilot — `consensus-mode: hive-mind/byzantine`** | Nicola Guarino | Dean Allemang (DA — withdrew on all 8 questions) | Property & Land: The Identity Crux — Phase 2 gate (8 questions: Endurant commitment, IC for physical Property, IC for LegalEstate/RegisteredTitle, UPRN status, 2-vs-3 class split, Address-as-mode, exemplar pass, gate clearance) | **First `kind: pattern` ODR to discharge under A9 per-kind discipline.** Q1 9-0 FOR Endurant + Substance Kind (Baker `dct:source`-to-DOLCE/UFO + Cagle machine-readable subClassOf amendments adopted); Q2 9-0 FOR spatial-material continuity with Kendall+Davis legal-record-discontinuity-override hybrid (Baker OS-AddressBase-Plus + Cagle three-SHACL-surrogates amendments adopted; Allemang DA withdrawal condition (b) met); Q3 9-0 FOR distinct ICs for LegalEstate (rights-bundle persistence) and RegisteredTitle (title-number lineage) with HMLR PG 1/16/40 + PROV-O lifecycle reification + Pandit PII-regime-distinction amendments; Q4 9-0 FOR both (SHACL/DASH operational key + PROV-O contingent identifier) + Cagle SHACL-AF succession-chain materialisation rule (Rule 6 amendment lands); Q5 **6-2-1 FOR 3-class** — Davis (2-class with `RegisteredTitle ⊑ LegalEstate` upgradeable on BASPI5-round-trip evidence) + Cagle (2-class with commonhold-spawn-rule trigger) held-as-live dissent preserved; Allemang DA withdrew on Pandit's PII-regime SHACL-discriminable case + first-registration lifecycle event; Q6 9-0 FOR routing Address modelling to ODR-0015 with minimal-constraint-recorded-here + Baker+Pandit DPV-pattern-consideration amendment; Q7 9-0 PASS with per-exemplar verdict walkthrough (registered-freehold-house + unregistered-pre-first-registration-house + flat-with-split-uprn); exemplar amendments scheduled (add LegalEstate to exemplars 1+2; canonical reified `opda:UPRNSuccessionEvent` for exemplar 3); `expected-report.ttl` pairing deferred to follow-up; Q8 9-0 FOR deliberative gate clearance with namespace block carrying. ODR-0005 amended: §Decision rewritten for 3-class; new §Operational specifications 2a/3a/3b/3c/6a/6b/7a/8a; §Consequences updated for downstream inheritance (ODR-0006/0007/0015 unblocked; **ODR-0008 deferred until cardinality crystallises** per Kendall+Davis joint amendment; ODR-0009/0010/0012/0013 inherit specific load-bearing inputs). Council:session-005 set; **status:proposed retained** per inherited ODR-0004 namespace block. Guarino S001 Q4 dissent WITHDRAWN. **B2 pilot verdict: EXTEND CAUTIOUSLY** — structured tally + retire-or-extend evaluation in transcript §B2 pilot; recommended for S015 + S011 Q8 (three-pilot threshold for EXPAND). |

**Pending:**

- ~~**A9 amendment session — Gandon-Guizzardi methodology gap**~~ — **CLOSED** by [session-a9](./session-a9-gandon-guizzardi-methodology-gap.md) (2026-05-27, Reduced Council, Queen Kendall, DA Guarino — withdrew). ODR-0001 amended with §What an ODR records (per-kind discipline). The MUST-level IC discipline for `kind: pattern | mapping` is the load-bearing rule downstream sessions inherit.
- ~~**B2 pilot — Session 005** — Property identity crux gate; `consensus-mode: hive-mind/byzantine`~~. **CLOSED** by [session-005](./session-005-property-land-identity-crux.md) (2026-05-27, Full Council, Queen Guarino, DA Allemang — withdrew on all 8 questions). 3-class commitment lands (6-2-1); namespace block carries; downstream ODR-0006/0007/0015 unblocked; ODR-0008 deferred. **B2 pilot verdict: EXTEND CAUTIOUSLY** to S015 + S011 Q8.
- **B3 pilot — Session 011 Q8** — UFO meta-category per scheme; `consensus-mode: hive-mind/typed-output`. Substrate landed; A9 resolved (per-scheme UFO category + IC over named hard cases now MUST-level for `kind: pattern`). Pilot unblocked.
- **Session 015 — ODR-0015 Address & Geography** (Reduced Council, Phase 2.6 gate). Unblocked by S005 close. May proceed in parallel with S011. Inherits S005 Q6 constraint (Address as routed-from-ODR-0005; DPV-pattern consideration required); two-artefact discipline applies (B2 pilot EXTEND-CAUTIOUSLY recommendation).

## §Project-specific when-to-use additions

OPDA extends the general when-to-use list with these domain-specific categories:

- **PDTF schema boundaries** — bounded-context boundaries between PDTF v3's base transaction schema and its 10+ overlay schemas (BASPI, TA6/7/10, NTS/NTS2, CON29R/DW, LLC1, LPE1, FME1, OC1).
- **Property-transaction overlays as SHACL profiles** — the overlay-profile mechanism (ODR-0010) and its interaction with severity (ODR-0013) are sufficiently load-bearing that questions about their boundary warrant Council.
- **eIDAS / OIDC4IDA / W3C VC interop** — the verifiedClaims envelope sits at the seam between PDTF and the W3C VC ecosystem; alignment questions warrant Council (deferred to ODR-0016 unless triggered earlier).
- **UK-Gov data-sharing alignment** — when OPDA records make commitments that affect interoperability with `gov.uk` OneLogin, HMLR RDF, INSPIRE, or analogous public-sector datasets, Council session warranted.
- **Property identity and registration** — UPRN, INSPIRE Identifier, title-register identity, and the Endurant commitments that ground them (the identity-crux family — ODR-0005 + ODR-0015) are domain-load-bearing enough to warrant Council whenever they're touched.

## §Council directory path

OPDA's Council artefacts live at:

```
docs/ontology/odr/council/
```

with the conventions:

- **Per-record sessions**: `session-NNN-<slug>.md` (e.g. `session-001-pdtf-schema-to-ontology.md`)
- **Meta-Councils**: `scope-check-N-<slug>.md` (e.g. `scope-check-1-programme.md`, `scope-check-2-hive-vs-swarm.md`)
- **Per-teammate working files**: `working/session-N/<teammate>.md` or `working/scope-check-N-<slug>/<teammate>.md`
- **This adoption record**: `adoption.md` at the council-directory root.

## Adoption-record maintenance

This record is updated when:

- A new Council session lands (track-record table grows).
- A meta-Council amends OPDA's project-specific slots (e.g. promotes an extended-panel candidate to pre-elected).
- The Real-world Governance Handoff changes (e.g. OPDA AGM restructures into a different ratification chain).

Updates land as in-place edits with git history as the audit trail. No parallel amendment-record file (per DCMI hygiene + the methodology's self-amendment guidance).

## References

- Methodology: [ODR-0001 — Linked Data Council: Review Methodology](../ODR-0001-linked-data-council-methodology.md).
- Programme anchor: [ODR-0003 — PDTF → Ontology: Programme & Work Breakdown](../ODR-0003-pdtf-ontology-programme.md).
- Plan: [Council follow-up sessions](../../plan/council-followup-sessions.md) — operational plan for the 13 active ODR ratification sessions plus the deferred ODR-0016.
- Sister project precedent: H&M semantic-modelling programme (the source of the Council methodology; see ONT-0021 in that repository).
