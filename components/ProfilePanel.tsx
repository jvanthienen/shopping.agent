"use client";

import { useState, useEffect } from "react";
import { StyleProfile } from "@/lib/types";
import { saveStyleProfile } from "@/lib/styleProfile";
import { colorToHex } from "@/lib/colorUtils";
import { SIZE_CATEGORIES, SUPPORTED_BRANDS } from "@/components/StyleQuiz";
import Link from "next/link";

const SUPPORTED_SET = new Set(SUPPORTED_BRANDS.map((b) => b.toLowerCase()));

interface ProfilePanelProps {
  profile: StyleProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: (profile: StyleProfile) => void;
}

const COLOR_SEASONS = [
  "Bright Spring", "True Spring", "Light Spring",
  "Light Summer", "True Summer", "Soft Summer",
  "Soft Autumn", "True Autumn", "Dark Autumn",
  "Dark Winter", "True Winter", "Bright Winter",
];

const BODY_SHAPES = ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle", "Athletic", "Petite"];

const STYLE_ARCHETYPES = ["Sport", "Romantic", "Classic", "Natural", "Dramatic", "Creative"];

export default function ProfilePanel({ profile, isOpen, onClose, onProfileUpdate }: ProfilePanelProps) {
  const [sizes, setSizes] = useState<Record<string, string[]>>(profile.sizes ?? {});
  const [brands, setBrands] = useState<string[]>(profile.preferredBrands ?? []);
  const [brandInput, setBrandInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Editable identity fields
  const [colorSeason, setColorSeason] = useState(profile.colorSeason);
  const [bodyShape, setBodyShape] = useState(profile.bodyShape);
  const [styleName, setStyleName] = useState(profile.stylePersonality?.name ?? "");
  const [goodColors, setGoodColors] = useState<string[]>(profile.goodColors ?? []);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState("");
  const [bodyShapeCustom, setBodyShapeCustom] = useState("");

  // Sync local state when profile prop changes
  useEffect(() => {
    setSizes(profile.sizes ?? {});
    setBrands(profile.preferredBrands ?? []);
    setColorSeason(profile.colorSeason);
    setBodyShape(profile.bodyShape);
    setStyleName(profile.stylePersonality?.name ?? "");
    setGoodColors(profile.goodColors ?? []);
    setDirty(false);
  }, [profile]);

  const handleSizeToggle = (category: string, size: string) => {
    setSizes((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
      return { ...prev, [category]: next };
    });
    setDirty(true);
  };

  const handleRemoveBrand = (brand: string) => {
    setBrands((prev) => prev.filter((b) => b !== brand));
    setDirty(true);
  };

  const handleAddBrand = () => {
    const trimmed = brandInput.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands((prev) => [...prev, trimmed]);
      setDirty(true);
    }
    setBrandInput("");
  };

  const handleRemoveColor = (color: string) => {
    setGoodColors((prev) => prev.filter((c) => c !== color));
    setDirty(true);
  };

  const handleAddColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !goodColors.includes(trimmed)) {
      setGoodColors((prev) => [...prev, trimmed]);
      setDirty(true);
    }
    setColorInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    const updated: StyleProfile = {
      ...profile,
      sizes,
      preferredBrands: brands,
      colorSeason,
      bodyShape,
      stylePersonality: { ...profile.stylePersonality, name: styleName },
      goodColors,
    };
    await saveStyleProfile(updated);
    onProfileUpdate(updated);
    setDirty(false);
    setSaving(false);
  };

  // Display colors — take the first ~20 good colors for a manageable palette
  const paletteColors = goodColors.slice(0, 20);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-serif text-xl text-stone-900">Your Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-5 space-y-6">
            {/* Identity card — editable */}
            <section>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Style Identity</h3>
              <div className="space-y-2.5">
                {/* Color Season */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Color Season</span>
                  {editingField === "colorSeason" ? (
                    <select
                      autoFocus
                      value={colorSeason}
                      onChange={(e) => { setColorSeason(e.target.value); setEditingField(null); setDirty(true); }}
                      onBlur={() => setEditingField(null)}
                      className="text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:border-stone-500 max-w-[60%] text-right"
                    >
                      {COLOR_SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingField("colorSeason")}
                      className="text-sm font-medium text-stone-800 text-right max-w-[60%] hover:text-stone-600 transition-colors flex items-center gap-1.5 group"
                    >
                      {colorSeason}
                      <svg className="w-3 h-3 text-stone-300 group-hover:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  )}
                </div>

                {/* Body Shape */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Body Shape</span>
                  {editingField === "bodyShape" ? (
                    <div className="max-w-[60%]">
                      <select
                        autoFocus
                        value={BODY_SHAPES.includes(bodyShape) ? bodyShape : "__other__"}
                        onChange={(e) => {
                          if (e.target.value === "__other__") {
                            setBodyShapeCustom(bodyShape);
                          } else {
                            setBodyShape(e.target.value);
                            setEditingField(null);
                            setDirty(true);
                          }
                        }}
                        onBlur={() => { if (BODY_SHAPES.includes(bodyShape)) setEditingField(null); }}
                        className="text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:border-stone-500 w-full text-right"
                      >
                        {BODY_SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
                        <option value="__other__">Other...</option>
                      </select>
                      {!BODY_SHAPES.includes(bodyShape) && (
                        <input
                          autoFocus
                          type="text"
                          value={bodyShapeCustom}
                          onChange={(e) => setBodyShapeCustom(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && bodyShapeCustom.trim()) {
                              setBodyShape(bodyShapeCustom.trim());
                              setEditingField(null);
                              setDirty(true);
                            }
                          }}
                          onBlur={() => {
                            if (bodyShapeCustom.trim()) {
                              setBodyShape(bodyShapeCustom.trim());
                              setDirty(true);
                            }
                            setEditingField(null);
                          }}
                          placeholder="Enter body shape..."
                          className="mt-1 w-full text-sm border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:border-stone-500 text-stone-800"
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField("bodyShape")}
                      className="text-sm font-medium text-stone-800 text-right max-w-[60%] hover:text-stone-600 transition-colors flex items-center gap-1.5 group"
                    >
                      {bodyShape}
                      <svg className="w-3 h-3 text-stone-300 group-hover:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  )}
                </div>

                {/* Style */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Style</span>
                  {editingField === "style" ? (
                    <select
                      autoFocus
                      value={styleName}
                      onChange={(e) => { setStyleName(e.target.value); setEditingField(null); setDirty(true); }}
                      onBlur={() => setEditingField(null)}
                      className="text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:border-stone-500 max-w-[60%] text-right"
                    >
                      {STYLE_ARCHETYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingField("style")}
                      className="text-sm font-medium text-stone-800 text-right max-w-[60%] hover:text-stone-600 transition-colors flex items-center gap-1.5 group"
                    >
                      <span>
                        {styleName}
                        {profile.stylePersonality?.essence && (
                          <span className="block text-xs text-stone-400 font-normal mt-0.5 text-right">{profile.stylePersonality.essence}</span>
                        )}
                      </span>
                      <svg className="w-3 h-3 text-stone-300 group-hover:text-stone-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Color palette — editable */}
            <section>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Your Colors</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {paletteColors.map((color) => (
                  <div
                    key={color}
                    className="group relative"
                    title={color}
                  >
                    <div
                      className="w-7 h-7 rounded-full border border-stone-200 shadow-sm"
                      style={{ backgroundColor: colorToHex(color) }}
                    />
                    <button
                      onClick={() => handleRemoveColor(color)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-600 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                {colorInput.trim() && (
                  <div
                    className="w-6 h-6 rounded-full border border-stone-200 shadow-sm shrink-0"
                    style={{ backgroundColor: colorToHex(colorInput.trim()) }}
                  />
                )}
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddColor()}
                  placeholder="Add color..."
                  className="flex-1 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-700 placeholder:text-stone-300"
                />
                <button
                  onClick={handleAddColor}
                  className="px-3 py-1.5 text-sm font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Sizes — editable */}
            <section>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Sizes</h3>
              <div className="space-y-3">
                {SIZE_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <label className="block text-sm text-stone-500 mb-1.5">{cat.label}</label>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.options.map((size) => {
                        const isSelected = (sizes[cat.key] ?? []).includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => handleSizeToggle(cat.key, size)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                              isSelected
                                ? "border-stone-700 bg-stone-800 text-white"
                                : "border-stone-200 bg-white text-stone-400 hover:border-stone-300"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Preferred brands — editable */}
            <section>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Preferred Brands</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {brands.length === 0 && <p className="text-xs text-stone-300">No brands set</p>}
                {brands.map((b) => {
                  const isSupported = SUPPORTED_SET.has(b.toLowerCase());
                  return (
                    <span
                      key={b}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        isSupported ? "bg-stone-100 text-stone-600" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {b}
                      {!isSupported && <span className="text-amber-400 text-[10px]">(coming soon)</span>}
                      <button
                        onClick={() => handleRemoveBrand(b)}
                        className="text-stone-400 hover:text-stone-600 ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
                  placeholder="Add brand..."
                  className="flex-1 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-700 placeholder:text-stone-300"
                />
                <button
                  onClick={handleAddBrand}
                  className="px-3 py-1.5 text-sm font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-stone-100 px-6 py-4 space-y-3">
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
            <Link
              href="/profile"
              className="block w-full text-center py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Redo Profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
