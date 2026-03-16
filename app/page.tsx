"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import OutfitCard from "@/components/OutfitCard";
import Cart from "@/components/Cart";
import { Product, Outfit } from "@/lib/types";

type Tab = "outfits" | "basics" | "pieces" | "skipped";
const CATEGORIES = ["all", "outerwear", "blazers", "blouses", "dresses", "jeans", "pants", "skirts", "shoes", "accessories"] as const;
type Category = (typeof CATEGORIES)[number];
const BRANDS = ["all", "Zara", "Uniqlo", "Quince"] as const;
type Brand = (typeof BRANDS)[number];

interface BasicProduct extends Product {
  basicRole?: string;
}

// Wardrobe sections — each defines a filter to find matching products from the catalog
const WARDROBE_SECTIONS = [
  { key: "white-shirts", label: "White shirts & tees", match: (p: Product) => {
    const n = p.name.toLowerCase(); const c = (p.color ?? "").toLowerCase();
    return p.category === "blouses" && (c.includes("white") || c.includes("ivory") || c.includes("ecru") || c.includes("off white")) && (n.includes("shirt") || n.includes("blouse") || n.includes("tee") || n.includes("t-shirt") || n.includes("tank") || n.includes("cami"));
  }},
  { key: "silk-tops", label: "Silk & elegant tops", match: (p: Product) => {
    const n = p.name.toLowerCase();
    return p.category === "blouses" && (n.includes("silk") || n.includes("satin") || n.includes("cami") || n.includes("evening"));
  }},
  { key: "sweaters", label: "Sweaters & knits", match: (p: Product) => {
    const n = p.name.toLowerCase();
    return p.category === "blouses" && (n.includes("sweater") || n.includes("knit") || n.includes("cardigan") || n.includes("pullover"));
  }},
  { key: "blazers", label: "Blazers & structured jackets", match: (p: Product) => p.category === "blazers" },
  { key: "outerwear", label: "Jackets & coats", match: (p: Product) => p.category === "outerwear" },
  { key: "jeans", label: "Jeans", match: (p: Product) => p.category === "jeans" },
  { key: "pants", label: "Elegant & casual pants", match: (p: Product) => p.category === "pants" },
  { key: "skirts", label: "Skirts", match: (p: Product) => p.category === "skirts" },
  { key: "dresses", label: "Dresses", match: (p: Product) => p.category === "dresses" },
  { key: "shoes", label: "Shoes", match: (p: Product) => p.category === "shoes" },
  { key: "accessories", label: "Bags & accessories", match: (p: Product) => p.category === "accessories" },
] as const;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [basics, setBasics] = useState<BasicProduct[]>([]);
  const [saved, setSaved] = useState<Product[]>([]);
  const [skipped, setSkipped] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("outfits");
  const [category, setCategory] = useState<Category>("all");
  const [brand, setBrand] = useState<Brand>("all");
  const [showAllPieces, setShowAllPieces] = useState(false);
  const [sectionIndex, setSectionIndex] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<{ total: number; curated: number; location?: string } | null>(null);

  useEffect(() => {
    fetch("/products.json")
      .then((r) => {
        if (!r.ok) throw new Error("No products yet — run a refresh first");
        return r.json();
      })
      .then((data) => {
        setProducts(data.products ?? []);
        setOutfits(data.outfits ?? []);
        setBasics(data.basics ?? []);
        setStats({ total: data.total ?? 0, curated: data.curated ?? 0, location: data.location });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = (product: Product) => {
    setSaved((prev) => (prev.find((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const handleSaveAll = (items: Product[]) => {
    setSaved((prev) => {
      const newItems = items.filter((item) => !prev.find((p) => p.id === item.id));
      return [...prev, ...newItems];
    });
  };

  const handleSkip = (product: Product) => {
    setSkipped((prev) => (prev.find((p) => p.id === product.id) ? prev : [...prev, product]));
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleRemoveFromCart = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  };

  // Track all product IDs already used in any outfit to avoid repeats
  const usedInOutfits = new Set(outfits.flatMap((o) => o.items.map((i) => i.id)));

  const generateSimilarOutfit = (original: Outfit): Outfit | null => {
    // Build a new outfit with the same category structure but different products
    const categories = original.items.map((i) => i.category ?? "blouses");
    const excludeIds = new Set([
      ...original.items.map((i) => i.id),
      ...saved.map((s) => s.id),
      ...usedInOutfits,
    ]);

    const newItems: Product[] = [];
    for (const cat of categories) {
      const candidate = products.find(
        (p) => p.category === cat && !excludeIds.has(p.id) && p.imageUrl
      );
      if (!candidate) return null; // can't fill this slot
      newItems.push(candidate);
      excludeIds.add(candidate.id);
    }

    const newTotal = newItems
      .reduce((sum, i) => sum + parseFloat(i.price.replace("$", "") || "0"), 0)
      .toFixed(2);

    const suffixes = ["II", "III", "IV", "V", "VI", "VII"];
    const baseName = original.name.replace(/\s+(II|III|IV|V|VI|VII)$/, "");
    let newName = baseName;
    for (const s of suffixes) {
      const tryName = `${baseName} ${s}`;
      if (!outfits.some((o) => o.name === tryName)) {
        newName = tryName;
        break;
      }
    }

    return {
      id: `${original.id}-${Date.now()}`,
      name: newName,
      vibe: original.vibe,
      items: newItems,
      totalPrice: `$${newTotal}`,
    };
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    // Save items to cart
    setSaved((prev) => {
      const newItems = outfit.items.filter((item) => !prev.find((p) => p.id === item.id));
      return [...prev, ...newItems];
    });

    // Replace with a new outfit of the same theme
    const newOutfit = generateSimilarOutfit(outfit);
    if (newOutfit) {
      setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? newOutfit : o)));
    } else {
      // No more alternatives — remove the slot
      setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
    }
  };

  const handleSwapItem = (outfitId: string, itemToReplace: Product) => {
    setOutfits((prev) =>
      prev.map((outfit) => {
        if (outfit.id !== outfitId) return outfit;
        const usedIds = new Set(outfit.items.map((i) => i.id));
        const replacement = products.find(
          (p) =>
            p.category === itemToReplace.category &&
            !usedIds.has(p.id) &&
            p.id !== itemToReplace.id
        );
        if (!replacement) return outfit;
        const newItems = outfit.items.map((i) =>
          i.id === itemToReplace.id ? replacement : i
        );
        const newTotal = newItems
          .reduce((sum, i) => sum + parseFloat(i.price.replace("$", "") || "0"), 0)
          .toFixed(2);
        return { ...outfit, items: newItems, totalPrice: `$${newTotal}` };
      })
    );
  };

  const feedProducts = products.filter(
    (p) => !skipped.find((s) => s.id === p.id) && !saved.find((s) => s.id === p.id)
  );

  const brandFiltered =
    brand === "all" ? feedProducts : feedProducts.filter((p) => p.brand === brand);
  const filteredProducts =
    category === "all" ? brandFiltered : brandFiltered.filter((p) => p.category === category);

  const displayProducts = tab === "skipped" ? skipped : filteredProducts;
  const INITIAL_SHOW = 12;
  const visibleProducts = showAllPieces ? displayProducts : displayProducts.slice(0, INITIAL_SHOW);
  const hasMore = displayProducts.length > INITIAL_SHOW;

  const categoryCounts: Record<string, number> = { all: brandFiltered.length };
  for (const p of brandFiltered) {
    const cat = p.category ?? "other";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  const brandCounts: Record<string, number> = { all: feedProducts.length };
  for (const p of feedProducts) {
    const b = p.brand ?? "Other";
    brandCounts[b] = (brandCounts[b] ?? 0) + 1;
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl tracking-tight text-stone-900">Your Shopper</h1>
            {stats && (
              <p className="text-[11px] text-stone-400 mt-0.5 tracking-wide uppercase">
                {stats.curated} curated picks
                {stats.location && <span className="text-stone-300"> &middot; </span>}
                {stats.location}
              </p>
            )}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2.5 px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all active:scale-[0.97]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Saved
            {saved.length > 0 && (
              <span className="bg-white text-stone-900 text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {saved.length}
              </span>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-5 pb-3 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { key: "outfits" as Tab, label: "Outfits", count: outfits.length },
            { key: "basics" as Tab, label: "Basics", count: basics.length },
            { key: "pieces" as Tab, label: "All Pieces", count: feedProducts.length },
            { key: "skipped" as Tab, label: "Skipped", count: skipped.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowAllPieces(false); setCategory("all"); setBrand("all"); }}
              className={`shrink-0 text-sm pb-2 border-b-2 transition-all ${
                tab === t.key
                  ? "border-stone-900 text-stone-900 font-semibold"
                  : "border-transparent text-stone-400 hover:text-stone-600 font-medium"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 ${tab === t.key ? "text-stone-500" : "text-stone-300"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Filters */}
      {(tab === "pieces" || tab === "skipped") && (
        <div className="max-w-6xl mx-auto px-5 pt-5 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {BRANDS.map((b) => {
              const count = brandCounts[b] ?? 0;
              return (
                <button
                  key={b}
                  onClick={() => { setBrand(b); setCategory("all"); setShowAllPieces(false); }}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm transition-all ${
                    brand === b
                      ? "bg-stone-900 text-white font-medium shadow-sm"
                      : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700"
                  }`}
                >
                  {b === "all" ? "All brands" : b}
                  {b !== "all" && count > 0 && (
                    <span className={`ml-1 ${brand === b ? "text-stone-400" : "text-stone-300"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.filter(cat => cat === "all" || (categoryCounts[cat] ?? 0) > 0).map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setShowAllPieces(false); }}
                className={`shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                  category === cat
                    ? "bg-stone-700 text-white font-medium"
                    : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                {cat !== "all" && <span className="ml-1 opacity-60">{categoryCounts[cat] ?? 0}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm font-light tracking-wide">Curating your picks...</p>
          </div>
        )}

        {error && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
            <p className="text-stone-800 font-medium">Something went wrong</p>
            <p className="text-stone-400 text-sm mt-1.5">{error}</p>
            <p className="text-stone-300 text-xs mt-4">Ask Claude to &quot;refresh my picks&quot; to generate products</p>
          </div>
        )}

        {/* Outfits tab */}
        {!loading && !error && tab === "outfits" && (
          <>
            {outfits.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-stone-400 font-light text-lg">No outfits curated yet</p>
              </div>
            ) : (
              <>
                <p className="text-stone-400 text-sm mb-8 font-light">
                  Complete looks styled for your Sport personality and SF weather.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {outfits.map((outfit) => (
                    <OutfitCard key={outfit.id} outfit={outfit} onSaveOutfit={handleSaveOutfit} onSwapItem={handleSwapItem} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Basics tab — organized by wardrobe sections */}
        {!loading && !error && tab === "basics" && (
          <>
            <div className="mb-8">
              <h2 className="font-serif text-xl text-stone-900">Basics for your wardrobe</h2>
              <p className="text-stone-400 text-sm mt-1 font-light">
                Browse the basics that you need to have and renew every once in a while.
              </p>
            </div>
            <div className="space-y-10">
              {WARDROBE_SECTIONS.map((section) => {
                const matches = products.filter(section.match);
                if (matches.length === 0) return null;
                const idx = sectionIndex[section.key] ?? 0;
                const visible = matches.slice(idx, idx + 4);
                const hasMore = matches.length > 4;
                return (
                  <div key={section.key}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg text-stone-800">{section.label}</h3>
                      {hasMore && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSectionIndex((prev) => ({
                              ...prev,
                              [section.key]: Math.max((prev[section.key] ?? 0) - 4, 0),
                            }))}
                            disabled={idx === 0}
                            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => setSectionIndex((prev) => ({
                              ...prev,
                              [section.key]: Math.min((prev[section.key] ?? 0) + 4, matches.length - 1),
                            }))}
                            disabled={idx + 4 >= matches.length}
                            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            →
                          </button>
                          <span className="text-xs text-stone-300 self-center ml-1">
                            {Math.min(idx + 1, matches.length)}–{Math.min(idx + 4, matches.length)} of {matches.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visible.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onLike={handleLike}
                          onSkip={handleSkip}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pieces / Skipped tabs */}
        {!loading && !error && (tab === "pieces" || tab === "skipped") && (
          <>
            {displayProducts.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-stone-400 font-light text-lg">
                  {tab === "pieces" ? "All caught up!" : "Nothing skipped yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onLike={handleLike} onSkip={handleSkip} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setShowAllPieces(!showAllPieces)}
                      className="px-8 py-3 rounded-full border border-stone-300 text-stone-600 text-sm font-medium hover:bg-white hover:border-stone-400 transition-all"
                    >
                      {showAllPieces ? "Show less" : `Show all ${displayProducts.length} pieces`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <Cart items={saved} onRemove={handleRemoveFromCart} onClose={() => setCartOpen(false)} />
      )}
    </main>
  );
}
