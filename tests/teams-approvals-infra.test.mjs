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
  const block = role.match(new RegExp(`- Sid: ${sid}\\n[\\s\\S]*?(?=\\n\\s+- (?:Sid:|!If)|$(?![\\s\\S]))`))?.[0];
  assert.ok(block, `${sid} exists`);
  return block;
};
const template = read('config/aws/teams-approvals-stack.yaml');

test('the Teams stack is a top-level consumer of the submission topic with its own queue, DLQ and alarms', () => {
  assert.doesNotMatch(read('config/aws/site-stack.yaml'), /teams-approvals/, 'the site template stays within its size budget');
  assert.ok(read('config/aws/site-stack.yaml').split('\n').length <= 500);
  const subscription = resource(template, 'SignupSubscription');
  assert.match(subscription, /Condition: HasBot/);
  assert.match(subscription, /eventType: \['working-group-interest\.received\.v1'\]/);
  assert.match(subscription, /RawMessageDelivery: true/);
  assert.match(resource(template, 'SignupQueue'), /RedrivePolicy:[\s\S]*maxReceiveCount: 8/);
  assert.match(resource(template, 'QueuePolicy'), /'aws:SourceArn': !Ref SourceTopicArn/);
  for (const alarm of ['DeadLetterAlarm', 'PendingAgeAlarm', 'MessagesErrorAlarm']) {
    assert.match(resource(template, alarm), /AlarmActions: \[\{'Fn::ImportValue': !Sub '\$\{OperationsStackName\}-AlarmTopicArn'\}\]/);
  }
  assert.match(template, /Conditions:\n  HasBot: !Not \[!Equals \[!Ref BotAppId, ''\]\]\n  ApprovalsOn: !And \[!Condition HasBot, !Equals \[!Ref ApprovalsEnabled, 'true'\]\]/);
  assert.doesNotMatch(template, /AWS::SecretsManager::Secret/, 'the deploy role holds no Secrets Manager rights; containers are created out of band');
  assert.match(template, /BotSecretArn:\n    Type: String\n    Default: arn:aws:secretsmanager:eu-west-2:355653384628:secret:opda\/teams\/signups-bot-/);
});

test('the notifier can post cards and record them, and nothing else', () => {
  const role = resource(template, 'NotifierRole');
  assert.match(statement(role, 'SignupCardLogOnly'), /dynamodb:LeadingKeys: \['TEAMS#SIGNUP#\*'\]/);
  assert.match(statement(role, 'LinkAndInstallReadOnly'), /Action: \[dynamodb:GetItem\][\s\S]*\['SYNC#EMAIL#\*', 'TEAMS#BOT#\*'\]/);
  assert.match(statement(role, 'BotCredential'), /Resource: !Ref BotSecretArn/);
  assert.doesNotMatch(role, /BridgeSecretArn|sqs:SendMessage|TEAMS#REVIEW/);
  const notifier = resource(template, 'Notifier');
  assert.match(notifier, /Handler: teams-approvals\/notifier\.handler/);
  assert.match(notifier, /CodeUri: \.\//);
  assert.match(notifier, /SIGNUPS_CHANNEL_ID: !Ref SignupsChannelId/);
  assert.match(resource(template, 'NotifierMapping'), /BatchSize: 1[\s\S]*ReportBatchItemFailures/);
});

test('only the messages role can write Teams decisions, and only while the flag is on can it reach the CRM or the worker', () => {
  const role = resource(template, 'MessagesRole');
  assert.match(statement(role, 'TeamsDecisionRecordsOnly'), /Action: \[dynamodb:GetItem, dynamodb:PutItem\][\s\S]*\['TEAMS#REVIEW#\*', 'TEAMS#BOT#\*'\]/);
  assert.match(statement(role, 'LinkReadOnly'), /Action: \[dynamodb:GetItem\][\s\S]*\['SYNC#EMAIL#\*', 'TEAMS#SIGNUP#\*'\]/);
  assert.match(role, /- !If\n\s+- ApprovalsOn\n\s+- Sid: BridgeCredentialWhileEnabled[\s\S]*Resource: !Ref BridgeSecretArn/);
  assert.match(role, /- !If\n\s+- ApprovalsOn\n\s+- Sid: HintApprovalWorkerWhileEnabled[\s\S]*Action: \[sqs:SendMessage\]/);
  assert.doesNotMatch(role, /TEAMS#SIGNUP#\*'\]\n[\s\S]*PutItem/);
  const messages = resource(template, 'Messages');
  assert.match(messages, /Handler: teams-approvals\/messages\.handler/);
  assert.match(messages, /APPROVALS_ENABLED: !If \[ApprovalsOn, 'true', 'false'\]/);
  assert.match(messages, /BRIDGE_SECRET_ARN: !If \[ApprovalsOn, !Ref BridgeSecretArn, ''\]/);
  assert.match(messages, /BOT_APP_ID: !Ref BotAppId/);
  assert.match(template, /ApprovalsEnabled:\n    Type: String\n    Default: 'false'/);
  assert.match(resource(template, 'MessagesRoute'), /RouteKey: POST \/teams\/messages\n/);
  assert.equal((template.match(/RouteKey:/g) ?? []).length, 1);
  assert.match(resource(template, 'MessagesInvokePermission'), /\$\{Api\}\/\*\/POST\/teams\/messages/);
  assert.doesNotMatch(template, /CorsConfiguration|AWS::ApiGatewayV2::DomainName/);
});

test('the approval worker may read Teams records but never write them', () => {
  const worker = resource(read('config/aws/hubspot-approval-stack.yaml'), 'WorkerRole');
  assert.match(statement(worker, 'ParticipantSourceReadOnly'), /'IMPORT#\*', 'TEAMS#\*'\]/);
  assert.match(statement(worker, 'ApprovalIdentityWritesOnly'), /dynamodb:LeadingKeys: \['CRM#\*', 'USER#\*', 'EMAIL#\*'\]/);
  assert.doesNotMatch(statement(worker, 'ApprovalIdentityWritesOnly'), /TEAMS#/);
});

test('infra.yml deploys the stack after the site stack from site outputs, gated by repository variables', () => {
  const workflow = read('.github/workflows/infra.yml');
  const step = workflow.match(/- name: Deploy Teams approvals stack \(eu-west-2\)[\s\S]*?(?=\n      - name:)/)?.[0];
  assert.ok(step);
  assert.match(step, /--stack-name opda-teams-approvals/);
  assert.match(step, /OutputKey=='SubmissionEventsTopicArn'/);
  assert.match(step, /OutputKey=='WorkingGroupInterestRegistrationsTableName'/);
  assert.match(step, /BotAppId="\$\{\{ vars\.OPDA_TEAMS_BOT_APP_ID \|\| '' \}\}"/);
  assert.match(step, /ApprovalsEnabled="\$\{\{ vars\.OPDA_TEAMS_APPROVALS_ENABLED \|\| 'false' \}\}"/);
  assert.ok(workflow.indexOf('Deploy site stack (eu-west-2)') < workflow.indexOf('Deploy Teams approvals stack (eu-west-2)'));
  assert.match(workflow, /tests\/teams-approvals-\*\.test\.mjs/);
  assert.match(JSON.parse(read('package.json')).scripts.test, /tests\/teams-approvals-\*\.test\.mjs/);
});

test('the Teams app manifest is a team-scoped bot with placeholder ids the packager substitutes', () => {
  const manifest = JSON.parse(read('config/teams/manifest.json'));
  assert.equal(manifest.id, '00000000-0000-0000-0000-000000000000');
  assert.deepEqual(manifest.bots, [{ botId: '00000000-0000-0000-0000-000000000000', scopes: ['team'], supportsFiles: false, isNotificationOnly: false }]);
  assert.deepEqual(manifest.permissions, ['identity']);
  assert.deepEqual(manifest.validDomains, []);
  assert.deepEqual(manifest.icons, { outline: 'outline.png', color: 'color.png' });
  const png = path => readFileSync(new URL(`../config/teams/${path}`, import.meta.url));
  for (const [file, size] of [['color.png', 192], ['outline.png', 32]]) {
    const bytes = png(file);
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', `${file} is a PNG`);
    assert.equal(bytes.readUInt32BE(16), size); assert.equal(bytes.readUInt32BE(20), size);
  }
  assert.match(read('scripts/package-teams-app.mjs'), /OPDA_TEAMS_BOT_APP_ID/);
});
