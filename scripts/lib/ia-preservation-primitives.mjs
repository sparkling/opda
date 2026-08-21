import { createHash } from 'node:crypto';

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function semanticBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.replacementRoute, entry.replacementBlockSha256, entry.replacementTag,
    entry.replacementText, entry.replacementContentSha256, entry.classification,
    entry.reviewNote,
  ].join('\0')).join('\n'));
}

export function nonInformationBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.classification, entry.originalDestinationRoute, entry.destinationRoute,
    entry.destinationPolicy, entry.sourceEvidence, entry.baselineLinkHref ?? '',
    entry.destinationContentSha256, entry.supersessionReason,
  ].join('\0')).join('\n'));
}

function sourceFragmentsArePreserved(source, accepted) {
  const acceptedFragments = new Set(accepted.acceptedFragments ?? []);
  return (source.acceptedFragments ?? []).every((fragment) => acceptedFragments.has(fragment));
}

function sourceRetentionReceiptMatches(source, accepted) {
  const receipt = accepted.pdtf1SourceRetentionReceipt;
  const target = receipt?.targetEvidence?.find(({ route }) => route === accepted.acceptedRoute);
  const inventoryChanged = source.acceptedBlockInventorySha256 !== accepted.acceptedBlockInventorySha256;
  return receipt?.policy === 'explicit-pdtf1-source-block-retention-v1'
    && receipt.sourceRoute === source.acceptedRoute
    && receipt.sourceFile === source.acceptedFile
    && receipt.sourceRecordSha256 === sha256(JSON.stringify(source))
    && receipt.sourceContentSha256 === source.acceptedContentSha256
    && receipt.sourceBlockInventorySha256 === source.acceptedBlockInventorySha256
    && receipt.sourceFragmentSha256 === source.acceptedFragmentSha256
    && receipt.sourceFragmentCount === source.acceptedFragmentCount
    && JSON.stringify(receipt.sourceFragments) === JSON.stringify(source.acceptedFragments)
    && receipt.acceptedRoute === accepted.acceptedRoute
    && receipt.baselineBlockCount === source.equivalenceReceipt?.acceptedBlocks
    && receipt.baselineBlockInventorySha256 === source.acceptedBlockInventorySha256
    && receipt.exactRetainedBlocks + receipt.semanticReframeBlockCount
      + receipt.nonInformationBlockCount === receipt.baselineBlockCount
    && (!inventoryChanged || receipt.semanticReframeBlockCount + receipt.nonInformationBlockCount > 0)
    && semanticBlocksDigest(receipt.semanticReframeBlocks ?? []) === receipt.semanticReframeBlocksSha256
    && nonInformationBlocksDigest(receipt.nonInformationBlocks ?? []) === receipt.nonInformationBlocksSha256
    && target?.acceptedContentSha256 === accepted.acceptedContentSha256
    && target?.acceptedBlockInventorySha256 === accepted.acceptedBlockInventorySha256;
}

export function pdtf1SourceEvidenceMatches(source, accepted) {
  if (accepted.acceptedFragmentCount !== accepted.acceptedFragments?.length
    || sha256((accepted.acceptedFragments ?? []).join('\n')) !== accepted.acceptedFragmentSha256
    || !sourceFragmentsArePreserved(source, accepted)) return false;
  const informationMatches = source.acceptedContentSha256 === accepted.acceptedContentSha256
    && source.acceptedBlockInventorySha256 === accepted.acceptedBlockInventorySha256;
  return informationMatches
    ? accepted.pdtf1SourceRetentionReceipt === undefined
    : sourceRetentionReceiptMatches(source, accepted);
}

export function generatedFamily(route) {
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) return 'root';
  if (parts[0] === 'ontology' && parts[1] === 'tools') return 'ontology/tools';
  if (parts.slice(0, 4).join('/') === 'pdtf-1/extracted-ontology/use-and-tooling/tools') {
    return 'ontology/tools';
  }
  return parts[0];
}
