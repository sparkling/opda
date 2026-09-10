import { dataUri, escapeHtml } from './lib.mjs';

// OPDA campaign palette, consistent with the existing invitation master.
const palette = { paper: '#ffffff', ink: '#131224', muted: '#625d72', accent: '#fec92b', rule: '#e3e1e9' };

export function renderNewsletterPlain(pack, kind) {
  if (!['short', 'long'].includes(kind)) throw new Error('Unknown newsletter edition');
  return `${pack.newsletter.title}\n\n${pack.newsletter[kind]}\n`;
}

export function campaignInfographicDescription(pack) {
  return `Practitioners bring evidence to working groups, who review meaning to inform the draft specification. ${pack.example}`;
}

export function linkedInImageDescription(pack, index) {
  if (index === 0) return `${pack.hero.alt} Open Property Data Association branding appears below the illustration.`;
  if (index === 1) return campaignInfographicDescription(pack);
  return null;
}

export function supplementalEmail(pack, kind, employerBrief) {
  const employer = kind === 'employer';
  const paragraphs = employer ? employerBrief.paragraphs : pack.newsletter[kind].split('\n\n');
  return {
    ...pack,
    label: employer ? 'A conversation with your employer' : pack.label,
    email: { ...pack.email, [employer ? 'personal' : 'member']: {
      subject: employer ? employerBrief.subject : pack.newsletter.title,
      preheader: employer ? 'Explore participation, with your organisation’s agreement.' : 'An invitation to bring professional experience to the work.',
      headline: employer ? 'Bring your experience into the discussion' : pack.newsletter.title,
      paragraphs,
      ctaLabel: 'Explore the working groups',
    } },
  };
}

function wrappedText(text, x, y, limit, fontSize, lineHeight, fill = palette.ink) {
  const lines = [];
  for (const word of text.split(/\s+/u)) {
    if (!lines.length || (lines.at(-1) + ' ' + word).length > limit) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${fontSize}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escapeHtml(line)}</tspan>`).join('')}</text>`;
}

export function renderCampaignInfographic(pack) {
  const slug = `campaign-${pack.id}`;
  const steps = [
    { x: 56, owner: 'PRACTITIONERS', title: 'Bring evidence', body: 'Authorised examples, questions and exceptions from real work.' },
    { x: 440, owner: 'WORKING GROUPS', title: 'Review meaning', body: 'Challenge draft definitions and clarify the distinctions that matter.' },
    { x: 824, owner: 'WORK IN DEVELOPMENT', title: 'Shape the specification', body: 'Help develop shared definitions for property information.' },
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 628" role="img" aria-labelledby="${slug}-title ${slug}-desc" font-family="Arial, sans-serif">
<title id="${slug}-title">How ${escapeHtml(pack.label.toLowerCase())} experience contributes</title>
<desc id="${slug}-desc">${escapeHtml(campaignInfographicDescription(pack))}</desc>
<defs><marker id="${slug}-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${palette.ink}"/></marker></defs>
<rect width="1200" height="628" fill="${palette.paper}"/>
<path d="M56 40H1144" stroke="${palette.accent}" stroke-width="4"/>
<text x="56" y="88" fill="${palette.muted}" font-size="20" letter-spacing="1">OPDA · ${escapeHtml(pack.label.toUpperCase())}</text>
<text x="56" y="144" fill="${palette.ink}" font-size="40" font-family="Georgia, serif" font-weight="700">Professional judgement shapes shared meaning.</text>
<path d="M376 280H428" fill="none" stroke="${palette.ink}" stroke-width="4" marker-end="url(#${slug}-arrow)"/>
<path d="M760 280H812" fill="none" stroke="${palette.ink}" stroke-width="4" marker-end="url(#${slug}-arrow)"/>
${steps.map((step, index) => `<g><rect x="${step.x}" y="192" width="320" height="188" fill="${index === 1 ? palette.accent : palette.paper}" stroke="${palette.ink}" stroke-width="2"/>
<text x="${step.x + 20}" y="228" font-size="16" fill="${palette.ink}" letter-spacing="1">${step.owner}</text>
${wrappedText(step.title, step.x + 20, 272, 25, 24, 28)}
${wrappedText(step.body, step.x + 20, 316, 28, 20, 24)}</g>`).join('')}
<text x="56" y="428" fill="${palette.muted}" font-size="16" letter-spacing="1">A QUESTION FROM YOUR FIELD</text>
${wrappedText(pack.example, 56, 464, 91, 24, 32)}
<path d="M56 568H1144" stroke="${palette.rule}" stroke-width="2"/>
<text x="56" y="604" fill="${palette.ink}" font-size="20">Register interest at opda.org.uk/join · Participation is subject to OPDA review.</text>
</svg>`;
}

export function renderLinkedInPreview(pack, voice, logoBytes, socialCardBytes, infographic, postIndex) {
  const source = pack.linkedin[voice];
  if (postIndex !== undefined && (!Number.isInteger(postIndex) || !source.posts[postIndex])) throw new Error('Unknown LinkedIn post');
  const posts = source.posts.map((post, index) => ({ post, index })).filter(({ index }) => postIndex === undefined || index === postIndex);
  const title = postIndex === undefined ? 'Three conversations that invite a useful contribution.' : source.posts[postIndex].title;
  const logo = dataUri('image/png', logoBytes);
  const socialCard = dataUri('image/jpeg', socialCardBytes);
  const paragraphs = (copy) => copy.split('\n\n').map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(pack.label)} · ${escapeHtml(title)} · ${voice === 'opda' ? 'OPDA' : 'Organisation'} LinkedIn campaign</title>
<style>
*{box-sizing:border-box}body{margin:0;background:${palette.paper};color:${palette.ink};font:18px/1.6 Arial,'Segoe UI',sans-serif}header{padding:24px 32px;background:${palette.ink};border-bottom:4px solid ${palette.accent}}header img{width:260px;max-width:100%;height:auto;display:block}main{max-width:900px;padding:32px;margin:0 auto}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:36px;margin:0 0 20px}h2{font-size:28px;margin:0 0 20px}p{margin:0 0 20px;overflow-wrap:anywhere}a{color:#4a3fc4}article+article{margin-top:56px;padding-top:40px;border-top:1px solid ${palette.rule}}.kicker{color:${palette.muted};font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.art{display:block;width:100%;height:auto;margin:24px 0 32px}.caption{color:${palette.muted};font-size:16px}.quote{border-left:4px solid ${palette.accent};padding:20px 24px;background:#f9f9f9;font:700 28px/1.35 Georgia,serif}.tags{color:#4a3fc4}.cta{display:inline-block;margin:12px 0 20px;padding:14px 20px;background:${palette.accent};color:${palette.ink};font-weight:700;text-decoration:none}@media(max-width:480px){main{padding:24px 18px}h1{font-size:30px}h2{font-size:26px}}@media print{article{break-inside:avoid}header{print-color-adjust:exact}}
figure svg{display:block;width:100%;height:auto}
</style></head><body><header><img src="${logo}" alt="Open Property Data Association"></header>
<main><p class="kicker">${escapeHtml(pack.label)} · ${voice === 'opda' ? 'From OPDA' : 'Shared by your organisation'}</p>
<h1>${escapeHtml(title)}</h1>
${posts.map(({ post, index }) => `<article><p class="kicker">Post ${index + 1} of ${source.posts.length}</p>${postIndex === undefined ? `<h2>${escapeHtml(post.title)}</h2>` : ''}
${index === 0 ? `<img class="art" src="${socialCard}" alt="${escapeHtml(linkedInImageDescription(pack, index))}">` : index === 1 ? `<figure style="margin:24px 0 32px">${infographic}<figcaption class="caption">Professional evidence informs review of the draft specification. This is work in development, not an adopted requirement.</figcaption></figure>` : `<p class="quote">Your professional experience belongs in the discussion.</p>`}
${paragraphs(post.copy)}<p class="tags">${source.hashtags.map((tag) => escapeHtml('#' + tag)).join(' ')}</p></article>`).join('')}
<a class="cta" href="${escapeHtml(pack.signupUrl)}" target="_top">Explore the working groups</a>
</main></body></html>`;
}
