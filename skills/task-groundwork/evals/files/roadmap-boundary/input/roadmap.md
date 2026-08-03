# Phase 2 — Safe payment retries

Goal: support operators can determine whether another retry is safe without
charging a payment or relying on process-local state.

- Task 2.1 (complete): persist every retry attempt in `retry_attempts`.
- Task 2.2 (current): expose retry visibility to support. Done when support can
  retrieve the latest persisted state and `next_retry_at` for one payment.
- Task 2.3: build the support dashboard UI for retry visibility.
- Task 2.4: trigger eligible retries automatically.
