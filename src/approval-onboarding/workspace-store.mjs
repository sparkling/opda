import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { APPROVAL_GROUP_IDS } from './invitation.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const GUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const plain = v => v && typeof v === 'object' && !Array.isArray(v);
const attribute = v => v === null ? { NULL: true } : typeof v === 'string' ? { S: v }
  : typeof v === 'boolean' ? { BOOL: v } : Number.isSafeInteger(v) ? { N: String(v) }
    : Array.isArray(v) ? { L: v.map(attribute) } : plain(v) ? { M: encode(v) } : invalid();
const encode = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, attribute(x)]));
const value = v => typeof v?.S === 'string' ? v.S : v?.N !== undefined && Number.isSafeInteger(Number(v.N)) ? Number(v.N)
  : typeof v?.BOOL === 'boolean' ? v.BOOL : v?.NULL === true ? null : Array.isArray(v?.L) ? v.L.map(value)
    : plain(v?.M) ? decode(v.M) : invalid();
const decode = v => v ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)])) : null;
function invalid() { throw new Error('Workspace receipt unavailable'); }
function requireValue(condition) { if (!condition) invalid(); }

/** Shares the existing participant lease and encrypted receipts; never writes approval. */
export function createWorkspaceStore({ tableName, now = Date.now, send: injected, protectReceipts, unprotectReceipts }) {
  requireValue(typeof tableName === 'string' && /^[A-Za-z0-9_.-]{3,255}$/.test(tableName)
    && typeof protectReceipts === 'function' && typeof unprotectReceipts === 'function');
  const contexts = new WeakMap();
  let service;
  async function send(command, input) {
    if (injected) return injected(command, input);
    service ??= import('@aws-sdk/client-dynamodb').then(aws => ({ aws,
      client: new aws.DynamoDBClient({ region: 'eu-west-2', maxAttempts: 1 }) }));
    const { aws, client } = await service;
    return client.send(new aws[command](input), { abortSignal: AbortSignal.timeout(1500) });
  }
  const get = async pk => decode((await send('GetItemCommand', {
    TableName: tableName, Key: { pk: { S: pk } }, ConsistentRead: true,
  })).Item);
  async function put(row, prior) {
    try {
      await send('PutItemCommand', { TableName: tableName, Item: encode(row),
        ConditionExpression: prior ? 'revision = :revision AND leaseId = :lease' : 'attribute_not_exists(pk)',
        ...(prior ? { ExpressionAttributeValues: encode({ ':revision': prior.revision, ':lease': prior.leaseId }) } : {}),
      });
      return true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') return false;
      throw new Error('Workspace storage unavailable');
    }
  }
  function validParticipant(p, groupId) {
    return p && ID.test(p.participantId ?? '') && ID.test(p.cognitoSub ?? '')
      && typeof p.hubspotContactId === 'string' && /^[1-9][0-9]{0,19}$/.test(p.hubspotContactId)
      && p.hubspotPortalId === 144765514 && p.pk === `USER#${p.cognitoSub}`
      && typeof p.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) && p.email.length <= 254
      && p.email === p.email.toLowerCase() && p.active === true && p.suspended === false
      && p.reviewStatus === 'approved' && p.enrolmentStatus === 'complete'
      && !p.deletedAt && !p.erasedAt && (!p.expiresAt || p.expiresAt > Math.floor(now() / 1000))
      && APPROVAL_GROUP_IDS.includes(groupId) && p.approvedDomains?.includes(groupId)
      && p.domainApprovals?.[groupId]?.status === 'approved'
      && Number.isSafeInteger(p.domainApprovals[groupId].version)
      && /^[a-f0-9]{64}$/.test(p.domainApprovals[groupId].decisionId ?? '');
  }
  async function eligible(p, groupId) {
    if (!validParticipant(p, groupId)) return null;
    const [binding, owner, suppressed] = await Promise.all([
      get(`CRM#CONTACT#${p.hubspotContactId}`), get(`EMAIL#${digest(p.email)}`), get(`SYNC#SUPPRESS#EMAIL#${digest(p.email)}`),
    ]);
    if (!binding || binding.contactId !== p.hubspotContactId || binding.participantId !== p.participantId
      || binding.cognitoSub !== p.cognitoSub || binding.email !== p.email
      || !isDeepStrictEqual(binding.domainApprovals?.[groupId], p.domainApprovals[groupId])
      || owner?.participantId !== p.participantId
      || owner.approvalKey !== undefined && owner.approvalKey !== binding.pk || suppressed) return null;
    if (binding.registrationId && (!ID.test(binding.registrationId)
      || await get(`SYNC#SUPPRESS#REGISTRATION#${binding.registrationId}`))) return null;
    return binding;
  }
  function reference(ctx) { const ref = contexts.get(ctx); requireValue(ref); return ref; }
  function validReceipts(receipts) {
    requireValue(plain(receipts) && Object.keys(receipts).sort().join(',') === 'graph,mail,sharepoint'
      && Object.values(receipts).every(plain) && Buffer.byteLength(JSON.stringify(receipts)) <= 192000);
    return structuredClone(receipts);
  }
  function validState(state, pk, p) {
    requireValue(state.pk === pk && state.schemaVersion === 1 && state.participantId === p.participantId
      && state.cognitoSub === p.cognitoSub && state.contactId === p.hubspotContactId
      && Number.isSafeInteger(state.revision) && state.revision >= 1 && Number.isSafeInteger(state.leaseUntil)
      && (typeof state.leaseId === 'string' || state.leaseId === null && state.leaseUntil === 0));
  }
  function importedIdentity(binding, p) {
    const imported = binding.financeRosterImport;
    if (!imported?.microsoft) return null;
    requireValue(imported.participantId === p.participantId && imported.cognitoSub === p.cognitoSub
      && imported.contactId === p.hubspotContactId && imported.email === p.email
      && GUID.test(imported.microsoft.userId ?? ''));
    return { state: 'bound', emailDigest: digest(p.email), userId: imported.microsoft.userId };
  }
  function identityShape(identity) {
    return plain(identity) && ['bound', 'invited'].includes(identity.state)
      && /^[a-f0-9]{64}$/.test(identity.emailDigest ?? '') && GUID.test(identity.userId ?? '');
  }
  function identityPin(identity, p) {
    return identityShape(identity) && identity.emailDigest === digest(p.email);
  }
  function sameIdentity(left, right) {
    return identityShape(left) && identityShape(right)
      && left.state === right.state && left.emailDigest === right.emailDigest && left.userId === right.userId;
  }
  async function load({ participant: p, groupId }) {
    const binding = await eligible(p, groupId);
    if (!binding) return { status: 'denied' };
    const pk = `CRM#ONBOARDING_STATE#${p.participantId}`, state = await get(pk);
    let receipts;
    if (state) {
      validState(state, pk, p);
      receipts = validReceipts(await unprotectReceipts(state.receipts, p.participantId));
    } else receipts = validReceipts({ graph: {}, sharepoint: {}, mail: {} });
    if (!receipts.graph.identity) {
      const identity = importedIdentity(binding, p);
      if (identity) receipts.graph = { schemaVersion: 1, memberships: receipts.graph.memberships ?? {}, identity };
    }
    if (!receipts.graph.identity) return { status: state?.leaseUntil > now() ? 'pending' : 'noidentity' };
    if (receipts.graph.identity.state === 'invite-intent' || !identityPin(receipts.graph.identity, p)) {
      return { status: 'denied' };
    }
    const context = { receipts, participant: structuredClone(p), groupId, binding,
      row: state ? structuredClone(state) : null, readOnly: true };
    contexts.set(context, context);
    return { status: 'ready', context };
  }
  async function claim({ participant: p, groupId }) {
    const binding = await eligible(p, groupId);
    if (!binding) return null;
    const pk = `CRM#ONBOARDING_STATE#${p.participantId}`, state = await get(pk);
    if (state) {
      validState(state, pk, p);
      if (state.leaseUntil > now()) return null;
    }
    const receipts = validReceipts(state ? await unprotectReceipts(state.receipts, p.participantId)
      : { graph: {}, sharepoint: {}, mail: {} });
    const imported = binding.financeRosterImport;
    if (!receipts.graph.identity && imported?.microsoft) {
      // The historical immutable ID is a lookup constraint, never proof of access.
      requireValue(imported.participantId === p.participantId && imported.cognitoSub === p.cognitoSub
        && imported.contactId === p.hubspotContactId && imported.email === p.email
        && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(imported.microsoft.userId ?? ''));
      receipts.graph = { schemaVersion: 1, memberships: receipts.graph.memberships ?? {},
        identity: { state: 'bound', emailDigest: digest(p.email), userId: imported.microsoft.userId } };
    }
    const leaseId = randomUUID();
    const row = { ...(state ?? {}), pk, schemaVersion: 1, participantId: p.participantId,
      contactId: p.hubspotContactId, cognitoSub: p.cognitoSub, revision: (state?.revision ?? 0) + 1,
      leaseId, leaseOperationId: digest(`workspace:${leaseId}`), leaseUntil: now() + 20000,
      receipts: state?.receipts ?? await protectReceipts(receipts, p.participantId) };
    if (!await put(row, state)) return null;
    const ctx = { receipts };
    contexts.set(ctx, { row, participant: structuredClone(p), groupId, binding });
    return ctx;
  }
  async function guard(ctx, participant) {
    const ref = reference(ctx);
    const binding = await eligible(participant, ref.groupId);
    if (!isDeepStrictEqual(participant.domainApprovals?.[ref.groupId], ref.participant.domainApprovals[ref.groupId])
      || participant.accessVersion !== ref.participant.accessVersion
      || participant.email !== ref.participant.email || participant.participantId !== ref.participant.participantId
      || participant.cognitoSub !== ref.participant.cognitoSub || !binding
      || !isDeepStrictEqual(binding, ref.binding)) return false;
    if (ref.readOnly) {
      const state = await get(`CRM#ONBOARDING_STATE#${ref.participant.participantId}`);
      let receipts = state ? validReceipts(await unprotectReceipts(state.receipts, ref.participant.participantId))
        : validReceipts({ graph: {}, sharepoint: {}, mail: {} });
      if (!receipts.graph.identity) {
        const identity = importedIdentity(ref.binding, participant);
        if (identity) receipts.graph = { schemaVersion: 1, memberships: receipts.graph.memberships ?? {}, identity };
      }
      return Boolean(receipts.graph.identity && sameIdentity(receipts.graph.identity, ref.receipts.graph.identity));
    }
    const state = await get(ref.row.pk);
    return Boolean(state && state.revision === ref.row.revision && state.leaseId === ref.row.leaseId
      && state.leaseOperationId === ref.row.leaseOperationId && state.leaseUntil > now());
  }
  async function saveGraph(ctx, graphReceipt) {
    const ref = reference(ctx);
    if (ref.readOnly) return false;
    if (ref.row.leaseUntil <= now()) return false;
    const receipts = validReceipts({ ...ctx.receipts, graph: graphReceipt });
    // Acknowledged provider effects are recorded even after withdrawal, for recovery.
    // The caller checks current approval again before ANY external hand-off.
    const row = { ...ref.row, revision: ref.row.revision + 1,
      receipts: await protectReceipts(receipts, ref.row.participantId) };
    if (!await put(row, ref.row)) return false;
    ref.row = row; ctx.receipts = receipts;
    return true;
  }
  async function release(ctx) {
    const ref = reference(ctx);
    if (ref.readOnly) { contexts.delete(ctx); return true; }
    // Match the existing onboarding worker's released-lease representation.
    await put({ ...ref.row, revision: ref.row.revision + 1, leaseId: null, leaseUntil: 0 }, ref.row);
    contexts.delete(ctx);
  }
  return Object.freeze({ load, claim, guard, saveGraph, release });
}
