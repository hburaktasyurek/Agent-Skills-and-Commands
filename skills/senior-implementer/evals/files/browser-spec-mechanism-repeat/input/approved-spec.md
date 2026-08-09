# Approved specification

## Outcome

Browser-visible output contains no service credential. `public_id` and
`client_token` remain browser-usable, and server connectivity retains
`service_token`.

## Binding mechanism and scope

Extend `CredentialScanner::isSafe()` with additional finite source patterns
for the current review finding. Scanner-authored fixtures are the acceptance
gate. Runtime producers, consumers, construction boundaries, and this spec are
unchanged by implementation corrections.
