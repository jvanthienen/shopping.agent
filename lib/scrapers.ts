// Scraper registry — maps brand names to parse.bot scraper configs
// Add new brands here as scrapers are created

export interface ScraperConfig {
  scraperId: string;
  searchEndpoint: string;
  /** Extra params to send with every search (e.g. section: "WOMAN" for Zara) */
  searchParams?: Record<string, unknown>;
  /** Field path overrides for parsing product responses */
  fieldMap?: {
    products?: string;      // path to products array in response
    name?: string;          // field name for product name
    price?: string;         // field name for price
    image?: string;         // field name for image URL
    url?: string;           // field name for product URL
  };
  /** Custom price formatter (e.g. Zara prices are in cents) */
  priceTransform?: "cents" | "raw";
  /** Custom image URL transform */
  imageTransform?: "zara-width" | "raw";
  /** How this scraper handles gender filtering (if absent, gender keyword is prepended to queries) */
  genderFilter?: {
    param: string;
    values: { women: string; men: string };
  };
}

// Known scrapers — these are pre-built and ready to use
export const SCRAPER_REGISTRY: Record<string, ScraperConfig> = {
  Zara: {
    scraperId: "f899b784-cff0-476f-9101-d2b451738f7b",
    searchEndpoint: "search_products",
    fieldMap: {
      name: "name",
      price: "price",
    },
    priceTransform: "cents",
    imageTransform: "zara-width",
    genderFilter: { param: "section", values: { women: "WOMAN", men: "MAN" } },
  },
  Uniqlo: {
    scraperId: "359db82b-de83-4e77-8304-4a55e0a972c7",
    searchEndpoint: "search_products",
    fieldMap: {
      name: "name",
      price: "base_price",
      image: "main_image",
      url: "product_url",
    },
    genderFilter: { param: "section", values: { women: "women", men: "men" } },
  },
  Quince: {
    scraperId: "cfc889fe-17f1-4ff1-9061-08d98bd25ee7",
    searchEndpoint: "search_products",
    genderFilter: { param: "gender", values: { women: "Female", men: "Male" } },
  },
  Anthropologie: {
    scraperId: "97b65c27-aba1-4d44-a85c-fa017bc78f93",
    searchEndpoint: "search_products",
    fieldMap: {
      products: "data.products",
      name: "name",
      image: "image",
      url: "url",
    },
  },
  "H&M": {
    scraperId: "3f1ac172-e4d0-4247-9ea5-28f38f4469f9",
    searchEndpoint: "search_products",
  },
  Everlane: {
    scraperId: "725f4930-89a5-4140-8396-97328b25417d",
    searchEndpoint: "search_products",
    fieldMap: {
      products: "data.products",
      name: "title",
      image: "image",
      url: "url",
    },
  },
  COS: {
    scraperId: "567d5bd0-2fe7-4203-8c8c-79a0f2ca5e6a",
    searchEndpoint: "search_products",
    fieldMap: {
      products: "data.products",
      name: "name",
      image: "primary_image",
      url: "product_url",
    },
  },
  ASOS: {
    scraperId: "8a317305-eda1-4582-8146-edf5dc5b0001",
    searchEndpoint: "search_products",
  },
  // Mango: search needs revision (returns suggestions only, not products)
  // "& Other Stories": scraper building (task fca1124e-bdf1-43de-b25d-73fdbfa31401)
};

/**
 * Normalize a user-entered brand name to a registry key.
 * Handles URLs like "anthropologie.com" → "Anthropologie"
 * and plain names like "h&m" → "H&M"
 */
// Common aliases for brand names (domain → registry key)
const BRAND_ALIASES: Record<string, string> = {
  hm: "H&M",
  "h&m": "H&M",
  stories: "& Other Stories",
  otherstories: "& Other Stories",
  cos: "COS",
};

export function normalizeBrandName(input: string): string {
  let name = input.trim();

  // Extract domain from URL-like input
  try {
    const url = new URL(name.startsWith("http") ? name : `https://${name}`);
    name = url.hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    // Not a URL, use as-is
  }

  // Check aliases
  const aliasKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [alias, registryKey] of Object.entries(BRAND_ALIASES)) {
    if (aliasKey === alias.replace(/[^a-z0-9]/g, "")) return registryKey;
  }

  // Check case-insensitive match against registry
  const lower = name.toLowerCase();
  for (const key of Object.keys(SCRAPER_REGISTRY)) {
    if (key.toLowerCase() === lower) return key;
  }

  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Look up a scraper config for a brand name (case-insensitive).
 */
export function getScraperForBrand(brand: string): ScraperConfig | null {
  // Direct match
  if (SCRAPER_REGISTRY[brand]) return SCRAPER_REGISTRY[brand];

  // Case-insensitive match
  const lower = brand.toLowerCase();
  for (const [key, config] of Object.entries(SCRAPER_REGISTRY)) {
    if (key.toLowerCase() === lower) return config;
  }

  return null;
}
