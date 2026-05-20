# ODR 0001 — Linked Data Council: Review Methodology

- **Status:** Accepted
- **Date:** 2026-05-20
- **Deciders:** OPDA semantic-modelling lead
- **Consulted:** H&M ontology programme (source methodology — ONT-0021)
- **Informed:** OPDA working groups (Classification & Reference, Data Quality, Trust Framework)
- **Related:** ADR-0001 (DCAM/DMBOK adoption), ADR-0004 (Accreditation Directory)

## Context

Linked-data design decisions for OPDA — namespace strategy, vocabulary selection (SKOS / OWL / SHACL / DCAT / DPV / PROV-O / FIBO), bounded-context boundaries between PDTF schemas, mapping conventions to external ontologies, classification facets, validation severity — require balancing formal correctness, pragmatic tooling constraints, industry precedent, and OPDA-specific property-sector realities. No single perspective covers all these concerns. Individual decisions risk blind spots:

- an OWL purist may overlook tooling and consumption gaps,
- a pragmatist may miss formal pitfalls that compound in mappings,
- a standards expert may not account for the property-sector's existing data shape (RDBMSes, XML/JSON Schema, PDTF v2),
- an enterprise-architecture expert may not weigh open-data and public-sector linked-data conventions.

We need a reproducible, multi-perspective review process whose outputs are auditable and citable.

## Decision

Adopt the **Linked Data Council** — a simulated panel of named linked-data and ontology authorities whose published positions, W3C specifications, books, and deployment experience are used to evaluate OPDA design decisions from multiple perspectives. The methodology is a direct adaptation of the H&M Expert Hive (ONT-0021); panel composition is preserved because the experts' published positions are domain-agnostic with respect to property data.

## Options rejected

- **Ad hoc single-perspective review.** Misses cross-cutting concerns; formal, tooling, standards, and deployment dimensions require distinct expertise that no single viewpoint provides.
- **Open call to real-world experts.** Slow, expensive, and not reproducible. Real experts are reserved for the standing OPDA working groups and the Modelling Sub-Committee, not for per-decision deliberation.
- **Generic "best practice" appeals.** Produce vague rationale that future maintainers cannot interrogate.

## Rationale

- **Multi-perspective coverage** catches blind spots that any single viewpoint would miss.
- **Grounded in authority:** recommendations are traceable to published work, W3C specifications, or documented real-world deployments — not unsupported opinion.
- **Reproducible:** the same question posed to the same panel produces consistent results, because the experts' published positions are stable.
- **Efficient:** a single session produces a verdict with supporting rationale, avoiding iterative back-and-forth.
- **Auditable:** ODRs record which experts were consulted, what they said, and why the verdict went a particular way.
- **Citable:** named-expert framing produces specific rationale ("Knublauch on SHACL property-shape reuse," "Baker on namespace governance") rather than generic appeals.

## Rules

### Standing Panel (9 experts)

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

### Extended Panel (domain-specific sessions)

Add when the question genuinely depends on the expertise:

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

### Roles for every session

- **Queen / Moderator** — one expert from the standing or extended panel, named explicitly. Frames the questions, sequences the deliberation, calls votes, and writes the synthesis. The Queen still votes.
- **Devil's Advocate (DA)** — one expert, named explicitly. Their job is to attack the proposal: identify procedural violations, missing constraints, logical gaps, alternative interpretations the panel may have skipped. The DA is expected to lose votes and to withdraw objections when persuaded — both are recorded.
- **Panel** — the remaining experts. Each speaks in turn on each question.

### Session protocol

1. **Convene with a context block.** State the question(s), the input documents (with paths or URLs), prior related ODRs, and any constraints (deadlines, dependencies). 3–8 questions per session is the working range — more is a sign the scope should be split.
2. **Always use named experts** from the panel — never generic role titles ("a SHACL expert said…"). Attribution is the discipline that keeps rationale honest.
3. **Each expert must state rationale from their published methodology.** No appeals to anonymous "best practice." If the position can't be grounded in a citation, book, spec, or documented deployment, it doesn't count.
4. **Experts must discuss with each other**, not just opine in parallel. Share contested points so they can agree, disagree, refine, or withdraw prior dissent. Cross-references between expert positions ("Allemang's framing is right but I'd push further — …" — Hendler) are the hallmark of a real deliberation.
5. **Per-question vote.** Tally as `N-M-K` (in-favour / against / abstain). Record dissenting positions verbatim, including the reason given. If the DA withdraws an objection during deliberation, record that explicitly ("Cagle DA withdrew").
6. **Synthesis report.** The Queen writes a closing section listing: per-expert positions (or pointers to where they appear above), vote tallies per question, dissent records and withdrawals, the recommended approach, rationale citing publications, agreed amendments to the proposal, and whether any existing ODR needs revision or supersession.
7. **No silent vote-padding.** If an expert genuinely has nothing distinctive to say, "abstain" is the correct vote — not a fabricated agreement.

### Session document conventions

- File: `docs/odr/council/session-NNN-<slug>.md` — incrementing numeric session ID, descriptive kebab-case slug.
- Front matter (after the `# Council Session NNN — Title` heading) lists: Date, ODR/ADR under review (if any), Queen, Devil's Advocate, Panel (table), Input Documents.
- Body structure:
  - **Context** — the question and stakes.
  - **Question N** sections, one per question.
    - Inside each: each expert's position as a labelled sub-section or bolded `**Allemang:**` paragraph. The Queen's contribution is marked `**Allemang (Queen):**`; the DA's `**Cagle (DA):**`.
    - **Vote:** `8-0` / `9-0-1` / `7-2` with the tally and (optionally) a one-line summary of the verdict.
  - **Synthesis** — Queen's closing summary, amendments, downstream ODR impact.

### When to use the Council

- URI / namespace / serialization decisions
- Competing W3C modelling patterns (OWL vs SKOS vs SHACL; RDF reification vs RDF-star; etc.)
- OWL / SHACL / SKOS / PROV-O / DPV / ODRL semantic questions
- Validating enterprise-scale or government-scale precedent for an OPDA pattern
- Cross-cutting reviews of multiple ODRs for coherence
- Bounded-context boundaries for PDTF schemas
- Mapping conventions between OPDA's ontology and external standards (FIBO, schema.org, DPV, INSPIRE, GeoSPARQL, etc.)

### When NOT to use the Council

- Routine class / property additions that fit established patterns
- SHACL shape authoring that follows an existing template
- Editorial fixes (typos, label tightening, comment additions)
- Working-group procedural matters — those belong in the WG minutes, not the Council
- Stakeholder consultation — that's the role of the OPDA WGs and the Modelling Sub-Committee, not a simulated panel

The Council is a design-deliberation instrument. It does not substitute for OPDA's real-world governance (WGs, Sub-Committees, AGM ratification). Council verdicts shape *proposals*; OPDA governance shapes *adoption*.

## Consequences

### Good

- Decisions grounded in recognized authorities' published positions, not ad hoc reasoning.
- Multi-perspective coverage catches blind spots before they propagate into the ontology.
- ODRs with Council verdicts are self-documenting — future maintainers understand *why* and *whose methodology* without having to re-derive the analysis.
- The standing panel is stable across sessions, building a consistent intellectual framework.
- Session transcripts double as training material for newcomers learning OPDA's design idiom.

### Bad

- Experts are simulated — positions inferred from published work may not cover every specific question (mitigated: only attribute positions consistent with their published methodology; if you have to invent a position, flag it).
- A 9-expert panel takes more drafting time than a direct decision (mitigated: reserve for significant decisions per the "when to use" criteria).
- Risk of "Council theatre" — going through the motions to legitimise an already-decided outcome. Devil's Advocate role and recorded dissent are the mitigations; abandon the methodology if these become rubber-stamps.

### Neutral

- The panel reflects a Semantic Web / linked-data perspective, which is appropriate for OPDA. For property-data decisions that are predominantly about relational schemas or document stores (rare in this programme), the methodology would need different experts or shouldn't be used.

## Track record

Council sessions, when convened, are recorded here.

| Session | Question | Panel | Verdict |
|---------|----------|-------|---------|
| *(none yet — this ODR initiates the methodology)* | | | |

## Verification

- [ ] Standing panel lists 9 named experts with affiliations
- [ ] Queen and Devil's Advocate roles documented
- [ ] Per-question vote-tally convention specified
- [ ] When-to-use / when-not-to-use criteria present
- [ ] Session document conventions specified (path, structure, front matter)
- [ ] Track record table exists (initially empty)
