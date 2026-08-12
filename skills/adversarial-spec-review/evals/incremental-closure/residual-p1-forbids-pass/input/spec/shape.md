# Shape — fixture

## Account gate (closed)

Before every recovery provider request (the sole request boundary is a Stripe
POST), require `pa_provider_account_id` equals the authenticated execution
account. On mismatch: zero HTTP, zero authority mutation, `RETAINED`.

## Local abandon (closed)

Never-submitted null-account `allocated` abandon runs with zero provider
transport construction and zero Stripe I/O.

## Provider POST after deadline (still open)

For `payment_intent.confirm` and `payment_intent.capture` in `submitted` state,
recovery may POST the same envelope even when `now >= retry_deadline`.
