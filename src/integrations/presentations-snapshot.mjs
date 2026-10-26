import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const digest = body => createHash('sha256').update(body).digest('hex');
const safePath = key => typeof key === 'string' && /^(presentations|_astro|fonts)\//u.test(key)
  && !key.includes('\\') && !/[\u0000-\u001f]/u.test(key)
  && key.split('/').every(part => part && part !== '.' && part !== '..');

/** Install reviewed public pages; multi-GB media remains in the resources bucket. */
export async function installPresentationsSnapshot({root, outputDir}) {
  const configFile = path.join(root, 'config/presentations-release.json');
  let config;
  try { config = JSON.parse(await readFile(configFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {files:0}; throw error; }
  if (config.archive !== 'config/presentations/public-site.zip'
    || !/^[a-f0-9]{64}$/u.test(config.sha256) || !Array.isArray(config.files) || !config.files.length) {
    throw Error('Invalid presentations release configuration');
  }
  const archive = path.join(root, config.archive);
  if (digest(await readFile(archive)) !== config.sha256) throw Error('Presentations archive hash differs');
  const entries = execFileSync('unzip', ['-Z1', archive], {encoding:'utf8', maxBuffer:8*1024*1024})
    .trim().split('\n').filter(key => !key.endsWith('/'));
  if (entries.length !== new Set(entries).size || entries.some(key => !safePath(key))) throw Error('Unsafe presentations archive');
  const expected = config.files.map(file => file.path);
  if (new Set(expected).size !== expected.length || JSON.stringify([...entries].sort()) !== JSON.stringify([...expected].sort())) {
    throw Error('Presentations archive membership differs');
  }
  for (const file of config.files) {
    if (!safePath(file.path) || !/^[a-f0-9]{64}$/u.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes < 1) {
      throw Error('Invalid presentations file record');
    }
    const body = execFileSync('unzip', ['-p', archive, file.path], {maxBuffer:64*1024*1024});
    if (body.length !== file.bytes || digest(body) !== file.sha256) throw Error('Presentations file hash differs: '+file.path);
    const target = path.join(outputDir, file.path);
    try {
      await stat(target);
      if (digest(await readFile(target)) !== file.sha256) throw Error('Presentations path collides: '+file.path);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await mkdir(path.dirname(target), {recursive:true});
    await writeFile(target, body);
  }
  return {files:config.files.length};
}

export function presentationsSnapshot() {
  let root;
  return {name:'opda-presentations-snapshot', hooks:{
    'astro:config:done': ({config}) => { root = fileURLToPath(config.root); },
    'astro:build:done': async ({dir}) => {
      const result = await installPresentationsSnapshot({root, outputDir:fileURLToPath(dir)});
      console.log(`[presentations] installed ${result.files} verified public files.`);
    },
  }};
}
