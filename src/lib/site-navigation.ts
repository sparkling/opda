/**
 * Reader-facing section navigation for the six-destination information
 * architecture. Stable legacy routes remain defined in site.ts; this module
 * composes them by current task and authority without moving those routes.
 */
import type { Group, Item, Section } from './site.ts';
import { SECTIONS, normalizeUrl } from './site.ts';
import { GLOBAL_DESTINATIONS, getActiveDestination } from './site-ia.mjs';
import { WORKING_GROUPS } from '../components/ia/working-groups.ts';

type DestinationKey = 'programme' | 'spdtf-2' | 'working-groups' | 'pdtf-1' | 'governance' | 'resources';

export interface NavigationMatch {
  section: NavigationSection;
  group: NavigationGroup;
  trail: Item[];
}

export interface NavigationGroup extends Group {
  url: string;
}

export interface NavigationSection extends Omit<Section, 'groups'> {
  groups: NavigationGroup[];
}

function ownedItem(item: Item, owner: DestinationKey): Item[] {
  const children = item.children?.flatMap((child) => ownedItem(child, owner)) ?? [];
  if (getActiveDestination(item.url) !== owner) return children;
  return [{ ...item, children: children.length ? children : undefined }];
}

function ownedSectionItems(sectionKey: string, owner: DestinationKey): Item[] {
  const section = SECTIONS[sectionKey];
  if (!section) throw new Error(`Unknown legacy section: ${sectionKey}`);
  const seen = new Set<string>();
  return section.groups
    .flatMap((group) => group.items.flatMap((item) => ownedItem(item, owner)))
    .filter((item) => {
      const url = normalizeUrl(item.url);
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

function ownedGroupItems(sectionKey: string, heading: string, owner: DestinationKey): Item[] {
  const group = SECTIONS[sectionKey]?.groups.find((candidate) => candidate.heading === heading);
  if (!group) throw new Error(`Unknown navigation group: ${sectionKey}/${heading}`);
  return group.items.flatMap((item) => ownedItem(item, owner));
}

function category(heading: string, url: string, items: Item[] = []): NavigationGroup {
  const landing = normalizeUrl(url);
  const children = items.flatMap((item) => (
    normalizeUrl(item.url) === landing ? item.children ?? [] : [item]
  ));
  return { heading, url, items: children };
}

const ontologyJourney: Item = {
  url: '/spdtf-2/ontologies',
  title: 'Semantic modelling',
  children: [
    {
      url: '/spdtf-2/ontologies/why-ontologies',
      title: 'Understand ontologies',
      children: [
        { url: '/spdtf-2/ontologies/reading-the-model', title: 'How to read the model' },
      ],
    },
    {
      url: '/spdtf-2/ontologies/modelling-method',
      title: 'How we model SPDTF 2.0',
      children: [
        { url: '/spdtf-2/ontologies/semantic-package', title: 'Six-part semantic package' },
        { url: '/spdtf-2/ontologies/bounded-contexts', title: 'Contexts and common boundary' },
        { url: '/spdtf-2/ontologies/modelling-rules', title: 'Modelling rules and lenses' },
        { url: '/spdtf-2/ontologies/coverage', title: 'Coverage checklist' },
        { url: '/spdtf-2/ontologies/standards', title: 'Standards profile' },
        { url: '/spdtf-2/ontologies/evidence-and-mappings', title: 'Evidence and mappings' },
        { url: '/spdtf-2/ontologies/validation', title: 'Validation and projections' },
      ],
    },
  ],
};

const propertyPackBase = '/spdtf-2/property-pack';
const propertyPackJourney: Item = {
  url: propertyPackBase,
  title: 'Property Pack ontology',
  children: [
    { url: `${propertyPackBase}/definition-and-scope`, title: 'Definition and 451-item scope' },
    { url: `${propertyPackBase}/pdtf-1-lineage`, title: 'PDTF 1.0 lineage' },
    {
      url: `${propertyPackBase}/model`,
      title: 'Current ontology model',
      children: [
        {
          url: `${propertyPackBase}/contexts`,
          title: 'Semantic contexts',
          children: [
            { url: `${propertyPackBase}/contexts/common`, title: 'Common boundary' },
            { url: `${propertyPackBase}/contexts/conveyancing`, title: 'Conveyancing' },
            { url: `${propertyPackBase}/contexts/estate-agency`, title: 'Estate agency' },
            { url: `${propertyPackBase}/contexts/finance-and-banking`, title: 'Finance and banking' },
            { url: `${propertyPackBase}/contexts/property-data-services`, title: 'Property data services' },
            { url: `${propertyPackBase}/contexts/property-technology`, title: 'Property technology' },
            { url: `${propertyPackBase}/contexts/surveying-and-valuation`, title: 'Surveying and valuation' },
            { url: `${propertyPackBase}/contexts/dbt-smart-data`, title: 'DBT Smart Data candidate context' },
          ],
        },
        { url: `${propertyPackBase}/resources`, title: 'Ontology resources' },
        { url: `${propertyPackBase}/relationships`, title: 'Relationships' },
        { url: `${propertyPackBase}/data-dictionary`, title: 'Data dictionary' },
        { url: `${propertyPackBase}/vocabularies`, title: 'Controlled vocabularies' },
        { url: `${propertyPackBase}/shapes`, title: 'SHACL shapes' },
      ],
    },
    {
      url: `${propertyPackBase}/coverage`,
      title: 'Candidate source coverage',
      children: [
        { url: `${propertyPackBase}/standards`, title: 'Standards profile' },
        { url: `${propertyPackBase}/validation`, title: 'Validation evidence' },
        { url: `${propertyPackBase}/artefacts`, title: 'Generated artefacts' },
      ],
    },
    { url: `${propertyPackBase}/technical-working-group-determination`, title: 'Technical Working Group determination' },
    { url: `${propertyPackBase}/review-and-releases`, title: 'Later review and releases' },
  ],
};

const workingGroupItems: Item[] = WORKING_GROUPS.map((group) => {
  const url = `/spdtf-2/working-groups/${group.slug}`;
  return {
    url,
    title: group.name,
    children: [
      { url: `${url}/evidence`, title: 'Evidence' },
      { url: `${url}/questions`, title: 'Questions' },
      { url: `${url}/review`, title: 'Review' },
    ],
  };
});

function insertAfter(items: Item[], afterUrl: string, item: Item): Item[] {
  const index = items.findIndex((candidate) => normalizeUrl(candidate.url) === afterUrl);
  if (index < 0) throw new Error(`Cannot position navigation item after ${afterUrl}`);
  return [...items.slice(0, index + 1), item, ...items.slice(index + 1)];
}

function sectionJourney(
  sectionKey: string,
  owner: DestinationKey,
  title: string,
  options: { exclude?: string[]; append?: Item[] } = {},
): Item {
  const url = `/${sectionKey}`;
  const excluded = new Set((options.exclude ?? []).map(normalizeUrl));
  const children = ownedSectionItems(sectionKey, owner)
    .filter((item) => normalizeUrl(item.url) !== url && !excluded.has(normalizeUrl(item.url)));
  return {
    url,
    title,
    children: [...children, ...(options.append ?? [])],
  };
}

const pdtfSchemaJourney = sectionJourney('schema', 'pdtf-1', 'JSON Schemas and overlays', {
  append: [{ url: '/modelling/overlays', title: 'Schema overlays' }],
});
const pdtfImplementationJourney = sectionJourney('implementation', 'pdtf-1', 'Implementation guidance');
const pdtfAdoptionJourney = sectionJourney('adoption', 'pdtf-1', 'Adoption evidence');
const pdtfModellingJourney = sectionJourney('modelling', 'pdtf-1', 'How it was derived', {
  exclude: ['/modelling/overlays', '/modelling/data-dictionary', '/modelling/business-glossary'],
});
const pdtfModelJourney = sectionJourney('model', 'pdtf-1', 'Model views');

const pdtfOntologyItems = insertAfter(
  ownedSectionItems('ontology', 'pdtf-1').filter(({ url }) => normalizeUrl(url) !== '/ontology'),
  '/ontology/properties',
  { url: '/ontology/datatypes', title: 'Datatypes' },
);
const pdtfOntologyChildren = insertAfter(
  pdtfOntologyItems,
  '/ontology/known-issues',
  { url: '/ontology/namespaces', title: 'Namespaces' },
);
const pdtfOntologyJourney: Item = {
  url: '/ontology',
  title: 'Ontology reference',
  children: pdtfOntologyChildren,
};

const pdtfMappingJourney = sectionJourney('mapping', 'pdtf-1', 'Schema-to-ontology verification');

const navigationSections: Record<DestinationKey, NavigationSection> = {
  programme: {
    key: 'programme',
    title: 'Programme',
    summary: 'Programme purpose, continuation, policy context and direction.',
    groups: [
      category('Overview', '/programme'),
      category('Strategy', '/strategy', ownedSectionItems('strategy', 'programme')),
      category('DBT Smart Data', '/dbt-smart-data', ownedSectionItems('dbt-smart-data', 'programme')),
      category('Programme activity', '/engagement/working-groups', ownedSectionItems('engagement', 'programme')),
    ],
  },
  'spdtf-2': {
    key: 'spdtf-2',
    title: 'SPDTF 2.0 Development',
    summary: 'Current evidence-up modelling, ontology method, the Property Pack component and wider candidates.',
    groups: [
      category('Overview', '/spdtf-2', [
        { url: '/spdtf-2/candidates', title: 'Candidate register' },
        { url: '/spdtf-2/questions', title: 'Open questions and changes' },
        { url: '/spdtf-2/outputs', title: 'Outputs and validation' },
      ]),
      category('Property Pack ontology', propertyPackJourney.url, propertyPackJourney.children),
      category(ontologyJourney.title, ontologyJourney.url, ontologyJourney.children),
    ],
  },
  'working-groups': {
    key: 'working-groups',
    title: 'Working groups',
    summary: 'The canonical SPDTF 2.0 participant workspaces and review routes.',
    groups: [
      category('Group workspaces', '/spdtf-2/working-groups', workingGroupItems),
    ],
  },
  'pdtf-1': {
    key: 'pdtf-1',
    title: 'PDTF 1.0',
    summary: 'The published schema implementation and status-labelled derived artefacts.',
    groups: [
      category('Overview', '/pdtf-1'),
      category('Original standard', '/pdtf-1/original-standard', [
        pdtfSchemaJourney,
        { url: '/modelling/data-dictionary', title: 'Data dictionary' },
        { url: '/modelling/business-glossary', title: 'Business glossary' },
        pdtfImplementationJourney,
        pdtfAdoptionJourney,
      ]),
      category('Extracted ontology', '/ontology', [
        pdtfModellingJourney,
        pdtfModelJourney,
        pdtfOntologyJourney,
        pdtfMappingJourney,
      ]),
    ],
  },
  governance: {
    key: 'governance',
    title: 'Governance',
    summary: 'Decision rights, standards lifecycle, status and recorded decisions.',
    groups: [
      category('Governance framework', '/governance', ownedSectionItems('governance', 'governance')),
      category('Architecture decisions', '/modelling/adr', ownedGroupItems('modelling', 'ADR corpus', 'governance')),
      category('Ontology decisions', '/modelling/odr', ownedGroupItems('modelling', 'ODR corpus', 'governance')),
      category('Programme decisions', '/engagement/meetings-decisions', ownedSectionItems('engagement', 'governance')),
    ],
  },
  resources: {
    key: 'resources',
    title: 'Resources',
    summary: 'Source records, programme evidence, terminology and reader utilities.',
    groups: [
      category('Overview', '/resources'),
      category('Library', '/library', ownedSectionItems('library', 'resources')),
      category('Engagement records', '/engagement', ownedSectionItems('engagement', 'resources')),
      category('Find and inspect', '/glossary'),
    ],
  },
};

export const SECTION_NAVIGATION = Object.freeze(navigationSections);

const STANDALONE_SURFACES = [
  /^\/$/u,
  /^\/(?:home|search|resource|design-system|404)$/u,
  /^\/presentation(?:s)?(?:\/|$)/u,
  /^\/working-groups\/join(?:\/|$)/u,
];

const ACTIVE_ROUTE_ALIASES = [
  { pattern: /^\/ontology\/category\//u, target: '/ontology/category' },
  { pattern: /^\/ontology\/context\//u, target: '/ontology' },
  { pattern: /^\/ontology\/exemplar\//u, target: '/ontology/exemplars' },
  { pattern: /^\/ontology\/profile\//u, target: '/ontology/profiles' },
  { pattern: /^\/mapping\/triplesmaps\//u, target: '/mapping/triplesmaps' },
  { pattern: /^\/pdtf\//u, target: '/ontology/glossary' },
];

export function getNavigationSection(path: string): NavigationSection | null {
  const normalized = normalizeUrl(path);
  if (STANDALONE_SURFACES.some((pattern) => pattern.test(normalized))) return null;
  const key = getActiveDestination(path) as DestinationKey | null;
  return key ? SECTION_NAVIGATION[key] ?? null : null;
}

function findTrail(items: Item[], path: string, trail: Item[] = []): Item[] | null {
  let prefixMatch: Item[] | null = null;
  for (const item of items) {
    const nextTrail = [...trail, item];
    const itemPath = normalizeUrl(item.url);
    if (itemPath === path) return nextTrail;
    const childMatch = item.children ? findTrail(item.children, path, nextTrail) : null;
    if (childMatch) return childMatch;
    if (path.startsWith(`${itemPath}/`)
      && (!prefixMatch || itemPath.length > normalizeUrl(prefixMatch.at(-1)?.url ?? '/').length)) {
      prefixMatch = nextTrail;
    }
  }
  return prefixMatch;
}

export function findNavigationPage(path: string): NavigationMatch | null {
  const section = getNavigationSection(path);
  if (!section) return null;
  const normalized = normalizeUrl(path);
  const matchPath = ACTIVE_ROUTE_ALIASES.find(({ pattern }) => pattern.test(normalized))?.target ?? normalized;
  let best: NavigationMatch | null = null;
  for (const group of section.groups) {
    const groupPath = normalizeUrl(group.url);
    if (groupPath === matchPath) return { section, group, trail: [] };
    const trail = findTrail(group.items, matchPath);
    const match = { section, group, trail: trail ?? [] };
    const terminal = normalizeUrl(trail?.at(-1)?.url ?? group.url);
    if (!trail && !matchPath.startsWith(`${groupPath}/`)) continue;
    if (terminal === matchPath) return match;
    const bestTerminal = normalizeUrl(best?.trail.at(-1)?.url ?? best?.group.url ?? '/');
    if (!best || terminal.length > bestTerminal.length) best = match;
  }
  return best;
}

function flattenItems(items: Item[]): Item[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenItems(item.children) : [])]);
}

export function getNavigationPrevNext(path: string): { prev?: Item; next?: Item } {
  const section = getNavigationSection(path);
  if (!section) return {};
  const seen = new Set<string>();
  const items = section.groups.flatMap((group) => [
    { url: group.url, title: group.heading },
    ...flattenItems(group.items),
  ]).filter((item) => {
    const url = normalizeUrl(item.url);
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  const normalized = normalizeUrl(path);
  const index = items.findIndex((item) => normalizeUrl(item.url) === normalized);
  if (index < 0) return {};
  return {
    prev: index > 0 ? items[index - 1] : undefined,
    next: index < items.length - 1 ? items[index + 1] : undefined,
  };
}

export function validateSectionNavigation(): true {
  const keys = Object.keys(SECTION_NAVIGATION);
  const expected = GLOBAL_DESTINATIONS.map(({ key }) => key);
  if (JSON.stringify(keys) !== JSON.stringify(expected)) throw new Error('Section navigation must follow the six global destinations');
  for (const destination of GLOBAL_DESTINATIONS) {
    const section = SECTION_NAVIGATION[destination.key as DestinationKey];
    const urls = section.groups.flatMap((group) => [
      normalizeUrl(group.url),
      ...flattenItems(group.items).map((item) => normalizeUrl(item.url)),
    ]);
    if (!urls.includes(destination.url)) throw new Error(`${destination.title} has no section landing link`);
    if (new Set(urls).size !== urls.length) throw new Error(`${destination.title} has duplicate section links`);
    for (const url of urls) {
      if (getActiveDestination(url) !== destination.key) throw new Error(`${url} is filed under the wrong section`);
    }
  }
  return true;
}
