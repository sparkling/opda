#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { marked } from 'marked';

const markdownPath = new URL('../docs/spdtf-2-0-information-architecture.md', import.meta.url);
const htmlPath = new URL('../docs/spdtf-2-0-information-architecture.html', import.meta.url);
const checkOnly = process.argv.includes('--check');

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function plainText(value) {
  return String(value)
    .replace(/<[^>]*>/gu, '')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .trim();
}

function slugBase(value) {
  return plainText(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[’']/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

function replaceKnown(source, before, after, label = before) {
  if (source.includes(before)) return source.replace(before, after);
  if (source.includes(after)) return source;
  throw new Error(`HTML template marker not found: ${label}`);
}

function compactEmbeddedStyles(source) {
  return source.replace(/<style>([\s\S]*?)<\/style>/gu, (_match, css) => (
    `<style>${css.replace(/\n\s*/gu, ' ').trim()}</style>`
  ));
}

function compactGeneratedHtml(source) {
  const preserved = [];
  const compact = source
    .replace(/<pre\b[\s\S]*?<\/pre>/gu, (block) => {
      const marker = `OPDA_PRESERVED_PRE_${preserved.length}`;
      preserved.push(block);
      return marker;
    })
    .replace(/\n\s*/gu, ' ')
    .trim();
  return preserved.reduce(
    (output, block, index) => output.replace(`OPDA_PRESERVED_PRE_${index}`, block),
    compact,
  );
}

function ensureSkipLink(source) {
  const rule = '.skip-link{position:fixed;inset-block-start:.5rem;inset-inline-start:.5rem;z-index:1000;padding:.75rem 1rem;background:var(--amber);color:var(--ink);font-weight:700;transform:translateY(-120%)}.skip-link:focus{transform:none;outline:3px solid var(--deep);outline-offset:2px}';
  let output = source;
  if (!output.includes('.skip-link{')) {
    output = replaceKnown(output, '<style>', `<style>${rule}`, 'embedded stylesheet');
  }
  if (!output.includes('class="skip-link"')) {
    output = replaceKnown(output, '<body>', '<body><a class="skip-link" href="#main">Skip to main content</a>', 'document body');
  }
  return output;
}

function renderMarkdown(markdown) {
  const source = markdown.replace(/^# .+\n+/u, '');
  const renderer = new marked.Renderer();
  const originalTable = renderer.table;
  const slugCounts = new Map();
  const headings = [];
  let tableCount = 0;

  renderer.heading = function heading(token) {
    const inline = this.parser.parseInline(token.tokens);
    const base = slugBase(inline) || 'section';
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    if (token.depth === 2) headings.push({ id, text: plainText(inline) });
    const link = token.depth >= 2
      ? `<a class="heading-link" href="#${id}" aria-label="Permalink to ${escapeAttribute(plainText(inline))}">#</a>`
      : '';
    return `<h${token.depth} id="${id}">${inline}${link}</h${token.depth}>\n`;
  };

  renderer.table = function table(token) {
    tableCount += 1;
    const rendered = originalTable.call(this, token);
    const label = `Information architecture table ${tableCount}; scroll horizontally`;
    return `<div class="table-scroll" role="region" tabindex="0" aria-label="${label}">${rendered}</div>`;
  };

  const body = marked.parse(source, { gfm: true, renderer });
  return { body, headings };
}

function buildHtml(template, markdown) {
  const { body, headings } = renderMarkdown(markdown);
  const toc = `<nav class="toc" id="toc" aria-label="On this page"><strong>Contents</strong>${headings
    .map(({ id, text }) => `<a href="#${id}">${text}</a>`)
    .join('')}</nav>`;
  const main = `<main class="content" id="main" tabindex="-1">${body}<p class="print-note">Companion review artefact synchronized with <code>docs/spdtf-2-0-information-architecture.md</code>. No external resources are loaded; publication remains a separate release operation.</p></main>`;

  let output = template;
  output = output.replace(/<nav class="toc" id="toc" aria-label="On this page">[\s\S]*?<\/nav><\/aside>/u, `${toc}</aside>`);
  output = output.replace(/<main class="content" id="main"(?: tabindex="-1")?>[\s\S]*?<\/main>(?=<\/div><footer)/u, main);
  output = replaceKnown(output, '<title>Proposed SPDTF 2.0 information architecture · OPDA</title>', '<title>SPDTF 2.0 information architecture · OPDA</title>', 'document title');
  output = replaceKnown(output, 'Information architecture review · 18 August 2026', 'Information architecture · 19 August 2026', 'header date');
  output = replaceKnown(output, 'content="Proposed information architecture for the continuation from PDTF 1.0 into SPDTF 2.0 development."', 'content="Implemented information architecture for the continuation from PDTF 1.0 into SPDTF 2.0 development."', 'meta description');
  output = replaceKnown(output, '<p class="eyebrow">Proposed · no live-site change</p>', '<p class="eyebrow">Implemented on feature branch · publication pending</p>', 'hero status');
  output = replaceKnown(output, 'aria-label="Proposal summary"', 'aria-label="Implementation summary"', 'summary label');
  output = replaceKnown(output, 'aria-label="Proposed global navigation"', 'aria-label="Implemented global navigation"', 'navigation label');
  output = output.replaceAll('#proposed-hierarchy', '#implemented-hierarchy');
  output = output.replaceAll('#current-to-proposed-placement', '#current-to-implemented-placement');
  output = replaceKnown(output, '<strong>OPDA · Proposed SPDTF 2.0 information architecture</strong>', '<strong>OPDA · SPDTF 2.0 information architecture</strong>', 'footer title');
  return compactGeneratedHtml(compactEmbeddedStyles(ensureSkipLink(output)));
}

const [markdown, currentHtml] = await Promise.all([
  readFile(markdownPath, 'utf8'),
  readFile(htmlPath, 'utf8'),
]);
const generated = buildHtml(currentHtml, markdown);

if (checkOnly) {
  if (generated !== currentHtml) {
    console.error('SPDTF IA HTML is stale; run `pnpm run docs:spdtf-ia`.');
    process.exitCode = 1;
  } else {
    console.log('SPDTF IA Markdown/HTML parity: pass');
  }
} else {
  await writeFile(htmlPath, generated);
  console.log('Generated docs/spdtf-2-0-information-architecture.html');
}
