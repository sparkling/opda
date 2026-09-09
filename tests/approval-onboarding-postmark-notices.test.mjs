import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPostmarkInvitationAdapter, fingerprintTemplate } from '../src/approval-onboarding/postmark.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS } from '../src/approval-onboarding/domain-templates.mjs';
import { compileWithdrawalNoticeTemplate, withdrawalNoticeContract } from '../src/approval-onboarding/withdrawal-notice.mjs';

const operationKey = 'b'.repeat(64);
const messageId = '22222222-2222-4222-8222-222222222222';
const date = '2026-09-09T12:00:00Z';
const serverId = 20188829;
const source = name => readFileSync(new URL(`../docs/templates/${name}`, import.meta.url), 'utf8');
const shells = { HtmlBody: source('participation-access-change-email.html'), TextBody: source('participation-access-change-email.txt') };
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const groupIds = Object.keys(DOMAIN_TEMPLATE_CONTRACTS);
const cases = () => [...groupIds.map(groupId => ['group-withdrawn', groupId]), ['website-disabled', undefined]];
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function fixture(noticeKind = 'group-withdrawn', groupId = noticeKind === 'group-withdrawn' ? 'conveyancing' : undefined, overrides = {}) {
  const contract = withdrawalNoticeContract(noticeKind, groupId);
  const template = { ...compileWithdrawalNoticeTemplate(noticeKind, groupId, shells), TemplateId: 98765501 + groupIds.indexOf(groupId),
    AssociatedServerId: serverId, Active: true };
  const pin = fingerprintTemplate(template, { noticeKind, groupId });
  const stream = { ID: 'outbound', ServerID: serverId, MessageStreamType: 'Transactional', ArchivedAt: null,
    SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'None' } };
  const server = { ID: serverId, DeliveryType: 'Live', TrackOpens: false, TrackLinks: 'None' };
  const calls = []; const sequence = [];
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    calls.push({ url: parsed, ...options }); sequence.push(parsed.pathname);
    assert.equal(parsed.origin, 'https://api.postmarkapp.com');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    if (overrides[parsed.pathname]) return overrides[parsed.pathname]({ url: parsed, options });
    if (parsed.pathname === `/templates/${contract.alias}`) return json(template);
    if (parsed.pathname === '/message-streams/outbound') return json(stream);
    if (parsed.pathname === '/server') return json(server);
    if (parsed.pathname === '/message-streams/outbound/suppressions/dump') return json({ Suppressions: [] });
    if (parsed.pathname === '/email/withTemplate') return json({ ErrorCode: 0, MessageID: messageId, SubmittedAt: date, To: 'synthetic@example.invalid' });
    if (parsed.pathname === '/messages/outbound') return json({ TotalCount: 0, Messages: [] });
    throw new Error('unexpected fixture endpoint');
  };
  const config = { token: 'synthetic-token-not-secret', fetchImpl, expectedServerId: serverId, expectedTemplateId: template.TemplateId,
    expectedTemplateAlias: contract.alias, expectedSubject: contract.subject, expectedTemplateFingerprint: pin,
    expectedGroupId: groupId, noticeKind };
  const request = { input: { displayName: 'Synthetic Participant', email: 'synthetic@example.invalid' }, logoBase64,
    operationKey, beforeSend: async () => { sequence.push('access-change-guard'); return true; } };
  const activity = changes => ({ MessageID: messageId, MessageStream: 'outbound',
    Metadata: { opda_onboarding_key: operationKey, opda_template_sha256: pin, opda_notice_kind: noticeKind,
      ...(groupId ? { opda_domain_id: groupId } : {}) },
    Tag: 'approval-onboarding', Subject: contract.subject, Status: 'Sent', TrackOpens: false, TrackLinks: 'None', Sandboxed: false,
    ReceivedAt: date, To: [{ Email: request.input.email }], Cc: [], Bcc: [], ...changes });
  return { adapter: createPostmarkInvitationAdapter(config), config, request, calls, sequence, contract, template, stream, server, activity };
}

test('notice fingerprints pin finite aliases and subjects, do not require unsubscribe and preserve byte sensitivity', () => {
  const pins = new Set();
  for (const [noticeKind, groupId] of cases()) {
    const template = compileWithdrawalNoticeTemplate(noticeKind, groupId, shells);
    const options = { noticeKind, groupId };
    const digest = fingerprintTemplate(template, options);
    assert.match(digest, /^[a-f0-9]{64}$/); pins.add(digest);
    assert.equal(fingerprintTemplate({ HtmlBody: template.HtmlBody, TextBody: template.TextBody }, options), digest);
    assert.equal(fingerprintTemplate({ ...template, TemplateId: 1, Active: false }, options), digest);
    for (const field of ['HtmlBody', 'TextBody']) assert.notEqual(fingerprintTemplate({ ...template, [field]: `${template[field]}\n` }, options), digest);
    assert.throws(() => fingerprintTemplate(template));
    for (const change of [{ Subject: 'wrong subject' }, { Alias: 'working-group-approval-invitation' }, { TemplateType: 'Layout' },
      { LayoutTemplate: 'unverified-layout' }, { HtmlBody: template.HtmlBody.replace('cid:opda-logo', 'https://example.invalid/logo') },
      { TextBody: `${template.TextBody}{{{ pm:unsubscribe }}}` }, { HtmlBody: template.HtmlBody.replace('{{display_name}}', '{{{display_name}}}') }]) {
      assert.throws(() => fingerprintTemplate({ ...template, ...change }, options));
    }
  }
  assert.equal(pins.size, 7);
  for (const options of [{ noticeKind: 'unknown' }, { noticeKind: 'website-disabled', groupId: 'conveyancing' },
    { noticeKind: 'group-withdrawn' }, { noticeKind: null }, { noticeKind: 'website-disabled', subject: 'override' }]) {
    assert.throws(() => fingerprintTemplate(compileWithdrawalNoticeTemplate('website-disabled', undefined, shells), options));
  }
});

test('the same adapter sends each notice on outbound with its exact content pin, kind and group metadata', async () => {
  for (const [kind, groupId] of cases()) {
    const f = fixture(kind, groupId);
    assert.deepEqual(await f.adapter.send(f.request), { status: 'accepted', attempted: true, messageId, submittedAt: date });
    assert.deepEqual(f.sequence.slice(-3), ['/message-streams/outbound/suppressions/dump', 'access-change-guard', '/email/withTemplate']);
    assert.equal(f.sequence.some(path => path.includes('/broadcast')), false);
    const suppression = f.calls.find(call => call.url.pathname.endsWith('/suppressions/dump'));
    assert.deepEqual([...suppression.url.searchParams], [['EmailAddress', f.request.input.email]]);
    const sent = f.calls.filter(call => call.method === 'POST'); assert.equal(sent.length, 1);
    const payload = JSON.parse(sent[0].body);
    assert.equal(payload.TemplateId, f.template.TemplateId); assert.equal(Object.hasOwn(payload, 'TemplateAlias'), false);
    assert.equal(payload.MessageStream, 'outbound'); assert.equal(payload.TrackOpens, false); assert.equal(payload.TrackLinks, 'None');
    assert.equal(payload.To, f.request.input.email); assert.equal(payload.Attachments[0].ContentID, 'cid:opda-logo');
    assert.deepEqual(payload.Metadata, f.activity().Metadata); assert.equal(payload.Tag, 'approval-onboarding');
    assert.equal(payload.TemplateModel.notice_kind, kind);
    assert.equal(payload.TemplateModel.group_id, groupId);
    assert.equal((await f.adapter.send(f.request)).attempted, false);
    assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
  }
});

test('transactional stream readback accepts documented None spellings and blocks mismatches or archival', async () => {
  const base = fixture().stream;
  for (const UnsubscribeHandlingType of ['none', 'None']) {
    const f = fixture('group-withdrawn', 'conveyancing', { '/message-streams/outbound': () => json({ ...base, SubscriptionManagementConfiguration: { UnsubscribeHandlingType } }) });
    assert.equal((await f.adapter.send(f.request)).status, 'accepted');
  }
  for (const change of [{ ID: 'broadcast' }, { ServerID: 1 }, { MessageStreamType: 'Broadcasts' }, { ArchivedAt: date },
    { SubscriptionManagementConfiguration: undefined }, { SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'Postmark' } },
    { SubscriptionManagementConfiguration: { UnsubscribeHandlingType: 'Custom' } }]) {
    const f = fixture('group-withdrawn', 'conveyancing', { '/message-streams/outbound': () => json({ ...base, ...change }) });
    assert.deepEqual(await f.adapter.send(f.request), { status: 'failed', attempted: false, reason: 'stream-verification-failed' });
    assert.equal(f.calls.some(call => call.method === 'POST'), false);
    assert.equal(f.sequence.includes('access-change-guard'), false);
  }
});

test('notices preserve suppression, server tracking and final-current-state guards without changing providers', async () => {
  for (const [kind, groupId] of cases()) {
    for (const [path, reply, reason] of [
      ['/message-streams/outbound/suppressions/dump', () => json({ Suppressions: [{ EmailAddress: 'synthetic@example.invalid', SuppressionReason: 'FutureReason' }] }), 'suppressed'],
      ['/message-streams/outbound/suppressions/dump', () => json({}, 503), 'suppression-check-unavailable'],
      ['/server', () => json({ ...fixture(kind, groupId).server, TrackOpens: true }), 'server-verification-failed'],
    ]) {
      const f = fixture(kind, groupId, { [path]: reply });
      assert.equal((await f.adapter.send(f.request)).reason, reason);
      assert.equal(f.calls.some(call => call.method === 'POST'), false);
      assert.equal(f.sequence.includes('access-change-guard'), false);
    }
    const withdrawn = fixture(kind, groupId);
    assert.equal((await withdrawn.adapter.send({ ...withdrawn.request, beforeSend: async () => false })).reason, 'stale-or-cancelled');
    assert.equal(withdrawn.calls.some(call => call.method === 'POST'), false);
    const controller = new AbortController();
    const aborted = fixture(kind, groupId);
    assert.equal((await aborted.adapter.send({ ...aborted.request, signal: controller.signal, beforeSend: async () => { controller.abort(); return true; } })).reason, 'stale-or-cancelled');
    assert.equal(aborted.calls.some(call => call.method === 'POST'), false);
  }
});

test('notice preflight provider outages are retryable without claiming or sending the notice early', async () => {
  for (const [kind, groupId] of cases()) {
    const base = fixture(kind, groupId);
    for (const [path, valid] of [[`/templates/${base.contract.alias}`, base.template], ['/message-streams/outbound', base.stream], ['/server', base.server]]) {
      let reads = 0;
      const f = fixture(kind, groupId, { [path]: () => ++reads === 1 ? json({ ErrorCode: 100 }, 503) : json(valid) });
      assert.deepEqual(await f.adapter.send(f.request), { status: 'failed', attempted: false, reason: 'preflight-unavailable' });
      assert.equal(f.sequence.includes('access-change-guard'), false);
      assert.equal(f.calls.some(call => call.method === 'POST'), false);
      assert.equal((await f.adapter.send(f.request)).status, 'accepted');
    }
  }
});

test('notice configuration rejects wrong kinds, cross-group contracts and payload overrides before provider calls', async () => {
  const f = fixture();
  for (const change of [{ noticeKind: null }, { noticeKind: 'unknown' }, { noticeKind: 'website-disabled' }, { expectedGroupId: 'technology' },
    { expectedGroupId: undefined }, { expectedGroupId: 'estate-agency' }, { expectedTemplateAlias: 'arbitrary' },
    { expectedSubject: 'arbitrary' }, { messageStream: 'broadcast' }]) assert.throws(() => createPostmarkInvitationAdapter({ ...f.config, ...change }));
  for (const change of [{ input: { ...f.request.input, groupId: 'estate-agency' } }, { noticeKind: 'website-disabled' },
    { MessageStream: 'broadcast' }, { input: { ...f.request.input, email: 'a@example.invalid,b@example.invalid' } }]) {
    assert.deepEqual(await f.adapter.send({ ...f.request, ...change }), { status: 'failed', attempted: false, reason: 'invalid-input' });
  }
  assert.equal(f.calls.length, 0);
  const website = fixture('website-disabled', undefined);
  assert.equal((await website.adapter.send({ ...website.request, registry: { ignored: 'not used for account notices' } })).status, 'accepted');
});

test('notice reconciliation scopes the selected stream and requires the exact kind, group, subject and pin', async () => {
  for (const [kind, groupId] of cases()) {
    const base = fixture(kind, groupId); const row = base.activity();
    for (const change of [undefined, { MessageStream: 'broadcast' }, { Subject: 'wrong' },
      { Metadata: { ...row.Metadata, opda_notice_kind: kind === 'group-withdrawn' ? 'website-disabled' : 'group-withdrawn' } },
      { Metadata: { ...row.Metadata, opda_notice_kind: undefined } },
      { Metadata: { ...row.Metadata, opda_domain_id: groupIds.find(id => id !== groupId) } },
      { Metadata: { ...row.Metadata, opda_template_sha256: 'd'.repeat(64) } },
      { Metadata: { ...row.Metadata, opda_onboarding_key: 'e'.repeat(64) } },
      { TrackOpens: true }, { TrackLinks: 'HtmlAndText' }, { Sandboxed: true }, { Cc: [{ Email: 'other@example.invalid' }] },
    ]) {
      const f = fixture(kind, groupId, { '/messages/outbound': () => json({ TotalCount: 1, Messages: [{ ...row, ...change }] }) });
      const result = await f.adapter.reconcile({ operationKey });
      assert.equal(result.status, change ? 'unknown' : 'accepted');
      assert.deepEqual(Object.fromEntries(f.calls[0].url.searchParams), { count: '2', offset: '0', messagestream: 'outbound', metadata_opda_onboarding_key: operationKey });
      assert.equal((await f.adapter.send(f.request)).attempted, false);
      assert.equal(f.calls.some(call => call.method === 'POST'), false);
    }
  }
});

test('ambiguous notice sends and absent provider activity never authorize a blind resend', async () => {
  for (const [kind, groupId] of cases()) {
    for (const reply of [() => { throw new Error('private token timeout'); }, () => json({}, 500), () => new Response('not-json')]) {
      const f = fixture(kind, groupId, { '/email/withTemplate': reply });
      assert.deepEqual(await f.adapter.send(f.request), { status: 'unknown', attempted: true, reason: 'send-outcome-unknown' });
      assert.equal((await f.adapter.send(f.request)).attempted, false);
      assert.equal((await f.adapter.reconcile({ operationKey })).reason, 'not-found');
      assert.equal((await f.adapter.send(f.request)).attempted, false);
      assert.equal(f.calls.filter(call => call.method === 'POST').length, 1);
    }
  }
});
