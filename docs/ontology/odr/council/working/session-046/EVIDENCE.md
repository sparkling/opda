# Council Session 046 — Shared Brief & Evidence (Reduced Council)

**Read this first.** Form your positions from your own published methodology, grounded in citations (§Citation discipline). This is the **session-045 modelling referral** — a focused, narrow-axis decision.

## Proposition

Resolve how the OPDA ontology should assert the **class↔SKOS-scheme binding** for coded values. Session-045 (a viz-and-extractor council) recovered a *derived* `opda:constrainedByScheme` view edge for the 2 IRI-grounded cases and **referred two source/TBox modelling questions here**: (i) the `rdfs:range` of the `opda:currency`/`opda:peril` object properties, and (ii) whether the string-enum `sh:in`→scheme binding should be promoted to an asserted triple.

This council decides the **ontology source** (TTL/TBox), not the viz. Output is a *proposal* the operator ratifies.

## Verified facts (cross-check against the corpus)

- `opda:currency` (domain `opda:MonetaryAmount`) and `opda:peril` (domain `opda:RiskAssessment`) are `owl:ObjectProperty` with `rdfs:range` pointing at the **bare generic `skos:Concept`** — near-vacuous ("the value is *some* concept"), losing *which* scheme/register.
- Their value-space is scoped instead by SHACL: `currencyRangeShape` / `perilRangeShape` (per **ODR-0029 R3**) carry `sh:in (<…/currency/GBP> <…/EUR> …)` whose members are concept IRIs, each **asserted `skos:inScheme`** its scheme (CurrencyScheme / PerilScheme). So the scheme binding is recoverable by the join `sh:in`-member → `skos:inScheme` → scheme.
- **A SKOS scheme is an `skos:inScheme` aggregation, not a class of `rdf:type` instances** — so `rdfs:range opda:CurrencyScheme` would be a category error (no instance is `rdf:type` a ConceptScheme). NO property in the corpus ranges over a ConceptScheme today; scheme-scoping is enforced closed-world by SHACL (Hendler's session-045 caution).
- The ~21 **string-literal `sh:in`** value-shapes (`sh:datatype xsd:string` + `sh:in ("Freehold" "Cable" …)`, via `sh:targetSubjectsOf`) name their scheme **only in `sh:message`/`rdfs:comment` prose**. The string→scheme join is **non-injective** (verified: 24 of 264 prefLabels ambiguous — "Freehold" ∈ 2 schemes, "Other" ∈ 8, "Yes"/"No" ∈ 6, EPC/council-tax bands ∈ 3), so a string literal cannot deterministically select its scheme. **0 asserted `skos:exactMatch` triples** (the textual mentions are prose inside scopeNote/definition).
- **ODR-0011 §7a** makes `xsd:string` + lexical-form `sh:in`/`sh:pattern` the operational discipline for closed-set membership; **ODR-0010** overlay sh:in is a subset of base sh:in (which unions into the SKOS scheme members); **ODR-0029** = the SHACL-scoping / never-reasoned discipline.

## The three questions (verdict on EACH: AFFIRM / REVISE / REJECT + FOR/AGAINST/ABSTAIN ballot)

**Q1 — `opda:currency`/`opda:peril` `rdfs:range`.** Keep `rdfs:range skos:Concept` + the existing SHACL `sh:in` scoping (`currencyRangeShape`/`perilRangeShape`), or change it? If change: to what — a **scheme-typed `skos:Concept` subclass** (e.g. `opda:CurrencyConcept rdfs:subClassOf skos:Concept`, ranged + `skos:inScheme`-validated), or another faithful idiom? (You must NOT naively assert `rdfs:range opda:CurrencyScheme` — a scheme is not a class of instances.)

**Q2 — Is bare-`skos:Concept` range a defect or correct-by-design?** What is the **faithful OWL/SKOS idiom** for "this object property's value is a concept drawn from scheme X"? Is SHACL closed-world scoping (range `skos:Concept` + `sh:in`/`sh:in`-over-`inScheme`) the right home for that constraint (so the bare range is *intended*, not a smell), or should the OWL layer carry more?

**Q3 — The string-enum binding.** Should the ~21 string-literal `sh:in` bindings be **promoted to an asserted triple** — either regenerate them as **concept-IRI `sh:in`** (so they join via `skos:inScheme` like currency/peril, killing the non-injectivity), or mint an explicit **`opda:constrainedByScheme` annotation property** asserting field→scheme — or **stay** as `xsd:string` + `sh:in` + the ODR-0011 §7a doctrine (binding documented, not RDF-asserted)? Weigh the instance-data interop cost (ODR-0010/0013) against machine-recoverability.

## Input documents

- `source/03-standards/ontology/opda-descriptive.ttl` + `opda-descriptive-shapes.ttl` (currency/peril + the range shapes); `opda-vocabularies.ttl` (CurrencyScheme/PerilScheme + `skos:inScheme`).
- `public/ontology/artefacts/opda-merged.ttl`, `opda-shapes-merged.ttl` (grep `sh:in`, `currencyRangeShape`, `skos:inScheme`).
- `docs/ontology/odr/council/session-045-graph-observations-bridge-layers-mass.md` (the referral + the derived-edge guardrails).

## Prior related records

- **ODR-0011** §7a/§8a — lexical-form `sh:in` discipline; ufoCategory-as-facet; the OntoClean cascade (classify vs subclass).
- **ODR-0029** — SHACL closed-world scoping; never-reasoned discipline (R3 = the range shapes).
- **ODR-0010** — overlay `sh:in` ⊆ base `sh:in` ⊆ scheme members.
- **ODR-0006** — the as-built kind-split namespace; object-property modelling.
- **session-045** — the derived `opda:constrainedByScheme` view edge + guardrails (this is the *source* counterpart).

## Constraints

- TBox/source change → operator-ratified (this council shapes a proposal). No freeze, but a source edit is governance-gated by correctness, not deployment.
- Any `sh:in` change has instance-data interop consequences (ODR-0010 overlay subset-contract; ODR-0013 severity) — weigh that.
- Determinism + the never-reasoned discipline (ODR-0029) must hold.

## Citation discipline (load-bearing)

Cite a §Citation-grounding source: a named W3C spec + section (SKOS Reference §8.1 `inScheme`, §3.5.1 concepts≠classes; SHACL §4.x; OWL 2 spec/primer), a (co-)authored book + chapter, a peer-reviewed paper, or a deployment you led. **No anonymous "best practice".** The Queen web-verifies external citations.

## Cross-talk + output (mandatory)

- **Team:** `council-046`. Use `SendMessage` to engage ≥1 peer per question. Mirror every DM **verbatim** into your working file as you go.
- **Working file:** `docs/ontology/odr/council/working/session-046/<your-id>.md` — OPENING (per-Q position + ballot + citation), EXCHANGES (verbatim DMs + position changes), FINAL (settled verdicts; DA: explicit WITHDRAW/HOLD + re-open trigger per contested Q).
- **Return** to the Queen: your per-question verdicts (AFFIRM/REVISE/REJECT + FOR/AGAINST/ABSTAIN) with one-line grounded citations.
