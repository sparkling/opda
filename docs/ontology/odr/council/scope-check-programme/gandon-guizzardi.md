# Gandon + Guizzardi: Position on Programme Scope-Check

## Framing

Two voices, two lenses, one question: are ODR-0002 through ODR-0014 the right
unit of decision? We answer from our published methodologies — Gandon from
the W3C stack he stewarded (RDF 1.1/1.2, OWL 2, SHACL) and his URI/RDF
data-management work; Guizzardi from *Ontological Foundations for Conceptual
Modeling with Applications* and the OntoUML/UFO programme (Substance Kind,
RoleMixin, Role, Phase, Relator).

**Gandon asks: does each ODR own a distinct slice of the URI graph and its
constraint surface?** A clean cut preserves dereferenceability, separates
open-world from closed-world, and keeps each `rdfs:isDefinedBy` resolving to
one module. **Guizzardi asks: does each ODR carve a meta-category joint —
Kind, Role, Phase, Relator, Quality, Mode — that the world actually has?**
A clean cut respects identity and rigidity, founds Roles and Phases in the
relations and substances that ground them, and never confuses an Endurant
with a process or a mode of presentation.

The programme partitions by **ontological concern reconciled with UFO
layering** (ODR-0003 Q3); we endorse the principle. The eight questions ask
whether the *instantiation* in the present 13-ODR cut delivers it.

## Q1 — Is the 13-ODR cut right?

**Gandon.** Largely yes, with one structural concern. The cut respects
the most important seam from session-001 Q3: **OWL class graph ⊥ SHACL
shapes graph** (ODR-0004 Rule 3). ODR-0005 through ODR-0008 own class
semantics; ODR-0010 and ODR-0013 own shape semantics; ODR-0011 owns
controlled-vocabulary semantics (a third axis). The single hash namespace
honours my "don't ship URIs you don't serve" rule. Push-back: **0010
(overlay mechanism) and 0013 (validation/severity) are both about the
shapes graph** — the annotation-graph split, severity tiering on profile
shapes, and no-identity-override gate suggest one ODR was split into two
for editorial convenience. I return to this on Q6.

**Guizzardi.** Mostly category-clean but **under-articulated on one
axis**. ODR-0004 substrate, ODR-0005 gate, ODR-0006 Agents, ODR-0007
Transactions are clear UFO joints: 0005 is *the* Endurant + IC decision;
0006 is the Kind / RoleMixin / Role layering; 0007 is the founding
Relator that makes 0006's Roles coherent. ODR-0008 is doing different
category work — mostly **Qualities and Modes** of the Property Kind,
with a few intermediate Kinds (Building, Room) hiding inside. The text
lists "built form / condition / valuation / EPC / utilities / searches /
encumbrances" but does not name the meta-categories. I would not split
0008 yet (see Q2), but the **Qualities-vs-Phases line is the cut that
matters and is not visible from the index alone**.

**Joint vote.** Endorse the 13-ODR cut. **2-0** with two reservations —
Gandon on 0010/0013 (returns at Q6), Guizzardi on 0008's internal
Qualities/Modes/Phases discipline.

## Q2 — 0008 sub-module split (built-form / energy / encumbrances?)

**Gandon.** Defer the split. From a URI-graph standpoint, every
descriptive property in 0008 attaches to the **same `opda:Property` (or
legal-estate) class** declared by 0005. They share an `rdfs:isDefinedBy`
edge to the same module. Splitting them now buys nothing the flat namespace
discipline (ODR-0004 Rule 1) does not already give us — overlay-specific
constraints live in 0010 profiles, enumerations in 0011, validation in
0013. Three or four sub-module ODRs with no separate URI surface and no
separate constraint surface would be **administrative ODRs**, not
ontological ones. Split *only* when one of the candidate sub-modules
acquires a distinct external alignment (e.g. **energy** acquires QUDT units
+ a sensor/SSN dependency that the other sub-modules don't share; or
**encumbrances** acquires a FIBO/LegalEstate alignment that built-form
doesn't). Then the split tracks a real namespace seam.

**Guizzardi.** I agree, **but for a category-cleanness reason that gives
Gandon's "defer" a sharper test**. The candidate sub-modules carve
*different* UFO surfaces: built-form is mostly **intrinsic Qualities** of
the Property Kind (`buildInformation`, `yearOfBuild`, `numberOfFloors`) plus
intermediate Kinds (Building, Room); condition is **Phases** of those Kinds
(*good* / *defective* / *Japanese-knotweed-present*); valuation is **Modes
of presentation** depending on a relation to a market-event; encumbrances
are **Relators** (mortgage, lease, easement) that bind a Property to other
endurants. **These belong in different meta-categories**, so the split
*is* category-clean in principle. But it is **premature** because the
volume work (935 leaves) has not been done — and you cannot decide which
attribute is a Quality, a Mode, or a relational endurant in a vacuum. Run
0008 once, *then* split if the volume genuinely demands it. The pattern is
identical to Gandon's: defer until a real seam appears.

**Joint vote: defer the split. 2-0.** If a split lands later, the trigger
is **either** a distinct external alignment (Gandon) **or** a clear
volume-driven Qualities-vs-Phases-vs-Relators line (Guizzardi). Both
amount to "split only when a real joint appears."

## Q3 — 0008 vs 0011: combine descriptive attrs + enumerations?

**Gandon.** **Keep them separate.** Different `rdfs:isDefinedBy`,
different consumers, different vocabularies. 0008 mints `owl:Class` and
`owl:DatatypeProperty` declarations against the W3C OWL 2 stack. 0011
mints `skos:Concept` and `skos:ConceptScheme` against SKOS. A consumer
fetching the descriptive-attribute graph should not be force-fed the
controlled-vocabulary graph for closed enums — and vice versa, a SKOS
consumer doing concept-management should not need the property
declarations. The two have **different stability profiles**: descriptive
properties are stable (0008 freezes them); SKOS concept schemes change
membership over time (`A`–`G` EPC bands could become `A+`–`G`, broadband
`typeOfConnection` admits new fibre variants — 0011 must handle that
without touching 0008). **`rdfs:isDefinedBy` is the test**: if two things
don't share one, they don't share an ODR.

**Guizzardi.** **Keep them separate, with one caveat.** SKOS concepts in
0011 are not all the same kind of thing. Some are **Qualia in a Quality
Region** (EPC band `A`–`G` over the energy-efficiency Quality region;
`councilTaxBand` `A`–`I` over a banded valuation region); some are **role
labels** (`role` enum: `Buyer`, `Seller's Conveyancer`, `Estate Agent` —
these are RoleMixin/Role labels); some are **Phase labels**
(`participantStatus` `Proposed` / `Invited` / `Active` / `Removed`); some
are **method/plan codes** (`sellersCapacity`'s `Personal Representative`).
**These are different meta-categories** and the 0011 text does not name
them. As long as 0011 stays a *mechanism* ODR (SKOS-as-vehicle) and the
category commitment is made in the consuming module (0006 says
`participantStatus` is a Phase; 0008 says `councilTaxBand` is a Quale),
combining 0008 and 0011 would **conflate vehicle with content** and lose
both. **Separate.**

**Split signal recorded.** Gandon's `rdfs:isDefinedBy` test answers
**combine?** with a clean No. Guizzardi's meta-category test answers
**combine?** with a clean No **but for a different reason** — and his
"caveat" surfaces a defect Gandon's lens does not: **0011 owes its
consumers an explicit meta-category commitment per scheme**. The present
0011 lists "indicative schemes" but does not say which are Qualities,
which are Roles, which are Phases. **2-0 to keep separate**; **Guizzardi
records a sub-finding** that 0011's `## Rules` should require each scheme
to declare its UFO category in a downstream amendment.

## Q4 — 0002 vs 0014: retire 0014?

**Gandon.** **Retire 0014 once the catalogue stabilises.** From a
URI-graph standpoint, the catalogue is one resource — `rdfs:isDefinedBy
<…/ODR-0002>` is how every Conditional vocabulary should be cited. The
present split (0002 baseline + 0014 amendment) is **provenance scaffolding**
to preserve the H&M-survey baseline vs the session-001 amendments. Once
the programme reaches `accepted`, the catalogue is a single artefact;
keeping two ODRs forces every downstream consumer to dereference both to
read the current state. The supersession-mechanism precedent the OPDA team
records (0014 carries `supersedes: [ODR-0002]`, but as a partial
supersession recorded inside `## Rules`) is **operationally novel** —
neither the ADR pattern nor MADR specifies partial supersession this way —
and the cost-of-novel-pattern is itself an argument for collapsing.

**Guizzardi.** **Retire 0014 — but later than Gandon's "once stabilised."**
The catalogue is not a UFO question; it is a metadata-governance question.
Two thin observations: (1) The session-001 changes to 0002 were
*reasoned* — OWL-Time IN because PROV-O-instants-without-OWL-Time-intervals
is **ontologically incoherent** for proprietorship and lease intervals
(my own argument in session-001 Q2). That reasoning belongs in the
catalogue itself, not in a separate amendment record, because the
incoherence argument is a category-cleanness argument. (2) ODRL was
deferred because policies bite on instances — also a category fact
(`odrl:Policy` is an instance-level Relator, the TBox alone asserts
nothing). These are not amendments-of-record; they are the catalogue
*reasoned correctly*. **Collapse 0014 into 0002** when 0002 next freezes,
and carry the deliberation links to the relevant session transcripts.

**Joint vote: retire 0014 into 0002.** **2-0.** Mechanism: when both
ODRs reach `accepted`, fold 0014's amended rows back into 0002's tables
with a "Session 001 amended this row" footnote; 0014 is marked
`superseded` and kept as a transcript-anchored artefact, not as a live
catalogue source.

## Q5 — 0009 vs 0012: combine Claims + Governance?

**Gandon.** **Keep them separate.** 0009 is a **provenance graph**
(PROV-O is its primary vocabulary, with a narrow assurance-layer extension);
0012 is a **governance overlay** (DPV is its primary vocabulary). Two
canonical W3C namespaces, two distinct `rdfs:isDefinedBy` edges, two
distinct consumer profiles (a wallet/VC consumer reads 0009; a DPO/GDPR
auditor reads 0012; they overlap on evidence-entities but their primary
consumers don't). Co-annotation (a `prov:Entity` document evidence node
*also* `dpv:hasPersonalDataCategory dpv-pd:OfficialID`) is exactly what
**separate-graph + canonical-URI** is for: each graph carries its own
predicates, the triples sit on the same subject, no conflict. Combining
would either privilege one canonical vocabulary over the other (bad) or
mint `opda:` shadows of one (worse — re-mints what W3C already serves).

**Guizzardi.** **Keep separate, with a sharper reason.** PROV-O models
**process and derivation** (occurrents and the endurants involved in
them); DPV models **regulatory-and-rights status** of an endurant or
activity. These are **different ontological commitments** —
participation/causation vs classification-and-policy — and forcing them
into one ODR would implicitly equate them. **0006 + 0007 + 0009 form an
ontological spine (Person → Role → Transaction → Claim); 0012 is a
transverse classification layer.** Weakness: both 0009 and 0012 own DPV
co-annotation rules; the plan flags this as a "tight loop" with a
forward-supersession mechanism (012 may amend 009). Fine for now, but
an edge that proliferating would signal the seam is misplaced.

**Joint vote: keep separate. 2-0.** Both views converge cleanly here.

## Q6 — 0010 vs 0013: combine Overlay Profiles + SHACL Validation?

**Gandon.** **Combine.** From the SHACL 1.2 standpoint, 0010 and 0013
are the same artefact: a shapes graph, its profile slices, severity
assignments, DASH UI annotations. Evidence the split is editorial: the
no-identity-override gate is a meta-shape rule; the annotation-graph
split is declared by *both* ODRs; the `opda:ValidationContext`
reification owned by 0010 directly enables the severity tiering owned
by 0013. One artefact, one ODR — 0010 collapses into 0013.

**Guizzardi.** **Keep separate.** 0010 reifies `opda:ValidationContext`
as a first-class profile node — a *Relator-like* artefact mediating
between a transaction graph and a shapes graph. That reification is an
**ontological-status decision** (the Guarino-DA condition from
session-001 Q5), not a SHACL-engineering decision, even though it lands
in SHACL syntax. 0013 is different: **how severe is a violation, given
that a profile has fired it?** Severity is regulatory-weight;
ValidationContext is mediating-relator. The two ODRs cleave at a real
joint — one decides *what a profile is*, the other decides *what a
violation report should look like*. Shared surface syntax does not
make them one ODR any more than two OWL axioms with `rdf:type` make
one ontology.

**Split vote. 1-1.** Recorded.

- **Gandon: combine.** One shapes graph, one ODR.
- **Guizzardi: separate.** ValidationContext-as-Relator is a different
  decision from severity tiering.

We do not resolve this jointly. The downstream choice depends on whether
the WG reads ODRs as *ontological-commitment records* (Guizzardi —
separate) or *artefact-engineering records* (Gandon — combine). The OPDA
DCAP discipline reads as the former; on that reading, Guizzardi wins. We
flag it for the WG.

## Q7 — Missing ODRs (Address & Geography, Generator policy, W3C VC/DID?)

**Gandon.** Three missing ODRs, with different urgency.

1. **Address & Geography.** `Address` is referenced by 0005 (a mode of
   presentation), 0006 (declared once for participants), and 0008 (consumed,
   not declared). The plan §4.1 routes the "Address class location" to
   session 006. **That's a routing decision, not an ODR.** A proper Address
   ODR would settle: (i) is Address a structured datatype, an
   `opda:Address` class, or an external alignment (INSPIRE, GeoSPARQL,
   `vcard:Address`)? (ii) what are the spanning leaves (`postcode`,
   `uprn`-linked, `titleAddress`, `marketingAddress`)? (iii) GeoSPARQL for
   `titleExtents`/`chargeExtent` — the present 0008 defers GeoSPARQL — is
   that the right home for the deferral, or does Geography deserve its own
   stub? My answer: **mint ODR-0015 (Address & Geography)** before 006/008
   freeze.

2. **Generator policy.** 0004 §"Generator-first" is a one-paragraph rule.
   For a 935-leaf generator producing thousands of OWL/SHACL triples
   automatically, the policy needs a record: where the generator lives,
   what its input is, how its output enters version control, how it is
   re-run, who owns the seed mapping. **That is a Foundation amendment
   ODR**, not its own concern-partition module — call it ODR-0004a or fold
   into 0004 in its next freeze. Lower urgency than Address.

3. **W3C VC / DID.** The business glossary names `Verifiable Credential`,
   `Issuer`, `Holder`, `Verifier`, `Trust Framework`. The plan session 009
   Q8 asks "is `opda:Claim` `cred:VerifiableCredential`-compatible?" — a
   question of that consequence is an ODR, not a Q under another ODR. The
   VC/DID alignment is a **catalogue + cross-vocabulary-mapping** question
   that the present catalogue (0002 + 0014) does not yet open. **Mint
   ODR-0016 (W3C VC / DID alignment) when 009 reaches `accepted`** — too
   early before then, but the question is real.

**Guizzardi.** Address is the most interesting question on the agenda.
**Is `opda:Address` a Kind, a Quale, or a Mode?**

- **As a Kind** (a substance with identity criteria), Address is a
  standalone endurant — identifiable independent of any Property it
  locates (the INSPIRE Address-as-feature position).
- **As a Quale in a Region** (a value in a spatial-presentation region),
  Address is just a structured datatype — no identity, no co-reference
  across rows (the present 0008 default).
- **As a Mode** (a particularised property inhering in a Property Kind),
  Address is *of* a Property, has no identity independent of it, but is
  reified enough to bear its own predicates (the UFO-leaning reading).

The three are *not* equivalent — they give different answers on
multi-address properties, marketing-vs-title address (Cagle's
session-001 raise), and `uprn`-linked vs `inspireID`-linked records.
**Address deserves its own ODR** because under all three readings it
cross-cuts 0005, 0006, 0008 and the plan does not name which category
it sits in.

Generator policy: agree with Gandon — fold into 0004.

W3C VC/DID: agree with Gandon — future ODR. I append a **Truth-Maker
question**: what *makes true* a Verifiable Credential? PROV-O names a
derivation; the VC names a cryptographic signature; the assurance level
names a regulatory judgement. Three truth-makers, one Claim — an
ontology question, currently inside 0009 too tightly.

**Joint vote.**

- **Address & Geography: mint a new ODR.** **2-0.** Highest urgency —
  blocks 006, 008 freeze.
- **Generator policy: fold into 0004.** **2-0.** Foundation engineering,
  not a new ODR.
- **W3C VC/DID alignment: mint a future ODR after 0009 lands.** **2-0.**
  Lower urgency. Guizzardi appends a **Truth-Maker question** for the
  same future ODR.

## Q8 — What signals the cut is right?

**Gandon.** Four URI-graph signals:

1. **Every minted URI resolves to exactly one ODR's
   `rdfs:isDefinedBy`** — no class declared in two modules; no concept
   scheme split across two ODRs; the catalogue cited as one resource.
2. **Open-world and closed-world stay in separate graphs** — no
   `owl:imports` from shapes to classes; no property carries both an
   `owl:` cardinality and a SHACL count authored as if equivalent; the
   drift check (ODR-0013 Rule "Open-world/closed-world guard") finds
   nothing.
3. **The flat namespace stays flat** — modules are editorial; the URI
   does not encode module membership; re-grouping concepts later does
   not break dereferenceable URIs (ODR-0003 Q3 verdict honoured).
4. **The MVP BASPI5 round-trip closes** — JSON → loaded SHACL profile
   → rendered DASH form → validated transaction with `dct:source`
   traceability. If the round-trip works against the present cut, the
   cut is *operationally* right; if it requires inventing classes
   across ODR boundaries or duplicating shapes across profiles, the cut
   needs revision before scaling.

**Guizzardi.** Four UFO-category signals:

1. **Every Endurant declared in 0005-0008 has an identity criterion**
   that survives the diagnostic exemplars (ODR-0005's gate). No Kind
   pretending to be a Role; no Role pretending to be a Kind; no
   Endurant pretending to be an event.
2. **Every Role is founded by an explicit Relator** named in the same
   ODR or a sibling ODR (Seller founded by Transaction in 007;
   Proprietor founded by Proprietorship in 006). No floating Roles.
3. **Every SKOS scheme in 0011 declares its UFO meta-category** —
   Quale-in-Region, Role label, Phase label, or method/plan code. The
   present 0011 text does not yet, but a downstream amendment makes
   this the cut's confirmation.
4. **The Property class survives an Endurant-vs-Process challenge** —
   when a property is demolished, the IC says the Endurant ceases;
   when subdivided, the IC says one Endurant becomes two; when
   re-registered, the IC for the legal Endurant changes while the IC
   for the physical Endurant does not. ODR-0005's exemplars are
   exactly this test.

**Joint formulation.** **The cut is right when both lists hold
simultaneously.** Eight signals total. If the BASPI5 round-trip closes
(Gandon §4) *and* the three exemplars validate (Guizzardi §4), the cut
is operationally and ontologically sound. Either signal failing alone
does not invalidate the cut — Gandon's signals are about engineering
discipline; Guizzardi's are about commitment cleanness — but if both
fail, the cut needs re-deliberation.

## Where the URI-graph view and the UFO-category view diverge

The two lenses agree on **eleven of the twelve sub-questions** above. They
diverge cleanly on one: **Q6 — combine 0010 + 0013, or keep them
separate?**

**Gandon's URI-graph reading.** A shapes graph is a shapes graph. SHACL
1.2 has one surface syntax, one constraint vocabulary, one severity
mechanism. Splitting a single artefact across two ODRs encodes the
engineering question "where does this constraint live?" twice. The
no-identity-override gate, the annotation-graph split, the
ValidationContext reification — these are *one decision* about how the
shapes graph is structured, and the W3C standards stack treats them as
one. **Combine 0010 into 0013** (or vice versa); keep 0011 (controlled
vocabularies) and 0008 (descriptive attributes) separate from both.

**Guizzardi's UFO-category reading.** The `opda:ValidationContext`
reification (0010) is a **Relator-class decision** — a first-class node
mediating between a transaction graph and a shapes graph — which is an
ontological commitment about what a profile *is*. The severity tiering
(0013) is a **regulatory-weight decision** — how a violation report
treats the failure of a constraint of a Kind's identity contract — which
is a different ontological commitment, about which constraints *bear*
which weight. The two are not one decision; they are **a commitment-about-
profiles and a commitment-about-violations**, both expressible in SHACL,
but distinct in their ontology. **Keep them separate.**

**Why we can't joint-vote.** The disagreement is about **what an ODR
records**: an ontological commitment, or an artefact-engineering
decision? Gandon treats the ODR as the W3C/DCAT-style metadata record
of *what was published*; Guizzardi as the OntoUML/DCAP-style record of
*what was committed to*. Under Gandon's reading the right unit is the
publishable artefact (one shapes graph → one ODR); under Guizzardi's,
the ontological commitment (one Relator-class decision → one ODR; one
severity-doctrine decision → one ODR).

**Both readings are defensible.** Recommendation: the WG should
*choose* one and apply it consistently — mixing the two will drift the
ODR count over time as later sessions implicitly resolve the question
differently. ODR-0001 (Council methodology) and DCAP do not yet name
this choice; that is the gap our divergence exposes.

- **Gandon's reading consequence:** combine 0010 into 0013; retire 0010
  as a separate stub.
- **Guizzardi's reading consequence:** keep 0010 and 0013 separate; add
  a `decision-kind:` frontmatter line to every ODR (e.g.
  `relator-commitment` vs `validation-doctrine`) so the cut is legible.

That is the live, unresolved question this scope-check surfaces.
