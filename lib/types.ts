export interface ProductSize {
  name: string;        // e.g., "S", "M", "26", "7.5"
  inStock: boolean;
  variantId?: string;  // Zara size variant ID for URL pre-selection
}

export interface Product {
  id: string;
  name: string;
  price: string;
  color?: string;
  category?: string;
  brand?: string;
  imageUrl: string;
  productUrl: string;
  score?: number;
  matchReason?: string;
  isGreatMatch?: boolean;
  availableSizes?: ProductSize[];
  selectedSize?: string;  // The user's size for this product (e.g., "S", "26")
}

export interface Outfit {
  id: string;
  name: string;
  vibe: string;
  items: Product[];
  totalPrice: string;
}

// --- Style Profile Types ---

export interface StyleProfile {
  colorSeason: string;
  contrast: string;
  skinUndertone: string;
  goodColors: string[];
  avoidColors: string[];
  colorRules: string[];
  colorStrategy: {
    professional: string[];
    negotiation: string[];
    avoid: string[];
    greenNuances: string[];
    pairingRules: string[];
  };
  bodyShape: string;
  bodyRules: string[];
  stylePersonality: {
    name: string;
    essence: string;
    perception: string;
    keyElements: string[];
  };
  goodSilhouettes: Record<string, string[]>;
  avoidSilhouettes: string[];
  necklines: { ideal: string[]; avoid: string[] };
  goodFabrics: string[];
  avoidFabrics: string[];
  goodPrints: string[];
  avoidPrints: string[];
  shoes: { ideal: string[]; avoid: string[]; rules: string[] };
  capsuleWardrobe: Record<string, string[]>;
  outfitFormulas: string[];
  sizes: Record<string, string[]>;
  location: string;
  climate: string;
  seasonalNotes: string[];
  scoringGuidance: string;
}

export type WizardStep = "welcome" | "photos" | "color-quiz" | "style-quiz" | "generating" | "review";

export interface PhotoAnalysisResult {
  undertone: string;
  hairColor: string;
  eyeColor: string;
  contrast: string;
  bodyProportions: string;
  suggestedSeason: string;
  confidence: number;
  adaptiveQuestions: AdaptiveQuestion[];
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
}

export interface ProfileWizardData {
  selfieBase64?: string;
  bodyPhotoBase64?: string;
  heightCm?: number;
  location?: string;
  photoAnalysis?: PhotoAnalysisResult;
  colorQuizAnswers: Record<string, string>;
  styleQuizAnswers: Record<string, string | string[]>;
  sizes: Record<string, string[]>;
}
