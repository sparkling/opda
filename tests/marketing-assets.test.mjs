import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

import { employerBrief, marketingPacks } from '../src/data/marketing/packs.mjs';
import { marketingTasks } from '../src/data/marketing/tasks.mjs';
import {
  EXPECTED_PACK_IDS,
  checkMarketingAssets,
  validateMarketingPacks,
  verifySourceAssetRecord,
} from '../scripts/marketing/build-assets.mjs';
import { sha256 } from '../scripts/marketing/lib.mjs';
import { renderCampaignInfographic } from '../scripts/marketing/rich-materials.mjs';
import * as richMaterials from '../scripts/marketing/rich-materials.mjs';
import { renderEmailPlain } from '../scripts/marketing/renderers.mjs';
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

test('Marketing illustrations are distinct placements with dimension-matched theme pairs', async () => {
  const manifestText = await readFile(path.join(ROOT, 'public/images/marketing/2026-09/manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestText);
  assert.doesNotMatch(manifestText, /\/Users\/|\.codex\/generated_images|exec-[a-f0-9-]+\.png/u, 'public provenance must not expose private generation paths');
  const illustrations = [
    { source: '/images/marketing/2026-09/landing-network-light.webp', width: 1536, height: 512 },
    ...marketingTasks.map(({ image }) => image),
    ...marketingPacks.map(({ hero }) => hero),
  ];
  assert.equal(illustrations.length, 14);
  assert.equal(manifest.assets.length, illustrations.length);
  assert.equal(new Set(illustrations.map(({ source }) => source)).size, illustrations.length);
  const hashes = new Set();
  for (const illustration of illustrations) {
    assert.match(illustration.source, /^\/images\/marketing\/2026-09\//u);
    const darkSource = illustration.darkSource ?? illustration.source.replace('-light.webp', '-dark.webp');
    for (const source of [illustration.source, darkSource]) {
      const bytes = await readFile(path.join(ROOT, 'public', source));
      const metadata = await sharp(bytes).metadata();
      assert.equal(metadata.width, illustration.width, `${source} width`);
      assert.equal(metadata.height, illustration.height, `${source} height`);
      assert.equal(metadata.format, 'webp', source);
      const record = manifest.assets.flatMap(({ light, dark }) => [light, dark]).find(({ file }) => file === source);
      assert.ok(record, `${source} has public provenance`);
      assert.equal(record.sha256, sha256(bytes), `${source} provenance matches the asset`);
      hashes.add(sha256(bytes));
    }
  }
  assert.equal(hashes.size, illustrations.length * 2, 'no identical artwork across placements or modes');
});

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
  const incomplete = structuredClone(marketingPacks);
  incomplete[0].linkedin.opda.posts.pop();
  assert.throws(() => validateMarketingPacks(incomplete), /three distinct posts/u);
  const repeated = structuredClone(marketingPacks);
  repeated[0].linkedin.partner.posts[1].id = repeated[0].linkedin.partner.posts[0].id;
  assert.throws(() => validateMarketingPacks(repeated), /three distinct posts/u);
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
  const postPath = `/marketing/general/linkedin/opda-01-${marketingPacks[0].linkedin.opda.posts[0].id}.html`;
  assert.equal(emailPreviewPath(`${origin}${postPath}`, origin), postPath);
  assert.equal(emailPreviewPath(`${origin}/marketing/general/linkedin/opda-01-invented.html`, origin), null);
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

test('newsletter and employer invitations have rich HTML and multipart embedded-image editions', async () => {
  for (const pack of marketingPacks) {
    const names = ['newsletter/short', 'newsletter/long', ...(pack.id === 'general' ? ['email/employer'] : [])];
    for (const name of names) {
      const [html, eml] = await Promise.all([text(`${pack.id}/${name}.html`), text(`${pack.id}/${name}.eml`)]);
      assert.equal(isScriptFreeEmailPreview(html), true);
      assert.match(html, /src="data:image\/png;base64,/u);
      assert.match(html, /src="data:image\/jpeg;base64,/u);
      assert.match(eml, /Content-Type: multipart\/related/u);
      assert.match(eml, /Content-ID: <opda-hero>/u);
      assert.doesNotMatch(html, /src=["']https?:/iu);
      assert.ok(html.includes(pack.signupUrl));
      assert.match(html, /target="_top"/u);
      if (name.startsWith('newsletter/')) {
        assert.match(html, /shared by your organisation/u);
        assert.doesNotMatch(html, /shared by a colleague/u);
      }
    }
  }
});

test('supplemental copy and image descriptions share the generated asset definitions', async () => {
  for (const pack of marketingPacks) {
    for (const kind of ['short', 'long']) {
      assert.equal(richMaterials.renderNewsletterPlain(pack, kind), await text(`${pack.id}/newsletter/${kind}.txt`));
    }
    const description = richMaterials.linkedInImageDescription(pack, 1);
    assert.ok((await text(`${pack.id}/images/contribution-infographic.svg`)).includes(description.replaceAll('&', '&amp;')));
    assert.ok(richMaterials.linkedInImageDescription(pack, 0).includes(pack.hero.alt));
    assert.equal(richMaterials.linkedInImageDescription(pack, 2), null);
  }
  const employer = richMaterials.supplementalEmail(marketingPacks[0], 'employer', employerBrief);
  assert.equal(renderEmailPlain(employer, 'personal'), await text('general/email/employer.txt'));
});

test('LinkedIn campaigns show all three posts, imagery and an accessible domain-specific infographic', async () => {
  const images = new Set();
  for (const pack of marketingPacks) {
    const svg = await text(`${pack.id}/images/contribution-infographic.svg`);
    assert.equal(svg, renderCampaignInfographic(pack));
    assert.match(svg, /viewBox="0 0 1200 628"/u);
    assert.match(svg, /role="img" aria-labelledby="campaign-[^"]+-title campaign-[^"]+-desc"/u);
    assert.equal((svg.match(/marker-end=/gu) ?? []).length, 2, 'the three stages have directed handoffs');
    assert.ok(svg.includes(pack.example.replaceAll('&', '&amp;')));
    const png = await readFile(path.join(OUTPUT, pack.id, 'images/contribution-infographic.png'));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 628);
    images.add(sha256(png));
    for (const voice of ['opda', 'partner']) {
      const html = await text(`${pack.id}/linkedin/${voice}.html`);
      assert.equal(isScriptFreeEmailPreview(html), true);
      assert.match(html, /data:image\/jpeg;base64,/u);
      assert.equal((html.match(/<article>/gu) ?? []).length, 3);
      assert.ok(html.includes(svg));
      for (const post of pack.linkedin[voice].posts) assert.ok(html.includes(post.title));
      assert.doesNotMatch(html, /<(?:script|iframe)|src=["']https?:/iu);
    }
  }
  assert.equal(images.size, marketingPacks.length, 'the content must be specific to every audience');
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
    assert.ok(slides.includes("slides[current].querySelector('.slide-copy').querySelectorAll("), 'copy must exclude speaker notes and read only the current slide content');
    assert.ok(slides.includes("clone.querySelectorAll('[data-action=\"notes\"],[data-action=\"edit\"]').forEach(node=>node.setAttribute('aria-pressed','false'))"), 'download must reset control states');
    assert.ok(slides.includes("delete clone.dataset.notes;delete clone.dataset.printMode"), 'download must discard transient presentation modes');
    assert.ok(slides.includes("clone.querySelector('.control-status').textContent=''"), 'download must not retain a stale copy notification');
    assert.match(slides, /navigator\.clipboard\?\.writeText/u);
    assert.match(slides, /document\.execCommand\('copy'\)/u, 'copy must include an offline fallback');
    assert.match(slides, /Copy unavailable\. Select the slide text and copy it manually\./u);
    assert.match(slides, /closest\('input,textarea,select,button,a,\[contenteditable="true"\]'\)/u);
    assert.match(slides, /@media print/iu);
    assert.match(slides, /\.slide\[aria-hidden="false"\]\{display:grid;grid-template-columns:minmax\(0,1fr\);/u);
    assert.match(slides, /@media screen and\s*\(min-width:801px\)\{html\[data-notes="true"\] \.slide\[aria-hidden="false"\]\{grid-template-columns:minmax\(0,1fr\) minmax\(260px,34vw\)/u);
    for (const action of ['notes', 'edit']) {
      assert.ok(slides.includes(`data-action="${action}" aria-pressed="false"`));
    }
    assert.match(slides, /setAttribute\('aria-pressed',String\(on\)\)/u);
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

test('LinkedIn posts each have a standalone rich document and matching text download', async () => {
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
        const htmlPath = `${pack.id}/linkedin/${filename.replace(/\.txt$/u, '.html')}`;
        const html = await text(htmlPath);
        if (index === 0) {
          const embeddedJpeg = html.match(/src="data:image\/jpeg;base64,([^"]+)"/u)?.[1];
          assert.ok(embeddedJpeg, `${htmlPath} must preview the upload artwork`);
          const download = await readFile(path.join(OUTPUT, pack.id, 'images/social-card.jpg'));
          assert.equal(sha256(Buffer.from(embeddedJpeg, 'base64')), sha256(download), 'preview and downloaded LinkedIn artwork must be identical');
        }
        assert.equal(isScriptFreeEmailPreview(html), true);
        assert.equal((html.match(/<article>/gu) ?? []).length, 1, htmlPath);
        assert.ok(html.includes(post.title), htmlPath);
        assert.ok(html.includes(post.copy.split('\n\n')[0].replaceAll('&', '&amp;')), htmlPath);
        for (const other of posts.filter((entry) => entry.id !== post.id)) {
          assert.ok(!html.includes(other.title), `${htmlPath} must not combine posts`);
        }
        assert.ok(html.includes(pack.signupUrl));
        assert.equal(emailPreviewPath(`https://opda.org.uk/marketing/${htmlPath}`, 'https://opda.org.uk'), `/marketing/${htmlPath}`);
      }
    }
  }
});
