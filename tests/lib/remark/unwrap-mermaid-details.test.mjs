/**
 * Tests for src/lib/remark/unwrap-mermaid-details.ts (ADR-0018).
 * Uses Node built-in test runner + jiti for TypeScript loading.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

const jiti = createJiti(import.meta.url, { moduleCache: false });
const { remarkUnwrapMermaidDetails } = await jiti.import(
  '/Users/henrik/source/opda/src/lib/remark/unwrap-mermaid-details.ts'
);

/** Parse markdown and run the plugin, returning children array. */
function run(md) {
  const tree = unified().use(remarkParse).parse(md);
  remarkUnwrapMermaidDetails()(tree);
  return tree.children;
}

test('unwraps a simple mermaid details block', () => {
  const md = `<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  assert.equal(children.length, 1);
  assert.equal(children[0].type, 'html');
  assert.match(children[0].value, /^<div class="mermaid">/);
  assert.match(children[0].value, /flowchart LR/);
  assert.match(children[0].value, /<\/div>$/);
});

test('strips the immediately-preceding diagram image paragraph', () => {
  const md = `![alt text](diagrams/foo/bar.png)

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  assert.equal(children.length, 1, 'image paragraph should be removed');
  assert.equal(children[0].type, 'html');
  assert.match(children[0].value, /class="mermaid"/);
});

test('preserves non-diagram image paragraphs before details', () => {
  const md = `![not a diagram](images/logo.png)

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  // Image doesn't start with "diagrams/" so it's NOT stripped
  assert.equal(children.length, 2);
  assert.equal(children[0].type, 'paragraph');
  assert.equal(children[1].type, 'html');
});

test('handles multiple mermaid details blocks in one file', () => {
  const md = `![d1](diagrams/a/b.png)

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    X --> Y
\`\`\`

</details>

Some text.

![d2](diagrams/c/d.png)

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart TD
    P --> Q
\`\`\`

</details>`;

  const children = run(md);
  const divNodes = children.filter(n => n.type === 'html' && n.value.includes('class="mermaid"'));
  assert.equal(divNodes.length, 2, 'both mermaid blocks should be unwrapped');
  assert.match(divNodes[0].value, /X --> Y/);
  assert.match(divNodes[1].value, /P --> Q/);
});

test('unwraps ELK mermaid block (code fence with YAML frontmatter)', () => {
  const md = `<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
---
config:
  layout: elk
---
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  assert.equal(children.length, 1);
  assert.match(children[0].value, /layout: elk/);
  assert.match(children[0].value, /flowchart LR/);
});

test('skips details blocks without Mermaid Source summary', () => {
  const md = `<details>
<summary>Other source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  // Block should NOT be unwrapped — no Mermaid Source summary
  const divNodes = children.filter(n => n.type === 'html' && n.value.includes('class="mermaid"'));
  assert.equal(divNodes.length, 0);
});

test('strips raw HTML <img src="diagrams/..."> preceding details block', () => {
  const md = `<img src="diagrams/foo/bar.png" alt="alt" width="90%">

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>`;

  const children = run(md);
  assert.equal(children.length, 1, 'raw img html node should be stripped');
  assert.match(children[0].value, /class="mermaid"/);
});

test('leaves surrounding content intact', () => {
  const md = `# Title

Some text before.

<details>
<summary>Mermaid Source</summary>

\`\`\`mermaid
flowchart LR
    A --> B
\`\`\`

</details>

Some text after.`;

  const children = run(md);
  assert.equal(children[0].type, 'heading');
  const lastPara = children[children.length - 1];
  assert.equal(lastPara.type, 'paragraph');
  const divNode = children.find(n => n.type === 'html' && n.value.includes('class="mermaid"'));
  assert.ok(divNode, 'div.mermaid should be present');
});
