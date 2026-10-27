import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

/** Build the independent app; publish it with the existing immutable site release. */
export function modelBrowserSite(){
  let root;
  return {name:'opda-standalone-model-browser',hooks:{
    'astro:config:done':({config})=>{root=fileURLToPath(config.root);},
    'astro:build:done':({dir})=>{execFileSync(process.execPath,[path.join(root,'scripts/model-browser.mjs'),'--output-dir',fileURLToPath(dir)],{cwd:root,stdio:'inherit'});},
  }};
}
