CREATE TABLE retry_attempts (
  tenant_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  state TEXT NOT NULL,
  next_retry_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX retry_attempts_latest
  ON retry_attempts (tenant_id, payment_id, created_at DESC);
