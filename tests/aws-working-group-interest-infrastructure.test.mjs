import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the CloudFront site is public without a viewer-request authentication gate', async () => {
  const [site, edge, workflow] = await Promise.all([
    read('config/aws/site-stack.yaml'),
    read('config/aws/edge-stack.yaml'),
    read('.github/workflows/infra.yml'),
  ]);

  assert.doesNotMatch(site, /LambdaFunctionAssociations|GateFunctionVersionArn|GateConfigParameter|\/opda\/gate\/config/u);
  assert.doesNotMatch(edge, /AWS::Serverless::Function|GateFunction(?:Role|VersionArn)?|CodeUri:\s*edge-gate\//u);
  assert.doesNotMatch(workflow, /GateFunctionVersionArn|OPDA_AUTH0_CLIENT_ID|members\.txt|edge-packaged/u);
  await assert.rejects(
    access(new URL('../config/aws/edge-gate/index.mjs', import.meta.url)),
    { code: 'ENOENT' },
  );
});

test('the static origin resolves Astro directory builds at clean public URLs', async () => {
  const site = await read('config/aws/site-stack.yaml');
  const rewrite = site.match(/CleanUrlRewriteFunction:[\s\S]*?(?=\n\s{2}Distribution:)/u)?.[0];
  const defaultBehavior = site.match(/DefaultCacheBehavior:[\s\S]*?(?=\n\s{8}CacheBehaviors:)/u)?.[0];

  assert.ok(rewrite, 'clean-URL CloudFront Function exists');
  assert.match(rewrite, /Type: AWS::CloudFront::Function/u);
  assert.match(rewrite, /Runtime: cloudfront-js-2\.0/u);
  assert.match(rewrite, /uri\.charAt\(uri\.length - 1\) === '\/'[\s\S]*uri \+ 'index\.html'/u);
  assert.match(rewrite, /leaf\.indexOf\('\.'\) === -1[\s\S]*uri \+ '\/index\.html'/u);
  assert.ok(defaultBehavior, 'default static-site cache behavior exists');
  assert.match(defaultBehavior, /EventType: viewer-request\n\s+FunctionARN: !GetAtt CleanUrlRewriteFunction\.FunctionARN/u);

  const source = rewrite.match(/FunctionCode: \|\n([\s\S]*)$/u)?.[1]
    .split('\n').map((line) => line.replace(/^ {8}/u, '')).join('\n');
  assert.ok(source, 'clean-URL function source is extractable');
  const handler = Function(`${source}\nreturn handler;`)();
  for (const [uri, expected] of [
    ['/', '/index.html'],
    ['/join', '/join/index.html'],
    ['/join/', '/join/index.html'],
    ['/join/privacy', '/join/privacy/index.html'],
    ['/robots.txt', '/robots.txt'],
    ['/_astro/app.js', '/_astro/app.js'],
  ]) {
    assert.equal(handler({ request: { uri } }).uri, expected, uri);
  }
});

test('the public API remains same-origin and cache-disabled without the retired gate', async () => {
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

test('the registration service exposes one POST route with bounded capacity', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /RouteKey: POST \/api\/working-group-interest\n/u);
  assert.equal((stack.match(/RouteKey:/gu) ?? []).length, 1);
  assert.match(stack, /RequestBodyBoundaryBytes: 16384/u);
  assert.match(stack, /ThrottlingBurstLimit: 10/u);
  assert.match(stack, /ThrottlingRateLimit: 2/u);
  assert.match(stack, /ReservedConcurrentExecutions: 5/u);
  assert.doesNotMatch(stack, /CorsConfiguration/u);
  assert.doesNotMatch(stack, /AWS::ApiGatewayV2::DomainName|AWS::ApiGatewayV2::ApiMapping/u);
});

test('DynamoDB is on-demand, encrypted, TTL-enabled and protected', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /Type: AWS::DynamoDB::Table[\s\S]*BillingMode: PAY_PER_REQUEST/u);
  assert.match(stack, /SSEEnabled: true/u);
  assert.match(stack, /AttributeName: expiresAt\n\s+Enabled: true/u);
  assert.match(stack, /PointInTimeRecoveryEnabled: true/u);
  assert.match(stack, /DeletionProtectionEnabled: true/u);
});

test('Lambda has only the table write access needed by the form', async () => {
  const stack = await read('config/aws/working-group-interest-stack.yaml');
  assert.match(stack, /CodeUri: working-group-interest\//u);
  assert.match(stack, /Handler: index\.handler/u);
  assert.match(stack, /REGISTRATIONS_TABLE_NAME: !Ref RegistrationsTable/u);
  assert.match(stack, /Action: \[dynamodb:PutItem\]/u);
  assert.doesNotMatch(stack, /dynamodb:(?:GetItem|UpdateItem|DeleteItem)/u);
  assert.doesNotMatch(stack, /dynamodb:\*/u);
  assert.doesNotMatch(stack, /ssm:|kms:Decrypt|RUNTIME_CONFIG|Postmark|Turnstile/u);
});

test('CI packages the regional Lambda and nested template before site deployment', async () => {
  const workflow = await read('.github/workflows/infra.yml');
  assert.match(workflow, /Deploy artifacts stack \(eu-west-2\)[\s\S]*--region eu-west-2/u);
  assert.doesNotMatch(workflow, /npm (?:ci|install)[^\n]*working-group-interest/u);
  assert.match(workflow, /cloudformation package --region eu-west-2[\s\S]*config\/aws\/site-stack\.yaml/u);
  assert.match(workflow, /--template-file \/tmp\/site-packaged\.yaml/u);
  assert.match(workflow, /CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND/u);
});

test('deployment has no external abuse-control or runtime-secret dependency', async () => {
  const [infra, deploy, edge, site] = await Promise.all([
    read('.github/workflows/infra.yml'), read('.github/workflows/deploy-aws.yml'),
    read('config/aws/edge-stack.yaml'), read('config/aws/site-stack.yaml'),
  ]);
  assert.doesNotMatch(`${infra}\n${deploy}\n${edge}\n${site}`, /Turnstile|TURNSTILE|WAFv2|WebACL|WorkingGroupInterestWebAcl/u);
});
