import { NextRequest, NextResponse } from "next/server";

const PARSE_API_KEY = process.env.PARSE_BOT_API_KEY || "";
const PARSE_BASE = "https://api.parse.bot/scraper";

const SCRAPERS = {
  zara: "f899b784-cff0-476f-9101-d2b451738f7b",
  uniqlo: "359db82b-de83-4e77-8304-4a55e0a972c7",
  quince: "cfc889fe-17f1-4ff1-9061-08d98bd25ee7",
};

interface LookbookProduct {
  name: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  brand: string;
}

async function searchStore(
  scraper: string,
  brand: string,
  query: string
): Promise<LookbookProduct | null> {
  try {
    const endpoint = "search_products";
    const res = await fetch(`${PARSE_BASE}/${scraper}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": PARSE_API_KEY,
      },
      body: JSON.stringify({ query, limit: 3 }),
    });
    if (!res.ok) return null;
    const data = await res.json();

    // Each scraper returns slightly different shapes
    const products = data.products || data.results || data.items || [];
    if (!products.length) return null;

    // Take first result with a valid image
    for (const p of products) {
      const imageUrl = p.imageUrl || p.image_url || p.mainImage || p.images?.[0] || p.image || "";
      if (!imageUrl) continue;
      return {
        name: p.name || p.title || p.productName || "",
        price: p.price || p.currentPrice || p.salePrice || "",
        imageUrl,
        productUrl: p.productUrl || p.url || p.product_url || p.link || "",
        brand,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function findProduct(query: string): Promise<LookbookProduct | null> {
  // Try stores in sequence — stop at first hit
  const stores = [
    { scraper: SCRAPERS.zara, brand: "Zara" },
    { scraper: SCRAPERS.uniqlo, brand: "Uniqlo" },
    { scraper: SCRAPERS.quince, brand: "Quince" },
  ];
  for (const { scraper, brand } of stores) {
    const result = await searchStore(scraper, brand, query);
    if (result) return result;
  }
  return null;
}

function stripQuantityPrefix(item: string): string {
  // "3 jeans in right cuts: blue, dark/black, white" → "jeans"
  // "1 white cotton button-down shirt" → "white cotton button-down shirt"
  return item.replace(/^\d+\s+/, "");
}

export async function POST(req: NextRequest) {
  try {
    const { capsuleWardrobe, outfitFormulas } = await req.json();

    if (!PARSE_API_KEY) {
      return NextResponse.json({ capsule: {}, outfits: [] });
    }

    // Fetch capsule products by category
    const capsuleResults: Record<string, LookbookProduct[]> = {};
    const capsulePromises: Promise<void>[] = [];

    if (capsuleWardrobe) {
      for (const [category, items] of Object.entries(capsuleWardrobe)) {
        capsuleResults[category] = [];
        const itemList = items as string[];
        // Limit to 3 items per category to keep requests manageable
        for (const item of itemList.slice(0, 3)) {
          capsulePromises.push(
            findProduct(stripQuantityPrefix(item)).then((product) => {
              if (product) capsuleResults[category].push(product);
            })
          );
        }
      }
    }

    // Fetch outfit formula products
    const outfitResults: { formula: string; products: LookbookProduct[] }[] = [];
    const outfitPromises: Promise<void>[] = [];

    if (outfitFormulas) {
      for (const formula of (outfitFormulas as string[]).slice(0, 4)) {
        const outfitEntry = { formula, products: [] as LookbookProduct[] };
        outfitResults.push(outfitEntry);

        // Split "Blazer + striped tee + dark flared jeans + pointed flats" into parts
        const parts = formula
          .split(/\s*\+\s*/)
          .map((p) => p.replace(/\s*\([^)]*\)\s*$/, "").trim())
          .filter(Boolean);

        for (const part of parts) {
          outfitPromises.push(
            findProduct(part).then((product) => {
              if (product) outfitEntry.products.push(product);
            })
          );
        }
      }
    }

    // Run all fetches concurrently (with natural rate limiting from sequential store fallback)
    await Promise.all([...capsulePromises, ...outfitPromises]);

    return NextResponse.json({ capsule: capsuleResults, outfits: outfitResults });
  } catch (err) {
    console.error("Lookbook products error:", err);
    return NextResponse.json({ capsule: {}, outfits: [] });
  }
}
