"use client";

import { StyleProfile } from "@/lib/types";
import { colorToHex } from "@/lib/colorUtils";

interface ProfileReviewProps {
  profile: StyleProfile;
  onSave: () => void;
  onRedo: () => void;
}

export default function ProfileReview({ profile, onSave, onRedo }: ProfileReviewProps) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      {/* Hero card */}
      <div className="text-center mb-10 animate-scale-in">
        <p className="text-stone-400 text-xs tracking-widest uppercase mb-3">Your Style Profile</p>
        <h1 className="font-serif text-4xl text-stone-900 mb-2">{profile.colorSeason}</h1>
        <div className="flex items-center justify-center gap-3 text-stone-500 text-sm">
          <span>{profile.bodyShape}</span>
          <span className="text-stone-300">&middot;</span>
          <span>{profile.stylePersonality.name}</span>
        </div>
        <p className="text-stone-400 text-sm mt-3 max-w-md mx-auto italic">
          {profile.stylePersonality.essence}
        </p>
      </div>

      {/* Color palette */}
      <section className="mb-10">
        <h3 className="font-serif text-lg text-stone-800 mb-3">Your Color Palette</h3>
        <div className="flex flex-wrap gap-2">
          {profile.goodColors.slice(0, 24).map((color) => (
            <div key={color} className="group relative">
              <div
                className="w-10 h-10 rounded-xl shadow-sm border border-stone-200/50 transition-transform hover:scale-110"
                style={{ backgroundColor: colorToHex(color) }}
              />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {color}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Colors to avoid */}
      <section className="mb-10">
        <h3 className="font-serif text-lg text-stone-800 mb-3">Colors to Avoid</h3>
        <div className="flex flex-wrap gap-2">
          {profile.avoidColors.slice(0, 12).map((color) => (
            <span
              key={color}
              className="px-3 py-1 text-xs text-stone-500 bg-stone-100 rounded-full border border-stone-200"
            >
              {color}
            </span>
          ))}
        </div>
      </section>

      {/* Key rules */}
      <section className="mb-10">
        <h3 className="font-serif text-lg text-stone-800 mb-3">Your Style Rules</h3>
        <div className="space-y-2">
          {profile.colorRules.slice(0, 6).map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
              <p className="text-stone-600 text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Body rules */}
      <section className="mb-10">
        <h3 className="font-serif text-lg text-stone-800 mb-3">Body Shape: {profile.bodyShape}</h3>
        <div className="space-y-2">
          {profile.bodyRules.slice(0, 5).map((rule, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
              <p className="text-stone-600 text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Style personality */}
      <section className="mb-10">
        <h3 className="font-serif text-lg text-stone-800 mb-3">Style: {profile.stylePersonality.name}</h3>
        <p className="text-stone-500 text-sm italic mb-3">{profile.stylePersonality.perception}</p>
        <div className="space-y-2">
          {profile.stylePersonality.keyElements.slice(0, 5).map((el, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
              <p className="text-stone-600 text-sm leading-relaxed">{el}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sizes */}
      {Object.keys(profile.sizes).length > 0 && (
        <section className="mb-10">
          <h3 className="font-serif text-lg text-stone-800 mb-3">Your Sizes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(profile.sizes).map(([category, sizeList]) => (
              <div key={category} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
                <p className="text-stone-400 text-xs uppercase tracking-wide mb-1">{category}</p>
                <p className="text-stone-800 font-medium text-sm">{(sizeList as string[]).join(", ")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outfit formulas */}
      {profile.outfitFormulas?.length > 0 && (
        <section className="mb-12">
          <h3 className="font-serif text-lg text-stone-800 mb-3">Outfit Ideas</h3>
          <div className="space-y-2">
            {profile.outfitFormulas.slice(0, 6).map((formula, i) => (
              <div key={i} className="px-4 py-3 bg-white rounded-xl border border-stone-200 text-stone-600 text-sm">
                {formula}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="space-y-3 pb-8">
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
      </div>
    </div>
  );
}
