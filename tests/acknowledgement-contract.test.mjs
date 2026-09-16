import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACKNOWLEDGEMENT_CONTRACT, buildAcknowledgementPayload, compileAcknowledgementTemplate,
  fingerprintAcknowledgementTemplate,
} from '../config/aws/hubspot-participation/acknowledgement.mjs';
import { WORKING_GROUP_LABELS } from '../config/aws/hubspot-participation/properties.mjs';

const shells = {
  HtmlBody: readFileSync(new URL('../docs/templates/working-group-application-received-email.html', import.meta.url), 'utf8'),
  TextBody: readFileSync(new URL('../docs/templates/working-group-application-received-email.txt', import.meta.url), 'utf8'),
};
const logoBase64 = readFileSync(new URL('../docs/templates/assets/opda-email-logo.png', import.meta.url)).toString('base64');
const input = { displayName: 'Synthetic Example Person', email: 'Synthetic@Example.test', groupId: 'finance-and-banking' };

test('one reviewed template carries both applicant and working-group variables; no timescale is promised', () => {
  assert.equal(ACKNOWLEDGEMENT_CONTRACT.alias, 'working-group-application-received-v1');
  assert.match(ACKNOWLEDGEMENT_CONTRACT.subject, /\{\{group_name\}\}/);
  const template = compileAcknowledgementTemplate(shells);
  assert.equal(template.Alias, ACKNOWLEDGEMENT_CONTRACT.alias);
  assert.equal(template.Subject, ACKNOWLEDGEMENT_CONTRACT.subject);
  assert.equal(template.TemplateType, 'Standard');
  assert.equal(template.LayoutTemplate, null);
  for (const body of [template.HtmlBody, template.TextBody]) {
    assert.ok(body.includes('{{display_name}}') && body.includes('{{group_name}}'));
    assert.doesNotMatch(body, /\[\[|\]\]|\{\{\{|pm:unsubscribe/u);
    // The only interpolations are the two reviewed Mustachio variables.
    assert.doesNotMatch(body.replaceAll('{{display_name}}', '').replaceAll('{{group_name}}', ''), /[{}]/u);
    // No delivery promise: reviews have no committed timescale.
    assert.doesNotMatch(body, /\b(?:within|working days|business days|hours|weeks?)\b/iu);
  }
  assert.ok(template.HtmlBody.includes('cid:opda-logo') && template.HtmlBody.includes('width="680"'));
  assert.match(template.TextBody, /smartdata@openpropdata\.org\.uk/);
});

test('fingerprint is the byte-exact pin over the compiled contract', () => {
  const template = compileAcknowledgementTemplate(shells);
  const expected = createHash('sha256').update(JSON.stringify([template.Alias, template.Subject,
    template.HtmlBody, template.TextBody, 'Standard', null])).digest('hex');
  assert.equal(fingerprintAcknowledgementTemplate(template), expected);
  assert.throws(() => fingerprintAcknowledgementTemplate({ ...template, Subject: 'Changed' }), /contract/);
  assert.throws(() => fingerprintAcknowledgementTemplate({ ...template, HtmlBody: template.HtmlBody.replace('cid:opda-logo', 'x') }), /logo/);
});

test('shell drift is rejected before it can reach Postmark', () => {
  assert.throws(() => compileAcknowledgementTemplate({ ...shells, HtmlBody: shells.HtmlBody.replace('[[NOTICE_TITLE]]', 'x') }), /incomplete/);
  assert.throws(() => compileAcknowledgementTemplate({ ...shells, TextBody: `${shells.TextBody}[[UNREVIEWED]]` }), /unreviewed/);
  assert.throws(() => compileAcknowledgementTemplate({ ...shells, TextBody: `${shells.TextBody}{{{raw}}}` }), /raw/);
  assert.throws(() => compileAcknowledgementTemplate({ ...shells, extra: '' }), /unsupported/);
});

test('payload names one working group per send and never carries free text or tracking', () => {
  const payload = buildAcknowledgementPayload(input, { logoBase64 });
  assert.equal(payload.To, 'synthetic@example.test');
  assert.equal(payload.TemplateAlias, ACKNOWLEDGEMENT_CONTRACT.alias);
  assert.deepEqual(payload.TemplateModel, {
    display_name: 'Synthetic Example Person', group_id: 'finance-and-banking',
    group_name: `${WORKING_GROUP_LABELS['finance-and-banking']} Working Group`,
  });
  assert.equal(payload.From, 'Smart Property Data Trust Framework <smartdata@openpropdata.org.uk>');
  assert.equal(payload.MessageStream, 'outbound');
  assert.equal(payload.TrackOpens, false);
  assert.equal(payload.TrackLinks, 'None');
  assert.equal(payload.Attachments[0].ContentID, 'cid:opda-logo');
  for (const groupId of Object.keys(WORKING_GROUP_LABELS)) {
    assert.equal(buildAcknowledgementPayload({ ...input, groupId }, { logoBase64 }).TemplateModel.group_id, groupId);
  }
});

test('payload rejects unknown groups, unsafe names, malformed addresses and non-PNG logos', () => {
  assert.throws(() => buildAcknowledgementPayload({ ...input, groupId: 'administrator' }, { logoBase64 }), /group/);
  assert.throws(() => buildAcknowledgementPayload({ ...input, displayName: '<b>x</b>' }, { logoBase64 }), /displayName/);
  assert.throws(() => buildAcknowledgementPayload({ ...input, displayName: '{{group_name}}' }, { logoBase64 }), /displayName/);
  assert.throws(() => buildAcknowledgementPayload({ ...input, email: 'two@example.test, three@example.test' }, { logoBase64 }), /email/);
  assert.throws(() => buildAcknowledgementPayload({ ...input, extra: 1 }, { logoBase64 }), /unsupported/);
  assert.throws(() => buildAcknowledgementPayload(input, { logoBase64: Buffer.from('not a png').toString('base64') }), /PNG/);
});
