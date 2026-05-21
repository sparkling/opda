---
status: accepted
date: 2026-05-20
tags: [methodology, council, governance]
supersedes: []
depends-on: []
implements: []
---

# Linked Data Council: Review Methodology

## Context and Problem Statement

Linked-data design decisions for OPDA — namespace strategy, vocabulary selection (SKOS / OWL / SHACL / DCAT / DPV / PROV-O / FIBO), bounded-context boundaries between PDTF schemas, mapping conventions to external ontologies, classification facets, validation severity — require balancing formal correctness, pragmatic tooling constraints, industry precedent, and OPDA-specific property-sector realities. No single perspective covers all these concerns. Individual decisions risk blind spots:

- an OWL purist may overlook tooling and consumption gaps,
- a pragmatist may miss formal pitfalls that compound in mappings,
- a standards expert may not account for the property-sector's existing data shape (RDBMSes, XML/JSON Schema, PDTF v2),
- an enterprise-architecture expert may not weigh open-data and public-sector linked-data conventions.

We need a reproducible, multi-perspective review process whose outputs are auditable and citable — and whose verdicts can be revisited as the experts' published positions are stable across sessions. The question: how do we deliberate significant linked-data design decisions in a way that is grounded in authority, reproducible, and self-documenting, without resorting either to slow real-expert consultation or to vague best-practice appeals?

## Decision Drivers

* **Multi-perspective coverage** — cross-cutting concerns (formal, tooling, standards, deployment) require distinct expertise that no single viewpoint provides.
* **Grounding in authority** — recommendations must be traceable to published work, W3C specifications, or documented deployments, not unsupported opinion.
* **Reproducibility** — the same question posed to the same panel should yield consistent results, because the experts' published positions are stable.
* **Efficiency** — a single session should produce a verdict with supporting rationale, avoiding iterative back-and-forth.
* **Auditability and citability** — the record must capture which experts were consulted, what they said, and why the verdict went a particular way, in specific named-expert terms.

## Considered Options

* **Adopt the Linked Data Council** (chosen) — a simulated panel of named linked-data and ontology authorities whose published positions, W3C specifications, books, and deployment experience are used to evaluate OPDA design decisions from multiple perspectives.
* **Ad hoc single-perspective review** — one viewpoint per decision. Misses cross-cutting concerns; formal, tooling, standards, and deployment dimensions require distinct expertise that no single viewpoint provides.
* **Open call to real-world experts** — convene actual authorities per decision. Slow, expensive, and not reproducible. Real experts are reserved for the standing OPDA working groups and the Modelling Sub-Committee, not for per-decision deliberation.
* **Generic "best practice" appeals** — justify decisions by appeal to received wisdom. Produces vague rationale that future maintainers cannot interrogate.

## Decision Outcome

Chosen option: **adopt the Linked Data Council**, because it is the only option that simultaneously delivers multi-perspective coverage, authority-grounded rationale, reproducibility, and an auditable record — at a cost proportionate to the significance of the decision. The methodology is a direct adaptation of the H&M Expert Hive (the source programme, ONT-0021, external to this repository); the panel composition is preserved because the experts' published positions are domain-agnostic with respect to property data.

A Council verdict shapes a *proposal*; it does not constitute adoption. Adoption remains the role of OPDA's real-world governance (working groups, Sub-Committees, AGM ratification). The Council is a design-deliberation instrument, not a substitute for that governance.

### Consequences

* Good, because decisions are grounded in recognised authorities' published positions, not ad hoc reasoning.
* Good, because multi-perspective coverage catches blind spots before they propagate into the ontology.
* Good, because ODRs with Council verdicts are self-documenting — future maintainers understand *why* and *whose methodology* without re-deriving the analysis.
* Good, because the standing panel is stable across sessions, building a consistent intellectual framework, and session transcripts double as training material for newcomers learning OPDA's design idiom.
* Bad, because experts are simulated — positions inferred from published work may not cover every specific question (mitigated: only attribute positions consistent with their published methodology; if a position has to be invented, flag it).
* Bad, because a 9-expert panel takes more drafting time than a direct decision (mitigated: reserve for significant decisions per the "when to use" criteria).
* Bad, because of the risk of "Council theatre" — going through the motions to legitimise an already-decided outcome (mitigated: the Devil's-Advocate role and recorded dissent; abandon the methodology if these become rubber-stamps).
* Neutral, because the panel reflects a Semantic Web / linked-data perspective, which is appropriate for OPDA; for the rare property-data decision that is predominantly about relational schemas or document stores, the methodology would need different experts or should not be used.

### Confirmation

Compliance with this methodology is verified by checklist against each convened session and its ODR:

- [ ] Standing panel lists 9 named experts with affiliations.
- [ ] Queen and Devil's Advocate roles documented.
- [ ] Per-question vote-tally convention (`N-M-K`) specified and applied.
- [ ] When-to-use / when-not-to-use criteria observed.
- [ ] Session document conventions present (path, structure, front matter).
- [ ] Track record table exists and is updated as sessions are convened.

## More Information

- **Source methodology**: the Council is a direct adaptation of the H&M Expert Hive (the source programme is recorded externally as ONT-0021, which lives outside this repository). Panel composition is carried over unchanged because the experts' published positions are domain-agnostic with respect to property data. The external reference is documented here in prose only; it is deliberately absent from the typed-relation frontmatter to preserve referential integrity.
- **Related governance decisions**: this methodology operates alongside ADR-0001 (DCAM/DMBOK adoption) and ADR-0004 (Accreditation Directory). It does not depend on either for its own coherence; the relationship is contextual rather than a typed dependency.
- **First application**: Council [session-001](./council/session-001-pdtf-schema-to-ontology.md) (PDTF schema → ontology) is the inaugural session run under this methodology; its programme output is anchored by [ONT-0003](./ONT-0003-pdtf-ontology-programme.md), and the vocabulary catalogue it deliberates is [ONT-0002](./ONT-0002-ontology-language-adoption.md).

## Rules

These rules are scoped to this ODR's lifetime; they define the standing apparatus and per-session protocol of the Linked Data Council.

**Standing Panel (9 experts).**

| Expert | Affiliation | Perspective |
|--------|-------------|-------------|
| Dean Allemang | *Working Ontologist* | Pragmatic RDF modelling, enterprise KG practice |
| Jim Hendler | W3C / RPI | OWL formal semantics, web architecture |
| Elisa Kendall | OMG / EDM Council | Enterprise ontology patterns, FIBO methodology |
| Kurt Cagle | *The Ontologist* | SHACL practitioner, taxonomy design, AI integration |
| Fabien Gandon | W3C / Inria | RDF/RDFS/OWL standards, linked-data principles |
| Tom Baker | Dublin Core | Namespace design, metadata standards, vocabulary governance |
| Ian Davis | BBC / UK Gov | Linked-data deployment at scale, government data patterns |
| Giancarlo Guizzardi | NEMO / UniLu | Foundational ontology (Kind/Role/Phase), UFO, OntoUML |
| Nicola Guarino | ISTC-CNR | Formal ontology theory, identity criteria, DOLCE |

Davis and Baker carry particular weight for OPDA because UK-government linked-data conventions and metadata-governance practice are directly relevant to a public-interest property-data programme.

**Extended Panel (domain-specific sessions).** Add when the question genuinely depends on the expertise:

| Expert | When to include |
|--------|-----------------|
| Holger Knublauch (TopQuadrant) | SHACL-specific technical questions |
| Antoine Isaac / Alistair Miles | SKOS-specific (concept schemes, mappings, broader/narrower semantics) |
| Eric Evans / Vaughn Vernon | Bounded-context and domain-modelling questions (PDTF schema boundaries) |
| Zhamak Dehghani | Data ownership and mesh architecture (multi-stakeholder property data) |
| Harith Alani / John Domingue | Open-data publishing patterns |
| Ranganathan / ISO 25964 reference | Faceted classification or thesaurus questions |
| Luc Moreau | PROV-O provenance modelling |
| Renato Iannella / Harshvardhan Pandit | ODRL / DPV (consent, policy, data-rights) |

Do not pad the panel for show. If a guest expert has nothing distinctive to add over the standing nine, leave them out.

**Roles for every session.**

- **Queen / Moderator** — one expert from the standing or extended panel, named explicitly. Frames the questions, sequences the deliberation, calls votes, and writes the synthesis. The Queen still votes.
- **Devil's Advocate (DA)** — one expert, named explicitly. Their job is to attack the proposal: identify procedural violations, missing constraints, logical gaps, alternative interpretations the panel may have skipped. The DA is expected to lose votes and to withdraw objections when persuaded — both are recorded.
- **Panel** — the remaining experts. Each speaks in turn on each question.

**Session protocol.**

1. **Convene with a context block.** State the question(s), the input documents (with paths or URLs), prior related ODRs, and any constraints (deadlines, dependencies). 3–8 questions per session is the working range — more is a sign the scope should be split.
2. **Always use named experts** from the panel — never generic role titles ("a SHACL expert said…"). Attribution is the discipline that keeps rationale honest.
3. **Each expert must state rationale from their published methodology.** No appeals to anonymous "best practice." If the position can't be grounded in a citation, book, spec, or documented deployment, it doesn't count.
4. **Experts must discuss with each other**, not just opine in parallel. Share contested points so they can agree, disagree, refine, or withdraw prior dissent. Cross-references between expert positions ("Allemang's framing is right but I'd push further — …" — Hendler) are the hallmark of a real deliberation.
5. **Per-question vote.** Tally as `N-M-K` (in-favour / against / abstain). Record dissenting positions verbatim, including the reason given. If the DA withdraws an objection during deliberation, record that explicitly ("Cagle DA withdrew").
6. **Synthesis report.** The Queen writes a closing section listing: per-expert positions (or pointers to where they appear above), vote tallies per question, dissent records and withdrawals, the recommended approach, rationale citing publications, agreed amendments to the proposal, and whether any existing ODR needs revision or supersession.
7. **No silent vote-padding.** If an expert genuinely has nothing distinctive to say, "abstain" is the correct vote — not a fabricated agreement.

**Session document conventions.**

- File: `docs/ontology/odr/council/session-NNN-<slug>.md` — incrementing numeric session ID, descriptive kebab-case slug.
- Front matter (after the `# Council Session NNN — Title` heading) lists: Date, ODR/ADR under review (if any), Queen, Devil's Advocate, Panel (table), Input Documents.
- Body structure:
  - **Context** — the question and stakes.
  - **Question N** sections, one per question.
    - Inside each: each expert's position as a labelled sub-section or bolded `**Allemang:**` paragraph. The Queen's contribution is marked `**Allemang (Queen):**`; the DA's `**Cagle (DA):**`.
    - **Vote:** `8-0` / `9-0-1` / `7-2` with the tally and (optionally) a one-line summary of the verdict.
  - **Synthesis** — Queen's closing summary, amendments, downstream ODR impact.

**When to use the Council.**

- URI / namespace / serialization decisions
- Competing W3C modelling patterns (OWL vs SKOS vs SHACL; RDF reification vs RDF-star; etc.)
- OWL / SHACL / SKOS / PROV-O / DPV / ODRL semantic questions
- Validating enterprise-scale or government-scale precedent for an OPDA pattern
- Cross-cutting reviews of multiple ODRs for coherence
- Bounded-context boundaries for PDTF schemas
- Mapping conventions between OPDA's ontology and external standards (FIBO, schema.org, DPV, INSPIRE, GeoSPARQL, etc.)

**When NOT to use the Council.**

- Routine class / property additions that fit established patterns
- SHACL shape authoring that follows an existing template
- Editorial fixes (typos, label tightening, comment additions)
- Working-group procedural matters — those belong in the WG minutes, not the Council
- Stakeholder consultation — that's the role of the OPDA WGs and the Modelling Sub-Committee, not a simulated panel

The Council is a design-deliberation instrument. It does not substitute for OPDA's real-world governance (WGs, Sub-Committees, AGM ratification). Council verdicts shape *proposals*; OPDA governance shapes *adoption*.

**Track record.** Council sessions, when convened, are recorded here.

| Session | Question | Panel | Verdict |
|---------|----------|-------|---------|
| [session-001](./council/session-001-pdtf-schema-to-ontology.md) | PDTF v3 schema → ontology (Q1–Q7) | 12 voices / 6 teammates; Queen Kendall, DA Guarino | Genuine modelling; concern/UFO partition; identity crux gated; spike-then-scale → [ONT-0003](./ONT-0003-pdtf-ontology-programme.md) |
