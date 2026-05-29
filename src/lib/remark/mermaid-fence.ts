/**
 * Realises ADR-0024 (ODR pages rendered via the content collection). Converts
 * plain ```mermaid fenced code blocks into <div class="mermaid"> so the
 * client.js Mermaid loader (theme + lightbox + clickable nodes, ADR-0022)
 * renders them on the site.
 *
 * The manual authors mermaid inside <details><summary>Mermaid Source</summary>…
 * which remarkUnwrapMermaidDetails handles. ODRs use the plain fenced form
 * (which also renders natively on GitHub); this plugin covers that form. Run it
 * AFTER remarkUnwrapMermaidDetails so the <details>-wrapped case is consumed
 * first and only bare fences remain.
 */

import type { Root, Node, Code, Html } from 'mdast';

export function remarkMermaidFence() {
  return function transformer(tree: Root): void {
    tree.children = tree.children.map((node: Node): Node => {
      if (node.type === 'code' && (node as Code).lang === 'mermaid') {
        return {
          type: 'html',
          value: `<div class="mermaid">\n${(node as Code).value}\n</div>`,
        } as Html;
      }
      return node;
    });
  };
}
