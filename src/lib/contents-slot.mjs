import { parseFragment } from 'parse5';

/** Inspect rendered content without rewriting its markup or executing scripts. */
export function inspectContents(html) {
  let hasHeading = false;
  let hasSlot = false;
  function visit(node) {
    const attrs = node.attrs ?? [];
    if (/^h[234]$/.test(node.tagName ?? '') && attrs.some(a => a.name === 'id')) hasHeading = true;
    if (attrs.some(a => a.name === 'data-inline-toc')) hasSlot = true;
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parseFragment(html));
  return { hasHeading, hasSlot };
}

export function needsContentsSlot(html) {
  const { hasHeading, hasSlot } = inspectContents(html);
  return hasHeading && !hasSlot;
}
