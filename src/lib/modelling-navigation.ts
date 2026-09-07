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
    ...page('understand', 'Understand shared meaning'),
    children: [
      page('understand/shared-meaning', 'Why shared meaning matters'),
      page('understand/a-property-story', 'A property story'),
    ],
  },
  {
    ...page('explore', 'Explore the model'),
    children: [
      page('explore/things-and-identities', 'Things and identities'),
      page('explore/names-and-choices', 'Names, choices and classifications'),
      page('explore/contexts-and-connections', 'Contexts and connections'),
    ],
  },
  {
    ...page('contribute', 'Contribute your expertise'),
    children: [
      page('contribute/review-a-definition', 'Review a definition'),
      page('contribute/bring-evidence', 'Bring useful evidence'),
      page('contribute/what-happens-next', 'What happens next'),
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
  return { group, chapters, number: position + 1, next: chapters[position + 1] ?? null };
}
