import type { Item } from './site.ts';

const root = '/semantic-modelling';
const page = (path: string, title: string): Item => ({ url: `${root}/${path}`, title });

/** The reasoning spine: one order shared by the atlas and chapter navigation. */
export const ONTOLOGY_JUDGEMENT_CHAPTERS: Item[] = [
  page('method/foundational-analysis', 'Foundations and modelling judgement'),
  page('method/classes-and-relationships', 'Choose the right representation'),
  page('method/roles-and-phases', 'Identity through roles and change'),
  page('method/context-map-records', 'Connect meanings across contexts'),
  page('method/evidence-and-time', 'Evidence, claims and time'),
  page('method/source-to-model', 'From source evidence to model decisions'),
];

/** Focused authoring references complement, rather than duplicate, the reasoning spine. */
export const ONTOLOGY_REFERENCE_CHAPTERS: Item[] = [
  page('method/from-question-to-candidate', 'From question to candidate'),
  page('method/namespaces-and-identifiers', 'Namespaces and identifiers'),
  page('method/scope-and-package', 'Eight concerns, six connected outputs'),
  page('method/vocabularies-and-classification', 'Vocabularies and classification'),
  page('method/mapping-records', 'Qualified term mappings'),
  page('method/meaning-checks-and-delivery', 'Meaning, checks and delivery'),
  page('method/sensitivity-and-policy', 'Sensitivity and policy'),
  page('method/languages-and-profiles', 'Languages and profiles'),
  page('method/standards-and-decisions', 'Standards and decisions'),
];

/** One task-based chapter map for section navigation and search. */
export const MODELLING_JOURNEYS: Item[] = [
  {
    ...page('understand', "Understand shared meaning"),
    children: [
      page('understand/shared-meaning', "Why shared meaning matters"),
      page('understand/what-we-are-building', "What we are building"),
      page('understand/benefits-and-limits', "Benefits, limits and reasonable objections"),
      page('understand/a-property-story', "Harbour Court: follow a question through the model"),
      page('understand/how-the-work-is-done', "How the modelling work is done"),
    ],
  },
  {
    ...page('explore', "Explore the model"),
    children: [
      page('explore/things-and-identities', "Things, identities and relationships"),
      page('explore/people-roles-and-change', "People, roles and change"),
      page('explore/measurements-amounts-and-values', "Measurements, amounts and values"),
      page('explore/dates-periods-and-applicability', "Dates, periods and applicability"),
      page('explore/claims-evidence-and-uncertainty', "Claims, evidence and uncertainty"),
      page('explore/names-and-choices', "Names, choices and classification"),
      page('explore/contexts-and-connections', "Connect meanings across contexts"),
      page('explore/rules-and-exceptions', "Rules, requirements and exceptions"),
      page('explore/sensitivity-purpose-permissions', "Sensitivity, purpose and permissions"),
    ],
  },
  {
    ...page('contribute', "Review and contribute"),
    children: [
      page('contribute/frame-a-modelling-question', "Turn experience into a modelling question"),
      page('contribute/review-a-definition', "Review a definition"),
      page('contribute/review-diagrams-and-relationships', "Review a diagram and its relationships"),
      page('contribute/review-vocabularies-and-mappings', "Review choices and mappings"),
      page('contribute/review-rules-and-exceptions', "Test a rule with ordinary and difficult cases"),
      page('contribute/bring-evidence', "Bring evidence others can interpret"),
      page('contribute/read-and-compare-a-candidate', "Read a candidate and compare a change"),
      page('contribute/what-happens-next', "Follow feedback, disagreement and revision"),
    ],
  },
  {
    ...page('method', 'Ontology modelling'),
    children: [
      ...ONTOLOGY_JUDGEMENT_CHAPTERS,
      ...ONTOLOGY_REFERENCE_CHAPTERS,
    ],
  },
];

export const MODELLING_CHAPTERS = MODELLING_JOURNEYS.flatMap((group) => [group, ...(group.children ?? [])]);

export function getModellingChapter(pathname: string) {
  const path = pathname.replace(/\/+$/u, '');
  const group = MODELLING_JOURNEYS.find((item) => path === item.url || path.startsWith(`${item.url}/`));
  if (!group) return null;
  const chapters = [group, ...(group.children ?? [])];
  const position = chapters.findIndex((item) => item.url === path);
  if (position < 0) return null;
  return { group, chapters, number: position + 1, next: chapters[position + 1] ?? null };
}
