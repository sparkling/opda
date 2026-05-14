// Auto-generated sitemap. As an Astro endpoint (.js, not .astro), the output
// path is honoured literally — produces /sitemap.xml in the build.
const SITE = 'https://opda-kb.pages.dev';

const pages = [
  '',
  'governance.html',
  'modelling.html',
  'design-system.html',
  'resource.html',
  'pages/01-uk-initiative.html',
  'pages/02-legislation.html',
  'pages/03-departments.html',
  'pages/04-steering-forums.html',
  'pages/05-sandbox.html',
  'pages/07-toip-governance.html',
  'pages/08-strategic-alignment.html',
  'pages/11-opda-members.html',
  'pages/20-conformance-scheme.html',
  'pages/21-change-management.html',
  'pages/22-lifecycle-versioning.html',
  'pages/23-risk-liability.html',
  'pages/06-standards-stack.html',
  'pages/12-bounded-contexts.html',
  'pages/13-data-dictionary.html',
  'pages/14-business-glossary.html',
  'pages/16-overlays.html',
  'pages/30-concept-taxonomy.html',
  'pages/31-ontology.html',
  'pages/32-shacl-shapes.html',
  'pages/33-jsonld-mappings.html',
  'pages/09-project-roadmap.html',
  'pages/10-glossary.html',
];

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map(p =>
      '  <url>\n' +
      `    <loc>${SITE}/${p}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      '    <changefreq>weekly</changefreq>\n' +
      '  </url>'
    ).join('\n') + '\n' +
    '</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
