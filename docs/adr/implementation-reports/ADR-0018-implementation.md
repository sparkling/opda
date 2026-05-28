# ADR-0018 Implementation Report — Manual remark + rehype plugins

**Implementing worker:** ADR-0018 worker (Phase 3 — Plumbing)
**Implemented:** 2026-05-28
**Status:** PROPOSED (independent validation gate per programme plan §8 pending)

## 1. Emitted file inventory

| File | Role | Cites ADR |
|---|---|---|
| `src/lib/remark/unwrap-mermaid-details.ts` (new) | Remark plugin: unwrap `<details>`-wrapped mermaid sources → `<div class="mermaid">` | ADR-0018, ADR-0015 |
| `src/lib/remark/frontmatter-uri-extraction.ts` (new) | Rehype plugin: extract OPDA entity URI from heading or filename; write to `file.data.astro.frontmatter.entityUri` | ADR-0018, ADR-0015 |
| `astro.config.mjs` (modified) | Added `markdown: { remarkPlugins: [remarkUnwrapMermaidDetails], rehypePlugins: [rehypeFrontmatterUriExtraction] }` | ADR-0018 |
| `package.json` (modified) | Added `"test": "node --test tests/lib/remark/*.test.mjs"` script | ADR-0018 |
| `tests/lib/remark/unwrap-mermaid-details.test.mjs` (new) | 8 fixture-based tests for the remark plugin | ADR-0018 |
| `tests/lib/remark/frontmatter-uri-extraction.test.mjs` (new) | 12 fixture-based tests for the rehype plugin | ADR-0018 |

**Total new files:** 4. **Modified files:** 2.

## 2. Plugin 1: `remarkUnwrapMermaidDetails`

**File:** `src/lib/remark/unwrap-mermaid-details.ts`

**Algorithm:** Walks the top-level children array of the mdast root (no deep recursion needed — the `<details>` blocks are always top-level siblings):

1. When an `html` node matches `<details>\n<summary>Mermaid Source</summary>` (case-insensitive regex), look ahead:
   - Next sibling must be a `code` node with `lang === 'mermaid'`
   - Sibling after that must be an `html` node matching `</details>`
2. When these three conditions hold:
   - Check if the result array's last element is a diagram image reference — either a `paragraph` node with a single `image` child whose URL starts with `diagrams/`, OR a raw HTML `html` node whose value matches `<img ... src="diagrams/...">` (the physical-database tier uses raw HTML `<img>` tags with `width=` attributes, not markdown image syntax)
   - If so, pop that node from the result (strips the PNG offline reference)
   - Push `<div class="mermaid">\n{mermaid source}\n</div>` as a replacement `html` node
   - Advance index by 3 (consuming open-html + code + close-html)
3. Otherwise, push the node unchanged and advance by 1

**Edge cases handled:**
- Multiple mermaid blocks per file: each is processed independently in the single linear pass
- ELK blocks (code fence with YAML frontmatter `---\nconfig:\n  layout: elk\n---`): the entire code block value is preserved verbatim inside the div
- `<details>` blocks without `Mermaid Source` summary: skip (the regex doesn't match)
- Raw HTML `<img>` preceding the details (not markdown `![]()` syntax): handled via the `INLINE_IMG_DIAGRAM_RE` check
- Images NOT pointing to `diagrams/` paths: preserved

**Discovery during implementation:** The physical-database tier README uses raw HTML `<img src="diagrams/...">` elements (not markdown `![alt](diagrams/...)` syntax) — these parse as `html` nodes, not `image`-child `paragraph` nodes. The `isInlineDiagramImg` helper was added to handle both forms.

**Cache discovery:** The Astro content store at `node_modules/.astro/data-store.json` caches rendered HTML and uses a digest-based skip for unchanged entries. A stale cache (built before the plugins were installed) caused verification Check 2 to fail on intermediate runs. The cache is cleared automatically when `node_modules/.astro/data-store.json` is deleted; the final verification used a clean build (`rm -f node_modules/.astro/data-store.json`).

## 3. Plugin 2: `rehypeFrontmatterUriExtraction`

**File:** `src/lib/remark/frontmatter-uri-extraction.ts`

**Algorithm:** Runs as a rehype plugin (after remark-to-hast conversion). For each markdown file:

1. Extract the entry `id` from `file.path` using a regex (`/docs[\\/]manual[\\/](.+?)(?:\.md)?$/`) — normalised to lowercase matching Astro's `githubSlug()` format
2. Call `deriveKind(id)` (reusing the Phase 1 helper from `src/lib/manual.ts`)
3. Skip if kind is not `entity`, `scheme`, or `exemplar`
4. Skip if `file.data.astro.frontmatter.entityUri` is already set (idempotent)
5. For `entity` and `scheme`: search the hast tree for the first heading (`h1`–`h6`) matching `opda:<LocalName>` — this covers physical-ontology classes.md files which have `### opda:Address` etc.
6. Fallback: derive the URI from the filename stem via `toUpperCamel()` (kebab → UpperCamelCase)
   - `entity`: `opda:Property` from `property.md`
   - `scheme`: `opda:BuiltFormScheme` from `built-form.md` (adds `Scheme` suffix unless already present; handles `role-scheme.md` → `opda:RoleScheme` correctly)
7. For `exemplar`: skip (no stable URI; `entityUri` remains undefined)
8. Write derived URI to `file.data.astro.frontmatter.entityUri`

**Data flow:** The `file.data.astro.frontmatter` object is what `@astrojs/markdown-remark` returns as `result.data.astro.frontmatter`, which is available as `entry.rendered.metadata.frontmatter` in the content store. The render templates (ADR-0017 Phase 2 components) access this via the `render()` result's `remarkPluginFrontmatter` if needed.

**Open items on URI extraction:**
- Physical-ontology `classes.md` files contain multiple `### opda:ClassName` headings (one per class) — the plugin extracts ONLY the first. These files are `entity` kind but represent multiple classes. ADR-0020 (generator frontmatter) should emit per-entry `entityUri` in frontmatter to resolve this ambiguity.
- Logical-tier entity files (e.g. `logical/property/property.md`) have no `opda:` URI heading — they fall back to filename derivation, which works correctly.
- The `exemplar` kind consistently gets `undefined` entityUri, which is correct per the spec (exemplars are instance data, not ontology classes).

## 4. Tests

**Test runner:** Node built-in `node:test` module (Node 22). TypeScript test files loaded via `jiti` (available as an Astro transitive dependency at `node_modules/.pnpm/jiti@2.7.0/`).

**Test files:**
- `tests/lib/remark/unwrap-mermaid-details.test.mjs` — 8 tests
- `tests/lib/remark/frontmatter-uri-extraction.test.mjs` — 12 tests

**Coverage:**
- Simple mermaid block unwrapping
- Markdown image paragraph stripping
- Raw HTML `<img>` stripping (physical-database pattern)
- Non-diagram image preservation
- Multiple blocks per file
- ELK mermaid blocks (YAML frontmatter in code fence)
- Skip on non-Mermaid-Source summary
- Surrounding content preservation
- URI extraction from headings (entity, physical-ontology)
- Filename fallback derivation (concept entity, logical entity)
- Scheme URI derivation (with/without Scheme suffix)
- Exemplar skip
- Cross-cutting skip
- Tier-readme skip
- Idempotency
- Logical enumeration scheme
- Non-manual path graceful handling
- Missing file path graceful handling

**Run result:** `npm test` → 20 tests, 0 failures.

## 5. Build verification

Build: `rm -f node_modules/.astro/data-store.json && npm run build`

Exit code: **0**. Output: `386 page(s) built in 8.37s`.

| Check | Result | Command |
|---|---|---|
| `<details><summary>Mermaid Source</summary>` in dist | **0 files** (PASS) | `grep -rl 'Mermaid Source' dist/` |
| `<img src="...diagrams/...png">` in dist | **0 files** (PASS) | `grep -rl 'src=".*diagrams/.*\.png"' dist/` |
| `<div class="mermaid">` in dist | **292 files** (PASS) | `grep -rl 'class="mermaid"' dist/` |
| `_export/` references in dist | **0 files** (PASS) | `grep -rl '_export/' dist/` |

Note: Stale Astro content cache (`node_modules/.astro/data-store.json`) must be cleared after installing new remark/rehype plugins. Digest-based caching will skip re-rendering otherwise. Subsequent builds (after initial clean build) will correctly invalidate only changed entries.

## 6. ADR-0015 §Confirmation criteria realised

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 5 | `Diagram.astro` unchanged | GREEN | No modifications to `src/components/Diagram.astro` or `public/ui/client.js`. Manual pages reuse the existing loader as-is. |
| 7 | ELK-laid-out diagrams render correctly | GREEN | `<div class="mermaid">---\nconfig:\n  layout: elk\n---\n…` present in dist for all ELK-annotated blocks. client.js ELK loader handles them client-side. |
| 8 | No `docs/manual/_export/` references from `src/` | GREEN | Verification check 4: 0 `_export/` refs in dist. |

ADR-0015 criteria 1–4, 6, 9, 10 remain owned by Phase 1 (ADR-0016) and Phase 2 (ADR-0017).

## 7. Deviations from ADR-0018

None. Both plugins shipped as specified. The only addition was the `isInlineDiagramImg` helper (undocumented in the ADR but required for physical-database-tier raw HTML `<img>` nodes) and the cache-clearing note.

## 8. Open items for downstream phases

| Item | Owned by |
|---|---|
| `entityUri` for `classes.md` files (multiple `### opda:ClassName` headings): plugin extracts first only | ADR-0020 (generator should emit per-entity frontmatter) |
| Cross-tier links in `CrossTierLinks.astro` require `entityUri` to be populated — Phase 2 components can now access it via `entry.data.entityUri` (if frontmatter has it) or via `remarkPluginFrontmatter` from `render()` | ADR-0017 (Phase 2 — already in working tree) |
| URI extraction for physical-ontology shapes.md files (contain per-shape sections, not per-class) | ADR-0020 |
