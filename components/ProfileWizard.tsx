"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WizardStep, ProfileWizardData, PhotoAnalysisResult, StyleProfile } from "@/lib/types";
import { saveStyleProfile } from "@/lib/styleProfile";
import PhotoUpload from "./PhotoUpload";
import ColorQuiz from "./ColorQuiz";
import StyleQuiz from "./StyleQuiz";
import ProfileLookbook from "./ProfileLookbook";

const STEP_ORDER: WizardStep[] = ["welcome", "photos", "color-quiz", "style-quiz", "generating", "review"];
const STEP_LABELS: Record<WizardStep, string> = {
  welcome: "Welcome",
  photos: "Photos",
  "color-quiz": "Colors",
  "style-quiz": "Style",
  generating: "Generating",
  review: "Review",
};

export default function ProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [data, setData] = useState<ProfileWizardData>({
    colorQuizAnswers: {},
    styleQuizAnswers: {},
    sizes: {},
  });
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

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
      setData((prev) => {
        const updated = { ...prev, styleQuizAnswers: answers, sizes };
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

  const handleSaveProfile = useCallback(async () => {
    if (profile) {
      await saveStyleProfile(profile);
      router.push("/");
    }
  }, [profile, router]);

  const handleRedo = useCallback(() => {
    setStep("welcome");
    setProfile(null);
    setData({ colorQuizAnswers: {}, styleQuizAnswers: {}, sizes: {} });
    setError(null);
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Progress bar */}
      {step !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200">
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
            <p className="text-stone-400 text-sm mb-10">
              Takes about 5 minutes. Your photos are analyzed securely and never stored.
            </p>
            <button
              onClick={() => setStep("photos")}
              className="px-10 py-4 bg-stone-900 text-white rounded-full text-base font-medium hover:bg-stone-800 transition-all active:scale-[0.97] shadow-sm"
            >
              Get Started
            </button>
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
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
          <div className="max-w-sm text-center">
            <div className="w-16 h-16 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
              <div className="absolute inset-0 rounded-full border-2 border-stone-700 border-t-transparent animate-spin" />
            </div>
            <h2 className="font-serif text-2xl text-stone-900 mb-3">
              Creating your profile
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Our AI stylist is analyzing your photos, quiz answers, and preferences to build a comprehensive style profile. This usually takes 30-60 seconds.
            </p>
            <div className="mt-8 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-stone-400 animate-pulse-soft"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review */}
      {step === "review" && profile && (
        <div className="animate-slide-up">
          <ProfileLookbook
            profile={profile}
            onSave={handleSaveProfile}
            onRedo={handleRedo}
          />
        </div>
      )}
    </main>
  );
}
