<!--
GAMMA DECK — paste-ready source
OPDA quarterly tech review · the linked-data evolution of PDTF · 5 June 2026

WHY THIS FILE: the Gamma MCP connector was disconnected when this was generated
(reconnect returned "Server not found"), so this is the manual import path. The
content is identical to what would have been sent to Gamma's generate API.

HOW TO IMPORT INTO GAMMA:
  1. Gamma → Create new → "Paste in text".
  2. Copy everything below the "════ COPY BELOW ════" line and paste it in.
  3. Card split: choose "by divider (---)" (each --- = one card → 12 cards).
     (If Gamma splits on headings instead, that also yields 12 cards — fine.)
  4. Text mode: choose "Preserve" / "Keep as is" — NOT "Generate/Expand".
     IMPORTANT: this deck goes to a real industry body. The statistics and the
     ✅ Built / 🟡 Partial / 🔵 Planned labels must NOT be altered or invented.
  5. Pick a clean, professional theme → Generate.

  Title to set: "From document to data: the linked-data evolution of PDTF"

  (When the Gamma MCP reconnects, just say "try Gamma again" and I'll generate it
  automatically from this same content.)
-->

════ COPY BELOW ════

# From document to data: the linked-data evolution of PDTF

OPDA quarterly tech review · 5 June 2026 · Henrik Pettersen

We've turned the PDTF property-data standard from JSON Schema into a formal, machine-readable, governed semantic model — built with AI, validated and reproducible — and we propose making that model the single source of truth for the standard.

---

# The problem: shape, not meaning

JSON Schema describes a document's shape — not its meaning.

- Can't express real-world **identity** — a UPRN floats across four fields with no join
- Can't express **meaning** — every consumer re-codes the semantics by hand
- No **governance/privacy** classification, no **validation beyond structure**, no **machine reasoning**
- The cost: integration friction, fall-throughs, fraud risk

PDTF today: ~37,000 lines of JSON Schema (v3.x) + a dozen statutory form overlays.

---

# What we're building

A shared, machine-readable foundation for property data.

- One governed model for **identity, meaning, provenance, privacy, roles and validation**
- A foundation that can make standards, forms, APIs and AI more consistent
- Built as an evolution of PDTF — not a parallel standard

---

# The identity crux

One implicit "property" → three precise things.

PDTF conflated them; we split into **Physical Property · Legal Estate · Registered Title**, each with its own identity criterion. UPRN demoted to a contingent identifier — not the identity.

The flagship modelling win.

---

# Roles & authority (RBAC)

People are Kinds that *play* roles — founded by the transaction.

- Buyer, Seller, Conveyancer… modelled as anti-rigid roles, not subclasses
- A clean seam between **asserted capacity** and **evidenced authority** (probate, power of attorney) — PDTF collapsed this into free text
- Enforced by SHACL (a regulated capacity must carry evidenced authority)

🟡 role + authority substrate built · 🔵 machine-readable permission policies (ODRL) next

---

# Governance & privacy

GDPR-grade privacy, in the model.

- Personal data typed with **DPV**; special-category data flagged
- A **SHACL "sensitivity gate"** flags any personal-data field missing its privacy annotation
- 🔵 Consent / lawful-basis policies are the next layer

---

# How we built it: the AI Council

An AI "Linked Data Council" — rigour, not hand-waving.

- AI agents role-play **real, named authorities** (Allemang, Hendler, Guizzardi, Cagle, Baker, Davis…), arguing only from their actual published work
- Mandatory **Devil's Advocate**, recorded **votes**, citations verified
- A human **"directing authority" can override** (and did — kept slash URIs against a 5-2 vote)

28 decision records (ODRs) · ~37 sessions. AI proposes, human disposes — with an audit trail.

---

# Why you can trust it

Deterministic, validated, reproducible.

- **Byte-identity CI gate** — regenerate the model, it must match the committed output exactly
- **8 CI gates**; SHACL 1.2 validation + OWL-RL inference via **Apache Jena**
- A **BASPI5 round-trip**: a real statutory form goes JSON → ontology → validated RDF → JSON, every field traceable to its source

Proves fidelity AND continuity with existing PDTF.

---

# The vision: one model, every artefact

Make the model the single source of truth.

From the model, generate → **JSON Schema · APIs · code · DB schema/DDL · forms · UI/UX · docs**.

Today: the JSON round-trip is proven, and the wider value is reducing drift between artefacts.

"One change propagates everywhere — no drift."

---

# An AI substrate

Linked data makes AI more capable — and we'll ship it.

- The governed model = grounding, provenance, machine-actionable governance for AI
- 🔵 **APIs + locally-installable MCP servers** for member firms (data sovereignty)
- 🔵 **Embeddings + vectors** for semantic search over the standard

---

# What this means for members

- One clearer shared meaning for property data across the ecosystem
- Less bespoke interpretation and re-mapping between firms
- Stronger trust through explicit provenance, governance and machine-checkable rules
- A better foundation for APIs, automation and AI

---

# The takeaway

- This is an evolution of PDTF, not a fork away from it
- The value is clearer meaning, stronger interoperability, and better foundations for automation and AI
- Other complex sectors already use this kind of semantic foundation — OPDA can apply the same discipline to property data

From a document standard to a data standard.
