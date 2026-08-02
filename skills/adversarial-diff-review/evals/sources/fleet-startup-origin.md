# Source note: fleet-wide startup failure

The repository's existing risk-review validation set records this failure
shape: a tiny production-manifest diff removes the sole runtime dependency,
while a process-start import still requires it. Automatic rolling replacement
then fails across the fleet, with no alternate serving path or automatic
rollback; recovery requires restore, rebuild, and redeploy.

This fixture preserves that mechanism while adding the minimum task, diff,
current-code, and test-record artifacts needed for a pre-PR diff review.
