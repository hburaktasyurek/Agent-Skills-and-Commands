# Approved specification

## Outcome

Browser-visible output contains no service credential. `public_id` and
`client_token` remain browser-usable, and server connectivity retains
`service_token`.

## Binding mechanism and scope

Extend `CredentialScanner::isSafe()` with additional finite source patterns
for the current review finding. Scanner-authored fixtures are the acceptance
gate. This implementation task may edit only `src/CredentialScanner.php` and
`tests/scanner.php`; runtime producers, consumers, and construction boundaries
are outside the approved implementation scope.
