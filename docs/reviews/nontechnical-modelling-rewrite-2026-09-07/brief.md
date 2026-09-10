# Non-technical modelling rewrite — review brief

Status: local review and proposal. Website implementation and publication are outside this run.

Source baseline: `bd5f42af` in `/Users/henrik/source/opda`.
Review branch: `review/modelling-learning-rewrite`.
Ruflo swarm: `swarm-1788818991914-qyxuaj`.

## Original request

> Create a swarm with astra ultra and fable, and discuss how to rewrite this section with way more content, and way more breadth and depth, great infographics, illustrations, and diagrams. You can find experts in the linked data council ODR in semantic-modelling.

The section is the non-technical side of Modelling. The user explicitly requested this rerun after the earlier discussion's result became unclear.

## Fable task

Act as the independent editorial designer and devil's advocate in a real cross-model discussion with two Astra Ultra reviewers and the root synthesis owner. Review source files, not imagined screenshots. Do not edit any files or invoke a browser. Return a detailed proposal and critique in your response. A later turn will supply the Astra proposals for cross-critique.

Read the current pages under `src/pages/semantic-modelling/understand`, `explore` and `contribute`, their landing page, `src/lib/modelling-navigation.ts`, `src/layouts/ModellingLayout.astro`, relevant modelling components/styles, and `DESIGN.md`. Read the dated clarifications in ADR-0063, ADR-0064, ADR-0065 and ADR-0067. The local council roster is `docs/ontology/odr/ODR-0001-linked-data-council-methodology.md`; use its named expert perspectives selectively, clearly as simulated analytical lenses, never real expert participation or endorsement.

The earlier, narrower proposal is `/private/tmp/opda-learning-enrichment.2IM5TG/docs/reviews/modelling-learning-enrichment-2026-09-07.md`; portions were implemented in `020d8d4d` and `2dce5dbf`. The later ontology rewrite is already implemented. This review must propose the much more extensive non-technical counterpart, not simply repeat those additions.

## Fixed scope

- Primary readers are property/domain professionals who contribute evidence and judgement without ontology syntax. Other readers need conceptual literacy before optionally entering Ontology modelling.
- Explain what semantic modelling/ontologies are, why this work matters, its benefits and limitations, the domain-led method, and how ordinary website readers can participate.
- Explain existing context boundaries and their use. They are already established. Professions, working groups, systems and semantic contexts must not be equated.
- We develop a specification. JSON-LD is an artefact generated from the ontology and needs only brief mention. No payload-design curriculum or application-operations course.
- SPDTF Trust is broader programme work. Only relevant domain distinctions and annotations belong here; model-review governance is a separate matter.
- Do not caricature every other ontology method as top-down. Examples must preserve distinctions without inventing adopted facts, professional rules, endorsement or product capabilities.
- Rich content should include worked examples, hard cases, comparisons, objections, practice with visible reasoned answers, and transfer across professions.
- Prior preferences: authored text measure 1024px and left-aligned blocks; paragraphs justified; diagrams/tables can use more width. No hidden core content in accordions, duplicate bottom navigation or decorative card walls.
- Use the current subject-led illustration family with a purpose-specific technique and unique composition for every placement; never reuse an image. Keep the shared OPDA palette and paired light/dark treatment. Exact semantic relationships belong in accessible labelled diagrams with useful text equivalents and mobile/print treatment.

## Questions to resolve

1. What major learning needs and content are still missing from the current pages?
2. What extensive but navigable chapter structure should replace the present arrangement? Compare keeping three reader gateways with four gateways.
3. What should readers be able to do, and what examples/practice demonstrate that learning?
4. Which diagrams, infographics and illustrations are worth creating, and what does each teach?
5. How should the design differ from the technical reference while sharing the site's essential accessibility, typography and navigation contracts?
6. What should be implemented first, what risks need testing, and what earlier proposal items must not be lost?

Prior surviving ideas to challenge: Harbour Court as a continuing story with other cases for transfer; a six-profession overview framed as questions; specimens of six modelling outputs; four gateways for findability; a five-move orientation; fewer repetitive disclaimers. They are hypotheses, not decisions.

Return concrete recommendations with source paths, a page inventory, two sample page compositions, a prioritised visual inventory, and held objections with withdrawal conditions. Prefer 2,500–3,500 useful words. Do not invent numerical learning gains or council votes. Native provider execution only; never use OpenRouter.
