#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import { load as loadYaml } from 'js-yaml';

import {
  NOTEBOOK_CONFIG_PATHS,
  PREPARED_ROOT,
  REPO_ROOT,
  sha256,
} from './lib/notebooklm-preparation.mjs';
import { DEPENDENCY_TRANSPORT_VERSION, computePromptFingerprint } from './lib/notebooklm-execution.mjs';

const RECEIPT_LINE_LIMIT = 500;
const SOURCE_LIMIT = 500;
const COMPLETION_STATUS = 'completed-automated-review-passed';
const SOURCE_STATUSES = new Set(['completed', 'reconciled']);
const UUID_PATTERN = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/iu;
const SHA_PATTERN = /^[a-f0-9]{64}$/u;
const SOURCE_ID_PATTERN = /^src-[a-f0-9]{16}$/u;
const AGGREGATE_CONFIG_PATH = 'docs/notebooklm/complete-research-corpus.yaml';
const EXPECTED_SOURCE_COUNTS = new Map([
  ['programme-policy-history', 33],
  ['standards-governance', 51],
  ['semantic-modelling-method', 52],
  ['working-group-participant-guide', 62],
  ['property-pack-ontology', 82],
  ['pdtf-lineage-historical-evidence', 163],
  ['complete-research-corpus', 398],
]);
const EXPECTED_PROMPT_COUNTS = new Map([
  ['programme-policy-history', 8],
  ['standards-governance', 8],
  ['semantic-modelling-method', 9],
  ['working-group-participant-guide', 10],
  ['property-pack-ontology', 9],
  ['pdtf-lineage-historical-evidence', 9],
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function safeRepoPath(relativePath) {
  invariant(typeof relativePath === 'string' && relativePath.length > 0, 'Repository path must be a non-empty string');
  const absolutePath = path.resolve(REPO_ROOT, relativePath);
  invariant(absolutePath.startsWith(`${REPO_ROOT}${path.sep}`), `Path escapes repository: ${relativePath}`);
  return absolutePath;
}

function readYaml(relativePath) {
  return loadYaml(fs.readFileSync(safeRepoPath(relativePath), 'utf8'));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(safeRepoPath(relativePath), 'utf8'));
}

function readStrictJsonLines(relativePath) {
  const text = fs.readFileSync(safeRepoPath(relativePath), 'utf8');
  invariant(text.endsWith('\n'), `${relativePath} must end with a newline`);
  const lines = text.slice(0, -1).split('\n');
  invariant(lines.length > 0, `${relativePath} is empty`);
  invariant(lines.length < RECEIPT_LINE_LIMIT,
    `${relativePath} has ${lines.length} lines; receipt files must remain under ${RECEIPT_LINE_LIMIT}`);
  return {
    lineCount: lines.length,
    records: lines.map((line, index) => {
      invariant(line.length > 0, `${relativePath}:${index + 1} is blank`);
      try {
        const record = JSON.parse(line);
        invariant(record && typeof record === 'object' && !Array.isArray(record),
          `${relativePath}:${index + 1} is not a JSON object`);
        return record;
      } catch (error) {
        throw new Error(`${relativePath}:${index + 1} is invalid JSON: ${error.message}`);
      }
    }),
  };
}

function slugFromConfig(configPath) {
  return path.basename(configPath, path.extname(configPath));
}

function manifestPath(slug) {
  return path.relative(REPO_ROOT, path.join(PREPARED_ROOT, 'manifests', `${slug}.json`));
}

function receiptPath(slug) {
  return `docs/notebooklm/receipts/${slug}.jsonl`;
}

function unique(values, label) {
  const result = new Set(values);
  invariant(result.size === values.length, `${label} contains duplicates`);
  return result;
}

function equalArrays(actual, expected, label) {
  invariant(isDeepStrictEqual(actual, expected), `${label} does not match the current execution contract`);
}

function verifyManifest(configPath, config, manifest, expectedCount) {
  const slug = slugFromConfig(configPath);
  invariant(config.notebook?.id === manifest.notebook_id, `${slug}: config and manifest notebook IDs differ`);
  invariant(UUID_PATTERN.test(manifest.notebook_id), `${slug}: invalid notebook ID`);
  invariant(config.notebook?.title === manifest.notebook_title, `${slug}: config and manifest titles differ`);
  invariant(manifest.config === configPath, `${slug}: manifest config path differs`);
  invariant(manifest.source_limit === SOURCE_LIMIT, `${slug}: source limit must be ${SOURCE_LIMIT}`);
  invariant(manifest.source_count === expectedCount, `${slug}: expected ${expectedCount} manifest sources`);
  invariant(Array.isArray(manifest.sources) && manifest.sources.length === expectedCount,
    `${slug}: source_count and sources length differ`);
  const stableIds = manifest.sources.map((source) => source.stable_source_id);
  const sourceSet = unique(stableIds, `${slug}: stable source IDs`);
  for (const source of manifest.sources) {
    invariant(source.source_id === source.stable_source_id, `${slug}: source_id differs from stable_source_id`);
    invariant(SOURCE_ID_PATTERN.test(source.stable_source_id), `${slug}: invalid stable source ID ${source.stable_source_id}`);
    invariant(SHA_PATTERN.test(source.sha256), `${slug}: invalid SHA-256 for ${source.stable_source_id}`);
    invariant(['file', 'url'].includes(source.upload?.kind), `${slug}: invalid upload kind for ${source.stable_source_id}`);
    if (source.upload.kind === 'file') {
      const uploadPath = safeRepoPath(source.upload.target);
      invariant(fs.statSync(uploadPath).isFile(), `${slug}: missing upload file ${source.upload.target}`);
      invariant(sha256(fs.readFileSync(uploadPath)) === source.sha256,
        `${slug}: upload hash differs for ${source.stable_source_id}`);
    }
  }
  const groupedIds = [];
  invariant(manifest.group_source_ids && typeof manifest.group_source_ids === 'object', `${slug}: missing source groups`);
  for (const [group, ids] of Object.entries(manifest.group_source_ids)) {
    invariant(Array.isArray(ids), `${slug}: source group ${group} is not an array`);
    unique(ids, `${slug}: source group ${group}`);
    for (const id of ids) {
      invariant(sourceSet.has(id), `${slug}: source group ${group} references unknown ${id}`);
      groupedIds.push(id);
    }
  }
  const groupedSet = new Set(groupedIds);
  invariant(stableIds.every((id) => groupedSet.has(id)), `${slug}: at least one source is absent from every group`);
  return { slug, sourceSet };
}

function latestSourceReceipts(records) {
  const latest = new Map();
  records.forEach((record, index) => {
    if (['source_ingested', 'failed_source_removed', 'superseded_source_removed'].includes(record.event)) {
      latest.set(record.stable_source_id, { ...record, receiptIndex: index });
    }
  });
  return latest;
}

function verifySourceReceipts(slug, manifest, records) {
  const manifestById = new Map(manifest.sources.map((source) => [source.stable_source_id, source]));
  const latest = latestSourceReceipts(records);
  equalArrays([...latest.keys()].sort(), [...manifestById.keys()].sort(), `${slug}: source receipt ID set`);
  const remoteIds = [];
  for (const [stableId, receipt] of latest) {
    const source = manifestById.get(stableId);
    invariant(receipt.event === 'source_ingested', `${slug}: latest lifecycle event removed ${stableId}`);
    invariant(SOURCE_STATUSES.has(receipt.status), `${slug}: invalid source status for ${stableId}`);
    invariant(receipt.notebook_id === manifest.notebook_id, `${slug}: receipt notebook differs for ${stableId}`);
    invariant(receipt.sha256 === source.sha256, `${slug}: receipt hash differs for ${stableId}`);
    invariant(UUID_PATTERN.test(receipt.notebook_source_id), `${slug}: invalid NotebookLM source ID for ${stableId}`);
    remoteIds.push(receipt.notebook_source_id);
  }
  unique(remoteIds, `${slug}: NotebookLM source IDs`);
  return new Map([...latest].map(([stableId, receipt]) => [stableId, receipt.notebook_source_id]));
}

function verifyPromptTopology(slug, config, manifest) {
  const prompts = config.preparation_prompts;
  const runOrder = config.execution_and_review?.run_order;
  invariant(Array.isArray(prompts), `${slug}: preparation_prompts is missing`);
  invariant(prompts.length === EXPECTED_PROMPT_COUNTS.get(slug), `${slug}: unexpected prompt count`);
  invariant(Array.isArray(runOrder), `${slug}: run_order is missing`);
  const promptIds = prompts.map((prompt) => prompt.id);
  unique(promptIds, `${slug}: prompt IDs`);
  unique(runOrder, `${slug}: run_order`);
  equalArrays([...runOrder].sort(), [...promptIds].sort(), `${slug}: run_order prompt set`);
  const promptById = new Map(prompts.map((prompt) => [prompt.id, prompt]));
  const positions = new Map(runOrder.map((id, index) => [id, index]));
  for (const prompt of prompts) {
    invariant(typeof prompt.prompt === 'string' && prompt.prompt.length > 0, `${slug}/${prompt.id}: empty prompt`);
    invariant(typeof prompt.output_note === 'string' && prompt.output_note.length > 0, `${slug}/${prompt.id}: empty note title`);
    invariant(Array.isArray(prompt.acceptance) && prompt.acceptance.length > 0, `${slug}/${prompt.id}: empty acceptance criteria`);
    unique(prompt.depends_on, `${slug}/${prompt.id}: dependencies`);
    for (const dependency of prompt.depends_on) {
      invariant(promptById.has(dependency), `${slug}/${prompt.id}: unknown dependency ${dependency}`);
      invariant(positions.get(dependency) < positions.get(prompt.id), `${slug}/${prompt.id}: dependency ${dependency} is not earlier`);
    }
    unique(prompt.source_scope, `${slug}/${prompt.id}: source scope`);
    for (const group of prompt.source_scope) {
      invariant(Array.isArray(manifest.group_source_ids[group]), `${slug}/${prompt.id}: unknown source group ${group}`);
    }
  }
  invariant(config.prompt_defaults?.prompt_version !== undefined, `${slug}: prompt version is missing`);
  invariant(typeof config.prompt_defaults?.instruction_prefix === 'string', `${slug}: instruction prefix is missing`);
  return { promptById, runOrder };
}

function verifyOutputQuality(slug, prompt, text, dependencies) {
  for (const dependency of dependencies) {
    invariant(text.includes(dependency.prompt_id), `${slug}/${prompt.id}: missing dependency ID ${dependency.prompt_id}`);
    invariant(text.includes(dependency.output_sha256), `${slug}/${prompt.id}: missing dependency hash ${dependency.prompt_id}`);
  }
  invariant(dependencies.length || !/Dependency Use Register/iu.test(text),
    `${slug}/${prompt.id}: unexpected dependency register`);
  invariant(!dependencies.length || !/(?:no|without) (?:prior|preceding|dependency) (?:messages|notes|context)/iu.test(text),
    `${slug}/${prompt.id}: output denies supplied dependency context`);
}

function verifyCurrentPrompts(context) {
  const { slug, config, manifest, records, remoteIdByStableId } = context;
  const { promptById, runOrder } = verifyPromptTopology(slug, config, manifest);
  const outputs = new Map();
  const pending = [];
  const noteIds = [];
  const derivedSourceIds = [];
  for (const promptId of runOrder) {
    const prompt = promptById.get(promptId);
    const dependencies = prompt.depends_on.map((id) => outputs.get(id));
    if (dependencies.some((item) => !item)) {
      pending.push(promptId);
      continue;
    }
    const stableIds = [...new Set(prompt.source_scope.flatMap((group) => manifest.group_source_ids[group]))];
    const sourceHashes = stableIds.map((id) => manifest.sources.find((source) => source.stable_source_id === id).sha256);
    const dependencyHashes = dependencies.map((item) => item.output_sha256);
    const fingerprint = computePromptFingerprint({ config, prompt, stableIds, sourceHashes, dependencyHashes });
    const queried = records.filter((record) => record.event === 'prompt_queried'
      && record.prompt_id === promptId && record.run_fingerprint === fingerprint);
    const completed = records.filter((record) => record.event === 'prompt_completed'
      && record.prompt_id === promptId && record.run_fingerprint === fingerprint);
    invariant(queried.length <= 1, `${slug}/${promptId}: duplicate current query receipts`);
    invariant(completed.length <= 1, `${slug}/${promptId}: duplicate current completion receipts`);
    if (!queried.length && !completed.length) {
      pending.push(promptId);
      continue;
    }
    invariant(queried.length === 1, `${slug}/${promptId}: completion exists without its query`);
    const query = queried[0];
    const expectedOutput = `docs/notebooklm/prepared/notes/${slug}/${promptId.toLowerCase()}.md`;
    invariant(fs.existsSync(safeRepoPath(expectedOutput)), `${slug}/${promptId}: output file is missing`);
    const text = fs.readFileSync(safeRepoPath(expectedOutput), 'utf8');
    const outputHash = sha256(text);
    invariant(query.status === 'completed', `${slug}/${promptId}: query is not completed`);
    equalArrays(query.selected_stable_source_ids, stableIds, `${slug}/${promptId}: selected stable source IDs`);
    equalArrays(query.selected_notebook_source_ids, stableIds.map((id) => remoteIdByStableId.get(id)),
      `${slug}/${promptId}: selected NotebookLM source IDs`);
    equalArrays(query.dependency_prompt_ids, prompt.depends_on, `${slug}/${promptId}: dependency prompt IDs`);
    equalArrays(query.dependency_output_sha256, dependencyHashes, `${slug}/${promptId}: dependency hashes`);
    equalArrays(query.dependency_notebook_source_ids, dependencies.map((item) => item.notebook_derived_source_id),
      `${slug}/${promptId}: dependency NotebookLM source IDs`);
    invariant(query.notebook_id === manifest.notebook_id, `${slug}/${promptId}: query notebook ID differs`);
    invariant(query.prompt_version === config.prompt_defaults.prompt_version, `${slug}/${promptId}: query prompt version differs`);
    invariant(query.dependency_transport === DEPENDENCY_TRANSPORT_VERSION,
      `${slug}/${promptId}: query dependency transport differs`);
    invariant(query.output_path === expectedOutput, `${slug}/${promptId}: query output path differs`);
    invariant(query.output_sha256 === outputHash, `${slug}/${promptId}: query output hash differs`);
    invariant(Number.isInteger(query.citation_count) && query.citation_count > 0, `${slug}/${promptId}: missing citations`);
    invariant(UUID_PATTERN.test(query.conversation_id), `${slug}/${promptId}: invalid query conversation ID`);
    verifyOutputQuality(slug, prompt, text, dependencies);
    if (!completed.length) {
      pending.push(promptId);
      continue;
    }
    const completion = completed[0];
    invariant(completion.status === COMPLETION_STATUS, `${slug}/${promptId}: invalid completion status`);
    invariant(completion.notebook_id === manifest.notebook_id, `${slug}/${promptId}: completion notebook ID differs`);
    invariant(completion.prompt_version === config.prompt_defaults.prompt_version,
      `${slug}/${promptId}: completion prompt version differs`);
    invariant(completion.conversation_id === query.conversation_id, `${slug}/${promptId}: conversation IDs differ`);
    invariant(completion.output_path === expectedOutput, `${slug}/${promptId}: completion output path differs`);
    invariant(completion.output_sha256 === outputHash, `${slug}/${promptId}: completion output hash differs`);
    invariant(UUID_PATTERN.test(completion.notebook_note_id), `${slug}/${promptId}: invalid note ID`);
    invariant(['created', 'reconciled'].includes(completion.note_status), `${slug}/${promptId}: invalid note status`);
    invariant(completion.authority_review === 'human-review-required-before-artefact-generation',
      `${slug}/${promptId}: authority review gate differs`);
    equalArrays(completion.findings, [], `${slug}/${promptId}: automated-review findings`);
    invariant(completion.citation_review === 'machine-citations-present', `${slug}/${promptId}: citation review differs`);
    invariant(completion.response_quality_review === 'passed', `${slug}/${promptId}: response quality review differs`);
    const derived = records.filter((record) => record.event === 'derived_source_ingested'
      && record.prompt_id === promptId && record.run_fingerprint === fingerprint
      && record.output_sha256 === outputHash);
    invariant(derived.length === 1, `${slug}/${promptId}: expected one current derived source receipt`);
    const derivedReceipt = derived[0];
    invariant(UUID_PATTERN.test(derivedReceipt.notebook_source_id), `${slug}/${promptId}: invalid derived source ID`);
    invariant(completion.notebook_derived_source_id === derivedReceipt.notebook_source_id,
      `${slug}/${promptId}: completion derived source ID differs`);
    invariant(derivedReceipt.title === `[derived-preparation ${promptId} run ${fingerprint.slice(0, 12)}]`,
      `${slug}/${promptId}: derived source title differs`);
    const derivedContent = fs.readFileSync(safeRepoPath(derivedReceipt.source_path));
    invariant(sha256(derivedContent) === derivedReceipt.content_sha256, `${slug}/${promptId}: derived source hash differs`);
    noteIds.push(completion.notebook_note_id);
    derivedSourceIds.push(derivedReceipt.notebook_source_id);
    outputs.set(promptId, { ...completion, text, prompt_id: promptId });
  }
  unique(noteIds, `${slug}: current note IDs`);
  unique(derivedSourceIds, `${slug}: current derived source IDs`);
  return { completed: outputs.size, expected: runOrder.length, pending, noteIds, derivedSourceIds };
}

function verifyAggregate(aggregateConfig, aggregateManifest, coreContexts) {
  const inputPaths = aggregateConfig.resource_manifest?.union_policy?.inputs;
  invariant(Array.isArray(inputPaths), 'complete-research-corpus: union inputs are missing');
  equalArrays([...inputPaths].sort(), NOTEBOOK_CONFIG_PATHS.map((configPath) => manifestPath(slugFromConfig(configPath))).sort(),
    'complete-research-corpus: union manifest set');
  const variantsById = new Map();
  for (const relativeManifest of inputPaths) {
    const manifest = readJson(relativeManifest);
    for (const source of manifest.sources) {
      const variants = variantsById.get(source.stable_source_id) || [];
      variants.push({ manifest: relativeManifest, source });
      variantsById.set(source.stable_source_id, variants);
    }
  }
  invariant([...coreContexts].reduce((total, context) => total + context.manifest.source_count, 0) === 443,
    'complete-research-corpus: core source placements must total 443');
  invariant(variantsById.size === 398, 'complete-research-corpus: core union must contain 398 sources');
  const expectedIds = [...variantsById.keys()].sort();
  equalArrays(aggregateManifest.sources.map((source) => source.stable_source_id), expectedIds,
    'complete-research-corpus: aggregate source order');
  equalArrays(aggregateManifest.group_source_ids['complete-research-corpus'], expectedIds,
    'complete-research-corpus: aggregate group source IDs');
  for (const aggregate of aggregateManifest.sources) {
    const variants = variantsById.get(aggregate.stable_source_id);
    const origins = new Set(variants.map(({ source }) => `${source.original_kind}\0${source.original_path_or_url}`));
    invariant(origins.size === 1, `complete-research-corpus: identity collision for ${aggregate.stable_source_id}`);
    const selected = [...variants].sort((left, right) => right.source.size_bytes - left.source.size_bytes
      || left.manifest.localeCompare(right.manifest))[0];
    for (const [key, value] of Object.entries(selected.source)) {
      if (key !== 'resource_ids') invariant(isDeepStrictEqual(aggregate[key], value),
        `complete-research-corpus: selected ${key} differs for ${aggregate.stable_source_id}`);
    }
    const expectedResourceIds = [...new Set(variants.flatMap(({ source }) => source.resource_ids))].sort();
    equalArrays(aggregate.resource_ids, expectedResourceIds, `complete-research-corpus: resource IDs for ${aggregate.stable_source_id}`);
    invariant(aggregate.aggregate_provenance?.selected_from === selected.manifest,
      `complete-research-corpus: selected provenance differs for ${aggregate.stable_source_id}`);
    const expectedVariants = variants.map(({ manifest, source }) => ({
      manifest, sha256: source.sha256, authority: source.authority, maturity: source.maturity,
    }));
    invariant(isDeepStrictEqual(aggregate.aggregate_provenance?.variants, expectedVariants),
      `complete-research-corpus: variants differ for ${aggregate.stable_source_id}`);
  }
}

function loadContext(configPath) {
  const config = readYaml(configPath);
  const slug = slugFromConfig(configPath);
  const manifest = readJson(manifestPath(slug));
  const receipt = readStrictJsonLines(receiptPath(slug));
  const expectedCount = EXPECTED_SOURCE_COUNTS.get(slug);
  invariant(expectedCount !== undefined, `${slug}: no approved source count`);
  verifyManifest(configPath, config, manifest, expectedCount);
  const remoteIdByStableId = verifySourceReceipts(slug, manifest, receipt.records);
  return { configPath, config, slug, manifest, records: receipt.records,
    receiptLineCount: receipt.lineCount, remoteIdByStableId };
}

function parseArguments(argv) {
  const options = { requireAllPrompts: false, json: false };
  for (const argument of argv) {
    if (argument === '--require-all-prompts') options.requireAllPrompts = true;
    else if (argument === '--json') options.json = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function usage() {
  return [
    'Verify local NotebookLM manifests, receipts and preparation outputs without network access.',
    '',
    'Usage: node scripts/verify-notebooklm-execution.mjs [options]',
    '  --require-all-prompts  Fail unless all 53 current prompt fingerprints are complete',
    '  --json                 Print the verification summary as JSON',
  ].join('\n');
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) { process.stdout.write(`${usage()}\n`); return; }
  const coreContexts = NOTEBOOK_CONFIG_PATHS.map(loadContext);
  const aggregateContext = loadContext(AGGREGATE_CONFIG_PATH);
  verifyAggregate(aggregateContext.config, aggregateContext.manifest, coreContexts);
  const audits = coreContexts.map((context) => ({ context, promptAudit: verifyCurrentPrompts(context) }));
  unique(audits.flatMap(({ promptAudit }) => promptAudit.noteIds), 'Current NotebookLM note IDs');
  unique(audits.flatMap(({ promptAudit }) => promptAudit.derivedSourceIds), 'Current NotebookLM derived source IDs');
  const notebooks = audits.map(({ context, promptAudit }) => ({
    slug: context.slug,
    sources: context.manifest.source_count,
    receipt_lines: context.receiptLineCount,
    prompts: { completed: promptAudit.completed, expected: promptAudit.expected, pending: promptAudit.pending },
  }));
  const completedPrompts = notebooks.reduce((total, notebook) => total + notebook.prompts.completed, 0);
  const expectedPrompts = notebooks.reduce((total, notebook) => total + notebook.prompts.expected, 0);
  invariant(expectedPrompts === 53, `Expected 53 configured prompts, found ${expectedPrompts}`);
  if (options.requireAllPrompts) {
    const pending = notebooks.flatMap((notebook) => notebook.prompts.pending.map((id) => `${notebook.slug}/${id}`));
    invariant(completedPrompts === expectedPrompts,
      `Only ${completedPrompts}/${expectedPrompts} current prompts are complete; pending: ${pending.join(', ')}`);
  }
  const summary = {
    status: 'verified',
    mode: options.requireAllPrompts ? 'all-prompts-required' : 'completed-prompts-only',
    core_source_placements: coreContexts.reduce((total, context) => total + context.manifest.source_count, 0),
    aggregate_sources: aggregateContext.manifest.source_count,
    aggregate_receipt_lines: aggregateContext.receiptLineCount,
    prompts: { completed: completedPrompts, expected: expectedPrompts },
    notebooks,
  };
  if (options.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  else {
    for (const notebook of notebooks) {
      process.stdout.write(`${notebook.slug}: ${notebook.sources} sources; ${notebook.prompts.completed}/${notebook.prompts.expected} prompts; ${notebook.receipt_lines} receipt lines\n`);
    }
    process.stdout.write(`complete-research-corpus: ${summary.aggregate_sources} sources; ${summary.aggregate_receipt_lines} receipt lines\n`);
    process.stdout.write(`NotebookLM local execution verification passed (${completedPrompts}/${expectedPrompts} current prompts complete).\n`);
  }
}

try { main(); }
catch (error) {
  process.stderr.write(`NotebookLM local execution verification failed: ${error.message}\n`);
  process.exitCode = 1;
}
