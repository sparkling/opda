# Migration Plan — `w3id.org/opda/#…` → `opda.org.uk/pdtf/…` (ADR-0006 frozen scheme)

**Author:** Henrik (with Claude). **Date:** 2026-06-02. **Status:** plan ratified, not yet executed.
**Implements:** the frozen namespace scheme in [ADR-0006](./adr/ADR-0006-w3id-opda-ontology-namespace.md) (definitive block) + Council session-037.
**Prereq context:** [HANDOVER-2026-06-02](./HANDOVER-2026-06-02-jena-toolchain-pyshacl-retire-and-url-scheme.md) §"What's open" item 1.

> This is a **structural kind-namespace split, not a find-replace.** Terms, shapes, SKOS schemes, named graphs, and physical/governance artefacts each land in a *different* sub-namespace. A blanket string-swap of `w3id.org/opda` → `opda.org.uk/pdtf` is **wrong** (it keeps the hash, keeps per-module IRIs, and merges kinds that must split). The surface was mapped by four scoped agents; their corrected findings are folded in below.

---

## 1. Canonical target scheme (governs)

Base **`https://opda.org.uk/`** · slash · **no hash** · no version-in-IRI · flat term namespace.
`@prefix opda: <https://opda.org.uk/pdtf/> .`

| Kind | New IRI shape | Source of mint |
|---|---|---|
| Term (class / property) | `…/pdtf/Property`, `…/pdtf/evidenceType` | `OPDA = Namespace("https://opda.org.uk/pdtf/")` |
| **SKOS scheme** | `…/pdtf/scheme/role` | new `OPDA_SCHEME` (ruling #1) |
| **SKOS concept** | `…/pdtf/scheme/role/Buyer` | nested under scheme |
| **SHACL shape node** | `…/pdtf/shape/Baspi5_PropertyShape` | new `OPDA_SHAPE = …/pdtf/shape/` |
| Profile (form overlay) | `…/pdtf/shape/profiles/baspi5` (no version) | `OPDA_SHAPE` |
| Named graph (logical grouping) | `…/pdtf/graph/foundation`, `…/pdtf/graph/inferred/entailment` | `OPDA_GRAPH = …/pdtf/graph/` |
| Ontology IRI | one `…/pdtf/` + `owl:versionInfo "1.0.0"` + `owl:versionIRI …/pdtf/harness/release/1.0.0/` | `foundation.py` |
| Per-module IRIs | **collapsed** — modules contribute to the single `/pdtf/` ontology; **no per-module / per-module-shape / per-module-version IRIs** | — |
| ODR anchor | `…/pdtf/harness/odr/ODR-0011/section-5a` (hash→slash) | `odr_ref()` helper |
| ADR link | `…/pdtf/harness/adr/ADR-0007-ontology-generator-specification` | `adr_ref()` helper |
| data-dictionary entry | `…/pdtf/harness/data-dictionary/propertyPack.x.y` (hash→slash) | `dd_entry()` helper |
| instance / test data | `…/pdtf/harness/data/…` | translators |
| release snapshot | `…/pdtf/harness/release/1.0.0/` | `release_iri()` |

**Standard vs physical (Baker's placement test, one-directional):** core `/pdtf/` + `/pdtf/scheme/` + `/pdtf/shape/` + `/pdtf/graph/` are the **logical** standard; `/pdtf/harness/` holds **physical** artefacts + governance. Nothing in core may *depend on* `/pdtf/harness/` (see ruling #2 — `dct:source` citations are comments, not dependencies).

### Do NOT touch (external / out-of-scope)
`trust.propdata.org.uk/vocab/` · `dpv`, `dpv/pd` · all W3C (`rdf rdfs owl shacl skos vann prov time xsd`) · `creativecommons.org` · FCA/ICO/HMLR regulator citations · `www.basp.uk/forms/*` (external form publisher) · `urn:opda:exemplar:*` (internal URN).

---

## 2. Decision record (directing-authority rulings, 2026-06-02)

1. **`/scheme/` disambiguation (blanket).** All SKOS concept schemes move under `…/pdtf/scheme/`; concepts nest beneath. This frees the flat term namespace so property `opda:role` (`…/pdtf/role`) no longer collides with the `role` scheme (`…/pdtf/scheme/role`), and pre-empts every other latent scheme-vs-term clash. **Supersedes the ADR-0006 definitive-block scheme/concept row** → ADR-0006 amendment required. `scheme` joins the collision-guard reserved list.
2. **`dct:source` is a comment, not a dependency.** Implementers of the standard will not hold the ODRs and are never required to resolve them, so a `dct:source` → harness ODR/ADR/dd is a citation, not a core→harness dependency — **keep all ~50, migrate the strings.** The one genuine violation — `opda:consumesFrom`'s `rdfs:isDefinedBy → ODR-0020` (a definitional pointer to a physical location) — is **fixed**: repoint `rdfs:isDefinedBy` to the core ontology `…/pdtf/` (per session-022's "isDefinedBy → owning module" rule) and demote the ODR-0020 reference to `dct:source`.
3. **Logical grouping ≠ physical document.** A named graph is a logical grouping → `/pdtf/graph/`. Physical documents → `/pdtf/harness/` only. There are **no document IRIs in core** — the per-module annotation/shape *document* IRIs are removed (they were conflating serialised files with logical graphs).
4. **No `forms` family.** `_SCHEMA_LEAF_AUTHORITY = https://w3id.org/opda/forms` is **dead** (0 occurrences in the emitted corpus; referenced only by `schema_leaf_sources()`, which no emitter imports). The real schema-leaf-path `dct:source` target that lands is the **data-dictionary** IRI (575× — already in scope). The constant's string is updated for base-consistency only and flagged as dead; **no `/pdtf/harness/forms` segment is created.**

---

## 3. Measured surface (from scoped agent sweeps)

| Domain | Count | Notes |
|---|---|---|
| `OPDA` `Namespace` defs (emitters) | 9 | foundation, shapes, profiles, vocabularies, contexts, annotations + 3 modules |
| Emitter URIRef/IRI constants | ~31 | foundation 6, shapes 7, annotations 6, profiles 2, vocabularies 2, 6 module emitters ×~2 |
| ODR refs | 117 (19 distinct ODRs) | `shapes.py` 37, `vocabularies.py` 15, `descriptive.py` 11, … |
| ADR refs | 31 (8 distinct ADRs) | `profiles.py` 11, … (mostly inline header strings) |
| data-dictionary refs | 45+ via **5 duplicated** `_dd_source()` helpers | vocabularies, property, transaction, descriptive, agent |
| Loader/config/CI-infra sites | 15 | `fuseki-load.mjs`, `inference_closure_test.py`, `term_sourcing.py`, `leaf_resolver.py` |
| CI gate `OPDA` defs | 6 | three_graph, dup_declaration, profile_contract, baspi5_roundtrip, descriptive_roundtrip, category_g_coverage |
| Test namespace defs + assertions | 19 files, ~300+ sites | heaviest: `test_descriptive.py` ~122 |
| Emitted corpus | 23 TTL + 13 profiles + **17 hand-maintained exemplars** + 17 generated reports + 1 TS fixture | exemplar *data* files hand-edited; reports regenerated |

**No-change confirmed:** `config/fuseki-config.ttl` (assembler only, no opda IRIs), `scripts/build-with-data.mjs` (endpoint hosts only).

---

## 4. Phased execution (each phase ends green before the next)

### Phase 0 — single source of truth
New `tools/opda-gen/src/opda_gen/namespaces.py` exporting:
`OPDA` (`…/pdtf/`), `OPDA_SCHEME` (`…/pdtf/scheme/`), `OPDA_SHAPE` (`…/pdtf/shape/`), `OPDA_GRAPH` (`…/pdtf/graph/`), `OPDA_HARNESS` (`…/pdtf/harness/`); helpers `odr_ref(n, section)`, `adr_ref(slug)`, `dd_entry(dotted)`, `release_iri(v)`. Fold the **5 duplicated `_dd_source()`** into `dd_entry`.
**Flatten-collision guard:** fail loudly if any term local-name equals a reserved segment (`scheme`, `shape`, `graph`, `harness`, `profiles`, `release`, `data`, `odr`, `adr`, `data-dictionary`).

### Phase 1 — emitters import the SoT (12 files)
- `foundation.py`: ontology IRI → `…/pdtf/`; **drop** `_VERSION_IRI` slash path → `owl:versionInfo` + `release_iri("1.0.0")` as `owl:versionIRI`; `_SHAPES_GRAPH_IRI`/`_ANNOTATIONS_GRAPH_IRI` → `…/pdtf/graph/…`; `_OPDA_NS_LITERAL` + `vann:preferredNamespaceUri` + `sh:declare` namespace → `…/pdtf/`.
- `shapes.py` + `profiles.py`: mint shape **nodes** under `OPDA_SHAPE`; profiles → `…/pdtf/shape/profiles/<form>` (drop `/0.1.0/`).
- `vocabularies.py`: SKOS schemes/concepts under `OPDA_SCHEME`; retire/repoint unused `OPDA_V`.
- Module emitters (property, agent, transaction, claim, governance, descriptive): **collapse** per-module ontology/shape/annotation/version IRIs → single `/pdtf/` ontology + `/pdtf/graph/…` graphs.
- Route all 117 ODR + 31 ADR + 45 dd refs through helpers (hash→slash + harness).
- Fix `opda:consumesFrom` `rdfs:isDefinedBy` (ruling #2) — verify the single site first.

### Phase 2 — loader / config / CI-infra (15 sites)
- `scripts/fuseki-load.mjs`: `graphIriFromFilename()`, `ENTAILMENT_GRAPH`, the 8 `INSERT { GRAPH <…> }` rules → `…/pdtf/graph/…`.
- `ci/inference_closure_test.py`: `ENTAILMENT_GRAPH` (line 54), dynamic `graph/{name}` (133), the 7 SAFE_RULES, the R7 hardcoded `#EPCCertificate`/`#Property` assertions (267-268).
- `term_sourcing.py` `_SCHEMA_LEAF_AUTHORITY` (string update only — dead), `inputs/leaf_resolver.py` `OPDA` def.
- `config/fuseki-config.ttl` + `build-with-data.mjs`: confirmed no change.

### Phase 3 — re-emit + re-pin
- `emit --output source/03-standards/ontology/` → 23 TTL + 13 profiles.
- **Hand-edit the 17 exemplar *data* files** (`@prefix opda:` + body IRIs) under `exemplars/`.
- `emit-exemplar-reports` → regenerate the 17 expected reports.
- Re-pin `ci-byte-identity`. **Confirm the EPCCertificate fix (586fcc5) survives the re-emit** (diff check).

### Phase 4 — tests + fixtures
- 19 test-file `Namespace` defs + ~300 assertion sites.
- `src/lib/__fixtures__/entity-property.json` (manual).
- `tests/baspi5_round_trip/{translators,test_traceability}.py` — incl. instance data `…/opda/data/baspi5/<txid>/` → `…/pdtf/harness/data/…`.

### Phase 5 — ADR-0006 amendment + docs + status
- Amend ADR-0006: add the `/pdtf/scheme/` segment (ruling #1); reconcile the body's scheme/concept row.
- Update ODR/ADR markdown cross-references to the slash/harness scheme.
- Flip ADR-0006 `proposed → accepted` once gates are green.
- **B3 re-index stays FORBIDDEN** — new records via file edits only.

### Phase 6 — Definition of Done (auto-provisioned Jena; JDK 17+ on PATH)
```bash
cd tools/opda-gen && .venv/bin/python -m pytest -q                       # 345
.venv/bin/python -m opda_gen {ci-byte-identity|ci-three-graph|ci-dup-declaration|
  ci-profile-contract|ci-descriptive-roundtrip|ci-category-g-coverage|
  ci-baspi5-roundtrip|ci-inference-closure}                              # 8 gates
PYTHONPATH=tools/opda-gen/src .venv/bin/python -m pytest tests/baspi5_round_trip -q  # 27
npm run build:data                                                       # live Fuseki end-to-end (Java + network, no Docker)
```

---

## 5. Risks / watch-items

- **`opda:role` collision** — resolved by ruling #1 (`/scheme/`). Verify `ci-dup-declaration` is content with property `…/pdtf/role` + scheme `…/pdtf/scheme/role` coexisting.
- **Other latent scheme/term clashes** — the collision guard (Phase 0) is the backstop; it must run during emit, not just at review.
- **Hand-maintained exemplars** — the 17 `exemplars/*.ttl` data files are NOT regenerated; they must be hand-edited or byte-identity/round-trip fails silently against stale IRIs.
- **`rdfs:isDefinedBy` fix** — confirm only the one `opda:consumesFrom` site exists before changing; session-022 rule is "isDefinedBy → owning module."
- **Per-module collapse** — dropping per-module `owl:Ontology` IRIs may affect `owl:imports` chains and the three-graph / dup-declaration gates; re-run those specifically after Phase 1.

---

## 6. Delivery

One branch off `main` (which already carries the Jena toolchain + frozen ADR-0006). **Do not push** — push to `main` triggers the Cloudflare Pages deploy via CI ([[opda-deploys-via-ci-only]]); that is the user's call after gates are green.
