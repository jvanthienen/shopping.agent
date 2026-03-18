import { StyleProfile } from "./types";

// Josefina's style profile — extracted from Manual de Estilo by Nova Presencia (Danisa Bevcic)
// Comprehensive profile covering colorimetry, body shape, Sport personality, and capsule wardrobe

export const DEFAULT_STYLE_PROFILE: StyleProfile = {
  colorSeason: "Verano Suave (Soft Summer)",
  contrast: "Medium Cold — desaturated, muted tones with cool blue/gray undertones",
  skinUndertone: "Falsa cálida — olive skin with yellowish undertone that needs specific colors to prevent it from showing through",

  // Colors that flatter — muted, cool, desaturated
  goodColors: [
    // Fashion Neutrals (FN) — replacements for black and pure white
    "icicle", "birch", "light gray", "pearl gray", "satellite gray",
    "warm beige", "sand", "taupe", "plaza taupe", "iron",
    "dark charcoal brown", "dark gray-brown", "muted dark brown", "gray quill",
    // Complementary & Accent (CA)
    "dusty rose", "old rose", "muted pink", "mauve", "powder pink", "hawthorne rose",
    "soft lavender", "periwinkle", "steel blue", "slate blue", "storm blue",
    "dusty teal", "muted teal", "sage green", "beryl green", "forest green", "graystone",
    "cool burgundy", "muted purple", "key largo",
    // Strategic professional colors (from stylist consultation)
    "navy blue", "chocolate brown", "cherry red", "azul añil (steel indigo)",
    "violet", "lilac", "orchid purple",
    "cement green", "mint green", "pine green", "English green",
    "buttermilk (warm off-white alternative)",
    // Denim tones (always welcome in Sport style)
    "light wash denim", "medium wash denim", "dark wash denim", "indigo",
  ],

  // Colors to strictly avoid
  avoidColors: [
    "pure black", "pure white", "bright white",
    "yellow", "gold", "khaki", "mustard",
    "orange", "rust", "terracotta",
    "warm red", "tomato red",
    "hot pink", "fuchsia", "magenta",
    "electric blue", "cobalt blue", "royal blue",
    "bright green", "lime green", "military green",
    "neon of any kind",
    // From stylist consultation — these clash with olive/yellowish undertone
    "pink (in professional settings)", "mustard (never buy)",
    "orange (completely avoid — too playful)",
  ],

  // Key color rules
  colorRules: [
    "All colors must be desaturated, muted, and low-contrast — never vivid or bright",
    "Colors should lean cool (blue/gray undertones), not warm (orange/yellow undertones)",
    "Best combinations are monochromatic or neighboring hues at the same value",
    "Monochromatic looks stylize, look modern, and are elegant",
    "Avoid high-contrast color combinations — they overwhelm the natural softness",
    "Total denim (denim-on-denim) is a great Sport look",
    "Total white / off-white works for both elegant and sport occasions",
    "Dark grayish browns replace black; soft grays/sand/muted browns replace white",
    "Prints should use palette colors and have small-to-medium scale",
    "Shoes in same tone as pants elongate the leg line",
    "Navy pairs with light blue (celeste), NOT white — white creates too much contrast for olive skin",
    "Falsa cálida skin: colors must counterbalance the yellowish undertone, not amplify it",
  ],

  // Strategic color psychology (from stylist consultation)
  colorStrategy: {
    professional: [
      "Navy blue — #1 professional color: security, confidence, empathy. Invest in suit, blazer, sweater, shirt",
      "Chocolate brown — #2 professional color: versatile for talks and presentations, formal and informal",
      "Cherry red — maximum authority: use with caution, all eyes on you. Ideal for tough negotiations. Not with peers",
      "Buttermilk — warm off-white alternative when total white feels too distant/authoritarian",
    ],
    negotiation: [
      "Violet / lilac / orchid — ideal for negotiations: transmit magic and mystery, create a special halo",
      "Azul añil (steel indigo) — a steely blue that is very flattering",
    ],
    avoid: [
      "Pink — not professional, associated with childhood. Reserve for social occasions only",
      "Total white / off-white — conveys authority but creates distance. Use only when very secure in your position",
      "Orange — completely avoid, too playful, not professional",
      "Mustard — does not flatter at all, never buy",
      "Green — represents opulence/abundance. Do NOT wear to negotiate salaries or rent",
    ],
    greenNuances: [
      "Swap military green → cement green or mint green",
      "Pine green and English green are good alternatives",
    ],
    pairingRules: [
      "Navy blazer pairs best with light blue shirt (not white — too much contrast for your coloring)",
      "Cherry red must be excellent quality — cheap red looks wrong",
    ],
  },

  // Body type: Hourglass
  bodyShape: "Reloj de Arena (Hourglass)",
  bodyRules: [
    "Highlight the waist — use belts, paper-bag waist, fitted waist dresses, tucked-in tops, wrap styles",
    "Avoid extremely tight or extremely loose garments",
    "High-waist bottoms accentuate curves favorably",
    "Monochromatic outfits create a long, continuous line that flatters",
    "Strategic layering: structured jacket adds upper volume; vest balances and elongates",
    "Volume on top → balance with lighter or textured pants",
    "Volume on bottom → use same color in darker shade to minimize",
    "Vertical line techniques elongate: V-necks, long necklaces, pointed-toe shoes, monochromatic",
    "Heeled shoes create a longer line, especially with wide-leg pants",
  ],

  // Personal style archetype
  stylePersonality: {
    name: "Sport",
    essence: "Sensualidad y comodidad ante todo (sensuality and comfort first)",
    perception: "Atractiva, Juvenil, Activa (attractive, youthful, active)",
    keyElements: [
      "Comfort is the priority — never sacrifice it for fashion",
      "Sensual without being revealing — show skin strategically (V-necks, off-shoulder, cutouts)",
      "Mix casual and elevated — blazer + jeans, leather jacket + sneakers",
      "Leather and suede are signature Sport fabrics",
      "Animal print in palette tones (muted, cool — not black/white/orange)",
      "Denim is a core fabric — jeans, denim jackets, denim shirts",
      "Sneakers are fully endorsed for casual Sport looks",
      "Graphic tees under blazers work for breaking rules with strategy",
      "Vest + jeans or vest + wide pants is a signature combination",
      "Sweaters should feel like a second skin — V-neck, fitted, soft knits",
    ],
  },

  // Silhouettes and cuts that work well
  goodSilhouettes: {
    jeans: [
      "mid or high rise — never low rise",
      "straight leg (maintains proportions)",
      "slouchy (adds subtle curves)",
      "flared (straight to ankle then widens, balances shoulders/hips)",
      "bootcut (more elegant than straight, balances curves)",
      "wide leg (high-waist, with heels)",
      "3 ideal colors: blue, black/dark, white/ecru",
    ],
    pants: [
      "high-waist straight leg",
      "high-waist flared / bootcut",
      "high-waist wide leg (with heels for proportion)",
      "paper-bag waist (defines waist beautifully)",
      "slouchy mid-rise",
      "cargo in muted neutral tones",
    ],
    skirts: [
      "pencil skirt (accentuates curves)",
      "flared / A-line (balances proportions)",
      "wrap skirt (defines waist)",
      "midi length (ideal with boots)",
      "denim skirt (midi or knee-length for Sport)",
      "paper-bag waist skirt",
    ],
    dresses: [
      "wrap dress (defines waist — the #1 silhouette)",
      "shirt dress (belted at waist)",
      "fitted at waist then flowing",
      "V-neck neckline (ideal for elongating)",
      "midi length preferred",
      "jumpsuits — both casual (utility, denim) and dressy (V-neck, belted)",
    ],
    tops: [
      "V-neck (the ideal neckline — elongates and flatters)",
      "wrap top / wrap blouse",
      "fitted but not tight",
      "tucked in to show waist",
      "off-shoulder / one-shoulder (shows skin strategically)",
      "button-down shirts (tucked or half-tucked)",
      "denim shirt (Sport essential)",
      "cotton t-shirts (basic wardrobe staple — at least 2 white)",
      "cashmere V-neck sweater (second skin feel)",
      "cardigan (V-neck, cropped or fitted)",
    ],
    outerwear: [
      "fitted blazer with princess seams (adds structure)",
      "belted blazer (defines waist)",
      "cropped jacket (works with high-waist bottoms)",
      "leather biker jacket (Sport signature piece)",
      "denim jacket (Sport essential)",
      "belted short trench (modern and flattering)",
      "trench coat (year-round staple)",
      "long cardigan",
      "vest / waistcoat (key layering piece — creates vertical line)",
      "sport waterproof jacket (practical layer)",
    ],
  },

  avoidSilhouettes: [
    "low-rise pants (cuts at worst point, widens hips)",
    "excessively tight clothes (over-emphasizes curves unfavorably)",
    "shapeless/boxy clothes (hides hourglass figure)",
    "pants with large hip pockets or embellishments (adds unwanted hip volume)",
    "very short skirts",
    "too-loose shapeless blazers or jackets",
    "exaggerated shoulder pads",
    "voluminous details at hips or chest",
    "high closed necklines (crew neck, turtleneck less ideal than V-neck)",
    "horizontal cuts at hip line",
    "large prints on the body",
  ],

  // Necklines
  necklines: {
    ideal: ["V-neck", "wrap", "scoop", "off-shoulder", "open collar"],
    avoid: ["high crew neck", "closed turtleneck", "high mandarin collar"],
  },

  // Fabrics
  goodFabrics: [
    "cashmere", "cotton", "silk", "velvet", "suede", "leather",
    "denim", "soft knit", "fluid fabrics", "jersey",
  ],
  avoidFabrics: [
    "stiff synthetic fabrics", "polyester that looks shiny/cheap",
    "very thick or bulky knits", "crochet",
  ],

  // Prints
  goodPrints: [
    "small-to-medium florals in palette colors",
    "delicate watercolor prints",
    "soft botanical / botanical illustrations",
    "feathers, birds, leaf motifs (small scale)",
    "animal print in palette tones (muted, cool — not black/white/orange)",
    "tonal/tone-on-tone texture",
    "subtle stripes in low contrast",
  ],
  avoidPrints: [
    "large bold geometric patterns",
    "rigid stripes with high contrast",
    "animal print in warm/bright colors (orange leopard, etc.)",
    "heavy graphic prints",
    "very large-scale prints",
    "horizontal stripes at hip level",
  ],

  // Shoes
  shoes: {
    ideal: [
      "pointed-toe stilettos (creates long leg line)",
      "kitten heels (comfortable heel option)",
      "pointed-toe pumps (nude or palette colors)",
      "slingback heels",
      "pointed-toe mules",
      "suede ankle boots (medium heel)",
      "ankle boots with heel",
      "white urban sneakers (Sport essential)",
      "designer/fashion sneakers in palette tones",
      "loafers",
      "ballet flats (pointed toe preferred)",
      "nude/skin-tone shoes (elongate legs by not breaking the line)",
    ],
    avoid: [
      "square-toe shoes",
      "platform shoes",
      "ankle-strap shoes (visually cut the leg, make legs look shorter)",
      "round-toe flats (don't give shape to legs)",
      "very bulky/chunky shoes with excessive volume",
      "thick block heels (can make legs look shorter)",
    ],
    rules: [
      "Medium heel height is ideal",
      "Same-tone shoe and pants elongate the silhouette",
      "Nude/skin-tone shoes create the illusion of longer legs",
      "Pointed toes create a long line to the ankle",
    ],
  },

  // Capsule wardrobe basics (from Lista de Básicos)
  capsuleWardrobe: {
    tops: [
      "1 white cotton button-down shirt",
      "1 white silk shirt",
      "5 cotton t-shirts (at least 2 white)",
      "1 evening camisole",
      "1 denim shirt",
      "1 cashmere sweater in palette color (V-neck)",
      "1 dark sweater",
    ],
    bottoms: [
      "1 casual neutral-color pants",
      "1 elegant dark pants",
      "3 jeans in right cuts: blue, dark/black, white",
      "1 dark knee-length skirt",
    ],
    dresses: [
      "1 little black dress (LBD)",
      "1 day dress in palette colors and flattering cut",
      "1 original party dress",
    ],
    outerwear: [
      "1 dark blazer",
      "1 lighter/summer blazer",
      "1 warm coat",
      "1 sport waterproof jacket",
      "1 leather jacket",
      "1 denim jacket",
      "1 mid-season tailored suit",
    ],
    shoes: [
      "2 pairs stilettos: nude + dark",
      "1 pair white urban sneakers",
      "1 pair flat shoes (loafers or ballet flats)",
    ],
    accessories: [
      "1 good leather belt",
      "1 silk scarf in palette colors",
      "1 cashmere or alpaca pashmina in palette",
      "1 leather day bag",
      "1 small dark evening bag",
      "1 evening clutch (can be colored)",
    ],
  },

  // Outfit formulas (reference looks from the PDF)
  outfitFormulas: [
    "Blazer + striped tee + dark flared jeans + pointed flats (Sport casual)",
    "Leather jacket + V-neck sweater + straight jeans + sneakers (Sport everyday)",
    "Vest + button-down shirt + jeans + heeled boots (Sport elevated)",
    "Denim jacket + striped tee + wide dark pants + white sneakers (Sport relaxed)",
    "Gray cardigan + wide-leg light jeans + pointed shoes (Sport effortless)",
    "Cashmere V-neck + cream wide pants + loafers (Monochromatic comfort)",
    "Light blue shirt + white wide-leg pants + nude heels (Sport elegant)",
    "Belted short trench + white pants + heels (Polished Sport)",
    "Denim shirt + dark jeans + ankle boots (Total denim)",
    "Cream blazer + flared jeans + pointed mules (Elevated jeans)",
    "Burgundy leather shirt + flared jeans + animal print bag (Sport bold)",
    "Tweed jacket + light straight jeans + ballet flats (Sport chic)",
    "Monochromatic suit (blazer + matching pants) in palette color (Power Sport)",
  ],

  // Sizes (US sizing)
  sizes: {
    tops: ["S", "M"],
    jeans: ["26", "28"],
    pants: ["6", "8"],
    dresses: ["S", "M"],
    shoes: ["7.5"],
    outerwear: ["S", "M"],
    skirts: ["S", "M"],
  },

  // Location & climate
  location: "San Francisco, CA",
  climate: "Year-round mild & chilly (50-65°F / 10-18°C), layers are essential",
  seasonalNotes: [
    "Always include a light layer option — SF is never truly warm",
    "Favor breathable fabrics that layer well (cotton, silk, light knits, denim)",
    "Trench coats, cardigans, blazers, and leather jackets are year-round staples",
    "Denim jackets are perfect for SF's casual layering needs",
    "Avoid heavy winter-only pieces (puffer coats, thick wool)",
    "Avoid pure summer pieces (strapless, very sheer, ultra-lightweight, crochet)",
    "Cashmere sweaters and cardigans are ideal for SF's cool evenings",
  ],

  // How the style engine should score
  scoringGuidance: `
    Score each product 0-100 based on this profile.

    START at 50. Then:

    COLOR (+/- up to 30 points):
    +20-30 if color is clearly in the good palette (muted, cool, soft) or denim
    +10-15 if color is neutral-ish but not ideal
    -20-30 if color is in the avoid list (bright, warm, neon)
    -10 if color is pure white or pure black (acceptable in small doses / basics)

    SILHOUETTE & FIT (+/- up to 25 points):
    +20-25 if it matches recommended cuts AND defines/highlights the waist
    +15-20 if it matches recommended cuts (high-waist, V-neck, wrap, fitted waist)
    +10 if it's a versatile piece that works with the profile
    +5 bonus for jeans in the right cut (straight, flared, bootcut, high-rise)
    +5 bonus for vest, leather jacket, or denim jacket
    -15-25 if it's in the avoid silhouettes (low-rise, boxy, very tight, high neckline)

    FABRIC/STYLE (+/- up to 15 points):
    +10-15 if fabric is in the good list (leather, suede, cashmere, silk, denim, cotton)
    +5-10 if it has a soft, fluid appearance from the image
    +5 bonus for Sport-personality pieces (leather, suede, denim, comfortable knits)
    -10-15 if it appears stiff, synthetic, bulky, or cheap

    WEATHER & LAYERABILITY (+/- up to 20 points):
    San Francisco is 50-65°F (10-18°C) year-round with wind, fog, and microclimates.
    +15-20 if inherently layerable (blazers, cardigans, leather jackets, denim jackets, trench coats)
    +10-15 if it has long sleeves or medium weight — works standalone in SF
    +5 if it can be easily layered under a jacket (fitted tops, thin knits, t-shirts)
    -5 if it's lightweight but still wearable with a layer (linen pants, midi skirts)
    -10-15 if it's clearly warm-weather only (sleeveless, strapless, sheer, crochet)
    -20 if it's a pure summer piece with no layering potential (crop tops, short sundresses)

    PRINT (+/- 10 points):
    +10 if print matches profile (small floral, watercolor, tonal, muted animal print)
    -10 if print clashes (bold geometric, high contrast, large scale)

    SPORT PERSONALITY BONUS (+5):
    +5 if the piece embodies Sport style (comfort + sensuality): jeans, leather pieces,
    denim jackets, V-neck sweaters, casual blazers, sneakers, wrap tops

    Only recommend products scoring 60+. Flag as "great match" if 80+.

    SIZE FILTERING (mandatory — do NOT skip):
    Before scoring, check if the product is available in the user's size.
    Use the user's sizes from the profile (tops S/M, jeans 26/28, pants 6/8, dresses S/M, shoes 7.5, outerwear S/M).
    Map the product category to the right size type:
    - blouses/tops/sweaters → tops sizes (S, M)
    - jeans → jeans sizes (26, 28)
    - pants → pants sizes (6, 8)
    - dresses → dresses sizes (S, M)
    - shoes → shoes sizes (7.5)
    - outerwear/blazers → outerwear sizes (S, M)
    - skirts → skirts sizes (S, M)
    If NONE of the user's sizes are in stock, SKIP the product entirely (score = 0).
    Store the user's matching size in the "selectedSize" field.
    Use get_product_sizes(product_id) to check size availability per color variant.
    Match sizes flexibly: "26 (US 2)" matches user size "26", "S" matches "S", etc.
  `,
};

const STORAGE_KEY = "styleProfile";

// --- Local cache (localStorage) for fast reads ---

export function getStyleProfile(): StyleProfile {
  if (typeof window === "undefined") return DEFAULT_STYLE_PROFILE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as StyleProfile;
  } catch {}
  return DEFAULT_STYLE_PROFILE;
}

export function saveStyleProfileLocal(profile: StyleProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function hasStyleProfile(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// --- Supabase persistence ---

import { createClient } from "./supabase/client";

export async function saveStyleProfile(profile: StyleProfile): Promise<void> {
  // Always save locally for fast reads
  saveStyleProfileLocal(profile);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("style_profiles")
    .upsert({
      user_id: user.id,
      profile: profile,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
}

export async function loadStyleProfileFromSupabase(): Promise<StyleProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("style_profiles")
    .select("profile")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  // Cache locally
  const profile = data.profile as StyleProfile;
  saveStyleProfileLocal(profile);
  return profile;
}
