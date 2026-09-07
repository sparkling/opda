import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { MODELLING_CHAPTERS, MODELLING_JOURNEYS, ONTOLOGY_JUDGEMENT_CHAPTERS, getModellingChapter } from '../src/lib/modelling-navigation.ts';
import { searchEntries } from '../src/lib/site-search.mjs';
import {
  STANDARDS_PROFILE,
  STANDARDS_PROFILE_VERSION,
  standardAnchor,
  validateStandardsProfile,
} from '../src/lib/spdtf-standards-profile.mjs';
import { SEMANTIC_PACKAGE_MANIFEST } from '../src/lib/spdtf-workspace.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const sectionRoot = '/semantic-modelling';
const routes = [sectionRoot, ...MODELLING_CHAPTERS.map(({ url }) => url)];
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const sourcePath = (route) => {
  const direct = `src/pages${route}.astro`;
  return existsSync(path.join(root, direct)) ? direct : `src/pages${route}/index.astro`;
};
const textOf = (chapter = '') => read(sourcePath(chapter ? `${sectionRoot}/${chapter}` : sectionRoot));
const sourceRevision = '67174057e6384b79d0b28b7736fe70a66e112895';
const registerRoute = `${sectionRoot}/method/standards-and-decisions`;
const visualKinds = [
  'identity-map', 'evidence-timeline', 'concept-layers', 'context-mapping-bridge',
  'semantic-layers', 'role-phase', 'mapping-gates', 'candidate-loop',
  'policy-boundaries', 'scope-map',
];
const sourceContracts = {
  'from-question-to-candidate': ['ODR-0046', 'ODR-0038', 'ODR-0045', 'ODR-0060', 'ODR-0059'],
  'scope-and-package': ['ODR-0046', 'ADR-0063', 'ADR-0067'],
  'mapping-records': ['ODR-0051', 'ODR-0056', 'ODR-0058', 'ODR-0059'],
  'meaning-checks-and-delivery': ['ODR-0037', 'ODR-0043', 'ODR-0044', 'ODR-0050'],
  'sensitivity-and-policy': ['ODR-0054', 'ODR-0057'],
};

// These are source/structure contracts, not an Astro render, RDF parser or semantic audit.
// Retired flat routes and their redirects belong to the separate migration contract.
const literalExample = (source, name) => {
  const start = source.indexOf(`const ${name} = \``);
  assert.notEqual(start, -1, `missing ${name} example`);
  const contentStart = start + `const ${name} = \``.length;
  const end = source.indexOf('`;', contentStart);
  assert.notEqual(end, -1, `unterminated ${name} example`);
  assert.ok(source.includes(`<code>{${name}}</code>`), `${name} must be escaped as text, not HTML`);
  return source.slice(contentStart, end);
};

test('one registry supplies the canonical pages across four task-based journeys', () => {
  assert.deepEqual(MODELLING_JOURNEYS.map(({ url }) => url),
    ['understand', 'explore', 'contribute', 'method'].map((slug) => `${sectionRoot}/${slug}`));
  assert.ok(ONTOLOGY_JUDGEMENT_CHAPTERS.length >= 6);
  assert.equal(new Set(routes).size, routes.length);
  for (const group of MODELLING_JOURNEYS) {
    assert.ok(group.children?.length, `${group.url} has no chapters`);
    for (const chapter of [group, ...group.children]) {
      assert.ok(chapter.title && chapter.url);
      assert.equal(getModellingChapter(chapter.url)?.group.url, group.url);
    }
  }
  for (const route of routes) {
    const relative = sourcePath(route);
    assert.ok(existsSync(path.join(root, relative)), `${route} has no page`);
    const source = read(relative);
    assert.ok(source.split('\n').length < 500, `${relative} exceeds the project file limit`);
    const template = route.startsWith(`${sectionRoot}/method`) ? 'OntologyChapter' : 'ModellingLayout';
    assert.ok(source.includes(`import ${template} from '@/layouts/${template}.astro'`));
    assert.ok(source.includes(`<${template} `));
    assert.ok(source.includes(`</${template}>`));
    assert.doesNotMatch(source, /JourneyNav|<style\b|<h1\b|Astro\.redirect|http-equiv=["']refresh/iu);
    assert.doesNotMatch(source, /\bH\s*(?:&(?:amp;|#38;|#x26;)?|and)\s*M\b|Hennes|Mauritz/iu,
      `${relative} exposes source-business content`);
  }
  const layout = read('src/layouts/ModellingLayout.astro');
  for (const kind of ['method', 'example']) assert.match(layout, new RegExp(`${kind}:`, 'u'));
  assert.match(layout, /<h1>\{title\}<\/h1>/u);
  assert.match(layout, /callout callout--\$\{scopeNote.tone\}/u);
  assert.match(layout, /tone: 'method'/u);
  assert.match(layout, /class="callout__label"/u);
  assert.doesNotMatch(layout, /Learning guide|ChapterIntro/u);
  const editorial = read('src/styles/editorial-content.css');
  assert.match(editorial, /--editorial-heading-space:\s*var\(--space-7\);/u);
  assert.match(editorial, /--editorial-section-space:\s*var\(--space-6\);/u);
  assert.match(editorial, /\.prose\.editorial-content[^}]*> h2\s*\{[^}]*padding-block-start:\s*0;[^}]*border-block-start:\s*0;/su);
  assert.match(editorial, /\.prose\.editorial-content\.odr-detail h2\s*\{[^}]*border-block:\s*0;[^}]*padding-block:\s*0;/su);
  const modellingEditorial = read('src/styles/modelling/editorial.css');
  const diagrams = read('src/styles/modelling/diagrams.css');
  const learning = read('src/styles/modelling/learning.css');
  assert.match(modellingEditorial, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(18rem, 100%\), 1fr\)\);/u);
  assert.doesNotMatch(modellingEditorial, /modelling-pathways__alternatives/u);
  assert.match(diagrams, /\.modelling-visual\s*\{[^}]*max-inline-size:\s*60rem;[^}]*margin-inline:\s*0 auto;/su);
  assert.match(learning, /\.modelling-figure:has\(> \.modelling-visual\) > :is\(dl, figcaption\)\s*\{[^}]*width:\s*min\(100%, 60rem\);[^}]*margin-inline:\s*0 auto;/su);
  assert.match(learning, /details:not\(\.modelling-detail\)\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*padding:\s*0;/su);
  const methodLanding = textOf('method');
  assert.doesNotMatch(methodLanding, /ChapterEnd|hideFooter/u);
});

test('modelling judgement has a complete, visible, locally grounded teaching spine', () => {
  for (const chapter of ONTOLOGY_JUDGEMENT_CHAPTERS) {
    const source = read(sourcePath(chapter.url));
    assert.match(source, /<JudgementDiagram\b/u, `${chapter.url} needs its redesigned visual`);
    assert.doesNotMatch(source, /<details\b|<ModellingVisual\b|<EnrichmentVisual\b|<PrincipleSpread\b/u);
    const decisions = [...source.matchAll(/href="\/modelling\/odr\/(odr-\d{4})"/gu)];
    assert.ok(decisions.length, `${chapter.url} lacks a governing decision link`);
    for (const [, decision] of decisions) {
      assert.ok(readdirSync(path.join(root, 'docs/ontology/odr'))
        .some(file => file.toLowerCase().startsWith(`${decision}-`) && file.endsWith('.md')),
      `${chapter.url} links a missing local decision: ${decision}`);
    }
  }
});

test('selected concern numbers, dispositions and local adoption receipts remain inspectable', () => {
  const register = textOf('method/standards-and-decisions');
  const concerns = [...register.matchAll(/\[(\d+),\s*'(ODR-\d{4})'/gu)]
    .map(([, number, record]) => [Number(number), record]);
  assert.deepEqual(concerns, [
    [1, 'ODR-0047'], [2, 'ODR-0048'], [5, 'ODR-0049'], [7, 'ODR-0050'],
    [8, 'ODR-0051'], [9, 'ODR-0052'], [10, 'ODR-0053'], [11, 'ODR-0054'],
  ]);
  assert.ok(register.includes(sourceRevision));
  const adoptedRecords = [...register.matchAll(/\['(ODR-\d{4})',/gu)].map(([, record]) => record);
  assert.deepEqual(adoptedRecords, Array.from({ length: 29 }, (_, index) => `ODR-${String(index + 36).padStart(4, '0')}`));
  assert.match(register, /adoptedRecords\.map\(\(\[record, title\]\)/u);
  assert.ok(register.includes('href={`/modelling/odr/${record.toLowerCase()}`}'));
  assert.ok(register.includes('href="/modelling/odr/odr-0025"'), 'retain the distinct historical OPDA decision');
  assert.doesNotMatch(register, /ODR-\d{4}[a-z]?-[\w-]+\.md|source-method ODR number is not/iu);
  assert.match(register, /ODR-0059<\/a> includes a separately labelled proposed refinement/u);
  assert.match(register, /datetime="2026-09-05"/u);
  for (const anchor of ['authority', 'amendments', 'opda-adrs', 'claim-receipt']) {
    assert.ok(register.includes(`id="${anchor}"`), `register lacks stable ${anchor} receipt`);
  }
  const scope = textOf('method/scope-and-package');
  const dispositions = [...scope.matchAll(/<dt><code>([^<]+)<\/code><\/dt>/gu)].map(([, value]) => value);
  assert.deepEqual(dispositions, ['model here', 'reuse shared', 'boundary contribution', 'not applicable']);
  const excluded = [...scope.matchAll(/\((3|4|6|12|13|14)\)/gu)].map(([, value]) => Number(value));
  assert.deepEqual([...new Set(excluded)].sort((a, b) => a - b), [3, 4, 6, 12, 13, 14]);
  const outputRows = [...scope.matchAll(/<th scope="row">([^<]+)<\/th>/gu)]
    .map(([, value]) => value).filter((value) => !/^\d/u.test(value));
  assert.deepEqual(outputRows, ['Business glossary', 'Data dictionary', 'Taxonomies', 'Controlled vocabularies', 'Resources', 'Relationships']);
  for (const [chapter, records] of Object.entries(sourceContracts)) {
    const source = textOf(`method/${chapter}`);
    const receipt = source.match(/<section aria-labelledby="source-contract">([\s\S]*?)<\/section>/u)?.[1];
    assert.ok(receipt, `${chapter} lacks its source receipt`);
    assert.ok(receipt.includes(sourceRevision), `${chapter} loses its revision pin`);
    assert.ok(receipt.includes(`href="${registerRoute}"`), `${chapter} loses register/scope context`);
    for (const record of records) {
      assert.ok(receipt.includes(record), `${chapter} receipt lacks ${record}`);
      if (record.startsWith('ODR-')) assert.ok(receipt.includes(`href="/modelling/odr/${record.toLowerCase()}"`), `${chapter} lacks the local ${record} link`);
    }
    assert.match(source, /<OntologyChapter[^>]+section="reference"/u);
  }
});

test('technical examples retain distinct identities, event dates and applicability contracts', () => {
  const entities = literalExample(textOf('method/classes-and-relationships'), 'illustration');
  assert.match(entities, /ex:inspection-12-aug a model:Inspection/u);
  assert.match(entities, /model:hasSubject ex:flat-1/u);
  assert.equal([...entities.matchAll(/model:reportsInspection ex:inspection-12-aug/gu)].length, 2);
  assert.doesNotMatch(entities, /owl:sameAs|owl:equivalentClass/u);
  const provenance = textOf('method/evidence-and-time');
  for (const date of ['12 August', '14 August', '20 August', '21 August']) assert.ok(provenance.includes(date));
  assert.match(provenance, /Valid time[\s\S]*Recorded or transaction time/u);
  assert.match(provenance, /Both reports refer to the same visit/u);
  const contracts = textOf('method/meaning-checks-and-delivery');
  const applicability = literalExample(contracts, 'applicability');
  const shape = literalExample(contracts, 'shape');
  assert.match(applicability, /rdfs:domain model:Inspection/u);
  assert.match(applicability, /schema:domainIncludes model:Inspection, model:ReportVersion/u);
  assert.match(applicability, /rdfs:range xsd:string/u);
  assert.doesNotMatch(applicability, /sh:(?:minCount|maxCount|NodeShape)/u);
  const properties = [...applicability.matchAll(/model:(\w+) a owl:(?:Object|Datatype)Property ;([\s\S]*?)\./gu)];
  assert.equal(properties.length, 2);
  for (const [, name, body] of properties) {
    for (const side of ['domain', 'range']) {
      const rdfs = [...body.matchAll(new RegExp(`rdfs:${side}\\s+([^;]+)`, 'gu'))];
      const includes = [...body.matchAll(new RegExp(`schema:${side}Includes\\s+([^;]+)`, 'gu'))];
      assert.equal(Number(rdfs.length > 0) + Number(includes.length > 0), 1,
        `${name} must select one complete applicability family on its ${side} side`);
      if (rdfs.length) {
        assert.equal(rdfs.length, 1);
        assert.doesNotMatch(rdfs[0][1], /,/u, `${name} must not turn RDFS alternatives into a conjunction`);
      }
    }
  }
  assert.match(shape, /sh:NodeShape/u);
  assert.match(shape, /sh:minCount 1/u);
  assert.doesNotMatch(shape, /rdfs:domain|schema:domainIncludes/u);
  const roles = textOf('method/roles-and-phases');
  assert.ok(textOf('method/foundational-analysis').includes('https://www.loa.istc.cnr.it/old/Papers/CACM2002.pdf'));
  for (const token of ['roleOf', 'phaseOf', 'ODR-0041', 'ODR-0042']) assert.ok(roles.includes(token));
});

test('the illustrative mapping preserves the assertion and the selected qualified record', () => {
  const mappingPage = textOf('method/mapping-records');
  const mapping = literalExample(mappingPage, 'mapping');
  assert.match(mapping, /@prefix sssom: <https:\/\/w3id\.org\/sssom\/>/u);
  assert.match(mapping, /@prefix semapv: <https:\/\/w3id\.org\/semapv\/vocab\/>/u);
  assert.match(mapping, /a sssom:Mapping/u);
  for (const field of ['subject_source', 'subject_source_version', 'object_source', 'object_source_version', 'mapping_set_id', 'mapping_justification', 'mapping_date']) {
    assert.ok(mapping.includes(`sssom:${field}`), `mapping example lacks ${field}`);
  }
  assert.match(mapping, /sssom:mapping_justification semapv:ManualMappingCuration/u);
  assert.match(mapping, /sssom:mapping_date "2026-08-20"\^\^xsd:date/u);
  const reified = mapping.match(/rdf:reifies <<\(\s*([^)]*?)\s*\)>>/u)?.[1]?.replace(/\s+/gu, ' ').trim();
  assert.ok(reified, 'mapping lacks its named RDF 1.2 reification');
  assert.ok(mapping.replace(/\s+/gu, ' ').includes(`${reified} .`), 'reification must not replace the asserted SKOS triple');
  assert.doesNotMatch(mapping, /sssom:(?:author_id|subject_id|predicate_id|object_id|confidence)\b/u);
  for (const predicate of ['exactMatch', 'closeMatch', 'broadMatch', 'narrowMatch', 'relatedMatch']) {
    assert.ok(mappingPage.includes(`skos:${predicate}`));
  }
  assert.ok(mappingPage.includes(`href="${sectionRoot}/method/context-map-records"`));
  assert.ok(textOf('method/context-map-records').includes(`href="${sectionRoot}/method/mapping-records"`));
});

test('required mapping doctrine does not promote or populate the actual candidate', () => {
  const candidateRoot = path.join(root, 'source/03-standards/ontology-candidates/property-pack/0.1');
  const contextMap = JSON.parse(readFileSync(path.join(candidateRoot, 'projections/context-map.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(path.join(candidateRoot, 'candidate-manifest.json'), 'utf8'));
  const turtle = manifest.files.filter(({ path: relative }) => relative.endsWith('.ttl'))
    .map(({ path: relative }) => readFileSync(path.join(candidateRoot, relative), 'utf8')).join('\n');
  assert.deepEqual(contextMap.cross_domain_mappings, []);
  assert.equal(manifest.candidate_status, 'machine-proposed');
  assert.doesNotMatch(turtle, /\bskos:(?:broader|broaderTransitive|narrower|narrowerTransitive|related|exactMatch|closeMatch|broadMatch|narrowMatch|relatedMatch)\b/u);
  assert.doesNotMatch(turtle, /\b(?:sssom|semapv):/iu);
  const sssom = STANDARDS_PROFILE.find(({ name }) => name === 'SSSOM');
  assert.equal(sssom?.implementationStatus, 'not used');
  assert.equal(sssom?.governanceStatus, 'Normative Category 8 mapping profile; implementation remains outstanding');
  assert.match(sssom?.versionBoundary ?? '', /SSSOM 1\.0[\s\S]+SEMAPV[\s\S]+no owl:imports/iu);
});

test('shared server-rendered figures have distinct descriptions and complete text alternatives', () => {
  const component = read('src/components/modelling/ModellingVisual.astro');
  const frame = read('src/components/modelling/VisualFrame.astro');
  const descriptors = [...component.matchAll(/^\s*'([a-z-]+)': \{\s*title: '([^']+)',\s*description: '([^']+)'/gmu)];
  const renderedKinds = [...visualKinds, 'workflow-states'];
  assert.deepEqual(descriptors.map(([, kind]) => kind).sort(), renderedKinds.sort());
  assert.equal(new Set(descriptors.map(([, , title]) => title)).size, renderedKinds.length);
  for (const [, kind, title, description] of descriptors) {
    assert.ok(title.trim() && description.trim(), `${kind} lacks an authored text alternative`);
    assert.ok(component.includes(`key === '${kind}'`), `${kind} has no SVG implementation`);
  }
  assert.match(component, /<VisualFrame id=\{id\} \{\.\.\.figures\[key\]\}/u);
  assert.match(frame, /<svg\b[^>]*role="img"[^>]*aria-labelledby=/u);
  assert.match(frame, /<title id=\{id \+ '-title'\}>\{title\}<\/title>/u);
  assert.match(frame, /<desc id=\{id \+ '-desc'\}>\{description\}<\/desc>/u);
  assert.match(component, /randomUUID\(\)/u);
  assert.doesNotMatch(component, /<script\b|client:(?:load|idle|visible|only)|mermaid/iu);
  for (const route of routes) {
    const source = read(sourcePath(route));
    const figures = [...source.matchAll(/<figure\b[\s\S]*?<\/figure>/gu)].map(([block]) => block);
    for (const figure of figures) {
      assert.match(figure, /<figcaption\b[^>]*>[\s\S]+?<\/figcaption>/u, `${route} has an uncaptioned figure`);
      const alternative = figure.replace(/<figcaption\b[\s\S]*?<\/figcaption>/gu, '').replace(/<ModellingVisual\b[^>]*\/>/gu, '');
      assert.match(alternative, /<(?:p|dl|ol|ul|table|blockquote|ReferencePlate)\b/u, `${route} lacks a semantic text equivalent`);
      const visuals = [...figure.matchAll(/<ModellingVisual\b[^>]*kind="([^"]+)"[^>]*\/>/gu)];
      assert.ok(visuals.length <= 1, `${route} duplicates a visual within one figure`);
      for (const [, kind] of visuals) assert.ok(visualKinds.includes(kind), `${route} uses unknown visual ${kind}`);
    }
    const allVisuals = [...source.matchAll(/<ModellingVisual\b/gu)].length;
    assert.equal(allVisuals, figures.reduce((sum, figure) => sum + [...figure.matchAll(/<ModellingVisual\b/gu)].length, 0),
      `${route} has a visual outside its caption/text alternative`);
  }
});

test('standards records separate specification maturity, governance status and actual implementation', () => {
  assert.equal(validateStandardsProfile(), true);
  const required = ['implementationStatus', 'governanceStatus', 'specificationMaturity',
    'exactSnapshot', 'source', 'implementationEvidence', 'candidateSnapshot', 'profileSource', 'lastChecked'];
  const chapter = textOf('method/languages-and-profiles');
  assert.match(chapter, /STANDARDS_PROFILE\.map\(\(record\)/u);
  assert.match(chapter, /id=\{standardAnchor\(record\)\}/u);
  for (const field of required) assert.ok(chapter.includes(`record.${field}`), `standards register hides ${field}`);
  for (const record of STANDARDS_PROFILE) {
    for (const field of required) assert.ok(record[field], `${record.name} lacks ${field}`);
    assert.match(record.source, /^https?:\/\//u);
    assert.match(standardAnchor(record), /^standard-[a-z0-9-]+$/u);
  }
  const byName = Object.fromEntries(STANDARDS_PROFILE.map((record) => [record.name, record]));
  assert.deepEqual(
    ['RDF 1.2 Basic', 'RDF 1.2 Turtle', 'RDFS 1.2', 'OWL 2', 'XML Schema datatypes', 'SKOS', 'SHACL 1.2 Core', 'SPARQL 1.2', 'Dublin Core Terms'].map((name) => byName[name]?.implementationStatus),
    ['used and tested in Property Pack 0.1', 'used and tested in Property Pack 0.1',
      'used in Property Pack 0.1', 'used in Property Pack 0.1', 'used in Property Pack 0.1',
      'used in Property Pack 0.1', 'used and exercised in Property Pack 0.1',
      'used and ARQ-tested in Property Pack 0.1', 'used in Property Pack 0.1'],
  );
  assert.equal(byName['RDF 1.2 Basic'].specificationMaturity, 'W3C Candidate Recommendation Snapshot');
  assert.equal(byName['SHACL 1.2 Core'].specificationMaturity, 'W3C Working Draft');
  assert.equal(byName['SPARQL 1.2'].specificationMaturity, 'W3C Working Draft');
  assert.equal(byName.UFO.governanceStatus, 'Normative analytical method; not an imported ontology');
  assert.equal(byName.gUFO.implementationStatus, 'not used or imported');
  assert.equal(byName.OntoClean.governanceStatus, 'Normative analytical quality method; implementation coverage is separate');
  for (const name of ['RDFS 1.2', 'OWL 2', 'XML Schema datatypes', 'SKOS', 'SHACL 1.2 Core', 'Dublin Core Terms']) assert.equal(byName[name].mechanism, 'reuse');
  for (const name of ['RDF 1.2 Basic', 'RDF 1.2 Turtle', 'SPARQL 1.2']) assert.equal(byName[name].mechanism, 'reference');
  assert.equal(SEMANTIC_PACKAGE_MANIFEST.standardsProfileVersion, STANDARDS_PROFILE_VERSION);
});

test('the technical method adopts and explains the RDF, SPARQL and SHACL 1.2 family', () => {
  const decision = read('docs/ontology/odr/ODR-0043-owl-as-documentation-framework.md');
  const outcome = decision.match(/## Decision Outcome\n\n([\s\S]*?)\n\n### Consequences/u)?.[1] ?? '';
  for (const standard of ['RDF 1.2', 'SPARQL 1.2', 'SHACL 1.2']) {
    assert.ok(outcome.includes(standard), `ODR-0043 outcome does not adopt ${standard}`);
  }
  for (const source of [
    'https://www.w3.org/TR/rdf12-concepts/',
    'https://www.w3.org/TR/sparql12-query/',
    'https://www.w3.org/TR/shacl12-core/',
  ]) assert.ok(decision.includes(source), `ODR-0043 lacks ${source}`);
  for (const boundary of ['normative semantic standards baseline', 'exact specification snapshots', 'Positive and negative feature evidence']) {
    assert.ok(decision.replace(/\s+/gu, ' ').includes(boundary), `ODR-0043 loses the ${boundary} boundary`);
  }

  const chapter = textOf('method/languages-and-profiles');
  assert.ok(chapter.includes('id="semantic-standards-baseline"'));
  assert.ok(chapter.includes('href="/modelling/odr/odr-0043"'));
  for (const standard of ['RDF 1.2', 'SPARQL 1.2', 'SHACL 1.2']) assert.ok(chapter.includes(standard));
  assert.doesNotMatch(chapter, /rdf11-concepts|sparql11-query|www\.w3\.org\/TR\/shacl\//u);

  const method = textOf('method');
  assert.match(method, /ONTOLOGY_REFERENCE_CHAPTERS\.map/u);
  assert.match(method, /RDF 1\.2, SPARQL 1\.2 and SHACL 1\.2/u);
  const register = textOf('method/standards-and-decisions');
  const languageRule = register.match(/records: 'ODR-0043 · ODR-0044'[\s\S]*?\},/u)?.[0] ?? '';
  for (const standard of ['RDF 1.2', 'SPARQL 1.2', 'SHACL 1.2']) assert.ok(languageRule.includes(standard));

  for (const name of ['RDF 1.2 Basic', 'RDF 1.2 Turtle', 'SPARQL 1.2', 'SHACL 1.2 Core']) {
    const record = STANDARDS_PROFILE.find((item) => item.name === name);
    assert.match(record?.evidence ?? '', /ODR-0043/u, `${name} does not cite ODR-0043`);
  }
});

test('search covers the canonical registry and routes practitioner tasks to the right journey', () => {
  const results = searchEntries('ontology').map(({ url }) => url);
  for (const route of routes) assert.ok(results.includes(route), `${route} is absent from ontology search`);
  const all = searchEntries('');
  assert.equal(new Set(all.map(({ url }) => url)).size, all.length);
  const modellingResults = all.filter(({ url }) => url === sectionRoot || url.startsWith(`${sectionRoot}/`));
  assert.deepEqual(modellingResults.map(({ url }) => url).sort(), [...routes].sort());
  for (const term of ['SKOS', 'SSSOM', 'ontology mapping', 'cross-context mapping', 'OWL', 'RDF', 'RDF 1.2', 'SPARQL', 'SPARQL 1.2', 'SHACL 1.2', 'upper ontology', 'roleOf', 'phaseOf', 'ODR-0046']) {
    assert.ok(searchEntries(term).some(({ url }) => routes.includes(url)), `${term} is not discoverable`);
  }
  for (const [term, chapter] of [['bounded context', 'explore/contexts-and-connections'], ['context map', 'method/context-map-records'], ['taxonomy', 'explore/names-and-choices']]) {
    assert.ok(searchEntries(term).some(({ url }) => url === `${sectionRoot}/${chapter}`));
  }
  const contribution = textOf('contribute');
  for (const route of ['/search', '/join', '/development/working-groups/member-guide']) assert.ok(contribution.includes(`href="${route}"`));
  assert.doesNotMatch(textOf('contribute/review-a-definition'), /<form\b|fetch\(/u, 'the review exercise must not silently become a submission service');
});
