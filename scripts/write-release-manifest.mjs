#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LANES = new Set(['editorial', 'application', 'ontology', 'infrastructure']);

export function createReleaseManifest({ commit, lane, builtAt, runId, runAttempt }) {
  if (!/^[0-9a-f]{40}$/u.test(commit ?? '')) throw new Error('sourceCommit must be a 40-character Git commit');
  if (!LANES.has(lane)) throw new Error('validation lane is not recognised');
  const timestamp = builtAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error('builtAt must be an ISO timestamp');
  return {
    schemaVersion: 1,
    sourceCommit: commit,
    validationLane: lane,
    builtAt: timestamp,
    githubRunId: String(runId ?? ''),
    githubRunAttempt: String(runAttempt ?? ''),
  };
}

export async function writeReleaseManifest(directory, manifest) {
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'release.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve(process.cwd(), process.argv[2] || 'dist');
  const manifest = createReleaseManifest({
    commit: process.env.SOURCE_COMMIT,
    lane: process.env.VALIDATION_LANE,
    builtAt: process.env.BUILD_TIMESTAMP,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
  });
  await writeReleaseManifest(directory, manifest);
  console.log(`[release] wrote ${directory}/release.json for ${manifest.sourceCommit} (${manifest.validationLane})`);
}
