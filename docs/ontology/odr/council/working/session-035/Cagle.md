# SESSION-035 — Kurt Cagle — OPENING

**Role:** SHACL/SKOS practitioner; taxonomy & faceting design; the structured-value test.
**Governing maxim (mine, published):** *a type that supplies no identity beyond a discriminating
value is a structured value, not a class.* If the only thing `opda:VouchEvidence` adds over
`opda:Evidence` is "the kind is Vouch," then "Vouch" is a coded value on a facet, not a subclass.

**Proposition under test:** opda's evidence short/long alias pattern is an anti-pattern; rigid
subclass inheritance is the wrong model for evidence typing; evidence-kind should be a facet;
facets-vs-inheritance was never weighed.

**My job:** argue that evidence-kind × assurance-tier is a *two-facet classification* — one
`opda:Evidence` class + `opda:evidenceType` ranging over a SKOS scheme + an assurance Quale —
not a subclass tree; and show this is not a novel proposal but the **completion of a faceting the
corpus already started and left half-built**. Be concrete about the target Turtle/SHACL. Concede
the Vouch provenance asymmetry honestly.

---

## The decisive repo fact: the facet already exists, orphaned

`opda-vocabularies.ttl` lines 179–187 and 1108–1130 — **read, verbatim**:

```turtle
opda:EvidenceMethodScheme  a skos:ConceptScheme ;
    skos:prefLabel "Evidence Method"@en ;
    skos:definition "Quality Values for the method by which identity evidence was obtained,
                     per the OIDC4IDA `evidence` taxonomy."@en ;
    dct:source <https://openid.net/specs/openid-connect-4-identity-assurance-1_0.html> ;
    opda:ufoCategory "Quality Value" .

<…/#evidenceMethod/Document>          a skos:Concept ; skos:inScheme opda:EvidenceMethodScheme ; skos:notation "Document" .
<…/#evidenceMethod/Electronic-Record> a skos:Concept ; skos:inScheme opda:EvidenceMethodScheme ; skos:notation "Electronic-Record" .
<…/#evidenceMethod/Vouch>             a skos:Concept ; skos:inScheme opda:EvidenceMethodScheme ; skos:notation "Vouch" .
```

This is the OIDC4IDA evidence taxonomy — **`{Document, Electronic-Record, Vouch}`** — minted as a
SKOS scheme, classified by the corpus's own UFO machinery as a **Quality Value** (a Quale-in-Region),
sourced to the same OpenID spec that ODR-0009 §Rules cites for the subtypes. **It is the discriminator
already expressed as coded values.**

I grepped the whole ontology tree (`source/03-standards/ontology/**/*.ttl`): **no property and no shape
references `opda:EvidenceMethodScheme` anywhere outside the vocab file.** It is orphaned. The corpus
minted the evidence-kind discriminator **twice**:

1. once as **coded values** — `EvidenceMethodScheme`, a ratified Quality-Value scheme (ODR-0011), wired
   to nothing; and
2. once as a **class tree** — `DocumentEvidence`/`ElectronicRecordEvidence`/`VouchEvidence` ⊑ `Evidence`,
   plus three `owl:equivalentClass` aliases to carry the short names the exemplars use.

That redundancy — the same OIDC4IDA axis modelled both as a Quality-Value scheme *and* as a subclass
partition — **is the anti-pattern**, and it is the strongest possible refutation of Davis's "the facet
is heavier ontological commitment" framing (his Q2). The facet is **not** new machinery to import. It is
**already sitting in the corpus, ratified, paid-for, and unused.** Wiring `opda:evidenceType` to it and
deleting the subclass tree is *strictly less* ontology, not more.

## Where Davis is right, and where his framing is wrong (read his OPENING in full)

Davis (DA OPENING, this folder) is **correct** on three things I will not contest:
- the aliases are **runtime-inert** under the ODR-0025/0026 closure (`owl:equivalentClass` is never
  entailed; ODR-0026 §R3) — so this is not an *entailment-safety* defect;
- there is **no leaf-targeting shape today** — the promised `sh:xone` dispatch (ODR-0009 §"SHACL over the
  PROV structure") is **NOT emitted** (`opda-claim-shapes.ttl`: only `EvidenceIdentityKeyShape` on the
  supertype). He concedes this; I confirm it independently;
- there is **no named consumer** demanding the change *today*.

His framing is wrong on two:

1. **"`owl:equivalentClass` is W3C OWL 2, using a standard construct for what it means is not an abuse"**
   — true but beside the point. The anti-pattern is **not** the use of `owl:equivalentClass`. The
   anti-pattern is *needing it at all*: the alias exists **only because the subclass choice forced a
   long-name/short-name pair**, and then a second construct had to be minted to glue the two names back
   into one identity. Under a facet there is **one class** (`opda:Evidence`) and **one coded value**
   (`evidenceType = Document`); there is no second name, so there is no alias, so there is nothing to glue.
   **The facet eliminates the alias by construction** (see §Target below). Davis defends the glue; I am
   removing the seam that needs gluing.

2. **"a facet is heavier commitment (drags in gUFO `Role`/`RoleMixin`/`mediates`)"** — this is a strawman
   of *my* proposal. I am **not** proposing a gUFO Role reification. The proposition's word "facet" does
   not mean "anti-rigid Role"; it means **a coded discriminating value on one class**, exactly as
   ODR-0008 §Q5a already does for `tenureKind`, `priceQualifier`, `builtForm`, EPC band — *value-spaces
   carried by `sh:in` over a SKOS scheme on a single bearer class*. Davis himself cites §Q5a (his fact 5)
   and then narrows it to "enumerated literal value-spaces, not typed entities." But `EvidenceMethodScheme`
   is **already** classified `opda:ufoCategory "Quality Value"` — the corpus has *already decided*
   evidence-method is a Quality Value, not a sub-Kind. My proposal simply honours that classification.

## The two-facet target (concrete Turtle + SHACL)

Evidence is classified on **two orthogonal facets**, both already SKOS schemes in `opda-vocabularies.ttl`:

| Facet | Existing scheme | UFO category (as the corpus already tags it) |
|---|---|---|
| **how the evidence was obtained** | `opda:EvidenceMethodScheme` `{Document, Electronic-Record, Vouch}` | Quality Value |
| **how strong the resulting assurance is** | `opda:AssuranceLevelScheme` `{Low, Substantial, High, PDTF-Standard}` | Quality Value |

These are **orthogonal**: a *document* can yield *Substantial* (court-issued probate) or, in a degraded
chain, less; a *vouch* caps at *Low* regardless of voucher quality (ODR-0009; the vouch exemplar).
Two facets, not one tree — and a subclass tree on `evidenceType` cannot represent the assurance axis at
all (it would need a second, crossed hierarchy: the classic multiple-inheritance explosion that faceting
exists to prevent — Ranganathan's colon classification; Cagle, *Semantic faceting over taxonomy trees*).

**One class. Coded kind. Quale-coded assurance:**

```turtle
# opda-claim.ttl — REVISED (facet model)
opda:Evidence  a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    rdfs:label "Evidence"@en ;
    rdfs:comment "Evidence supporting a Claim. Its acquisition method is a coded facet
                  (opda:evidenceType → opda:EvidenceMethodScheme, OIDC4IDA); the assurance it
                  yields is a separate coded facet (opda:assuranceLevel → opda:AssuranceLevelScheme).
                  Evidence is a ROLE a neutral artefact (opda:AttachedDocument) plays, never a Kind."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q1> .

opda:evidenceType  a owl:ObjectProperty ;        # the kind facet — replaces the subclass tree
    rdfs:domain opda:Evidence ;
    rdfs:range skos:Concept ;
    rdfs:comment "OIDC4IDA acquisition method. sh:in opda:EvidenceMethodScheme members (ADR-0012 shape)."@en ;
    dct:source <https://w3id.org/opda/odr/ODR-0009#section-Q1> .
```

And the type-specific facets become **conditional property shapes dispatching on the coded value** —
which is **exactly the construct ODR-0013's own JSON-Schema→SHACL mapping table already prescribes**:
*"`oneOf` (discriminated) → `sh:xone` + `sh:qualifiedValueShape` on the discriminator"* (ODR-0013 §Rules,
constraint-mapping table). The dispatch the corpus *promised but never emitted* is the dispatch a facet
**requires** — so a facet doesn't add a SHACL burden, it **discharges an obligation already on the books**:

```turtle
# opda-claim-shapes.ttl — the dispatch ODR-0009 promised, keyed on the facet value
opda:EvidenceShape  a sh:NodeShape ;
    sh:targetClass opda:Evidence ;
    sh:property [ sh:path opda:evidenceType ;        # closed coded facet
                  sh:in ( <…/#evidenceMethod/Document>
                          <…/#evidenceMethod/Electronic-Record>
                          <…/#evidenceMethod/Vouch> ) ;
                  sh:minCount 1 ; sh:maxCount 1 ; sh:severity sh:Violation ] ;
    # Vouch-only backbone — the asymmetry Guizzardi/Davis are right about — handled by dispatch:
    sh:xone (
      [ sh:property [ sh:path opda:evidenceType ; sh:hasValue <…/#evidenceMethod/Vouch> ] ;
        sh:property [ sh:path opda:attestedBy ; sh:minCount 1 ; sh:class prov:Agent ] ]   # attestation
      [ sh:property [ sh:path opda:evidenceType ; sh:hasValue <…/#evidenceMethod/Document> ] ;
        sh:property [ sh:path opda:documentType ; sh:minCount 1 ] ]                        # filing facet
      [ sh:property [ sh:path opda:evidenceType ; sh:hasValue <…/#evidenceMethod/Electronic-Record> ] ;
        sh:property [ sh:path opda:recordSource ; sh:minCount 1 ] ]                        # record.source
    ) .
```

This is the structured-value test applied: each subtype's distinguishing content is a **property profile
gated by a discriminating value** — which is the definition of a structured value, not a class
(Cagle; and W3C SHACL `sh:qualifiedValueShape` is the W3C-blessed mechanism for exactly this —
*SHACL Recommendation* §4.8).

## The honest concession — the Vouch asymmetry is real (it is the pro-subclass kernel)

Davis's and Guizzardi's strongest point, which I **grant**: `opda:attestedBy rdfs:domain opda:VouchEvidence`
(claim.ttl line 131). A vouch is `prov:wasAttributedTo` an **Agent** — an attestation; a document/record is
`prov:wasDerivedFrom` an **artefact** — a derivation. That is a genuine *provenance-shape* difference, not a
mere label. A subclass gives `attestedBy` a clean `rdfs:domain` to hang on; a flat single class loses that
hook. **This is the one real argument for keeping a subclass, and I will not pretend otherwise.**

But it is answered without a subclass *tree*:
- the `rdfs:domain` documentary hook can stay as a **documentary domain** under ODR-0026 §R2's own
  *model-but-don't-evaluate* principle — `opda:attestedBy rdfs:domain opda:Evidence` (broadened), with the
  **actual** Vouch-only enforcement carried by the `sh:qualifiedValueShape` dispatch above. ODR-0026 §R2
  already establishes that `rdfs:domain` is documentation, not inference — so a broadened documentary domain
  costs nothing and the *real* constraint lives in SHACL where the corpus put every other real constraint
  (ODR-0013: "OWL cannot validate; SHACL is the closed-world contract");
- the asymmetry is **one** Vouch-only property, not a pervasive divergence. One conditional shape branch
  absorbs it. It does not justify a three-way rigid partition *plus* three aliases to carry short names.

So: the Vouch asymmetry justifies **a discriminated shape**, which is what a facet gives you. It does not
justify the **alias machinery**, which is what the subclass choice forced.

---

## Verdicts (opening)

- **`Q1: AFFIRM — ballot: FOR`** — the alias *is* an anti-pattern, but I name it precisely: not "abuse of
  `owl:equivalentClass`" (Davis is right that the construct is standard W3C OWL 2), but a **double-mint
  redundancy** — the OIDC4IDA evidence axis is modelled *both* as the ratified `opda:EvidenceMethodScheme`
  Quality-Value scheme (orphaned) *and* as a subclass tree, and the long/short alias is the bolt-on the
  second model needs and the first does not. A model that needs `owl:equivalentClass` to reconcile two
  names for one concept it could have coded as one value fails the structured-value test
  (Cagle; SKOS Primer §2 — coded concepts, not parallel classes, for value-spaces). Retire by adopting the
  facet, which makes the alias *unnecessary*, not merely deprecated.

- **`Q2: REVISE(facet) — ballot: FOR`** — replace the subclass tree with `opda:Evidence` +
  `opda:evidenceType → opda:EvidenceMethodScheme` (kind facet) + `opda:assuranceLevel →
  opda:AssuranceLevelScheme` (assurance facet), with type-specific properties enforced by
  `sh:qualifiedValueShape` dispatch (ODR-0013's own prescribed `oneOf`→`sh:xone` construct; W3C SHACL §4.8).
  This is *less* ontology than the status quo (it deletes a tree and three aliases and **uses an
  already-ratified scheme**), it represents the orthogonal assurance axis a tree cannot (Ranganathan
  faceting), and the only genuine subclass virtue — the Vouch `attestedBy` asymmetry — is absorbed by one
  dispatch branch + a documentary `rdfs:domain` under ODR-0026 §R2. **Concession:** ODR-0009 §R5 ("do NOT
  collapse the three evidence types into one pattern") is a ratified rule; a facet does not *collapse* the
  three — it preserves all three as a closed coded facet with per-value shapes — but R5's wording must be
  **amended** to read "into one *undiscriminated* pattern," and that is a Council act, not an engineering one.

- **`Q3: REVISE(facet target now; phased migration) — ballot: FOR`** — adopt the facet as the **ratified
  target model** now (it is the correct model and it discharges the orphaned scheme + the unemitted §Q7
  dispatch), but **phase the cut-over** behind the byte-identity emitter rather than a big-bang re-pin.
  Concrete: (1) ratify `opda:evidenceType` + the two-facet shape as the target; (2) `opda-gen` emits the
  facet form *and* retains the subclass `rdfs:subClassOf` lines as **documentary** (ODR-0026 §R2) for one
  release so external DL tooling keeps the typing; (3) re-type the 15 exemplars to
  `a opda:Evidence ; opda:evidenceType <…/Document>` — this is where the short names *disappear*, so the
  three `owl:equivalentClass` aliases are **deleted, not deprecated**; (4) update ADR-0011 §Amendments
  (the short-name-via-equivalentClass disposition is superseded) and ODR-0009 §R5 wording. I **agree with
  Davis** that you do not churn a byte-pinned emitter for *zero* pull — so the trigger is this Council's
  ratification of the target, not a hypothetical future consumer; the migration is *staged*, not *deferred
  to demand*. The orphaned `EvidenceMethodScheme` **is** the latent demand: a ratified scheme wired to
  nothing is a defect the corpus already owns.

---

# FINAL POSITION (after cross-talk with Davis and Knublauch)

Cross-talk surfaced two facts that sharpen — not change — my opening. I exchanged one round each
with Davis (DA, full REJECT) and Knublauch (concurring on the facet). I verified the load-bearing
new fact independently rather than take it on trust.

## New fact #1 (verified): opda ALREADY emits-and-validates a facet for a Kind-discriminator

Knublauch pointed to `opda:ownerType`; I verified it in the repo:
- `opda-agent.ttl:184` — `opda:ownerType` is a **datatype property** whose own `rdfs:comment` reads
  *"Substance Kind label discriminating Private individual (opda:Person) from Organisation
  (opda:Organisation) for a Proprietor (legal owner)."*
- `opda-agent-shapes.ttl:47–94` — `opda:OwnerTypeValueShape`, `sh:targetSubjectsOf opda:ownerType`,
  `sh:in` over `OwnerTypeScheme` members, `sh:message` states it holds *"without an overlay profile"*
  (i.e. **entailment-free**, fires on asserted triples — the property the ODR-0025/26 closure guarantees).

This is decisive for Q2. The corpus **already made the facet-vs-subclass choice once, and chose the
facet** — for `ownerType`, which discriminates a **Substance Kind** (Person vs Organisation), a *harder*
faceting case than evidence-method. Evidence-method is classified by the corpus's own machinery as a
**Quality Value** (`EvidenceMethodScheme … opda:ufoCategory "Quality Value"`) — the *easier* case — yet it
is the lone hold-out modelled as a subclass tree. `ownerType`, `tenureKind`, `propertyType` are all
Substance-Kind-**label** facets (`opda-vocabularies.ttl`, `ufoCategory "Substance Kind label"`, coded via
`sh:in`/`skos:exactMatch`, *never* `owl:sameAs`). **The subclass tree for evidence is an inconsistency
with opda's own settled pattern**, not a neutral alternative to it.

## New fact #2 (from Knublauch's refinement): the migration target is bounded AND now NAMED

**Correction to my opening's migration route — Knublauch was right and I concede it.** At opening I argued
"reuse the short-name IRIs" by retyping the three **class** IRIs (`opda:Document` etc.) from `owl:Class` to
`skos:Concept` — to minimise exemplar edits. Knublauch made the sharp point I'd missed: there are **two
distinct IRI sets**, and "reuse the short-name IRIs" and "the scheme already has the concepts" point at
**different targets**:
- the three **class** IRIs: `opda:Document` = `<…/#Document>`, `opda:ElectronicRecord`, `opda:Vouch`;
- the three **existing scheme concepts**: `<…/#evidenceMethod/Document>`, `<…/#evidenceMethod/Electronic-Record>`,
  `<…/#evidenceMethod/Vouch>` — already minted, OIDC4IDA-sourced, `skos:notation`, Moreau-stewarded (S009 Q3).

**Named target (adopting Knublauch's route over my opening's):** range `opda:evidenceType` over the
**existing `#evidenceMethod/*` concepts** — they are already the canonical value-space (`skos:definition` +
`dct:source`-to-OIDC4IDA + `skos:notation`) — and **retire the three class IRIs outright** (drop the
`owl:Class` declarations + the three `owl:equivalentClass` aliases). Exemplars change
`a opda:Document` → `opda:evidenceType <…/#evidenceMethod/Document>`.

**Why I concede this over my own opening route** — it costs marginally more exemplar churn (15 mechanical
edits vs an IRI-rename), but it is the *more correct* route on a property I undervalued at opening: my retype
route would have made `opda:Document`-the-IRI **change meta-type across versions** (an `owl:Class` in v1, a
`skos:Concept` in v2). An IRI that silently changes meta-type is itself a latent defect — it breaks
identity stability for any consumer or reasoner that dereferenced it as a class, and it is exactly the kind of
"the IRI means two things depending on when you looked" hazard the structured-value discipline exists to
avoid. Saving 15 exemplar edits is the wrong variable to optimise against clean IRI semantics. Knublauch's
route keeps each IRI's meta-type stable (the `#evidenceMethod/*` concepts were always concepts; the class
IRIs are cleanly retired), and avoids minting a *second* `Document` concept that collides with the existing
scheme member.

Then:
- exemplars retype to `opda:evidenceType <…/#evidenceMethod/Document>` — mechanical, 15 edits, fully bounded;
- the three `owl:equivalentClass` aliases are **deleted** (the long/short pair no longer exists — the value is
  now a scheme concept, not a parallel class);
- `opda:DocumentEvidence`/`…/VouchEvidence` `rdfs:subClassOf` lines **may be retained as documentary**
  (ODR-0026 §R2 model-but-don't-evaluate) for one release if external DL tooling wants the typing — this is the
  one point where Isaac/Miles (keep the subtype classes, dual-typed) and the strict-retire reading still
  differ, and it does **not** affect enforcement either way.

Blast radius, NAMED and unambiguous: *emit one facet property + one shape + retire three class IRIs (drop
`owl:Class` + three `owl:equivalentClass`) + range `evidenceType` over the existing three scheme concepts +
retype 15 exemplars + re-point three DPV-refinement records*, with **zero shape edits** (nothing targets the
subtypes today) and the value-space IRIs **already minted**. This is marginally more exemplar churn than my
opening claimed, and I correct that on the record rather than carry the rosier number.

**Precise blast-radius correction (verified during Isaac/Miles cross-talk).** I grep-confirmed two things
that tighten the migration list: (i) **no shape targets any evidence subtype** — `opda-claim-shapes.ttl`'s
only evidence `sh:targetClass` is `opda:Evidence` (the supertype); the ODR-0009 §Q7 `sh:xone`-per-subtype
dispatch was never emitted — so retiring the subtype classes costs **zero shape edits** (Davis's
churn estimate over-counts here); (ii) the annotation graph **does** reference the long names —
`opda-claim-annotations.ttl:28–53` has three `opda:DPVMappingRefinement` records
(`DocumentEvidenceRefinement`/`…/VouchEvidenceRefinement`) each with `opda:targetsKind opda:DocumentEvidence`
etc. **and distinct lawful bases** (PublicTask / LegitimateInterest / Consent). So the migration list gains
one item I should be precise about: re-point those three `targetsKind` triples. **But they help the facet
case**: each is *already* a value-keyed variant (`opda:variantPredicate rdf:type ; opda:variantValue
"document-evidence"`) — the ODR-0018 refinement pattern is itself a facet in all but name. Re-pointing is
mechanical: `opda:targetsKind opda:Evidence ; opda:variantPredicate opda:evidenceType ; opda:variantValue
opda:Document`. The per-kind lawful-basis distinction (a real ODR-0012/0018 concern) **survives the facet
intact** — it keys on the same discriminating value either way.

## SHACL target — REFINED with Knublauch (supersedes my opening's `sh:xone` draft)

Knublauch added a **third card** I verified: the exemplars *already carry the facet informally* —
`opda:verificationMethod "document-inspection" / "electronic-record" / "vouch"` as free-text on the
verification activity (`claim-with-{document,electronic-record,vouch}-evidence.ttl:40–41`), **unvalidated,
never bound to the scheme**. So opda grew the facet in *instances* AND its value-space in *SKOS*
(`EvidenceMethodScheme`) independently, while the subclass tree sits unvalidated. The facet is not an
invention — it is **wiring up what instances and the vocabulary already grew**.

Drop the `sh:xone`-of-conjunctions I drafted at opening; Knublauch confirmed my own fragility instinct —
`sh:xone` is "exactly one member shape validates," so each branch only counts correctly *because* it also
asserts `sh:hasValue` on the discriminator; the moment a future method's profile is satisfiable independently
of the discriminator, `sh:xone` silently mis-counts. **Adopt `sh:qualifiedValueShape` + `sh:qualifiedMinCount 1`
per branch** — each is an independent existential, branches don't interfere, and a fourth method is purely
additive (append one shape, never re-balance an `xone`). This is what ODR-0013's table prescribes, read
correctly: the **discriminator is the qualified value, the branch profile is the qualified shape**. All
**SHACL Core** (W3C SHACL Rec §4.8 — `sh:qualifiedValueShape`/`qualifiedMinCount` are core constraint
components; **no** `advanced=True`):

```turtle
opda:EvidenceShape  a sh:NodeShape ;
    sh:targetClass opda:Evidence ;

    # (A) closed value-space gate — see the sh:in-vs-sh:sparql tradeoff note below
    sh:property [ sh:path opda:evidenceType ;
                  sh:class skos:Concept ;                         # IRI-valued (Option B)
                  sh:minCount 1 ; sh:maxCount 1 ; sh:severity sh:Violation ] ;

    # (B) per-kind obligation profiles — independent sh:qualifiedValueShape, additive, non-fragile:
    sh:property [ sh:path opda:evidenceType ;
                  sh:qualifiedValueShape [ sh:hasValue opda:Vouch ] ; sh:qualifiedMinCount 0 ] ;  # marker only
    sh:property [
        sh:path opda:attestedBy ;                                  # Vouch-only backbone (the asymmetry)
        sh:qualifiedValueShape [ sh:class prov:Agent ] ;
        # fires only when the node is a Vouch — guarded by a sibling sh:qualifiedValueShape on evidenceType:
        sh:qualifiedMinCount 1 ] ;
    # the Vouch ⇒ eIDAS-Low CAP, in Core, keyed on the facet value:
    sh:property [ sh:path opda:assuranceLevel ;
                  sh:qualifiedValueShape [ sh:in ( "Low" ) ] ; sh:qualifiedMinCount 1 ] .
# (Per-branch guarding shown schematically; the canonical emission is one sh:qualifiedValueShape per
#  (discriminator-value → required-profile) pair, all SHACL Core, none behind advanced=True. The Document
#  branch requires opda:documentType; the Electronic-Record branch requires opda:recordSource.)
```

Practitioner points settled with Knublauch:
- **(i) the vouch⇒Low cap belongs in SHACL Core** via `sh:qualifiedValueShape`/`sh:in`, NOT SHACL-AF
  `advanced=True` (ODR-0010 line 45's AF caveat scopes to `sh:rule` *materialisation*; a value-cap is a
  *constraint*). SHACL-AF stays reserved for the *informative* ODR-0017 `sh:rule` status-materialisation
  already emitted (`hasProvenanceChainStatus` / `hasVerificationSuccessionStatus`). Clean line: **constraints +
  caps = Core; informative status materialisation = AF.**
- **(ii) `sh:qualifiedValueShape` over `sh:xone`** for the dispatch — future-proof, non-fragile (Knublauch).
- **(iii) DASH is unaffected** by going IRI-valued (Option B): an ObjectProperty-to-`skos:Concept` still
  renders as a single `dash:EnumSelectEditor` (DASH drives the dropdown off scheme members) — we lose nothing
  on the form side vs a string-valued facet. The *subclass* model, by contrast, gives DASH **no property** to
  hang an editor on at all (ODR-0013 §DASH rendering). This is a concrete form-generation point *for* the facet.

### The one place I qualify Knublauch — `sh:in` vs `sh:sparql skos:inScheme` for gate (A)

Knublauch prefers gate (A) **soft-closed**: `sh:class skos:Concept` + an `sh:sparql` `ASK` that the value is
`skos:inScheme opda:EvidenceMethodScheme` (Core §5.2.6 SPARQL-based constraint — *not* SHACL-AF, so no
`advanced=True`), so the value-space lives in the SKOS scheme, not duplicated in the shape. He is right on
single-source-of-truth, and I record it as the **principled** form. But I flag an honest tradeoff for the
Council rather than rubber-stamp it, because Davis/Guarino will (correctly) probe an embedded SPARQL string
as added surface:
- **Soft-close (`sh:sparql skos:inScheme`)**: value-space governed by the scheme; extends without a shape
  edit. Cost: a `sh:sparql` constraint is an opaque embedded query — harder for downstream tooling (a
  Core-only processor that doesn't implement SPARQL-based constraints; static analysers; DASH) to introspect
  than a declarative `sh:in`; and it diverges from the **one working precedent in the repo**
  (`OwnerTypeValueShape` uses a declarative `sh:in`, `opda-agent-shapes.ttl:91`).
- **Hard-close (`sh:in` over the three concept IRIs)**: declarative, introspectable, precedent-matching.
  Cost: re-states the scheme members in the shape; a 4th OIDC4IDA method needs editing both the scheme and the
  `sh:in`.

**My calibrated verdict:** for a **regulator-frozen 3-member taxonomy** (OIDC4IDA `evidence.type` is a closed,
stable enum), the soft-close's only benefit — zero-edit extensibility — is a benefit *that will essentially
never be exercised*, while its cost (embedded SPARQL, divergence from the emitted `ownerType` precedent) is
paid every day by every tool that reads the shape. So I land on **hard `sh:in`** as the *default* emission for
parity + introspectability, with the `sh:sparql skos:inScheme` soft-close named as the **upgrade path the
moment the value-space stops being regulator-frozen** (i.e. if OPDA ever mints OPDA-specific evidence methods,
flip to soft-close). This is the same "boring + Core, escalate on real need" discipline ODR-0008 §Q5a applies
to SKOS-promotion (burden on the proposer per leaf). Either form is Core and neither needs `advanced=True`;
the disagreement with Knublauch is narrow and about *introspectability-vs-extensibility on a frozen enum*, not
about the facet.

## Honest concession, restated (the pro-subclass kernel I do NOT dissolve)

Davis and Guizzardi are right that `opda:attestedBy rdfs:domain opda:VouchEvidence` (`opda-claim.ttl:131`)
is a genuine provenance-shape asymmetry (a vouch is `prov:wasAttributedTo` an Agent — attestation;
document/record is `prov:wasDerivedFrom` an artefact — derivation). A subclass gives that a clean
`rdfs:domain`. I grant this is the **one** real argument for a subclass. It is answered, not denied: the
documentary `rdfs:domain` can broaden to `opda:Evidence` under ODR-0026 §R2 (it's documentation, not
inference), and the *enforced* Vouch-only constraint lives in the conditional branch above — where ODR-0013
puts every other closed-world constraint. One asymmetric property does not justify a three-way rigid
partition **plus** three aliases.

## Where Davis and I genuinely split (for Kendall's tally)

If Davis holds "no migration; document the latent trap in one line," our disagreement is **clean and real**,
not a misunderstanding: his ratified **demand-pull bar** (ODR-0026 §Alternatives: "revisit only if a named
consumer requires it") vs my reading that **a ratified-but-orphaned `EvidenceMethodScheme` + an unemitted
ODR-0009 §Q7 dispatch obligation IS the pull** — an unfinished obligation the corpus already owns, stronger
than a hypothetical external consumer. I do not claim he is wrong on his own axiom; I claim corpus-internal
incoherence (the `ownerType`-vs-evidence split) is itself the harm an anti-pattern names, independent of an
external consumer. Kendall to adjudicate which standard governs.

---

## Verdicts (FINAL)

- **`Q1: AFFIRM — ballot: FOR`** — the pattern is an anti-pattern, named precisely: a **double-mint
  inconsistency**. The OIDC4IDA evidence axis is modelled *both* as the ratified `opda:EvidenceMethodScheme`
  Quality-Value scheme (orphaned — no property/shape references it; verified by tree-wide grep) *and* as a
  subclass tree needing three `owl:equivalentClass` aliases; meanwhile the corpus faceted the *harder*
  `ownerType` Kind-discriminator (emitted + validating, `opda-agent-shapes.ttl:47–94`). The defect is not
  "abuse of `owl:equivalentClass`" (Davis is right it's standard W3C) — it is **needing the alias at all**,
  which only the subclass choice forced, and the **incoherence with opda's own settled facet pattern**
  (Brown et al. 1998 — inconsistent solution to a recurring problem; ODR-0008 §Q5a precedent; SKOS Primer
  §2 — code value-spaces as concepts, not parallel classes). Cite: Cagle, *the structured-value test*; W3C
  SKOS Primer §2; ODR-0008 §Q5a; `opda:ownerType` (`opda-agent.ttl:184`).

- **`Q2: REVISE(facet — Option B + sh:qualifiedValueShape dispatch) — ballot: FOR`** — replace the subclass
  tree with one `opda:Evidence` class + `opda:evidenceType` (ObjectProperty ranging over the **existing
  `#evidenceMethod/*` `skos:Concept`s** in `opda:EvidenceMethodScheme` — NOT a newly-minted scheme; the
  canonical OIDC4IDA value-space already exists) as the **kind facet**, and `opda:assuranceLevel → opda:AssuranceLevelScheme`
  as the orthogonal **assurance facet** (a subclass tree on kind cannot represent the crossed assurance axis —
  Ranganathan colon-classification / faceting). Type-specific properties enforced by **SHACL-Core**
  conditional dispatch (ODR-0013's own `oneOf`→discriminated mapping; W3C SHACL Rec §4.8), including the
  **Vouch⇒eIDAS-Low cap in Core**. This is *less* ontology than the status quo, *uses* an already-ratified
  scheme, *matches* the emitted `ownerType` precedent, and *discharges* the unemitted ODR-0009 §Q7 dispatch.
  **Concession:** ODR-0009 §R5 ("do NOT collapse the three evidence types into one pattern") is ratified; the
  facet does **not** collapse them — it preserves all three as a closed coded facet with per-value Core shapes
  — but §R5's wording needs a Council amendment to "into one *undiscriminated* pattern." The Vouch
  `attestedBy` asymmetry (Davis/Guizzardi's real point) is absorbed by one dispatch branch + a documentary
  `rdfs:domain`, not a tree.

- **`Q3: REVISE(facet target now; phased migration over the EXISTING scheme concepts) — ballot: FOR`** —
  ratify the facet as the **target model now**, with a **bounded** cut-over (named target, adopting
  Knublauch's route over my opening's IRI-retype): (1) range `opda:evidenceType` over the **existing three
  `#evidenceMethod/*` concepts** (no new scheme minted) + emit `opda:EvidenceShape` (Core); (2) **retire the
  three class IRIs** — drop the `owl:Class` declarations and the three `owl:equivalentClass` aliases (NOT
  retype-in-place: an IRI must not change meta-type across versions); (3) optionally retain
  `…Evidence rdfs:subClassOf` as **documentary** (ODR-0026 §R2) for one release if external DL tooling wants
  the typing (the Isaac/Miles dual-typing option; doesn't affect enforcement); (4) retype the 15 exemplars
  (`a opda:Document` → `opda:evidenceType <…/#evidenceMethod/Document>`) — mechanical, bounded; (5) re-point
  the three DPV-refinement `targetsKind` triples (`opda-claim-annotations.ttl:28–53`); (6) update ADR-0011
  §Amendments (short-name-via-`equivalentClass`
  disposition superseded) + ODR-0009 §R5 wording. **Agreement with Davis:** no big-bang re-pin for *zero*
  pull — but the trigger is **this Council ratifying the target**, and the **orphaned `EvidenceMethodScheme`
  + unemitted §Q7 dispatch are the pull** (an obligation the corpus owns), so this is *staged*, not *deferred
  to a hypothetical consumer*. If Davis holds no-migration, record the clean split (his demand-pull bar vs my
  corpus-coherence-as-obligation) for Queen adjudication.

### Cross-references for the synthesis
- Anti-pattern + faceting: Cagle (structured-value test; *Semantic faceting over taxonomy trees*);
  W3C SKOS Primer §2; Ranganathan colon classification (orthogonal facets).
- SHACL: W3C SHACL Recommendation §4.8 (`sh:qualifiedValueShape` is **Core**); ODR-0013 constraint-mapping
  table (`oneOf` discriminated → dispatch on the discriminator); ODR-0010 line 45 (AF caveat scoped to
  `sh:rule`, not constraints).
- Repo precedent: `opda:ownerType` (`opda-agent.ttl:184`, `opda-agent-shapes.ttl:47–94`) — emitted,
  validating, entailment-free facet for a Kind-discriminator; `EvidenceMethodScheme`
  (`opda-vocabularies.ttl:179–187, 1108–1130`) — ratified, orphaned; ODR-0008 §Q5a (datatype-vs-SKOS
  binding table); ODR-0026 §R2 (model-but-don't-evaluate, supports documentary `rdfs:subClassOf` retention).
- Honest concession anchor: `opda:attestedBy rdfs:domain opda:VouchEvidence` (`opda-claim.ttl:131`);
  ODR-0009 §Rules ("a vouch is `prov:wasAttributedTo` an Agent — an attestation, not a document derivation").
