import { sha256 } from './ia-preservation-primitives.mjs';

export const PDTF1_TOOL_REFRAMES = Object.freeze([
  Object.freeze({
    path: 'COMPARISON.md',
    baselineSha256: 'c4244d7c66a7712625ad829b83106cdd82e1c783963f2029cadb0947ed5a90f8',
    acceptedSha256: '8948eee1199d3a3c8dd284edeafdc5d85a4421445d03f1b30c38588a2347d53d',
    reason: 'Names the canonical schema-derived ontology section instead of the retired /ontology route.',
  }),
  Object.freeze({
    path: 'custom/index.html',
    baselineSha256: '5c98ba1a4f2df4885bef72feeb2428d931bad86591af8be364880dc30238eb8a',
    acceptedSha256: '3ded25085332765fd6fdefc85634a2d3b4f8c3242dcdc8d14eb39d947ebed994',
    reason: 'Clarifies retired route history and names the canonical schema-derived ontology composition.',
  }),
  Object.freeze({
    path: 'custom/README.md',
    baselineSha256: '265f2ac0737d5bcfdbbbfeff206c63e8ebce580c340434a6a35cf88f4ad69a71',
    acceptedSha256: '07dca73f638691520897b65428d3f87cbbaded18ba7567b5269e67170cb67b32',
    reason: 'Replaces retired /ontology naming with the canonical schema-derived ontology hierarchy.',
  }),
  Object.freeze({
    path: 'skosmos/README.md',
    baselineSha256: '9f32e3ad9cbb6b18fd1dab737ef2070eec712448c1e7051236a169e4d8a3055f',
    acceptedSha256: 'dc84356d856b186675815c6ddb222f36595016683424e16384e39eaac5cfd6d7',
    reason: 'Updates retired /ontology links to canonical schema-derived ontology terminology.',
  }),
]);

/** Prove that only the four reviewed route-wording files changed. */
export function composePdtf1ToolReframeReceipt(baseline, accepted) {
  const before = new Map(baseline.records.map((record) => [record.path, record]));
  const after = new Map(accepted.records.map((record) => [record.path, record]));
  const changed = [...new Set([...before.keys(), ...after.keys()])]
    .filter((file) => before.get(file)?.sha256 !== after.get(file)?.sha256)
    .sort();
  const declared = PDTF1_TOOL_REFRAMES.map(({ path }) => path).sort();
  if (baseline.count !== accepted.count || before.size !== baseline.count || after.size !== accepted.count
    || JSON.stringify(changed) !== JSON.stringify(declared)) {
    throw new Error('PDTF schema tool family changed outside the reviewed file set');
  }
  const reframedFiles = PDTF1_TOOL_REFRAMES.map((entry) => {
    const baselineRecord = before.get(entry.path);
    const acceptedRecord = after.get(entry.path);
    if (baselineRecord?.sha256 !== entry.baselineSha256
      || acceptedRecord?.sha256 !== entry.acceptedSha256) {
      throw new Error(`PDTF schema tool reframe bytes changed: ${entry.path}`);
    }
    return { ...entry, baselineSize: baselineRecord.size, acceptedSize: acceptedRecord.size };
  });
  return {
    policy: 'closed-file-reframe-v1',
    baselineTreeSha256: baseline.treeSha256,
    acceptedTreeSha256: accepted.treeSha256,
    byteIdenticalFileCount: baseline.count - reframedFiles.length,
    reframedFileCount: reframedFiles.length,
    reframedFiles,
    reframedFilesSha256: sha256(reframedFiles.map((entry) => [
      entry.path, entry.baselineSha256, entry.acceptedSha256,
      entry.baselineSize, entry.acceptedSize, entry.reason,
    ].join('\0')).join('\n')),
  };
}
