# Baker (Queen) + Pandit — Governance-pair position on S002

> **Pair voice.** Baker (Queen of this session — DCMI / Dublin Core Abstract Model / Singapore Framework / DCMI Usage Board) and Pandit (DPV — modular extension pattern; Phase-1 annotation / Phase-2 TBox debate carried from Session 001 Q2). Joint position where the pair concurs; attributed separately where Pandit's modular-DPV view diverges from Baker's catalogue-hygiene framing. Baker leads as Queen and bears the synthesis afterwards; this file is the pair's *position*, not the synthesis.

## Pair summary (≤120 words)

Three-tier Core / Conditional / Defer is the right cut and **stays**. `deprecated` is a change-log event, not a tier; `under-review` is the Defer tier under another name. Per-entry metadata is the minimum sufficient set; `version-pin` belongs *only* on entries with a known breaking-change story (RDF 1.2, SHACL 1.2 today) and is recorded in `## Consequences`, not a per-row column. Promotion / demotion criteria adopt the **DCMI Usage Board test** ("is this term necessary, and is the name right?"); we propose a written four-criterion test landing as a new `## Rules` sub-section. Reference-not-import is **already** in the Adoption pattern (point 3) — confirm; do not add a parallel rule. Profile-pinning is owned by the *consuming module's* Council session; the catalogue records the choice. W3C status: cite per entry. On absorbed Q7-Q13: OWL-Time ratify; DCAT confirm Conditional with publication gate; SSSOM external-mapping trigger named; ODRL activation trigger names ODR-0012 Q4 as owner; OBO RO **leans defer** with formal-pair leading; FOAF reason recorded; `cred:`/`did:` admission confirmed. **Pair disagreement:** Pandit dissents on Q4 — for PII-heavy modules he argues `dpv-pd` may need *bundled* import in addition to reference; Baker holds reference-only. Recorded.

## Per-question positions

### Q1 — Tier cut: is three tiers the right cut?

**Baker (Queen):** Three tiers is right. The Dublin Core Abstract Model (Powell, Nilsson, Naeve, Johnston, Baker 2007) treats *adoption status* as a binding between a Description Set Profile and a vocabulary; it has never carried a `deprecated` axis at the catalogue level because deprecation is a *term*-level event recorded in the term's `dcterms:isReplacedBy`, not a vocabulary-level tier. The Singapore Framework distinguishes the catalogue (the *what*) from usage guidelines (the *when*) — adding `deprecated` as a fourth tier conflates the two layers. The single-record DCMI catalogue precedent governs in place via a change log (cf. `dcterms` itself: deprecations like `dc:Agent` superseding `foaf:Agent` are recorded in the term metadata, not as a tier shift). **Verdict: keep three tiers. Deprecation lives in `## Change log` rows.**

**Pandit:** Concurring on three tiers. DPV's own modular discipline (`dpv:` core + `dpv-gdpr`, `dpv-pd`, `dpv-legal` extensions — see DPV 2.0 spec §3 *Modules*) settles deprecation inside the *extension* itself (e.g. when `dpv-gdpr:Article6` is succeeded), not as a tier on the catalogue that admits DPV. The catalogue records "we admit DPV"; the extension records "this term is replaced." Two layers, not one. **Concur.**

**Pair vote draft:** **9-0-0** (anticipating: Allemang/Hendler/Kendall/Cagle/Gandon/Guizzardi/Davis will all concur — three tiers carries broad authority precedent).

### Q2 — Per-entry metadata: minimum sufficient set, or is `version-pin` needed?

**Baker (Queen):** Current fields (canonical URI, prefix, role / adopt-for, notes) are the *minimum* the DC Abstract Model requires of a term-set reference: dereferenceable namespace, declared prefix, role-in-the-profile, and freeform context. The DCAP layered approach explicitly separates encoding-syntax decisions (version pinning, serialisation choices) from the application profile itself. **Verdict: keep the four columns.** `version-pin` is needed *only* where a breaking-version story has been declared — RDF 1.2 and SHACL 1.2 already carry their pins in the entry's `Vocabulary` field name. Adding a fifth column for two entries is column-cost-for-row-not-paid. The discipline already in `## Consequences` ("Pin versions explicitly in ODRs only where currently declared … When DPV / DCAT 3 / DASH undergo a breaking version change, raise a follow-up ODR") is the right home.

**Pandit:** Concur. DPV's discipline at w3id.org/dpv is unversioned namespace + versioned *release* (DPV 2.0, DPV 2.1) — pin lives in the release note, not the catalogue row. *Caveat for the council:* the DPV 1.0 → 2.0 migration broke `dpv:hasPurpose` to `dpv:hasPurposeAssignment` semantics; if OPDA depends on a pre-2.0 shape, a row note is appropriate. Today we do not.

**Pair vote draft:** **8-1-0** (Hendler likely pushes for `version-pin` column as a permanent audit-trail discipline; majority weights Singapore-Framework layering).

### Q3 — Promotion / demotion criteria

**Baker (Queen):** This is the load-bearing meta-discipline question, and the catalogue is currently *silent* on it. The DCMI Usage Board's test for admission to `dcterms:` — codified across roughly two decades of decisions — is the canonical model: **(1) Is the term necessary? (2) Is the name right? (3) Is the definition unambiguous? (4) Is it already provided by an admitted vocabulary?** I propose porting this verbatim into ODR-0002 as a new `### Promotion and demotion criteria` sub-section in `## Rules`.

**Promotion (Conditional → Core)** triggers — all four must hold:
1. **Necessity** — every layer/file in the corpus would reasonably use the term, not just one.
2. **No-duplication** — no Core entry already provides the semantics.
3. **Authority** — the term is W3C Rec (or maintained-community-standard equivalent — DCMI, OGC) and stable.
4. **Lived use** — the term has been adopted in ≥3 modules without ODR amendment.

**Demotion (Conditional → Defer)** triggers — either holds:
1. **Non-use for one full Phase** — no module has cited the term across an MVP-bearing Council phase.
2. **Superseded** — a Core entry now provides the semantics (DCAT depended on this for DCAT-AP).

**De-listing (Defer → out)** — the recurring-question protocol in `## Consequences` already handles this implicitly; codify: the Defer entry is *struck from the catalogue* only when (a) the W3C / maintainer formally withdraws the vocabulary, OR (b) the OPDA WG rules the vocabulary out by name (as FOAF has been). Otherwise the Defer entry persists indefinitely — the recurring-question record is the *value*, not a backlog item.

**Pandit:** Concur on the four-criterion test. DPV admission to OPDA's catalogue passes (1)–(4) trivially — its lived use in privacy-policy graphs across DPV-supported deployments (e.g. SPECIAL project, OpenGDPR) satisfies the lived-use bar. *Caveat:* "lived use in ≥3 modules" is an OPDA-specific test; for the catalogue-meta-discipline as it lands in ODR-0002, lived-use means "used in ≥3 layers of any adopting linked-data programme" — Baker's framing already accommodates this.

**Pair vote draft:** **7-2-0** (Cagle as DA will likely attack — "this is FIBO ceremony"; reply below).

### Q4 — Reference-not-import discipline: generalise as normative rule?

**Baker (Queen):** Already in `### Adoption pattern (applies to every Conditional entry)` point 3: "**No `owl:imports`** — reference by URI only; let external consumers fetch the upstream ontology themselves." It is normative by virtue of inclusion in the Adoption pattern, which `## Consequences` declares the modeller MUST follow. The Kendall amendment from session-001 Q2 for DPV is therefore not a *new* rule for OPDA — it is the Adoption pattern applied to a single entry, which the pattern already requires. **Verdict: confirm; no edit needed.** If the council wants to harden the language, change "No `owl:imports`" to "MUST NOT use `owl:imports`" — that is a markdown tightening, not a new rule.

**Pandit (DIVERGE):** Reference-not-import is right for *core* OPDA modules, but I record a dissent for the PII-heavy modules. For ODR-0012 Data-Governance, the consumer of `dpv-pd` is reading the *class hierarchy* (`dpv-pd:HealthData` is-a `dpv-pd:SpecialCategoryPersonalData` is-a `dpv:PersonalData`) — and reading it operationally, not just for annotation. The reference-only pattern forces the consumer to resolve the hierarchy at query time, which is acceptable for `dpv:` annotations but introduces an external-DNS dependency in the governance layer's *runtime* path. I argue ODR-0012 may need a bundled snapshot of `dpv-pd:` (canonical URI preserved; local materialised copy) as a Phase-1 implementation concern. This is *not* a catalogue-level deviation — the catalogue rule stays "reference, not import" — it is an ADR-level engineering concern that ODR-0012's session should record. **Recorded as my divergence; ODR-0002 unchanged.**

**Pair vote draft:** **9-0-0** on the rule itself (no change to ODR-0002). Pandit's divergence is an ODR-0012 concern, not an ODR-0002 amendment.

### Q5 — Profile-pinning: who owns the profile choice?

**Baker (Queen):** This is the question the catalogue most needs to clarify. The Singapore Framework is explicit: **the application profile is owned by the consumer** — the profile slice of DPV that PDTF uses is a PDTF-WG decision, not a DCMI-Usage-Board decision. The catalogue's role is to *admit the vocabulary* and *record the profile pointer*, not to author the profile.

Proposed rule (new `### Profile-pinning` sub-section in `## Rules`):

> When an admitted Conditional entry points at a *profile slice* of a large upstream vocabulary (DPV's `dpv-pd` slice; an eventual FIBO module slice; an ODRL Common Vocabulary slice), the **profile authoring is owned by the consuming module's Council session** (ODR-0012 for DPV profile; ODR-0009 for PROV-O qualified forms; etc.). The catalogue entry records *which* profile is in use and links to the authoring ODR. The catalogue does NOT author profile shape internally.

This separates governance (catalogue admits, module authors profile) and matches the DCMI's "DCAP-by-consumer" pattern.

**Pandit:** Concur. The DPV-PD slice that OPDA uses is exactly the slice ODR-0012 Q1 will fix ("which properties get DPV tags? Every PII-bearing property or a curated set?"). That belongs in ODR-0012, not in ODR-0002. The catalogue points; the module authors.

**Pair vote draft:** **8-1-0** (Cagle as DA may push for catalogue ownership of profile choice — "fragmentation across modules creates inconsistency"; reply below).

### Q6 — W3C status citation per entry: should we add it?

**Baker (Queen):** Yes — and at low cost. The catalogue's authority-grounded rule depends on the reader being able to verify W3C status without re-deriving it. Today an entry says "W3C Rec" only in *prose notes* for some entries (PROV-O, DCAT 3) and is silent for others (OWL-Time, SHACL 1.2 implied via the version number). DCMI's discipline on `dcterms:` admission cites W3C status by date in the namespace policy document; this is the W3C-Rec-equivalent practice. Proposed format:

| Vocabulary | Prefix | Canonical URI | W3C status | Role |

Where `W3C status` reads e.g. "Rec 2014-04-25" or "Rec 2020-11-19" or "Not-W3C: DCMI-Rec 2008" or "Maintained: TopQuadrant" or "Community standard: w3id.org/dpv". This is a one-row column-add; the data is already in `## References` for every entry implicitly.

**Pandit:** Concur. DPV's status is "W3C Community Group Final Report 2024-06-04" — not a Rec but a citable equivalent. The status column makes that visible at a glance.

**Pair vote draft:** **9-0-0** (low-cost, high-value — no plausible objection beyond column-noise, which the pair pre-empts).

### Q7 — OWL-Time: confirm actively-adopted Conditional disposition

**Baker (Queen):** Session 001 Q2 vote ≈6-3 carries. The change-log row already records the promotion. **Confirm. No further deliberation needed.** Demotion trigger I propose to add to the change-log row (one-line): "Demotion to Defer if no module cites OWL-Time across Phase 3 ratification" — i.e. if 005/007 both clear without an `time:ProperInterval` reference, the entry is over-admitted. The PROV-O-needs-OWL-Time-intervals coherence argument (Guizzardi/Gandon) is *anticipatory*; the trigger is *use*.

**Pandit:** Concur.

**Pair vote draft:** **8-1-0** (Allemang/Davis as session-001 dissenters may re-state "await a concrete consumer"; majority confirms).

### Q8 — DCAT: confirm Conditional with catalogue-publication gate

**Baker (Queen):** Confirm Conditional. The gate is: **DCAT shapes are written only when OPDA actually publishes a dataset catalogue record** (PDTF reference data; OPDA-published datasets). Until then, the entry is admitted-but-inert — modellers may reference DCAT classes for annotation but MUST NOT mint `dcat:Dataset` instances without an ODR cite. The Davis-wanted-Core position is sound *if* publication is imminent; today it is not. **Conditional stays.**

**Pandit:** Concur. DCAT 3 is a Rec; the admission is right. Publication-driven activation is right.

**Pair vote draft:** **8-1-0** (Davis may renew the promote-to-Core push; the existing change-log row already documents his position).

### Q9 — SSSOM: record re-open trigger (external mapping work)

**Baker (Queen):** The change-log row already names the trigger: "external mapping work activates SSSOM (FIBO, INSPIRE, HMLR RDF)." I propose to tighten the trigger to a *named event*: **SSSOM moves from Defer to Conditional when the first external-vocabulary mapping table enters the corpus** — concretely, when an `opda:` term lands with a `skos:exactMatch`/`skos:closeMatch` to a non-OPDA vocabulary that is not just `dct:source` to a form question. The Cagle dissent (recorded ≈5-4) is preserved; the trigger is the activation, not the dissent's reversal.

**Pandit:** Concur. Cross-vocabulary mapping with quantified justification (`sssom:mapping_justification`, `sssom:confidence`) is the specific value SSSOM adds over bare `skos:exactMatch`; admitting it without external mapping work is over-admission.

**Pair vote draft:** **8-1-0** (Cagle DA likely re-litigates; the trigger answer absorbs his concern by making the activation tractable).

### Q10 — ODRL: record exact policy-authoring activation trigger

**Baker (Queen):** Per Session 001 Q2 and the §4.1 routing table, **ODR-0012 Q4 owns this trigger answer**; ODR-0002 inherits. Concretely: ODRL policy-authoring activates when *consent instances* (DPV-tagged consent records, W3C VC consent receipts, or ODRL `odrl:Permission`/`odrl:Prohibition` instances) enter the corpus. The Guarino contradiction (ODRL bites on instances; TBox alone asserts nothing) is the load-bearing reason ODRL stays vocabulary-admitted-but-policy-deferred. The change-log row already routes the trigger to ODR-0012; **confirm**. ODR-0012 Q4's deliberation produces the operational trigger description; ODR-0002 cites it.

**Pandit:** Concur. The trigger lives in ODR-0012 because the *consequence* of activation (Phase-2 policy expression, consent receipts, lawful-basis-as-policy) is governance-layer work, not vocabulary-catalogue work.

**Pair vote draft:** **9-0-0** (no plausible objection — routing is settled).

### Q11 — OBO RO: ratify decision (adopt / defer / reject)

**Pair note — formal-pair (Gandon + Guizzardi) carries the lead on this question.** Our governance-pair voice is advisory.

**Baker (Queen):** I lean **defer-not-adopt**. OBO RO is a biology-domain ontology that has been ported to non-biology use, but `dct:isPartOf` plus `opda:`-minted transitive predicates is sufficient for the flat→block→estate part-whole reasoning the schema needs. The Davis position (session-001: "biology-flavoured; use `dct:isPartOf`") and the Kendall position ("ADD for transitive part-of") are both defensible; the catalogue's discipline argues for *defer* without ruling out — Defer tier explicitly admits "future modellers know the question has been asked." Adding OBO RO to Core or Conditional now requires a concrete consumer; adding it to Defer with the rationale Davis stated keeps the precedent reviewable.

**Pandit:** Concur with Baker's lean; not my area.

**Pair vote draft:** **5-3-1** (split — formal-pair carries; Kendall may push to adopt for FIBO-style transitive properties; Davis defers; Allemang sceptical; pair-governance defers).

### Q12 — FOAF: record reason in `## Change log`

**Baker (Queen):** The Defer table already states "superseded by `prov:Agent` + Dublin Core for our purposes" and the change-log row records the programme-wide rule-out (session-001 Q2, brief reopening, ruled out). The reason is therefore *already* auditable. I propose a one-line tightening of the existing change-log row to make the *specific* reason explicit:

> 2026-05-20 | Session 001 Q2 | FOAF | Briefly reopened; ruled out programme-wide. **Reason: kind-layer needs Person/Organisation distinction with structured names — provided by W3C Org Ontology (or bespoke `opda:`) per ODR-0006; `prov:Agent` covers the provenance-role surface FOAF would otherwise duplicate.** Defer-row negative on FOAF stands.

This makes the *why* surface-readable without requiring the reader to chase to ODR-0006.

**Pandit:** Concur.

**Pair vote draft:** **9-0-0** (tightening only; no substantive change).

### Q13 — `cred:` and `did:` admission to Defer

**Baker (Queen):** Scope-Check 1 Q7c admission stands (8-1). The change-log row already records the admission with vote and activation pointer to ODR-0016. The Defer entries cite W3C VCDM 2.0 and DID Core 1.0 with proper attribution. The Cagle defer-without-spawn dissent is on the *spawn*, not the *admission* — recorded in the Scope-Check 1 transcript. **Confirm admission; no edit needed.**

**Pandit:** Concur.

**Pair vote draft:** **9-0-0** (confirmation only).

## Proposed amendment text (concrete)

Where the pair's verdict requires ODR-0002 to change, the proposed markdown follows. The amendments land in this Session 002 transcript and are folded into ODR-0002's `## Rules` and `## Change log` by Baker as Queen on session close.

### Amendment A — new `### Promotion and demotion criteria` sub-section in `## Rules` (per Q3)

Insert after `### Adoption pattern (applies to every Conditional entry)` and before `### Enforcement`:

```markdown
### Promotion and demotion criteria

Adapted from the DCMI Usage Board admission test (Baker, Bechhofer, Isaac,
Miles 2013 — DCMI namespace policy). Four criteria, all of which must hold,
for any tier movement:

1. **Necessity.** Every layer/file in the corpus would reasonably use the
   term, not just one.
2. **No-duplication.** No Core entry already provides the semantics.
3. **Authority.** The term is W3C Rec or maintained-community-standard
   equivalent (DCMI, OGC, W3C Community Group Final Report) and stable.
4. **Lived use.** The term has been adopted in ≥3 modules (or layers, for
   adopting projects beyond OPDA) without ODR amendment.

**Conditional → Core** requires all four.

**Conditional → Defer** triggers — either holds:
- *Non-use for one full Phase* — no module has cited the term across an
  MVP-bearing Council phase.
- *Superseded* — a Core entry now provides the semantics.

**Defer → out (de-listing)** — either holds:
- The W3C / maintainer formally withdraws the vocabulary.
- The OPDA WG (or adopting project's governance per ODR-0001 §Adoption)
  rules the vocabulary out by name. FOAF is the existing exemplar.

Otherwise the Defer entry persists indefinitely — the recurring-question
record is the value, not a backlog item.
```

### Amendment B — new `### Profile-pinning` sub-section in `## Rules` (per Q5)

Insert immediately after Amendment A's sub-section:

```markdown
### Profile-pinning ownership

When an admitted Conditional entry points at a *profile slice* of a large
upstream vocabulary (DPV's `dpv-pd` slice; an eventual FIBO module slice;
an ODRL Common Vocabulary slice), **the profile authoring is owned by the
consuming module's Council session**, not by this catalogue. The catalogue
entry records:

- *Which* profile is in use (free-text in the entry's `Notes` column or a
  separate column if profile-pinning is multi-entry).
- A link to the authoring ODR (e.g. ODR-0012 for the DPV-PD slice; ODR-0009
  for PROV-O qualified forms).

The catalogue does NOT author profile shape internally. The Singapore
Framework's DCAP-by-consumer pattern (Nilsson, Baker, Johnston 2008) is
the precedent.
```

### Amendment C — add `W3C status` column to Core and Conditional tables (per Q6)

Header change in both tables (Core and Conditional):

```markdown
| Vocabulary | Prefix | Canonical URI | W3C status | Role / Adopt for | Notes (Conditional only) |
```

Cell values (representative — the Queen fills in the rest on synthesis):

- `RDF 1.2` → `Rec (draft) 2025-11`
- `RDF Schema` → `Rec 2014-02-25`
- `OWL 2` → `Rec 2012-12-11`
- `SHACL 1.2` → `Rec (WG drafting) 2026`
- `SKOS` → `Rec 2009-08-18`
- `Dublin Core Terms` → `DCMI-Rec 2020-01-20`
- `VANN` → `Not-W3C: vocab.org 2010-06`
- `DASH` → `Maintained: TopQuadrant 2024`
- `PROV-O` → `Rec 2013-04-30`
- `DCAT 3` → `Rec 2024-08-22`
- `OWL-Time` → `Rec 2020-11-19`
- `DPV` → `W3C Community Group Final Report 2024-06-04`
- `ODRL` → `Rec 2018-02-15`
- `SSSOM` → `Community standard: w3id.org/sssom 2023`
- `SEMAPV` → `Community standard: w3id.org/semapv 2023`

### Amendment D — tighten FOAF change-log row (per Q12)

Edit the existing row in `### Change log`:

```markdown
| 2026-05-20 | Session 001 Q2 | FOAF | Briefly reopened; **ruled out programme-wide**. **Reason: kind-layer needs Person/Organisation distinction with structured names — provided by W3C Org Ontology (or bespoke `opda:`) per ODR-0006; `prov:Agent` covers the provenance-role surface FOAF would otherwise duplicate.** Defer-row negative on FOAF stands. Kind-layer choice routed to [ODR-0006](./ODR-0006-agents-and-roles.md). |
```

### Amendment E — add Session 002 change-log row (umbrella for this session)

Append to `### Change log`:

```markdown
| 2026-05-27 | [Session 002](./council/session-002-vocabulary-catalogue.md) | Catalogue meta-discipline | (1) Three-tier cut confirmed (Q1). (2) Per-entry metadata confirmed; no `version-pin` column (Q2). (3) Promotion/demotion criteria added as new `### Promotion and demotion criteria` sub-section (Q3, DCMI-Usage-Board test). (4) Reference-not-import confirmed normative via Adoption pattern point 3 (Q4); Pandit's `dpv-pd` divergence routed to ODR-0012 implementation concern. (5) Profile-pinning ownership added as new `### Profile-pinning ownership` sub-section (Q5). (6) `W3C status` column added to Core and Conditional tables (Q6). |
| 2026-05-27 | Session 002 Q7 | OWL-Time | Actively-adopted Conditional disposition **confirmed**. Demotion trigger named: demote to Defer if no module cites OWL-Time across Phase 3 ratification. |
| 2026-05-27 | Session 002 Q8 | DCAT | Conditional **confirmed** with publication-driven gate: DCAT shapes are written only when OPDA publishes a dataset catalogue record. |
| 2026-05-27 | Session 002 Q9 | SSSOM / SEMAPV | Re-open trigger tightened: SSSOM moves Defer → Conditional when the first external-vocabulary mapping table enters the corpus (a non-`dct:source` `skos:exactMatch` to FIBO / INSPIRE / HMLR / etc.). |
| 2026-05-27 | Session 002 Q10 | ODRL | Policy-authoring activation trigger ownership confirmed in [ODR-0012](./ODR-0012-data-governance-layer.md) Q4; vocabulary catalogue inherits. |
| 2026-05-27 | Session 002 Q11 | OBO RO | Ratified as Defer (pair-governance leaning; formal-pair carried lead). `dct:isPartOf` + `opda:`-minted transitive predicates suffice; admit later if FIBO-style transitive part-of work materialises. |
| 2026-05-27 | Session 002 Q12 | FOAF | Change-log row tightened with explicit programme-wide rule-out reason (see edited row above). |
| 2026-05-27 | Session 002 Q13 | `cred:`, `did:` | Defer-tier admission **confirmed** with activation pointer to ODR-0016. |
```

(The exact wording is the Queen's prerogative on synthesis; this draft is the pair's proposal.)

## Replies to anticipated DA (Cagle) attacks

Cagle's DA brief is to **challenge admission criteria** — the pair is the load-bearing target. We anticipate three lines of attack:

### Cagle on Q3 promotion criteria — "FIBO ceremony imposed on a 16-row catalogue"

**Attack reconstructed:** "The DCMI-Usage-Board test was authored for a 70-term vocabulary that takes a year of deliberation to add one term. ODR-0002 has 16 rows and the corpus is in flight. Four criteria with `lived use in ≥3 modules` is bureaucratic overhead the catalogue does not need."

**Reply (Baker):** The criteria are *retrospective* triggers, not application gates. A modeller proposing a Conditional → Core promotion does not file an admission application; they cite the four criteria as a checklist in the amendment ODR (or in a Session 002b-style author-only). Today every Core entry would pass all four trivially — that is the point. The criteria become load-bearing exactly when the catalogue grows beyond the corpus's reach to deliberate per-entry (the H&M-precedent failure mode the corpus is built to avoid). Cost: zero rows changed today; positive value the first time a Conditional entry is proposed for promotion. Cagle's "no admission criteria, look at every entry case-by-case" is the failure mode the DCMI Usage Board was instituted to prevent.

**Reply (Pandit):** And the four criteria are *neutral* across vocabularies — they don't privilege DPV over ODRL or SHACL over SKOS. The DA's actual concern is that the test is biased toward W3C-Rec entries over community standards. Criterion 3 explicitly admits "maintained-community-standard equivalent" — DCMI, OGC, W3C Community Group Final Reports. DPV's WCG Final Report status passes criterion 3.

### Cagle on Q5 profile-pinning ownership — "fragmentation across modules"

**Attack reconstructed:** "If ODR-0012 owns the DPV profile and ODR-0009 owns the PROV-O qualified-form profile and ODR-0010 owns the SHACL profile, the catalogue becomes a thin pointer to N owning ODRs, and the reader has to chase to N records to know what's actually in the profile. Catalogue centralism is the value of having a catalogue at all."

**Reply (Baker):** This conflates *recording* with *authoring*. The catalogue records *which* profile is in use; the owning ODR authors the shape. A reader who wants the profile shape today reads the owning ODR — that's already true even without Amendment B because profile shape is not in ODR-0002. Amendment B makes the routing *visible*; it does not move the work. The Singapore Framework's DCAP-by-consumer pattern is the canonical answer: the catalogue is the *library*, the consuming application authors the *application profile*. Cagle's "centralism" is the alternative pattern (single-record DCAP) which would force OPDA to author every consumer's profile in ODR-0002 — a 600-line catalogue with no governance separation.

**Reply (Pandit):** And the alternative concentrates risk. If `dpv-pd` profile-pinning lives in ODR-0002, the next governance regulation (UK AI Act amendments, DPV 3.0) forces an ODR-0002 amendment with full Council ceremony. With Amendment B, it forces an ODR-0012 amendment with the right experts. That is *responsiveness*, not fragmentation.

### Cagle on Q11 OBO RO — "transitive part-of is the right tool; defer is foot-dragging"

**Attack reconstructed:** "Kendall is right. The flat→block→estate part-whole relation has formal transitivity that `dct:isPartOf` does not express. Admitting OBO RO to Conditional is correct; deferring is foot-dragging."

**Reply (Baker):** I share the formal-correctness instinct, but admission requires a *consumer*. Today ODR-0005 (the identity crux) treats flat/block/estate as a single class with `dct:isPartOf` references; no module has yet declared the transitive property as load-bearing. Promote `dct:isPartOf` plus an `opda:`-minted transitive predicate (an option the OPDA WG can choose without involving OBO RO) is sufficient for the part-whole closure ODR-0005 needs. If session 005 or 008 surfaces a use case that the `opda:` predicate cannot serve, the catalogue admits OBO RO at that point with full provenance — that is what the Defer tier is *for*. Defer-not-reject is the correct discipline.

**Reply (Pandit):** Not my area; concur with Baker.

**Reply (formal-pair lead, anticipated):** [Gandon/Guizzardi to write — pair-governance flags the question and yields the lead.]

## Queen-side procedural notes

(Baker only, as Queen — for synthesis preparation.)

**Expected consensus questions:** Q1 (tier cut), Q4 (reference-not-import — rule already in place), Q10 (ODRL routing), Q12 (FOAF tightening), Q13 (`cred:`/`did:` confirmation). I anticipate 8-1-0 or 9-0-0 across these five.

**Expected split questions:** Q3 (promotion criteria — Cagle will attack), Q5 (profile-pinning — Cagle will attack), Q11 (OBO RO — genuine split between Kendall-adopt and Davis-defer). I anticipate 6-3-0 or 7-2-0 on Q3 and Q5; the OBO RO split could be tighter (5-3-1 or 4-4-1).

**Worth pre-flighting before convening:** Pandit's `dpv-pd` bundled-import divergence on Q4 risks a Cagle ambush ("Pandit says reference isn't enough — Baker is wrong"). I'll pre-empt in synthesis by recording Pandit's divergence as an ODR-0012 implementation concern, not an ODR-0002 amendment. The catalogue-rule remains reference-only; the implementation question routes to ODR-0012.

**Amendment scope:** five amendments (A-E above) are within Author-only-amendment-of-architecture-record discipline per ODR-0001. None of them changes the tier of any entry; all are meta-discipline additions plus one column-add. ODR-0002 stays `proposed` until the consuming-module ODRs ratify (per the plan's Phase 0 sequencing).

**Citation-grounding readiness.** Baker's positions cite:

- *Dublin Core Abstract Model* (Powell, Nilsson, Naeve, Johnston, Baker 2007 — DCMI Recommendation 2007-06-04).
- *Singapore Framework for Dublin Core Application Profiles* (Nilsson, Baker, Johnston 2008 — DCMI Working Draft 2008-01-14).
- *DCMI Namespace Policy* (Baker, Bechhofer, Isaac, Miles 2013 — DCMI Recommendation).
- DCMI Usage Board minutes (publicly archived 2003–2024) for the four-criterion admission test precedent.
- `dcterms` namespace history for FOAF-supersession-via-`dc:Agent` precedent.

Pandit's positions cite:

- *Data Privacy Vocabulary 2.0* (Pandit, Polleres, Bos, Brennan, Bruegger et al. 2024 — W3C Community Group Final Report 2024-06-04), specifically §3 *Modules*.
- W3id.org/dpv release-note history for the DPV 1.0 → 2.0 `hasPurpose` → `hasPurposeAssignment` migration claim.
- DPV-PD specification (w3id.org/dpv/pd) for the `HealthData` ⊏ `SpecialCategoryPersonalData` ⊏ `PersonalData` hierarchy.
- The Session 001 Q2 transcript (this corpus) for the Phase-1 annotation / Phase-2 TBox dissent record.

All within ODR-0001 §Citation grounding standards. No source cited without a stable retrievable URL or named-document anchor.

**Pre-flight scope-check note (Queen).** ODR-0001 was just amended by Session A9 (2026-05-27): `kind: architecture` records are RELAXED on the UFO-meta-category / IC-over-hard-cases requirements. This is the load-bearing reason the pair's position does *not* propose a UFO category for any catalogue entry — ODR-0002 is artefact-engineering, not pattern-bearing. The discipline carried by this session is admission criteria, tier-movement triggers, and reference-not-import — *not* ontological commitments. The session correctly does not stray into pattern territory; where any deliberation surfaces a candidate ontological commitment (e.g. OBO RO's transitive part-of as identity-bearing rather than merely transitive), that surfaces as a route to a `pattern` ODR (likely ODR-0005 or a spawn) rather than an entry in this catalogue. The §When-to-use criterion "vocabulary catalogue admission, tier movement, or retirement decisions" is the right home for this session; the §When-NOT criterion "ontology design / class authoring" is correctly avoided.
