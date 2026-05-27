# Cagle (DA) — Position on S002

*Kurt Cagle, *The Ontologist* — SHACL practitioner, taxonomy design, AI-RDF integration. Devil's Advocate for Session 002 (ODR-0002 Vocabulary Catalogue Adoption, `kind: architecture`, A9-relaxed regime). Per ODR-0001 §Roles: attack first, withdraw or hold explicitly per question. Silent DA alignment is a methodology violation.*

## DA stance summary

A tier or trigger without an operational SHACL-style check is decoration. The catalogue's meta-discipline (Q1–Q6) is currently honour-system: a vocabulary sits in Conditional because Session 001 said so; a vocabulary leaves Conditional because... how, exactly? The Defer column says "revisit when X materialises" but names no operational signal that *fires* when X has in fact materialised. Ten downstream ODR sessions will admit, demote, and pin vocabularies against this catalogue; if admission discipline is soft now, tier movement becomes a Council-theatre formality where the verbal threshold drifts because no one can point to the check that says it has not been met. I attack from one consistent angle — *what is the operational check, and what fires when it fails?* — and I withdraw only where the panel produces such a check.

## Per-question DA attacks + withdrawal conditions

### Q1 — Tier cut (three vs four tiers)

**Attack.** Three tiers (Core / Conditional / Defer) is the H&M-precedent-driven floor, but the catalogue already exhibits a near-miss for a fourth tier: SSSOM sits in Defer, marked "Cagle dissent recorded (≈5-4)", with a re-open trigger named in the Change Log row 3. This is neither *defer* in the rejection sense (we have not closed the question; we are awaiting an event) nor *core* (we have not ratified it for general use) nor *conditional* (we have not admitted it within a scoped layer). It is **deprecated-pending-trigger** — a tier the catalogue is using without admitting to.

FIBO's catalogue has four explicit tiers (Production / Provisional / Development / Informative) for exactly this reason: a vocabulary whose status is "ratified-but-not-yet-active" needs a tier distinct from "rejected" so the audit trail of *why* it sits there persists. FIBO learned this from precisely the operational problem the OPDA catalogue is about to inherit: a `Provisional`-tier vocabulary is one the WG has examined and held, with a recorded dissent or split vote; a `Defer`-style "deprecated" tier (FIBO's term) is one explicitly out of scope. Conflating the two means a reviewer two years downstream cannot tell whether to expect the question to reopen.

The current Defer column collapses two distinct statuses:

- **"We considered it and said no"** — FOAF, BBO, ArchiMate. The question is closed. Future contributors who raise it are re-litigating settled ground. The Defer reason should cite the closing-out evidence.
- **"We considered it and said wait"** — SSSOM (with recorded dissent), OWL-Time pre-S001 (re-opened and adopted Conditional), ODRL policy-authoring (deferred but vocabulary admitted; an unusual hybrid), `cred:`/`did:` (admitted to Defer with named activation pointer). The question is held; the trigger is named; the audit obligation is to record when the trigger fires.

Those are different statuses with different demotion paths and different audit obligations. A fourth tier — call it **Pending** or **Provisional**, or even **Deprecated-Pending-Trigger** — would let the catalogue distinguish them. The Hendler dissent recorded in Scope-Check 1 Q4 ("every governance act stays permanently") gestures at the same concern: collapsing audit-trail-distinct events into one Defer column erodes the catalogue's ability to honour the audit trail.

**Operational check demanded.** The Conditional → Defer demotion path (and the symmetric Defer → Conditional re-promotion) MUST be auditable as a *flip event* — named Council session, named voter(s), named trigger satisfied, Change Log row. Honour-system demotion ("we just stopped using it") collapses the catalogue's purpose. A fourth tier is the cleaner answer; the demotion-audit-trail discipline is the floor.

**Withdrawal condition.** WITHDRAW IF Q3's demotion procedure produces an explicit Conditional → Defer audit-trail flip (named voter, named trigger evaluation, Change Log row schema includes a "demotion-from-tier" cell where applicable). PARTIAL WITHDRAW if a fourth tier is adopted (Pending / Provisional / Deprecated-Pending-Trigger). HOLD IF Q3 lands soft (Q3 only specifies promotion criteria with no demotion procedure, or demotion procedure is "Council deliberates" without an operational check).

### Q2 — Per-entry metadata fields

**Attack — soft fields exposed.** The proposed minimum is canonical URI / role / adoption pattern / profile-if-any. Three soft fields concern me.

First, **no `version-pin` field**. RDF 1.2 and SHACL 1.2 are pinned by name in prose only ("Pin versions explicitly in ODRs only where currently declared (RDF 1.2, SHACL 1.2)" — `## Consequences` row 4). When a vocabulary undergoes a breaking version change (DPV 2.x → 3.x; ODRL 2 → 3; DCAT 3 → 4; FIBO quarterly releases), the Change Log has no anchor to cite — the maintainer has to read prose, then check if the cited version still exists. A `version-pin` field with the version string (or "current" with explicit acceptance of breaking changes) makes this Boolean.

Second, **no `last-reviewed` field**. The rule "Defer tier is reviewable on a schedule (annual, or whenever a triggering use case arises)" in `## Enforcement` row 3 has no operational check that fires when the annual schedule slips. Twelve months pass; nobody reviews; the catalogue silently degrades. A `last-reviewed` field with a date enables a simple `odr-review` lint: any Defer entry with `last-reviewed` > 12 months triggers a warning.

Third — and this is the one the panel may skip — **no `consumer-cite` field**. The Conditional tier's defining property is "adopt where the use case is present". The catalogue does not record *which* OPDA module ODR is the use case for each Conditional entry. For DASH, the consumer is ODR-0010 (Overlay Profile Mechanism). For PROV-O, ODR-0009 (Claims). For DPV, ODR-0012 (Governance). These are knowable today; recording them in the catalogue means future readers (and lint tools) can verify the use case exists. If the consumer-cite is empty, the entry has slipped to honour-system Conditional.

**Operational check demanded.** Add three fields: `version-pin` (semver or "current"); `last-reviewed` (date); `consumer-cite` (which OPDA module ODR(s) consume this vocabulary). Alternatively, add an explicit `## Consequences` rule that breaking-version triggers an ODR for every Conditional entry — but that is a weaker check (prose, not field).

**Withdrawal condition.** WITHDRAW IF the catalogue commits to per-entry version pinning AND last-reviewed AND consumer-cite (three fields). PARTIAL WITHDRAW if version-pin only (the most load-bearing of the three). HOLD IF none land and the soft-field defect remains implicit.

### Q3 — Promotion / demotion criteria — DEPTH

**Attack — the most load-bearing.** The current catalogue admits vocabularies via Session-001 vote and the H&M `src/` survey. It does not specify *what signal causes a vocabulary to move tier*. The Defer column carries phrases like "Revisit when a concrete consumer materialises" — that is not a check; it is a wish. A concrete consumer is not a Boolean event the catalogue can evaluate. *Who* decides it has materialised? *When* does the question get re-asked? *What evidence is sufficient*? Without these, the catalogue is honour-system tiering — the same defect my Session 001 Q4 challenge to Guizzardi exposed for `owl:hasKey` ("a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation, what does yours *do*?"). Substitute: a Defer-tier entry with the phrase "Revisit when X" is inert for a maintainer whose record has the X. Mine produces a flip event with a named voter; what does yours *do*?

The operational checks I demand for `Conditional → Core` promotion (the highest-stakes move):

1. **Named consumer.** At least one OPDA module ODR cites the vocabulary in its `## Rules`, with the vocabulary's terms appearing in published Turtle that builds (not in plan-stage prose).
2. **Layer count.** The vocabulary is used in ≥N independent OPDA modules (suggest N=3) where N is justified against the H&M survey baseline.
3. **SHACL gate.** A SHACL gate enforcing the Conditional-layer scope has been published (per §Enforcement's existing reference to ADR-0147 R12 — but currently this is "honour-system until SHACL gates are written"; promotion to Core MUST clear this).
4. **Failure-mode test.** A diagnostic exemplar (per Session 001 Q1's amendment lineage) where *removing* the vocabulary causes a specific named test to fail, demonstrating the vocabulary is doing load-bearing work, not decorative annotation.

Symmetrically for `Conditional → Defer` (demotion): named Council session, named voter, evidence that ≥1 of the four promotion conditions has fallen (e.g., the named consumer has been retired; the SHACL gate has been removed; the diagnostic exemplar no longer requires the vocabulary).

**Operational check demanded.** All four. Without these, "promotion criteria" is honour-system.

**Withdrawal condition.** WITHDRAW IF Q3 lands with an enumerated promotion checklist (named consumer + layer count + SHACL gate + failure-mode test, or equivalent set with operational specificity) AND a parallel demotion checklist. HOLD IF Q3 lands with prose like "Council deliberates promotion when warranted" or "consensus signals readiness" — those are honour-system. **Held dissent text in that case:** "Cagle DA holds dissent on Q3 — promotion and demotion criteria are not operational. Withdrawal condition: enumerated promotion checklist with named consumer, layer count, SHACL gate, and failure-mode test (and symmetric demotion checklist) recorded in ODR-0002 `## Rules`."

### Q4 — Reference-not-import discipline — DEPTH

**Attack.** Reference-not-import is being framed as a generalisable default ("should it generalise to every Conditional entry?"). The current catalogue text in `## Rules > Adoption pattern` row 3 says simply "No `owl:imports` — reference by URI only; let external consumers fetch the upstream ontology themselves." That is operationally clean for the catalogue authors but operationally fragile for the consumers.

I push back on the generalisation. Reference-not-import is operationally correct for *most* Conditional entries — vocabularies whose terms are used as annotations, type assertions, or single-class hooks (DCAT 3 catalogue records; DPV personal-data flags on triples; PROV-O qualified attribution as a hook for assurance layer). The pattern works because the consumer's processor can dereference `prov:Agent` to fetch what they need, and the OPDA ontology never depends on the *internal* structure of the external vocabulary — only on the URI surface.

It is operationally *fragile* in three named cases:

1. **The vocabulary's class hierarchy is load-bearing.** Importing DPV's lawful-basis class vocabulary is structurally different from referencing `dpv:hasPersonalData` as an annotation property; the lawful-basis hierarchy (`dpv-gdpr:Art-6-1-a-Consent`, `dpv-gdpr:Art-6-1-b-Contract`, etc.) *means something operationally* — a SHACL shape constraining a property to `dpv-gdpr:LegalBasis` instances needs the hierarchy materialised, not referenced. Pandit's S001 dissent (TBox-expressible lawful-basis/consent/purpose class vocabulary, routed to ODR-0012) is exactly this case. Reference-with-stale-cache breaks `sh:class`-typed validation when the DPV release adds a new lawful-basis class OPDA's local copy has not refreshed.

2. **The vocabulary defines a controlled vocabulary consumed by `sh:in`.** ODR-0010 (Overlay Profile Mechanism) uses merged `sh:in` over enum unions; if any of those enums are sourced from an external vocabulary (mapping_justification values from SSSOM's `semapv:` vocabulary; `odrl:Action` values from ODRL's controlled list), reference-not-import means the SHACL processor cannot validate the `sh:in` membership without dereferencing on every validation run. That is a runtime cost and a runtime failure mode (network-dependent validation). Version-pin + import-with-local-cache is the operational answer.

3. **The vocabulary is a spec, not a reference.** SHACL itself; PROV-O for trust frameworks; OWL 2 (Core, not Conditional, but the principle applies). Specs have stability commitments — the SHACL 1.2 spec is a stable reference, and OPDA's local cache of `sh:` is the authoritative copy for SHACL processors that bundle the spec. The reference-not-import discipline is incoherent here because the consumer (the SHACL processor) bundles the spec; only the OPDA-authored shapes need fetching.

The current pattern presents reference-not-import as a default without naming these exception classes. That is the defect. ODR-0001 §"Rules" enforces `vann:` headers on every `owl:Ontology` and canonical URIs throughout — those are import-discipline rules implicit, not explicit.

**Operational check demanded.** Reference-not-import is the default *with documented exceptions* — specifically:

- (a) **Spec exception.** When the vocabulary is a spec referenced by the OPDA `## Rules` as authoritative (SHACL, OWL 2, RDF 1.2, the Core tier), the catalogue acknowledges spec-status and bundles by convention. Currently implicit in Core's "every OPDA linked-data file is expected to use it" framing; should be explicit.
- (b) **Enum exception.** When the vocabulary contributes a controlled vocabulary consumed by `sh:in`, the entry MUST also carry `version-pin` (Q2) AND `import-with-local-cache` is permitted. The H&M ADR-0147 R12 pattern (cited in §Enforcement) gates the layer; the cache pattern is the operational complement.
- (c) **Hierarchy exception.** When the vocabulary's class hierarchy is load-bearing on OPDA SHACL shapes (DPV lawful-basis; ODRL action hierarchy if activated; FIBO if ever activated), the entry MUST also carry a profile-pin (Q5) AND import-the-pinned-slice is permitted.

**Withdrawal condition.** WITHDRAW IF the catalogue's reference-not-import discipline is qualified as "default with documented exceptions" and the three exception classes (or equivalent enumerable set) are recorded in the Adoption Pattern section. HOLD IF reference-not-import is framed as universal — that promotes a pragmatic default to a foundational commitment, and the next ODR that needs to import a profile slice will have to break the rule, not amend it. The catalogue then exhibits the same pattern as Q1's near-miss-fourth-tier: an operational reality the catalogue refuses to admit.

### Q5 — Profile-pinning ownership — DEPTH

**Attack — cross-modular.** Profile-pinning is the right response to large vocabularies (DPV, FIBO if it ever activates, PROV-O extensions like the qualified-attribution layer). But *who chooses the profile slice* is the load-bearing question the blueprint reads as catalogue-owned: "the adoption pattern points at a profile slice. Who owns the profile choice?". The implicit answer in the catalogue's current framing is "the catalogue owner (Baker as Queen of S002)". I attack that framing on operational grounds.

Profile choices made in the catalogue affect module SHACL shapes downstream. Three concrete cases anchor the attack:

1. **DPV and ODR-0012.** ODR-0012 (Data-Governance Layer; Pandit owns) is the module that operationally consumes DPV. If S002 pins a DPV profile slice that excludes the lawful-basis class vocabulary (the recorded Pandit dissent from S001 — "lawful-basis / consent / purpose class vocabulary is a recorded Pandit dissent — TBox-expressible debate routed to ODR-0012"), Pandit's module is *locked out* of authoring `dpv-gdpr:LegalBasis`-typed shapes. The catalogue has constrained the module without the module's consent. The S001 dissent routing assumed ODR-0012 would author its own DPV scope; a catalogue pin forecloses that.

2. **DASH and ODR-0010 / ODR-0013.** ODR-0010 (Overlay Profile Mechanism; Knublauch owns) consumes DASH for SHACL UI hints — `dash:propertyRole`, `dash:viewer`, `dash:editor`. ODR-0013 (SHACL Validation & Severity; also Knublauch) consumes DASH for `dash:uniqueValueForClass` (the identity-key check that won S001 Q4 against `owl:hasKey`). If S002 pins DASH to "form-driving shapes only" (the current Conditional row's "Required only on shapes that drive form generation" framing), ODR-0013's use of `dash:uniqueValueForClass` for identity-key checks is outside the pin — but it is operationally load-bearing per S001 Q4. The catalogue's profile pin contradicts S001 Q4's verdict. The fix is either to expand the DASH pin or to delegate the pin scope to the consuming modules.

3. **PROV-O and ODR-0009.** Moreau owns PROV-O in ODR-0009. PROV-O's "qualified forms" (Gandon's S001 Q6 amendment — `prov:qualifiedAttribution` → `prov:Attribution` with `prov:hadRole`) are a profile slice of PROV-O. If S002 pins PROV-O to "PROV-O core" without the qualified-attribution layer, ODR-0009's Q6 verdict (qualified forms adopted) is contradicted by the catalogue.

The pattern: profile pinning in the catalogue without module-owner consent is catalogue authors deciding shape-graph topology downstream — a cross-cut violation analogous to the three-rule interface contract I authored for ODR-0010 ↔ ODR-0013 (Scope-Check 1 A6). That contract is module-to-module; the analogue here is catalogue-to-module, with the same operational asymmetry (the cited authority unilaterally constrains the citing authority).

**Operational check demanded.** Profile-pinning ownership MUST be **module owners with catalogue ratification**, not catalogue authors with module-owner-ratification. The module knows what its shape graph needs; the catalogue's job is to record and validate. Module veto right MUST be explicit: a profile pin lands in the catalogue *after* the consuming module's session has authored its `## Rules` declaring the profile slice it requires, not before. If multiple modules consume the same vocabulary with different profile needs (DASH for ODR-0010 form-driving AND ODR-0013 identity-key), the catalogue records the *union* of pinned slices, not the most restrictive.

**Withdrawal condition.** WITHDRAW IF Q5 lands with explicit delegation: profile-pin proposals originate in the module ODR's session; the catalogue session records and ratifies; module owners retain veto over pins affecting their shape graphs; cross-module pin conflicts default to the union of consumer needs. HOLD IF the catalogue authors profile pins without module-owner-veto. **Held dissent text:** "Cagle DA holds dissent on Q5 — profile-pinning ownership is inverted. Withdrawal condition: module owners propose profile pins in their ODR's session; catalogue records and ratifies after; module veto preserved; cross-module conflicts default to union-of-consumer-needs."

### Q6 — W3C status citation

**Attack — light but specific.** Citing W3C Recommendation date / status per entry is largely concurring: hardens the "authority-grounded" rule that ODR-0001 §Citation grounding enforces for *expert positions* and ought to enforce for *vocabulary admissions* too. The catalogue currently mixes W3C Recommendations (RDF 1.2, OWL 2, SKOS, PROV-O) with community standards (DPV — W3C DPVCG output; SSSOM — community spec hosted at w3id.org; SEMAPV — same) without distinguishing the authority floor. A maintainer reading the catalogue in two years cannot tell from the prose alone whether `dpv:` carries the same stability commitment as `rdf:`. The status field disambiguates.

The attack: status alone is insufficient. The catalogue must also cite *when* the Recommendation was last updated — DPV releases revisions, ODRL has minor updates, RDF 1.2 itself is new. Without dates, "W3C Recommendation" reads as eternal, but a Recommendation from 2014 has different review obligations to one from 2024. The H&M `src/` survey is a single-point-in-time snapshot; the catalogue inherits its currency without recording it.

**Operational check demanded.** Per-entry status field with three parts:

1. **Authority body** — W3C / OMG / W3C CG (Community Group output) / community-maintained (no formal authority).
2. **Status** — REC / WD / NOTE / CR / CG-Final-Report / community-maintained.
3. **Last-updated date** — the date the cited version was published, plus the date the catalogue last reviewed it.

**Withdrawal condition.** WITHDRAW IF Q6 lands with the three-part status field. HOLD IF it lands with body+status only — date is the field that matters for breaking-version triggers (Q2) and the annual review cadence (Q3 demotion).

### Q7 — OWL-Time demotion trigger

**Attack.** OWL-Time was actively-adopted by Session 001 Q2 (≈6-3 with the Allemang/Davis "await a concrete consumer" dissent — recorded in the Change Log row 1). The Session 001 decision was made on incoherence grounds: PROV-O instants without OWL-Time intervals is incoherent for proprietorship / lease / claim-validity intervals (Guizzardi/Gandon). That argument carried and adopted OWL-Time. Q7 asks the symmetric question: what demotes OWL-Time back to Defer if the incoherence argument loses its grip?

The Allemang/Davis dissent ("defer until a concrete consumer") is the demotion trigger waiting to be operationalised. If by end of Phase 2 no module ODR has authored Turtle that uses `time:Interval` or `time:Instant` — if the incoherence argument was theoretically sound but operationally unrealised — then the dissent's pragmatic objection has been borne out. The catalogue should be able to demote on that evidence without re-litigating the S001 vote.

**Operational check demanded.** Demotion trigger is the four-part operational rule:

1. **Phase gate.** End of Phase 2 (named gate in ODR-0003 phasing).
2. **Surviving consumer test.** No module ODR's published Turtle uses OWL-Time terms (`time:Interval`, `time:Instant`, `time:hasBeginning`, `time:hasEnd`, etc.) in the Turtle output of the build pipeline — not just in plan-stage prose.
3. **Published-Turtle audit.** Audit performed by Queen of the demotion session by `grep`-ing the build output; result recorded in the Change Log row.
4. **Named voter ratifying.** Council session ratifies demotion (Reduced Council acceptable); the Change Log row attributes the demotion to that session.

If two or three of the four conditions are met, the demotion is not automatic — the conditions are evidentiary inputs to a Council deliberation, not a Boolean trigger. The four-part rule prevents both honour-system demotion (no conditions cited) and over-mechanical demotion (Phase gate alone, with terms appearing in only one module).

**Withdrawal condition.** WITHDRAW IF the demotion trigger is the four-part operational rule. HOLD IF demotion trigger reads as "Council reviews on demand" — that is the same defect as Q3, scoped down to one vocabulary.

### Q8 — DCAT gate

**Attack.** Davis (S001) wanted Core; Baker held Conditional and won (recorded in Change Log row 2). Q8 confirms gate condition (catalogue publication). I attack both possible framings the panel may produce:

**If the panel revisits Core:** the operational test for Core is "every OPDA linked-data file is expected to use it" (current catalogue text). For DCAT, that means every TTL file is `dcat:Dataset`-typed. That is operationally false today: no module ODR mints `dcat:Dataset` instances; no module ODR's `## Rules` reference DCAT vocabulary; the only DCAT usage planned is reference-data catalogue records (a single consumer, not every-file usage). Core is the wrong tier; the panel's hold on Conditional is operationally correct.

**If the panel holds Conditional (the likely outcome):** the gate condition needs operational specificity. "Catalogue publication" is currently generic. The catalogue-publishing consumer is:

- **Destination.** Where does OPDA publish? data.gov.uk requires DCAT-AP-UK profile; data.europa.eu requires DCAT-AP EU profile; OPDA's own dereferenceable namespace (`opda.uk/ns/`) requires no profile. These are *different* commitments with different downstream obligations.
- **Schema profile.** DCAT 3 core vs DCAT-AP-UK vs DCAT-AP EU are different vocabularies with different mandatory fields. The catalogue admission is currently for DCAT 3 core; if the destination requires DCAT-AP-UK, the catalogue must either pin to DCAT-AP-UK or admit the profile as a separate row (with profile-pin per Q5).
- **Consumer commitment.** Who consumes OPDA's published DCAT records? A named consumer (UK government open-data team; data.europa.eu; an industry aggregator) anchors the gate. "Catalogue publication" with no named consumer is publishing-into-the-void; the gate has not been met.

**Operational check demanded.** Gate condition is **named destination + named schema profile + named consumer commitment**. All three. Without all three, "catalogue publication" is decoration that admits DCAT without admitting *to what*.

**Withdrawal condition.** WITHDRAW IF the gate names destination + schema profile + consumer commitment. HOLD IF gate stays generic. If the panel holds Core (unlikely), attack stays open and dissent stronger.

### Q9 — SSSOM re-open — YOUR S001 DISSENT REVISITED

**Attack — re-attacking my own loss.** My S001 Q2 dissent was recorded (≈5-4 — the closest vote of S001). The Change Log row 3 says SSSOM was "Deferred for internal overlay refs; use `dct:source` to form-question IRIs in the interim. SSSOM earns its place mapping to *external* vocabularies (FIBO, INSPIRE, HMLR RDF). **Cagle dissent recorded (≈5-4).** Re-open trigger (per Session 014's owner role): external mapping work activates SSSOM."

The re-open trigger language is exactly the vague trigger I attacked in Q3 — substitute SSSOM for the abstract case. *Who* decides external mapping work has activated? *When*? *Against what evidence*? "External mapping work activates SSSOM" is a tautology: it says "SSSOM activates when SSSOM activates". The trigger should name *a non-SSSOM event* (an OPDA module authoring a mapping to a named external vocabulary in published Turtle).

The honest re-frame: SSSOM should be **Conditional with profile-pinning to mapping records only**, not Defer-with-vague-trigger. The pin says: SSSOM admitted only where a mapping record is being authored (e.g., ODR-0011 enumeration vocabularies mapping to external SKOS schemes via `skos:exactMatch`; ODR-0009 evidence-type mapping to FIBO equivalents if FIBO ever activates; ODR-0015 Address mapping to INSPIRE Addresses). Outside the mapping-records scope, SSSOM is not used (so my S001 opponents — Gandon, Knublauch — get the bound they wanted: `dct:source` remains the answer for single-source internal refs). That is operationally identical to my S001 position but framed as Conditional-with-profile-pin (per Q5's mechanism if Q5 lands well) rather than rejected-as-Defer.

The framing benefit: a Conditional-with-pin entry has a known scope; the catalogue's reviewer can verify whether the pinned scope is being honoured. A Defer-with-vague-trigger entry is honour-system — the maintainer cannot tell whether the trigger has been met.

If the panel insists on Defer, the re-open trigger MUST be operationally specific:

1. **A named external vocabulary mapping is being authored** in a specific OPDA module ODR (not "external mapping work in general"). The named external vocabulary is one of: FIBO, INSPIRE, HMLR RDF, ESCO, ISO 3166. Other external vocabularies admit a separate trigger evaluation.
2. **The mapping has a named consumer** (e.g., HMLR RDF consumed by a property-register-alignment service; INSPIRE Addresses consumed by a Plot-Linker; FIBO Property Records consumed by a regulator's cross-reference service).
3. **Council session triggers** the re-evaluation; no implicit re-activation by a single module's session-internal verdict. The re-evaluation session is named (e.g., Session 002b for catalogue re-open, mirroring the Session 003b convention in the plan).

**Operational check demanded.** Concrete trigger event with named vocabulary, named consumer, and named Council session — not "external mapping work activates SSSOM".

**Withdrawal condition.** WITHDRAW IF either (a) SSSOM is promoted to Conditional with profile-pin to mapping records only — accepting my reframe (and dovetailing with the Q5 module-owner-veto rule); or (b) Defer status is retained but the re-open trigger is the three-part operational event above. HOLD IF Defer stays with the current vague trigger. **Held dissent text:** "Cagle DA holds dissent on Q9 — re-open trigger is not operational; same defect as my S001 dissent only displaced into a vaguer location. Withdrawal condition: named external vocabulary + named consumer + named Council session trigger, OR promotion to Conditional with mapping-records-only profile pin (Q5 mechanism)."

### Q10 — ODRL activation trigger

**Attack.** Same shape as Q9 but distinct vocabulary. The S001 deferred-policy row says "policy-authoring deferred to Phase 2 per Session 001 Q2 (Guarino: ODRL `Policy`/`Permission` bite only on instances — TBox alone asserts nothing)." That reasoning is sound — ODRL needs instance data to mean anything. But "Phase 2" is not a calendar event; it is a programme phase whose start is itself triggered by upstream completions. The Change Log row currently routes the trigger to ODR-0012's Q4 ("Policy-activation trigger owned by ODR-0012 Q4"). That is acceptable *if* ODR-0012 Q4 specifies the trigger operationally — which it may or may not, depending on Session 012's verdict.

For S002's catalogue-level recording, the trigger MUST be:

- **Event 1:** ODR-0012 (governance) authors a consent-receipt instance in published Turtle (not in plan-stage prose). This is Pandit's Phase-2 consent-receipt ambition, named explicitly.
- **Event 2:** ODR-0009 (claims) authors a verifiable-credential-tied policy instance — a `cred:VerifiableCredential` with `odrl:Policy` attached. This is the VC/DID activation pathway (cross-references to Q13 — see procedural attacks).
- **Event 3 (added):** An external policy-authoring consumer (data licensor, consent-receipt service) cites OPDA in their architecture documentation and requests ODRL-typed Turtle.

Any of three events activates; none = stays deferred. The activation Council session is named (Session 012b or a session named in the activation amendment), not "Council deliberates when ready".

**Operational check demanded.** ODRL activation trigger is one of three named instance-authoring or consumer-arrival events, not "Phase 2" or "consent instances enter scope".

**Withdrawal condition.** WITHDRAW IF Q10 lands with three (or at least two) named events. HOLD IF "Phase 2" stays as the trigger, or if the trigger is "ODR-0012 Q4 decides" with no specific event named — that delegates the operational check without producing one.

### Q11 — OBO RO — DEPTH

**Attack on the formal-pair's split.** Session 001 left OBO RO open (Kendall: transitive part-of for flat→block→estate; Davis: biology-flavoured, use `dct:isPartOf`). The formal-pair (Gandon + Guizzardi) carries this for S002. The two voices have characteristic priors: Gandon will press for URI-graph cleanness (`dct:isPartOf` is in Dublin Core, no new namespace, fewer prefixes); Guizzardi will press for UFO-category-cleanness (`ro:partOf` distinguishes spatial/structural part-of, set membership, parthood-with-existential-dependence — distinctions UFO names but `dct:isPartOf` collapses).

I attack the framing this formal-pair-split risks producing: *what is the operational check that fires when OBO RO usage is OPDA-appropriate?* Without an operational check, this is a Council-theatre split — two voices producing irreconcilable theoretical positions that the panel votes on without operational evidence.

The check I demand follows S001 Q1's amendment lineage (diagnostic exemplars admitted to test ICs): produce a *diagnostic exemplar* where `dct:isPartOf` produces a query result OPDA needs to *reject* and `ro:partOf` produces a result OPDA needs to *accept* — or vice versa. Concrete shape: OPDA has flat→block→estate→register-of-titles-area part-of relations. If a SPARQL query asking "is this flat part of an estate?" returns different answers under `dct:isPartOf` (transitively closed; biological-context-free) vs `ro:partOf` (with UFO meta-category constraints rejecting set-membership readings), the choice has operational consequence. If the query returns the same answer in OPDA's actual data, the choice is theology.

The Davis dissent in S001 ("biology-flavoured") is the pragmatic anchor. OBO RO was authored for biological ontologies (gene parts, cell parts, organism parts). OPDA's domain is property data; the part-of relations are spatial/legal/administrative, not biological. The burden of proof for adopting OBO RO is on the UFO-category-cleanness argument; without an operational exemplar showing `dct:isPartOf` produces a wrong answer, "biology-flavoured" remains the dominant objection.

**Operational check demanded.** Diagnostic exemplar where the choice between `dct:isPartOf` and `ro:partOf` produces *different OPDA SPARQL queries returning different results*. If no such exemplar exists in OPDA's current data, OBO RO stays in Defer (decision: not adopted with biology-flavour reason carried forward), with a re-open trigger of "an OPDA query produces a wrong answer under `dct:isPartOf` that `ro:partOf` would correct".

**Withdrawal condition.** WITHDRAW IF the formal-pair produces a diagnostic exemplar grounding the choice in operationally-different query results, AND the panel ratifies the choice. WITHDRAW IF the panel accepts that the choice has no operational consequence in OPDA's current scope and routes OBO RO to Defer with a re-open trigger. HOLD IF the choice is made on theoretical category-cleanness alone with no operational exemplar — that is Council theatre. **Held dissent text in that case:** "Cagle DA holds dissent on Q11 — OBO RO admission/rejection made on theoretical grounds without operational exemplar. Withdrawal condition: diagnostic exemplar where `dct:isPartOf` and `ro:partOf` produce different OPDA query results, OR Defer with re-open trigger naming the operational failure that would activate."

### Q12 — FOAF reason — DEPTH

**Attack — demand deployment-fail citation.** The catalogue currently rules FOAF out programme-wide with the reason "Person/Agent modelling — superseded by `prov:Agent` + Dublin Core for our purposes". That reason is *theoretical category mismatch*. ODR-0006 (Agents and Roles) is cited as the settling record; FOAF is not adopted there either. The S001 Q2 row in the Change Log says "Kind-layer choice (W3C Org vs bespoke `opda:`) routed to ODR-0006; `prov:Agent` for provenance role only" — and FOAF is excluded from that choice without a recorded operational reason. Guarino's S001 attack (FOAF/org-ontology-shaped participant model) was overridden by the programme-decision pathway, not by an operational counter-argument.

The operational reason I demand: cite a specific OPDA deployment scenario where FOAF would produce a wrong outcome and `prov:Agent` produces a right outcome — or cite a public deployment (BBC `/programmes/`, gov.uk, INSPIRE, ESCO) where FOAF was used and broke something OPDA-analogous. The BBC ontology (Davis's deployment) used FOAF heavily; if BBC learned not to, that is the citation. If BBC used FOAF and it worked, the OPDA rule-out needs a different operational reason.

My reason for pressing this hard: theoretical-category-mismatch reasons are demotion-fragile. The next time a contributor reads the Change Log and asks "why FOAF out?", "superseded by `prov:Agent`" reads as preference, not principle. Three years from now an LLM-aided contributor will say "well, FOAF has `foaf:knows` and `foaf:Organization` which are what I need" and re-open the question. A deployment-fail citation prevents that re-open from being a fresh debate — it points at a concrete prior judgement with evidence. The S001 dispatch of FOAF was 5-4 to 6-3 territory (the row records the briefly-reopened question being closed); without operational evidence, the next contributor's challenge will reset that vote, not inherit it.

There is also the question of consistency with S001 Q2's FOAF treatment. The Q2 row says "Session 001 Q2 briefly reopened the Defer-tier FOAF entry (because `prov:Agent` is deliberately thin — no person/organisation distinction, no structured name), but FOAF has since been ruled out." That language is itself an operational concession — `prov:Agent` IS deliberately thin. Ruling FOAF out without producing a different vocabulary that fills the thinness (Organization ontology? bespoke `opda:`?) means the operational gap is unresolved. ODR-0006 carries that resolution, but S002's catalogue-level rule-out must cite ODR-0006's chosen vocabulary as the substitute, not just "`prov:Agent` for provenance only".

**Operational check demanded.** The Change Log row for FOAF MUST cite either: (a) a named OPDA deployment scenario where FOAF and the chosen substitute (`prov:Agent` + W3C Org ontology, or bespoke `opda:`) produce different operational outcomes; (b) a public deployment that learned not to use FOAF for an OPDA-analogous case (Person/Organization modelling in a regulated data domain); OR (c) explicit citation of ODR-0006 as the resolution record, with ODR-0006's chosen substitute named and the gap (FOAF's structured-name and `foaf:Organization` semantics) explicitly addressed.

**Withdrawal condition.** WITHDRAW IF the FOAF rule-out reason is replaced with one of (a)/(b)/(c) above. HOLD IF the rule-out stays theoretical. **Held dissent text:** "Cagle DA holds dissent on Q12 — FOAF rule-out reason is theoretical-only. Withdrawal condition: deployment-fail citation grounding the rule-out in operational evidence, or explicit ODR-0006 substitute-citation that addresses the operational gap FOAF would fill."

### Q13 — `cred:` and `did:` admission

**Brief restatement of prior dissent + conditional acceptance now.** Scope-Check 1 Q7c admitted `cred:` and `did:` to Defer with activation deferred to ODR-0016 (vote 8-1: Davis + Pandit spawn-now; majority defer-with-named-spawn; my lone "defer-without-spawn" voice). My S1 reasoning: VC/DID work was already routed via ODR-0009 Q8; spawning ODR-0016 added a record I thought premature. I lost that 8-1; I respect the loss. ODR-0016 now exists as a named deferred record, and the panel's "name-it-now" framing has been borne out — the routing to ODR-0009 alone would not have produced the catalogue-level admission of `cred:` and `did:` prefixes that S002 now records.

**Conditional acceptance.** I concur with admission to Defer with ODR-0016 activation pointer. The three OR-ed triggers currently in the Defer column are:

1. "Session-009 Q8 surfaces real VC-side decisions" — operationally meaningful (Q8 is a specific question in a specific session).
2. "Session-012 Phase-2 consent receipts land" — operationally meaningful if Q10's three-event ODRL trigger is adopted (the consent-receipt instance is the activation event).
3. "A real wallet/DID consumer enters scope" — vague. "Real wallet" and "enters scope" need operational meaning.

The third trigger is the one I press. The S001 OWL-Time row uses "a concrete consumer materialises" — same vagueness, same defect. Operationalisation: "A named wallet/DID consumer (UK gov OneLogin; EU eIDAS 2.0 wallet provider; gov.uk Verify successor) cites OPDA in their architecture documentation OR requests `cred:`/`did:`-typed Turtle from OPDA's namespace." That is a Boolean event.

**Withdrawal condition.** WITHDRAW on Q13 admission with the activation pointer in its current form (panel verdict largely settled at S1). Light press on the third trigger to be operationalised. If the panel accepts the third-trigger refinement, withdrawal is unconditional; if the panel keeps "real wallet enters scope" verbatim, withdrawal is reluctant and the vague-trigger pattern joins the procedural attacks (P1, P2, P3 below).

## Procedural attacks (process gaps the panel may have skipped)

**P1. Cross-question consistency between Q4 and Q5.** The catalogue's "reference-not-import" discipline (Q4) and the "profile-pinning" mechanism (Q5) are in operational tension that the panel framing has not surfaced. A profile slice *is* essentially an import-with-cherry-pick: the maintainer selects which terms from the external vocabulary to materialise into local SHACL shapes, then operates against that slice. That is the operational shape of an import — you have committed to a specific term-set with stability assumptions. If reference-not-import is the universal default (Q4), profile-pinning (Q5) is the exception that proves it; the catalogue should name the exception explicitly rather than treat the two questions as independent verdicts. If profile-pinning is admitted (Q5), Q4's framing as "should reference-not-import generalise to every Conditional entry" is already answered "no, profile-pins are import-equivalent — the catalogue admits import-style commitment for large vocabularies under a different name". The two questions must be answered consistently or the catalogue contradicts itself in the same `## Rules`. The Queen's synthesis should explicitly cross-reference Q4 and Q5; if the synthesis treats them as independent, that is a procedural defect to flag.

**P2. Cross-reference between Q10 (ODRL activation) and Q13 (`cred:`/`did:` admission).** Both questions concern Phase-2-style deferred activations and both name *the same event* as a candidate trigger. Q13's activation triggers include "session-012 Phase-2 consent receipts land"; Q10 (under the framing I propose) names the same event as ODRL policy-authoring activation. If consent receipts trigger ODRL activation (Q10) AND `cred:`/`did:` activation (Q13), the catalogue should cross-reference these so a maintainer reading either trigger sees the other. Currently each trigger is silent about the other; a coupled-trigger event that activates two vocabularies should be recorded as such, with a single Change Log row when the event fires (not two parallel rows). The Queen's synthesis should record the coupling explicitly.

**P3. Q3 promotion criteria interaction with ODR-0001 §"When to use the Council".** ODR-0001 §"When to use the Council" lists "Vocabulary catalogue admission, tier movement, or retirement decisions" as a Council-triggering category. Q3's promotion procedure must specify whether tier movement convenes a *new* Council session or amends in place via Change Log row. The Scope-Check 1 Q4 retirement of ODR-0014 implies amendments land as Change Log rows. But promotion *into* the catalogue (admitting a new vocabulary) is a different shape from movement *within* the catalogue (Conditional → Core, Conditional → Defer). The procedure should distinguish: new-vocabulary admission may warrant a Reduced Council session (panel attests to the catalogue admission); within-catalogue movement may be Author-only with cited evidence (Change Log row only). The current text does not distinguish, and the distinction is operationally load-bearing — a maintainer who finds a new vocabulary should not be forced to convene a Full Council if the admission is uncontested.

**P4. ODR-0016 status precedent for cross-vocabulary activation.** Scope-Check 1 named ODR-0016 as deferred-with-activation-triggers. That precedent could be applied to ODRL (Q10): instead of "policy-authoring deferred to Phase 2" recorded as a catalogue Change Log row, spawn a named deferred ODR-0017 (ODRL Policy Authoring) with explicit activation triggers, mirroring the ODR-0016 pattern. I do not advocate for the spawn (a session this size should not spawn new ODRs lightly; that was my Scope-Check 1 Q7b defer-without-spawn instinct). I flag the precedent so the panel can consciously choose: either the catalogue inherits the ODR-0016 pattern for ODRL (and possibly SSSOM Q9), or it explains why ODRL's policy-authoring deferral is governance-by-catalogue-row rather than governance-by-named-deferred-ODR. Inconsistency between Q13 (deferred-by-ODR-0016) and Q10 (deferred-by-Change-Log-row) is a procedural defect to surface.

**P5. A9-relaxed regime test for this ODR.** ODR-0002 is `kind: architecture`; per the A9 amendment to ODR-0001, requirements (a) UFO/DOLCE meta-category and (b) IC over hard cases are *relaxed*. This session is using that relaxation. But the relaxation has a load-bearing test in A9's text: "Where these ODRs incidentally make commitments about modelled-domain entities, those commitments are themselves `pattern`-level content and MUST satisfy (a)–(c) inline or by reference to a `pattern` ODR cited via `depends-on` or `implements`." The catalogue's role tier ("the modelling vocabulary every OPDA linked-data file is expected to use" for Core; "the conditional layer where modelling concerns arise") is *adjacent to* ontological commitments — admitting OWL-Time commits OPDA to interval-bearing entities (Guizzardi/Gandon's S001 argument); admitting `prov:Agent` commits OPDA to a particular Agent semantics. The panel should explicitly test whether each Conditional admission carries an implicit `pattern`-level commitment that should be extracted to a `pattern` ODR per A9's artefact identity test. If yes, the catalogue's `depends-on` field must cite the `pattern` ODR. If the panel skips this test, the A9 relaxation is being mis-applied.

## Anchor withdrawal conditions

Summary of all withdrawal conditions in priority order. The panel's response on Q3 is the single most load-bearing test of whether this session strengthens or weakens the catalogue.

| Q | Withdrawal condition | If unmet, held dissent |
|---|---|---|
| Q1 | Q3 produces auditable Conditional → Defer flip event with named voter | "Three-tier cut lacks deprecated-pending-trigger tier; SSSOM-pattern collapses to honour-system without it" |
| Q2 | Per-entry version-pin field OR documented breaking-version-triggers-ODR rule | "Per-entry metadata is insufficient; breaking-version triggers are implicit" |
| Q3 | Enumerated promotion checklist (named consumer + layer count + SHACL gate + failure-mode test) AND parallel demotion checklist | **Hold.** "Cagle DA holds dissent on Q3 — promotion and demotion criteria are not operational. Withdrawal condition: enumerated promotion checklist with named consumer, layer count, SHACL gate, and failure-mode test (and symmetric demotion checklist) recorded in ODR-0002 `## Rules`." |
| Q4 | Reference-not-import qualified as "default with documented exceptions" + exception classes enumerated | "Reference-not-import overgeneralised; profile-pin (Q5) is import-equivalent and contradicts the default" |
| Q5 | Module-owner-proposes / catalogue-ratifies / module-veto delegation rule | **Hold.** "Cagle DA holds dissent on Q5 — profile-pinning ownership is inverted. Withdrawal condition: module owners propose profile pins in their ODR's session; catalogue records and ratifies after; module veto preserved." |
| Q6 | Three-part status field (body + status + date) | "Per-entry authority floor is mixed without status discipline" |
| Q7 | Four-part OWL-Time demotion trigger (Phase gate + surviving consumer + Turtle audit + named voter) | "Demotion trigger is honour-system" |
| Q8 | Gate condition specifies named destination + named schema profile | "DCAT gate is generic" |
| Q9 | Conditional-with-profile-pin OR named-event re-open trigger | **Hold.** "Cagle DA holds dissent on Q9 — re-open trigger is not operational. Withdrawal condition: named external vocabulary + named consumer + Council session trigger, OR promotion to Conditional with mapping-records-only profile pin." |
| Q10 | Two named instance-authoring events that activate ODRL policy work | "Phase-2 activation trigger is calendar-vague" |
| Q11 | Diagnostic exemplar where `dct:isPartOf` vs `ro:partOf` produces different OPDA query results, OR Defer with named re-open trigger | **Hold.** "Cagle DA holds dissent on Q11 — OBO RO admission/rejection made on theoretical grounds without operational exemplar. Withdrawal condition: diagnostic exemplar where `dct:isPartOf` and `ro:partOf` produce different OPDA query results, OR Defer with re-open trigger naming the operational failure that would activate." |
| Q12 | Deployment-fail citation grounding FOAF rule-out | **Hold.** "Cagle DA holds dissent on Q12 — FOAF rule-out reason is theoretical-only. Withdrawal condition: deployment-fail citation grounding the rule-out in operational evidence." |
| Q13 | Operationally-specific third activation trigger ("specific wallet/DID consumer cites OPDA") | Mild press only — overall accept |

**Anchor pattern.** I will withdraw on Q1, Q2, Q4, Q6, Q7, Q8, Q10, Q13 if the panel produces operational checks meeting the stated conditions. I will hold dissent on **Q3, Q5, Q9, Q11, Q12** unless the load-bearing operational checks land — those are the five questions where soft procedure produces decorative tiering downstream. If the session closes without operational checks on Q3 (the most load-bearing), my held dissent is recorded verbatim per ODR-0001 §Roles, and the catalogue ships with a recorded DA dissent on its promotion/demotion procedure — that dissent then conditions every downstream session whose ODR cites the catalogue's tier as authority.

The five held-dissent questions form a coherent attack-surface: **Q3** (the promotion/demotion engine that drives all other tier movement); **Q5** (who owns profile-pinning — module vs catalogue); **Q9** (the SSSOM re-open trigger, my recorded S1 dissent); **Q11** (OBO RO admission criterion — operational vs theological); **Q12** (FOAF rule-out reason — deployment-grounded vs theoretical). Withdrawing on all five requires the panel to commit to operational specificity across the catalogue's spine. Holding on all five would record a serious DA dissent — a Cagle-DA-holds-five pattern signals that the catalogue's admission discipline is not at the standard the methodology demands.

The OPDA programme will run 10 more sessions admitting, demoting, and pinning vocabularies against this catalogue. Soft admission discipline now means decorative tiering later. Every Conditional vocabulary admitted under soft criteria becomes a maintenance debt the next reviewer cannot interrogate. Every Defer vocabulary with a vague re-open trigger becomes an honour-system commitment to revisit — and honour-system commitments slip. Operational checks now is the only forcing function that prevents Council-theatre tier movement downstream.

My S001 record stands as the methodology baseline: SSSOM dissent recorded (5-4); `aiHint` exile to annotation graph (7-2 against me — I withdrew on Knublauch+Gandon's operational grounds, and the loss made the annotation graph explicit); identity-key challenge to Guizzardi unrebutted ("a rigid Kind with `owl:hasKey` is inert for a consumer whose record has no UPRN; mine produces a violation"). Three patterns: I lose where the operational grounds favour the panel; I press where operational checks are absent; I withdraw when the panel produces them. Per ODR-0001 §Roles, that is the DA functioning as designed. This S002 position carries that pattern forward.
