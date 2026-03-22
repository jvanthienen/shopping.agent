"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { StyleProfile } from "@/lib/types";
import { colorToHex } from "@/lib/colorUtils";

interface LookbookProduct {
  name: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  brand: string;
}

interface LookbookData {
  capsule: Record<string, LookbookProduct[]>;
  outfits: { formula: string; products: LookbookProduct[] }[];
}

interface CatalogProduct {
  name: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  brand: string;
  category: string;
  color?: string;
  id: string;
}

// Map lookbook tabs to product categories
const TAB_CATEGORY_MAP: Record<string, string[]> = {
  tops: ["blouses", "blazers"],
  bottoms: ["jeans", "pants", "skirts"],
  dresses: ["dresses"],
  outerwear: ["outerwear"],
  shoes: ["shoes"],
  accessories: ["accessories"],
};

// Find matching catalog products for a capsule text item
function matchProducts(text: string, catalog: CatalogProduct[], tab: string): CatalogProduct[] {
  const lower = text.toLowerCase();
  const categories = TAB_CATEGORY_MAP[tab] || [];
  const inCategory = catalog.filter((p) => categories.includes(p.category));
  if (inCategory.length === 0) return [];

  // Extract keywords from capsule text (skip numbers, short words, generic terms)
  const skip = new Set(["in", "and", "a", "the", "of", "with", "for", "fit", "quality"]);
  const words = lower.replace(/[()]/g, "").split(/[\s,/]+/).filter((w) => w.length > 2 && !skip.has(w) && !/^\d+$/.test(w));

  // Score each product by keyword overlap
  const scored = inCategory.map((p) => {
    const pName = p.name.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (pName.includes(w)) score += 2;
    }
    // Bonus for color match
    const pColor = (p.color ?? "").toLowerCase();
    for (const w of words) {
      if (pColor.includes(w)) score += 1;
    }
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Return top 2 matches (even with score 0, show category-matched products as generic previews)
  return scored.slice(0, 2).map((s) => s.product);
}

interface Props {
  profile: StyleProfile;
  firstName?: string;
  preferredBrands?: string[];
  onSave: () => void;
  onRedo: () => void;
}

const CHAPTER_COUNT = 5;
const WARDROBE_TABS = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"] as const;

// Curated hex palettes for each color season (8 representative colors)
const SEASON_PALETTES: Record<string, string[]> = {
  "bright spring": ["#FF6347", "#FF8C00", "#FFD700", "#00CED1", "#4169E1", "#FF69B4", "#32CD32", "#FFFFF0"],
  "true spring":   ["#E2725B", "#FF8C00", "#F0C05A", "#50C878", "#6B8E23", "#C19A6B", "#FFDAB9", "#FFFFF0"],
  "light spring":  ["#FFB6C1", "#FFDAB9", "#F0E68C", "#98FB98", "#87CEEB", "#DDA0DD", "#FFF8DC", "#FFFAF0"],
  "light summer":  ["#B0C4DE", "#D4A0A0", "#C4B7D7", "#A8D8B4", "#87CEEB", "#E8C4C4", "#F0F0F0", "#FFFFF0"],
  "true summer":   ["#6B8BA4", "#C08081", "#8E82C8", "#6B9B9B", "#9BAA8E", "#B8B8B8", "#2B3A5C", "#D4C4A8"],
  "soft summer":   ["#9BAA8E", "#C8A2C8", "#6B9B9B", "#C08081", "#8A8A8A", "#C19A6B", "#B0C4DE", "#D4C4A8"],
  "soft autumn":   ["#C19A6B", "#9BAA8E", "#D4A0A0", "#8B7355", "#BC8F8F", "#DAA520", "#6B6B3A", "#F5E6C8"],
  "true autumn":   ["#B7410E", "#DAA520", "#6B6B3A", "#8B4513", "#CD853F", "#556B2F", "#D2691E", "#F5E6C8"],
  "dark autumn":   ["#5C3A21", "#4A6B4A", "#8B4513", "#6B3040", "#B7410E", "#6B6B3A", "#2F4F4F", "#D4C4A8"],
  "dark winter":   ["#2B3A5C", "#6B3040", "#006400", "#4B0082", "#800000", "#36454F", "#C0392B", "#F5F5F5"],
  "true winter":   ["#0047AB", "#DC143C", "#006400", "#4B0082", "#000000", "#FFFFFF", "#FF0000", "#C0C0C0"],
  "bright winter": ["#FF0090", "#0066FF", "#50C878", "#FF2400", "#7B4B8A", "#00CED1", "#FFE800", "#FFFFFF"],
};

// Brief descriptions for the 12-season system
const SEASON_DESCRIPTIONS: Record<string, string> = {
  "bright spring": "Warm and vivid — you shine in clear, saturated colors with warm undertones.",
  "true spring": "Warm and lively — rich, golden tones like coral, peach, and warm green light you up.",
  "light spring": "Delicate and warm — soft pastels with golden undertones are your sweet spot.",
  "light summer": "Airy and cool — light, cool pastels like powder blue and soft pink look effortless on you.",
  "true summer": "Cool and calm — medium-depth cool tones like dusty rose, slate blue, and soft gray bring out your best.",
  "soft summer": "Muted and cool — low-contrast, desaturated colors like sage, mauve, and dusty teal make your features glow.",
  "soft autumn": "Muted and warm — soft earthy tones like camel, moss, and clay feel natural on you.",
  "true autumn": "Warm and earthy — rich tones like mustard, terracotta, and olive are made for you.",
  "dark autumn": "Deep and warm — forest green, auburn, and chocolate brown bring out your richness.",
  "dark winter": "Dramatic and cool — deep, bold colors like emerald, burgundy, and jet black are your power tones.",
  "true winter": "Cool and bright — pure, crisp colors like cobalt, cherry red, and bright white make you pop.",
  "bright winter": "Electric and cool — high-contrast neons and icy brights are your signature.",
};

function getSeasonDescription(season: string): string {
  const lower = season.toLowerCase();
  for (const [key, desc] of Object.entries(SEASON_DESCRIPTIONS)) {
    if (lower.includes(key)) return desc;
  }
  return "A unique color profile tailored to your natural coloring.";
}

const BODY_SHAPE_DESCRIPTIONS: Record<string, string> = {
  "hourglass": "Balanced shoulders and hips with a naturally defined waist — your curves are your signature.",
  "reloj de arena": "Balanced shoulders and hips with a naturally defined waist — your curves are your signature.",
  "pear": "Narrower shoulders with fuller hips — your lower half is your statement, balance it with structured tops.",
  "apple": "Fuller midsection with slimmer legs — draw attention upward with great necklines and show off those legs.",
  "rectangle": "Balanced proportions throughout — create dimension with waist definition and layering.",
  "inverted triangle": "Broader shoulders tapering to narrower hips — balance with volume on the bottom half.",
};

function getBodyDescription(shape: string): string {
  const lower = shape.toLowerCase();
  for (const [key, desc] of Object.entries(BODY_SHAPE_DESCRIPTIONS)) {
    if (lower.includes(key)) return desc;
  }
  return "";
}

// --- Floating Navigation Dots ---

function ChapterDots({
  active,
  onNavigate,
}: {
  active: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: CHAPTER_COUNT }).map((_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          aria-label={`Go to chapter ${i + 1}`}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            active === i
              ? "bg-stone-800 scale-125"
              : "bg-stone-300 hover:bg-stone-500"
          }`}
        />
      ))}
    </div>
  );
}

// --- Chapter 1: Cover ---

function CoverChapter({
  profile,
  name,
}: {
  profile: StyleProfile;
  name: string;
}) {
  const seasonKey = profile.colorSeason.toLowerCase();
  const seasonPalette = SEASON_PALETTES[seasonKey] || Object.values(SEASON_PALETTES)[0];
  const gradientStops = seasonPalette.slice(0, 4)
    .map((hex, i) => `${hex}18 ${i * 30}%`)
    .join(", ");

  return (
    <section
      className="lookbook-chapter flex flex-col items-center justify-center px-6 relative overflow-visible"
      style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 35%, ${gradientStops}, transparent 100%)`,
      }}
    >
      <div className="text-center max-w-2xl animate-fade-in">
        <h1 className="font-serif text-5xl sm:text-6xl text-stone-900 mb-8 leading-tight">
          {name ? `${name}, meet your style` : "Meet your style"}
        </h1>

        {/* Three info cards */}
        <div className="grid gap-4 sm:grid-cols-3 text-left mb-10 max-w-xl mx-auto">
          <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E2D8] p-4">
            <p className="text-stone-800 text-xs font-semibold uppercase tracking-wide mb-1">Color Season</p>
            <p className="text-stone-700 text-sm font-medium mb-1">{profile.colorSeason}</p>
            <p className="text-stone-400 text-xs leading-relaxed">{getSeasonDescription(profile.colorSeason)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E2D8] p-4">
            <p className="text-stone-800 text-xs font-semibold uppercase tracking-wide mb-1">Body Shape</p>
            <p className="text-stone-700 text-sm font-medium mb-1">{profile.bodyShape}</p>
            <p className="text-stone-400 text-xs leading-relaxed">{getBodyDescription(profile.bodyShape)}</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl border border-[#E8E2D8] p-4">
            <p className="text-stone-800 text-xs font-semibold uppercase tracking-wide mb-1">Style Personality</p>
            <p className="text-stone-700 text-sm font-medium mb-1">{profile.stylePersonality.name}</p>
            <p className="text-stone-400 text-xs leading-relaxed italic">{profile.stylePersonality.essence}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {seasonPalette.map((hex, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full shadow-sm border border-white/60"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 animate-pulse-soft">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-stone-300"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

// --- Chapter 2: Your Colors ---

function ColorsChapter({
  profile,
  name,
}: {
  profile: StyleProfile;
  name: string;
}) {
  const colorRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!colorRef.current) return null;
    const canvas = await html2canvas(colorRef.current, {
      backgroundColor: "#F5F0E8",
      scale: 2,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, []);

  const handleSaveImage = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await captureImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-colors-${name || "palette"}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSharing(false);
    }
  }, [captureImage, name]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await captureImage();
      if (!blob) return;
      const file = new File([blob], `my-colors-${name || "palette"}.png`, { type: "image/png" });

      // Try native share (mobile — WhatsApp, iMessage, etc.)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${name ? name + "'s" : "My"} Color Palette`,
          text: "Check out my personalized color palette!",
          files: [file],
        });
      } else {
        // Fallback: download the image
        handleSaveImage();
      }
    } finally {
      setSharing(false);
    }
  }, [captureImage, name, handleSaveImage]);

  const stylistTip =
    profile.colorRules?.[0] || "Stick to muted, cool tones — they'll make your skin glow.";

  return (
    <section className="lookbook-chapter flex flex-col justify-center px-6 py-16">
      {/* Capturable area */}
      <div ref={colorRef} className="max-w-2xl mx-auto w-full bg-white/90 rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E8E2D8]">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3 text-center">
          {name ? `These are your colors, ${name}` : "These are your colors"}
        </h2>
        <p className="text-stone-400 text-sm mb-8 text-center">
          {stylistTip}
        </p>

        {/* Two-column Yes / No layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* YES column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">&#10003;</span>
              <h3 className="text-stone-700 text-sm font-semibold">Wear these</h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {(SEASON_PALETTES[profile.colorSeason.toLowerCase()] || Object.values(SEASON_PALETTES)[0]).map((hex, i) => (
                <div key={i} className="group relative">
                  <div
                    className="aspect-square rounded-lg shadow-sm border border-stone-100 transition-transform hover:scale-110 cursor-default"
                    style={{ backgroundColor: hex }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* NO column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">&#10005;</span>
              <h3 className="text-stone-700 text-sm font-semibold">Skip these</h3>
            </div>
            <div className="space-y-1.5">
              {profile.avoidColors.slice(0, 10).map((color) => (
                <div key={color} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded shrink-0 border border-stone-200 opacity-60"
                    style={{ backgroundColor: colorToHex(color) }}
                  />
                  <span className="text-stone-500 text-xs">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share bar */}
      <div className="max-w-2xl mx-auto w-full mt-6 flex items-center justify-center gap-3">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
        <button
          onClick={handleSaveImage}
          disabled={sharing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {saved ? "Saved!" : "Save as image"}
        </button>
      </div>
    </section>
  );
}

// --- Chapter 3: Your Wardrobe ---

function WardrobeChapter({
  profile,
  catalog,
}: {
  profile: StyleProfile;
  catalog: CatalogProduct[];
}) {
  const [activeTab, setActiveTab] = useState<string>(WARDROBE_TABS[0]);

  // Get capsule text items for current tab
  const capsuleItems = (profile.capsuleWardrobe?.[activeTab] as string[]) || [];

  return (
    <section className="lookbook-chapter flex flex-col justify-center px-6 py-16">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">
          I built you a capsule wardrobe
        </h2>
        <p className="text-stone-400 text-sm mb-8">
          These are the essentials — mix and match to create endless outfits.
        </p>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
          {WARDROBE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition-all capitalize ${
                activeTab === tab
                  ? "bg-stone-900 text-white font-medium"
                  : "bg-white text-stone-500 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Capsule items with product previews */}
        <div className="space-y-3">
          {capsuleItems.map((item, i) => {
            const matches = catalog.length > 0 ? matchProducts(item, catalog, activeTab) : [];
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4"
              >
                <p className="text-stone-600 text-sm leading-relaxed flex-1">{item}</p>
                {matches.length > 0 && (
                  <div className="flex gap-2 shrink-0">
                    {matches.map((p, j) => (
                      <div key={j} className="w-16 h-20 rounded-lg overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- Chapter 4: Outfit Ideas ---

// Match a single outfit piece description to a catalog product
function matchOutfitPiece(piece: string, catalog: CatalogProduct[]): CatalogProduct | null {
  const lower = piece.toLowerCase().trim();
  const skip = new Set(["in", "and", "a", "the", "of", "with", "for"]);
  const words = lower.split(/[\s,/]+/).filter((w) => w.length > 2 && !skip.has(w));

  let best: CatalogProduct | null = null;
  let bestScore = 0;
  for (const p of catalog) {
    const pName = p.name.toLowerCase();
    const pCat = p.category.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (pName.includes(w)) score += 2;
      if (pCat.includes(w)) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return bestScore >= 2 ? best : null;
}

function OutfitChapter({
  profile,
  catalog,
}: {
  profile: StyleProfile;
  catalog: CatalogProduct[];
}) {
  const formulas = profile.outfitFormulas?.slice(0, 4) || [];

  return (
    <section className="lookbook-chapter flex flex-col justify-center px-6 py-16">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">
          Here&apos;s how to wear it all
        </h2>
        <p className="text-stone-400 text-sm mb-10">
          Complete outfits styled for you — each one a no-brainer.
        </p>

        <div className="space-y-6">
          {formulas.map((formula, i) => {
            // Split formula into pieces: "Blazer + white tee + jeans + flats (Smart casual)"
            const cleanFormula = formula.replace(/\s*\([^)]*\)\s*$/, "");
            const styleLabel = formula.match(/\(([^)]+)\)$/)?.[1] || "";
            const pieces = cleanFormula.split(/\s*\+\s*/);
            const matchedProducts = catalog.length > 0
              ? pieces.map((p) => matchOutfitPiece(p, catalog)).filter(Boolean) as CatalogProduct[]
              : [];

            return (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-5">
                {matchedProducts.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                    {matchedProducts.map((p, j) => (
                      <div key={j} className="shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-stone-600 text-sm leading-relaxed">{cleanFormula}</p>
                {styleLabel && (
                  <p className="text-stone-400 text-xs mt-1 italic">{styleLabel}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- Chapter 5: Let's Go Shopping ---

function CTAChapter({
  profile,
  name,
  onSave,
  onRedo,
}: {
  profile: StyleProfile;
  name: string;
  onSave: () => void;
  onRedo: () => void;
}) {
  return (
    <section className="lookbook-chapter flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-8">
          {name ? `Ready, ${name}?` : "Ready to shop?"}
        </h2>

        {/* Sizes compact grid */}
        {Object.keys(profile.sizes).length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-8 text-left">
            {Object.entries(profile.sizes).map(([category, sizeList]) => (
              <div
                key={category}
                className="bg-white rounded-xl border border-stone-200 p-3 text-center"
              >
                <p className="text-stone-400 text-[10px] uppercase tracking-wide mb-0.5">
                  {category}
                </p>
                <p className="text-stone-800 font-medium text-sm">
                  {(sizeList as string[]).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Location & season note */}
        {(profile.location || profile.climate) && (
          <div className="bg-[#EDE8DF]/60 rounded-xl border border-[#E8E2D8] p-4 mb-8 text-center">
            {profile.location && (
              <p className="text-stone-600 text-sm">
                Shopping for {profile.location}
              </p>
            )}
            {profile.climate && (
              <p className="text-stone-400 text-xs mt-0.5">{profile.climate}</p>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onSave}
          className="w-full py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.98] shadow-sm mb-3"
        >
          Start Shopping
        </button>
        <button
          onClick={onRedo}
          className="text-stone-400 text-sm hover:text-stone-600 transition-colors"
        >
          Redo profile
        </button>
      </div>
    </section>
  );
}

// --- Main Component ---

export default function ProfileLookbook({
  profile,
  firstName,
  preferredBrands,
  onSave,
  onRedo,
}: Props) {
  const name = firstName || profile.firstName || "";
  const brands = preferredBrands || profile.preferredBrands || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);

  // Load static product catalog for previews (filtered to preferred brands)
  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        let products = (data.products ?? []) as CatalogProduct[];
        if (brands.length > 0) {
          const brandSet = new Set(brands.map((b: string) => b.toLowerCase()));
          products = products.filter((p) => brandSet.has((p.brand ?? "").toLowerCase()));
        }
        setCatalog(products);
      })
      .catch(() => { /* products unavailable — text-only fallback */ });
  }, [brands]);

  // IntersectionObserver to track active chapter
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    chapterRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveChapter(i);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const navigateToChapter = useCallback((index: number) => {
    chapterRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const setChapterRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      chapterRefs.current[index] = el;
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="lookbook-container"
    >
      <ChapterDots active={activeChapter} onNavigate={navigateToChapter} />

      <div ref={setChapterRef(0)}>
        <CoverChapter profile={profile} name={name} />
      </div>
      <div ref={setChapterRef(1)}>
        <ColorsChapter profile={profile} name={name} />
      </div>
      <div ref={setChapterRef(2)}>
        <WardrobeChapter
          profile={profile}
          catalog={catalog}
        />
      </div>
      <div ref={setChapterRef(3)}>
        <OutfitChapter
          profile={profile}
          catalog={catalog}
        />
      </div>
      <div ref={setChapterRef(4)}>
        <CTAChapter
          profile={profile}
          name={name}
          onSave={onSave}
          onRedo={onRedo}
        />
      </div>
    </div>
  );
}
