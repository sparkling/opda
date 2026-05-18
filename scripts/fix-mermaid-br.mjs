#!/usr/bin/env node
/**
 * Mermaid node-label fixer.
 *
 * Bug: Mermaid node labels containing `<br/>` render as concatenated text
 * because the browser parses `<br/>` as an actual <br> element and
 * Mermaid's source-reader (`textContent`) skips it. Result:
 *
 *     SG[Steering Group<br/>monthly governance]   →   "Steering Groupmonthly governance"
 *
 * Fix: convert every node label that contains `<br>` (or `<br/>`) to
 * Mermaid's backtick-markdown notation with real newlines:
 *
 *     SG["`Steering Group
 *     monthly governance`"]
 *
 * Backtick-quoted strings are markdown-rendered by Mermaid, and real
 * newlines in the source survive textContent intact. Inline HTML tags
 * (<b>, <i>, <strong>, <em>) are converted to markdown equivalents.
 *
 * Only labels inside <Diagram>…</Diagram> blocks are touched. The
 * Diagram component's caption= attribute is left alone.
 *
 * Run: node scripts/fix-mermaid-br.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src/pages');
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

/** Convert HTML markup inside a label to markdown + real newlines. */
function convertLabelContent(s) {
  return s
    // Strip any pre-existing surrounding backticks; we'll re-add.
    .replace(/^`/, '').replace(/`$/, '')
    // HTML inline tags → markdown
    .replace(/<b>([\s\S]+?)<\/b>/gi, '**$1**')
    .replace(/<strong>([\s\S]+?)<\/strong>/gi, '**$1**')
    .replace(/<i>([\s\S]+?)<\/i>/gi, '*$1*')
    .replace(/<em>([\s\S]+?)<\/em>/gi, '*$1*')
    // br → real newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Decode entities that markdown / Mermaid would otherwise see literally
    .replace(/&amp;/g, '&')
    .replace(/&middot;/g, '·');
}

/**
 * Match a Mermaid node definition on a single line. Captures:
 *   1: leading whitespace
 *   2: node id
 *   3: opening bracket sequence ([, (, ((, {, {{, [/, [\, [(, etc.)
 *   4: optional opening quote (")
 *   5: optional opening backtick (`)
 *   6: label content (lazy)
 *   7: optional closing backtick (`)
 *   8: optional closing quote (")
 *   9: closing bracket sequence
 *   10: optional :::class
 *   11: trailing text on the line
 */
const NODE_RE = /^(\s*)([A-Za-z_][\w]*)(\[+\(*|\(+\[*|\{+|\[[\/\\(])(")?(`?)([\s\S]*?)(`?)(")?(\)*\]+|\]+\)*|\}+|[\/\\)]\])(:::\w+)?(.*)$/;

function fixLine(line) {
  if (!/<br\s*\/?>/i.test(line)) return line;
  const m = line.match(NODE_RE);
  if (!m) return line;
  const [, lead, id, open, , , content, , , close, cls, rest] = m;
  if (!/<br\s*\/?>/i.test(content)) return line;
  const inner = convertLabelContent(content);
  // For shape preservation, keep the same outer bracket style but inject ["` … `"].
  // Most diagrams use [...] rectangles; for those we emit ["` … `"]. For others,
  // keep the leading/trailing bracket sequences but always inject the inner ["` … `"]
  // form which Mermaid supports inside any bracket shape.
  return `${lead}${id}${open}"\`${inner}\`"${close}${cls || ''}${rest}`;
}

const files = findAstro(PAGES_DIR);
let totalFiles = 0, totalLines = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!/<br\s*\/?>/i.test(src)) continue;
  // Walk line-by-line, tracking whether we're inside <Diagram>…</Diagram>.
  const lines = src.split(/\r?\n/);
  let inDiagram = false;
  let touched = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/<Diagram\b/.test(l)) inDiagram = true;
    if (inDiagram) {
      const fixed = fixLine(l);
      if (fixed !== l) { lines[i] = fixed; touched++; }
    }
    if (/<\/Diagram>/.test(l)) inDiagram = false;
  }
  if (!touched) continue;
  if (!DRY) fs.writeFileSync(f, lines.join('\n'), 'utf8');
  totalFiles++;
  totalLines += touched;
  console.log(`  ${path.relative(ROOT, f)}: ${touched} node label(s) converted`);
}

console.log(`\n${DRY ? '[dry-run] ' : ''}Touched ${totalFiles} files, ${totalLines} node labels.`);
