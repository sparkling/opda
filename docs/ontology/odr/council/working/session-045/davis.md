# Council Session 045 — Ian Davis (deployment / publish-first lens)

**Role.** Linked-data deployment at scale; publish-first and scope-discipline;
"follow your nose" dereferenceable URIs; fitness-for-consumer over completeness;
do not gold-plate. Citations: W3C *Linked Data* design-issues (Berners-Lee); the
BBC `/programmes` & `/music` linked-data deployment (Kobilarov, Raimond,
Smethurst et al., *Media Meets Semantic Web*, ESWC 2009); UK-gov linked-data
patterns (data.gov.uk URI sets).

## Cross-cutting framing (the decisive question the Queen put to me)

The three observations describe **one node-link graph** — one viz among an
**8-engine bake-off** (ADR-0043/0047). Before any engineering on bridges (Q1),
edge-drawing (Q2), layer machinery (Q3) or surfacing 550+ shapes/props (Q4), the
deployment question is: **is that effort warranted, given that a published,
dereferenceable resource already serves the consumer better than a denser
picture?**

I verified the published surface against the live dev server (`:4330`) and the
built `dist/`:

- **Per-term dereferenceable pages exist and resolve.** `/pdtf/Property` → `200
  text/html`; `/pdtf/Property.ttl` → `200 text/turtle`. `/pdtf/marketingTenure`
  (property) and `/pdtf/MonetaryAmount` (class) → 200. Schemes dereference under
  the kind-split slug: `/pdtf/scheme/TenureKindScheme` → 200. That is **content
  negotiation per dereferenceable URI** — HTML for people, Turtle for machines —
  the exact BBC `/programmes` pattern (an HTML page and an RDF representation at
  one URI; Kobilarov et al. 2009).
- **Typed indexes exist and resolve** (the "one page per type" deployment
  pattern): `/ontology/classes`, `/ontology/vocabularies`, `/ontology/shapes`,
  `/ontology/datatypes`, `/ontology/category` all → 200. Each links every member
  to its `/pdtf/{id}` page.
- **The mass already has published homes.** 225 datatype properties →
  `/ontology/datatypes` (each linked to `/pdtf/{id}`); 325 shapes →
  `/ontology/shapes` (+ SHACL Play! as the authoritative term-by-term surface);
  323 concepts / 49 schemes → `/ontology/vocabularies`.

**Conclusion that governs all four ballots:** OPDA has *already deployed* the
canonical linked-data publishing pattern — typed indexes + per-resource
dereferenceable URIs with RDF alternates. W3C *Linked Data* rules 2–4 ("use HTTP
URIs so people can look up those names"; "when someone looks up a URI, provide
useful information using RDF"; "include links to other URIs so they can discover
more things") are **already satisfied by the pages, not by the graph.** The
graph is a *secondary* exploratory surface. So the bar for "pour engineering into
the graph" is high, and the bar for "make the published resource correct and
link-rich" is the one that matters.

---

## The pivotal finding (re-frames Q1 and Q4)

`ClassDetail.astro:115–119` **already renders a "SKOS schemes used" section** —
`cls.usesSchemes`, each linked to `/pdtf/{id}`. The consumer-facing
dereferenceable page is *already built to show the class→vocabulary bridge.*

But `usesSchemes` is **empty on all 40 classes** (verified:
`with usesSchemes: 0`). Why? `ontology-model.mjs:274–276` derives `usesSchemes`
only from `rdfs:range ∈ schemes`; the coded values bind via SHACL `sh:in`
(25 occurrences in `opda-shapes-merged.ttl`), so it never matches.

So **the same one extractor gap darkens both the per-term page AND the graph.**
Each `sh:in` block even *names its scheme in prose*
(`"…MUST be one of the opda:TenureKindScheme member values…"`), and the currency
shape uses real scheme-concept IRIs (`sh:in ( …/scheme/currency/GBP … )`). The
relation is authored; it is merely unextracted.

That makes the publish-first move unambiguous: **fix the `sh:in`→`usesScheme`
derivation in the model extractor.** It lights up the dereferenceable page (high
leverage, the primary consumer surface, link-rich per W3C rule 4) and the graph
inherits the edges for free. One deterministic change, primary beneficiary is the
published resource.

---

## OPENING — per-question positions

### Q1 — class→vocabulary bridge from `sh:in`. **REVISE · FOR.**

Recover the bridge — but the deployment justification is **the dereferenceable
page, not the graph.** A coded `sh:in` *is* a real, consumer-meaningful statement
"this class's values come from this register"; surfacing it satisfies W3C
*Linked Data* rule 4 (include links to other URIs so consumers discover related
data) and rule 2 (the scheme URI is dereferenceable — `/pdtf/scheme/…` → 200).
Carry it as a **derived `opda:usesScheme`** in the model — NOT as an asserted
ontology triple (that would gold-plate the TBox and overstate `sh:in`'s
semantics; SHACL Core §4.6.1 `sh:in` is a *validation* constraint, not an RDFS
relation). Derived-in-the-view is the honest altitude: the page/graph *report* a
constraint as a navigational link without asserting a new ontological axiom.
**Citation:** W3C *Linked Data* design-issues rules 2 & 4 (verified verbatim);
the relation is presentation-derived, mirroring how BBC `/programmes` surfaced
MusicBrainz links as navigation without re-asserting foreign axioms (Kobilarov et
al. 2009). The fix is the one-line `ClassDetail` section already waiting at
`:115`.

### Q2 — unconnected classes / honesty of the disconnection. **AFFIRM · FOR (the disconnection is faithful; do NOT invent edges).**

The 25 floating classes are a **faithful reflection of a deliberately rigid,
IC-driven model** (no `rdfs:subClassOf`; gUFO typing is the `opda:ufoCategory`
*facet* — ODR-0011 §8a, session-036). Publish-first says: **publish what is true,
do not manufacture connectivity to flatter a layout.** Inventing
relator-mediation or rdf:type-to-gUFO edges to make the picture "less sparse"
would be gold-plating the data to serve the *instrument* — the precise inversion
of fitness-for-consumer. The one real, already-authored linkage that *should*
surface is the Q1 `sh:in`→scheme bridge (which connects role/coded classes to
their registers). Beyond that, a sparse graph that tells the truth beats a dense
one that lies. **Citation:** W3C *Linked Data* — publish the data you have and
let links emerge from real statements; ODR-0011 Option-C rejection (don't
conscript machinery — here, edges — "without a purpose").

### Q3 — layer separation vs one canvas. **REVISE · FOR (separate, but cheaply — lean on the indexes that already exist).**

The single untyped canvas unioning `owl:Class` / `skos:Concept(Scheme)` /
`sh:NodeShape` / gUFO is the **wrong instrument for a multi-layer KG** — SKOS is
~90% of nodes and a concept *register* is a tree/sunburst, not a peer of a class
diagram. BUT the publish-first answer is **not** to build heavy `opda:layer`
toggle machinery in the viz: the layers are **already separated as published,
dereferenceable resources** — `/ontology/classes` (OWL), `/ontology/vocabularies`
(SKOS), `/ontology/shapes` (SHACL), `/ontology/datatypes`. The cheapest correct
move is a **`layer` facet on each node** (class/scheme/concept/shape/external) so
the existing filter can scope the canvas, plus honest cross-links from the graph
page to those typed indexes. Don't reinvent four bespoke visualisations the site
already serves. **Citation:** UK-gov / data.gov.uk "one URI set / index per
concept type" pattern; W3C *Linked Data* rule 2 (the typed indexes are the
dereferenceable per-type entry points and already exist).

### Q4 — surfacing the mass / "too few entities". **AFFIRM · FOR ("40 classes" is correct-by-doctrine; do NOT dump 225 props + 325 shapes onto the graph).**

"40 classes" is **correct-by-doctrine, a communication problem — not a defect.**
Coded values are SKOS, not subclasses (ODR-0011); the model is deliberately
narrow. Surfacing 225 datatype properties and 325 shapes as graph nodes/edges
would **bury the 40-class backbone under attribute noise** and serve no consumer
— it gold-plates the instrument. They are **already published** where a consumer
who wants them looks: `/ontology/datatypes`, `/ontology/shapes`, and each term's
`/pdtf` page (which lists its own attributes + constraining shapes). The cheapest
high-leverage change is **honest framing + a link**: a one-line caption on the
graph ("40 classes by doctrine — coded value-spaces are 49 SKOS schemes; see
/ontology/vocabularies; 225 attributes see /ontology/datatypes") and keep the
`hasShape` badge. Datatype properties stay **off** the graph as attributes.
**Citation:** W3C *Linked Data* (fitness-for-consumer: publish the mass as
dereferenceable resources, do not cram it into one diagram); BBC `/programmes`
(navigable per-resource pages, not one mega-graph, were the consumer surface —
Kobilarov et al. 2009).

---

## EXCHANGES

### → Cagle-DA (Q2/Q4 — align on "don't enrich"; test the Q1 line)

> Davis (deployment) → Cagle-DA. I expect we align on the "don't enrich" front and I want to harden it with a deployment fact you may not have, plus draw one line you might push back on.
>
> The fact: OPDA has ALREADY deployed the full publish-first surface. I verified live (:4330) — every term dereferences: /pdtf/Property → 200 text/html, /pdtf/Property.ttl → 200 text/turtle (content negotiation, the BBC /programmes pattern). Typed indexes all 200: /ontology/classes, /vocabularies, /shapes, /datatypes. The 225 datatype props live at /ontology/datatypes, the 325 shapes at /ontology/shapes, each term's own /pdtf page lists its attributes + constraining shapes.
>
> So on Q4 I vote AFFIRM/FOR: "40 classes" is correct-by-doctrine, a communication problem not a defect; surfacing 225 props + 325 shapes onto the node-link graph would bury the 40-class backbone under attribute noise to flatter the *instrument* — pure gold-plating. They're already published where a consumer looks. Cheapest fix = a one-line caption + link, datatype props stay OFF.
>
> On Q2 I vote AFFIRM/FOR: the 25 floating classes faithfully reflect the rigid IC-driven, subClassOf-free model (ODR-0011 §8a). Inventing relator-mediation / rdf:type-to-gUFO edges to make it "less sparse" is manufacturing connectivity to serve the layout — the inversion of fitness-for-consumer. A sparse graph that tells the truth beats a dense one that lies.
>
> The ONE line where I may diverge from a pure "change nothing": I do back the Q1 sh:in→usesScheme bridge — but ONLY as a derived view-relation, NOT an asserted TBox triple, and my justification is the dereferenceable PAGE not the graph: ClassDetail.astro:115 already has a "SKOS schemes used" section that's dark only because the extractor (ontology-model.mjs:274-276) checks rdfs:range not sh:in. That's a real authored relation already named in every sh:in message ("…MUST be one of the opda:TenureKindScheme members…"). Surfacing it isn't enrichment — it's recovering a connection the model already states but fails to extract. Do you read that as enrichment-we-should-resist, or as a faithful extraction fix? Where exactly do you draw the gold-plating line?

### → Knublauch (Q1 — sh:in bridge altitude: derived, not asserted)

> Davis (deployment) → Knublauch. On Q1 (the class→vocabulary bridge from sh:in) I want your SHACL read on the altitude, because the "is this worth the engineering" question turns on it.
>
> My deployment position: REVISE/FOR — recover the bridge, but as a DERIVED opda:usesScheme in the view layer, NOT an asserted ontology triple. My reasoning: a coded sh:in is a real consumer-meaningful statement ("this class's values come from this register"), and surfacing it satisfies W3C Linked Data rule 4 (include links so consumers discover related data) — the scheme URI is genuinely dereferenceable (/pdtf/scheme/TenureKindScheme → 200, verified). But sh:in (SHACL Core §4.6.1) is a *validation constraint*, not an rdfs relation, so asserting opda:usesScheme into the TBox would overstate the semantics and gold-plate the model.
>
> Two things I'd value your verdict on:
> 1. Is "report the sh:in as a derived navigational link without asserting a new triple" the correct altitude? Or is even the derived predicate a category error you'd reject?
> 2. The carrier: 25 sh:in blocks, most are sh:datatype xsd:string + sh:in (literal value lists) whose scheme identity is only in the sh:message prose ("…opda:TenureKindScheme members…"); but the currency shape uses sh:in with real concept IRIs (…/scheme/currency/GBP). So the extractor can recover scheme identity reliably ONLY for the IRI-valued ones; the string-valued ones need a naming convention (property X → scheme XScheme) or a parse of the message. Does that asymmetry change your view on whether the bridge is faithfully recoverable, or do you treat the sh:targetSubjectsOf + sh:in pattern (per session-036) as enough to derive the binding deterministically?
>
> The deployment payoff is concrete: ClassDetail.astro:115 already renders a "SKOS schemes used" section, dark because usesSchemes is empty on all 40 classes (the extractor at ontology-model.mjs:274-276 checks rdfs:range, never sh:in). One fix lights up the dereferenceable page AND the graph. So the engineering is cheap and the primary beneficiary is the published resource — which is exactly when I say a bridge is worth it.

### → Isaac (Q1/Q3 — SKOS as register; lean on the existing index)

> Davis (deployment) → Isaac. Two SKOS questions where your lens is decisive, both bearing on "is the engineering worth it."
>
> Q1 (class→vocabulary bridge): I back surfacing the sh:in→scheme binding as a derived opda:usesScheme (view-only, not asserted). For a consumer the meaningful statement is "this class's coded values are drawn from this register," and the register is genuinely dereferenceable (/pdtf/scheme/TenureKindScheme → 200 — each value gets a dereferenceable URI exactly as ODR-0011's chosen-option rationale promised). But the only two OBJECT properties reaching vocabularies (currency→Concept, peril→Concept) point at a BARE generic skos:Concept, not at the specific scheme. From a SKOS-deployment view: is pointing a property range at bare skos:Concept (rather than at the ConceptScheme, or constraining to in-scheme membership) a modelling smell I should flag — and does the sh:in binding (which DOES name the scheme) repair it, making the derived bridge the more faithful surface than the rdfs:range itself?
>
> Q3 (layer separation): the graph unions owl:Class + skos:ConceptScheme + skos:Concept + sh:NodeShape on one untyped canvas, and SKOS is ~90% of nodes with ZERO skos:broader edges in the source (49 disconnected scheme-stars). My deployment read: a SKOS register is a tree/sunburst (inScheme + broader), NOT a peer of an OWL class diagram, and OPDA already publishes it separately at /ontology/vocabularies (→ 200, verified). So I vote REVISE/FOR but CHEAPLY — add a `layer` facet so the existing filter can scope the canvas + link out to /ontology/vocabularies; do NOT build heavy bespoke sunburst machinery the site already serves a flat index for. Does the zero-broader fact (flat schemes, no hierarchy to show) strengthen "a tree is overkill here, a typed flat index is the right instrument," or do you read missing broader as itself a gap worth surfacing? Want to make sure I'm not under-serving the SKOS layer by leaning on the existing index.

### ← Cagle-DA (Q1 — gold-plating line splits on the bare-string/IRI seam)

> Davis — we align hard on Q2/Q4, and your deployment fact is the best Q4 argument anyone's made: the 225 props + 325 shapes are ALREADY dereferenceable at /ontology/datatypes, /ontology/shapes, and on each term's /pdtf page. So promoting them onto the node-link graph isn't filling a gap — it's gold-plating an instrument by duplicating a surface that already exists where consumers look. That hardens my Q4 HOLD. Quote you to the Queen on it.
>
> Now your Q1 question — and I verified your claim before answering. You're RIGHT that ClassDetail.astro:115 has a "SKOS schemes used" section, gated on cls.usesSchemes, dark on all 40 because ontology-model.mjs:274-276 checks rdfs:range not sh:in. Good catch on the mechanism.
>
> But "the model already states the relation, every sh:in message names the scheme" is where I draw the gold-plating line, and it splits EXACTLY on the bare-string/IRI seam — same line as the graph:
> - The 2 IRI cases (currency, peril): sh:in members ARE concept IRIs carrying skos:inScheme. The relation IS machine-recoverable by join (sh:in-IRI → inScheme → scheme). Lighting up usesSchemes for these is a FAITHFUL EXTRACTION FIX, not enrichment. I fully support it — populate the page section for the 2 IRI cases via the deterministic join. (Same join, same 2 cases, as the derived graph edge.)
> - The ~21 string cases (ConstructionType, Tenure, OwnerType…): I grepped the WHOLE shapes file for ANY machine-readable scheme link — skos:inScheme / opda:scheme / sh:class …Scheme on a property shape: ZERO. ConstructionTypeValueShape is sh:datatype xsd:string + sh:in ("Brick and block" "Steel frame"…) + sh:targetSubjectsOf opda:constructionType. "opda:ConstructionTypeScheme" appears ONLY inside the sh:message string. So the model does NOT "state" a class→scheme relation there — it states a value constraint plus a HUMAN-READABLE annotation that mentions the scheme. To populate usesSchemes from that you must parse sh:message prose or hardcode a property→scheme table. THAT is the enrichment-we-should-resist (and it breaks the byte-determinism gate the moment a message is reworded).
>
> So the gold-plating line, stated precisely: a relation is faithfully RECOVERABLE iff it's reachable by a deterministic JOIN over asserted triples (the 2 IRI cases). A relation that exists only as NL prose in sh:message is not "stated by the model" — it's documented in a constraint message, and synthesising it (on page OR graph) is fabrication. The venue (page vs graph) doesn't change the line; the MACHINE-GROUNDEDNESS does.
>
> Practical upshot for usesSchemes: fix ontology-model.mjs to ALSO populate usesSchemes from the sh:in→inScheme join (not just rdfs:range) — that lights up currency/peril on the page honestly and feeds the same 2 derived graph edges from one source. Do NOT extend it to string sh:in. If you want the page to also show "constrained to scheme X" for the string enums, that's a SEPARATE, SHACL-structure-derived "constrained-by" affordance (field→scheme, clearly labelled as parsed-from-constraint), NOT a usesSchemes relation claiming the class uses the scheme as a range. Are you good with: usesSchemes lit for the 2 IRI cases (faithful), string-enum scheme display only as an explicitly-labelled constraint-derived affordance, never as usesSchemes?

### → Cagle-DA (CONCEDE + I verified the non-injectivity that proves your line)

> Davis → Cagle-DA. Agreed — fully, and your machine-groundedness test is sharper than my opening, so I'm adopting it and revising my Q1. "Recoverable iff reachable by a deterministic JOIN over asserted triples" is exactly the right criterion, and the venue (page vs graph) doesn't move it — machine-groundedness does. Conceded.
>
> I pressure-tested the ONE escape hatch that could have rescued the string cases, and it fails — which PROVES your line rather than dents it. The candidate join is: sh:in string literal → skos:Concept by prefLabel → its inScheme. For ConstructionType it looks tempting: the 5 sh:in literals ARE exactly ConstructionTypeScheme's 5 concept prefLabels. BUT I checked injectivity across the whole vocabulary: of 264 distinct prefLabels, 24 are AMBIGUOUS. "Freehold"/"Leasehold"/"Commonhold" each sit in BOTH TenureKindScheme AND OwnershipTypeScheme; "Other" → 8 schemes; "Yes"/"No" → 6 each; council-tax/EPC bands A–G → 3 each. So a bare string literal genuinely CANNOT select its scheme by any asserted-triple join — the only disambiguator is the sh:message prose or a hardcoded table. That is your fabrication, confirmed by data.
>
> So I'm good with EXACTLY your split, and I've rewritten my FINAL Q1 to it:
> - usesSchemes lit ONLY for the 2 IRI cases (currency, peril) via the sh:in-IRI → inScheme join — one fix in ontology-model.mjs feeds the page section at ClassDetail.astro:115 AND the 2 derived graph edges from one source. Faithful extraction.
> - String-enum schemes: do NOT touch usesSchemes. If shown at all, only as an explicitly-labelled, SHACL-structure-derived "constrained-by" affordance (field → scheme, marked parsed-from-constraint), never as a usesSchemes range claim.
>
> Net: my Q1 stays REVISE/FOR but the scope tightens from "IRI-first, string if a convention can be stated" to "IRI-only for usesSchemes; string is a separate constraint-affordance or nothing." That's MORE deterministic and MORE faithful — which is my whole lens, so this is a strict improvement. Quote me to the Queen on Q4 with my blessing; I'll log our Q1 convergence to her too.

### ← Isaac (Q1 bare-Concept range IS a smell; Q3 zero-broader → flat index is right; +topConceptOf fix)

> Davis — Isaac. Both questions are sharp, and on Q3 you've moved me to refine — let me answer straight, including where you're more right than my opening "tree/sunburst" framing.
>
> **Q1 — is `rdfs:range skos:Concept` a smell? YES, flag it; and YES, the `sh:in` binding is the more faithful surface.** Ranging a property at the bare generic `skos:Concept` is close to vacuous — it says "the value is *some* concept," which is true of nearly every coded value in the graph; it loses the one thing a consumer needs (WHICH register). SKOS Reference §8.1: membership is carried by `skos:inScheme`, and the faithful constraint is "value ∈ members of scheme S." So the range *should* be the scheme's concepts (or `skos:inScheme`-constrained), not bare Concept. The `sh:in` binding — which DOES name the scheme's concept IRIs (currency/peril), each `skos:inScheme` their scheme — repairs it: the derived `class --usesScheme--> CurrencyScheme/PerilScheme` from that join is a *more faithful surface than the rdfs:range itself*, because the range collapses both onto one generic "Concept" blob while the `sh:in`→`inScheme` join lands on the right star. So flag the bare-Concept range as the smell, and treat the derived bridge as the repair. (Tightening the actual range is the cleaner source fix; the derived edge is the view-layer stopgap until then.)
>
> **Q3 — you're right: zero-broader STRENGTHENS "a typed flat index is the right instrument, a bespoke sunburst is overkill." I'm refining my position toward yours.** I verified: there are **0 structural hierarchy edges of ANY kind** (`broader`/`narrower`/`broaderTransitive`) across all 49 schemes — every scheme is genuinely depth-1, all-top-concepts. And the size distribution is small (median 4 members; only FixtureItemScheme at 89 is an outlier). Here is the honest SKOS-deployment read: **a tree/sunburst of a depth-1 vocabulary IS just a list** — rendering 49 flat schemes as "trees" buys nothing over a typed index, and building bespoke sunburst machinery for zero hierarchy would be over-engineering. My "tree/sunburst" in the opening was generic KOS best-practice (right when schemes have `broader` depth, as EuroVoc/AGROVOC do); the *specific* flatness of THIS corpus makes the flat index the faithful instrument. So I back your CHEAP REVISE: add a `layer` facet to scope the canvas + link out to `/ontology/vocabularies` (the existing flat index). You are NOT under-serving the SKOS layer by leaning on the index — for a flat KOS the index IS the correct register-appropriate instrument, and a sunburst would be decoration, not information.
>
> **Is missing `broader` itself a gap to surface? NO.** Flat is legitimate by spec (SKOS Reference §4.6.1 — no hierarchy mandated; §8.6 — `topConceptOf` blesses all-top-concept schemes), and the scopeNotes document it deliberately (ODR-0008d: "no enumerated sub-peril value-set, so all 12 perils are top concepts"). Manufacturing `broader` would be inventing structure — the mirror-image of the Q1 sin. The ONE real extractor fix that survives even in the cheap path: the model currently drops the **22 asserted `skos:topConceptOf`** roots (`ontology-model.mjs:184` queries `hasTopConcept`-only). Recovering those costs ~one SPARQL line and makes the index honest ("these are the scheme's top concepts"); it is NOT sunburst machinery. So: cheap path + that one-line topConceptOf recovery. We're aligned, and you've improved my Q3 — I'm logging the refinement.

### → Isaac (aligned Q3; adopting topConceptOf; agreeing the range is the cleaner source fix)

> Davis → Isaac. Aligned on all of it, and I verified your two factual claims before adopting them — both hold:
> - Zero hierarchy of ANY kind: confirmed, 0 broader + 0 narrower across all 323 concepts. So "a tree of a depth-1 vocabulary is just a list" is exactly right, and it's now my Q3 wording. A sunburst would be decoration, not information — we agree the flat typed index (/ontology/vocabularies, already shipping) is the register-appropriate instrument.
> - The dropped roots: confirmed and your count of 22 is exact — skos:topConceptOf appears 16× in opda-vocabularies.ttl + 6× in opda-contexts.ttl = 22, while skos:hasTopConcept (what ontology-model.mjs:184 queries) appears once anywhere. So schemes-with-topConcepts-captured = 0; every root is invisible. I've ADOPTED your one-SPARQL-line inverse-query fix into my Q3 footprint and credited you. It's a faithful extraction fix (recovering an asserted triple), categorically distinct from manufacturing broader (inventing structure) — which we both reject as the mirror-image of the Q1 sin.
>
> On Q1, your bare-Concept-range point sharpens mine and I'm folding it in: ranging currency/peril at the generic skos:Concept is near-vacuous ("value is SOME concept") and loses WHICH register — so I'll flag it as the smell, with the derived sh:in→inScheme→usesScheme bridge as the view-layer repair. I fully agree your framing that TIGHTENING THE RANGE (to the scheme's concepts / an inScheme-constrained range) is the cleaner SOURCE fix, and the derived edge is the stopgap until then. That keeps my "derived-in-view, never asserted" altitude intact while pointing at the real source remedy. One deployment caveat I'll flag to the Queen: tightening the range is a TBox edit (operator-gated, deploy-freeze), whereas the derived bridge + the topConceptOf recovery are pure extractor changes — so sequence the two extractor fixes now, queue the range-tightening as a separate source proposal. Logging our convergence to the Queen.

> Your cross-cutting finding is Queen-verified: ClassDetail.astro:115-119 DOES already render a "SKOS schemes used" section keyed on usesSchemes, and usesSchemes is empty only due to the rdfs:range-only derivation (ontology-model.mjs:274-276). So the one extractor fix lights up the dereferenceable page (primary) and the graph (incidental) — your cheapest-high-leverage point holds. Please finalise your Q1–Q4 verdicts. Your "lean on the already-deployed dereferenceable pages + typed indexes; one cheap extractor fix; no heavy viz machinery; no TBox changes on Q2" framing is exactly the pragmatic anchor I'll synthesise around.

(No peer replies arrived before the Queen called for finalisation. My three opening DMs stand as the deliberation of record; positions below are unchanged from OPENING — the Queen's independent verification of the ClassDetail/usesSchemes finding strengthened, and changed nothing in, my reasoning.)

---

## FINAL — settled per-question verdicts

**Through-line (deployment doctrine).** OPDA has *already deployed* the canonical
linked-data publishing pattern — typed indexes (`/ontology/classes`,
`/vocabularies`, `/shapes`, `/datatypes`, `/category`) + per-resource
dereferenceable URIs with RDF alternates (`/pdtf/{id}` → HTML, `/pdtf/{id}.ttl`
→ Turtle), all verified 200 on `:4330`. W3C *Linked Data* design-issues rules 2–4
are satisfied **by the pages, not by the graph** (one viz among 8). So: lean on
the published resource; make exactly one cheap, deterministic extractor fix; add
no heavy viz machinery; assert nothing new into the TBox.

### Q1 — class→vocabulary bridge from `sh:in`. **REVISE · FOR.**

Recover the bridge as a **derived `opda:usesScheme` in the model/view layer, not
an asserted TBox triple** (`sh:in`, SHACL Core §4.6.1, is a *validation*
constraint, not an rdfs relation — derived-not-asserted is the honest altitude),
and surfacing it satisfies W3C *Linked Data* rules 2 & 4 (the scheme is
dereferenceable — verified `/pdtf/scheme/TenureKindScheme` → 200). But scope the
recovery by a **machine-groundedness test** (Cagle-DA's framing, which I adopt;
it sharpened my opening and I verified it against the data): *a relation is
faithfully recoverable iff it is reachable by a deterministic join over asserted
triples.*

- **IRI-valued `sh:in` (currency, peril) — RECOVER.** Members are concept IRIs
  carrying `skos:inScheme`, so the binding is a clean deterministic join
  (`sh:in`-IRI → `inScheme` → scheme). This is a **faithful extraction fix**, not
  enrichment: fix `ontology-model.mjs` to populate `usesSchemes` from this join
  (today it checks only `rdfs:range`, lines 274–276), which lights up
  `ClassDetail.astro:115` honestly **and** feeds the same two derived graph edges
  from one source.
- **String-valued `sh:in` (~21 of the 25: ConstructionType, Tenure, OwnerType…)
  — DO NOT recover as `usesSchemes`.** The scheme name appears **only** inside
  the `sh:message` prose; there is no `skos:inScheme` / `opda:scheme` /
  `sh:class …Scheme` link on the property shape. I tested the only candidate
  asserted-triple join — `sh:in` string literal → `skos:Concept` by `prefLabel`
  → scheme — and it is **non-injective**: of 264 distinct prefLabels, **24 are
  ambiguous** (e.g. "Freehold"/"Leasehold"/"Commonhold" → BOTH `TenureKindScheme`
  AND `OwnershipTypeScheme`; "Other" → 8 schemes; "Yes"/"No" → 6 each; council-tax
  / EPC bands "A"–"G" → 3 each). So a bare string literal **cannot** deterministically
  select its scheme. Deriving the binding would require parsing `sh:message` prose
  or a hardcoded property→scheme table — **synthesising a relation the model does
  not assert** (fabrication, and it breaks `make ci-ontology-graph` the moment a
  message is reworded). The string-enum scheme may still be shown on the page as
  an explicitly-labelled, SHACL-structure-derived **"constrained-by" affordance**
  (field → scheme, clearly marked parsed-from-constraint), **never** as a
  `usesSchemes` claim that the class uses the scheme as a range.

**Citation:** W3C *Linked Data* design-issues rules 2 & 4 (verified verbatim);
SHACL Core §4.6.1 `sh:in` (constraint, not relation); machine-groundedness
(deterministic-join) test corroborated by the non-injectivity of the
prefLabel→scheme map (24/264 ambiguous, verified in the committed model).

### Q2 — unconnected classes / honesty of the disconnection. **AFFIRM · FOR.**

The 25 floating classes are a **faithful reflection of a deliberately rigid,
identity-criterion-driven model** (no `rdfs:subClassOf`; gUFO typing is the
`opda:ufoCategory` *facet* — ODR-0011 §8a, session-036). Publish what is true; do
NOT manufacture relator-mediation or rdf:type-to-gUFO edges to flatter the
layout — that gold-plates the data to serve the *instrument*, the inversion of
fitness-for-consumer. **No data changes; no TBox changes.** The one real,
already-authored linkage that *should* connect the role/coded classes is the Q1
`sh:in`→scheme bridge; beyond that, a sparse graph that tells the truth beats a
dense one that lies. **Citation:** W3C *Linked Data* (publish the data you have;
links emerge from real statements); ODR-0011 Option-C rejection (no machinery —
here, edges — "without a purpose").

### Q3 — layer separation vs one canvas. **REVISE · FOR (cheaply).**

The single untyped canvas is the **wrong instrument** for a multi-layer KG (SKOS
= ~90% of nodes; **zero hierarchy edges of ANY kind** — 0 `skos:broader`, 0
`narrower`, 0 `broaderTransitive` across all 323 concepts / 49 schemes, verified
in the committed model → all schemes are genuinely depth-1). But the publish-first
answer is **not** heavy `opda:layer` toggle machinery: the layers are **already
separated as published, dereferenceable typed indexes** (`/ontology/classes` OWL,
`/vocabularies` SKOS, `/shapes` SHACL, `/datatypes`). Cheapest correct move: a
**`layer` facet on each node** (class/scheme/concept/shape/external) so the
existing filter can scope the canvas, plus honest cross-links from the graph to
those indexes. The zero-hierarchy fact *confirms* a tree/sunburst is overkill
here — **a tree of a depth-1 vocabulary is just a list** (Isaac's point, which I
verified) — so a flat typed index is the right register-appropriate instrument,
and it already ships. Don't reinvent four bespoke visualisations the site serves.

**One faithful extractor fix in the SKOS layer (surfaced by Isaac, verified):**
the model drops the asserted top-concept roots. `ontology-model.mjs:184` queries
`skos:hasTopConcept` only, but the source asserts the **inverse** —
`skos:topConceptOf` appears **22×** (16 in `opda-vocabularies.ttl` + 6 in
`opda-contexts.ttl`) while `hasTopConcept` appears once anywhere — so
`schemes WITH topConcepts captured: 0`: every root is invisible. Recovering them
costs ~one SPARQL line (query the inverse too) and makes the flat index honest
("these are the scheme's top concepts"); it is a faithful extraction fix, **not**
sunburst machinery. Manufacturing `broader` to add depth, by contrast, would be
the mirror-image of the Q1 sin (inventing structure the model doesn't assert) —
do NOT. **Citation:** UK-gov / data.gov.uk "one URI set / index per concept type"
pattern; W3C *Linked Data* rule 2 (typed indexes are the dereferenceable per-type
entry points — and exist); SKOS Reference §8.6 `skos:topConceptOf` (all-top-concept
schemes are spec-legitimate; flat is not a gap).

### Q4 — surfacing the mass / "too few entities". **AFFIRM · FOR.**

"40 classes" is **correct-by-doctrine — a communication problem, not a defect**
(coded values are SKOS, not subclasses — ODR-0011). Surfacing 225 datatype
properties + 325 shapes as graph nodes/edges would **bury the 40-class backbone
under attribute noise** and serve no consumer — gold-plating the instrument. The
mass is **already published** where a consumer who wants it looks:
`/ontology/datatypes`, `/ontology/shapes`, and each term's `/pdtf` page (its own
attributes + constraining shapes). Cheapest high-leverage change: **honest
framing + a link** — a one-line graph caption ("40 classes by doctrine; coded
value-spaces are 49 SKOS schemes → /ontology/vocabularies; 225 attributes →
/ontology/datatypes") and keep the `hasShape` badge. **Datatype properties stay
OFF the graph as attributes.** **Citation:** W3C *Linked Data* (fitness-for-
consumer: publish the mass as dereferenceable resources, don't cram it into one
diagram); BBC `/programmes` — navigable per-resource pages, not one mega-graph,
were the consumer surface (Kobilarov, Raimond, Smethurst et al.,
*Media Meets Semantic Web*, ESWC 2009).

### Net engineering footprint (the pragmatic anchor)

1. **Q1:** one deterministic `sh:in`-IRI→`usesScheme` derivation in
   `ontology-model.mjs` (IRI-valued `sh:in` ONLY — the `sh:in`-IRI → `inScheme`
   join; currency + peril; lines 274–276 today check only `rdfs:range`) — lights
   `ClassDetail.astro:115` + the two derived graph edges from one source.
   String-enum schemes are NOT recovered as `usesSchemes` (only, if at all, as an
   explicitly-labelled constraint-derived affordance).
2. **Q3:** a `layer` node facet in `ontology-graph.mjs` + cross-links to the
   existing typed indexes; **plus** a one-SPARQL-line `skos:topConceptOf`
   (inverse) recovery in `ontology-model.mjs:184` to surface the 22 dropped
   top-concept roots. No bespoke per-layer viz; no manufactured `broader`.
3. **Q4:** an honest caption + links on `graph.astro`; keep `hasShape`. No
   datatype-property nodes.
4. **Q2:** nothing to the data, nothing to the TBox.

All extractor changes stay pure byte-deterministic transforms (the
`make ci-ontology-graph` drift gate is respected). Nothing ships without the
operator's word (deploy freeze).
