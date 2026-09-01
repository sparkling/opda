import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_MERMAID_PROPERTY_LAYERS,
  filterMermaidPropertyLayers,
  mermaidPropertyLayerCapabilities,
} from '../src/lib/mermaid-property-layers.mjs';

const layeredSource = `flowchart LR
  %% opda:property-layers
  %% opda:unless datatype
  Property["Property"]
  %% opda:when datatype
  Property["Property<br/><small class=\"gd-datatype-properties\"><span class=\"gd-datatype-property\">UPRN : xsd:string</span></small>"]
  Title["Registered title"]
  Thing["Thing"]
  %% opda:when object
  Property -->|"has registered title"| Title
  %% opda:when inheritance
  Title -.->|"isA"| Thing`;

test('property-layer capability detection is explicit rather than inferred from labels', () => {
  assert.deepEqual(mermaidPropertyLayerCapabilities(layeredSource), {
    enabled: true,
    datatype: true,
    object: true,
    inheritance: true,
  });
  assert.deepEqual(mermaidPropertyLayerCapabilities('flowchart LR\n  A -->|"isA"| B'), {
    enabled: false,
    datatype: false,
    object: false,
    inheritance: false,
  });
});

test('the default view preserves the class backbone and omits datatype compartments', () => {
  const filtered = filterMermaidPropertyLayers(layeredSource, DEFAULT_MERMAID_PROPERTY_LAYERS);
  assert.match(filtered, /Property\["Property"\]/u);
  assert.doesNotMatch(filtered, /UPRN|opda:(?:property-layers|when|unless)/u);
  assert.match(filtered, /has registered title/u);
  assert.match(filtered, /isA/u);
});

test('each property layer can be changed independently', () => {
  const datatypeOnly = filterMermaidPropertyLayers(layeredSource, {
    datatype: true,
    object: false,
    inheritance: false,
  });
  assert.match(datatypeOnly, /UPRN : xsd:string/u);
  assert.doesNotMatch(datatypeOnly, /has registered title|isA/u);
  assert.equal((datatypeOnly.match(/^  Property\[/gmu) ?? []).length, 1);

  const topologyOnly = filterMermaidPropertyLayers(layeredSource, {
    datatype: false,
    object: true,
    inheritance: false,
  });
  assert.match(topologyOnly, /has registered title/u);
  assert.doesNotMatch(topologyOnly, /UPRN|isA/u);
});

test('unmarked Mermaid remains byte-for-byte unchanged', () => {
  const source = 'flowchart LR\n  A -->|"isA"| B';
  assert.equal(filterMermaidPropertyLayers(source, {
    datatype: false,
    object: false,
    inheritance: false,
  }), source);
});
