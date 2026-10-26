---
status: accepted
date: 2026-10-26
updated: 2026-10-26
tags: [notebooklm, authoring, communication, artefacts, presentation]
supersedes: []
amends: [ADR-0081]
depends-on: [ADR-0040, ADR-0081, ADR-0094]
implements: []
---

# Create OPDA notebook artefacts and their presentation indexes

## Status and scope

Accepted implementation plan at the owner's request. This change supplies the plan,
shared-skill instructions and a versioned implementation reference. OPDA's existing
source preparation is implemented; the new media generation/delivery/index binding
is not implemented or exercised by this ADR. No generation or public sharing was
started. Notebook and source identities already recorded under ADR-0081 remain intact.

## Context and decision

[ADR-0081](ADR-0081-organise-opda-evidence-into-purpose-specific-notebooklm-portfolios.md)
is Accepted and already owns purpose-specific portfolios, source manifests,
preparation scripts and private notebooks. Its README label of “implementation
pending” is an incomplete description of the subsequently recorded preparation;
this ADR distinguishes existing preparation from the new artefact pipeline.

Reuse those owners and the user-level `notebooklm-authoring` skill. Transfer the
successful authoring and presentation practices from AI Strategy Business
Architecture, not H&M's topics, audience, source bodies, notebook IDs or deployment.
Do not mirror OPDA's website sitemap mechanically: a useful media account may span
several routes, while a technical reference route may not need media at all.

## Organisation: portfolios, sections, chapters and topics

A portfolio/notebook is a source and audience boundary. A section is a coherent
reader interest. A chapter answers a substantial question within it. A topic is
an individually useful explanation for a medium, not simply a smaller heading.
A topic may cover the complete chapter or one meaningful aspect. Stable IDs join
these entities; titles and route labels remain human-readable. Keep provenance
through renames and splits; never silently repurpose an ID tied to old media.

Start with the existing six purpose-specific notebooks and aggregate discovery
notebook. Revalidate their current authority and audience against the latest OPDA
research; historical numerical limits and August source counts are not today's
service limits or proof of completeness. The aggregate is for discovery, not the
automatic source selection for every artefact.

Use this initial organisational brief, refining it from current evidence before
freezing the catalogue:

| Section candidate | Primary audience and purpose | Candidate chapter questions |
| --- | --- | --- |
| Programme and shared value | Sponsors and industry decision-makers; establish the case for participation | What changes through shared property information? What is delivered and what remains proposed? |
| Property information in practice | Property professionals and data contributors; explain useful changes in work | How does a property pack move through a transaction? How are meaning, context and provenance retained? |
| Standards and governance | Chairs, reviewers and accountable owners; explain authority and change | Who owns meaning? How are proposals reviewed, challenged, versioned and adopted? |
| Semantic modelling | Modellers and domain specialists; build shared competence | How do glossary, taxonomy, dictionary and model fit together? How are examples and boundaries investigated? |
| Participation and implementation | Working-group participants and implementers; support useful contribution | What should a participant bring? How does evidence become a reviewed contribution? How does a consumer adopt a released model? |

These are design candidates, not a completed new OPDA catalogue or assertions that
all proposed standards are operative. Retain the Property Pack/SPDTF/PDTF authority
and historical distinctions from their current owners. Archive/history material is
selected only where the subject needs it, not presented as current endorsement.

For each section/chapter record purpose, audience, question, useful scope, parent,
related subjects, source coverage and topic IDs. For each topic record title,
plain-language description, medium, selected source identities and contribution.
Choose video, deck, audio and infographic topics independently where their useful
accounts differ; do not mechanically copy every topic across all formats. Include
a complete-chapter topic when it adds a connected account instead of duplicating
all narrower topics. A section overview is a genuine overview, not a concatenation.

## Authoring: three inspectable inputs

| Input | What it contains | What it must not become |
| --- | --- | --- |
| Prompt | Short subject commission and relevant audience; a specific intervention only when justified | A prescribed storyline, slide quota, palette, repeated cautions or required ending |
| Source material / direction | Attributed tailored explanation with situations, mechanisms, distinctions, alternatives and consequences; optional synthesis only for a missing connection | A disguised long producer instruction repeated across global/chapter/topic layers |
| Data sources | Exact selected notebook source IDs, complete bodies, versions, hashes, provenance and selection rationale | A list of local paths or citations assumed to have been uploaded |

Distil dispersed technical evidence into worthwhile audience-appropriate readings
while retaining consequential qualifications. Select complementary originals only
where they add evidence, examples, relationships or useful visual material.
Selecting a bundled source exposes its complete membership, not just the cited
fragment. Verify what is actually supplied. Original citations not supplied belong
in provenance and must not be displayed as selected NotebookLM content.

A suitable starting prompt is “Explain how shared property information changes a
transaction, for property professionals.” This is an example, not a universal
recipe. Let NotebookLM decide the explanatory sequence, visual language and
composition. Avoid “standalone presentation”, “independent reading”, “self-contained
deck”, “without a presenter” and equivalent hidden demands across every input layer.
Do not replace these with generic verbosity or mandatory visual instructions.

Review the complete resolved package: global, section, chapter, topic and format
text; source-internal directions; optional synthesis; final prompt; native request
arguments and adapter defaults. Remove duplication and unintended instruction.
There is no compulsory separate editorial source. Producer notes are not a default:
verify current support and test separately before adding another instruction layer.

The originating comparisons were limited local deck experiments, not proof of a
universal best prompt length, source count, synthesis or cross-media causal result.
Review actual OPDA outputs before generalising creative quality.

## Skill, agent and default outputs

Installed shared skill locations on this machine:

- Codex: `/Users/henrik/.codex/skills/notebooklm-authoring/SKILL.md`
- Claude: `/Users/henrik/.claude/skills/notebooklm-authoring/SKILL.md`

Use `$notebooklm-authoring` in Codex or the corresponding Claude skill. Its companion
`notebooklm-author` agent follows the caller's selected model/effort; do not silently
choose a transport or assume the skill itself starts an agent. Confirm installed
agent registration in the target host. The skill is authoring guidance plus a thin
workflow adapter, not an installed NotebookLM API, scheduler or renderer.

| Medium | Defaults for commissioned topics |
| --- | --- |
| Language | British English (`en-GB`) |
| Video | One Explainer with Auto-select visual style and one Cinematic without a visual-style override |
| Deck | One Detailed Deck and one Presenter Slides; both Long |
| Audio | Brief, Deep Dive, Debate; each native Default length |
| Infographic | Landscape, Auto-select; Concise, Standard, Detailed; two takes each, same selected sources and prompt |

These are overridable owner defaults, not Google recommendations. No invented
video-duration control. Resolve actual client labels/values live; do not copy
numeric API enums blindly. No flashcards, quizzes, data tables, mind maps or written
reports in the default set; ADR-0081's separately requested briefings can remain
explicit additions. If one topic receives every default there are 13 outputs, but
format-specific topics mean totals must be calculated from actual requests.

## Reference copy and reuse contract

[Reference archive](../notebooklm/reference/notebook-index-reference.zip) contains
20 source files: AI section directory/scaffold/routes and latest run-index adapters,
EA shared notebook components, and skill/adapter files.
[Manifest](../notebooklm/reference/manifest.json) records exact file hashes, source
paths and repository commits. It is a reviewed transfer reference, **not a complete
runnable dependency closure**, installed OPDA application or licence to copy source
research into OPDA. It excludes media, research bodies, credentials and runtime DBs.

Extract into a temporary inspection directory when needed. Do not execute its
AI-specific adapters unchanged: they reference H&M variants, private run ledgers,
source pins and external owners. The latest AI run adapter demonstrates the current
three-input inspection view; older generic scaffolding still has legacy synthesis
terminology. Follow this ADR's current behaviour, not those old labels/defaults.

Production implementation must reuse the shared EA renderer at an exact reviewed
revision, supplying OPDA data/options. Resolve its transitive components, styles,
fonts, media converters and dependencies through the existing shared-renderer
mechanism; verify the chosen release, rather than mixing current working files and
an older config pin. Keep the archive immutable as provenance. Fix shared behaviour
in the shared owner instead of maintaining an OPDA fork. OPDA branding belongs in
configuration. The captured files alone do not establish portability or licensing
for third-party redistribution; keep this internal reference out of public assets.

## Index presentation contract

1. Collection directory: section cards with purpose, representative image and
   chapter links; equal-height cards within a row. The card is clickable while
   chapter links remain independently accessible; no nested anchors. A compact
   section jump index points to cards, distinct from chapter-card styling.
2. Section page: section overview plus chapters on one page. Do not invent a page
   per chapter merely because chapter IDs exist. Stable chapter/topic anchors
   support links. Begin with collapsed accordions and modest indentation.
3. Within each chapter: artefact type → topic → output variants. Opening one
   artefact type closes the other type. Infographics add detail level → two takes.
   Do not add redundant Audio/Deck/Video anchor lists below each topic heading.
4. Use existing deck lightbox, previous/next and slide index. Current-slide download
   is on slide-navigation level after the index. Whole-deck PDF download is a
   right-aligned icon in the heading row. Video open/download, audio download and
   infographic downloads use accessible icon buttons, not extra text rows or a
   broken gallery button. No notebook links on public media cards.
5. Expose **Prompt**, **Source material / direction**, **Data sources** using exact
   submitted inputs. Render Markdown as safe HTML with raw text available. Separate
   provenance-only sources from supplied bodies and actual media from pending work.
6. Use verified original media and suitable slide/image renditions for HiDPI
   screens. Never silently substitute a lower-quality video rendition. Validate
   dimensions, duration, nonzero body, decode and hash; compare the source/download
   for quality regressions. Label any future upscale separately and retain original.
7. Render the page promptly. Lazy-load inactive media; bounded background prefetch
   must not block render or launch all videos. Honour reduced motion/visibility,
   release resources and avoid runaway CPU/GPU. Use OPDA Chrome for browser checks.
8. Keep immutable versioned run indexes and a run directory with changes, input
   links and evaluation notes. Ordinary viewers see useful subjects, not diagnostic
   counts such as “6 / 6 ready” masquerading as topic descriptions.

## Implementation sequence and existing owners

1. Inventory current OPDA sources/notebook receipts and audience needs. Read current
   ADR-0081 and affected standards/website decisions before treating old bodies as
   current. Design and review sections/chapters/topics; record exact IDs and scope.
2. Extend `docs/notebooklm/*.yaml` through their existing owners, preserving accepted
   original receipts and historical IDs. Prepare complete prospective topic packages
   with new source identities for changed bodies. Do not mutate frozen past inputs.
3. Reuse `scripts/build-notebooklm-prepared-sources.mjs`,
   `scripts/run-notebooklm-preparation.mjs` and `scripts/verify-notebooklm-execution.mjs`
   plus their library modules. Read their actual flags before use: preparation can
   upload/run prompts and is not an offline dry-run. Existing verification includes
   historical fixed counts; extend deliberately for new catalogue versions.
4. Bind an OPDA media supervisor/delivery/index adapter to existing native tooling.
   Adapt the proven shared owners rather than writing another harness. Existing OPDA
   preparation does not establish that media generation/delivery already exists.
   Declare SDK/interpreter, authentication profile, Node/Astro, shared renderer,
   PDF renderer, ffmpeg/ffprobe and required media dependencies explicitly.
5. Supply `config/notebook-workflow.json` with schema
   `notebooklm.project-workflow.v1`, OPDA `cwd`, explicit `runId`, dependencies and
   argv arrays for `dry-run`, `prepare`, `validate`, `generate`, `download`, `index`.
   Use the skill's `references/project-workflow.md` and `scripts/run-workflow.py`.
   The adapter's `--check` verifies paths/commands, not authentication or API health.
6. Review resolved inputs, then authorised upload with full indexed source readback
   and membership checks. Record what fidelity the readback proves. Freeze exact
   request/source hashes and notebook identities before provider submission.
7. Generate a small representative acceptance slice, inspect complete outputs and
   repair concrete issues. Then run the commissioned set with automatic delivery
   and index refresh; do not make the owner babysit jobs.
8. Before create, persist attempt; immediately save acknowledged provider ID.
   Reconcile uncertain submissions before retrying. Track actual starts, poll active
   jobs, distinguish slow/stalled/failed/quota states, and restart through supported
   same-ID recovery where available. A stalled item does not block others. Saturate
   actual provider capacity within safe local resources, back off to the provider's
   reported reset, resume automatically and stop when the finite manifest completes.
9. One supervisor/lock owns each run; downloads continue as completed jobs arrive.
   Validate bytes and media before atomic catalogue updates; no incomplete assets
   advertised as complete. Preserve failures and publish useful completions without
   endless rerolls. Review slides/images visually and actual audio/video playback.
10. Implement index data projection and shared components under a separate OPDA
    artefact build scope. Test desktop/mobile, keyboard/lightbox/downloads, detail
    accordions, input dialogs, safe HTML and missing-media handling. Run `make test`
    and appropriate build before committing code. Use OPDA's existing CI/AWS owners,
    not H&M buckets/Cognito/hosts or a new hosting stack.

## Acceptance and publication boundary

Done means an OPDA catalogue and all commissioned input packages are reviewed;
selected uploaded sources match their recorded bodies; native defaults match
consumed arguments; one representative generation/recovery/delivery flow passes;
indexes and download bytes are verified; failed/quota/held states remain honest;
and subsequent finite runs need no manual babysitting. Retain scoped evidence and
appropriate native project-memory readback through the OPDA owner, never this AI
project's connection. Do not write OPDA ADR metadata into another project's index.

This ADR commissions the implementation design and reference handover only. It
neither starts generation nor adds routes to the public OPDA website. Subsequent
implementation uses the existing repository main-only workflow and scoped commits.
Publication follows ADR-0081's source/sharing boundaries and the actual release
approval; no private notebooks, prompt receipts or research reference archive become
public simply because an index has been built. Test local first and verify exact
served routes before handing over URLs.

## Consequences

Reuse preserves the mature media experience and avoids another renderer/scheduler.
OPDA retains control of its audience, terminology and sources. Costs are source
curation, dependency binding and actual media review; a shared skill does not remove
them. Completion history remains auditable while future packages can improve.
