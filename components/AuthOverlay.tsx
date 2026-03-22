"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthOverlayProps {
  onClose: () => void;
  /** Called after the user chooses to skip auth entirely */
  onSkip?: () => void;
  /** Where to redirect after OAuth/magic-link sign-in (default: current page) */
  redirectPath?: string;
  /** Called before redirect — use to persist state to localStorage */
  onBeforeRedirect?: () => void;
  title?: string;
  subtitle?: string;
  skipLabel?: string;
}

export default function AuthOverlay({
  onClose,
  onSkip,
  redirectPath,
  onBeforeRedirect,
  title = "Sign in",
  subtitle = "Sync your style profile and saved items across devices",
  skipLabel,
}: AuthOverlayProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback${redirectPath ? `?next=${redirectPath}` : ""}`;

  const handleGoogle = useCallback(() => {
    onBeforeRedirect?.();
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  }, [callbackUrl, onBeforeRedirect]);

  const handleMagicLink = useCallback(async () => {
    if (!email) return;
    onBeforeRedirect?.();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    setEmailSent(true);
    setLoading(false);
  }, [email, callbackUrl, onBeforeRedirect]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-8 pb-10 sm:pb-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-serif text-2xl text-stone-900 mb-2 text-center">{title}</h3>
        <p className="text-stone-500 text-sm mb-6 text-center">{subtitle}</p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-stone-700 text-sm font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-stone-400 text-xs">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Magic link */}
        {!emailSent ? (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-stone-400 transition-colors"
            />
            <button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="px-4 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Sending..." : "Send link"}
            </button>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-stone-700 text-sm font-medium mb-1">Check your email</p>
            <p className="text-stone-500 text-xs">Click the link we sent to sign in.</p>
          </div>
        )}

        {/* Skip */}
        {(onSkip || skipLabel) && (
          <button
            onClick={onSkip ?? onClose}
            className="mt-5 w-full text-center text-stone-400 text-sm hover:text-stone-600 transition-colors"
          >
            {skipLabel ?? "Continue without account"}
          </button>
        )}
      </div>
    </div>
  );
}
