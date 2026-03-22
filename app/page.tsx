"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import OutfitCard from "@/components/OutfitCard";
import SkeletonCard from "@/components/SkeletonCard";
import Cart from "@/components/Cart";
import { Product, Outfit } from "@/lib/types";
import { hasStyleProfile, getStyleProfile, loadStyleProfileFromSupabase } from "@/lib/styleProfile";
import { StyleProfile } from "@/lib/types";
import { rankProducts, CatalogProduct } from "@/lib/productMatcher";
import { createClient } from "@/lib/supabase/client";
import ProfilePanel from "@/components/ProfilePanel";
import AuthOverlay from "@/components/AuthOverlay";
import Link from "next/link";

type Tab = "outfits" | "basics" | "pieces" | "skipped";
const CATEGORIES = ["all", "outerwear", "blazers", "blouses", "dresses", "jeans", "pants", "skirts", "shoes", "accessories"] as const;

// Match a single outfit piece description to a catalog product
function matchOutfitPiece(piece: string, catalog: Product[]): Product | null {
  const lower = piece.toLowerCase().trim();
  const skip = new Set(["in", "and", "a", "the", "of", "with", "for"]);
  const words = lower.split(/[\s,/]+/).filter((w) => w.length > 2 && !skip.has(w));

  let best: Product | null = null;
  let bestScore = 0;
  for (const p of catalog) {
    const pName = p.name.toLowerCase();
    const pCat = (p.category ?? "").toLowerCase();
    const pColor = (p.color ?? "").toLowerCase();
    let score = 0;
    for (const w of words) {
      if (pName.includes(w)) score += 2;
      if (pCat.includes(w)) score += 1;
      if (pColor.includes(w)) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return bestScore >= 2 ? best : null;
}
type Category = (typeof CATEGORIES)[number];

// Wardrobe sections — each defines a filter to find matching products from the catalog
const WARDROBE_SECTIONS = [
  { key: "white-shirts", label: "White shirts & tees", match: (p: Product) => {
    const n = p.name.toLowerCase(); const c = (p.color ?? "").toLowerCase();
    return p.category === "blouses" && (c.includes("white") || c.includes("ivory") || c.includes("ecru") || c.includes("off white") || n.includes("white")) && (n.includes("shirt") || n.includes("blouse") || n.includes("tee") || n.includes("t-shirt") || n.includes("tank") || n.includes("cami"));
  }},
  { key: "silk-tops", label: "Silk & elegant tops", match: (p: Product) => {
    const n = p.name.toLowerCase();
    return p.category === "blouses" && (n.includes("silk") || n.includes("satin") || n.includes("cami") || n.includes("evening"));
  }},
  { key: "sweaters", label: "Sweaters & knits", match: (p: Product) => {
    const n = p.name.toLowerCase();
    return p.category === "blouses" && (n.includes("sweater") || n.includes("knit") || n.includes("cardigan") || n.includes("pullover") || n.includes("cashmere"));
  }},
  { key: "tops-other", label: "Tops", match: (p: Product) => {
    const n = p.name.toLowerCase();
    return p.category === "blouses" && !n.includes("silk") && !n.includes("satin") && !n.includes("sweater") && !n.includes("knit") && !n.includes("cardigan") && !n.includes("pullover") && !n.includes("cashmere");
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
  // Products from static catalog
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const catalogLoaded = useRef(false);

  // UI state
  const [saved, setSaved] = useState<Product[]>([]);
  const [skipped, setSkipped] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("basics");
  const [category, setCategory] = useState<Category>("all");
  const [brand, setBrand] = useState<string>("all");
  const [showAllPieces, setShowAllPieces] = useState(false);
  const [sectionIndex, setSectionIndex] = useState<Record<string, number>>({});
  const [profileExists, setProfileExists] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authBannerDismissed, setAuthBannerDismissed] = useState(false);

  // --- Auth check ---

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const showAuthBanner = isAuthenticated === false && !authBannerDismissed;

  // --- Profile loading ---

  useEffect(() => {
    if (hasStyleProfile()) {
      setProfileExists(true);
      setProfile(getStyleProfile());
    } else {
      loadStyleProfileFromSupabase().then((loaded) => {
        setProfileExists(!!loaded);
        if (loaded) setProfile(loaded);
      });
    }
  }, []);

  // --- Load static product catalog on mount ---

  const [rawCatalog, setRawCatalog] = useState<Product[]>([]);

  useEffect(() => {
    if (catalogLoaded.current) return;
    catalogLoaded.current = true;

    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        setRawCatalog((data.products ?? []) as Product[]);
      })
      .catch(() => { /* products.json unavailable */ })
      .finally(() => setLoading(false));
  }, []);

  // Score catalog against profile — personalized ranking, filtered to preferred brands
  useEffect(() => {
    if (rawCatalog.length === 0) return;
    if (!profile) {
      // No profile — show all products unscored
      setAllCatalogProducts(rawCatalog);
      return;
    }

    // Filter to preferred brands first (if any selected)
    const preferred = profile.preferredBrands;
    let filtered = rawCatalog;
    if (preferred && preferred.length > 0) {
      const preferredSet = new Set(preferred.map((b: string) => b.toLowerCase()));
      filtered = rawCatalog.filter((p) => preferredSet.has((p.brand ?? "").toLowerCase()));
    }

    // Score remaining products and filter to 40+ (removes poor matches)
    const scored = rankProducts(
      filtered as unknown as CatalogProduct[],
      profile,
      { minScore: 40 }
    );

    // Convert back to Product type (compatible fields)
    const asProducts: Product[] = scored.map((sp) => ({
      id: sp.id,
      name: sp.name,
      price: sp.price,
      color: sp.color,
      category: sp.category,
      brand: sp.brand,
      imageUrl: sp.imageUrl,
      productUrl: sp.productUrl,
      score: sp.score,
      matchReason: sp.matchReason,
      isGreatMatch: sp.isGreatMatch,
    }));

    setAllCatalogProducts(asProducts);
  }, [rawCatalog, profile]);

  // Generate outfits from profile formulas + local catalog
  useEffect(() => {
    if (allCatalogProducts.length === 0 || !profile?.outfitFormulas?.length) return;

    const generatedOutfits: Outfit[] = [];
    const usedProductIds = new Set<string>();

    for (const formula of profile.outfitFormulas.slice(0, 8)) {
      const cleanFormula = formula.replace(/\s*\([^)]*\)\s*$/, "");
      const vibe = (formula.match(/\(([^)]+)\)$/) || [])[1] || "";
      const pieces = cleanFormula.split(/\s*\+\s*/).filter(Boolean);

      const items: Product[] = [];
      for (const piece of pieces) {
        const match = matchOutfitPiece(piece, allCatalogProducts.filter((p) => !usedProductIds.has(p.id)));
        if (match) {
          items.push(match);
          usedProductIds.add(match.id);
        }
      }

      if (items.length >= 2) {
        const total = items.reduce((sum, i) => sum + parseFloat(i.price.replace("$", "") || "0"), 0);
        generatedOutfits.push({
          id: `outfit-${generatedOutfits.length}-${Date.now()}`,
          name: cleanFormula.length > 50 ? cleanFormula.slice(0, 47) + "..." : cleanFormula,
          vibe,
          items,
          totalPrice: `$${total.toFixed(2)}`,
        });
      }
    }

    setOutfits(generatedOutfits);
  }, [allCatalogProducts, profile]);

  // --- Derived data ---

  const brandSet = new Set(allCatalogProducts.map((p) => p.brand).filter(Boolean));
  const greatMatchCount = allCatalogProducts.filter((p) => p.isGreatMatch).length;
  const statsText = allCatalogProducts.length > 0
    ? `${allCatalogProducts.length} picks from ${brandSet.size} brands${greatMatchCount > 0 ? ` · ${greatMatchCount} great matches` : ""}`
    : null;

  // --- Handlers ---

  const handleLike = (product: Product) => {
    setSaved((prev) => (prev.find((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const handleSkip = (product: Product) => {
    setSkipped((prev) => (prev.find((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const handleRemoveFromCart = (id: string) => {
    setSaved((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    setSaved((prev) => {
      const newItems = outfit.items.filter((item) => !prev.find((p) => p.id === item.id));
      return [...prev, ...newItems];
    });
    // Remove the outfit (no static product pool to generate alternatives from)
    setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
  };

  const handleSwapItem = (outfitId: string, itemToReplace: Product) => {
    setOutfits((prev) =>
      prev.map((outfit) => {
        if (outfit.id !== outfitId) return outfit;
        const usedIds = new Set(outfit.items.map((i) => i.id));
        const pool = allCatalogProducts;
        const replacement = pool.find(
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

  // --- Filtering for Pieces / Skipped tabs ---

  const feedProducts = allCatalogProducts.filter(
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

  const pieceBrandCounts: Record<string, number> = { all: feedProducts.length };
  for (const p of feedProducts) {
    const b = p.brand ?? "Other";
    pieceBrandCounts[b] = (pieceBrandCounts[b] ?? 0) + 1;
  }
  const brandList = ["all", ...Object.keys(pieceBrandCounts).filter((b) => b !== "all").sort()];

  // Tab counts
  const capsuleCount = loading ? "..." : allCatalogProducts.length;
  const outfitsCount = loading ? "..." : outfits.length;
  const piecesCount = loading ? "..." : allCatalogProducts.length;

  // --- Skeleton grid ---
  const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );

  // If no profile, show onboarding
  if (!profileExists) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-4xl text-stone-900 mb-4">Welcome to Your Personal Shopper</h1>
          <p className="text-stone-500 text-lg leading-relaxed mb-8">
            Let&apos;s build your style profile so we can curate the perfect pieces for you.
          </p>
          <Link
            href="/profile"
            className="inline-block px-10 py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.97] shadow-sm"
          >
            Create My Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F5F0E8]/95 backdrop-blur-lg border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl tracking-tight text-stone-900">Your Shopper</h1>
            {statsText && (
              <p className="text-[11px] text-stone-400 mt-0.5 tracking-wide uppercase">
                {statsText}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
          {profile && (
            <button
              onClick={() => setProfileOpen(true)}
              className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 text-sm font-semibold flex items-center justify-center hover:bg-stone-300 transition-colors"
              title="Your profile"
            >
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
          )}
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
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-5 pb-3 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { key: "basics" as Tab, label: "Wardrobe Capsule", count: capsuleCount },
            { key: "outfits" as Tab, label: "Outfits", count: outfitsCount },
            { key: "pieces" as Tab, label: "All Pieces", count: piecesCount },
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

      {/* Sign-in banner for unauthenticated users */}
      {showAuthBanner && (
        <div className="bg-[#EDE8DF]/80 border-b border-stone-200/40">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">
              Sign in to save your profile and favorites across devices
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAuthOverlay(true)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => setAuthBannerDismissed(true)}
                className="text-stone-300 hover:text-stone-500 transition-colors p-1"
                aria-label="Dismiss"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {(tab === "pieces" || tab === "skipped") && (
        <div className="max-w-6xl mx-auto px-5 pt-5 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {brandList.map((b) => {
              const count = pieceBrandCounts[b] ?? 0;
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
                    : "text-stone-400 hover:text-stone-600 hover:bg-[#EDE8DF]"
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

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 border-2 border-[#E8E2D8] border-t-stone-800 rounded-full animate-spin" />
              <p className="text-stone-400 text-sm font-light tracking-wide">
                Loading your picks...
              </p>
            </div>
            {tab === "basics" && (
              <div className="space-y-10">
                {["Tops", "Blazers", "Pants"].map((label) => (
                  <div key={label}>
                    <div className="h-5 bg-stone-100 rounded w-40 mb-3 animate-pulse" />
                    <SkeletonGrid count={4} />
                  </div>
                ))}
              </div>
            )}
            {tab === "outfits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden animate-pulse">
                    <div className="px-5 pt-5 pb-3">
                      <div className="h-5 bg-stone-100 rounded w-48 mb-2" />
                      <div className="h-3 bg-stone-50 rounded w-32" />
                    </div>
                    <div className="flex mx-5 rounded-xl overflow-hidden">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="flex-1 aspect-[3/4] bg-stone-100" />
                      ))}
                    </div>
                    <div className="p-5 space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-4 bg-stone-50 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "pieces" && <SkeletonGrid count={8} />}
          </div>
        )}

        {/* Outfits tab */}
        {!loading && tab === "outfits" && (
          <>
            {outfits.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-stone-400 font-light text-lg">No outfits curated yet</p>
              </div>
            ) : (
              <>
                <p className="text-stone-400 text-sm mb-8 font-light">
                  Complete looks styled for your profile.
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

        {/* Basics / Wardrobe Capsule tab */}
        {!loading && tab === "basics" && (
          <>
            <div className="mb-8">
              <h2 className="font-serif text-xl text-stone-900">Your Wardrobe Capsule</h2>
              <p className="text-stone-400 text-sm mt-1 font-light">
                The essential pieces every wardrobe needs, curated for your style.
              </p>
            </div>
            {allCatalogProducts.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-stone-400 font-light text-lg">Couldn&apos;t load products right now</p>
                <p className="text-stone-300 text-sm mt-2">This usually means the product API is temporarily unavailable. Try refreshing the page.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {WARDROBE_SECTIONS.map((section) => {
                  const matches = allCatalogProducts
                    .filter(section.match)
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
                  if (matches.length === 0) return null;
                  const idx = sectionIndex[section.key] ?? 0;
                  const visible = matches.slice(idx, idx + 4);
                  const sectionHasMore = matches.length > 4;
                  return (
                    <div key={section.key}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-serif text-lg text-stone-800">{section.label}</h3>
                        {sectionHasMore && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setSectionIndex((prev) => ({
                                ...prev,
                                [section.key]: Math.max((prev[section.key] ?? 0) - 4, 0),
                              }))}
                              disabled={idx === 0}
                              className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              &larr;
                            </button>
                            <button
                              onClick={() => setSectionIndex((prev) => ({
                                ...prev,
                                [section.key]: Math.min((prev[section.key] ?? 0) + 4, matches.length - 1),
                              }))}
                              disabled={idx + 4 >= matches.length}
                              className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              &rarr;
                            </button>
                            <span className="text-xs text-stone-300 self-center ml-1">
                              {Math.min(idx + 1, matches.length)}&ndash;{Math.min(idx + 4, matches.length)} of {matches.length}
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
            )}
          </>
        )}

        {/* Pieces / Skipped tabs */}
        {!loading && (tab === "pieces" || tab === "skipped") && (
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

      {/* Profile panel */}
      {profile && (
        <ProfilePanel
          profile={profile}
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          onProfileUpdate={(updated) => {
            setProfile(updated);
          }}
        />
      )}

      {/* Auth overlay */}
      {showAuthOverlay && (
        <AuthOverlay
          onClose={() => setShowAuthOverlay(false)}
          redirectPath="/"
        />
      )}
    </main>
  );
}
