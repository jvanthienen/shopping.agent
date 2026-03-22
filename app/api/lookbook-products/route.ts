import { NextRequest, NextResponse } from "next/server";
import { findProduct, toSearchQuery, SearchProduct } from "@/lib/productSearch";

export async function POST(req: NextRequest) {
  try {
    const { capsuleWardrobe, outfitFormulas, preferredBrands, gender: reqGender } = await req.json();
    const gender: "women" | "men" = reqGender === "men" ? "men" : "women";

    if (!process.env.PARSE_BOT_API_KEY) {
      return NextResponse.json({ capsule: {}, outfits: [] });
    }

    // Fetch capsule products by category
    const capsuleResults: Record<string, SearchProduct[]> = {};
    const capsulePromises: Promise<void>[] = [];

    if (capsuleWardrobe) {
      for (const [category, items] of Object.entries(capsuleWardrobe)) {
        capsuleResults[category] = [];
        const itemList = items as string[];
        for (const item of itemList.slice(0, 6)) {
          capsulePromises.push(
            findProduct(toSearchQuery(item), preferredBrands, gender).then((product) => {
              if (product) capsuleResults[category].push(product);
            })
          );
        }
      }
    }

    // Fetch outfit formula products
    const outfitResults: { formula: string; products: SearchProduct[] }[] = [];
    const outfitPromises: Promise<void>[] = [];

    if (outfitFormulas) {
      for (const formula of (outfitFormulas as string[]).slice(0, 4)) {
        const outfitEntry = { formula, products: [] as SearchProduct[] };
        outfitResults.push(outfitEntry);

        const parts = formula
          .split(/\s*\+\s*/)
          .map((p: string) => p.replace(/\s*\([^)]*\)\s*$/, "").trim())
          .filter(Boolean);

        for (const part of parts) {
          outfitPromises.push(
            findProduct(part, preferredBrands, gender).then((product) => {
              if (product) outfitEntry.products.push(product);
            })
          );
        }
      }
    }

    await Promise.all([...capsulePromises, ...outfitPromises]);

    return NextResponse.json({ capsule: capsuleResults, outfits: outfitResults });
  } catch (err) {
    console.error("Lookbook products error:", err);
    return NextResponse.json({ capsule: {}, outfits: [] });
  }
}
