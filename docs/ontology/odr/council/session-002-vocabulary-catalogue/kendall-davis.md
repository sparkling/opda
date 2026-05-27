# Kendall + Davis — Enterprise-pair position on S002

**Teammate:** `enterprise-pair` (Elisa Kendall — OMG / EDM Council, FIBO methodology; Ian Davis — BBC `/programmes/` ontology, data.gov.uk, ex-Talis)
**Session:** 002 — Vocabulary Catalogue Adoption (Full Council on ODR-0002, `kind: architecture`)
**Posture:** Ratify the catalogue as 80% settled. Codify the discipline. Two depth questions where this pair leads: **Q4 (reference-not-import)** Kendall-owned; **Q8 (DCAT gate)** Davis-owned. Pair voice also load-bearing on **Q1 (tier cut)**.

## Pair summary

The catalogue is structurally sound — three tiers map onto FIBO's Production/Development/Informative distinction at OPDA's current scale. Where it must harden: **(i)** reference-not-import becomes the *default* discipline for every Conditional entry (currently honour-system; this is the FIBO move); **(ii)** Conditional → Core promotion requires a *named active consumer* and a SHACL gate, not editorial drift; **(iii)** profile-pinning is an artefact-engineering decision (per ODR-0001 A9) owned by catalogue authors with WG ratification; **(iv)** demotion criteria are written, not implicit. Pair diverges on Q1 fourth-tier need (Kendall: no — sharpen Conditional criteria; Davis: no — "deprecated" is a status not a tier) and Q8 depth (Davis: revisit S001 — DCAT-to-Core gate is now within sight; Kendall: hold Conditional until the gate fires). On the absorbed S001 amendments (Q7/Q11/Q12/Q13) the pair endorses Baker's session-001 outcomes with minor sharpening.

## Per-question positions

### Q1 — Three-tier vs fourth tier

**Kendall:** Hold three tiers. FIBO uses four — Production / Development / Informative / Provisional — but FIBO carries ~250 modules across 11 release rolls; the third axis is a graduation pathway, not a tier. OPDA's surface (8 Core + 9 Conditional + 9 Defer = 26 entries) sits below the threshold where a fourth tier earns its keep. The right tightening is *sharper Conditional criteria* (see Q3): a "deprecated" or "under-review" axis is a status field, not a tier. *Reference: FIBO Methodology, Modelling Team Process v2 — tier graduation governed by SHACL Production-profile pass + active-consumer test, not by tier proliferation.*

**Davis:** Concur on three tiers, different reasoning. Three tiers map onto a single binary publish-decision per entry: Core entries appear in every ontology header; Conditional entries appear where a use case fires; Defer entries are documented non-adoptions. A fourth tier dilutes the publish-decision into a triage exercise. "Deprecated" is a *status* on a row, not a column on the table — and per ODR-0002's current `## Change log`, deprecation lives in change-log rows already. *Reference: BBC `/programmes/` ontology — flat status model; data.gov.uk linked-data cookbook — minimal taxonomies survive contact with publication.*

**Pair vote:** 2-0 HOLD three tiers.

### Q2 — Per-entry metadata fields

**Kendall:** Current fields (canonical URI, prefix, role, adoption pattern reference) are the minimum sufficient set for the Core and Defer tiers. Conditional tier needs **one addition: a `profile-pin` field** when the entry adopts a *slice* of a vocabulary (DPV, FIBO, ArchiMate). The profile slice is the substantive commitment; recording only the canonical URI under-specifies what was adopted. *Reference: FIBO modules pin against named release-rolls (e.g. FIBO 2024Q3-Production); profile-pinning is the same discipline applied to non-FIBO vocabularies adopted as Conditional.* `version-pin` for the whole vocabulary (separate from profile-pin) belongs in the Core tier only where explicitly versioned (RDF 1.2, SHACL 1.2 — already present).

**Davis:** Concur on the minimum-sufficient instinct. Push back gently on profile-pin universality — for vocabularies where the *whole* vocabulary is admitted (DASH, VANN, OWL-Time, Dublin Core), the field is empty noise. Make profile-pin **conditional on the row** (present when adopting a slice; absent when adopting the whole). Otherwise the table grows columns with `n/a` in two-thirds of the cells. *Reference: data.gov.uk dataset catalogue — only fields with content carry meaning.*

**Pair vote on Q2:** 2-0 ADD `profile-pin` as a conditional field (present only when slice is adopted); reject `version-pin` as a universal column.

### Q3 — Promotion / demotion criteria

**Kendall:** FIBO's discipline: a module is Production-tier when **(a)** it passes the FIBO Production reasoning profile validation (SHACL gate equivalent) **and (b)** it has a named active consumer that would break under its retraction. Apply the analogue here: **Conditional → Core promotion requires (i) a SHACL gate written for the vocabulary's OPDA usage, (ii) a named active consumer in at least one OPDA layer (Foundation / Property / Transactions / Claims / Governance / Validation), and (iii) the consumer's break-test recorded.** Editorial drift is *not* a promotion path. **Demotion (Core → Conditional → Defer) requires (i) two consecutive Council reviews with no new consumer, (ii) explicit recorded reason, (iii) consumer-impact assessment.**

**Davis:** Concur on the *shape* of the criteria. Push back on the review cadence: **time-box the review schedule — annual is enough.** A vocabulary the project has not used in twelve months has answered the question. Don't run a six-question Council each year on a tier table that has not moved — the annual review is an author-only amendment with a one-paragraph rationale per moved row; only contested rows trigger Reduced Council. *Reference: data.gov.uk catalogue maintenance — annual rolling review of dataset metadata schemas; only contested changes escalated.*

**Pair vote on Q3:** 2-0 ADOPT: Conditional → Core = SHACL gate + named consumer + break-test (Kendall criteria); annual author-only review with Reduced Council escalation for contested rows (Davis cadence).

### Q4 — Reference-not-import discipline — KENDALL DEPTH

**Kendall (lead):** This is where the catalogue must harden most. The current text (ODR-0002 §"Adoption pattern" item 3 — "No `owl:imports`; reference by URI only") is the *right* discipline but is buried as one of five adoption-pattern items, applied honour-system, and not yet propagated as the *default* for every Conditional row.

The case from FIBO: `fibo-fnd-utl-av` (Foundations / Utilities / Annotation Vocabulary) references `dct:` terms — `dct:title`, `dct:contributor`, `dct:hasFormat` — by canonical URI, *without* `owl:imports <http://purl.org/dc/terms/>`. This is deliberate. Importing Dublin Core would (a) drag the full DCMI ontology into every consuming module's reasoner; (b) bind FIBO to whichever DCMI version was current at import time; (c) couple FIBO's release cadence to DCMI's. The discipline is: *we commit to the canonical URI, we write our own local SHACL constraints on its usage, we let external consumers fetch the upstream ontology themselves if their reasoner needs it.* This is the FIBO Production-profile contract.

My Session 001 Q2 amendment carved this discipline out for DPV explicitly — *"DPV being referenced not imported"* (Q2 transcript, kendall-davis.md L25). That carve-out should generalise. **Concrete proposal for ODR-0002 §Rules:**

> **Rule (amended adoption pattern).** Every Conditional-tier entry adopts by reference-not-import as the default. The catalogue row MUST declare its adoption mode in a new `adoption-mode` field with one of three values:
>
> - `reference-only` (default) — canonical URI used in OPDA ontologies; no `owl:imports`; local SHACL constraints written in the consuming OPDA layer. External consumers fetch the upstream vocabulary themselves.
> - `slice-import` — a *named* profile slice (per Q5 profile-pin) of the vocabulary is imported via `owl:imports` of the slice URI, not the whole vocabulary. Used only where the slice is small and the reasoner needs the axioms.
> - `full-import` — `owl:imports` of the whole vocabulary. Reserved for the Core tier only; requires a recorded use case that the slice-import discipline cannot satisfy.
>
> A row MUST justify any choice other than `reference-only` with a one-line rationale in the row's `notes` column. The Council session that authored the choice attributes via `## Change log`.

This is **not new ground** — it is codifying what FIBO has practised for fifteen years and what every modern vocabulary catalogue (DCMI Terms, schema.org, PROV-O itself) has converged on. The cost of writing the rule explicitly is one column; the cost of *not* writing it is that a future modeller will reach for `owl:imports` on a 300-class DPV vocabulary and silently couple the OPDA reasoner's start-up time to DPV's release cadence.

**Davis (concur with caveat):** Endorsed. The rule is right. My only addition is on the *enforcement* end: reference-not-import is honour-system until SHACL gates land. The plan's existing pointer to `docs/governance/deferred-work` is the right home; the catalogue should not try to enforce what it can only document. *Reference: BBC `/programmes/` adoption pattern — references DCMI, FOAF, MO, Geonames by canonical URI; imports none of them; consumers (`/programmes/<pid>.rdf` etc.) resolve upstream themselves.*

**Pair vote on Q4:** 2-0 ADOPT reference-not-import as default for every Conditional entry; codify via `adoption-mode` field.

### Q5 — Profile-pinning ownership

**Kendall:** Catalogue authors *propose* the profile slice; module owners *ratify* against their layer's needs. The slice choice is an **artefact-engineering decision** per ODR-0001 A9 (`kind: architecture` discipline) — it is about which axioms cross the OPDA boundary, not about what kinds of entities the domain contains. So the decision lives in this catalogue's `## Change log` once ratified by the consuming module's Council session. Concretely: if ODR-0012 (Data Governance) adopts DPV's `dpv-pd:` slice for personal-data tagging, S012 ratifies the slice; ODR-0002 records it as a `profile-pin: dpv-pd@v2.0` row with attribution to S012.

**Davis:** **Keep the WG out of it where possible.** Profile-pinning is editorial; if the catalogue authors and the consuming session agree, that is sufficient. WG ratification fires only when the slice changes binding semantics for a downstream publication. Don't bureaucratise a row in a table. *Reference: data.gov.uk linked-data cookbook — vocabulary profile selection delegated to dataset publishers, not central WG.*

**Pair divergence:** Kendall wants the Council session that consumes the slice to ratify in transcript form (a few sentences). Davis wants the row update and a pointer to the consuming session — no ceremony. **Resolution proposal:** catalogue authors propose; consuming Council session records the choice in its synthesis (one paragraph); WG ratifies only on cross-layer disputes. This is closer to Davis but preserves the audit trail Kendall wants.

**Pair vote on Q5:** 2-0 ADOPT (resolution proposal): catalogue authors propose; consuming session records choice; WG ratifies disputes only.

### Q6 — W3C status citation per entry

**Davis (lead):** Yes — pin each entry's W3C status (Recommendation / Candidate Recommendation / Working Draft / Note / community-maintained / OMG-spec) at the *date of admission*. Authority-grounded admission means citing the authority's status, not the prefix string. ODR-0002 currently has this *implicit* (Core tier all-Rec; OWL-Time noted as "W3C Rec 2020" in the notes column) — make it explicit per row.

**Kendall (concur with caveat):** Endorsed. The caveat: **status changes**. DCAT 3 was a Working Draft when this catalogue was first drafted; it is a Recommendation now. The annual review (Q3) is the right home for the status-refresh discipline. Don't build status-watching machinery — the annual review reads the current W3C status page and updates rows. *Reference: FIBO Modelling Team Process — version-pin discipline includes upstream-status refresh on each release roll.*

**Pair vote on Q6:** 2-0 ADD `w3c-status` field per entry, set at admission date; refreshed in the annual review.

### Q7 — OWL-Time demotion trigger

**Davis:** Demotion trigger: **no active consumer in PROV-O / proprietorship / lease layers within twelve months of adoption.** OWL-Time was promoted from Defer to active-adopted-Conditional on coherence grounds (PROV-O instants without OWL-Time intervals is incoherent — Session 001 Q2). If twelve months pass and no `time:Interval` is asserted in any OPDA module (ODR-0007 transactions, ODR-0005 proprietorship, ODR-0009 claims-validity), the coherence argument has not produced its consumer — demote.

**Kendall:** Concur. Add: the demotion decision is recorded against the dissent that was overridden — Allemang/Davis's "await a concrete consumer" framing (Session 001 Q2). If no consumer materialises, their dissent is vindicated and the audit trail should say so.

**Pair vote on Q7:** 2-0 ADOPT twelve-month no-consumer demotion trigger; demotion record cites the Session 001 dissent.

### Q8 — DCAT gate condition — DAVIS DEPTH

**Davis (lead):** I revisit Session 001 Q2. I wanted DCAT Core; Baker held Conditional; the majority went with Baker. The argument I made then was: *every OPDA dataset should have a `dcat:Dataset` record on day one; that's the bare minimum for being findable* (Session 001 Q2, kendall-davis.md L103). That argument has not weakened.

The gate condition the session adopted ("ontology-as-published-dataset + reference data; not Core — no catalogue-publishing task this round") is *correct as a procedural argument and wrong as a strategic one*. ODR-0002 will live for years; the moment OPDA publishes its first dataset to **data.gov.uk** (UK), **data.europa.eu** (EU), the **HM Land Registry open-data portal**, or **OPDA's own catalogue endpoint**, DCAT becomes Core retroactively. The procedural framing makes us wait for a Council session to ratify the inevitable.

**Concrete proposal for the gate condition:** DCAT promotes to Core when **any** of the following is in scope:

1. **OPDA publishes a `dcat:Dataset` record** to any third-party catalogue (data.gov.uk, data.europa.eu, data.world, HM Land Registry, ONS, GOV.UK Open Data).
2. **OPDA publishes its own catalogue endpoint** (e.g. `https://opda.uk/catalogue/.well-known/dcat`).
3. **A consuming application reads OPDA datasets via DCAT discovery** (e.g. a property-data consumer queries `dcat:Catalog` for OPDA's datasets).

Each of these is a falsifiable, observable trigger. The first to fire promotes DCAT to Core with attribution to the gate event. *Reference: data.gov.uk linked-data cookbook §3 — DCAT is the publish-side baseline for UK open data; BBC `/programmes/` exposed `dcat:Dataset` records to enable discovery via data.gov.uk; UK Government Linked Data Working Group convention pre-DCAT (Talis-era) carried the same principle under sioc/foaf.*

**Kendall (concur with sharpening):** Endorsed. Sharpen the gate language: **OR**, not AND — any one trigger fires Core promotion; the others are confirming evidence. Add a *fourth* trigger: **the OPDA ontology itself is registered as a `dcat:Dataset` on an external catalogue** (FAIR-data convention; FIBO uses `dcat:Dataset` annotations on its release rolls). This closes the loop where OPDA's ontology *is* the first thing it publishes.

**Pair vote on Q8:** 2-0 ADOPT four-trigger Core-promotion gate (publish-to-third-party, own-endpoint, consumer-reads, ontology-itself-as-dataset); any one fires promotion.

### Q9 — SSSOM re-open trigger

**Kendall:** Concrete trigger: **first external mapping work begins.** Named candidates per Session 001: FIBO (financial counterparties on transactions), INSPIRE (cadastral parcels), HMLR RDF (title-register identifiers), schema.org (open-web publication). The trigger is *any* of these mapping efforts being scoped — not waiting for a complete mapping. SSSOM earns its keep on the *mapping process*; scope the trigger to the *start* of process, not its conclusion.

**Davis:** Concur. Add: the trigger fires as a *flag*, not an automatic admission — the Council session scoping the mapping work writes a one-paragraph "SSSOM activated for this mapping" note in its synthesis. SSSOM does not unilaterally promote; it gets used when the first mapping table is authored.

**Pair vote on Q9:** 2-0 ADOPT: re-open trigger = first external mapping work scoped (named candidates: FIBO, INSPIRE, HMLR, schema.org).

### Q10 — ODRL policy-authoring activation trigger

**Davis:** Trigger: **consent instances enter scope OR a regulator names ODRL in compliance guidance.** ODRL adoption was deferred at Session 001 on Guarino's correct argument that `Policy`/`Permission` bite only on instances. The trigger is the instance side: the moment OPDA's ABox includes consent records (Pandit's Phase-2 ambition, per ODR-0012 §4), ODRL TBox usage stops asserting nothing.

**Kendall:** Concur. Add the regulator-named-it trigger explicitly: if **FCA, ICO, EU regulatory technical standards, or UK MEES guidance** names ODRL as the policy-expression language for any property-data class, the trigger fires regardless of whether OPDA's own instance work has started. This is the *external dependency* path that catalogues like ours have to honour. *Reference: FIBO RegBOR (regulatory beneficial-ownership reporting) example — vocabulary adoption fires on regulatory naming, not internal use.*

**Pair vote on Q10:** 2-0 ADOPT dual trigger (consent instances OR regulator-named); first to fire activates policy-authoring per ODR-0012.

### Q11 — OBO RO (formal-pair leads; pair contributes briefly)

**Kendall:** I raised OBO RO at Session 001 Q2 for the transitive part-of relations on property aggregates (flat → block → estate). Reaffirm position: **ADOPT if used in ≥2 modules; otherwise DEFER.** Two-module test is the right discipline — one module's use can be solved with local `rdfs:subPropertyOf`; two modules' use needs the upper-level vocabulary. Session 001 had no consensus; this session can settle it once ODR-0005 (Property identity crux) lands.

**Davis:** Reject. Biology-flavoured upper structure confuses property-data consumers more than it helps. Use `dct:isPartOf` for the simple case (flat → block) and `opda:` local terms for the property-specific aggregation semantics. Importing OBO RO is over-engineering for a use case where a one-line RDFS subproperty would suffice.

**Pair divergence:** Genuine. Both positions are recorded; the formal-pair (Gandon + Guizzardi) carries the deliberation per the plan §5.1. Pair defers to formal-pair lead.

### Q12 — FOAF reason

**Kendall:** Record the reason in `## Change log` so the decision is auditable: **`prov:Agent` is deliberately thin** (no person/org distinction, no structured name), **W3C Org Ontology is the preferred Kind-layer choice** (richer organisational structure, foundation-respecting), and **FOAF's person/org distinction is shape-of-the-Web era** — designed for social-graph discovery, not for the structured agent modelling a transaction-data ontology needs. Session 001 Q2 briefly reopened the FOAF question (Guarino: `prov:Agent` is too thin); the reopen was on the right question (`prov:Agent` *is* too thin for the Kind layer) but the wrong answer (FOAF is not the right cure — W3C Org is). The Kind-layer choice is settled by ODR-0006; FOAF stays in Defer with this reason recorded.

**Davis:** Concur. Add: FOAF is not deprecated by W3C — it is community-maintained and active — so "not used" is not "wrong." The reason recorded should not slag off FOAF; it should say *which* role the Kind layer plays in OPDA's architecture (rich organisational modelling) and *why* W3C Org is the better fit for that role (structured organisational hierarchy, ROLE / SITE / POST classes). *Reference: BBC `/programmes/` used FOAF heavily for person/agent modelling in 2009; OPDA's surface is closer to FIBO `LegalEntity`-style modelling than to social-graph discovery — different role, different vocabulary.*

**Pair vote on Q12:** 2-0 RECORD FOAF reason per text above (Davis tone — describe role-fit, not deprecation).

### Q13 — `cred:` / `did:` confirmation

**Both:** Concur with Scope-Check 1 Q7c admission to Defer tier. Activation pointer to ODR-0016 is correct; the activation trigger (Session-009 Q8 reveals VC-side decisions OR Pandit's Phase 2 consent receipts land OR a wallet/DID consumer enters scope) is well-formed. No amendment.

**Pair vote on Q13:** 2-0 CONFIRM Scope-Check 1 admission and pointer.

## Proposed amendment text

Three concrete amendments to ODR-0002's `## Rules` from this pair's depth questions:

### Amendment 1 — Reference-not-import as default (Q4)

Insert new sub-section after `### Conditional — adopt where the use case is present`:

```markdown
### Adoption mode (applies to every Conditional entry)

Every Conditional-tier row declares an `adoption-mode`:

- `reference-only` (default) — canonical URI used in OPDA ontologies; no
  `owl:imports`; local SHACL constraints in the consuming OPDA layer.
- `slice-import` — named profile slice imported via `owl:imports` of the
  slice URI. Used only where the slice is small and the reasoner needs
  the axioms. Pair with `profile-pin` field (Q5).
- `full-import` — `owl:imports` of the whole vocabulary. Reserved for
  Core tier; requires recorded use case that slice-import cannot satisfy.

Choices other than `reference-only` justify in the row's `notes` column.
Attribution via `## Change log`.
```

### Amendment 2 — Promotion / demotion criteria (Q3)

Insert as new sub-section in `### Enforcement`:

```markdown
**Promotion criteria** — Conditional → Core requires:

1. A SHACL gate written for the vocabulary's OPDA usage (per ODR-0013).
2. A named active consumer in ≥1 OPDA layer.
3. The consumer's break-test recorded.

**Demotion criteria** — Core → Conditional → Defer requires:

1. Two consecutive Council reviews with no new consumer.
2. Explicit recorded reason.
3. Consumer-impact assessment.

**Review cadence** — annual author-only review of the catalogue; only
contested rows escalate to Reduced Council.
```

### Amendment 3 — Profile-pin and W3C-status fields (Q2 + Q5 + Q6)

Add columns to Conditional-tier table:

- `profile-pin` (optional) — present only where row adopts a slice; format `<vocabulary>@<release-tag>`.
- `w3c-status` (required) — set at admission date; refreshed in annual review.
- `adoption-mode` (required) — one of `reference-only` / `slice-import` / `full-import`.

## Replies to anticipated objections

### Cagle (DA) will attack [Q3 — too strict admission]

Cagle's likely line: "SHACL-gate-and-named-consumer raises the bar so high that no vocabulary will ever promote; the catalogue becomes frozen by procedural cost." **Reply:** That is the point. FIBO's Production-tier moves slowly *by design*. The cost of an ungrounded promotion is much higher than the cost of a vocabulary languishing in Conditional one cycle longer — promotion locks the term in every consuming layer's stable contract. The SHACL gate and named consumer are not paperwork; they are the operational proof that the vocabulary has earned its place. *Reference: FIBO Production reasoning profile — only modules passing the Production profile cross the gate; the bar's height is the discipline.*

### Cagle (DA) will attack [Q4 — reference-not-import as norm rather than option]

Cagle's likely line: "Reference-only loses the reasoner-side axioms; OPDA can't validate against DPV personal-data classification if the DPV axioms aren't imported. You're trading principled coupling for fake decoupling." **Reply:** Two-part. (a) Local SHACL is the validation surface — we constrain `dpv-pd:OfficialID` usage in OPDA's shapes graph; we don't need DPV's axioms in our reasoner. SHACL is closed-world over the data we have; the upstream ontology's axioms are for the reasoner consuming OPDA's output, not for us. (b) The `slice-import` mode exists precisely for the cases where a small set of axioms genuinely needs to be in the reasoner. The rule is `reference-only`-default-with-named-exceptions, not `reference-only`-uniform. The objection is right about edge cases and wrong about the norm. *Reference: FIBO Production-profile validation — local SHACL in consuming module; upstream axioms not loaded into the consumer's reasoner.*

### Cagle (DA) will attack [Q8 — DCAT promotion is opportunistic]

Cagle's likely line (on Davis's lead): "You're using catalogue admission to relitigate Session 001 — Baker held Conditional, Davis lost the vote, now Davis writes a gate that pre-commits the next promotion." **Reply (Davis):** I'm not relitigating the verdict — Conditional stands. I'm specifying the gate condition that the Conditional decision left implicit. The gate language *protects against* opportunism: it names four falsifiable triggers, any one of which fires promotion automatically. Without the gate, DCAT's promotion drifts forever ("maybe next session"); with the gate, it promotes when the trigger fires or stays Conditional when it doesn't. This is the *opposite* of opportunism — it is procedural pre-commitment, the discipline Davis has practised at BBC and data.gov.uk for fifteen years.

---

**Position file submitted:** Kendall + Davis, `enterprise-pair`, Session 002.

## Pair-vote summary (≤100 words)

The catalogue is structurally sound; the work is codification. Pair-vote drafts on the two depth questions:

- **Q4 (reference-not-import):** 2-0 ADOPT reference-not-import as default for every Conditional entry; introduce `adoption-mode` field with three values (`reference-only` / `slice-import` / `full-import`); reference-only is the default and the FIBO discipline; exceptions justified in row notes.
- **Q8 (DCAT gate):** 2-0 ADOPT four-trigger Core-promotion gate (publish-to-third-party catalogue / own-endpoint / consumer-reads-via-DCAT / ontology-itself-as-dataset); any one trigger fires promotion; specifies the gate Session 001 left implicit.

Pair divergence on Q1 (none — both hold three tiers), Q5 (recorded — Kendall wants consuming-session synthesis paragraph; Davis wants minimal ceremony; resolution: catalogue authors propose, consuming session records, WG ratifies disputes only), Q11 (genuine — Kendall ADOPT-if-2-modules; Davis REJECT-biology-flavoured; deferred to formal-pair lead).
