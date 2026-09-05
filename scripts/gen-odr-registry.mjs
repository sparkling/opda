#!/usr/bin/env node
/** Canonical local ODR metadata, regenerated during Astro setup. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Retain established short labels for historical records.
const DISPLAY_TITLES = {
  '0003': 'PDTF to Ontology: Programme and Work Breakdown',
  '0030': 'Foundational-Ontology Choice: UFO-as-Lens, Scoped to the Relator Spine',
  '0031': 'opda:ufoCategory and the Upper-Ontology Layer',
  '0032': 'Relationship Layer — Reify Inter-Entity Associations as OWL Object Properties',
  '0033': 'OWL/RDFS Axioms as Documentary AI-Signal — the Consolidated Doctrine',
  '0034': 'Relationship-Residue Completion — Events, Information Objects, and the Aboutness/Provenance Boundary',
};

export function collectOdrRecords(root) {
  const directory = resolve(root, 'docs/ontology/odr');
  const seen = new Set();
  return readdirSync(directory).filter((name) => /^ODR-\d{4}[a-z]?-.+\.md$/u.test(name)).sort().map((source) => {
    const text = readFileSync(resolve(directory, source), 'utf8');
    const number = source.match(/^ODR-(\d{4}[a-z]?)-/u)[1];
    if (seen.has(number)) throw new Error(`Duplicate ODR number: ${number}`);
    seen.add(number);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1] ?? '';
    const field = (key) => (frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^(['"])(.*)\1$/u, '$2');
    const title = DISPLAY_TITLES[number] ?? text.match(/^# (.+)$/mu)?.[1];
    if (!title) throw new Error(`Missing ODR title: ${source}`);
    return {
      id: `odr-${number}`, number, title,
      kind: field('kind') || (/\b(?:modelling-method|semantic-modelling)\b/u.test(field('tags')) ? 'methodology' : ''),
      status: field('status'),
      date: field('date'), updated: field('updated'), source,
      enriched: /^```mermaid\s*$/mu.test(text),
    };
  });
}

export function generateOdrRegistry(root, check = false) {
  const records = collectOdrRecords(root);
  const output = resolve(root, 'src/lib/odr-pages.mjs');
  const next = '/** Generated from docs/ontology/odr by scripts/gen-odr-registry.mjs. */\n'
    + `export const ODR_REGISTRY = [\n${records.map((record) => `  ${JSON.stringify(record)},`).join('\n')}\n];\n`;
  let current = '';
  try { current = readFileSync(output, 'utf8'); } catch { /* first generation */ }
  if (check && current !== next) throw new Error('ODR registry is stale; run node scripts/gen-odr-registry.mjs');
  if (!check && current !== next) writeFileSync(output, next);
  return records;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateOdrRegistry(fileURLToPath(new URL('../', import.meta.url)), process.argv.includes('--check'));
}
