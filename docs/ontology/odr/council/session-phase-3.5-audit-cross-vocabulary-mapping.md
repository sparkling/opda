# Council Session Phase-3.5 Audit — Cross-Vocabulary Mapping Discipline

- **Date:** 2026-05-27
- **Records under review:** [ODR-0002 — Ontology Languages and Vocabularies Adopted](../ODR-0002-ontology-language-adoption.md); [ODR-0011 — Enumeration Vocabularies](../ODR-0011-enumeration-vocabularies.md)
- **Queen / Moderator:** Henrik Pettersen (acting on behalf of the OPDA Working Group)
- **Devil's Advocate:** None convened (Author-only tier; cross-vocab mapping discipline is mostly recording deferred-decisions, no live deliberation — the named experts' positions are stable; substantive deliberation occurs at trigger-time)
- **Panel:** None (Author-only; cited voices: Isaac/Miles, Gandon, Baker, Kendall, Guizzardi — positions from S002 + S011)
- **Input Documents:**
  - [ODR-0002 Q11 Change Log row](../ODR-0002-ontology-language-adoption.md) — OBO RO defer 5-2-2; SSSOM re-open trigger
  - [Session 002 transcript](./session-002-vocabulary-catalogue.md) — Q11 OBO RO + SSSOM dispositions
  - [Session 011 transcript](./session-011-enumeration-vocabularies.md) — Q3 cross-vocabulary mapping deferral
  - [ODR-0011 Q3 disposition](../ODR-0011-enumeration-vocabularies.md) — SSSOM/SEMAPV deferred; `skos:exactMatch` to schema.org / Wikidata / Land Registry codes admitted-or-deferred
  - [Council follow-up plan §"Outstanding work after plan completion"](../../../plan/council-followup-sessions.md) — Phase-3.5 audit named as Author-only or Reduced Council
- **`consensus-mode`:** `none` (Author-only)
- **Format tier:** **Author-only.** Recording cross-vocab mapping discipline + activation triggers; the named experts' positions are stable per S002 + S011 deliberations; substantive deliberation will occur at trigger-time.

## Context

Two related cross-vocabulary mapping items were deferred during the original Council programme:

1. **S002 Q11 — OBO Relation Ontology (RO)** — admitted-or-deferred deliberation lands DEFER 5-2-2 with Kendall + Guizzardi held-as-live dissents. The decision was deferred until "an OPDA SPARQL query produces a wrong answer under `dct:isPartOf` that `ro:part-of` would correct, OR ODR-0005's IC discipline requires well-founded mereology unreachable via `dct:isPartOf` + `opda:` local predicates" — Routed to S005's IC-discipline session (now ratified; routing has not triggered RO admission).
2. **S011 Q3 — SSSOM / SEMAPV mapping vocabulary + inline `skos:exactMatch`** — deferred to Phase-3.5 audit. The decision deferred admission of: (i) SSSOM (Simple Standard for Sharing Ontological Mappings — Matentzoglu et al. 2022) for first-class cross-vocab mapping records; (ii) inline `skos:exactMatch` to schema.org / Wikidata / Land-Registry codes / INSPIRE / FIBO. Reasoning: cross-vocab mapping discipline is best deliberated when real mapping work surfaces concrete cases.

This Phase-3.5 audit session records the **discipline** governing when and how those vocabularies admit, without doing the mapping work itself.

## Pre-flight scope check

Outcome: **ratify-as-is**. Cross-vocab mapping discipline is recording, not deliberation. Author-only tier justified per ODR-0001 §Format tiers — "recording a decision the methodology or precedent has already settled" applies; the precedent is S002 + S011's deferral framings.

## Items recorded (not deliberated)

### Item 1 — SSSOM / SEMAPV admission discipline

**Position:** SSSOM (Simple Standard for Sharing Ontological Mappings) and SEMAPV (Semantic Mapping Vocabulary) **remain in the Defer tier of ODR-0002** until any of three concrete triggers fires.

**Activation triggers (any one):**

1. **External FIBO mapping work surfaces.** An OPDA module's TBox needs to declare ≥3 cross-vocab mappings to FIBO classes/properties (e.g. `opda:LegalEstate` ↔ `fibo-fnd-rel-rel:Arrangement`), and the mappings have provenance metadata (mapping author, justification, confidence) that exceeds `skos:exactMatch`'s expressiveness.
2. **External INSPIRE / Land Registry RDF mapping work surfaces.** A mapping table to INSPIRE Annex I (Addresses, Cadastral Parcels) or to HMLR's emerging RDF publication requires structured mapping records with provenance — `dct:source` + author + confidence + mapping-rule. Single-link `skos:exactMatch` is inadequate.
3. **Consumer requires sssom-shaped output.** A named consumer (e.g. a SPARQL endpoint federating OPDA + FIBO + INSPIRE; a regulator's mapping audit) requests SSSOM-format TSV exports from OPDA's mapping records.

**Mechanism on trigger:** Spawn a new Council session (Reduced Council; Isaac/Miles as Queen, Gandon as DA) to ratify SSSOM/SEMAPV admission to the Conditional tier of ODR-0002 with a concrete profile slice (likely SSSOM 1.0 + SEMAPV core).

**Default until triggered:** OPDA mapping records use `skos:exactMatch` / `skos:closeMatch` / `dct:source` inline (the patterns already in ODR-0011 §Operational specifications). These cover ~80% of mapping needs at low ceremony; the remaining ~20% justifies SSSOM admission only when the triggers concretise.

**Source:** [Session 002 Q11 transcript](./session-002-vocabulary-catalogue.md); [Session 011 Q3](./session-011-enumeration-vocabularies.md); ODR-0002 Change Log SSSOM row.

### Item 2 — Inline `skos:exactMatch` to external vocabularies — case-by-case admission

**Position:** Inline `skos:exactMatch` from OPDA SKOS concept members to external vocabularies (schema.org, Wikidata, INSPIRE code lists, HMLR codes, FIBO concepts) is **admitted case-by-case** as each consuming module ratifies, NOT as a blanket programme-wide rule.

**Per-scheme admission criterion:**

- The external mapping target MUST have stable URIs (W3C-grade persistence; or DPV-style w3id.org redirect; or institutional commitment).
- The mapping MUST be operationally useful (a named consumer query reads the mapping or the mapping enables cross-vocab federation).
- The mapping MUST carry `dct:source` to the authoritative external publication.

**Schemes likely to admit early:**

- `opda:BuiltFormScheme` ↔ schema.org `RealEstateListing` enums (when a real-estate consumer federates).
- `opda:CouncilTaxBandScheme` ↔ HMLR / VOA codes (when HMLR's RDF publication stabilises).
- `opda:CurrentEnergyRatingScheme` ↔ EPC Register codes (when DESNZ publishes a vocabulary).
- `opda:TenureKindScheme` ↔ HMLR tenure codes.

Each admission lands as a `## Change log` row in the consuming module ODR, not in ODR-0011's body. The Phase-3.5 audit (this session) records the discipline; per-scheme admissions land as future Author-only mini-sessions.

**Source:** [Session 011 Q3](./session-011-enumeration-vocabularies.md); [ODR-0011 §Operational specifications](../ODR-0011-enumeration-vocabularies.md).

### Item 3 — OBO RO admission (S002 Q11 routing follow-up)

**Position:** OBO RO (Relation Ontology) **remains deferred** per S002 Q11 5-2-2 vote with Kendall + Guizzardi held-as-live dissents. The S005 IC-discipline ratification has not triggered the named re-open conditions:

- No OPDA SPARQL query has yet produced a wrong answer under `dct:isPartOf` that `ro:part-of` would correct (no consumer query exercises mereology).
- ODR-0005's IC discipline did not require well-founded mereology unreachable via `dct:isPartOf` + `opda:` local predicates (the 3-class commitment + `identifiesSameProperty` join is sufficient for the property/title/estate relations).

**Held-as-live dissents preserved:**

- **Kendall** (FIBO precedent for formal mereology): OBO RO admits when FIBO's `gist:isPartOf` or similar formal mereology surfaces in a downstream cross-vocab mapping (linked to Item 2 if FIBO mapping work activates).
- **Guizzardi** (UFO formal-ontology precedent): OBO RO admits when an OPDA pattern requires extensional vs intensional mereology distinction that `dct:isPartOf` flattens.

**Default until triggered:** `dct:isPartOf` + `opda:` local predicates suffice for OPDA's current part-whole relations (Building / Room substructure if S008 declares them; Survey / Search internal structure; address-line composition). When a downstream consumer query or formal-modelling case crystallises one of the named triggers, route to a small Author-only follow-up that re-litigates OBO RO admission with Kendall + Guizzardi convened.

**Source:** [Session 002 Q11 transcript](./session-002-vocabulary-catalogue.md); ODR-0002 Change Log OBO RO row.

## Synthesis

Three cross-vocab mapping disciplines recorded:

1. **SSSOM / SEMAPV** — defer until one of three named triggers fires (FIBO mapping work; INSPIRE/HMLR mapping work; sssom-shaped consumer demand).
2. **Inline `skos:exactMatch`** — admit case-by-case per consuming module; named candidate schemes (BuiltForm ↔ schema.org; CouncilTaxBand ↔ HMLR/VOA; EPC ↔ DESNZ; TenureKind ↔ HMLR) staged but not auto-admitted.
3. **OBO RO** — stays deferred; held-as-live dissents preserved with concrete re-open triggers tied to FIBO mapping work + UFO formal-mereology needs.

The Phase-3.5 audit is **complete**. Cross-vocab mapping is no longer an open programme-level item; future admissions land as per-trigger mini-sessions.

**Programme state:** Council Phases 1-6 closed; Phase-3.5 audit closed (this session); Phase 7 (S016) stays deferred per Scope-Check 1 Q7c trigger discipline; S008 in flight (this conversation's Full Council).

## References

- **Anchor records:** [ODR-0002 Q11 Change Log](../ODR-0002-ontology-language-adoption.md); [ODR-0011 Q3 disposition](../ODR-0011-enumeration-vocabularies.md).
- **Precedent sessions:** [Session 002 Q11](./session-002-vocabulary-catalogue.md); [Session 011 Q3](./session-011-enumeration-vocabularies.md).
- **External standards:** SSSOM (Matentzoglu et al. 2022; OBO Foundation); SEMAPV (semantic mapping vocabulary; Mungall et al.); OBO Relation Ontology (Smith et al.).
- **Plan reference:** [Council follow-up plan §"Outstanding work after plan completion" — Phase-3.5 audit row](../../../plan/council-followup-sessions.md).
- **Future per-scheme mappings:** when triggered, each Author-only mini-session records the admission with `## Change log` row in the consuming module ODR.
