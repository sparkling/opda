import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { contextDiagram } from '../src/lib/v2-model.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

test('the OPDA adapter is a discoverable Codex skill backed by the native plugin', async () => {
  const [skill, agent, upstream, marker, profile] = await Promise.all([
    read('.agents/skills/opda-diagram-design/SKILL.md'),
    read('.agents/skills/opda-diagram-design/agents/openai.yaml'),
    read('.agents/skills/opda-diagram-design/references/upstream.md'),
    read('.diagram-design'),
    read('.agents/skills/opda-diagram-design/references/opda-profile.md'),
  ]);

  assert.match(skill, /^---\nname: opda-diagram-design\n/mu);
  assert.match(skill, /\$diagram-design/u);
  assert.match(skill, /mermaid_extract\.py/u);
  assert.match(skill, /authoring-time/u);
  assert.match(agent, /\$opda-diagram-design/u);
  assert.match(upstream, /diagram-design@diagram-design/u);
  assert.match(upstream, /09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6/u);
  assert.equal(marker, 'profile: opda\n');
  assert.match(profile, /slug: opda/u);
  assert.match(profile, /Roboto Slab/u);
  assert.match(profile, /DM Sans/u);
  assert.match(profile, /Roboto Mono/u);
});

test('the committed Mermaid input is exact and its adapter removes directives only', async () => {
  const [raw, normalized] = await Promise.all([
    read('src/data/diagrams/estate-agency.raw.mmd'),
    read('src/data/diagrams/estate-agency.normalized.mmd'),
  ]);
  assert.equal(raw, contextDiagram('estate-agency'));
  assert.match(raw, /^\s*accTitle:/mu);
  assert.match(raw, /^\s*accDescr:/mu);
  assert.doesNotMatch(normalized, /^\s*acc(?:Title|Descr):/mu);

  const generated = execFileSync('python3', [
    '.agents/skills/opda-diagram-design/scripts/prepare_mermaid.py',
    'src/data/diagrams/estate-agency.raw.mmd',
    '--stdout',
  ], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.equal(generated, normalized);
});

test('the authoring receipt binds the installed skill, inputs, dials and layout', async () => {
  const [receiptSource, raw, normalized, artifact, profile] = await Promise.all([
    read('src/data/diagrams/estate-agency.diagram-design.json'),
    read('src/data/diagrams/estate-agency.raw.mmd'),
    read('src/data/diagrams/estate-agency.normalized.mmd'),
    read('src/data/diagrams/estate-agency.diagram-design.html'),
    read('.agents/skills/opda-diagram-design/references/opda-profile.md'),
  ]);
  const receipt = JSON.parse(receiptSource);

  assert.equal(receipt.schemaVersion, 1);
  assert.deepEqual(receipt.skill, {
    repository: 'https://github.com/cathrynlavery/diagram-design',
    pluginId: 'diagram-design@diagram-design',
    version: '2.4.0',
    commit: '09df49d8d1a1c7fb2efdfcdc7a2a0713534350a6',
    license: 'MIT',
    skillSha256: '8366ef4d11c3a9591556deb55320ea3521c138ccdad834eb087b8062f41d93a1',
  });
  assert.deepEqual(receipt.references, {
    'README.md': '12d51301d2204fac89375768b7ada26abc6282b324e36fb47543c1a7e802c88b',
    'commands/import-mermaid.md': 'b4933a5b4dff1a68b7d073e3cf6b126469207b2eba191d456f4146cac261efba',
    'references/import-mermaid.md': '491ff83440fc995401b5ba20f63325f976732bf1669003c1840b4137072cc274',
    'references/output-spec.md': 'd8fa916f523b99ada083a652f4440d3f0d086a8af61ae333bac50153338f42a3',
    'references/type-architecture.md': 'cb5672b5c69cbe24a0b18d144f8b2e4507a124ebb0dbc0bc898ceafb27612caa',
    'references/type-er.md': '61ee3643c9e3a1e2c3a329640132ede2c193bfabaebbbb5fa486be800b6afa29',
    'references/style-guide.md': 'a122617d3528795c3be8918c50c53bfb758beec735b9d57abecce47e52f1ecbb',
    'references/onboarding.md': '7b9ef85e8f79c6f32e7c92c785d65b9abbaa5036e678a4eb056764a04b0f887a',
    'references/profiles.md': '51f6d24e40eca1a13dc562b4b33aa76b56172c5c30fc94897e5bb369a34f9886',
    'scripts/mermaid_extract.py': '297ff6a8042c33d33df72ac4384bf666b2ab045f74030269adb45a89a7a2e0f8',
  });
  assert.equal(receipt.invocation.host, 'Codex');
  assert.equal(receipt.invocation.entrypoint, '$diagram-design');
  assert.equal(receipt.invocation.operation, 'import-mermaid');
  assert.equal(receipt.invocation.result, 'success');
  assert.match(receipt.invocation.finalResponseSha256, /^[0-9a-f]{64}$/u);
  assert.match(receipt.invocation.transcriptSha256, /^[0-9a-f]{64}$/u);
  assert.deepEqual(receipt.invocation.dials, {
    format: 'html', size: 'doc-wide', detail: 'faithful', audience: 'engineer',
    type: 'er', variant: 'light',
  });
  assert.equal(receipt.input.rawSha256, sha256(raw));
  assert.equal(receipt.input.normalizedSha256, sha256(normalized));
  assert.equal(receipt.profile.sha256, sha256(profile));
  assert.equal(receipt.invocation.generatedArtifact.sha256, sha256(artifact));
  assert.deepEqual(receipt.input.removedDirectives, ['accTitle', 'accDescr']);
  assert.equal(receipt.extractor.drawableNodes, 22);
  assert.equal(receipt.extractor.edges, 25);
  assert.equal(receipt.extractor.containers, 3);
  assert.equal(receipt.extractor.typeCandidate, 'architecture');
  assert.match(receipt.invocation.typeOverride, /domain model/iu);
  assert.equal(receipt.fidelity.omittedResources, 0);
  assert.equal(receipt.fidelity.inventedCardinalities, 0);
  assert.deepEqual(receipt.layout.viewBox, { width: 1280, height: 720 });
  assert.equal(receipt.layout.cornerRadius, 8);
  assert.equal(receipt.layout.cards.length, 7);
  assert.equal(receipt.layout.relationships.length, 5);
  assert.equal(receipt.layout.cards.flatMap((card) => card.fields).length, 7);
  assert.equal(receipt.layout.standardTypes.length, 3);
  assert.match(artifact, /<svg[^>]+role="img"[^>]*>\s*<title/isu);
  assert.doesNotMatch(artifact, /<script|(?:src|href)=["']https?:\/\//iu);
  assert.ok(artifact.split('\n').length <= 500);
});

test('the page consumes the receipt while keeping Diagram Design out of runtime', async () => {
  const [helper, component, packageSource] = await Promise.all([
    read('src/lib/estate-agency-editorial-diagram.mjs'),
    read('src/components/v2/EstateAgencyDiagram.astro'),
    read('package.json'),
  ]);

  assert.match(helper, /estate-agency\.diagram-design\.json/u);
  assert.doesNotMatch(helper, /const CARD_LAYOUT/u);
  assert.match(component, /role="group"/u);
  assert.match(component, /diagram\.receipt\.input\.normalizedSha256/u);
  assert.match(component, /diagram\.receipt\.invocation\.dials/u);
  assert.match(component, /diagram\.standardTerms\.map/u);
  assert.doesNotMatch(component, /set:html/u);
  assert.match(helper, /roundedPath/u);
  assert.match(helper, /generated HTML hash/u);
  const packageManifest = JSON.parse(packageSource);
  const runtimePackages = {
    ...packageManifest.dependencies,
    ...packageManifest.devDependencies,
  };
  assert.equal(runtimePackages['diagram-design'], undefined);
  assert.doesNotMatch(JSON.stringify(runtimePackages), /cathrynlavery/iu);
});
