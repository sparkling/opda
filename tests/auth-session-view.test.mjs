import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionView } from '../src/scripts/auth-session-view.mjs';

test('late subscribers receive the latest view without another identity request or persisted data', () => {
  const view = createSessionView(), seen = [];
  view.publish({ email: 'private@example.test', name: 'Member', picture: 'https://example.test/avatar', token: 'not-for-sharing' });
  const unsubscribe = view.subscribe(value => seen.push(value));
  assert.deepEqual(seen, [{ authenticated: true, name: 'Member' }]);
  assert.ok(Object.isFrozen(seen[0]));
  view.publish(null);
  assert.deepEqual(seen[1], { authenticated: false, name: '' });
  unsubscribe(); view.publish({ name: 'Another member' });
  assert.equal(seen.length, 2);
});

test('unconfirmed status is distinct from a confirmed signed-out session', () => {
  const view = createSessionView(), seen = [];
  view.subscribe(value => seen.push(value));
  assert.equal(seen[0], undefined);
  view.publish({ email: 'private@example.test', name: null });
  assert.deepEqual(seen[1], { authenticated: true, name: 'Participant' });
});
