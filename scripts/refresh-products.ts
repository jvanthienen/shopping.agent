/**
 * Zara Product Refresh Script
 *
 * This script is designed to be run by Claude Code with the parse.bot MCP server connected.
 * It is NOT executed directly via ts-node — Claude orchestrates each step using MCP tools.
 *
 * Usage:
 *   Ask Claude: "refresh my Zara picks"
 *
 * What Claude does:
 *   1. Calls parse MCP tool: get_categories()
 *      → Finds "MUJER" > "NOVEDADES" (new arrivals) category
 *      → Extracts the category ID
 *
 *   2. Calls parse MCP tool: get_category_products(id=<categoryId>)
 *      → Gets product list with name, price, images, URL
 *
 *   3. STRICT SIZE FILTERING — for each candidate product, calls get_product_sizes(product_id)
 *      → Returns sizes per color with in_stock status (e.g., "26 (US 2)", in_stock: true)
 *      → Checks if the product is available in the user's size (see styleProfile.sizes)
 *      → Maps product category to size type:
 *          blouses/tops → tops (S, M)
 *          jeans → jeans (26, 28)
 *          pants → pants (6, 8)
 *          dresses → dresses (S, M)
 *          shoes → shoes (7.5)
 *          outerwear/blazers → outerwear (S, M)
 *          skirts → skirts (S, M)
 *      → Match sizes flexibly: "26 (US 2)" matches user size "26", "S" matches "S", etc.
 *      → CRITICAL: Only count a size as available if inStock === true (not just present in list)
 *        A size that exists but has inStock: false means it is OUT OF STOCK — do NOT include it
 *      → If NONE of the user's sizes have inStock: true, SKIP the product entirely
 *      → If available, store the matching in-stock size in product.selectedSize (e.g., "26")
 *      → Store all sizes in product.availableSizes (with their actual inStock status)
 *      → When writing the product, set selectedSize ONLY to a size confirmed inStock: true
 *      → Note: Zara does NOT support size pre-selection via URL params.
 *        The selectedSize is shown in the UI so the user knows what to pick.
 *
 *   4. Scores each size-available product against the style profile
 *      → Uses the same scoring rubric (color, silhouette, fabric, print)
 *      → Batches of 10 products per Claude API call
 *
 *   5. Writes top-scoring items (60+) to public/products.json
 *      → Format: { products: Product[], total: number, curated: number, lastRefresh: string }
 *
 * The Next.js app reads public/products.json as a static file — no API route needed.
 */

import { Product } from "../lib/types";
import { DEFAULT_STYLE_PROFILE as styleProfile } from "../lib/styleProfile";

// Re-export for reference — Claude uses these types when writing products.json
export type { Product };
export { styleProfile };

// Shape of the output file
export interface ProductsFile {
  products: Product[];
  total: number;
  curated: number;
  lastRefresh: string;
}
