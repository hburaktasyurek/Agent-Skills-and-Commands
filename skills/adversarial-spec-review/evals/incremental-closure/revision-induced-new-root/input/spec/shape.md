# Shape — revised fixture

## Operation identity (closed)

Persist `recovery_operation_id` before the first recovery attempt. Every retry,
record, and recovery event, including customer notification, reads that same
persisted id.

## Notification (changed while closing R1)

Immediately after persisting `recovery_operation_id`, send the customer a
"recovery started" notification. Persist the recovery result afterward.
