# Session 021 — Bounded-Context Implementation Plan — Tom Baker (working notes)

**Role:** Dublin Core; namespace design; vocabulary governance; SKOS.
**Lens:** the single `opda:` namespace is settled (S001 Q7 / ODR-0004) — my charge is **governance** of the new bounded-context SKOS scheme: stewardship (`opda:hasSteward`), versioning (rides the foundation `owl:versionIRI`), the **Rule 5 firewall** as a maintained invariant, and **catalogue discipline** (ODR-0002) for the three new predicates + the scheme. Citations below: SKOS Reference (Miles & Bechhofer 2009); DCMI Usage Board vocabulary-governance practice (Baker, Bechhofer, Isaac, Miles 2013); the DCMI single-change-log pattern (already adopted as ODR-0002 §Change log, ex-ODR-0014).

**Verified state I rely on (read the code, not the brief):**

- `tools/opda-gen/src/opda_gen/emitters/profiles.py:250-251` — `g.add((vctx, OPDA.overlaysContext, URIRef("https://w3id.org/opda/profiles/foundation")))`. Profile-LAYER IRI, hardcoded. Confirmed.
- `tools/opda-gen/src/opda_gen/emitters/vocabularies.py:1404-1445` — the value-scheme house style: per scheme `skos:prefLabel @en` + `dct:title @en` + `skos:definition @en` + `dct:source` + `opda:ufoCategory` + `skos:scopeNote @en` + `opda:hasSteward @en` (a **Literal**); per member `skos:inScheme` + `skos:prefLabel @en` + `skos:notation` + `skos:definition @en` + `dct:source` (+ optional `prov:wasDerivedFrom`). This is the template the context scheme MUST mirror, with two deltas (below).
- `opda-contexts.ttl` does **not** exist; `servesContext` / `consumesFrom` / `definedInContext` are emitted **nowhere**. Confirmed by grep.
- `opda:hasSteward` already exists as the steward annotation property used by the 23 value-schemes — **no new steward predicate is needed** (ODR-0019 Rule 2 already says "reuses the existing `opda:hasSteward`").

---

## Q1 — Membership authority (author vs derive vs hybrid; is module-of-definition the same axis as context-of-use?)

**Vote: FOR hybrid — DERIVED `opda:servesContext` is the default and single source of truth; a SMALL, GOVERNED hand-authored layer (`opda:definedInContext` only) is admissible reference data, NOT a parallel membership map.** And: **module-of-definition and context-of-use are different axes; neither derives the other** — this is the load-bearing distinction my lens contributes.

**Argument.**

(1) *The two axes are orthogonal — confirm ODR-0019 Rule 1 verbatim and give it the governance reading.* Rule 1 says modularity is "namespace-by-module-of-definition … NOT namespace-by-context-of-use." In governance terms these are two different *registries*:

- **Module-of-definition** = *which TTL file mints the term* (`opda-property.ttl`, `opda-agent.ttl`, …). One term has exactly **one** definition-home. This is a partition (every term in exactly one module), authored by the modeller who mints the class, stable, and already emitted.
- **Context-of-use** = *which industry overlays require the term at validation*. One term serves **many** contexts (Address serves ~10). This is a many-to-many relation, and — critically — it is a *fact about the profiles*, not a fact the term-author knows when minting.

You cannot derive one from the other because they answer different questions and have different cardinalities (1:1 partition vs M:N relation) and different authorities (the modeller vs the profile-author). **This is exactly why ODR-0020 Rule 5's firewall is sound and necessary:** the context scheme is a *use* registry; the module files are the *definition* registry; conflating them (putting a domain term `skos:inScheme` the context scheme) would assert that context-of-use IS a definition-home — the category error. So on Q1 I am with **Allemang/Davis** that derivation is the default mechanism, and against any "author the whole context map by hand" reading — but I add the governance qualifier that makes the architect's claim B partly right.

(2) *Why derive (against pure hand-authoring).* DCMI Usage Board discipline is "one fact, one home, one steward" — duplicating the overlay→term facts into a hand-maintained `servesContext` table creates a **second source of truth that drifts the moment an overlay moves context** (ODR-0019 Alternative "Hand-authored SKOS membership tags," rejected; ODR-0020 Rule 5 "derive-don't-declare"). The DCMI single-change-log pattern — which OPDA already adopted when it retired ODR-0014 into ODR-0002 §Change log — is the same principle one level up: *governance facts live in one place, not a parallel record*. A hand-authored membership map is a parallel record. Reject it as the primary mechanism.

(3) *Where the architect's Claim B ("bounded contexts belong to the ontology, not the SHACL schemas; deriving the partition from forms may be an inversion") is RIGHT, and where it is WRONG.* It is **right** that the **context concepts themselves** are ontology-layer reference data: the six `skos:Concept`s, their prefLabels, definitions, stewards, and the scheme are *authored* governed vocabulary (ODR-0020 Rule 1 — they are hand-written in `contexts.py`, not derived). It is **wrong** that *term→context membership* should be authored: membership is a projection of the overlay layer, and the overlay layer is where the perspectival "this form, this context" fact actually lives. The resolution is the hybrid that ODR-0019/0020 already ratified and that I formalise as a **governance boundary**:

| Layer | What | Authority | Mechanism |
|---|---|---|---|
| **Context vocabulary** (the scheme + 6 concepts) | the SKOS reference data | OPDA Architecture WG (authored) | hand-written in `contexts.py`, emitted to `opda-contexts.ttl` |
| **Term→context membership** (`servesContext`) | M:N use-relation | the profiles (derived) | dormant SHACL-AF CONSTRUCT; never hand-edited |
| **Definition-origin** (`definedInContext`) | homonym disambiguation only | the modeller, gated | hand-authored ONLY past ODR-0019 Rule 8; zero today |

So Claim B is not an inversion of the *vocabulary* (that IS authored in the ontology); it would be an inversion only if someone hand-authored *membership*. They are not the same predicate. Naming them apart — `servesContext` (derived) vs `definedInContext` (authored, gated) — is what keeps the two authorities from colliding. **This naming/authority split is a plan element, not just commentary** (see Q4).

**PLAN ELEMENTS (Q1):**
- Adopt the three-layer authority table above as the governance contract; record it in the new ODR (Q4).
- The context **scheme + concepts** are authored reference data (steward = WG); **membership** is derived; **definition-origin** is authored-but-gated. Three predicates, three authorities, never merged.

---

## Q2 — Placement method, the SKOS firewall, and completeness

**Vote: FOR ODR-0020's four-bucket method (A/B/C/D), with the firewall promoted from prose to a CI invariant and a completeness check that is a SET-COMPLEMENT, not a walk.**

**Argument (the firewall is the centre of my lens).**

(1) *The Rule 5 firewall, stated precisely in SKOS terms.* SKOS Reference §S26-S31 (semantic relations) and the `skos:inScheme` definition (§S12) make `skos:inScheme` the membership predicate **between a `skos:Concept` and its `skos:ConceptScheme`**. A domain term (`opda:Address`, an `owl:Class`) is **not** a `skos:Concept` and the bounded-context scheme is **not** its scheme. Therefore:

> **FIREWALL INVARIANT (Baker):** No subject that is an `owl:Class`/`owl:*Property` (a domain term) may carry `skos:inScheme opda:BoundedContextScheme`. The ONLY subjects `skos:inScheme opda:BoundedContextScheme` are the six `skos:Concept`s. Domain terms reach a context exclusively via the annotation predicates `opda:servesContext` / `opda:definedInContext` / `opda:consumesFrom`.

This is the SKOS-Reference-grounded form of ODR-0019's "identity lives in the local name, never the namespace" and ODR-0020 Rule 5's "a domain term MUST NEVER carry `skos:inScheme`." It is checkable mechanically (next).

(2) *The firewall as CI — three guards (this is my concrete deliverable).* The structural test ADR-0026 §Confirmation already names ("no domain term carries `skos:inScheme opda:BoundedContextScheme`") becomes a standing `odr-review`/CI invariant set:

```sparql
# GUARD F1 — firewall: no non-Concept inScheme the context scheme  → MUST be empty
SELECT ?s WHERE {
  ?s skos:inScheme opda:BoundedContextScheme .
  FILTER NOT EXISTS { ?s a skos:Concept }
}
# GUARD F2 — no upstream authority typed as a context Concept  → MUST be empty
SELECT ?s WHERE {
  ?s a skos:Concept ; skos:inScheme opda:BoundedContextScheme .
  ?s a opda:Organisation .                       # an Organisation must never be a context
}
# GUARD F3 — no hand-authored servesContext in SOURCE TTL  → MUST be empty
#   (servesContext appears ONLY in the generated/derived view, never in authored modules)
SELECT ?s WHERE { ?s opda:servesContext ?c }     # run over the hand-authored source set only
```

F1 is the firewall; F2 is the ODR-0020 Rule 2 boundary (upstream = Organisation, never a context); F3 is the derive-don't-declare guarantee (membership is never hand-written). All three are "result set MUST be empty" — the cheapest possible CI shape, and they mirror the value-scheme integrity check already in the corpus (ODR-0011 §1a `opda:ConceptInExactlyOnePrimarySchemeShape`).

(3) *Completeness check — by set-complement, not a 935-leaf walk.* My lens says completeness is a **vocabulary-coverage** question answerable without enumerating every leaf:

```
LET defined   = { every opda: term minted in any module TTL }              # the definition registry
LET required  = { ?t : ?vc opda:requires ?t }  over all emitted profiles    # the use registry (union of overlays)
LET serves    = { ?t : ?t opda:servesContext ?c }  (the derived view)
LET consumes  = { ?t : ?t opda:consumesFrom ?org }  (bucket C)

Bucket coverage is COMPLETE iff:
  (required ∩ defined)  ==  domain(serves)            # every required term got a derived tag (A/B)
  AND  (defined \ required \ consumes)  ==  untagged   # bucket D is exactly the complement — no orphan
  AND  consumes ∩ domain(serves) == ∅                 # C and A/B are disjoint (no term both consumed and served)
```

This makes "place EVERY entity" auditable as three set identities over the emitted graph, run in CI, rather than a manual walk. **Untagged (bucket D) is not a gap — it is a computed signal** (the kernel/scaffolding complement). The check *fails loudly* only if a term is required-but-not-served (derivation bug) or both-consumed-and-served (a category collision). That is the completeness proof the brief asks for, expressed as governance arithmetic.

(4) *Multi-membership, shared kernel, upstream, spanning, untagged — all already discharged by the buckets, no new vocabulary:*
- **Multi-membership / shared kernel / spanning** → bucket B: the *multiplicity of `servesContext` edges IS the spanning* (ODR-0020 Rule 3). No `opda:sharedKernel` flag, no `SharedKernel` sentinel — a boolean "serves all six" is a fiction the seventh profile breaks (ODR-0020 Rule 4). My governance objection to a sentinel is identical to DCMI's objection to "applies to all" literals: they are unmaintainable the moment the world extends.
- **Upstream-as-Organisation** → bucket C: `opda:consumesFrom → opda:Organisation`, never `servesContext`, never a `skos:Concept` (F2 guards this).
- **Untagged** → bucket D: the set-complement above.

**PLAN ELEMENTS (Q2):**
- Ship GUARDS F1/F2/F3 as `odr-review`/CI invariants in the same commit as `contexts.py` (ADR-0026 §Confirmation already promises F1; add F2/F3 and the set-complement completeness check).
- No new membership vocabulary beyond the three ratified predicates; no kernel sentinel; spanning = edge-multiplicity.
- The completeness audit is the three set identities, not a 935-leaf walk — decoupling placement-coverage from the descriptive-walk backlog (see Q3).

---

## Q3 — Missing-ontology creation & sequencing (does placement block on the 935-leaf walk + ~14 emitters?)

**Vote: AGAINST blocking. Scheme emission + firewall + the corrected wiring SHIP NOW; the 935-leaf walk and the ~14 form-profile emitters are a SEPARATE, PARALLEL backlog that the derived view absorbs incrementally with NO governance change.**

**Argument.** This is the cleanest consequence of the derive-don't-declare design, and my lens makes the decoupling explicit:

- The **context vocabulary** (scheme + 6 concepts + 3 predicate declarations) depends on **nothing** in the descriptive walk — it is authored reference data (ODR-0020 Rule 1, ADR-0026 Option A). It can emit against today's corpus.
- The **derived membership view** is a *function of whatever profiles exist*. Today only `baspi5` is emitted; the CONSTRUCT yields exactly the EstateAgency edges for baspi5's `requires` set, and that is **correct, complete-for-now output** — not a partial failure. As each of the ~14 form-profile emitters lands (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29 …), the *same dormant rule* picks up the new `overlaysContext`/`requires` edges with **zero edits to the context scheme or its governance**. That is the whole point of deriving: the use-registry grows monotonically without touching the vocabulary registry.
- The **935-leaf descriptive walk** (ODR-0008 declare-once) mints more domain terms. Those terms enter the *definition registry*; whether they ever get a `servesContext` edge depends solely on whether a profile requires them (bucket A/B) or they stay scaffolding (bucket D). Again: no governance change, the set-complement completeness check just recomputes.

So **placement does not block on either backlog.** The dependency is one-directional and lazy: more profiles ⇒ richer derived view; more leaves ⇒ larger definition set; the scheme, the predicates, the firewall, and the stewardship are invariant under both. Sequencing: emit the scheme **first** (it is the join target the future profiles point `overlaysContext` at); fix the wiring **second**; ship the derivation **dormant third**; let profiles and leaves accrete **fourth, asynchronously**.

**PLAN ELEMENTS (Q3):**
- Decouple: scheme + predicates + firewall are Phase 1 (no backlog dependency). The form-profile emitters and the 935-leaf walk are tracked as their own backlog (ADR-0026 already names them "downstream work"); record them in `docs/governance/deferred-work` with the Linked-artefact column (per the project's deferred-work discipline) rather than gating S021 on them.
- The dormant CONSTRUCT is authored once and never revised as profiles land — verify this with a test that runs the rule over {baspi5} and over {baspi5, a stub second profile} and asserts the second yields strictly more edges with no rule change.

---

## Q4 — ODR/ADR scaffolding (new ODR vs amend; ADR-0026 revision; catalogue/governance discipline)

**Vote: FOR a thin NEW implementation-sequencing ODR (governance/stewardship of the scheme + 3 predicates) + KEEP ADR-0026 as the emission ADR (lightly revised) + NO new vocabulary-catalogue entries in ODR-0002 (SKOS/Dublin Core already Core-tier; the predicates are `opda:`-minted, not external).** This is my primary deliverable section.

**Argument.**

(1) *Catalogue discipline (ODR-0002) — the careful answer.* The three new predicates (`opda:servesContext`, `opda:consumesFrom`, `opda:definedInContext`) and the scheme are **`opda:`-minted terms in the single namespace** — they are NOT external vocabularies, so they do **not** earn a row in ODR-0002's Core/Conditional/Defer tables (those tables govern *external* vocabulary admission). ODR-0002's rule is the opposite-facing guard: "modellers MUST NOT re-mint terms in `opda:` that duplicate adopted-tier semantics." So the catalogue question is: **do these three predicates duplicate SKOS / Dublin Core / PROV-O semantics?** My adjudication:

- `opda:servesContext` / `opda:definedInContext` — there is **no** SKOS or DCT predicate for "this OWL term is used-in / defined-in this perspectival context concept." `skos:inScheme` is Concept→Scheme (firewall forbids reusing it here); `dct:subject` is the nearest DCT relative but is a topical-aboutness predicate, not a derived use-relation, and ODR-0019 Rule 3 already restricts `dct:subject` to the profile-invisible hand-authored exception. So minting two `opda:` annotation properties is **justified non-duplication** — record that justification (the ODR-0002 "introducing ODR cites the use case" discipline, §Adoption pattern rule 5).
- `opda:consumesFrom` — this is the DDD **Conformist** relationship pointing at an `opda:Organisation`/`prov:Agent`. PROV-O's `prov:wasAttributedTo` and `dct:source` carry the *provenance* side and ODR-0020 Rule 2 already pairs them with `consumesFrom`; but neither names the *Conformist architectural relationship* itself. Justified mint. (Note: confirm it is **not** silently duplicating `prov:wasInfluencedBy` — it is narrower and architectural, so keep it, but cite the distinction.)

**Conclusion:** no ODR-0002 table change; instead, a **one-line provenance note** per ODR-0002 §Adoption-pattern rule 5 ("when an external vocabulary appears in a new layer … the introducing ODR cites the use case") — adapted here to "three new `opda:` annotation predicates are minted; the introducing ODR (the new S021 ODR) records why each is non-duplicative of SKOS/DCT/PROV-O." This keeps the single-change-log discipline: the justification lives in one ODR, not scattered.

(2) *New ODR vs amend ODR-0019/0020.* ODR-0019 (representation pattern) and ODR-0020 (scheme population + mapping) are **`status: accepted` and complete as decisions** — they should NOT be reopened to carry an implementation plan; that would muddy a ratified pattern with sequencing churn (and ODR-0001's per-kind discipline keeps `pattern` ODRs about the pattern, not the rollout). Author **one new ODR** — `kind: architecture` or a lightweight implementation-sequencing record — whose job is the *governance + phasing* this session produces: the three-layer authority table (Q1), the firewall CI invariant set (Q2), the decoupling + sequencing (Q3), and the stewardship/versioning rules (Q5). It `depends-on: [ODR-0019, ODR-0020, ODR-0011, ODR-0002, ODR-0017]` and `implements: [ODR-0003]`. It does **not** re-decide anything ODR-0019/0020 settled; it operationalises them. (If the Queen prefers, the stewardship/versioning + firewall-CI content could instead land as a short **amendment block inside ODR-0020** since ODR-0020 already owns scheme population — I'd accept that, but a separate sequencing ODR keeps the ratified pattern clean and is my preference.)

(3) *ADR-0026 — keep, revise lightly.* ADR-0026 is the correct home for the *emission mechanics* (the `emitters/contexts.py` module, the `profiles.py:250` fix, the dormant CONSTRUCT in `shapes.py`, the byte-identity re-pin). It is already well-formed and cites the verified bug. Revisions needed:
- Add F2/F3 + the set-complement completeness check to §Confirmation (it currently names only F1).
- Add the **two house-style deltas** the context scheme needs vs the value-scheme template (§Q5 below) so the emission test pins them.
- Cross-reference the new sequencing ODR once it exists.
ADR-0026 should **not** be superseded — it is sound; it just gains a few confirmation rows.

(4) *Predicate declaration discipline.* Per ADR-0026 §Work-item 2, the three predicates are `owl:AnnotationProperty` (membership/provenance, not logical typing) carrying A9 metadata, emitted in `opda-contexts.ttl` (or the annotations graph per the three-graph separation). My governance addition: each predicate declaration MUST carry `rdfs:isDefinedBy <the new ODR>` + `dct:source <ODR-0019 or ODR-0020>` so the predicate's *governing decision* is dereferenceable — the same `dct:source`-to-origin discipline every value-scheme member already follows (`vocabularies.py:1441`).

**PLAN ELEMENTS (Q4):**
- **NEW ODR** (implementation-sequencing / governance): three-layer authority table + firewall CI invariant set + sequencing/decoupling + stewardship/versioning. `depends-on [ODR-0019, ODR-0020, ODR-0011, ODR-0002, ODR-0017]`. Records the non-duplication justification for the three predicates (ODR-0002 §Adoption-pattern rule 5).
- **NO ODR-0002 table row** — the predicates are `opda:`-minted, not external; only a one-line non-duplication justification in the new ODR. SKOS + Dublin Core are already Core-tier, so the scheme itself needs no admission.
- **ADR-0026 light revision** — add F2/F3 + completeness check + the two house-style deltas to §Confirmation; cross-cite the new ODR; do NOT supersede.
- Each of the 3 predicate declarations carries `rdfs:isDefinedBy` + `dct:source` to its governing record.

---

## Q5 — Implementation plan: phasing, gates, emission order; versioning & stewardship of the scheme + 3 predicates

**Vote: FOR the phased plan below.** Versioning and stewardship are my lens's core deliverable here.

**(A) Stewardship — DCMI Usage Board discipline, reusing the existing predicate.**

- The **scheme** carries `opda:hasSteward "OPDA Architecture WG"@en` (a **Literal**, per the value-scheme house style at `vocabularies.py:1432` and ODR-0020 Rule 1). **No new steward predicate** — ODR-0019 Rule 2 explicitly reuses `opda:hasSteward`; minting a steward class/IRI would be the namespace-plurality ODR-0019 refuses, applied to governance metadata.
- Each of the **six context concepts** carries its own `opda:hasSteward` Literal naming the real-world domain authority (ODR-0020 Rule 1 already gives these: Conveyancing → "Law Society / SRA / CLC"; Surveying → "RICS"; + EstateAgency, MortgageLending, PropertyDataServices, PropertyTechnology). DCMI practice = "one named steward (with deputy) per vocabulary" (Baker et al. 2013, the FIBO precedent ODR-0011 §1a cites). The scheme-steward (WG) governs *the scheme*; the concept-steward (domain body) is the *real-world authority for that context's meaning* — two governance levels, both expressed with the one predicate, no plurality of predicates.
- **Steward of the three predicates** = the WG (they are infrastructure, declared in `contexts.py`), recorded via `rdfs:isDefinedBy` to the new ODR (Q4).

**(B) Versioning — the scheme RIDES the foundation, no independent version surface.**

- ODR-0020 §Consequences and ADR-0026 §Work-item 5 already settle this: the scheme rides `foundation.ttl`'s `owl:versionIRI`; there is **no per-scheme `owl:versionIRI`**. My governance endorsement and the reasoning: a context scheme that minted its own version IRI would fork the version graph (the exact "URI-graph break" ODR-0002 §Promotion-and-demotion warns against — "Core never demotes … every downstream module dereferences Core"). The 23 value-schemes already ride the foundation version; the context scheme is the same class of artefact and MUST follow.
- **Per-concept lifecycle** uses the ODR-0011 §5a deprecation pattern (the DCMI three-case mechanism: deprecation-with-replacement `owl:deprecated` + `dct:isReplacedBy`; retirement `owl:deprecated` + `skos:historyNote`; substantive-redefinition `prov:wasDerivedFrom`). So if a seventh industry context is ever ratified, or one merges (e.g. a regulator consolidation), the change is a *concept-level* lifecycle event on `opda:BoundedContextScheme`, NOT a scheme re-version and NOT a namespace event. This is the maintainability proof: the scheme absorbs context-set changes through SKOS concept lifecycle, riding one version IRI.
- `skos:exactMatch` to external steward vocabularies (RICS/Law-Society published taxonomies, if any) is **DEFERRED** (the cross-vocab gate — ODR-0020 §Consequences, ODR-0011 Q3 Phase-3.5 audit). Do not author cross-vocabulary mappings now.

**(C) Two house-style DELTAS the context scheme has vs the value-scheme template** (must be pinned in ADR-0026's emission test):

1. **Membership predicates differ.** Value-scheme members use `skos:inScheme`. Context concepts use `skos:inScheme` **AND** `skos:topConceptOf` (ODR-0020 Rule 1 — the scheme is flat, so every concept is a top concept). SKOS Reference §S37-S46: `skos:topConceptOf` is the inverse of `skos:hasTopConcept` and asserts the concept is a top-level entry of the scheme; correct for a flat scheme with no `skos:broader`. The value-schemes do NOT all use `topConceptOf` (some are hierarchical via broader/narrower — ODR-0011), so this is a genuine delta the emitter must encode, not inherit.
2. **`opda:ufoCategory` value.** Value-schemes carry one of the seven ODR-0011 §8a categories. The context scheme's concepts are an **anti-rigid perspectival Role-like community of practice** (ODR-0019 Rule 4, ODR-0020 Rule 6) — which is **none of the seven value-vocabulary categories** (Role label / Phase label / Quale-in-Region / Method-plan code / Quality Region / Substance Kind label / Quality Value). Governance call: do **NOT** force-fit it into the seven, and do **NOT** silently omit `ufoCategory` (the `odr-review` lint at ODR-0011 §8a blocks `accepted` on missing `ufoCategory`). Two clean options — **(a)** the scheme is not a value-vocabulary so the §8a lint simply does not target it (the lint reads "each `kind: pattern` ODR's value-`skos:ConceptScheme` declarations"; the context scheme is governed by ODR-0019/0020, not ODR-0011, so it is out of the §8a lint's scope); or **(b)** if the WG wants an explicit category, it is the **eighth UFO category** ("Perspectival community of practice / anti-rigid Role-like context") — and ODR-0011 §Re-open-triggers *already names* the eighth-category mechanism: "an Author-only amendment to ODR-0011 adds the category with explicit `dct:source` to UFO/DOLCE + ODR-0011." **My recommendation: (a)** — keep the context scheme outside the value-vocabulary §8a regime (it is a different kind of scheme, governed by ODR-0019/0020); if anyone insists on a `ufoCategory` triple for tooling uniformity, fire the §8a eighth-category re-open trigger rather than mislabel it as one of the seven. Flag this to Guizzardi for the UFO-category adjudication.

**(D) Phasing, gates, emission order.**

| Phase | Work | Gate / verify |
|---|---|---|
| **P1 — Vocabulary** | `emitters/contexts.py` → `opda-contexts.ttl`: `opda:BoundedContextScheme` + 6 concepts (each `skos:inScheme` + `skos:topConceptOf` + prefLabel + definition + `opda:hasSteward` Literal); 3 predicate declarations as `owl:AnnotationProperty` + `rdfs:isDefinedBy`/`dct:source`. Wire under foundation `owl:imports`. | Structural test: exactly 1 `skos:ConceptScheme`, 6 `skos:Concept`s each `topConceptOf`; 3 annotation props declared; **GUARD F1 empty**. Byte-identity on 2nd run. |
| **P2 — Wiring fix** | `profiles.py:250` → `CONTEXT_OF` map; `baspi5` emits `overlaysContext opda:EstateAgencyContext`; profile-layer link (if still needed) moves to `opda:profileLayer`. | Bug-fix test: `baspi5.ttl` emits `opda:overlaysContext opda:EstateAgencyContext`, not the `/profiles/foundation` IRI. CI baseline re-pinned same commit. |
| **P3 — Dormant derivation** | SHACL-AF CONSTRUCT (Rule 5) in `emitters/shapes.py` → `opda-shapes.ttl`, **excluded from active validation set** (dormant per ODR-0019 Rule 8). | Dormancy test: rule parses, present, fires zero results on the 15 exemplars. Monotonicity test: {baspi5} vs {baspi5+stub} yields strictly more edges, rule unchanged. |
| **P4 — Governance CI** | GUARDS F2/F3 + set-complement completeness check as `odr-review`/CI invariants. | F2/F3 empty; completeness identities hold over emitted graph. |
| **P5 — Backlog (async, NON-blocking)** | ~14 form-profile emitters + 935-leaf walk land over time; each new profile's `overlaysContext` points at its context concept via `CONTEXT_OF`; derived view grows with no scheme/governance edit. | Each profile commit: its `requires` set appears in the derived view; completeness check still holds; no new hand-authored `servesContext` (F3 stays empty). |

**Gates between phases:** P1 is the join-target, so it is first and blocks nothing on the backlog. P2 depends only on P1 (needs the concept IRIs to point at). P3 depends on P2 (needs corrected `overlaysContext`). P4 can land with P1 (F1) and complete at P3 (F3 needs the dormant rule distinguished from source). P5 is unordered and asynchronous.

**Versioning gate at each emission:** every regeneration bumps `foundation.ttl` `owl:versionInfo` for the new artefact and re-pins the byte-identity baseline in the **same commit** (ADR-0026 §Work-item 5, ADR-0007 §6a) — the scheme never gets its own version IRI.

**PLAN ELEMENTS (Q5):**
- Scheme + each concept carry `opda:hasSteward` **Literal** (reuse; no new steward predicate); scheme-steward = WG, concept-steward = domain body (two governance levels, one predicate).
- Scheme rides `foundation.ttl` `owl:versionIRI`; **no per-scheme version**; per-concept changes use the ODR-0011 §5a SKOS lifecycle (deprecation/retirement/derivation) — a seventh/merged context is a concept-lifecycle event, not a re-version.
- Pin the **two house-style deltas** in ADR-0026's emission test: (1) `skos:topConceptOf` on every concept (flat scheme); (2) `ufoCategory` handling — keep the context scheme OUT of the ODR-0011 §8a value-vocabulary lint (recommendation), or fire the §8a eighth-category re-open trigger; never mislabel as one of the seven. (Defer to Guizzardi on UFO category.)
- `skos:exactMatch` to external steward vocabularies DEFERRED (cross-vocab gate).
- Five-phase order P1→P5; P1 first (join target); backlog (P5) asynchronous and non-blocking.

---

## Cross-talk targets (one opening pass)

- **Allemang / Davis** (derive vs author): I'm WITH you that derivation is the default and the single source of truth — but I want explicit agreement on the *governance boundary*: the context **vocabulary** (scheme + concepts) is authored reference data (steward = WG), while **membership** is derived. The architect's Claim B is right about the vocabulary, wrong about membership; naming them apart (`servesContext` derived vs `definedInContext` authored-gated) is what prevents a parallel source of truth. Do you accept the three-layer authority table (Q1)?
- **Guizzardi** (SKOS-facet + firewall): two asks. (1) Confirm the firewall invariant F1 is the correct SKOS encoding of your "context is a facet, never an identity-bearing term" — domain terms reach contexts only via annotation predicates, never `skos:inScheme`. (2) **UFO-category adjudication for the scheme itself:** the context concepts are anti-rigid Role-like communities of practice — none of ODR-0011's seven value-vocabulary categories fit. I recommend keeping the context scheme OUT of the §8a value-vocabulary lint regime entirely; the alternative is firing ODR-0011's eighth-category re-open trigger. Which do you want?
- **Cagle / Knublauch** (SHACL operationalisation): the firewall + completeness checks I propose (F1/F2/F3 + the three set-identities) are governance invariants — do they belong as `odr-review` lints, as SHACL meta-shapes over the shapes graph (your ODR-0017 §2a `sh:Violation`-for-shape-drift carve-out), or both? I lean: F1/F2 as SHACL node-shapes (`sh:Violation`, mirroring ODR-0011 §1a `ConceptInExactlyOnePrimarySchemeShape`); F3 + completeness as `odr-review`/CI over the *source* set (since "no hand-authored `servesContext`" is a source-provenance fact, not a graph-shape fact).

---

## Settled position (one line per question)

- **Q1: FOR hybrid** — derived `servesContext` is the single source of truth; the scheme+concepts are authored reference data; `definedInContext` is authored-but-gated. Module-of-definition and context-of-use are orthogonal axes; neither derives the other (the reason the firewall is sound).
- **Q2: FOR** the four-bucket method + firewall promoted to CI (GUARDS F1/F2/F3) + completeness as three set-identities (not a 935-leaf walk).
- **Q3: AGAINST blocking** — scheme+firewall+wiring ship now; the ~14 profile emitters and 935-leaf walk are an async, non-blocking backlog the derived view absorbs with zero governance change.
- **Q4: FOR** a thin new sequencing/governance ODR + KEEP & lightly revise ADR-0026; **NO ODR-0002 table row** (predicates are `opda:`-minted, not external — only a one-line non-duplication justification).
- **Q5: FOR** the five-phase plan; scheme rides the foundation version (no per-scheme version); `opda:hasSteward` Literal reused at two governance levels; two house-style deltas (`topConceptOf`; `ufoCategory` kept out of the §8a value-lint) pinned in the emission test.
