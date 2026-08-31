---
status: accepted
date: 2026-08-31
updated: 2026-08-31
tags: [notebooklm, knowledge-management, information-architecture, source-curation, prompt-engineering, property-pack, semantic-modelling, working-groups, governance, provenance]
supersedes: []
amends: []
depends-on: [ADR-0039, ADR-0051, ADR-0057, ADR-0062, ADR-0063, ADR-0065, ADR-0066, ADR-0067, ADR-0068, ADR-0069, ADR-0070, ADR-0071, ADR-0072, ADR-0075, ADR-0077, ADR-0078]
implements:
  - docs/notebooklm/portfolio-shared-facts.yaml
  - docs/notebooklm/programme-policy-history.yaml
  - docs/notebooklm/standards-governance.yaml
  - docs/notebooklm/semantic-modelling-method.yaml
  - docs/notebooklm/working-group-participant-guide.yaml
  - docs/notebooklm/property-pack-ontology.yaml
  - docs/notebooklm/pdtf-lineage-historical-evidence.yaml
---

# Organise OPDA evidence into purpose-specific NotebookLM portfolios

## Context and Problem Statement

OPDA wants to use NotebookLM to produce grounded presentations, reports,
infographics, audio and video about the programme, its governance, semantic
modelling, working-group participation and the data model. The available corpus
contains primary evidence, public website explanations, governance decisions,
ontology decisions, generated references, transcripts, presentations, source
schemas and several representations of the same facts.

One notebook containing the whole repository would mix incompatible audiences,
authority levels and maturity states. It would also encourage generated outputs to
conflate:

- OPDA's programme with one technical input;
- an accepted decision with a proposed operating model;
- source evidence with an endorsed model;
- the independent Property Pack ontology with a complete SPDTF ontology that does
  not yet exist; and
- the PDTF schema, its OPDA-derived ontology and the future SPDTF standard.

The current data model is the **Property Pack ontology**. It is an independent
delivery with its own bounded scope and governance, intended to become a component
of the future Smart Property Data Trust Framework. OPDA has not yet gathered the
evidence or developed the additional contextual-boundary models needed to claim a
broader SPDTF ontology.

The operator's NotebookLM plan permits **500 sources per notebook**. That capacity
removes any need to merge documents pre-emptively. Individual files, public URLs,
meeting transcripts and rendered website routes are easier to cite, replace and
audit when they remain separate. Exact duplicates and out-of-scope projections may
still be excluded, but source count alone is not a reason to combine material while
a notebook remains within its 500-source limit.

This ADR decides the notebook information architecture, authority boundaries,
source-selection and source-unit rules. It does not select the final source
manifest for each notebook, upload material, generate public artefacts or authorise
publication.

## Decision Drivers

- Give each notebook one coherent subject, audience and production purpose.
- Keep programme narrative, formal governance, modelling method and participant
  operations distinct while allowing controlled shared context.
- Describe the Property Pack ontology accurately as an independent delivery and
  future SPDTF component.
- Prevent historic PDTF evidence from appearing to be an OPDA-endorsed predecessor
  standard or current SPDTF authority.
- Preserve decision status, source authority, provenance, dates and dissent for
  every independently ingested source.
- Prefer canonical glossaries, dictionaries, ontologies and registers over hundreds
  of generated navigational projections.
- Use the 500-source allowance deliberately without inventing a smaller target or
  merging sources before a demonstrated capacity or compatibility need exists.
- Support both non-technical communication artefacts and detailed technical review
  without forcing either audience through the other's corpus.
- Make every notebook independently intelligible because notebooks do not inherit
  the complete context of their peers.

## Considered Options

- **One repository-wide notebook.** Rejected because it exceeds a useful source
  scope, mixes authority and audience, and makes duplicate or historic material
  disproportionately influential.
- **Four notebooks matching the initial subjects.** Rejected because programme and
  standards governance require different narratives, while the proposed working-
  group notebook combines participant operations, technical modelling and formal
  decision authority.
- **One notebook for every website section or bounded context.** Rejected for the
  initial portfolio because the present corpus would fragment shared meaning and
  create many thin notebooks before additional domain evidence exists.
- **Six purpose-specific core notebooks with optional archive and production
  notebooks (chosen).** This separates audience and authority while retaining a
  small controlled facts pack across related notebooks.

## Decision Outcome

OPDA will create six core notebooks grouped into two related portfolios. Optional
notebooks may be added only when their distinct production purpose or corpus size
justifies the boundary.

### Programme and participation portfolio

| Notebook | Purpose | Primary audience |
|---|---|---|
| **Programme, policy and history** | Why the work exists; the Government's Smart Data programme; evidenced government milestones and their status; OPDA's role; roadmap; and development history | Executives, policymakers and new participants |
| **Standards governance** | Authority, decision rights, maturity stages, working-group ownership, interoperability decisions, consultation, consensus, ratification and maintenance | Chairs, reviewers and programme leaders |
| **Semantic modelling method** | Evidence-led modelling, AI-assisted extraction, contextual boundaries, common elements, SKOS mappings, the current SSSOM decision and non-adoption boundary, validation, provenance and modelling rules | Modellers, technical reviewers and interested participants |
| **Working-group participant guide** | Why to participate; what members contribute; meetings; Teams; SharePoint; source submission; model review; feedback; iteration; and how decisions affect the model | Current and prospective participants |

### Models and evidence portfolio

| Notebook | Purpose | Primary audience |
|---|---|---|
| **Property Pack ontology** | The current independent data-model delivery: ontology, business glossary, data dictionary, contextual boundaries, diagrams, mappings, validation and coverage | Domain experts, implementers and reviewers |
| **PDTF lineage and historical evidence** | The PDTF schema's historical role, the OPDA-derived ontology, lessons learned, traceability, migration evidence and what was retained, challenged or superseded | Historians, migration teams and auditors |

The canonical relationship statement for the model notebook and every shared facts
pack is:

> The Property Pack ontology is an independent delivery being developed as a future
> component of the Smart Property Data Trust Framework.

The portfolio must not call the Property Pack ontology "the SPDTF ontology" or imply
that the wider model already exists. A separate SPDTF data-model notebook may be
introduced only after additional contextual-boundary evidence and models have been
developed through the governed process.

### Optional notebooks

The following notebooks are permitted but are not part of the initial six:

1. **Evidence and external landscape** — a research library of government
   publications, external standards, sector evidence, surveys and recordings used
   for fact-checking without overwhelming narrative notebooks.
2. **Decision and provenance archive** — the complete ADR and ODR corpus organised
   by subject, owner, status and date. Narrative notebooks receive selected decisions
   rather than the complete archive.
3. **Communications studio** — a deliberately small collection of approved summaries,
   terminology, key diagrams and scripts used to create outward-facing artefacts.
   It receives curated outputs from authoritative notebooks and never becomes an
   alternative source of truth.

### Authority and maturity rules

Notebook sources and generated artefacts must preserve the status of the underlying
decision record:

- ADR-0063's domain-led working groups and ADR-0066/ADR-0067's Property Pack
  modelling approach are accepted.
- ADR-0075's treatment of the Property Pack ontology as a future SPDTF component is
  accepted.
- ADR-0070's uniform Microsoft 365 working-group workspace pattern is accepted.
- ADR-0065's AI-assisted evidence-to-model workflow remains proposed.
- ADR-0068's standards lifecycle, consensus and ratification model remains proposed.
- ADR-0077 keeps the PDTF schema as attributed third-party input rather than an
  endorsed predecessor scheme or authority for SPDTF meaning.
- ADR-0039, ADR-0057, ADR-0062, ADR-0069, ADR-0071, ADR-0072 and ADR-0078 are
  accepted; ADR-0051 remains proposed. Resource groups that include them must preserve
  those individual statuses rather than acquire a collective status from the
  resource-group label.

Notebook instructions must prevent proposed policy from being paraphrased as current
operative policy. Historic facts, current implementation, accepted direction and
proposed governance must remain distinguishable in both sources and prompts.

### Shared facts and terminology pack

Each core notebook receives a small, versioned shared pack containing only canonical
cross-portfolio facts:

- full names and roles of OPDA, SPDTF, the Property Pack ontology and the PDTF schema;
- the relationship between the independent Property Pack delivery and future SPDTF;
- programme purpose, government context, separately sourced milestone dates and
  their legal or policy status;
- current maturity and authority statements;
- contextual-boundary and working-group names;
- approved definitions for recurring programme terms; and
- the pack version, production date and links to its authoritative sources.

The pack is defined and built once by the
[portfolio shared-facts configuration](../notebooklm/portfolio-shared-facts.yaml).
Every notebook configuration references that one output; no notebook may redefine it
from a different source set. This controlled duplication makes each notebook
self-contained. Narrative summaries or generated claims must not be copied between
notebooks without their authority and status metadata.

### Property Pack ontology source policy

The Property Pack ontology notebook includes:

- one canonical ontology representation suitable for ingestion;
- one canonical business glossary;
- one canonical data dictionary, split by contextual boundary only if source size or
  use makes that necessary;
- contextual-boundary summaries and model diagrams;
- incoming and outgoing relationship summaries;
- the current mapping state, governed SKOS mappings when they exist, and the documented
  SSSOM decision and non-adoption boundary;
- coverage and traceability summaries;
- validation and conformance reports;
- selected ODRs explaining material modelling choices; and
- a short status document explaining the ontology's independent delivery and future
  relationship to SPDTF.

It excludes:

- Property Pack source schemas;
- PDTF JSON Schemas and overlays;
- generated page-per-class documentation;
- generated page-per-property documentation;
- duplicate serialisations of the same ontology unless a representation carries
  unique evidence;
- duplicate glossary and dictionary projections;
- raw build output and obsolete website copies;
- both SRT and VTT versions of the same transcript; and
- both an original source and a generated copy when they carry no distinct content.

The generated class and property website pages are navigation and presentation
projections. The ontology, glossary and data dictionary represent their substantive
information more compactly and are the canonical notebook sources.

### PDTF lineage source policy

The lineage notebook excludes the PDTF and Property Pack source schemas themselves.
It may include:

- the canonical OPDA-derived PDTF ontology;
- the business glossary and data dictionary needed to understand that derivation;
- provenance, mapping, traceability and migration summaries;
- selected model diagrams and historical explanations; and
- decisions that establish the source's third-party, non-normative status.

The notebook must distinguish the third-party PDTF schema from OPDA's technical
derivation and from SPDTF development.

### Source-unit, conversion and manifest rules

Each core notebook has a **500-source limit**. The default source unit is one
repository file, one public URL, one meeting transcript or one rendered website
route. Resource groups in the configuration organise prompt scope; they are not
instructions to concatenate their members. There is no lower target range and no
reserve percentage that justifies premature merging.

Keep sources discrete even when several records concern the same topic. In
particular:

- ingest each ADR and ODR as its own source;
- ingest one transcript per meeting or presentation;
- render each selected website route to its own source;
- ingest each external URL or downloaded publication separately;
- convert unsupported JSON, YAML, TOML, Turtle, SPARQL, Astro or other formats
  one-to-one into a supported textual source while retaining the original path and
  checksum; and
- keep glossaries, dictionaries, ontologies, mappings and validation reports
  separate unless a source is already a single maintained document.

Combining sources is permitted only when the manifest demonstrates a concrete need:
the selected discrete sources would exceed 500, NotebookLM cannot ingest a source
even after one-to-one conversion, or the records are inseparable parts of one
maintained work. The shared facts and terminology pack is the one initial intentional
synthesis because its purpose is controlled cross-notebook consistency, not source-
count reduction.

Documents from different authorities must never be flattened into unattributed
prose. Every converted source, and any exceptional combined source, carries a
machine-readable or plainly formatted manifest with:

- document title;
- originating person or organisation;
- original date and conversion or combination date;
- status and maturity;
- original repository path or public URL;
- the reason for inclusion;
- clear boundaries between component documents; and
- a checksum or version identifier when the input is maintained in the repository.

Each notebook will have a maintained source manifest recording inclusion, exclusion,
deduplication, one-to-one conversion and any exceptional combination. Generated
summaries are outputs, not silent replacements for primary evidence.

### Notebook configurations and preparation-prompt pipeline

Each core notebook has a version-controlled configuration that records its NotebookLM
identifier, purpose, audiences, intended artefacts, authority guardrails, candidate
resources, exclusions, missing dependencies, prepared-source outputs, ordered
preparation prompts, execution fields and artefact-generation gate:

| Notebook | Configuration | Preparation prompts |
|---|---|---|
| Programme, policy and history | [programme-policy-history.yaml](../notebooklm/programme-policy-history.yaml) | `PPH-01` to `PPH-07` |
| Standards governance | [standards-governance.yaml](../notebooklm/standards-governance.yaml) | `SG-01` to `SG-08` |
| Semantic modelling method | [semantic-modelling-method.yaml](../notebooklm/semantic-modelling-method.yaml) | `SMM-01` to `SMM-08` |
| Working-group participant guide | [working-group-participant-guide.yaml](../notebooklm/working-group-participant-guide.yaml) | `WG-01` to `WG-09` |
| Property Pack ontology | [property-pack-ontology.yaml](../notebooklm/property-pack-ontology.yaml) | `PP-01` to `PP-09` |
| PDTF lineage and historical evidence | [pdtf-lineage-historical-evidence.yaml](../notebooklm/pdtf-lineage-historical-evidence.yaml) | `PDTF-01` to `PDTF-09` |

The prompt pipeline prepares grounded data for later production; it does not generate
the final artefacts. Its execution sequence is:

1. subject the completed ADR and configuration set to an adversarial Opus review and
   record or apply the findings;
2. review and approve the candidate source manifest for each notebook;
3. implement and approve the missing preparation builder, then build the shared facts
   pack and convert every unsupported source one-to-one with manifests and checksums;
   transformations involving extraction, rendering or summarisation also require
   named human sign-off;
4. record the repository owner's public-source authorisation, ingest the selected
   sources privately and verify NotebookLM processing;
5. execute each notebook's preparation prompts in the configured order and source
   scope, pasting the complete labelled text of dependency notes into each dependent
   prompt and saving the response as a named NotebookLM note;
6. append a run record containing the prompt and dependency versions, execution date,
   selected source identifiers, conversation, response and note identifiers, output
   checksum, review findings and any rerun relationship;
7. review every preparation note for citations, source authority, maturity leakage,
   unresolved contradictions and notebook-specific risks, then rerun affected prompts;
8. mark the notebook ready for artefact generation only after a human reviewer accepts
   its final preparation pack; and
9. begin artefact briefs and generation as a separate downstream step.

Prompt outputs are derived working data. They must retain their source citations, may
not silently replace primary evidence and may not be re-ingested as authoritative
sources. An artefact generator may consume only a preparation pack that has passed the
configuration's gate, and must preserve its caveats and prohibited claims.

The Opus adversarial review completed on 2026-08-31. It identified four controls:
canonical treatment of unsupported milestone claims, dependency-note carry-forward,
implementation of the preparation builder, and rights/data classification for the
personal NotebookLM workspace. The repository owner subsequently confirmed that all
repository material is public, duplicates material already available on public
SharePoint sites and is authorised for NotebookLM upload. That decision closes the
rights/data-classification control; the other implementation and review controls
remain in force.

### Consequences

- Good, because artefacts can address a defined audience without importing the entire
  technical and historical corpus.
- Good, because the Property Pack ontology cannot be mistaken for a complete SPDTF
  ontology or for a direct translation of the source schema.
- Good, because proposed governance and AI-assisted methods remain visibly proposed.
- Good, because independently ingested sources preserve NotebookLM's source-level
  citations, replacement boundaries and provenance.
- Good, because a controlled facts pack keeps recurring programme statements
  consistent across otherwise independent notebooks.
- Good, because a complete decision archive can remain available without allowing its
  volume to dominate narrative notebooks.
- Bad, because selected material and shared facts must be updated deliberately when
  authority, maturity or programme facts change.
- Bad, because unsupported formats and rendered routes still require a missing
  one-to-one conversion builder, manifests and review before upload.
- Bad, because prompt execution is non-deterministic and requires a retained run record,
  citation review and human approval before reuse.
- Bad, because NotebookLM does not provide shared reasoning across notebooks; useful
  cross-portfolio context must be repeated explicitly.
- Neutral, because the source corpus remains authoritative in the repository; the
  notebooks are derived research and production workspaces.
- Neutral, because this ADR authorises no public sharing, publication or deployment.

### Confirmation

- The six core notebook names, purposes and audiences are accepted by the operator.
- On 2026-08-31 the six empty core notebooks were created in the operator's personal
  NotebookLM account through the dedicated `personal` CLI profile. The Codex MCP
  launcher is configured to use the same active profile. No sources have yet been
  uploaded and none of the notebooks has been shared.
- The Property Pack ontology is described as an independent delivery and future SPDTF
  component, never as the complete SPDTF ontology.
- The source-selection rules exclude source schemas and generated page-per-term
  documentation while retaining canonical ontology, glossary, dictionary, mapping,
  coverage and decision evidence.
- Six draft notebook configurations and one centrally owned shared-facts configuration
  now record candidate resources, exclusions, prompt sequences and execution gates.
  They are plans for review, not evidence that ingestion or prompt execution occurred.
- The maturity statements above match the status and update dates of ADR-0063,
  ADR-0065, ADR-0066, ADR-0067, ADR-0068, ADR-0070, ADR-0075 and ADR-0077 on
  2026-08-31.
- The Opus adversarial review has been completed and its accepted findings are encoded
  in this ADR and the notebook configurations.
- On 2026-08-31 the repository owner confirmed that every repository source is public,
  duplicates material already available on public SharePoint sites and is authorised
  for NotebookLM upload. No configured source may be deferred on privacy,
  confidentiality, personal-data or rights grounds.
- The operative subscription limit is 500 sources per notebook. Configured resource
  groups expand to discrete sources by default; documents are combined only after a
  manifest records a concrete capacity, format or inseparability reason.
- Implementation remains incomplete until the preparation builder, source manifests
  and conversions have been approved, selected sources have been ingested, every configured
  preparation prompt has been executed and the resulting preparation packs have passed
  citation, authority and contradiction review. Artefact generation follows as a
  separately authorised downstream step.
- Notebook creation and source upload are private workspace actions; this ADR does not
  authorise sharing notebooks or publishing generated artefacts.

## Amendment History

- **2026-08-31 — Configured source and preparation-prompt plans.** Added the centrally
  owned shared facts pack, six notebook configuration manifests, ordered prompt
  execution and review, and an explicit gate separating preparation from later
  artefact generation; corrected the SSSOM description to its current non-adoption
  boundary.
- **2026-08-31 — Applied Opus adversarial review.** Removed the unsupported 2030
  canonical fact, added rights and builder gates, made dependency-note transport and
  append-only run evidence explicit, corrected decision maturity and repository-
  tracking assumptions, and required human sign-off for judgement-based transformations.
- **2026-08-31 — Recorded public-source authorisation and discrete-source policy.**
  Closed the rights/data-classification gate on the repository owner's authority,
  recorded the 500-source-per-notebook limit and replaced pre-emptive bundling with
  one-source-per-file, URL, transcript or rendered route by default.

## More Information

- [ADR-0063 — Domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [ADR-0066 — Property Pack closed seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — First-principles Property Pack ontology](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [ADR-0068 — OPDA standards lifecycle](./ADR-0068-govern-opda-standards-lifecycle.md)
- [ADR-0070 — Uniform Microsoft 365 working-group workspaces](./ADR-0070-uniform-microsoft-365-working-group-workspaces.md)
- [ADR-0075 — Property Pack ontology as an accelerated SPDTF component](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md)
- [ADR-0077 — PDTF schema as a third-party input](./ADR-0077-place-pdtf-schema-beneath-spdtf-as-third-party-input.md)
- [NotebookLM shared facts and terminology configuration](../notebooklm/portfolio-shared-facts.yaml)
- [Programme, policy and history notebook configuration](../notebooklm/programme-policy-history.yaml)
- [Standards governance notebook configuration](../notebooklm/standards-governance.yaml)
- [Semantic modelling method notebook configuration](../notebooklm/semantic-modelling-method.yaml)
- [Working-group participant guide notebook configuration](../notebooklm/working-group-participant-guide.yaml)
- [Property Pack ontology notebook configuration](../notebooklm/property-pack-ontology.yaml)
- [PDTF lineage and historical evidence notebook configuration](../notebooklm/pdtf-lineage-historical-evidence.yaml)
- [NotebookLM source and usage limits](https://support.google.com/notebooklm/answer/16213268)
