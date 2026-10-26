/** Local-only ADR0095 data adapter over the pinned EA and shared AI notebook views. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {validatePublication, publicInputs, publicReadingViews, publicMedia, copyVerified, finishPublication, assertPublicText} from './property-pack-publication.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OWNERS = path.resolve(ROOT, '../hm');
const AI = path.join(OWNERS, 'semantic-ai-stratecy-business-architecture');
const ROUTE = '/development/property-pack/learning-media';
const EXT = {slide_deck:'pdf', video:'mp4', audio:'m4a', infographic:'png'};
const SETTINGS = {urlNamespace:'/presentations/platform/media/property-pack/', slides:{width:2048, quality:88, thumbnails:true, renderer:'pdfium'}, image:{width:960, quality:78}, poster:{width:960, quality:76}};
const hash = value => createHash('sha256').update(value).digest('hex');
const json = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const exists = file => fs.stat(file).then(() => true, () => false);
const same = (a,b) => JSON.stringify([...(a??[])].sort()) === JSON.stringify([...(b??[])].sort());
const safe = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(value);
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value);
async function atomic(file, body) {
  await fs.mkdir(path.dirname(file), {recursive:true});
  const pending = `${file}.${process.pid}.pending`;
  await fs.writeFile(pending, body);
  await fs.rename(pending, file);
}
const save = (file, value) => atomic(file, JSON.stringify(value, null, 2)+'\n');

export function projectInputs(snapshot) {
  if (snapshot.config?.publish !== false || !safe(snapshot.config.id) || !uuid(snapshot.notebookId)) throw Error('Invalid local commission');
  const sourceBodies = {}, sources = {}, requests = new Map();
  for (const source of snapshot.sources) {
    const fileSource = source.ingestKind==='file';
    if (!uuid(source.sourceId) || hash(source.body) !== (fileSource?source.bodySha256:source.sha256) || (fileSource?source.sha256:hash(source.uploadedBody)) !== source.uploadedSha256) throw Error('Frozen source body differs: '+source.id);
    if (sources[source.sourceId]) throw Error('Duplicate native source identity');
    sourceBodies[source.sourceId] = fileSource ? `Native original file supplied: ${source.path}. The text below is its complete indexed readback; it is not a replacement for the uploaded file. ${source.verificationLimits} ${source.readbackComparison??''}\n\n[Download supplied original](${ROUTE}/runs/${snapshot.config.id}/inputs/originals/${source.sourceId}${path.extname(source.path)})\n\n${source.body}` : source.uploadedBody;
    sources[source.sourceId] = {title:source.title, role:source.kind, bodySha256:fileSource?source.bodySha256:source.uploadedSha256,
      indexedTextSha256:source.indexedTextSha256, readbackPath:`source-readbacks/${source.sourceId}.json`,
      provenance:{locator:source.path, originalSha256:source.sha256, selection:source.verificationLimits, evidence:source.provenance}};
  }
  const sections = snapshot.config.sections;
  const topics = new Map();
  for (const section of sections) {
    if (!safe(section.id)) throw Error('Unsafe section identity');
    for (const chapter of section.chapters) {
      if (!safe(chapter.id)) throw Error('Unsafe chapter identity');
      for (const topic of chapter.topics) {
        if (!safe(topic.id) || topics.has(topic.id) || !EXT[topic.type]) throw Error('Invalid topic identity');
        topics.set(topic.id, {section:section.id, chapter:chapter.id, type:topic.type});
      }
    }
  }
  for (const request of snapshot.requests) {
    const topic = topics.get(request.topic?.id), args = request.consumedCreateArguments;
    if (!safe(request.key) || requests.has(request.key) || !topic || topic.section !== request.section || topic.chapter !== request.chapter || topic.type !== request.type) throw Error('Request outside frozen hierarchy');
    if (args.notebook_id !== snapshot.notebookId || args.focus_prompt !== request.prompt || hash(request.prompt) !== request.promptSha256 || !same(args.source_ids, request.sourceIds) || !args.source_ids.length) throw Error('Frozen request differs: '+request.key);
    for (const id of args.source_ids) {
      const selected = request.selectedSources.find(source => source.sourceId === id);
      if (!sources[id] || selected?.indexedTextSha256 !== sources[id].indexedTextSha256 || selected?.uploadedSha256 !== snapshot.sources.find(s=>s.sourceId===id).uploadedSha256) throw Error('Request source differs: '+request.key);
    }
    requests.set(request.key, {...request, subject:request.chapter,
      ...(request.type === 'infographic' ? {infographicDetail:request.settings.detail_level, take:(request.ordinal-1)%2+1} : {})});
  }
  return {variant:'full-section-v1', snapshot, sections, sourceBodies, sourceProof:{sources}, requests};
}

export function assertJobMatches(job, request, ledger, snapshot) {
  if (!request || ledger.notebookId !== snapshot.notebookId || ledger.publish !== false || ledger.manifestSha256 !== (request.inheritedFrom?.manifestSha256??snapshot.manifestSha256) ||
      job.completeInputSha256 !== request.completeInputSha256 || job.promptSha256 !== request.promptSha256 ||
      job.type !== request.type || job.format !== request.format || job.ordinal !== request.ordinal ||
      JSON.stringify(job.settings) !== JSON.stringify(request.settings)) throw Error('Ledger differs from frozen request: '+job.key);
  if (!uuid(job.id) || !job.providerProof?.settingsVerified || !same(job.sourceIds, request.sourceIds) ||
      !same(job.providerProof.sourceIds, request.sourceIds) || job.providerProof.promptSha256 !== request.promptSha256) throw Error('Provider proof differs: '+job.key);
}

export function renditionCacheKey({sha256, revision, id, type, settings=SETTINGS}) {
  return hash(JSON.stringify({sha256, revision, id, type, settings}));
}

export function matchingReview(reviews, item) {
  const review = Array.isArray(reviews) ? reviews.find(review => review.key === item.key && review.originalSha256 === item.original.sha256) : reviews[item.key];
  return review?.originalSha256 === item.original.sha256 ? review : null;
}

async function resolveRenderer() {
  const resolver = path.join(OWNERS, 'semantic-solution-architecture/src/programme/shared-renderer.py');
  return JSON.parse(execFileSync('python3', ['-c', `import importlib.util,json,sys
from pathlib import Path
spec=importlib.util.spec_from_file_location('shared_renderer',sys.argv[1])
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
print(json.dumps(m.resolve_renderer(Path(sys.argv[2]))))`, resolver, ROOT], {encoding:'utf8'}));
}

async function verifiedRecords(item, publicDir, digest) {
  const records = [item.original, item.pdfRecord, item.preview, item.poster, ...(item.slides??[]), ...(item.thumbnails??[])].filter(Boolean);
  for (const record of records) {
    const file = path.join(publicDir, record.path);
    if (!record.path.startsWith('/') || record.path.includes('..') || !await exists(file) || await digest(file) !== record.sha256) return false;
  }
  return records.length > 0;
}

async function renderMedia({input, inspection=input, publication=false, runRoot, publicDir, build, renderer}) {
  const {details, prepareRenditions, digest, videoInfo} = await import(pathToFileURL(path.join(renderer.directory, 'site/scripts/media-originals.mjs')));
  const {renderPdfSlides} = await import(pathToFileURL(path.join(renderer.directory, 'site/scripts/pdf-slide-images.mjs')));
  const {verifiedVideoKey} = await import(pathToFileURL(path.join(AI, 'scripts/notebooks/video-quality.mjs')));
  const {focusedInputViews} = await import(pathToFileURL(path.join(AI, 'scripts/notebooks/local-unified-view.mjs')));
  const stateFile = path.join(build, 'renditions.json'), state = await exists(stateFile) ? await json(stateFile) : {};
  const subjects = [], items = [], errors = [];
  for (const section of input.sections) for (const chapter of section.chapters) {
    const file = path.join(runRoot, 'docs/generation', chapter.id+'.json');
    const ownLedger = await exists(file) ? await json(file) : null;
    const requests = [...input.requests.values()].filter(request => request.chapter === chapter.id);
    const owners = new Map();
    for (const request of requests) {
      const previous = request.inheritedFrom;
      if (previous && (!safe(previous.run) || !safe(previous.chapter))) throw Error('Unsafe inherited custody');
      const origin = previous ? path.join(path.dirname(runRoot), previous.run) : runRoot;
      const ledger = previous ? await json(path.join(origin, 'docs/generation', previous.chapter+'.json')) : ownLedger;
      if (previous) {
        const frozen = await json(path.join(origin, 'request-inputs.json'));
        if (frozen.manifestSha256 !== previous.manifestSha256 || frozen.requests.find(r=>r.key===request.key)?.completeInputSha256 !== request.completeInputSha256) throw Error('Inherited request differs');
      }
      owners.set(request.key,{origin,ledger});
    }
    const jobs = requests.map(request => ({...request, status:'planned', topicId:request.topic.id, topicTitle:request.topic.title,
      ...(owners.get(request.key).ledger?.jobs.find(job => job.key === request.key)??{}), infographicDetail:request.infographicDetail, take:request.take}));
    const level = subjects.length;
    for (const job of jobs) {
      if (job.status !== 'completed') continue;
      try {
        const request = input.requests.get(job.key);
        const {origin,ledger} = owners.get(job.key);
        assertJobMatches(job, request, ledger, input.snapshot);
        const source = path.join(origin, 'originals', job.key+'.'+EXT[job.type]);
        if (!await exists(source) || !(await fs.stat(source)).size) throw Error('Original not downloaded');
        const sha256 = await digest(source);
        if (job.type === 'video') verifiedVideoKey({job, notebookId:ledger.notebookId, hash:sha256, info:videoInfo(source),
          proof:await json(path.join(origin, 'transfers/video-readiness', job.id+'.json')), originals:{}});
        const key = renditionCacheKey({sha256, revision:renderer.revision, id:job.id, type:job.type});
        const prefix = `${SETTINGS.urlNamespace}${input.snapshot.config.id}/${key}/`;
        const custody = `/custody/generation/${ledger.notebookId}/${job.id}-${sha256.slice(0,16)}.${EXT[job.type]}`;
        const destination = path.join(publicDir, prefix), original = path.join(publicDir, custody);
        let rendition = state[key];
        if (!rendition || !await verifiedRecords(rendition, publicDir, digest)) {
          await fs.mkdir(destination, {recursive:true});
          await fs.mkdir(path.dirname(original), {recursive:true});
          if (!await exists(original)) {
            await fs.copyFile(source, original+'.pending');
            if (await digest(original+'.pending') !== sha256) throw Error('Original copy changed');
            await fs.rename(original+'.pending', original);
          }
          if (await digest(original) !== sha256) throw Error('Retained original changed');
          const origin = await details(original, custody);
          if (job.type === 'slide_deck') {
            await fs.copyFile(original, path.join(destination, job.id+'.pdf'));
            const slides = await renderPdfSlides({pdf:source, destination, id:job.id, urlPrefix:prefix, ...SETTINGS.slides});
            rendition = {original:origin, prefix, slug:job.id, pdf:prefix+job.id+'.pdf', pdfRecord:await details(path.join(destination, job.id+'.pdf'), prefix+job.id+'.pdf'), slideCount:slides.slides.length, cover:slides.slides[0], ...slides};
          } else rendition = {original:origin, prefix, ...await prepareRenditions({original:source, destination, id:job.id, type:job.type,
            preview:prefix+job.id+'-preview.webp', poster:prefix+job.id+'-poster.webp'})};
          state[key] = rendition;
          await save(stateFile, state);
        }
        items.push({...rendition, id:job.id, key:job.key, type:job.type, format:job.format, settings:job.settings,
          title:job.generatedTitle??job.title??job.topicTitle, level, editorial:false, version:1,
          infographicDetail:job.infographicDetail, take:job.take, conditionId:job.topicId, conditionLabel:job.topicTitle,
          qualityStatus:'Provider and file verified; output review waived',
          notebook:`https://notebooklm.google.com/notebook/${ledger.notebookId}?artifactId=${job.id}`});
      } catch (error) { errors.push({key:job.key, error:error.message}); }
    }
    const topicInputs = chapter.topics.map(topic => {
      const selected = requests.filter(request => request.topic.id === topic.id);
      if (!selected.length) throw Error('Topic has no frozen requests: '+topic.id);
      return {topicId:topic.id, sourceIds:[...new Set(selected.flatMap(request => inspection.requests.get(request.key).sourceIds))], requests:selected.map(request=>inspection.requests.get(request.key))};
    });
    subjects.push({id:chapter.id, section:section.id, title:chapter.title, description:chapter.purpose, jobs,
      topics:chapter.topics.map(topic => ({...topic, commission:topic.description})), topicInputs,
      selectedSourceIds:[...new Set(requests.flatMap(request => inspection.requests.get(request.key).sourceIds))],
      brief:{id:chapter.id, editorialTerm:'Synthesis', readingViews:publication ? publicReadingViews(focusedInputViews(inspection, chapter, jobs),inspection,chapter) : focusedInputViews(input, chapter, jobs)}});
  }
  return {subjects, errors, items};
}

async function adapt(html, data, {baseUrl, heading, home, publicRelease=false, parse, one, all, h, renderSync, unifiedHierarchy}) {
  const tree = parse(data ? unifiedHierarchy(html, data).replaceAll(`http://127.0.0.1:8932/v/${data.variant}`, baseUrl) : html);
  // The pinned shell's GlobalSiteNav ignores its product prop. Branding remains a consumer option.
  const header = one(tree, '.index-header__inner');
  if (header) header.children = [h('nav', {class:'opda-local-header', 'aria-label':'OPDA learning media'},
    h('a', {href:home}, 'OPDA · Learning media'), h('a', {href:publicRelease?'/development/property-pack':'http://127.0.0.1:4339/development/property-pack'}, 'Property Pack guide'))];
  if (publicRelease) for (const meta of all(tree, 'meta[name="robots"]')) meta.attributes.content='index,follow';
  const nav = one(tree, '.nav-overview');
  if (nav) nav.children = [h('span', {}, heading)];
  for (const type of all(tree, '.unified-type')) if (!one(type, '.unified-topic')) {
    for (const link of all(tree, 'a')) if (link.attributes.href === '#'+type.attributes.id) link.parent.children = link.parent.children.filter(child => child !== link);
    type.parent.children = type.parent.children.filter(child => child !== type);
  }
  if (data) for (const item of [...data.catalogue.decks, ...data.catalogue.multimedia]) {
    const card = all(tree, '[id]').find(node => node.attributes.id === (item.type === 'slide_deck' ? item.slug : 'media-'+item.id));
    if (!card) throw Error('Review target missing: '+item.key);
    const reviewContainer = item.type === 'infographic' ? one(card, 'figcaption')??card : card;
    const review = item.review;
    if (review) reviewContainer.children.push(h('details', {class:'media-review'}, h('summary', {}, review.status.replaceAll('-', ' ')),
      h('p', {}, typeof review.coverage === 'string' ? review.coverage : JSON.stringify(review.coverage)),
      h('ul', {}, ...(review.findings??[]).map(finding => h('li', {}, finding)))));
    else reviewContainer.children.push(h('p', {class:'media-review'}, 'Content not reviewed; further output review was waived for this commission.'));
  }
  for (const node of all(tree, 'h1,h2,h3,h4,h5')) if (node.children?.length === 1 && node.children[0].value === 'The case for an AI-enabled H&M') node.children = [h('span', {}, heading)];
  for (const link of all(tree, 'a')) if ((link.attributes.href??'').startsWith('https://notebooklm.google.com/')) link.parent.children = link.parent.children.filter(child => child !== link);
  const style = parse('<style>.opda-local-header{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding:20px 32px;border-bottom:1px solid var(--line)}.opda-local-header a{color:var(--ink);text-underline-offset:.25em}.opda-local-header a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.collections-index .collection-image{filter:invert(1) hue-rotate(180deg);mix-blend-mode:screen}.collapsible-index main :is(h1,h2,h3,h4,h5),.collapsible-index .index-toggle{white-space:normal;overflow-wrap:break-word}.unified-topic>.authoring-actions{margin-block:16px}</style>').children[0];
  one(tree, 'head').children.push(style);
  let rendered=renderSync(tree);
  if(publicRelease) rendered=rendered.replaceAll('indexed SHA256','public text SHA256')
    .replaceAll('Exact raw inputs','Published inputs')
    .replaceAll('Full frozen request records (JSON)','Public prompts and source selections (JSON)')
    .replaceAll('Full request and provenance archive (JSON)','Public source and prompt manifest (JSON)');
  if(publicRelease) assertPublicText(rendered);
  return rendered;
}

export async function buildIndex({run='property-pack-v1', port=4340, publication=false}={}) {
  const release=publication?validatePublication(await json(path.join(ROOT,'config/notebook-publication.json'))):null;
  if(release) run=release.run;
  const route=release?.route??ROUTE;
  if (!safe(run) || !Number.isSafeInteger(port) || port < 1024 || port > 65535) throw Error('Invalid local run or port');
  const work = path.join(ROOT, '.local/property-pack-media'), runRoot = path.join(work, 'runs', run);
  const build = path.join(work, 'build'), site = path.join(work, publication?'public-release/site':'site'), publicDir = path.join(build, 'public');
  await fs.mkdir(build, {recursive:true});
  const lockFile = path.join(build, 'index.lock');
  let lock;
  for (let attempt=0; attempt<2; attempt++) {
    try { lock = await fs.open(lockFile, 'wx'); await lock.writeFile(String(process.pid)); break; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const pid = Number(await fs.readFile(lockFile, 'utf8'));
      if (!Number.isSafeInteger(pid) || pid < 1) return {busy:true};
      try { process.kill(pid, 0); return {busy:true}; }
      catch (probe) { if (probe.code !== 'ESRCH') return {busy:true}; }
      await fs.unlink(lockFile);
    }
  }
  if (!lock) return {busy:true};
  try {
    const snapshot = await json(path.join(runRoot, 'request-inputs.json'));
    if (snapshot.config.id !== run) throw Error('Run identity differs from frozen inputs');
    const input = projectInputs(snapshot), renderer = await resolveRenderer();
    const exposed=release?publicInputs(input,release):null;
    if(release) { await fs.rm(site,{recursive:true,force:true}); await fs.mkdir(site,{recursive:true}); }
    const currentFile = path.join(work,'current-run.json');
    const isCurrent = publication || !await exists(currentFile) || (await json(currentFile)).run === run;
    const {unifiedHierarchy} = await import(pathToFileURL(path.join(AI, 'scripts/notebooks/local-unified-view.mjs')));
    const {parse, h, renderSync} = await import(pathToFileURL(path.join(AI, 'site/node_modules/ultrahtml/dist/index.js')));
    const {querySelector:one, querySelectorAll:all} = await import(pathToFileURL(path.join(AI, 'site/node_modules/ultrahtml/dist/selector.js')));
    for (const source of snapshot.sources) {
      const readback = await json(path.join(runRoot, 'source-readbacks', source.sourceId+'.json'));
      if (hash(readback.content) !== source.indexedTextSha256) throw Error('Readback differs: '+source.id);
    }
    const model = await renderMedia({input, inspection:exposed?.input??input, publication, runRoot, publicDir, build, renderer});
    if(release) await publicMedia(model,publicDir,site);
    const reviewFile = await exists(path.join(runRoot, 'review.json')) ? path.join(runRoot, 'review.json') : path.join(ROOT, 'docs/notebooklm/property-pack-media/review.json');
    if (await exists(reviewFile)) {
      const reviewData = await json(reviewFile), reviews = reviewData.reviews??reviewData;
      for (const item of model.items) item.review = matchingReview(reviews, item);
    }
    const origin = release?.origin??`http://127.0.0.1:${port}`, runRoute = `${route}/runs/${run}`;
    const catalogue = {decks:model.items.filter(item => item.type === 'slide_deck').map(item => ({...item, slug:item.prefix.replace(/^\/presentations\//, '')+item.slug})), multimedia:model.items.filter(item => item.type !== 'slide_deck')};
    const data = {inspectionModel:'three-views', variant:run, sourceProof:(exposed?.input??input).sourceProof.sources, renderer,
      subjects:model.subjects, catalogue, requested:input.requests.size, available:model.items.length, errors:model.errors,
      updatedAt:new Date().toISOString(), title:snapshot.config.title, sections:input.sections, runRoute, route};
    const pin = await json(path.join(ROOT, 'config/shared-renderer.json'));
    for (const asset of pin.assets) {
      if (!asset.startsWith('fonts/') || asset.includes('..')) throw Error('Unexpected shared asset');
      const target = path.join(publicDir, asset); await fs.mkdir(path.dirname(target), {recursive:true});
      await fs.copyFile(path.join(renderer.directory, 'site/public', asset), target);
    }
    if (!await exists(path.join(build, 'node_modules'))) await fs.symlink(path.join(renderer.directory, 'site/node_modules'), path.join(build, 'node_modules'), 'dir');
    await fs.rm(path.join(build, 'src/pages'), {recursive:true, force:true});
    await save(path.join(build, 'src/data.json'), data);
    const components = path.join(renderer.directory, 'site/src/components');
    const shell = {canonicalOrigin:origin, brandTitle:'OPDA · Learning media', description:'Property Pack explanations with the exact commissioned sources and prompts.', homeHref:route+'/', notebookUrl:'#', comments:false, chat:false};
    await atomic(path.join(build, 'astro.config.mjs'), `import {defineConfig} from 'astro/config';import react from '@astrojs/react';export default defineConfig({integrations:[react()],cacheDir:'./.astro-cache',output:'static',trailingSlash:'always',devToolbar:{enabled:false},vite:{environments:{prerender:{resolve:{noExternal:['@astrojs/react']}}},resolve:{dedupe:['react','react-dom'],alias:{'@ea':${JSON.stringify(path.join(renderer.directory, 'site/src'))}}}}});`);
    await atomic(path.join(build, 'src/pages/index.astro'), `---
import Shell from ${JSON.stringify(path.join(components, 'NotebookIndexShell.astro'))};
import Directory from ${JSON.stringify(path.join(components, 'NotebookCollectionDirectory.astro'))};
import data from '../data.json';
const collections=data.sections.map(section=>{const preview=data.catalogue.multimedia.find(item=>item.type==='infographic'&&data.subjects[item.level].section===section.id);return {id:section.id,title:section.title,path:data.route+'/'+section.id+'/',question:section.question,summary:section.purpose,perspective:section.audience,image:preview?{src:preview.preview.path,alt:'Preview of '+preview.title}:undefined,description:[{heading:'Related subjects',items:section.relatedSubjects}],chapters:section.chapters.map((chapter,index)=>({title:chapter.title,href:data.route+'/'+section.id+'/#system-'+index}))}});
---
<Shell {...${JSON.stringify(shell)}} localOnly={${!publication}} bodyClass="notebook-index collections-index" path={data.route+'/'} title="OPDA · Property Pack learning media"><Directory collections={collections} heading="Property Pack learning media" eyebrow="${publication?'NotebookLM explanations':'Local review · NotebookLM explanations'}" intro="Explore how property information becomes a connected model, and how its meaning and readiness are reviewed." navigationLabel="Property Pack media sections"><div slot="before-collections"><p>Generated explanations support learning. The documented candidate and its recorded decisions remain the source of authority.</p></div><p><a href={data.runRoute+'/'}>Open the versioned run and its frozen inputs</a></p><details><summary>${publication?'Release status':'Local run status'}</summary><p>{data.available} of {data.requested} commissioned artefacts are available for review. Updated {data.updatedAt}.</p><p>Further output review was waived for this commission. Pending delivery is labelled in each topic.</p></details></Directory></Shell>`);
    for (const section of input.sections) {
      const sectionData = {...data, subjects:data.subjects.filter(subject => subject.section === section.id), section};
      const levels = new Map(sectionData.subjects.map((subject, index) => [subject.id, index]));
      sectionData.catalogue = Object.fromEntries(Object.entries(catalogue).map(([type, items]) => [type, items.filter(item => levels.has(data.subjects[item.level].id)).map(item => ({...item, level:levels.get(data.subjects[item.level].id)}))]));
      await save(path.join(build, 'src', section.id+'.json'), sectionData);
      await atomic(path.join(build, 'src/pages', section.id+'.astro'), `---
import Collection from ${JSON.stringify(path.join(components, 'NotebookSubjectCollection.astro'))};
import data from ${JSON.stringify('../'+section.id+'.json')};
---
<Collection levels={data.subjects.map(s=>[s.title])} descriptions={data.subjects.map(s=>s.description)} subjectIds={data.subjects.map(s=>s.id)} briefs={data.subjects.map(s=>s.brief)} editorials={[]} catalogue={data.catalogue} multimedia={data.catalogue.multimedia} prefix="/presentations/" configured localOnly={${!publication}} label="Chapter" heading={data.section.title} title={data.section.title+' · OPDA'} eyebrow="Property Pack · ${publication?'Learning media':'Local learning media'}" intro={data.section.purpose} path={data.route+'/'+data.section.id+'/'} shell={${JSON.stringify({...shell, bodyClass:'notebook-index collapsible-index unified-index'})}}><div slot="intro"><p><a href={data.route+'/'}>All learning media</a> · <a href={data.runRoute+'/'+data.section.id+'/'}>Versioned run</a></p><p>These generated explanations describe a draft Property Pack candidate. The Property Pack guide retains the documented model and decisions.</p><p>Open a chapter, then a topic. Its three input readers show the exact commission and selected source bodies.</p><details><summary>Availability and review</summary><p>{data.available} of {data.requested} commissioned artefacts are available${publication?'':' locally'}. Updated {data.updatedAt}. Further output review was waived for this commission.</p>{data.errors.length>0&&<ul>{data.errors.map(error=><li>{error.key}: awaiting verified local delivery.</li>)}</ul>}</details></div></Collection>`);
    }
    execFileSync(path.join(build, 'node_modules/.bin/astro'), ['build', '--root', build], {cwd:ROOT, stdio:'pipe', maxBuffer:8*1024*1024});
    // Install immutable asset paths and exact inputs before replacing any visible HTML.
    await fs.mkdir(site, {recursive:true});
    for (const folder of (publication?['_astro','fonts']:['_astro','fonts','presentations','custody'])) if (await exists(path.join(build, 'dist', folder))) await fs.cp(path.join(build, 'dist', folder), path.join(site, folder), {recursive:true,force:false});
    const runSite = path.join(site, runRoute);
    if(exposed) {
      await save(path.join(runSite,'inputs/request-inputs.json'),exposed.manifest);
      for(const source of exposed.sourceFiles) {
        await atomic(path.join(runSite,'inputs/sources',source.id+'.txt'),source.body);
        if(source.originalPath) {
          const s=source.source,retained=path.join(runRoot,'source-originals',s.id+'-'+s.sha256.slice(0,12)+path.extname(s.path).toLowerCase());
          await copyVerified(retained,path.join(site,source.originalPath),source.originalSha256);
        }
      }
    } else {
    await save(path.join(runSite, 'inputs/request-inputs.json'), snapshot);
    for (const source of snapshot.sources) await atomic(path.join(runSite, 'inputs/sources', source.sourceId+'.txt'), source.uploadedBody);
    for (const source of snapshot.sources) await atomic(path.join(runSite, 'inputs/source-readbacks', source.sourceId+'.json'), await fs.readFile(path.join(runRoot, 'source-readbacks', source.sourceId+'.json')));
    for (const source of snapshot.sources) if (source.ingestKind==='file') {
      const retained=path.join(runRoot,'source-originals',source.id+'-'+source.sha256.slice(0,12)+path.extname(source.path).toLowerCase());
      const original=await fs.readFile(await exists(retained)?retained:path.join(ROOT,source.path));
      if (hash(original)!==source.sha256) throw Error('Supplied original bytes changed');
      await atomic(path.join(runSite,'inputs/originals',source.sourceId+path.extname(source.path)),original);
    }
    }
    const options = {baseUrl:origin+runRoute, home:route+'/', publicRelease:publication, parse, one, all, h, renderSync, unifiedHierarchy};
    const directory = await adapt(await fs.readFile(path.join(build, 'dist/index.html'), 'utf8'), null, {...options, heading:'Property Pack learning media'});
    for (const base of [...(isCurrent?[path.join(site, route)]:[]), runSite]) await atomic(path.join(base, 'index.html'), base === runSite ? input.sections.reduce((html,section)=>html.replaceAll(route+'/'+section.id+'/',runRoute+'/'+section.id+'/'),directory) : directory);
    for (const section of input.sections) {
      const sectionData = await json(path.join(build, 'src', section.id+'.json'));
      const html = await adapt(await fs.readFile(path.join(build, 'dist', section.id, 'index.html'), 'utf8'), sectionData, {...options, heading:section.title});
      if (isCurrent) await atomic(path.join(site, route, section.id, 'index.html'), html);
      await atomic(path.join(runSite, section.id, 'index.html'), html);
    }
    if(!publication) await save(path.join(runSite, 'release.json'), {...data, catalogue:undefined, frozenInputSha256:hash(await fs.readFile(path.join(runRoot, 'request-inputs.json')))});
    await save(path.join(runSite, 'version.json'), {id:run, title:data.title, available:data.available, requested:data.requested, manifestSha256:snapshot.manifestSha256, renderer:publication?{revision:renderer.revision}:renderer, updatedAt:data.updatedAt, publish:publication});
    const result={available:data.available, requested:data.requested, errors:data.errors, directory:site, url:origin+route+'/'};
    if(release) result.publication=await finishPublication(site,release,result);
    return result;
  } finally { await lock.close(); await fs.unlink(lockFile); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), options = {};
  while (args.length) {
    const flag = args.shift();
    if(flag==='--public') { options.publication=true; continue; }
    const value = args.shift();
    if (flag === '--run') options.run = value;
    else if (flag === '--port') options.port = Number(value);
    else throw Error('Usage: property-pack-index.mjs [--run property-pack-v1] [--port 4340]');
  }
  const install = async options => {
    let result;
    do {
      result = await buildIndex(options);
      if (result.busy) await new Promise(resolve => setTimeout(resolve, 2000));
    } while (result.busy);
    console.log(JSON.stringify(result));
  };
  // A final delivery must not exit behind another run's older index snapshot.
  await install(options);
  // An inherited job can complete after its successor's own queue has finished.
  // Every delivery refresh therefore also advances the current aggregate view.
  const currentFile = path.join(ROOT, '.local/property-pack-media/current-run.json');
  if (!options.publication && await exists(currentFile)) {
    const {run} = await json(currentFile);
    if (run !== (options.run ?? 'property-pack-v1')) await install({...options, run});
  }
}
