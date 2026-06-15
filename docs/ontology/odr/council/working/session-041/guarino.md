# Session 041 — Nicola Guarino (ISTC-CNR; OntoClean, DOLCE)

My lens is the formal-ontology one: a category earns its standing from **meta-properties** —
rigidity (±R), identity (±I), unity (±U), and existential dependence (±D) — and the OntoClean
methodology is precisely the discipline of *tagging those meta-properties onto types* and reading
off the admissible subsumption lattice (Guarino & Welty, "An Overview of OntoClean," in *Handbook
on Ontologies*, 2nd ed., Springer 2009, §3 "The Formal Tools"). I judge each question by one
test: **does the proposed markup keep the meta-level meta-level, and does it represent identity-
bearing things as things and label-like things as labels?**

---

## Q1 — String literal vs resource (IRI)

**Guarino:** A UFO/OntoClean category is not a string; it is a **type qualified by meta-
properties**, and a type is a thing with an identity criterion of its own (the criterion by which
*we* tell one category from another is exactly its meta-property signature: `gufo:Kind` is the +O
rigid sortal that *supplies* identity, `gufo:RoleMixin` is the −R, +D, externally-founded
dispersive type, and so on — Guarino & Welty 2009, §4, the OntoClean "backbone taxonomy" of
Type/Quasi-Type/Role/Phase/Category built *entirely* from the meta-property assignments). A
`xsd:string` "Substance Kind" cannot carry the one thing that constitutes the category — its meta-
property profile — and cannot be told apart from a typo by anything but a human reader. So on the
question *as a question of formal ontology*, the value of `opda:ufoCategory` denotes an entity with
identity, and the faithful representation of an entity-with-identity is an **IRI**, not a literal.
I therefore land on the resource side — but with a precise restriction that is the whole of my
vote, and that I will state under Q2: the IRI is a **SKOS concept in a governed scheme, with a
`skos:exactMatch` to the gUFO IRI** (`opda:SubstanceKindCategory skos:exactMatch gufo:Kind`), *not*
a direct `gufo:Kind` reference and *not* a class-level `rdf:type`. Two reasons, both load-bearing.
First, **these categories are meta-level**, and meta-level categories must never be reasoned into
the object level — Guarino's "ontological level" argument (Guarino, "The Ontological Level," in
*Philosophy and the Cognitive Sciences*, 1994) is exactly that the apparatus we use to *judge* a
domain taxonomy sits above it and must not be conflated with it. A direct `opda:Property rdf:type
gufo:Kind` in a reasoned graph collapses that level distinction and, under any closure that
imported gUFO's axioms, would let the meta-category drive object-level inference — the precise harm
Cagle's re-open trigger (i) names. A SKOS concept that the term merely *points at* keeps the
category one indirection above the object level, which is where it belongs. Second — and this is
the point Cagle's rebuttal forces me to state precisely — the SKOS concept is the only carrier of
the **`skos:exactMatch`/`closeMatch` to the gUFO IRI** (`opda:SubstanceKindCategory skos:exactMatch
gufo:Kind`) and of a dereferenceable `skos:definition` of *the category as a UFO/gUFO construct*
(its gUFO alignment, and for the quality categories its DOLCE lineage). That alignment payload is
**irreducible content that no string-plus-OntoClean-facet reconstructs** — the gUFO mapping is not a
fact about any OPDA type's meta-property vector; it is a fact about *the category*, asserted once on
the category node and shared by every type filed under it. (I am explicit, post-Cagle: the concept's
definition does **not** restate the per-type ±R/±I cell — that lives on the type, Q4. The concept
carries the *category↔gUFO mapping*, the type carries its *own analysed signature*: two facts, no
double-storage.)

I am **with Guizzardi** that the categories are UFO things deserving gUFO-resource identity, and I
refine his position on one point: do not bind the OPDA term to `gufo:Kind` *directly*. gUFO's IRIs
carry gUFO's OWL axioms; a direct binding in a reasoned graph re-imports the modal/mereological
commitments the gUFO authors themselves (Almeida, Guizzardi, Sales & Fonseca, 2026) showed are not
faithfully expressible in OWL 2 DL — exactly what ODR-0030 Rule 3 forbids. The SKOS-concept-with-
`exactMatch` is the indirection that gets gUFO alignment *and* respects the level boundary.

I must **engage Cagle's rebuttal head-on**, because it is the one genuinely sharp argument against
my Q1 and he is *partly right*. He says: the category's identity criterion *is* its OntoClean
signature (Substance Kind = the ±R/+I cell), I have just persuaded him to mark that signature up
separately at Q4, so the string "Substance Kind" *plus its row in the OntoClean facet* is already
the full referent — minting `opda:SubstanceKindCategory` to hold an identity criterion that lives in
the meta-property tags is the same fact stored twice, at a cost of nine maintained IRIs. **I concede
the half of this that is correct and it improves my position:** if the SKOS concept's definition
*restated the ±R/+I cell*, that would indeed be double-storage, and my original phrasing ("a
`skos:definition` stating its OntoClean meta-property signature") invited exactly that error. I have
corrected it above — the concept must NOT carry the meta-property cell. **But the redundancy
argument fails on the residue, and the residue is the whole point:** a UFO category is **not**
reducible to a meta-property cell. Two reasons. (1) *Many-to-one, not identity:* the category is a
**shared node** that ~40 OPDA types point at; "Substance Kind," "Information Object," "Relator" are
not per-type property-bundles, they are classifiers with their own identity, and the meta-property
*profile of a type* is a different fact from the *named category a type is filed under* (the
classification is an editorial act, defeasibly revisable, not a function of the tags). (2)
*Irreducible alignment content:* the category node carries `skos:exactMatch gufo:Kind` and the DOLCE
lineage — content that is a fact about *the category*, not about any type's signature, and that
**no string-plus-facet reconstructs**. Cagle's own session-040 Q1 vote *kept* gUFO alignment as
worth having; the SKOS concept is simply *where that alignment attaches*. So: a typo-prone,
mapping-less, definition-less literal is not the minimal honest representation of a category — it is
an *impoverished* one that has discarded the category's gUFO alignment and dereferenceability.
Inertness is achieved by quarantine (Q2), not by degrading the referent to a string. **I hold
REVISE-resource — but I record honestly that this is the council's one live split, and a narrow
one:** Cagle and I agree on governance, `sh:in`, quarantine, and that the per-type OntoClean markup
is the real prize; we differ only on whether the *category itself* deserves a dereferenceable,
gUFO-aligned node or stays a governed string. I say node, because the `exactMatch` is irreducible;
I grant it is a close call and the cheapest honest *fallback*, if the council prefers, is
Cagle's governed `xsd:string` + `sh:in` with the gUFO `exactMatch` relocated onto a *separate*
small "UFO category" SKOS scheme keyed by the string value — which is my position by another route
(the concept still exists; only the *predicate's range* differs). The substance I will not yield is
that the gUFO alignment must live *somewhere as a resource*; whether `ufoCategory` points at it
directly or via a coded string is the negotiable part.

**The hard floor — Cagle's one non-negotiable, which I adopt and ground.** Wherever the alignment
resource lives, its `skos:exactMatch gufo:Kind` edges sit in `opda-annotations.ttl`, behind the
sixth gate, **referenced-not-imported on the `prov:Entity`/IAO precedent (ODR-0030 Rules 4–5) —
never reasoned over.** The reason is regime-specific and decisive: `gufo:Kind` carries real
`rdfs:subClassOf` axioms, and the ODR-0029 RDFS-Plus regime *does* close over `rdfs:subClassOf`
(brief fact 5 — "only `rdfs:subClassOf` type-propagation fires"; that is the *one* thing it
propagates). So an `exactMatch`-to-gUFO edge reaching a reasoned graph, with gUFO resolved, would
drag gUFO's subclass chain into the closure — the exact Q2 "No," and a *live* entailment risk under
the active regime, not the merely-physical one that the inert string property poses. This is why the
indirection is a hard requirement, not hygiene: string-vs-IRI on `ufoCategory` is negotiable, but
the alignment edge reaching the reasoner is not. (It is the same `prov:Entity` referenced-not-
imported mechanism the council already adopted for IAO/BFO at ODR-0030 Rules 4–5, applied one layer
down to the gUFO mapping.)

**Verdict: REVISE.** The exact representation: `opda:ufoCategory` takes a **SKOS concept** (e.g.
`opda:SubstanceKindCategory`) in a governed `opda:UFOCategoryScheme`, each concept bearing a
`skos:exactMatch`/`closeMatch` to the corresponding gUFO IRI and a `skos:definition` of *the category
as a UFO/gUFO construct* (explicitly **not** the per-type ±R/±I cell, which lives on the type per Q4)
— **never** a direct `gufo:` reference, **never** an object-level `rdf:type`, and the `exactMatch`
edges **annotation-graph-only, referenced-not-imported, never reasoned over** (the hard floor: gUFO's
`rdfs:subClassOf` axioms must not reach the RDFS-Plus closure). Fallback if the council prefers
Cagle's string: governed `xsd:string` + `sh:in`, with the gUFO `exactMatch` carried on a separate
keyed SKOS scheme under the same quarantine (same alignment content, different predicate range).
**Ballot: FOR** (resource-valued preferred; the two non-negotiables are gUFO-alignment-*as-resource*
and gUFO-alignment-*never-reasoned*).

---

## Q2 — Markup & graph placement

**Guarino:** This is where my discipline makes its sharpest demand, and it cuts *against* the
status quo. (a) **Predicate typing:** if the value is a resource, the predicate is necessarily an
`owl:ObjectProperty` by construction — but it must *also* be flagged as non-axiomatic. The cleanest
expression is `owl:AnnotationProperty` semantics over a resource value: an annotation property
*may* take an IRI object and, crucially, is **invisible to OWL 2 DL reasoning** (W3C OWL 2 Structural
Specification, §5.5 "Annotation Properties" — annotation assertions "have no effect on the logical
meaning of an ontology"). That is the formal guarantee that the meta-category cannot leak into the
object level. So: **AnnotationProperty, resource-valued.** This is strictly better than the current
`owl:DatatypeProperty + rdfs:range xsd:string`, which is honest about inertness only by accident of
the ODR-0029 shallow regime; an AnnotationProperty is inert *by its own definition*, under any
regime, which is what Knublauch's standing condition (session-040) actually needs.

(b) **Graph placement — and here I must be blunt about a finding.** The brief's established fact 3
and my own check of the corpus agree: the declaration *and* every `ufoCategory` tag are asserted in
`opda-classes.ttl` and the per-module class files — **the reasoned graph** — and
`opda-annotations.ttl` carries **zero** `ufoCategory` triples. ODR-0030 Rule 1 says in terms that
these tags "remain **annotation-graph-only** … the ODR-0029 quarantine is load-bearing — retention
lapses if it is breached." The current placement **does not honour that rule.** The tags are not in
the annotation graph; they are physically in the graph that the ODR-0029 regime reasons over (even
if, today, that regime propagates nothing from a domain-less string property). Cagle's re-open
trigger (i) is phrased as "moved *out of* the annotation-graph quarantine into a graph that drives
inference" — but my reading of the facts is that they were **never in the quarantine to begin with**;
Phase 5c emitted them straight into the class graph. This is the live defect of session 041, and it
is the formal-ontology heart of the matter: a meta-level annotation sitting in the object-level
graph is a category error in the literal sense — the level boundary that the whole OntoClean
apparatus rests on is, right now, not drawn in the artefact. **The declaration and all per-term
tags must move to `opda-annotations.ttl`.** That move, plus the AnnotationProperty typing, is the
thing that converts ODR-0030's *promise* of quarantine into an *enforced* quarantine and satisfies
Knublauch's condition for real rather than on paper.

(c) **Governed scheme + SHACL `sh:in`:** yes to the scheme (the value space of nine endurant/
perdurant categories is closed and authority-owned — it is UFO's, not OPDA's to extend ad hoc). On
the SHACL shape I am **deliberately restrictive**: a `sh:in` shape constraining `ufoCategory` to the
nine concepts is acceptable *only as a closed-vocabulary editorial guard* (typo-safety on the tag
value), and it **must validate the tag, never the tagged subject's object-level structure**. The
moment a SHACL shape keyed on `ufoCategory` drives a constraint on the *instance data* of a tagged
class, the meta-category has become reasoned-over in the SHACL sense — Cagle's trigger (i) fires.
So: `sh:in` permitted on the annotation predicate's own value, in the SHACL graph, as a vocabulary
gate; forbidden as a lever on object-level conformance. This is consistent with ODR-0027 R5's
value-keyed-but-meta-free enforcement and with the three-graph separation of ODR-0004 §3a.

(d) **The quarantine needs CI teeth it does not have — Cagle's finding, which I verified and now
back without reservation.** Cagle reports, and I read `tools/opda-gen/src/opda_gen/ci/three_graph_test.py`
to confirm: the gate has exactly five checks — no `sh:*` in annotations (#1), no `owl:imports` in
shapes (#2), no whitelisted advisory predicate (`aiHint`/`uiHint`/`exampleValue`) in shapes (#3),
every `sh:targetClass` resolves (#4), derived-profile provenance (#5). **Not one check forbids an
advisory/inert predicate sitting IN the classes graph.** The gate polices what enters the *shapes*
and *annotations* graphs but is silent on advisory predicates leaking into the *reasoned classes*
graph — so the ~87 `ufoCategory` triples and the `owl:DatatypeProperty` declaration ship **green**
despite breaching ODR-0030 Rule 1, and Knublauch's standing condition is *asserted but unguarded*.
This is decisive for my Q2: relocating the tags to `opda-annotations.ttl` is necessary but **not
sufficient** — an asserted quarantine a CI gate cannot see is the exact gap that produced this
breach, and nothing stops the next emitter pass (or my own proposed OntoClean tags) re-introducing
it. So the amendment must carry a **sixth ASK gate**: `ASK { GRAPH opda:classes { ?s opda:ufoCategory
?o } } → FALSE` (generalised to the advisory-predicate family — `ufoCategory`, the OntoClean
meta-properties I propose at Q4, and any future inert tag: no advisory predicate in the reasoned
classes graph). My OntoClean meta-property tags (Q4) must be born **behind that gate** — they must
never ship into the classes graph the way `ufoCategory` did. Backing this is the single most
load-bearing thing I can do for Knublauch's condition: it converts ODR-0030 Rule 1 and trigger (i)
from prose into something the build *enforces*.

I **agree with Knublauch's session-040 standing condition** and sharpen it: he conditioned the
AFFIRM on the quarantine "remaining CI-enforced," and the honest finding is that for `ufoCategory`
the quarantine is not yet *established*, so the enrichment proposal's first duty is to establish it
(move to the annotation graph) before it does anything else. I **agree with Cagle** that nothing
about this layer should drive inference — and I give him the *mechanism* that guarantees it
(AnnotationProperty, annotation graph) rather than relying on the contingent shallowness of the
current regime, which is a weaker guarantee than he is owed.

**Verdict: REVISE.** (a) Re-type `opda:ufoCategory` as `owl:AnnotationProperty` (resource-valued).
(b) **Move the declaration and every per-term tag from the class/reasoned graphs into
`opda-annotations.ttl`** — mandatory; corrects a current breach of ODR-0030 Rule 1. (c) Governed
`opda:UFOCategoryScheme`; a `sh:in` editorial guard on the predicate's *own value* in the SHACL
graph only, never as a constraint on tagged instances. (d) **Add a sixth three-graph CI gate** —
`ASK { GRAPH opda:classes { ?s opda:ufoCategory ?o } } → FALSE`, generalised to the advisory-predicate
family — because (verified) the current five-check gate does not police advisory predicates in the
reasoned classes graph, so the breach ships green and the quarantine is unenforced (Cagle's finding).
**Ballot: FOR** (as amended; (a)–(d) are preconditions, not embellishments — and (d) is what makes
the quarantine real rather than asserted).

---

## Q3 — Web pages / documentation IA

**Guarino:** Presentation is where the honesty disposition (ODR-0030 Rule 7) and the level
distinction must be made *visible*, not merely true in the graph. Three things from my lens. First,
a **dereferenceable `/pdtf/ufoCategory` term page** and **per-category pages** are warranted —
because a category *is* an identity-bearing entity (Q1), and an entity with identity deserves a URI
that resolves to its definition; the per-category page is simply the human face of the
`skos:definition` that carries the meta-property signature. The page for "Substance Kind" should
state its OntoClean profile in plain words — *+R rigid sortal, supplies its own identity criterion*
— because that profile is *what the category is*, and a reader who sees only the label "Substance
Kind" has been shown the name of the tool and not the tool. Second, **per-term UFO badges** are good
provided the badge links *up* to the category page and never reads as an object-level type claim;
the badge says "this term was *classified under* Substance Kind by OPDA's design process," not "this
term *is* a gufo:Kind in the reasoned model" — the verb discipline of ODR-0030 Rule 7a ("UFO-
informed," not "UFO-grounded") applies word-for-word at the badge level. Third, and this is my
non-negotiable carried forward from session-040: the page **must disclose the DOLCE provenance of
the quality categories** — and I will say plainly under Rule 7b what that provenance is. The
`/ontology/foundational-ontology` hub already exists and is the right home for the layered honesty
narrative; the per-category pages are the right home for the per-category meta-property definitions;
they should cross-link.

On **Rule 7b honestly** (the brief asks me directly): the quality apparatus OPDA tags —
`opda:AssuranceLevel` as "Quality," `opda:MonetaryAmount`/`opda:RoomDimension` as "Quality Value,"
and the 35 "Quale-in-Region" scheme tags — descends from **DOLCE's Quality / Quale / Region tripartite
structure** (Masolo, Borgo, Gangemi, Guarino & Oltramari, *WonderWeb Deliverable D18 — Ontology
Library (final)*, ISTC-CNR 2003, §4 "Qualities and Quality Spaces": a Quality inheres in an
endurant/perdurant, its Quale is the position the quality has in a Quality Region/Space at a time).
UFO inherits this almost wholesale — Guizzardi 2005 acknowledges the DOLCE quality-space lineage —
so the OPDA "Quality Value" tag is, genealogically, a DOLCE Quale-in-Region, and the page must say
so. I co-authored D18; I will not let the page present a DOLCE construct as a pure-UFO invention.
The honest framing is *"UFO's quality categories, which UFO inherits from DOLCE's Quality/Quale/
Region (WonderWeb D18, 2003)"* — a lineage, not a foreign graft (this is the exact formulation I
swung on in session-040 and it must reach the artefact, not stay in an ODR).

**Verdict: REVISE.** A dereferenceable `/pdtf/ufoCategory` term page + per-category pages stating
each category's OntoClean meta-property signature, linked from the existing `/ontology/foundational-
ontology` hub; per-term badges that link *up* and read as "classified-under," never "is-a"; and a
machine-and-human disclosure of the DOLCE Quality/Quale/Region lineage of the quality categories
(D18, 2003) on both the category pages and the hub. **Ballot: FOR** (as amended).

---

## Q4 — What else to mark up (the decisive question for my lens)

**Guarino:** I am asked to be the decisive voice here, so I will be exact. The proposition is that
OntoClean meta-properties (±R, ±I, ±D, ±U) deserve **structured markup** — annotation triples per
type — rather than prose. My answer is **yes, and this is the single most valuable enrichment on the
table — *more* valuable than the `ufoCategory` re-representation itself** — because these meta-
properties *are* the OntoClean methodology, and ODR-0027/ODR-0030 already declare them the load-
bearing discipline that decides subclass-vs-facet. Here is the formal argument. OntoClean is
*defined* as the assignment of a meta-property vector to each type and the enforcement of
constraints over subsumption (Guarino & Welty 2009, §3: "we tag the properties of a taxonomy with
meta-properties … and check the taxonomy against constraints" — e.g. **an anti-rigid type cannot
subsume a rigid type** (−R ⊉ +R), **a type cannot subsume another with a different identity
criterion**). OPDA *runs* this methodology — session-040 verified three byte-moving cases
(`tenureKind` +R∧−I → coded facet; `VouchEvidence` +D → Relator; `RiskAssessment` +I → retained as
class). But the corpus records the meta-property *that produced each decision* **nowhere as
structured data** — I checked: rigidity/identity/dependence appear only inside `sh:message` strings
and `skos:definition` prose (`opda-descriptive-shapes.ttl`, `opda-vocabularies.ttl`). The decisions
are in the graph; the *reasons* — the meta-property tags that are the actual content of OntoClean —
are unrecoverable except by reading English. That is the asymmetry I want corrected: OPDA ships the
*output* of OntoClean and hides the *input*.

Structured markup would be a small, closed vocabulary of annotation properties — `opda:ontoCleanRigidity`
∈ {rigid, anti-rigid, semi-rigid, non-rigid}, `opda:ontoCleanIdentity` ∈ {supplies-IC (+O), carries-IC
(+I), no-own-IC (−I)}, `opda:ontoCleanDependence` ∈ {+D, −D}, `opda:ontoCleanUnity` ∈ {+U, −U, anti-
unity} — each value a SKOS concept with a definition lifted from Guarino & Welty 2009 §3, asserted
**per type** in the annotation graph. The payoff is exactly what a methodology-as-data buys: the
subclass-vs-facet decisions become **auditable and re-derivable** (a query can find every type tagged
−R that is nonetheless `rdfs:subClassOf` something — an OntoClean violation — which is the canonical
OntoClean check, and which *no current OPDA artefact can run*); the meta-property profile that the
Q1 `skos:definition` attaches to each `ufoCategory` concept gets a *per-type* counterpart, so "this
class is a Substance Kind" and "this class is +R, +O" are linked and mutually checkable; and a future
maintainer inherits the *reasoning*, not just the verdict.

**But — and this is the load-bearing condition, stated as forcefully as I can — every word of this
lives under the same annotation-graph quarantine, and for a deeper reason than convenience.**
OntoClean meta-properties are **meta-meta-level**: they are properties *of properties/types*, the
apparatus by which we judge the taxonomy. They are the *paradigm* case of something that must never
be reasoned into the object level — if `opda:ontoCleanRigidity rigid` ever drove an OWL inference or
a SHACL constraint on instance data, OPDA would be reasoning *with its own judgement criteria as if
they were domain facts*, which is the exact level-collapse my "ontological level" argument (Guarino
1994) was written to prevent, and which fires Cagle's trigger (i) the instant it happens. So these
tags are `owl:AnnotationProperty`, resource-valued, **annotation-graph-only**, never a
`sh:targetClass` or `sh:path` lever on instance conformance. They may be *queried* by tooling and
*displayed* on the term pages (the OntoClean profile belongs next to the UFO badge on every term
page — it is the same level of metadata); they may **never** be entailed over. Under that
discipline, marking them up is pure gain: it turns OPDA's load-bearing-but-invisible methodology
into a first-class, auditable, honestly-quarantined record.

On the **other candidates**, briefly, from the same test (resource iff identity-bearing-thing;
markup iff a downstream consumer can *act* on it; quarantine always for the meta-level):
- **gUFO `rdf:type` markers (ADR-0034):** keep; they are *object-level* type assertions (`x rdf:type
  gufo:Quality`) and therefore the structurally most dangerous item *in principle* — but the audit
  is done and they are **clean**. I flagged that `gufo:` appears in both `opda-descriptive-
  annotations.ttl` and the reasoned module `opda-descriptive.ttl`; Guizzardi ran it down at my
  request and corrected me on the record — the sole `opda-descriptive.ttl` occurrence (line 65) is
  inside a `skos:scopeNote` **string literal** ("…gUFO: `gufo:Object`…"), i.e. prose, not a triple;
  no `gufo:` IRI is a subject/predicate/object there. The five real `rdf:type gufo:Quality` triples
  all sit correctly in `opda-descriptive-annotations.ttl` (lines 31–47). So **the gUFO typing pass
  is in compliance and Knublauch's tripwire is NOT tripped by `gufo:`.** I withdraw the "most urgent"
  framing: the audit I called for has been run and passed. The *one* live placement breach in this
  session is not gUFO — it is the `ufoCategory` predicate (Q2), whose ~86 tags sit in the reasoned-
  union class files with zero in the annotation graph. Two quarantines, two different states: gUFO
  clean, `ufoCategory` in breach. (Credit Guizzardi for disentangling them.)
- **Relator-founds-RoleMixin edges (ODR-0030 "the strictly irreducible thing"):** this **earns
  structured markup**, and it is the one place I'd let the markup be slightly richer than a tag —
  because session-040's own central finding is that the Relator-founds-Role *mediation* is exactly
  what OntoClean's **monadic** meta-properties cannot express (the `numberOfSellers`-on-the-
  `Proprietorship` placement argument). A `opda:founds`/`opda:foundedBy` annotation edge (Relator →
  RoleMixin) records the one relational fact the meta-property vector structurally cannot — so it is
  *complementary* to the OntoClean tags, not redundant. Annotation graph; advisory; an
  `owl:AnnotationProperty` over a resource. (Whether it is *also* needed object-level as a real
  `roleOf`/`playedBy` relation is an ODR-0006/0027 question already settled there; the *annotation*
  edge I propose is the design-provenance record of the founding, distinct from the operative
  relation.)
- **UFO-L Hohfeldian Claim-Right↔Duty correlativity:** **prose for now, with a reserved markup
  slot.** Correlativity (Claim-Right ⟺ Duty, Power ⟺ Liability) is a genuine *axiom* — it asserts a
  biconditional — and the moment you mark it up as a real property pair you are tempted to *reason*
  with it (if x has a claim-right then someone has the correlative duty), which is object-level
  inference UFO cannot soundly discharge in OWL 2 DL (the gUFO-authors warrant again). It is the
  deontic core (ODR-0030 Rule 6, uncontested as UFO-L-shaped), and it deserves first-class
  *modelling* — but as SHACL-validated relations in the object layer if and when the conveyancing
  use-cases demand it, **not** as an annotation-layer correlativity axiom. Keep it prose at the
  meta-layer; let the object layer carry the operative `opda:` relations under SHACL. Do not put
  Hohfeldian biconditionals in the annotation graph dressed as inert tags — that misrepresents an
  axiom as provenance.
- **IAO crosswalk (ODR-0030 Rule 4, adopt-now):** **structured markup, yes** — but it is a different
  animal from everything above and I want the distinction on the record. `skos:exactMatch`/
  `closeMatch`/`rdfs:subClassOf` edges to `obo:IAO` are *alignment* assertions about OPDA's own
  document/record family (an internal join-target), on the `prov:Entity` referenced-not-imported
  precedent. These are not meta-level judgement tags; they are object-level-*ish* mapping edges that
  happen to be quarantined for the *separate* reason of not importing IAO's axioms. Mark them up per
  Rule 4, annotation graph, never `owl:imports`. They do not interact with the OntoClean/UFO meta-
  layer at all and should not be conflated with it.

So the Q4 hierarchy from my lens: **(1) OntoClean meta-property tags — mark up, highest value,
strict quarantine** [the decisive answer]; **(2) Relator-founds-Role edges — mark up, complementary
to (1)**; **(3) IAO crosswalk — mark up per Rule 4, separate rationale**; **(4) gUFO type markers —
keep; audit complete, the pass is clean (the lone reasoned-graph `gufo:` is a scopeNote string, per
Guizzardi)**; **(5) UFO-L correlativity — prose at the meta-layer, object-level SHACL relations when
use-cases demand, never an annotation-layer axiom.**

I am **with Guizzardi** that the meta-layer (categories, founding edges) deserves gUFO-resource
identity and structured form — and I extend it to the OntoClean meta-properties he and I both treat
as the methodology's content. I **rebut Cagle on the central point**: he will say structured
OntoClean tags *entrench* a layer session-040 called "optional, droppable." My answer is that he has
the dependency backwards. The meta-property tags are not the UFO *vocabulary* he holds droppable —
they are **OntoClean**, which Cagle himself argued in session-040 is *separable from and predates
UFO* ("retain OntoClean-as-plain-judgement … retire the UFO vocabulary"). Marking up the OntoClean
meta-properties therefore *advances his own held position*: it makes the OntoClean judgement
explicit and auditable **independent of the UFO category vocabulary**, so that if his re-open
triggers ever fire and the UFO *vocabulary* is retired, the OntoClean reasoning that did the actual
byte-moving work survives as structured data rather than evaporating into retired prose. Structured
OntoClean markup is the **separability insurance** for the very dissent he holds live. And I
**agree with Cagle** absolutely on the discipline: nothing here is reasoned over, ever — but I reach
inertness by the *formal* mechanism (AnnotationProperty + meta-level quarantine grounded in the
level distinction), which is a stronger guarantee than the status quo's accidental shallowness.
**Cagle has conceded this in cross-talk** — he withdraws his entrenchment objection conditional on
two terms I accept in full: (a) `owl:AnnotationProperty` in `opda-annotations.ttl`, reasoned-over
nowhere, behind the sixth CI gate (Q2(d)); (b) the meta-property *values* are a closed `sh:in` set
(`"+R" "-R" "+I" "-I" "+D" "-D" "+U" "-U"`), not free strings. On those terms he calls the markup
"the opposite of entrenchment — it makes my Option-D exit *cheaper*," which is precisely the
separability-insurance point. The convergence is real: the canonical OntoClean check he wrote out —
`SELECT ?sub ?super WHERE { ?sub rdfs:subClassOf ?super . ?super opda:rigidity "-R" . ?sub
opda:rigidity "+R" }` (anti-rigid subsuming rigid, the one constraint OntoClean exists to catch) —
is a query the markup *enables and no current OPDA artefact can run*. That is the difference between
data and documentation, and it is the whole case.

**Verdict: REVISE.** Mark up the OntoClean meta-properties (±R/±I/±D/±U) as a small SKOS-backed
`owl:AnnotationProperty` vocabulary, **per type, annotation-graph-only, never entailed/SHACL-keyed
on instances** — the highest-value enrichment, and the separability insurance for Cagle's held
dissent; add complementary `opda:founds`/`foundedBy` annotation edges for the Relator-founds-Role
provenance; mark up the IAO crosswalk per ODR-0030 Rule 4 (separate rationale); keep gUFO markers
(audit complete — the `opda-descriptive.ttl` `gufo:` is a `scopeNote` string literal, not a triple;
the typing pass is compliant, per Guizzardi); keep UFO-L correlativity as prose at the meta-layer
with object-level SHACL relations reserved for the use-cases, never an annotation-layer axiom.
**Ballot: FOR** (resource-and-structured for the meta-level, as amended; under unconditional
annotation-graph quarantine).

---

### Ballot summary

| Q | Verdict | Ballot |
|---|---|---|
| Q1 string vs resource | **REVISE → SETTLED with Cagle** — SKOS concept carrying `skos:exactMatch`→gUFO + a definition of the *category* (NOT the per-type ±R/±I cell — that's Q4), never direct `gufo:`/`rdf:type`. Two non-negotiables: gUFO-alignment-**as-resource** AND gUFO-alignment-**never-reasoned** (the `exactMatch` edges are annotation-graph-only, referenced-not-imported — gUFO's `rdfs:subClassOf` must not reach the RDFS-Plus closure). Predicate range (string-vs-IRI) is the only residue; Cagle's fallback (governed string + `sh:in` + `exactMatch` on a separate keyed scheme) is the same position by another route | **FOR** |
| Q2 markup & graph placement | **REVISE** — `owl:AnnotationProperty`; **move decl+tags into `opda-annotations.ttl`** (corrects current Rule-1 breach); `sh:in` editorial guard on the predicate's own value only; **+ a sixth CI gate** `ASK{GRAPH opda:classes{?s opda:ufoCategory ?o}}→FALSE` (verified: the 5-check gate doesn't police advisory predicates in the classes graph, so the breach ships green — Cagle) | **FOR** |
| Q3 web pages / IA | **REVISE** — `/pdtf/ufoCategory` term page + per-category pages stating OntoClean signatures; "classified-under" badges; disclose DOLCE Quality/Quale/Region lineage (D18, 2003) | **FOR** |
| Q4 what else to mark up | **REVISE** — OntoClean ±R/±I/±D/±U tags (highest value; separability insurance — **Cagle conceded**, conditional on AnnotationProperty + `sh:in` values, both accepted), `founds` edges, IAO crosswalk; gUFO audit clean; UFO-L stays prose — all under strict meta-level quarantine behind the sixth gate | **FOR** |

**The one sentence I want in the synthesis:** OPDA ships the *verdicts* of its OntoClean
methodology and hides the *meta-properties* that produced them; mark those meta-properties up as
inert, annotation-graph-quarantined, gUFO-aligned resources — that, not the `ufoCategory` re-
labelling, is where the enrichment earns its keep, and it is the insurance that keeps the OntoClean
judgement auditable even in the world where Cagle's triggers fire and the UFO vocabulary is retired.

**Standing condition (inherited from session-040, restated and now given teeth):** every disposition
above is void if any meta-level tag — `ufoCategory`, OntoClean meta-property, `founds` edge, gUFO
marker — is ever placed in a graph that drives OWL inference or SHACL instance-validation. The level
boundary (Guarino 1994) is not negotiable; inertness must be guaranteed by **three** mechanisms
together, not the contingent shallowness of the current entailment regime: (1) `owl:AnnotationProperty`
typing (inert by OWL 2 §5.5), (2) the `opda-annotations.ttl` home, and (3) **the sixth CI gate that
makes (2) enforceable** — without (3), as the corpus proves today, the quarantine is asserted but
unguarded and the breach ships green. The single most important implementation note for the Queen:
the `ufoCategory` placement breach is real *now*, in the committed corpus, and is invisible to CI —
so "establish the quarantine" means *relocate **and** gate*, atomically, and the same gate must
cover the new OntoClean tags from birth.
