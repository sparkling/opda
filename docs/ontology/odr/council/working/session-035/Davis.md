# SESSION-035 — Ian Davis (Devil's Advocate) — OPENING

**Role:** DA. Linked-data pragmatism; publish-first; minimal ontological commitment; YAGNI;
deployment realism (BBC, UK-Gov linked data). Genuinely-opposed methodology: change a *published*
model when a *consumer* needs it, never on taste.

**Proposition under test:** opda's evidence-class short/long alias pattern is an anti-pattern;
rigid subclass inheritance is the wrong model for evidence typing; evidence-kind should be a facet;
facets-vs-inheritance was never weighed.

**My job:** attack all three. A DA who quietly agrees has failed.

---

## Verified repo facts I am standing on

1. **`opda-claim.ttl` (read, lines 48–117).** Three `owl:equivalentClass`: `DocumentEvidence ≡ Document`,
   `ElectronicRecordEvidence ≡ ElectronicRecord`, `VouchEvidence ≡ Vouch`. `…Evidence` are canonical
   (`rdfs:subClassOf opda:Evidence`; `DocumentEvidence` *also* `⊑ opda:AttachedDocument`). Short names are
   exemplar-only aliases. `attestedBy rdfs:domain opda:VouchEvidence` (line 131) — a Vouch-ONLY backbone.
   `VouchEvidence` is `prov:wasAttributedTo` an Agent (an attestation), NOT a document.
2. **ODR-0026 §R3 (read).** The aliases are "documentation, not an entailment bridge." Under §R2 they are
   **not entailed**; "matches current behaviour (pyshacl `inference="rdfs"` never entailed `owl:equivalentClass`
   — it is OWL, not RDFS — so it is **not a regression**)." And verbatim: "Re-examining the alias pattern
   itself is an ADR-0011 question, out of scope here."
3. **ODR-0026 §Alternatives (read).** "Evaluate `equivalentClass` for the internal aliases only (a carve-out)
   — rejected here … revisit **only if a named consumer requires it**." This is the standing demand-pull bar.
4. **ODR-0009 §Rules (read).** "Evidence subtypes as `prov:Entity` subclasses … each `rdfs:subClassOf prov:Entity`
   and carrying its **type-specific facets** (`document_details`; `record.source`; `attestation`+`voucher`).
   A vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation. **Do not collapse
   the three evidence types into one pattern.**" R5 is normative and not under amendment.
5. **ODR-0008 §Q5a (read).** Value-spaces (`tenureKind`, `priceQualifier`, EPC band) are SKOS via `sh:in`,
   and `tenureKind` row says explicitly "sub-Kind via `skos:exactMatch`; **NEVER `owl:sameAs`**." This is the
   precedent for FACETING — but it is for *enumerated literal value-spaces*, not for typed entities that
   carry their own distinct object/datatype properties.
6. **ADR-0011 §Amendments (read).** The short-name handling via `owl:equivalentClass` was one of five
   ambiguities **independently affirmed as within-engineering** by the validation agent (commit `3d941c4`),
   not a worker shortcut.

## The honest gap I must NOT hide (it cuts at me)

`opda-claim-shapes.ttl` (read): the ONLY evidence shape is `opda:EvidenceIdentityKeyShape` with
`sh:targetClass opda:Evidence` — the **supertype**. There is **no leaf-targeting shape** and the
`sh:xone`-per-subtype dispatch promised by ODR-0009 §"SHACL over the PROV structure" is **NOT emitted**.

So my Q2 claim "subclasses give `sh:targetClass` for free and that buys consumers something *today*" is
**currently false at the leaf level**. I concede this up front — and turn it: the absence of leaf shapes
means there is **zero validation churn cost** to keeping the subclasses (nothing targets the leaves to
break), AND it means the proposition's premise that inheritance is "load-bearing rigid machinery" is
*also* overstated — right now it is three inert `rdfs:subClassOf` lines plus three inert
`owl:equivalentClass` lines. Nobody is paying for either. The honest question is therefore narrow:
*is there a consumer demand that makes a facet refactor worth its cost?* On the record: no.

---

## Q1 — Is the alias pattern an anti-pattern to retire?

**Verdict: `Q1: REJECT(no-op) — ballot: AGAINST` — the alias is a recorded, independently-validated,
runtime-inert within-engineering convenience; ODR-0026 §R3 already neutralised it; "smells bad" is not a
defect class and there is no consumer harmed.**

Argument:
- An anti-pattern is a recurring solution that **causes harm** (Brown et al., *AntiPatterns*, 1998 — an
  anti-pattern is a *commonly-repeated* practice with *negative consequences* and a known refactored
  solution). Three `owl:equivalentClass` lines, authored once, in one generated file, evaluated by nothing
  at load time (ODR-0026 §R2/§R3) — fails the "recurring" test AND the "negative consequence" test. It is
  not even a *pattern* in the AntiPatterns sense; it is a one-site alias.
- `owl:equivalentClass` is **standard W3C OWL 2** (OWL 2 Structural Specification §9.1; RDF-Based Semantics).
  Using a standard construct for exactly what it means — asserting two class IRIs denote the same class —
  is not an abuse. The objection would have to be that the construct is *unevaluated*; but ODR-0026 §R2
  makes EVERY `domain`/`range`/`equivalentClass` in the corpus unevaluated-by-design, and §R2 calls that
  "first-class modelling vocabulary … documentation and identity." You cannot single out three lines as an
  anti-pattern under a regime that ratifies authoring exactly those lines for exactly that reason.
- ODR-0026 §R3 already did the disposition this council is being asked to redo: "If a consuming SHACL shape
  must fire on short-name instances, that is resolved in the shape/exemplar layer … **not** by evaluating
  `owl:equivalentClass`. **Re-examining the alias pattern itself is an ADR-0011 question, out of scope here.**"
  The proposition is asking session-035 to re-open, six weeks later, a question two ratified ODRs deliberately
  parked pending demand. No demand has materialised.
- Deployment-realism (my own BBC/data.gov.uk practice): you do not rename published identifiers, or churn a
  byte-identity-pinned emitter, to satisfy an aesthetic. The short names exist because **15 diagnostic
  exemplars use them** (ADR-0011 §Amendments). Retiring the alias = either rename 15 exemplars (consumer-facing
  churn) or strand them. Both are *more* commitment and *more* risk than the status quo.

**Concession boundary (where I would move):** if a named consumer publishes data typed `a opda:Document`
and expects a shape targeting `opda:DocumentEvidence` to fire on it, then the alias is a *latent trap* (it
looks like it bridges and does not). That is a real defect class — silent under-validation. But ODR-0026 §R3
already names the fix (target both names / type exemplars canonically), and it is cheaper than retiring the
pattern. So even the steel-man resolves to "tighten the shape," not "retire the alias."

## Q2 — Rigid subclass vs facet for evidence typing (UFO rigidity; "evidence is a role")

**Verdict: `Q2: REJECT(keep-subclass) — ballot: AGAINST` — the three subtypes carry genuinely distinct
PROV-O backbones (`attestedBy` is Vouch-only; a vouch is an attestation not a derivation), ODR-0009 §R5
forbids collapse, and a gUFO Role/Quality facet is *heavier* ontological commitment than three
`rdfs:subClassOf` lines for zero consumer gain.**

Argument:
- The proposition equivocates on "rigid." `opda:VouchEvidence` is **not** asserting that the *document* is
  rigidly-and-forever evidence. The file comment already says "evidence is a role a document plays, not every
  document's Kind," and that is *modelled*: `DocumentEvidence ⊑ AttachedDocument` (the neutral Kind) AND
  `⊑ Evidence` (the role-bearing class). The role-vs-Kind distinction the proposition demands **already
  exists** in the artefact. What the proposition calls "rigid subclass inheritance" is actually the standard
  way to say "this entity, *qua evidence*, is of evidential subtype X" — which is exactly a phase/role
  partition, not a claim about the document's essence.
- **The subtypes are not interchangeable facet-values; they have different shapes.**
  `opda:attestedBy rdfs:domain opda:VouchEvidence` (verified, line 131): a vouch links to a `prov:Agent`;
  a document does not. `DocumentEvidence` additionally `⊑ opda:AttachedDocument` (filing metadata); the other
  two do not. ODR-0009 §R5: "each carrying its type-specific facets (`document_details`; `record.source`;
  `attestation`+`voucher`)." These are **disjoint property profiles**, not three values on one
  `hasEvidenceKind` slot. A facet model (`opda:Evidence` + `opda:evidenceKind ∈ {doc, record, vouch}`)
  would have to re-express every type-specific property as a conditional (`sh:xone` / `if evidenceKind=vouch
  then attestedBy …`) — pushing branching into **every shape and every query**, which is precisely the
  triple-explosion-and-conditional-soup that ODR-0026 §R2 and ODR-0005 §R5 exist to avoid.
- **UFO does not mandate a facet here.** Guizzardi (2005, Ch. 4) reserves anti-rigid Role/RoleMixin for
  sortals an individual moves *in and out of* during its life (Student, Customer). An evidence item's
  *evidential subtype* (is it a document, a register record, or an attestation?) does not flip during the
  item's life — a grant-of-probate does not become an API record. The thing that is role-like ("plays the
  evidence role") is **already** captured by `⊑ Evidence` over a neutral Kind (`⊑ AttachedDocument`). The
  three *sub*-classes partition by **provenance origin**, which is closer to a rigid sub-kind than to a phase.
  So the UFO-rigidity objection misfires: the genuinely anti-rigid layer is modelled; the subtypes are not
  the anti-rigid layer.
- **Cost asymmetry.** Three `rdfs:subClassOf` lines vs. a gUFO `Role`/`Quality` reification (which drags in
  `gufo:` import, `gufo:Role`/`gufo:RoleMixin`/`gufo:mediates` machinery, and a relator to bind the role to
  its bearer). My YAGNI rule: a facet is *more* ontology, not less. "Minimal ontological commitment" — my
  actual published methodology — points AT the three subclasses, AGAINST the facet.

**Concession boundary (where I would move):** if a consumer needed to query "all evidence regardless of
subtype, with a single uniform property set" AND that uniform set genuinely subsumed the three profiles, a
facet would reduce their join complexity. But (a) `opda:Evidence` supertype + `opda:digest` already gives the
uniform cross-cutting query (the shapes file targets exactly that), and (b) no such consumer is on the record.

## Q3 — Disposition + migration + interaction with ODR-0025/0026 + ADR-0011

**Verdict: `Q3: REJECT(no-migration) — ballot: AGAINST` — there is zero demand-pull; ODR-0026 §Alternatives
already set the bar ("revisit only if a named consumer requires it"); a migration churns the byte-identity
emitter, the shapes, the annotations, ADR-0011's confirmation criteria and 15 exemplars for no consumer.**

Argument:
- **Demand-pull bar, already ratified.** ODR-0026 §Alternatives rejected the equivalentClass carve-out and
  fixed the re-open condition as a *named consumer*. Two ratified ODRs (0025 proposed, 0026 proposed, both
  dated today 2026-06-01) just drew this exact line. session-035 has produced **no consumer**, only a taste
  argument. Under my methodology that is dispositive: no consumer, no published-model change.
- **Migration blast radius (concrete).** Retiring the alias / moving to a facet touches: (1) `opda-gen` emitter
  + its byte-identity CI pin (ADR-0011 §Confirmation criterion 2 "Byte-identity CI green per module"); (2)
  `opda-claim.ttl` class block; (3) `opda-claim-shapes.ttl` (re-author EvidenceIdentityKeyShape + add the
  conditional dispatch a facet needs); (4) `opda-claim-annotations.ttl`; (5) the 15 diagnostic exemplars that
  type `a opda:Document` etc (ADR-0011 §Amendments); (6) ADR-0011 itself (its validated disposition on the
  short-name handling, commit `3d941c4`, would be reversed); (7) ODR-0009 §R5 ("do NOT collapse") would need
  a council amendment if the facet collapses the subclasses. That is a corpus-wide re-pin against zero pull.
- **Interaction with ODR-0025/0026 is *stabilising*, not motivating.** ODR-0026 §R3 *already* solved the only
  operational worry (short-name instances not matching canonical-targeted shapes): it is documented as a
  shape-layer fix, and the closure-correctness test (ADR-0035 §Confirmation, cited in ODR-0026 §Consequences)
  *asserts* no equivalentClass-derived triple appears in the inferred graph. So the alias is not just inert —
  its inertness is **under test**. Nothing is leaking. There is no entailment-safety reason to act.
- **The only thing I will sign:** a one-line ODR-0026 §R3 follow-up (or ADR-0011 §Amendment) recording the
  *latent-trap* note from my Q1 concession — "shapes targeting a canonical evidence class do not fire on
  short-name instances; target both names if a consumer publishes short names" — so the trap is documented,
  not sprung. That is a *documentation* action, costs no emission re-pin, and is the maximal honest response
  to the proposition's legitimate kernel.

---

## Ballots (opening)

- `Q1: REJECT(no-op) — ballot: AGAINST` — recorded, validated, runtime-inert convenience; ODR-0026 §R3
  neutralised it; not an AntiPattern (Brown 1998: needs recurrence + harm); `owl:equivalentClass` is W3C OWL 2.
- `Q2: REJECT(keep-subclass) — ballot: AGAINST` — disjoint PROV-O backbones (`attestedBy` Vouch-only,
  ODR-0009 §R5 "do NOT collapse"); the role/Kind split is *already* modelled (`⊑ AttachedDocument` ∧ `⊑ Evidence`);
  a gUFO facet is heavier commitment (Guizzardi 2005 Ch. 4 — Roles are for life-cycle phase flips, which the
  subtype is not).
- `Q3: REJECT(no-migration) — ballot: AGAINST` — no named consumer; ODR-0026 §Alternatives bar unmet; migration
  re-pins the byte-identity emitter + 15 exemplars + shapes + ADR-0011's validated disposition for zero pull.
  Maximal concession: a one-line latent-trap doc note (no re-pin).

---

# FINAL POSITION (after cross-talk with Guizzardi + Guarino; Cagle did not reply in window)

## What cross-talk changed (and the verification that forced it)

I sent objections to Guizzardi, Guarino, Cagle. Guizzardi and Guarino engaged; Cagle did not
reply before I finalised (noted — I proceed). Two things moved me, and both are grounded in
re-verification I did during the round, not in being talked round:

**1. My opening cost argument was wrong by 5×, and I checked it myself.** I claimed retiring the
alias churns "15 exemplars." Verified false: the short names are typed in exactly **THREE** places —
`exemplars/claim-with-{document,electronic-record,vouch}-evidence.ttl`, one line each
(`a opda:Document` l.44 / `a opda:ElectronicRecord` l.44 / `a opda:Vouch` l.45). Those exemplars are
**hand-authored** (no `DO NOT HAND-EDIT` header) — editing them does NOT touch the byte-identity-pinned
emitter output. The BASPI5 round-trip (`tests/baspi5_round_trip/`) and the opda-gen test suite reference
only the **canonical** `…Evidence` names (`test_annotations.py`, `emitters/modules/claim.py`) — **zero**
dependency on short names. So Guarino's "cheap migration, no forced ABox/byte-identity churn" claim is
**correct**: retiring the alias = delete 3 short-name class blocks in `emitters/modules/claim.py`
(l.209–225 etc.) + re-`emit` + `ci-byte-identity` (a routine re-pin, not a catastrophe) + retype 3
exemplar lines canonically + a one-line ODR-0026 §R3 / ADR-0011 amendment note. Real, small, reversible.

**2. Both domain experts REJECT the proposition's actual claim (the facet).** This is the decisive
finding. The proposition says "evidence-kind should be a facet." Neither Guizzardi nor Guarino defends
that. Guizzardi: "facet-AND-Kind — the bearers stay as Kinds." Guarino: a RoleMixin *played-by* a
neutral Kind, NOT a value-space facet. Both want the **role-of-a-Kind** recast that the corpus ALREADY
has for Document (`DocumentEvidence ⊑ AttachedDocument ∧ ⊑ Evidence`). So the proposition's framing
("facets-vs-inheritance was never weighed → use a facet") loses on the merits to *both* the UFO and
the OntoClean expert, not just to the DA.

## The disanalogy that survives (my standing technical point)

A value-space facet (`opda:Evidence` + `opda:evidenceKind ∈ {document, electronic_record, vouch}`) is
the WRONG instrument here, and the §Q5a SKOS-faceting precedent (`tenureKind`, `priceQualifier`) does
**not** transfer — because those facets are Qualia over a single bearer whose **property signature does
not change with the value**. Evidence subtype is different: the "value" determines the entity's
property signature. Verified: `opda:attestedBy rdfs:domain opda:VouchEvidence` (l.131) — only a vouch
links to a `prov:Agent`; `DocumentEvidence` *additionally* `⊑ opda:AttachedDocument` (l.60) — only a
document carries filing metadata. A Quale never changes which object-properties or which superclass
apply; this discriminator does. Collapsing it onto one `evidenceKind` slot forces `sh:xone`/conditional
branching into every shape and query (the soup ODR-0026 §R2 / ODR-0005 §R5 exist to avoid) and
re-admits exactly the straddler failure Guarino's session-029 panel rejected for module boundaries.
ODR-0009 §R5 ("do NOT collapse the three evidence types") is the ratified statement of this and is
**not under amendment** by the proposition.

## Verdicts

### Q1 — Is the alias pattern an anti-pattern to retire?

**WITHDRAW.** Verbatim rationale that won me over: *the alias's only defensible support was migration
cost, and on verification that cost is 3 hand-authored exemplar lines + a routine byte-identity re-pin,
not a corpus churn; with the cost gone, the alias is a recorded latent trap (a shape targeting
`opda:DocumentEvidence` silently does not fire on an instance typed `a opda:Document` — confirmed: the
only emitted evidence shape targets the supertype `opda:Evidence`, and ODR-0026 §R3 already names the
fix as "type exemplars with the canonical class") that buys nothing once you see it serves only 3
exemplar lines — so retiring it by typing those 3 exemplars canonically is strictly better, and that is
my own published rule (change the model when the cost is near-zero and it removes a real defect).*
I withdraw to the **canonical recast** (retype 3 exemplars `a opda:DocumentEvidence`/etc.; drop the
3 alias classes + 3 `owl:equivalentClass` lines), **NOT** to a facet, and **NOT** to keeping the alias.
The proposition is right that the alias should go; it is wrong about why it matters (it overstates
present harm — ODR-0026 §R2/§R3 make it inert — and the real reason is the cheap removal of a latent
shape trap).

### Q2 — Rigid subclass vs facet for evidence typing (UFO rigidity; "evidence is a role")

**HOLD.** Principled dissent: the proposition's prescription — *a facet* — is wrong, and both the UFO
expert (Guizzardi) and the OntoClean expert (Guarino) agree the bearer Kinds stay and the recast is to
**role-of-a-Kind**, not a value-space facet. The genuinely anti-rigid layer ("a document plays the
evidence role") is ALREADY modelled (`⊑ AttachedDocument` ∧ `⊑ Evidence`, ODR-0024 §R7); the three
subtypes carry disjoint property signatures (`attestedBy` Vouch-only; `⊑ AttachedDocument`
Document-only) that a Quale-facet would destroy, violating ODR-0009 §R5 and re-admitting the
session-029 straddler failure. I concede the narrower true kernel — **`DocumentEvidence`/`ElectronicRecordEvidence`
read as Roles, so the correct form is role-of-a-Kind (RoleMixin played-by / `⊑` a neutral bearer Kind),
which the corpus already does for Document and should mirror for the other two** — but that is the
*opposite* of the proposition's facet and I will not sign "use a facet."
**Single named re-open trigger:** a named consumer query that must retrieve all evidence through one
uniform property set genuinely subsuming the three disjoint profiles (at which point a facet would cut
their join complexity); absent that, role-of-a-Kind subclasses stand.

### Q3 — Disposition + migration + interaction with ODR-0025/0026 + ADR-0011

**WITHDRAW (on alias retirement) / HOLD (against facet migration).** Verbatim rationale that won me
over on the alias: *the migration I feared does not exist — verified 3-exemplar-line + routine-re-pin
footprint, no ABox churn, no BASPI5/test breakage — so ODR-0026 §Alternatives' demand-pull bar ("revisit
only if a named consumer requires it") is satisfied not by a consumer but by the fact that the fix is
near-free and removes a documented latent trap; under my own methodology a near-zero-cost correctness
improvement does not need to wait for a consumer.* Disposition I sign:
1. **Retire the alias via canonical recast** (per Q1): drop the 3 short-name classes + `owl:equivalentClass`
   in `emitters/modules/claim.py`; retype the 3 exemplars to `…Evidence`; re-`emit`; `ci-byte-identity`
   re-pin. Record as an **ADR-0011 §Amendment** (the within-engineering disposition that introduced the
   alias is the right home to reverse it) and a one-line **ODR-0026 §R3** follow-up noting the alias is
   removed (so R3's "resolve in the shape/exemplar layer" is now realised as "exemplars typed canonically").
2. **Keep the three subclasses** as role-of-a-Kind (Document already `⊑ AttachedDocument`; consider the
   same neutral-bearer treatment for the other two if/when a bearer Kind is warranted — held, not forced).
   **No facet.** ODR-0009 §R5 stands unamended.
3. **Interaction with ODR-0025/0026 is stabilising, not motivating**: §R2/§R3 already made the alias
   inert and ADR-0035 §Confirmation already *tests* that no `equivalentClass`-derived triple appears in
   the closure. Retiring the alias only *reduces* the surface those guarantees must cover; nothing in
   the entailment regime needs to change.
**Single named re-open trigger (against ever adding a facet):** same as Q2 — a named uniform-evidence
consumer query.

## Ballots (final)

- `Q1: REVISE(retire-alias-via-canonical-recast) — ballot: FOR — withdraw: the alias's sole support
  (migration cost) is verified to be 3 hand-authored exemplar lines + a routine byte-identity re-pin,
  not corpus churn; retiring it removes a latent shape trap (only the supertype Evidence shape is emitted;
  ODR-0026 §R3 names the canonical-typing fix) and buys nothing to keep. Citation: opda-claim.ttl l.48–117;
  exemplars l.44/44/45 (un-headered, hand-authored); ODR-0026 §R2/§R3; ADR-0011 §Amendments.`
- `Q2: REJECT(facet) / REVISE(role-of-a-Kind) — ballot: AGAINST the facet, FOR role-of-a-Kind — HOLD:
  the proposition's facet destroys disjoint property signatures (attestedBy Vouch-only, l.131; ⊑AttachedDocument
  Document-only, l.60), violating ODR-0009 §R5 "do NOT collapse" and re-admitting the session-029 straddler
  failure; both Guizzardi (UFO) and Guarino (OntoClean) keep the bearer Kinds and recast to role-of-a-Kind,
  which the corpus already does for Document (ODR-0024 §R7). Re-open: a named uniform-evidence consumer query.
  Citation: Guizzardi 2005 Ch.4 (Roles for life-cycle phase, which evidential subtype is not); ODR-0009 §R5;
  ODR-0008 §Q5a / session-029 (straddler rejection); opda-claim.ttl l.60, l.117, l.131.`
- `Q3: REVISE(cheap canonical recast; no facet; no no-op) — ballot: FOR the recast, AGAINST facet-migration —
  WITHDRAW on retirement / HOLD on facet: migration is verified near-free (3 exemplar lines + re-pin, no ABox,
  no BASPI5/test breakage), so the alias goes now via ADR-0011 §Amendment + ODR-0026 §R3 follow-up; the three
  role-of-a-Kind subclasses stay; ODR-0025/0026 are stabilising not motivating (ADR-0035 §Confirmation already
  tests the alias inert). Re-open against a facet: a named uniform-evidence consumer query. Citation: ODR-0026
  §Alternatives (demand-pull bar) + §R3; ADR-0035 §Confirmation; ADR-0011 §Amendments; emitters/modules/claim.py
  l.187–225; tests/baspi5_round_trip + test_annotations.py (canonical-only).`

## One-line summary of the DA's net movement

The proposition is **half right and prescribes the wrong cure**: the alias SHOULD be retired (I withdraw —
it's near-free and removes a latent trap), but evidence-kind should **NOT** become a facet (I hold, *with*
both domain experts) — the disjoint PROV-O property signatures make role-of-a-Kind subclasses correct and a
value-space facet an OntoClean regression that ODR-0009 §R5 forbids.

## Addendum — late cross-talk with Knublauch (SHACL) + a verified emission DEFECT for Kendall

Knublauch engaged after I filed, arguing the subclass model produces silent passes. I verified all
three of his claims against the emitted tree and they are **TRUE** — and they SHARPEN my position:

- **(A) Alias-only instances escape ALL targeting — worse than "latent."** The 3 exemplar evidence nodes
  type `a opda:Document , prov:Entity` (verified, l.44/44/45) — short name + `prov:Entity`, NEVER
  `a opda:Evidence` and never the canonical `…Evidence`. So the ONLY emitted evidence shape,
  `EvidenceIdentityKeyShape sh:targetClass opda:Evidence` (opda-claim-shapes.ttl:36), does NOT match
  them — with or without subclass materialisation — because the node is never typed `opda:Evidence`
  and `owl:equivalentClass` is unevaluated (ODR-0026 §R3). This makes my Q1 "latent trap" an **ACTIVE
  silent-pass today** — strengthening WITHDRAW, not weakening it.
- **(B) Supertype targeting is entailment-dependent** (ODR-0010 Core-only vacuous pass). Confirmed.
- **(C) The promised `sh:xone` per-subtype dispatch was NEVER EMITTED.** `opda:Evidence`'s comment
  (opda-claim.ttl:83), ODR-0009 §"SHACL over the PROV structure", and all 3 exemplars' prose PROMISE an
  `sh:xone`-on-evidence-type dispatch validating per-subtype properties. **Zero** such shape exists
  (the only claim-space `sh:xone` is baspi5 `sellersCapacity`, unrelated). ODR-0009's "provenance is
  *validated*, not merely described" is, on the emitted evidence, **aspirational** — a real defect.

**DEFECT FOR KENDALL (independent of the proposition):** the per-subtype evidence validation ODR-0009
ratified is unimplemented, and the alias-only exemplar typing means even supertype validation misses
the evidence nodes. This is worth a finding regardless of how Q1/Q2/Q3 resolve.

**Why this does NOT vindicate the facet.** Knublauch's own proposed idiom — `sh:targetSubjectsOf` +
`sh:in` — is ALREADY the ratified emitted VALUE-SPACE pattern in this corpus (`ownerType`,
`priceQualifier`, `constructionType`, `ofstedRating`… ODR-0024 §R5/R6; ~10 shapes in
`opda-descriptive-shapes.ttl` + `opda-agent-shapes.ttl`). Because `sh:targetSubjectsOf` fires on the
SUBJECT of a property, the correct fix targets the **already-disjoint discriminating properties**:
`sh:targetSubjectsOf opda:apiEndpoint` (electronic-record), `…opda:attestedBy`/`opda:attestationStatement`
(vouch), `…opda:documentReference` (document). That closes (A)+(B)+(C) with **no entailment dependency
and no new `evidenceType` slot** — i.e. validation-by-property-signature, the operational form of my
"disjoint signatures" argument. A value-space `evidenceType` facet does the opposite: it mints a NEW
discriminator and re-expresses the disjoint profiles as `sh:xone`-on-`evidenceType` conditional soup —
exactly what ODR-0009 §R5 / ODR-0026 §R2 forbid. So the SHACL gap argues FOR per-discriminating-property
shapes over canonical types, AGAINST the facet. My ballots stand; the disposition gains a 4th item:

4. **Emit the missing per-subtype validation** via `sh:targetSubjectsOf` on the existing disjoint
   discriminating properties (ADR-0012 / ODR-0009 §"SHACL over the PROV structure" realised at last) —
   targeting the canonical `…Evidence` types after the Q1 recast. No `evidenceType` facet; no new property.

(One reply sent to Knublauch — I did not reopen with Guizzardi/Guarino. Cagle still silent.)

## Addendum 2 — cross-talk with Baker (governance/DCMI) + the constructive middle path

Baker engaged advocating a governed SKOS `opda:EvidenceKindScheme` + retire the aliases + **keep the
`…Evidence` subclasses as structure-bearers bound to scheme concepts via `skos:exactMatch`**. On
inspection this is NOT the proposition's facet — it is the ratified **`tenureKind` pattern** (ODR-0011
l.187/202/215: a Substance-Kind-label SKOS scheme bound to the OWL sub-class hierarchy via
`skos:exactMatch`, "NEVER `owl:sameAs`"; opda already runs BOTH layers for tenure). Baker explicitly
"NOT collapsing the hierarchy." So Baker, like Guizzardi and Guarino, **keeps the subclasses** and
**rejects the proposition's "facet instead of inheritance."** That is now four panelists (+ me) keeping
the subclasses; the proposition's headline has no defender on the record.

**Concession I make to Baker's extensibility case (his strongest card):** for a genuine VALUE addition
that fits an existing property signature, SKOS is unambiguously cheaper to extend (one `skos:Concept` +
`dct:source` vs a wasteful new class). I grant this fully. **But his own examples defeat the facet
conclusion:** OIDC4IDA's added types `electronic_signature` and `bill` are NOT new property signatures —
a bill is a document-with-issuer, an e-signature a record-with-digest — so they are SKOS *values of an
existing subtype* (the tenureKind sub-Kind-label move), NOT new subclasses. 2 new OIDC types → 0 new
structural subtypes. The class explosion the facet guards against does not occur, because the three
subclasses partition by **property signature** (`attestedBy` Vouch-only l.131; `⊑ AttachedDocument`
Document-only l.60), not by value. And ODR-0011 §Alternatives — which Baker cites — rejected OWL classes
for **enum value-spaces** (its example is `Detached`, a built-form value with no properties); it does not
reach entity types with disjoint property signatures. Mapping evidence subtypes onto the `Detached`
precedent is a category slip.

**Refined disposition (supersedes nothing; sharpens item 2):** the constructive answer that satisfies
Baker's governance/extensibility aim AND my anti-facet hold AND Knublauch's targeting gap is a single
coherent package — the **tenureKind pattern applied to evidence**:
- Retire the 3 short-name aliases (Q1).
- KEEP the three `…Evidence` OWL subclasses as structure-bearers (Q2 — role-of-a-Kind; Document already
  `⊑ AttachedDocument`).
- ADD a governed `opda:EvidenceKindScheme` (SKOS) with a steward (`dct:creator`, ODR-0011 l.96) and an
  explicit open/closed policy, **`skos:exactMatch`-bound to the three subclasses (NEVER `owl:sameAs`)** —
  this gives Baker cheap value-extensibility for OIDC4IDA sub-flavours without minting classes.
- Emit per-subtype validation via `sh:targetSubjectsOf` on the disjoint discriminating properties
  (`apiEndpoint`/`attestedBy`/`documentReference`) — closes Knublauch's (A)/(B)/(C) with no entailment
  dependency (Q3 item 4).

**The one remaining fork for Kendall:** IF Baker's `opda:evidenceKind` property is a `skos:exactMatch`-bound
kind-LABEL on the bearer (the tenureKind move) — **I sign it; no dissent.** IF it is meant to REPLACE the
subclass as the SHACL dispatch discriminator (shapes branch on `sh:in` over `evidenceKind` instead of
targeting the class/property) — **I HOLD**: that is the `sh:xone`-conditional-soup collapse ODR-0009 §R5
forbids, and it is unnecessary given `sh:targetSubjectsOf` on the existing disjoint properties.

**Governance costs in the SKOS path I flagged to Baker (he was underweighting):** (1) the `sh:in`
regeneration discipline (ODR-0011 §5a) couples every scheme edit to a shape re-emit + byte-identity
re-pin — "add one concept" is really "add one concept + regenerate + re-pin"; (2) open-vs-closed
stewardship must be declared or the OIDC4IDA-tracking scheme drifts. Cheaper-to-extend ≠ free-to-govern.

(One reply sent to Baker. Cagle engaged late — see Addendum 3, which supersedes the "Cagle did not engage"
note. I gave each of the five who pinged me — Guizzardi, Guarino, Knublauch, Baker, Cagle — one substantive
exchange; I am not reopening any.)

## Addendum 3 — cross-talk with Cagle (ontologist) + a VERIFIED new fact that moved me further

Cagle engaged late with a repo fact I did NOT have, and I verified it before answering. It is correct and
it moves me — the honest DA outcome.

**VERIFIED: the evidence-kind discriminator is already minted TWICE; one copy is orphaned.**
`opda:EvidenceMethodScheme` (opda-vocabularies.ttl l.179-187 + l.1108-1130) is a ratified SKOS
ConceptScheme — members {Document, Electronic-Record, Vouch}, sourced to the SAME OIDC4IDA spec ODR-0009
cites, `opda:ufoCategory "Quality Value"`, steward "Moreau (S009 Q3)". I grepped the whole tree: it is
referenced by **NOTHING** outside the vocab file + its emitter (`vocabularies.py:1016`) + its test. So the
corpus minted the discriminator once as the subclass tree (with the 3 aliases) and once as this coded-value
scheme **wired to nothing**. Cagle's citation is exact and his "orphaned" charge is true.

**Two concessions this forces (genuine DA movement, grounded in the new fact):**
1. **Cagle's reframing of the anti-pattern is right.** The defect is not *using* `owl:equivalentClass`; it
   is *needing* it — the alias exists only because the subclass choice created a long/short name pair that
   then had to be glued. I accept that framing.
2. **My "no demand-pull" framing on Q3 is now wrong, and I withdraw it.** Cagle asked directly whether a
   ratified-but-orphaned scheme counts as pull under the ODR-0026 §Alternatives bar. **It does** — a ratified
   scheme wired to nothing is an unfinished obligation, not a hypothetical consumer. That clears the bar I
   was standing on. And his **phased** Q3 (ratify target now + documentary-retention for one release per
   ODR-0026 §R2 + re-type exemplars + then re-word ADR-0011/ODR-0009; NO big-bang emitter re-pin this
   release) is exactly the low-cost path my own methodology endorses. I sign the phasing.

**Where I HOLD — and Cagle's own evidence forces the distinction, it is not a dodge.**
`EvidenceMethodScheme` is the **method-of-obtaining Quality Value**, NOT the evidence **entity-type**. Its
own definition (vocabularies.py:1019): "Quality Values for the **METHOD by which** identity evidence was
**OBTAINED**"; `ufoCategory "Quality Value"`; steward S009 **Q3** (the assurance/method axis); members
defined as ways of obtaining ("obtained by inspecting a document"). ODR-0009 deliberately mints **three
distinct SKOS families** — l.72 verbatim: "**Method, evidence-type AND assurance-level** SKOS concepts" —
and routes the *method* scheme to `validation_method`/`verification_method` in the assurance layer **around**
PROV (l.47; l.158 diagram), while l.37 keeps "Evidence subtypes as `prov:Entity` subclasses … **Do not
collapse**." opda's own design therefore has BOTH a method-Quality-Value AND entity-subclasses, on purpose;
they share the three OIDC4IDA labels only because OIDC4IDA's `evidence.type` does double duty
("what kind of thing" *and* "how obtained"). A Quality Value never carries an object-property signature —
so wiring up the scheme does NOT dissolve `VouchEvidence`/`DocumentEvidence` (whose `attestedBy` l.131 and
`⊑ AttachedDocument` l.60 are entity-structure, not method-values).

**Net disposition after Cagle (this is my settled, signed position):**
1. **Retire the 3 short-name aliases** [Q1 — with Cagle/Baker/Guarino/Guizzardi].
2. **WIRE UP the orphaned `EvidenceMethodScheme`** as a Quality-Value property (`opda:evidenceMethod`,
   `sh:in`-bound to the scheme) on the Verification/Claim — closing a real, corpus-owned defect. The §Q5a
   value-space move; I sign it [NEW — with Cagle; this is the orphan fix].
3. **KEEP the three entity-subclasses** as structure-bearers, `skos:exactMatch`-bound to the scheme à la
   tenureKind [Q2 — hold against collapse].
4. **Phased / documentary-retention migration**, no big-bang byte-identity re-pin this release [Q3 — with
   Cagle].
The single thing I still refuse: collapsing the entity-subclasses **into** the method-facet (ODR-0009 l.37
"do not collapse" + the disjoint signatures). **The live fork for Kendall:** is the proponents'
`evidenceType` property the scheme-bound Quality-Value wired to the orphan (→ I sign, no dissent) or a
replacement for the entity classes (→ I hold)?

## Ballots — FINAL (revised by Cagle's verified orphaned-scheme fact)

- `Q1: REVISE(retire-alias) — ballot: FOR — the alias is a needed-glue symptom of the long/short pair; retire it.`
- `Q2: REJECT(facet-replacement) / REVISE(keep entity-subclasses as structure-bearers, skos:exactMatch-bound
  to EvidenceMethodScheme à la tenureKind) — ballot: AGAINST collapsing classes into the facet, FOR the
  exactMatch-bound dual layer. Grounds: ODR-0009 l.37 "do not collapse" + disjoint signatures (attestedBy
  l.131, ⊑AttachedDocument l.60); EvidenceMethodScheme is the METHOD Quality-Value (l.72, ufoCategory
  "Quality Value", S009 Q3), not the entity-type.`
- `Q3: REVISE(retire aliases + WIRE UP the orphaned EvidenceMethodScheme as a Quality-Value property +
  keep exactMatch-bound entity-subclasses + per-discriminating-property sh:targetSubjectsOf shapes; PHASED,
  documentary-retention, no big-bang re-pin) — ballot: FOR. Withdraw "no pull": the ratified-orphaned scheme
  is an unfinished obligation that clears ODR-0026 §Alternatives. Hold only against collapsing entity classes
  into the method-facet.`
