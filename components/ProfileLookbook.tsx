"use client";

import { useEffect, useState } from "react";
import { StyleProfile } from "@/lib/types";
import { colorToHex } from "@/lib/colorUtils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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

interface Props {
  profile: StyleProfile;
  onSave: () => void;
  onRedo: () => void;
}

// --- Scroll-reveal wrapper ---
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const delayClass = delay === 1 ? "scroll-reveal-delay-1" : delay === 2 ? "scroll-reveal-delay-2" : delay === 3 ? "scroll-reveal-delay-3" : "";
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? "visible" : ""} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}

// --- Section Components ---

function HeroSection({ profile }: { profile: StyleProfile }) {
  const paletteColors = profile.goodColors.slice(0, 3);
  const gradientStops = paletteColors
    .map((c, i) => `${colorToHex(c)}15 ${i * 40}%`)
    .join(", ");

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${gradientStops}, transparent 90%)`,
      }}
    >
      <RevealSection className="text-center max-w-2xl">
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6">
          Your Style Profile
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl text-stone-900 mb-4 leading-tight">
          {profile.colorSeason}
        </h1>
        <div className="flex items-center justify-center gap-3 text-stone-500 text-sm mb-4">
          <span>{profile.bodyShape}</span>
          <span className="text-stone-300">&middot;</span>
          <span>{profile.stylePersonality.name}</span>
        </div>
        <p className="text-stone-400 text-base italic max-w-md mx-auto mb-12">
          &ldquo;{profile.stylePersonality.essence}&rdquo;
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {profile.goodColors.slice(0, 8).map((color) => (
            <div
              key={color}
              className="w-9 h-9 rounded-full shadow-sm border border-white/60"
              style={{ backgroundColor: colorToHex(color) }}
              title={color}
            />
          ))}
        </div>
      </RevealSection>

      {/* Scroll hint */}
      <div className="absolute bottom-10 animate-pulse-soft">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

function ColorStorySection({ profile }: { profile: StyleProfile }) {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <RevealSection>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">01</p>
        <h2 className="font-serif text-3xl text-stone-900 mb-10">Your Color Story</h2>
      </RevealSection>

      {/* Best colors */}
      <RevealSection className="mb-12" delay={1}>
        <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
          Your Best Colors
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
          {profile.goodColors.slice(0, 24).map((color) => (
            <div key={color} className="group relative">
              <div
                className="aspect-square rounded-xl shadow-sm border border-stone-100 transition-transform hover:scale-110"
                style={{ backgroundColor: colorToHex(color) }}
              />
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {color}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* Colors to skip */}
      <RevealSection className="mb-12" delay={1}>
        <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
          Skip These
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.avoidColors.slice(0, 12).map((color) => (
            <span
              key={color}
              className="px-3 py-1.5 text-xs text-stone-400 bg-stone-100 rounded-full border border-stone-200 line-through decoration-stone-300"
            >
              {color}
            </span>
          ))}
        </div>
      </RevealSection>

      {/* Color combination rules */}
      <RevealSection delay={2}>
        <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
          Color Rules
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.colorRules.slice(0, 6).map((rule, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-4"
            >
              <p className="text-stone-600 text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </RevealSection>
    </section>
  );
}

function BodySilhouettesSection({ profile }: { profile: StyleProfile }) {
  const categories = Object.entries(profile.goodSilhouettes).slice(0, 6);

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <RevealSection>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">02</p>
        <h2 className="font-serif text-3xl text-stone-900 mb-3">
          Body &amp; Silhouettes
        </h2>
        <p className="text-stone-500 text-base mb-10">{profile.bodyShape}</p>
      </RevealSection>

      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
        {/* Body rules */}
        <RevealSection delay={1}>
          <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
            What Works
          </h3>
          <div className="space-y-2.5">
            {profile.bodyRules.slice(0, 6).map((rule, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-stone-400 mt-2 shrink-0" />
                <p className="text-stone-600 text-sm leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* Silhouettes by category */}
        <RevealSection delay={2}>
          <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
            Ideal Silhouettes
          </h3>
          <div className="space-y-5">
            {categories.map(([cat, items]) => (
              <div key={cat}>
                <p className="text-stone-800 text-xs font-semibold uppercase tracking-wide mb-1.5">
                  {cat}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(items as string[]).slice(0, 4).map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs text-stone-500 bg-stone-50 rounded-lg border border-stone-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>

      {/* Necklines & Fabrics */}
      <RevealSection className="mt-12 grid sm:grid-cols-2 gap-8" delay={2}>
        <div>
          <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-3">
            Best Necklines
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.necklines.ideal.map((n) => (
              <span key={n} className="px-3 py-1 text-xs text-stone-600 bg-white rounded-full border border-stone-200">
                {n}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-3">
            Best Fabrics
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.goodFabrics.map((f) => (
              <span key={f} className="px-3 py-1 text-xs text-stone-600 bg-white rounded-full border border-stone-200">
                {f}
              </span>
            ))}
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

function StylePersonalitySection({ profile }: { profile: StyleProfile }) {
  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <RevealSection>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">03</p>
        <h2 className="font-serif text-3xl text-stone-900 mb-2">
          {profile.stylePersonality.name}
        </h2>
        <p className="text-stone-400 italic text-base mb-3">
          &ldquo;{profile.stylePersonality.perception}&rdquo;
        </p>
      </RevealSection>

      <RevealSection className="mt-8" delay={1}>
        <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-5">
          Key Elements
        </h3>
        <div className="space-y-4">
          {profile.stylePersonality.keyElements.map((el, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-stone-300 font-serif text-lg leading-none mt-0.5 shrink-0 w-6 text-right">
                {i + 1}
              </span>
              <p className="text-stone-600 text-sm leading-relaxed">{el}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* Shoes */}
      <RevealSection className="mt-14" delay={2}>
        <h3 className="text-stone-700 text-sm font-medium tracking-wide uppercase mb-4">
          Shoes
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">Ideal</p>
            <div className="space-y-1.5">
              {profile.shoes.ideal.slice(0, 6).map((s, i) => (
                <p key={i} className="text-stone-600 text-sm">{s}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">Rules</p>
            <div className="space-y-1.5">
              {profile.shoes.rules.map((r, i) => (
                <p key={i} className="text-stone-600 text-sm">{r}</p>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

function CapsuleWardrobeSection({
  profile,
  products,
}: {
  profile: StyleProfile;
  products: Record<string, LookbookProduct[]>;
}) {
  const categories = Object.entries(profile.capsuleWardrobe);
  const hasProducts = Object.values(products).some((arr) => arr.length > 0);

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <RevealSection>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">04</p>
        <h2 className="font-serif text-3xl text-stone-900 mb-10">
          Capsule Wardrobe
        </h2>
      </RevealSection>

      {categories.map(([category, items]) => {
        const categoryProducts = products[category] || [];
        return (
          <RevealSection key={category} className="mb-10" delay={1}>
            <h3 className="text-stone-800 text-xs font-semibold uppercase tracking-widest mb-4">
              {category}
            </h3>

            {/* Product image grid (if available) */}
            {hasProducts && categoryProducts.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {categoryProducts.map((p, i) => (
                  <a
                    key={i}
                    href={p.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-stone-700 text-xs truncate">{p.name}</p>
                    <p className="text-stone-400 text-[10px]">
                      {p.brand} &middot; {p.price}
                    </p>
                  </a>
                ))}
              </div>
            )}

            {/* Text list (always shown) */}
            <div className="flex flex-wrap gap-2">
              {(items as string[]).map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-xs text-stone-500 bg-white rounded-lg border border-stone-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </RevealSection>
        );
      })}
    </section>
  );
}

function OutfitIdeasSection({
  profile,
  outfits,
}: {
  profile: StyleProfile;
  outfits: { formula: string; products: LookbookProduct[] }[];
}) {
  const formulas = profile.outfitFormulas?.slice(0, 6) || [];
  const hasOutfitProducts = outfits.some((o) => o.products.length > 0);

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <RevealSection>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">05</p>
        <h2 className="font-serif text-3xl text-stone-900 mb-10">
          Outfit Ideas
        </h2>
      </RevealSection>

      <div className="space-y-6">
        {/* Outfits with product images */}
        {hasOutfitProducts &&
          outfits
            .filter((o) => o.products.length >= 2)
            .slice(0, 4)
            .map((outfit, i) => (
              <RevealSection key={i} delay={1}>
                <p className="text-stone-500 text-xs mb-3 italic">{outfit.formula}</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {outfit.products.map((p, j) => (
                    <a
                      key={j}
                      href={p.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-28 group"
                    >
                      <div className="aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-stone-700 text-[10px] truncate">{p.name}</p>
                      <p className="text-stone-400 text-[9px]">{p.brand}</p>
                    </a>
                  ))}
                </div>
              </RevealSection>
            ))}

        {/* Text formula cards (always shown) */}
        <RevealSection delay={2}>
          <div className="grid gap-3 sm:grid-cols-2">
            {formulas.map((formula, i) => (
              <div
                key={i}
                className="px-4 py-3 bg-white rounded-xl border border-stone-200 text-stone-600 text-sm"
              >
                {formula}
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

function CTASection({ profile, onSave, onRedo }: Props) {
  return (
    <section className="px-6 py-20 max-w-2xl mx-auto">
      {/* Sizes */}
      {Object.keys(profile.sizes).length > 0 && (
        <RevealSection className="mb-10">
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-2">06</p>
          <h2 className="font-serif text-3xl text-stone-900 mb-6">Your Sizes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(profile.sizes).map(([category, sizeList]) => (
              <div
                key={category}
                className="bg-white rounded-xl border border-stone-200 p-3 text-center"
              >
                <p className="text-stone-400 text-xs uppercase tracking-wide mb-1">
                  {category}
                </p>
                <p className="text-stone-800 font-medium text-sm">
                  {(sizeList as string[]).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </RevealSection>
      )}

      {/* Location & climate */}
      {(profile.location || profile.climate) && (
        <RevealSection className="mb-12" delay={1}>
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-5">
            {profile.location && (
              <p className="text-stone-700 text-sm mb-1">
                <span className="text-stone-400 text-xs uppercase tracking-wide">Location</span>{" "}
                &mdash; {profile.location}
              </p>
            )}
            {profile.climate && (
              <p className="text-stone-500 text-sm">{profile.climate}</p>
            )}
          </div>
        </RevealSection>
      )}

      {/* Action buttons */}
      <RevealSection className="space-y-3 pb-8" delay={2}>
        <button
          onClick={onSave}
          className="w-full py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.98] shadow-sm"
        >
          Start Shopping
        </button>
        <button
          onClick={onRedo}
          className="w-full py-3 text-stone-400 text-sm hover:text-stone-600 transition-colors"
        >
          Redo profile
        </button>
      </RevealSection>
    </section>
  );
}

// --- Main Component ---

export default function ProfileLookbook({ profile, onSave, onRedo }: Props) {
  const [lookbookData, setLookbookData] = useState<LookbookData>({
    capsule: {},
    outfits: [],
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/lookbook-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capsuleWardrobe: profile.capsuleWardrobe,
            outfitFormulas: profile.outfitFormulas,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setLookbookData(data);
        }
      } catch {
        // Graceful fallback — sections show text-only
      }
    }
    fetchProducts();
  }, [profile.capsuleWardrobe, profile.outfitFormulas]);

  return (
    <div className="min-h-screen bg-stone-50">
      <HeroSection profile={profile} />
      <ColorStorySection profile={profile} />
      <BodySilhouettesSection profile={profile} />
      <StylePersonalitySection profile={profile} />
      <CapsuleWardrobeSection profile={profile} products={lookbookData.capsule} />
      <OutfitIdeasSection profile={profile} outfits={lookbookData.outfits} />
      <CTASection profile={profile} onSave={onSave} onRedo={onRedo} />
    </div>
  );
}
