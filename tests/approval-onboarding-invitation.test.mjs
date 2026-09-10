import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  APPROVAL_GROUP_IDS,
  INVITATION_SUBJECT,
  OPDA_TENANT_ID,
  WEBSITE_LOGIN_URL,
  buildInvitationModel,
  buildInvitationPayload,
} from '../src/approval-onboarding/invitation.mjs';
import { WORKING_GROUPS } from '../config/aws/working-group-interest/domain.mjs';
import { WORKING_GROUPS as WORKSPACE_GROUPS } from '../src/agents/working-group-inbox/domain.mjs';

const sourceHost = 'https://openpropertydataassociation.sharepoint.com';
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const html = readFileSync(new URL('../docs/templates/working-group-approval-invitation-email.html', import.meta.url), 'utf8');
const plain = readFileSync(new URL('../docs/templates/working-group-approval-invitation-email.txt', import.meta.url), 'utf8');

function fixture(ids = ['finance-and-banking', 'property-technology']) {
  const registry = { tenantId: OPDA_TENANT_ID, websiteLoginUrl: WEBSITE_LOGIN_URL, groups: {} };
  for (const [index, id] of APPROVAL_GROUP_IDS.entries()) {
    const teamId = `11111111-1111-4111-8111-${String(index + 1).padStart(12, '0')}`;
    registry.groups[id] = {
      teamId,
      teamUrl: `https://teams.microsoft.com/l/team/19%3Afixture${index}%40thread.tacv2/conversations?groupId=${teamId}&tenantId=${OPDA_TENANT_ID}`,
      sourceIntakeSiteUrl: `${sourceHost}/sites/Fixture${index}SourceIntake`,
    };
  }
  const input = {
    displayName: 'Alex O’Neill & colleagues',
    email: 'Alex@example.org',
    microsoft: { redemptionRequired: false },
    groups: ids.map((groupId, index) => ({
      groupId,
      teamMembershipVerified: true,
      sourceAccess: index === 0
        ? { status: 'ready', permissionsVerified: true, folderUrl: `${registry.groups[groupId].sourceIntakeSiteUrl}/Incoming%20Source%20Material/By%20Organisation/example.org` }
        : { status: 'teams_only', permissionsVerified: true },
    })),
  };
  return { input, registry };
}

function redemptionUrl() {
  return `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&ticket=synthetic-only`)}`;
}
function redemptionUrlWithUser(user = '22222222-2222-4222-8222-222222222222') {
  return `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&user=${user}&ticket=synthetic-only&ver=1`)}`;
}

// Fixture-only rendering of the Mustachio subset used by these templates.
function render(template, model, escape = true) {
  const escaped = (value) => escape ? String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) : String(value);
  function section(text, context) {
    return text.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (_, key, body) => context[key].map((item) => section(body, item)).join(''))
      .replace(/{{([#^])([\w:]+)}}([\s\S]*?){{\/\2}}/g, (_, kind, key, body) => {
      const value = context[key];
      if (kind === '^') return value ? '' : section(body, context);
      return value ? section(body, value) : '';
    }).replace(/{{{\s*pm:unsubscribe\s*}}}/g, 'https://unsubscribe.example.invalid/fixture')
      .replace(/{{([\w:.]+)}}/g, (_, key) => escaped(key === '.' ? context : context[key] ?? ''));
  }
  return section(template, model);
}

test('one deterministic model contains all six selected domain groups, never cross-cutting Technology', () => {
  assert.deepEqual(new Set(APPROVAL_GROUP_IDS), WORKING_GROUPS);
  const { input, registry } = fixture([...APPROVAL_GROUP_IDS].reverse());
  const before = structuredClone({ input, registry });
  const model = buildInvitationModel(input, registry);
  assert.deepEqual(model.groups.map((group) => group.group_id), APPROVAL_GROUP_IDS);
  assert.equal(model.groups.at(-1).group_name, 'Property Technology Working Group');
  assert.match(model.groups.at(-1).group_scope, /property-sector/i);
  assert.equal(model.groups.filter((group) => group.group_name === 'Technology Working Group').length, 0);
  assert.deepEqual({ input, registry }, before);
  assert.deepEqual(buildInvitationModel(input, registry), model);
  model.groups[0].group_name = 'changed';
  assert.notEqual(buildInvitationModel(input, registry).groups[0].group_name, 'changed');
});

test('the model distinguishes verified company folders from explicit Teams-only access', () => {
  const { input, registry } = fixture();
  const model = buildInvitationModel(input, registry);
  assert.equal(model.website_login_url, 'https://opda.org.uk/_auth/login');
  assert.equal(model.microsoft_redemption_required, false);
  assert.equal(Object.hasOwn(model, 'microsoft_redemption_url'), false);
  assert.equal(model.has_source_folders, true);
  assert.equal(model.groups[0].source_folder_ready, true);
  assert.equal(model.groups[0].teams_only, false);
  assert.equal(model.groups[1].source_folder_ready, false);
  assert.equal(model.groups[1].teams_only, true);
  assert.equal(Object.hasOwn(model.groups[1], 'source_folder_url'), false);
  input.groups[0].sourceAccess = { status: 'teams_only', permissionsVerified: true };
  const teamsOnly = buildInvitationModel(input, registry);
  assert.equal(teamsOnly.has_source_folders, false);
  assert.doesNotMatch(render(html, teamsOnly), /company folder is ready|Keep a top-level README/);
  assert.doesNotMatch(render(plain, teamsOnly, false), /company folder is ready|Keep a top-level README/);
});

test('all six actual registry Team/site shapes work without confusing provisioned and inbox-implemented', () => {
  const { input, registry } = fixture(APPROVAL_GROUP_IDS);
  for (const group of WORKSPACE_GROUPS.filter((group) => APPROVAL_GROUP_IDS.includes(group.id))) {
    registry.groups[group.id] = {
      status: group.workspace.status,
      teamId: group.workspace.teamId,
      teamUrl: group.workspace.teamUrl,
      sourceIntakeSiteUrl: group.workspace.siteUrl,
    };
    const selected = input.groups.find((item) => item.groupId === group.id);
    selected.sourceAccess = { status: 'teams_only', permissionsVerified: true };
  }
  const model = buildInvitationModel(input, registry);
  assert.equal(model.groups.length, 6);
  assert.deepEqual(model.groups.map((group) => group.team_url), APPROVAL_GROUP_IDS.map((id) => registry.groups[id].teamUrl));
  assert.equal(registry.groups['finance-and-banking'].status, 'implemented');
  for (const id of APPROVAL_GROUP_IDS.slice(1)) assert.equal(registry.groups[id].status, 'provisioned');
  assert.notEqual(registry.groups['property-technology'].teamId, WORKSPACE_GROUPS.find((group) => group.id === 'technology').workspace.teamId);
});

test('Microsoft redemption is conditional and preserves the exact per-recipient URL', () => {
  const { input, registry } = fixture();
  input.microsoft = { redemptionRequired: true, redemptionUrl: redemptionUrl() };
  const model = buildInvitationModel(input, registry);
  assert.equal(model.microsoft_redemption_url, input.microsoft.redemptionUrl);
  assert.equal(model.microsoft_redemption_required, true);
  for (const microsoft of [null, {}, { redemptionRequired: 'true' }, { redemptionRequired: true }, { redemptionRequired: false, redemptionUrl: redemptionUrl() }]) {
    assert.throws(() => buildInvitationModel({ ...input, microsoft }, registry));
  }
});

test('Microsoft redemption accepts the observed optional UUID user parameter in direct and nested forms', () => {
  const { input, registry } = fixture();
  for (const redemptionUrl of [redemptionUrlWithUser(),
    `https://login.microsoftonline.com/redeem?tenant=${OPDA_TENANT_ID}&user=22222222-2222-4222-8222-222222222222&ticket=synthetic-only&ver=1`]) {
    input.microsoft = { redemptionRequired: true, redemptionUrl };
    assert.equal(buildInvitationModel(input, registry).microsoft_redemption_url, redemptionUrl);
  }
  for (const redemptionUrl of [redemptionUrlWithUser('not-a-uuid'),
    `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&user=22222222-2222-4222-8222-222222222222&user=33333333-3333-4333-8333-333333333333&ticket=synthetic-only`)}`,
    `https://login.microsoftonline.com/redeem?rd=${encodeURIComponent(`https://invitations.microsoft.com/redeem/?tenant=${OPDA_TENANT_ID}&ticket=synthetic-only&rd=unexpected`)}`,
    redemptionUrlWithUser() + '&rd=https%3A%2F%2Fevil.example',
    redemptionUrlWithUser() + '&user=22222222-2222-4222-8222-222222222222&user=33333333-3333-4333-8333-333333333333']) {
    assert.throws(() => buildInvitationModel({ ...input, microsoft: { redemptionRequired: true, redemptionUrl } }, registry));
  }
});

test('independent-domain models use stable group entry URLs and omit send-time Microsoft state', () => {
  for (const groupId of APPROVAL_GROUP_IDS) {
    const { input, registry } = fixture([groupId]);
    const accepted = buildInvitationModel(input, registry, { groupId });
    input.microsoft = { redemptionRequired: true, redemptionUrl: redemptionUrl() };
    const pending = buildInvitationModel(input, registry, { groupId });
    assert.deepEqual(pending, accepted);
    const expected = `https://opda.org.uk/_auth/workspace?group=${groupId}`;
    assert.equal(pending.group_entry_url, expected);
    assert.equal(pending.groups[0].group_entry_url, expected);
    assert.equal(new URL(pending.group_entry_url).searchParams.size, 1);
    assert.doesNotMatch(JSON.stringify(pending), /microsoft_redemption|ticket=|synthetic-only|alex@example.org/i);
    assert.throws(() => buildInvitationModel({ ...input,
      microsoft: { redemptionRequired: true, redemptionUrl: 'https://evil.example/redirect' } }, registry, { groupId }));
  }
});

test('payload fixes one recipient, identity, broadcast stream, CID and no tracking', () => {
  const { input, registry } = fixture();
  const payload = buildInvitationPayload(input, registry, { logoBase64 });
  assert.equal(payload.To, 'alex@example.org');
  assert.equal(payload.From, 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>');
  assert.equal(payload.ReplyTo, 'smartdata@openpropdata.org.uk');
  assert.equal(payload.TemplateAlias, 'working-group-approval-invitation');
  assert.equal(payload.MessageStream, 'broadcast');
  assert.equal(payload.TrackLinks, 'None');
  assert.equal(payload.TrackOpens, false);
  assert.equal(payload.InlineCss, true);
  assert.deepEqual(payload.TemplateModel, buildInvitationModel(input, registry));
  assert.deepEqual(payload.Attachments, [{ Name: 'opda-email-logo.png', Content: logoBase64, ContentType: 'image/png', ContentID: 'cid:opda-logo' }]);
  for (const key of ['Cc', 'Bcc', 'HtmlBody', 'TextBody', 'Subject']) assert.equal(Object.hasOwn(payload, key), false);
  for (const options of [undefined, {}, { logoBase64: 'not base64' }, { logoBase64: Buffer.from('<svg/>').toString('base64') }, { logoBase64, TrackOpens: true }]) {
    assert.throws(() => buildInvitationPayload(input, registry, options));
  }
});

test('unselected, duplicate, absent, planned or unverified groups cannot claim readiness', () => {
  const { input, registry } = fixture();
  for (const groups of [[], undefined, {}, Array(7).fill(input.groups[0]), [input.groups[0], input.groups[0]], [{ ...input.groups[0], groupId: 'technology' }]]) {
    assert.throws(() => buildInvitationModel({ ...input, groups }, registry));
  }
  for (const sourceAccess of [{ status: 'pending' }, { status: 'failed' }, { status: 'ready', permissionsVerified: false }, { status: 'teams_only' }, { ...input.groups[0].sourceAccess, status: 'teams_only' }]) {
    assert.throws(() => buildInvitationModel({ ...input, groups: [{ ...input.groups[0], sourceAccess }] }, registry));
  }
  assert.throws(() => buildInvitationModel({ ...input, groups: [{ ...input.groups[0], teamMembershipVerified: false }] }, registry));
  assert.throws(() => buildInvitationModel(input, { ...registry, groups: {} }));
  registry.groups['finance-and-banking'].status = 'planned';
  assert.throws(() => buildInvitationModel(input, registry));
});

test('display names and recipient addresses reject hostile text and arbitrary model fields', () => {
  const { input, registry } = fixture();
  for (const displayName of ['', '  ', '<img src=x onerror=alert(1)>', '{{{evil}}}', 'A\r\nB', 'A\u202eB', 'x'.repeat(257), 42]) {
    assert.throws(() => buildInvitationModel({ ...input, displayName }, registry));
  }
  for (const email of ['a@example.org,b@example.org', 'A <a@example.org>', 'a@example.org\r\nBcc:b@example.org', 'a@localhost', 'a b@example.org', 'a@example.org?subject=x', '', null]) {
    assert.throws(() => buildInvitationModel({ ...input, email }, registry));
  }
  assert.throws(() => buildInvitationModel({ ...input, html: '<strong>arbitrary</strong>' }, registry));
  assert.throws(() => buildInvitationModel(Object.assign(Object.create({ poisoned: true }), input), registry));
});

test('registry Team links are tenant-bound, resource-bound and distinct', () => {
  for (const mutate of [
    (r) => { r.tenantId = '22222222-2222-4222-8222-222222222222'; },
    (r) => { r.websiteLoginUrl = `${WEBSITE_LOGIN_URL}?return=https://evil.example`; },
    (r) => { r.groups['finance-and-banking'].teamUrl += '&groupId=other'; },
    (r) => { r.groups['finance-and-banking'].teamUrl += '&redirect=https://evil.example'; },
    (r) => { r.groups['finance-and-banking'].teamUrl = r.groups['property-technology'].teamUrl; },
    (r) => { r.groups['property-technology'] = { ...r.groups['finance-and-banking'] }; },
    (r) => { const g = r.groups['property-technology']; g.teamUrl = g.teamUrl.replace(g.teamId, '286b29b1-163d-4cb5-aaec-39b1c5ceef4b'); g.teamId = '286b29b1-163d-4cb5-aaec-39b1c5ceef4b'; },
    (r) => { r.groups['property-technology'].sourceIntakeSiteUrl = `${sourceHost}/sites/TechnologySourceIntake`; },
  ]) {
    const { input, registry } = fixture();
    mutate(registry);
    assert.throws(() => buildInvitationModel(input, registry));
  }
});

test('resource URLs reject malicious origins, credentials, traversal and broad folder views', () => {
  const { input, registry } = fixture();
  const good = input.groups[0].sourceAccess.folderUrl;
  const site = registry.groups['finance-and-banking'].sourceIntakeSiteUrl;
  for (const folderUrl of [
    good.replace('https:', 'http:'), good.replace('https:', 'javascript:'),
    good.replace('https://', 'https://user:pass@'), good.replace('.com/', '.com:444/'),
    good.replace('.com/', '.com.evil.example/'), `${good}#fragment`, `${good}?redirect=https://evil.example`,
    good.replace('example.org', '%2e%2e/example.org'), good.replace('example.org', '%252e%252e/example.org'),
    good.replace('example.org', '..%2Fexample.org'), good.replace('example.org', 'example.org%0d%0aX'),
    `${site}/Incoming%20Source%20Material/By%20Organisation`, `${site}/Shared%20Documents/example.org`,
    `${sourceHost}/sites/Other/Incoming%20Source%20Material/By%20Organisation/example.org`,
    good.replace('/sites/', '\\sites/'),
  ]) {
    assert.throws(() => buildInvitationModel({ ...input, groups: [{ ...input.groups[0], sourceAccess: { ...input.groups[0].sourceAccess, folderUrl } }] }, registry));
  }
  const path = new URL(good).pathname;
  input.groups[0].sourceAccess.folderUrl = `${site}/Incoming%20Source%20Material/Forms/AllItems.aspx?id=${encodeURIComponent(decodeURIComponent(path))}`;
  assert.equal(buildInvitationModel(input, registry).groups[0].source_folder_url, input.groups[0].sourceAccess.folderUrl);
});

test('Microsoft URLs cannot be repurposed as arbitrary redirects or tracking links', () => {
  const { input, registry } = fixture();
  for (const redemptionUrl of [
    'https://evil.example/redeem', 'https://login.microsoftonline.com.evil.example/redeem',
    'https://login.microsoftonline.com/anything', 'https://login.microsoftonline.com/redeem#secret',
    'https://user@login.microsoftonline.com/redeem', 'https://login.microsoftonline.com/redeem?rd=https%3A%2F%2Fevil.example',
    'https://login.microsoftonline.com/redeem?rd=https%3A%2F%2Finvitations.microsoft.com%2Fother',
    'https://login.microsoftonline.com/redeem?redirect_uri=https%3A%2F%2Fevil.example',
    'https://login.microsoftonline.com/redeem?tenant=' + OPDA_TENANT_ID + '&user=not-a-uuid&ticket=synthetic-only',
  ]) assert.throws(() => buildInvitationModel({ ...input, microsoft: { redemptionRequired: true, redemptionUrl } }, registry));
});

test('HTML and text render all selected groups, separate login, conditional acceptance and folder access', () => {
  const { input, registry } = fixture();
  for (const redemptionRequired of [false, true]) {
    input.microsoft = redemptionRequired ? { redemptionRequired, redemptionUrl: redemptionUrl() } : { redemptionRequired };
    const model = buildInvitationModel(input, registry);
    for (const [template, escape] of [[html, true], [plain, false]]) {
      const output = render(template, model, escape);
      assert.match(output, /Finance and Banking Working Group/);
      assert.match(output, /Property Technology Working Group/);
      assert.match(output, /Teams-only/);
      assert.match(output, /company folder/i);
      assert.match(output, /https:\/\/opda.org.uk\/_auth\/login/);
      assert.equal(output.includes('Accept Microsoft invitation'), redemptionRequired);
      assert.equal(output.includes('Your Microsoft invitation has already been accepted'), !redemptionRequired);
      assert.doesNotMatch(output, /{{|href=""|pending|AI inbox agent/i);
      assert.match(output, /ordinary Teams files/i);
    }
  }
  assert.match(render(html, buildInvitationModel(input, registry)), /Alex O’Neill &amp; colleagues/);
  assert.match(html, /width="680"/);
  assert.match(html, /src="cid:opda-logo"/);
  assert.ok(html.includes(INVITATION_SUBJECT));
  assert.deepEqual([...html.matchAll(/{{{([\s\S]*?)}}}/g)].map((match) => match[1].trim()), ['pm:unsubscribe']);
  assert.doesNotMatch(html + plain, /FinanceBankingSourceIntake|TechnologySourceIntake|286b29b1/);
  const tags = (template) => [...new Set([...template.matchAll(/{{{?\s*([#^/]?[\w:]+)\s*}}}?/g)].map((match) => match[1]))].sort();
  assert.deepEqual(tags(html), tags(plain));
  assert.match(html, /{{#each groups}}/);
  assert.match(plain, /{{#each groups}}/);
  for (const path of ['../src/approval-onboarding/invitation.mjs', '../docs/templates/working-group-approval-invitation-email.html', '../docs/templates/working-group-approval-invitation-email.txt', './approval-onboarding-invitation.test.mjs']) {
    assert.ok(readFileSync(new URL(path, import.meta.url), 'utf8').split('\n').length < 500, path);
  }
});
