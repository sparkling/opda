import { randomUUID } from 'node:crypto';
import { APPROVAL } from '../hubspot-participation/import.mjs';
import { CONTACT_ID, PORTAL_ID, mappingKey, emailHash, digest, mayApprove } from './domain.mjs';
import { onboardingKey, planOnboarding } from './onboarding.mjs';

function encodeValue(v) {
  if (v === null) return { NULL: true };
  if (typeof v === 'string') return { S: v };
  if (typeof v === 'boolean') return { BOOL: v };
  if (Number.isSafeInteger(v)) return { N: String(v) };
  if (Array.isArray(v)) return { L: v.map(encodeValue) };
  if (v && typeof v === 'object') return { M: encode(v) };
  throw new Error('Invalid approval attribute');
}
const encode = item => Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined).map(([k, v]) => [k, encodeValue(v)]));
function decodeValue(v) {
  return v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L ? v.L.map(decodeValue) : decode(v.M)));
}
const decode = item => item ? Object.fromEntries(Object.entries(item).map(([k, v]) => [k, decodeValue(v)])) : null;

export function createStore(config, overrides = {}) {
  const table = config.participantsTableName;
  if (config.onboardingCutover !== undefined && (!Number.isSafeInteger(config.onboardingCutover) || config.onboardingCutover < 0)) {
    throw new TypeError('Invalid onboarding activation cutoff');
  }
  let service;
  async function send(command, input) {
    if (overrides.send) return overrides.send(command, input);
    service ??= import('@aws-sdk/client-dynamodb').then(aws => ({ aws, client: new aws.DynamoDBClient({ maxAttempts: 2 }) }));
    const { aws, client } = await service;
    return client.send(new aws[command](input));
  }
  const get = async pk => decode((await send('GetItemCommand', { TableName: table, Key: { pk: { S: pk } }, ConsistentRead: true })).Item);
  const absent = pk => ({ ConditionCheck: { TableName: table, Key: { pk: { S: pk } }, ConditionExpression: 'attribute_not_exists(pk)' } });
  function put(item, previous) {
    return { Put: { TableName: table, Item: encode(item),
      ConditionExpression: previous ? '#r = :r' : 'attribute_not_exists(pk)',
      ...(previous ? { ExpressionAttributeNames: { '#r': 'revision' }, ExpressionAttributeValues: { ':r': { N: String(previous.revision) } } } : {}),
    } };
  }
  function bindingGuard(map) {
    return { ConditionCheck: { TableName: table, Key: { pk: { S: `EMAIL#${emailHash(map.email)}` } },
      ConditionExpression: 'participantId = :pid', ExpressionAttributeValues: { ':pid': { S: map.participantId } },
    } };
  }
  function suppressions(map) {
    return [absent(`SYNC#SUPPRESS#EMAIL#${emailHash(map.email)}`),
      ...(map.registrationId ? [absent(`SYNC#SUPPRESS#REGISTRATION#${map.registrationId}`)] : [])];
  }
  function sourceGuard(map, now) {
    return map.registrationId ? [{ ConditionCheck: { TableName: config.registrationsTableName,
      Key: { registrationId: { S: map.registrationId } },
      ConditionExpression: 'attribute_exists(registrationId) AND expiresAt > :now AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt)',
      ExpressionAttributeValues: { ':now': encodeValue(Math.floor(now / 1000)) },
    } }] : [];
  }
  async function checkPending(map, now) {
    await send('TransactWriteItemsCommand', { TransactItems: [bindingGuard(map), ...suppressions(map), ...sourceGuard(map, now)] });
  }
  async function account(map) {
    if (!map?.cognitoSub) return null;
    const row = await get(`USER#${map.cognitoSub}`);
    if (!row || row.participantId !== map.participantId || row.email !== map.email
      || row.cognitoSub !== map.cognitoSub || row.hubspotPortalId !== PORTAL_ID
      || row.hubspotContactId !== map.contactId) throw new Error('Participant binding requires review');
    return row;
  }
  async function binding(contactId) {
    if (!CONTACT_ID.test(contactId)) throw new Error('Invalid contact reference');
    const pk = mappingKey(contactId);
    const existing = await get(pk);
    if (existing) return existing;
    // Adopt only an explicitly imported immutable contact binding, never by email.
    const imported = await get(`IMPORT#${APPROVAL.id}#${contactId}`);
    if (!imported || imported.phase !== 'complete') return null;
    const map = { pk, contactId, participantId: imported.participantId, email: imported.email,
      cognitoSub: imported.cognitoSub, revision: 1, imported: true };
    await account(map);
    await send('TransactWriteItemsCommand', { TransactItems: [put(map), bindingGuard(map)] });
    return map;
  }
  async function reserve(profile, now) {
    const hash = emailHash(profile.email);
    if (await get(`EMAIL#${hash}`)) throw new Error('Email already belongs to another account binding');
    const sync = await get(`SYNC#EMAIL#${hash}`);
    let source;
    if (sync) {
      if (sync.state !== 'synced' || sync.contactId !== profile.contactId) throw new Error('Application requires review');
      source = decode((await send('GetItemCommand', { TableName: config.registrationsTableName,
        Key: { registrationId: { S: sync.registrationId } }, ConsistentRead: true })).Item);
      if (!source || source.deletedAt || source.erasedAt || source.expiresAt <= Math.floor(now / 1000)) throw new Error('Application unavailable');
    }
    const map = { ...profile, pk: mappingKey(profile.contactId), participantId: sync?.participantId ?? randomUUID(),
      ...(source ? { registrationId: source.registrationId, privacyNoticeVersion: source.privacyNoticeVersion } : {}),
      revision: 1, createdAt: now };
    const guards = suppressions(map);
    if (source) guards.push({ ConditionCheck: { TableName: config.registrationsTableName,
      Key: { registrationId: { S: source.registrationId } },
      ConditionExpression: 'attribute_exists(registrationId) AND expiresAt > :now AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt)',
      ExpressionAttributeValues: { ':now': { N: String(Math.floor(now / 1000)) } },
    } });
    await send('TransactWriteItemsCommand', { TransactItems: [put(map), put({ pk: `EMAIL#${hash}`,
      participantId: map.participantId, approvalKey: map.pk }), ...guards] });
    return map;
  }
  async function attach(map, cognitoSub, now) {
    const next = { ...map, cognitoSub, revision: map.revision + 1 };
    const row = { pk: `USER#${cognitoSub}`, cognitoSub, participantId: map.participantId,
      email: map.email, name: map.name, hubspotContactId: map.contactId, hubspotPortalId: PORTAL_ID,
      profile: map.profile, sourceApplicationId: map.registrationId, privacyNoticeVersion: map.privacyNoticeVersion,
      active: false, suspended: false, reviewStatus: 'received', enrolmentStatus: 'not_invited', accessVersion: 1, createdAt: now };
    await send('TransactWriteItemsCommand', { TransactItems: [put(next, map), put(row), bindingGuard(map), ...suppressions(map), ...sourceGuard(map, now)] });
    return next;
  }
  async function change(map, row, decision, now, holdReason) {
    if (!holdReason && (decision.id === map.decisionId || decision.at <= (map.decisionAt ?? 0)
      || decision.at <= (map.holdAt ?? 0))) return { binding: map, account: row };
    if (holdReason && map.holdReason === holdReason && row.active === false && row.suspended
      && (!map.onboarding || map.onboarding.accessVersion === row.accessVersion)) return { binding: map, account: row };
    const grant = !holdReason && mayApprove(row, decision, now);
    const externalHold = row.suspended && row.suspensionSource !== 'hubspot-review';
    const fields = { reviewStatus: holdReason ? 'under_review' : decision.status, active: Boolean(grant),
      suspended: !grant, suspensionSource: externalHold ? (row.suspensionSource ?? 'external') : grant ? '' : 'hubspot-review',
      accessVersion: row.accessVersion + 1, updatedAt: now,
      ...(grant ? { approvedAt: decision.at, approvalId: decision.id } : {}) };
    const auditId = holdReason ? digest(`${map.contactId}:${holdReason}:${row.accessVersion}`) : decision.id;
    const onboarding = planOnboarding({ map, row, decision, grant, holdReason, auditId,
      accessVersion: fields.accessVersion, now, cutover: config.onboardingCutover });
    if (onboarding) fields.onboarding = onboarding.snapshot;
    const next = { ...map, revision: map.revision + 1,
      ...(holdReason ? { holdReason, holdAt: now } : { decisionId: decision.id, decisionAt: decision.at,
        decisionStatus: decision.status, holdReason: grant ? null : map.holdReason ?? null }),
      ...(onboarding ? { onboarding: onboarding.snapshot } : {}),
    };
    const names = Object.fromEntries(Object.keys(fields).map((key, i) => [`#f${i}`, key]));
    const values = Object.fromEntries(Object.values(fields).map((v, i) => [`:f${i}`, encodeValue(v)]));
    const conditions = ['accessVersion = :version', 'participantId = :pid', 'cognitoSub = :sub', 'email = :email',
      'suspended = :suspended', 'enrolmentStatus = :enrolment', 'active = :active'];
    Object.assign(values, { ':version': encodeValue(row.accessVersion), ':pid': encodeValue(row.participantId),
      ':sub': encodeValue(row.cognitoSub), ':email': encodeValue(row.email), ':suspended': encodeValue(row.suspended),
      ':enrolment': encodeValue(row.enrolmentStatus), ':active': encodeValue(row.active) });
    if (grant) {
      conditions.push('attribute_not_exists(erasedAt)', 'attribute_not_exists(deletedAt)', '(attribute_not_exists(expiresAt) OR expiresAt > :now)');
      values[':now'] = encodeValue(Math.floor(now / 1000));
    }
    await send('TransactWriteItemsCommand', { TransactItems: [put(next, map), { Update: {
      TableName: table, Key: { pk: { S: row.pk } },
      UpdateExpression: `SET ${Object.keys(fields).map((_, i) => `#f${i} = :f${i}`).join(', ')}`,
      ConditionExpression: conditions.join(' AND '), ExpressionAttributeNames: names, ExpressionAttributeValues: values,
    } }, put({ pk: `CRM#AUDIT#${map.contactId}#${auditId}`, contactId: map.contactId,
      participantId: map.participantId, decisionId: auditId, actor: decision?.actor ?? null, at: now,
      reviewStatus: fields.reviewStatus, active: fields.active, accessVersion: fields.accessVersion,
      reason: holdReason ?? decision.reason, ...(onboarding ? { onboarding: onboarding.snapshot } : {}) }),
      ...(onboarding ? [put(onboarding.operation)] : []), ...(grant ? [bindingGuard(map), ...suppressions(map),
      ...(!row.approvedAt ? sourceGuard(map, now) : [])] : [])] });
    return { binding: next, account: { ...row, ...fields } };
  }
  async function pendingOnboarding() {
    const operations = [], cursors = new Set();
    let cursor, pages = 0;
    do {
      const page = await send('ScanCommand', { TableName: table, ConsistentRead: true,
        FilterExpression: 'begins_with(pk, :outbox) AND #status = :pending',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':outbox': { S: 'CRM#ONBOARDING#' }, ':pending': { S: 'pending' } },
        ...(cursor ? { ExclusiveStartKey: cursor } : {}),
      });
      if (!Array.isArray(page.Items ?? [])) throw new Error('Invalid onboarding outbox inventory');
      for (const item of page.Items ?? []) {
        const operation = decode(item);
        if (operation.pk !== onboardingKey(operation.operationId) || operation.schemaVersion !== 1
          || operation.status !== 'pending') throw new Error('Invalid onboarding outbox reference');
        operations.push(operation);
      }
      if (++pages > 100 || operations.length > 5000) throw new Error('Onboarding outbox inventory bound exceeded');
      cursor = page.LastEvaluatedKey;
      if (cursor) {
        const key = JSON.stringify(cursor);
        if (cursors.has(key)) throw new Error('Incomplete onboarding outbox inventory');
        cursors.add(key);
      }
    } while (cursor);
    return operations;
  }
  async function inventory() {
    const accounts = [], bindings = [];
    let cursor; let pages = 0;
    do {
      const page = await send('ScanCommand', { TableName: table, ConsistentRead: true,
        FilterExpression: 'begins_with(pk, :user) OR begins_with(pk, :crm)',
        ExpressionAttributeValues: { ':user': { S: 'USER#' }, ':crm': { S: 'CRM#CONTACT#' } },
        ...(cursor ? { ExclusiveStartKey: cursor } : {}),
      });
      for (const item of page.Items ?? []) {
        const row = decode(item);
        if (row.pk.startsWith('USER#') && row.hubspotPortalId === PORTAL_ID && CONTACT_ID.test(row.hubspotContactId)) accounts.push(row);
        if (row.pk.startsWith('CRM#CONTACT#')) bindings.push(row);
      }
      if (++pages > 100 || accounts.length > 5000 || bindings.length > 5000) throw new Error('Approval inventory bound exceeded');
      cursor = page.LastEvaluatedKey;
    } while (cursor);
    return { accounts, bindings };
  }
  return { binding, reserve, attach, account, inventory, checkPending, pendingOnboarding,
    onboardingOperation: id => get(onboardingKey(id)),
    apply: (map, row, decision, now) => change(map, row, decision, now),
    hold: (map, row, reason, now) => change(map, row, null, now, reason),
    async markEffects(map, row) {
      await send('TransactWriteItemsCommand', { TransactItems: [{ Update: {
        TableName: table, Key: { pk: { S: map.pk } }, UpdateExpression: 'SET providerAccessVersion = :version',
        ConditionExpression: 'revision = :revision', ExpressionAttributeValues: {
          ':version': encodeValue(row.accessVersion), ':revision': encodeValue(map.revision),
        },
      } }, { ConditionCheck: { TableName: table, Key: { pk: { S: row.pk } },
        ConditionExpression: 'accessVersion = :version', ExpressionAttributeValues: { ':version': encodeValue(row.accessVersion) },
      } }] });
    },
  };
}
