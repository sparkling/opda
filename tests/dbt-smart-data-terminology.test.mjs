import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { test } from 'node:test';

const ROOT = new URL('../', import.meta.url);
const PAGES = [
  'index.astro',
  'preamble.astro',
  'identity.astro',
  'governance-compliance.astro',
  'user-lifecycle.astro',
  'stewardship-privacy-ethics.astro',
  'security-risk-fraud.astro',
  'pdtf-overlap.astro',
  'gap-register.astro',
].map(file => join(ROOT.pathname, 'src/pages/dbt-smart-data', file));

const barePdtf = /\bPDTF\b(?!\s+schema\b)/;
const explicitlyLabelledSourceWording = /source (?:document|wording)|exact (?:source wording|ODR-0009 wording)/i;

test('DBT Smart Data pages distinguish the PDTF schema, derived evidence and SPDTF', async () => {
  for (const file of PAGES) {
    const source = await readFile(file, 'utf8');
    const name = basename(file);

    if (!source.includes('PDTF schema')) {
      throw new Error(`${name} must identify PDTF schema when discussing the published baseline`);
    }
    if (!source.includes('SPDTF')) {
      throw new Error(`${name} must identify SPDTF for collaborative scheme work`);
    }
    if (source.includes('SPDTF Development')) {
      throw new Error(`${name} must use SPDTF as the proper name and describe development in prose`);
    }

    for (const [index, line] of source.split('\n').entries()) {
      if (barePdtf.test(line) && !explicitlyLabelledSourceWording.test(line)) {
        throw new Error(`${name}:${index + 1} contains unqualified PDTF; use PDTF schema or explicitly label source wording`);
      }
    }
  }
});
