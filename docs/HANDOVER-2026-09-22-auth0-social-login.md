# Handover: Auth0 social login and website eligibility

Prepared 22 September 2026. Repository: `/Users/henrik/source/opda`.

## Required outcome

Every person who satisfies either of these conditions must be able to sign in to
the OPDA website through every social connection offered by the OPDA Auth0
application:

1. the person has at least one approved working group; or
2. the person has an explicit website allowlist entry.

Those are two independent ways to receive website access. Working-group approval
does not need to set the website allowlist flag. An explicit allowlist entry does
not grant access to any working-group workspace.

Provider choice must not introduce another eligibility rule. A person must not
need a manual database edit, a per-account exception or a particular social
provider. After Auth0 has authenticated the person and OPDA has safely linked the
social subject to the eligible participant, the website authorization decision is:

```text
has an approved working group OR is explicitly website-allowlisted
```

JWT signature, issuer, audience, nonce and transaction checks remain authentication
integrity checks. They must not be used to introduce another membership rule.

## Direct answer about Maria

**Yes. Maria received account-specific handling.** A production identity record
was manually created to bind the GitHub subject seen in her failed Auth0 attempt to
her existing allowlisted participant record. The participant record was also
updated so existing session/version checks accepted that binding.

That manual binding means the exact bound GitHub subject can return without a new
GitHub verified-email claim. It is not a general solution and must not become an
operator step for Maria or anybody else. Maria's own login after the binding has
**not** been tested, so her login must not be reported as verified.

Keep the existing binding as a legitimate immutable identity association. Replace
the need for such manual associations with a general, auditable linking flow that
works for every eligible participant and every enabled provider.

## Current live status

The deployed code is commit `6e9e8cf2` (`fix(auth): allow approved or allowlisted
members across social providers`). Both deployment workflows for that commit
completed successfully:

- [Infrastructure run 35734940125](https://github.com/sparkling/opda/actions/runs/35734940125)
- [Site run 35734940433](https://github.com/sparkling/opda/actions/runs/35734940433)

The current system supports multiple immutable Auth0 subjects for one participant,
but the available providers and first-link behavior are incomplete.

| Auth0 social connection | Exists in tenant | Assigned to OPDA site app | Offered by OPDA page/code | Current result |
|---|---:|---:|---:|---|
| Google | Yes | Yes | Yes, default | Available |
| GitHub | Yes | Yes | Yes | Available, with GitHub-specific verification Action |
| Apple | Yes | No | No | Unavailable |
| Facebook | Yes | No | No | Unavailable |
| LinkedIn | Yes | No | No | Unavailable |
| Microsoft / Windows Live (`windowslive`) | Yes | No | No | Unavailable |

The live connection-client readback showed that only Google and GitHub are assigned
to the OPDA site application. Adding assignments in Auth0 alone is insufficient:
the application currently rejects any `provider` value other than `google` or
`github`, and the under-development page renders only those two links.

### Live verification completed

- A GitHub sign-in with the owner's existing **sparkling** Chrome/GitHub profile
  completed the Auth0 callback and opened protected OPDA content.
- The sign-in created another immutable social identity record for the same
  allowlisted participant.
- This proves the deployed GitHub path for that account. It does not prove Maria's
  login or coverage for every participant/provider pair.

### GitHub-specific implementation

Auth0 did not supply `email_verified` for the tested GitHub identity even though
GitHub reported the address as verified. The deployed Auth0 post-login Action in
`config/auth0/github-email-action.cjs` therefore:

1. runs only for the OPDA site client and GitHub connection;
2. reads the current GitHub identity token through a restricted Auth0 Management
   API client;
3. calls GitHub's `/user/emails` endpoint; and
4. adds a namespaced ID-token claim only when Auth0's email exactly matches a
   verified GitHub email.

The OPDA callback trusts that signed custom claim only for a numeric GitHub
subject and the same normalized email. Version 3 of the Action accepts a matching
verified secondary GitHub address as well as the primary address.

GitHub still uses Auth0's shared development OAuth key. A dedicated GitHub OAuth
application is required before treating that connection as production-ready.

## Current implementation gaps

### 1. Provider list is duplicated and limited

`config/aws/auth-session/index.mjs` hardcodes `google` and `github` in transient
transaction validation, login request validation and Auth0 connection mapping.
GitHub also has a hardcoded scope exception. `config/aws/auth-session/workspace.mjs`
preserves only GitHub on retry, and `src/pages/under-development.astro` contains
only Google and GitHub sign-in links.

Create one shared provider registry that owns:

- the public provider key;
- the Auth0 connection name;
- the display label and order;
- any required connection scope;
- the provider's trusted-email claim strategy; and
- whether the provider is enabled for the OPDA Auth0 application.

Use that registry in login validation, transaction persistence, retry URLs, UI
rendering and tests. Do not add six separate implementations.

### 2. First-time identity linking is not provider-independent

`config/aws/auth-session/identity.mjs` treats a normal Auth0 `email_verified: true`
claim as trusted and contains a special rule for GitHub's custom claim.
`config/aws/auth-session/store.mjs` can add a second social subject to the same
participant after a trusted email match. An untrusted or missing email can use
only an identity binding that already exists.

This is why Maria needed a manual binding. It will recur for any provider that
omits a trustworthy email claim or returns a different address.

Implement one general first-link path:

1. If the social provider supplies a trustworthy email that uniquely matches an
   eligible participant, create the immutable `issuer + subject` binding
   atomically.
2. Otherwise, send a one-time ownership challenge to the email on the eligible
   OPDA participant record. After successful verification, atomically bind the
   authenticated Auth0 subject to that participant.
3. On later sign-ins, resolve the immutable binding without requiring the provider
   to repeat its email attestation.
4. Refuse ambiguous matches and refuse moving an existing subject to another
   participant.

This must be a normal product flow available to every eligible user. It must not
depend on an engineer inserting an identity record.

### 3. The authorization predicate still has extra participant gates

`approvedParticipant()` currently requires the access union and also checks fields
including `reviewStatus`, `active`, `suspended`, deletion/erasure markers, expiry,
`accessVersion` and enrolment status. Review that model against the required rule.
No additional account-state field may cause a person who still has an approved
working group or explicit website allowlist entry to fail website login.

If an operational action is intended to revoke website access, it must remove or
withdraw both qualifying grants as applicable. Session invalidation and immutable
identity checks should continue to prevent stale or reassigned access.

### 4. Auth0 connections are not restored

Apple, Facebook, LinkedIn and Microsoft/Windows Live exist in the tenant but are
not assigned to the OPDA application. Before assignment, verify each connection's
dedicated production credentials, callback configuration, scopes and actual ID
token claims. Shared Auth0 development keys must not be accepted as the final
production configuration.

Restore all six connections only with the application support and tests in the
same release. Do not expose a provider button that reaches a known dead or
unhandled callback path.

### 5. Coverage is incomplete

The current unit suite proves Google and GitHub flows, multiple bindings and the
GitHub custom claim behavior. It does not prove the full provider-by-eligibility
matrix or the general ownership-challenge path.

## Required implementation sequence

1. Introduce the shared social-provider registry and refactor the existing Google
   and GitHub behavior onto it without changing their live result.
2. Implement the provider-independent first-link flow, including the one-time OPDA
   email ownership challenge for missing, untrusted or different provider email.
3. Make website authorization use exactly the required access union after identity
   authentication and linking. Keep workspace authorization scoped to each
   approved group.
4. Add Apple, Facebook, LinkedIn and Microsoft/Windows Live to the registry and UI.
5. Configure dedicated provider credentials and assign all six connections to the
   OPDA Auth0 application.
6. Update the accepted architecture records, especially ADR-0038 and ADR-0084, so
   they describe the restored provider set and general linking flow.
7. Run `make test` and `make build`, then deploy through the normal main-branch CI.
8. Verify every provider live through the existing **OPDA** Chrome profile unless
   the operator explicitly names another profile. Record the account, provider,
   callback outcome and protected-page result without storing tokens or sensitive
   identifiers.
9. Have Maria complete a fresh GitHub login and record the result. Her existing
   manual binding is useful migration coverage, not acceptance evidence for the
   general first-link flow.

## Acceptance matrix

Every cell below must pass before the work is complete.

| Eligible participant state | Google | GitHub | Apple | Facebook | LinkedIn | Microsoft |
|---|---:|---:|---:|---:|---:|---:|
| One approved working group | Pass | Pass | Pass | Pass | Pass | Pass |
| Explicit website allowlist only | Pass | Pass | Pass | Pass | Pass | Pass |
| Both approval and allowlist | Pass | Pass | Pass | Pass | Pass | Pass |

For every provider, cover these cases:

- first sign-in with a trusted matching email;
- first sign-in with missing, untrusted or different provider email through the
  general ownership challenge;
- repeat sign-in through an existing immutable binding;
- adding the provider as a second identity for the same participant;
- refusal of an ambiguous participant match;
- refusal to move a subject already bound to another participant;
- access to the website with an explicit allowlist and no group approval;
- access to the website with a group approval and no allowlist;
- access only to workspaces whose group is approved; and
- withdrawal of the final qualifying grant invalidating existing sessions.

No acceptance test may rely on a manual DynamoDB identity insertion.

## Relevant files

| File | Current responsibility |
|---|---|
| `config/aws/auth-session/index.mjs` | OAuth transaction, provider selection, callback and session issue |
| `config/aws/auth-session/identity.mjs` | ID-token verification, trusted-email decision and website eligibility |
| `config/aws/auth-session/store.mjs` | Participant lookup, immutable social identity binding and session persistence |
| `config/aws/auth-session/workspace.mjs` | Sign-in failure and retry page |
| `config/auth0/github-email-action.cjs` | GitHub-only verified-email claim |
| `src/pages/under-development.astro` | Current Google/GitHub login choices |
| `scripts/website-allowlist.mjs` | Explicit website allowlist administration |
| `tests/auth0-session.test.mjs` | Auth0 callback, identity binding and eligibility tests |
| `tests/auth0-github-email-action.test.mjs` | GitHub Action tests |
| `tests/design-system-layout-contract.test.mjs` | Current sign-in-link contract |
| `docs/adr/ADR-0038-hosting-auth-and-comments-architecture-aws.md` | Current hosting and Auth0 architecture record |
| `docs/adr/ADR-0084-integrate-hubspot-with-signup-and-cognito.md` | Participant eligibility and identity integration record |
| `docs/adr/ADR-0085-approval-driven-working-group-onboarding-and-invitations.md` | Per-group approval and invitation behavior |

## Repository state and handling constraints

At preparation, `main` matched `origin/main` at `6e9e8cf2`. Preserve these unrelated
working-tree items:

- modified `.agents/skills/security-audit/SKILL.md`;
- untracked `.agentic-qe/`.

Do not add this handover to site routes or navigation. It is a repository working
document, not published product documentation. Do not store Auth0 secrets, OAuth
tokens, personal email addresses or raw provider subject identifiers in source,
tests or this handover.
