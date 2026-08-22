# OPDA linked-data strategy — 10-minute slide content

Audience: mixed senior decision-makers, data leads, and technical leads across OPDA
membership. Assume limited prior knowledge of linked data. Lead with benefits, not
semantic-web terminology.

## Slide 1 — From schema to scheme

- The existing PDTF schema is a JSON Schema package with a dictionary, glossary,
  overlays and implementation material.
- SPDTF is the first scheme draft being authored collaboratively across OPDA's
  stakeholders; it is not a numbered successor to an endorsed earlier scheme.
- A separate ontology derived from the PDTF schema provides technical evidence that the
  SPDTF working groups can adopt, revise or reject.
- Speaker note: open with the business outcome, not the technology.

## Slide 2 — Why change what we have today

- Today's JSON Schema is strong at describing structure, but weak at expressing meaning.
- Different firms still have to interpret the same concepts differently, then map them
  by hand.
- That creates integration cost, ambiguity, duplication, weaker provenance, and more
  room for error and fraud.
- Speaker note: the problem is not "schema bad." The problem is "shape alone is not
  enough for an industry standard."

## Slide 3 — What linked data means in plain English

- Linked data gives every important thing a clear identity, a shared meaning, and
  explicit relationships.
- It lets systems understand not just that a field exists, but what it means, how it
  relates, and what rules apply.
- In simple terms: one shared business meaning that people, software, and AI can all
  work from.
- Speaker note: avoid RDF/OWL jargon here unless asked.

## Slide 4 — Why this matters to OPDA members

- Lenders and banks get stronger trust, provenance, governance, and fraud controls.
- Conveyancers and agents get clearer forms, less re-keying, and fewer conflicting
  interpretations.
- Proptech firms get cleaner interoperability, faster API development, and less bespoke
  mapping.
- Government and public bodies get better reuse, clearer semantics, and easier policy
  alignment.
- Speaker note: this is the "why each audience should care" slide.

## Slide 5 — What we are building

- A shared, machine-readable foundation for property data that defines key things,
  relationships, evidence, and rules consistently.
- A governed model that can express identity, provenance, privacy, roles, and
  validation in one place.
- A stronger basis for more consistent standards, forms, APIs, and AI use across the
  market.
- Speaker note: this slide should feel directional and tangible, without sounding like
  a finished product demo.

## Slide 6 — This is proven in serious sectors

- Finance already does this with FIBO: a shared semantic model for complex financial
  concepts and interoperability.
- The EU uses linked-data approaches through assets such as DCAT-AP and Core
  Vocabularies to support semantic interoperability across borders.
- UK public-sector examples such as legislation.gov.uk and HM Land Registry show that
  authoritative linked public data is practical at national scale.
- Speaker note: the message is "this is established practice in high-trust,
  high-complexity environments."

## Slide 7 — Why it also matters for AI

- AI is more useful when it works against governed meaning, not just text and field
  names.
- Linked data gives AI grounding, provenance, clear entities, and machine-readable
  rules.
- That means better retrieval, safer automation, more explainable outputs, and less
  hallucinated interpretation.
- Speaker note: position linked data as what makes AI operationally trustworthy.

## Slide 8 — The strategic direction

- The schema-derived ontology should be evaluated as one evidence source for SPDTF
  development, with adoption decisions made through the working groups.
- SHACL should be the machine-checkable conformance contract.
- From that model, OPDA can progressively generate downstream artefacts such as
  schemas, APIs, documentation, and other implementation assets.
- Speaker note: this is the core decision of ADR-0039.

## Slide 9 — What this means for members

- One clearer shared meaning for property data across lenders, agents, conveyancers,
  proptechs, and public bodies.
- Less bespoke interpretation and remapping when organisations exchange or consume the
  same data.
- Stronger trust through explicit provenance, governance, and machine-checkable rules.
- Speaker note: bring the benefits back to the room here.

## Slide 10 — The takeaway

- This is a progression from the existing PDTF schema to the collaboratively authored
  SPDTF scheme.
- The value is not "more technology" — it is clearer meaning, stronger interoperability,
  and better foundations for automation and AI.
- Other complex sectors already use this kind of semantic foundation; OPDA can apply the
  same discipline to property data.
- Speaker note: close with the strategic takeaway, not a request for approval.

## References

- Direction-setting ADR: `docs/adr/ADR-0039-linked-data-model-as-spdtf-foundation.md`
- Gamma deck source: `docs/linked-data-initiative/_gamma-deck.md`
