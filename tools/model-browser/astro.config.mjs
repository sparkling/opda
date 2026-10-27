import {defineConfig} from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import {ROOT,resolveUpstream} from './upstream.mjs';
const upstream=resolveUpstream();
const app=path.join(ROOT,'tools/model-browser');
export default defineConfig({
  site:'https://opda.org.uk',base:'/model-browser',output:'static',trailingSlash:'never',
  outDir:path.join(ROOT,'.local/model-browser/dist'),
  publicDir:path.join(ROOT,'.local/model-browser/public'),
  cacheDir:path.join(ROOT,'.local/model-browser/cache'),
  devToolbar:{enabled:false},server:{host:'127.0.0.1',port:4342},
  vite:{
    plugins:[tailwindcss(),{
      name:'opda-semantic-app-adapter',enforce:'pre',
      resolveId(id,importer) {
        if (!importer?.startsWith(upstream.directory)) return;
        const replacements={'../layouts/Base.astro':'Base.astro','./ArtalkComments.astro':'Empty.astro','./ContextLabel.astro':'ContextLabel.astro'};
        if(replacements[id]) return path.join(app,'src/components',replacements[id]);
      },
      transform(code,id) {
        if (!id.startsWith(upstream.directory) || !id.endsWith('.astro')) return;
        // Source navigation is application-relative; canonical RDF identifiers are untouched.
        if(id.endsWith('/Breadcrumb.astro')) code=code.replace('href="/"','href="/model-browser"');
        return {code,map:null};
      },
    }],
    resolve:{alias:{'@semantic-app':upstream.directory,'@':path.join(ROOT,'src')}},
    optimizeDeps:{include:['mermaid','@mermaid-js/layout-elk']},
    server:{fs:{allow:[ROOT]}},
  },
});
