export const USER_CACHE_TTL_SECONDS = 60;

export function userCacheKey(userId: string): string {
  return `user:${userId}`;
}

export async function loadUser(cache, db, tenantId: string, userId: string) {
  const key = userCacheKey(userId);
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  const user = await db.user.findFirst({ where: { tenantId, id: userId } });
  if (user) await cache.set(key, JSON.stringify(user), USER_CACHE_TTL_SECONDS);
  return user;
}

export async function invalidateUser(cache, userId: string) {
  await cache.del(userCacheKey(userId));
}
