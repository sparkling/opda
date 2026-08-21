import { createHash } from 'node:crypto';

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function semanticBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceRoute, entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.replacementRoute, entry.replacementBlockSha256, entry.replacementTag,
    entry.replacementText, entry.replacementContentSha256, entry.classification,
    entry.reviewNote,
  ].join('\0')).join('\n'));
}

export function nonInformationBlocksDigest(blocks) {
  return sha256(blocks.map((entry) => [
    entry.sourceRoute, entry.sourceBlockSha256, entry.sourceTag, entry.sourceText, entry.occurrences,
    entry.classification, entry.originalDestinationRoute, entry.destinationRoute,
    entry.destinationPolicy, entry.sourceEvidence, entry.baselineLinkHref ?? '',
    entry.destinationContentSha256, entry.supersessionReason,
  ].join('\0')).join('\n'));
}

function sourceFragmentsArePreserved(source, accepted) {
  const acceptedFragments = new Set(accepted.acceptedFragments ?? []);
  return (source.acceptedFragments ?? []).every((fragment) => acceptedFragments.has(fragment));
}

function inventoryMap(records, expectedSha256) {
  if (!Array.isArray(records) || !records.length
    || records.some(({ hash, count }) => !/^[a-f0-9]{64}$/u.test(hash)
      || !Number.isSafeInteger(count) || count < 1)) return null;
  const sorted = [...records].sort((left, right) => left.hash.localeCompare(right.hash));
  if (JSON.stringify(records) !== JSON.stringify(sorted)
    || new Set(records.map(({ hash }) => hash)).size !== records.length
    || sha256(records.map(({ hash, count }) => `${hash}\0${count}`).join('\n')) !== expectedSha256) {
    return null;
  }
  return new Map(records.map(({ hash, count }) => [hash, count]));
}

function consume(inventory, hash, count) {
  if (!inventory || !Number.isSafeInteger(count) || count < 1 || (inventory.get(hash) ?? 0) < count) {
    return false;
  }
  inventory.set(hash, inventory.get(hash) - count);
  return true;
}

function sourceRetentionReceiptMatches(source, accepted) {
  const receipt = accepted.pdtf1SourceRetentionReceipt;
  const target = receipt?.targetEvidence?.find(({ route }) => route === accepted.acceptedRoute);
  const inventoryChanged = source.acceptedBlockInventorySha256 !== accepted.acceptedBlockInventorySha256;
  const sourceInventory = inventoryMap(
    receipt?.sourceBlockInventoryRecords, source.acceptedBlockInventorySha256,
  );
  const targetInventoryRecord = receipt?.targetBlockInventories?.[0];
  const targetInventory = inventoryMap(
    targetInventoryRecord?.records, accepted.acceptedBlockInventorySha256,
  );
  const structural = receipt?.policy === 'explicit-pdtf1-source-block-retention-v1'
    && receipt.sourceRoute === source.acceptedRoute
    && receipt.sourceFile === source.acceptedFile
    && receipt.sourceRecordSha256 === sha256(JSON.stringify(source))
    && receipt.sourceContentSha256 === source.acceptedContentSha256
    && receipt.sourceBlockInventorySha256 === source.acceptedBlockInventorySha256
    && sourceInventory
    && receipt.sourceFragmentSha256 === source.acceptedFragmentSha256
    && receipt.sourceFragmentCount === source.acceptedFragmentCount
    && JSON.stringify(receipt.sourceFragments) === JSON.stringify(source.acceptedFragments)
    && receipt.acceptedRoute === accepted.acceptedRoute
    && receipt.exactTargetRoute === accepted.acceptedRoute
    && receipt.targetEvidence.length === 1 && receipt.targetBlockInventories.length === 1
    && targetInventoryRecord.route === accepted.acceptedRoute
    && targetInventoryRecord.sha256 === accepted.acceptedBlockInventorySha256
    && targetInventory
    && receipt.baselineBlockCount === source.equivalenceReceipt?.acceptedBlocks
    && receipt.baselineBlockInventorySha256 === source.acceptedBlockInventorySha256
    && receipt.exactRetainedBlocks + receipt.semanticReframeBlockCount
      + receipt.nonInformationBlockCount === receipt.baselineBlockCount
    && (!inventoryChanged || receipt.semanticReframeBlockCount + receipt.nonInformationBlockCount > 0)
    && semanticBlocksDigest(receipt.semanticReframeBlocks ?? []) === receipt.semanticReframeBlocksSha256
    && nonInformationBlocksDigest(receipt.nonInformationBlocks ?? []) === receipt.nonInformationBlocksSha256
    && target?.acceptedContentSha256 === accepted.acceptedContentSha256
    && target?.acceptedBlockInventorySha256 === accepted.acceptedBlockInventorySha256;
  if (!structural || !Array.isArray(receipt.exactRetainedBlockRecords)) return false;
  let exactCount = 0;
  const exactKeys = new Set();
  for (const entry of receipt.exactRetainedBlockRecords) {
    const key = `${entry?.hash}\0${entry?.targetRoute}`;
    if (exactKeys.has(key) || entry?.targetRoute !== accepted.acceptedRoute
      || !consume(sourceInventory, entry?.hash, entry?.count)
      || !consume(targetInventory, entry?.hash, entry?.count)) return false;
    exactKeys.add(key);
    exactCount += entry.count;
  }
  let semanticCount = 0;
  for (const entry of receipt.semanticReframeBlocks) {
    if (entry?.sourceRoute !== source.acceptedRoute
      || entry?.replacementRoute !== accepted.acceptedRoute
      || !consume(sourceInventory, entry?.sourceBlockSha256, entry?.occurrences)
      || !consume(targetInventory, entry?.replacementBlockSha256, entry?.occurrences)) return false;
    semanticCount += entry.occurrences;
  }
  let nonInformationCount = 0;
  for (const entry of receipt.nonInformationBlocks) {
    if (entry?.sourceRoute !== source.acceptedRoute
      || !consume(sourceInventory, entry?.sourceBlockSha256, entry?.occurrences)) return false;
    nonInformationCount += entry.occurrences;
  }
  return exactCount === receipt.exactRetainedBlocks
    && semanticCount === receipt.semanticReframeBlockCount
    && nonInformationCount === receipt.nonInformationBlockCount
    && [...sourceInventory.values()].every((count) => count === 0);
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
