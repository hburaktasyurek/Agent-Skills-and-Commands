# Plan

1. Resolve `PendingIntentStore::forSession(sessionId)` and call `Provider::update` once for a positive amount with that binding.
2. Ignore the browser intent ID as authority.
3. Return the existing local coupon result with no provider call when the binding is missing or the amount is zero.
4. Reject missing or invalid nonce with a non-success response and zero `Provider::update` calls.

No create, cancel, replacement, or transaction/recovery task is in this plan.
