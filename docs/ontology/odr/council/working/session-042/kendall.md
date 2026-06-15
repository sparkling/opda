# Session 042 — Kendall (Queen): OntoClean meta-property markup

**Voice:** Elisa Kendall (OMG / EDM Council; FIBO methodology; Kendall & McGuinness, *Ontology
Engineering*, 2019). **Lens:** enterprise-ontology pragmatism — a modelling artefact earns its keep by
serving a *named downstream consumer*, and it must assert only what it substantiates (the FIBO
class-vs-datum discipline; record rationale where it is *actionable*, not decorative). I am the swing
voice on a recorded 3–3; I adjudicate on the merits.

**Headline:** I break the tie **FOR markup**, but **REVISE** the proposition on two load-bearing points
— scope (only the classes the decision *turned on*, plus the contrast set the audit needs), and the CI
meta-shape (a *condition* of my FOR, not optional colour). Without the gate I would join Baker and
Allemang in REJECT. With it, the proposition clears both FIBO tests that this question actually turns on.

---

## Q1 — Mark up at all, or keep prose? — **REVISE / FOR**

**Kendall (Queen):** **REVISE / FOR.** This question turns on two FIBO tests pulling opposite ways,
which is exactly why session-041 split clean 3–3 — and on the merits the FOR side wins both.

*Test 1 — named downstream consumer.* In the FIBO / OMG modelling-team practice we mint a term only
when a named consumer needs it; speculative "might be useful" markup is the scope-creep we spend our
review discipline resisting (Kendall & McGuinness, *Ontology Engineering*, 2019, Ch. 2 §"requirements
before representation"). Guarino names a **concrete, runnable** consumer: the canonical OntoClean check
— *find every type tagged −R that is nonetheless `rdfs:subClassOf` something* — and its companion, the
identity-criterion-incompatible-subsumption query (Guarino & Welty, "An Overview of OntoClean,"
*Handbook on Ontologies* 2nd ed., 2009, §3–4). That is not a hypothetical: it is an audit of OPDA's
**own** `isA`-admission cascade (ODR-0011 §8a, codified in ODR-0027 R1 — "anti-rigid → never a subclass;
+R∧+I∧+D → Relator; +R∧+I∧−D → subclass"). The corpus *runs* that cascade to produce its topology but
**cannot today query whether the topology is internally consistent with the meta-properties that
produced it**, because those meta-properties exist only as `sh:message`/`skos:definition` prose. A
self-consistency check on the artefact's own governing method is the *paradigm* of a real consumer, not
a marginal one. This test lands FOR.

*Test 2 — assert only what you substantiate (the class-vs-datum line).* This is Baker's objection and
it is the serious one, so I take it on its own ground. In FIBO we are ruthless about not minting a class
or a datum the artefact cannot stand behind — you do not assert `fibo:isDenominatedIn` unless the source
record actually carries the denomination. So: does OPDA *substantiate* a per-type ±R/±I/±D/±U vector?
**Yes — to exactly the same degree it substantiates the verdict it already ships.** The subclass-vs-facet
**outcome** sitting in the corpus (the class topology, the coded facets — established fact #2 in the
brief) is the *conclusion* of the OntoClean procedure; the meta-property vector is its *recorded
premise*. OPDA did not invent the vector — it computed it, used it, and discarded the trace into English.
A standard that ships the **conclusion** of a decision procedure as queryable data and calls the
procedure's **premises** "a judgement only the process made" is drawing the substantiation line in the
wrong place: the premise is substantiated identically to the conclusion. That is the FIBO class-vs-datum
discipline applied honestly, and it lands FOR. (I rebut Baker in full below.)

Both tests FOR — so REVISE/FOR, the REVISE being the scope and gate conditions in Q2/Q3. The
quarantine envelope (`owl:AnnotationProperty`, annotation-graph-only, `sh:in`-governed, never reasoned —
brief fact #3, identical to the `opda:ufoCategory` landing in ODR-0031 R2) is the non-negotiable floor;
I do not re-litigate it.

*Cross-talk.* I **agree with Guarino** on the consumer and on the separability-insurance frame
(structured meta-properties make the OntoClean reasoning auditable *independent of the UFO vocabulary*,
so they survive the Devil's-Advocate Option-D retirement of UFO as queryable data) — but his "per type"
is too broad and I cut it in Q2. I **rebut Baker**: "minting them would assert a judgement only the
process made" misplaces the class-vs-datum line — the verdict OPDA *already ships* is no less
process-made than the meta-properties; if the premise is unsubstantiable, so is the conclusion already
in the graph, which is absurd. What Baker is *right* about — that ungoverned, un-exercised tags would be
mere assertion — I answer not by keeping prose but by the `sh:in` governance + the CI check (Q3), which
is his **own** DCMI/SKOS Vocabulary-Encoding-Scheme governance instinct (Baker et al., "Key Choices in
the Design of SKOS," *J. Web Semantics* 20, 2013) turned to the FOR side. I **refine Allemang** rather
than reject him (Q4 cross-talk): "ship the knife, not the lens" is right against *blanket* markup and
wrong against *scoped, exercised* markup.

---

## Q2 — Exact representation + scope — **REVISE / FOR**

**Kendall (Queen):** **REVISE / FOR**, with one substantive amendment to scope and one endorsement on
representation.

*Representation — endorse, with the FIBO discipline made explicit.* Four small `owl:AnnotationProperty`
predicates — `opda:ontoCleanRigidity`, `opda:ontoCleanIdentity`, `opda:ontoCleanDependence`,
`opda:ontoCleanUnity` — each with a **SKOS-backed, `sh:in`-governed** value set, is correct and is the
in-corpus idiom (it mirrors `opda:ufoCategory`'s ODR-0031 R2 landing and ODR-0027 R4 "every controlled
value-space is a `skos:ConceptScheme`"). I'd state the value vocabularies as the brief proposes —
rigidity ∈ {rigid, anti-rigid, semi-rigid, non-rigid}, identity ∈ {supplies-IC, carries-IC, no-own-IC},
dependence ∈ {+D, −D}, unity ∈ {+U, −U, anti-unity} — anchored on the existing `opda:UFOCategoryScheme`
concepts where they already carry the OntoClean signature as prose (brief fact #4), so the structured
value and the prose definition live on one resource rather than drifting apart. Full ±R/±I/±D/±U, **not**
a subset: a self-consistency audit (Q3) needs rigidity *and* identity at minimum to express both
canonical checks, and dropping dependence/unity would leave the Relator-admission limb (+D) and the
unity-failure cases un-auditable — a partial vector cannot validate a four-limbed cascade.

*Scope — the amendment.* Guarino's "per type" / the proposition's "every class" is the over-modelling
error FIBO methodology exists to catch: tagging all 40 classes with a full vector where ~35 never had a
contested subclass-vs-facet call manufactures metadata the decision never used, and decorative metadata
is precisely what fails my "actionable rationale" test (Kendall & McGuinness, 2019, Ch. 6 §"minimal
committed ontology"). But the brief's narrower alternative — "*only* those whose decision turned on a
meta-property" — is **too** narrow to keep the consumer sound: a `−R-subsumes-+R` query is only
meaningful if *both* the `−R` subjects *and* the `+R` types they are (or are not) subsumed under are
tagged; tag only the contested anti-rigid leaves and the check has nothing to check them against. So my
amendment: **tag every class whose subclass-vs-facet decision turned on a meta-property (the `tenureKind`,
`VouchEvidence`, `RiskAssessment` family and their siblings under ODR-0011 §8a), PLUS the immediate
sub/superclass contrast set those audit queries must range over to be sound** — not the full corpus, not
only the contested leaves. This is the FIBO "scope the markup to what the named consumer actually
reads" rule, stated precisely.

*Placement / quarantine.* Identical to `opda:ufoCategory`: declaration + all tags in
`opda-annotations.ttl`, behind the sixth three-graph gate (ADR-0045), referenced-not-imported on the
`prov:Entity` precedent, **never** a `sh:targetClass`/`sh:path` lever on instance conformance. The
`sh:in` is a tag-only editorial guard on the predicates' own values, kept out of the instance-validation
union (ODR-0031 R3) — anything else re-fires Cagle's trigger (i).

*Cross-talk.* This is where I **part from Guarino on the merits, not by halving**: his consumer is real,
but "per type" would bury that consumer's signal in 35 classes of unused vector — the FIBO scope cut
protects his own argument by keeping the markup exactly as large as the audit needs and no larger. It
also **directly answers Allemang**: a *scoped* tag set keyed to the contested decisions is not "the
methodology materialised as graph content" (his AGAINST); it is the *decision record* for the handful of
calls that were genuinely contestable — which is what FIBO ships.

---

## Q3 — Does it carry the canonical OntoClean check? Ship it as a CI meta-shape? — **AFFIRM / FOR (as a condition)**

**Kendall (Queen):** **AFFIRM / FOR — and I make the CI meta-shape a *condition* of my Q1 FOR, not an
enhancement.** This is the hinge of the whole adjudication.

The consumer is real (Q1). But here is the FIBO point that decides the tie: **markup that no consumer
ever exercises is indistinguishable from the decorative metadata my methodology rejects** — and it is
*also* exactly what makes Baker's "mere assertion" objection bite. Latent ±R/±I/±D/±U tags that sit in
the annotation graph unqueried *are* just an assertion of a judgement, with no mechanism proving the
judgement is even self-consistent. The thing that converts the markup from decoration into a
**substantiated, exercised** artefact is the check that runs against it. So:

- **Ship the canonical OntoClean check as a CI gate / SHACL meta-shape that validates the TBox, never
  instances** — the ODR-0031 R3 / ADR-0045 tag-guard pattern (validate the annotation graph's own
  contents; `ASK`/SHACL over the schema, with the predicate kept out of the instance-validation union).
  Concretely: an `ASK` (or SHACL-SPARQL `sh:select`) that fails CI if any class tagged
  `opda:ontoCleanRigidity "anti-rigid"` is also `rdfs:subClassOf` a tagged class — the operationalised
  form of ODR-0027 R3 ("Roles are anti-rigid → NEVER `rdfs:subClassOf` a Kind"), plus the
  identity-incompatible-subsumption companion. This is a *constraint that validates the model against its
  own stated method* — the FIBO/OMG practice of encoding the modelling rule as an executable check, not a
  comment (Kendall & McGuinness, 2019, Ch. 7 §"ontology testing"; the same instinct as FIBO's SHACL
  conformance suites over its module structure).

- **The gate is the condition.** If the council adopts the markup **without** the meta-shape, I flip to
  **REJECT** — because then the markup is latent assertion that no consumer reads, Baker and Allemang are
  correct, and we have minted metadata the artefact does not exercise. The value Guarino promises is *the
  check*, not *the tags*; ship the tags without the check and you have shipped the cost without the
  benefit. This mirrors session-041's own "relocate AND gate, atomically" discipline (Cagle + Guarino,
  co-signed): the markup and its gate are one deliverable, not two.

*Cross-talk.* I **refine Guarino**: he treats the check as the *payoff*; I treat it as *constitutive* —
without it the tags fail my actionable-rationale test and his own FOR case collapses into Baker's
AGAINST. I **partly concede Baker and Allemang**: their objection is *valid for ungated markup* — and the
gate is precisely the answer, because a CI-exercised self-consistency check is the opposite of "a
judgement only the process made sitting inertly in the graph." The check makes the judgement *falsifiable
on every build*, which is a stronger honesty guarantee than prose that can silently drift from the
topology (and the corpus already has a drift precedent — Baker's own `"Substance Kind label"` vs
`SubstanceKindLabel` finding in session-041).

---

## Q4 — Disposition + record — **REVISE / FOR**

**Kendall (Queen):** **REVISE / FOR** — adopt under the two conditions, and record it as a clean lift of
the ODR-0031 R7(a) held split into an enforced decision.

*Routing (if adopted, as I vote):*
1. **Amend ODR-0031** — resolve R7(a) from "held 3–3, routed onward" to **adopted under REVISE**: four
   `owl:AnnotationProperty` OntoClean meta-property predicates, SKOS-`sh:in`-governed, **scoped** per
   my Q2 amendment (turned-on-it classes + contrast set, not blanket per-type), in `opda-annotations.ttl`
   behind the existing sixth gate, **conditional on** the Q3 CI meta-shape shipping in the same change.
   Record the session-042 tally and that the Queen's swing turned on the substantiation rebuttal + the
   gate-as-condition.
2. **Realise it in a new ADR (not ADR-0045)** — ADR-0045 is `proposed`/implemented and explicitly scopes
   the OntoClean markup *out* ("it would attach to the same scheme resource"); a fresh ADR that
   **depends-on ADR-0045** is cleaner than reopening a committed change-set. It carries: the four
   predicates + value schemes in `emitters/annotations.py` (hung on the `opda:UFOCategoryScheme`
   concepts), the per-class tags scoped to the contested-decision set, the **seventh** CI check (the
   OntoClean meta-shape), and a byte-identity re-pin. The seventh gate sits beside the sixth as a
   TBox-only `ASK`/SHACL check.

*Re-open / failure record.* Record the standing dissent verbatim: if the markup ever ships **without**
the meta-shape, or the meta-shape is later removed while the tags remain, the markup reverts to the
REJECT position (Baker/Allemang) — latent assertion fails the consumer test. And carry Baker's
substantiation objection as **noted-and-overruled** (not erased): the Queen's adjudication is that the
premise is substantiated identically to the already-shipped conclusion, but the objection is the correct
guard if the gate is ever lost.

*If the synthesis lands the other way (REJECT)*, the record is symmetric: keep the meta-properties as
prose in `sh:message`/`skos:definition`; **re-open trigger** = a second consumer beyond the
self-consistency audit (e.g., an external OntoClean-aware validator, or a downstream tool that filters
OPDA types by rigidity) materialises, *or* a topology-vs-prose drift is found that the prose could not
have caught.

*Cross-talk.* The routing deliberately **honours Allemang's and Baker's principle even in the FOR
disposition**: by making the gate a condition and recording their objection as the live guard, the
decision does not "manufacture a majority" against them — it adopts the narrowest thing that satisfies
the consumer (Guarino) while keeping their objection operative as the trip-wire. That is the FIBO way to
record a contested decision: state the actionable scope, encode the check, and keep the dissent as the
falsifier.

---

## Summary of verdicts

| Q | Verdict | Ballot | One-line rationale |
|---|---|---|---|
| Q1 mark up vs prose | **REVISE** | **FOR** | Real named consumer (the OntoClean self-consistency audit) + the meta-property vector is substantiated *identically to the verdict already shipped* — Baker's class-vs-datum line, applied honestly, cuts FOR. |
| Q2 representation + scope | **REVISE** | **FOR** | Four `owl:AnnotationProperty` predicates, full ±R/±I/±D/±U, SKOS-`sh:in`-governed, on the `UFOCategoryScheme` concepts; **scope amended** to turned-on-it classes + the contrast set the audit ranges over — not blanket per-type (over-modelling), not only contested leaves (breaks the check). |
| Q3 canonical check / CI gate | **AFFIRM** | **FOR (conditional)** | Ship the −R⊐+R + IC-incompatible-subsumption check as a TBox-only CI meta-shape (ODR-0031 R3 / ADR-0045 tag-guard pattern). **The gate is the condition of my Q1 FOR** — ungated, the markup is decoration and I flip to REJECT. |
| Q4 disposition + record | **REVISE** | **FOR** | Amend ODR-0031 R7(a) → adopted-under-REVISE (scoped + gated); realise in a **new ADR** depends-on ADR-0045 with a seventh CI check + byte-identity re-pin; record Baker's substantiation objection as noted-and-overruled and the no-gate case as the re-open trigger. |

**Net:** I break the 3–3 **FOR**, conditioned on (a) the Q2 scope cut and (b) the Q3 CI meta-shape
shipping atomically with the tags. The proposition is right that OPDA hides the premises of a procedure
whose conclusions it ships; it is wrong only in scope (too broad) and in treating the audit check as a
payoff rather than a precondition. Tighten both and it clears the FIBO named-consumer *and*
assert-only-what-you-substantiate tests — which is the only basis on which I'd move a recorded tie.
