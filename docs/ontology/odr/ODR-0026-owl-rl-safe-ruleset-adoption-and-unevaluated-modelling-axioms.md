---
status: accepted
date: 2026-06-01
kind: architecture
tags: [entailment, owl-rl, inference, documentation-axioms, domain-range, equivalentclass]
scope: []
supersedes: []
depends-on: [ODR-0025, ODR-0005, ODR-0017]
implements: [ODR-0003]
---

# OWL-RL-Safe Ruleset Adoption and Unevaluated Modelling Axioms

## Context

ODR-0025 set opda's entailment regime — RDFS plus a curated OWL 2 RL-*safe* rule subset, with certain OWL constructs excluded from the closure. Two questions were left open. First, whether to adopt the sibling project's specific safe ruleset as-is or re-derive one: analysis of `~/source/hm/semantic-modelling/config/hm-owl-rl-safe.rules` confirmed the rule bodies reference only `rdf:`/`rdfs:`/`owl:` vocabulary and generic variables — zero domain IRIs — so they transfer verbatim. Second, what the exclusion of `rdfs:domain`/`rdfs:range`/`owl:equivalentClass` means for *authoring*: does opda stop using those constructs, or keep them but not evaluate them?

opda already authors the "excluded" constructs where they carry information: **27** `rdfs:subClassOf`, **2** `rdfs:subPropertyOf`, **3** `owl:equivalentClass` (the evidence-class short/long-name aliases, ADR-0011 — **since RETIRED by Council session-035; see R3 amendment**), and `rdfs:domain` declarations (e.g. `opda:currentEnergyRating rdfs:domain opda:Property`, the case behind ODR-0025 §R7). Removing them to match the closure would discard genuine documentation and OWL-identity information. This ODR settles both questions.

## Decision

opda adopts the OWL-RL-safe ruleset **wholesale** (the seven enabled rules, verbatim — only provenance, the entailment-graph IRI, and the consistency-gate namespace differ; ADR-0035) and adopts the **model-but-don't-evaluate** principle: opda continues to author `rdfs:domain`, `rdfs:range`, `owl:equivalentClass` (and the other ODR-0025 §R2-excluded constructs) because they carry real information — human documentation, OWL identity, and input for external DL tooling — while the load-time closure simply does not evaluate them; the ODR-0025 §R2 exclusion is a **non-evaluation, not a prohibition on authoring**.

## Rules

### R1 — Wholesale adoption of the safe ruleset

`config/opda-owl-rl-safe.rules` is `hm-owl-rl-safe.rules` adopted verbatim: the seven enabled rules — `rdfs:subClassOf` transitivity + type propagation, `rdfs:subPropertyOf` transitivity + value propagation, `owl:inverseOf` (both directions), `owl:TransitiveProperty`, `owl:SymmetricProperty`. The rule bodies cite only `rdf:`/`rdfs:`/`owl:` vocabulary and generic variables — no opda or hm IRI appears — so they transfer without semantic change. The only opda-specific deltas are: provenance comments (→ ODR-0025/0026), the entailment-graph IRI (`https://w3id.org/opda/graph/inferred/entailment`), and the consistency-gate subject-namespace filter (`https://w3id.org/opda/`). The mechanism (SPARQL-`INSERT` materialisation + consistency gate) is ADR-0035; disjointness remains a validation check, not an entailment.

### R2 — Model-but-don't-evaluate (clarifies ODR-0025 §R2)

The ODR-0025 §R2 exclusions — `rdfs:domain`, `rdfs:range`, `owl:equivalentClass`, `owl:equivalentProperty`, `owl:FunctionalProperty`, `owl:InverseFunctionalProperty` — remain **first-class modelling vocabulary** in opda's ontology. They are authored wherever they add information:

- `rdfs:domain` / `rdfs:range` — typing documentation, read by humans and external tools (and treated as documentary, not as intersection-typing inference).
- `owl:equivalentClass` — OWL identity assertions, where genuinely needed (the evidence-class aliases that were the original example were **retired** by session-035, R3 — a synonymy need better served by `skos:altLabel`; `equivalentClass` stays admissible-but-unevaluated for true co-extension claims).

The load-time closure (R1) **does not evaluate any of them**: no `domain`/`range` type entailment, no `equivalentClass`/`equivalentProperty` propagation, no `owl:sameAs` from Functional/InverseFunctional (the ODR-0005 §R5 / ODR-0017 §R6 anti-pattern). They are documentation and identity, not active inference. (External OWL-DL tooling, if ever pointed at opda's class graph, may evaluate them independently — out of opda's load-time scope and not opda's concern.) Note this is exactly why the EPCCertificate `rdfs:domain` case (ODR-0025 §R7) does not manifest in the closure.

### R3 — The evidence-class aliases are documentation, not an entailment bridge

`opda-claim.ttl` declares three `owl:equivalentClass` aliases (ADR-0011): `opda:DocumentEvidence ≡ opda:Document`, `opda:ElectronicRecordEvidence ≡ opda:ElectronicRecord`, `opda:VouchEvidence ≡ opda:Vouch` — short names the diagnostic exemplar set uses, bound to the canonical `…Evidence` classes that shapes and annotations target. Under R2 these equivalences are **not entailed**: an instance typed only with the short name is not inferred to be the canonical class. This matches current behaviour (pyshacl `inference="rdfs"` never entailed `owl:equivalentClass` — it is OWL, not RDFS — so it is **not a regression**). If a consuming SHACL shape must fire on short-name instances, that is resolved in the shape/exemplar layer (target both names, or type exemplars with the canonical class), **not** by evaluating `owl:equivalentClass`. Re-examining the alias pattern itself is an ADR-0011 question, out of scope here.

> **Amendment — Council [session-035](council/session-035-evidence-alias-retirement-and-faceted-typing.md) (2026-06-01).** The "ADR-0011 question" flagged above was taken up and **resolved**: the three `owl:equivalentClass` evidence aliases are **RETIRED** (8–0–0), not retained-as-inert. R3's "documentation, not an entailment bridge" reading was correct but understated — a safe, evaluable, native substitute exists (`skos:altLabel` for the short name + `skos:exactMatch` to the governed `opda:EvidenceMethodScheme` concept), so model-but-don't-evaluate (R2) does **not** apply here: keep the *information*, drop the *unsafe-and-redundant axiom*. The three `owl:equivalentClass` axioms are accordingly removed from opda's emitted TBox and from the §R2 "authored-but-excluded" inventory; the evidence-kind discriminator is now the `opda:evidenceType` SHACL-validated facet. R2's general principle (genuine `rdfs:domain`/`range` documentation with no safe substitute stays authored-but-unevaluated) is unchanged.

## Alternatives

* **Re-derive a bespoke opda ruleset** — rejected: hm's safe set is pure W3C vocabulary, already council-ratified (hm S103–105) and validated; re-derivation adds risk for no gain.
* **Stop authoring `domain`/`range`/`equivalentClass` because they are not evaluated** — rejected: they carry documentation and OWL-identity value independent of entailment; removing them loses information for humans and external tooling.
* **Evaluate `equivalentClass` for the internal aliases only (a carve-out)** — rejected here: it re-opens the ODR-0025 safe-set boundary for a need better met in the shape layer (R3); revisit only if a named consumer requires it.

## Consequences

- Author `config/opda-owl-rl-safe.rules` verbatim from hm's (ADR-0035), with the three opda deltas only.
- Keep `rdfs:domain`/`range` and `owl:equivalentClass` in the emitted ontology — they are documentation/identity, not inference inputs; no authored axiom is removed.
- SHACL shapes MUST NOT assume `equivalentClass` (or `domain`/`range`) entailment — target the actual asserted types. Audit any shape that targets a canonical evidence class while expecting short-name instances to match (R3).
- The closure correctness test (ADR-0035 §Confirmation) asserts NO `equivalentClass`/`domain`/`range`-derived triple appears in the inferred graph.
- No emitted IRIs change; opda's authored axioms are unchanged — only the entailment *evaluation* is bounded.

## References

- Refines: [ODR-0025](ODR-0025-entailment-regime-and-inference-semantics.md) §R1/§R2 (ratifies wholesale adoption; clarifies the §R2 exclusion as non-evaluation) and §R7 (the EPCCertificate `domain` case).
- Safe-set anchors: [ODR-0005](ODR-0005-property-land-identity-crux.md) §R5, [ODR-0017](ODR-0017-shacl-af-quality-rules-pattern.md) §R6 (no `owl:sameAs`).
- Mechanism: ADR-0035 (`config/opda-owl-rl-safe.rules` + the SPARQL-`INSERT` materialisation and consistency gate).
- Alias origin: ADR-0011 (within-engineering short-name aliases for the diagnostic exemplar set).
- Prior art: `~/source/hm/semantic-modelling` — `config/hm-owl-rl-safe.rules`, ODR-0036 (SHACL rules & OWL inferencing), ODR-0014 (domain/range as documentation), council sessions 103–105.
