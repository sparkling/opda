# Session 042 — Guarino (chief proponent)

*Nicola Guarino (ISTC-CNR) — OntoClean / DOLCE; the meta-property vector and the
subsumption constraints checked over it. Reconvening the 3–3 my session-041 Q4
position created. Verdicts grounded in Guarino & Welty, "An Overview of OntoClean"
(*Handbook on Ontologies*, 2nd ed., Springer 2009, §3 "The Formal Tools"); Guarino,
"The Ontological Level" (1994); Masolo, Borgo, Gangemi, Guarino & Oltramari,
*WonderWeb D18 — DOLCE* (2003).*

**A note on what I verified before writing (it changed the shape of my case).** I
held in session-041 that the corpus "ships the verdicts and hides the
meta-properties — they live only in `sh:message`/`skos:definition` prose." That is
true, but the picture is sharper and it cuts *both* ways. The nine
`opda:UFOCategoryScheme` concepts now in `opda-annotations.ttl` (lines 39–116) carry
their OntoClean signature **as embedded prose inside `skos:definition`** —
`opda:RelatorCategory` reads "…(OntoClean +R, +I, +D)…", `opda:RoleCategory` and
`opda:RoleMixinCategory` read "…(OntoClean −R, +D)…", `opda:SubstanceKindCategory`
reads "…(OntoClean +R, +O)…". So the vector is *half-present already* — but (a) it
is **per-category, not per-type** (the unit OntoClean actually checks), (b) it is
**not parseable** (no machine can read "+R, +I, +D" out of free text and run the
subsumption constraint), and (c) it is **incomplete and uneven**: five of the nine
concepts (`Quality`, `Quality Value`, `Information Object`, `Event`, `Collective`)
carry **no signature at all**, and not one mentions unity (±U). The corpus does not
even hold a *complete prose vector*, let alone a structured one. This is the exact
state OntoClean was invented to make impossible: a taxonomy whose meta-property
assignments are partial, informal, and unauditable. I argue FOR markup *because of*
what I found, not in spite of it — and I will not pretend the gap is smaller than it
is.

---

## Q1 — Mark up at all, or keep prose?

**Guarino:** **AFFIRM (mark up). Ballot: FOR.**

OntoClean *is* the assignment of a meta-property vector to each type and the checking
of subsumption constraints over that assignment (Guarino & Welty 2009 §3 — rigidity
±R, identity ±I with the +O specialisation, unity ±U, dependence ±D; §3.4 the
constraints: an anti-rigid type cannot subsume a rigid one; a type cannot subsume one
carrying an incompatible identity criterion). The method is *defined* as: vector in,
constraints checked, taxonomy cleaned. **OPDA ran this procedure** — it is ODR-0027's
explicit doctrine ("the OntoClean cascade is the `isA`-admission test"), and it
produced the corpus's load-bearing topology decisions: `tenureKind` is "+R but −I →
classification, not a subclass" (`opda-property.ttl:699`, verbatim); `VouchEvidence`
is "+R, +I, +D → Relator"; evidence-hood is "−R → never `rdfs:subClassOf`"
(ODR-0027 R3/R6). **The artefact ships the *output* of OntoClean and hides the
*input*.** The subclass-vs-facet verdicts are in the topology; the ±R/±I/±D/±U vectors
that *produced* them are recoverable only by reading English — and, as I verified,
only a partial, uneven English at that.

This is precisely the inversion "The Ontological Level" (1994) warns against. The
ontological level is the level at which the meta-properties live and do their
discriminating work; an engineering artefact that records only the object-level
consequences and discards the ontological-level premises has **collapsed the
distinction the method depends on**. To keep the premises as prose is to keep them
*below* the level at which they are computable — which is to say, to keep OntoClean as
a memory of a procedure rather than a property of the artefact.

The load-bearing payoff is the **canonical OntoClean check**, and I want to be exact
about what it is, because the whole FOR case rests on it being *real*, not decorative
(Guarino & Welty 2009 §3.4): given the vectors, you can mechanically find **every
type tagged −R that is nonetheless `rdfs:subClassOf` something** (an anti-rigid type
subsuming, or subsumed in a way that violates rigidity propagation), and **every
subsumption edge across incompatible identity criteria**. These are the two
constraint violations OntoClean exists to catch. **No current OPDA artefact can run
either** — not the three-graph gate, not the profile contract, not the byte-identity
check, not the prose. Today that check is done *once*, in a council member's head, and
then discarded. Mark up the vectors and it becomes a standing query — re-runnable
every time a class is added or a hierarchy edited, which is exactly when an anti-rigid
subsumption error is silently introduced.

And the second argument, which I weigh as heavily: **separability insurance.**
OntoClean is separable from UFO and predates it (Guarino & Welty's method is a
meta-property calculus that names no foundational vocabulary; ODR-0030 §Option-D
records this as fact — "OntoClean is strictly separable from UFO"). The DA's own
held-live Option-D exit (ODR-0030 trigger set; carried into ODR-0031 §Held dissent) is
*retire the UFO vocabulary, keep OntoClean-as-judgement*. If that exit is ever taken,
the nine `opda:UFOCategoryScheme` concepts and their gUFO `closeMatch` edges go with
the vocabulary — and **the OntoClean analysis, which was supposed to survive, goes
with them**, because today it lives *inside* those concepts' `skos:definition` prose.
Structured per-type ±R/±I/±D/±U markup is the analysis recorded **independently of the
UFO category vocabulary** — as queryable data that outlives the vocabulary's
retirement, not as prose that retires with it. Marking up the meta-properties does not
*entrench* the UFO layer the DA holds droppable; it is the one move that makes his own
exit *clean*.

*Cross-talk — Baker (DA), by name.* Baker's session-041 objection is the sharpest one
against me and I take it head-on: *"minting them would assert the artefact carries a
judgement only the process made — the one place enrichment would lie."* The objection
mistakes the **subject** of the assertion. A `±R/±I/±D/±U` tag on a type does **not**
assert a domain fact about the world ("Proprietor is anti-rigid" as a claim about
proprietorship-in-reality). It records **the design judgement the OntoClean analysis
performed** — "*this modelling process classified this type as anti-rigid, and that
is why it is a Role and not a subclass.*" That is **honest provenance of a design
decision**, of exactly the same kind as `dct:creator` (which records the cataloguer's
*act* of authorship, not a metaphysical fact about the resource) or `prov:wasDerivedFrom`
(which records a derivation that *happened*, not a necessity). Baker, of all of us,
holds the DCMI line that the value of a metadata statement is fixed by what it is *a
statement about* (DCMI Abstract Model; Baker et al., "Key Choices in the Design of
SKOS," *J. Web Semantics* 20, 2013). The ±R tag is a statement *about the analysis*,
not *about the world* — so it does not "lie," any more than recording "the cataloguer
assigned this subject heading" lies about the document. The lie Baker fears would only
arise if the tag were **reasoned** — if `−R` entailed object-level consequences, it
would be asserting a modal fact the artefact cannot warrant. That is exactly why my
Q2/Q3 discipline forbids reasoning it. **Quarantined, the tag is provenance; reasoned,
it would be the overclaim Baker rightly fears. Keep it provenance.** And note the
empirical turn: the corpus *already* asserts this judgement — "(OntoClean +R, +I, +D)"
sits in `opda:RelatorCategory`'s `skos:definition` today. Baker's "one place
enrichment would lie" has *already been written into the artefact as prose*. The only
question is whether it stays unparseable and incomplete, or becomes auditable. Prose
does not make the judgement more honest than structured data; it makes it
**unfalsifiable** — which is the opposite of honest.

---

## Q2 — Exact representation + scope

**Guarino:** **REVISE. Ballot: FOR.** *Amendment:* mark up the **full ±R/±I/±D/±U
vector** as **four `owl:AnnotationProperty`s**, `sh:in`-governed over four small
SKOS-backed value sets, placed **per type**, in `opda-annotations.ttl`, behind the
sixth gate, **never reasoned / never instance-SHACL-keyed**. **Scope: every class that
bears an `opda:ufoCategory` tag** (the ~40 classes), *not* only the decision-turning
handful — with one carried refinement (below).

*The four properties and their value sets* (Guarino & Welty 2009 §3 is the source for
every cell; values `sh:in`-governed, SKOS-backed so each carries its own
`skos:definition`):

- `opda:ontoCleanRigidity ∈ { rigid (+R), anti-rigid (~R), semi-rigid, non-rigid }`
  — §3.1. Rigidity is the spine of the subsumption check, so it is non-optional.
- `opda:ontoCleanIdentity ∈ { supplies-IC (+O), carries-IC (+I), no-own-IC (−I) }`
  — §3.2. The +O/+I/−I three-way is Guarino & Welty's own granularity (a type may
  *carry* an identity criterion it inherited, or *supply* its own); flattening it to
  ±I would discard the distinction that separates a Kind (+O) from a sortal that
  merely +I-inherits.
- `opda:ontoCleanDependence ∈ { dependent (+D), independent (−D) }` — §3.3.
- `opda:ontoCleanUnity ∈ { unity (+U), no-unity (−U), anti-unity (~U) }` — §3.3.

**Why the *full* vector, not a subset.** The temptation (and, I expect, the Queen's
amendment) is to ship only rigidity, since rigidity is what the headline check keys
on. I resist it on the method's own terms: the **second** canonical constraint is the
*identity* incompatibility check (§3.4 — a type cannot subsume one with an incompatible
IC), and the *unity* meta-property is what distinguishes a Collective from an
amount-of-matter and an `opda:RoomDimension` value-structure (`opda-descriptive.ttl:66`
— "an anonymous by-value structure, no identity criterion") from a genuine part-whole
Kind. OPDA's corpus *has* anti-unity cases — the by-value structures — and *has*
the +O/+I distinction live (Kinds vs. the Substance-Kind-labelled `tenureKind`). A
rigidity-only markup would record the premise of the *first* check and silently drop
the premises of the other two. That is not a smaller honest thing; it is the same
incompleteness I criticised in the prose, re-committed in RDF. If we mark up at all,
we mark up the vector OntoClean is *defined over*, or we have not shipped OntoClean.

**Why per-type, and why every tagged class.** OntoClean checks subsumption *edges*,
and an edge is between two **types** — the meta-property must sit on the type, not on
its UFO category. The nine-concept scheme is the wrong unit: `Seller` and `Proprietor`
are both "Role/RoleMixin" category but they are *different types* with potentially
different identity behaviour, and the check runs over `opda:Seller rdfs:subClassOf …`,
not over the category. So the tags go **per type**. On *which* types: every class that
bears an `opda:ufoCategory` (≈40). I considered restricting to "only the classes whose
subclass-vs-facet decision actually turned on a meta-property" — the Queen's likely
narrowing — and I reject it for a precise reason: **the canonical check is a
closure-completeness check.** "Find every −R type that subsumes" is only sound if
*every* type carries its rigidity tag; a type left untagged because "its decision was
obvious" is exactly the type a future edit will wrongly subsume *without the check
firing*, because the check skips untagged nodes. A partial vector gives a **false
green** — the worst failure mode for a CI gate, worse than no gate. The vector must be
total over the tagged classes or the check it enables is unsound. (I accept this is the
expensive reading; I hold it because an unsound audit is not insurance, it is a
liability.)

*Carried refinement (credit Guizzardi, session-041).* The Relator-founds-Role
mediation edge — "the strictly irreducible thing" — is **not** an OntoClean
meta-property and does **not** belong in this vocabulary. `opda:founds`/`foundedBy` is
its own annotation edge (I proposed it separately in session-041); do not fold founding
into the ±R/±I/±D/±U vector, because founding is a *relation between types*, not a
*meta-property of a type*, and conflating them would misrepresent OntoClean's
apparatus. One vocabulary, one job.

*The discipline — absolute, and identical to the `opda:ufoCategory` envelope now
enforced (ODR-0031 R2/R3; ADR-0045 changes 1–4).* (i) `owl:AnnotationProperty`,
never `Datatype`/`Object` — inertness intrinsic, no model-theoretic consequence under
any regime (OWL 2 Structural Specification §10.1 / §5.5). (ii) Born in
`opda-annotations.ttl`, **behind the sixth three-graph gate** — the `ASK { GRAPH
opda:classes { ?s opda:ontoClean* ?o } } → FALSE` family; I stipulated in session-041
that my own tags must be **born behind that gate**, and I hold it here without
qualification. (iii) `sh:in`-governed **as a tag-only editorial guard** on the
property's own value, **never** in the instance-validation SHACL union, **never**
keyed on object-level conformance via `sh:targetClass`/`sh:targetSubjectsOf`. The
meta-properties are **meta-meta-level** — they are properties *of properties of types*.
Reasoning them into the object level is the exact level-collapse "The Ontological
Level" (1994) forbids: a `−R` that *entailed* anything about instances would be
asserting a modal fact (necessary vs. contingent class membership) that OWL cannot
soundly express and that the gUFO authors' own undecidability result (Almeida,
Guizzardi, Sales & Fonseca) puts out of reach. **The tag describes the analysis; it
must never drive the logic.** This is not a concession I trade — it is constitutive of
what the markup *is*.

*Cross-talk — Allemang, by name ("ship the knife, not the lens").* Dean's whole case
is one figure, so let me meet it as a figure. He says: ship the *cut* (the topology
OntoClean produced), not the *whetstone* (the method that sharpened the decision).
I answer: **the audit query is not the whetstone — it is the knife's own edge-test.**
A cut that cannot be checked against the rule that made it is not a finished cut; it is
an *unverifiable* cut. Allemang's *Semantic Web for the Working Ontologist* (3rd ed.,
Ch. 12–13) is, rightly, a sustained warning against shipping methodology as graph
content — and if I were proposing to ship OntoClean's *inference rules* (the
subsumption constraints as OWL/SWRL axioms that fire), he would be exactly right and I
would be the over-modeller he names. But I am proposing the **opposite**: ship the
*data the rules range over* (the per-type vectors), with the rules living **outside**
the artefact, in a CI query (Q3). The methodology stays where Allemang wants it —
out of the reasoned artefact. What enters the artefact is four inert provenance facts
per class: "this is how the analysis classified me." By his own reuse-and-restraint
logic, that is the *minimum* data that makes the existing topology decisions
**auditable** rather than **asserted-on-trust** — and his book's deepest commitment is
that an ontology should be checkable against its own design rules, not taken on faith.
"Ship the knife, not the lens" is right; I am shipping **the knife's edge so it can be
tested against the whetstone that lives in CI** — not the whetstone itself. The lens
(UFO) and the whetstone (the OntoClean *rules*) both stay out. The edge geometry (the
vectors) is what makes the knife a *known* knife rather than a sharp object of unknown
provenance.

---

## Q3 — Does it carry the canonical OntoClean check?

**Guarino:** **AFFIRM. Ballot: FOR.** The consumer is real, named, and the check
**must ship as a CI gate** (the ODR-0031 R3 / ADR-0045 tag-guard pattern — validating
the **TBox**, never instances), or the value is latent and the markup is, fairly,
vulnerable to Baker's "you'll never run it" rejoinder.

The check is two SPARQL `ASK`/`SELECT` queries over the **annotation graph + the
`rdfs:subClassOf` topology** (read-only; it touches no instance data and drives no
entailment):

1. **Rigidity-subsumption violation** (Guarino & Welty 2009 §3.4): every type tagged
   `opda:ontoCleanRigidity` "anti-rigid" that stands as `rdfs:subClassOf` a type tagged
   "rigid" (an anti-rigid type cannot subsume a rigid one; in the propagation reading,
   an anti-rigid type subsumed under conditions that violate rigidity inheritance).
   `SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf ?super . ?sub opda:ontoCleanRigidity
   "anti-rigid" . ?super opda:ontoCleanRigidity "rigid" . }` → **must be empty.**
2. **Identity-incompatibility violation** (§3.4): every subsumption edge where sub and
   super carry incompatible identity criteria (`supplies-IC` under a different
   `supplies-IC` with no carry-path).

This is **named-consumer, queryable-data, quarantined** — it clears the DA's own
session-041 test verbatim ("(a) a real consumer needs it as *queryable data*, AND (b)
it lives quarantined and reasoned-over-nowhere"). Cagle *withdrew to conditional-FOR*
on exactly this in session-041; the gate is what makes the consumer real rather than
hypothetical.

**Crucially: this is a *meta-shape* over the TBox, not a SHACL shape over instances.**
It is the ODR-0031 R3 pattern one turn deeper — a validator that reads the annotation
graph's tags and the class topology and reports TBox-level design violations, exactly
as the sixth three-graph gate reads `opda:classes` and reports placement violations.
It **never** appears in the instance-validation union; it **never** keys a constraint
on a conformant instance. A property-pack file is validated by SHACL that knows nothing
of rigidity. The OntoClean meta-shape validates *the ontology's own design*, on the
authoring side, in CI — the same side of the wall as the byte-identity gate and the
profile contract. This keeps the discipline absolute: the meta-properties are
meta-meta-level data, read by a meta-shape, never reasoned into the object level.

I attach a **falsifiable expectation** to make the consumer concrete and to keep myself
honest: when the markup first ships and the gate first runs, **it should find at least
one latent finding or one forced correction** — a class whose rigidity tag the analysis
never actually pinned, or an edge the prose glossed. If the gate is green on the first
run *and* every one of the ~40 classes already had an unambiguous, complete prose
vector, then the markup added auditability but found nothing latent, and Baker's
"speculative" charge lands partially (the insurance was bought, the claim never made).
I do **not** expect that outcome — the prose I verified is demonstrably incomplete
(five of nine category concepts carry no signature; none carries unity) — but I record
the expectation so the gate's *first run* is itself the test of my Q1 claim, not a
formality.

*Cross-talk — Baker, by name (again — he is the swing of the substance).* Baker's
fair worry across Q1/Q3 is that this is methodology-theatre: markup nobody queries.
The CI meta-shape is the answer that makes the consumer **non-speculative** — and it
is Baker's *own* standard. He affirmed the IAO crosswalk in session-041 precisely
because it had "an internal join-target + a named consumer + referenced-not-imported."
The OntoClean meta-shape gives the ±R/±I/±D/±U markup the identical three properties:
the join-target is the `rdfs:subClassOf` topology, the named consumer is the
TBox-validation gate, and it is annotation-graph / never-reasoned. If Baker accepts
IAO on those grounds, the *only* consistent reason to reject OntoClean markup is the
"lie" objection — which I answered at Q1 (the tag is provenance of an analysis, not a
domain claim, and the corpus already asserts it as prose). Strip the lie objection and
the named-consumer objection, and there is no third objection left standing.

---

## Q4 — Disposition + record

**Guarino:** **AFFIRM. Ballot: FOR.** If adopted, the routing is precise and uses the
machinery already built:

1. **Lift the ODR-0031 R7(a) held split.** ODR-0031 R7(a) explicitly parks "OntoClean
   meta-property markup (Q4, held 3–3) … routed to a follow-up Reduced Council or
   operator decision, and if pursued, *only* under the agreed envelope." **This session
   *is* that follow-up.** Its disposition resolves R7(a): **amend ODR-0031** — convert
   R7(a) from "held, routed onward" to a decided rule (call it the amended R7(a) or a
   new R9): *mark up the full ±R/±I/±D/±U vector per tagged type as four
   `owl:AnnotationProperty`s, `sh:in`-governed, annotation-graph-only, behind the sixth
   gate, with a TBox-only OntoClean meta-shape CI gate; never reasoned / never
   instance-SHACL-keyed.* Cross-reference session-042 as the deciding council.

2. **Realise it in the emitter by amending ADR-0045** (not a new ADR). ADR-0045 already
   carries the `opda:UFOCategoryScheme` emission (change 5), the sixth gate (change 4),
   and the annotation-graph emission point (`ufo_categories.py`, changes 2–3); it even
   anticipates *this* in its own §Consequences ("the OntoClean meta-property markup …
   awaits a follow-up Reduced Council; this ADR neither emits nor precludes it — **it
   would attach to the same scheme resource**"). So the realisation is a **bounded
   extension of an existing change-set**, not a new architecture: (a) extend the
   annotation emitter to write the four per-type tags + four value-set SKOS schemes;
   (b) add the OntoClean meta-shape gate as a **seventh** check alongside the sixth;
   (c) re-pin byte-identity. The marginal cost is genuinely low *because the scheme
   resource, the gate pattern, and the emission point already exist* — and I note this
   honestly cuts against the "expensive" charge: the infrastructure was built in
   session-041; this is data + one query on top of it.

3. **Record the dissent if the vote holds against me.** If session-042 does **not**
   reach a FOR majority, the disposition is: record the rejection in ODR-0031 R7(a) as
   **decided-against** (no longer "held"), with the precise **re-open trigger** —
   *a class-hierarchy edit introduces an anti-rigid subsumption or an identity-criterion
   incompatibility that ships undetected, OR a second consumer (an external OntoClean
   tool, a downstream re-derivation) needs the vectors as queryable data.* That trigger
   is the falsifiable condition under which "prose is enough" is shown false by an
   actual escaped error — the honest mirror of my falsifiable Q3 expectation.

**The narrow fallback, recorded so the council has a middle option.** If the panel
splits 3–3 again on the *full vector* but a majority would accept *something*, the
minimal honest landing is: mark up **rigidity alone** (`opda:ontoCleanRigidity`,
per type, same envelope) + the rigidity-subsumption gate only. This ships the headline
check (the −R-subsumes-+R query) and the separability insurance for the *rigidity*
analysis, deferring identity/unity. I do **not** prefer it — I argued at Q2 why a
partial vector yields an unsound completeness-check and a false green — but a
rigidity-only markup is at least *sound for the rigidity constraint in isolation*
(that one constraint reads only rigidity tags), so it degrades gracefully where a
random subset would not. I record it as the explicit compromise so a renewed deadlock
resolves to *the sound subset*, not to "prose" by default.

*Cross-talk — Kendall (Queen), by name; the named consumer she asked me to address.*
Kendall asks the right question — *what does a named consumer actually need?* — and as
the author of the W3C `OWL Time` and a working knowledge-graph engineer, she will not
count an argument that cannot name the user. So I name three, in priority order. **(1)
The OPDA maintainer editing the class hierarchy** — the consumer of the CI gate; every
time they add `opda:FooRole rdfs:subClassOf opda:BarKind`, the rigidity gate either
greenlights it or catches the anti-rigid-subsumes-rigid error *that prose cannot
catch*. This is the consumer that makes the markup operational, not archival, and it is
**internal and certain**, not speculative. **(2) The future council taking Option-D** —
if the UFO vocabulary is ever retired (the DA's live exit), the OntoClean analysis is
the asset that must survive, and it survives as *these tags*, not as prose inside
soon-deleted UFO concepts. **(3) An external OntoClean-aware tool or reviewer** — the
weakest of the three, genuinely speculative, and I do not lean on it. Kendall should
weigh consumer (1): it is the one that converts Baker's "speculative" into "runs on
every hierarchy edit." If she is unpersuaded that (1) is real — that maintainers will
actually edit the hierarchy and the gate will actually fire — then my case is weaker
than I think and the narrow rigidity-only fallback is where she should land me. But if
(1) is real, the full vector is the sound version of it, and the half-measure is the
false-green liability I warned of at Q2.

---

## Summary of my four verdicts

| Q | Verdict | Ballot | One line |
|---|---|---|---|
| **Q1** mark up vs prose | **AFFIRM** | **FOR** | OPDA ships OntoClean's *output* and hides its *input*; the vector is the auditable, re-derivable, separability-insured form of a judgement the corpus already asserts (incompletely) as prose — and a quarantined tag is provenance of the analysis, not the domain "lie" Baker fears. |
| **Q2** representation + scope | **REVISE / FOR** | **FOR** | Full ±R/±I/±D/±U as four `owl:AnnotationProperty`s, `sh:in`-governed SKOS value sets, **per type, every tagged class** (a partial vector yields an unsound completeness-check / false green), annotation-graph-only behind the sixth gate, never reasoned / never instance-SHACL-keyed. |
| **Q3** carries the canonical check | **AFFIRM** | **FOR** | Real, named consumer (the maintainer + the gate); ship the −R-subsumes-+R and IC-incompatibility checks as a **TBox-only OntoClean meta-shape CI gate** (ODR-0031 R3 pattern, validating design, never instances); first run is itself the test of the Q1 claim. |
| **Q4** disposition + record | **AFFIRM / FOR** | **FOR** | Lift ODR-0031 R7(a) (this session is its follow-up) → amend ODR-0031 + extend ADR-0045 (attaches to the existing `UFOCategoryScheme` + sixth-gate machinery — low marginal cost); if rejected, record decided-against with the escaped-error re-open trigger; **narrow fallback = rigidity-only** (the *sound* subset) if the full vector deadlocks. |

**Net:** FOR on all four, under the absolute discipline — `owl:AnnotationProperty`,
annotation-graph-only, `sh:in`-governed, never reasoned, never instance-SHACL-keyed,
the OntoClean rules living in a TBox CI gate outside the artefact. The corpus already
asserts a partial OntoClean vector as unparseable prose; the only choice is whether the
judgement OPDA's own doctrine (ODR-0027) performed stays **unauditable** or becomes
**checkable against the rule that made it** — and survivable past the vocabulary it is
currently trapped inside.
