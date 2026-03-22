"use client";

import { useState, useEffect, useRef } from "react";
import { AdaptiveQuestion } from "@/lib/types";
import { FALLBACK_ADAPTIVE_QUESTIONS } from "@/lib/prompts";
import { extractColorsFromText } from "@/lib/colorUtils";

interface ColorQuizProps {
  questions?: AdaptiveQuestion[];
  initialAnswers: Record<string, string>;
  onComplete: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export default function ColorQuiz({ questions, initialAnswers, onComplete, isLoading, onBack }: ColorQuizProps & { onBack?: () => void }) {
  const activeQuestions = questions ?? (isLoading ? [] : FALLBACK_ADAPTIVE_QUESTIONS);

  // Start at the first unanswered question when resuming
  const [currentIdx, setCurrentIdx] = useState(() => {
    if (Object.keys(initialAnswers).length === 0 || activeQuestions.length === 0) return 0;
    const firstUnanswered = activeQuestions.findIndex((q) => !initialAnswers[q.id]);
    return firstUnanswered === -1 ? activeQuestions.length - 1 : firstUnanswered;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const lastSelectTime = useRef(0);

  // Auto-advance when loading resolves and we already have some answers
  useEffect(() => {
    if (activeQuestions.length > 0 && currentIdx >= activeQuestions.length) {
      onComplete(answers);
    }
  }, [activeQuestions.length, currentIdx, answers, onComplete]);

  const goBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (isLoading || activeQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-sm text-center">
          <div className="w-12 h-12 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-[#E8E2D8]" />
            <div className="absolute inset-0 rounded-full border-2 border-stone-700 border-t-transparent animate-spin" />
          </div>
          <h2 className="font-serif text-xl text-stone-900 mb-2">Analyzing your photos</h2>
          <p className="text-stone-400 text-sm">Preparing personalized color questions...</p>
        </div>
      </div>
    );
  }

  const question = activeQuestions[currentIdx];
  if (!question) return null;

  const handleSelect = (value: string) => {
    if (Date.now() - lastSelectTime.current < 500) return;
    lastSelectTime.current = Date.now();

    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentIdx + 1 >= activeQuestions.length) {
        onComplete(newAnswers);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 300);
  };

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
        {activeQuestions.map((_, i) => (
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

        {(() => {
          const colorOptions = question.options.map((opt) => ({
            ...opt,
            colors: extractColorsFromText(opt.label),
          }));
          const hasAnyColors = colorOptions.some((o) => o.colors.length > 0);

          if (!hasAnyColors) {
            // Text-only fallback (no color keywords found)
            return (
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-stone-700 bg-stone-800 text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => handleSelect("unsure")}
                  className={`w-full text-center px-5 py-3 transition-all ${
                    answers[question.id] === "unsure"
                      ? "text-stone-700 font-medium"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <span className="text-sm">I&apos;m not sure</span>
                </button>
              </div>
            );
          }

          // Split into swatch options vs text-only options
          const swatchOpts = colorOptions.filter((o) => o.colors.length > 0);
          const textOpts = colorOptions.filter((o) => o.colors.length === 0);

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-3">
                {swatchOpts.map((option) => {
                  const isSelected = answers[question.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`flex flex-col items-center gap-3 px-4 py-5 rounded-2xl border-2 transition-all w-[calc(50%-0.375rem)] ${
                        isSelected
                          ? "border-stone-700 bg-stone-800 text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex gap-1.5">
                        {option.colors.map((hex, i) => (
                          <span
                            key={i}
                            className="w-8 h-8 rounded-full shadow-sm border border-stone-200"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-center leading-tight">{option.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              {textOpts.map((option) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-stone-700 bg-stone-800 text-white shadow-sm"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
              {/* I don't know option */}
              <button
                onClick={() => handleSelect("unsure")}
                className={`w-full text-center px-5 py-3 transition-all ${
                  answers[question.id] === "unsure"
                    ? "text-stone-700 font-medium"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <span className="text-sm">I&apos;m not sure</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
