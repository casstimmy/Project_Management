/**
 * Optimistic pre-loading for dashboard and critical data.
 * 
 * After login, this module fires background fetches to warm up
 * the API server (DB connection, model schemas) and pre-cache
 * responses so the dashboard loads instantly.
 */

const PRELOAD_CACHE = {};
const CACHE_MAX_AGE = 60_000; // 1 minute

/**
 * Normalize a URL to a cache key (strip timestamp params).
 */
function cacheKey(url) {
  try {
    const u = new URL(url, window.location.origin);
    u.searchParams.delete("t");
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

/**
 * Fetch and cache a URL in memory. Returns cached data if fresh.
 */
export async function preloadFetch(url) {
  const key = cacheKey(url);
  const cached = PRELOAD_CACHE[key];
  if (cached && Date.now() - cached.timestamp < CACHE_MAX_AGE) {
    return cached.data;
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      credentials: "same-origin",
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      PRELOAD_CACHE[key] = { data, timestamp: Date.now() };
      return data;
    }
  } catch {
    // Silent fail — preloading is best-effort
  }
  return null;
}

/**
 * Get pre-loaded data for a URL without fetching.
 * Returns null if no fresh cache exists.
 */
export function getPreloaded(url) {
  const key = cacheKey(url);
  const cached = PRELOAD_CACHE[key];
  if (cached && Date.now() - cached.timestamp < CACHE_MAX_AGE) {
    return cached.data;
  }
  return null;
}

/**
 * Clear all preload caches (e.g. on logout).
 */
export function clearPreloadCache() {
  Object.keys(PRELOAD_CACHE).forEach((key) => delete PRELOAD_CACHE[key]);
}

/**
 * Run after login: fires background requests to warm up the server
 * and pre-fetch dashboard sections so they're instant on page load.
 */
export function preloadAfterLogin() {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 100));

  schedule(() => {
    // Pre-fetch all 3 dashboard sections — this warms the DB connection
    // and registers all model schemas server-side
    const t = Date.now();
    preloadFetch(`/api/dashboard?section=summary&fresh=1&t=${t}`);
    preloadFetch(`/api/dashboard?section=charts&fresh=1&t=${t}`);
    preloadFetch(`/api/dashboard?section=recent&fresh=1&t=${t}`);
  });
}

/**
 * Run on app mount if user is already authenticated.
 * Less aggressive than post-login — only warms if no recent cache.
 */
export function preloadOnMount() {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("token");
  if (!token) return;

  const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));

  schedule(() => {
    const key = "/api/dashboard?section=summary&fresh=1";
    if (!getPreloaded(key)) {
      const t = Date.now();
      preloadFetch(`/api/dashboard?section=summary&fresh=1&t=${t}`);
    }
  });
}
