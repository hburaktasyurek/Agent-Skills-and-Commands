# Frozen PR host snapshot

- PR: 46
- Base: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- Prior reviewed head: `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`
- Current head: `cccccccccccccccccccccccccccccccccccccccc`
- Head is stable and ancestry is proven.
- Checks: green.

# Task authority

No service credential may appear in browser-visible output. Public identifiers
and client tokens remain allowed. Server workers retain the service credential.

# Complete prior report

Result: FAIL at `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`.
Finding R-BROWSER-PROJECTION: direct and computed calls could serialize the
general server options array. Consequence surface: configuration producer,
browser renderers, nested metadata, and result-level tests. The correction
added more source patterns while retaining the general array as browser input.

# Current delta

The scanner now recognizes direct, parenthesized, and computed calls. The page
renderer assigns `browserOptions()` to `$payload` and serializes
`['bootstrap' => $payload]`. `browserOptions()` still returns the complete
server options array containing `service_token`. Scanner-authored tests and CI
are green. Every changed file and current caller is available, but no
independent result-level oracle establishes the stated browser invariant.
