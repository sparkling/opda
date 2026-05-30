# Council Session 022 — Fabien Gandon (W3C / Inria)

**Lens:** Published W3C convention. The architect's complaint is that S021 *invented* bespoke
designs where W3C Recommendations and Notes already define the convention. My job is to **name the
standard** for each of the four questions, then say where opda's design reinvents it and where the
reinvention is actually load-bearing.

**Standards I am grounding in (all published, all dereferenceable):**

- **PROF — *The Profiles Vocabulary*** (W3C Working Group Note, 18 Dec 2019; Car, Cox, Atkinson).
  `prof:Profile ⊑ dct:Standard`; `prof:isProfileOf` / `prof:isTransitiveProfileOf` (range
  `dct:Standard`); `prof:hasResource` → `prof:ResourceDescriptor` → `prof:hasRole` (range
  `skos:Concept`) + `prof:hasArtifact` + `dct:format` + `dct:conformsTo`; `prof:isInheritedFrom`.
  Normative **role registry** of eight `skos:Concept` tokens at `http://www.w3.org/ns/dx/prof/role/`:
  `role:constraints`, `role:validation`, `role:schema`, `role:vocabulary`, `role:guidance`,
  `role:specification`, `role:example`, `role:mapping`. Normative property-chain axiom
  `owl:propertyChainAxiom ( prof:isProfileOf dct:conformsTo )`. PROF borrows its structure from
  DCAT: `prof:Profile` specialises `dcat:Resource`, `prof:ResourceDescriptor` specialises
  `dcat:Distribution`.
- **DCAT 2 / DCAT 3** (W3C Rec) — profiles of datasets/services; `dcat:Resource`,
  `dct:conformsTo`.
- **Content Negotiation by Profile** (W3C WG Note, 2019) — how a consumer *requests* data
  conforming to a profile (`Accept-Profile` / `qsa` token = `prof:hasToken`).
- **RDF Schema 1.1** (W3C Rec) — `rdfs:isDefinedBy`: "an instance of `rdf:Property` used to
  indicate **a resource defining the subject resource**… an RDF vocabulary in which a resource is
  described"; `S rdfs:isDefinedBy O` states **O defines S**; `rdfs:isDefinedBy ⊑ rdfs:seeAlso`.
- **DCMI Terms** — `dct:source`, `dct:conformsTo`, `dct:Standard`, `dct:isPartOf`.
- **PROV-O** (W3C Rec) — `prov:wasAttributedTo`, `prov:Agent` (already used in ODR-0020 Rule 2).
- **Linked-data principles** — Berners-Lee 2006 (4 rules); Heath & Bizer 2011 (vocabulary reuse:
  *reuse before mint*).

---

## Q1 — FORM ↔ BASE-ONTOLOGY ASSOCIATION

**Stance.** There **is** a W3C convention for "a form is a profile of a base specification, and it
bundles a SHACL constraint resource (plus guidance, vocabulary, examples)" — it is **PROF**. opda's
`opda:ValidationContext` + `opda:overlaysContext` (ODR-0010 Rule §VC; ODR-0019 Rule 3; ODR-0020
Rule 6) is a **partial, bespoke re-creation of PROF** — and crucially of the *weaker half* of it.

What opda built vs. what PROF already gives:

| opda bespoke (ODR-0010 / 0019 / 0020) | W3C PROF convention | Verdict |
|---|---|---|
| `opda:ValidationContext` (reified profile node) | `prof:Profile` (and `prof:Profile ⊑ dct:Standard` — *a profile IS a first-class specification*) | **reinvents** `prof:Profile`. Worse: it reifies the profile as a *validation* thing, encoding the SHACL artefact's role into the node's very *type*, when PROF keeps the profile abstract and the SHACL artefact a *resource playing the `role:validation` role*. |
| `opda:overlaysContext` (profile → industry context) | `prof:isProfileOf` (profile → the base `dct:Standard` it specialises) — **plus** the property-chain `( prof:isProfileOf dct:conformsTo )` so a conformant payload is *inferred* conformant to the base | **reinvents** `prof:isProfileOf` — but points at the *wrong target* (a SKOS community-of-practice concept, not the base specification). See the architect's point below. |
| `opda:requires <term>` + per-form `sh:minCount`/`sh:in`/DASH inline in one shapes graph | the SHACL file is **one** `prof:ResourceDescriptor` with `prof:hasRole role:validation` + `prof:hasArtifact <…/baspi5.shapes.ttl>` + `dct:format "text/turtle"`; the DASH form-rendering is arguably a second descriptor (`role:guidance` or a community `role:form`); the enum SKOS is a `role:vocabulary` descriptor | opda **collapses** PROF's resource-bundle into a single monolithic graph. It loses PROF's ability to say "this profile bundles *these* artefacts, each playing *this* role." |
| (absent) | `prof:hasToken` = the short profile identifier used in **Content Negotiation by Profile** (`Accept-Profile: <…/baspi5>`) | opda has **no** standard answer to "how does a consumer *request* a BASPI5-conformant view?" PROF + Conneg-by-Profile is the answer. |

**The architect is right in substance, and PROF tells us exactly *how* right.** A SHACL profile **is**
first-class RDF — PROF makes that an *axiom* (`prof:Profile ⊑ dct:Standard`). opda already half-knows
this: ODR-0010's whole Decision is "overlays are named, dereferenceable SHACL profile graphs over a
fixed TBox," and its DA (Guarino) forced the `opda:ValidationContext` reification precisely to give
the profile "a fixed model theory" — **that is PROF's `prof:Profile`, rediscovered under a local
name.** The reification instinct was correct; the local vocabulary was the avoidable part.

**The one place opda's bespoke design is genuinely *not* a clean PROF mapping** — and this is the
subtle finding the council must not gloss: `opda:overlaysContext` points a profile at a **bounded
context** (`opda:EstateAgencyContext`), whereas `prof:isProfileOf` points a profile at the **base
`dct:Standard` it specialises** (here, the PDTF base TBox / its `opda:` ontology IRI). These are
*different associations*:

- "BASPI5 **is a profile of** the PDTF base ontology" → **`prof:isProfileOf`** (the form↔base
  association the question asks for). This is the one PROF owns.
- "BASPI5 **is operated by / belongs to** the Estate-Agency community of practice" → this is
  **provenance / stewardship of the profile**, not a profile-of relation. The right predicate is
  `dct:publisher` / `prov:wasAttributedTo` / (PROF's own) the profile's steward — **not**
  `prof:isProfileOf`, and not a bespoke `overlaysContext`.

So `opda:overlaysContext` actually **conflates two standard relations into one bespoke predicate**:
the *profile-of-base* relation (`prof:isProfileOf`) and the *stewarded-by-community* relation
(`dct:publisher`/provenance). That conflation is the root of the S021/S020 difficulty — and it is
exactly why the derived `servesContext` then has to do contortions. Untangle it with two standard
predicates and the bespoke one disappears.

**Vote Q1: AGAINST the bespoke `opda:ValidationContext`/`opda:overlaysContext` design as the form↔base
mechanism.** **FOR** adopting **W3C PROF**: model each form as a `prof:Profile` (which IS-A
`dct:Standard`), `prof:isProfileOf` the PDTF base ontology, bundling its SHACL/DASH/vocabulary as
`prof:ResourceDescriptor`s with the registry roles, and carrying its community via `dct:publisher`
— **not** via the profile-of edge.

**Named convention:** W3C PROF (`prof:Profile`, `prof:isProfileOf`, `prof:hasResource`/
`prof:ResourceDescriptor`/`prof:hasRole`/`prof:hasArtifact`) + DCAT lineage + Content Negotiation by
Profile (`prof:hasToken`).

---

## Q2 — METADATA ON A SHACL / PROFILE DEFINITION

**Stance.** PROF + DCAT + DCMI **prescribe** the metadata set for a profile and its constituent
SHACL definition. opda's reified `opda:ValidationContext` carries an *ad hoc* subset
(`opda:profileURI`, `opda:overlaysContext`, `opda:requires`); the standard set is richer, named, and
already supports content negotiation and conformance inference. There is **no need to invent profile
metadata** — map to the standard.

**The convention, mapped (this is the answer, not prose):**

| Metadatum | W3C / DCMI property | On which node |
|---|---|---|
| Identification | the profile's **own IRI** (it dereferences) + `dct:title` / `dct:description` | `prof:Profile` |
| Short token (for conneg) | `prof:hasToken` (e.g. `"baspi5"`) | `prof:Profile` |
| **Is-a-profile-of (base)** | `prof:isProfileOf <PDTF base ontology>` | `prof:Profile` |
| Profile-of-a-profile (e.g. BASPI5 ⊑ BASPI4 family) | `prof:isProfileOf` / `prof:isTransitiveProfileOf` | `prof:Profile` |
| Versioning | `owl:versionIRI` / `dct:hasVersion` / `prof:isProfileOf` to prior version | `prof:Profile` |
| Steward / publisher (the *community* now mis-encoded as `overlaysContext`) | `dct:publisher` / `prov:wasAttributedTo` | `prof:Profile` |
| Status | `dct:status` (already used in opda's namespace block, ODR-0004) | `prof:Profile` |
| **The SHACL constraints artefact** | `prof:hasResource [ prof:hasRole role:validation ; prof:hasArtifact <…/baspi5.shapes.ttl> ; dct:format "text/turtle" ; dct:conformsTo <SHACL> ]` | `prof:ResourceDescriptor` |
| The DASH form-rendering artefact | `prof:hasResource [ prof:hasRole role:guidance (or community `role:form`) ; prof:hasArtifact … ]` | `prof:ResourceDescriptor` |
| The enum SKOS vocabulary | `prof:hasResource [ prof:hasRole role:vocabulary ; … ]` | `prof:ResourceDescriptor` |
| Worked example payload | `prof:hasResource [ prof:hasRole role:example ; … ]` | `prof:ResourceDescriptor` |
| Per-leaf form-question provenance (`baspi5Ref` B1.3.2) | `dct:source` (already ODR-0010 Rule 4 — **keep, it is correct**) | the property shape |
| **Consumer requests a conformant view** | Content Negotiation by Profile: `Accept-Profile: <profile-uri>` or `?_profile=baspi5` | HTTP / the token |
| **A payload declares conformance** | `dct:conformsTo <profile>` — and via PROF's chain axiom, *automatically* `dct:conformsTo <base>` | the data instance |

**What opda already does right and should keep:** `dct:source` per-leaf traceability (ODR-0010 Rule
4) is exactly DCMI-idiomatic — PROF does not replace it. The graph-separation discipline (ODR-0010
"shapes graph separate from class graph"; advisory annotations exiled) is *consistent with* PROF
(each is a separate `prof:hasArtifact`). The instinct to give the profile a stable dereferenceable
IRI is PROF's core requirement.

**Vote Q2: FOR mapping profile/SHACL metadata to PROF + DCAT + DCMI** (the table above), AGAINST
minting any further bespoke profile-metadata predicates. The reified node opda built should be
**re-typed `prof:Profile`** and its ad-hoc predicates replaced by the standard ones; `dct:source`
stays.

**Named convention:** PROF (`prof:hasResource`/`ResourceDescriptor`/`hasRole`/`hasArtifact`/`hasToken`/
`isProfileOf`) + DCAT (`dcat:Resource`/`dcat:Distribution` parallel) + DCMI (`dct:conformsTo`,
`dct:format`, `dct:publisher`, `dct:source`) + Content Negotiation by Profile.

**The fuller standards stack (surfaced in cross-talk with Allemang — adds DCTAP at the constraint-row
layer).** PROF answers the *profile-object* layer; **DCTAP** (*DC Tabular Application Profiles*, DCMI
2022) answers the *constraint-content* layer and the two compose cleanly — and DCTAP is the standard
that **vindicates the S021 "data-dictionary is the single source" finding**:

| Layer | Standard | What it owns | opda mapping |
|---|---|---|---|
| Constraint rows (the spec) | **DCTAP** (CSV: propertyID, mandatory/repeatable, valueConstraint, valueDataType; 12 elements; **official TAP→SHACL / TAP→ShEx converters**) | the per-leaf statement templates | the **data-dictionary per-overlay leaf table** *is* a DCTAP; `ProfileSpec` (ADR-0029) should adopt the DCTAP row schema |
| Shapes (generated) | **SHACL** | the constraints | `profiles.py`'s `sh:minCount`/`sh:in`/`sh:xone` emission *is* a TAP→SHACL step |
| Profile object | **PROF** | "BASPI5 `prof:isProfileOf` base; bundles these role-bearing resources" | wraps the shapes-graph as a `role:validation` `ResourceDescriptor` |
| Catalogue / conformance | **DCAT + DCMI** | metadata, `dct:conformsTo` | profile-level metadata table above |

So OPDA's generator already *implements* DCTAP→SHACL→(should-be-PROF) without naming it. Citing DCTAP
gives the `ProfileSpec` refactor an off-the-shelf row schema + converter precedent, zero bespoke
predicates. **DCAT-AP** (EU data-portal profile of DCAT) is *not* a sharper meta-tool — it is an
*instance* of this stack in production (data.europa.eu), useful only as precedent that the pattern
ships, not as the mechanism.

---

## Q3 — "WHICH CONTEXT A TERM BELONGS TO" — is `definedInContext` reinventing provenance?

**This is the question where I most sharply break from the S021 verdict.**

**Stance.** "Which vocabulary / community a term *belongs to* (is defined in)" has a **direct W3C
convention**: **`rdfs:isDefinedBy`** for vocabulary-of-origin, and **`dct:source` /
`prov:wasAttributedTo`** for provenance-of-derivation. The RDFS Rec is unambiguous:
`S rdfs:isDefinedBy O` "states that the resource O defines S… an RDF vocabulary in which a resource is
described." **That is the precise English of ODR-0019 Rule 5's gloss for `opda:definedInContext`:
"records the context a term's definition originates in."** So **yes — `opda:definedInContext` is
re-creating `rdfs:isDefinedBy` semantics under a local name.**

But the answer is not a flat "delete it and use `rdfs:isDefinedBy`," because there is a **real
referent mismatch** the council must see clearly — and it cuts in opda's favour on one axis and
against it on another:

1. **Referent of `rdfs:isDefinedBy` is a *document / vocabulary*, not a *community*.**
   `rdfs:isDefinedBy` says "term X is defined by **vocabulary/spec O**." Its idiomatic value is the
   **ontology IRI or the ODR/specification document** that defines the term (e.g.
   `opda:LegalCharge rdfs:isDefinedBy <https://w3id.org/opda/#>` or `… <…/odr/ODR-0005>`). A
   *bounded context* (`opda:ConveyancingContext`) is a `skos:Concept` — a **community of practice**,
   not a defining document. Pointing `rdfs:isDefinedBy` at a SKOS concept is a **category error**:
   the community does not "define" the term in the RDFS sense; the **ontology** does (opda mints
   *everything* in one `opda:` namespace — ODR-0004 — so `rdfs:isDefinedBy` for every term is, by
   construction, **the single `opda:` vocabulary**, which makes it *non-discriminating* and explains
   why opda reached for a different predicate).

2. **Therefore the honest finding is split:**
   - The **vocabulary-of-origin** fact (which the question half-asks) is **already covered** by
     `rdfs:isDefinedBy` → the `opda:` namespace, and by `dct:isPartOf` → the specific TTL module /
     ODR. opda does **not** need `definedInContext` for *that*; it should add the standard
     `rdfs:isDefinedBy`/`dct:isPartOf`.
   - The **provenance-of-derivation** fact — "this leaf came from the BASPI5 data-dictionary table /
     this `dct:source` form question" — is **exactly `dct:source` + `prov:wasAttributedTo`**, which
     opda *already carries* (ODR-0010 Rule 4; ODR-0009). **S021's own resolution proves the point:**
     it says `definedInContext` is *"generated from the term's `dct:source` provenance."* If the
     home is a deterministic function of `dct:source`, then **`dct:source` already IS the
     provenance record, and `definedInContext` is a materialised projection of it** — i.e. a
     *derived convenience view over standard provenance*, not a new primitive. The architect's
     suspicion ("`definedInContext` may reinvent provenance") is **correct**: it reinvents the
     *output* of `dct:source` + `rdfs:isDefinedBy`.

3. **What, if anything, is left that the standards do *not* cover?** Only this: "which of the **six
   DDD communities of practice** *conceptually owns* this term." That is a **DDD Context-Map
   ownership fact**, and W3C has *no* vocabulary for DDD ownership specifically — but it is faithfully
   expressible with **SKOS subject indexing**: **`dct:subject <community-concept>`** (term → the SKOS
   concept that is its primary subject) or **`skos:inScheme`-adjacent subject tagging**. DCMI's
   `dct:subject` is the W3C-family convention for "the topic / the thing this resource is *about* /
   belongs to," and it is exactly what ODR-0019's *own rejected alternative* called "hand-authored
   `dct:subject` membership." **The convention for community-ownership is `dct:subject`, not a new
   `definedInContext` predicate.**

**So the minimal idiomatic answer to Q3 is a *triple* of standard predicates, replacing one bespoke
one:**

| opda question | bespoke today | W3C / DCMI convention |
|---|---|---|
| "what vocabulary defines this term?" | (none — all `opda:`) | `rdfs:isDefinedBy <…/opda/#>` + `dct:isPartOf <TTL module / ODR>` |
| "where did this term's content come from?" | `definedInContext` (generated from `dct:source`) | **`dct:source` + `prov:wasAttributedTo`** (already present) — this *is* the provenance |
| "which DDD community owns/stewards it?" | `definedInContext` → SKOS context | `dct:subject` → the SKOS context concept (and/or `dct:publisher`/steward) |

**Is `definedInContext` *reinventing* `rdfs:isDefinedBy`/`dct:source`?** **Yes** — it bundles
"vocabulary-of-origin," "provenance," and "DDD community-ownership" into one local predicate, all
three of which have standard expressions (`rdfs:isDefinedBy`, `dct:source`/`prov:wasAttributedTo`,
`dct:subject`). The one *genuinely* opda-specific need — naming the **six DDD communities** as the
controlled subject vocabulary — is met by **SKOS + `dct:subject`**, not by a new property. (And note:
SKOS for the *scheme* of six contexts is **already** idiomatic and correct — ODR-0020 Rule 1 is
sound; my objection is only to the *bespoke membership predicate*, not to the SKOS scheme.)

**One concession to the S021 camp, stated in standards terms:** their substantive point — *usage*
(`servesContext`, derived) is a different relation from *home* (authored) — is real and survives in
my mapping: `dct:subject`/`dct:publisher` (authored home/ownership) vs. a derived "used-by" view are
genuinely different. PROF even gives the used-by direction for free: a payload's
`dct:conformsTo <profile>` + the chain axiom already records "this data was used under the
Estate-Agency profile." So I am **not** saying "home is meaningless"; I am saying **express home with
`dct:subject` + `dct:source`, not a coined `definedInContext`.**

**Vote Q3: AGAINST `opda:definedInContext` as a new predicate** (it reinvents `rdfs:isDefinedBy` +
`dct:source` + `dct:subject`). **FOR** the standard triple: `rdfs:isDefinedBy`/`dct:isPartOf`
(vocabulary-of-origin), `dct:source`/`prov:wasAttributedTo` (provenance — *already there*), and
**`dct:subject` → the SKOS context concept** for DDD community-ownership.

**Named convention:** RDFS (`rdfs:isDefinedBy`), DCMI (`dct:source`, `dct:isPartOf`, `dct:subject`,
`dct:publisher`), PROV-O (`prov:wasAttributedTo`), SKOS (the context concept scheme as the controlled
subject vocabulary — already adopted).

**Sharpening (post-rebuttal, Knublauch — DO NOT collapse this into one predicate).** "Home" is
overloaded across **two distinct arrows at two different targets**, and `opda:definedInContext`'s
incoherence was conflating them (its *name* says "context" = community; its *gloss* says "definition
originates in" = document). They MUST stay separate:
- **vocabulary-of-origin** ("which document/ontology DEFINES this term") → `rdfs:isDefinedBy` /
  `dct:isPartOf` → a **document** (the `opda:` IRI / TTL module / ODR).
- **DDD community home** ("which of the six communities OWNS this term") → **`dct:subject`** → a
  **`skos:Concept`** (the bounded context). It is a **category error** to point `rdfs:isDefinedBy` at
  a context concept — a community does not *define* the term in the RDFS sense (this is exactly the
  point in §Q3.1 above). So the **term→bounded-context arrow is `dct:subject`, never
  `rdfs:isDefinedBy`.**

Consequence for Davis's "`rdfs:subPropertyOf rdfs:isDefinedBy`" bridge: it is valid **only for the
document target** — a sub-property of `rdfs:isDefinedBy` inherits "a resource that *defines* the
subject," so it cannot reach the community arrow. Community-ownership is `dct:subject`, full stop.
And it clarifies the Kendall/Davis YAGNI fork: "`rdfs:isDefinedBy` alone" = *YAGNI-cut the
term→community arrow*; "+`dct:subject`" = *keep it*. The fork chooses **whether the community arrow
exists**, not *which predicate names the home* — and if it exists it is `dct:subject`. Either way
`definedInContext` dies and `rdfs:isDefinedBy` (the document arrow) is adopted.

---

## Q4 — OVER-ENGINEERING VERDICT + minimal idiomatic design

**Verdict: PARTIALLY over-engineered — and the over-engineering is concentrated in the *predicates*,
not the *SKOS scheme*.** Precisely:

- **NOT over-engineered (keep):** the **SKOS `skos:ConceptScheme` of the six industry contexts**
  (ODR-0020 Rule 1) — SKOS is the W3C convention for a controlled vocabulary of communities/topics,
  and a flat scheme with `skos:topConceptOf` is house-correct. The single `opda:` namespace
  (ODR-0004) is also right and PROF/FIBO both endorse namespace-by-module-of-definition. The
  `opda:consumesFrom` → `opda:Organisation`/`prov:Agent` for upstream (ODR-0020 Rule 2) is *close*
  to idiomatic (the Conformist relation has no W3C term; `prov:wasInfluencedBy`/`dct:source` are the
  nearest, and a local sub-property is defensible). `dct:source` per-leaf (ODR-0010 Rule 4) is
  idiomatic. The graph-separation discipline is idiomatic.

- **Over-engineered (replace with standards):**
  1. `opda:ValidationContext` → **`prof:Profile`** (PROF; and it IS-A `dct:Standard`).
  2. `opda:overlaysContext` → split into **`prof:isProfileOf`** (→ base ontology) + **`dct:publisher`/
     `dct:subject`** (→ community). The bespoke predicate conflated two standard relations.
  3. `opda:requires` + inline SHACL/DASH → **`prof:hasResource`/`prof:ResourceDescriptor`** with
     `role:validation` / `role:guidance` / `role:vocabulary` artefacts (PROF role registry).
  4. `opda:definedInContext` → **`rdfs:isDefinedBy` + `dct:source` + `dct:subject`** (Q3). This is
     the single biggest reinvention: one coined predicate standing in for three Recs.
  5. (gain, not loss) add **`prof:hasToken` + Content Negotiation by Profile** — opda currently has
     *no* standard story for requesting a conformant view; PROF supplies it for free.

**Minimal idiomatic design (the whole thing on one page):**

```turtle
# ---- the form IS a profile of the base (PROF) ----
<…/profiles/baspi5> a prof:Profile ;          # prof:Profile ⊑ dct:Standard — first-class spec
    dct:title "BASPI5 overlay"@en ;
    prof:hasToken "baspi5" ;                   # → Content Negotiation by Profile
    prof:isProfileOf <https://w3id.org/opda/#> ;   # ← the form↔BASE association (Q1)
    dct:publisher opda:EstateAgencyContext ;   # ← the community/steward (was overlaysContext) (Q1/Q3)
    prof:hasResource [ a prof:ResourceDescriptor ;     # the SHACL constraints
        prof:hasRole role:validation ;
        prof:hasArtifact <…/profiles/baspi5.shapes.ttl> ;
        dct:format "text/turtle" ; dct:conformsTo <http://www.w3.org/ns/shacl#> ] ;
    prof:hasResource [ a prof:ResourceDescriptor ;     # the DASH form-rendering
        prof:hasRole role:guidance ; prof:hasArtifact <…/profiles/baspi5.dash.ttl> ] ;
    prof:hasResource [ a prof:ResourceDescriptor ;     # the enum SKOS
        prof:hasRole role:vocabulary ; prof:hasArtifact <…/profiles/baspi5.skos.ttl> ] .

# property shape keeps dct:source per-leaf (ODR-0010 Rule 4 — idiomatic, retained)
[] sh:path opda:uprn ; sh:minCount 1 ; dct:source <…/forms/baspi5#B1.3.2> .

# ---- a term's home/ownership = standard triple (Q3), no coined predicate ----
opda:LegalCharge a owl:Class ;
    rdfs:isDefinedBy <https://w3id.org/opda/#> ;       # vocabulary-of-origin (RDFS)
    dct:isPartOf <…/odr/ODR-0005> ;                    # defining module/spec (DCMI)
    dct:source <https://www.legislation.gov.uk/ukpga/2002/9> ;   # provenance (DCMI)
    dct:subject opda:MortgageLendingContext .          # DDD community-ownership (DCMI + SKOS)

# ---- "used-by" comes FOR FREE from PROF's chain axiom, not a derived predicate ----
# a payload's  dct:conformsTo <…/profiles/baspi5>  ⇒ ( prof:isProfileOf ∘ dct:conformsTo )
#   ⇒ dct:conformsTo <https://w3id.org/opda/#>  — conformance to the base is INFERRED.
```

**Impact on the records under challenge (my recommendation to the Queen):**

- **ODR-0010** — re-express the `opda:ValidationContext`/`opda:overlaysContext` mechanism on PROF
  *(revised post-rebuttal: re-type + root-in-standards, not wholesale-delete — see cross-talk §10)*.
  The reified profile node is **re-typed** `opda:ValidationContext` → `prof:Profile`, or bridged
  `opda:ValidationContext rdfs:subClassOf prof:Profile` (`⊑ dct:Standard` if `prof:` is vetoed as a
  Note); `overlaysContext` splits into `prof:isProfileOf` (→base) + `dct:publisher` (→community).
  ODR-0010's *substance* (dereferenceable SHACL views over a fixed TBox; graph separation;
  `dct:source` traceability; no-identity-override gate; **Guarino's named-context truth-maker**)
  **survives intact** — the truth-bearer is preserved as a named node; only its bespoke *type*
  retires. Adopt PROF's Rec-grade core (`dct:conformsTo` + chain axiom; role registry as
  `skos:Concept`s); cite the Note for the rest.
- **ODR-0019 / ODR-0020** — the **SKOS scheme of six contexts survives** (Rule 1/2 of ODR-0020 is
  idiomatic). What changes: drop `opda:definedInContext` as a **coined predicate** → home =
  `rdfs:isDefinedBy` (+ `dct:source`, + `dct:subject` iff community-ownership is a named-consumer
  fact). `opda:servesContext` *(revised: the conformance chain does NOT replace it — different grain,
  cross-talk §8)*: the term-grain "used-by" fact is **queryable from the shapes graphs** (Knublauch)
  and needn't be materialised; if a named term-grain consumer requires materialisation, use
  `dct:subject`/a thin `rdfs:subPropertyOf dct:relation`, **not** a coined freestanding predicate —
  fate routed to Davis's named-consumer test. The **S021 home-vs-usage debate still dissolves on the
  predicate question**: home = `rdfs:isDefinedBy`(+`dct:subject`) authored; used-by = shapes-queryable
  (or `dct:conformsTo`-chain at payload grain) — no coined predicate, no inversion to argue about.
- **ADR-0026 / 0028 / 0029** — re-target the emitters: contexts.py still emits the SKOS scheme
  (unchanged); profiles.py emits a **`prof:Profile`-typed (or `⊑ prof:Profile`) node + `ResourceDescriptor`s**
  in place of `opda:ValidationContext` + `opda:overlaysContext` (+ `dct:publisher` → community); the
  home-pass emits **`rdfs:isDefinedBy`** (+ `dct:subject` iff community-ownership is ruled in) instead
  of `opda:definedInContext`; the `servesContext` CONSTRUCT is **deleted** (the fact is
  shapes-queryable — Knublauch) unless a term-grain consumer is named, in which case it materialises a
  *standard-rooted* predicate, not a coined one. The `profiles.py:250` bug (`overlaysContext → profiles/foundation`)
  is **mooted** — there is no `overlaysContext` to mis-target; `prof:isProfileOf` points at the base
  ontology IRI, full stop.

**One caveat I will not overstate (and will defend in rebuttal):** PROF is a **Working Group Note**,
not a Recommendation — Knublauch and Kendall may (fairly) note its non-normative status and modest
adoption. My answer: it is *the* W3C-published convention for exactly this problem, it is built on
DCAT and DCMI (both Recs), and `dct:conformsTo`/`rdfs:isDefinedBy`/`dct:source`/`dct:subject` — the
load-bearing predicates in my minimal design — **are all Recommendation-grade**. Even if the council
declines full PROF, the **Q3 reduction to `rdfs:isDefinedBy` + `dct:source` + `dct:subject` stands on
Recs alone**, and the Q1 `prof:isProfileOf`/`dct:conformsTo` association is Rec-grade at its core.

**Vote Q4: FOR an over-engineering verdict (partial)** — the SKOS scheme is sound; the **coined
predicates** (`opda:ValidationContext`, `opda:overlaysContext`, `opda:definedInContext`,
`opda:servesContext`) are the over-engineering, each shadowing a published W3C/DCMI term. Adopt the
minimal PROF + RDFS + DCMI design above.

---

## Summary of votes

| Q | Vote | Named W3C convention |
|---|---|---|
| Q1 form↔base | **AGAINST bespoke; FOR PROF** | `prof:Profile` (⊑`dct:Standard`), `prof:isProfileOf`, `prof:hasResource`/`ResourceDescriptor`/`hasRole`/`hasArtifact`; community via `dct:publisher` |
| Q2 profile metadata | **FOR PROF/DCAT/DCMI mapping; AGAINST new predicates** | PROF role registry + `prof:hasToken` + Conneg-by-Profile + `dct:conformsTo`/`format`/`publisher`/`source` |
| Q3 term home / is `definedInContext` reinventing provenance? | **AGAINST `definedInContext`; FOR the standard triple — and YES it reinvents provenance** | `rdfs:isDefinedBy` + `dct:isPartOf` (origin) · `dct:source`/`prov:wasAttributedTo` (provenance) · `dct:subject`→SKOS context (DDD ownership) |
| Q4 over-engineering | **FOR (partial): SKOS scheme keep; coined predicates replace/re-type with standards** | PROF + RDFS + DCMI + SKOS; used-by is shapes-queryable (Knublauch) or `dct:conformsTo`-chain *at payload grain* (it does NOT replace term-grain `servesContext` — revised) |

**One-line thesis:** opda did not need to invent `ValidationContext`, `overlaysContext`,
`definedInContext`, or `servesContext` — W3C already publishes **PROF** for "a form is a profile of a
base and bundles a SHACL resource," and (keeping the two arrows distinct) **`rdfs:isDefinedBy`/`dct:isPartOf`**
for *vocabulary-of-origin* (→ the defining document) and **`dct:subject`** for *DDD community home*
(→ the SKOS context concept), with `dct:source` for provenance. Keep the SKOS scheme; retire/re-type
the coined predicates onto the standards; the S021 home-vs-usage dispute reduces to: home =
`dct:subject` (term→community, authored) vs used-by = shapes-queryable / payload-grain
`dct:conformsTo`-chain — no coined predicate either side.

---

## Cross-talk record (opening pass + first exchange)

**Sent (opening):** baker (PROF vs DCAP/Singapore — complementary, PROF the RDF-native carrier),
knublauch (SHACL = the `role:validation` resource inside a `prof:Profile`; the Guarino
`ValidationContext` reification IS `prof:Profile`), davis (ship the standard; Q3 reduction is
Rec-grade even without PROF).

**Exchange with Kendall (FIBO chair) — Q1/Q3.** Kendall landed **independently** on my Q3 headline:
kill `opda:definedInContext`, use `rdfs:isDefinedBy`; she verified OPDA emits `rdfs:isDefinedBy` on
**zero** terms today. Three things came out of the exchange, all sharpening this deliverable:

1. **FIBO fact, verified against source (FND/Accounting/CurrencyAmount), not memory:** FIBO actually
   carries **no `rdfs:isDefinedBy` triples** — it conveys module-of-origin **purely through the
   ontology IRI path** + namespace prefix. So `rdfs:isDefinedBy` → module file is not literally "what
   FIBO does"; it is the **faithful Rec-grade reconstruction of the IRI-path home signal OPDA gave up
   at ODR-0004** by collapsing to one namespace. This *strengthens* the case for adopting it.

2. **Kendall and I differ by exactly ONE predicate, and it is a YAGNI call, not a vocabulary
   dispute** — resting on a distinction this deliverable should state explicitly:
   **module-of-definition ≠ DDD-community-ownership** (two orthogonal axes).
   - `rdfs:isDefinedBy` → TTL module recovers **module-of-definition** ("which file declares it").
   - But OPDA's six DDD contexts are **not** its seven TTL modules (the SKOS scheme is industry
     *communities of practice*; the TTL split is by *ontological concern* — foundation / agents /
     descriptive / …). FIBO can collapse the two because *in FIBO the module IS the domain*; OPDA's
     do not line up. So `rdfs:isDefinedBy` → `opda-descriptive.ttl` does **not** answer "which of the
     six communities owns this term."
   - Therefore I keep **`dct:subject` → the SKOS context concept** *in addition to*
     `rdfs:isDefinedBy` — not to reinvent provenance (Kendall's correct worry against
     `definedInContext`-generated-from-`dct:source`), but to carry the **one fact `rdfs:isDefinedBy`
     structurally cannot**: DDD ownership, a `dct:subject`/aboutness relation.
   - **Resolution hook (Queen):** the fork reduces to *"is community-ownership a fact OPDA must carry
     (named consumer)?"* YES → `dct:subject` (DCMI, not coined). NO/YAGNI → Kendall and I land
     identically on `rdfs:isDefinedBy` alone. **Either way `definedInContext` dies.** Same
     named-consumer test Davis applied to `servesContext` in S021 — adjudicable on existing principle.

3. **Q1 — Kendall's `owl:imports` alternative is foreclosed by the record under review.** She asked
   whether form→base could be drawn "purely with `owl:imports` + SHACL targeting, FIBO-module style."
   It cannot: **ODR-0010's own "Graph separation" rule states verbatim *"Shapes reference classes via
   targeting, never `owl:imports`… open-world OWL/RDFS must not be confused with closed-world
   SHACL."*** The council *deliberately* banned `owl:imports` between profile shapes and the base
   TBox (the SHACL/OWL firewall). FIBO uses `owl:imports` because its modules are all-OWL in one
   regime; OPDA's profiles are SHACL-over-OWL with a firewall. That leaves a **profile-grain**
   association that is neither `owl:imports` nor SHACL targeting (targeting is **node-grain** — "this
   shape validates that class" — not "this profile is a profile of that base specification").
   **`prof:isProfileOf` is the only standard that names it.** PROF is thus not an exotic reach but the
   convention for the very association ODR-0010 left bespoke *because* it had already banned the
   `owl:imports` alternative. Symmetry clincher: if `overlaysContext` is "a local spelling of
   `prof:isProfileOf`" (Kendall's framing), then by her own Q3 logic — use the standard you are
   spelling — OPDA should adopt `prof:isProfileOf`.

**Exchange with Knublauch (SHACL) — Q1/Q2, the layer boundary.** Knublauch landed the cleanest
statement of the split in the session: **SHACL owns the constraints; PROF owns the
description-of-the-profile-as-an-artefact.** He decomposed `opda:ValidationContext`'s payload and I
confirmed each part:

4. **`opda:requires` is REDUNDANT with the shapes graph (Knublauch's sharpest cut) — and it dissolves
   the `servesContext` derivation.** A SHACL processor enumerates the `sh:path` of every
   `sh:minCount ≥ 1` property shape in the profile's shapes graph; that *is* the required-term set.
   `opda:requires` re-states, as generator-maintained triples, a set the shapes graph already entails
   — a **second source of truth**, the same derive-don't-declare violation Allemang names on
   `definedInContext`. **Knock-on to Q1/Q4:** ODR-0020 Rule 5 builds the `servesContext` CONSTRUCT by
   reading `overlaysContext → requires → <term>`. If `requires` is redundant *and* `overlaysContext`
   becomes `prof:isProfileOf` (+ the `( prof:isProfileOf dct:conformsTo )` chain), the **entire
   `servesContext` derivation is rebuilt on standard footing or dispensed with**: a payload's
   `dct:conformsTo <profile>` infers conformance to the base, and "which profile requires term X" is
   answered by enumerating shapes. So `opda:requires` joins the retire list, and it takes the
   derivation machinery with it. (`opda:profileURI`/`opda:sourcedFrom` likewise → the profile's own
   dereferenceable IRI + `dct:source` — no bespoke predicate earns a place.)

5. **(a) bare `owl:Ontology`+shapes vs (b) typed `prof:Profile` node — I come down on (b), on
   principle not taste.** Option (a) (no typed profile node, just `sh:targetClass` shapes) **loses
   three things a bare shapes graph structurally cannot express**: (i) **resource bundling** — "this
   profile = SHACL(`role:validation`) + DASH(`role:guidance`) + enums(`role:vocabulary`) +
   example(`role:example`)"; only `prof:hasResource`/`ResourceDescriptor`/`hasRole` says it; (ii) the
   **profile-grain** association — `sh:targetClass` is *node-grain* ("this shape validates that
   class"), not "this *profile* is a profile of that *base spec*," which is `prof:isProfileOf` + its
   chain axiom; (iii) **content negotiation** — `prof:hasToken` + Conneg-by-Profile lets a consumer
   *request* a conformant view; a bare `owl:Ontology` has no token slot. So the typed `prof:Profile`
   node **earns its keep** (it is not ceremony over the shapes graph) — but it holds **description
   only**; the constraints stay 100% in Knublauch's SHACL shapes graph. **PROF wraps; it does not
   absorb.** The Guarino-forced `ValidationContext` reification was the right instinct (a profile
   needs fixed model-theoretic identity, not "a function of which files a build passed") — and
   `prof:Profile` (IS-A `dct:Standard`) is that instinct spelled in the standard.

**Exchange with Davis (DA) — Q1/Q3, and the fork-closing move.** The Devil's Advocate (whose brief is
to defend derive-from-the-artifact) converged on **both** headlines, arguing from my own S019
URI-opacity reasoning: (a) home = `rdfs:isDefinedBy`, not a coined predicate; (b) form↔base =
`prof:isProfileOf` (range `dct:Standard`), opaque profile IRI → opaque base IRI, no bespoke predicate.

6. **URI opacity SUPPORTS `rdfs:isDefinedBy`; it is not a reason to go bespoke.** Davis asked directly
   whether opacity forces a bespoke home predicate. No — the opposite. Opacity (RFC 3986) means a
   term's home cannot be read out of its IRI *string* (the very reason per-context namespaces fail at
   S019), so the home must be stated as a **triple**; `rdfs:isDefinedBy` *is* that triple. A bespoke
   `definedInContext` adds zero opacity-handling. On "or at most `rdfs:subPropertyOf
   rdfs:isDefinedBy`": **use `rdfs:isDefinedBy` directly** — a sub-property is gilding unless a named
   reason needs a *distinct* relation that still entails `isDefinedBy`. So `definedInContext` is now
   convicted a **fourth** way (Davis: oldest applicable standard, never wired up).

7. **The community-ownership fork is a YAGNI call that belongs to Davis — and it closes the council
   three-way.** Davis wrote "`rdfs:isDefinedBy` → the owning context/module IRI" as if context and
   module are one thing. They are in FIBO (module = domain); they are **not** in OPDA (six
   *communities of practice* ≠ seven *ontological-concern* TTL modules). So the Kendall/Gandon split
   (`dct:subject` or not) reduces to Davis's own named-consumer test: **is there a consumer needing
   "which of the six communities owns term X" that `rdfs:isDefinedBy`→module + profile conformance
   cannot answer?** If NO (likely YAGNI) → Gandon/Kendall/Davis land *identically* on
   `rdfs:isDefinedBy` alone, `dct:subject` deferred-not-built (and deferred to a *standard*, never a
   coined predicate). If YES → the answer is `dct:subject` (standard), never `definedInContext`.
   Either branch kills `definedInContext`; the ruling I asked Davis to make is the same test he runs
   on `servesContext`. **This is the cleanest path to convergence and I have put it to him explicitly.**

**Rebuttal exchange with Kendall — TWO position revisions (intellectual honesty; my opening overreached).**
Kendall adopted the Q3 triple verbatim and *verified* the corpus reinforces the three-referent split
(today `dct:source` points at ODR sections + legislation.gov.uk/EUR-Lex/OpenID, **never** at contexts —
empirical proof the three predicates have non-colliding referents). She held against me on two points,
both correct, and I revise accordingly:

8. **REVISION — the conformance chain does NOT replace `servesContext` (I conceded this).** My opening
   claimed PROF's `( prof:isProfileOf ∘ dct:conformsTo )` chain "replaces most of `servesContext`."
   **Wrong — and it was the same grain-conflation I accused `overlaysContext` of.** The chain acts on
   a **payload** (`dct:conformsTo` is an instance assertion) → instance-to-base conformance.
   `servesContext` is a **term-grain TBox** assertion. Different subject; the chain *complements*,
   does not replace. **But this does not resurrect a *coined* `servesContext`:** (i) Knublauch's
   redundancy result answers "which profiles use term X" by enumerating the shapes graphs' `sh:path`
   sets — *queryable, needn't be materialised*; (ii) if a named term-grain consumer wants it
   materialised, the predicate is `dct:subject` (term→context) or a thin `rdfs:subPropertyOf
   dct:relation`, **not** a freestanding `opda:servesContext`. So I withdraw "chain replaces it" and
   hold only "not a coined freestanding predicate" — routed to **Davis's named-consumer test**.

9. **REVISION — cite PROF + adopt its Rec-grade core; do NOT make the WG Note the load-bearing spine.**
   Kendall's governance point lands: for a UK national-standard programme, predicating the form
   mechanism on a 2019 *Working Group Note* is a commitment, not a vocab pick. Corrected position:
   **adopt the Recommendation-grade pieces** — `dct:conformsTo` + its chain axiom (the one normative
   bit) and the role-registry as plain `skos:Concept`s — and **cite** PROF as the analogue for the
   rest, rather than depending on the Note. The Q1/Q3 reductions still stand on Recs alone
   (`prof:isProfileOf`'s core is the `dct:conformsTo` chain; `rdfs:isDefinedBy`/`dct:source`/
   `dct:subject` are Recs).

10. **REFRAME (not concession) — `ValidationContext` is RE-TYPED, not deleted; the Guarino truth-maker
    is preserved.** Kendall (with Allemang) invokes Guarino's S010: a `sh:minCount 1` is "a constraint
    of a named context… not a free-floating axiom." Agreed — the truth-bearer must be a **named node**.
    My claim was never "delete the node"; it is "**re-type** it `opda:ValidationContext` → `prof:Profile`"
    (IS-A `dct:Standard` — a named, dereferenceable truth-bearer with fixed model theory; the
    relativised constraint lives in its `role:validation` shapes-resource). The truth-maker survives;
    only the bespoke *type* retires. **Bridge offered (symmetric with the home-relation resolution):**
    `opda:ValidationContext rdfs:subClassOf prof:Profile` (or `⊑ dct:Standard` if `prof:` is vetoed) —
    a **local type with a standard supertype**, exactly the `rdfs:subPropertyOf rdfs:isDefinedBy` move
    Davis and I adopted for the home arrow. Keeps Kendall's node + governance hook; gives the generic
    consumer a `prof:Profile`/`dct:Standard` for free; cites the Note rather than spining on it. This
    closes (1b): we keep the node, differ only on whether the supertype is `prof:Profile` or
    `dct:Standard`.

**Net of the rebuttal pass:** Q3 triple **settled** (Kendall adopts verbatim + corpus-verified).
`definedInContext` dead four ways. `servesContext` — *not* chain-replaced (revised); held only against
*coined freestanding* form → Davis's named-consumer test. PROF — **cite + adopt Rec-grade core**, not
the Note as spine (revised). `ValidationContext` — **re-typed, not deleted**; `rdfs:subClassOf
prof:Profile`/`dct:Standard` is the bridge. The over-engineering verdict is unchanged in *direction*
(coined predicates shadow standards; SKOS scheme survives) but **more surgical in degree** than my
opening: re-type and root-in-standards rather than wholesale-delete; the truth-bearing node and a
term-grain usage relation can survive as standard-rooted local terms if a consumer is named.
