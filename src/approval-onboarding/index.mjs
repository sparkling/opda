import { readFile } from 'node:fs/promises';
import { createOnboardingStore } from './store.mjs';
import { createOnboardingWorker } from './worker.mjs';
import { createGraphAdapter } from './graph.mjs';
import { createSharePointAdapter } from './sharepoint.mjs';
import { createPostmarkInvitationAdapter } from './postmark.mjs';
import { createMicrosoftClient, MICROSOFT_CLIENT_ID } from './microsoft-auth.mjs';
import { createReceiptProtection } from './receipt-protection.mjs';
import { OPDA_TENANT_ID } from './invitation.mjs';
import { WORKSPACES, INVITATION_REGISTRY, TEMPLATE_PIN, TEMPLATE_PINS, NOTICE_PINS } from './settings.mjs';

const REGION = 'eu-west-2', ACCOUNT = '355653384628', CACHE_MS = 300000;
const QUEUE = new RegExp(`^arn:aws:sqs:${REGION}:${ACCOUNT}:[A-Za-z0-9_-]{1,80}$`);
const EMAIL_HASH = /^[a-f0-9]{64}$/;
const SECRET_NAMES = { microsoft: 'opda/microsoft/participation-onboarding', postmark: 'opda/postmark/participation-onboarding' };
const MESSAGE_ID = /^[A-Za-z0-9][A-Za-z0-9-]{0,127}$/;
const OUTCOMES = ['pending', 'complete', 'cancelled', 'attention', 'skipped'];
const PROPAGATION_STAGES = new Set(['withdrawal-propagating', 'previous-grants-propagating', 'microsoft-propagating',
  'microsoft-identity-review', 'awaiting-provider-disable', 'notice-preflight-pending', 'invitation-preflight-pending']);
const PROPAGATION_DELAYS = [15, 45, 120];
const plain = value => value && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const invalidConfig = () => new TypeError('Invalid onboarding configuration');
const requireConfig = value => { if (!value) throw invalidConfig(); };
const DEFAULT_FACTORIES = { createOnboardingStore, createOnboardingWorker, createGraphAdapter,
  createSharePointAdapter, createPostmarkInvitationAdapter, createMicrosoftClient };

function queueReference(value) {
  requireConfig(typeof value === 'string' && QUEUE.test(value));
  return value;
}
function validateConfig(config) {
  requireConfig(plain(config) && typeof config.participantsTableName === 'string'
    && /^[A-Za-z0-9_.-]{3,255}$/.test(config.participantsTableName) && typeof config.enabled === 'boolean'
    && (config.canaryEmailHash === undefined || typeof config.canaryEmailHash === 'string'
      && (config.canaryEmailHash === '' || EMAIL_HASH.test(config.canaryEmailHash))));
  queueReference(config.queueArn);
  for (const [kind, name] of Object.entries(SECRET_NAMES)) {
    requireConfig(typeof config[`${kind}SecretArn`] === 'string'
      && new RegExp(`^arn:aws:secretsmanager:${REGION}:${ACCOUNT}:secret:${name}-[A-Za-z0-9]{6}$`).test(config[`${kind}SecretArn`]));
  }
}
function fromEnvironment(env) {
  requireConfig(env.ONBOARDING_ENABLED === undefined || ['false', 'true'].includes(env.ONBOARDING_ENABLED));
  requireConfig(env.ONBOARDING_CANARY_EMAIL_HASH === undefined || env.ONBOARDING_CANARY_EMAIL_HASH === ''
    || typeof env.ONBOARDING_CANARY_EMAIL_HASH === 'string' && EMAIL_HASH.test(env.ONBOARDING_CANARY_EMAIL_HASH));
  requireConfig(env.AWS_REGION === undefined || env.AWS_REGION === REGION);
  return { participantsTableName: env.PARTICIPANTS_TABLE_NAME, queueArn: env.ONBOARDING_QUEUE_ARN,
    microsoftSecretArn: env.MICROSOFT_SECRET_ARN, postmarkSecretArn: env.POSTMARK_SECRET_ARN,
    enabled: env.ONBOARDING_ENABLED === 'true', canaryEmailHash: env.ONBOARDING_CANARY_EMAIL_HASH ?? '' };
}

function secretShape(kind, value, time) {
  const keys = kind === 'microsoft' ? ['schemaVersion', 'tenantId', 'clientId', 'certificatePem', 'privateKeyPem',
    'certificateThumbprintSha1', 'expiresAt', 'receiptEncryptionKey'] : ['schemaVersion', 'serverId', 'serverToken'];
  if (!plain(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))
    || value.schemaVersion !== 1) throw Error();
  if (kind === 'postmark') {
    if (value.serverId !== 20188829 || typeof value.serverToken !== 'string' || value.serverToken.length > 512
      || !/^[\x21-\x7e]+$/.test(value.serverToken)) throw Error();
    return time + CACHE_MS;
  }
  const pem = (field, label) => typeof value[field] === 'string' && value[field].length <= 20000
    && new RegExp(`^-----BEGIN ${label}-----\\r?\\n[A-Za-z0-9+/=\\r\\n]+-----END ${label}-----\\r?\\n?$`).test(value[field]);
  if (value.tenantId !== OPDA_TENANT_ID || value.clientId !== MICROSOFT_CLIENT_ID
    || !pem('certificatePem', 'CERTIFICATE') || !pem('privateKeyPem', '(?:RSA )?PRIVATE KEY')
    || typeof value.certificateThumbprintSha1 !== 'string' || !/^[a-f0-9]{40}$/.test(value.certificateThumbprintSha1)
    || typeof value.expiresAt !== 'string' || !Number.isFinite(Date.parse(value.expiresAt)) || Date.parse(value.expiresAt) <= time + 60000
    || typeof value.receiptEncryptionKey !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(value.receiptEncryptionKey)
    || Buffer.from(value.receiptEncryptionKey, 'base64').length !== 32
    || Buffer.from(value.receiptEncryptionKey, 'base64').toString('base64') !== value.receiptEncryptionKey) throw Error();
  return Math.min(time + CACHE_MS, Date.parse(value.expiresAt) - 60000);
}

export function createSecrets(config, { now, getSecretValue, loadAws = () => import('@aws-sdk/client-secrets-manager') }) {
  const cache = new Map(), inflight = new Map();
  let service;
  async function request(input) {
    const options = { abortSignal: AbortSignal.timeout(5000) };
    if (getSecretValue) return getSecretValue(input, options);
    service ??= loadAws().then(aws => ({ aws, client: new aws.SecretsManagerClient({ region: REGION, maxAttempts: 2 }) }));
    const { aws, client } = await service;
    return client.send(new aws.GetSecretValueCommand(input), options);
  }
  async function get(kind) {
    try {
      const time = now();
      if (!Number.isSafeInteger(time) || time < 0) throw Error();
      const cached = cache.get(kind);
      if (cached && cached.at <= time && time < cached.until) return cached.value;
      cache.delete(kind);
      if (inflight.has(kind)) return await inflight.get(kind);
      const promise = (async () => {
        const arn = config[`${kind}SecretArn`];
        const response = await request({ SecretId: arn, VersionStage: 'AWSCURRENT' });
        if (response?.ARN !== arn || response.Name !== SECRET_NAMES[kind] || response.SecretBinary !== undefined
          || !Array.isArray(response.VersionStages) || !response.VersionStages.includes('AWSCURRENT')
          || typeof response.SecretString !== 'string' || Buffer.byteLength(response.SecretString) > 64000) throw Error();
        const value = JSON.parse(response.SecretString), until = secretShape(kind, value, time);
        if (until <= now()) throw Error();
        cache.set(kind, { value: Object.freeze(value), at: time, until });
        return value;
      })();
      inflight.set(kind, promise);
      try { return await promise; } finally { inflight.delete(kind); }
    } catch { throw new Error('Onboarding service credential unavailable'); }
  }
  return { microsoft: () => get('microsoft'), postmark: () => get('postmark') };
}

/** Assembly is inert: credentials load only when a claimed operation needs an effect or receipt. */
export async function createProductionWorker(config, { now = Date.now, getSecretValue, loadAws,
  readLogo = readFile, factories: overrides = {} } = {}) {
  validateConfig(config);
  requireConfig(typeof now === 'function' && typeof readLogo === 'function'
    && (getSecretValue === undefined || typeof getSecretValue === 'function'));
  const factories = { ...DEFAULT_FACTORIES, ...overrides };
  const secrets = createSecrets(config, { now, getSecretValue, ...(loadAws ? { loadAws } : {}) });
  const microsoft = factories.createMicrosoftClient({ getSecret: secrets.microsoft,
    siteUrls: Object.values(WORKSPACES).map(workspace => workspace.siteUrl), now });
  // Never fall back to the store's plaintext test hooks, including while grants are disabled.
  const receiptHooks = Object.fromEntries(['protectReceipts', 'unprotectReceipts'].map(method => [method, async (value, participantId) => {
    const secret = await secrets.microsoft();
    return createReceiptProtection(secret.receiptEncryptionKey)[method](value, participantId);
  }]));
  const store = factories.createOnboardingStore({ tableName: config.participantsTableName, now, ...receiptHooks });
  const postmarkAdapters = new Map();
  let postmarkToken;
  async function postmark(groupId, kind) {
    const secret = await secrets.postmark();
    if (secret.serverToken !== postmarkToken) { postmarkAdapters.clear(); postmarkToken = secret.serverToken; }
    const pin = kind === 'website-disabled' && groupId === undefined ? NOTICE_PINS.website
      : kind === 'group-withdrawn' ? NOTICE_PINS.groups[groupId]
      : kind === undefined ? groupId === undefined ? TEMPLATE_PIN : TEMPLATE_PINS[groupId] : undefined;
    if (!pin || !Number.isSafeInteger(pin.templateId)) throw new Error('Domain invitation template is not configured');
    const key = `${kind ?? 'invitation'}:${groupId ?? 'legacy'}`;
    if (!postmarkAdapters.has(key)) {
      postmarkAdapters.set(key, factories.createPostmarkInvitationAdapter({ token: secret.serverToken,
        expectedServerId: pin.serverId, expectedTemplateId: pin.templateId,
        expectedTemplateFingerprint: pin.fingerprint,
        ...(kind ? { noticeKind: kind } : {}),
        ...(groupId ? { expectedGroupId: groupId } : {}),
        ...(groupId || kind ? { expectedTemplateAlias: pin.alias, expectedSubject: pin.subject } : {}) }));
    }
    return postmarkAdapters.get(key);
  }
  let logo;
  try {
    logo = await readLogo(new URL('./opda-email-logo.png', import.meta.url));
    if (!Buffer.isBuffer(logo) || logo.length <= 8 || logo.length > 262000
      || !logo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw Error();
  } catch { throw new Error('Onboarding invitation asset unavailable'); }
  return factories.createOnboardingWorker({ store,
    graph: factories.createGraphAdapter({ request: microsoft.graph, workspaces: WORKSPACES }),
    sharepoint: factories.createSharePointAdapter({ request: microsoft.sharepoint, workspaces: WORKSPACES }),
    postmark: { send: async ({ groupId, kind, ...input }) => (await postmark(groupId, kind)).send(input),
      reconcile: async ({ groupId, kind, ...input }) => (await postmark(groupId, kind)).reconcile(input) },
    workspaces: WORKSPACES, invitationRegistry: INVITATION_REGISTRY, templatePin: TEMPLATE_PIN, templatePins: TEMPLATE_PINS,
    noticePins: NOTICE_PINS, logoBase64: logo.toString('base64'), enabled: config.enabled, canaryEmailHash: config.canaryEmailHash ?? '', now });
}

function operationReference(record, queueArn) {
  if (record.eventSource !== 'aws:sqs' || record.eventSourceARN !== queueArn || record.awsRegion !== REGION
    || typeof record.body !== 'string' || Buffer.byteLength(record.body) > 512) throw Error();
  // The producer has exactly two scalar fields. Reject duplicate, escaped or extra keys.
  const body = record.body.replace(/[ \t\r\n]/g, '');
  const forward = /^\{"schemaVersion":1,"operationId":"([a-f0-9]{64})"\}$/.exec(body);
  const reverse = /^\{"operationId":"([a-f0-9]{64})","schemaVersion":1\}$/.exec(body);
  if (!forward && !reverse) throw Error();
  const reference = (forward ?? reverse)[1], parsed = JSON.parse(record.body);
  if (parsed.schemaVersion !== 1 || parsed.operationId !== reference) throw Error();
  return reference;
}

/** Partial-batch retries contain only SQS message IDs. No provider details are logged. */
export function createHandler({ worker, queueArn, env = process.env, changeVisibility,
  loadSqs = () => import('@aws-sdk/client-sqs'),
  log = entry => console.error(JSON.stringify(entry)), ...dependencies } = {}) {
  let runtime, sqs;
  const defer = changeVisibility ?? (async input => {
    sqs ??= loadSqs().then(aws => ({ aws, client: new aws.SQSClient({ region: REGION, maxAttempts: 2 }) }));
    const { aws, client } = await sqs;
    await client.send(new aws.ChangeMessageVisibilityCommand(input), { abortSignal: AbortSignal.timeout(5000) });
  });
  const active = async () => {
    if (worker) return worker;
    runtime ??= createProductionWorker(fromEnvironment(env), dependencies).catch(error => { runtime = undefined; throw error; });
    return runtime;
  };
  return async event => {
    const expectedQueue = queueReference(queueArn ?? env.ONBOARDING_QUEUE_ARN);
    if (!plain(event) || !Array.isArray(event.Records) || event.Records.length < 1 || event.Records.length > 10
      || event.Records.some(record => !plain(record) || typeof record.messageId !== 'string' || !MESSAGE_ID.test(record.messageId))
      || new Set(event.Records.map(record => record.messageId)).size !== event.Records.length) {
      throw new TypeError('Invalid onboarding invocation');
    }
    const failures = [], propagation = [];
    let attention = 0;
    for (const record of event.Records) {
      try {
        const operationId = operationReference(record, expectedQueue);
        const result = await (await active()).process(operationId);
        if (!plain(result) || !OUTCOMES.includes(result.status)) throw Error();
        if (result.status === 'attention') attention++;
        if (result.status === 'pending' && PROPAGATION_STAGES.has(result.stage)) {
          const count = record.attributes?.ApproximateReceiveCount;
          if (typeof count !== 'string' || !/^[1-9][0-9]{0,4}$/.test(count)) throw Error();
          const seconds = PROPAGATION_DELAYS[Number(count) - 1];
          if (seconds !== undefined) {
            if (typeof record.receiptHandle !== 'string' || !record.receiptHandle.length || record.receiptHandle.length > 4096) throw Error();
            propagation.push({ record, seconds });
          }
          // After three short retries acknowledge this hint. Durable pending
          // state remains available to the normal outbox repair, not the DLQ.
        }
      } catch { failures.push({ itemIdentifier: record.messageId }); }
    }
    const retries = [];
    // Set visibility only after effects and leases have settled for the batch.
    // SQS waits; Lambda returns immediately and never sleeps for propagation.
    await Promise.all(propagation.map(async ({ record, seconds }) => {
      try {
        await defer({ QueueUrl: `https://sqs.${REGION}.amazonaws.com/${ACCOUNT}/${expectedQueue.split(':').at(-1)}`,
          ReceiptHandle: record.receiptHandle, VisibilityTimeout: seconds });
        retries.push({ itemIdentifier: record.messageId });
      } catch { failures.push({ itemIdentifier: record.messageId }); }
    }));
    for (const [event, count] of [['onboarding_attention', attention], ['onboarding_batch_retry', failures.length]]) {
      if (count) { try { log({ event, count }); } catch {} }
    }
    if (retries.length) { try { log({ event: 'onboarding_propagation_retry', count: retries.length }); } catch {} }
    return { batchItemFailures: [...failures, ...retries] };
  };
}

export const handler = createHandler();
