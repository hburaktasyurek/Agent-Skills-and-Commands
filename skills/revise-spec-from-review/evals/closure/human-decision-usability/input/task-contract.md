# Binding task contract

The classifier supports `primary.create` and `auxiliary.create`.
`DefiniteFailureSignal` is documented for primary operations. The product has
not decided what a provider returning that signal during auxiliary.create
means. Existing code and tests contain no precedent.
