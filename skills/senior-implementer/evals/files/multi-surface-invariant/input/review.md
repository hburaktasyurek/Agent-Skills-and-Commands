# Review finding

## [P1] Blank external account identifiers can reach storage

Whitespace-only identifiers pass the public import boundary and are stored as
an empty identifier. The visible failure was reproduced through the HTTP entry
path.

### Suggested remediation

Trim before the empty check in `HttpEntry` and `CliEntry`, the two paths
exercised by the reproducer. Keep `Store` unchanged; validation should remain
an adapter concern. Preserve valid identifier behavior.

Verification must demonstrate rejection before storage and preserve valid
identifier imports.
