import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const SHELL_IDS = new Set([
  'app', 'app-sidebar', 'global-nav-panel', 'global-nav-toggle', 'main-content',
  'menu-toggle', 'sidebar-collapse', 'theme-toggle',
]);
const IGNORED_TAGS = new Set(['script', 'style', 'template', 'svg', 'nav']);
const CONTENT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dt', 'dd', 'th', 'td',
  'caption', 'figcaption', 'pre',
]);
const IGNORED_CLASSES = [
  'breadcrumbs', 'comments-section', 'heading-anchor', 'ia-authority',
  'page-nav', 'workspace-nav',
];

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function parsePreservationArgs(args) {
  let strict = false;
  let manifestOnly = false;
  let baselineRoot = null;
  let routeManifestPath = null;
  for (const arg of args) {
    if (arg === '--strict') {
      if (strict) throw new Error('duplicate --strict flag');
      strict = true;
    } else if (arg === '--manifest-only') {
      if (manifestOnly) throw new Error('duplicate --manifest-only flag');
      manifestOnly = true;
    } else if (arg.startsWith('--baseline-root=')) {
      if (baselineRoot) throw new Error('duplicate --baseline-root flag');
      baselineRoot = arg.slice('--baseline-root='.length);
      if (!baselineRoot || !path.isAbsolute(baselineRoot)) throw new Error('--baseline-root must contain a non-empty absolute path');
    } else if (arg.startsWith('--route-manifest=')) {
      if (routeManifestPath) throw new Error('duplicate --route-manifest flag');
      routeManifestPath = arg.slice('--route-manifest='.length);
      if (!routeManifestPath || !path.isAbsolute(routeManifestPath)) throw new Error('--route-manifest must contain a non-empty absolute path');
    } else if (arg === '--baseline-root' || arg.startsWith('--baseline-root')) {
      throw new Error('malformed --baseline-root flag; use --baseline-root=/absolute/path');
    } else throw new Error(`unknown argument: ${arg}`);
  }
  if (strict && !baselineRoot) throw new Error('--strict requires --baseline-root=/absolute/path');
  if (strict && manifestOnly) throw new Error('--strict and --manifest-only are mutually exclusive');
  return { strict, manifestOnly, baselineRoot, routeManifestPath };
}

export function inventoryDigest(records) {
  return sha256(records.map((record) => `${record.path}\0${record.size}\0${record.sha256}`).join('\n'));
}

export function semanticBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.replacementRoute, entry.replacementBlockSha256, entry.replacementTag,
    entry.replacementText, entry.replacementContentSha256, entry.classification,
    entry.reviewNote,
  ].join('\0')).join('\n'));
}

export function nonInformationBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.classification, entry.originalDestinationRoute, entry.destinationRoute,
    entry.destinationPolicy, entry.sourceEvidence, entry.baselineLinkHref ?? '',
    entry.destinationContentSha256, entry.supersessionReason,
  ].join('\0')).join('\n'));
}

export function filesUnder(root, relative = '', { includeHidden = true } = {}) {
  const base = path.join(root, relative);
  if (!existsSync(base)) return [];
  const output = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!includeHidden && entry.name.startsWith('.')) continue;
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(item);
      else if (entry.isFile()) output.push(item);
    }
  };
  walk(base);
  return output.sort((a, b) => a.localeCompare(b));
}

export function fileInventory(root, relative, filter = () => true) {
  const base = path.join(root, relative);
  const records = filesUnder(root, relative)
    .filter(filter)
    .map((file) => ({
      path: path.relative(base, file).split(path.sep).join('/'),
      size: statSync(file).size,
      sha256: sha256(readFileSync(file)),
    }));
  const treeSha256 = sha256(records.map((record) => `${record.path}\0${record.size}\0${record.sha256}`).join('\n'));
  return { count: records.length, treeSha256, records };
}

function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value ?? '';
}

function classes(node) {
  return attr(node, 'class').split(/\s+/u).filter(Boolean);
}

function ignored(node, inherited = false) {
  return inherited || IGNORED_TAGS.has(node.tagName)
    || classes(node).some((name) => IGNORED_CLASSES.includes(name));
}

function nodeText(node) {
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? []).map(nodeText).join(' ');
}

function normalizeText(value) {
  return String(value)
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    .replace(/\s+/gu, ' ')
    .replace(/\s*#\s*$/u, '')
    .trim();
}

/**
 * A malformed legacy list can make parse5 fold the emitted page shell into a
 * list item's text. That build-path material is not reader information and is
 * deliberately excluded before any preservation receipt is calculated.
 */
function generatedShellArtifact(text) {
  return /<\/(?:article|section|main|body|html)>|<script\b|\/_astro\//iu.test(text);
}

function findMain(node) {
  if (node.tagName === 'main' || attr(node, 'id') === 'main-content') return node;
  for (const child of node.childNodes ?? []) {
    const found = findMain(child);
    if (found) return found;
  }
  return null;
}

export function fragmentContract(html) {
  const ids = [];
  const visit = (node) => {
    const id = attr(node, 'id');
    if (id && !SHELL_IDS.has(id)) ids.push(id);
    node.childNodes?.forEach(visit);
  };
  visit(parse(html));
  const unique = [...new Set(ids)].sort();
  return {
    fragmentCount: unique.length,
    fragmentSha256: sha256(unique.join('\n')),
    fragments: unique,
  };
}

function informationBlocks(html, { includeContainingLink = false } = {}) {
  const document = parse(html);
  const root = findMain(document) ?? document;
  const blocks = [];
  const visit = (node, parentIgnored = false, containingLink = null) => {
    const skip = ignored(node, parentIgnored);
    if (skip) return;
    const nextContainingLink = node.tagName === 'a' ? attr(node, 'href') : containingLink;
    if (CONTENT_TAGS.has(node.tagName)) {
      const text = normalizeText(nodeText(node));
      if (text && !generatedShellArtifact(text)) {
        const value = `${node.tagName}\0${text}`;
        blocks.push(includeContainingLink ? {
          hash: sha256(value), tag: node.tagName, text, containingLink: nextContainingLink,
        } : value);
      }
      return;
    }
    node.childNodes?.forEach((child) => visit(child, skip, nextContainingLink));
  };
  visit(root);
  return blocks;
}

/**
 * Meaningful reader blocks, with the href of the nearest enclosing baseline
 * link when one exists. This is provenance evidence, not a link-text search.
 */
export function linkedInformationBlocks(html) {
  return informationBlocks(html, { includeContainingLink: true });
}

export function informationContract(html) {
  const blocks = informationBlocks(html);
  const blockHashes = blocks.map(sha256);
  return {
    contentSha256: sha256(blocks.join('\n')),
    blockCount: blocks.length,
    blockSetSha256: sha256([...blockHashes].sort().join('\n')),
    blockHashes,
  };
}

/** A multiplicity-aware, deterministic fingerprint for a set of content blocks. */
export function blockInventory(blockHashes) {
  const counts = new Map();
  for (const hash of blockHashes) counts.set(hash, (counts.get(hash) ?? 0) + 1);
  const records = [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([hash, count]) => ({ hash, count }));
  return {
    count: blockHashes.length,
    records,
    sha256: sha256(records.map(({ hash, count }) => `${hash}\0${count}`).join('\n')),
  };
}

export function equivalenceReceipt(before, after, reviewEvidence = 'IA migration before/after comparison') {
  const remaining = new Map();
  for (const hash of after.blockHashes) remaining.set(hash, (remaining.get(hash) ?? 0) + 1);
  let preservedBlocks = 0;
  for (const hash of before.blockHashes) {
    const count = remaining.get(hash) ?? 0;
    if (count > 0) {
      preservedBlocks++;
      remaining.set(hash, count - 1);
    }
  }
  const exact = before.contentSha256 === after.contentSha256;
  return {
    policy: exact ? 'byte-normalized-equivalent' : 'reviewed-reframe-equivalent',
    baselineBlocks: before.blockCount,
    acceptedBlocks: after.blockCount,
    preservedBlocks,
    retentionRatio: before.blockCount ? Number((preservedBlocks / before.blockCount).toFixed(6)) : 1,
    baselineBlockSetSha256: before.blockSetSha256,
    acceptedBlockSetSha256: after.blockSetSha256,
    baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
    acceptedBlockInventorySha256: blockInventory(after.blockHashes).sha256,
    reviewEvidence: exact ? 'normalized information contract unchanged' : reviewEvidence,
  };
}

export function routeFromFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'/index.html'.length)}`;
  return `/${file.replace(/\.html$/u, '')}`;
}

export function indexFileFromRoute(route) {
  if (route === '/') return 'index.html';
  if (typeof route !== 'string' || !route.startsWith('/') || route.includes('?') || route.includes('#')) {
    throw new Error(`cannot derive an index file from route: ${route}`);
  }
  return `${route.slice(1)}/index.html`;
}

export function isRetiredPropertyPackRoute(route) {
  return route === '/v2' || route.startsWith('/v2/') || route === '/modelling/property-pack';
}

export function existingRetiredPropertyPackOutputs(distRoot, migration) {
  return migration.retiredRoots
    .map((route) => path.join(distRoot, route.slice(1)))
    .filter(existsSync);
}

/**
 * Build and validate the fail-closed old-to-canonical Property Pack cut. The
 * caller supplies the IA registry's replacement function so this receipt
 * cannot silently diverge from the public routing contract.
 */
export function propertyPackMigrationReceipt(records, addedRecords, migration, replacementRoute) {
  const technical = records.filter(({ baselineRoute }) => (
    baselineRoute === '/v2' || baselineRoute?.startsWith('/v2/')
  ));
  const catalogue = records.filter(({ baselineRoute }) => baselineRoute === '/modelling/property-pack');
  for (const record of [...technical, ...catalogue]) {
    const replacement = replacementRoute(record.baselineRoute);
    const expectedRoute = replacement ?? record.baselineRoute;
    const expectedFile = replacement ? indexFileFromRoute(replacement) : record.baselineFile;
    if (record.acceptedRoute !== expectedRoute || record.acceptedFile !== expectedFile) {
      throw new Error(`undeclared route move: ${record.baselineRoute} -> ${record.acceptedRoute}`);
    }
  }
  if (technical.length !== migration.technicalRouteCount
    || catalogue.length !== migration.movedCatalogueRouteCount) {
    throw new Error(`Property Pack mapped cut must be ${migration.technicalRouteCount} technical + ${migration.movedCatalogueRouteCount} catalogue routes`);
  }
  const canonicalRecords = records.filter(({ acceptedRoute }) => (
    acceptedRoute === migration.canonicalRoot || acceptedRoute?.startsWith(`${migration.canonicalRoot}/`)
  ));
  const lifecycle = addedRecords.filter(({ acceptedRoute }) => acceptedRoute?.startsWith(`${migration.canonicalRoot}/`));
  const allCanonical = [...canonicalRecords, ...lifecycle];
  if (canonicalRecords.length !== migration.technicalRouteCount + migration.movedCatalogueRouteCount
    || lifecycle.length !== migration.lifecycleAdditionCount
    || allCanonical.length !== migration.technicalRouteCount + migration.movedCatalogueRouteCount + migration.lifecycleAdditionCount) {
    throw new Error('Property Pack canonical family must be 691 migrated content routes plus 2 lifecycle pages');
  }
  if (new Set(allCanonical.map(({ acceptedRoute }) => acceptedRoute)).size !== allCanonical.length
    || new Set(allCanonical.map(({ acceptedFile }) => acceptedFile)).size !== allCanonical.length) {
    throw new Error('Property Pack canonical routes and files must be unique');
  }
  if (allCanonical.some(({ acceptedRoute }) => isRetiredPropertyPackRoute(acceptedRoute))) {
    throw new Error('Property Pack accepted records must not retain a retired route');
  }
  return {
    policy: 'canonical-move-without-redirects-v1',
    baselineTechnicalRouteCount: technical.length,
    baselineCatalogueRouteCount: catalogue.length,
    canonicalContentRouteCount: canonicalRecords.length,
    lifecyclePageCount: lifecycle.length,
    acceptedFamilyRouteCount: allCanonical.length,
    redirects: migration.redirects,
    retiredRoutes: ['/v2/**', '/modelling/property-pack'],
    canonicalRoot: migration.canonicalRoot,
    lifecycleRoutes: lifecycle.map(({ acceptedRoute }) => acceptedRoute).sort(),
  };
}

function acceptedSourceRecords(manifest) {
  return [...(manifest?.routes ?? []), ...(manifest?.addedRoutes ?? [])];
}

function routeWithin(route, root) {
  return route === root || route?.startsWith(`${root}/`);
}

function routeSetDigest(values) {
  return sha256([...values].sort().join('\n'));
}

function recordEvidenceMatches(source, accepted) {
  return ['acceptedContentSha256', 'acceptedBlockInventorySha256', 'acceptedFragmentSha256',
    'acceptedFragmentCount'].every((field) => source[field] === accepted[field])
    && JSON.stringify(source.acceptedFragments) === JSON.stringify(accepted.acceptedFragments);
}

/** Bind every zero-information `/manual/**` alias to the frozen pre-cut record. */
export function composePdtf1RetiredAliases(sourceManifest, replacementRoute) {
  return acceptedSourceRecords(sourceManifest)
    .filter(({ acceptedRoute }) => routeWithin(acceptedRoute, '/manual'))
    .map((source) => {
      const canonicalRoute = replacementRoute(source.acceptedRoute);
      if (!canonicalRoute || source.equivalenceReceipt?.acceptedBlocks !== 0
        || source.acceptedFragmentCount !== 0 || source.acceptedFragments?.length !== 0) {
        throw new Error(`PDTF 1.0 retired alias is not a zero-information redirect: ${source.acceptedRoute}`);
      }
      return {
        policy: 'retired-zero-information-alias-v1',
        sourceRoute: source.acceptedRoute,
        sourceFile: source.acceptedFile,
        sourceRecordSha256: sha256(JSON.stringify(source)),
        canonicalRoute,
        redirects: false,
      };
    })
    .sort((left, right) => left.sourceRoute.localeCompare(right.sourceRoute));
}

/** Return old PDTF documentation files that a no-redirect release still emits. */
export function existingRetiredPdtf1Outputs(distRoot, sourceManifest, replacementRoute) {
  return acceptedSourceRecords(sourceManifest)
    .filter(({ acceptedRoute }) => routeWithin(acceptedRoute, '/manual')
      || (!routeWithin(acceptedRoute, '/pdtf') && replacementRoute(acceptedRoute)))
    .map(({ acceptedFile }) => path.join(distRoot, acceptedFile))
    .filter(existsSync);
}

/**
 * Prove the complete PDTF 1.0 cut against the pinned last accepted route set.
 * Moved and stable routes retain their information and fragment inventories;
 * retired aliases are represented only by explicit zero-information receipts.
 */
export function pdtf1MigrationReceipt({
  records, addedRecords, retiredAliases, migration, replacementRoute, sourceManifest,
}) {
  const source = acceptedSourceRecords(sourceManifest);
  const accepted = [...records, ...addedRecords];
  const byRoute = new Map(accepted.map((record) => [record.acceptedRoute, record]));
  if (source.length !== migration.sourceRouteCount || accepted.length !== migration.acceptedSiteRouteCount
    || byRoute.size !== accepted.length
    || new Set(accepted.map(({ acceptedFile }) => acceptedFile)).size !== accepted.length) {
    throw new Error('PDTF 1.0 source or accepted route inventory has an invalid count or duplicate');
  }
  const retiredByRoute = new Map(retiredAliases.map((entry) => [entry.sourceRoute, entry]));
  if (retiredByRoute.size !== retiredAliases.length) throw new Error('PDTF 1.0 retired aliases are not unique');
  const moved = [];
  const stable = [];
  const accounted = new Set();
  for (const sourceRecord of source) {
    const sourceRoute = sourceRecord.acceptedRoute;
    if (routeWithin(sourceRoute, '/manual')) {
      const expected = composePdtf1RetiredAliases({ routes: [sourceRecord] }, replacementRoute)[0];
      if (JSON.stringify(retiredByRoute.get(sourceRoute)) !== JSON.stringify(expected)
        || byRoute.has(sourceRoute) || !byRoute.has(expected.canonicalRoute)) {
        throw new Error(`PDTF 1.0 retired alias contract is inconsistent: ${sourceRoute}`);
      }
      continue;
    }
    const isStable = routeWithin(sourceRoute, migration.stableIdentifierRoot);
    const replacement = isStable ? null : replacementRoute(sourceRoute);
    const targetRoute = replacement ?? sourceRoute;
    const target = byRoute.get(targetRoute);
    if (!target || accounted.has(targetRoute) || (replacement && byRoute.has(sourceRoute))) {
      throw new Error(`PDTF 1.0 route is missing, duplicated, or retained at its old URL: ${sourceRoute}`);
    }
    accounted.add(targetRoute);
    if (replacement || isStable) {
      if (!recordEvidenceMatches(sourceRecord, target)) {
        throw new Error(`PDTF 1.0 information or fragments changed without evidence: ${sourceRoute}`);
      }
      (replacement ? moved : stable).push({ source: sourceRecord, target });
    } else if (target.acceptedFile !== sourceRecord.acceptedFile) {
      throw new Error(`undeclared non-PDTF route move: ${sourceRoute}`);
    }
  }
  if (accounted.size !== accepted.length || retiredAliases.length !== migration.retiredAliasRouteCount) {
    throw new Error('PDTF 1.0 accepted or retired records are not completely accounted for');
  }
  const movedBaseline = moved.filter(({ source: record }) => sourceManifest.routes.includes(record));
  const movedAdded = moved.filter(({ source: record }) => sourceManifest.addedRoutes.includes(record));
  const familyCounts = Object.fromEntries(Object.keys(migration.movedFamilyRouteCounts).map((family) => [
    family, moved.filter(({ source: { acceptedRoute } }) => acceptedRoute === `/${family}`
      || acceptedRoute.startsWith(`/${family}/`)).length,
  ]));
  const generatedTools = moved.filter(({ source: record, target }) => (
    record.acceptedGeneratedFamily === 'ontology/tools'
      && target.acceptedGeneratedFamily === 'ontology/tools'
  ));
  const artefactIndexes = moved.filter(({ source: { acceptedRoute } }) => (
    routeWithin(acceptedRoute, '/ontology/artefacts')
  ));
  const canonical = accepted.filter(({ acceptedRoute }) => routeWithin(acceptedRoute, migration.canonicalRoot));
  if (moved.length !== migration.movedCanonicalRouteCount
    || movedBaseline.length !== migration.movedBaselineRouteCount
    || movedAdded.length !== migration.movedAddedRouteCount
    || stable.length !== migration.stableIdentifierRouteCount
    || generatedTools.length !== migration.generatedToolRouteCount
    || artefactIndexes.length !== migration.ontologyArtefactHtmlRouteCount
    || canonical.length !== migration.canonicalFamilyRouteCount
    || JSON.stringify(familyCounts) !== JSON.stringify(migration.movedFamilyRouteCounts)
    || migration.redirects !== false) {
    throw new Error('PDTF 1.0 migration counts differ from the reviewed cut');
  }
  return {
    policy: 'canonical-move-with-retired-aliases-v1',
    sourceRouteCount: source.length,
    movedCanonicalRouteCount: moved.length,
    movedBaselineRouteCount: movedBaseline.length,
    movedAddedRouteCount: movedAdded.length,
    movedFamilyRouteCounts: familyCounts,
    retiredAliasRouteCount: retiredAliases.length,
    stableIdentifierRouteCount: stable.length,
    generatedToolRouteCount: generatedTools.length,
    ontologyArtefactHtmlRouteCount: artefactIndexes.length,
    canonicalFamilyRouteCount: canonical.length,
    acceptedSiteRouteCount: accepted.length,
    movedRoutePairsSha256: routeSetDigest(moved.map(({ source: before, target: after }) => (
      `${before.acceptedRoute}\0${after.acceptedRoute}\0${before.acceptedFile}\0${after.acceptedFile}`
    ))),
    retiredAliasesSha256: routeSetDigest(retiredAliases.map(({ sourceRoute, canonicalRoute }) => (
      `${sourceRoute}\0${canonicalRoute}`
    ))),
    stableIdentifierRoutesSha256: routeSetDigest(stable.map(({ source: record }) => record.acceptedRoute)),
    redirects: false,
    canonicalRoot: migration.canonicalRoot,
    stableIdentifierRoot: migration.stableIdentifierRoot,
  };
}

export function generatedFamily(route) {
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) return 'root';
  if (parts[0] === 'ontology' && parts[1] === 'tools') return 'ontology/tools';
  if (parts.slice(0, 5).join('/') === 'pdtf-1/extracted-ontology/use-and-tooling/tools') {
    return 'ontology/tools';
  }
  return parts[0];
}
