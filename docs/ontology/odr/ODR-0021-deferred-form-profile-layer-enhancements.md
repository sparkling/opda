---
status: accepted
date: 2026-05-30
kind: architecture
tags: [forms, profiles, shacl, application-profile, deferred-work, yagni, over-engineering]
scope: []
council: session-022
supersedes: []
depends-on: [ODR-0010, ODR-0019, ODR-0020]
implements: []
---

# Deferred Form/Profile-Layer Enhancements

## Context and Problem Statement

The PDTF "forms" (BASPI5, TA6/7/10, LPE1, FME1, PIQ, RDS, OC1, LLC1, CON29…) are modelled as **SHACL overlay profiles** over a fixed `opda:` TBox ([ODR-0010](./ODR-0010-overlay-profile-mechanism.md)): a form *is* its named SHACL graph of shapes; the shapes constrain, they do not declare. This layer has repeatedly attracted proposed enhancements — most recently the [session-022](./council/session-022-form-shacl-profile-convention.md) convention review, which (correctly) found OPDA's form modelling ~95 % idiomatic against published standards and then proposed adopting **W3C PROF** to wrap each overlay as a first-class profile object, plus a stack of related machinery (DCTAP-as-artefact, content-negotiation, materialised usage tags, reified profile nodes).

The directing programme authority issued a binding governance directive (2026-05-30): **"the SHACL overlay IS the form; stop wrapping it."** A `prof:Profile` (or any wrapper) layered on top of the SHACL that already does the job is over-engineering — the same class of addition the session set out to remove, standard-branded. The standing answer for the form layer is therefore *subtractive*: add nothing; the overlay graph is the form.

But the rejected enhancements are not *wrong forever* — several are genuinely useful **once a consumer needs them**, and each was proposed by a credible standards-grounded voice. Without a record, they will be re-proposed and re-litigated every time the form layer is revisited (it has happened twice already this programme). This ODR is that record: a **deferred-options register** for the form/profile layer — what we *could* do, why we are *not* doing it now, and the **named trigger** that would re-open each. It is the form-layer analogue of [ADR-0005](../../adr/ADR-0005-deferred-work-register.md)'s deferred-work register, but ODR-side because it concerns ontology-artefact representation, and scoped to forms.

## Considered Options

* **Option A (chosen) — Record a deferred-options register for the form/profile layer.** Govern the form layer with one standing rule (a form is its SHACL overlay graph and nothing wraps it) and ratify every enhancement as deferred behind a named trigger.
* **Option B — No register — let the cut options live only in the session-022 transcript.** Rejected: they rot and get re-proposed every revisit (the failure mode this programme already hit twice); a transcript is not a standing, trigger-indexed gate.
* **Option C — Build the enhancements now (adopt PROF + DCTAP-artefact + materialised tags).** Rejected: the over-engineering the governance directive rejected — it wraps the SHACL that already does the job, for consumers that do not exist.
* **Option D — Track these in ADR-0005 §G (the deferred-work register).** Rejected: wrong corpus (these are ontology-artefact representation, ODR-side) and §G is the retired ontology-programme register, not the form layer; cross-listing there would split the form-layer decision across two records.
* **Option E — Fold into ODR-0010 as "future work".** Rejected: buries a standing, trigger-gated register inside a ratified mechanism record; a dedicated record keeps ODR-0010's normative mechanism clean and makes the deferral list independently citable.

## Decision Outcome

Chosen option: "Option A — Record a deferred-options register for the form/profile layer", because the SHACL overlay already discharges the form layer's load-bearing job, so each addition must earn its keep against a real consumer rather than against a tidy-architecture argument, and a trigger-indexed register prevents re-litigation of already-cut options.

Record a **deferred-options register for the form/profile layer** governed by one standing rule — *a form is its SHACL overlay graph (ODR-0010) and nothing wraps it; form→base association is the shapes' `sh:targetClass`; form→community is one `dct:subject`/`dct:publisher` triple on the form graph; "which terms a form requires" is read from the shapes* — under which every enhancement below is **ratified-as-deferred behind a named trigger and MUST NOT be built until its trigger fires**, chosen because the SHACL overlay already discharges the form layer's load-bearing job, so each addition must earn its keep against a real consumer rather than against a tidy-architecture argument.

### Consequences

* The form emitter ([ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md)) emits **only** the SHACL shapes + one `dct:subject` triple per form + standard `owl:Ontology`-header metadata — **no `prof:Profile`, no `opda:overlaysContext`, no `opda:requires`, no reified profile node**. The `profiles.py:250` defect is moot (the predicate is gone, not re-targeted).
* **YAGNI-boundary clarification (S034, 2026-06-01).** The standing rule fences *wrappers on top of* the SHACL (F1–F10 above). It does **not** fence enumerating a form's **own leaves** into its `sh:path`/`sh:minCount`/`sh:in` shapes — *that IS the SHACL overlay*, the load-bearing job this ODR says the overlay already does (and §F4 defers the stored requires-digest precisely *because* it is "derivable from the shapes", which presupposes the shapes carry the leaves). So the [ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) gap-1 eager-on-bindable enumeration is **not** a YAGNI violation: it activates already-committed `opda:` terms and mints no new published IRI (it is a *use* of committed identifiers, not a new commitment). See [session-034](./council/session-034-overlay-leaf-enumeration-discipline.md).
* The bounded-context records inherit this: [ODR-0019](./ODR-0019-bounded-context-representation.md) Rule 5/8 (home = `rdfs:isDefinedBy` + `dct:source` + gated `dct:subject`; `opda:definedInContext` retired) and [ODR-0020](./ODR-0020-bounded-context-scheme-and-mapping.md) (derived `servesContext` query, F1 firewall, `consumesFrom` for upstream) carry the corresponding term-level baseline.
* Reviewers and future councils MUST consult this register before proposing a form-layer enhancement, and MUST cite a fired trigger to re-open an item. Re-opened items leave this register and become their own ODR (or an ODR-0010 amendment).
* When a trigger *does* fire, the relevant row already names the idiomatic standard to adopt (PROF, conneg-by-profile, DCTAP, SKOS-XL…), so the re-opened decision starts from the convention, not from scratch — this register preserves the session-022 convention research as actionable, just gated.
* No emission, no generator change, and no new vocabulary result from this ODR today — it is a standing deferral record. Its effect is to *prevent* additions, not cause them.

## More Information

- **Standing mechanism**: [ODR-0010 — Overlay Profile Mechanism](./ODR-0010-overlay-profile-mechanism.md) (a form is a SHACL overlay over a fixed TBox; constrains-not-declares — the baseline this register defers against).
- **Bounded-context records**: [ODR-0019 — Bounded-Context Representation](./ODR-0019-bounded-context-representation.md) (Rule 5 home predicates; Rule 8 polysemy gate = F9); [ODR-0020 — Bounded-Context Scheme and Mapping](./ODR-0020-bounded-context-scheme-and-mapping.md) (`servesContext` derived = F7; `consumesFrom`).
- **Implementation ADRs**: [ADR-0026](../../adr/ADR-0026-bounded-context-scheme-emission.md) (scheme emission), [ADR-0028](../../adr/ADR-0028-descriptive-layer-walk-and-home-pass-emission.md) (`rdfs:isDefinedBy` home), [ADR-0029](../../adr/ADR-0029-overlay-profile-emitter-generalisation-and-rollout.md) (form emitter — emits no wrapper).
- **Council provenance**: [session-022 — Form↔SHACL Profile Convention](./council/session-022-form-shacl-profile-convention.md) — the convention review that surfaced F1–F10 (6–0 verdict, grounded in DCMI Application Profiles / Singapore Framework, W3C PROF/DCAT/conneg, DCTAP, RDFS, SHACL, FIBO) **and** the §Governance directive that deferred them ("the SHACL overlay IS the form"). The standards named per option (F1 PROF, F2 conneg-by-profile, F3 DCTAP, F9 SKOS-XL) are catalogued there with citations.
- **Deferred-work precedent**: [ADR-0005 §G](../../adr/ADR-0005-deferred-work-register.md) — the (cross-corpus) deferred-work register pattern this adapts for the form layer.
- **External conventions (for when a trigger fires)**: W3C *The Profiles Vocabulary* (PROF, WG Note 2019); W3C *Content Negotiation by Profile* (WG Note 2019); DCMI *DC Tabular Application Profiles* (DCTAP, 2022); DCMI Application Profiles / *Singapore Framework* (2008); SKOS Reference (2009) + SKOS-XL.

## Rules

### Standing form-layer rule (the baseline these defer against)

| Concern | Current (baseline — add nothing) |
|---|---|
| What a form **is** | its named **SHACL overlay graph** (ODR-0010) — no wrapper object (`opda:ValidationContext` stays exactly as ODR-0010 defines it; nothing layered on) |
| Form → **base** it constrains | structural — the shapes' **`sh:targetClass`** on the `opda:` base ("targeting IS the association") |
| Form → **community** that owns it | **one** standard triple on the form graph — `dct:subject` (or `dct:publisher`) → its bounded-context `skos:Concept` |
| Which **terms** a form requires | **read from the shapes** (`sh:path` of every `sh:minCount ≥ 1`); not stored |
| Per-form **metadata** (title, version, source) | standard `dct:`/`owl:` annotations on the form graph's `owl:Ontology` header |

`opda:overlaysContext` and `opda:requires` are **dropped** (the two above make them redundant). No `prof:Profile`, no profile-object reification, no spike.

### Deferred-options register (MUST NOT build until the named trigger fires)

| # | Option (what we *could* add) | What it would buy | Why deferred now | **Re-open trigger** |
|---|---|---|---|---|
| **F1** | **W3C PROF profile typing** — type each overlay `prof:Profile`; `prof:isProfileOf` → base; `prof:hasResource`/`prof:ResourceDescriptor`/`prof:hasRole` bundling SHACL + DASH + vocabulary as role-tagged resources | machine-discoverable, catalogue-able profiles; one identity bundling many artefacts; cross-org profile interop | the SHACL graph already *is* the form; `sh:targetClass` already gives the base; OPDA has one constraint artefact per form, not a bundle to describe. PROF is also a 2019 W3C **WG Note**, not a Rec | a need to **publish a machine-discoverable profile catalogue** OR **cross-organisation profile interop** with a party that consumes PROF |
| **F2** | **Content-negotiation by profile** — `prof:hasToken` + HTTP `Accept-Profile` / `Link rel="profile"` so a client can request "the transaction **conforming to** BASPI5" | standard API affordance to serve profile-conformant views/validation | no API serves profile-conformant views today; pure forward-compat | an **API/endpoint that serves or validates payloads per a requested profile** |
| **F3** | **DCTAP as a published artefact** — formalise the data-dictionary per-overlay leaf table as an explicit **DC Tabular Application Profile** (CSV/own format) with the TAP→SHACL converter as a named build step | external parties can author/round-trip profiles in a standard tabular format | `profiles.py` already performs the data-dictionary→SHACL generation (that *is* a TAP→SHACL step) — naming it changes nothing internally | **external parties authoring profiles**, OR a decision to **publish the constraint tables as standalone data** |
| **F4** | **Explicit `opda:requires` digest** — re-introduce a per-form stored list of required terms | one-hop "what does this form require" without a SHACL processor | derivable from the shapes (`sh:minCount`/`sh:path`); storing it duplicates a fact | a **named consumer needing the required-terms digest without running SHACL** |
| **F5** | **Explicit profile→base predicate** (`opda:overlaysContext` or `prof:isProfileOf`) | profile-grain association queries that node-grain `sh:targetClass` can't express | targeting already encodes it structurally | **multi-base profiles**, OR a **profile-grain query** targeting cannot answer |
| **F6** | **Reified profile node** beyond the graph (a first-class `ValidationContext`/`prof:Profile` carrying profile-level metadata) | a single node to hang version/publisher/role metadata + bundle resources | the graph's `owl:Ontology` header + a `dct:subject` triple already carry this; Guarino's S010 truth-maker is satisfied by the **named graph itself** | **per-profile metadata or resource-bundling** the graph header cannot carry |
| **F7** | **Stored/materialised `opda:servesContext`** — persist term→context-usage as triples | fast one-hop "which contexts use term X" | derivable on demand (term → forms' shapes → form's `dct:subject`); storing it is a drift-prone copy of a rule | a **named term-grain consumer** + a **measured performance need** for materialisation |
| **F8** | **Authored `dct:subject` community-ownership at scale** — assert community-ownership across the descriptive tail, beyond the steward-adjudicated residue | a complete, queryable term→community ownership map | no consumer for full ownership coverage; community is largely derivable from usage; authoring at scale re-imports drift | a **named consumer for community-ownership queries** the derived/residue answer can't satisfy |
| **F9** | **Polysemy machinery** — per-context `skos:scopeNote` registries, SKOS-XL label resources, a sense register | disambiguate genuine same-label/different-meaning homonyms by context | corpus attests **zero** genuine domain homonyms; PDTF disambiguates by distinct local names | **≥3 attested same-label/contradictory-definition collisions** + a named consumer (already the [ODR-0019](./ODR-0019-bounded-context-representation.md) Rule 8 gate) |
| **F10** | **Per-form versioning / lifecycle** — `prof:hasToken`/`pav:version` version tokens, profile deprecation/supersession chains | manage many co-existing form versions over time | one current version per form today; `owl:versionInfo` on the graph header suffices | **form-version proliferation** (multiple live versions of one form, or a deprecation event) |

### Anti-pattern (the reason this register exists)

- **Do NOT re-propose F1–F10 without citing a fired trigger.** A standards-grounded "this is the idiomatic/correct way to model a profile" argument is **not** a trigger — the baseline is already idiomatic (the SHACL overlay is a Dublin Core application profile in substance). Re-opening requires a *named consumer or interop need* from the trigger column. A council or reviewer that re-raises one of these MUST first record which trigger fired; absent that, the item stays deferred. (This is the discipline that stops the form layer being re-litigated — it was proposed-and-cut twice before this register existed.)

