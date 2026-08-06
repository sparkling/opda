---
status: accepted
date: 2026-07-19
updated: 2026-08-06
tags: [website, information-architecture, modelling, migration, bounded-context, publication]
supersedes: []
depends-on: [ADR-0041, ADR-0044, ADR-0063]
implements: [src/pages/v2, src/pages/modelling/property-pack.astro]
---

# Revamp the modelling website before publishing the new working-group approach

## Context and Problem Statement

The current OPDA website documents the model and standards implementation that exist
today. Its ontology, mapping, schema, glossary, dictionary, shapes and bounded-context
pages form a connected account of the schema-derived linked-data programme.

ADR-0063 proposes a materially different development method: develop domain-led models
through bounded-context working groups, with a separate Interoperability Working Group
and the existing corpus retained as evidence and implementation input. Updating
individual current pages to describe that future method would mix two different
authorities and maturity levels in one navigation structure.

That piecemeal approach would create a confused website:

- some pages would describe the current schema-derived corpus as authoritative;
- other pages would describe it as a diagnostic baseline;
- current overlay-derived bounded contexts would sit beside newly discovered domain
  boundaries;
- users could not tell whether a term or diagram represented today's standard, a
  proposal, or a working-group draft.

The new approach therefore needs an information-architecture and content redesign
before it is published on the website.

Supporting rationale is in
[`docs/research/bounded-context-working-group-approach.md`](../research/bounded-context-working-group-approach.md).

## Decision Drivers

- Preserve the website as an accurate account of the current implementation.
- Prevent current, proposed and draft models from being conflated.
- Give the new domain models a coherent navigation, status and provenance system.
- Make non-technical working-group review the primary interaction, not an appendix to
  schema documentation.
- Obtain an explicit OPDA brand system rather than inferring one from informal review
  comments.
- Plan redirects and archival treatment before changing circulated URLs.
- Avoid spending effort patching pages that will be replaced by a complete redesign.

## Considered Options

- **Option A — Update existing pages incrementally.** Add notices and revise individual
  pages as the new strategy develops.
- **Option B — Add a small "future approach" section beside the current site.** Keep
  the current pages unchanged but publish a limited set of strategy pages.
- **Option C — Keep the current website stable and publish only after a complete
  modelling-section revamp is designed (chosen).**

## Decision Outcome

Chosen option: **Option C — no piecemeal publication into the current model.**

The existing website continues to document the current schema-derived implementation.
The new working-group strategy, draft domain models and research remain in ADRs,
research notes and working artefacts until either a complete revamp is approved or an
explicitly versioned and clearly labelled review section is authorised. ADR-0066 and
the operator's 2026-08-04 publication instruction authorised the isolated V2 review
section without replacing or rewriting the current pages.

### Revamp scope

The follow-on website plan must resolve, as one coherent release:

1. **Status and provenance** — visually distinguish current standard, diagnostic
   baseline, working-group draft, reviewed proposal and adopted model.
2. **Model separation** — decide whether the current model is archived, versioned, or
   retained as a named baseline beside the new models.
3. **Bounded-context navigation** — provide a consistent home for each context's
   glossary, dictionary, controlled vocabularies, taxonomies, resources and
   relationships, with the RDF ontology, generated JSON Schemas, validation and
   human-readable exports presented as views of the same agreement.
4. **Working-group navigation** — cover all six bounded-context groups, the DBT Smart
   Data scheme group and the separate Interoperability Working Group.
5. **Ontology-category navigation** — make the eight retained categories visible
   within every group, including their `model here`, `reuse shared`, `boundary
   contribution` or `not applicable` disposition.
6. **Interoperability navigation** — provide a context map, common boundary ontology
   and cross-context mappings without presenting them as one universal domain model.
7. **Review interaction** — make diagrams, semantic definitions, examples and feedback
   the primary surface for non-technical participants, and provide a threaded
   bulletin-board discussion system, similar to Discourse, on the relevant model
   pages. This supplements rather than replaces Teams as each group's communication
   hub.
8. **Review lifecycle** — show the source evidence, current draft, changes since the
   previous draft, unresolved questions, feedback disposition and candidate status,
   including when a model becomes the official first draft. Later consensus,
   resolution and adoption states remain subject to a separate governance decision.
9. **Evidence capture** — support governed ingestion of documents, forms, diagrams,
   examples, meeting transcripts and online discussions, with consent, provenance,
   access and confidentiality controls.
10. **Technical views** — retain machine-readable RDF/OWL/SKOS/SHACL and implementation
   traceability without making syntax the workshop interface.
11. **Migration** — define URL redirects, version identifiers and links from current
   schema/mapping pages to the appropriate future equivalents.
12. **Release completeness** — identify every page whose meaning changes so the
   transition lands as a coherent set, not a mixture of old and new claims.
13. **Brand system** — obtain the current OPDA logo assets, colour, typography,
   illustration, accessibility and component guidance, or explicitly record which
   elements remain undecided before visual design begins.

### Interim use of the website

The existing website may be demonstrated in working-group meetings to show the
interaction patterns OPDA intends to use: graph diagrams, term pages, definitions,
glossary and dictionary views. Presenters must state that the content is the current
schema-derived model and is being shown as a demonstration, not as the starting model
the group is being asked to approve.

No existing V1 page is to be updated merely to announce ADR-0063. New candidate work
must remain isolated in a versioned, visibly non-normative review section until a
separate migration decision authorises replacement of current pages.

### Consequences

- Good, because the public site remains internally coherent and trustworthy.
- Good, because the future experience can be designed around domain review instead of
  fitted into a schema-documentation structure.
- Good, because current and future models can receive explicit status and provenance.
- Bad, because the new strategy will not be visible on the public website immediately.
- Bad, because the revamp becomes a larger, coordinated piece of work.
- Neutral, because the current site remains useful as both documentation and a
  demonstration of possible model-review interactions.

### Confirmation

- No existing V1 page is changed to present ADR-0063 before migration is approved.
- A follow-on ADR defines the new information architecture, status model, migration
  plan, page inventory and release gate.
- The redesign accounts for all six content outputs and the publication artefacts of
  each bounded-context and scheme group, plus the outputs of the Interoperability
  Working Group.
- The redesign supports the resource-to-candidate-to-feedback-to-official-first-draft
  cycle and the deferred governance boundary defined by ADR-0065.
- The redesign includes all six bounded-context groups, the DBT Smart Data scheme
  group and the Interoperability Working Group, and exposes the eight-category
  coverage statement for each modelling group.
- The release plan includes a full-site consistency review and rendered-page review.
- The design brief cites an approved OPDA brand pack or records the agreed substitute;
  informal email comments are not treated as a complete style guide.
- Existing URLs continue to resolve through retained pages or explicit redirects.

## Amendments

- **2026-08-04 — Accepted with an isolated V2 review path.** The operator authorised
  publication of the Property Pack candidate and V2 documentation as a separate,
  clearly labelled review surface. This satisfies the anti-mixing intent of this ADR;
  it does not authorise an in-place rewrite or replacement of current V1 pages.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow with human-governed review](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [Research — bounded-context working-group approach](../research/bounded-context-working-group-approach.md)
- [Research — AI-assisted working-group method](../research/ai-assisted-working-group-method.md)
- [ADR-0041 — ontology reference-document generation](./ADR-0041-ontology-reference-document-generation.md)
- [ADR-0044 — ontology as dereferenceable web pages](./ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md)
