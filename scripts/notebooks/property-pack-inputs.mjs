/** Resolve the commissioned ADR0095 inputs through the existing OPDA source owner. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readYaml, sha256} from '../lib/notebooklm-preparation.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONFIG = 'docs/notebooklm/property-pack-media/catalogue.json';
const bodyRoot = 'docs/notebooklm/property-pack-media';
const candidate = 'source/03-standards/ontology-candidates/property-pack/0.1';
export async function resolveInputs() {
  const bytes = await fs.readFile(path.join(ROOT, CONFIG));
  const config = JSON.parse(bytes);
  if (config.schema !== 'opda.notebook-media.v1' || config.id !== 'property-pack-v1' || config.publish !== false) throw Error('Unknown commission');
  const portfolio = await readYaml('docs/notebooklm/property-pack-ontology.yaml');
  if (portfolio.notebook.id !== config.predecessorNotebookId) throw Error('Portfolio identity changed');
  const sources = [];
  for (const source of config.sources) {
    if (![bodyRoot, candidate].some(p => source.path.startsWith(p + '/')) || source.path.includes('..')) throw Error('Source path outside allowlist');
    const body = await fs.readFile(path.join(ROOT, source.path), 'utf8');
    const provenance = await Promise.all(source.provenance.map(async p => ({path:p, sha256:sha256(await fs.readFile(path.join(ROOT,p)))})));
    sources.push({...source, body, sha256:sha256(body), provenance});
  }
  const ids = new Set(sources.map(s => s.id));
  const requests = config.sections.flatMap(section => section.chapters.flatMap(chapter => chapter.topics.flatMap(topic => {
    if (!topic.sourceKeys.length || topic.sourceKeys.some(k => !ids.has(k))) throw Error('Missing topic sources');
    if (/standalone presentation|independent reading|self-contained deck|without a presenter/i.test(topic.prompt)) throw Error('Uncommissioned reading-mode demand');
    return config.formats[topic.type].map((format, ordinal) => ({key:`${topic.id}-${format.id}`, section:section.id, chapter:chapter.id, chapterTitle:chapter.title, topic, type:topic.type, format:format.format, ordinal:ordinal+1, settings:{artifact_type:topic.type, language:'en-GB', ...format.settings}, prompt:topic.prompt, promptSha256:sha256(topic.prompt), acceptance:format.acceptance === true}));
  })));
  if (new Set(requests.map(r=>r.key)).size !== requests.length || requests.length !== 13) throw Error('Finite commission changed');
  return {schema:'opda.notebook-resolved-inputs.v1', config, manifestSha256:sha256(bytes), sources, requests};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await resolveInputs()));
