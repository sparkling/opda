import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { searchEntries } from '../src/lib/site-search.mjs';
import {
  STANDARDS_PROFILE,
  STANDARDS_PROFILE_VERSION,
  standardAnchor,
  validateStandardsProfile,
} from '../src/lib/spdtf-standards-profile.mjs';
import { SEMANTIC_PACKAGE_MANIFEST } from '../src/lib/spdtf-workspace.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ontologyDir = path.join(root, 'src/pages/semantic-modelling');
const page = (name) => path.join(ontologyDir, `${name}.astro`);
const pages = [
  'index', 'why-ontologies', 'benefits', 'taking-part', 'reading-the-model', 'questions',
  'modelling-method', 'principles', 'coverage', 'bounded-contexts', 'context-maps',
  'identity-roles-and-phases', 'modelling-patterns', 'modelling-rules',
  'linked-data-languages', 'semantic-package', 'evidence-and-mappings',
  'validation', 'standards', 'decision-basis',
];

const textOf = (name) => readFileSync(page(name), 'utf8');
const diagramBlocks = (source) => [...source.matchAll(/<Diagram\b[\s\S]*?<\/Diagram>/gu)].map(([block]) => block);

test('semantic modelling has complete teaching and implementation routes without a duplicate journey widget', () => {
  for (const name of pages) {
    assert.equal(existsSync(page(name)), true, `${name} route is missing`);
    const source = textOf(name);
    assert.ok(source.split('\n').length < 500, `${name} exceeds the project file limit`);
    assert.doesNotMatch(source, /JourneyNav/u, `${name} repeats the section navigation in page content`);
  }

  const required = {
    'why-ontologies': ['What an ontology is', 'A document tree and a meaning graph', 'What an ontology cannot establish'],
    benefits: ['Keep the distinctions that professions need', 'Make evidence easier to follow and challenge', 'Benefits have to be earned'],
    'taking-part': ['Start with something you know', 'Ask practical questions', 'Make feedback easy to act on'],
    questions: ['Do I need to understand ontologies', 'replace their systems', 'one shared database', 'accurate information', 'experts disagree'],
    'reading-the-model': ['Identifiers and resources', 'Classes, properties and values', 'Shapes and provenance', 'Follow one Property Pack construct'],
    'modelling-method': ['Authority of this method', 'Competency questions', 'Evidence-up modelling cycle'],
    principles: ['Our modelling manifesto', 'Let meaning have an accountable home', 'Separate meaning, checks and delivery'],
    'semantic-package': ['Six distinct outputs', 'One concept across all six outputs', 'Synchronisation and ownership'],
    'bounded-contexts': ['Semantic home', 'small common boundary', 'Property Pack'],
    'context-maps': ['Map the relationship before mapping the terms', 'Choose an explicit collaboration pattern', 'Then choose the term-level bridge'],
    'identity-roles-and-phases': ['Four questions that prevent a confused hierarchy', 'Rigidity, dependence and unity'],
    'modelling-patterns': ['Separate a thing from descriptions of it', 'Distinguish parts, members and specialisations', 'Keep event time, validity and recording time separate'],
    'modelling-rules': ['Identity before attributes', 'Class, value or relationship', 'Upper-ontology lenses'],
    'linked-data-languages': ['RDF: one shared foundation', 'RDFS and OWL', 'SKOS', 'SHACL', 'SPARQL', 'Compose deliberately'],
    coverage: ['Four lenses and eleven workshop themes', 'Eight formal ontology concerns', 'Four allowed dispositions'],
    standards: ['What is implemented now', 'Specification maturity', 'Detailed standards register'],
    'evidence-and-mappings': ['Competency questions', 'Five qualified mapping meanings', 'Category 8: cross-context mappings', 'SKOS states the correspondence; SSSOM records its basis', 'Evidence receipt'],
    validation: ['Open-world meaning and closed-world checks', 'What automated checks can establish', 'Governance promotion'],
    'decision-basis': ['A required method and an implemented model are different facts', 'Supporting source ODRs', 'A concrete correction: domain and range'],
  };
  for (const [name, headings] of Object.entries(required)) {
    const source = textOf(name);
    for (const heading of headings) assert.match(source, new RegExp(heading, 'iu'), `${name} lacks ${heading}`);
  }
  assert.match(textOf('modelling-method'), /Untrusted evidence and isolated work orders/iu);
  assert.match(textOf('modelling-method'), /content digest[\s\S]+source span[\s\S]+taint/iu);
  assert.doesNotMatch(textOf('modelling-method'), /record accepted for this draft, needs evidence/iu);
  assert.match(textOf('semantic-package'), /does not yet[\s\S]+source, semantic owner, candidate version and derivation/iu);
  assert.match(textOf('validation'), /does not yet publish a complete machine-readable[\s\S]+feature/iu);
});

test('selected source ODR concerns are normative without promoting the candidate or importing excluded scope', () => {
  const basis = textOf('decision-basis');
  const coverage = textOf('coverage');
  for (const [number, suffix, anchor] of [
    [1, 'a', 'domain-structure'], [2, 'b', 'vocabulary-taxonomy'],
    [5, 'e', 'classification-metadata'], [7, 'g', 'validation-constraints'],
    [8, 'h', 'cross-domain-mappings'], [9, 'i', 'provenance-quality'],
    [10, 'j', 'temporal-history'], [11, 'k', 'access-sensitivity'],
  ]) {
    assert.match(basis, new RegExp(`ODR-0071${suffix}`, 'u'));
    assert.match(coverage, new RegExp(`<h2 id="${anchor}">${number}\\.`, 'u'));
  }
  assert.match(basis, /eight normative concerns/iu);
  assert.match(basis, /Categories 3[\s\S]+4 \(service architecture\)[\s\S]+6 \(governance[\s\S]+12 \(capability[\s\S]+13 \(source mapping\)[\s\S]+14 \(data products\)[\s\S]+outside/iu);
  assert.match(basis, /source-method ODR numbers and OPDA ODR numbers are separate registers/iu);
  assert.match(basis, /normative method does not turn a generated candidate into an[\s\S]+approved standard/iu);
  assert.match(basis, /repeated domains imply membership in all declared classes/iu);
  assert.match(basis, /schema:domainIncludes[\s\S]+schema:rangeIncludes[\s\S]+alternative intended uses/iu);
  assert.match(textOf('modelling-rules'), /ODR-0118 explicitly prohibits[\s\S]+subclassing domain classes under external upper-ontology classes/iu);
});

test('participation routes require practitioner knowledge rather than ontology training', () => {
  const source = textOf('taking-part');
  assert.match(source, /do not need to learn ontology engineering/iu);
  assert.match(source, /Facilitators handle the formal representation/iu);
  for (const route of ['/search', '/join', '/development/working-groups/member-guide']) {
    assert.ok(source.includes(`href="${route}"`), `participation guide lacks ${route}`);
  }
  assert.match(source, /generated resource pages[\s\S]+diagrams[\s\S]+dictionaries/iu);
  for (const anchor of ['privacy', 'accuracy', 'ai', 'disagreement', 'available']) {
    assert.ok(textOf('questions').includes(`id="${anchor}"`));
  }
});

test('Category 8 separates context architecture, SKOS assertions and normative SSSOM evidence from emitted data', () => {
  const source = textOf('evidence-and-mappings');
  assert.match(source, /id="cross-context-mappings"/u);
  assert.match(source, /context-map arrow[\s\S]+not[\s\S]+mapping assertion/iu);
  assert.match(source, /machines?[\s\S]+suggest[\s\S]+must not[\s\S]+assert/iu);
  assert.match(source, /skos:exactMatch[\s\S]+transitive/iu);
  assert.match(source, /SKOS, SSSOM and SEMAPV form the required mapping method/iu);
  assert.match(source, /applies to internal cross-context mappings/iu);
  assert.match(source, /ODR-0087 profile uses SSSOM 1\.0/iu);
  for (const field of ['subject_source', 'subject_source_version', 'object_source', 'object_source_version', 'mapping_set_id', 'mapping_justification', 'mapping_date']) {
    assert.ok(source.includes(`sssom:${field}`), `mapping profile lacks ${field}`);
  }
  assert.match(source, /subject_id[\s\S]+predicate_id[\s\S]+object_id[\s\S]+model slots[\s\S]+not invented RDF predicates/iu);
  assert.match(source, /rdf:reifies[\s\S]+RDF 1\.2 triple term/iu);
  assert.match(source, /Reifying a statement does not assert it[\s\S]+exact retained SKOS triple exists/iu);
  assert.match(source, /excludes[\s\S]+sssom:author_id[\s\S]+does[\s\S]+not remove[\s\S]+recorded human decision/iu);
  assert.match(source, /SKOS directly on class IRIs[\s\S]+without[\s\S]+additional explicit[\s\S]+rdf:type skos:Concept/iu);
  assert.match(source, /does not[\s\S]+skos:exactMatch[\s\S]+owl:equivalentClass/iu);
  assert.match(source, /exactMatch[\s\S]+subproperty[\s\S]+closeMatch/iu);
  assert.match(source, /exactMatch[\s\S]+disjoint[\s\S]+broadMatch[\s\S]+relatedMatch[\s\S]+narrowMatch/iu);
  assert.match(source, /closeMatch[\s\S]+not transitive/iu);
  assert.match(source, /narrowMatch[\s\S]+inverse of[\s\S]+broadMatch/iu);
  assert.match(source, /relatedMatch[\s\S]+symmetric associative/iu);
  assert.match(source, /href="\/semantic-modelling\/decision-basis"/u);
  assert.match(source, /href="\/modelling\/odr\/odr-0002"/u);
  assert.match(source, /href="\/semantic-modelling\/standards#standard-sssom"/u);
  assert.match(source, /no reviewed cross-domain mapping assertions are present/iu);
  assert.match(source, /not a deferral of the governing method/iu);

  const candidateRoot = path.join(root, 'source/03-standards/ontology-candidates/property-pack/0.1');
  const contextMap = JSON.parse(readFileSync(path.join(candidateRoot, 'projections/context-map.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(path.join(candidateRoot, 'candidate-manifest.json'), 'utf8'));
  const turtle = manifest.files
    .filter(({ path: relative }) => relative.endsWith('.ttl'))
    .map(({ path: relative }) => readFileSync(path.join(candidateRoot, relative), 'utf8'))
    .join('\n');
  assert.deepEqual(contextMap.cross_domain_mappings, []);
  assert.equal(manifest.candidate_status, 'machine-proposed');
  assert.doesNotMatch(turtle, /\bskos:(?:broader|broaderTransitive|narrower|narrowerTransitive|related|exactMatch|closeMatch|broadMatch|narrowMatch|relatedMatch)\b/u);
  assert.doesNotMatch(turtle, /\b(?:sssom|semapv):/iu);

  const sssom = STANDARDS_PROFILE.find(({ name }) => name === 'SSSOM');
  assert.equal(sssom?.implementationStatus, 'not used');
  assert.equal(sssom?.governanceStatus, 'Normative Category 8 mapping profile; implementation remains outstanding');
  assert.match(sssom?.versionBoundary ?? '', /SSSOM 1\.0[\s\S]+SEMAPV[\s\S]+no owl:imports/iu);

  const canonicalLink = /href="\/semantic-modelling\/evidence-and-mappings#cross-context-mappings"/u;
  const linkedPages = [
    'src/pages/semantic-modelling/bounded-contexts.astro',
    'src/pages/semantic-modelling/modelling-method.astro',
    'src/pages/semantic-modelling/modelling-rules.astro',
    'src/pages/semantic-modelling/coverage.astro',
    'src/pages/semantic-modelling/standards.astro',
    'src/pages/semantic-modelling/reading-the-model.astro',
    'src/pages/semantic-modelling/semantic-package.astro',
    'src/pages/semantic-modelling/why-ontologies.astro',
    'src/pages/development/property-pack/contexts/index.astro',
    'src/pages/development/property-pack/contexts/[context].astro',
    'src/pages/development/property-pack/index.astro',
    'src/pages/development/property-pack/relationships.astro',
    'src/pages/development/property-pack/definition-and-scope.astro',
    'src/pages/development/property-pack/pdtf-schema-lineage.astro',
    'src/pages/development/working-groups/member-guide/model-review-and-decisions.astro',
    'src/pages/governance/data-stewardship.astro',
    'src/pages/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/concept-taxonomy.astro',
    'src/pages/development/inputs/pdtf-schema/schema-derived-ontology/lineage-provenance-and-verification/historical-modelling/jsonld-mappings.astro',
  ];
  for (const relative of linkedPages) {
    const pageSource = readFileSync(path.join(root, relative), 'utf8');
    assert.match(pageSource, canonicalLink, `${relative} does not link the canonical Category 8 guidance`);
  }
});

test('Mermaid teaching diagrams are captioned, accessible and kept within the diagram-design complexity budget', () => {
  const blocks = pages.flatMap((name) => diagramBlocks(textOf(name)).map((block) => ({ name, block })));
  assert.ok(blocks.length >= 10, `expected at least ten teaching diagrams, found ${blocks.length}`);
  const titles = [];
  for (const { name, block } of blocks) {
    assert.match(block, /caption=(?:"[^"]{20,}"|'[^']{20,}')/u, `${name} diagram needs a specific visible caption`);
    const title = block.match(/accTitle:\s*([^\n]+)/u)?.[1]?.trim();
    const description = block.match(/accDescr:\s*([^\n]+)/u)?.[1]?.trim();
    assert.ok(title, `${name} diagram needs accTitle`);
    assert.ok(description && description.length >= 30, `${name} diagram needs a useful accDescr`);
    titles.push(title);

    const nodes = new Set([...block.matchAll(/^\s{2,}([A-Za-z][A-Za-z0-9_]*)\s*(?:\[|\(|\{|>)/gmu)].map((match) => match[1]));
    const arrows = [...block.matchAll(/(?:-->|-.->|==>|---)/gu)].length;
    assert.ok(nodes.size <= 9, `${title} has ${nodes.size} nodes; maximum is 9`);
    assert.ok(arrows <= 12, `${title} has ${arrows} arrows; maximum is 12`);
  }
  assert.equal(new Set(titles).size, titles.length, 'diagram accessible titles must be unique');
});

test('standards records separate specification maturity, governance status and actual implementation', () => {
  assert.equal(validateStandardsProfile(), true);
  const required = [
    'implementationStatus', 'governanceStatus', 'specificationMaturity',
    'exactSnapshot', 'source', 'implementationEvidence', 'candidateSnapshot', 'profileSource', 'lastChecked',
  ];
  for (const record of STANDARDS_PROFILE) {
    for (const field of required) assert.ok(record[field], `${record.name} lacks ${field}`);
    assert.match(record.source, /^https?:\/\//u, `${record.name} must cite a primary source URL`);
    assert.match(standardAnchor(record), /^standard-[a-z0-9-]+$/u, `${record.name} needs a stable in-page anchor`);
  }
  const byName = Object.fromEntries(STANDARDS_PROFILE.map((record) => [record.name, record]));
  assert.deepEqual(
    ['RDF 1.2 Basic', 'RDF 1.2 Turtle', 'RDFS 1.2', 'OWL 2', 'XML Schema datatypes', 'SKOS', 'SHACL 1.2 Core', 'SPARQL 1.2', 'Dublin Core Terms']
      .map((name) => byName[name]?.implementationStatus),
    [
      'used and tested in Property Pack 0.1', 'used and tested in Property Pack 0.1',
      'used in Property Pack 0.1',
      'used in Property Pack 0.1', 'used in Property Pack 0.1',
      'used in Property Pack 0.1', 'used and exercised in Property Pack 0.1',
      'used and ARQ-tested in Property Pack 0.1', 'used in Property Pack 0.1',
    ],
  );
  assert.equal(byName['RDF 1.2 Basic'].specificationMaturity, 'W3C Candidate Recommendation Snapshot');
  assert.equal(byName['SHACL 1.2 Core'].specificationMaturity, 'W3C Working Draft');
  assert.equal(byName['SPARQL 1.2'].specificationMaturity, 'W3C Working Draft');
  assert.equal(byName['UFO'].governanceStatus, 'Normative analytical method; not an imported ontology');
  assert.equal(byName['gUFO'].implementationStatus, 'not used or imported');
  assert.equal(byName['OntoClean'].governanceStatus, 'Normative analytical quality method; implementation coverage is separate');
  for (const name of ['RDFS 1.2', 'OWL 2', 'XML Schema datatypes', 'SKOS', 'SHACL 1.2 Core', 'Dublin Core Terms']) {
    assert.equal(byName[name].mechanism, 'reuse', `${name} emits exact external vocabulary terms`);
  }
  for (const name of ['RDF 1.2 Basic', 'RDF 1.2 Turtle', 'SPARQL 1.2']) {
    assert.equal(byName[name].mechanism, 'reference', `${name} is an implementation-language contract`);
  }
  assert.equal(SEMANTIC_PACKAGE_MANIFEST.standardsProfileVersion, STANDARDS_PROFILE_VERSION);
});

test('search exposes every semantic-modelling route and no legacy journey label', () => {
  const ontologyEntries = searchEntries('ontology').map(({ url }) => url);
  assert.ok(ontologyEntries.includes('/semantic-modelling'), 'semantic-modelling landing is absent from search');
  for (const name of pages.filter((name) => name !== 'index')) {
    assert.ok(ontologyEntries.includes(`/semantic-modelling/${name}`), `${name} is absent from search`);
  }
  const all = searchEntries('');
  assert.equal(new Set(all.map(({ url }) => url)).size, all.length);
  for (const term of ['SKOS', 'SSSOM', 'ontology mapping', 'cross-context mapping', 'OWL', 'RDF', 'SPARQL', 'upper ontology', 'roleOf', 'phaseOf', 'ODR-0071']) {
    assert.ok(searchEntries(term).some(({ url }) => url.startsWith('/semantic-modelling')), `${term} is not discoverable`);
  }
  for (const term of ['bounded context', 'context map', 'taxonomy']) {
    assert.ok(searchEntries(term).some(({ url }) => url === '/semantic-modelling/bounded-contexts'), `${term} is not discoverable`);
  }
});

test('standards register keeps headings addressable and definition-list labels readable', () => {
  const source = textOf('standards');
  const tables = readFileSync(path.join(root, 'public/ui/design/tables.css'), 'utf8');
  assert.match(source, /id=\{standardAnchor\(record\)\}/u);
  assert.match(tables, /\.standards-profile-grid \.card dt/u);
  assert.match(tables, /text-transform:\s*uppercase/u);
});

test('the diagram component and renderer preserve authored names and descriptions', () => {
  const component = readFileSync(path.join(root, 'src/components/Diagram.astro'), 'utf8');
  const renderer = readFileSync(path.join(root, 'src/scripts/graph-diagram-mermaid.ts'), 'utf8');
  const design = readFileSync(path.join(root, 'DESIGN.md'), 'utf8');
  assert.match(component, /<figure class=\{cls\}>/u);
  assert.match(component, /data-node-interaction="static"/u);
  assert.match(component, /<figcaption class="diagram-caption"/u);
  assert.match(renderer, /querySelector\(':scope > title'/u);
  assert.match(renderer, /querySelector\(':scope > desc'/u);
  assert.match(renderer, /interactiveNodes \? 'group' : 'img'/u);
  assert.doesNotMatch(renderer, /title\.textContent = 'Interactive diagram'/u);
  assert.match(design, /authored accessible title, description and prose equivalent/u);
  assert.match(design, /nine nodes and twelve arrows/u);
});
