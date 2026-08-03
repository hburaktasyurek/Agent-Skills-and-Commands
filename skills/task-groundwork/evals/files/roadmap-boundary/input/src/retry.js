export async function latestAttempt(db, tenantId, paymentId) {
  return db.oneOrNone(
    `SELECT state, next_retry_at, created_at
       FROM retry_attempts
      WHERE tenant_id = $1 AND payment_id = $2
      ORDER BY created_at DESC
      LIMIT 1`,
    [tenantId, paymentId],
  );
}
