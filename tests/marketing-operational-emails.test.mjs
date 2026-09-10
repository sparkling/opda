import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse, serialize } from 'parse5';
import { operationalEmails } from '../src/data/marketing/operational-emails.mjs';
import { compileDomainInvitationTemplate } from '../src/approval-onboarding/domain-templates.mjs';
import { compileWithdrawalNoticeTemplate } from '../src/approval-onboarding/withdrawal-notice.mjs';
import { buildOperationalEmailPreviews, renderOperationalEmail } from '../scripts/marketing/operational-emails.mjs';

const templates = new URL('../docs/templates/', import.meta.url);
const logo = fs.readFileSync(new URL('assets/opda-email-logo.png', templates)).toString('base64');
const groups = ['finance-and-banking', 'conveyancing', 'estate-agency', 'surveying-and-valuation', 'property-data-services', 'property-technology'];
const read = (name) => fs.readFileSync(new URL(name, templates), 'utf8');
const nodes = (node) => [node, ...(node.childNodes ?? []).flatMap(nodes)];
const element = (document, tag) => nodes(document).find((node) => node.tagName === tag);
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;

function compiled(record) {
  const name = record.kind === 'invitation' ? 'domain-working-group-approval-invitation-email' : 'participation-access-change-email';
  const shells = { HtmlBody: read(`${name}.html`), TextBody: read(`${name}.txt`) };
  return record.kind === 'invitation'
    ? compileDomainInvitationTemplate(record.groupId, shells)
    : compileWithdrawalNoticeTemplate(record.kind, record.groupId, shells);
}

// Independent, deliberately finite oracle: no production renderer helpers are reused.
function expectedBody(record) {
  const html = compiled(record).HtmlBody
    .replace(/\{\{#source_folder_url\}\}([\s\S]*?)\{\{\/source_folder_url\}\}/gu, (_, body) => record.access === 'company-folder' ? body : '')
    .replace(/\{\{#teams_only\}\}([\s\S]*?)\{\{\/teams_only\}\}/gu, (_, body) => record.access === 'teams-only' ? body : '')
    .replaceAll('{{display_name}}', 'Alex Morgan')
    .replace(/\{\{(?:group_entry_url|website_login_url|\.)\}\}|\{\{\{\s*pm:unsubscribe\s*\}\}\}/gu, '');
  const document = parse(html);
  for (const node of nodes(document)) {
    if (node.childNodes) node.childNodes = node.childNodes.filter((child) => child.nodeName !== '#comment');
    if (node.tagName === 'a') node.attrs = node.attrs.filter((item) => item.name !== 'href');
  }
  return serialize(parse(`${serialize(document)}\n`));
}

test('the finite catalogue renders all nineteen original-layout operational email variants', () => {
  assert.equal(operationalEmails.length, 19);
  assert.deepEqual(new Set(operationalEmails.filter((record) => record.groupId).map((record) => record.groupId)), new Set(groups));
  assert.equal(operationalEmails.filter((record) => record.kind === 'invitation').length, 12);
  assert.equal(operationalEmails.filter((record) => record.kind === 'group-withdrawn').length, 6);
  assert.equal(operationalEmails.filter((record) => record.kind === 'website-disabled').length, 1);
  const rendered = new Set();
  for (const record of operationalEmails) {
    const html = renderOperationalEmail(record);
    assert.equal(html, renderOperationalEmail({ ...record }), record.id);
    assert.match(html, /Illustrative sample · not an invitation/u);
    assert.match(html, /Hello Alex Morgan,/u);
    assert.match(html, /width="680"/u);
    assert.match(html, /background:#2c273b/u);
    assert.match(html, /font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:43px/u);
    assert.equal(element(parse(html), 'title').childNodes[0].value, record.subject);
    rendered.add(html);
  }
  assert.equal(rendered.size, 19);
});

test('all rendered copy and layout match the pure source compiler apart from the explicit sample treatment', () => {
  for (const record of operationalEmails) {
    const document = parse(renderOperationalEmail(record));
    const body = element(document, 'body');
    body.childNodes = body.childNodes.filter((node) => attr(node, 'role') !== 'note');
    for (const node of nodes(document)) {
      if (node.tagName === 'a') node.attrs = node.attrs.filter((item) => !['aria-disabled', 'role', 'tabindex'].includes(item.name));
      if (node.tagName === 'img') node.attrs.find((item) => item.name === 'src').value = 'cid:opda-logo';
    }
    assert.equal(serialize(document), expectedBody(record), record.id);
  }
});

test('company-folder and Teams-only samples preserve mutually exclusive authorised-access guidance', () => {
  for (const record of operationalEmails.filter((item) => item.kind === 'invitation')) {
    const html = renderOperationalEmail(record);
    assert.equal(html.includes('Your private company folder is ready.'), record.access === 'company-folder', record.id);
    assert.equal(html.includes('Keep a README at the top level.'), record.access === 'company-folder', record.id);
    assert.equal(html.includes('Teams-only access.'), record.access === 'teams-only', record.id);
    assert.match(html, /Ordinary Teams files are shared with the working group/u);
    assert.match(html, /SharePoint uploads require an approved company-domain account/u);
    assert.match(html, /Unsubscribing from email below does not itself remove your workspace access/u);
  }
});

test('group and website notices retain the distinct scope and essential-notice wording', () => {
  for (const record of operationalEmails.filter((item) => item.kind !== 'invitation')) {
    const html = renderOperationalEmail(record);
    assert.match(html, /This is an essential notice about a change/u);
    assert.doesNotMatch(html, /Stop receiving Smart Property Data Trust Framework working-group emails/u);
    if (record.kind === 'group-withdrawn') {
      assert.match(html, /You no longer have the Microsoft Teams or SharePoint access granted through this approval/u);
      assert.match(html, /does not change your approval or access for any other working group that remains approved/u);
    } else {
      assert.match(html, /You cannot sign in to the OPDA website with this account/u);
      assert.match(html, /Public information on the OPDA website remains available without signing in/u);
    }
  }
});

test('every standalone sample is inert, comment-free and self-contained with the canonical embedded logo', () => {
  for (const record of operationalEmails) {
    const html = renderOperationalEmail(record);
    assert.doesNotMatch(html.replaceAll(`data:image/png;base64,${logo}`, ''), /https?:|mailto:|cid:|\/\/_auth|\/_auth\/|teams\.cloud|sharepoint\.com|microsoftonline|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}|\{\{|\}\}|\[\[|pm:unsubscribe|<!--/iu);
    const tree = nodes(parse(html));
    assert.equal(tree.filter((node) => node.tagName === 'img').length, 1);
    assert.equal(attr(tree.find((node) => node.tagName === 'img'), 'src'), `data:image/png;base64,${logo}`);
    assert.ok(tree.some((node) => node.tagName === 'a'));
    for (const node of tree) {
      assert.notEqual(node.nodeName, '#comment');
      assert.ok(!['script', 'iframe', 'object', 'embed', 'base', 'form', 'link', 'template', 'svg', 'math', 'style', 'audio', 'video'].includes(node.tagName));
      for (const item of node.attrs ?? []) assert.doesNotMatch(item.name, /^on|^(?:href|srcset|srcdoc|http-equiv|action|formaction|ping)$/iu);
      if (node.tagName === 'a') assert.equal(attr(node, 'aria-disabled'), 'true');
    }
  }
});

test('unknown, mutated and accessor-backed records are rejected before compilation', () => {
  const valid = operationalEmails[0];
  for (const record of [null, {}, [], valid.id, { ...valid, id: '../../outside' }, { ...valid, kind: 'website-disabled' },
    { ...valid, access: 'teams-only' }, { ...valid, groupId: 'technology' }, { ...valid, subject: 'different' },
    { ...valid, preview: '/outside.html' }, { ...valid, title: 'Changed' }, { ...valid, recipient: 'alex@example.invalid' },
    { ...valid, [Symbol('extra')]: 'value' }, Object.create(valid)]) {
    assert.throws(() => renderOperationalEmail(record), /operational email/iu);
  }
  const accessor = { ...valid };
  Object.defineProperty(accessor, 'id', { get() { throw new Error('getter must not execute'); } });
  assert.throws(() => renderOperationalEmail(accessor), /operational email/iu);
});

test('unsupported Mustachio syntax and active content are rejected even inside an unused branch', (context) => {
  const original = fs.readFileSync;
  let injection = '';
  context.mock.method(fs, 'readFileSync', (file, ...args) => {
    const value = original(file, ...args);
    return String(file).endsWith('domain-working-group-approval-invitation-email.html')
      ? value.replace('{{#source_folder_url}}', `{{#source_folder_url}}${injection}`) : value;
  });
  const record = operationalEmails.find((item) => item.access === 'teams-only');
  for (const unsafe of ['{{unsupported}}', '{{{display_name}}}', '{{#unknown}}hidden{{/unknown}}', '{{^teams_only}}hidden{{/teams_only}}',
    '{{#teams_only}}nested{{/teams_only}}', '{{.}}}', '<script>alert(1)</script>', '<img src="https://example.invalid/track.png">',
    '<a href="javascript:alert(1)">active</a>', '<a href="https://example.invalid" onclick="alert(1)">active</a>',
    '<form><input></form>', '<iframe srcdoc="active"></iframe>', '<svg><a href="https://example.invalid">SVG</a></svg>',
    '<meta http-equiv="refresh" content="0;url=https://example.invalid">', '<div style="background:url(https://example.invalid/track)">tracking</div>',
    '<div style="animation:spin 1s infinite">moving</div>', '<div style="background:u\\72l(https://example.invalid)">escaped</div>']) {
    injection = unsafe;
    assert.throws(() => renderOperationalEmail(record), /operational email/iu, unsafe);
  }
});

test('rendering and importing do not call network, providers or send operations', (context) => {
  context.mock.method(globalThis, 'fetch', () => { throw new Error('network must not run'); });
  for (const record of operationalEmails) renderOperationalEmail(record);
  const source = fs.readFileSync(new URL('../scripts/marketing/operational-emails.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /process\.env|fetch\s*\(|https?\.request|child_process|buildInvitationPayload|buildWithdrawalNoticePayload|postmark\.mjs|settings\.mjs/u);
});

test('build writes exactly known filenames, check is read-only and byte drift fails', async (context) => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opda-operational-emails-'));
  context.after(() => fs.rmSync(outputDir, { recursive: true, force: true }));
  await buildOperationalEmailPreviews({ outputDir });
  assert.deepEqual(fs.readdirSync(outputDir).sort(), operationalEmails.map((record) => `${record.id}.html`).sort());
  for (const record of operationalEmails) assert.equal(fs.readFileSync(path.join(outputDir, `${record.id}.html`), 'utf8'), renderOperationalEmail(record));
  const before = fs.readdirSync(outputDir).map((name) => fs.statSync(path.join(outputDir, name)).mtimeMs);
  await buildOperationalEmailPreviews({ outputDir, check: true });
  assert.deepEqual(fs.readdirSync(outputDir).map((name) => fs.statSync(path.join(outputDir, name)).mtimeMs), before);
  const changed = path.join(outputDir, `${operationalEmails[0].id}.html`);
  fs.appendFileSync(changed, '\n');
  await assert.rejects(buildOperationalEmailPreviews({ outputDir, check: true }), /drift|stale/iu);
  assert.ok(fs.readFileSync(changed, 'utf8').endsWith('\n\n'));
  await buildOperationalEmailPreviews({ outputDir });
  fs.writeFileSync(path.join(outputDir, 'unrelated.txt'), 'preserve');
  await buildOperationalEmailPreviews({ outputDir });
  assert.equal(fs.readFileSync(path.join(outputDir, 'unrelated.txt'), 'utf8'), 'preserve');
});

test('build rejects unknown options, path traversal and symlink destinations without overwriting them', async (context) => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'opda-operational-paths-'));
  context.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  for (const options of [{ check: 'yes' }, { outputDir: '/' }, { outputDir: `${temporary}/../outside` }, { records: [] }, { templates: {} }]) {
    await assert.rejects(buildOperationalEmailPreviews(options), /operational email/iu);
  }
  const missing = path.join(temporary, 'missing');
  await assert.rejects(buildOperationalEmailPreviews({ outputDir: missing, check: true }), /missing|ENOENT/iu);
  assert.equal(fs.existsSync(missing), false);
  const destination = path.join(temporary, 'existing.txt');
  fs.writeFileSync(destination, 'preserve');
  fs.symlinkSync(destination, path.join(temporary, `${operationalEmails[0].id}.html`));
  await assert.rejects(buildOperationalEmailPreviews({ outputDir: temporary }), /operational email/iu);
  assert.equal(fs.readFileSync(destination, 'utf8'), 'preserve');
});
