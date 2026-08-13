import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRIVACY_NOTICE_VERSION,
  REGISTRATION_RETENTION_SECONDS,
  validateRegistration,
} from '../config/aws/working-group-interest/domain.mjs';
import {
  createHandler,
  registrationPutInput,
} from '../config/aws/working-group-interest/index.mjs';

const NOW = Date.UTC(2026, 7, 13, 12);

function payload(overrides = {}) {
  return {
    fullName: 'Ada Lovelace',
    email: 'Ada@example.com',
    organisation: 'Example Property Ltd',
    role: 'Property data specialist',
    workingGroups: ['property-technology'],
    contributions: ['review-model-candidates'],
    relevantPerspective: 'I work with property integrations.',
    acknowledgement: true,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    website: '',
    startedAt: NOW - 10_000,
    ...overrides,
  };
}

function event(routeKey, body, overrides = {}) {
  return {
    routeKey,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    ...overrides,
  };
}

function dependencies(overrides = {}) {
  const calls = [];
  return {
    calls,
    values: {
      now: () => NOW,
      newId: () => 'registration-id',
      storeRegistration: async (record) => { calls.push(record); },
      ...overrides,
    },
  };
}

test('registration validation normalises valid input and rejects unknown, HTML and invalid selections', () => {
  const valid = validateRegistration(payload());
  assert.equal(valid.ok, true);
  assert.equal(valid.value.email, 'ada@example.com');

  for (const invalid of [
    payload({ unexpected: 'field' }),
    payload({ fullName: '<b>Ada</b>' }),
    payload({ workingGroups: ['unknown'] }),
    payload({ workingGroups: ['not-sure', 'conveyancing'] }),
    payload({ relevantPerspective: 'hello\u0000world' }),
    payload({ privacyNoticeVersion: 'old' }),
  ]) {
    assert.equal(validateRegistration(invalid).ok, false);
  }
});

test('registration validation accepts the Finance and Banking working group', () => {
  const result = validateRegistration(payload({ workingGroups: ['finance-and-banking'] }));

  assert.equal(result.ok, true);
  assert.deepEqual(result.value.workingGroups, ['finance-and-banking']);
});

test('registration enforces the route, JSON content type and 16KB boundary', async () => {
  const handler = createHandler(dependencies().values);
  assert.equal((await handler(event('GET /api/working-group-interest', {}))).statusCode, 405);
  assert.equal((await handler(event('POST /api/other', {}))).statusCode, 404);
  assert.equal((await handler({ ...event('POST /api/working-group-interest', payload()), headers: {} })).statusCode, 415);
  assert.equal((await handler({
    ...event('POST /api/working-group-interest', payload()),
    body: JSON.stringify({ value: 'x'.repeat(17 * 1024) }),
  })).statusCode, 413);
});

test('honeypot and implausible timing return success without storing data', async () => {
  for (const suspicious of [payload({ website: 'spam.example' }), payload({ startedAt: NOW - 100 })]) {
    const deps = dependencies();
    const response = await createHandler(deps.values)(event('POST /api/working-group-interest', suspicious));
    assert.equal(response.statusCode, 201);
    assert.deepEqual(deps.calls, []);
  }
});

test('a valid expression of interest is stored once and acknowledged', async () => {
  const deps = dependencies();
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 201);
  assert.equal(JSON.parse(response.body).state, 'received');
  assert.equal(deps.calls.length, 1);
  assert.deepEqual(deps.calls[0], {
    registrationId: 'registration-id',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    organisation: 'Example Property Ltd',
    role: 'Property data specialist',
    workingGroups: ['property-technology'],
    contributions: ['review-model-candidates'],
    relevantPerspective: 'I work with property integrations.',
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    createdAt: NOW,
    expiresAt: Math.floor(NOW / 1000) + REGISTRATION_RETENTION_SECONDS,
  });
});

test('DynamoDB input contains the registration and uses an idempotent generated key', () => {
  const request = registrationPutInput({
    registrationId: 'registration-id',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    organisation: 'Example',
    role: 'Specialist',
    workingGroups: ['conveyancing'],
    contributions: ['review-model-candidates'],
    relevantPerspective: '',
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    createdAt: NOW,
    expiresAt: Math.floor(NOW / 1000) + REGISTRATION_RETENTION_SECONDS,
  }, 'registrations');
  assert.equal(request.TableName, 'registrations');
  assert.equal(request.Item.registrationId.S, 'registration-id');
  assert.equal(request.Item.status.S, 'received');
  assert.equal(request.Item.email.S, 'ada@example.com');
  assert.equal(request.ConditionExpression, 'attribute_not_exists(registrationId)');
});

test('storage failure returns a retryable service error without leaking details', async () => {
  const handler = createHandler(dependencies({
    storeRegistration: async () => { throw new Error('secret internal detail'); },
  }).values);
  const response = await handler(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 503);
  assert.doesNotMatch(response.body, /secret internal detail/u);
});
