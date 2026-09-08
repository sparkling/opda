#!/usr/bin/env node
// Preserve frozen pre-existing website approval; never create CRM records or roles.
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const APPROVAL_ID = 'legacy-auth0-allowlist-2026-09-08';
const SOURCE = 'legacy-auth0-allowlist';
const ACCOUNT = '355653384628';
const TABLE = 'opda-participants';
const BUCKET = `opda-participant-recovery-${ACCOUNT}-eu-west-2`;
const KEY = `migration/${APPROVAL_ID}.json`;
const MARKER = `MIGRATION#${APPROVAL_ID}`;
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const isUuid = value => typeof value === 'string' && UUID.test(value);
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = () => { throw new Error('Legacy approval migration boundary failed'); };

function validatePin(pin) {
  if (pin?.bucket !== BUCKET || pin.key !== KEY || typeof pin.versionId !== 'string'
    || !/^[A-Za-z0-9._+/=-]{1,1024}$/.test(pin.versionId) || pin.versionId === 'null'
    || typeof pin.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(pin.sha256)) fail();
  return pin;
}

export function parseArguments(argv) {
  const [action, ...args] = argv;
  if (!['plan', 'apply'].includes(action) || args.length !== 8) fail();
  const names = { '--bucket': 'bucket', '--key': 'key', '--version-id': 'versionId', '--sha256': 'sha256' };
  const pin = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = names[args[i]];
    if (!name || Object.hasOwn(pin, name)) fail();
    pin[name] = args[i + 1];
  }
  return { action, pin: validatePin(pin) };
}

export function validateSnapshot(bytes, pin, versionId) {
  validatePin(pin);
  if (!Buffer.isBuffer(bytes) || bytes.length > 16384 || versionId !== pin.versionId || hash(bytes) !== pin.sha256) fail();
  let source;
  try { source = JSON.parse(bytes.toString('utf8')); } catch { fail(); }
  const keys = ['schemaVersion', 'source', 'sourceFunction', 'capturedAt', 'emails', 'sourceRevisionId'];
  if (!source || Array.isArray(source) || Object.keys(source).some(key => !keys.includes(key))
    || source.schemaVersion !== 1 || source.source !== SOURCE || source.sourceFunction !== 'opda-auth-session'
    || typeof source.capturedAt !== 'string' || !Number.isFinite(Date.parse(source.capturedAt))
    || new Date(source.capturedAt).toISOString() !== source.capturedAt
    || (source.sourceRevisionId !== undefined && !isUuid(source.sourceRevisionId))
    || !Array.isArray(source.emails) || source.emails.length !== 6) fail();
  const emails = source.emails.map(value => {
    if (typeof value !== 'string') fail();
    const email = value.trim().toLowerCase();
    if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) fail();
    return email;
  });
  if (new Set(emails).size !== 6) fail();
  return { ...source, emails: emails.sort() };
}

function markerMatches(marker, pin) {
  if (!marker || marker.pk !== MARKER || marker.bucket !== pin.bucket || marker.key !== pin.key
    || marker.versionId !== pin.versionId || marker.digest !== pin.sha256 || marker.approvedCount !== 6) fail();
}
const emailKey = email => `EMAIL#${hash(email)}`;
const operationKey = email => `IMPORT#${APPROVAL_ID}#${hash(email)}`;
function boundOperation(op, claim, email, pin) {
  if (!op || op.pk !== operationKey(email) || op.email !== email || !isUuid(op.participantId)
    || !Number.isSafeInteger(op.createdAt) || op.createdAt < 0 || op.sourceSnapshotDigest !== pin.sha256
    || !['prepared', 'complete'].includes(op.phase) || claim?.pk !== emailKey(email)
    || claim.participantId !== op.participantId || claim.importKey !== op.pk) fail();
}

export function createLegacyImporter(deps) {
  async function provision(email, source, pin) {
    let op = await deps.get(operationKey(email));
    let claim = await deps.get(emailKey(email));
    if (!op) {
      if (claim) fail(); // Never adopt a CRM/import identity merely by matching email.
      op = { pk: operationKey(email), participantId: deps.newId(), email,
        sourceSnapshotDigest: pin.sha256, phase: 'prepared', createdAt: deps.now() };
      claim = { pk: emailKey(email), participantId: op.participantId, importKey: op.pk };
      try { await deps.prepare(op, claim, pin); }
      catch (error) {
        if (!['TransactionCanceledException', 'ConditionalCheckFailedException'].includes(error.name)) throw error;
        op = await deps.get(operationKey(email)); claim = await deps.get(emailKey(email));
      }
    }
    boundOperation(op, claim, email, pin);
    if (op.phase === 'complete') {
      const saved = await deps.get(`USER#${op.cognitoSub}`);
      if (!isUuid(op.cognitoSub) || saved?.pk !== `USER#${op.cognitoSub}`
        || saved.cognitoSub !== op.cognitoSub || saved.participantId !== op.participantId
        || saved.email !== email || saved.approvalId !== APPROVAL_ID || saved.sourceSnapshotDigest !== pin.sha256) fail();
      return; // Never change later review/activation/suspension/enrolment/version decisions.
    }
    let user;
    try {
      user = await deps.createUser({ Username: email, MessageAction: 'SUPPRESS', ForceAliasCreation: false,
        UserAttributes: [{ Name: 'email', Value: email }, { Name: 'name', Value: email },
          { Name: 'custom:participant_id', Value: op.participantId }] });
    } catch (error) {
      if (error.name !== 'UsernameExistsException') throw error;
      user = await deps.getUser(email);
    }
    if (!Array.isArray(user?.Attributes) || user.Enabled === false) fail();
    const attrs = Object.fromEntries(user.Attributes.map(value => [value.Name, value.Value]));
    if (attrs.email !== email || attrs['custom:participant_id'] !== op.participantId || !isUuid(attrs.sub)) fail();
    const participant = { pk: `USER#${attrs.sub}`, participantId: op.participantId, cognitoSub: attrs.sub,
      email, name: email, source: SOURCE, reviewStatus: 'approved', active: true, suspended: false,
      enrolmentStatus: 'not_invited', accessVersion: 1, createdAt: op.createdAt,
      approvedAt: Date.parse(source.capturedAt), approvalId: APPROVAL_ID,
      approvalReason: 'Preserved explicit legacy website allowlist approval at frozen capture.',
      sourceSnapshotDigest: pin.sha256, sourceSnapshotVersionId: pin.versionId };
    await deps.complete(op, participant, pin);
  }

  return {
    async run(action, pin, actorArn) {
      if (!['plan', 'apply'].includes(action)) fail();
      validatePin(pin);
      const object = await deps.readSnapshot(pin);
      const source = validateSnapshot(object.bytes, pin, object.versionId);
      let marker = await deps.get(MARKER);
      if (marker) markerMatches(marker, pin);
      if (action === 'plan') {
        let imported = 0, conflicts = 0;
        for (const email of source.emails) {
          const op = await deps.get(operationKey(email)), claim = await deps.get(emailKey(email));
          if (op) { try { boundOperation(op, claim, email, pin); imported += Number(op.phase === 'complete'); } catch { conflicts++; } }
          else if (claim) conflicts++;
        }
        return { expected: 6, imported, conflicts, mutations: false, contactDataLogged: false };
      }
      if (!marker) {
        marker = { pk: MARKER, source: SOURCE, bucket: pin.bucket, key: pin.key, versionId: pin.versionId,
          digest: pin.sha256, approvedCount: 6, capturedAt: source.capturedAt,
          sourceFunction: source.sourceFunction, ...(source.sourceRevisionId ? { sourceRevisionId: source.sourceRevisionId } : {}),
          recordedAt: deps.now(), recordedBy: actorArn };
        try { await deps.putMarker(marker); }
        catch (error) {
          if (error.name !== 'ConditionalCheckFailedException') throw error;
          markerMatches(await deps.get(MARKER), pin);
        }
      }
      let complete = 0, failed = 0;
      for (const email of source.emails) {
        try { await provision(email, source, pin); complete++; } catch { failed++; }
      }
      return { expected: 6, complete, failed, bulkEmailsSent: 0, crmContactsCreated: 0, contactDataLogged: false };
    },
  };
}

export async function awsDependencies() {
  const [{ fromIni }, ddb, document, cog, storage] = await Promise.all([
    import('@aws-sdk/credential-providers'), import('@aws-sdk/client-dynamodb'), import('@aws-sdk/lib-dynamodb'),
    import('@aws-sdk/client-cognito-identity-provider'), import('@aws-sdk/client-s3'),
  ]);
  const cfg = { region: 'eu-west-2', credentials: fromIni({ profile: 'opda' }), maxAttempts: 3 };
  const cli = args => JSON.parse(execFileSync('aws', [...args, '--profile', 'opda', '--region', cfg.region, '--output', 'json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }));
  const actor = cli(['sts', 'get-caller-identity']);
  if (actor.Account !== ACCOUNT || !String(actor.Arn).includes(`::${ACCOUNT}:`)) fail();
  const stack = cli(['cloudformation', 'describe-stacks', '--stack-name', 'opda-participant-identity']).Stacks?.[0];
  const outputs = Object.fromEntries((stack?.Outputs ?? []).map(value => [value.OutputKey, value.OutputValue]));
  if (outputs.ParticipantsTableName !== TABLE || outputs.RecoveryBucketName !== BUCKET
    || !/^eu-west-2_[A-Za-z0-9]+$/.test(outputs.UserPoolId ?? '')) fail();
  const cognito = new cog.CognitoIdentityProviderClient(cfg);
  const pool = (await cognito.send(new cog.DescribeUserPoolCommand({ UserPoolId: outputs.UserPoolId }))).UserPool;
  if (pool?.AdminCreateUserConfig?.AllowAdminCreateUserOnly !== true
    || JSON.stringify(pool.Policies?.SignInPolicy?.AllowedFirstAuthFactors) !== '["EMAIL_OTP"]') fail();
  const db = document.DynamoDBDocumentClient.from(new ddb.DynamoDBClient(cfg));
  const s3 = new storage.S3Client(cfg);
  const markerGuard = pin => ({ ConditionCheck: { TableName: TABLE, Key: { pk: MARKER },
    ConditionExpression: '#bucket = :bucket AND #key = :key AND #version = :version AND #digest = :digest',
    ExpressionAttributeNames: { '#bucket': 'bucket', '#key': 'key', '#version': 'versionId', '#digest': 'digest' },
    ExpressionAttributeValues: {
      ':bucket': pin.bucket, ':key': pin.key, ':version': pin.versionId, ':digest': pin.sha256,
    } } });
  const putNew = Item => ({ Put: { TableName: TABLE, Item, ConditionExpression: 'attribute_not_exists(pk)' } });
  return { actorArn: actor.Arn, deps: {
    now: Date.now, newId: randomUUID,
    get: async pk => (await db.send(new document.GetCommand({ TableName: TABLE, Key: { pk }, ConsistentRead: true }))).Item,
    readSnapshot: async pin => {
      const object = await s3.send(new storage.GetObjectCommand({ Bucket: pin.bucket, Key: pin.key,
        VersionId: pin.versionId, ExpectedBucketOwner: ACCOUNT }));
      if (object.ServerSideEncryption !== 'AES256' || object.ContentLength > 16384) { object.Body?.destroy(); fail(); }
      const chunks = []; let size = 0;
      for await (const chunk of object.Body) {
        size += chunk.length; if (size > 16384) { object.Body.destroy(); fail(); }
        chunks.push(chunk);
      }
      return { bytes: Buffer.concat(chunks), versionId: object.VersionId };
    },
    putMarker: Item => db.send(new document.PutCommand({ TableName: TABLE, Item, ConditionExpression: 'attribute_not_exists(pk)' })),
    prepare: (op, claim, pin) => db.send(new document.TransactWriteCommand({
      TransactItems: [markerGuard(pin), putNew(op), putNew(claim)],
    })),
    createUser: async input => (await cognito.send(new cog.AdminCreateUserCommand({ ...input, UserPoolId: outputs.UserPoolId }))).User,
    getUser: async email => {
      const user = await cognito.send(new cog.AdminGetUserCommand({ UserPoolId: outputs.UserPoolId, Username: email }));
      return { ...user, Attributes: user.UserAttributes };
    },
    complete: (op, participant, pin) => db.send(new document.TransactWriteCommand({ TransactItems: [
      markerGuard(pin), putNew(participant),
      { ConditionCheck: { TableName: TABLE, Key: { pk: emailKey(op.email) },
        ConditionExpression: 'participantId = :id AND importKey = :import',
        ExpressionAttributeValues: { ':id': op.participantId, ':import': op.pk } } },
      { Update: { TableName: TABLE, Key: { pk: op.pk }, UpdateExpression: 'SET #phase = :complete, cognitoSub = :sub',
        ConditionExpression: 'participantId = :id AND #phase = :prepared AND sourceSnapshotDigest = :digest',
        ExpressionAttributeNames: { '#phase': 'phase' }, ExpressionAttributeValues: {
          ':id': op.participantId, ':prepared': 'prepared', ':complete': 'complete',
          ':sub': participant.cognitoSub, ':digest': pin.sha256,
        } } },
    ] })),
  } };
}

async function main() {
  try {
    const { action, pin } = parseArguments(process.argv.slice(2));
    const { deps, actorArn } = await awsDependencies();
    const result = await createLegacyImporter(deps).run(action, pin, actorArn);
    console.log(JSON.stringify(result));
    if (result.failed || result.conflicts) process.exitCode = 2;
  } catch {
    console.error('Legacy participant migration failed. Supply plan|apply with --bucket --key --version-id --sha256. No personal data or raw errors logged.');
    process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
