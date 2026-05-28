/**
 * Realises ADR-0018 per ADR-0015. Build-time unwrapping of <details>-wrapped
 * mermaid sources.
 *
 * The `/diagramming` skill emits each mermaid block as:
 *   ![alt](diagrams/...)     ← offline PNG reference (strip at build)
 *   <details>
 *   <summary>Mermaid Source</summary>
 *   ```mermaid
 *   …source…
 *   ```
 *   </details>
 *
 * This plugin replaces the entire span with:
 *   <div class="mermaid">…source…</div>
 *
 * so the existing client.js loader picks it up without modification.
 */

import type { Root, Node, Html, Code, Paragraph, Image } from 'mdast';

const DETAILS_OPEN_RE = /^<details>\s*\n\s*<summary>Mermaid Source<\/summary>/i;
const DETAILS_CLOSE_RE = /^<\/details>/i;
const INLINE_IMG_DIAGRAM_RE = /^<img\b[^>]*\bsrc="diagrams\//i;

/** Returns true when a node is a paragraph containing a single diagram image. */
function isDiagramImageParagraph(node: Node): node is Paragraph {
  if (node.type !== 'paragraph') return false;
  const para = node as Paragraph;
  if (para.children.length !== 1) return false;
  const child = para.children[0] as Image;
  return child.type === 'image' && /^diagrams\//.test(child.url ?? '');
}

/** Returns true when the node is a raw HTML <img src="diagrams/..."> block. */
function isInlineDiagramImg(node: Node): node is Html {
  return node.type === 'html' && INLINE_IMG_DIAGRAM_RE.test((node as Html).value);
}

/** Returns true when the html node is a <details><summary>Mermaid Source</summary> open tag. */
function isMermaidDetailsOpen(node: Node): node is Html {
  return node.type === 'html' && DETAILS_OPEN_RE.test((node as Html).value);
}

/** Returns true when the html node is a </details> close tag. */
function isDetailsClose(node: Node): node is Html {
  return node.type === 'html' && DETAILS_CLOSE_RE.test((node as Html).value);
}

/** Wraps mermaid source in a <div class="mermaid"> html node. */
function mermaidDivNode(source: string): Html {
  return { type: 'html', value: `<div class="mermaid">\n${source}\n</div>` };
}

/** Remark plugin: unwrap <details>-wrapped mermaid sources into <div class="mermaid">. */
export function remarkUnwrapMermaidDetails() {
  return function transformer(tree: Root): void {
    const children = tree.children;
    const result: Node[] = [];
    let i = 0;

    while (i < children.length) {
      const node = children[i];

      if (isMermaidDetailsOpen(node)) {
        // Expect: [open-html, code:mermaid, close-html]
        const codeNode = children[i + 1];
        const closeNode = children[i + 2];

        if (
          codeNode?.type === 'code' &&
          (codeNode as Code).lang === 'mermaid' &&
          closeNode &&
          isDetailsClose(closeNode)
        ) {
          // Strip the immediately-preceding diagram image (paragraph or raw HTML) if present
          if (result.length > 0) {
            const prev = result[result.length - 1];
            if (isDiagramImageParagraph(prev) || isInlineDiagramImg(prev)) {
              result.pop();
            }
          }
          result.push(mermaidDivNode((codeNode as Code).value));
          i += 3; // consume open + code + close
          continue;
        }
      }

      result.push(node);
      i++;
    }

    tree.children = result as Root['children'];
  };
}
