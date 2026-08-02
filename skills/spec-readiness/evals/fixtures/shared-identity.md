# Frozen spec: shared account fingerprint

## Outcome and work packages

`src/importer` owns `ImportAccount::run`, which normalizes a supplied account
email and writes `accounts.account_fingerprint` inside the import transaction.
`src/reconciler` owns `ReconcileAccount::run`, which reads the provider email,
recomputes the fingerprint, and joins it to `accounts.account_fingerprint`.
These are the only production entry points and consumers. Both are already
registered by their package bootstraps and may run on different hosts.

The `accounts.account_fingerprint` text column and its unique constraint
already exist in every supported environment, and all existing rows are
populated. No migration, backfill, compatibility window, activation, rollout,
or rollback work is part of this task.

## Proposed contract

- The importer trims the email and derives a stable fingerprint.
- The reconciler derives the same fingerprint from the provider email.
- The database stores the fingerprint in a unique text column.
- A matching fingerprint identifies the same account.
- `ImportAccount::run` owns persistence and maps the selected unique-conflict
  outcome; `ReconcileAccount::run` is read-only.
- Acceptance checks import one lowercase email and reconcile the identical
  lowercase email successfully.

The spec does not select case normalization, Unicode/IDNA handling, the exact
fingerprint algorithm or bytes, persisted encoding, collision/alias behavior,
or the unique-conflict outcome.
