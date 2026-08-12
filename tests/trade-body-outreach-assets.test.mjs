import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paths = {
  adr: new URL('../docs/adr/ADR-0069-public-working-group-recruitment-and-signup.md', import.meta.url),
  register: new URL('../docs/recruitment/2026-08-bounded-context-trade-body-outreach.md', import.meta.url),
  parameters: new URL('../docs/recruitment/2026-08-bounded-context-outreach-parameters.json', import.meta.url),
  html: new URL('../docs/templates/bounded-context-trade-body-outreach-email.html', import.meta.url),
  plain: new URL('../docs/templates/bounded-context-trade-body-outreach-email.txt', import.meta.url),
};

const expectedContexts = [
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
];

const expectedPlaceholders = [
  'audience_description',
  'context_name',
  'context_scope',
  'contribution_examples',
  'email_subject',
  'organisation_name',
  'signup_url',
];

const placeholders = (source) => [...new Set(
  [...source.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gu)].map((match) => match[1]),
)].sort();

test('outreach templates use the same complete parameter contract', async () => {
  const [html, plain, parameterSource] = await Promise.all([
    readFile(paths.html, 'utf8'),
    readFile(paths.plain, 'utf8'),
    readFile(paths.parameters, 'utf8'),
  ]);
  const parameters = JSON.parse(parameterSource);

  assert.deepEqual(placeholders(html), expectedPlaceholders);
  assert.deepEqual(placeholders(plain), expectedPlaceholders);
  assert.equal(parameters.signup_url, 'https://opda.org.uk/working-groups/join');
  assert.deepEqual(Object.keys(parameters.contexts), expectedContexts);

  for (const context of Object.values(parameters.contexts)) {
    for (const key of expectedPlaceholders.filter((key) => !['organisation_name', 'signup_url'].includes(key))) {
      assert.equal(typeof context[key], 'string');
      assert.ok(context[key].trim().length > 0, `${key} must not be empty`);
    }
    assert.match(context.email_subject, /^Please share with your network:/u);

    for (const template of [html, plain]) {
      const rendered = template
        .replaceAll('{{organisation_name}}', 'Example organisation')
        .replaceAll('{{signup_url}}', parameters.signup_url)
        .replaceAll('{{audience_description}}', context.audience_description)
        .replaceAll('{{context_name}}', context.context_name)
        .replaceAll('{{context_scope}}', context.context_scope)
        .replaceAll('{{contribution_examples}}', context.contribution_examples)
        .replaceAll('{{email_subject}}', context.email_subject);
      assert.doesNotMatch(rendered, /\{\{[^}]+\}\}/u);
    }
  }

  for (const template of [html, plain]) {
    assert.match(template, /not asking you to provide a member list/iu);
    assert.match(template, /View and share the invitation/u);
    assert.doesNotMatch(template, /Listing your organisation in our outreach planning/u);
  }
});

test('register contains official contact routes for every advertised context', async () => {
  const register = await readFile(paths.register, 'utf8');
  for (const context of [
    'Conveyancing',
    'Estate Agency',
    'Surveying and Valuation',
    'Property Data Services',
    'Property Technology',
  ]) {
    assert.match(register, new RegExp(`\\| ${context} \\|`, 'u'));
  }

  const destinations = [...register.matchAll(/\]\((https:\/\/[^)]+|mailto:[^)]+)\)/gu)]
    .map((match) => match[1]);
  assert.ok(destinations.length >= 20);
  for (const destination of destinations) {
    assert.doesNotThrow(() => new URL(destination));
  }
  assert.match(register, /status: Research verified; no outreach sent/u);
});

test('ADR links all maintained outreach assets', async () => {
  const adr = await readFile(paths.adr, 'utf8');
  for (const filename of [
    '2026-08-bounded-context-trade-body-outreach.md',
    '2026-08-bounded-context-outreach-parameters.json',
    'bounded-context-trade-body-outreach-email.html',
    'bounded-context-trade-body-outreach-email.txt',
  ]) {
    assert.match(adr, new RegExp(filename.replaceAll('.', '\\.'), 'u'));
  }
});
