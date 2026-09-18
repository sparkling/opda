#!/usr/bin/env node
/**
 * Resend the Technology Working Group invitation to named, already-provisioned participants.
 *
 *   node scripts/technology-invitation-resend.mjs <email> [<email> ...] [--name <email>=<Display Name>] [--execute]
 *
 * The original 2026-08-14 send went through Microsoft Graph sendMail from the smartdata mailbox,
 * not Postmark; this repeats that path. Without --execute it is a read-only preflight. With it,
 * each recipient gets a fresh silent redemption URL (no Microsoft invitation mail), one rendering
 * of docs/templates/technology-working-group-invitation-email.html, and a ledger row.
 * Never prints or stores a redemption URL: the ledger keeps its SHA-256 only.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { csvField, readCsv } from './_lib/csv.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEDGER = path.join(ROOT, 'source/_inbox/technology-working-group/invitation-send-ledger.csv');
const TEMPLATE = path.join(ROOT, 'docs/templates/technology-working-group-invitation-email.html');
const LOGO = path.join(ROOT, 'docs/templates/assets/opda-email-logo.png');
const TENANT_ID = '143540d4-4fbc-4005-882a-29656cd01a36';
const TEAM_ID = '286b29b1-163d-4cb5-aaec-39b1c5ceef4b';
const TEAM_URL = 'https://teams.microsoft.com/l/team/19%3aEhhhmMLawK4BKudHWidPdMyWweicWuJtspGc7SZEZCE1%40thread.tacv2'
  + `/conversations?groupId=${TEAM_ID}&tenantId=${TENANT_ID}`;
const SENDER = 'smartdata@openpropdata.org.uk';
const SUBJECT = 'You’re invited to help shape the Smart Property Data Trust Framework';
const UNSUBSCRIBE = `mailto:${SENDER}?subject=Unsubscribe%20from%20Technology%20Working%20Group%20emails`;
const LEDGER_FIELDS = ['email', 'status', 'access_kind', 'message_id', 'access_url_sha256', 'submitted_at', 'error'];

function parseArgs(values) {
  const args = { emails: [], names: new Map(), execute: false };
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--execute') args.execute = true;
    else if (values[index] === '--name') {
      const [email, ...name] = (values[++index] ?? '').split('=');
      if (!email || !name.join('=').trim()) throw new Error('--name expects <email>=<Display Name>');
      args.names.set(email.trim().toLowerCase(), name.join('=').trim());
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[index])) args.emails.push(values[index].toLowerCase());
    else throw new Error(`Unknown command-line option: ${values[index]}`);
  }
  if (!args.emails.length) throw new Error('At least one recipient email is required');
  return args;
}

// Read-only identity state needs User.Read.All (Azure CLI); invitations and mail use the m365 CLI connection.
function azureCliToken() {
  const tenant = execFileSync('az', ['account', 'show', '--query', 'tenantId', '--output', 'tsv'], { encoding: 'utf8' }).trim();
  if (tenant !== TENANT_ID) throw new Error('Azure CLI is authenticated to the wrong Microsoft tenant');
  return execFileSync('az', ['account', 'get-access-token', '--resource-type', 'ms-graph', '--query', 'accessToken', '--output', 'tsv'], { encoding: 'utf8' }).trim();
}
function m365Token() {
  const m365 = execFileSync('npx', ['--yes', '--package', '@pnp/cli-microsoft365', 'which', 'm365'], { encoding: 'utf8' }).trim();
  const status = JSON.parse(execFileSync(m365, ['status', '--output', 'json'], { encoding: 'utf8' }));
  if (status.appTenant !== TENANT_ID || status.connectedAs !== SENDER) throw new Error('The m365 CLI is not connected as the smartdata mailbox');
  return execFileSync(m365, ['util', 'accesstoken', 'get', '--resource', 'https://graph.microsoft.com', '--output', 'text'], { encoding: 'utf8' }).trim();
}

async function graph(token, route, options = {}) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${route}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 202 || response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Graph ${response.status} ${options.method ?? 'GET'} ${route}: ${body.error?.message ?? ''}`);
  return body;
}

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function appendLedger(row) {
  const line = LEDGER_FIELDS.map((field) => csvField(row[field])).join(',') + '\n';
  fs.appendFileSync(LEDGER, line, { mode: 0o600 });
}

function render(template, displayName, accessUrl) {
  const html = template.replace(/<!--[\s\S]*?-->/, '')
    .replaceAll('{{display_name}}', escapeHtml(displayName))
    .replaceAll('{{access_url}}', accessUrl)
    .replaceAll('{{{ pm:unsubscribe }}}', UNSUBSCRIBE);
  if (/\{\{/.test(html)) throw new Error('Unrendered template variable');
  return html;
}

const args = parseArgs(process.argv.slice(2));
const readToken = azureCliToken();
const previous = readCsv(LEDGER);
const template = fs.readFileSync(TEMPLATE, 'utf8');
const logo = fs.readFileSync(LOGO).toString('base64');
const plan = [];
for (const email of args.emails) {
  const { value: users } = await graph(readToken, `/users?$filter=mail eq '${email}'&$select=id,displayName,mail,userType,externalUserState,accountEnabled`);
  if (users.length !== 1) throw new Error(`Expected exactly one Entra identity for ${email}, found ${users.length}`);
  const [user] = users;
  const { value: membership } = await graph(readToken, `/users/${user.id}/checkMemberGroups`, { method: 'POST', body: JSON.stringify({ groupIds: [TEAM_ID] }) });
  const sent = previous.filter((row) => row.email.toLowerCase() === email && row.status === 'accepted').length;
  const displayName = args.names.get(email) ?? user.displayName;
  const accessKind = user.externalUserState === 'PendingAcceptance' ? 'invite-redeem' : 'team-direct';
  const ok = user.accountEnabled && membership.length === 1 && (user.userType === 'Guest' || accessKind === 'team-direct');
  console.log(`${email} | ${displayName} | ${user.userType} ${user.externalUserState ?? 'n/a'} | team member: ${membership.length === 1 ? 'yes' : 'NO'} | previously sent: ${sent} | plan: ${ok ? accessKind : 'BLOCKED'}`);
  if (!ok) throw new Error(`${email} is not an enabled Technology Team member; nothing sent`);
  plan.push({ email, displayName, user, accessKind });
}
if (!args.execute) { console.log('Preflight only. Re-run with --execute to send.'); process.exit(0); }

const sendToken = m365Token();
for (const { email, displayName, user, accessKind } of plan) {
  let accessUrl = TEAM_URL;
  if (accessKind === 'invite-redeem') {
    // Silent reissue for the same pending guest: no Microsoft mail, no redemption reset.
    const invitation = await graph(sendToken, '/invitations', { method: 'POST', body: JSON.stringify({
      invitedUserEmailAddress: email, invitedUserDisplayName: displayName, inviteRedirectUrl: TEAM_URL,
      sendInvitationMessage: false, resetRedemption: false,
    }) });
    if (invitation.sendInvitationMessage !== false || invitation.invitedUser?.id !== user.id || !invitation.inviteRedeemUrl) {
      throw new Error(`Silent invitation invariant failed for ${email}; nothing sent`);
    }
    accessUrl = invitation.inviteRedeemUrl;
  }
  const messageId = crypto.randomUUID();
  const row = { email, status: 'attempting', access_kind: accessKind, message_id: messageId, access_url_sha256: sha256(accessUrl), submitted_at: new Date().toISOString(), error: '' };
  appendLedger(row);
  try {
    await graph(sendToken, '/me/sendMail', { method: 'POST', body: JSON.stringify({ saveToSentItems: true, message: {
      subject: SUBJECT, internetMessageId: `<${messageId}@openpropdata.org.uk>`,
      from: { emailAddress: { name: 'Smart Property Data Trust Framework', address: SENDER } },
      replyTo: [{ emailAddress: { name: 'Smart Property Data Trust Framework', address: SENDER } }],
      toRecipients: [{ emailAddress: { name: displayName, address: email } }],
      body: { contentType: 'html', content: render(template, displayName, accessUrl) },
      attachments: [{ '@odata.type': '#microsoft.graph.fileAttachment', name: 'opda-email-logo.png', contentType: 'image/png', contentId: 'opda-logo', isInline: true, contentBytes: logo }],
    } }) });
    appendLedger({ ...row, status: 'accepted' });
    console.log(`sent ${email} (${accessKind}) message ${messageId}`);
  } catch (error) {
    appendLedger({ ...row, status: 'failed', error: error.message.slice(0, 200) });
    throw error;
  }
}
