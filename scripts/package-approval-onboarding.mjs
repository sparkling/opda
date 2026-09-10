import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const BUNDLE_FILES = Object.freeze([
  ...['index', 'worker', 'store', 'settings', 'graph', 'sharepoint', 'microsoft-auth',
    'postmark', 'receipt-protection', 'invitation', 'domain-templates', 'withdrawal-notice', 'notice-worker'].map(name => [
    `src/approval-onboarding/${name}.mjs`, `src/approval-onboarding/${name}.mjs`,
  ]),
  ...['workspace-entry', 'workspace-store', 'workspace-flow'].map(name => [
    `src/approval-onboarding/${name}.mjs`, `src/approval-onboarding/${name}.mjs`,
  ]),
  ...['identity', 'session', 'store'].map(name => [
    `config/aws/auth-session/${name}.mjs`, `config/aws/auth-session/${name}.mjs`,
  ]),
  ['src/agents/working-group-inbox/domain.mjs', 'src/agents/working-group-inbox/domain.mjs'],
  ['docs/templates/assets/opda-email-logo.png', 'src/approval-onboarding/opda-email-logo.png'],
]);

async function filesWithin(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Onboarding bundle cannot contain links');
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await filesWithin(resolve(directory, entry.name), `${relative}/`));
    else result.push(relative);
  }
  return result;
}

/** Dependency-free, fixed allowlist. Never package the repository, secrets or local galleries. */
export async function packageOnboarding({ root = ROOT, output = resolve(root, 'config/aws/onboarding-bundle') } = {}) {
  await mkdir(output, { recursive: true });
  if ((await lstat(output)).isSymbolicLink()) throw new Error('Onboarding bundle cannot be a link');
  const allowed = new Set(BUNDLE_FILES.map(([, target]) => target));
  if ((await filesWithin(output)).some(path => !allowed.has(path))) throw new Error('Unexpected file in onboarding bundle; inspect it before packaging');
  for (const [source, target] of BUNDLE_FILES) {
    const from = resolve(root, source), to = resolve(output, target);
    const stat = await lstat(from);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 350000) throw new Error('Invalid onboarding source asset');
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
  }
  return [...allowed].sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await packageOnboarding();
  console.log(`[onboarding] Packaged ${BUNDLE_FILES.length} allowlisted runtime files locally; nothing uploaded`);
}
