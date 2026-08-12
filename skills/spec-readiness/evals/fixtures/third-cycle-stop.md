# Current implementation specification

## Task contract

`RecoveryController::recover(RecoveryRecord $record, RecoveryAction $action)`
owns recovery action selection. `RecoveryRecord::submitted_at === null` means
never submitted; `RecoveryRecord::provider_account_id === null` means no bound
account. For that exact pair, `abandon` is local: it returns `RETAINED`, makes
no durable record mutation, and repeat invocation returns `RETAINED` again with
zero provider dependency acquisition, provider construction, or provider I/O.

Every other action/state pair is provider-dependent. On `ProviderUnavailable`,
each logical recovery must have exactly one `RetryPending` record; repeated
calls for that recovery must join it, return `RETRY_DEFERRED`, perform zero
recovery-record mutation, and remain retryable later.

## Current retry contract

On `ProviderUnavailable`, derive a `retry_key`, schedule a `RetryPending`
record, and return `RETRY_DEFERRED`. The specification does not define the
retry-key composition or whether repeated calls with the same recovery join or
create another pending record.
