#!/usr/bin/env node
/**
 * One-time: rewrite durable signup records into the ADR-0087 vocabulary.
 *
 * The workers do not need this. Both read the old values correctly — the CRM sync
 * recognises in-progress states and treats everything else as settled, and the
 * acknowledgement worker resumes only `sending` and `retry`. This exists so the
 * live table shows one vocabulary rather than two, which is the drift ADR-0087
 * set out to remove.
 *
 *   node scripts/migrate-sync-state-vocabulary.mjs            # dry run
 *   node scripts/migrate-sync-state-vocabulary.mjs --apply
 *
 * Every write is conditional on the revision that was read, so a concurrent worker
 * write aborts this migration rather than overwriting it.
 */
import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';

const TABLE = process.env.PARTICIPANTS_TABLE_NAME ?? 'opda-participants';
const apply = process.argv.includes('--apply');
const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'eu-west-2', maxAttempts: 3 });

const TERMINAL_STATE = { quarantined: 'closed', suppressed: 'closed' };
const CLAIM_STATE = { ...TERMINAL_STATE, held: 'open' };
const REASON = { 'pending-applicant-created': 'contact-created' };
// Pre-ADR-0087 acknowledgement outcomes become one settled state plus the reason.
const ACK_REASON = { accepted: 'accepted', rejected: 'rejected', suppressed: 'suppressed', unknown: 'unknown' };

const decodeValue = v => v.S ?? (v.N !== undefined ? Number(v.N) : v.BOOL ?? (v.NULL ? null : v.L?.map(decodeValue)));
const decode = item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, decodeValue(v)]));
function attribute(value) {
  if (value === null) return { NULL: true };
  if (typeof value === 'string') return { S: value };
  if (typeof value === 'boolean') return { BOOL: value };
  if (Number.isSafeInteger(value)) return { N: String(value) };
  if (Array.isArray(value)) return { L: value.map(attribute) };
  throw new TypeError(`Unsupported attribute: ${typeof value}`);
}
const encode = item => Object.fromEntries(Object.entries(item)
  .filter(([, value]) => value !== undefined).map(([k, v]) => [k, attribute(v)]));

/** Returns the fields that change, or null when the record is already current. */
function planned(record) {
  const { pk, state, reason } = record;
  if (pk.startsWith('SYNC#ACK#')) {
    if (!Object.hasOwn(ACK_REASON, state)) return null;
    return { state: 'done', reason: ACK_REASON[state] };
  }
  const map = pk.startsWith('SYNC#EMAIL#') ? CLAIM_STATE : TERMINAL_STATE;
  const next = {};
  if (Object.hasOwn(map, state)) next.state = map[state];
  if (reason && Object.hasOwn(REASON, reason)) next.reason = REASON[reason];
  return Object.keys(next).length ? next : null;
}

const records = [];
for (let start; ;) {
  const page = await client.send(new ScanCommand({ TableName: TABLE, ExclusiveStartKey: start,
    FilterExpression: 'begins_with(pk, :p)', ExpressionAttributeValues: { ':p': { S: 'SYNC#' } } }));
  records.push(...(page.Items ?? []).map(decode));
  if (!page.LastEvaluatedKey) break;
  start = page.LastEvaluatedKey;
}

let changed = 0;
for (const record of records.sort((a, b) => a.pk.localeCompare(b.pk))) {
  const next = planned(record);
  if (!next) continue;
  changed++;
  const from = `${record.state ?? '-'}/${record.reason ?? '-'}`;
  const to = `${next.state ?? record.state}/${next.reason ?? record.reason ?? '-'}`;
  console.log(`${apply ? 'apply ' : 'would '} ${record.pk}\n         ${from}  ->  ${to}`);
  if (!apply) continue;
  const updated = { ...record, ...next, revision: record.revision + 1 };
  await client.send(new PutItemCommand({ TableName: TABLE, Item: encode(updated),
    ConditionExpression: '#revision = :previous',
    ExpressionAttributeNames: { '#revision': 'revision' },
    ExpressionAttributeValues: { ':previous': attribute(record.revision) } }));
}

console.log(`\n${records.length} SYNC# records scanned; ${changed} ${apply ? 'rewritten' : 'would change'}.`);
if (!apply && changed) console.log('Re-run with --apply to write.');
