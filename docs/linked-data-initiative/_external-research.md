# External research — market, audience, PDTF versions, OPDA 2026 vision

> Seed document. Sources are the public record (PDTF GitHub, OPDA website/LinkedIn,
> trade press) plus the quarterly-workshop email thread. Email-based prior-meeting
> research was **blocked** (Gmail connector has insufficient read scope).

## The meeting this feeds (context)

**OPDA quarterly workshop — Fri 2026-06-05, 10:00–11:00** (organiser: Maria Harris,
OPDA Chair, `contact@openpropdata.org.uk`).

**Agenda:**
- Intro to Paul A, Tris, Henrik
- Approve **v3.6 of the data schema** — all
- Update on **sandbox project** — Paul A
- Overview of **API toolkit** — Tris
- **Review of data schema feedback and next steps — Henrik**  ← our slot
- AOB

**Pre-meeting actions** (all attendees): review & approve v3.6 content incl. updated
**TA form alignment**; read & share the sandbox intro + technical guides with dev teams;
email `TechSupport@openpropdata.org.uk` with learnings / implementation & maintenance
challenges with the current data schema (`github.com/Property-Data-Trust-Framework`);
follow OPDA LinkedIn/YouTube and watch the schema-introduction videos.

**Read of Henrik's slot:** it comes immediately after the v3.6 approval. "Review of data
schema feedback and next steps" is the natural place to set out the *technical direction*
— i.e. the linked-data evolution — as the answer to the feedback/challenges the
membership has raised about the JSON-Schema standard.

## Audience (who is on the invite)

This is the **full OPDA Association membership** — a large, senior, cross-industry list
(~150+ invitees). Maria asks attendees to forward to their **data and technical dev
colleagues**, so the effective audience for a technical slot is mixed **senior decision-
makers + data/technical leads**. Pitch: technical but accessible; lead with the problem
each constituency feels.

Sectors represented (with example invited organisations):

- **Lenders / banks / building societies:** HSBC, NatWest, Lloyds Banking Group,
  Santander, Nationwide, Barclays, Bank of Ireland, Co-operative Bank, Skipton BS,
  Leeds BS, Newcastle BS, Aldermore, Atom Bank, Foundation Home Loans, Belmont
  Green / Vida, Generation Home, Roma Finance, InterBay, L&G, Just, Quilter; **BSA**
  (Building Societies Association); servicing/platforms (Phoebus, Finova, Iress).
- **Estate agents / portals:** Connells Group, Rettie, OnTheMarket, Zoopla, Homely,
  Movera, MAB, L&C, SimplyBiz.
- **Conveyancers / legal / searches:** Simply Property Lawyers, Collaborative
  Conveyancing, Lifetime Legal, COPSO (search orgs).
- **Proptech / data / verification:** Coadjute, Sprift, Moverly, **PEXA** (AU), Armalytix,
  Experian, Hometrack, Groundsure, WhenFresh, Nokkel, Sikoia, LMS, TM Group,
  ViewMyChain, Yourkeys, Kotini, InventoryBase, Mast, Adoor, Credas, Click2Check,
  Clozy, Finexer (open banking), Climate-X, OpenProperty, Hello Smoove.
- **Government / public bodies:** **HM Land Registry**, MHCLG / communities.gov.uk
  (Tom Treadwell, Stephen Rhodes), levellingup.gov.uk (Will Bryant), **GeoPlace**,
  Mining Remediation Authority, **CFIT** (Centre for Finance, Innovation & Technology).
- **Strategy / trade bodies:** Novus Strategy, e4 strategic, AMI, MHP.

**Implication for messaging:** lenders & gov care about **trust, fraud, consent,
provenance**; proptech cares about **APIs & interoperability**; conveyancers/agents care
about **forms** (BASPI, TA6/7/10, CON29, LPE1). The linked-data story speaks to all
three: one governed model, machine-validated, that every system can dereference.

## PDTF data-schema version history (public GitHub releases)

Repo: **`github.com/Property-Data-Trust-Framework/schemas`** — "Open data schema for
digital residential property data exchange" (JSON Schema, MIT; ~26★). Active: the
schemas repo and `opda-shared-services` / `opda-shared-infra` were updated 2026-06-03.
(Dates below are GitHub relative-rendered and approximate; ordering is best-effort.)

| Version | ~Date | Highlights |
|---|---|---|
| v2.2.0 | 06 Sep | — |
| v2.3.0 / v2.3.1 | 28 Nov / 07 Dec | v2 line |
| 3.0.0-beta.1 → **v3.0.0** | 31 Jan → 07 Feb | major v3 |
| v3.1.0 | 15 Mar | |
| v3.2.0 | 24 Jul | **BASPI v5** support; conveyancing-quote information; BASPI/PIQ/TA licensing caveats |
| v3.3.0 | 17 Mar | "wide range of small improvements" |
| v3.4.0 | 12 Jun | `participantStatus` (replaces `isRemoved`); chain objects into core; NTS2 overlay (material information) |
| v3.5.0 | 28 Aug | NTS extension overlays; milestones schema (transaction level); draft survey & valuation schemas (property-pack level); overlay-merge fixes |
| **v3.6** | (this workshop) | up for approval Fri 2026-06-05; incl. **updated TA form alignment** |

Other PDTF org repos: `api` (Open API specs), `trust-framework`, `web`,
`smart-data-challenge-2025` (Moverly/OPDA DBT Smart Data Challenge entry),
`opda-shared-services` (Go), `opda-shared-infra` (HCL).

## OPDA 2026 vision & headline stats (for framing)

From OPDA's "Connected Future for Property Data: Setting the 2026 Vision" and roadmap:

- Framing: **"from momentum to mandate"** — systematic change, not incremental tweaks.
- Priorities: scale pilots across regions/transaction types; **embed Digital Property
  Packs** as standard; **universal trust-framework implementation incl. mandatory
  consent-based APIs**; transition **"from PDFs to APIs."**
- **£742,700** government funding for **sandbox** testing of the Smart Property Data
  Trust Framework (ties to Paul A's sandbox agenda item).
- Outcomes claimed in pilots: **~15-day** transactions (vs 3–6 months); **~43%**
  reduction in fall-throughs/fraud; consumer control over data sharing.
- Chair **Maria Harris**: "the property market cannot modernise without fixing its data
  foundations."

**Why this matters for our slot:** the linked-data initiative is exactly "fixing the data
foundations." It is the technical substrate under *consent-based APIs* (machine-readable
governance), *PDFs→APIs* (a model APIs are generated from), and *trust* (provenance +
validation). We connect the technical direction to the published strategic mandate.

## Sources

- https://github.com/Property-Data-Trust-Framework — org & repos
- https://github.com/Property-Data-Trust-Framework/schemas/releases — version history
- https://openpropdata.org.uk/ , /events-and-workshops/ , /for-developers/
- https://openpropdata.org.uk/connected-future-for-property-data-vision-2026/ — 2026 vision
- https://www.linkedin.com/company/open-property-data-association/
- https://propdata.org.uk/ — PDTF reference
- Quarterly-workshop email thread (Maria Harris, 2026-06-01) and Association invitee list
