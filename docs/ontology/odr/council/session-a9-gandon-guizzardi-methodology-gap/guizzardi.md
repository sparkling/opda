# Guizzardi — Position on the A9 methodology gap

## Position summary (one paragraph)

An ODR records an **ontological commitment** wherever it declares what *kinds* of entities the domain contains, what their identity criteria are, what Roles or Phases they pass through, what Relators bind them, what Modes or Qualities they bear; it records an **artefact-engineering decision** wherever it fixes encoding choices over a representational artefact (URIs, namespaces, graph topology, build pipelines, governance workflow). The two are not interchangeable, and the DCAP's existing `kind` enum *already* sorts records along this axis — `pattern` and `mapping` are commitment-bearing; `methodology`, `architecture`, and `programme` are predominantly artefact-bearing. The methodology should make this load-bearing distinction explicit in ODR-0001 §Rules and stop letting it sit implicit in the enum's description column. My vote is **BOTH-WITH-BOUNDARY**, and the boundary is the `kind` enum itself, made normative.

## Argument

### What is being conflated

The Gandon reading — "same shapes graph = one ODR" — collapses an *ontology* into its *encoding*. The collapse is the very mistake I have spent two decades trying to repair, beginning with the 2005 dissertation *Ontological Foundations for Conceptual Modeling with Applications* and continuing through the UFO programme (Guizzardi 2007; Guizzardi 2011; Guizzardi, Wagner, Almeida & Guizzardi 2015, "Towards Ontological Foundations for Conceptual Modeling: The Unified Foundational Ontology (UFO) Story", *Applied Ontology* 10(3–4)). My published claim, restated for this Council: a conceptualisation is a domain-level commitment about what *exists* and how it is identified. A serialisation — Turtle, OWL/RDF, SHACL, JSON-LD — is the *encoding* of that commitment in some representation language. Two commitments encoded in one artefact are still two commitments. One commitment encoded across two artefacts is still one commitment. The artefact and the commitment are not the same kind of thing.

Gruber's 1993 framing — "an ontology is an explicit specification of a conceptualization" — already names the distinction; Studer, Benjamins & Fensel 1998 refined it ("formal, explicit specification of a shared conceptualization"). My published critique of "pure URI-as-engineering" ontologies (most extensively in Guizzardi 2020, "Ontology, Ontologies and the 'I' of FAIR", *Data Intelligence* 2(1–2)) was that they encode editorial decisions about resource naming but defer the load-bearing question: what *kinds* of entities the URIs denote. A namespace policy is not yet an ontology. A graph-separation rule is not yet an ontology. A severity scheme over a shapes graph is not yet an ontology. They become ontology-adjacent the moment they touch identity, rigidity, dependence, or Relator structure — and only then.

The OntoClean discipline (Guarino & Welty 2002; Welty & Guarino 2001) was built to expose exactly this confusion in subsumption hierarchies: a class that *looks* clean in URI form may carry a meta-property contradiction (anti-rigidity stacked under rigidity; identity carried by an entity that cannot carry it) the URI never reveals. The artefact passes review; the commitment is broken. OntoClean is a methodology for recovering the commitment that the encoding hides. The Council should not, two decades later, repeat the encoding-as-ontology mistake at the *record* level after we have spent so long arguing it at the *class* level.

### The Q6 case re-stated in UFO terms

In Scope-Check 1 Q6, ODR-0010 reifies `opda:ValidationContext` as what UFO calls a **Relator**: an existentially-dependent entity that *mediates* between participating endurants — here, a `PDTF Transaction` and a `Validation Profile`. The reification was Guarino's accepted withdrawal condition on the Q5 deliberation; it is the move from a free-floating, conditionally-loaded constraint to a constraint *of a named context* with its own identity and lifecycle. That is an ontological commitment about what kinds of entities are in the domain. It is not "how the shapes graph is structured". It would remain the same commitment whether expressed in SHACL, in OntoUML, in Common Logic, or in a plain English specification — because what the commitment *commits to* is the existence and structure of a Relator, not the syntactic shape of any one encoding.

ODR-0013, by contrast, declares severity tiering — `sh:Violation` is reserved for identity-contract breaches and unprovenanced claims; `sh:Warning` for profile/disclosure gaps; `sh:Info` for absent optional attributes. The severity vocabulary itself is a regulatory judgement *over* violation reports, closer to what UFO would treat as a normative attribute (or, depending on how strict one is about UFO-A vs UFO-B/C alignment, a deontic Mode). It does not declare a new Kind; it does not introduce a new Relator; it does not reset identity. It assigns regulatory weight to constraint outcomes. The fact that this weight is *expressible* in the same SHACL artefact as the ValidationContext-Relator declaration does not make the two decisions one.

Two commitments. Same artefact. Folding them collapses the second commitment into the first's footnotes, which is exactly the kind of invisibility OntoClean (and twenty years of ontological-foundations work in OntoUML, Verdonck & Gailly 2016, Guizzardi-Almeida-Guizzardi 2020) was built to prevent.

### Where Gandon is right

I do not want to overstate the case. The Gandon reading has a real point. Many ODRs in this corpus are *predominantly* artefact-engineering decisions, and treating every one of them as a commitment-bearing record would over-formalise the editorial process. ODR-0004 (PDTF Ontology Foundation) is `kind: architecture` and it is artefact-engineering through and through — single `opda:` hash namespace, layer-segregated naming, three-graph separation, ontology-header pattern, generator-first policy, `dct:source` term-sourcing convention. These are editorial decisions about how to encode an ontology, not decisions about which Kinds the ontology contains. The genuine commitments in ODR-0004 (the layer-segregated naming distinguishing Sortal/Kind from Role/Phase) ride on top of and are deferred to ODR-0005, which is where the commitment-bearing record lives.

Similarly ODR-0001 is `kind: methodology` and it is pure protocol engineering — Council Hive pattern, panel composition, citation grounding, session document conventions. ODR-0003 is `kind: programme` and it is sequencing + work-breakdown — almost entirely editorial. Insisting that these records "really" record commitments would be Council theatre of the opposite kind: ontology-zealotry mistaking engineering documents for foundational ones.

So the Gandon reading is correct *for a substantial proper subset* of ODRs. What it is not correct *for* — and the gap the DCAP refuses to name — is the subset where the record's load-bearing content is a Kind / Role / Phase / Relator / Mode declaration or an identity-criterion commitment. ODR-0005 (Property & Land identity crux) is that subset's archetype. So is the pending ODR-0006 (Agents & Roles, where Person/Organisation Kinds, Seller/Buyer RoleMixins, Proprietor Role and Proprietorship Relator are committed). So is ODR-0011 (Enumerations) under the Scope-Check 1 Q3 amendment that each scheme declares its UFO meta-category. So is the ValidationContext-Relator part of ODR-0010.

### What reading the DCAP currently implies

Read the `kind` enum in the DCAP (lines 42–50) carefully:

| Value | Use for |
|---|---|
| `methodology` | Decisions about how decisions are made |
| `architecture` | Framework decisions (namespace topology, governance layers, validation severity scheme) |
| `pattern` | Reusable modelling conventions (SKOS for enumerations, identity criteria, role/view pattern) |
| `mapping` | Specific source→ontology mappings |
| `programme` | Workplans, dependency graphs, roadmaps |

Stare at this and the load-bearing distinction is right there in the description column but never named as such. `methodology`, `architecture`, and `programme` are all editorial/structural categories — they describe what an *artefact* governs. `pattern` and `mapping`, by contrast, describe what an *ontology* commits to: identity criteria, role/view distinctions, source→ontology *mappings*. The enum already encodes the boundary I am arguing for. It just refuses to say so. A reviewer encountering ODR-0010 today is given no methodological guidance on whether the ValidationContext-Relator declaration travels with `kind: architecture` (because the *artefact* is one shapes graph and a build pipeline) or whether it would more honestly travel separately as `kind: pattern` (because the *commitment* is a Relator).

This is the gap. The DCAP almost expresses my reading via the enum's description column but never makes the distinction normative. So in Q6, two trained ontologists — Gandon and myself — read the same DCAP and reach incompatible conclusions, because the DCAP genuinely does not say which we should apply.

### The truth-maker connection (relevant to A9 even though appended elsewhere)

In Scope-Check 1 Q7c I appended a Truth-Maker question to the future ODR-0016 (W3C VC / DID): *what makes true* a Verifiable Credential? PROV-O names a derivation; the VC names a cryptographic signature; the assurance level names a regulatory judgement. Three truth-makers, one Claim. The framing is the same one I deploy here. Truth-Maker theory (Guizzardi 2018, "Ontological Patterns, Anti-Patterns and Pattern Languages for Next-Generation Conceptual Modeling", *ER 2018 Keynote*; and Guizzardi & Guarino's foundational work on relational truth-making in DOLCE/UFO) asks: what is the entity in the world that *makes a sentence true*? An ontology commits to specific truth-makers — a Proprietorship Relator (not just a binary `hasProprietor` predicate) makes true the claim "X is the proprietor of Y" with its own identity, lifecycle, and dependencies.

If an ODR is recording the truth-maker — the existence and structure of the Relator, the Role, the Phase — then the record is an ontological commitment. If an ODR is recording the *vocabulary* used to *express* the truth-maker in a representation language — `sh:property`, `sh:in`, `dash:editor`, `dct:source` — then the record is an artefact-engineering decision. The two questions are coupled (you cannot express what you have not committed to) but they are not the same.

The boundary I am proposing for the DCAP is this: a record's `kind` declares which question it is primarily answering. `pattern` and `mapping` records answer "what truth-makers does the domain contain?". `methodology`, `architecture`, and `programme` records answer "how shall we engineer the artefacts that encode whatever truth-makers we commit to elsewhere?". A record that tries to answer both questions is two records.

### Q6 re-stated under the proposed boundary

Under the boundary I am proposing:

- ODR-0010's `opda:ValidationContext` reification — a Relator declaration — is `kind: pattern` content. It belongs in a pattern record (its own, or a sibling-let attached to 0010 by clear cross-cite).
- ODR-0010's SHACL build-step composition, graph-union mechanics, DASH editor mappings, `dct:source` chains — `kind: architecture` content. It belongs in an architecture record.
- ODR-0013's severity tiering — a regulatory-weight policy *over* violation reports — `kind: architecture` content, but a different architectural concern from 0010's build mechanics.
- ODR-0013's "every `sh:Violation` guards a Kind's identity contract" — a commitment that ties severity back to ODR-0005's IC. That is `kind: pattern` content. It belongs in or is cross-cited from ODR-0005 or a sibling pattern record.

This is not a proposal to *split* 0010 and 0013 into four records right now (that would itself be a different decision the panel did not vote on). It is a proposal to make the boundary visible so that *future* records — including the records following from ODR-0006 (Agents & Roles) and ODR-0011 (Enumerations, UFO-per-scheme) — know which side of the line they sit on. The current 0010/0013 split survives the boundary because the seam between them (Cagle's three-rule interface contract, recorded in Q6 verdict) is a cross-cite, and cross-cites are how artefact-records and pattern-records co-author a single deliverable without conflating their commitments.

## What I think the methodology should say (concrete amendment)

Proposed text to be added to ODR-0001 §Rules, after §Citation grounding and before §Cross-talk transport (i.e. as a new sub-section explaining what the records the methodology produces *are*):

---

### What an ODR records (load-bearing distinction)

An Ontology Decision Record records one of two kinds of decision:

1. **An ontological commitment** — a declaration about what *kinds* of entities the domain contains, what their identity criteria are, what Roles or Phases they pass through, what Relators bind them, what Modes they bear, what Qualities they particularise (UFO terminology used here as canonical foundational-ontology reference; equivalent DOLCE or BFO commitments are acceptable substitutes). Ontological commitments are language-independent: the same commitment may be encoded in OWL/RDFS/SHACL, in OntoUML, in Common Logic, or in plain prose, but the *commitment* persists across encodings. Commitments touch identity, rigidity, existential dependence, or Relator structure.

2. **An artefact-engineering decision** — a decision about how to structure, name, govern, sequence, or process the *artefacts* that encode the ontology: URI policies, namespace topology, graph separation, build pipelines, governance workflow, vocabulary catalogue, validation severity schemes, deliverable phasing. Artefact-engineering decisions are language-coupled: changing the representation language (e.g. moving from SHACL to a different shape language) would substantively change the decision. Artefact-engineering decisions do not touch identity, rigidity, dependence, or Relator structure — they touch encoding, presentation, and process.

The `kind` enum encodes this distinction:

| `kind` | Decision category | Load-bearing axis |
|---|---|---|
| `pattern` | **Ontological commitment** | Identity, rigidity, dependence, Relator/Role/Phase structure |
| `mapping` | **Ontological commitment** (source→ontology) | Identity preservation across re-expression |
| `architecture` | Artefact-engineering | URI policy, namespace, graph separation, validation severity, build pipelines |
| `methodology` | Artefact-engineering (of governance itself) | Protocol, panel, citation, document conventions |
| `programme` | Artefact-engineering (of workflow) | Sequencing, dependency, work-breakdown, MVP gates |

A record whose load-bearing content sits across the boundary is **two records**, joined by `depends-on` or cross-cite, never one record with two `kind` values (the enum is single-valued by DCAP). Where an architecture record's content includes a load-bearing ontological commitment (a Relator reification; an identity gate; a Kind/Role distinction), that commitment is recorded separately as a `pattern` record and cross-cited from the architecture record. The architecture record carries the *encoding mechanism*; the pattern record carries the *commitment*. The cross-cite is the seam, and the seam is honest.

**Worked examples** (from this corpus):

- **ODR-0005** (Property & Land identity crux) is `kind: pattern`. Its load-bearing content is the explicit `opda:Property` class, the DOLCE Endurant commitment, the identity criterion over demolition / subdivision / merger / first-registration, and UPRN's status as a contingent identifier under `prov:wasDerivedFrom`. These are ontological commitments. The SHACL/DASH key choice (`dash:uniqueValueForClass`) sits inside the record only as the *enforcement mechanism* for the IC commitment — the commitment, not the SHACL syntax, is the load-bearing content.

- **ODR-0004** (Foundation) is `kind: architecture`. Its load-bearing content is the single `opda:` hash namespace, layer-segregated naming (note: the naming convention *encodes* the Kind/Role distinction but does not *commit* to it — ODR-0005 carries that commitment), three-graph separation (class ⊥ shapes ⊥ annotation), ontology header pattern, generator-first policy, term-sourcing convention. These are encoding decisions over the artefacts that will carry the commitments. The Kind/Role distinction the naming reflects is a *commitment* recorded in ODR-0005; ODR-0004 records only the *encoding* of that distinction in URI form.

- **ODR-0010** (Overlay Profile Mechanism) is `kind: architecture`. The SHACL build-step composition, graph-union mechanics, `oneOf` → `sh:xone`, DASH editor mappings, `dct:source` chains are encoding decisions. The `opda:ValidationContext` reification is a Relator commitment that rides inside the architecture record because the panel kept them together for editorial convenience; under the boundary stated here, a future amendment may extract the Relator commitment to a sibling `pattern` record cross-cited from 0010. This is a known seam, recorded in Council Session 001 Q5 (Guarino's withdrawal condition).

- **ODR-0013** (SHACL Validation & Severity) is `kind: architecture`. The severity tiering, constraint mapping table, open-world/closed-world drift guard, annotation-graph separation are encoding decisions. The rule "every `sh:Violation` guards a Kind's identity contract or an unprovenanced claim" is a commitment that ties severity back to ODR-0005's IC; under the boundary here, that rule's *commitment content* is cross-cited from ODR-0005 (or its sibling), while the *severity vocabulary mechanism* stays in 0013.

- **ODR-0011** (Enumeration Vocabularies) is `kind: pattern` *under the Scope-Check 1 Q3 amendment* (each scheme declares its UFO meta-category — Quale-in-Region / Role label / Phase label / method-plan code). Without that amendment it would slip toward `kind: architecture` (just "JSON enums → SKOS"); with the amendment it carries a per-scheme ontological commitment and is squarely a pattern record.

**Enforcement.** During pre-flight scope check (§Pre-flight scope check), the Queen confirms the proposition's `kind` matches its load-bearing content per the table above. A mismatch is grounds for re-scope: a record whose declared `kind` is `architecture` but whose load-bearing content is a Relator declaration is mis-classified; the Queen recommends extracting the commitment to a `pattern` record. The reverse — a `pattern` record whose load-bearing content is editorial URI policy — is rarer but symmetric.

---

This amendment **lands inside ODR-0001's own `## Rules`** per §Self-amendment process, and lands inside the DCAP's `## Kind enum` section as a cross-cite. No sibling supersession record; the prior text is preserved in git history.

The amendment also has a small downstream consequence for the `## Rules` of every existing ODR: nothing needs editing immediately, but the *next* record drafted post-amendment is expected to honour the boundary. Records that genuinely straddle the line (the 0010 ValidationContext case being the canonical example) carry an inline `## References` note acknowledging the seam: "This record carries content that under ODR-0001 §What an ODR records would be extracted to a sibling pattern record; the seam is preserved here per Council Session 001 Q5 (editorial convenience), to be revisited if downstream queries require the extraction."

## Vote on the question

**BOTH-WITH-BOUNDARY.**

The boundary falls at the `kind` enum. `pattern` and `mapping` records record ontological commitments; `methodology`, `architecture`, and `programme` records record artefact-engineering decisions. Records whose content straddles the boundary are two records joined by cross-cite, not one record with two `kind` values. The boundary should be stated normatively in ODR-0001 §Rules, with worked examples, so that future drafters and reviewers apply it consistently and so that the Q6 disagreement does not recur in slightly different form at every subsequent session.

I do not vote ONTOLOGICAL-COMMITMENT — that would erase the legitimate role of architecture/methodology/programme records, which this programme genuinely needs. I do not vote ARTEFACT-ENGINEERING — that would erase the load-bearing commitment content of ODR-0005, ODR-0006, ODR-0011-as-amended, and the parts of ODR-0010 and ODR-0013 that touch identity. The honest verdict is the boundary one.

## Replies to anticipated objections

- **Gandon will say:** *"The boundary you propose is a distinction without a difference in linked-data practice: a SHACL shapes graph is the artefact, and the artefact is what gets versioned, dereferenced, queried, and shipped. Splitting one shapes graph across two ODRs adds editorial overhead and breaks the W3C URI-persistence discipline (a future query 'where is the ValidationContext defined?' may need to traverse two records). My reading keeps the artefact as the unit of decision, which is operationally cleaner."*

   My reply: the artefact-versus-commitment distinction is the same distinction your own W3C work has honoured wherever it touched foundational vocabulary. The PROV-O specification (Moreau, Lebo, Sahoo et al. 2013) is one artefact, but it encodes multiple commitments — `prov:Entity` and `prov:Activity` are different ontological categories with different identity criteria, not merely different sections of the same document. The W3C did not collapse them into "one PROV-O ODR" because they share a Turtle file. The Dublin Core Abstract Model (Powell et al. 2007) is similarly one artefact with multiple commitments. Treating the shapes graph as the unit of decision works for routine constraint additions; it breaks when the content includes a commitment of the gravity of a Relator reification. The cross-cite overhead you cite is real but cheap — far cheaper than the alternative (an invisible commitment buried inside an architecture record), which is the cost OntoClean was built to make visible. Your operational cleanness is bought by hiding the second commitment; that is the trade I cannot accept.

- **Guarino (DA) will say:** *"You are over-claiming what the `kind` enum can carry. The DCAP enum is administrative metadata; it was never designed to encode the ontological/encoding boundary. If the boundary is load-bearing, it needs its own dedicated apparatus — a separate `commitment-axis` field, perhaps — not an existing enum repurposed. And your worked examples are too generous: ODR-0005 itself contains substantial encoding content (SHACL/DASH key mechanics, the `prov:wasDerivedFrom` succession pattern), and you have not shown why those don't pull it back toward architecture-with-some-commitment-content rather than the pure pattern record you claim."*

   My reply: the boundary does not need new apparatus when the existing enum already encodes it. Your concern that the enum is "administrative metadata" is precisely my concern in reverse — it has been treated as administrative when its content is ontological, which is why Q6 ran into the wall it ran into. Making the boundary normative does not invent new structure; it makes existing structure honest. On ODR-0005: yes, it contains encoding content (the SHACL/DASH key mechanism), but the encoding content sits *in service of* a commitment (the IC gate). The test under the proposed boundary is not "does the record contain any encoding content" — every record does — but "what is the *load-bearing* content the record exists to settle". For ODR-0005 that is unambiguously the IC commitment over Endurants with hard cases; the SHACL/DASH mechanics are the enforcement of the commitment, recorded inside the same record because the enforcement is the discipline that *makes the commitment checkable*. The proposed boundary survives this case: ODR-0005 is `pattern` because the commitment is the load-bearing axis. A counter-example record where SHACL mechanics dominate and IC content is incidental would correctly be `architecture` — and that is the discrimination the boundary lets us make. Your OntoClean has always required us to ask "what is the entity *for*?". The proposed boundary asks the same question of records.
