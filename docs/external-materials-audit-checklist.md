---
title: "External materials audit checklist"
purpose: "Find and remediate OPDA-controlled materials that link to legacy /pages/NN-…html URLs before the URL change is announced."
source: "ADR-0005 item E2"
owner: "Engagement WG"
---

## Context

ADRs [ADR-0002](./adr/ADR-0002-folder-hierarchy-and-slug-taxonomy.md) and [ADR-0003](./adr/ADR-0003-idiomatic-astro-refactor.md) migrated 158 Knowledge Base pages from `/pages/NN-NN…html` (and the older `xx-pages-NN-NN-NN.html` shape) to bare hierarchical slugs (e.g. `/governance/data-stewardship`). The new site does **not** keep redirects for the legacy URLs. Any pre-existing external material that points at the old URLs will hard-break the moment the new site is announced.

This checklist is a runnable scan to find and fix those references before announcement.

## What to scan for

Search OPDA-controlled materials for any of the following patterns:

| Pattern | Example | Notes |
|---|---|---|
| `/pages/NN-…html` | `/pages/24-data-stewardship.html` | The dominant legacy shape (Wave 1 migration). |
| `/pages/NN-NN-…html` | `/pages/38b-title-oc-summary.html` | Two-level legacy slugs used in the schema tree. |
| `xx-pages-NN-NN-NN.html` | `xx-pages-38-b-3.html` | Older pre-Wave-1 shape; rare but present in archived decks. |
| `openpropdata.org.uk/pages/…` | full-URL form | Catches absolute references. |
| `propdata.org.uk/pages/…` | full-URL form | Older domain still referenced in some historical materials. |

A grep that covers all five: `/pages/[0-9a-z-]+\.html|xx-pages-[0-9-]+\.html|openpropdata\.org\.uk/pages|propdata\.org\.uk/pages`.

## Where to look

Walk each of the following. Tick each box when scanned; record findings in the tracking spreadsheet / issue (see Reporting).

- [ ] `source/02-policy-and-positioning/briefings-to-government/` — PDF briefings to HM Government / select committees. Use a PDF text extractor (e.g. `pdftotext`) and grep across the output.
- [ ] openpropdata.org.uk content — public marketing / explainer site. Scan the CMS export or static HTML.
- [ ] propdata.org.uk content — legacy marketing domain still indexed and cited.
- [ ] DPMSG decks — recent + archived Digital Property Market Steering Group presentations. Check both the source files (Keynote / PowerPoint / Google Slides) and any PDF exports stored alongside.
- [ ] Member-firm comms templates and recent comms — email templates, newsletter copy, sales collateral OPDA has produced for or with member firms.
- [ ] Regulator submissions — HM Land Registry, FCA, ICO correspondence and submissions. Include both the letters/PDFs and any associated annexes.
- [ ] LinkedIn / blog posts authored by OPDA — own-channel social posts and long-form pieces (LinkedIn articles, Medium, OPDA blog if hosted separately).
- [ ] Reference lists, bibliographies, footer-link copy — anywhere a "Further reading" or "Standards we publish" block lists KB URLs in OPDA-controlled materials.

Out of scope for this audit (third-party materials we cannot edit): industry press, blog posts authored by member firms, regulator-published documents that quote our URLs. Those will need to break and be cited as such in any rollback discussion.

## Remediation pattern

The URL mapping is deterministic — every old URL has exactly one new URL. The canonical mapping lives in `scripts/migrate-page.mjs` (the `URL_MAP` constant); `src/lib/site.ts` is the canonical list of live URLs. Cross-reference both when remediating.

Common transformations:

| Old | New |
|---|---|
| `/pages/24-data-stewardship.html` | `/governance/data-stewardship` |
| `/pages/13-data-dictionary.html` | `/modelling/data-dictionary` |
| `/pages/20-conformance-scheme.html` | `/governance/conformance-scheme` |
| `/pages/38b-title-oc-summary.html` | `/schema/legal-estate/title/oc-summary` |
| `/pages/46a2a-la-planning-building.html` | `/schema/local-context/con29r/searches/planning-building` |
| `/pages/10-glossary.html` | `/glossary` |

For each finding:

1. Look up the basename in `scripts/migrate-page.mjs` `URL_MAP`.
2. Replace the old URL with the mapped new URL, preserving any `#anchor` or `?query` suffix.
3. If the basename is **not** in `URL_MAP`, flag it — the URL may be genuinely dead or may need a manual decision. Do not invent a replacement.

## Reporting

Log findings in one of:

- A shared tracking spreadsheet (one row per finding: source material, location, old URL, new URL, status, remediator, date).
- A GitHub issue per source class (e.g. one issue for "briefings PDFs", one for "openpropdata.org.uk", etc.). Each issue lists findings as checkboxes for visible progress.

Either way, capture: source material reference (title / file path / URL), the offending URL, the proposed replacement, status (open / patched / can't-patch / out-of-scope), and the remediator.

Track unknown-basename findings separately — they require a judgement call (is the page gone, renamed, or did the original citation always point somewhere broken?).

## Sign-off

The WG lead signs off on this checklist before any production push of the URL change:

- [ ] All in-scope sources scanned.
- [ ] All findings remediated, or explicitly logged as "out of scope / accepted break".
- [ ] Unknown-basename findings triaged.
- [ ] Engagement WG lead signature: ______________________ Date: __________

No production announcement of the new URLs goes out until this checklist is signed.
