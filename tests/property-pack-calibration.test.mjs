import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalBytes, compareCandidates, loadInputs, makeWorkOrders, parseClaudeEnvelope, promptFor,
  scoreCandidate, validateCandidate,
} from '../scripts/_lib/property-pack-calibration.mjs';

const { config, catalogue } = loadInputs();
const orders = makeWorkOrders(config, catalogue);

function candidateFor(order, suffix = '') {
  return {
    schemaVersion: '1.0',
    workOrderId: order.workOrderId,
    itemDecisions: order.itemIds.map((itemId, index) => ({
      itemId,
      disposition: 'model',
      semanticHome: order.candidateHomes[0],
      consumingContexts: [],
      roles: ['attribute'],
      constructRefs: [`https://w3id.org/opda/candidate/property-pack/0.1/${order.workOrderId.split(':').at(-1)}/construct-${index}${suffix}`],
      evidenceRefs: [order.evidenceSnapshot[index].evidenceRefs[0]],
      rationale: 'A bounded calibration proposal requiring human review.',
      retainedConcerns: [1, 7, 9],
    })),
    resources: order.itemIds.map((itemId, index) => ({
      iri: `https://w3id.org/opda/candidate/property-pack/0.1/${order.workOrderId.split(':').at(-1)}/construct-${index}${suffix}`,
      kind: 'datatype-property',
      semanticHome: order.candidateHomes[0],
      label: `Candidate ${index}`,
      definition: `A candidate construct covering ${itemId}.`,
      identityCriterion: 'A property is identified by this candidate IRI.',
      evidenceRefs: [order.evidenceSnapshot[index].evidenceRefs[0]],
    })),
    competencyAnswers: order.competencyQuestions.map((question) => `Candidate answer to: ${question}`),
    assumptions: [],
    unresolvedIssues: [],
  };
}

test('calibration manifest pins 24 diverse, existing source items and independent routes', () => {
  assert.equal(orders.length, 8);
  const ids = orders.flatMap((order) => order.itemIds);
  assert.equal(ids.length, 24);
  assert.equal(new Set(ids).size, 24);
  assert.ok(ids.every((id) => catalogue.some((record) => record.id === id)));
  assert.equal(new Set(Object.values(config.routes).map((route) => route.independenceGroup)).size, 2);
  assert.deepEqual(config.retainedConcerns, [1, 2, 5, 7, 8, 9, 10, 11]);
  assert.deepEqual(config.excludedConcerns, [3, 4, 6, 12, 13, 14]);
});

test('work orders and clean-prior prompts are byte stable', () => {
  const again = makeWorkOrders(config, catalogue);
  assert.equal(canonicalBytes(orders), canonicalBytes(again));
  for (const order of orders) {
    assert.match(order.workOrderDigest, /^[0-9a-f]{64}$/);
    const prompt = promptFor(order);
    assert.match(prompt, /UNTRUSTED_WORK_ORDER_JSON/);
    assert.doesNotMatch(prompt, /peer candidate|candidate from the other/i);
  }
});

test('candidate contract rejects unknown homes, evidence and excluded concerns', () => {
  const order = orders[0];
  const candidate = candidateFor(order);
  candidate.itemDecisions[0].semanticHome = 'legacy-json-tree';
  candidate.itemDecisions[1].evidenceRefs = ['invented:evidence'];
  candidate.itemDecisions[2].retainedConcerns.push(6);
  const errors = validateCandidate(candidate, order, config);
  assert.ok(errors.some((error) => /invalid home/.test(error)));
  assert.ok(errors.some((error) => /evidence closure/.test(error)));
  assert.ok(errors.some((error) => /excluded concern/.test(error)));
});

test('not-run semantic validation fails closed', () => {
  const order = orders[0];
  const candidate = candidateFor(order);
  const incomplete = scoreCandidate(candidate, order, config);
  assert.equal(incomplete.cells.rdf, 'not-run');
  assert.equal(incomplete.cells.shacl, 'not-run');
  assert.equal(incomplete.eligible, false);
  const validated = scoreCandidate(candidate, order, config, { rdf: 'pass', shacl: 'pass' });
  assert.equal(validated.maximum, 90);
  assert.equal(validated.score, 90);
  assert.equal(validated.eligible, true);
});

test('divergent eligible candidates trigger challenge without selecting a winner', () => {
  const order = orders[0];
  const first = candidateFor(order);
  const second = candidateFor(order, '-alternative');
  const validation = { rdf: 'pass', shacl: 'pass' };
  const comparison = compareCandidates(
    { candidate: first, score: scoreCandidate(first, order, config, validation) },
    { candidate: second, score: scoreCandidate(second, order, config, validation) },
    order,
  );
  assert.equal(comparison.status, 'dual-candidate');
  assert.equal(comparison.diverged, true);
  assert.equal(comparison.challengeRequired, true);
  assert.equal(comparison.challengeRecommended, true);
  assert.equal(comparison.humanDispositionRequired, true);
  assert.equal('winner' in comparison, false);
});

test('Claude event arrays expose structured output and attested model identity', () => {
  const payload = JSON.stringify([
    { type: 'system', subtype: 'init', model: 'claude-fable-5' },
    {
      type: 'result',
      is_error: false,
      structured_output: { answer: 'ok' },
      modelUsage: { 'claude-fable-5': { outputTokens: 1 } },
    },
  ]);
  const parsed = parseClaudeEnvelope(payload);
  assert.deepEqual(parsed.candidate, { answer: 'ok' });
  assert.equal(parsed.actualModel, 'claude-fable-5');
});
