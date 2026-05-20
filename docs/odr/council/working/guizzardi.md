# Guizzardi — Council Session 001 Working Position

**Expert:** Giancarlo Guizzardi (NEMO / Free University of Bozen-Bolzano). UFO / OntoUML; ontological foundations for conceptual modelling; identity, rigidity, and the Kind/SubKind/Role/Phase taxonomy.

A foreword, because it governs everything below. The PDTF v3 schema is a *document* model that has been mistaken for a *world* model. Its aggregation tree (Transaction → propertyPack → ...) records who-typed-what-into-which-form. An ontology must instead commit to what *exists* and what *supplies identity to* what. The single most important act of this conversion is to recover the substance sortals the JSON hides — and the Property defect (Q4) is exactly that act. I will be more aggressive than Allemang's pragmatism here, and I expect to part company with Guarino on *which* foundational apparatus does the recovering.

## Q1 — Namespace / URI strategy

**Position.** One `opda:` namespace for the foundational TBox (the Kind backbone), with sub-namespaces or at least a disciplined naming convention separating the **sortal layer** (`opda:Property`, `opda:Person`, `opda:RegisteredTitle`) from the **role/phase layer** (`opda:Seller`, `opda:Proprietor`, `opda:Buyer`). This is not cosmetic: a reader must be able to see, from the URI alone, whether a class carries its own identity criterion or borrows one.

**Reasoning.** In OntoUML the most consequential modelling error is the *role-as-kind* conflation, and a flat namespace invites it. Segregating the layers makes the rigidity contract legible.

**Vote.** In favour of a single canonical `opda:` namespace, conditional on layer-segregated naming. **8-0-1** anticipated.

**Challenge.** If the team flattens everything into one undifferentiated bag of classes, I withdraw support — the namespace would then actively conceal the distinction the ontology exists to make.

## Q2 — Vocabulary catalogue (Core + DASH + PROV-O + DPV family + ODRL; BBO excluded)

**Position.** Endorse the mandated set. On the *decide* vocabularies: **adopt OWL-Time** (Conditional), **defer SSSOM/SEMAPV and DCAT**, **defer ArchiMate**.

**Reasoning.** OWL-Time earns its place because the register extracts are saturated with temporally-indexed facts (`currentProprietorshipDate`, `editionDate`, `officialCopyDateTime`, lease `startYearOfLease`/`lengthOfLeaseInYears`). Proprietorship is a *phased* relation — a title has a proprietor *during an interval* — and without interval semantics you cannot model that a Phase holds over time rather than eternally. This is foundational, not decorative. SSSOM/SEMAPV are mapping-record machinery with no consumer this round (TBox only, no instances). ArchiMate models capability/intent, which is orthogonal to a substance ontology of property.

**Vote.** **9-0** on the mandated core. OWL-Time adoption: I push for it; I expect Allemang and Davis to want a concrete consumer first, so realistically **6-3**.

**Challenge (to the moderator).** Adopting PROV-O while *deferring* OWL-Time is incoherent if we are serious about provenance: `prov:atTime` is an instant, but the verified-claims evidence and proprietorship facts need *intervals*. Do not adopt half the temporal story.

## Q3 — Partition of the model

**Position.** Partition by **UFO meta-category, not by JSON aggregation tree**. Three strata:

1. **Substance Kinds** (rigid, identity-supplying): `Property`, `Person`, `Organisation`, `Building`, `RegisteredTitle`, `Document`.
2. **Roles & Phases** (anti-rigid, relationally/temporally dependent): `Seller`, `Buyer`, `Proprietor`, `Conveyancer`, `Lender`, plus phases like `MarketedProperty`.
3. **Relators & Claims** (the truth-makers that *found* the roles): `Transaction`, `Conveyance`, `VerifiedClaim`, `Proprietorship`.

**Reasoning.** This is the OntoUML layering directly: Kinds first because every object must instantiate exactly one Kind that gives it its principle of identity; Roles and Phases sit atop because they are *moment-dependent* — a thing is a Seller only while a Transaction relator binds it. Partitioning by the propertyPack tree instead would scatter one Kind (the Property) across four identity surfaces (Q4) and bury `RegisteredTitle` inside `titlesToBeSold[].registerExtract` — exactly the defect we are convened to fix.

**Vote.** In favour. **7-1-1** anticipated — I expect Guarino to prefer a DOLCE-style endurant/perdurant cut at the top rather than my Kind-first sortal cut. That tension is real and I will not paper over it (see Q4).

**Challenge.** A partition that mirrors the schema's mereology is a *documentation patch*, not an ontology. Reject it.

## Q4 — The Property defect (my central contribution)

**Position — the categorisations, stated as commitments:**

- **`opda:Property` is a Kind.** Rigid, and the *supplier of identity*. It is the substance sortal every other surface is *about*. The defect named on schema page 37 — four leaves (`propertyPack.uprn`, `energyEfficiency.certificate.uprn`, `chain.onwardPurchase[].uprn`, `valuationComparisonData.propertyDetails[].uprn`) pointing at one referent with zero schema-level joins — is precisely a *missing Kind*. UPRN is then an **identity criterion** (a relational `owl:hasKey` candidate), not the thing itself.

- **`opda:RegisteredTitle` is a distinct Kind**, *not* the Property and *not* a Role the Property plays. A title is a legal-fiction object with its own identity (the title number) and its own lifecycle in the register; one Property can be subject to multiple titles (`titlesToBeSold[]`, freehold + leasehold over the same flat) and a title's extent need not coincide with a physical parcel. Modelling the title as "a role of the property" would be a category error — they have *different identity criteria* (UPRN vs title number) and that is the decisive test.

- **`opda:Proprietor` is a Role** — anti-rigid and externally dependent. A Person is a Proprietor only by virtue of a relational fact (the proprietorship entry in `registerExtract.proprietorship`). The Role is founded by a **Relator** (`Proprietorship`), and the *grant* that founds it is the missing structure the participants page itself flags ("split asserted-capacity from evidenced-authority"). The Role inheres in the Relator, not in the Person intrinsically.

- **`opda:Seller` / `opda:Buyer`:** these are **Roles**, founded by the `Transaction` relator — not Phases, and not bare RoleMixins. A Phase is intrinsically grounded (a `MarketedProperty` is a phase of a Property, changing by its own intrinsic state). Seller/Buyer change by an *external relational* condition (participation in a transaction), which is the signature of a Role. They would be a **RoleMixin** only if they ranged over *multiple* Kinds — and here is the subtlety the schema forces: a Seller may be a Person *or* an Organisation (`participants[].organisation`, and the register's `privateIndividual` vs `organization` proprietor). Because the role is played by instances of **more than one Kind**, `Seller` and `Buyer` are properly **RoleMixins** (anti-rigid, non-sortal), each *specialised* by a sortal Role (`PersonSeller`, `OrganisationSeller`) that carries the identity. This is the single most defensible refinement I can offer downstream OWL.

**Reasoning.** The whole point of the rigidity/sortality apparatus is to license `owl:hasKey` *safely*. You may declare `owl:hasKey` on a Kind (Property keyed by UPRN; RegisteredTitle keyed by title number) because rigid sortals carry identity across all worlds. You must **never** declare `owl:hasKey` on a Role or RoleMixin — a Proprietor has no identity *qua* Proprietor; its identity comes from the underlying Person/Organisation Kind. Get the categorisation wrong and the key declarations silently corrupt your individuation. This is why Q4 is not philosophy-for-its-own-sake: it is the precondition for correct keys.

**Vote.** In favour of: Property = Kind (hasKey UPRN); RegisteredTitle = separate Kind (hasKey titleNumber); Proprietor = Role founded by a Proprietorship relator; Seller/Buyer = RoleMixins specialised by sortal roles. **7-2** anticipated.

**Challenge / dissent I expect to register against Guarino.** Guarino (DOLCE) will likely accept identity criteria and anti-rigidity — we agree on the *machinery* — but resist UFO's **Relator** as the truth-maker for roles, preferring to treat Seller as a *qua-individual* or a role-concept reified differently. I hold that without a first-class `Proprietorship`/`Transaction` relator you cannot explain *why* the Role exists at all, and the schema agrees with me: capacity-without-evidenced-authority is flagged as a defect precisely because the founding relator (the grant, the conveyance) is absent. Where Guarino's DOLCE framing and my UFO framing genuinely diverge, I will record dissent rather than manufacture consensus — ODR-0001 names "Council theatre" as the failure mode, and a forced agreement here would be exactly that.

## Q5 — Overlays

**Position.** Overlays (BASPI5, TA6, TA7, NTS2, LPE1 ...) are **conceptual-modelling profiles**: each layers *additional Role and Phase constraints* onto the shared Kind backbone, never new Kinds. TA7/LPE1 constrain the *Leasehold phase/role* of a Property-with-RegisteredTitle; BASPI5 enriches the *MarketedProperty* phase; NTS2 adds disclosure constraints. The `deepmerge` composition documented in `schema-composition.astro` is, ontologically, *constraint conjunction over a fixed sortal core* — which is exactly what a profile is.

**Reasoning.** A profile in conceptual modelling adds shapes (cardinalities, required disclosures, role specialisations) without altering the identity backbone. That maps cleanly to: backbone in OWL (the Kinds and their keys), overlays as **SHACL shapes** (per ODR-0002's "canonical URIs + local SHACL, no `owl:imports`"). Crucially, an overlay must not introduce a competing Property identity — that would re-import the very defect. The union semantics for `required` arrays and the "later overlay wins" for scalars are profile-composition rules, and they are sound *provided* no overlay redefines a Kind's `owl:hasKey`.

**Vote.** In favour: overlays = SHACL profiles over the Kind backbone; no overlay may declare or override identity. **8-0** anticipated — this is where pragmatist (Allemang) and foundationalist (me) genuinely converge.

**Challenge.** If any overlay is permitted to mint its own property/identity surface, the conversion has failed at the first step. The SHACL gates ODR-0002 defers must include a *no-new-Kind, no-key-override* gate.

## Q6 — Mapping conventions to external ontologies

**Position.** Map by *meta-category compatibility*, not by label similarity. The verified-claims structure (`evidence` typed `document`/`electronic_record`/`vouch`, with `verifier`, `time`, `validation_method`) is a **PROV-O activity** in disguise: the claim is `prov:wasGeneratedBy` an activity, `prov:wasAttributedTo` a `prov:Agent` (the verifier), `prov:atTime` (→ OWL-Time interval, per Q2). DPV attaches to the *personal-data-bearing* attributes of the Person Kind and its Roles. ODRL governs *policies over* the data, not the data's identity.

**Reasoning.** A mapping is only sound when the source and target share ontological category. Mapping a Role to a Kind in an external vocabulary, or a Relator to a simple class, propagates the identity defect outward into every consumer. PROV-O's Agent/Activity/Entity triad is itself category-disciplined, which is why the verified-claims mapping is clean.

**Vote.** In favour. **8-0-1** anticipated.

**Challenge.** Reject any mapping asserted on lexical match (`schema:seller`, `foaf:Person`) without checking that the foreign term's rigidity matches ours — `foaf:Person` is fine for the Kind, but never for the Seller Role.

## Q7 — Validation severity

**Position.** Tier severity by *foundational load*. **Violation:** any breach of a Kind's identity contract — a Property without a resolvable UPRN-or-equivalent key, a RegisteredTitle without a title number, a Role instance with no founding Relator (a Proprietor with no Proprietorship, a Seller with no Transaction). **Warning:** missing Phase/disclosure constraints that overlays add. **Info:** absent optional attributes.

**Reasoning.** Identity violations corrupt individuation and therefore every downstream join and `owl:hasKey` inference; they are non-negotiable errors. Profile/disclosure gaps are contextual and overlay-dependent, hence warnings. This severity ladder is the operational expression of the Kind/Role/Phase partition.

**Vote.** In favour. **8-0-1** anticipated.

**Challenge.** A SHACL suite that flags a missing optional field as severely as a missing Property identity has inverted the priorities — the rarest, most damaging error (identity loss) must be the loudest.

---

### One-line summary

Recover the hidden substance sortals first: **Property** and **RegisteredTitle** are distinct **Kinds** with their own keys (UPRN; title number); **Proprietor** is a **Role** founded by a Proprietorship relator; **Seller/Buyer** are **RoleMixins** (played by Person *or* Organisation) specialised into sortal roles; overlays are **profiles** layering Role/Phase constraints onto that backbone — and I will dissent from Guarino's DOLCE framing wherever the Relator-as-truth-maker is at stake rather than feign consensus.
