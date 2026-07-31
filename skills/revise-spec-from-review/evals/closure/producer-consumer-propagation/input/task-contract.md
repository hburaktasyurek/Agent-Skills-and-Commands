# Binding task contract

`DefiniteFailureSignal` belongs only to `primary.create` and `primary.update`.
Receiving it for `auxiliary.create` is an invalid operation/signal pairing and
must throw before an outcome is constructed. The public classifier and outcome
factories must agree, and tests must distinguish every supported operation.
