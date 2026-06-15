# Session 042 (Reduced) — Tom Baker (DCMI), Devil's Advocate

**Voice:** Tom Baker (Dublin Core Metadata Initiative; co-author, *SKOS Reference*, W3C Rec 2009;
co-author, *DCMI Abstract Model*, W3C Note 2007; co-author, "Key Choices in the Design of SKOS,"
*J. Web Semantics* 20, 2013).
**Role:** Devil's Advocate. I am here to attack the proposition, not to ratify it. My session-041
AGAINST stands and I have read nothing in the FOR case that retires it.

**My canonical test, stated once.** A metadatum earns structured form when it is **a property of the
described resource** that a *named consumer* will read as data — and it stays prose when it is **the
cataloguer's reasoning about why the resource is described as it is** (DCMI Abstract Model 2007,
§§"Resources and their descriptions" / "Value strings"; the Dublin Core *one-to-one* principle —
describe one resource per description, not the describer's analytic act; the *dumb-down* principle —
a qualified value must degrade gracefully to something a generic consumer can still use). The four
questions are that test applied to a single body of content: the ±R/±I/±D/±U meta-property vectors.
My answer to all four flows from one finding I verified in the committed corpus and will repeat
because it is load-bearing: **the signature OPDA proposes to mint is already shipped — as prose, on
the resource that needs it.** ODR-0031 already landed `opda:UFOCategoryScheme` in
`opda-annotations.ttl`, and every category concept's `skos:definition` already carries its OntoClean
cell: `opda:RelatorCategory` → *"(OntoClean +R, +I, +D)"*; `opda:SubstanceKindCategory` →
*"(OntoClean +R, +O)"*; `opda:RoleCategory` / `opda:RoleMixinCategory` → *"(OntoClean −R, +D)"*
(`opda-annotations.ttl:85,94,103,112`). The signature is not missing. It is in the artefact, in the
one place a human reading the category encounters it, in the words Guarino & Welty themselves use.

---

## Q1 — Mark up at all, or keep prose?

**Baker (DA):** **Verdict: REJECT (keep prose). Ballot: AGAINST.**

The proposition says the corpus "records only the verdicts, never the meta-properties that produced
them." That is the BRIEF's framing and it is now **factually wrong about the bytes**. Established
Fact 4 concedes the half that sinks the whole case: `opda:UFOCategoryScheme` *already exists* and each
concept *already bears its OntoClean signature as `skos:definition` prose*. I checked the shipped file
rather than the BRIEF's summary — `RelatorCategory` literally reads "(OntoClean +R, +I, +D)". So the
question is not "prose vs nothing." It is "prose-that-ships vs prose-that-ships *plus* a parallel
structured copy of the same nine signatures, per-type, forever maintained." That is not enrichment.
It is **redundant materialisation of one fact into two registers** — and the DCMI *one-to-one*
principle exists precisely to forbid it: describe the resource once, in one place, in the form a
consumer can use.

The deeper objection is the one I filed in 041 and the FOR case has not touched: marking up ±R/±I/±D/±U
per type **materialises a process-internal analytic judgement as if it were a fact about the term** —
*"minting them would assert the artefact carries a judgement only the process made — the one place
enrichment would lie"* (my session-041 Q4, verbatim). ODR-0030's own settled verb is that *"the
modelling process is governed by a UFO/OntoClean decision procedure; the artefact carries an inert
provenance record of that governance."* A meta-property vector is not provenance. Provenance is *who
classified this, when, citing what* (the IAO crosswalk and the `dct:source` edges already do that).
The vector is the *worksheet of the reasoning* — the cataloguer's analysis of why the verdict came
out as it did. The Dublin Core tradition draws this line in ink: a description asserts properties of
the resource; it does not encode the cataloguer's deliberation. "This class is +R, +O" is not a
property of the conveyancing concept the way `skos:prefLabel` or `dct:source` is — it is a sentence
about *OPDA's decision procedure*. Put it in the graph as a typed datum and you have crossed from
*describing the resource* to *publishing the describer's reasoning as resource metadata*. That is the
one move metadata methodology names as a category error.

**Cross-talk — rebutting Guarino (by name).** Nicola's Q1/Q4 case rests on two pillars and I deny
both. **Pillar one, the "input vs output" asymmetry:** *"OPDA ships the output of OntoClean and hides
the input."* But the input is not hidden — it is shipped as prose on the nine category concepts (the
bytes I quoted), and it is shipped per-type wherever a type's classification actually turned on it, in
`sh:message` and `skos:definition`. What the proposal adds is not the *information* (already present)
but a second *encoding* of it (typed triples). Nicola's own 041 paper concedes the principle that
defeats him: he corrected his draft to say the category concept's definition must **NOT** restate the
±R/±I cell, "else it would indeed be double-storage." Quite. But then he proposes to store that very
cell per-type instead — which is the same fact (Substance Kind = +R/+O) keyed to ~40 subjects instead
of one. He avoided double-storage at the category and re-introduced it, multiplied by forty, at the
type. The redundancy objection he conceded at the category level is *worse* at the type level, because
the type's category already determines its signature: once `opda:Proprietorship` is tagged
`RelatorCategory` (which it is, behind the sixth gate), "+R, +I, +D" is **entailed by the
classification**, not an independent datum. Per-type ±R/±I/±D/±U is the category's signature copied
down the `inScheme` edge by hand.

**Pillar two, separability insurance** (the pillar that moved Cagle, and the one I must break because
the FOR majority leans on it): *structured OntoClean markup "survives even if the UFO vocabulary is
ever retired."* This inverts the cost. The thing that survives UFO's retirement **most cleanly is
prose**, not a typed vocabulary of nine annotation properties with a `sh:in` value set and a SKOS
concept per value. Prose has no mapping surface, no gate, no value-scheme to migrate; you delete a
paragraph. A structured `opda:ontoCleanRigidity ∈ {rigid, anti-rigid, …}` vocabulary, by contrast, is
**a vocabulary OPDA must now steward forever** — define each value, version it, deprecate it, defend
the `sh:in` set against drift, keep the per-type assertions in step with every reclassification — and
on the day UFO is retired you must *also* unwind all of that. Guarino sells minted structure as the
cheap exit; it is the expensive one. The DCMI Usage Board discipline I co-authored is blunt here: *a
vocabulary you mint is a vocabulary you must maintain* ("Key Choices," 2013, §"the cost of meaning").
Separability insurance argues for **keeping OntoClean as judgement-in-prose precisely so it is
trivially separable** — which is Cagle's *own* session-040 position ("retain OntoClean-as-plain-
judgement … retire the UFO vocabulary"). Nicola turned that position into an argument *for* markup; I
turn it back: the cheapest separable form of a judgement is the judgement written down, not the
judgement re-encoded as a governed RDF vocabulary you are now wedded to.

**Disposition: HOLD.** Principled dissent. **WITHDRAWAL CONDITION (single, named):** I withdraw to
conditional-FOR if and only if a *named non-OPDA-authoring consumer* is demonstrated that must read
per-type ±R/±I/±D/±U *as structured data* and *cannot* obtain it from the category's `inScheme` edge
plus the already-shipped signature prose — i.e. a consumer for whom the type→category→signature
indirection is provably insufficient. Absent that consumer, the markup describes the describer, and I
hold. (This is strictly Q3's question, where I expect the condition to fail.)

---

## Q2 — Exact representation + scope (conditional; I voted REJECT at Q1)

**Baker (DA):** **Verdict: REJECT the need; but if the council overrides Q1, REVISE hard to the
narrowest scope. Ballot: AGAINST; conditional REVISE recorded.**

I argue this in the alternative, because a Devil's Advocate who only says "no" abandons the panel if
it lands "yes." *If* markup proceeds over my objection, the BRIEF's own Q2 scope question is where the
damage is contained, and the answer the FOR camp will not volunteer is: **not every class — only the
classes whose subclass-vs-facet decision actually turned on a meta-property.** Established Fact 2 says
the verdicts are in the artefact and the inputs are unrecoverable; but the inputs that *did work* are
exactly three (the session-040 byte-movers: `tenureKind` +R∧−I → facet; `VouchEvidence` +D → Relator;
`RiskAssessment` +I → retained as class). Tagging all ~40 classes asserts a meta-property vector for
~37 classes whose classification *did not turn on one* — which is the Dublin Core *dumb-down* failure
in reverse: you manufacture analytic precision the design act never exercised, and a downstream reader
cannot tell the three load-bearing judgements from the thirty-seven decorative ones. So the only
defensible scope is **the three (or the handful) where the meta-property was the pivot** — and at that
point you have a footnote, which is *prose*, which is Q1.

On representation, if forced: the agreed envelope (`owl:AnnotationProperty`, annotation-graph-only,
`sh:in`-governed, never reasoned, behind the sixth gate) is correct and I do not contest it — it is
the ODR-0031 R2 quarantine I helped ratify, and Gandon's argument that an annotation property is inert
*by OWL 2 §10.1 definition* (not by deployment convention) is right. But "the quarantine is sound"
is not "the content belongs in the graph." A safe envelope for the wrong content is still the wrong
content safely enveloped. **And one positive harm of the structured form over prose:** a `sh:in` set
`{rigid, anti-rigid, semi-rigid, non-rigid}` × `{+D, −D}` × … is a Cartesian value-space that *admits
combinations OntoClean forbids* (there is no coherent "+R, anti-rigid" type, but the `sh:in` enums
permit asserting it). Prose cannot express an incoherent signature; a product of independent `sh:in`
enums can. So the structured form is not merely redundant — it is **a looser representation than the
prose it replaces**, the opposite of the governance gain the proposition claims.

**Cross-talk — Guarino, again.** Nicola's value vocabulary (`ontoCleanRigidity ∈ {rigid, anti-rigid,
semi-rigid, non-rigid}`, etc.) is, in DCMI terms, four *Vocabulary Encoding Schemes* minted to hold
the cells of one analytic table. The VES test from my 041 ballot — *governed identity + definitions +
an external alignment target you will actually maintain* — fails on the alignment leg: there is no
external authority publishing `opda:ontoCleanRigidity` values to align to (OntoClean is a *method*,
not a published code list), so OPDA would be the sole minter, definer, and maintainer of four
schemes whose only reader is OPDA's own (hypothetical) audit query. That is minting on spec, which
DCMI does not do.

**Disposition: HOLD** (carries Q1's condition). If Q1 is overridden, my REVISE is binding-narrow:
**scope to the pivot classes only**, never the blanket ~40, and record that the blanket form is a
*dumb-down* violation.

---

## Q3 — Does it carry the canonical OntoClean check?

**Baker (DA):** **Verdict: REJECT. Ballot: AGAINST.** This is the question the whole FOR case stands
on, and it is the question where I have done the verification the proposition did not.

The FOR case rests entirely on one consumer: the −R-subsumes-+R query (find every type tagged −R that
is nonetheless `rdfs:subClassOf` something). Guarino: it is "a query no current OPDA artefact can run …
that is the difference between data and documentation, and it is the whole case." Two findings retire
it.

**Finding one — there is no named second consumer; there is one named *first* consumer, and it is the
author of the proposal.** I searched the corpus (`tools/`, `api/`, `public/ontology/`, `src/`, every
`.rq`): the only references to rigidity/identity in tooling are the **emitters that write the prose**
(`foundation.py`, `ufo_categories.py`, `vocabularies.py`) and `leaf_categoriser.py`; the three
production grlc queries (`list-entities`, `get-entity`, `list-entities-count`) never touch them; **no
SPARQL query, no grlc endpoint, no CI gate consumes per-type ±R/±I/±D/±U as structured data.** The
canonical check exists in exactly one location in this repository: the prose of Guarino's own
position paper. A consumer that lives only in the advocate's argument for the data is not a *second*
consumer — it is the *act of minting* wearing a consumer's coat. DCMI's discipline (and Karpathy's
"no abstractions for single-use code," which this project adopts) is to mint on a *driver*, not on the
promise that the driver would be nice to have. Guizzardi's own corpus rule, cited approvingly across
041, is "emission gated on its first driver." There is no first driver. There is a proponent.

**Finding two — the check validates a mistake the OntoClean process structurally prevents, over a
lattice a human reads at a glance.** I counted the subsumption edges the canonical query would scan:
the entire OPDA domain class hierarchy is **~10 `rdfs:subClassOf` edges among OPDA's own classes (22
including the `prov:` roots), over ~40 classes and 9 categories.** OntoClean is a *design-time
decision procedure* (ODR-0027): the −R⊐+R violation is the thing the procedure is *run to prevent
before a subclass edge is ever authored*. So the proposal is to mint a per-type structured vocabulary,
a `sh:in` value-space, and a maintenance burden — to enable a query that scans ten edges to detect a
violation that the procedure which produced those ten edges already made impossible. **The data exists
to check a thing that cannot occur, on a graph small enough to check by eye.** This is the precise
inversion of value the *dumb-down* principle warns against: heavyweight structured metadata standing
in for a judgement that is cheaper, safer, and already made in prose.

If the council nonetheless wants the *check*, note what follows: the check needs the data *only if the
check ships*. A CI gate / SHACL meta-shape that runs −R⊐+R would be a real (if tiny) second consumer
— but it would also need the per-type tags as its input, so "ship the gate" and "mint the tags" stand
or fall together. My position: **ship neither.** A ten-edge lattice does not warrant a meta-shape; the
procedure is the gate. If a future OPDA grows a hundred-class lattice authored by people who never ran
OntoClean, *then* the gate earns its input data — and that is the honest re-open trigger, not today.

**Cross-talk — Guarino's strongest single line, met head-on.** *"That is the difference between data
and documentation, and it is the whole case."* I accept the framing and deny the application: data
earns its keep when *a consumer reads it*; documentation earns its keep when *a human reads it*. The
±R/±I/±D/±U signature has exactly one reader today — a human, on the category page, reading
`skos:definition`. Naming a hypothetical machine reader does not convert documentation into data; it
converts a maintenance liability into a *speculative* maintenance liability. The whole case rests on a
consumer that the corpus shows does not exist and a violation the methodology shows cannot arise.

**Disposition: HOLD.** **WITHDRAWAL CONDITION (single, named):** I withdraw the instant the
−R⊐+R / IC-incompatible-subsumption check is **shipped as a running CI gate or SHACL meta-shape over
the TBox** (the ODR-0031 R3 tag-guard pattern, validating types never instances) — because at that
moment the check becomes a real, named, second consumer and the per-type tags become its necessary
input, and my "no consumer" objection is answered by construction. Until that gate exists in the
build, the markup has no consumer but its own advocate, and I hold.

---

## Q4 — Disposition + record

**Baker (DA):** **Verdict: REJECT; record the rejection + its re-open trigger. Ballot: AGAINST.**

This is a Reduced Council reconvening a clean 3–3 that session-041 routed here under the agreed
envelope. Nothing in the FOR case is new since 041 — the separability-insurance and canonical-check
arguments are the same two I rebut above — and one thing in *my* case is newly *verified*: the
signature already ships as prose (Fact 4, confirmed at `opda-annotations.ttl:85`), and the canonical
check has no consumer in the corpus (my Q3 search). A reconvened council that has gained only
*disconfirming* evidence for the proposition should not flip to AFFIRM. It should **record the
rejection with a precise, falsifiable re-open trigger**, which is the honest disposition for a
genuinely-held methodological split.

**Routing, precisely.** Do **not** lift the ODR-0031 R7(a) held split to AFFIRM. Instead:

1. **Resolve R7(a) as REJECT-for-now** in ODR-0031: the OntoClean meta-property markup is declined as
   standing graph content, on the recorded ground that (i) the signature already ships as
   `skos:definition` prose on the nine `UFOCategoryScheme` concepts, so per-type markup is redundant
   materialisation (one-to-one violation), and (ii) the sole proposed consumer — the canonical −R⊐+R
   check — exists in no OPDA artefact, scans a ~10-edge lattice, and validates a violation the ODR-0027
   design procedure structurally prevents.
2. **Record the re-open trigger** (the union of my Q3 and Q4 conditions, so the FOR camp has a clean,
   falsifiable path): *re-open if either (a) a named non-OPDA-authoring consumer requires per-type
   ±R/±I/±D/±U as structured data unobtainable from the category `inScheme` edge; or (b) the canonical
   OntoClean check is to ship as a CI gate / SHACL meta-shape over the TBox — at which point the gate
   and its per-type input data are adopted together, under the unchanged envelope* (`owl:Annotation-
   Property`, `opda-annotations.ttl`, `sh:in`-governed, never reasoned, behind the sixth gate).
3. **Amend nothing in the emitter.** No ADR-0045 change; nothing emitted. ADR-0045's quarantine,
   sixth gate, and `UFOCategoryScheme` stand exactly as shipped — they are the reason the signature
   prose already has a home, which is why the structured copy is unneeded.

This keeps the council honest about a real split: the FOR camp gets a named trigger that, *if their
predicted consumer ever materialises*, adopts the markup cheaply and safely on the envelope already
agreed; the AGAINST camp does not pay a forever-maintenance tax to describe its own reasoning today.

**Cross-talk — convergence and divergence (required).**

- **Allemang (AGAINST), convergence:** Dean and I land in the same place by the same logic. His "ship
  the knife, not the whetstone" (*SWWO* 3rd ed., Ch. 12–13) and my "describe the resource, not the
  describer" are one principle in two vocabularies: the meta-property vector is the *whetstone* (the
  procedure's worksheet), and the artefact ships the *knife* (the verdict — the class topology, the
  facets, the category tag). We converge completely on the disposition (REJECT-as-standing-markup,
  IAO-crosswalk-only earns its keep).
- **Allemang, divergence:** where I would (very slightly) diverge is altitude of the re-open door.
  Dean's "minimum model" framing risks reading as *never* — markup is over-modelling, full stop. I am
  narrower and more falsifiable: markup is over-modelling *until a named consumer or a shipping CI gate
  exists*, and I want that trigger recorded, not the door welded shut. A genuine driver (the
  hundred-class lattice, the external auditor) would flip me; I suspect it would not flip Dean. That is
  a real, if small, difference in where each of us sets the bar — and I want mine on the record because
  it is the falsifiable form the FOR camp is owed.
- **Gandon (AGAINST), convergence:** Fabien's "materialising them as triples would assert metaphysics
  into the artefact *for no consumer*" is, almost word for word, my Q3 finding — and he reached it from
  the standards-conformance lens (OWL 2 §10.1) while I reached it from the metadata-governance lens
  (DCMI one-to-one). Two independent routes, one conclusion: no consumer, no markup. Where I *extend*
  Gandon rather than diverge: he says "for no consumer" as an assertion; I have now *verified* it
  against the corpus (no `.rq`, no grlc endpoint, no gate reads the vectors), so the "no consumer"
  premise is no longer a claim — it is a checked fact, and the re-open trigger I record is exactly the
  event that would falsify it.

**Disposition: HOLD** (the standing dissent of this Reduced Council's AGAINST bloc). **WITHDRAWAL
CONDITION (single, named, unifying):** I withdraw to FOR when the canonical OntoClean check ships as a
running CI gate / SHACL meta-shape over the TBox (Q3's trigger), since that is the one event that
simultaneously (a) creates the named second consumer my Q1 condition demands and (b) makes the
per-type tags its necessary input — at which point markup is adopted *together with the gate that
consumes it*, on the unchanged envelope. Short of a shipping consumer, the data describes only the
describer's reasoning, and I hold.

---

### Ballot summary

| Q | Verdict | Ballot | One-line | Disposition |
|---|---|---|---|---|
| Q1 mark up at all? | **REJECT** | **AGAINST** | The signature already ships as `skos:definition` prose on the nine `UFOCategoryScheme` concepts (Fact 4, verified `opda-annotations.ttl:85`); per-type markup is redundant materialisation of one fact in two registers (DCMI one-to-one) and asserts the *describer's reasoning* as resource data. | **HOLD** — withdraw iff a named non-authoring consumer needs per-type vectors unobtainable from the `inScheme` edge. |
| Q2 representation + scope | **REJECT** (conditional **REVISE**) | **AGAINST** | If overridden: scope to the *pivot* classes only (≈3 byte-movers), never the blanket ~40 — the blanket form is a *dumb-down* violation and, as a product of `sh:in` enums, admits OntoClean-incoherent signatures the prose cannot. | **HOLD** (carries Q1's condition). |
| Q3 canonical check / consumer | **REJECT** | **AGAINST** | Verified: **no** `.rq`, grlc endpoint, or CI gate consumes the vectors; the check lives only in the advocate's prose; it scans a **~10-edge lattice** to detect a violation the ODR-0027 design procedure structurally prevents. Data minted to check a thing that cannot occur. | **HOLD** — withdraw the instant the check **ships as a CI gate / SHACL meta-shape over the TBox** (then gate + tags adopt together). |
| Q4 disposition + record | **REJECT** | **AGAINST** | Resolve ODR-0031 R7(a) as REJECT-for-now with a falsifiable re-open trigger (named consumer **or** shipping CI gate); amend nothing in the emitter; `UFOCategoryScheme` prose already carries the signature. | **HOLD** — unifying withdrawal condition = the canonical check ships as a TBox gate. |

**The one sentence for the synthesis.** OPDA already ships its OntoClean signatures — as prose, on the
nine category concepts a human actually reads — and the only proposed reader of a *structured* copy is
the proposal itself; until a real consumer ships (the canonical check as a CI gate, or an external
auditor that needs the per-type vectors as data), minting ±R/±I/±D/±U per type would describe OPDA's
own reasoning as if it were a fact about a conveyance, store one fact in two registers, and bind the
project to maintaining four value-schemes forever to detect a violation a ten-edge lattice and a
design-time procedure already make impossible.
