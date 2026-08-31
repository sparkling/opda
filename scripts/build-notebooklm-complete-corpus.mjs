#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { load as loadYaml } from 'js-yaml';

import { REPO_ROOT } from './lib/notebooklm-preparation.mjs';

const configPath = path.join(REPO_ROOT, 'docs/notebooklm/complete-research-corpus.yaml');
const outputPath = path.join(REPO_ROOT, 'docs/notebooklm/prepared/manifests/complete-research-corpus.json');

function chooseVariant(variants) {
  return [...variants].sort((left, right) => right.source.size_bytes - left.source.size_bytes
    || left.manifest.localeCompare(right.manifest))[0];
}

function main() {
  const config = loadYaml(fs.readFileSync(configPath, 'utf8'));
  const variantsById = new Map();
  for (const relativeManifest of config.resource_manifest.union_policy.inputs) {
    const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativeManifest), 'utf8'));
    for (const source of manifest.sources) {
      const variants = variantsById.get(source.stable_source_id) || [];
      variants.push({ manifest: relativeManifest, source });
      variantsById.set(source.stable_source_id, variants);
    }
  }
  const sources = [];
  for (const [stableId, variants] of [...variantsById].sort(([left], [right]) => left.localeCompare(right))) {
    const origins = new Set(variants.map(({ source }) => `${source.original_kind}\0${source.original_path_or_url}`));
    if (origins.size !== 1) throw new Error(`Stable source identity collision: ${stableId}`);
    const selected = chooseVariant(variants);
    sources.push({
      ...selected.source,
      resource_ids: [...new Set(variants.flatMap(({ source }) => source.resource_ids))].sort(),
      aggregate_provenance: {
        selected_from: selected.manifest,
        variants: variants.map(({ manifest, source }) => ({
          manifest, sha256: source.sha256, authority: source.authority, maturity: source.maturity,
        })),
      },
    });
  }
  const limit = config.resource_manifest.union_policy.source_limit;
  const expected = config.resource_manifest.union_policy.expected_source_count;
  if (sources.length !== expected) throw new Error(`Expected ${expected} sources, found ${sources.length}`);
  if (sources.length > limit) throw new Error(`Complete corpus exceeds source limit: ${sources.length}/${limit}`);
  const manifest = {
    config: path.relative(REPO_ROOT, configPath),
    notebook_id: config.notebook.id,
    notebook_title: config.notebook.title,
    generated_at: new Date().toISOString(),
    source_limit: limit,
    source_count: sources.length,
    source_policy: 'deduplicated-union-of-six-approved-manifests',
    group_source_ids: { 'complete-research-corpus': sources.map((source) => source.stable_source_id) },
    sources,
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`${path.relative(REPO_ROOT, outputPath)}: ${sources.length}/${limit} sources\n`);
}

try { main(); }
catch (error) { process.stderr.write(`Complete corpus preparation failed: ${error.message}\n`); process.exitCode = 1; }
