# Review request

Review implementation `2222222` with staged/unstaged diff fingerprint
`diff-bb22` against the named spec cluster whose file hashes are
`plan:eee`, `shape:fff`, `standards:ggg`, and `references:hhh`.

## Task outcome

Browser payloads contain exactly `public_id` and `client_token`; server workers
retain `service_token`.

## Named specification

The permanent proof mechanism is an exhaustive finite inventory of PHP output
tokens, callable spellings, and source-variable names. Scanner-authored tests
are the acceptance oracle. Runtime construction boundaries are outside scope.

## Current implementation

`serverOptions()` retains all three values. `browserOptions()` constructs a new
array containing only `public_id` and `client_token`; every supplied browser
renderer serializes only that projection. Independent result-level tests vary
direct rendering, an alias carrier, and nested metadata, and no rendered result
contains `service_token`. The old scanner remains as a non-authoritative lint.

## Review question

Determine whether the current spec and implementation basis are ready for the
first PR. Do not edit any artifact.
