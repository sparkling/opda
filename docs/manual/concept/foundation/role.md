# Role

A Role is a part you play — borne by exactly one underlying Kind of party. A Proprietor is a Role borne by a Person (or, under a named specialisation, by an Organisation — but never by both kinds simultaneously).

## Why it matters

Roles are the answer to "this party is acting in capacity X *for the purposes of this context* — but the party is the same party". A single Person can be a Proprietor on one Title, a Seller in one Transaction, and a Buyer in another — without becoming three different individuals. The Roles are anchored to the contexts (the Title, the two Transactions); the Person identity persists across all of them.

If you are an integrator who has been tempted to "key the Role" (give a Proprietor its own ID independent of the Person it sits on), this is the entity that tells you not to.

## Hard cases

- **A Role outlasts its bearer.** Cannot happen by construction — a Role borrows identity from its bearer, so when the bearer ceases, so does the Role-instance. (Successor roles get new Role-instances on the successor bearer.)
- **Two Roles, one bearer, one context.** A Person is both Proprietor *and* Seller of the same Property in the same Transaction. Two distinct Role-instances on one Person — they carry different role-specific properties (capacity, evidenced authority) without conflating.
- **Role keyed in error.** A downstream system invents a `proprietor_id` independent of the Person it sits on. The IC says: this is wrong. The Proprietor has no identity *qua* Proprietor; identity is the Person's.

## Identity Criterion

A Role-instance is identified by its **(bearer, context) tuple** — the Person (or Organisation) bearing the role, plus the context (Title, Transaction, Proprietorship) it sits in. The Role NEVER supplies its own identity. See the [Logical tier →](../../logical/foundation/role.md) for the typed structure.

## Related Kinds

- [Role Mixin](./role-mixin.md) — the cross-Kind variant: a Role Mixin can be borne by more than one Kind
- [Relator](./relator.md) — Roles sit *within* a Relator's context
- [Proprietor](../agent/proprietor.md) — the canonical OPDA Role (Person → Proprietor in a Title context)

## Source ODR

[ODR-0006 — Agents and roles §Q2](../../../ontology/odr/ODR-0006-agents-and-roles.md)
