#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToString } from '@antv/infographic/ssr';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'public', 'images', 'home');
const fontPath = path.join(repoRoot, 'public', 'ui', 'fonts', 'DMSans-Variable-latin.woff2');
const fontDataUrl = `data:font/woff2;base64,${(await readFile(fontPath)).toString('base64')}`;

const stages = [
  {
    label: 'People provide source material.',
    desc: 'Authorised schemas, forms, standards, guidance, examples and rules ground the work.',
  },
  {
    label: 'AI extracts a model and ontology.',
    desc: 'We direct AI to compare sources, identify meaning and prepare a candidate.',
  },
  {
    label: 'We publish the candidate.',
    desc: 'The website shows each version, source, change and unresolved question.',
  },
  {
    label: 'People discuss and review it.',
    desc: 'Working-group members challenge the meaning, correct assumptions and add evidence.',
  },
];

const themes = {
  light: {
    preset: 'light',
    background: '#ffffff',
    primary: '#5b51d8',
    palette: ['#5b51d8', '#fec92b', '#3e6f9a'],
    label: '#131224',
    desc: '#625d72',
  },
  dark: {
    preset: 'dark',
    background: '#231f2f',
    primary: '#fec92b',
    palette: ['#a9a0ff', '#fec92b', '#7fb5ff'],
    label: '#ffffff',
    desc: '#cbc8d5',
  },
};

function syntaxFor(theme) {
  const items = stages
    .map(({ label, desc }) => `    - label ${label}\n      desc ${desc}`)
    .join('\n');

  return `infographic sequence-circle-arrows-indexed-card
design
  structure sequence-circle-arrows
    radius 190
    arrowSize 5
    strokeWidth 8
  item underline-text
    width 350
    gap 8
theme ${theme.preset}
  colorPrimary ${theme.primary}
  colorBg ${theme.background}
  palette
    - ${theme.palette[0]}
    - ${theme.palette[1]}
    - ${theme.palette[2]}
  base
    text
      font-family Alibaba PuHuiTi
  item
    label
      fill ${theme.label}
    desc
      fill ${theme.desc}
data
  lists
${items}`;
}

function prepareSvg(svg, variant) {
  const withoutProcessingInstructions = svg.replace(/<\?[\s\S]*?\?>\s*/gu, '');
  const withLocalTypography = withoutProcessingInstructions.replaceAll(
    'Alibaba PuHuiTi',
    'DM Sans',
  );
  const title = 'People provide source material. AI extracts a model and ontology. We publish the candidate. People discuss and review it. Feedback starts the next modelling pass until consensus.';
  const fontStyle = `<style>@font-face{font-family:'DM Sans';src:url('${fontDataUrl}') format('woff2');font-style:normal;font-weight:400 700;font-display:swap}text{font-family:'DM Sans',sans-serif}</style>`;

  const prepared = withLocalTypography
    .replace(
      '<svg ',
      `<svg role="img" aria-labelledby="method-loop-${variant}-title" `,
    )
    .replace(
      /(<svg[^>]*>)/u,
      `$1<title id="method-loop-${variant}-title">${title}</title>${fontStyle}`,
    );

  const nonNamespaceRemote = prepared
    .match(/https?:\/\/[^\s"')]+/gu)
    ?.find((url) => !/^https?:\/\/www\.w3\.org\//u.test(url));
  if (nonNamespaceRemote) {
    throw new Error(`Refusing to write ${variant} infographic with a remote dependency`);
  }
  if (/<script\b|\son[a-z]+\s*=|javascript:/iu.test(prepared)) {
    throw new Error(`Refusing to write ${variant} infographic with executable content`);
  }

  return prepared;
}

await mkdir(outputDir, { recursive: true });

for (const [variant, theme] of Object.entries(themes)) {
  const svg = await renderToString(syntaxFor(theme), {
    width: 1180,
    height: 760,
    padding: 48,
  });
  const output = path.join(outputDir, `method-loop-${variant}.svg`);
  await writeFile(output, prepareSvg(svg, variant), 'utf8');
  console.log(`[homepage-infographic] wrote ${path.relative(repoRoot, output)}`);
}
