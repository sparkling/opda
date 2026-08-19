import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const SHELL_IDS = new Set([
  'app', 'app-sidebar', 'global-nav-panel', 'global-nav-toggle', 'main-content',
  'menu-toggle', 'sidebar-collapse', 'theme-toggle',
]);
const IGNORED_TAGS = new Set(['script', 'style', 'template', 'svg', 'nav']);
const CONTENT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dt', 'dd', 'th', 'td',
  'caption', 'figcaption', 'pre',
]);
const IGNORED_CLASSES = [
  'breadcrumbs', 'comments-section', 'heading-anchor', 'ia-authority',
  'page-nav', 'workspace-nav',
];

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function filesUnder(root, relative = '', { includeHidden = true } = {}) {
  const base = path.join(root, relative);
  if (!existsSync(base)) return [];
  const output = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!includeHidden && entry.name.startsWith('.')) continue;
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(item);
      else if (entry.isFile()) output.push(item);
    }
  };
  walk(base);
  return output.sort((a, b) => a.localeCompare(b));
}

export function fileInventory(root, relative, filter = () => true) {
  const base = path.join(root, relative);
  const records = filesUnder(root, relative)
    .filter(filter)
    .map((file) => ({
      path: path.relative(base, file).split(path.sep).join('/'),
      size: statSync(file).size,
      sha256: sha256(readFileSync(file)),
    }));
  const treeSha256 = sha256(records.map((record) => `${record.path}\0${record.size}\0${record.sha256}`).join('\n'));
  return { count: records.length, treeSha256, records };
}

function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value ?? '';
}

function classes(node) {
  return attr(node, 'class').split(/\s+/u).filter(Boolean);
}

function ignored(node, inherited = false) {
  return inherited || IGNORED_TAGS.has(node.tagName)
    || classes(node).some((name) => IGNORED_CLASSES.includes(name));
}

function nodeText(node) {
  if (node.nodeName === '#text') return node.value ?? '';
  return (node.childNodes ?? []).map(nodeText).join(' ');
}

function normalizeText(value) {
  return String(value)
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    .replace(/\s+/gu, ' ')
    .replace(/\s*#\s*$/u, '')
    .trim();
}

function findMain(node) {
  if (node.tagName === 'main' || attr(node, 'id') === 'main-content') return node;
  for (const child of node.childNodes ?? []) {
    const found = findMain(child);
    if (found) return found;
  }
  return null;
}

export function fragmentContract(html) {
  const ids = [];
  const visit = (node) => {
    const id = attr(node, 'id');
    if (id && !SHELL_IDS.has(id)) ids.push(id);
    node.childNodes?.forEach(visit);
  };
  visit(parse(html));
  const unique = [...new Set(ids)].sort();
  return {
    fragmentCount: unique.length,
    fragmentSha256: sha256(unique.join('\n')),
    fragments: unique,
  };
}

export function informationContract(html) {
  const document = parse(html);
  const root = findMain(document) ?? document;
  const blocks = [];
  const visit = (node, parentIgnored = false) => {
    const skip = ignored(node, parentIgnored);
    if (skip) return;
    if (CONTENT_TAGS.has(node.tagName)) {
      const text = normalizeText(nodeText(node));
      if (text) blocks.push(`${node.tagName}\0${text}`);
      return;
    }
    node.childNodes?.forEach((child) => visit(child, skip));
  };
  visit(root);
  const blockHashes = blocks.map(sha256);
  return {
    contentSha256: sha256(blocks.join('\n')),
    blockCount: blocks.length,
    blockSetSha256: sha256([...blockHashes].sort().join('\n')),
    blockHashes,
  };
}

/** A multiplicity-aware, deterministic fingerprint for a set of content blocks. */
export function blockInventory(blockHashes) {
  const counts = new Map();
  for (const hash of blockHashes) counts.set(hash, (counts.get(hash) ?? 0) + 1);
  const records = [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([hash, count]) => ({ hash, count }));
  return {
    count: blockHashes.length,
    records,
    sha256: sha256(records.map(({ hash, count }) => `${hash}\0${count}`).join('\n')),
  };
}

export function equivalenceReceipt(before, after, reviewEvidence = 'IA migration before/after comparison') {
  const remaining = new Map();
  for (const hash of after.blockHashes) remaining.set(hash, (remaining.get(hash) ?? 0) + 1);
  let preservedBlocks = 0;
  for (const hash of before.blockHashes) {
    const count = remaining.get(hash) ?? 0;
    if (count > 0) {
      preservedBlocks++;
      remaining.set(hash, count - 1);
    }
  }
  const exact = before.contentSha256 === after.contentSha256;
  return {
    policy: exact ? 'byte-normalized-equivalent' : 'reviewed-reframe-equivalent',
    baselineBlocks: before.blockCount,
    acceptedBlocks: after.blockCount,
    preservedBlocks,
    retentionRatio: before.blockCount ? Number((preservedBlocks / before.blockCount).toFixed(6)) : 1,
    baselineBlockSetSha256: before.blockSetSha256,
    acceptedBlockSetSha256: after.blockSetSha256,
    baselineBlockInventorySha256: blockInventory(before.blockHashes).sha256,
    acceptedBlockInventorySha256: blockInventory(after.blockHashes).sha256,
    reviewEvidence: exact ? 'normalized information contract unchanged' : reviewEvidence,
  };
}

export function routeFromFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'/index.html'.length)}`;
  return `/${file.replace(/\.html$/u, '')}`;
}

export function generatedFamily(route) {
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) return 'root';
  if (parts[0] === 'ontology' && parts[1] === 'tools') return 'ontology/tools';
  return parts[0];
}
