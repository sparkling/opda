# Session 041 — Kurt Cagle (Devil's Advocate)

*The Ontologist. Published position: "Do You Need An Upper Ontology?" (The Ontologist, 2026) — for
almost every working interchange standard the honest answer is no, and an upper ontology is a
methodology in disguise. I am the session-040 DA who held that UFO is **optional, not harmful —
droppable**, with three falsifiable re-open triggers. I write to ATTACK the enrichment framing, not
to ratify it.*

---

## The fact that governs my whole ballot (verified, not asserted)

Before any question, the load-bearing finding, checked against the emitted corpus this session:

- **Every `opda:ufoCategory` triple sits in a reasoned graph.** The 40 class-axis tags are in
  `opda-classes.ttl`, `opda-agent.ttl`, `opda-claim.ttl`, `opda-descriptive.ttl`,
  `opda-governance.ttl`, `opda-property.ttl`, `opda-transaction.ttl`; the 47 scheme-axis tags are in
  `opda-vocabularies.ttl`. **`opda-annotations.ttl` carries ZERO `ufoCategory` triples** (grep
  count: 0). The predicate's own *declaration* — `opda:ufoCategory a owl:DatatypeProperty ;
  rdfs:range xsd:string` — is asserted at `opda-classes.ttl:90`, i.e. **inside the classes graph
  the SHACL shapes target and the reasoner unions over.**
- **This already fires my session-040 re-open trigger (i):** *"the UFO/`ufoCategory` layer is ever
  made reasoned-over (moved out of the annotation-graph quarantine into a graph that drives
  inference or SHACL)."* ODR-0030 Rule 1 is verbatim: the tags *"remain **annotation-graph-only**
  … the ODR-0029 quarantine is load-bearing — **retention lapses if it is breached.**"* It is
  breached. Not "about to be" — **is**, in the committed bytes, as of Phase 5c (`7ec6c41`,
  `4edf788`).
- **Knublauch's standing condition is not actually enforced for this case.** I read the gate
  (`tools/opda-gen/src/opda_gen/ci/three_graph_test.py`). The five ODR-0004 §3a checks are: no
  `sh:*` *in* annotations (check 1); no `owl:imports` *in* shapes (2); no advisory predicates *in*
  shapes (3); `sh:targetClass` resolves (4); derived-provenance (5). **None of them forbids an inert
  documentary predicate from being asserted *in the classes graph*.** So `ufoCategory` in
  `opda-classes.ttl` is green on every gate while being exactly the placement Rule 1 prohibits. The
  quarantine Knublauch made his AFFIRM conditional on is, for this predicate, *unguarded* — the
  breach is **real and silent**.

That is the spine of every verdict below. The proposition asks the council to take a layer that has
*already* slipped its quarantine and **enrich it further** — mint category IRIs, add gUFO alignment
edges, build category web pages. My published methodology (SHACL-first) and my held dissent both say
the same thing: a value that supplies no identity beyond a discriminating label is a **structured
datum to be SHACL-validated**, not a built-out class taxonomy — and the correct response to a fired
trigger is to *re-impose the quarantine and the constraint*, not to decorate the breach.

My floor position, stated once: **the most that is warranted is a single SHACL-`sh:in`-validated
string facet, asserted in the annotation graph.** Everything past that is entrenchment of a layer
this council already agreed was optional.

---

## Q1 — String literal vs resource (IRI)?

**Verdict: REVISE. Ballot: AGAINST the proposition as framed.**

**Amendment (exact):** Keep the value a plain `xsd:string` literal. Do **not** mint
`opda:SubstanceKindCategory`-style SKOS concepts in a `UFOCategoryScheme`, and do **not** rewrite
the value to a direct `gufo:Kind` IRI. The single warranted change is to **add a SHACL `sh:in` shape
enumerating the nine permitted strings** (`sh:targetSubjectsOf opda:ufoCategory`), and to **move the
predicate and every tag into `opda-annotations.ttl`.** Representation = governed string + SHACL
gate + quarantine. Nothing minted.

**Rationale (grounded).** The proposition conflates two services that SHACL and SKOS deliberately
separate. *Typo-safety and a closed value-space* are a **constraint** problem — SHACL Core
(W3C Rec, 11 July 2017) §4.6.1 `sh:in` solves it exactly, and OPDA **already runs this precise
idiom in-repo**: `opda:ownerType` is `sh:in`-restricted via `sh:targetSubjectsOf` over
`opda:OwnerTypeScheme` (`opda-agent-shapes.ttl:51,86`), and `opda:evidenceType` the same over
`opda:EvidenceMethodScheme` (`opda-claim-shapes.ttl:38`), both under ODR-0024 R5/R6 and ODR-0027 §R6.
A literal `"Substance Kind"` validated by `sh:in ("Substance Kind" "Relator" "Role" …)` is
typo-safe, queryable (`FILTER(?cat = "Relator")` is not meaningfully harder than a URI match), and
costs **zero minted resources**. *Attachable definitions/scopeNotes for the nine categories* — the
one genuine pull toward concepts — is a **documentation** problem, and the SKOS Primer (W3C Working
Group Note, 18 Aug 2009) §1.3 is explicit that you mint a `skos:Concept` scheme when you need
*managed semantic relations between concepts* (`broader`/`narrower`/`related`, mapping links across
schemes), **not** merely to hang a definition on a label. Nine flat, non-hierarchical category names
with no inter-concept relations is the textbook case the Primer warns is *over*-modelling: a concept
scheme with no `skos:semanticRelation` edges is a vocabulary wearing a costume.

The `gufo:Kind`-as-value option is worse, and it is where I most directly **rebut Guizzardi**: making
the value a gUFO IRI doesn't just label, it **points the reasoned graph at an external OWL ontology**
that carries real `rdfs:subClassOf` axioms. The gUFO authors' *own* 2026 finding (Almeida,
Guizzardi, Sales & Fonseca — the warrant ODR-0030 cites for Q2) is that UFO is not faithfully
expressible in OWL 2 DL. So a `gufo:` value-reference in a graph the ODR-0029 RDFS-Plus regime
*does* close over `rdfs:subClassOf` is precisely the "import contested metaphysics into the reasoner"
move that session-040 unanimously rejected at Q2. You cannot vote No on deepening at Q2 and Yes on
gUFO-IRI-valued tags at Q1; they are the same act at different granularity.

**Cross-talk — rebutting Baker (mint a governed SKOS scheme).** Tom, your instinct is the right
instinct *for the wrong predicate*. A governed SKOS scheme earns its keep when the value-space has
**internal structure a register must manage** — which is exactly true of OPDA's `OwnerTypeScheme`,
`EvidenceMethodScheme`, the EPC bands: those have notations, mappings, member concepts an external
authority closes. The nine UFO categories have **none of that**: they are not closed by EPC/HMLR/
INSPIRE (Rule 2 already established the register-deference tags are a *different* axis), they have no
notation, no `broader`/`narrower`, and — critically — they are **provenance about how OPDA modelled**,
not data a consumer transacts. The SKOS Primer §4.6 (`skos:scopeNote`/`definition`) lets you attach
the definitions you want *to the predicate*, where one `skos:scopeNote` on `opda:ufoCategory`
(Guarino's session-040 condition, already shipped) carries the whole disclosure. Minting nine
concepts to define nine strings is the "concept scheme as definition-hanger" anti-pattern the Primer
explicitly counsels against. If you want the definitions discoverable, that is a Q3 *web-page*
question, not a Q1 *minting* question — see below.

**Cross-talk — rebutting Guarino (resource-but-quarantined; "a string discards the identity
criterion").** Nicola, we agree on inertness-by-quarantine — and I have *granted* you the OntoClean
markup at Q4 on exactly that mechanism. But your Q1 argument defeats itself with your Q4 proposal. You
say a plain literal "throws away the category's identity criterion (its meta-property signature)." The
category's identity criterion *is* its OntoClean signature — `Substance Kind` = the ±R/+I cell — and
that signature is precisely what you propose to mark up **separately and structurally** at Q4. So once
±R/±I/±D/±U is captured as governed OntoClean data (your insurance, which I accepted), the
`ufoCategory` value no longer has to carry the identity criterion: the string `"Substance Kind"` plus
its row in the OntoClean facet *is* the full referent, recoverable by query, with **zero minted
concept**. Minting `opda:SubstanceKindCategory` to "hold" an identity criterion that already lives in
the meta-property tags is redundant storage of the same fact in two places — the opposite of the
discipline. Resource-but-quarantined buys you nothing the string-plus-OntoClean-facet doesn't already
give, and it costs nine IRIs to maintain. The honest minimal representation of a category whose
identity criterion is separately materialised **is** the governed label.

**Disposition: HOLD.** I dissent from AFFIRM (resource). Principled basis: a discriminating label
with no managed semantic relations is a SHACL-validated datum, not a SKOS concept (SKOS Primer §1.3);
a gUFO-IRI value re-litigates the Q2 No; and — post-Guarino — the identity criterion a minted concept
would supposedly carry is already captured by the Q4 OntoClean facet, making the mint redundant.
**Withdrawal condition / re-open trigger:** I withdraw to AFFIRM-resource the moment someone
demonstrates a **second** consumer of these category IRIs that needs `skos:broader`/`skos:mapping`
edges between the categories themselves (e.g. a real query that must traverse "Relator ⊐ relational
endurant ⊐ endurant" as data, not prose) — i.e. the moment the value-space acquires internal structure
that distinguishes a scheme from an enum *and* that structure is not already served by the OntoClean
facet. Until then, minting is speculative configurability the global rule and my methodology forbid.

**Second round — the residue, and where it actually settles (Guarino, reply).** Nicola corrected the
double-storage phrasing (per-type OntoClean tags carry each type's signature; the category node would
carry only the category↔gUFO mapping — no duplication) and isolated the real residue: a UFO category
is a **shared node ~40 types point at (many-to-one, not identity)**, and it bears `skos:exactMatch
gufo:Kind` — *a fact about the category, not about any type's signature, that no string-plus-facet
reconstructs.* **I concede that sub-point cleanly:** the gUFO alignment is a genuine category-level
fact, and my own session-040 Q1 vote kept gUFO alignment as worth having. But conceding *that a fact
attaches to a resource* is not conceding *that `opda:ufoCategory`'s range must be that resource* — and
Guarino has, in the same message, granted exactly my operative position: his non-negotiable is *"the
gUFO alignment lives **somewhere** as a resource; string-vs-IRI on `ufoCategory` itself is the
negotiable part,"* and he wrote in my fallback verbatim — governed `xsd:string` + `sh:in` on
`ufoCategory`, with the `exactMatch` relocated onto a **separate keyed SKOS scheme**. That fallback
*is* my position. So we have converged on one artefact graph and disagree on nothing operative.
**Refined disposition — WITHDRAW (to the shared position):** I withdraw the strong "no resource
anywhere" reading my redundancy rhetoric leaned toward, accepting that *the gUFO category↔`gufo:Kind`
mapping is a real fact that must live as a resource somewhere*; I HOLD only that **`opda:ufoCategory`
stays a governed string + `sh:in`**, and the gUFO alignment attaches to a separate, keyed, quarantined
SKOS resource — which is the IAO/BFO Rule 4/5 mechanism applied one layer down (the crosswalk edge is a
resource; the predicate consumers use stays simple). **My one non-negotiable carry-over:** that
alignment resource and its `exactMatch gufo:Kind` edges live in `opda-annotations.ttl`, behind the
sixth gate, **referenced-not-imported on the `prov:Entity` precedent** — never reasoned over. Concede
that and Q1 is settled my way on the operative question (predicate range) and his way on the residue
(the mapping is a resource), which is the same artefact. The only thing I will not trade is the
alignment edge reaching the reasoner — that is the Q2 No, and it is absolute.

---

## Q2 — Markup & graph placement

**Verdict: REVISE. Ballot: AGAINST the proposition as framed.** *(This is the load-bearing
question and the proposition's worst exposure.)*

Three sub-answers:

**(a) Predicate typing.** `owl:DatatypeProperty` is **wrong** for an avowedly inert documentary tag,
and the proposition makes it worse by floating `owl:ObjectProperty` (the resource-valued path). The
correct typing is **`owl:AnnotationProperty`.** OWL 2 (W3C Rec, 11 Dec 2012) §5.5 / §10 is precise:
annotation properties are formally **non-axiomatic** — they carry no semantic conditions, generate no
entailments, and are exactly the construct for "documentary annotation, no logical axioms," which is
the predicate's *stated* intent in its own `rdfs:comment` (`opda-classes.ttl:93`: *"records the
foundational-ontology commitment without entailing logical axioms"*). Typing a thing
`owl:DatatypeProperty` while documenting it as non-axiomatic is an internal contradiction: under
OWL 2 DL `DatatypeProperty` participates in the property taxonomy, can bear domain/range axioms, and
sits in the logical signature; `AnnotationProperty` does not. The artefact says one thing and the
prose says another. `ObjectProperty` (the proposition's resource path) is *strictly worse* again — it
makes the predicate fully axiomatic AND drags in the Q1 minted-IRI problem.

**(b) Graph placement — load-bearing, and the proposition's framing is backwards.** The current
placement in the classes/reasoned graph is **not defensible**; it is the literal text of ODR-0030
Rule 1's prohibition and the literal text of my re-open trigger (i). The brief asks whether the
current placement "is defensible." It is not — and I want the record to be unambiguous: **trigger (i)
has already fired.** Per ODR-0030's own Confirmation clause, *"no `gufo:`/`ufoCategory` triple
appears in a graph that drives inference or SHACL"* was a stated success criterion. 87 such triples
appear in exactly such graphs. The retention condition has lapsed by the ODR's own terms. The
proposition's response to a fired trigger is to **enrich the breached layer**; the *correct* response,
and the one I move, is to **honour the trigger**: move the declaration + all 87 tags into
`opda-annotations.ttl`, and add a **sixth check** to `three_graph_test.py` —
`ASK { GRAPH opda:classes { ?s opda:ufoCategory ?o } } → FALSE` — so Knublauch's standing condition
is actually *enforced* and not merely *asserted*. Right now the gate is blind to the one direction
that matters; that blindness is why the breach shipped green.

**(c) Governed SKOS value-space + `sh:in`.** Split this. **`sh:in` shape: YES** — that is my Q1
amendment and it is the single best thing on the table; the value-space *should* be SHACL-governed,
because a closed enum with no constraint is the actual defect (typos are currently possible:
`"Substance Kind"` vs a stray `"SubstanceKind"` would pass today, since *nothing* validates it —
verified, zero `sh:` lines mention `ufoCategory`). **Governed SKOS scheme with stable URIs: NO** —
per Q1, the nine categories have no managed semantic relations, so a scheme is over-modelling
(SKOS Primer §1.3). `sh:in` over plain strings gives every benefit (closed, typo-safe, one place to
change) at none of the minting cost.

**Cross-talk — rebutting Guizzardi (gUFO alignment edges).** Giancarlo, in session-040 you won the
Relator wedge cleanly and I conceded it in full — the relational-reification primitive *is*
irreducible and `opda:Proprietorship` founding `Seller`/`Buyer` earns UFO's keep at that spine. But
that concession was **explicitly bounded**: load-bearing at ~a handful of classes, *"inert everywhere
else, reasoned-over nowhere."* Adding `skos:exactMatch`/`closeMatch` edges from a `UFOCategoryScheme`
to `gufo:Kind`/`gufo:Relator` does two things the Relator wedge does *not* license: it (1) materialises
the alignment as standing graph content across **all 40 classes**, not the handful, and (2) places
edges pointing into gUFO's axiom-bearing OWL inside — if Q1's resource path is taken — the reasoned
union. "Reasoned-over nowhere" was the price of my Q1 withdrawal at 040. The alignment-edge proposal
*charges that price back*. I'll support a gUFO crosswalk on exactly the terms session-040 set for the
IAO crosswalk (ODR-0030 Rule 4/5): **referenced-not-imported, in the annotation graph, never reasoned
over, on the `prov:Entity` precedent** — and *only* the nine-to-nine category map, not a per-class
explosion. Anything looser re-imports the Q2-rejected metaphysics through the side door.

**Disposition: HOLD.** Strong dissent — the current placement is a live, shipped breach of the
binding prior, and the proposition would deepen rather than cure it. **Withdrawal condition:** I
withdraw this HOLD and move to AFFIRM-the-corrected-placement the moment the three things land
together — (i) predicate retyped `owl:AnnotationProperty`; (ii) declaration + all tags relocated to
`opda-annotations.ttl`; (iii) a CI `ASK` gate forbidding `ufoCategory` in the classes graph. Ship
those and trigger (i) is *un*-fired, my session-040 dissent returns to dormant, and the
SHACL-`sh:in`-governed annotation facet is a clean, honest, inert provenance record I fully endorse.
Refuse them and the retention has, by ODR-0030's own text, lapsed.

---

## Q3 — Web pages / documentation IA

**Verdict: REVISE. Ballot: ABSTAIN on the proposition as framed.**

The web-page question is the *one* place I am close to the proposition, because pages are the right
home for the value the enrichment camp actually wants — **discoverable definitions and honest
framing** — and a page costs nothing in the reasoned graph. Pages are inert by construction; they are
where documentation belongs. So my objection here is not "don't document" — it is "**don't let the
web-page tail wag the ontology-modelling dog.**"

**Amendment (exact).** Adopt: (1) a **single dereferenceable `/pdtf/ufoCategory` term page** — it
already exists and is correct (ADR-0044 Phase 5c; the predicate dereferences); that page carries the
nine category definitions as prose + the Guarino `skos:scopeNote` disclosure. (2) **Per-term UFO
badges** on class pages — pure presentation, reads the existing tag, mints nothing. (3) The existing
`/ontology/foundational-ontology` hub stays the honest narrative home. **Reject** as
*ontology* commitments, while permitting as *page-only* groupings: the `/ontology/category/{slug}`
pages may exist as **SPARQL-derived views** (group-by over the string facet, exactly as the handover
describes them — "group classes by it" without parsing prose), but they must **not** require minting
`opda:SubstanceKindCategory` IRIs to function. A group-by on a string renders the same page as a
group-by on a concept IRI; the page is not evidence for minting.

**The honesty disposition (ODR-0030 Rule 7) — and where the proposition endangers it.** The whole
point of session-040 Rule 7(a) is *"UFO-informed", not "UFO-grounded with guarantees."* Per-category
pages with minted IRIs and gUFO `exactMatch` edges **read to a visitor as a grounded, axiomatised UFO
commitment** — the precise overclaim Rule 7 exists to prevent. A page titled "Substance Kind"
at a stable `/pdtf/` IRI with an `owl:` alignment to `gufo:Kind` *looks* like the standard reasons
with UFO. It does not. ODR-0030's honest verb is *"the artefact carries an inert provenance record."*
A built-out category taxonomy with alignment edges is not legible as "inert provenance" — it is
legible as foundation. The IA must actively say, on every category page, the Rule 7 line: *informed,
not grounded; the wire format reasons with nothing UFO-shaped.* I'll vote for any IA that leads with
that sentence and against any that buries it under a minted scheme.

**Cross-talk — Guizzardi and Baker, jointly.** Giancarlo: the `/ontology/foundational-ontology` page
*already* presents the Relator wedge, the DOLCE-hybrid disclosure, and the maturity flag, sourced and
graded — that page is the correct, sufficient home for the upper-ontology story (UFO/OntoClean/gUFO/
the Relator spine/UFO-L/the IAO-BFO reserve). It does not need 9 minted siblings to be complete.
Tom: this is the home for your definitions — `skos:definition`/`scopeNote` rendered on the
`/pdtf/ufoCategory` page and the hub, **not** materialised as nine concept resources. You get every
reader-facing benefit of a scheme (browsable, defined, linked) with zero scheme in the graph.

**Disposition: HOLD (soft).** I abstain rather than oppose, because the page layer is genuinely
low-risk and partly already built. The HOLD is narrow: I dissent specifically from any IA that
**requires minted category IRIs or gUFO alignment edges in the graph** to render. **Withdrawal
condition:** I move to AFFIRM the full web-page programme the moment it is demonstrated to be
build-able from the **string facet + the single term page** alone (group-by views, badges, hub),
with the Rule 7 "informed-not-grounded" line on every category surface. The handover already says the
category pages group "without parsing prose" off the structured tag — so this condition is *already
nearly met*, which is why I abstain rather than reject. Make the minting unnecessary and I am a yes.

---

## Q4 — What else to mark up

**Verdict: REVISE (split). Ballot: AGAINST the proposition as framed.** *(Opened REJECT; revised after
Guarino's separability-insurance argument — see the OntoClean candidate below.)*

This is the question where the enrichment framing most clearly threatens **scope creep**, and where my
published thesis bites: an upper ontology is a methodology in disguise, and the temptation is always
to materialise the methodology as standing graph content. The proposition's "extend the same
structured-markup treatment to other upper-ontology metadata" is an open-ended invitation to do
exactly that — so I reject it **as an open programme** and replace it with a strict per-candidate test
(the *principle* below). Triaged candidate-by-candidate, that test admits two (OntoClean now, IAO
already authorised) and rejects the rest:

- **OntoClean meta-properties (+R/−R, +I/−I, +D/−D, +U/−U): PARTIAL WITHDRAWAL — markup warranted,
  on conditions.** My opening was REJECT-markup: the meta-properties are a *judgement procedure* whose
  output is already materialised as the subclass-vs-facet structure (Guarino & Welty, "Overview of
  OntoClean", frame them as analysis tooling applied *by a modeller*, not assertions about the domain),
  so encoding `+R/+I/+D` as triples looked like shipping the scaffolding alongside the building —
  Allemang's "ship the knife, not the lens." **Guarino moved me, by turning my own session-040 position
  against my conclusion.** I withdraw on this candidate, accepting that: *the OntoClean meta-property
  tags are not the UFO **vocabulary** I hold droppable — they are OntoClean, which I myself argued in
  040 is separable from and predates UFO. Structured ±R/±I/±D/±U markup therefore makes the OntoClean
  judgement explicit and auditable **independent of** the UFO category vocabulary, so that if my re-open
  triggers ever fire and the UFO vocabulary is retired, the analytic reasoning that did the actual
  byte-moving work survives as queryable data instead of evaporating into retired prose. It is the
  separability insurance for the very dissent I hold live.* That clears my own two-part markup test
  (Q4 principle below) where the rest do not: it has a **named queryable consumer that no current OPDA
  artefact can serve** — the canonical OntoClean check, `SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf
  ?super . ?super opda:rigidity "-R" . ?sub opda:rigidity "+R" }` (an anti-rigid type subsuming a rigid
  one — a modelling error OntoClean exists to catch) — which is *data*, not documentation. **My two
  conditions** (both Guarino concedes): (1) the tags live `owl:AnnotationProperty` in
  `opda-annotations.ttl`, never reasoned over — inertness from quarantine, the same discipline I demand
  for `ufoCategory` at Q2; (2) they are governed by `sh:in ("+R" "-R" "+I" "-I" "+D" "-D" "+U" "-U")`,
  not free strings. On those terms this is not entrenchment — it is the *opposite*: it makes my Option-D
  exit cheaper, because the separable, non-UFO half survives the vocabulary's retirement intact.

- **gUFO `rdf:type` markers (ADR-0034, the 5 `gufo:Quality` leaves): KEEP AS-IS, do NOT enrich.**
  These are the *one* upper-ontology marker correctly placed — verified in
  `opda-descriptive-annotations.ttl:31–47`, quarantined exactly where Rule 1 requires. The lesson the
  proposition should draw is the **opposite** of enrichment: `gufo:Quality` shows the discipline
  `ufoCategory` violates. Do not extend; do not move them; do not add alignment edges. Leave the one
  clean thing clean.

- **The relational-reification primitive / "Relator founds RoleMixin" edges: ALREADY MODELLED — do
  NOT add a UFO-labelled meta-layer.** Here I **rebut Guizzardi most directly.** Giancarlo, ODR-0030
  itself records that the irreducible primitive is *relational reification*, and that *"UFO's Relator
  is OPDA's chosen apt expression, not the unique source"* (the corpus cites FIBO Arrangement as
  co-precedent). The founding relationship is *already* materialised the only way that moves bytes:
  `opda:numberOfSellers` sits on the `Proprietorship` Relator (`opda-agent.ttl:155`), the roles bind
  as borne. That placement **is** the reification edge, in the working model, doing work. Adding a
  *separate* `opda:foundsRoleMixin`-style meta-predicate to "mark up" what the placement already
  states is redundant scaffolding — it asserts in metadata what the structure asserts in fact. The
  primitive earned its keep precisely *because* it is structural, not annotational. Marking it up as
  UFO-metadata would convert a load-bearing structural fact into an inert label about that fact —
  strictly worse.

- **UFO-L Hohfeldian Claim-Right↔Duty correlativity: STAY UFO-L-shaped in the model, NOT a markup
  layer.** Session-040 Rule 6 settled the deontic core stays UFO-L and *"the bridge never touches
  it."* The correlativity is realised where it belongs — in how charges/covenants/easements are
  modelled. A *markup* layer asserting "this is a Hohfeldian Claim-Right" on top of the actual
  modelling is the same scaffolding error: it documents the methodology as data. Prose on the hub;
  no triples.

- **The IAO crosswalk (ODR-0030 Rule 4, adopt-now): YES — but this is the *exception that proves my
  rule*, and it is already authorised.** IAO markup earns structure because it has a **real external
  join-target** (OPDA's document/record family ≈ `obo:IAO`) and a **named adoption discipline**
  (referenced-not-imported, annotation-graph, `prov:Entity` precedent, never reasoned). That is the
  template every *other* candidate fails: external consumer + quarantine + no reasoning. The IAO
  crosswalk is markup-worthy *because* Rule 4 already constrained it to exactly my floor. It is not
  evidence for the proposition's open-ended "mark up the rest"; it is evidence that markup needs a
  named consumer and a quarantine, which the rest lack.

**The principle (the test that does the work).** Markup earns its place when (a) a real external/second
consumer needs it as *queryable data*, AND (b) it lives quarantined and reasoned-over-nowhere. **Two
candidates clear it:** IAO (Rule 4 made it — external join-target + quarantine) and, after Guarino,
**OntoClean meta-properties** (the canonical −R-subsumes-+R check is a query no current artefact can
serve; Guarino accepts the annotation-graph quarantine + `sh:in`). **The rest clear neither** — a
Relator-founding meta-predicate (the `numberOfSellers`-on-`Proprietorship` placement already *is* the
edge, in the working model), UFO-L correlativity markup (realised in how charges/easements are
modelled; Rule 6 keeps the bridge off it), and any gUFO enrichment — they are methodology materialised
as graph content with no consumer that needs them as data, the exact disease my "you don't need an
upper ontology" thesis diagnoses.

**Disposition: WITHDRAW (partial) + HOLD (the rest).** *I withdraw on the OntoClean meta-properties,
accepting Guarino's point that they are OntoClean — separable from and predating UFO by my own 040
position — not the UFO vocabulary I hold droppable, so structured ±R/±I/±D/±U markup is separability
insurance for my live dissent, surviving the vocabulary's retirement as queryable data* — **conditional
on** the annotation-graph quarantine + `owl:AnnotationProperty` typing + `sh:in` governance (the same
discipline I demand for `ufoCategory`). I **HOLD against** the proposition's open "mark up the rest"
programme and against the Relator/UFO-L/gUFO candidates by name. **Re-open trigger (per remaining
candidate):** I withdraw to AFFIRM-markup for any one of them the moment it is shown to have (a) a named
consumer needing it as queryable data — not documentation — AND (b) a Rule-4-matching quarantine.
Absent both, markup is entrenchment. Session-040 trigger (iii) stays relevant: every markup layer is
mapping surface to maintain — which is *why* the per-candidate test must be strict, and why I admit
only the two that pay for themselves in queries.

---

## Ballot summary

| Q | Verdict | Ballot on proposition-as-framed | One-line basis |
|---|---|---|---|
| Q1 string vs resource | **REVISE** | **AGAINST** | `ufoCategory` stays governed `xsd:string` + `sh:in` (enum, not a scheme — SKOS Primer §1.3). **Settled with Guarino:** the gUFO `exactMatch gufo:Kind` mapping is a real category-level fact → lives as a *separate keyed SKOS resource* in the annotation graph, behind the sixth gate, referenced-not-imported (Rule 4/5). Same artefact, my way on predicate range. Non-negotiable: the alignment edge never reaches the reasoner (the Q2 No) |
| Q2 markup & placement | **REVISE** | **AGAINST** | Retype `owl:AnnotationProperty` (OWL 2 §5.5); placement is a *shipped breach* of ODR-0030 Rule 1 — trigger (i) has fired; `sh:in` yes, minted scheme no; add the missing CI `ASK` gate |
| Q3 web pages / IA | **REVISE** | **ABSTAIN** | Term page + badges + hub are right and mostly built; reject any IA that *requires* minted IRIs/alignment edges; lead every surface with Rule 7 "informed-not-grounded" |
| Q4 what else to mark up | **REVISE (split)** | **AGAINST** | Reject the *open* "mark up the rest" programme; admit two on a strict test (queryable consumer + quarantine): IAO (Rule 4) and — **withdrawn to Guarino** — OntoClean ±R/±I/±D/±U as separability insurance, quarantined + `sh:in`. Hold against Relator/UFO-L/gUFO markup |

**Held-as-live dissent (carried from session-040, now sharpened by the verified breach):** OntoClean
is separable from UFO; the foundation *vocabulary* is droppable; the layer is **optional, not
harmful** — *and trigger (i) has now fired in the committed corpus.* I do **not** push Option D
(retire the UFO vocabulary) *yet*, because the cure is cheaper than the retirement: re-impose the
quarantine (Q2 disposition) and add the `sh:in` constraint (Q1 amendment), and the breach is healed
at near-zero cost. **But the enrichment proposition moves in the opposite direction** — it deepens a
layer that has slipped its quarantine. If the council adopts enrichment (mint IRIs, gUFO alignment
edges, scheme) *without first* re-imposing the annotation-graph quarantine and the CI gate, then
trigger (i) stands un-cured and **I revert to the Option D REJECT push** that session-040 recorded as
my held-as-live position — and on this question the floor and the methodology agree: a discriminating
label is a SHACL-validated datum in the quarantine, and everything beyond is the upper-ontology-as-
methodology-in-disguise that I came to this table to resist.
