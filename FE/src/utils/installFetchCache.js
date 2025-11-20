import {
  DEFAULT_CACHE_TTL,
  buildCacheKey,
  getCacheEntry,
  setCacheEntry,
  invalidateCache,
} from "./requestCache";

const DISABLE_HEADER = "x-disable-cache";
const FETCH_CACHE_PREFIX = "fetch";

const getHeaderValue = (headers, name) => {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name);
  if (Array.isArray(headers)) {
    const match = headers.find(
      ([key]) => key && key.toLowerCase() === name.toLowerCase()
    );
    return match?.[1];
  }
  const lowered = name.toLowerCase();
  return headers[name] ?? headers[lowered];
};

const shouldSkipCache = (initHeaders, requestHeaders, init) => {
  if (!init) return false;
  if (init.cache === "no-store" || init.cache === "reload" || init.skipCache) return true;
  if (getHeaderValue(initHeaders, DISABLE_HEADER)) return true;
  if (requestHeaders && getHeaderValue(requestHeaders, DISABLE_HEADER)) return true;
  return false;
};

let fetchCacheInstalled = false;

export const installFetchCache = ({ ttl = DEFAULT_CACHE_TTL } = {}) => {
  if (typeof window === "undefined" || fetchCacheInstalled) return;

  const originalFetch = window.fetch.bind(window);
  fetchCacheInstalled = true;

  window.fetch = async (input, init = {}) => {
    const request = input instanceof Request ? input : null;
    const method = (init.method || request?.method || "GET").toUpperCase();
    const cacheable = method === "GET" && !shouldSkipCache(init.headers, request?.headers, init);
    const cacheKey = cacheable
      ? buildCacheKey(
          FETCH_CACHE_PREFIX,
          request ? request.url : input,
          init.cacheKey || request?.cacheKey || ""
        )
      : null;

    if (cacheable) {
      const cachedResponse = getCacheEntry(cacheKey);
      if (cachedResponse) {
        return cachedResponse.clone();
      }
    }

    const response = await originalFetch(input, init);

    if (cacheable && response.ok) {
      const ttlForReq = typeof init.cacheTtl === "number" ? init.cacheTtl : ttl;
      setCacheEntry(cacheKey, response.clone(), ttlForReq);
    } else if (!cacheable && method !== "GET" && response.ok) {
      const normalizedUrl = request ? request.url : input?.toString?.() ?? String(input);
      invalidateCache((key) => key.includes(normalizedUrl));
    }

    return response;
  };
};

if (typeof window !== "undefined") {
  installFetchCache();
}
