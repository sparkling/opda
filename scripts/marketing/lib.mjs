import crypto from 'node:crypto';
import path from 'node:path';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function dataUri(mimeType, bytes) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
}

export function base64Lines(value) {
  return Buffer.from(value).toString('base64').match(/.{1,76}/gu)?.join('\r\n') ?? '';
}

export function encodeHeader(value) {
  const chunks = [];
  let chunk = '';
  for (const character of value) {
    const candidate = `${chunk}${character}`;
    if (chunk && Buffer.byteLength(candidate, 'utf8') > 42) {
      chunks.push(chunk);
      chunk = character;
    } else chunk = candidate;
  }
  if (chunk) chunks.push(chunk);
  return chunks
    .map((part) => `=?UTF-8?B?${Buffer.from(part, 'utf8').toString('base64')}?=`)
    .join('\r\n ');
}

export function ensureRelativeFile(filePath) {
  const normalized = String(filePath).replaceAll('\\', '/');
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Unsafe generated path: ${filePath}`);
  }
  return normalized;
}

export function resolveBelow(baseDir, webPath) {
  if (typeof webPath !== 'string' || !webPath.startsWith('/') || webPath.includes('\\')) {
    throw new Error(`Asset path must be an absolute web path: ${webPath}`);
  }
  const target = path.resolve(baseDir, `.${webPath}`);
  const relative = path.relative(baseDir, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Asset path escapes public/: ${webPath}`);
  }
  return target;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function localHeader(name, bytes, crc) {
  const nameBytes = Buffer.from(name);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0x0021, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  return Buffer.concat([header, nameBytes]);
}

function centralHeader(name, bytes, crc, offset) {
  const nameBytes = Buffer.from(name);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0x0021, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(bytes.length, 20);
  header.writeUInt32LE(bytes.length, 24);
  header.writeUInt16LE(nameBytes.length, 28);
  header.writeUInt32LE(0x20, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, nameBytes]);
}

/** Build a deterministic, dependency-free ZIP using the STORE method. */
export function makeZip(entries) {
  const ordered = [...entries]
    .map(([name, value]) => [ensureRelativeFile(name), Buffer.from(value)])
    .sort(([left], [right]) => left.localeCompare(right));
  const local = [];
  const central = [];
  let offset = 0;
  for (const [name, bytes] of ordered) {
    const crc = crc32(bytes);
    const header = localHeader(name, bytes, crc);
    local.push(header, bytes);
    central.push(centralHeader(name, bytes, crc, offset));
    offset += header.length + bytes.length;
  }
  const centralBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(ordered.length, 8);
  end.writeUInt16LE(ordered.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBytes, end]);
}

export function fileRecord(filePath, bytes) {
  return { path: ensureRelativeFile(filePath), sha256: sha256(bytes), bytes: bytes.length };
}

export function jsonBuffer(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

/** Remove JPEG comments and application metadata without re-encoding pixels. */
export function stripJpegMetadata(value) {
  const bytes = Buffer.from(value);
  if (bytes.readUInt16BE(0) !== 0xffd8) throw new Error('Expected a JPEG derivative');
  const parts = [bytes.subarray(0, 2)];
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      parts.push(bytes.subarray(offset));
      return Buffer.concat(parts);
    }
    const length = bytes.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    if (length < 2 || end > bytes.length) throw new Error('Malformed JPEG derivative');
    const removable = marker === 0xfe || (marker >= 0xe1 && marker <= 0xef);
    if (!removable) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  throw new Error('Malformed JPEG derivative');
}
