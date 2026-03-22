/**
 * Product matching & scoring — filters the local catalog against a StyleProfile.
 *
 * Scoring dimensions (0-100):
 *   Color match:        0-30 pts  (in good palette? avoid list?)
 *   Category relevance: 0-25 pts  (in capsule wardrobe?)
 *   Fabric hints:       0-15 pts  (good/bad fabric keywords in name)
 *   Silhouette hints:   0-15 pts  (good/bad silhouettes in name)
 *   Brand preference:   0-15 pts  (preferred brand?)
 *
 * No API calls — works entirely on local data.
 */

import { StyleProfile } from "./types";

// --- Types ---

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceNum?: number;
  color: string;
  colorHex: string;
  availableColors?: { name: string; hex?: string }[];
  imageUrl: string;
  productUrl: string;
}

export interface ScoredProduct extends CatalogProduct {
  score: number;
  matchReason: string;
  isGreatMatch: boolean;
  scoreBreakdown: {
    color: number;
    category: number;
    fabric: number;
    silhouette: number;
    brand: number;
  };
}

// --- Color extraction from product names ---

const COLOR_KEYWORDS: Record<string, string> = {
  // Neutrals
  "black": "black", "noir": "black", "onyx": "black", "jet": "black", "ebony": "black",
  "white": "white", "ivory": "ivory", "cream": "cream", "ecru": "ecru", "off-white": "off white",
  "off white": "off white", "snow": "white",
  "gray": "gray", "grey": "gray", "charcoal": "charcoal", "slate": "slate",
  "silver": "silver", "ash": "gray", "heather": "gray", "graphite": "charcoal",

  // Browns & earth
  "brown": "brown", "tan": "tan", "camel": "camel", "beige": "beige",
  "taupe": "taupe", "khaki": "khaki", "sand": "sand", "mocha": "brown",
  "chocolate": "chocolate brown", "espresso": "dark brown", "cognac": "brown",
  "caramel": "camel", "tobacco": "brown", "cinnamon": "brown", "rust": "rust",
  "terracotta": "rust", "copper": "rust", "sienna": "rust", "ochre": "rust",
  "olive": "olive", "army": "olive", "military": "olive",

  // Blues
  "navy": "navy blue", "indigo": "indigo", "cobalt": "cobalt",
  "denim": "denim blue", "steel": "steel blue", "sky": "light blue",
  "light blue": "light blue", "powder blue": "light blue", "baby blue": "light blue",
  "royal blue": "royal blue", "teal": "teal", "marine": "navy blue",
  "midnight": "navy blue", "azure": "blue", "cerulean": "blue",

  // Greens
  "sage": "sage green", "forest": "forest green", "emerald": "emerald green",
  "hunter": "forest green", "moss": "sage green", "mint": "mint green",
  "pine": "pine green", "pistachio": "mint green", "jade": "emerald green",
  "seafoam": "mint green", "eucalyptus": "sage green",

  // Pinks & reds
  "pink": "pink", "blush": "blush", "rose": "rose", "dusty rose": "dusty rose",
  "mauve": "mauve", "fuchsia": "fuchsia", "magenta": "magenta",
  "coral": "coral", "salmon": "salmon", "peach": "peach",
  "red": "red", "crimson": "crimson", "scarlet": "scarlet", "cherry": "cherry red",
  "burgundy": "burgundy", "wine": "wine", "berry": "berry", "maroon": "maroon",
  "plum": "plum", "raspberry": "raspberry",

  // Purples
  "purple": "purple", "violet": "violet", "lavender": "lavender",
  "lilac": "lilac", "orchid": "orchid purple", "periwinkle": "periwinkle",
  "amethyst": "purple", "aubergine": "plum",

  // Yellows & oranges
  "yellow": "yellow", "mustard": "mustard", "gold": "gold", "golden": "gold",
  "amber": "amber", "lemon": "yellow", "buttercream": "cream",
  "orange": "orange", "tangerine": "orange", "apricot": "peach",

  // Patterns (not colors but useful to know)
  "striped": "striped", "plaid": "plaid", "floral": "floral",
  "leopard": "leopard", "zebra": "zebra", "gingham": "gingham",
  "check": "check", "houndstooth": "houndstooth", "polka": "polka dot",
  "multicolor": "multicolored", "multicoloured": "multicolored",
  "printed": "printed", "tie-dye": "tie-dye", "camo": "camo",
};

/**
 * Extract color name from a product name or explicit color field.
 * Returns a normalized color name like "navy blue", "dusty rose", etc.
 */
export function extractProductColor(product: CatalogProduct): string {
  // 1. Use explicit color if available
  if (product.color && product.color.toLowerCase() !== "multicolored") {
    return product.color.toLowerCase();
  }

  // 2. Extract from product name (longer keywords first to match "dusty rose" before "rose")
  const name = product.name.toLowerCase();
  const sortedKeys = Object.keys(COLOR_KEYWORDS).sort((a, b) => b.length - a.length);

  for (const keyword of sortedKeys) {
    // Word boundary check — don't match "cream" in "screaming"
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(name)) {
      return COLOR_KEYWORDS[keyword];
    }
  }

  return product.color?.toLowerCase() || "";
}

// --- Fabric keywords ---

const FABRIC_KEYWORDS: Record<string, string> = {
  "cashmere": "cashmere", "wool": "wool", "merino": "wool",
  "silk": "silk", "satin": "silk", "charmeuse": "silk",
  "cotton": "cotton", "linen": "linen", "denim": "denim",
  "leather": "leather", "suede": "suede", "faux leather": "faux leather",
  "vegan leather": "faux leather",
  "jersey": "jersey", "knit": "knit", "ribbed": "knit",
  "tweed": "tweed", "corduroy": "corduroy",
  "chiffon": "chiffon", "organza": "organza", "tulle": "tulle",
  "velvet": "velvet", "fleece": "fleece",
  "polyester": "polyester", "nylon": "nylon", "acrylic": "acrylic",
  "viscose": "viscose", "rayon": "viscose",
  "poplin": "cotton", "chambray": "cotton", "twill": "cotton",
  "ponte": "ponte", "crepe": "crepe",
};

function extractFabric(name: string): string[] {
  const lower = name.toLowerCase();
  const found: string[] = [];
  const sortedKeys = Object.keys(FABRIC_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const kw of sortedKeys) {
    if (lower.includes(kw) && !found.includes(FABRIC_KEYWORDS[kw])) {
      found.push(FABRIC_KEYWORDS[kw]);
    }
  }
  return found;
}

// --- Silhouette keywords ---

const SILHOUETTE_KEYWORDS: string[] = [
  "fitted", "slim", "skinny", "bodycon", "tight",
  "relaxed", "loose", "oversized", "boxy", "wide",
  "a-line", "flared", "pleated", "wrap", "belted",
  "straight", "tapered", "cropped", "midi", "mini", "maxi",
  "high-waist", "high waist", "low-rise", "mid-rise",
  "v-neck", "crew neck", "turtleneck", "mock neck", "scoop",
  "off-shoulder", "strapless", "halter", "ruffle", "puff sleeve",
  "structured", "tailored", "draped", "flowy",
];

function extractSilhouettes(name: string): string[] {
  const lower = name.toLowerCase();
  return SILHOUETTE_KEYWORDS.filter((kw) => lower.includes(kw));
}

// --- Scoring ---

function normalizeColor(color: string): string {
  return color.toLowerCase().replace(/[-_]/g, " ").trim();
}

function colorsMatch(productColor: string, profileColor: string): boolean {
  const pc = normalizeColor(productColor);
  const pr = normalizeColor(profileColor);

  // Exact match
  if (pc === pr) return true;

  // Partial match — "navy" matches "navy blue", "dusty rose" matches "rose"
  if (pc.includes(pr) || pr.includes(pc)) return true;

  // Root word match — "brown" in "chocolate brown", "blue" in "steel blue"
  const pcWords = pc.split(" ");
  const prWords = pr.split(" ");
  for (const pw of pcWords) {
    for (const prw of prWords) {
      if (pw === prw && pw.length > 3) return true; // skip short words like "off"
    }
  }

  return false;
}

function scoreColor(productColor: string, profile: StyleProfile): { score: number; reason: string } {
  if (!productColor) return { score: 10, reason: "" }; // Unknown color — neutral score

  // Check good colors
  for (const gc of profile.goodColors) {
    if (colorsMatch(productColor, gc)) {
      return { score: 30, reason: `${productColor} is in your palette` };
    }
  }

  // Check avoid colors
  for (const ac of profile.avoidColors) {
    if (colorsMatch(productColor, ac)) {
      return { score: 0, reason: `${productColor} is in your avoid list` };
    }
  }

  // Neutral — not explicitly good or bad
  return { score: 15, reason: "" };
}

function scoreCategory(
  product: CatalogProduct,
  profile: StyleProfile
): { score: number; reason: string } {
  const category = product.category.toLowerCase();

  // Check if category appears in capsule wardrobe
  for (const [key, items] of Object.entries(profile.capsuleWardrobe)) {
    const keyLower = key.toLowerCase();
    if (
      keyLower.includes(category) ||
      category.includes(keyLower) ||
      // Map common synonyms
      (category === "blouse" && (keyLower.includes("top") || keyLower.includes("shirt"))) ||
      (category === "t-shirt" && (keyLower.includes("top") || keyLower.includes("tee"))) ||
      (category === "coat" && keyLower.includes("outerwear")) ||
      (category === "pants" && keyLower.includes("trouser")) ||
      (category === "sweater" && keyLower.includes("knit"))
    ) {
      return { score: 25, reason: `${category} is in your capsule wardrobe` };
    }

    // Check if any capsule item mentions this category
    for (const item of items) {
      if (item.toLowerCase().includes(category)) {
        return { score: 25, reason: `${category} is in your capsule wardrobe` };
      }
    }
  }

  // Check outfit formulas
  for (const formula of profile.outfitFormulas) {
    if (formula.toLowerCase().includes(category)) {
      return { score: 20, reason: `${category} appears in your outfit formulas` };
    }
  }

  return { score: 10, reason: "" };
}

function scoreFabric(name: string, profile: StyleProfile): { score: number; reason: string } {
  const fabrics = extractFabric(name);
  if (fabrics.length === 0) return { score: 7, reason: "" };

  const goodFabrics = profile.goodFabrics.map((f) => f.toLowerCase());
  const avoidFabrics = profile.avoidFabrics.map((f) => f.toLowerCase());

  for (const fabric of fabrics) {
    // Check good fabrics
    for (const gf of goodFabrics) {
      if (gf.includes(fabric) || fabric.includes(gf)) {
        return { score: 15, reason: `${fabric} is a fabric you love` };
      }
    }
    // Check avoid fabrics
    for (const af of avoidFabrics) {
      if (af.includes(fabric) || fabric.includes(af)) {
        return { score: 0, reason: `${fabric} is a fabric to avoid` };
      }
    }
  }

  return { score: 7, reason: "" };
}

function scoreSilhouette(name: string, profile: StyleProfile): { score: number; reason: string } {
  const silhouettes = extractSilhouettes(name);
  if (silhouettes.length === 0) return { score: 7, reason: "" };

  // Flatten good silhouettes from all categories
  const goodSils: string[] = [];
  for (const sils of Object.values(profile.goodSilhouettes)) {
    for (const s of sils) goodSils.push(s.toLowerCase());
  }
  const avoidSils = profile.avoidSilhouettes.map((s) => s.toLowerCase());

  for (const sil of silhouettes) {
    for (const gs of goodSils) {
      if (gs.includes(sil) || sil.includes(gs)) {
        return { score: 15, reason: `${sil} silhouette flatters your body shape` };
      }
    }
    for (const as_ of avoidSils) {
      if (as_.includes(sil) || sil.includes(as_)) {
        return { score: 0, reason: `${sil} silhouette doesn't suit your body shape` };
      }
    }
  }

  return { score: 7, reason: "" };
}

function scoreBrand(brand: string, profile: StyleProfile): { score: number; reason: string } {
  const preferred = profile.preferredBrands || [];
  if (preferred.length === 0) return { score: 7, reason: "" };

  const brandLower = brand.toLowerCase();
  for (const pb of preferred) {
    if (pb.toLowerCase() === brandLower) {
      return { score: 15, reason: `${brand} is one of your preferred brands` };
    }
  }

  return { score: 5, reason: "" };
}

// --- Main scoring function ---

export function scoreProduct(product: CatalogProduct, profile: StyleProfile): ScoredProduct {
  const productColor = extractProductColor(product);
  const color = scoreColor(productColor, profile);
  const category = scoreCategory(product, profile);
  const fabric = scoreFabric(product.name, profile);
  const silhouette = scoreSilhouette(product.name, profile);
  const brand = scoreBrand(product.brand, profile);

  const totalScore = color.score + category.score + fabric.score + silhouette.score + brand.score;

  // Build match reason from the top-scoring dimensions
  const reasons = [color.reason, category.reason, fabric.reason, silhouette.reason, brand.reason]
    .filter(Boolean);
  const matchReason = reasons.length > 0 ? reasons.join(". ") : "General wardrobe piece";

  return {
    ...product,
    color: productColor || product.color, // Update with extracted color
    score: totalScore,
    matchReason,
    isGreatMatch: totalScore >= 75,
    scoreBreakdown: {
      color: color.score,
      category: category.score,
      fabric: fabric.score,
      silhouette: silhouette.score,
      brand: brand.score,
    },
  };
}

/**
 * Score and rank all products against a profile.
 * Returns products sorted by score (highest first).
 * Optional: filter by minimum score, category, brand.
 */
export function rankProducts(
  products: CatalogProduct[],
  profile: StyleProfile,
  options?: {
    minScore?: number;
    category?: string;
    brand?: string;
    limit?: number;
  }
): ScoredProduct[] {
  let scored = products.map((p) => scoreProduct(p, profile));

  // Filter
  if (options?.minScore) {
    scored = scored.filter((p) => p.score >= options.minScore!);
  }
  if (options?.category) {
    scored = scored.filter((p) => p.category === options.category);
  }
  if (options?.brand) {
    scored = scored.filter((p) => p.brand === options.brand);
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Limit
  if (options?.limit) {
    scored = scored.slice(0, options.limit);
  }

  return scored;
}

/**
 * Get personalized product recommendations grouped by capsule wardrobe category.
 * Shows the best matches for each category in the person's capsule.
 */
export function getPersonalizedRecommendations(
  products: CatalogProduct[],
  profile: StyleProfile,
  perCategory: number = 6
): Record<string, ScoredProduct[]> {
  const scored = products.map((p) => scoreProduct(p, profile));
  const result: Record<string, ScoredProduct[]> = {};

  // Get categories from capsule wardrobe
  const capsuleCategories = Object.keys(profile.capsuleWardrobe);

  // Map capsule categories to product categories
  const categoryMap: Record<string, string[]> = {
    tops: ["blouse", "t-shirt"],
    shirts: ["blouse"],
    blouses: ["blouse"],
    sweaters: ["sweater"],
    knitwear: ["sweater"],
    bottoms: ["pants", "jeans"],
    pants: ["pants"],
    trousers: ["pants"],
    jeans: ["jeans"],
    skirts: ["skirt"],
    dresses: ["dress"],
    outerwear: ["coat"],
    coats: ["coat"],
    jackets: ["coat", "blazer"],
    blazers: ["blazer"],
    shoes: ["shoes"],
    footwear: ["shoes"],
    accessories: ["accessories"],
  };

  for (const capsuleCat of capsuleCategories) {
    const catLower = capsuleCat.toLowerCase();
    const productCategories = categoryMap[catLower] || [catLower];

    const matching = scored
      .filter((p) => productCategories.includes(p.category))
      .sort((a, b) => b.score - a.score)
      .slice(0, perCategory);

    if (matching.length > 0) {
      result[capsuleCat] = matching;
    }
  }

  return result;
}
