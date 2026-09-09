import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { APPROVAL_GROUP_IDS } from './invitation.mjs';

const HEX = /^[a-f0-9]{64}$/;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
const LABEL = /^[a-z][a-z0-9_-]{0,79}$/;
const STATUSES = ['pending', 'complete', 'cancelled', 'attention'];
const LEASE_MS = 900000;
const hash = value => createHash('sha256').update(value).digest('hex');
const invalid = () => new TypeError('Invalid onboarding record');
const requireValue = condition => { if (!condition) throw invalid(); };
const emptyReceipts = () => ({ graph: {}, sharepoint: {}, mail: {} });
const plain = value => value && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));

function jsonCopy(value, limit = 192000) {
  let nodes = 0;
  function visit(item, depth) {
    requireValue(++nodes <= 10000 && depth <= 16);
    if (item === null || typeof item === 'boolean' || typeof item === 'string') return;
    if (typeof item === 'number') { requireValue(Number.isSafeInteger(item)); return; }
    requireValue(Array.isArray(item) || plain(item));
    requireValue(Object.values(Object.getOwnPropertyDescriptors(item)).every(p => !p.get && !p.set));
    for (const child of Object.values(item)) visit(child, depth + 1);
  }
  visit(value, 0);
  const serialized = JSON.stringify(value);
  requireValue(Buffer.byteLength(serialized) <= limit);
  return JSON.parse(serialized);
}
function receiptsCopy(value) {
  requireValue(plain(value) && Object.keys(value).length === 3
    && ['graph', 'sharepoint', 'mail'].every(key => Object.hasOwn(value, key)));
  return jsonCopy(value);
}
function encodeValue(v) {
  if (v === null) return { NULL: true };
  if (typeof v === 'string') return { S: v };
  if (typeof v === 'boolean') return { BOOL: v };
  if (Number.isSafeInteger(v)) return { N: String(v) };
  if (Array.isArray(v)) return { L: v.map(encodeValue) };
  if (plain(v)) return { M: encode(v) };
  throw invalid();
}
const encode = item => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, encodeValue(value)]));
function decodeValue(v) {
  requireValue(plain(v) && Object.keys(v).length === 1);
  if (typeof v.S === 'string') return v.S;
  if (typeof v.N === 'string') { const n = Number(v.N); requireValue(Number.isSafeInteger(n)); return n; }
  if (typeof v.BOOL === 'boolean') return v.BOOL;
  if (v.NULL === true) return null;
  if (Array.isArray(v.L)) return v.L.map(decodeValue);
  if (plain(v.M)) return decode(v.M);
  throw invalid();
}
const decode = item => item ? Object.fromEntries(Object.entries(item).map(([key, value]) => [key, decodeValue(value)])) : null;
const operationKey = id => { requireValue(typeof id === 'string' && HEX.test(id)); return `CRM#ONBOARDING#${id}`; };
const stateKey = op => `CRM#ONBOARDING_STATE#${op.participantId}`;
const immutableKeys = ['pk', 'schemaVersion', 'operationId', 'participantId', 'contactId', 'cognitoSub',
  'accountKey', 'bindingKey', 'auditKey', 'decisionId', 'accessVersion', 'action', 'createdAt'];
const keysOf = op => op.schemaVersion === 2 ? [...immutableKeys, 'domainId', 'domainVersion']
  : op.schemaVersion === 3 ? [...immutableKeys, 'noticeKind'] : immutableKeys;
const sameOperation = (a, b) => a && b && keysOf(b).every(key => a[key] === b[key]);
const rowSnapshot = (op, row) => op.schemaVersion === 2 ? row?.domainApprovals?.[op.domainId]?.onboarding
  : op.schemaVersion === 3 ? row?.accessNotice : row?.onboarding;

function validOperation(op) {
  requireValue(plain(op) && op.pk === operationKey(op.operationId) && [1, 2, 3].includes(op.schemaVersion)
    && typeof op.participantId === 'string' && ID.test(op.participantId)
    && typeof op.cognitoSub === 'string' && ID.test(op.cognitoSub) && /^[1-9][0-9]{0,19}$/.test(op.contactId)
    && typeof op.contactId === 'string' && HEX.test(op.decisionId)
    && Number.isSafeInteger(op.accessVersion) && op.accessVersion >= 1
    && Number.isSafeInteger(op.createdAt) && op.createdAt >= 0 && STATUSES.includes(op.status)
    && ['provision', 'revoke'].includes(op.action) && op.accountKey === `USER#${op.cognitoSub}`
    && op.bindingKey === `CRM#CONTACT#${op.contactId}` && op.auditKey === `CRM#AUDIT#${op.contactId}#${op.decisionId}`
    && (op.schemaVersion === 1 || op.schemaVersion === 2 && APPROVAL_GROUP_IDS.includes(op.domainId)
      && Number.isSafeInteger(op.domainVersion) && op.domainVersion >= 1
      || op.schemaVersion === 3 && op.action === 'revoke' && op.noticeKind === 'website-disabled')
    && op.operationId === hash(JSON.stringify(op.schemaVersion === 2
      ? [2, op.participantId, op.domainId, op.decisionId, op.domainVersion]
      : [op.schemaVersion, op.participantId, op.decisionId, op.accessVersion]))
    && Object.keys(op).every(key => [...keysOf(op), 'status', 'stage', 'reason'].includes(key)));
}
function validAudit(op, audit) {
  const snap = audit?.onboarding;
  requireValue(audit?.pk === op.auditKey && audit.participantId === op.participantId
    && audit.contactId === op.contactId && audit.decisionId === op.decisionId
    && audit.accessVersion === op.accessVersion && audit.at === op.createdAt
    && snap?.operationId === op.operationId && snap.action === op.action && snap.decisionId === op.decisionId
    && snap.accessVersion === op.accessVersion && snap.templateVersion === (op.schemaVersion === 3 ? 1 : op.schemaVersion)
    && (op.schemaVersion !== 2 || snap.domainId === op.domainId && snap.domainVersion === op.domainVersion)
    && (op.schemaVersion !== 3 || snap.noticeKind === op.noticeKind)
    && (snap.notifyWithdrawal === undefined || op.schemaVersion === 2 && op.action === 'revoke' && snap.notifyWithdrawal === true)
    && Number.isSafeInteger(snap.decisionAt) && snap.decisionAt >= 0 && snap.decisionAt <= audit.at + 60000
    && (snap.actor === null || typeof snap.actor === 'string' && /^[1-9][0-9]{0,19}$/.test(snap.actor))
    && snap.actor === audit.actor && Array.isArray(snap.groups) && snap.groups.length <= APPROVAL_GROUP_IDS.length
    && isDeepStrictEqual(snap.groups, APPROVAL_GROUP_IDS.filter(group => snap.groups.includes(group)))
    && snap.groupDigest === hash(JSON.stringify(snap.groups))
    && ['approved', 'empty', 'review_required', 'denied'].includes(snap.snapshotStatus));
  requireValue(op.action === 'provision'
    ? snap.snapshotStatus === 'approved' && snap.groups.length > 0 && snap.actor !== null
      && (op.schemaVersion === 1 || isDeepStrictEqual(snap.groups, [op.domainId]))
      && audit.reviewStatus === 'approved' && audit.active === true
      && Number.isSafeInteger(snap.groupsAt) && snap.groupsAt >= 0 && snap.groupsAt <= snap.decisionAt
    : snap.snapshotStatus !== 'approved' && snap.groups.length === 0);
}
function sameIdentity(op, account, binding, state) {
  if (state && (state.pk !== stateKey(op) || state.schemaVersion !== 1 || state.participantId !== op.participantId
    || state.contactId !== op.contactId || state.cognitoSub !== op.cognitoSub)) return false;
  if ((!account || !binding) && (op.action !== 'revoke' || !state)) return false;
  if (account && (account.pk !== op.accountKey || account.participantId !== op.participantId
    || account.cognitoSub !== op.cognitoSub || account.hubspotContactId !== op.contactId || account.hubspotPortalId !== 144765514)) return false;
  if (binding && (binding.pk !== op.bindingKey || binding.participantId !== op.participantId
    || binding.cognitoSub !== op.cognitoSub || binding.contactId !== op.contactId)) return false;
  return !(account?.email && binding?.email && account.email !== binding.email);
}
function currentSnapshot(op, account, binding, snapshot) {
  if (op.schemaVersion === 3) return account?.accessVersion === op.accessVersion
    && isDeepStrictEqual(account?.accessNotice, snapshot) && isDeepStrictEqual(binding?.accessNotice, snapshot);
  if (op.schemaVersion === 2) return (!account || isDeepStrictEqual(rowSnapshot(op, account), snapshot))
    && (!binding || isDeepStrictEqual(rowSnapshot(op, binding), snapshot));
  // Once migrated, old contact-wide jobs cannot restore memberships or send old invitations.
  if (account?.approvalPolicy === 'individual-domains-v1' || binding?.approvalPolicy === 'individual-domains-v1') return false;
  return (!account || account.accessVersion === op.accessVersion && isDeepStrictEqual(account.onboarding, snapshot))
    && (!binding || isDeepStrictEqual(binding.onboarding, snapshot));
}
const eligible = (row, time) => row?.active === true && row.reviewStatus === 'approved' && row.suspended === false
  && !row.deletedAt && !row.erasedAt && (!row.expiresAt || row.expiresAt > Math.floor(time / 1000))
  && ['not_invited', 'complete'].includes(row.enrolmentStatus);
const emailOf = (account, binding) => typeof account?.email === 'string' && account.email === binding?.email
  && account.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)
  ? account.email.trim().toLowerCase() : null;
const conflict = error => error?.name === 'ConditionalCheckFailedException'
  || error?.name === 'TransactionCanceledException' && error.CancellationReasons?.some(reason => reason.Code === 'ConditionalCheckFailed');

/** Private participant-wide receipt ledger. Queue references are never authorization. */
export function createOnboardingStore({ tableName, now = Date.now, send: injected,
  protectReceipts = async value => value, unprotectReceipts = async value => value } = {}) {
  requireValue(typeof tableName === 'string' && /^[a-zA-Z0-9_.-]{3,255}$/.test(tableName)
    && typeof now === 'function' && (!injected || typeof injected === 'function')
    && typeof protectReceipts === 'function' && typeof unprotectReceipts === 'function');
  let service;
  const contexts = new WeakMap();
  const clock = () => { const value = now(); requireValue(Number.isSafeInteger(value) && value >= 0); return value; };
  async function send(command, input) {
    try {
      if (injected) return await injected(command, input);
      service ??= import('@aws-sdk/client-dynamodb').then(aws => ({ aws, client: new aws.DynamoDBClient({ maxAttempts: 2 }) }));
      const { aws, client } = await service;
      return await client.send(new aws[command](input), { abortSignal: AbortSignal.timeout(5000) });
    } catch (error) {
      if (conflict(error)) { const rejected = new Error('Onboarding lease conflict'); rejected.name = 'OnboardingConflict'; throw rejected; }
      throw new Error('Onboarding storage unavailable');
    }
  }
  const get = async pk => decode((await send('GetItemCommand', { TableName: tableName, Key: { pk: { S: pk } }, ConsistentRead: true })).Item);
  const check = (pk, expression, values = {}, names = {}) => ({ ConditionCheck: {
    TableName: tableName, Key: { pk: { S: pk } }, ConditionExpression: expression,
    ...(Object.keys(values).length ? { ExpressionAttributeValues: encode(values) } : {}),
    ...(Object.keys(names).length ? { ExpressionAttributeNames: names } : {}),
  } });
  async function attempt(input) {
    try { await send('TransactWriteItemsCommand', { TransactItems: input }); return true; }
    catch (error) { if (error.name === 'OnboardingConflict') return false; throw error; }
  }
  const ref = context => { const record = contexts.get(context); requireValue(record); return record; };
  const owned = (context, state, time) => state?.leaseId === context.leaseId && state.revision === context.revision
    && Number.isSafeInteger(state.leaseUntil)
    && state.leaseOperationId === ref(context).operation.operationId && state.leaseUntil > time;
  function leaseCheck(context, time, revision = context.revision) {
    return check(stateKey(ref(context).operation), 'leaseId = :lease AND revision = :revision AND leaseUntil > :now AND leaseOperationId = :op',
      { ':lease': context.leaseId, ':revision': revision, ':now': time, ':op': ref(context).operation.operationId });
  }
  function operationCheck(op) {
    const names = { '#status': 'status' }, values = { ':pending': 'pending' };
    const clauses = keysOf(op).map((key, index) => {
      names[`#o${index}`] = key; values[`:o${index}`] = op[key]; return `#o${index} = :o${index}`;
    });
    return check(op.pk, ['#status = :pending', ...clauses].join(' AND '), values, names);
  }
  async function protect(receipts, participantId) {
    try { return jsonCopy(await protectReceipts(structuredClone(receipts), participantId), 300000); }
    catch { throw new Error('Onboarding receipt protection unavailable'); }
  }
  async function claim(operationId) {
    const op = await get(operationKey(operationId));
    if (!op) return null;
    validOperation(op); if (op.status !== 'pending') return null;
    const [account, binding, audit, state] = await Promise.all([op.accountKey, op.bindingKey, op.auditKey, stateKey(op)].map(get));
    validAudit(op, audit); requireValue(sameIdentity(op, account, binding, state));
    for (const row of [account, binding]) {
      if (rowSnapshot(op, row)?.operationId === op.operationId) requireValue(isDeepStrictEqual(rowSnapshot(op, row), audit.onboarding));
    }
    if (state) requireValue(Number.isSafeInteger(state.revision) && state.revision >= 1 && Number.isSafeInteger(state.leaseUntil));
    const time = clock(); if (state?.leaseUntil > time) return null;
    let receipts = emptyReceipts();
    if (state) {
      try { receipts = receiptsCopy(await unprotectReceipts(structuredClone(state.receipts), op.participantId)); }
      catch { throw new Error('Onboarding receipt protection unavailable'); }
    }
    const leaseId = randomUUID(), revision = (state?.revision ?? 0) + 1;
    const next = { pk: stateKey(op), schemaVersion: 1, participantId: op.participantId, contactId: op.contactId,
      cognitoSub: op.cognitoSub, revision, leaseId, leaseOperationId: operationId, leaseUntil: time + LEASE_MS,
      receipts: state ? state.receipts : await protect(receipts, op.participantId) };
    const accepted = await attempt([{ Put: { TableName: tableName, Item: encode(next),
      ConditionExpression: state ? 'revision = :revision AND leaseUntil <= :now' : 'attribute_not_exists(pk)',
      ...(state ? { ExpressionAttributeValues: encode({ ':revision': state.revision, ':now': time }) } : {}),
    } }, operationCheck(op)]);
    if (!accepted) return null;
    const context = { operation: structuredClone(op), account, binding, audit, receipts, leaseId, revision };
    contexts.set(context, { operation: structuredClone(op), snapshot: structuredClone(audit.onboarding) });
    return context;
  }
  async function guard(context, { requireEligible = false, requireNotice = false } = {}) {
    requireValue(typeof requireEligible === 'boolean' && typeof requireNotice === 'boolean' && !(requireEligible && requireNotice));
    const { operation: expected, snapshot } = ref(context), time = clock();
    const [op, account, binding, state] = await Promise.all([expected.pk, expected.accountKey, expected.bindingKey, stateKey(expected)].map(get));
    if (!sameOperation(op, expected) || op.status !== 'pending' || !owned(context, state, time)
      || !sameIdentity(expected, account, binding, state) || !currentSnapshot(expected, account, binding, snapshot)) return false;
    if (requireEligible && (op.action !== 'provision' || !eligible(account, time)
      || op.schemaVersion === 2 && (account.approvalPolicy !== 'individual-domains-v1'
        || account.domainApprovals?.[op.domainId]?.status !== 'approved'))) return false;
    if (requireNotice && (!account || !binding || op.action !== 'revoke' || account.deletedAt || account.erasedAt
      || account.expiresAt && account.expiresAt <= Math.floor(time / 1000)
      || ['contact-unavailable', 'identity-changed'].includes(binding.holdReason)
      || (op.schemaVersion === 3 ? account.active !== false || account.approvedDomains?.length !== 0
        || Object.values(account.domainApprovals ?? {}).some(state => state.status === 'approved')
        : op.schemaVersion !== 2 || snapshot.notifyWithdrawal !== true
          || account.domainApprovals?.[op.domainId]?.status === 'approved'))) return false;
    const email = emailOf(account, binding);
    if (email) {
      const owner = await get(`EMAIL#${hash(email)}`);
      if (owner && (owner.participantId !== op.participantId || owner.approvalKey && owner.approvalKey !== op.bindingKey)) return false;
      if (!owner && (requireEligible || requireNotice || op.action !== 'revoke')) return false;
    } else if (requireEligible || requireNotice || op.action !== 'revoke') return false;
    if (requireEligible) {
      if (await get(`SYNC#SUPPRESS#EMAIL#${hash(email)}`)) return false;
      if (binding.registrationId && (typeof binding.registrationId !== 'string' || !ID.test(binding.registrationId)
        || await get(`SYNC#SUPPRESS#REGISTRATION#${binding.registrationId}`))) return false;
    }
    if (!owned(context, state, clock())) return false;
    context.account = account; context.binding = binding;
    return true;
  }
  function eligibleChecks(context, time) {
    const { operation: op, snapshot } = ref(context), row = context.account, binding = context.binding;
    const emailKey = `EMAIL#${hash(emailOf(row, binding))}`;
    const domain = op.schemaVersion === 2;
    const approvalCheck = domain ? 'domainApprovals = :snapshot' : 'onboarding = :snapshot';
    return [check(op.accountKey, 'participantId = :pid AND cognitoSub = :sub AND accessVersion = :version AND ' + approvalCheck
      + ' AND active = :active AND reviewStatus = :approved AND suspended = :suspended AND enrolmentStatus = :enrolment'
      + ' AND email = :email AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt)'
      + ' AND (attribute_not_exists(expiresAt) OR expiresAt > :now)',
    { ':pid': op.participantId, ':sub': op.cognitoSub, ':version': domain ? row.accessVersion : op.accessVersion,
      ':snapshot': domain ? row.domainApprovals : snapshot,
      ':active': true, ':approved': 'approved', ':suspended': false, ':enrolment': row.enrolmentStatus,
      ':email': row.email, ':now': Math.floor(time / 1000) }),
    check(op.bindingKey, 'participantId = :pid AND cognitoSub = :sub AND revision = :revision AND ' + approvalCheck + ' AND email = :email',
      { ':pid': op.participantId, ':sub': op.cognitoSub, ':revision': binding.revision,
        ':snapshot': domain ? binding.domainApprovals : snapshot, ':email': row.email }),
    check(emailKey, 'participantId = :pid AND (attribute_not_exists(approvalKey) OR approvalKey = :binding)',
      { ':pid': op.participantId, ':binding': op.bindingKey }),
    check(`SYNC#SUPPRESS#EMAIL#${hash(emailOf(row, binding))}`, 'attribute_not_exists(pk)'),
    ...(binding.registrationId ? [check(`SYNC#SUPPRESS#REGISTRATION#${binding.registrationId}`, 'attribute_not_exists(pk)')] : [])];
  }
  function noticeChecks(context, time) {
    const { operation: op } = ref(context), row = context.account, binding = context.binding;
    const field = op.schemaVersion === 3 ? 'accessNotice' : 'domainApprovals';
    return [check(op.accountKey, `participantId = :pid AND cognitoSub = :sub AND accessVersion = :version AND ${field} = :snapshot`
      + ' AND active = :active AND email = :email AND attribute_not_exists(deletedAt) AND attribute_not_exists(erasedAt)'
      + ' AND (attribute_not_exists(expiresAt) OR expiresAt > :now)',
    { ':pid': op.participantId, ':sub': op.cognitoSub, ':version': row.accessVersion, ':snapshot': row[field],
      ':active': row.active, ':email': row.email, ':now': Math.floor(time / 1000) }),
    check(op.bindingKey, `participantId = :pid AND revision = :revision AND ${field} = :snapshot AND email = :email`
      + (op.schemaVersion === 3 ? ' AND providerAccessVersion = :providerVersion' : ''),
      { ':pid': op.participantId, ':revision': binding.revision, ':snapshot': binding[field], ':email': row.email,
        ...(op.schemaVersion === 3 ? { ':providerVersion': op.accessVersion } : {}) }),
    check(`EMAIL#${hash(row.email)}`, 'participantId = :pid AND (attribute_not_exists(approvalKey) OR approvalKey = :binding)',
      { ':pid': op.participantId, ':binding': op.bindingKey })];
  }
  async function saveReceipts(context, nextReceipts, { requireEligible = false, requireNotice = false } = {}) {
    requireValue(typeof requireEligible === 'boolean' && typeof requireNotice === 'boolean' && !(requireEligible && requireNotice));
    const { operation: op } = ref(context), receipts = receiptsCopy(nextReceipts), previous = context.revision;
    if (requireEligible && !await guard(context, { requireEligible: true })) return false;
    if (requireNotice && !await guard(context, { requireNotice: true })) return false;
    const protectedValue = await protect(receipts, op.participantId), time = clock(), revision = previous + 1;
    const lease = leaseCheck(context, time, previous).ConditionCheck;
    const accepted = await attempt([{ Update: { ...lease, UpdateExpression: 'SET receipts = :receipts, revision = :next',
      ExpressionAttributeValues: { ...lease.ExpressionAttributeValues, ':receipts': encodeValue(protectedValue), ':next': encodeValue(revision) },
    } }, ...(requireEligible ? [operationCheck(op), ...eligibleChecks(context, time)] : []),
    ...(requireNotice ? [operationCheck(op), ...noticeChecks(context, time)] : [])]);
    if (accepted) { context.receipts = receipts; context.revision = revision; }
    return accepted;
  }
  async function finish(context, { status, stage, reason } = {}) {
    requireValue(STATUSES.includes(status) && typeof stage === 'string' && LABEL.test(stage)
      && (reason === undefined || typeof reason === 'string' && LABEL.test(reason)));
    const { operation: op } = ref(context);
    const update = operationCheck(op).ConditionCheck;
    Object.assign(update.ExpressionAttributeValues, encode({ ':status': status, ':stage': stage, ':reason': reason ?? null }));
    Object.assign(update.ExpressionAttributeNames, { '#stage': 'stage', '#reason': 'reason' });
    return attempt([leaseCheck(context, clock()), { Update: { ...update,
      UpdateExpression: 'SET #status = :status, #stage = :stage, #reason = :reason' } }]);
  }
  async function release(context) {
    const op = ref(context).operation, revision = context.revision + 1;
    const accepted = await attempt([{ Update: { TableName: tableName, Key: { pk: { S: stateKey(op) } },
      ConditionExpression: 'leaseId = :lease AND revision = :revision AND leaseOperationId = :op',
      UpdateExpression: 'SET leaseId = :none, leaseUntil = :zero, revision = :next',
      ExpressionAttributeValues: encode({ ':lease': context.leaseId, ':revision': context.revision, ':op': op.operationId,
        ':none': null, ':zero': 0, ':next': revision }),
    } }]);
    if (accepted) context.revision = revision;
    return accepted;
  }
  return { claim, guard, saveReceipts, finish, release };
}
