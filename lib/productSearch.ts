// Shared product search logic — used by /api/products and /api/lookbook-products
import { SCRAPER_REGISTRY, ScraperConfig } from "@/lib/scrapers";

const PARSE_API_KEY = process.env.PARSE_BOT_API_KEY || "";
const PARSE_BASE = "https://api.parse.bot/scraper";

export interface SearchProduct {
  name: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  brand: string;
  category?: string;
}

// --- Concurrency limiter ---
// Limits parallel parse.bot calls to avoid rate limits

// Rate limiter — enforces max N requests per minute with sliding window
class RateLimiter {
  private timestamps: number[] = [];
  private queue: (() => void)[] = [];
  private concurrent = 0;

  constructor(
    private maxPerMinute: number,
    private maxConcurrent: number
  ) {}

  async acquire(): Promise<void> {
    // Wait for concurrency slot
    if (this.concurrent >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.concurrent++;

    // Enforce rate limit (sliding window)
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < 60_000);
    if (this.timestamps.length >= this.maxPerMinute) {
      const oldest = this.timestamps[0];
      const waitMs = 60_000 - (now - oldest) + 100; // +100ms safety margin
      await new Promise((r) => setTimeout(r, waitMs));
      this.timestamps = this.timestamps.filter((t) => Date.now() - t < 60_000);
    }
    this.timestamps.push(Date.now());
  }

  release(): void {
    this.concurrent--;
    if (this.queue.length > 0) {
      this.queue.shift()!();
    }
  }
}

// 18 req/min (safe margin under 20/min free tier), max 4 concurrent
const limiter = new RateLimiter(18, 4);

// --- Generic product parser ---

export function parseProduct(
  p: Record<string, unknown>,
  config: ScraperConfig,
  brand: string
): SearchProduct | null {
  const fm = config.fieldMap || {};

  // Name
  const name =
    (p[fm.name || "name"] as string) ||
    (p.title as string) ||
    "";
  if (!name) return null;

  // Image
  let imageUrl = "";
  if (config.imageTransform === "zara-width") {
    const xmedia = p.xmedia as { url?: string }[] | undefined;
    imageUrl = (xmedia?.[0]?.url || "").replace("{width}", "600");
  } else {
    imageUrl =
      (p[fm.image || "image_url"] as string) ||
      (p.imageUrl as string) ||
      (p.image_url as string) ||
      (p.image as string) ||
      (p.main_image as string) ||
      (p.thumbnail as string) ||
      ((p.images as string[]) || [])[0] ||
      "";
  }
  if (!imageUrl) return null;

  // Price
  let price = "";
  const rawPrice = p[fm.price || "price"];
  if (config.priceTransform === "cents" && typeof rawPrice === "number") {
    price = rawPrice > 0 ? `$${(rawPrice / 100).toFixed(2)}` : "";
  } else if (typeof rawPrice === "number") {
    price = `$${rawPrice.toFixed(2)}`;
  } else if (typeof rawPrice === "string") {
    price = rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`;
  }
  if (!price) {
    const promo = p.promo_price as number | undefined;
    const base = p.base_price as number | undefined;
    if (promo) price = `$${promo.toFixed(2)}`;
    else if (base) price = `$${base.toFixed(2)}`;
  }

  // URL
  let productUrl =
    (p[fm.url || "product_url"] as string) ||
    (p.productUrl as string) ||
    (p.url as string) ||
    (p.link as string) ||
    (p.href as string) ||
    "";
  if (!productUrl && brand === "Zara") {
    const seo = p.seo as { keyword?: string; seoProductId?: string } | undefined;
    if (seo?.keyword) {
      productUrl = `https://www.zara.com/us/en/${seo.keyword}-p${seo.seoProductId}.html`;
    }
  }

  return { name, price, imageUrl, productUrl, brand };
}

// --- Extract products array from API response ---

function extractProducts(
  data: Record<string, unknown>,
  config: ScraperConfig
): Record<string, unknown>[] {
  const productsPath = config.fieldMap?.products;
  if (productsPath) {
    const result = productsPath.split(".").reduce((obj: unknown, key: string) => {
      return (obj as Record<string, unknown>)?.[key];
    }, data) as Record<string, unknown>[] | undefined;
    return result || [];
  }
  return (
    (data.products as Record<string, unknown>[]) ||
    ((data.data as Record<string, unknown>)?.products as Record<string, unknown>[]) ||
    (data.results as Record<string, unknown>[]) ||
    (data.items as Record<string, unknown>[]) ||
    ((data.data as Record<string, unknown>)?.results as Record<string, unknown>[]) ||
    ((data.data as Record<string, unknown>)?.items as Record<string, unknown>[]) ||
    []
  );
}

// --- Search a single store, return multiple results ---

export async function searchStoreBatch(
  config: ScraperConfig,
  brand: string,
  query: string,
  limit: number = 3,
  gender: "women" | "men" = "women"
): Promise<SearchProduct[]> {
  await limiter.acquire();
  try {
    // Apply gender filtering: use native API params if available, otherwise prepend to query
    let searchQuery = query;
    const genderParams: Record<string, unknown> = {};
    if (config.genderFilter) {
      genderParams[config.genderFilter.param] = config.genderFilter.values[gender];
    } else if (!/\b(women|men|woman|man)\b/i.test(query)) {
      searchQuery = `${gender} ${query}`;
    }

    const body: Record<string, unknown> = {
      query: searchQuery,
      limit,
      ...config.searchParams,
      ...genderParams,
    };

    const res = await fetch(
      `${PARSE_BASE}/${config.scraperId}/${config.searchEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": PARSE_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      console.warn(`[search] ${brand} returned ${res.status} for "${query}"`);
      return [];
    }
    const data = await res.json();
    if (data.error) {
      console.warn(`[search] ${brand} error for "${query}":`, data.error);
      return [];
    }

    const products = extractProducts(data, config);
    if (!Array.isArray(products) || !products.length) return [];

    const results: SearchProduct[] = [];
    for (const p of products) {
      const result = parseProduct(p, config, brand);
      if (result) {
        results.push(result);
        if (results.length >= limit) break;
      }
    }
    return results;
  } catch {
    return [];
  } finally {
    limiter.release();
  }
}

// --- Search a single store, return first match ---

export async function searchStore(
  config: ScraperConfig,
  brand: string,
  query: string,
  gender: "women" | "men" = "women"
): Promise<SearchProduct | null> {
  const results = await searchStoreBatch(config, brand, query, 1, gender);
  return results[0] || null;
}

// --- Get ordered store list ---

export function getStoreList(preferredBrands?: string[]): { config: ScraperConfig; brand: string }[] {
  const allStores = Object.entries(SCRAPER_REGISTRY).map(([brand, config]) => ({
    brand,
    config,
  }));

  if (!preferredBrands || preferredBrands.length === 0) return allStores;

  // Hard rule: only return preferred brands — never fall through to others
  const preferred = allStores.filter((s) =>
    preferredBrands.some((b) => b.toLowerCase() === s.brand.toLowerCase())
  );
  // Only fall back to all stores if none of the preferred brands exist in the registry
  return preferred.length > 0 ? preferred : allStores;
}

// --- Search a subset of brands per query (rate-limit friendly) ---
// Rotates through brands so different items hit different stores

let brandRotation = 0;

export async function searchAllBrands(
  query: string,
  preferredBrands?: string[],
  limit: number = 2,
  gender: "women" | "men" = "women"
): Promise<SearchProduct[]> {
  if (!PARSE_API_KEY) return [];

  const stores = getStoreList(preferredBrands);
  // Only search 2 brands per query to stay within rate limits
  const brandsToSearch = Math.min(limit + 1, 3);
  const offset = brandRotation % stores.length;
  brandRotation++;

  const selected: typeof stores = [];
  for (let i = 0; i < brandsToSearch && i < stores.length; i++) {
    selected.push(stores[(offset + i) % stores.length]);
  }

  const results = await Promise.all(
    selected.map(({ config, brand }) => searchStoreBatch(config, brand, query, 1, gender))
  );

  const flat = results.flat();

  // Deduplicate by name similarity
  const seen = new Set<string>();
  const deduped: SearchProduct[] = [];
  for (const p of flat) {
    const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
    if (deduped.length >= limit) break;
  }

  return deduped;
}

// --- Clean item description into a search query ---

export function toSearchQuery(item: string): string {
  return item
    .replace(/^\d+\s+/, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s*:.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// --- Categorize a product by capsule key + item name ---

const CATEGORY_MAP: Record<string, string> = {
  tops: "blouses",
  shirts: "blouses",
  blouses: "blouses",
  sweaters: "blouses",
  knitwear: "blouses",
  bottoms: "pants",
  pants: "pants",
  trousers: "pants",
  jeans: "jeans",
  denim: "jeans",
  skirts: "skirts",
  dresses: "dresses",
  outerwear: "outerwear",
  coats: "outerwear",
  jackets: "outerwear",
  blazers: "blazers",
  shoes: "shoes",
  footwear: "shoes",
  accessories: "accessories",
  bags: "accessories",
};

export function categorizeProduct(capsuleKey: string, itemDesc: string): string {
  // Try capsule key first
  const keyLower = capsuleKey.toLowerCase();
  if (CATEGORY_MAP[keyLower]) return CATEGORY_MAP[keyLower];

  // Try matching keywords in item description
  const descLower = itemDesc.toLowerCase();
  if (descLower.includes("jean") || descLower.includes("denim")) return "jeans";
  if (descLower.includes("blazer")) return "blazers";
  if (descLower.includes("coat") || descLower.includes("jacket") || descLower.includes("parka")) return "outerwear";
  if (descLower.includes("skirt")) return "skirts";
  if (descLower.includes("dress")) return "dresses";
  if (descLower.includes("pant") || descLower.includes("trouser") || descLower.includes("chino")) return "pants";
  if (descLower.includes("shoe") || descLower.includes("boot") || descLower.includes("sandal") || descLower.includes("sneaker") || descLower.includes("loafer") || descLower.includes("flat") || descLower.includes("heel") || descLower.includes("mule")) return "shoes";
  if (descLower.includes("bag") || descLower.includes("belt") || descLower.includes("scarf") || descLower.includes("hat") || descLower.includes("jewelry") || descLower.includes("earring") || descLower.includes("necklace") || descLower.includes("bracelet") || descLower.includes("watch") || descLower.includes("sunglasses")) return "accessories";
  if (descLower.includes("sweater") || descLower.includes("knit") || descLower.includes("cardigan") || descLower.includes("pullover")) return "blouses";
  if (descLower.includes("shirt") || descLower.includes("blouse") || descLower.includes("top") || descLower.includes("tee") || descLower.includes("t-shirt") || descLower.includes("cami") || descLower.includes("tank")) return "blouses";

  // Default based on capsule key partial match
  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (keyLower.includes(k)) return v;
  }

  return "blouses"; // safe default
}

// --- Find first matching product across stores (for lookbook compat) ---

export async function findProduct(
  query: string,
  preferredBrands?: string[],
  gender: "women" | "men" = "women"
): Promise<SearchProduct | null> {
  const stores = getStoreList(preferredBrands);
  for (const { config, brand } of stores) {
    const result = await searchStore(config, brand, query, gender);
    if (result) return result;
  }
  return null;
}
