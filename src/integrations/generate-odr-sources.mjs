/** Ship canonical local ODR sources alongside their rendered Astro pages. */
import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateOdrRegistry } from '../../scripts/gen-odr-registry.mjs';

export function odrSourcesGenerator() {
  return {
    name: 'opda-local-odr-sources',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const root = fileURLToPath(config.root);
        const records = generateOdrRegistry(root);
        const destination = resolve(fileURLToPath(config.publicDir), 'decisions/odr');
        mkdirSync(destination, { recursive: true });
        const sources = new Set(records.map(({ source }) => source));
        for (const name of readdirSync(destination)) {
          if (/^ODR-\d{4}[a-z]?-.+\.md$/u.test(name) && !sources.has(name)) unlinkSync(resolve(destination, name));
        }
        for (const { source } of records) {
          copyFileSync(resolve(root, 'docs/ontology/odr', source), resolve(destination, source));
        }
        const crosswalk = 'method-adoption-crosswalk.json';
        const crosswalkSource = resolve(root, 'docs/ontology/odr', crosswalk);
        const crosswalkDestination = resolve(destination, crosswalk);
        if (existsSync(crosswalkSource)) copyFileSync(crosswalkSource, crosswalkDestination);
        else if (existsSync(crosswalkDestination)) unlinkSync(crosswalkDestination);
      },
    },
  };
}
