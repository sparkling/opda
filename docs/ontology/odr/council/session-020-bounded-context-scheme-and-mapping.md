# Council Session 020 — Bounded-Context Scheme and Mapping

- **Date:** 2026-05-30
- **Convened by:** OPDA semantic-modelling lead
- **Format:** ODR-0001 Linked Data Council with Devil's Advocate
- **Queen / Moderator:** Elisa Kendall (OMG / EDM Council — FIBO modular methodology)
- **Devil's Advocate:** Ian Davis (BBC / UK Government linked-data; ex-Talis)
- **Panel (7 voices):** Evans & Vernon (DDD); Gandon (URI); Hendler (governance); Baker (SKOS, lead); Cagle (operational/SHACL); Guizzardi (UFO)
- **`consensus-mode`:** `byzantine` (per-question voting; Queen resolves forks)
- **Ratifies:** [ODR-0020 — Bounded-Context Scheme and Mapping](../ODR-0020-bounded-context-scheme-and-mapping.md)

## Context

[ODR-0019](../ODR-0019-bounded-context-representation.md) settled the representation pattern and handed the concrete `skos:Concept` shapes + mapping mechanism here. Question: how to model the context SKOS scheme(s) and the term→context mapping — to become ODR-0020, then an implementation ADR. Verified state at convening: nothing emitted; `opda:overlaysContext` (profiles.py:250) hardcodes the `profiles/foundation` layer IRI; only the `baspi5` profile exists; the 23 value-schemes use flat `skos:inScheme`, no per-scheme `owl:versionIRI`, Literal `opda:hasSteward`; `opda:Organisation` is already a minted Substance Kind (S006 Q1, merger exemplar).

Five design questions: Q1 scheme structure (one vs tiered; do spanning concerns belong); Q2 upstream treatment; Q3 internal relations; Q4 the mapping rule (4 buckets); Q5 per-concept metadata.

## Positions (condensed; votes)

- **Evans & Vernon (DDD).** ONE scheme, 11 (6 industry + 5 upstream as **Conformist** peers, marked `opda:contextRole`). Spanning = **Shared Kernel** → NOT concepts (flag kernel classes). Context-map edges in-graph as `rdfs:subPropertyOf skos:related`. **Q1 tiered-11; spanning NO; upstream YES.**
- **Baker (SKOS, lead).** ONE flat scheme, 11; spanning → a **separate** `CrossCuttingConcernScheme` (2 concepts) with kernel `dct:subject` them. No `broader`/`narrower`; `exactMatch` deferred; mirror value-scheme metadata. **Q1 flat-11 + sep; spanning NO; upstream YES.**
- **Guizzardi (UFO).** SIX industry only. Upstream are **Organisations/Agents** (Substance Kind + steward Role), not contexts → `opda:Organisation`/`prov:Agent`, `dct:source`; optional separate `AuthoritativeSourceScheme`; NEVER `servesContext`. Spanning = phase-space (ODR-0007) + RoleMixin family (ODR-0006) → no concept. MUST NOT `skos:Concept` an Organisation. **Q1 six; spanning NO; upstream NO.**
- **Gandon (URI).** ONE scheme, tiers = `skos:Collection` (never sub-schemes); HARD firewall concept-IN-scheme vs term-TAGGED; kernel → a single `opda:SharedKernel` sentinel; `topConceptOf`; no per-scheme `versionIRI`; forward-compatible. **Q1 one-scheme-13-collections; spanning NO-as-context; upstream YES.**
- **Hendler (governance).** ONE scheme, per-concept `opda:hasSteward`, tiers via `opda:contextTier`; AGAINST sub-schemes; rides foundation `versionIRI`; upstream→`skos:closeMatch` to steward vocab where dereferenceable; link profile→context via `opda:profileForContext`. **Q1 one-scheme-tiered; spanning YES; upstream YES.**
- **Cagle (operational/SHACL).** Industry scheme + sibling `UpstreamContextScheme`. **Decisive verified finding:** upstream own NO overlays → `servesContext`→upstream not derivable → hand-maintenance/drift → upstream relation-only (`opda:consumesFrom`), never `servesContext`. Mechanism: fix `profiles.py:250` + SHACL-AF `CONSTRUCT ?term servesContext ?ctx FROM overlaysContext+requires`; kernel derived to requiring contexts, never "all"; foundation UNTAGGED. **Q1 two-schemes; spanning YES(derived); upstream NO-as-servesContext.**
- **Davis (DA).** FLAT scheme of the **6 industry** only — the only ones with overlay edges. Spanning NO (ODR-0006/0007). Upstream NO (conformist orgs, zero overlay edges). Kernel UNTAGGED (absence = signal). No tiers/collections/edges until a consumer queries them. **Q1 flat-6; spanning NO; upstream NO.**

## Tally

- **Spanning as bounded-context concepts: EXCLUDE** (5–2; Hendler/Cagle keep them in, but Cagle's is derived-not-declared).
- **Upstream as context concepts: split** — IN-marked (Evans, Baker, Gandon, Hendler) vs OUT (Guizzardi, Cagle, Davis).
- **Scheme population:** 6 (Guizzardi, Davis, Cagle-industry) / 11 (Evans, Baker) / 13-tiered (Gandon, Hendler).

## Queen's synthesis (Kendall)

**One flat `opda:BoundedContextScheme` of the six industry contexts only; upstream are `opda:Organisation`/`prov:Agent` via `opda:consumesFrom` (never `servesContext`); spanning are derived from `servesContext` multiplicity, not declared; the mapping is derived by SHACL-AF from the corrected `opda:overlaysContext`; kernel terms map to requiring-contexts and are otherwise UNTAGGED; tiers/Collections/edges deferred behind a forward-compatible firewall.**

Forks 1 and 3 went to the minority on verified facts, not headcount. The **upstream fork** resolves by separating the DDD *relationship* from the *category*: Evans's Conformist edge is drawn as `opda:consumesFrom` → an Organisation (which is what an upstream authority *is*, per Guizzardi's in-graph `opda:Organisation` Kind), while Cagle's non-derivability (no upstream overlay edges) keeps the mapping hand-free. The **mapping mechanism** (Cagle's `profiles.py:250` fix + SHACL-AF + dormant gate) carried 7–0. **Verified reality:** only `baspi5` is emitted and its one overlay edge is mis-targeted — so the substrate is 5/6 prospective, making the follow-on ADR load-bearing.

**ODR vs ADR boundary** (rule: *if a fact about the domain changes when stated differently → ODR; if only bytes change → ADR*): ODR-0020 = which concepts populate the scheme, the exclusions (upstream→Org, spanning→derived), the 4-bucket mapping discipline, the firewall. The ADR = the generator emitter, the `profiles.py:250` fix + the five unwritten profile emitters, the SHACL-AF rule, regeneration.

## Outcome

[ODR-0020](../ODR-0020-bounded-context-scheme-and-mapping.md), `status: accepted`, `kind: pattern`; implementation tracked by ADR-0026. Dissents preserved: Evans/Hendler/Gandon/Baker's upstream-in-scheme and tiers are forward-compatible behind the firewall; Davis's YAGNI gate binds (nothing beyond the flat 6 built until a consumer query the 6-flat + org-model cannot satisfy). Triggers: a 7th concept when a context gains an overlay or a named query the org-model can't answer; Collections on a hierarchy query; derivation on the first term-grain consumer; `AuthoritativeSourceScheme` when an authority needs a dereferenceable catalogue entry; `exactMatch` when a steward vocabulary is dereferenceable.
