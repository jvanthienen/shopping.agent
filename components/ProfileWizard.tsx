"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardStep, ProfileWizardData, PhotoAnalysisResult, StyleProfile } from "@/lib/types";
import { saveStyleProfile, saveStyleProfileLocal } from "@/lib/styleProfile";
import { createClient } from "@/lib/supabase/client";
import PhotoUpload from "./PhotoUpload";
import ColorQuiz from "./ColorQuiz";
import StyleQuiz from "./StyleQuiz";
import ProfileLookbook from "./ProfileLookbook";
import AuthOverlay from "./AuthOverlay";

const STEP_ORDER: WizardStep[] = ["welcome", "photos", "color-quiz", "style-quiz", "generating", "review"];
const STEP_LABELS: Record<WizardStep, string> = {
  welcome: "Welcome",
  photos: "Photos",
  "color-quiz": "Colors",
  "style-quiz": "Style",
  generating: "Generating",
  review: "Review",
};

const GENERATING_SLIDES = [
  {
    type: "value" as const,
    title: "Your personal color palette",
    text: "We analyze your skin tone, hair, and eyes to find the exact colors that make you glow — and the ones to skip.",
  },
  {
    type: "quote" as const,
    text: "I used to spend hours shopping and still felt like nothing looked right. Now I know exactly what to look for.",
    author: "Maria L.",
  },
  {
    type: "value" as const,
    title: "A capsule wardrobe, built for you",
    text: "Get a complete list of essential pieces tailored to your body shape, style personality, and climate. No more closet full of clothes with nothing to wear.",
  },
  {
    type: "quote" as const,
    text: "The outfit formulas alone saved me so much time getting ready in the morning. Everything just works together.",
    author: "Sofia R.",
  },
  {
    type: "value" as const,
    title: "Shop smarter, not harder",
    text: "Every product gets scored against your profile — color match, silhouette fit, fabric quality, and weather suitability. Only the best pieces make the cut.",
  },
  {
    type: "quote" as const,
    text: "I finally understand why some colors wash me out. This changed how I shop completely.",
    author: "Ana K.",
  },
  {
    type: "value" as const,
    title: "Outfit ideas on demand",
    text: "Get complete outfit formulas you can recreate with your wardrobe — styled for your personality, your body, and your city's weather.",
  },
];

function GeneratingScreen({ firstName }: { firstName?: string }) {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % GENERATING_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const slide = GENERATING_SLIDES[slideIdx];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      <div className="max-w-md w-full text-center">
        {/* Spinner + title */}
        <div className="w-14 h-14 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[#E8E2D8]" />
          <div className="absolute inset-0 rounded-full border-2 border-stone-700 border-t-transparent animate-spin" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 mb-2">
          {firstName ? `Hang tight, ${firstName}` : "Creating your profile"}
        </h2>
        <p className="text-stone-400 text-xs mb-10">
          Our AI stylist is building your personalized profile...
        </p>

        {/* Rotating content card */}
        <div className="min-h-[160px] flex items-center justify-center">
          <div key={slideIdx} className="animate-fade-in">
            {slide.type === "value" ? (
              <div className="bg-white/90 rounded-2xl border border-[#E8E2D8] p-6 text-left shadow-sm">
                <p className="text-stone-800 font-medium text-sm mb-2">{slide.title}</p>
                <p className="text-stone-500 text-sm leading-relaxed">{slide.text}</p>
              </div>
            ) : (
              <div className="px-4">
                <p className="text-stone-600 text-sm italic leading-relaxed mb-3">
                  &ldquo;{slide.text}&rdquo;
                </p>
                <p className="text-stone-400 text-xs">&mdash; {slide.author}</p>
              </div>
            )}
          </div>
        </div>

        {/* Slide indicator dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {GENERATING_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? "w-6 bg-stone-600" : "w-1.5 bg-[#E8E2D8]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [data, setData] = useState<ProfileWizardData>({
    firstName: "",
    colorQuizAnswers: {},
    styleQuizAnswers: {},
    sizes: {},
  });
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // On mount: check for pending profile from OAuth/magic-link redirect
  useEffect(() => {
    const checkPendingProfile = async () => {
      const pending = localStorage.getItem("pendingStyleProfile");
      if (!pending) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const pendingProfile = JSON.parse(pending) as StyleProfile;

      if (user) {
        // Authenticated with a pending profile — save and redirect
        localStorage.removeItem("pendingStyleProfile");
        await saveStyleProfile(pendingProfile);
        router.push("/");
      } else {
        // Came back but not authenticated — restore review step
        setProfile(pendingProfile);
        setData((prev) => ({
          ...prev,
          firstName: pendingProfile.firstName || "",
          preferredBrands: pendingProfile.preferredBrands || [],
        }));
        setStep("review");
        setShowAuth(true);
      }
    };
    checkPendingProfile();
  }, [router]);

  const currentIndex = STEP_ORDER.indexOf(step);
  const progressPercent = Math.round((currentIndex / (STEP_ORDER.length - 1)) * 100);

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0 && step !== "generating") {
      setStep(STEP_ORDER[idx - 1]);
      setError(null);
    }
  }, [step]);

  // --- API calls ---

  const analyzePhotos = useCallback(async () => {
    setStep("color-quiz");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-photos",
          selfieBase64: data.selfieBase64,
          bodyPhotoBase64: data.bodyPhotoBase64,
          heightCm: data.heightCm,
        }),
      });
      if (!res.ok) throw new Error("Photo analysis failed");
      const analysis: PhotoAnalysisResult = await res.json();
      setData((prev) => ({ ...prev, photoAnalysis: analysis }));
    } catch (err) {
      // Use fallback questions — don't block the wizard
      console.error("Photo analysis error:", err);
      const fallbackRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze-photos", selfieBase64: data.selfieBase64, bodyPhotoBase64: data.bodyPhotoBase64 }),
      });
      if (fallbackRes.ok) {
        const analysis = await fallbackRes.json();
        setData((prev) => ({ ...prev, photoAnalysis: analysis }));
      }
    }
  }, [data.selfieBase64, data.bodyPhotoBase64, data.heightCm]);

  const synthesizeProfile = useCallback(async () => {
    setStep("generating");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize-profile",
          selfieBase64: data.selfieBase64,
          bodyPhotoBase64: data.bodyPhotoBase64,
          photoAnalysis: data.photoAnalysis,
          colorQuizAnswers: data.colorQuizAnswers,
          styleQuizAnswers: data.styleQuizAnswers,
          sizes: data.sizes,
          heightCm: data.heightCm,
          location: data.location,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Profile generation failed");
      }
      const generatedProfile: StyleProfile = await res.json();
      generatedProfile.firstName = data.firstName || "";
      if (!generatedProfile.gender && data.photoAnalysis?.gender) {
        generatedProfile.gender = data.photoAnalysis.gender;
      }
      setProfile(generatedProfile);
      setStep("review");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setRetryAction(() => synthesizeProfile);
      setStep("style-quiz"); // go back so user can retry
    }
  }, [data]);

  // --- Step handlers ---

  const handlePhotosComplete = useCallback(
    (photos: { selfieBase64: string; bodyPhotoBase64: string; heightCm?: number; location?: string }) => {
      setData((prev) => ({ ...prev, ...photos }));
      // Trigger photo analysis, which transitions to color-quiz
      setTimeout(() => {
        setData((current) => {
          // We need the latest data for the API call
          const updated = { ...current, ...photos };
          // Kick off analysis with updated data
          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "analyze-photos",
              selfieBase64: updated.selfieBase64,
              bodyPhotoBase64: updated.bodyPhotoBase64,
              heightCm: updated.heightCm,
            }),
          })
            .then((res) => res.json())
            .then((analysis) => setData((prev) => ({ ...prev, photoAnalysis: analysis })))
            .catch(console.error);
          return updated;
        });
      }, 0);
      setStep("color-quiz");
    },
    []
  );

  const handleColorQuizComplete = useCallback((answers: Record<string, string>) => {
    setData((prev) => ({ ...prev, colorQuizAnswers: answers }));
    setStep("style-quiz");
  }, []);

  const handleStyleQuizComplete = useCallback(
    (answers: Record<string, string | string[]>, sizes: Record<string, string[]>) => {
      const brands = (answers["preferred_brands"] as string[]) || [];
      setData((prev) => {
        const updated = { ...prev, styleQuizAnswers: answers, sizes, preferredBrands: brands };
        // Trigger synthesis with the complete data
        setTimeout(() => {
          setStep("generating");
          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "synthesize-profile",
              selfieBase64: updated.selfieBase64,
              bodyPhotoBase64: updated.bodyPhotoBase64,
              photoAnalysis: updated.photoAnalysis,
              colorQuizAnswers: updated.colorQuizAnswers,
              styleQuizAnswers: answers,
              sizes,
              heightCm: updated.heightCm,
              location: updated.location,
            }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || "Profile generation failed");
              }
              return res.json();
            })
            .then((generatedProfile) => {
              generatedProfile.firstName = updated.firstName || "";
              generatedProfile.preferredBrands = updated.preferredBrands || [];
              // Ensure gender is set (from synthesis or fallback to photo analysis)
              if (!generatedProfile.gender && updated.photoAnalysis?.gender) {
                generatedProfile.gender = updated.photoAnalysis.gender;
              }
              setProfile(generatedProfile);
              setStep("review");
            })
            .catch((err) => {
              setError(err.message);
              setRetryAction(() => () => synthesizeProfile());
              setStep("style-quiz");
            });
        }, 0);
        return updated;
      });
    },
    [synthesizeProfile]
  );

  const handleSaveProfile = useCallback(() => {
    if (!profile) return;

    // Save locally and go to shopping
    saveStyleProfileLocal(profile);
    router.push("/");
  }, [profile, router]);

  const handleSavePendingProfile = useCallback(() => {
    if (profile) {
      localStorage.setItem("pendingStyleProfile", JSON.stringify(profile));
    }
  }, [profile]);

  const handleSkipAuth = useCallback(async () => {
    if (profile) {
      await saveStyleProfile(profile);
      router.push("/");
    }
  }, [profile, router]);

  const handleRedo = useCallback(() => {
    setStep("welcome");
    setProfile(null);
    setData({ firstName: "", colorQuizAnswers: {}, styleQuizAnswers: {}, sizes: {} });
    setError(null);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Progress bar */}
      {step !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#E8E2D8]">
          <div
            className="h-full bg-stone-700 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Back button — only for photos step (quizzes handle their own back) */}
      {step === "photos" && (
        <button
          onClick={goBack}
          className="fixed top-5 left-5 z-50 flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Step indicator */}
      {step !== "welcome" && step !== "generating" && (
        <div className="fixed top-5 right-5 z-50">
          <span className="text-xs text-stone-400 tracking-wide uppercase">
            {STEP_LABELS[step]}
          </span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm animate-slide-up max-w-md">
          <p className="text-red-700 text-sm">{error}</p>
          {retryAction && (
            <button
              onClick={() => { setError(null); retryAction(); }}
              className="shrink-0 text-red-600 font-medium text-sm hover:text-red-800"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Welcome */}
      {step === "welcome" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-4xl text-stone-900 mb-4">
              Your Style Profile
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed mb-3">
              Upload two photos and answer a few questions. Our AI stylist will analyze your coloring, body shape, and preferences to create a personalized profile.
            </p>
            <p className="text-stone-400 text-sm mb-8">
              Takes about 5 minutes. Your photos are analyzed securely and never stored.
            </p>
            <input
              type="text"
              value={data.firstName ?? ""}
              onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="What should we call you?"
              className="w-full max-w-xs mx-auto px-5 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-base text-center focus:outline-none focus:border-stone-400 transition-colors mb-8"
            />
            <button
              onClick={() => setStep("photos")}
              className="px-10 py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.97] shadow-sm"
            >
              Get Started
            </button>

            {/* Dev shortcut — skip to lookbook with a static profile */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => {
                  const mockProfile: StyleProfile = {
                    firstName: data.firstName || "Test",
                    colorSeason: "Soft Summer",
                    contrast: "Medium",
                    skinUndertone: "Cool-neutral",
                    goodColors: ["dusty rose", "sage green", "navy blue", "soft lavender", "slate blue", "taupe", "pearl gray"],
                    avoidColors: ["neon", "bright yellow", "orange", "hot pink"],
                    colorRules: ["Stick to muted, cool-leaning tones", "Pair navy with dusty rose for contrast"],
                    colorStrategy: {
                      professional: ["navy blue", "slate blue", "pearl gray"],
                      negotiation: ["dusty rose", "soft lavender"],
                      avoid: ["neon", "bright yellow"],
                      greenNuances: ["sage green", "mint green"],
                      pairingRules: ["Navy + dusty rose", "Sage + cream"],
                    },
                    bodyShape: "Rectangle",
                    bodyRules: ["Define the waist with belts or tailored pieces", "A-line skirts add curve"],
                    stylePersonality: {
                      name: "Modern Classic",
                      essence: "Timeless with a relaxed edge",
                      perception: "Polished and approachable",
                      keyElements: ["Clean lines", "Quality fabrics", "Neutral palette with soft accents"],
                    },
                    goodSilhouettes: {
                      tops: ["fitted crewneck", "relaxed blazer", "wrap top"],
                      bottoms: ["high-waist straight-leg", "tailored trousers", "A-line skirt"],
                      dresses: ["wrap dress", "shirt dress", "fit-and-flare"],
                    },
                    avoidSilhouettes: ["boxy oversized everything", "very low-rise"],
                    necklines: { ideal: ["V-neck", "scoop", "boat neck"], avoid: ["halter", "extreme plunge"] },
                    goodFabrics: ["cotton", "silk", "cashmere", "linen"],
                    avoidFabrics: ["polyester", "shiny synthetics"],
                    goodPrints: ["thin stripes", "subtle florals", "classic plaid"],
                    avoidPrints: ["large bold graphics", "neon prints"],
                    shoes: {
                      ideal: ["pointed-toe flats", "block-heel ankle boots", "white sneakers"],
                      avoid: ["chunky platform sneakers"],
                      rules: ["Keep shoes tonal with the outfit"],
                    },
                    capsuleWardrobe: {
                      tops: ["2 white cotton tees", "1 navy Breton stripe", "1 cream silk blouse", "1 gray cashmere crewneck"],
                      bottoms: ["1 dark wash straight-leg jeans", "1 black tailored trousers", "1 camel A-line skirt"],
                      outerwear: ["1 navy wool blazer", "1 beige trench coat", "1 black leather jacket"],
                      dresses: ["1 navy wrap dress", "1 black shirt dress"],
                      shoes: ["1 pointed-toe flats in black", "1 white sneakers", "1 block-heel ankle boots"],
                      accessories: ["1 leather tote bag", "1 silk scarf in dusty rose"],
                    },
                    outfitFormulas: [
                      "Blazer + white tee + straight jeans + pointed flats",
                      "Silk blouse + tailored trousers + block-heel boots",
                      "Cashmere crew + A-line skirt + ankle boots",
                    ],
                    sizes: { tops: ["S"], jeans: ["27"], pants: ["4"], dresses: ["S"], shoes: ["7.5"] },
                    preferredBrands: ["Zara", "Uniqlo", "Quince"],
                    location: "San Francisco, CA",
                    climate: "Mediterranean — mild, foggy summers and cool winters",
                    seasonalNotes: ["Layer for microclimates", "Keep a light jacket year-round"],
                    scoringGuidance: "Prioritize muted cool tones, natural fabrics, and clean silhouettes. Avoid oversized or overly trendy pieces.",
                  };
                  setProfile(mockProfile);
                  setData((prev) => ({ ...prev, firstName: mockProfile.firstName, preferredBrands: mockProfile.preferredBrands }));
                  setStep("review");
                }}
                className="mt-4 px-6 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
              >
                Skip to Lookbook (dev)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Photos */}
      {step === "photos" && (
        <div className="animate-slide-up">
          <PhotoUpload
            initialData={{
              selfieBase64: data.selfieBase64,
              bodyPhotoBase64: data.bodyPhotoBase64,
              heightCm: data.heightCm,
              location: data.location,
            }}
            onComplete={handlePhotosComplete}
          />
        </div>
      )}

      {/* Color Quiz */}
      {step === "color-quiz" && (
        <div className="animate-slide-up">
          <ColorQuiz
            questions={data.photoAnalysis?.adaptiveQuestions}
            initialAnswers={data.colorQuizAnswers}
            onComplete={handleColorQuizComplete}
            isLoading={!data.photoAnalysis}
            onBack={() => setStep("photos")}
          />
        </div>
      )}

      {/* Style Quiz */}
      {step === "style-quiz" && (
        <div className="animate-slide-up">
          <StyleQuiz
            initialAnswers={data.styleQuizAnswers}
            initialSizes={data.sizes}
            onComplete={handleStyleQuizComplete}
            onBack={() => setStep("color-quiz")}
          />
        </div>
      )}

      {/* Generating */}
      {step === "generating" && <GeneratingScreen firstName={data.firstName} />}

      {/* Review */}
      {step === "review" && profile && (
        <div className="animate-slide-up">
          <ProfileLookbook
            profile={profile}
            firstName={data.firstName || profile.firstName || ""}
            preferredBrands={data.preferredBrands || profile.preferredBrands || []}
            onSave={handleSaveProfile}
            onRedo={handleRedo}
          />
        </div>
      )}

      {/* Auth overlay — shown when user tries to save without being signed in */}
      {showAuth && (
        <AuthOverlay
          onClose={() => setShowAuth(false)}
          onSkip={handleSkipAuth}
          redirectPath="/profile"
          onBeforeRedirect={handleSavePendingProfile}
          title="Save your profile"
          subtitle="Sign in to sync your style profile across devices"
          skipLabel="Continue without account"
        />
      )}
    </main>
  );
}
