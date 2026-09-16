#!/usr/bin/env node
/**
 * Operator review for a parked (attention) onboarding operation — ADR-0085 §5 "explicit review".
 *
 *   node scripts/onboarding-review.mjs inspect <operationId>
 *   node scripts/onboarding-review.mjs resolve <operationId> --effect grant-index --as absent|owned|manual
 *
 * inspect: decrypts the participant's receipts and compares every uncertain SharePoint grant
 *          with the live site, printing what a reviewer needs (never URLs, tokens or bodies).
 * resolve: records the reviewer's verdict on one uncertain grant, then re-queues the operation.
 *          absent — the write never landed: the grant is cancelled and the worker retries it.
 *          owned  — the write landed and is ours: confirmed, so withdrawal will remove it.
 *          manual — the membership is someone else's: retained, never removed by us.
 * The verdict must agree with the live site; the tool refuses otherwise.
 */
import { execFileSync } from 'node:child_process';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { createMicrosoftClient } from '../src/approval-onboarding/microsoft-auth.mjs';
import { createReceiptProtection } from '../src/approval-onboarding/receipt-protection.mjs';
import { WORKSPACES } from '../src/approval-onboarding/settings.mjs';

const REGION = 'eu-west-2', FUNCTION = 'opda-participant-onboarding';
const OPERATION_ID = /^[a-f0-9]{64}$/, GRANTS = new Set(['grant-contributor', 'grant-index']), VERDICTS = new Set(['absent', 'owned', 'manual']);
const [command, operationId, ...rest] = process.argv.slice(2);
const flag = name => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
if (!['inspect', 'resolve'].includes(command) || !OPERATION_ID.test(operationId ?? '')) {
  console.error('usage: onboarding-review.mjs inspect|resolve <operationId> [--effect grant-index --as absent|owned|manual]'); process.exit(2);
}

const lambdaEnv = JSON.parse(execFileSync('aws', ['lambda', 'get-function-configuration', '--region', REGION, '--function-name', FUNCTION,
  '--query', 'Environment.Variables', '--output', 'json'], { encoding: 'utf8' }));
const tableName = lambdaEnv.PARTICIPANTS_TABLE_NAME, queueUrl = `https://sqs.${REGION}.amazonaws.com/${lambdaEnv.ONBOARDING_QUEUE_ARN.split(':')[4]}/${lambdaEnv.ONBOARDING_QUEUE_ARN.split(':').at(-1)}`;
const dynamo = new DynamoDBClient({ region: REGION });
const get = async pk => { const r = await dynamo.send(new GetItemCommand({ TableName: tableName, Key: marshall({ pk }), ConsistentRead: true })); return r.Item ? unmarshall(r.Item) : null; };
const secret = JSON.parse((await new SecretsManagerClient({ region: REGION }).send(new GetSecretValueCommand({ SecretId: lambdaEnv.MICROSOFT_SECRET_ARN }))).SecretString);
const protection = createReceiptProtection(secret.receiptEncryptionKey);
const microsoft = createMicrosoftClient({ getSecret: async () => secret, siteUrls: Object.values(WORKSPACES).map(w => w.siteUrl) });

const op = await get(`CRM#ONBOARDING#${operationId}`);
if (!op) { console.error('operation not found'); process.exit(1); }
const state = await get(`CRM#ONBOARDING_STATE#${op.participantId}`);
if (!state) { console.error('no receipt state for this participant'); process.exit(1); }
const receipts = protection.unprotectReceipts({ ...state.receipts, version: Number(state.receipts.version) }, op.participantId);
const live = async (groupId, receipt, key) => {
  const member = receipt.memberships[key];
  const r = await microsoft.sharepoint(WORKSPACES[groupId].siteUrl, `/_api/web/sitegroups/getbyid(${member.groupId})/users?$filter=Id%20eq%20${member.userId}&$select=Id`);
  return r.value.length === 1;
};

console.log(`operation ${operationId.slice(0, 12)}… action=${op.action} status=${op.status} stage=${op.stage} reason=${op.reason ?? '-'} domain=${op.domainId ?? '-'}`);
console.log(`graph identity: ${receipts.graph.identity?.state ?? '-'} userType=${receipts.graph.identity?.userType ?? '-'}`);
for (const [teamId, m] of Object.entries(receipts.graph.memberships ?? {})) console.log(`  team ${m.groupId} (${teamId.slice(0, 8)}…): ownership=${m.ownership} state=${m.state}`);
for (const [groupId, receipt] of Object.entries(receipts.sharepoint)) {
  console.log(`sharepoint ${groupId}: effects=${JSON.stringify(receipt.effects)} folder=${receipt.folder ? (receipt.folder.created ? 'created' : 'existing') : 'none'}`);
  for (const [key, member] of Object.entries(receipt.memberships)) {
    const uncertain = ['pending', 'unknown'].includes(member.status);
    console.log(`  ${key}: group=${member.groupId} user=${member.userId} owned=${member.owned} status=${member.status}${uncertain ? ` | live: ${await live(groupId, receipt, key) ? 'PRESENT' : 'absent'}` : ''}`);
  }
}
for (const [id, m] of Object.entries(receipts.mail ?? {})) console.log(`mail ${id.slice(0, 12)}…: kind=${m.kind ?? 'invitation'} status=${m.status} domain=${m.domainId ?? '-'}`);
if (command === 'inspect') process.exit(0);

const effect = flag('effect'), verdict = flag('as'), key = effect?.replace('grant-', '');
if (!GRANTS.has(effect) || !VERDICTS.has(verdict)) { console.error('resolve needs --effect grant-contributor|grant-index and --as absent|owned|manual'); process.exit(2); }
if (op.status !== 'attention') { console.error(`operation is ${op.status}, not attention`); process.exit(1); }
const groupId = op.domainId, receipt = receipts.sharepoint[groupId], member = receipt?.memberships[key];
if (!member || !['pending', 'unknown'].includes(member.status)) { console.error(`${effect} is not uncertain for ${groupId}`); process.exit(1); }
const present = await live(groupId, receipt, key);
if ((verdict === 'absent') === present) { console.error(`verdict "${verdict}" contradicts the live site (membership ${present ? 'present' : 'absent'})`); process.exit(1); }
if (verdict === 'absent') { receipt.effects[effect] = 'cancelled'; receipt.memberships[key] = { ...member, owned: null, status: 'pending' }; }
if (verdict === 'owned') { receipt.effects[effect] = 'confirmed'; receipt.memberships[key] = { ...member, owned: true, status: 'granted' }; }
if (verdict === 'manual') { delete receipt.effects[effect]; receipt.memberships[key] = { ...member, owned: false, status: 'existing' }; }

const revision = Number(state.revision), now = Date.now();
await dynamo.send(new UpdateItemCommand({ TableName: tableName, Key: marshall({ pk: state.pk }),
  ConditionExpression: 'revision = :rev AND leaseUntil <= :now',
  UpdateExpression: 'SET receipts = :receipts, revision = :next',
  ExpressionAttributeValues: marshall({ ':rev': revision, ':now': now, ':receipts': protection.protectReceipts(receipts, op.participantId), ':next': revision + 1 }) }));
await dynamo.send(new UpdateItemCommand({ TableName: tableName, Key: marshall({ pk: op.pk }),
  ConditionExpression: '#status = :attention', ExpressionAttributeNames: { '#status': 'status', '#stage': 'stage', '#reason': 'reason' },
  UpdateExpression: 'SET #status = :pending, #stage = :stage, #reason = :reason',
  ExpressionAttributeValues: marshall({ ':attention': 'attention', ':pending': 'pending', ':stage': 'review-resolved', ':reason': `${effect}-${verdict}` }) }));
execFileSync('aws', ['sqs', 'send-message', '--region', REGION, '--queue-url', queueUrl, '--message-body', JSON.stringify({ schemaVersion: 1, operationId })], { stdio: 'ignore' });
console.log(`resolved ${effect} as ${verdict}; operation re-queued as pending/review-resolved`);
