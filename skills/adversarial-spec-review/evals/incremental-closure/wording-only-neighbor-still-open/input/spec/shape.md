# Shape — fixture

## Account gate

Recovery **should prefer** the attempt's provider account when present before
retry POST. Wording updated after review R1.

## Local abandon

Never-submitted `allocated` work is abandoned only after the recovery service
has constructed `ProviderTransport`. If transport construction fails, abandon
does not run.
