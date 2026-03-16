// Josefina's style profile — extracted from Manual de Estilo by Nova Presencia (Danisa Bevcic)

export const styleProfile = {
  colorSeason: "Verano Suave (Soft Summer)",

  // Colors that flatter — muted, cool, desaturated
  goodColors: [
    // Neutrals (not black, not pure white)
    "light gray", "pearl gray", "warm beige", "sand", "taupe",
    "dark charcoal brown", "dark gray-brown", "muted dark brown",
    // Accent colors
    "dusty rose", "old rose", "muted pink", "mauve",
    "soft lavender", "periwinkle", "steel blue", "slate blue",
    "dusty teal", "muted teal", "sage green", "forest green",
    "cool burgundy", "muted purple",
  ],

  // Colors to strictly avoid
  avoidColors: [
    "black", "pure white", "bright white",
    "yellow", "gold", "khaki", "mustard",
    "orange", "rust", "terracotta",
    "warm red", "tomato red",
    "hot pink", "fuchsia", "magenta",
    "electric blue", "cobalt blue", "royal blue",
    "bright green", "lime green",
    "neon of any kind",
  ],

  // Key color rules
  colorRules: [
    "All colors must be desaturated, muted, and low-contrast — never vivid or bright",
    "Colors should lean cool (blue/gray undertones), not warm (orange/yellow undertones)",
    "Best combinations are monochromatic or neighboring hues at the same value",
    "Avoid high-contrast color combinations — they overwhelm the natural softness",
    "Prints should use palette colors and have small-to-medium scale",
  ],

  // Body type: Hourglass
  bodyShape: "Reloj de Arena (Hourglass)",
  bodyRules: [
    "Highlight the waist — use thin belts, fitted waist dresses, tucked-in tops",
    "Avoid extremely tight or extremely loose garments",
    "High-waist bottoms accentuate curves favorably",
    "Monochromatic outfits create a long, continuous line that flatters",
    "Strategic layering: structured jacket adds upper volume; long vest balances hips",
    "Volume on top → balance with lighter or textured pants",
    "Volume on bottom → use same color in darker shade to minimize",
  ],

  // Silhouettes and cuts that work well
  goodSilhouettes: {
    pants: [
      "high-waist straight leg",
      "high-waist flared / bootcut",
      "high-waist wide leg (not too baggy)",
      "slouchy mid-rise",
    ],
    skirts: [
      "pencil skirt (accentuates curves)",
      "flared / A-line (adds volume to lower body for balance)",
      "midi length",
    ],
    dresses: [
      "wrap dress (defines waist)",
      "fitted at waist then flowing",
      "midi length",
    ],
    tops: [
      "fitted but not tight",
      "tucked in to show waist",
      "V-neck or soft necklines",
    ],
    outerwear: [
      "structured blazer (adds shoulder width)",
      "long cardigan",
      "trench coat",
    ],
  },

  avoidSilhouettes: [
    "low-rise pants (cuts at bad point, widens hips visually)",
    "excessively tight clothes (over-emphasizes curves)",
    "shapeless/boxy clothes (hides hourglass figure)",
    "pants with large hip pockets or embellishments (adds unwanted volume to hips)",
    "very short skirts",
  ],

  // Fabrics
  goodFabrics: [
    "cashmere", "cotton", "silk", "velvet", "suede", "leather",
    "soft knit", "fluid fabrics",
  ],
  avoidFabrics: [
    "stiff synthetic fabrics", "polyester that looks shiny/cheap",
    "very thick or bulky knits",
  ],

  // Prints
  goodPrints: [
    "small-to-medium florals in palette colors",
    "delicate watercolor prints",
    "soft botanical / botanical illustrations",
    "feathers, birds, leaf motifs (small scale)",
    "animal print in your color tones (muted, not black/white/orange)",
    "tonal/tone-on-tone texture",
  ],
  avoidPrints: [
    "large bold geometric patterns",
    "rigid stripes with high contrast",
    "animal print in warm/bright colors",
    "heavy graphic prints",
    "very large-scale prints",
  ],

  // Location & climate
  location: "San Francisco, CA",
  climate: "Year-round mild & chilly (50-65°F / 10-18°C), layers are essential",
  seasonalNotes: [
    "Always include a light layer option — SF is never truly warm",
    "Favor breathable fabrics that layer well (cotton, silk, light knits)",
    "Trench coats, cardigans, and blazers are year-round staples",
    "Avoid heavy winter-only pieces (puffer coats, thick wool)",
    "Avoid pure summer pieces (strapless, very sheer, ultra-lightweight)",
  ],

  // Personal style archetype
  stylePersonality: "Sport — sensual, comfort-first, youthful, active, attractive",

  // Shoes
  shoes: ["stilettos", "heeled sandals", "ankle boots with heel"],

  // How the style engine should score
  scoringGuidance: `
    Score each product 0-100 based on this profile.

    START at 50. Then:

    COLOR (+/- up to 40 points):
    +30-40 if color is clearly in the good palette (muted, cool, soft)
    +10-20 if color is neutral-ish but not ideal
    -30-40 if color is in the avoid list (black, bright, warm, neon)
    -20 if color is pure white or pure black

    SILHOUETTE (+/- up to 30 points):
    +20-30 if it matches recommended cuts (high-waist, straight, flared, fitted waist)
    +10 if it's a versatile piece that works with the profile
    -20-30 if it's in the avoid silhouettes (low-rise, boxy, very tight)

    FABRIC/STYLE (+/- up to 20 points):
    +10-20 if fabric is in the good list
    +5-10 if it has a soft, fluid appearance from the image
    -10-20 if it appears stiff, synthetic, or bulky

    PRINT (+/- 10 points):
    +10 if print matches profile (small floral, watercolor, tonal)
    -10 if print clashes (bold geometric, high contrast, large scale)

    Only recommend products scoring 60+. Flag as "great match" if 80+.
  `,
};

export type StyleProfile = typeof styleProfile;
