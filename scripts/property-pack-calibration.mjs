#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  CONFIG_PATH, ROOT, SCHEMA_PATH, canonicalBytes, compareCandidates, loadInputs,
  makeWorkOrders, parseClaudeEnvelope, promptFor, readJson, scoreCandidate, sha256, writeStable,
} from './_lib/property-pack-calibration.mjs';

function argsOf(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    if (!rest[index].startsWith('--') || rest[index + 1] == null) throw new Error(`invalid argument: ${rest[index]}`);
    options[rest[index].slice(2)] = rest[index + 1];
  }
  return { command, options };
}

function runRoot(runId) {
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(runId || '')) throw new Error('invalid --run-id');
  return resolve(ROOT, 'outputs/property-pack-calibration', runId);
}

function orderMap(config, catalogue) {
  return new Map(makeWorkOrders(config, catalogue).map((order) => [order.workOrderId.split(':').at(-1), order]));
}

function selectedOrders(orders, caseId) {
  if (caseId === 'all') return [...orders.values()];
  const order = orders.get(caseId);
  if (!order) throw new Error(`unknown --case: ${caseId}`);
  return [order];
}

function prepare(config, catalogue, root) {
  const orders = makeWorkOrders(config, catalogue);
  for (const order of orders) writeStable(join(root, 'orders', `${order.workOrderId.split(':').at(-1)}.json`), order, true);
  writeStable(join(root, 'experiment.json'), {
    schemaVersion: '1.0',
    experimentId: config.experimentId,
    configDigest: sha256(readFileSync(CONFIG_PATH)),
    candidateSchemaDigest: sha256(readFileSync(SCHEMA_PATH)),
    catalogueDigest: config.catalogue.sha256,
    workOrders: orders.map((order) => ({ id: order.workOrderId, digest: order.workOrderDigest })),
    status: 'prepared',
  }, true);
  process.stdout.write(`prepared ${orders.length} work orders at ${root}\n`);
}

function modelPrompt(order) {
  return `${promptFor(order)}\nThe workOrderId in your response must be exactly ${JSON.stringify(order.workOrderId)}.`;
}

function invokeCodex(route, order, schemaPath, temp) {
  const output = join(temp, 'candidate.json');
  const args = ['exec', '--ephemeral', '--ignore-user-config', '--ignore-rules', '--skip-git-repo-check',
    '-s', 'read-only', '-C', temp, '-m', route.model, '--output-schema', schemaPath,
    '--output-last-message', output, '-'];
  const result = spawnSync(route.cli, args, { input: modelPrompt(order), encoding: 'utf8', maxBuffer: 20_000_000 });
  if (result.status !== 0) throw new Error(`Codex failed (${result.status}): ${result.stderr || result.stdout}`);
  return { candidate: readJson(output), raw: readFileSync(output), stdout: result.stdout, stderr: result.stderr };
}

function invokeClaude(route, order, schemaPath, temp) {
  const schema = readFileSync(schemaPath, 'utf8');
  const args = ['-p', '--safe-mode', '--tools', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--no-session-persistence', '--model', route.model, '--output-format', 'json', '--json-schema', schema];
  const result = spawnSync(route.cli, args, { cwd: temp, input: modelPrompt(order), encoding: 'utf8', maxBuffer: 20_000_000 });
  if (result.status !== 0) throw new Error(`Claude failed (${result.status}): ${result.stderr || result.stdout}`);
  const parsed = parseClaudeEnvelope(result.stdout);
  return {
    candidate: parsed.candidate,
    raw: Buffer.from(canonicalBytes(parsed.candidate)),
    stdout: result.stdout,
    stderr: result.stderr,
    wrapper: { model: parsed.actualModel, envelope: parsed.envelope },
  };
}

function invoke(config, catalogue, root, slot, caseId) {
  const route = config.routes[slot];
  if (!route) throw new Error(`unknown --slot: ${slot}`);
  const orders = selectedOrders(orderMap(config, catalogue), caseId);
  for (const order of orders) {
    const temp = mkdtempSync(join(tmpdir(), 'opda-property-pack-calibration-'));
    const startedAt = new Date().toISOString();
    try {
      const result = route.provider === 'openai'
        ? invokeCodex(route, order, SCHEMA_PATH, temp)
        : invokeClaude(route, order, SCHEMA_PATH, temp);
      const caseName = order.workOrderId.split(':').at(-1);
      const candidatePath = join(root, 'candidates', slot, `${caseName}.json`);
      writeStable(candidatePath, result.candidate);
      const actualModel = result.wrapper?.model || null;
      writeStable(join(root, 'receipts', slot, `${caseName}.json`), {
        schemaVersion: '1.0',
        workOrderId: order.workOrderId,
        workOrderDigest: order.workOrderDigest,
        route,
        actual: {
          model: actualModel,
          identityStatus: actualModel === route.model ? 'verified' : 'requested-only',
        },
        promptDigest: sha256(modelPrompt(order)),
        outputSchemaDigest: sha256(readFileSync(SCHEMA_PATH)),
        rawResponseDigest: sha256(result.raw),
        candidateDigest: sha256(canonicalBytes(result.candidate)),
        startedAt,
        completedAt: new Date().toISOString(),
        exitStatus: 'success',
      });
      process.stdout.write(`invoked ${slot} for ${caseName}\n`);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  }
}

function score(config, catalogue, root) {
  const orders = orderMap(config, catalogue);
  for (const [caseName, order] of orders) {
    for (const slot of Object.keys(config.routes)) {
      const candidate = readJson(join(root, 'candidates', slot, `${caseName}.json`));
      const receipt = readJson(join(root, 'receipts', slot, `${caseName}.json`));
      const result = scoreCandidate(candidate, order, config);
      if (receipt.actual.identityStatus !== 'verified') {
        result.eligible = false;
        result.identityStatus = receipt.actual.identityStatus;
      }
      writeStable(join(root, 'scores', slot, `${caseName}.json`), result);
    }
  }
  process.stdout.write(`scored ${orders.size * Object.keys(config.routes).length} candidates\n`);
}

function report(config, catalogue, root) {
  const orders = orderMap(config, catalogue);
  const cases = [];
  for (const [caseName, order] of orders) {
    const candidates = {};
    for (const slot of Object.keys(config.routes)) {
      candidates[slot] = {
        candidate: readJson(join(root, 'candidates', slot, `${caseName}.json`)),
        score: readJson(join(root, 'scores', slot, `${caseName}.json`)),
      };
    }
    cases.push(compareCandidates(candidates.gpt, candidates.claude, order));
  }
  const result = {
    schemaVersion: '1.0',
    experimentId: config.experimentId,
    status: cases.every((entry) => entry.status === 'dual-candidate') ? 'complete' : 'incomplete',
    qualification: 'informational-only-unless-route-identities-and-semantic-validation-pass',
    cases,
  };
  writeStable(join(root, 'report.json'), result);
  process.stdout.write(`${result.status} calibration report at ${join(root, 'report.json')}\n`);
}

function main() {
  const { command, options } = argsOf(process.argv.slice(2));
  const { config, catalogue } = loadInputs();
  const root = runRoot(options['run-id']);
  if (command === 'prepare') prepare(config, catalogue, root);
  else if (command === 'invoke') invoke(config, catalogue, root, options.slot, options.case || 'all');
  else if (command === 'score') score(config, catalogue, root);
  else if (command === 'report') report(config, catalogue, root);
  else throw new Error('usage: property-pack-calibration.mjs prepare|invoke|score|report --run-id ID');
}

try { main(); } catch (error) { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; }
