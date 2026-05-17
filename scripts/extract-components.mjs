#!/usr/bin/env node
/**
 * Pattern-based refactor: convert literal HTML for the two most-common
 * repeated structures into component calls.
 *
 *   <div class="page-meta">             →  <PageMeta category="…" updated="…" />
 *     <span class="pill pill--accent">Governance</span>
 *     <span>Updated 2026-05-14</span>
 *   </div>
 *
 *   <div class="page-footer">           →  <PageFooter
 *     <a href="prev.html">← Prev</a>       prev={{ href: 'prev.html', label: 'Prev' }}
 *     <a href="next.html">Next →</a>       next={{ href: 'next.html', label: 'Next' }}
 *   </div>                              />
 *
 * Adds the matching import lines to the .astro frontmatter.
 *
 * Run: node scripts/extract-components.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src/pages');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');
const DRY = process.argv.includes('--dry-run');

function findAstro(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findAstro(p));
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

function escapeAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .trim();
}

function decodeForLabel(s) {
  // Decode HTML entities for use as a JSX string value. Astro will re-encode
  // on render so the displayed text is identical.
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .trim();
}

function relImport(filePath, target) {
  const dir = path.dirname(filePath);
  let r = path.relative(dir, target).replace(/\\/g, '/');
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

// ---- transforms ----

const PAGE_META_RE = /<div class="page-meta">\s*<span class="pill pill--(\w+)">([^<]*)<\/span>\s*<span>([^<]*)<\/span>\s*<\/div>/g;

const PAGE_FOOTER_RE = /<div class="page-footer">([\s\S]*?)<\/div>/g;

const FOOTER_LINK_RE = /<a\s+href=(?:"|')([^"']+)(?:"|')\s*>\s*(←\s*[\s\S]*?|[\s\S]*?\s*→)\s*<\/a>/g;

function transformPageMeta(body) {
  let used = false;
  const out = body.replace(PAGE_META_RE, (_m, variant, category, updated) => {
    used = true;
    const props = [`category="${escapeAttr(decodeForLabel(category))}"`];
    if (variant !== 'accent') props.push(`variant="${variant}"`);
    if (updated && updated.trim()) {
      props.push(`updated="${escapeAttr(decodeForLabel(updated))}"`);
    }
    return `<PageMeta ${props.join(' ')} />`;
  });
  return { body: out, used };
}

function transformPageFooter(body) {
  let used = false;
  const out = body.replace(PAGE_FOOTER_RE, (m, inner) => {
    // Parse links inside. We expect 0-2 links: one starting with "← …" (prev),
    // one ending with "… →" (next). Anything else, bail and keep original.
    const links = [...inner.matchAll(FOOTER_LINK_RE)];
    if (!links.length) return m;
    let prev = null, next = null;
    for (const lm of links) {
      const href = lm[1];
      const inner = lm[2].trim();
      if (inner.startsWith('←')) {
        prev = { href, label: decodeForLabel(inner.replace(/^←\s*/, '').trim()) };
      } else if (inner.endsWith('→')) {
        next = { href, label: decodeForLabel(inner.replace(/\s*→$/, '').trim()) };
      } else {
        // Unknown link shape — bail.
        return m;
      }
    }
    used = true;
    const props = [];
    if (prev) props.push(`prev={{ href: '${prev.href}', label: '${prev.label.replace(/'/g, "\\'")}' }}`);
    if (next) props.push(`next={{ href: '${next.href}', label: '${next.label.replace(/'/g, "\\'")}' }}`);
    return `<PageFooter\n  ${props.join('\n  ')}\n/>`;
  });
  return { body: out, used };
}

// ---- main ----
const files = findAstro(PAGES_DIR);
let metaCount = 0, footerCount = 0, touched = 0;

for (const f of files) {
  if (f.includes('/components/')) continue;
  const src = fs.readFileSync(f, 'utf8');

  // Split frontmatter (between two --- lines) from body.
  const fmRe = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const fmMatch = src.match(fmRe);
  if (!fmMatch) continue;
  let frontmatter = fmMatch[1];
  let body = fmMatch[2];

  const m = transformPageMeta(body);
  body = m.body;
  const fr = transformPageFooter(body);
  body = fr.body;

  if (!m.used && !fr.used) continue;

  // Add imports if needed.
  const needsMeta = m.used && !/from\s+['"][^'"]*\/PageMeta\.astro['"]/.test(frontmatter);
  const needsFooter = fr.used && !/from\s+['"][^'"]*\/PageFooter\.astro['"]/.test(frontmatter);
  if (needsMeta) {
    const rel = relImport(f, COMPONENTS_DIR);
    frontmatter += `\nimport PageMeta from '${rel}/PageMeta.astro';`;
  }
  if (needsFooter) {
    const rel = relImport(f, COMPONENTS_DIR);
    frontmatter += `\nimport PageFooter from '${rel}/PageFooter.astro';`;
  }

  const next = `---\n${frontmatter}\n---\n${body}`;

  if (!DRY) fs.writeFileSync(f, next, 'utf8');

  if (m.used) metaCount++;
  if (fr.used) footerCount++;
  touched++;
}

console.log(`${DRY ? '[dry-run] ' : ''}Touched ${touched} files: PageMeta in ${metaCount}, PageFooter in ${footerCount}.`);
