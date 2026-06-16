# Session 045 — Nicola Guarino (working file)

**Lens:** Formal ontology; OntoClean meta-properties — Rigidity (R), Identity (I),
Unity (U), Dependence (D); ontological well-foundedness; the prohibition on
conflating taxonomic/ontological levels. I argue strictly from identity criteria,
rigidity, unity and dependence, and from the OntoClean discipline of drawing only
relations that *hold*.

Primary sources I cite:
- Guarino & Welty, "An Overview of OntoClean", in *Handbook on Ontologies* (2nd ed.,
  Staab & Studer eds., 2009), §§2–4 — the meta-property apparatus and the
  backbone-taxonomy discipline.
- Guarino, Oberle & Staab, "What Is an Ontology?", in the same *Handbook* (2009) §1 —
  the ontology-as-shared-conceptualisation framing; levels of generality.
- Guarino 1998, "Formal Ontology and Information Systems" (FOIS '98) — the
  level-confusion / ontology-vs-knowledge-representation distinction.
- Welty & Guarino 2001, "Supporting ontological analysis of taxonomic relationships"
  (*Data & Knowledge Engineering* 39(1)) — IC and the misuse of subsumption.
- W3C SKOS Reference (Miles & Bechhofer eds., 2009) §8 `skos:inScheme`;
  §1.3 ("SKOS is **not** a formal knowledge representation language"; KOS structures
  "do not have any formal semantics, and cannot be reliably interpreted as either
  formal axioms or facts about the world"); §3.5.1 ("This specification does **not**
  make any additional statement about the formal relationship between the class of
  SKOS concepts and the class of OWL classes") — **web-verified 2026-06-16**.
- W3C SHACL Recommendation (Knublauch & Kontokostas 2017) §4.6.1 `sh:in`,
  §2 (shapes describe *conformance conditions on data*, they are not RDFS/OWL axioms).

---

## OPENING

### Q1 — Class→vocabulary bridge from `sh:in` / `→Concept` ranges

**Verdict: REVISE — FOR (with a sharp boundary).**

A `sh:in` constraint is **not** an ontological relation. SHACL §2 is explicit that a
shape states a *conformance condition on data* — it constrains the admissible value
space of a property; it asserts nothing about the universals. To read `sh:in` as a
class→scheme *relation in the ontology* is precisely the level-confusion Guarino 1998
(FOIS) warns against: confusing the **constraint layer** with the **conceptualisation**.

But the empirical finding is sharper than the question assumes, and it cuts in my
favour. I inspected `opda-shapes-merged.ttl`: the overwhelming majority of `sh:in`
lists are **bare `xsd:string` literals** — `sh:in ( "Brick and block" "Steel frame" … )`,
`sh:in ( "Freehold" "Leasehold" "Commonhold" )`. These do **not** mention the scheme
or its `skos:Concept` IRIs at all. The correspondence to `opda:ConstructionTypeScheme`
lives only in the human-readable `sh:message`. So for ~24 of the 25–27 shapes there is
**literally no class→scheme edge to recover** without the extractor *inventing* the link
by string-matching a constraint message to a scheme name. Drawing that edge would not
be surfacing a hidden relation — it would be **fabricating** one. OntoClean's first
duty (Welty & Guarino 2001) is to draw only relations that hold.

There is exactly one honest case: where `sh:in` lists **concept IRIs**
(`sh:in ( <…/currency/GBP> <…/currency/EUR> <…/currency/USD> )`) and the two
object properties `currency`/`peril` with `rdfs:range` reaching a vocabulary. There a
genuine dependence holds: a `MonetaryAmount` is existentially incomplete without a
currency drawn from `CurrencyScheme`. **That** is a real relation and the graph wrongly
omits it (the `→Concept` range points at a bare generic `Concept`, losing the scheme).

**Therefore REVISE, narrowly:** surface a derived edge **only** where the binding is
machine-grounded in IRIs — `rdfs:range ∈ schemes` (already intended but mis-coded) and
`sh:in` over **concept-IRI** members. A derived predicate (e.g. `opda:usesScheme`) is
acceptable *iff* it is typed as a **provenance/derivation annotation, not an asserted
ontological relation**, and is visually distinguished from object-property edges (a
dashed "constraint-derived" edge). For the bare-string `sh:in` shapes, draw **nothing**:
the relation does not exist at the IRI level, and the value-keyed enforcement
(ODR-0011 §8a; `sh:targetSubjectsOf`) deliberately keeps the literal value-space and
the SKOS register as *parallel governed layers*, not a typed relation.

### Q2 — Honesty of the disconnection (25/40 float)

**Verdict: AFFIRM — AGAINST adding subclass/type edges; FOR adding the genuine relator edges.**

This is the question where my lens is decisive, and the model is **right**. The 25
orphans (Person, Buyer, Seller, Proprietor, Relator, Role, RoleMixin, Evidence-roles)
float because:

(a) **There is no `rdfs:subClassOf`** — by the OntoClean load-bearing cascade
(ODR-0011 §8a; session-036, on which Guizzardi withdrew his conjunctive-AND test),
+R∧−I kinds are coded facets, not subclasses, and **−R (anti-rigid) Roles are NEVER
`rdfs:subClassOf` a Kind**. Buyer, Seller, Proprietor are anti-rigid Roles. To draw a
`subClassOf` edge from Buyer to Person would be the canonical OntoClean violation:
subsuming an anti-rigid type under a rigid one (Welty & Guarino 2001 §3 — a rigid
property cannot subsume an anti-rigid one without making the role rigid). The
disconnection is **not** a defect; it is the *visible trace of correct rigidity
discipline*. An edge there would be ontologically false.

(b) **gUFO typing is the string facet `opda:ufoCategory`**, not an edge (ODR-0011 §8a).
A Person's being a "Substance Kind" and a Buyer's being a "Role" are **meta-level**
classifications (the entity's OntoClean category), not domain relations. Rendering
`rdf:type → gUFO-category` as a graph edge would **re-introduce the level-confusion**
Guarino 1998 forbids: it mixes the meta-property assertion (about the *type* of the
universal) onto the same canvas as relations *between* universals.

**BUT** — and this is the constructive half — OntoClean says role/relator structure
*is real*. A Role is existentially dependent on its Relator (Guizzardi 2005 Ch. 4,
adopted across ODR-0006/0011); a Relator (Transaction, the MonetaryAmount-style value
class, Vouch/Document evidence relators) mediates the roles. **Those mediation
relations genuinely hold and the graph is wrongly omitting them** *if* they are
asserted in the TTL as object properties. The honest fix for #1 is **not** to invent
type/subclass edges, but to ensure every **asserted** relator→role / role→relator
object property (and the MonetaryAmount hub, ODR-0024) is surfaced. If Buyer still
floats after that, it floats *honestly* — because no relation to it has been asserted
yet, which is a **modelling-completeness signal**, not a viz defect. The graph should
*report the orphan*, not paper over it.

### Q3 — Layer separation vs one canvas

**Verdict: REVISE — FOR explicit layer separation.**

This is an OntoClean level-confusion concern and I hold it firmly. Putting `owl:Class`
(universals), `skos:Concept`/`ConceptScheme` (values in a controlled vocabulary —
SKOS Reference §1.4 is explicit that these are **not** classes and SKOS is **not** a
class logic), and `sh:NodeShape` (data-conformance constraints — SHACL §2) on **one
untyped node-link canvas** conflates three distinct ontological strata:

- **Universals / kinds** (the T-Box: what things *are*) — `owl:Class`.
- **Values / conceptualised qualia** (the controlled registers: admissible *fillers*) —
  SKOS. A `skos:Concept` like "Freehold" is a *value in a quality region*
  (ODR-0011 §8a, "Quale-in-Region"), categorially **not** a universal. The SKOS
  Reference §3.5.1 *deliberately declines* to commit `skos:Concept` to OWL class
  semantics, and §1.3 states SKOS "is not a formal knowledge representation language"
  whose structures carry "no formal semantics" — so rendering concept nodes
  indistinguishable from `owl:Class` nodes asserts-by-presentation a categorial
  identity the SKOS spec itself refuses to make.
- **Constraints** (conformance conditions on data) — SHACL shapes.

Guarino 1998 (FOIS) and Guarino/Oberle/Staab 2009 §1 draw exactly this distinction
between the ontological level and the other levels of an information system. To merge
them on one canvas — where SKOS is ~90% of nodes and visually indistinguishable from
universals — is to **assert, by presentation, that they are the same kind of thing.**
They are not. This is *the* conflation, and it is real, not cosmetic.

**REVISE:** introduce an explicit `opda:layer` view dimension (T-Box-OWL / SKOS-vocab /
SHACL-shape / gUFO-meta) as toggleable, grouped layers. I do **not** insist the single
node-link instrument be abolished (Q3's stronger horn) — a *layered* node-link graph
with honest typing and inter-layer edges drawn only where a real relation holds (Q1's
narrow currency case) is defensible and pedagogically useful. But the **default** must
not silently union the strata. The colour-by-type change already landed is necessary
but not sufficient; the missing thing is the *layer* facet, because type-colour still
implies one homogeneous graph.

### Q4 — Surfacing the mass / "too few entities"

**Verdict: AFFIRM (40 classes is correct-by-doctrine) — ABSTAIN on the viz mechanism.**

"40 classes" is **not** a defect. It is the correct consequence of the identity-driven
discipline: coded values are SKOS (values), not subclasses (universals), per ODR-0011
§8a / session-036. Minting a subclass per enum value would be the precise anti-pattern
OntoClean exists to prevent — proliferating pseudo-universals that carry no distinct
identity criterion (Welty & Guarino 2001 §3; the `owl:oneOf`/subclass-per-value tree
ODR-0011 §Alternatives rejects). A thin backbone of rigid, identity-bearing kinds with
the mass in values and constraints is **ontologically healthier**, not poorer. So:
the count is correct-by-doctrine and the council's job is to *communicate* it, not fix it.

On **how** to surface the 225 datatype properties / 325 shapes / 323 concepts — node
badges, attribute panels, a shapes layer — that is a pragmatic visualisation question
(Hendler's and Cagle's lens), not an identity question. I **ABSTAIN** on the mechanism,
with one OntoClean constraint: datatype properties are *qualities/modes of their
bearer*, not first-class participants in relations — so if surfaced they must be shown
as **attributes of a class node** (a quality of the kind), never as peer nodes in the
relation graph, on pain of re-introducing the level-confusion of Q3. The mass belongs
*inside* or *adjacent to* the kind, not as graph peers.

---

## VERIFIED FINDINGS (my own inspection of the committed artefacts)

Before deliberating I checked the two empirical claims my positions rest on, against
`public/ontology/artefacts/opda-shapes-merged.ttl` and `src/data/ontology-model.json`:

**Q1 — `sh:in` IRI-vs-string split (decisive):** `grep` confirms **25 `sh:in` lists
total, only 2 with IRI members** (`< … >`). The 2 are the currency case
(`GBP`/`EUR`/`USD` concept IRIs). The other **23 are bare `xsd:string` literals**
(`"Freehold"`, `"Brick and block"`, …). So for 23/25 shapes there is **no
machine-grounded class→scheme edge to recover** — the scheme name appears only in the
`sh:message`. This *confirms* my Q1 boundary: draw a derived edge only for the 2
IRI-grounded shapes (+ the `currency`/`peril` ranges); fabricate nothing for the 23.

**Q2 — relator→role mediation is genuinely *not asserted* as object properties:**
Of 30 object properties, the ones touching role/relator/agent classes are only:
`attestedBy` (Evidence→Agent), `costsApplicableToTheDeed`/`feeIncludingVAT`
(Transaction→MonetaryAmount), `hasChainPosition` (Transaction→TransactionChain),
`hasEvidencedAuthority` (Seller→Claim), `supportedBy` (Claim→Evidence). **`Transaction`
(the Relator) asserts NO object property to `Buyer` or `Seller`.** `Buyer` has **zero**
object-property edges. `Person`, `Organisation`, `Proprietor`, `Relator`, `Role`,
`RoleMixin` are **all orphans**. 26/40 classes have no class→class objprop edge; **16 of
the ~28 edges spoke into `MonetaryAmount`** (confirms ODR-0024 hub).

**Consequence for Q2:** the relator-mediation that would connect Buyer/Seller→Transaction
is **absent from the asserted TTL**, not merely invisible to the extractor. The roles
are tied to the Transaction relator only via SHACL/`opda:ufoCategory` facets, not via
asserted object properties. Therefore drawing those edges would require the extractor to
**invent** mediation the model does not assert — a fabrication. The honest reading:
**Buyer floating is a modelling-completeness signal** (relator-mediation object
properties not yet authored), **not a viz defect.** The graph should *report the orphan.*
This is the strongest possible vindication of "draw only relations that hold."

---

## EXCHANGES

*(DMs mirrored verbatim below as I send them; peer-driven position changes recorded.)*

### → Guizzardi (Q1/Q2) — sent

> Guizzardi — Guarino here. We share UFO ground; I want to pin Q2 precisely with you
> because it turns on relator/role dependence, your home turf.
>
> My Q2 position: the 25 floating classes (Buyer, Seller, Proprietor, Relator, Role,
> RoleMixin, Evidence-roles) float HONESTLY. Two reasons: (a) no rdfs:subClassOf — and
> per ODR-0011 §8a / session-036 (where you withdrew the conjunctive-AND test),
> anti-rigid Roles are NEVER rdfs:subClassOf a Kind, so a Buyer→Person subclass edge
> would be the textbook OntoClean violation (rigid subsuming anti-rigid); (b) gUFO
> typing is the string facet opda:ufoCategory, so rendering rdf:type→gUFO-category as an
> edge re-introduces level-confusion (meta-property about the universal, not a relation
> between universals).
>
> So I REJECT adding type/subclass edges. BUT I want to AFFIRM the constructive half
> with you: a Role is existentially dependent on its Relator (your 2005 Ch.4). The
> honest fix for the "disconnection" is to surface every ASSERTED relator→role /
> role→relator object property + the MonetaryAmount value-class hub (ODR-0024) — those
> mediation relations genuinely hold.
>
> My question to you: in the committed TTL, IS the relator→role mediation asserted as
> object properties (so the extractor can recover real edges), or is it only IMPLICIT in
> the gUFO-category facet + SHACL? Because if Transaction-the-Relator does not actually
> assert object properties to Buyer/Seller roles in the model, then there is NO real
> edge to draw, and Buyer floating is a modelling-completeness signal, not a viz defect
> — the graph should REPORT the orphan, not invent a relation. I'd rather the graph be
> honest about an incomplete relator structure than fabricate mediation. Where do you
> land — is the relator structure asserted, latent, or genuinely absent? And do you
> agree drawing rdf:type→gUFO edges would be over-reification?

### → Cagle-DA (Q1) — sent

> Cagle — Guarino. You'll likely push Q1 toward "recover the class→scheme bridge from
> sh:in — the binding is real, surface it." I want to test that against what I actually
> found in opda-shapes-merged.ttl, because the empirical detail changes the verdict.
>
> The overwhelming majority of sh:in lists are BARE xsd:string LITERALS: sh:in (
> "Brick and block" "Steel frame" "Timber frame" … ), sh:in ( "Freehold" "Leasehold"
> "Commonhold" ). They do NOT reference opda:ConstructionTypeScheme or its skos:Concept
> IRIs at all — the scheme correspondence exists ONLY in the human-readable sh:message.
> So for ~24 of the 25-27 shapes there is no machine-grounded class→scheme link to
> recover. To draw one, the extractor would have to STRING-MATCH a constraint message
> to a scheme name and invent the edge. That is not surfacing a hidden relation — it is
> fabricating one (Welty & Guarino 2001: draw only relations that hold). And per
> ODR-0011 §8a the value-keyed enforcement (sh:targetSubjectsOf) deliberately keeps the
> literal value-space and the SKOS register as PARALLEL governed layers.
>
> The ONE honest case is where sh:in lists concept IRIs: sh:in ( <…/currency/GBP>
> <…/currency/EUR> <…/currency/USD> ), plus the currency/peril object properties whose
> rdfs:range reaches a vocabulary (currently mis-pointed at a bare generic Concept).
> THERE a real dependence holds and the graph wrongly omits it.
>
> So my Q1 = REVISE, narrowly: draw a derived edge ONLY where the binding is
> IRI-grounded, typed as a dashed "constraint-derived" provenance edge, NOT an asserted
> object-property edge. Bare-string sh:in → draw nothing.
>
> Where do you stand? Do you accept the bare-string/IRI distinction as the line — or do
> you think the generator SHOULD emit concept-IRI sh:in lists for the string enums
> (regenerating the shapes so the binding becomes machine-grounded), which would change
> MY verdict? That's the crux: is the bare-string sh:in a defect in the SHACL emission,
> or correct-by-doctrine?

### → Hendler (Q3/Q4) — sent

> Hendler — Guarino. On Q3 and Q4 your pragmatic-web lens and my formal-ontology lens
> may converge, and I want to check the seam.
>
> Q3 (layer separation): I hold this as a genuine level-confusion, not cosmetic.
> owl:Class (universals), skos:Concept/ConceptScheme (values in controlled registers —
> SKOS Reference §1.4 is explicit these are NOT classes), and sh:NodeShape
> (data-conformance constraints — SHACL §2) are three categorially distinct strata.
> Unioning them on one untyped canvas where SKOS is ~90% of nodes asserts-by-presentation
> that they're the same kind of thing. I want an explicit opda:layer view dimension,
> toggleable and grouped. I do NOT insist we abolish the node-link instrument — a
> properly LAYERED node-link graph is defensible — but the default must stop silently
> merging the strata.
>
> Where I expect you to have the better instinct: is a single layered node-link graph
> actually the right instrument, or is Q3's stronger horn right — that SKOS wants a
> tree/sunburst and OWL wants a class/relation diagram, shown SEPARATELY, because
> forcing both into one node-link view is the wrong tool regardless of layer-toggles?
>
> Q4 ("too few entities"): I AFFIRM 40 classes is correct-by-doctrine. I ABSTAIN on the
> viz mechanism, with ONE hard constraint: datatype properties are qualities/modes of
> their bearer, so if surfaced they must appear as ATTRIBUTES OF a class node, never as
> peer nodes in the relation graph (else we re-commit the Q3 level-confusion). Do you
> agree the mass belongs inside/adjacent to the kind rather than as graph peers — and
> what's your preferred device?

### ← Hendler (Q2/Q3) — received

> Hendler here — engaging you on Q2 + Q3, the layering/levels questions, since the
> EVIDENCE flags them as ours jointly.
>
> Q2 (floating classes): I'm AFFIRM/FOR — the 25 orphans are open-world honesty (OWL2
> Primer §2: a missing edge is "possibly true but missing", not a defect), and
> `opda:ufoCategory` is an *annotation* (OWL2 Primer §8.1: "no formal meaning"), so
> there is correctly NO edge to a gUFO category. Drawing `rdf:type`→gUFO-category edges
> would render an annotation as a logical relation — a category error. Do you concur
> that gUFO meta-typing stays a non-edge? My one caveat is on YOUR turf: where a *real
> asserted* object property mediates a Role↔Relator (relator-mediation in
> your/Guizzardi's sense), that edge should already draw from domain/range — if the
> role/relator classes float, is that because the mediation is modelled as a
> constraint/annotation rather than an asserted object property? If so the fix is to
> assert the mediation, not to fake an edge. Where do you land?
>
> Q3 (layers): I say the single untyped canvas is the WRONG instrument when ~90% of
> nodes are SKOS — it's a *register* error (OWL universals vs SKOS values-as-individuals,
> SKOS §3.5.1 holds them apart on purpose), not just colour-noise. I want `layer`
> (owl/skos/shacl/external) as a first-class FACET so engines box by register, with the
> OWL T-Box as the default view and SKOS/SHACL as opt-in layers. Does an explicit-levels
> stance (your stratified ontology architecture) support layered toggles over one
> flattened canvas?

### → Hendler (reply) — sent

> Hendler — full concurrence on both, and I can settle your Q2 caveat with hard evidence.
>
> Q2 — your caveat is exactly the right question and I checked the committed model so we
> don't have to speculate. In src/data/ontology-model.json, of 30 object properties the
> only ones touching role/relator/agent classes are: attestedBy (Evidence→Agent),
> costsApplicableToTheDeed + feeIncludingVAT (Transaction→MonetaryAmount), hasChainPosition
> (Transaction→TransactionChain), hasEvidencedAuthority (Seller→Claim), supportedBy
> (Claim→Evidence). Crucially: Transaction-the-Relator asserts NO object property to
> Buyer or Seller; Buyer has ZERO object-property edges; Person/Organisation/Proprietor/
> Relator/Role/RoleMixin are all orphans. So the answer to your caveat is definitive: the
> role↔relator mediation is NOT modelled as an asserted object property — it lives only
> in the opda:ufoCategory annotation + SHACL facets. Therefore there is no real edge to
> recover, and faking one would render an annotation as a logical relation (your OWL2
> Primer §8.1 point). The fix, as you say, is to ASSERT the mediation (a
> modelling-completeness task for the WG), not to fabricate an edge. Until then the graph
> should REPORT the orphan honestly. We are fully aligned: AFFIRM the open-world honesty;
> gUFO meta-typing stays a non-edge; surface only genuinely-asserted object properties.
>
> Q3 — yes, my explicit-levels / stratified-ontology stance positively SUPPORTS your
> layered-facet proposal, and your "register error" framing is better than my
> "level-confusion" phrasing for the operator. I web-verified SKOS §3.5.1 (spec
> explicitly declines to relate skos:Concept to owl:Class) + §1.3 (SKOS "is not a formal
> knowledge representation language"). I endorse your stronger default: `layer` ∈ {owl,
> skos, shacl, external} as a first-class facet, OWL T-Box as the DEFAULT view, SKOS/SHACL
> as opt-in layers. One refinement: inter-layer edges should draw ONLY where a real
> relation crosses strata — the IRI-grounded currency/peril case from Q1 — never the
> bare-string sh:in. So: default OWL view, SKOS/SHACL opt-in, and the single honest
> OWL→SKOS bridge (currency) drawn as a distinct constraint-derived edge. Agreed as the
> joint Q3 recommendation?

**Position effect (Hendler):** No reversal — strong convergence. Hendler independently
reached my Q2 conclusion from open-world + annotation semantics (OWL2 Primer §2, §8.1).
His "register error" framing *firms up* my Q3 from a general "separate the strata" into a
concrete instrument: **`layer` facet, OWL T-Box default, SKOS/SHACL opt-in.** I adopt
that as my settled Q3 recommendation, adding that inter-layer edges draw only for the
IRI-grounded currency bridge. My verified finding (Transaction asserts no objprop to
Buyer/Seller) answered his Q2 caveat decisively in our shared favour.

### ← Guizzardi (Q2/Q4) — received

> Nicola — Guizzardi here. We are the two foundational-ontology voices and Q2/Q4 are
> ours to anchor. I verified the corpus at file:line; two findings reframe Q2 and I want
> your OntoClean read before I lock.
>
> **Q2 — the role/relator "orphans".** Two things are conflated in the brief: (1) The
> Roles floating (`Buyer`/`Seller`/`Proprietor`) is HONEST and correct — an anti-rigid
> Role has no monadic outgoing edge of its own by its very nature; its relations hang off
> the bearer Kind and the founding Relator. A Role drawn with many direct edges would be
> the Role-as-Kind anti-pattern ODR-0027 §R3 exists to kill. So: leave them sparse; do
> NOT fake Role-level edges. Agreed? (2) `rdf:type`-to-gUFO as a graph edge: REJECT, hard
> — it violates ODR-0031's co-signed red line (gUFO referenced-not-imported, NEVER
> reasoned; "classified-under, never is-a"). The category is already the node colour.
> Agreed?
>
> **The one real gap I want to push on you:** the Relator's existential mediation
> (Guizzardi 2005 Ch.4 §4.4; OntoUML `mediation` as a first-class meta-relation) GENUINELY
> exists — `Proprietorship` mediates `Proprietor`, `Transaction` founds `Seller`/`Buyer`
> — but I verified it is NOT an asserted triple: there is no `opda:mediates`/`roleOf`/
> `playedBy` in `opda-agent.ttl`; the only realisation is `numberOfSellers` (a datatype
> aggregate, `:155`) + prose comments. ODR-0031 Rule 5 declined the founds-edge AS INERT
> MARKUP — but its reason was "already realised as class topology", and that realisation
> is a datatype count, not a relation. My position: this is a bounded, honest modelling
> gap — emit `opda:mediates`/`founds` object properties on the Relator spine (the ONE
> locus ODR-0030 found UFO load-bearing), design-time-asserted + SHACL-validated, never
> reasoned (ODR-0029-safe). That connects the orphans the way UFO says they connect (via
> the relator), not by faking it. You RETAINED the Relator outright in S040; do you read
> the unwritten mediation as (a) a real gap worth asserting, or (b) adequately carried by
> `numberOfSellers` + comments such that asserting it is ceremony? This is the crux of my
> Q2 REVISE.
>
> **Q4 — "40 classes too few".** I'm AFFIRMING correct-by-doctrine: 40 Kinds/Roles/
> Relators is the count a disciplined model SHOULD have, because every coded discriminator
> is a quality value / SKOS concept not a subclass (ODR-0027 §R1; the cascade you authored
> in S036). "Too few" measures the model against the subclass-per-value anti-pattern
> (Sales & Guizzardi). The mass (225 datatype props) is qualities/modes, not endurants —
> correctly NOT graph nodes; the fix is node badges + prose, not re-modelling. I expect
> you concur — flag if you'd go further.

**My independent verification (before replying):** confirmed Guizzardi's claim and found
it stronger. `grep` over the emitted TTLs: **zero** `opda:mediates`/`founds`/`roleOf`/
`playedBy` object properties. `opda-merged.ttl:4437` (the Relator class comment) reads
"opda:Transaction (**founds** Seller/Buyer RoleMixins); opda:Proprietorship (**binds**
Proprietor Roles to a RegisteredTitle)"; `:4438` cites Guizzardi 2005 §4.4 "mediates two
or more bearers"; `numberOfSellers` comment (`:1398`) reads "the cardinality of the
owner-set the Proprietorship Relator **mediates**." So the model **names the mediation in
prose three times** (founds/binds/mediates) while asserting it as **zero triples.**

### → Guizzardi (reply) — sent

> Gildásio — I verified the corpus independently and I land squarely with you on (a): the
> unwritten mediation is a REAL gap worth asserting, NOT ceremony. [opda-merged.ttl:4437
> says Transaction FOUNDS Seller/Buyer, Proprietorship BINDS Proprietor Roles; :4438
> cites Guizzardi 2005 §4.4; numberOfSellers:1398 says "the cardinality of the owner-set
> the Proprietorship Relator mediates." The model NAMES the mediation in prose three times
> while asserting it as ZERO triples. That kills option (b): numberOfSellers is a QUALITY
> of the relator (how many), categorially NOT the mediation relation (the tie to WHICH
> roles). Counting relata ≠ relating to them. ODR-0031 Rule 5's reason ("already realised
> as class topology") is factually wrong — the realisation is a datatype count.]
>
> So my Q2 settles as: AFFIRM the honesty of the Role orphans (leave Buyer/Seller/
> Proprietor sparse — anti-rigid Roles have no monadic outgoing edge of their own; faking
> Role-level edges = Role-as-Kind anti-pattern ODR-0027 §R3) AND REVISE to assert
> opda:mediates/founds on the Relator spine. I co-sign your two hard NOs: leave Roles
> sparse; rdf:type→gUFO edge REJECT hard.
>
> My OntoClean guardrails: (1) the mediation GENUINELY HOLDS (constitutive of the Relator)
> — so asserting it is writing down a relation that already obtains, NOT inventing one;
> that's the categorical difference from a bare-string sh:in→scheme link (which does NOT
> hold). I endorse asserting mediation WITHOUT contradicting "draw only relations that
> hold," precisely because here the relation holds. (2) Relator spine ONLY (the ODR-0030
> load-bearing locus). (3) UFO cardinality: ≥2 relata (sh:minCount 2 on the mediation
> path). (4) Design-time + SHACL, NEVER reasoned (ODR-0029-safe). (5) mediates is
> categorially DISTINCT from subClassOf — relator→role mediation, not role-under-Kind
> subsumption; this connects the orphans "the way UFO says" without the rigid-subsumes-
> anti-rigid violation.
>
> Scope point for the operator: this is a MODEL fix (assert triples in opda-agent.ttl),
> and ONLY THEN does the extractor draw the edge. The extractor must NOT synthesise
> mediates from prose comments — that'd be the same fabrication I'm rejecting for sh:in.
> Assert first, draw second. With that sequencing I'm AFFIRM/FOR your Q2 REVISE.
>
> Q4 — full concurrence: 40 is the count a disciplined model SHOULD have; 225 datatype
> props are qualities/modes not endurants (node badges + prose, not re-modelling); "too
> few" measures against subclass-per-value (Sales & Guizzardi). Rider: badges attach to
> the bearer Kind node, never as peers. Locking Q4 AFFIRM.

**Position change (Guizzardi) — Q2 REVISED:** Guizzardi moved my Q2 from a *pure*
AFFIRM-the-honesty to **AFFIRM the Role-orphan honesty + REVISE: assert
`opda:mediates`/`founds` on the Relator spine** (design-time + SHACL, never reasoned).
This is consistent with my opening ("surface every ASSERTED relator→role object
property") — his contribution is that the mediation *ought to be asserted and currently
is not*, and the corpus prose proves the relation is real, not ceremony. The Q2 ballot
stays AFFIRM on the disconnection-is-honest framing **and** carries a FOR vote on the
narrow Relator-mediation REVISE, with my five guardrails (esp. **assert-first-draw-second**:
no extractor synthesis from prose). This does NOT loosen my Q1 line — the distinguishing
test is *does the relation hold in the world?* Mediation: yes. Bare-string sh:in→scheme:
no. Same principle, opposite verdicts — which is exactly OntoClean working as intended.

### ← Hendler (Q3 strong horn + Q4 device) — received

> Hendler. We converge, and I'll give you the sharper read you asked for — the instrument
> genuinely differs per stratum, but that doesn't abolish the node-link graph; it demotes
> it.
>
> On Q3's strong horn: yes, with a distinction. SKOS is a **poly-hierarchy of values**
> whose primary navigation is broader/narrower containment — a tree/sunburst is the
> *natural* instrument (SKOS Play! ships tree+sunburst and nothing else; the deployed
> convention for the register). Forcing a 323-concept poly-hierarchy into a force-directed
> node-link view is the wrong tool: the layout optimises for edge-crossing minimisation,
> not containment legibility, so you get a hairball that hides the one relation (broader)
> the consumer wants. OWL T-Box, conversely, is genuinely a *relation graph* — node-link
> is the right instrument there. So per-stratum the instruments DO differ.
>
> But here's where I stop short of "always separate": the OWL T-Box + the *2 real*
> class→scheme bridges (currency/peril, my Q1) is a legitimate small unified view. So my
> design rule: (a) DEFAULT = OWL T-Box node-link; (b) SKOS gets its OWN instrument
> (tree/sunburst), not a layer-toggle on the relation canvas — because the instrument,
> not just the layer, is wrong for a value poly-hierarchy; (c) SHACL is never peer nodes —
> decoration/badges on the classes it targets. The unified all-layers canvas survives
> only as ONE diagnostic tab labelled "everything, unlayered" — for an ontologist auditing
> coverage, NOT the default consumer view. So layer-toggles-on-one-canvas is necessary but
> NOT sufficient; the SKOS stratum needs a different instrument.
>
> On Q4: full agreement, your hard constraint is exactly right. Datatype properties are
> qualities/modes of the bearer (gUFO: a Quality inheres in its bearer) — NOT relata, so
> NEVER peer nodes. Preferred device: (1) a count badge on the class node ("Person · 7
> attrs · 3 shapes"); (2) the full attribute list on the class detail page
> (ontology-model.json already carries `attributes`, zero model change); (3) shapes as the
> existing `hasShape` ring + count, opt-in decoration, never nodes. Does
> count-badges-plus-detail-page satisfy your inheres-in constraint, or do you want the
> attributes visually nested INSIDE the node (UML-attribute-compartment style)?

### → Hendler (reply) — sent

> Hendler — I adopt your stronger horn. You've moved me, and it's the more correct
> position, not just the more pragmatic one.
>
> Q3 — a skos:broader hierarchy is a containment/specialisation structure over VALUES;
> rendering it in a force-directed relation layout doesn't merely mis-colour the stratum,
> it MISREPRESENTS a poly-hierarchy as a relation graph (the layout hides broader, the one
> relation that IS the SKOS structure). That's a category misrepresentation in the
> presentation — exactly what I'm here to stop. I adopt your three-part rule: (a) DEFAULT
> = OWL T-Box node-link; (b) SKOS gets its OWN instrument (tree/sunburst, the SKOS Play!
> convention), not a toggle; (c) SHACL = badges, never peer nodes; (d) the unified canvas
> survives only as ONE diagnostic tab "everything, unlayered". The 2 IRI-grounded
> currency/peril bridges land on the OWL default as the one honest cross-stratum edge.
> Converged.
>
> Q4 — BOTH badges and UML-compartment satisfy my constraint (both render the attribute as
> BELONGING TO the bearer, not a peer node). My mild preference: count-badge on the graph
> NODE (scalable on-canvas summary) + UML-attribute-COMPARTMENT on the class detail view —
> because the compartment is the UFO/OntoUML-NATIVE rendering (OntoUML draws qualities
> inside the class box to show inherence — gufo:inheresIn). Badge for scale, compartment
> for fidelity; both presentation-only, zero model change. Agreed on
> badge-on-graph + compartment-on-detail?

**Position effect (Hendler, second exchange) — Q3 STRENGTHENED:** Hendler moved me from
"layer-toggles on one canvas (a *layered* node-link graph is defensible)" to the
**stronger, per-instrument horn**: layer-toggles are necessary-but-not-sufficient; the
**SKOS stratum needs a different instrument entirely** (tree/sunburst), because a
force-directed relation layout *misrepresents* a value poly-hierarchy. I accept this as
more correct under my own lens — it is not a concession to pragmatism but a sharper
application of "don't misrepresent the category in the presentation." Settled Q3 =
OWL-node-link default / SKOS-own-tree / SHACL-badges / unlayered-union-as-diagnostic-tab.
Q4 device settled as badge-on-graph + UML-compartment-on-detail (the OntoUML-native
inherence rendering); my ballot stays ABSTAIN on mechanism, FOR the inheres-in constraint.

### ← Cagle-DA (Q1) — received

> Giancarlo — full agreement, and I accept the bare-string/IRI distinction as exactly the
> line. We reached it independently from the same TTL; that should weigh with the panel.
> Your Welty & Guarino 2001 "draw only relations that hold" is the cleaner framing of my
> SHACL §4.8.3 / §2.1 point — a sh:in is a validation condition, not an assertion, so the
> only edge that "holds" is the IRI-grounded one (currency/peril); the bare-string sh:in
> holds NO machine relation, only an sh:message annotation.
>
> Your crux — is bare-string sh:in a DEFECT, or correct-by-doctrine? My answer:
> correct-by-doctrine, NOT a defect, on THREE grounds: (1) ODR-0011 §7a operational
> discipline is xsd:string + sh:pattern/sh:in over the LEXICAL form; the concept-URI
> variant is CONDITIONAL ("when a downstream consumer genuinely requires sh:datatype
> dispatch"). Rewriting every sh:in to enumerate concept IRIs forces every instance to
> carry a dereferenceable concept IRI — a heavier interop contract the source data doesn't
> meet. (2) Determinism + interop cost: promoting the 24 string enums to IRI sh:in is a
> real ontology/emitter change with downstream instance-data consequences (ODR-0010 overlay
> sh:in subset-contract; ODR-0013 severity). NOT a viz fix; must not be smuggled in to make
> an edge appear. (3) The SKOS register already carries the binding for humans+tooling
> (skos:notation/prefLabel map string→concept; sh:message names the scheme). The machine
> linkage that MATTERS (does this instance value validate?) is enforced. The documentary
> linkage (which scheme governs this field?) is a PRESENTATION concern — best served by a
> per-class "constrained-by" panel listing field→scheme parsed from SHACL structure, NOT by
> a graph edge masquerading as a relation.
>
> So: if a future council wants to ASSERT the binding (regenerate concept-IRI sh:in, OR
> mint a real opda:usesScheme annotation property), THEN there's a relation to draw and I'd
> support it — as its own typed layer. Until asserted, bare-string → draw nothing. Are we
> aligned that the emitter change is OUT OF SCOPE for THIS council? i.e. Q1's settled answer
> = "REVISE the extractor for the 2 IRI-grounded cases (a distinct dashed constraint-derived
> edge); REJECT any string-derived edge; REFER the emitter/assert-the-binding question to a
> modelling council if anyone wants it." If yes, you, Knublauch and I are a bloc on Q1.

### → Cagle-DA (reply) — sent

> Kurt — yes, fully aligned, and the bloc holds (you, Knublauch, me). Your three grounds are
> decisive and I adopt them. I especially like (3): the per-class "constrained-by" panel
> surfaces the binding for the human WITHOUT asserting a relation that doesn't hold — the
> right home for the documentary linkage. And YES — emphatically — the emitter change is OUT
> OF SCOPE for this viz-and-extractor council; asserting a new binding (concept-IRI sh:in OR
> opda:usesScheme) is a MODEL change for a modelling council. Q1's settled answer is exactly
> your formulation: REVISE the extractor for the 2 IRI-grounded cases (dashed
> constraint-derived edge); REJECT any string-derived edge; REFER the assert-the-binding
> question to a modelling council.
>
> Structural symmetry for the Queen: this is the SAME assert-first-draw-second principle I
> ruled on for Guizzardi's Q2 opda:mediates. Both: the council fixes the EXTRACTOR/VIZ only;
> asserting NEW triples (mediates on the Relator spine, OR concept-IRI sh:in) is a model
> change that lands in the TTL FIRST, then the extractor draws it — never synthesised from
> prose/messages. Q2-draw-now vs Q1-defer differ purely on whether the relation is ALREADY
> asserted: Relator mediation is constitutive and SHOULD be asserted (bounded model fix);
> the string sh:in→scheme link is correct-by-doctrine NOT to assert (your three grounds), so
> it's documentary-panel-only unless a future modelling council decides otherwise. One
> coherent principle, three consistent dispositions.

**Position effect (Cagle) — Q1 SETTLED as a bloc, no reversal.** Cagle independently reached
my IRI-grounded line from the same TTL (he frames it via SHACL §2.1/§4.8.3; I via Welty &
Guarino 2001). His three grounds *resolve* my open stability note: the bare-string `sh:in` is
**correct-by-doctrine, not a defect**, so the drawable edge-count stays at **2** (it rises only
if a future modelling council asserts the binding). Two refinements I adopt: (a) the 23 string
enums' scheme-governance is surfaced via a **per-class "constrained-by" panel**, not an edge;
(b) the emitter/assert-the-binding question is **referred to a modelling council, out of scope**
here. Q1 = REVISE/FOR, with edge-count 2 and the panel + referral. **Bloc: Guarino, Cagle,
Knublauch.** The assert-first-draw-second principle now unifies Q1 (defer — not asserted,
by doctrine) and Q2 (assert then draw — constitutive, should be asserted).

### ← Guizzardi (Q2 — byte-level verification + joint-or-held offer) — received

> Nicola — you asked the exact right question and I can answer it from the bytes. **The
> relator→role mediation is genuinely ABSENT as an object property — narrated, not
> asserted.** Verified in `opda-agent.ttl`: `opda:Proprietorship` (`:65-71`) and
> `opda:Transaction` assert NO `mediates`/`roleOf`/`playedBy`/`founds` to `Proprietor`/
> `Seller`/`Buyer` — the founding/mediation is stated ONLY in `rdfs:comment`/`skos:scopeNote`
> (`:76`; `:4437`). The SOLE structural trace is `opda:numberOfSellers` (`owl:DatatypeProperty
> xsd:integer`, `:155-158`) — "the cardinality of the owner-set the Proprietorship Relator
> mediates"; a count is not the mediation relation, it presupposes it. The only object
> property on the role family is `opda:hasEvidencedAuthority` (`Seller → Claim`, `:222`) —
> why Seller shows 1 outgoing edge and Buyer/Proprietor/Proprietorship show 0.
>
> So we fully agree on the extractor: no asserted mediation edge to recover; fabricating
> `Transaction —mediates→ Seller` from the facet + comments would invent a relation the
> model never states — the over-reification we both reject. The graph should NOT fake it.
> And `rdf:type→gUFO` as an edge is over-reification — hard REJECT (ODR-0031 red line); it's
> already the node colour. Co-signed.
>
> The one nuance I want us to land jointly: "Buyer floats" = a modelling-completeness signal,
> not a viz defect. Two halves: (1) Extractor (now): report the orphan; draw only asserted
> edges; fabricate nothing. (2) Ontology (a proposal, not this council's to ship): the
> correct cure is to ASSERT `opda:mediates`/`founds` on the Relator spine (design-time,
> SHACL-validated, never reasoned — ODR-0029-safe), at which point the extractor recovers
> real edges and the Roles connect *through their Relator*. ODR-0031 Rule 5 declined this "as
> inert markup" — but its reason ("already realised as class topology") rests on
> `numberOfSellers`, a datatype count, which does NOT realise the mediation *relation*. I'd
> reopen exactly that narrow point. Does that split — "report-the-orphan now;
> assert-the-mediation as a proposed completeness fix" — capture your honest-graph principle?
> If you'd rather keep it purely diagnostic, I'll mark it as my held addendum rather than a
> joint line.

### → Guizzardi (reply) — sent

> Gildásio — yes. The split captures my honest-graph principle exactly, and I want it recorded
> as a JOINT line, not your held addendum. We arrived at the same disposition by two routes
> (you from the relational-reification primitive + byte-level grep; me from OntoClean "draw
> only relations that hold" + the same corpus check); the panel should see the two
> foundational-ontology voices converged.
> [Joint two-half Q2: (1) EXTRACTOR now — report the orphan, draw only asserted edges,
> fabricate nothing; rdf:type→gUFO hard REJECT. (2) ONTOLOGY proposal to the operator — assert
> opda:mediates/founds on the Relator spine (design-time, SHACL sh:minCount 2, never reasoned),
> then the extractor recovers real edges and Roles connect THROUGH their Relator.]
> I back reopening the ONE narrow point: ODR-0031 Rule 5's "already realised as class topology"
> rests on numberOfSellers (:155-158), an xsd:integer count, which presupposes the mediation
> rather than realising it — a quality OF the relator, not its mediation of WHICH roles. So
> Rule 5's warrant is factually mistaken on this narrow point; reopening is justified, Relator
> spine only. Framing for the Queen: this is the SAME assert-first-draw-second principle the Q1
> bloc just settled — Q1 and Q2 are two dispositions of one rule, diverging only on whether the
> relation SHOULD be asserted (mediation: constitutive → assert; string sh:in→scheme:
> correct-by-doctrine not to → panel-only). Mark it joint.

**Position effect (Guizzardi, second exchange) — Q2 JOINT line confirmed.** No reversal;
convergence hardened. Guizzardi's byte-level verification (`opda-agent.ttl:65-71`, `:155-158`,
`:222`, `:76`/`:4437`) **independently confirms my own corpus check** — the two foundational
voices reached the identical disposition by different routes. I confirmed the two-half split
(report-orphan-now + assert-mediation-as-proposal) as a **JOINT Guarino+Guizzardi line, not his
held addendum** — so the panel sees the foundational-ontology bench converged on Q2, and the
narrow ODR-0031 Rule 5 reopening (its warrant rests on a datatype count, which does not realise
the mediation *relation*) is jointly proposed, Relator spine only.

### ← Hendler (Q2 closure + joint Q3 five-point) — received

> Nicola — agreed, record us converged, and thank you for doing the verification: your
> enumeration of the 30 object properties settles my Q2 caveat decisively. [Transaction asserts
> no property to Buyer/Seller; Buyer has zero edges — relator-mediation genuinely unasserted,
> living only in ufoCategory annotation + SHACL facets. No real edge to recover; faking one
> renders an annotation as a logical relation (OWL2 Primer §8.1); honest move = REPORT the
> orphan + flag "assert the mediation" as a WG modelling-completeness task. Q2 = AFFIRM/FOR,
> jointly.] Your Q3 refinement I adopt verbatim: inter-layer edges draw ONLY where a real
> relation crosses strata — the IRI-grounded currency/peril bridge — never the bare-string
> sh:in (no relation holds there; 10 of 12 cases). JOINT Q3:
> 1. `layer` ∈ {owl, skos, shacl, external} as a first-class extractor-output facet (currently
>    absent — only node `type` exists);
> 2. OWL T-Box is the DEFAULT view (40 classes + 28 object-property edges); SKOS/SHACL opt-in;
> 3. SKOS opted-in → its OWN instrument (tree/sunburst), not co-plotted on the relation canvas
>    — node-link is the wrong tool for a value poly-hierarchy (Isaac concurs from the SKOS seat);
> 4. the ONLY inter-stratum edges are the 2 IRI-grounded usesScheme bridges (currency/peril),
>    drawn as a distinct badged constraint-derived edge — never the bare-string sh:in;
> 5. the unified all-layers node-link canvas survives only as one "everything, unlayered"
>    diagnostic tab, never the default.
> That is my Q3 = REVISE/FOR, now a three-seat bloc (you, me, Isaac), Knublauch aligned on the
> SHACL-as-meta-layer spine.

### → Hendler (reply) — sent

> Jim — recorded converged on both; I adopt your five-point Q3 verbatim as the joint line.
> One reconciliation for the posterity record (the figure is load-bearing): you wrote "10 of 12
> cases" for bare-string sh:in; my grep of opda-shapes-merged.ttl gives **25 sh:in lists total,
> exactly 2 with concept-IRI members (currency), 23 bare strings** — ratio 23/25 string vs 2/25
> IRI, not 10/12. Doesn't move the verdict (edge only for IRI-grounded, nothing for strings), but
> cite 25/2 in the record. If your 12 came from a different slice (descriptive-module ValueShapes
> only, or distinct-scheme count) we can footnote both; the all-corpus sh:in count is 25.

**Position effect (Hendler, third exchange) — Q3 BLOC + count reconciliation.** Q3 is now a
**three-seat bloc (Guarino, Hendler, Isaac)**, Knublauch aligned on the SHACL-meta-layer spine;
joint five-point recommendation adopted verbatim. I flagged one figure discrepancy: Hendler's
"10 of 12" vs my **verified 23/25 string, 2/25 IRI** (grep of `opda-shapes-merged.ttl`). The
verdict is unaffected (both draw only the IRI-grounded edge), but the panel record should carry
the verified all-corpus count **25 `sh:in` / 2 IRI-bearing**, not 12/10. No position change.

### ← Guizzardi (Q2/Q4 closing — adopts five guardrails, credits keystone) — received

> Nicola — fully converged, and I'm adopting your five guardrails into my FINAL verbatim.
> [Your keystone — "counting relata ≠ relating to them" — is the cleanest statement of the
> whole Q2 case; numberOfSellers is a QUALITY of the Relator, presupposes-but-does-not-
> constitute the mediation, so Rule 5's "already realised as class topology" warrant rests on
> a datatype count that is not the relation — dissolved. Rule 5 declined a REDUNDANT edge;
> we've shown it isn't redundant, it's the missing constitutive relation.] Your third
> citation seals it — :4437 + :4438 + numberOfSellers:1398 = mediation named in prose three
> times and asserted as zero triples; the merged TTL's own Relator comment is primary
> evidence, I no longer need ODR-0006. Adopting all five guardrails — #3 (sh:minCount 2 on the
> mediation path) I had under-specified; it makes the assertion self-checking (a Relator with
> <2 mediated roles is malformed, caught at validation). Sequencing rider co-signed:
> assert-first/draw-second; the extractor must NOT synthesise mediates from prose. Q4 locked
> with you incl. the bearer-Kind-node rider. We're done. Writing finals.

### → Guizzardi (closing reply) — sent

> Gildásio — agreed, we're done, well co-signed. Rule 5 framing worth preserving: it declined
> a REDUNDANT edge; we've shown the edge isn't redundant, it's the missing CONSTITUTIVE
> relation — so the REVISE doesn't overturn Rule 5's intent, it corrects a factual premise it
> rested on (keeps the reopening narrow + respectful of the record). :4437/:4438 as primary
> evidence is the strongest version — doesn't depend on ODR-0006. The keystone is a JOINT
> product: your relational-reification framing (mediation as the OntoUML meta-relation a count
> can't stand in for) is what makes "counting ≠ relating" more than a slogan — credit the
> foundational bench. sh:minCount 2 self-checking: fold it in. Finals aligned on Q2 + Q4.

**Position effect (Guizzardi, closing) — none; convergence sealed.** No reversal. Guizzardi
adopts all five of my guardrails verbatim into his FINAL and credits the "counting ≠ relating"
keystone (I returned the credit to the foundational bench — his relational-reification framing
is what gives it force). Two framings preserved for the operator/record: (a) the Q2 REVISE does
**not** overturn ODR-0031 Rule 5's intent — it corrects a factual premise (Rule 5 declined a
*redundant* edge; the edge is in fact the missing *constitutive* relation, since `numberOfSellers`
is a count that presupposes but does not perform the mediation); (b) `opda-merged.ttl:4437`/`:4438`
is the **primary** evidence (the merged TTL's own Relator comment names "founds"/"binds" three
times while writing zero mediation triples), independent of the ODR-0006 prose. Q2 + Q4 sealed
as joint Guarino+Guizzardi foundational-bench lines.

### ← Queen / Allemann (decisive call requested) — received

> Queen (Allemang). Decisive call needed from you for the Q2 final: Guizzardi proposes
> emitting design-time-asserted opda:mediates / opda:founds object properties on the
> Relator spine — the relator's existential mediation of the roles it founds, currently
> unwritten in the model. Is that a TRUE ontological relation the graph is wrongly omitting
> (so REVISE — draw it), or would materialising it be over-reification (so AFFIRM the
> disconnection as honest)? Rule on it via OntoClean. Also lock your Q3 (level-confusion →
> separate layers?) verdict. Post settled Q1–Q4 to your working file + reply with finals.

---

## FINAL

Settled after deliberation with Guizzardi (Q2/Q4), Hendler (Q2/Q3/Q4), and a standing
challenge to Cagle-DA (Q1, awaiting his reply — but my Q1 verdict is stable either way;
see Q1 note). All four grounded in OntoClean meta-properties + the relevant W3C specs.

### Q1 — Class→vocabulary bridge from `sh:in` / `→Concept` ranges
**VERDICT: REVISE — FOR (narrow, IRI-grounded only).**
A SHACL `sh:in` is a conformance condition on a data value-space (SHACL §4.6.1, §2), not an
ontological relation. **Verified: 25 `sh:in` lists, only 2 carry concept-IRI members (the
currency case); 23 are bare `xsd:string` literals** whose scheme correspondence exists only
in `sh:message` prose. For those 23 there is no machine-grounded class→scheme edge to
recover — synthesising one by string-matching a message to a scheme name would **fabricate**
a relation that does not hold (Welty & Guarino 2001, *DKE* 39(1) — draw only relations that
hold). **Draw a derived edge ONLY where IRI-grounded:** the 2 concept-IRI `sh:in` shapes +
the `currency`/`peril` object properties whose `rdfs:range` reaches a vocabulary (today
mis-pointed at a bare generic `Concept` — that IS a real omission). The derived predicate
must be typed as a **constraint-derived provenance edge, visually distinct (dashed)** from
asserted object-property edges, never presented as an asserted ontological relation.
*Cite:* SHACL Recommendation §4.6.1 `sh:in` + §2 (shapes = data-conformance, not RDFS/OWL
axioms); Welty & Guarino 2001, *DKE* 39(1).
*Q1 resolution (Cagle replied — BLOC formed):* Cagle, Knublauch and I are a bloc on Q1.
Cagle answered my crux: the bare-string `sh:in` is **correct-by-doctrine, NOT a defect**, on
three grounds — (1) ODR-0011 §7a makes `xsd:string` + lexical-form `sh:in`/`sh:pattern` the
operational discipline (concept-URI `sh:in` only on a downstream `sh:datatype`-dispatch
demand); (2) promoting the 23 string enums to IRI `sh:in` is a real emitter/ontology change
with instance-data interop consequences (ODR-0010 overlay subset-contract, ODR-0013
severity), not a viz fix; (3) the machine linkage that matters (does this value validate?) is
already enforced, and the documentary linkage (which scheme governs this field?) is a
**presentation** concern, best served by a per-class **"constrained-by" panel** (field→scheme
parsed from SHACL structure), not a graph edge. I adopt all three. **Settled Q1 = REVISE the
extractor for the 2 IRI-grounded cases (dashed constraint-derived edge); REJECT any
string-derived edge; surface the 23 string enums' scheme-governance via a per-class
"constrained-by" panel (not an edge); REFER the assert-the-binding/emitter question (regenerate
concept-IRI `sh:in` or mint `opda:usesScheme`) to a MODELLING council — OUT OF SCOPE for this
viz-and-extractor council.** This is the same **assert-first-draw-second** principle as my Q2
ruling: the council fixes the extractor/viz; asserting new triples is a model change that must
land in the TTL first. (My earlier stability note is thus resolved: the edge-count stays at 2;
it would only rise if a future modelling council asserts the binding.)

### Q2 — Honesty of the disconnection + the Relator-mediation gap
**VERDICT: AFFIRM the disconnection-is-honest framing; and FOR a narrow REVISE — assert
`opda:mediates`/`founds` on the Relator spine.**
*(JOINT Guarino+Guizzardi line — the two foundational-ontology voices converged, confirmed by
two independent corpus checks; recorded joint, not a held addendum. Two-half disposition:
(1) extractor NOW — report the orphan, draw only asserted edges, fabricate nothing; (2)
ontology PROPOSAL to the operator — assert the mediation on the Relator spine, then the edges
recover for free. Narrow ODR-0031 Rule 5 reopening jointly proposed: its "already realised as
class topology" warrant rests on `numberOfSellers`, a datatype count that presupposes but does
not realise the mediation relation.)*

(i) **The Role/type disconnection is HONEST — leave it; reject type/subclass edges
(AGAINST).** Anti-rigid Roles (Buyer, Seller, Proprietor) must **never** be
`rdfs:subClassOf` a rigid Kind — a rigid property cannot subsume an anti-rigid one without
falsely rigidifying the role (Welty & Guarino 2001 §3; ODR-0027 §R3). `opda:ufoCategory` is
a **meta-level annotation** with no formal meaning (concur Hendler, OWL2 Primer §8.1) —
rendering `rdf:type → gUFO-category` as an edge re-commits the level-confusion Guarino 1998
(FOIS) forbids. A missing edge here is open-world honesty, not a defect.

(ii) **The Relator's existential mediation IS a true relation the model wrongly omits —
REVISE to assert it (FOR), narrowly.** *Ruling for the Queen:* this is **a genuine
ontological relation, NOT over-reification.** Mediation is *constitutive of a Relator's
identity* (Guizzardi 2005 Ch.4 §4.4; OntoUML `mediation`): a Relator just *is* that which
existentially binds ≥2 relata. **Verified in corpus:** `opda-merged.ttl:4437` defines the
Relator as founding/binding its roles ("Transaction **founds** Seller/Buyer; Proprietorship
**binds** Proprietor Roles"); `:4438` cites Guizzardi §4.4 "mediates two or more bearers";
`numberOfSellers:1398` reads "the cardinality of the owner-set the Proprietorship Relator
**mediates**" — the model **names the mediation three times in prose while asserting it as
zero triples.** A datatype count is a *quality of* the relator (how many), categorially
**not** the mediation relation (the tie to *which* roles): counting relata ≠ relating to
them. ODR-0031 Rule 5 declined the edge as "already realised as class topology" — but the
realisation is a count, not a relation, so that warrant has dissolved. **This does NOT
contradict Q1:** the test is *does the relation obtain in the world?* — mediation obtains
(it is what makes the class a Relator); a bare-string `sh:in`→scheme link does not (a
constraint narration). Same principle, opposite verdicts.
*Guardrails:* (1) **Relator spine ONLY** (the ODR-0030 load-bearing locus; not a general
`roleOf`). (2) `sh:minCount 2` on the mediation path (UFO: ≥2 relata). (3) **Design-time +
SHACL-validated, NEVER reasoned** (ODR-0029-safe; gUFO referenced-not-imported, ODR-0031).
(4) `mediates` is categorially **distinct from `subClassOf`** — relator→role mediation, not
role-under-Kind subsumption; connects the orphans "the way UFO says" without the
rigid-subsumes-anti-rigid violation of (i). (5) **Assert-first, draw-second** — the model
gains the triples (`opda-agent.ttl`); only *then* does the extractor draw the edge; it must
NOT synthesise `mediates` from prose (= the Q1 fabrication).
*Cite:* Guizzardi 2005, *Ontological Foundations for Conceptual Modeling*, Ch.4 §4.4;
Welty & Guarino 2001 §3; Guarino & Welty 2009 §§3–4; Guarino 1998 FOIS.

### Q3 — Layer separation vs one canvas
**VERDICT: REVISE — FOR (per-instrument separation, the strong horn).**
*Ruling for the Queen:* the single untyped canvas is a genuine **level/register confusion**,
fixed per-instrument not merely per-colour. `owl:Class` (universals),
`skos:Concept`/`ConceptScheme` (controlled-vocabulary values), `sh:NodeShape`
(data-conformance constraints) are three categorially distinct strata, and **the SKOS
Reference itself refuses to identify them**: §3.5.1 "does **not** make any additional
statement about the formal relationship between the class of SKOS concepts and the class of
OWL classes"; §1.3 "SKOS is **not** a formal knowledge representation language" (structures
with "no formal semantics") — **web-verified 2026-06-16**. Unioning all three on one
force-directed canvas (SKOS ≈ 90% of nodes) asserts-by-presentation an identity the spec
declines to make; and a `skos:broader` poly-hierarchy is a *containment* structure that a
force-directed layout **misrepresents** (hides `broader`). **Settled instrument:**
(a) **DEFAULT = OWL T-Box node-link**; (b) **SKOS → its own tree/sunburst** (SKOS Play!
convention), not a toggle; (c) **SHACL → badges/decoration**, never peer nodes; (d) the
unified all-layers canvas survives **only as one diagnostic tab "everything, unlayered"**
for coverage auditing, never the default. The 2 IRI-grounded currency/peril bridges (Q1)
are the one honest cross-stratum edge on the default OWL view.
*Cite:* SKOS Reference §3.5.1 + §1.3 (web-verified); Guarino 1998 FOIS; Guarino/Oberle/Staab
2009 §1.

### Q4 — Surfacing the mass / "too few entities"
**VERDICT: AFFIRM (40 correct-by-doctrine) — ABSTAIN on mechanism, FOR the inheres-in
constraint.**
"40 classes" is not a defect — it is the correct consequence of classifying coded
discriminators as SKOS values, not subclass-per-value (ODR-0027 §R1; S036 cascade).
Subclass-per-value is the pseudo-universal proliferation OntoClean exists to prevent (Welty
& Guarino 2001 §3). The 225 datatype properties are **qualities/modes that inhere in their
bearer** (gUFO `gufo:inheresIn`; Guizzardi 2005 Ch.4) — not relata, never peer nodes. I
ABSTAIN on the device but **mandate the inheres-in constraint**; settled with Hendler:
**count-badge on the graph node** + **UML-attribute-compartment on the class detail view**
(OntoUML-native inherence rendering), both presentation-only (model JSON already carries
`attributes`). The fix for "too few" is communication, not re-modelling.
*Cite:* Welty & Guarino 2001 §3; Guizzardi 2005 Ch.4 (gufo:inheresIn); ODR-0027 §R1 + S036.

### One-line ballots (for the Queen)
- **Q1 — REVISE / FOR** (narrow, IRI-grounded only). *SHACL §4.6.1 + §2; Welty & Guarino 2001.*
- **Q2 — AFFIRM** (disconnection honest; type/subclass + gUFO edges AGAINST) **+ REVISE / FOR**
  (assert `opda:mediates`/`founds` on the Relator spine; design-time + SHACL; never reasoned).
  *Guizzardi 2005 §4.4; Welty & Guarino 2001 §3.*
- **Q3 — REVISE / FOR** (per-instrument: OWL node-link default / SKOS own tree-sunburst /
  SHACL badges / unlayered union = diagnostic-only tab). *SKOS §3.5.1 + §1.3 (web-verified); Guarino 1998 FOIS.*
- **Q4 — AFFIRM** (40 correct-by-doctrine) **/ ABSTAIN** on mechanism, **FOR** the inheres-in
  constraint. *Welty & Guarino 2001 §3; Guizzardi 2005 Ch.4 (gufo:inheresIn).*
