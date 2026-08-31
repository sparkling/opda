import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { glob, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { load as loadYaml } from 'js-yaml';
import { parse, parseFragment } from 'parse5';

const execFileAsync = promisify(execFile);
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(MODULE_DIR, '..', '..');
export const PREPARED_ROOT = path.join(REPO_ROOT, 'docs', 'notebooklm', 'prepared');
export const NOTEBOOK_CONFIG_PATHS = [
  'docs/notebooklm/programme-policy-history.yaml',
  'docs/notebooklm/standards-governance.yaml',
  'docs/notebooklm/semantic-modelling-method.yaml',
  'docs/notebooklm/working-group-participant-guide.yaml',
  'docs/notebooklm/property-pack-ontology.yaml',
  'docs/notebooklm/pdtf-lineage-historical-evidence.yaml',
];

const OFFICIAL_UPLOAD_EXTENSIONS = new Set([
  '.pdf', '.txt', '.md', '.docx', '.csv', '.pptx', '.epub', '.avif', '.bmp',
  '.gif', '.heic', '.heif', '.ico', '.jp2', '.jpe', '.jpeg', '.jpg', '.png',
  '.tif', '.tiff', '.webp', '.3g2', '.3gp', '.aac', '.aif', '.aifc', '.aiff',
  '.amr', '.au', '.avi', '.cda', '.m4a', '.mid', '.mp3', '.mp4', '.mpeg',
  '.ogg', '.opus', '.ra', '.ram', '.snd', '.wav', '.wma',
]);
const SKIP_HTML = new Set(['script', 'style', 'noscript', 'svg', 'template']);
const BLOCK_HTML = new Set([
  'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt', 'footer',
  'header', 'hr', 'li', 'main', 'nav', 'p', 'section', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'ul', 'ol',
]);

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 80) || 'source';
}

export async function readYaml(relativePath) {
  return loadYaml(await readFile(safeRepoPath(relativePath), 'utf8'));
}

function safeRepoPath(relativePath) {
  const absolutePath = path.resolve(REPO_ROOT, relativePath);
  if (absolutePath !== REPO_ROOT && !absolutePath.startsWith(`${REPO_ROOT}${path.sep}`)) {
    throw new Error(`Path escapes repository: ${relativePath}`);
  }
  return absolutePath;
}

function safePreparedPath(relativePath) {
  const absolutePath = safeRepoPath(relativePath);
  if (absolutePath !== PREPARED_ROOT && !absolutePath.startsWith(`${PREPARED_ROOT}${path.sep}`)) {
    throw new Error(`Prepared output escapes ${path.relative(REPO_ROOT, PREPARED_ROOT)}: ${relativePath}`);
  }
  return absolutePath;
}

export function normaliseText(text) {
  return String(text).replace(/\r\n?/gu, '\n').replace(/[\t\f\v]+/gu, ' ')
    .replace(/[ ]{2,}/gu, ' ').replace(/ *\n */gu, '\n').replace(/\n{3,}/gu, '\n\n').trim();
}

function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

function textFromNode(node, output) {
  const tag = node.tagName?.toLowerCase();
  if (tag && SKIP_HTML.has(tag)) return;
  if (tag && /^h[1-6]$/u.test(tag)) output.push(`\n${'#'.repeat(Number(tag[1]))} `);
  if (tag === 'li') output.push('\n- ');
  if (tag === 'td' || tag === 'th') output.push(' | ');
  if (tag === 'a') output.push('[');
  if (node.nodeName === '#text') output.push(node.value || '');
  for (const child of node.childNodes || []) textFromNode(child, output);
  if (tag === 'a') output.push(`](${attr(node, 'href') || ''})`);
  if (tag && BLOCK_HTML.has(tag)) output.push('\n');
}

function findElement(node, names) {
  if (names.has(node.tagName?.toLowerCase())) return node;
  for (const child of node.childNodes || []) {
    const found = findElement(child, names);
    if (found) return found;
  }
  return null;
}

export function htmlMainToMarkdown(html) {
  const document = parse(html);
  const root = findElement(document, new Set(['main']))
    || findElement(document, new Set(['article']))
    || findElement(document, new Set(['body']))
    || document;
  const output = [];
  textFromNode(root, output);
  return normaliseText(output.join(''));
}

function decodeEntities(text) {
  const fragment = parseFragment(`<span>${text}</span>`);
  const output = [];
  textFromNode(fragment, output);
  return output.join('').trim();
}

function vttToTranscript(text) {
  const lines = String(text).replace(/\r\n?/gu, '\n').split('\n');
  const output = [];
  for (const raw of lines) {
    if (/^(WEBVTT|NOTE|STYLE|REGION)/u.test(raw) || /-->/u.test(raw) || /^\d+$/u.test(raw.trim())) continue;
    const line = decodeEntities(raw.replace(/<v\s+([^>]+)>/giu, '$1: ').replace(/<[^>]+>/gu, '')).trim();
    if (line && line !== output.at(-1)) output.push(line);
  }
  return normaliseText(output.join('\n'));
}

function languageFor(extension) {
  return ({ '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml', '.toml': 'toml', '.ttl': 'turtle', '.rq': 'sparql', '.ts': 'typescript', '.js': 'javascript', '.mjs': 'javascript', '.astro': 'astro' })[extension] || 'text';
}

async function unsupportedFileToMarkdown(absolutePath, extension) {
  const text = await readFile(absolutePath, 'utf8');
  if (extension === '.html') return htmlMainToMarkdown(text);
  if (extension === '.vtt' || extension === '.srt') return vttToTranscript(text);
  if (extension === '.json') {
    try { return `\`\`\`json\n${JSON.stringify(JSON.parse(text), null, 2)}\n\`\`\``; } catch { /* preserve invalid source below */ }
  }
  return `\`\`\`${languageFor(extension)}\n${text.replace(/\r\n?/gu, '\n').trim()}\n\`\`\``;
}

async function trackingState(relativePath) {
  try {
    await execFileAsync('git', ['ls-files', '--error-unmatch', relativePath], { cwd: REPO_ROOT });
    return 'tracked';
  } catch {
    try {
      await execFileAsync('git', ['check-ignore', '-q', relativePath], { cwd: REPO_ROOT });
      return 'ignored-local-public-corpus';
    } catch {
      return 'untracked';
    }
  }
}

function sourceDateFromText(text) {
  const match = String(text).slice(0, 4_000).match(/^(?:date|updated):\s*["']?([^\n"']+)/imu);
  return match?.[1]?.trim() || 'unknown';
}

function globMatch(value, pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, '\\$&')
    .replace(/\*\*/gu, '::DOUBLE_STAR::').replace(/\*/gu, '[^/]*').replace(/::DOUBLE_STAR::/gu, '.*');
  return new RegExp(`^${escaped}$`, 'u').test(value);
}

async function expandGlobs(patterns, exclusions = []) {
  const matches = [];
  for (const pattern of patterns.filter(Boolean)) {
    for await (const item of glob(pattern, { cwd: REPO_ROOT })) matches.push(item);
  }
  return [...new Set(matches)].filter((item) => !exclusions.some((pattern) => globMatch(item, pattern)))
    .sort((a, b) => a.localeCompare(b, 'en'));
}

async function sourceDefinitionPaths(resource) {
  const matches = [...(resource.source_definitions || [])];
  if (resource.source_definition_glob) matches.push(...await expandGlobs([resource.source_definition_glob]));
  return [...new Set(matches)].filter((item) => !(resource.source_definition_exclusions || [])
    .some((pattern) => globMatch(item, pattern)));
}

async function staticRoutes(resource) {
  return (await sourceDefinitionPaths(resource)).filter((item) => item.startsWith('src/pages/') && !item.includes('['))
    .map((item) => {
      let route = `/${item.slice('src/pages/'.length).replace(/\.astro$/u, '')}`.replace(/\/index$/u, '');
      return route === '/' ? route : `${route}/`;
    });
}

async function distRoutes() {
  const root = path.join(REPO_ROOT, 'dist');
  try { await stat(root); } catch { return []; }
  const routes = [];
  for await (const item of glob('**/index.html', { cwd: root })) {
    const route = `/${item.replace(/\/index\.html$/u, '')}/`.replace(/^\/\//u, '/');
    routes.push(route === '//' ? '/' : route);
  }
  return routes;
}

export async function expandRoutes(resource) {
  const exact = [resource.route, ...(resource.routes || []), ...(resource.additional_routes || [])].filter(Boolean);
  const patterns = [resource.route_glob, ...(resource.route_globs || [])].filter(Boolean);
  const staticCandidates = await staticRoutes(resource);
  if (!patterns.length) return [...new Set([...exact, ...staticCandidates])];
  const definitions = await sourceDefinitionPaths(resource);
  const builtCandidates = await distRoutes();
  if (!builtCandidates.length && definitions.some((item) => item.includes('['))) {
    throw new Error(`${resource.id} needs built route discovery, but dist has no routes`);
  }
  const exclusions = resource.route_exclusions || [];
  const matched = [...builtCandidates, ...staticCandidates].filter((route) =>
    patterns.some((pattern) => globMatch(route, pattern)) && !exclusions.some((pattern) => globMatch(route, pattern)));
  return [...new Set([...exact, ...matched])].sort((a, b) => a.localeCompare(b, 'en'));
}

async function fetchSnapshot(url) {
  const response = await fetch(url, {
    redirect: 'follow', headers: { 'user-agent': 'OPDA-NotebookLM-Preparation/1.0' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const text = bytes.toString('utf8');
  return {
    bytes, content_type: contentType, final_url: response.url,
    retrieved_at: new Date().toISOString(), source_date: response.headers.get('last-modified') || 'unknown',
    extracted_text: contentType.includes('html') ? htmlMainToMarkdown(text) : normaliseText(text),
  };
}

async function localUnit(relativePath, resource, virtualFiles) {
  if (virtualFiles?.has(relativePath)) {
    const bytes = Buffer.from(virtualFiles.get(relativePath));
    return {
      identity: `file:${relativePath}`, original_path_or_url: relativePath, original_kind: 'file',
      original_size_bytes: bytes.length, original_sha256: sha256(bytes), content_type: path.extname(relativePath),
      repository_tracking: 'derived-local-output', source_date: 'unknown', conversion_text: null,
      original_upload_path: relativePath, resource,
    };
  }
  const absolutePath = safeRepoPath(relativePath);
  const details = await stat(absolutePath);
  if (!details.isFile()) throw new Error(`Source is not a file: ${relativePath}`);
  const bytes = await readFile(absolutePath);
  const extension = path.extname(relativePath).toLowerCase();
  const textual = ['.md', '.txt', '.yaml', '.yml', '.json', '.toml', '.ttl', '.rq', '.astro', '.ts', '.js', '.mjs', '.vtt', '.srt', '.html'].includes(extension);
  const preview = textual ? bytes.toString('utf8') : '';
  return {
    identity: `file:${relativePath}`, original_path_or_url: relativePath, original_kind: 'file',
    original_size_bytes: details.size, original_sha256: sha256(bytes), content_type: extension || 'unknown',
    repository_tracking: await trackingState(relativePath), source_date: sourceDateFromText(preview),
    conversion_text: OFFICIAL_UPLOAD_EXTENSIONS.has(extension) ? null : await unsupportedFileToMarkdown(absolutePath, extension),
    original_upload_path: relativePath, resource,
  };
}

async function remoteUnit(url, resource, kind, siteBaseUrl) {
  const routePath = url === '/' ? url : url.replace(/\/$/u, '');
  const requestUrl = kind === 'route' ? new URL(routePath, siteBaseUrl).href : url;
  const snapshot = await fetchSnapshot(requestUrl);
  return {
    identity: `${kind}:${kind === 'route' ? url : snapshot.final_url}`,
    original_path_or_url: url, original_kind: kind,
    original_size_bytes: snapshot.bytes.length, original_sha256: sha256(snapshot.bytes),
    extracted_sha256: sha256(snapshot.extracted_text), content_type: snapshot.content_type,
    final_url: snapshot.final_url, retrieved_at: snapshot.retrieved_at, source_date: snapshot.source_date,
    repository_tracking: kind === 'route' ? 'local-render' : 'external',
    conversion_text: kind === 'route' ? snapshot.extracted_text : null,
    external_upload_url: kind === 'url' ? url : null, resource,
  };
}

async function dependencyRecord(relativePath) {
  const absolutePath = safeRepoPath(relativePath);
  const details = await stat(absolutePath);
  const bytes = await readFile(absolutePath);
  return { path: relativePath, size_bytes: details.size, sha256: sha256(bytes), repository_tracking: await trackingState(relativePath) };
}

export async function collectResourceUnits(resource, { siteBaseUrl, virtualFiles }) {
  if (resource.rights_and_data_classification !== 'public-and-authorised-for-notebooklm') {
    throw new Error(`${resource.id} is not authorised for NotebookLM ingestion`);
  }
  const inputs = [...(resource.inputs || [])];
  if (resource.path) inputs.push(resource.path);
  inputs.push(...await expandGlobs([resource.input_glob, ...(resource.input_globs || [])], resource.input_exclusions || []));
  const units = [];
  for (const input of [...new Set(inputs)]) units.push(await localUnit(input, resource, virtualFiles));
  for (const url of resource.urls || []) units.push(await remoteUnit(url, resource, 'url', siteBaseUrl));
  if (String(resource.ingestion || '').includes('render')) {
    for (const route of await expandRoutes(resource)) units.push(await remoteUnit(route, resource, 'route', siteBaseUrl));
  }
  const dependencies = [
    ...(resource.supporting_inputs || []), ...await sourceDefinitionPaths(resource), ...(resource.owner ? [resource.owner] : []),
  ];
  const records = [];
  for (const item of [...new Set(dependencies)]) records.push(await dependencyRecord(item));
  return { units, dependencies: records };
}

function displayName(unit) {
  if (unit.original_kind === 'file') return path.basename(unit.original_path_or_url);
  if (unit.original_kind === 'route') return unit.original_path_or_url;
  try { return `${new URL(unit.original_path_or_url).hostname}${new URL(unit.original_path_or_url).pathname}`; } catch { return unit.original_path_or_url; }
}

function preparedDocument(unit, sourceId, title) {
  const metadata = [
    `# ${title}`, '', `- Stable source ID: \`${sourceId}\``, `- Original source: \`${unit.original_path_or_url}\``,
    `- Authority: ${unit.resource.authority}`, `- Maturity: ${unit.resource.maturity}`,
    `- Source date: ${unit.source_date}`, `- Original SHA-256: ${unit.original_sha256}`,
    `- Rights/data classification: ${unit.resource.rights_and_data_classification}`,
  ];
  return `${metadata.join('\n')}\n\n${unit.conversion_text}\n`;
}

function outputPathFor(unit, sourceId, slug) {
  const relativePath = unit.resource.output_pattern
    ? unit.resource.output_pattern.replace('{source-id}', sourceId)
    : `docs/notebooklm/prepared/ingestion/${slug}/${sourceId}.md`;
  return safePreparedPath(relativePath);
}

export async function prepareNotebook({ config, configPath, slug }, options) {
  const byIdentity = new Map();
  const groupSourceIds = {};
  for (const resource of config.resource_manifest.resources) {
    const { units, dependencies } = await collectResourceUnits(resource, options);
    groupSourceIds[resource.id] = [];
    for (const unit of units) {
      const sourceId = `src-${sha256(unit.identity).slice(0, 16)}`;
      groupSourceIds[resource.id].push(sourceId);
      if (!byIdentity.has(unit.identity)) byIdentity.set(unit.identity, { ...unit, source_id: sourceId, resource_ids: [], dependencies: [] });
      const entry = byIdentity.get(unit.identity);
      entry.resource_ids.push(resource.id);
      entry.dependencies.push(...dependencies);
    }
  }
  const sourceLimit = config.resource_manifest.prepared_source_contract.notebook_source_limit;
  if (byIdentity.size > sourceLimit) throw new Error(`${slug} has ${byIdentity.size} sources; limit is ${sourceLimit}`);
  const sources = [];
  for (const unit of byIdentity.values()) {
    const title = `[${unit.source_id}] ${displayName(unit)}`;
    let upload = unit.external_upload_url ? { kind: 'url', target: unit.external_upload_url } : { kind: 'file', target: unit.original_upload_path };
    let prepared = null;
    if (unit.conversion_text !== null) {
      const content = preparedDocument(unit, unit.source_id, title);
      const outputPath = outputPathFor(unit, unit.source_id, slug);
      if (options.write !== false) { await mkdir(path.dirname(outputPath), { recursive: true }); await writeFile(outputPath, content); }
      prepared = { path: path.relative(REPO_ROOT, outputPath), size_bytes: Buffer.byteLength(content), sha256: sha256(content) };
      upload = { kind: 'file', target: prepared.path };
    }
    sources.push({
      source_id: unit.source_id, stable_source_id: unit.source_id, title, resource_ids: [...new Set(unit.resource_ids)],
      original_path_or_url: unit.original_path_or_url, original_kind: unit.original_kind,
      originator: unit.resource.originator || unit.resource.authority, source_date: unit.source_date,
      authority: unit.resource.authority, maturity: unit.resource.maturity,
      inclusion_reason: unit.resource.inclusion_reason || unit.resource.title,
      repository_tracking: unit.repository_tracking,
      rights_and_data_classification: unit.resource.rights_and_data_classification,
      ingest_format: upload.kind === 'url' ? 'url' : path.extname(upload.target).toLowerCase(),
      size_bytes: prepared?.size_bytes || unit.original_size_bytes,
      sha256: prepared?.sha256 || unit.original_sha256,
      original_format: unit.content_type, original_size_bytes: unit.original_size_bytes,
      original_sha256: unit.original_sha256, extracted_sha256: unit.extracted_sha256 || prepared?.sha256 || null,
      final_url: unit.final_url || null, retrieved_at: unit.retrieved_at || null, upload, prepared,
      dependencies: [...new Map(unit.dependencies.map((item) => [item.path, item])).values()],
    });
  }
  sources.sort((a, b) => a.source_id.localeCompare(b.source_id, 'en'));
  const manifest = {
    config: configPath, notebook_id: config.notebook.id, notebook_title: config.notebook.title,
    generated_at: new Date().toISOString(), source_limit: sourceLimit, source_count: sources.length,
    source_policy: 'discrete-per-file-url-transcript-or-rendered-route', group_source_ids: groupSourceIds, sources,
  };
  const manifestPath = path.join(PREPARED_ROOT, 'manifests', `${slug}.json`);
  if (options.write !== false) { await mkdir(path.dirname(manifestPath), { recursive: true }); await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`); }
  return { manifest, manifestPath };
}

export async function prepareSharedFacts(options) {
  const configPath = 'docs/notebooklm/portfolio-shared-facts.yaml';
  const config = await readYaml(configPath);
  const sourceIndex = [];
  for (const resource of config.sources) {
    const { units } = await collectResourceUnits(resource, options);
    for (const unit of units) sourceIndex.push({
      resource_id: resource.id, source: unit.original_path_or_url, authority: resource.authority,
      maturity: resource.maturity, source_date: unit.source_date, sha256: unit.original_sha256,
    });
  }
  const content = [
    '# OPDA shared programme facts and terminology', '', `Updated: ${String(config.last_updated).slice(0, 10)}`, '',
    '## Canonical facts', '', ...config.canonical_facts.map((item) => `- **${item.subject}:** ${item.statement} Authority: ${item.authority}.`), '',
    '## Controlling guardrails', '', ...config.guardrails.map((item) => `- ${item}`), '',
    '## Known conflicts', '', ...config.known_conflicts.map((item) => `- **${item.id}:** ${item.issue} Disposition: ${item.disposition}.`),
    '', '## Component source index', '',
    ...sourceIndex.map((item) => `- \`${item.source}\` — ${item.authority}; ${item.maturity}; source date ${item.source_date}.`), '',
  ].join('\n');
  const outputPath = safePreparedPath(config.bundle.output);
  const manifestPath = safePreparedPath(config.bundle.manifest_output);
  const manifest = { config: configPath, generated_at: new Date().toISOString(), output: config.bundle.output, output_sha256: sha256(content), components: sourceIndex };
  if (options.write !== false) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, content);
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return { outputPath, manifestPath, manifest, content };
}

export async function loadNotebookConfigs(configPaths = NOTEBOOK_CONFIG_PATHS) {
  const configs = [];
  for (const configPath of configPaths) {
    const config = await readYaml(configPath);
    if (!config.notebook || !config.resource_manifest) throw new Error(`Not a notebook config: ${configPath}`);
    configs.push({ configPath, config, slug: path.basename(configPath, '.yaml') });
  }
  return configs;
}
