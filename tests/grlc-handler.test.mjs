import assert from 'node:assert/strict';
import test from 'node:test';

import { assembleEntityDetail } from '../src/api/lib/grlc-handler.js';

const binding = (rowType, values = {}) => Object.fromEntries([
  ['rowType', { value: rowType }],
  ...Object.entries(values).map(([key, value]) => [key, { value: String(value) }]),
]);

const rows = [
  binding('core', { uri: 'https://opda.org.uk/pdtf/Person', localName: 'Person', label: 'Person', module: 'agent' }),
  binding('source', { dctSourceUri: 'source/z' }),
  binding('source', { dctSourceUri: 'source/a' }),
  binding('attribute', { attrName: 'middleNames', attrLabel: 'Middle names', minCount: 0 }),
  binding('attribute', { attrName: 'currentName', attrLabel: 'Current name', minCount: 1, maxCount: 1 }),
  binding('relationship', { predLocalName: 'plays', targetLocalName: 'Role', inverseLocalName: 'playedBy' }),
  binding('relationship', { predLocalName: 'hasAddress', targetLocalName: 'Address' }),
  binding('constraint', { shapeName: 'PersonShape', constraintMessage: 'Z constraint' }),
  binding('constraint', { shapeName: 'AgentShape', constraintMessage: 'A constraint' }),
];

test('entity detail assembly is stable when SPARQL result rows arrive in a different order', () => {
  const params = { tier: 'concept', module: 'agent', localName: 'Person' };
  const forward = assembleEntityDetail(rows, params);
  const reverse = assembleEntityDetail([...rows].reverse(), params);

  assert.deepEqual(reverse, forward);
  assert.deepEqual(forward.dctSource, ['source/a', 'source/z']);
  assert.deepEqual(forward.attributes.map(({ localName }) => localName), ['currentName', 'middleNames']);
  assert.deepEqual(forward.relationships.map(({ predicate }) => predicate), ['hasAddress', 'plays']);
  assert.deepEqual(forward.constraints.map(({ shape, message }) => [shape, message]), [
    ['AgentShape', 'A constraint'],
    ['PersonShape', 'Z constraint'],
  ]);
});
