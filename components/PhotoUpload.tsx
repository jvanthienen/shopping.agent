"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface PhotoUploadProps {
  initialData: {
    selfieBase64?: string;
    bodyPhotoBase64?: string;
    heightCm?: number;
    location?: string;
  };
  onComplete: (data: {
    selfieBase64: string;
    bodyPhotoBase64: string;
    heightCm?: number;
    location?: string;
  }) => void;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeDataURL(dataURL: string, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}

function CameraModal({
  target,
  onCapture,
  onClose,
}: {
  target: "selfie" | "body";
  onCapture: (dataURL: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const facingMode = target === "selfie" ? "user" : "environment";

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setReady(true);
          };
        }
      })
      .catch(() => {
        if (!cancelled) setError("Camera access denied. Please allow camera permissions.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [target]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    if (target === "selfie") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(dataURL);
  }, [target, onCapture]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); onClose(); }} className="text-white text-sm font-medium">
          Cancel
        </button>
        <span className="text-white/70 text-sm">
          {target === "selfie" ? "Face Selfie" : "Full Body Photo"}
        </span>
        <div className="w-14" />
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <p className="text-white/60 text-center px-8">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${target === "selfie" ? "scale-x-[-1]" : ""}`}
          />
        )}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Shutter */}
      <div className="flex items-center justify-center py-8 bg-black/80">
        <button
          onClick={capture}
          disabled={!ready}
          className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
          style={{ width: 72, height: 72 }}
        >
          <div className="w-14 h-14 rounded-full bg-white" style={{ width: 56, height: 56 }} />
        </button>
      </div>
    </div>
  );
}

export default function PhotoUpload({ initialData, onComplete }: PhotoUploadProps) {
  const [selfie, setSelfie] = useState<string | undefined>(initialData.selfieBase64);
  const [bodyPhoto, setBodyPhoto] = useState<string | undefined>(initialData.bodyPhotoBase64);
  const [heightValue, setHeightValue] = useState(initialData.heightCm?.toString() ?? "");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [location, setLocation] = useState(initialData.location ?? "");
  const [dragOver, setDragOver] = useState<"selfie" | "body" | null>(null);
  const [cameraTarget, setCameraTarget] = useState<"selfie" | "body" | null>(null);

  const selfieRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File, target: "selfie" | "body") => {
    if (!file.type.startsWith("image/")) return;
    const resized = await resizeImage(file, 1024);
    if (target === "selfie") setSelfie(resized);
    else setBodyPhoto(resized);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent, target: "selfie" | "body") => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file, target);
    },
    [handleFile]
  );

  const handleCameraCapture = useCallback(async (dataURL: string) => {
    const target = cameraTarget;
    setCameraTarget(null);
    if (!target) return;
    const resized = await resizeDataURL(dataURL, 1024);
    if (target === "selfie") setSelfie(resized);
    else setBodyPhoto(resized);
  }, [cameraTarget]);

  const openCamera = useCallback((target: "selfie" | "body") => {
    setCameraTarget(target);
  }, []);

  const openFilePicker = useCallback((target: "selfie" | "body") => {
    if (target === "selfie") selfieRef.current?.click();
    else bodyRef.current?.click();
  }, []);

  const heightCm = (() => {
    const val = parseFloat(heightValue);
    if (isNaN(val)) return undefined;
    if (heightUnit === "ft") return Math.round(val * 30.48);
    return Math.round(val);
  })();

  const canContinue = !!selfie && !!bodyPhoto;

  return (
    <>
      {cameraTarget && (
        <CameraModal
          target={cameraTarget}
          onCapture={handleCameraCapture}
          onClose={() => setCameraTarget(null)}
        />
      )}

      <div className="max-w-lg mx-auto px-5 py-16">
        <h2 className="font-serif text-3xl text-stone-900 text-center mb-2">Your Photos</h2>
        <p className="text-stone-400 text-sm text-center mb-10">
          Take a face selfie and a full-body photo in natural light.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Selfie */}
          <div
            className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
              dragOver === "selfie"
                ? "border-stone-500 bg-[#EDE8DF]"
                : selfie
                ? "border-transparent"
                : "border-[#DDD7CC] bg-white/80"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver("selfie"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop(e, "selfie")}
          >
            {selfie ? (
              <>
                <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelfie(undefined)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70"
                >
                  &times;
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                <span className="text-stone-500 text-sm font-medium">Face selfie</span>
                <div className="flex flex-col gap-2 w-full px-2 mt-1">
                  <button
                    onClick={() => openCamera("selfie")}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 active:scale-[0.97] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Take photo
                  </button>
                  <button
                    onClick={() => openFilePicker("selfie")}
                    className="w-full py-2 rounded-lg border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 active:scale-[0.97] transition-all"
                  >
                    Upload from files
                  </button>
                </div>
              </div>
            )}
            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, "selfie");
                e.target.value = "";
              }}
            />
          </div>

          {/* Body photo */}
          <div
            className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
              dragOver === "body"
                ? "border-stone-500 bg-[#EDE8DF]"
                : bodyPhoto
                ? "border-transparent"
                : "border-[#DDD7CC] bg-white/80"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver("body"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop(e, "body")}
          >
            {bodyPhoto ? (
              <>
                <img src={bodyPhoto} alt="Full body" className="w-full h-full object-cover" />
                <button
                  onClick={() => setBodyPhoto(undefined)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70"
                >
                  &times;
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300">
                  <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M16 11v1a4 4 0 0 1-8 0v-1" />
                  <rect x="8" y="14" width="8" height="8" rx="1" />
                </svg>
                <span className="text-stone-500 text-sm font-medium">Full body</span>
                <div className="flex flex-col gap-2 w-full px-2 mt-1">
                  <button
                    onClick={() => openFilePicker("body")}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 active:scale-[0.97] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload photo
                  </button>
                  <button
                    onClick={() => openCamera("body")}
                    className="w-full py-2 rounded-lg border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 active:scale-[0.97] transition-all"
                  >
                    Take photo instead
                  </button>
                </div>
              </div>
            )}
            <input
              ref={bodyRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, "body");
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Height */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-stone-600 mb-2">Height (optional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              placeholder={heightUnit === "cm" ? "165" : "5.5"}
              className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-stone-400 transition-colors"
            />
            <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden">
              {(["cm", "ft"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setHeightUnit(u)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    heightUnit === u ? "bg-stone-800 text-white" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-stone-600 mb-1.5">Where do you live?</label>
          <p className="text-stone-400 text-xs mb-2">So we can recommend pieces for your season and climate</p>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="San Francisco, CA"
            className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        {/* Continue */}
        <button
          disabled={!canContinue}
          onClick={() =>
            onComplete({
              selfieBase64: selfie!,
              bodyPhotoBase64: bodyPhoto!,
              heightCm,
              location: location || undefined,
            })
          }
          className={`w-full py-4 rounded-full text-base font-medium transition-all ${
            canContinue
              ? "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-sm"
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          Analyze My Photos
        </button>
      </div>
    </>
  );
}
