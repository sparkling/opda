import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import { Unauthorized, createTokenValidator, normalizeServiceUrl, trustedIssuers } from '../config/aws/teams-approvals/token.mjs';

const BOT = '11111111-2222-4333-8444-555555555555';
const TENANT = '143540d4-4fbc-4005-882a-29656cd01a36';
const NOW = Date.parse('2026-09-16T09:00:00Z');
const serviceUrl = 'https://smba.trafficmanager.net/emea/';
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const { publicKey: otherKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = (key, kid, endorsements = ['msteams']) => ({ ...key.export({ format: 'jwk' }), kid, endorsements });
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');

function sign(claims, { kid = 'k1', alg = 'RS256', key = privateKey } = {}) {
  const input = `${b64({ alg, typ: 'JWT', kid })}.${b64({ iss: 'https://api.botframework.com', aud: BOT,
    exp: Math.floor(NOW / 1000) + 600, nbf: Math.floor(NOW / 1000) - 60, serviceurl: serviceUrl, ...claims })}`;
  const signature = createSign('sha256').update(input).sign(key).toString('base64url');
  return `Bearer ${input}.${signature}`;
}

function setup(keys = [jwk(publicKey, 'k1')]) {
  const fetched = [];
  const fetch = async url => { fetched.push(url); return { ok: true, json: async () => ({ keys }) }; };
  const validate = createTokenValidator({ botAppId: BOT, tenantId: TENANT, fetch, now: () => NOW });
  return { validate, fetched };
}
const activity = { serviceUrl, channelId: 'msteams' };

test('a connector token for this bot, signed by a Teams-endorsed Bot Framework key, is accepted and keys are cached', async () => {
  const { validate, fetched } = setup();
  const claims = await validate(sign({}), activity);
  assert.deepEqual(claims, { issuer: 'https://api.botframework.com', appId: BOT, serviceUrl });
  await validate(sign({}), { ...activity, serviceUrl: 'https://smba.trafficmanager.net/EMEA' });
  assert.deepEqual(fetched, ['https://login.botframework.com/v1/.well-known/keys']);
});

test('single-tenant issuers resolve to the tenant discovery keys', async () => {
  assert.deepEqual([...trustedIssuers(TENANT).keys()], ['https://api.botframework.com',
    `https://sts.windows.net/${TENANT}/`, `https://login.microsoftonline.com/${TENANT}/v2.0`]);
  const { validate, fetched } = setup();
  await validate(sign({ iss: `https://login.microsoftonline.com/${TENANT}/v2.0` }), activity);
  assert.deepEqual(fetched, [`https://login.microsoftonline.com/${TENANT}/discovery/v2.0/keys`]);
  assert.throws(() => trustedIssuers('not-a-tenant'), /tenant/);
});

test('every forged, replayed, retargeted or mis-signed token is refused', async () => {
  const { validate } = setup();
  const refused = async (authorization, act = activity) => assert.rejects(validate(authorization, act), Unauthorized);
  await refused(undefined);
  await refused('Basic abc');
  await refused(sign({ aud: '99999999-2222-4333-8444-555555555555' }));
  await refused(sign({ iss: 'https://login.microsoftonline.com/other-tenant/v2.0' }));
  await refused(sign({ exp: Math.floor(NOW / 1000) - 600 }));
  await refused(sign({ nbf: Math.floor(NOW / 1000) + 600 }));
  await refused(sign({ serviceurl: 'https://attacker.test/' }));
  await refused(sign({}), { ...activity, serviceUrl: 'https://smba.trafficmanager.net/amer/' });
  await refused(sign({}, { alg: 'HS256' }));
  await refused(sign({}, { kid: 'unknown' }));
  const { privateKey: wrongKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  await refused(sign({}, { key: wrongKey }));
  const tampered = sign({}).replace(/\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+$/, (_, payload) => `.${payload}.AAAA`);
  await refused(tampered);
});

test('a key endorsed for another channel cannot authenticate a Teams activity; a rotated key is refetched once', async () => {
  const { validate } = setup([jwk(publicKey, 'k1', ['webchat'])]);
  await assert.rejects(validate(sign({}), activity), Unauthorized);
  let calls = 0;
  const fetch = async () => ({ ok: true, json: async () => ({ keys: ++calls === 1 ? [jwk(otherKey, 'old')] : [jwk(publicKey, 'k1')] }) });
  const rotated = createTokenValidator({ botAppId: BOT, tenantId: TENANT, fetch, now: () => NOW });
  await rotated(sign({}), activity);
  assert.equal(calls, 2);
  const down = createTokenValidator({ botAppId: BOT, tenantId: TENANT, fetch: async () => ({ ok: false }), now: () => NOW });
  await assert.rejects(down(sign({}), activity), /Signing keys unavailable/);
});

test('a key document the size the Bot Framework really publishes is accepted; an absurd one is not', async () => {
  const padding = n => Array.from({ length: n }, (_, i) => jwk(otherKey, `pad-${i}`, ['telephony']));
  const { validate } = setup([...padding(250), jwk(publicKey, 'k1')]);
  assert.deepEqual((await validate(sign({}), activity)).appId, BOT);
  const { validate: refuse } = setup([...padding(2001), jwk(publicKey, 'k1')]);
  await assert.rejects(refuse(sign({}), activity), /Signing keys unavailable/);
});

test('service URLs compare case-insensitively without a trailing slash', () => {
  assert.equal(normalizeServiceUrl('https://smba.trafficmanager.net/EMEA/'), 'https://smba.trafficmanager.net/emea');
  assert.equal(normalizeServiceUrl(undefined), '');
  assert.throws(() => createTokenValidator({ botAppId: '', tenantId: TENANT }), /bot configuration/);
});
