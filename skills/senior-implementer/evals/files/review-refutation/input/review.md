Result: FAIL

[P1] A transient 503 is returned without retry.

Root family: R-RETRY-503
Root cause: the client allegedly performs only one transport attempt.
Consequence surface: request transport, retry state, and returned response.
Evidence: source inference only; no reproducer was run.
Required closure: one transient 503 is retried once and the successful second
response is returned.
Correction surface: implementation-only
