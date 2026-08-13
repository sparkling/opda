import { randomUUID } from 'node:crypto';
import {
  REGISTRATION_RETENTION_SECONDS,
  isPlausibleHumanSubmission,
  validateRegistration,
} from './domain.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
};

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

const acceptedResponse = () => json(201, {
  ok: true,
  state: 'received',
  message: 'Your expression of interest has been received.',
});

function routeOf(event) {
  return event?.routeKey ?? `${event?.requestContext?.http?.method ?? ''} ${event?.rawPath ?? ''}`.trim();
}

function requestBody(event) {
  const encoded = String(event?.body ?? '');
  const bytes = event?.isBase64Encoded ? Buffer.from(encoded, 'base64') : Buffer.from(encoded);
  if (bytes.length > MAX_BODY_BYTES) {
    return { error: json(413, { ok: false, message: 'The submission is too large.' }) };
  }
  try {
    return { value: JSON.parse(bytes.toString('utf8')) };
  } catch {
    return { error: json(400, { ok: false, message: 'The submission must contain valid JSON.' }) };
  }
}

function hasJsonContentType(event) {
  const headers = event?.headers ?? {};
  const contentType = headers['content-type'] ?? headers['Content-Type'] ?? '';
  return /^application\/json(?:\s*;|$)/iu.test(contentType);
}

async function loadAws() {
  const { DynamoDBClient, PutItemCommand } = await import('@aws-sdk/client-dynamodb');
  return { DynamoDBClient, PutItemCommand };
}

let servicesPromise;
async function services() {
  if (!servicesPromise) {
    servicesPromise = loadAws().then((aws) => ({ aws, dynamodb: new aws.DynamoDBClient({}) }));
  }
  return servicesPromise;
}

function stringList(values) {
  return { L: values.map((value) => ({ S: value })) };
}

function itemFromRegistration(record) {
  return {
    registrationId: { S: record.registrationId },
    fullName: { S: record.fullName },
    email: { S: record.email },
    organisation: { S: record.organisation },
    role: { S: record.role },
    workingGroups: stringList(record.workingGroups),
    contributions: stringList(record.contributions),
    relevantPerspective: { S: record.relevantPerspective },
    acknowledgement: { BOOL: true },
    privacyNoticeVersion: { S: record.privacyNoticeVersion },
    status: { S: 'received' },
    createdAt: { N: String(record.createdAt) },
    expiresAt: { N: String(record.expiresAt) },
  };
}

export function registrationPutInput(record, tableName) {
  return {
    TableName: tableName,
    Item: itemFromRegistration(record),
    ConditionExpression: 'attribute_not_exists(registrationId)',
  };
}

async function defaultStoreRegistration(record) {
  const { aws, dynamodb } = await services();
  await dynamodb.send(new aws.PutItemCommand(
    registrationPutInput(record, process.env.REGISTRATIONS_TABLE_NAME),
  ));
}

const defaultDependencies = {
  now: () => Date.now(),
  newId: () => randomUUID(),
  storeRegistration: defaultStoreRegistration,
};

export function createHandler(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async function workingGroupInterestHandler(event) {
    const route = routeOf(event);
    if (route !== 'POST /api/working-group-interest') {
      return route.startsWith('POST ')
        ? json(404, { ok: false, message: 'The requested operation does not exist.' })
        : json(405, { ok: false, message: 'Use POST for this operation.' });
    }
    if (!hasJsonContentType(event)) return json(415, { ok: false, message: 'Use application/json.' });
    const parsed = requestBody(event);
    if (parsed.error) return parsed.error;

    const validation = validateRegistration(parsed.value);
    if (!validation.ok) return json(400, { ok: false, errors: validation.errors });
    const now = dependencies.now();
    if (!isPlausibleHumanSubmission(validation.value, now)) return acceptedResponse();

    const record = {
      registrationId: dependencies.newId(),
      fullName: validation.value.fullName,
      email: validation.value.email,
      organisation: validation.value.organisation,
      role: validation.value.role,
      workingGroups: validation.value.workingGroups,
      contributions: validation.value.contributions,
      relevantPerspective: validation.value.relevantPerspective,
      privacyNoticeVersion: validation.value.privacyNoticeVersion,
      createdAt: now,
      expiresAt: Math.floor(now / 1000) + REGISTRATION_RETENTION_SECONDS,
    };

    try {
      await dependencies.storeRegistration(record);
      return acceptedResponse();
    } catch {
      return json(503, { ok: false, message: 'Registration is temporarily unavailable. Please try again shortly.' });
    }
  };
}

export const handler = createHandler();
