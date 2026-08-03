export async function getPayment(req, db) {
  const payment = await db.oneOrNone(
    "SELECT id, status FROM payments WHERE tenant_id = $1 AND id = $2",
    [req.tenant.id, req.params.paymentId],
  );
  if (!payment) return { status: 404 };
  return { status: 200, body: payment };
}
