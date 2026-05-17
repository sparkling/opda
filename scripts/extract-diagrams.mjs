#!/usr/bin/env node
/**
 * Pattern-based refactor: convert literal <div class="diagram"> blocks to
 * <Diagram> component calls.
 *
 *   <div class="diagram diagram--medium">      <Diagram size="medium" caption="…">
 *     <div class="mermaid">          →          flowchart LR
 *       flowchart LR                              A --> B
 *       A --> B                                 </Diagram>
 *     </div>
 *     <div class="diagram-caption">…</div>
 *   </div>
 *
 * Run: node scripts/extract-diagrams.mjs [--dry-run]
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
  // For HTML-string attribute value. Astro re-parses this with set:html, so
  // we just need to escape characters significant to the JSX attribute parser.
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .trim();
}

function relImport(filePath, target) {
  const dir = path.dirname(filePath);
  let r = path.relative(dir, target).replace(/\\/g, '/');
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

// Captures the diagram block. The class can be exactly "diagram" or include a
// size modifier ("diagram diagram--medium" etc.). Inner mermaid is greedy
// non-greedy, caption is optional.
const DIAGRAM_RE = /<div class="diagram(?:\s+diagram--(small|medium|large))?">\s*<div class="mermaid">([\s\S]*?)<\/div>\s*(?:<div class="diagram-caption">([\s\S]*?)<\/div>\s*)?<\/div>/g;

function transformDiagrams(body) {
  let count = 0;
  const out = body.replace(DIAGRAM_RE, (_m, size, mermaid, caption) => {
    count++;
    const propParts = [];
    if (size) propParts.push(`size="${size}"`);
    if (caption && caption.trim()) {
      propParts.push(`caption="${escapeAttr(caption)}"`);
    }
    const propStr = propParts.length ? ' ' + propParts.join(' ') : '';
    return `<Diagram${propStr}>\n${mermaid.trim()}\n</Diagram>`;
  });
  return { body: out, count };
}

const files = findAstro(PAGES_DIR);
let totalFiles = 0, totalDiagrams = 0;

for (const f of files) {
  if (f.includes('/components/')) continue;
  const src = fs.readFileSync(f, 'utf8');

  const fmRe = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const fmMatch = src.match(fmRe);
  if (!fmMatch) continue;
  let frontmatter = fmMatch[1];
  let body = fmMatch[2];

  const r = transformDiagrams(body);
  if (!r.count) continue;
  body = r.body;

  const needsImport = !/from\s+['"][^'"]*\/Diagram\.astro['"]/.test(frontmatter);
  if (needsImport) {
    const rel = relImport(f, COMPONENTS_DIR);
    frontmatter += `\nimport Diagram from '${rel}/Diagram.astro';`;
  }

  const next = `---\n${frontmatter}\n---\n${body}`;
  if (!DRY) fs.writeFileSync(f, next, 'utf8');
  totalFiles++;
  totalDiagrams += r.count;
}

console.log(`${DRY ? '[dry-run] ' : ''}Converted ${totalDiagrams} diagrams in ${totalFiles} files.`);
