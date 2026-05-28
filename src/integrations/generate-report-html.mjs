/**
 * Report generator (ADR-0021 §"Separate task") — converts embedded meta-report
 * markdown to static HTML fragments at build/dev start, written to
 * src/generated/. Pages serve the generated HTML directly (set:html) rather
 * than rendering the markdown through the content collection or linking the
 * `.md`: the report generator generates the static HTML, and the page serves it.
 *
 * Implemented as an Astro integration so it fires wherever `astro build` /
 * `astro dev` runs — local, CI, and the Cloudflare deploy (which invokes
 * `astro build` directly, bypassing the npm `build` script).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { marked } from 'marked';
import { REPORT_JOBS, IA_LINK_MAP } from '../lib/generated-reports.mjs';

function stripFrontmatter(md) {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

/** Rewrite intra-IA `.md` cross-links to their Astro routes (other links untouched). */
function rewriteIaLinks(html) {
  return html.replace(/href="\.?\/?([^"#]+\.md)(#[^"]*)?"/g, (whole, file, hash) => {
    const route = IA_LINK_MAP[file.split('/').pop()];
    return route ? `href="${route}${hash ?? ''}"` : whole;
  });
}

function generateReports() {
  for (const { src, out, group } of REPORT_JOBS) {
    const md = readFileSync(resolve(src), 'utf8');
    let html = marked.parse(stripFrontmatter(md), { gfm: true });
    if (group === 'ia') html = rewriteIaLinks(html);
    const outPath = resolve(out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log(`[report-generator] ${src} → ${out} (${html.length} bytes)`);
  }
}

export function reportGenerator() {
  return {
    name: 'opda-report-generator',
    hooks: {
      'astro:config:setup': generateReports,
    },
  };
}
