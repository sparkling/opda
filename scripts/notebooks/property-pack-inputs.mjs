/** Resolve the commissioned ADR0095 inputs through the existing OPDA source owner. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readYaml, sha256} from '../lib/notebooklm-preparation.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CONFIG = 'docs/notebooklm/property-pack-media/catalogue.json';
const bodyRoot = 'docs/notebooklm/property-pack-media';
const candidate = 'source/03-standards/ontology-candidates/property-pack/0.1';
export async function resolveInputs(catalogue = CONFIG) {
  if (!catalogue.startsWith(bodyRoot+'/') || !catalogue.endsWith('.json') || catalogue.includes('..')) throw Error('Catalogue outside authoring boundary');
  const bytes = await fs.readFile(path.join(ROOT, catalogue));
  const config = JSON.parse(bytes);
  if (config.schema !== 'opda.notebook-media.v1' || !/^[a-z0-9][a-z0-9-]*$/.test(config.id) || config.publish !== false) throw Error('Unknown commission');
  const portfolio = await readYaml('docs/notebooklm/property-pack-ontology.yaml');
  if (portfolio.notebook.id !== config.predecessorNotebookId) throw Error('Portfolio identity changed');
  const approvedOriginals = new Map();
  const manifests = path.join(ROOT,'docs/notebooklm/prepared/manifests');
  for (const name of await fs.readdir(manifests)) if (name.endsWith('.json')) {
    const manifest = JSON.parse(await fs.readFile(path.join(manifests,name),'utf8'));
    for (const source of manifest.sources??[]) if (source.rights_and_data_classification==='public-and-authorised-for-notebooklm') approvedOriginals.set(source.original_path_or_url,{...source,manifest:'docs/notebooklm/prepared/manifests/'+name});
  }
  const sources = [];
  for (const source of config.sources) {
    const authorised = approvedOriginals.get(source.path);
    let selectedPublicOriginal = false;
    if (source.authorisationEvidence==='docs/notebooklm/programme-policy-history.yaml#repository-public-source-authorisation') {
      const authority = await readYaml('docs/notebooklm/programme-policy-history.yaml');
      selectedPublicOriginal = authority.dependencies.some(d=>d.id==='repository-public-source-authorisation'&&d.status==='approved') && source.path.startsWith('source/') && !/\.(eml|msg)$/i.test(source.path);
    }
    if ((!authorised && !selectedPublicOriginal && ![bodyRoot, candidate, 'docs/adr', 'docs/ontology/odr', 'docs/research', 'docs/notebooklm/prepared'].some(p => source.path.startsWith(p + '/'))) || source.path.includes('..') || path.isAbsolute(source.path)) throw Error('Source path outside allowlist: '+source.path);
    const raw = await fs.readFile(path.join(ROOT, source.path));
    if (authorised && source.path.startsWith('source/') && sha256(raw)!==authorised.original_sha256) throw Error('Authorised original bytes changed: '+source.path);
    const ingestKind = /\.(pdf|docx|pptx|epub)$/i.test(source.path) ? 'file' : 'text';
    const body = ingestKind==='file' ? '' : raw.toString('utf8');
    const provenance = await Promise.all(source.provenance.map(async p => ({path:p, sha256:sha256(await fs.readFile(path.join(ROOT,p)))})));
    sources.push({...source, body, sha256:sha256(raw), ingestKind, bytes:raw.length, ...(authorised?{authorisation:{manifest:authorised.manifest,sourceId:authorised.source_id,classification:authorised.rights_and_data_classification,originalSha256:authorised.original_sha256}}:{}), provenance});
  }
  const ids = new Set(sources.map(s => s.id));
  const requests = config.sections.flatMap(section => section.chapters.flatMap(chapter => chapter.topics.flatMap(topic => {
    if (!topic.sourceKeys.length || topic.sourceKeys.some(k => !ids.has(k))) throw Error('Missing topic sources');
    if (/standalone presentation|independent reading|self-contained deck|without a presenter/i.test(topic.prompt)) throw Error('Uncommissioned reading-mode demand');
    return config.formats[topic.type].map((format, ordinal) => ({key:`${topic.id}-${format.id}`, section:section.id, chapter:chapter.id, chapterTitle:chapter.title, topic, type:topic.type, format:format.format, ordinal:ordinal+1, settings:{artifact_type:topic.type, language:'en-GB', ...format.settings}, prompt:topic.prompt, promptSha256:sha256(topic.prompt), acceptance:format.acceptance === true}));
  })));
  if (new Set(requests.map(r=>r.key)).size !== requests.length || requests.length !== (config.requested??13)) throw Error('Finite commission changed');
  return {schema:'opda.notebook-resolved-inputs.v1', catalogue, config, manifestSha256:sha256(bytes), sources, requests};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await resolveInputs(process.argv[2]??CONFIG)));
