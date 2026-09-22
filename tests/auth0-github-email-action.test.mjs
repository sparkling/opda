import assert from 'node:assert/strict';
import test from 'node:test';
import action from '../config/auth0/github-email-action.cjs';

const email = 'member@example.test';
const event = () => ({ client: { client_id: 'xjPgyXLJllYtefV6LZkZ6oYnce89RlZT' },
  connection: { name: 'github' }, user: { user_id: 'github|311648', email },
  secrets: { OPDA_AUTH0_M2M_CLIENT_ID: 'm2m', OPDA_AUTH0_M2M_CLIENT_SECRET: 'secret' } });

function setup(addresses = [{ email, primary: true, verified: true }]) {
  const calls = [], claims = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const body = url.endsWith('/oauth/token') ? { access_token: 'management-token' }
      : url.includes('/api/v2/users/') ? { user_id: 'github|311648', identities: [
        { provider: 'github', user_id: 311648, access_token: 'github-token' }] } : addresses;
    return { ok: true, json: async () => body };
  };
  const api = { idToken: { setCustomClaim: (...args) => claims.push(args) } };
  return { calls, claims, fetchImpl, api };
}

test('OPDA GitHub action checks the current upstream primary verified email', async () => {
  const s = setup();
  await action.onExecutePostLogin(event(), s.api, s.fetchImpl);
  assert.deepEqual(s.claims, [['https://opda.org.uk/github_verified_email', email]]);
  assert.equal(s.calls.length, 3);
  assert.equal(s.calls[1].options.headers.authorization, 'Bearer management-token');
  assert.equal(s.calls[2].options.headers.authorization, 'Bearer github-token');
  assert.match(s.calls[2].url, /^https:\/\/api\.github\.com\/user\/emails\?/u);
});

test('OPDA GitHub action refuses unverified, secondary, mismatched and absent emails', async () => {
  for (const addresses of [
    [{ email, primary: true, verified: false }],
    [{ email, primary: false, verified: true }],
    [{ email: 'other@example.test', primary: true, verified: true }],
    [], null,
  ]) {
    const s = setup(addresses);
    await action.onExecutePostLogin(event(), s.api, s.fetchImpl);
    assert.deepEqual(s.claims, []);
  }
});

test('OPDA GitHub action is isolated to its client and fails closed on upstream errors', async () => {
  const s = setup(), other = event(); other.client.client_id = 'another-client';
  await action.onExecutePostLogin(other, s.api, s.fetchImpl);
  assert.equal(s.calls.length, 0);
  const failure = setup();
  await action.onExecutePostLogin(event(), failure.api, async () => { throw Error('network unavailable'); });
  assert.deepEqual(failure.claims, []);
});
