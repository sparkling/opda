import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const commentsStack = await readFile(new URL('../config/aws/comments-stack.yaml', import.meta.url), 'utf8');
const apiStack = await readFile(new URL('../config/aws/comments-api-stack.yaml', import.meta.url), 'utf8');

function section(source, start, end) {
  const begin = source.indexOf(start);
  assert.notEqual(begin, -1, `${start} is present`);
  const finish = end ? source.indexOf(end, begin) : source.length;
  assert.notEqual(finish, -1, `${end} follows ${start}`);
  return source.slice(begin, finish);
}

test('comments stack keeps a private, gateway-only Artalk task with durable single-writer settings', () => {
  const network = section(commentsStack, '  TaskSecurityGroup:', '  # ---------------- Image + persistence');
  const ingress = section(commentsStack, '  GatewayIngress:', '  # ---------------- Image + persistence');
  const task = section(commentsStack, '      ContainerDefinitions:', '  Service:');
  assert.doesNotMatch(commentsStack, /comments-readonly|nginx|public\.ecr\.aws|OPDA_NGINX_CONF/iu);
  assert.doesNotMatch(network, /SourcePrefixListId|CidrIp|CidrIpv6/iu);
  assert.match(ingress, /SourceSecurityGroupId: !GetAtt GatewayApplication\.Outputs\.GatewaySecurityGroupId/u);
  assert.doesNotMatch(ingress, /SourcePrefixListId|CidrIp|CidrIpv6/iu);
  assert.match(task, /- Name: artalk\n/u);
  assert.match(task, /ContainerPort: 23366/u);
  assert.match(task, /wget -q -O - http:\/\/127\.0\.0\.1:23366\/api\/v2\/version/u);
  assert.match(task, /Name: OPDA_COMMENTS_GATEWAY_KEY\n\s+ValueFrom: !Sub 'arn:\$\{AWS::Partition\}:ssm:\$\{AWS::Region\}:\$\{AWS::AccountId\}:parameter\/opda\/comments\/gateway-key'/u);
  assert.match(task, /litestream restore -if-db-not-exists -if-replica-exists/u);
  assert.match(task, /exec litestream replicate -exec/u);
  assert.match(commentsStack, /AllowedValues: \[0, 1\]/u);
  assert.match(commentsStack, /MinimumHealthyPercent: 0\n\s+MaximumPercent: 100/u);
  assert.match(commentsStack, /PrivateIpAddress/u);
  assert.doesNotMatch(commentsStack, /Association:\?\.PublicIp|public IP/iu);
  assert.match(commentsStack, /group: \['service:opda-artalk'\]\n\s+lastStatus: \[RUNNING\]/u);
  assert.match(commentsStack, /group !== 'service:opda-artalk' \|\| lastStatus !== 'RUNNING'/u);
  assert.match(commentsStack, /tasks\?\.\[0\]\?\.group !== 'service:opda-artalk' \|\| tasks\[0\]\.lastStatus !== 'RUNNING'/u);

  const authFlags = [
    'ANONYMOUS', 'SSO_ENABLED', 'EMAIL_ENABLED', 'AUTH0_ENABLED', 'GITHUB_ENABLED',
    'GITLAB_ENABLED', 'GITEA_ENABLED', 'GOOGLE_ENABLED', 'MASTODON_ENABLED',
    'TWITTER_ENABLED', 'FACEBOOK_ENABLED', 'DISCORD_ENABLED', 'STEAM_ENABLED',
    'APPLE_ENABLED', 'MICROSOFT_ENABLED', 'WECHAT_ENABLED', 'TIKTOK_ENABLED',
    'SLACK_ENABLED', 'LINE_ENABLED', 'PATREON_ENABLED', 'IMG_UPLOAD_ENABLED',
  ];
  for (const flag of authFlags) {
    const name = flag === 'IMG_UPLOAD_ENABLED' ? flag : `AUTH_${flag}`;
    assert.match(task, new RegExp(`ATK_${name}, Value: 'false'`), flag);
  }
  assert.match(task, /ATK_AUTH_ENABLED, Value: 'true'/u);
  assert.doesNotMatch(commentsStack, /Auth0Domain|ATK_AUTH_SSO_ISSUER/u);
});

test('comments stack routes HTTPS API output through the approval-bound nested gateway', () => {
  assert.match(commentsStack, /CloudFront calls the HTTPS API[\s\S]*session-checked VPC/u);
  assert.match(commentsStack, /no public or CloudFront-prefix access/u);
  assert.match(commentsStack, /CommentsApiOriginDomainName:[\s\S]*!GetAtt GatewayApplication\.Outputs\.ApiOriginDomainName/u);
  assert.match(commentsStack, /Name: opda-comments-ApiOriginDomainName/u);
});

test('comments gateway has bounded requests and free DynamoDB gateway connectivity', () => {
  assert.doesNotMatch(apiStack, /AWS::EC2::NatGateway|AWS::ElasticLoadBalancingV2|VpcEndpointType: Interface|paid interface/iu);
  assert.doesNotMatch(apiStack, /CorsConfiguration|\bCORS\b/iu);
  assert.equal((apiStack.match(/Action: dynamodb:GetItem/g) || []).length, 2);
  assert.doesNotMatch(apiStack, /Action: dynamodb:(?!GetItem)/u);
  assert.deepEqual([...apiStack.matchAll(/RouteKey: '([^']+)'/gu)].map(match => match[1]), [
    'GET /api/v2/comments', 'POST /api/v2/comments',
  ]);
  const functionSection = section(apiStack, '  Function:', '  Api:');
  assert.match(functionSection, /Timeout: 15/u);
  assert.match(functionSection, /ReservedConcurrentExecutions: 5/u);
  assert.match(functionSection, /SecurityGroupIds: \[!Ref GatewaySecurityGroup\]/u);
  assert.match(apiStack, /FromPort: 23366[\s\S]*DestinationSecurityGroupId: !Ref TaskSecurityGroupId/u);
});
