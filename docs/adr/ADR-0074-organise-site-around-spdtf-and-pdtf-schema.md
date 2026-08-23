---
status: accepted
date: 2026-08-18
updated: 2026-08-23
tags: [website, information-architecture, pdtf-schema, spdtf, ontology, semantic-modelling, standards, migration, governance]
supersedes: []
amends: [ADR-0002, ADR-0041, ADR-0059, ADR-0062, ADR-0073]
depends-on: [ADR-0002, ADR-0039, ADR-0041, ADR-0059, ADR-0062, ADR-0063, ADR-0064, ADR-0066, ADR-0067, ADR-0073]
implements: [docs/spdtf-information-architecture.md, src/pages/index.astro]
---

# Organise the site around SPDTF and the PDTF schema

> Update 2026-08-23 — public-homepage alignment implemented: `/` now derives six
> audience-led task cards from the accepted global-destination registry, in the same
> order. Its hero centres collaborative SPDTF work and visible authority status; the
> PDTF schema remains reachable only through SPDTF Development's attributed third-party
> inputs rather than appearing in the hero, status strip, primary actions or peer
> destinations, or becoming the homepage's organising story.
> Publication and deployment remain separate, unauthorised actions.
>
> Update 2026-08-23 — accepted global-navigation and semantic-modelling correction:
> the six destinations are Programme, Governance, Semantic modelling, SPDTF Development,
> Working groups and Resources, in that order. `SPDTF Development` is the navigation
> label for `/spdtf`, not a renamed or adopted scheme. Semantic-modelling reader pages
> move as one exact-suffix family from `/spdtf/ontologies` and
> `/spdtf/ontologies/**` to `/semantic-modelling` and `/semantic-modelling/**`; the
> former routes are retired without redirects, rewrite aliases or duplicate pages.
> The PDTF schema remains a third-party SPDTF input beneath
> `/spdtf/inputs/pdtf-schema/**`, and stable `/pdtf/**` RDF identifiers remain unchanged.
> Implementation and local validation are in progress; this note authorises no
> publication or deployment.
>
> Update 2026-08-19: the user accepted this decision and authorised implementation
> in a separate feature worktree. The migration and release gates passed at audited
> evidence baseline `24f9fb4ca8405343dc13d2d4b7119a30e1b883d7`, so this ADR is
> Implemented. This status does not mean published or deployed, and the redesigned
> root information architecture remains outside the frozen `/v2/**` route family.
>
> Update 2026-08-19 — preview reconciliation: the initial implementation retained
> the legacy 13-section local rail even though the six destinations were present
> in the global header. `src/lib/site-navigation.ts` now composes every legacy
> section route under its current owner and drives all six left rails, breadcrumbs
> and exact-match previous/next sequences. The heading-derived page navigation is
> visible in-article or in the optional right rail, and container-responsive panels
> preserve the reading width. Status remains Implemented; this note makes no new
> deployment claim.
>
> Update 2026-08-21 — accepted correction, partially implemented: ADR-0075 now
> treats `/v2/**` as the Property Pack ontology component of SPDTF, replaces the
> generic Development input branch with a canonical Property Pack workstream, exposes
> the PDTF schema and schema-derived ontology as distinct inputs, and records a Technical
> Working Group determination followed by later domain review. The Property Pack route
> consolidation and two-part PDTF schema navigation are implemented; ADR-0075 remains
> Accepted while its governance and complete lineage gates remain open.
>
> Update 2026-08-19 — route-continuity exception: the operator subsequently chose one
> canonical `/spdtf/property-pack/**` family and explicitly declined compatibility
> routes for `/v2/**` and `/modelling/property-pack`. ADR-0075 supersedes this ADR's
> stable-route clauses only for those Property Pack routes. Atomic information,
> fragment and feedback-thread preservation remain release gates.
>
> Update 2026-08-20 — local navigation categories: each left-rail category heading
> is now its canonical landing-page link, with a separate disclosure button for child
> pages. The landing no longer appears as a duplicate child, but remains in breadcrumb
> and previous/next sequences. The schema-derived ontology branch further groups
> lineage, audience views, architecture, terms, validation, trust and tooling beneath
> substantive linked landings; nested model tiers retain their real overview pages.
> Existing routes remain available and keep their authority and status.
>
> Update 2026-08-20 — semantic-modelling depth: the implemented branch now has two
> linked audience paths: Understand ontologies, including a model-reading guide; and
> How we model SPDTF, including the evidence-up method and explicit modelling
> rules. The repeated in-page journey widget is removed in favour of the shared left
> navigation, page contents and previous/next sequence. Standards pages distinguish
> specification maturity, OPDA governance status and actual candidate use. This
> implements the semantic-documentation portion of ADR-0075 without promoting that
> still-Accepted decision or the Proposed ADR-0065/0068 workflows.
>
> Update 2026-08-21 — PDTF schema route consolidation: [ADR-0076](./ADR-0076-consolidate-pdtf-schema-documentation-under-hierarchy-reflecting-routes.md)
> supersedes this ADR's stable-route clauses for PDTF schema reader documentation. Those
> pages move beneath `/spdtf/inputs/pdtf-schema/**`; their old routes and the `/manual/**` aliases are
> removed without redirects. Atomic information, fragment, status and feedback-thread
> preservation remain release gates. `/pdtf/**` is not a compatibility family: it
> remains the unchanged RDF identifier and dereferenceability namespace.
>
> Update 2026-08-21 — decision-corpus navigation: Governance now links once to the
> ADR index and once to the ODR index. Individual decision records remain canonical
> pages reached from those indexes, but no longer expand the left rail or
> participate in its previous/next sequence.
>
> Update 2026-08-21 — Governance and working-group guidance: the Governance rail now
> mirrors the six substantive clusters on its landing page through linked gateways,
> while retaining every existing child route and its own status. Working groups now
> exposes a separate member guide for access, Teams, SharePoint evidence, meetings and
> model review before the eight workspaces. Recruitment remains a standalone public
> route, and the guide does not expose private operational links or promote proposed
> ADR-0065/0068 rules. This note makes no publication claim.

## Context and Problem Statement

The website currently presents thirteen peer navigation sections. Seven of them —
Modelling, Model, Ontology, Mapping, Schema, Implementation and Adoption — document
the PDTF schema, supporting material and schema-derived semantic corpus. Those
descendants do not have uniform authority: technical publication does not make the
schema an OPDA-endorsed scheme, and the schema-derived ontology, model, mapping and
stub pages retain their own maturity and review status.

The current programme is SPDTF, the Smart Property Data Trust Framework: the first
scheme draft being written collaboratively across industry and stakeholders. It uses
domain-led, evidence-up modelling through bounded-context working groups, with a
separate Interoperability Working Group and human authority over meaning. The PDTF
schema, its schema-derived ontology and participant resources are inputs; they
contribute compatibility, constraints, coverage and migration evidence but do not
determine SPDTF domain meaning. This is a schema-to-scheme continuation, not a
numbered-version succession.

The current navigation mixes programme context, PDTF schema implementation, the
machine-generated Property Pack seed, current governance and resources. It therefore
cannot reliably tell readers which material is published, under development,
non-normative or historically named.

It also provides no canonical current journey explaining why ontologies are used, how
the working groups turn evidence into context-owned candidates, which semantic outputs
stay aligned, how the eight formal modelling concerns differ from the presentation’s
eleven themes, or which standards are targets, candidates, projections or legacy tools.

DBT Smart Data is an external, cross-economy government programme enabled by the
Data (Use and Access) Act 2025. Property is under evidence gathering and prospective
scheme design; no operating statutory property scheme or government-approved SPDTF
standard has been identified. OPDA work is recognised as market activity and evidence,
not as delegated government authority.

ADR-0064 requires a follow-on decision for the coherent information architecture,
status model, migration plan and release gate. This implementation satisfies that
follow-on requirement; ADR-0064's unrelated decisions remain operative.

## Decision Drivers

- Make SPDTF participant review the primary development surface.
- Keep the PDTF schema and schema-derived ontology directly findable and distinct.
- Prevent machine-generated material from acquiring human standards authority.
- Use SPDTF for current collaborative scheme work and PDTF schema for the existing
  technical input.
- Define one cross-programme authority and status system.
- Explain the ontology method in business language without conflating semantic meaning,
  validation, downstream projections or approval.
- Make standards status, conformance scope and mapping type explicit.
- Account for every reader route and preserve stable semantic identifiers before changing
  navigation paths; a reader-route preservation receipt does not require a compatibility route.
- Apply migration rules to complete generated route families, not individual pages.

## Considered Options

- **Mirror the PDTF schema and SPDTF.** Rejected because this would imply two equivalent
  generations or schemes rather than an asymmetric schema-to-scheme continuation.
- **Keep the thirteen-section navigation.** Add work-area and status banners to the
  current structure.
- **Use an asymmetric task-and-authority architecture (chosen).** Separate the two
  bodies of work while sharing Programme, Governance and Resources, and expose direct
  Semantic modelling and Working groups task paths.

## Decision Outcome

Accepted: adopt six global destinations, in this order:

1. Programme.
2. Governance.
3. Semantic modelling.
4. SPDTF Development.
5. Working groups — a shortcut to the single canonical family within SPDTF Development.
6. Resources.

`SPDTF Development` is the navigation label for `/spdtf`; it does not rename SPDTF,
create a numbered generation or imply adoption. SPDTF is the current collaborative
scheme draft in development, not an adopted standard. The PDTF schema input area beneath
SPDTF Development contains the existing schema, supporting material and separately
identified schema-derived ontology, each with its own status. It must not be presented as
an OPDA-endorsed predecessor scheme.

The existing `/v2/**` corpus is labelled **SPDTF Property Pack candidate —
machine-generated pre-draft — non-normative — no working-group review or approval
recorded**. It remains structured and reviewable, but is not called the complete SPDTF
ontology, an approved working-group draft or a replacement contract.

Governance owns one versioned registry with separate fields for work area, authority,
maturity, version and provenance. Interoperability is a peer of domain working groups
within SPDTF development and links to Governance for its decision rights.

**Semantic modelling** is one canonical peer global destination at
`/semantic-modelling`, with two audience paths. **Understand ontologies** explains why
ontologies are used and how to read the model. **How we model SPDTF** documents the
evidence-up method, six-part semantic package, context boundary, modelling rules,
coverage, standards, evidence and mappings, validation and projections.

The branch distinguishes three taxonomies:

- six reviewable semantic outputs — glossary, dictionary, taxonomies, controlled
  vocabularies, resources and relationships;
- eleven participant-facing workshop themes arranged under Meaning, Trust,
  Correctness and Exchange; and
- eight formal ontology-coverage concerns from ADR-0063/0067, each disposed as
  `model here`, `reuse shared`, `boundary contribution` or `not applicable`.

Its standards profile records purpose, exact version/conformance, mechanism, status,
owner, evidence/decision and re-open trigger. RDF 1.2 Basic, a portable SPARQL 1.2
subset and SHACL 1.2 Core are bounded targets; broader claims require feature evidence.
External vocabularies and modelling frameworks are assessed rather than inherited.
JSON Schema, JSON-LD, forms, APIs and documentation are tested projections, not
independent semantic authorities.

“Mapping” is always qualified: legacy RML schema–ontology verification, planned
JSON-LD contexts, current cross-context semantic mapping, Property Pack coverage links,
or an optional runtime transformation. Coverage links are not RML/R2RML.

### Semantic-package workspace contract identifier

The canonical public identifier for the semantic-package workspace contract is
**`https://opda.org.uk/spdtf/semantic-package/workspace-contract`**, at revision
**`2026-08-22`**. It supersedes the intermediate
`https://opda.org.uk/spdtf-2/semantic-package/workspace-contract` identifier at its
`1.0.0` state solely because the Chair-authorised terminology correction changes the
public identifier. The intermediate identifier is retained only as migration metadata:
it is not a current alias or compatibility route, and neither its path nor its version
denotes an SPDTF generation. The contract's semantic-package meaning and evidence
history are preserved; this remint is the bounded exception required to remove the
withdrawn public version label. Stable `/pdtf/**` identifiers for the separate
schema-derived ontology remain unchanged.

Programme owns the canonical DBT Smart Data context. Governance describes external
statutory and prospective-scheme constraints, Resources holds official sources, and
SPDTF development links relevant evidence as an input. In accordance with
ADR-0063, the working-group roster includes an OPDA-internal DBT Smart Data
cross-sector scheme-design group. It is not a government-established property-scheme
body and cannot confer statutory or government-approved status on SPDTF.

The complete hierarchy, route placement, page contract and migration gates are
defined in
[`docs/spdtf-information-architecture.md`](../spdtf-information-architecture.md).

This ADR amends only the **top-level navigation and content-owner placement clauses**
of ADR-0002, ADR-0041, ADR-0059 and ADR-0062. Their stable routes,
ontology-generation rules, mapping provenance, Smart Data source treatment and other
technical decisions remain. It does not supersede those ADRs as a whole.

### Consequences

- Good, because SPDTF development, the PDTF schema and the schema-derived ontology become unambiguous.
- Good, because participants can enter through working groups and review meaning in
  business language.
- Good, because implementers retain a two-interaction path to schemas and validation.
- Good, because one status system prevents competing work-area-specific authority claims.
- Good, because participants gain a plain-language ontology journey while implementers
  retain qualified technical views.
- Good, because six outputs, eleven themes and eight formal concerns cannot silently
  collapse into one misleading taxonomy.
- Good, because the current route inventory becomes a deterministic migration ledger.
- Bad, because six new labels will disrupt familiarity with the thirteen-item header.
- Bad, because coherent status metadata must be applied across thousands of pages.
- Neutral, because route continuity is decision-specific: semantic-modelling content and
  feedback identity are preserved while the former reader routes intentionally disappear.

### Confirmation

The original information architecture was Implemented on the isolated
`feat/spdtf-2-ia` branch. Its audited implementation baseline is
`24f9fb4ca8405343dc13d2d4b7119a30e1b883d7`; the status-change commit is a later
governance-only change. The 2026-08-23 global-navigation correction is Accepted and
reopens implementation until its additional route and navigation gates pass. Neither
the historical commits nor this correction authorises publication or deployment.

Human approval was required before acceptance; implementation then required the
complete migration and release gates listed below.

The original branch contains the route/status registry, canonical landings and
workspaces, search facets, runtime journeys, and exact preservation manifests. It
satisfied the then-current gates for:

- a disposition for every route, generated family, bundled artefact, published source
  object and compatibility alias in the current-site IA inventory;
- checksum/consumer preservation ledgers for sources, council records, ontology/data
  artefacts, support assets and runtime authentication, comments and submissions;
- one canonical working-group URL family under SPDTF;
- one canonical two-audience Ontologies and semantic modelling journey with the exact
  six/eleven/eight distinction and four category dispositions;
- a status-controlled standards profile and unambiguous mapping vocabulary;
- the revisioned semantic-package workspace contract at its canonical SPDTF identifier,
  competency questions, coverage receipts and
  immutable candidate diffs so projections cannot become independent meaning sources;
- inherited five-field status metadata on every generated page;
- a machine-readable migration manifest;
- task tests for participant, implementer and governance journeys;
- complete route, fragment, search, accessibility, responsive, keyboard, visual,
  unit and build gates;
- a coherent release rather than piecemeal changes.

The 2026-08-23 correction additionally requires:

- the exact global order Programme, Governance, Semantic modelling, SPDTF Development,
  Working groups and Resources;
- the public root derives six audience/task cards with those exact labels and URLs from
  the global registry, introduces SPDTF's collaborative purpose and in-development
  authority, and gives the PDTF schema no hero, status, primary-action or peer position;
- one canonical top-level `/semantic-modelling/**` reader family containing both audience
  paths, with no Semantic modelling branch beneath SPDTF Development;
- exact-suffix preservation receipts from `/spdtf/ontologies` and
  `/spdtf/ontologies/**`, while emitting no old route, redirect, rewrite alias or
  duplicate page; and
- unchanged placement and authority for `/spdtf/inputs/pdtf-schema/**`, with every
  stable `/pdtf/**` RDF identifier and representation unchanged.

The schema-v5 preservation receipt accounts for 562,664 baseline information-block
occurrences: 561,743 exact, 868 source/hash-bound semantic reframes and 53
provenance-bound superseded navigation copies. Its eight exact families are the source
archive, council Markdown, ontology artefacts, deployed data, UI assets, image assets,
ontology tools and the 690-route `/v2/**` atomic seed. The checker rejects a new route
beneath `/v2/**`.

At the evidence baseline, `make ci-browser` passed the 2,604-page Astro data build,
3,485/3,485 HTML preservation check, 3,485-HTML/5,284-file crawl with zero unresolved
or unlinked outputs, and 84/84 Playwright tests. The different counts are deliberate:
Astro reports pages it renders, the preservation/crawl includes copied static HTML,
and the emitted-file count also includes non-HTML assets. `make ci` passed 140/140
unit tests, 5/5 schema tests, zero schema drift, 74 ADR records, and every ontology,
documentation, graph and IA-parity gate. Two consecutive production data builds kept
content-addressed asset tokens and strict preservation stable.

Fable and Claude Sonnet each scored the implementation 98/100 with zero blockers; the
OpenAI Devil's Advocate scored it 100/100 with zero blockers. A native subscription
Claude–Codex deliberation then returned `accepted` with publication authority withheld.
These reviews corroborate the executable gates; they do not replace them.

ADR-0064's follow-on IA requirement is complete. Its unrelated decisions remain
operative.

## Rules

- Use SPDTF for the first collaboratively authored scheme draft and its development work.
- Use PDTF schema for the existing JSON Schema, dictionary, glossary and overlays; use
  schema-derived ontology for the technical ontology extracted from that corpus.
- Do not imply that the PDTF schema or schema-derived ontology was an OPDA-endorsed
  predecessor scheme.
- Do not call SPDTF an adopted standard before recorded governance approval.
- Do not present SPDTF as an approved statutory property Smart Data scheme or treat
  OPDA participation in government forums as delegated authority.
- Do not classify the Property Pack seed as working-group reviewed.
- Do not present technical validation as semantic approval.
- Do not infer child-artifact authority from the PDTF schema parent label.
- Do not inherit legacy standards or modelling-framework choices into SPDTF without
  an explicit profile disposition.
- Do not conflate the six semantic outputs, eleven workshop themes or eight formal
  ontology-coverage concerns.
- Do not use an unqualified “mapping” label.
- Do not create duplicate governance, status, glossary or working-group records.
- Do not redirect a route without a recorded semantic-equivalence decision and test.
- Use `/semantic-modelling` and `/semantic-modelling/**` for semantic-modelling reader
  pages. Do not emit, redirect, rewrite, alias or duplicate `/spdtf/ontologies` or
  `/spdtf/ontologies/**`; migration receipts and retained feedback identity are not
  compatibility routes.

## Vote and Dissent

A non-voting chair convened a hierarchical, specialised council using Raft consensus.
Independent native-model priors came from OpenAI `gpt-5.6-terra` at high effort,
OpenAI `gpt-5.6-sol` at xhigh effort, and Anthropic `claude-fable-5` at maximum effort.
Bounded cross-examination used Fable at high and medium effort.

The final OpenAI ballot accepted the original core proposal three to zero. Its earlier
98/100 results and a scoped 100/100 ontology review remain historical evidence only.
For the integrated implementation, Anthropic Fable and Claude Sonnet scored 98/100,
the OpenAI Devil's Advocate scored 100/100, and the native Claude–Codex deliberation
accepted the transition; every review reported zero hard failures.

Held historical dissent: Fable would have ordered the PDTF schema before SPDTF because
implementation was the majority task. The 2026-08-23 operator decision resolves the
global order and keeps the PDTF schema as a nested third-party input.

## More Information

- [SPDTF information architecture](../spdtf-information-architecture.md)
- [Current site information architecture](../current-site-information-architecture.md)
- [ADR-0039 — linked data as the SPDTF foundation](./ADR-0039-linked-data-model-as-spdtf-foundation.md)
- [ADR-0063 — Domain-led bounded-context working groups](./ADR-0063-domain-led-bounded-context-working-groups.md)
- [ADR-0064 — Modelling website revamp](./ADR-0064-modelling-website-revamp-before-strategy-publication.md)
- [ADR-0066 — Property Pack seed scope](./ADR-0066-property-pack-451-seed-scope-and-greenfield-ontology.md)
- [ADR-0067 — First-principles ontology by bounded context](./ADR-0067-first-principles-property-pack-ontology-by-bounded-context.md)
- [ADR-0075 — Property Pack ontology as an accelerated SPDTF component](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md)
- [DBT — Smart Data 2035](https://www.gov.uk/government/publications/smart-data-strategy)
- [DBT — Smart Data multi-sector call for evidence](https://www.gov.uk/government/calls-for-evidence/smart-data-multi-sector-call-for-evidence)
- [MHCLG — Home Buying and Selling Reform Roadmap](https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap)

## Amendments

- **2026-08-23 — Semantic modelling becomes a peer global destination.** The global
  order is Programme, Governance, Semantic modelling, SPDTF Development, Working groups
  and Resources. Semantic-modelling reader pages move to `/semantic-modelling/**` as a
  clean route break with no old-route compatibility. The PDTF schema remains a nested
  third-party SPDTF input, and stable `/pdtf/**` identifiers remain unchanged.

- **2026-08-23 — PDTF schema is an SPDTF third-party input.** ADR-0077 removes the PDTF
  schema from the global destination set and hosts it beneath `/spdtf/inputs`. Route
  containment does not confer SPDTF authority, adoption or authorship.

- **2026-08-22 — Chair-authority terminology correction.** Maria Harris, OPDA Chair,
  clarified that the inherited version-numbered draft technical scheme was not created
  collaboratively and was not endorsed by OPDA. The site architecture therefore
  presents the existing **PDTF schema** and its separately identified
  **schema-derived ontology** as evidence and implementation inputs, and **SPDTF** as
  the first collaboratively authored scheme draft. The governing relationship is
  schema to scheme, not one numbered standard generation replacing another. Reader
  routes move to `/spdtf/inputs/pdtf-schema/**` and `/spdtf/**`; stable `/pdtf/**` RDF identifiers
  and factual historical provenance remain unchanged.
- **2026-08-22 — semantic-package contract remint.** The canonical workspace-contract
  identifier is now `https://opda.org.uk/spdtf/semantic-package/workspace-contract`,
  revision `2026-08-22`. It supersedes the intermediate `/spdtf-2/` identifier at its
  `1.0.0` state only because the public identifier embedded the withdrawn terminology;
  the old identifier survives as migration metadata and carries no SPDTF-generation
  meaning.
