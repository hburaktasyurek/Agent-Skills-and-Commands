# Coupon amount synchronization

Update an existing server-bound pending intent when a coupon changes its amount. The browser-provided intent ID is not authority.

For a zero amount, either of these product outcomes is acceptable:

1. Leave the existing pending intent unchanged and return the local coupon result.
2. Cancel the existing pending intent before returning the local coupon result.

No roadmap, owner, acceptance criterion, or current-system contract selects one outcome. Do not create a new intent.
