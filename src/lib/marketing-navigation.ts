import type { Group } from './site.ts';
import { marketingPacks } from '../data/marketing/packs.mjs';
import { marketingTasks } from '../data/marketing/tasks.mjs';

const packItems = marketingPacks.map(({ id, label }) => ({
  url: `/marketing/packs/${id}`,
  title: label,
}));

const taskItems = marketingTasks.map(({ id, title }) => ({
  url: `/marketing/${id}`,
  title,
}));

const groups: Array<Group & { url: string }> = [
  { heading: 'By task', url: '/marketing', items: taskItems },
  { heading: 'Campaign packs by audience', url: '/marketing/packs', items: packItems },
];

/** Local navigation separates what someone wants to do from who they need to reach. */
export const MARKETING_NAVIGATION_SECTION = {
  key: 'marketing',
  title: 'Marketing',
  summary: 'Approved promotion and recruitment materials for members, partners and prospective contributors.',
  groups,
};
