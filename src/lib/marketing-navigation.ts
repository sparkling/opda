import type { Group } from './site.ts';
import { marketingPacks } from '../data/marketing/packs.mjs';
import { marketingTasks } from '../data/marketing/tasks.mjs';
import { marketingBroadcasters } from '../data/marketing/broadcasters.mjs';
import { operationalEmails } from '../data/marketing/operational-emails.mjs';

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
  { heading: 'By audience', url: '/marketing/packs', items: packItems },
  { heading: 'By broadcaster', url: '/marketing/broadcasters', items: marketingBroadcasters.map(({ id, title }) => ({ url: `/marketing/broadcasters/${id}`, title })) },
  { heading: 'Service emails', url: '/marketing/operational-emails', items: operationalEmails.map(({ url, title }) => ({ url, title })) },
];

/** One registry separates what to do, who to reach and who is sharing. */
export const MARKETING_NAVIGATION_SECTION = {
  key: 'marketing',
  title: 'Marketing',
  summary: 'Approved promotion and recruitment materials for members, partners and prospective contributors.',
  groups,
};
