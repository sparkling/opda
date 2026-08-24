---
status: accepted
date: 2026-08-23
updated: 2026-08-24
tags: [website, information-architecture, pdtf-schema, spdtf, third-party-input, routing, preservation]
supersedes: [ADR-0076]
amends: [ADR-0002, ADR-0039, ADR-0041, ADR-0042, ADR-0044, ADR-0059, ADR-0060, ADR-0063, ADR-0074, ADR-0075]
depends-on: [ADR-0006, ADR-0074, ADR-0075, ADR-0076]
implements: [src/lib/pdtf1-routes.mjs, src/lib/site-navigation.ts, src/lib/site-route-migrations.mjs]
---

# Place the PDTF schema beneath SPDTF as a third-party input

> Update 2026-08-23 — global-navigation correction: the site has six destinations in
> this order: Programme, Governance, Semantic modelling, SPDTF Development, Working
> groups and Resources. This changes the destination count, order and navigation label
> only. Semantic modelling is the canonical peer family at `/semantic-modelling/**`;
> it does not appear beneath SPDTF Development, and `/spdtf/ontologies/**` is retired
> without a redirect, rewrite alias or duplicate page. The PDTF schema remains a
> source-specific third-party input beneath
> `/spdtf/inputs/pdtf-schema/**`, and stable `/pdtf/**` RDF identifiers remain unchanged.

## Context and Problem Statement

ADR-0076 gave PDTF schema documentation a separate top-level home. That placement makes
the source look like a peer programme destination and can imply that its material was
authored, adopted or governed through SPDTF. It was not. The PDTF schema is an existing
third-party technical input used for evidence, compatibility and migration; SPDTF is the
collaborative scheme draft that evaluates inputs through its own working-group process.

The separate schema-derived ontology remains an OPDA-produced technical derivation of
that source. It is non-normative evidence, not third-party-authored, not SPDTF, and not
evidence of working-group consensus. Property Pack remains an SPDTF candidate component,
not an external input.

The operator has again authorised a clean route break: former reader routes may disappear,
without redirects, once their content, fragments, assets and feedback identities have been
verified at their replacement routes. The stable `/pdtf/**` RDF identifier namespace is
outside this editorial change.

## Considered Options

1. Keep the PDTF schema as a peer global destination. Rejected: that positioning implies a
   programme relationship and authority that the source does not have.
2. Keep its current root and add a cross-link from SPDTF. Rejected: a cross-link does not
   express the input relationship in the information architecture.
3. Put all PDTF material under a generic resources library. Rejected: readers need to see how
   this specific input informs SPDTF, while still keeping its authority separate.

## Decision Outcome

The site has six global destinations, in this order: Programme, Governance, Semantic
modelling, SPDTF Development, Working groups and Resources. The PDTF schema remains
nested inside SPDTF Development as a source-specific, third-party input:

Semantic modelling owns the separate `/semantic-modelling/**` reader hierarchy. SPDTF
Development has no Semantic modelling child branch, and `/spdtf/ontologies/**` is not
emitted, redirected, rewritten, aliased or duplicated.

```text
/spdtf
└── /inputs
    └── /pdtf-schema
        ├── /schema-and-supporting-material/**
        └── /schema-derived-ontology/**
```

`/spdtf/inputs` is a substantive input-policy landing, not a redirect or empty folder. It
explains that inclusion means relevance to SPDTF work, not adoption, endorsement,
authorship, control or semantic authority. It distinguishes three separate surfaces:

- Resources records preserve raw, attributed source material.
- Working-group evidence intake records participant submissions and access controls.
- SPDTF inputs curate sources that are relevant to modelling, compatibility or review and
  record their source-specific disposition.

The PDTF schema landing must state: it is a third-party technical input retained for
evidence, compatibility, migration and implementation; it was not produced through the
SPDTF working-group process, is not an OPDA-endorsed scheme and does not determine SPDTF
meaning. The schema-derived ontology landing must state its distinct draft, derived status.

`/pdtf-schema/**` is retired with no redirect, rewrite alias or duplicate canonical page.
`/spdtf/third-party-inputs/**` is not a public route. `/pdtf/**` HTML and Turtle
representations remain exact stable identifiers, including the distinct `LeaseTerm` and
`leaseTerm` resources.

### Route and information-preservation contract

Before moving any page, freeze schema-v8 as the immediate source manifest. Schema-v9 must
carry a dedicated, source-pinned PDTF-schema-input receipt rather than rewriting older
PDTF or schema-to-scheme receipts as though their intermediate destinations never existed.
The receipt must prove all of the following:

- every `/pdtf-schema/**` reader route and physical output maps once to
  `/spdtf/inputs/pdtf-schema/**`, preserving the exact suffix and flat `*.html` filenames;
- no old reader route is emitted and no redirect is created;
- every `/pdtf/**` route and file remains exact and is never classified as a move;
- information blocks, authored anchors and generated-family inventories are retained or
  carry an explicit, hash-bound replacement receipt;
- renamed navigation-shell fragments have a separate one-to-one fragment receipt; and
- every Artalk key composes through the intermediate PDTF-schema route before the generic
  SPDTF route resolver, so existing discussion threads are not reminted.

The navigation owner of the new subtree is the SPDTF Development destination, while its
content-owner/status metadata remains third-party PDTF-schema input. A route prefix must
not inherit working-group authority. Tool and artefact families keep their individual
provenance and status.

## Consequences

- Good: the information architecture expresses the schema-to-scheme relationship without
  presenting the schema as a peer or predecessor scheme.
- Good: readers can discover source inputs where SPDTF explains how they are used.
- Bad: old `/pdtf-schema/**` links intentionally return not found and must be rediscovered
  through search or the SPDTF inputs landing.
- Neutral: source containment is navigational only; it does not settle any modelling or
  standards decision.

## Confirmation

This decision authorises local implementation and validation only. It does not authorise
publication, deployment, source adoption or a working-group determination. It is complete
only when the schema-v9 route receipt, full build, link/crawl, strict preservation and
relevant navigation/authority checks pass on the final case-sensitive production build.

## More Information

- [ADR-0006 — Ontology namespace](./ADR-0006-w3id-opda-ontology-namespace.md)
- [ADR-0074 — Site information architecture](./ADR-0074-organise-site-around-spdtf-and-pdtf-schema.md)
- [ADR-0075 — Property Pack component](./ADR-0075-property-pack-ontology-as-accelerated-spdtf-component.md)
- [ADR-0076 — Previous PDTF-schema route decision](./ADR-0076-consolidate-pdtf-schema-documentation-under-hierarchy-reflecting-routes.md)
- [SPDTF information architecture](../spdtf-information-architecture.md)

## Amendments

- **2026-08-24 — Case-independent Lease Term representation routes.** The exact
  `LeaseTerm` and `leaseTerm` identifiers remain distinguishable in the source model.
  Their generated HTML/Turtle documents now use lowercase, type-scoped paths and the
  former case-only paths are retired without redirects or aliases. This removes the
  release-filesystem dependency while preserving the source identifiers displayed in
  each representation.
