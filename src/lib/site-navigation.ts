/**
 * Reader-facing section navigation for the six-destination information
 * architecture. Content-source groupings remain defined in site.ts; this
 * module composes their canonical routes by current task and authority.
 */
import type { Group, Item, Section } from './site.ts';
import { SECTIONS, normalizeUrl } from './site.ts';
import { GLOBAL_DESTINATIONS, getActiveDestination } from './site-ia.mjs';
import { isRetiredPdtf1DocumentationRoute, PDTF1_ROUTES } from './pdtf1-routes.mjs';
import {
  GOVERNANCE_FRAMEWORK_ITEMS,
  WORKING_GROUP_MEMBER_GUIDE_ITEMS,
} from './section-navigation-journeys.ts';
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

function sectionJourney(
  sectionKey: string,
  owner: DestinationKey,
  title: string,
  options: { url?: string; exclude?: string[]; append?: Item[] } = {},
): Item {
  const url = options.url ?? `/${sectionKey}`;
  const excluded = new Set((options.exclude ?? []).map(normalizeUrl));
  const children = ownedSectionItems(sectionKey, owner)
    .filter((item) => normalizeUrl(item.url) !== url && !excluded.has(normalizeUrl(item.url)));
  return {
    url,
    title,
    children: [...children, ...(options.append ?? [])],
  };
}

function linkedGroupJourney(
  sectionKey: string,
  heading: string,
  owner: DestinationKey,
  url: string,
  title: string,
): Item {
  const landing = normalizeUrl(url);
  const items = ownedGroupItems(sectionKey, heading, owner);
  const parent = items.find((item) => normalizeUrl(item.url) === landing);
  if (!parent) throw new Error(`Navigation group ${sectionKey}/${heading} has no landing ${url}`);
  const children = items.filter((item) => normalizeUrl(item.url) !== landing);
  return {
    ...parent,
    title,
    children: [...(parent.children ?? []), ...children],
  };
}

function requiredItem(items: Item[], url: string, title?: string): Item {
  const path = normalizeUrl(url);
  const item = items.find((candidate) => normalizeUrl(candidate.url) === path);
  if (!item) throw new Error(`Required navigation item is missing: ${url}`);
  return title ? { ...item, title } : item;
}

const pdtfSchemaJourney = sectionJourney('schema', 'pdtf-1', 'JSON Schemas and overlays', {
  url: `${PDTF1_ROUTES.original}/schema`,
  append: [{ url: `${PDTF1_ROUTES.original}/schema/overlays`, title: 'Schema overlays' }],
});
const pdtfImplementationJourney = sectionJourney('implementation', 'pdtf-1', 'Implementation guidance', {
  url: `${PDTF1_ROUTES.original}/implementation`,
});
const pdtfAdoptionJourney = sectionJourney('adoption', 'pdtf-1', 'Adoption evidence', {
  url: `${PDTF1_ROUTES.original}/adoption`,
});
const pdtfModellingJourney = sectionJourney('modelling', 'pdtf-1', 'Historical modelling record', {
  url: PDTF1_ROUTES.historicalModelling,
  exclude: [
    `${PDTF1_ROUTES.original}/schema/overlays`,
    `${PDTF1_ROUTES.original}/data-dictionary`,
    `${PDTF1_ROUTES.original}/business-glossary`,
  ],
});
const pdtfMappingJourney = sectionJourney('mapping', 'pdtf-1', 'Schema-to-ontology verification', {
  url: PDTF1_ROUTES.schemaVerification,
});
const pdtfModelOverviewItems = ownedGroupItems('model', 'Overview', 'pdtf-1');
const pdtfModelJourney: Item = {
  url: PDTF1_ROUTES.modelViews,
  title: 'Model views by audience',
  children: [
    requiredItem(pdtfModelOverviewItems, `${PDTF1_ROUTES.modelViews}/information-architecture`),
    linkedGroupJourney('model', 'Concept tier — for SMEs', 'pdtf-1',
      `${PDTF1_ROUTES.modelViews}/concept`, 'Concept model'),
    linkedGroupJourney('model', 'Logical tier — for engineers', 'pdtf-1',
      `${PDTF1_ROUTES.modelViews}/logical`, 'Logical model'),
    linkedGroupJourney('model', 'Physical — ontology', 'pdtf-1',
      `${PDTF1_ROUTES.modelViews}/physical-ontology`, 'Ontology implementation'),
    linkedGroupJourney('model', 'Physical — deployment', 'pdtf-1',
      `${PDTF1_ROUTES.modelViews}/physical-database`, 'Deployment topology'),
    linkedGroupJourney('model', 'Physical — relational', 'pdtf-1',
      `${PDTF1_ROUTES.modelViews}/physical-relational`, 'Relational projection'),
    requiredItem(pdtfModelOverviewItems, `${PDTF1_ROUTES.modelViews}/validation-report`),
  ],
};

const pdtfOntologyItems = [
  ...ownedSectionItems('ontology', 'pdtf-1')
    .filter(({ url }) => normalizeUrl(url) !== PDTF1_ROUTES.extracted),
  { url: `${PDTF1_ROUTES.terms}/datatypes`, title: 'Datatypes' },
  { url: `${PDTF1_ROUTES.use}/namespaces`, title: 'Namespaces' },
];
const ontologyItem = (url: string, title?: string): Item => requiredItem(pdtfOntologyItems, url, title);
const pdtfLineageJourney: Item = {
  url: PDTF1_ROUTES.lineage,
  title: 'Lineage, provenance and verification',
  children: [
    pdtfModellingJourney,
    pdtfMappingJourney,
    ontologyItem(`${PDTF1_ROUTES.lineage}/decision-provenance`, 'Decision provenance'),
  ],
};
const pdtfConceptsJourney: Item = {
  url: PDTF1_ROUTES.concepts,
  title: 'Concepts and architecture',
  children: [
    ontologyItem(`${PDTF1_ROUTES.concepts}/foundation`),
    ontologyItem(`${PDTF1_ROUTES.concepts}/identity`),
    { url: `${PDTF1_ROUTES.concepts}/contexts`, title: 'Ontology contexts' },
    ontologyItem(`${PDTF1_ROUTES.concepts}/foundational-ontology`),
    ontologyItem(`${PDTF1_ROUTES.concepts}/modelling-frameworks`),
  ],
};
const pdtfTermsJourney: Item = {
  url: PDTF1_ROUTES.terms,
  title: 'Terms and model resources',
  children: [
    ontologyItem(`${PDTF1_ROUTES.terms}/graph`),
    ontologyItem(`${PDTF1_ROUTES.terms}/classes`),
    ontologyItem(`${PDTF1_ROUTES.terms}/categories`),
    ontologyItem(`${PDTF1_ROUTES.terms}/properties`),
    ontologyItem(`${PDTF1_ROUTES.terms}/datatypes`),
    ontologyItem(`${PDTF1_ROUTES.terms}/vocabularies`),
    ontologyItem(`${PDTF1_ROUTES.terms}/glossary`),
  ],
};
const pdtfValidationJourney: Item = {
  url: PDTF1_ROUTES.validation,
  title: 'Validation and examples',
  children: [
    ontologyItem(`${PDTF1_ROUTES.validation}/shapes`),
    ontologyItem(`${PDTF1_ROUTES.validation}/profiles`),
    ontologyItem(`${PDTF1_ROUTES.validation}/exemplars`),
  ],
};
const pdtfTrustJourney: Item = {
  url: PDTF1_ROUTES.trust,
  title: 'Trust, governance and limitations',
  children: [
    ontologyItem(`${PDTF1_ROUTES.trust}/claims`),
    ontologyItem(`${PDTF1_ROUTES.trust}/governance`),
    ontologyItem(`${PDTF1_ROUTES.trust}/known-issues`),
  ],
};
const pdtfUseJourney: Item = {
  url: PDTF1_ROUTES.use,
  title: 'Use and tooling',
  children: [
    ontologyItem(`${PDTF1_ROUTES.use}/usage`),
    ontologyItem(`${PDTF1_ROUTES.use}/namespaces`),
    ontologyItem(`${PDTF1_ROUTES.use}/bake-off`),
  ],
};

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
      category('Member guide', '/spdtf-2/working-groups/member-guide', WORKING_GROUP_MEMBER_GUIDE_ITEMS),
      category('Group workspaces', '/spdtf-2/working-groups', workingGroupItems),
    ],
  },
  'pdtf-1': {
    key: 'pdtf-1',
    title: 'PDTF 1.0',
    summary: 'The published schema implementation and status-labelled derived artefacts.',
    groups: [
      category('Overview', PDTF1_ROUTES.root),
      category('Original standard', PDTF1_ROUTES.original, [
        pdtfSchemaJourney,
        { url: `${PDTF1_ROUTES.original}/data-dictionary`, title: 'Data dictionary' },
        { url: `${PDTF1_ROUTES.original}/business-glossary`, title: 'Business glossary' },
        pdtfImplementationJourney,
        pdtfAdoptionJourney,
      ]),
      category('Extracted ontology', PDTF1_ROUTES.extracted, [
        pdtfLineageJourney,
        pdtfModelJourney,
        pdtfConceptsJourney,
        pdtfTermsJourney,
        pdtfValidationJourney,
        pdtfTrustJourney,
        pdtfUseJourney,
      ]),
    ],
  },
  governance: {
    key: 'governance',
    title: 'Governance',
    summary: 'Decision rights, standards lifecycle, status and recorded decisions.',
    groups: [
      category('Governance framework', '/governance', GOVERNANCE_FRAMEWORK_ITEMS),
      category('Architecture decisions', '/modelling/adr'),
      category('Ontology decisions', '/modelling/odr'),
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
  { prefix: `${PDTF1_ROUTES.terms}/categories/`, target: `${PDTF1_ROUTES.terms}/categories` },
  { prefix: `${PDTF1_ROUTES.concepts}/contexts/`, target: `${PDTF1_ROUTES.concepts}/contexts` },
  { prefix: `${PDTF1_ROUTES.validation}/exemplars/`, target: `${PDTF1_ROUTES.validation}/exemplars` },
  { prefix: `${PDTF1_ROUTES.validation}/profiles/`, target: `${PDTF1_ROUTES.validation}/profiles` },
  { prefix: `${PDTF1_ROUTES.schemaVerification}/triplesmaps/`, target: `${PDTF1_ROUTES.schemaVerification}/triplesmaps` },
  { prefix: '/pdtf/', target: `${PDTF1_ROUTES.terms}/glossary` },
];

export function getNavigationSection(path: string): NavigationSection | null {
  const normalized = normalizeUrl(path);
  if (STANDALONE_SURFACES.some((pattern) => pattern.test(normalized))) return null;
  if (isRetiredPdtf1DocumentationRoute(normalized)) return null;
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
  const matchPath = ACTIVE_ROUTE_ALIASES.find(({ prefix }) => normalized.startsWith(prefix))?.target ?? normalized;
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
