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
 *   3. Scores each product against the style profile in lib/styleProfile.ts
 *      → Uses the same scoring rubric (color, silhouette, fabric, print)
 *      → Batches of 10 products per Claude API call
 *
 *   4. Writes top-scoring items (60+) to public/products.json
 *      → Format: { products: Product[], total: number, curated: number, lastRefresh: string }
 *
 * The Next.js app reads public/products.json as a static file — no API route needed.
 */

import { Product } from "../lib/types";
import { styleProfile } from "../lib/styleProfile";

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
