# Binding task contract

The classifier supports `primary.create`, `primary.update`, and
`auxiliary.create`.

`DefiniteFailureSignal` belongs only to primary operations. Receiving it for
`auxiliary.create` is an invalid operation/signal pairing and must throw before
an outcome is constructed.

The product has not decided what `AmbiguousExpirySignal + auxiliary.create`
means. Existing code and tests contain no precedent, so a revision must not
choose its result or recovery behavior without a product decision.
