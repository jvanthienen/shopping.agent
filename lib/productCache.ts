// Client-side localStorage cache for product data
// 30min TTL, invalidated when profile hash changes

const CACHE_PREFIX = "shop_cache_";
const TTL = 30 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  ts: number;
  profileHash: string;
}

function getProfileHash(): string {
  try {
    const raw = localStorage.getItem("styleProfile");
    if (!raw) return "";
    const p = JSON.parse(raw);
    // Hash relevant fields that affect product recommendations
    const key = JSON.stringify({
      sizes: p.sizes,
      brands: p.preferredBrands,
      capsuleKeys: p.capsuleWardrobe ? Object.keys(p.capsuleWardrobe) : [],
      colorSeason: p.colorSeason,
      bodyShape: p.bodyShape,
      style: p.stylePersonality?.name,
      goodColors: p.goodColors,
    });
    // Simple hash
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  } catch {
    return "";
  }
}

export function getCachedTab<T>(tab: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + tab);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check TTL
    if (Date.now() - entry.ts > TTL) {
      localStorage.removeItem(CACHE_PREFIX + tab);
      return null;
    }

    // Check profile hash
    if (entry.profileHash !== getProfileHash()) {
      localStorage.removeItem(CACHE_PREFIX + tab);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedTab<T>(tab: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      ts: Date.now(),
      profileHash: getProfileHash(),
    };
    localStorage.setItem(CACHE_PREFIX + tab, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function clearAllCaches(): void {
  for (const tab of ["capsule", "outfits", "pieces"]) {
    localStorage.removeItem(CACHE_PREFIX + tab);
  }
}

export function isCacheStale(tab: string): boolean {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + tab);
    if (!raw) return true;
    const entry = JSON.parse(raw);
    // Consider stale after 15min (half TTL) — triggers background refresh
    return Date.now() - entry.ts > TTL / 2;
  } catch {
    return true;
  }
}
