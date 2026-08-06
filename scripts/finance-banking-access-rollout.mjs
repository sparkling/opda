#!/usr/bin/env node
import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { csvField, readCsv } from './_lib/csv.mjs';
const execFileAsync = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const INPUT_DIR = path.join(ROOT, 'source/_inbox/finance-banking-working-group');
const ROSTER_PATH = path.join(INPUT_DIR, 'participants.csv');
const GENERIC_DOMAINS_PATH = path.join(INPUT_DIR, 'generic-email-domains.txt');
const INVITES_PATH = path.join(INPUT_DIR, 'invite-redeem-urls.csv');
const SUMMARY_PATH = path.join(INPUT_DIR, 'rollout-summary.json');
const SEED_INVITE_PATH = process.env.OPDA_SEED_INVITE_PATH ?? '';
const SEED_INVITE_EMAIL = process.env.OPDA_SEED_INVITE_EMAIL?.trim().toLowerCase() ?? '';
const SITE_URL = 'https://openpropertydataassociation.sharepoint.com/sites/FinanceBankingSourceIntake';
const TEAM_ID = '5f9b7675-328a-44fd-8df7-4755096b7629';
const TEAM_URL =
  'https://teams.microsoft.com/l/team/19%3apMps7lqMA-_UlUiCD_IftTAS9dveF4u-' +
  'U16YN_88jSo1%40thread.tacv2/conversations?groupId=5f9b7675-328a-44fd-8df7-4755096b7629' +
  '&tenantId=143540d4-4fbc-4005-882a-29656cd01a36';
const INDEX_GROUP = 'Finance and Banking Organisation Index Users';
const PILOT_EMAIL = process.env.OPDA_PILOT_EMAIL?.trim().toLowerCase() ?? '';
const INTERNAL_EMAIL = process.env.OPDA_INTERNAL_EMAIL?.trim().toLowerCase() ?? '';
const DOMAIN_ALIASES = new Map([['leekunited.co.uk', 'leekbs.co.uk']]); function canonicalDomain(domain) { return DOMAIN_ALIASES.get(domain) ?? domain; }
const INVITE_COLUMNS = [
  'display_name', 'email', 'domain', 'entra_user_id', 'user_principal_name',
  'invitation_status', 'send_invitation_message', 'invite_redeem_url',
  'access_url', 'sharepoint_enabled', 'provisioning_source',
];
const mode = process.argv.includes('--execute') ? 'execute' : 'preflight';
function writeInviteCheckpoint(records) {
  const rows = [...records.values()].sort((left, right) => left.email.localeCompare(right.email));
  const content = [
    INVITE_COLUMNS.map(csvField).join(','),
    ...rows.map((row) => INVITE_COLUMNS.map((column) => csvField(row[column])).join(',')),
  ].join('\n') + '\n';
  const temporaryPath = `${INVITES_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, content, { mode: 0o600 });
  fs.renameSync(temporaryPath, INVITES_PATH);
  fs.chmodSync(INVITES_PATH, 0o600);
}
function resolveM365() {
  return execFileSync(
    'npx',
    ['--yes', '--package', '@pnp/cli-microsoft365', 'which', 'm365'],
    { encoding: 'utf8' },
  ).trim();
}
async function runM365(m365, args) {
  const { stdout } = await execFileAsync(m365, args, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout.trim();
}
function getGraphToken(m365) {
  return execFileSync(
    m365,
    ['util', 'accesstoken', 'get', '--resource', 'https://graph.microsoft.com', '--output', 'text'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  ).trim();
}
async function graphRequest(token, route, options = {}) {
  const url = route.startsWith('https://') ? route : `https://graph.microsoft.com/v1.0${route}`;
  let lastError;
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    if (response.ok) {
      if (response.status === 204) return null;
      return response.json();
    }
    const body = await response.text();
    lastError = new Error(`Graph ${response.status} ${options.method ?? 'GET'} ${route}: ${body}`);
    if (![429, 500, 502, 503, 504].includes(response.status)) throw lastError;
    const retryAfter = Number(response.headers.get('retry-after')) || 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter, 30) * 1000));
  }
  throw lastError;
}
async function graphCollection(token, route) {
  const values = [];
  let next = route;
  while (next) {
    const page = await graphRequest(token, next);
    values.push(...(page.value ?? []));
    next = page['@odata.nextLink'] ?? null;
  }
  return values;
}
async function runPool(items, concurrency, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}
function validateRoster(roster, genericDomains) {
  const emails = new Set();
  for (const participant of roster) {
    participant.email = participant.email.trim().toLowerCase();
    participant.domain = participant.domain.trim().toLowerCase();
    if (!participant.display_name.trim()) throw new Error(`Missing display name for ${participant.email}`);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(participant.email)) {
      throw new Error(`Invalid email address: ${participant.email}`);
    }
    if (participant.email.split('@')[1] !== participant.domain) {
      throw new Error(`Email/domain mismatch: ${participant.email} / ${participant.domain}`);
    }
    if (emails.has(participant.email)) throw new Error(`Duplicate email: ${participant.email}`);
    emails.add(participant.email);
    participant.sharepoint_enabled = genericDomains.has(participant.domain) ? 'false' : 'true';
  }
}
function inviteRecord(participant, user, response, source) {
  const inviteUrl = response?.inviteRedeemUrl ?? '';
  return {
    display_name: participant.display_name,
    email: participant.email,
    domain: participant.domain,
    entra_user_id: user.id,
    user_principal_name: user.userPrincipalName ?? '',
    invitation_status: response?.status ?? source,
    send_invitation_message: response ? String(response.sendInvitationMessage) : 'false',
    invite_redeem_url: inviteUrl,
    access_url: inviteUrl || TEAM_URL,
    sharepoint_enabled: participant.sharepoint_enabled,
    provisioning_source: source,
  };
}
async function preflight(m365, token, roster, genericDomains) {
  const groups = JSON.parse(await runM365(m365, [
    'spo', 'group', 'list', '--webUrl', SITE_URL, '--output', 'json',
  ]));
  const groupNames = new Set(groups.map((group) => group.Title));
  const eligibleDomains = [...new Set(
    roster.filter((participant) => participant.sharepoint_enabled === 'true')
      .map((participant) => canonicalDomain(participant.domain)),
  )].sort();
  const missingGroups = eligibleDomains.filter(
    (domain) => !groupNames.has(`Finance and Banking Contributors - ${domain}`),
  );
  const folders = JSON.parse(await runM365(m365, [
    'spo', 'folder', 'list',
    '--webUrl', SITE_URL,
    '--parentFolderUrl', '/sites/FinanceBankingSourceIntake/Incoming Source Material/By Organisation',
    '--output', 'json',
  ]));
  const folderNames = new Set(folders.map((folder) => folder.Name.toLowerCase()));
  const missingFolders = eligibleDomains.filter((domain) => !folderNames.has(domain));
  const directoryUsers = await graphCollection(
    token,
    '/users?$select=id,displayName,mail,userPrincipalName,otherMails&$top=999',
  );
  const directoryEmails = new Set(directoryUsers.flatMap(
    (user) => [user.mail, ...(user.otherMails ?? [])].filter(Boolean).map((email) => email.toLowerCase()),
  ));
  const existingIdentities = roster.filter((participant) => directoryEmails.has(participant.email)).length;
  if (missingGroups.length || missingFolders.length || !groupNames.has(INDEX_GROUP)) {
    throw new Error(JSON.stringify({ missingGroups, missingFolders, missingIndexGroup: !groupNames.has(INDEX_GROUP) }));
  }
  return {
    roster: roster.length,
    teamsParticipants: roster.length,
    sharePointParticipants: roster.filter((participant) => participant.sharepoint_enabled === 'true').length,
    teamsOnlyGenericParticipants: roster.filter((participant) => genericDomains.has(participant.domain)).length,
    eligibleDomains: eligibleDomains.length,
    existingIdentities,
    newIdentitiesRequired: roster.length - existingIdentities,
    preflightPassed: true,
  };
}
async function provisionInvitations(token, roster, existingRecords) {
  const users = await graphCollection(
    token,
    '/users?$select=id,displayName,mail,userPrincipalName,otherMails&$top=999',
  );
  const usersByEmail = new Map();
  for (const user of users) {
    for (const email of [user.mail, ...(user.otherMails ?? [])].filter(Boolean)) {
      usersByEmail.set(email.toLowerCase(), user);
    }
  }
  if (SEED_INVITE_PATH && SEED_INVITE_EMAIL && fs.existsSync(SEED_INVITE_PATH) && !existingRecords.has(SEED_INVITE_EMAIL)) {
    const seed = JSON.parse(fs.readFileSync(SEED_INVITE_PATH, 'utf8'));
    const participant = roster.find((item) => item.email === SEED_INVITE_EMAIL);
    if (!participant) throw new Error(`Seed invitation participant is not in the roster: ${SEED_INVITE_EMAIL}`);
    const existing = usersByEmail.get(participant.email);
    if (!existing || seed.invitedUser?.id !== existing.id || seed.sendInvitationMessage !== false) {
      throw new Error('The silent-invitation seed does not match the existing Buster Tolfree identity.');
    }
    existingRecords.set(participant.email, inviteRecord(participant, {
      ...existing,
      userPrincipalName: seed.invitedUser.userPrincipalName ?? existing.userPrincipalName,
    }, seed, 'silent-invitation-existing-identity'));
    writeInviteCheckpoint(existingRecords);
  }
  const pending = roster.filter((participant) => !existingRecords.has(participant.email));
  let completed = 0;
  await runPool(pending, 4, async (participant) => {
    const existing = usersByEmail.get(participant.email);
    if (participant.email === PILOT_EMAIL || participant.email === INTERNAL_EMAIL) {
      if (!existing) throw new Error(`Expected existing identity not found: ${participant.email}`);
      const source = participant.email === PILOT_EMAIL ? 'existing-redeemed-pilot' : 'existing-internal-member';
      existingRecords.set(participant.email, inviteRecord(participant, existing, null, source));
    } else {
      const response = await graphRequest(token, '/invitations', {
        method: 'POST',
        body: JSON.stringify({
          invitedUserEmailAddress: participant.email,
          invitedUserDisplayName: participant.display_name,
          inviteRedirectUrl: TEAM_URL,
          sendInvitationMessage: false,
        }),
      });
      if (response.sendInvitationMessage !== false || !response.inviteRedeemUrl) {
        throw new Error(`Silent invitation invariant failed for ${participant.email}`);
      }
      if (existing && response.invitedUser?.id !== existing.id) {
        throw new Error(`Invitation created a duplicate identity for ${participant.email}`);
      }
      const user = {
        id: response.invitedUser.id,
        userPrincipalName: response.invitedUser.userPrincipalName,
      };
      usersByEmail.set(participant.email, user);
      existingRecords.set(
        participant.email,
        inviteRecord(
          participant,
          user,
          response,
          existing ? 'silent-invitation-existing-identity' : 'silent-invitation-new-identity',
        ),
      );
    }
    completed += 1;
    writeInviteCheckpoint(existingRecords);
    if (completed % 25 === 0 || completed === pending.length) {
      console.log(`Silent identities: ${existingRecords.size}/${roster.length}`);
    }
  });
  return existingRecords;
}
async function addTeamMembers(token, records) {
  const members = await graphCollection(
    token,
    `/groups/${TEAM_ID}/members?$select=id,mail,userPrincipalName&$top=999`,
  );
  const memberIds = new Set(members.map((member) => member.id));
  const missingIds = [...new Set([...records.values()]
    .map((record) => record.entra_user_id)
    .filter((id) => !memberIds.has(id)))];
  for (let start = 0; start < missingIds.length; start += 20) {
    const batch = missingIds.slice(start, start + 20);
    await graphRequest(token, `/groups/${TEAM_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({
        'members@odata.bind': batch.map(
          (id) => `https://graph.microsoft.com/v1.0/directoryObjects/${id}`,
        ),
      }),
    });
    console.log(`Team membership: ${Math.min(start + batch.length, missingIds.length)}/${missingIds.length} added`);
  }
}
async function addSharePointMembers(m365, roster, records) {
  const eligible = roster.filter((participant) => participant.sharepoint_enabled === 'true');
  const byDomain = new Map();
  for (const participant of eligible) {
    const domain = canonicalDomain(participant.domain);
    const values = byDomain.get(domain) ?? new Map();
    values.set(records.get(participant.email).entra_user_id, participant.email);
    byDomain.set(domain, values);
  }
  const domains = [...byDomain.entries()].map(
    ([domain, users]) => [domain, [...users.values()]],
  );
  let completed = 0;
  await runPool(domains, 4, async ([domain, emails]) => {
    await runM365(m365, [
      'spo', 'group', 'member', 'add',
      '--webUrl', SITE_URL,
      '--groupName', `Finance and Banking Contributors - ${domain}`,
      '--emails', emails.join(','),
      '--output', 'none',
    ]);
    completed += 1;
    if (completed % 15 === 0 || completed === domains.length) {
      console.log(`SharePoint company groups: ${completed}/${domains.length}`);
    }
  });
  const uniqueEligible = [...new Map(
    eligible.map((participant) => [records.get(participant.email).entra_user_id, participant]),
  ).values()];
  const emailBatches = [];
  for (let start = 0; start < uniqueEligible.length; start += 20) {
    emailBatches.push(uniqueEligible.slice(start, start + 20).map((participant) => participant.email));
  }
  await runPool(emailBatches, 3, async (emails, index) => {
    await runM365(m365, [
      'spo', 'group', 'member', 'add',
      '--webUrl', SITE_URL,
      '--groupName', INDEX_GROUP,
      '--emails', emails.join(','),
      '--output', 'none',
    ]);
    if ((index + 1) % 5 === 0 || index + 1 === emailBatches.length) {
      console.log(`SharePoint index batches: ${index + 1}/${emailBatches.length}`);
    }
  });
}
async function validateRollout(m365, token, roster, genericDomains, records) {
  const errors = [];
  const memberIds = new Set((await graphCollection(
    token,
    `/groups/${TEAM_ID}/members?$select=id&$top=999`,
  )).map((member) => member.id));
  for (const record of records.values()) {
    if (!memberIds.has(record.entra_user_id)) errors.push(`Missing Team member: ${record.email}`);
    if (
      !['existing-redeemed-pilot', 'existing-internal-member'].includes(record.provisioning_source) &&
      (!record.invite_redeem_url || record.send_invitation_message !== 'false')
    ) {
      errors.push(`Invitation record invalid: ${record.email}`);
    }
  }
  const eligible = roster.filter((participant) => participant.sharepoint_enabled === 'true');
  const directoryUsers = await graphCollection(
    token,
    '/users?$select=id,mail,userPrincipalName,otherMails&$top=999',
  );
  const directoryIdByEmail = new Map();
  for (const user of directoryUsers) {
    for (const email of [user.mail, ...(user.otherMails ?? [])].filter(Boolean)) {
      directoryIdByEmail.set(email.toLowerCase(), user.id);
    }
  }
  const expectedByDomain = new Map();
  for (const participant of eligible) {
    const domain = canonicalDomain(participant.domain);
    const values = expectedByDomain.get(domain) ?? new Set();
    values.add(records.get(participant.email).entra_user_id);
    expectedByDomain.set(domain, values);
  }
  const domainEntries = [...expectedByDomain.entries()];
  await runPool(domainEntries, 5, async ([domain, expected]) => {
    const members = JSON.parse(await runM365(m365, [
      'spo', 'group', 'member', 'list',
      '--webUrl', SITE_URL,
      '--groupName', `Finance and Banking Contributors - ${domain}`,
      '--output', 'json',
    ]));
    const actual = new Map();
    for (const member of members) {
      const email = member.Email?.toLowerCase();
      const userId = email ? directoryIdByEmail.get(email) : null;
      if (!userId) errors.push(`Unresolved SharePoint company member: ${domain} / ${email ?? member.Title}`);
      else actual.set(userId, email);
    }
    for (const userId of expected) {
      if (!actual.has(userId)) errors.push(`Missing SharePoint company identity: ${domain} / ${userId}`);
    }
    for (const [userId, email] of actual) {
      if (!expected.has(userId)) errors.push(`Unexpected SharePoint company member: ${domain} / ${email}`);
    }
    const folder = JSON.parse(await runM365(m365, [
      'spo', 'folder', 'get',
      '--webUrl', SITE_URL,
      '--url', `/sites/FinanceBankingSourceIntake/Incoming Source Material/By Organisation/${domain}`,
      '--withPermissions',
      '--output', 'json',
    ]));
    const assignments = folder.ListItemAllFields?.RoleAssignments ?? [];
    const expectedGroup = assignments.find(
      (assignment) => assignment.Member?.Title === `Finance and Banking Contributors - ${domain}`,
    );
    const foreignGroups = assignments.filter(
      (assignment) =>
        assignment.Member?.Title?.startsWith('Finance and Banking Contributors - ') &&
        assignment.Member.Title !== `Finance and Banking Contributors - ${domain}`,
    );
    if (!folder.ListItemAllFields?.HasUniqueRoleAssignments) {
      errors.push(`Folder inherits permissions: ${domain}`);
    }
    if (
      !expectedGroup?.RoleDefinitionBindings?.some(
        (binding) => binding.Name === 'Manage Organisation Area - No Sharing',
      )
    ) {
      errors.push(`Folder contributor role missing: ${domain}`);
    }
    if (foreignGroups.length) errors.push(`Cross-company folder grant: ${domain}`);
  });
  const indexMembers = JSON.parse(await runM365(m365, [
    'spo', 'group', 'member', 'list',
    '--webUrl', SITE_URL,
    '--groupName', INDEX_GROUP,
    '--output', 'json',
  ]));
  const indexIds = new Set(indexMembers.flatMap((member) => {
    const userId = member.Email ? directoryIdByEmail.get(member.Email.toLowerCase()) : null;
    if (!userId) errors.push(`Unresolved SharePoint index member: ${member.Email ?? member.Title}`);
    return userId ? [userId] : [];
  }));
  const uniqueEligible = new Set(
    eligible.map((participant) => records.get(participant.email).entra_user_id),
  );
  for (const userId of uniqueEligible) {
    if (!indexIds.has(userId)) errors.push(`Missing SharePoint index identity: ${userId}`);
  }
  for (const participant of roster.filter((item) => genericDomains.has(item.domain))) {
    if (indexIds.has(records.get(participant.email).entra_user_id)) {
      errors.push(`Generic account has SharePoint index access: ${participant.email}`);
    }
  }
  for (const participant of roster.filter((item) => genericDomains.has(item.domain))) {
    const groupName = `Finance and Banking Contributor - ${participant.email.replace('@', ' ')}`;
    const members = JSON.parse(await runM365(m365, [
      'spo', 'group', 'member', 'list',
      '--webUrl', SITE_URL,
      '--groupName', groupName,
      '--output', 'json',
    ]));
    if (members.length) errors.push(`Generic account has SharePoint group access: ${participant.email}`);
  }
  if (errors.length) throw new Error(`Rollout validation failed:\n${errors.join('\n')}`);
  return {
    roster: roster.length,
    teamRosterMembersValidated: records.size,
    uniqueTeamMembersValidated: new Set([...records.values()].map((record) => record.entra_user_id)).size,
    sharePointParticipantsValidated: eligible.length,
    companyFoldersValidated: expectedByDomain.size,
    teamsOnlyGenericParticipantsValidated: roster.length - eligible.length,
    automatedInvitationEmailsRequested: 0,
    customInvitationEmailsSent: 0,
    validatedAt: new Date().toISOString(),
  };
}
async function main() {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
  const roster = readCsv(ROSTER_PATH);
  const genericDomains = new Set(
    fs.readFileSync(GENERIC_DOMAINS_PATH, 'utf8')
      .split(/\r?\n/)
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
  );
  validateRoster(roster, genericDomains);
  const m365 = resolveM365();
  const token = getGraphToken(m365);
  const preflightResult = await preflight(m365, token, roster, genericDomains);
  console.log(JSON.stringify(preflightResult, null, 2));
  if (mode !== 'execute') return;
  const existingRecords = new Map(
    readCsv(INVITES_PATH).map((record) => [record.email.toLowerCase(), record]),
  );
  const records = await provisionInvitations(token, roster, existingRecords);
  if (records.size !== roster.length) throw new Error('Invitation checkpoint is incomplete.');
  await addTeamMembers(token, records);
  await addSharePointMembers(m365, roster, records);
  const summary = await validateRollout(m365, token, roster, genericDomains, records);
  fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  fs.chmodSync(SUMMARY_PATH, 0o600);
  console.log(JSON.stringify(summary, null, 2));
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
