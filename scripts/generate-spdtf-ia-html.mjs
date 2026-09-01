#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { marked } from 'marked';

const markdownPath = new URL('../docs/spdtf-information-architecture.md', import.meta.url);
const htmlPath = new URL('../docs/spdtf-information-architecture.html', import.meta.url);
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
  const globalNavigation = '<nav class="proposed-nav" aria-label="Global navigation"><div class="inner">'
    + '<a href="/programme">Programme</a>'
    + '<a href="/governance">Governance</a>'
    + '<a href="/semantic-modelling">Modelling</a>'
    + '<a href="/spdtf">Development</a>'
    + '<a href="/spdtf/working-groups">Groups</a>'
    + '<a href="/resources">Resources</a>'
    + '</div></nav>';
  const main = `<main class="content" id="main" tabindex="-1">${body}<p class="print-note">Companion review artefact synchronized with <code>docs/spdtf-information-architecture.md</code>. No external resources are loaded; publication remains a separate release operation.</p></main>`;

  let output = template;
  const globalNavigationPattern = /<nav class="proposed-nav" aria-label="[^"]+">[\s\S]*?<\/nav>/u;
  if (!globalNavigationPattern.test(output)) throw new Error('HTML template marker not found: global navigation');
  output = output.replace(globalNavigationPattern, globalNavigation);
  output = output.replace(/<nav class="toc" id="toc" aria-label="On this page">[\s\S]*?<\/nav><\/aside>/u, `${toc}</aside>`);
  output = output.replace(/<main class="content" id="main"(?: tabindex="-1")?>[\s\S]*?<\/main>(?=<\/div><footer)/u, main);
  output = replaceKnown(output, '<title>Proposed SPDTF information architecture · OPDA</title>', '<title>SPDTF information architecture · OPDA</title>', 'document title');
  output = output.replace('Information architecture review · 18 August 2026', 'Information architecture · 23 August 2026');
  output = replaceKnown(output, 'Information architecture · 19 August 2026', 'Information architecture · 23 August 2026', 'header date');
  output = output
    .replace(
      'content="Proposed information architecture for the continuation from PDTF schema into SPDTF development."',
      'content="Proposed information architecture for the progression from the PDTF schema to the collaboratively authored SPDTF scheme draft."',
    )
    .replace(
      'content="Implemented information architecture for the continuation from PDTF schema into SPDTF development."',
      'content="Implemented information architecture for the progression from the PDTF schema to the collaboratively authored SPDTF scheme draft."',
    )
    .replace(
      'content="Implemented information architecture for the progression from the PDTF schema to the collaboratively authored SPDTF scheme draft."',
      'content="Information architecture for six global destinations, including top-level Modelling and Development with the PDTF schema as a third-party input."',
    )
    .replace(
      'content="Information architecture for six global destinations, including top-level Semantic modelling and SPDTF Development with the PDTF schema as a third-party input."',
      'content="Information architecture for six global destinations, including top-level Modelling and Development with the PDTF schema as a third-party input."',
    );
  output = replaceKnown(
    output,
    'content="Proposed information architecture for the progression from the PDTF schema to the collaboratively authored SPDTF scheme draft."',
    'content="Information architecture for six global destinations, including top-level Modelling and Development with the PDTF schema as a third-party input."',
    'meta description',
  );
  output = output.replace('<p class="eyebrow">Proposed · no live-site change</p>', '<p class="eyebrow">Implementation in progress on main · publication pending</p>');
  output = replaceKnown(output, '<p class="eyebrow">Implemented on feature branch · publication pending</p>', '<p class="eyebrow">Implementation in progress on main · publication pending</p>', 'hero status');
  output = replaceKnown(output, 'aria-label="Proposal summary"', 'aria-label="Implementation summary"', 'summary label');
  output = output.replaceAll('#proposed-hierarchy', '#implemented-hierarchy');
  output = output.replaceAll('#current-to-proposed-placement', '#current-to-implemented-placement');
  const shellCopy = [
    [
      'A task-led information architecture that preserves the PDTF schema implementation while making SPDTF development, review and authority explicit.',
      'A task-led information architecture that distinguishes the PDTF schema from the collaborative development, review and authority of SPDTF.',
    ],
    [
      'PDTF schema includes the published schema implementation and derived artefacts with their own status. SPDTF is work in development, not a released or adopted standard; no replacement or support decision is made here.',
      'The PDTF schema is the published schema implementation. Its separately derived ontology is draft technical evidence, not part of the schema or an endorsed scheme. SPDTF is the first collaboratively authored scheme draft and remains in development.',
    ],
    ['<span>continuous programme</span>', '<span>schema-to-scheme programme</span>'],
    [
      '<h2 id="overview-heading">Preserve continuity; make authority and maturity explicit</h2>',
      '<h2 id="overview-heading">Show the schema-to-scheme progression and its authority boundaries</h2>',
    ],
    [
      'Schema-led implementation plus derived ontology, model, mappings and guidance. Each child artefact keeps its own maturity and review status.',
      'Published JSON Schema package, dictionary, glossary, overlays and implementation material. The separately derived ontology is evidence with its own draft status.',
    ],
    ['<h3>SPDTF Development</h3>', '<h3>SPDTF</h3>'],
    ['Programme continuation diagram; scroll horizontally', 'Schema-to-scheme programme diagram; scroll horizontally'],
    [
      'How PDTF schema and other evidence inform SPDTF development',
      'How the PDTF schema and separate evidence inform SPDTF',
    ],
    [
      'Participant evidence, recognised sources, the PDTF schema semantic corpus and a machine-generated Property Pack pre-draft inform context-owned SPDTF ontology candidates. Human review produces a first working-group draft. One governance registry records authority throughout.',
      'Participant evidence, recognised sources, the PDTF schema and a separately derived draft ontology inform SPDTF ontology candidates. The Property Pack ontology is an accelerated SPDTF component. Human review produces a first working-group draft, with authority recorded throughout.',
    ],
    ['<text x="135" y="224" text-anchor="middle">PDTF schema corpus</text>', '<text x="135" y="224" text-anchor="middle">PDTF schema</text>'],
    ['<text class="small" x="135" y="246" text-anchor="middle">attributed evidence + compatibility</text>', '<text class="small" x="135" y="246" text-anchor="middle">source paths + compatibility evidence</text>'],
    ['<text class="on-amber" x="410" y="221" text-anchor="middle">Property Pack input</text>', '<text class="on-amber" x="410" y="221" text-anchor="middle">Schema-derived ontology</text>'],
    ['<text class="on-amber" x="410" y="243" text-anchor="middle">machine-generated pre-draft</text>', '<text class="on-amber" x="410" y="243" text-anchor="middle">separate draft technical evidence</text>'],
    ['<text x="695" y="117" text-anchor="middle" font-weight="800">Context-owned ontologies</text>', '<text x="695" y="117" text-anchor="middle" font-weight="800">SPDTF ontology development</text>'],
    ['<text class="small" x="695" y="198" text-anchor="middle">people decide meaning</text>', '<text class="small" x="695" y="198" text-anchor="middle">Property Pack is an accelerated component</text>'],
    [
      'PDTF schema contributes implementation evidence without silently controlling SPDTF meaning. The seed is a structured development input, not a working-group-approved model.',
      'The PDTF schema and the separately derived draft ontology contribute attributed evidence without controlling SPDTF meaning. The Property Pack ontology is an accelerated SPDTF component pending its stated review and governance decisions.',
    ],
  ];
  for (const [before, after] of shellCopy) output = replaceKnown(output, before, after);
  output = replaceKnown(output, '<strong>OPDA · Proposed SPDTF information architecture</strong>', '<strong>OPDA · SPDTF information architecture</strong>', 'footer title');
  output = output.replaceAll('./spdtf-0-information-architecture.md', './spdtf-information-architecture.md');
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
  console.log('Generated docs/spdtf-information-architecture.html');
}
