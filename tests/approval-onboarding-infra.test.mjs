import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { BUNDLE_FILES, packageOnboarding } from '../scripts/package-approval-onboarding.mjs';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const block = (text, name) => {
  const found = text.match(new RegExp(`^  ${name}:\\n[\\s\\S]*?(?=^  [A-Za-z][A-Za-z0-9]*:|^Outputs:|$(?![\\s\\S]))`, 'm'))?.[0];
  assert.ok(found, `${name} exists`); return found;
};

test('only runtime dependencies and the CID logo enter the private Lambda bundle', async t => {
  const output = await mkdtemp(resolve(tmpdir(), 'opda-onboarding-package-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  const files = await packageOnboarding({ output });
  assert.deepEqual(files, BUNDLE_FILES.map(([, target]) => target).sort());
  for (const name of ['index', 'worker', 'store', 'settings', 'postmark', 'domain-templates',
    'workspace-entry', 'workspace-store', 'workspace-flow']) {
    assert.ok(files.includes(`src/approval-onboarding/${name}.mjs`));
  }
  assert.ok(files.every(path => path.startsWith('src/') || /^config\/aws\/auth-session\/(?:identity|session|store)\.mjs$/u.test(path)));
  assert.ok(files.every(path => !/gallery|design-explorations|\.env|secret|certificate|private.key/i.test(path)));
  for (const [source, target] of BUNDLE_FILES) assert.deepEqual(await readFile(resolve(output, target)), await readFile(new URL(`../${source}`, import.meta.url)));
  await writeFile(resolve(output, 'unexpected.txt'), 'do not silently include this');
  await assert.rejects(packageOnboarding({ output }), /Unexpected file/);
});

test('workspace entry is private, bounded and cannot perform onboarding effects', async () => {
  const template = await read('config/aws/approval-onboarding-stack.yaml');
  const role = block(template, 'WorkspaceRole'), functionBlock = block(template, 'WorkspaceEntry');
  assert.match(functionBlock, /FunctionName: opda-workspace-entry/u);
  assert.match(functionBlock, /Handler: src\/approval-onboarding\/workspace-entry\.handler/u);
  assert.match(functionBlock, /Runtime: nodejs22\.x/u);
  assert.match(functionBlock, /Architectures: \[arm64\]/u);
  assert.match(functionBlock, /MemorySize: 256/u);
  assert.match(functionBlock, /Timeout: 10/u);
  assert.match(functionBlock, /ReservedConcurrentExecutions: 2/u);
  assert.match(functionBlock, /MICROSOFT_SECRET_ARN/u);
  assert.doesNotMatch(functionBlock, /POSTMARK|ONBOARDING_QUEUE|FunctionUrlConfig|AWS::ApiGateway/iu);
  assert.match(role, /Action: dynamodb:GetItem/u);
  assert.match(role, /Action: dynamodb:PutItem/u);
  assert.doesNotMatch(role, /dynamodb:(?:Scan|Query|UpdateItem|DeleteItem)|sqs:|postmark|cognito-idp:/iu);
  assert.match(role, /USER#\*.*IDENTITY#\*.*EMAIL#\*.*SYNC#SUPPRESS#\*.*CRM#CONTACT#\*.*CRM#ONBOARDING_STATE#\*/u);
  assert.match(role, /CRM#ONBOARDING_STATE#\*/u);
  assert.match(role, /opda\/microsoft\/participation-onboarding-nmTdmF/u);
  assert.doesNotMatch(role, /postmark\/participation-onboarding|Resource: ['"]?\*['"]?\s*\n/u);
});

test('effects worker has bounded serial execution with a private recoverable queue', async () => {
  const template = await read('config/aws/approval-onboarding-stack.yaml');
  const worker = block(template, 'Worker'), queue = block(template, 'Queue');
  assert.match(worker, /CodeUri: \.\/onboarding-bundle\//);
  assert.match(worker, /Handler: src\/approval-onboarding\/index\.handler/);
  assert.match(worker, /ReservedConcurrentExecutions: 1/);
  assert.match(worker, /Timeout: 300/); assert.match(worker, /Runtime: nodejs22\.x/);
  assert.match(queue, /VisibilityTimeout: 1800/);
  assert.match(queue, /SqsManagedSseEnabled: true/);
  assert.match(queue, /maxReceiveCount: 5/);
  assert.match(block(template, 'FailureQueue'), /MessageRetentionPeriod: 1209600/);
  assert.match(block(template, 'Mapping'), /BatchSize: 1[\s\S]*ReportBatchItemFailures/);
  assert.match(block(template, 'LogGroup'), /RetentionInDays: 14/);
  for (const id of ['QueuePolicy', 'FailureQueuePolicy']) assert.match(block(template, id), /Effect: Deny[\s\S]*'aws:SecureTransport': 'false'/);
});

test('Microsoft follow-up can write receipts but cannot change website approval or sessions', async () => {
  const role = block(await read('config/aws/approval-onboarding-stack.yaml'), 'Role');
  const writes = role.match(/- Sid: ReceiptAndOperationWritesOnly[\s\S]*?(?=\n\s+- Sid:)/)?.[0];
  assert.match(writes, /Action: \[dynamodb:PutItem, dynamodb:UpdateItem\]/);
  assert.match(writes, /dynamodb:LeadingKeys: \['CRM#ONBOARDING#\*', 'CRM#ONBOARDING_STATE#\*'\]/);
  assert.match(role, /Action: \[dynamodb:GetItem, dynamodb:ConditionCheckItem\]/);
  assert.doesNotMatch(role, /cognito-idp:|dynamodb:(?:DeleteItem|Scan)|sqs:SendMessage|hubspot\/|SessionsTable|s3:/);
  assert.equal((role.match(/:secret:opda\//g) ?? []).length, 2);
  assert.match(role, /microsoft\/participation-onboarding-\?{6}/);
  assert.match(role, /postmark\/participation-onboarding-\?{6}/);
  assert.doesNotMatch(role, /Resource: ['"]?\*['"]?\s*\n/);
});

test('existing approval relay notifies the separate consumer without historical activation', async () => {
  const template = await read('config/aws/hubspot-approval-stack.yaml');
  assert.match(block(template, 'OnboardingCutover'), /Default: ''/);
  assert.match(block(template, 'DomainReviewCutover'), /Default: ''/);
  assert.match(block(template, 'OnboardingEnabled'), /Default: 'false'/);
  assert.match(block(template, 'OnboardingCanaryEmailHash'), /Default: ''[\s\S]*AllowedPattern: '\^\$\|\^\[a-f0-9\]\{64\}\$'/);
  assert.match(block(template, 'OnboardingApplication'), /TemplateURL: approval-onboarding-stack\.yaml/);
  assert.match(block(template, 'OnboardingApplication'), /OnboardingCanaryEmailHash: !Ref OnboardingCanaryEmailHash/);
  assert.match(block(template, 'Worker'), /ONBOARDING_QUEUE_URL: !GetAtt OnboardingApplication\.Outputs\.QueueUrl/);
  assert.match(block(template, 'Worker'), /ONBOARDING_CUTOVER: !Ref OnboardingCutover/);
  assert.match(block(template, 'Worker'), /DOMAIN_REVIEW_CUTOVER: !Ref DomainReviewCutover/);
  assert.match(block(template, 'WorkerRole'), /Sid: NotifyOnboardingOnly[\s\S]*Resource: !GetAtt OnboardingApplication\.Outputs\.QueueArn/);
  assert.match(block(template, 'RecoverySchedule'), /rate\(15 minutes\)/);
  const site = await read('config/aws/site-stack.yaml');
  assert.match(block(site, 'HubSpotApprovalApplication'), /OnboardingCutover: !Ref OnboardingCutover/);
  assert.match(block(site, 'HubSpotApprovalApplication'), /DomainReviewCutover: !Ref DomainReviewCutover/);
  assert.match(block(site, 'HubSpotApprovalApplication'), /OnboardingCanaryEmailHash: !Ref OnboardingCanaryEmailHash/);
  assert.ok(site.trimEnd().split('\n').length < 500);
});

test('CI packages only after focused tests and before uploading deployment artifacts', async () => {
  const workflow = await read('.github/workflows/infra.yml');
  const packageAt = workflow.indexOf('run: node scripts/package-approval-onboarding.mjs');
  assert.ok(packageAt > workflow.indexOf('run: node --test'));
  assert.ok(packageAt < workflow.indexOf('name: Assume deploy role'));
  assert.match(workflow, /tests\/approval-onboarding-\*\.test\.mjs/);
  for (const path of ['src/approval-onboarding/**', 'src/agents/working-group-inbox/domain.mjs', 'scripts/package-approval-onboarding.mjs', 'docs/templates/assets/opda-email-logo.png']) {
    assert.ok(workflow.includes(`- '${path}'`));
  }
  assert.ok(workflow.includes("vars.OPDA_ONBOARDING_ENABLED || 'false'"));
  assert.ok(workflow.includes("vars.OPDA_ONBOARDING_CUTOVER || ''"));
  assert.ok(workflow.includes("vars.OPDA_ONBOARDING_CANARY_EMAIL_HASH || ''"));
});
