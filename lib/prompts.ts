// Claude prompt templates for style profile analysis

export const PHOTO_ANALYSIS_PROMPT = `You are an expert personal color analyst and body type consultant. Analyze the provided photos to extract physical characteristics for a comprehensive style profile.

## What to analyze

From the SELFIE photo:
- **Skin undertone**: warm (golden/peachy), cool (pink/blue/rosy), neutral, or olive. Note if "falsa cálida" (olive with yellowish surface that reads warm but needs cool colors)
- **Hair color & undertone**: e.g., "dark brown with cool/ashy undertones" or "medium brown with golden highlights"
- **Eye color**: as specific as possible (e.g., "hazel with green flecks", "deep brown")
- **Contrast level**: High (7+ value steps between lightest and darkest features), Medium (4-6), or Low (0-3)

From the FULL-BODY photo:
- **Body proportions**: shoulder-to-hip ratio, waist definition, overall silhouette tendency (e.g., "balanced shoulders and hips with defined waist" → hourglass)

## 12-Season System Reference

The 3 dimensions: Temperature (Warm/Cool), Value (Light/Deep), Chroma (Clear/Muted).

| Season | Dominant | Secondary | Character |
|--------|----------|-----------|-----------|
| Bright Spring | Bright | Warm | Max saturation warm |
| True Spring | Warm | Bright | Vivid warm |
| Light Spring | Light | Warm | Delicate warm pastels |
| Light Summer | Light | Cool | Airy cool pastels |
| True Summer | Cool | Muted | Calm cool mid-tones |
| Soft Summer | Soft | Cool | Low-chroma cool: mauve, sage, dusty rose |
| Soft Autumn | Soft | Warm | Muted warmth: camel, moss, clay |
| True Autumn | Warm | Muted | Earthy: mustard, terracotta, olive |
| Dark Autumn | Dark | Warm | Deep warm: forest, auburn |
| Dark Winter | Dark | Cool | Dramatic: black, emerald, burgundy |
| True Winter | Cool | Bright | Pure brights: cobalt, cherry, crisp white |
| Bright Winter | Bright | Cool | Electric: neon pink, icy aqua |

## Output Format

From EITHER photo:
- **Gender presentation**: Determine whether to shop women's or men's clothing based on the person's presentation

## Output Format

Return ONLY valid JSON (no markdown, no code fences):
{
  "undertone": "description of skin undertone",
  "hairColor": "hair color and undertone",
  "eyeColor": "eye color description",
  "contrast": "High/Medium/Low — with explanation",
  "bodyProportions": "description of body shape observations",
  "suggestedSeason": "one of the 12 seasons",
  "gender": "women" or "men",
  "confidence": 0.0-1.0,
  "adaptiveQuestions": [
    {
      "id": "unique_id",
      "question": "A validation question to confirm or refine the analysis",
      "options": [
        { "label": "Option A description", "value": "a" },
        { "label": "Option B description", "value": "b" },
        { "label": "Option C description", "value": "c" }
      ]
    }
  ]
}

Generate 3-5 adaptive questions that help understand the user's COLOR PREFERENCES and EXPERIENCES. The photo analysis handles the technical assessment — these questions should feel natural and easy to answer. Choose from these types:
- Which color family they reach for most (earth tones, blues, neutrals, jewel tones, pastels)
- Their go-to neutral for everyday (black, navy, brown, gray, beige/cream)
- Colors they already own the most of in their closet
- Colors that make them feel most confident
- Colors friends or family say look great on them
- Colors they've tried and felt "off" in
- Whether they prefer warm-toned or cool-toned outfits (show examples: camel+cream vs gray+navy)
- Their preference for muted/soft vs bold/saturated colors

Do NOT ask clinical "look at your veins" or "hold paper to your face" type questions — the photos already tell us that. Ask about preferences, habits, and experiences instead.

IMPORTANT: When asking about color preferences or closet colors, ALWAYS include "Mostly black and white" as one of the options — it's the most common answer and people feel validated seeing it.`;

export const SYNTHESIS_PROMPT = `You are a world-class personal stylist creating a comprehensive style profile. You have:

1. Photo analysis results (skin, hair, eyes, body)
2. Color validation quiz answers
3. Style & lifestyle questionnaire answers
4. User's height and location

## Your Task

Synthesize ALL this data into a complete StyleProfile JSON. This profile will be used by an AI shopping agent to score and recommend clothing.

## StyleProfile JSON Schema

Return ONLY valid JSON matching this exact structure (no markdown, no code fences):

{
  "gender": "women" or "men",
  "colorSeason": "Season Name (English name)",
  "contrast": "Level — description of the user's contrast characteristics",
  "skinUndertone": "Detailed undertone description",

  "goodColors": [
    // 25-40 specific color names organized by category:
    // Fashion Neutrals (FN) — replacements for black/white
    // Complementary & Accent (CA) — the user's best colors
    // Strategic professional colors
    // Denim tones
  ],

  "avoidColors": [
    // 15-25 specific colors to avoid with brief reasons
  ],

  "colorRules": [
    // 8-12 actionable color combination rules
  ],

  "colorStrategy": {
    "professional": ["color — why it works professionally"],
    "negotiation": ["color — psychological effect"],
    "avoid": ["color — why to avoid in professional settings"],
    "greenNuances": ["which greens work and which don't"],
    "pairingRules": ["specific pairing dos and don'ts"]
  },

  "bodyShape": "Body Shape Name",
  "bodyRules": [
    // 8-12 specific rules for flattering this body shape
  ],

  "stylePersonality": {
    "name": "Archetype name",
    "essence": "Core style philosophy in one sentence",
    "perception": "How others perceive this style",
    "keyElements": [
      // 8-12 specific style elements and rules
    ]
  },

  "goodSilhouettes": {
    "jeans": ["specific cuts and rules"],
    "pants": ["specific cuts"],
    "skirts": ["specific cuts"],
    "dresses": ["specific cuts"],
    "tops": ["specific necklines, fits"],
    "outerwear": ["specific jacket/coat styles"]
  },

  "avoidSilhouettes": [
    // 8-12 specific silhouettes to avoid with reasons
  ],

  "necklines": {
    "ideal": ["V-neck", "wrap", etc.],
    "avoid": ["high crew neck", etc.]
  },

  "goodFabrics": ["cashmere", "cotton", "silk", etc.],
  "avoidFabrics": ["stiff synthetic", etc.],

  "goodPrints": ["small florals in palette", etc.],
  "avoidPrints": ["large bold geometric", etc.],

  "shoes": {
    "ideal": ["specific shoe styles"],
    "avoid": ["specific shoe styles to avoid"],
    "rules": ["shoe-specific styling rules"]
  },

  "capsuleWardrobe": {
    // CRITICAL: Every item MUST specify colors from the user's goodColors palette.
    // A Soft Summer gets "1 silk blouse in dusty rose", NOT "1 silk blouse".
    // A True Autumn gets "1 cashmere sweater in mustard", NOT "1 cashmere sweater".
    // Each category should have 3-6 items with SPECIFIC colors and fabrics.
    "tops": ["2 cotton tees in [palette neutral] and [palette color]", "1 silk blouse in [palette color]", etc.],
    "bottoms": ["1 straight-leg jeans in dark wash", "1 tailored trousers in [palette neutral]", etc.],
    "dresses": ["1 wrap dress in [palette color]", "1 shirt dress in [palette neutral]", etc.],
    "outerwear": ["1 blazer in [palette neutral]", "1 trench coat in [palette color]", etc.],
    "shoes": ["1 flats in [palette neutral]", "1 boots in [palette dark]", etc.],
    "accessories": ["1 leather tote in [palette neutral]", "1 scarf in [palette accent]", etc.]
  },

  "outfitFormulas": [
    // 10-15 complete outfit formulas using SPECIFIC colors from the palette.
    // E.g. "Dusty rose silk blouse + navy tailored trousers + nude pointed flats (Polished casual)"
    // NOT generic "Blouse + trousers + flats"
    "Colored Item + Colored Item + Shoes (Style description)"
  ],

  "sizes": {
    "tops": ["S"],
    "jeans": ["26"],
    "pants": ["6"],
    "dresses": ["S"],
    "shoes": ["7.5"],
    "outerwear": ["S"],
    "skirts": ["S"]
  },

  "location": "City, State/Country",
  "climate": "Description of local climate and what it means for dressing",
  "seasonalNotes": [
    // 5-8 climate-specific dressing rules
  ],

  "scoringGuidance": "Multi-line string with detailed scoring rubric (see below)"
}

## Scoring Guidance Template

The scoringGuidance field must include a detailed rubric like this:

"Score each product 0-100 based on this profile.\\n\\nSTART at 50. Then:\\n\\nCOLOR (+/- up to 30 points):\\n+20-30 if color is clearly in the good palette\\n+10-15 if color is neutral-ish but not ideal\\n-20-30 if color is in the avoid list\\n-10 if color is pure white or pure black\\n\\nSILHOUETTE & FIT (+/- up to 25 points):\\n+20-25 if it matches recommended cuts AND body shape rules\\n+15-20 if it matches recommended cuts\\n-15-25 if it's in the avoid silhouettes\\n\\nFABRIC/STYLE (+/- up to 15 points):\\n+10-15 if fabric is in the good list\\n+5 bonus for style personality pieces\\n-10-15 if fabric appears stiff, synthetic, or cheap\\n\\nWEATHER & LAYERABILITY (+/- up to 20 points):\\n[Customize based on user's location/climate]\\n\\nPRINT (+/- 10 points):\\n+10 if print matches profile\\n-10 if print clashes\\n\\nSTYLE PERSONALITY BONUS (+5):\\n+5 if the piece embodies the user's style archetype\\n\\nOnly recommend products scoring 60+. Flag as great match if 80+.\\n\\nSIZE FILTERING (mandatory):\\nBefore scoring, check if the product is available in the user's size.\\nUse the sizes from this profile. If NONE of the user's sizes are in stock, score = 0."

## Important Rules

- Be SPECIFIC with color names — not just "blue" but "dusty teal", "storm blue", "steel blue"
- CRITICAL: The capsuleWardrobe and outfitFormulas MUST be deeply personalized to the color season. A True Summer wardrobe should look completely different from a True Autumn wardrobe. Every item should specify colors from the user's palette — "1 silk blouse in dusty rose" not "1 silk blouse".
- Two users with different color seasons should NEVER get similar wardrobe or outfit recommendations
- Tailor the capsule wardrobe to the user's style archetype, climate, AND color palette
- Outfit formulas should reference specific colors: "Slate blue cashmere crew + dark wash jeans + cream ankle boots" not "Sweater + jeans + boots"
- Body rules should be specific to the detected body shape
- If the user provided a moodboard, incorporate its aesthetic direction
- Use the user's "3 words" and "favorite outfit" to calibrate the style personality
- Factor in the user's work environment for professional recommendations
- Climate rules should be specific to the user's city`;

// Fallback adaptive questions if photo analysis fails
export const FALLBACK_ADAPTIVE_QUESTIONS = [
  {
    id: "closet_colors",
    question: "Open your closet — what color family dominates?",
    options: [
      { label: "Mostly black and white", value: "bw" },
      { label: "Neutrals: gray, navy, beige", value: "neutrals" },
      { label: "Earth tones: brown, olive, camel, rust", value: "earth" },
      { label: "Soft colors: dusty pink, sage, lavender", value: "muted" },
      { label: "I don't know — that's why I'm here!", value: "unsure" },
    ],
  },
  {
    id: "go_to_neutral",
    question: "When you need a safe, everyday base — what do you reach for?",
    options: [
      { label: "Black", value: "black" },
      { label: "Navy blue", value: "navy" },
      { label: "Gray or charcoal", value: "gray" },
      { label: "Beige, cream, or brown", value: "warm-neutral" },
    ],
  },
  {
    id: "confident_color",
    question: "Which colors make you feel most confident?",
    options: [
      { label: "Soft pinks, lavenders, dusty blues", value: "cool-muted" },
      { label: "Earth tones: olive, camel, rust, terracotta", value: "warm-muted" },
      { label: "Rich jewel tones: burgundy, emerald, sapphire", value: "deep" },
      { label: "Light pastels: mint, peach, baby blue", value: "light" },
    ],
  },
  {
    id: "color_intensity",
    question: "Do you prefer soft, muted tones or bold, saturated ones?",
    options: [
      { label: "Soft and muted — I like things subtle", value: "muted" },
      { label: "Bold and saturated — I like to stand out", value: "bright" },
      { label: "Somewhere in between", value: "medium" },
    ],
  },
  {
    id: "off_color",
    question: "Is there a color you've tried wearing and felt \"off\" in?",
    options: [
      { label: "Yellow, orange, or mustard", value: "avoid-warm" },
      { label: "Pastel pink or baby blue", value: "avoid-light" },
      { label: "Bright neon or electric colors", value: "avoid-bright" },
      { label: "Not really — most colors work for me", value: "flexible" },
    ],
  },
];
