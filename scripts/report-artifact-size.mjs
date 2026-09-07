#!/usr/bin/env node
import { readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}

export async function inspectArtifact(directory, maximumBytes) {
  const files = await walk(directory);
  const sizes = await Promise.all(files.map((file) => stat(file)));
  const totalBytes = sizes.reduce((sum, item) => sum + item.size, 0);
  return {
    schemaVersion: 1,
    totalBytes,
    totalMegabytes: Number((totalBytes / 1048576).toFixed(1)),
    maximumBytes,
    maximumMegabytes: Number((maximumBytes / 1048576).toFixed(1)),
    fileCount: files.length,
    withinBudget: totalBytes <= maximumBytes,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve(process.cwd(), process.argv[2] || 'dist');
  const maximumMb = Number(process.env.MAX_ARTIFACT_MB || 500);
  if (!Number.isFinite(maximumMb) || maximumMb <= 0) throw new Error('MAX_ARTIFACT_MB must be positive');
  const report = await inspectArtifact(directory, Math.floor(maximumMb * 1048576));
  await writeFile(resolve(directory, 'artifact-size-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`[artifact] ${report.totalMegabytes} MB across ${report.fileCount} files (budget ${report.maximumMegabytes} MB)`);
  if (!report.withinBudget) process.exitCode = 1;
}
