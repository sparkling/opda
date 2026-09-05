import type { Item } from './site.ts';

const root = '/semantic-modelling';
const page = (path: string, title: string): Item => ({ url: `${root}/${path}`, title });

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
    ...page('method', 'Apply the method'),
    children: [
      page('method/from-question-to-candidate', 'From question to candidate'),
      page('method/scope-and-package', 'Eight concerns, six connected outputs'),
      page('method/classes-and-relationships', 'Classes and relationships'),
      page('method/roles-and-phases', 'Roles and phases'),
      page('method/context-map-records', 'Strategic context maps'),
      page('method/mapping-records', 'Qualified term mappings'),
      page('method/meaning-checks-and-delivery', 'Meaning, checks and delivery'),
      page('method/evidence-and-time', 'Evidence and time'),
      page('method/sensitivity-and-policy', 'Sensitivity and policy'),
      page('method/languages-and-profiles', 'Languages and profiles'),
      page('method/standards-and-decisions', 'Standards and decisions'),
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
