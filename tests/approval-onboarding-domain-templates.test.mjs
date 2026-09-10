import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { APPROVAL_GROUP_IDS, buildInvitationModel, buildInvitationPayload } from '../src/approval-onboarding/invitation.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS, compileDomainInvitationTemplate } from '../src/approval-onboarding/domain-templates.mjs';
import { fingerprintTemplate } from '../src/approval-onboarding/postmark.mjs';
import { INVITATION_REGISTRY, TEMPLATE_PIN, TEMPLATE_PINS } from '../src/approval-onboarding/settings.mjs';

const source = (name) => readFileSync(new URL(`../docs/templates/${name}`, import.meta.url), 'utf8');
const shells = {
  HtmlBody: source('domain-working-group-approval-invitation-email.html'),
  TextBody: source('domain-working-group-approval-invitation-email.txt'),
};
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');

function inputFor(groupId, ready = true) {
  return {
    displayName: 'Synthetic Participant', email: 'synthetic@example.invalid', microsoft: { redemptionRequired: false },
    groups: [{ groupId, teamMembershipVerified: true, sourceAccess: ready
      ? { status: 'ready', permissionsVerified: true, folderUrl: `${INVITATION_REGISTRY.groups[groupId].sourceIntakeSiteUrl}/Incoming%20Source%20Material/By%20Organisation/example.invalid` }
      : { status: 'teams_only', permissionsVerified: true } }],
  };
}

// The templates use only scalar Mustachio conditionals. Each body remains independently readable.
function render(template, model) {
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function section(text, context) {
    return text.replace(/{{([#^])([\w:]+)}}([\s\S]*?){{\/\2}}/g, (_, kind, key, body) => {
      if (kind === '^') return context[key] ? '' : section(body, context);
      return context[key] ? section(body, context[key]) : '';
    }).replace(/{{{\s*pm:unsubscribe\s*}}}/g, 'https://unsubscribe.example.invalid/fixture')
      .replace(/{{([\w:.]+)}}/g, (_, key) => escape(key === '.' ? context : context[key] ?? ''));
  }
  return section(template, model);
}

test('six separately pinned invitations share the original shell but have distinct domain content', () => {
  assert.deepEqual(Object.keys(DOMAIN_TEMPLATE_CONTRACTS), APPROVAL_GROUP_IDS);
  assert.deepEqual(Object.keys(TEMPLATE_PINS), APPROVAL_GROUP_IDS);
  const aliases = new Set(); const subjects = new Set(); const hashes = new Set();
  for (const groupId of APPROVAL_GROUP_IDS) {
    const contract = DOMAIN_TEMPLATE_CONTRACTS[groupId];
    const template = compileDomainInvitationTemplate(groupId, shells);
    const pin = TEMPLATE_PINS[groupId];
    const fingerprint = fingerprintTemplate(template, { groupId });
    aliases.add(template.Alias); subjects.add(template.Subject); hashes.add(fingerprint);
    assert.equal(template.Alias, contract.alias);
    assert.match(template.Alias, /-approval-invitation-v3$/);
    assert.match(template.Name, /Approval Invitation v3$/);
    assert.equal(template.Subject, contract.subject);
    assert.equal(pin.version, 2);
    assert.equal(pin.groupId, groupId);
    assert.equal(pin.alias, contract.alias);
    assert.equal(pin.subject, contract.subject);
    assert.equal(pin.fingerprint, fingerprint);
    assert.ok(pin.templateId === null || Number.isSafeInteger(pin.templateId) && pin.templateId > 0);
    assert.match(template.HtmlBody, /width="680"/);
    assert.match(template.HtmlBody, /font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:43px/);
    assert.match(template.HtmlBody, /background:#2c273b/);
    assert.match(template.HtmlBody, /src="cid:opda-logo"/);
    assert.doesNotMatch(template.HtmlBody + template.TextBody, /\[\[|{{#each groups}}|AI inbox agent|all the working groups listed below/);
    assert.ok(template.HtmlBody.includes(contract.groupName));
    assert.ok(template.TextBody.includes(contract.groupName));
    assert.deepEqual([...template.HtmlBody.matchAll(/{{{([\s\S]*?)}}}/g)].map(m => m[1].trim()), ['pm:unsubscribe']);
    assert.throws(() => fingerprintTemplate(template), /unexpected template contract/);
    for (const other of APPROVAL_GROUP_IDS.filter(id => id !== groupId)) {
      assert.ok(!template.HtmlBody.includes(DOMAIN_TEMPLATE_CONTRACTS[other].groupName));
      assert.ok(!template.TextBody.includes(DOMAIN_TEMPLATE_CONTRACTS[other].groupName));
      assert.ok(!template.HtmlBody.includes(INVITATION_REGISTRY.groups[other].teamId));
    }
  }
  assert.equal(aliases.size, 6); assert.equal(subjects.size, 6); assert.equal(hashes.size, 6);
});

test('the original detailed guidance and illustrated section headings survive the single-domain rewrite', () => {
  for (const groupId of APPROVAL_GROUP_IDS) {
    const template = compileDomainInvitationTemplate(groupId, shells);
    for (const heading of ['🤝 Your contribution', '📤 How to contribute source material', '💬 How to participate', '🧭 Where discussions happen', '🔐 Access and privacy', '📚 Useful source material', '⛔ Do not submit', 'What happens next']) {
      assert.ok(template.HtmlBody.includes(heading), `${groupId}: ${heading}`);
    }
    for (const body of [template.HtmlBody, template.TextBody]) for (const guidance of [
      /governed family of connected domain models/, /adopt AI/, /README/, /Reply/, /Start a post/,
      /OpenAPI, Swagger and AsyncAPI/, /non-production DDL/, /Taxonomies, controlled vocabularies and semantic models/,
      /Audio and video files are not accepted/, /do not submit links/, /recordings must be transcribed/i,
      /licence or NDA/, /active scripts or macros/, /People review every candidate/,
      /not automatically published or shared with other participants/, /Unsubscribing.*does not itself remove/s,
    ]) assert.match(body, guidance);
  }
});

test('v2 requires exactly the independently approved group, with no cross-domain input or links', () => {
  for (const groupId of APPROVAL_GROUP_IDS) {
    const input = inputFor(groupId);
    const payload = buildInvitationPayload(input, INVITATION_REGISTRY, { logoBase64, groupId });
    assert.equal(payload.TemplateAlias, DOMAIN_TEMPLATE_CONTRACTS[groupId].alias);
    assert.equal(payload.TemplateModel.group_id, groupId);
    assert.deepEqual(payload.TemplateModel.groups.map(g => g.group_id), [groupId]);
    assert.equal(payload.TrackOpens, false); assert.equal(payload.TrackLinks, 'None');
    const otherId = APPROVAL_GROUP_IDS.find(id => id !== groupId);
    assert.throws(() => buildInvitationPayload(inputFor(otherId), INVITATION_REGISTRY, { logoBase64, groupId }));
    assert.throws(() => buildInvitationPayload({ ...input, groups: [...input.groups, ...inputFor(otherId).groups] }, INVITATION_REGISTRY, { logoBase64, groupId }));
  }
  for (const groupId of [null, '', 'technology', 'unknown']) {
    assert.throws(() => buildInvitationPayload(inputFor('finance-and-banking'), INVITATION_REGISTRY, { logoBase64, groupId }));
  }
});

test('pending and accepted participants receive identical group entry actions without redemption details', () => {
  const entries = new Set();
  for (const groupId of APPROVAL_GROUP_IDS) for (const ready of [false, true]) {
    const outputs = [];
    const entry = `https://opda.org.uk/_auth/workspace?group=${groupId}`;
    entries.add(entry);
    for (const redemptionRequired of [false, true]) {
      const input = inputFor(groupId, ready);
      input.microsoft = redemptionRequired
        ? { redemptionRequired, redemptionUrl: 'https://login.microsoftonline.com/redeem?ticket=synthetic-only' }
        : { redemptionRequired };
      const model = buildInvitationModel(input, INVITATION_REGISTRY, { groupId });
      assert.equal(model.group_entry_url, entry);
      assert.equal(model.groups[0].group_entry_url, entry);
      assert.doesNotMatch(JSON.stringify(model), /microsoft_redemption|login.microsoftonline|ticket=|synthetic-only/);
      const template = compileDomainInvitationTemplate(groupId, shells);
      const rendered = [template.HtmlBody, template.TextBody].map(body => render(body, model));
      outputs.push(rendered);
      for (const output of rendered) {
        assert.doesNotMatch(output, /{{|href=""|\[\[/);
        assert.equal(output.split(entry).length - 1, 1);
        assert.ok(output.includes(`Open the ${DOMAIN_TEMPLATE_CONTRACTS[groupId].groupName}`));
        assert.match(output, /https:\/\/opda.org.uk\/_auth\/login/);
        assert.doesNotMatch(output, /I Accept|already been accepted|Microsoft invitation|one-time code|login.microsoftonline|ticket=/);
        assert.equal(output.includes('Your private company folder is ready'), ready);
        assert.equal(output.includes('Teams-only access'), !ready);
        assert.equal(output.includes('Keep a README at the top level'), ready);
        assert.equal(output.includes('/By%20Organisation/example.invalid'), ready);
        assert.match(output, /Ordinary Teams files/);
      }
    }
    assert.deepEqual(outputs[0], outputs[1]);
  }
  assert.equal(entries.size, 6);
});

test('historical Finance and v1 combined template pins remain unchanged', () => {
  const original = source('finance-banking-working-group-invitation-email.html');
  assert.match(original, /Alias:|Subject: You’re invited/);
  const legacy = { HtmlBody: source('working-group-approval-invitation-email.html'), TextBody: source('working-group-approval-invitation-email.txt') };
  assert.equal(fingerprintTemplate(legacy), TEMPLATE_PIN.fingerprint);
  assert.equal(TEMPLATE_PIN.templateId, 46437816);
  assert.equal(createHash('sha256').update(legacy.HtmlBody).digest('hex'), '880ec77c639cfb0bba85dfee0a07048f09834221d4597bc96ace4588664a0063');
});

test('compiler rejects unknown groups, incomplete shells and unsupported fields', () => {
  for (const groupId of ['technology', 'no-such-domain', null]) assert.throws(() => compileDomainInvitationTemplate(groupId, shells));
  for (const changed of [{ ...shells, HtmlBody: '' }, { ...shells, TextBody: '' }, { ...shells, Subject: 'override' },
    { ...shells, HtmlBody: shells.HtmlBody.replace('{{group_entry_url}}', '{{team_url}}') },
    { ...shells, TextBody: `${shells.TextBody}{{microsoft_redemption_url}}` },
    { ...shells, HtmlBody: `${shells.HtmlBody}[[UNREVIEWED_SLOT]]` }]) assert.throws(() => compileDomainInvitationTemplate('conveyancing', changed));
});
