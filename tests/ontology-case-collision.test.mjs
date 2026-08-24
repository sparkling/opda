import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
import { createCaptureEvidence } from '../scripts/lib/ia-capture-evidence.mjs';
import { informationContract } from '../scripts/lib/ia-preservation-contract.mjs';
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

test('the LeaseTerm pair uses lowercase type-scoped routes without aliases', () => {
  assert.equal(stableLeaseTermRoute('/pdtf/LeaseTerm'), '/pdtf/classes/lease-term');
  assert.equal(stableLeaseTermRoute('/pdtf/leaseTerm'), '/pdtf/object-properties/lease-term');
  assert.equal(stableLeaseTermRoute('/pdtf/Property'), '/pdtf/Property');
  assert.equal(getAcceptedRoute('/v2/comparison'), '/spdtf/property-pack/pdtf-schema-lineage');
  assert.equal(getAcceptedRoute('/pdtf/LeaseTerm'), '/pdtf/classes/lease-term');
  assert.equal(getAcceptedRoute('/pdtf/leaseTerm'), '/pdtf/object-properties/lease-term');
  assert.equal(getDeclaredRouteReplacement('/pdtf/LeaseTerm'), '/pdtf/classes/lease-term');
  assert.equal(getDeclaredRouteReplacement('/pdtf/leaseTerm'), '/pdtf/object-properties/lease-term');
  assert.equal(getDeclaredRouteReplacement('/pdtf/Property'), null);
  for (const route of [LEASE_TERM_CASE_COLLISION.classRoute, LEASE_TERM_CASE_COLLISION.propertyRoute]) {
    assert.equal(route, route.toLowerCase());
  }
  assert.equal(LEASE_TERM_CASE_COLLISION.classRoute, '/pdtf/classes/lease-term');
  assert.equal(LEASE_TERM_CASE_COLLISION.propertyRoute, '/pdtf/object-properties/lease-term');
});

test('the frozen mis-cased property evidence is retained at the lowercase identifier', () => {
  const root = mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '.case-evidence-'));
  try {
    const ledger = path.join(root, 'ledger.json');
    writeFileSync(ledger, JSON.stringify({
      schemaVersion: 1,
      baselineCommit: 'b'.repeat(40),
      entries: [],
    }));
    const { captureRetentionReceipt } = createCaptureEvidence({
      semanticLedgerPath: ledger,
      baselineCommit: 'b'.repeat(40),
    });
    const property = informationContract(
      '<main><h1>lease term</h1><p>Object property linking an estate to its term.</p></main>',
    );
    const leaseClass = informationContract(
      '<main><h1>Lease Term</h1><p>Class representing a bounded lease interval.</p></main>',
    );
    const accepted = new Map([
      [LEASE_TERM_CASE_COLLISION.classRoute, leaseClass],
      [LEASE_TERM_CASE_COLLISION.propertyRoute, property],
    ]);
    const receipt = captureRetentionReceipt(
      LEASE_TERM_CASE_COLLISION.legacyClassRoute, property, accepted, new Map(),
      { includeAllocation: true },
    );
    assert.deepEqual(
      receipt.targetEvidence.map(({ route }) => route),
      [LEASE_TERM_CASE_COLLISION.classRoute, LEASE_TERM_CASE_COLLISION.propertyRoute],
    );
    assert.equal(receipt.exactRetainedBlocks, 2);
    assert.deepEqual(
      receipt.exactRetainedBlockRecords.map(({ targetRoute }) => targetRoute),
      [LEASE_TERM_CASE_COLLISION.propertyRoute, LEASE_TERM_CASE_COLLISION.propertyRoute],
    );
    assert.equal(receipt.semanticReframeBlockCount, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('type-scoped LeaseTerm HTML and Turtle outputs are distinct and typed', () => {
  const root = fixtureRoot();
  try {
    const evidence = inspectLeaseTermCaseCollision(root);
    assert.notEqual(evidence.propertyRawSha256, evidence.classRawSha256);
    assert.notEqual(evidence.propertyContentSha256, evidence.classContentSha256);
    assert.notEqual(evidence.propertyTtlSha256, evidence.classTtlSha256);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('route receipt binds two distinct type-scoped resource records', () => {
  const root = fixtureRoot();
  try {
    const sourceReceipt = {
      policy: 'case-sensitive-stable-resource-pair-v2',
      classRoute: LEASE_TERM_CASE_COLLISION.legacyClassRoute,
      propertyRoute: LEASE_TERM_CASE_COLLISION.legacyPropertyRoute,
      classIri: LEASE_TERM_CASE_COLLISION.classIri,
      propertyIri: LEASE_TERM_CASE_COLLISION.propertyIri,
    };
    const routes = [{
      baselineRoute: '/pdtf/LeaseTerm', baselineFile: 'pdtf/LeaseTerm/index.html',
      acceptedRoute: LEASE_TERM_CASE_COLLISION.classRoute,
      acceptedFile: LEASE_TERM_CASE_COLLISION.classFile,
      acceptedRawSha256: 'a'.repeat(64),
    }];
    const addedRoutes = [{
      acceptedRoute: LEASE_TERM_CASE_COLLISION.propertyRoute,
      acceptedFile: LEASE_TERM_CASE_COLLISION.propertyFile,
      kind: 'new-authority-route',
      acceptedRawSha256: 'b'.repeat(64),
    }];
    const receipt = composeLeaseTermCaseCollisionReceipt(root, routes, addedRoutes, sourceReceipt);
    assert.equal(receipt.propertyRoute, '/pdtf/object-properties/lease-term');
    assert.equal(receipt.classRoute, '/pdtf/classes/lease-term');
    assert.equal(receipt.propertyFile, 'pdtf/object-properties/lease-term/index.html');
    assert.equal(receipt.classFile, 'pdtf/classes/lease-term/index.html');
    assert.equal(receipt.sourcePolicy, 'case-sensitive-stable-resource-pair-v2');
    assert.match(receipt.sourceReceiptSha256, /^[a-f0-9]{64}$/u);
    assert.equal(
      validateLeaseTermCaseCollisionReceipt(null, receipt, routes, addedRoutes, sourceReceipt),
      true,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('route inspection fails when either type-scoped output is absent', () => {
  const root = fixtureRoot();
  try {
    rmSync(path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.classTtlFile));
    assert.throws(
      () => inspectLeaseTermCaseCollision(root),
      /output is missing/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('route inspection rejects any emitted case-only legacy representation', () => {
  const root = fixtureRoot();
  try {
    const legacy = path.join(root, 'dist', LEASE_TERM_CASE_COLLISION.legacyClassTtlFile);
    mkdirSync(path.dirname(legacy), { recursive: true });
    writeFileSync(legacy, 'retired');
    assert.throws(
      () => inspectLeaseTermCaseCollision(root),
      /retired case-only resource output is still emitted/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
