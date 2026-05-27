# Allemang + Hendler — Pragmatic-pair position on S010

## Pair summary (≤100 words)

ODR-0010 is the overlay mechanism gate; we endorse the draft and Cagle's eight Q-amendments in substance. Allemang (*Working Ontologist* 3rd ed.) carries Q6 — the no-identity-override gate is LOAD-BEARING: profiles constrain the open-world TBox; they may not declare new Kinds nor override an ODR-0005 IC. Hendler (LDP / `/programmes/` heritage) carries Q7 — the BASPI5 round-trip is the MVP gate per ODR-0003 §Rules: profile URIs MUST dereference; the round-trip pressure-tests the whole stack (S005 + S006 + S007 + S009 + S010 + S012 + S013). Joint stance: concede Q1–Q5 + Q8 to Cagle; agree Q6 + Q7 as the load-bearing pair.

## Per-question positions

### Q1 — `opda:ValidationContext` property set

**Allemang:** Concur Cagle. The reification was already in the draft (per ODR-0010 §Rules — "Guarino's accepted withdrawal condition"); Cagle's contribution is the operational property set. *Working Ontologist* Ch. 8: a SHACL profile graph IS a first-class resource — it needs an IRI, a label, a definition, and a `dct:source` to the form it expresses. The minimum property set (`rdfs:label`, `dct:description`, `dct:source`, `opda:appliesTo`, `opda:profileFor`) is fixed enough to lint, loose enough not to over-commit. Concede.

**Hendler:** Concur, with the LDP-side commitment: every `opda:ValidationContext` URI MUST dereference per LDP Principle 3 (Berners-Lee 2006 *Linked Data Design Issues*). A profile that does not resolve when fetched is a broken linked-data resource — and downstream consumers (form generators, validators, audit-trail readers) treat the profile graph AS data, not as a build artefact. The dereferenceability is non-negotiable; this is the BBC `/programmes/` lesson — `pid` URIs were the canonical, dereferenceable resource and the rest of the pipeline depended on it.

**Vote (pair):** AGREE — concede Cagle's `opda:ValidationContext` property set + LDP Principle 3 dereferenceability requirement.

### Q2 — Composition semantics (build-step graph-union)

**Allemang:** Concur Cagle. The build-step union is correct because graph-union is commutative-by-construction — the order of profile loading does not affect the result graph, which mirrors `getTransactionSchema`'s deep-merge semantics. *Working Ontologist* Ch. 10: SHACL profiles compose by graph-union because shape evaluation is monotonic over constraint-conjunction (more shapes = more constraints; never fewer). The exception (per ODR-0010 Rule 2) is `sh:in` which requires set-union build-step replacement, NOT graph-union — Cagle's draft already nails this. Concede.

**Hendler:** Concur. The composition-as-code discipline (mirroring `getTransactionSchema`) is the right operational mechanism — composition is documentation-and-tooling, not entailment. A tool that stacks `sh:in` instead of merging is silently incorrect; the regression guard (Rule 5 build-step test) catches this. Concede.

**Vote (pair):** AGREE — concede composition semantics; commutativity-by-construction.

### Q3 — `dct:source` form-question IRI minting + page-anchor stability

**Allemang:** Concur Cagle. The IRI pattern `<https://opda.uk/forms/baspi5#B1.3.2>` is correct: stable fragment identifiers keyed to the form-question's BASPI section number; the form document itself is the dereferenceable resource (its constituent questions are addressed by fragment). *Working Ontologist* Ch. 5: stable identifier discipline is what distinguishes a linked-data ontology from a closed schema. Concede.

**Hendler:** Concur with the LDP page-anchor stability commitment: the BASPI5 form authority MUST commit to fragment-identifier stability across form revisions — if BASPI section `B1.3.2` is renumbered to `B1.4.1` in a future revision, the IRI MUST either persist (preferred) or carry `dct:isReplacedBy` (acceptable fallback). This is the `/programmes/` lesson restated — `pid` was stable across BBC editorial reorganisations because the URI promised stability. Concede.

**Vote (pair):** AGREE — concede `dct:source` form-question IRI minting + page-anchor stability discipline.

### Q4 — DASH coverage audit

**Allemang:** Concur Cagle. The DASH coverage audit is operational housekeeping — every BASPI5 leaf must map to a known `dash:editor` / `dash:viewer` / `dash:propertyRole`; gaps trigger either a DASH extension request or a custom `opda:` term documented in ODR-0014. *Working Ontologist* Ch. 11: DASH is the right binding because it is the canonical SHACL UI annotation vocabulary; rolling our own would re-invent what DASH already documents. Concede.

**Hendler:** Concur. The audit is mechanical; the result is a deliverable, not an ontological commitment. Concede.

**Vote (pair):** AGREE — concede DASH coverage audit as operational deliverable.

### Q5 — `sh:xone` with `sh:qualifiedValueShape` for `oneOf` discriminated unions

**Allemang:** Concur Cagle. `sh:xone` is the strictly-correct construct for `oneOf` (exactly-one; `sh:or` is at-least-one) — the draft Rule 3 already says this. `sh:qualifiedValueShape` keyed on the discriminator (`role` / `sellersCapacity`) is the right binding. *Working Ontologist* Ch. 10: `sh:xone` + `sh:qualifiedValueShape` is the standard SHACL idiom for discriminated unions; the BASPI5 `participants.items` discriminated on `role` is the canonical case. Concede.

**Hendler:** Concur. The nested `sellersCapacity` `oneOf` (Personal-Representative/Attorney branch carries extra `sh:minCount 1` for `sellersCapacityDetails` and `attachments`) is the sharpest pressure-test of `sh:xone` nesting; if it round-trips, the rest is mechanical. Concede.

**Vote (pair):** AGREE — concede `sh:xone` + `sh:qualifiedValueShape` for discriminated `oneOf` unions.

### Q6 — No-identity-override gate (Allemang LOAD-BEARING)

**Allemang:** This is the LOAD-BEARING rule of ODR-0010 and the cleanest application of *Working Ontologist* Ch. 8 minimal-modeling discipline. The principle: **a profile is a CONSTRAINT on the open-world TBox; it is not a DECLARATION mechanism.** A profile may add presence constraints (`sh:minCount 1`), narrow vocabulary (`sh:in` member subsets), tighten datatypes (`sh:datatype xsd:integer`); it may NEVER declare a new `rdfs:Class` or restate / alter / override the IC of an existing Kind. Identity belongs to the rigid Kind, settled in ODR-0005; a form context is not a metaphysical commitment.

The reason this matters operationally: an overlay that quietly redefines `opda:Property`'s IC — say, by asserting `owl:hasKey (opda:postcode opda:houseNumber)` inside the BASPI5 profile — would (a) shadow the ODR-0005 IC at the consumer level, producing silent inference inconsistencies; (b) make the IC profile-relative, defeating the open-world / fixed-TBox commitment; (c) break the ODR-0005 §6a SHACL-AF succession-rule semantics (because the consumer's IC would no longer be UPRN-relative). The harm is silent and propagates irreversibly under inference. *Working Ontologist* 3rd ed. Ch. 8 §"Minimal Commitment": every constraint added to a model must earn its keep against the harm a competing constraint would cause. An overlay-declared IC fails the test in every direction.

The enforcement mechanism is Cagle's `opda:ProfileShapeShape` — a SHACL meta-shape that targets `sh:NodeShape` instances inside profile graphs and rejects any profile that introduces (a) `owl:hasKey` declarations, (b) `rdf:type rdfs:Class` triples for new classes, (c) `sh:targetClass` triples whose target is not already in the base TBox, OR (d) any predicate declared as `opda:identityCriterion` outside the canonical ODR-0005 set. The meta-shape is itself a SHACL constraint, executable at profile build-time AND at lint-time via `odr-review` extension. This is the right enforcement: SHACL validating SHACL — exactly the recursive discipline ODR-0017 prescribes for non-blocking quality rules, here applied at `sh:Violation` severity because identity-override IS normative-breaking.

I concur with Cagle that this gate is the eleventh citing site for ODR-0017's `opda:ProfileIdentityOverrideCheckRule` — but with a precision: the no-identity-override rule is `sh:Violation` severity (overlays attempting to declare identity are broken builds, not informational warnings), so it sits OUTSIDE ODR-0017's `sh:Info`/`sh:Warning`-only template. The ODR-0017 citation captures the *template*-instantiation discipline (canonical SHACL-AF rule form; placement in shapes graph not annotation graph; machine-consumability requirement); the severity-tier overrides. This is a clean special-case within ODR-0017's pattern; the citation stands.

**Hendler:** Concur Allemang fully. The Web Ontology rationale: identity is a global commitment; an overlay is a local view; declaring identity locally violates the locality boundary. Adopt the gate as Allemang frames it.

**Vote (pair):** **AGREE LOAD-BEARING** — adopt Cagle's `opda:ProfileShapeShape` no-identity-override SHACL meta-shape gate as the canonical enforcement; ODR-0017 cited as the eleventh citing site (template-instantiation discipline) with severity-tier override (`sh:Violation`, not `sh:Info`/`sh:Warning`); enforcement at profile build-time AND `odr-review` lint-time.

### Q7 — BASPI5 round-trip as MVP gate (Hendler LOAD-BEARING)

**Hendler:** This is the LOAD-BEARING question for the entire ODR-0010 mechanism and, more broadly, for the methodology's coherence claim. The BASPI5 round-trip is the MVP gate per ODR-0003 §Rules — "if BASPI5 round-trips, the remaining overlays are largely mechanical" — and the round-trip pressure-tests the WHOLE stack: ODR-0005 (the 3-class commitment must hold under profile loading), ODR-0006 (Roles + sellersCapacity discriminator must instantiate cleanly), ODR-0007 (transaction lifecycle attaches to LegalEstate), ODR-0009 (claims/evidence reify through the profile), ODR-0010 (this — the mechanism itself), ODR-0012 (PII regime — the DPV co-annotations must survive profile load), ODR-0013 (SHACL severity tiering applies uniformly across base + profile shapes).

The round-trip is **three operations**: (1) JSON-form-data → instance graph + profile load → SHACL validation reports conformance; (2) instance graph + profile → DASH-driven form regeneration produces a BASPI5 form whose every field carries a resolvable `dct:source`; (3) the regenerated form, re-filled and re-submitted, validates again to the same conformance verdict. This is what the working-ontologist *Linked Data Patterns* discipline calls a *round-trip cycle* (Davis 2010): the dataset and its representation pass through each other without semantic loss. The round-trip is the methodology's claim that the stack is end-to-end coherent.

The pressure-test points where the round-trip can fail are precisely the points where ODRs are load-bearing. ODR-0005 fails the round-trip if a Property's UPRN-succession event materialises into the validation report but the BASPI5 form has no field for it (the SHACL-AF rule needs a DASH binding). ODR-0006 fails if `sellersCapacity` discrimination produces inconsistent role-binding when the profile is loaded versus unloaded (the `sh:xone` branches must select identically). ODR-0007 fails if the transaction lifecycle's PROV-O Activity reification breaks under profile composition. ODR-0009 fails if a claim's evidence chain is invisible to the BASPI5 form. ODR-0012 fails if DPV annotations on PII-bearing leaves are dropped by the composition step. ODR-0013 fails if severity escalation across base + profile produces a `sh:Violation` where there should be a `sh:Warning`. Any of these is a methodology coherence failure detectable at the BASPI5 slice — which is why the slice was chosen as MVP.

The deliverable is the `profiles/baspi5.ttl` worked MVP slice (per ODR-0010 §Consequences). The CI regression test is the three-operation cycle above — fail any one, the build is broken. The dereferenceability test is Berners-Lee 2006 Principle 3: `…/profiles/baspi5/` MUST return a working shapes graph; `…/forms/baspi5#B1.3.2` MUST resolve to a fragment of the form document. Both are LDP-mandated; both are CI-checkable.

The methodology claim — that overlays are CONSTRAINTS on a fixed TBox composable as graphs — is operationally validated only by the round-trip succeeding. Before BASPI5 round-trips, the claim is theory; after, the claim is demonstrated. This is the *Linked Data Patterns* §"Round-Trippable Identifiers" discipline applied at the methodology level: the test of an ontology's coherence is that data can flow through it and come back unchanged.

**Allemang:** Concur Hendler fully. *Working Ontologist* Ch. 12 makes the same point: the test of an ontology's pragmatic value is whether it supports the data round-trip. For OPDA at S010 the BASPI5 round-trip IS the pragmatic-value test. Until it passes, the rest is preparation; once it passes, the remaining overlays are mechanical and the methodology is demonstrated.

**Vote (pair):** **AGREE LOAD-BEARING** — BASPI5 round-trip is the MVP gate for ODR-0010 AND the methodology's end-to-end coherence pressure-test; CI regression covers all three operations (load+validate, regenerate form, re-submit); dereferenceability per LDP Principle 3 is non-negotiable; failure of the round-trip at any of the cited pressure-test points (ODR-0005/0006/0007/0009/0012/0013) constitutes a methodology coherence failure requiring re-open.

### Q8 — Three-rule interface contract with ODR-0013

**Allemang:** Concur Cagle. The three-rule contract with ODR-0013 (severity tier; annotation-graph split; no-identity-override gate enforcement) is the right interface — ODR-0010 declares the overlay mechanism; ODR-0013 declares the validation severity discipline; the three rules sit at the boundary. *Working Ontologist* Ch. 13: a clean interface contract between two artefacts beats two artefacts each second-guessing the other's responsibilities. Concede.

**Hendler:** Concur. The ODR-0013 boundary is well-drawn — severity-tiering and annotation-graph mechanics are validation territory; the overlay mechanism (this ODR) hands off cleanly. Concede.

**Vote (pair):** AGREE — concede the three-rule interface contract with ODR-0013.

## Replies to anticipated DA attacks

- **Guarino-Queen may attack Q6's `sh:Violation` severity override as inconsistent with ODR-0017's `sh:Info`/`sh:Warning`-only template.** Reply: ODR-0017's pattern abstracts the *template-instantiation discipline* (canonical SHACL-AF form; placement in shapes graph; machine-consumability requirement) — these all apply to the no-identity-override rule. The severity-tier is a separate dimension; ODR-0017 §2a's three-tier decision rule already names "normative-breaking → NEVER this pattern". Identity-override IS normative-breaking; the citation captures the template, the severity overrides. This is a clean specialisation, not an inconsistency.

- **Guarino-DA may attack Q7's round-trip framing as conflating mechanism validation with methodology validation.** Reply: deliberately. The BASPI5 slice was chosen as MVP precisely BECAUSE it pressure-tests the methodology, not just the mechanism (per ODR-0003 §Rules — "the remaining overlays are largely mechanical"). If the round-trip is only a mechanism test, the MVP framing is wrong; if the MVP framing is right (which Council ratified at S001 Q5), then the round-trip carries methodology weight. The conflation is the methodology's bet.

- **Cagle may attack the pair's concession on Q1–Q5 + Q8 as over-deferential.** Reply: we concede where Cagle's operational rigour exactly matches our own pragmatic commitments — the operational details are not where Allemang's *Working Ontologist* discipline or Hendler's LDP heritage adds value. Concession on six questions concentrates argument-budget on the two (Q6, Q7) that bear methodology weight; this is debate-discipline, not deference.

- **Davis (publish-first) may attack Q7's three-operation round-trip as over-specified for MVP.** Reply: the three operations are exactly what *Linked Data Patterns* §"Round-Trippable Identifiers" prescribes — without all three, the round-trip is a one-way pipeline that proves nothing about data flowing back. The MVP claim is that data flows through and returns unchanged; nothing weaker discharges it.

## Pair cross-talk: load-bearing pair commitments

**Allemang Q6 (no-identity-override) and Hendler Q7 (BASPI5 round-trip) interlock.** The Q6 gate prevents the failure mode that would silently break Q7's pressure-test: if overlays could declare identity, the round-trip could pass under one overlay's IC and fail under another's, and the methodology coherence claim collapses into "coherent relative to a chosen profile" — which is exactly the open-world / fixed-TBox commitment we are refusing to abandon. The two rules support each other: the no-identity-override gate makes the round-trip's identity assumptions stable across profiles; the round-trip's CI test exercises the gate by composing profiles and confirming no IC drift.

**Working-ontologist + linked-data pragmatism converge.** Allemang's minimal-modeling discipline (constraints, not declarations) and Hendler's LDP commitment (dereferenceable resources, round-trip-able data) are two faces of the same publish-first discipline: ship the mechanism that works for BASPI5, defer the elaborations that don't earn their keep until consumer evidence forces them. The other six questions concede to Cagle because Cagle's operational rigour is exactly what the working-ontologist + LDP heritage prescribes — we owe him the concession on the mechanism details so we can spend our argument-budget on the two questions that bear the methodology weight.

## Pair votes

| Question | Allemang | Hendler | Pair verdict |
|---|---|---|---|
| Q1 — `opda:ValidationContext` property set | CONCEDE Cagle | CONCEDE Cagle + LDP P3 | **AGREE** — concede with dereferenceability requirement |
| Q2 — Composition semantics | CONCEDE Cagle | CONCEDE Cagle | **AGREE** — commutative graph-union; `sh:in` set-union replacement |
| Q3 — `dct:source` IRI minting | CONCEDE Cagle | CONCEDE Cagle + fragment stability | **AGREE** — stable fragments; `dct:isReplacedBy` fallback |
| Q4 — DASH coverage audit | CONCEDE Cagle | CONCEDE Cagle | **AGREE** — operational deliverable |
| Q5 — `sh:xone` + `sh:qualifiedValueShape` | CONCEDE Cagle | CONCEDE Cagle | **AGREE** — canonical discriminated-union idiom |
| **Q6 — No-identity-override gate** | **AGREE LOAD-BEARING** | AGREE Allemang | **AGREE LOAD-BEARING** — `opda:ProfileShapeShape` SHACL meta-shape; ODR-0017 eleventh citing site with `sh:Violation` severity override |
| **Q7 — BASPI5 round-trip MVP gate** | AGREE Hendler | **AGREE LOAD-BEARING** | **AGREE LOAD-BEARING** — three-operation round-trip; LDP P3 dereferenceability; methodology coherence pressure-test |
| Q8 — Three-rule interface contract with ODR-0013 | CONCEDE Cagle | CONCEDE Cagle | **AGREE** — clean ODR-0010/0013 boundary |
