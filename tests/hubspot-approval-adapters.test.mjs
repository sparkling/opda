import assert from 'node:assert/strict';
import test from 'node:test';
import { createHubSpotClient } from '../config/aws/hubspot-approval/client.mjs';
import { createIdentity } from '../config/aws/hubspot-approval/identity.mjs';
import { CONTACT_PROPERTIES } from '../config/aws/hubspot-participation/import.mjs';
import { APP_SCOPES } from '../config/aws/hubspot-participation/admin.mjs';
import { RetryLater } from '../config/aws/hubspot-sync/errors.mjs';

const NOW = Date.parse('2026-09-08T21:00:00Z');
const SECRET = { portalId: 144765514, appId: 52397854, role: 'bridge', accessToken: `pat-${'x'.repeat(30)}` };
const INFO = { hubId: SECRET.portalId, appId: SECRET.appId, scopes: APP_SCOPES.bridge };
const contact = (id = '123') => ({
  id, archived: false, createdAt: '2026-09-08T19:00:00Z', updatedAt: '2026-09-08T20:00:00Z',
  properties: { email: 'synthetic@example.test', opda_review_status: 'approved' },
  propertiesWithHistory: {
    opda_review_status: [{ value: 'approved', timestamp: '2026-09-08T20:00:00Z', sourceType: 'CRM_UI', sourceId: '456' }],
    email: [{ value: 'synthetic@example.test', timestamp: '2026-09-08T19:00:00Z', sourceType: 'CRM_UI' }],
  },
});
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
function crm(options = {}) {
  const calls = [];
  let reads = 0;
  const client = createHubSpotClient({ secretArn: 'arn:example', now: () => NOW,
    getSecret: async () => { reads++; return SECRET; },
    fetch: async (url, init) => {
      calls.push({ url: new URL(url), init });
      if (url.endsWith('/oauth/v2/private-apps/get/access-token-info')) return json(INFO);
      return json(contact());
    }, ...options });
  return { client, calls, secretReads: () => reads };
}

test('approval CRM reader pins the app and requests all agreed fields and approval/email history', async () => {
  const f = crm();
  assert.deepEqual(await f.client.getContact('123'), contact());
  assert.deepEqual(await f.client.getContact('123'), contact());
  assert.equal(f.secretReads(), 1);
  assert.equal(f.calls[0].url.pathname, '/oauth/v2/private-apps/get/access-token-info');
  assert.equal(f.calls[0].init.method, 'POST');
  const read = f.calls[1];
  assert.equal(read.url.origin, 'https://api.hubapi.com');
  assert.equal(read.url.pathname, '/crm/v3/objects/contacts/123');
  assert.deepEqual(read.url.searchParams.get('properties').split(','), CONTACT_PROPERTIES);
  assert.deepEqual(read.url.searchParams.get('propertiesWithHistory').split(','), ['opda_review_status', 'email', 'opda_requested_working_groups']);
  assert.ok(f.calls.every(({ init }) => init.redirect === 'error'));
  assert.ok(f.calls.every(({ init }) => init.signal instanceof AbortSignal));
});

test('approval CRM rejects invalid IDs before reading credentials or making requests', async () => {
  const f = crm();
  for (const id of ['', '0', '01', '1'.repeat(21), '../123', 123, null]) {
    await assert.rejects(f.client.getContact(id));
    await assert.rejects(f.client.projectStatus(id, { active: true, enrolmentStatus: 'complete' }));
  }
  assert.equal(f.calls.length, 0);
  assert.equal(f.secretReads(), 0);
});

test('approval CRM checks both stored credential metadata and verified app identity/scopes', async () => {
  for (const patch of [{ portalId: 1 }, { appId: 1 }, { role: 'bootstrap' }, { accessToken: 'invalid' }]) {
    const f = crm({ getSecret: async () => ({ ...SECRET, ...patch }) });
    await assert.rejects(f.client.getContact('123'), /configuration/);
    assert.equal(f.calls.length, 0);
  }
  for (const patch of [{ hubId: 1 }, { appId: 1 }, { scopes: ['oauth'] },
    { scopes: [...APP_SCOPES.bridge, 'crm.schemas.contacts.write'] }]) {
    let calls = 0;
    const f = crm({ fetch: async () => { calls++; return json({ ...INFO, ...patch }); } });
    await assert.rejects(f.client.getContact('123'), /identity or scopes/);
    assert.equal(calls, 1);
  }
});

test('approval CRM refreshes credential verification after five minutes', async () => {
  let timestamp = NOW;
  const f = crm({ now: () => timestamp });
  await f.client.getContact('123');
  timestamp += 300001;
  await f.client.getContact('123');
  assert.equal(f.secretReads(), 2);
});

test('approval CRM holds missing or merged-away identities and rejects malformed records', async () => {
  for (const [body, status, missing] of [[{}, 404, true], [contact('456'), 200, true],
    [{ ...contact(), properties: [] }, 200, false], [{ ...contact(), propertiesWithHistory: [] }, 200, false]]) {
    const f = crm({ fetch: async url => url.includes('/oauth/') ? json(INFO) : json(body, status) });
    if (missing) assert.equal(await f.client.getContact('123'), null);
    else await assert.rejects(f.client.getContact('123'));
  }
});

test('approval CRM inventory consumes bounded pages, preserves histories and ignores next-link URLs', async () => {
  const requests = [];
  const f = crm({ fetch: async url => {
    if (url.includes('/oauth/')) return json(INFO);
    const query = new URL(url).searchParams;
    requests.push(new URL(url));
    return query.has('after') ? json({ results: [contact('456')] })
      : json({ results: [contact()], paging: { next: { after: 'cursor-2', link: 'https://untrusted.example/' } } });
  } });
  assert.deepEqual(await f.client.listContacts(), [contact(), contact('456')]);
  assert.equal(requests.length, 2);
  for (const url of requests) {
    assert.equal(url.origin, 'https://api.hubapi.com');
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(url.searchParams.get('archived'), 'false');
    assert.deepEqual(url.searchParams.get('properties').split(','), CONTACT_PROPERTIES);
    assert.deepEqual(url.searchParams.get('propertiesWithHistory').split(','), ['opda_review_status', 'email', 'opda_requested_working_groups']);
  }
  assert.equal(requests[1].searchParams.get('after'), 'cursor-2');
});

test('approval CRM inventory rejects repeated cursors, duplicate contacts and incomplete paging', async () => {
  for (const page of [
    () => ({ results: [], paging: { next: { after: 'same' } } }),
    () => ({ results: [contact(), contact()] }),
    () => ({ results: [], paging: { next: {} } }),
    () => ({ results: [], paging: 'invalid' }),
    () => ({ results: [], paging: [] }),
    () => ({ results: 'invalid' }),
    () => ({ results: [contact('1'.repeat(21))] }),
  ]) {
    const f = crm({ fetch: async url => url.includes('/oauth/') ? json(INFO) : json(page()) });
    await assert.rejects(f.client.listContacts());
  }
});

test('approval CRM inventory refuses inventories over 5000 and oversized pages', async () => {
  let page = 0;
  const f = crm({ fetch: async url => {
    if (url.includes('/oauth/')) return json(INFO);
    const start = page++ * 100 + 1;
    return json({ results: Array.from({ length: 100 }, (_, n) => contact(String(start + n))),
      paging: { next: { after: String(page) } } });
  } });
  await assert.rejects(f.client.listContacts());
  assert.ok(page <= 51);
  const oversized = crm({ fetch: async url => url.includes('/oauth/') ? json(INFO)
    : json({ results: Array.from({ length: 101 }, (_, n) => contact(String(n + 1))) }) });
  await assert.rejects(oversized.client.listContacts());
});

test('approval CRM projection can write only active/enrolment snapshots, never review decisions', async () => {
  const f = crm();
  await f.client.projectStatus('123', { active: false, enrolmentStatus: 'complete' });
  const write = f.calls.at(-1);
  assert.equal(write.init.method, 'PATCH');
  assert.equal(write.url.pathname, '/crm/v3/objects/contacts/123');
  assert.deepEqual(JSON.parse(write.init.body), {
    properties: { opda_active: 'false', opda_enrolment_status: 'complete' },
  });
  for (const value of [null, { active: 'true', enrolmentStatus: 'complete' },
    { active: true, enrolmentStatus: 'unknown' }, { active: true },
    { active: true, enrolmentStatus: 'complete', reviewStatus: 'approved' },
    { active: true, enrolmentStatus: 'complete', opda_review_status: 'approved' },
    Object.assign(Object.create({ active: true }), { enrolmentStatus: 'complete', reviewStatus: 'approved' })]) {
    const before = f.calls.length;
    await assert.rejects(f.client.projectStatus('123', value));
    assert.equal(f.calls.length, before);
  }
});

test('approval CRM respects Retry-After without retrying requests and sanitizes failures', async () => {
  for (const retry of ['120', new Date(NOW + 120000).toUTCString()]) {
    let requests = 0;
    const f = crm({ fetch: async url => {
      requests++;
      return url.includes('/oauth/') ? json(INFO) : json({ sensitive: 'never-log' }, 429, { 'Retry-After': retry });
    } });
    await assert.rejects(f.client.getContact('123'), error => error instanceof RetryLater && error.seconds === 120);
    assert.equal(requests, 2);
  }
  for (const fetch of [async () => { throw new Error('private-token sensitive@example.test'); },
    async () => json({ message: 'private-token sensitive@example.test' }, 500)]) {
    await assert.rejects(crm({ fetch }).client.getContact('123'), error => !/private-token|sensitive@/.test(error.message));
  }
});

const POOL = 'eu-west-2_Example123';
const SUB = '00000000-0000-4000-8000-000000000001';
const PID = '00000000-0000-4000-8000-000000000002';
const applicant = { participantId: PID, email: 'synthetic@example.test', name: 'Synthetic Example' };
const account = { ...applicant, cognitoSub: SUB };
const attributes = (patch = {}) => Object.entries({ email: applicant.email, 'custom:participant_id': PID, sub: SUB, ...patch })
  .map(([Name, Value]) => ({ Name, Value }));
function identity(options = {}) {
  const calls = [];
  const instance = createIdentity({ poolId: POOL, send: async (command, input) => {
    calls.push({ command, input });
    if (command === 'AdminCreateUserCommand') return { User: { Enabled: true, Attributes: attributes() } };
    if (command === 'AdminGetUserCommand') return { Enabled: true, UserAttributes: attributes() };
    return {};
  }, ...options });
  return { instance, calls };
}

test('approval provisioning suppresses invitations and cannot force aliases, verify email or assign privilege', async () => {
  const f = identity();
  assert.equal(await f.instance.ensure(applicant), SUB);
  assert.deepEqual(f.calls, [{ command: 'AdminCreateUserCommand', input: {
    UserPoolId: POOL, Username: applicant.email, MessageAction: 'SUPPRESS', ForceAliasCreation: false,
    UserAttributes: [
      { Name: 'email', Value: applicant.email }, { Name: 'name', Value: applicant.name },
      { Name: 'custom:participant_id', Value: PID },
    ],
  } }]);
  assert.doesNotMatch(JSON.stringify(f.calls), /TemporaryPassword|email_verified|AdminAddUserToGroup|role/);
});

test('approval provisioning retries an existing username only by verifying immutable ownership', async () => {
  const calls = [];
  const f = identity({ send: async (command, input) => {
    calls.push({ command, input });
    if (command === 'AdminCreateUserCommand') throw Object.assign(new Error('raw private error'), { name: 'UsernameExistsException' });
    return { Enabled: true, UserAttributes: attributes() };
  } });
  assert.equal(await f.instance.ensure(applicant), SUB);
  assert.deepEqual(calls.map(({ command }) => command), ['AdminCreateUserCommand', 'AdminGetUserCommand']);
  assert.equal(calls[1].input.Username, applicant.email);
});

test('approval provisioning refuses mismatched, malformed or disabled Cognito identities', async () => {
  for (const result of [
    { Enabled: true, UserAttributes: attributes({ email: 'different@example.test' }) },
    { Enabled: true, UserAttributes: attributes({ 'custom:participant_id': 'other-participant' }) },
    { Enabled: true, UserAttributes: attributes({ sub: 'invalid' }) },
    { Enabled: false, UserAttributes: attributes() },
    { Enabled: true, UserAttributes: [...attributes(), { Name: 'email', Value: applicant.email }] },
  ]) {
    const f = identity({ send: async command => {
      if (command === 'AdminCreateUserCommand') throw Object.assign(new Error('exists'), { name: 'UsernameExistsException' });
      return result;
    } });
    await assert.rejects(f.instance.ensure(applicant), /identity/);
  }
});

test('approval provisioning validates inputs before provider calls and sanitizes provider errors', async () => {
  const f = identity();
  for (const value of [null, { ...applicant, participantId: '' }, { ...applicant, email: 'invalid' },
    { ...applicant, name: '' }, { ...applicant, name: 'x'.repeat(257) }, { ...applicant, name: 'unsafe\nname' }]) {
    await assert.rejects(f.instance.ensure(value));
  }
  assert.equal(f.calls.length, 0);
  assert.throws(() => createIdentity({ poolId: '../unsafe' }));
  await assert.rejects(identity({ send: async () => { throw new Error('private-token sensitive@example.test'); } }).instance.ensure(applicant),
    error => !/private-token|sensitive@/.test(error.message));
});

test('approval activation verifies the stable subject binding before enabling', async () => {
  const f = identity();
  await f.instance.setAccess(account, true);
  assert.deepEqual(f.calls, [
    { command: 'AdminGetUserCommand', input: { UserPoolId: POOL, Username: SUB } },
    { command: 'AdminEnableUserCommand', input: { UserPoolId: POOL, Username: SUB } },
  ]);
});

test('approval revocation verifies ownership then disables and globally signs out the same subject', async () => {
  const f = identity();
  await f.instance.setAccess(account, false);
  assert.deepEqual(f.calls, [
    { command: 'AdminGetUserCommand', input: { UserPoolId: POOL, Username: SUB } },
    { command: 'AdminDisableUserCommand', input: { UserPoolId: POOL, Username: SUB } },
    { command: 'AdminUserGlobalSignOutCommand', input: { UserPoolId: POOL, Username: SUB } },
  ]);
});

test('approval access changes never mutate an unbound identity or accept non-boolean decisions', async () => {
  for (const patch of [{ email: 'different@example.test' }, { 'custom:participant_id': 'other-participant' },
    { sub: '00000000-0000-4000-8000-000000000099' }]) {
    const calls = [];
    const f = identity({ send: async command => { calls.push(command); return { UserAttributes: attributes(patch) }; } });
    await assert.rejects(f.instance.setAccess(account, true), /identity/);
    assert.deepEqual(calls, ['AdminGetUserCommand']);
  }
  const f = identity();
  await assert.rejects(f.instance.setAccess(account, 'true'));
  await assert.rejects(f.instance.setAccess({ ...account, cognitoSub: '../unsafe' }, true));
  assert.equal(f.calls.length, 0);
});
