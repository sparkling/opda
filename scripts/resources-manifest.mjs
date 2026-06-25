#!/usr/bin/env node
// OPDA Knowledge Base — generate the committed resources manifest.
//
// Walks the local source/ archive and emits a DETERMINISTIC, fully-sorted JSON
// manifest at src/data/resources-manifest.json. The /library/resources page
// renders one individual link per manifest entry, which is what makes every
// resource in the public archive individually discoverable.
//
// ── WHY THIS RUNS LOCALLY (NOT IN CI) ─────────────────────────────────────
//   ~557 MB of source/ is binary/large (videos, PDFs, schema dumps, repo
//   mirrors) and is gitignored by design (ADR-0054). A CI checkout does NOT
//   contain those files, so CI cannot walk source/. This generator is therefore
//   an out-of-band step the maintainer runs from a working tree that has the
//   full archive — exactly like `make publish-resources`. The page itself only
//   ever reads the committed manifest, never the filesystem, so it builds fine
//   in CI where source/ is absent.
//
//   ⇒ Re-run `make resources-manifest` after ANY change to source/, so the
//     manifest, the page, and the published S3 bucket stay in lockstep.
//     (publish-resources.sh regenerates this automatically before it syncs.)
//
// Output is sorted by (category, path) so the committed file is byte-stable
// across machines — no spurious diffs from filesystem ordering.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SOURCE_DIR = path.join(REPO_ROOT, 'source');
const OUT_FILE = path.join(REPO_ROOT, 'src', 'data', 'resources-manifest.json');

// ── Real content resource types we publish & want individually linkable ────
const ALLOWED_EXT = new Set([
  'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv',
  'md', 'ttl', 'json', 'html', 'txt', 'vtt', 'srt',
  'mp4', 'mov', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'eml', 'msg',
]);

// ── Lockfiles held back (not content) ──────────────────────────────────────
const LOCKFILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'composer.lock', 'gemfile.lock', 'cargo.lock',
]);

// ── Human labels for the top-level source/ subdirs ─────────────────────────
// NN-foo dirs map to readable section names; the underscore-prefixed working
// dirs get sensible labels too. Anything unmapped falls back to a title-cased
// version of the directory name (keeps the generator robust to new folders).
const CATEGORY_LABELS = {
  '00-deliverables': 'Deliverables',
  '01-organisation': 'Organisation',
  '02-policy-and-positioning': 'Policy & positioning',
  '03-standards': 'Standards',
  '04-governance-bodies': 'Governance bodies',
  '05-engagement': 'Engagement',
  '06-research': 'Research',
  '07-website': 'Website',
  '08-external-references': 'External references',
  '_content': 'Content (working)',
  '_examples': 'Examples (working)',
  '_inbox': 'Inbox (working)',
  '_taxonomy': 'Taxonomy (working)',
  '_working': 'Working notes',
  // Files that sit directly in source/ (INVENTORY.md, README.md, the .eml) have
  // no top-level subdir; group them under a single readable label.
  '': 'Archive root',
};

/** Title-case fallback for any unmapped top-level dir (e.g. `09-foo-bar`). */
function fallbackLabel(dir) {
  return dir
    .replace(/^_/, '')
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || dir;
}

function categoryFor(topDir) {
  return CATEGORY_LABELS[topDir] ?? fallbackLabel(topDir);
}

/**
 * True for paths we deliberately hold back from the manifest.
 * `rel` is the source/-rooted relative path (POSIX separators), `base` its
 * basename. Segments are the path split on "/".
 */
function isExcluded(rel, base, segments) {
  // VCS + vendored internals — not content, never individually linked.
  // (git stores blobs without extensions, so .git rarely matches an allowed
  // ext anyway; node_modules holds vendored package files. Both are excluded
  // in the same spirit as the named junk below.)
  if (segments.includes('.git') || segments.includes('node_modules')) return true;

  // Dotfiles (basename starting with ".") — includes .DS_Store, .drive-upload.log, etc.
  if (base.startsWith('.')) return true;

  // *.log of any kind.
  if (base.toLowerCase().endsWith('.log')) return true;

  // Lockfiles.
  if (LOCKFILES.has(base.toLowerCase())) return true;

  // Internal bookkeeping files explicitly named for exclusion.
  if (rel === '_inbox/sharepoint-manifest.json') return true;

  return false;
}

/** Recursively collect allowed, non-excluded files under source/. */
function walk(absDir, relDir, out) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(absDir, entry.name);
    const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue; // prune early
      walk(abs, rel, out);
      continue;
    }
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).slice(1).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) continue;

    const segments = rel.split('/');
    if (isExcluded(rel, entry.name, segments)) continue;

    out.push({
      path: `source/${rel}`,
      name: entry.name,
      ext,
      sizeBytes: fs.statSync(abs).size,
      // Top-level files (single segment) have no subdir → "" → "Archive root".
      category: categoryFor(segments.length > 1 ? segments[0] : ''),
    });
  }
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(
      `✗ ${path.relative(REPO_ROOT, SOURCE_DIR)}/ not found.\n` +
      '  This generator must run LOCALLY from a working tree that has the full\n' +
      '  source/ archive (it is gitignored and absent in CI). See the header.',
    );
    process.exit(1);
  }

  const entries = [];
  walk(SOURCE_DIR, '', entries);

  // Deterministic order: by category, then full repo-relative path.
  entries.sort((a, b) =>
    a.category.localeCompare(b.category, 'en') || a.path.localeCompare(b.path, 'en'),
  );

  const totalBytes = entries.reduce((sum, e) => sum + e.sizeBytes, 0);

  // JSON.stringify preserves array order; trailing newline for clean diffs.
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(entries, null, 2)}\n`);

  const mb = (totalBytes / (1024 * 1024)).toFixed(1);
  console.log(
    `✓ Wrote ${path.relative(REPO_ROOT, OUT_FILE)} — ` +
    `${entries.length} resources, ${mb} MB total.`,
  );
}

main();
