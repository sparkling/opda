import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {installPresentationsSnapshot} from '../src/integrations/presentations-snapshot.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'opda-presentations-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  for (const folder of ['config/presentations','stage/presentations']) await mkdir(path.join(root, folder), {recursive:true});
  const body = '<h1>Public presentations</h1>', key = 'presentations/index.html';
  await writeFile(path.join(root, 'stage', key), body);
  const archive = 'config/presentations/public-site.zip';
  execFileSync('zip', ['-q', path.join(root, archive), key], {cwd:path.join(root, 'stage')});
  const config = {archive, sha256:sha(await readFile(path.join(root, archive))), files:[{path:key, sha256:sha(body), bytes:Buffer.byteLength(body)}]};
  const save = () => writeFile(path.join(root, 'config/presentations-release.json'), JSON.stringify(config));
  await save();
  return {root, config, save, outputDir:path.join(root, 'dist')};
}

test('public snapshot installs exact reviewed files and permits unchanged reruns', async t => {
  const value = await fixture(t);
  assert.deepEqual(await installPresentationsSnapshot(value), {files:1});
  assert.match(await readFile(path.join(value.outputDir,'presentations/index.html'),'utf8'), /Public presentations/);
  assert.deepEqual(await installPresentationsSnapshot(value), {files:1});
});

test('changed archive, unlisted files and collisions fail publication', async t => {
  const value = await fixture(t);
  value.config.sha256 = '0'.repeat(64); await value.save();
  await assert.rejects(installPresentationsSnapshot(value), /archive hash/);
  value.config.sha256 = sha(await readFile(path.join(value.root,value.config.archive)));
  value.config.files[0].path = '../index.html'; await value.save();
  await assert.rejects(installPresentationsSnapshot(value), /membership/);
  value.config.files[0].path = 'presentations/index.html'; await value.save();
  await mkdir(path.join(value.outputDir,'presentations'),{recursive:true});
  await writeFile(path.join(value.outputDir,'presentations/index.html'),'Existing different page');
  await assert.rejects(installPresentationsSnapshot(value), /collides/);
});

test('public media stays in the resources origin and survives archive sync', async () => {
  const site = await readFile(new URL('../config/aws/site-stack.yaml',import.meta.url),'utf8');
  const behavior = site.split("PathPattern: '/presentations/platform/*'")[1].split('- PathPattern:')[0];
  assert.match(behavior, /TargetOriginId: resources-s3/);
  assert.doesNotMatch(behavior, /FunctionAssociations/);
  const publisher = await readFile(new URL('../scripts/publish-resources.sh',import.meta.url),'utf8');
  assert.match(publisher, /--exclude "presentations\/\*"/);
  assert.doesNotMatch(publisher, /--delete-excluded/);
});
