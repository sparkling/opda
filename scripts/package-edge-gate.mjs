import { copyFile, mkdir, readFile, rename, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const esbuildPath = process.env.EDGE_ESBUILD_PATH
  ?? fileURLToPath(new URL('../node_modules/esbuild/lib/main.js', import.meta.url));
const { build } = await import(pathToFileURL(esbuildPath));

// Bundle the narrow DynamoDB client with the authorization implementation. Relying
// on the runtime SDK made its first dynamic import consume the viewer-request
// timeout on cold London edge containers.
const root = new URL('../', import.meta.url), output = new URL('_build/edge-gate/', root);
await mkdir(output, { recursive: true });
for (const [name, folder] of [['identity.mjs', 'auth-session'], ['session.mjs', 'auth-session'],
  ['store.mjs', 'auth-session']]) {
  const source = new URL(`config/aws/${folder}/${name}`, root), target = new URL(name, output);
  await copyFile(source, target);
  if (!(await readFile(source)).equals(await readFile(target))) throw new Error(`Edge package mismatch: ${name}`);
}
const entry = new URL('_entry.mjs', output), bundled = new URL('_index.mjs', output);
await copyFile(new URL('config/aws/edge-gate/index.mjs', root), entry);
await build({
  entryPoints: [fileURLToPath(entry)],
  outfile: fileURLToPath(bundled),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  minify: true,
  legalComments: 'none',
  nodePaths: process.env.EDGE_NODE_PATH ? [process.env.EDGE_NODE_PATH] : [],
});
await rename(bundled, new URL('index.mjs', output));
await unlink(entry);
console.log(`Packaged shared approval gate: ${fileURLToPath(output)}`);
