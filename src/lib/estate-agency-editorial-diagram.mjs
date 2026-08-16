import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  compactIri,
  contextDiagram,
  contextDiagramProjection,
  resourceRoute,
  structuralRows,
} from './v2-model.mjs';

const PROJECT_ROOT = path.resolve(process.cwd());
const RECEIPT_PATH = path.join(
  PROJECT_ROOT, 'src/data/diagrams/estate-agency.diagram-design.json',
);
const RAW_PATH = path.join(PROJECT_ROOT, 'src/data/diagrams/estate-agency.raw.mmd');
const NORMALIZED_PATH = path.join(
  PROJECT_ROOT, 'src/data/diagrams/estate-agency.normalized.mmd',
);
const ARTIFACT_PATH = path.join(
  PROJECT_ROOT, 'src/data/diagrams/estate-agency.diagram-design.html',
);
const PROFILE_PATH = path.join(
  PROJECT_ROOT, '.agents/skills/opda-diagram-design/references/opda-profile.md',
);
const EXPECTED_SKILL_SHA256 = '8366ef4d11c3a9591556deb55320ea3521c138ccdad834eb087b8062f41d93a1';
const EXPECTED_REFERENCE_SHA256 = {
  'README.md': '12d51301d2204fac89375768b7ada26abc6282b324e36fb47543c1a7e802c88b',
  'commands/import-mermaid.md': 'b4933a5b4dff1a68b7d073e3cf6b126469207b2eba191d456f4146cac261efba',
  'references/import-mermaid.md': '491ff83440fc995401b5ba20f63325f976732bf1669003c1840b4137072cc274',
  'references/output-spec.md': 'd8fa916f523b99ada083a652f4440d3f0d086a8af61ae333bac50153338f42a3',
  'references/type-architecture.md': 'cb5672b5c69cbe24a0b18d144f8b2e4507a124ebb0dbc0bc898ceafb27612caa',
  'references/type-er.md': '61ee3643c9e3a1e2c3a329640132ede2c193bfabaebbbb5fa486be800b6afa29',
  'references/style-guide.md': 'a122617d3528795c3be8918c50c53bfb758beec735b9d57abecce47e52f1ecbb',
  'references/onboarding.md': '7b9ef85e8f79c6f32e7c92c785d65b9abbaa5036e678a4eb056764a04b0f887a',
  'references/profiles.md': '51f6d24e40eca1a13dc562b4b33aa76b56172c5c30fc94897e5bb369a34f9886',
  'scripts/mermaid_extract.py': '297ff6a8042c33d33df72ac4384bf666b2ab045f74030269adb45a89a7a2e0f8',
};

function readUtf8(filePath) {
  return readFileSync(filePath, 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fail(code, message) {
  throw new Error(`[estate-agency-diagram:${code}] ${message}`);
}

function requireEqual(actual, expected, code, noun) {
  if (actual !== expected) fail(code, `${noun} is ${String(actual)}; expected ${String(expected)}`);
}

function compareSets(actual, expected, code) {
  const missing = [...expected].filter((value) => !actual.has(value));
  const unexpected = [...actual].filter((value) => !expected.has(value));
  if (missing.length || unexpected.length) {
    fail(code, [
      missing.length ? `missing ${missing.join(', ')}` : '',
      unexpected.length ? `unexpected ${unexpected.join(', ')}` : '',
    ].filter(Boolean).join('; '));
  }
}

function loadReceipt() {
  const receipt = JSON.parse(readUtf8(RECEIPT_PATH));
  const raw = readUtf8(RAW_PATH);
  const normalized = readUtf8(NORMALIZED_PATH);
  const artifact = readUtf8(ARTIFACT_PATH);
  const profile = readUtf8(PROFILE_PATH);

  requireEqual(receipt.schemaVersion, 1, 'receipt-schema', 'receipt schema');
  requireEqual(receipt.skill.pluginId, 'diagram-design@diagram-design', 'skill-plugin', 'plugin');
  requireEqual(receipt.skill.version, '2.4.0', 'skill-version', 'skill version');
  requireEqual(
    receipt.skill.commit,
    '09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6',
    'skill-commit',
    'skill commit',
  );
  requireEqual(
    receipt.skill.skillSha256,
    EXPECTED_SKILL_SHA256,
    'skill-hash',
    'skill hash',
  );
  for (const [reference, expectedSha256] of Object.entries(EXPECTED_REFERENCE_SHA256)) {
    requireEqual(
      receipt.references?.[reference],
      expectedSha256,
      'reference-hash',
      `${reference} hash`,
    );
  }
  requireEqual(receipt.invocation.entrypoint, '$diagram-design', 'invocation-entrypoint', 'entrypoint');
  requireEqual(receipt.invocation.operation, 'import-mermaid', 'invocation-operation', 'operation');
  requireEqual(receipt.invocation.result, 'success', 'invocation-result', 'result');
  requireEqual(receipt.profile.slug, 'opda', 'profile-slug', 'profile');
  requireEqual(
    receipt.invocation.generatedArtifact.path,
    'src/data/diagrams/estate-agency.diagram-design.html',
    'artifact-path',
    'generated artifact path',
  );

  requireEqual(sha256(raw), receipt.input.rawSha256, 'raw-hash', 'raw Mermaid hash');
  requireEqual(
    sha256(normalized),
    receipt.input.normalizedSha256,
    'normalized-hash',
    'normalized Mermaid hash',
  );
  requireEqual(
    sha256(artifact),
    receipt.invocation.generatedArtifact.sha256,
    'artifact-hash',
    'generated HTML hash',
  );
  requireEqual(sha256(profile), receipt.profile.sha256, 'profile-hash', 'OPDA profile hash');
  requireEqual(raw, contextDiagram('estate-agency'), 'raw-source', 'authoritative Mermaid source');

  const regenerated = raw.replace(
    /^[ \t]*acc(?:Title|Descr):[^\r\n]*(?:\r?\n|$)/gmu,
    '',
  );
  requireEqual(regenerated, normalized, 'normalization', 'normalized Mermaid source');
  return receipt;
}

const RECEIPT = loadReceipt();

function axisSegment(from, to, key) {
  if (from[0] === to[0]) return `V ${to[1]}`;
  if (from[1] === to[1]) return `H ${to[0]}`;
  fail('geometry-axis', `${key} contains a diagonal segment`);
}

function segmentLength(from, to) {
  return Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]);
}

function moveToward(from, to, distance) {
  const length = segmentLength(from, to);
  return [
    from[0] + ((to[0] - from[0]) / length) * distance,
    from[1] + ((to[1] - from[1]) / length) * distance,
  ];
}

function roundedPath(points, key, requestedRadius) {
  if (!Array.isArray(points) || points.length < 2) fail('geometry-points', `${key} has no path`);
  let cursor = points[0];
  let path = `M ${cursor[0]} ${cursor[1]}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    axisSegment(previous, corner, key);
    axisSegment(corner, next, key);
    const radius = Math.min(
      requestedRadius,
      segmentLength(previous, corner) / 2,
      segmentLength(corner, next) / 2,
    );
    const entry = moveToward(corner, previous, radius);
    const exit = moveToward(corner, next, radius);
    path += ` ${axisSegment(cursor, entry, key)} Q ${corner[0]} ${corner[1]} ${exit[0]} ${exit[1]}`;
    cursor = exit;
  }

  path += ` ${axisSegment(cursor, points.at(-1), key)}`;
  return path;
}

function overlaps(left, right) {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y;
}

function validateGeometry(layout) {
  const connectors = [...layout.relationships, layout.hierarchy];
  const labels = connectors.map((item) => item.label);
  const values = [
    layout.viewBox.width, layout.viewBox.height, layout.cornerRadius,
    layout.legend.ruleY, layout.legend.labelY,
    ...layout.zones.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...layout.cards.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...layout.standardTypes.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...labels.flatMap(({ x, y, width, height }) => [x, y, width, height]),
    ...connectors.flatMap(({ points }) => points.flat()),
  ];
  const offGrid = values.find((value) => !Number.isInteger(value) || value % 4 !== 0);
  if (offGrid != null) fail('geometry-grid', `${offGrid} is off the 4px grid`);

  for (let index = 0; index < layout.cards.length; index += 1) {
    const card = layout.cards[index];
    if (card.fields.length && card.height !== 48 + card.fields.length * 44) {
      fail('geometry-target', `${card.key} does not provide 44px property rows`);
    }
    for (let other = index + 1; other < layout.cards.length; other += 1) {
      if (overlaps(card, layout.cards[other])) {
        fail('geometry-overlap', `${card.key} overlaps ${layout.cards[other].key}`);
      }
    }
  }
  for (const label of labels) {
    if (label.width < 44 || label.height < 44) fail('geometry-target', 'connector label is below 44px');
    const collision = layout.cards.find((card) => overlaps(label, card));
    if (collision) fail('geometry-label', `connector label overlaps ${collision.key}`);
  }

  const attachments = connectors
    .flatMap((item) => [item.points[0].join(','), item.points.at(-1).join(',')]);
  if (new Set(attachments).size !== attachments.length) {
    fail('geometry-attachment', 'connector attachment points must be unique');
  }
  for (const connector of connectors) {
    for (let index = 1; index < connector.points.length; index += 1) {
      axisSegment(connector.points[index - 1], connector.points[index], connector.key ?? 'subclass');
    }
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

function validateReceiptCounts(layout) {
  const fidelity = RECEIPT.fidelity;
  requireEqual(layout.cards.length, fidelity.classCards, 'fidelity-cards', 'class-card count');
  requireEqual(
    layout.relationships.length,
    fidelity.relationshipLabels,
    'fidelity-relationships',
    'relationship count',
  );
  requireEqual(
    layout.cards.flatMap((card) => card.fields).length,
    fidelity.propertyRows,
    'fidelity-fields',
    'property-row count',
  );
  requireEqual(
    layout.standardTypes.length,
    fidelity.standardTypes,
    'fidelity-standards',
    'standard-type count',
  );
  requireEqual(
    fidelity.classCards + fidelity.relationshipLabels + fidelity.propertyRows + fidelity.standardTypes,
    fidelity.sourceNodes,
    'fidelity-nodes',
    'represented node count',
  );
  requireEqual(
    fidelity.relationshipLabels * 2 + fidelity.propertyRows * 2 + fidelity.subclassConnectors,
    fidelity.sourceEdges,
    'fidelity-edges',
    'represented edge count',
  );
  requireEqual(fidelity.omittedResources, 0, 'fidelity-omission', 'omitted-resource count');
  requireEqual(fidelity.inventedCardinalities, 0, 'fidelity-cardinality', 'invented cardinalities');
}

export function buildEstateAgencyEditorialDiagram(
  projection = contextDiagramProjection('estate-agency'),
) {
  if (projection.context?.id !== 'estate-agency') {
    fail('context', `expected estate-agency; received ${projection.context?.id ?? 'unknown'}`);
  }

  const layout = RECEIPT.layout;
  validateReceiptCounts(layout);
  const geometryValues = validateGeometry(layout);
  const resourcesByKey = new Map();
  for (const resource of projection.displayedResources) {
    if (resourcesByKey.has(resource.key)) fail('resource-duplicate', `duplicate ${resource.key}`);
    resourcesByKey.set(resource.key, resource);
  }
  const placedKeys = new Set([
    ...layout.cards.map((card) => card.key),
    ...layout.cards.flatMap((card) => card.fields.map((field) => field.key)),
    ...layout.relationships.map((relationship) => relationship.key),
  ]);
  compareSets(new Set(resourcesByKey.keys()), placedKeys, 'resource-set');

  const cards = layout.cards.map((cardLayout) => {
    const { resource, route } = requireResource(resourcesByKey, cardLayout.key, 'class');
    const fields = cardLayout.fields.map(({ key, kind }) => {
      const placed = requireResource(resourcesByKey, key, kind);
      if (placed.resource.domain !== resource.iri) {
        fail('field-domain', `${key} no longer belongs to ${cardLayout.key}`);
      }
      if (!placed.resource.range || !projection.standardIris.includes(placed.resource.range)) {
        fail('field-range', `${key} has unsupported range ${placed.resource.range || '(missing)'}`);
      }
      return { ...placed, typeLabel: compactIri(placed.resource.range) };
    });
    return { ...cardLayout, resource, route, fields };
  });

  const relationships = layout.relationships.map((relationshipLayout) => {
    const placed = requireResource(resourcesByKey, relationshipLayout.key, 'object-property');
    const from = requireResource(resourcesByKey, relationshipLayout.from, 'class').resource;
    const to = requireResource(resourcesByKey, relationshipLayout.to, 'class').resource;
    if (placed.resource.domain !== from.iri || placed.resource.range !== to.iri) {
      fail(
        'relationship-endpoints',
        `${relationshipLayout.key} no longer connects ${relationshipLayout.from} to ${relationshipLayout.to}`,
      );
    }
    return {
      ...relationshipLayout,
      ...placed,
      path: roundedPath(relationshipLayout.points, relationshipLayout.key, layout.cornerRadius),
    };
  });

  const hierarchySource = requireResource(resourcesByKey, layout.hierarchy.from, 'class').resource;
  const hierarchyTarget = requireResource(resourcesByKey, layout.hierarchy.to, 'class').resource;
  if (hierarchySource.subclass_of !== hierarchyTarget.iri) {
    fail('hierarchy', `${layout.hierarchy.from} is no longer a subclass of ${layout.hierarchy.to}`);
  }
  const hierarchy = {
    ...layout.hierarchy,
    path: roundedPath(layout.hierarchy.points, 'subclass', layout.cornerRadius),
  };

  const usedStandardIris = new Set(cards.flatMap((card) => (
    card.fields.map((field) => field.resource.range)
  )));
  compareSets(usedStandardIris, new Set(projection.standardIris), 'standard-set');
  const standardIrisByLabel = new Map(
    projection.standardIris.map((iri) => [compactIri(iri), iri]),
  );
  compareSets(
    new Set(layout.standardTypes.map((term) => term.label)),
    new Set(standardIrisByLabel.keys()),
    'standard-layout',
  );

  const routes = [
    ...cards.flatMap((card) => [card.route, ...card.fields.map((field) => field.route)]),
    ...relationships.map((relationship) => relationship.route),
  ];
  if (new Set(routes).size !== routes.length) fail('route-duplicate', 'resource routes must be unique');

  return {
    receipt: RECEIPT,
    method: {
      name: 'Diagram Design',
      version: RECEIPT.skill.version,
      commit: RECEIPT.skill.commit,
      entrypoint: RECEIPT.invocation.entrypoint,
    },
    viewBox: layout.viewBox,
    zones: layout.zones,
    legend: layout.legend,
    cards,
    relationships,
    hierarchy,
    structuralEdges: [...relationships, hierarchy],
    standardTerms: layout.standardTypes.map((term) => ({
      ...term,
      iri: standardIrisByLabel.get(term.label),
    })),
    routes,
    geometryValues,
    fidelity: {
      ...RECEIPT.fidelity,
      linkedResources: projection.displayedResources.length,
      structuralRows: structuralRows(projection.carriers).length,
      entityCards: cards.length,
    },
  };
}
