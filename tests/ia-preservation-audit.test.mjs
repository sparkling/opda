import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const preservationScript = fileURLToPath(
  new URL('../scripts/check-ia-preservation.mjs', import.meta.url),
);
const readRouteBaseline = () => JSON.parse(
  readFileSync(new URL('../src/data/ia-route-baseline.json', import.meta.url), 'utf8'),
);
const run = (...args) => spawnSync(process.execPath, [preservationScript, ...args], {
  cwd: projectRoot,
  encoding: 'utf8',
});

function withRouteFixture(mutate, verify) {
  const directory = mkdtempSync(path.join(tmpdir(), 'opda-ia-preservation-'));
  const fixture = path.join(directory, 'route-baseline.json');
  try {
    const candidate = structuredClone(readRouteBaseline());
    mutate(candidate);
    writeFileSync(fixture, JSON.stringify(candidate));
    verify(run('--manifest-only', `--route-manifest=${fixture}`));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('preservation checker validates clean and strict CLI boundaries', () => {
  const clean = run('--manifest-only');
  assert.equal(clean.status, 0, clean.stderr || clean.stdout);

  const strictWithoutBaseline = run('--strict');
  assert.notEqual(strictWithoutBaseline.status, 0);
  assert.match(`${strictWithoutBaseline.stdout}${strictWithoutBaseline.stderr}`, /baseline-root/u);

  const unknown = run('--unexpected');
  assert.notEqual(unknown.status, 0);
  assert.match(`${unknown.stdout}${unknown.stderr}`, /unknown/u);

  const duplicate = run('--strict', '--strict');
  assert.notEqual(duplicate.status, 0);
  assert.match(`${duplicate.stdout}${duplicate.stderr}`, /duplicate/u);
});

test('preservation checker rejects an unbound semantic replacement mutation', () => {
  withRouteFixture((candidate) => {
    const semantic = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.semanticReframeBlocks)
      .find(Boolean);
    semantic.replacementBlockSha256 = '0'.repeat(64);
  }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /semantic reframe block/u);
  });
});

test('preservation checker rejects an unbound navigation-copy supersession', () => {
  withRouteFixture((candidate) => {
    const supersession = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.nonInformationBlocks)
      .find(Boolean);
    supersession.destinationRoute = '/not-a-real-destination';
  }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /non-information supersession/u);
  });
});

test('preservation checker rejects invalid navigation-copy provenance evidence', () => {
  withRouteFixture((candidate) => {
    const supersession = candidate.routes
      .flatMap(({ retentionReceipt }) => retentionReceipt.nonInformationBlocks)
      .find(({ sourceEvidence }) => sourceEvidence === 'containing-link');
    assert.ok(supersession, 'the receipt must include baseline-link provenance');
    supersession.sourceEvidence = 'declared-original-destination';
  }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /non-information supersession/u);
  });
});
