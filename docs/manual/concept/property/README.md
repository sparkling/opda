# Property

The Property module is the Identity-Criterion crux of OPDA. It distinguishes:

- the **physical Property** (a house, a flat — bricks and mortar);
- the **Legal Estate** vested in it (the rights bundle — Freehold, Leasehold, Commonhold);
- the **Registered Title** that documents the Legal Estate at HMLR;
- the **Address** that locates the Property (in any of several authority-issued forms: title, marketing, INSPIRE).

These four are routinely conflated in property data. OPDA keeps them separate because they have *different* Identity Criteria: a Property can persist while its Title is closed and reopened; a Title can persist through a Lease Extension that mutates (but does not break) the Legal Estate; an Address can change without the Property changing.

This module also contains two reified lifecycle events — **Lease Extension Event** and **UPRN Succession Event** — that record administrative changes which, importantly, do *not* break the underlying Property or Legal Estate identity.

## Entities

- [Address](./address.md) — an authority-issued locator for a Property
- [Lease Extension Event](./lease-extension-event.md) — a statutory lease-extension event that mutates a leasehold's term without breaking its identity
- [Lease Term](./lease-term.md) — the time interval bounding a leasehold tenure
- [Legal Estate](./legal-estate.md) — the bundle of legal rights vested in a Property
- [Property](./property.md) — the physical residential property
- [Registered Title](./registered-title.md) — the HMLR title-register record documenting a Legal Estate
- [UPRN Succession Event](./uprn-succession-event.md) — an administrative re-numbering of a Property's UPRN
