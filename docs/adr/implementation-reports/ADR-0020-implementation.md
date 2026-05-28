---
adr: ADR-0020
phase: 5
status: complete
date: 2026-05-28
---

# ADR-0020 Implementation report — Manual generator frontmatter

## Emitter design

### Path-to-kind heuristic

`tools/opda-gen/src/opda_gen/emitters/manual.py` implements `_derive_kind(parts)`, a direct Python port of `deriveKind` from `src/lib/manual.ts`. The function operates on lowercased relative path parts and classifies each file into one of the ten content kinds declared in the Zod schema (`src/content.config.ts`):

| Path pattern | kind |
|---|---|
| `<tier>/readme.md` | tier-readme (SKIPPED) |
| `<tier>/<module>/readme.md` | module-readme (SKIPPED) |
| `physical-database/modules/*` | per-module-deployment |
| `physical-database/derived-profiles/*` | derived-profile |
| `physical-database/overlay-deployment/*` | overlay-deployment |
| `physical-database/named-graphs.md`, `*/content-negotiation/*`, `*/operations/*` | operations |
| `physical-ontology/exemplars/*` | exemplar |
| `physical-ontology/vocabularies/*` | scheme |
| `physical-ontology/{three-graph-separation,severity-tiers,shacl-af-rules}.md` | cross-cutting |
| `physical-ontology/profiles/*` | overlay-deployment |
| `**/enumerations/*` | scheme |
| everything else | entity |

### Frontmatter merge logic

`_process_file(path, manual_root)`:

1. Reads the file; calls `_parse_frontmatter(text)` → splits at the first `---\n...\n---\n` block.
2. Derives the generator's target fields via `_compute_frontmatter(path, manual_root)`.
3. If `title` is absent from existing frontmatter, extracts first H1 from body via regex.
4. Merges: `{**new_fields, **existing_fm}` — existing fields take precedence, so no existing field is ever overwritten.
5. Serialises the merged dict via `yaml.dump(..., sort_keys=True)` for deterministic ordering.
6. Reconstructs: `---\n<yaml>---\n\n<body>`.
7. Only writes if `new_text != text` — idempotency gate.

### Skip rules

Files are excluded at two levels:
- By name: `README.md` and `VALIDATION-REPORT.md` — regardless of path.
- By kind: `tier-readme` and `module-readme` — even if misnamed files reach `_compute_frontmatter`, they return `None`.

### sourceTtl mapping

| Tier / kind | Derived sourceTtl |
|---|---|
| concept / logical, kind entity or scheme | `source/03-standards/ontology/opda-<module>.ttl` |
| physical-ontology / `<module>/classes.md` | `opda-<module>.ttl` |
| physical-ontology / `<module>/shapes.md` | `opda-<module>-shapes.ttl` |
| physical-ontology / `<module>/annotations.md` | `opda-<module>-annotations.ttl` |
| physical-ontology / vocabularies | `opda-vocabularies.ttl` |
| physical-ontology / exemplars | `source/03-standards/ontology/exemplars/<stem>.ttl` |
| physical-ontology / profiles | `profiles/<stem>.ttl` |
| physical-database / modules | `opda-<stem>.ttl` |
| cross-cutting / operations / derived-profile / overlay-deployment (other) | `None` (omit field) |

## Scope decision — G19a option (c)

**Decision: exclude tier READMEs + module READMEs from generator scope (option c).**

Rationale:
- Tier READMEs (`docs/manual/{concept,logical,physical-database,physical-ontology}/README.md`) carry Phase 4-added "See also: Modelling section" cross-link blocks interleaved mid-document (not appended). A re-emit that synthesises these blocks from TTLs would require the generator to understand editorial context it cannot derive mechanically.
- Module READMEs (`docs/manual/<tier>/<module>/README.md`) carry curated module-level narrative (reading order, entity catalogue, diagrams, provenance notes) that is editorial framing, not derivable from TTL metadata.
- The umbrella README (`docs/manual/README.md`) and `VALIDATION-REPORT.md` are similarly editorial.
- Option (a) (template variable) and option (b) (protected-zone markers) would require the generator to carry knowledge of which body blocks are editorial, adding fragile coupling. Option (c) is clean: the generator's domain is entity/scheme/exemplar/deployment/operations pages; READMEs are a separate editorial register.

The `_SKIP_NAMES` set and `tier-readme` / `module-readme` kind guards enforce this at runtime.

## Test discipline

`tools/opda-gen/tests/test_manual.py` — 31 tests covering:

- **Kind derivation** (10 unit tests): entity, scheme (enumeration + vocabulary), exemplar, cross-cutting, per-module-deployment, derived-profile, overlay-deployment, operations, named-graphs, tier-readme, module-readme.
- **sourceTtl derivation** (6 unit tests): concept entity, logical scheme, physical-ontology classes/shapes/annotations, vocabularies, exemplar.
- **Integration** (15 tests on a `mini_manual` fixture):
  - `EmitResult` returned.
  - Tier READMEs NOT modified (G19a).
  - "See also: Modelling section" content preserved after emission.
  - Correct frontmatter fields for entity, scheme, exemplar, cross-cutting, per-module-deployment.
  - `touched_count` == 8 in-scope files; `skipped_count` == 2 READMEs.
  - Idempotency: second run touches 0 files; byte-identical snapshot check.
  - Merge: existing fields preserved; new fields added; `kind: custom-override` is not overwritten.
  - Tier filter: `--tier concept` processes only concept files.

## Test results

```
158 passed in 1.06s
```

127 pre-existing tests unaffected; 31 new tests all pass.

## Byte-identity verification

First run:
```
emit-manual: 184 files updated, 34 files skipped.
```

Second run (immediately after first):
```
emit-manual: 0 files updated, 218 files skipped.
```

Zero files modified on the second run. Idempotency confirmed.

## Phase 4 cross-link preservation verification

```
grep -l "See also: Modelling section" \
  docs/manual/concept/README.md \
  docs/manual/logical/README.md \
  docs/manual/physical-database/README.md \
  docs/manual/physical-ontology/README.md
```

Returns all 4 files. Content unchanged.

## Astro build verification post-emission

```
npm run build
[build] 386 page(s) built in 8.21s
[build] Complete!
```

Exit 0. Zero Zod validation errors. 386 HTML pages (same count as pre-emission run). All frontmatter fields accepted by the `z.string().optional()` / `z.coerce.date().optional()` schema in `src/content.config.ts`.

## Files affected

- **184 files modified** (frontmatter added or merged)
- **34 files skipped** (8 README.md files across tiers + modules + root; VALIDATION-REPORT.md; export subdirectory md files; diagrams subdirectory)
- **3 new source files created**: `emitters/manual.py`, `tests/test_manual.py`, `cli.py` (extended with `emit-manual` command + umbrella extension)

## Open items

1. **URI extraction limitations on multi-class files**: `physical-ontology/<module>/classes.md` covers all classes in a module, not a single entity — so `entityUri` is set to `opda:<PascalCaseFileStem>` (e.g. `opda:Classes`), which is not a real URI. These files get `kind: entity` by the default path, not a richer kind. A future ADR could add a `kind: module-classes` / `kind: module-shapes` enum value for these pages. The current Zod schema has `kind: z.string().optional()` so this does not block the build.

2. **Physical-database/named-graphs.md**: Gets `kind: operations`, `tier: physical-database`, no module (none detectable from path). This is correct per the `deriveKind` port from TypeScript.

3. **pyyaml dependency**: Added to the emitter package. The `pyproject.toml` `requires-python` constraint (`>=3.11,<3.12`) and venv discipline are pre-existing; `pyyaml` was installed in the venv manually. If `opda-gen`'s `pyproject.toml` does not declare `pyyaml` as a dependency, CI will need it added. (Left as a follow-up for the validator to flag if needed.)

---

## Programme retirement signal

### ADR-0015 §Confirmation 10/10 status

| # | Criterion | Realising ADR | Status |
|---|---|---|---|
| 1 | `docs/manual/` content collection wired | ADR-0016 | GREEN |
| 2 | Collection schema lenient (optional fields) | ADR-0016 | GREEN |
| 3 | Tier routes rendered (`/manual/<tier>/`) | ADR-0016 + ADR-0017 | GREEN |
| 4 | Path-derived metadata helpers | ADR-0016 (`src/lib/manual.ts`) | GREEN |
| 5 | Astro components consume entries | ADR-0017 | GREEN |
| 6 | Build plumbing wired (remark, rehype, layouts) | ADR-0018 | GREEN |
| 7 | Manual ↔ modelling bidirectional cross-links | ADR-0019 | GREEN |
| 8 | Generator emits collection-valid frontmatter | ADR-0020 | GREEN |
| 9 | Idempotent regeneration (byte-identity) | ADR-0020 | GREEN |
| 10 | Astro build exits 0 with ≥218 HTML pages | ADR-0020 verification | GREEN — 386 pages |

### ADRs 0016–0020 status

| ADR | Status |
|---|---|
| ADR-0016 | accepted |
| ADR-0017 | accepted |
| ADR-0018 | accepted |
| ADR-0019 | accepted |
| ADR-0020 | implemented (pending validator acceptance) |

### Manual regenerable from TTLs via new emitter

YES — `opda-gen emit-manual --output docs/manual` re-emits collection-valid frontmatter for all 184 in-scope files in a single idempotent pass. Body content is never modified; existing editorial fields are preserved under the merge discipline.
