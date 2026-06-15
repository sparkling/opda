# Session 042 — Dean Allemang (Working-Ontologist lens)

*Co-author, Allemang, Hendler & Gandon, **Semantic Web for the Working Ontologist**, 3rd ed.
(Morgan & Claypool / Elsevier, 2020). My lens: the minimum model that does the job; ship the
**decisions** a methodology produced, not the methodology itself (Ch. 12 "Good and Bad Modeling
Practices"; Ch. 13 "Ontologies in the Wild" / modelling for reuse).*

I carried AGAINST in session-041 ("ship the knife, not the whetstone"). I have re-grounded against the
**post-ADR-0045 corpus**, not the pre-flight one, and one established fact in the BRIEF is now stale —
which sharpens *both* camps and is where I begin.

---

## The fact the BRIEF gets wrong (and why it matters to every question)

BRIEF "Established fact 1" says the OntoClean meta-properties "are **nowhere structured data**." That was
true of the session-041 corpus. It is **no longer true of the shipped bytes.** ADR-0045 landed the nine
`opda:UFOCategoryScheme` concepts in `opda-annotations.ttl`, and **each one already carries its OntoClean
signature in its `skos:definition`**:

- `opda:RelatorCategory` — *"A relational endurant founded by an event … **(OntoClean +R, +I, +D)**"* (`opda-annotations.ttl:85`)
- `opda:RoleCategory` — *"An anti-rigid, externally-founded sortal role … **(OntoClean −R, +D)**"* (`:94`)
- `opda:RoleMixinCategory` — *"… dispersive (cross-sortal) role **(OntoClean −R, +D)** …"* (`:103`)
- `opda:SubstanceKindCategory` — *"A rigid sortal **(OntoClean +R, +O)** that supplies its own principle of identity …"* (`:112`)

So the meta-property vectors are **already recorded — at the category level — as semi-structured,
queryable-after-a-parse prose, keyed to the gUFO `closeMatch` and the `skos:notation` the predicate
points at.** Three distinct signatures cover all nine categories (most share a vector). This is decisive
for the whole session: the proposition is **not** "structure something that is pure English"; it is
"**re-key a vector that already lives at the category, to a finer grain (per *type*), with a finer
controlled vocabulary**." That is a smaller move than session-041's framing implied — which both helps
Guarino (the marginal cost is genuinely low, as he and Cagle already noted) and helps me (the *verdict* —
which category a type belongs to, and that category's signature — is **already shipped**; what is asked
for is the per-type **worksheet cell**).

---

## Q1 — Mark up at all, or keep prose?

**Allemang:** **REJECT — keep prose. Ballot: AGAINST.** I hold my session-041 line, re-grounded and, I
concede below, *narrowed*. The Working-Ontologist rule (SWWO 3rd ed., Ch. 12, "don't model what you won't
use"; the recurring "minimum model, nothing speculative" caution) asks one question of any candidate
triple: *does a consumer read it?* For the per-type `±R/±I/±D/±U` vector the answer today is **no** — and
the deeper objection is not cost but **category**. OPDA's artefact is built to **ship the decisions its
OntoClean procedure produced**: the class topology, the coded `opda:ufoCategory` facet, and — verified at
`opda-property.ttl:699` — the `tenureKind` verdict recorded *in full* as *"+R but −I … → classification,
NOT a subclass; opda does NOT mint Freehold/Leasehold/Commonhold OWL sub-classes."* The **outcome is
materialised**: no subclasses, a `sh:in` facet, the reason stated. Marking up a standing per-type
`opda:ontoCleanRigidity rigid` triple *in addition* is materialising the **derivation** alongside the
**conclusion** — asserting the worksheet next to the answer it already produced. That is the maximal form
of the over-modelling error my own chapter names: **asserting more than the artefact performs.** The graph
would now carry a *premise* it does no reasoning from, whose only honest status is "this is how we decided,"
which is what an ODR (and the `skos:definition` already present) is *for*. The knife is on the table,
sharpened and used; the meta-property markup is the whetstone, and a whetstone is shop equipment, not
product.

**Where I narrow (and the BRIEF told me to be honest here).** Because the category-level signature *already
ships* (above), the line "this is nowhere recorded" is gone. My REJECT is therefore **not** "the reasoning
must stay invisible" — it is already visible at the category. My REJECT is specifically against
**promoting it to a standing per-type predicate vocabulary** absent a reader. **The condition under which I
move to AFFIRM is precise and I state it now so the swing voice (Kendall) can hold me to it:** *if Q3
demonstrates a **named, materialised consumer** — a CI gate / SHACL-on-the-TBox meta-shape that actually
**runs** the canonical OntoClean check (find every `−R` type that is nonetheless `rdfs:subClassOf`
something) **as a green-or-red gate in the build** — then the per-type vector stops being a worksheet and
becomes the gate's **input data**, a thing a consumer reads, and the minimum-model rule no longer forbids
it; it requires it.* Modelling-for-reuse (SWWO Ch. 13) is explicit that you model what a downstream process
consumes. A gate that consumes the vector *is* that process. **No running gate → no reader → prose. A
running gate → a reader → mark up exactly what it reads.** This is the whole of my position; Q3 decides it.

---

## Q2 — Exact representation + scope (if Q1 ≠ REJECT)

**Allemang:** **REVISE (conditional — applies only if Q1 flips on the Q3 gate). Ballot: ABSTAIN as
framed; FOR the *narrowest* form.** I will not pre-authorise a representation for a vocabulary I voted not
to mint; but the BRIEF asks for the shape were it adopted, and the Working-Ontologist discipline has a
sharp answer that is **much smaller** than the proposition's `±R/±I/±D/±U`-on-every-class:

1. **Scope = decision-bearing types ONLY, never "every class."** SWWO Ch. 12's first rule is model only
   what does work. The vector is interesting **only** where the subclass-vs-facet call **turned on** it —
   `tenureKind` (+R, −I → facet), `VouchEvidence` (+R, +I, +D → Relator), `RiskAssessment` (→ class),
   `Comparable`, the evidence family. Tagging the ~30 classes whose category was never in question
   (`Address`, `EPCCertificate`, the Information-Object leaves) manufactures the maximal-asserting-more
   error at maximal scale: ~30 triples that record a derivation **no decision ever ran**. If it ships at
   all, it ships on the handful of contested types — call it < 10. Anything wider, I oppose outright.

2. **Don't re-key what the category already supplies.** Because `opda:RelatorCategory` already says "+R,
   +I, +D" in its `skos:definition`, a *type* tagged `opda:ufoCategory "Relator"` **already inherits its
   signature by one indirection through the scheme.** A per-type vector is only non-redundant for a type
   **whose signature differs from its category's default** — which is exactly the rare, genuinely
   decision-bearing case. So the controlled scope (point 1) and the no-redundancy rule are the **same
   rule** seen twice: mark up the vector **only on the types where the per-type value is not recoverable
   from `category → scheme → signature`.** I expect that set to be near-empty, which is itself an argument
   for prose.

3. **Subset, not the full quartet.** Of `±R/±I/±D/±U`, only **rigidity (±R)** and **identity (±I/+O)**
   ever moved an OPDA byte (the §8a cascade is stated in ±R/±I terms — ODR-0011 §8a, ODR-0027 §R1).
   **Dependence (±D)** is already carried structurally by the Relator/`founds` topology Guizzardi points
   to; **unity (±U)** has adjudicated nothing in this corpus. Minting a `opda:ontoCleanUnity` predicate
   that classifies nothing is speculative configurability — the exact thing Ch. 12 says to cut. If
   adopted: **±R and ±I only**, SKOS-`sh:in`-governed, `owl:AnnotationProperty`, in `opda-annotations.ttl`,
   never reasoned, never an instance-`sh:targetClass`/`sh:path` lever — the *identical* envelope ODR-0031
   R2/R3 already enforces for `opda:ufoCategory` (and the sixth gate already guards).

So my Q2, in one line: **if it ships, it is ±R/±I, on the < 10 decision-bearing types, only where the
value isn't already inherited from the category, under the existing quarantine.** That is a footnote, not a
vocabulary — and the gap between that footnote and the proposition's full-quartet-every-class framing is
itself evidence the maximal version is over-modelled.

---

## Q3 — Does it carry the canonical OntoClean check?

**Allemang:** **REVISE — the check is the *only* thing that can make Q1 an AFFIRM, so it must ship as a
gate or the whole enterprise is speculative. Ballot: FOR the gate-as-precondition; AGAINST any markup
that ships without it.** This is the load-bearing question and I want to be the voice that says so from the
AGAINST bench. I verified the corpus: **`tools/opda-gen/src/opda_gen/ci/` has eight gates and not one runs
the OntoClean check** (no `−R`/`anti-rigid`/`subsumption` logic anywhere in the CI tree). So the canonical
query — *every `−R` type that is nonetheless `rdfs:subClassOf` something* — is, today, **a query no OPDA
artefact runs.** The BRIEF states this; I confirm it.

That cuts **both** ways, and the cut is the heart of session-042:

- **If the check does NOT ship as a running gate, Q1 is REJECT and it is not close.** A meta-property
  vocabulary whose sole justification is "you *could* run this audit" is the textbook speculative model
  (SWWO Ch. 12 — "auditability you never exercise is documentation, and documentation belongs in prose / an
  ODR, not in asserted triples"). Latent-consumer is **not** consumer. Guarino's "auditable and
  re-derivable" is, until a gate exists, **re-derivable by a human reading the same `skos:definition`
  signatures that already ship** — which is precisely what we have, and it is enough.

- **If the check DOES ship as a green/red CI gate — a SHACL-on-the-TBox meta-shape on the ODR-0031 R3
  tag-guard precedent (validate the TBox, never instances) — then it is a real, named, in-build
  consumer**, and on the Working-Ontologist "model what your process consumes" rule (SWWO Ch. 13) the
  per-type ±R/±I vector becomes the gate's **input**, and my Q1 REJECT flips to AFFIRM for *exactly the
  data the gate reads, on exactly the types it reads it on.* Not one triple more.

The disposition I will sign: **the gate is the precondition, not a nice-to-have.** Adopt the markup **iff**
the same change-set ships the TBox meta-shape that consumes it (the R3 tag-guard pattern — TBox-only,
instance-data never touched, so it cannot re-fire Cagle's trigger (i)). Markup-without-gate is the one
outcome I rule out from either bench: it is the whetstone shipped *as product* with no blade to hone.

---

## Q4 — Disposition + record

**Allemang:** **REVISE — record a *conditional* adoption gated on Q3, lift the ODR-0031 R7(a) split, and
do NOT open a standing vocabulary on a latent promise. Ballot: FOR the conditional disposition.** The
clean way to retire a held 3–3 is **not** to manufacture a majority but to find the **condition that
collapses the disagreement** — and Q3 is it. The FOR camp (Guarino/Guizzardi/Cagle-withdrawn) and the
AGAINST camp (me/Baker/Gandon) are not actually disagreeing about metaphysics; we are disagreeing about
**whether a consumer exists.** Make the consumer a build gate and we *all* say yes; leave it latent and we
*all* should say no. So:

- **Routing.** Amend **ODR-0031 R7(a)** (lift the held split) and realise in the emitter via **a new ADR**
  (not by re-opening ADR-0045, which is a clean landed record — adding a fresh concern to it muddies its
  byte-identity re-pin). The new ADR carries: (a) the ±R/±I per-type tags on the decision-bearing subset;
  (b) the TBox meta-shape gate that consumes them; (c) a byte-identity re-pin. **(a) and (b) ship in the
  same commit or neither ships** — the Q3 condition, made mechanical.
- **If the operator declines the gate** (reasonably — it is real build surface for a small audit), then
  **record REJECT** with the re-open trigger stated crisply: *"re-open when a named consumer — a CI gate,
  an external reuse partner, or a second OntoClean check — needs the per-type ±R/±I vector as queryable
  data; until then the category-level signature in `opda-annotations.ttl` `skos:definition` + the ODRs are
  the record."* That trigger is **lower** than session-041 left it, *because* I have now shown the
  category-level signature already ships — so the only gap a re-open must close is the **per-type** grain,
  and only for a consumer that reads it.

One line for the record: **the artefact already tells you the reasoning (per category); session-042 is only
deciding whether to also tell a machine, per type — and you only tell a machine a thing a machine reads.**

---

## Cross-talk (required)

**On Guarino (separability-insurance + the canonical check) — I refine, and concede the hinge.** Guarino's
strongest move is real and I will not wave it away: *"the canonical OntoClean check is a query no current
OPDA artefact can run"* (Guarino & Welty, "An Overview of OntoClean," *Handbook on Ontologies* 2nd ed.,
2009, §3) — **verified true** (no such gate in `ci/`). And his "separability insurance" — the markup
survives even if the UFO *vocabulary* is retired — is the genuinely good argument, because OntoClean does
predate and outlive UFO (Guarino's own 1994 "Ontological Level"). **Here is my refinement, not a rebuttal:
insurance against a loss pays out only if someone files the claim.** A `±R` tag that no gate reads is an
insurance policy in a drawer — it protects nothing until the audit *runs*. So Guarino's two arguments
**collapse into one**: both the canonical-check value and the separability value are realised *only by a
running consumer of the vector.* That is why I say **the gate is not optional to the FOR case — it IS the
FOR case.** With the gate, I am with Guarino. Without it, his "auditable" is satisfied by the
`skos:definition` signatures already shipped (a human runs the audit by reading them), and the standing
per-type triples add asserted-but-unread data. **My AFFIRM condition and his strongest argument are the
same sentence**: ship the consumer.

**On Baker ("minting them would *lie*") — I agree on the diagnosis, disagree on the post-ADR-0045 verb.**
Baker's session-041 line is that marking the vector up "would assert the artefact carries a judgement only
the *process* made — the one place enrichment would lie." I **agreed** then and the instinct is right: the
artefact should not impersonate the methodology. But I must correct the factual premise *for Baker's
benefit*, because it changes his verb. The judgement is **no longer** carried "only by the process" — it is
**already asserted**, at the category level, in the nine `skos:definition`s ADR-0045 shipped
(`opda:RelatorCategory` = "+R, +I, +D", etc.). So the honest charge is **not** "minting it would lie"
(the assertion already exists and does not lie — it is true and sourced to ODR-0031). The honest charge,
post-ADR-0045, is **narrower and is mine**: minting it *per type* **adds asserted data no consumer reads** —
a redundancy/speculation objection, not a mendacity one. Where Baker and I still **converge exactly**: a
per-type `±U` tag *would* edge toward his "lie," because unity has adjudicated **nothing** in this corpus —
asserting `opda:ontoCleanUnity` per type really would claim the process weighed something it never did. So
**Baker's "would lie" survives intact for the speculative slices (±D structurally-redundant, ±U
never-exercised) and is the strongest argument for my Q2 subset (±R/±I only).** I'd put it to him: drop
"lie" for ±R/±I (the signature already ships, truthfully); keep "lie" for ±U (we never weighed it) — and we
are saying the same thing.

**On Cagle (DA, withdrawn-to-conditional-FOR) — his test is my Q3, verbatim.** Cagle's session-041 test
was that markup earns its place iff *"(a) a real external/second consumer needs it as **queryable data**,
AND (b) it lives quarantined and reasoned-over-nowhere."* That is **precisely** my Q3/Q4 condition, arrived
at from the opposite bench: (b) is the existing R2/R3 envelope + sixth gate (already satisfied); (a) is
**unmet today** (no gate, no external partner) and is met **only** by shipping the TBox meta-shape. So
Cagle and I are not on opposite sides — we are the **same gate-condition, two seats apart.** His withdrawal
to conditional-FOR and my REJECT-unless-gated are the **identical disposition**: yes iff a queryable
consumer exists, quarantined; no otherwise.

---

## Summary of my four verdicts

| Q | Verdict | Ballot | One-line rationale |
|---|---|---|---|
| **Q1** Mark up at all? | **REJECT** (keep prose) — flips to **AFFIRM iff** Q3 ships a running gate | **AGAINST** | Ship the decision (materialised: topology + `ufoCategory` facet + `tenureKind` verdict at `opda-property.ttl:699`), not the worksheet — *unless* a consumer reads the worksheet. The category-level signature **already ships** in `opda-annotations.ttl` `skos:definition`s. |
| **Q2** Representation + scope | **REVISE** to the narrowest form | **ABSTAIN** as framed / **FOR** the minimum | If adopted: **±R/±I only** (drop ±D redundant, ±U never-exercised), on the **< 10 decision-bearing types only**, only where the value isn't already inherited `category → scheme → signature`, under the existing `AnnotationProperty` + sixth-gate quarantine. Never "every class," never the full quartet. |
| **Q3** Canonical check / gate | **REVISE** — the gate is the **precondition**, not a bonus | **FOR** gate-as-precondition; **AGAINST** markup without it | No CI gate runs the check today (verified — eight gates, none OntoClean). Latent-consumer ≠ consumer. Ship the TBox meta-shape (R3 tag-guard, TBox-only) **or the markup is speculative.** |
| **Q4** Disposition + record | **REVISE** — conditional adoption gated on Q3 | **FOR** the conditional disposition | Lift ODR-0031 R7(a); realise in a **new ADR** (not ADR-0045): ±R/±I tags **and** the consuming gate ship **together or not at all.** If the operator declines the gate → **REJECT** with the (now lower) re-open trigger. |

**The through-line:** session-041's "nowhere structured" premise is stale — the OntoClean signature
**already ships per category**. So session-042 is not "prose vs structure"; it is "**also structure it
per-type, for a machine**," and the Working-Ontologist rule answers that exactly: **you mark up what a
consumer reads.** Build the gate that reads it and I am FOR; leave the gate unbuilt and the prose
(plus the signatures already shipped) is the minimum model that does the job. **My AFFIRM-condition,
Guarino's strongest argument, Cagle's withdrawal-test, and Baker's surviving "lie" all reduce to one
sentence: ship the consumer, and scope the markup to exactly what it reads.**
