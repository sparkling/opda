#!/usr/bin/env node
/**
 * gen-ontology-custom.mjs — the CUSTOM bake-off output (ADR-0041 combination
 * principle, ingredient (b) custom script + (c) LLM prose).
 *
 * No off-the-shelf tool covers the OPDA-specific layers (overlay profiles + gap
 * register, round-trip exemplars, three-graph separation, governance/ODR-ADR
 * lineage, known-issues). This script reads the committed TTL corpus and emits
 * a self-contained HTML reference for exactly those layers — the part the tools
 * score "None" on. The narrative prose is hand/LLM-authored inline.
 *
 * Emits:
 *   public/ontology/tools/custom/index.html        (the custom rendering)
 *   public/ontology/artefacts/source/index.html    (listing for the source/ dir link)
 *
 * Run: node scripts/gen-ontology-custom.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ONT = path.join(ROOT, 'source/03-standards/ontology');
const PROFILES = path.join(ONT, 'profiles');
const EXEMPLARS = path.join(ONT, 'exemplars');
const OUT_CUSTOM = path.join(ROOT, 'public/ontology/tools/custom');
const OUT_SRC = path.join(ROOT, 'public/ontology/artefacts/source');

const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };
const ls = (d) => { try { return fs.readdirSync(d); } catch { return []; } };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const count = (txt, re) => (txt.match(re) || []).length;

// ── Headline counts (across the module TTLs) ────────────────────────────────
const moduleTtls = ls(ONT).filter((f) => f.endsWith('.ttl'));
const allText = moduleTtls.map((f) => read(path.join(ONT, f))).join('\n');
const counts = {
  classes: count(allText, /\ba owl:Class\b/g) + count(allText, /rdf:type owl:Class\b/g),
  objProps: count(allText, /owl:ObjectProperty\b/g),
  dataProps: count(allText, /owl:DatatypeProperty\b/g),
  schemes: count(read(path.join(ONT, 'opda-vocabularies.ttl')), /skos:ConceptScheme\b/g),
  concepts: count(read(path.join(ONT, 'opda-vocabularies.ttl')), /\ba skos:Concept\b/g) + count(read(path.join(ONT, 'opda-vocabularies.ttl')), /rdf:type skos:Concept\b/g),
  shapes: count(allText, /\ba sh:NodeShape\b/g) + count(allText, /sh:NodeShape\b/g),
};

// ── Overlay profiles + gap register ─────────────────────────────────────────
const profiles = ls(PROFILES).filter((f) => f.endsWith('.ttl')).sort().map((f) => {
  const t = read(path.join(PROFILES, f));
  const bound = count(t, /sh:property\b/g);
  const src = (t.match(/dct:source\s+<([^>]+)>/) || [])[1] || '';
  return { form: f.replace(/\.ttl$/, ''), bound, thin: bound === 0, src };
});
const boundProfiles = profiles.filter((p) => !p.thin).length;

// ── Round-trip exemplars ────────────────────────────────────────────────────
const exemplars = ls(EXEMPLARS)
  .filter((f) => f.endsWith('.ttl') && !f.includes('expected-report'))
  .sort().map((f) => f.replace(/\.ttl$/, ''));

// ── Known-issues register (corpus-tracked) ──────────────────────────────────
const knownIssues = [
  ['EPC-certificate inference cross-trip', 'ODR-0028 R3 / ODR-0029 R4', 'CONSUMER-SIDE',
   'A naive full-RDFS/OWL consumer mis-infers EPCCertificate ⊑ Property (currentEnergyRating has rdfs:domain Property). OPDA’s own Safe-Group closure excludes domain/range and does NOT produce this; the round-trip validates against the Safe-Group closure. Model is correct.'],
  ['Thin overlay profiles', 'session-034 / ODR-0022 §Rules.1', 'BY DESIGN',
   '16 of 31 profiles bind 0 per-leaf shapes; most overlay leaves are A/B/C/D/E/F treatments carried by dct:subject + dct:source, not per-leaf sh:path. 224 bound / 1095 GAPped across 28 forms.'],
  ['oc1 / llc1 held thin', 'ODR-0008d / session-034 Q2', 'BY DESIGN (re-open trigger)',
   'Authority-register extracts, not human-filled forms; thin until a named consumer issues a worked SPARQL query against a register leaf.'],
  ['Ruleset is not OWL 2 RL', 'ODR-0029 R5', 'RESOLVED (rename)',
   'config/opda-rdfs-plus.rules is a SOUND but RL-incomplete fragment (7 of the RL rules; omits domain/range/equality/functional/equivalence) — not an OWL 2 RL reasoner. Renamed + honest header; rule logic frozen.'],
];

const today = new Date().toISOString().slice(0, 10);

// ── Emit the custom rendering ───────────────────────────────────────────────
const css = `:root{--ink:#1a1a1a;--muted:#666;--line:#ddd;--brand:#0b5;--warn:#b60}
*{box-sizing:border-box}body{font:16px/1.6 system-ui,sans-serif;color:var(--ink);max-width:60rem;margin:0 auto;padding:2rem 1.25rem}
h1{font-size:1.9rem;margin:.2rem 0}h2{margin-top:2.2rem;border-bottom:2px solid var(--line);padding-bottom:.3rem}
h3{margin-top:1.4rem}.lead{font-size:1.1rem;color:#333}.muted{color:var(--muted)}
.badge{display:inline-block;font-size:.7rem;font-weight:700;padding:.1rem .5rem;border-radius:.5rem;background:#eef;color:#225}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.9rem}th,td{border:1px solid var(--line);padding:.4rem .55rem;text-align:left;vertical-align:top}
th{background:#f6f6f6}code{background:#f3f3f3;padding:.05rem .3rem;border-radius:.25rem;font-size:.85em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:.4rem}.grid span{background:#f6f6f8;border:1px solid var(--line);border-radius:.4rem;padding:.3rem .5rem;font-size:.82rem}
.thin{color:var(--warn)}.bound{color:var(--brand);font-weight:600}
.callout{background:#fffae8;border:1px solid #e8d98a;border-radius:.5rem;padding:.75rem 1rem;margin:1rem 0}
footer{margin-top:3rem;border-top:1px solid var(--line);padding-top:1rem;color:var(--muted);font-size:.85rem}`;

const profileRows = profiles.map((p) =>
  `<tr><td><code>${esc(p.form)}</code></td><td class="${p.thin ? 'thin' : 'bound'}">${p.thin ? 'thin' : p.bound + ' bound'}</td><td>${p.src ? `<a href="${esc(p.src)}">${esc(p.src.replace(/^https?:\/\//, ''))}</a>` : '<span class="muted">—</span>'}</td></tr>`
).join('\n');

const issueRows = knownIssues.map(([t, ref, status, desc]) =>
  `<tr><td><strong>${esc(t)}</strong></td><td><code>${esc(ref)}</code></td><td>${esc(status)}</td><td>${esc(desc)}</td></tr>`
).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OPDA custom reference — the OPDA-specific layers</title><style>${css}</style></head><body>
<h1>OPDA ontology — custom reference <span class="badge">script + LLM</span></h1>
<p class="lead">The bake-off's seventh "tool". Every off-the-shelf generator scores <strong>None</strong> on the
layers below — overlay profiles + the gap register, round-trip exemplars, the three-graph separation, the
governance/decision lineage, and the known-issues register. This page is generated by
<code>scripts/gen-ontology-custom.mjs</code> from the committed TTL corpus (the <em>script</em> half) wrapped in
hand/LLM-authored narrative (the <em>prose</em> half) — the combination ADR-0041 adopts as the composition.</p>

<p class="muted">Corpus snapshot: <strong>${counts.classes}</strong> classes ·
<strong>${counts.objProps}</strong> object + <strong>${counts.dataProps}</strong> datatype properties ·
<strong>${counts.schemes}</strong> SKOS schemes / <strong>${counts.concepts}</strong> concepts ·
<strong>${counts.shapes}</strong> SHACL node shapes · <strong>${profiles.length}</strong> overlay profiles
(${boundProfiles} bound) · <strong>${exemplars.length}</strong> round-trip exemplars.</p>

<h2>1 · Overlay profiles &amp; the gap register</h2>
<p>A PDTF form <em>is</em> its SHACL overlay (ODR-0010 / ADR-0029). Only Category-G substantive attributes bind
as per-leaf <code>sh:path</code> shapes; A/B/C/D/E/F leaves are carried by <code>dct:subject</code> +
JSON-pointer <code>dct:source</code> and GAP-registered, never fabricated (session-034). A <span class="thin">thin</span>
profile is the ratified outcome, not a defect.</p>
<table><thead><tr><th>Form (profile)</th><th>Binding</th><th>Source instrument (<code>dct:source</code>)</th></tr></thead>
<tbody>${profileRows}</tbody></table>

<h2>2 · Round-trip exemplars</h2>
<p>${exemplars.length} worked instance graphs, each paired with an expected SHACL validation report — the
data contract no OWL doc tool renders. They demonstrate conformant + non-conformant cases (e.g. the BASPI5
Seller-as-Attorney violation traceable to form-question B1.3.2).</p>
<div class="grid">${exemplars.map((e) => `<span>${esc(e)}</span>`).join('')}</div>

<h2>3 · Three-graph separation</h2>
<p>OPDA keeps three graphs strictly apart (ODR-0004 §3a, CI-enforced): the <strong>class graph</strong>
(<code>opda-classes.ttl</code> + module TBox), the <strong>shapes graph</strong> (<code>opda-*-shapes.ttl</code> —
constraints that <em>target</em> classes, never <code>owl:imports</code> them), and the <strong>annotation
graph</strong> (<code>opda-*-annotations.ttl</code> — DPV co-annotations, AI hints). Inference materialises into a
fourth, <em>derived</em> graph (<code>…/pdtf/graph/inferred/entailment</code>) and never pollutes the canonical three.</p>

<h2>4 · Inference / validation boundary</h2>
<p>Infer the relations whose closure the author wants (subclass/subproperty/inverse/symmetric/transitive — the 7
frozen rules of <code>config/opda-rdfs-plus.rules</code>, a sound but RL-incomplete fragment, <strong>not</strong> an
OWL 2 RL reasoner). Validate the constraints the author wants checked (domain/range/cardinality/identity) as SHACL —
the 273 <code>sh:targetSubjectsOf → sh:class</code> domain/range shapes (ODR-0029 R3). The closure adds 0 triples over
the flat schema; it is kept as a governed boundary + negative gate (no <code>owl:sameAs</code>, no spurious
<code>EPCCertificate ⊑ Property</code>), not for current output.</p>

<h2>5 · Governance &amp; decision-provenance</h2>
<p>Every term carries <code>dct:source</code> back to a PDTF schema-leaf-path or glossary row. The ontology's own
provenance is the ODR/ADR/council corpus: the PDTF→ontology programme is <strong>retired</strong> (ODR-0003, 2026-06-14);
the descriptive layer is reconciled complete (ODR-0028); the inference/validation boundary is ODR-0029 (Council
session-039); this reference document is ADR-0041 (Council session-038) and the <code>/manual</code>→<code>/model</code>
rename is ADR-0042.</p>

<h2>6 · Known-issues register <span class="muted">(dated ${today})</span></h2>
<table><thead><tr><th>Issue</th><th>Record</th><th>Status</th><th>Detail</th></tr></thead>
<tbody>${issueRows}</tbody></table>

<footer>Generated by <code>scripts/gen-ontology-custom.mjs</code> on ${today} from the committed TTL corpus;
narrative hand/LLM-authored. Regenerate after any ontology change. Part of the ADR-0041 <code>/ontology</code> composition.</footer>
</body></html>`;

fs.mkdirSync(OUT_CUSTOM, { recursive: true });
fs.writeFileSync(path.join(OUT_CUSTOM, 'index.html'), html);
console.log(`[custom] wrote ${path.relative(ROOT, path.join(OUT_CUSTOM, 'index.html'))} (${profiles.length} profiles, ${exemplars.length} exemplars)`);

// ── Emit the source/ artefact index (so the directory link resolves in dev) ──
const srcFiles = ls(OUT_SRC).filter((f) => f.endsWith('.ttl')).sort();
if (srcFiles.length) {
  const srcHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OPDA ontology — source TTLs</title><style>${css}</style></head><body>
<h1>OPDA ontology — per-module source TTLs</h1>
<p class="lead">${srcFiles.length} committed Turtle modules (read-only copies; canonical source under
<code>source/03-standards/ontology/</code>).</p>
<ul>${srcFiles.map((f) => `<li><a href="./${encodeURIComponent(f)}">${esc(f)}</a></li>`).join('')}</ul>
<footer>Generated by <code>scripts/gen-ontology-custom.mjs</code> on ${today}.</footer></body></html>`;
  fs.writeFileSync(path.join(OUT_SRC, 'index.html'), srcHtml);
  console.log(`[custom] wrote ${path.relative(ROOT, path.join(OUT_SRC, 'index.html'))} (${srcFiles.length} TTLs)`);
} else {
  console.log('[custom] artefacts/source/ empty — skipped index (run the bake-off artefact copy first)');
}
