import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const block = (text, name) => {
  const found = text.match(new RegExp(`^  ${name}:\\n[\\s\\S]*?(?=^  [A-Za-z][A-Za-z0-9]*:|^Outputs:|$(?![\\s\\S]))`, 'm'))?.[0];
  assert.ok(found, `${name} exists`);
  return found;
};

test('auth HTTP API exposes only the exact workspace controller routes', async () => {
  const stack = await read('config/aws/auth-session-stack.yaml');
  assert.deepEqual([...stack.matchAll(/RouteKey: (GET|POST) \/_auth\/[^\n]+/gu)].map(match => match[0]), [
    'RouteKey: GET /_auth/login',
    'RouteKey: GET /_auth/callback',
    'RouteKey: GET /_auth/me',
    'RouteKey: GET /_auth/logout',
    'RouteKey: GET /_auth/workspace',
    'RouteKey: POST /_auth/workspace',
    'RouteKey: GET /_auth/workspace/continue',
  ]);
  assert.match(stack, /function:opda-workspace-entry'/u);
  assert.match(stack, /WorkspaceInvokePermission:[\s\S]*_auth\/workspace'/u);
  assert.match(stack, /WorkspaceContinueInvokePermission:[\s\S]*_auth\/workspace\/continue'/u);
});

test('CloudFront forwards workspace POST state uncached and the edge gate has no broad auth bypass', async () => {
  const site = await read('config/aws/site-stack.yaml');
  const policy = block(site, 'AuthSessionOriginRequestPolicy');
  const authBehavior = site.match(/- PathPattern: '\/_auth\/\*'[\s\S]*?(?=\n          - PathPattern:)/u)?.[0];
  assert.ok(authBehavior);
  assert.match(authBehavior, /AllowedMethods: \[GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE\]/u);
  assert.match(authBehavior, /CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad/u);
  assert.match(policy, /Headers: \[Content-Type, Origin, Sec-Fetch-Site\]/u);
  assert.match(policy, /CookieBehavior: all/u);
  assert.match(policy, /QueryStringBehavior: all/u);
  const edge = await read('config/aws/edge-gate/index.mjs');
  assert.match(edge, /uri === '\/_auth\/workspace'[\s\S]*method === 'POST'/u);
  assert.match(edge, /WORKSPACE_GET_PATHS/u);
  assert.doesNotMatch(edge, /uri\.startsWith\('\/_auth\//u);
});

test('workspace entry has bounded identity reads and encrypted receipt-lease writes only', async () => {
  const stack = await read('config/aws/approval-onboarding-stack.yaml');
  const role = block(stack, 'WorkspaceRole'), entry = block(stack, 'WorkspaceEntry');
  assert.match(entry, /CodeUri: \.\/onboarding-bundle\//u);
  assert.match(entry, /SESSIONS_TABLE_NAME:[\s\S]*SessionsTableName/u);
  assert.doesNotMatch(entry, /POSTMARK|QUEUE|FunctionUrlConfig|AWS::ApiGateway/iu);
  assert.match(role, /Action: dynamodb:GetItem/u);
  assert.match(role, /Action: dynamodb:PutItem/u);
  assert.match(role, /CRM#ONBOARDING_STATE#\*/u);
  assert.doesNotMatch(role, /dynamodb:(?:Scan|Query|UpdateItem|DeleteItem)|sqs:|postmark\/|cognito-idp:/iu);
  assert.match(role, /secretsmanager:GetSecretValue/u);
  assert.match(role, /opda\/microsoft\/participation-onboarding-nmTdmF/u);
});

test('CI verifies the deployed private handler without a real session or side effects', async () => {
  const workflow = await read('.github/workflows/infra.yml');
  assert.match(workflow, /name: Verify deployed workspace boundary without participant effects/u);
  assert.match(workflow, /lambda invoke --region eu-west-2 --function-name opda-workspace-entry/u);
  assert.match(workflow, /"sessionToken":""/u);
  assert.match(workflow, /assert\.deepEqual[\s\S]*status:'denied'/u);
});
