#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { WORKING_GROUPS } from '../src/agents/working-group-inbox/domain.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONFIG_DIR = path.join(ROOT, 'config/agents/working-group-inbox');
const MANIFEST_PATH = path.join(CONFIG_DIR, 'manifest.json');
const PROMPT_PATH = path.join(CONFIG_DIR, 'automation-prompt.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function check() {
  const manifest = readJson(MANIFEST_PATH);
  const prompt = fs.readFileSync(PROMPT_PATH, 'utf8');
  const errors = [];
  if (manifest.schema !== 1) errors.push('manifest schema must be 1');
  if (manifest.template !== 'vertical:support') errors.push('support template is required');
  if (manifest.host !== 'codex') errors.push('Codex host is required');
  if (manifest.model?.id !== 'gpt-5.6-sol' || manifest.model?.reasoningEffort !== 'high') {
    errors.push('the frozen model must be gpt-5.6-sol with high reasoning');
  }
  for (const role of ['triager', 'resolver', 'executor', 'responder', 'auditor']) {
    if (!manifest.roles?.some((candidate) => candidate.id === role)) errors.push(`missing role: ${role}`);
  }
  for (const gate of ['content-firewall', 'requester-authority', 'deterministic-plan-validation', 'live-postcondition-readback']) {
    if (!manifest.gates?.includes(gate)) errors.push(`missing gate: ${gate}`);
  }
  for (const phrase of ['Microsoft Graph', 'Ruflo', 'untrusted', 'idempotent']) {
    if (!prompt.includes(phrase)) errors.push(`prompt is missing: ${phrase}`);
  }
  for (const group of WORKING_GROUPS.filter(({ workspace }) => workspace.status === 'implemented')) {
    for (const extension of ['html', 'txt']) {
      const templatePath = path.join(ROOT, `${group.workspace.template}.${extension}`);
      if (!fs.existsSync(templatePath)) errors.push(`missing invitation template: ${templatePath}`);
    }
    if (!group.workspace.teamId || !group.workspace.siteUrl || !group.workspace.indexGroup) {
      errors.push(`incomplete workspace registry: ${group.id}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    ok: true,
    groups: WORKING_GROUPS.length,
    implementedWorkspaces: WORKING_GROUPS.filter(({ workspace }) => workspace.status === 'implemented').length,
    roles: manifest.roles.length,
    gates: manifest.gates.length,
  };
}

function listGroups() {
  return WORKING_GROUPS.map(({ id, name, workspace }) => ({ id, name, status: workspace.status }));
}

const command = process.argv[2] ?? 'check';
if (command === 'check') console.log(JSON.stringify(check(), null, 2));
else if (command === 'list-groups') console.log(JSON.stringify(listGroups(), null, 2));
else throw new Error(`Unknown command: ${command}`);
