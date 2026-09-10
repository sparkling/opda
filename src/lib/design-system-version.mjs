import { createHash } from 'node:crypto';
import path from 'node:path';

export function designSystemOutputVersion(output) {
  return createHash('sha256').update(output).digest('hex').slice(0, 12);
}

/** Hash delivered CSS, not its source facade or checkout timestamps. */
export async function designSystemVersion({ publicDir = path.resolve(process.cwd(), 'public') } = {}) {
  // The integration injects this exact snapshot's digest afresh for each build.
  // There is no process-wide cache to survive another build or a development edit.
  if (typeof __OPDA_DESIGN_SYSTEM_VERSION__ === 'string') {
    return __OPDA_DESIGN_SYSTEM_VERSION__;
  }

  const { renderBundledDesignSystem } = await import('../integrations/bundle-design-system.mjs');
  const { output } = await renderBundledDesignSystem({ publicDir });
  return designSystemOutputVersion(output);
}
