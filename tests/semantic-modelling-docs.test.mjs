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
const ontologyDir = path.join(root, 'src/pages/spdtf-2/ontologies');
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
    'evidence-and-mappings': ['Competency questions', 'Five qualified mapping meanings', 'Evidence receipt'],
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
  assert.ok(ontologyEntries.includes('/spdtf-2/ontologies'), 'semantic-modelling landing is absent from search');
  for (const name of pages.filter((name) => name !== 'index')) {
    assert.ok(ontologyEntries.includes(`/spdtf-2/ontologies/${name}`), `${name} is absent from search`);
  }
  const all = searchEntries('');
  assert.equal(new Set(all.map(({ url }) => url)).size, all.length);
  for (const term of ['SKOS', 'OWL', 'RDF', 'SPARQL', 'upper ontology']) {
    assert.ok(searchEntries(term).some(({ url }) => url.startsWith('/spdtf-2/ontologies')), `${term} is not discoverable`);
  }
  for (const term of ['bounded context', 'context map', 'taxonomy']) {
    assert.ok(searchEntries(term).some(({ url }) => url === '/spdtf-2/ontologies/bounded-contexts'), `${term} is not discoverable`);
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
