import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  blockInventory,
  informationContract,
  sha256,
} from '../../scripts/lib/ia-preservation-contract.mjs';
import {
  getPdtfResourceReplacementRoute,
  LEASE_TERM_RESOURCE_ROUTES,
} from './pdtf-resource-routes.mjs';

/**
 * The ontology contains two real resources whose local names differ only by
 * case. They are not aliases: LeaseTerm is a class and leaseTerm is an object
 * property. Their representation documents now use lowercase, type-scoped
 * paths so every supported filesystem can emit both resources independently.
 */
export const LEASE_TERM_CASE_COLLISION = LEASE_TERM_RESOURCE_ROUTES;

export function stableLeaseTermRoute(route) {
  return getPdtfResourceReplacementRoute(route) ?? route;
}

function requiredFile(root, relative) {
  const file = path.join(root, 'dist', relative);
  if (!existsSync(file)) throw new Error(`type-scoped resource output is missing: dist/${relative}`);
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

/** Validate both type-scoped HTML and Turtle representations in an output root. */
export function inspectLeaseTermCaseCollision(root) {
  for (const relative of [
    LEASE_TERM_CASE_COLLISION.legacyClassFile,
    LEASE_TERM_CASE_COLLISION.legacyPropertyFile,
    LEASE_TERM_CASE_COLLISION.legacyClassTtlFile,
    LEASE_TERM_CASE_COLLISION.legacyPropertyTtlFile,
  ]) {
    if (existsSync(path.join(root, 'dist', relative))) {
      throw new Error(`retired case-only resource output is still emitted: dist/${relative}`);
    }
  }
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
    throw new Error('object-property route is not the leaseTerm property page');
  }
  if (heading(classHtml) !== 'Lease Term') {
    throw new Error('class route is not the LeaseTerm class page');
  }
  if (primaryType(propertyTtl, LEASE_TERM_CASE_COLLISION.propertyIri) !== 'ObjectProperty') {
    throw new Error('object-property Turtle does not identify leaseTerm');
  }
  if (primaryType(classTtl, LEASE_TERM_CASE_COLLISION.classIri) !== 'Class') {
    throw new Error('class Turtle does not identify LeaseTerm');
  }
  if (propertyRawSha256 === classRawSha256
    || propertyContent.contentSha256 === classContent.contentSha256) {
    throw new Error('type-scoped resources unexpectedly share one HTML representation');
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
  const expectedBaselineRoute = route === LEASE_TERM_CASE_COLLISION.classRoute
    ? LEASE_TERM_CASE_COLLISION.legacyClassRoute
    : LEASE_TERM_CASE_COLLISION.legacyPropertyRoute;
  if (!record || record.acceptedFile !== file
    || (record.baselineRoute && record.baselineRoute !== expectedBaselineRoute)) {
    throw new Error(`type-scoped resource is not retained at ${route}`);
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

function sourceReceiptLineage(sourceReceipt) {
  if (!sourceReceipt) return {};
  if (sourceReceipt.policy !== 'case-sensitive-stable-resource-pair-v2'
    || sourceReceipt.classRoute !== LEASE_TERM_CASE_COLLISION.legacyClassRoute
    || sourceReceipt.propertyRoute !== LEASE_TERM_CASE_COLLISION.legacyPropertyRoute
    || sourceReceipt.classIri !== LEASE_TERM_CASE_COLLISION.classIri
    || sourceReceipt.propertyIri !== LEASE_TERM_CASE_COLLISION.propertyIri) {
    throw new Error('LeaseTerm source receipt does not describe the frozen case-only pair');
  }
  return {
    sourcePolicy: sourceReceipt.policy,
    sourceReceiptSha256: sha256(JSON.stringify(sourceReceipt)),
  };
}

/** Compose the fail-closed manifest receipt for the two type-scoped resources. */
export function composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes, sourceReceipt = null) {
  const evidence = inspectLeaseTermCaseCollision(root);
  const records = [...routes, ...addedRoutes];
  const property = stableRecord(records, LEASE_TERM_CASE_COLLISION.propertyRoute,
    LEASE_TERM_CASE_COLLISION.propertyFile);
  const leaseClass = stableRecord(records, LEASE_TERM_CASE_COLLISION.classRoute,
    LEASE_TERM_CASE_COLLISION.classFile);
  return {
    ...LEASE_TERM_CASE_COLLISION,
    ...sourceReceiptLineage(sourceReceipt),
    propertyRecordSha256: recordDigest(property),
    classRecordSha256: recordDigest(leaseClass),
    ...evidence,
  };
}

export function validateLeaseTermCaseCollisionReceipt(
  root, receipt, routes, addedRoutes, sourceReceipt = null,
) {
  const records = [...routes, ...addedRoutes];
  const property = stableRecord(records, LEASE_TERM_CASE_COLLISION.propertyRoute,
    LEASE_TERM_CASE_COLLISION.propertyFile);
  const leaseClass = stableRecord(records, LEASE_TERM_CASE_COLLISION.classRoute,
    LEASE_TERM_CASE_COLLISION.classFile);
  const recordHashes = {
    propertyRecordSha256: recordDigest(property),
    classRecordSha256: recordDigest(leaseClass),
  };
  const expected = {
    ...LEASE_TERM_CASE_COLLISION,
    ...sourceReceiptLineage(sourceReceipt),
    ...recordHashes,
  };
  if (!receipt || Object.entries(expected).some(([key, value]) => receipt[key] !== value)) {
    throw new Error('LeaseTerm type-scoped resource receipt is inconsistent');
  }
  for (const key of [
    'propertyRawSha256', 'propertyContentSha256', 'propertyBlockInventorySha256',
    'classRawSha256', 'classContentSha256', 'classBlockInventorySha256',
    'propertyTtlSha256', 'classTtlSha256',
  ]) {
    if (!/^[a-f0-9]{64}$/u.test(receipt[key] ?? '')) {
      throw new Error(`LeaseTerm type-scoped resource receipt has invalid ${key}`);
    }
  }
  if (root) {
    const actual = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes, sourceReceipt);
    if (JSON.stringify(actual) !== JSON.stringify(receipt)) {
      throw new Error('LeaseTerm type-scoped resource receipt is inconsistent');
    }
  }
  return true;
}
