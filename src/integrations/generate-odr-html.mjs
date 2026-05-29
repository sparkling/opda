/**
 * ODR HTML generator (ADR-0024 — enrichment lives in the ODR markdown; HTML is
 * generated from it every build, gitignored, never committed). Supersedes
 * ADR-0023's committed frozen-HTML artefacts.
 *
 * Mirrors the ADR-0021 report generator: an astro:config:setup integration that
 * converts each docs/ontology/odr/ODR-NNNN-*.md to an HTML fragment under
 * src/generated/odr/ODR-NNNN.html, served by src/pages/modelling/odr/[id].astro
 * via set:html.
 *
 * Diagrams are authored in the markdown as ```mermaid fenced blocks (so they
 * also render natively on GitHub). This generator rewrites each fence to a
 * <div class="mermaid"> so the client.js loader renders it on the site
 * (clickable + lightbox per ADR-0022).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { marked } from 'marked';
import { ODR_REGISTRY } from '../lib/odr-pages.mjs';

const ODR_SRC_DIR = 'docs/ontology/odr';
const OUT_DIR = 'src/generated/odr';

// Mirror the pill maps in src/pages/modelling/odr/index.astro.
const KIND_PILL = {
  methodology: 'pill--brand', pattern: 'pill--info', mapping: 'pill--info',
  architecture: 'pill--warn', programme: 'pill--warn',
};
const STATUS_PILL = {
  accepted: 'pill--ok', proposed: 'pill--warn', rejected: 'pill--error',
};

/** Reverse marked's HTML-escaping of code-block contents. &amp; last. */
function htmlUnescape(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * marked renders ```mermaid as <pre><code class="language-mermaid">…</code></pre>
 * with the source HTML-escaped. client.js needs <div class="mermaid">…</div>
 * with the source un-escaped so Mermaid can parse it.
 */
function mermaidPreToDiv(html) {
  return html.replace(
    /<pre><code class="[^"]*\blanguage-mermaid\b[^"]*">([\s\S]*?)<\/code><\/pre>/g,
    (_m, body) => `<div class="mermaid">\n${htmlUnescape(body).trimEnd()}\n</div>`,
  );
}

function stripFrontmatter(md) {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function frontmatterField(md, field) {
  const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const m = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

/** {real ODR .md filename → /modelling/odr/odr-NNNN} for intra-ODR cross-links. */
function buildLinkMap(files) {
  const map = {};
  for (const f of files) {
    const m = f.match(/^ODR-(\d{4})-/);
    if (m) map[f] = `/modelling/odr/odr-${m[1]}`;
  }
  return map;
}

function rewriteOdrLinks(html, linkMap) {
  return html.replace(/href="\.?\/?([^"#]+\.md)(#[^"]*)?"/g, (whole, file, hash) => {
    const route = linkMap[file.split('/').pop()];
    return route ? `href="${route}${hash ?? ''}"` : whole;
  });
}

function generateOdrHtml() {
  const root = process.cwd();
  const srcDir = resolve(root, ODR_SRC_DIR);
  const files = readdirSync(srcDir).filter((f) => /^ODR-\d{4}-.*\.md$/.test(f));
  const linkMap = buildLinkMap(files);
  const byNumber = new Map(files.map((f) => [f.match(/^ODR-(\d{4})-/)[1], f]));

  let count = 0;
  for (const odr of ODR_REGISTRY) {
    const file = byNumber.get(odr.number);
    if (!file) { console.warn(`[odr-generator] no markdown for ODR-${odr.number}`); continue; }

    const md = readFileSync(resolve(srcDir, file), 'utf8');
    const date = frontmatterField(md, 'date') ?? '';
    let body = stripFrontmatter(md).replace(/^\s+/, ''); // drop leading blank lines
    body = body.replace(/^#\s+.*(\r?\n|$)/, '');          // drop the MD h1 (we inject our own)

    let bodyHtml = marked.parse(body, { gfm: true });
    bodyHtml = mermaidPreToDiv(bodyHtml);
    bodyHtml = rewriteOdrLinks(bodyHtml, linkMap);

    const kindPill = KIND_PILL[odr.kind] ?? 'pill--brand';
    const statusPill = STATUS_PILL[odr.status] ?? '';
    const html = `<!-- ODR-${odr.number} — generated from ${ODR_SRC_DIR}/${file} per ADR-0024.
     DO NOT EDIT — regenerated every build. Edit the markdown; diagrams live there. -->
<h1>ODR-${odr.number} — ${odr.title}</h1>
<div class="odr-meta">
  <span class="pill ${kindPill}">${odr.kind}</span>
  <span class="pill ${statusPill}">${odr.status}</span>${date ? `\n  <time datetime="${date}">${date}</time>` : ''}
</div>
${bodyHtml}`;

    const outPath = resolve(root, OUT_DIR, `ODR-${odr.number}.html`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    count++;
  }
  console.log(`[odr-generator] generated ${count} ODR HTML fragments → ${OUT_DIR}/`);
}

export function odrHtmlGenerator() {
  return {
    name: 'opda-odr-html-generator',
    hooks: { 'astro:config:setup': generateOdrHtml },
  };
}
