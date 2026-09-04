import { createHash } from 'node:crypto';
import {
  CONSENT_TEXT,
  SUBSCRIPTION_RETENTION_SECONDS,
  isPlausibleHumanSubmission,
  validateSubscription,
} from './domain.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const BASE_HEADERS = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...BASE_HEADERS, 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function text(statusCode, message) {
  return {
    statusCode,
    headers: { ...BASE_HEADERS, 'content-type': 'text/plain; charset=utf-8' },
    body: message,
  };
}

function redirect(location) {
  return { statusCode: 303, headers: { ...BASE_HEADERS, location }, body: '' };
}

function accepted(format) {
  return format === 'form'
    ? redirect('/subscribe/received')
    : json(201, { ok: true, state: 'received' });
}

function rejected(format, statusCode, body) {
  if (format === 'form' && statusCode === 400) return redirect('/subscribe/check-details');
  return format === 'form' ? text(statusCode, body.message) : json(statusCode, body);
}

function routeOf(event) {
  return event?.routeKey ?? `${event?.requestContext?.http?.method ?? ''} ${event?.rawPath ?? ''}`.trim();
}

function contentTypeOf(event) {
  const headers = event?.headers ?? {};
  return String(headers['content-type'] ?? headers['Content-Type'] ?? '').toLowerCase();
}

function formPayload(body) {
  const payload = {};
  for (const [key, value] of new URLSearchParams(body)) {
    if (key === 'workingGroups') {
      payload.workingGroups ??= [];
      if (Array.isArray(payload.workingGroups)) payload.workingGroups.push(value);
    } else if (Object.hasOwn(payload, key)) {
      payload[key] = [payload[key], value];
    } else {
      payload[key] = value;
    }
  }
  payload.consent = payload.consent === 'true';
  return payload;
}

function requestPayload(event) {
  const contentType = contentTypeOf(event);
  const format = /^application\/json(?:\s*;|$)/u.test(contentType)
    ? 'json'
    : /^application\/x-www-form-urlencoded(?:\s*;|$)/u.test(contentType)
      ? 'form'
      : null;
  if (!format) {
    return { error: json(415, { ok: false, message: 'Use JSON or form-encoded data.' }) };
  }

  const encoded = String(event?.body ?? '');
  const bytes = event?.isBase64Encoded ? Buffer.from(encoded, 'base64') : Buffer.from(encoded);
  if (bytes.length > MAX_BODY_BYTES) {
    return { error: rejected(format, 413, { ok: false, message: 'The submission is too large.' }) };
  }

  try {
    const body = bytes.toString('utf8');
    return { format, value: format === 'json' ? JSON.parse(body) : formPayload(body) };
  } catch {
    return { error: rejected(format, 400, { ok: false, message: 'The submission is invalid.' }) };
  }
}

async function loadAws() {
  const { DynamoDBClient, PutItemCommand } = await import('@aws-sdk/client-dynamodb');
  return { DynamoDBClient, PutItemCommand };
}

let servicesPromise;
async function services() {
  servicesPromise ??= loadAws().then((aws) => ({ aws, dynamodb: new aws.DynamoDBClient({}) }));
  return servicesPromise;
}

function stringList(values) {
  return { L: values.map((value) => ({ S: value })) };
}

export function subscriptionPutInput(record, tableName) {
  return {
    TableName: tableName,
    Item: {
      subscriberId: { S: record.subscriberId },
      fullName: { S: record.fullName },
      email: { S: record.email },
      organisation: { S: record.organisation },
      role: { S: record.role },
      workingGroups: stringList(record.workingGroups),
      source: { S: record.source },
      consent: { BOOL: true },
      consentText: { S: record.consentText },
      privacyNoticeVersion: { S: record.privacyNoticeVersion },
      status: { S: 'subscribed' },
      createdAt: { N: String(record.createdAt) },
      expiresAt: { N: String(record.expiresAt) },
    },
  };
}

async function defaultStoreSubscription(record) {
  const { aws, dynamodb } = await services();
  await dynamodb.send(new aws.PutItemCommand(
    subscriptionPutInput(record, process.env.SUBSCRIPTIONS_TABLE_NAME),
  ));
}

const defaultDependencies = {
  now: () => Date.now(),
  subscriberId: (email) => createHash('sha256').update(email).digest('hex'),
  storeSubscription: defaultStoreSubscription,
};

export function createHandler(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async function newsletterSubscriptionHandler(event) {
    const route = routeOf(event);
    if (route !== 'POST /api/newsletter-subscription') {
      return route.startsWith('POST ')
        ? json(404, { ok: false, message: 'The requested operation does not exist.' })
        : json(405, { ok: false, message: 'Use POST for this operation.' });
    }

    const parsed = requestPayload(event);
    if (parsed.error) return parsed.error;
    const validation = validateSubscription(parsed.value);
    if (!validation.ok) {
      return rejected(parsed.format, 400, { ok: false, errors: validation.errors, message: 'Check the information you entered.' });
    }

    const now = dependencies.now();
    if (!isPlausibleHumanSubmission(validation.value, now)) return accepted(parsed.format);
    const record = {
      subscriberId: dependencies.subscriberId(validation.value.email),
      fullName: validation.value.fullName,
      email: validation.value.email,
      organisation: validation.value.organisation,
      role: validation.value.role,
      workingGroups: validation.value.workingGroups,
      source: validation.value.source,
      consentText: CONSENT_TEXT,
      privacyNoticeVersion: validation.value.privacyNoticeVersion,
      createdAt: now,
      expiresAt: Math.floor(now / 1000) + SUBSCRIPTION_RETENTION_SECONDS,
    };

    try {
      await dependencies.storeSubscription(record);
      return accepted(parsed.format);
    } catch {
      return rejected(parsed.format, 503, {
        ok: false,
        message: 'Subscription is temporarily unavailable. Please try again shortly.',
      });
    }
  };
}

export const handler = createHandler();
