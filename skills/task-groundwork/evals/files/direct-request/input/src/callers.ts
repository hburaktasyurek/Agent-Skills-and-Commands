import { invalidateUser, loadUser } from "./cache";

export async function showUser(ctx, userId: string) {
  return loadUser(ctx.cache, ctx.db, ctx.tenant.id, userId);
}

export async function updateUser(ctx, userId: string, patch) {
  await ctx.db.user.update({ where: { tenantId_id: { tenantId: ctx.tenant.id, id: userId } }, data: patch });
  await invalidateUser(ctx.cache, userId);
}
