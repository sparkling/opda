import assert from 'node:assert/strict';
import test from 'node:test';
import { NOT_ENABLED } from '../config/aws/teams-approvals/decision.mjs';
import { teamsDecisionId } from '../config/aws/teams-approvals/decisions.mjs';
import { createMessagesHandler } from '../config/aws/teams-approvals/messages.mjs';
import { INSTALL_KEY, reviewKey } from '../config/aws/teams-approvals/store.mjs';
import { Unauthorized } from '../config/aws/teams-approvals/token.mjs';

const BOT = '11111111-2222-4333-8444-555555555555';
const TENANT = '143540d4-4fbc-4005-882a-29656cd01a36';
const GROUP = '11be8af8-bb86-4258-bd73-fb3dd3db2654';
const APPROVER = '7eaf4499-4442-4133-b685-ca6197084f79';
const NOW = Date.parse('2026-09-16T09:00:00Z');
const id = '00000000-0000-4000-8000-000000000001';
const serviceUrl = 'https://smba.trafficmanager.net/emea/';
const registration = () => ({ registrationId: id, firstName: 'Synthetic', lastName: 'Example Person', email: 'synthetic@example.test',
  organisation: 'Example organisation', role: 'Research', workingGroups: ['conveyancing', 'finance-and-banking'],
  relevantPerspective: '', createdAt: NOW - 10000, expiresAt: Math.floor(NOW / 1000) + 86400 });

function activity(patch = {}) {
  return { type: 'invoke', name: 'adaptiveCard/action', id: 'act-2', serviceUrl, channelId: 'msteams',
    from: { id: '29:user', name: 'Ada Reviewer', aadObjectId: APPROVER },
    recipient: { id: `28:${BOT}` }, conversation: { id: '19:chan@thread.tacv2;messageid=100', tenantId: TENANT },
    replyToId: '100', channelData: { tenant: { id: TENANT }, team: { id: '19:team@thread.tacv2' } },
    value: { action: { type: 'Action.Execute', verb: 'approve', data: { registrationId: id, domainId: 'conveyancing', v: 1 } }, trigger: 'manual' },
    ...patch };
}
const request = (body, headers = { authorization: 'Bearer good' }) => ({ version: '2.0', rawPath: '/teams/messages',
  requestContext: { http: { method: 'POST' } }, headers, body: JSON.stringify(body), isBase64Encoded: false });

function setup({ approvalsEnabled = true, member = true, claim = { state: 'synced', contactId: '123' }, crmPatch = {} } = {}) {
  const items = new Map(), calls = [];
  const store = {
    async get(pk) { return structuredClone(items.get(pk) ?? null); },
    async getRegistration(registrationId) { return registrationId === id ? registration() : null; },
    async getSyncClaim(email) { return email === 'synthetic@example.test' ? claim : null; },
    async put(item, previous = null) {
      if ((items.get(item.pk)?.revision ?? null) !== (previous?.revision ?? null)) throw new Error('Conditional conflict');
      const saved = { ...structuredClone(item), revision: (previous?.revision ?? 0) + 1 };
      items.set(item.pk, saved);
      return structuredClone(saved);
    },
  };
  const crm = {
    async getContact(contactId) { calls.push(['crm-read', contactId]); return { id: contactId, properties: { email: 'Synthetic@example.test',
      opda_requested_working_groups: 'conveyancing;finance-and-banking', ...crmPatch } }; },
    async setDomainReview(contactId, domainId, status) {
      calls.push(['mirror', contactId, domainId, status]);
      if (crm.failMirror) throw new Error('boom');
    },
  };
  const microsoft = {
    async isGroupMember(groupId, userId) { calls.push(['member', groupId, userId]); return member; },
    async updateCard(input) { calls.push(['update', input.conversationId, input.activityId]); },
  };
  const validateToken = async (authorization, act) => {
    if (authorization !== 'Bearer good' || act.serviceUrl !== serviceUrl) throw new Unauthorized();
    return { issuer: 'https://api.botframework.com', appId: BOT, serviceUrl };
  };
  const handler = createMessagesHandler({ botAppId: BOT, tenantId: TENANT, approverGroupId: GROUP, approvalsEnabled },
    { store, crm, microsoft, validateToken, sendHint: async contactId => { calls.push(['hint', contactId]); }, now: () => NOW });
  return { handler, items, calls, crm };
}
const body = response => JSON.parse(response.body);

test('the endpoint refuses everything that is not an authenticated Teams activity for this bot', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler({ ...request(activity()), rawPath: '/other' })).statusCode, 404);
  assert.equal((await handler({ ...request(activity()), requestContext: { http: { method: 'GET' } } })).statusCode, 405);
  assert.equal((await handler(request(activity(), {}))).statusCode, 401);
  assert.equal((await handler(request(activity(), { authorization: 'Bearer forged' }))).statusCode, 401);
  assert.equal((await handler(request(activity({ recipient: { id: '28:other' } })))).statusCode, 403);
  assert.equal((await handler(request(activity({ conversation: { id: 'x', tenantId: 'other-tenant' } })))).statusCode, 403);
  assert.equal((await handler(request(activity({ channelId: 'webchat' })))).statusCode, 400);
  assert.equal((await handler(request(activity({ serviceUrl: 'https://attacker.test/' })))).statusCode, 400, 'only the Teams connector host is ever called back');
  assert.equal((await handler({ ...request(activity()), body: 'not json' })).statusCode, 400);
  assert.deepEqual(calls, [], 'nothing downstream is touched by a refused request');
});

test('installation records the connector service URL; other activities are acknowledged and ignored', async () => {
  const { handler, items, calls } = setup();
  const install = activity({ type: 'conversationUpdate', membersAdded: [{ id: `28:${BOT}` }], value: undefined, name: undefined });
  assert.equal((await handler(request(install))).statusCode, 200);
  assert.deepEqual(items.get(INSTALL_KEY), { pk: INSTALL_KEY, serviceUrl, tenantId: TENANT, teamId: '19:team@thread.tacv2',
    conversationId: '19:chan@thread.tacv2;messageid=100', updatedAt: NOW, revision: 1 });
  assert.equal((await handler(request(activity({ type: 'message', text: 'hello', value: undefined })))).statusCode, 200);
  assert.deepEqual(body(await handler(request(activity({ name: 'composeExtension/query' })))).statusCode, 400);
  assert.deepEqual(calls, []);
});

test('with the flag off, buttons answer that approval in Teams is not enabled and change nothing', async () => {
  const { handler, items, calls } = setup({ approvalsEnabled: false });
  const response = await handler(request(activity()));
  assert.equal(response.statusCode, 200);
  assert.deepEqual(body(response), { statusCode: 200, type: 'application/vnd.microsoft.activity.message', value: NOT_ENABLED });
  assert.deepEqual(calls, [], 'no approver lookup, CRM read, mirror or hint');
  assert.equal(items.size, 0);
});

test('with the flag on, only approver-group members can decide, and every guard is checked live', async () => {
  const denied = setup({ member: false });
  assert.deepEqual(body(await denied.handler(request(activity()))), { statusCode: 403, type: 'application/vnd.microsoft.error',
    value: { code: 'Forbidden', message: 'You are not on the OPDA approver list.' } });
  assert.deepEqual(denied.calls, [['member', GROUP, APPROVER]]);
  const anonymous = setup();
  assert.equal(body(await anonymous.handler(request(activity({ from: { id: '29:user', name: 'x' } })))).statusCode, 401);
  const unknownGroup = setup();
  assert.equal(body(await unknownGroup.handler(request(activity({ value: { action: { type: 'Action.Execute', verb: 'approve',
    data: { registrationId: id, domainId: 'technology', v: 1 } } } })))).statusCode, 400);
  const otherGroup = setup();
  assert.equal(body(await otherGroup.handler(request(activity({ value: { action: { type: 'Action.Execute', verb: 'approve',
    data: { registrationId: id, domainId: 'estate-agency', v: 1 } } } })))).statusCode, 410, 'not requested by the applicant');
  const unlinked = setup({ claim: { state: 'open' } });
  assert.match(body(await unlinked.handler(request(activity()))).value, /No single HubSpot contact/);
  const drifted = setup({ crmPatch: { opda_requested_working_groups: 'finance-and-banking' } });
  assert.match(body(await drifted.handler(request(activity()))).value, /HubSpot no longer matches/);
  assert.equal(drifted.items.size, 0);
});

test('an authorised approval is recorded with the Teams identity and message, mirrored, hinted and rendered', async () => {
  const { handler, items, calls } = setup();
  const response = await handler(request(activity()));
  assert.equal(response.statusCode, 200);
  const card = body(response);
  assert.equal(card.type, 'application/vnd.microsoft.card.adaptive');
  const record = items.get(reviewKey('123', 'conveyancing'));
  assert.equal(record.status, 'approved');
  assert.equal(record.actorObjectId, APPROVER);
  assert.equal(record.actorName, 'Ada Reviewer');
  assert.equal(record.messageId, '100');
  assert.equal(record.conversationId, '19:chan@thread.tacv2;messageid=100');
  assert.equal(record.at, NOW);
  assert.equal(record.mirroredAt, NOW);
  assert.equal(record.decisionId, teamsDecisionId(record));
  assert.deepEqual(calls, [['member', GROUP, APPROVER], ['crm-read', '123'], ['mirror', '123', 'conveyancing', 'approved'],
    ['hint', '123'], ['update', '19:chan@thread.tacv2;messageid=100', '100']]);
  const rows = card.value.body.filter(block => block.type === 'ColumnSet');
  assert.match(rows[0].columns[1].items[0].text, /^Approved by Ada Reviewer/);
  assert.equal(rows[1].columns[1].items[0].actions.length, 2, 'the other requested group is still open');
  // A replayed click on a decided group is idempotent: same record, no second mirror or hint.
  calls.length = 0;
  await handler(request(activity()));
  assert.deepEqual(calls, [['member', GROUP, APPROVER], ['crm-read', '123']]);
  assert.equal(items.get(reviewKey('123', 'conveyancing')).revision, 2);
});

test('a failed CRM mirror keeps the record unmirrored so the worker ignores it, and a retry completes it', async () => {
  const { handler, items, calls, crm } = setup();
  crm.failMirror = true;
  const failed = body(await handler(request(activity())));
  assert.equal(failed.statusCode, 502);
  assert.equal(items.get(reviewKey('123', 'conveyancing')).mirroredAt, null);
  assert.ok(!calls.some(call => call[0] === 'hint'), 'no hint before the mirror');
  crm.failMirror = false;
  const retried = body(await handler(request(activity())));
  assert.equal(retried.statusCode, 200);
  assert.equal(items.get(reviewKey('123', 'conveyancing')).mirroredAt, NOW);
  assert.ok(calls.some(call => call[0] === 'hint'));
  // A later rejection is a new decision, not a replay.
  const rejected = body(await handler(request(activity({ value: { action: { type: 'Action.Execute', verb: 'reject',
    data: { registrationId: id, domainId: 'conveyancing', v: 1 } } } }))));
  assert.equal(rejected.statusCode, 200);
  assert.equal(items.get(reviewKey('123', 'conveyancing')).status, 'rejected');
});
