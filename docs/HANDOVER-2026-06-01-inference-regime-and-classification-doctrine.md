# Handover — Inference regime + classification-over-inheritance doctrine (2026-06-01)

**Author:** Henrik (with Claude). **Scope:** one long session that (1) replicated the sibling `~/source/hm/semantic-modelling` **load-time inference + Jena/SHACL-1.2 + RDF-1.2 toolchain** into opda as new governance + a wired loader step; (2) ran **two councils** (session-035 evidence aliases/faceting, session-036 classification-vs-inheritance) the *corrected* way after a method failure; (3) on directing-authority instruction, **adopted the hm classification-over-inheritance doctrine wholesale** (ODR-0027) and **re-modelled the evidence domain** to it — retiring the `…Evidence` subclasses in favour of coded classification. **Status: 7 commits on `main` (`87c611d`…`3158a06`), ALL local (NOT pushed; 15 unpushed total vs `origin/main` incl. the prior 8). Full gate suite green (7 CI gates + 337 opda-gen pytest + 27 repo-root round-trip); byte-identity clean. Dev server was left running on http://localhost:4330/.**

> Continues [HANDOVER-2026-06-01-B4-B1-B2-and-council-034.md](./HANDOVER-2026-06-01-B4-B1-B2-and-council-034.md). That session ended with B1/B2/B4 shipped and B3 (AgentDB re-index) flagged as the cleanest next action. **B3 was deliberately NOT done — the directing authority instructed: do NOT run `odr-index` or `adr-index` until explicitly told.**

---

## TL;DR

opda needed an inference story (it had a plain Fuseki loader with **no** entailment, plus a dormant OWL-2-DL projection — the full-OWL path the directing authority does *not* want). A background swarm analysed hm's model; opda adopted it: **RDFS + a curated OWL-RL-*safe* closure materialised at Jena load time** (not full DL), **SHACL 1.2 via Jena**, **RDF 1.2 in full on a Jena-only toolchain** (no `rdflib` downgrade) → ODR-0025/0026 + ADR-0035/0036/0037. Then two councils refined the **evidence model**; the directing authority ultimately **adopted hm's classification-over-inheritance doctrine wholesale (ODR-0027)** and the evidence subclasses were **retired** — evidence-kind is now a **coded `isMemberOf` classification** (`opda:evidenceType`), `opda:AttachedDocument` is the one retained Kind, `opda:Evidence` is a RoleMixin. The **records are complete and the model is implemented + green**; the **Jena toolchain itself (validator swap, live inference run, image pin) is `accepted` but NOT built** — flagged pending, exactly like prior accepted-but-pending work.

---

## What shipped — 7 commits on `main` (all local; NOT pushed)

| Commit | What |
|---|---|
| `87c611d` | **Governance hygiene.** The `/council` skill (+ ODR-0001) is the SOLE authority for council mechanism. Removed the 3 CLAUDE.md instructions routing councils to `hive-mind` (they conflicted with the skill's agent-fan-out + Agent-Teams default and caused a wrong council run). Kept all general swarm/hive *orchestration* guidance. Added 2 hm hand-off docs. |
| `603cb76` | **Inference regime ratified + implemented (partial).** ODR-0025/0026 + ADR-0035/0036/0037 (`accepted`); `config/opda-rdfs-plus.rules` (renamed from `opda-owl-rl-safe.rules`, ODR-0029 R5); `materializeEntailments()` + consistency gate wired into `scripts/fuseki-load.mjs`; ODR-0004 §3a + `opda-inference.md` re-scoped (DL-projection intent superseded). **Plus session-035** evidence work: aliases retired → `skos:altLabel`/`skos:exactMatch`, `opda:evidenceType` facet added, Evidence→RoleMixin / Vouch→Relator, value-keyed shapes. ODR-0009/0011/0026 + ADR-0011/0012 amended. |
| `070582e` | session-036 record accuracy fix (the value-keyed obligation is `sh:or` material implication, NOT `sh:qualifiedValueShape`). |
| `1e5171b` | 3 record back-references (ODR-0008 §Q5a→cascade; ADR-0014 pyshacl→Jena-migration-pending; ADR-0021 loader-amendment note). |
| `4ec3de1` | **ODR-0027** — the classification/roles/inheritance/SKOS doctrine (hm-aligned), recorded in full. |
| `689eed8` | ODR-0027 reflected corpus-wide (ODR-0011 §8a pointer, ODR-0009 §R6 amendment, ADR-0011/0012, adoption row) — evidence re-model recorded as accepted-but-pending. |
| `3158a06` | **Evidence re-model IMPLEMENTED (ODR-0027 §R6).** `claim.py` retired the 3 `…Evidence` subclasses; `opda:Evidence`=RoleMixin; `opda:evidenceType`=coded classifier; `opda:AttachedDocument`=the one Kind; `attestedBy` re-homed; `shapes.py` dropped the `*CoherenceShape`s; `annotations.py` re-keyed the 3 DPV records; 3 exemplars re-typed `a opda:Evidence`. Records flipped pending→done. |

---

## ⚠ Things a reader MUST know

1. **The classification-over-inheritance doctrine is now opda law: [ODR-0027](./ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md).** Adopted wholesale from hm (hm ODR-0010/0014/0016/0023/0025/0026/0092). The rules: **R1** classification = `isMemberOf` (coded SKOS, the *default*) OR `isA` (subclass — *only* genuine Kinds with their own identity criterion; the ODR-0011 §8a cascade is the `isA`-admission test). **R2** a *facet* = type-borne attributes (presupposes the type, does **not** classify) — so `opda:evidenceType` is a **classifier, not a facet** (the Ranganathan/hm "facet=axis" overload is flagged; opda's canonical meaning is type-borne-attributes). **R3** Roles are anti-rigid → **NEVER** `rdfs:subClassOf` a Kind. **R4** every enum/vocabulary/axis = a `skos:ConceptScheme` coded value, never a subclass tree. **R5** domain/range documentary; SHACL enforces; enforcement **value-keyed**. **R6** the evidence reversal (below).
2. **ODR-0027 §R6 SUPERSEDED council session-036.** session-036 (8–0) had *kept* the three `…Evidence` subclasses (dual layer). The directing authority then adopted the hm approach, which says a Role is never subclassed — and "evidence is a role a document plays." So the subclasses were **retired**. This is a directing-authority override of a unanimous council, recorded as such. **Do not "restore" the subclasses thinking session-036 governs — ODR-0027 R6 is the current authority.**
3. **The evidence model, as emitted now:** `opda:Evidence a owl:Class, opda:RoleMixin`; **no `DocumentEvidence`/`ElectronicRecordEvidence`/`VouchEvidence` classes**; `opda:evidenceType` (datatype, `sh:in opda:EvidenceMethodScheme` via `sh:targetSubjectsOf`) is the coded kind; `opda:AttachedDocument` is the one genuine Kind (a document *plays* the evidence role via the coded value, ODR-0024 §R7); `opda:attestedBy rdfs:domain opda:Evidence` (a role-borne facet); the Vouch obligation is value-keyed (`opda:EvidenceFacetShape`, `sh:or` material implication on `evidenceType="Vouch"`). The 3 short names live as `skos:Concept` notations in the scheme, never as classes.
4. **The inference TOOLCHAIN is `accepted` but NOT built — this is the main open work.** ADR-0035/0036/0037 are accepted *direction*; the code is not there:
   - **pyshacl is still the validator everywhere** (`cli.py`, the round-trip harness, exemplar reports). The pyshacl→Jena SHACL-1.2 swap (ADR-0036/0037) is **gated on a parity check** that does not exist yet. Evidence shapes were authored SHACL-Core specifically so they validate identically under either engine, keeping the eventual swap clean.
   - **`materializeEntailments()` is wired into `fuseki-load.mjs` but has NEVER run against a live Fuseki** — `build-with-data.mjs` (which invokes it) is Docker/CI-only and didn't run this session. No `ci-inference-closure` gate exists. `docker-compose.yml` still pins `stain/jena-fuseki:latest` (ADR-0036 calls for a Jena **6.1.0** image, ideally `apache/jena-fuseki`).
5. **B3 re-index is FORBIDDEN until explicitly authorised.** The directing authority said do NOT run `odr-index` or `adr-index`. New records (ODR-0025/0026/0027, ADR-0035/0036/0037) are registered in AgentDB via `hierarchical-store`, but the full graph re-index is **not** to be run without an explicit go.
6. **Council method was corrected mid-session and is now governed only by the `/council` skill.** A first council run was done wrong (no Agent-Teams cross-talk, padded roster, council→hive). Both real councils (035, 036) then ran the skill-correct way: **`agent-fan-out` + Agent-Teams `SendMessage` cross-talk, no hive.** Council-mechanism instructions were purged from CLAUDE.md + auto-memory; the skill is the single source of truth. (Two hm hand-off docs ask the hm team to do the same purge + an RDF-1.2 fix — see Key Pointers.)
7. **RDF 1.2: adopt in full on Jena; do NOT downgrade for `rdflib`.** ODR-0025 §R5: opda standardises on Jena (`riot`/`jena-shacl`) which parses RDF 1.2 triple terms natively; `rdflib`/pyshacl are retired from the RDF path (not kept as a crutch that would force a triple-term downgrade — the mistake the hm hand-off documents hm made).

---

## The councils (this session's governance output)

- **[session-035](./ontology/odr/council/session-035-evidence-alias-retirement-and-faceted-typing.md) — evidence-class alias retirement + faceted typing.** Full Council, 8 voices, Queen Kendall, DA Davis, `agent-fan-out` + SendMessage. 8–0–0: retire the `owl:equivalentClass` short-name aliases; keep the subclasses + a coded facet (dual layer); value-keyed enforcement; recast Evidence→RoleMixin, Vouch→Relator.
- **[session-036](./ontology/odr/council/session-036-classification-over-inheritance.md) — classification vs inheritance.** Full Council, 8 voices, Queen Kendall, DA Guizzardi. 8–0–0: adopt "prefer classification" as a *tested default* (the OntoClean cascade, codified in ODR-0011 §8a); **kept** the evidence subclasses; re-keyed enforcement value-not-class. **NB: its keep-the-subclasses disposition was later superseded by ODR-0027 §R6** (directing-authority adoption of the stricter hm Role-never-subclass rule).
- Both ran via the corrected method; working positions are in [`working/session-035/`](./ontology/odr/council/working/session-035/) and [`working/session-036/`](./ontology/odr/council/working/session-036/). Track-record rows in [adoption.md](./ontology/odr/council/adoption.md).

---

## What's open / next steps (suggested order)

1. **Build the Jena toolchain** (the real remaining implementation; ADR-0035/0036/0037):
   - Pin a real **Jena 6.1.0** Fuseki image in `docker-compose.yml` (verify the tag exists; ADR-0036 prefers `apache/jena-fuseki` over the unpinned community `stain/jena-fuseki`).
   - Run `npm run build:data` end-to-end so `materializeEntailments()` actually executes against Fuseki; confirm the union-graph SPARQL + the disjointness gate work at runtime.
   - Add a **`ci-inference-closure`** gate (ADR-0035 §Confirmation): inferred graph non-empty; subclass/inverse/transitive entailed; **no** R2-excluded triple (no `owl:sameAs`, no spurious `EPCCertificate a Property`).
   - Build the **pyshacl↔Jena parity harness** (ADR-0036 §Confirmation) over the 15 exemplars; once it passes, retire the pyshacl path (`cli.py`, round-trip harness).
2. **EPCCertificate emitter defect** (carried from the prior handover §8; ODR-0025 §R7 notes the safe closure does NOT manifest it, but the source mismatch — a `Property`-domain predicate on a non-`Property` subject — should still be fixed at the emitter).
3. **B3 re-index** — **only on explicit instruction** (`odr-index`/`adr-index`). The file + frontmatter edges are authoritative in the interim.
4. **hm hand-offs** — deliver `docs/hm-handoff-council-instruction-purge.md` and `docs/hm-handoff-rdf-1.2-triple-term-jena-fix.md` to an hm session (advisory; they respect hm's own `never_touch_other_projects` + `use_memory_tools_not_rm`).
5. **Push** — 15 commits unpushed vs `origin/main` (prior 8 + this session's 7). Deploys run via CI on push to main; left for the user.

---

## Key pointers

- **Doctrine:** [ODR-0027](./ontology/odr/ODR-0027-classification-roles-inheritance-skos-doctrine.md) (classification/roles/inheritance/SKOS). The cascade lives in [ODR-0011](./ontology/odr/ODR-0011-enumeration-vocabularies.md) §8a.
- **Inference:** [ODR-0025](./ontology/odr/ODR-0025-entailment-regime-and-inference-semantics.md)/[ODR-0026](./ontology/odr/ODR-0026-owl-rl-safe-ruleset-adoption-and-unevaluated-modelling-axioms.md); [ADR-0035](./adr/ADR-0035-load-time-owl-rl-safe-inference-materialisation.md)/[ADR-0036](./adr/ADR-0036-shacl-1-2-validation-via-apache-jena.md)/[ADR-0037](./adr/ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md). Rules contract: `config/opda-rdfs-plus.rules` (renamed from `opda-owl-rl-safe.rules`, ODR-0029 R5). Loader: `scripts/fuseki-load.mjs` (`materializeEntailments()`).
- **Evidence model:** `tools/opda-gen/src/opda_gen/emitters/modules/claim.py` (the re-model); `emitters/shapes.py` (EvidenceTypeValueShape + EvidenceFacetShape; coherence shapes removed); `emitters/annotations.py` (DPV records value-keyed). Emitted: `source/03-standards/ontology/opda-claim{,-shapes,-annotations}.ttl`. Exemplars: `…/exemplars/claim-with-{document,electronic-record,vouch}-evidence.ttl`.
- **Run the gates:** `cd tools/opda-gen && .venv/bin/python -m pytest -q` (337) and `.venv/bin/python -m opda_gen {ci-byte-identity|ci-three-graph|ci-dup-declaration|ci-profile-contract|ci-descriptive-roundtrip|ci-category-g-coverage|ci-baspi5-roundtrip}`. Re-pin = `emit --output source/03-standards/ontology/` then `ci-byte-identity` (re-run `emit-exemplar-reports` too if shapes/exemplars changed). Repo-root round-trip: `PYTHONPATH=tools/opda-gen/src tools/opda-gen/.venv/bin/python -m pytest tests/baspi5_round_trip -q`.
- **hm prior art:** `~/source/hm/semantic-modelling` — `config/hm-owl-rl-safe.rules`, `scripts/fuseki-load-ontology.sh`, `config/fuseki-config.ttl`; ODR-0010/0014/0016/0023/0025/0026/0092 + council sessions 103–105; ADR-0147 (Jena SHACL 1.2).

## Memory

Touched/written: [[opda-classification-over-inheritance]] (updated — the evidence-subclasses bullet now records the ODR-0027 §R6 reversal: subclasses RETIRED, coded classification, AttachedDocument kept; ODR-0027 named as the governing record). Council-mechanism memories were **deleted** this session (the `/council` skill is sole authority): `opda-avoid-hive-mind-cost`, `opda-council-rerun-after-failure`, `opda-council-methodology-state`, `opda-council-for-scope-forks`, `opda-council-s028-grounding`. Relevant survivors: [[opda-greenfield-no-wg-gate]] (directing authority ratifies; gates still apply), [[opda-deploys-via-ci-only]] (push triggers deploy — left for the user).

## State

7 commits on `main` since `e0f86c7` (`87c611d`…`3158a06`), **all local — NOT pushed** (15 total unpushed vs `origin/main`). Working tree clean. Full gate suite green (7 CI gates + 337 pytest + 27 repo-root round-trip); byte-identity clean. Doctrine recorded + reflected + evidence model implemented to it. Inference toolchain accepted-but-unbuilt (the main next implementation). Dev server left running on http://localhost:4330/.
