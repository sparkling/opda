---
title: "Microsoft Teams channel-post design system"
purpose: "Define a reusable, accessible visual and editorial system for OPDA working-group posts rendered through Microsoft Teams HTML."
owner: "Smart Property Data Trust Framework"
status: "Active"
last_updated: "2026-07-29"
---

# Microsoft Teams channel-post design system

## Scope

This design system applies to official OPDA posts in Microsoft Teams channels,
including announcements, participation instructions, model-review notices, evidence
requests and release updates.

It is intentionally separate from the OPDA website design system. Teams renders only a
sanitised subset of HTML and does not support the website's CSS, fonts, layout
components or JavaScript. The Teams system therefore creates hierarchy through
structure, language, spacing and semantic markers rather than custom styling.

The reference implementation is the
[Finance and Banking source-material intake guide](https://teams.microsoft.com/l/message/19%3A8cc5e0e244a046fb9a737d9a041489bc%40thread.tacv2/1785176392072?groupId=5f9b7675-328a-44fd-8df7-4755096b7629&tenantId=143540d4-4fbc-4005-882a-29656cd01a36&createdTime=1785176392072&parentMessageId=1785176392072).

## Design principles

1. **Action before detail.** Readers should understand what the post is for and what
   they need to do within the first screen.
2. **Supported structure.** Use paragraphs, bold section labels, lists and descriptive
   links; never imitate layout with repeated spaces.
3. **Calm authority.** Use plain language, sentence case and concise instructions.
4. **Progressive disclosure.** Start with orientation, then action steps, permissions,
   restrictions and background.
5. **Accessible without colour.** Icons reinforce written labels but never carry
   meaning alone.
6. **Native Teams rendering.** Prefer simple HTML that works in desktop, web, mobile,
   light mode and dark mode.
7. **One authoritative post.** Publish a completed message in one operation. If a
   material redesign is required, publish a replacement and make the old post a short
   pointer.

## Visual language

### Hierarchy

| Level | HTML | Use |
|---|---|---|
| Title | Native Teams announcement title | One clear, action-oriented title per post |
| Context | `<p><strong>…</strong><br>…</p>` | Working group or programme followed by a one-sentence purpose |
| Section | `<p><br><strong>📤 UPPERCASE LABEL</strong></p>` | A body-sized, bold section label with one deliberate line of separation above it; Teams does not reliably support HTML heading elements or CSS margins |
| Body | `<p>` | Short explanatory copy |
| Sequence | `<ol><li>…</li></ol>` | Ordered tasks or stages |
| Collection | `<ul><li>…</li></ul>` | Rules, examples, permissions or exclusions |
| Inline emphasis | `<strong>` | Labels, decisions and critical phrases |
| Navigation | `<a href="…">descriptive text</a>` | Actionable destinations |

Do not skip from the title directly into a long list. Give the reader one sentence of
context first.

### Semantic markers

Use at most one marker per line and always pair it with a written label.

| Marker | Meaning | Example label |
|---|---|---|
| `📥` | Intake or submission | Source material intake |
| `🔒` | Access or privacy | Invitation only |
| `🏢` | Organisation boundary | Company accounts only |
| `📁` | File or evidence location | Your organisation's area |
| `💬` | Discussion | Questions and model feedback |
| `✉️` | Private administration | Access requests |
| `✅` | Allowed or complete | You can upload files |
| `⚠️` | Important caution | Upload existing files only |
| `🚫` or `⛔` | Prohibited | Do not submit personal data |

Icons are not decoration. Omit them when they do not improve scanning or reinforce a
clear meaning.

### Tone

- Use British English.
- Address the reader as "you".
- Prefer verbs: **open**, **upload**, **review**, **reply**, **contact**.
- Use concise uppercase wording for body section labels so they remain visibly
  distinct at the normal Teams font size.
- Keep paragraphs to one idea and normally fewer than three sentences.
- State restrictions directly, then explain why where useful.
- Avoid jargon unless the post defines it immediately.
- Never imply that AI output is authoritative or that source files will be published
  automatically.

## Standard post anatomy

Use this order unless the post has a clear reason to differ:

1. **Title** — icon plus specific subject.
2. **Context** — working group and one-sentence purpose.
3. **Before you begin** — access, eligibility or prerequisites.
4. **Primary action** — numbered steps.
5. **Next communication action** — where to discuss or provide context.
6. **Permissions and limits** — paired allowed/prohibited lists.
7. **Examples** — suitable inputs, expected evidence or review scope.
8. **Hard exclusions** — security, confidentiality and legal restrictions.
9. **What happens next** — processing, review and governance.
10. **Contact footer** — public discussion route and private administrative route.

## Safe HTML profile

### Preferred elements

Use:

- `<p>` and `<br>`;
- `<strong>` and sparing `<em>`;
- `<ol>`, `<ul>` and `<li>`;
- `<a href="…">`;
- `<blockquote>` for a small number of important callouts;
- Teams-supported mention, emoji and attachment markup when deliberately required.

### Do not use

Do not use:

- `<h1>` through `<h6>`; Teams does not support them reliably and may render them
  smaller than surrounding body text;
- `<style>`, `style="…"`, classes or custom fonts;
- JavaScript, event handlers, forms or embedded applications;
- layout tables, columns, floats or positioning;
- colour as the only indicator of meaning;
- raw URLs as link labels when descriptive text is possible;
- decorative ASCII boxes or repeated spaces;
- unsupported webpage components copied from the OPDA site.

Teams may remove unsupported markup. A post must remain understandable after
sanitisation.

## Canonical HTML template

```html
<p><strong>Working group name</strong><br>
One sentence explaining why this post matters.</p>

<p><br><strong>🔒 BEFORE YOU BEGIN</strong></p>
<p>🔒 <strong>Access label.</strong> Plain-language access rule.<br>
🏢 <strong>Eligibility label.</strong> Plain-language eligibility rule.</p>

<p><br><strong>1 · FIRST ACTION</strong></p>
<p>Short explanation with a <a href="https://example.org">descriptive link</a>.</p>

<p><br><strong>2 · COMPLETE THE TASK</strong></p>
<ol>
  <li>First concrete step.</li>
  <li>Second concrete step.</li>
  <li>Confirmation or expected result.</li>
</ol>

<p>⚠️ <strong>Important:</strong> concise caution or boundary.</p>

<p><br><strong>✅ WHAT YOU CAN AND CANNOT DO</strong></p>
<ul>
  <li>✅ Allowed action.</li>
  <li>🚫 Prohibited action.</li>
</ul>

<p><br><strong>WHAT HAPPENS NEXT</strong></p>
<p>Explain processing, review, ownership and the next visible outcome.</p>

<p>💬 <strong>Questions and discussion:</strong>
<a href="https://example.org/discussion">use the relevant Teams channel</a>.<br>
✉️ <strong>Private administration:</strong>
email <a href="mailto:smartdata@openpropdata.org.uk">smartdata@openpropdata.org.uk</a>.</p>
```

## Publishing contract

Publish channel HTML through Microsoft Graph using:

```json
{
  "body": {
    "contentType": "html",
    "content": "<p><br><strong>📤 SECTION LABEL</strong></p><p>…</p>"
  }
}
```

Rules:

1. Post using the dedicated `smartdata@openpropdata.org.uk` account.
2. Construct the complete HTML before publishing.
3. Send the message directly through Microsoft Graph with
   `body.contentType = "html"`.
4. Do not edit only `body.content` through the CLI: that can reset the stored content
   type to `text` and expose the HTML tags.
5. For a substantial revision, publish a replacement and make the old message a short
   plain-text pointer unless deletion is available.
6. Never place credentials, access tokens or application secrets in the post source or
   repository.

## Validation checklist

Before treating a post as authoritative, verify:

- [ ] the raw Microsoft Graph response reports `body.contentType` as `html`;
- [ ] the author is **Smart Property Data Trust Framework**;
- [ ] the title and first action are visible without expanding the message;
- [ ] bold section labels, lists and links render rather than appearing as tags;
- [ ] every icon has an accompanying text label;
- [ ] links use descriptive labels and open the intended destination;
- [ ] the public discussion route and private contact route are distinct;
- [ ] no personal email address appears;
- [ ] no personal data, credentials, secrets or restricted material appears;
- [ ] permissions and prohibitions match the underlying Teams and SharePoint controls;
- [ ] obsolete copies point to the single authoritative post.

## Governance

This file is the source of truth for OPDA Teams-channel post presentation. It governs
visual and editorial consistency only; access control, moderation, evidence handling
and retention remain governed by their respective ADRs and Microsoft 365 settings.

Update this design system when Teams' supported rendering model or the OPDA operating
model changes. Test changes in a non-authoritative message before adopting new markup.
