# Council Session 042 — Brief: should OPDA mark up the OntoClean meta-properties?

**Read this whole file before writing your position.** This is a **Reduced Council** reconvening the
one question session-041 left as a clean **3–3 held split** and routed here (ADR-0045 deferred it
explicitly). Your per-question verdicts go in `docs/ontology/odr/council/working/session-042/<your-id>.md`.

## Proposition (the framing under review — Guarino's session-041 position)

> OPDA should mark up the **OntoClean meta-properties** — rigidity (±R), identity (±I/+O),
> dependence (±D), unity (±U) — as a **structured, annotation-graph-only `owl:AnnotationProperty`
> vocabulary, per type**, with a small `sh:in`-governed value set. The argument: OPDA *runs* the
> OntoClean decision procedure (it produced `tenureKind`→facet, `VouchEvidence`→Relator,
> `RiskAssessment`→class), but the corpus records only the **verdicts** (the subclass-vs-facet
> outcomes), never the **meta-properties that produced them** — those live only in `sh:message` /
> `skos:definition` prose. Marking them up makes the judgement **auditable and re-derivable** (the
> canonical OntoClean check — *find every type tagged −R that is nonetheless `rdfs:subClassOf`
> something* — is a query **no current OPDA artefact can run**), and it is **"separability
> insurance"**: because OntoClean is separable from and predates UFO, structured meta-property markup
> makes the analytic reasoning survive *even if the UFO vocabulary is ever retired* (the Devil's
> Advocate's own held Option-D exit). Discipline: `owl:AnnotationProperty`, annotation-graph-only,
> `sh:in`-governed, **never reasoned / never SHACL-keyed on instance data** — the same envelope as
> `opda:ufoCategory` (ODR-0031).

## The four questions

- **Q1 — Mark up at all, or keep prose?** Should OPDA represent the OntoClean meta-properties as
  structured per-type annotations, or keep them as prose in `skos:definition`/`sh:message`? This is
  the core 3–3 split. Verdict: AFFIRM (mark up) / REVISE (mark up, amended) / REJECT (keep prose).

- **Q2 — Exact representation + scope (if Q1 ≠ REJECT).** Which meta-properties (the full ±R/±I/±D/±U,
  or a subset)? Value vocabulary — a SKOS-backed controlled set, `sh:in`-governed, e.g.
  `opda:ontoCleanRigidity ∈ {rigid, anti-rigid, semi-rigid, non-rigid}`,
  `opda:ontoCleanIdentity ∈ {supplies-IC, carries-IC, no-own-IC}`, `opda:ontoCleanDependence ∈ {+D, -D}`,
  `opda:ontoCleanUnity ∈ {+U, -U, anti-unity}`? Per-type placement; the quarantine
  (`owl:AnnotationProperty`, annotation-graph-only, never reasoned). **Scope:** every class, or only
  those whose subclass-vs-facet decision actually turned on a meta-property?

- **Q3 — Does it carry the canonical OntoClean check?** The FOR case rests on enabling the
  −R-subsumes-+R query (and the IC-incompatible-subsumption query). Is that consumer real and worth
  the markup, or is it speculative? If real, should the check ship as a **CI gate / SHACL meta-shape**
  (validating the TBox, never instances — the ODR-0031 R3 tag-guard pattern) so the value is captured,
  not just latent?

- **Q4 — Disposition + record.** If adopted, how is it recorded? Lift the ODR-0031 R7(a) held split
  (amend ODR-0031), and realise it in the emitter (amend ADR-0045 or a new ADR)? If rejected, record
  the rejection + its re-open trigger. State the precise routing.

## Established facts (verified; you may rely on these)

1. The OntoClean meta-properties (rigidity/identity/dependence/unity) appear in the OPDA corpus
   **only as prose** — inside `sh:message` strings and `skos:definition`/`skos:scopeNote` text. They
   are **nowhere structured data**. (Verified across `opda-*.ttl`.)
2. The subclass-vs-facet **verdicts** ARE in the artefact (the class topology + the coded facets) —
   it is the **inputs** (the meta-property vectors) that are unrecoverable except by reading English.
3. The agreed safe-discipline **envelope** (from session-041, accepted by both camps *if* markup
   proceeds): `owl:AnnotationProperty`, in `opda-annotations.ttl`, **never reasoned over**, value set
   `sh:in`-governed, **never** a `sh:targetClass`/`sh:path` lever on instance conformance — identical
   to the `opda:ufoCategory` quarantine now enforced by the sixth three-graph CI gate.
4. **`opda:UFOCategoryScheme` already exists** in the annotation graph (ODR-0031 / ADR-0045): nine
   category concepts, each bearing its OntoClean signature *as `skos:definition` prose* + a gUFO
   `closeMatch`. So a category resource that could *anchor* per-category meta-property structure
   already exists; the question is whether to also tag it (and/or each class) with structured ±R/±I/±D/±U.
5. **session-041 left this as a clean 3–3** (the only unresolved item): **FOR** — Guarino (the
   decisive proponent: "separability insurance"; the canonical check), Guizzardi (complementary to the
   Relator-founds edge), Cagle (DA — *withdrew* to conditional-FOR, accepting it is OntoClean not the
   UFO vocabulary he holds droppable). **AGAINST** — Allemang ("ship the knife, not the lens"; minimum
   model), Baker ("minting them would assert a judgement only the *process* made — the one place
   enrichment would lie"), Gandon (prose). ADR-0045 routed it here; nothing was emitted.

## Input documents (read what your lens needs)

- session-041 transcript: `docs/ontology/odr/council/session-041-ufocategory-upper-ontology-representation.md` (the 3–3 split + the Q4 triage).
- ODR-0031 `docs/ontology/odr/ODR-0031-ufocategory-upper-ontology-representation.md` (R7(a) held split; the quarantine discipline).
- ADR-0045 `docs/adr/ADR-0045-ufocategory-quarantine-restoration-gufo-scheme-sixth-gate.md` (deferred this; the emitter + the sixth gate; the UFOCategoryScheme).
- ODR-0027 `docs/ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md` (the OntoClean cascade as OPDA's doctrine).
- ODR-0030 `docs/ontology/odr/ODR-0030-foundational-ontology-choice.md` (UFO-as-lens; the honesty doctrine; Cagle's Option-D held dissent).

## How to write your position

For EACH of Q1–Q4: (1) verdict — **AFFIRM / REVISE / REJECT** — + ballot **FOR / AGAINST / ABSTAIN**
(if REVISE, state the exact amendment); (2) rationale with a **grounded citation inline** (a named
W3C/OMG/DCMI spec + section; a book you (co-)authored + chapter; a peer-reviewed paper; a deployment
you led; or a maintained OSS project + named convention — **no anonymous "best practice"**); (3)
**cross-talk** — engage at least one named peer's position (agree, refine, rebut). The Queen composes
from your **actual words**; an ungrounded position is **not counted** toward the vote.
