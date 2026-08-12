import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  PRIVACY_NOTICE_VERSION,
  createVerification,
  parseVerificationToken,
  registrationKey,
  validateRegistration,
} from '../config/aws/working-group-interest/domain.mjs';
import {
  createHandler,
  pendingPutInput,
  verificationMessage,
} from '../config/aws/working-group-interest/index.mjs';

const NOW = Date.UTC(2026, 7, 12, 12);

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
    turnstileToken: 'turnstile-token',
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
      getConfig: async () => ({
        emailHmacSecret: 'hmac-secret',
        turnstileSecret: 'turnstile-secret',
        postmarkServerToken: 'postmark-token',
        postmarkFrom: 'smartdata@openpropdata.org.uk',
        postmarkVerificationTemplateAlias: 'working-group-interest-verification',
        siteOrigin: 'https://opda.org.uk',
      }),
      verifyTurnstile: async () => true,
      createPending: async (record) => { calls.push(['createPending', record]); return true; },
      sendVerification: async (record, token) => { calls.push(['sendVerification', record, token]); return 'message-id'; },
      markSent: async (...args) => { calls.push(['markSent', ...args]); },
      deletePending: async (...args) => { calls.push(['deletePending', ...args]); },
      getRegistration: async () => null,
      markVerified: async (...args) => { calls.push(['markVerified', ...args]); return true; },
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

test('verification tokens are opaque, hashed and strictly parsed', () => {
  const id = registrationKey('Ada@example.com', 'secret');
  const verification = createVerification(id, Buffer.alloc(32, 7));
  const parsed = parseVerificationToken(verification.token);
  assert.deepEqual(parsed, { registrationId: id, tokenHash: verification.tokenHash });
  assert.equal(verification.token.includes('Ada@example.com'), false);
  assert.equal(parseVerificationToken(`${verification.token}x`), null);
});

test('registration enforces JSON and the 16KB boundary', async () => {
  const handler = createHandler(dependencies().values);
  const wrongType = await handler({ ...event('POST /api/working-group-interest', payload()), headers: {} });
  assert.equal(wrongType.statusCode, 415);
  const oversized = await handler({
    ...event('POST /api/working-group-interest', payload()),
    body: JSON.stringify({ value: 'x'.repeat(17 * 1024) }),
  });
  assert.equal(oversized.statusCode, 413);
});

test('honeypot and implausible timing return a generic response without side effects', async () => {
  for (const suspicious of [payload({ website: 'spam.example' }), payload({ startedAt: NOW - 100 })]) {
    const deps = dependencies();
    const response = await createHandler(deps.values)(event('POST /api/working-group-interest', suspicious));
    assert.equal(response.statusCode, 202);
    assert.deepEqual(deps.calls, []);
  }
});

test('a valid registration is stored before one verification email is sent', async () => {
  const deps = dependencies();
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 202);
  assert.deepEqual(deps.calls.map(([name]) => name), ['createPending', 'sendVerification', 'markSent']);
  const record = deps.calls[0][1];
  assert.equal(record.email, 'ada@example.com');
  assert.equal(record.status, 'pending-email-verification');
  assert.equal(record.expiresAt, Math.floor(NOW / 1000) + 30 * 24 * 60 * 60);
});

test('an application-expired pending record can be atomically replaced before TTL cleanup', () => {
  const request = pendingPutInput({
    registrationKey: 'a'.repeat(64),
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    organisation: 'Example',
    role: 'Specialist',
    workingGroups: ['conveyancing'],
    contributions: ['review-model-candidates'],
    relevantPerspective: '',
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    status: 'pending-email-verification',
    createdAt: NOW,
    updatedAt: NOW,
    verificationTokenHash: 'b'.repeat(64),
    verificationExpiresAt: NOW + 1_000,
    expiresAt: Math.floor(NOW / 1000) + 1_000,
  }, 'registrations');
  assert.match(request.ConditionExpression, /expiresAt < :nowEpoch/u);
  assert.equal(request.ExpressionAttributeValues[':nowEpoch'].N, String(Math.floor(NOW / 1000)));
});

test('duplicate registration is indistinguishable and does not send another email', async () => {
  const deps = dependencies({ createPending: async () => false });
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 202);
  assert.deepEqual(deps.calls, []);
});

test('Turnstile failure blocks storage with a field-level error', async () => {
  const deps = dependencies({ verifyTurnstile: async () => false });
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 400);
  assert.match(JSON.parse(response.body).errors.turnstileToken, /anti-spam/u);
  assert.deepEqual(deps.calls, []);
});

test('definite Postmark rejection releases only the matching pending registration', async () => {
  const deps = dependencies({ sendVerification: async () => {
    const error = new Error('rejected');
    error.retrySafe = true;
    throw error;
  } });
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 503);
  assert.deepEqual(deps.calls.map(([name]) => name), ['createPending', 'deletePending']);
});

test('ambiguous Postmark failure keeps the reservation to prevent duplicate mail', async () => {
  const deps = dependencies({ sendVerification: async () => { throw new Error('timeout'); } });
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 503);
  assert.deepEqual(deps.calls.map(([name]) => name), ['createPending']);
});

test('persistence failure after Postmark acceptance keeps the reservation', async () => {
  const deps = dependencies({ markSent: async () => { throw new Error('unavailable'); } });
  const response = await createHandler(deps.values)(event('POST /api/working-group-interest', payload()));
  assert.equal(response.statusCode, 503);
  assert.deepEqual(deps.calls.map(([name]) => name), ['createPending', 'sendVerification']);
});

test('verification email keeps the one-time token out of the request URL', async () => {
  const id = registrationKey('ada@example.com', 'hmac-secret');
  const { token } = createVerification(id, Buffer.alloc(32, 12));
  const message = verificationMessage({
    email: 'ada@example.com',
    fullName: 'Ada Lovelace',
    workingGroups: ['conveyancing'],
  }, token, {
    siteOrigin: 'https://opda.org.uk',
    postmarkFrom: 'smartdata@openpropdata.org.uk',
    postmarkVerificationTemplateAlias: 'working-group-interest-verification',
  });
  const verificationUrl = new URL(message.TemplateModel.verification_url);
  assert.equal(verificationUrl.search, '');
  assert.match(verificationUrl.hash, /^#token=/u);
  assert.equal(message.TrackOpens, false);
  assert.equal(message.TrackLinks, 'None');
});

test('verification templates consume the exact runtime model without remote assets', () => {
  const html = fs.readFileSync(
    new URL('../docs/templates/working-group-interest-verification-email.html', import.meta.url),
    'utf8',
  );
  const plain = fs.readFileSync(
    new URL('../docs/templates/working-group-interest-verification-email.txt', import.meta.url),
    'utf8',
  );
  for (const variable of ['full_name', 'verification_url', 'working_groups', 'expiry_hours']) {
    const placeholders = [`{{${variable}}}`, `{{{${variable}}}}`];
    assert.equal(placeholders.some((placeholder) => html.includes(placeholder)), true);
    assert.equal(placeholders.some((placeholder) => plain.includes(placeholder)), true);
  }
  assert.doesNotMatch(html, /<img\b|https?:\/\/(?!opda\.org\.uk\/working-groups\/join)/iu);
  assert.match(html, /verification is not automatic admission/iu);
});

test('GET confirmation cannot mutate state', async () => {
  const deps = dependencies();
  const response = await createHandler(deps.values)({
    routeKey: 'GET /api/working-group-interest/confirm',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(response.statusCode, 405);
  assert.deepEqual(deps.calls, []);
});

test('confirmation accepts a live token once and rejects invalid, expired or replayed tokens', async () => {
  const id = registrationKey('ada@example.com', 'hmac-secret');
  const verification = createVerification(id, Buffer.alloc(32, 9));
  const parsed = parseVerificationToken(verification.token);

  const validDeps = dependencies({
    getRegistration: async () => ({
      status: 'pending-email-verification',
      verificationTokenHash: parsed.tokenHash,
      verificationExpiresAt: NOW + 1_000,
    }),
  });
  const valid = await createHandler(validDeps.values)(event(
    'POST /api/working-group-interest/confirm',
    { token: verification.token },
  ));
  assert.equal(valid.statusCode, 200);
  assert.deepEqual(validDeps.calls.map(([name]) => name), ['markVerified']);

  for (const record of [
    null,
    { status: 'pending-email-verification', verificationTokenHash: '0'.repeat(64), verificationExpiresAt: NOW + 1_000 },
    { status: 'pending-email-verification', verificationTokenHash: parsed.tokenHash, verificationExpiresAt: NOW - 1 },
  ]) {
    const deps = dependencies({ getRegistration: async () => record });
    const response = await createHandler(deps.values)(event(
      'POST /api/working-group-interest/confirm',
      { token: verification.token },
    ));
    assert.equal(response.statusCode, 400);
    assert.deepEqual(deps.calls, []);
  }

  const replay = await createHandler(dependencies({
    getRegistration: async () => ({ status: 'verified' }),
  }).values)(event('POST /api/working-group-interest/confirm', { token: verification.token }));
  assert.equal(replay.statusCode, 400);
});
