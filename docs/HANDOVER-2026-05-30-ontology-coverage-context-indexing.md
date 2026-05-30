# Handover — 2026-05-30 — Ontology coverage gap, bounded-context decisions, council-session indexing

**Author:** Henrik (with Claude). **Scope:** one working session. **Status:** decisions ratified + recorded; three implementation streams outstanding.

## TL;DR

Three threads this session:

1. **Coverage gap** — investigated why the emitted ontology has far fewer entities than the JSON schemas. Most of the gap is by-design abstraction, but a large, *tracked* chunk is genuinely unmapped: the **descriptive-attributes layer (ODR-0008) is a stub** — the "935-leaf walk" was ratified as discipline but never mechanically executed. Tracked at **ADR-0005 §G item G11**.
2. **Bounded-context modelling** — ratified + recorded **ODR-0019** and **ODR-0020** (via the Linked Data Council) and the implementation **ADR-0026**. Decided, **not yet emitted**.
3. **Decision-record indexing** — fixed the `odr-index` skill (wrong lineage), indexed the full **20 ODR + 27 ADR** corpus into AgentDB (records + memory + a 236-edge graph), and wrote **ADR-0027** to index *council sessions* into four stores. ADR written; the session indexing **not yet executed**.

---

## Thread 1 — Missing entities & properties (the coverage gap)

### What was found

Entity counts (verified this session against the emitted TTLs + the semantic-models artefacts):

| Layer | Count | Source |
|---|---|---|
| **Ontology (emitted)** | 41 `owl:Class` + 9 `owl:ObjectProperty` + 31 `owl:DatatypeProperty` = **81 named entities** (+ 23 SKOS schemes / 114 concept members) | `source/03-standards/ontology/opda-*.ttl` |
| **Data dictionary** | **1,556–1,557 unique base leaves** (8,458 path entries incl. 15 overlays); **935** base leaves carry semantic annotation | `source/00-deliverables/semantic-models/data-dictionary-canonical.json` |
| **Business glossary** | 54 curated trust-framework terms → 554 emitted `skos:Concept` | `…/business-glossary.ttl`, `glossary-merged.json` |
| **JSON schema (base, excl. overlays)** | **1,556 unique leaves** (≈4,076 array-expanded paths; 0 reusable `definitions` in v3 — inlined; 85 in v1) | `source/03-standards/schemas/src/schemas/v3/pdtf-transaction.json` |

**The gap:** ~1,556 schema leaves → 81 ontology entities (~19:1). *Most* is legitimate abstraction — an ontology is a conceptual model, not a field transcription (address lines collapse to one `opda:Address`; enums become the 114 SKOS members; `$schema`/scaffolding is out of scope). **But** a large, known chunk is genuinely not mapped:

- The **descriptive-attributes layer ([ODR-0008](ontology/odr/ODR-0008-property-descriptive-attributes.md), `accepted`, `kind: pattern`)** is where "PDTF v3 volume lives" — the great majority of the 1,556 leaves describe a property. ODR-0008 ratified the **discipline** (declare-once-reconcile-overlays) but **not** the mechanical mapping; the "935-leaf walk" is described throughout as *"implementation-downstream."*
- **Evidence:** `source/03-standards/ontology/opda-descriptive.ttl` is a **5-class stub** (`Comparable`, `EPCCertificate`, `Search`, `Survey`, `Valuation`) with **zero** datatype properties. The ~20 descriptive datatype properties that exist were emitted into `opda-property.ttl` for the BASPI5 MVP only.

### The ADR/ODR that reference / track this

- **[ADR-0005](adr/ADR-0005-deferred-work-register.md) — Deferred-work register, §G item G11**: *"Full Q5a binding-table emission (~44 leaves)."* Closed 2026-05-28 by emitting the **BASPI5 subset** (17 Property/LegalEstate + 2 Agent datatype properties); closure note: *"Further `yesNo`-flavoured predicates land as downstream overlay demand surfaces"* and *"the remaining ~44 leaves land per downstream BASPI5/TA6/NTS/LPE1 overlay demand."* → the BASPI5 slice is done; the rest of the 935 annotated leaves are **demand-deferred**, not abandoned.
- **ODR-0008** — the governing ontology decision; discipline ratified, walk implementation-downstream.
- **ODR-0003 (programme) RETIRED 2026-05-28** after the BASPI5 MVP. The retirement criterion required **one** overlay round-trip, not full coverage — so "programme complete" ≠ "schema fully mapped."
- Other named-but-deferred items (not this thread's focus): cross-vocab mapping (SSSOM, OBO RO, inline `skos:exactMatch`), W3C VC/DID ([ODR-0016](ontology/odr/ODR-0016-w3c-vc-did-compatibility.md)), GeoSPARQL/OWL-Time/ODRL — see ODR-0002 change log + `council/scope-check-1-programme.md`.

### Adjacent finding

Only the **`baspi5`** profile is emitted (`source/03-standards/ontology/profiles/baspi5.ttl`). The other ~14 overlay profile emitters (ta6/7/10, lpe1, fme1, piq, rds, oc1, llc1, con29R/DW, sr24, nts/nts2, ntsl/ntsl2) are **unwritten** — which is why Thread 2's term→context derivation is only 1/6 wired.

### Next steps (Thread 1)

1. **[BIG]** Run the **ODR-0008 935-leaf walk** — map the 935 annotated descriptive leaves to `opda:` datatype properties / structured-value classes per declare-once. This is the bulk of the coverage gap.
2. Write the ~14 **unwritten overlay profile emitters**.
3. *(Offered, not done)* generate the explicit **coverage-gap worklist** — the 935 annotated leaves with no corresponding ontology term — to scope step 1.

---

## Thread 2 — Bounded-context modelling (ODR-0019, ODR-0020, ADR-0026)

### Context

How to represent the DDD bounded contexts (6 industry + 5 upstream + 2 spanning; see `src/pages/modelling/bounded-contexts.astro`) in the ontology. Deliberated via the Linked Data Council ([ODR-0001](ontology/odr/ODR-0001-linked-data-council-methodology.md)) — Queen Kendall, DA Davis, 6-expert panel, run as real reasoning agents.

### Decisions

- **[ODR-0019](ontology/odr/ODR-0019-bounded-context-representation.md) — Bounded-Context Representation** (`accepted`, `pattern`; council `session-019`, both rounds 7–0): **single `opda:` namespace** (not per-context namespaces — multi-membership makes them impossible without the forbidden `owl:sameAs`); bounded contexts as a **SKOS `ConceptScheme`**; membership via `opda:servesContext` (derived) + `opda:definedInContext`; **homonyms disambiguated by distinct LOCAL NAMES, not namespaces** (Guizzardi's identity-criterion test); **Rule 8 YAGNI gate** (no polysemy machinery until ≥3 attested collisions + a named consumer).
- **[ODR-0020](ontology/odr/ODR-0020-bounded-context-scheme-and-mapping.md) — Bounded-Context Scheme and Mapping** (`accepted`, `pattern`; council `session-020`): one **flat `opda:BoundedContextScheme` of the 6 industry contexts only**; **upstream authorities OUT** as `opda:Organisation`/`prov:Agent` via `opda:consumesFrom` (never `servesContext` — they own no overlays, so not derivable); **spanning concerns OUT** (derived from `servesContext` multiplicity; already homed in ODR-0006/0007); a **4-bucket mapping rule** (single-context / multi-context / upstream-consumesFrom / untagged-scaffolding) **derived from the SHACL profiles**.

### Implementation ADR

- **[ADR-0026](adr/ADR-0026-bounded-context-scheme-emission.md) — Bounded-Context Scheme Emission** (`accepted`): new `emitters/contexts.py` → `opda-contexts.ttl` (scheme + 6 concepts + the 3 annotation predicates); **fix `profiles.py:250-251`** (currently hardcodes `opda:overlaysContext → https://w3id.org/opda/profiles/foundation`, a profile-layer IRI — should target the industry context concept); dormant SHACL-AF `CONSTRUCT` (per ODR-0017) for `servesContext`; regenerate + re-pin byte-identity CI.

### Status: DECIDED, NOT EMITTED

Verified: **no** `opda:BoundedContextScheme`, **no** context concepts, **no** `opda:servesContext`/`definedInContext` in any TTL; `opda:overlaysContext` still points at the profile layer. The 23 existing SKOS schemes are all *value* vocabularies — none a context scheme.

### Next steps (Thread 2)

Implement **ADR-0026** (emitter + `profiles.py:250` fix + dormant derivation rule + regenerate). Blocked in part by Thread 1's unwritten profile emitters (the derivation reads `overlaysContext`/`requires` from the profiles).

---

## Thread 3 — Decision-record indexing in AgentDB (`odr-index` fix + ADR-0027)

### `odr-index` skill fix

The global `odr-index` skill was the **wrong lineage** (MADR / ODR-0095 / Council-411 / ADR-0211 — records that don't exist in opda) and **rejected** opda's `kind`/`scope`/`council` frontmatter. Rewrote `~/.claude/skills/odr-index/SKILL.md` to the local **DCAP** (9-key frontmatter + 6-section body) + `odr-create`'s AgentDB record mapping. (`odr-create`, `adr-create`, `odr-review`, `adr-review`, `adr-index` were already correct; only `odr-index` was stale. Saved as a cross-session memory note: `opda-odr-format-vs-skills`.)

### Indexed the corpora

- **ADRs (27):** records `adr/ADR-NNNN` (tier `semantic`) + `adr-patterns` memory + the ADR dependency graph. Fixed 1 blocker: **ADR-0023** status `"superseded by ADR-0024"` → `"superseded"`.
- **ODRs (20):** records `odr/ODR-NNNN` + `odr-patterns` memory + a **236-edge dependency graph** (118 forward + 118 inverse via `agentdb_causal-edge`: 1 `supersedes`, 35 `implements`, 82 `depends-on`, + inverses). Fixed 5 conformance blockers: removed non-schema `wg-decision` from **ODR-0004/0008**; demoted extra `## Diagrams` / `## Decision rationale` from H2 to H3 in **ODR-0006/0009/0015** (content preserved).
- Verified traversable (`causal-query` both directions; status-consistency ODR-0014 ↔ ODR-0002).

### ADR-0027 — Council-session indexing

- **[ADR-0027](adr/ADR-0027-council-session-indexing-in-agentdb.md) — Council-Session Indexing in AgentDB** (`accepted`): index council *sessions* (the deliberation behind ODRs; ODR-0001) into **four complementary stores** for total coverage:
  1. `memory_store` namespace `council-sessions` — **recall** (semantic search of deliberations + re-open triggers).
  2. `causal-edge` `session ⇄ ODR` — **provenance** traversal.
  3. ReasoningBank trajectory store — **learning** (distil winning argument patterns).
  4. hierarchical `episodic` tier under `council/*` — **enumeration** (flagged in-record as *redundant with #1 + git; included only for total coverage*).
- **Sessions stay NON-records, keyed on session id** (`session-NNN`, `scope-check-1`); only ODRs are records. The strongest justification is #1's **trigger-indexing** — it makes ODR-0001's re-open triggers / held-as-live dissents queryable, the ontology-side parallel of the ADR-0005 deferred-work register.
- Record + `adr-patterns` memory + 4 dependency edges registered.

### Status: ADR written + registered; the 4 indexings NOT executed

### Next steps (Thread 3)

Execute **ADR-0027**: index the **~20 existing sessions** into the four stores — per session extract the verdict + named re-open-triggers/dissents (not the whole transcript) → `council-sessions` namespace + episodic tier; wire the `session↔ODR` edges; write the ReasoningBank trajectories.

---

## Files created / modified this session

- **New ODRs:** ODR-0019, ODR-0020 (+ `council/session-019-*`, `council/session-020-*` transcripts).
- **New ADRs:** ADR-0026, ADR-0027.
- **Modified ODRs (index conformance):** ODR-0004, ODR-0006, ODR-0008, ODR-0009, ODR-0015.
- **Modified ADR:** ADR-0023 (status fix).
- **Skill (global):** `~/.claude/skills/odr-index/SKILL.md` (rewritten to opda's DCAP format).
- **AgentDB:** 20 `odr/` + 27 `adr/` records; `odr-patterns`/`adr-patterns` memory; 236 ODR edges + the ADR edges.
- **Cross-session memory:** `opda-odr-format-vs-skills` (the skill-lineage gotcha).

> All `docs/adr/*`, `docs/ontology/odr/*`, and the 5 modified-ODR / 1 modified-ADR changes are **uncommitted** in the working tree.

## Outstanding work — consolidated to-do

1. **[BIG] ODR-0008 935-leaf descriptive walk** — map the 935 annotated leaves; tracked at **ADR-0005 §G11**. The bulk of the schema→ontology coverage gap.
2. **Write the ~14 unwritten overlay profile emitters** (only `baspi5` emitted).
3. **Implement ADR-0026** — bounded-context scheme emission + `profiles.py:250` fix + dormant derivation rule + regenerate.
4. **Execute ADR-0027** — council-session indexing into the four stores.
5. *(Optional)* generate the explicit **coverage-gap worklist** to scope #1.

## Key pointers

- Entity counts: `source/03-standards/ontology/opda-*.ttl`; `source/00-deliverables/semantic-models/{data-dictionary-canonical.json, business-glossary.ttl, glossary-merged.json}`.
- Descriptive stub: `source/03-standards/ontology/opda-descriptive.ttl` (5 classes, 0 datatype properties).
- `overlaysContext` bug: `tools/opda-gen/src/opda_gen/emitters/profiles.py:250-251`.
- Bounded-context source-of-truth (6+5+2): `src/pages/modelling/bounded-contexts.astro`.
- Deferred-work register: `docs/adr/ADR-0005-deferred-work-register.md` §G (esp. G11).
