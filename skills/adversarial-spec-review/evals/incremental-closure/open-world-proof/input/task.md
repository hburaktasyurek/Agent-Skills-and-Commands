# Task contract

No service credential may appear in browser-visible output. Public identifiers
and client tokens remain allowed. Server workers must retain the credential.

# Current proposed spec

Introduce a source scanner over the designated PHP application paths. Its
authoritative inventory enumerates direct calls that can hand the general
server options array to browser-facing helpers, including ordinary,
parenthesized, and computed-call spellings present in the repository today.
The build fails when one of those inventoried call forms supplies an expression
other than an approved browser projection.

The same inventory generates the scanner tests. The proposal treats a clean
inventory scan plus those tests as exhaustive proof that no credential reaches
browser-visible output.

The browser consequence surface includes the page bootstrap renderer, nested
metadata serialized by that renderer, and extension renderers that consume the
same configuration producer. Server workers consume the producer directly and
must continue receiving the credential.
