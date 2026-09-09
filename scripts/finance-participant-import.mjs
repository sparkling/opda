#!/usr/bin/env node
// One-off, source-pinned operator import. No campaign, invitation or outbox replay.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { fromIni } from '@aws-sdk/credential-providers';
import * as dynamo from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import * as cognito from '@aws-sdk/client-cognito-identity-provider';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { APP_SCOPES, verifyPrivateApp } from '../config/aws/hubspot-participation/admin.mjs';
import { CONTACT_PROPERTIES } from '../config/aws/hubspot-participation/import.mjs';
import { createHubSpotClient } from '../config/aws/hubspot-approval/client.mjs';
import { createIdentity } from '../config/aws/hubspot-approval/identity.mjs';
import { createStore } from '../config/aws/hubspot-approval/store.mjs';
import { contactProfile, digest, ordinaryAccess } from '../config/aws/hubspot-approval/domain.mjs';
import { financeImportDecisions, FINANCE_IMPORT_ID, FINANCE_ROSTER_SHA256, FINANCE_DOMAIN_ID } from '../config/aws/hubspot-approval/finance-import.mjs';
import { readFinanceRoster, financeProperties, assertImportAccount, planFinanceSeed, IMPORT_PREFIX,
  legacyFinanceIdentity, LEGACY_APPROVAL_ID, indexFinanceContacts } from './_lib/finance-roster-import.mjs';
import { createMicrosoftClient } from '../src/approval-onboarding/microsoft-auth.mjs';
import { WORKSPACES } from '../src/approval-onboarding/settings.mjs';

const [action, ...extra] = process.argv.slice(2);
if (!['plan', 'apply', 'verify'].includes(action) || extra.length) {
  console.error('Usage: node scripts/finance-participant-import.mjs <plan|apply|verify>'); process.exit(1);
}
const cfg = { region: 'eu-west-2', credentials: fromIni({ profile: 'opda' }), maxAttempts: 2 };
const table = 'opda-participants', functionName = 'opda-hubspot-approval';
const sourceUuid = 'ed008d5e-340e-41c7-b9d1-b2c58e09fbcc';
const ruleName = 'opda-site-HubSpotApprovalApplicati-RecoverySchedule-SF9ahRVTNChP';
const rawDb = new dynamo.DynamoDBClient(cfg), db = DynamoDBDocumentClient.from(rawDb);
const idp = new cognito.CognitoIdentityProviderClient(cfg), secrets = new SecretsManagerClient(cfg);
const aws = argv => JSON.parse(execFileSync('aws', [...argv, '--profile', 'opda', '--region', cfg.region, '--output', 'json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }));
const get = async pk => (await db.send(new GetCommand({ TableName: table, Key: { pk }, ConsistentRead: true }))).Item;
const readSecret = async id => JSON.parse((await secrets.send(new GetSecretValueCommand({ SecretId: id }))).SecretString);
const counts = values => values.reduce((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {});
async function parallel(items, fn) {
  let cursor = 0;
  const results = await Promise.allSettled(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (cursor < items.length) await fn(items[cursor++]);
  }));
  const failure = results.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
}

async function allRows() {
  const rows = new Map(); let key, pages = 0;
  do {
    const page = await db.send(new ScanCommand({ TableName: table, ConsistentRead: true,
      ...(key ? { ExclusiveStartKey: key } : {}) }));
    for (const row of page.Items ?? []) rows.set(row.pk, row);
    key = page.LastEvaluatedKey;
    if (++pages > 50 || rows.size > 30000) throw new Error('Inventory exceeds import bound');
  } while (key);
  return rows;
}

async function bridge() {
  const secret = await readSecret('opda/hubspot/participant-crm-bridge');
  assert.equal(secret.portalId, 144765514); assert.equal(secret.appId, 52397854); assert.equal(secret.role, 'bridge');
  async function api(path, { method = 'GET', body } = {}) {
    const info = path === '/oauth/v2/private-apps/get/access-token-info';
    if (!info && !path.startsWith('/crm/v3/objects/contacts')) throw new Error('Unsupported import endpoint');
    const response = await fetch(`https://api.hubapi.com${path}`, {
      method: info ? 'POST' : method, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${secret.accessToken}`, 'Content-Type': 'application/json' },
      ...(info || body ? { body: JSON.stringify(info ? { tokenKey: secret.accessToken } : body) } : {}),
    });
    if (!response.ok) throw new Error(`CRM import HTTP ${response.status}`);
    return response.json();
  }
  await verifyPrivateApp(api, { portalId: 144765514, appId: 52397854, scopes: APP_SCOPES.bridge });
  return { api, hubspot: createHubSpotClient({ getSecret: async () => secret }) };
}

async function crmInventory(api, roster) {
  // Complete operator-side inventory includes aliases and archives. Never infer
  // absence from a partial batch response. This is not a new Lambda workload.
  const contacts = [];
  for (const archived of ['false', 'true']) {
    let after; const cursors = new Set();
    do {
      const query = new URLSearchParams({ archived, limit: '100', properties: [...CONTACT_PROPERTIES, 'hs_additional_emails'].join(',') });
      if (after) query.set('after', after);
      const page = await api(`/crm/v3/objects/contacts?${query}`);
      if (!Array.isArray(page.results) || page.errors?.length) throw new Error('Incomplete CRM inventory');
      contacts.push(...page.results);
      after = page.paging?.next?.after;
      if (after && cursors.has(String(after)) || contacts.length > 10000) throw new Error('CRM inventory bound');
      if (after) cursors.add(String(after));
    } while (after);
  }
  return indexFinanceContacts(roster, contacts);
}

async function microsoftInventory(roster) {
  const client = createMicrosoftClient({ siteUrls: Object.values(WORKSPACES).map(w => w.siteUrl),
    getSecret: () => readSecret('opda/microsoft/participation-onboarding') });
  const members = [], references = new Map();
  let route = `/groups/${WORKSPACES[FINANCE_DOMAIN_ID].teamId}/members/microsoft.graph.user?`
    + new URLSearchParams({ '$select': 'id,mail,otherMails,userPrincipalName,userType,accountEnabled,externalUserState', '$top': '999' });
  do {
    const page = await client.graph(route); members.push(...page.value);
    const next = page['@odata.nextLink'];
    if (next && !next.startsWith('https://graph.microsoft.com/v1.0/')) throw new Error('Unexpected Graph pagination');
    route = next ? next.slice('https://graph.microsoft.com/v1.0'.length) : null;
    if (members.length > 1000) throw new Error('Membership inventory bound');
  } while (route);
  const observedAt = Date.now();
  for (const person of roster) {
    const matches = members.filter(m => [m.mail, m.userPrincipalName, ...(m.otherMails ?? [])]
      .some(email => email?.toLowerCase() === person.email));
    if (matches.length !== 1 || matches[0].accountEnabled === false) throw new Error('Microsoft identity requires review');
    const m = matches[0], state = m.userType === 'Member' ? 'Member' : m.externalUserState;
    if (!['Member', 'Accepted', 'PendingAcceptance'].includes(state)) throw new Error('Unknown Microsoft acceptance');
    references.set(person.email, { userId: m.id, state, observedAt });
  }
  if (new Set([...references.values()].map(r => r.userId)).size !== roster.length) throw new Error('Microsoft identity alias overlap');
  return references;
}

function assertQuiescent() {
  const mapping = aws(['lambda', 'get-event-source-mapping', '--uuid', sourceUuid]);
  const schedule = aws(['events', 'describe-rule', '--name', ruleName]);
  const concurrency = aws(['lambda', 'get-function-concurrency', '--function-name', functionName]);
  if (mapping.State !== 'Disabled' || schedule.State !== 'DISABLED' || concurrency.ReservedConcurrentExecutions !== 0) {
    throw new Error('Approval consumer and recovery schedule must be paused and drained before apply');
  }
  const disabledAt = new Date(mapping.LastModified).getTime();
  if (!Number.isFinite(disabledAt) || Date.now() - disabledAt < 310000) throw new Error('Approval invocation drain window has not elapsed');
}

function preflight(roster, contacts, rows) {
  for (const person of roster) {
    const contact = contacts.get(person.email), map = contact && rows.get(`CRM#CONTACT#${contact.id}`);
    const claim = rows.get(`EMAIL#${digest(person.email)}`);
    if (rows.has(`SYNC#SUPPRESS#EMAIL#${digest(person.email)}`)) throw new Error('Suppressed historical identity');
    if (map?.registrationId && rows.has(`SYNC#SUPPRESS#REGISTRATION#${map.registrationId}`)) throw new Error('Suppressed registration');
    financeProperties(person, contact);
    if (claim && !map) {
      const op = rows.get(claim.importKey);
      legacyFinanceIdentity(person, claim, op, rows.get(`USER#${op?.cognitoSub}`), rows.get(`MIGRATION#${LEGACY_APPROVAL_ID}`), Date.now());
    } else if (claim && claim.participantId !== map.participantId) throw new Error('Existing email binding requires review');
    if (map?.cognitoSub) assertImportAccount(map, rows.get(`USER#${map.cognitoSub}`), Date.now());
    if (map && !map.financeRosterImport && map.domainApprovals?.[FINANCE_DOMAIN_ID]) throw new Error('Existing Finance decision requires review');
  }
  const ids = new Set([...contacts.values()].map(c => c.id));
  const currentOperations = new Set([...rows.values()].filter(row => (row.pk.startsWith('CRM#CONTACT#') || row.pk.startsWith('USER#'))
    && ids.has(row.contactId ?? row.hubspotContactId))
    .flatMap(row => [row.onboarding?.operationId, row.accessNotice?.operationId,
      ...Object.values(row.domainApprovals ?? {}).map(domain => domain.onboarding?.operationId)]).filter(Boolean));
  if ([...rows.values()].some(row => row.pk.startsWith('CRM#ONBOARDING#') && ids.has(row.contactId)
    && row.status !== 'complete' && (row.status === 'pending' || currentOperations.has(row.operationId)))) {
    throw new Error('Unsettled prior onboarding must not be replayed by this import');
  }
}

async function bindLegacy(person, contact, store) {
  const claim = await get(`EMAIL#${digest(person.email)}`);
  if (!claim) return null;
  const op = await get(claim.importKey), marker = await get(`MIGRATION#${LEGACY_APPROVAL_ID}`);
  const row = legacyFinanceIdentity(person, claim, op, await get(`USER#${op?.cognitoSub}`), marker, Date.now());
  const profile = contactProfile(contact);
  const map = { ...profile, pk: `CRM#CONTACT#${contact.id}`, participantId: row.participantId,
    cognitoSub: row.cognitoSub, revision: 1, createdAt: Date.now(), legacyImportKey: op.pk };
  await db.send(new TransactWriteCommand({ TransactItems: [
    { Put: { TableName: table, Item: map, ConditionExpression: 'attribute_not_exists(pk)' } },
    { Update: { TableName: table, Key: { pk: row.pk },
      UpdateExpression: 'SET hubspotContactId = :contact, hubspotPortalId = :portal, #profile = if_not_exists(#profile, :profile)',
      ConditionExpression: 'attribute_not_exists(hubspotContactId) AND participantId = :pid AND cognitoSub = :sub AND email = :email '
        + 'AND #source = :source AND approvalId = :approval AND sourceSnapshotDigest = :digest AND sourceSnapshotVersionId = :snapshotVersion '
        + 'AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt)',
      ExpressionAttributeNames: { '#profile': 'profile', '#source': 'source' }, ExpressionAttributeValues: { ':contact': contact.id, ':portal': 144765514,
        ':profile': profile.profile, ':pid': row.participantId, ':sub': row.cognitoSub, ':email': row.email,
        ':source': row.source, ':approval': LEGACY_APPROVAL_ID, ':digest': marker.digest, ':snapshotVersion': marker.versionId } } },
    { ConditionCheck: { TableName: table, Key: { pk: claim.pk }, ConditionExpression: 'participantId = :pid AND importKey = :key',
      ExpressionAttributeValues: { ':pid': row.participantId, ':key': op.pk } } },
    { ConditionCheck: { TableName: table, Key: { pk: op.pk },
      ConditionExpression: '#phase = :complete AND cognitoSub = :sub AND participantId = :pid AND email = :email AND sourceSnapshotDigest = :digest',
      ExpressionAttributeNames: { '#phase': 'phase' }, ExpressionAttributeValues: { ':complete': 'complete', ':sub': row.cognitoSub,
        ':pid': row.participantId, ':email': row.email, ':digest': marker.digest } } },
    { ConditionCheck: { TableName: table, Key: { pk: marker.pk },
      ConditionExpression: 'digest = :digest AND versionId = :version AND approvedCount = :count',
      ExpressionAttributeValues: { ':digest': marker.digest, ':version': marker.versionId, ':count': 6 } } },
    { ConditionCheck: { TableName: table, Key: { pk: `SYNC#SUPPRESS#EMAIL#${digest(row.email)}` }, ConditionExpression: 'attribute_not_exists(pk)' } },
  ] }));
  await store.account(map);
  return map;
}

async function seed(dbPlan, map, row) {
  const absent = pk => ({ ConditionCheck: { TableName: table, Key: { pk }, ConditionExpression: 'attribute_not_exists(pk)' } });
  const fields = Object.entries(dbPlan.account).filter(([key, value]) => !isDeepStrictEqual(value, row[key]));
  const names = Object.fromEntries(fields.map(([key], i) => [`#f${i}`, key]));
  const values = Object.fromEntries(fields.map(([, value], i) => [`:f${i}`, value]));
  await db.send(new TransactWriteCommand({ TransactItems: [
    { Put: { TableName: table, Item: dbPlan.binding, ConditionExpression: 'revision = :revision',
      ExpressionAttributeValues: { ':revision': map.revision } } },
    { Update: { TableName: table, Key: { pk: row.pk },
      UpdateExpression: `SET ${fields.map((_, i) => `#f${i} = :f${i}`).join(', ')}`,
      ConditionExpression: 'participantId = :pid AND cognitoSub = :sub AND email = :email AND accessVersion = :v '
        + 'AND active = :active AND suspended = :suspended AND enrolmentStatus = :enrolment '
        + (row.updatedAt === undefined ? 'AND attribute_not_exists(updatedAt) ' : 'AND updatedAt = :updated ')
        + 'AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt) AND (attribute_not_exists(expiresAt) OR expiresAt > :now)',
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':pid': row.participantId, ':sub': row.cognitoSub, ':email': row.email, ':v': row.accessVersion,
        ':active': row.active, ':suspended': row.suspended, ':enrolment': row.enrolmentStatus,
        ...(row.updatedAt === undefined ? {} : { ':updated': row.updatedAt }),
        ':now': Math.floor(Date.now() / 1000) } } },
    { Put: { TableName: table, Item: dbPlan.audit, ConditionExpression: 'attribute_not_exists(pk)' } },
    { ConditionCheck: { TableName: table, Key: { pk: `EMAIL#${digest(row.email)}` }, ConditionExpression: 'participantId = :pid',
      ExpressionAttributeValues: { ':pid': row.participantId } } },
    absent(`SYNC#SUPPRESS#EMAIL#${digest(row.email)}`),
    ...(map.registrationId ? [absent(`SYNC#SUPPRESS#REGISTRATION#${map.registrationId}`)] : []),
  ] }));
}

async function quarantineUnverified(contactId, store, identity) {
  const map = await store.binding(contactId), row = await store.account(map);
  const state = row?.domainApprovals?.[FINANCE_DOMAIN_ID];
  if (!map?.financeRosterImport || state?.decisionId !== map.financeRosterImport.domainDecisionId || state.status !== 'approved') return;
  const now = Date.now(), domains = structuredClone(row.domainApprovals);
  domains[FINANCE_DOMAIN_ID] = { ...state, status: 'under_review', version: state.version + 1,
    decisionId: digest(`${state.decisionId}:import-verification-failed`), decisionAt: now, holdAt: now,
    reason: 'finance-import-verification-failed', onboarding: null };
  const approvedDomains = row.approvedDomains.filter(id => id !== FINANCE_DOMAIN_ID);
  const active = ordinaryAccess(row, now) && approvedDomains.length > 0;
  const accessVersion = row.accessVersion + Number(active !== row.active);
  await db.send(new TransactWriteCommand({ TransactItems: [
    { Update: { TableName: table, Key: { pk: map.pk },
      UpdateExpression: 'SET domainApprovals = :domains, revision = :next, providerAccessVersion = :unset',
      ConditionExpression: 'revision = :prior', ExpressionAttributeValues: { ':domains': domains, ':next': map.revision + 1, ':prior': map.revision, ':unset': null } } },
    { Update: { TableName: table, Key: { pk: row.pk },
      UpdateExpression: 'SET domainApprovals = :domains, approvedDomains = :groups, active = :active, suspended = :suspended, '
        + 'reviewStatus = :review, suspensionSource = :source, accessVersion = :next, updatedAt = :now',
      ConditionExpression: 'accessVersion = :prior AND participantId = :pid', ExpressionAttributeValues: {
        ':domains': domains, ':groups': approvedDomains, ':active': active, ':suspended': !active,
        ':review': active ? 'approved' : 'under_review', ':source': active ? '' : 'hubspot-review',
        ':next': accessVersion, ':prior': row.accessVersion, ':pid': row.participantId, ':now': now } } },
  ] }));
  if (!active) await identity.setAccess(row, false);
}

async function verifyPerson(person, hubspot, store) {
  const contact = await hubspot.getContact(person.contactId);
  const map = await store.binding(person.contactId), row = await store.account(map);
  const decisions = financeImportDecisions(contact, map, { now: Date.now() });
  if (!decisions.globalDecision || !decisions.domainDecision || !ordinaryAccess(row, Date.now())
    || row.domainApprovals?.[FINANCE_DOMAIN_ID]?.decisionId !== decisions.domainDecision.id
    || row.domainApprovals[FINANCE_DOMAIN_ID].status !== 'approved'
    || row.domainApprovals[FINANCE_DOMAIN_ID].onboarding !== null
    || map.domainApprovals[FINANCE_DOMAIN_ID].onboarding !== null
    || contact.properties.opda_active !== 'true' || contact.properties.opda_enrolment_status !== row.enrolmentStatus) {
    throw new Error('Imported approval requires reconciliation');
  }
  const audit = await get(`${IMPORT_PREFIX}${digest(person.email)}`);
  if (audit?.notifications !== 'suppressed' || audit.enrolmentStatus !== row.enrolmentStatus
    || audit.contactId !== person.contactId || audit.participantId !== row.participantId) throw new Error('Import receipt mismatch');
  return row;
}

try {
  const startedAt = Date.now(), actor = aws(['sts', 'get-caller-identity']);
  assert.equal(actor.Account, '355653384628');
  const configuration = aws(['lambda', 'get-function-configuration', '--function-name', functionName]);
  const env = configuration.Environment.Variables;
  assert.equal(env.PARTICIPANTS_TABLE_NAME, table);
  const store = createStore({ participantsTableName: table, registrationsTableName: env.REGISTRATIONS_TABLE_NAME,
    domainReviewCutover: Date.parse(env.DOMAIN_REVIEW_CUTOVER) }, { send: (command, input) => rawDb.send(new dynamo[command](input)) });
  const identity = createIdentity({ poolId: env.USER_POOL_ID, send: (command, input) => idp.send(new cognito[command](input)) });
  const roster = readFinanceRoster(), { api, hubspot } = await bridge();
  const [contacts, references, rows] = await Promise.all([crmInventory(api, roster), microsoftInventory(roster), allRows()]);
  preflight(roster, contacts, rows);
  // Resume only this exact import; do not overwrite subsequent reviews.
  await parallel(roster.filter(person => rows.get(`CRM#CONTACT#${contacts.get(person.email)?.id}`)?.financeRosterImport), async person => {
    const contact = await hubspot.getContact(contacts.get(person.email).id), binding = rows.get(`CRM#CONTACT#${contact?.id}`);
    const decisions = financeImportDecisions(contact, binding, { now: Date.now() });
    if (!decisions.globalDecision || !decisions.domainDecision) throw new Error('Historical import changed; individual review required');
  });
  console.log(JSON.stringify({ action, cohort: roster.length, existingContacts: contacts.size,
    newContacts: roster.length - contacts.size, microsoft: counts([...references.values()].map(r => r.state)),
    sourceDigest: FINANCE_ROSTER_SHA256, emailsRequested: 0 }));
  if (action === 'plan') process.exit(0);
  if (action === 'apply') assertQuiescent();
  let completed = 0;
  await parallel(roster, async person => {
    let contact = contacts.get(person.email);
    try {
    if (action === 'apply') {
      const observedAt = Date.now();
      if (contact) contact = await hubspot.getContact(contact.id);
      let map = contact ? await store.binding(contact.id) : null;
      if (!map?.financeRosterImport) {
        const properties = financeProperties(person, contact);
        if (!contact) contact = await api('/crm/v3/objects/contacts', { method: 'POST', body: { properties } });
        else if (Object.keys(properties).length) await api(`/crm/v3/objects/contacts/${contact.id}`, { method: 'PATCH', body: { properties } });
        contact = await hubspot.getContact(contact.id);
        for (const property of Object.keys(properties).filter(key => key.startsWith('opda_review') || key === 'opda_requested_working_groups')) {
          if ((contact.propertiesWithHistory?.[property] ?? []).some(item => item.sourceType === 'CRM_UI' && Date.parse(item.timestamp) >= observedAt)) {
            throw new Error('Concurrent staff review requires individual reconciliation');
          }
        }
        map ??= await bindLegacy(person, contact, store) ?? await store.reserve(contactProfile(contact), Date.now());
        if (!map.cognitoSub) {
          await store.checkPending(map, Date.now());
          const sub = await identity.ensure(map); // Native identity creation suppresses Cognito delivery.
          map = await store.attach(map, sub, Date.now());
        }
        let row = await store.account(map);
        await store.checkPending(map, Date.now());
        contact = await hubspot.getContact(contact.id);
        const plan = planFinanceSeed({ contact, map, row, actorArn: actor.Arn, microsoft: references.get(person.email),
          now: Date.now(), cutover: Date.parse(env.DOMAIN_REVIEW_CUTOVER) });
        await seed(plan, map, row);
        map = plan.binding;
      }
      const fresh = await hubspot.getContact(contact.id), row = await store.account(map);
      const decisions = financeImportDecisions(fresh, map, { now: Date.now() });
      if (!decisions.globalDecision || !decisions.domainDecision || !ordinaryAccess(row, Date.now())) throw new Error('Import evidence changed');
      await identity.setAccess(row, true);
      await hubspot.projectStatus(contact.id, { active: true, enrolmentStatus: row.enrolmentStatus });
      await store.markEffects(map, row);
    }
    if (!contact) throw new Error('Expected contact missing');
    await verifyPerson({ ...person, contactId: contact.id }, hubspot, store);
    completed++;
    if (completed % 40 === 0) console.log(JSON.stringify({ action, verified: completed, expected: roster.length }));
    } catch (error) {
      if (action === 'apply' && contact?.id) await quarantineUnverified(contact.id, store, identity);
      throw error;
    }
  });
  const final = await allRows();
  const ids = new Set(roster.map(person => final.get(`${IMPORT_PREFIX}${digest(person.email)}`)?.contactId));
  const newJobs = [...final.values()].filter(row => row.pk.startsWith('CRM#ONBOARDING#') && !rows.has(row.pk) && ids.has(row.contactId));
  if (newJobs.length || completed !== roster.length) throw new Error('Unexpected import side effects');
  console.log(JSON.stringify({ action, verified: completed, importId: FINANCE_IMPORT_ID,
    newOnboardingJobs: 0, emailsRequested: 0, microsoftWrites: 0, elapsedSeconds: Math.round((Date.now() - startedAt) / 1000) }));
} catch (error) {
  console.error(JSON.stringify({ result: 'stopped', code: error.name, reason: error.name === 'Error' ? error.message : 'Import precondition failed',
    personalRowsLogged: false, instruction: 'Do not resume approval consumers until partial import receipts and statuses are reconciled.' }));
  process.exitCode = 1;
}
