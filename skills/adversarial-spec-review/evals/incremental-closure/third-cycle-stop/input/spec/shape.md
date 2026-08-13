# Shape — rewritten fixture

Every `RecoveryController` constructor creates `ProviderTransport` before it
reads the record or chooses the requested recovery action. A null-account
never-submitted abandon then returns `RETAINED` without sending provider I/O.
Provider construction can still fail while the provider is unavailable.
