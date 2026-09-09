import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { createPostmarkInvitationAdapter, fingerprintTemplate } from '../src/approval-onboarding/postmark.mjs';
import { INVITATION_SUBJECT, INVITATION_TEMPLATE_ALIAS, OPDA_TENANT_ID, WEBSITE_LOGIN_URL } from '../src/approval-onboarding/invitation.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS, compileDomainInvitationTemplate } from '../src/approval-onboarding/domain-templates.mjs';
import { INVITATION_REGISTRY } from '../src/approval-onboarding/settings.mjs';

const operationKey = 'a'.repeat(64);
const messageId = '22222222-2222-4222-8222-222222222222';
const date = '2026-09-09T12:00:00Z';
const template = {
  TemplateId: 98765432, AssociatedServerId: 20188829, Alias: INVITATION_TEMPLATE_ALIAS,
  Subject: INVITATION_SUBJECT, TemplateType: 'Standard', LayoutTemplate: null, Active: true,
  HtmlBody: readFileSync(new URL('../docs/templates/working-group-approval-invitation-email.html', import.meta.url), 'utf8'),
  TextBody: readFileSync(new URL('../docs/templates/working-group-approval-invitation-email.txt', import.meta.url), 'utf8'),
};
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const stream = { ID: 'broadcast', ServerID: template.AssociatedServerId, MessageStreamType: 'Broadcasts', SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'Postmark' }, ArchivedAt: null };
const server = { ID: template.AssociatedServerId, DeliveryType: 'Live', TrackOpens: false, TrackLinks: 'None' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function fixture(overrides = {}) {
  const calls = [];
  const sequence = [];
  const teamId = '11111111-1111-4111-8111-111111111111';
  const input = { displayName: 'Synthetic Participant', email: 'synthetic@example.invalid', microsoft: { redemptionRequired: false }, groups: [{ groupId: 'finance-and-banking', teamMembershipVerified: true, sourceAccess: { status: 'teams_only', permissionsVerified: true } }] };
  const registry = { tenantId: OPDA_TENANT_ID, websiteLoginUrl: WEBSITE_LOGIN_URL, groups: { 'finance-and-banking': { status: 'provisioned', teamId, teamUrl: `https://teams.microsoft.com/l/team/19%3Afixture%40thread.tacv2/conversations?groupId=${teamId}&tenantId=${OPDA_TENANT_ID}` } } };
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    calls.push({ url: parsed, ...options });
    sequence.push(parsed.pathname);
    assert.equal(parsed.origin, 'https://api.postmarkapp.com');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    const override = overrides[parsed.pathname];
    if (override) return override({ url: parsed, options });
    if (parsed.pathname === `/templates/${INVITATION_TEMPLATE_ALIAS}`) return json(template);
    if (parsed.pathname === '/server') return json(server);
    if (parsed.pathname === '/message-streams/broadcast') return json(stream);
    if (parsed.pathname === '/message-streams/broadcast/suppressions/dump') return json({ Suppressions: [] });
    if (parsed.pathname === '/email/withTemplate') return json({ ErrorCode: 0, MessageID: messageId, SubmittedAt: date, To: input.email });
    if (parsed.pathname === '/messages/outbound') return json({ TotalCount: 0, Messages: [] });
    throw new Error('unexpected fixture endpoint');
  };
  const config = { token: 'synthetic-token-not-secret', fetchImpl, expectedServerId: template.AssociatedServerId, expectedTemplateId: template.TemplateId, expectedTemplateFingerprint: fingerprintTemplate(template) };
  const adapter = createPostmarkInvitationAdapter(config);
  const request = { input, registry, logoBase64, operationKey, beforeSend: async () => { sequence.push('approval-guard'); return true; } };
  return { adapter, request, calls, sequence, config };
}

function activity(overrides = {}) {
  return { MessageID: messageId, MessageStream: 'broadcast', Metadata: { opda_onboarding_key: operationKey, opda_template_sha256: fingerprintTemplate(template) }, Tag: 'approval-onboarding', Subject: INVITATION_SUBJECT, Status: 'Sent', TrackOpens: false, TrackLinks: 'None', Sandboxed: false, ReceivedAt: date, To: [{ Email: 'synthetic@example.invalid', Name: null }], Cc: [], Bcc: [], ...overrides };
}

test('template fingerprint is byte-sensitive, deterministic and ignores provider identity fields', () => {
  const digest = fingerprintTemplate(template);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.equal(fingerprintTemplate({ HtmlBody: template.HtmlBody, TextBody: template.TextBody }), digest);
  assert.equal(fingerprintTemplate({ ...template, TemplateId: 1, Active: false }), digest);
  for (const field of ['HtmlBody', 'TextBody']) assert.notEqual(fingerprintTemplate({ ...template, [field]: `${template[field]}\n` }), digest);
  for (const altered of [{ Subject: 'wrong subject' }, { Alias: 'old-wave' }, { TemplateType: 'Layout' }, { LayoutTemplate: 'unverified-layout' }, { HtmlBody: 'no unsubscribe or CID' }]) assert.throws(() => fingerprintTemplate({ ...template, ...altered }));
});

test('guarded single-recipient send checks pinned resources and suppression, then disables all tracking', async () => {
  const { adapter, request, calls, sequence } = fixture();
  const result = await adapter.send(request);
  assert.deepEqual(result, { status: 'accepted', attempted: true, messageId, submittedAt: date });
  assert.deepEqual(sequence.slice(-3), ['/message-streams/broadcast/suppressions/dump', 'approval-guard', '/email/withTemplate']);
  const suppression = calls.find((call) => call.url.pathname.endsWith('/suppressions/dump'));
  assert.deepEqual([...suppression.url.searchParams], [['EmailAddress', request.input.email]]);
  const sends = calls.filter((call) => call.method === 'POST');
  assert.equal(sends.length, 1);
  const payload = JSON.parse(sends[0].body);
  assert.equal(payload.To, request.input.email);
  assert.equal(payload.TemplateId, template.TemplateId);
  assert.equal(Object.hasOwn(payload, 'TemplateAlias'), false);
  assert.equal(payload.MessageStream, 'broadcast');
  assert.equal(payload.TrackLinks, 'None');
  assert.equal(payload.TrackOpens, false);
  assert.equal(payload.Attachments[0].ContentID, 'cid:opda-logo');
  assert.deepEqual(payload.Metadata, { opda_onboarding_key: operationKey, opda_template_sha256: fingerprintTemplate(template) });
  assert.equal(payload.Tag, 'approval-onboarding');
  const repeated = await adapter.send(request);
  assert.equal(repeated.status, 'accepted');
  assert.equal(repeated.attempted, false);
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1);
});

test('every suppression origin or reason blocks and unavailable/malformed checks never clear a recipient', async () => {
  for (const suppression of ['HardBounce', 'SpamComplaint', 'ManualSuppression', 'FutureReason']) for (const Origin of ['Recipient', 'Customer', 'Admin']) {
    const { adapter, request, calls } = fixture({ '/message-streams/broadcast/suppressions/dump': () => json({ Suppressions: [{ EmailAddress: 'SYNTHETIC@example.invalid', SuppressionReason: suppression, Origin }] }) });
    assert.deepEqual(await adapter.send(request), { status: 'failed', attempted: false, reason: 'suppressed' });
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
  for (const reply of [() => { throw new Error('secret-value synthetic@example.invalid'); }, () => json({}, 503), () => json({}), () => json({ Suppressions: null }), () => json({ ErrorCode: 500, Suppressions: [] }), () => json({ Suppressions: [{ EmailAddress: 'someone-else@example.invalid' }] })]) {
    const { adapter, request, calls } = fixture({ '/message-streams/broadcast/suppressions/dump': reply });
    const result = await adapter.send(request);
    assert.equal(result.status, 'failed');
    assert.equal(result.attempted, false);
    assert.equal(result.reason, 'suppression-check-unavailable');
    assert.doesNotMatch(JSON.stringify(result), /secret-value|synthetic@/);
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
});

test('server-wide tracking, identity drift and provider configuration errors block before the send claim', async () => {
  for (const reply of [
    ...[{ TrackOpens: true }, { TrackOpens: undefined }, { TrackOpens: 'false' },
      { TrackLinks: 'HtmlAndText' }, { TrackLinks: undefined }, { ID: 1 },
      { DeliveryType: 'Sandbox' }, { DeliveryType: undefined }]
      .map((change) => () => json({ ...server, ...change })),
    () => json({ ...server, ErrorCode: 500 }),
  ]) {
    const { adapter, request, calls, sequence } = fixture({ '/server': reply });
    assert.deepEqual(await adapter.send(request), {
      status: 'failed', attempted: false, reason: 'server-verification-failed',
    });
    assert.equal(sequence.includes('approval-guard'), false);
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
});

test('transient template, stream and server reads are unavailable, fail closed and permit a later guarded retry', async () => {
  for (const [path, valid] of [[`/templates/${INVITATION_TEMPLATE_ALIAS}`, template], ['/message-streams/broadcast', stream], ['/server', server]]) {
    for (const unavailable of [
      ...[408, 429, 500, 502, 503].map(status => () => json({ ErrorCode: 100 }, status)),
      () => new Response('temporarily unavailable'),
      () => { throw new Error('private provider token'); },
    ]) {
      let reads = 0;
      const { adapter, request, calls, sequence } = fixture({ [path]: () => ++reads === 1 ? unavailable() : json(valid) });
      assert.deepEqual(await adapter.send(request), { status: 'failed', attempted: false, reason: 'preflight-unavailable' });
      assert.equal(sequence.includes('approval-guard'), false);
      assert.equal(calls.some(call => call.method === 'POST'), false);
      assert.equal((await adapter.send(request)).status, 'accepted');
      assert.equal(reads, 2);
      assert.equal(calls.filter(call => call.method === 'POST').length, 1);
    }
  }
});

test('a verified resource mismatch remains terminal even when another preflight read is unavailable', async () => {
  const { adapter, request, calls } = fixture({
    [`/templates/${INVITATION_TEMPLATE_ALIAS}`]: () => json({ ...template, Active: false }),
    '/server': () => json({}, 503),
  });
  assert.deepEqual(await adapter.send(request), { status: 'failed', attempted: false, reason: 'template-verification-failed' });
  assert.equal(calls.some(call => call.method === 'POST'), false);
});

test('template identity/content/layout changes and non-Postmark broadcast handling block dispatch', async () => {
  for (const change of [{ TemplateId: 1 }, { AssociatedServerId: 1 }, { Active: false }, { HtmlBody: `${template.HtmlBody}\n` }, { Alias: 'finance-banking-working-group-invitation' }, { LayoutTemplate: 'different-layout' }, { TemplateType: undefined }]) {
    const { adapter, request, calls } = fixture({ [`/templates/${INVITATION_TEMPLATE_ALIAS}`]: () => json({ ...template, ...change }) });
    assert.equal((await adapter.send(request)).reason, 'template-verification-failed');
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
  for (const changed of [{ ...stream, ID: 'outbound' }, { ...stream, ServerID: 1 }, { ...stream, MessageStreamType: 'Transactional' }, { ...stream, SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'Custom' } }, { ...stream, ArchivedAt: date }]) {
    const { adapter, request, calls } = fixture({ '/message-streams/broadcast': () => json(changed) });
    assert.equal((await adapter.send(request)).reason, 'stream-verification-failed');
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
});

test('withdrawn, stale, missing or failing final guards prevent every send', async () => {
  for (const beforeSend of [async () => false, async () => ({ allowed: true }), async () => { throw new Error('private participant data'); }, undefined]) {
    const { adapter, request, calls } = fixture();
    const result = await adapter.send({ ...request, beforeSend });
    assert.equal(result.status, 'failed');
    assert.equal(result.attempted, false);
    assert.equal(calls.some((call) => call.method === 'POST'), false);
    assert.doesNotMatch(JSON.stringify(result), /private participant/);
  }
  const { adapter, request, calls } = fixture();
  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(await adapter.send({ ...request, signal: controller.signal }), { status: 'failed', attempted: false, reason: 'stale-or-cancelled' });
  assert.equal(calls.length, 0);
});

test('withdrawal during final guard is checked again before the POST starts', async () => {
  const { adapter, request, calls } = fixture();
  const controller = new AbortController();
  const result = await adapter.send({ ...request, signal: controller.signal, beforeSend: async () => { controller.abort(); return true; } });
  assert.deepEqual(result, { status: 'failed', attempted: false, reason: 'stale-or-cancelled' });
  assert.equal(calls.some((call) => call.method === 'POST'), false);
});

test('post-dispatch timeout, abort, server errors and malformed success stay unknown with no blind resend', async () => {
  for (const reply of [
    () => { throw new DOMException('request aborted', 'AbortError'); },
    () => { throw new Error('request failed with private token'); },
    () => json({ ErrorCode: 500 }, 500), () => json({ ErrorCode: 0 }),
    () => json({ ErrorCode: 406, MessageID: messageId }),
    () => json({ ErrorCode: 0, MessageID: messageId, SubmittedAt: date, To: 'different@example.invalid' }),
    () => new Response('not-json', { status: 200 }), () => new Response(null, { status: 204 }),
    () => json({ ErrorCode: 0, MessageID: '00000000-0000-0000-0000-000000000000', SubmittedAt: date, To: 'synthetic@example.invalid' }),
  ]) {
    const { adapter, request, calls } = fixture({ '/email/withTemplate': reply });
    const result = await adapter.send(request);
    assert.equal(result.status, 'unknown');
    assert.equal(result.attempted, true);
    assert.doesNotMatch(JSON.stringify(result), /private token|synthetic@|different@/);
    assert.equal((await adapter.send(request)).status, 'unknown');
    assert.equal(calls.filter((call) => call.method === 'POST').length, 1);
  }
});

test('documented definitive API rejections are failed, never accepted', async () => {
  for (const status of [200, 422]) {
    const { adapter, request } = fixture({ '/email/withTemplate': () => json({ ErrorCode: 406, Message: 'suppressed private address' }, status) });
    assert.deepEqual(await adapter.send(request), { status: 'failed', attempted: true, reason: 'provider-rejected', errorCode: 406 });
  }
});

test('the configured deadline aborts an in-flight send and withdrawal after dispatch remains uncertain', async () => {
  const { config, request, calls } = fixture({ '/email/withTemplate': async ({ options }) => {
    await delay(15);
    assert.equal(options.signal.aborted, true);
    throw new DOMException('deadline', 'AbortError');
  } });
  const adapter = createPostmarkInvitationAdapter({ ...config, timeoutMs: 5 });
  assert.deepEqual(await adapter.send(request), { status: 'unknown', attempted: true, reason: 'send-outcome-unknown' });
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1);
  const controller = new AbortController();
  const cancelled = fixture({ '/email/withTemplate': () => { controller.abort(); throw new DOMException('withdrawn', 'AbortError'); } });
  assert.deepEqual(await cancelled.adapter.send({ ...cancelled.request, signal: controller.signal }), { status: 'unknown', attempted: true, reason: 'send-outcome-unknown' });
});

test('concurrent calls cannot dispatch two sends in the same adapter instance', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const { adapter, request, calls } = fixture({ '/message-streams/broadcast/suppressions/dump': async () => { await gate; return json({ Suppressions: [] }); } });
  const first = adapter.send(request);
  const second = await adapter.send(request);
  assert.equal(second.status, 'unknown');
  assert.equal(second.attempted, false);
  release();
  assert.equal((await first).status, 'accepted');
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1);
});

test('reconciliation uses one opaque metadata filter and accepts queued/processed activity, not delivery', async () => {
  for (const Status of ['Queued', 'Sent', 'Processed']) {
    const { adapter, calls } = fixture({ '/messages/outbound': () => json({ TotalCount: 1, Messages: [activity({ Status })] }) });
    assert.deepEqual(await adapter.reconcile({ operationKey }), { status: 'accepted', attempted: false, messageId, submittedAt: date, providerStatus: Status, reconciled: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), { count: '2', offset: '0', messagestream: 'broadcast', metadata_opda_onboarding_key: operationKey });
  }
});

test('absence, duplicates, malformed results and metadata mismatches cannot authorize retries', async () => {
  for (const page of [
    { TotalCount: 0, Messages: [] }, { TotalCount: 2, Messages: [activity(), activity()] },
    { TotalCount: 1, Messages: [] }, { TotalCount: 1, Messages: [activity({ Metadata: {} })] },
    { TotalCount: 1, Messages: [activity({ TrackOpens: true })] },
    { TotalCount: 1, Messages: [activity({ MessageStream: 'outbound' })] },
    { TotalCount: 1, Messages: [activity({ Sandboxed: true })] },
    { TotalCount: 1, Messages: [activity({ Cc: [{ Email: 'someone@example.invalid' }] })] },
  ]) {
    const { adapter, calls } = fixture({ '/messages/outbound': () => json(page) });
    assert.equal((await adapter.reconcile({ operationKey })).status, 'unknown');
    assert.equal(calls.some((call) => call.method === 'POST'), false);
  }
  const { adapter } = fixture({ '/messages/outbound': () => { throw new Error('private provider error'); } });
  assert.deepEqual(await adapter.reconcile({ operationKey }), { status: 'unknown', attempted: false, reason: 'activity-unavailable' });
  const notFound = fixture();
  assert.equal((await notFound.adapter.reconcile({ operationKey })).reason, 'not-found');
  assert.equal((await notFound.adapter.send(notFound.request)).status, 'unknown');
  assert.equal(notFound.calls.some((call) => call.method === 'POST'), false);
});

test('configuration and input boundaries reject arbitrary endpoints, keys and payload overrides', async () => {
  const { config, adapter, request, calls } = fixture();
  for (const change of [{ token: '' }, { token: 'unsafe\r\nheader' }, { token: 'unsafe\0header' }, { expectedTemplateId: 0 }, { expectedServerId: -1 }, { expectedTemplateFingerprint: 'bad' }, { timeoutMs: 60001 }, { apiUrl: 'https://evil.invalid' }]) assert.throws(() => createPostmarkInvitationAdapter({ ...config, ...change }));
  for (const change of [{ operationKey: 'email@example.invalid' }, { operationKey: 'a'.repeat(65) }, { payload: { MessageStream: 'outbound' } }, { input: { ...request.input, email: 'a@example.invalid,b@example.invalid' } }]) {
    assert.deepEqual(await adapter.send({ ...request, ...change }), { status: 'failed', attempted: false, reason: 'invalid-input' });
  }
  assert.equal(calls.length, 0);
  assert.equal((await adapter.reconcile({ operationKey: 'bad' })).reason, 'invalid-input');
});

function domainFixture(groupId, overrides = {}) {
  const contract = DOMAIN_TEMPLATE_CONTRACTS[groupId];
  const compiled = compileDomainInvitationTemplate(groupId, {
    HtmlBody: readFileSync(new URL('../docs/templates/domain-working-group-approval-invitation-email.html', import.meta.url), 'utf8'),
    TextBody: readFileSync(new URL('../docs/templates/domain-working-group-approval-invitation-email.txt', import.meta.url), 'utf8'),
  });
  const domainTemplate = { ...template, ...compiled, TemplateId: 98765440 + Object.keys(DOMAIN_TEMPLATE_CONTRACTS).indexOf(groupId) };
  const f = fixture({ [`/templates/${contract.alias}`]: () => json(domainTemplate), ...overrides });
  const config = { ...f.config, expectedGroupId: groupId, expectedTemplateAlias: contract.alias,
    expectedSubject: contract.subject, expectedTemplateId: domainTemplate.TemplateId,
    expectedTemplateFingerprint: fingerprintTemplate(domainTemplate, { groupId }) };
  const request = { ...f.request, registry: INVITATION_REGISTRY,
    input: { ...f.request.input, groups: [{ ...f.request.input.groups[0], groupId }] } };
  return { ...f, request, config, domainTemplate, adapter: createPostmarkInvitationAdapter(config) };
}

test('v2 sends one original-design invitation per independently approved domain, pinned by ID and metadata', async () => {
  const ids = new Set();
  for (const groupId of Object.keys(DOMAIN_TEMPLATE_CONTRACTS)) {
    const { adapter, request, calls, sequence, domainTemplate, config } = domainFixture(groupId);
    assert.equal((await adapter.send(request)).status, 'accepted');
    assert.ok(sequence.includes(`/templates/${DOMAIN_TEMPLATE_CONTRACTS[groupId].alias}`));
    assert.deepEqual(sequence.slice(-3), ['/message-streams/broadcast/suppressions/dump', 'approval-guard', '/email/withTemplate']);
    const sent = calls.filter(call => call.method === 'POST');
    assert.equal(sent.length, 1);
    const payload = JSON.parse(sent[0].body);
    assert.equal(payload.TemplateId, domainTemplate.TemplateId);
    ids.add(payload.TemplateId);
    assert.equal(payload.TemplateModel.group_id, groupId);
    assert.deepEqual(payload.TemplateModel.groups.map(g => g.group_id), [groupId]);
    assert.deepEqual(payload.Metadata, { opda_onboarding_key: operationKey,
      opda_template_sha256: config.expectedTemplateFingerprint, opda_domain_id: groupId });
    assert.equal(payload.TrackOpens, false); assert.equal(payload.TrackLinks, 'None');
    assert.equal((await adapter.send(request)).attempted, false);
    assert.equal(calls.filter(call => call.method === 'POST').length, 1);
  }
  assert.equal(ids.size, 6);
});

test('v2 rejects mismatched domains, mixed groups and wrong alias/subject before any provider call', async () => {
  const { adapter, request, config, calls } = domainFixture('conveyancing');
  for (const groups of [
    [{ ...request.input.groups[0], groupId: 'estate-agency' }],
    [...request.input.groups, { ...request.input.groups[0], groupId: 'estate-agency' }],
  ]) assert.deepEqual(await adapter.send({ ...request, input: { ...request.input, groups } }),
    { status: 'failed', attempted: false, reason: 'invalid-input' });
  assert.equal(calls.length, 0);
  for (const change of [
    { expectedGroupId: 'technology' }, { expectedGroupId: null },
    { expectedTemplateAlias: INVITATION_TEMPLATE_ALIAS }, { expectedSubject: INVITATION_SUBJECT },
    { expectedGroupId: 'estate-agency' }, { expectedTemplateId: null },
  ]) assert.throws(() => createPostmarkInvitationAdapter({ ...config, ...change }));
});

test('v2 retains suppression, final withdrawal and unknown-send no-resend safeguards', async () => {
  for (const groupId of Object.keys(DOMAIN_TEMPLATE_CONTRACTS)) {
    const suppressed = domainFixture(groupId, { '/message-streams/broadcast/suppressions/dump': () => json({ Suppressions: [{ EmailAddress: 'synthetic@example.invalid' }] }) });
    assert.equal((await suppressed.adapter.send(suppressed.request)).reason, 'suppressed');
    assert.equal(suppressed.calls.some(call => call.method === 'POST'), false);
    const withdrawn = domainFixture(groupId);
    assert.equal((await withdrawn.adapter.send({ ...withdrawn.request, beforeSend: async () => false })).reason, 'stale-or-cancelled');
    assert.equal(withdrawn.calls.some(call => call.method === 'POST'), false);
    const unknown = domainFixture(groupId, { '/email/withTemplate': () => { throw new Error('timeout'); } });
    assert.equal((await unknown.adapter.send(unknown.request)).status, 'unknown');
    assert.equal((await unknown.adapter.send(unknown.request)).attempted, false);
    assert.equal(unknown.calls.filter(call => call.method === 'POST').length, 1);
  }
});

test('v2 reconciliation requires the exact domain, subject and content pin; a different group cannot complete its ledger', async () => {
  for (const groupId of Object.keys(DOMAIN_TEMPLATE_CONTRACTS)) {
    const contract = DOMAIN_TEMPLATE_CONTRACTS[groupId];
    const { config } = domainFixture(groupId);
    const expected = activity({ Subject: contract.subject,
      Metadata: { opda_onboarding_key: operationKey, opda_template_sha256: config.expectedTemplateFingerprint, opda_domain_id: groupId } });
    for (const change of [undefined, { Subject: INVITATION_SUBJECT },
      { Metadata: { ...expected.Metadata, opda_domain_id: Object.keys(DOMAIN_TEMPLATE_CONTRACTS).find(id => id !== groupId) } },
      { Metadata: { ...expected.Metadata, opda_domain_id: undefined } },
    ]) {
      const f = domainFixture(groupId, { '/messages/outbound': () => json({ TotalCount: 1, Messages: [{ ...expected, ...change }] }) });
      const outcome = await f.adapter.reconcile({ operationKey });
      assert.equal(outcome.status, change ? 'unknown' : 'accepted');
      assert.equal(f.calls.some(call => call.method === 'POST'), false);
      assert.equal((await f.adapter.send(f.request)).attempted, false);
    }
  }
});
