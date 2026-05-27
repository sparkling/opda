# Hendler — solo position on S005

*Solo position file. Allemang is DA this session (`da-solo`), so the usual
pragmatic-pair voice is split — Allemang's 2-class working-ontologist
position is the foil my 3-class case has to clear. Where Allemang is
right, I concede with reasons.*

## Stance summary

The question underneath every sub-question is the one I named in S001 Q1:
**which things get URIs?** Linked Data Principle 1 (Berners-Lee 2006);
Bizer/Heath/Berners-Lee 2009 §2 — integration is co-reference between
URIs, not silent merger. If a thing has its own lifecycle in a primary
authority's data, it gets a URI. That is the test S005 must apply to the
2-vs-3 question.

My S001 Q4 position stands: **three classes** — physical `opda:Property`,
legal-institutional `opda:LegalEstate`, and HMLR's record-of-the-estate
`opda:RegisteredTitle`. The case is empirical — multi-title flats, the
lease-extension scenario, and UPRN succession together demonstrate that
the count of physical properties, the count of legal estates, and the
count of registered titles diverge in real PDTF data. Three lifecycles,
three URI-bearing things, three classes.

Allemang DA's 2-class position (Property + LegalEstate, with
`hasLegalEstate`) is operationally simpler and, on the registered-
freehold-house exemplar alone, fully adequate — *Working Ontologist* 3rd
ed. Ch. 6 would not mint `RegisteredTitle` without naming a consumer that
fails without it. My defence below names that consumer (the lease-
extension/title-charge scenario). If the multi-title-flat hard case were
not in the canonical set, I would concede.

UPRN: concur Guarino — contingent administrative identifier under
`prov:wasDerivedFrom` succession; concur Cagle — `dash:uniqueValueForClass`
on `opda:uprn` is the **operational primary**. Complementary, not competing.

---

## Per-question positions

### Q1 — Endurant commitment

Each class commits to a DOLCE category explicitly:

- `opda:Property` — **DOLCE Endurant / Physical Object** (spatial-material
  continuity bears the IC).
- `opda:LegalEstate` — **Non-Physical Endurant** (legal-institutional
  object in Searle 1995 *Construction of Social Reality* sense; vested
  in a Person/Org; persists across rebuild).
- `opda:RegisteredTitle` — **Non-Physical Endurant** (HMLR record-entity;
  persists across UPRN re-issue; closed/merged by registry action only).

No Kind-pretending-to-be-something-else (Guarino S001 Q4 anchor).
**Vote: FOR.**

### Q2 — IC for physical Property

IC = **spatial-material continuity of a built dwelling on a parcel**.
Holds across rebuild (with continuous footprint) and renovation; fails
on demolition (Guarino *FOIS* 1998 §IC-over-destruction); broken by
subdivision and merger (parts/merged are new individuals). UPRN is **not**
the IC — contingent identifier (Guarino S001 Q4, accepted).
`dash:uniqueValueForClass` is operational primary (Cagle); succession via
`prov:wasDerivedFrom`. No `owl:sameAs` (unanimous S001 Q4 —
inference propagation).
**Vote: FOR.**

### Q3 — IC for LegalEstate / RegisteredTitle

Two distinct ICs:

- **LegalEstate IC** = the bundle of rights vested in a proprietor over a
  parcel under a tenure regime. Exists *before* first registration
  (unregistered-pre-first-registration exemplar). Persists across
  assignment; survives HMLR record corrections.
- **RegisteredTitle IC** = a record-entity in HMLR's register, opened by
  first registration, identified by title number, closed by Registry
  action. Persists across sale (Proprietorship Register update), charge
  (Charges Register update), and UPRN re-issue in the parent Property
  (flat-with-split-UPRN). Title number is the operational primary key
  via `dash:uniqueValueForClass` on `opda:titleNumber`.

**Vote: FOR.**

### Q4 — UPRN status

UPRN is a **scheme-scoped contingent identifier**, not an IC. Modelled as:

- `opda:uprn` `DatatypeProperty` on `opda:Property`, `xsd:string`;
- `dash:uniqueValueForClass true` as **checkable operational primary**
  (Cagle/SHACL trio; the unrebutted S001 Q4 challenge to Guizzardi);
- `prov:wasDerivedFrom` for retire/split/merge/re-issue (the flat-with-
  split-UPRN exemplar's reified `opda:UPRNSuccessionEvent` is the carrier);
- `owl:hasKey` declined as primary — inert when UPRN absent (unregistered-
  pre-first-registration exemplar). Optional/secondary annotation only.

No `owl:sameAs` between UPRN-bearing nodes (unanimous S001 Q4).
**Vote: FOR.**

### Q5 — 2- vs 3-class split

**THREE.** Property + LegalEstate + RegisteredTitle. Empirical case
below in §"The 3-class defence" — multi-title flats break the cardinality
of any 2-class fusion (1 Property, 2 LegalEstates, 2 RegisteredTitles);
lease-extension scenarios put properties on the title-record that have
no defensible 2-class home.
**Vote: FOR three.**

### Q6 — Address-as-mode-of-presentation

Address is **not** an IC — it is, in Frege *Über Sinn und Bedeutung*
sense, a mode of presentation: a string by which a Property is referred
to, governed by Royal Mail PAF and LLPG. `opda:postalAddress` is a
literal-valued `DatatypeProperty` on `opda:Property`, NOT a class.
Addresses mutate independently of physical identity (street renaming
does not create a new Property). Address-as-IC fails on the same grounds
as UPRN-as-IC. Structured address parsing is ODR-0008 work, not S005.
**Vote: FOR.**

### Q7 — Exemplar pass

The three canonical exemplars discharge the S004 Q6 gate **if** the
adopted answer is the 3-class split:

- **registered-freehold-house** — Property + RegisteredTitle with
  `opda:identifiesSameProperty` (already wired). On 3-class, promote
  `opda:tenureKind "freehold"` to a `LegalEstate` individual. Passes both
  2- and 3-class.
- **unregistered-pre-first-registration-house** — Property only; no UPRN;
  no title. Critical IC test (S001 Q4 Guarino + Cagle graceful-degradation):
  Property IC must hold without legal anchor and without UPRN. On
  3-class, when first registration later completes the LegalEstate and
  RegisteredTitle individuals appear and co-refer — **the Property
  individual persists**. Passes.
- **flat-with-split-UPRN** — One Property whose current UPRN was derived
  from a predecessor; `prov:wasDerivedFrom`; no `owl:sameAs`. Leasehold
  title co-refers. Passes.

**Gap.** The flat-with-split-UPRN scope-note (line 21) *names* the
multi-title parallel case but its TTL models only one title. If the
2-vs-3 question is contested, extending that exemplar — or adding a
fourth `multi-title-flat.ttl` per S004 Q6 append-only discipline — makes
the case mechanical rather than deliberative.
**Vote: FOR (gate-pass) with proposed exemplar extension.**

### Q8 — Gate clearance

Clears if Q1-Q7 close as above. ODR-0005 §Gate-clearance criteria (a)-(c):

- (a) Explicit DOLCE category per class — Q1 commits these.
- (b) Stated IC over the hard case — Q2 (subdivision, absence); Q3
  (pre-first-registration persistence, UPRN-succession persistence).
- (c) UPRN keys via `dash:uniqueValueForClass`; degrades gracefully;
  succession via `prov:wasDerivedFrom`; no `owl:sameAs` — Q4.

Programme consequence: ODR-0006/0007/0008 move from planning to drafting.
Guarino S001 Q4 dissent withdraws iff the Q2-Q3 ICs hold — they do.
**Vote: FOR clearance, conditional on Q1-Q7.**

---

## The 3-class defence (depth)

The case for `RegisteredTitle` as its own class — distinct from
`LegalEstate` — is empirical, not aesthetic.

**Multi-title flat (the cardinality case).** A leasehold flat in a
converted Victorian house: **one** physical Property (one front door,
one council-tax band, one UPRN). **Two** LegalEstates vested in the same
proprietor — the leasehold of the flat, and a share-of-freehold in the
building (modern convention; the freeholder is a flat-management company
in which each leaseholder owns a share). **Two** RegisteredTitle records
— leasehold title `TGL654321` opened in 2022 when the building was
converted, and the building's freehold title `TGL000001` opened in 1948.
Three independent counts. A 2-class model collapses two of them and
cannot recover the missing dimension — LegalEstate-event time (the
share-of-freehold being created in 2022) and RegisteredTitle-event time
(`TGL654321` being opened a month later) are genuinely distinct facts.

**Lease-extension scenario (the consumer-fails case — Allemang's
challenge).** A buyer is purchasing a leasehold flat. The conveyancer's
Charges Register inspection shows the title was charged by a mortgage in
2018 (`opda:lastRegistryEvent` in registered-freehold-house.ttl line 36).
The buyer's lender will not lend against an undischarged charge. The
fact that determines the buyer's next step is **a property of the
RegisteredTitle record**: title `BM123456` has charge state `charged`.

- It is *not* a property of the physical Property. The dwelling has not
  changed.
- It is *not* a property of the LegalEstate. The leasehold interest's
  extent and holder have not changed.
- It *is* a property of the HMLR record-entity that opened in 1998, was
  updated by a Charges Register entry on 2018-05-12, and may or may not
  carry a release-of-charge entry before completion.

In a 2-class model fusing LegalEstate and RegisteredTitle, you have to
attach `wasChargedOn 2018-05-12` to either the LegalEstate (wrong — the
leasehold interest was not charged; the title-as-collateral was) or to
the Property (wrong — the dwelling was not charged). The 3-class model
gives you the right place: `opda:RegisteredTitle TGL654321 →
opda:chargeEvent → [Charges Register entry 2018-05-12]`.

**Lifecycle argument (the URI-test).** Linked Data Principle 1 — URIs
identify things. The test: does it have its own lifecycle, separate
from the things it relates to? RegisteredTitle has: opened (first
registration); updated (Proprietorship change on sale; Charges entry on
mortgage; A Register correction); closed (merger, voluntary
deregistration, error correction issuing a fresh title number); merged.
The Property does not have these events. The LegalEstate does not have
these events. HMLR's record does. **Three lifecycles → three classes →
three URI-bearing entities.**

---

## DA anticipation

**Allemang DA's central attack** (working-ontologist 2-class):
*"Show me a consumer that fails without RegisteredTitle as a class.
2-class is simpler — fewer URIs, fewer co-reference predicates, fewer
shapes. The lease-extension case can be modelled with LegalEstate
carrying a `charged-by-mortgage` annotation. Working Ontologist Ch. 6:
don't mint classes you don't need."*

**Reply.** The consumer that fails is the conveyancing-decision consumer
(§ Lease-extension above). LegalEstate-with-charge-annotation is a
category error — Searle 1995 Ch. 2: the charge is *constituted by* the
HMLR register entry, not by anything inherent in the leasehold interest.
The discharge of the charge is a registry action, not a change to the
leasehold.

The 2-class model survives the registered-freehold-house and unregistered-
pre-first-registration exemplars adequately. It fails the multi-title
flat (Q5 cardinality) and the lease-extension case that registered-
freehold-house.ttl line 36 already gestures at. Both are canonical PDTF
cases.

**Where I concede.** If the panel rules that lease-extension is
adequately modelled with LegalEstate carrying a charge-state predicate
AND multi-title-flat handled with two co-referring LegalEstate individuals
distinguished by `dct:identifier` title-number, then the 3-class case
reduces to stylistic preference and Allemang DA's parsimony wins. WO
Ch. 6 discipline: don't mint what you don't need.

**Where I do not concede.** The flat-with-split-UPRN scope-note line 21
already names the multi-title parallel case as evidence that *forces*
the question. If S005 declines to extend that exemplar to model both
titles, the 2-class answer wins on parsimony — but the multi-title-flat
hard case re-appears downstream in ODR-0006 (Proprietorship Relator over
multi-title flats) or ODR-0007 (Transaction with separate
freehold-share-transfer and leasehold-assignment milestones), and the
panel re-opens this question with less authority.

**Engaging the other named alternatives:**

- **Guarino DA — Site/BuiltStructure + LegalEstate (2-endurant, time-
  indexed `realises`/`vests-in`).** I take Guarino's IC discipline as the
  floor — Q1-Q3 satisfy it. The 3-class case *extends* the discipline:
  Site maps to my Property; LegalEstate maps to mine; RegisteredTitle is
  a third Non-Physical Endurant whose IC (Q3) Guarino's 2-endurant
  carving does not name but does not preclude. Same IC bar; one more
  class to defend.
- **Kendall — FIBO LEI-pattern (single class with alternative
  identifiers).** Right pattern for *agents* (ODR-0006 Person/Org
  identified by LEI / Companies House / VAT). Strains when physical
  referent and legal interest diverge (multi-title flat, commonhold —
  ODR-0005 Alternatives line 60). Does not generalise here.
- **Guizzardi — UFO Kind/Role/Phase (is Title a Phase of LegalEstate?).**
  RegisteredTitle is a Kind, not a Phase. A Phase cannot survive
  destruction of its bearer (Guizzardi 2005 §4.3); RegisteredTitle
  persists when its LegalEstate is reassigned and persists across UPRN
  re-issue of the parent Property. Sibling-Kind to LegalEstate, not Phase.

---

## Solo vote summary

| Q | Position | Vote |
|---|---|---|
| Q1 — Endurant commitment | 3 DOLCE categories made explicit | **FOR** |
| Q2 — IC for Property | Spatial-material continuity; UPRN not IC | **FOR** |
| Q3 — IC for LegalEstate / RegisteredTitle | Two distinct ICs | **FOR** |
| Q4 — UPRN status | Contingent + DASH primary; no `owl:sameAs` | **FOR** |
| Q5 — 2-vs-3 class split | **THREE** | **FOR 3** |
| Q6 — Address-as-mode-of-presentation | Literal; not IC; not class | **FOR** |
| Q7 — Exemplar pass | Pass, with proposed `multi-title-flat.ttl` extension | **FOR** |
| Q8 — Gate clearance | Conditional on Q1-Q7; Guarino S001 Q4 withdraws | **FOR** |
