# Task

Recovery must durably persist one operation id before its first attempt; every retry and recovery event, including a customer notification, uses that id. A customer notification may be sent only after the recovery result is durably recorded.
