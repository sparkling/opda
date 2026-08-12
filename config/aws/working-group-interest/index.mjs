import {
  PENDING_RETENTION_SECONDS,
  VERIFIED_RETENTION_SECONDS,
  VERIFICATION_TTL_MS,
  createVerification,
  isPlausibleHumanSubmission,
  parseVerificationToken,
  publicWorkingGroupName,
  registrationKey,
  tokenHashesMatch,
  validateRegistration,
} from './domain.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
};

const genericRegistrationResponse = () => json(202, {
  ok: true,
  state: 'verification-required',
  message: 'If the registration can be progressed, a verification message will be sent.',
});

function json(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function routeOf(event) {
  return event?.routeKey ?? `${event?.requestContext?.http?.method ?? ''} ${event?.rawPath ?? ''}`.trim();
}

function requestBody(event) {
  const encoded = String(event?.body ?? '');
  const bytes = event?.isBase64Encoded ? Buffer.from(encoded, 'base64') : Buffer.from(encoded);
  if (bytes.length > MAX_BODY_BYTES) return { error: json(413, { ok: false, message: 'The submission is too large.' }) };
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
  const [{ DynamoDBClient, DeleteItemCommand, GetItemCommand, PutItemCommand, UpdateItemCommand },
    { SSMClient, GetParameterCommand }] = await Promise.all([
    import('@aws-sdk/client-dynamodb'),
    import('@aws-sdk/client-ssm'),
  ]);
  return { DynamoDBClient, DeleteItemCommand, GetItemCommand, PutItemCommand, UpdateItemCommand, SSMClient, GetParameterCommand };
}

let servicesPromise;
async function services() {
  if (!servicesPromise) {
    servicesPromise = loadAws().then((aws) => ({
      aws,
      dynamodb: new aws.DynamoDBClient({}),
      ssm: new aws.SSMClient({}),
    }));
  }
  return servicesPromise;
}

let configPromise;
async function defaultGetConfig() {
  if (!configPromise) {
    configPromise = services().then(async ({ aws, ssm }) => {
      const response = await ssm.send(new aws.GetParameterCommand({
        Name: process.env.RUNTIME_CONFIG_PARAMETER_NAME,
        WithDecryption: true,
      }));
      const value = JSON.parse(response.Parameter?.Value ?? '{}');
      for (const key of ['emailHmacSecret', 'turnstileSecret', 'postmarkServerToken', 'postmarkFrom', 'postmarkVerificationTemplateAlias']) {
        if (!value[key]) throw new Error(`Runtime configuration is missing ${key}`);
      }
      return { siteOrigin: 'https://opda.org.uk', ...value };
    }).catch((error) => {
      configPromise = null;
      throw error;
    });
  }
  return configPromise;
}

function stringList(values) {
  return { L: values.map((value) => ({ S: value })) };
}

function itemFromRegistration(record) {
  return {
    registrationKey: { S: record.registrationKey },
    fullName: { S: record.fullName },
    email: { S: record.email },
    organisation: { S: record.organisation },
    role: { S: record.role },
    workingGroups: stringList(record.workingGroups),
    contributions: stringList(record.contributions),
    relevantPerspective: { S: record.relevantPerspective },
    privacyNoticeVersion: { S: record.privacyNoticeVersion },
    status: { S: record.status },
    createdAt: { N: String(record.createdAt) },
    updatedAt: { N: String(record.updatedAt) },
    verificationTokenHash: { S: record.verificationTokenHash },
    verificationExpiresAt: { N: String(record.verificationExpiresAt) },
    expiresAt: { N: String(record.expiresAt) },
  };
}

export function pendingPutInput(record, tableName) {
  return {
    TableName: tableName,
    Item: itemFromRegistration(record),
    // DynamoDB TTL deletion is asynchronous. Treat an application-expired
    // row as absent immediately and atomically replace it on re-registration.
    ConditionExpression: 'attribute_not_exists(registrationKey) OR expiresAt < :nowEpoch',
    ExpressionAttributeValues: {
      ':nowEpoch': { N: String(Math.floor(record.createdAt / 1000)) },
    },
  };
}

function fromItem(item) {
  if (!item) return null;
  return {
    registrationKey: item.registrationKey?.S,
    status: item.status?.S,
    verificationTokenHash: item.verificationTokenHash?.S,
    verificationExpiresAt: Number(item.verificationExpiresAt?.N),
  };
}

function isConditionalFailure(error) {
  return error?.name === 'ConditionalCheckFailedException';
}

async function defaultCreatePending(record) {
  const { aws, dynamodb } = await services();
  try {
    await dynamodb.send(new aws.PutItemCommand({
      ...pendingPutInput(record, process.env.REGISTRATIONS_TABLE_NAME),
    }));
    return true;
  } catch (error) {
    if (isConditionalFailure(error)) return false;
    throw error;
  }
}

async function defaultGetRegistration(registrationId) {
  const { aws, dynamodb } = await services();
  const result = await dynamodb.send(new aws.GetItemCommand({
    TableName: process.env.REGISTRATIONS_TABLE_NAME,
    Key: { registrationKey: { S: registrationId } },
    ConsistentRead: true,
  }));
  return fromItem(result.Item);
}

async function defaultDeletePending(registrationId, tokenHash) {
  const { aws, dynamodb } = await services();
  try {
    await dynamodb.send(new aws.DeleteItemCommand({
      TableName: process.env.REGISTRATIONS_TABLE_NAME,
      Key: { registrationKey: { S: registrationId } },
      ConditionExpression: '#status = :pending AND verificationTokenHash = :hash',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':pending': { S: 'pending-email-verification' }, ':hash': { S: tokenHash } },
    }));
  } catch (error) {
    if (!isConditionalFailure(error)) throw error;
  }
}

async function defaultMarkSent(registrationId, tokenHash, messageId, now) {
  const { aws, dynamodb } = await services();
  await dynamodb.send(new aws.UpdateItemCommand({
    TableName: process.env.REGISTRATIONS_TABLE_NAME,
    Key: { registrationKey: { S: registrationId } },
    ConditionExpression: '#status = :pending AND verificationTokenHash = :hash',
    UpdateExpression: 'SET postmarkMessageId = :messageId, verificationSentAt = :now, updatedAt = :now',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':pending': { S: 'pending-email-verification' },
      ':hash': { S: tokenHash },
      ':messageId': { S: messageId },
      ':now': { N: String(now) },
    },
  }));
}

async function defaultMarkVerified(registrationId, tokenHash, now) {
  const { aws, dynamodb } = await services();
  try {
    await dynamodb.send(new aws.UpdateItemCommand({
      TableName: process.env.REGISTRATIONS_TABLE_NAME,
      Key: { registrationKey: { S: registrationId } },
      ConditionExpression: '#status = :pending AND verificationTokenHash = :hash AND verificationExpiresAt >= :now',
      UpdateExpression: 'SET #status = :verified, verifiedAt = :now, updatedAt = :now, expiresAt = :expires REMOVE verificationTokenHash, verificationExpiresAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':pending': { S: 'pending-email-verification' },
        ':verified': { S: 'verified' },
        ':hash': { S: tokenHash },
        ':now': { N: String(now) },
        ':expires': { N: String(Math.floor(now / 1000) + VERIFIED_RETENTION_SECONDS) },
      },
    }));
    return true;
  } catch (error) {
    if (isConditionalFailure(error)) return false;
    throw error;
  }
}

async function defaultVerifyTurnstile(token, config) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: config.turnstileSecret, response: token }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true
    && result.hostname === process.env.EXPECTED_TURNSTILE_HOSTNAME
    && result.action === process.env.EXPECTED_TURNSTILE_ACTION;
}

export function verificationMessage(record, token, config) {
  const verificationUrl = new URL('/working-groups/join/confirm', config.siteOrigin);
  // Keep the token in the fragment: browsers do not send fragments to
  // CloudFront, S3, access logs or link scanners. The static confirmation
  // page reads it locally and submits it only after the user presses Confirm.
  verificationUrl.hash = new URLSearchParams({ token }).toString();
  return {
    From: config.postmarkFrom,
    To: record.email,
    TemplateAlias: config.postmarkVerificationTemplateAlias,
    TemplateModel: {
      full_name: record.fullName,
      verification_url: verificationUrl.toString(),
      working_groups: record.workingGroups.map(publicWorkingGroupName).join(', '),
      expiry_hours: 24,
    },
    MessageStream: 'outbound',
    Tag: 'working-group-interest-verification',
    TrackOpens: false,
    TrackLinks: 'None',
  };
}

async function defaultSendVerification(record, token, config) {
  const response = await fetch('https://api.postmarkapp.com/email/withTemplate', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-postmark-server-token': config.postmarkServerToken,
    },
    body: JSON.stringify(verificationMessage(record, token, config)),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ErrorCode !== 0 || !result.MessageID) {
    const error = new Error('Verification email was not accepted');
    // Postmark returned a definite response, so no message was accepted and
    // this reservation can safely be released for a later retry. Network
    // errors are ambiguous and deliberately do not carry this marker.
    error.retrySafe = true;
    throw error;
  }
  return result.MessageID;
}

const defaultDependencies = {
  now: () => Date.now(),
  getConfig: defaultGetConfig,
  createPending: defaultCreatePending,
  getRegistration: defaultGetRegistration,
  deletePending: defaultDeletePending,
  markSent: defaultMarkSent,
  markVerified: defaultMarkVerified,
  verifyTurnstile: defaultVerifyTurnstile,
  sendVerification: defaultSendVerification,
};

export function createHandler(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };
  return async function workingGroupInterestHandler(event) {
    const route = routeOf(event);
    if (!route.startsWith('POST ')) return json(405, { ok: false, message: 'Use POST for this operation.' });
    if (!hasJsonContentType(event)) return json(415, { ok: false, message: 'Use application/json.' });
    const parsed = requestBody(event);
    if (parsed.error) return parsed.error;

    if (route === 'POST /api/working-group-interest') {
      const validation = validateRegistration(parsed.value);
      if (!validation.ok) return json(400, { ok: false, errors: validation.errors });
      const now = dependencies.now();
      if (!isPlausibleHumanSubmission(validation.value, now)) return genericRegistrationResponse();

      try {
        const config = await dependencies.getConfig();
        if (!(await dependencies.verifyTurnstile(validation.value.turnstileToken, config))) {
          return json(400, { ok: false, errors: { turnstileToken: 'The anti-spam check could not be verified. Try again.' } });
        }
        const id = registrationKey(validation.value.email, config.emailHmacSecret);
        const verification = createVerification(id);
        const record = {
          registrationKey: id,
          fullName: validation.value.fullName,
          email: validation.value.email,
          organisation: validation.value.organisation,
          role: validation.value.role,
          workingGroups: validation.value.workingGroups,
          contributions: validation.value.contributions,
          relevantPerspective: validation.value.relevantPerspective,
          privacyNoticeVersion: validation.value.privacyNoticeVersion,
          status: 'pending-email-verification',
          createdAt: now,
          updatedAt: now,
          verificationTokenHash: verification.tokenHash,
          verificationExpiresAt: now + VERIFICATION_TTL_MS,
          expiresAt: Math.floor(now / 1000) + PENDING_RETENTION_SECONDS,
        };
        if (!(await dependencies.createPending(record))) return genericRegistrationResponse();
        let messageId;
        try {
          messageId = await dependencies.sendVerification(record, verification.token, config);
        } catch (error) {
          // A timeout may happen after Postmark has accepted the message. Keep
          // the conditional reservation in that ambiguous case so a repeat
          // submission cannot create an email storm. Only a definite provider
          // rejection is safe to release.
          if (error?.retrySafe === true) {
            await dependencies.deletePending(id, verification.tokenHash);
          }
          return json(503, { ok: false, message: 'We could not send the verification message. Please try again shortly.' });
        }
        // If this persistence step fails, keep the pending reservation. The
        // email has already been accepted, so deleting would permit a duplicate.
        try {
          await dependencies.markSent(id, verification.tokenHash, messageId, now);
        } catch {
          return json(503, { ok: false, message: 'We could not complete registration. Please use the verification email if it arrives.' });
        }
        return genericRegistrationResponse();
      } catch {
        return json(503, { ok: false, message: 'Registration is temporarily unavailable. Please try again shortly.' });
      }
    }

    if (route === 'POST /api/working-group-interest/confirm') {
      const parsedToken = parseVerificationToken(parsed.value?.token);
      if (!parsedToken || Object.keys(parsed.value ?? {}).some((key) => key !== 'token')) {
        return json(400, { ok: false, message: 'This verification link is invalid or has expired.' });
      }
      try {
        const record = await dependencies.getRegistration(parsedToken.registrationId);
        const now = dependencies.now();
        if (!record || record.status !== 'pending-email-verification'
          || record.verificationExpiresAt < now
          || !tokenHashesMatch(record.verificationTokenHash, parsedToken.tokenHash)
          || !(await dependencies.markVerified(parsedToken.registrationId, parsedToken.tokenHash, now))) {
          return json(400, { ok: false, message: 'This verification link is invalid or has expired.' });
        }
        return json(200, { ok: true, state: 'verified' });
      } catch {
        return json(503, { ok: false, message: 'Verification is temporarily unavailable. Please try again shortly.' });
      }
    }

    return json(404, { ok: false, message: 'The requested operation does not exist.' });
  };
}

export const handler = createHandler();
