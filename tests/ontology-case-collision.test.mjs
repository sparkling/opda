import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  LEASE_TERM_CASE_COLLISION,
  composeLeaseTermCaseCollisionReceipt,
  inspectLeaseTermCaseCollision,
  stableLeaseTermRoute,
  validateLeaseTermCaseCollisionReceipt,
} from '../src/lib/ontology-case-collision.mjs';
import {
  getAcceptedRoute,
  getDeclaredRouteReplacement,
} from '../src/lib/site-route-migrations.mjs';

function fixtureRoot() {
  const root = mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '.case-collision-'));
  for (const relative of [
    LEASE_TERM_CASE_COLLISION.propertyFile,
    LEASE_TERM_CASE_COLLISION.classFile,
    LEASE_TERM_CASE_COLLISION.propertyTtlFile,
    LEASE_TERM_CASE_COLLISION.classTtlFile,
  ]) mkdirSync(path.dirname(path.join(root, 'dist', relative)), { recursive: true });
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.propertyFile),
    '<main><h1>lease term</h1><p>Relates a legal estate to its lease term.</p></main>');
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.classFile),
    '<main><h1>Lease Term</h1><p>A bounded time interval for a leasehold estate.</p></main>');
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.propertyTtlFile),
    `<${LEASE_TERM_CASE_COLLISION.propertyIri}> a owl:ObjectProperty ; rdfs:range <${LEASE_TERM_CASE_COLLISION.classIri}> .\n<${LEASE_TERM_CASE_COLLISION.classIri}> a owl:Class .`);
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.classTtlFile),
    `<${LEASE_TERM_CASE_COLLISION.classIri}> a owl:Class .\n<${LEASE_TERM_CASE_COLLISION.propertyIri}> a owl:ObjectProperty .`);
  return root;
}

test('the case-sensitive resource pair keeps both public identifiers exact', () => {
  assert.equal(stableLeaseTermRoute('/pdtf/LeaseTerm'), '/pdtf/LeaseTerm');
  assert.equal(stableLeaseTermRoute('/pdtf/leaseTerm'), '/pdtf/leaseTerm');
  assert.equal(stableLeaseTermRoute('/pdtf/Property'), '/pdtf/Property');
  assert.equal(getAcceptedRoute('/v2/comparison'), '/spdtf/property-pack/pdtf-schema-lineage');
  assert.equal(getAcceptedRoute('/pdtf/LeaseTerm'), '/pdtf/LeaseTerm');
  assert.equal(getAcceptedRoute('/pdtf/leaseTerm'), '/pdtf/leaseTerm');
  assert.equal(getDeclaredRouteReplacement('/pdtf/LeaseTerm'), null);
  assert.equal(getDeclaredRouteReplacement('/pdtf/Property'), null);
});

function hasExactPair(root) {
  return readdirSync(path.join(root, 'dist', 'pdtf')).includes('LeaseTerm')
    && readdirSync(path.join(root, 'dist', 'pdtf')).includes('leaseTerm');
}

test('case-sensitive LeaseTerm HTML and Turtle outputs are distinct and typed', (t) => {
  const root = fixtureRoot();
  try {
    if (!hasExactPair(root)) return t.skip('case-insensitive local filesystem cannot hold both fixture paths');
    const evidence = inspectLeaseTermCaseCollision(root);
    assert.notEqual(evidence.propertyRawSha256, evidence.classRawSha256);
    assert.notEqual(evidence.propertyContentSha256, evidence.classContentSha256);
    assert.notEqual(evidence.propertyTtlSha256, evidence.classTtlSha256);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('case-insensitive release output reports the required filesystem boundary', (t) => {
  const root = fixtureRoot();
  try {
    if (hasExactPair(root)) return t.skip('fixture filesystem is case-sensitive');
    assert.throws(
      () => inspectLeaseTermCaseCollision(root),
      /case-sensitive filesystem is required/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('collision receipt binds two distinct stable resource records', (t) => {
  const root = fixtureRoot();
  try {
    if (!hasExactPair(root)) return t.skip('case-insensitive local filesystem cannot hold both fixture paths');
    const routes = [{
      baselineRoute: '/pdtf/LeaseTerm', baselineFile: 'pdtf/LeaseTerm/index.html',
      acceptedRoute: '/pdtf/LeaseTerm', acceptedFile: 'pdtf/LeaseTerm/index.html',
      acceptedRawSha256: 'a'.repeat(64),
    }];
    const addedRoutes = [{
      acceptedRoute: '/pdtf/leaseTerm', acceptedFile: 'pdtf/leaseTerm/index.html',
      kind: 'new-authority-route',
      acceptedRawSha256: 'b'.repeat(64),
    }];
    const receipt = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes);
    assert.equal(receipt.propertyRoute, '/pdtf/leaseTerm');
    assert.equal(receipt.classRoute, '/pdtf/LeaseTerm');
    assert.equal(receipt.propertyFile, 'pdtf/leaseTerm/index.html');
    assert.equal(receipt.classFile, 'pdtf/LeaseTerm/index.html');
    assert.equal(validateLeaseTermCaseCollisionReceipt(null, receipt, routes, addedRoutes), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('collision inspection fails when either exact case-sensitive output is absent', () => {
  const root = fixtureRoot();
  try {
    rmSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.classTtlFile));
    assert.throws(
      () => inspectLeaseTermCaseCollision(root),
      /(?:missing exact path|case-sensitive filesystem is required)/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
