import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import { createReceiptProtection } from '../src/approval-onboarding/receipt-protection.mjs';

test('private redemption receipts are encrypted before database and backup persistence', () => {
  const cipher = createReceiptProtection(randomBytes(32).toString('base64'));
  const value = { graph: { identity: { redemptionUrl: 'https://login.microsoftonline.com/redeem?ticket=synthetic' } }, sharepoint: {}, mail: {} };
  const first = cipher.protectReceipts(value, 'participant-1');
  const second = cipher.protectReceipts(value, 'participant-1');
  assert.notEqual(first.iv, second.iv);
  assert.ok(!JSON.stringify(first).includes('synthetic'));
  assert.deepEqual(cipher.unprotectReceipts(first, 'participant-1'), value);
  assert.throws(() => cipher.unprotectReceipts(first, 'participant-2'), /integrity/);
  assert.throws(() => cipher.unprotectReceipts({ ...first, tag: randomBytes(16).toString('base64') }, 'participant-1'), /integrity/);
  assert.throws(() => createReceiptProtection(randomBytes(32).toString('base64')).unprotectReceipts(first, 'participant-1'), /integrity/);
});

test('receipt protection refuses malformed configuration, owners and envelopes', () => {
  for (const key of [undefined, '', 'not-a-key', randomBytes(24).toString('base64')]) assert.throws(() => createReceiptProtection(key));
  const cipher = createReceiptProtection(randomBytes(32).toString('base64'));
  for (const owner of ['', '../participant', 'a'.repeat(129), 1]) assert.throws(() => cipher.protectReceipts({}, owner));
  for (const envelope of [null, {}, { version: 1, algorithm: 'none' }]) assert.throws(() => cipher.unprotectReceipts(envelope, 'participant'));
  assert.throws(() => cipher.protectReceipts({ text: 'a'.repeat(200001) }, 'participant'), /limit/);
});
