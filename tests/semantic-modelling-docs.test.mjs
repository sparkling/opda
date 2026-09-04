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
  'index', 'why-ontologies', 'reading-the-model', 'modelling-method',
  'semantic-package', 'bounded-contexts', 'modelling-rules', 'coverage',
  'standards', 'evidence-and-mappings', 'validation',
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
    'reading-the-model': ['Identifiers and resources', 'Classes, properties and values', 'Shapes and provenance', 'Follow one Property Pack construct'],
    'modelling-method': ['Authority of this method', 'Competency questions', 'Evidence-up modelling cycle'],
    'semantic-package': ['Six distinct outputs', 'One concept across all six outputs', 'Synchronisation and ownership'],
    'bounded-contexts': ['Semantic home', 'small common boundary', 'Property Pack'],
    'modelling-rules': ['Identity before attributes', 'Class, value or relationship', 'Upper-ontology lenses'],
    coverage: ['Four lenses and eleven workshop themes', 'Eight formal ontology concerns', 'Four allowed dispositions'],
    standards: ['What is implemented now', 'Specification maturity', 'Detailed standards register'],
    'evidence-and-mappings': ['Competency questions', 'Five qualified mapping meanings', 'Category 8: cross-context mappings', 'SKOS says what; SSSOM can record why', 'Evidence receipt'],
    validation: ['Open-world meaning and closed-world checks', 'What automated checks can establish', 'Governance promotion'],
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

test('Category 8 mapping guidance separates architecture, SKOS assertions and deferred SSSOM records', () => {
  const source = textOf('evidence-and-mappings');
  assert.match(source, /id="cross-context-mappings"/u);
  assert.match(source, /context-map arrow[\s\S]+not[\s\S]+mapping assertion/iu);
  assert.match(source, /machines?[\s\S]+suggest[\s\S]+must not[\s\S]+assert/iu);
  assert.match(source, /skos:exactMatch[\s\S]+transitive/iu);
  assert.match(source, /four core fields[\s\S]+subject_id[\s\S]+predicate_id[\s\S]+object_id[\s\S]+mapping_justification/iu);
  assert.match(source, /explicitly typed[\s\S]+rdfs:Literal[\s\S]+omit its ID[\s\S]+label carries the literal/iu);
  assert.match(source, /If that gate later selects SSSOM[\s\S]+profile[\s\S]+no such profile exists today/iu);
  assert.match(source, /named\s+external-vocabulary mapping[\s\S]+named consumer[\s\S]+Council re-evaluation/iu);
  assert.match(source, /not selected for internal cross-context records/iu);
  assert.match(source, /no SSSOM version or profile[\s\S]+selected/iu);
  assert.match(source, /no SKOS hierarchy or mapping predicates/iu);
  assert.match(source, /both endpoints are SKOS concepts/iu);
  assert.match(source, /exactMatch[\s\S]+subproperty[\s\S]+closeMatch/iu);
  assert.match(source, /exactMatch[\s\S]+disjoint[\s\S]+broadMatch[\s\S]+relatedMatch[\s\S]+narrowMatch/iu);
  assert.match(source, /relatedMatch[\s\S]+symmetric associative/iu);
  assert.match(source, /href="\/modelling\/odr\/odr-0002"/u);
  assert.match(source, /href="\/semantic-modelling\/standards#standard-sssom"/u);
  assert.doesNotMatch(source, /SSSOM (?:is|has been) (?:adopted|implemented)/iu);

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
  assert.equal(sssom?.governanceStatus, 'Deferred candidate');
  assert.match(sssom?.versionBoundary ?? '', /no selected versions/iu);

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
  assert.equal(byName['UFO'].governanceStatus, 'method candidate — not adopted');
  assert.equal(byName['gUFO'].implementationStatus, 'not used or imported');
  assert.equal(byName['OntoClean'].governanceStatus, 'method candidate — not adopted');
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
  for (const term of ['SKOS', 'SSSOM', 'ontology mapping', 'cross-context mapping', 'OWL', 'RDF', 'SPARQL', 'upper ontology']) {
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
