import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { marketingPacks } from '../src/data/marketing/packs.mjs';
import {
  EXPECTED_PACK_IDS,
  checkMarketingAssets,
  validateMarketingPacks,
  verifySourceAssetRecord,
} from '../scripts/marketing/build-assets.mjs';
import { sha256 } from '../scripts/marketing/lib.mjs';
import { emailPreviewPath, isScriptFreeEmailPreview, matchesScriptFreeEmailPreview } from './e2e/support.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'public', 'marketing');
const FORBIDDEN = /(?:teams\.cloud\.microsoft|sharepoint\.com|login\.microsoftonline\.com|invite_redeem_url|\baccess_url\b|\bdisplay_name\b|pm:unsubscribe|\{\{[^}]+\}\})/iu;

async function text(relativePath) {
  return readFile(path.join(OUTPUT, relativePath), 'utf8');
}

async function filesBelow(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory()
      ? filesBelow(path.join(directory, entry.name), relative)
      : [relative];
  }));
  return nested.flat().sort();
}

function zipRecords(buffer) {
  const records = [];
  for (let offset = 0; offset <= buffer.length - 46;) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      offset += 1;
      continue;
    }
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    records.push({
      name: buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'),
      time: buffer.readUInt16LE(offset + 12),
      date: buffer.readUInt16LE(offset + 14),
    });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return records.sort((left, right) => left.name.localeCompare(right.name));
}

function jpegMetadataMarkers(buffer) {
  const markers = [];
  let offset = 2;
  while (offset + 4 <= buffer.length && buffer[offset] === 0xff) {
    const marker = buffer[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xfe || (marker >= 0xe1 && marker <= 0xef)) markers.push(marker);
    offset += 2 + length;
  }
  return markers;
}

test('canonical marketing data defines the seven public campaign packs', () => {
  assert.deepEqual(marketingPacks.map(({ id }) => id), EXPECTED_PACK_IDS);
  assert.doesNotThrow(() => validateMarketingPacks(marketingPacks, { publicDir: path.join(ROOT, 'public') }));
  const injected = structuredClone(marketingPacks);
  injected[0].email.member.subject = 'Safe subject\r\nFrom: someone@example.com';
  assert.throws(
    () => validateMarketingPacks(injected, { publicDir: path.join(ROOT, 'public') }),
    /header|private|unresolved/iu,
  );
  for (const invalidUrl of [
    'https://user@opda.org.uk/join',
    'https://opda.org.uk:444/join',
    'https://opda.org.uk/join#fragment',
    'https://opda.org.uk/join?context=wrong',
  ]) {
    const invalid = structuredClone(marketingPacks);
    invalid[0].signupUrl = invalidUrl;
    assert.throws(() => validateMarketingPacks(invalid, { publicDir: path.join(ROOT, 'public') }), /signup/iu);
  }
});

test('source asset records fail closed when source bytes change', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'opda-marketing-source-'));
  try {
    const source = path.join(directory, 'source.jpg');
    const original = Buffer.from('original source bytes');
    await writeFile(source, original);
    const record = { path: 'source.jpg', sha256: sha256(original), bytes: original.length };
    assert.doesNotThrow(() => verifySourceAssetRecord(directory, record));
    await writeFile(source, 'changed source bytes');
    assert.throws(() => verifySourceAssetRecord(directory, record), /drift/iu);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('generated manifest is complete, hashed and current', async () => {
  const manifest = JSON.parse(await text('manifest.json'));
  assert.equal(manifest.schemaVersion, 'opda.marketing-assets.v1');
  assert.deepEqual(manifest.packs.map(({ id }) => id), EXPECTED_PACK_IDS);
  assert.match(manifest.inputDigest, /^[a-f0-9]{64}$/u);
  assert.match(manifest.generatorDigest, /^[a-f0-9]{64}$/u);
  assert.doesNotThrow(() => checkMarketingAssets({ packs: marketingPacks, rootDir: ROOT, outputDir: OUTPUT }));

  const emitted = await filesBelow(OUTPUT);
  assert.equal(emitted.length, manifest.totalFiles, 'summary file count must match the emitted asset set');
  assert.doesNotMatch((await Promise.all(emitted
    .filter((name) => /\.(?:html|txt|eml|json)$/u.test(name))
    .map((name) => text(name)))).join('\n'), FORBIDDEN);
});

test('every email voice is a ready-to-open multipart message with inline PNG and JPEG art', async () => {
  for (const pack of marketingPacks) {
    const voices = ['member', 'opda', ...(pack.email.personal ? ['personal'] : [])];
    for (const voice of voices) {
      const base = `${pack.id}/email/${voice}`;
      const [eml, html, plain] = await Promise.all([
        readFile(path.join(OUTPUT, `${base}.eml`)),
        text(`${base}.html`),
        text(`${base}.txt`),
      ]);
      const message = eml.toString('utf8');
      const subjectBlock = message.match(/^Subject: ([^\r]+)(?:\r\n ([^\r]+))*/u)?.[0];
      assert.ok(subjectBlock, 'expected a folded Subject header');
      const encodedWords = [...subjectBlock.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/gu)];
      assert.ok(encodedWords.length >= 1);
      assert.ok(encodedWords.every(({ 0: word }) => word.length <= 75), 'RFC 2047 encoded words must not exceed 75 characters');
      assert.ok(subjectBlock.split('\r\n').every((line) => line.length <= 78), 'Subject header lines must be folded');
      assert.equal(encodedWords.map((match) => Buffer.from(match[1], 'base64').toString('utf8')).join(''), pack.email[voice].subject);
      assert.match(message, /\r\nX-Unsent: 1\r\n/u);
      assert.doesNotMatch(message, /\r\n(?:To|From):/iu);
      assert.match(message, /Content-Type: multipart\/related;/u);
      assert.match(message, /type="multipart\/alternative"; start="<opda-body>"/u);
      assert.match(message, /Content-Type: multipart\/alternative;/u);
      assert.match(message, /Content-ID: <opda-body>/u);
      assert.match(message, /Content-Type: image\/png/u);
      assert.match(message, /Content-ID: <opda-logo>/u);
      assert.match(message, /Content-Type: image\/jpeg/u);
      assert.match(message, /Content-ID: <opda-hero>/u);
      assert.doesNotMatch(message, /\r\n(?:From|Sender|Reply-To|To|Cc|Bcc|Return-Path):/iu);
      assert.doesNotMatch(message, /(?<!\r)\n/u, 'EML must use CRLF line endings');
      const htmlPart = message.match(/Content-Type: text\/html;[^\r]+\r\nContent-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=\r\n]+?)\r\n--/u)?.[1];
      assert.ok(htmlPart, 'expected an encoded HTML MIME part');
      const decodedHtml = Buffer.from(htmlPart.replaceAll(/\s/gu, ''), 'base64').toString('utf8');
      assert.deepEqual([...decodedHtml.matchAll(/cid:([a-z0-9-]+)/gu)].map((match) => match[1]).sort(), ['opda-hero', 'opda-logo']);
      if (voice === 'opda') {
        const packUrl = `https://opda.org.uk/marketing/packs/${pack.id}`;
        assert.ok(decodedHtml.includes(`href="${packUrl}"`), 'the OPDA campaign-pack URL must be clickable in the EML');
        assert.ok(html.includes(`href="${packUrl}"`), 'the OPDA campaign-pack URL must be clickable in the HTML preview');
      }
      const encodedBlocks = [...message.matchAll(/Content-Transfer-Encoding: base64\r\n(?:Content-[^\r]+\r\n)*\r\n([A-Za-z0-9+/=\r\n]+?)\r\n--/gu)];
      assert.ok(encodedBlocks.length >= 4);
      for (const [, block] of encodedBlocks) {
        assert.ok(block.split('\r\n').every((line) => line.length <= 76), 'base64 lines must not exceed 76 characters');
      }
      assert.match(html, /src="data:image\/png;base64,/u);
      assert.match(html, /src="data:image\/jpeg;base64,/u);
      assert.doesNotMatch(html, /src=["']https?:/iu);
      assert.doesNotMatch(html, /cid:/iu);
      assert.equal(isScriptFreeEmailPreview(html), true, 'email previews must remain script-free inside the sandbox');
      assert.ok(plain.includes(pack.signupUrl));
      assert.doesNotMatch(`${message}\n${html}\n${plain}`, FORBIDDEN);
    }
  }
});

test('sandbox diagnostics can only recognise known script-free email documents', () => {
  const origin = 'https://opda.org.uk';
  assert.equal(emailPreviewPath(`${origin}/marketing/general/email/member.html`, origin), '/marketing/general/email/member.html');
  for (const url of [`${origin}/marketing/unknown/email/member.html`, `${origin}/marketing/general/slides.html`, `${origin}/marketing/general/email/member.html?changed`, 'https://example.com/marketing/general/email/member.html', 'https://user@opda.org.uk/marketing/general/email/member.html']) {
    assert.equal(emailPreviewPath(url, origin), null);
  }
  for (const html of ['<script>alert(1)</script>', '<img onerror="alert(1)">', '<a href="java&#x73;cript:alert(1)">link</a>', '<iframe srcdoc="text"></iframe>', '<meta http-equiv="refresh" content="0;url=/join">']) {
    assert.equal(isScriptFreeEmailPreview(html), false);
  }
  const expected = Buffer.from('<html><body><p>Invitation</p></body></html>');
  assert.equal(matchesScriptFreeEmailPreview(expected, expected), true);
  assert.equal(matchesScriptFreeEmailPreview(Buffer.from('<p>Different response</p>'), expected), false);
  const active = Buffer.from('<script>alert(1)</script>');
  assert.equal(matchesScriptFreeEmailPreview(active, active), false);
});

test('each pack includes portable campaign copy, editable slides and a deterministic bundle', async () => {
  for (const pack of marketingPacks) {
    const base = path.join(OUTPUT, pack.id);
    const [onePager, slides, opdaPost, partnerPost, manifest, archive] = await Promise.all([
      readFile(path.join(base, 'one-pager.html'), 'utf8'),
      readFile(path.join(base, 'slides.html'), 'utf8'),
      readFile(path.join(base, 'linkedin', 'opda.txt'), 'utf8'),
      readFile(path.join(base, 'linkedin', 'partner.txt'), 'utf8'),
      readFile(path.join(base, 'manifest.json'), 'utf8').then(JSON.parse),
      readFile(path.join(base, `${pack.id}-campaign-pack.zip`)),
    ]);
    for (const imageName of ['hero.jpg', 'social-card.jpg']) {
      const image = await readFile(path.join(base, 'images', imageName));
      assert.equal(image.readUInt16BE(0), 0xffd8);
      assert.deepEqual(jpegMetadataMarkers(image), [], `${imageName} must not carry comments or application metadata`);
    }
    for (const html of [onePager, slides]) {
      assert.match(html, /<!doctype html>/iu);
      assert.match(html, /data:image\/jpeg;base64,/u);
      assert.match(html, /data:image\/png;base64,/u);
      assert.doesNotMatch(html, /<(?:link|script)[^>]+(?:src|href)=["']https?:/iu);
    }
    assert.match(onePager, /@page\s*\{[^}]*size:\s*A4/isu);
    assert.match(onePager, /@media print\s*\{.*?\.hero\s*\{display:none/isu);
    assert.match(onePager, /@media print\s*\{.*?\.masthead\s*\{padding:8mm/isu);
    assert.match(slides, /data-action="edit"/u);
    assert.match(slides, /data-action="copy"/u);
    assert.match(slides, /data-action="download"/u);
    assert.match(slides, /role="status"[^>]*aria-live="polite"/u);
    assert.match(slides, /slides\[current\]\.querySelectorAll/u, 'copy must read only the current slide');
    assert.match(slides, /navigator\.clipboard\?\.writeText/u);
    assert.match(slides, /document\.execCommand\('copy'\)/u, 'copy must include an offline fallback');
    assert.match(slides, /Copy unavailable\. Select the slide text and copy it manually\./u);
    assert.match(slides, /closest\('input,textarea,select,button,a,\[contenteditable="true"\]'\)/u);
    assert.match(slides, /@media print/iu);
    assert.ok(opdaPost.includes(pack.signupUrl));
    assert.ok(partnerPost.includes(pack.signupUrl));
    assert.match(manifest.inputDigest, /^[a-f0-9]{64}$/u);
    assert.ok(manifest.files.every(({ path: filePath, sha256, bytes }) => (
      !path.isAbsolute(filePath) && !filePath.includes('..')
      && /^[a-f0-9]{64}$/u.test(sha256) && Number.isSafeInteger(bytes) && bytes > 0
    )));
    const records = zipRecords(archive);
    const members = records.map(({ name }) => name);
    assert.ok(members.includes('one-pager.html'));
    assert.ok(members.includes('slides.html'));
    assert.ok(members.includes('email/member.eml'));
    assert.ok(members.includes('email/opda.eml'));
    assert.ok(members.includes('images/social-card.jpg'));
    assert.ok(members.includes('manifest.json'));
    assert.ok(records.every(({ time, date }) => time === 0 && date === 0x21), 'ZIP timestamps must be normalized');
  }
});

test('LinkedIn sequences emit one stable text file per supplied post', async () => {
  for (const pack of marketingPacks) {
    for (const voice of ['opda', 'partner']) {
      const posts = pack.linkedin[voice].posts ?? [];
      for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index];
        const filename = `${voice}-${String(index + 1).padStart(2, '0')}-${post.id}.txt`;
        const rendered = await text(`${pack.id}/linkedin/${filename}`);
        assert.ok(rendered.includes(post.title));
        assert.ok(rendered.includes(post.copy));
        assert.ok(rendered.includes(pack.signupUrl));
      }
    }
  }
});
