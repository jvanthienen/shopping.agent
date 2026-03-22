/**
 * Bulk-fetch product catalog from all 8 brands via parse.bot REST API.
 *
 * Searches 10 clothing categories across 8 brands, extracts color data,
 * and writes a unified products.json with 500+ products.
 *
 * Usage: npx tsx scripts/bulk-fetch-catalog.ts
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.PARSE_BOT_API_KEY || "";
const BASE_URL = "https://api.parse.bot/scraper";

if (!API_KEY) {
  console.error("Missing PARSE_BOT_API_KEY in environment");
  process.exit(1);
}

// --- Brand configurations ---

interface BrandConfig {
  scraperId: string;
  searchEndpoint: string;
  searchParams?: Record<string, unknown>;
  priceInCents?: boolean;
  productsPath?: string; // dot-separated path to products array
  fieldMap: {
    name: string | string[];       // field names to try for product name
    price: string | string[];      // field names to try for price
    image: string | string[];      // field names to try for image URL
    url: string | string[];        // field names to try for product URL
    color?: string | string[];     // field names for color name
    colorHex?: string | string[];  // field names for color hex
    colors?: string;               // field for colors array
  };
  imageTransform?: (url: string) => string;
  urlTransform?: (product: Record<string, unknown>) => string;
}

const BRANDS: Record<string, BrandConfig> = {
  Zara: {
    scraperId: "f899b784-cff0-476f-9101-d2b451738f7b",
    searchEndpoint: "search_products",
    searchParams: { section: "WOMAN", limit: 36 },
    priceInCents: true,
    fieldMap: {
      name: "name",
      price: "price",
      image: "xmedia",
      url: "seo",
      color: "colorInfo",
      colorHex: "colorInfo",
      colors: "availableColors",
    },
    imageTransform: (url: string) => url.replace("{width}", "600"),
    urlTransform: (p: Record<string, unknown>) => {
      const seo = p.seo as { keyword?: string; seoProductId?: string } | undefined;
      if (seo?.keyword) {
        return `https://www.zara.com/us/en/${seo.keyword}-p${seo.seoProductId}.html`;
      }
      return "";
    },
  },
  Uniqlo: {
    scraperId: "359db82b-de83-4e77-8304-4a55e0a972c7",
    searchEndpoint: "search_products",
    searchParams: { limit: 24, section: "women" },
    fieldMap: {
      name: "name",
      price: "base_price",
      image: "main_image",
      url: "product_url",
      colors: "colors",
    },
  },
  Quince: {
    scraperId: "cfc889fe-17f1-4ff1-9061-08d98bd25ee7",
    searchEndpoint: "search_products",
    searchParams: { limit: 20 },
    fieldMap: {
      name: ["name", "title"],
      price: ["price", "base_price"],
      image: ["image_url", "image", "thumbnail", "main_image"],
      url: ["product_url", "url", "link"],
      color: ["color", "color_name"],
    },
  },
  Anthropologie: {
    scraperId: "97b65c27-aba1-4d44-a85c-fa017bc78f93",
    searchEndpoint: "search_products",
    productsPath: "data.products",
    fieldMap: {
      name: ["name", "title"],
      price: ["price", "base_price"],
      image: ["image", "image_url", "thumbnail"],
      url: ["url", "product_url", "link"],
      color: ["color", "color_name"],
    },
  },
  "H&M": {
    scraperId: "3f1ac172-e4d0-4247-9ea5-28f38f4469f9",
    searchEndpoint: "search_products",
    fieldMap: {
      name: ["name", "title"],
      price: ["price", "base_price"],
      image: ["image_url", "image", "thumbnail"],
      url: ["product_url", "url", "link"],
      color: ["color_name", "color"],
      colorHex: ["color_hex"],
      colors: "color_swatches",
    },
  },
  Everlane: {
    scraperId: "725f4930-89a5-4140-8396-97328b25417d",
    searchEndpoint: "search_products",
    productsPath: "data.products",
    fieldMap: {
      name: ["title", "name"],
      price: ["price", "base_price"],
      image: ["image", "image_url"],
      url: ["url", "product_url"],
      color: ["color", "color_name"],
    },
  },
  COS: {
    scraperId: "567d5bd0-2fe7-4203-8c8c-79a0f2ca5e6a",
    searchEndpoint: "search_products",
    productsPath: "data.products",
    fieldMap: {
      name: "name",
      price: ["price", "base_price"],
      image: ["primary_image", "image_url", "image"],
      url: ["product_url", "url"],
      color: ["color", "color_name"],
    },
  },
  ASOS: {
    scraperId: "8a317305-eda1-4582-8146-edf5dc5b0001",
    searchEndpoint: "search_products",
    fieldMap: {
      name: ["name", "title"],
      price: ["price", "base_price"],
      image: ["image_url", "image", "thumbnail"],
      url: ["product_url", "url", "link"],
      color: ["color", "colour"],
    },
  },
};

const CATEGORIES = [
  "blazer",
  "dress",
  "jeans",
  "pants",
  "blouse",
  "skirt",
  "sweater",
  "coat",
  "shoes",
  "t-shirt",
];

// --- Unified product type ---

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceNum: number;         // numeric price for filtering
  color: string;            // primary color name
  colorHex: string;         // hex code (e.g., "#121315")
  availableColors: { name: string; hex?: string }[];
  imageUrl: string;
  productUrl: string;
}

// --- Helpers ---

function getField(obj: Record<string, unknown>, fields: string | string[]): unknown {
  const fieldList = Array.isArray(fields) ? fields : [fields];
  for (const f of fieldList) {
    if (obj[f] !== undefined && obj[f] !== null && obj[f] !== "") return obj[f];
  }
  return undefined;
}

function extractProducts(data: Record<string, unknown>, productsPath?: string): Record<string, unknown>[] {
  if (productsPath) {
    const result = productsPath.split(".").reduce((obj: unknown, key: string) => {
      return (obj as Record<string, unknown>)?.[key];
    }, data) as Record<string, unknown>[] | undefined;
    if (Array.isArray(result)) return result;
  }
  // Try common paths
  for (const key of ["products", "results", "items"]) {
    if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
  }
  const d = data.data as Record<string, unknown> | undefined;
  if (d) {
    for (const key of ["products", "results", "items"]) {
      if (Array.isArray(d[key])) return d[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function parsePrice(raw: unknown, inCents: boolean): { formatted: string; num: number } {
  if (typeof raw === "number") {
    const val = inCents ? raw / 100 : raw;
    return { formatted: `$${val.toFixed(2)}`, num: val };
  }
  if (typeof raw === "string") {
    const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      return { formatted: raw.startsWith("$") ? raw : `$${num.toFixed(2)}`, num };
    }
  }
  return { formatted: "", num: 0 };
}

function parseZaraProduct(p: Record<string, unknown>, category: string): CatalogProduct | null {
  const name = p.name as string;
  if (!name) return null;

  const price = parsePrice(p.price, true);
  if (!price.formatted) return null;

  // Image
  const xmedia = p.xmedia as { url?: string }[] | undefined;
  const imageUrl = xmedia?.[0]?.url?.replace("{width}", "600") || "";
  if (!imageUrl) return null;

  // URL
  const seo = p.seo as { keyword?: string; seoProductId?: string } | undefined;
  const productUrl = seo?.keyword
    ? `https://www.zara.com/us/en/${seo.keyword}-p${seo.seoProductId}.html`
    : "";

  // Colors
  const colorInfo = p.colorInfo as { mainColorHexCode?: string } | undefined;
  const availableColors = (p.availableColors as { colorName?: string; hexColor?: string }[] || [])
    .map((c) => ({ name: c.colorName || "", hex: c.hexColor || "" }))
    .filter((c) => c.name);
  const primaryColor = availableColors[0]?.name || "";
  const primaryHex = colorInfo?.mainColorHexCode || availableColors[0]?.hex || "";

  return {
    id: `${category}-zara-${(p.id || Date.now()).toString()}`,
    name: titleCase(name),
    brand: "Zara",
    category,
    price: price.formatted,
    priceNum: price.num,
    color: primaryColor,
    colorHex: primaryHex,
    availableColors,
    imageUrl,
    productUrl,
  };
}

function parseGenericProduct(
  p: Record<string, unknown>,
  brand: string,
  config: BrandConfig,
  category: string,
  index: number
): CatalogProduct | null {
  const name = getField(p, config.fieldMap.name) as string;
  if (!name) return null;

  const rawPrice = getField(p, config.fieldMap.price);
  const price = parsePrice(rawPrice, config.priceInCents || false);

  const imageUrl = getField(p, config.fieldMap.image) as string || "";
  if (!imageUrl) return null;

  let productUrl = getField(p, config.fieldMap.url) as string || "";
  if (config.urlTransform) productUrl = config.urlTransform(p) || productUrl;
  if (config.imageTransform && imageUrl) {
    // Image transform is handled at output
  }

  // Color extraction
  let primaryColor = "";
  let primaryHex = "";
  const availableColors: { name: string; hex?: string }[] = [];

  // Try colors array
  if (config.fieldMap.colors) {
    const colors = p[config.fieldMap.colors];
    if (Array.isArray(colors)) {
      for (const c of colors) {
        if (typeof c === "object" && c !== null) {
          const co = c as Record<string, unknown>;
          const cName = (co.name || co.colorName || co.color_name || co.colour || "") as string;
          const cHex = (co.hex || co.hexColor || co.hex_color || co.color_hex || "") as string;
          if (cName) availableColors.push({ name: cName, hex: cHex || undefined });
        }
      }
    }
  }

  // Try direct color fields
  if (config.fieldMap.color) {
    const colorVal = getField(p, config.fieldMap.color);
    if (typeof colorVal === "string" && colorVal) {
      primaryColor = colorVal;
    }
  }
  if (config.fieldMap.colorHex) {
    const hexVal = getField(p, config.fieldMap.colorHex);
    if (typeof hexVal === "string" && hexVal) {
      primaryHex = hexVal;
    }
  }

  if (!primaryColor && availableColors.length > 0) {
    primaryColor = availableColors[0].name;
    primaryHex = availableColors[0].hex || "";
  }

  const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  return {
    id: `${category}-${brandSlug}-${index}`,
    name: titleCase(name),
    brand,
    category,
    price: price.formatted || "",
    priceNum: price.num,
    color: primaryColor,
    colorHex: primaryHex,
    availableColors,
    imageUrl: config.imageTransform ? config.imageTransform(imageUrl) : imageUrl,
    productUrl,
  };
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bZw\b/g, "ZW")
    .replace(/\bHm\b/g, "H&M");
}

// --- Rate-limited fetcher ---

let requestCount = 0;
const startTime = Date.now();

async function rateLimitedFetch(url: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  // Enforce 18 req/min
  requestCount++;
  const elapsed = Date.now() - startTime;
  const expectedTime = (requestCount / 18) * 60000;
  if (elapsed < expectedTime) {
    await new Promise((r) => setTimeout(r, expectedTime - elapsed + 100));
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 402) {
        console.error("  ✗ Credits exhausted!");
        return null;
      }
      console.warn(`  ✗ HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.error) {
      console.warn(`  ✗ API error:`, data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`  ✗ Fetch error:`, (err as Error).message);
    return null;
  }
}

// --- Main ---

async function main() {
  const allProducts: CatalogProduct[] = [];
  const seen = new Set<string>(); // deduplicate by name+brand

  console.log(`\n🛍️  Bulk-fetching catalog from ${Object.keys(BRANDS).length} brands × ${CATEGORIES.length} categories\n`);

  for (const category of CATEGORIES) {
    console.log(`\n📦 Category: ${category}`);

    for (const [brand, config] of Object.entries(BRANDS)) {
      const url = `${BASE_URL}/${config.scraperId}/${config.searchEndpoint}`;
      const body = { query: category, ...config.searchParams };

      process.stdout.write(`  ${brand}... `);
      const data = await rateLimitedFetch(url, body);

      if (!data) {
        console.log("skipped");
        continue;
      }

      const products = extractProducts(data, config.productsPath);
      let count = 0;

      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        let product: CatalogProduct | null = null;

        if (brand === "Zara") {
          product = parseZaraProduct(p, category);
        } else {
          product = parseGenericProduct(p, brand, config, category, i);
        }

        if (!product) continue;

        // Deduplicate
        const key = `${product.name.toLowerCase()}-${product.brand}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Skip items with no image or extremely generic names
        if (!product.imageUrl || product.name.length < 3) continue;

        allProducts.push(product);
        count++;
      }

      console.log(`${count} products`);
    }
  }

  // Sort by brand then category
  allProducts.sort((a, b) => {
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  // Re-assign IDs after sorting
  const brandCategoryCount: Record<string, number> = {};
  for (const p of allProducts) {
    const key = `${p.category}-${p.brand.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    brandCategoryCount[key] = (brandCategoryCount[key] || 0) + 1;
    p.id = `${key}-${brandCategoryCount[key]}`;
  }

  // Write output
  const output = {
    products: allProducts,
    total: allProducts.length,
    lastRefresh: new Date().toISOString(),
    brands: [...new Set(allProducts.map((p) => p.brand))],
    categories: [...new Set(allProducts.map((p) => p.category))],
  };

  const outPath = path.join(__dirname, "..", "public", "products.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  // Summary
  console.log(`\n✅ Done! ${allProducts.length} products saved to products.json\n`);
  console.log("By brand:");
  const byBrand: Record<string, number> = {};
  for (const p of allProducts) byBrand[p.brand] = (byBrand[p.brand] || 0) + 1;
  for (const [b, n] of Object.entries(byBrand).sort()) console.log(`  ${b}: ${n}`);

  console.log("\nBy category:");
  const byCat: Record<string, number> = {};
  for (const p of allProducts) byCat[p.category] = (byCat[p.category] || 0) + 1;
  for (const [c, n] of Object.entries(byCat).sort()) console.log(`  ${c}: ${n}`);

  console.log(`\nWith color data: ${allProducts.filter((p) => p.color).length}/${allProducts.length}`);
  console.log(`With hex codes: ${allProducts.filter((p) => p.colorHex).length}/${allProducts.length}`);
  console.log(`API calls used: ${requestCount}`);
}

main().catch(console.error);
