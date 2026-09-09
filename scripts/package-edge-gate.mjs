import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Copy one authorization implementation into the immutable edge package.
// No credentials, generated settings, dependency install or provider SDK bundle.
const root = new URL('../', import.meta.url), output = new URL('_build/edge-gate/', root);
await mkdir(output, { recursive: true });
for (const [name, folder] of [['index.mjs', 'edge-gate'], ['identity.mjs', 'auth-session'],
  ['session.mjs', 'auth-session'], ['store.mjs', 'auth-session']]) {
  const source = new URL(`config/aws/${folder}/${name}`, root), target = new URL(name, output);
  await copyFile(source, target);
  if (!(await readFile(source)).equals(await readFile(target))) throw new Error(`Edge package mismatch: ${name}`);
}
console.log(`Packaged shared approval gate: ${fileURLToPath(output)}`);
