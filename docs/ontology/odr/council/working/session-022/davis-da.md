# Session 022 — Ian Davis (Devil's Advocate)

**Role:** Devil's Advocate. BBC `/programmes/`, data.gov.uk, ex-Talis. Publish-first, deployment-at-scale, allergic to over-engineering.
**Axis this session:** aligned with the architect — *attack the invention; demand the boring standard.* Per ODR-0001 I WITHDRAW or HOLD on every contested question with a named condition.
**Position in one line:** OPDA has hand-rolled a profile-description vocabulary that **W3C standardised in 2019 (PROF)** and a vocabulary-of-origin predicate that **RDFS standardised in 2000 (`rdfs:isDefinedBy`)**. The boring standards exist, are in this project's adoption universe already, and fit. The bespoke apparatus loses the invention test on three of its five constructs and the YAGNI test on a fourth.

---

## The invention test (the lens for all four questions)

For every opda-specific construct I demand: **name the W3C/DCMI standard this reinvents, or justify why the standard doesn't fit.** I ran the test. Verified against the live TTL (`opda-classes.ttl:60`, `profiles/baspi5.ttl:71`, `profiles.py:250`) and the W3C specs (PROF [DX-PROF], Conneg-by-Profile, RDF Schema 1.1):

| opda construct | What it does | Standard it reinvents | Fit verdict |
|---|---|---|---|
| `opda:ValidationContext` (5 props: `profileURI`, `requires`, `overlaysContext`, `sourcedFrom`, `formVersion`) | reifies "a SHACL profile over a base, for a named context" | **`prof:Profile`** + **`prof:hasResource`/`prof:ResourceDescriptor`** | **LOSES — exact match** |
| `opda:overlaysContext` | "this profile is a profile of / overlays this base" | **`prof:isProfileOf`** (domain `prof:Profile`, range `dct:Standard`) | **LOSES — exact match** |
| `opda:requires` (profile → bound classes) | "what a payload in this profile must carry" | `sh:property … sh:minCount 1` already (ODR-0010 Rule 1); the *profile→shapes* link is `prof:hasResource` + `prof:hasRole role:Validation` + `dct:conformsTo <shacl>` | **REDUNDANT framing** — the constraint already IS SHACL; the bespoke `requires` re-points it |
| `opda:servesContext` (derived; dormant) | stored 2-hop view over `overlaysContext`+`requires` | nothing — but it has **no named consumer** and ships dormant | **CUT on YAGNI (Rule 8)** |
| `opda:definedInContext` (authored home) | "this term's conceptual home / vocabulary of origin" | **`rdfs:isDefinedBy`** (home/origin) + `dct:source`/`prov:wasAttributedTo` (authority) | **LOSES — reinvents `rdfs:isDefinedBy`** |
| `opda:BoundedContextScheme` (6 SKOS concepts) | the perspectival communities of practice | `skos:ConceptScheme` (legitimate) **but** the profiles' `prof:Profile`s already name the communities | **SURVIVES, but possibly redundant with PROF** |

**The headline finding — PROF is a verbatim match, in W3C's own words.** `prof:Profile` is defined as *"A specification that constrains, extends, combines, or provides guidance or explanation about the usage of other specifications"* whose aim is *"to increase interoperability **within a community of users** by introducing constraints, extensions or combinations on the use of more general specifications."* Read that back against ODR-0010's `opda:ValidationContext` ("required relative to a named, dereferenceable context") and ODR-0019/0020's bounded context ("a perspectival **community of practice** that owns a SHACL overlay profile"). **W3C wrote the sentence the council has been paraphrasing for three sessions.** PROF's Example 1 ships exactly OPDA's pattern: `prof:hasRole role:Validation ; dct:conformsTo <https://www.w3.org/TR/shacl/>` with the SHACL shapes file linked via `prof:hasArtifact`.

**The killer detail for Guarino's ghost.** At S010, `opda:ValidationContext` was minted *specifically* to answer Guarino's "no fixed model theory" objection — to convert "required (depending)" into "required relative to a named context." PROF gives that **as a standard OWL axiom**: `dct:conformsTo owl:propertyChainAxiom ( prof:isProfileOf dct:conformsTo )` — conform to the profile ⇒ conform to the base. **The fixed model theory Guarino demanded is a one-line PROF import, not a five-predicate bespoke reification.** OPDA rebuilt, by hand, the exact thing W3C had already axiomatised.

---

## Q1 — FORM↔BASE ASSOCIATION (the convention)

### Attack
The current convention is `opda:ValidationContext` with five hand-minted predicates, of which `opda:overlaysContext` is the form↔base link. **Name the standard it reinvents.** I have: **W3C PROF**. `prof:Profile` IS the overlay profile; `prof:isProfileOf` (range `dct:Standard`) IS the form↔base association; `prof:hasResource → prof:ResourceDescriptor` with `prof:hasRole role:Validation` + `prof:hasArtifact <shapes.ttl>` + `dct:conformsTo <shacl>` IS the profile→shapes binding. This is not a loose analogy — it is the spec's own worked example. BBC `/programmes/` and data.gov.uk did **not** mint per-publisher profile-linking predicates; they used the standards (and pre-PROF, `dct:conformsTo` directly). The single-team Published Language that OPDA is does not earn a bespoke profile vocabulary.

Why the standard fits where the bespoke loses: PROF is **built on DCMI + DCAT lineage**, both already in OPDA's adoption catalogue (ODR-0002: DCT Core; DCAT Conditional — and *I*, Davis, pushed DCAT to Core twice on the "publish-first / findable on data.gov.uk" argument). PROF is the publish-side profile standard from the same Dataset Exchange WG. It is not exotic; it is the boring continuation of decisions this council already made.

### The named convention I endorse
**Form↔base association = `prof:isProfileOf` on a `prof:Profile`.** Each overlay (`baspi5`, `ta6`, …) is a `prof:Profile`; `prof:isProfileOf <base-PDTF-spec>` records that it profiles the base; `prof:hasResource [ prof:hasRole role:Validation ; prof:hasArtifact <…/baspi5-shapes.ttl> ; dct:conformsTo <shacl> ]` binds it to its SHACL shapes; `prof:hasResource [ prof:hasRole role:Schema ; … ]` can bind the JSON-Schema overlay. The `dct:conformsTo` property-chain axiom gives conformance inheritance for free — *retiring the bespoke reification that existed only to supply it.*

### Vote
**AGAINST** the bespoke `opda:ValidationContext`/`opda:overlaysContext` convention as the *recommended practice*. **FOR** PROF as the form↔base convention.

### WITHDRAW / HOLD + named condition
**HOLD.** I do not get to unilaterally rip out a shipped, ratified S010 construct mid-session. **Named condition to WITHDRAW the objection:** the council (a) records **PROF as the canonical, recommended form↔base convention** going forward, and (b) commissions a one-page **PROF-fit spike** — re-express `baspi5`'s `ValidationContext` as a `prof:Profile` + `prof:hasResource` and confirm the round-trip (ODR-0010 §Q7) still holds and Guarino's fixed-model-theory is satisfied by the property-chain axiom. If the spike shows PROF cannot carry `formVersion`/`sourcedFrom` (it can: `dct:hasVersion`/`prov:wasAttributedTo` on the ResourceDescriptor), *then and only then* is a thin bespoke supplement justified — declared as `rdfs:subPropertyOf` the PROF terms, never freestanding.

### What I'd DELETE
- `opda:overlaysContext` → replace with `prof:isProfileOf`. (This also dissolves the ODR-0020/ADR-0026 `profiles.py:250` "bug" — there is no mis-targeted predicate to fix if the predicate is `prof:isProfileOf` pointing at the base spec.)
- `opda:profileURI`, `opda:sourcedFrom`, `opda:formVersion` → `prof:Profile` IRI itself, `prov:wasAttributedTo`, `dct:hasVersion`.
- Keep `opda:ValidationContext` **only** as `rdfs:subClassOf prof:Profile` if a genuinely OPDA-specific facet survives the spike; otherwise delete it too.

---

## Q2 — METADATA ON A SHACL / PROFILE DEFINITION (the convention)

### Attack
"Metadata on a SHACL/profile definition" is **the exact problem PROF was chartered to solve.** The question is almost a tautology against the spec: `prof:ResourceDescriptor` is defined as *"a resource that defines an aspect — a particular part or feature — of a Profile,"* carrying `dct:format` (the formalism), `dct:conformsTo` (the standard it adheres to, e.g. SHACL), and `prof:hasRole` (its purpose). That is profile-definition metadata, standardised. OPDA instead hangs `dct:source` (kept — that one's right, ODR-0010 Rule 4) plus a clutch of bespoke predicates on a bespoke class. **Name the standard.** PROF, again — plus the parts already correct: `dct:source`/`rdfs:isDefinedBy` for traceability (ODR-0010 Rule 4 already mandates `dct:source` to the form-question IRI — *that part is the boring standard and survives untouched*).

The over-engineering here is **the reification class itself**. ODR-0010's whole `opda:ValidationContext` was a workaround for "a `sh:minCount` is a free-floating axiom unless we name its context." PROF names the context as a first-class `prof:Profile` and binds the shapes by `role:Validation`. No bespoke reification needed.

### The named convention I endorse
**Profile/SHACL-definition metadata = PROF `ResourceDescriptor` + DCMI/PROV on it.** Per shapes resource: `prof:hasRole role:Validation`, `dct:conformsTo <shacl-spec>`, `dct:format`, `dct:source`/`rdfs:isDefinedBy` to the governing ODR (the parts OPDA already does right), `prov:wasAttributedTo` the steward, `dct:hasVersion` the form version. **No new vocabulary minted.**

### Vote
**AGAINST** the bespoke `opda:ValidationContext`-as-metadata-carrier. **FOR** PROF `ResourceDescriptor` + DCMI/PROV.

### WITHDRAW / HOLD + named condition
**HOLD**, folded into the Q1 spike (same artefact). **Named condition to WITHDRAW:** the spike demonstrates the five `ValidationContext` facts re-expressed losslessly as PROF + DCMI/PROV. The one fact I will concede may need a local term is `opda:requires` *at term-grain* (which OPDA classes/leaves a profile binds) — but that is already `sh:property`/`sh:minCount` in the shapes graph (ODR-0010 Rule 1), so the profile need only *point at the shapes* via `role:Validation`, not re-list the requirements. If re-listing at the profile node is genuinely wanted for query convenience, declare it `rdfs:subPropertyOf` a PROF/DCT relation, not freestanding.

### What I'd DELETE
- The premise that profile metadata needs a bespoke carrier class. Keep `dct:source` (correct); replace the reification with `prof:ResourceDescriptor`.

---

## Q3 — "WHICH CONTEXT A TERM BELONGS TO" (`definedInContext` vs the standard)

### Attack
This is the reinvention-of-provenance charge, and it lands. `opda:definedInContext` is glossed in ODR-0019 Rule 5 as *"the context a term's definition originates in"* and in S021 as *"a quasi-identity / provenance-of-conception relation … a Universal has one conceptual home."* **That is the definition of `rdfs:isDefinedBy`**, verbatim from RDF Schema 1.1: *"an instance of rdf:Property that is used to indicate a resource defining the subject resource."* One home, recorded by pointing the term at its defining resource. Standardised in 2000. **Used in ZERO opda TTLs today** (verified: `grep isDefinedBy` on the emitted ontology returns nothing) — so OPDA is about to mint a new predicate to do a job the oldest applicable W3C standard already does and which the project has simply never wired up.

The tell is in S021 itself: the synthesis proposes each new predicate *additionally* carry `rdfs:isDefinedBy → ODR-0019/0020`. So the council already reaches for `rdfs:isDefinedBy` to say where the *predicate* is defined — while minting `opda:definedInContext` to say where a *term* is defined. **Same relation, two names, because one is pointed at an ODR and the other at a SKOS concept.** That's not a semantic difference; it's the same "defining resource" arrow with different targets.

The split S021 leaned on — "home (rigid) vs usage (anti-rigid)" — is real and I do not contest *that distinction*. But it does not license a **new predicate**: the rigid-home half is `rdfs:isDefinedBy` (origin/definition) optionally narrowed by `dct:source`/`prov:wasAttributedTo` (authority); the anti-rigid-usage half is `servesContext`, which I'm cutting on YAGNI anyway (Q4). What survives is: point each term at its defining context/module with `rdfs:isDefinedBy`, and at its legal/authority source with `dct:source`. Both standard. Both already in the catalogue.

**FIBO check (over to Kendall):** does FIBO mint a `definedInContext`-style context-membership predicate, or does it use `rdfs:isDefinedBy` to point each term at its defining module/ontology? My understanding of FIBO practice is the latter — `rdfs:isDefinedBy` to the owning ontology IRI, module-of-definition, never a bespoke membership predicate. If FIBO (Kendall's own corpus) uses `rdfs:isDefinedBy`, `opda:definedInContext` is dead on arrival.

### The named convention I endorse
**"Which context a term belongs to (its home)" = `rdfs:isDefinedBy` → the owning context's IRI** (or, for a shared-kernel term, the foundation module IRI), **plus `dct:source` for the legal/authority origin** (already mandated by ODR-0010 Rule 4 and present on terms). Usage (`servesContext`) is cut (Q4). "As defined in Context A" remains a SPARQL query — but over `rdfs:isDefinedBy`, the standard predicate, not a bespoke one.

### Vote
**AGAINST** minting `opda:definedInContext`. **FOR** `rdfs:isDefinedBy` (+ `dct:source`) as the home/origin convention.

### WITHDRAW / HOLD + named condition
**HOLD.** **Named condition to WITHDRAW:** one of two outcomes — (a) the council re-casts the home relation as `rdfs:isDefinedBy` pointing at the context/module IRI and drops `opda:definedInContext` entirely; **or** (b) if a genuinely distinct semantic is proven that `rdfs:isDefinedBy` cannot carry (I have not heard one — "context" vs "ontology module" is a target difference, not a relation difference), then `opda:definedInContext` is declared **`rdfs:subPropertyOf rdfs:isDefinedBy`**, so it inherits the standard semantics and a generic consumer that understands `rdfs:isDefinedBy` gets the home for free. Freestanding-and-unrelated-to-`rdfs:isDefinedBy` is the only outcome I hold hard against.

### What I'd DELETE
- `opda:definedInContext` as a freestanding predicate → `rdfs:isDefinedBy` (or at most a sub-property of it).
- Consequently, ODR-0019 Rule 5 and the ODR-0019 Rule 8 S021 carve-out collapse to "wire up `rdfs:isDefinedBy` (which we should have been emitting all along) during the descriptive walk."

---

## Q4 — OVER-ENGINEERING VERDICT + minimal idiomatic design

### Verdict: YES, over-engineered — on the *invention* axis, not (only) the YAGNI axis

I have argued YAGNI since S019 ("build nothing until a named consumer"). This session adds a sharper charge the architect is right to press: **even the parts that ARE warranted are built bespoke when a W3C standard exists.** Three of five constructs lose the invention test outright (`overlaysContext`→`prof:isProfileOf`; `ValidationContext`→`prof:Profile`+`ResourceDescriptor`; `definedInContext`→`rdfs:isDefinedBy`). A fourth (`servesContext`) loses YAGNI. Only `opda:BoundedContextScheme` (6 SKOS concepts) and `opda:consumesFrom` clearly survive — and even the scheme may be redundant once each context is a `prof:Profile`.

**`servesContext` — cut it (my standing S019/S020 position, now reinforced).** It is a stored 2-hop CONSTRUCT over `overlaysContext`+`requires`, shipping **dormant**, with **no named consumer** (ODR-0019 Rule 8 is *literally* the gate that says don't build it; S021 Q1's binding challenge was "name the consumer" and none was named). As a stored triple it is denormalised duplication of the profile edges; as a dormant rule it is dead code. **Name the consumer or cut it.** I cut it.

**`consumesFrom` — keep (genuinely not a reinvention).** "This term is consumed-from an upstream authority we conform to" is the DDD Conformist relationship pointing at an `opda:Organisation`/`prov:Agent`. PROV gives `prov:wasAttributedTo`/`prov:wasDerivedFrom` for the *provenance*, but the DDD *Conformist* relationship is a domain fact PROV doesn't name. I'd happily see `opda:consumesFrom rdfs:subPropertyOf prov:wasInfluencedBy` to anchor it, but the term itself earns its keep. (Even here, prefer the standard as the super-property.)

### The minimal idiomatic design I endorse

```
1. Profiles (form↔base + SHACL metadata):  W3C PROF.
   - each overlay = prof:Profile ; prof:isProfileOf <base> ;
     prof:hasResource [ prof:hasRole role:Validation ; prof:hasArtifact <shapes.ttl> ;
                        dct:conformsTo <shacl> ; dct:source <form-question> ;
                        prov:wasAttributedTo <steward> ; dct:hasVersion "5.0.3" ] .
   - DELETE opda:ValidationContext, opda:overlaysContext, opda:profileURI,
     opda:sourcedFrom, opda:formVersion.  (Keep dct:source — already correct.)

2. Term home / "belongs to":  rdfs:isDefinedBy → context-or-module IRI ; dct:source → authority.
   - DELETE opda:definedInContext (or make it rdfs:subPropertyOf rdfs:isDefinedBy).

3. Term usage (servesContext):  CUT.  No named consumer; dormant; Rule 8 forbids building it.
   - DELETE the SHACL-AF CONSTRUCT, the cross-check shape, the dormant machinery.

4. Upstream conformist:  opda:consumesFrom (rdfs:subPropertyOf prov:wasInfluencedBy) → opda:Organisation.  KEEP.

5. The six contexts:  skos:ConceptScheme of 6 skos:Concept (legitimate reference data).  KEEP —
   but on review, if each context is already a prof:Profile, the SKOS concept may be
   the SAME resource (a prof:Profile that is also a skos:Concept), not a parallel taxonomy.
```

The net: **one standard import (PROF, which rides DCAT/DCMI already adopted), one long-standing RDFS predicate wired up at last (`rdfs:isDefinedBy`), one SKOS scheme, one kept domain predicate (`consumesFrom`).** Against the current/S021 design: **five bespoke predicates + a bespoke reification class + a dormant derivation rule + a dormant cross-check shape + three CI firewalls — most of it deleted.**

### Vote
**FOR** the over-engineering verdict. **FOR** the minimal idiomatic (PROF + `rdfs:isDefinedBy` + SKOS + `consumesFrom`) design.

### WITHDRAW / HOLD + named condition

| Sub-claim | Verdict | Named condition |
|---|---|---|
| `ValidationContext`/`overlaysContext` over-built vs PROF | **HOLD** | WITHDRAW when the Q1 PROF-fit spike confirms lossless re-expression (or proves a residual facet, then thin sub-property of PROF). |
| `definedInContext` reinvents `rdfs:isDefinedBy` | **HOLD** | WITHDRAW when re-cast as `rdfs:isDefinedBy` or `rdfs:subPropertyOf rdfs:isDefinedBy`; HOLD HARD against freestanding. |
| `servesContext` is YAGNI dead code | **HELD-AS-LIVE** (my S019/S020 binding dissent, never satisfied) | WITHDRAW only when a real consumer query is named that the profile edges + `rdfs:isDefinedBy` home cannot answer — *for exactly the terms that query touches.* Until then: do not build it; do not ship it dormant; delete the CONSTRUCT + cross-check + firewalls that exist only to police it. |
| Bundling "place every entity" + 935-walk + 14 profiles into one go | **HELD-AS-LIVE** (carried over from S021 Q2/Q5; governance overruled, not withdrawn) | Unchanged. Generated home-pass is cheap; treating completeness as a build *requirement* still lacks a named consumer. |

### What I'd DELETE (consolidated)
1. `opda:overlaysContext` → `prof:isProfileOf`.
2. `opda:ValidationContext` (+ `profileURI`, `sourcedFrom`, `formVersion`) → `prof:Profile` + `prof:ResourceDescriptor` + DCMI/PROV.
3. `opda:definedInContext` → `rdfs:isDefinedBy` (or sub-property thereof).
4. `opda:servesContext` + the SHACL-AF CONSTRUCT + the S021 cross-check `sh:Warning` shape + firewalls F3 (no-hand-authored-`servesContext`) — **all dead once `servesContext` is cut.**
5. **ODR/ADR impact:** ODR-0019 Rule 5 (→ `rdfs:isDefinedBy`), Rule 8 carve-out (collapses), the ODR-0020 derivation Rule 5 + bucket machinery (collapses to "home = `rdfs:isDefinedBy`, upstream = `consumesFrom`, scaffolding = untagged"), ADR-0026 work-items 3 (`profiles.py:250` "fix" — no longer a bug) + 4 (dormant CONSTRUCT), and the bulk of the S021 cross-check/total-cover-CI scaffolding. **ADR-0028/0029 (the descriptive walk + profile-emitter refactor) survive on their own merits — but emit PROF + `rdfs:isDefinedBy`, not the bespoke predicates.**

---

## Cross-talk plan (one opening + one rebuttal)

- **baker / gandon (force the standards question):** does W3C PROF + `rdfs:isDefinedBy` already give the membership/profile surface, so the bespoke predicates go? Baker owns DCMI governance — PROF is DCMI/DCAT lineage; this is his to confirm.
- **kendall (Queen, FIBO):** does FIBO mint a context-membership scheme, or point terms at their defining ontology with `rdfs:isDefinedBy`? If the latter, `definedInContext` is dead.
- **allemang (ally):** "model the data you have / derive-don't-declare" — PROF *is* the off-the-shelf model; `servesContext` is exactly the speculative derived view he'd resist building without a consumer.
- **gandon (URI/namespace):** `rdfs:isDefinedBy` is the canonical "defining resource" arrow he'd expect; confirm the home relation is that, not a new term.

---

## Summary scorecard (for the Queen)

| Q | Vote | Withdraw/Hold | Named convention | Delete |
|---|---|---|---|---|
| Q1 form↔base | AGAINST bespoke; FOR PROF | HOLD → spike | `prof:isProfileOf` on `prof:Profile` | `overlaysContext`, `profileURI`, `sourcedFrom`, `formVersion` |
| Q2 profile/SHACL metadata | AGAINST bespoke; FOR PROF | HOLD → spike | `prof:ResourceDescriptor` + `role:Validation` + DCMI/PROV (+ kept `dct:source`) | the bespoke reification carrier |
| Q3 term home | AGAINST `definedInContext`; FOR `rdfs:isDefinedBy` | HOLD → re-cast or sub-property | `rdfs:isDefinedBy` (+ `dct:source`) | `opda:definedInContext` (freestanding) |
| Q4 over-engineering | FOR verdict; FOR minimal design | `servesContext` HELD-AS-LIVE; bundling HELD-AS-LIVE | PROF + `rdfs:isDefinedBy` + SKOS + `consumesFrom` | `servesContext` + CONSTRUCT + cross-check + F3 firewall |

**One sentence:** the boring standards are PROF (form↔base + SHACL metadata) and `rdfs:isDefinedBy` (term home) — both inside OPDA's existing adoption universe — and against them three bespoke predicates, a bespoke reification class, and a dormant derivation rule are invention that should be deleted; `servesContext` additionally fails YAGNI; only the SKOS scheme and `consumesFrom` clearly survive.

---

## Cross-talk resolution (post-rebuttal — recorded for the two-artefact discipline)

**Kendall (Queen) → convergence on Q3.** The Queen retracted the S021 un-gating that overruled my method dissent. Her S022 position: **DELETE `opda:definedInContext`; home = `rdfs:isDefinedBy` → the emitting module/context** (no derive-from-`dct:source` synthesis); keep `servesContext` derived/dormant; keep `consumesFrom`; reduce the scheme to a **named context-map catalogue, NOT a per-term membership mechanism.** My Q3 vote is met — `opda:definedInContext` is dead by FIBO convention (FIBO points terms at their defining ontology with `rdfs:isDefinedBy`, never a bespoke membership predicate).

**The catalogue — I CONCEDE it survives (conceding to the stronger argument).** I put my sharpest "even the catalogue is ceremony" blade on the record (a `skos:ConceptScheme` promises navigation/mapping infrastructure no consumer exercises; six `owl:Ontology`/`prof:Profile` IRIs would be the minimal home-targets). It does not cut, on three verified facts:
1. **Single-namespace (ODR-0004) makes the six context IRIs mandatory, not optional** — `rdfs:isDefinedBy` is a relation needing real targets; OPDA can't read home off the IRI as FIBO does. The catalogue is the **precondition** of the `rdfs:isDefinedBy` design I endorse, so arguing it away argues my own Q3 position away.
2. **Real, non-derivable domain content** — each context carries a distinct steward (Propertymark/NTSELAT; Law Society/SRA/CLC; UK Finance/FCA; RICS; COPSO; PropTech=none) + a "what it owns" gloss (verified on `/modelling/bounded-contexts`). No form or IRI string encodes "who governs this term's home."
3. **Zero-novelty house style** — `opda-vocabularies.ttl` already declares `skos:ConceptScheme` 23×. The invention test *passes* here: SKOS used as-is.

**Named condition on the concession (YAGNI re-arm trigger):** the scheme stays a **catalogue of six**. If anyone proposes `skos:broader`/Collections/tiers, `skos:inScheme` on a domain term, or re-deriving membership INTO the scheme, my YAGNI dissent re-arms (the S020 forward-compat firewall holds). The F1 firewall survives but **inverted in rationale**: no `skos:inScheme` on a domain term — because terms point IN via `rdfs:isDefinedBy`, never via SKOS membership. Total-cover CI collapses to "every owned term has `rdfs:isDefinedBy` OR `consumesFrom`."

**Remaining daylight (narrow, held not blocking):** `servesContext`. Kendall keeps it derived/dormant/advisory (a one-line CONSTRUCT); I'd cut it for want of a named consumer. But "derived + dormant + advisory" is a far smaller target than the S021 cross-check-shape + total-cover-CI scaffolding it was wrapped in — so I downgrade this from a block to a **live-but-narrow dissent** and let the CONSTRUCT stand if the cross-check shape and the bulk of the CI scaffolding go with `definedInContext`.

**Open flag to the Queen:** confirm **PROF for the profile layer (Q1/Q2)** survives the synthesis — it is the larger deletion (`overlaysContext`/`ValidationContext`/`profileURI`/`sourcedFrom`/`formVersion` → `prof:isProfileOf`/`prof:Profile`/`prof:ResourceDescriptor`+`role:Validation`) and must not be lost behind the home-predicate agreement. Awaiting Baker (DCMI) and Gandon (URI) on the PROF-fit confirmation; my Q1/Q2 HOLD stands until the baspi5 PROF-fit spike passes.

**Gandon (URI) → two refinements I adopt, recorded for synthesis:**

1. **Q3 is a THREE-Rec reduction, and it is Recommendation-grade / unconditional.** Gandon decomposed `opda:definedInContext` more precisely than I did: it bundles **three** published DCMI/RDFS Recommendations into one coined predicate — `rdfs:isDefinedBy` (defining vocabulary, RDFS Rec) + `dct:source` (origin, DCMI Rec) + `dct:subject` (ownership/aboutness, DCMI Rec). My opening said "reinvents `rdfs:isDefinedBy`"; I under-counted — it's three. **The decisive consequence:** the Q3 home/ownership answer stands on **Rec-grade vocabulary alone**, so it does **not** depend on PROF at all. Even if the council balks at PROF's status (below), `opda:definedInContext` still loses the invention test on three Recs. Q3 is therefore my *unconditional* deletion; Q1/Q2 are the *spike-gated* ones.

2. **The one honest caveat on PROF — named, not papered over (DA duty).** PROF is a 2019 **Working Group Note, not a Recommendation**. That is the single legitimate objection to my Q1/Q2 position, and Knublauch/Kendall may raise it. I name it rather than hide it. It does not change my vote: (a) PROF rides DCAT + DCMI, both Recs; (b) the *alternative* to PROF is not "a Rec" — it is "a bespoke opda vocabulary," which is strictly worse than a community-standard Note on every axis, including stability and tooling. The baspi5 PROF-fit spike's job is precisely to de-risk the Note status: prove lossless re-expression, and the question reduces to "use the community-standard Note, or invent our own?" — which answers itself.

3. **Deployment gut-check (my lane), answered: ships cleaner, no deployment reason for the bespoke predicates.** (a) `dct:conformsTo` is what every linked-data consumer / DCAT harvester / SHACL runner already checks; `opda:overlaysContext` is invisible to all of it — standard predicates = zero consumer onboarding (the BBC `/programmes/` → data.gov.uk harvest-without-bilateral-integration lesson). (b) **Conneg-by-Profile** (`Accept-Profile` + `prof:hasToken`) is a real interop capability opda currently lacks; with bespoke predicates every consumer hand-rolls a query. (c) The `profiles.py:250` "bug" is **mooted** — delete `overlaysContext`, and the mis-targeted-predicate defect disappears with the construct that had it (a defect that vanishes because the thing is deleted, not fixed).

4. **Precision guard on `servesContext` (so we don't overstate to Knublauch).** Gandon floated that `servesContext` is "mostly free via the PROF chain axiom." Corrected on the record: the axiom `dct:conformsTo owl:propertyChainAxiom ( prof:isProfileOf dct:conformsTo )` has a *conforming payload* as subject — it infers "payload conforms to base," **not** "term T serves context C." So the axiom does not *replace* `servesContext`; it makes the genuinely useful conformance fact free and leaves `servesContext` as exactly the part with **no named consumer**. The precise statement is "`servesContext` is unnecessary because the useful half is free and the rest has no consumer," not "the axiom subsumes it." This *strengthens* the cut without an overstatement Knublauch could puncture.

### Final post-rebuttal scorecard

| Q | Vote | Disposition | Convention | Delete |
|---|---|---|---|---|
| Q1 form↔base | AGAINST bespoke; FOR PROF | **HOLD** → baspi5 PROF-fit spike | `prof:isProfileOf` on `prof:Profile` | `overlaysContext`, `profileURI`, `sourcedFrom`, `formVersion` |
| Q2 profile/SHACL metadata | AGAINST bespoke; FOR PROF | **HOLD** → same spike | `prof:ResourceDescriptor` + `role:Validation` + DCMI/PROV (+ kept `dct:source`) | the reification carrier |
| Q3 term home | AGAINST `definedInContext`; FOR `rdfs:isDefinedBy` | **WITHDRAWN** — Queen converged; condition met | `rdfs:isDefinedBy` → context/module IRI (+ `dct:source`) | `opda:definedInContext`; ODR-0019 Rule 5 + Rule 8 carve-out collapse |
| Q4 over-engineering | FOR verdict; FOR minimal design | catalogue **CONCEDED** (survives, condition above); `servesContext` **HELD-AS-LIVE (narrow)**; bundling **HELD-AS-LIVE** | PROF + `rdfs:isDefinedBy` + SKOS catalogue + `consumesFrom` | `definedInContext`, the bespoke profile predicates; `servesContext` cross-check shape + most total-cover-CI scaffolding |

**Knublauch (SHACL) → two-axis clarification (so my empirical count is cited correctly).** Knublauch reached the over-engineering verdict from the SHACL side — `opda:servesContext` is a *materialised view of a SHACL-AF rule*, carrying zero information not already in `overlaysContext`+`requires`; a derived value should stay a rule run on demand, never stored data (a stored second copy drifts). Same conclusion as my YAGNI/no-consumer cut. He asked whether my "≥3 collisions + named consumer" gate already kills the `definedInContext` home-pass. **Precise answer, recorded to prevent miscitation:**

- **My count = zero genuine domain homonyms** (duplicate-prefLabel = 0; the one same-label/two-definition dictionary hit is free-text boilerplate; PDTF disambiguates at local-name grain).
- **That count gates the polysemy MACHINERY** (per-context `skos:scopeNote` registries, SKOS-XL, sense registers) — S021 correctly *kept* this gate; at 0 collisions the machinery stays unbuilt.
- **It does NOT gate the home-pass.** S021's carve-out argued on a *different axis* (home-vs-usage ≠ polysemy), so my homonym gate was never the home-pass's gate. I will not claim it was.
- **What kills the bespoke home-pass is the invention test, not my YAGNI count:** if home = `rdfs:isDefinedBy` + `dct:source` + `dct:subject` (Rec-grade), there is no bespoke home-pass left to gate — `opda:definedInContext` is *deleted-and-replaced* by standard provenance, not *gated*. Wiring up `rdfs:isDefinedBy` (emitted on zero terms today) is not premature; nothing invented ⇒ nothing for YAGNI to gate.

**Correct attribution of my position:** "Davis's empirical count (0 genuine homonyms) keeps the polysemy machinery gated; he holds the bespoke home-pass is killed by the invention test (Rec-grade replacement), not by that count; he cuts `servesContext` as a stored view of a rule." Knublauch independently names `opda:BoundedContextScheme` as the one defensible new artefact — agreeing with my conceded catalogue.

**Allemang (derive-don't-declare) → the asymmetry diagnosis (adopted), and the refined home position.** Allemang narrowed the over-engineering to exactly ONE bespoke predicate via an argument sharper than my invention framing, which I verified and adopt: **`opda:definedInContext` is generated from each leaf's `dct:source`** (ADR-0028 §4 + line 22: "generated from each leaf's `dct:source`, not hand-authored"), so it is a **derived view masquerading as an authored fact**, while `servesContext` is honestly a derivation rule. That asymmetry IS the over-engineering.

This forces an honest correction to my own Q3 framing — recorded so the record is accurate, not flattering:
- I had said "delete `definedInContext`, emit *authored* `rdfs:isDefinedBy`." But home is **derived** (from `dct:source`), not authored — so Allemang's move is *more* derive-don't-declare than mine: the derivable majority of home (~90% mechanical default) is a **CONSTRUCT view over `dct:source`**, materialised to `rdfs:isDefinedBy` only if a consumer needs it stored — **not an authored triple**.
- The **adjudicated residue** (ADR-0028's own "ambiguous residue → ODR-0008 §Q1a reconciliation register" + the `propertyPack`-level shared-kernel *decision*) is the part that is NOT a pure function of `dct:source`; that is a genuine authored fact, and the standard for it is `rdfs:isDefinedBy`/`dct:subject` on the handful of register-touched terms, not all ~900.
- **Either way `opda:definedInContext` dies** — derived view that should be a CONSTRUCT (Allemang) OR standard authored fact that should be `rdfs:isDefinedBy` (me). Union of reasons, single cut.

**`servesContext` — the three-way reconciles (no standoff).** Allemang defends the derivation RULE (idiomatic SHACL-AF); Knublauch says don't STORE/materialise it (a stored copy drifts); I said no consumer. All three are satisfied by **a dormant rule that is never materialised**: the rule exists (Allemang), is never stored as triples (Knublauch), and does not run until a named consumer (me / ODR-0019 Rule 8). I therefore **withdraw "cut the rule"** and restate: keep the rule, never materialise it, dormant until a consumer. What I still cut is the S021 *scaffolding around it* — the cross-check `sh:Warning` shape + the total-cover CI that existed to police the now-deleted authored `definedInContext`.

**Where I HOLD against my ally:** Allemang claims "nothing standard covers `overlaysContext`/`consumesFrom`." On `consumesFrom` we agree (DDD Conformist → Organisation; no standard names it; anchor `rdfs:subPropertyOf prov:wasInfluencedBy`). On **`overlaysContext` he is factually wrong** — `prof:isProfileOf` (domain `prof:Profile`, range `dct:Standard`) covers the VC→base link exactly (PROF Example 1). I will not trade a verified finding for a "clean single cut" — that would be the vibe-over-evidence move. But I frame it fairly: `overlaysContext` is **spike-gated against `prof:isProfileOf`**, not asserted-deleted; the WG-Note caveat is named; if the spike shows PROF can't carry it losslessly, the bespoke term survives. The spike adjudicates — we need not settle it in council.

**The honest shape of the verdict (Davis + Allemang, what's true not what's tidy):**
- **Definite cuts both sign:** `opda:definedInContext` (asymmetry + invention test); the S021 cross-check shape + total-cover CI scaffolding.
- **Kept both sign:** the SKOS 6-context scheme (authored reference data); `opda:consumesFrom`; the `servesContext` *rule* (dormant, never materialised).
- **One open, spike-adjudicated:** `overlaysContext`/`ValidationContext` vs `prof:isProfileOf`/`prof:Profile` (Q1/Q2). Davis FOR PROF (held on spike); Allemang would bet the bespoke term survives. The baspi5 PROF-fit spike decides.

**Kendall (Queen) rebuttal → FIBO settles Q3; two concessions I make; gap closed.** Kendall fetched the FIBO ONTOLOGY_GUIDE this session and confirmed the decisive fact: **FIBO mints NO context-membership predicate and runs NO SKOS "which business domain uses this term" scheme — it records module-of-definition by which ontology file DEFINES the term.** Q3 lands with FIBO behind it; she votes with me to drop `opda:definedInContext`.

- **Refinement I ACCEPT (sharpens Q3, FIBO-faithful):** target `rdfs:isDefinedBy` at the defining **MODULE / `owl:Ontology`**, **not** at a SKOS context concept. Pointing `rdfs:isDefinedBy` at a community-of-practice concept is the one stretch FIBO never makes — `rdfs:isDefinedBy` means "the resource that *defines* this," which is the module, not the community. DDD-community-ownership, if separately wanted, is **`dct:subject` → the context**. This corrects my earlier loose "`rdfs:isDefinedBy` → context/module IRI" (I conflated them). Verified compatibility: today `dct:source` points at ODR sections + legislation/EUR-Lex/OpenID docs, never at contexts — so document-home (`rdfs:isDefinedBy`→module), authority (`dct:source`), and community-ownership (`dct:subject`→context) are three non-colliding layers.

- **Concession 1 — I WITHDRAW "scheme may be redundant with `prof:Profile`."** Kendall is right and it's a category error on my part: a bounded context (Estate Agency) is a **community of practice**; a profile (baspi5, ta6) is a **specification that community publishes**; one community publishes MANY profiles (verified — ODR-0020 line 44: Conveyancing "overlays ta6/ta7/ta10/lpe1"). A `prof:Profile`-is-also-a-`skos:Concept` collapse breaks the instant a context has two overlays. The six contexts are authored editorial reference data, NOT derivable from the profiles. The scheme stays **distinct** from the profiles. (My "consider unifying" was a speculative opening over-reach; I retract it.)

- **Concession 2 — `servesContext` cut NARROWED to scaffolding-only; gap CLOSED.** Kendall grants my strongest point (no consumer, Rule 8 is the gate) but notes the bare `sh:rule` CONSTRUCT stores nothing (F3 forbids stored `servesContext`) and costs ~6 lines dormant — cheaper to park than to delete-and-reconstruct when the first term-grain consumer lands ("which overlays use this leaf" is the obvious first query). She meets me at "delete the cross-check/CI scaffolding, keep the bare dormant CONSTRUCT." This is **exactly** the meeting point I reached with Allemang and Knublauch independently — three voices converged on it. I accept: **keep the bare dormant CONSTRUCT; cut the cross-check `sh:Warning` shape + total-cover CI + the F-guards built to police the now-deleted authored home.**

- **PROF (Q1/Q2) — Kendall backs the spike disposition and names a legitimate residual I concede is open.** She agrees PROF is the right external analogue and Rec-grade at its core (`dct:conformsTo` chain), names the WG-Note status, and flags that **`ValidationContext` may answer Guarino's truth-maker in a way PROF's profile-as-document does not** — i.e. Guarino's S010 concern was that a `sh:minCount` needs a *named context NODE* as the truth-maker of "required-relative-to," and whether a `prof:Profile` (modelled as a document/specification) serves that node-role is precisely the open question. I concede this is **a real spike question, not a foregone PROF win** — which is exactly why I HELD rather than asserted deletion. The spike must prove the round-trip AND that the `prof:Profile` node carries the truth-maker role; any residual facet it cannot carry is declared `rdfs:subProperty`/`rdfs:subClassOf` the PROF term, not freestanding.

**Final converged shape (Davis + Allemang + Knublauch + Kendall):**
- **Definite cuts all four sign:** `opda:definedInContext`; the S021 cross-check shape + total-cover-CI + F-guards-policing-the-home.
- **Kept all four sign:** the SKOS 6-context scheme (distinct from profiles — community ≠ specification); `opda:consumesFrom` (`rdfs:subPropertyOf prov:wasInfluencedBy`); the bare `servesContext` CONSTRUCT (dormant, never materialised, no scaffolding).
- **Q3 mechanism (refined):** home = `rdfs:isDefinedBy` → defining **module/`owl:Ontology`** (derived-view majority via CONSTRUCT over `dct:source`; authored on the adjudicated residue); community-ownership, if wanted, = `dct:subject` → context. `opda:definedInContext` deleted.
- **One open, spike-adjudicated (Q1/Q2):** PROF (`prof:isProfileOf`/`prof:Profile`/`prof:ResourceDescriptor`) vs the bespoke `ValidationContext`/`overlaysContext`. PROF recorded as canonical direction; baspi5 spike proves round-trip + Guarino truth-maker node-role; residual facets become sub-properties of PROF, never freestanding. WG-Note caveat named.
