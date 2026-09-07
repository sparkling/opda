/** Local-only, self-contained Diagram Design review artefact from built HTML.
 * Run after make build. It is deliberately outside public/ and page routes.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const examples = [
  ['connected-views', 'understand/shared-meaning'],
  ['vocabulary-representations', 'method/vocabularies-and-classification'],
  ['constraint-trace', 'method/meaning-checks-and-delivery'],
  ['mapping-review', 'method/mapping-records'],
  ['privacy-scope', 'method/sensitivity-and-policy'],
];
const diagrams = examples.map(([kind, route]) => {
  const page = readFileSync(resolve(root, 'dist/semantic-modelling', route, 'index.html'), 'utf8');
  const svg = [...page.matchAll(/<svg\b[\s\S]*?<\/svg>/gu)].map(([match]) => match)
    .find((match) => match.includes(`enrichment-${kind}-`));
  if (!svg) throw new Error(`Missing built diagram: ${kind}`);
  const prefix = svg.match(/id="([^"]+)-title"/u)?.[1];
  if (!prefix) throw new Error(`Missing accessible title: ${kind}`);
  return `<section><h2>${svg.match(/<title[^>]*>(.*?)<\/title>/u)[1]}</h2>`
    + ['light', 'dark'].map((mode) => `<div class="preview" data-theme="${mode}"><p>${mode}</p>`
      + svg.replaceAll(prefix, `${kind}-${mode}`) + '</div>').join('\n') + '</section>';
});
const css = readFileSync(resolve(root, 'src/styles/modelling/diagrams.css'), 'utf8');
// Uses the installed skill's minimal editorial wrapper and the saved OPDA skin.
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>OPDA modelling enrichment — diagram review</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&amp;family=Roboto+Mono:wght@400;500&amp;display=swap">
<style>
${css}
:root { --font-sans: 'Source Sans 3', 'Avenir Next', sans-serif; --font-mono: 'Roboto Mono', monospace; }
* { box-sizing: border-box; }
body { margin: 0; padding: 2rem; background: #f9f9f9; color: #2c273b; font: 1rem/1.6 var(--font-sans); }
main { max-width: 960px; margin-inline: 0 auto; }
h1, h2 { line-height: 1.2; } section { margin-block: 3rem; }
.preview { margin-block: 1rem; padding: 1rem; } .preview p { margin: 0 0 1rem; text-transform: uppercase; }
.preview[data-theme='dark'] { background: #131224; color: #f9f9f9; }
</style></head><body><main>
<p>Diagram Design · saved OPDA profile · doc-inline 960 × 600 · balanced detail</p>
<h1>Modelling enrichment: connected distinctions</h1>
<p>The first figure is for mixed audiences; the remaining figures support ontology modellers. Relationship graphs, a three-way comparison and a validation-result trace—not illustrations of a running application.</p>
${diagrams.join('\n')}
<footer><p>Fictional teaching examples, not candidate implementation evidence. Complete explanations remain adjacent to each diagram on the site. Local review only; this file is not published.</p></footer>
</main></body></html>`;
mkdirSync(resolve(root, 'docs/working'), { recursive: true });
const output = resolve(root, 'docs/working/modelling-enrichment-diagrams-20260907.html');
writeFileSync(output, html);
console.log(output);
