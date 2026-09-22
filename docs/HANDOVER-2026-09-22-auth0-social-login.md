# Handover: Auth0 social login and website eligibility

Updated 22 September 2026. Repository: `/Users/henrik/source/opda`.

## Required contract

Every participant who has either of these grants can sign in to the OPDA website
through every enabled Auth0 social provider:

1. at least one approved working group; or
2. an explicit website allowlist entry.

Those are the complete website eligibility rules. Participant lifecycle projections
such as active, suspended, review, enrolment, retention, deletion and erasure do not
override a surviving grant. An allowlist entry grants no working-group workspace;
each workspace still requires approval for that group.

Authentication and record-integrity checks remain mandatory. The callback verifies
the signed ID token, issuer, audience, nonce, subject and time. Sessions remain
opaque, expire after at most one hour and are bound to the canonical participant,
immutable Auth0 subject and current access version.

## Deployed implementation

Commit `4feef7db` (`fix(auth): generalize social login eligibility`) is deployed.

- [Infrastructure run 35745447732](https://github.com/sparkling/opda/actions/runs/35745447732) — success
- [Site run 35745448271](https://github.com/sparkling/opda/actions/runs/35745448271) — success

The implementation now has one provider registry shared by login validation,
Auth0 connection selection, failure retries, the holding page and tests. It contains:

| Public key | Auth0 connection | Holding-page label |
|---|---|---|
| `google` | `google-oauth2` | Google |
| `github` | `github` | GitHub |
| `apple` | `apple` | Apple |
| `facebook` | `facebook` | Facebook |
| `linkedin` | `linkedin` | LinkedIn |
| `microsoft` | `windowslive` | Microsoft |

The default `/_auth/login` route leaves `connection` unset so Auth0 Universal Login
can present all assigned connections. A direct provider route supplies the registry's
connection name. GitHub additionally requests `user:email`.

### General first binding

For a first social login, OPDA uses the normalized email in the signed Auth0 ID token
to locate the existing unique email reservation and canonical participant. It then
creates an immutable `issuer + subject` binding and the opaque website session in one
conditional transaction. Auth0's optional provider-specific `email_verified` claim
is not an additional requirement.

For later logins, the immutable binding identifies the participant even when the
provider changes or omits the email claim. A subject binding cannot move to another
participant. Missing or ambiguous participant records, invalid tokens, corrupt
bindings and transaction races still fail closed.

### Exact authorization predicate

The shared website access function returns a grant only when:

```text
websiteAllowlist === true
OR
approvedDomains contains a domain whose domainApprovals[domain].status is "approved"
```

The auth callback, session reader, edge gate and comments API all use this shared
predicate. Atomic session creation rechecks the selected allowlist or approved-domain
grant in DynamoDB. Removing the final grant and incrementing `accessVersion`
invalidates existing sessions; reapproval cannot revive an old cookie.

The allowlist administration script now changes the allowlist grant and audit fields
without refusing or rewriting unrelated lifecycle projections.

## Auth0 tenant state

All six social connections exist and are assigned to the OPDA site client:

| Connection | Assigned to OPDA |
|---|---:|
| Google | Yes |
| GitHub | Yes |
| Apple | Yes |
| Facebook | Yes |
| LinkedIn | Yes |
| Microsoft / Windows Live | Yes |

The OPDA GitHub verified-email Action has been detached and deleted. Its dedicated
Management API application and its `read:users` / `read:user_idp_tokens` grant have
also been deleted. The two unrelated tenant post-login actions remain bound in their
original order:

1. `HM Email Allow-List`;
2. `Add API Claims to Browser Tokens`.

There is no provider-specific OPDA Auth0 Action, custom email claim or GitHub-only
runtime path.

## Maria account status

Maria previously received account-specific handling: an operator manually inserted
an Auth0 GitHub subject binding after her provider returned an email without the
optional `email_verified` claim. The deployed application no longer needs that
exception; the general first-binding path accepts the signed Auth0 email for every
provider and every eligible participant.

The historical manual binding has been removed from DynamoDB. Before mutation,
strongly consistent reads confirmed that the email reservation, source, participant
and GitHub identity binding all agreed, and that Maria retained an explicit website
allowlist grant. One conditional transaction then deleted only that exact identity
record, cleared the matching participant `auth0BindingKey` and incremented
`accessVersion`. Readback confirmed that the binding and pointer are absent, the
allowlist remains true and only `auth0BindingKey`, `accessVersion` and `updatedAt`
changed on the participant.

After cleanup, Maria's next sign-in will create a normal immutable binding through
the same code used for every other eligible participant. Her own post-cleanup login
has not yet been performed and must not be reported as tested.

## Verification evidence

Local validation for `4feef7db`:

- `make test`: 1,117 tests passed, one existing skip;
- `make build`: 2,781 pages built successfully;
- `node scripts/check-ci-test-inventory.mjs`: 130 test files have one owner, tier
  and lane;
- `git diff --check`: clean.

The tests cover:

- all six provider keys and Auth0 connection mappings;
- direct-provider retries and Universal Login without a forced connection;
- first binding for approved-group and allowlist-only participants across all six
  providers;
- absent, false, null and string `email_verified` values;
- returning bindings with a changed or missing provider email;
- refusal of malformed tokens, missing email on an unbound identity, missing or
  ambiguous reservations, corrupt bindings and concurrent grant changes;
- allowlist and approved-domain atomic DynamoDB guards;
- lifecycle projections not overriding a surviving website grant;
- final-grant withdrawal and access-version invalidation; and
- the six rendered holding-page login links.

Live checks completed after deployment:

- the holding page visibly renders Google, GitHub, Apple, Facebook, LinkedIn and
  Microsoft links with the expected provider parameters;
- Auth0 Management API readback confirms all six connections are assigned;
- GitHub sign-in with the owner's existing Sparkling profile completed and returned
  to protected OPDA content after the GitHub Action was deleted.
- Maria's manually inserted GitHub identity record and participant binding pointer
  are absent; her explicit website allowlist remains active and her access version
  was incremented to invalidate sessions created through the exception.

Apple, Facebook, LinkedIn and Microsoft have configuration and route readback but
have not each completed a live account login in this session. Provider-account
consent and upstream claim behavior should be recorded when suitable test accounts
are available. This does not change the shared OPDA authorization path.

## Relevant files

| File | Responsibility |
|---|---|
| `config/aws/auth-session/providers.mjs` | Shared social-provider registry and direct login links |
| `config/aws/auth-session/identity.mjs` | ID-token verification and exact website grant predicate |
| `config/aws/auth-session/store.mjs` | Participant resolution, immutable subject binding and atomic session persistence |
| `config/aws/auth-session/index.mjs` | OAuth transaction, callback and session issue |
| `config/aws/auth-session/session.mjs` | Current session, participant and binding validation |
| `config/aws/auth-session/workspace.mjs` | Provider-preserving sign-in retries and workspace selection |
| `scripts/website-allowlist.mjs` | Explicit website allowlist administration |
| `src/pages/under-development.astro` | Six provider login choices from the shared registry |
| `tests/auth0-session.test.mjs` | Auth0 provider, binding and eligibility contracts |
| `tests/auth-session.test.mjs` | Shared session and DynamoDB authorization contracts |
| `tests/comments-api.test.mjs` | Comment identity behavior under the exact entitlement rule |
| `tests/edge-gate.test.mjs` | Edge behavior under the exact entitlement rule |

The GitHub-only files `config/auth0/github-email-action.cjs` and
`tests/auth0-github-email-action.test.mjs` were deleted.

## Repository handling

Work remains directly on `main`. Preserve these unrelated working-tree items:

- modified `.agents/skills/security-audit/SKILL.md`;
- untracked `.agentic-qe/`.

Do not add this handover to site routes or navigation. It is a repository working
document, not published product documentation. Do not store Auth0 secrets, OAuth
tokens, personal email addresses or raw provider subject identifiers in source,
tests or this handover.
