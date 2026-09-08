#!/usr/bin/env node
// Scoped operator CLI. Credentials travel only through memory/stdin and Secrets Manager.
import { execFileSync } from 'node:child_process';
import { APP_SCOPES, HubSpotAdminError, verifyPrivateApp, readSchemaPreflight, createMissingProperties } from '../config/aws/hubspot-participation/admin.mjs';

const usage = 'Usage: node scripts/hubspot-participation-admin.mjs <store-token|preflight|apply-schema> <bridge|bootstrap> <portal-id> <app-id> [--confirm-schema]';
const [action, role, portalArg, appArg, confirmation, ...extra] = process.argv.slice(2);
const portalId = Number(portalArg);
const appId = Number(appArg);
if (!['store-token', 'preflight', 'apply-schema'].includes(action) || !Object.hasOwn(APP_SCOPES, role)
  || ![portalId, appId].every((n) => Number.isSafeInteger(n) && n > 0) || extra.length
  || (confirmation && confirmation !== '--confirm-schema')
  || (action === 'apply-schema' && (role !== 'bootstrap' || confirmation !== '--confirm-schema'))) {
  console.error(usage);
  process.exit(1);
}
const secretName = `opda/hubspot/${role === 'bridge' ? 'participant-crm-bridge' : 'participation-schema-bootstrap'}`;
const expected = { portalId, appId, scopes: APP_SCOPES[role] };
const aws = (args, input) => {
  try {
    return JSON.parse(execFileSync('aws', [...args, '--profile', 'opda', '--region', 'eu-west-2', '--output', 'json', '--no-cli-pager'], {
      input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30000,
    }));
  } catch {
    // Never print raw AWS errors: SDK/CLI failures may include submitted values.
    throw new HubSpotAdminError('AWS operation failed; no credential or raw response has been printed');
  }
};

try {
  const identity = aws(['sts', 'get-caller-identity']);
  if (identity.Account !== '355653384628') throw new HubSpotAdminError('Unexpected AWS account');
  let token;
  if (action === 'store-token') {
    // Explicit operator action: copy the intended app token in OPDA Chrome immediately before running.
    token = execFileSync('pbpaste', [], { encoding: 'utf8', maxBuffer: 4096 }).trim();
  } else {
    const stored = JSON.parse(aws(['secretsmanager', 'get-secret-value', '--secret-id', secretName]).SecretString);
    if (stored.portalId !== portalId || stored.appId !== appId || stored.role !== role) {
      throw new HubSpotAdminError('Stored credential metadata does not match the requested app');
    }
    token = stored.accessToken;
  }
  if (typeof token !== 'string' || !/^pat-[a-z0-9-]{20,200}$/i.test(token)) {
    throw new HubSpotAdminError('No valid private-app token found; nothing was stored');
  }
  const makeApi = (accessToken) => async (path, options = {}) => {
    const isInfo = path === '/oauth/v2/private-apps/get/access-token-info';
    if (!isInfo && !path.startsWith('/crm/v3/')) throw new HubSpotAdminError('Unsupported HubSpot endpoint');
    let response;
    try {
      response = await fetch(`https://api.hubapi.com${path}`, {
        method: isInfo ? 'POST' : options.method || 'GET', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: isInfo ? JSON.stringify({ tokenKey: accessToken }) : options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new HubSpotAdminError('HubSpot network request failed; no credential or response has been printed');
    }
    if (!response.ok) throw new HubSpotAdminError(`HubSpot HTTP ${response.status} for ${path}`);
    return response.json();
  };
  const api = makeApi(token);
  const verified = await verifyPrivateApp(api, expected);
  let limitsApi = api;
  if (action !== 'store-token' && role === 'bootstrap') {
    // Limits tracking requires object-read scope. Reuse the existing bridge for
    // this read only; do not broaden the temporary schema credential's access.
    const bridge = JSON.parse(aws(['secretsmanager', 'get-secret-value', '--secret-id', 'opda/hubspot/participant-crm-bridge']).SecretString);
    if (bridge.portalId !== portalId || bridge.role !== 'bridge' || !Number.isSafeInteger(bridge.appId)) {
      throw new HubSpotAdminError('Limits-reader credential belongs to an unexpected portal or app');
    }
    const bridgeApi = makeApi(bridge.accessToken);
    await verifyPrivateApp(bridgeApi, { portalId, appId: bridge.appId, scopes: APP_SCOPES.bridge });
    limitsApi = (path) => {
      if (path !== '/crm/v3/limits/custom-properties') throw new HubSpotAdminError('Unsupported limits endpoint');
      return bridgeApi(path);
    };
  }
  if (action === 'store-token') {
    const created = aws(['secretsmanager', 'create-secret', '--name', secretName,
      '--description', `OPDA HubSpot ${role} credential. ADR-0084. ${role === 'bootstrap' ? 'Revoke after schema setup.' : 'No approval or login authority.'}`,
      '--secret-string', 'file:///dev/stdin', '--tags', 'Key=Project,Value=opda', 'Key=Purpose,Value=hubspot-participation'],
    JSON.stringify({ ...verified, role, accessToken: token }));
    const check = JSON.parse(aws(['secretsmanager', 'get-secret-value', '--secret-id', secretName]).SecretString);
    if (check.accessToken !== token || check.portalId !== portalId || check.appId !== appId) {
      throw new HubSpotAdminError('Secret read-back verification failed');
    }
    // Remove only this copied token, never unrelated clipboard content.
    if (execFileSync('pbpaste', [], { encoding: 'utf8' }).trim() === token) execFileSync('pbcopy', [], { input: '' });
    console.log(JSON.stringify({ ...verified, secretName: created.Name, storedAndReadBack: true }, null, 2));
  } else if (action === 'preflight') {
    const result = await readSchemaPreflight(api, limitsApi);
    const { propertiesToCreate, ...summary } = result;
    console.log(JSON.stringify({ ...verified, ...summary }, null, 2));
    if (!result.ready) process.exitCode = 2;
  } else {
    console.log(JSON.stringify({ ...verified, ...await createMissingProperties(api, limitsApi) }, null, 2));
  }
} catch (error) {
  console.error(error instanceof HubSpotAdminError ? error.message : 'HubSpot administration failed; no credential or raw response has been printed');
  process.exitCode = 1;
}
