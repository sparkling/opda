import assert from 'node:assert/strict';
import test from 'node:test';
import { approvedGroupSnapshot, digest, reviewDecision } from '../config/aws/hubspot-approval/domain.mjs';
import { createHubSpotClient } from '../config/aws/hubspot-approval/client.mjs';
import { APP_SCOPES } from '../config/aws/hubspot-participation/admin.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';

const now = Date.parse('2026-09-09T12:00:00Z');
const entry = (value, at = now - 2000, extra = {}) => ({ value,
  timestamp: new Date(at).toISOString(), sourceType: 'CRM_UI', sourceId: 'userId:42', updatedByUserId: 42, ...extra });
const contact = (history = [entry('conveyancing;finance-and-banking')]) => ({ id: '123', properties: {
  email: 'synthetic@example.test', opda_review_status: 'approved',
  opda_requested_working_groups: history?.[0]?.value,
}, propertiesWithHistory: { opda_review_status: [entry('approved', now - 1000)],
  opda_requested_working_groups: history } });
const decision = c => reviewDecision(c, { cutover: now - 10000, now });
const snapshot = c => approvedGroupSnapshot(c, decision(c));

test('trusted approval freezes canonical groups and a stable digest from history, not property order', () => {
  const actual = snapshot(contact());
  assert.deepEqual(actual, { snapshotStatus: 'approved', groups: ['finance-and-banking', 'conveyancing'],
    groupDigest: digest(JSON.stringify(['finance-and-banking', 'conveyancing'])), groupsAt: now - 2000,
    reason: 'reviewed-group-selection' });
  assert.deepEqual(snapshot(contact([entry('finance-and-banking;conveyancing')])), actual);
});

test('later selected groups never expand an earlier approval, even before its first delivery', () => {
  const c = contact([entry('property-technology', now), entry('conveyancing', now - 2000)]);
  assert.deepEqual(snapshot(c).groups, ['conveyancing']);
  c.propertiesWithHistory.opda_review_status = [entry('approved', now + 1000)];
  assert.deepEqual(snapshot(c).groups, ['property-technology']);
});

test('the selection effective exactly at the approval timestamp is included', () => {
  assert.deepEqual(snapshot(contact([entry('estate-agency', now - 1000)])).groups, ['estate-agency']);
});

test('empty recorded selections grant no groups; missing or future-only history requires review', () => {
  const empty = snapshot(contact([entry('')]));
  assert.equal(empty.snapshotStatus, 'empty'); assert.deepEqual(empty.groups, []);
  for (const history of [undefined, [], null, 'invalid', [entry('conveyancing', now)]]) {
    const c = contact(); c.propertiesWithHistory.opda_requested_working_groups = history;
    const actual = snapshot(c);
    assert.equal(actual.snapshotStatus, 'review_required'); assert.deepEqual(actual.groups, []);
  }
});

test('unknown, malformed, duplicated and oversized group values fail closed', () => {
  for (const value of ['technology', 'interoperability', 'dbt-smart-data', 'conveyancing;technology',
    'conveyancing;conveyancing', ';conveyancing', 'conveyancing;', ' conveyancing ', null, 7, 'x'.repeat(1025)]) {
    const actual = snapshot(contact([entry(value)]));
    assert.equal(actual.snapshotStatus, 'review_required'); assert.deepEqual(actual.groups, []);
  }
});

test('every tied effective history entry must agree, including source provenance', () => {
  const original = entry('conveyancing');
  assert.deepEqual(snapshot(contact([original, { ...original }])).groups, ['conveyancing']);
  for (const patch of [{ value: 'estate-agency' }, { updatedByUserId: 99 }, { sourceType: 'INTEGRATION' }, { sourceId: 'other' }]) {
    const result = snapshot(contact([original, { ...original }, { ...original, ...patch }]));
    assert.equal(result.snapshotStatus, 'review_required'); assert.deepEqual(result.groups, []);
  }
});

test('malformed, unbounded or contradictory histories cannot become a snapshot', () => {
  for (const history of [[null], [[]], [{ value: 'conveyancing', timestamp: 'invalid' }],
    [entry('conveyancing'), entry('estate-agency', now, { timestamp: 'invalid' })],
    Array.from({ length: 2001 }, () => entry('conveyancing'))]) {
    assert.equal(snapshot(contact(history)).snapshotStatus, 'review_required');
  }
  const c = contact(); c.properties.opda_requested_working_groups = 'estate-agency';
  assert.equal(snapshot(c).snapshotStatus, 'review_required');
});

test('requested groups need not originate in CRM_UI; the manual review supplies authority', () => {
  const c = contact([entry('conveyancing', now - 2000, { sourceType: 'INTEGRATION', sourceId: 'app', updatedByUserId: undefined })]);
  assert.deepEqual(snapshot(c).groups, ['conveyancing']);
  c.propertiesWithHistory.opda_review_status[0].sourceType = 'INTEGRATION';
  assert.equal(snapshot(c).snapshotStatus, 'review_required');
});

test('CRM reader requests group history while malformed groups do not hide a withdrawal', async () => {
  const requests = [];
  const c = contact(); c.properties.opda_review_status = 'withdrawn';
  c.propertiesWithHistory.opda_review_status = [entry('withdrawn', now - 1000)];
  c.propertiesWithHistory.opda_requested_working_groups = { malformed: true };
  const client = createHubSpotClient({ secretArn: 'fixture', now: () => now,
    getSecret: async () => ({ portalId: 144765514, appId: 52397854, role: 'bridge', accessToken: `pat-${'x'.repeat(30)}` }),
    fetch: async url => {
      requests.push(new URL(url));
      return new Response(JSON.stringify(url.includes('/oauth/')
        ? { hubId: 144765514, appId: 52397854, scopes: APP_SCOPES.bridge } : c));
    } });
  const result = await client.getContact('123');
  assert.equal(decision(result).status, 'withdrawn');
  assert.deepEqual(requests[1].searchParams.get('propertiesWithHistory').split(','),
    ['opda_review_status', 'email', 'opda_requested_working_groups', ...Object.values(DOMAIN_REVIEW_PROPERTIES)]);
});
