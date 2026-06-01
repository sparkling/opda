# Session-035 — Tom Baker (DCMI / namespace + vocabulary governance) working position

**Lens:** Dublin Core Metadata Initiative; URI/namespace design; metadata-standards
governance; SKOS concept-scheme stewardship; DCMI Usage Board discipline. I judge the
artefact as a *catalogue* — what does it cost to govern, extend, and dereference over a
ten-year retention horizon — not as a logician or a foundational ontologist.

**Artefact under review** (`opda-claim.ttl` ~25–140): a five-member evidence type hierarchy
`opda:Evidence` ⊐ {`DocumentEvidence`, `ElectronicRecordEvidence`, `VouchEvidence`} as
`owl:Class`es under `rdfs:subClassOf`, PLUS three *second* `owl:Class`es minted as short-name
aliases (`opda:Document`, `opda:ElectronicRecord`, `opda:Vouch`) bound to the canonical
`…Evidence` classes by `owl:equivalentClass` (ADR-0011 within-engineering option (b)). The
short names are "exemplar-only"; shapes and annotations target the long names.

---

## OPENING

### Framing: this is a catalogue-hygiene question, and the catalogue already owns the answer

The proposition asks whether evidence-kind should be a *facet* rather than rigid
subclass-inheritance, and whether facets-vs-inheritance was ever weighed. From the
vocabulary-governance chair the question is sharper and already half-answered by opda's own
record: **opda has a ratified, operating mechanism for exactly this shape of problem — a
governed SKOS concept scheme keyed by a UFO meta-category — and it was adopted precisely
*because* OWL-class-per-value was weighed and rejected.** The evidence-kind triad is the one
place in the corpus where that ratified mechanism was bypassed, and a *second* OWL class per
kind was minted on top. That is the anti-pattern — not the subtyping per se, but the
**alias layer** and the **failure to route a closed, regulator-anchored value-space through
the SKOS substrate the project already runs.**

The decisive fact: **the facet substrate already exists and already holds the authoritative
evidence vocabulary.** `opda-vocabularies.ttl` declares `opda:EvidenceMethodScheme`
(`skos:prefLabel "Evidence Method"`, `dct:source` → the OIDC4IDA spec,
`opda:ufoCategory "Quality Value"`, steward Moreau) whose members are "inherited verbatim from
OpenID Connect for Identity Assurance 1.0 `evidence` type per ODR-0011 §4a regulator-citation
discipline" (`opda-vocabularies.ttl:179–187`). The OIDC4IDA `evidence.type` taxonomy is
*the very thing* `DocumentEvidence` / `ElectronicRecordEvidence` / `VouchEvidence` re-encode
— OIDC4IDA's evidence types are `document`, `electronic_record`, `vouch`, `electronic_signature`,
`bill` (OpenID Connect for Identity Assurance 1.0, §5.1.1 `evidence` element). opda has minted
OWL classes for three members of an external regulator's controlled vocabulary that it
*already carries as a SKOS scheme*. That is a governance defect by DCMI Usage Board lights:
**one authoritative concept, two competing representations, two maintenance surfaces.**

### Q1 — Is the alias pattern an anti-pattern to retire? **AFFIRM (retire the aliases).**

I separate two things the proposition runs together, because they have different verdicts:

**(1) The `owl:equivalentClass` short-name alias layer — retire it. It is dead weight by the
project's own ratified entailment regime.** Three independent grounds, each citeable:

- **It is inert under opda's entailment closure.** ODR-0025 §R2 *excludes* `owl:equivalentClass`
  from the load-time closure ("uncontrolled bidirectional propagation + transitive explosion",
  anchored to hm ODR-0036 / S32b). ODR-0026 §R3 confirms an instance typed only with the short
  name is **not** inferred to be the canonical class, and that "this matches current behaviour
  (pyshacl `inference="rdfs"` never entailed `owl:equivalentClass`)." So the alias buys **zero**
  reasoning: it does not let a short-name-typed exemplar satisfy a shape targeting the canonical
  class. The justification in the alias's own `rdfs:comment` — "owl:equivalentClass binding
  ensures one OWL identity" (`opda-claim.ttl:51,67,106`) — is *only* true for an external OWL-DL
  reasoner opda explicitly does not run (ODR-0025 §Decision: "full OWL DL classification
  explicitly out of scope"). The aliases are a promise the engine never keeps.

- **It is a duplicate-term catalogue defect.** DCMI Usage Board practice (DCMI *Usage Board
  Process*, and the broader namespace-governance discipline behind DCMI Metadata Terms) treats
  **one concept = one canonical URI**. Minting `opda:Document` *and* `opda:DocumentEvidence` for
  one concept creates two dereferenceable URIs a downstream consumer can land on, two `rdfs:label`
  surfaces, two things to deprecate, and an `owl:equivalentClass` edge that must be maintained in
  lockstep. opda already has a CI gate against exactly this smell — `ci-dup-declaration`
  (ODR-0024 §Consequences) — and a ratified anti-duplication rule: ODR-0024 R2 forbids "minting a
  duplicate" of a canonical predicate and ODR-0024 R7 warns the `Document`≡`DocumentEvidence`
  conflation entails "every attached doc is … evidence." The alias layer is the same hazard one
  level up: a synonym ring maintained by hand.

- **The stated need is a fixture-naming convenience, met better elsewhere.** The aliases exist
  so the diagnostic exemplar set can write `a opda:Document`. ODR-0026 §R3 already states the
  correct disposition for that need: "resolved in the shape/exemplar layer (target both names, or
  type exemplars with the canonical class), **not** by evaluating `owl:equivalentClass`."
  Retiring the alias and **renaming the exemplars to the canonical `…Evidence` type** is a
  one-line-per-exemplar edit that removes three `owl:Class` declarations, three
  `owl:equivalentClass` edges, and the whole synonym-maintenance burden. A short label belongs in
  `skos:altLabel`/`rdfs:label`, never in a second class URI (SKOS Reference 2009, §5: alternative
  lexical labels are `skos:altLabel`, not new resources).

  *Verdict 1:* **`Q1: REVISE` (retire the alias layer; keep the typing question for Q2)** —
  `ballot: FOR` retiring — grounded in ODR-0025 §R2 + ODR-0026 §R3 (inert under closure) and
  DCMI one-concept-one-URI + ODR-0024 R2/R7 (duplicate-term defect).

**(2) "Rigid subclass inheritance is wrong for evidence typing" — this is the substantive Q2
question, and my governance answer is: the *kind* axis should be a governed SKOS facet; the
three OWL subclasses should be kept ONLY to the extent they carry type-specific structure a
scheme cannot.** See Q2.

### Q2 — Governed SKOS concept scheme vs OWL-class-per-kind for evidence typing? **REVISE → governed SKOS `EvidenceKindScheme` facet, with the OWL subtypes demoted to whatever genuinely bears distinct properties.**

This is the heart of my chair. opda's *whole* enumeration strategy is "the kind axis of a
thing is a SKOS facet, not a class tree," and it was ratified against the precise alternative
on the table here.

**The ratified precedent is directly on point and was decided the other way:**

- **ODR-0011 §Alternatives rejects OWL-class-per-value by name, citing me.** "OWL enumerated
  classes (`owl:oneOf` / subclassing) — model each enum as an OWL class … **Fatal flaw:**
  conscripts a reasoner to police membership of a hand-curated list — machinery without a
  purpose — and misclassifies vocabulary terms (`Detached`) as either individuals or classes
  (Baker/Knublauch, Q5)" (ODR-0011 §Alternatives). The evidence triad *is* a hand-curated,
  regulator-sourced list of kinds. By ODR-0011's own logic, `Document`/`ElectronicRecord`/`Vouch`
  are vocabulary terms mis-cast as classes — the same defect as casting `Detached` as a class.

- **ODR-0024 R6 + R4 set the live "coded-value over class-per-value" precedent, *post-dating*
  ODR-0009.** R6 mints `opda:ConstructionTypeScheme`, `opda:OfstedRatingScheme`, etc. as SKOS
  rather than class-per-value; R4 is explicit that range-less per-value object properties
  (`opda:primary`/`opda:private` for school bands) are **"namespace landmines"** and must instead
  be ONE `opda:schoolType` datatype property over `opda:SchoolTypeScheme`. ODR-0024 R7 corrects a
  *class-per-value* mis-step in this very evidence module. The trajectory of the corpus from
  ODR-0011 → ODR-0024 is monotone: **the council keeps choosing the governed scheme over the
  class tree.** The evidence triad is a survival from before that precedent hardened.

- **The Substance-Kind-label pattern shows the migration is already a solved, idiomatic move.**
  `opda:TenureKindScheme` and `opda:OwnerTypeScheme` (`opda-vocabularies.ttl:289–297, 389–397`)
  are SKOS schemes whose members bind to OWL sub-Kinds via `skos:exactMatch` — "NEVER `owl:sameAs`
  per ODR-0005 Anti-pattern §5." This is the governance template the evidence triad should have
  followed: a `skos:Concept` per kind in a scheme, and — *where and only where* an OWL subclass is
  independently warranted — a `skos:exactMatch` from the concept to that class. It gives you the
  facet (governable, dereferenceable, extensible, regulator-anchored) without the synonym ring.

**Concrete disposition I propose (the governance shape, for the panel to weigh):**

1. **Mint `opda:EvidenceKindScheme`** as a SKOS concept scheme, `opda:ufoCategory "Quality Value"`
   (consistent with the sibling `EvidenceMethodScheme` already in the substrate; the kind a piece
   of evidence *is* is a Quality Value of the evidence per the S015 `addressVariant` precedent —
   ODR-0011 §8a "Quality Value" row), members `opda:evidenceKind/document`,
   `…/electronicRecord`, `…/vouch` (+ `electronicSignature`, `bill` available as the OIDC4IDA set
   extends). Each member: `skos:prefLabel @en`, `skos:notation` = the OIDC4IDA token
   (`document`/`electronic_record`/`vouch`), `skos:definition` **verbatim from OIDC4IDA**
   (ODR-0011 §4a regulator-citation discipline), `dct:source` → the OIDC4IDA `evidence` element
   version-IRI, `skos:exactMatch` → the OIDC4IDA concept where it has a dereferenceable IRI, and
   `skos:inScheme opda:EvidenceKindScheme`. Steward: Moreau (lead, owns the OIDC4IDA/eIDAS
   domain per ODR-0009) + a DCMI deputy for SKOS-mechanism hygiene — mirroring the
   `opda:PurposeScheme` steward-split ODR-0011 session-033 just ratified.

2. **Carry the kind via ONE `opda:evidenceKind` property** (`rdfs:domain opda:Evidence`,
   range the scheme, `sh:in` the scheme notations) — exactly the ODR-0024 R4 idiom that replaced
   the five range-less school-band properties. This is the facet.

3. **Retire `opda:Document`/`ElectronicRecord`/`Vouch` aliases entirely** (Q1).

4. **The three `…Evidence` OWL subclasses: keep only what bears distinct structure.** This is
   where I defer to Guizzardi/Guarino on the ontology, but state the governance test plainly:
   a subclass earns its URI iff it carries type-specific *properties or shapes* a faceted concept
   cannot (`opda:VouchEvidence` carries `opda:attestedBy → prov:Agent`, `opda-claim.ttl:126–132`;
   `DocumentEvidence` carries the filing-metadata seam to `AttachedDocument`, ODR-0024 R7). Those
   are real and argue for keeping the subclasses **as structural bearers**, *bound to their
   scheme concept by `skos:exactMatch`* (the TenureKind template). The kind-as-discriminator
   moves to the facet; the subclass survives only as the structure-bearer. If a "kind" carries
   **no** distinct structure, it should be facet-only (no class) — `ElectronicRecordEvidence`
   today carries no type-specific property in the artefact (`opda-claim.ttl:71–78`) and is a
   candidate for facet-only.

   This is *not* "collapse the hierarchy"; it is **demote the kind axis to a governed facet and
   let the subclass tree shrink to only the nodes that bear distinct structure** — the OntoClean-
   clean outcome, and the catalogue-clean one.

  *Verdict 2:* **`Q2: REVISE` — adopt a governed `opda:EvidenceKindScheme` SKOS facet + single
  `opda:evidenceKind` property as the kind axis; retain OWL subtypes only as structure-bearers
  bound via `skos:exactMatch`** — `ballot: FOR` — grounded in ODR-0011 §Alternatives
  (Baker/Knublauch Q5 — OWL-class-per-value rejected), ODR-0024 R6/R4 (coded-value over
  class-per-value; "namespace landmines"), ODR-0011 §8a Substance-Kind-label `skos:exactMatch`
  template, and the extant `EvidenceMethodScheme` regulator-anchored substrate.

  **eIDAS / OIDC4IDA authoritative concepts to `skos:exactMatch`:** yes — OIDC4IDA §5.1.1
  `evidence.type` provides the canonical `document` / `electronic_record` / `vouch` /
  `electronic_signature` / `bill` tokens; these are the `skos:notation` + `skos:exactMatch`
  targets. eIDAS Regulation (EU) 910/2014 governs the *assurance-level* axis (already a separate
  scheme, `opda:AssuranceLevelScheme`) — it does NOT supply evidence-*kind* concepts, so the kind
  scheme's authority is OIDC4IDA, not eIDAS. Keeping kind (OIDC4IDA) and assurance (eIDAS) as two
  governed schemes is the correct separation of authorities; folding kind into the class tree
  obscures that the two axes have two different regulators.

### Q3 — Disposition / migration + ODR-0025/0026 + ADR-0011. **REVISE (staged, low-cost migration).**

- **ADR-0011** is the alias's origin (within-engineering option (b)). The disposition is an
  **ADR-0011 amendment** recording that option (b) is superseded: short-name compatibility is
  served by exemplar-renaming + `skos:altLabel`, not by a second `owl:Class` + `owl:equivalentClass`.
  This is squarely within ADR-0011's own scope — its validation report already flagged
  "Document/Vouch short-name handling via `owl:equivalentClass`" as a within-engineering call
  (ADR-0011 §Amendments, 2026-05-27 validation), so revisiting it needs no new corpus authority.

- **ODR-0026 §R3 hands this council the question by name:** "Re-examining the alias pattern
  itself is an ADR-0011 question, out of scope here." So nothing in ODR-0025/0026 *blocks* retiral
  — they bound the *entailment* (aliases are non-evaluated) and explicitly leave the *modelling*
  to us. Retiring the aliases is fully consistent with ODR-0025/0026: it removes three constructs
  the closure already ignores. ODR-0026 §Consequences ("Audit any shape that targets a canonical
  evidence class while expecting short-name instances to match") becomes **moot** once exemplars
  carry the canonical type — a net simplification of the shape layer.

- **Migration (deterministic, generator-mechanical via ADR-0011 emission):**
  1. Rename the diagnostic exemplars' `a opda:Document|ElectronicRecord|Vouch` → the canonical
     `…Evidence` type (one edit each; the exemplar set is small).
  2. Drop the three alias `owl:Class` + `owl:equivalentClass` blocks from `opda-claim.ttl`; move
     each short name to `skos:altLabel` / `rdfs:label` on the canonical class if any human-label
     value remains.
  3. Mint `opda:EvidenceKindScheme` + members into `opda-vocabularies.ttl` (regulator-cited,
     §4a) and `opda:evidenceKind` + its base value shape (the ODR-0024 R6 `sh:targetSubjectsOf`
     + `sh:in` idiom — no overlay needed).
  4. Subclass tree shrinks per Q2 step 4 (ontology panel adjudicates which survive).
  5. `ci-dup-declaration` + `ci-byte-identity` re-pin; the alias retiral *reduces* the
     duplicate-declaration surface. No emitted-IRI change for the surviving canonical classes.

  *Verdict 3:* **`Q3: REVISE` — dispose via an ADR-0011 amendment (option (b) superseded) +
  ODR-0009/ODR-0011 scheme addition; migration is exemplar-rename + alias-drop + scheme-mint, all
  generator-mechanical, ODR-0025/0026-consistent (closure unaffected)** — `ballot: FOR` —
  grounded in ODR-0026 §R3 (explicit hand-off), ADR-0011 §Amendments (within-engineering origin),
  ODR-0024 R6 (`sh:targetSubjectsOf`+`sh:in` base-shape mechanism).

---

## CROSS-TALK NOTES

**IsaacMiles (SKOS scheme stewardship) — reply received, and it SHARPENS my Q2/Q3.**
Isaac's decisive repo fact, which I verified (`opda-vocabularies.ttl:1108–1130`): the
`opda:EvidenceMethodScheme` **already** holds three members
`opda:#evidenceMethod/{Document, Electronic-Record, Vouch}` — `skos:Concept`s, OIDC4IDA
`dct:source`, short-form `skos:prefLabel`s, `skos:notation` = "Document"/"Electronic-Record"/
"Vouch", steward Moreau (S009 Q3). **The OIDC4IDA `evidence.type` value-space is already a
conformant SKOS scheme in opda.** This means my opening's "mint `opda:EvidenceKindScheme`"
is REVISED on a reuse-before-mint basis (ODR-0011 §External-schemes-reused + ODR-0024 R6
"reuse-before-mint; do not mint a third tenure scheme"): **do not mint a new scheme — the
evidence-kind facet is `EvidenceMethodScheme`, already present.** Isaac's framing is correct
and stronger than mine: the alias problem **dissolves, not migrates.** (One naming caveat for
the panel: the scheme is *labelled* "Method" but its members ARE the OIDC4IDA `evidence.type`
kinds — there is a latent prefLabel/scheme-title smell worth a steward note, but it does not
change the verdict; reusing it is still right.)

**Blast radius — VERIFIED (answers Isaac Q2).** The short-name classes
`opda:Document`/`ElectronicRecord`/`Vouch` are referenced in EXACTLY:
- `opda-claim.ttl` — their own 3 `owl:Class` declarations + 3 `owl:equivalentClass` edges
  (lines 48, 61, 64, 74, 77, 103, 116);
- 3 exemplars — `a opda:Document|ElectronicRecord|Vouch` at
  `claim-with-{document,electronic-record,vouch}-evidence.ttl:44/44/45`.
NO SHACL shape, NO annotation graph, NO other module dereferences the short-name *class*.
So Isaac's "clean generator-level deletion" holds: drop 3 classes + 3 alias edges; rename 3
exemplar typings → the canonical `…Evidence`. That is the whole migration. (Answers Isaac
Q2: clean deletion, no §5a deprecation/historyNote needed — these are DO-NOT-HAND-EDIT
generated engineering aliases that never shipped to a WG-governed external consumer; §5a
lifecycle discipline governs *published* concept retirement, not removal of an internal
generator artefact with zero external dereferencers. `owl:deprecated` is for terms a consumer
may still hold; nobody holds `opda:Document`-the-class.)

**Where I PART from Isaac (governance correction — Isaac Q1, the prefLabel direction).**
Isaac's instinct: set the concept `skos:prefLabel` to the OIDC4IDA *verbatim token*
(`document`/`electronic_record`/`vouch`) on the strength of my §4a verbatim-regulator-citation
discipline. **§4a does not say that, and the DCMI chair should catch it.** ODR-0011 §4a binds
the verbatim regulator text to **`skos:definition`**, NOT to `skos:prefLabel`:
"`skos:definition` cites the regulator's text **verbatim** … OPDA-context paraphrase moves to
`skos:scopeNote`, never `skos:definition`." `skos:prefLabel` is a human-facing display label
governed by SKOS Reference §S14 (one per language) — it is *not* the machine token. The
machine token's home is **`skos:notation`** (SKOS Reference §S15; ODR-0011 §7a:
"`skos:notation` for the canonical machine code"). So the correct DCMI disposition is:
- `skos:notation` = the OIDC4IDA token *as the spec writes it* — `"document"`,
  `"electronic_record"`, `"vouch"` (the current notations "Document"/"Electronic-Record"/
  "Vouch" are *humanised* and should be re-pinned to the spec's lower_snake tokens to honour
  §4a's "pin the regulator's published form"; a steward call for Moreau, flagged not forced);
- `skos:prefLabel` = the human label (the existing "Document"/"Electronic-Record"/"Vouch" are
  fine, or "Document evidence" etc. for clarity);
- `skos:definition` = the OIDC4IDA verbatim text (already present, good);
- the long "Document Evidence" string stays the **class** `rdfs:label` (where a surviving
  subclass exists). No `skos:altLabel` is needed *if* prefLabel already carries the short form
  — Isaac's "alias dissolves" is right — but the reason is notation/prefLabel/definition each
  having a distinct home, NOT §4a forcing the token onto prefLabel.

This converges with Isaac on the verdict (retire aliases + reuse `EvidenceMethodScheme`); I
correct only *which SKOS property* carries the regulator token, because mis-citing §4a would
propagate a labelling error into every future regulator-governed scheme — a DCMI Usage Board
discipline point.

**Net effect on my verdicts:** Q2 REVISES from "mint `opda:EvidenceKindScheme`" →
**"reuse the extant `opda:EvidenceMethodScheme` as the evidence-kind facet"** (reuse-before-
mint). Everything else (one `opda:evidenceKind` property `sh:in` the scheme; subclasses kept
only as structure-bearers bound via `skos:exactMatch`; Q1 retire-the-aliases; Q3
ADR-0011-amendment disposition) stands and is *strengthened* by the substrate already existing.

## REBUTTAL

My single rebuttal closes on Isaac's reply (his was the substantive SKOS-mechanism exchange).
Davis's DA reply arrived after this rebuttal was first posted; I do not re-open a second
rebuttal loop (the procedure is one rebuttal), but I record his challenge and my concessions in
the **Davis cross-talk addendum** below the verdicts, and I have tightened the verdicts to
reflect the one ground he correctly knocked out (the `Detached` category-slip) and the one
distinction he correctly forced (bound-label vs dispatch-replacing facet). Net: Davis and I
converge; the proposition is the casualty.

### I ADOPT two of Isaac's corrections — both are more DCMI-correct than my draft

**(i) `opda:ufoCategory "Substance Kind label"`, NOT "Quality Value" — adopted.** Isaac is
right and the reasoning is decisive: the ODR-0011 §8a row that *carries the
`skos:exactMatch`-to-OWL-subclass machinery* is **Substance-Kind label** (the TenureKind/
OwnerType template), and its cross-scheme consistency check *mandates* `skos:exactMatch` from
each concept to its OWL sub-class (NEVER `owl:sameAs`, ODR-0005 Anti-pattern §5). Since the
whole point of my Q2 is to **preserve** the concept→subclass binding the alias failed to
provide, Substance-Kind label is the correct category and the mandate is the feature. "Quality
Value" (the S015 `addressVariant` precedent) is for a Quality particularising a Kind *without*
a subclass partition — the wrong fit precisely because I want the binding. This supersedes my
opening's "Quality Value" tag. (Honest note, as Isaac flags: the sibling scheme is *currently*
tagged "Quality Value" — we are **changing** that tag, not inheriting it.)

**(ii) RENAME the mislabelled `EvidenceMethodScheme` → the evidence-kind scheme; do NOT mint a
second scheme — adopted, and it is stronger than my cross-talk note.** Isaac fetched OIDC4IDA
and verified the three orthogonal axes: `evidence.type` (document / electronic_record / vouch /
electronic_signature / bill), `method`/`verification_method` (pipp / sripp),
`check_details`/`validation_method` (vpiruv / bvr). The decisive artefact fact:
`opda:EvidenceMethodScheme`'s three members ARE `evidence.type` *values*, not `method` values
(method would be pipp/sripp) — so the scheme is **mislabelled**, not merely awkwardly named (my
cross-talk note under-called this as a "latent smell"; Isaac correctly calls it wrong). Minting
a second `EvidenceKindScheme` with the same three concepts trips the §1a
`ConceptInExactlyOnePrimaryScheme` integrity constraint. **Governance ruling: rename/repurpose
the existing scheme** (prefLabel → "Evidence Kind"; `opda:ufoCategory` → "Substance Kind
label"; fix the `skos:scopeNote` — it is the `type` axis, not the method axis), and leave a
*separate, genuine* `EvidenceMethodScheme` (pipp/sripp) + `ValidationCheckScheme` (vpiruv/bvr)
to be minted **only if/when** a method/check leaf actually appears in PDTF data (generator-first
discipline — ODR-0011 session-033 "do not emit an unexercised scheme"). One scheme per axis; the
kind-axis scheme already exists and needs its label/category corrected, not a sibling minted.

### Where I HOLD a sharper line than Isaac — the `sh:xone` "structure" claim is not in the artefact (VERIFIED)

Isaac's one over-reach: to defeat my "ElectronicRecordEvidence is facet-only" candidate, he
argues all three subtypes must stay classes because ElectronicRecordEvidence "bears the ODR-0009
R5 `sh:xone` dispatch arm (record→source→name) … the `sh:xone` arm IS its structure." **I
checked the emitted artefact and that dispatch does not exist.** `opda-claim-shapes.ttl`
(the ADR-0012 emission, full file read) contains **no `sh:xone`** and **no per-subtype shape**:
the only node shapes target `opda:Claim`, `opda:Evidence`, and `opda:VerificationActivity`
(`ClaimIdentityKeyShape`, `EvidenceIdentityKeyShape`, `UnprovenancedClaimShape`,
`PROVOClaimsRule`, `VerificationActivitySuccessionRule`). There is **no shape constraining
`record→source→name` on `ElectronicRecordEvidence`.** And ADR-0012 does **not** specify a
subtype `sh:xone` dispatch either (grepped — empty). So as *emitted*, ElectronicRecordEvidence
carries zero distinct property and zero distinct shape — it genuinely is structure-thin, exactly
my opening's observation.

This does **not** overturn Isaac's operative conclusion, and I concede the conclusion: **keep
all three as subclasses.** But the *justification* must be honest about the artefact:
- The §8a Substance-Kind-label consistency check (once we adopt that category) wants each
  concept bound by `skos:exactMatch` to a subclass; a facet-only member would split the axis
  across "concept+subclass" and "concept-only" members of one scheme — avoidable inconsistency.
  **That is the real reason all three stay subclasses — a consistency-discipline reason, not a
  "the structure already exists" reason.**
- The §8a check is **not** an absolute SKOS law forbidding label-only sub-Kinds (a
  Substance-Kind-label scheme *may* carry a concept with no subclass); what makes facet-only
  wrong *here* is that all three OIDC4IDA types are *prospectively* distinct dispatch targets
  AND keeping them uniform satisfies the check at near-zero cost. I flag this so the panel does
  not over-generalise Isaac's point into "§8a forbids facet-only members" — it does not.

### NEW FINDING I surface as catalogue chair — a documentation overclaim in the artefact

The hunt for the `sh:xone` dispatch turned up a separate, citeable hygiene defect: `opda:Evidence`'s
`rdfs:comment` (`opda-claim.ttl:83`) asserts "SHACL `sh:xone` dispatches on subtype at
validation time (ADR-0012 emits the shape)" — but **ADR-0012 emits no such shape and the shapes
graph contains none.** The comment documents machinery that does not exist. This is the *same
class of defect* as the alias layer (an `rdfs:comment` claiming "owl:equivalentClass binding
ensures one OWL identity" when the closure never evaluates it, ODR-0026 §R3). Both are
**catalogue annotations writing cheques the artefact doesn't cash** — precisely what DCMI Usage
Board review exists to catch. Disposition: either emit the dispatch shape (if the panel wants
per-subtype validation) or correct the `opda:Evidence` comment to drop the false `sh:xone`
claim. Flagged for the same ADR-0011/ADR-0012 remediation pass.

### The governance/extensibility-cost objection (the question I put to Davis), answered

Since Davis did not rebut, I answer the strongest cost objection myself so the verdict is not
unguarded:

- **Is the SKOS facet cheaper to extend than a subclass?** Yes, decisively, and the corpus
  already priced it. Adding OIDC4IDA's `electronic_signature` / `bill` via the facet = add one
  `skos:Concept` (`skos:prefLabel` + `skos:notation` + verbatim `skos:definition` + `dct:source`
  + `skos:inScheme`) and regenerate the `sh:in` (ODR-0011 §5a regeneration discipline — mechanical,
  CI-gated). The *old* class-per-value path = mint an `owl:Class` + (under ADR-0011 option (b)) a
  second alias class + an `owl:equivalentClass` edge + per-class `rdfs:comment`/`skos:scopeNote`/
  `dct:source` annotations — i.e. the very alias-maintenance burden Q1 retires, multiplied per new
  kind. The one genuine SKOS-side cost — `sh:in` regeneration on a *closed* scheme — is already a
  ratified, generator-mechanical discipline (ODR-0011 §5a + the `ci-byte-identity` gate), not a new
  burden. **And note: the kind axis here is plausibly OPEN-ended** (OIDC4IDA extends its evidence
  types over time), which by ODR-0011 §Rules ("open-ended schemes are not `sh:in`-constrained, so
  the world can extend them without an ODR") means *new kinds need no ODR at all* — the strongest
  possible extensibility argument, and one the class tree cannot match (a new subclass is always an
  emission + a governance event).
- **Does moving kind to a facet break a `sh:xone` subtype dispatch?** No — because, as verified
  above, **no such dispatch is emitted.** The objection presumes machinery the artefact lacks.
  *If* per-subtype validation is later wanted, it is a shape-layer authoring task (target the
  surviving subclasses, which we keep), fully compatible with the facet carrying the
  discriminator — ODR-0026 §Consequences already contemplates targeting actual asserted types.
  The facet and the structural subclasses are complementary, not rival: facet = the governable,
  extensible *kind* discriminator; subclass = the *structure* bearer where structure exists.

### FINAL VERDICTS (post-cross-talk)

- **Q1 — alias an anti-pattern to retire? `REVISE` — `ballot: FOR` retiring the three
  `owl:equivalentClass` short-name aliases + their alias classes.** They are inert under opda's
  ratified closure (ODR-0025 §R2 excludes `owl:equivalentClass`; ODR-0026 §R3 confirms no
  entailment, "not a regression"), a duplicate-term defect by DCMI one-concept-one-URI + opda's
  own `ci-dup-declaration` + ODR-0024 R2/R7, and the short-name need is met by label discipline
  (Isaac: the alias **dissolves** — prefLabel/altLabel/notation each have a distinct SKOS home;
  exemplars re-type to the canonical `…Evidence` in the same generator pass). Clean
  generator-level deletion; no §5a deprecation event (zero external dereferencers — verified
  blast radius: 3 declarations + 3 `owl:equivalentClass` edges in `opda-claim.ttl` + 3 exemplar
  typings, nothing else).

- **Q2 — governed SKOS scheme vs OWL-class-per-kind? `REVISE` — `ballot: FOR` a governed SKOS
  evidence-KIND facet via the EXISTING (renamed) `opda:EvidenceMethodScheme`, `opda:ufoCategory
  "Substance Kind label"`, carried by ONE `opda:evidenceKind` property; the three `…Evidence`
  OWL subclasses are RETAINED as structure-bearers, each bound to its scheme concept by
  `skos:exactMatch` (the §8a Substance-Kind-label mandate; NEVER `owl:sameAs`).** This is the
  ODR-0011 §Alternatives ruling (OWL-class-per-value rejected, Baker/Knublauch Q5) + the live
  ODR-0024 R6/R4 "coded-value over class-per-value / range-less object props are namespace
  landmines" precedent applied to the one module that pre-dates it. **eIDAS/OIDC4IDA:** the kind
  authority is **OIDC4IDA `evidence.type`** (the `skos:notation` + `skos:exactMatch` targets,
  lower_snake `document`/`electronic_record`/`vouch`); **eIDAS** governs the *separate* assurance
  axis (`opda:AssuranceLevelScheme`) — two axes, two regulators, two governed schemes, which the
  facet preserves and the class tree obscures. (Not a hierarchy collapse: the subclass tree is
  kept; only the *kind discriminator* moves to the governed facet.)

- **Q3 — disposition / migration + ODR-0025/0026 + ADR-0011? `REVISE` — `ballot: FOR` a staged,
  generator-mechanical migration disposed via an ADR-0011 amendment (option (b) superseded:
  short-name compat = label discipline, not a second class + `owl:equivalentClass`).** ODR-0026
  §R3 hands this council the question by name ("Re-examining the alias pattern itself is an
  ADR-0011 question, out of scope here"); nothing in ODR-0025/0026 blocks retiral — they bound
  the *entailment*, not the *modelling*, and ODR-0026 §Consequences' "audit shapes expecting
  short-name matches" becomes moot once exemplars carry canonical types. Migration: (1) rename
  the 3 exemplar typings → `…Evidence`; (2) drop the 3 alias classes + 3 `owl:equivalentClass`
  edges from `opda-claim.ttl`; (3) rename/repurpose `EvidenceMethodScheme` → evidence-kind
  (label + ufoCategory + scopeNote fix) and re-pin notations to the OIDC4IDA lower_snake tokens
  (steward Moreau + DCMI deputy, the session-033 split); (4) add `opda:evidenceKind` +
  `skos:exactMatch` concept→subclass links (§8a) + the base `sh:in` value shape via the
  ODR-0024 R6 `sh:targetSubjectsOf` idiom (no overlay); (5) correct the `opda:Evidence` comment's
  false `sh:xone` claim (NEW FINDING) in the same pass; (6) `ci-dup-declaration` +
  `ci-byte-identity` re-pin — the change *reduces* the duplicate-declaration surface. All
  generator-mechanical via ADR-0011/ADR-0012 emission; ODR-0025/0026-consistent (closure
  unaffected — the retired aliases were never evaluated).

> **Q2 clarification forced by Davis (DA), incorporated:** `opda:evidenceKind` is a **governed
> kind-LABEL on the bearer, `skos:exactMatch`-bound to the subclass (the tenureKind pattern)** —
> it is **NOT** a dispatch-replacing facet. SHACL subtype dispatch (if/when built) rides on the
> disjoint discriminating *properties* via `sh:targetSubjectsOf` (ODR-0024 R6 idiom), targeting
> the retained subclasses — never `sh:xone`-over-`evidenceKind`, which would re-create the
> ODR-0009 §R5 "do NOT collapse" conditional soup. Facet = governable/extensible label;
> subclass = structure bearer; disjoint property = dispatch key. Three roles, complementary.

---

## DAVIS (DA) CROSS-TALK ADDENDUM — his challenge + my concessions

Davis's DA reply was the sharpest of the three and I record it in full faith. He **conceded**
the spine (retire the aliases; keep the subclasses; add a governed SKOS kind-scheme
`skos:exactMatch`-bound to them — the tenureKind pattern) and **agreed the proposition's
headline loses** ("evidence-kind should be a facet *instead of* rigid inheritance" — both of us
keep the subclasses, so the "instead of" framing is rejected by both DA and proponent). He
landed two challenges; I take both honestly:

**CONCEDED — the `Detached` category-slip (Davis is right).** My opening leaned on ODR-0011
§Alternatives (the OWL-class-per-value rejection, example `Detached`) to argue against the
evidence *subclasses*. Davis correctly notes that precedent rejected classes for **enum
value-spaces** — `Detached` is a built-form *value with no properties* — whereas `VouchEvidence`
bears `opda:attestedBy → prov:Agent` (verified `opda-claim.ttl:131`), a disjoint property
signature. A subtype with disjoint structure is **not** the same modelling object as a value
label. **So the `Detached`/ODR-0011 §Alternatives precedent applies to the alias layer and to
the kind-DISCRIMINATOR, NOT to the structural subclasses.** This sharpens — does not overturn —
my verdict: my Q2 already keeps the subclasses; I withdraw any implication that ODR-0011
§Alternatives condemns *them*. It condemns the alias + the class-as-discriminator, which is what
I retire.

**CONCEDED with a correction — the `electronic_signature`/`bill` disanalogy.** Davis is right
that these OIDC4IDA additions are kinds-without-new-structure (a bill is a document-with-issuer;
an e-signature is a record-with-digest), so they were never new *structural* subtypes — 2 new
OIDC types, 0 new structural subtypes. I grant the empirical point. But it **supports** the
facet, not the class tree: kinds-without-distinct-structure are exactly the members that should
live as `skos:Concept`s (`skos:exactMatch`-bound to the existing DocumentEvidence /
ElectronicRecordEvidence subclass), which is the tenureKind move Davis endorses. The facet
absorbs new value-kinds for free; only a *new property signature* would ever warrant a new
subclass — and OIDC4IDA's roadmap shows that is rare. So extensibility-by-facet stands.

**CORRECTION I owe Davis (verified) — his "partition by property signature" is only 1/3
realised in the artefact.** Davis argued dispatch rides on "the already-disjoint discriminating
properties (apiEndpoint / attestedBy / documentReference)" with no new property. I checked:
**only `attestedBy` exists** (VouchEvidence, `opda-claim.ttl:131`). There is **no** `apiEndpoint`
on ElectronicRecordEvidence and **no** `documentReference` on DocumentEvidence in the emitted
TTL; DocumentEvidence's only distinct structure is the `⊑ opda:AttachedDocument` subsumption
(ODR-0024 R7), and **ElectronicRecordEvidence has neither a distinct property nor a distinct
subsumption nor a dispatch shape** (`opda-claim-shapes.ttl` has no `sh:targetSubjectsOf` and no
per-subtype shape — verified empty). So the honest artefact picture:
- **VouchEvidence** — distinct property (`attestedBy`) → real structure-bearer (Davis right);
- **DocumentEvidence** — distinct *subsumption* (`⊑ AttachedDocument`) → real structure-bearer;
- **ElectronicRecordEvidence** — structure-thin *as emitted* (my opening's observation stands).

This does NOT reopen the conclusion — I concede **keep all three subclasses** — but the binding
reason is the **§8a Substance-Kind-label consistency mandate** (a facet-only member would split
the axis across concept+subclass and concept-only members of one scheme) **plus the prospective
dispatch design Davis describes** (the right target state, currently unbuilt). It is *not* "the
property signatures already exist," because two of three don't yet.

**ACCEPTED governance costs Davis named (into the disposition as line-items):** (1) the `sh:in`
regeneration discipline (ODR-0011 §5a) couples every scheme edit to a shape re-emit +
byte-identity re-pin — "add one concept" is "add one concept + regenerate + re-pin" (already in
my Q3 migration step 6); (2) an OIDC4IDA-tracking scheme MUST declare a steward (`dct:creator`,
ODR-0011 §1a — my own DCMI discipline) **and** an explicit open/closed policy, or it drifts
(added: the renamed kind-scheme is flagged **open-ended**, tracking OIDC4IDA, steward Moreau +
DCMI deputy). Neither is fatal; both mean the SKOS path is *cheaper-to-extend but not
free-to-govern* — a fair correction I accept.

**Net Davis ↔ Baker:** full convergence — retire aliases; keep subclasses; governed SKOS
kind-scheme `skos:exactMatch`-bound (tenureKind pattern); `evidenceKind` is a **bound label, not
a dispatch-replacing facet**. No residual split. The proposition's "facet *instead of*
inheritance" is rejected by DA and proponent alike; what survives is "governed facet *alongside*
a structure-only subclass tree, aliases retired."
