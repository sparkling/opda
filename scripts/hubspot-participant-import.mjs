#!/usr/bin/env node
// Explicit, resumable operator migration. No credentials or contact data are logged.
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { fromIni } from '@aws-sdk/credential-providers';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminGetUserCommand, DescribeUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { APP_SCOPES, verifyPrivateApp } from '../config/aws/hubspot-participation/admin.mjs';
import { APPROVAL, CONTACT_PROPERTIES, emailKey, initialParticipant, planApprovedContacts } from '../config/aws/hubspot-participation/import.mjs';

const [action, ...extra] = process.argv.slice(2);
if (!['plan', 'apply', 'project'].includes(action) || extra.length) {
  console.error('Usage: node scripts/hubspot-participant-import.mjs <plan|apply|project>'); process.exit(1);
}
const cfg = { region: 'eu-west-2', credentials: fromIni({ profile: 'opda' }), maxAttempts: 3 };
const db = DynamoDBDocumentClient.from(new DynamoDBClient(cfg));
const cognito = new CognitoIdentityProviderClient(cfg);
const s3 = new S3Client(cfg);
const secrets = new SecretsManagerClient(cfg);
const table = 'opda-participants';
const bucket = 'opda-participant-recovery-355653384628-eu-west-2';
const key = `migration/${APPROVAL.id}.json`;
const awsCli = args => JSON.parse(execFileSync('aws', [...args, '--profile', 'opda', '--region', cfg.region, '--output', 'json'], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000,
}));
const get = async pk => (await db.send(new GetCommand({ TableName: table, Key: { pk }, ConsistentRead: true }))).Item;

async function bridgeApi() {
  const raw = await secrets.send(new GetSecretValueCommand({ SecretId: 'opda/hubspot/participant-crm-bridge' }));
  const secret = JSON.parse(raw.SecretString);
  if (secret.portalId !== APPROVAL.portalId || secret.appId !== 52397854 || secret.role !== 'bridge') throw new Error('Credential identity mismatch');
  const api = async (path, options = {}) => {
    const tokenInfo = path === '/oauth/v2/private-apps/get/access-token-info';
    if (!tokenInfo && !path.startsWith('/crm/v3/objects/contacts')) throw new Error('Unsupported endpoint');
    const response = await fetch(`https://api.hubapi.com${path}`, {
      method: tokenInfo ? 'POST' : options.method ?? 'GET', redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${secret.accessToken}`, 'content-type': 'application/json' },
      body: tokenInfo ? JSON.stringify({ tokenKey: secret.accessToken }) : options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) throw new Error('CRM request failed');
    return response.json();
  };
  await verifyPrivateApp(api, { portalId: APPROVAL.portalId, appId: 52397854, scopes: APP_SCOPES.bridge });
  return api;
}

async function snapshot(api) {
  const contacts = [], cursors = new Set();
  let after;
  do {
    const query = new URLSearchParams({ limit: '100', archived: 'false', properties: CONTACT_PROPERTIES.join(',') });
    if (after) query.set('after', after);
    const page = await api(`/crm/v3/objects/contacts?${query}`);
    if (!Array.isArray(page.results)) throw new Error('Incomplete CRM inventory');
    contacts.push(...page.results);
    after = page.paging?.next?.after == null ? null : String(page.paging.next.after);
    if (after && cursors.has(after)) throw new Error('Repeated CRM cursor');
    if (after) cursors.add(after);
    if (contacts.length > 10000) throw new Error('Unexpected migration size');
  } while (after);
  return planApprovedContacts(contacts);
}

async function frozenSnapshot(api, actorArn) {
  const markerKey = `MIGRATION#${APPROVAL.id}`;
  const marker = await get(markerKey);
  let object;
  try {
    object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key, ...(marker ? { VersionId: marker.versionId } : {}) }));
  } catch (error) {
    // A captured approval can never be recreated from a later CRM inventory.
    if (marker || error.name !== 'NoSuchKey') throw error;
    const plan = { ...await snapshot(api), capturedAt: new Date().toISOString(), capturedBy: actorArn };
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: JSON.stringify(plan),
      ContentType: 'application/json', ServerSideEncryption: 'AES256', IfNoneMatch: '*' }));
    return frozenSnapshot(api, actorArn);
  }
  const bytes = await object.Body.transformToByteArray();
  const digest = createHash('sha256').update(bytes).digest('hex');
  const plan = JSON.parse(Buffer.from(bytes).toString('utf8'));
  if (JSON.stringify(plan.approval) !== JSON.stringify(APPROVAL) || !Array.isArray(plan.approved)
    || !object.VersionId || object.VersionId === 'null') throw new Error('Unexpected saved approval');
  if (marker && (marker.bucket !== bucket || marker.key !== key || marker.digest !== digest
    || marker.versionId !== object.VersionId)) throw new Error('Approval snapshot binding mismatch');
  if (!marker) {
    try {
      await db.send(new PutCommand({ TableName: table, Item: { pk: markerKey, bucket, key,
        versionId: object.VersionId, digest, capturedBy: actorArn, approvedCount: plan.approved.length },
      ConditionExpression: 'attribute_not_exists(pk)' }));
    } catch (error) {
      if (error.name !== 'ConditionalCheckFailedException') throw error;
      return frozenSnapshot(api, actorArn);
    }
  }
  return { plan, digest, versionId: object.VersionId };
}

async function provision(contact, poolId, digest) {
  const pk = `IMPORT#${APPROVAL.id}#${contact.contactId}`;
  let op = await get(pk);
  if (!op) {
    op = { pk, participantId: randomUUID(), email: contact.email, contactId: contact.contactId,
      sourceSnapshotDigest: digest, phase: 'prepared', createdAt: Date.now() };
    await db.send(new TransactWriteCommand({ TransactItems: [
      { Put: { TableName: table, Item: op, ConditionExpression: 'attribute_not_exists(pk)' } },
      { Put: { TableName: table, Item: { pk: emailKey(contact.email), participantId: op.participantId, importKey: pk },
        ConditionExpression: 'attribute_not_exists(pk)' } },
    ] }));
  }
  if (op.email !== contact.email || op.sourceSnapshotDigest !== digest) throw new Error('Import binding mismatch');
  if (op.phase === 'complete') {
    const user = await get(`USER#${op.cognitoSub}`);
    if (user?.participantId !== op.participantId || user.email !== contact.email) throw new Error('Completed import binding mismatch');
    return user; // Never overwrite a later enrolment, suspension or access decision.
  }
  let user;
  try {
    user = (await cognito.send(new AdminCreateUserCommand({
      UserPoolId: poolId, Username: contact.email, MessageAction: 'SUPPRESS', ForceAliasCreation: false,
      UserAttributes: [{ Name: 'email', Value: contact.email }, { Name: 'name', Value: contact.name },
        { Name: 'custom:participant_id', Value: op.participantId }],
      // No TemporaryPassword and no email_verified: email OTP is the ownership proof.
    }))).User;
  } catch (error) {
    if (error.name !== 'UsernameExistsException') throw error;
    const existing = await cognito.send(new AdminGetUserCommand({ UserPoolId: poolId, Username: contact.email }));
    user = { ...existing, Attributes: existing.UserAttributes };
  }
  const attributes = Object.fromEntries(user.Attributes.map(a => [a.Name, a.Value]));
  if (attributes.email !== contact.email || attributes['custom:participant_id'] !== op.participantId || !attributes.sub) {
    throw new Error('Cognito identity is not owned by this import');
  }
  const participant = initialParticipant(contact, { participantId: op.participantId, cognitoSub: attributes.sub,
    importedAt: op.createdAt, digest });
  await db.send(new TransactWriteCommand({ TransactItems: [
    { Put: { TableName: table, Item: participant, ConditionExpression: 'attribute_not_exists(pk)' } },
    { Update: { TableName: table, Key: { pk }, UpdateExpression: 'SET #phase = :complete, cognitoSub = :sub',
      ConditionExpression: 'participantId = :id AND #phase = :prepared',
      ExpressionAttributeNames: { '#phase': 'phase' }, ExpressionAttributeValues: {
        ':complete': 'complete', ':prepared': 'prepared', ':sub': attributes.sub, ':id': op.participantId,
      } } },
  ] }));
  return participant;
}

async function projectStatus(api, plan, current) {
  let projected = 0;
  for (let start = 0; start < plan.approved.length; start += 50) {
    const inputs = [];
    for (const contact of plan.approved.slice(start, start + 50)) {
      const op = await get(`IMPORT#${APPROVAL.id}#${contact.contactId}`);
      if (op?.phase !== 'complete' || current.get(contact.contactId) !== contact.email) continue;
      const participant = await get(`USER#${op.cognitoSub}`);
      if (participant?.participantId !== op.participantId || participant.hubspotContactId !== contact.contactId) continue;
      // Projection only: current AWS decisions, never imported CRM access flags.
      inputs.push({ id: contact.contactId, properties: {
        opda_review_status: participant.reviewStatus,
        opda_enrolment_status: participant.enrolmentStatus,
        opda_active: String(participant.active && !participant.suspended),
      } });
    }
    if (!inputs.length) continue;
    const result = await api('/crm/v3/objects/contacts/batch/update', { method: 'POST', body: { inputs } });
    if (result.status !== 'COMPLETE' || result.errors?.length || result.results?.length !== inputs.length) {
      throw new Error('CRM projection requires reconciliation');
    }
    projected += inputs.length;
  }
  console.log(JSON.stringify({ statusSnapshotsProjected: projected, profilesChanged: false, accessGrantedByProjection: false }));
}

try {
  const actor = awsCli(['sts', 'get-caller-identity']);
  if (actor.Account !== '355653384628') throw new Error('Unexpected AWS account');
  const api = await bridgeApi();
  if (action === 'plan') {
    const plan = await snapshot(api);
    console.log(JSON.stringify({ approval: APPROVAL, scanned: plan.scanned, eligible: plan.approved.length,
      exclusions: plan.excluded.reduce((a, x) => ({ ...a, [x.reason]: (a[x.reason] ?? 0) + 1 }), {}),
      contactDataLogged: false, mutations: false }, null, 2));
  } else {
    const stack = awsCli(['cloudformation', 'describe-stacks', '--stack-name', 'opda-participant-identity']).Stacks[0];
    const outputs = Object.fromEntries(stack.Outputs.map(x => [x.OutputKey, x.OutputValue]));
    if (outputs.ParticipantsTableName !== table || outputs.RecoveryBucketName !== bucket) throw new Error('Unexpected deployment');
    const pool = (await cognito.send(new DescribeUserPoolCommand({ UserPoolId: outputs.UserPoolId }))).UserPool;
    if (!pool.AdminCreateUserConfig?.AllowAdminCreateUserOnly || !pool.Policies?.SignInPolicy?.AllowedFirstAuthFactors?.includes('EMAIL_OTP')) {
      throw new Error('Pool does not implement approved-only passwordless enrolment');
    }
    const { plan, digest, versionId } = await frozenSnapshot(api, actor.Arn);
    const current = new Map((await snapshot(api)).approved.map(contact => [contact.contactId, contact.email]));
    if (action === 'project') {
      await projectStatus(api, plan, current);
      process.exit(0);
    }
    let complete = 0;
    const failures = [];
    for (let start = 0; start < plan.approved.length; start += 4) {
      await Promise.all(plan.approved.slice(start, start + 4).map(async contact => {
        try {
          if (current.get(contact.contactId) !== contact.email) throw new Error('Source removed or identity changed');
          await provision(contact, outputs.UserPoolId, digest); complete++;
        }
        catch (error) { failures.push({ contactId: contact.contactId, reason: 'provisioning-needs-review', code: error.name }); }
      }));
      if (start % 100 === 0) console.log(JSON.stringify({ processed: Math.min(start + 4, plan.approved.length), complete, failures: failures.length }));
    }
    const result = { approval: APPROVAL.id, digest, bucket, key, versionId, performedBy: actor.Arn,
      expected: plan.approved.length, complete, failures,
      excluded: plan.excluded, finishedAt: new Date().toISOString(), bulkEmailsSent: 0 };
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: `migration/${APPROVAL.id}-result.json`,
      Body: JSON.stringify(result), ContentType: 'application/json', ServerSideEncryption: 'AES256' }));
    console.log(JSON.stringify({ expected: result.expected, complete, failures: failures.length,
      excluded: plan.excluded.length, bulkEmailsSent: 0, reportSavedPrivately: true }, null, 2));
    if (failures.length) process.exitCode = 2;
  }
} catch {
  console.error('Participant migration failed. No personal data or raw credential/error response has been logged.');
  process.exitCode = 1;
}
