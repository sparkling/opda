import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  LEASE_TERM_CASE_COLLISION,
  acceptedLeaseTermRoute,
  composeLeaseTermCaseCollisionReceipt,
  inspectLeaseTermCaseCollision,
  validateLeaseTermCaseCollisionReceipt,
} from '../src/lib/ontology-case-collision.mjs';
import {
  getAcceptedRoute,
  getDeclaredRouteReplacement,
} from '../src/lib/site-route-migrations.mjs';

function fixtureRoot() {
  const root = mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '.case-collision-'));
  for (const relative of [
    LEASE_TERM_CASE_COLLISION.acceptedFile,
    LEASE_TERM_CASE_COLLISION.recoveredFile,
    LEASE_TERM_CASE_COLLISION.acceptedTtlFile,
    LEASE_TERM_CASE_COLLISION.recoveredTtlFile,
  ]) mkdirSync(path.dirname(path.join(root, 'dist', relative)), { recursive: true });
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.acceptedFile),
    '<main><h1>lease term</h1><p>Relates a legal estate to its lease term.</p></main>');
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.recoveredFile),
    '<main><h1>Lease Term</h1><p>A bounded time interval for a leasehold estate.</p></main>');
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.acceptedTtlFile),
    `<${LEASE_TERM_CASE_COLLISION.acceptedIri}> a owl:ObjectProperty ; rdfs:range <${LEASE_TERM_CASE_COLLISION.recoveredIri}> .\n<${LEASE_TERM_CASE_COLLISION.recoveredIri}> a owl:Class .`);
  writeFileSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.recoveredTtlFile),
    `<${LEASE_TERM_CASE_COLLISION.recoveredIri}> a owl:Class .\n<${LEASE_TERM_CASE_COLLISION.acceptedIri}> a owl:ObjectProperty .`);
  return root;
}

test('the LeaseTerm collision maps the historical masked route to leaseTerm', () => {
  assert.equal(acceptedLeaseTermRoute('/pdtf/LeaseTerm'), '/pdtf/leaseTerm');
  assert.equal(acceptedLeaseTermRoute('/pdtf/leaseTerm'), '/pdtf/leaseTerm');
  assert.equal(acceptedLeaseTermRoute('/pdtf/Property'), '/pdtf/Property');
  assert.equal(getAcceptedRoute('/v2/comparison'), '/spdtf-2/property-pack/pdtf-1-lineage');
  assert.equal(getDeclaredRouteReplacement('/pdtf/LeaseTerm'), '/pdtf/leaseTerm');
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
    assert.notEqual(evidence.acceptedRawSha256, evidence.recoveredRawSha256);
    assert.notEqual(evidence.acceptedContentSha256, evidence.recoveredContentSha256);
    assert.notEqual(evidence.acceptedTtlSha256, evidence.recoveredTtlSha256);
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

test('collision receipt binds the historical record and recovered addition', (t) => {
  const root = fixtureRoot();
  try {
    if (!hasExactPair(root)) return t.skip('case-insensitive local filesystem cannot hold both fixture paths');
    const routes = [{
      baselineRoute: '/pdtf/LeaseTerm', baselineFile: 'pdtf/LeaseTerm/index.html',
      acceptedRoute: '/pdtf/leaseTerm', acceptedFile: 'pdtf/leaseTerm/index.html',
      baselineRawSha256: 'a'.repeat(64),
    }];
    const addedRoutes = [{
      acceptedRoute: '/pdtf/LeaseTerm', acceptedFile: 'pdtf/LeaseTerm/index.html',
      kind: 'new-authority-route',
      acceptedRawSha256: 'b'.repeat(64),
    }];
    const receipt = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes);
    assert.equal(receipt.sourceRoute, '/pdtf/LeaseTerm');
    assert.equal(receipt.acceptedRoute, '/pdtf/leaseTerm');
    assert.equal(receipt.recoveredRoute, '/pdtf/LeaseTerm');
    assert.equal(receipt.acceptedFile, 'pdtf/leaseTerm/index.html');
    assert.equal(receipt.recoveredFile, 'pdtf/LeaseTerm/index.html');
    assert.equal(validateLeaseTermCaseCollisionReceipt(null, receipt, routes, addedRoutes), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('collision inspection fails when either exact case-sensitive output is absent', () => {
  const root = fixtureRoot();
  try {
    rmSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.recoveredTtlFile));
    assert.throws(
      () => inspectLeaseTermCaseCollision(root),
      /(?:missing exact path|case-sensitive filesystem is required)/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
