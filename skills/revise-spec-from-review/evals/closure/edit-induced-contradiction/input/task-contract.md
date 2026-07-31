# Binding task contract

The disabled classifier supports `debit.create` and `profile.create`.
`HardDeclineSignal` is documented for debit operations, but the provider error
base type can technically carry it through either classifier entrypoint.

The product has not decided what a `HardDeclineSignal + profile.create`
pairing means. Existing code and tests contain no precedent. No revision may
silently choose its result or recovery behavior.
