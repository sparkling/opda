import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the CloudFront site stays public while sign-in is a separate regional service', async () => {
  const [site, edge, workflow] = await Promise.all([
    read('config/aws/site-stack.yaml'),
    read('config/aws/edge-stack.yaml'),
    read('.github/workflows/infra.yml'),
  ]);

  assert.doesNotMatch(site, /LambdaFunctionAssociations|GateFunctionVersionArn|GateConfigParameter|\/opda\/gate\/config/u);
  assert.match(site, /AuthSessionApplication:[\s\S]*TemplateURL: auth-session-stack\.yaml/u);
  assert.doesNotMatch(edge, /AWS::Serverless::Function|GateFunction(?:Role|VersionArn)?|CodeUri:\s*edge-gate\//u);
  assert.doesNotMatch(workflow, /GateFunctionVersionArn|members\.txt|edge-packaged/u);
  assert.match(workflow, /Auth0ClientId="\$\{\{ vars\.OPDA_AUTH0_CLIENT_ID \}\}"/u);
  assert.match(workflow, /MemberEmails="\$\{\{ vars\.OPDA_MEMBER_EMAILS \}\}"/u);
  await assert.rejects(
    access(new URL('../config/aws/edge-gate/index.mjs', import.meta.url)),
    { code: 'ENOENT' },
  );
});

test('the same-origin auth surface forwards cookies and query strings without caching', async () => {
  const site = await read('config/aws/site-stack.yaml');
  assert.match(site, /Id: auth-session-api[\s\S]*OriginProtocolPolicy: https-only/u);

  const behavior = site.match(/- PathPattern: '\/_auth\/\*'[\s\S]*?(?=\n\s*- PathPattern:|\n\s*CustomErrorResponses:)/u)?.[0];
  assert.ok(behavior, 'auth session cache behavior exists');
  assert.match(behavior, /TargetOriginId: auth-session-api/u);
  assert.match(behavior, /AllowedMethods: \[GET, HEAD, OPTIONS\]/u);
  assert.match(behavior, /4135ea2d-6df8-44a3-9df3-4b5a84be39ad/u);
  assert.match(behavior, /OriginRequestPolicyId: !Ref AuthSessionOriginRequestPolicy/u);
  assert.doesNotMatch(behavior, /LambdaFunctionAssociations/u);

  const policy = site.match(/AuthSessionOriginRequestPolicy:[\s\S]*?(?=\n\s{2}\w)/u)?.[0];
  assert.match(policy ?? '', /HeaderBehavior: none/u);
  assert.match(policy ?? '', /CookieBehavior: all/u);
  assert.match(policy ?? '', /QueryStringBehavior: all/u);
});

test('the auth service exposes only the four GET session routes with bounded capacity', async () => {
  const stack = await read('config/aws/auth-session-stack.yaml');
  for (const route of ['login', 'callback', 'me', 'logout']) {
    assert.match(stack, new RegExp(`RouteKey: GET \/_auth\/${route}\\n`, 'u'));
  }
  assert.equal((stack.match(/RouteKey:/gu) ?? []).length, 4);
  assert.match(stack, /CodeUri: auth-session\//u);
  assert.match(stack, /ReservedConcurrentExecutions: 5/u);
  assert.match(stack, /ThrottlingBurstLimit: 20/u);
  assert.match(stack, /ThrottlingRateLimit: 10/u);
  assert.match(stack, /AUTH0_DOMAIN: !Ref Auth0Domain/u);
  assert.match(stack, /AUTH0_CLIENT_ID: !Ref Auth0ClientId/u);
  assert.match(stack, /MEMBER_EMAILS: !Ref MemberEmails/u);
  assert.match(stack, /SITE_ORIGIN: !Sub 'https:\/\/\$\{DomainName\}'/u);
  assert.doesNotMatch(stack, /CLIENT_SECRET|client_secret|AWS::ApiGatewayV2::DomainName|CorsConfiguration/u);
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
  assert.match(workflow, /OPDA_AUTH0_CLIENT_ID/u);
  assert.match(workflow, /OPDA_MEMBER_EMAILS/u);
});

test('deployment has no external abuse-control or runtime-secret dependency', async () => {
  const [infra, deploy, edge, site] = await Promise.all([
    read('.github/workflows/infra.yml'), read('.github/workflows/deploy-aws.yml'),
    read('config/aws/edge-stack.yaml'), read('config/aws/site-stack.yaml'),
  ]);
  assert.doesNotMatch(`${infra}\n${deploy}\n${edge}\n${site}`, /Turnstile|TURNSTILE|WAFv2|WebACL|WorkingGroupInterestWebAcl/u);
});
