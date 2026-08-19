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

const barePdtf = /\bPDTF\b(?!\s+1\.0\b)/;
const explicitlyLabelledSourceWording = /source (?:document|wording)|exact (?:source wording|ODR-0009 wording)/i;

test('DBT Smart Data pages qualify PDTF 1.0 and SPDTF 2.0 Development terminology', async () => {
  for (const file of PAGES) {
    const source = await readFile(file, 'utf8');
    const name = basename(file);

    if (!source.includes('PDTF 1.0')) {
      throw new Error(`${name} must identify PDTF 1.0 when discussing the published baseline`);
    }
    if (!source.includes('SPDTF 2.0 Development')) {
      throw new Error(`${name} must identify SPDTF 2.0 Development for future work`);
    }

    for (const [index, line] of source.split('\n').entries()) {
      if (barePdtf.test(line) && !explicitlyLabelledSourceWording.test(line)) {
        throw new Error(`${name}:${index + 1} contains unqualified PDTF; use PDTF 1.0 or explicitly label source wording`);
      }
    }
  }
});
