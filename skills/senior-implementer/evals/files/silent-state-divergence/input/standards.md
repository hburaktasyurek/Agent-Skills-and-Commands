# Claim contract

- A pending job may return `claimed: true` only after `running` is durable.
- A job already in `running` returns `claimed: false` and remains unchanged.
- A fresh process must observe the state associated with any successful claim.
