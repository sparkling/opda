import { sha256 } from './ia-preservation-primitives.mjs';

export const SOURCE_ARCHIVE_REFRAMES = Object.freeze([
  Object.freeze({
    path: '00-deliverables/semantic-models/README.md',
    baselineSha256: '949dee8d9dac20f7e1bbb0484344c791b139f5df746fe46eebcd7ad710ddac8b',
    acceptedSha256: 'c41308f0148842caadb090f49b72d6c5c07509fbb7881250836840a3735e9f41',
    baselineSize: 3264,
    acceptedSize: 3399,
    reason: 'Separates the schema-derived semantic models from an endorsed SPDTF scheme.',
  }),
  Object.freeze({
    path: '03-standards/ontology-candidates/property-pack/0.1/candidate-manifest.json',
    baselineSha256: '7019688aeadf4a5e04f71f3e9c31b5a0d60575569c5d7baff9e92b626f33142d',
    acceptedSha256: '2e70a2737779433c2e9f34b23493dfdaa770396ebd36556b26aac79cca4225ce',
    baselineSize: 12177,
    acceptedSize: 12177,
    reason: 'Binds the corrected context map, refreshed validation report, and resulting candidate-tree digest.',
  }),
  Object.freeze({
    path: '03-standards/ontology-candidates/property-pack/0.1/projections/context-map.json',
    baselineSha256: '1cd6997b2ec7387003498e470ad1ed83e0898ccc3a4bd28766aae1a7fe7b056c',
    acceptedSha256: 'c9881d71008b40879dc393e2ff52df01e8ffcddb7943808ca7dd039ca610acea',
    baselineSize: 3400,
    acceptedSize: 3421,
    reason: 'Corrects the false claim that every context interoperates through Common to the directional shared-element relationship.',
  }),
  Object.freeze({
    path: '03-standards/ontology-candidates/property-pack/0.1/validation/report.json',
    baselineSha256: '63c72a3ee1381929f5eb3d94d49cc63c213ea192b3149e17c042ffce63c29814',
    acceptedSha256: '0000f4721a06154aa96453f411af28fdc2e1ac248e7fbc70c7817d5861731fb9',
    baselineSize: 9379,
    acceptedSize: 9379,
    reason: 'Refreshes the checked-tree digest after the reviewed context-map semantics correction.',
  }),
  Object.freeze({
    path: '03-standards/ontology/exemplars/README.md',
    baselineSha256: 'eabd882f27bacda7c76cd17f5bcb6d9173f43123bbdd8403b4fff9c47b1d0ce2',
    acceptedSha256: '0edebee64ef96aaa82e1f8b80434d69c01eb300d3550824832b4367c5e028570',
    baselineSize: 8012,
    acceptedSize: 8373,
    reason: 'Qualifies internal technical review status and removes implied OPDA scheme endorsement.',
  }),
  Object.freeze({
    path: '03-standards/rml/CONTRACT.md',
    baselineSha256: '5c456c738a058d65ac3039d78a2e4a743552cd6cd1f300ee909df4e275676eb0',
    acceptedSha256: 'f7ff2c8873489de38f01992b92057035db96a97d6cd6eef274ab5c685f371f85',
    baselineSize: 4891,
    acceptedSize: 5048,
    reason: 'Distinguishes PDTF schema inputs from the draft schema-derived ontology output.',
  }),
  Object.freeze({
    path: '03-standards/rml/ONTOLOGY-COVERAGE.md',
    baselineSha256: '2f86ddc3fb8dfc1af2352b8b2bfdbb3313ef938ab1398fc66b1d24ec17c7a893',
    acceptedSha256: '8c6bda47809b9a854ec7cdde93b8567d5bd8f927d84e8718eb4e9815f05ef7af',
    baselineSize: 7225,
    acceptedSize: 7232,
    reason: 'Names the covered transaction as a PDTF schema instance.',
  }),
  Object.freeze({
    path: '03-standards/rml/README.md',
    baselineSha256: '966ca63bb707ce08a9cbad34d3ba8a5c580888a8fafbddcfb099d7b892843b61',
    acceptedSha256: '2f4a6bb22227fc965a3cccb6ca2c777b9a559896c40999b914653610f2731166',
    baselineSize: 14817,
    acceptedSize: 15014,
    reason: 'Reframes RML as a PDTF schema to draft schema-derived ontology mapping.',
  }),
  Object.freeze({
    path: '03-standards/rml/gap-register.md',
    baselineSha256: '310e482282ea9d1960aa0bd27759839251d139d5e872cea12d5a1d9a5945ebe6',
    acceptedSha256: '6da8d1dbfe6fa49ea214f58fb6df16016244a02eeb9d6f6418e196c86dd7e4a2',
    baselineSize: 18371,
    acceptedSize: 18388,
    reason: 'Uses the schema-to-derived-ontology terminology for the mapping audit.',
  }),
  Object.freeze({
    path: '03-standards/rml/testdata/MANIFEST.md',
    baselineSha256: '9ea5b0802793aa996920d3164c8cac35f393a9cf3e49fd62740ebe1d04a47414',
    acceptedSha256: '53e46009ab66527274aeda345d85e3ae260349fb7ddafed4bc74d875cb24ad5b',
    baselineSize: 6487,
    acceptedSize: 6494,
    reason: 'Names the fixtures as PDTF schema v3 JSON.',
  }),
  Object.freeze({
    path: 'README.md',
    baselineSha256: 'b8cced5dfc7835448ab41a1ef23ec0311a8b601799b58594dfa16b75e1128610',
    acceptedSha256: 'ede8b915696945882c7b5cc0510ee1a905a547d2259952c1b13886cff282b9b1',
    baselineSize: 5828,
    acceptedSize: 5880,
    reason: 'Defines the current schema, derived evidence, and collaborative SPDTF scheme separately.',
  }),
  Object.freeze({
    path: '_content/schema/48-evidence-documents-declarations.md',
    baselineSha256: '8c81f24928af5aac4a72c48163dcdc277fea91057a9d2462d2430b4b29b9efd4',
    acceptedSha256: '407cd5cd68f6dde6f03c42b0144899cadf30cb04197c4ea65ba1e2f91cfa8249',
    baselineSize: 4874,
    acceptedSize: 5050,
    reason: 'Attributes the trust model to separate legacy material rather than the PDTF schema or SPDTF.',
  }),
]);

/** Prove that the source archive changed only in the reviewed, hash-bound files. */
export function composeSourceArchiveReframeReceipt(baseline, accepted) {
  const before = new Map(baseline.records.map((record) => [record.path, record]));
  const after = new Map(accepted.records.map((record) => [record.path, record]));
  const changed = [...new Set([...before.keys(), ...after.keys()])]
    .filter((file) => (
      before.get(file)?.sha256 !== after.get(file)?.sha256
      || before.get(file)?.size !== after.get(file)?.size
    ))
    .sort();
  const declared = SOURCE_ARCHIVE_REFRAMES.map(({ path }) => path).sort();
  if (baseline.count !== accepted.count || before.size !== baseline.count
    || after.size !== accepted.count || JSON.stringify(changed) !== JSON.stringify(declared)) {
    throw new Error('source archive changed outside the reviewed source-reframe set');
  }
  const reframedFiles = SOURCE_ARCHIVE_REFRAMES.map((entry) => {
    const baselineRecord = before.get(entry.path);
    const acceptedRecord = after.get(entry.path);
    if (baselineRecord?.sha256 !== entry.baselineSha256
      || acceptedRecord?.sha256 !== entry.acceptedSha256
      || baselineRecord?.size !== entry.baselineSize
      || acceptedRecord?.size !== entry.acceptedSize) {
      throw new Error(`source archive reframe bytes changed: ${entry.path}`);
    }
    return { ...entry };
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
