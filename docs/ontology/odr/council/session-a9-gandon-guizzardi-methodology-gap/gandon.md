# Gandon — Position on the A9 methodology gap

## Position summary (one paragraph)

An ODR records a decision about a **linked-data artefact** — a namespace, a URI policy, a graph (TBox / shapes graph / annotation graph), a profile, a dereferenceable resource on the Web — and the *ontological commitments* surface as constraints **inside that artefact**. The artefact is the unit of decision because the artefact is what we publish, version, dereference, and link to; the commitments live or die with the artefact that carries them. The boundary I will defend is therefore not "artefact-engineering OR ontological commitment", but rather: **artefact identity is the test** — same shapes graph, same `opda:` namespace, same URI policy, same `owl:versionIRI` lineage → one ODR; the ontological commitments inside that artefact, however many they number, are recorded in `## Rules` as constraints of that artefact, not as separate records. Where two ontological commitments require *separately publishable, separately dereferenceable, separately versionable* artefacts, they become two ODRs; where they share the artefact, they share the ODR.

## Argument

### 1. What an ontology is, on the Web

I have spent twenty years arguing one position, articulated across W3C work [RDF 1.1 Concepts §1.5; RDFa 1.1 Primer; SPARQL 1.1 Query §2] and the WIMMICS programme: an ontology on the Web is a **resource**. It has a URI. It dereferences. It has an `owl:versionIRI`. It composes with other resources via `owl:imports`, named graphs, or — in the SHACL case — `sh:targetClass`. The "Linked Data Principles" [Berners-Lee 2006; codified in *Linked Data: Evolving the Web into a Global Data Space*, Heath & Bizer 2011, Ch. 2 "Principles of Linked Data"] are four engineering rules: use URIs; use HTTP URIs; when someone dereferences a URI, provide useful information using the standards (RDF, SPARQL); include links to other URIs.

These four rules are not ornamentation around an "underlying" ontological commitment. They *are* the commitment that makes the ontology a thing on the Web rather than a file on a hard drive. The ontology is not its propositional content stripped of the URIs that carry it; the ontology *is* the URIs, the graphs, the dereferenceable surface, with the propositional content as the payload.

This is the W3C lineage [GRDDL WG 2007 — "Gleaning Resource Descriptions from Dialects of Languages", W3C Rec.; Gandon ed.] that I co-authored and defended. GRDDL's whole point was that an ontology is an **act of publishing** — a `link rel="transformation"` declaring that *this* document, at *this* URI, with *this* GRDDL transformation, yields RDF. The engineering act is the ontological act. There is no GRDDL transformation independent of the document it gleans, just as there is no ontology independent of the graph that carries it.

### 2. What an ODR records, on this reading

The ODR is the record of a decision **about an artefact**. ODR-0004 ("PDTF Ontology Foundation") is the cleanest exemplar: it decides the namespace (`opda:` HASH), the layer-segregated naming policy, the three-graph separation (OWL ⊥ SHACL ⊥ annotation), the ontology-header convention (`vann:preferredNamespacePrefix`, `owl:versionIRI`, `dct:title`/`creator`/`issued`/`modified`, `sh:prefixes` declaration node), and the dereferenceability commitment ("don't ship URIs you don't serve"). These are five distinct decisions in propositional content — but they are *one* artefact-engineering decision, because they jointly define the substrate every downstream module inherits. The unit of the decision is the substrate, not the propositions.

ODR-0010 (Overlay Profile Mechanism) is the same. It decides:

- Overlays are SHACL profile graphs over a fixed TBox.
- Profile composition is a documented build-step graph-union.
- Conditional requirement is reified as `opda:ValidationContext`.
- DASH drives form rendering.
- `dct:source` carries traceability to form questions.
- A no-identity-override SHACL gate.
- Three-graph separation maintained.

Seven propositions, one artefact: the BASPI5 SHACL profile graph at `…/profiles/baspi5/`. This is one ODR because the artefact it governs is one.

ODR-0013 (SHACL Validation & Severity) decides:

- A severity tier (Violation / Warning / Info) tied to regulatory weight, not schema nesting.
- An open-world/closed-world drift guard between OWL cardinality and SHACL count.
- A constraint mapping from JSON Schema constructs to SHACL.
- The annotation graph keyed to shape IRIs.

Four propositions, one artefact: the base shapes graph and its severity policy. Again, one ODR.

### 3. The Q6 question, on this reading

Are ODR-0010 and ODR-0013 *one artefact or two*? My Q6 vote was COMBINE. The reasoning was load-bearing on the artefact test:

- The overlay profile graph (ODR-0010) and the base shapes graph (ODR-0013) **share** the `opda:` namespace, the `dct:source` convention, the no-identity-override gate, the annotation-graph keying, the DASH rendering vocabulary. They are slices of one shapes-graph artefact, distinguished by which `sh:targetClass`/`sh:targetNode` is active. The "interface contract" Cagle drew up (three rules of `sh:in` semantics, `sh:Violation` floor, no-identity-override) is the giveaway: those three rules belong to *one shapes graph*, not to two graphs cross-citing each other. A cross-cite is a workaround for an artefact cut that doesn't match the artefact.
- The severity tiering (Violation/Warning/Info) is applied **inside** the same shapes graph that carries the overlay profile slices. A profile shape's severity is set per-shape; the tier is not a separate artefact.
- The `opda:ValidationContext` reification (ODR-0010) and the regulatory severity (ODR-0013) are both *properties of the shapes graph* — they are how the graph is structured, not what it commits ontologically beyond the graph.

The 7-2 vote went against me. I accept the verdict; my job here is not to relitigate Q6 but to clarify the methodology gap the dissent revealed.

### 4. Where Guizzardi's reading has a point

I will not pretend Guizzardi is wrong about everything. He is right that the *propositional content* of a SHACL shape can express what UFO would call a Relator decision (e.g. "a Seller exists only relative to a Transaction" — encoded as `sh:Violation` on a `Seller` with no `Transaction`), and that this is a different *kind* of statement from a regulatory-severity decision ("a missing sensitivity-marker on personal data is `sh:Warning`, not `sh:Violation`"). These are different *kinds* of commitment.

But here is the rub: **they are commitments expressed by constraints in one shapes graph**. The shapes graph carries both kinds. The Relator-class commitment is a `sh:Violation` floor declared on a Kind; the regulatory-weight commitment is a per-shape `sh:severity` assignment. They are co-resident in the same RDF graph, share the same prefixes, are targeted by the same `sh:targetClass`, and are dereferenced from the same URI.

Guizzardi's reading would split them into two ODRs because they are two *commitments*. My reading keeps them in one ODR because they are two commitments in one *artefact*. The methodology must choose between these unit-of-decision logics. I argue: choose the artefact, because the artefact is what we publish, what we version, what we link to, and what consumers dereference.

### 5. What the DCAP currently implies (and why I disagree)

The DCAP profile's `kind` enum reads — in its current form — toward Guizzardi:

| Value | Use for |
|---|---|
| `methodology` | Decisions about how decisions are made |
| `architecture` | Framework decisions (namespace topology, governance layers, validation severity scheme) |
| `pattern` | Reusable modelling conventions (SKOS for enumerations, identity criteria, role/view pattern) |
| `mapping` | Specific source→ontology mappings |
| `programme` | Workplans, dependency graphs, roadmaps |

`pattern` and `mapping` lean ontological-commitment. `pattern` is "identity criteria, role/view pattern" — these are commitments. `mapping` is a propositional statement about source → ontology fragment. Neither names the artefact that carries the commitment.

`architecture` is the closest to my reading. ODR-0004 is `architecture`; ODR-0010 and ODR-0013 are both `architecture`. The `architecture` category names the substrate decision (namespace, graph topology, severity scheme) — i.e. the artefact-engineering category. **My amendment to the methodology is, in the first instance, to recognise that `architecture` is doing the load-bearing work** and to clarify the boundary between `architecture` (artefact-engineering) and `pattern` (propositional commitment that can be re-instantiated across artefacts).

The implicit Guizzardian read shows up in the Q6 dissent recorded above: "two ontological commitments expressible in SHACL but distinct in their ontology." That sentence treats the *ontological commitment* as the unit. It is consistent with the `pattern`-leaning DCAP read. I want it on the record that the DCAP did not, in fact, ratify this. The DCAP says "the ODR contains the **decision** and the **rules** that decision produces" (§Purpose) — and a decision, in the Web-architecture sense I have defended for two decades, is a decision *about a resource*.

### 6. Why this matters beyond Q6

This is not a cosmetic squabble. The artefact-vs-commitment test cascades:

- **Versioning.** An ODR has an `owl:versionIRI` analogue in its lineage of edits. If the ODR records an artefact, the version increments with the artefact. If the ODR records a commitment, the version increments with the commitment — which is much harder to define ("when does a UFO commitment change?").
- **Dereferenceability.** If the ODR records an artefact, the ODR cites a URI that dereferences (`…/profiles/baspi5/`). If the ODR records a commitment, there may be no single URI to dereference — the commitment is realised across multiple files.
- **Supersession.** The DCAP says `supersedes` is intra-ODR; partial supersession is recorded inside `## Rules`. If the unit is the artefact, partial supersession is easy: ODR-N's Rules amend ODR-M's Rules for the parts of the artefact ODR-N replaces. If the unit is the commitment, partial supersession requires per-commitment versioning, which the DCAP does not provide.
- **Council scope.** Under my reading, "one shapes graph = one council session" is a clean rule. Under Guizzardi's reading, "one ontological commitment = one council session" would force separate sessions for the Relator-class severity decision and the regulatory-severity decision even when they land in the same shapes graph. The current Council programme (13 follow-up sessions, scope-check-1) is implicitly artefact-cut; making it commitment-cut would re-shape it materially.

### 7. The specific reading I would have the DCAP adopt

The ODR records a decision about a **named linked-data artefact** — a namespace, a graph, a profile, a published vocabulary — and the artefact identity is the criterion for whether two propositional decisions belong in one ODR or two. The artefact identity test is operational:

1. Do the two decisions land in the *same dereferenceable resource* (same URI, same `owl:versionIRI` lineage)?
2. Do they share the same prefixes and the same import/target graph topology?
3. Would a Web consumer encounter them through one `HTTP GET` or two?

If the answer to all three is "same", the decisions belong in one ODR. If the answer to any is "different", they belong in separate ODRs.

The *ontological commitments* are the content of `## Rules`. They are not the unit. A single ODR's `## Rules` can carry multiple commitments — and ODR-0004's already does (five distinct rules; one artefact).

## What I think the methodology should say (concrete amendment)

I propose the following amendment land as new text in ODR-0001's §Rules, immediately after §Citation grounding and before §Cross-talk transport. This is a Reduced-Council amendment per ODR-0001 §Self-amendment process. The amendment is labelled A9 in the meta-Council amendment series.

> ### Unit of decision (artefact-cut)
>
> An ODR records a decision about a **named linked-data artefact** — a namespace, a graph (TBox / shapes graph / annotation graph), a SHACL profile, a published vocabulary, a programme of artefacts, or the methodology itself. The artefact is the unit of decision because the artefact is what is published, versioned, dereferenced, and cited.
>
> The propositional content of the decision — the ontological commitments, modelling conventions, severity assignments, or mapping rules — lives **inside the artefact** and is recorded in `## Rules`. A single ODR's `## Rules` MAY carry multiple commitments, provided they are commitments of one artefact.
>
> **Artefact identity test** — used to decide whether two propositional decisions belong in one ODR or two:
>
> 1. **Same dereferenceable resource.** Do the two decisions land in the same URI / `owl:versionIRI` lineage? (Same file under `source/03-standards/ontology/`, same `…/profiles/<name>/` profile graph, same `…/vocab/<name>/` concept scheme.)
> 2. **Same prefix and target topology.** Do they share the same namespace prefixes, the same `sh:targetClass`/`owl:imports` graph topology, and the same annotation-graph keying convention?
> 3. **Same dereference act.** Would a Web consumer encounter both through a single `HTTP GET` or two?
>
> "Same" on all three → one ODR. "Different" on any → separate ODRs.
>
> **Where a propositional commitment is re-instantiable across multiple artefacts** — e.g. an identity-criterion convention applied to several Kinds, a SKOS-for-enumerations convention used across multiple shapes graphs — the commitment is recorded as a `kind: pattern` ODR and *cited* by the artefact ODRs that realise it (via `implements`). The `pattern` ODR records the convention abstracted from any specific artefact; the realising ODRs cite it as their authority.
>
> **`kind` enum semantics (clarification):**
>
> - `methodology` — decisions about how decisions are made (the artefact is the methodology itself).
> - `architecture` — decisions about the substrate of one or more artefacts (the artefact is the namespace policy, the graph topology, the severity scheme).
> - `pattern` — re-instantiable propositional commitments cited by `architecture`/`mapping` ODRs (the artefact is the convention, abstracted).
> - `mapping` — decisions about a specific source-to-ontology fragment (the artefact is the mapping itself, typically a per-clause realisation).
> - `programme` — decisions about a workplan or roadmap (the artefact is the programme).
>
> A decision that produces both substrate change AND a re-instantiable convention SHOULD be split: the substrate change becomes an `architecture` ODR; the convention becomes a `pattern` ODR cited via `implements`.
>
> **Rationale.** A linked-data artefact is a resource on the Web [Linked Data Principles, Berners-Lee 2006; *Linked Data: Evolving the Web into a Global Data Space*, Heath & Bizer 2011, Ch. 2]. The Web's identity discipline — URIs, dereferenceability, `owl:versionIRI` — is the discipline that makes the ontology durable across consumers and time. The ODR records the decision about that resource; the propositional commitments are what the resource carries.

This is the minimum amendment. It clarifies the implicit Guizzardian read in the current DCAP without rewriting the profile, and it gives the Council programme a reproducible rule to apply when "is this one decision or two?" arises again.

## Vote on the question

**ARTEFACT-ENGINEERING.**

The ODR records an artefact-engineering decision. The ontological commitments are the content the artefact carries; they are recorded in `## Rules`, not as separate ODRs unless they are themselves re-instantiable across multiple artefacts — in which case they become `kind: pattern` ODRs cited by the artefact ODRs that realise them.

If forced into the BOTH-WITH-BOUNDARY formulation: the boundary is the artefact identity test stated above. An ODR records an artefact-engineering decision *primarily*; the ontological commitments it records are commitments *of that artefact*. Where a commitment is re-instantiable across artefacts, it earns its own ODR (`kind: pattern`); where it is specific to the artefact, it stays inside the artefact's ODR.

## Replies to anticipated objections

**Guizzardi will say:** "The Relator-class severity decision and the regulatory-severity decision are two ontological commitments. They have different formal characterisations in UFO — one is about the founding-Relator condition on a Role; the other is about the regulatory weight a violation carries. Treating them as one decision because they co-reside in one SHACL file is a category error: the file is incidental; the commitments are not."

**My reply.** I do not dispute that the two commitments have different formal characterisations. I dispute that the *unit of decision* is the commitment. The unit of decision is the artefact because the artefact is what we publish [Linked Data Principles, rule 2: "Use HTTP URIs so that people can look up those names"]. If Guizzardi's position were correct, we would also have to split ODR-0004 — which carries five distinct rules (namespace, naming, graph separation, header, term-sourcing) — into five ODRs, one per rule. The fact that no one in this Council has proposed splitting ODR-0004 is the tell: the Council intuitively applies the artefact-cut at the foundation layer and only argued the commitment-cut at the SHACL layer. The principle should be consistent across layers.

The Guizzardian framework is right *about the propositional content* and belongs in `## Rules`. The ODR-as-artefact-record is right *about the unit of publication* and belongs in the DCAP profile. Both can be true at once; they are answering different questions.

**Guarino (DA) will say:** "Gandon's position dissolves the ontological backbone into a publishing convenience. If the ODR records 'the artefact', then an artefact whose internal commitments are inconsistent — e.g. a shapes graph that declares one identity criterion in its severity policy and a different one in its constraint mapping — would still be 'one ODR' under Gandon's test. That is unacceptable for an ontology programme: identity criteria must be the unit of accountability."

**My reply.** Guarino is right that identity criteria need to be accountable, but the accountability does not require a separate ODR per identity criterion. Identity criteria are recorded in `kind: pattern` ODRs (e.g. ODR-0005 already does this — "Property & Land: The Identity Crux" is a `pattern` ODR that fixes the IC for Property and is cited by the artefact ODRs that realise it). The pattern → artefact relationship is exactly the `implements` link the DCAP already provides. Under my amendment, this becomes explicit:

- ODR-0005 (`kind: pattern`) — the IC convention for Property, abstracted.
- ODR-0004 (`kind: architecture`) — the foundation artefact, which `implements` ODR-0005's IC in its `## Rules`.
- ODR-0010 / ODR-0013 (`kind: architecture`) — the profile/shapes-graph artefacts, which `implements` ODR-0005's IC in their no-identity-override gates.

The IC is accountable because it has its own ODR (`pattern`). The artefact is accountable because it cites the IC explicitly (`implements`). Two units of accountability, two `kind` values, and a typed relation linking them. The methodology does not need a third unit.

Guarino's concern about inconsistency *within* an artefact is real but not new: it is the job of `## Rules` to be self-consistent, and of `odr-review` to lint that consistency. If ODR-0010 declares an IC override and ODR-0013 forbids it, that is a within-`## Rules` inconsistency in a *combined* artefact ODR — and the lint would catch it. If they are kept separate (as the Q6 vote ruled), the inconsistency is across ODRs and the lint would still catch it via `depends-on` resolution. The unit-of-decision question is orthogonal to the consistency-lint question.

**Allemang will say:** "Gandon's rule is fine for the SHACL and namespace cases, but what about a `kind: pattern` ODR like ODR-0005? That record's 'artefact' is the IC convention itself — but conventions are not dereferenceable resources in the strong sense Gandon means. Does the artefact-cut work for `pattern` ODRs?"

**My reply.** Yes, with a clarification I would write into the amendment. A `pattern` ODR's "artefact" is the convention as a named thing — citeable, version-stamped, re-instantiable. It does not need to dereference to a SHACL graph the way an `architecture` ODR does; the `pattern` ODR itself (the markdown record) is the dereferenceable form. The artefact-cut still applies: two distinct conventions → two `pattern` ODRs; one convention with multiple rules → one `pattern` ODR. The dereference test for `pattern` is "is the convention citeable as one named thing by the realising ODRs?" — and that question is answered the same way as the URI test for `architecture` ODRs.

**Hendler will say:** "Your reading makes the `kind: pattern` category the lever for ontological commitments, but then the boundary between `pattern` and `architecture` is doing all the work — and the DCAP doesn't define it clearly. What stops a drafter from filing every ontological commitment as `architecture` (because it touches some shapes graph) and never producing a `pattern` ODR?"

**My reply.** The artefact-cut amendment defines the boundary operationally: `architecture` is the substrate of one or more specific artefacts; `pattern` is the re-instantiable convention abstracted from any specific artefact. The test for `pattern` is "would this convention apply to multiple artefacts, or only to this one?" An identity criterion for Property applies to ODR-0004's foundation, ODR-0010's profiles, ODR-0013's shapes graph — three artefacts. It earns its own `pattern` ODR. The `opda:ValidationContext` reification applies to one profile mechanism (ODR-0010); it stays inside ODR-0010 as a rule, not as a separate `pattern` ODR.

The discipline I would write into the amendment: when a rule in an `architecture` ODR's `## Rules` is cited by another `architecture` ODR, that is the signal that the rule should have been promoted to a `pattern` ODR. The `odr-review` lint should flag cross-`architecture` rule-borrowing as a candidate `pattern` extraction.

**Davis will say:** "This whole thing is editorial — you said so yourself in session-001 Q3. Why are we standing up a methodology amendment for what is, in the end, a question of where to draw the cut?"

**My reply.** Davis is half-right. Where to draw the cut for *this* programme is editorial. But *the rule for drawing cuts* is methodological — because it will be applied to every future cut, and consistency across cuts is what makes the corpus navigable. The current implicit rule (Guizzardian commitment-cut at the SHACL layer; artefact-cut at the foundation layer) is incoherent and produces cross-cite workarounds (Cagle's three-rule interface contract in Q6). The amendment is small; the payoff is a corpus whose cuts are reproducible.

**Baker will say:** "I am sympathetic to the artefact-cut for the SHACL and namespace cases, but vocabulary governance — the world I work in [DCMI Abstract Model, Dublin Core Application Profiles] — has long treated the concept scheme and the application profile as separate artefacts. The application profile constrains the use of a vocabulary; the vocabulary itself is a different artefact. Your rule risks collapsing these in ways my world would not accept."

**My reply.** Baker is correct that DCAP (Dublin Core Application Profile) treats the vocabulary and the profile as separate artefacts, and I would not change that. The artefact-cut amendment preserves this exactly: the SKOS concept scheme (`kind: pattern` or its own `kind: architecture`, depending on how the OPDA WG decides — see ODR-0011) is a different artefact from the SHACL profile that uses it (`kind: architecture` per ODR-0010). They have different URIs, different `owl:versionIRI` lineages, different prefixes. The artefact identity test gives the right answer: two artefacts → two ODRs.

What the amendment changes is the *boundary inside the SHACL profile artefact* — Q6 asked whether overlay-profile mechanism and severity tiering should be one record or two, given they share the shapes graph. My answer is one; the Council voted two; the methodology should make the rule explicit either way. I am proposing the rule that matches Web architecture; if the Council prefers Guizzardi's rule, the methodology should still say so explicitly, not leave it implicit.

## References

- Berners-Lee, T. (2006). *Linked Data — Design Issues*. W3C. <https://www.w3.org/DesignIssues/LinkedData.html>
- Heath, T. & Bizer, C. (2011). *Linked Data: Evolving the Web into a Global Data Space*. Synthesis Lectures on the Semantic Web, Morgan & Claypool. Ch. 2 "Principles of Linked Data".
- W3C (2014). *RDF 1.1 Concepts and Abstract Syntax*. W3C Recommendation. §1.5 "RDF graphs".
- W3C (2013). *SPARQL 1.1 Query Language*. W3C Recommendation. §2 "Making Simple Queries".
- W3C (2013). *RDFa 1.1 Primer*. W3C Working Group Note.
- W3C (2007). *Gleaning Resource Descriptions from Dialects of Languages (GRDDL)*. W3C Recommendation. Gandon, F. & Hawke, S. (eds.).
- WIMMICS team, Inria & I3S — Web-instrumented Man-Machine Interactions, Communities and Semantics. Research programme description; published outputs on RDF-native architectures and reasoning over linked data.
- ODR-0001 §Citation grounding (this methodology) — for the published-source standard each claim above is grounded against.
- ODR-0004 (PDTF Ontology Foundation) — the foundation artefact this position cites as an `architecture` exemplar.
- ODR-0005 (Property & Land: The Identity Crux) — the `pattern` exemplar for the Guarino-objection reply.
- ODR-0010 / ODR-0013 — the records that triggered Q6 and this methodology gap.
- Scope-check-1 Q6 (`docs/ontology/odr/council/scope-check-1-programme.md`, lines 157–187) — the deliberation that surfaced this gap.
