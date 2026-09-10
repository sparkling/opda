import type { Group } from './site.ts';
import { marketingPacks } from '../data/marketing/packs.mjs';
import { marketingTasks } from '../data/marketing/tasks.mjs';

const packItems = marketingPacks.map(({ id, label }) => ({
  url: `/marketing/packs/${id}`,
  title: label,
}));

const groups: Array<Group & { url: string }> = [
  { heading: 'Overview', url: '/marketing', items: [] },
  ...marketingTasks.map(({ id, title }) => ({
    heading: title,
    url: `/marketing/${id}`,
    items: id === 'share-with-members' ? packItems : [],
  })),
];

/** Task-first local navigation for approved recruitment and promotion material. */
export const MARKETING_NAVIGATION_SECTION = {
  key: 'marketing',
  title: 'Marketing',
  summary: 'Approved promotion and recruitment materials for members, partners and prospective contributors.',
  groups,
};
