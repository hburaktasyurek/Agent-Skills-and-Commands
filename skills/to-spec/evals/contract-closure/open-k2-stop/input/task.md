# Coupon amount synchronization

Update an existing server-bound pending intent when a coupon changes its amount. The browser-provided intent ID is not authority.

For a zero amount, either leaving the existing pending intent unchanged or cancelling it is acceptable. No binding source selects one outcome. Do not create a new intent.
