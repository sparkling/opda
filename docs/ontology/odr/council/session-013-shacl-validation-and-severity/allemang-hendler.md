# Allemang + Hendler — Pragmatic-pair position on S013

## Pair summary (≤100 words)

ODR-0013 is the validation-severity gate that ODR-0010 hands off to. We endorse the draft and Knublauch's four-tier table in substance. Hendler (LDP P3 / `/programmes/` heritage) carries Q3 — per-form DASH coverage audit is the right deliverable, and `sh:ValidationReport` URIs MUST dereference per LDP Principle 3, each violation linking back to its shape and form-question via `dct:source`. Allemang (*Working Ontologist* publish-first discipline) carries Q5 LOAD-BEARING — `sh:ValidationReport` is the canonical artefact, but a flattened error-list view is the operational reporting surface conveyancer UIs need. Two-layer reporting: SHACL-native canonical; flattened operational. Concede Q1, Q2, Q4; agree Q6, Q7.

## Per-question positions

### Q1 — Four-tier severity table (Knublauch / formal-pair)

**Pair joint:** CONCEDE Knublauch. The four-tier table (`sh:Violation` for identity-contract breach + unprovenanced claims; `sh:Warning` for overlay/sensitivity gaps; `sh:Info` for absent optionals; plus the existing `sh:Violation`-floor carve-out for the ODR-0010 Q6 no-identity-override meta-shape) is the canonical severity assignment and exactly what ODR-0013 §Rules §Severity tiering already names. *Working Ontologist* Ch. 11 — severity tracks regulatory weight, not schema nesting; Knublauch's pySHACL/TopBraid implementation experience is the right authority on the floor.

**Vote (pair):** AGREE — concede Knublauch four-tier table.

### Q2 — Mapping completeness (JSON-Schema → SHACL constraint table)

**Pair joint:** CONCEDE per stub. The seven-row mapping table in ODR-0013 §Rules (required → `sh:minCount 1`; enum → `sh:in`; type/format → `sh:datatype`/`sh:pattern`/`sh:nodeKind`; minimum/maximum → `sh:minInclusive`/`sh:maxInclusive`; `oneOf` → `sh:xone` + `sh:qualifiedValueShape`; array bounds → `sh:minCount`/`sh:maxCount`; canonical key → `dash:uniqueValueForClass` + `owl:hasKey` secondary) is complete against the 935 annotated base-schema leaves. The data-dictionary recorded leaf types ground `sh:datatype` deterministically; Allemang's generator-first policy (ODR-0004) emits these without hand-authoring.

**Vote (pair):** AGREE — concede mapping completeness; deterministic-emission discipline applies.

### Q3 — DASH UI coverage audit (Hendler LOAD-BEARING)

**Hendler:** This is the LOAD-BEARING question for the operational integration of ODR-0010 (overlay mechanism) and ODR-0013 (validation discipline). The deliverable: a **per-form DASH coverage audit** — for each overlay (BASPI4/5, TA6/7/10, NTS/NTS2/NTSL, CON29R/DW, LLC1, LPE1, FME1), every leaf in the overlay's `required` and form-question annotation set MUST resolve to a `dash:editor` / `dash:viewer` / `dash:propertyRole` binding. Gaps trigger either a DASH extension request (preferred) or a documented `opda:` term (catalogued in ODR-0014). The audit is mechanical but exhaustive; it is the operational gate that confirms ODR-0010's round-trip claim (Q7 of S010) holds for every overlay, not just BASPI5.

The LDP P3 commitment is the load-bearing part: **`sh:ValidationReport` URIs MUST be dereferenceable per Berners-Lee 2006 *Linked Data Design Issues* Principle 3.** Each `sh:ValidationResult` carries `sh:focusNode`, `sh:resultPath`, and (per this position) a `dct:source` triple linking the violation back to (a) the shape that fired the violation (its IRI in `opda-shapes.ttl`) and (b) the form-question whose constraint the shape encodes (the `<https://opda.uk/forms/baspi5#B1.3.2>`-pattern minted per ODR-0010 §Rules 4 and ODR-0017 §1a `dct:source` URI discipline). Both URIs MUST resolve when fetched; downstream consumers (conveyancer audit pipelines, regulator review tooling, LLM consumers per ODR-0017 §3a) treat the validation report AS data, navigating from violation → shape → form-question to surface the regulatory provenance of every failure.

This is the BBC `/programmes/` lesson applied at the validation layer: the validation report is not a transient build artefact, it is a **first-class dereferenceable resource** whose URIs anchor downstream audit trails. A flat error-list with opaque shape IRIs cannot be traversed; a linked-data validation report can. *Working Ontologist* Ch. 12 makes the same point — pragmatic value is whether the artefact supports the audit round-trip.

The audit's CI form: `sh:ValidationReport` produced by pySHACL/TopBraid against the diagnostic exemplars (registered freehold; unregistered pre-first-registration; UPRN-split flat — per ODR-0005) MUST have every `sh:ValidationResult` carrying a resolvable shape-URI AND a resolvable form-question-URI under `dct:source`. The regression test fails the build if any violation lacks either.

The per-form audit deliverable scope: a single Turtle file per overlay (`audits/baspi5-dash-coverage.ttl`, `audits/ta6-dash-coverage.ttl`, …) listing every `sh:property` in the overlay's profile shapes and asserting either a `dash:editor`/`dash:viewer`/`dash:propertyRole` binding OR an `opda:dashGap` flag pointing to the missing-binding ticket. Gaps are a known-debt artefact, not a build-blocker; the audit makes the debt visible. *Working Ontologist* Ch. 11: a coverage audit that produces a deliverable consumers can read is the right operational discipline — it converts implicit binding gaps into an explicit, tractable list.

**Allemang:** Concur Hendler. The per-form audit is the operational deliverable; the LDP P3 dereferenceability requirement is the working-ontologist publish-first commitment translated to the validation layer. *Working Ontologist* 3rd ed. Ch. 8: every assertion in a linked-data artefact must earn its keep AND be retrievable — a non-resolvable violation URI fails the second clause.

**Vote (pair):** **AGREE LOAD-BEARING** — per-form DASH coverage audit as deliverable; LDP P3 dereferenceability for `sh:ValidationReport` URIs; every `sh:ValidationResult` carries `dct:source` linking shape + form-question; CI regression test asserts both resolve.

### Q4 — `opda:aiHint` exile to annotation graph (Cagle)

**Pair joint:** CONCEDE Cagle. Advisory annotations (`opda:aiHint` and future LLM-consumer hints) MUST live in `opda-annotations.ttl`, NOT the shapes graph. This is the same pattern ODR-0017 §1a and ODR-0010 §Rules §"Advisory annotations exiled to a separate graph" operationalise: ODR-0004 §3a three-graph separation applies uniformly. A SHACL processor must find only interpretable constraint components plus known annotation properties (`sh:`, `dash:`, `rdfs:`, `dct:`); a constraint-adjacent invented term in the shapes graph risks being read as a constraint. The fix is graph-separation, not vocabulary-discipline. Cagle's inline-hint preference is recorded as dissent (≈7-2 per ODR-0013 §Consequences) — the dissent stands; the rule does not change.

**Vote (pair):** AGREE — concede aiHint exile; three-graph separation enforced.

### Q5 — Reporting surface: SHACL-native vs flattened UI (Allemang LOAD-BEARING)

**Allemang:** This is the LOAD-BEARING question for ODR-0013's publish-first usability claim. `sh:ValidationReport` is the SHACL standard form and the canonical artefact — but conveyancer tools, regulator dashboards, and end-user UIs cannot consume it directly: the report is a graph of `sh:ValidationResult` nodes each carrying focusNode/resultPath/severity/message/sourceShape, which is the right structure for machine consumers and the wrong structure for a list view that says "fix these 12 problems." The publish-first discipline (*Working Ontologist* Ch. 12) requires we ship what consumers can use; the formal-rigour discipline requires we keep the canonical artefact unflattened.

The resolution: **two-layer reporting.** Layer 1 is the SHACL-native `sh:ValidationReport` — the canonical artefact, the regression-test target, the audit-trail anchor (per Q3's LDP P3 commitment), the input to lint extensions and LLM consumers. Layer 2 is a **flattened error-list view** produced by a documented transformation from Layer 1, structured for conveyancer UI consumption — a list of `{severity, human-message, focusNode-label, form-question-link}` records sorted by severity tier (Violations first; Warnings next; Info last), grouped by form-section where possible.

**The flattening is operational, not ontological.** Layer 2 is derived from Layer 1 by a deterministic transformation (specified as a SPARQL CONSTRUCT or a documented serialisation function); Layer 2 is NOT a parallel authority — if Layer 1 and Layer 2 disagree, Layer 1 is correct and Layer 2 is broken. The transformation is part of the OPDA generator's emission discipline (ODR-0004 §6a deterministic-emission); it is reviewed alongside the shapes graph; it is regression-tested against the diagnostic exemplars.

ODR-0013 must name this explicitly: **the SHACL-native `sh:ValidationReport` is the canonical artefact; the flattened error-list is a documented derived view, not an alternative authority.** Without this, downstream tooling will diverge — one consumer's flattening will encode different defaults than another's, and the canonical/derived relationship blurs into "two equally-good views" with no truth condition. *Working Ontologist* Ch. 13: when an artefact has multiple consumers with different ergonomic needs, name one form as canonical and derive the rest; do not let a flattening drift into a parallel ontology.

The deliverable: ODR-0013 §Rules adds a row naming the two-layer discipline; ODR-0013 §Consequences names the flattening transformation as a generator emission (per ODR-0004 §6a). The transformation specification lives alongside the shapes graph; CI regression covers both layers (Layer 1 by pySHACL/TopBraid against exemplars; Layer 2 by structural assertion that the flattening preserves severity tier and `dct:source` provenance).

The publish-first grounding: a conveyancer reading a validation result wants "the seller's capacity is missing the attorney-attachments — see BASPI5 question B1.3.2", not "Constraint sh:NodeShape baspi5:SellerCapacityShape failed at sh:focusNode opda:Seller_a4f3 with sh:resultPath opda:attachments at sh:Violation severity." Both statements say the same thing; only one is actionable. Layer 2 is the actionable form. *Working Ontologist* 3rd ed. Ch. 12 §"Publishing for Consumers" — every linked-data artefact ships its canonical form AND its consumer-form; the discipline is to keep them deterministically related, not to pretend only one exists. The flattening discharges the publish-first commitment without weakening Layer 1's authority.

The flattening record schema (operational, ODR-0013 §Consequences names this):

| Field | Source (Layer 1) | Purpose |
|---|---|---|
| `severity` | `sh:resultSeverity` | sort key — Violations first |
| `humanMessage` | `sh:resultMessage` template-interpolated | the conveyancer-readable string |
| `focusNodeLabel` | `rdfs:label` of `sh:focusNode` | the data entity in human terms |
| `formQuestionLink` | `dct:source` (form-question URI per Q3) | the BASPI/TA6 cell to fix |
| `shapeAnchor` | `dct:source` (shape URI per Q3) | retained for audit traceability |
| `formSection` | `dct:isPartOf` of formQuestionLink target | grouping key for UI sectioning |

The transformation is SPARQL CONSTRUCT (deterministic; reviewable; regression-testable). Layer 1 carries everything; Layer 2 carries what the UI needs in the shape the UI consumes.

**Hendler:** Concur Allemang. The LDP framing: Layer 1 IS the linked-data resource (dereferenceable, traversable, navigable from violation to shape to form-question); Layer 2 is a derived presentation (the UI surface, optimised for human scanning). LDP commits us to Layer 1; pragmatism requires Layer 2; the canonical/derived discipline keeps them honest. The BBC `/programmes/` precedent: `pid` URIs carried the canonical record; programme-listing pages were rendered views derived from `pid` data, NOT parallel-authority sources. The same discipline applies here — `sh:ValidationResult` URIs carry the canonical violation record; the flattened error-list is a rendered view.

**Vote (pair):** **AGREE LOAD-BEARING** — two-layer reporting: SHACL-native `sh:ValidationReport` canonical (the regression-test target, audit-anchor, lint input); flattened error-list operational (deterministic derivation, generator-emitted, regression-covered); ODR-0013 §Rules names the discipline; flattening transformation specification lives alongside the shapes graph.

### Q6 — Composition discipline + ODR-0010 Q6 gate enforcement

**Pair joint:** AGREE Knublauch. The composition discipline (graph-union for shapes; set-union build-step replacement for `sh:in`; no stacked `sh:in`) carries from ODR-0010 §Rules 2 into ODR-0013's enforcement scope. The ODR-0010 Q6 no-identity-override gate — adopted at S010 as Cagle's `opda:ProfileShapeShape` SHACL meta-shape at `sh:Violation` severity — is enforced by ODR-0013 (this ODR owns the rules; ODR-0010 inherits them per the three-rule interface contract). The meta-shape targets profile graphs and rejects any profile introducing `owl:hasKey`, new class declarations, or IC-bearing predicates outside the canonical ODR-0005 set. This is the first `sh:Violation`-severity SHACL meta-shape targeting shape graphs (not data graphs) and the eleventh citing site for ODR-0017's pattern (Cagle S010 Q6 carryover) — with severity-tier override (Violation, not Info/Warning) because identity-override IS normative-breaking per ODR-0017 §2a three-tier decision rule's third row.

**Vote (pair):** AGREE — composition discipline + no-identity-override gate enforcement at `sh:Violation`; ODR-0017 §2a three-tier table accommodates the carve-out.

### Q7 — Three-rule interface contract with ODR-0010

**Pair joint:** AGREE. The three-rule interface (severity tier; annotation-graph split; no-identity-override gate enforcement) is the clean boundary between ODR-0010 (overlay mechanism) and ODR-0013 (validation severity). ODR-0013 OWNS the rules; ODR-0010 INHERITS them via the interface contract. *Working Ontologist* Ch. 13 — clean interface beats two artefacts second-guessing each other. The boundary was settled at S010 Q8; S013 confirms the inheritance direction.

**Vote (pair):** AGREE — ODR-0013 owns the three rules; ODR-0010 inherits via the interface contract.

## Replies to anticipated DA attacks

- **Cagle-DA may attack Q5's two-layer framing as introducing a parallel reporting authority.** Reply: deliberately structured against that risk. Layer 1 is the canonical artefact; Layer 2 is a deterministic derivation, NOT an alternative authority. If they disagree, Layer 1 is correct. The flattening transformation is generator-emitted (per ODR-0004 §6a) and regression-covered; this is the same canonical/derived discipline ODR-0010 uses for graph-union composition (one canonical merged graph; downstream views derive from it).

- **Knublauch-Queen may attack Q3's LDP P3 commitment as over-specifying ODR-0013 scope (URIs are ODR-0010 territory).** Reply: the URIs are minted under ODR-0010 §Rules 4 (form-question IRIs) and ODR-0004 §6a (shape IRIs); ODR-0013 inherits both via the three-rule interface contract (Q7) and adds the operational requirement that `sh:ValidationResult` link to both via `dct:source`. The minting authority stays with ODR-0010/ODR-0004; the validation-report navigation requirement is ODR-0013's responsibility because the validation report is ODR-0013's artefact.

- **Guarino-DA may attack Q5's flattening as a back-door return of "required (depending)" semantics.** Reply: no — Layer 2 carries no constraint authority; it is a presentation of Layer 1. The `sh:ValidationResult` severity, focusNode, and resultPath are Layer-1 facts; Layer 2 reorders and labels them. The S001 withdrawal condition (constraints are reified `opda:ValidationContext`-relative facts, not free-floating) is preserved at Layer 1; Layer 2 is downstream of the reification.

- **Cagle may attack Q3's `dct:source` doubling (shape-URI AND form-question-URI on every `sh:ValidationResult`) as redundant traceability.** Reply: deliberately redundant in the *navigation* sense, not the *information* sense — the shape-URI anchors the constraint authority (which rule fired), the form-question-URI anchors the regulatory authority (which BASPI/TA6 cell the constraint encodes). Audit consumers traverse from violation to rule to form-question; LLM consumers parse the structured form (per ODR-0017 §3a) and disambiguate by either anchor. A single URI under-specifies — either the regulatory link is lost (shape-only) or the implementation link is lost (form-only). Both URIs MUST resolve; both serve distinct consumers.

- **Knublauch may attack the per-form audit (Q3) as redundant with the diagnostic-exemplar regression test in ODR-0013 §Rules §"Validation confirmation".** Reply: distinct artefacts. The exemplar regression test confirms the *shapes* correctly classify the three diagnostic cases (registered/unregistered/UPRN-split). The per-form audit confirms the *DASH bindings* exist for every leaf the overlay touches — orthogonal coverage. A profile can pass exemplar regression with missing DASH bindings (the shapes validate fine; the form just doesn't render correctly). The audit is the form-side companion to the exemplar test's data-side coverage.

## Pair cross-talk: load-bearing pair commitments

**Hendler Q3 (LDP P3 validation-report dereferenceability) and Allemang Q5 (two-layer canonical/derived reporting) interlock.** Q3 commits us to Layer 1 as a navigable linked-data resource; Q5 commits us to Layer 2 as a documented derivation, not a parallel authority. The two together produce the operational reporting surface OPDA needs: a SHACL-native report that lints, audits, and LLM-consumes correctly (Q3); a flattened error-list that conveyancers and regulators can read at a glance (Q5); a deterministic transformation between them (Q5's generator emission); LDP P3 dereferenceability on both shape-URIs and form-question-URIs (Q3). Working-ontologist publish-first + LDP heritage converge on the same discipline: ship the canonical artefact that works for tools; derive the human-readable view; keep them honest by making one canonical.

**Concession-on-Q1/Q2/Q4/Q6/Q7 is debate-discipline, not deference.** We concede five of seven questions because the formal-pair (Knublauch) and Cagle's operational rigour are exactly aligned with where working-ontologist + LDP heritage adds no marginal value — the severity floor (Q1), the constraint mapping table (Q2), the aiHint exile (Q4), the no-identity-override gate (Q6), and the three-rule interface contract (Q7) are all settled by mechanism authorities upstream of our pragmatic-pair scope. Concentrating our argument-budget on Q3 and Q5 — where publish-first usability and LDP dereferenceability bear directly on whether the validation surface is operationally usable — is exactly what the pair-positioning discipline of ODR-0001 §Two-artefact discipline prescribes.

## Pair votes

| Question | Allemang | Hendler | Pair verdict |
|---|---|---|---|
| Q1 — Four-tier severity table | CONCEDE Knublauch | CONCEDE Knublauch | **AGREE** — formal-pair severity floor |
| Q2 — Mapping completeness | CONCEDE per stub | CONCEDE per stub | **AGREE** — generator-emitted from data-dictionary |
| **Q3 — Per-form DASH coverage audit + LDP P3** | AGREE Hendler | **AGREE LOAD-BEARING** | **AGREE LOAD-BEARING** — per-form audit; `sh:ValidationReport` URIs dereference; `dct:source` links violation → shape + form-question |
| Q4 — `opda:aiHint` exile | CONCEDE Cagle | CONCEDE Cagle | **AGREE** — three-graph separation enforced |
| **Q5 — Two-layer reporting (SHACL-native + flattened)** | **AGREE LOAD-BEARING** | AGREE Allemang | **AGREE LOAD-BEARING** — Layer 1 canonical; Layer 2 derived; generator-emitted; ODR-0013 §Rules names the discipline |
| Q6 — Composition + no-identity-override gate | CONCEDE Knublauch | CONCEDE Knublauch | **AGREE** — meta-shape at `sh:Violation`; ODR-0017 §2a accommodates carve-out |
| Q7 — Three-rule interface contract | CONCEDE Knublauch | CONCEDE Knublauch | **AGREE** — ODR-0013 owns; ODR-0010 inherits |
