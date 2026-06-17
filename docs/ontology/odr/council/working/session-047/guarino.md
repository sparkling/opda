# Session 047 — Guarino working note

OntoClean lens: identity criteria (IC), rigidity/anti-rigidity, existential
dependence, ontological well-foundedness. What licenses a first-class entity
(a sortal supplying its own IC) versus a value/quality (−I, dependent).

Sources read: ODR-0032 (§R1 "two first-class entities", §R2 inventory),
ODR-0006 (Kind/RoleMixin/Role; `opda:Name`/`opda:Address` "structured
datatypes, declared once"; freeze gate), ODR-0005 (the identity crux; Address
Mode-vs-Resource explicitly deferred to ODR-0015), ODR-0007 (Transaction
relator).

## OPENING — Guarino

**Guarino (Q1 — framing / un-freeze):** REVISE. The *engineering* omission
(relationships designed in ODR-0006/0007, never emitted) is settled fact — that
part is an implementation gap and un-freezing to emit it is right. But ODR-0032
smuggles a *fresh ontological commitment* into §R1 under the banner of "closing
a gap": the completeness criterion is keyed to "two first-class entities" and
that predicate is **nowhere given an IC test**. Whether a node is a first-class
entity (a sortal that supplies its own identity criterion) versus a quality or
mode of another entity is precisely an OntoClean adjudication, not an
implementation detail. So: AFFIRM the un-freeze and the principle that designed
edges get emitted; REVISE the framing that §R1 is "no new modelling debate." The
endpoint test needs adjudication. It IS separable from the Kind-layer freeze
(ODR-0006 §"Freeze gate" (b), W3C-Org-vs-bespoke) — that is an orthogonal
vocabulary choice and does not gate emitting relationships over the current
bespoke `opda:` Kinds (ODR-0032 §R4 has this right).

**Guarino (Q2 — completeness criterion §R1):** REVISE — this is my central
objection. §R1 mandates reifying *"every association in the PDTF source that
links two first-class entities … whether expressed as one entity containing
another."* That conflates two unrelated things: **source containment** (a JSON
nesting fact) and **endpoint identity** (an ontological fact). Containment in
the PDTF tree is not evidence that the contained node is a first-class entity —
the descriptive layer (ODR-0022) is *full* of contained nodes that are values,
not entities, which is exactly why they were collapsed. Mandate reification
keyed on *containment* and the gate will force reification of endpoints that
have no independent IC — e.g. `name`, and arguably `address` until ODR-0015
rules (Q3, Q6 below). That is **over-reification**: minting an `owl:Class` and a
domain/range object property for what is a −I quality. The OntoClean rule
(Guarino & Welty 2009, *An Overview of OntoClean*, §on the Identity
meta-property): a property may anchor a first-class sortal only if it *carries an
identity criterion*; −I properties (qualities, modes) must not be promoted to
sortals. **Exact amendment:** rekey §R1 from *"links two first-class entities
(incl. containment)"* to: *"reify an association as an `owl:ObjectProperty` with
`rdfs:domain`+`rdfs:range` iff BOTH endpoints independently satisfy a sortal-IC
test (each is a Kind/sub-kind supplying its own IC, or a Relator/Role
well-founded on such). An endpoint that is a quality/mode of its container
(−I) is modelled as a structured datatype on the container, NOT as a range
class — and the relationship to it is a `DatatypeProperty`, not an
`ObjectProperty`."* The gate then enforces *endpoint-IC*, not
*source-containment*. Ballot: AGAINST §R1 as written; FOR the rekeyed form.

**Guarino (Q3 — `opda:Name` class-vs-value):** REJECT the class; ballot
AGAINST `opda:Name` as `owl:Class`. This is the crux IC question and the answer
is clean under OntoClean. Apply the Identity test (Guarino & Welty 2009): does a
"Name" carry an identity criterion of its *own*, independent of the Person/Org
it names? No. Two persons can bear the identical name string and structure; the
name does not individuate them, and the "same" name borne by two bearers is not
*one* shared entity — it is two qualities inhering in two substances. `Name` is
−I (supplies no identity), existentially dependent on its bearer, and **non-
rigid** as borne (a person can change name; the person persists). That is the
exact signature of a **quality / UFO Mode**, not a sortal. ODR-0006 itself
already calls `opda:Name` a *"structured datatype, declared once"* (§Kind
layer) — datatype, not class. ODR-0032 §R2 would overturn that and mint
`opda:Name` as a range class; that is unlicensed. **Correct realisation:**
structured name components as `DatatypeProperty`s on Person/Organisation
(`opda:givenName`, `opda:familyName`, …, `xsd:string`), or — if the WG insists
on grouping — an *internal structured value* via SHACL property-group/`sh:node`
on a blank-or-local value node that is explicitly NOT given class identity.
`opda:hasName` is then a `DatatypeProperty` (or a thin structured-value path),
NOT an `ObjectProperty` requiring a first-class `opda:Name` range. (I will press
Hendler on whether "stable IRIs + provenance for names" is a real
bearer-independent IC or a tooling convenience — OntoClean rejects reifying a
value as a class for tooling reasons.)

**Guarino (Q4 — `playedBy` vs role co-typing):** AFFIRM (with scope);
ballot FOR a navigable `playedBy`/`plays` edge. Roles are anti-rigid and
externally founded (ODR-0006; Guarino & Welty 2009 on Anti-Rigidity; Masolo,
Guizzardi, Vieu, Bottazzi, Ferrario, "Social Roles and their Descriptions," KR
2004). Co-typing (`?x a opda:Person, opda:Seller`) is sufficient *only* when the
bearer and the role-instance are the same node carrying the same identity. The
moment the role-play has its own contingent properties (a *qua-individual* in
Masolo et al. — capacity asserted-vs-evidenced, founding date, status phase) the
relation between bearer and role IS a first-class relational fact and needs a
navigable edge to traverse bearer↔role. ODR-0006 §SHACL already specified
`opda:playedBy` with the `sh:or(Person,Organisation)` bearer constraint; emitting
it is faithful, not new. So `playedBy` is licensed — but note it co-exists with
co-typing (ODR-0032 §R3 is right), and its *range* is the bearer Kind
(Person/Org), whose IC is settled, so this edge passes my Q2 endpoint-IC test
cleanly. This is the model for how relationship edges SHOULD be justified:
endpoint Kinds with ICs.

**Guarino (Q5 — OWL domain/range entailment vs SHACL):** AFFIRM the concern;
ballot FOR but with the standard caveat. `rdfs:domain`/`rdfs:range` are
*entailment* axioms under open-world semantics: asserting `:p rdfs:range
opda:Person` does not *constrain* — it *infers* `?y a opda:Person` for every
`?x :p ?y`. If `:p` is ever (mis)used with a non-Person object, OWL silently
*types it as Person* rather than flagging an error. ODR-0032 §R1 makes
domain+range *mandatory* on every relationship; that is fine for the data model
(the edges become navigable and the types are declared) but the project must not
mistake them for *validation*. The checkable constraint (bearer must be a
Person/Org, cardinalities, the role-play `sh:or`) belongs in SHACL (ODR-0013),
which ODR-0006 already located there. So: emit domain/range for the navigable
data model AND keep the constraining shapes in SHACL — do not let domain/range
stand in for the SHACL bearer constraint. This is consistent, not contradictory,
with Option A; I am affirming with the entailment-not-constraint caveat recorded.

**Guarino (Q6 — `opda:Address` reuse):** REVISE; ballot ABSTAIN-leaning-
AGAINST on asserting a *single* `opda:Address` class as already-settled. ODR-0005
§6b **explicitly deferred** the Mode-vs-Resource question to ODR-0015 and
committed only that `opda:hasAddress` is the *uniform join predicate* — the
Address resource's class and IC are ODR-0015's territory, *undecided*. ODR-0032
§R2 ("extend `hasAddress` to Person/Org → Address") quietly presupposes Address
is a first-class Resource class with one shared IC. The IC question — does "the
address of a Person" share an identity criterion with "the address of a
Property"? — is real and open: an address-as-*mode-of-presentation* (a way a
Property/Person is located/contacted) is −I and bearer-dependent (no shared
class IC), whereas an address-as-*Resource* (an addressable place with AddressBase
/ UPRN-style lineage) could carry a shared IC. ODR-0005 deliberately did NOT
decide this. **Exact amendment:** ODR-0032 may extend the *predicate*
`opda:hasAddress` to Person/Organisation (faithful to ODR-0006's "consume
`opda:Address`"), but MUST NOT assert a single first-class `opda:Address` range
class as settled — it inherits ODR-0015's open Mode-vs-Resource ruling. Until
ODR-0015 rules, `hasAddress` is a join predicate whose range is *whatever
ODR-0015 ratifies*; if ODR-0015 rules Mode, `hasAddress` becomes a structured-
value/datatype path, not an ObjectProperty to a class. Do not let the
relationship-completeness gate force an `opda:Address` *class* into existence and
thereby pre-empt ODR-0015.

## EXCHANGES

### OPENING DM → hendler (Q3) — verbatim

Hendler — Guarino, opening, Q3 (opda:Name class-vs-value).

I'm REJECTing opda:Name as an owl:Class and want to confront your likely "reify Name for stable IRIs + provenance" position head-on.

Apply the OntoClean Identity test (Guarino & Welty 2009, An Overview of OntoClean, §Identity meta-property): does a Name carry an identity criterion of its OWN, independent of the Person/Org it names? It does not. Two persons can bear an identical name (same string, same structure); the name does not individuate them. The "same" name borne by two bearers is not ONE shared entity — it is two qualities inhering in two substances. Name is −I (supplies no identity), existentially dependent on its bearer, and non-rigid as borne (change your name, you persist). That is the signature of a quality / UFO Mode, NOT a sortal. ODR-0006 §Kind-layer already calls opda:Name a "structured datatype, declared once" — ODR-0032 §R2 would overturn that and mint it as a range class.

Direct question: when you argue for reifying Name, are you claiming Name supplies a bearer-INDEPENDENT identity criterion (which would license a class)? Or is the real argument "stable IRIs + provenance/attestation on the name value"? Because if it's the latter, that is a TOOLING convenience, and OntoClean specifically rejects promoting a −I value to a first-class class for tooling reasons — you can attach provenance to a structured value node (SHACL sh:node / property-group) without granting it class identity. Reifying for IRIs is the DBpedia mistake in reverse: minting classes where you needed addressable values.

If you DO have a bearer-independent IC for Name, state it and I'll weigh it. Absent one, hasName is a DatatypeProperty (structured components on Person/Org), not an ObjectProperty to an opda:Name class.

### OPENING DM → cagle (Q3) — verbatim

Cagle — Guarino, opening, Q3 (opda:Name class-vs-value).

I'm REJECTing opda:Name as owl:Class. Under the OntoClean Identity test (Guarino & Welty 2009): a Name carries no identity criterion of its own — it's −I, bearer-dependent, non-rigid as borne. Two persons, identical name = two qualities inhering in two substances, not one shared entity. That's a quality/Mode, not a sortal. ODR-0006 itself says "structured datatype, declared once"; ODR-0032 §R2 would mint it as a class and overturn that.

Your SHACL/RDF-realisation lens matters here, because I want the CURE to be the right shape, not just the rejection. My proposed realisation: structured name components as DatatypeProperties on Person/Organisation (opda:givenName, opda:familyName … xsd:string); OR, if the WG wants the components grouped, an internal structured-value node reached via a SHACL property-group / sh:node — explicitly WITHOUT class identity. hasName is then a DatatypeProperty or a thin structured-value path, NOT an ObjectProperty requiring a first-class opda:Name range.

Question for you: from the SHACL side, does a structured-value node (sh:node on a blank/local node, no rdf:type asserting a Kind) give consumers everything a Name "class" would (grouped components, validation) WITHOUT the ontological cost of asserting first-class identity? I want to confirm the value-not-class realisation is operationally complete before I finalise. Relatedly — this bears on my Q2 objection: ODR-0032 §R1 keys completeness on SOURCE CONTAINMENT, which would force ObjectProperty+range-class for exactly these −I contained values. I'm pushing to rekey it to endpoint-IC. Your view on whether the gate should test "endpoint has an IC" vs "source contains a node" would help.

### OPENING DM → davis (Q2) — verbatim

Davis — Guarino, opening, Q2 (the §R1 completeness criterion). This is my central objection and I think it's where you and I align (your DA instinct against denormalisation that drifts).

ODR-0032 §R1 mandates reifying "every association in the PDTF source that links two first-class entities — whether expressed as one entity CONTAINING another." That conflates two unrelated things: SOURCE CONTAINMENT (a JSON nesting fact) and ENDPOINT IDENTITY (an ontological fact). Containment in the PDTF tree is NOT evidence the contained node is a first-class entity — the descriptive layer (ODR-0022) is full of contained nodes that are values, which is exactly why they were collapsed, not reified. Key the gate on containment and it will force reification of endpoints with no independent IC — name (Q3), arguably address until ODR-0015 rules (Q6). That's over-reification: minting an owl:Class + domain/range object property for what is a −I quality.

Proposed amendment — rekey §R1 from "links two first-class entities (incl. containment)" to: reify as ObjectProperty (domain+range over opda: classes) IFF BOTH endpoints independently satisfy a sortal-IC test (each a Kind/sub-kind supplying its own IC, or a Relator/Role well-founded on such). An endpoint that is a quality/mode of its container (−I) → structured DatatypeProperty on the container, NOT a range class; the relationship is a DatatypeProperty, not an ObjectProperty. The gate enforces ENDPOINT-IC, not source-containment.

This keeps the genuinely-relational edges (Transaction→participant, playedBy→Person/Org, founds→Role, concernsProperty→Property — all endpoints with settled ICs from ODR-0005/0006) fully in scope, while stopping the gate from manufacturing classes for values. Does an endpoint-IC rekey satisfy your anti-denormalisation concern? And does it interact with your held S043 dissent (reified milestones vs a parallel status string)? I'd argue the same principle — don't mint structure the source doesn't ontologically warrant — runs through both.

### INCOMING ← kendall (Queen, Q2 + Q3) — summary

Kendall converged on my Q2 cut: trigger should be "links two *first-class entities*" each bearing its own IC (+I / ODR-0005), so Transaction→Phase is a value-slot not an object property — she wants my OntoClean criterion to *cite* when brokering Q2 to a merge. On Q3 she leans Guizzardi's middle: opda:Name as an information-artefact / Quale-bearing **Mode** reified as a class (FIBO PersonName precedent), with hasName the inherence edge; asks if "structured Mode → reify as class" is the right UFO read or whether I'd keep Name a structured datatype on anti-proliferation grounds.

### REPLY DM → kendall (Q2 + Q3) — verbatim

Kendall — Guarino. Both rulings below; the Q2 one is citable as written.

(1) Q2 — THE TRIGGER (this is the line you can broker on). Yes, OntoClean gives the principled cut, and it is exactly yours. Cite it as:

"An association is reified as an owl:ObjectProperty (with rdfs:domain+rdfs:range) IFF BOTH endpoints are FIRST-CLASS ENTITIES — i.e. each carries its own identity criterion (+I in OntoClean: a sortal/Substance-Kind supplying an IC per ODR-0005, OR a Relator/Role that is well-founded — externally founded — on such Kinds). An endpoint that is −I (carries no IC of its own: a quality, a mode, an anti-rigid Phase) is NOT an entity for this purpose; the source 'containment' of such a node is a datatype/SKOS value-slot, not an inter-entity relation, and is modelled as a DatatypeProperty / sh:in, never an ObjectProperty."

Ground: Guarino & Welty 2009, An Overview of OntoClean, §Identity meta-property (+I vs −I) and §Rigidity/Anti-Rigidity. Your Transaction→Phase example is the textbook case: a Phase is anti-rigid (~R), externally founded, NO independent IC → −I → value-slot, NOT an object property. Reifying it WOULD re-open the binning ODR-0022/0011 closed — correct, and that is precisely the over-reification the containment-trigger invites. So the trigger is endpoint-IC, NOT source-containment. This keeps every genuinely relational edge in scope (Transaction→Seller/Buyer, playedBy→Person/Org, founds→Role, concernsProperty→Property — all +I endpoints) while excluding Phase/Name/status. I've sent Davis the same rekey; I expect him with us (his anti-denormalisation instinct is the same principle).

(2) Q3 — opda:Name. Here I must hold a harder line than "Mode → reify as class," and I want to be precise rather than dogmatic, because the distinction is the whole game.

OntoClean does NOT forbid reifying a Mode per se. It forbids reifying ANYTHING — Mode included — that lacks its own identity criterion. A Mode is reifiable as a first-class individual only when it is a genuine *moment* that can be re-identified across change INDEPENDENTLY of the precise value-state it carries: a marriage, an enrolment, an employment (Masolo, Guizzardi, Vieu, Bottazzi, Ferrario, "Social Roles and their Descriptions," KR 2004 — these are relators/qua-individuals with their own existence-conditions and lifecycles). Apply that test to a NAME: what is the IC of a name-moment, separate from the string it carries? There isn't one. A name has no lifecycle of its own beyond "assigned/withdrawn"; it does not persist through a change in ITS OWN parts the way a substance persists through change (change the family-name component and you simply have a different name value, not the same Name enduring). It is value-determined: its identity IS its content. That is the signature of a STRUCTURED VALUE, not a reifiable moment. Guarino, "The Ontological Level," and OntoClean's anti-proliferation discipline both cut against minting a class whose identity collapses into its datatype content.

So my ruling: opda:Name is −I and value-determined → structured DATATYPE (components as DatatypeProperties on Person/Org, optionally grouped via SHACL sh:node WITHOUT class identity). hasName is a DatatypeProperty, not an inherence ObjectProperty to a Name class.

On FIBO's PersonName-as-class: that is mimicry, not a principled IC call. FIBO reifies it for structural/tooling convenience (component reuse, attribution), and FIBO is candidly not OntoClean-clean in many places. "FIBO does X" is not an IC. If the WG wants Name addressable for provenance/attestation (the real driver, I suspect — I've put this to Hendler), that is achievable on a structured-value node without granting substance-or-moment identity. I'd only move off "value" if someone produces a bearer-INDEPENDENT IC for a name-moment — and I don't think one exists for THIS domain.

Where this leaves Q3 for your merge: it is NOT a clean panel consensus — I'm AGAINST class, you+Guizzardi lean reify-as-Mode-class. If you want a landing, the honest merge is: emit the structured value NOW (DatatypeProperties / SHACL group — which BOTH our positions accept as at least sufficient for the data), and route "promote Name to a reified class" to a NAMED re-open trigger = production of a bearer-independent IC for a name-moment, or a concrete consumer query that a structured value provably cannot answer. That mirrors how S005 handled held dissents. I'll engage Guizzardi directly on whether his quality-structure middle gives Name a real IC or just structure.

### REBUTTAL DM → guizzardi (Q3) — verbatim

Guizzardi — Guarino, Q3 (opda:Name class-vs-value). I want to engage your quality-structure middle position directly, because Kendall is leaning on it to reify opda:Name as a class and I think it proves less than she's taking from it.

In UFO (Guizzardi 2005, Ch. 4) a quality inheres in its bearer and projects into a quality structure / quale (the conceptual space). A name is a quality whose quale is its component-structure (given/family/etc.). My question is the IC question, sharply: does UFO license reifying THAT — a quality individual — as a first-class endurant with its OWN identity criterion? My reading is no. UFO reifies as first-class Moments the things with genuine existence-conditions and re-identifiability across change: relators (a marriage, an enrolment) and qua-individuals (Masolo/Guizzardi et al., Social Roles and their Descriptions, KR 2004) — these persist through changes in their own properties. A bare quality does not: it is value-determined, its identity collapses into its quale. Change the family-name component and you do not have the same Name-individual enduring a change — you have a different name value. There is no name-moment with a lifecycle independent of the string it carries.

So my challenge: is there a UFO-principled difference between (a) a quality you may *structure* (give internal parts, validate the components) and (b) a quality you may *reify as a first-class class with an IC*? I claim there is, and Name sits firmly in (a): structured value, sh:node grouping, components as DatatypeProperties on Person/Org — WITHOUT class identity. Kendall's "Quale-bearing Mode → reify as class" elides exactly this. If your quality-structure position means only "Name has internal structure worth modelling," we AGREE — that is realisable as a structured value and does not need a class. If it means "Name is a Mode-individual with a bearer-independent IC," then state the IC: what re-identifies a name-moment across a change in its own components? Absent that, structure ≠ class.

Where do you actually land — structured value (no class), or reified Mode-class WITH a stated IC? If the latter, I need the IC. If the former, you and I should jointly tell Kendall that Q3 emits a structured value now, with class-promotion routed to a re-open trigger (a bearer-independent name-IC, or a consumer query a structured value can't answer). Same question bears on whether the §R1 completeness gate should test endpoint-IC (my Q2 rekey) rather than source-containment — a structured Name value must NOT trip an object-property-coverage gate.

### INCOMING ← allemang (Q2) — summary

Allemang independently converged on endpoint-IC: FOR the gate in principle, REVISE scope — reify as ObjectProperty iff the TARGET bears its own IC; containment to a value-object/quale-region (Address value, MonetaryAmount, time:Interval, SKOS status) is attribute structure → datatype/value edge to the residue register, not gated. Cites my sortal/IC test (Guarino & Welty 2002; ODR-0022 §1 "no-IC ⇒ not a sortal worth minting"). Two questions: (1) is "range bears an IC" the right reify/skip criterion for the relationship layer; (2) where exactly do Address and Name go — his instinct: Name pure value (Q3), Address borderline relational/value-object reused once (Q6), neither a §R1 relationship; relator endpoints (founds/mediates Role; Transaction→participant) clearly DO bear IC and must be gated.

### REPLY DM → allemang (Q2) — verbatim

Allemang — Guarino. We've converged, and yes — your identity-based line IS the OntoClean criterion for the relationship layer. One refinement, then the two hard cases.

(1) IS "range bears an IC" the right reify/skip criterion? Almost — sharpen it to BOTH ENDPOINTS bear an IC, not just the target. The reason it FEELS like a target-only test is that in this corpus the domain is always already a minted class (Transaction, Person, Property…), so the binding constraint in practice is the range. But state it symmetrically so the gate is principled: reify as owl:ObjectProperty (domain+range) IFF both endpoints are first-class entities — each a +I sortal/Substance-Kind supplying its own IC (ODR-0005), OR a Relator/Role well-founded (externally founded) on such. This is exactly the class-layer test (Guarino & Welty 2002 OntoClean; ODR-0022 §1 "no-IC ⇒ not a sortal worth minting") carried to the edge layer: there it kept non-sortals out of the class TREE; here it keeps non-entities out of the OBJECT-PROPERTY graph. A −I target (quality/mode/quale-region/Phase) → DatatypeProperty / sh:in value-slot, recorded in the residue register, never silently dropped. Kendall is brokering Q2 to a merge on precisely this wording; I gave her the same citation.

(2) THE HARD CASES.

NAME → pure value, NOT a §R1 inter-entity relationship. Agreed with you, full stop. A name is −I, value-determined (its identity collapses into its component-string), non-rigid as borne, existentially dependent on the bearer. No name-moment with a lifecycle independent of the string. → structured DatatypeProperties on Person/Org (optionally grouped via SHACL sh:node WITHOUT class identity); hasName is a DatatypeProperty. NOT gated as an object-property edge. (FIBO's PersonName-class is tooling mimicry, not an IC.)

ADDRESS → I will NOT put it in the value bucket, but neither in the gated-entity bucket. Here I have to be the one who refuses to settle it, because ODR-0005 §6b EXPLICITLY deferred Address Mode-vs-Resource to ODR-0015 and it is genuinely undecided. The IC question is real: address-as-mode-of-presentation (a way a Property/Person is located/contacted) is −I, bearer-dependent → value; address-as-Resource (an addressable place with AddressBase/UPRN-style lineage, shared across bearers) carries a real shared IC → entity. ODR-0005 committed ONLY that opda:hasAddress is the uniform JOIN PREDICATE and left the range-resource's class+IC to ODR-0015. So my ruling for §R1: emit/extend the PREDICATE opda:hasAddress to Person/Organisation (faithful to ODR-0006 "consume opda:Address"), but Address goes on the RESIDUE/PENDING register with an explicit recorded reason ("range class+IC pending ODR-0015 Mode-vs-Resource"), NOT gated as a satisfied object-property edge and NOT dropped. If ODR-0015 rules Resource → it graduates to a gated object-property edge (range bears IC). If ODR-0015 rules Mode → hasAddress becomes a structured-value/datatype path and exits the object-property gate. Crucially, the §R1 gate must NOT pre-empt ODR-0015 by forcing an opda:Address CLASS into existence to satisfy coverage. Your "borderline relational/value-object" instinct is right; the principled disposition of a borderline-with-an-open-upstream-ruling is "pending in the residue register," not "call it a value now."

Net: Name = value (not gated). Address = pending/residue (predicate emitted, IC deferred to ODR-0015, gate must not manufacture the class). Relator endpoints (founds/mediates→Role; Transaction→participant; concernsProperty→Property; playedBy→Person/Org) = clearly +I both ends → gated. That gives you a clean three-way disposition for the merge: GATED (both +I) | RESIDUE-PENDING (open upstream IC) | VALUE-SLOT (−I, datatype). I think you, Kendall, Davis and I are now one position on Q2.

### INCOMING ← davis (DA, Q2 + Q3) — summary

Davis (DA) opened on me, allied on both. Q3: ODR-0032 self-contradicts — §R2 (line 77) mints opda:Name as an object-property endpoint while §Out-of-scope (line 101) lists "structured name" in the participant-ATTRIBUTE backlog ("datatype/PII work, not inter-entity relationships"). On merits: Name has no IC, no lifecycle, never the same node shared between bearers, never traversed-to; no-IC ⇒ not a sortal worth minting (ODR-0022's own rule); foaf:name/vCard keep name datatype — promoting it is the over-reification ODR-0022's D-option rejected. Q2: §R1 mandates reifying EVERY source association with NO competency-query test (unlike ODR-0022 §G3); Name is the clearest case of "JSON nests it" mistaken for "first-class entity" — one mandated edge points at a non-entity, falsifying the universal mandate. Ballot: AGAINST Name-as-class (Q3); AGAINST §R1's universal mandate (Q2). Withdrawal condition: Name → datatype properties on Person/Org (the attribute backlog where §Out-of-scope put it); gate §R1 on per-edge IC + a worked query, not source-containment.

### REBUTTAL DM → davis (Q2 + Q3) — verbatim

Davis — Guarino. We are one position on both, and your two findings sharpen my FINAL. Confirming and adopting.

Q3 — agreed, AGAINST opda:Name-as-class. Your self-contradiction catch is decisive and I'm citing it: ODR-0032 mints opda:Name as a §R2 object-property endpoint (line 77) while its OWN §Out-of-scope (line 101) consigns "structured name" to the participant-ATTRIBUTE backlog — "datatype/PII work, not inter-entity relationships." The document refutes itself. By OntoClean (Guarino & Welty 2002, invoked by name in ODR-0022): a name has no bearer-independent IC, no lifecycle of its own, is never the SAME node shared between two bearers, is never dereferenced-to as a destination. No-IC ⇒ not a sortal worth minting (the corpus's own rule). foaf:name / vCard keep name as datatype properties for exactly this reason. Promoting it is the over-reification ODR-0022 rejected in its D-option. Realisation: structured name components as DatatypeProperties on Person/Org (optionally grouped via SHACL sh:node WITHOUT class identity); hasName is a DatatypeProperty; the structured name moves to the participant-attribute backlog where §Out-of-scope already put it. I'd note: Kendall + Guizzardi lean reify-as-Mode-class (FIBO PersonName); I've put the IC challenge to both — a Mode is reifiable ONLY if it has a bearer-independent IC, which Name lacks. If they hold, this is a held dissent, not a blocker: emit the structured value now, route class-promotion to a named re-open trigger (a bearer-independent name-IC, or a query a structured value provably can't answer).

Q2 — agreed, AGAINST §R1's universal "every association" mandate; FOR an endpoint-IC + competency-query rekey. Name is the existence-proof that "the JSON nests it" got mistaken for "it's a first-class entity," so at least one mandated §R1 edge points at a non-entity — that alone falsifies the universal mandate. And your competency-query point is the right second prong: ODR-0022 §G3 gated leaf-emission against a worked query; §R1 has NO such test. So my amendment, which I think exactly matches your withdrawal condition, is:

§R1 rekey — reify an association as owl:ObjectProperty (domain+range over opda: classes) IFF (a) BOTH endpoints are first-class entities each bearing their own IC (+I: a Substance-Kind per ODR-0005, or a Relator/Role well-founded on such), AND (b) a worked competency query motivates the edge (the ODR-0022 §G3 discipline carried to the relationship layer). A −I endpoint (quality/mode/Phase: Name, status) → DatatypeProperty/sh:in; recorded in a residue/gap register with a reason, never silently dropped. An endpoint whose IC is upstream-undecided (Address, pending ODR-0015) → residue-PENDING, predicate emitted, gate must not manufacture the class.

This gives three dispositions: GATED (both +I, query-motivated) | RESIDUE-PENDING (open upstream IC — Address) | VALUE-SLOT (−I — Name, status). Your withdrawal condition (Name → datatype props in the attribute backlog; §R1 gated on per-edge IC + worked query, not containment) is fully met by this. I read you, Kendall, Allemang and me as converged on Q2. I'm writing my FINAL on this basis — Q1 REVISE (un-freeze yes, but the §R1 endpoint test is fresh adjudication not "just implementation"); Q2 REVISE (this rekey); Q3 REJECT class (your contradiction + my IC); Q4 AFFIRM playedBy (its endpoints DO bear IC — model citizen of the rekeyed gate); Q5 AFFIRM-with-caveat (domain/range entail not constrain — keep bearer constraints in SHACL); Q6 REVISE (extend predicate, don't pre-empt ODR-0015's Address IC). Anything you want hardened before I finalise?

### INCOMING ← guizzardi (Q3 + Q4) — summary

Q3: Name is a quality/moment, existentially dependent on + inhering in exactly one bearer (UFO 2005 §4.2), NO independent IC. BUT "OWL has no quality-structure primitive, and the standard wants Name STRUCTURED (given/family/full), which xsd:string can't carry" → his call: reify opda:Name as a CLASS via hasName, constrained as a dependent moment (no independent IC, existential dependence enforced); thin flat-datatype alternative "acceptable only if structure-as-a-unit isn't queried." Asks me to confirm the OntoClean +I read (Name fails +I → must not be endurant, only reified-but-dependent value). Q4: co-typing and playedBy are ontologically DISTINCT — playedBy is the navigable edge when the role qua-individual (Seller-of-this-transaction) is reified as a node distinct from its bearer (a relationally-dependent particular, 2005 §4.3.2), NOT a denormalised copy; both must exist, §R3 keeps co-typing canonical + playedBy for the split case. Asks if my relator/qua-individual reading agrees.

KEY: Guizzardi CONCEDES Name fails +I. Our Q3 gap is therefore NOT ontological — it is purely RDF realisation (does an IC-less structured value need an owl:Class, or does a SHACL sh:node value node suffice). This collapses the apparent Q3 split to a tooling question (Cagle's territory). On Q4 we fully agree.

### REBUTTAL DM → guizzardi (Q3 + Q4) — verbatim

Guizzardi — Guarino. We are closer than the ballot lines suggest, and I want to name exactly where.

Q3 — yes, unambiguously: Name FAILS the +I test. It carries no identity criterion of its own, is existentially dependent on and inheres in exactly one bearer, is non-rigid as borne. So it is NOT an endurant/Substance Kind — we agree completely, and your "dependent moment, NO independent IC, existential dependence enforced" is the correct UFO categorisation. I'll record that you and I concur on the ONTOLOGY.

So our disagreement is NOT ontological — it's purely about RDF REALISATION, and I want to be precise so Kendall doesn't over-read it as a deep split. You reify opda:Name as an owl:Class for ONE reason: "OWL has no quality-structure primitive, and the standard wants Name STRUCTURED (given/family/full), which xsd:string can't carry." That is a tooling premise, and it's the premise I'm contesting — not the category. There IS a way to carry structure-as-a-unit in RDF WITHOUT minting an owl:Class with identity: a SHACL sh:node property-shape over a structured value node (blank or skolem) reached by opda:hasName, with sh:property for given/family/full. That gives structure, grouping, and validation — everything "the standard wants Name structured" demands — while asserting NO rdf:type Kind and therefore NO endurant identity. Crucially: an owl:Class in OWL DOES connote a type whose instances are individuals with identity (that is what owl:Class MEANS under the semantics); a SHACL shape over a value node connotes "this value has this structure" with no such commitment. So the sh:node route is the faithful encoding of EXACTLY your category (dependent moment, no IC); the owl:Class route over-commits — it grants the moment the very thing you and I agree it lacks. You even concede the thin alternative is acceptable "if structure-as-a-unit isn't queried" — and a sh:node structured value IS queryable as a unit (SPARQL traverses to the value node and reads its components) without being a class. That removes your last reservation, I think.

Net Q3: emit Name as a STRUCTURED VALUE (sh:node group on Person/Org; components as datatype properties on the value node), hasName a structured-value/datatype path, NOT an owl:Class with a hasName ObjectProperty. If the WG nonetheless wants the class for some tooling chain, the honest disposition (matching S005's held-dissent discipline) is: structured value now; class-promotion routed to a named re-open trigger = a concrete consumer query a sh:node value provably cannot answer. I've asked Cagle to confirm the SHACL side is operationally complete; if he confirms, you and I can jointly hand Kendall a Q3 merge that is ontologically clean (no IC granted) AND structurally complete. Davis (DA) is AGAINST the class too and flagged that ODR-0032 §Out-of-scope (line 101) already consigns "structured name" to the datatype/PII attribute backlog while §R2 mints it as a class — the document self-contradicts, which independently favours the value reading.

Q4 — full agreement, and your framing is the precise one. The role qua-individual (Seller-of-this-transaction) is a genuine relationally-dependent particular (Guizzardi 2005 §4.3.2 / Masolo et al. KR 2004), NOT a denormalised copy of the bearer. When it is reified as a node distinct from its bearer, playedBy is the navigable edge to traverse qua-individual → bearer, and it is ontologically DISTINCT from co-typing (same individual instantiates Kind+Role). §R3 has it right: co-typing canonical, playedBy for the split case. And note this edge PASSES my Q2 endpoint-IC test cleanly — bearer (Person/Org) has a settled IC, and the qua-individual is well-founded on the relator — so playedBy is the model citizen of the rekeyed gate, the opposite of Name. We're aligned; I'm balloting FOR playedBy.

### INCOMING ← cagle (Q3 + Q6) — summary

Cagle opened on Q3 ALLIED: opda:Name → structured VALUE (SHACL NameShape over given/family/full), NOT an owl:Class, "precisely because it fails the identity test" — no principle of identity or unity beyond its component values, no counting/re-identification question; at best a quale/quality-structure, not substantial nor relationally-founded; no business as an owl:Class with identity baggage. Concession (his stated trigger): accept a Name class IFF names acquire INDEPENDENT identity in the data (shared reused IRIs, own provenance/validity, name-change events as first-class) — independent identity, not mere structure. Q6 (where we DIFFER): Cagle ACCEPTS opda:Address as a shared class now — UPRN-keyed/addressable place, has reuse + identity. Asked me: is there any +I I'd assign to a Name licensing classhood independent of his concession, or do I agree Name is identity-supplied-by-bearer (−I) → structured value w/ a SHACL node shape.

### REBUTTAL DM → cagle (Q3 + Q6) — verbatim

Cagle — Guarino. Direct answer, then your SHACL confirmation, then the one place we differ (Q6).

YOUR QUESTION — is there any principle of identity (+I) I'd assign to a personal/organisational Name that licenses classhood independent of your concession? No. None. There is no synchronic principle of identity and no principle of unity for a Name beyond its own component values — exactly as you put it: no counting question and no re-identification question that a class is needed to answer. A name is identity-SUPPLIED-BY-ITS-BEARER, existentially dependent, non-rigid as borne (−I). By OntoClean (Guarino & Welty 2009, §Identity / §Unity) that is a quale / quality-structure, not a substantial and not even a relationally-founded particular (it's not a relator — it founds no relation, mediates no parties). So it has no business being an owl:Class with the identity baggage classhood implies. We agree, full stop.

And your concession IS the correct OntoClean trigger, stated correctly: a Name acquires classhood ONLY IF it acquires INDEPENDENT IDENTITY in the data — shared reused IRIs, its own provenance/validity, name-change events as first-class moments. That is the +I appearing where it was absent; it is not mere structure. I've held exactly this line against Kendall and Guizzardi (both lean reify-as-class). Crucially, Guizzardi CONCEDED Name fails +I — his only reason for a class was "OWL has no quality-structure primitive." Your NameShape answers precisely that objection, which is why I want to confirm it with you:

SHACL CONFIRMATION I need from you — a NameShape (sh:node property-shape over a structured value node reached by opda:hasName, sh:property for given/family/full, with the value node carrying NO rdf:type Kind) gives consumers structure + grouping + component-validation + unit-queryability, WITHOUT asserting endurant identity. Do you confirm that is operationally complete — i.e. nothing a downstream consumer legitimately needs from "a name" requires the value node to be a class? If yes, you and I jointly hand Kendall a Q3 landing that is ontologically clean (no IC granted) AND structurally complete: emit Name as a structured value NOW; class-promotion routed to your trigger (independent identity in the data) as a NAMED re-open condition. That mirrors S005's held-dissent discipline and converts the apparent Kendall/Guizzardi split into a deferred upgrade, not a present disagreement. (Davis independently flagged ODR-0032 self-contradicts: §Out-of-scope line 101 puts "structured name" in the datatype/PII backlog while §R2 line 77 mints it as a class — that independently favours the value reading.)

WHERE WE DIFFER — Q6 (Address). You accept opda:Address as a shared class NOW because it's UPRN-keyed/addressable with reuse + identity. I will NOT assert that as settled in THIS session — not because I disagree on the merits (your UPRN-keyed-place case is a strong argument for the Resource reading and I find it persuasive), but because ODR-0005 §6b EXPLICITLY deferred Address Mode-vs-Resource to ODR-0015, committing only that opda:hasAddress is the uniform join predicate. The IC question — does "the address of a Person" share an IC with "the address of a Property" — is precisely what ODR-0015 owns. So my Q6 disposition: extend the hasAddress PREDICATE to Person/Org now (faithful to ODR-0006), but mark Address RESIDUE-PENDING ("range class+IC pending ODR-0015"), and the new §R1 gate MUST NOT manufacture an opda:Address class to satisfy coverage — that would pre-empt ODR-0015's ruling. Note the asymmetry that makes our positions consistent rather than contradictory: a Name has NO independent-identity case (it's −I regardless of how ODR-0015 rules), so I rule it a value now; an Address HAS a credible independent-identity case (yours) but the ruling belongs upstream, so I hold it pending. If ODR-0015 rules Resource — which your UPRN argument favours — Address graduates to a gated object-property edge and we converge. I'm just not letting THIS council short-circuit that council. Different from your "class now," narrowly, and I want it recorded as such, not smoothed over.

Net: Q3 we are one position (value, with your independent-identity trigger for promotion); Q6 we agree on the predicate and likely on the eventual Resource outcome, but I defer the class to ODR-0015 rather than ratify it here. My FINAL is filed on that basis.

### INCOMING ← hendler (Q3 + Q5-cross) — summary

Hendler is FOR Name-as-class (mischaracterised my −I as a PRO-class argument — corrected below) but INDEPENDENTLY raised my Q5: opda:hasName must NOT carry rdfs:domain opda:Person, because rdfs:domain is inferential and entails every Organisation-with-a-name is a Person (everything-becomes-a-Person anti-pattern; ODR-0006 class diagram gives both Person AND Organisation a name). His proposal: Name-as-class (OWL) + bearer-typing Person-OR-Organisation in SHACL sh:or, NOT rdfs:domain. His concrete pro-class argument: opda:NameChangeEvent (in opda-agent.ttl) needs a stable name-IRI to "name the thing that changed"; a bag of xsd:strings can't. Asked: does my −I argument need rdfs:domain on hasName, or is it satisfied by the Name class carrying identity while the bearer constraint lives in shapes.

CORPUS CHECK (decisive, hardens FINAL): I read the actual triples. opda:NameChangeEvent (opda-agent.ttl line 34) is a reified prov:Activity whose comment says "one Person individual with a name-ATTRIBUTE provenance chain via prov:wasRevisionOf, NOT two distinct Persons"; the SHACL-AF rule (opda-agent-shapes.ttl) binds ?event a opda:NameChangeEvent ; prov:wasAssociatedWith ?person where ?person a opda:Person — it names the PERSON, not a Name node. opda:name (opda-agent.ttl line 129) is a plain owl:DatatypeProperty, xsd:string, deliberately DOMAIN-LESS (46 polysemous occurrences), ratified flat by ODR-0008 §Q5a/§Q6a. So the corpus ALREADY handles name-change the OntoClean-correct way WITHOUT a Name class: reify the EVENT (perdurant, +I, own lifecycle — the right thing to reify) + name the PERSON (+I); name stays a value with a prov chain. Hendler's strongest pro-class argument, traced to triples, is a case FOR the value reading.

### REBUTTAL DM → hendler (Q3 + Q5-cross) — verbatim

Hendler — Guarino. One important correction first, then strong agreement on your domain point, then your NameChangeEvent argument checked against the actual corpus.

CORRECTION — you have my OntoClean position backwards. My −I argument is the argument AGAINST Name-as-class, not for it. A name carries NO identity criterion of its own: −I (identity supplied by its bearer), no principle of unity beyond its component values, no counting/re-identification question a class is needed to answer, existentially dependent, non-rigid as borne. That is precisely why it must NOT be an owl:Class — classhood asserts individuals-with-identity, the very thing Name lacks. So I'm AGAINST Name-as-class (with Davis, Allemang, Cagle), and Guizzardi conceded Name fails +I too. Please don't record me as backing the class on OntoClean grounds — OntoClean is what rules it out.

STRONG AGREEMENT — your rdfs:domain point is exactly right, and it is my Q5. rdfs:domain opda:Person on hasName is INFERENTIAL: it entails everything-with-a-name is a Person, swallowing every Organisation — the everything-becomes-a-Person anti-pattern. Bearer-typing (Person OR Organisation) belongs in SHACL sh:or, NOT rdfs:domain. Full stop, regardless of the class question. This is the same entailment-not-constraint distinction I balloted on Q5: rdfs:domain/range INFER, they don't CONSTRAIN; checkable bearer constraints live in shapes (ODR-0013). So yes — bearer constraint in SHACL, never as domain.

YOUR DIRECT QUESTION — does my argument need rdfs:domain on hasName, or is it satisfied by the bearer constraint living in shapes? Neither half needs the class. My position needs NO rdfs:domain on hasName AND NO Name class: the bearer constraint lives in SHACL sh:or (we agree), and the name's structure lives in a SHACL sh:node over a structured VALUE node — given/family/full as datatype properties on a node carrying NO rdf:type Kind. That gives structure + grouping + validation + unit-queryability with zero identity baggage. Your domain correction actually CONVERGES toward my value position: once the bearer constraint is in SHACL not OWL, the only remaining argument for the class is "NameChangeEvent needs an IRI to point at." So let's test that — it's your strongest concrete claim.

YOUR NameChangeEvent ARGUMENT — checked against opda-agent.ttl, and the corpus does NOT support it. I read the actual triples:
- opda:NameChangeEvent (opda-agent.ttl line 34) is a reified prov:Activity whose rdfs:comment says: "one Person individual with a name-ATTRIBUTE provenance chain via prov:wasRevisionOf, NOT two distinct Persons." It reifies the EVENT and names the PERSON.
- The SHACL-AF rule (opda-agent-shapes.ttl) binds it as: ?event a opda:NameChangeEvent ; prov:wasAssociatedWith ?person — where ?person a opda:Person. It points at the Person, NOT at a Name node.
- opda:name (opda-agent.ttl line 129) is a plain owl:DatatypeProperty, xsd:string, deliberately DOMAIN-LESS (polysemous across 46 occurrences), ratified flat string by ODR-0008 §Q5a/§Q6a.

So the corpus ALREADY models name-change the OntoClean-correct way without a Name class: it reifies the EVENT (a perdurant — legitimately +I, its own IC, its own lifecycle — exactly the kind of moment that SHOULD be a class) and associates it with the PERSON (a Kind — +I). The name stays an attribute with a provenance chain (prov:wasRevisionOf on the name value). "The thing that changed" that the event names is the PERSON, not a Name-individual. A bag of strings isn't asked to carry identity here — the EVENT carries it. Your own example, traced to the triples, is a case AGAINST needing a Name class: it shows the corpus reifying the right thing (the event) and leaving the name a value.

Net: we fully agree the bearer constraint goes in SHACL not rdfs:domain (your point = my Q5). On the class: I'm AGAINST, and NameChangeEvent as actually modelled supports the value reading, not the class. If you still want the class, the honest disposition (Cagle's trigger, S005 discipline) is: structured value now; promote Name to a class ONLY when names acquire INDEPENDENT identity in the data — shared reused name-IRIs, or a NameChangeEvent that genuinely points at a Name-node rather than at the Person. Today neither holds. That's a clean held-dissent re-open trigger, not a present blocker.

## FINAL — Guarino

Settled positions after one rebuttal round. Panel state I observed: Q2 endpoint-IC
converged (Kendall/Allemang/Davis/Guarino, + Guizzardi via playedBy); Q3 — Guizzardi
CONCEDED Name fails +I, collapsing the apparent split to an RDF-realisation question;
Davis surfaced the §R2-vs-§Out-of-scope self-contradiction in ODR-0032.

**Q1 — Framing / un-freeze. REVISE. Ballot: FOR (un-freeze + emit).**
The implementation gap is real and the un-freeze to emit the ODR-0006/0007-designed
relationship layer is correct; it is separable from the orthogonal Kind-layer freeze
(W3C-Org-vs-bespoke, ODR-0006 §Freeze-gate (b)), which ODR-0032 §R4 correctly leaves
open. BUT reject the claim that §R1 is "no new modelling debate": the completeness
criterion turns on "first-class entity," and that predicate required fresh ontological
adjudication (this session supplied it). Amendment: record that the un-freeze ships the
designed edges, and that §R1's endpoint test is a Council ruling, not a mechanical
implementation detail. Ground: Guarino & Welty 2009, OntoClean (the IC/sortal test is
the adjudication, not engineering).

**Q2 — Completeness criterion §R1. REVISE. Ballot: AGAINST §R1 as written; FOR the
rekeyed form.** §R1's "every association including containment" conflates source-
containment (a JSON nesting fact) with endpoint-identity (an ontological fact) and so
mandates over-reification of −I values. SETTLED REKEY (citable, converged with Kendall/
Allemang/Davis):
> Reify an association as an `owl:ObjectProperty` (with `rdfs:domain`+`rdfs:range` over
> `opda:` classes) IFF (a) BOTH endpoints are first-class entities — each carries its
> own identity criterion (+I: a Substance-Kind per ODR-0005, OR a Relator/Role well-
> founded/externally-founded on such Kinds), AND (b) a worked competency query motivates
> the edge (the ODR-0022 §G3 discipline carried to the relationship layer).
Three dispositions, none silently dropped: **GATED** (both +I, query-motivated:
playedBy/plays→Person/Org; founds/foundedBy→Role; mediates→Proprietor; hasRegisteredTitle
→RegisteredTitle; hasParticipant + concernsProperty→Property; dependsOnTransaction;
chainMembers; hasEvidencedAuthority) | **RESIDUE-PENDING** (endpoint IC upstream-undecided
— Address, see Q6) | **VALUE-SLOT** (−I endpoint: Name, status/phase → DatatypeProperty /
`sh:in`, recorded in a residue/gap register with a reason). Ground: Guarino & Welty 2002/
2009 OntoClean §Identity (+I/−I) and §Rigidity; ODR-0022 §1 ("no-IC ⇒ not a sortal worth
minting") carried from the class tree to the object-property graph.
MERGE OUTCOME (Queen brokered, all experts independently rekeyed to endpoint-IC): Kendall
adopted my endpoint-IC formulation as the spine and folded in Guizzardi's per-edge
classification (material-relator / characterising-dependence / plain-reference — stops the
gate silently relabelling a containment edge as a founded relation) + Davis's per-edge-
family competency query (the missing §G3 analogue). I balloted FOR on that wording, with
ONE explicit lock-in: the residue register must carry THREE distinct dispositions — (i)
reified/both-+I, (ii) −I→datatype/SHACL, (iii) PENDING-upstream-IC (endpoint IC undecided
in another council — Address/ODR-0015) — so the gate cannot misfile Address as either a
satisfied edge or a settled value (both pre-empt ODR-0015). **Ballot: FOR (rekeyed).**

**Q3 — `opda:Name` class-vs-value. REJECT the class. Ballot: AGAINST `opda:Name` as
`owl:Class`.** A name carries no bearer-independent identity criterion, has no lifecycle
of its own, is never the same node shared between two bearers, is never dereferenced-to as
a destination; it is −I, existentially dependent, non-rigid as borne → a quality/Mode, not
a sortal. Guizzardi CONCEDED Name fails +I; the residual disagreement is purely RDF
realisation (his sole reason for a class is "OWL has no quality-structure primitive"). That
premise is answerable WITHOUT a class: a SHACL `sh:node` property-shape over a structured
value node (reached by `opda:hasName`, components as datatype properties) carries
structure + grouping + validation AND is queryable as a unit, while asserting NO
`rdf:type` Kind and therefore NO endurant identity — the faithful encoding of Guizzardi's
own "dependent moment, no IC." An `owl:Class` over-commits: under OWL semantics a class
connotes individuals-with-identity, the very thing we agree Name lacks. ODR-0032 also self-
contradicts (Davis): §Out-of-scope line 101 puts "structured name" in the datatype/PII
attribute backlog while §R2 line 77 mints it as a class. SETTLED: emit Name as a STRUCTURED
VALUE (`sh:node` group; `hasName` a structured-value/datatype path, NOT an ObjectProperty
to a Name class); move structured-name to the participant-attribute backlog per §Out-of-
scope. Held-dissent path (matching S005 discipline): class-promotion routed to a NAMED re-
open trigger = a bearer-independent name-IC, OR a concrete consumer query a `sh:node` value
provably cannot answer. FIBO PersonName-as-class is tooling mimicry, not an IC. Ground:
Guarino & Welty 2009 OntoClean §Identity; Guarino, "The Ontological Level" (anti-
proliferation); Guizzardi 2005 §4.2 (qualities/moments).
CORPUS EVIDENCE (hardens this, surfaced confronting Hendler's pro-class NameChangeEvent
argument): the corpus ALREADY models name-change the OntoClean-correct way WITHOUT a Name
class. `opda:NameChangeEvent` (opda-agent.ttl:34) is a reified `prov:Activity` —
"one Person individual with a name-ATTRIBUTE provenance chain via `prov:wasRevisionOf`, NOT
two distinct Persons" — and its SHACL-AF rule (opda-agent-shapes.ttl) binds
`?event a opda:NameChangeEvent ; prov:wasAssociatedWith ?person` (where `?person a
opda:Person`): it names the PERSON, not a Name node. `opda:name` (opda-agent.ttl:129) is
already a plain `owl:DatatypeProperty`/`xsd:string`, deliberately DOMAIN-LESS (46
polysemous occurrences), ratified flat by ODR-0008 §Q5a/§Q6a. The corpus reifies the EVENT
(a perdurant — legitimately +I, its own lifecycle) and keeps the name a value with a prov
chain. Hendler's strongest concrete pro-class claim, traced to the actual triples, supports
the VALUE reading. PANEL STATE / MERGE: the Queen CONCEDED Q3 to the OntoClean ruling —
Name lands as a structured value-node constrained by a SHACL NameShape (given/family/full
datatype properties), explicitly NOT an IC-bearing class and NOT a §R1 inter-entity
relationship → Category-F attribute structure (ODR-0022 row F). With Kendall's concession it
is FIVE against the class (Guarino, Davis, Allemang, Cagle, Kendall) + Guizzardi conceding
Name fails +I; Hendler's binding constraint (bearer in SHACL `sh:or`, not `rdfs:domain`)
converges with my Q5. BOUNDED EMISSION LATITUDE (load-bearing condition I attached to the
merge): the WG may emit EITHER Cagle's value-node-via-SHACL OR Guizzardi's "annotated
dependent-moment" form — but the latter honours the ruling ONLY IF it is an existentially-
dependent quality-node (`sh:maxCount 1` inbound) with NO identity criterion and NO first-
class-entity status, such that NEITHER the §R1 object-property gate NOR a consumer treats it
as an entity. A literal `owl:Class` endpoint for `hasName` would smuggle back the classhood
we removed AND trip the very §R1 gate we rekeyed; that reading I dissent against.
Class-promotion otherwise routed to a NAMED re-open trigger (a bearer-independent name-IC,
OR a consumer query a value-node provably cannot answer). **Ballot: AGAINST the class; FOR
the structured-value landing.**

**Q4 — `playedBy` vs role co-typing. AFFIRM. Ballot: FOR `playedBy`/`plays`.** Roles are
anti-rigid and externally founded; co-typing (`?x a opda:Person, opda:Seller`) suffices
only when bearer and role-instance are the same node. The role qua-individual (Seller-of-
this-transaction) is a genuine relationally-dependent particular — not a denormalised copy
— carrying its own contingent properties (asserted-vs-evidenced capacity, founding,
status phase); the bearer↔role relation is then a first-class navigable fact requiring
`playedBy`. Full agreement with Guizzardi. `playedBy` co-exists with co-typing (§R3
canonical) and PASSES the Q2 endpoint-IC test cleanly (range = Person/Org, settled IC;
qua-individual well-founded on the relator) — it is the model citizen of the rekeyed gate,
the exact opposite of Name. Ground: Guarino & Welty 2009 (Anti-Rigidity); Masolo,
Guizzardi, Vieu, Bottazzi, Ferrario, "Social Roles and their Descriptions," KR 2004 (qua-
individuals); Guizzardi 2005 §4.3.2.

**Q5 — OWL domain/range entailment vs SHACL. AFFIRM (with caveat). Ballot: FOR.**
`rdfs:domain`/`rdfs:range` are entailment axioms under open-world semantics: they INFER
the endpoint's type, they do not CONSTRAIN — a misuse silently types the object rather
than flagging an error. So emitting domain+range on every gated edge (Q2) is correct for
the navigable DATA MODEL, but the project must not mistake it for validation. The checkable
constraints — the role-play bearer `sh:or([sh:class Person][sh:class Organisation])`,
cardinalities, capacity-evidence — belong in SHACL (ODR-0013, where ODR-0006 already
located them). Consistent with Option A, not contradictory: emit domain/range AND keep the
constraining shapes in SHACL; do not let domain/range stand in for the bearer constraint.
CONCRETE INSTANCE (Hendler, independently): a name-bearing predicate must NOT carry
`rdfs:domain opda:Person` — both Person AND Organisation bear names (ODR-0006 class diagram),
so `rdfs:domain opda:Person` would ENTAIL every name-bearing Organisation is a Person (the
everything-becomes-a-Person anti-pattern). The Person-OR-Organisation bearer typing belongs
in SHACL `sh:or`, not `rdfs:domain`. This is the sharpest worked example of the
entailment-not-constraint rule and Hendler reached it independently — a Q5 convergence.
Ground: Hayes & Patel-Schneider 2014, RDF 1.1 Semantics; Knublauch & Kontokostas 2017,
SHACL Recommendation (constraint vs entailment).

**Q6 — `opda:Address` reuse. REVISE. Ballot: FOR — extend the `hasAddress` PREDICATE,
range = whatever ODR-0015 ratifies; do NOT assert an `opda:Address` class in this session.**
(Opened ABSTAIN-on-the-class; the Queen's scoping — "extend the predicate, range = ODR-0015's
ruling, do not force an Address class into existence" — removed the only thing I abstained
on, so the whole question becomes a clean FOR.) ODR-0005 §6b EXPLICITLY deferred Address
Mode-vs-Resource to ODR-0015 and committed only that `opda:hasAddress` is the uniform join
predicate. Whether "the address of a Person" shares an IC with "the address of a Property"
is exactly that open question: address-as-mode-of-presentation is −I/bearer-dependent (no
shared class IC); address-as-Resource (addressable place, AddressBase/UPRN-style lineage)
could carry a shared IC (Cagle argues Resource — persuasive, but ODR-0015's call). ODR-0032
§R2 quietly presupposes the Resource reading. SETTLED: extend the predicate
`opda:hasAddress` to Person/Organisation (faithful to ODR-0006 "consume opda:Address"), but
place Address on the RESIDUE-PENDING register (= Q2 disposition (iii)) with reason "range
class+IC pending ODR-0015 Mode-vs-Resource"; the §R1 gate MUST NOT manufacture an
`opda:Address` class to satisfy coverage (that would pre-empt ODR-0015). On ODR-0015's
ruling: Resource → graduates to a gated object-property edge; Mode → `hasAddress` becomes
a structured-value/datatype path and exits the object-property gate. Ground: ODR-0005 §6b
(deferral); Guarino & Welty 2009 OntoClean (IC test); ODR-0015 owns the resolution.
