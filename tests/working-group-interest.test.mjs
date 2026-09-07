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
    payload({ workingGroups: ['not-sure'] }),
    payload({ contributions: ['contribute-consumer-accessibility-regulatory-public-interest-experience'] }),
    payload({ relevantPerspective: 'hello\u0000world' }),
    payload({ privacyNoticeVersion: 'old' }),
  ]) {
    assert.equal(validateRegistration(invalid).ok, false);
  }
});

test('registration accepts commercial and public-interest contributions independently or together', () => {
  for (const contributions of [
    ['represent-commercial-interests'],
    ['represent-public-interests'],
    ['represent-commercial-interests', 'represent-public-interests'],
  ]) {
    const result = validateRegistration(payload({ contributions }));
    assert.equal(result.ok, true);
    assert.deepEqual(result.value.contributions, contributions);
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

test('honeypot submissions return the same harmless decoy for every client timing', async () => {
  for (const startedAt of [NOW - 10_000, NOW - 100, NOW, NOW + 300_000, NOW - 300_000]) {
    const deps = dependencies({ newId: () => assert.fail('a decoy must not allocate a registration') });
    const suspicious = payload({ website: 'spam.example', startedAt });
    const response = await createHandler(deps.values)(event('POST /api/working-group-interest', suspicious));
    assert.equal(response.statusCode, 201);
    assert.deepEqual(JSON.parse(response.body), {
      ok: true,
      state: 'received',
      message: 'Your expression of interest has been received.',
    });
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.deepEqual(deps.calls, []);
  }
});

for (const [scenario, clockOffset, completionTime] of [
  ['five minutes ahead', 300_000, 10_000],
  ['ten seconds ahead, appearing simultaneous', 10_000, 10_000],
  ['eight seconds ahead, appearing too fast', 8_000, 10_000],
  ['just inside the former timing threshold', 7_001, 10_000],
  ['exactly at the former timing threshold', 7_000, 10_000],
  ['five minutes behind', -300_000, 10_000],
  ['one day behind', -86_400_000, 10_000],
  ['not skewed, with a fast completion', 0, 100],
  ['not skewed, with a long completion', 0, 3 * 86_400_000],
]) {
  test(`valid registration is stored when the client clock is ${scenario}`, async () => {
    const deps = dependencies();
    const startedAt = NOW - completionTime + clockOffset;
    const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload({ startedAt })));

    assert.equal(response.statusCode, 201);
    assert.equal(deps.calls.length, 1, 'success must follow a stored registration, not a timing decoy');
    assert.equal(deps.calls[0].createdAt, NOW, 'record timestamps use the server clock');
    assert.equal(deps.calls[0].expiresAt, Math.floor(NOW / 1000) + REGISTRATION_RETENTION_SECONDS);
    assert.equal('startedAt' in deps.calls[0], false, 'client timing is not persisted');
    assert.deepEqual(JSON.parse(response.body), {
      ok: true,
      state: 'received',
      message: 'Your expression of interest has been received.',
    });
  });
}

test('malformed client timestamps remain validation errors rather than success decoys', async () => {
  for (const startedAt of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1, 'invalid', undefined]) {
    const deps = dependencies();
    const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload({ startedAt })));

    assert.equal(response.statusCode, 400);
    assert.deepEqual(JSON.parse(response.body), { ok: false, errors: { form: 'The submission is invalid.' } });
    assert.deepEqual(deps.calls, []);
  }
});

test('a valid expression of interest is stored once and acknowledged', async () => {
  const deps = dependencies();
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 201);
  assert.deepEqual(JSON.parse(response.body), {
    ok: true,
    state: 'received',
    message: 'Your expression of interest has been received.',
  });
  assert.match(response.headers['content-type'], /^application\/json/u);
  assert.equal(response.headers['cache-control'], 'no-store');
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

test('a clock-skewed registration is acknowledged only after storage completes', async () => {
  let finishStorage;
  const pendingStorage = new Promise((resolve) => { finishStorage = resolve; });
  let writes = 0;
  const handler = createHandler(dependencies({
    storeRegistration: async () => { writes += 1; await pendingStorage; },
  }).values);
  let settled = false;
  const pendingResponse = handler(event('POST /api/working-group-interest', payload({ startedAt: NOW + 300_000 })));
  void pendingResponse.then(() => { settled = true; });

  await Promise.resolve();
  const settledBeforeStorage = settled;
  finishStorage();
  const response = await pendingResponse;

  assert.equal(writes, 1);
  assert.equal(settledBeforeStorage, false);
  assert.equal(response.statusCode, 201);
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

test('storage failure returns a retryable service error without leaking details even with clock skew', async () => {
  for (const startedAt of [NOW - 10_000, NOW - 100, NOW + 300_000]) {
    let writes = 0;
    const handler = createHandler(dependencies({
      storeRegistration: async () => { writes += 1; throw new Error('secret internal detail'); },
    }).values);
    const response = await handler(event('POST /api/working-group-interest', payload({ startedAt })));

    assert.equal(writes, 1);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(JSON.parse(response.body), {
      ok: false,
      message: 'Registration is temporarily unavailable. Please try again shortly.',
    });
  }
});
