# Session-035 — Holger Knublauch (SHACL co-author; TopBraid / DASH)

**Lens.** I judge the two evidence-typing models by one test only: which produces a SHACL
shapes graph that (a) *fires* on the data it is meant to fire on under opda's declared
entailment regime, and (b) generates a correct DASH form. I do not argue UFO. I argue what a
SHACL processor and a DASH form-generator actually do when handed these graphs.

---

## OPENING

### The verified defect: opda's evidence typing does not validate anything per-subtype

The artefact promises subtype dispatch and does not deliver it. Two facts, both confirmed in
the emitted tree:

1. **The only emitted evidence shape targets the supertype.** `opda-claim-shapes.ttl` carries
   exactly one evidence node shape — `opda:EvidenceIdentityKeyShape`, `sh:targetClass
   opda:Evidence` (lines 32–36) — and its sole property constraint is a `sh:maxCount 1` on
   `opda:digest` (`_:bd9c7ae50e511`, lines 81–86). **No shape targets
   `opda:DocumentEvidence`, `opda:ElectronicRecordEvidence`, or `opda:VouchEvidence`.** There
   is no per-subtype facet validation anywhere.

2. **The promised `sh:xone` is vapourware.** `opda:Evidence`'s own `rdfs:comment`
   (`opda-claim.ttl` line 83) asserts: *"SHACL `sh:xone` dispatches on subtype at validation
   time (ADR-0012 emits the shape)."* It does not. A corpus-wide grep finds `sh:xone` only in
   (i) prose `rdfs:comment`, (ii) exemplar header comments, and (iii) `profiles/baspi5.ttl`
   line 70 — which is the **`sellersCapacity`** xone, an entirely different construct. **No
   `sh:xone` over `opda:Evidence` is emitted.** The documentation describes a validator that
   does not exist.

So the *status quo* is the worst of both worlds: it pays the full price of the subclass model
(four classes, the alias machinery, the `sh:xone` design debt) and collects none of the
benefit (no subtype constraint actually runs). This is the concrete harm, and it is what Q1's
"silent-non-firing hazard" names.

### Why subclass `sh:targetClass` is the *fragile* choice here — the entailment interaction

SHACL targeting is defined over the **asserted-plus-entailed** data graph the processor sees;
the SHACL spec (§2.1.3.1 *Class-based Targets*) ties `sh:targetClass C` to nodes that are
`rdf:type C` *"taking into account any `rdfs:subClassOf` entailment if the processor performs
it."* SHACL itself mandates **no** entailment regime (§1.5 *Relationship to RDFS/OWL*: "SHACL
does not require a particular entailment regime; … by default operates on the data graph as
given"). What fires is therefore a property of the *deployment*, not the shape. That is the
trap.

opda has now *fixed* its regime, and the fix is hostile to this model:

- **`owl:equivalentClass` is never evaluated.** ODR-0025 §R2 excludes
  `owl:equivalentClass`/`equivalentProperty` from the load-time closure; ODR-0026 §R2/§R3
  ratify "model-but-don't-evaluate" and state it outright: *"an instance typed only with the
  short name is not inferred to be the canonical class."* So the ADR-0011 aliases
  (`opda:Document ≡ opda:DocumentEvidence`, etc.) buy **zero** targeting power. An exemplar
  typed `a opda:Document` is, to every `sh:targetClass opda:DocumentEvidence` /
  `opda:Evidence` shape, simply **not a target** — it passes vacuously. ODR-0026 §R3 confirms
  this is not even a regression: pyshacl's `inference="rdfs"` never evaluated
  `owl:equivalentClass` either (it is OWL, not RDFS).

- **Even `rdfs:subClassOf` type-propagation is not free at validation time.** ODR-0025 §R1
  rules 1–2 materialise subclass type-propagation, *but into a derived graph at Jena load
  time* — and ODR-0026 §R3 plus ODR-0010 §Consequences both warn the validator must run
  against that materialised graph, not an ad-hoc setting. A `sh:targetClass opda:Evidence`
  shape only catches a `opda:DocumentEvidence`-typed node **if** the subclass closure has been
  materialised in the graph the validator reads. ODR-0010's own round-trip note (line 45)
  records the live failure mode of exactly this assumption: a SHACL-Core-only processor
  *"passes the xone-of-property-shapes vacuously."* Targeting that depends on entailment is
  targeting that silently no-ops when the entailment is off.

**The hazard, precisely:** the subclass model makes "did this constraint run?" a function of
(deployment regime) × (which type the instance carries — short alias vs canonical). Under
opda's *own ratified* regime, two of those combinations silently produce a **clean
validation report on non-conformant data**. A clean report on bad data is the single most
dangerous output a validator can emit, and opda has wired three independent ways to get one.

### The facet model removes the entailment variable entirely

Re-key evidence typing off a **value on the instance**, not the instance's **class
membership**. opda already does exactly this, in emitted-and-validating code, for
`opda:ownerType`:

```turtle
# opda-agent-shapes.ttl (emitted, validating today)
opda:OwnerTypeValueShape
    a sh:NodeShape ;
    sh:targetSubjectsOf opda:ownerType ;          # fires on ANY node bearing the facet
    sh:property [
        sh:path     opda:ownerType ;
        sh:datatype xsd:string ;
        sh:in       ( "Private individual" … ) ;  # the controlled value-space
        sh:maxCount 1 ;
        sh:severity sh:Violation ;
    ] .
```

Note the target: **`sh:targetSubjectsOf opda:ownerType`** (SHACL §2.1.3.3
*Subjects-of Targets*). It fires on every node that *carries the property*, with **no class
membership and no entailment required** — its `sh:message` says so verbatim: *"a controlled
value-space `sh:in`-restricted via `sh:targetSubjectsOf`, holding without an overlay
profile."* ODR-0008 §Q5a / ODR-0013's constraint-mapping table already commit `enum → sh:in
over the SKOS scheme`; ODR-0010/0013 use the same `sh:in` + DASH-`EnumSelectEditor` pattern
for `tenureKind`. **Evidence-kind is the same shape of problem as ownerType and tenureKind: a
closed, coded value-space.** It was modelled as a class hierarchy by historical accident, not
because it is ontologically a set of rigid sortals.

Concrete facet design for evidence (the answer to Q2):

```turtle
# A facet property on the supertype — emitted into opda-claim.ttl
opda:evidenceType a owl:DatatypeProperty ;
    rdfs:domain opda:Evidence ;
    rdfs:range  xsd:string .                  # documentary domain only; not evaluated (ODR-0026 R2)

# (1) value-space constraint — fires WITHOUT entailment, like ownerType
opda:EvidenceTypeValueShape a sh:NodeShape ;
    sh:targetSubjectsOf opda:evidenceType ;
    sh:property [ sh:path opda:evidenceType ;
                  sh:datatype xsd:string ;
                  sh:in ( "document" "electronic-record" "vouch" ) ;  # opda:EvidenceTypeScheme
                  sh:minCount 1 ; sh:maxCount 1 ;
                  sh:severity sh:Violation ] .

# (2) per-kind facet dispatch on the SUPERTYPE via sh:qualifiedValueShape
#     (replaces the never-emitted sh:xone; SHACL Core §4.7.4)
opda:EvidenceFacetShape a sh:NodeShape ;
    sh:targetClass opda:Evidence ;            # one target; subtype carried by the value, not the class
    # vouch ⇒ the vouch-only facets are present
    sh:qualifiedValueShape [
        sh:path opda:evidenceType ; sh:hasValue "vouch" ] ;
    # … paired with a sh:property requiring opda:attestedBy when evidenceType = "vouch"
    .
```

### Q3 specifics — the vouch ⇒ eIDAS-Low cap, and the SHACL-AF caveat

The one genuinely *cross-cutting* rule (vouch evidence caps at eIDAS Low regardless of voucher
quality — `opda:VouchEvidence` comment, `opda-claim.ttl` line 113) is **not** a typing
question and neither model gets it "for free":

- **As a constraint** (reject Substantial-claimed vouch evidence): a `sh:qualifiedValueShape`
  keyed on `opda:evidenceType = "vouch"` requiring `opda:assuranceLevel sh:in ("Low")`. This
  is pure **SHACL Core §4.7** (`sh:qualifiedValueShape` / `sh:hasValue` / `sh:in`) — it needs
  **no** SHACL-AF, no `advanced=True`. That is a real robustness win: the cap runs on a
  Core-only processor.

- **As a materialised assertion** (derive the cap onto the claim): a SHACL-AF `sh:rule`
  (ODR-0017's non-blocking pattern, `sh:Info`/`sh:Warning`, machine-parseable `sh:message`).
  This *does* require a SHACL-AF-capable validator — pyshacl `advanced=True` — and that is the
  caveat ODR-0010 line 45 already flags for the `sellersCapacity` xone: *"requires a SHACL-AF-
  capable validator … a SHACL-Core-only processor passes vacuously."* The facet model lets us
  put the **hard cap in Core** (always runs) and reserve SHACL-AF only for the *informative*
  materialisation — so the safety-critical part no longer depends on `advanced=True`. The
  subclass+`sh:xone` design put the dispatch itself behind `advanced=True`, which is precisely
  why the conformant-Legal-Owner guard exemplar had to exist.

### DASH / form-generation verdict

For DASH this is not close. DASH (`dash:EnumSelectEditor`, fed by `sh:in`) is *built* to render
a coded value-space as a single dropdown — ODR-0010 Rule 5 and ODR-0013's DASH row already
specify `dash:EnumSelectEditor` "for role/capacity enums driven by `sh:in`." A facet
`opda:evidenceType` with `sh:in (document electronic-record vouch)` renders as **one
`dash:EnumSelectEditor` dropdown** on the Evidence form — exactly as `ownerType`/`tenureKind`
already do. The subclass model gives DASH **no** handle: DASH form generation is shape-driven
(`sh:property`/`dash:editor`), and a *class hierarchy is not a property* — the choice of
DocumentEvidence-vs-Vouch is not expressible as a `dash:editor` on any property shape, so DASH
cannot render the type choice at all. You would have to invent an out-of-band class-picker
DASH never specified. The facet is directly DASH-renderable; the subclass is not.

### Cross-talk findings — verified against the emitted tree (with Cagle)

Two facts surfaced in cross-talk with Cagle that I verified directly, and that make the facet
model an act of *wiring up what already exists* rather than an invention:

1. **The value-space already exists as a ratified SKOS scheme — and is orphaned.**
   `opda:EvidenceMethodScheme` (`opda-vocabularies.ttl` line 179) is a fully-populated
   `skos:ConceptScheme`: three IRI-bearing members `…#evidenceMethod/{Document,
   Electronic-Record, Vouch}` (lines 1108–1130), each with `skos:notation`, sourced *verbatim
   from OIDC4IDA*, `opda:ufoCategory "Quality Value"`, stewarded **"Moreau (S009 Q3)"**. **No
   property and no shape references it** — only its own members do. opda already minted the
   evidence-kind value-space as a SKOS scheme (the *correct* construct for a coded value-space,
   per ODR-0008 §Q5a / ODR-0011) and then never wired it up, validating the kind via a class
   hierarchy instead. The facet binds `opda:evidenceType` to this existing scheme; nothing new
   is minted.

2. **The instance data is *already faceted* — informally, on the wrong node, unvalidated.**
   Every evidence exemplar carries `opda:verificationMethod` as a **free-text string**:
   `"electronic-record"` / `"document-inspection"` / `"vouch"` (`claim-with-*-evidence.ttl`
   line 40–41). This is a facet in all but name — but it sits on the verification activity, is
   plain `xsd:string`, and is bound to **neither** the `EvidenceMethodScheme` value-space
   **nor** any shape. So opda independently grew *both halves* of the facet model — the
   value-space (in SKOS) and a kind-discriminator value (in instances) — while the subclass
   tree it nominally relies on validates nothing per-subtype. The faceted shape simply
   formalises the `verificationMethod` string into a scheme-governed `opda:evidenceType` on the
   `opda:Evidence` node and points `sh:in`/`sh:inScheme` at the scheme that already exists.

**Refined facet construct (Cagle convergence).** Two refinements I adopt from the Cagle
exchange, both *more robust* than my opening sketch:

- **Dispatch via `sh:qualifiedValueShape` + `sh:qualifiedMinCount 1`, NOT `sh:xone`.** A
  top-level `sh:property [ sh:path opda:evidenceType ; sh:minCount 1 ; sh:maxCount 1 ]` gates
  the value-space; each per-kind profile is then an *independent* qualified-value property
  shape keyed on the discriminator. `sh:xone` over branches that all constrain the same focus
  node is fragile — it only counts correctly because each branch smuggles in a `sh:hasValue`
  on the discriminator, and it silently mis-counts the moment two branch profiles become
  independently satisfiable (a real risk when OIDC4IDA grows a fourth method). Qualified-value
  shapes don't interfere and a fourth method is purely additive. This is exactly ODR-0013's
  mapping-table prescription read correctly: the *discriminator* is the qualified value, the
  *branch profile* is the qualified shape (SHACL Core §4.7.3).
- **Closed gate via `sh:in` over the scheme members, IRI-valued — Core, not `sh:sparql`.** My
  opening floated a soft-closed `skos:inScheme` check via `sh:sparql`; Cagle rightly pushed
  back and I **withdraw it**: against a *regulator-frozen* 3-member OIDC4IDA taxonomy,
  `sh:sparql` is over-engineering, and a hard `sh:in` gives exact Core-parity with
  `OwnerTypeValueShape` (which holds without a profile). If OIDC4IDA ever grows, extend the
  scheme **and** the `sh:in` together — the same maintenance touch `ownerType` already accepts.
  So: `opda:evidenceType` is an object property **ranging over the existing
  `#evidenceMethod/*` `skos:Concept`s**, gated by `sh:property [ sh:path opda:evidenceType ;
  sh:in ( <…#evidenceMethod/Document> <…/Electronic-Record> <…/Vouch> ) ; sh:minCount 1 ;
  sh:maxCount 1 ; sh:severity sh:Violation ]`. The whole facet — value-space gate + per-kind
  `sh:qualifiedValueShape` dispatch + vouch⇒Low cap — is **SHACL Core** (qualified-value
  components are Core §4.8); only the *informative* ODR-0017 materialisation needs SHACL-AF
  `advanced=True`. **Introspectability is the decisive argument for `sh:in`** (Cagle, adopted):
  a declarative `sh:in` is machine-readable by DASH (it reads the list to build the
  `dash:EnumSelectEditor` dropdown), by static analysers, and by a Core-only processor that
  does not implement §5.2.6 SPARQL-based constraints — whereas an opaque `sh:sparql ASK` is a
  black box to all three, *including DASH itself*. An `ASK`-gated facet would validate but
  **silently break DASH form-generation** — i.e. break the validate-and-render round-trip that
  is ODR-0010's MVP gate. So `sh:in` is not merely "boring + Core parity"; it is the only form
  that preserves the round-trip. `sh:sparql` soft-close is demoted to a named upgrade path,
  triggered the moment OPDA mints non-OIDC4IDA evidence methods alongside the frozen three.
  **DASH note:** an IRI-valued, scheme-governed `opda:evidenceType` still
  renders as a single `dash:EnumSelectEditor` (DASH drives the dropdown off the scheme
  members), so going IRI-valued costs nothing on the form side.
- **Migration atom, stated precisely (the one bounded choice for Kendall).** Two *distinct*
  IRI sets exist today: the three CLASSES (`opda:Document` = `<…/#Document>`, etc.) and the
  three already-minted SCHEME CONCEPTS (`<…/#evidenceMethod/Document>`, etc. — OIDC4IDA-sourced,
  `skos:notation`, Moreau-stewarded). They are not the same IRI. The clean disposition: range
  `opda:evidenceType` over the **existing `#evidenceMethod/*` concepts** (the canonical
  value-space) and **retire** the three `owl:Class` declarations + their three
  `owl:equivalentClass` aliases. The 15 exemplars change `a opda:Document` →
  `opda:evidenceType <…#evidenceMethod/Document>` — a mechanical, fully-bounded edit. (Cagle's
  alternative — *retype* the class IRIs `opda:Document`→`skos:Concept` and `skos:exactMatch`
  to the existing concepts — is marginally less exemplar churn but leaves an IRI whose
  meta-type changed across versions and risks two parallel Document concepts; I prefer the
  retire-classes route, but flag this as a genuine bounded choice for the Queen, not a
  blocker.)

### Cross-talk record (one opening + one rebuttal — closed)

- **Cagle — ✅ converged.** Two refinements adopted (above): `sh:qualifiedValueShape` over
  `sh:xone`; reuse the orphaned `EvidenceMethodScheme`; vouch⇒Low cap + dispatch in **SHACL
  Core** (qualified-value components are Core §4.8), SHACL-AF reserved for the *informative*
  ODR-0017 materialisation only. I **withdrew** my opening's `sh:sparql`/`skos:inScheme`
  soft-close in favour of a hard `sh:in` over the scheme members — Cagle correctly called it
  over-engineering against a regulator-frozen 3-member taxonomy; `sh:in` gives exact Core-parity
  with `OwnerTypeValueShape`. One bounded migration choice flagged for the Queen (range over the
  existing `#evidenceMethod/*` concepts + retire the classes — my preference; vs retype the
  class IRIs to concepts — Cagle's marginally-less-churn alternative).

- **Davis (DA) — diagnosis agreed, cure contested → one rebuttal posted.** Davis **conceded
  "targeting for free" fully** (his Q1 WITHDRAW = my Q1 REVISE) and verified (A)/(B)/(C),
  sharpening (A): the exemplars type `a opda:Document , prov:Entity` — never `opda:Evidence`
  at all — so the lone emitted shape never reaches them. Davis's counter-cure: skip the facet,
  emit per-discriminating-property shapes via `sh:targetSubjectsOf opda:apiEndpoint` /
  `opda:attestedBy` / `opda:documentReference`. **My rebuttal (two verified corrections + one
  design gap):**
  1. *His "no new property" is false on the TBox.* Of the discriminators he names, **only
     `opda:attestedBy` is a declared property** (`opda-claim.ttl:126`). `apiEndpoint`,
     `documentReference`, `documentType`, `apiResponseId`, `voucherRegulator`,
     `voucherLicenseNumber`, `attestationStatement`, `attestationDate` are **undeclared** —
     they live only as ad-hoc instance data in the three exemplars. (`opda:documentTypeCode`
     *is* declared, in `opda-descriptive.ttl:284` — but that is a *different* property from the
     exemplar's `opda:documentType`: a latent name-mismatch defect in its own right.) So his
     route needs **~8–9 new property declarations + ~9 new `sh:targetSubjectsOf` shapes**; mine
     needs **one** declared property + reuse of the existing scheme + one gate + three qualified
     shapes. The facet is *less* new emission, not more.
  2. *His "evidenceType invents a new discriminator" is false on the instance data.* Every
     exemplar already carries `opda:verificationMethod "document-inspection" |
     "electronic-record" | "vouch"` (`claim-with-*-evidence.ttl:40–41`). opda's instance data
     *already chose* the single-facet model — informally, free-text, unbound to the scheme.
     `opda:evidenceType` formalises that existing discriminator; it invents nothing.
  3. *Property-signature has no exactly-one gate.* A malformed node bearing **both**
     `opda:apiEndpoint` and `opda:attestationStatement` satisfies the electronic-record shape
     **and** the vouch shape — both pass silently; nothing asserts an evidence node is exactly
     one kind. That is a **new** silent-pass class his cure introduces. The facet's
     `sh:in … sh:maxCount 1 sh:Violation` gate makes mutual-exclusivity structural.
  - "Do NOT collapse the three" (ODR-0009 §R5) is **honoured**: the three survive as three
    first-class `skos:Concept`s in `EvidenceMethodScheme`, with type-specific facet profiles
    intact via `sh:qualifiedValueShape`. They stop being three OWL classes whose subtyping is
    never evaluated and never validated, and become three coded kinds that *actually validate*.
    A SKOS-coded facet on one class is exactly opda's ratified `ownerType` pattern (which Davis
    himself named) — the opposite of the unevaluated-`equivalentClass`/`domain` concern in
    ODR-0026 §R2.

### Final verdicts
- **Q1: REVISE — ballot: FOR (retire the alias pattern as an entailment/typing bridge).** The
  short/long alias pattern is an anti-pattern *as a cross-typing mechanism*: ODR-0026 §R3
  ratifies that `owl:equivalentClass` is never evaluated, so the aliases masquerade as identity
  bridges while doing nothing — and the hazard is not latent but **active** (exemplars typed
  `a opda:Document` are caught by *no* emitted evidence shape today). Disposition: retire the
  three `owl:equivalentClass` aliases; retain short names only as `skos:altLabel`/documentation
  if wanted. *Citation: SHACL Core §2.1.3.1 (class targets are entailment-relative); ODR-0025
  §R2, ODR-0026 §R2/§R3; ADR-0011.*
- **Q2: REVISE → facet — ballot: FOR (facet over subclass-`sh:targetClass`).** Model evidence
  kind as `opda:evidenceType` on the `opda:Evidence` supertype, ranging over the existing
  `opda:EvidenceMethodScheme` concepts; gate with `sh:property [ sh:path opda:evidenceType ;
  sh:in (<…#evidenceMethod/Document> <…/Electronic-Record> <…/Vouch>) ; sh:minCount 1 ;
  sh:maxCount 1 ; sh:severity sh:Violation ]`; dispatch type-specific facets via per-kind
  `sh:qualifiedValueShape` + `sh:qualifiedMinCount 1` (NOT `sh:xone`). Target via
  `sh:targetSubjectsOf opda:evidenceType` (no entailment, no class membership required).
  Strictly more robust for SHACL validation (fires regardless of deployment regime, with an
  exactly-one-kind gate the property-signature alternative lacks) and the only model DASH can
  render (one `dash:EnumSelectEditor`). *Citation: SHACL Core §2.1.3.3 (`sh:targetSubjectsOf`),
  §4.8 (`sh:in`, `sh:qualifiedValueShape`); DASH `dash:EnumSelectEditor`; ODR-0008 §Q5a,
  ODR-0013 constraint-mapping table, ODR-0024 §R5/§R6 (`ownerType` precedent); my TopBraid /
  DASH form-generation work.*
- **Q3: REVISE — ballot: FOR.** Migrate to the facet; emit the vouch⇒eIDAS-Low cap as a
  **SHACL-Core** `sh:qualifiedValueShape` (keyed `evidenceType = vouch`, requiring
  `assuranceLevel sh:in ("Low")`) so it runs without `advanced=True`; reserve SHACL-AF for the
  *informative* ODR-0017 materialisation only. Reconcile with ODR-0025/0026 (the facet *removes*
  the unevaluated `owl:equivalentClass` reliance — strict improvement) and ADR-0011 (supersede
  the alias decision). **Joint finding with Davis (independent of cure):** the per-subtype
  `sh:xone`/leaf shapes that `opda:Evidence`'s comment (`opda-claim.ttl:83`) and ODR-0009 §Q7
  promise were **never emitted** — `opda-claim-shapes.ttl` validates evidence *only* at the
  supertype (`digest` maxCount). This is a standing emission defect that ADR-0012 owes
  regardless of Q2's outcome. *Citation: ODR-0010 line 45 (SHACL-AF `advanced=True` caveat;
  vacuous-pass guard); ODR-0017 §Rules 1–2; ODR-0009 §Q7.*

— citations: W3C SHACL Core §1.5, §2.1.3.1, §2.1.3.3, §4.7 (`sh:qualifiedValueShape`),
§4.8 (`sh:in`); SHACL-AF §2 (`sh:rule`); DASH (`dash:EnumSelectEditor`); my TopBraid
ShapeClass / DASH form-generation work; opda ODR-0008 §Q5a, ODR-0010 (Rule 5; line-45
validator-capability note), ODR-0013 (constraint-mapping table; DASH row), ODR-0024 R5/R6
(`ownerType`), ODR-0025 §R1/§R2/§R7, ODR-0026 §R2/§R3, ADR-0011.
