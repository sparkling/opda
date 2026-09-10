import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the restored edge gate shares current approvals and never restores the old email allowlist', async () => {
  const [site, edge, workflow] = await Promise.all([
    read('config/aws/site-stack.yaml'),
    read('config/aws/edge-stack.yaml'),
    read('.github/workflows/infra.yml'),
  ]);

  assert.match(site, /LambdaFunctionAssociations/u);
  assert.doesNotMatch(site, /GateConfigParameter|\/opda\/gate\/config|MemberEmails/u);
  assert.match(site, /AuthSessionApplication:[\s\S]*TemplateURL: auth-session-stack\.yaml/u);
  assert.match(edge, /AutoPublishAlias: live/u);
  assert.match(edge, /CodeUri: ..\/..\/_build\/edge-gate\//u);
  assert.match(edge, /RoleName: opda-session-gate/u);
  assert.match(edge, /FunctionName: opda-session-gate/u);
  assert.match(edge, /log-group:\/aws\/lambda\/\*opda-session-gate\*:\*/u);
  assert.doesNotMatch(edge, /opda-edge-gate|opda-gate/u);
  assert.match(edge, /Action: dynamodb:GetItem/u);
  assert.doesNotMatch(edge, /dynamodb:(?:PutItem|UpdateItem|Scan|Query)|Environment:|ssm:/u);
  assert.doesNotMatch(workflow, /members\.txt/u);
  assert.match(workflow, /--stack-name opda-participant-identity/u);
  assert.doesNotMatch(workflow, /OPDA_AUTH0_CLIENT_ID|OPDA_MEMBER_EMAILS/u);
  assert.match(site, /AllowedPattern: '\^arn:aws:lambda:us-east-1:\[0-9\]\{12\}:function:opda-session-gate:\[0-9\]\+\$'/u);
  assert.doesNotMatch(site, /function:opda-gate:/u);
  assert.ok(workflow.indexOf('name: Deploy comments stack') < workflow.indexOf('name: Deploy site stack'),
    'the origin read-only boundary must deploy before the session cutover');
  assert.ok(workflow.indexOf('name: Deploy versioned gate') < workflow.indexOf('name: Deploy site stack'));
  assert.match(workflow, /GateFunctionVersionArn="\$OPDA_GATE_FUNCTION_ARN"/u);
});

test('the same-origin auth surface forwards cookies and query strings without caching', async () => {
  const site = await read('config/aws/site-stack.yaml');
  assert.match(site, /Id: auth-session-api[\s\S]*OriginProtocolPolicy: https-only/u);

  const behavior = site.match(/- PathPattern: '\/_auth\/\*'[\s\S]*?(?=\n\s*- PathPattern:|\n\s*CustomErrorResponses:)/u)?.[0];
  assert.ok(behavior, 'auth session cache behavior exists');
  assert.match(behavior, /TargetOriginId: auth-session-api/u);
  // CloudFront's POST-capable method set is broad; the edge and HTTP API
  // independently restrict it to the exact authenticated workspace POST.
  assert.match(behavior, /AllowedMethods: \[GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE\]/u);
  assert.match(behavior, /4135ea2d-6df8-44a3-9df3-4b5a84be39ad/u);
  assert.match(behavior, /OriginRequestPolicyId: !Ref AuthSessionOriginRequestPolicy/u);
  assert.match(behavior, /LambdaFunctionAssociations/u);

  const policy = site.match(/AuthSessionOriginRequestPolicy:[\s\S]*?(?=\n\s{2}\w)/u)?.[0];
  assert.match(policy ?? '', /HeaderBehavior: whitelist, Headers: \[Content-Type, Origin, Sec-Fetch-Site\]/u);
  assert.match(policy ?? '', /CookieBehavior: all/u);
  assert.match(policy ?? '', /QueryStringBehavior: all/u);
});

test('private responses use CloudFront security-header fields, not forbidden custom headers', async () => {
  const site = await read('config/aws/site-stack.yaml');
  const policy = site.match(/PrivateResponseHeaders:[\s\S]*?(?=\n\s{2}#|\n\s{2}\w)/u)?.[0];
  assert.ok(policy, 'the browser response policy exists');
  assert.match(policy, /Header: Cache-Control, Value: 'private, no-store, max-age=0', Override: true/u);
  assert.match(policy, /Header: X-Robots-Tag, Value: 'noindex, nofollow, noarchive', Override: true/u);
  assert.match(policy, /SecurityHeadersConfig:\n\s+ContentTypeOptions: \{ Override: true \}\n\s+ReferrerPolicy: \{ ReferrerPolicy: no-referrer, Override: true \}/u);
  assert.doesNotMatch(policy, /Header: (?:Referrer-Policy|X-Content-Type-Options)/u);
});

test('API authorization denials retain their status while S3 missing objects use the static 404 page', async () => {
  const site = await read('config/aws/site-stack.yaml');
  assert.doesNotMatch(site, /ErrorCode: 403/u, 'distribution-wide 403 rewriting hides workspace denial messages');
  assert.match(site, /ErrorCode: 404\n\s+ResponseCode: 404\n\s+ResponsePagePath: \/404\.html/u);
  for (const bucket of ['SiteBucket', 'ResourcesBucket']) {
    const policy = site.match(new RegExp(`  ${bucket}Policy:[\\s\\S]*?(?=\\n  (?:#|[A-Z]))`, 'u'))?.[0];
    assert.ok(policy);
    assert.match(policy, /Principal: \{ Service: cloudfront\.amazonaws\.com \}/u);
    assert.match(policy, /Action: \[s3:GetObject, s3:ListBucket\]/u);
    assert.ok(policy.includes(`- !GetAtt ${bucket}.Arn`));
    assert.ok(policy.includes(`- !Sub '\${${bucket}.Arn}/*'`));
    assert.match(policy, /Condition:\n\s+StringEquals:\n\s+AWS:SourceArn: !Sub 'arn:aws:cloudfront::\$\{AWS::AccountId\}:distribution\/\$\{Distribution\}'/u);
  }
});

test('the auth service exposes session and workspace routes with bounded capacity', async () => {
  const stack = await read('config/aws/auth-session-stack.yaml');
  for (const route of ['login', 'callback', 'me', 'logout']) {
    assert.match(stack, new RegExp(`RouteKey: GET \/_auth\/${route}\\n`, 'u'));
  }
  assert.match(stack, /RouteKey: GET \/_auth\/workspace\n/u);
  assert.match(stack, /RouteKey: POST \/_auth\/workspace\n/u);
  assert.match(stack, /RouteKey: GET \/_auth\/workspace\/continue\n/u);
  assert.equal((stack.match(/RouteKey:/gu) ?? []).length, 7);
  assert.match(stack, /CodeUri: auth-session\//u);
  assert.match(stack, /ReservedConcurrentExecutions: 5/u);
  assert.match(stack, /ThrottlingBurstLimit: 20/u);
  assert.match(stack, /ThrottlingRateLimit: 10/u);
  for (const variable of ['PARTICIPANTS_TABLE_NAME', 'SESSIONS_TABLE_NAME']) {
    assert.match(stack, new RegExp(`${variable}:\\n\\s+Fn::ImportValue:`, 'u'));
  }
  assert.match(stack, /dynamodb:ConditionCheckItem/u);
  assert.match(stack, /OIDC_PROVIDER: auth0/u);
  assert.match(stack, /AUTH0_DOMAIN: !Ref Auth0Domain/u);
  assert.match(stack, /AUTH0_CLIENT_ID: !Ref Auth0ClientId/u);
  assert.doesNotMatch(stack, /MEMBER_EMAILS/u);
  assert.match(stack, /SITE_ORIGIN: !Sub 'https:\/\/\$\{DomainName\}'/u);
  assert.doesNotMatch(stack, /CLIENT_SECRET|client_secret|AWS::ApiGatewayV2::DomainName|CorsConfiguration/u);
});

test('every behavior is gated and the retained emergency fallback remains fail-closed', async () => {
  const site = await read('config/aws/site-stack.yaml');
  const gate = site.match(/DevelopmentBarrierFunction:[\s\S]*?(?=\n\s{2}Distribution:)/u)?.[0];
  assert.ok(gate, 'the development barrier exists');
  assert.match(gate, /Type: AWS::CloudFront::Function/u);
  assert.match(gate, /AutoPublish: true/u);
  assert.match(gate, /Runtime: cloudfront-js-2\.0/u);
  const behaviors = site.match(/DefaultCacheBehavior:[\s\S]*?(?=\n\s{8}CustomErrorResponses:)/u)?.[0];
  assert.ok(behaviors);
  assert.equal((behaviors.match(/TargetOriginId:/gu) ?? []).length, 7);
  assert.equal((behaviors.match(/(?:EventType: viewer-request\n\s+LambdaFunctionARN: !Ref GateFunctionVersionArn|\{ EventType: viewer-request, LambdaFunctionARN: !Ref GateFunctionVersionArn \})/gu) ?? []).length, 7);
  assert.equal((behaviors.match(/ResponseHeadersPolicyId: !Ref PrivateResponseHeaders/gu) ?? []).length, 7);
  assert.match(behaviors, /PathPattern: '\/resources\/'[\s\S]*?TargetOriginId: site-s3[\s\S]*?PathPattern: '\/resources\/\*'[\s\S]*?TargetOriginId: resources-s3/u);
  const source = gate.match(/FunctionCode: \|\n([\s\S]*)$/u)?.[1]
    .split('\n').map((line) => line.replace(/^ {8}/u, '')).join('\n');
  assert.ok(source, 'barrier source is extractable');
  const handler = Function(`${source}\nreturn handler;`)();
  for (const uri of ['/', '/join', '/programme', '/index.html', '/robots.txt', '/sitemap-index.xml',
    '/_astro/app.js', '/data/site-search-index.json', '/resources/model.ttl', '/api/v2/comment',
    '/_auth/login', '/_auth/callback', '/api/working-group-interest', '/api/newsletter-subscription',
    '/%2e%2e/programme', '//programme', '/programme?config']) {
    for (const method of ['GET', 'HEAD', 'POST']) {
      const result = handler({ request: { uri, method, cookies: { '__Host-opda_sid': { value: 'forged' } } } });
      assert.equal(result.statusCode, 503, `${method} ${uri}`);
      assert.equal(result.headers['cache-control'].value, 'no-store, max-age=0');
      assert.match(result.headers['x-robots-tag'].value, /noindex/u);
      assert.match(result.body, /Under development/u);
      assert.doesNotMatch(result.body, /<script|<iframe|https?:\/\//u);
      assert.equal(result.uri, undefined, 'must never return an origin request');
    }
  }
});

test('the registration API configuration stays same-origin and cache-disabled behind containment', async () => {
  const site = await read('config/aws/site-stack.yaml');
  assert.match(site, /Type: AWS::CloudFormation::Stack[\s\S]*TemplateURL: working-group-interest-stack\.yaml/u);
  assert.match(site, /Id: working-group-interest-api[\s\S]*OriginProtocolPolicy: https-only/u);

  const behavior = site.match(/- PathPattern: '\/api\/working-group-interest\*'[\s\S]*?(?=\n\s*- PathPattern:|\n\s*CustomErrorResponses:)/u)?.[0];
  assert.ok(behavior, 'working-group API cache behavior exists');
  assert.match(behavior, /TargetOriginId: working-group-interest-api/u);
  assert.match(behavior, /4135ea2d-6df8-44a3-9df3-4b5a84be39ad/u);
  assert.match(behavior, /LambdaFunctionAssociations/u);

  const policy = site.match(/PublicFormOriginRequestPolicy:[\s\S]*?(?=\n\s{2}\w)/u)?.[0];
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
  assert.match(stack, /StreamViewType: KEYS_ONLY/u);
  assert.match(stack, /RegistrationsTableStreamArn:[\s\S]*RegistrationsTable\.StreamArn/u);
});

test('stored public submissions share one reference-only SNS and SQS event boundary', async () => {
  const [site, events, newsletter, bootstrap] = await Promise.all([
    read('config/aws/site-stack.yaml'),
    read('config/aws/submission-events-stack.yaml'),
    read('config/aws/newsletter-subscription-stack.yaml'),
    read('config/aws/bootstrap-stack.yaml'),
  ]);

  assert.match(site, /SubmissionEventsApplication:[\s\S]*TemplateURL: submission-events-stack\.yaml/u);
  assert.match(site, /RegistrationsTableStreamArn: !GetAtt WorkingGroupInterestApplication\.Outputs\.RegistrationsTableStreamArn/u);
  assert.match(site, /SubscriptionsTableStreamArn: !GetAtt NewsletterSubscriptionApplication\.Outputs\.SubscriptionsTableStreamArn/u);
  assert.match(newsletter, /StreamViewType: KEYS_ONLY/u);
  assert.match(events, /Type: AWS::SNS::Topic[\s\S]*KmsMasterKeyId: alias\/aws\/sns/u);
  assert.equal((events.match(/Type: AWS::SNS::Topic\n/gu) ?? []).length, 1);
  assert.equal((events.match(/Type: AWS::SQS::Queue\n/gu) ?? []).length, 2);
  assert.match(events, /SqsManagedSseEnabled: true/u);
  assert.match(events, /RawMessageDelivery: true/u);
  assert.match(events, /aws:SourceArn: !Ref SubmissionEventsTopic/u);
  assert.match(events, /aws:SourceAccount: !Ref AWS::AccountId/u);
  assert.match(events, /CodeUri: submission-events\//u);
  assert.match(events, /MemorySize: 128/u);
  assert.match(events, /FunctionResponseTypes: \[ReportBatchItemFailures\]/u);
  assert.equal((events.match(/Type: AWS::Lambda::EventSourceMapping\n/gu) ?? []).length, 2);
  assert.match(events, /Pattern: '\{"eventName":\["INSERT"\]\}'/u);
  assert.match(events, /Pattern: '\{"eventName":\["INSERT","MODIFY"\]\}'/u);
  assert.match(events, /MaximumRetryAttempts: 5/u);
  assert.match(events, /Destination: !GetAtt SubmissionEventsFailureQueue\.Arn/u);
  assert.match(bootstrap, /- sns:\*/u);
  assert.match(bootstrap, /- sqs:\*/u);
  assert.match(bootstrap, /- kms:DescribeKey/u);
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
  assert.match(workflow, /participant-identity-stack\.yaml/u);
  assert.doesNotMatch(workflow, /OPDA_AUTH0_CLIENT_ID|OPDA_MEMBER_EMAILS/u);
});

test('deployment has no external abuse-control or runtime-secret dependency', async () => {
  const [infra, deploy, release, edge, site] = await Promise.all([
    read('.github/workflows/infra.yml'), read('.github/workflows/deploy-aws.yml'),
    read('.github/workflows/site-release.yml'),
    read('config/aws/edge-stack.yaml'), read('config/aws/site-stack.yaml'),
  ]);
  assert.doesNotMatch(`${infra}\n${deploy}\n${release}\n${edge}\n${site}`, /Turnstile|TURNSTILE|WAFv2|WebACL|WorkingGroupInterestWebAcl/u);
});
