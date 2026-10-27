import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {ROOT,resolveUpstream} from '../tools/model-browser/upstream.mjs';

export async function prepareModelBrowser() {
  resolveUpstream();
  const {corpora,manifest}=await import('../tools/model-browser/model.mjs');
  const publicDir=path.join(ROOT,'.local/model-browser/public');
  const save=async(file,body)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,body);};
  for(const corpus of Object.values(corpora)) {
    const output=path.join(publicDir,corpus.id==='schema'?'schema':'','exports/model.json');
    await save(output,JSON.stringify({corpus:corpus.id,title:corpus.title,entries:corpus.entries.map(({raw,...entry})=>entry)},null,2)+'\n');
  }
  const source=path.join(ROOT,'source/03-standards/ontology-candidates/property-pack/0.1');
  const target=path.join(publicDir,'exports/property-pack');
  for(const file of [...manifest.files,{path:'candidate-manifest.json'}]) {
    if(!/^[a-z0-9/.-]+$/i.test(file.path)||file.path.split('/').includes('..'))throw Error('Unsafe candidate path');
    const body=await fs.readFile(path.join(source,file.path));
    if(file.sha256&&createHash('sha256').update(body).digest('hex')!==file.sha256)throw Error('Candidate file differs: '+file.path);
    await save(path.join(target,file.path),body);
  }
  await fs.copyFile(path.join(ROOT,'src/data/ontology-model.json'),path.join(publicDir,'exports/schema-ontology-model.json'));
  await fs.rm(path.join(publicDir,'exports/property-pack.zip'),{force:true});
  execFileSync('zip',['-qr',path.join(publicDir,'exports/property-pack.zip'),'.'],{cwd:target});
  return {publicDir};
}
export async function buildModelBrowser({outputDir}={}) {
  await prepareModelBrowser();
  const app=path.join(ROOT,'tools/model-browser');
  execFileSync(process.execPath,[path.join(ROOT,'node_modules/astro/bin/astro.mjs'),'build','--root',app],{cwd:ROOT,stdio:'inherit',env:{...process.env,OPDA_MODEL_ROOT:ROOT}});
  execFileSync(process.execPath,[path.join(ROOT,'scripts/check-model-browser.mjs')],{cwd:ROOT,stdio:'inherit'});
  const dist=path.join(ROOT,'.local/model-browser/dist');
  if(outputDir)await fs.cp(dist,path.join(outputDir,'model-browser'),{recursive:true,errorOnExist:true,force:false});
  return dist;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  if(process.argv.includes('--dev')){
    await prepareModelBrowser();
    execFileSync(process.execPath,[path.join(ROOT,'node_modules/astro/bin/astro.mjs'),'dev','--root',path.join(ROOT,'tools/model-browser')],{cwd:ROOT,stdio:'inherit',env:{...process.env,OPDA_MODEL_ROOT:ROOT}});
  }else {
    const index=process.argv.indexOf('--output-dir');
    await buildModelBrowser({outputDir:index<0?undefined:process.argv[index+1]});
  }
}
