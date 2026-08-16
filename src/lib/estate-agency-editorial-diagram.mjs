import {
  compactIri,
  contextDiagramProjection,
  resourceRoute,
  structuralRows,
} from './v2-model.mjs';

// Diagram Design v2.4.0 authoring method, pinned to upstream commit
// 09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6. No upstream runtime or assets
// are copied: OPDA supplies its own declarative SVG, tokens and interactions.
const CARD_LAYOUT = [
  {
    key: 'common:Property', x: 32, y: 316, width: 144, height: 88,
    variant: 'boundary', titleLines: ['Property'], subtitle: 'Common boundary', fields: [],
  },
  {
    key: 'estate-agency:Listing', x: 264, y: 304, width: 184, height: 112,
    variant: 'focal', titleLines: ['Property listing'], subtitle: 'Focal class', fields: [],
  },
  {
    key: 'estate-agency:LettingTerms', x: 664, y: 24, width: 260, height: 136,
    titleLines: ['Letting terms'], fields: [
      { key: 'estate-agency:rentAmount', kind: 'datatype-property' },
      { key: 'estate-agency:rentFrequency', kind: 'object-property' },
    ],
  },
  {
    key: 'estate-agency:MarketDisclosure', x: 664, y: 224, width: 260, height: 136,
    titleLines: ['Market disclosure'],
    fields: [
      { key: 'estate-agency:marketDisclosureOutcome', kind: 'object-property' },
      { key: 'estate-agency:marketDisclosureType', kind: 'object-property' },
    ],
  },
  {
    key: 'estate-agency:MediaResource', x: 664, y: 408, width: 260, height: 92,
    titleLines: ['Listing media resource'],
    fields: [{ key: 'estate-agency:mediaUrl', kind: 'datatype-property' }],
  },
  {
    key: 'estate-agency:PriceStatement', x: 664, y: 548, width: 260, height: 136,
    titleLines: ['Price statement'], fields: [
      { key: 'estate-agency:priceAmount', kind: 'datatype-property' },
      { key: 'estate-agency:priceQualifier', kind: 'object-property' },
    ],
  },
  {
    key: 'estate-agency:ConsumerProtectionDeclaration',
    x: 944, y: 24, width: 136, height: 112,
    titleLines: ['Consumer', 'protection', 'declaration'], subtitle: 'Estate agency class', fields: [],
  },
];

const RELATIONSHIP_LAYOUT = [
  {
    key: 'estate-agency:hasListing', from: 'common:Property', to: 'estate-agency:Listing',
    shortLabel: 'LISTING', points: [[176, 360], [264, 360]],
    label: { x: 180, y: 336, width: 80, height: 48 }, boundary: true,
  },
  {
    key: 'estate-agency:hasLettingTerms', from: 'estate-agency:Listing', to: 'estate-agency:LettingTerms',
    shortLabel: 'LETTING', points: [[448, 324], [496, 324], [496, 48], [664, 48]],
    label: { x: 544, y: 24, width: 96, height: 48 },
  },
  {
    key: 'estate-agency:hasMarketDisclosure', from: 'estate-agency:Listing', to: 'estate-agency:MarketDisclosure',
    shortLabel: 'DISCLOSURE', points: [[448, 348], [520, 348], [520, 248], [664, 248]],
    label: { x: 536, y: 224, width: 112, height: 48 },
  },
  {
    key: 'estate-agency:hasMediaResource', from: 'estate-agency:Listing', to: 'estate-agency:MediaResource',
    shortLabel: 'MEDIA', points: [[448, 372], [568, 372], [568, 432], [664, 432]],
    label: { x: 576, y: 408, width: 80, height: 48 },
  },
  {
    key: 'estate-agency:hasPriceStatement', from: 'estate-agency:Listing', to: 'estate-agency:PriceStatement',
    shortLabel: 'PRICE', points: [[448, 396], [544, 396], [544, 572], [664, 572]],
    label: { x: 568, y: 548, width: 80, height: 48 },
  },
];

const HIERARCHY_LAYOUT = {
  from: 'estate-agency:ConsumerProtectionDeclaration',
  to: 'estate-agency:MarketDisclosure',
  shortLabel: 'SUBCLASS OF',
  points: [[1012, 136], [1012, 184], [796, 184], [796, 224]],
  label: { x: 820, y: 160, width: 112, height: 48 },
};

const VIEW_BOX = { width: 1120, height: 768 };
const ZONES = [
  { id: 'estate-agency', label: 'Estate agency semantic home', x: 216, y: 8, width: 888, height: 700 },
  { id: 'common', label: 'Common boundary', x: 16, y: 276, width: 176, height: 168 },
];
const LEGEND = { ruleY: 724, labelY: 748 };

function fail(code, message) {
  throw new Error(`[estate-agency-diagram:${code}] ${message}`);
}

function compareSets(actual, expected, code, noun) {
  const missing = [...expected].filter((value) => !actual.has(value));
  const unexpected = [...actual].filter((value) => !expected.has(value));
  if (missing.length || unexpected.length) {
    fail(code, [
      missing.length ? `missing ${missing.join(', ')}` : '',
      unexpected.length ? `unexpected ${unexpected.join(', ')}` : '',
    ].filter(Boolean).join('; ') || `${noun} differ`);
  }
}

function pathFromPoints(points, key) {
  return points.map(([x, y], index) => {
    if (index === 0) return `M ${x} ${y}`;
    const [previousX, previousY] = points[index - 1];
    if (x === previousX) return `V ${y}`;
    if (y === previousY) return `H ${x}`;
    fail('geometry-axis', `${key} contains a diagonal segment`);
  }).join(' ');
}

function overlaps(left, right) {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y;
}

function validateGeometry() {
  const labels = [...RELATIONSHIP_LAYOUT.map((item) => item.label), HIERARCHY_LAYOUT.label];
  const values = [
    VIEW_BOX.width, VIEW_BOX.height, LEGEND.ruleY, LEGEND.labelY,
    ...ZONES.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...CARD_LAYOUT.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...labels.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...RELATIONSHIP_LAYOUT.flatMap(({ points }) => points.flat()),
    ...HIERARCHY_LAYOUT.points.flat(),
  ];
  const offGrid = values.find((value) => !Number.isInteger(value) || value % 4 !== 0);
  if (offGrid != null) fail('geometry-grid', `${offGrid} is off the 4px grid`);

  for (let index = 0; index < CARD_LAYOUT.length; index += 1) {
    for (let other = index + 1; other < CARD_LAYOUT.length; other += 1) {
      if (overlaps(CARD_LAYOUT[index], CARD_LAYOUT[other])) {
        fail('geometry-overlap', `${CARD_LAYOUT[index].key} overlaps ${CARD_LAYOUT[other].key}`);
      }
    }
  }
  for (const label of labels) {
    const collision = CARD_LAYOUT.find((card) => overlaps(label, card));
    if (collision) fail('geometry-label', `connector label overlaps ${collision.key}`);
  }

  const attachments = [...RELATIONSHIP_LAYOUT, HIERARCHY_LAYOUT]
    .flatMap((item) => [item.points[0].join(','), item.points.at(-1).join(',')]);
  if (new Set(attachments).size !== attachments.length) {
    fail('geometry-attachment', 'connector attachment points must be unique');
  }
  return values;
}

function requireResource(resourcesByKey, key, expectedKind) {
  const resource = resourcesByKey.get(key);
  if (!resource) fail('placement', `missing placed resource ${key}`);
  if (resource.kind !== expectedKind) {
    fail('resource-kind', `${key} is ${resource.kind}; expected ${expectedKind}`);
  }
  const route = resourceRoute(resource);
  if (!route.startsWith('/v2/resources/')) fail('route', `${key} has invalid route ${route}`);
  return { resource, route };
}

export function buildEstateAgencyEditorialDiagram(
  projection = contextDiagramProjection('estate-agency'),
) {
  if (projection.context?.id !== 'estate-agency') {
    fail('context', `expected estate-agency; received ${projection.context?.id ?? 'unknown'}`);
  }

  const resourcesByKey = new Map();
  for (const resource of projection.displayedResources) {
    if (resourcesByKey.has(resource.key)) fail('resource-duplicate', `duplicate ${resource.key}`);
    resourcesByKey.set(resource.key, resource);
  }
  const placedKeys = new Set([
    ...CARD_LAYOUT.map((card) => card.key),
    ...CARD_LAYOUT.flatMap((card) => card.fields.map((field) => field.key)),
    ...RELATIONSHIP_LAYOUT.map((relationship) => relationship.key),
  ]);
  compareSets(new Set(resourcesByKey.keys()), placedKeys, 'resource-set', 'resource sets');

  const cards = CARD_LAYOUT.map((layout) => {
    const { resource, route } = requireResource(resourcesByKey, layout.key, 'class');
    const fields = layout.fields.map(({ key, kind }) => {
      const placed = requireResource(resourcesByKey, key, kind);
      if (placed.resource.domain !== resource.iri) {
        fail('field-domain', `${key} no longer belongs to ${layout.key}`);
      }
      if (!placed.resource.range || !projection.standardIris.includes(placed.resource.range)) {
        fail('field-range', `${key} has unsupported range ${placed.resource.range || '(missing)'}`);
      }
      return { ...placed, typeLabel: compactIri(placed.resource.range) };
    });
    return { ...layout, resource, route, fields };
  });

  const relationships = RELATIONSHIP_LAYOUT.map((layout) => {
    const placed = requireResource(resourcesByKey, layout.key, 'object-property');
    const from = requireResource(resourcesByKey, layout.from, 'class').resource;
    const to = requireResource(resourcesByKey, layout.to, 'class').resource;
    if (placed.resource.domain !== from.iri || placed.resource.range !== to.iri) {
      fail('relationship-endpoints', `${layout.key} no longer connects ${layout.from} to ${layout.to}`);
    }
    return { ...layout, ...placed, path: pathFromPoints(layout.points, layout.key) };
  });

  const hierarchySource = requireResource(resourcesByKey, HIERARCHY_LAYOUT.from, 'class').resource;
  const hierarchyTarget = requireResource(resourcesByKey, HIERARCHY_LAYOUT.to, 'class').resource;
  if (hierarchySource.subclass_of !== hierarchyTarget.iri) {
    fail('hierarchy', `${HIERARCHY_LAYOUT.from} is no longer a subclass of ${HIERARCHY_LAYOUT.to}`);
  }
  const hierarchy = {
    ...HIERARCHY_LAYOUT,
    path: pathFromPoints(HIERARCHY_LAYOUT.points, 'subclass'),
  };

  const usedStandardIris = new Set(cards.flatMap((card) => (
    card.fields.map((field) => field.resource.range)
  )));
  compareSets(
    usedStandardIris,
    new Set(projection.standardIris),
    'standard-set',
    'referenced standard sets',
  );

  const routes = [
    ...cards.flatMap((card) => [card.route, ...card.fields.map((field) => field.route)]),
    ...relationships.map((relationship) => relationship.route),
  ];
  if (new Set(routes).size !== routes.length) fail('route-duplicate', 'resource routes must be unique');

  return {
    method: { name: 'Diagram Design', version: '2.4.0', commit: '09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6' },
    viewBox: VIEW_BOX,
    zones: ZONES,
    legend: LEGEND,
    cards,
    relationships,
    hierarchy,
    structuralEdges: [...relationships, hierarchy],
    standardTerms: projection.standardIris.map((iri) => ({ iri, label: compactIri(iri) })),
    routes,
    geometryValues: validateGeometry(),
    fidelity: {
      sourceNodes: projection.displayedNodeCount,
      linkedResources: projection.displayedResources.length,
      structuralRows: structuralRows(projection.carriers).length,
      entityCards: cards.length,
      relationshipLabels: relationships.length,
      propertyRows: cards.flatMap((card) => card.fields).length,
      standardTypes: projection.standardIris.length,
      omittedResources: 0,
    },
  };
}
