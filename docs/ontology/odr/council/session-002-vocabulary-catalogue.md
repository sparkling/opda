# Council Session 002 — Vocabulary Catalogue Adoption (meta-discipline + S014 absorption)

- **Date:** 2026-05-27
- **Record under review:** [ODR-0002 — Ontology Languages and Vocabularies Adopted](../ODR-0002-ontology-language-adoption.md) (`kind: architecture`; A9-relaxed regime).
- **Queen / Moderator:** Tom Baker (Dublin Core / DCMI Usage Board; Dublin Core Abstract Model; Singapore Framework). Baker as Queen sits inside the governance-pair teammate (with Pandit) and writes the synthesis.
- **Devil's Advocate:** Kurt Cagle (*The Ontologist* — SHACL practitioner, taxonomy design, AI-RDF integration). The strongest credible attacker on admission criteria — his Session 001 SSSOM dissent (≈5-4, recorded) and his Scope-Check 1 three-rule SHACL interface contract are precedent for the operational-check discipline he carries here.
- **Panel (5 teammates carrying 9 standing-panel voices):**

  | Teammate | Voices | Position file |
  |---|---|---|
  | governance-pair | **Tom Baker (Queen)** + Harshvardhan Pandit | [baker-pandit.md](./session-002-vocabulary-catalogue/baker-pandit.md) |
  | pragmatic-pair | Dean Allemang + Jim Hendler | [allemang-hendler.md](./session-002-vocabulary-catalogue/allemang-hendler.md) |
  | enterprise-pair | Elisa Kendall + Ian Davis | [kendall-davis.md](./session-002-vocabulary-catalogue/kendall-davis.md) |
  | formal-pair | Fabien Gandon + Giancarlo Guizzardi | [gandon-guizzardi.md](./session-002-vocabulary-catalogue/gandon-guizzardi.md) |
  | da-solo | **Kurt Cagle (DA)** | [cagle-da.md](./session-002-vocabulary-catalogue/cagle-da.md) |

  (`shacl-solo` seat is absent because Cagle plays the DA role; no extended-panel guests per [plan §4 Session 002](../../plan/council-followup-sessions.md).)
- **Input Documents:**
  - [ODR-0002 — Ontology Languages and Vocabularies Adopted](../ODR-0002-ontology-language-adoption.md) (the stub; 80% settled; 11-row Change Log).
  - [ODR-0001 — Linked Data Council Methodology](../ODR-0001-linked-data-council-methodology.md), especially the new §What an ODR records (per-kind discipline) — A9 amendment ratified 2026-05-27. ODR-0002 is `kind: architecture`; requirements (a) UFO meta-category and (b) IC over named hard cases are RELAXED.
  - [ODR-0014 — Vocabulary Catalogue Amendments](../ODR-0014-vocabulary-catalogue-amendments.md) (retired per Scope-Check 1 Q4; read as historical anchor for S001 amendment provenance).
  - [Session 001 Q2 transcript](./session-001-pdtf-schema-to-ontology.md) — every per-vocabulary dispute deliberated.
  - [Scope-Check 1 Q4 transcript](./scope-check-1-programme.md) — the retire-0014 decision (7-1-1; Hendler dissent preserved); Q7c the `cred:`/`did:` admission (8-1).
  - [DCAP profile](../DCAP.md) — §Frontmatter Kind enum; §Sections.
- **`consensus-mode`:** `agent-fan-out` (default per ODR-0001 §Consensus-mode framework — votes on each question are independent of votes on other questions; verdict reduces to a tally of standalone positions).
- **Format tier:** **Full Council** (per [plan §4 Session 002 blueprint](../../plan/council-followup-sessions.md)). 5 teammates × 13 questions; Queen synthesis.

## Context

ODR-0002 is the vocabulary catalogue — the closed, tiered admission record bounding OPDA's external-vocabulary surface. Session 001 Q2 produced the substantive admission decisions (8 Core + 9 Conditional + 9 Defer); Scope-Check 1 Q4 retired the parallel-amendment ODR-0014 and folded its rows into ODR-0002's `## Change log`; Scope-Check 1 Q7c admitted `cred:` and `did:` to Defer with activation pointer to ODR-0016. The catalogue is **80% settled** in admission content; what S002 codifies is the **meta-discipline** — promotion/demotion criteria, profile-pinning ownership, reference-not-import normative status, W3C status citation, and seven absorbed S014 amendment rows that need explicit trigger language.

13 questions: 6 native meta-discipline (Q1–Q6) and 7 absorbed from retired ODR-0014 (Q7–Q13). Cagle (DA) carries a single attack-axis: *a tier or trigger without an operational SHACL-style check is decoration*. His five priority holds (Q3, Q5, Q9, Q11, Q12) form a coherent test-surface — if the synthesis lands operational checks on all five, the DA withdraws; if any goes soft, held dissent on that question and downstream sessions inherit the dissent against the catalogue's admission discipline.

A9 (ratified earlier this same day) confirms `kind: architecture` is the **relaxed regime**: ODR-0002 does NOT require UFO meta-category commitments or ICs over hard cases. The discipline is admission criteria, tier-movement triggers, and reference-not-import — *not* ontological commitment authorship. The panel correctly avoids straying into pattern territory; where any question surfaces a commitment shadow (e.g. OBO RO's well-founded mereology as identity-bearing), the synthesis routes it to a `pattern` ODR (likely ODR-0005's follow-up) rather than admitting it as a catalogue commitment.

## Pre-flight scope check

Per ODR-0001 §Pre-flight scope check. Outcome: **ratify-as-is.**

- Coherent proposition (catalogue meta-discipline + absorbed-S014 codification; 13 questions; named DA; named pair-voices).
- No retire signal (Scope-Check 1 confirmed the cut at 8-1 APPROVE; the catalogue stays).
- No re-scope signal (the absorbed S014 rows fold into the same record; the plan §5 Phase 0 sequence has S002 second after S003).
- A9-relaxed regime is correctly applied (governance-pair's pre-flight note); panel does not stray into `pattern` content.

## Question-by-question verdicts

### Q1 — Tier cut (three vs four tiers)

**Positions** (citations: [baker-pandit.md Q1](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q1](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q1](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q1](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q1](./session-002-vocabulary-catalogue/cagle-da.md)):

- **Baker (Queen):** Three tiers; deprecation is term-level metadata recorded in `## Change log`, not a catalogue-level tier. Dublin Core Abstract Model (Powell et al. 2007) precedent: deprecation lives in `dcterms:isReplacedBy` on individual terms, not at the catalogue tier.
- **Pandit:** Concur; DPV's modular discipline (DPV 2.0 §3 *Modules*) settles deprecation inside the extension, not the catalogue.
- **Allemang:** Three tiers; fourth "under-review" tier belongs in `docs/governance/deferred-work`, not in ODR-0002.
- **Hendler:** Three tiers with audit-trail caveat — `## Change log` MUST capture every movement with named voters and rationale (his preserved Scope-Check 1 Q4 dissent on permanence stands as live position).
- **Kendall:** Three tiers; FIBO has four (Production / Development / Informative / Provisional) for ~250-module scale; OPDA's 26-entry surface sits below that threshold.
- **Davis:** Three tiers; "deprecated" is a status field on a row, not a column on the table.
- **Gandon:** Three tiers; per A9 this is artefact-engineering; do not over-design.
- **Guizzardi:** Three tiers; tiers are editorial scopes, not ontological commitments.
- **Cagle (DA):** *Attack.* The current Defer column conflates "considered and said no" (FOAF/BBO/ArchiMate) with "considered and said wait" (SSSOM with recorded dissent; `cred:`/`did:` with named activation pointer). FIBO's four-tier model (Production/Provisional/Development/Informative) distinguishes these for audit-trail reasons. Withdrawal condition: **WITHDRAW IF Q3's demotion procedure produces an auditable Conditional → Defer flip event with named voter; PARTIAL WITHDRAW if fourth tier adopted**.

**Vote: 8-1 KEEP three tiers.** Cagle (DA) attacks on Q1 directly but his withdrawal condition routes through Q3 — see below.

**Cagle DA status:** **WITHDRAWN** — Q3's enumerated promotion/demotion criteria land with named-voter audit trail (see Q3), meeting the primary withdrawal condition.

### Q2 — Per-entry metadata fields

**Positions** ([baker-pandit.md Q2](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q2](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q2](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q2](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q2](./session-002-vocabulary-catalogue/cagle-da.md)):

- **Baker:** Keep the four columns; `version-pin` only where breaking-version story is declared (RDF 1.2, SHACL 1.2 already carry pins in their entry names). Singapore Framework layering separates encoding-syntax decisions from the application profile.
- **Allemang:** Pragmatic — pin only when breakage plausible within the round.
- **Hendler:** Version is part of URI policy; OPTIONAL for Core (except where already declared), RECOMMENDED for Conditional. Add `W3C status` field (links Q6).
- **Kendall:** Add `profile-pin` field conditional on the row (present only when slice is adopted).
- **Davis:** Concur on `profile-pin` conditional-on-row; reject universal `version-pin` column.
- **Gandon:** Pin canonical URI + `owl:versionIRI` (where applicable) + prefix.
- **Guizzardi:** W3C status of commitments matters (links Q6).
- **Cagle (DA):** Demand three fields — `version-pin`, `last-reviewed`, `consumer-cite`. Withdrawal condition: WITHDRAW IF all three; PARTIAL WITHDRAW if `version-pin` only.

**Convergence:** Add `profile-pin` (conditional on row), add `W3C status` column (universal), add `adoption-mode` field (resolves Q4). Cagle's `last-reviewed` partially met by W3C status's date component (Q6); `consumer-cite` partially met by Change Log row attribution.

**Vote: 9-0 ADD three fields** to the Conditional table: `W3C status` (universal — see Q6); `adoption-mode` (universal — see Q4 — values `reference-only` | `slice-import` | `full-import`); `profile-pin` (conditional on row, present only when slice is adopted).

**Cagle DA status:** **PARTIAL WITHDRAW** — gets `version-pin` (via `W3C status`'s date component naming the release) and `consumer-cite` (via Change Log attribution discipline of Q3); does not get a standalone `last-reviewed` field but the annual review cadence (Q3) produces the same operational signal.

### Q3 — Promotion / demotion criteria — DEPTH

**Positions** ([baker-pandit.md Q3](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q3](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q3](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q3](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q3](./session-002-vocabulary-catalogue/cagle-da.md)):

The load-bearing question. All five voices converge on **enumerated criteria + asymmetric demotion + named-consumer requirement + SHACL gate**:

- **Baker (Queen):** DCMI Usage Board four-criterion test (Necessity / No-duplication / Authority / Lived use ≥3 modules) for Conditional → Core. Demotion: non-use for one Phase OR superseded. De-listing: W3C/maintainer withdrawal OR adopting-project WG rules out by name.
- **Pandit:** Concur.
- **Allemang+Hendler:** Three-condition promotion (usage ≥3 layers + SHACL gate exists + stable dereferenceable upstream). **Asymmetric demotion: Core never demotes** (URI-graph break per Hendler's W3C TAG concern); Conditional → Defer is editorial; Defer rows never delete (audit trail). One-step-per-Change-Log-row sub-rule.
- **Kendall+Davis:** Conditional → Core requires SHACL gate + named active consumer + break-test recorded (FIBO Production-tier discipline). Annual author-only review cadence; only contested rows escalate to Reduced Council.
- **Gandon:** Promotion needs *named consumer dereferencing the resource* (LDP Principle 4).
- **Guizzardi:** Distinguish vocabulary obsolescence from commitment shift; both may warrant Council review.
- **Cagle (DA):** Demand enumerated promotion checklist (named consumer + layer count + SHACL gate + failure-mode test) AND parallel demotion checklist. Withdrawal condition primary.

**Synthesis adopts a unified four-condition promotion** (drawing on Baker's DCMI test, Allemang+Hendler's three-condition framing, Kendall+Davis's FIBO operational discipline, and Cagle's failure-mode test demand):

For **Conditional → Core**, ALL four must hold:

1. **Named consumer** — at least one OPDA module ODR cites the vocabulary in its `## Rules`, with the vocabulary's terms appearing in published Turtle (not just plan-stage prose).
2. **Layer count** — used in ≥3 independent OPDA modules / layers.
3. **SHACL gate** — a SHACL gate enforcing the Conditional-layer scope has been published.
4. **Failure-mode test** — a diagnostic exemplar (per Session 001 Q1 lineage) where *removing* the vocabulary causes a specific named test to fail.

For **demotion** (asymmetric per Allemang+Hendler):

- **Core never demotes.** Deprecation is recorded in `## Change log` (the term is `dcterms:isReplacedBy`-style retired) but the row stays. W3C Process precedent.
- **Conditional → Defer** is editorial; requires (a) non-use across one full Phase OR (b) Core entry now provides the semantics (precedent: BBO + ArchiMate, Session 001 Q2). Named voter; Change Log row attribution.
- **Defer rows never delete.** Audit-trail discipline per Hendler's preserved Scope-Check 1 Q4 dissent.

**De-listing** (Defer → out) is reserved for: (a) W3C/maintainer formally withdraws the vocabulary; OR (b) OPDA WG (or adopting project's governance per ODR-0001 §Adoption) rules out by name.

**Annual review cadence** (Davis): author-only review reads current W3C status and updates rows; only contested rows escalate to Reduced Council.

**Vote: 9-0 ADOPT four-condition promotion + asymmetric demotion + annual review.** Cagle DA's primary withdrawal condition met.

**Cagle DA status:** **WITHDRAWN** — enumerated promotion checklist (named consumer + layer count + SHACL gate + failure-mode test) lands with parallel demotion procedure and named-voter discipline.

### Q4 — Reference-not-import discipline — DEPTH

**Positions** ([baker-pandit.md Q4](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q4](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q4](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q4](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q4](./session-002-vocabulary-catalogue/cagle-da.md)):

- **Baker:** Already in `### Adoption pattern` rule 3; normative via inclusion. Tighten "No `owl:imports`" to "MUST NOT use `owl:imports`".
- **Pandit (DIVERGE):** For PII-heavy modules (ODR-0012), `dpv-pd` may need bundled import for SHACL `sh:class` validation on the lawful-basis hierarchy. **Recorded as ODR-0012 implementation concern, not ODR-0002 amendment.**
- **Allemang+Hendler:** Generalise as **default MUST** with two documented exception levers (profile-slice; reasoner-required). Hoist Adoption-pattern rule 3 to first-class `### Reference-not-import (normative)` subsection.
- **Kendall+Davis:** Introduce `adoption-mode` field with three values: `reference-only` (default), `slice-import`, `full-import`. Reference-only is the FIBO discipline (`fibo-fnd-utl-av` references `dct:` without importing).
- **Gandon+Guizzardi:** Concur with Kendall's S001 amendment; reference-by-canonical-URI without `owl:imports` preserves dereferenceable identity (LDP); H&M ONT-0086 pattern.
- **Cagle (DA):** Reference-not-import is operationally fragile in three named cases (load-bearing class hierarchy; controlled vocabulary consumed by `sh:in`; vocabulary-is-a-spec). Withdrawal condition: qualified as "default with documented exceptions" with three exception classes (spec / enum / hierarchy).

**Synthesis adopts Kendall+Davis's `adoption-mode` field** which subsumes Cagle's three exception classes and Allemang+Hendler's two exception levers:

- `reference-only` (default) — canonical URI; no `owl:imports`; local SHACL. Covers PROV-O, DCAT 3, OWL-Time, DASH (effectively-imported-at-runtime via SHACL processor).
- `slice-import` — named profile slice imported via `owl:imports` of the slice URI. Covers Cagle's hierarchy and enum exception classes; pairs with `profile-pin` (Q2/Q5).
- `full-import` — `owl:imports` of the whole vocabulary. Reserved for Core tier; covers Cagle's spec exception class (SHACL, OWL 2, RDF 1.2). Requires recorded use case that slice-import cannot satisfy.

**Pandit's `dpv-pd` divergence is routed to ODR-0012** as an implementation concern (the catalogue rule stays `reference-only`; ODR-0012's session may author `slice-import` for `dpv-pd` when the lawful-basis class vocabulary surfaces).

**Vote: 9-0 ADOPT `adoption-mode` field** with three values; generalise reference-only as default MUST for every Conditional entry; per-row justification required for `slice-import` or `full-import`.

**Cagle DA status:** **WITHDRAWN** — `adoption-mode` qualification covers his three named exception classes.

### Q5 — Profile-pinning ownership — DEPTH

**Positions** ([baker-pandit.md Q5](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q5](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q5](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q5](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q5](./session-002-vocabulary-catalogue/cagle-da.md)):

- **Baker:** Singapore Framework's DCAP-by-consumer pattern: **profile authoring is owned by the consuming module's Council session**, not the catalogue. The catalogue records *which* profile and links to the authoring ODR.
- **Pandit:** Concur; DPV-PD slice authored in ODR-0012, recorded in ODR-0002.
- **Allemang+Hendler:** Consuming-ODR owns; catalogue points (SKOS-XL precedent).
- **Kendall+Davis:** Catalogue authors propose; module owners ratify; WG ratifies cross-layer disputes only. (Davis prefers minimal ceremony; Kendall prefers consuming-session synthesis paragraph; resolution: catalogue-authors-propose / consuming-session-records / WG-disputes-only.)
- **Gandon+Guizzardi:** Module owners pin; catalogue records.
- **Cagle (DA):** Three concrete cases (DPV/ODR-0012; DASH/ODR-0010+0013; PROV-O/ODR-0009) show catalogue-authors-decide framing produces cross-modular asymmetry. Demand **module-owner-proposes / catalogue-ratifies / module-veto**. Withdrawal condition primary.

**Synthesis adopts module-owner-proposes / catalogue-records / WG-disputes-only:**

- Profile pin proposals originate in the consuming module's Council session (e.g. ODR-0012 proposes `dpv-pd` slice; ODR-0010 proposes DASH-for-form-driving slice).
- The catalogue session records the pin in ODR-0002's row notes + Change Log row attributing to the consuming session.
- Module owners retain veto over pins affecting their shape graphs.
- Cross-module pin conflicts default to the **union** of consumer needs (Cagle's DASH-for-ODR-0010-form-driving + DASH-for-ODR-0013-identity-key example resolves as a single DASH entry with union pin).
- The OPDA WG ratifies only when modules cannot agree; otherwise the rule chain is module-proposes → catalogue-records → consumed.

**Vote: 9-0 ADOPT module-owner-proposes / catalogue-records / WG-disputes-only / cross-module-conflicts-default-to-union.** Cagle DA's withdrawal condition met.

**Cagle DA status:** **WITHDRAWN** — module-veto explicit; union-of-consumer-needs default; catalogue is the recording authority, not the proposing one.

### Q6 — W3C status citation per entry

**Positions** ([baker-pandit.md Q6](./session-002-vocabulary-catalogue/baker-pandit.md), [allemang-hendler.md Q6](./session-002-vocabulary-catalogue/allemang-hendler.md), [kendall-davis.md Q6](./session-002-vocabulary-catalogue/kendall-davis.md), [gandon-guizzardi.md Q6](./session-002-vocabulary-catalogue/gandon-guizzardi.md), [cagle-da.md Q6](./session-002-vocabulary-catalogue/cagle-da.md)):

- **Baker:** YES; add `W3C status` column with format `Rec 2014-04-25` / `Maintained: TopQuadrant` / `Community standard: w3id.org/dpv`.
- **Pandit:** Concur; DPV's `W3C Community Group Final Report 2024-06-04` belongs visible.
- **Allemang+Hendler:** Add `Authority status` column with four-part values (W3C Rec / CR/WD/Note / Community Standard maintainer / OMG-ISO).
- **Kendall+Davis:** Add `w3c-status` field; refresh in annual review (Q3 cadence).
- **Gandon+Guizzardi:** YES per ODR-0001 §Citation grounding (citation grounding requires named status).
- **Cagle (DA):** Demand three-part status field — **body** (W3C / OMG / W3C CG / community-maintained) + **status** (REC / WD / NOTE / CR / CG-Final-Report) + **last-updated date**.

**Vote: 9-0 ADD W3C status column** with Cagle's three-part format (body + status + date). Annual review cadence (Q3) refreshes.

**Cagle DA status:** **WITHDRAWN** — three-part status field adopted.

### Q7 — OWL-Time demotion trigger

**Positions** (see worker files Q7 in each):

- **Baker:** Demote to Defer if no module cites OWL-Time across Phase 3.
- **Allemang+Hendler:** Pair-joint — demotion requires zero downstream consumers AND no SHACL ref AND no external integration.
- **Kendall+Davis:** Twelve-month no-consumer demotion trigger; cite Session 001 Allemang/Davis dissent if vindicated.
- **Gandon+Guizzardi:** Named-consumer departure (symmetric to promotion).
- **Cagle (DA):** Four-part operational rule — Phase gate + surviving consumer test + published-Turtle audit + named voter.

**Synthesis adopts Cagle's four-part rule** (which subsumes Allemang+Hendler+Kendall+Davis):

1. Phase gate — end of Phase 3 (named gate in ODR-0003).
2. Surviving-consumer test — no module ODR's published Turtle uses OWL-Time terms (`time:Interval`, `time:Instant`, etc.).
3. Published-Turtle audit — Queen of the demotion session `grep`s the build output; result recorded in Change Log.
4. Named voter — Council session ratifies (Reduced Council acceptable); Change Log row attributes.

If two or three conditions met but not all four, conditions are evidentiary inputs to Council deliberation, not Boolean trigger. The Allemang/Davis Session 001 dissent ("await a concrete consumer") is the demotion-context citation if the demotion fires.

**Vote: 9-0 ADOPT four-part demotion trigger.**

**Cagle DA status:** **WITHDRAWN.**

### Q8 — DCAT gate condition

**Positions:**

- **Baker:** Confirm Conditional; DCAT shapes only when OPDA publishes a catalogue record.
- **Allemang+Hendler:** Confirm Conditional with publication trigger.
- **Kendall+Davis (Davis depth):** **Four-trigger Core-promotion gate** — (1) OPDA publishes `dcat:Dataset` to third-party catalogue (data.gov.uk / data.europa.eu / HMLR / etc.); (2) OPDA publishes its own catalogue endpoint; (3) consumer reads OPDA via DCAT discovery; (4) OPDA's ontology itself registered as `dcat:Dataset`. Any one fires promotion.
- **Gandon+Guizzardi:** Defer to governance-pair; Session 001 verdict (Conditional) sound.
- **Cagle (DA):** Demand destination + schema profile + consumer commitment named.

**Synthesis adopts Kendall+Davis's four-trigger gate** (which incorporates Cagle's named-destination demand by enumerating four specific destinations as triggers):

**DCAT promotes Conditional → Core when ANY of:**

1. OPDA publishes a `dcat:Dataset` record to any named third-party catalogue (data.gov.uk, data.europa.eu, HM Land Registry open-data portal, ONS, GOV.UK Open Data, data.world).
2. OPDA publishes its own catalogue endpoint (e.g. `https://opda.uk/catalogue/.well-known/dcat`).
3. A consuming application reads OPDA datasets via DCAT discovery (`dcat:Catalog` query).
4. The OPDA ontology itself is registered as a `dcat:Dataset` on an external catalogue (FAIR convention; FIBO precedent).

First trigger to fire promotes DCAT to Core with attribution to the gate event.

**Vote: 8-1 ADOPT four-trigger gate** (Gandon+Guizzardi defer counted as abstain on the gate specifics but concur with Conditional-confirmation).

**Cagle DA status:** **WITHDRAWN** — four named destinations + named consumer-commitment paths satisfy his three-part demand.

### Q9 — SSSOM re-open trigger

**Positions:**

- **Baker:** Tighten trigger — SSSOM moves Defer → Conditional when first external-vocabulary mapping table enters corpus (`skos:exactMatch` to non-OPDA vocabulary that is not just `dct:source` to a form question).
- **Allemang+Hendler:** Trigger fires when external dereferenceable target identified.
- **Kendall+Davis:** First external mapping work scoped (named candidates: FIBO, INSPIRE, HMLR, schema.org).
- **Gandon+Guizzardi:** External mapping work = activation; SSSOM mappings carry commitments that surface as `kind: pattern` work at the module level when SSSOM activates.
- **Cagle (DA):** Demand named external vocabulary + named consumer + named Council session trigger, OR promotion to Conditional with mapping-records-only profile-pin (his preferred reframe). Withdrawal condition primary.

**Synthesis adopts named-event trigger** (combining Baker's Boolean event + Kendall+Davis's named candidates + Cagle's named-Council-session escalation):

SSSOM moves Defer → Conditional (with `profile-pin: mapping-records-only` per Q5 mechanism) when **all three** hold:

1. **Named external vocabulary** mapping is being authored (one of: FIBO, INSPIRE, HMLR RDF, ESCO, ISO 3166, or another vocabulary added by name).
2. **Named consumer** for the mapping exists (e.g. property-register-alignment service consuming HMLR; Plot-Linker consuming INSPIRE).
3. **Named Council session** triggers the re-evaluation (a Session 002b or equivalent author-only / Reduced Council records the activation).

The Cagle S001 dissent (≈5-4 SSSOM Defer; recorded in ODR-0002 Change Log row 3) is preserved as live position; the trigger reframe addresses his operational-check concern without forcing immediate promotion.

**Vote: 9-0 ADOPT named-event trigger.**

**Cagle DA status:** **WITHDRAWN** — named-event trigger meets the second branch of his withdrawal condition (named vocabulary + named consumer + named Council session).

### Q10 — ODRL policy-authoring activation trigger

**Positions:**

- **Baker:** ODR-0012 Q4 owns; trigger is consent instances entering corpus. Routing settled per §4.1.
- **Allemang+Hendler:** Trigger fires at Phase 2 (consent receipts / data-rights instances); ODR-0012 inherits.
- **Kendall+Davis:** **Dual trigger** — consent instances OR regulator-named ODRL.
- **Gandon+Guizzardi:** Defer to governance-pair; Session 001 verdict (vocabulary admitted; policy-authoring deferred) sound.
- **Cagle (DA):** Three named events — (Event 1) ODR-0012 authors consent-receipt instance in published Turtle; (Event 2) ODR-0009 authors VC-tied policy instance; (Event 3) external policy-authoring consumer cites OPDA. Withdrawal condition: two or three named events.

**Synthesis adopts three-event activation** (Cagle's three + Kendall+Davis's regulator-named = effectively the same trigger set with overlap):

ODRL policy-authoring activates when ANY of:

1. ODR-0012 (Data Governance) authors a consent-receipt instance in published Turtle (not plan-stage prose).
2. ODR-0009 (Claims) authors a Verifiable Credential-tied policy instance (`cred:VerifiableCredential` with `odrl:Policy` attached).
3. An external policy-authoring consumer (data licensor, consent-receipt service, named regulator — FCA / ICO / EU regulatory technical standards / UK MEES guidance) cites OPDA in their architecture documentation and requests ODRL-typed Turtle.

Activation Council session is named (Session 012b or an explicit activation amendment); ODR-0012 Q4 inherits the trigger and authors the policy work.

**Cross-reference to Q13** (per Cagle's procedural attack P2): consent-receipt instance is also a `cred:`/`did:` activation trigger (Q13). Coupled-trigger event activates both vocabularies; single Change Log row when fired.

**Vote: 9-0 ADOPT three-event activation; cross-reference Q13.**

**Cagle DA status:** **WITHDRAWN.**

### Q11 — OBO RO (adopt / defer / reject) — DEPTH; genuine pair-split

**Positions** (formal-pair carries the lead per [plan §4 Session 002 Q11](../../plan/council-followup-sessions.md)):

- **Baker:** Leans defer-not-adopt; `dct:isPartOf` + `opda:`-minted transitive predicates suffice for flat→block→estate.
- **Pandit:** Concur with Baker; not own area.
- **Allemang:** Defer-with-reason; biology-flavoured; `dct:isPartOf` covers.
- **Hendler:** Defer pending formal-pair verdict.
- **Kendall:** ADOPT if used in ≥2 modules; otherwise DEFER. Two-module test.
- **Davis:** Reject — biology-flavoured upper structure confuses property-data consumers.
- **Gandon (formal):** **DEFER** on LDP Principle 3 grounds — `ro:part-of` returns a graph rooted in biology, which is a Linked-Data violation of "useful information" for property-data consumers. Davis's S001 vote was the right call. Defer until named consumer requires its specific commitments and `dct:isPartOf` + `opda:` local predicates fail to reach them.
- **Guizzardi (formal):** **ADOPT CONDITIONAL** on well-founded-mereology grounds — `dct:isPartOf` is editorial-strength; OBO RO's `ro:part_of` carries commitments (transitivity, proper-vs-improper part, has-part inverse) that matter for ODR-0005's IC discipline over the flat→block→estate hard case when flat UPRN is absent. Re-alias under `opda:` with `owl:equivalentProperty` to preserve dereferenceability.
- **Cagle (DA):** Demand **diagnostic exemplar** where `dct:isPartOf` and `ro:partOf` produce different OPDA SPARQL query results; otherwise the choice is theology. Withdrawal condition: diagnostic exemplar OR Defer-with-named-re-open-trigger.

**Genuine pair-split honestly recorded in [gandon-guizzardi.md Q11](./session-002-vocabulary-catalogue/gandon-guizzardi.md).** Gandon leans DEFER; Guizzardi leans ADOPT CONDITIONAL. Pair's joint recommendation to the Queen: record the split; route adjudication to ODR-0005's follow-up session where IC discipline + diagnostic exemplars adjudicate.

**Synthesis adopts the formal-pair's joint recommendation** — DEFER at S002 (no operational exemplar yet); route to ODR-0005's follow-up session for adjudication; if adoption fires there, the H&M ONT-0071c re-alias pattern (canonical-URI reference with local SHACL; OBO RO predicates under `opda:` re-aliases with `owl:equivalentProperty`) applies.

**Re-open trigger:** an OPDA SPARQL query produces a wrong answer under `dct:isPartOf` that `ro:part-of` would correct — OR ODR-0005's IC discipline over the flat→block→estate hard case requires well-founded mereology that `dct:isPartOf` + `opda:` local predicates cannot satisfy.

**Vote: 5-2-2 DEFER** with named re-open trigger. (DEFER: Baker, Pandit, Allemang, Davis, Gandon = 5. ADOPT CONDITIONAL: Kendall, Guizzardi = 2. Abstain / defer-to-process: Hendler, Cagle DA = 2.)

**Cagle DA status:** **WITHDRAWN** — DEFER with named re-open trigger meets his second-branch withdrawal condition.

**Held-as-live positions** (per ODR-0001 §Session protocol rule 6 — dissent recorded verbatim):

- **Kendall:** "ADOPT if used in ≥2 modules; otherwise DEFER. The two-module test is the right discipline — one module's use can be solved with local `rdfs:subPropertyOf`; two modules' use needs the upper-level vocabulary."
- **Guizzardi:** "The Gandon objection conflates *naming surface* with *commitment content*. OBO RO is biology-named, but its *commitments* are well-founded mereology … `dct:isPartOf` is editorial-strength mereology; OBO RO's `ro:part_of` carries transitivity / proper-vs-improper / inverse cardinality commitments. … If OPDA reinvents OBO RO's commitments under `opda:` predicates without citing it, the discipline cost exceeds the dereference cost of citing the canonical vocabulary."

Both positions cited verbatim in the ODR-0005 follow-up session's input documents.

### Q12 — FOAF reason — DEPTH

**Positions:**

- **Baker:** Tighten existing Change Log row with explicit reason — kind-layer needs Person/Organisation distinction via W3C Org or `opda:` per ODR-0006; `prov:Agent` covers provenance-role surface.
- **Allemang+Hendler:** Dated Change Log row with verbatim reason.
- **Kendall+Davis:** Record `prov:Agent` thin / W3C Org preferred / FOAF shape-of-Web era; describe role-fit not deprecation.
- **Gandon+Guizzardi (depth):** **Two cited reasons** — (1) **Superseded by composition**: `prov:Agent` (PROV-O Rec 2013) + W3C Org Ontology (Reynolds 2014, W3C Rec) + `dct:` + `opda:Person`/`opda:Organisation` (ODR-0006) covers FOAF surface with UFO category commitments + ICs FOAF does not provide; (2) **Shape-of-the-Web era + Kind-level category mismatch**: FOAF's "Friend of a Friend" social-Web semantics (Brickley & Miller 2014, FOAF 0.99 spec) is a category mismatch for property-data trust framework (regulated conveyancers, lenders, AML-checked participants).
- **Cagle (DA):** Demand **deployment-fail citation OR public deployment that learned not to use FOAF OR explicit ODR-0006 substitute citation**. Withdrawal condition primary.

**Synthesis adopts the formal-pair's two-reason rule-out** — meeting Cagle's withdrawal condition (c) "explicit ODR-0006 substitute citation with the gap addressed". The formal-pair's reason (1) explicitly names the W3C Org Ontology substitute and the structured-name gap that `opda:Name` fills (ODR-0006). Reason (2) addresses Cagle's "shape-of-the-Web era" framing via the deployment record (FOAF is deployed in social Web / academic homepages / open-data publisher metadata — *not* in property-data trust frameworks; deployment fail and theoretical mismatch are the same fact at different levels).

**Change Log row text** (proposed for ODR-0002 amendment):

> | 2026-05-27 | [Session 002](./council/session-002-vocabulary-catalogue.md) Q12 | FOAF | Rule-out reason recorded. **(1) Superseded by composition**: `prov:Agent` (PROV-O Rec 2013) + W3C Org Ontology (Reynolds 2014, W3C Rec) + `dct:` (Core tier) + `opda:Person`/`opda:Organisation` (ODR-0006) covers the FOAF surface OPDA needs with UFO category commitments and ICs FOAF does not provide. **(2) Shape-of-the-Web era + Kind-level category mismatch**: FOAF's "Friend of a Friend" social-Web semantics (Brickley & Miller 2014, FOAF 0.99 spec) is a category mismatch for property-data trust framework (regulated conveyancers, lenders, AML-checked participants — not a social acquaintance network). Defer-row negative on FOAF stands; reason now cited in catalogue. |

**Vote: 9-0 ADOPT two-reason rule-out.**

**Cagle DA status:** **WITHDRAWN** (condition c — explicit ODR-0006 substitute citation).

### Q13 — `cred:` and `did:` admission to Defer

**Positions:**

- **Baker+Pandit:** Confirm Scope-Check 1 Q7c admission (8-1).
- **Allemang+Hendler:** Agree admission; Hendler sub-rule: **one-step-per-Change-Log-row** (no Defer → Core skipping; Conditional intermediate is the audit-trail discipline).
- **Kendall+Davis:** Confirm.
- **Gandon+Guizzardi:** Concur with Scope-Check 1 Q7c admission and ODR-0016 activation pointer.
- **Cagle (DA):** Light press on operationalising the third activation trigger ("real wallet/DID consumer enters scope" is vague; operationalise as "named wallet/DID consumer cites OPDA in architecture documentation OR requests `cred:`/`did:`-typed Turtle"). Conditional withdrawal.

**Synthesis confirms admission** and operationalises Cagle's third trigger refinement. ODR-0016 activation triggers (per [ODR-0002 Defer rows](../ODR-0002-ontology-language-adoption.md)):

1. Session-009 Q8 surfaces real VC-side decisions (operationally meaningful — Q8 is a specific question).
2. Session-012 Phase-2 consent receipts land (cross-references Q10 — coupled-trigger event per Cagle's procedural attack P2).
3. **A named wallet/DID consumer** (UK gov OneLogin; EU eIDAS 2.0 wallet provider; gov.uk Verify successor) cites OPDA in their architecture documentation OR requests `cred:`/`did:`-typed Turtle from OPDA's namespace.

Hendler's one-step-per-Change-Log-row sub-rule adopted as a sub-clause of Q3's tier-movement discipline (Defer → Conditional → Core; no skipping).

**Vote: 9-0 CONFIRM admission with third-trigger operationalisation + one-step-per-row sub-rule.**

**Cagle DA status:** **WITHDRAWN** (light withdrawal — third trigger operationalised).

## Synthesis

**Twelve questions land with full Cagle DA withdrawal**; one question (Q11 OBO RO) lands DEFER with the held-as-live Kendall and Guizzardi positions cited verbatim and routed to ODR-0005's follow-up. The catalogue's meta-discipline is now operational across the spine: enumerated promotion/demotion criteria (Q3); module-owner-proposes profile-pinning ownership (Q5); reference-not-import as default MUST with three-value `adoption-mode` field (Q4); W3C status three-part field (Q6); named-event triggers for OWL-Time demotion (Q7), DCAT promotion (Q8), SSSOM re-open (Q9), ODRL activation (Q10), and `cred:`/`did:` activation (Q13); two-reason FOAF rule-out citing ODR-0006 substitute (Q12); deferred OBO RO with named re-open trigger routed to ODR-0005 (Q11).

**Procedural attacks addressed:**

- **P1** (Cross-question Q4↔Q5 consistency): The `adoption-mode` field's `slice-import` value is the named import-style commitment for large vocabularies; the `profile-pin` field (Q2/Q5) records the slice; module-owner-proposes / catalogue-records owns the slice authorship. The two questions answer consistently.
- **P2** (Q10↔Q13 coupled triggers): Consent-receipt instance is a coupled trigger activating both ODRL (Q10) and `cred:`/`did:` (Q13). When fired, a single Change Log row records the event and notes both activations.
- **P3** (Q3 vs ODR-0001 §When to use the Council): Within-catalogue movement (Conditional → Core, Conditional → Defer) is Author-only-or-Reduced-Council per the annual review cadence; new-vocabulary admission is Reduced Council minimum. The promotion / demotion criteria explicitly distinguish.
- **P4** (ODR-0016 precedent for ODRL): The Q10 three-event activation trigger is in-line in ODR-0002's Change Log; no separate ODR-0017 needed (the panel consciously chose catalogue-row over named-deferred-ODR because the trigger is simpler than VC/DID's three-pathway activation).
- **P5** (A9-relaxed regime mis-application test): The synthesis surfaces no implicit `pattern`-level commitments in any catalogue admission. OWL-Time's interval semantics, `prov:Agent` semantics, DPV's PII tagging — all are recorded as artefact admissions; the `pattern`-level commitments they enable live in the consuming modules (ODR-0005, ODR-0009, ODR-0012). The A9 relaxation is correctly applied.

**Recorded dissents / partial alignment:**

- **Pandit's Q4 `dpv-pd` bundled-import divergence** — recorded as ODR-0012 implementation concern, not ODR-0002 amendment. The catalogue rule is `reference-only`; ODR-0012's session may author `slice-import` for `dpv-pd` when the lawful-basis class vocabulary surfaces.
- **Hendler's Q1 ODR-0014 retirement dissent** (preserved from Scope-Check 1 Q4) stays in plan §9; not re-litigated here. The audit-trail discipline he carries lives in the new `### Promotion and demotion criteria` subsection (named-voter Change Log row attribution).
- **Q11 OBO RO** — DEFER with Kendall + Guizzardi positions cited verbatim and routed to ODR-0005's follow-up session.

**Cagle DA withdrawal verification:**

| Q | Withdrawal condition | Status |
|---|---|---|
| Q1 | Q3 demotion procedure with named voter + audit-trail | WITHDRAWN |
| Q2 | Three-field metadata (version-pin / last-reviewed / consumer-cite) OR partial | PARTIAL WITHDRAW (W3C status + adoption-mode + profile-pin cover version-pin and consumer-cite via attribution; annual review covers last-reviewed) |
| Q3 | Enumerated promotion checklist + parallel demotion | WITHDRAWN |
| Q4 | Reference-not-import with three exception classes | WITHDRAWN |
| Q5 | Module-owner-proposes / catalogue-ratifies / module-veto | WITHDRAWN |
| Q6 | Three-part status field (body + status + date) | WITHDRAWN |
| Q7 | Four-part OWL-Time demotion trigger | WITHDRAWN |
| Q8 | Named destination + schema profile + consumer commitment | WITHDRAWN |
| Q9 | Conditional-with-profile-pin OR named-event trigger | WITHDRAWN |
| Q10 | Two named instance-authoring events | WITHDRAWN |
| Q11 | Diagnostic exemplar OR Defer with named re-open trigger | WITHDRAWN |
| Q12 | Deployment-fail citation OR ODR-0006 substitute citation | WITHDRAWN |
| Q13 | Third trigger operationalised | WITHDRAWN |

**Cagle (DA) withdrew on Q1, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13; partial-withdraw on Q2.** Recorded verbatim per ODR-0001 §Session protocol rule 6: *"Cagle DA withdrew on Q1, Q3–Q13, accepting the operational checks landed by the panel (enumerated promotion/demotion criteria; module-owner-proposes profile-pin ownership; three-value adoption-mode field; three-part W3C-status field; four-part demotion trigger for OWL-Time; named triggers for DCAT/SSSOM/ODRL/cred-did activation; ODR-0006 substitute for FOAF rule-out; DEFER with named re-open trigger for OBO RO). Partial-withdraw on Q2 (three-field demand partially met via W3C-status date component and Change Log attribution discipline)."*

**Termination-signal evaluation** (plan §5 signals 3–6, cumulative at session close):

- Signal 3 (no duplicate constraint authoring) — N/A (no ontology constraints).
- Signal 4 (≤3-ODR consumer-query traversal) — N/A.
- Signal 5 (ODR-0003 diff stops moving) — Phase 1 not yet open; expected.
- Signal 6 (PII never accretes silently) — DPV `slice-import` discipline (Pandit's divergence routed to ODR-0012) is the lever for this signal; the catalogue's `reference-only`-default + module-owner-proposes profile-pin discipline ensures PII tagging follows the property.

**Pilot retire-or-extend evaluation:** N/A — S002 is not a pilot (`consensus-mode: agent-fan-out`).

**Downstream record impact:**

- **ODR-0002** amended with new `## Rules` subsections (Promotion and demotion criteria; Profile-pinning ownership; Reference-not-import (normative); Adoption mode field) + new columns (W3C status; adoption-mode) on Conditional table + tightened FOAF Change Log row + new Change Log rows for Q7-Q13.
- **ODR-0002 status** stays `proposed` (per Scope-Check 1 Q4 retirement framing — the catalogue evolves through Change Log rows; `accepted` status fires when the consuming-module ODRs ratify the catalogue admissions they cite, per the bidirectional-update protocol of ODR-0003 §Status discipline). The plan's Phase 0 retains ODR-0002 in `proposed` for the duration of the ratification programme; S002 sets `council: session-002` to record this session's authority on the current revision.
- **ODR-0001** unchanged.
- **Adoption record** track-record row added for Session 002.
- **`odr-review` lint** specification (deferred per A9 amendment): add Lint 4 check that `kind: pattern | mapping` records carry UFO category + IC; this S002 amendment adds no new lint requirements since ODR-0002 is `kind: architecture` (relaxed).
- **Plan §4.1 shared-question routing** — Q9 SSSOM re-open trigger (now Session 002's named-event trigger) inherits to ODR-0011 (Enumeration Vocabularies — SKOS); Q10 ODRL activation trigger (three-event named) inherits to ODR-0012. These routing entries stay in plan §4.1; no edit needed.

**Open items for Session 002b** (Author-only follow-up, if triggered):

- Catalogue table column rewrites (W3C status + adoption-mode + profile-pin columns on Conditional table). Recorded as a Change Log row; the actual table-cell population fits in 002b or in the next routine ODR-0002 edit cycle.
- WG selection between MVP fast-path vs default sequence (per S003 Item 2) — recorded in 003b when WG decides; affects S002's annual review cadence.

## ODR-0002 amendment summary (applied to record)

The following amendments land in ODR-0002:

1. **Frontmatter:** `council: session-001` → `session-002`; `status: proposed` retained (per Scope-Check 1 Q4 framing).
2. **New `## Rules` subsections** inserted after `### Adoption pattern (applies to every Conditional entry)`:
   - `### Promotion and demotion criteria` (Q3 — four-condition promotion + asymmetric demotion + annual review).
   - `### Profile-pinning ownership` (Q5 — module-owner-proposes / catalogue-records / WG-disputes-only / cross-module-conflicts-default-to-union).
   - `### Reference-not-import (normative)` + `adoption-mode` field declaration (Q4 — three-value field).
3. **Conditional table** — new columns added (`W3C status`, `Adoption mode`, `Profile pin`). Existing rows backfilled per Baker's Amendment C cell values. (Detailed cell population deferred to Session 002b table-rewrite or routine edit cycle.)
4. **`## Change log`** — new rows for Session 002 codifying Q1, Q3, Q4, Q5, Q6 + per-question rows for Q7–Q13 (each absorbing former S014 amendments with operational triggers).
5. **FOAF Change Log row** tightened with the two-reason rule-out text (Q12).

## References

- [ODR-0002 — Ontology Languages and Vocabularies Adopted](../ODR-0002-ontology-language-adoption.md) (amended by this session).
- [ODR-0001 — Linked Data Council Methodology](../ODR-0001-linked-data-council-methodology.md) §What an ODR records (per-kind discipline) — A9 amendment (2026-05-27) confirming `kind: architecture` is the relaxed regime applied here.
- [ODR-0014 — Vocabulary Catalogue Amendments](../ODR-0014-vocabulary-catalogue-amendments.md) (retired; historical anchor for absorbed Q7–Q13).
- Position files (per ODR-0001 §Session protocol rule 9 — Queen composes, does not fabricate):
  - [baker-pandit.md](./session-002-vocabulary-catalogue/baker-pandit.md)
  - [allemang-hendler.md](./session-002-vocabulary-catalogue/allemang-hendler.md)
  - [kendall-davis.md](./session-002-vocabulary-catalogue/kendall-davis.md)
  - [gandon-guizzardi.md](./session-002-vocabulary-catalogue/gandon-guizzardi.md)
  - [cagle-da.md](./session-002-vocabulary-catalogue/cagle-da.md)
- [Session 001 transcript](./session-001-pdtf-schema-to-ontology.md) Q2 — every per-vocabulary dispute deliberated.
- [Scope-Check 1 transcript](./scope-check-1-programme.md) Q4 (retire 0014; Hendler dissent), Q7c (admit `cred:`/`did:`).
- [Council follow-up sessions plan](../../plan/council-followup-sessions.md) §4 Session 002 blueprint; §4.1 shared-question routing (Q9 SSSOM → ODR-0011; Q10 ODRL → ODR-0012); §5 Phase 0 sequence.
- [DCAP profile](../DCAP.md) — `kind` enum and §Frontmatter prose invoked by the synthesis.
- [OPDA adoption record §Track Record](./adoption.md#track-record) — updated by this session.
- **Cited grounding** (per ODR-0001 §Citation grounding): DCMI Abstract Model (Powell, Nilsson, Naeve, Johnston, Baker 2007); Singapore Framework (Nilsson, Baker, Johnston 2008); DCMI Namespace Policy (Baker, Bechhofer, Isaac, Miles 2013); DPV 2.0 §3 *Modules* (Pandit et al. 2024); *Semantic Web for the Working Ontologist* 3rd ed. Chs. 3, 8, 12 (Allemang, Hendler, Gandon 2020); W3C TAG "Cool URIs Don't Change" (2008); FIBO Methodology / Modelling Team Process; BBC `/programmes/` ontology (2009); data.gov.uk linked-data cookbook §3; W3C Org Ontology Rec (Reynolds 2014); PROV-O Rec (Moreau et al. 2013); OBO RO (Smith, Ceusters, Klagges, Köhler, Kumar, Lomax, Mungall, Neuhaus, Rector, Rosse 2005, *Genome Biology* 6:R46); FOAF Vocabulary Specification 0.99 (Brickley & Miller 2014); Guizzardi 2005 *Ontological Foundations for Conceptual Modeling*; Linked Data Principles (Berners-Lee 2006; Heath & Bizer 2011 Chs. 2, 6).
