#!/usr/bin/env node
import { execFile } from 'node:child_process';
import {
  existsSync, readFileSync, statSync,
} from 'node:fs';
import {
  mkdir, mkdtemp, readFile, rm, writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

import { employerBrief, marketingPacks } from '../../src/data/marketing/packs.mjs';
import { renderCampaignInfographic, renderLinkedInPreview, supplementalEmail } from './rich-materials.mjs';
import {
  canonicalJson, dataUri, fileRecord, jsonBuffer, makeZip, resolveBelow, sha256, stripJpegMetadata,
} from './lib.mjs';
import {
  renderEmailPlain, renderEmailPreview, renderEml, renderLinkedIn, renderOnePager, renderSlides,
} from './renderers.mjs';

const executeFile = promisify(execFile);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '../..');
const SCHEMA_VERSION = 'opda.marketing-assets.v1';
const FORBIDDEN_CONTENT = /(?:teams\.cloud\.microsoft|sharepoint\.com|login\.microsoftonline\.com|invite_redeem_url|\baccess_url\b|\bdisplay_name\b|pm:unsubscribe|\{\{[^}]+\}\})/iu;
const STATUS_VALUES = new Set(['general', 'current-wave', 'existing-group']);

export const EXPECTED_PACK_IDS = Object.freeze([
  'general',
  'finance-and-banking',
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
]);

function assertText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be non-empty text`);
  if (FORBIDDEN_CONTENT.test(value)) throw new Error(`${field} contains private or unresolved content`);
}

function validateSignup(pack) {
  const url = new URL(pack.signupUrl);
  if (url.origin !== 'https://opda.org.uk' || url.username || url.password || url.hash || url.pathname !== '/join') {
    throw new Error(`${pack.id} has a non-canonical signup URL`);
  }
  const expectedContext = pack.id === 'general' ? '' : pack.id;
  if ((url.searchParams.get('context') ?? '') !== expectedContext || [...url.searchParams].length !== (expectedContext ? 1 : 0)) {
    throw new Error(`${pack.id} has an invalid signup context`);
  }
}

export function validateMarketingPacks(packs, options = {}) {
  const publicDir = path.resolve(options.publicDir ?? path.join(DEFAULT_ROOT, 'public'));
  if (!Array.isArray(packs) || packs.length !== EXPECTED_PACK_IDS.length) {
    throw new Error('Marketing data must define exactly seven campaign packs');
  }
  const ids = packs.map(({ id }) => id);
  if (canonicalJson(ids) !== canonicalJson(EXPECTED_PACK_IDS)) throw new Error('Marketing pack IDs or order changed');
  for (const pack of packs) {
    for (const field of ['label', 'scope']) assertText(pack[field], `${pack.id}.${field}`);
    if (!STATUS_VALUES.has(pack.campaignStatus)) throw new Error(`${pack.id} has an invalid campaign status`);
    validateSignup(pack);
    assertText(pack.hero?.source, `${pack.id}.hero.source`);
    assertText(pack.hero?.alt, `${pack.id}.hero.alt`);
    const heroPath = resolveBelow(publicDir, pack.hero.source);
    if (!existsSync(heroPath) || !statSync(heroPath).isFile()) throw new Error(`${pack.id} hero does not exist`);
    for (const voice of ['member', 'opda', ...(pack.email?.personal ? ['personal'] : [])]) {
      const email = pack.email?.[voice];
      for (const field of ['subject', 'preheader', 'headline', 'ctaLabel']) assertText(email?.[field], `${pack.id}.email.${voice}.${field}`);
      if (/[\r\n]/u.test(email.subject)) throw new Error(`${pack.id}.email.${voice}.subject contains a header injection`);
      if (!Array.isArray(email.paragraphs) || email.paragraphs.length < 2) throw new Error(`${pack.id}.email.${voice}.paragraphs is incomplete`);
      email.paragraphs.forEach((paragraph, index) => assertText(paragraph, `${pack.id}.email.${voice}.paragraphs[${index}]`));
    }
    for (const voice of ['opda', 'partner']) {
      const linkedIn = pack.linkedin?.[voice];
      assertText(linkedIn?.copy, `${pack.id}.linkedin.${voice}.copy`);
      if (!Array.isArray(linkedIn.hashtags)) throw new Error(`${pack.id}.linkedin.${voice}.hashtags must be an array`);
      linkedIn.hashtags.forEach((tag, index) => assertText(tag, `${pack.id}.linkedin.${voice}.hashtags[${index}]`));
      if (!Array.isArray(linkedIn.posts) || linkedIn.posts.length !== 3
        || new Set(linkedIn.posts.map((post) => post.id)).size !== 3) {
        throw new Error(`${pack.id}.linkedin.${voice}.posts must contain three distinct posts`);
      }
      (linkedIn.posts ?? []).forEach((post, index) => {
        assertText(post.id, `${pack.id}.linkedin.${voice}.posts[${index}].id`);
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(post.id)) throw new Error(`${pack.id} has an unsafe post ID`);
        assertText(post.title, `${pack.id}.linkedin.${voice}.posts[${index}].title`);
        assertText(post.copy, `${pack.id}.linkedin.${voice}.posts[${index}].copy`);
      });
    }
    for (const field of ['title', 'standfirst', 'ctaLabel']) assertText(pack.onePager?.[field], `${pack.id}.onePager.${field}`);
    if (!Array.isArray(pack.onePager.sections) || pack.onePager.sections.length < 2) throw new Error(`${pack.id}.onePager.sections is incomplete`);
    for (const section of pack.onePager.sections) {
      assertText(section.heading, `${pack.id}.onePager.section.heading`);
      (section.paragraphs ?? []).forEach((paragraph) => assertText(paragraph, `${pack.id}.onePager.section.paragraph`));
      (section.bullets ?? []).forEach((bullet) => assertText(bullet, `${pack.id}.onePager.section.bullet`));
    }
    for (const field of ['title', 'subtitle']) assertText(pack.deck?.[field], `${pack.id}.deck.${field}`);
    if (!Array.isArray(pack.deck.slides) || pack.deck.slides.length < 3 || pack.deck.slides.length > 8) throw new Error(`${pack.id}.deck.slides must contain 3–8 slides`);
    for (const [index, slide] of pack.deck.slides.entries()) {
      assertText(slide.title, `${pack.id}.deck.slides[${index}].title`);
      if (slide.body) (Array.isArray(slide.body) ? slide.body : [slide.body]).forEach((body) => assertText(body, `${pack.id}.deck.slides[${index}].body`));
      (slide.bullets ?? []).forEach((bullet) => assertText(bullet, `${pack.id}.deck.slides[${index}].bullet`));
      assertText(slide.notes, `${pack.id}.deck.slides[${index}].notes`);
      if (slide.image) {
        const imagePath = resolveBelow(publicDir, slide.image);
        if (!existsSync(imagePath) || !statSync(imagePath).isFile()) throw new Error(`${pack.id} slide image does not exist`);
      }
    }
    for (const field of ['title', 'short', 'long']) assertText(pack.newsletter?.[field], `${pack.id}.newsletter.${field}`);
  }
  return true;
}

function generatorDigest() {
  return sha256(['build-assets.mjs', 'lib.mjs', 'renderers.mjs', 'rich-materials.mjs']
    .map((name) => readFileSync(path.join(SCRIPT_DIR, name)))
    .reduce((combined, bytes) => Buffer.concat([combined, bytes]), Buffer.alloc(0)));
}

function verifyRecord(base, record) {
  const target = path.resolve(base, record.path);
  const relative = path.relative(base, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Unsafe manifest path: ${record.path}`);
  const bytes = readFileSync(target);
  if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) throw new Error(`Generated asset drift: ${record.path}`);
}

function sourceRecord(rootDir, sourcePath) {
  const target = path.resolve(sourcePath);
  const relative = path.relative(rootDir, target).replaceAll('\\', '/');
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Source asset escapes the repository: ${sourcePath}`);
  const bytes = readFileSync(target);
  return { path: relative, sha256: sha256(bytes), bytes: bytes.length };
}

export function verifySourceAssetRecord(rootDir, record) {
  verifyRecord(rootDir, record);
}

export function checkMarketingAssets(options = {}) {
  const packs = options.packs ?? marketingPacks;
  const rootDir = path.resolve(options.rootDir ?? DEFAULT_ROOT);
  const publicDir = path.join(rootDir, 'public');
  const outputDir = path.resolve(options.outputDir ?? path.join(publicDir, 'marketing'));
  validateMarketingPacks(packs, { publicDir });
  const summary = JSON.parse(readFileSync(path.join(outputDir, 'manifest.json'), 'utf8'));
  const inputDigest = sha256(canonicalJson({ packs, employerBrief }));
  if (summary.schemaVersion !== SCHEMA_VERSION || summary.inputDigest !== inputDigest || summary.generatorDigest !== generatorDigest()) {
    throw new Error('Marketing asset manifest is stale');
  }
  if (canonicalJson(summary.packs.map(({ id }) => id)) !== canonicalJson(EXPECTED_PACK_IDS)) throw new Error('Marketing asset summary is incomplete');
  if (!Array.isArray(summary.sourceAssets) || !summary.sourceAssets.length) throw new Error('Marketing source-asset manifest is missing');
  summary.sourceAssets.forEach((record) => verifySourceAssetRecord(rootDir, record));
  for (const pack of packs) {
    const packDir = path.join(outputDir, pack.id);
    const manifest = JSON.parse(readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
    if (manifest.inputDigest !== sha256(canonicalJson(pack)) || manifest.generatorDigest !== summary.generatorDigest) throw new Error(`${pack.id} manifest is stale`);
    if (!Array.isArray(manifest.sourceAssets) || !manifest.sourceAssets.length) throw new Error(`${pack.id} source-asset manifest is missing`);
    manifest.sourceAssets.forEach((record) => verifySourceAssetRecord(rootDir, record));
    manifest.files.forEach((record) => verifyRecord(packDir, record));
    const summaryPack = summary.packs.find(({ id }) => id === pack.id);
    verifyRecord(outputDir, summaryPack.archive);
  }
  return true;
}

function mimeTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return ({ '.avif': 'image/avif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[extension];
}

async function makeHeroJpeg(sourcePath, destination) {
  await executeFile('ffmpeg', [
    '-nostdin', '-loglevel', 'error', '-y', '-i', sourcePath,
    '-map_metadata', '-1', '-frames:v', '1', '-vf', "scale=w='min(1200,iw)':h=-2",
    '-q:v', '4', '-pix_fmt', 'yuvj420p', destination,
  ]);
  return stripJpegMetadata(await readFile(destination));
}

async function makeSocialCard(sourcePath, logoPath, destination) {
  const filter = [
    '[0:v]scale=1200:-2,tpad=stop_mode=clone:stop_duration=1[hero]',
    'color=c=0x131224:s=1200x627:d=1[canvas]',
    '[canvas][hero]overlay=0:0[base]',
    '[1:v]scale=300:-1,format=rgba,tpad=stop_mode=clone:stop_duration=1[logo]',
    '[base][logo]overlay=64:470[out]',
  ].join(';');
  await executeFile('ffmpeg', [
    '-nostdin', '-loglevel', 'error', '-y', '-i', sourcePath, '-i', logoPath,
    '-filter_complex', filter, '-map', '[out]', '-map_metadata', '-1', '-frames:v', '1',
    '-q:v', '3', '-pix_fmt', 'yuvj420p', destination,
  ]);
  return stripJpegMetadata(await readFile(destination));
}

async function writeEntries(baseDir, entries) {
  for (const [relative, bytes] of entries) {
    const target = path.join(baseDir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
}

async function buildPack(pack, context) {
  const packDir = path.join(context.outputDir, pack.id);
  const sourcePath = resolveBelow(context.publicDir, pack.hero.source);
  const heroTemp = path.join(context.tempDir, `${pack.id}-hero.jpg`);
  const socialTemp = path.join(context.tempDir, `${pack.id}-social.jpg`);
  const [heroBytes, socialBytes] = await Promise.all([
    makeHeroJpeg(sourcePath, heroTemp),
    makeSocialCard(sourcePath, context.logoPath, socialTemp),
  ]);
  const entries = new Map([
    ['images/opda-logo.png', context.logoBytes],
    ['images/hero.jpg', heroBytes],
    ['images/social-card.jpg', socialBytes],
  ]);
  const infographic = renderCampaignInfographic(pack);
  entries.set('images/contribution-infographic.svg', Buffer.from(infographic));
  entries.set('images/contribution-infographic.png', await sharp(Buffer.from(infographic)).png().toBuffer());
  for (const voice of ['member', 'opda', ...(pack.email.personal ? ['personal'] : [])]) {
    entries.set(`email/${voice}.txt`, Buffer.from(renderEmailPlain(pack, voice)));
    entries.set(`email/${voice}.html`, Buffer.from(renderEmailPreview(pack, voice, context.logoBytes, heroBytes)));
    entries.set(`email/${voice}.eml`, Buffer.from(renderEml(pack, voice, context.logoBytes, heroBytes)));
  }
  for (const voice of ['opda', 'partner']) {
    entries.set(`linkedin/${voice}.txt`, Buffer.from(renderLinkedIn(pack, voice)));
    entries.set(`linkedin/${voice}.html`, Buffer.from(renderLinkedInPreview(pack, voice, context.logoBytes, heroBytes, infographic)));
    for (const [index, post] of (pack.linkedin[voice].posts ?? []).entries()) {
      const name = `${voice}-${String(index + 1).padStart(2, '0')}-${post.id}.txt`;
      entries.set(`linkedin/${name}`, Buffer.from(renderLinkedIn(pack, voice, post)));
    }
  }
  entries.set('newsletter/short.txt', Buffer.from(`${pack.newsletter.title}\n\n${pack.newsletter.short}\n`));
  entries.set('newsletter/long.txt', Buffer.from(`${pack.newsletter.title}\n\n${pack.newsletter.long}\n`));
  for (const kind of ['short', 'long', ...(pack.id === 'general' ? ['employer'] : [])]) {
    const supplement = supplementalEmail(pack, kind, employerBrief);
    const name = kind === 'employer' ? 'email/employer' : `newsletter/${kind}`;
    const voice = kind === 'employer' ? 'personal' : 'member';
    entries.set(`${name}.html`, Buffer.from(renderEmailPreview(supplement, voice, context.logoBytes, heroBytes)));
    entries.set(`${name}.eml`, Buffer.from(renderEml(supplement, voice, context.logoBytes, heroBytes)));
    if (kind === 'employer') entries.set(`${name}.txt`, Buffer.from(renderEmailPlain(supplement, voice)));
  }
  entries.set('one-pager.html', Buffer.from(renderOnePager(pack, context.logoBytes, heroBytes)));
  const inlineAssets = new Map([[pack.hero.source, dataUri('image/jpeg', heroBytes)]]);
  const sourcePaths = new Set([sourcePath]);
  for (const slide of pack.deck.slides) {
    if (!slide.image || inlineAssets.has(slide.image)) continue;
    const imagePath = resolveBelow(context.publicDir, slide.image);
    sourcePaths.add(imagePath);
    inlineAssets.set(slide.image, dataUri(mimeTypeFor(imagePath), await readFile(imagePath)));
  }
  entries.set('slides.html', Buffer.from(renderSlides(pack, context.logoBytes, heroBytes, inlineAssets)));
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    id: pack.id,
    label: pack.label,
    campaignStatus: pack.campaignStatus,
    signupUrl: pack.signupUrl,
    inputDigest: sha256(canonicalJson(pack)),
    generatorDigest: context.generatorDigest,
    sourceAssets: [...sourcePaths].sort().map((assetPath) => sourceRecord(context.rootDir, assetPath)),
    files: [...entries].map(([name, bytes]) => fileRecord(name, bytes)),
  };
  const manifestBytes = jsonBuffer(manifest);
  entries.set('manifest.json', manifestBytes);
  const archiveName = `${pack.id}-campaign-pack.zip`;
  const archiveBytes = makeZip(entries);
  entries.set(archiveName, archiveBytes);
  await writeEntries(packDir, entries);
  return {
    id: pack.id,
    label: pack.label,
    campaignStatus: pack.campaignStatus,
    path: `/marketing/${pack.id}/`,
    archive: fileRecord(`${pack.id}/${archiveName}`, archiveBytes),
    manifest: `/marketing/${pack.id}/manifest.json`,
    files: entries.size,
    bytes: [...entries.values()].reduce((total, bytes) => total + bytes.length, 0),
  };
}

export async function buildMarketingAssets(options = {}) {
  const packs = options.packs ?? marketingPacks;
  const rootDir = path.resolve(options.rootDir ?? DEFAULT_ROOT);
  const publicDir = path.join(rootDir, 'public');
  const outputDir = path.resolve(options.outputDir ?? path.join(publicDir, 'marketing'));
  const relativeOutput = path.relative(rootDir, outputDir);
  if (!relativeOutput || relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) throw new Error('Output must stay inside the repository');
  validateMarketingPacks(packs, { publicDir });
  if (!options.force) {
    try {
      checkMarketingAssets({ packs, rootDir, outputDir });
      const summary = JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8'));
      return { reused: true, files: summary.totalFiles, bytes: summary.totalBytes };
    } catch {}
  }
  await mkdir(outputDir, { recursive: true });
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'opda-marketing-'));
  try {
    const logoPath = path.join(rootDir, 'docs/templates/assets/opda-email-logo.png');
    const context = {
      rootDir, publicDir, outputDir, tempDir, logoPath,
      logoBytes: await readFile(logoPath),
      generatorDigest: generatorDigest(),
    };
    const packSummaries = [];
    for (const pack of packs) packSummaries.push(await buildPack(pack, context));
    const totalFiles = packSummaries.reduce((sum, pack) => sum + pack.files, 1);
    const totalBytes = packSummaries.reduce((sum, pack) => sum + pack.bytes, 0);
    const summary = {
      schemaVersion: SCHEMA_VERSION,
      inputDigest: sha256(canonicalJson({ packs, employerBrief })),
      generatorDigest: context.generatorDigest,
      packCount: packSummaries.length,
      totalFiles,
      totalBytes,
      sourceAssets: [sourceRecord(rootDir, logoPath)],
      packs: packSummaries,
    };
    await writeFile(path.join(outputDir, 'manifest.json'), jsonBuffer(summary));
    return { reused: false, files: totalFiles, bytes: totalBytes };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  const result = { check: false, outputDir: undefined, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--check') result.check = true;
    else if (argv[index] === '--force') result.force = true;
    else if (argv[index] === '--output') result.outputDir = path.resolve(argv[++index] ?? '');
    else throw new Error(`Unknown option: ${argv[index]}`);
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = parseArgs(process.argv.slice(2));
  if (args.check) {
    checkMarketingAssets({ outputDir: args.outputDir });
    console.log('Marketing assets are current.');
  } else {
    const result = await buildMarketingAssets({ outputDir: args.outputDir, force: args.force });
    console.log(`${result.reused ? 'Reused' : 'Generated'} ${result.files} marketing assets (${result.bytes} bytes).`);
  }
}
