import assert from 'node:assert/strict';
import test from 'node:test';
import { domainReviewDecisions } from '../config/aws/hubspot-approval/domain-reviews.mjs';
import { DOMAIN_REVIEW_PROPERTIES } from '../config/aws/hubspot-participation/properties.mjs';
import { digest } from '../config/aws/hubspot-approval/domain.mjs';

const NOW = Date.parse('2026-09-09T14:00:00Z');
const CUTOVER = NOW - 600000;
const policy = { cutover: CUTOVER, now: NOW };
const FINANCE = 'finance-and-banking', CONVEYANCING = 'conveyancing';
const history = (value, at = NOW - 1000, patch = {}) => ({ value,
  timestamp: new Date(at).toISOString(), sourceType: 'CRM_UI',
  sourceId: 'userId:456', updatedByUserId: 456, ...patch });
function contact(reviews = { [FINANCE]: 'approved' }) {
  const value = { id: '123', archived: false, properties: {
    email: 'synthetic@example.test', opda_review_status: 'approved',
    opda_requested_working_groups: `${FINANCE};${CONVEYANCING}`,
  }, propertiesWithHistory: {
    email: [history('synthetic@example.test', NOW - 10000)],
    opda_requested_working_groups: [history(`${FINANCE};${CONVEYANCING}`, NOW - 9000)],
  } };
  for (const [domainId, status] of Object.entries(reviews)) {
    const property = DOMAIN_REVIEW_PROPERTIES[domainId];
    value.properties[property] = status;
    value.propertiesWithHistory[property] = [history(status)];
  }
  return value;
}
const decisions = value => domainReviewDecisions(value, policy);
const denial = value => {
  const result = decisions(value)[0];
  assert.equal(result.trusted, false);
  assert.equal(result.status, 'under_review');
  assert.equal(result.actor, null);
  assert.equal(result.groupSnapshot, undefined);
  return result;
};

test('one manual domain approval grants only that domain, never all requested interests', () => {
  const value = contact(), before = structuredClone(value);
  const [decision] = decisions(value);
  assert.equal(decisions(value).length, 1);
  assert.equal(decision.domainId, FINANCE);
  assert.equal(decision.trusted, true);
  assert.equal(decision.status, 'approved');
  assert.equal(decision.actor, '456');
  assert.deepEqual(decision.groupSnapshot, {
    snapshotStatus: 'approved', groups: [FINANCE], groupsAt: NOW - 9000,
    groupDigest: digest(JSON.stringify([FINANCE])), reason: 'reviewed-domain-selection',
  });
  assert.deepEqual(value, before);
});

test('simultaneous domain approvals have separate IDs and deterministic domain ordering', () => {
  const result = decisions(contact({ [FINANCE]: 'approved', [CONVEYANCING]: 'approved' }));
  assert.deepEqual(result.map(item => item.domainId), [CONVEYANCING, FINANCE]);
  assert.equal(new Set(result.map(item => item.id)).size, 2);
  assert.ok(result.every(item => item.trusted && item.groupSnapshot.groups.length === 1));
});

test('global approval and requested checkboxes alone are not domain decisions', () => {
  const value = contact({});
  value.propertiesWithHistory.opda_review_status = [history('approved')];
  assert.deepEqual(decisions(value), []);
  for (const property of Object.values(DOMAIN_REVIEW_PROPERTIES)) {
    value.properties[property] = '';
    value.propertiesWithHistory[property] = [];
  }
  assert.deepEqual(decisions(value), []);
});

test('later requested-group edits cannot expand or reinterpret an earlier domain approval', () => {
  const value = contact();
  value.propertiesWithHistory.opda_requested_working_groups = [history(FINANCE, NOW - 9000),
    history(`${FINANCE};${CONVEYANCING}`, NOW - 500)];
  const [result] = decisions(value);
  assert.deepEqual(result.groupSnapshot.groups, [FINANCE]);
  value.properties[DOMAIN_REVIEW_PROPERTIES[CONVEYANCING]] = 'approved';
  value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[CONVEYANCING]] = [history('approved')];
  const other = decisions(value).find(item => item.domainId === CONVEYANCING);
  assert.equal(other.trusted, false);
  assert.equal(other.reason, 'domain-not-selected-at-review');
});

test('withdrawing one domain is independent of another approved domain', () => {
  const result = decisions(contact({ [FINANCE]: 'withdrawn', [CONVEYANCING]: 'approved' }));
  assert.equal(result.find(item => item.domainId === FINANCE).status, 'withdrawn');
  assert.equal(result.find(item => item.domainId === FINANCE).trusted, true);
  assert.deepEqual(result.find(item => item.domainId === CONVEYANCING).groupSnapshot.groups, [CONVEYANCING]);
});

test('clearing an edited field is a withdrawal; an untouched blank field has no decision', () => {
  for (const cleared of ['', null]) {
    const value = contact();
    const property = DOMAIN_REVIEW_PROPERTIES[FINANCE];
    value.properties[property] = cleared;
    value.propertiesWithHistory[property].unshift(history('', NOW));
    const [result] = decisions(value);
    assert.equal(result.status, 'withdrawn');
    assert.equal(result.trusted, true);
    assert.equal(result.reason, 'domain-review-cleared');
    assert.equal(result.groupSnapshot, undefined);
  }
});

test('API edits, forged or mismatched actors, and current/history contradictions deny the affected domain', () => {
  const property = DOMAIN_REVIEW_PROPERTIES[FINANCE];
  for (const patch of [{ sourceType: 'INTEGRATION' }, { updatedByUserId: 789 },
    { updatedByUserId: 'invalid' }, { sourceId: 'userId:invalid' },
    { updatedByUserId: Number.MAX_SAFE_INTEGER + 1, sourceId: undefined },
    { updatedByUserId: undefined, sourceId: undefined }, { value: 'received' }]) {
    const value = contact();
    Object.assign(value.propertiesWithHistory[property][0], patch);
    denial(value);
  }
});

test('missing, malformed, excessive and same-timestamp contradictory history fails closed with a stable denial ID', () => {
  const property = DOMAIN_REVIEW_PROPERTIES[FINANCE];
  for (const invalid of [undefined, [], {}, [null], [history('approved', NOW, { timestamp: 'invalid' })],
    Array.from({ length: 2001 }, () => history('approved')),
    [history('approved'), history('withdrawn')]]) {
    const value = contact();
    value.propertiesWithHistory[property] = invalid;
    const result = denial(value);
    assert.equal(domainReviewDecisions(value, { ...policy, now: NOW + 10000 })[0].id, result.id);
  }
});

test('future history cannot grant access or poison the ordering timestamp', () => {
  for (const offset of [1, 60000, 60001]) {
    const value = contact();
    value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]] = [history('approved', NOW + offset)];
    assert.equal(denial(value).at, NOW);
  }
});

test('replayed current history remains idempotent and pre-cutover edits do not invent migration grants', () => {
  const value = contact();
  const result = decisions(value);
  value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]].push(history('approved'));
  assert.deepEqual(decisions(value), result);
  value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]] = [history('approved', CUTOVER - 1)];
  assert.deepEqual(decisions(value), []);
});

test('approval requires an email predating the review and unambiguous requested history', () => {
  for (const alter of [
    value => { value.propertiesWithHistory.email = [history('synthetic@example.test', NOW)]; },
    value => { value.propertiesWithHistory.email = [history('other@example.test', NOW - 10000)]; },
    value => { value.propertiesWithHistory.email = []; },
    value => { value.properties.email = ''; value.propertiesWithHistory.email = [history('', NOW - 10000)]; },
    value => { value.propertiesWithHistory.opda_requested_working_groups = []; },
    value => { value.propertiesWithHistory.opda_requested_working_groups = [history('unknown', NOW - 9000)]; },
    value => { value.propertiesWithHistory.opda_requested_working_groups.push(history(CONVEYANCING, NOW - 9000)); },
    value => { value.properties.opda_requested_working_groups = FINANCE; },
  ]) {
    const value = contact(); alter(value); denial(value);
  }
});

test('malformed evidence in one domain does not hide a trusted withdrawal in another', () => {
  const value = contact({ [FINANCE]: 'approved', [CONVEYANCING]: 'withdrawn' });
  value.propertiesWithHistory[DOMAIN_REVIEW_PROPERTIES[FINANCE]] = {};
  const result = decisions(value);
  assert.equal(result.find(item => item.domainId === FINANCE).trusted, false);
  assert.equal(result.find(item => item.domainId === CONVEYANCING).trusted, true);
  assert.equal(result.find(item => item.domainId === CONVEYANCING).status, 'withdrawn');
});

test('invalid configuration and contact identifiers do not produce authority', () => {
  for (const options of [{ cutover: NaN }, { cutover: CUTOVER, now: -1 }, { cutover: CUTOVER, now: '123' }]) {
    assert.throws(() => domainReviewDecisions(contact(), options), /policy/);
  }
  assert.throws(() => decisions({ ...contact(), id: '../123' }), /contact/i);
  assert.deepEqual(decisions(null), []);
  assert.deepEqual(decisions({ ...contact(), archived: true }), []);
});
