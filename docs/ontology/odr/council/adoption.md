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

**Pending:**

- **A9 amendment session — Gandon-Guizzardi methodology gap** (Scope-Check 1). The artefact-engineering-vs-ontological-commitment question (does an ODR record an artefact-engineering decision or an ontological commitment?) still requires a Council session. **Reduced Council**, Queen TBD (suggested Kendall for continuity), DA Guarino (DOLCE formal-ontology theorist — natural choice for the artefact-vs-commitment question). Not strictly blocking for B2/B3 pilots but recommended before S005 (whose IC commitments sit close to the gap).
- **B2 pilot — Session 005** — Property identity crux gate; `consensus-mode: hive-mind/byzantine`. Substrate landed in ODR-0001 (2026-05-27); pilot unblocked. Recommended to follow A9 (methodology gap resolution) but not strictly required.
- **B3 pilot — Session 011 Q8** — UFO meta-category per scheme; `consensus-mode: hive-mind/typed-output`. Substrate landed; pilot unblocked.

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
