import { NextRequest, NextResponse } from "next/server";
import { Product, Outfit } from "@/lib/types";
import {
  searchAllBrands,
  searchStoreBatch,
  toSearchQuery,
  categorizeProduct,
  getStoreList,
  SearchProduct,
} from "@/lib/productSearch";

// --- Server-side cache (30min TTL) ---

interface CacheEntry {
  data: unknown;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000;

function cacheGet(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key: string, data: unknown): void {
  cache.set(key, { data, ts: Date.now() });
}

// --- Helpers ---

let productIdCounter = 0;
function toProduct(sp: SearchProduct, category?: string): Product {
  productIdCounter++;
  return {
    id: `live-${sp.brand.toLowerCase().replace(/[^a-z0-9]/g, "")}-${productIdCounter}-${Date.now()}`,
    name: sp.name,
    price: sp.price,
    imageUrl: sp.imageUrl,
    productUrl: sp.productUrl,
    brand: sp.brand,
    category: category || sp.category,
  };
}

// --- Tab: capsule ---

async function fetchCapsule(
  capsuleWardrobe: Record<string, string[]>,
  preferredBrands?: string[],
  gender: "women" | "men" = "women"
): Promise<Product[]> {
  const products: Product[] = [];
  const promises: Promise<void>[] = [];

  for (const [key, items] of Object.entries(capsuleWardrobe)) {
    for (const item of (items as string[]).slice(0, 4)) {
      const query = toSearchQuery(item);
      promises.push(
        searchAllBrands(query, preferredBrands, 1, gender).then((results) => {
          for (const r of results) {
            const cat = categorizeProduct(key, item);
            products.push(toProduct(r, cat));
          }
        })
      );
    }
  }

  await Promise.all(promises);
  return products;
}

// --- Tab: outfits ---

async function fetchOutfits(
  outfitFormulas: string[],
  preferredBrands?: string[],
  gender: "women" | "men" = "women"
): Promise<Outfit[]> {
  const outfits: Outfit[] = [];
  const promises: Promise<void>[] = [];

  for (const formula of outfitFormulas.slice(0, 8)) {
    const parts = formula
      .split(/\s*\+\s*/)
      .map((p) => p.replace(/\s*\([^)]*\)\s*$/, "").trim())
      .filter(Boolean);

    const outfitItems: Product[] = [];
    const outfitEntry: Outfit = {
      id: `outfit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: formula.replace(/\s*\([^)]*\)\s*$/, "").trim(),
      vibe: (formula.match(/\(([^)]+)\)/) || [])[1] || "",
      items: outfitItems,
      totalPrice: "$0",
    };
    outfits.push(outfitEntry);

    for (const part of parts) {
      promises.push(
        searchAllBrands(part, preferredBrands, 1, gender).then((results) => {
          if (results[0]) {
            outfitItems.push(toProduct(results[0], categorizeProduct("", part)));
          }
        })
      );
    }
  }

  await Promise.all(promises);

  // Calculate totals
  for (const outfit of outfits) {
    const total = outfit.items.reduce(
      (sum, i) => sum + parseFloat(i.price.replace("$", "") || "0"),
      0
    );
    outfit.totalPrice = `$${total.toFixed(2)}`;
    // Shorten name for display
    if (outfit.name.length > 50) {
      outfit.name = outfit.name.slice(0, 47) + "...";
    }
  }

  return outfits.filter((o) => o.items.length > 0);
}

// --- Tab: pieces ---

const PIECE_QUERIES = [
  "blazer",
  "jeans",
  "dress",
  "pants",
  "blouse",
  "sweater",
  "skirt",
  "coat",
  "shoes",
  "bag accessories",
];

const PIECE_CATEGORIES: Record<string, string> = {
  blazer: "blazers",
  jeans: "jeans",
  dress: "dresses",
  pants: "pants",
  blouse: "blouses",
  sweater: "blouses",
  skirt: "skirts",
  coat: "outerwear",
  shoes: "shoes",
  "bag accessories": "accessories",
};

async function fetchPieces(preferredBrands?: string[], gender: "women" | "men" = "women"): Promise<Product[]> {
  const products: Product[] = [];
  const stores = getStoreList(preferredBrands);
  const promises: Promise<void>[] = [];

  for (const query of PIECE_QUERIES) {
    // Search 2 brands per query (rate-limit friendly), rotate
    const selectedStores = stores.slice(0, 2);
    for (const { config, brand } of selectedStores) {
      promises.push(
        searchStoreBatch(config, brand, query, 2, gender).then((results) => {
          for (const r of results) {
            products.push(toProduct(r, PIECE_CATEGORIES[query] || "blouses"));
          }
        })
      );
    }
    // Rotate stores so different queries hit different brands
    stores.push(stores.shift()!);
  }

  await Promise.all(promises);
  return products;
}

// --- Route handler ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tab, capsuleWardrobe, outfitFormulas, preferredBrands, gender } = body;
    const genderFilter: "women" | "men" = gender === "men" ? "men" : "women";

    // Build cache key from tab + relevant data
    const cacheKey = `${tab}-${JSON.stringify(
      tab === "capsule" ? capsuleWardrobe : tab === "outfits" ? outfitFormulas : preferredBrands
    )}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let result: unknown;

    switch (tab) {
      case "capsule": {
        if (!capsuleWardrobe) {
          console.log("[products] No capsuleWardrobe in request");
          return NextResponse.json({ products: [] });
        }
        const itemCount = Object.values(capsuleWardrobe).flat().length;
        console.log(`[products] Fetching capsule: ${Object.keys(capsuleWardrobe).length} categories, ${itemCount} items`);
        const products = await fetchCapsule(capsuleWardrobe, preferredBrands, genderFilter);
        console.log(`[products] Capsule result: ${products.length} products found`);
        result = { products };
        break;
      }
      case "outfits": {
        if (!outfitFormulas) {
          return NextResponse.json({ outfits: [] });
        }
        console.log(`[products] Fetching outfits: ${outfitFormulas.length} formulas`);
        const outfits = await fetchOutfits(outfitFormulas, preferredBrands, genderFilter);
        console.log(`[products] Outfits result: ${outfits.length} outfits found`);
        result = { outfits };
        break;
      }
      case "pieces": {
        const products = await fetchPieces(preferredBrands, genderFilter);
        result = { products };
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }

    cacheSet(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json({ products: [], outfits: [] });
  }
}
