# Passkey rollout

Goal: offer passkeys to existing customer accounts in October without changing
enterprise SSO.

Already decided:

- Use the existing identity provider's WebAuthn support.
- Store credential identifiers in the existing auth database.
- Enterprise SSO accounts remain outside this rollout.
- Focused authentication and account-recovery tests must pass before launch.

Open product decision:

- Whether eligible existing users keep password login during migration or are
  moved immediately to passkey-only login after enrolling one credential.
