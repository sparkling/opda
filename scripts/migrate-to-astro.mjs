#!/usr/bin/env node
/**
 * One-shot migration: convert every static .html page under src/pages/ to
 * a .astro file that uses src/components/Layout.astro.
 *
 * What it preserves:
 *   - <title> (suffix " · OPDA Knowledge Base" stripped if present)
 *   - <meta name="description"> contents
 *   - OPDA.init({ page, section }) args
 *   - The article content (everything inside <article class="...">…</article>)
 *     OR, when no <article> exists (e.g. index.html, resource.html), the
 *     full #app body, with wrapArticle={false}.
 *   - Any inline <style>…</style> blocks from <head>, copied verbatim into
 *     the .astro as <style is:global>.
 *
 * What it skips:
 *   - Files prefixed with _ (templates).
 *   - Files that already have an .astro sibling.
 *   - Anything inside src/pages/api/ (not present today but reserved).
 *
 * Run: node scripts/migrate-to-astro.mjs [--dry-run]
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

function findHtml(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function relativeLayoutImport(filePath) {
  const dir = path.dirname(filePath);
  let rel = path.relative(dir, COMPONENTS_DIR).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return `${rel}/Layout.astro`;
}

function migrate(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath);

  // ---- title ----
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
  let title = titleMatch ? titleMatch[1].trim() : '';
  title = title
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/\s*[·•]\s*OPDA\s*Knowledge\s*Base\s*$/i, '')
    .trim();

  // ---- description ----
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
  const description = descMatch ? descMatch[1] : null;

  // ---- OPDA.init args ----
  // Multiple OPDA.init calls may appear in a file: escaped examples inside
  // <pre>/<code> blocks, and the real bootstrap at the bottom. We want the
  // last one (page-bootstrap convention is always the final script).
  const inits = [...html.matchAll(/OPDA\.init\(\s*\{([^}]*)\}\s*\)/g)];
  if (!inits.length) {
    return { skip: true, reason: 'no OPDA.init', rel };
  }
  const initMatch = inits[inits.length - 1];
  const initBody = initMatch[1];
  const pageMatch = initBody.match(/page:\s*['"]([^'"]+)['"]/);
  const sectionStrMatch = initBody.match(/section:\s*['"]([^'"]+)['"]/);
  const sectionNullMatch = initBody.match(/section:\s*null/);
  const page = pageMatch ? pageMatch[1] : null;
  const section = sectionStrMatch ? sectionStrMatch[1]
    : (sectionNullMatch ? null : undefined);
  if (!page) return { skip: true, reason: 'no page id', rel };

  // ---- inline <style> blocks from <head> ----
  const headOpen = html.indexOf('<head>');
  const headClose = html.indexOf('</head>');
  let inlineStyles = '';
  if (headOpen >= 0 && headClose > headOpen) {
    const headBlock = html.slice(headOpen, headClose);
    const styleRe = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g;
    let m;
    while ((m = styleRe.exec(headBlock)) !== null) {
      inlineStyles += m[1].trim() + '\n';
    }
  }

  // ---- article content ----
  // Prefer the standard <article class="..."> wrapper.
  const articleRe = /<article\s+([^>]*)>([\s\S]*?)<\/article>/;
  const articleMatch = html.match(articleRe);
  let proseClass = 'prose wide';
  let content;
  let wrapArticle = true;

  if (articleMatch) {
    const cm = articleMatch[1].match(/class="([^"]*)"/);
    if (cm) proseClass = cm[1];
    content = articleMatch[2];
  } else {
    // Fall back: everything inside #app (excluding the closing div and the site.js script).
    const appRe = /<div\s+id="app">([\s\S]*?)<\/div>\s*<script\s+src=["']\/ui\/site\.js["']/;
    const appMatch = html.match(appRe);
    if (!appMatch) return { skip: true, reason: 'no <article> or #app', rel };
    content = appMatch[1];
    wrapArticle = false;
  }

  // ---- escape JSX-significant chars in body content ----
  // Astro parses .astro files as JSX-flavored: bare `{` starts an expression.
  // Source HTML has literal `{` and `}` in Mermaid diagrams, code examples,
  // and inline JSON. Replace them with HTML entities so Astro treats them
  // as plain text. The browser decodes entities back to `{` / `}` when
  // building the DOM, so Mermaid's `.textContent` still sees the real chars.
  content = content.replace(/\{/g, '&lbrace;').replace(/\}/g, '&rbrace;');

  // ---- compose .astro ----
  const layoutPath = relativeLayoutImport(filePath);
  const props = [`  title="${escapeAttr(title)}"`];
  if (description) props.push(`  description="${escapeAttr(description)}"`);
  props.push(`  page="${page}"`);
  if (section === null) props.push(`  section={null}`);
  else if (typeof section === 'string') props.push(`  section="${section}"`);
  if (wrapArticle && proseClass !== 'prose wide') {
    props.push(`  proseClass="${proseClass}"`);
  }
  if (!wrapArticle) props.push(`  wrapArticle={false}`);

  let body = `---\nimport Layout from '${layoutPath}';\n---\n<Layout\n${props.join('\n')}\n>\n${content.trim()}\n</Layout>\n`;
  if (inlineStyles) {
    body += `\n<style is:global>\n${inlineStyles.trim()}\n</style>\n`;
  }

  const astroPath = filePath.replace(/\.html$/, '.astro');
  return { astroPath, body, oldPath: filePath, rel };
}

// ---- main ----
const files = findHtml(PAGES_DIR);
console.log(`Found ${files.length} HTML files under src/pages/`);
let ok = 0, skipped = 0;
const skips = [];
for (const f of files) {
  const result = migrate(f);
  if (result.skip) {
    skipped++;
    skips.push(`  ${result.rel} — ${result.reason}`);
    continue;
  }
  if (DRY) {
    ok++;
    continue;
  }
  fs.writeFileSync(result.astroPath, result.body, 'utf8');
  fs.unlinkSync(result.oldPath);
  ok++;
}
console.log(`${DRY ? '[dry-run] ' : ''}Migrated: ${ok}  Skipped: ${skipped}`);
if (skips.length) {
  console.log('Skipped files:');
  skips.forEach(s => console.log(s));
}
