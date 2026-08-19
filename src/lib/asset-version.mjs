import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_PUBLIC_ROOT = path.resolve(process.cwd(), 'public');

/**
 * Cache versions must describe the bytes a browser receives. Filesystem mtimes
 * differ between checkout and build hosts, so they cannot be part of rendered
 * page output.
 */
export function assetVersion(relativePath, publicRoot = DEFAULT_PUBLIC_ROOT) {
  if (typeof relativePath !== 'string' || !relativePath.startsWith('/')) {
    throw new TypeError('asset version path must be an absolute public URL path');
  }
  const root = path.resolve(publicRoot);
  const target = path.resolve(root, relativePath.slice(1));
  if (!target.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('asset version path must stay within the public directory');
  }
  try {
    return createHash('sha256').update(readFileSync(target)).digest('hex').slice(0, 12);
  } catch {
    return 'dev';
  }
}
