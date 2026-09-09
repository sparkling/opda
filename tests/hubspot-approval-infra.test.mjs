import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const resource = (template, name) => {
  const block = template.match(new RegExp(`^  ${name}:\\n[\\s\\S]*?(?=^  [A-Za-z][A-Za-z0-9]*:|^Outputs:|$(?![\\s\\S]))`, 'm'))?.[0];
  assert.ok(block, `${name} exists`);
  return block;
};
const statement = (role, sid) => {
  const block = role.match(new RegExp(`- Sid: ${sid}\\n[\\s\\S]*?(?=\\n\\s+- Sid:|$(?![\\s\\S]))`))?.[0];
  assert.ok(block, `${sid} exists`);
  return block;
};

test('approval receiver is a bounded, direct HTTP API with exactly one signed POST route', () => {
  const template = read('config/aws/hubspot-approval-stack.yaml');
  const receiver = resource(template, 'Receiver');
  assert.match(receiver, /CodeUri: \.\//);
  assert.match(receiver, /Handler: hubspot-approval\/webhook\.handler/);
  assert.match(receiver, /Runtime: nodejs22\.x/);
  assert.match(receiver, /MemorySize: 128/);
  assert.match(receiver, /Timeout: 10\n/);
  assert.match(receiver, /ReservedConcurrentExecutions: 2/);
  assert.match(receiver, /SIGNING_SECRET_ARN: !Ref SigningSecretName/);
  assert.match(receiver, /APPROVAL_QUEUE_URL: !Ref ApprovalQueue/);
  assert.ok(receiver.includes("PUBLIC_WEBHOOK_URL: !Sub 'https://${Api}.execute-api.${AWS::Region}.${AWS::URLSuffix}/hubspot/approval'"),
    'v3 signatures bind the deployed HTTPS endpoint, never forwarded request headers');
  assert.doesNotMatch(receiver, /BRIDGE_SECRET|TABLE_NAME|USER_POOL/);
  assert.match(resource(template, 'Api'), /Type: AWS::ApiGatewayV2::Api[\s\S]*ProtocolType: HTTP/);
  assert.match(resource(template, 'ApprovalRoute'), /RouteKey: POST \/hubspot\/approval\n/);
  assert.equal((template.match(/RouteKey:/g) ?? []).length, 1);
  assert.match(resource(template, 'Integration'), /PayloadFormatVersion: '2\.0'/);
  assert.match(resource(template, 'ReceiverInvokePermission'), /\$\{Api\}\/\*\/POST\/hubspot\/approval/);
  assert.match(resource(template, 'Stage'), /ThrottlingBurstLimit: 10[\s\S]*ThrottlingRateLimit: 2/);
  assert.doesNotMatch(template, /CorsConfiguration|AWS::ApiGatewayV2::DomainName|AWS::SNS::Subscription/);
});

test('receiver is send-only and can read only the independent signing secret', () => {
  const template = read('config/aws/hubspot-approval-stack.yaml');
  const role = resource(template, 'ReceiverRole');
  const secret = statement(role, 'ExactSigningCredential');
  assert.match(template, /Default: opda\/hubspot\/approval-webhook\n/);
  assert.match(secret, /Action: \[secretsmanager:GetSecretValue\]/);
  assert.match(secret, /:secret:\$\{SigningSecretName\}-\?{6}'/);
  assert.match(statement(role, 'SendDedicatedQueueOnly'), /Action: \[sqs:SendMessage\][\s\S]*Resource: !GetAtt ApprovalQueue\.Arn/);
  assert.doesNotMatch(role, /dynamodb:|cognito-idp:|BridgeSecretArn|sqs:(?:Receive|Delete|Change|Get)/);
  assert.doesNotMatch(template, /AWS::SecretsManager::Secret\n|SecretString:|GenerateSecretString:/);
});

test('approval events have a separate encrypted standard queue, bounded retries and 14-day retention', () => {
  const template = read('config/aws/hubspot-approval-stack.yaml');
  const queue = resource(template, 'ApprovalQueue');
  const failures = resource(template, 'FailureQueue');
  assert.match(queue, /QueueName: opda-hubspot-approvals\n/);
  assert.match(queue, /VisibilityTimeout: 1800/);
  assert.match(queue, /MessageRetentionPeriod: 1209600/);
  assert.match(queue, /maxReceiveCount: 5/);
  assert.match(queue, /deadLetterTargetArn: !GetAtt FailureQueue\.Arn/);
  for (const block of [queue, failures]) assert.match(block, /SqsManagedSseEnabled: true/);
  assert.match(failures, /MessageRetentionPeriod: 1209600/);
  assert.doesNotMatch(template, /FifoQueue|SourceTopicArn|SignupQueue|SubmissionEventsQueue/);
  for (const name of ['QueuePolicy', 'FailureQueuePolicy']) {
    const policy = resource(template, name);
    assert.match(policy, /Effect: Deny[\s\S]*'aws:SecureTransport': 'false'/);
    assert.doesNotMatch(policy, /Resource: \[/, 'SQS policy statements accept one queue ARN');
  }
});

test('one worker serializes queue effects and scheduled recovery with partial batch failures', () => {
  const template = read('config/aws/hubspot-approval-stack.yaml');
  const worker = resource(template, 'Worker');
  assert.match(worker, /CodeUri: \.\//);
  assert.match(worker, /Handler: hubspot-approval\/index\.handler/);
  assert.match(worker, /MemorySize: 256/);
  assert.match(worker, /Timeout: 300/);
  assert.match(worker, /ReservedConcurrentExecutions: 1\n/);
  for (const name of ['PARTICIPANTS_TABLE_NAME', 'REGISTRATIONS_TABLE_NAME', 'BRIDGE_SECRET_ARN', 'USER_POOL_ID', 'APPROVAL_QUEUE_ARN']) {
    assert.match(worker, new RegExp(`${name}:`));
  }
  assert.match(worker, /REVIEW_CUTOVER: '2026-09-08T21:00:00\.000Z'/);
  assert.doesNotMatch(worker, /SIGNING_SECRET|SESSIONS_TABLE/);
  const mapping = resource(template, 'ApprovalMapping');
  assert.match(mapping, /EventSourceArn: !GetAtt ApprovalQueue\.Arn/);
  assert.match(mapping, /BatchSize: 1\n/);
  assert.match(mapping, /FunctionResponseTypes: \[ReportBatchItemFailures\]/);
  assert.doesNotMatch(mapping, /ScalingConfig|MaximumConcurrency/, 'SQS maximum concurrency cannot be set below two');
  const rule = resource(template, 'RecoverySchedule');
  assert.match(rule, /ScheduleExpression: rate\(15 minutes\)/);
  assert.match(rule, /Arn: !GetAtt Worker\.Arn/);
  assert.match(rule, /Input: '\{"source":"opda.hubspot-approval","detail-type":"reconcile"\}'/);
  assert.match(resource(template, 'RecoveryInvokePermission'), /SourceArn: !GetAtt RecoverySchedule\.Arn/);
});

test('worker cannot mutate import/sync markers, intake, sessions or Cognito passwords and groups', () => {
  const role = resource(read('config/aws/hubspot-approval-stack.yaml'), 'WorkerRole');
  const write = statement(role, 'ApprovalIdentityWritesOnly');
  assert.match(write, /Action: \[dynamodb:PutItem, dynamodb:UpdateItem, dynamodb:ConditionCheckItem\]/);
  assert.match(write, /Resource: !Ref ParticipantsTableArn/);
  assert.match(write, /dynamodb:LeadingKeys: \['CRM#\*', 'USER#\*', 'EMAIL#\*'\]/);
  assert.match(write, /'Null': \{ 'dynamodb:LeadingKeys': 'false' \}/);
  const source = statement(role, 'OriginalIntakeReadOnly');
  assert.match(source, /Action: \[dynamodb:GetItem, dynamodb:ConditionCheckItem\]/);
  assert.match(source, /Resource: !Ref RegistrationsTableArn/);
  const reads = statement(role, 'ParticipantSourceReadOnly');
  assert.match(reads, /Action: \[dynamodb:GetItem, dynamodb:ConditionCheckItem\]/);
  assert.match(reads, /'SYNC#\*', 'IMPORT#\*'/);
  assert.match(statement(role, 'RecoveryScanOnly'), /Action: \[dynamodb:Scan\][\s\S]*Resource: !Ref ParticipantsTableArn/);
  assert.match(statement(role, 'ExactBridgeCredential'), /Action: \[secretsmanager:GetSecretValue\][\s\S]*Resource: !Ref BridgeSecretArn/);
  const cognito = statement(role, 'ExactParticipantPoolOnly');
  assert.match(cognito, /Resource: !Ref UserPoolArn/);
  assert.deepEqual([...cognito.matchAll(/cognito-idp:([A-Za-z]+)/g)].map(match => match[1]).sort(), [
    'AdminCreateUser', 'AdminDisableUser', 'AdminEnableUser', 'AdminGetUser', 'AdminUserGlobalSignOut',
  ].sort());
  assert.match(statement(role, 'NotifyOnboardingOnly'), /Action: \[sqs:SendMessage\][\s\S]*Resource: !GetAtt OnboardingApplication\.Outputs\.QueueArn/);
  assert.equal((role.match(/sqs:SendMessage/g) ?? []).length, 1);
  assert.doesNotMatch(role, /dynamodb:(?:DeleteItem|TransactWriteItems)|SessionsTable|SigningSecret/);
  assert.doesNotMatch(role, /Action: \[[^\]]*\*|Resource: ['"]?\*['"]?\s*\n/);
});

test('approval observability covers stalled work, dead letters, handled HTTP failures and worker errors', () => {
  const template = read('config/aws/hubspot-approval-stack.yaml');
  assert.match(resource(template, 'WorkerErrorAlarm'), /Namespace: AWS\/Lambda[\s\S]*MetricName: Errors/);
  const receiver = resource(template, 'ReceiverErrorAlarm');
  assert.match(receiver, /Namespace: AWS\/ApiGateway[\s\S]*MetricName: 5xx\n/);
  assert.match(receiver, /Dimensions: \[\{ Name: ApiId, Value: !Ref Api \}, \{ Name: Stage, Value: \$default \}\]/);
  assert.match(receiver, /Statistic: Sum[\s\S]*Threshold: 0\n/);
  assert.doesNotMatch(receiver, /Namespace: AWS\/Lambda|FunctionName/, 'handled 503 responses do not increment Lambda Errors');
  assert.match(resource(template, 'DeadLetterAlarm'), /ApproximateNumberOfMessagesVisible[\s\S]*!GetAtt FailureQueue\.QueueName/);
  assert.match(resource(template, 'PendingAgeAlarm'), /ApproximateAgeOfOldestMessage[\s\S]*Threshold: 900\n/);
});

test('identity exports and site nesting preserve the existing signup and backup services', () => {
  const identity = read('config/aws/participant-identity-stack.yaml');
  const site = read('config/aws/site-stack.yaml');
  assert.match(identity, /UserPoolId:\n\s+Value: !Ref UserPool\n\s+Export: \{ Name: !Sub '\$\{AWS::StackName\}-UserPoolId' \}/);
  assert.match(identity, /UserPoolArn:\n\s+Value: !GetAtt UserPool\.Arn\n\s+Export: \{ Name: !Sub '\$\{AWS::StackName\}-UserPoolArn' \}/);
  const application = resource(site, 'HubSpotApprovalApplication');
  assert.match(application, /TemplateURL: hubspot-approval-stack\.yaml/);
  for (const output of ['ParticipantsTableName', 'ParticipantsTableArn', 'UserPoolId', 'UserPoolArn']) {
    assert.match(application, new RegExp(`Fn::ImportValue: !Sub '\\$\\{IdentityStackName\\}-${output}'`));
  }
  assert.match(application, /BridgeSecretArn: !Ref HubSpotBridgeSecretArn/);
  assert.match(resource(site, 'HubSpotSignupSyncApplication'), /TemplateURL: hubspot-sync-stack\.yaml/);
  assert.match(resource(site, 'ParticipantBackupApplication'), /TemplateURL: participant-backup-stack\.yaml/);
  assert.doesNotMatch(resource(site, 'Distribution'), /hubspot-approval/, 'the signed URL is direct, not CloudFront-rewritten');
  for (const output of ['ApiEndpoint', 'WebhookUrl', 'WorkerFunctionName', 'ApprovalQueueUrl', 'FailureQueueUrl']) {
    assert.match(site, new RegExp(`!GetAtt HubSpotApprovalApplication\\.Outputs\\.${output}`));
  }
  assert.ok(site.trimEnd().split('\n').length < 500);
});

test('focused approval tests gate infrastructure deployment and are in the repository inventory', () => {
  const workflow = read('.github/workflows/infra.yml');
  assert.match(workflow, /node --test tests\/hubspot-approval-\*\.test\.mjs tests\/auth-session\.test\.mjs tests\/hubspot-sync\.test\.mjs/);
  assert.ok(workflow.indexOf('node --test') < workflow.indexOf('name: Assume deploy role'));
  assert.match(workflow, /cfn-lint config\/aws\/\*\.yaml/);
  assert.match(workflow, /for t in config\/aws\/\*\.yaml; do/);
  const manifest = JSON.parse(read('config/ci-test-tiers.json'));
  const scripts = JSON.parse(read('package.json')).scripts;
  for (const part of ['webhook', 'adapters', 'worker', 'store', 'infra']) {
    const path = `tests/hubspot-approval-${part}.test.mjs`;
    assert.equal(manifest.tests.filter(entry => entry.path === path).length, 1);
    assert.match(scripts.test, /tests\/hubspot-approval-\*\.test\.mjs/);
  }
});
