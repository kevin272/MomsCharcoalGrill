import axios from "axios";
import {
  DEFAULT_CACHE_TTL,
  buildCacheKey,
  getCacheEntry,
  setCacheEntry,
  invalidateCache,
} from "../utils/requestCache";

const CACHEABLE_METHODS = new Set(["get"]);
const DISABLE_HEADER = "x-disable-cache";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

const headerValue = (headers, name) => {
  if (!headers) return undefined;
  const lowered = name.toLowerCase();
  if (typeof headers.get === "function") return headers.get(lowered) || headers.get(name);
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowered) return headers[key];
  }
  return undefined;
};

const shouldCache = (config) => {
  const method = (config.method || "get").toLowerCase();
  if (!CACHEABLE_METHODS.has(method)) return false;
  if (config.skipCache) return false;
  if (headerValue(config.headers, DISABLE_HEADER)) return false;
  return true;
};

const buildAxiosCacheKey = (config) =>
  buildCacheKey(
    "axios",
    config.baseURL,
    config.url,
    config.params,
    config.headers?.Accept || config.headers?.accept
  );

const sanitizeConfigForCache = (config) => ({
  url: config.url,
  baseURL: config.baseURL,
  method: config.method,
  params: config.params,
  headers: config.headers,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem("token"); // if you use JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "get").toLowerCase();

    if (!CACHEABLE_METHODS.has(method) && config.url) {
      // Bust caches for the mutated resource
      invalidateCache((key) => key.includes(config.url));
      return config;
    }

    if (shouldCache(config)) {
      const cacheKey = buildAxiosCacheKey(config);
      const cachedResponse = getCacheEntry(cacheKey);

      if (cachedResponse) {
        config.metadata = { cacheKey, fromCache: true };
        config.adapter = () =>
          Promise.resolve({
            ...cachedResponse,
            config: { ...cachedResponse.config, metadata: config.metadata },
          });
        return config;
      }

      config.metadata = {
        cacheKey,
        cacheable: true,
        ttl: config.cacheTtl ?? DEFAULT_CACHE_TTL,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const meta = response.config?.metadata;
    if (meta?.cacheable) {
      setCacheEntry(
        meta.cacheKey,
        {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: sanitizeConfigForCache(response.config),
        },
        meta.ttl
      );
    }

    return response.data; // unwrap response so you just get { data, message }
  },
  (error) => {
    // axios.config.js (catch)
console.error('API Error:', {
  url: error?.config?.url,
  method: error?.config?.method,
  status: error?.response?.status,
  data: error?.response?.data
});

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;
