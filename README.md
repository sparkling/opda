# OPDA Knowledge Base

Documentation hub for the **Open Property Data Association** semantic-modelling project — the linked-data evolution of the [Property Data Trust Framework (PDTF)](https://trust.propdata.org.uk).

Two workstreams:

- **Governance** — UK initiative context (DPMSG, DMCC Act 2024, Smart Data scheme), Trust Over IP model, conformance, change management, lifecycle, risk.
- **Modelling** — PDTF schemas + overlays, bounded contexts, data dictionary (8,458 properties), business glossary (554 SKOS concepts), ontology, SHACL, JSON-LD mappings.

The site is a static HTML / vanilla JS / Mermaid build with two interactive data browsers (Properties and Entities) and a built-in resource viewer that opens any local schema or document through JSON Crack.

## Live site

Deployed to [opda-kb.pages.dev](https://opda-kb.pages.dev) via Cloudflare Pages.

## Project layout

```
/
├── docs/                       # Static site — Astro publicDir
│   ├── index.html              # Home (two-card landing)
│   ├── governance.html         # Governance section landing
│   ├── modelling.html          # Modelling section landing
│   ├── resource.html           # ?path= viewer (JSON Crack, iframe, etc.)
│   ├── pages/                  # 25+ topic pages (01-* through 33-*)
│   ├── ui/
│   │   ├── design-system.css   # Tokens + components
│   │   ├── design-tokens.css   # Light/dark CSS variables
│   │   ├── site.js             # Chrome, sidebar, TOC, theme toggle, Mermaid bootstrap
│   │   └── data-browser.js     # Vanilla-JS table component (pagination, sort, filter, search)
│   └── data/
│       ├── properties.js       # 8,458 schema property rows for the data dictionary
│       ├── entities.js         # 554 SKOS concepts for the business glossary
│       └── resources/          # Pre-built JSON.js wrappers (file:// fallback for resource viewer)
├── scripts/                    # Python data builders
│   └── build-json-bundles.py   # Regenerates docs/data/resources/ from source/
├── src/pages/                  # Astro routes (sitemap, 404)
├── astro.config.mjs            # Astro config: publicDir=docs, outDir=dist
├── deploy.sh                   # gh + wrangler deploy pipeline
├── serve.sh                    # Local HTTP server on :8000
└── package.json
```

Note: a ~500 MB `source/` directory of cloned upstream repos, transcripts, and reference PDFs is kept locally but excluded from git (see `.gitignore`). The deployed site doesn't need it — `docs/data/resources/` already bundles the JSON files the resource viewer reaches for.

## Local development

```bash
# install Astro deps
npm install

# serve over Astro's dev server (port 4321)
npm run dev

# OR serve docs/ directly via Python (port 8000) — no build needed
./serve.sh

# build → dist/
npm run build

# preview the built dist/
npm run preview
```

## Deploy

One command from the project root (uses your local `gh` and `wrangler` auth):

```bash
./deploy.sh
```

Prerequisites on your Mac:

```bash
brew install gh node
npm install -g wrangler
gh auth login        # opens browser
wrangler login       # opens browser
```

`deploy.sh` will:

1. Read your GitHub username via `gh api user`
2. Create `<you>/opda-kb` on GitHub if it doesn't already exist
3. Push the repo
4. Build the Astro site (→ `dist/`)
5. Deploy to Cloudflare Pages project `opda-kb`
6. Print the live URL

## Stack

- **Astro 4** — static site generator wrapping the existing HTML
- **Mermaid 10** (CDN) — diagrams
- **JSON Crack** (hosted widget) — JSON graph viewer in the resource page
- **No build-time JavaScript framework** — every page is hand-written HTML + vanilla JS that calls `OPDA.init(...)`

## License

Project content is © OPDA contributors. Source upstream repos retain their original licenses.
