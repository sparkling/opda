/**
 * GRLC Engine — reads .rq files with #+ decorator comments and produces
 * Express-ready route configuration objects.
 *
 * Ported from hm/semantic-modelling for opda (ADR-0021).
 * Parallel/hidden sub-query support retained; learn/export machinery omitted.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

/**
 * Parse GRLC decorators from .rq file content.
 * @param {string} content
 * @returns {Object}
 */
export function parseDecorators(content) {
  const decorators = {
    summary: '', description: '', endpoint: '', method: 'GET',
    pagination: null, enumerate: null, tags: [],
    mime: 'application/sparql-results+json', transform: null, hidden: false,
    querytype: null,
  };

  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith('#+') && line.trim() !== '') break;
    if (line.trim() === '') { i++; continue; }

    const keyMatch = line.match(/^#\+\s+(\w+):\s*(.*)/);
    if (!keyMatch) { i++; continue; }

    const key = keyMatch[1];
    let value = keyMatch[2].trim();

    if (key === 'tags' && value === '') {
      const items = [];
      i++;
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^#\+\s+-\s+(.*)/);
        if (itemMatch) { items.push(itemMatch[1].trim()); i++; } else break;
      }
      decorators.tags = items;
      continue;
    }

    if (key === 'enumerate' && value === '') {
      const enums = {};
      i++;
      while (i < lines.length) {
        const paramMatch = lines[i].match(/^#\+\s+-\s+(\w+):$/);
        if (paramMatch) {
          const paramName = paramMatch[1];
          const paramValues = [];
          i++;
          while (i < lines.length) {
            const valMatch = lines[i].match(/^#\+\s+-\s+(.*)/);
            if (valMatch && !lines[i].match(/^#\+\s+-\s+\w+:$/)) { paramValues.push(valMatch[1].trim()); i++; } else break;
          }
          enums[paramName] = paramValues;
        } else break;
      }
      decorators.enumerate = Object.keys(enums).length > 0 ? enums : null;
      continue;
    }

    if (key === 'description') {
      const parts = [value];
      i++;
      while (i < lines.length && lines[i].match(/^#\+\s{3,}\S/)) {
        parts.push(lines[i].replace(/^#\+\s+/, '').trim());
        i++;
      }
      decorators.description = parts.join(' ');
      continue;
    }

    switch (key) {
      case 'summary':    decorators.summary = value; break;
      case 'endpoint':   decorators.endpoint = value; break;
      case 'method':     decorators.method = value.toUpperCase(); break;
      case 'pagination': decorators.pagination = parseInt(value, 10) || null; break;
      case 'mime':       decorators.mime = value; break;
      case 'transform':  decorators.transform = value; break;
      case 'hidden':     decorators.hidden = value === 'true' || value === 'yes'; break;
      case 'querytype':  decorators.querytype = value; break;
      default:           decorators[key] = value; break;
    }
    i++;
  }
  return decorators;
}

function extractSparqlBody(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#+') && lines[i].trim() !== '') { startIndex = i; break; }
  }
  return lines.slice(startIndex).join('\n').trim();
}

function determineQueryType(decorators, sparqlBody) {
  if (decorators.pagination != null) return 'listing';
  if (decorators.querytype === 'detail') return 'detail';
  if (/\bCONSTRUCT\s*\{/i.test(sparqlBody)) return 'detail';
  return 'aggregate';
}

function extractPathParams(endpoint) {
  const params = [];
  const re = /\{(\w+)\}/g;
  let match;
  while ((match = re.exec(endpoint)) !== null) params.push(match[1]);
  return params;
}

function extractQueryParams(sparqlBody, pathParams) {
  const params = new Set();
  const re = /\?_(\w+?)_(iri|literal)\b/g;
  let match;
  while ((match = re.exec(sparqlBody)) !== null) params.add(match[1]);
  const pathSet = new Set(pathParams);
  return [...params].filter(p => !pathSet.has(p));
}

function normalizeEndpoint(endpoint) {
  return endpoint.replace(/^\/api\/v1/, '') || '/';
}

function classifyCompanion(name) {
  if (name.endsWith('-count')) return { baseName: name.slice(0, -6), role: 'count' };
  if (name.endsWith('-facets')) return { baseName: name.slice(0, -7), role: 'facets' };
  return { baseName: name, role: 'primary' };
}

/**
 * Scan a directory of .rq files and build route configurations.
 * @param {string} queriesDir
 * @returns {Promise<Array>}
 */
export async function buildRouteConfigs(queriesDir) {
  const entries = await readdir(queriesDir);
  const rqFiles = entries.filter(f => f.endsWith('.rq')).sort();

  const parsed = new Map();
  await Promise.all(rqFiles.map(async (file) => {
    const name = basename(file, '.rq');
    const content = await readFile(join(queriesDir, file), 'utf-8');
    const decorators = parseDecorators(content);
    const sparqlBody = extractSparqlBody(content);
    parsed.set(name, { decorators, content, sparqlBody });
  }));

  const groups = new Map();
  for (const name of parsed.keys()) {
    const { baseName, role } = classifyCompanion(name);
    if (!groups.has(baseName)) groups.set(baseName, { primary: null, count: null, facets: null });
    const group = groups.get(baseName);
    if (role === 'primary') group.primary = name;
    else if (role === 'count') group.count = name;
    else if (role === 'facets') group.facets = name;
  }

  const configs = [];
  for (const [baseName, group] of groups) {
    let leadName = group.primary;
    if (!leadName || !parsed.has(leadName)) {
      const orphans = [group.count, group.facets].filter(n => n != null && parsed.has(n));
      for (const orphanName of orphans) {
        const { decorators, sparqlBody } = parsed.get(orphanName);
        const rawEndpoint = decorators.endpoint || `/${orphanName}`;
        const endpoint = normalizeEndpoint(rawEndpoint);
        const pathParams = extractPathParams(endpoint);
        configs.push({
          name: orphanName, endpoint, method: decorators.method,
          summary: decorators.summary, description: decorators.description,
          queryText: sparqlBody, type: determineQueryType(decorators, sparqlBody),
          countQueryText: null, facetsQueryText: null,
          defaultPageSize: decorators.pagination, pathParams,
          queryParams: extractQueryParams(sparqlBody, pathParams),
          mime: decorators.mime, tags: decorators.tags,
          enumerate: decorators.enumerate, transform: decorators.transform,
          hidden: decorators.hidden,
        });
      }
      continue;
    }

    const { decorators, sparqlBody } = parsed.get(leadName);
    const type = determineQueryType(decorators, sparqlBody);
    const rawEndpoint = decorators.endpoint || `/${leadName}`;
    const endpoint = normalizeEndpoint(rawEndpoint);
    const pathParams = extractPathParams(endpoint);

    configs.push({
      name: leadName, endpoint, method: decorators.method,
      summary: decorators.summary, description: decorators.description,
      queryText: sparqlBody, type, defaultPageSize: decorators.pagination,
      countQueryText: group.count && parsed.has(group.count) ? parsed.get(group.count).sparqlBody : null,
      facetsQueryText: group.facets && parsed.has(group.facets) ? parsed.get(group.facets).sparqlBody : null,
      pathParams, queryParams: extractQueryParams(sparqlBody, pathParams),
      mime: decorators.mime, tags: decorators.tags,
      enumerate: decorators.enumerate, transform: decorators.transform,
      hidden: decorators.hidden,
    });
  }

  configs.sort((a, b) => a.endpoint.localeCompare(b.endpoint));
  return configs.filter(c => !c.hidden);
}

/**
 * Load all .rq files and return map of name → SPARQL body (includes hidden).
 * @param {string} queriesDir
 * @returns {Promise<Map<string, string>>}
 */
export async function loadQueryTexts(queriesDir) {
  const entries = await readdir(queriesDir);
  const map = new Map();
  await Promise.all(
    entries.filter(f => f.endsWith('.rq')).map(async (file) => {
      const name = basename(file, '.rq');
      const content = await readFile(join(queriesDir, file), 'utf-8');
      map.set(name, extractSparqlBody(content));
    }),
  );
  return map;
}
