import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createPostmarkClient } from '../config/aws/acknowledgement/postmark.mjs';
import { RetryLater } from '../config/aws/shared/http-retry.mjs';
import { ACKNOWLEDGEMENT_PIN } from '../config/aws/acknowledgement/settings.mjs';
import { acknowledgementPin } from '../config/aws/hubspot-participation/acknowledgement.mjs';
import {
  buildAcknowledgementPayload, compileAcknowledgementTemplate, fingerprintAcknowledgementTemplate,
} from '../config/aws/hubspot-participation/acknowledgement.mjs';

const shells = {
  HtmlBody: readFileSync(new URL('../docs/templates/working-group-application-received-email.html', import.meta.url), 'utf8'),
  TextBody: readFileSync(new URL('../docs/templates/working-group-application-received-email.txt', import.meta.url), 'utf8'),
};
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const template = compileAcknowledgementTemplate(shells);
const pin = { serverId: 20188829, templateId: 46500001, fingerprint: fingerprintAcknowledgementTemplate(template) };
const secret = { schemaVersion: 1, serverId: 20188829, serverToken: 'server-token-synthetic' };
const templateRead = { Active: true, TemplateId: pin.templateId, AssociatedServerId: pin.serverId, Alias: template.Alias,
  Subject: template.Subject, HtmlBody: template.HtmlBody, TextBody: template.TextBody, TemplateType: 'Standard', LayoutTemplate: null };
const accepted = { ErrorCode: 0, Message: 'OK', MessageID: '11111111-2222-4333-8444-555555555555',
  SubmittedAt: '2026-09-15T20:00:00.000Z', To: 'synthetic@example.test' };
const response = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
const payload = () => buildAcknowledgementPayload({ displayName: 'Synthetic Example Person', email: 'synthetic@example.test',
  groupId: 'conveyancing' }, { logoBase64 });

function client(routes, overrides = {}) {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push([url, options]);
    const path = url.replace('https://api.postmarkapp.com', '');
    const route = routes.find(([match]) => typeof match === 'string' ? path.startsWith(match) : match.test(path));
    if (!route) return response({ ErrorCode: 10, Message: 'unrouted' }, 404);
    return typeof route[1] === 'function' ? route[1](options) : route[1];
  };
  return { calls, client: createPostmarkClient({ secretArn: 'arn:example', pin, getSecret: async () => secret, fetch, ...overrides }) };
}

test('verifies the pinned template byte-for-byte and the suppression list before one templated POST', async () => {
  const { calls, client: postmark } = client([
    ['/templates/', response(templateRead)],
    [/^\/message-streams\/outbound\/suppressions\/dump/, response({ Suppressions: [] })],
    ['/email/withTemplate', response(accepted)],
  ]);
  const result = await postmark.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' });
  assert.deepEqual(result, { status: 'accepted', messageId: accepted.MessageID, submittedAt: accepted.SubmittedAt });
  const send = calls.find(([url]) => url.endsWith('/email/withTemplate'));
  const body = JSON.parse(send[1].body);
  assert.equal(body.TemplateId, pin.templateId);
  assert.equal(body.TemplateAlias, undefined);
  assert.equal(body.Tag, 'application-received');
  assert.deepEqual(body.Metadata, { opda_registration_id: '00000000-0000-4000-8000-000000000001',
    opda_domain_id: 'conveyancing', opda_template_sha256: pin.fingerprint });
  assert.ok(calls.every(([, options]) => options.redirect === 'error' && options.headers['X-Postmark-Server-Token'] === secret.serverToken));
  assert.ok(calls.every(([url]) => !url.includes('synthetic@') || url.includes('suppressions')), 'address only appears in the suppression query');
});

test('template drift, alias reassignment or a mismatched server block sending without a POST', async () => {
  for (const drift of [{ HtmlBody: `${template.HtmlBody} ` }, { TemplateId: 1 }, { Active: false }, { AssociatedServerId: 1 }, { Subject: 'x' }]) {
    const { calls, client: postmark } = client([['/templates/', response({ ...templateRead, ...drift })]]);
    await assert.rejects(postmark.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }), /template/);
    assert.ok(!calls.some(([url]) => url.endsWith('/email/withTemplate')));
  }
  const { client: wrongServer } = client([], { getSecret: async () => ({ ...secret, serverId: 1 }) });
  await assert.rejects(wrongServer.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }), /configuration/);
});

test('a suppressed recipient is reported, never posted, and never retried', async () => {
  const { calls, client: postmark } = client([
    ['/templates/', response(templateRead)],
    [/suppressions/, response({ Suppressions: [{ EmailAddress: 'synthetic@example.test', SuppressionReason: 'HardBounce' }] })],
  ]);
  assert.deepEqual(await postmark.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }), { status: 'suppressed' });
  assert.ok(!calls.some(([url]) => url.endsWith('/email/withTemplate')));
});

test('provider rejection is final; 429 waits for Retry-After; 5xx after dispatch is not retried blindly', async () => {
  const rejected = client([['/templates/', response(templateRead)], [/suppressions/, response({ Suppressions: [] })],
    ['/email/withTemplate', response({ ErrorCode: 406, Message: 'inactive', MessageID: '00000000-0000-0000-0000-000000000000' }, 422)]]);
  assert.deepEqual(await rejected.client.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }),
    { status: 'rejected', errorCode: 406 });
  const throttled = client([['/templates/', response(templateRead)], [/suppressions/, response({ Suppressions: [] })],
    ['/email/withTemplate', response({ ErrorCode: 429, Message: 'slow down' }, 429, { 'Retry-After': '300' })]]);
  await assert.rejects(throttled.client.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }),
    error => error instanceof RetryLater && error.seconds === 300);
  const outage = client([['/templates/', response(templateRead)], [/suppressions/, response({ Suppressions: [] })],
    ['/email/withTemplate', response({ ErrorCode: 0 }, 503)]]);
  await assert.rejects(outage.client.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }), /outcome unknown/);
});

test('the production pin from settings.mjs constructs the client exactly as the Lambda does', async () => {
  // Regression: the first live invocation failed because the already-built pin was re-validated as raw.
  assert.deepEqual(acknowledgementPin(ACKNOWLEDGEMENT_PIN), ACKNOWLEDGEMENT_PIN);
  assert.throws(() => acknowledgementPin({ ...ACKNOWLEDGEMENT_PIN, alias: 'other-template' }), /another template contract/);
  const calls = [];
  const live = createPostmarkClient({ secretArn: 'arn:example', pin: ACKNOWLEDGEMENT_PIN,
    getSecret: async () => ({ ...secret, serverId: ACKNOWLEDGEMENT_PIN.serverId }),
    fetch: async (url) => { calls.push(url); return response({ ...templateRead, TemplateId: ACKNOWLEDGEMENT_PIN.templateId,
      AssociatedServerId: ACKNOWLEDGEMENT_PIN.serverId, HtmlBody: 'x' }); } });
  // Content drift against the real pin must be refused, proving the pin values were actually applied.
  await assert.rejects(live.sendAcknowledgement(payload(), { registrationId: '00000000-0000-4000-8000-000000000001' }), /template verification failed/);
  assert.ok(calls[0].endsWith(`/templates/${ACKNOWLEDGEMENT_PIN.alias}`));
});
