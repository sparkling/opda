"""Build the local, offline image-style comparison; makes no API requests."""
import argparse
import base64
import html
import json
import io
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--route', choices=['api', 'subscription'], default='api')
args = parser.parse_args()
is_api = args.route == 'api'
route_label = 'API' if is_api else 'Subscription'
DATA = ROOT / ('docs/previews/evidence-2-5' if is_api else 'docs/previews/evidence-subscription')
TARGET = ROOT / ('docs/previews/evidence-shared-meaning-11-styles.html' if is_api else 'docs/previews/evidence-shared-meaning-subscription.html')
other_page = 'evidence-shared-meaning-subscription.html' if is_api else 'evidence-shared-meaning-11-styles.html'
manifest = json.loads((ROOT / 'docs/previews/evidence-2-5/prompts.json').read_text())
reviews_file = DATA / 'reviews.json'
reviews = json.loads(reviews_file.read_text()) if reviews_file.exists() else {}
esc = html.escape
cards = []
ready = 0
for style in manifest['styles']:
    image = DATA / f"{style['index']:02d}-{style['id']}.webp"
    if not image.exists():
        image = image.with_suffix('.png')
    note = reviews.get(style['id'], 'Generated; visual review pending.' if image.exists() else 'Generation pending; no preview yet.')
    if image.exists():
        ready += 1
        with Image.open(image) as rendition:
            rendition.thumbnail((1280, 1024))
            buffer = io.BytesIO()
            rendition.save(buffer, format='WEBP', quality=85)
        encoded = base64.b64encode(buffer.getvalue()).decode()
        visual = f'<button class="preview" aria-label="Enlarge {esc(style["title"])}"><img loading="lazy" src="data:image/webp;base64,{encoded}" alt="{esc(style["title"])} treatment of the six-stage evidence and review process"></button>'
    else:
        visual = '<p class="pending">Preview pending</p>'
    prompt_html = esc(style['prompt']).replace('\n', '&#10;')
    cards.append(f'''<article id="{esc(style['id'])}">
<header><span>{style['index']:02d} / {esc(style['type'])}</span><h2>{esc(style['title'])}</h2></header>
{visual}
<div class="description"><p><a href="{other_page}#{esc(style["id"])}">Compare this style on the other route</a></p><p>{esc(style['description'])}</p><p class="review"><strong>Review:</strong> {esc(note)}</p><p class="risk">{esc(style['risk'])}</p>
<details><summary>Exact image prompt</summary><pre>{prompt_html}</pre></details></div>
</article>''')
nav = ''.join(f'<a href="#{esc(s["id"])}">{s["index"]:02d} {esc(s["title"])}</a>' for s in manifest['styles'])
sources = ''.join(f'<li><a href="{esc(url)}">{esc(url)}</a></li>' for url in manifest['sources'])
page = '''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>From evidence to shared meaning — 20 style previews</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f9f9f9;color:#231f2f;font:16px/1.55 system-ui,sans-serif}main{max-width:1440px;margin:auto;padding:40px 24px}h1{font:clamp(32px,5vw,60px)/1.06 Georgia,serif;max-width:1000px}h2{font-size:24px;margin:8px 0}p{max-width:95ch}a{color:#0b6e64}header span,.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0e8478;font-weight:700}nav{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0}nav a{font-size:13px;padding:6px 10px;background:#ece9f3;border-radius:4px;text-decoration:none}article{margin:44px 0;border-top:2px solid #231f2f;scroll-margin-top:20px}article header{padding:20px 0}.preview{display:block;width:100%;border:0;padding:0;background:white;cursor:zoom-in}img{display:block;width:100%;height:auto}.description{padding:8px 0 20px}.review{border-left:3px solid #0e8478;padding-left:14px}.risk{color:#655e70;font-size:14px}summary{cursor:pointer;font-weight:650}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 ui-monospace,monospace;background:#eeecf1;padding:20px}details{margin:16px 0}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #d6d0df}th{background:#eeecf1}dialog{border:0;padding:16px;width:min(1500px,96vw);max-height:95vh}dialog::backdrop{background:#231f2fcc}dialog button{padding:8px 16px;margin-bottom:12px;cursor:pointer}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #6c5bd4;outline-offset:3px}.pending{padding:50px;background:#eeecf1}footer{border-top:1px solid #ccc;padding-top:20px;font-size:14px}@media(max-width:600px){main{padding:24px 12px}th,td{padding:8px;font-size:12px}}@media print{nav,details,dialog{display:none}article{break-inside:avoid}}
</style><main>
<p class="eyebrow">OPDA · Local exploration · 12 September 2026</p>
<h1>From evidence to shared meaning</h1>
<p>Twenty distinct visual treatments of one process. Wide artwork, one image per row. Every label and arrow is generated inside the image. The homepage remains unchanged.</p>
'''
page += f'<p class="eyebrow">{route_label} gallery · <a href="{other_page}">Open the other gallery</a></p>'
settings = f'Requested model: {esc(manifest["model"])}; requested quality: high; size: auto.' if is_api else 'Built-in subscription image tool; no model, quality or resolution selector is exposed. Effective model is unverified.'
page += f'<p><strong>{ready} / 20 images generated.</strong> {settings} Both routes receive the same twenty prompts, including a wide 1280 × 512 target. These are route comparisons, not a verified comparison of specific model versions.</p>'
page += '''<p><strong>Required process:</strong> Source material → Prepare candidate → Publish candidate → Working-group review → Collect feedback → Prepare candidate. A separate consensus exit runs from Working-group review → Draft standard. A draft is not ratified or adopted.</p>
<details><summary>Adversarial prompt review and changes</summary>
<table><tr><th>Failure in the earlier briefs</th><th>Why it matters</th><th>Revised prompt</th></tr>
<tr><td>“Visible feedback loop” without attachment points</td><td>Allows reversed arrows and review-to-prepare shortcuts</td><td>Six enumerated edges, explicit entry/exit sides, arrowhead destinations and node degree checks</td></tr>
<tr><td>“Not production art” alongside exact process requirements</td><td>Weakens the priority of semantic accuracy</td><td>Relationships and words take priority over decoration</td></tr>
<tr><td>Style label appended to a generic box template</td><td>Different media collapse into the same clip-art layout</td><td>Material, edge character, light, depth and visual form specified for each treatment</td></tr>
<tr><td>Many overlapping print and paper combinations</td><td>Inflates the count without testing distinct choices</td><td>Twenty deliberate treatments; technique and composition type labelled separately</td></tr>
<tr><td>Generic clay description for the marketing reference</td><td>Misses architectural precision and realistic miniature people</td><td>Actual property-technology image supplied for the diorama; its role is style only</td></tr>
<tr><td>3:2 composition and two-column display</td><td>Cramped loop and small lettering</td><td>Wide 2.5:1 composition requested; single-column comparison</td></tr>
<tr><td>Texture or physical objects compete with text and arrows</td><td>Destinations become ambiguous</td><td>Clean label areas, reserved connector space and consistent arrow geometry</td></tr>
</table><p>Acceptance checks: six unique headings; six correct directed edges; three exact arrow labels; no invented approval; readable text; unclipped wide composition; visible distinction between styles. The semantic layout is held constant; the material and representation vary.</p></details>
'''
page += '<details><summary>Model and output provenance</summary><p>For the API gallery, the native OpenAI API recognises the requested Sunburst model ID. Requests explicitly use that ID. The pilot image reports gpt-image version 2.0 in its C2PA softwareAgent field; the mapping of that field to the API model remains unresolved. Automatic sizing returned 1983 × 793 for the pilot; gallery renditions are reduced proportionally to at most 1280 pixels wide. Original outputs are retained.</p></details>'
if is_api and manifest.get('investigation'):
    investigation = manifest['investigation']
    page += '<details><summary>Source and impact of the mismatch</summary><p>' + esc(investigation['causeBoundary']) + '</p><ul>' + ''.join('<li>' + esc(item) + '</li>' for item in investigation['impact']) + '</ul><p>' + esc(investigation['vendorFixStatus']) + '</p><p>' + esc(investigation['localCorrection']) + '</p><ul>' + ''.join(f'<li><a href="{esc(url)}">{esc(url)}</a></li>' for url in investigation['sources']) + '</ul></details>'
page += '<nav aria-label="Style index">' + nav + '</nav>' + '\n'.join(cards)
page += '<footer><details><summary>Research sources and method</summary><p>OpenAI guidance informs prompt structure, reference roles and targeted editing. Printmaking sources inform visual material distinctions. The twenty recipes are original design proposals, not an official model style catalogue. No claim of independent multi-agent review is made.</p><ul>' + sources + '</ul></details><p>Previous gallery and superseded images are retained. Local preview only.</p></footer></main>'
page += '''<dialog aria-label="Enlarged preview"><button type="button">Close</button><img alt=""></dialog>
<script>
const dialog=document.querySelector('dialog');
document.querySelectorAll('.preview').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');const target=dialog.querySelector('img');target.src=source.src;target.alt=source.alt;dialog.showModal()}));
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
</script></html>'''
TARGET.write_text(page)
print(f'Built {TARGET}: {ready}/20 images; {len(page):,} characters')
