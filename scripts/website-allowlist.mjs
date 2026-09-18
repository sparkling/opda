#!/usr/bin/env node
/**
 * Operator website allowlist — website sign-in for an account with no approved working group
 * (ADR-0085 §5 exception, 2026-09-18). It grants no workspace, and every hold still applies.
 *
 *   node scripts/website-allowlist.mjs list
 *   node scripts/website-allowlist.mjs grant  <email> [<email> …] --reason "<why>" --confirm
 *   node scripts/website-allowlist.mjs revoke <email> [<email> …] --reason "<why>" --confirm
 *
 * grant marks the USER row; revoke clears it and bumps accessVersion so open sessions end.
 * Both are refused for an account that is held, erased or has no USER row.
 */
import { execFileSync } from 'node:child_process';
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const REGION = 'eu-west-2', FUNCTION = 'opda-auth-session';
const [command, ...rest] = process.argv.slice(2);
const flag = name => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const emails = rest.filter((item, i) => !item.startsWith('--') && rest[i - 1] !== '--reason').map(e => e.trim().toLowerCase());
const reason = flag('reason'), confirm = rest.includes('--confirm');
if (!['list', 'grant', 'revoke'].includes(command) || (command !== 'list' && (!emails.length || !reason))) {
  console.error('usage: website-allowlist.mjs list | grant|revoke <email…> --reason "<why>" --confirm'); process.exit(2);
}
const actor = execFileSync('aws', ['sts', 'get-caller-identity', '--query', 'Arn', '--output', 'text'], { encoding: 'utf8' }).trim();
const tableName = JSON.parse(execFileSync('aws', ['lambda', 'get-function-configuration', '--region', REGION, '--function-name', FUNCTION,
  '--query', 'Environment.Variables', '--output', 'json'], { encoding: 'utf8' })).PARTICIPANTS_TABLE_NAME;
const dynamo = new DynamoDBClient({ region: REGION });

async function accounts() {
  const rows = []; let key;
  do {
    const page = await dynamo.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey: key,
      FilterExpression: 'begins_with(pk, :u)', ExpressionAttributeValues: marshall({ ':u': 'USER#' }) }));
    rows.push(...page.Items.map(item => unmarshall(item))); key = page.LastEvaluatedKey;
  } while (key);
  return rows;
}
const held = row => row.suspended === true || row.erasedAt || row.deletedAt || row.reviewStatus !== 'approved';
const describe = row => `${row.email}  allowlist=${row.websiteAllowlist === true} domains=${JSON.stringify(row.approvedDomains ?? [])} active=${row.active} review=${row.reviewStatus} enrolment=${row.enrolmentStatus}`;

const rows = await accounts();
if (command === 'list') {
  for (const row of rows.filter(r => r.websiteAllowlist === true)) console.log(describe(row), `| since ${row.websiteAllowlistAt} | ${row.websiteAllowlistReason}`);
  process.exit(0);
}
const now = new Date().toISOString();
for (const email of emails) {
  const matches = rows.filter(row => String(row.email ?? '').toLowerCase() === email);
  if (matches.length !== 1) { console.error(`${email}: ${matches.length} USER rows; refusing`); process.exitCode = 1; continue; }
  const [row] = matches;
  if (held(row)) { console.error(`${email}: account is held (${row.reviewStatus}/${row.suspended ? 'suspended' : 'ok'}); refusing`); process.exitCode = 1; continue; }
  const granting = command === 'grant';
  if ((row.websiteAllowlist === true) === granting) { console.log(`${email}: already ${granting ? 'allowlisted' : 'not allowlisted'}`); continue; }
  console.log(`${granting ? 'GRANT' : 'REVOKE'} ${describe(row)}`);
  if (!confirm) { console.log('  (dry run; add --confirm)'); continue; }
  await dynamo.send(new UpdateItemCommand({ TableName: tableName, Key: marshall({ pk: row.pk }),
    ConditionExpression: 'accessVersion = :v AND #s = :false AND reviewStatus = :approved',
    UpdateExpression: granting
      ? 'SET websiteAllowlist = :on, websiteAllowlistAt = :at, websiteAllowlistReason = :reason, websiteAllowlistActor = :actor, updatedAt = :now'
      : 'SET websiteAllowlist = :off, websiteAllowlistRevokedAt = :at, websiteAllowlistReason = :reason, websiteAllowlistActor = :actor, accessVersion = :next, updatedAt = :now',
    ExpressionAttributeNames: { '#s': 'suspended' },
    ExpressionAttributeValues: marshall({ ':v': row.accessVersion, ':false': false, ':approved': 'approved', ':at': now, ':reason': reason,
      ':actor': actor, ':now': Date.now(), ...(granting ? { ':on': true } : { ':off': false, ':next': row.accessVersion + 1 }) }) }));
  console.log(`  done`);
}
