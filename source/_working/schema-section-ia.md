# Schema section — Information Architecture

**Executive summary.** The Schema section is the narrative spine of the PDTF data model: it explains what a transaction *is*, what a property pack *contains*, and where every leaf in the ~8,458-path schema lives in a coherent conceptual world. Where the data dictionary (page 13) is a flat browser and the business glossary (page 14) is a concept index, the Schema section is the **structured story**. It is organised by **aggregate** — the smallest set of leaves that move, validate, and make sense together — not by theme, persona, or schema folder. Aggregates collapse the false dichotomy between "entity classes" and "DDD aggregates" because in PDTF each top-level entity is instantiated at most once per transaction. The IA proposes **11 pages**: a landing/orientation page, a transaction-state page, eight aggregate pages, and a single cross-cutting page covering overlays and tasks. Bindings (JSON ↔ OWL ↔ SKOS) are absorbed into the landing page as a section, not given their own page. Declaration / evidence / derivation runs through every page as a leaf-level badge, explained once on the landing page as "Three kinds of fact."

---

## Design principles

1. **Aggregate boundary = page boundary.** A page contains exactly the leaves whose lifecycle, validation, and meaning travel together. The cohesion test: *can these leaves be authored, evidenced, and invalidated as one unit?* If yes, same page. If no, split.
2. **One canonical home per leaf.** Every leaf lives on exactly one page. Other pages that mention it carry a "Mentioned by" stub linking back. No leaf duplication, ever.
3. **Three kinds of fact as leaf-level badge, not page boundary.** Declaration, evidence, and derivation are orthogonal to aggregate. They render as a coloured badge on each leaf and are taught once. Splitting `heating` across two pages because part is declared and part is evidenced would break aggregate cohesion — so we don't.
4. **No duplication of neighbouring pages.** Data dictionary, business glossary, bounded contexts, overlays, concept taxonomy, and ontology pages already exist. The Schema section cross-links to them; it never re-implements them. Schema is the only place that tells the *structural story*.
5. **ER where it earns it.** ~15% of pages get a real entity-relationship diagram (Title, Charges, Parties, Documents, Searches, Planning, Leases). The rest are tables (~70%) and prose+example (~15%). ER for the sake of ER is banned.
6. **Generated scaffolding, curated narrative.** Tables, badges, leaf counts, overlay chips, stat-strips, and the find-a-field index are auto-generated from `data-dictionary-canonical.json`. Page intros, ER diagrams, and the "Why this aggregate exists" sections are hand-written. Drift between generation and curation is detected at build time.
7. **Property page is honest about a schema defect.** PDTF lacks a clean `Property` aggregate; address, UPRN, INSPIRE-ID, and title-linked-address are scattered. The Property page documents this as discovery, not imposition, and flags it as a known schema issue.

---

## Sidebar navigation

```
Schema
├── 34  Section overview
├── 35  Transaction & participants
├── 36  Chain, milestones & contracts
├── 37  Property
├── 38  Legal estate & title
├── 39  Built form, condition & valuation
├── 40  Utilities & energy
├── 41  Local context & searches
├── 42  Encumbrances & completion
├── 43  Evidence, documents & declarations
└── 44  Overlays, tasks & cross-cuts
```

(File-id slots are indicative; the current `34-physical-architecture.html` slot is reused as the section overview — see Open issues.)

---

## Page list

### 34 — Section overview
**Role.** Landing, orientation, wayfinding. Merges Tech Writer's L1 orientation, UX's persona tiles, and the bindings explainer into one page.
**Content blocks.** Hero with the transaction model in one sentence; entity map (top-level aggregates and their cardinality); state-machine teaser linking to page 35; "Three kinds of fact" section (declaration / evidence / derivation badges defined once); persona tiles (Seller, Buyer, Conveyancer, Surveyor, Lender, Estate Agent) each linking to a recommended reading path; find-a-field search (live index over 1,557 leaf names); "How this section relates to" cross-links; bindings section (JSON Schema, OWL, SKOS, SHACL, JSON-LD) as accordion.
**ER strategy.** One overview entity map (real ER). No tables.
**Cross-links.** 12 bounded contexts, 13 data dictionary, 14 business glossary, 16 overlays, 30 concept taxonomy, 31 ontology, 32 SHACL shapes, 33 JSON-LD mappings.

### 35 — Transaction & participants
**Role.** The state machine and the people. First substantive page because every other page hangs off transaction state.
**Content blocks.** Transaction state diagram; participant role taxonomy; participant identity, address, and contact leaves; capacity and authorisation patterns; sellersCapacity treated here as a participant attribute.
**ER strategy.** Real ER for participants ↔ transaction ↔ roles.
**Cross-links.** 12 bounded contexts (Estate Agency, Conveyancing), 30 concept taxonomy (participant roles), 16 overlays.

### 36 — Chain, milestones & contracts
**Role.** Process artefacts that live at the transaction level — not at the property level.
**Content blocks.** Chain structure; milestone catalogue; contract documents; completion artefacts that are transaction-level (not encumbrance-level).
**ER strategy.** Real ER for chain ↔ transactions ↔ milestones.
**Cross-links.** 35, 42 (encumbrances & completion).

### 37 — Property
**Role.** Property identity and discovery. Honest about the schema defect: PDTF has no clean Property aggregate.
**Content blocks.** Address (in multiple guises), UPRN, INSPIRE-ID, title-linked-address; how to reconcile; "Why this page is thin" note documenting the gap; pointers to where property-shaped data actually lives (38, 39, 40).
**ER strategy.** Prose + example. Small ER showing the four identity surfaces.
**Cross-links.** 38, 39, 40; Open issue flagged.

### 38 — Legal estate & title
**Role.** Tenure, title, ownership, leases, restrictions.
**Content blocks.** Freehold / leasehold tenure; HMLR title number; registered proprietors; lease terms; restrictions and notes; ownership history; leasehold management.
**ER strategy.** Real ER (title ↔ proprietors ↔ leases ↔ restrictions).
**Cross-links.** 12 (Conveyancing), 16 (overlays — LR data overlays), 53 HMLR LLC.

### 39 — Built form, condition & valuation
**Role.** Physical building and its valuation. Combines built form, condition, fixtures and fittings, and valuation under one aggregate because they share a lifecycle (survey → valuation → completion).
**Content blocks.** Built form (construction, year, storeys, dimensions); condition (defects, alterations, cladding); fixturesAndFittings (full schedule); valuation; surveys.
**ER strategy.** Table-dominant. One ER for survey ↔ defects ↔ remediation.
**Cross-links.** 12 (Surveying), 16 (overlays — TA10, RICS Home Survey).

### 40 — Utilities & energy
**Role.** Services, energy performance, environmental performance.
**Content blocks.** Heating; electricity; water and drainage; broadband and mobile; EPC (full structure — see "What goes where" below); renewable installations.
**ER strategy.** Tables. One small ER for EPC ↔ recommendations ↔ ratings.
**Cross-links.** 16 (overlays — EPC, NTS2), 31 (ontology — energy concepts).

### 41 — Local context & searches
**Role.** Everything outside the property boundary that affects it.
**Content blocks.** Local authority searches (CON29, CON29O); planning; environmental searches; flood; mining; transport; neighbourhood.
**ER strategy.** Real ER for search ↔ authority ↔ result.
**Cross-links.** 16 (overlays — CON29R, LLC1), 53 HMLR LLC, 54 sandbox pilots.

### 42 — Encumbrances & completion
**Role.** Things that bind the property to obligations or that resolve at completion.
**Content blocks.** councilTax (canonical home — lifecycle terminates here); charges; covenants; easements; service charges; ground rent; completion statements; apportionments.
**ER strategy.** Real ER for charges ↔ encumbrances ↔ completion.
**Cross-links.** 38, 36, 16 (overlays — TA6, TA7).

### 43 — Evidence, documents & declarations
**Role.** The claim layer. Documents, attachments, verifiable credentials, declaration metadata.
**Content blocks.** Document catalogue; attachment patterns; VC envelope structure (subsumed under "evidence"); declaration metadata (who declared, when, with what authority); evidence chains; derivation records.
**ER strategy.** Real ER for claim ↔ subject ↔ evidence ↔ document.
**Cross-links.** 31 ontology, 32 SHACL, 33 JSON-LD, 30 concept taxonomy.

### 44 — Overlays, tasks & cross-cuts
**Role.** The two cross-cuts that don't belong in any aggregate: overlay categorical membership and task-driven questions. Kept as one page (not two) because both are *filters over the same leaf universe*.
**Content blocks.** Overlay membership matrix (BASPI5, TA6, NTS2, CON29R, etc. — high-level view, deep detail on 16); task index (cladding, EWS1, knotweed, leasehold extension, shared ownership, new-build); how overlays and tasks are computed from the canonical model.
**ER strategy.** Table-dominant. No ER.
**Cross-links.** 16 overlays (deep detail), 13 data dictionary (filter by overlay), 14 business glossary.

---

## Cross-cutting features

- **Leaf-level badges (Decl / Evid / Deriv).** Every leaf in every table on every page renders with a coloured badge — green for declaration, blue for evidence, amber for derivation. Taught once on page 34. Generated from canonical data.
- **Overlay chips.** Each leaf carries chips for every overlay it appears in (BASPI5, TA6, etc.), linking to page 16 with the leaf pre-filtered.
- **Find-a-field search.** Live on every page; indexes all 1,557 leaf names plus aliases from the business glossary; deep-links to the canonical home page and scrolls to the leaf.
- **Two canonical examples reused everywhere.** A leasehold flat in London (with cladding, service charge, EWS1) and a freehold semi in Manchester (with EPC C, planning history, no chain). Every page uses one or both — same UPRNs, same participants, same title numbers throughout.
- **Stat-strip per page.** Auto-generated: leaf count, % declaration / evidence / derivation, top three overlays, count of leaves with examples.

---

## What goes WHERE

- **councilTax.** Canonical home: **42 Encumbrances & completion** (lifecycle terminates at completion apportionment). Mentioned-by stubs on 36 (completion statement) and 41 (local authority context).
- **cladding.** Canonical home: **39 Built form, condition & valuation** (under condition). Mentioned-by stubs on 44 (task index — cladding/EWS1 task) and 16 (overlays — TA6, building safety overlay).
- **EPC.** Canonical home: **40 Utilities & energy** (full EPC structure with recommendations and ratings). Mentioned-by stubs on 39 (condition references EPC band) and 16 (NTS2 overlay).
- **fixturesAndFittings.** Canonical home: **39 Built form, condition & valuation** (shares lifecycle with completion). Mentioned-by stub on 36 (forms part of contract pack).
- **participants[].address.** Canonical home: **35 Transaction & participants** (address as participant attribute, not property attribute). Mentioned-by stub on 37 (Property page — explicit disambiguation: this is *not* the property address).
- **sellersCapacity.** Canonical home: **35 Transaction & participants** (capacity is a participant attribute). Mentioned-by stub on 38 (legal estate — capacity governs ability to convey).

---

## Open issues

1. **Fix the schema or document the defect?** The Property page exists because PDTF lacks a clean property aggregate. This IA documents the defect; it does not decide whether the schema should be refactored. Recommend an ADR.
2. **File-id slot for the current `34-physical-architecture.html`.** Proposal: reuse slot 34 as the new section overview, retire the "Physical model" framing, and renumber the remaining ten pages 35–44. Alternative: keep 34 as a deep-link target and start the new section at 35.
3. **Overlay+tasks as one page (44) or two.** This IA keeps them together because both are filters. If the task index grows past ~12 tasks, split.
4. **Bindings as accordion on 34 vs dedicated page.** Currently absorbed into the landing page; if bindings content exceeds ~600 words, promote to a dedicated page 45.
5. **Verifiable Credentials envelope depth.** Subsumed under page 43 "evidence." If VC tooling becomes load-bearing, may need a dedicated page.
6. **Persona-driven reading paths.** Defined as wayfinding on page 34, not as pages. If usage data shows personas dominate navigation, revisit.

---

## Implementation notes

**Auto-generated from `source/00-deliverables/semantic-models/data-dictionary-canonical.json`:**

- Leaf tables on every page (name, type, cardinality, badge, overlay chips, example).
- Stat-strip per page (counts, percentages, top overlays).
- Find-a-field search index.
- Overlay membership matrix on page 44.
- "Mentioned by" stubs (computed from canonical home assignments).
- Leaf badges (declaration / evidence / derivation classification per leaf).

**Hand-curated:**

- Page intros and "Why this aggregate exists" sections.
- ER diagrams (Mermaid source, exported to PNG via `mermaid-export` skill).
- The two canonical examples (leasehold flat, freehold semi).
- Persona tiles and recommended reading paths.
- Task index entries on page 44.
- "Three kinds of fact" explainer on page 34.

**Drift detection.** Build step computes leaf-to-page assignment from canonical data; fails build if (a) any leaf has no canonical home, (b) any leaf has more than one canonical home, (c) any "Mentioned by" stub references a leaf not present on the linked page, or (d) any ER diagram references an entity name not in the canonical model. Auto-generated tables are regenerated on every build; manual edits to generated regions are rejected by a pre-commit hook.

**Page generation order.** 34 first (landing depends on nothing). Then 35, 36 (transaction-level). Then 38, 42 (legal spine). Then 39, 40, 41 (property content). Then 37 (Property — written last, because it documents what the others *didn't* cover). Then 43 (claim layer). Then 44 (cross-cuts).

---

*Synthesised by a 6-agent swarm (Queen / Devil's Advocate / Ontologist / UX Designer / Tech Writer / Data Engineer) via dialectic exchange. Saved 2026-05-15.*
