import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('only the intended join route family is explicitly public', async () => {
  const gate = await read('config/aws/edge-gate/index.mjs');
  assert.match(gate, /PUBLIC_EXACT[\s\S]*'\/working-groups\/join'/u);
  assert.match(gate, /PUBLIC_PREFIXES[^\n]*'\/working-groups\/join\/'/u);
  assert.match(gate, /PUBLIC_PREFIXES[^\n]*'\/ui\/'/u);
  assert.doesNotMatch(gate, /'\/working-groups\/'/u);
});

test('the public API is same-origin, cache-disabled and bypasses the member gate', async () => {
  const site = await read('config/aws/site-stack.yaml');
  assert.match(site, /Type: AWS::CloudFormation::Stack[\s\S]*TemplateURL: working-group-interest-stack\.yaml/u);
  assert.match(site, /Id: working-group-interest-api[\s\S]*OriginProtocolPolicy: https-only/u);

  const behavior = site.match(/- PathPattern: '\/api\/working-group-interest\*'[\s\S]*?(?=\n\s*- PathPattern:|\n\s*CustomErrorResponses:)/u)?.[0];
  assert.ok(behavior, 'working-group API cache behavior exists');
  assert.match(behavior, /TargetOriginId: working-group-interest-api/u);
  assert.match(behavior, /4135ea2d-6df8-44a3-9df3-4b5a84be39ad/u);
  assert.doesNotMatch(behavior, /LambdaFunctionAssociations/u);

  const policy = site.match(/WorkingGroupInterestOriginRequestPolicy:[\s\S]*?(?=\n\s{2}\w)/u)?.[0];
  assert.match(policy ?? '', /Headers: \[Content-Type\]/u);
  assert.match(policy ?? '', /CookieBehavior: none/u);
  assert.match(policy ?? '', /QueryStringBehavior: none/u);
});

test('the registration service exposes only two POST routes with bounded capacity', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /RouteKey: POST \/api\/working-group-interest\n/u);
  assert.match(stack, /RouteKey: POST \/api\/working-group-interest\/confirm/u);
  assert.equal((stack.match(/RouteKey:/gu) ?? []).length, 2);
  assert.match(stack, /RequestBodyBoundaryBytes: 16384/u);
  assert.match(stack, /ThrottlingBurstLimit: 10/u);
  assert.match(stack, /ThrottlingRateLimit: 2/u);
  assert.match(stack, /ReservedConcurrentExecutions: 5/u);
  assert.doesNotMatch(stack, /CorsConfiguration/u);
});

test('DynamoDB is on-demand, encrypted, TTL-enabled and protected', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /Type: AWS::DynamoDB::Table[\s\S]*BillingMode: PAY_PER_REQUEST/u);
  assert.match(stack, /SSEEnabled: true/u);
  assert.match(stack, /AttributeName: expiresAt\n\s+Enabled: true/u);
  assert.match(stack, /PointInTimeRecoveryEnabled: true/u);
  assert.match(stack, /DeletionProtectionEnabled: true/u);
});

test('Lambda references runtime SecureString with least-privilege access', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /Default: \/opda\/working-group-interest\/runtime/u);
  assert.match(stack, /CodeUri: working-group-interest\//u);
  assert.match(stack, /Handler: index\.handler/u);
  assert.match(stack, /REGISTRATIONS_TABLE_NAME: !Ref RegistrationsTable/u);
  assert.match(stack, /RUNTIME_CONFIG_PARAMETER_NAME: !Ref RuntimeConfigParameterName/u);
  assert.match(stack, /ssm:GetParameter/u);
  assert.match(stack, /kms:ViaService: !Sub 'ssm\.\$\{AWS::Region\}\.amazonaws\.com'/u);
  for (const action of ['GetItem', 'PutItem', 'UpdateItem', 'DeleteItem']) {
    assert.match(stack, new RegExp(`dynamodb:${action}`, 'u'));
  }
  assert.doesNotMatch(stack, /dynamodb:\*/u);
  assert.doesNotMatch(stack, /Type: AWS::SSM::Parameter/u);
  assert.doesNotMatch(stack, /emailHmacSecret|turnstileSecret|postmarkServerToken/u);
});

test('CI packages the regional Lambda and nested template before site deployment', async () => {
  const workflow = await read('.github/workflows/infra.yml');
  assert.match(workflow, /Deploy artifacts stack \(eu-west-2\)[\s\S]*--region eu-west-2/u);
  assert.match(workflow, /npm ci --omit=dev --ignore-scripts[\s\S]*--prefix config\/aws\/working-group-interest/u);
  assert.match(workflow, /cloudformation package --region eu-west-2[\s\S]*config\/aws\/site-stack\.yaml/u);
  assert.match(workflow, /--template-file \/tmp\/site-packaged\.yaml/u);
  assert.match(workflow, /CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND/u);
});

test('site deployment fails closed when the public Turnstile site key is absent', async () => {
  const workflow = await read('.github/workflows/deploy-aws.yml');
  assert.match(workflow, /PUBLIC_TURNSTILE_SITE_KEY: \$\{\{ vars\.OPDA_TURNSTILE_SITE_KEY \}\}/u);
  assert.match(workflow, /if \[ -z "\$PUBLIC_TURNSTILE_SITE_KEY" \]/u);
});
