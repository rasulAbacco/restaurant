// client/src/offline/offlineCache.js
import { getDb } from "./db";

// Call this right after any successful GET of reference data (menu items,
// categories, floors, tables, add-ons) so there's always a last-known-good
// copy available if the next fetch fails because the connection dropped.
export async function cacheReferenceData(key, data) {
  const db = await getDb();
  await db.put("referenceCache", {
    key,
    data,
    cachedAt: new Date().toISOString(),
  });
}

// Returns { data, cachedAt } or null if nothing's been cached yet for this
// key (e.g. very first launch, never been online).
export async function getCachedReferenceData(key) {
  const db = await getDb();
  const row = await db.get("referenceCache", key);
  return row ? { data: row.data, cachedAt: row.cachedAt } : null;
}

// Wraps a normal API call: try the network first, fall back to the cached
// copy on failure, and cache a fresh copy whenever the network succeeds.
// This is the one function most components should actually call — see
// MenuBrowser.jsx / TableStrip.jsx for usage.
export async function fetchWithOfflineFallback(key, fetchFn) {
  try {
    const data = await fetchFn();
    await cacheReferenceData(key, data);
    return { data, fromCache: false, cachedAt: null };
  } catch (err) {
    const cached = await getCachedReferenceData(key);
    if (cached) {
      return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
    }
    // Never been online for this key at all — nothing to fall back to.
    throw err;
  }
}

// FEATURE: offline read-only browsing for the Menu admin pages
// (Categories/SubCategories/AddOns/Combos/KitchenSections/MenuList).
// Those pages use menuApi.js, which returns { ok, data } and never
// throws — a different convention from posApi.js's request(), which
// fetchWithOfflineFallback above expects (throw on failure). This adapts
// the former into the latter so the same caching logic can be reused
// without duplicating it. Returns result.data as-is; callers unwrap it
// exactly the same way they already do for the live (non-cached) call.
export async function fetchWithOfflineFallbackResult(key, resultFn) {
  return fetchWithOfflineFallback(key, async () => {
    const result = await resultFn();
    if (!result.ok) {
      throw new Error(result.data?.message || "Request failed");
    }
    return result.data;
  });
}
