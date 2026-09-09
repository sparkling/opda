import { copyFile, mkdir, readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
for (const [folder, names] of [['comments-api', ['index.mjs', 'artalk.mjs']],
  ['auth-session', ['identity.mjs', 'session.mjs', 'store.mjs']]]) {
  const output = new URL(`_build/comments/${folder}/`, root);
  await mkdir(output, { recursive: true });
  for (const name of names) {
    const source = new URL(`config/aws/${folder}/${name}`, root), target = new URL(name, output);
    await copyFile(source, target);
    if (!(await readFile(source)).equals(await readFile(target))) throw new Error('Comments package mismatch: ' + name);
  }
}
console.log('Packaged comments gateway and shared approval reader.');
