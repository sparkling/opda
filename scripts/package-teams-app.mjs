#!/usr/bin/env node
// Build the sideloadable Teams app package for the Signups bot (ADR-0088).
// The committed manifest carries a zero GUID; the real bot app id comes from the
// Teams Developer Portal registration and is substituted here, never committed.
//   OPDA_TEAMS_BOT_APP_ID=<guid> node scripts/package-teams-app.mjs
// Writes dist-preview/teams-app/opda-signups.zip (manifest.json, color.png, outline.png).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const botAppId = process.env.OPDA_TEAMS_BOT_APP_ID ?? '';
if (!GUID.test(botAppId)) {
  console.error('Set OPDA_TEAMS_BOT_APP_ID to the bot app id from the Teams Developer Portal.');
  process.exit(1);
}
const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'config/teams');
const out = resolve(root, 'dist-preview/teams-app'); // dist-preview/ is git-ignored
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const manifest = JSON.parse(readFileSync(resolve(source, 'manifest.json'), 'utf8'));
manifest.id = botAppId.toLowerCase();
manifest.bots[0].botId = botAppId.toLowerCase();
writeFileSync(resolve(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
for (const icon of ['color.png', 'outline.png']) copyFileSync(resolve(source, icon), resolve(out, icon));
execFileSync('zip', ['-q', '-j', 'opda-signups.zip', 'manifest.json', 'color.png', 'outline.png'], { cwd: out });
console.log(resolve(out, 'opda-signups.zip'));
