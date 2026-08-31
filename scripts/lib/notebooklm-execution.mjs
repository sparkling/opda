import { execFile as execFileCallback } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { load as loadYaml } from 'js-yaml';

import { REPO_ROOT } from './notebooklm-preparation.mjs';

const execFile = promisify(execFileCallback);
const RECEIPT_ROOT = path.join(REPO_ROOT, 'docs/notebooklm/receipts');
const PREPARED_ROOT = path.join(REPO_ROOT, 'docs/notebooklm/prepared');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function slugFromConfig(configPath) {
  return path.basename(configPath, path.extname(configPath));
}

function parseJsonLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSONL at ${path.relative(REPO_ROOT, filePath)}:${index + 1}`); }
  });
}

function appendReceipt(filePath, event) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`);
}

async function runNlm(args, { json = false, timeout = 900_000 } = {}) {
  const { stdout, stderr } = await execFile('nlm', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout,
  });
  if (stderr.trim()) process.stderr.write(stderr);
  return json ? JSON.parse(stdout) : stdout;
}

async function retry(operation, label, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return await operation(attempt); }
    catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delay = 1_000 * (2 ** (attempt - 1));
      process.stderr.write(`[retry ${attempt}/${attempts}] ${label}: ${error.message}\n`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function stableIdFromTitle(title) {
  return /^\[(src-[a-f0-9]+)\]/.exec(title || '')?.[1] || null;
}

function validateExecutionGate(config, manifest) {
  if (config.workspace?.sharing !== 'private') throw new Error('Notebook must remain private');
  if (config.resource_manifest?.status !== 'approved') throw new Error('Source manifest is not approved');
  if (config.resource_manifest?.review_required_before_ingestion) throw new Error('Manifest review remains blocking');
  if (!String(config.resource_manifest?.prepared_source_contract?.builder_status).startsWith('implemented')) {
    throw new Error('Preparation builder is not marked implemented');
  }
  if (manifest.source_count !== manifest.sources.length || manifest.source_count > manifest.source_limit) {
    throw new Error(`Invalid source count ${manifest.source_count}/${manifest.source_limit}`);
  }
  const authorisation = config.dependencies?.find((item) => item.id === 'repository-public-source-authorisation');
  if (authorisation?.status !== 'approved') throw new Error('Repository upload authorisation is not approved');
  const blocking = config.dependencies?.filter((item) => item.blocking && !String(item.status).match(/^(approved|built|implemented)/));
  if (blocking?.length) throw new Error(`Blocking dependencies: ${blocking.map((item) => item.id).join(', ')}`);
}

function loadExecutionContext(configPath) {
  const absoluteConfig = path.resolve(REPO_ROOT, configPath);
  const config = loadYaml(fs.readFileSync(absoluteConfig, 'utf8'));
  const slug = slugFromConfig(configPath);
  const manifestPath = path.join(PREPARED_ROOT, 'manifests', `${slug}.json`);
  const manifest = readJson(manifestPath);
  validateExecutionGate(config, manifest);
  return {
    configPath,
    config,
    manifest,
    slug,
    manifestPath,
    receiptPath: path.join(RECEIPT_ROOT, `${slug}.jsonl`),
    noteRoot: path.join(PREPARED_ROOT, 'notes', slug),
  };
}

function sourceIdentityCandidates(context, remote, receiptByRemoteId) {
  const fromReceipt = receiptByRemoteId.get(remote.id);
  if (fromReceipt) return [fromReceipt];
  const fromTitle = stableIdFromTitle(remote.title);
  if (fromTitle) return [fromTitle];
  return context.manifest.sources.filter((source) => {
    if (remote.url && [source.upload.target, source.final_url].includes(remote.url)) return true;
    return source.upload.kind === 'file' && path.basename(source.upload.target) === remote.title;
  }).map((source) => source.stable_source_id);
}

async function listRemoteSources(context, profile, { allowIncomplete = false } = {}) {
  const receipts = parseJsonLines(context.receiptPath).filter((item) => item.event === 'source_ingested');
  const receiptByRemoteId = new Map(receipts.map((item) => [item.notebook_source_id, item.stable_source_id]));
  const sources = await runNlm(['source', 'list', context.manifest.notebook_id, '--profile', profile, '--json'], { json: true });
  const map = new Map();
  for (const source of sources) {
    const candidates = sourceIdentityCandidates(context, source, receiptByRemoteId);
    if (candidates.length !== 1) throw new Error(`Unmanaged or ambiguous source in ${context.slug}: ${source.title}`);
    const stableId = candidates[0];
    if (!context.manifest.sources.some((item) => item.stable_source_id === stableId)) {
      throw new Error(`Out-of-manifest source in ${context.slug}: ${stableId}`);
    }
    if (map.has(stableId)) throw new Error(`Duplicate remote source in ${context.slug}: ${stableId}`);
    if (source.status !== 2 && !allowIncomplete) throw new Error(`Remote source is not processed: ${stableId} (status ${source.status})`);
    map.set(stableId, source);
  }
  return map;
}

async function addSource(context, source, profile) {
  const args = ['source', 'add', context.manifest.notebook_id];
  if (source.upload.kind === 'url') args.push('--url', source.upload.target);
  else args.push('--file', path.resolve(REPO_ROOT, source.upload.target));
  args.push('--title', source.title, '--wait', '--wait-timeout', '600', '--json', '--profile', profile);
  return runNlm(args, { json: true, timeout: 720_000 });
}

async function mapPool(items, concurrency, worker) {
  let cursor = 0;
  const failures = [];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try { await worker(items[index], index); }
      catch (error) { failures.push({ item: items[index], error }); }
    }
  });
  await Promise.all(workers);
  if (failures.length) {
    throw new Error(failures.map(({ item, error }) => `${item.stable_source_id}: ${error.message}`).join('\n'));
  }
}

export async function ingestNotebook(context, options) {
  const receipts = parseJsonLines(context.receiptPath);
  const receiptBySource = new Map(receipts.filter((item) => item.event === 'source_ingested')
    .map((item) => [item.stable_source_id, item]));
  const remote = await listRemoteSources(context, options.profile, { allowIncomplete: true });
  for (const [stableId, source] of [...remote]) {
    if (source.status === 2) continue;
    await runNlm(['source', 'delete', source.id, '--confirm', '--json', '--profile', options.profile], { json: true });
    appendReceipt(context.receiptPath, {
      event: 'failed_source_removed', recorded_at: new Date().toISOString(), notebook_id: context.manifest.notebook_id,
      stable_source_id: stableId, notebook_source_id: source.id, remote_status: source.status,
    });
    remote.delete(stableId);
  }
  for (const [stableId, source] of remote) {
    const planned = context.manifest.sources.find((item) => item.stable_source_id === stableId);
    const receipt = receiptBySource.get(stableId);
    if (receipt && receipt.sha256 !== planned.sha256) throw new Error(`Changed source already ingested: ${stableId}`);
    if (!receipt) {
      appendReceipt(context.receiptPath, {
        event: 'source_ingested', status: 'reconciled', recorded_at: new Date().toISOString(),
        notebook_id: context.manifest.notebook_id, stable_source_id: stableId,
        notebook_source_id: source.id, sha256: planned.sha256, title: planned.title,
      });
    }
  }
  const pending = context.manifest.sources.filter((source) => !remote.has(source.stable_source_id));
  process.stdout.write(`[${context.slug}] ${remote.size} present; ${pending.length} to ingest\n`);
  await mapPool(pending, options.concurrency, async (source) => {
    const result = await retry(async (attempt) => {
      if (attempt > 1) {
        const current = await listRemoteSources(context, options.profile, { allowIncomplete: true });
        const found = current.get(source.stable_source_id);
        if (found?.status === 2) return { source_id: found.id, reconciled: true };
        if (found) {
          await runNlm(['source', 'delete', found.id, '--confirm', '--json', '--profile', options.profile], { json: true });
        }
      }
      return addSource(context, source, options.profile);
    }, `${context.slug}/${source.stable_source_id}`);
    remote.set(source.stable_source_id, { id: result.source_id, title: source.title, status: 2 });
    appendReceipt(context.receiptPath, {
      event: 'source_ingested', status: result.reconciled ? 'reconciled' : 'completed',
      recorded_at: new Date().toISOString(), notebook_id: context.manifest.notebook_id,
      stable_source_id: source.stable_source_id, notebook_source_id: result.source_id,
      sha256: source.sha256, title: source.title, upload_kind: source.upload.kind,
    });
    process.stdout.write(`[${context.slug}] ${remote.size}/${context.manifest.source_count} ${source.stable_source_id}\n`);
  });
  const verified = await listRemoteSources(context, options.profile);
  if (verified.size !== context.manifest.source_count) {
    throw new Error(`Remote source count mismatch: ${verified.size}/${context.manifest.source_count}`);
  }
  return verified;
}

function promptSourceIds(context, prompt, remote) {
  const stableIds = [...new Set(prompt.source_scope.flatMap((group) => {
    const ids = context.manifest.group_source_ids[group];
    if (!ids) throw new Error(`${prompt.id} references unknown source group ${group}`);
    return ids;
  }))];
  return {
    stableIds,
    remoteIds: stableIds.map((id) => {
      const source = remote.get(id);
      if (!source) throw new Error(`${prompt.id} source is not ingested: ${id}`);
      return source.id;
    }),
  };
}

function promptText(config, prompt, dependencyNotes) {
  const sections = [
    config.prompt_defaults.instruction_prefix,
    `# Task ${prompt.id}: ${prompt.title}`,
    prompt.prompt,
    `# Acceptance criteria\n${prompt.acceptance.map((item) => `- ${item}`).join('\n')}`,
  ];
  if (dependencyNotes.length) {
    sections.push(`# Complete labelled dependency notes\n${dependencyNotes.map((item) => `## ${item.id}\n${item.text}`).join('\n\n')}`);
  }
  return sections.join('\n\n');
}

function citationCount(result) {
  const values = [result.sources_used, result.references, result.citations];
  return values.reduce((total, value) => total + (Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0), 0);
}

function outputPath(context, promptId) {
  return path.join(context.noteRoot, `${promptId.toLowerCase()}.md`);
}

function loadCompletePrompt(receipts, prompt, fingerprint, filePath) {
  const complete = receipts.findLast((item) => item.event === 'prompt_completed'
    && item.prompt_id === prompt.id && item.run_fingerprint === fingerprint);
  if (!complete || !fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, 'utf8');
  if (sha256(text) !== complete.output_sha256) return null;
  return { ...complete, text };
}

async function createNotebookNote(context, prompt, answer, profile) {
  const stdout = await runNlm(['note', 'create', context.manifest.notebook_id, '--title', prompt.output_note,
    '--content', answer, '--profile', profile], { timeout: 300_000 });
  const noteId = /Note created:\s*([a-f0-9-]+)/i.exec(stdout)?.[1];
  if (!noteId) throw new Error(`Could not parse note ID for ${prompt.id}`);
  return noteId;
}

export async function executePrompts(context, remote, options) {
  fs.mkdirSync(context.noteRoot, { recursive: true });
  let receipts = parseJsonLines(context.receiptPath);
  const outputs = new Map();
  for (const promptId of context.config.execution_and_review.run_order) {
    const prompt = context.config.preparation_prompts.find((item) => item.id === promptId);
    if (!prompt) throw new Error(`Missing configured prompt ${promptId}`);
    const dependencyNotes = prompt.depends_on.map((id) => {
      const dependency = outputs.get(id);
      if (!dependency) throw new Error(`${prompt.id} dependency is incomplete: ${id}`);
      return { id, text: dependency.text, sha256: dependency.output_sha256 };
    });
    const selected = promptSourceIds(context, prompt, remote);
    const fingerprint = sha256(JSON.stringify({
      id: prompt.id, version: context.config.prompt_defaults.prompt_version,
      prompt: prompt.prompt, acceptance: prompt.acceptance, stableIds: selected.stableIds,
      dependencyHashes: dependencyNotes.map((item) => item.sha256),
    }));
    const filePath = outputPath(context, prompt.id);
    const complete = loadCompletePrompt(receipts, prompt, fingerprint, filePath);
    if (complete) {
      outputs.set(prompt.id, complete);
      process.stdout.write(`[${context.slug}] ${prompt.id} already completed\n`);
      continue;
    }
    let queryEvent = receipts.findLast((item) => item.event === 'prompt_queried'
      && item.prompt_id === prompt.id && item.run_fingerprint === fingerprint);
    let answer;
    if (queryEvent && fs.existsSync(filePath)) {
      answer = fs.readFileSync(filePath, 'utf8');
      if (sha256(answer) !== queryEvent.output_sha256) queryEvent = null;
    }
    if (!queryEvent) {
      const question = promptText(context.config, prompt, dependencyNotes);
      const result = await retry(() => runNlm(['query', 'notebook', context.manifest.notebook_id, question,
        '--source-ids', selected.remoteIds.join(','), '--new-conversation', '--timeout', '300',
        '--json', '--profile', options.profile], { json: true, timeout: 360_000 }), `${context.slug}/${prompt.id}`, 3);
      answer = result.answer.trim();
      fs.writeFileSync(filePath, answer);
      queryEvent = {
        event: 'prompt_queried', status: 'completed', recorded_at: new Date().toISOString(),
        notebook_id: context.manifest.notebook_id, prompt_id: prompt.id,
        prompt_version: context.config.prompt_defaults.prompt_version, run_fingerprint: fingerprint,
        selected_stable_source_ids: selected.stableIds, selected_notebook_source_ids: selected.remoteIds,
        dependency_prompt_ids: prompt.depends_on, dependency_output_sha256: dependencyNotes.map((item) => item.sha256),
        conversation_id: result.conversation_id || null, sources_used: result.sources_used || [],
        citation_count: citationCount(result), output_path: path.relative(REPO_ROOT, filePath),
        output_sha256: sha256(answer),
      };
      appendReceipt(context.receiptPath, queryEvent);
    }
    const noteId = await retry(() => createNotebookNote(context, prompt, answer, options.profile), `${context.slug}/${prompt.id}/note`, 3);
    const warnings = [];
    if (!queryEvent.citation_count) warnings.push('no-machine-readable-citations-returned');
    for (const term of ['PDTF 1.0', 'SPDTF 2.0']) if (answer.includes(term)) warnings.push(`prohibited-label-mentioned:${term}`);
    const completed = {
      event: 'prompt_completed', status: warnings.length ? 'completed-needs-human-review' : 'completed-automated-review-passed',
      recorded_at: new Date().toISOString(), notebook_id: context.manifest.notebook_id,
      prompt_id: prompt.id, prompt_version: context.config.prompt_defaults.prompt_version,
      run_fingerprint: fingerprint, notebook_note_id: noteId,
      conversation_id: queryEvent.conversation_id, output_path: path.relative(REPO_ROOT, filePath),
      output_sha256: sha256(answer), citation_review: queryEvent.citation_count ? 'machine-citations-present' : 'needs-human-review',
      authority_review: 'human-review-required-before-artefact-generation', findings: warnings,
    };
    appendReceipt(context.receiptPath, completed);
    receipts.push(queryEvent, completed);
    outputs.set(prompt.id, { ...completed, text: answer });
    process.stdout.write(`[${context.slug}] ${prompt.id} completed; note ${noteId}\n`);
  }
  return outputs;
}

export async function executeNotebook(configPath, options) {
  const context = loadExecutionContext(configPath);
  const remote = options.promptsOnly
    ? await listRemoteSources(context, options.profile)
    : await ingestNotebook(context, options);
  if (remote.size !== context.manifest.source_count) throw new Error(`Cannot run prompts before complete ingestion for ${context.slug}`);
  if (!options.uploadOnly) await executePrompts(context, remote, options);
  return { slug: context.slug, sourceCount: remote.size, promptCount: options.uploadOnly ? 0 : context.config.preparation_prompts.length };
}
