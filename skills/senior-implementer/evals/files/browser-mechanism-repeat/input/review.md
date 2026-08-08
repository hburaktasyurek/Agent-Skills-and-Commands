Result: FAIL

[P1] A service credential remains reachable through browser output.
Root cluster: R-BROWSER-PROJECTION
Consequence surface: server configuration, browser projection, page and
callback renderers, certificate construction and metadata, and result-level
regression proof. Browser-visible certificate labels are free-form, but values
containing credential-shaped content are outside the valid-state set and must
be rejected at construction; silently omitting only the output field does not
close that alternate entry path.

History: earlier corrections extended the same source scanner repeatedly, but
the invariant has failed again under that proof mechanism. Treat the supplied
repository state—not this summary—as the authority for the remaining path.

Required contract: browser output may contain only `public_id` and
`client_token`; server connectivity must retain `service_token`; certificate
construction must reject credential-shaped values.
