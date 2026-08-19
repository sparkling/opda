#!/usr/bin/env node
/** Build and verify an isolated, no-index static-site preview under one URL prefix. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const SITE_ORIGIN = 'https://opda.org.uk';
const MANIFEST_NAME = '_preview-manifest.json';
const RECEIPT_NAME = 'preview-receipt.json';
const TEXT_EXTENSIONS = new Set([
  '.css', '.html', '.js', '.json', '.md', '.mjs', '.svg', '.txt', '.webmanifest', '.xml',
]);
const SHARED_ROOT_PREFIXES = ['/_auth', '/api', '/comments'];
const DOCUMENTARY_PROJECTION_PREFIXES = [
  'mapping/', 'model/', 'modelling/adr/', 'modelling/odr/', 'ontology/artefacts/',
  'ontology/context/', 'ontology/tools/',
];

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function isSharedRootUrl(value) {
  if (value.startsWith('/resources/')) return true;
  return SHARED_ROOT_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}/`));
}

function validatePrefix(prefix) {
  if (!/^\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(prefix)) {
    throw new Error(`Preview prefix must be one single safe URL segment; received ${JSON.stringify(prefix)}`);
  }
}

function validateSourceSha(sourceSha) {
  if (!/^[a-f0-9]{40}$/u.test(sourceSha)) {
    throw new Error('Preview source SHA must be an exact 40-character lowercase Git commit SHA.');
  }
}

function validatePaths(inputDir, outputDir) {
  const input = path.resolve(inputDir);
  const output = path.resolve(outputDir);
  if (!existsSync(input) || !statSync(input).isDirectory()) {
    throw new Error(`Preview input directory does not exist: ${input}`);
  }
  if (output === path.parse(output).root
    || output === input
    || output.startsWith(`${input}${path.sep}`)
    || input.startsWith(`${output}${path.sep}`)) {
    throw new Error('Preview output must be a safe directory outside the input directory.');
  }
  return { input, output };
}

function listFiles(root) {
  const found = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink() || lstatSync(absolute).isSymbolicLink()) {
        throw new Error(`Preview trees may not contain symbolic links: ${absolute}`);
      }
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) found.push(absolute);
    }
  }
  visit(root);
  return found.sort((left, right) => left.localeCompare(right, 'en'));
}

function relativeFile(root, absolute) {
  return path.relative(root, absolute).split(path.sep).join('/');
}

export function prefixRootUrl(value, prefix) {
  validatePrefix(prefix);
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === prefix || value.startsWith(`${prefix}/`)) return value;
  if (isSharedRootUrl(value)) return value;
  return value === '/' ? `${prefix}/` : `${prefix}${value}`;
}

function transformSrcset(value, prefix) {
  return value.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)/gu, (match, separator, url) => (
    `${separator}${prefixRootUrl(url, prefix)}`
  ));
}

function transformRootLiterals(source, prefix) {
  let transformed = source.replace(
    /\bsrcset\s*=\s*(["'])([^"']*)\1/giu,
    (match, quote, value) => `srcset=${quote}${transformSrcset(value, prefix)}${quote}`,
  );
  transformed = transformed.replace(
    /(["'`])(\/(?!\/)[^"'`<>\r\n]*)\1/gu,
    (match, quote, value) => `${quote}${prefixRootUrl(value, prefix)}${quote}`,
  );
  transformed = transformed.replace(
    /url\(\s*(\/(?!\/)[^)\s]+)\s*\)/giu,
    (match, value) => `url(${prefixRootUrl(value, prefix)})`,
  );
  transformed = transformed.replace(
    /(\burl\s*=\s*)(\/(?!\/)[^\s"'>]+)/giu,
    (match, leader, value) => `${leader}${prefixRootUrl(value, prefix)}`,
  );
  return transformed;
}

function injectNoIndex(source) {
  if (/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*\bcontent\s*=\s*["'][^"']*noindex/iu.test(source)) {
    return source;
  }
  const directive = '<meta name="robots" content="noindex,nofollow">';
  if (/<head\b[^>]*>/iu.test(source)) return source.replace(/<head\b[^>]*>/iu, `$&${directive}`);
  if (/<html\b[^>]*>/iu.test(source)) return source.replace(/<html\b[^>]*>/iu, `$&<head>${directive}</head>`);
  return `${directive}${source}`;
}

function transformSitemap(source, prefix) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return source.replace(
    new RegExp(`${SITE_ORIGIN.replaceAll('.', '\\.')}(?!${escaped}(?:/|<|$))(?<route>/[^<\\s"']*)?`, 'gu'),
    (match, route = '') => `${SITE_ORIGIN}${prefix}${route || '/'}`,
  );
}

function transformFile(relative, source, prefix) {
  let transformed = transformRootLiterals(source, prefix);
  if (relative.endsWith('.html')) transformed = injectNoIndex(transformed);
  if (/^(?:robots\.txt|sitemap(?:-index|-\d+)?\.xml)$/u.test(relative)) {
    transformed = transformSitemap(transformed, prefix);
  }
  return transformed;
}

function textFiles(root) {
  return listFiles(root).filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

function rootLiteralFailures(relative, source, prefix) {
  const failures = [];
  const inspect = (value, kind) => {
    if (value.startsWith('/') && prefixRootUrl(value, prefix) !== value) {
      failures.push(`${relative}: ${kind} ${value}`);
    }
  };
  for (const match of source.matchAll(/(["'`])(\/(?!\/)[^"'`<>\r\n]*)\1/gu)) inspect(match[2], 'literal');
  for (const match of source.matchAll(/url\(\s*(\/(?!\/)[^)\s]+)\s*\)/giu)) inspect(match[1], 'CSS URL');
  for (const match of source.matchAll(/\burl\s*=\s*(\/(?!\/)[^\s"'>]+)/giu)) inspect(match[1], 'refresh URL');
  if (/^(?:robots\.txt|sitemap(?:-index|-\d+)?\.xml)$/u.test(relative)) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    const pattern = new RegExp(`${SITE_ORIGIN.replaceAll('.', '\\.')}(?!${escaped}(?:/|<|$))(?:/[^<\\s"']*)?`, 'gu');
    for (const match of source.matchAll(pattern)) failures.push(`${relative}: unprefixed site URL ${match[0]}`);
  }
  return failures;
}

function* htmlResourceValues(node) {
  for (const attribute of node.attrs || []) {
    if (['href', 'src', 'action', 'poster', 'formaction', 'xlink:href', 'data-src', 'data-href', 'data-url'].includes(attribute.name)) {
      yield attribute.value;
    }
    if (attribute.name === 'srcset') {
      for (const candidate of attribute.value.split(',')) {
        const value = candidate.trim().split(/\s+/u)[0];
        if (value) yield value;
      }
    }
  }
  for (const child of node.childNodes || []) yield* htmlResourceValues(child);
  if (node.content) yield* htmlResourceValues(node.content);
}

function scanOutput(root, prefix) {
  const failures = [];
  let htmlCount = 0;
  for (const file of textFiles(root)) {
    const relative = relativeFile(root, file);
    const source = readFileSync(file, 'utf8');
    failures.push(...rootLiteralFailures(relative, source, prefix));
    if (!relative.endsWith('.html')) continue;
    htmlCount += 1;
    const document = parse(source);
    const hasNoIndex = /<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*\bcontent\s*=\s*["'][^"']*noindex/iu.test(source);
    if (!hasNoIndex) failures.push(`${relative}: missing noindex preview directive`);
    for (const value of htmlResourceValues(document)) {
      if (value.startsWith('/')) {
        if (prefixRootUrl(value, prefix) !== value) failures.push(`${relative}: resource ${value}`);
        continue;
      }
      if (/^(?:#|\?|data:|javascript:|mailto:|tel:|https?:|\/\/)/iu.test(value)) continue;
      try {
        const resolved = new URL(value, `${SITE_ORIGIN}${prefix}/${relative.replace(/index\.html$/u, '')}`);
        const documentaryProjection = DOCUMENTARY_PROJECTION_PREFIXES
          .some((projectionPrefix) => relative.startsWith(projectionPrefix));
        if (!documentaryProjection
          && !resolved.pathname.startsWith(`${prefix}/`)
          && resolved.pathname !== prefix) {
          failures.push(`${relative}: relative resource escapes preview ${value}`);
        }
      } catch {
        failures.push(`${relative}: invalid resource URL ${value}`);
      }
    }
  }
  return { failures: [...new Set(failures)].sort(), htmlCount };
}

function inventory(root, excluded = new Set()) {
  return listFiles(root)
    .map((file) => ({ file, relative: relativeFile(root, file) }))
    .filter(({ relative }) => !excluded.has(relative))
    .map(({ file, relative }) => {
      const bytes = readFileSync(file);
      return { path: relative, bytes: bytes.length, sha256: sha256(bytes) };
    });
}

function inventorySha256(files) {
  return sha256(files.map((file) => `${file.path}\t${file.bytes}\t${file.sha256}\n`).join(''));
}

function readManifest(output) {
  const manifestPath = path.join(output, MANIFEST_NAME);
  if (!existsSync(manifestPath)) throw new Error(`Preview manifest is missing: ${manifestPath}`);
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

export function verifyPrefixedPreview({ outputDir, prefix, sourceSha }) {
  validatePrefix(prefix);
  validateSourceSha(sourceSha);
  const output = path.resolve(outputDir);
  if (!existsSync(output) || !statSync(output).isDirectory()) throw new Error(`Preview output is missing: ${output}`);
  const manifest = readManifest(output);
  if (manifest.prefix !== prefix || manifest.sourceSha !== sourceSha) {
    throw new Error('Preview manifest does not match the requested prefix and exact source SHA.');
  }
  const files = inventory(output, new Set([MANIFEST_NAME]));
  const treeSha256 = inventorySha256(files);
  const { failures, htmlCount } = scanOutput(output, prefix);
  if (failures.length) {
    throw new Error(`Preview contains an unprefixed site-owned root URL or invalid boundary:\n${failures.slice(0, 30).join('\n')}`);
  }
  if (manifest.fileCount !== files.length || manifest.htmlCount !== htmlCount || manifest.treeSha256 !== treeSha256) {
    throw new Error('Preview manifest inventory does not match the built output.');
  }
  return { fileCount: files.length, htmlCount, treeSha256, unprefixedRootReferences: 0 };
}

export function buildPrefixedPreview({ inputDir, outputDir, prefix, sourceSha }) {
  validatePrefix(prefix);
  validateSourceSha(sourceSha);
  const { input, output } = validatePaths(inputDir, outputDir);
  listFiles(input);
  rmSync(output, { recursive: true, force: true });
  mkdirSync(path.dirname(output), { recursive: true });
  cpSync(input, output, { recursive: true, errorOnExist: true });

  for (const file of textFiles(output)) {
    const relative = relativeFile(output, file);
    const source = readFileSync(file, 'utf8');
    const transformed = transformFile(relative, source, prefix);
    if (transformed !== source) writeFileSync(file, transformed);
  }

  const scan = scanOutput(output, prefix);
  if (scan.failures.length) {
    throw new Error(`Preview contains an unprefixed site-owned root URL or invalid boundary:\n${scan.failures.slice(0, 30).join('\n')}`);
  }
  const contentFiles = inventory(output);
  const manifest = {
    schemaVersion: 1,
    prefix,
    sourceSha,
    fileCount: contentFiles.length,
    htmlCount: scan.htmlCount,
    treeSha256: inventorySha256(contentFiles),
  };
  writeFileSync(path.join(output, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);
  const verification = verifyPrefixedPreview({ outputDir: output, prefix, sourceSha });
  const publishedFiles = inventory(output);
  const receipt = { ...manifest, publishedFileCount: publishedFiles.length, files: publishedFiles };
  writeFileSync(path.join(path.dirname(output), RECEIPT_NAME), `${JSON.stringify(receipt, null, 2)}\n`);
  return { ...manifest, verification };
}

function argument(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function currentGitSha() {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

function runCli() {
  const inputDir = argument('--input', 'dist');
  const outputDir = argument('--output', 'dist-preview/v3');
  const prefix = argument('--prefix', '/v3');
  const sourceSha = argument('--source-sha', process.env.PREVIEW_SOURCE_SHA || currentGitSha());
  const result = buildPrefixedPreview({ inputDir, outputDir, prefix, sourceSha });
  console.log(`[preview] ${result.fileCount} content files, ${result.htmlCount} HTML, prefix ${prefix}`);
  console.log(`[preview] source ${sourceSha}; tree ${result.treeSha256}`);
  console.log('[preview] PASS — prefix isolation, no-index and manifest checks passed.');
}

const invokedPath = process.argv[1] && path.resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) runCli();
