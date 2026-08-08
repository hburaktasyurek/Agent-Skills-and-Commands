# Review request

Review implementation `1111111` with staged/unstaged diff fingerprint
`diff-aa11` against the named spec cluster whose file hashes are
`plan:aaa`, `shape:bbb`, `standards:ccc`, and `references:ddd`.

## Normative requirement

Browser payloads contain exactly `public_id` and `client_token`; server workers
retain `service_token`. Acceptance must observe the result through a carrier
independent of the enforcement mechanism.

## Current implementation

`serverOptions()` returns all three fields. `browserOptions()` returns
`serverOptions()` unchanged. A source scanner inventories direct echo and JSON
calls and its own fixtures are green. A page renderer aliases
`browserOptions()` and serializes it under `bootstrap`.

## Claimed evidence

The scanner suite passes. No result-level test exercises the alias renderer or
changes one material carrier independently of the scanner's inventory.
