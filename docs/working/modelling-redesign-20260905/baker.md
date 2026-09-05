# Baker-perspective working position — 5 September 2026

This is a simulated published-methodology perspective, not consultation with Tom
Baker. The root integration owner convened the reduced design review using the
OPDA Linked Data Council methodology. This working record is append-only.

## Scope and reading

- Read the current main-worktree `AGENTS.md` and ODR-0001 Council methodology.
- Examined the flat semantic-modelling pages, especially the landing page,
  manifesto, participation and decision-basis pages, plus their section inventory.
- Examined ADR-0064 and the material initial sections of ADR-0067, and the legacy
  PDTF modelling-frameworks explainer as historical implementation evidence.
- Read the selected source-method ODR rules on the read-only remote source:
  ODR-0016, ODR-0023, ODR-0071b and ODR-0086. No remote edits or copying of
  source-project business examples into public content.
- Existing decision-basis trace pins source review to revision
  `67174057e6384b79d0b28b7736fe70a66e112895`. Source-register ODR numbers are not
  interchangeable with identically numbered OPDA ODRs.
- Verified current participation descriptions against the local member-guide pages
  for Teams/discussions and source material/SharePoint.
- Structured Ruflo memory search returned command-history fragments, not useful
  design precedent. Structured routing supplied a keyword fallback; it did not
  change the already selected native executor or model.

## Primary-source grounding

1. Karen Coyle and Tom Baker, *Guidelines for Dublin Core Application Profiles*,
   18 May 2009, sections 3–8. Verified authorship and text at
   <https://www.dublincore.org/specifications/dublin-core/profile-guidelines/>.
   Community requirements, domain models, term choice, usage and syntax are
   distinct design concerns. My task-led IA is an application of that distinction,
   not a claimed UI design prescribed by the authors.
2. Mikael Nilsson, Tom Baker and Pete Johnston, *The Singapore Framework for Dublin
   Core Application Profiles*, 14 January 2008, section 3.1. Verified authorship and
   text at <https://www.dublincore.org/specifications/dublin-core/singapore-framework/>.
   Local needs and interoperability must coexist; profile composition does not
   authorise changing the meaning of globally identified reused terms.
3. Thomas Baker et al., *Key choices in the design of Simple Knowledge Organization
   System (SKOS)*, Journal of Web Semantics 20 (2013), pp. 35–49.
   Verified author list, publication and abstract at
   <https://doi.org/10.1016/j.websem.2013.05.001>. The design separates lightweight
   knowledge organisation from stronger ontological commitments without making
   SKOS semantics disappear.
4. *SKOS Reference*, W3C Recommendation, 18 August 2009, sections 3.5.1, 5, 7,
   8.6.6 and 10.6.8, <https://www.w3.org/TR/skos-reference/>. Concept labels,
   notes, hierarchies and mappings have different functions. Exact-match
   transitivity and the distinction from identity must remain understandable.
5. *Best Practice Recipes for Publishing RDF Vocabularies*, W3C Working Group Note,
   28 August 2008, “Choosing a recipe”; Baker is a listed previous editor.
   <https://www.w3.org/TR/swbp-vocab-pub/#choosing>. Human-readable and
   machine-processable descriptions can serve compatible representations of
   identified resources. This does not claim OPDA implements every recipe.

## Initial ballot

| Question | Vote | Qualification |
|---|---|---|
| Q1 — Task/audience IA | ACCEPT | Nested task journeys, not two disconnected public/technical silos. |
| Q2 — Context-first manifesto | ACCEPT | Situated questions and accountable meaning-making, bounded by identity criteria and external-term semantics. |
| Q3 — Distinct visuals and optional technical depth | ACCEPT | Essential distinctions and limitations visible in the primary text; no decorative diagram quota. |
| Q4 — Doctrine/current-candidate distinction | ACCEPT | Individual rule/amendment traces and separate evidence for implementation and adoption. |

## Cross-talk and amendments

### Guarino challenge: one identity is not one umbrella property

The DA challenged my phrase “one identity remains visible”: a building, dwelling
and title require distinct identities before varying their descriptions. The DA
also warned against treating every address correction as proof of the same property.

My reply, sent directly to the DA:

> Baker accepts correction: 'one identity' meant same subject identity across its
> human/machine representations, not one umbrella Property instance for the
> scenario. I withdraw the ambiguous wording.

The implemented case distinguishes the building, two dwellings, address
description, title record, inspection and report versions. Subdivision explicitly
leaves the identity criterion unresolved. Formal meta-category names are optional;
the distinctions themselves are not hidden behind a disclosure.

### Gandon challenge: SKOS mappings are not harmless annotations

Gandon required that exactMatch transitivity and hierarchy consequences remain
explicit. I accepted, proposing a three-concept mapping-chain explanation and
separate ordinary-language/formal views. The technical implementation belongs to
the integration and technical-page owners, not these reader pages.

Gandon also required rule/amendment-specific source receipts and cautioned against
inventing mapping author fields or guessing SEMAPV IRIs. My reply accepted those
constraints. Administrative metadata for a documentation page is not an invented
author field in the selected mapping profile.

Gandon's follow-up required example.org identifiers and “not a current conformance
result” for a teaching demonstration. The reader pages implement these boundaries.

### DA review of amended direction

The DA subsequently reported Q1–Q4 ACCEPT for the amended direction, with
direction-level objections withdrawn but implementation conditions held until
pages exist. This is the DA's reported position, not my certification that every
integrated implementation condition has passed.

The DA also identified an integration concern: automatically constructing legacy
comment identities for newly nested paths can invent continuity. I relayed that
to the root owner; comment-identity logic is outside my ownership.

## Final Baker direction ballot

Q1 ACCEPT; Q2 ACCEPT; Q3 ACCEPT; Q4 ACCEPT, with the qualifications and accepted
amendments above. These are recommendations about the redesign, not ratification
of domain meaning, governance or an SPDTF release.

## Implementation slice

The integration owner approved four nested hubs: understand, explore, contribute
and method. Reader ownership is limited to:

- `src/pages/semantic-modelling/understand/index.astro`
- `src/pages/semantic-modelling/understand/shared-meaning.astro`
- `src/pages/semantic-modelling/understand/a-property-story.astro`
- `src/pages/semantic-modelling/contribute/index.astro`
- `src/pages/semantic-modelling/contribute/review-a-definition.astro`
- `src/pages/semantic-modelling/contribute/bring-evidence.astro`
- `src/pages/semantic-modelling/contribute/what-happens-next.astro`

All use the root-provided ModellingLayout contract. They use semantic figures,
lists, paired sections and native details; no inline CSS, SVG, scripts, submission
endpoints or shared-component edits. The root owner integrates branded visual
components and the missing shared wrapper.

The canonical fictional case is Harbour Court at 14 Orchard Road: building with
Flat 1 and Flat 2, separate title record/address descriptions, inspection on
12 August 2026, report v1 on 14 August and v2 on 20 August. Correction does not
create another inspection. No legal or customer-data conclusions are asserted.

Suggested reader migration: why-ontologies and benefits to shared-meaning;
reading-the-model to the property story with formal content routed to explore;
taking-part to contribute; questions to the understand hub's relevant answers
and deep-method destinations. The root owner owns exact route/fragment/comment
migration and preservation checks.

## Verification boundary

No browser automation, build, full test run, remote edit or publication was
performed in this reader slice. The integration owner requested only syntax and
diff checks here and owns the required integrated make test/build validation.

### Reader-slice checks

- Astro's installed `@astrojs/compiler-rs` transformed all seven owned pages with
  zero diagnostics, without resolving the root-owned missing layout or running a
  site build.
- All seven pages and this audit file are below the 500-line limit.
- Staged diff whitespace checks are required before the scoped reader commit.
