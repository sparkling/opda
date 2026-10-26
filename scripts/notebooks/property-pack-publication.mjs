/** Explicit public projection; frozen provider custody remains private and unchanged. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=value=>createHash('sha256').update(value).digest('hex');
const safe=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9-]*$/.test(value);
const forbidden=/(?:https?:\/\/(?:localhost|127\.0\.0\.1)|\/Users\/|\.local\/|notebooklm\.google\.com|(?:lh\d\.)?googleusercontent\.com|source-readbacks\/|\/custody\/generation\/)/i;
export function validatePublication(config) {
  if(config.schema!=='opda.notebook-publication.v1'||!safe(config.id)||!safe(config.run)||config.origin!=='https://opda.org.uk'||config.route!=='/presentations'||config.expectedArtefacts!==286||!config.authorisation) throw Error('Unrecognised public release authority');
  return config;
}
export function assertPublicText(body) {
  if(forbidden.test(body)) throw Error('Private transport or host reference in public output');
}
export function publicInputs(input,release) {
  validatePublication(release);
  const aliases=new Map(input.snapshot.sources.map(s=>[s.sourceId,s.id]));
  const sources={},sourceBodies={},sourceFiles=[];
  for(const source of input.snapshot.sources) {
    if(!safe(source.id)) throw Error('Unsafe public source identity');
    const native=source.ingestKind==='file';
    const originalPath=native?`/presentations/platform/media/property-pack/sources/${source.id}-${source.sha256.slice(0,16)}${path.extname(source.path).toLowerCase()}`:undefined;
    const body=native?`The complete original was supplied for this topic. [Read or download the supplied original](${release.origin}${originalPath}).\n\nOriginal SHA256: ${source.sha256}. The original retains its tables and images. This reader links to the supplied file; it does not reproduce an extracted text version.`:source.uploadedBody;
    assertPublicText(body);
    sourceBodies[source.id]=body;
    sources[source.id]={title:source.title,role:source.kind,bodySha256:sha(body),originalSha256:source.sha256,
      representation:native?'unchanged-native-original':'exact-supplied-text',originalPath,
      provenance:{evidence:source.provenance.map(p=>({reference:path.basename(p.path),sha256:p.sha256}))}};
    sourceFiles.push({id:source.id,body,originalPath,originalSha256:source.sha256,source});
  }
  const requests=new Map([...input.requests].map(([key,r])=>{
    const {notebook_id,source_ids,...args}=r.consumedCreateArguments;
    const sourceIds=r.sourceIds.map(id=>aliases.get(id));
    if(sourceIds.some(id=>!id)) throw Error('Unselected public source');
    return [key,{key:r.key,subject:r.subject,section:r.section,chapter:r.chapter,topic:r.topic,type:r.type,format:r.format,
      ordinal:r.ordinal,settings:r.settings,prompt:r.prompt,promptSha256:r.promptSha256,infographicDetail:r.infographicDetail,take:r.take,
      sourceIds,consumedCreateArguments:{...args,source_ids:sourceIds}}];
  }));
  const projection={...input,sourceBodies,sourceProof:{sources},requests};
  const manifest={schema:'opda.public-media-inputs.v1',release:release.id,run:release.run,sourcePolicy:release.sourcePolicy,
    sources:Object.entries(sources).map(([id,s])=>({id,...s,text:`inputs/sources/${id}.txt`})),
    requests:[...requests.values()].map(({consumedCreateArguments,...r})=>r)};
  assertPublicText(JSON.stringify(manifest));
  return {input:projection,manifest,sourceFiles};
}
export function publicReadingViews(views,input,chapter) {
  const requests=[...input.requests.values()].filter(r=>r.chapter===chapter.id);
  return views.map(view=>{
    if(!view.id.endsWith('data')) return {...view,text:view.text.replace('The selected writings below and the exact Prompt are the complete written inputs.','The selected text bodies and linked unchanged native originals below, together with the exact Prompt, identify the complete supplied inputs.')};
    const topic=chapter.topics.find(t=>view.id===`topic-${t.id}-data`);
    const selected=topic?requests.filter(r=>r.topic.id===topic.id):requests;
    const ids=[...new Set(selected.flatMap(r=>r.sourceIds))];
    return {...view,text:'# Data sources\n\nPublic source keys identify the supplied texts and unchanged native files. Provenance references describe the evidence used to author the readings; a reference alone was not an additional uploaded source.\n\n'+ids.map(id=>{
      const s=input.sourceProof.sources[id];
      return `## ${s.title}\n\nSource key: ${id}\n\nRepresentation: ${s.representation}.\n\nSupplied original SHA256: ${s.originalSha256}.\n\nPublic text SHA256: ${s.bodySha256}.\n\n`+(s.provenance.evidence.length?'Provenance references:\n\n'+s.provenance.evidence.map(p=>'- '+p.reference+' — '+p.sha256).join('\n'):'');
    }).join('\n\n')};
  });
}
export async function copyVerified(source,target,digest) {
  await fs.mkdir(path.dirname(target),{recursive:true});
  const data=await fs.readFile(source);
  if(sha(data)!==digest) throw Error('Public original differs from verified custody');
  await fs.writeFile(target,data);
}
export async function publicMedia(model,publicDir,site) {
  for(const item of model.items) {
    const original=item.original,extension=path.extname(original.path);
    const publicPath=item.prefix+item.key+'-original'+extension;
    await copyVerified(path.join(publicDir,original.path),path.join(site,publicPath),original.sha256);
    item.original={...original,path:publicPath};delete item.notebook;
    const records=[item.pdfRecord,item.preview,item.poster,...(item.slides??[]),...(item.thumbnails??[])].filter(Boolean);
    for(const record of records) await copyVerified(path.join(publicDir,record.path),path.join(site,record.path),record.sha256);
  }
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.m4a':'audio/mp4','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
async function listFiles(root,prefix='') {
  const rows=[];
  for(const entry of await fs.readdir(path.join(root,prefix),{withFileTypes:true})) {
    const name=path.posix.join(prefix,entry.name);
    if(entry.isDirectory()) rows.push(...await listFiles(root,name));
    else if(entry.isFile()) rows.push(name);
    else throw Error('Unexpected release filesystem entry');
  }
  return rows.sort();
}
export async function finishPublication(site,release,summary) {
  if(summary.available!==release.expectedArtefacts||summary.errors.length) throw Error('Public release requires all commissioned artefacts to be delivered');
  const rows=[];
  for(const name of await listFiles(site)) {
    if(!/^(presentations|_astro|fonts)\//.test(name)||name.includes('..')) throw Error('Unexpected public path: '+name);
    const body=await fs.readFile(path.join(site,name)),ext=path.extname(name);
    if(['.html','.txt','.json','.css'].includes(ext)) assertPublicText(body.toString());
    rows.push({path:name,bytes:body.length,sha256:sha(body),contentType:mime[ext]??'application/octet-stream',delivery:name.startsWith('presentations/platform/')?'resources':'site'});
  }
  const manifest={schema:'opda.public-media-release.v1',id:release.id,origin:release.origin,route:release.route,available:summary.available,requested:summary.requested,createdAt:new Date().toISOString(),files:rows};
  await fs.writeFile(path.join(path.dirname(site),'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  const web=rows.filter(f=>f.delivery==='site');
  const archive='config/presentations/public-site.zip',archivePath=path.join(ROOT,archive);
  await fs.mkdir(path.dirname(archivePath),{recursive:true});await fs.rm(archivePath,{force:true});
  execFileSync('zip',['-q',archivePath,'-@'],{cwd:site,input:web.map(f=>f.path).join('\n')+'\n'});
  await fs.writeFile(path.join(ROOT,'config/presentations-release.json'),JSON.stringify({archive,sha256:sha(await fs.readFile(archivePath)),files:web.map(({delivery,contentType,...f})=>f)})+'\n');
  return {manifest:path.join(path.dirname(site),'manifest.json'),archive,files:rows.length,webFiles:web.length,webBytes:web.reduce((n,f)=>n+f.bytes,0),resourceBytes:rows.filter(f=>f.delivery==='resources').reduce((n,f)=>n+f.bytes,0)};
}
