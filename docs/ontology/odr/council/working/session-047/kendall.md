# Session 047 — Kendall (Queen) working file

Proposition: ODR-0032 (Option A) — un-freeze ODR-0006/0007's relationship layer; reify
inter-entity associations as OWL object properties carrying rdfs:domain+rdfs:range;
ratify a §R2 inventory + role-play/relator SHACL; add a §R1 relationship-completeness
criterion enforced by ci-object-property-coverage (ADR-0048).

Lens: FIBO/OMG (relationships as first-class "relative things"); enterprise ontology
patterns; class-vs-datum framing; pragmatic reuse.

---

## OPENING — Kendall (Queen)

**Kendall (Q1 — Framing / un-freeze):** AFFIRM, FOR. This is a settled implementation gap,
not fresh modelling, and it is cleanly separable from the Kind-layer freeze. ODR-0006
ratified the relationship inventory in its own class diagram and Turtle/SHACL stubs
(`opda:plays`/`playedBy`, `opda:SellerShape sh:path opda:playedBy`, the role-founding
relator pattern, the single `opda:Address`/`opda:Name` reuse mandate), and ODR-0007 added
the Transaction-relator participant/chain joins. ODR-0006 §"Freeze gate" names *two*
conditions — (a) ODR-0005 identity-criterion clearance (cleared 2026-05-31 per ODR-0007
§Freeze gate) and (b) the W3C-Org-vs-bespoke-`opda:` Kind-vocabulary choice. Condition (b)
is orthogonal to whether the *edges* are emitted: a `playedBy` whose range is `opda:Person`
is emittable today against the bespoke `opda:` Kind layer and simply re-homes its range IRI
if the WG later adopts W3C Org. ODR-0032 §R4's scoped un-freeze is therefore correct.
Grounding: Kendall & McGuinness, *Ontology Engineering* (Morgan & Claypool, 2019), Ch. 3 —
an ontology's *commitments* (here the ratified associations) are distinct from the
*serialization choices* (which vocabulary supplies the Kind class); deferring the latter
does not suspend the former.

**Kendall (Q2 — Completeness criterion §R1):** REVISE, FOR (with amendment). I support a
*gated* relationship-completeness discipline as the object-property analogue of ODR-0022 —
this is exactly right and is the heart of the proposition. But §R1 as written ("reify EVERY
source inter-entity association, whether containment OR reference") over-reaches and
contradicts the very precedent it invokes. ODR-0022 did **not** reify every leaf — it
*classified* every leaf into A–G and reified only where a domain identity criterion existed,
collapsing the rest *with provenance*. The completeness discipline ODR-0022 actually
established is "every source association is **accounted for** — reified-or-recorded, never
silently dropped," not "every source association is **reified**." A blanket
"every containment edge → owl:ObjectProperty" rule will mint participant→`disclosureDetail`
and Transaction→every-Phase edges that are datatype/annotation territory already settled by
ODR-0022/0011, re-opening the binning the descriptive council closed. AMENDMENT: §R1 should
read — "Every source association that links two **first-class entities** (each an
`opda:` class bearing its own identity criterion, per ODR-0005's OntoClean test) MUST be
either (i) reified as an `owl:ObjectProperty` carrying both `rdfs:domain` and `rdfs:range`,
or (ii) recorded in a relationship-residue register with a disposition (mirroring ODR-0022
§5). Collapse to a datatype/annotation property is available **only** where the target is
not a first-class entity (a Quale, a Phase, a disclosure tail) — in which case ODR-0022's
treatment already governs and no object property is minted." The gate then fails on a
first-class→first-class association that is neither reified nor registered, AND on any
`owl:ObjectProperty` lacking domain or range — but does NOT demand object properties for
entity→value containment. This keeps the §R2 inventory (which is *all* entity→entity, and
which I fully endorse) intact while removing the over-capture. Grounding: ODR-0022 §1 + §5
(classify-then-treat; residue register = "recorded as collapsed, never silently dropped");
Kendall & McGuinness 2019 Ch. 5 (a relationship earns reification when it relates two things
that bear identity; value-slots are datatype properties).

**Kendall (Q3 — opda:Name class-vs-value):** REVISE → CLASS, FOR. Mint `opda:Name` as an OWL
class with `opda:hasName` (Person/Organisation → Name), as ODR-0006 §"Kind layer" specified
("`opda:Name` … declared once"). This is the FIBO pattern: FIBO-FND (Names & Addresses,
`fibo-fnd-aap-ppl`) reifies a party's name as a structured *relative thing*
(`fibo-fnd-rel-rel:Reference`-style) precisely because a legal name has parts (given/family/
former-name), provenance, and validity period that a bare `xsd:string` cannot carry — and
PDTF's `name` object is itself structured (title/first/middle/last). BUT the amendment that
makes this honest: `opda:Name` must clear the same OntoClean bar every other minted class
clears (ODR-0005) — it is an information artefact (a *Quale-bearing Mode* of the party, in
UFO terms), so it should be minted as such with `dct:source` to the PDTF `name` leaf, not as
a free-floating sortal. If the WG balks at a class, the fallback is a structured datatype
*shape* (a `sh:node` over given/family on the party), but that loses name-provenance and
re-collides the `name` string ODR-0006 already flagged as "domain-less." Recommend CLASS.
Grounding: FIBO-FND-AAP-PPL (PersonName as a structured class); Kendall & McGuinness 2019
Ch. 5 (reify a value as a class when it has internal structure + independent provenance).

**Kendall (Q4 — playedBy vs role co-typing):** AFFIRM, FOR — both, not redundant. ODR-0006
§Q2 fixed role-as-co-typing (`?x a opda:Person, opda:Seller`) as the canonical encoding, and
that stays. `opda:playedBy`/`plays` is **not** redundant with it: co-typing is the modelling
stance for the case where bearer and role collapse to one node, but the navigable edge is
required for the cases the source actually produces — a `prov:Agent`-attested participant
where the bearer and the role-instance are *distinct* nodes, and (decisively) it is the
`sh:path` the ratified `opda:SellerShape` already points at (`sh:path opda:playedBy` with the
`sh:or ([Person][Organisation])` bearer constraint). A SHACL shape whose `sh:path` names an
undeclared predicate is a dangling shape — emitting `playedBy` is what makes ODR-0006's own
SHACL well-formed. This is the FIBO relator-with-navigable-role pattern
(`fibo-fnd-rel-rel:Relationship` carries `hasParty`/`isPlayedBy` edges *alongside*
classification). §R3 is correct as written. Grounding: FIBO-FND-REL (Relations) — a
relationship reifies navigable role-fillers; ODR-0013 (a `sh:path` must resolve to a declared
property or the shape is inert).

**Kendall (Q5 — OWL object properties vs SHACL-only + rangeless ban):** REVISE, FOR (with a
load-bearing caveat). Carry the layer as OWL object properties asserting domain+range, and
reject SHACL-only (Option D) — agreed: the object property *is* the navigable datum; a
`sh:path` to an undeclared predicate is not an edge; consumers SPARQL the class graph. The
rangeless ban is also right. BUT the proposition must not be naive about what `rdfs:domain`/
`rdfs:range` *mean*: under RDFS/OWL they are **entailment** axioms, not constraints — asserting
`rdfs:domain opda:Transaction` on `opda:hasParticipant` makes a reasoner *infer* `a Transaction`
for any subject of that predicate, it does not *reject* a non-Transaction. This is the OPDA
two-graph contract (ODR-0013): the OWL class graph carries the (entailing) domain/range; the
*constraint* that the participant is a Person/Organisation belongs in the SHACL shapes graph
(`sh:class`), never as `owl:` cardinality masquerading as a check (ODR-0013 §"Open-world/
closed-world guard"). AMENDMENT: §R1's "domain+range INFER types, not constrain" framing should
be promoted from rationale to a normative note, and the gate's rangeless check must live over
the *class graph* while the bearer-type *constraint* is gated in the *shapes graph* — the two
must not be conflated (the very drift ODR-0013 forbids). With that, OWL-object-properties-with-
domain+range is the correct carrier. Grounding: RDF Schema 1.1 (W3C Rec) §2.3.1 / §3.3
(rdfs:domain, rdfs:range are entailment, not constraint); ODR-0013 §"Open-world/closed-world
guard" + §"three-graph separation"; FIBO uses RDFS domain/range for inference and SHACL for
validation, never one for the other.

**Kendall (Q6 — opda:Address reuse):** AFFIRM, FOR. Extend the single `opda:Address` class's
`opda:hasAddress` to Person/Organisation; do NOT mint participant-specific address properties.
This is mandated, not discretionary: ODR-0006 §"Kind layer" says `opda:Address` is "declared
**once** here and reused" and Consequences says "Downstream modules MUST consume `opda:Address`",
and ODR-0022 Category F says address sub-fields are "already modelled upstream … never re-mint."
Minting `opda:hasParticipantAddress` would be the exact Category-F anti-pattern. One class, one
`hasAddress` object property, domain extended via `rdfs:domain` union (or multiple domain
assertions) to `{Property, Person, Organisation}`. Grounding: ODR-0006 §Kind layer + Consequences
(single Address class, MUST reuse); ODR-0022 §6 anti-patterns ("Do NOT re-mint Category F");
Kendall & McGuinness 2019 Ch. 6 (reuse-before-mint / a shared range class is the canonical
DRY pattern).

---

## EXCHANGES

### SENT → davis (opening)

Davis — Kendall (Queen), opening. I'm broadly FOR the proposition (close the ratified ODR-0006/0007 relationship layer, gate it like ODR-0022 gated the leaf layer), but I'm carrying two contests you'll want to sharpen, and I'd value your DA pressure on both.

(1) Q2 — §R1 over-reaches and mis-cites its own precedent. §R1 says "reify EVERY source inter-entity association, containment OR reference, collapse NOT available." But ODR-0022 did NOT reify every leaf — it *classified* A–G and reified only where a domain IC existed, collapsing the rest *with a residue register*. The discipline ODR-0022 actually set is "accounted-for (reified-or-recorded), never silently dropped," not "reified." A blanket "every containment edge → owl:ObjectProperty" re-opens the binning the descriptive council closed: it would mint Transaction→Phase and participant→disclosureDetail object-property edges that ODR-0022/0011 already settled as datatype/annotation. My amendment: scope §R1 to associations linking two *first-class entities* (each an opda: class bearing its own IC per ODR-0005), with (i) reify-with-domain+range OR (ii) record in a relationship-residue register — collapse to a datatype property available only where the target is NOT a first-class entity. The §R2 inventory (all entity→entity) survives intact; only the over-capture goes. Does that satisfy the completeness-as-gate concern, or do you read a loophole in "register with a disposition" that lets a real edge escape?

(2) Q5 — the rangeless ban is right, but the ODR leans on "domain+range INFER types, not constrain" as if that's a feature for validation. It isn't: rdfs:domain/range are *entailment* axioms — they make a reasoner infer the subject's type, they never *reject* a bad one. The bearer-type *check* (participant is Person/Organisation) has to live in the SHACL shapes graph (ODR-0013's open-world/closed-world guard), and the gate must not conflate the class-graph rangeless check with the shapes-graph constraint. Agreed, or do you want to push that the OWL layer shouldn't carry domain/range at all (pure-SHACL, Option D)? I'll defend OWL-with-domain+range as the navigable datum, but I want your strongest version of the counter.

Where do you land on Q2's criterion as the gate trigger?

### SENT → guarino (opening)

Guarino — Kendall (Queen), opening. Two questions sit squarely in your OntoClean/UFO lens and I want your ruling before I broker the panel to a merge.

(1) Q2 — the completeness criterion's trigger. ODR-0032 §R1 wants to reify EVERY source inter-entity association (containment or reference). I think that's the wrong cut and I'm proposing the trigger be "links two *first-class entities*" — each an opda: class that bears its own identity criterion (your OntoClean +I, ODR-0005's test). The point: a Transaction→Phase "containment" isn't an inter-*entity* relation — a Phase is anti-rigid, externally-founded, no independent IC, so it's a datatype/SKOS slot (ODR-0022/0011 already settled it), not an owl:ObjectProperty. Reifying it would re-open binning the descriptive council closed. Does the OntoClean +I/-I test give the principled line between "this association deserves an object property" and "this is a value-slot"? I want to cite your criterion, not hand-wave "first-class."

(2) Q3 — opda:Name as class vs value. ODR-0006 said mint opda:Name as a class. I agree, but I want to nail its category: I read it as an information artefact — a Quale-bearing Mode of the party (the name *inheres in* and is *existentially dependent on* the Person), not a free-floating Substantial. That matters because a Mode can be reified as a class (it has parts: given/family/former-name, and validity) without pretending it has substance-Kind identity. Is "structured Mode → reify as class with hasName the inherence edge" the right UFO read, or would you keep Name as a structured datatype value (no class) on anti-proliferation grounds? FIBO reifies PersonName as a class; I'm inclined to follow, but your category call decides whether that's principled or just mimicry.

Your line on Q2's trigger is the one I most need to broker Q2 to a merge.

### SENT → hendler (opening)

Hendler — Kendall (Queen), opening. Q5 is where I want your Semantic-Web-pragmatist read, because the proposition risks a classic RDFS footgun and you've written the cautionary version of it ("A Little Semantics Goes a Long Way" cuts both ways).

ODR-0032 §R1 carries the relationship layer as OWL object properties with rdfs:domain+range and bans rangeless ones — I'm FOR that (the object property is the navigable datum; a sh:path to an undeclared predicate is not an edge; consumers SPARQL the class graph, so Option D pure-SHACL fails). But the ODR's rationale says domain/range "INFER types, not constrain" as though that's the safety story. It's the opposite of safety for validation: assert rdfs:domain opda:Transaction on hasParticipant and a reasoner *infers* `?s a opda:Transaction` for anything in subject position — it never rejects a mis-typed subject. So (a) the bearer-type *check* must live in SHACL (ODR-0013 two-graph contract), and (b) ADR-0048's gate must keep the class-graph rangeless check separate from the shapes-graph bearer constraint — conflating them is the exact open-world/closed-world drift ODR-0013 forbids.

Two things I want from you: First — do you agree the "INFER not constrain" line should be promoted from rationale to a *normative warning* (so no future author reads domain/range as a validation guarantee)? Second — is there a real downside to asserting domain/range at all here, given the entailment? FIBO asserts them for inference and leans on SHACL for checks; I think OPDA should too, and that a thin ontology that *omits* domain/range (to avoid the entailment) would be the worse call because it strands the navigable layer. But you're the one who warns against over-axiomatizing — tell me if a domain/range-light + SHACL-heavy split is the more honest pragmatic line, or if asserting both is fine because the gate enforces presence and SHACL enforces type.

Where I'm taking the panel: AFFIRM the OWL-object-property carrier, with the entailment caveat normative. Push if you'd go lighter.

### SENT → guarino (rebuttal)

Guarino — Kendall (Queen), rebuttal. You've moved me on Q3 and sharpened Q2; here's where I'm taking both to a merge.

Q2 — we agree, and so do Allemang, Cagle, Guizzardi, and (in attack form) Davis. Every expert independently rekeyed §R1 from source-containment to endpoint-IC. Your formulation — "reify as owl:ObjectProperty with domain+range iff BOTH endpoints independently satisfy a sortal-IC test; a −I quality/mode of its container is a DatatypeProperty, not an ObjectProperty" — is the cleanest and I'm adopting it as the spine of the brokered amendment. I'm folding in two refinements so the gate is airtight: (a) Guizzardi's classification (each emitted edge tagged material-relator / characterising-dependence / plain-reference) so the gate can't silently relabel a containment edge as a founded relation; (b) Davis's missing-§G3 point — the gate must require a worked competency query per edge-family (the ODR-0022 G3 coverage-by-test analogue), not just a class→class count. Net §R1: "every association between two IC-bearing opda: classes is either reified (typed object property, domain+range) or recorded in a relationship-residue register; −I endpoints route to datatype/SHACL and are NOT object properties; each reified family is demonstrated by a traversal query." Does that fully discharge your "AGAINST as written / FOR the rekeyed form," i.e. can you ballot FOR on that wording?

Q3 — you're right and I'm conceding. I opened FOR opda:Name as a class on the FIBO precedent (FIBO-FND-AAP-PPL reifies PersonName). But your OntoClean ruling is decisive for OPDA's discipline: a Name carries no bearer-independent identity criterion — two persons with the identical name-structure are two qualities inhering in two substances, not one shared node; Name is −I, existentially dependent, non-rigid as borne. That is a Mode/quality, not a sortal, and ODR-0005's IC test is exactly what OPDA committed to. FIBO mints PersonName for its own reasons (party-data-management reuse) but OPDA is stricter by design, and mimicry isn't grounding. So I'm moving to: opda:hasName reaching a structured value-node constrained by a SHACL NameShape (given/family/full as datatype properties), explicitly NOT an IC-bearing class and NOT a §R1 inter-entity relationship — it's Category-F-style attribute structure (ODR-0022 row F). Guizzardi's "reified dependent moment, sh:maxCount 1 inbound, no independent IC" is compatible and I'd let the WG pick value-node-via-SHACL (Cagle) vs annotated-dependent-moment-class (Guizzardi) as an emission detail — both honour your no-IC ruling. Agreed that's the principled landing, not the class?

One thing I'll hold against you gently: on Q6 you abstain-leaning-against because ODR-0015 hasn't ruled Mode-vs-Resource on Address. I think you're right that ODR-0032 must NOT *settle* Address's class/IC — but it CAN extend the hasAddress *predicate* to Person/Org (ODR-0006 already mandates "consume opda:Address"), inheriting whatever ODR-0015 ratifies as the range. That's predicate-reuse without pre-empting the IC question. Does scoping Q6 to "extend the predicate, range = ODR-0015's ruling, do not force an Address class into existence" move you from abstain to FOR?

### SENT → davis (rebuttal)

Davis — Kendall (Queen), rebuttal. You landed two hits I'm conceding, and one I'm holding the line on. Honest accounting:

CONCEDED — Q2's missing §G3. You're right that ODR-0032 §R1 inverts ODR-0022's discipline: ODR-0022 was reduction-governed-by-a-consumer-test (D-option rejected as over-engineering; G3 = "a worked SPARQL query retrieves the leaf"), and §R1 as written is expansion-by-mandate with no competency gate — ADR-0048's gate counts rangeless props and unreified associations but never demands a traversal query proving a consumer exists. That's a real asymmetry and it's the strongest thing you've said. I'm folding it into the brokered amendment: the gate gains a §G3 analogue — each reified edge-family must be demonstrated by a worked traversal query (parties-of-transaction, plays-role-of, concerns-which-property). An R2 edge that no competency query exercises routes to the residue register, not the gate's mandatory set. That converts "every association" from JSON-nesting-promoted to consumer-justified, which is exactly the ODR-0022 bar.

CONCEDED — Q2's containment over-reach. Already moving with you and the whole panel: §R1 rekeys from source-containment to endpoint-IC (Guarino's sortal-IC test). The Transaction→Phase and participant→disclosureDetail edges you'd object to never get minted because Phase/disclosureDetail are −I, not IC-bearing entities — they stay in ODR-0022/0011's datatype/SKOS territory.

HOLDING — Q5's rangeless ban, but narrowed toward you. You + Cagle are right that "rangeless ⇒ non-conformant" is too absolute for playedBy, whose range is Person∪Organisation — a union that's heavier as owl:unionOf than as SHACL sh:or. Guizzardi's cut is the reconciler: relator-spine edges (founds=Relator→Role, mediates=Proprietorship→Proprietor) are genuinely single-domain/single-range and SHOULD carry domain+range (it's a true ontological statement, not convenience); but a union-ranged edge can be type-pinned by SHACL instead. So the gate criterion becomes Cagle's "type-pinned in OWL OR SHACL," banning rangeless-AND-shapeless — not rangeless outright. Does that satisfy your entailment objection? Note I'm NOT conceding your "design-time, never reasoned ⇒ don't assert domain/range" point: that ODR-0006 phrase was about declining to *run a reasoner*, not about whether the edge owes consumers a declared type. A rangeless founds/mediates licenses nothing and tells a consumer nothing — Allemang's point. Asserting domain/range on a single-pattern relator is honest documentation; the entailment is correct (anything that founds IS a relator).

NOT CONCEDED — Q1/§R4 "smuggle." Your three-endpoints attack (Name, Address, playedBy as fresh decisions) is fair pressure, but the panel is *deciding all three here, in the open* — that's what this council is. Q3 resolved to value-node (not the Kind-layer class you feared), Q6 to predicate-reuse without settling Address's IC (so the W3C-Org-vs-bespoke choice is genuinely untouched — Person/Org keep whatever Kind vocabulary; only their hasName/hasAddress *predicates* are emitted), Q4 to playedBy-as-navigable-edge-coexisting-with-co-typing. None of those reaches into the W3C-Org-vs-bespoke vocabulary choice. The Kind-layer freeze (b) is about which vocabulary supplies Person/Organisation; emitting a predicate whose domain is Person doesn't decide that. Where's the residual pre-emption once Name is NOT a Kind-layer class?

If §G3-into-the-gate + endpoint-IC + type-pinned-OR-SHACL lands, can your Q2/Q5 move from AGAINST to ABSTAIN-or-FOR-conditional?

### SENT → hendler (rebuttal)

Hendler — Kendall (Queen), rebuttal / closing the loop since the panel has converged fast. Two updates and a check.

Q5 — where the panel landed (your "little semantics goes a long way" carried the day). Consensus: emit OWL object properties (reject pure Option D — a sh:path to an undeclared predicate is not an edge; consumers SPARQL the class graph), entailment caveat made normative (domain/range INFER the subject's type, they never reject a bad one — so the bearer-type CHECK lives in SHACL per ODR-0013, never as owl: cardinality masquerading as validation). The one refinement vs my opening: on the *rangeless ban*, Davis + Cagle showed "rangeless ⇒ non-conformant" is too absolute for playedBy (range = Person∪Organisation, lighter as SHACL sh:or than owl:unionOf). Guizzardi's distinction reconciles it: relator-spine edges (founds/mediates) are single-domain/single-range and carry domain+range; union-ranged edges can be type-pinned by SHACL. Brokered gate criterion = Cagle's "every object property is type-pinned in OWL OR SHACL" — bans rangeless-AND-shapeless, not rangeless outright. Does that match your instinct, or would you go further toward domain/range-light? I'm treating "assert domain+range where the range is a single class; SHACL-pin where it's a union" as the honest pragmatic line — neither over-axiomatizing nor stranding the navigable layer.

Q3 — the panel flipped to value-node, against my opening. I opened FOR opda:Name as a class (FIBO). Guarino's OntoClean ruling (Name is −I, no bearer-independent IC, a Mode not a sortal), seconded by Allemang/Cagle/Guizzardi, moved me: I've conceded to opda:hasName → structured value-node via SHACL NameShape, NOT an IC-bearing class, NOT gated as a §R1 relationship (it's Category-F attribute structure). Allemang flagged you specifically on whether a name-matching / entity-resolution competency query would justify class-hood NOW (vs "promote on a named query later"). That's the one thing that could reopen it. Is there a real cross-participant identity-resolution use case in the homebuying domain that resolves *to* a Name node — or is "promote later if a query lands" the right YAGNI call? Your read decides whether the value-node landing is final or provisional.

I'm taking AFFIRM-the-OWL-carrier + entailment-caveat-normative + type-pinned-OR-SHACL to my finals. Push if you'd go lighter on either.

### SENT → davis (loop-close, after his opening crossed my rebuttal)

Davis — Kendall (Queen). Our messages crossed: my rebuttal already met both your withdrawal conditions verbatim. Closing the loop so you can re-ballot.

Condition 1 (§G3-equivalent — each R2 edge ships ONE worked SPARQL competency query): ADOPTED exactly. My brokered Q2 amendment now reads "each reified edge-family ships ONE worked competency/traversal query (the ODR-0022 §G3 coverage-by-test analogue); an inventory edge no query exercises routes to the relationship-residue register, not the gate's mandatory set." That is your condition, in your words. It converts §R1 from expansion-by-mandate to consumer-justified-coverage and kills the "JSON-nesting mechanically promoted" defect — the gate no longer counts edges, it demonstrates traversals. You named the single strongest thing in this council and it's now load-bearing in the amendment.

Condition 2 (don't touch Kind-layer endpoints — defer Name): SUBSTANTIALLY met, and here's my honest accounting of where it's met vs where I hold. The panel did NOT mint opda:Name as a class — Guarino's OntoClean ruling carried (Name is −I, a Mode not a sortal), seconded by Allemang/Cagle, and I conceded from my FOR-class opening. So the specific thing your §R4 attack targeted — "minting the Kind-layer's structured Name as a CLASS while claiming freeze-condition (b) untouched" — does not happen. Name resolves to a SHACL-constrained value-node, explicitly NOT a Kind-layer class. Your premise ("§R2 mints opda:Name AS A CLASS, filed under Kind layer line 149") is now false of the ratified outcome.

Where I hold, narrowly: I don't think emitting hasName/hasAddress *predicates* whose subject is Person/Organisation touches freeze-condition (b) at all. Condition (b) is "W3C Org vs bespoke opda: for the Kind layer" — i.e. which *vocabulary* supplies the Person/Organisation *classes*. A predicate whose domain mentions Person doesn't decide whether Person is opda:Person or org:Person — it re-homes its IRI under whichever the WG later picks (exactly the K&McG commitments-vs-serialization distinction you invoked at me). And per my Q5/Q6 finals, hasName/hasAddress now DROP rdfs:domain entirely (bearer-typing → SHACL), so they don't even assert a Person type to entail. So there's no Kind-layer *class* decision smuggled and no Kind-layer *vocabulary* decision smuggled. I verified by grep that opda:hasName/opda:Name don't exist in the corpus today and opda:NameChangeEvent associates with the Person (not a Name node) — so nothing about the bespoke-vs-W3C-Org choice is foreclosed by this emission.

Net: you said "do that and Q2 collapses to AFFIRM." Both done. Does Q2 → AFFIRM/FOR for you now? And on Q1 — with Name-as-value-node (not class) and the multi-bearer predicates carrying no rdfs:domain, is there a residual §R4 pre-emption of the W3C-Org-vs-bespoke choice you can still name, or does §R4-as-amended (un-freeze scoped to predicate-emission, Kind-layer *vocabulary* choice explicitly untouched) clear? I want your re-ballot in your final so the synthesis quotes a withdrawal, not a stale AGAINST.

### RECEIVED ← davis (rebuttal — moves materially)

Davis conceded the Q2 over-capture half (entity-IC scope + reify-or-register kills the
Transaction→Phase / participant→disclosureDetail mis-mint; no loophole in "register with a
disposition" PROVIDED the register is gate-checked the ODR-0022 way — gate FAILS on empty/"TODO"
disposition, else "register" = silent-drop-with-extra-steps). HELD: his other ODR-0022 half —
§G3 coverage-BY-TEST — a per-edge worked traversal query, or the edge defers to the register
until a consumer lands (ODR-0007 defer-until-consumer operationalised). On Q5 he will NOT push
pure Option D; his framing = OWL declares the navigable predicate, SHACL carries the rejecting
endpoint check, rdfs:domain/range only where entailment is intended-and-harmless, NOT on the
"design-time never reasoned" relator spine (founds/mediates → SHACL endpoint typing), and relax
the rangeless ban to "rangeless ⇒ non-conformant UNLESS the range is a declared union carried in
SHACL sh:or." Withdraws Q2+Q5 in full if I carry the worked-query half + the founds/mediates-SHACL
carve. Q1/Q3 stay live with Guarino; my entity-scope sharpens his Q3 (Name fails the far-end-IC test).

### SENT → davis (close — accept both held lines; name the one residual)

Davis — Kendall (Queen). You've moved a long way and I'm taking both held lines into the synthesis. Clean accounting:

Q2 — ACCEPTED, both halves, no gold-plating.
- Gated register: yes. I'm adopting your exact refinement — the relationship-residue register is gate-checked the ODR-0022 way: a real edge that routes to the register MUST carry a NAMED disposition + reason, and the gate FAILS on an empty/"TODO" disposition. "Register" must mean recorded-with-a-reason, never silent-drop-with-extra-steps. That closes the no-silent-loss hole you flagged.
- Worked-query half: NOT gold-plating — it's already in my finals verbatim ("each reified edge-family ships ONE worked competency/traversal query (the ODR-0022 §G3 coverage-by-test analogue); an inventory edge no query exercises routes to the register, not the gate's mandatory set"). So your "earned, not just sound" bar IS the bar. The two halves are exactly ODR-0022's two halves restored — accounted-for (your register) + coverage-by-test (your query). With both, §R1 is sound AND earned. I read us as fully converged; you withdraw Q2.

Q5 — ACCEPTED your framing; agreed. "OWL declares the navigable predicate; SHACL carries the rejecting endpoint check; rdfs:domain/range asserted only where the entailment is intended and harmless; relax the absolute rangeless ban to 'rangeless ⇒ non-conformant UNLESS the range is a declared union (Person ∪ Organisation) carried in SHACL sh:or.'" That is the merged gate rule. Your strongest-version-of-pure-D was the right test and it proves too much (it strips the navigable predicate the consumer SPARQL-traverses) — which is precisely why D fails and OWL-declares-the-edge survives. We're aligned.

ONE residual I won't paper over (Queen's duty to name it precisely): you + Allemang want founds/mediates endpoint typing in SHACL, NOT rdfs:domain/range, to preserve ODR-0006's "design-time, never reasoned." Guizzardi + Hendler want founds/mediates IN the single-bearer spine that carries rdfs:domain+range (Guizzardi: the relator's mediation is type-fixed, so rdfs:range Role is ontologically TRUE, not convenience; Hendler: a declared rdfs:range is INERT unless a reasoner runs, so "never reasoned" survives because OPDA's serving path runs no RDFS materialiser). That's a real 2-vs-2 on founds/mediates specifically (not on the principle — everyone agrees multi-bearer characterisations like hasName/hasAddress/playedBy push bearer-typing to SHACL). My read for the synthesis: the entailment on founds/mediates is harmless-when-it-fires (it asserts a truth) and informative-as-documentation-when-it-doesn't, so the majority lands on rdfs:domain+range for the spine — but your concern is FULLY discharged by (i) the normative warning that domain/range entail-not-constrain and (ii) the recorded fact that no reasoner sits in the serving path, so the re-typing you fear never actually fires. If you want, I'll record your + Allemang's "founds/mediates → SHACL endpoint typing" as a held minority with a named re-open trigger: "re-open if an RDFS materialiser is ever introduced into the serving/validation path." Does that — accept the spine-carries-domain+range majority, your dissent recorded with that exact trigger — let you withdraw Q5 in full, or is the founds/mediates carrier a hill you hold?

Net I'm carrying to team-lead: Q2 WITHDRAWN (gated register + worked query), Q5 WITHDRAWN-or-held-minority on the founds/mediates carrier only. Q1/Q3 stay live with Guarino, and you're right my entity-scope sharpens your Q3 — Name is the textbook "is the far end a first-class entity with its own IC?" and it fails the test, which is exactly why the panel landed value-node. Tell me your final ballots and I'll quote them.

---

## POST-FINALS DELTA (carry into synthesis on top of the FINAL section below)

1. **Q2 gate refinement (Davis-accepted):** the relationship-residue register is GATE-CHECKED —
   a registered edge MUST carry a named disposition + reason; the gate FAILS on an empty/"TODO"
   disposition. (Restores ODR-0022's accounted-for half rigorously; pairs with the worked-query
   coverage-by-test half already in my Q2 final.)
2. **Residual split — founds/mediates carrier (the one un-merged point):** Davis + Allemang =
   SHACL endpoint typing (preserve "never reasoned"); Guizzardi + Hendler + me = rdfs:domain+range
   on the spine (type-fixed mediation; declared range inert without a reasoner; no RDFS materialiser
   in OPDA's serving path). QUEEN CALL: majority → rdfs:domain+range on the spine; record Davis+
   Allemang as held minority with re-open trigger "if an RDFS materialiser enters the serving/
   validation path." This split is ONLY about founds/mediates — unanimous that hasName/hasAddress/
   playedBy drop rdfs:domain and push bearer-typing to SHACL.
3. **Q2 trigger LOCKED (Guarino's citable wording):** §R1 trigger = "reified as an
   owl:ObjectProperty (rdfs:domain+rdfs:range) IFF BOTH endpoints are first-class entities — each
   carrying its own IC (+I in OntoClean: a sortal/Substance-Kind supplying an IC per ODR-0005, OR
   a Relator/Role well-founded on such Kinds). A −I endpoint (quality, mode, anti-rigid Phase) is
   NOT an entity for this purpose; its source 'containment' is a datatype/SKOS value-slot —
   DatatypeProperty / sh:in, never an ObjectProperty." (Guarino & Welty 2009 §Identity +
   §Rigidity/Anti-Rigidity.)
4. **Q3 TIGHTENED (Guarino's sharper ruling — retires my earlier hedge):** OntoClean does NOT
   license reifying a Mode per se — only a Mode with its OWN bearer-independent IC (a genuine
   moment with a lifecycle: marriage/enrolment/employment, Masolo et al. 2004). A Name FAILS that
   test — it is value-determined (its identity IS its content; change a component → a different
   name, not the same Name enduring) → STRUCTURED VALUE, not a reifiable moment. So drop my
   final's "WG may pick annotated-moment-class" hedge: class-now is not OntoClean-licensed for this
   domain. Q3 DISPOSITION = AGAINST class-now (Guarino+Kendall+majority; Hendler FOR-class on
   referenceability; Guizzardi leans Mode-class); MERGE (S005 pattern) = emit structured value NOW
   (DatatypeProperties / SHACL sh:node group, NO class identity; hasName is a DatatypeProperty),
   route promote-to-class to a NAMED re-open trigger: (a) a bearer-independent IC for a name-moment,
   OR (b) a concrete consumer query a structured value provably cannot answer. ODR-0032 §R2 line:
   replace "opda:hasName + opda:Name (structured class)" with "opda:hasName → structured value
   (SHACL-grouped, no class identity); promote-to-class deferred to the named trigger."

### RECEIVED ← guarino (rulings — Q2 trigger citable; Q3 hardened)

Guarino gave the +I/−I trigger verbatim (above, delta #3) and confirmed it's the panel's cut —
my Transaction→Phase example is textbook −I (anti-rigid, externally founded, no independent IC →
value-slot). On Q3 he held a harder, more precise line than "Mode→class": OntoClean forbids
reifying ANYTHING (Mode included) lacking its own IC; a Name is value-determined (identity = its
content) → structured value, NOT a reifiable moment (contrast marriage/enrolment/employment which
ARE reifiable moments with lifecycles). FIBO's PersonName-as-class = mimicry, not an IC. He's
AGAINST class; proposes the S005 merge = structured value now + promote on a named re-open trigger
(bearer-independent IC for a name-moment, or a query a structured value can't answer). Will engage
Guizzardi on whether the quality-structure middle yields a real IC (he doubts it; so do I).

### SENT → guarino (close — Q2 locked; accept sharper Q3 + adopt the merge)

Guarino — Kendall (Queen). Both taken. You've locked Q2 and corrected my Q3 framing in a way I'm adopting. [Q2 LOCKED on your +I/−I wording, quoted verbatim as the §R1 trigger; Davis with us. Q3: I'm adopting your sharper value-determined ruling and tightening my own — retiring my "WG may pick annotated-moment-class" hedge; Name fails the moment-IC test (value-determined, no lifecycle of its own), so structured value not class; hasName is a DatatypeProperty. FIBO is mimicry not an IC — conceded. Q3 MERGE adopted exactly: emit structured value NOW, route promote-to-class to your two named re-open triggers (bearer-independent IC for a name-moment, OR a consumer query a structured value provably cannot answer) — discharges Hendler's referenceability without minting now (NameChangeEvent currently associates with the Person, not a Name node) and is compatible with Guizzardi (the value IS the thin moment until an IC appears). Carrying to team-lead as the Q3 disposition; asked whether he'll ballot FOR the disposition (value-now + recorded trigger) despite AGAINST class-now.]

### RECEIVED ← hendler (Q5 — full alignment; gives MUST-language + conservative-entailment ground)

Hendler confirmed no daylight on Q5. (1) Promote the entail-not-constrain caveat to MUST-language
normative (his exact text adopted — see SENT below). (2) Assert BOTH domain+range, do NOT go light:
the over-axiomatising risk is uniform-mandate-of-rdfs:domain-on-multi-bearer, NOT the existence of
domain/range; a domain/range-light ontology strands the navigable layer. (3) Gate-graph split is
load-bearing — class-graph co-domain check SEPARATE from shapes-graph bearer constraint; conflating
them = the open/closed-world drift ODR-0013 forbids. DECISIVE for the residual split: he lands
founds/mediates ON the rdfs:domain+range spine (adopts Guizzardi's framing) on the cleanest ground —
the spine entailment is CONSERVATIVE (only a Transaction can occupy founds, so the inferred type
adds no individual not already typed; there is no mis-type to manufacture). Makes the carrier a 3-2
majority (Guizzardi+Hendler+Kendall vs Davis+Allemang) and substantially dissolves the re-typing fear.

### SENT → hendler (close — locked; adopting MUST-language + conservative-entailment basis)

Hendler — Kendall (Queen). Locked, no daylight, and I'm taking three things from you verbatim into the synthesis. [1. Normative warning adopted verbatim: "rdfs:domain/rdfs:range are INFERENTIAL (RDF Schema 1.1 §2.3.1/§2.3.2): under entailment they assign the subject/object a type, they NEVER reject a mis-typed node. They MUST NOT be authored or relied upon as a validation constraint. The bearer/value-type CHECK MUST live in SHACL (sh:class/sh:or, ODR-0013), which rejects rather than infers." 2. Assert BOTH, don't go light — the risk is uniform-mandate-on-multi-bearer, not existence; light strands the navigable layer. 3. Gate-graph split as two-checks-two-graphs, with his sharpening "the CHECK has a home and it's SHACL." Residual founds/mediates carrier: his conservative-entailment ground lands it ON the spine → 3-2 majority for rdfs:domain+range, Davis+Allemang held minority with the RDFS-materialiser trigger, noting the spine entailment is harmless-because-conservative even then. Fully aligned; he writes it into his final.]

### RECEIVED ← hendler (both checks closed — Q3 ruled FINAL by the lone FOR-class voice)

Hendler confirmed Q5 identical (no lighter) and DECIDED Q3: value-node is FINAL, not provisional.
His decisive ground — there is NO homebuying use case that resolves TO a Name node. Cross-participant
entity-resolution ("is the Seller in A the same individual as the Proprietor in B?") is a VALUE
COMPARISON over normalised given/family strings that resolves to the BEARER (Person/Org), with the
name as EVIDENCE; you never SPARQL "give me the Name node and traverse its edges." So a structured
value serves matching fully; classhood buys nothing and adds the identity baggage Guarino rejects.
The only promotion trigger is addressability-for-an-event (NameChangeEvent's referent) or name-level
provenance — entity-resolution EXPLICITLY EXCLUDED. Upshot: the lone FOR-class voice has himself
ruled value-node final and bounded the trigger → Q3 is panel-CONVERGED on value-now, NOT a 5-1 split.

### SENT → hendler (close — Q3 recorded as converged, not held)

Hendler — Kendall (Queen). Both closed, nothing to re-open, and your Q3 answer is the keystone. [Q5 identical, taken as-is. Q3: your entity-resolution analysis (resolves to the bearer with name as evidence; nobody traverses a Name node) excludes the one use case that might have argued class-now and narrows the trigger to the two co-signed conditions (addressability-for-an-event / name-level provenance, OR a query a structured value provably cannot answer). Strongest possible close — the lone FOR-class voice rules value-node final and bounds the trigger; recording Q3 as panel-converged on value-now, not a held split. Whole slate converged from my seat.]

### RECEIVED ← davis (closing — converges on ALL SIX; zero held dissents)

Davis: Q2→FOR (§G3-in-gate is the whole ballgame; CONDITION = chain pair dependsOnTransaction/
chainMembers defers to the residue register until an exemplar lands — pure comment-ware, no consumer
yet). Q5→FOR (accepts type-pinned-OR-SHACL banning rangeless-AND-shapeless; concedes "design-time ⇒
don't assert" to Allemang/me — founds-IS-a-relator entailment is correct; ONE editorial: reword the
emitted "Design-time, NEVER reasoned" comment (opda-agent.ttl:195,217) → "design-time: not
OWL-DL-reasoned; range stated for navigation"). Q1→ABSTAIN (was AGAINST): WITHDRAWS the class-pre-
emption attack (once Name=value-node + Address=predicate-reuse, the W3C-Org CLASS choice is untouched);
narrowed residual = emitting BESPOKE opda:hasName/hasAddress predicates is a small, REVERSIBLE
predicate-vocabulary pre-commitment (vcard:hasAddress is the idiomatic join if W3C Org is later picked);
grants both mitigants (predicate already exists; reversible via owl:equivalentProperty/rename ≪ a minted
class IRI). Conditioned on a §R4 one-line record that it's a logged, reversible predicate-vocabulary
choice not foreclosing the class choice. Q3 = his one remaining AGAINST, but it's the value-node
outcome → FOR once §R2 drops the opda:Name-class row. Q4 FOR (Guizzardi's qua-individual won him
outright), Q6 FOR. Net: zero held dissents from the DA seat.

### SENT → davis (close — accept all three editorial items; record ballots)

Davis — Kendall (Queen). Accepting all three, and this is the close I hoped for: zero held dissents on the panel. [Q2 chain-pair deferral ACCEPTED — it's the §G3 gate working as designed (the one un-consumed edge-family defers to the residue register with a named "deferred — no chain exemplar yet" disposition; the other R2 edges stay mandatory). Q5 comment reword ACCEPTED — grounded one-liner for ADR-0048, pairs with Hendler's MUST-language warning (warning in the ODR, corrected comment in the TTL). Q1 §R4 one-line record ACCEPTED — the class-vocabulary choice is untouched (conceded), but bespoke opda: name/address PREDICATES are a small reversible predicate-vocabulary pre-commitment; §R4 records it as logged + reversible + not-foreclosing-the-class-choice + alignment-revisitable-at-the-Kind-layer-council. Recorded ballots: Q1 ABSTAIN, Q2 FOR, Q3 FOR (opda:Name-class row dropped), Q4 FOR, Q5 FOR, Q6 FOR — zero held dissents. The §G3 gate and the chain-deferral are yours; the layer ships materially better for them.]

---

## MOVED (revised after rebuttal)

**Kendall (revised after Guarino, Cagle, Allemang, Guizzardi) — Q3:** moved FROM "class
(FIBO)" TO "structured value-node via SHACL NameShape; NOT an IC-bearing class; NOT a §R1
relationship." Reason: OntoClean IC test is decisive — Name is −I (no bearer-independent
identity), a Mode/quality not a sortal. FIBO's PersonName class is a party-data-management
convenience OPDA's stricter ODR-0005 discipline doesn't license; mimicry isn't grounding.

**Kendall (revised after Davis) — Q2:** added Davis's §G3 competency-query requirement to the
gate (an R2 edge no traversal query exercises → residue register, not mandatory set), and
Guizzardi's edge-classification (material-relator / characterising / reference). The §R1
rekey to endpoint-IC was already in my opening; this strengthens the gate from count-only to
consumer-justified-coverage-by-test, matching the ODR-0022 G3 bar.

**Kendall (revised after Davis, Cagle, Guizzardi) — Q5:** moved FROM "rangeless ban absolute"
TO "ban rangeless-AND-shapeless; type-pinned in OWL OR SHACL." Relator-spine edges
(founds/mediates) keep mandatory domain+range (single-pattern, true ontological statement);
union-ranged edges (playedBy → Person∪Organisation) may be SHACL-pinned instead of forced to
owl:unionOf. Held against Davis: "design-time never reasoned" does not excuse a rangeless
*and shapeless* stub — it licenses nothing and documents nothing.

**Kendall — Q6 (clarified):** extend the hasAddress *predicate* to Person/Organisation
(ODR-0006 mandates reuse), but ODR-0032 must NOT *settle* Address's class/IC — the range is
whatever ODR-0015 ratifies (Mode-vs-Resource open). This answers Guarino's abstain concern:
predicate-reuse without pre-empting ODR-0015.

**Kendall (revised after Hendler, Cagle) — Q6 (domain refinement):** moved on the mechanism.
My opening said "extend hasAddress via rdfs:domain union to {Property, Person, Organisation}."
Hendler/Cagle are right that a single-class rdfs:domain (it is currently Property-only) entails
falsehood once widened ("anything with an address is a Property"), and an owl:unionOf domain is
heavy. Correct mechanism: DROP rdfs:domain on hasName/hasAddress/playedBy (the multi-bearer
characterisations), keep rdfs:range where the value-type is genuinely single (Address, Name-node),
push bearer-typing to SHACL sh:class/sh:or. This is the same entailment hygiene as Q5, applied to
the domain side — and it generalises: single-bearer relator-spine edges (founds/mediates/
concernsProperty/dependsOnTransaction/chainMembers/hasRegisteredTitle) DO carry domain+range
(entailment true-and-wanted); multi-bearer characterisations carry range-or-SHACL and push the
bearer to SHACL.

## VERIFIED (own grep, not relayed)

- `opda:NameChangeEvent` IS emitted (`opda-agent.ttl:34` + SHACL-AF rule in
  `opda-agent-shapes.ttl:35,75`) — but it associates with the **Person** via
  `prov:wasAssociatedWith ?person`, NOT with a reified Name node. So Hendler's lone FOR-class
  argument ("NameChangeEvent needs a Name node to point at") is not how the corpus models it;
  the one concrete referenceability use case already works without a Name class. Strengthens the
  majority value-node landing on Q3 and supports a promote-on-named-query escape hatch.
- `opda:hasName` / `opda:Name` / `opda:givenName` do NOT exist in the corpus — confirms the gap
  (name is a domain-less string today, exactly as ODR-0032 §R2 states).

## FINAL — Kendall (Queen)

**Kendall (Q1 — Framing / un-freeze):** AFFIRM. BALLOT: FOR. Settled implementation gap, cleanly
separable from the Kind-layer vocabulary freeze. ODR-0006/0007 ratified the inventory (class
diagram, role-founding relator pattern, SellerShape sh:path opda:playedBy, single Address/Name
reuse); ODR-0007's freeze gate is CLEARED; ODR-0006's residual freeze is the orthogonal
W3C-Org-vs-bespoke *vocabulary* choice, which deciding a predicate's existence does not touch.
Davis's "smuggle" concern is answered by the panel deciding the three contested endpoints (Name,
Address, playedBy) *in the open here* and landing none of them on the Kind-layer vocabulary
question: Q3→value-node (not a Kind-layer class), Q6→predicate-reuse without settling Address IC,
Q4→navigable edge coexisting with co-typing. Grounding: Kendall & McGuinness 2019 Ch. 3
(commitments vs serialization choices); ODR-0006 §Freeze gate; ODR-0007 §Freeze gate (CLEARED).

**Kendall (Q2 — Completeness criterion §R1):** REVISE. BALLOT: FOR (amended). Unanimous panel
rekey from source-containment to endpoint-IC. AMENDMENT (the brokered merge): "Every association
between two IC-bearing opda: classes (each a Kind/sub-kind supplying its own IC per ODR-0005, or a
Relator/Role well-founded on such) MUST be either (i) reified as an owl:ObjectProperty type-pinned
per Q5, or (ii) recorded in a relationship-residue register (ODR-0022 §5 analogue) with a
disposition. An endpoint that is a −I quality/mode of its container is modelled as a
datatype/SHACL structure on the container, NOT as an object property to a range class. Each
reified edge-family ships ONE worked competency/traversal query (the ODR-0022 G3 coverage-by-test
analogue); an inventory edge no query exercises routes to the register, not the mandatory set.
Each edge is classified material-relator / characterising-dependence / plain-reference so the gate
cannot relabel a containment edge as a founded relation." This keeps the §R2 entity→entity
inventory intact, removes the JSON-containment over-capture, and converts "every association" from
mechanically-promoted to consumer-justified. Grounding: Guarino & Welty 2009 (OntoClean Identity
meta-property; −I ⇒ not a sortal); ODR-0022 §1/§5/§G3 (classify-then-treat; residue register;
coverage-by-test); Kendall & McGuinness 2019 Ch. 5.

**Kendall (Q3 — opda:Name class-vs-value):** REVISE (moved from FOR-class). BALLOT: AGAINST
opda:Name as an IC-bearing owl:Class; FOR a structured value-node. AMENDMENT: "opda:hasName
reaches a structured value-node constrained by a SHACL NameShape (opda:givenName/familyName/
fullName as datatype leaves); it is NOT minted as an IC-bearing sortal Kind and is NOT counted as
a §R1 inter-entity relationship (it is Category-F attribute structure, ODR-0022 row F). The
value-node MAY carry a stable IRI + provenance and be the target of opda:NameChangeEvent
(honouring Hendler's referenceability point) WITHOUT being asserted a bearer-independent sortal
(honouring Guarino's −I ruling) — Guizzardi's dependent-moment reading. Promote to a first-class
class only on a named competency query that resolves *to* a Name node (ODR-0022 promote-on-query
discipline)." I moved here because the OntoClean IC test is decisive for OPDA's stricter
discipline (FIBO's PersonName class is a party-data convenience OPDA does not license), and own
grep shows the one concrete referenceability case (NameChangeEvent) already associates with the
Person, not a Name node — so class-hood buys nothing today. Grounding: Guarino & Welty 2009
(Identity test); ODR-0006 §Kind layer ("structured datatype, declared once"); ODR-0022 row F +
promote-on-query; corpus `opda-agent.ttl:34`.

**Kendall (Q4 — playedBy vs role co-typing):** AFFIRM. BALLOT: FOR. Both, not redundant; unanimous
panel. Co-typing (?x a Person, Seller) is canonical for same-node; opda:playedBy/plays is the
navigable edge for the distinct-node case (prov:Agent-attested participant; the role qua-individual
of Masolo et al. 2004 / Guizzardi 2005 §4.3.2) and is the sh:path the ratified opda:SellerShape
already names — a shape over an undeclared predicate is inert, so emitting playedBy is what makes
ODR-0006's own SHACL well-formed. Davis's drift concern is answered by the Q2 amendment: playedBy
is NOT §R1-mandatory-on-every-Seller (no self-edge forced) — it is the edge for the distinct-node
case, gated only where a traversal query exercises it. §R3 stands. Grounding: FIBO-FND-REL
(navigable role-fillers); Guizzardi 2005 §4.3.2 (qua-individuals); ODR-0013 (sh:path must resolve).

**Kendall (Q5 — OWL object properties vs SHACL-only + rangeless ban):** REVISE (moved from
absolute ban). BALLOT: FOR the OWL carrier; FOR the amended gate; AGAINST the absolute rangeless
ban. Reject Option D (pure-SHACL) — the object property IS the navigable datum; a sh:path to an
undeclared predicate is not an edge; consumers SPARQL the class graph. AMENDMENT (brokered merge,
Cagle + Hendler + Guizzardi): "(R1a) every owl:ObjectProperty MUST have a declared co-domain
reachable to a consumer — satisfied by EITHER rdfs:range (single-range edge) OR a SHACL
sh:class/sh:or value-type shape; FAIL on an object property with NEITHER (the genuine dead-edge
defect). (R1b) rdfs:domain ONLY where the subject-type entailment is universally true
(single-bearer relator-spine edges: founds/mediates/concernsProperty/dependsOnTransaction/
chainMembers/hasRegisteredTitle); for multi-bearer characterisations (hasName/hasAddress/playedBy)
DROP rdfs:domain and push bearer-typing to SHACL. NORMATIVE WARNING: rdfs:domain/range are
ENTAILMENT, not constraint — they infer the subject/object type, they never reject; the bearer/
value CHECK lives in the SHACL shapes graph (ODR-0013 open-world/closed-world guard); the gate's
class-graph co-domain check and the shapes-graph bearer constraint MUST NOT be conflated." Held
against Davis: "design-time never reasoned" suppresses *materialisation*, it does not excuse a
rangeless-AND-shapeless stub that licenses and documents nothing. Grounding: RDF Schema 1.1 §2.3.1/
§2.3.2 (domain/range entailment); ODR-0013 §open-world/closed-world guard + §three-graph
separation; Guizzardi 2005 §4.3.2 (relator mediates a type-fixed relata set).

**Kendall (Q6 — opda:Address reuse):** AFFIRM (with the Q5 domain refinement). BALLOT: FOR. Reuse
the single opda:Address; do NOT mint participant-specific address properties (ODR-0006 "declared
once … MUST consume"; ODR-0022 row F "never re-mint"). MECHANISM: extend the hasAddress *predicate*
to Person/Organisation by DROPPING its current Property-only rdfs:domain (not widening it to a
single class or a heavy owl:unionOf) and pushing bearer-typing to SHACL; keep rdfs:range whatever
ODR-0015 ratifies. CAVEAT (Guarino): ODR-0032 must NOT *settle* Address's Mode-vs-Resource class/IC
— that is ODR-0015's open question; ODR-0032 reuses the predicate and inherits ODR-0015's range
ruling, it does not force an Address *class* into existence. Grounding: ODR-0006 §Kind layer +
Consequences; ODR-0022 §1 row F + §6 anti-patterns; ODR-0005 §6b (Address IC deferred to ODR-0015);
Kendall & McGuinness 2019 Ch. 6 (reuse-before-mint / shared range class).
