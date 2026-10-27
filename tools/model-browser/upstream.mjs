import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const ROOT = process.env.OPDA_MODEL_ROOT || process.cwd();
export function resolveUpstream() {
  const pin = JSON.parse(fs.readFileSync(path.join(ROOT,'config/model-browser/upstream.json'),'utf8'));
  const archive = path.join(ROOT,pin.archive);
  if (createHash('sha256').update(fs.readFileSync(archive)).digest('hex') !== pin.sha256) throw Error('Model-browser upstream archive differs');
  const directory = path.join(ROOT,'.local/model-browser/upstream',pin.revision);
  if (!fs.existsSync(path.join(directory,'.verified'))) {
    const entries = execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
    if (entries.some(entry => (!entry.startsWith('src/website/src/') && !['src/','src/website/'].includes(entry)) || entry.split('/').includes('..') || entry.includes('\\'))) throw Error('Unsafe upstream archive');
    fs.mkdirSync(directory,{recursive:true});
    execFileSync('unzip',['-oq',archive,'-d',directory]);
    fs.writeFileSync(path.join(directory,'.verified'),pin.sha256);
  }
  // Two additive slots let this consumer supply its own corpus without loading
  // H&M's client-side RDF store. The upstream layout remains the shared owner.
  const layout=path.join(directory,'src/website/src/components/ListPageLayout.astro');
  const original=fs.readFileSync(layout,'utf8');
  const adapted=original.replace('<p class="text-sm text-gray-500">Loading...</p>','<slot name="filters" />')
    .replace('<div class="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">Loading ontology data...</div>','<slot name="results" />');
  if(!adapted.includes('<slot name="results" />'))throw Error('Upstream listing adapter no longer matches');
  if(adapted!==original)fs.writeFileSync(layout,adapted);
  const navbar=path.join(directory,'src/website/src/components/SectionNavbar.astro');
  const navSource=fs.readFileSync(navbar,'utf8');
  if(navSource.includes("document.addEventListener('DOMContentLoaded', () => {")){
    const ready=navSource.replace("document.addEventListener('DOMContentLoaded', () => {",'const initialiseSections = () => {')
      .replace('  });\n</script>',"  };\n  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseSections, {once:true});\n  else initialiseSections();\n</script>");
    fs.writeFileSync(navbar,ready);
  }
  return {pin,directory:path.join(directory,'src/website/src')};
}
