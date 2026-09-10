import { marketingPacks } from './packs.mjs';
import { operationalEmails } from './operational-emails.mjs';

// One asset identity per post, shared by generation, page composition and the
// exact preview allowlist. Aggregate exports remain valid existing URLs.
export function linkedInPostAssets(pack, voice) {
  return pack.linkedin[voice].posts.map((post, index) => {
    const stem = `${voice}-${String(index + 1).padStart(2, '0')}-${post.id}`;
    const base = `/marketing/${pack.id}/linkedin/${stem}`;
    return { post, index, stem, html: `${base}.html`, text: `${base}.txt` };
  });
}

const permitted = new Set([
  ...operationalEmails.map(({ preview }) => preview),
  '/marketing/general/email/employer.html',
  ...marketingPacks.flatMap((pack) => [
    ...['email/member', 'email/opda', 'email/personal', 'newsletter/short', 'newsletter/long', 'linkedin/opda', 'linkedin/partner']
      .map((name) => `/marketing/${pack.id}/${name}.html`),
    ...['opda', 'partner'].flatMap((voice) => linkedInPostAssets(pack, voice).map(({ html }) => html)),
  ]),
]);

export function isMarketingPreviewPath(value) {
  return typeof value === 'string' && permitted.has(value);
}
