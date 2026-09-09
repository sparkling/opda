import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { APPROVAL } from '../hubspot-participation/import.mjs';
import { CONTACT_ID, PORTAL_ID, mappingKey, emailHash, digest, mayApprove, ordinaryAccess } from './domain.mjs';
import { onboardingKey, planOnboarding } from './onboarding.mjs';
import { DOMAIN_POLICY, planDomainApprovals } from './domain-onboarding.mjs';

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
  if (config.domainReviewCutover !== undefined && (!Number.isSafeInteger(config.domainReviewCutover) || config.domainReviewCutover < 0)) {
    throw new TypeError('Invalid domain review activation cutoff');
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
  async function change(map, row, decision, now, holdReason, mapFields = {}) {
    if (!holdReason && (decision.id === map.decisionId || decision.at <= (map.decisionAt ?? 0)
      || decision.at <= (map.holdAt ?? 0))) return { binding: map, account: row };
    if (holdReason && map.holdReason === holdReason && row.active === false && row.suspended
      && (!map.onboarding || map.onboarding.accessVersion === row.accessVersion)
      && Object.entries(mapFields).every(([key, value]) => isDeepStrictEqual(map[key], value))) return { binding: map, account: row };
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
    const next = { ...map, ...mapFields, revision: map.revision + 1,
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
  const relayKey = 'CRM#ONBOARDING_RELAY#cursor';
  async function pendingOnboarding({ resumable = false } = {}) {
    const operations = [], cursors = new Set();
    const progress = resumable ? await get(relayKey) : null;
    if (progress && (!Number.isSafeInteger(progress.revision) || progress.revision < 1
      || progress.cursor !== null && (typeof progress.cursor?.pk?.S !== 'string'
        || Object.keys(progress.cursor).length !== 1))) throw new Error('Invalid onboarding relay progress');
    let cursor = progress?.cursor ?? undefined, pages = 0, invalid = 0;
    do {
      const page = await send('ScanCommand', { TableName: table, ConsistentRead: true,
        Limit: Math.min(50, 100 - operations.length),
        FilterExpression: 'begins_with(pk, :outbox) AND #status = :pending',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':outbox': { S: 'CRM#ONBOARDING#' }, ':pending': { S: 'pending' } },
        ...(cursor ? { ExclusiveStartKey: cursor } : {}),
      });
      if (!Array.isArray(page.Items ?? [])) throw new Error('Invalid onboarding outbox inventory');
      for (const item of page.Items ?? []) {
        try {
          const operation = decode(item);
          if (operation.pk !== onboardingKey(operation.operationId) || ![1, 2].includes(operation.schemaVersion)
            || operation.status !== 'pending') throw new Error('Invalid onboarding outbox reference');
          operations.push(operation);
        } catch {
          if (!resumable) throw new Error('Invalid onboarding outbox reference');
          invalid++; // Surface the fault after relaying valid peers and checkpointing progress.
        }
      }
      if ((page.Items ?? []).length > 50) throw new Error('Onboarding outbox page bound exceeded');
      pages++;
      cursor = page.LastEvaluatedKey;
      if (cursor) {
        const key = JSON.stringify(cursor);
        if (cursors.has(key)) throw new Error('Incomplete onboarding outbox inventory');
        cursors.add(key);
      }
    } while (cursor && pages < 20 && operations.length < 100);
    return resumable ? { operations, invalid, revision: progress?.revision ?? 0, cursor: cursor ?? null } : operations;
  }
  async function advanceOnboardingRelay(page) {
    if (!Number.isSafeInteger(page.revision) || page.revision < 0
      || page.cursor !== null && (typeof page.cursor?.pk?.S !== 'string' || Object.keys(page.cursor).length !== 1)) {
      throw new Error('Invalid onboarding relay checkpoint');
    }
    // Advance after attempting the whole batch, including failed notifications.
    // The outbox remains pending: a poison entry is retried next cycle without
    // starving later entries. Concurrent relays cannot move a newer cursor back.
    await send('TransactWriteItemsCommand', { TransactItems: [put({ pk: relayKey,
      revision: page.revision + 1, cursor: page.cursor }, page.revision ? { revision: page.revision } : undefined)] });
  }
  async function applyDomains(map, row, decisions, now, { globalDecision, holdReason } = {}) {
    if (!Number.isSafeInteger(config.domainReviewCutover)) throw new Error('Domain approval policy is not activated');
    const legacy = row.approvalPolicy !== DOMAIN_POLICY;
    const negative = globalDecision && (!globalDecision.trusted || ['under_review', 'rejected', 'withdrawn'].includes(globalDecision.status));
    const globalHold = holdReason || (negative || map.domainGlobalState === 'held'
      && !(globalDecision?.trusted && globalDecision.status === 'approved' && globalDecision.at > (map.domainHoldAt ?? 0))
      ? 'account-review-withdrawn' : null);
    const historicalId = legacy ? row.onboarding?.operationId ?? map.onboarding?.operationId : null;
    const marker = map.domainMigrationPending ?? row.domainMigrationPending;
    async function legacyHold(reason) {
      const freshGlobalAt = negative && globalDecision.id !== map.domainGlobalDecisionId
        ? Number.isSafeInteger(globalDecision.at) && globalDecision.at <= now ? globalDecision.at : now : 0;
      const domainHoldAt = Math.max(map.domainHoldAt ?? 0, map.holdReason === reason
        ? map.domainHoldAt ?? map.holdAt ?? now : now, freshGlobalAt);
      return change(map, row, null, now, reason, { domainHoldAt,
        ...(marker || historicalId ? { domainMigrationPending: marker ?? { operationId: historicalId } } : {}),
        ...(negative ? { domainGlobalState: 'held', domainGlobalDecisionId: globalDecision.id } : {}) });
    }
    // Access and receipt-owned cleanup cannot wait for an ambiguous old email.
    // Keep v1 until its account-wide revoke has completed, preserving its guard.
    if (legacy && (row.onboarding || map.onboarding) && globalHold) return legacyHold(globalHold);
    const historical = [...new Set([historicalId, marker?.operationId].filter(Boolean))];
    const migrationGuards = [];
    let unresolved = false;
    for (const id of historical) {
      const old = await get(onboardingKey(id));
      const settled = old?.status === 'complete' && old.schemaVersion === 1
        && old.participantId === row.participantId && old.contactId === map.contactId
        && old.cognitoSub === row.cognitoSub && old.accountKey === row.pk && old.bindingKey === map.pk;
      if (!settled) unresolved = true;
      else migrationGuards.push({ ConditionCheck: { TableName: table, Key: { pk: { S: onboardingKey(id) } },
        ConditionExpression: '#status = :complete AND participantId = :pid AND contactId = :contact AND cognitoSub = :sub',
        ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: {
          ':complete': encodeValue('complete'), ':pid': encodeValue(row.participantId),
          ':contact': encodeValue(map.contactId), ':sub': encodeValue(row.cognitoSub) } } });
    }
    if (unresolved) {
      // Cancellation is not evidence about an unknown/attempted mail send. Only
      // an explicitly completed original outcome releases this migration hold.
      decisions = decisions.filter(d => !d.trusted || d.status !== 'approved');
      if (legacy && !globalHold && decisions.length) {
        let frozen;
        try { frozen = planDomainApprovals({ map, row, now, cutover: config.domainReviewCutover }); } catch { /* Deny below. */ }
        if (!frozen?.fields.approvedDomains.length) return legacyHold('historical-domain-scope-unavailable');
      }
      if (!decisions.length && !globalHold) return { binding: map, account: row };
    }
    const plan = planDomainApprovals({ map, row, decisions, globalDecision, holdReason,
      now, cutover: config.domainReviewCutover });
    if (unresolved) {
      plan.mapFields.domainMigrationPending = marker ?? { operationId: historicalId };
      plan.fields.domainMigrationPending = plan.mapFields.domainMigrationPending;
    } else if (marker) {
      plan.mapFields.domainMigrationPending = null; plan.fields.domainMigrationPending = null; plan.changed = true;
    }
    if (!plan.changed) return { binding: map, account: row };
    const next = { ...map, ...plan.mapFields, revision: map.revision + 1 };
    const names = Object.fromEntries(Object.keys(plan.fields).map((key, i) => [`#f${i}`, key]));
    const values = Object.fromEntries(Object.values(plan.fields).map((v, i) => [`:f${i}`, encodeValue(v)]));
    const conditions = ['accessVersion = :version', 'participantId = :pid', 'cognitoSub = :sub', 'email = :email',
      'suspended = :suspended', 'enrolmentStatus = :enrolment', 'active = :active'];
    Object.assign(values, { ':version': encodeValue(row.accessVersion), ':pid': encodeValue(row.participantId),
      ':sub': encodeValue(row.cognitoSub), ':email': encodeValue(row.email), ':suspended': encodeValue(row.suspended),
      ':enrolment': encodeValue(row.enrolmentStatus), ':active': encodeValue(row.active) });
    const granting = plan.fields.active && (!ordinaryAccess(row, now) || plan.operations.some(op => op.action === 'provision'));
    if (granting) {
      conditions.push('attribute_not_exists(erasedAt)', 'attribute_not_exists(deletedAt)', '(attribute_not_exists(expiresAt) OR expiresAt > :now)');
      values[':now'] = encodeValue(Math.floor(now / 1000));
    }
    await send('TransactWriteItemsCommand', { TransactItems: [put(next, map), { Update: {
      TableName: table, Key: { pk: { S: row.pk } },
      UpdateExpression: `SET ${Object.keys(plan.fields).map((_, i) => `#f${i} = :f${i}`).join(', ')}`,
      ConditionExpression: conditions.join(' AND '), ExpressionAttributeNames: names, ExpressionAttributeValues: values,
    } }, ...plan.audits.map(item => put(item)), ...plan.operations.map(item => put(item)),
    ...(!unresolved ? migrationGuards : []),
    ...(granting ? [bindingGuard(map), ...suppressions(map),
      ...(!row.approvedAt ? sourceGuard(map, now) : [])] : [])] });
    return { binding: next, account: { ...row, ...plan.fields } };
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
  return { binding, reserve, attach, account, inventory, checkPending, pendingOnboarding, advanceOnboardingRelay, applyDomains,
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
