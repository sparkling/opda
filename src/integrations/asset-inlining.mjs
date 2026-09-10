/**
 * Fold small, emitted page styles into the protected HTML. Each separate asset
 * otherwise incurs a viewer-request authorization check before the CDN cache.
 * Keep large styles external and leave non-CSS assets on Vite's normal policy.
 *
 * @param {string} filePath
 * @param {Buffer} content
 * @returns {boolean | undefined}
 */
export function inlineSmallPageStyles(filePath, content) {
  if (filePath.startsWith('_astro/') && filePath.endsWith('.css')) {
    return content.length < 8 * 1024;
  }
  return undefined;
}
