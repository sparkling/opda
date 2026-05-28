# Visual Smoke Test — ADR-0015 Criteria #6 and #7

**Date:** 2026-05-28
**Tester:** automated browser agent (ruflo + Playwright)
**Build:** 386 pages, dist/ built green prior to this session (initial run); re-verified after `runInitOnce()` fix
**Server:** `python3 -m http.server 4399` (initial run) / `4400` (re-verification) against `/Users/henrik/source/opda/dist/`
**CDN:** mermaid@11 + @mermaid-js/layout-elk@0 via jsdelivr — reachable during test

---

## Criterion #7 — ELK-laid-out diagrams render correctly via the ELK plugin client-side

**Verdict: GREEN**

All four representative pages rendered mermaid blocks to SVG with no error nodes.

| Page URL | Tier | Mermaid blocks | SVGs rendered | ELK directive | Error icons | Syntax error |
|---|---|---|---|---|---|---|
| `/manual/concept/property/property/` | Concept | 2 | 2 | no | 0 | no |
| `/manual/logical/agent/enumerations/role-scheme/` | Logical (scheme) | 1 | 1 | **yes** | 0 | no |
| `/manual/physical-ontology/severity-tiers/` | Physical-ontology | 1 | 1 | no | 0 | no |
| `/manual/physical-database/modules/property/` | Deployment | 1 | 1 | no | 0 | no |

Evidence for ELK page (`role-scheme`): `document.querySelectorAll('.mermaid svg').length === 1`, `.mermaid .error-icon` absent, ELK layout directive confirmed present in `data-mermaid-src`, no "Syntax error" text anywhere in page body. The ELK layout loader (`mermaid.registerLayoutLoaders`) is called before `mermaid.run()` in `client.js:236`.

Screenshots (light mode, dark default toggled to light for readability):
- `/tmp/smoke-logical-light.png` — role-scheme ELK diagram
- `/tmp/smoke-crosscutting-light.png` — severity-tiers
- `/tmp/smoke-deployment-light.png` — property deployment view

---

## Criterion #6 — Dark/light toggle works; mermaid re-renders with dark theme variables

**Verdict: GREEN** _(upgraded from AMBER after `runInitOnce()` fix, re-verified 2026-05-28)_

### Evidence

Tested on a first load of `/manual/concept/property/property/` against freshly rebuilt dist (port 4400). No prior navigation.

| Event | `data-theme` | SVG internal `fill` (primaryTextColor) |
|---|---|---|
| Page load (default) | `dark` | `#EFE9DE` (cream — dark themeVars) |
| After click 1 | `light` | `#141413` (near-black — light themeVars) |
| After click 2 | `dark` | `#EFE9DE` (dark themeVars restored) |

A single click on `#theme-toggle` now correctly flips `data-theme` (dark→light) and `restartMermaid()` re-renders the SVG with the new theme's `primaryTextColor`. A second click flips it back (light→dark). Toggle is stable.

Screenshots:
- `/tmp/smoke-property-dark.png` — dark mode (initial load)
- `/tmp/smoke-property-light.png` — light mode (after forced re-render, initial run)
- `/tmp/smoke-property-light-v2.png` — light mode confirmed via UI toggle (re-verification run)

### Fix applied

The double-listener root cause (initial run finding): `init()` was called immediately when `readyState !== 'loading'` AND again on `astro:page-load`, adding two click listeners to `#theme-toggle` that cancelled each other. Fixed in `public/ui/client.js` with a `runInitOnce()` guard ensuring `bindThemeToggle()` (and all other bind functions) run exactly once per document, regardless of how many times `astro:page-load` fires.

---

## Test environment notes

- `data-theme` default is `dark` (hardcoded fallback in `Layout.astro:102-105`); no system preference override tested.
- CDN (jsdelivr) was reachable; mermaid@11 and ELK layout plugin loaded successfully.
- `localStorage` key is `opda-theme` (not `theme` as assumed in the ADR — confirmed from `client.js:34`).
