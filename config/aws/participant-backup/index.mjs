import { createHash } from 'node:crypto';
import { startRecovery, verifyRecovery } from './recovery.mjs';
import { snapshotContacts, createHubSpotReader } from './hubspot.mjs';

let runtime;
async function dependencies() {
  if (runtime) return runtime;
  const [ddb, s3, secrets, cw] = await Promise.all([
    import('@aws-sdk/client-dynamodb'), import('@aws-sdk/client-s3'),
    import('@aws-sdk/client-secrets-manager'), import('@aws-sdk/client-cloudwatch'),
  ]);
  const db = new ddb.DynamoDBClient({ maxAttempts: 3 }), storage = new s3.S3Client({ maxAttempts: 3 });
  const secretClient = new secrets.SecretsManagerClient({ maxAttempts: 3 });
  const metrics = new cw.CloudWatchClient({ maxAttempts: 3 });
  const config = { bucket: process.env.RECOVERY_BUCKET_NAME, accountId: process.env.ACCOUNT_ID,
    portalId: Number(process.env.HUBSPOT_PORTAL_ID), tables: {
      participants: process.env.PARTICIPANTS_TABLE_ARN, intake: process.env.REGISTRATIONS_TABLE_ARN,
    } };
  const get = async key => {
    if (!key.startsWith('recovery/') || key.includes('..')) throw new Error('Recovery path boundary failed');
    // Prefix-scoped listing detects an absent key without granting bucket-wide ListBucket.
    // GetObject alone returns AccessDenied for absent keys when ListBucket is restricted.
    const listing = await storage.send(new s3.ListObjectsV2Command({ Bucket: config.bucket,
      Prefix: key, MaxKeys: 1, ExpectedBucketOwner: config.accountId }));
    if (listing.Contents?.[0]?.Key !== key) return null;
    let response;
    try {
      response = await storage.send(new s3.GetObjectCommand({ Bucket: config.bucket, Key: key, ExpectedBucketOwner: config.accountId }));
    } catch (error) { if (error.name === 'NoSuchKey') return null; throw new Error('Recovery object unavailable'); }
    if (response.ServerSideEncryption !== 'AES256' || response.ContentLength > 64 * 1024 * 1024) {
      response.Body?.destroy(); throw new Error('Recovery object boundary failed');
    }
    const chunks = []; let size = 0;
    for await (const chunk of response.Body) {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) { response.Body.destroy(); throw new Error('Recovery object too large'); }
      chunks.push(chunk);
    }
    return { bytes: Buffer.concat(chunks), versionId: response.VersionId };
  };
  const put = async (key, value) => {
    const bytes = Buffer.from(JSON.stringify(value));
    if (bytes.length > 64 * 1024 * 1024) throw new Error('Recovery object too large');
    const digest = createHash('sha256').update(bytes).digest();
    const result = await storage.send(new s3.PutObjectCommand({ Bucket: config.bucket, Key: key,
      ExpectedBucketOwner: config.accountId, Body: bytes, ContentType: 'application/json',
      ServerSideEncryption: 'AES256', ChecksumSHA256: digest.toString('base64') }));
    if (!result.VersionId || result.VersionId === 'null') throw new Error('Recovery bucket versioning required');
    return { key, versionId: result.VersionId, sha256: digest.toString('hex'), bytes: bytes.length };
  };
  const deps = {
    now: () => new Date(), get, put,
    recoveryWindow: async TableName => {
      const response = await db.send(new ddb.DescribeContinuousBackupsCommand({ TableName }));
      const window = response.ContinuousBackupsDescription?.PointInTimeRecoveryDescription;
      if (window?.PointInTimeRecoveryStatus !== 'ENABLED') throw new Error('PITR required');
      return { earliest: window.EarliestRestorableDateTime, latest: window.LatestRestorableDateTime };
    },
    startExport: async request => (await db.send(new ddb.ExportTableToPointInTimeCommand(request))).ExportDescription?.ExportArn,
    describeExport: async ExportArn => (await db.send(new ddb.DescribeExportCommand({ ExportArn }))).ExportDescription,
    snapshot: async (ids, prefix) => {
      const secret = await secretClient.send(new secrets.GetSecretValueCommand({ SecretId: process.env.HUBSPOT_BRIDGE_SECRET_ARN }));
      const value = JSON.parse(secret.SecretString);
      if (value.portalId !== config.portalId || value.role !== 'bridge' || value.appId !== 52397854) {
        throw new Error('CRM credential binding mismatch');
      }
      const api = createHubSpotReader({ accessToken: value.accessToken });
      return snapshotContacts({ ids, prefix, portalId: config.portalId, api, put, now: deps.now });
    },
    completed: async timestamp => metrics.send(new cw.PutMetricDataCommand({ Namespace: 'OPDA/ParticipantRecovery',
      MetricData: [{ MetricName: 'CompletedRecovery', Value: 1, Unit: 'Count', Timestamp: new Date(timestamp),
        Dimensions: [{ Name: 'FunctionName', Value: process.env.AWS_LAMBDA_FUNCTION_NAME }] }] })),
  };
  runtime = { config, deps };
  return runtime;
}

export async function handler(event) {
  try {
    const { config, deps } = await dependencies();
    if (!['start', 'verify'].includes(event?.mode)) throw new Error('Unsupported recovery operation');
    if (event.mode === 'start') {
      const result = await startRecovery(config, deps, event.time ?? deps.now().toISOString());
      return { status: result.status };
    }
    // Also finish the prior day's delayed native exports; never wait inside Lambda.
    const today = deps.now().getTime();
    const results = [];
    for (const offset of [0, 86400000]) {
      const day = new Date(today - offset).toISOString().slice(0, 10);
      const result = await verifyRecovery(config, deps, day);
      results.push({ day, status: result.status });
    }
    return { results };
  } catch {
    // Runtime errors and API response bodies can contain PII or tokens. Log none.
    throw new Error('Participant recovery failed; inspect private run status and AWS export status.');
  }
}
