#!/usr/bin/env node
/** Build-only, inert samples from the reviewed pure compilers. Never a send path. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { types } from 'node:util';
import { parse, parseFragment, serialize } from 'parse5';
import { operationalEmails } from '../../src/data/marketing/operational-emails.mjs';
import { DOMAIN_TEMPLATE_CONTRACTS, compileDomainInvitationTemplate } from '../../src/approval-onboarding/domain-templates.mjs';
import { compileWithdrawalNoticeTemplate, withdrawalNoticeContract } from '../../src/approval-onboarding/withdrawal-notice.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TEMPLATE_DIR = new URL('../../docs/templates/', import.meta.url);
const DEFAULT_OUTPUT = path.join(ROOT, 'public/marketing/operational-emails/previews');
const GROUPS = ['finance-and-banking', 'conveyancing', 'estate-agency', 'surveying-and-valuation', 'property-data-services', 'property-technology'];
const RECORD_KEYS = ['id', 'kind', 'groupId', 'access', 'title', 'description', 'subject', 'url', 'preview'];
const SAMPLE_NOTICE = '<div role="note" style="box-sizing:border-box;max-width:680px;margin:24px auto 0;padding:20px 24px;background:#fff4cf;border:2px solid #a9583e;border-radius:8px;color:#141413;font-size:16px;line-height:24px;"><strong>Illustrative sample · not an invitation</strong><br>Alex Morgan is fictional. All links are disabled. This sample does not grant or change access.</div>';
const FORBIDDEN_OUTPUT = /https?:|mailto:|javascript:|vbscript:|cid:|\/\/|\/_auth\/|teams\.cloud|sharepoint\.com|microsoftonline|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}|(?:token|ticket|tenantId|groupId)\s*[:=]|\{\{|\}\}|\[\[|\]\]|pm:unsubscribe|<!--/iu;

function requireSample(condition, message) {
  if (!condition) throw new TypeError(`Invalid operational email sample: ${message}`);
}

function plainObject(value, keys) {
  requireSample(value !== null && typeof value === 'object' && !types.isProxy(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'a plain object is required');
  requireSample(Reflect.ownKeys(value).every((key) => typeof key === 'string' && keys.includes(key)), 'unsupported field');
  requireSample(Object.values(Object.getOwnPropertyDescriptors(value)).every((item) => !item.get && !item.set), 'accessors are not supported');
}

function catalogueSnapshot() {
  const expected = GROUPS.flatMap((groupId) => ['company-folder', 'teams-only'].map((access) => ({
    id: `${groupId}-invitation-${access}`, kind: 'invitation', groupId, access,
    subject: DOMAIN_TEMPLATE_CONTRACTS[groupId].subject,
  })));
  expected.push(...GROUPS.map((groupId) => ({ id: `${groupId}-approval-withdrawn`, kind: 'group-withdrawn', groupId,
    subject: withdrawalNoticeContract('group-withdrawn', groupId).subject })));
  expected.push({ id: 'website-login-disabled', kind: 'website-disabled', subject: withdrawalNoticeContract('website-disabled').subject });
  requireSample(Array.isArray(operationalEmails) && operationalEmails.length === 19, 'catalogue must contain exactly nineteen samples');
  const snapshot = new Map();
  for (const record of operationalEmails) {
    plainObject(record, RECORD_KEYS);
    const finite = expected.find((item) => item.id === record.id);
    requireSample(finite && !snapshot.has(record.id), 'unknown or duplicate catalogue ID');
    requireSample(['kind', 'groupId', 'access', 'subject'].every((key) => record[key] === finite[key]), 'catalogue contract changed');
    requireSample(record.url === `/marketing/operational-emails/${record.id}`
      && record.preview === `/marketing/operational-emails/previews/${record.id}.html`, 'catalogue path changed');
    requireSample(['title', 'description'].every((key) => typeof record[key] === 'string' && record[key].length > 0), 'catalogue text is missing');
    snapshot.set(record.id, Object.freeze({ ...record }));
  }
  return snapshot;
}

const CATALOGUE = catalogueSnapshot();

function knownRecord(record) {
  plainObject(record, RECORD_KEYS);
  const canonical = CATALOGUE.get(record.id);
  requireSample(canonical && Reflect.ownKeys(record).length === Reflect.ownKeys(canonical).length
    && Reflect.ownKeys(canonical).every((key) => Object.hasOwn(record, key) && record[key] === canonical[key]), 'unknown or mutated catalogue record');
  return canonical;
}

// Only the scalar slots and two non-nested sections in the exact reviewed shells.
// Parse every token before applying visibility, including tokens in the unused branch.
function renderSlots(source, record) {
  const invitation = record.kind === 'invitation';
  const expected = invitation
    ? ['display_name', 'group_entry_url', 'website_login_url', '.', 'pm:unsubscribe', '#source_folder_url', '/source_folder_url', '#teams_only', '/teams_only']
    : ['display_name'];
  const seen = new Map();
  let activeSection = null;
  let visible = true;
  let cursor = 0;
  let result = '';
  const append = (value) => {
    requireSample(!/[{}]/u.test(value), 'unresolved or unsupported Mustachio syntax');
    if (visible) result += value;
  };
  for (const match of source.matchAll(/\{\{\{[^{}]*\}\}\}|\{\{[^{}]*\}\}/gu)) {
    append(source.slice(cursor, match.index));
    const raw = match[0].startsWith('{{{');
    const key = match[0].slice(raw ? 3 : 2, raw ? -3 : -2).trim();
    requireSample(expected.includes(key) && raw === (key === 'pm:unsubscribe'), 'unsupported Mustachio slot');
    seen.set(key, (seen.get(key) ?? 0) + 1);
    requireSample(seen.get(key) === 1, 'duplicate Mustachio slot');
    if (key.startsWith('#')) {
      requireSample(activeSection === null, 'nested Mustachio sections are not supported');
      activeSection = key.slice(1);
      visible = activeSection === 'source_folder_url' ? record.access === 'company-folder' : record.access === 'teams-only';
    } else if (key.startsWith('/')) {
      requireSample(activeSection === key.slice(1), 'unbalanced Mustachio section');
      activeSection = null;
      visible = true;
    } else {
      requireSample(key === '.' ? activeSection === 'source_folder_url' : activeSection === null, 'Mustachio slot has an unexpected scope');
      if (visible && key === 'display_name') result += 'Alex Morgan';
      // All URL slots, including the provider unsubscribe slot, resolve to empty
      // inert values. Their attributes are removed by the HTML pass below.
    }
    cursor = match.index + match[0].length;
  }
  append(source.slice(cursor));
  requireSample(activeSection === null && expected.every((key) => seen.get(key) === 1), 'incomplete Mustachio contract');
  return result;
}

const ATTRIBUTES = {
  html: ['lang'], head: [], meta: ['charset', 'name', 'content'], title: [], body: ['style'],
  div: ['style', 'role'], table: ['style', 'role', 'width', 'cellspacing', 'cellpadding', 'border'],
  tbody: [], tr: [], td: ['style', 'align'], img: ['src', 'width', 'alt', 'style'],
  p: ['style'], h1: ['style'], h2: ['style'], strong: [], ol: ['style'], ul: ['style'], li: ['style'],
  a: ['href', 'style', 'aria-disabled', 'role', 'tabindex'], br: [],
};
const STYLE_PROPERTIES = new Set(['background', 'border', 'border-bottom', 'border-collapse', 'border-left', 'border-radius',
  'border-top', 'box-sizing', 'color', 'display', 'font-family', 'font-size', 'font-weight', 'height', 'letter-spacing',
  'line-height', 'margin', 'max-height', 'max-width', 'opacity', 'overflow', 'padding', 'padding-left', 'text-decoration', 'text-transform', 'width']);

function validateStyle(style) {
  for (const declaration of style.split(';').filter((value) => value.trim())) {
    const match = /^\s*([a-z-]+):([#a-z0-9\s.,%'"-]+)$/iu.exec(declaration);
    requireSample(match && STYLE_PROPERTIES.has(match[1]) && !/[\u0000-\u001f\u007f]/u.test(match[2]), 'active or unreviewed inline style');
  }
}

function visit(node, callback) {
  callback(node);
  for (const child of node.childNodes ?? []) visit(child, callback);
}

function checkedDocument(source, embeddedLogo) {
  const errors = [];
  const document = parse(source, { onParseError: (error) => errors.push(error.code) });
  requireSample(errors.length === 0, 'malformed HTML template');
  visit(document, (node) => {
    if (node.nodeName === '#documentType') requireSample(node.name === 'html' && !node.publicId && !node.systemId, 'unreviewed document type');
    if (!node.tagName) return;
    requireSample(node.namespaceURI === 'http://www.w3.org/1999/xhtml' && Object.hasOwn(ATTRIBUTES, node.tagName), 'active or unreviewed HTML element');
    for (const { name, value, namespace } of node.attrs) {
      requireSample(!namespace && ATTRIBUTES[node.tagName].includes(name), 'active or unreviewed HTML attribute');
      if (name === 'style') validateStyle(value);
      if (name === 'src') requireSample(node.tagName === 'img' && value === (embeddedLogo ?? 'cid:opda-logo'), 'external or unreviewed image');
      if (name === 'href') requireSample(!embeddedLogo && (value === '' || /^(?:https:\/\/|mailto:|\{\{)/u.test(value)), 'active hyperlink');
      if (name === 'role') requireSample(['presentation', 'note', 'link'].includes(value), 'unreviewed role');
      if (name === 'aria-disabled') requireSample(value === 'true', 'link must remain disabled');
      if (name === 'tabindex') requireSample(value === '-1', 'link must remain unfocusable');
      if (name === 'lang') requireSample(value === 'en', 'unreviewed document language');
    }
    if (node.tagName === 'meta') {
      const attributes = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
      const approved = { viewport: 'width=device-width, initial-scale=1', 'color-scheme': 'light', 'supported-color-schemes': 'light' };
      requireSample(attributes.charset === 'utf-8' && node.attrs.length === 1
        || Object.hasOwn(approved, attributes.name) && approved[attributes.name] === attributes.content && node.attrs.length === 2, 'active or unreviewed metadata');
    }
  });
  return document;
}

function logoDataUri() {
  const image = fs.readFileSync(new URL('assets/opda-email-logo.png', TEMPLATE_DIR));
  requireSample(image.length > 8 && image.length <= 350_000
    && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'canonical logo must be a bounded PNG');
  return `data:image/png;base64,${image.toString('base64')}`;
}

/** A known catalogue record produces a standalone, fictional, completely inert HTML sample. */
export function renderOperationalEmail(input) {
  const record = knownRecord(input);
  const name = record.kind === 'invitation' ? 'domain-working-group-approval-invitation-email' : 'participation-access-change-email';
  const shells = {
    HtmlBody: fs.readFileSync(new URL(`${name}.html`, TEMPLATE_DIR), 'utf8'),
    TextBody: fs.readFileSync(new URL(`${name}.txt`, TEMPLATE_DIR), 'utf8'),
  };
  let compiled;
  try {
    compiled = record.kind === 'invitation' ? compileDomainInvitationTemplate(record.groupId, shells)
      : compileWithdrawalNoticeTemplate(record.kind, record.groupId, shells);
  } catch (error) {
    throw new TypeError(`Invalid operational email sample: source compiler rejected the template (${error.message})`);
  }
  requireSample(compiled.Subject === record.subject, 'source subject differs from the catalogue');
  checkedDocument(compiled.HtmlBody); // Validate unused conditional content as well.
  requireSample(!/[<>]/u.test(compiled.TextBody), 'active content in plain-text shell');
  renderSlots(compiled.TextBody, record); // Text remains a reviewed companion, not a public URL dump.
  const document = checkedDocument(renderSlots(compiled.HtmlBody, record));
  const logo = logoDataUri();
  let body;
  let images = 0;
  visit(document, (node) => {
    if (node.childNodes) node.childNodes = node.childNodes.filter((child) => child.nodeName !== '#comment');
    if (node.tagName === 'body') body = node;
    if (node.tagName === 'a') {
      node.attrs = node.attrs.filter(({ name: attribute }) => !['href', 'aria-disabled', 'role', 'tabindex'].includes(attribute));
      node.attrs.push({ name: 'aria-disabled', value: 'true' }, { name: 'role', value: 'link' }, { name: 'tabindex', value: '-1' });
    }
    if (node.tagName === 'img') {
      images += 1;
      node.attrs.find(({ name: attribute }) => attribute === 'src').value = logo;
    }
  });
  requireSample(body && images === 1, 'standalone body and exactly one canonical logo required');
  const notice = parseFragment(SAMPLE_NOTICE).childNodes[0];
  notice.parentNode = body;
  body.childNodes.unshift(notice);
  const html = `${serialize(document)}\n`;
  checkedDocument(html, logo);
  requireSample(!FORBIDDEN_OUTPUT.test(html.replaceAll(logo, '')), 'private, actionable or unresolved output');
  return html;
}

function safeFile(target, directory = false) {
  if (!fs.existsSync(target)) {
    // existsSync returns false for a dangling symlink; lstat must still reject it.
    try { requireSample(!fs.lstatSync(target).isSymbolicLink(), 'symlink output is not permitted'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    return;
  }
  const stat = fs.lstatSync(target);
  requireSample(!stat.isSymbolicLink() && (directory ? stat.isDirectory() : stat.isFile()), 'output must be a regular, non-symlink destination');
}

/** Write only the nineteen known HTML files, or byte-compare them without any writes. */
export async function buildOperationalEmailPreviews(options = {}) {
  plainObject(options, ['check', 'outputDir']);
  const { check = false, outputDir = DEFAULT_OUTPUT } = options;
  requireSample(typeof check === 'boolean', 'check must be boolean');
  requireSample(typeof outputDir === 'string' && path.isAbsolute(outputDir) && !outputDir.includes('\0')
    && !outputDir.split(/[\\/]/u).includes('..'), 'output directory must be an absolute path without traversal');
  const destination = path.resolve(outputDir);
  requireSample(destination !== path.parse(destination).root && destination !== ROOT.replace(/\/$/u, ''), 'unsafe output directory');
  safeFile(destination, true);
  const outputs = [...CATALOGUE.values()].map((record) => ({
    target: path.join(destination, `${record.id}.html`), html: renderOperationalEmail(record),
  }));
  for (const output of outputs) safeFile(output.target);
  if (check) {
    for (const { target, html } of outputs) {
      requireSample(fs.existsSync(target), `missing generated sample: ${path.basename(target)}`);
      requireSample(fs.readFileSync(target).equals(Buffer.from(html)), `generated sample drift: ${path.basename(target)}`);
    }
  } else {
    fs.mkdirSync(destination, { recursive: true });
    for (const { target, html } of outputs) fs.writeFileSync(target, html, { flag: 'w' });
  }
  return { count: outputs.length, checked: check, outputDir: destination };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    requireSample(process.argv.slice(2).every((argument) => argument === '--check') && process.argv.length <= 3, 'only --check is supported');
    const result = await buildOperationalEmailPreviews({ check: process.argv.includes('--check') });
    console.log(`${result.checked ? 'Checked' : 'Built'} ${result.count} inert operational email samples.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
