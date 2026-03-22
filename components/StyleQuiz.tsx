"use client";

import { useState, useCallback, useRef } from "react";

// Brands with live search integration
export const SUPPORTED_BRANDS = [
  "Zara",
  "Uniqlo",
  "Quince",
  "Anthropologie",
  "H&M",
  "Everlane",
  "COS",
  "ASOS",
] as const;

const SUPPORTED_SET = new Set(SUPPORTED_BRANDS.map((b) => b.toLowerCase()));

interface StyleQuizProps {
  initialAnswers: Record<string, string | string[]>;
  initialSizes: Record<string, string[]>;
  onComplete: (answers: Record<string, string | string[]>, sizes: Record<string, string[]>) => void;
  onBack?: () => void;
}

interface QuestionDef {
  id: string;
  question: string;
  type: "single" | "multi" | "text" | "text-3" | "sizes";
  options?: string[];
}

const QUESTIONS: QuestionDef[] = [
  {
    id: "work_environment",
    question: "What best describes your work environment?",
    type: "single",
    options: [
      "Corporate / formal office",
      "Smart casual office",
      "Creative / startup",
      "Remote / work from home",
      "Client-facing (meetings, events)",
      "Active / on-the-go",
    ],
  },
  {
    id: "style_message",
    question: "How do you want people to perceive you? (pick up to 3)",
    type: "multi",
    options: [
      "Professional & polished",
      "Creative & expressive",
      "Approachable & friendly",
      "Effortlessly cool",
      "Sophisticated & elegant",
      "Youthful & energetic",
      "Minimal & understated",
      "Bold & confident",
    ],
  },
  {
    id: "style_archetype",
    question: "Which style families resonate with you? (pick 2)",
    type: "multi",
    options: [
      "Sport — comfort + sensuality, casual-elevated",
      "Romantic — soft, feminine, flowing",
      "Classic — timeless, structured, polished",
      "Natural — relaxed, organic, earthy",
      "Dramatic — bold, angular, statement pieces",
      "Creative — eclectic, artsy, unconventional",
    ],
  },
  {
    id: "fit_preference",
    question: "What fit do you gravitate toward?",
    type: "single",
    options: [
      "Fitted — close to the body",
      "Relaxed — comfortable but shaped",
      "Oversized — loose and voluminous",
      "Depends on the piece",
    ],
  },
  {
    id: "fabric_preferences",
    question: "Which fabrics do you love? (pick all that apply)",
    type: "multi",
    options: [
      "Cotton & linen",
      "Cashmere & wool knits",
      "Silk & satin",
      "Leather & suede",
      "Denim",
      "Jersey & stretch",
      "Velvet",
      "Technical / performance fabrics",
    ],
  },
  {
    id: "favorite_outfit",
    question: "Describe your favorite outfit — the one you feel best in.",
    type: "text",
  },
  {
    id: "never_wear",
    question: "What would you never wear?",
    type: "text",
  },
  {
    id: "three_words",
    question: "Three words that describe your ideal style:",
    type: "text-3",
  },
  {
    id: "preferred_brands",
    question: "Which stores do you shop at? (pick all that apply)",
    type: "multi",
    options: [...SUPPORTED_BRANDS],
  },
  {
    id: "sizes",
    question: "What are your sizes?",
    type: "sizes",
  },
];

export const SIZE_CATEGORIES = [
  { key: "tops", label: "Tops", options: ["XXS", "XS", "S", "M", "L", "XL"] },
  { key: "jeans", label: "Jeans", options: ["24", "25", "26", "27", "28", "29", "30", "31", "32"] },
  { key: "pants", label: "Pants", options: ["0", "2", "4", "6", "8", "10", "12"] },
  { key: "dresses", label: "Dresses", options: ["XXS", "XS", "S", "M", "L", "XL"] },
  { key: "shoes", label: "Shoes", options: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"] },
  { key: "outerwear", label: "Outerwear", options: ["XXS", "XS", "S", "M", "L", "XL"] },
  { key: "skirts", label: "Skirts", options: ["XXS", "XS", "S", "M", "L", "XL"] },
];

export default function StyleQuiz({ initialAnswers, initialSizes, onComplete, onBack }: StyleQuizProps) {
  // Start at the first unanswered question when resuming
  const [currentIdx, setCurrentIdx] = useState(() => {
    if (Object.keys(initialAnswers).length === 0) return 0;
    const firstUnanswered = QUESTIONS.findIndex((q) => !initialAnswers[q.id]);
    return firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered;
  });
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers);
  const [sizes, setSizes] = useState<Record<string, string[]>>(initialSizes);
  const [textValue, setTextValue] = useState("");
  const [text3Values, setText3Values] = useState<[string, string, string]>(["", "", ""]);
  const [customBrand, setCustomBrand] = useState("");
  const [customBrandNote, setCustomBrandNote] = useState("");

  const goBack = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setTextValue("");
      setText3Values(["", "", ""]);
    } else if (onBack) {
      onBack();
    }
  }, [currentIdx, onBack]);

  const question = QUESTIONS[currentIdx];

  const advance = useCallback(() => {
    if (currentIdx + 1 >= QUESTIONS.length) {
      onComplete(answers, sizes);
    } else {
      setCurrentIdx((i) => i + 1);
      setTextValue("");
      setText3Values(["", "", ""]);
    }
  }, [currentIdx, answers, sizes, onComplete]);

  const lastSelectTime = useRef(0);

  const handleSingleSelect = (value: string) => {
    if (Date.now() - lastSelectTime.current < 500) return;
    lastSelectTime.current = Date.now();
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setTimeout(advance, 300);
  };

  const handleMultiToggle = (value: string) => {
    setAnswers((prev) => {
      const current = (prev[question.id] as string[]) ?? [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleAddCustomBrand = () => {
    const trimmed = customBrand.trim();
    if (!trimmed) return;
    // Extract brand name from URL or use as-is
    let brandName = trimmed;
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      brandName = url.hostname.replace(/^www\./, "").split(".")[0];
      // Capitalize first letter
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    } catch {
      // Not a URL, use as brand name directly
    }
    setAnswers((prev) => {
      const current = (prev["preferred_brands"] as string[]) ?? [];
      if (current.includes(brandName)) return prev;
      return { ...prev, preferred_brands: [...current, brandName] };
    });
    setCustomBrand("");

    // Show note if brand isn't in the supported list
    if (!SUPPORTED_SET.has(brandName.toLowerCase())) {
      setCustomBrandNote(`${brandName} saved! We'll integrate it soon — for now, we'll show you picks from our current stores.`);
      setTimeout(() => setCustomBrandNote(""), 5000);
    } else {
      setCustomBrandNote("");
    }
  };

  const handleSizeToggle = (category: string, size: string) => {
    setSizes((prev) => {
      const current = prev[category] ?? [];
      const updated = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...prev, [category]: updated };
    });
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) return;
    setAnswers((prev) => ({ ...prev, [question.id]: textValue.trim() }));
    advance();
  };

  const handleText3Submit = () => {
    const filtered = text3Values.filter((v) => v.trim());
    if (filtered.length === 0) return;
    setAnswers((prev) => ({ ...prev, [question.id]: filtered.map((v) => v.trim()) }));
    advance();
  };

  const multiSelected = (answers[question?.id] as string[]) ?? [];
  const hasMultiSelection = multiSelected.length > 0;
  const hasSizes = Object.values(sizes).some((s) => s.length > 0);

  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      {/* Back button */}
      {(currentIdx > 0 || onBack) && (
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Question counter */}
      <div className="flex justify-center gap-2 mb-10">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIdx ? "w-8 bg-stone-700" : i < currentIdx ? "w-4 bg-stone-400" : "w-4 bg-[#E8E2D8]"
            }`}
          />
        ))}
      </div>

      <div className="animate-fade-in" key={question.id}>
        <h2 className="font-serif text-2xl text-stone-900 text-center mb-8 leading-snug">
          {question.question}
        </h2>

        {/* Single select */}
        {question.type === "single" && (
          <div className="space-y-3">
            {question.options!.map((option) => {
              const isSelected = answers[question.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSingleSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-stone-700 bg-stone-800 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <span className="text-sm font-medium">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Multi select */}
        {question.type === "multi" && (
          <>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {question.options!.map((option) => {
                const isSelected = multiSelected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiToggle(option)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                      isSelected
                        ? "border-stone-700 bg-stone-800 text-white"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              {/* Show custom brands that were added */}
              {question.id === "preferred_brands" &&
                multiSelected
                  .filter((b) => !question.options!.includes(b))
                  .map((b) => (
                    <button
                      key={b}
                      onClick={() => handleMultiToggle(b)}
                      className="px-4 py-2.5 rounded-full text-sm font-medium border-2 border-stone-700 bg-stone-800 text-white transition-all"
                    >
                      {b}
                    </button>
                  ))}
            </div>

            {/* Custom brand input */}
            {question.id === "preferred_brands" && (
              <div className="mb-6 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomBrand(); }}
                    placeholder="Add another store..."
                    className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-stone-400 transition-colors"
                  />
                  <button
                    onClick={handleAddCustomBrand}
                    disabled={!customBrand.trim()}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      customBrand.trim()
                        ? "bg-stone-900 text-white hover:bg-stone-800"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    Add
                  </button>
                </div>
                {customBrandNote && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    {customBrandNote}
                  </p>
                )}
                <p className="text-xs text-stone-400 mt-1">More brands coming soon — request yours above</p>
              </div>
            )}

            {!question.id.startsWith("preferred_brands") && <div className="mb-4" />}
            {hasMultiSelection && (
              <button
                onClick={advance}
                className="w-full py-3.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all"
              >
                Continue
              </button>
            )}
          </>
        )}

        {/* Free text */}
        {question.type === "text" && (
          <div>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Type your answer..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-stone-400 resize-none mb-4"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className={`w-full py-3.5 rounded-full text-sm font-medium transition-all ${
                textValue.trim()
                  ? "bg-stone-900 text-white hover:bg-stone-800"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* 3 text inputs */}
        {question.type === "text-3" && (
          <div>
            <div className="flex gap-3 mb-6">
              {text3Values.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const updated = [...text3Values] as [string, string, string];
                    updated[i] = e.target.value;
                    setText3Values(updated);
                  }}
                  placeholder={`Word ${i + 1}`}
                  className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm text-center focus:outline-none focus:border-stone-400"
                />
              ))}
            </div>
            <button
              onClick={handleText3Submit}
              disabled={!text3Values.some((v) => v.trim())}
              className={`w-full py-3.5 rounded-full text-sm font-medium transition-all ${
                text3Values.some((v) => v.trim())
                  ? "bg-stone-900 text-white hover:bg-stone-800"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Sizes grid */}
        {question.type === "sizes" && (
          <div>
            <div className="space-y-5 mb-8">
              {SIZE_CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <label className="block text-sm font-medium text-stone-600 mb-2">{cat.label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.options.map((size) => {
                      const isSelected = (sizes[cat.key] ?? []).includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeToggle(cat.key, size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "border-stone-700 bg-stone-800 text-white"
                              : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
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
            <button
              onClick={advance}
              disabled={!hasSizes}
              className={`w-full py-4 rounded-full text-base font-medium transition-all ${
                hasSizes
                  ? "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-sm"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              Generate My Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
