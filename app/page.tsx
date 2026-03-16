"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import OutfitCard from "@/components/OutfitCard";
import Cart from "@/components/Cart";
import { Product, Outfit } from "@/lib/types";

type Tab = "outfits" | "pieces" | "skipped";
const CATEGORIES = ["all", "dresses", "blouses", "pants", "skirts", "blazers"] as const;
type Category = (typeof CATEGORIES)[number];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [saved, setSaved] = useState<Product[]>([]);
  const [skipped, setSkipped] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("outfits");
  const [category, setCategory] = useState<Category>("all");
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

  const feedProducts = products.filter(
    (p) => !skipped.find((s) => s.id === p.id) && !saved.find((s) => s.id === p.id)
  );

  const filteredProducts =
    category === "all" ? feedProducts : feedProducts.filter((p) => p.category === category);

  const displayProducts = tab === "skipped" ? skipped : filteredProducts;

  // Category counts
  const categoryCounts: Record<string, number> = { all: feedProducts.length };
  for (const p of feedProducts) {
    const cat = p.category ?? "other";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-stone-800">Your Shopper</h1>
            {stats && (
              <p className="text-xs text-stone-400 mt-0.5">
                {stats.curated} picks from {stats.total} Zara items
                {stats.location && ` · ${stats.location}`}
              </p>
            )}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Saved
            {saved.length > 0 && (
              <span className="bg-white text-stone-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {saved.length}
              </span>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-4">
          <button
            onClick={() => setTab("outfits")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${tab === "outfits" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"}`}
          >
            Outfits ({outfits.length})
          </button>
          <button
            onClick={() => setTab("pieces")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${tab === "pieces" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"}`}
          >
            All Pieces ({feedProducts.length})
          </button>
          <button
            onClick={() => setTab("skipped")}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${tab === "skipped" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"}`}
          >
            Skipped ({skipped.length})
          </button>
        </div>
      </header>

      {/* Category filters — only on pieces/skipped tabs */}
      {(tab === "pieces" || tab === "skipped") && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-stone-800 text-white"
                      : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {cat === "all" ? "" : ` (${count})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Loading your picks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">Something went wrong</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
            <p className="text-stone-400 text-xs mt-3">Ask Claude to &quot;refresh my Zara picks&quot; to generate products</p>
          </div>
        )}

        {/* Outfits tab */}
        {!loading && !error && tab === "outfits" && (
          <>
            {outfits.length === 0 ? (
              <div className="text-center py-24 text-stone-300">
                <p className="text-stone-500 font-medium">No outfits yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outfits.map((outfit) => (
                  <OutfitCard key={outfit.id} outfit={outfit} onSaveAll={handleSaveAll} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pieces / Skipped tabs */}
        {!loading && !error && (tab === "pieces" || tab === "skipped") && (
          <>
            {displayProducts.length === 0 ? (
              <div className="text-center py-24 text-stone-300">
                <p className="text-stone-500 font-medium">
                  {tab === "pieces" ? "All caught up!" : "Nothing skipped yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onLike={handleLike}
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <Cart
          items={saved}
          onRemove={handleRemoveFromCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </main>
  );
}
