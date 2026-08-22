# OPDA Linked Data Project — Knowledge Base

This repository is the working knowledge base for the **Open Property Data Association (OPDA)** linked-data project. It records the existing PDTF schema package and the separate draft ontology derived from its schema, dictionary, glossary and supporting evidence. That technical work informs the progression from schema to **SPDTF**, the first collaboratively authored scheme draft; the derived ontology is not itself an OPDA-endorsed scheme.

OPDA is the UK's industry body for digital property data, backed by government, finance, banking, estate agents, surveyors, and conveyancers. Existing technical assets include the PDTF schema package, an OpenAPI specification and Trust Framework material.

## What's in this repo

The repo is organised by **purpose** (what work it supports) rather than by source. Numbered prefixes give a natural reading order. Every downloaded file is intended to keep provenance (original URL, modified date, modified by) in either a sibling `.meta.yaml` or in `INVENTORY.md`.

| Folder | What goes here |
|---|---|
| `00-deliverables/` | What we produce: plan, roadmap, presentations, the linked-data model itself (glossary, taxonomy, dictionary, ontology, SHACL shapes, mappings), DCAM governance design |
| `01-organisation/` | Who OPDA is: constitution, articles of association, code of conduct, GDPR, accreditation policy, members and partners |
| `02-policy-and-positioning/` | OPDA's positions: briefings to government, OPDA-authored reports, strategic papers |
| `03-standards/` | OPDA's own technical outputs (cloned repos): `schemas/`, `api/`, `trust-framework/` |
| `04-governance-bodies/` | How OPDA decides: Steering Group meetings, six working groups (Comms & PR, Engagement, Policy, Regulator, Technical) |
| `05-engagement/` | How OPDA communicates: presentations, YouTube videos + transcripts, internal meeting transcripts, consumer campaign |
| `06-research/` | Evidence and pilots: third-party reports, consumer survey, Smart Data Challenge 2025, Trust Framework PoC, InnovateUK |
| `07-website/` | `source/` is the Astro repo (forthcoming redesign), `rendered/` is the full live WordPress site mirror (16 pages + 70 blog posts) |
| `08-external-references/` | Third-party standards OPDA cites: UK property forms (TA6, TA7, BASPI, NTS), DCAM, related W3C specs |
| `_taxonomy/` | Design rationale: `v1-draft.md`, `v1-critique.md`, `v2-final.md` (current) |
| `_working/` | In-progress thinking, project glossary of acronyms, reading notes |
| `_inbox/` | Drop SharePoint downloads here; helper tools live here |

See `_taxonomy/v2-final.md` for the full design rationale and a "where does X go?" decision tree.

## Key sources

- **Public website:** https://openpropdata.org.uk (live WordPress, mirrored in `07-website/rendered/`)
- **GitHub org:** https://github.com/Property-Data-Trust-Framework (5 repos, all cloned)
- **YouTube:** https://www.youtube.com/@OpenPropData (15 videos, transcripts in `05-engagement/videos-youtube/`)
- **LinkedIn:** https://www.linkedin.com/company/open-property-data-association/
- **PDTF schema docs:** https://trust.propdata.org.uk (built from `03-standards/schemas/`)
- **SharePoint tenant:** `openpropertydataassociation.sharepoint.com` (Exec Team + DPMSG Trust & Interop sites — see `_inbox/sharepoint-manifest.json`)

## Read these first

Three of the cloned GitHub repos contain `CLAUDE.md` files designed for AI consumption — start here:

- `03-standards/schemas/CLAUDE.md` — how the PDTF JSON Schemas work (modular overlay system, v3.4.0)
- `03-standards/trust-framework/CLAUDE.md` — the Trust Framework spec and governance
- `06-research/smart-data-challenge/code/CLAUDE.md` — the SDC 2025 reference implementation

Plus:
- `INVENTORY.md` — master catalog of every source asset with status
- `_working/project-glossary.md` — DPMSG, BASPI, PDTF, NTS, TA6/7 and other acronyms
- `_taxonomy/v2-final.md` — folder structure rationale and decision tree

## Status

| Source | Status |
|---|---|
| 5 GitHub repos (schemas, api, trust-framework, web, smart-data-challenge-2025) | ✅ Cloned with full history |
| Website (16 pages + 70 posts) | ✅ Mirrored to `07-website/rendered/` |
| YouTube channel (15 videos) | ✅ Metadata + auto-transcripts in `05-engagement/videos-youtube/` |
| SharePoint top-level files | ✅ 47/53 downloaded and organised (videos and 175+ MB PDFs skipped — listed in INVENTORY.md) |
| SharePoint subfolders | ✅ 73/79 downloaded (Consumer Campaign year folders, R&D subfolders, all 4 Working Group folders, all 8 Steering Group date subfolders, Previous versions archive). Engagement WG videos and OPDA Report variants skipped. |
| Internal SharePoint video transcripts (19 videos) | ✅ Pulled via SharePoint Stream's native transcripts API. WebVTT files in `04-governance-bodies/.../transcripts/` and `05-engagement/videos-internal/transcripts/` |
| Video binaries (Steering Group recordings, OPDA all-member updates, OneDrive Recordings, HBSG PoC) | 📋 Not downloaded — ~5.3 GB. Transcripts captured instead. Keep video URLs in INVENTORY.md if originals ever needed. |

## Conventions

- **Provenance:** every downloaded file should keep a `.meta.yaml` sibling with `source_url`, `original_path`, `modified_date`, `modified_by`, `downloaded_at`.
- **Archive:** superseded versions go into `_archive/` at the same level. Original filename kept; add `.YYYY-MM-DD` suffix if disambiguation needed.
- **Working notes vs deliverables:** `_working/` for unfinished thinking. `00-deliverables/` for things going to stakeholders.
- **Cross-referencing:** when a file plausibly belongs in two places, pick the primary home and add a one-line pointer in the other (e.g., a Smart Data Challenge slide deck lives in `05-engagement/presentations/`, with a note in `06-research/smart-data-challenge/`).
