import { parseFragment } from 'parse5';

export const SITE_NAME = 'Open Property Data Association';
export const SITE_URL = 'https://opda.org.uk/';
const DESCRIPTION_LIMIT = 240;
const PRESENTATION_PARAMETERS = /^(?:config|theme|utm_.+|gclid|fbclid|msclkid)$/iu;
const OMIT_TAGS = new Set(['script', 'style', 'template', 'noscript', 'nav', 'footer', 'form', 'button', 'svg', 'aside', 'dialog']);
const OMIT_CLASSES = /(?:^|\s)(?:[\w-]*eyebrow|overline|tiny|term-kind|term-iri|entity-uri|sr-only|visually-hidden|page-meta|callout|judgement-note|learning-note)(?:\s|$)/u;
const clean = (value = '') => String(value).replace(/\s+/gu, ' ').trim();
const attributes = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));

function isOmitted(node) {
  const attrs = attributes(node);
  return OMIT_TAGS.has(node.tagName) || Object.hasOwn(attrs, 'hidden')
    || Object.hasOwn(attrs, 'data-nosnippet') || attrs['aria-hidden'] === 'true'
    || OMIT_CLASSES.test(attrs.class ?? '');
}

function textOf(node) {
  if (isOmitted(node)) return '';
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(textOf).join('');
}

function concise(value) {
  const text = clean(value);
  if (text.length <= DESCRIPTION_LIMIT) return text;
  const prefix = text.slice(0, DESCRIPTION_LIMIT - 1);
  return `${prefix.replace(/\s+\S*$/u, '').replace(/[,:;\s]+$/u, '')}…`;
}

/** Extract only the page's rendered content slot, never its shared chrome. */
export function inspectSeoContent(html = '', title = '') {
  const paragraphs = [];
  const details = [];
  const headings = [];
  let image;
  let constraints;
  function visit(node) {
    if (isOmitted(node)) return;
    const attrs = attributes(node);
    if (node.tagName === 'p') {
      const text = clean(textOf(node));
      if (text.length >= 40 && !/^https?:\/\//u.test(text)) {
        paragraphs.push({ text, lead: /(?:^|\s)(?:lead|entity-summary|term-definition|term-comment)(?:\s|$)/u.test(attrs.class ?? '') });
      }
    }
    if (/^h[23]$/u.test(node.tagName ?? '')) {
      const text = clean(textOf(node));
      if (/^Constraints\b/u.test(text)) constraints = text;
      if (text && headings.length < 4) headings.push(text);
    }
    if (node.tagName === 'dl' && details.length < 4) {
      let label;
      for (const child of node.childNodes ?? []) {
        if (child.tagName === 'dt') label = clean(textOf(child));
        if (child.tagName === 'dd' && label) {
          const value = clean(textOf(child));
          if (value && value !== '—' && details.length < 4) details.push(`${label}: ${value}`);
          label = undefined;
        }
      }
    }
    if (!image && node.tagName === 'img') {
      const source = attrs['data-campaign-image-light'] || attrs['data-light-src'] || attrs['data-light'] || attrs.src;
      if (source && /\.(?:png|jpe?g|webp|avif)(?:[?#]|$)/iu.test(source)
        && !source.startsWith('data:') && clean(attrs.alt)) image = { src: source, alt: clean(attrs.alt) };
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parseFragment(html));
  const paragraph = paragraphs.find((item) => item.lead)?.text ?? paragraphs[0]?.text;
  const recordSummary = details.length ? `${title}. ${details.join('. ')}${constraints ? `. ${constraints}` : ''}.` : '';
  const description = paragraph || recordSummary
    || (headings.length ? `${title}. ${headings.join('; ')}.` : clean(title));
  return { description: concise(description), image };
}

/** Strip presentation/tracking state only; preserve meaningful query parameters. */
export function canonicalPageUrl(value, site = SITE_URL) {
  const input = new URL(value, site);
  if (!['http:', 'https:'].includes(input.protocol)) throw new Error('Page URLs must use HTTP or HTTPS');
  const url = new URL(`${input.pathname}${input.search}`, site);
  for (const key of [...url.searchParams.keys()]) {
    if (PRESENTATION_PARAMETERS.test(key)) url.searchParams.delete(key);
  }
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/u, '');
  return url.href;
}

/** Interactive utility views have no stable, server-rendered search document. */
export function isSearchUtility(value) {
  const pathname = new URL(value, SITE_URL).pathname.replace(/\/+$/u, '') || '/';
  return /^\/(?:404|500|resource|search|under-development)$/u.test(pathname)
    || /^\/(?:api|_auth|ui\/header-preview-controls)(?:\/|$)/u.test(pathname);
}

/** Reuse the actual destination/group/trail data that drives visible navigation. */
export function navigationBreadcrumbs({ pathname, title, found, destination }) {
  if (!found || !destination) return [];
  const currentUrl = canonicalPageUrl(pathname);
  const candidates = [
    { name: destination.title, url: destination.url },
    { name: found.group.heading, url: found.group.url },
    ...found.trail.map((item) => ({ name: item.title, url: item.url })),
    { name: title, url: pathname },
  ];
  const seen = new Set();
  const items = [];
  for (const candidate of candidates) {
    const url = canonicalPageUrl(candidate.url);
    if (!candidate.name || seen.has(url)) continue;
    seen.add(url);
    items.push({ name: clean(candidate.name), url });
    if (url === currentUrl) break;
  }
  return items.length > 1 ? items : [];
}

function publicImage(value, site) {
  if (!value) return undefined;
  const url = new URL(value, site);
  return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
}

export function createPageMetadata({ title, description, contentHtml = '', url, site = SITE_URL, socialImage, breadcrumbs = [], robots, canonical }) {
  const pageTitle = clean(title);
  if (!pageTitle) throw new Error('A page needs a meaningful title');
  const content = inspectSeoContent(contentHtml, pageTitle.replace(/\s+·\s+.*$/u, ''));
  const summary = clean(description) || content.description;
  const utility = isSearchUtility(url);
  // A resource viewer's query selects the document. Do not claim all viewer
  // requests are equivalent to the empty /resource shell in static HTML.
  const canonicalUrl = canonical === null || utility ? undefined : canonicalPageUrl(canonical ?? url, site);
  const image = publicImage(socialImage ?? content.image?.src, site);
  const directives = clean(robots).toLowerCase() || (utility ? 'noindex,follow' : undefined);
  const structuredData = [];
  if (!directives?.split(/[\s,]+/u).some((token) => ['noindex', 'none'].includes(token))) {
    if (new URL(url, site).pathname === '/') {
      structuredData.push({
        '@context': 'https://schema.org', '@type': 'Organization',
        '@id': new URL('#organization', site).href,
        name: SITE_NAME, alternateName: 'OPDA', url: 'https://openpropdata.org.uk/',
        logo: new URL('/ui/brand/opda-wordmark-dark.svg', site).href,
      }, {
        '@context': 'https://schema.org', '@type': 'WebSite',
        '@id': new URL('#website', site).href,
        name: SITE_NAME, alternateName: 'OPDA', url: new URL('/', site).href,
        publisher: { '@id': new URL('#organization', site).href },
      });
    } else if (breadcrumbs.length > 1) {
      structuredData.push({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map(({ name, url: item }, index) => ({
          '@type': 'ListItem', position: index + 1, name, item: canonicalPageUrl(item, site),
        })),
      });
    }
  }
  return { title: pageTitle, description: summary, canonical: canonicalUrl, image,
    imageAlt: socialImage ? undefined : content.image?.alt, robots: directives, structuredData };
}

/** JSON inside HTML raw-text scripts must not be able to terminate the script. */
export function serialiseStructuredData(value) {
  return JSON.stringify(value).replace(/</gu, '\\u003c').replace(/>/gu, '\\u003e')
    .replace(/&/gu, '\\u0026').replace(/\u2028/gu, '\\u2028').replace(/\u2029/gu, '\\u2029');
}
