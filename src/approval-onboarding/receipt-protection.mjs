import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/** Separate from certificate signing; ciphertext binds to one participant. */
export function createReceiptProtection(keyBase64) {
  if (typeof keyBase64 !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(keyBase64)) throw new TypeError('Invalid receipt encryption configuration');
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) throw new TypeError('Invalid receipt encryption configuration');
  function aad(participantId) {
    if (typeof participantId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(participantId)) throw new TypeError('Invalid receipt owner');
    return Buffer.from(`opda:approval-onboarding:receipts:v1:${participantId}`);
  }
  return {
    protectReceipts(receipts, participantId) {
      const text = JSON.stringify(receipts);
      if (Buffer.byteLength(text) > 200000) throw new Error('Onboarding receipt exceeds limit');
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(aad(participantId));
      const bytes = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      return { version: 1, algorithm: 'A256GCM', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: bytes.toString('base64') };
    },
    unprotectReceipts(envelope, participantId) {
      try {
        if (envelope?.version !== 1 || envelope.algorithm !== 'A256GCM' || typeof envelope.data !== 'string'
          || envelope.data.length > 270000 || Object.keys(envelope).sort().join(',') !== 'algorithm,data,iv,tag,version') throw Error();
        const iv = Buffer.from(envelope.iv, 'base64'), tag = Buffer.from(envelope.tag, 'base64');
        if (iv.length !== 12 || tag.length !== 16) throw Error();
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAAD(aad(participantId));
        decipher.setAuthTag(tag);
        return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString('utf8'));
      } catch { throw new Error('Onboarding receipt integrity check failed'); }
    },
  };
}
