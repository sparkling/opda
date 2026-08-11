#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readCsv, csvField } from './_lib/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT_DIR = path.join(ROOT, 'source/_inbox/finance-banking-working-group');
const MAILING_LIST = path.join(INPUT_DIR, 'pending-invitation-mailing-list.csv');
const INVITATIONS = path.join(INPUT_DIR, 'invite-redeem-urls.csv');
const LEDGER = path.join(INPUT_DIR, 'postmark-wave-ledger.csv');
const SNAPSHOTS = path.join(INPUT_DIR, 'postmark-wave-snapshots');
const LOGO = path.join(ROOT, 'docs/templates/assets/opda-email-logo.png');
const POSTMARK_API = 'https://api.postmarkapp.com';
const GRAPH_API = 'https://graph.microsoft.com';
const TENANT_ID = '143540d4-4fbc-4005-882a-29656cd01a36';
const WAVE_ID = 'finance-banking-wave-2';
const WAVE_SIZE = 100;
const TEMPLATE_ID = 45998430;
const TEMPLATE_ALIAS = 'finance-banking-working-group-invitation';
const SUBJECT = 'You’re invited to help shape the Smart Property Data Trust Framework';
const LEDGER_FIELDS = [
  'wave_id', 'batch_digest', 'email', 'status', 'postmark_message_id',
  'submitted_at', 'error_code',
];

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseArgs(values) {
  const args = { execute: false, digest: '' };
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--execute') args.execute = true;
    else if (values[index] === '--digest') args.digest = values[++index] ?? '';
    else throw new Error('Unknown command-line option');
  }
  if (args.execute && !/^[a-f0-9]{64}$/.test(args.digest)) {
    throw new Error('Execution requires --digest with the approved dry-run digest');
  }
  return args;
}

function keychainToken() {
  const token = execFileSync('security', [
    'find-generic-password', '-s', 'opda-postmark-server-token', '-w',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (!token) throw new Error('Postmark server token is unavailable');
  return token;
}

function graphToken() {
  const tenant = execFileSync('az', ['account', 'show', '--query', 'tenantId', '--output', 'tsv'], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  if (tenant !== TENANT_ID) throw new Error('Azure CLI is authenticated to the wrong Microsoft tenant');
  return execFileSync('az', [
    'account', 'get-access-token', '--resource-type', 'ms-graph', '--query', 'accessToken', '--output', 'tsv',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function acceptedIdentityIds(token) {
  const accepted = new Set();
  let next = `${GRAPH_API}/v1.0/users?$select=id,userType,externalUserState&$top=999`;
  while (next) {
    const response = await fetch(next, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Microsoft Graph returned HTTP ${response.status}`);
    const page = await response.json();
    for (const user of page.value ?? []) {
      if (user.userType === 'Member' || user.externalUserState === 'Accepted') accepted.add(user.id);
    }
    next = page['@odata.nextLink'] ?? '';
    if (next && new URL(next).hostname !== 'graph.microsoft.com') throw new Error('Microsoft Graph returned an invalid next page');
  }
  return accepted;
}

async function postmark(token, pathname, options = {}) {
  const response = await fetch(`${POSTMARK_API}${pathname}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Postmark returned HTTP ${response.status}`);
  return result;
}

function uniqueIndex(rows, field, label) {
  const index = new Map();
  for (const row of rows) {
    const key = normalizeEmail(row[field]);
    if (!key || index.has(key)) throw new Error(`${label} has an empty or duplicate email`);
    index.set(key, row);
  }
  return index;
}

function validatedCandidates(mailingList, invitations, excludedEmails, acceptedIds) {
  const invitationByEmail = uniqueIndex(invitations, 'email', 'Invitation manifest');
  uniqueIndex(mailingList, 'email', 'Mailing list');
  return mailingList
    .filter((row) => !excludedEmails.has(normalizeEmail(row.email)))
    .filter((row) => {
      const invitation = invitationByEmail.get(normalizeEmail(row.email));
      return invitation && !acceptedIds.has(invitation.entra_user_id);
    })
    .map((row) => {
      const email = normalizeEmail(row.email);
      const invitation = invitationByEmail.get(email);
      if (!invitation) throw new Error('A mailing-list entry has no invitation record');
      const accessUrl = String(invitation.invite_redeem_url || invitation.access_url || '').trim();
      const parsed = new URL(accessUrl);
      if (parsed.protocol !== 'https:' || parsed.hostname.toLowerCase() !== 'login.microsoftonline.com') {
        throw new Error('A mailing-list entry has an invalid invitation URL');
      }
      return {
        display_name: String(row.display_name ?? '').trim(),
        email,
        domain: String(row.domain || email.split('@').at(-1)).trim().toLowerCase(),
        access_url: accessUrl,
      };
    });
}

function selectAcrossDomains(candidates) {
  const groups = new Map();
  for (const candidate of candidates) {
    const group = groups.get(candidate.domain) ?? [];
    group.push(candidate);
    groups.set(candidate.domain, group);
  }
  const ordered = [...groups.entries()]
    .sort(([left], [right]) => sha256(`${WAVE_ID}:${left}`).localeCompare(sha256(`${WAVE_ID}:${right}`)))
    .map(([domain, members]) => [
      domain,
      members.sort((left, right) => sha256(`${WAVE_ID}:${left.email}`).localeCompare(sha256(`${WAVE_ID}:${right.email}`))),
    ]);
  const selected = [];
  for (let round = 0; selected.length < WAVE_SIZE; round += 1) {
    let found = false;
    for (const [, members] of ordered) {
      if (members[round] && selected.length < WAVE_SIZE) {
        selected.push(members[round]);
        found = true;
      }
    }
    if (!found) break;
  }
  if (selected.length !== WAVE_SIZE) {
    throw new Error(`The mailing list cannot supply ${WAVE_SIZE} ${WAVE_ID} recipients`);
  }
  return selected;
}

function validatePostmark(template, server, stream) {
  if (template.TemplateId !== TEMPLATE_ID || template.Alias !== TEMPLATE_ALIAS || template.Subject !== SUBJECT) {
    throw new Error('The live Postmark template has changed');
  }
  if (!template.HtmlBody.includes('pm:unsubscribe') || !template.TextBody.includes('pm:unsubscribe')) {
    throw new Error('The live Postmark template is missing its unsubscribe link');
  }
  if (!template.HtmlBody.includes('cid:opda-logo')) throw new Error('The live template is missing its inline logo');
  if (server.TrackOpens !== true || String(server.TrackLinks).toLowerCase() !== 'none') {
    throw new Error('Postmark tracking configuration has changed');
  }
  if (stream.ID !== 'broadcast' || stream.MessageStreamType !== 'Broadcasts') {
    throw new Error('The Postmark Broadcast stream has changed');
  }
  const handling = stream.SubscriptionManagementConfiguration?.UnsubscribeHandlingType;
  if (String(handling).toLowerCase() !== 'postmark') throw new Error('Postmark unsubscribe handling has changed');
}

function appendLedger(row) {
  if (!fs.existsSync(LEDGER)) {
    fs.writeFileSync(LEDGER, `${LEDGER_FIELDS.join(',')}\n`, { mode: 0o600, flag: 'wx' });
  }
  const line = LEDGER_FIELDS.map((field) => csvField(row[field] ?? '')).join(',');
  fs.appendFileSync(LEDGER, `${line}\n`, { mode: 0o600 });
  fs.chmodSync(LEDGER, 0o600);
}

function blockedFromLedger(rows) {
  return new Set(rows
    .filter((row) => ['attempting', 'accepted', 'unknown'].includes(row.status))
    .map((row) => normalizeEmail(row.email)));
}

function writeSnapshot(digest, basis) {
  fs.mkdirSync(SNAPSHOTS, { recursive: true, mode: 0o700 });
  const target = path.join(SNAPSHOTS, `${digest}.json`);
  const content = `${JSON.stringify({ digest, ...basis }, null, 2)}\n`;
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') !== content) {
    throw new Error('The immutable wave snapshot changed');
  }
  if (!fs.existsSync(target)) fs.writeFileSync(target, content, { mode: 0o600, flag: 'wx' });
  fs.chmodSync(target, 0o600);
}

function messageFor(candidate, logo, digest) {
  return {
    From: 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>',
    To: candidate.email,
    ReplyTo: 'smartdata@openpropdata.org.uk',
    TemplateAlias: TEMPLATE_ALIAS,
    TemplateModel: { display_name: candidate.display_name, access_url: candidate.access_url },
    InlineCss: true,
    Tag: WAVE_ID,
    TrackOpens: true,
    TrackLinks: 'None',
    MessageStream: 'broadcast',
    Metadata: { wave: WAVE_ID, batch_digest: digest },
    Attachments: [{
      Name: 'opda-email-logo.png',
      Content: logo,
      ContentType: 'image/png',
      ContentID: 'cid:opda-logo',
    }],
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = keychainToken();
  const acceptedIds = await acceptedIdentityIds(graphToken());
  const ledger = readCsv(LEDGER);
  const [template, server, stream, suppressionResult] = await Promise.all([
    postmark(token, `/templates/${TEMPLATE_ALIAS}`),
    postmark(token, '/server'),
    postmark(token, '/message-streams/broadcast'),
    postmark(token, '/message-streams/broadcast/suppressions/dump'),
  ]);
  validatePostmark(template, server, stream);
  const excluded = blockedFromLedger(ledger);
  for (const row of suppressionResult.Suppressions ?? []) excluded.add(normalizeEmail(row.EmailAddress));
  const candidates = validatedCandidates(readCsv(MAILING_LIST), readCsv(INVITATIONS), excluded, acceptedIds);
  const selected = selectAcrossDomains(candidates);
  const logoBuffer = fs.readFileSync(LOGO);
  const basis = {
    wave_id: WAVE_ID,
    template_id: TEMPLATE_ID,
    template_alias: TEMPLATE_ALIAS,
    subject: SUBJECT,
    stream: 'broadcast',
    track_opens: true,
    track_links: 'None',
    logo_sha256: sha256(logoBuffer),
    recipients: selected,
  };
  const digest = sha256(JSON.stringify(basis));
  writeSnapshot(digest, basis);
  const domainCount = new Set(selected.map((row) => row.domain)).size;
  if (!args.execute) {
    process.stdout.write(`${JSON.stringify({ mode: 'dry-run', wave: WAVE_ID, recipients: selected.length, organisations_or_domains: domainCount, digest }, null, 2)}\n`);
    return;
  }
  if (args.digest !== digest) throw new Error('The approved digest does not match the current wave snapshot');

  const logo = logoBuffer.toString('base64');
  let accepted = 0;
  for (const candidate of selected) {
    const submittedAt = new Date().toISOString();
    appendLedger({ wave_id: WAVE_ID, batch_digest: digest, email: candidate.email, status: 'attempting', submitted_at: submittedAt });
    let result;
    try {
      result = await postmark(token, '/email/withTemplate', { method: 'POST', body: messageFor(candidate, logo, digest) });
    } catch {
      appendLedger({ wave_id: WAVE_ID, batch_digest: digest, email: candidate.email, status: 'unknown', submitted_at: submittedAt, error_code: 'network' });
      throw new Error(`${WAVE_ID} stopped after ${accepted} accepted messages; the last outcome needs reconciliation`);
    }
    if (result.ErrorCode !== 0 || !result.MessageID) {
      appendLedger({ wave_id: WAVE_ID, batch_digest: digest, email: candidate.email, status: 'rejected', submitted_at: result.SubmittedAt || submittedAt, error_code: result.ErrorCode ?? 'unknown' });
      throw new Error(`${WAVE_ID} stopped after ${accepted} accepted messages`);
    }
    appendLedger({ wave_id: WAVE_ID, batch_digest: digest, email: candidate.email, status: 'accepted', postmark_message_id: result.MessageID, submitted_at: result.SubmittedAt || submittedAt, error_code: result.ErrorCode });
    accepted += 1;
  }
  process.stdout.write(`${JSON.stringify({ mode: 'execute', wave: WAVE_ID, accepted, digest }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Invitation wave blocked: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export { messageFor, parseArgs, selectAcrossDomains, sha256 };
