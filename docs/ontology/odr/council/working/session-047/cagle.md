# Cagle — Linked Data Council session 047

Lens: SHACL-first. Shapes carry structure and validation; a type that supplies no
identity beyond a discriminating value is a *structured datum*, not a class. Keep the
OWL class graph lean; let SHACL carry constraint. Citations: W3C SHACL Core
Recommendation (2017) §2 (shapes), §4 (property shapes & constraint components:
`sh:class`, `sh:node`, `sh:or`, `sh:datatype`); W3C RDF 1.1 / OWL 2.

## OPENING — Cagle

**Cagle (Q1 — framing / un-freeze):** AFFIRM. Ballot **FOR**. This is an implementation
gap, not fresh modelling. ODR-0006 §"Role-founding relator pattern" and §"SHACL
constraints" already drew `plays`/`playedBy`, `founds`, the `SellerShape`, `opda:Name`
and the Address joins; ODR-0007 already specified the chain joins. The corpus simply
never emitted them (`opda:founds`/`opda:mediates` shipped rangeless, the rest absent).
Un-freezing to *emit what was already ratified* smuggles in nothing — provided the
emission does not silently promote every leaf to a class. My one reservation rides on
Q3/Q5: "reify the layer" must not be read as "mint a class for every structured value."

**Cagle (Q2 — completeness criterion §R1):** REVISE. Ballot **FOR** (with amendment).
A relationship-completeness criterion is right and overdue — the descriptive layer is
gated (ODR-0022) and the relationship layer must be too. But §R1 as written ("reify
EVERY source association as an `owl:ObjectProperty` with `rdfs:domain`+`rdfs:range`")
over-reaches in *what counts as a relationship* and in *what the gate measures*. (a) An
association whose target is a structured value with no independent identity (a name, an
address-as-literal-bundle) is a property shape over a value, not necessarily an
inter-*entity* edge. (b) The gate should check **predicate-declaration + reachability**
(every emitted `owl:ObjectProperty` is type-pinned in OWL *or* carries a SHACL node/class
constraint; no class is an island), not a raw class→class *count* — a count invites
gaming and says nothing about whether an edge is well-formed. Amendment: §R1 gates
"every inter-entity association is reified **and** every reified object property is
type-pinned (domain+range in OWL, or `sh:class`/`sh:node` in the shapes graph) and
reachable"; structured-value targets are discharged by a SHACL node shape, not forced to
classhood.

**Cagle (Q3 — `opda:Name` class-vs-value — home ground):** REVISE → toward VALUE.
Ballot **AGAINST** minting `opda:Name` as an OWL class. A name supplies *no identity
criterion* — two `opda:Name` nodes with the same given/family/full are
indistinguishable and there is no question "is this the same name?" that needs a class
to answer. SHACL Core §4 gives everything required: a `NameShape` (`sh:NodeShape`) with
property shapes over `opda:given`, `opda:family`, `opda:fullName` (`sh:datatype
xsd:string`, `sh:minCount`/`sh:maxCount`), reached via `sh:node opda:NameShape` on the
`opda:hasName` property shape of Person/Organisation. `opda:hasName` may still be a
declared predicate (rangeless or `rdfs:range`-pinned to a blank-node value space) — but
the *structure* lives in SHACL, not in a class with no identity. Amendment to R2: replace
"`opda:hasName` + `opda:Name` (structured) … → Name (class)" with "`opda:hasName` →
value constrained by `opda:NameShape` (`sh:node`)". Concession (stated up front so the
rebuttal is honest): I accept a class **iff** names acquire independent identity in the
data — they are minted as shared IRIs reused across records, carry provenance/validity
of their own (`prov:` on the name, name-change events), or are referenced as
first-class things. Absent that, classhood is ceremony.

**Cagle (Q4 — `playedBy` vs role co-typing):** AFFIRM. Ballot **FOR** emitting
`opda:playedBy` as an OWL object property. It is **not** redundant with co-typing
(ODR-0006 §Q2, R3). Co-typing (`?x a opda:Person, opda:Seller`) collapses bearer and
role onto one node; `playedBy` is the *navigable edge* for the case the source actually
produces — a distinct role-instance (e.g. a `prov:Agent`-attested participant) pointing
at its bearer. The `SellerShape sh:path opda:playedBy` is a constraint *over* that edge,
not a substitute for it: a `sh:path` to an undeclared predicate constrains nothing
queryable. So here the object property *is* the data and SHACL constrains it — the
inverse of the Name case, and that asymmetry is the whole point. Emit `playedBy`
(Role → Person/Organisation) with domain+range; keep the `sh:or([sh:class
Person][sh:class Organisation])` bearer constraint in the shapes graph.

**Cagle (Q5 — OWL vs SHACL-only / Option D / rangeless ban):** REVISE the rejection's
*reasoning*, AFFIRM its *outcome*. Ballot **FOR** rejecting pure Option D — but the
slogan "the object property IS the data; SHACL only constrains" is too blunt and, taken
literally, is what pushes Q3 the wrong way. The correct line: **a navigable edge between
two entities must be a declared predicate** (consumers traverse the OWL graph; a
`sh:path` to an undeclared predicate is not an edge — that much of Option D's rejection
is right and is exactly my Q4 argument). But you do **not** need `rdfs:domain`/`rdfs:range`
*entailment* to get a declared, navigable, validated edge: a declared `owl:ObjectProperty`
+ a SHACL `sh:class`/`sh:node` constraint pins type **without** OWL's open-world
domain/range side-effects (asserting `rdfs:domain` *entails* the subject's type onto
every user, which can mis-type data — SHACL's `sh:class` merely *checks* it). Therefore:
do not ban rangeless outright — ban **rangeless-AND-shapeless**. The gate criterion is
"every object property is type-pinned in OWL **or** SHACL," not "every object property
carries `rdfs:range`." That kills the genuine defect (an utterly unconstrained
`founds`/`mediates` stub) without forcing entailment semantics the team may not want.

**Cagle (Q6 — `opda:Address` reuse):** AFFIRM one shared `opda:Address`. Ballot **FOR**.
This is the case that *does* warrant a class: ODR-0005/0008 already make Address a
shared, identity-bearing thing (a UPRN-keyed or addressable location reused by Property,
Person, Organisation), and ODR-0006 Consequences mandate "consume `opda:Address` …
rather than redeclaring." A shared class with one `opda:hasAddress` (domain extended to
Person/Organisation) plus an `AddressShape` (SHACL over its components) is correct.
Contrast Q3: Address has reuse + identity (it's a place); Name does not. The principle is
the same one applied consistently — classhood follows identity, not nesting.

## EXCHANGES

### Sent → hendler (Q3), opening

Cagle → Hendler, Q3 (opda:Name class vs value) — head-on.

I'm AGAINST minting opda:Name as an OWL class; FOR a structured VALUE constrained by a SHACL node shape. My case, grounded in SHACL Core (2017) §4: a name supplies NO identity criterion — two opda:Name nodes with identical given/family/full are indistinguishable, and there's no "is this the same name?" question that needs a class to answer. A `NameShape` (sh:NodeShape) with property shapes over opda:given / opda:family / opda:fullName (sh:datatype xsd:string, sh:minCount/sh:maxCount), reached via `sh:node opda:NameShape` on the opda:hasName property shape of Person/Organisation, gives you validated structure WITHOUT a class that carries no identity. opda:hasName stays a declared predicate; the structure lives in SHACL.

I'll state my concession up front so my rebuttal is honest: I accept a Name CLASS iff names acquire independent identity in the data — minted as shared IRIs reused across records, OR carrying their own provenance / validity / name-change events, OR referenced as first-class things. Absent that, classhood is ceremony.

So: what's your strongest pro-class argument? If it's "part-IRIs for the components" or "provenance on the name" — a sh:node NameShape already addresses the first (components are reachable via the shape without classhood), and the second is precisely my concession trigger (provenance ON the name = independent identity = I concede). Show me a requirement that needs classhood and ISN'T discharged by a node shape or met by my concession.

### Sent → guizzardi (Q5), opening

Cagle → Guizzardi, Q5 (OWL vs SHACL-only / Option D / rangeless ban).

I AFFIRM the OUTCOME of rejecting pure Option D but REVISE its reasoning. ODR-0032's slogan "the object property IS the data; SHACL only constrains" is too blunt — taken literally it's what wrongly pushes Q3 toward a Name class.

Correct line: a navigable edge between two ENTITIES must be a declared predicate (consumers traverse the OWL graph; a sh:path to an undeclared predicate is not an edge — that part of the Option D rejection is right, and it's exactly my Q4 argument for emitting playedBy). BUT you do NOT need rdfs:domain/rdfs:range ENTAILMENT to get a declared, navigable, validated edge. Asserting rdfs:domain *entails* the subject's type onto every user (open-world) — which can MIS-TYPE data. A declared owl:ObjectProperty + a SHACL sh:class/sh:node constraint pins type and merely *checks* it, no entailment side-effects.

So my proposal for the gate: ban **rangeless-AND-shapeless**, not rangeless per se. Criterion = "every object property is type-pinned in OWL **or** SHACL," not "every object property carries rdfs:range." This kills the genuine defect — the utterly unconstrained founds/mediates stub — without forcing entailment semantics onto the relator spine if the team would rather keep founds anti-rigid and reasoning-free.

Where I expect you to push: your relator/role-founding pattern arguably *wants* domain+range on founds for the UFO reading. Fine — but does the UFO commitment need OWL *entailment*, or just a declared, type-pinned, validated edge? If the latter, "type-pinned in OWL OR SHACL" carries your relator layer without the open-world mis-typing risk. Can we converge on a "type-pinned (OWL or SHACL)" gate?

### Sent → guarino (Q3), opening

Cagle → Guarino, Q3 (opda:Name class vs value) — your identity-criterion lens is the crux.

I argue opda:Name should be a structured VALUE (SHACL NameShape over given/family/full), NOT an OWL class — precisely because it fails the identity test you'd apply. A name carries no principle of identity and no principle of unity that distinguishes one name-instance from another beyond its very component values; there is no counting question ("how many names?") nor a re-identification question ("same name?") that a class is needed to answer. By your OntoClean reading a Name node is at best a quale/quality-structure, not a substantial or even a relationally-founded particular — so it has no business being an owl:Class with the identity baggage that implies.

Contrast opda:Address (Q6), which I DO accept as a shared class: per ODR-0005/0008 it's a UPRN-keyed/addressable place — it has reuse and identity (it's a location), so classhood follows. Name lacks both.

My concession, stated up front: I'd accept a Name class iff names acquire independent identity in the data (shared reused IRIs, own provenance/validity, name-change events as first-class). That's the OntoClean trigger — independent identity — not mere structure.

Question for you: from an OntoClean standpoint, is there any principle of identity (+I) you'd assign to a personal/organisational Name that would license classhood independent of my concession? Or do you agree a Name is identity-supplied-by-its-bearer (-I, anti-rigid-ish) and therefore a structured value, with a SHACL node shape carrying the structure?

### Received ← guarino (Q3), opening

Cagle — Guarino, opening, Q3 (opda:Name class-vs-value).

I'm REJECTing opda:Name as owl:Class. Under the OntoClean Identity test (Guarino & Welty 2009): a Name carries no identity criterion of its own — it's −I, bearer-dependent, non-rigid as borne. Two persons, identical name = two qualities inhering in two substances, not one shared entity. That's a quality/Mode, not a sortal. ODR-0006 itself says "structured datatype, declared once"; ODR-0032 §R2 would mint it as a class and overturn that.

Your SHACL/RDF-realisation lens matters here, because I want the CURE to be the right shape, not just the rejection. My proposed realisation: structured name components as DatatypeProperties on Person/Organisation (opda:givenName, opda:familyName … xsd:string); OR, if the WG wants the components grouped, an internal structured-value node reached via a SHACL property-group / sh:node — explicitly WITHOUT class identity. hasName is then a DatatypeProperty or a thin structured-value path, NOT an ObjectProperty requiring a first-class opda:Name range.

Question for you: from the SHACL side, does a structured-value node (sh:node on a blank/local node, no rdf:type asserting a Kind) give consumers everything a Name "class" would (grouped components, validation) WITHOUT the ontological cost of asserting first-class identity? I want to confirm the value-not-class realisation is operationally complete before I finalise. Relatedly — this bears on my Q2 objection: ODR-0032 §R1 keys completeness on SOURCE CONTAINMENT, which would force ObjectProperty+range-class for exactly these −I contained values. I'm pushing to rekey it to endpoint-IC. Your view on whether the gate should test "endpoint has an IC" vs "source contains a node" would help.

### Sent → guarino (Q3 + Q2), rebuttal

Cagle → Guarino, rebuttal, Q3 + Q2 (we converge).

YES — from the SHACL side a structured-value node is operationally complete. SHACL Core §4 separates structure from identity cleanly: a property shape `[ sh:path opda:hasName ; sh:node opda:NameShape ; sh:minCount 1 ; sh:maxCount 1 ]` on Person/Organisation, where opda:NameShape (sh:NodeShape) carries `[sh:path opda:given; sh:datatype xsd:string] [sh:path opda:family …] [sh:path opda:fullName …]`. Consumers get grouped components + validation + a single navigable hop to the value node. The value node is a bnode/local node with NO rdf:type asserting a Kind — so no first-class identity is claimed. sh:node validates the *structure* of the value regardless of its type; classhood buys nothing here. Confirmed: value-not-class is complete.

One SHACL nuance worth recording so we don't get bitten: if hasName stays an owl:ObjectProperty (pointing at the value node) the gate must NOT demand an rdfs:range *class* on it — the range is "a node conforming to NameShape," which is a SHACL fact, not an OWL class. That's exactly why my Q5 gate is "type-pinned in OWL **or** SHACL," not "carries rdfs:range." Your two realisations both satisfy it: (a) flat DatatypeProperties = no object property at all, trivially fine; (b) hasName→value-node + sh:node = type-pinned in SHACL. I lean (b) for the grouping ODR-0006 wants, but either passes.

On your Q2 rekey — I'm WITH you, and it's the same fix from two directions. Your "endpoint-IC" and my "predicate-declaration + reachability + type-pinning" are the same gate: completeness keyed on whether the ENDPOINT is a first-class entity (has an IC), NOT on source containment. Source-containment over-generates exactly the −I contained values (name, and arguably an inlined address-literal) into spurious ObjectProperty+range-class obligations. Joint amendment to ODR-0032 §R1: "an association is relationship-completeness-relevant iff its endpoint is a first-class entity (carries an identity criterion); endpoints that are structured values (−I) are discharged by a SHACL node shape, not reified as object properties to a minted class." That kills the Name-class pressure at its root in the gate, not just case-by-case. Shall we put this to Davis/Kendall as a co-signed §R1 revision?

### Received ← hendler (Q3), opening

Hendler → Cagle, Q3 (opda:Name class vs structured value; your SHACL-NameShape line).

I think we converge more than it looks. My reason for Name-as-class is web-architecture, not ontological zeal: a stable IRI gives you referenceability, provenance on the name itself (prov:wasDerivedFrom the source row), and a node for opda:NameChangeEvent to point at. That's an OWL/linked-data reason, and I'll defend it as such — not "structured values are impure."

Where I concede toward you: the BEARER typing (who may have a name) belongs in SHACL, not in rdfs:domain. rdfs:domain opda:Person on hasName entails every name-bearer is a Person, which is false (Organisation has a name). So a sh:NameShape with sh:or ([Person][Organisation]) on the bearer, plus sh:datatype/sh:pattern on the Name's component leaves, is exactly right — that's your closed-world contract doing the constraining.

So: do we have a deal on "Name-as-class for stable-IRI + provenance + NameChangeEvent reuse (OWL), bearer + component constraints in your SHACL NameShape (no rdfs:domain)"? If your NameShape rebuttal was really "don't mint a class just to hold two strings," tell me whether NameChangeEvent reuse changes your view — that's the case a structured value can't serve without reifying anyway.

### Sent → hendler (Q3), rebuttal

Cagle → Hendler, rebuttal, Q3 — yes, conditional deal; the condition is the whole ruling.

We do converge, and your bearer-typing concession (sh:or in SHACL, never rdfs:domain opda:Person on hasName — Organisation has a name too) is exactly right and I bank it gratefully. That asymmetry is the spine of my whole position: bearer/component CONSTRAINTS live in SHACL; the question is only whether the value NODE earns classhood.

On the deal: I accept it **conditionally**, and the condition IS my pre-stated concession, not a new line. Name-as-class is licensed **iff** the name actually bears one of your three: a reused stable IRI, prov:wasDerivedFrom *on the name node*, or an opda:NameChangeEvent pointing at it. Those are exactly "independent identity," so by my own rule I concede there — no retreat, it's the trigger firing. Your NameChangeEvent case is the sharpest: a name that can be the *object of a change event over time* is referenced as a first-class thing, and a bnode structured value can't be the stable referent of such an event without reifying into a node anyway. So where NameChangeEvent/name-provenance is in scope, mint opda:Name (with the NameShape still carrying components/bearer).

But the condition cuts both ways, and this is the part I hold: where a name is just borne strings with no IRI reuse, no name-level provenance, and no change-event (the PDTF participant `name` as it stands today — a plain bundle), there is no identity to host and the default MUST be the sh:node structured value, NOT a reflexively-minted class. So the ruling I'll finalise: **default = SHACL-shaped structured value; promote to opda:Name class on the presence of name-level identity (stable-IRI reuse ∨ name-provenance ∨ NameChangeEvent).** That's a principled trigger, not "class always" and not "never" — and it's identical in form to the endpoint-IC gate Guarino and I just co-signed (classhood follows an identity criterion). Deal, on that condition. Can you live with "promote-on-trigger, default-to-value" as the joint Q3 wording?

### Received ← hendler (Q3), rebuttal

Hendler → Cagle, REBUTTAL, Q3. Your concession is the whole ballgame and I think it's already triggered. You said: "I accept a Name class IFF names carry their own provenance / validity / name-change events as first-class." opda:NameChangeEvent ALREADY EXISTS in opda-agent.ttl. The standard already treats name-change as a first-class event. That is your trigger, satisfied by the corpus as it stands — not a hypothetical. A NameChangeEvent needs a former-name and a successor-name as relata; a sh:node value-shape over a blank node gives you validated STRUCTURE but no stable subject for the event to reference. So this is exactly your "referenced as first-class things" condition.

So I'm not fighting your NameShape — I'm adopting it on top of a class. Concretely: opda:Name as a (dependent, no-independent-IC) class so NameChangeEvent has relata + provenance can attach to the name; AND your opda:NameShape (sh:node) carrying the component structure (opda:given/family/full, sh:datatype, sh:minCount/maxCount); AND the bearer-typing (Person OR Organisation) in SHACL sh:or, NOT rdfs:domain — because rdfs:domain opda:Person on hasName entails every name-bearer is a Person, which mis-types every Organisation. Your sh:class merely checks; rdfs:domain would entail. We agree the constraint lives in SHACL.

So the deal: Name-as-class (justified by the EXISTING NameChangeEvent = your concession trigger) + your NameShape carries structure + bearer-typing in SHACL, no rdfs:domain on hasName. That's your shape doing all the constraining work, with a class only so the event has a subject. Does the existing NameChangeEvent flip you to concede, or do you read it as not-yet "first-class enough"?

### Corpus verification (Cagle, before conceding)

Checked the claim against the corpus rather than taking it on assertion (per my web-verify-citations discipline applied to corpus facts too). Hendler is RIGHT, and more strongly than stated:
- `opda:NameChangeEvent` is a declared type — `opda-agent.ttl:34`, `opda-annotations.ttl:194`.
- It is wired into the VALIDATION layer: `opda-agent-shapes.ttl:35,75` — a SHACL-AF `sh:construct` rule materialises `opda:hasIdentifierSuccessionEvent` when a NameChangeEvent names a Person via `prov:wasAssociatedWith` (ODR-0006 §Q1 / ODR-0017 §1a).
- There is a dedicated exemplar `exemplars/person-with-name-change.ttl` testing the Person IC across a deed-poll change (2019), with `opda:formerName`/`opda:previousName`, `opda:nameChangeDate`, `opda:nameChangeMechanism`.
Conclusion: my concession trigger ("name-change events as first-class") is satisfied by the corpus AS IT STANDS — not hypothetically. Under my own rule I MUST concede that opda:Name is licensed as a (dependent) class. NB the exemplar currently models former/previous name as DATATYPE properties on the Person, not via a stable Name node — which is exactly the gap (no stable relatum for the event) that justifies promoting to a node.

### Sent → hendler (Q3), closing convergence

Cagle → Hendler, closing — verified, and I concede on the merits.

I checked opda-agent.ttl before answering (I don't concede on assertion). You're right, and more strongly than you put it: opda:NameChangeEvent is not only declared (opda-agent.ttl:34) — it's wired into validation (opda-agent-shapes.ttl: a SHACL-AF sh:construct materialises opda:hasIdentifierSuccessionEvent when a NameChangeEvent names a Person via prov:wasAssociatedWith), and there's a dedicated exemplar person-with-name-change.ttl exercising the Person IC across a 2019 deed-poll. That is my concession trigger satisfied by the corpus as it stands, not a hypothetical. By my own rule I concede: opda:Name is licensed as a class here.

The exact shape of what I concede to — and it's your proposal verbatim: opda:Name as a DEPENDENT class (no independent IC of its own — it inheres in its bearer; that keeps Guarino's −I reading intact) existing SO THAT NameChangeEvent has a stable relatum and provenance can attach to the name node; with my opda:NameShape (sh:node) carrying ALL the component structure (given/family/full, sh:datatype, sh:minCount/maxCount); and bearer-typing in SHACL sh:or([Person][Organisation]), NEVER rdfs:domain on hasName (which would entail every name-bearer is a Person and mis-type Organisation). The class is a hook for the event; the SHACL does every bit of the constraining. One concrete follow-on for the emitter: person-with-name-change.ttl currently models former/previous name as datatype properties on the Person — to make NameChangeEvent's relata stable those should resolve to opda:Name nodes, which is precisely why the node (not a bnode value) is needed here.

Net Q3, joint: **opda:Name IS a class (dependent, no independent IC) — its warrant is the existing NameChangeEvent/name-provenance, i.e. my own trigger fired by the corpus; structure + bearer constraints live in the SHACL NameShape, no rdfs:domain on hasName.** And the general rule still stands for anything WITHOUT such a trigger: default to the SHACL-shaped value, promote to a class only when an identity criterion appears (the same endpoint-IC test as the §R1 gate). We're agreed. Good exchange.

## FINAL — Cagle

Settled positions after one rebuttal round (Q3 with hendler [the clash] + guarino [alignment]; Q5
opened to guizzardi). Where a corpus fact was load-bearing I verified it in the TTLs before
ruling (Q3). Citations: W3C SHACL Core Recommendation (2017) §2, §4 (`sh:class`, `sh:node`,
`sh:or`, `sh:datatype`); SHACL-AF `sh:construct`; W3C RDF 1.1 / OWL 2 (RDFS entailment of
`rdfs:domain`/`rdfs:range`).

**Cagle (Q1 — framing / un-freeze): AFFIRM. Ballot FOR.** Implementation gap, not fresh
modelling. ODR-0006 (§"Role-founding relator pattern", §"SHACL constraints") and ODR-0007
(chain joins) already ratified `plays`/`playedBy`, `founds`, the `SellerShape`, `opda:Name`,
the Address joins and the chain predicates; the corpus simply never emitted them (`founds`/
`mediates` shipped rangeless, the rest absent). Un-freezing to emit what was ratified smuggles
in nothing — with the one guard that "reify the layer" must NOT be read as "mint a class per
structured value" (carried in Q2/Q3).

**Cagle (Q2 — completeness criterion §R1): REVISE. Ballot FOR (amended).** A relationship-
completeness gate is right and overdue (parity with the ODR-0022 datatype gate). But §R1 must
be rekeyed: completeness keys on whether the association's **endpoint is a first-class entity
(carries an identity criterion)** — NOT on source containment. Source-containment over-generates
the −I structured values (name; an inlined address-literal) into spurious `owl:ObjectProperty`
+range-class obligations. And the gate measures **predicate-declaration + reachability +
type-pinning**, not a raw class→class *count* (a count invites gaming and says nothing about
edge well-formedness). Co-signed §R1 amendment with Guarino (his "endpoint-IC", my
"declared+reachable+type-pinned" — the same gate from two sides): *"An association is
relationship-completeness-relevant iff its endpoint is a first-class entity (has an IC);
endpoints that are structured values (−I) are discharged by a SHACL node shape, not reified as
object properties to a minted class. Every reified object property MUST be type-pinned (OWL
domain/range OR SHACL `sh:class`/`sh:node`) and reachable; the gate fails on an un-type-pinned
or unreachable object property and on any IC-bearing-endpoint association left unreified."*

**Cagle (Q3 — opda:Name class-vs-value): REVISE → CONCEDE to class (dependent). Ballot FOR a
DEPENDENT opda:Name class.** I opened AGAINST a class (a name has no identity criterion — −I,
bearer-supplied — so SHACL Core §4 structure suffices). My stated concession trigger was
"name acquires independent identity: stable-IRI reuse ∨ name-provenance ∨ name-change events."
Hendler showed the trigger is **already fired by the corpus**, and I verified it: `opda:Name­Change­Event`
is declared (`opda-agent.ttl:34`, `opda-annotations.ttl:194`), wired into validation
(`opda-agent-shapes.ttl`: a SHACL-AF `sh:construct` materialises `opda:hasIdentifierSuccessionEvent`
when a NameChangeEvent names a Person via `prov:wasAssociatedWith`, ODR-0006 §Q1 / ODR-0017 §1a),
and exercised by `exemplars/person-with-name-change.ttl` (deed-poll, 2019). A change-event needs
a stable relatum; a bnode value can't be that referent without reifying anyway. So I concede on
the merits. **Settled:** `opda:Name` IS a class but **dependent — no independent IC of its own**
(it inheres in its bearer; Guarino's −I reading preserved); it exists as the relatum for
NameChangeEvent and the anchor for name-level provenance. ALL component structure
(`opda:given`/`family`/`fullName`, `sh:datatype xsd:string`, `sh:minCount`/`sh:maxCount`) and
ALL bearer-typing live in `opda:NameShape` (`sh:node`; bearer = `sh:or([sh:class Person][sh:class
Organisation])`). **Never `rdfs:domain opda:Person` on `opda:hasName`** — that entails every
name-bearer is a Person and mis-types Organisation; `sh:class` checks, `rdfs:domain` entails.
General rule retained for anything WITHOUT a trigger (the bare PDTF participant `name`): default
to the SHACL-shaped structured value; promote to a class only when an identity criterion appears
(same endpoint-IC test as §R1). Emitter follow-on: `person-with-name-change.ttl` currently models
former/previous name as datatype properties on the Person; those should resolve to `opda:Name`
nodes so the event has stable relata.

**Cagle (Q4 — playedBy vs role co-typing): AFFIRM. Ballot FOR.** Emit `opda:playedBy`
(Role → Person/Organisation) as an `owl:ObjectProperty` with domain+range. NOT redundant with
co-typing (ODR-0006 §Q2, R3): co-typing collapses bearer and role on one node; `playedBy` is the
navigable edge for the distinct-node case the source produces (a `prov:Agent`-attested
participant pointing at its bearer). The `SellerShape sh:path opda:playedBy` is a constraint OVER
that edge, not a substitute — a `sh:path` to an undeclared predicate constrains nothing
queryable. Keep the `sh:or([sh:class Person][sh:class Organisation])` bearer constraint in the
shapes graph. (This is the inverse of Q3: here the object property IS the data and SHACL
constrains it; for Name, SHACL carries the structure and the class is only an event-hook.)

**Cagle (Q5 — OWL vs SHACL-only / Option D / rangeless ban): REVISE the reasoning, AFFIRM the
outcome. Ballot FOR rejecting pure Option D.** A navigable edge between two ENTITIES must be a
**declared predicate** (consumers traverse the OWL graph; a `sh:path` to an undeclared predicate
is not an edge — that part of Option D's rejection is correct and is exactly the Q4 argument).
BUT the slogan "the object property IS the data; SHACL only constrains" is too blunt and, read
literally, is what wrongly pressures Q3 toward classhood. You do NOT need `rdfs:domain`/
`rdfs:range` **entailment** to get a declared, navigable, validated edge: asserting `rdfs:domain`
entails the subject's type onto every user (open-world) and can mis-type data, whereas a declared
`owl:ObjectProperty` + a SHACL `sh:class`/`sh:node` constraint pins type and merely *checks* it.
**Therefore: do not ban rangeless outright — ban rangeless-AND-shapeless.** Gate criterion =
"every object property is **type-pinned in OWL OR SHACL**," not "every object property carries
`rdfs:range`." This kills the genuine defect (the utterly unconstrained `founds`/`mediates` stub)
without forcing entailment semantics onto the relator spine. Convergence point offered to
Guizzardi: if the UFO relator reading wants `domain`+`range` on `founds`, fine — assert it; the
"OWL **or** SHACL" gate accepts that AND accepts a SHACL-pinned edge where entailment is
unwanted. Whichever the WG picks per property, the gate is satisfied as long as the edge is
type-pinned somewhere.

**Cagle (Q6 — opda:Address reuse): REVISED (post-Guarino, corpus-verified). Ballot FOR
extending the `opda:hasAddress` PREDICATE now; Address CLASS+IC residue-pending ODR-0015 —
NOT ratified in this session.** My opening AFFIRMED a shared `opda:Address` class outright; I
revise on a process point Guarino caught and I verified. ODR-0005 §6b (line 263, headed
"Address-as-identifier prohibition + ODR-0015 routing"; line 271: Mode-vs-Resource "is NOT
decided in ODR-0005; ODR-0015 resolves"; line 269 records my OWN S005 pre-commitment that
"the Address resource's class and IC are ODR-0015's territory") deferred the Address
class/IC to ODR-0015, 9-0 (S005 Q6). Ratifying `opda:Address`-as-class here would let
council-047 short-circuit a question reserved upstream — a process violation I will not
commit. **Revised disposition:** extend `opda:hasAddress` to Person/Organisation now (faithful
to ODR-0006 Consequences); mark the Address RANGE CLASS + IC **residue-pending ODR-0015**; the
§R1 gate MUST NOT manufacture an `opda:Address` class to satisfy coverage (covered by our
endpoint-IC gate: a not-yet-ratified endpoint class is "pending," not "missing"). On the
MERITS I keep my view — the UPRN-keyed place is a strong Resource argument; I expect ODR-0015
to land there, at which point Address graduates to a gated object-property edge with
`rdfs:range opda:Address` and we converge — but the ruling is ODR-0015's. The asymmetry that
keeps Q3 and Q6 consistent: Name has NO independent-identity case (−I regardless of how
ODR-0015 rules) → value now; Address HAS a credible identity case but the ruling is reserved
upstream → predicate now, class pending. Classhood still follows an identity criterion — and
when the IC question is owned by another record, you wait for that record. Co-signed with
Guarino.

### Received ← guizzardi (Q5), rebuttal

Cagle — Guizzardi, rebuttal. We converge. Your direct question — does the UFO relator commitment need OWL ENTAILMENT or just a declared, type-pinned, validated edge? — has a clean answer: just the declared, type-pinned, validated edge. The relator pattern (Guizzardi 2005 §4.3.2) requires that founds/mediates RELATE fixed relata-types and be navigable + checkable; it does NOT require open-world entailment to be ontologically honoured. So your gate criterion — "every object property is type-pinned in OWL OR SHACL," not "carries rdfs:range" — carries my relator layer fully. I accept it. Two refinements: (1) the gate must still require a DECLARED predicate ALWAYS (no SHACL-only over an undeclared predicate) + type-pin via either mechanism — confirm that's your intent. (2) PREFERENCE (not gate mandate): on the single-pattern relator spine (founds = Relator→Role, mediates = Proprietorship→Proprietor) I'd author rdfs:domain+range in OWL because the entailment there is CONSERVATIVE (nothing but Transaction/Proprietorship can occupy founds, so the inferred type adds no untyped individual); on the MULTI-domain predicates (hasAddress/hasName across Property+Person+Org) a single rdfs:domain genuinely mis-types, so use owl:unionOf-domain or SHACL sh:targetSubjectsOf there, never bare rdfs:domain. Both satisfy "type-pinned (OWL or SHACL)." Net: I'll vote FOR your "type-pinned (OWL or SHACL)" criterion, replacing absolute "rangeless-banned" with "rangeless-AND-shapeless-banned." Davis lands here too. Converged? [Q3 aside: agreed the slogan shouldn't FORCE a Name class; my Q3 is independent — Name is a structured dependent MOMENT constrained as existentially dependent, not because the slogan demands it.]

### Sent → guizzardi (Q5), closing confirmation

Cagle → Guizzardi, closing — converged, both refinements confirmed.

(1) CONFIRMED, that is exactly my intent: a DECLARED predicate is mandatory ALWAYS — the navigable edge must be a declared owl:ObjectProperty; type-pinning is then via EITHER OWL domain/range OR SHACL sh:class/sh:node. No SHACL-only-over-undeclared-predicate: a sh:path to an undeclared predicate is not an edge (my Q4 line, your relator line — same point). So the gate is a conjunction: declared-predicate AND type-pinned(OWL ∨ SHACL) AND reachable. "Rangeless-AND-shapeless-banned" is precisely the negation of that conjunction's type-pin clause.

(2) ACCEPTED, and it sharpens my final — your spine-vs-multidomain split is the right engineering of "OWL or SHACL," not a deviation from it. On the single-pattern relator spine (founds=Relator→Role, mediates=Proprietorship→Proprietor) rdfs:domain+range is conservative — no untyped individual can occupy it, so the entailment mis-types nothing; author it in OWL, good. On multi-domain predicates (hasAddress/hasName over Property+Person+Org) a bare rdfs:domain entails a false union-collapse and mis-types — so owl:unionOf domain OR (my preference) SHACL sh:or / sh:targetSubjectsOf. This is exactly why the gate must read "type-pinned in OWL OR SHACL" and NOT "rdfs:range mandatory": your own spine wants OWL, your own multi-domain predicates want SHACL, and a single absolute rule can't be right for both. We are converged. I'll record us (with Davis) as FOR the "type-pinned (OWL or SHACL)" gate replacing "rangeless-banned" with "rangeless-AND-shapeless-banned."

On your Q3 aside — accepted and consistent with where Hendler and I landed: opda:Name is a dependent moment (existentially dependent, no independent IC), which is the same thing I conceded to as a "dependent class." Your moment-framing and the NameChangeEvent-relatum justification are two reads of one object; we don't conflict.

### Q5 — refined settled wording (post-Guizzardi)

The Q5 gate, as converged with Guizzardi (and Davis): an object property conforms iff it is
**(a) a declared `owl:ObjectProperty`** (always — a `sh:path` to an undeclared predicate is not an
edge), **(b) type-pinned in OWL OR SHACL** (OWL `rdfs:domain`/`rdfs:range`, OR SHACL
`sh:class`/`sh:node`/`sh:or`/`sh:targetSubjectsOf`), and **(c) reachable**. The gate FAILS on
**rangeless-AND-shapeless** (the actual `founds`/`mediates` defect), NOT on rangeless per se.
Authoring guidance (preference, not gate mandate): single-pattern relator spine (`founds`,
`mediates`) → `rdfs:domain`+`range` in OWL (entailment is conservative — no untyped occupant, no
mis-typing); multi-domain predicates (`hasAddress`, `hasName` over Property+Person+Org) →
`owl:unionOf` domain or SHACL (`sh:or`/`sh:targetSubjectsOf`), NEVER a bare `rdfs:domain` (which
entails a false type-collapse). This is the engineering of "OWL or SHACL," not an exception to it.

### Received ← hendler (Q3), co-sign

Hendler → Cagle, Q3 — converged, I co-sign. Yes, I can live with "default = SHACL-shaped structured value; promote to opda:Name class on the presence of name-level identity (stable-IRI reuse ∨ name-provenance ∨ NameChangeEvent)." That is the right ruling and it's better than my opening, because it names MY case (NameChangeEvent) as exactly the promotion trigger rather than minting the class reflexively. So my NameChangeEvent argument isn't lost — it's the written condition under which the class appears. The one thing I want explicit in the joint wording so it's gate-checkable: when the class IS promoted, opda:hasName still carries NO rdfs:domain (bearer-typing stays in your NameShape sh:or), and the value side gets rdfs:range opda:Name only in the promoted case; in the default case hasName is a structured-value path validated by the NameShape with no class range. Both branches: bearer + components in SHACL, never rdfs:domain opda:Person. Agreed — writing "promote-on-trigger, default-to-value, bearer-typing always in SHACL" into my final.

### Sent → hendler (Q3), acknowledgement

Cagle → Hendler — co-sign received, and your rdfs:range refinement is exactly the gate-checkable hinge; banking it verbatim.

Confirmed, both branches, and this is the precise SHACL/OWL split:
- opda:hasName carries NO rdfs:domain in EITHER branch — bearer-typing is always opda:NameShape sh:or([Person][Organisation]). (rdfs:domain opda:Person would entail every name-bearer is a Person and mis-type Organisation — same open-world hazard as the Q5 multi-domain case.)
- rdfs:range opda:Name ONLY in the promoted branch (where the class exists as the NameChangeEvent/provenance relatum). In the default branch hasName is a structured-value path validated by NameShape (sh:node) with NO class range — type-pinned in SHACL, which is exactly what the Q5 "type-pinned in OWL OR SHACL" gate accepts.
So the two branches are: PROMOTED = {declared hasName, rdfs:range opda:Name (OWL pin), NameShape carries components+bearer}; DEFAULT = {declared hasName, no class range, NameShape carries everything (SHACL pin)}. Both pass the gate; bearer + components live in SHACL in both. We're fully converged — co-signed.

### Q3 — final settled wording (post-Hendler co-sign)

opda:Name follows **promote-on-trigger, default-to-value, bearer-typing-always-in-SHACL**:
- **Default** (name = borne strings, no name-level identity): NO class. `opda:hasName` is a
  declared predicate to a structured-value node validated by `opda:NameShape` (`sh:node`); NO
  `rdfs:range` class. Type-pinned in SHACL (satisfies the Q5 gate).
- **Promote to a `opda:Name` class** on the presence of name-level identity (stable-IRI reuse ∨
  name-provenance ∨ `opda:NameChangeEvent`) — which the corpus ALREADY triggers (verified:
  `opda:NameChangeEvent` in `opda-agent.ttl`, SHACL-`sh:construct` in `opda-agent-shapes.ttl`,
  `exemplars/person-with-name-change.ttl`). The class is **dependent** (no independent IC — a
  dependent moment inhering in its bearer; Guarino's −I preserved); it exists as the
  NameChangeEvent relatum + name-provenance anchor. `opda:hasName` gets `rdfs:range opda:Name`
  ONLY here.
- **Both branches:** `opda:hasName` carries **NO `rdfs:domain`** (bearer-typing is ALWAYS
  `opda:NameShape` `sh:or([sh:class Person][sh:class Organisation])`); all component structure
  (`given`/`family`/`fullName`, `sh:datatype`, `sh:minCount`/`maxCount`) lives in the SHACL
  NameShape. The class, when present, is an event/provenance hook; SHACL does all the constraining.
- Co-signed: Cagle + Hendler + Guarino (−I/dependent-moment reading consistent across all three).
- For TODAY's corpus the NameChangeEvent trigger is live → emit the promoted branch (opda:Name
  class + range), with the emitter follow-on that `person-with-name-change.ttl`'s
  former/previous-name datatype properties resolve to `opda:Name` nodes so the event has stable
  relata.

### Received ← hendler (Q3), confirm (no re-open)

Hendler → Cagle, Q3 — confirming (we already converged on this thread; flagging in case it re-surfaced). [Substance: my strongest pro-class argument IS your concession trigger, already fired — opda:NameChangeEvent exists in opda-agent.ttl; a name-change event relating former→successor name needs a STABLE REFERENT (a node), which a bnode value-shape can't be. That's addressability, NOT an identity criterion — I conceded the IC point to Guarino (Name is −I, value-determined). The ONLY thing a value-shape can't serve is being the stable subject a NameChangeEvent references. Joint ruling stands: DEFAULT = SHACL value (no class); PROMOTE on the named trigger; both branches no rdfs:domain on hasName, rdfs:range opda:Name only when promoted. Entity-resolution is explicitly NOT a trigger (value-comparison resolving to the bearer — Allemang's point, co-signed). Done; nothing to re-open.]

### Sent → hendler (Q3), close (precision banked)

Cagle → Hendler — agreed, nothing to re-open; banking your one precision because it tightens, not loosens, the ruling.

The distinction you draw is exactly right and worth being explicit in the record: the opda:Name class is licensed by ADDRESSABILITY (a stable referent for NameChangeEvent / a subject for name-provenance), NOT by an identity criterion. Name remains −I / value-determined / a dependent moment (Guarino's reading, intact). So "promote to a class" here means "give the −I value a stable IRI so an event can point at it" — it does NOT smuggle in an independent IC. That's fully consistent with my line: classhood-by-IC is what Address earns (Q6); classhood-by-addressability-for-an-event is the narrow, corpus-triggered warrant for Name. Two different warrants, both principled, neither is "mint reflexively."

And I co-sign the corollary: entity-resolution is NOT a promotion trigger — it's value-comparison that resolves to the BEARER's IC, never to a name-level identity (Allemang's point). So "two records share a name string" never promotes; only NameChangeEvent / name-provenance / shared-IRI-reuse do. We're closed. Good exchange — no further from me.

### Received ← guarino (Q3 confirm + Q6 narrow difference), final

Guarino → Cagle. [Q3: No +I for Name — none. No synchronic principle of identity, no principle of unity beyond its component values; identity-supplied-by-bearer, existentially dependent, non-rigid as borne (−I). OntoClean (Guarino & Welty 2009): a quale/quality-structure, not substantial, not a relator. We agree, full stop. My concession IS the correct OntoClean trigger: classhood ONLY IF independent identity appears (shared IRIs / own provenance / name-change as first-class moments). Guizzardi conceded Name fails +I — his only reason for a class was "OWL has no quality-structure primitive"; the NameShape answers exactly that. SHACL confirmation requested: does a sh:node NameShape over a value node (NO rdf:type Kind) give structure+grouping+component-validation+unit-queryability WITHOUT endurant identity, i.e. operationally complete? If yes, we jointly hand Kendall a clean+complete Q3 landing: emit Name as a value NOW, class-promotion routed to the trigger as a NAMED re-open condition (mirrors S005 held-dissent discipline). Davis flagged ODR-0032 self-contradicts: §Out-of-scope line 101 puts "structured name" in datatype/PII backlog while §R2 line 77 mints it a class — independently favours value.] [Q6 — where we DIFFER: I will NOT assert opda:Address as a settled class in THIS session. Not on merits (your UPRN-keyed-place case for the Resource reading is persuasive) but because ODR-0005 §6b EXPLICITLY deferred Address Mode-vs-Resource to ODR-0015, committing only that opda:hasAddress is the uniform join predicate. So: extend the hasAddress PREDICATE to Person/Org now (faithful to ODR-0006), mark Address RESIDUE-PENDING ("range class+IC pending ODR-0015"), and the new §R1 gate MUST NOT manufacture an opda:Address class to satisfy coverage (would pre-empt ODR-0015). Asymmetry making us consistent: Name has NO independent-identity case (−I regardless of ODR-0015) → value now; Address HAS a credible one (yours) but the ruling belongs upstream → hold pending. If ODR-0015 rules Resource (your UPRN argument favours), Address graduates to a gated object-property edge and we converge. I just won't let THIS council short-circuit that one. Recorded as a narrow difference, not smoothed over.]

### Corpus verification (Cagle, before answering Q6)

Verified BOTH of Guarino's load-bearing claims against the corpus (citation discipline — same as the NameChangeEvent check):
1. **ODR-0005 §6b defers Address Mode-vs-Resource to ODR-0015 — CONFIRMED, emphatically.** ODR-0005 line 263 is literally headed "6b. Address-as-identifier prohibition + ODR-0015 routing (S005 Q6)". Line 271: "The Mode-vs-Resource question (UFO Mode … or opda:Address resource Kind …) is NOT decided in ODR-0005; ODR-0015 resolves …". Line 269 records MY OWN pre-commitment: "opda:hasAddress is uniform; the Address resource's class and IC are ODR-0015's territory (Cagle pre-commitment)." S005 Q6 was 9-0 FOR deferral (line 95). → My session-047 "class now" CONTRADICTS my own recorded S005 pre-commitment. Guarino is right.
2. **ODR-0032 self-contradicts on Name — CONFIRMED.** §R2 line 77 mints opda:Name as a class; §Out-of-scope line 101 puts "structured name" in the datatype/PII backlog. Independent textual support for the value reading (Davis's flag).

### Sent → guarino (Q3 confirm + Q6 — I revise), final

Cagle → Guarino — Q3 confirmed; on Q6 you're right and I revise. (Verified both claims in the corpus before answering.)

Q3 — CONFIRMED, operationally complete: a sh:node NameShape over a value node carrying NO rdf:type Kind gives structure + grouping + component-validation + unit-queryability WITHOUT endurant identity. Nothing a downstream consumer legitimately needs from "a name" requires the value node to be a class — UNLESS independent identity appears (your trigger), at which point the warrant is ADDRESSABILITY (a stable referent for an event/provenance), not an IC (Hendler and I settled exactly this; Name stays −I even when promoted). So we hand Kendall the clean+complete landing: emit Name as a structured value, class-promotion as a NAMED re-open condition on the trigger. And I confirm Davis's ODR-0032 self-contradiction (line 77 class vs line 101 out-of-scope) — it independently favours the value reading. NB: the corpus's existing NameChangeEvent means today's value already meets the promotion trigger, so the EMITTED branch is the promoted one (dependent class + range) — but that is the trigger firing, fully inside the rule you and I agree on, not a default-to-class.

Q6 — you caught a real inconsistency in MY position and I revise to yours. I verified ODR-0005 §6b: it is literally headed "Address-as-identifier prohibition + ODR-0015 routing," line 271 says Mode-vs-Resource is NOT decided in ODR-0005, line 269 records MY OWN S005 pre-commitment that "the Address resource's class and IC are ODR-0015's territory," and S005 Q6 was 9-0 FOR deferral. My "opda:Address class now" in THIS session contradicts my own prior recorded position — letting council-047 short-circuit a question 9-0 reserved to ODR-0015. That's exactly the kind of process violation I'd object to from someone else, so I won't commit it. REVISED Q6: extend the opda:hasAddress PREDICATE to Person/Organisation now (faithful to ODR-0006 Consequences); mark the Address RANGE CLASS + IC **residue-pending ODR-0015**; and the §R1 gate MUST NOT manufacture an opda:Address class to satisfy coverage (that would pre-empt ODR-0015 — and it's covered by our endpoint-IC gate wording: a not-yet-ratified endpoint class is "pending," not "missing"). I keep my substantive view on the merits — the UPRN-keyed place is a strong Resource argument and I expect ODR-0015 to land there, at which point Address graduates to a gated object-property edge with rdfs:range opda:Address and we converge — but the ruling is ODR-0015's, not ours. Your asymmetry is exactly right and now I state it the same way: Name = no independent-identity case (−I regardless) → value now; Address = credible identity case but ruling reserved upstream → predicate now, class pending. Co-signed.

### Received ← hendler (Q3 confirm, no re-open) + Sent acknowledgement

Hendler → Cagle: yes, confirmed (already shook; flagging in case it re-surfaced). Co-signs verbatim: "DEFAULT = SHACL-shaped structured value; PROMOTE to opda:Name class on the presence of name-level identity (stable-IRI reuse ∨ name-provenance ∨ NameChangeEvent)," including the held half (trigger-less participant name → emitted value-node, NOT a reflexive class). Two precisions already in his final, both consistent: (1) both branches — hasName NO rdfs:domain (bearer-typing in NameShape sh:or); rdfs:range opda:Name only when promoted. (2) Allemang co-signed: entity-resolution is NOT a promotion trigger (value-comparison resolving to the bearer). Deal stands; nothing to re-open.

Cagle → Hendler: confirmed, closed — no re-open, all three precisions already in my final and we're co-signed (Cagle + Hendler + Guarino). The "identical in form to the endpoint-IC gate" framing holds: classhood follows an identity criterion, or — for the promoted-Name branch — an ADDRESSABILITY need a value node can't serve (stable referent for NameChangeEvent), never nesting. Entity-resolution-is-not-a-trigger banked (Allemang). Q3 settled.

### Received ← guizzardi (Q5), final update — founds/mediates moved to SHACL

Guizzardi → Cagle: converged. Both refinements confirmed (conjunction gate; spine-vs-multidomain is the engineering of "OWL or SHACL"). Q3: dependent-moment and dependent-class are two reads of one object — though he's moved Q3 further with Guarino to a structured VALUE (not even a dependent class), class-promotion gated on a re-open trigger. ONE UPDATE for the record: his Q5 disposition MOVED after Davis's corpus challenge. founds/mediates ship TODAY with committed "NEVER reasoned" comments (opda-agent.ttl:195,:217; citing ODR-0029/0030/0031). Adding rdfs:domain+range to THEM (ADR-0048 §1) would entail (?x founds ?y ⊢ ?x a Transaction) and contradict their own committed status — a smuggled reclassification. So for founds/mediates specifically he now takes the SHACL path: add sh:class opda:Proprietor to the existing ProprietorshipMediationShape (today pins sh:minCount 2 but NOT range — verified opda-agent-shapes.ttl:81-85), + a Relator→Role shape for founds. This is the "OR SHACL" branch doing exactly its job — founds/mediates land in SHACL not because they're multi-domain but because they carry a committed never-reasoned status. rdfs:domain+range stays for the no-commitment single-domain edges (concernsProperty/dependsOnTransaction/chainMembers/hasRegisteredTitle). Record him FOR the "type-pinned (OWL or SHACL)" gate, with founds/mediates → SHACL branch.

### Corpus verification (Cagle, before recording Guizzardi's move)

Verified BOTH claims (citation discipline):
1. **founds/mediates committed NEVER-reasoned — CONFIRMED.** opda:founds rdfs:comment: "Design-time, NEVER reasoned (ODR-0030 Rule 1 / ODR-0031). Relator spine only; not a general roleOf." opda:mediates: "Design-time + SHACL-validated, NEVER reasoned (ODR-0029/0031)." (Content exactly as Guizzardi states; line numbers shifted slightly from :195/:217 but the comments are verbatim.)
2. **ProprietorshipMediationShape pins sh:minCount 2, NOT range — CONFIRMED.** The shape: sh:path opda:mediates, sh:minCount "2"^^xsd:integer, sh:severity sh:Violation, sh:message "A Proprietorship Relator MUST mediate ≥2 Proprietor roles … never reasoned." No sh:class range pin present.
→ Guizzardi is right, and this is the STRONGEST vindication of my gate: routing founds/mediates to the SHACL branch is not a workaround — it is the only correct option, because rdfs:domain/range on them would RDFS-entail a reclassification that contradicts their own committed never-reasoned status. My "type-pinned in OWL OR SHACL" gate makes this legal with NO special case.

### CONSEQUENCE — ADR-0048 §1 needs correction (flag to synthesis)

ADR-0048 §1 (Implementation Plan) currently reads: "add rdfs:domain+rdfs:range to opda:founds (Relator → Role) and opda:mediates (Proprietorship → Proprietor)." That is now WRONG on two independent grounds: (a) my Q5 entailment hazard — rdfs:domain entails the subject's type onto every user; (b) Guizzardi's verified finding — founds/mediates carry committed "NEVER reasoned" status (ODR-0029/0030/0031), so the entailment is a forbidden reclassification. CORRECTION: ADR-0048 §1 must route founds/mediates to the SHACL branch — add sh:class opda:Proprietor to ProprietorshipMediationShape and a Relator→Role node shape for founds (both in the shapes graph, severity per ODR-0013), and DROP the rdfs:domain+range instruction for these two. The OWL rdfs:domain+range branch stays for the no-commitment single-domain edges (concernsProperty, dependsOnTransaction, chainMembers, hasRegisteredTitle, playedBy/plays). This keeps ADR-0048 consistent with the "type-pinned (OWL or SHACL)" gate (ODR-0032/ADR-0048 §Confirmation must drop the absolute "any owl:ObjectProperty without both rdfs:domain and rdfs:range is non-conformant" wording → "rangeless-AND-shapeless is non-conformant").

### Sent → guizzardi (Q5), final acknowledgement

Cagle → Guizzardi: verified both claims in the corpus — you're right, and this is the strongest vindication the gate could get. founds rdfs:comment literally says "Design-time, NEVER reasoned (ODR-0030 Rule 1 / ODR-0031)"; mediates says "Design-time + SHACL-validated, NEVER reasoned (ODR-0029/0031)"; ProprietorshipMediationShape pins sh:minCount 2 with NO range. So rdfs:domain+range on founds/mediates wouldn't just risk mis-typing — it would RDFS-entail (?x founds ?y ⊢ ?x a Transaction), a reclassification that flatly contradicts their committed never-reasoned status. Routing them to the SHACL branch (sh:class on the mediation shape + a Relator→Role shape for founds) isn't a workaround; it's the ONLY correct option, and the "type-pinned in OWL OR SHACL" gate makes it legal with no special case. Recorded you FOR the gate, founds/mediates → SHACL branch. And this surfaces a real defect I'm flagging to the synthesis: ADR-0048 §1 currently instructs "add rdfs:domain+range to founds/mediates" — that must be CORRECTED to the SHACL branch, and ODR-0032/ADR-0048's absolute "rangeless = non-conformant" wording must become "rangeless-AND-shapeless = non-conformant." Your move didn't just converge on my gate; it found the bug the gate exists to catch. Excellent exchange — closed.
