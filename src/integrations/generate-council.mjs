/**
 * Astro integration — surface the council-session corpus at build/dev start.
 *
 * The council sessions live under docs/ontology/odr/council/ (session records,
 * adoption.md, scope-checks, and per-session folders of per-persona verdicts).
 * docs/ is NOT shipped to dist/ (only src/ + public/), so this integration:
 *
 *   1. Recursively copies every council file to public/council/<relpath> so it
 *      ships to dist/ and serves at /council/<relpath> (same as any public asset).
 *   2. Emits a DETERMINISTIC (path-sorted) src/data/council-manifest.json — a flat
 *      array of { path, name, type, ext, size } entries (files AND directories,
 *      path = "council/<relpath>"). Drives the /governance/council index and the
 *      resource viewer's folder listing (direct children = path-prefix + one
 *      extra segment).
 *
 * Mirrors src/integrations/generate-diagram-links.mjs: an astro:config:setup hook
 * that writes the generated artefacts before any page build resolves. Purely
 * filesystem-derived — no Fuseki/GRLC API.
 */
import {
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { resolve, join, relative, extname, dirname } from 'node:path';

const COUNCIL_SRC = 'docs/ontology/odr/council';
const PUBLIC_DEST = 'public/council';
const MANIFEST_OUT = 'src/data/council-manifest.json';

// Hidden / junk entries we never copy or index (mirrors astro.config's SKIP_NAMES).
const SKIP_NAMES = new Set(['.DS_Store', '.git', '.gitignore', '.gitkeep']);
const skip = (name) => SKIP_NAMES.has(name) || name.startsWith('.');

// Map a repo-relative path (the target of a relative markdown link, resolved
// against the linking file's directory) to the on-site URL that serves it.
// Returns null for off-site targets (plan/, other docs/…) → link left as-authored.
function mapToSiteUrl(repoRel) {
  let m;
  if (repoRel.startsWith(COUNCIL_SRC + '/')) {
    return '/resource?path=council/' + repoRel.slice(COUNCIL_SRC.length + 1);
  }
  if ((m = repoRel.match(/^docs\/adr\/ADR-(\d{4})/))) return '/modelling/adr/adr-' + m[1];
  if ((m = repoRel.match(/^docs\/ontology\/odr\/ODR-(\d{4}[a-z]?)/))) {
    return '/modelling/odr/odr-' + m[1].toLowerCase();
  }
  if (repoRel.startsWith('source/')) return '/resource?path=' + repoRel; // viewer maps source/→/resources/
  return null;
}

// Rewrite relative markdown links in a council doc so they resolve as SITE URLs
// (the docs were authored relative to the on-disk tree, which doesn't exist as
// routes). Absolute (/…), external (http/mailto), and pure-anchor links are left
// alone; unresolvable relative targets are left as-authored.
function rewriteCouncilLinks(content, fileAbs, root) {
  return content.replace(/\]\(([^)\s]+)\)/g, (whole, link) => {
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(link)) return whole;
    const [rel, frag] = link.split('#');
    if (!rel) return whole;
    let repoRel;
    try { repoRel = relative(root, resolve(dirname(fileAbs), rel)).replace(/\\/g, '/'); }
    catch { return whole; }
    const url = mapToSiteUrl(repoRel);
    return url ? `](${url}${frag ? '#' + frag : ''})` : whole;
  });
}

/**
 * Walk `dir` recursively, collecting manifest entries (files + directories) and
 * copying every file to the mirror under `destRoot`. `relBase` is the council
 * root used to compute the "council/<relpath>" path key.
 */
function walk(dir, relBase, destRoot, entries, root) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    if (skip(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    const rel = relative(relBase, full).replace(/\\/g, '/');
    const path = `council/${rel}`;
    if (st.isDirectory()) {
      mkdirSync(join(destRoot, rel), { recursive: true });
      entries.push({ path, name, type: 'dir', ext: '', size: 0 });
      walk(full, relBase, destRoot, entries, root);
    } else if (st.isFile()) {
      const dest = join(destRoot, rel);
      mkdirSync(join(dest, '..'), { recursive: true });
      const ext = extname(name).slice(1).toLowerCase();
      // Markdown: rewrite relative cross-links to site URLs before mirroring, so
      // they resolve when the viewer renders the doc. Other files copy verbatim.
      if (ext === 'md' || ext === 'markdown' || ext === 'mdx') {
        writeFileSync(dest, rewriteCouncilLinks(readFileSync(full, 'utf8'), full, root));
      } else {
        copyFileSync(full, dest);
      }
      entries.push({ path, name, type: 'file', ext, size: st.size });
    }
  }
}

function generateCouncil(root) {
  const srcDir = resolve(root, COUNCIL_SRC);
  const destRoot = resolve(root, PUBLIC_DEST);

  if (!existsSync(srcDir)) {
    console.warn(`[council] source not found: ${COUNCIL_SRC} — skipping`);
    writeFileSync(resolve(root, MANIFEST_OUT), '[]\n');
    return;
  }

  // Clear the mirror first so deletions/renames in the corpus don't leave stragglers.
  rmSync(destRoot, { recursive: true, force: true });
  mkdirSync(destRoot, { recursive: true });

  const entries = [];
  walk(srcDir, srcDir, destRoot, entries, root);

  // Deterministic order: sort by path (stable across machines/runs).
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  writeFileSync(
    resolve(root, MANIFEST_OUT),
    JSON.stringify(entries, null, 2) + '\n',
  );

  const files = entries.filter((e) => e.type === 'file').length;
  const dirs = entries.filter((e) => e.type === 'dir').length;
  console.log(
    `[council] copied ${files} files + ${dirs} dirs → ${PUBLIC_DEST}/ · wrote ${entries.length} manifest entries → ${MANIFEST_OUT}`,
  );
}

export function councilGenerator() {
  return {
    name: 'opda-council',
    hooks: {
      'astro:config:setup': () => {
        generateCouncil(process.cwd());
      },
    },
  };
}
