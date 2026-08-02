# Shape — fixture

## Account gate (closed)

Before any recovery Stripe POST, require `pa_provider_account_id` equals the
authenticated execution account. On mismatch: zero HTTP, zero authority
mutation, `RETAINED`.

## Local abandon (closed)

Never-submitted null-account `allocated` abandon runs with zero provider
transport construction and zero Stripe I/O.

## Confirm after deadline (still open)

For `payment_intent.confirm` in `submitted` state, recovery may POST the same
confirm envelope even when `now >= retry_deadline`.
