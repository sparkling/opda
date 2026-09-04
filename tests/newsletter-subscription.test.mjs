import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  PRIVACY_NOTICE_VERSION,
  SUBSCRIPTION_RETENTION_SECONDS,
  validateSubscription,
} from '../config/aws/newsletter-subscription/domain.mjs';
import {
  createHandler,
  subscriptionPutInput,
} from '../config/aws/newsletter-subscription/index.mjs';

const NOW = Date.UTC(2026, 8, 3, 12);
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function payload(overrides = {}) {
  return {
    fullName: 'Ada Lovelace',
    email: 'Ada@example.com',
    organisation: 'Example Property Ltd',
    role: 'Property data specialist',
    workingGroups: ['property-technology'],
    consent: true,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    source: 'dialog',
    website: '',
    startedAt: NOW - 10_000,
    ...overrides,
  };
}

function jsonEvent(routeKey, body, overrides = {}) {
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
      subscriberId: () => 'subscriber-id',
      storeSubscription: async (record) => { calls.push(record); },
      ...overrides,
    },
  };
}

test('subscription validation normalises valid input and rejects unsafe or unconsented input', () => {
  const valid = validateSubscription(payload());
  assert.equal(valid.ok, true);
  assert.equal(valid.value.email, 'ada@example.com');

  for (const invalid of [
    payload({ unexpected: 'field' }),
    payload({ fullName: '<b>Ada</b>' }),
    payload({ workingGroups: ['unknown'] }),
    payload({ consent: false }),
    payload({ privacyNoticeVersion: 'old' }),
    payload({ source: 'unknown' }),
  ]) {
    assert.equal(validateSubscription(invalid).ok, false);
  }
});

test('the handler accepts JSON and native form submissions', async () => {
  const deps = dependencies();
  const handler = createHandler(deps.values);
  const jsonResponse = await handler(jsonEvent('POST /api/newsletter-subscription', payload()));
  assert.equal(jsonResponse.statusCode, 201);
  assert.deepEqual(JSON.parse(jsonResponse.body), { ok: true, state: 'received' });

  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(payload({ source: 'page' }))) {
    for (const item of Array.isArray(value) ? value : [value]) form.append(key, String(item));
  }
  const formResponse = await handler({
    routeKey: 'POST /api/newsletter-subscription',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  assert.equal(formResponse.statusCode, 303);
  assert.equal(formResponse.headers.location, '/subscribe/received');
  assert.equal(deps.calls.length, 2);
});

test('the newsletter boundary rejects wrong routes, media types and oversized bodies', async () => {
  const handler = createHandler(dependencies().values);
  assert.equal((await handler(jsonEvent('GET /api/newsletter-subscription', {}))).statusCode, 405);
  assert.equal((await handler(jsonEvent('POST /api/other', {}))).statusCode, 404);
  assert.equal((await handler({ ...jsonEvent('POST /api/newsletter-subscription', payload()), headers: {} })).statusCode, 415);
  assert.equal((await handler({
    ...jsonEvent('POST /api/newsletter-subscription', payload()),
    body: JSON.stringify({ value: 'x'.repeat(17 * 1024) }),
  })).statusCode, 413);
});

test('suspicious submissions receive the generic response without being stored', async () => {
  for (const suspicious of [payload({ website: 'spam.example' }), payload({ startedAt: NOW - 100 })]) {
    const deps = dependencies();
    const response = await createHandler(deps.values)(jsonEvent('POST /api/newsletter-subscription', suspicious));
    assert.equal(response.statusCode, 201);
    assert.deepEqual(deps.calls, []);
  }
});

test('a subscription record preserves consent evidence and replaces the subscriber snapshot', async () => {
  const deps = dependencies();
  await createHandler(deps.values)(jsonEvent('POST /api/newsletter-subscription', payload()));
  assert.deepEqual(deps.calls[0], {
    subscriberId: 'subscriber-id',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    organisation: 'Example Property Ltd',
    role: 'Property data specialist',
    workingGroups: ['property-technology'],
    source: 'dialog',
    consentText: 'I agree to receive OPDA email updates at this address. I can unsubscribe at any time.',
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    createdAt: NOW,
    expiresAt: Math.floor(NOW / 1000) + SUBSCRIPTION_RETENTION_SECONDS,
  });

  const input = subscriptionPutInput(deps.calls[0], 'subscriptions');
  assert.equal(input.TableName, 'subscriptions');
  assert.equal(input.Item.subscriberId.S, 'subscriber-id');
  assert.equal(input.Item.status.S, 'subscribed');
  assert.equal(input.Item.consent.BOOL, true);
  assert.equal(input.ConditionExpression, undefined);
});

test('storage errors are retryable and do not leak internal details', async () => {
  const handler = createHandler(dependencies({
    storeSubscription: async () => { throw new Error('secret internal detail'); },
  }).values);
  const response = await handler(jsonEvent('POST /api/newsletter-subscription', payload()));
  assert.equal(response.statusCode, 503);
  assert.doesNotMatch(response.body, /secret internal detail/u);
});

test('the newsletter has its own encrypted store and same-origin route', async () => {
  const [stack, site, header, form, dialog, frontendContract] = await Promise.all([
    read('config/aws/newsletter-subscription-stack.yaml'),
    read('config/aws/site-stack.yaml'),
    read('src/components/Header.astro'),
    read('src/components/NewsletterSubscriptionForm.astro'),
    read('src/components/NewsletterSubscriptionDialog.astro'),
    read('src/data/newsletter-subscription.ts'),
  ]);
  assert.match(stack, /RouteKey: POST \/api\/newsletter-subscription/u);
  assert.match(stack, /BillingMode: PAY_PER_REQUEST[\s\S]*SSEEnabled: true/u);
  assert.match(stack, /AttributeName: expiresAt\n\s+Enabled: true/u);
  assert.match(stack, /DeletionProtectionEnabled: true/u);
  assert.match(stack, /StreamViewType: KEYS_ONLY/u);
  assert.match(stack, /SubscriptionsTableStreamArn:[\s\S]*SubscriptionsTable\.StreamArn/u);
  assert.match(stack, /Action: \[dynamodb:PutItem\]/u);
  assert.doesNotMatch(stack, /ses:|WorkingGroupInterest|REGISTRATIONS_TABLE/u);
  assert.match(site, /NewsletterSubscriptionApplication:[\s\S]*TemplateURL: newsletter-subscription-stack\.yaml/u);
  assert.match(site, /Id: newsletter-subscription-api[\s\S]*OriginProtocolPolicy: https-only/u);
  assert.match(site, /PathPattern: '\/api\/newsletter-subscription\*'[\s\S]*TargetOriginId: newsletter-subscription-api/u);
  assert.match(site, /SubmissionEventsApplication:[\s\S]*TemplateURL: submission-events-stack\.yaml/u);
  assert.match(site, /PublicFormOriginRequestPolicy:[\s\S]*Headers: \[Content-Type\]/u);
  assert.match(header, /href="\/subscribe"[\s\S]*data-newsletter-trigger/u);
  assert.match(form, /action="\/api\/newsletter-subscription"/u);
  assert.match(form, /newsletter privacy notice/u);
  assert.match(dialog, /id="newsletter-subscription-dialog"/u);
  assert.match(dialog, /trigger\.setAttribute\('aria-haspopup', 'dialog'\)/u);
  assert.match(frontendContract, new RegExp(PRIVACY_NOTICE_VERSION, 'u'));
  assert.match(frontendContract, /I agree to receive OPDA email updates at this address/u);
});
