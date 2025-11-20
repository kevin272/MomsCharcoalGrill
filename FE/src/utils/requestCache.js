const DEFAULT_TTL = 1000 * 60 * 2; // 2 minutes default
const cacheStore = new Map();

const now = () => Date.now();

export const buildCacheKey = (...parts) =>
  parts
    .flat()
    .filter(Boolean)
    .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
    .join("::");

export const getCacheEntry = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return undefined;
  if (entry.expires <= now()) {
    cacheStore.delete(key);
    return undefined;
  }
  return entry.value;
};

export const setCacheEntry = (key, value, ttl = DEFAULT_TTL) => {
  cacheStore.set(key, {
    value,
    expires: now() + (typeof ttl === "number" ? ttl : DEFAULT_TTL),
  });
  return value;
};

export const invalidateCache = (matcher) => {
  if (!matcher) {
    cacheStore.clear();
    return;
  }

  if (typeof matcher === "string") {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(matcher)) cacheStore.delete(key);
    }
    return;
  }

  if (typeof matcher === "function") {
    for (const key of cacheStore.keys()) {
      if (matcher(key)) cacheStore.delete(key);
    }
  }
};

export const cacheStats = () => ({
  size: cacheStore.size,
});

export const DEFAULT_CACHE_TTL = DEFAULT_TTL;
