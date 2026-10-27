/** Static output qualification: every local link, script, stylesheet and fragment. */
import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';
import {ROOT} from '../tools/model-browser/upstream.mjs';
const root=path.join(ROOT,'.local/model-browser/dist');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else files.push(full);}}
walk(root);
const errors=[],cache=new Map();let checks=0;
function documentFor(file){if(!cache.has(file)){const doc=parse(fs.readFileSync(file,'utf8'));const nodes=[];function visit(node){nodes.push(node);for(const child of node.childNodes||[])visit(child);}visit(doc);cache.set(file,nodes);}return cache.get(file);}
for(const file of files.filter(file=>file.endsWith('.html'))){
  const nodes=documentFor(file);
  const page='/model-browser/'+path.relative(root,file).replace(/index\.html$/,'');
  for(const node of nodes){for(const attr of node.attrs||[]){if(!['href','src'].includes(attr.name))continue;
    const url=new URL(attr.value,'https://opda.org.uk'+page);
    if(url.origin!=='https://opda.org.uk'||!url.pathname.startsWith('/model-browser'))continue;
    const local=url.pathname.slice('/model-browser'.length).replace(/^\//,'');
    const candidates=[path.join(root,local),path.join(root,local,'index.html')];
    const target=candidates.find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
    checks++;
    if(!target){errors.push(`${path.relative(root,file)}: missing ${attr.value}`);continue;}
    if(url.hash&&target.endsWith('.html')&&!documentFor(target).some(n=>n.attrs?.some(a=>a.name==='id'&&a.value===decodeURIComponent(url.hash.slice(1)))))errors.push(`${path.relative(root,file)}: missing fragment ${attr.value}`);
  }}
}
if(errors.length){console.error(errors.slice(0,30).join('\n'));throw Error(`${errors.length} invalid model-browser links`);}
console.log(`[model-browser] ${cache.size} HTML pages; ${checks} local links and assets resolve.`);
