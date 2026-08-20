import {
  existsSync, readFileSync, readdirSync, statSync,
} from 'node:fs';
import path from 'node:path';

import {
  blockInventory,
  informationContract,
  sha256,
} from '../../scripts/lib/ia-preservation-contract.mjs';

/**
 * The ontology contains two real, case-sensitive resources whose local names
 * differ only by case.  They are not aliases: LeaseTerm is a class and
 * leaseTerm is an object property.  macOS's default filesystem cannot hold
 * both generated paths, so the old preservation manifest recorded the class
 * route while its bytes were the property route.
 */
export const LEASE_TERM_CASE_COLLISION = Object.freeze({
  policy: 'case-collision-recovered-route-v1',
  sourceRoute: '/pdtf/LeaseTerm',
  acceptedRoute: '/pdtf/leaseTerm',
  recoveredRoute: '/pdtf/LeaseTerm',
  acceptedFile: 'pdtf/leaseTerm/index.html',
  recoveredFile: 'pdtf/LeaseTerm/index.html',
  acceptedTtlFile: 'pdtf/leaseTerm.ttl',
  recoveredTtlFile: 'pdtf/LeaseTerm.ttl',
  acceptedIri: 'https://opda.org.uk/pdtf/leaseTerm',
  recoveredIri: 'https://opda.org.uk/pdtf/LeaseTerm',
});

export function acceptedLeaseTermRoute(route) {
  return route === LEASE_TERM_CASE_COLLISION.sourceRoute
    ? LEASE_TERM_CASE_COLLISION.acceptedRoute : route;
}

function exactFile(root, relative) {
  let current = root;
  for (const segment of relative.split('/')) {
    if (!readdirSync(current).includes(segment)) return null;
    current = path.join(current, segment);
  }
  return statSync(current).isFile() ? current : null;
}

function requiredFile(root, relative) {
  const file = exactFile(root, path.join('dist', relative));
  if (!file) {
    const loosePath = path.join(root, 'dist', relative);
    if (existsSync(loosePath)) {
      throw new Error(`case-sensitive filesystem is required for exact release path: dist/${relative}`);
    }
    throw new Error(`case-collision output is missing exact path: dist/${relative}`);
  }
  return file;
}

function heading(html) {
  return html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)?.[1]
    ?.replace(/<[^>]+>/gu, '').replace(/\s+/gu, ' ').trim() ?? '';
}

function primaryType(turtle, iri) {
  const escaped = iri.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return turtle.match(new RegExp(`^<${escaped}>\\s+a\\s+owl:(\\w+)\\b`, 'mu'))?.[1] ?? '';
}

/** Validate both case-sensitive HTML and Turtle representations in an output root. */
export function inspectLeaseTermCaseCollision(root) {
  const files = Object.fromEntries(Object.entries({
    acceptedHtml: LEASE_TERM_CASE_COLLISION.acceptedFile,
    recoveredHtml: LEASE_TERM_CASE_COLLISION.recoveredFile,
    acceptedTtl: LEASE_TERM_CASE_COLLISION.acceptedTtlFile,
    recoveredTtl: LEASE_TERM_CASE_COLLISION.recoveredTtlFile,
  }).map(([key, relative]) => [key, requiredFile(root, relative)]));
  const acceptedHtml = readFileSync(files.acceptedHtml, 'utf8');
  const recoveredHtml = readFileSync(files.recoveredHtml, 'utf8');
  const acceptedTtl = readFileSync(files.acceptedTtl, 'utf8');
  const recoveredTtl = readFileSync(files.recoveredTtl, 'utf8');
  const acceptedContent = informationContract(acceptedHtml);
  const recoveredContent = informationContract(recoveredHtml);
  const acceptedRawSha256 = sha256(acceptedHtml);
  const recoveredRawSha256 = sha256(recoveredHtml);
  if (heading(acceptedHtml).toLowerCase() !== 'lease term') {
    throw new Error('case-collision lowercase route is not the leaseTerm property page');
  }
  if (heading(recoveredHtml) !== 'Lease Term') {
    throw new Error('case-collision uppercase route is not the LeaseTerm class page');
  }
  if (primaryType(acceptedTtl, LEASE_TERM_CASE_COLLISION.acceptedIri) !== 'ObjectProperty') {
    throw new Error('case-collision lowercase Turtle does not identify leaseTerm');
  }
  if (primaryType(recoveredTtl, LEASE_TERM_CASE_COLLISION.recoveredIri) !== 'Class') {
    throw new Error('case-collision uppercase Turtle does not identify LeaseTerm');
  }
  if (acceptedRawSha256 === recoveredRawSha256
    || acceptedContent.contentSha256 === recoveredContent.contentSha256) {
    throw new Error('case-collision resources unexpectedly share one HTML representation');
  }
  return {
    policy: LEASE_TERM_CASE_COLLISION.policy,
    acceptedRawSha256,
    acceptedContentSha256: acceptedContent.contentSha256,
    acceptedBlockInventorySha256: blockInventory(acceptedContent.blockHashes).sha256,
    recoveredRawSha256,
    recoveredContentSha256: recoveredContent.contentSha256,
    recoveredBlockInventorySha256: blockInventory(recoveredContent.blockHashes).sha256,
    acceptedTtlSha256: sha256(acceptedTtl),
    recoveredTtlSha256: sha256(recoveredTtl),
  };
}

function routeRecord(records, route, field = 'acceptedRoute') {
  return records.find((record) => record[field] === route);
}

/** Compose the fail-closed manifest receipt for the historical masked pair. */
export function composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes) {
  const evidence = inspectLeaseTermCaseCollision(root);
  const mapped = routeRecord(routes, LEASE_TERM_CASE_COLLISION.acceptedRoute);
  const recovered = routeRecord(addedRoutes, LEASE_TERM_CASE_COLLISION.recoveredRoute);
  if (!mapped || mapped.baselineRoute !== LEASE_TERM_CASE_COLLISION.sourceRoute
    || mapped.acceptedFile !== LEASE_TERM_CASE_COLLISION.acceptedFile) {
    throw new Error('case-collision historical route was not mapped to leaseTerm');
  }
  if (!recovered || recovered.kind !== 'new-authority-route'
    || recovered.acceptedFile !== LEASE_TERM_CASE_COLLISION.recoveredFile) {
    throw new Error('case-collision recovered LeaseTerm route was not classified as an addition');
  }
  return {
    ...LEASE_TERM_CASE_COLLISION,
    sourceRecordSha256: sha256(JSON.stringify({
      baselineRoute: mapped.baselineRoute, baselineFile: mapped.baselineFile,
      baselineRawSha256: mapped.baselineRawSha256,
    })),
    acceptedRecordSha256: sha256(JSON.stringify({
      acceptedRoute: mapped.acceptedRoute, acceptedFile: mapped.acceptedFile,
      acceptedRawSha256: mapped.acceptedRawSha256,
    })),
    recoveredRecordSha256: sha256(JSON.stringify({
      acceptedRoute: recovered.acceptedRoute, acceptedFile: recovered.acceptedFile,
      acceptedRawSha256: recovered.acceptedRawSha256,
    })),
    ...evidence,
  };
}

export function validateLeaseTermCaseCollisionReceipt(root, receipt, routes, addedRoutes) {
  const mapped = routeRecord(routes, LEASE_TERM_CASE_COLLISION.acceptedRoute);
  const recovered = routeRecord(addedRoutes, LEASE_TERM_CASE_COLLISION.recoveredRoute);
  if (!mapped || mapped.baselineRoute !== LEASE_TERM_CASE_COLLISION.sourceRoute
    || mapped.acceptedFile !== LEASE_TERM_CASE_COLLISION.acceptedFile
    || !recovered || recovered.kind !== 'new-authority-route'
    || recovered.acceptedFile !== LEASE_TERM_CASE_COLLISION.recoveredFile) {
    throw new Error('LeaseTerm case-collision route records are inconsistent');
  }
  const recordHashes = {
    sourceRecordSha256: sha256(JSON.stringify({
      baselineRoute: mapped.baselineRoute, baselineFile: mapped.baselineFile,
      baselineRawSha256: mapped.baselineRawSha256,
    })),
    acceptedRecordSha256: sha256(JSON.stringify({
      acceptedRoute: mapped.acceptedRoute, acceptedFile: mapped.acceptedFile,
      acceptedRawSha256: mapped.acceptedRawSha256,
    })),
    recoveredRecordSha256: sha256(JSON.stringify({
      acceptedRoute: recovered.acceptedRoute, acceptedFile: recovered.acceptedFile,
      acceptedRawSha256: recovered.acceptedRawSha256,
    })),
  };
  const expected = { ...LEASE_TERM_CASE_COLLISION, ...recordHashes };
  if (!receipt || Object.entries(expected).some(([key, value]) => receipt[key] !== value)) {
    throw new Error('LeaseTerm case-collision migration receipt is inconsistent');
  }
  for (const key of [
    'acceptedRawSha256', 'acceptedContentSha256', 'acceptedBlockInventorySha256',
    'recoveredRawSha256', 'recoveredContentSha256', 'recoveredBlockInventorySha256',
    'acceptedTtlSha256', 'recoveredTtlSha256',
  ]) {
    if (!/^[a-f0-9]{64}$/u.test(receipt[key] ?? '')) {
      throw new Error(`LeaseTerm case-collision receipt has invalid ${key}`);
    }
  }
  if (root) {
    const actual = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes);
    if (JSON.stringify(actual) !== JSON.stringify(receipt)) {
      throw new Error('LeaseTerm case-collision migration receipt is inconsistent');
    }
  }
  return true;
}
