# Schema section — content-generation specification

**Status:** Final. Round 3 synthesis of a 6-agent swarm. Drives implementation of pages 34, 35–39, 45–49.

## 1. Executive summary

Eleven Schema pages are assembled by a deterministic pipeline that walks `pdtf-transaction.json`, joins each leaf to `provenance-map.yaml` (ontologist-owned) and `theme-map.yaml` (canonical-home assignments), then renders Jinja2 templates that interleave generated leaf tables with hand-authored markdown stored in `source/_content/schema/*.md`. Two validated PDTF instances (`_examples/flat-london.json`, `_examples/semi-manchester.json`) supply every inline example via build-time path substitution. Verifiable-credential envelope rows are visually demoted and excluded from statistics. A single search index serves both the data-dictionary browser and a page-level find-a-field affordance — they are *views* over one index, not two indexes. Drift is enforced by ten CI invariants. Page 39 is generated first as the worst-case gating page; nothing else ships until 39 reads end-to-end without intervention.

## 2. Design principles

1. **One leaf, one canonical home, one badge.** A leaf's classification and home are properties of the *path*, not of where it appears. The same path renders identically on every page that mentions it.
2. **Schema is the source of truth; classification lives next to it, not inside it.** `pdtf-transaction.json` stays clean. Classification, themes, and examples are sidecar YAML/JSON authored by the team that owns the meaning.
3. **Generated scaffolding, sidecar narrative.** Tables, badges, chips, statistics, and the search index are deterministic outputs of the pipeline. Intros, "why this aggregate exists", pull-quotes, and gap notes live in standalone markdown files merged at build time. No `<!-- BEGIN MANUAL -->` fences in shipped HTML.
4. **Sub-tables are the unit of reading; the page is the unit of meaning.** Each aggregate page splits into 4–8 sub-section tables of 20–60 rows. Overflow is rerouted to the data dictionary, not crammed onto the page.
5. **ER earns its place by showing mechanics, not skeleton.** Only diagrams that expose internal cardinality, process flow, or role structure render. Anything that re-centres the transaction trunk is cut.
6. **VC envelope rows are second-class on aggregate pages.** Faded, no badge, lock glyph; suppressed on pages 35–42; visible only on page 43. Excluded from stat-strip percentages.
7. **Drift fails the build.** Every assertion in §10 runs in CI. Warnings are converted to errors before merge.

## 3. Pipeline architecture

```
        pdtf-transaction.json
                 │
                 ▼
      [1] schema-walker.py ───────► leaves.json (flat, ordered)
                 │
                 ▼
      [2] provenance-classify.py ──► classified.json
            (joins provenance-map.yaml; tags VC-envelope rows)
                 │
                 ▼
      [3] theme-assign.py ─────────► page-leaves.json
            (joins theme-map.yaml; longest-prefix match;
             enforces exactly-one-canonical-home)
                 │
                 ▼
      [4] examples-bind.py ────────► page-leaves.examples.json
            (resolves JSON-path lookups into the two _examples)
                 │
                 ▼
      [5] render-pages.py ─────────► docs/pages/{34,35..49}.html
            (Jinja2 templates + sidecar markdown)
                 │
                 ▼
      [6] build-search-index.py ───► docs/data/schema-index.json
                 │
                 ▼
      [7] drift-check.py ──────────► non-zero exit on any §10 invariant
```

All seven steps run from `scripts/build-schema-pages.py` as ordered subcommands; each step writes a JSON artefact under `_build/` for CI inspection and reproducible re-renders.

## 4. File layout

```
source/
  03-standards/schemas/src/schemas/v3/
    pdtf-transaction.json                  # unchanged, source of truth
  00-deliverables/semantic-models/
    provenance-map.yaml                    # ontologist-owned classification
    theme-map.yaml                         # leaf-to-page + sub-section assignment
    data-dictionary-canonical.json         # existing, unchanged
  _content/schema/
    34-overview.md                         # YAML frontmatter + markdown regions
    35-transaction-participants.md
    36-chain-milestones-contracts.md
    37-property.md
    38-legal-estate-title.md
    39-built-form-condition-valuation.md
    45-utilities-energy.md
    46-local-context-searches.md
    47-encumbrances-completion.md
    48-evidence-documents-declarations.md
    49-overlays-tasks-crosscuts.md
  _examples/
    flat-london.json                       # full PDTF instance, ajv-validated
    semi-manchester.json                   # full PDTF instance, ajv-validated
  _working/
    schema-section-ia.md                   # the IA
    schema-content-generation-spec.md      # this document

scripts/
  build-schema-pages.py                    # orchestrator
  _lib/
    schema_walker.py
    provenance_classify.py
    theme_assign.py
    examples_bind.py
    render_pages.py
    build_search_index.py
    drift_check.py
  templates/
    aggregate-page.html.j2                 # pages 35–49 except 49
    overview-page.html.j2                  # page 34
    crosscut-page.html.j2                  # page 49
    _macros/
      leaf-table.html.j2
      stat-strip.html.j2
      er-diagram.html.j2
      pull-quote.html.j2

docs/
  pages/                                   # generated; do not hand-edit
  ui/
    schema-leaf-table.js                   # refactored from data-browser.js
  data/
    schema-index.json                      # single search index
_build/
  leaves.json, classified.json, page-leaves.json, …  # intermediate artefacts
_audit/
  unclassified.csv                         # current count must be 0
  manual-extracts/                         # not used — sidecar wins; left empty for archival
```

Sidecar markdown frontmatter looks like:

```yaml
---
page: 47
slot: 47
title: Encumbrances & completion
voice: reference-prose-with-opinion
regions:
  intro: |
    The aggregate that binds…
  why_this_exists: |
    councilTax has its lifecycle…
  pull_quote: "Completion is the moment encumbrances either follow the property or die with the seller."
  gap_notes: ""
mentioned_but_not_owned: [councilTax-references-completion-statement, ...]
---
```

## 5. Page-rendering recipe (page 47, encumbrances & completion)

1. **Walk** `pdtf-transaction.json`. Emit every leaf path under `propertyPack.councilTax`, `propertyPack.charges`, `propertyPack.covenants`, `propertyPack.easements`, `propertyPack.serviceCharge`, `propertyPack.groundRent`, `completion.*`, `apportionments.*` into `leaves.json`.
2. **Classify.** Join each path against `provenance-map.yaml`. `councilTax.band` → `kind: declaration`. `councilTax.evidenceDocument` → `kind: evidence`. `completion.apportionments.councilTax.amount` → `kind: derivation`. Any path matching `*.credentialSubject.*` is unwrapped (envelope passthrough rule); the inner path inherits the inner classification and gets a small "VC" chip.
3. **Assign.** `theme-map.yaml` maps `propertyPack.councilTax.*` → page 47, sub-section `councilTax`; `propertyPack.charges.*` → page 47, sub-section `charges`; etc. Longest prefix wins; ties fail the build.
4. **Bind examples.** For each leaf with `example_path` in `provenance-map.yaml`, resolve against both `_examples/*.json`. `councilTax.band` resolves to `"D"` in `flat-london.json` and `"E"` in `semi-manchester.json`. Missing paths fail the build (forces example currency).
5. **Render.** Load `_content/schema/47-encumbrances-completion.md`. Parse frontmatter, render markdown regions to HTML. Pass to `aggregate-page.html.j2`:
   - hero (title, lead from frontmatter, stat-strip macro)
   - pull-quote callout (`.callout--key`, after lead, before tables)
   - one sub-table per `sections[]` entry: `councilTax` (≈18 leaves), `charges` (≈42), `covenants` (≈12), `easements` (≈8), `serviceCharge` (≈22), `groundRent` (≈9), `completion` (≈31), `apportionments` (≈14) — total ≈156, splits cleanly below the 150 visible-rows guidance because `apportionments` is collapsed-by-default behind a "+14 derivation leaves" affordance
   - one ER diagram: charges ↔ encumbrances ↔ completion temporal cardinality
   - end-of-page worked example callout (`.callout--note`) drawing on both `_examples`
   - "Mentioned by but not owned here" one-line note in intro: "This page references but does not own `participants[].sellersCapacity` (35) or `titleNumber` (38)."
   - related-pages footer
6. **Index.** Add every page-47 leaf to `schema-index.json` with `{ path, page: 47, section: 'councilTax'|... , kind, overlays[], aliases[] }`.
7. **Drift check.** Run §10 invariants over the artefacts. Any failure aborts the build before HTML reaches `docs/pages/`.

## 6. Visual contract

**Leaf-table columns** (desktop): Path · Required · Type · Kind · Title · Overlays · Affordance. Expander row reveals: Description · Format · Enum · JSON-LD · SHACL · Example value · Mentioned-by. Sub-tables have sticky `<thead>`, default sort by `(required desc, path asc)`.

**Badge palette.** Exactly three: `.pill--decl` green ("Declared"), `.pill--evid` blue ("Evidence"), `.pill--deriv` amber ("Derived"). No fourth Meta-evidence pill. Meta-evidence is a row-level treatment, not a fourth class: `opacity: 0.6`, italic path label, small lock glyph in the Name cell, no badge in the Kind cell, hover tooltip "VC envelope leaf — see page 43". Suppressed on pages 35–42; visible on 43; counted in a separate footer line "+184 envelope leaves" — never in the stat-strip percentage.

**Overlay chips.** Inline horizontally-scrollable micro-pills inside the row's Overlays cell, max three visible, `+N` indicator for overflow. No tooltip popover. Clicking any chip opens the same expander row that holds enum/format/example. Page-level "Filter by overlay (N)" button above the table for whole-table filtering.

**Pull-quote.** After the lead paragraph, before the first sub-table. Uses `.callout--key`. One per page. Authored in frontmatter.

**Worked example.** End-of-page `.callout--note`, draws values from both `_examples` via path substitution. Cites paths in monospace; build fails if a cited path is renamed or deleted.

**Mobile cards.** Front: path / required / type / kind / title / overlays / affordance. Tap expands to reveal description / format / enum / JSON-LD / SHACL / example / mentioned-by / full overlay list.

**ER constraints.** 5–9 entities per diagram (hard cap 12). Each page-level ER must show internal mechanics: participants × authority (35); chain × milestones (36); title ↔ proprietors ↔ leases ↔ restrictions (38); search → authority → result (41); charges ↔ encumbrances ↔ completion temporal cardinality (42); claim ↔ subject ↔ evidence ↔ document (43). Diagrams that only re-render the transaction skeleton are cut. Source is Mermaid in `_content/schema/*.md`; exported via the `mermaid-export` skill before commit.

**Stat-strip:** **kept, trimmed.** Renders per page: total leaves, % Decl / % Evid / % Deriv (envelope rows excluded), count of leaves with overlay membership, count of leaves with worked-example values. Decision it informs: "is this aggregate primarily declared or primarily evidenced?" — answers an authoring/governance question, not a reader-of-the-day question. Cut from page 49 (cross-cuts have no aggregate identity).

## 7. Content authoring contract

**Who edits what.**

| File | Owner | Edit cadence |
| --- | --- | --- |
| `pdtf-transaction.json` | Schema maintainer | On schema release only |
| `provenance-map.yaml` | Ontologist | Continuous; CI gates unclassified |
| `theme-map.yaml` | Schema architect + content lead | At IA-change events only |
| `_content/schema/*.md` | Content lead | Continuous |
| `_examples/*.json` | Content lead + schema maintainer | At schema change or narrative change |
| `templates/*.j2` | Front-end | Rare |
| `docs/pages/*.html` | Nobody — generated | Never hand-edit |

**Voice rotation across 11 pages.**

| Voice | Pages |
| --- | --- |
| Full opinionated, gap-naming | 34, 37, 47 |
| Reference-prose with opinion at gap-flag points | 35, 36, 38, 39, 45, 46, 48 |
| Briskest, near-bullet | 49 |

**Five fixed-beat essay template** for every aggregate page:

1. **Lead** (1 paragraph, ≤80 words): what this aggregate is.
2. **Why this aggregate exists** (≤120 words): cohesion test answered in plain language.
3. **Pull-quote** (1 sentence): the page's load-bearing claim.
4. **Gap notes** (optional, ≤80 words): known schema defects honestly named.
5. **Worked example** (end of page, both `_examples` cited): one paragraph stitching the page's leaves into a narrative.

## 8. Provenance classification

**Rubric.** "Whose seal closes when this fact is challenged?" Seller-sealed → Declaration. Authority-sealed (HMLR, EPB, local authority, surveyor) → Evidence. Computed from other leaves → Derivation. VC envelope structural fields → envelope (no badge).

**Mechanism.** `provenance-map.yaml` is the single source of truth. Schema:

```yaml
- path: propertyPack.councilTax.band
  kind: declaration
  overlays: [TA6, BASPI5]
  example_path: propertyPack.councilTax.band
  rationale: "Seller asserts on TA6 Q.5.1; council issues annual bill separately."
- path: propertyPack.epc.currentEnergyRating
  kind: evidence
  overlays: [EPC, NTS2]
  example_path: propertyPack.epc.currentEnergyRating
  rationale: "EPB-sealed certificate; seller cannot self-issue."
```

CI step `provenance-coverage` walks every schema leaf; any path missing from the YAML is appended as `kind: unclassified` and **fails the PR** until the ontologist sets a value. Build cannot proceed with unclassified > 0.

**Error budget.** ≤2% wrong at first publication, ≤0.5% sustained. Each row carries a "?" affordance that opens a GitHub issue prefilled with `{path, kind, rationale, page}`. Ontologist triages weekly.

**Seed pattern table (counts target).** ≈1,500 Evidence (documents, certificates, search results, VC inner claims), ≈650 Derivation (apportionments, totals, EPC computed bands, milestone-derived states), ≈150 envelope rows (rendered separately, never counted), ≈6,150 Declaration (default).

**Multi-provenance resolution (the `heatingFuelType` problem).** When the same real-world fact surfaces at two different paths (one seller-declared on TA6, one EPB-issued on EPC), the answer is **two paths, two badges, two rows.** The schema already carries them as separate leaves; classification follows the leaf. The page-34 explainer states this rule verbatim — *"Some real-world facts surface in the data model as several different leaves, one per role they play. Same concept, three leaves, three badges — one badge per leaf."* The data dictionary and find-a-field surface both rows for `heatingFuelType` searches; the business glossary links them as the same concept. We never collapse two paths into one row; we never split one path across two badges.

**SKOS scheme.** `pdtf-provenance:Scheme` with three concepts (`Declaration`, `Evidence`, `Derivation`) lands on page 30 (concept taxonomy) before any Schema page ships. One Turtle file, one rendered page section.

## 9. Examples contract

**Files.** `source/_examples/flat-london.json` (leasehold flat in London: cladding, service charge, EWS1, EPC D, chain of 3); `source/_examples/semi-manchester.json` (freehold semi in Manchester: no chain, EPC C, planning history, no leasehold leaves).

**Validation.** `ajv` against `pdtf-transaction.json` on every CI run. Failing instance fails the build. Both must validate before any Schema page renders.

**Path substitution.** Sidecar markdown and the end-of-page worked-example callout cite paths in `${path}` syntax: `"Our London flat reports council-tax band ${propertyPack.councilTax.band}"` resolves to `"…band D"`. Build fails if any cited path is missing from the example or has been renamed in the schema. No hand-pasted values anywhere.

**Identity table.** Both examples share fixed identities (titles, UPRNs, parties) declared in `_examples/identities.yaml` and referenced from both JSON files; the Property page (37) uses this table to demonstrate the four-identity-surface problem.

## 10. CI invariants

1. **Canonical home uniqueness.** Every leaf has exactly one canonical home in `theme-map.yaml`. Zero implicit assignments.
2. **Theme coverage.** Every schema leaf maps to some page. No orphans.
3. **Provenance coverage.** `unclassified` count in `provenance-map.yaml` is 0.
4. **Sidecar region symmetry.** Every page's sidecar markdown defines every region the template expects. Missing region = build fail.
5. **Example freshness.** Both `_examples/*.json` validate against the current `pdtf-transaction.json`.
6. **Example-path resolution.** Every cited `${path}` in sidecar markdown and `provenance-map.yaml` resolves in both example files.
7. **ER entity validity.** Every entity name in every Mermaid block resolves to a node in the canonical model.
8. **Mentioned-by integrity.** Every "mentioned but not owned" reference resolves to a leaf owned by another page.
9. **Generated-region purity.** `docs/pages/*.html` are bit-for-bit reproducible by re-running `build-schema-pages.py`. Hand edits to generated pages fail a pre-commit hook.
10. **Overlay chip resolution.** Every overlay tag in `provenance-map.yaml` resolves to a known overlay on page 16.
11. **Sub-table size guidance.** Any sub-table > 60 rows emits a warning; > 90 emits an error and forces a split.
12. **Envelope suppression.** No `*.credentialSubject.*` row appears on pages 35–42 with a visible badge.

## 11. Decisions made

**D-Auth (hand-prose authoring location): sidecar markdown wins.** Reason: Content Lead's in-HTML guards keep prose physically next to layout but force every author through HTML escaping, fight the templating engine for whitespace, and create a permanent risk of merge conflicts in generated regions. Sidecar markdown separates the *act of writing prose* (markdown, grep-able, diffable) from *the act of laying it out* (Jinja2 macros, owned by front-end). The originally-cited Content Lead concern — "grep-able prose corpus" — is satisfied by sidecar files directly; the proposed `_audit/manual-extracts/` step becomes unnecessary.

**D-Cap (150-leaf hard cap): soft cap, hard sub-table cap.** Reason: a hard page cap would force false splits on legitimately large aggregates (43 evidence/documents will exceed 150). Devil's Advocate's underlying concern — pages no reader reaches the bottom of — is better solved at the *sub-table* level: 60-row warning, 90-row error (invariant 11). Collapse-by-default for derivation sub-blocks. Net effect on page 39 (the worst case in the test): sub-tables of 38/47/52/29/41 ≈ 207 leaves total, all individually scannable, derivation overflow collapsed. Page 39 will still ship; reader still reaches the bottom of every sub-table.

**D-Search (one index or two): one index, two views.** Reason: Devil's Advocate's drift argument is correct in the abstract — two indexes over the same data will diverge. The resolution is not to kill find-a-field but to make it a *view* over `schema-index.json`. The data-dictionary browser is also a view over `schema-index.json`. Different UI, same data. Find-a-field's distinct affordance (deep-link with flash to canonical home, business-glossary alias matching) is preserved as query behaviour, not as a separate index.

**D-Strip (stat-strip): kept, trimmed.** Reason: Devil's Advocate's challenge — name the decision it informs — is answered by the authoring/governance question "is this aggregate primarily declared or primarily evidenced?" The strip stays for the eight aggregate pages, gets cut from 49 (cross-cuts have no aggregate identity), and gets a different shape on 34 (section totals, not page totals). Envelope rows are not in the percentages.

**D-Order (generation order): adopt 39-first as gating criterion.** Reason: Devil's Advocate is right that 39 is the worst case (largest leaf count, most sub-sections, hardest classification calls — cladding, fixtures, valuation). If 39 renders cleanly under our spec, every other page renders. **No other Schema page enters PR review until page 39 has shipped, been read end-to-end by two non-authors, and passed a 10-leaf spot-audit of badges.** Order after 39: 47 (next-hardest classification) → 38 → 35 → 36 → 45 → 46 → 48 → 37 (written last per IA) → 49 → 34 (assembles overview last).

**D-Multi (multi-provenance leaves like `heatingFuelType`): two paths, two badges, two rows.** Reason: provenance is a property of the *leaf*, not of the concept. The schema already encodes the duality (TA6's `heating.fuelType` vs `epc.fuelType` are distinct leaves). Each gets the badge that fits its evidentiary chain. The business glossary collapses them at the concept layer; find-a-field returns both. We never invent a third merged path. Page-34 explainer carries the corrected wording verbatim.

## 12. Build / generation order

1. **Pre-flight (one-time).** `provenance-map.yaml` reaches `unclassified: 0`. `_examples/flat-london.json` and `_examples/semi-manchester.json` validate. `pdtf-provenance:Scheme` lands on page 30.
2. **Gate page.** Generate page 39. Read end-to-end. Spot-audit 10 random leaves. Iterate on spec until 39 is clean.
3. **Hard-classification pages.** Generate page 47, then 38.
4. **Reference pages.** Generate 35, 36, 45, 46, 48.
5. **Defect-documenting page.** Generate 37 (Property) — written last among aggregates, because it documents what 38/39/45 didn't cover.
6. **Cross-cuts.** Generate 49.
7. **Overview.** Generate 34, which assembles section totals and cross-links.
8. **Final drift check.** Re-run the pipeline from clean; assert bit-for-bit identical output.

## 13. Open issues

1. **Slot renumbering.** IA proposed 34, 35–44; current generator uses 34, 35–39, 45–49 to avoid colliding with Engagement section pages 40–44. Spec assumes the latter; if Engagement section moves, slots rebalance.
2. **Page 30 SKOS scheme integration.** Spec assumes page 30 has authoring capacity for `pdtf-provenance:Scheme`. If page 30 is locked, scheme lands in a new file under `source/00-deliverables/semantic-models/skos/` and renders inline on page 34 instead.
3. **Overlay chip overflow UX.** `+N` overflow on a touch device is untested. May need a tap-to-reveal expansion rather than horizontal scroll.
4. **Find-a-field flash behaviour on deep-link.** CSS `:target` flash needs cross-browser test, particularly Safari.
5. **VC envelope on page 43.** Envelope rows visible on 43 but not faded there. Open: do we *celebrate* envelope structure on 43 (different visual) or just unsuppress it?
6. **Multi-language leaf titles.** `provenance-map.yaml` is English-only. Out of scope for v1.
7. **Audit retention.** `_audit/unclassified.csv` history retention policy not specified. Default to git history; revisit if PR reviews need richer reporting.

---

*Synthesised by Queen from cg_devils_advocate, cg_schema_architect, cg_visual_designer, cg_content_lead, cg_provenance_expert. 2026-05-15. Implementation begins on page 39.*
