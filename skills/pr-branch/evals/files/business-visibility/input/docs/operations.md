# Recovery operations

Automatic recovery is currently paused for 1,600 delayed subscriptions. A
restarted or concurrent workflow could process the same recovery more than
once. Operations will resume automation only when every recovery route shares
one single-use decision.
