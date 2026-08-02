# Task: idempotent charge claim

Add `claim(key, charge)` so any number of concurrent or repeated calls for the
same idempotency key execute `charge` exactly once. All callers in this service
share one process. A duplicate financial charge is a release blocker.

Review boundary: `diff.patch` is the exact complete diff. `payment.js` and
`payment.test.js` are the current files. `test-record.txt` is the complete
supplied verification record.
