# Allemang — Devil's Advocate on S006

## DA framing

The panel will reach for UFO-purity on this question — Guizzardi will press the Kind/RoleMixin/Role layering as a clean three-tier discipline; Kendall will press FIBO's multi-identifier pattern for Organisation; Cagle will push a Person + Organisation succession SHACL-AF rule (a fifth citing site of ODR-0017's pattern); Evans+Vernon will name the bounded-context split between asserted-capacity and evidenced-authority. Every position is defensible *in isolation*. My job as DA is to ask the question none of them ask of themselves: **does each modelling commitment have a named consumer query, SHACL validation case, or lifecycle event that would fail without it?** That is the discipline of *Semantic Web for the Working Ontologist* 3rd ed. Ch. 6 ("Minimal modeling") and Ch. 13 ("Linked Data in the Real World") — an ontology models the *minimum* needed for the use cases; every distinction must earn its keep.

S006's stub adds significant modelling surface: Person Kind + Organisation Kind + RoleMixin Seller/Buyer + sortal Roles per-Kind (PersonSeller, OrganisationSeller, etc.) + Proprietor Role + Proprietorship Relator + asserted-capacity vs evidenced-authority split. Each commitment is theoretically grounded; together they push the modelling cost up to the point where the next maintainer cannot trace each commitment to a named consumer. That is the failure mode this DA position is built to resist.

The S001 Q3 framing carries: the partition is by ontological concern (FIBO modules reconciled with UFO Kind/Role/Relator layering); the Address class is shared with ODR-0005 (now routed to ODR-0015). The S005 precedent matters: ODR-0005 established the per-kind A9 discipline (UFO category + IC over named hard cases + artefact realisation), conceded UPRN-succession as a SHACL-AF rule materialisation (Cagle's fourth citing site, now ODR-0017), and routed Address-modelling to ODR-0015. S006 inherits that discipline; it does not get to re-litigate it. But S006 also does not get a *free pass* to mint distinctions that the S005 precedent did not establish.

The DA frame I bring: each new commitment must trace to a consumer query / SHACL case / lifecycle event. *Working Ontologist* 3rd ed. Ch. 6 §"Minimal modeling": don't mint distinctions you don't operationalise. Ch. 13 §"Linked Data in the Real World": adopt external standards only when their full machinery serves a named OPDA use case. Those two principles set the bar for every per-question position below.

## Per-question DA positions

### Q1 — Person/Organisation identity criteria

**DA position:** CONCEDE the Substance Kind framing for both `opda:Person` and `opda:Organisation` — this is settled by the S005 precedent (Person and Organisation are Kinds in the UFO Substance category, like `opda:Property` and `opda:LegalEstate`). CONCEDE Kendall's FIBO multi-identifier pattern for Organisation: companies-house-number + LEI + VAT-number + jurisdiction-of-registration as alternative identifiers checked by `dash:uniqueValueForClass` per identifier-scheme, with `opda:identifiesSameOrganisation` for SHACL co-reference (mirrors the S005 Property pattern).

**Light attack on Q1 Person IC complexity.** The Person IC must combine `dateOfBirth` with a state-issued-ID-set (passport / driving-licence / NI-number / NHS-number per jurisdiction). That is FIBO-style multi-identifier, defensible. But the SHACL-AF rule Cagle will propose to materialise name-change succession (the fifth citing site of ODR-0017's pattern — Person renaming on marriage, deed poll, statutory declaration) is over-engineering unless a named consumer query needs the succession chain. *Working Ontologist* 3rd ed. Ch. 6 §"What modelling earns its keep": a rule that materialises an inference no consumer reads is decoration.

**Withdrawal condition:** the panel names a consumer query of the form *"find all records of Person X across name-change events"* where the query produces a wrong answer-set under the no-succession-rule alternative AND a right answer-set under Cagle's proposed succession rule. KYC pipeline traversing pre-and-post-name-change records → conceded if Cagle names the specific pipeline (which AML programme, which regulator's audit trail, which SAR/STR template field).

**Per-voice vote: CONDITIONAL FOR.** Concede Person/Org Kind framing + FIBO multi-identifier pattern. Light attack on name-change succession rule; withdrawal on named consumer query.

### Q2 — RoleMixin vs Role (PRIMARY ATTACK)

**DA position (PRIMARY ATTACK):** Strong attack on the UFO RoleMixin distinction as load-bearing in `## Rules`. My S005 Q5 framing carries directly: *show me a SPARQL query or SHACL validation case where RoleMixin-Seller-played-by-Person-OR-Organisation produces a different answer than separate PersonSeller + OrganisationSeller sortal Role classes.*

The stub commits to: `opda:Seller`/`opda:Buyer` as RoleMixins played by Person *or* Organisation, with sortal sub-roles (`PersonSeller`, `OrganisationSeller`) carrying identity. The UFO theory here is clean: a RoleMixin is anti-rigid across multiple sortals; the sortal Role specialises it per Kind. But operationally — what does the RoleMixin layer *do* that the sortal layer alone does not?

**Three named consumer queries I can construct against PDTF v3:**

1. *"Find all Sellers in this transaction regardless of Person/Organisation type."* Under the RoleMixin model: `?seller a opda:Seller .` Under sortal-only: `{ ?seller a opda:PersonSeller } UNION { ?seller a opda:OrganisationSeller }`. Both produce the same answer-set. The RoleMixin is a shorter query; that is not the test of an ontology.

2. *"Validate that every Seller is played by a Person or Organisation."* Under the RoleMixin model: `sh:targetClass opda:Seller; sh:property [ sh:path opda:playedBy; sh:or ( [ sh:class opda:Person ] [ sh:class opda:Organisation ] ) ]`. Under sortal-only: `sh:targetClass opda:PersonSeller; sh:path opda:playedBy; sh:class opda:Person` + parallel shape for OrganisationSeller. The sortal-only form is more verbose but produces the same validation verdict; the RoleMixin form is theoretical-clean.

3. *"Find a Seller who is both a Person AND an Organisation."* Under either model: impossible (Person and Organisation are disjoint Substance Kinds; their role-players cannot overlap). The RoleMixin distinction does not create or detect this case — Kind disjointness does.

I cannot construct a fourth query where the RoleMixin layer is *load-bearing* — where the answer-set or validation verdict differs between the two models. *Working Ontologist* 3rd ed. Ch. 6 §"Distinctions that earn their keep": a distinction earns its keep when a SHACL shape would treat the two cases differently. The RoleMixin distinction here does not.

**Engagement with Guizzardi.** Guizzardi 2005 Ch. 8 §"RoleMixin" defines the construct precisely as a non-sortal Role that subsumes multiple sortals. The construct is theoretically necessary in UFO because UFO insists on the sortal/non-sortal boundary as a meta-category distinction. But the operational test — *what shape, query, or lifecycle event fires differently because of the distinction* — is not in Guizzardi 2005 either. The RoleMixin earns its keep in UFO theory; it does not automatically earn its keep in OPDA's TBox.

**Withdrawal condition:** the panel names EITHER (a) a specific SHACL validation case that fires a violation under RoleMixin and passes silently under sortal-only (or vice versa) — i.e. a class-choice that affects validation correctness, OR (b) a specific SPARQL query that produces a different answer-set under RoleMixin vs sortal-only, where the RoleMixin answer is the right answer for the consumer, OR (c) a specific lifecycle event where the RoleMixin layer captures information the sortal layer alone loses. The query / shape / event must be named explicitly with SPARQL or SHACL text reviewable in the synthesis; "UFO says so" is not consumer-query evidence.

**Per-voice vote: AGAINST RoleMixin commitment in `## Rules` + withdrawal condition stated.** AGAINST the load-bearing RoleMixin layer; withdrawal on named consumer query / shape / event.

### Q3 — Proprietorship Relator

**DA position:** CONCEDE in principle — UFO's Relator pattern is the right move for joint-tenancy (a single Proprietorship Relator binding multiple Proprietor Roles played by multiple Person/Organisation bearers, with `opda:hasProprietor` cardinality ≥ 1). The pattern handles tenants-in-common, joint tenants, and corporate proprietorship cleanly. Guizzardi 2005 Ch. 7 §"Relator" supports this.

**Mild attack on Relator URI dereferenceability.** The Relator pattern as a TBox commitment is fine; the operational question is whether `<opda:proprietorship/title-NK112233>` is a *dereferenceable* URI in OPDA scope. Does any consumer fetch the Relator independently of fetching the title? *Working Ontologist* 3rd ed. Ch. 13 §"What gets a URI": URIs earn dereferenceability when a consumer-side request would target the resource directly. If no consumer queries `?proprietorship opda:hasProprietor ?p` without first traversing from a title or a property, the Relator is an in-memory join structure, not a Substance individual in the OPDA published namespace.

**Engagement with panel positions.** The S005 precedent for Relator is `opda:RegisteredTitle` (which the panel kept distinct from `opda:LegalEstate` per Hendler/Guizzardi); the dereferenceability question was settled there because HMLR's title-register provides the canonical URI. For Proprietorship, the question is open: does HMLR (or any consumer) dereference the joint-tenancy as a thing, or only the title that records it?

**Withdrawal condition:** the panel names a consumer (HMLR, conveyancer pipeline, AML programme, court process) that dereferences the Proprietorship Relator URI without first traversing from a title or a property. If named, concede Relator as a Substance individual; if not, demote to an in-memory join structure with `opda:hasProprietor` as a property directly on the title (no separate Relator class).

**Per-voice vote: CONDITIONAL FOR.** Concede Relator pattern. Mild attack on URI dereferenceability; withdrawal on named consumer.

### Q4 — Capacity vs Authority (STRONG SUPPORT)

**DA position:** STRONG SUPPORT for two predicates. The bounded-context split Evans+Vernon will name is right: `opda:assertedCapacity` (SKOS-typed; what the participant *claims*) vs `opda:evidencedAuthority` (link to PROV-O evidence; what is *substantiated*). The split mirrors the S001 Q3 partition (by ontological concern, not by aggregate page) — *capacity is a claim* (Agents & Roles), *authority is an evidence link* (Claims & Evidence, ODR-0009). The two predicates live in different ontological concerns; conflating them into one collapses a founding legal grant into a free-text enum (exactly the PDTF v3 defect ODR-0006 §Context names).

No DA attack. CONCEDE.

**Per-voice vote: FOR two-predicate capacity/authority split.** Concede.

### Q5 — Address

**DA position:** CONCEDED. ODR-0015 owns Address modelling per the S005 §6b routing decision (S005 Q6 Allemang DA withdrawal condition met). S006 references ODR-0015 via `opda:Address` import; S006 does not redeclare Address structure.

No DA attack. CONCEDE.

**Per-voice vote: FOR routing to ODR-0015.** Concede.

### Q6 — W3C Org ontology adoption (MILD ATTACK)

**DA position:** MILD ATTACK on `opda:Organisation rdfs:subClassOf org:Organization` as a default commitment. Adopting the W3C Org Ontology Recommendation looks like progressive interop — and it would be, if OPDA consumes the full Org Ontology machinery (`org:Membership`, `org:Role`, `org:OrganizationalUnit`, `org:Site`, `org:Post`). But OPDA's consumer queries against the Organisation Kind are *much* narrower than the Org Ontology's full apparatus: PDTF v3 wants `name`, `companies-house-number`, `LEI`, `VAT-number`, `address`. That is a tiny subset of Org Ontology's vocabulary.

*Working Ontologist* 3rd ed. Ch. 13 §"Adopting External Standards": adopt external standards only when their full machinery serves a named OPDA use case; otherwise reference via `dct:source` without `rdfs:subClassOf`. The risk of `rdfs:subClassOf` here: OPDA inherits Org Ontology's `org:hasMember`/`org:memberOf` properties, which downstream reasoners will treat as available on every `opda:Organisation` instance — but OPDA has no `org:Membership` modelling and no consumer queries that traverse it. A reasoner that infers `?org org:hasMember ?p` from an empty antecedent will produce empty answer-sets that look like data-quality bugs.

**The right move.** Reference W3C Org Ontology via `dct:source` on the `opda:Organisation` class declaration (acknowledging the alignment) without declaring `rdfs:subClassOf org:Organization`. If the panel later names a consumer query that needs `org:Membership` traversal, upgrade to `rdfs:subClassOf` then. The S001 Q2 vocabulary catalogue decision left "W3C Org vs bespoke `opda:`" as an open question for ODR-0006; this is the moment to settle it conservatively.

**Engagement with panel positions.** Kendall will push the W3C Org Ontology adoption as progressive interop (her FIBO methodology framing — adopt established standards). She is right that adoption signals interop; she is wrong that `rdfs:subClassOf` is the only signal. `dct:source` plus `skos:closeMatch` on the class IRI signals alignment without inheriting machinery.

**Withdrawal condition:** the panel names how much of Org Ontology OPDA consumes. If the answer is "the full apparatus" (Membership, Role, Post, etc.) — concede `rdfs:subClassOf`. If the answer is "the class declaration only, with name and a few identifiers" — settle for `dct:source` + `skos:closeMatch` without `rdfs:subClassOf`. Held-as-live for 18 months: if `org:Membership` apparatus is never consumed in production, downgrade to `dct:source` only.

**Per-voice vote: AGAINST `rdfs:subClassOf` commitment as default + withdrawal condition stated.** AGAINST. Withdrawal on named consumer query that exercises Org Ontology machinery beyond class declaration.

### Q7 — `participantStatus` Phase

**DA position:** CONCEDE. S011 §8a settled the Phase label for `participantStatus` (the seven-category UFO framework places lifecycle-state values like "active", "withdrawn", "completed" in the Phase category). S006 inherits S011's decision; this question is not re-opened.

No DA attack. CONCEDE.

**Per-voice vote: FOR Phase label inherited from S011 §8a.** Concede.

## Held-as-live re-open triggers

Two questions are conceded conditionally with re-open triggers:

- **Q2 (RoleMixin distinction).** Re-open if 18 months / no named consumer query distinguishes RoleMixin from parallel sortal Roles in production. Collapse to sortal-only at that point.
- **Q6 (Org Ontology depth).** Re-open if `org:Membership`/`org:Role`/`org:Post` apparatus is never consumed in 18 months. Downgrade `rdfs:subClassOf org:Organization` to `dct:source` + `skos:closeMatch` reference only.

The re-open triggers are mechanical — the Queen records them in the synthesis with the 18-month timer; the next session that touches ODR-0006 checks the production-query log to determine whether the trigger fires.

## SHACL-AF concern (carryover from S005)

The Person + Organisation name-change / re-incorporation succession rule that Cagle will propose (a fifth citing site of ODR-0017's pattern) extends the rules-on-rules-on-rules pattern. I am *not* opposed to ODR-0017 itself (I conceded at S005 §6a — UPRN succession is the right shape for the pattern). My methodological concern is the *expansion rate*: ODR-0017 was authored at S011 because four citing sites had crossed the threshold; if a fifth, sixth, seventh citing site arrives over the next six months without each one demonstrating its own consumer demand, the pattern becomes load-bearing-by-default rather than load-bearing-on-evidence.

**Withdrawal condition (carryover):** each new citing site of ODR-0017 demonstrates a named downstream consumer (SHACL validator, `odr-review` lint extension, LLM tooling per Hellmann et al. DBpedia 2017, audit-trail consumer) that reads the materialised data-quality assertion. The Cagle DBpedia 2017 framing was the citation for the original four sites; each new site must show its own consumer.

If Q1's name-change succession rule satisfies that condition (named KYC consumer), the fifth citing site is justified. If it does not — held-as-live as a methodology concern; the rule does not enter `## Rules` until a consumer is named.

## DA scorecard target

The minimum I will concede the session on: **5 of 7 questions withdrawn outright**, where the 5 are Q1 (concede on Substance Kind + FIBO multi-identifier) + Q3 (concede on Relator pattern) + Q4 (concede on capacity/authority split) + Q5 (concede on ODR-0015 routing) + Q7 (concede on Phase label). The contested pair is **Q2 (RoleMixin) AND Q6 (Org Ontology)**; at least one of those two must withdraw for the session to clear a 6-of-7 threshold.

**Negotiable axis breakdown:**

| Q | Negotiable? | Load-bearing? | What concedes me |
|---|---|---|---|
| Q1 | Yes | No | Substance Kind + FIBO multi-identifier conceded; light attack on name-change succession SHACL-AF rule, withdrawal on named consumer query |
| **Q2** | **Yes, with high evidence bar** | **Yes** | **Named SHACL violation case OR SPARQL query OR lifecycle event where RoleMixin wins over sortal-only** |
| Q3 | Yes | No | Concede Relator pattern; light attack on URI dereferenceability, withdrawal on named consumer that dereferences Proprietorship URI independently |
| Q4 | (already conceded) | — | (Two-predicate capacity/authority split) |
| Q5 | (already conceded) | — | (ODR-0015 routing) |
| **Q6** | **Yes** | **Mild** | **Named consumer query that exercises Org Ontology machinery beyond class declaration; otherwise `dct:source` + `skos:closeMatch` only** |
| Q7 | (already conceded) | — | (Phase label inherited from S011 §8a) |

**Held-dissent texts (for the Queen's record if my withdrawal conditions are unmet):**

- **Q2 held:** "RoleMixin layer between Kind and sortal Role is unsupported by any named consumer query, SHACL validation case, or lifecycle event. Three queries constructed against PDTF v3 produce the same answer-set under both models; verbosity is not the test of an ontology. Guizzardi 2005 Ch. 8 §'RoleMixin' establishes the construct in UFO theory but does not establish a consumer-side operationalisation. Withdraw on named consumer query / shape / event evidence. (*Working Ontologist* 3rd ed. Ch. 6 §'Distinctions that earn their keep'.)"

- **Q6 held:** "`opda:Organisation rdfs:subClassOf org:Organization` inherits W3C Org Ontology machinery (`org:Membership`, `org:Role`, `org:Post`) that OPDA has no consumer queries against. Reasoner-inferred empty triples will look like data-quality bugs. Withdraw on named consumer query that exercises Org Ontology machinery beyond class declaration; otherwise `dct:source` + `skos:closeMatch` only. (*Working Ontologist* 3rd ed. Ch. 13 §'Adopting External Standards'.)"

## DA discipline note (for the Queen)

Per ODR-0001 §Roles, my withdrawal or hold MUST be explicitly recorded on every contested question. The conditions above are *mechanical* — the Queen reads my position file, checks whether the synthesis adopts each withdrawal condition, and records "Allemang DA withdrew on Q[n] on condition met: [verbatim condition]" or "Allemang DA held on Q[n]; condition unmet: [verbatim condition]". No vague "Allemang DA aligned with majority" — the alignment must trace to the specific condition that was met.

The S005 precedent matters: I conceded UPRN succession as a SHACL-AF rule (Cagle's fourth citing site) on a named consumer query (Hellmann et al. DBpedia 2017 LLM-fallback failure mode for identifier succession). That concession is binding; I do not get to reopen ODR-0005 §6a from S006. But that concession is *not* a free pass — S006's name-change succession (the candidate fifth citing site) must satisfy the same evidentiary bar.

The cited authority for every position above: *Semantic Web for the Working Ontologist* 3rd ed. (Allemang, Hendler, Gandon 2020), Ch. 6 "Minimal modeling" and Ch. 13 "Linked Data in the Real World"; TopQuadrant customer deployment record 2015-2019 (two programmes' shift from W3C Org Ontology full-machinery `rdfs:subClassOf` to bespoke `opda:`-style references after `org:Membership` apparatus was never consumed in production); Guizzardi 2005 *Ontological Foundations for Conceptual Modeling with Applications* Ch. 7 §"Relator" + Ch. 8 §"RoleMixin" (the constructs whose operationalisation S006 must demonstrate). These citations meet ODR-0001 §Citation grounding ("a named book authored by the expert"; "a documented deployment the expert led or co-authored").
