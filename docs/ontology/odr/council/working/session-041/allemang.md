# Session 041 — Allemang (Queen): how to represent `opda:ufoCategory`

**Lens:** the pragmatic Working-Ontologist methodology — *the simplest model that does the
job*; reuse before you mint; the RDF idiom for controlled values; SKOS-as-annotation. Touchstones:
Allemang, Hendler & Gandon, *Semantic Web for the Working Ontologist*, 3rd ed. (2020), esp.
Ch. 10 (modelling controlled vocabularies / SKOS) and Ch. 12–13 (good and bad modelling
practices, modelling for reuse); the SKOS Reference (W3C Rec, 2009, §1–§4, §8 on `skos:notation`).

My governing prior is ODR-0030's own settled verb: *the modelling process is governed by a
UFO/OntoClean decision procedure; the artefact carries an **inert provenance record** of that
governance.* I composed that synthesis. The question in 041 is narrower and entirely
representational: **what is the simplest faithful shape for that inert provenance record** — and
the answer is not uniform across Q1–Q4, because the predicate is currently doing two jobs that a
working ontologist would never let one term do.

---

## Q1 — String literal vs resource (IRI)

**Verdict: REVISE. Ballot: AGAINST the proposition as framed.**

**Allemang (Queen):** The proposition wants *one* answer — mint a governed SKOS scheme of
`opda:…Category` concepts under a `UFOCategoryScheme`, with `skos:exactMatch`/`closeMatch` edges
to gUFO. As a *single* prescription that is the wrong altitude on both ends, so I REVISE rather
than AFFIRM, and I ballot AGAINST the framing because the framing's central move — *enrich →
mint a local concept scheme* — is the textbook over-modelling error my own book names. The
precise amendment, split by the two value-spaces the brief's Fact 2 exposes:

- **The 9-term class axis (the `ufoCategory` that names UFO categories proper — `Substance Kind`,
  `Relator`, `Role`, `RoleMixin`, `Event`, `Information Object`, `Quality`, `Quality Value`,
  `Collective`):** the value should be **a direct IRI reference to the gUFO concept**
  (`gufo:Kind`, `gufo:Relator`, `gufo:RoleMixin`, `gufo:Role`, `gufo:Event`, …), **not** a
  locally-minted `opda:SubstanceKindCategory`. This is the *reuse-before-you-mint* rule
  (*Working Ontologist* 3rd ed., Ch. 13, "modelling for reuse"): the term you would mint already
  exists, published, dereferenceable, with `rdfs:label`, `skos:definition` and scope already
  authored by Almeida, Guizzardi, Sales & Fonseca. Minting `opda:SubstanceKindCategory` and then
  attaching `skos:exactMatch gufo:Kind` is **building your own copy of a thing that exists so you
  can declare it identical to the thing that exists** — the canonical bad practice the book warns
  against. The "governed CV with exactMatch edges to gUFO" is the *long way round* to `gufo:Kind`.
  A resource reference here is right; a *minted local resource* is not. The string `"Substance
  Kind"` is the status quo's defect (no dereference, no attachable definition, typo-prone — the
  brief's own list); the fix is the gUFO IRI, which discharges every one of those wants *for
  free* because gUFO already did the authoring.

- **The scheme axis (the 47 scheme tags — 35 `"Quale-in-Region"`, plus `"Substance Kind label"`
  ×5, `"Quality Value"` ×2, `"Phase label"` ×2, `"Method/plan code"` ×2, `"Role label"` ×1):**
  this is **a different vocabulary on the same predicate**, and that is the defect to split (the
  brief asks me directly, and my Working-Ontologist answer is unambiguous: yes, split it). `"Quale-
  in-Region"`, `"Phase label"`, `"Method/plan code"` are **not gUFO concepts** — there is no
  `gufo:QualeInRegion` IRI to point at — and ODR-0030 Rule 2 already ruled these 35 are
  **register-deference**, "not UFO doing categorial work." A predicate whose value is a `gufo:`
  IRI for 39 subjects and an un-dereferenceable English phrase for 47 others is not a controlled
  vocabulary; it is two vocabularies wearing one coat. *Working Ontologist* Ch. 12 ("good and bad
  modelling practices") is explicit that a single property should range over a single, coherent
  value-space; here `rdfs:range xsd:string` is "honest" only because it is the *loosest possible*
  range, papering over the fact that the two axes never share a value. **Split the predicate:** the
  9-term class axis keeps `opda:ufoCategory` and takes gUFO IRI values; the scheme axis moves to a
  distinct predicate (`opda:registerDeferenceCategory` or simply a `skos:scopeNote` string, since
  ODR-0030 already says these "must stop presenting them as UFO doing categorial work" — a string
  is the *right* model for a label that is admittedly not a categorial commitment).

So my one-line rule: **reference (gUFO IRI) where the value really is a UFO category; demote to a
plain string / separate predicate where ODR-0030 already conceded it is not.** Neither half is "a
governed local SKOS scheme," which is why I cannot AFFIRM the proposition.

**Cross-talk — Cagle (DA).** I agree with Cagle's spine and refine it. His attack — *don't entrench
an optional layer; the thinnest inert representation is correct* — is, on the **scheme axis**,
simply right: those 35 tags are register-deference, ODR-0030 Rule 2 already said so, and minting
`opda:QualeInRegionCategory` SKOS concepts for them would be the *maximal* entrenchment of the
exact layer session-040 called "optional, droppable." A working ontologist does not mint concepts
for a value-space an external authority (EPC/HMLR/INSPIRE) already closes — you defer to the
register. Where I **refine** Cagle: on the *class* axis, "thinnest = string" is *not* the thinnest
faithful model, because a bare string `"Relator"` is strictly *more* work to consume than
`gufo:Relator` (the string forces every consumer to re-implement a string→concept lookup that a
dereferenceable IRI gives them gratis). Reuse of an existing IRI is *thinner*, not thicker, than a
literal, by the book's own reuse calculus — so Cagle's "thinnest" instinct, followed honestly,
lands on `gufo:` references, not on strings, for the 39 class tags. We converge: neither of us wants
a minted `opda:` concept scheme.

**Cross-talk — Guizzardi.** Guizzardi's gUFO-alignment position is the right *target*, and it
*defeats* the proposition's mint-a-local-scheme move rather than supporting it. gUFO exists
precisely so that UFO categories have "real IRIs" (the brief's Fact 8) — `gufo:Kind`, `gufo:Role`,
`gufo:Relator`. If we accept Guizzardi that the alignment target is gUFO, then the Working-
Ontologist conclusion is forced: **point at gUFO directly**, do not mint a parallel `opda:` vocab
and bridge to it with `exactMatch`. I refine one thing for Guizzardi: the alignment is **reference,
never `owl:imports`** — consistent with ODR-0030 Rule 4's `prov:Entity` reference-not-import
mechanism and Knublauch's standing condition. A `gufo:` IRI sitting as the *object* of an inert
annotation triple does not import gUFO's axioms; it is a dereferenceable pointer, exactly the
SKOS-mapping idiom (SKOS Reference §10, mapping properties relate concepts *across* schemes without
merging them).

---

## Q2 — Markup & graph placement

**Verdict: REVISE. Ballot: FOR the proposition (on placement + SHACL; against on predicate typing as framed).**

**Allemang (Queen):** Three sub-parts, and the brief is right that placement is load-bearing.

**(a) Predicate typing.** REVISE. The proposition leaves typing open between
`owl:AnnotationProperty`, `owl:DatatypeProperty`, and `owl:ObjectProperty`. The stated intent —
verified in `foundation.py` and the emitted `opda-classes.ttl:90–96`, which says in its own
`rdfs:comment` "**A documentary annotation: it records the foundational-ontology commitment without
entailing logical axioms**" — is the textbook definition of an **annotation property**. So type it
`owl:AnnotationProperty`. The current `owl:DatatypeProperty` is a *category error against the
authors' own stated intent*: a `DatatypeProperty` is a logical, datatype-valued property in the OWL
2 object language (OWL 2 Structural Spec §5.4); declaring one and then writing "no logical axioms"
in its comment is precisely the assert-more-than-you-mean error. And since Q1 moves the *class
axis* to gUFO-**IRI** values, the datatype typing is doubly wrong: an IRI-valued annotation is
`owl:AnnotationProperty` (annotation properties may take IRI or literal objects; OWL 2 Spec §5.5),
**not** `owl:ObjectProperty` — because making it an `ObjectProperty` would pull it into the logical
object property box and invite exactly the inference/SHACL entanglement ODR-0030's trigger (i)
forbids. So: `owl:AnnotationProperty`, ranging over a gUFO IRI for the class axis. This is the
*minimum* typing that does the job and the only one consistent with "inert provenance record."

**(b) Graph placement — REVISE, and this is the decisive finding of the whole session.** AFFIRM the
proposition's instinct that placement must be corrected, and state the correction precisely: **every
`ufoCategory` triple — the declaration in `opda-classes.ttl:90` and all the inline per-term tags
across the eight non-annotation files (verified: `opda-classes.ttl`, `opda-agent.ttl`,
`opda-claim.ttl`, `opda-property.ttl`, `opda-descriptive.ttl`, `opda-governance.ttl`,
`opda-transaction.ttl`, `opda-vocabularies.ttl`) — must move into `opda-annotations.ttl`.** This is
not a stylistic preference; it is *required to keep ODR-0030 alive*. ODR-0030 Rule 1 is verbatim:
the tags "remain **annotation-graph-only**… the ODR-0029 quarantine is load-bearing — **retention
lapses if it is breached**." The brief's Fact 3 establishes — and I re-verified — that they are
**currently in the reasoned graphs and `opda-annotations.ttl` carries zero of them.** That is not a
future risk; **it is Cagle's re-open trigger (i) already fired in the committed corpus.** Phase 5c
(2026-06-15) put structured `ufoCategory` triples into the class graph one day after session-040
(2026-06-14) ruled they must be annotation-graph-only. ODR-0029's RDFS-Plus regime means they
currently *entail* nothing (Fact 5) — but trigger (i) and Rule 1 speak to *physical placement in a
graph that drives inference or SHACL*, not to whether inference happens to fire today. The Working-
Ontologist reading (the book's whole "say what you mean, mean what you say" ethic, Ch. 12): the
graph a triple lives in **is** a claim about its status; asserting an "inert provenance" annotation
inside the reasoned union claims it is reasoned-over. **Move them, or ODR-0030's AFFIRM lapses by
its own terms.** I will carry this to synthesis as the session's load-bearing disposition.

**(c) Governed SKOS scheme + `sh:in` shape.** REJECT both. On the class axis, the "governed value-
space" is **gUFO**, externally — we do not re-govern it locally (Q1). On the scheme axis, ODR-0030
already conceded those are register-deference; a local `sh:in` over UFO category *labels* would
re-assert the very "UFO doing categorial work" framing Rule 2 retired. More fundamentally: a
`sh:in` shape constraining `ufoCategory`'s values would put the predicate **into SHACL** — that is
re-open **trigger (i)** a second time ("a graph that drives… SHACL"). The Working-Ontologist point
(SKOS Reference §1.2: SKOS is for representing KOS *as data*, deliberately *not* as logical
axioms): if the value is an inert provenance pointer, you do not also build a constraint engine
around it; that contradicts its declared inertness. The typo-safety the proposition wants from
`sh:in` is delivered *for free* by IRI references — a misspelt `gufo:Reltaor` simply fails to
dereference, no shape needed. So: no minted scheme, no SHACL shape; rely on IRI dereferenceability
for integrity.

**Cross-talk — Cagle (DA).** This question is where Cagle's "don't entrench" wins outright and I
amplify it: the proposition's `sh:in`-governed-scheme limb would fire his own re-open trigger (i)
*by construction* — it moves the layer into SHACL. I am, in effect, ruling that **half the
enrichment proposition is self-defeating against the prior it must respect.** Cagle's structured-
value caution is vindicated on (c). Where I go further than a pure DA read: I hold that placement
(b) is *already breached in the committed bytes*, so this is not "don't entrench in future" — it is
"the entrenchment shipped; reverse it." That is a stronger finding than optionality.

**Cross-talk — Guizzardi.** Guizzardi will (rightly) want the gUFO `rdf:type` markers (ADR-0034)
and `ufoCategory` to align. I agree on alignment but insist on the *graph discipline* that makes
alignment safe: ADR-0034's gUFO types are *already* quarantined to `opda-descriptive-annotations.ttl`
(per session-040's pre-flight). `ufoCategory` must join them in the annotation graph for the
treatment to be coherent — you cannot have the `gufo:Quality` `rdf:type` markers quarantined while
the `ufoCategory` facet naming the same category sits in the reasoned graph. Consistency *with
Guizzardi's own ADR-0034 discipline* demands the move in (b).

---

## Q3 — Web pages / documentation IA

**Verdict: AFFIRM (with scope discipline). Ballot: FOR.**

**Allemang (Queen):** The web-pages treatment is where the proposition is *most* right, because
ADR-0044's "ontology as web pages" + ODR-0038 already commit OPDA to dereferenceable term pages, and
a `/pdtf/ufoCategory` term page already resolves (Fact 1). I AFFIRM, with the altitude discipline my
lens demands:

- **`/pdtf/ufoCategory` term page: keep and enrich.** It already dereferences. Its job is to host
  the **honesty disclosure** ODR-0030 Rule 7(b) mandates — and here I record a defect I verified:
  the emitted `skos:scopeNote` on `opda:ufoCategory` (`opda-classes.ttl:96`) currently says only
  "Promotes the UFO meta-category from documentary scopeNote free-text to a structured, queryable
  facet." **It does not yet carry the three-part DOLCE disclosure** Rule 7(b) requires (the
  categories are UFO's; UFO's quality categories descend from DOLCE's Quality/Quale/Region — Masolo
  et al., WonderWeb D18, 2003; the majority of tagged properties fall under that DOLCE-derived
  apparatus). That disclosure was a *condition of Guarino's swing vote* in session-040 and it has
  not shipped. The term page and the `scopeNote` must both carry it. This is a concrete, verifiable
  gap, not a preference.

- **Per-category pages + index: AFFIRM, they exist (`src/pages/ontology/category/[slug].astro`),
  keep them** — they are the legitimate "group classes by foundational category without parsing
  prose" payoff and they are pure read-side projection over the annotation graph, so they cost the
  reasoned artefact nothing. But the slugs should resolve the *gUFO* alignment (Q1): a category page
  for "Relator" should cite `gufo:Relator`, making the page itself the dereference target that earns
  ODR-0044's "ontology as web pages."

- **Per-term UFO badges: AFFIRM, but render them from the annotation graph**, after the (b) move —
  a badge is a presentation artefact; it must not be the reason a triple sits in the reasoned graph.

- **The "UFO-informed, not UFO-grounded" honesty disposition (Rule 7):** this is the *editorial
  spine* of the IA and I AFFIRM it without reservation — it is the Q4a finding I co-authored in
  session-040 ("keep the lens that sharpened the knife, ship only the knife"). Every page touching
  the upper-ontology layer must carry "UFO-informed," never "UFO-grounded with guarantees," and must
  flag UFO-C as least-mature. The single `/ontology/foundational-ontology` hub (414 lines, exists)
  is the right home for the long-form honest account; the term/category pages carry the short form.

**Cross-talk — Cagle (DA).** Cagle's legitimate fear here is that *web pages entrench* — that a
glossy per-category IA makes a droppable layer feel load-bearing. I meet it with the discipline
above: the pages are **read-side projections over the annotation graph**, generated, costless to the
wire format, and — crucially — they are where the *honesty* disclosure lives. Good IA is how you
make "optional and honestly-flagged" *legible*, which is the opposite of entrenchment-by-stealth.
The pages do not deepen the commitment; they *disclose* it. That is Guarino's "a foundational scheme
that hides its own centre of gravity has abandoned the one service it exists to render."

**Cross-talk — Guizzardi.** Where Guizzardi wants the pages to present UFO richly, I AFFIRM but bind
it to ODR-0030 Rule 7's honesty verb: present UFO as the *informing lens and design procedure*, with
the gUFO IRIs as dereference targets, and never let a page imply the wire format reasons with UFO.
The page is provenance, not a guarantee.

---

## Q4 — What else to mark up

**Verdict: REVISE. Ballot: AGAINST the "extend the same structured-markup treatment to other upper-ontology metadata" limb.**

**Allemang (Queen):** The proposition's last limb — *extend structured markup to the rest of the
upper-ontology layer* (OntoClean rigidity/identity/dependence, the gUFO `rdf:type` markers, the
Relator-founds-RoleMixin edges, UFO-L correlativity, the IAO crosswalk) — is the **scope-creep the
Working-Ontologist methodology exists to resist**: "minimum model that does the job; nothing
speculative" (*Working Ontologist* 3rd ed., Ch. 13). I REVISE to a graded answer and ballot AGAINST
the blanket "mark up everything" framing. Graded by the one test that matters — *does structured
markup let the data do work the prose cannot, at acceptable graph discipline?*:

- **OntoClean meta-properties (+R/−R, +I/−I, +D/−D): stay PROSE.** These are the *decision
  procedure's worksheet*, not the artefact. ODR-0030's whole settlement is "ship the knife, not the
  whetstone." Marking up `+R∧−I` as structured triples would materialise the design rationale into
  the shipped graph — the maximal version of the assert-more-than-you-perform error. Working
  ontologists record the *decision* (the class-vs-facet outcome, already in the artefact), not the
  meta-property derivation. PROSE, in the ODR/council record, where it already lives.

- **gUFO `rdf:type` markers (ADR-0034): already structured, already quarantined — KEEP AS-IS, do
  not extend.** These are the *one* place a gUFO IRI already does inert provenance work, correctly
  quarantined. Q1's class-axis treatment should *align with* this (same `gufo:` IRIs), but ADR-0034
  is not to be broadened beyond its 5 gated leaves.

- **Relator-founds-RoleMixin / the relational-reification primitive: stays in the MODELLING, not as
  a marked-up edge.** Session-040's co-signed finding (which I synthesised) is that this is "the
  strictly irreducible thing" — but irreducible *as a design commitment realised in the class
  structure* (`opda:Proprietorship` founding `Seller`/`Buyer`, `opda:numberOfSellers` placed on the
  Relator, `opda-agent.ttl:155`). It is **already in the artefact as topology** — the placement of
  the cardinality property *is* the marker. Adding a separate `opda:founds` annotation edge would be
  redundant structured markup of a fact the class shapes already carry. REJECT the extra markup.

- **UFO-L Hohfeldian Claim-Right↔Duty correlativity: this is the one genuine candidate for *more*,
  but as SHACL/modelling, not as an inert annotation.** ODR-0030 Rule 6 keeps the deontic core
  UFO-L-shaped and it is the standard's strongest domain-fit asset (charges, covenants, easements).
  Correlativity (a Claim-Right entails a correlative Duty) is a *constraint that should hold in the
  data* — which means if it is marked up at all it belongs in **SHACL** (validate the correlative
  pair exists), per ODR-0029's validate-don't-infer boundary and the SHACL idiom (*Working
  Ontologist* 3rd ed. treats SHACL as the home for such closure constraints). It does **not** belong
  in the `ufoCategory`-style inert annotation graph. So: not "the same structured-markup treatment"
  — a *different* treatment (SHACL), and only if a real validation need is shown. ABSTAIN-leaning-
  hold on doing it now; AGAINST doing it as an inert annotation.

- **IAO crosswalk (ODR-0030 Rule 4, adopt-now): AFFIRM as structured markup — but it is *already*
  dispositioned and is the model for how to do this right.** Thin, external, **referenced-not-
  imported** `skos:exactMatch`/`closeMatch`/`rdfs:subClassOf` edges to `obo:IAO`, *in the annotation
  graph*, on the `prov:Entity` precedent, never `owl:imports`, never reasoned over. This is the
  *correct* structured-markup pattern and Q1's gUFO references should follow the same mechanism. It
  earns markup because it has an *internal* join-target (OPDA's own document/record family) and a
  concrete consumer — the test the others fail.

So the Q4 rule: **markup must earn its place by a consumer that prose cannot serve, under
annotation-graph (inert, referenced-not-imported) discipline — or SHACL where a real constraint is
needed.** The IAO crosswalk passes; OntoClean meta-properties and the founds-edge fail (already
carried elsewhere); UFO-L correlativity is SHACL-or-nothing. Blanket "mark up the upper-ontology
layer" is rejected.

**Cross-talk — Cagle (DA).** Full agreement, and this is the question where his "don't entrench an
optional layer" is most decisive. Marking up OntoClean meta-properties or founds-edges would be
*precisely* the entrenchment of a droppable layer he warned against — building a structured
representation of the *methodology* (which is what an upper ontology is — his published "an upper
ontology is a methodology in disguise," *The Ontologist*, 2026) into the shipped artefact. The
Working-Ontologist "minimum model" rule and Cagle's "methodology-not-artefact" thesis converge
exactly here: **ship the decisions the methodology produced, not the methodology.**

**Cross-talk — Guizzardi.** I expect Guizzardi to argue the Relator-founds-RoleMixin edge and UFO-L
correlativity are the *substance* of why UFO earns its keep and so deserve first-class markup. I
agree they are the substance — that is exactly why session-040 retained UFO scoped to that spine —
but I rebut the *markup* inference: the substance is *already realised structurally* (the founds
relation is encoded in which classes bear which properties; `opda:numberOfSellers` on the
`Proprietorship` Relator is the marker). UFO-L correlativity, if it must be enforced, is a SHACL
closure constraint, not an inert `ufoCategory`-style tag — and that placement *respects* the
deontic core's importance better than a documentary annotation would, because SHACL actually checks
it. Strengthening the deontic core means SHACL, not annotation. I refine Guizzardi toward the tool
that does the job.

---

## Summary ballot

| Q | Verdict | Ballot | One-line |
|---|---|---|---|
| Q1 string vs resource | **REVISE** | **AGAINST** | gUFO IRI for the 9-term class axis (reuse, don't mint); demote/split the 35 register-deference scheme tags to string/separate predicate. No local SKOS scheme. |
| Q2 markup & placement | **REVISE** | **FOR** (placement) | `owl:AnnotationProperty`; **move every tag to `opda-annotations.ttl`** — trigger (i) is *already fired* in committed bytes; no `sh:in` (it re-fires trigger (i) into SHACL). |
| Q3 web pages / IA | **AFFIRM** | **FOR** | Keep `/pdtf/ufoCategory` + category pages as read-side projections; ship the **missing** Rule-7(b) DOLCE disclosure in the `scopeNote`; "UFO-informed," never "UFO-grounded." |
| Q4 what else to mark up | **REVISE** | **AGAINST** (blanket) | Only the IAO crosswalk earns markup (internal join-target, referenced-not-imported). OntoClean/founds-edge stay prose/topology; UFO-L correlativity is SHACL-or-nothing. |

**The single sentence I will carry to synthesis:** the proposition is *right that the value should
often be a resource and right about web pages*, but *wrong that the resource should be a locally-
minted SKOS scheme* (reuse gUFO) and *wrong to keep it where it sits* — the load-bearing finding of
session 041 is that **the `ufoCategory` triples are in the reasoned graph today, which fires
ODR-0030's re-open trigger (i) in the committed corpus, and the fix is to move them to
`opda-annotations.ttl` and ship the DOLCE disclosure that Rule 7(b) still owes.** Enrich by
*reference and disclosure*, not by *minting and entrenchment*.
