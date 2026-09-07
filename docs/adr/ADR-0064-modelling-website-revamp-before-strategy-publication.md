---
status: accepted
date: 2026-07-19
updated: 2026-09-07
tags: [website, information-architecture, modelling, migration, bounded-context, publication]
supersedes: []
depends-on: [ADR-0041, ADR-0044, ADR-0063]
implements: [src/pages/development/property-pack, src/pages/semantic-modelling]
---

# Revamp the modelling website before publishing the new working-group approach

> Update 2026-09-07 — Corrected Trust and teaching scope: the Modelling section
> teaches domain and ontology modelling. JSON-LD is a generated artefact, not a
> separate subject requiring payload examples or detailed delivery explanations.
> SPDTF Trust belongs to the broader Smart Data scheme work, not a new learning
> track here. Explain only domain-model annotations and mappings that can support
> that framework within the retained categories. Model-review governance is a
> distinct concern. ADR-0063 §2a records this boundary; linked-data-store guidance
> remains informative and operational application training remains out of scope.

> Update 2026-09-05 — the operator requested an extensive two-audience Modelling
> section: plain-language explanation, benefits and website participation, plus a
> technical account of the normative method. The expansion uses the existing
> `/semantic-modelling/**` page and navigation templates. ADR-0063's dated
> clarification selects the relevant source ODRs and reconciles earlier wording;
> it neither imports unrelated categories nor changes historical ontology inputs.
> Implementation of this content does not authorise publication.

> Update 2026-09-03 — the Property Pack reader pages now live at
> `/development/property-pack/**`. This route-only amendment does not change
> the presentation or modelling decisions recorded below.
>
## Context and Problem Statement

The current OPDA website documents the technical material that exists today. Its PDTF
schema, supporting glossary and dictionary, schema-derived ontology, mapping, shapes and
bounded-context pages form a connected account of the earlier linked-data work.

ADR-0063 proposes a materially different development method: develop domain-led models
through bounded-context working groups, with a separate Interoperability Working Group
and the existing corpus retained as evidence and implementation input. Updating
individual current pages to describe that future method would mix two different
authorities and maturity levels in one navigation structure.

That piecemeal approach would create a confused website:

- some pages would describe the PDTF schema or schema-derived ontology as authoritative
  beyond its actual technical status;
- other pages would describe it as a diagnostic baseline;
- current overlay-derived bounded contexts would sit beside newly discovered domain
  boundaries;
- users could not tell whether a term or diagram represented the existing PDTF schema,
  the schema-derived ontology, an SPDTF proposal, or a working-group draft.

The new approach therefore needs an information-architecture and content redesign
before it is published on the website.

Supporting rationale is in
[`docs/research/bounded-context-working-group-approach.md`](../research/bounded-context-working-group-approach.md).

## Decision Drivers

- Preserve the website as an accurate account of the PDTF schema and schema-derived implementation.
- Prevent current, proposed and draft models from being conflated.
- Give the new domain models a coherent navigation, status and provenance system.
- Make non-technical working-group review the primary interaction, not an appendix to
  schema documentation.
- Apply the supplied Q3 2026 OPDA guide and original vectors through the complete,
  governed web contract adopted by ADR-0073.
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

The existing website continues to document the PDTF schema and schema-derived implementation.
The new working-group strategy, draft domain models and research remain in ADRs,
research notes and working artefacts until either a complete revamp is approved or an
clearly labelled review section is authorised. ADR-0066 and the operator's 2026-08-04
publication instruction authorised the isolated Property Pack review section without
replacing or rewriting the existing PDTF schema pages.

### Revamp scope

The follow-on website plan must resolve, as one coherent release:

1. **Status and provenance** — visually distinguish the PDTF schema, schema-derived
   diagnostic baseline, working-group draft, reviewed proposal and adopted model.
2. **Model separation** — decide whether the current model is archived, versioned, or
   retained as a named baseline beside the new models.
3. **Bounded-context navigation** — provide a consistent home for each context's
   glossary, dictionary, controlled vocabularies, taxonomies, resources and
   relationships, with the RDF ontology, generated JSON-LD artefacts and associated
   JSON Schemas, validation and
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
   including when a model becomes the collaborative first draft. Later consensus,
   resolution and adoption states remain subject to a separate governance decision.
9. **Evidence capture** — support governed ingestion of documents, forms, diagrams,
   examples, meeting transcripts and online discussions, with consent, provenance,
   access and confidentiality controls.
10. **Technical views** — explain ontology modelling in RDF/RDFS/OWL/SKOS/SHACL,
   including domain meaning, relationships, constraints and the selected method.
   Both reader journeys focus on the model. Mention JSON-LD briefly as a generated
   output; do not add payload-design lessons, package walkthroughs or generator detail.
   Cover privacy, sensitivity, access-role semantics, provenance and time as model
   concerns that support SPDTF Trust, using the adopted category profiles. Link the
   existing DBT Smart Data section for broader scheme context; do not add a Trust-
   governance, accreditation or security-operations course. Distinguish domain roles,
   scheme roles and access permissions. Linked-data-store implementation is informative;
   adopted model requirements retain their scope. Participants review meaning in
   ordinary language, without designing or operating the wider Trust Framework.
11. **Migration** — define URL redirects, version identifiers and links from current
   schema/mapping pages to the appropriate future equivalents.
12. **Release completeness** — identify every page whose meaning changes so the
   transition lands as a coherent set, not a mixture of old and new claims.
13. **Brand system** — use ADR-0073 and `DESIGN.md` for the supplied logo, colour and
   typography evidence and for the derived accessibility, imagery and component
   decisions that complete it.

### Interim use of the website

The existing website may be demonstrated in working-group meetings to show the
interaction patterns OPDA intends to use: graph diagrams, term pages, definitions,
glossary and dictionary views. Presenters must state that the content is the
schema-derived model and is being shown as a demonstration, not as the starting model
the group is being asked to approve.

No existing PDTF schema page is to be updated merely to announce ADR-0063. New candidate
work must remain isolated in a visibly non-normative SPDTF review section until a
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

- No existing PDTF schema page is changed to present ADR-0063 before migration is approved.
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
- The design implementation distinguishes supplied, observed and derived evidence,
  and tests the complete contract recorded by ADR-0073.
- Existing URLs continue to resolve through retained pages or explicit redirects.

## Amendments

- **2026-09-07 — Re-author the reusable source teaching, with a new editorial design.**
  The operator rejected relocating the complete schema-derived reference and
  authorised a complete rewrite of its reusable modelling explanations within
  Ontology modelling. A six-chapter judgement core covers foundational analysis,
  representation, roles and change, context connections, evidence and time, and
  reasoning from sources. The remaining language, vocabulary, constraint, mapping,
  sensitivity and decision references retain their distinct subject ownership
  within the same new chapter layout. Navigation and search expose both parts.
  New diagrams, comparison infographics and paired-mode illustration replace the
  old technical teaching visuals. Local ODRs and their amendments govern the
  rewrite; historical identity answers, category tags, simulated council votes,
  implementation counts and retired inference conventions do not transfer as
  method. Established context boundaries remain inputs. Source transformation,
  runtime application design and detailed JSON-LD lessons remain excluded.
  This authorises local implementation and validation, not publication or
  adoption of a candidate ontology. It supersedes the 5 September constraint to
  retain the previous modelling-page components, not the shared site authority
  and navigation contracts. Changes to circulated routes still require an
  explicit destination and tested migration, rather than accidental dead links.
- **2026-09-07 — Two-audience teaching enrichment implemented locally.** The
  operator authorised implementation of the reviewed enrichment proposals using a
  Ruflo-tracked swarm, native Codex authors and an independent native Claude
  editorial review. The existing learning routes now connect a fictional property
  story, form/tree/graph reading, roles and phases, and practice with worked
  feedback. The technical routes add a vocabulary/classification chapter and
  deepen constraint authoring, mapping review and privacy/access semantics.
  Accessible vector diagrams, a comparison infographic and light/dark editorial
  illustrations support the text; shared page navigation and glossary remain the
  common entry points. No upstream ODR, candidate ontology or programme Trust
  policy is changed. Newer upstream policy modelling remains a separate adoption
  decision. This teaching slice does not complete the proposed review application,
  recruited learner evaluation or the broader migration, and does not authorise
  publication. Chrome rendered-page review is still required when the existing
  OPDA browser connection is available.
- **2026-08-04 — Accepted with an isolated Property Pack review path.** The operator authorised
  publication of the Property Pack candidate and its documentation as a separate,
  clearly labelled review surface. This satisfies the anti-mixing intent of this ADR;
  it does not authorise an in-place rewrite or replacement of existing PDTF schema pages.
- **2026-08-16 — Coherent visual-system replacement authorised.** The operator
  authorised ADR-0073 to replace the shared design system, website shell, home page
  and design-system reference coherently across opda.org.uk. This does not alter the
  status or meaning of PDTF schema or SPDTF candidate content, approve a modelling-content migration,
  change the other production sites or authorise deployment.
- **2026-08-19 — Property Pack route exception authorised by ADR-0075.** The operator
  authorised a no-redirect move: old `/v2` maps to `/spdtf/property-pack`, old
  `/v2/comparison` maps to `/spdtf/property-pack/spdtf/inputs/pdtf-schema-lineage`, every other old
  `/v2/{suffix}` maps to `/spdtf/property-pack/{suffix}`, and old
  `/modelling/property-pack` maps to `/spdtf/property-pack/definition-and-scope`.
  This narrowly amends the earlier URL-continuity rule; atomic content, fragment and
  comment-identity preservation remain mandatory.
- **2026-08-22 — Chair-authority terminology correction.** The existing body of work is
  the PDTF schema and its separately identified schema-derived ontology; it was not an
  OPDA-endorsed predecessor scheme. SPDTF is the first collaboratively authored scheme
  draft. The information architecture must present a schema-to-scheme continuation and
  must not imply numbered-version succession. Historical route evidence and stable
  `/pdtf/**` identifiers remain unchanged.

## More Information

- [ADR-0063 — domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0065 — AI-assisted evidence-to-model workflow with human-governed review](./ADR-0065-ai-assisted-evidence-to-model-workflow.md)
- [Research — bounded-context working-group approach](../research/bounded-context-working-group-approach.md)
- [Research — AI-assisted working-group method](../research/ai-assisted-working-group-method.md)
- [ADR-0041 — ontology reference-document generation](./ADR-0041-ontology-reference-document-generation.md)
- [ADR-0044 — ontology as dereferenceable web pages](./ADR-0044-ontology-as-web-pages-dereferenceable-entity-detail-pages.md)
