# Coupon amount synchronization

Update an **existing server-bound pending intent** to a positive coupon-adjusted amount. The browser-provided intent ID is not authority. If the server has no pending binding or the amount is zero, return the existing local coupon result and make no provider call.

Nonce and booking-session authorization must reject before any local session write, database write, or provider retrieve/update. A failed provider retrieve is a non-success with zero `Provider::update` calls and no further local write.

Out of scope and owned later: intent creation/replacement, cancellation/compensation, checkout-instance lifecycle, confirmation identity across payment families, and durable transition/idempotency/publication/recovery design. The live checkout renderer still calls `Provider::create` on each render; that landed hazard is an accepted residual of this child.
