# Coupon amount synchronization

Update an **existing server-bound pending intent** to a positive coupon-adjusted amount. The browser-provided intent ID is not authority. If the server has no pending binding or the amount is zero, return the existing local coupon result and make no provider call.

Out of scope and owned later: intent creation/replacement, cancellation/compensation, confirmation identity across payment families, and durable transition/idempotency/publication/recovery design.
