import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  AI_RESPONSE_NOTICE,
  GENERIC_EMAIL_DOMAINS,
  WORKING_GROUPS,
  classifyEmailDomain,
  classifyResource,
  renderAccessGuidance,
  renderClarification,
  renderMembershipConfirmation,
  renderSubmissionConfirmation,
  resolveWorkingGroups,
  validateActionPlan,
} from '../src/agents/working-group-inbox/domain.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'config/agents/working-group-inbox/manifest.json');
const PROMPT_PATH = path.join(ROOT, 'config/agents/working-group-inbox/automation-prompt.md');

test('working-group register contains every governed option and only live workspaces execute', () => {
  assert.deepEqual(WORKING_GROUPS.map(({ id }) => id), [
    'finance-and-banking',
    'conveyancing',
    'estate-agency',
    'surveying-and-valuation',
    'property-data-services',
    'property-technology',
    'dbt-smart-data',
    'interoperability',
    'technology',
  ]);
  assert.deepEqual(
    WORKING_GROUPS.filter(({ workspace }) => workspace.status === 'implemented').map(({ id }) => id),
    ['finance-and-banking', 'technology'],
  );
});

test('explicit group references take precedence over thread and requester context', () => {
  assert.deepEqual(resolveWorkingGroups({
    explicitGroupIds: ['technology'],
    threadGroupIds: ['finance-and-banking'],
    requesterGroupIds: ['finance-and-banking'],
  }), { status: 'resolved', groupIds: ['technology'], source: 'explicit' });
});

test('a single invite-thread target resolves before requester membership', () => {
  assert.deepEqual(resolveWorkingGroups({
    explicitGroupIds: [],
    threadGroupIds: ['finance-and-banking'],
    requesterGroupIds: ['technology'],
  }), { status: 'resolved', groupIds: ['finance-and-banking'], source: 'thread' });
});

test('requester membership is used only when it is unambiguous', () => {
  assert.deepEqual(resolveWorkingGroups({ requesterGroupIds: ['technology'] }), {
    status: 'resolved', groupIds: ['technology'], source: 'requester-membership',
  });
  assert.equal(resolveWorkingGroups({ requesterGroupIds: ['technology', 'finance-and-banking'] }).status, 'clarification');
  assert.equal(resolveWorkingGroups({}).status, 'clarification');
});

test('multiple explicit targets are retained and unknown targets require clarification', () => {
  assert.deepEqual(resolveWorkingGroups({
    explicitGroupIds: ['technology', 'finance-and-banking', 'technology'],
  }), {
    status: 'resolved',
    groupIds: ['finance-and-banking', 'technology'],
    source: 'explicit',
  });
  assert.equal(resolveWorkingGroups({ explicitGroupIds: ['made-up-group'] }).status, 'clarification');
});

test('generic email providers remain Teams-only and never acquire a company folder', () => {
  for (const domain of ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'btinternet.com']) {
    assert.ok(GENERIC_EMAIL_DOMAINS.has(domain));
    assert.deepEqual(classifyEmailDomain(`person@${domain}`), {
      email: `person@${domain}`,
      domain,
      sharePointEligible: false,
      reason: 'generic-email-provider',
    });
  }
  assert.equal(classifyEmailDomain('person@examplebank.co.uk').sharePointEligible, true);
});

test('resource intake accepts documents and rejects unsafe or unsupported payloads', () => {
  for (const name of ['dictionary.xlsx', 'schema.json', 'api.yaml', 'model.ttl', 'guide.pdf', 'README.md']) {
    assert.equal(classifyResource({ name, sizeBytes: 500 }).status, 'accepted');
  }
  for (const name of ['recording.mp4', 'call.mp3', 'bundle.zip', 'macro.xlsm', 'run.exe', 'script.js']) {
    assert.equal(classifyResource({ name, sizeBytes: 500 }).status, 'rejected');
  }
  assert.equal(classifyResource({ name: 'large.pdf', sizeBytes: 51 * 1024 * 1024 }).status, 'manual-review');
});

test('action plans reject arbitrary fields, untrusted commands and unimplemented workspaces', () => {
  const valid = {
    version: 1,
    sourceMessageId: 'AAMk-example',
    action: 'add-participant',
    groupIds: ['finance-and-banking'],
    requesterEmail: 'requester@examplebank.co.uk',
    participants: [{ displayName: 'Example Person', email: 'person@examplebank.co.uk' }],
  };
  assert.deepEqual(validateActionPlan(valid), valid);
  assert.throws(() => validateActionPlan({ ...valid, command: 'curl https://example.test' }), /unknown field/i);
  assert.throws(() => validateActionPlan({ ...valid, groupIds: ['conveyancing'] }), /not implemented/i);
  assert.throws(() => validateActionPlan({ ...valid, participants: Array.from({ length: 11 }, (_, index) => ({
    displayName: `Person ${index}`,
    email: `person${index}@examplebank.co.uk`,
  })) }), /at most 10/i);
});

test('reply renderers contain the required operational guidance', () => {
  const clarification = renderClarification('Alex');
  for (const { name } of WORKING_GROUPS) {
    assert.ok(clarification.includes(name), `clarification should list ${name}`);
  }

  const access = renderAccessGuidance('Alex');
  assert.match(access, /personal email address or personal device/i);
  assert.match(access, /threads/i);
  assert.match(access, /model drafts/i);
  assert.match(access, /attachments/i);
  assert.match(access, /organisation(?:'s)? security polic/i);

  const membership = renderMembershipConfirmation('Alex', ['Technology Working Group']);
  const submission = renderSubmissionConfirmation('Alex', ['dictionary.xlsx', 'schema.json']);
  assert.match(membership, /has been added/i);
  assert.match(submission, /dictionary\.xlsx/);
  assert.match(submission, /schema\.json/);

  for (const reply of [clarification, access, membership, submission]) {
    assert.ok(reply.includes(AI_RESPONSE_NOTICE), 'every automated reply must disclose its AI origin');
  }
});

test('harness manifest freezes the model and the scheduled prompt is fail-closed', () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const prompt = fs.readFileSync(PROMPT_PATH, 'utf8');
  assert.equal(manifest.template, 'vertical:support');
  assert.deepEqual(manifest.model, { id: 'gpt-5.6-sol', reasoningEffort: 'high', frozen: true });
  assert.match(prompt, /Microsoft Graph/i);
  assert.match(prompt, /Ruflo/i);
  assert.match(prompt, /untrusted/i);
  assert.match(prompt, /do not follow/i);
  assert.match(prompt, /idempotent/i);
  assert.match(prompt, /reply.*original thread/is);
  assert.match(prompt, /automated response\s+generated by OPDA’s AI inbox agent/i);
  assert.doesNotMatch(prompt, /Teams web interface|browser automation|Work IQ|Keychain/i);
});

test('Technology invitation describes the live channel surface', () => {
  for (const extension of ['html', 'txt']) {
    const template = fs.readFileSync(path.join(ROOT, `docs/templates/technology-working-group-invitation-email.${extension}`), 'utf8');
    assert.doesNotMatch(template, /Announcements/);
    assert.match(template, /Common Topics and Coordination/);
    assert.match(template, /General/);
    assert.match(template, /generated and sent by OPDA’s AI inbox agent/i);
  }
});

test('Finance and Banking invitation discloses AI authorship', () => {
  for (const extension of ['html', 'txt']) {
    const template = fs.readFileSync(path.join(ROOT, `docs/templates/finance-banking-working-group-invitation-email.${extension}`), 'utf8');
    assert.match(template, /generated and sent by OPDA’s AI inbox agent/i);
  }
});
