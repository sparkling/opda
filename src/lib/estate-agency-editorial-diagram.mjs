import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  contextDiagram,
  contextDiagramProjection,
  resourceRoute,
} from './v2-model.mjs';

const PROJECT_ROOT = path.resolve(process.cwd());
const DATA_ROOT = path.join(PROJECT_ROOT, 'src/data/diagrams');
const RECEIPT_PATH = path.join(DATA_ROOT, 'estate-agency.diagram-design.json');
const RAW_PATH = path.join(DATA_ROOT, 'estate-agency.raw.mmd');
const NORMALIZED_PATH = path.join(DATA_ROOT, 'estate-agency.normalized.mmd');
const ARTIFACT_PATH = path.join(DATA_ROOT, 'estate-agency.diagram-design.html');
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
const CLICK_RE = /^\s*click\s+(\w+)\s+"([^"]+)"\s*(?:\r?\n|$)/gmu;

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

export function stripClickDirectives(source) {
  return source.replace(CLICK_RE, '').trimEnd();
}

function canonicalProjection(projection) {
  return projection.displayedResources
    .map((resource) => ({
      key: resource.key,
      iri: resource.iri,
      label: resource.label,
      kind: resource.kind,
      semantic_home: resource.semantic_home,
      domain: resource.domain ?? '',
      range: resource.range ?? '',
      subclass_of: resource.subclass_of ?? '',
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function projectionSha256(projection) {
  return sha256(JSON.stringify(canonicalProjection(projection)));
}

function validatedLinks(projection, rawSource) {
  const links = Object.fromEntries(
    projection.displayedResources.map((resource, index) => [`term_${index}`, resourceRoute(resource)]),
  );
  const sourceLinks = Object.fromEntries(
    [...rawSource.matchAll(CLICK_RE)].map((match) => [match[1], match[2]]),
  );
  requireEqual(
    JSON.stringify(sourceLinks),
    JSON.stringify(links),
    'route-map',
    'validated resource route map',
  );
  const routes = Object.values(links);
  if (new Set(routes).size !== routes.length) fail('route-duplicate', 'resource routes must be unique');
  for (const route of routes) {
    if (!/^\/v2\/resources\/[a-z-]+\/[A-Za-z0-9_-]+$/u.test(route)) {
      fail('route', `invalid resource route ${route}`);
    }
  }
  return links;
}

function loadEvidence() {
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
  requireEqual(receipt.skill.skillSha256, EXPECTED_SKILL_SHA256, 'skill-hash', 'skill hash');
  for (const [reference, expected] of Object.entries(EXPECTED_REFERENCE_SHA256)) {
    requireEqual(receipt.references?.[reference], expected, 'reference-hash', `${reference} hash`);
  }
  requireEqual(receipt.invocation.entrypoint, '$diagram-design', 'entrypoint', 'skill entrypoint');
  requireEqual(receipt.invocation.operation, 'import-mermaid', 'operation', 'skill operation');
  requireEqual(receipt.invocation.result, 'success', 'result', 'skill result');
  requireEqual(receipt.profile.slug, 'opda', 'profile-slug', 'profile');
  requireEqual(receipt.integration.mode, 'preserve-renderer-layout', 'mode', 'integration mode');
  requireEqual(receipt.integration.layout, 'elk', 'layout', 'layout engine');
  requireEqual(receipt.integration.nativeRedrawGeometryUsed, false, 'redraw', 'redraw geometry flag');
  requireEqual(receipt.layout.acceptedForWebsite, false, 'redraw-status', 'redraw acceptance');

  requireEqual(sha256(raw), receipt.input.rawSha256, 'raw-hash', 'raw Mermaid hash');
  requireEqual(sha256(normalized), receipt.input.normalizedSha256, 'normalized-hash', 'normalized Mermaid hash');
  requireEqual(sha256(artifact), receipt.invocation.generatedArtifact.sha256, 'artifact-hash', 'generated HTML hash');
  requireEqual(sha256(profile), receipt.profile.sha256, 'profile-hash', 'OPDA profile hash');
  requireEqual(raw, contextDiagram('estate-agency'), 'raw-source', 'authoritative Mermaid source');
  const regenerated = raw.replace(
    /^[ \t]*acc(?:Title|Descr):[^\r\n]*(?:\r?\n|$)/gmu,
    '',
  );
  requireEqual(regenerated, normalized, 'normalization', 'normalized Mermaid source');
  return { receipt, raw };
}

const EVIDENCE = loadEvidence();

export function buildEstateAgencyMermaidDiagram(
  projection = contextDiagramProjection('estate-agency'),
) {
  if (projection.context?.id !== 'estate-agency') {
    fail('context', `expected estate-agency; received ${projection.context?.id ?? 'unknown'}`);
  }
  const currentProjectionSha256 = projectionSha256(projection);
  requireEqual(
    currentProjectionSha256,
    EVIDENCE.receipt.integration.projectionSha256,
    'projection-hash',
    'ontology projection hash',
  );
  const source = stripClickDirectives(EVIDENCE.raw);
  const runtimeSourceSha256 = sha256(source);
  requireEqual(
    runtimeSourceSha256,
    EVIDENCE.receipt.integration.runtimeSourceSha256,
    'runtime-source-hash',
    'runtime Mermaid hash',
  );
  const links = validatedLinks(projection, EVIDENCE.raw);

  return {
    source,
    links,
    receipt: EVIDENCE.receipt,
    runtimeSourceSha256,
    projectionSha256: currentProjectionSha256,
    provenance: {
      mode: EVIDENCE.receipt.integration.mode,
      layoutAuthority: EVIDENCE.receipt.integration.layoutAuthority,
      styleAuthority: EVIDENCE.receipt.integration.styleAuthority,
      diagramDesignVersion: EVIDENCE.receipt.skill.version,
      diagramDesignCommit: EVIDENCE.receipt.skill.commit,
      sourceSha256: EVIDENCE.receipt.input.rawSha256,
      runtimeSourceSha256,
      projectionSha256: currentProjectionSha256,
    },
  };
}
