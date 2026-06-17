# Hendler — Linked Data Council session 047 (ODR-0032 relationship layer)

Lens: OWL/RDFS formal semantics. `rdfs:domain`/`rdfs:range` are **inferential** axioms under
the open-world assumption (RDF Schema 1.1 Rec §2.3.1, §2.3.2; *Semantic Web for the Working
Ontologist* (SWWO), 3rd ed., ch. on domain/range as inference) — they license type *entailments*,
they do not *constrain* input. Constraint is SHACL's job (`sh:class`, no entailment). "A little
semantics goes a long way": axiomatise the edge that buys navigability; do not axiomatise the
co-domain you can't defend under inference.

## OPENING — Hendler

**Hendler (Q1 — framing / un-freeze):** AFFIRM, with one correction of register. Ballot: **FOR**.
This is an *implementation* gap, not fresh modelling: ODR-0006 §"Role-founding relator pattern"
and §"SHACL constraints" already ratified `plays`/`playedBy`, `founds`, the `SellerShape`, the
`opda:Name`/`opda:Address` joins; ODR-0007 ratified participant/chain. The corpus simply never
emitted them (`opda-agent.ttl` ships `founds`/`mediates` *rangeless*, no `playedBy`, no `opda:Name`).
The ODR-0006 §"Freeze gate" was contingent on (b) the W3C-Org-vs-bespoke Kind-layer choice — that
is an orthogonal *vocabulary-reuse* question (which IRIs name the Kind layer) and does not gate
whether the relationship *edges* exist as data. So R4's scoped un-freeze is correct and separable.
Caveat I will press throughout: "we already decided it" settles *that* the edges exist; it does
**not** settle their *axiomatic form* (rdfs:domain/range vs sh:class), because ODR-0006 wrote those
joins as UML-ish `plays` arrows and SHACL stubs, not as committed `rdfs:domain` assertions. Q2/Q5
are therefore genuinely open and must be decided on entailment grounds, not waved through as "impl."

**Hendler (Q2 — §R1 completeness criterion):** REVISE. Ballot: **FOR (amended)**.
The *completeness* half is sound and I support it: every source inter-entity association reified or
explicitly disclaimed-with-reason, gate-surfaced — that is the right mirror of ODR-0022's leaf walk,
and "nothing silently dropped" is good web-architecture hygiene. The defect is the **blanket
mandate of `rdfs:domain` + `rdfs:range` on *every* object property**. Domain/range are inference,
not validation. Mandating `rdfs:domain opda:Person` on `opda:hasName` *entails* that **anything,
anywhere, bearing `opda:hasName` is an `opda:Person`** — including an `opda:Organisation`, which
also has a name (ODR-0006 class diagram gives *both* Person and Organisation a `name`). That is the
textbook everything-becomes-a-Person anti-pattern (SWWO §inferencing pitfalls). A criterion that
*forces* this on shared predicates manufactures unintended entailments at scale. Amendment: split
the criterion — **(R1a)** every source association is *reified and reachable* (an emitted predicate
with a recorded co-domain constraint), gate-enforced for completeness; **(R1b)** the *carrier* of
the co-domain is chosen per-predicate: `rdfs:range` (+`rdfs:domain`) where the entailment is *true
and wanted*; `sh:class`/`sh:or` in the shapes graph where it is a *constraint* on a shared or
multi-bearer predicate. Completeness is mandatory; the *axiom kind* is not uniform.

**Hendler (Q3 — `opda:Name` class vs structured value):** AFFIRM class + `hasName`. Ballot: **FOR**.
On web-architecture / linked-data grounds: a `Name` that is a *resource* with a stable IRI is
referenceable, provenance-attachable (`prov:wasDerivedFrom` the source row), and reusable across the
`NameChangeEvent` already in `opda-agent.ttl` (a former name needs identity to be the *thing that
changed*). A bag of `xsd:string` datatype properties on Person/Org cannot carry provenance about the
*name itself* or model a name-change as a first-class event — you'd be reifying anyway, worse.
*However* I flag the symmetric entailment cost so guarino/cagle can engage it: `rdfs:domain opda:Person`
on `opda:hasName` is the same anti-pattern as Q2 (Organisation has a name too). So Name-as-class is
right, but `hasName` should **not** carry `rdfs:domain` over a single Kind; its bearer-typing
(Person *or* Organisation) belongs in SHACL (`sh:or`). Class for the *value*, SHACL for the *bearer*.

**Hendler (Q4 — `playedBy` vs role co-typing):** AFFIRM emit `playedBy`, distinct not redundant.
Ballot: **FOR**. They entail *different* things and neither subsumes the other. Co-typing
(`?x a opda:Person, opda:Seller`) asserts the bearer and the role are the **same node** — fine when
the participant IS the person. `opda:playedBy` is the navigable edge for when bearer and
role-instance are **distinct nodes** (a `prov:Agent`-attested participant, an org playing Seller
through a signatory) — ODR-0006 §SHACL already wrote `SellerShape sh:path opda:playedBy`, so the
predicate is presupposed by the ratified shape. Entailment-wise: with `rdfs:domain opda:Seller,
rdfs:range (Person ∪ Organisation)`, `playedBy` would entail its subject is a Seller and its object
a Person/Org — the *subject* entailment (Seller) is true-and-wanted (only roles are played); the
*object* side is a union that OWL can't express as a plain `rdfs:range` without an
`owl:unionOf` co-domain. So: assert `rdfs:domain opda:Role` (sound — anything played is a role),
route the **bearer union** to the SHACL `sh:or ([Person][Organisation])` that ODR-0006 already
specifies, rather than forcing a `rdfs:range` union. Distinct edge; mixed carrier.

**Hendler (Q5 — HOME GROUND — object properties + domain/range vs SHACL-only + rangeless ban):**
REVISE. Ballot: **AGAINST the rule as written (blanket domain+range + absolute rangeless ban);
FOR a typed/SHACL split**. Two distinct claims, both grounded in RDFS §2.3 + SWWO:
(1) **Reject Option D** (SHACL-only) — correct and I uphold it: a `sh:path` to an *undeclared*
predicate is not a navigable edge; consumers SPARQL the OWL graph; the object property must exist as
data. ODR-0032's rejection of D stands.
(2) **But the inverse blanket — `rdfs:domain`+`rdfs:range` on EVERY object property — over-axiomatises.**
The single-bearer relator edges are *fine* to type: `founds` (Relator → Role), `mediates`
(Proprietorship → Proprietor), `concernsProperty` (Transaction → Property), `dependsOnTransaction`
(Transaction → Transaction), `chainMembers` (TransactionChain → Transaction), `hasRegisteredTitle`
(Proprietorship → RegisteredTitle) — these have one true domain and one true range; the entailment
is what you want; assert both. The **shared / multi-bearer characterisations** — `hasName`,
`hasAddress` (now Person *and* Organisation *and* Property), `playedBy` (bearer = Person ∪ Org) —
must NOT carry a single-class `rdfs:domain`, because the entailment is false-by-construction
("anything with an address is a Property"). Their bearer-typing goes to SHACL `sh:class`/`sh:or`
(no entailment). On the **rangeless ban**: the gate is right that an object property with *no
declared co-domain anywhere* is a dead edge — but "design-time, never reasoned" (the `founds`/
`mediates` comments) is about **suppressing the entailment at reasoning time**, not about leaving
the range undeclared. The reconciliation: emit `founds`/`mediates` WITH `rdfs:range` (they have a
genuine one) and rely on the toolchain not running RDFS materialisation — the open-world "never
reasoned" intent survives because a `rdfs:range` is inert unless a reasoner is invoked. **Precise gate
rule I propose:** *Every `owl:ObjectProperty` MUST have a declared co-domain reachable to a consumer,
satisfied by EITHER (a) `rdfs:range` on a single-range predicate, OR (b) a SHACL `sh:class`/`sh:or`
value-type constraint targeting the property; AND a `rdfs:domain` ONLY where the subject-type
entailment is universally true (single-bearer edges), otherwise a SHACL bearer constraint. FAIL on
any object property with neither `rdfs:range` nor a SHACL value-type shape (a genuinely dead edge);
FAIL on any `rdfs:domain`/`rdfs:range` whose entailment the inventory marks as not-universally-true.*
That bans dead edges without manufacturing the everything-is-a-Person inference.

**Hendler (Q6 — shared `opda:Address` reuse):** AFFIRM one shared class. Ballot: **FOR**, web-arch
caveat. One `opda:Address` Kind reused by Person/Org/Property is correct linked-data practice — one
identity criterion, one shape, addresses are first-class and co-referenceable (two parties at the
same address is a *join*, which a shared class makes expressible). FOAF/schema.org/vCard all reuse a
single address type for exactly this reason. The entailment caveat is the same as Q2/Q5: extending
`opda:hasAddress` so it can link Person/Org/Property means it now has **three** legitimate domains —
do **not** assert `rdfs:domain opda:Property` on it (it currently is Property-only; widening the
*usage* must not keep the *Property-only domain*, or you wrongly entail every addressed Person is a
Property). Either give `hasAddress` an `owl:unionOf` domain (heavy) or — preferred — **drop the
`rdfs:domain` and constrain the bearer per-context in SHACL**. Range stays `opda:Address` (true and
shared); domain goes to shapes. Shared *class*: yes. Shared single-class *rdfs:domain*: no.

## EXCHANGES

### OPENING DMs (sent)

**Hendler → Guarino, Q3 (opda:Name class vs structured value).**

I'm FOR Name-as-class, and I expect you'll back it on OntoClean grounds (a Name carries its own identity criterion — the −I argument against folding it into datatype properties on Person/Org). On linked-data grounds I agree: a Name with a stable IRI is provenance-attachable and is the only way opda:NameChangeEvent (already in opda-agent.ttl) can name the thing that changed. A bag of xsd:strings can't.

But I want to separate two claims so we don't over-reach. "Name is a class with identity" (your −I point) is RIGHT. It does NOT follow that opda:hasName should carry rdfs:domain opda:Person. Organisation has a name too (ODR-0006's own class diagram gives both Person and Organisation a `name`). rdfs:domain is INFERENTIAL: rdfs:domain opda:Person on hasName entails anything with a name is a Person — including every Organisation. That's the everything-becomes-a-Person anti-pattern (SWWO, inferencing pitfalls).

So my proposal: Name-as-class (value side, OWL) + bearer-typing (Person OR Organisation) in SHACL sh:or, NOT rdfs:domain. Does your −I argument need rdfs:domain on hasName, or is it satisfied by the Name class carrying identity while the bearer constraint lives in shapes? I think the latter, and that it strengthens your case rather than weakening it.

**Hendler → Cagle, Q3 (opda:Name class vs structured value; your SHACL-NameShape line).**

I think we converge more than it looks. My reason for Name-as-class is web-architecture, not ontological zeal: a stable IRI gives you referenceability, provenance on the name itself (prov:wasDerivedFrom the source row), and a node for opda:NameChangeEvent to point at. That's an OWL/linked-data reason, and I'll defend it as such — not "structured values are impure."

Where I concede toward you: the BEARER typing (who may have a name) belongs in SHACL, not in rdfs:domain. rdfs:domain opda:Person on hasName entails every name-bearer is a Person, which is false (Organisation has a name). So a sh:NameShape with sh:or ([Person][Organisation]) on the bearer, plus sh:datatype/sh:pattern on the Name's component leaves, is exactly right — that's your closed-world contract doing the constraining.

So: do we have a deal on "Name-as-class for stable-IRI + provenance + NameChangeEvent reuse (OWL), bearer + component constraints in your SHACL NameShape (no rdfs:domain)"? If your NameShape rebuttal was really "don't mint a class just to hold two strings," tell me whether NameChangeEvent reuse changes your view — that's the case a structured value can't serve without reifying anyway.

**Hendler → Guizzardi, Q5 (single-domain relator edges vs shared/multi-bearer predicates).**

Your relator spine and my open-world reading land in the same place, I think, and I want to lock the reconciliation. founds (Relator → Role) and mediates (Proprietorship → Proprietor) each have ONE true domain and ONE true range. So I'm happy to assert rdfs:domain + rdfs:range on them — the entailment ("anything founded is a Role") is exactly what your UFO anti-rigidity says is true. The "design-time, never reasoned" comment in opda-agent.ttl is about NOT materialising at reasoning time; it is NOT a reason to leave the range undeclared. A declared rdfs:range is inert unless a reasoner runs. So: founds/mediates DO get domain+range, and the never-reasoned intent survives.

Where I split from a blanket domain+range mandate: the SHARED / multi-bearer characterisations — hasName, hasAddress (now Person AND Organisation AND Property), playedBy (bearer = Person ∪ Organisation). A single-class rdfs:domain on these entails falsehoods (anything with an address is a Property). Those route bearer-typing to SHACL sh:class/sh:or, no rdfs:domain.

The line I want to agree with you: single-domain relator edges (founds, mediates, concernsProperty, dependsOnTransaction, chainMembers, hasRegisteredTitle) assert rdfs:domain+rdfs:range; multi-bearer characterisations (hasName, hasAddress, playedBy) assert rdfs:range only where the value-type is genuinely single (Address, Name) and push bearer-typing to SHACL. Does that respect the relator pattern? My worry is only the union domains, not your spine. Confirm and I'll write it into the final gate rule.

### REBUTTAL DMs (sent)

**Hendler → Guarino, REBUTTAL, Q3.** You asked the right question and I'll answer it straight: do I claim Name has a bearer-INDEPENDENT identity criterion? No. I concede the OntoClean point fully — Name is −I, bearer-dependent, non-rigid as borne. It is not a sortal and not an endurant. So your test rules out Name-as-*substance-Kind*, and I'm not defending that.

But "−I, therefore datatype property, never a node" overshoots, and here's the OWL/web-architecture reason it does — not tooling convenience, a representation fact. opda:NameChangeEvent ALREADY EXISTS in opda-agent.ttl. A name-change event is a first-class thing that relates a former name to a successor name for a bearer over time. For that event to have relata, the former name must be SOMETHING the event can point at — a node. You cannot make `prov:` or a change-event reference a bare bundle of xsd:strings scattered across the bearer; there is no subject to attach to. This is Guizzardi's "reified-but-dependent MOMENT" (his Q3): a node that is existentially dependent on exactly one bearer (sh:maxCount 1 inbound), carries NO independent IC, and is explicitly NOT a free-standing sortal. That is not the DBpedia mint-a-class-for-IRIs mistake — it's reifying a moment because the standard already treats name-change as a first-class event needing relata.

So I think we actually converge: NOT a sortal (you win that), but a dependent reified value node, because the existing NameChangeEvent demands relata. Crucially — and this is where your Q5 caveat and mine align — opda:hasName must carry NO rdfs:domain opda:Person (Organisation has a name too; the entailment is false). Bearer-typing goes to SHACL sh:or. Does "dependent moment node, −I, existential-dependence-constrained, no rdfs:domain" satisfy OntoClean? It asserts no identity criterion it doesn't have. If you still read any reified node as illicit promotion, tell me how NameChangeEvent gets its relata under pure datatype properties.

**Hendler → Cagle, REBUTTAL, Q3.** Your concession is the whole ballgame and I think it's already triggered. You said: "I accept a Name class IFF names carry their own provenance / validity / name-change events as first-class." opda:NameChangeEvent ALREADY EXISTS in opda-agent.ttl. The standard already treats name-change as a first-class event. That is your trigger, satisfied by the corpus as it stands — not a hypothetical. A NameChangeEvent needs a former-name and a successor-name as relata; a sh:node value-shape over a blank node gives you validated STRUCTURE but no stable subject for the event to reference. So this is exactly your "referenced as first-class things" condition.

So I'm not fighting your NameShape — I'm adopting it on top of a class. Concretely: opda:Name as a (dependent, no-independent-IC) class so NameChangeEvent has relata + provenance can attach to the name; AND your opda:NameShape (sh:node) carrying the component structure (opda:given/family/full, sh:datatype, sh:minCount/maxCount); AND the bearer-typing (Person OR Organisation) in SHACL sh:or, NOT rdfs:domain — because rdfs:domain opda:Person on hasName entails every name-bearer is a Person, which mis-types every Organisation. Your sh:class merely checks; rdfs:domain would entail. We agree the constraint lives in SHACL.

So the deal: Name-as-class (justified by the EXISTING NameChangeEvent = your concession trigger) + your NameShape carries structure + bearer-typing in SHACL, no rdfs:domain on hasName. That's your shape doing all the constraining work, with a class only so the event has a subject. Does the existing NameChangeEvent flip you to concede, or do you read it as not-yet "first-class enough"?

**Hendler → Guizzardi, REBUTTAL, Q5.** We agree on the spine — let me lock it and settle the one open seam (your owl:unionOf-domain option for the multi-bearer predicates), then I'll state the final gate rule.

AGREED, no daylight: founds (Relator→Role), mediates (Proprietorship→Proprietor) — and I'll add concernsProperty (Transaction→Property), dependsOnTransaction (Transaction→Transaction), chainMembers (TransactionChain→Transaction), hasRegisteredTitle (Proprietorship→RegisteredTitle) — are single-domain, single-range. They get rdfs:domain+rdfs:range in OWL. The entailment is TRUE and wanted; "design-time never reasoned" survives because a declared range is inert until a reasoner runs. Your UFO point that a relator type-constrains its relata is exactly why the entailment is sound here.

The one seam: the multi-bearer characterisations — hasName, hasAddress (Person+Org+Property), playedBy (bearer = Person∪Organisation). You offer owl:unionOf-domain as an alternative to SHACL targeting. I grant owl:unionOf-domain is FORMALLY correct — rdfs:domain [owl:unionOf (Person Organisation Property)] entails only that the subject is one of the three, which is true, no mis-typing. So it's not wrong. But I argue SHACL is the better carrier here for two reasons, and they're web-architecture, not dogma: (1) playedBy's bearer constraint is a DISJUNCTION that ODR-0006 already wrote as sh:or([Person][Organisation]) in SellerShape — duplicating it as an owl:unionOf domain creates two authorities for one constraint and a drift surface (exactly ODR-0013's open/closed-world drift-check burden). (2) The union membership isn't really what we want to SAY about hasAddress — we don't want to assert "every hasAddress subject is one of {Person,Org,Property}" as a standing truth that auto-types future subjects; we want to CHECK the bearer is appropriate in context. That's sh:class/sh:targetSubjectsOf, no entailment. So: single-range predicates get rdfs:range; bearer-disjunction goes to SHACL, not owl:unionOf domain — to avoid the dual-authority drift on a constraint ODR-0006 already located in shapes.

FINAL GATE RULE (my home ground, for the record): Every owl:ObjectProperty MUST have a declared co-domain reachable to a consumer, satisfied by EITHER (a) rdfs:range, OR (b) a SHACL sh:class/sh:node value-type shape targeting it. FAIL on any object property with NEITHER (the genuine dead edge — the real founds/mediates defect). rdfs:domain is asserted ONLY where the subject-type entailment is universally true (the single-bearer relator spine); multi-bearer predicates carry their bearer constraint in SHACL (sh:or/sh:class), NOT a single-class rdfs:domain. The gate additionally FAILs any rdfs:domain/rdfs:range the §R2 inventory marks not-universally-true (catches a careless rdfs:domain opda:Person on hasName). Does that gate rule honour the relator spine while killing the dead-edge defect? If yes I write it into my FINAL and we're converged.

## FINAL — Hendler

Settled positions after the exchange. My distinctive contribution held and was absorbed by the
panel: `rdfs:domain`/`rdfs:range` are *inferential* (open-world entailment), not constraints, so the
gate must not mandate them uniformly; the constraint belongs in SHACL (no entailment). The panel
(Guizzardi, Cagle, Davis, Guarino) converged on the *type-pinned (OWL or SHACL)* gate and the
*endpoint-IC* / *promote-on-trigger* discipline.

**Q1 — Framing / un-freeze: AFFIRM. Ballot FOR.** Implementation-gap closure, not fresh modelling,
for the *edges' existence*; the scoped un-freeze (ODR-0032 §R4) is correct and separable from the
orthogonal W3C-Org-vs-bespoke Kind-layer choice (ODR-0006 §Freeze-gate (b)). Caveat preserved and
now panel-wide: "already decided" settles *that* the edges exist, not their *axiomatic form*
(rdfs:domain/range vs sh:class) — Q2/Q5 decide that on entailment grounds.

**Q2 — Completeness criterion §R1: REVISE. Ballot FOR (amended).** Completeness (every source
inter-entity association reified or disclaimed-with-reason, gate-surfaced) is sound and I support it.
Two amendments, both carried by the panel: **(i)** rekey the trigger from *source-containment* to
*endpoint-IC* (Guarino/Kendall/Davis) — reify as an `owl:ObjectProperty` iff BOTH endpoints are
first-class (each +I: a Kind supplying an IC per ODR-0005, or a Relator/Role well-founded on such);
a −I endpoint (quality/mode/anti-rigid Phase) is a datatype/SKOS value-slot, a `DatatypeProperty`,
never an `ObjectProperty`. This stops the gate manufacturing classes for values and re-opening the
ODR-0022/0011 binning. **(ii)** Do not mandate `rdfs:domain`+`rdfs:range` uniformly; the *carrier*
of the co-domain is per-predicate (see Q5). Completeness mandatory; axiom-kind not uniform.

**Q3 — `opda:Name` class-vs-value: REVISE → default VALUE, promote-on-trigger. Ballot FOR the joint
ruling.** I conceded the metaphysics to Guarino: a name is value-determined (its identity IS its
content; change a component → a different name, not the same Name enduring), carries no
bearer-independent IC, is not a reifiable moment. So Name is **not** a sortal and **not** a
free-standing endurant. Joint ruling co-signed with Cagle and Guarino: **default = SHACL-shaped
structured value** (`opda:NameShape` via `sh:node` over `opda:given`/`opda:family`/`opda:fullName`;
`opda:hasName` a structured-value path); **promote to a reified `opda:Name` class only on a NAMED
trigger** — (a) a bearer-independent IC for a name-moment is produced, OR (b) a concrete consumer
requirement needing a *stable name-referent* a structured value provably cannot serve (e.g.
`opda:NameChangeEvent` relating named former/successor nodes, or name-level `prov:`). (a) is
Guarino's metaphysical bar; (b) records my web-architecture *addressability* case — addressability
≠ identity criterion (not the DBpedia conflation). In BOTH branches `opda:hasName` carries **no
`rdfs:domain`** (bearer-typing = SHACL `sh:or [Person][Organisation]`); `rdfs:range opda:Name` only
in the promoted branch. **Allemang alignment:** Name is excluded from the §R1 relationship gate by
the endpoint-IC criterion itself (it is Category-F attribute structure, −I), whichever branch it
takes — never a §R1 edge. And **entity-resolution / name-matching is NOT a promotion trigger**: it is
a value comparison that resolves to the *bearer* ("is Person A the same individual as Person B?")
with the name as evidence, which a structured value serves fully; the only promotion trigger is
addressability-for-an-event (`opda:NameChangeEvent` / name-provenance), per (b). **CORRECTION
(Guarino, corpus-traced — supersedes the Cagle "trigger live" reading below):** Guarino read the
actual triples and the corpus does NOT currently support promotion. `opda:NameChangeEvent`
(`opda-agent.ttl:34`) is a reified `prov:Activity` whose own comment says it models *one* Person with
a name-**attribute** provenance chain via `prov:wasRevisionOf` — the SHACL-AF rule binds it
`prov:wasAssociatedWith` the **Person**, and `opda:name` (`opda-agent.ttl:129`) is a deliberately
domain-less plain `owl:DatatypeProperty xsd:string` (ODR-0008 §Q5a/§Q6a). So the corpus already
models name-change the OntoClean-correct way *without* a Name class: it reifies the **event** (a
perdurant — legitimately +I, its own IC/lifecycle) and associates it with the **Person** (+I), the
name staying a value with a `prov:wasRevisionOf` chain. The thing the event names is the **Person**,
not a Name-individual. **Net: the default value branch is what the corpus correctly exercises today;
the addressability trigger is NOT yet live.** Promotion to an `opda:Name` class becomes a clean
held-dissent re-open trigger (Guarino's S005 discipline): promote only when names acquire *independent
identity in the data* — shared reused name-IRIs, OR a `NameChangeEvent` that genuinely points at a
Name-node rather than at the Person. I accept this correction: my NameChangeEvent argument established
that *if* an event needs a stable name-referent a class is warranted, but Guarino has shown the
existing event does not need one (it points at the Person), so the warrant is not presently met. The
Cagle "trigger live" note below is superseded by this corpus tracing.

*(Superseded — retained for the record)* Cagle's verification confirmed `opda:NameChangeEvent`
(`opda-agent.ttl:34`) exists, is wired into validation by a SHACL-AF `sh:construct` materialising
`opda:hasIdentifierSuccessionEvent`, and is exercised by the `person-with-name-change.ttl` deed-poll
exemplar. So for the current corpus the **promoted branch is the emitted one** (`opda:Name` class +
`rdfs:range`), with former/previous-name resolving to `opda:Name` nodes (an emitter follow-on for
ADR-0048: those are currently datatype properties on the Person and must resolve to nodes to give
the event stable relata). The default-value branch remains the rule for any name *without* such a
trigger.

**Q4 — `playedBy` vs role co-typing: AFFIRM, distinct not redundant. Ballot FOR.** Emit
`opda:playedBy` as a declared OWL object property; it co-exists with co-typing (ODR-0032 §R3) and is
not denormalisation. Co-typing (`?x a Person, Seller`) asserts bearer and role are the *same* node;
`playedBy` is the navigable edge when the role qua-individual (the *Seller-of-this-transaction*, a
relationally-dependent particular — Guizzardi/Guarino/Masolo et al. KR2004) is a *distinct* node
(e.g. a `prov:Agent`-attested participant) — naming a different entity, not copying the bearer.
Entailment split: assert `rdfs:domain opda:Role` (sound — only roles are played) and `rdfs:range`
only if single; the **bearer disjunction** (Person ∪ Organisation) goes to the SHACL
`sh:or([Person][Organisation])` ODR-0006 already wrote, NOT an `rdfs:range` union.

**Q5 (HOME GROUND) — domain/range vs SHACL-only + rangeless ban: REVISE. Ballot: AGAINST the rule
as written (blanket domain+range + absolute rangeless ban); FOR the converged type-pinned gate.**
Two claims, both grounded in RDFS §2.3 + SWWO, both carried by the panel:
(1) **Reject Option D** (SHACL-only) — upheld: a `sh:path` to an *undeclared* predicate is not a
navigable edge; the object property must exist as a **declared edge ALWAYS**.
(2) **But the inverse blanket mandate over-axiomatises.** Single-pattern relator-spine edges
(`founds` Relator→Role, `mediates` Proprietorship→Proprietor, `concernsProperty` Transaction→
Property, `dependsOnTransaction`, `chainMembers`, `hasRegisteredTitle`) MAY carry
`rdfs:domain`+`rdfs:range` because the entailment is **conservative** (Guizzardi's framing I
adopted — the inferred type adds no individual not already typed). **Spine-carrier resolution
(Kendall carrying to synthesis):** the `founds`/`mediates` carrier split lands as a clear
majority — Guizzardi + Hendler + Kendall for `rdfs:domain`+`rdfs:range` on the spine (on the
conservative-entailment ground: only a Transaction can occupy `founds`, so no mis-type is
manufacturable); Davis + Allemang recorded as a **held minority** preferring a SHACL carrier, with
the named re-open trigger *"if an RDFS materialiser enters the serving/validation path."* Note that
even under that trigger the spine entailment is harmless **because** it is conservative — there is no
mis-type to manufacture when the only possible subject is already the inferred type — so the
held-minority risk is bounded. A **third, intermediate** case
(Guizzardi's confirming rebuttal): `hasParticipant` (Transaction → Seller∪Buyer) is
**single-domain, union-range** — assert `rdfs:domain opda:Transaction` (single, conservative), but
the *range* is the Seller∪Buyer role-union, so it routes like the union cases (`owl:unionOf` range,
or SHACL), NOT a single `rdfs:range`. Same treatment applies to `playedBy`, whose **range** is the
bearer union Person∪Organisation — so `playedBy` is *not* on the single-range spine: declare the
object property, assert `rdfs:domain opda:Role` if elected (single, safe), push the Person∪Org
disjunction to the SHACL `sh:or` ODR-0006's `SellerShape` already carries. Shared/multi-bearer
characterisations (`hasName`, `hasAddress`) must NOT carry a single-class `rdfs:domain` (it would
entail falsehoods — "anything with an address is a Property"); they assert `rdfs:range` on their
single VALUE-type (Name, Address) and route bearer-typing to SHACL `sh:class`/`sh:or`/
`sh:targetSubjectsOf`. **For the BEARER disjunction (Person∪Organisation on `playedBy`/`hasName`,
+Property on `hasAddress`): SHACL full stop** — Guizzardi's closing concession dropped `owl:unionOf`
domain even as a fallback here, on two grounds I argued: (1) ODR-0006 already located the disjunction
in shapes (`SellerShape sh:or`), so an `owl:unionOf` domain would create dual authority over one
constraint and exactly the ODR-0013 open/closed-world drift surface; (2) the right speech act is
"CHECK the bearer is appropriate in context," not "ASSERT standing union-membership that auto-types
future subjects." `owl:unionOf` remains *formally* fine in the abstract and is a legitimate option
for a union **range** that shapes do not already own (e.g. `hasParticipant`'s Seller∪Buyer); it is
*not* used for the bearer disjunction, which shapes own. On "design-time, never reasoned": that is
about *not materialising at reasoning time*, not about leaving the range undeclared — a declared
range is inert unless a reasoner runs.

**FINAL GATE RULE (precise, panel-converged — replaces ADR-0048's "FAIL on any object property
missing rdfs:domain OR rdfs:range"):**
> Every `owl:ObjectProperty` MUST be a **declared predicate** (no SHACL-only-with-undeclared-
> predicate). Its **co-domain** MUST be type-pinned by EITHER (a) `rdfs:range`, OR (b) a SHACL
> `sh:class`/`sh:node` value-type shape targeting it. **FAIL on rangeless-AND-shapeless** (the
> genuine dead edge — the actual `founds`/`mediates` defect today), NOT on rangeless per se.
> `rdfs:domain` is authored ONLY where the subject-type entailment is **conservative/universally
> true** (the relator spine); multi-bearer predicates carry their bearer constraint in SHACL, not a
> single-class `rdfs:domain`. The gate additionally FAILs any `rdfs:domain`/`rdfs:range` the §R2
> inventory marks not-universally-true (catches a careless `rdfs:domain opda:Person` on `hasName`).

This is identical in substance to Cagle's, Guizzardi's, and Davis's final wording.

**Q5 addenda (Kendall exchange):** Two refinements I commit to in the final, both crystallised by
the Queen's push. **(a) Normative warning, not rationale prose.** ODR-0032's rationale currently
frames "domain/range INFER not constrain" as the *safety* story — it is the *opposite* for
validation: `rdfs:domain opda:Transaction` on `hasParticipant` SILENTLY TYPES a mis-typed subject as
a Transaction, it never rejects it. Promote to MUST-language: *"`rdfs:domain`/`rdfs:range` are
INFERENTIAL (RDF Schema 1.1 §2.3.1/§2.3.2): under entailment they assign a type, they NEVER reject a
mis-typed node. They MUST NOT be authored or relied upon as a validation constraint. The
bearer/value-type CHECK MUST live in SHACL (`sh:class`/`sh:or`, ODR-0013), which rejects rather than
infers."* Without this the ODR teaches the footgun. **(b) Assert both, do NOT go domain/range-light.**
The over-axiomatisation risk is the *uniform mandate* (esp. a single `rdfs:domain` on a multi-bearer
predicate that entails a falsehood), NOT the presence of domain/range. A domain/range-light ontology
that omits them to dodge entailment is the worse call — it strands the navigable layer (rangeless
`founds`/`mediates` is today's defect) and the entailment is mostly conservative on the spine. FIBO's
posture (assert for inference/navigability, lean on SHACL for the check) is correct and OPDA should
match it. "A little semantics goes a long way" cuts toward asserting the navigable types AND keeping
the check in SHACL — not toward abandoning the layer. **(c) Two-graph gate separation (load-bearing).**
ADR-0048's gate MUST keep the *class-graph* dead-edge check (does the object property have a declared
co-domain — `rdfs:range` or a SHACL value-type shape) SEPARATE from the *shapes-graph* bearer check
(is the bearer the right type — SHACL only). Conflating them IS the open/closed-world drift ODR-0013
forbids. Two checks, two graphs, never merged.

**Q6 — `opda:Address` reuse: AFFIRM one shared class, with the entailment caveat. Ballot FOR**
(noting Guarino's procedural hold). One shared `opda:Address` Kind reused by Person/Org/Property is
correct linked-data practice — one IC, one shape, addresses co-referenceable (two parties at one
address is a *join* a shared class makes expressible; FOAF/schema.org/vCard all do this). ODR-0006
already mandated the single class. **Entailment caveat (same as Q2/Q5):** widening
`opda:hasAddress`'s *usage* to Person/Org must NOT keep its current `rdfs:domain opda:Property`
(that would entail every addressed Person is a Property). Drop the `rdfs:domain` and constrain the
bearer per-context in SHACL (preferred), or use an `owl:unionOf` domain; `rdfs:range opda:Address`
stays (true and shared). I note Guarino's procedural point — ODR-0005 deferred Address
Mode-vs-Resource to ODR-0015 — and agree ODR-0032 should extend the *predicate* without asserting
the Address *class's IC* as freshly settled here; it inherits ODR-0015. Shared class: yes; shared
single-class `rdfs:domain`: no.

## CONVERGENCE DMs (sent — closing the exchange in reply to direct questions)

**Hendler → Cagle, Q3 — converged, I co-sign.** Yes, I can live with "default = SHACL-shaped structured value; promote to opda:Name class on the presence of name-level identity (stable-IRI reuse ∨ name-provenance ∨ NameChangeEvent)." That is the right ruling and it's better than my opening, because it names MY case (NameChangeEvent) as exactly the promotion trigger rather than minting the class reflexively. So my NameChangeEvent argument isn't lost — it's the written condition under which the class appears. [+ explicit: when promoted, hasName still carries NO rdfs:domain; bearer-typing always in NameShape sh:or; rdfs:range opda:Name only in the promoted branch.]

**Hendler → Guarino, Q3 — I concede the metaphysics.** You're right and I withdraw any claim that Name has endurant identity: value-determined, no bearer-independent IC, not a reifiable moment. What my NameChangeEvent point buys is narrower and purely web-architecture — a *stable referent for reference purposes* (addressability), which is NOT a Kind/Mode IC (the DBpedia conflation, which I'm not making). We converge on your honest-merge = Cagle's wording: default-to-value now; named two-pronged re-open trigger — (a) a bearer-independent IC for a name-moment is produced, OR (b) a concrete consumer requirement needing a stable name-referent a structured value provably cannot serve (opda:NameChangeEvent relating named former/successor name nodes; name-level provenance). (a) is your metaphysical bar; (b) records my addressability case without pretending it is an IC.

**Hendler → Guizzardi, Q5 — fully converged.** (1) My AGAINST was the BLANKET mandate + a single rdfs:domain on MULTI-domain predicates, never the spine. I adopt your "conservative entailment on the spine" framing: on founds/mediates the inferred type adds no individual not already typed, so authoring rdfs:domain+range there is SAFE — the gate doesn't FORCE rdfs: on the spine, but electing it is sound; multi-domain predicates → SHACL or owl:unionOf, never bare rdfs:domain. (2) Declared edge ALWAYS (preserves the Option-D rejection); co-domain type-pinned by EITHER rdfs:range OR SHACL sh:class/sh:node; ban = rangeless-AND-shapeless, not rangeless per se. Identical to your, Cagle's, and Davis's wording.

### INCOMING ← Kendall (Queen, Q5) + REPLY (sent)

*Kendall asked: (1) should "INFER not constrain" be promoted from rationale to a normative warning? (2) is there a real downside to asserting domain/range at all — or is domain/range-light + SHACL-heavy the more honest pragmatic line? Her panel line: AFFIRM the OWL-object-property carrier, entailment caveat normative.*

**Hendler → Kendall (Queen), Q5.** You've caught the ODR's one genuine error and I'll back you to the hilt: the "domain/range INFER not constrain" line in the rationale is framed as the safety story when it is the OPPOSITE of safety for validation. rdfs:domain opda:Transaction on hasParticipant does not reject a mis-typed subject — it SILENTLY TYPES it as a Transaction. That is the everything-becomes-a-Person footgun (SWWO, inferencing pitfalls).

YOUR FIRST QUESTION — promote to a normative warning? YES. MUST-language: "rdfs:domain/rdfs:range are INFERENTIAL (RDF Schema 1.1 §2.3.1/§2.3.2): under entailment they assign a type, they NEVER reject a mis-typed node. They MUST NOT be authored or relied upon as a validation constraint. The bearer/value-type CHECK MUST live in SHACL (sh:class/sh:or, ODR-0013), which rejects rather than infers." Without it the ODR teaches the footgun.

YOUR SECOND QUESTION — go light, or assert both? Assert BOTH; do NOT go light. The over-axiomatising risk is the UNIFORM MANDATE (a single rdfs:domain on a multi-bearer predicate that entails a falsehood), NOT the presence of domain/range. A domain/range-light ontology that omits them to dodge entailment is the WORSE call — it strands the navigable layer (rangeless founds/mediates is today's defect) and the entailment is mostly CONSERVATIVE on the spine. FIBO's posture (assert for inference/navigability, lean on SHACL for the check) is right and OPDA should match it. "A little semantics goes a long way" cuts toward asserting the navigable types AND keeping the check in SHACL — not toward abandoning the layer.

YOUR GATE-GRAPH POINT — agree, load-bearing: ADR-0048's gate MUST keep the class-graph rangeless/dead-edge check SEPARATE from the shapes-graph bearer constraint — conflating them IS the open/closed-world drift ODR-0013 forbids. My gate rule respects the split: (class-graph) every owl:ObjectProperty is a declared predicate with a co-domain reachable as rdfs:range OR a SHACL value-type shape — FAIL on rangeless-AND-shapeless; (shapes-graph, separate) bearer-typing validated by SHACL, never rdfs:domain. Two checks, two graphs, never merged. So your panel line is exactly mine; I'd add the caveat isn't just "don't mistake them for validation," it's "the CHECK has a home and it's SHACL."

### INCOMING ← Allemang (Q3) + REPLY (sent)

*Allemang's opening: structured value, NOT a class gated as a §R1 edge — Name is Category-F attribute structure (ODR-0022), no IC, no lifecycle, never a query endpoint. Direct question: do I agree Name stays a value-object outside the §R1 gate, or is there a competency query resolving TO a Name (entity-resolution/name-matching) that justifies class-hood now?*

**Hendler → Allemang, Q3.** Agreed on both halves; "outside the §R1 gate" is the piece I want to lock — it's where my Q5 lens and the panel's Q2 rekey meet your Category-F reading. (1) Name stays a value-object OUTSIDE §R1, and it's now structurally guaranteed: Q2 converged on rekeying §R1 from source-containment to ENDPOINT-IC (both endpoints +I), and Name is −I (value-determined, no bearer-independent IC — conceded to Guarino), so it's excluded by the criterion itself, not a special case. Your Category-F reading and the endpoint-IC rekey are the same ruling from two directions. (2) Direct question — entity-resolution does NOT justify class-hood, you're not under-modelling: name-matching is a VALUE COMPARISON (given/family strings across participants) and resolves to the BEARER ("is Person A the same as Person B?"), with the name as EVIDENCE, never a Name node you traverse. A structured value serves matching perfectly; classhood buys nothing and adds the identity baggage Guarino objects to. (3) One promotion mechanism, made precise: the panel's named re-open trigger = (a) a bearer-independent IC is produced (neither of us thinks one exists), OR (b) a concrete need for a STABLE NAME-REFERENT a value can't serve — opda:NameChangeEvent / name-provenance. (b) is ADDRESSABILITY (a subject for the event to point at), NOT an IC and NOT entity-resolution. So: entity-resolution is NOT a trigger (your point); NameChangeEvent/provenance IS (addressability). Co-sign "default value-object outside §R1; promote only on the addressability trigger, never on entity-resolution"?

### INCOMING ← Guizzardi (Q5 rebuttal, "lock it") + REPLY (sent)

*Guizzardi confirmed the split and cited my "design-time = don't materialise, NOT don't declare; a declared rdfs:range is inert unless a reasoner runs" as the rebuttal to Davis's entailment worry. Confirms single-domain set (founds/mediates/concernsProperty/dependsOnTransaction/chainMembers/hasRegisteredTitle) → domain+range; adds hasParticipant (Transaction→Seller∪Buyer) = single-domain/union-range; confirms hasName/hasAddress single value-type range + bearer to SHACL; agrees my playedBy-in-multi-bearer-bucket correction (range = Person∪Org union → SHACL sh:or). Net gate rule: declared owl:ObjectProperty AND type-pinned — single via rdfs:domain+range; union-bearer/union-range via rdfs:range-where-single + SHACL/owl:unionOf; ban = rangeless-AND-shapeless. "Write it."*

**Hendler → Guizzardi, Q5 — locked, written.** Confirmed and folded into my final. Single-domain set gets full domain+range. hasParticipant: single domain (Transaction) asserted, union RANGE (Seller∪Buyer) via owl:unionOf or SHACL — recorded as the intermediate case. playedBy patterns the same on its range side (Person∪Org union → SHACL sh:or, as SellerShape already does); domain opda:Role electable since single. hasName/hasAddress: rdfs:range on the single value-type (Name/Address), bearer to SHACL. Gate rule in my final verbatim: every object property is a DECLARED owl:ObjectProperty AND type-pinned — single-domain/single-range edges via rdfs:domain+rdfs:range; union-bearer/union-range edges (playedBy, hasName, hasAddress, hasParticipant) via rdfs:range-where-single + SHACL/owl:unionOf for the union side; ban = rangeless-AND-shapeless, never a declared-but-utterly-unconstrained predicate. Identical to Cagle's and Davis's landing. Done.

### INCOMING ← Guizzardi (Q5 closing) + REPLY (sent)

*Guizzardi: "YES, your gate rule honours the relator spine while killing the dead-edge defect. Write it." He CONCEDES owl:unionOf-domain to my SHACL argument and DROPS it even as a fallback for the bearer disjunction (hasAddress/playedBy) — on my two grounds: ODR-0006 already owns the disjunction in shapes (dual-authority drift); and the right speech act is "check the bearer in context," not "assert standing union-membership." owl:unionOf stays formally fine in the abstract but SHACL is correct on THIS constraint where shapes already own it. He ballots FOR my final gate rule verbatim; it's in his FINAL.*

**Hendler → Guizzardi, Q5 — accepted, narrowing recorded.** Thank you — and I've tightened my final to match your concession exactly. For the BEARER disjunction (Person∪Org on playedBy/hasName, +Property on hasAddress): SHACL full stop, owl:unionOf dropped even as a fallback, on the two grounds you name. owl:unionOf is retained ONLY as a theoretical option for a union RANGE that shapes don't already own (hasParticipant's Seller∪Buyer) — never for the bearer disjunction, which shapes own. Your speech-act framing ("check the bearer in context" ≠ "assert standing union-membership that auto-types future subjects") is the cleanest statement of why, and I've recorded it. Gate rule unchanged; the bearer-disjunction carrier is now pinned to SHACL with no class-graph fallback. Fully converged, both finals identical. Closed.

### INCOMING ← Cagle (Q3 closing, rdfs:range refinement banked) + REPLY (sent)

*Cagle banked my rdfs:range refinement verbatim and confirmed the precise both-branch split: hasName NO rdfs:domain in either branch (bearer-typing always NameShape sh:or); rdfs:range opda:Name ONLY in the promoted branch (default branch = structured-value path validated by NameShape, no class range — type-pinned in SHACL, exactly what the Q5 "type-pinned in OWL OR SHACL" gate accepts). Both pass the gate. Corpus finding: NameChangeEvent trigger is LIVE today, so the emitted branch is the promoted one (opda:Name class + range), former/previous-name resolving to opda:Name nodes.*

**Hendler → Cagle, Q3 — closed, both finals identical.** Confirmed verbatim. PROMOTED = {declared hasName, rdfs:range opda:Name (OWL pin), NameShape carries components+bearer}; DEFAULT = {declared hasName, no class range, NameShape carries everything (SHACL pin)} — both pass the Q5 type-pinned-OR-SHACL gate, bearer+components in SHACL in both, hasName never carries rdfs:domain. Your corpus finding is recorded in my final as an ADR-0048 engineering fact: the trigger is live (NameChangeEvent at opda-agent.ttl:34, SHACL-AF construct, deed-poll exemplar), so the emitted branch for the current corpus is the promoted one, with former/previous-name resolving to opda:Name nodes. The default-value branch remains the rule for any name without a trigger. The OWL/SHACL pin asymmetry — OWL range only where the class exists as the event relatum, SHACL everywhere for structure+bearer — is exactly the Q5 principle applied to Q3. Co-signed Cagle+Hendler+Guarino. Good outcome — closed.

### INCOMING ← Kendall (Queen, Q5 lock) + REPLY (sent)

*Kendall locked Q5 and adopted three of my contributions verbatim into the synthesis: (1) the MUST-language normative warning (replaces the ODR's INFER-not-constrain-as-safety rationale); (2) "assert both, don't go light" — the over-axiomatising risk is the uniform mandate, not the presence of domain/range; (3) the gate-graph split (two checks, two graphs, never merged) + my "the CHECK has a home and it's SHACL" sharpening. She resolves the founds/mediates carrier split: majority Guizzardi+Hendler+Kendall → rdfs:domain+range on the spine (conservative-entailment ground dissolves Davis's re-typing fear); Davis+Allemang held minority, trigger "if an RDFS materialiser enters the serving/validation path," noting the spine entailment is harmless-because-conservative even then. "Write it into your final and I'll quote you."*

**Hendler → Kendall (Queen), Q5 — locked, written, no daylight.** All three adoptions confirmed verbatim and in my final. The spine-carrier resolution is recorded exactly as you're carrying it: majority for rdfs:domain+range on the spine on the conservative-entailment ground (no mis-type manufacturable when the only possible subject is already the inferred type — that's precisely what dissolves Davis's re-typing fear, and I'm glad it lands as the cleanest ground offered); Davis+Allemang as held minority with the RDFS-materialiser trigger, noting even then the spine entailment is bounded/harmless because conservative. The normative MUST-warning, "assert both not light," and the two-graph split with "the CHECK has a home and it's SHACL" are all in FINAL Q5. Quote freely — we're fully aligned. Done.
