# Account identifier contract

The durable account store must never contain an identifier that is empty after
trimming, regardless of which current or future adapter calls it. A blank value
must be rejected before mutation with `DomainException`. Valid identifiers are
trimmed and stored unchanged otherwise.

Entry adapters may reject earlier, but enumerating today's adapters is not a
complete enforcement of the store invariant.
