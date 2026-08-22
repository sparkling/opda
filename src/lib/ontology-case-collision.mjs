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
 * both generated paths, so an earlier preservation cut masked the distinction.
 * The release contract now requires both resources to remain independently
 * addressable on a case-sensitive filesystem.
 */
export const LEASE_TERM_CASE_COLLISION = Object.freeze({
  policy: 'case-sensitive-stable-resource-pair-v2',
  propertyRoute: '/pdtf/leaseTerm',
  classRoute: '/pdtf/LeaseTerm',
  propertyFile: 'pdtf/leaseTerm/index.html',
  classFile: 'pdtf/LeaseTerm/index.html',
  propertyTtlFile: 'pdtf/leaseTerm.ttl',
  classTtlFile: 'pdtf/LeaseTerm.ttl',
  propertyIri: 'https://opda.org.uk/pdtf/leaseTerm',
  classIri: 'https://opda.org.uk/pdtf/LeaseTerm',
});

export function stableLeaseTermRoute(route) {
  return route;
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
    propertyHtml: LEASE_TERM_CASE_COLLISION.propertyFile,
    classHtml: LEASE_TERM_CASE_COLLISION.classFile,
    propertyTtl: LEASE_TERM_CASE_COLLISION.propertyTtlFile,
    classTtl: LEASE_TERM_CASE_COLLISION.classTtlFile,
  }).map(([key, relative]) => [key, requiredFile(root, relative)]));
  const propertyHtml = readFileSync(files.propertyHtml, 'utf8');
  const classHtml = readFileSync(files.classHtml, 'utf8');
  const propertyTtl = readFileSync(files.propertyTtl, 'utf8');
  const classTtl = readFileSync(files.classTtl, 'utf8');
  const propertyContent = informationContract(propertyHtml);
  const classContent = informationContract(classHtml);
  const propertyRawSha256 = sha256(propertyHtml);
  const classRawSha256 = sha256(classHtml);
  if (heading(propertyHtml).toLowerCase() !== 'lease term') {
    throw new Error('case-collision lowercase route is not the leaseTerm property page');
  }
  if (heading(classHtml) !== 'Lease Term') {
    throw new Error('case-collision uppercase route is not the LeaseTerm class page');
  }
  if (primaryType(propertyTtl, LEASE_TERM_CASE_COLLISION.propertyIri) !== 'ObjectProperty') {
    throw new Error('case-collision lowercase Turtle does not identify leaseTerm');
  }
  if (primaryType(classTtl, LEASE_TERM_CASE_COLLISION.classIri) !== 'Class') {
    throw new Error('case-collision uppercase Turtle does not identify LeaseTerm');
  }
  if (propertyRawSha256 === classRawSha256
    || propertyContent.contentSha256 === classContent.contentSha256) {
    throw new Error('case-collision resources unexpectedly share one HTML representation');
  }
  return {
    policy: LEASE_TERM_CASE_COLLISION.policy,
    propertyRawSha256,
    propertyContentSha256: propertyContent.contentSha256,
    propertyBlockInventorySha256: blockInventory(propertyContent.blockHashes).sha256,
    classRawSha256,
    classContentSha256: classContent.contentSha256,
    classBlockInventorySha256: blockInventory(classContent.blockHashes).sha256,
    propertyTtlSha256: sha256(propertyTtl),
    classTtlSha256: sha256(classTtl),
  };
}

function routeRecord(records, route, field = 'acceptedRoute') {
  return records.find((record) => record[field] === route);
}

function stableRecord(records, route, file) {
  const record = routeRecord(records, route);
  if (!record || record.acceptedFile !== file
    || (record.baselineRoute && record.baselineRoute !== route)) {
    throw new Error(`case-sensitive stable resource is not retained at ${route}`);
  }
  return record;
}

function recordDigest(record) {
  return sha256(JSON.stringify({
    ...(record.baselineRoute ? { baselineRoute: record.baselineRoute } : {}),
    ...(record.baselineFile ? { baselineFile: record.baselineFile } : {}),
    acceptedRoute: record.acceptedRoute,
    acceptedFile: record.acceptedFile,
    acceptedRawSha256: record.acceptedRawSha256,
  }));
}

/** Compose the fail-closed manifest receipt for the two stable resources. */
export function composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes) {
  const evidence = inspectLeaseTermCaseCollision(root);
  const records = [...routes, ...addedRoutes];
  const property = stableRecord(records, LEASE_TERM_CASE_COLLISION.propertyRoute,
    LEASE_TERM_CASE_COLLISION.propertyFile);
  const leaseClass = stableRecord(records, LEASE_TERM_CASE_COLLISION.classRoute,
    LEASE_TERM_CASE_COLLISION.classFile);
  return {
    ...LEASE_TERM_CASE_COLLISION,
    propertyRecordSha256: recordDigest(property),
    classRecordSha256: recordDigest(leaseClass),
    ...evidence,
  };
}

export function validateLeaseTermCaseCollisionReceipt(root, receipt, routes, addedRoutes) {
  const records = [...routes, ...addedRoutes];
  const property = stableRecord(records, LEASE_TERM_CASE_COLLISION.propertyRoute,
    LEASE_TERM_CASE_COLLISION.propertyFile);
  const leaseClass = stableRecord(records, LEASE_TERM_CASE_COLLISION.classRoute,
    LEASE_TERM_CASE_COLLISION.classFile);
  const recordHashes = {
    propertyRecordSha256: recordDigest(property),
    classRecordSha256: recordDigest(leaseClass),
  };
  const expected = { ...LEASE_TERM_CASE_COLLISION, ...recordHashes };
  if (!receipt || Object.entries(expected).some(([key, value]) => receipt[key] !== value)) {
    throw new Error('LeaseTerm case-sensitive stable-resource receipt is inconsistent');
  }
  for (const key of [
    'propertyRawSha256', 'propertyContentSha256', 'propertyBlockInventorySha256',
    'classRawSha256', 'classContentSha256', 'classBlockInventorySha256',
    'propertyTtlSha256', 'classTtlSha256',
  ]) {
    if (!/^[a-f0-9]{64}$/u.test(receipt[key] ?? '')) {
      throw new Error(`LeaseTerm case-collision receipt has invalid ${key}`);
    }
  }
  if (root) {
    const actual = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes);
    if (JSON.stringify(actual) !== JSON.stringify(receipt)) {
      throw new Error('LeaseTerm case-sensitive stable-resource receipt is inconsistent');
    }
  }
  return true;
}
