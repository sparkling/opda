import test from 'node:test';
import assert from 'node:assert/strict';
import { addWebsiteDisabledNotice } from '../config/aws/hubspot-approval/access-notices.mjs';

const row = { pk: 'USER#sub-123', participantId: 'participant-123', cognitoSub: 'sub-123', active: true, accessVersion: 2 };
const map = { pk: 'CRM#CONTACT#123', contactId: '123' };
function fixture({ active = false, domains = [], withdrawal = true } = {}) {
  return { fields: { active, approvedDomains: domains, accessVersion: 3 }, mapFields: {},
    operations: [{ operationId: 'a'.repeat(64), action: 'revoke' }],
    audits: [{ decisionId: 'b'.repeat(64), onboarding: { notifyWithdrawal: withdrawal } }] };
}
test('last-domain loss adds one distinct durable website notice with the same access transition', () => {
  const plan = fixture();
  addWebsiteDisabledNotice(plan, map, row, 1000);
  const notice = plan.operations.at(-1);
  assert.equal(plan.operations.length, 2);
  assert.equal(notice.schemaVersion, 3);
  assert.equal(notice.noticeKind, 'website-disabled');
  assert.equal(notice.accessVersion, 3);
  assert.equal(notice.action, 'revoke');
  assert.deepEqual(plan.fields.accessNotice, plan.mapFields.accessNotice);
  assert.equal(plan.fields.accessNotice.operationId, notice.operationId);
  assert.deepEqual(plan.audits.at(-1).onboarding, plan.fields.accessNotice);
  const repeated = fixture(); addWebsiteDisabledNotice(repeated, map, row, 1000);
  assert.equal(repeated.operations.at(-1).operationId, notice.operationId);
});
test('partial loss, never approved, legacy-only normalisation and repeated denial send no website notice', () => {
  for (const [plan, before] of [
    [fixture({ active: true, domains: ['conveyancing'] }), row],
    [fixture(), { ...row, active: false }],
    [fixture({ withdrawal: false }), row],
    [fixture({ domains: ['conveyancing'] }), row],
  ]) {
    addWebsiteDisabledNotice(plan, map, before, 1000);
    assert.equal(plan.operations.length, 1);
    assert.equal(plan.fields.accessNotice, undefined);
  }
});
test('simultaneous group removals create only one website notice, and later cycles get a different identity', () => {
  const plan = fixture(); plan.audits.push({ decisionId: 'c'.repeat(64), onboarding: { notifyWithdrawal: true } });
  addWebsiteDisabledNotice(plan, map, row, 1000);
  assert.equal(plan.operations.filter(op => op.noticeKind === 'website-disabled').length, 1);
  const later = fixture(); later.fields.accessVersion = 5; addWebsiteDisabledNotice(later, map, { ...row, accessVersion: 4 }, 2000);
  assert.notEqual(later.fields.accessNotice.operationId, plan.fields.accessNotice.operationId);
});
