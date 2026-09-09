import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DOMAIN_TEMPLATE_CONTRACTS } from '../src/approval-onboarding/domain-templates.mjs';
import {
  WITHDRAWAL_NOTICE_KINDS, buildWithdrawalNoticePayload,
  compileWithdrawalNoticeTemplate, withdrawalNoticeContract,
} from '../src/approval-onboarding/withdrawal-notice.mjs';

const source = name => readFileSync(new URL(`../docs/templates/${name}`, import.meta.url), 'utf8');
const shells = {
  HtmlBody: source('participation-access-change-email.html'),
  TextBody: source('participation-access-change-email.txt'),
};
const originalHtml = source('domain-working-group-approval-invitation-email.html');
const groupIds = Object.keys(DOMAIN_TEMPLATE_CONTRACTS);
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const input = Object.freeze({ displayName: ' Alex O’Neill & "colleagues" ', email: 'Alex@example.org' });
const groupOptions = Object.freeze({ kind: 'group-withdrawn', groupId: 'conveyancing', logoBase64 });

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const render = (body, model, html) => body.replace(/{{(\w+)}}/g, (_, key) => html ? escapeHtml(model[key]) : model[key]);
const cases = () => [...groupIds.map(groupId => ['group-withdrawn', groupId]), ['website-disabled', undefined]];

test('two finite notice kinds have seven immutable, separate versioned contracts', () => {
  assert.deepEqual(WITHDRAWAL_NOTICE_KINDS, ['group-withdrawn', 'website-disabled']);
  assert.equal(Object.isFrozen(WITHDRAWAL_NOTICE_KINDS), true);
  const aliases = new Set(); const subjects = new Set();
  for (const [kind, groupId] of cases()) {
    const contract = withdrawalNoticeContract(kind, groupId);
    assert.equal(Object.isFrozen(contract), true);
    assert.equal(contract.kind, kind);
    assert.equal(contract.version, 1);
    if (groupId) {
      assert.equal(contract.groupId, groupId);
      assert.equal(contract.groupName, DOMAIN_TEMPLATE_CONTRACTS[groupId].groupName);
      assert.equal(contract.alias, `${groupId}-approval-withdrawn-v1`);
      assert.equal(contract.subject, `Your ${contract.groupName} approval has been withdrawn`);
    } else {
      assert.equal(contract.alias, 'website-login-disabled-v1');
      assert.equal(contract.subject, 'Your OPDA website sign-in has been disabled');
      assert.equal(Object.hasOwn(contract, 'groupId'), false);
      assert.equal(Object.hasOwn(contract, 'groupName'), false);
    }
    aliases.add(contract.alias); subjects.add(contract.subject);
    assert.deepEqual(withdrawalNoticeContract(kind, groupId), contract);
  }
  assert.equal(aliases.size, 7); assert.equal(subjects.size, 7);
});

test('unknown or cross-scope kinds and groups cannot select a notice contract', () => {
  for (const kind of [undefined, null, '', 'withdrawn', 'all-groups', {}, ['group-withdrawn']]) {
    assert.throws(() => withdrawalNoticeContract(kind, 'conveyancing'), /Invalid withdrawal notice/);
  }
  for (const groupId of [undefined, null, '', 'technology', 'unknown', 'CONVEYANCING', {}, ['conveyancing']]) {
    assert.throws(() => withdrawalNoticeContract('group-withdrawn', groupId), /Invalid withdrawal notice/);
  }
  for (const groupId of [...groupIds, null, '', [], {}]) {
    assert.throws(() => withdrawalNoticeContract('website-disabled', groupId), /Invalid withdrawal notice/);
  }
});

test('every notice compiles from one shell using the original invitation visual layout', () => {
  const header = html => html.slice(html.indexOf('<tr><td style="padding:22px 32px;background:#2c273b;'), html.indexOf('<tr><td style="padding:38px 32px 22px;'));
  const before = structuredClone(shells);
  for (const [kind, groupId] of cases()) {
    const contract = withdrawalNoticeContract(kind, groupId);
    const template = compileWithdrawalNoticeTemplate(kind, groupId, shells);
    assert.equal(template.Alias, contract.alias); assert.equal(template.Subject, contract.subject);
    assert.equal(template.TemplateType, 'Standard'); assert.equal(template.LayoutTemplate, null);
    assert.equal(Object.isFrozen(template), true);
    assert.equal(header(template.HtmlBody), header(originalHtml));
    for (const style of ['width="680"', 'background:#faf9f5', 'max-width:680px;background:#ffffff;border:1px solid #e6dfd0;border-radius:16px;',
      "font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:43px", 'background:#211f1c;color:#b8b1a3']) {
      assert.ok(originalHtml.includes(style), style);
      assert.ok(template.HtmlBody.includes(style), style);
    }
    assert.match(template.HtmlBody, /src="cid:opda-logo"/);
    assert.match(template.HtmlBody, /🔐 Your access/);
    assert.match(template.HtmlBody, /✉️ Need help\?/);
    assert.doesNotMatch(template.HtmlBody + template.TextBody, /\[\[|pm:unsubscribe|{{{|AI inbox agent|newsletter|campaign|recruitment|tracking pixel/i);
    assert.deepEqual([...new Set([...template.HtmlBody.matchAll(/{{(\w+)}}/g)].map(m => m[1]))], ['display_name']);
    assert.deepEqual([...new Set([...template.TextBody.matchAll(/{{(\w+)}}/g)].map(m => m[1]))], ['display_name']);
    assert.deepEqual(compileWithdrawalNoticeTemplate(kind, groupId, shells), template);
  }
  assert.deepEqual(shells, before);
});

test('each group notice names only its withdrawn group and preserves still-approved groups', () => {
  for (const groupId of groupIds) {
    const template = compileWithdrawalNoticeTemplate('group-withdrawn', groupId, shells);
    for (const body of [template.HtmlBody, template.TextBody]) {
      assert.ok(body.includes(DOMAIN_TEMPLATE_CONTRACTS[groupId].groupName));
      assert.match(body, /approval.*has been withdrawn/s);
      assert.match(body, /no longer have.*Microsoft Teams.*SharePoint/s);
      assert.match(body, /granted through this approval/);
      assert.match(body, /other working group that remains approved/);
      assert.match(body, /does not change your approval or access/);
      assert.match(body, /smartdata@openpropdata.org.uk/);
      assert.doesNotMatch(body, /website sign-in has been disabled|all.*access.*removed|all.*memberships.*removed|deleted your/i);
      for (const otherId of groupIds.filter(id => id !== groupId)) assert.ok(!body.includes(DOMAIN_TEMPLATE_CONTRACTS[otherId].groupName));
    }
  }
});

test('website notice separately explains last-group loss and disabled sign-in, with no workspace claim', () => {
  const template = compileWithdrawalNoticeTemplate('website-disabled', undefined, shells);
  for (const body of [template.HtmlBody, template.TextBody]) {
    assert.match(body, /no longer have any approved OPDA working groups/);
    assert.match(body, /website sign-in has been disabled/);
    assert.match(body, /cannot sign in to the OPDA website/);
    assert.match(body, /If you believe this change is incorrect/);
    assert.match(body, /smartdata@openpropdata.org.uk/);
    assert.doesNotMatch(body, /Teams|SharePoint|microsoft|Cognito|_auth\/login|{{group_/i);
    for (const groupId of groupIds) assert.ok(!body.includes(DOMAIN_TEMPLATE_CONTRACTS[groupId].groupName));
  }
});

test('payload fixes one recipient, transactional stream, no tracking and the existing inline logo', () => {
  for (const [kind, groupId] of cases()) {
    const contract = withdrawalNoticeContract(kind, groupId);
    const payload = buildWithdrawalNoticePayload(input, { kind, groupId, logoBase64 });
    assert.equal(payload.To, 'alex@example.org');
    assert.equal(payload.From, 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>');
    assert.equal(payload.ReplyTo, 'smartdata@openpropdata.org.uk');
    assert.equal(payload.TemplateAlias, contract.alias);
    assert.equal(payload.MessageStream, 'outbound');
    assert.equal(payload.TrackLinks, 'None'); assert.equal(payload.TrackOpens, false);
    assert.equal(payload.InlineCss, true);
    assert.deepEqual(payload.Attachments, [{ Name: 'opda-email-logo.png', Content: logoBase64, ContentType: 'image/png', ContentID: 'cid:opda-logo' }]);
    assert.deepEqual(payload.TemplateModel, { display_name: input.displayName.trim(), notice_kind: kind,
      ...(groupId ? { group_id: groupId, group_name: contract.groupName } : {}) });
    for (const field of ['Cc', 'Bcc', 'HtmlBody', 'TextBody', 'Subject', 'Metadata', 'Tag']) assert.equal(Object.hasOwn(payload, field), false);
  }
});

test('two-brace rendering escapes names once in HTML and preserves plain text without mutating input', () => {
  const before = structuredClone(input);
  const first = buildWithdrawalNoticePayload(input, groupOptions);
  const template = compileWithdrawalNoticeTemplate(groupOptions.kind, groupOptions.groupId, shells);
  const html = render(template.HtmlBody, first.TemplateModel, true);
  const plain = render(template.TextBody, first.TemplateModel, false);
  assert.match(html, /Hello Alex O’Neill &amp; &quot;colleagues&quot;,/);
  assert.match(plain, /Hello Alex O’Neill & "colleagues",/);
  assert.doesNotMatch(html + plain, /{{|\[\[/);
  assert.deepEqual(input, before);
  first.TemplateModel.display_name = 'changed';
  first.Attachments[0].Name = 'changed';
  assert.equal(buildWithdrawalNoticePayload(input, groupOptions).TemplateModel.display_name, before.displayName.trim());
  assert.equal(buildWithdrawalNoticePayload(input, groupOptions).Attachments[0].Name, 'opda-email-logo.png');
});

test('recipient addresses reject multiple recipients, headers, whitespace and out-of-bound address parts', () => {
  for (const email of [undefined, null, '', 'a@example.org,b@example.org', 'A <a@example.org>', ' a@example.org', 'a@example.org ',
    'a@example.org\r\nBcc:b@example.org', 'a@localhost', 'a b@example.org', '.a@example.org', 'a..b@example.org', 'a@-example.org',
    'a@example.org?subject=x', `${'a'.repeat(65)}@example.org`, `a@${'x'.repeat(64)}.org`, `${'a'.repeat(64)}@${'x'.repeat(63)}.${'y'.repeat(63)}.${'z'.repeat(63)}.org`]) {
    assert.throws(() => buildWithdrawalNoticePayload({ ...input, email }, groupOptions), /Invalid withdrawal notice/);
  }
  assert.equal(buildWithdrawalNoticePayload({ ...input, email: 'Alex+Group@EXAMPLE.ORG' }, groupOptions).To, 'alex+group@example.org');
});

test('display names reject injection, unsafe controls, empty text and excessive length', () => {
  for (const displayName of [undefined, null, '', '   ', '<script>bad</script>', '{{{evil}}}', 'A\r\nB', 'A\u202eB',
    'A\u200bB', 'A\u2066B', 'x'.repeat(257), 42]) {
    assert.throws(() => buildWithdrawalNoticePayload({ ...input, displayName }, groupOptions), /Invalid withdrawal notice/);
  }
  assert.equal(buildWithdrawalNoticePayload({ ...input, displayName: 'Zoë O’Connor' }, groupOptions).TemplateModel.display_name, 'Zoë O’Connor');
});

test('builder rejects custom scope, sender, model, stream, provider metadata and unsafe object shapes', () => {
  for (const value of [undefined, null, [], Object.assign(Object.create({ inherited: true }), input),
    { ...input, groupId: 'estate-agency' }, { ...input, groups: [] }, { ...input, subject: 'custom' },
    { ...input, TemplateModel: {} }, { ...input, email: { toString: () => input.email } }]) {
    assert.throws(() => buildWithdrawalNoticePayload(value, groupOptions), /Invalid withdrawal notice/);
  }
  for (const options of [undefined, null, [], {}, { ...groupOptions, kind: 'unknown' }, { ...groupOptions, groupId: 'technology' },
    { ...groupOptions, kind: 'website-disabled' }, { ...groupOptions, MessageStream: 'broadcast' },
    { ...groupOptions, TrackOpens: true }, { ...groupOptions, subject: 'custom' }, { ...groupOptions, Metadata: {} }]) {
    assert.throws(() => buildWithdrawalNoticePayload(input, options), /Invalid withdrawal notice/);
  }
  for (const value of [input, groupOptions]) {
    const accessor = { ...value };
    Object.defineProperty(accessor, 'email' in value ? 'email' : 'kind', { get() { throw new Error('must not evaluate'); }, enumerable: true });
    assert.throws(() => 'email' in value ? buildWithdrawalNoticePayload(accessor, groupOptions) : buildWithdrawalNoticePayload(input, accessor), /Invalid withdrawal notice/);
  }
  const hidden = { ...input };
  Object.defineProperty(hidden, 'bcc', { value: 'another@example.org' });
  assert.throws(() => buildWithdrawalNoticePayload(hidden, groupOptions), /Invalid withdrawal notice/);
  assert.throws(() => buildWithdrawalNoticePayload({ ...input, [Symbol('override')]: true }, groupOptions), /Invalid withdrawal notice/);
});

test('logo validation accepts only bounded base64 PNG data', () => {
  for (const value of [undefined, null, '', 'not base64', 'a'.repeat(350_004), Buffer.from('<svg/>').toString('base64'),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString('base64')]) {
    assert.throws(() => buildWithdrawalNoticePayload(input, { ...groupOptions, logoBase64: value }), /Invalid withdrawal notice/);
  }
});

test('compiler rejects malformed, arbitrary, raw-interpolation or incomplete shells', () => {
  for (const value of [undefined, null, [], {}, { ...shells, HtmlBody: '' }, { ...shells, TextBody: '' },
    { ...shells, Subject: 'override' }, { ...shells, HtmlBody: 'x'.repeat(500_001) },
    { ...shells, HtmlBody: shells.HtmlBody.replace('cid:opda-logo', 'https://example.org/logo') },
    { ...shells, TextBody: shells.TextBody.replace('[[ACCESS_DETAIL]]', '') },
    { ...shells, HtmlBody: `${shells.HtmlBody}[[UNREVIEWED_SLOT]]` },
    { ...shells, TextBody: `${shells.TextBody}[[not_reviewed]]` },
    { ...shells, HtmlBody: shells.HtmlBody.replace('{{display_name}}', '{{{display_name}}}') },
    { ...shells, TextBody: `${shells.TextBody}{{unreviewed}}` },
    { ...shells, HtmlBody: `${shells.HtmlBody}{{{ pm:unsubscribe }}}` }]) {
    assert.throws(() => compileWithdrawalNoticeTemplate('group-withdrawn', 'conveyancing', value), /Invalid withdrawal notice/);
  }
  const accessor = { ...shells };
  Object.defineProperty(accessor, 'HtmlBody', { get() { throw new Error('must not evaluate'); }, enumerable: true });
  assert.throws(() => compileWithdrawalNoticeTemplate('website-disabled', undefined, accessor), /Invalid withdrawal notice/);
});

test('all notice sources stay below the repository file-size limit', () => {
  for (const path of ['../src/approval-onboarding/withdrawal-notice.mjs', '../docs/templates/participation-access-change-email.html',
    '../docs/templates/participation-access-change-email.txt', './approval-onboarding-withdrawal-notice.test.mjs']) {
    assert.ok(readFileSync(new URL(path, import.meta.url), 'utf8').split('\n').length < 500, path);
  }
});
