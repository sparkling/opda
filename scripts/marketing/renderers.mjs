import { base64Lines, dataUri, encodeHeader, escapeHtml } from './lib.mjs';

const BRAND = Object.freeze({
  deep: '#131224', night: '#231f2f', yellow: '#fec92b', white: '#ffffff',
  offWhite: '#f9f9f9', violet: '#4a3fc4', ink: '#2c273b', muted: '#625d72', rule: '#e3e1e9',
});

function paragraphsHtml(paragraphs, style = '', safeLinks = []) {
  return paragraphs.map((paragraph) => {
    let html = escapeHtml(paragraph);
    for (const url of safeLinks) {
      const escapedUrl = escapeHtml(url);
      html = html.split(escapedUrl).join(`<a href="${escapedUrl}" target="_top" style="color:${BRAND.violet};font-weight:bold;">${escapedUrl}</a>`);
    }
    return `<p style="${style}">${html}</p>`;
  }).join('\n');
}

function distributionNote(voice) {
  if (voice === 'member') return 'An invitation from the Open Property Data Association, shared by your organisation.';
  if (voice === 'personal') return 'An invitation from the Open Property Data Association, shared by a colleague.';
  return 'An invitation from the Open Property Data Association.';
}

function emailDocument(pack, voice, imageSources) {
  const copy = pack.email[voice];
  const logo = imageSources === 'cid' ? 'cid:opda-logo' : imageSources.logo;
  const hero = imageSources === 'cid' ? 'cid:opda-hero' : imageSources.hero;
  const packUrl = `https://opda.org.uk/marketing/packs/${pack.id}`;
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.offWhite};color:${BRAND.night};font-family:Arial,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(copy.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${BRAND.offWhite};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:${BRAND.white};border:1px solid ${BRAND.rule};">
        <tr><td style="padding:22px 30px;background:${BRAND.deep};border-bottom:4px solid ${BRAND.yellow};">
          <img src="${logo}" width="260" alt="Open Property Data Association" style="display:block;width:260px;max-width:100%;height:auto;border:0;">
        </td></tr>
        <tr><td style="padding:0;"><img src="${hero}" width="680" alt="${escapeHtml(pack.hero.alt)}" style="display:block;width:100%;height:auto;border:0;"></td></tr>
        <tr><td style="padding:34px 32px 38px;">
          <p style="margin:0 0 10px;color:${BRAND.violet};font-size:13px;line-height:19px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(pack.label)}</p>
          <h1 style="margin:0 0 22px;color:${BRAND.deep};font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:41px;">${escapeHtml(copy.headline)}</h1>
          ${paragraphsHtml(copy.paragraphs, `margin:0 0 16px;color:${BRAND.night};font-size:17px;line-height:27px;`, voice === 'opda' ? [packUrl] : [])}
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 22px;"><tr><td style="background:${BRAND.yellow};">
            <a href="${escapeHtml(pack.signupUrl)}" target="_top" style="display:inline-block;padding:14px 22px;color:#000;text-decoration:none;font-size:16px;line-height:21px;font-weight:bold;">${escapeHtml(copy.ctaLabel)}</a>
          </td></tr></table>
          <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:21px;">${escapeHtml(distributionNote(voice))}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderEmailPlain(pack, voice) {
  const copy = pack.email[voice];
  return [
    copy.subject,
    '',
    copy.headline,
    '',
    ...copy.paragraphs.flatMap((paragraph) => [paragraph, '']),
    copy.ctaLabel,
    pack.signupUrl,
    '',
    distributionNote(voice),
    '',
  ].join('\n');
}

export function renderEmailPreview(pack, voice, logoBytes, heroBytes) {
  return emailDocument(pack, voice, {
    logo: dataUri('image/png', logoBytes),
    hero: dataUri('image/jpeg', heroBytes),
  });
}

export function renderEml(pack, voice, logoBytes, heroBytes) {
  const copy = pack.email[voice];
  const related = `opda-related-${pack.id}-${voice}`;
  const alternative = `opda-alternative-${pack.id}-${voice}`;
  const plain = renderEmailPlain(pack, voice);
  const html = emailDocument(pack, voice, 'cid');
  const lines = [
    `Subject: ${encodeHeader(copy.subject)}`,
    'MIME-Version: 1.0',
    'X-Unsent: 1',
    `Content-Type: multipart/related; boundary="${related}"; type="multipart/alternative"; start="<opda-body>"`,
    '',
    `--${related}`,
    `Content-Type: multipart/alternative; boundary="${alternative}"`,
    'Content-ID: <opda-body>',
    '',
    `--${alternative}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Lines(plain),
    `--${alternative}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Lines(html),
    `--${alternative}--`,
    `--${related}`,
    'Content-Type: image/png; name="opda-logo.png"',
    'Content-Transfer-Encoding: base64',
    'Content-Disposition: inline; filename="opda-logo.png"',
    'Content-ID: <opda-logo>',
    '',
    base64Lines(logoBytes),
    `--${related}`,
    'Content-Type: image/jpeg; name="hero.jpg"',
    'Content-Transfer-Encoding: base64',
    'Content-Disposition: inline; filename="hero.jpg"',
    'Content-ID: <opda-hero>',
    '',
    base64Lines(heroBytes),
    `--${related}--`,
    '',
  ];
  return lines.join('\r\n');
}

function renderSection(section) {
  const paragraphs = (section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const bullets = section.bullets?.length
    ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
    : '';
  return `<section><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}</section>`;
}

export function renderOnePager(pack, logoBytes, heroBytes) {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(pack.onePager.title)} · OPDA</title>
<style>
:root{--deep:${BRAND.deep};--night:${BRAND.night};--yellow:${BRAND.yellow};--violet:${BRAND.violet};--muted:${BRAND.muted};--rule:${BRAND.rule}}*{box-sizing:border-box}body{margin:0;background:#ecebf0;color:var(--night);font:15px/1.48 Arial,'Segoe UI',sans-serif}.sheet{width:min(210mm,100%);min-height:297mm;margin:24px auto;background:#fff;box-shadow:0 8px 28px #13122422}.masthead{display:flex;align-items:center;justify-content:space-between;padding:16mm 15mm 9mm;background:var(--deep);border-bottom:4px solid var(--yellow)}.masthead img{width:62mm;height:auto}.status{color:var(--yellow);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.hero{display:block;width:100%;height:auto}.content{padding:10mm 15mm 12mm}h1{max-width:18ch;margin:0 0 4mm;color:var(--deep);font:700 30px/1.08 Georgia,serif}h2{margin:0 0 2mm;color:var(--deep);font:700 17px/1.2 Arial,sans-serif}p{margin:0 0 3mm}.standfirst{max-width:72ch;margin-bottom:7mm;color:var(--muted);font-size:17px;line-height:1.5}.sections{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--rule);border-left:1px solid var(--rule)}section{padding:5mm;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule)}ul{margin:2mm 0 0;padding-left:5mm}li+li{margin-top:1.5mm}.cta{display:flex;align-items:center;justify-content:space-between;gap:8mm;margin-top:7mm;padding:5mm 6mm;background:var(--yellow);color:#000}.cta strong{font-size:16px}.cta a{color:#000;font-weight:700;overflow-wrap:anywhere}.foot{margin-top:5mm;color:var(--muted);font-size:11px}@page{size:A4;margin:0}@media print{body{background:#fff;font-size:10.5pt;line-height:1.32}.sheet{width:210mm;height:297mm;min-height:0;margin:0;overflow:hidden;box-shadow:none}.hero{display:none}.masthead{padding:8mm 12mm 5mm;border-bottom-width:3px}.masthead img{width:48mm}.status{font-size:8pt}.content{padding:7mm 12mm 6mm}h1{margin-bottom:3mm;font-size:22pt;line-height:1.05}h2{margin-bottom:1.2mm;font-size:12pt}p{margin-bottom:1.8mm}.standfirst{margin-bottom:4mm;font-size:12pt;line-height:1.35}.sections,section{break-inside:avoid}section{padding:3mm}ul{margin-top:1mm;padding-left:4mm}li+li{margin-top:.8mm}.cta{margin-top:4mm;padding:3mm 4mm}.cta strong{font-size:11pt}.foot{margin-top:2.5mm;font-size:8pt}}@media(max-width:700px){.sheet{margin:0}.masthead,.content{padding:24px}.sections{grid-template-columns:1fr}.status{display:none}}
</style></head><body><main class="sheet">
<header class="masthead"><img src="${dataUri('image/png', logoBytes)}" alt="Open Property Data Association"><span class="status">${escapeHtml(pack.campaignStatus.replaceAll('-', ' '))}</span></header>
<img class="hero" src="${dataUri('image/jpeg', heroBytes)}" alt="${escapeHtml(pack.hero.alt)}">
<article class="content"><h1>${escapeHtml(pack.onePager.title)}</h1><p class="standfirst">${escapeHtml(pack.onePager.standfirst)}</p>
<div class="sections">${pack.onePager.sections.map(renderSection).join('')}</div>
<div class="cta"><strong>${escapeHtml(pack.onePager.ctaLabel)}</strong><a href="${escapeHtml(pack.signupUrl)}">${escapeHtml(pack.signupUrl)}</a></div>
<p class="foot">Smart Property Data Trust Framework · Open Property Data Association</p></article>
</main></body></html>`;
}

function renderSlideContent(slide, index, heroData, inlineAssets) {
  const isCover = index === 0;
  const body = Array.isArray(slide.body) ? slide.body : slide.body ? [slide.body] : [];
  const image = slide.image ? inlineAssets.get(slide.image) : undefined;
  return `<section class="slide${isCover ? ' slide--cover' : ''}" data-slide="${index + 1}" aria-hidden="${isCover ? 'false' : 'true'}">
  <div class="slide-canvas">
    ${isCover || image ? `<img class="slide-image" src="${image ?? heroData}" alt="${escapeHtml(isCover ? 'Editorial illustration for this working-group presentation' : slide.title)}">` : ''}
    <div class="slide-copy editable"><p class="slide-kicker">${escapeHtml(index === 0 ? 'Smart Property Data Trust Framework' : `OPDA working groups · ${String(index + 1).padStart(2, '0')}`)}</p>
      <h${isCover ? '1' : '2'}>${escapeHtml(slide.title)}</h${isCover ? '1' : '2'}>
      ${body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${slide.bullets?.length ? `<ul>${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
    </div>
    <footer><span>Open Property Data Association</span><span>${index + 1} / ${inlineAssets.slideCount}</span></footer>
  </div>
  <aside class="speaker-notes"><strong>Speaker notes</strong><p>${escapeHtml(slide.notes ?? 'No speaker notes supplied.')}</p></aside>
</section>`;
}

export function renderSlides(pack, logoBytes, heroBytes, inlineAssets = new Map()) {
  inlineAssets.slideCount = pack.deck.slides.length;
  const logo = dataUri('image/png', logoBytes);
  const hero = dataUri('image/jpeg', heroBytes);
  const subtitle = pack.deck.subtitle.split('|').map((part) => escapeHtml(part.trim())).join('<br>');
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(pack.deck.title)} · OPDA</title><style>
:root{--deep:${BRAND.deep};--night:${BRAND.night};--yellow:${BRAND.yellow};--white:#fff;--off:${BRAND.offWhite};--muted:#cbc8d5}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--deep);color:var(--white);font-family:Arial,'Segoe UI',sans-serif}.deck{min-height:100vh}.slide{display:none;min-height:100vh;padding:56px}.slide[aria-hidden="false"]{display:grid;grid-template-columns:minmax(0,1fr);gap:24px}.slide-canvas{position:relative;display:flex;min-height:calc(100vh - 112px);flex-direction:column;overflow:hidden;background:var(--deep);border:1px solid #ffffff2b}.slide-image{display:block;width:100%;height:auto;max-height:38vh;object-fit:contain;object-position:left top;background:var(--off)}.slide-copy{display:flex;flex:1;flex-direction:column;justify-content:center;padding:clamp(32px,6vw,88px)}.slide-kicker{margin:0 0 20px;color:var(--yellow);font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}h1,h2{max-width:18ch;margin:0;color:var(--white);font-family:Georgia,'Times New Roman',serif;letter-spacing:-.02em}h1{font-size:clamp(42px,6vw,78px);line-height:1.02}h2{font-size:clamp(36px,5vw,64px);line-height:1.06}.slide-copy>p:not(.slide-kicker){max-width:62ch;margin:28px 0 0;color:var(--muted);font-size:clamp(19px,2vw,28px);line-height:1.45}.slide-copy ul{max-width:68ch;margin:30px 0 0;padding-left:1.2em;font-size:clamp(19px,2vw,27px);line-height:1.45}.slide-copy li+li{margin-top:15px}footer{display:flex;justify-content:space-between;padding:18px 24px;border-top:1px solid #ffffff2b;color:var(--muted);font-size:12px}.speaker-notes{display:none;align-self:center;padding:28px;background:var(--off);color:var(--night);font-size:16px;line-height:1.55}.speaker-notes strong{display:block;margin-bottom:12px;color:var(--deep)}@media screen{html[data-notes="true"] .speaker-notes{display:block}}@media screen and (min-width:801px){html[data-notes="true"] .slide[aria-hidden="false"]{grid-template-columns:minmax(0,1fr) minmax(260px,34vw)}}.controls{position:fixed;z-index:10;right:16px;bottom:16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.controls button{min-height:42px;padding:8px 13px;border:1px solid #ffffff55;background:var(--night);color:var(--white);font:600 13px Arial,sans-serif;cursor:pointer}.controls button:hover,.controls button:focus-visible{border-color:var(--yellow);outline:0}.control-status{position:fixed;z-index:10;right:16px;bottom:66px;max-width:34rem;margin:0;padding:7px 10px;background:var(--night);color:var(--white);font-size:13px}.control-status:empty{display:none}.brand{position:fixed;z-index:10;top:14px;left:18px;width:190px;height:auto}.editable[contenteditable="true"]{outline:3px solid var(--yellow);outline-offset:-3px}.subtitle{position:fixed;z-index:10;top:18px;right:18px;color:var(--muted);font-size:12px;line-height:1.35;text-align:right}
@media(max-width:800px){.slide{padding:72px 12px 64px}.slide[aria-hidden="false"]{grid-template-columns:1fr}.slide-canvas{min-height:calc(100vh - 136px)}.slide-copy{padding:28px}.speaker-notes{margin-bottom:64px}.brand{width:150px}.subtitle{display:none}}
@page{size:13.333in 7.5in;margin:0}@media print{.controls,.control-status,.brand,.subtitle{display:none!important}.slide,.slide[aria-hidden="true"],.slide[aria-hidden="false"]{display:block;min-height:0;padding:0;break-after:page}.slide-canvas{width:13.333in;height:7.5in;min-height:0;border:0}.slide-image{max-height:2.55in}.slide-copy{padding:.55in .8in}h1{font-size:45pt}h2{font-size:36pt}.slide-copy>p:not(.slide-kicker),.slide-copy ul{font-size:20pt}.speaker-notes{display:none}html[data-print-mode="notes"] .slide{display:grid;grid-template-columns:8.9in 4.433in}html[data-print-mode="notes"] .slide-canvas{width:8.9in;height:5in;align-self:start}html[data-print-mode="notes"] .speaker-notes{display:block;height:7.5in;padding:.5in}html[data-print-mode="notes"] .slide-image{max-height:1.7in}html[data-print-mode="notes"] h1{font-size:30pt}html[data-print-mode="notes"] h2{font-size:25pt}html[data-print-mode="notes"] .slide-copy>p:not(.slide-kicker),html[data-print-mode="notes"] .slide-copy ul{font-size:15pt}}
</style></head><body><img class="brand" src="${logo}" alt="Open Property Data Association"><div class="subtitle">${subtitle}</div>
<main class="deck">${pack.deck.slides.map((slide, index) => renderSlideContent(slide, index, hero, inlineAssets)).join('\n')}</main>
<nav class="controls" aria-label="Presentation controls"><button type="button" data-action="previous">Previous</button><button type="button" data-action="next">Next</button><button type="button" data-action="notes" aria-pressed="false">Speaker notes</button><button type="button" data-action="edit" aria-pressed="false">Edit text</button><button type="button" data-action="copy">Copy slide text</button><button type="button" data-action="download">Download edited HTML</button><button type="button" data-action="print-notes">Print notes</button></nav>
<p class="control-status" role="status" aria-live="polite"></p>
<script>(()=>{const slides=[...document.querySelectorAll('.slide')];const status=document.querySelector('.control-status');let current=0;const show=n=>{current=(n+slides.length)%slides.length;slides.forEach((slide,index)=>slide.setAttribute('aria-hidden',String(index!==current)))};const legacyCopy=value=>{const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:-9999px';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy')}catch{}field.remove();return copied};const action={previous:()=>show(current-1),next:()=>show(current+1),notes:()=>{const on=document.documentElement.dataset.notes!=='true';document.documentElement.dataset.notes=String(on);document.querySelector('[data-action="notes"]').setAttribute('aria-pressed',String(on))},edit:()=>{const on=!document.querySelector('.editable[contenteditable="true"]');document.querySelectorAll('.editable').forEach(node=>node.setAttribute('contenteditable',String(on)));document.querySelector('[data-action="edit"]').setAttribute('aria-pressed',String(on))},copy:async()=>{const value=[...slides[current].querySelector('.slide-copy').querySelectorAll('h1,h2,p,li')].map(node=>node.textContent.trim()).filter(Boolean).join('\\n');let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true}}catch{}if(!copied)copied=legacyCopy(value);status.textContent=copied?'Slide text copied.':'Copy unavailable. Select the slide text and copy it manually.';if(!copied){const range=document.createRange();range.selectNodeContents(slides[current].querySelector('.slide-copy'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range)}},download:()=>{const clone=document.documentElement.cloneNode(true);clone.querySelectorAll('[contenteditable]').forEach(node=>node.removeAttribute('contenteditable'));clone.querySelectorAll('[data-action="notes"],[data-action="edit"]').forEach(node=>node.setAttribute('aria-pressed','false'));delete clone.dataset.notes;delete clone.dataset.printMode;clone.querySelector('.control-status').textContent='';clone.querySelectorAll('.slide').forEach((slide,index)=>slide.setAttribute('aria-hidden',String(index!==0)));const blob=new Blob(['<!doctype html>\\n'+clone.outerHTML],{type:'text/html'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='${escapeHtml(pack.id)}-presentation-edited.html';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),0)},'print-notes':()=>{document.documentElement.dataset.printMode='notes';window.print();delete document.documentElement.dataset.printMode}};document.querySelector('.controls').addEventListener('click',event=>{const name=event.target.dataset.action;if(action[name])action[name]()});addEventListener('keydown',event=>{if(event.target instanceof Element&&event.target.closest('input,textarea,select,button,a,[contenteditable="true"]'))return;if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();show(current+1)}if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();show(current-1)}});addEventListener('afterprint',()=>delete document.documentElement.dataset.printMode);show(0)})();</script>
</body></html>`.replace(/[\t ]+$/gmu, '');
}

export function renderLinkedIn(pack, voice, post) {
  const source = post ?? pack.linkedin[voice];
  const tags = pack.linkedin[voice].hashtags.map((tag) => `#${tag.replace(/^#/u, '')}`).join(' ');
  const pieces = post ? [post.title, '', post.copy] : [source.copy];
  if (!source.copy.includes(pack.signupUrl)) pieces.push('', pack.signupUrl);
  if (tags) pieces.push('', tags);
  return `${pieces.join('\n').trim()}\n`;
}
