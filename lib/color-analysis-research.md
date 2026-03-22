# Personal Color Analysis Research

## The Core Framework: 12-Season System

Built on 3 dimensions, each with 2 poles:

| Dimension | Poles | What It Measures |
|-----------|-------|-----------------|
| **Hue/Temperature** | Warm vs. Cool | Yellow-based vs. blue-based undertone |
| **Value/Depth** | Light vs. Deep | Overall lightness or darkness |
| **Chroma/Saturation** | Bright/Clear vs. Muted/Soft | Clarity and intensity |

Every person has a **dominant** dimension and a **secondary** one. The combo = their season.

### The 12 Seasons

| Season | Dominant | Secondary | Color Character |
|--------|----------|-----------|-----------------|
| **Bright Spring** | Bright | Warm | Maximum saturation warm: lime, hot coral, cyan |
| **True Spring** | Warm | Bright | Vivid warm: apricot, grass green, tomato red |
| **Light Spring** | Light | Warm | Delicate warm: peach, mint, coral, melon |
| **Light Summer** | Light | Cool | Airy pastels: powder blue, shell pink, lilac |
| **True Summer** | Cool | Muted | Calm mid-tones: lavender, denim, dove gray |
| **Soft Summer** | Soft | Cool | Low-chroma: mauve, sage, dusty rose |
| **Soft Autumn** | Soft | Warm | Muted warmth: camel, moss, clay |
| **True Autumn** | Warm | Muted | Earthy: mustard, terracotta, olive |
| **Dark Autumn** | Dark | Warm | Deep warm: forest, auburn, ink brown, deep teal |
| **Dark Winter** | Dark | Cool | Dramatic: black, emerald, burgundy |
| **True Winter** | Cool | Bright | Pure brights: cobalt, cherry, crisp white |
| **Bright Winter** | Bright | Cool | Electric: neon pink, icy aqua, jet black |

---

## Key Physical Characteristics to Assess

### 1. Skin Undertone
- **Warm**: yellow/golden/peachy
- **Cool**: pink/blue/rosy
- **Neutral**: balanced
- **Olive**: greenish cast (often mistyped)

### 2. Hair Color & Undertone
- **Warm hair**: golden, honey, auburn, copper, strawberry
- **Cool hair**: ashy, blue-black, cool brown, platinum

### 3. Eye Color & Pattern
- **Warm eyes**: turquoise blues, mossy/olive greens, amber/ochre browns
- **Cool eyes**: icy blue, grey-blue, cool green, deep brown with no gold

### 4. Contrast Level
- **High (7+ value steps)**: Light skin + dark hair, or deep skin + bright eyes
- **Medium (4-6)**: Balanced transitions
- **Low (0-3)**: Features blend, similar lightness

---

## Common Mistyping Issues

1. **Soft Summer vs. Soft Autumn** - Most common. Both share "soft/muted" dominant quality. Silver/gold test differentiates.
2. **Olive skin** - Traditional systems fail. Can be warm-olive or cool-olive.
3. **Surface color vs. undertone** - Yellow skin surface ≠ warm undertone (common in Asian skin). Pink/rosacea ≠ cool.
4. **Ethnic mistyping** - 4-season system was designed for Caucasian women. Donna Fujii created 25-palette Lumina System.
5. **Hair dye / makeup / lighting** all affect results.

---

## Questionnaire-Based Assessment (No Photo Needed)

### Core Questions
1. **Eye Color** - dark brown/black, light brown/hazel, blue, green/blue-green, gray
2. **Hair Color** - natural color + undertone (golden vs ashy)
3. **Skin Tone** - fair/medium/deep + undertone
4. **Vein Test** - wrist veins: blue/purple = cool, green = warm, mixed = neutral
5. **White Test** - pure white flattering = likely cool; washes out = likely warm
6. **Jewelry Test** - gold vs silver
7. **Sun Reaction** - burns easily vs tans

### Decision Tree
```
Warm undertone?
  ├── Light features? → Light Spring
  ├── Bright/clear? → Bright Spring
  ├── Muted? → Soft Autumn or True Autumn
  ├── Dark features? → Dark Autumn
  └── Medium? → True Spring

Cool undertone?
  ├── Light features? → Light Summer
  ├── Bright/clear? → Bright Winter
  ├── Muted? → Soft Summer or True Summer
  ├── Dark features? → Dark Winter
  └── Medium? → True Winter or True Summer
```

---

## Digital Analysis Accuracy (State of the Art)

| Feature | Accuracy |
|---------|----------|
| Skin tone classification | ~80% |
| Hair color detection | 20-90% (dark ~90%, light ~20-50%) |
| Eye/iris color | 70-100% |
| Undertone (warm/cool) | 70-80% |
| **4-season classification** | **70-83%** (ResNet-18 + focal loss) |
| **12-season classification** | **30-60%** (still challenging) |

---

## Open Source Building Blocks

### Complete Pipelines
- **Deep Seasonal Color Analysis System** - github.com/mrcmich/deep-seasonal-color-analysis-system (U-Net + OpenCLIP)
- **Colorinsight** - github.com/PSY222/Colorinsight (FaRL + ResNet, ~60% on 4 seasons)
- **Rizz-Up** - github.com/jackplus-xyz/rizz-up (Claude AI + DeepFace, 12 seasons, Svelte)

### Datasets
- **Deep Armocromia** - github.com/lorenzo-stacchio/Deep-Armocromia (~5,000 faces, 12 seasons, ECCV 2024)

### Face Analysis
- **DeepFace** - github.com/serengil/deepface (22k+ stars, age/gender/race/emotion)
- **face-api.js** - github.com/justadudewhohacks/face-api.js (browser + Node.js)
- **InsightFace** - github.com/deepinsight/insightface (28k+ stars, 2D/3D)

### Face Parsing (Skin Segmentation)
- **face-parsing.PyTorch** - github.com/zllrunning/face-parsing.PyTorch (BiSeNet, 2.5k stars)

### Skin Tone
- **SkinToneClassifier** - github.com/ChenglongMa/SkinToneClassifier (183 stars, pip installable)

### Hair Color
- **pytorch-hair-segmentation** - github.com/YBIGTA/pytorch-hair-segmentation
- **Hair-Colour-Detection-with-Deep-Learning** - github.com/asimadnan/Hair-Colour-Detection-with-Deep-Learning

### Eye Color
- **Eye-Color-Detection** - github.com/ghimiredhikura/Eye-Color-Detection (MTCNN + HSV)

### Color Science
- **Colour Science for Python** - github.com/colour-science/colour (2.5k stars, LAB/Munsell/everything)

---

## Complementary Style Systems

### Kibbe Body Types (13 types)
Yang (angular) ↔ Yin (soft) spectrum across 5 families:
Dramatic, Natural, Classic, Gamine, Romantic (each with sub-types)

**Key rule**: Color first, then lines. Color season palette takes priority, Kibbe determines silhouettes.

### Contrast Level → Pattern/Style Recommendations
- **Low contrast** → fine prints, tonal layers, matte textures
- **Medium contrast** → balanced florals, plaids, 2-3 close values
- **High contrast** → graphic stripes, bold hues, glossy textures

---

## Recommended Approach for Our App

### Hybrid: Questionnaire + Optional Photo Analysis

**Phase 1 - Questionnaire (always available, no ML needed)**
- 6-8 targeted questions covering undertone, value, chroma
- Decision tree logic maps answers to 12 seasons
- Works for all skin tones and ethnicities

**Phase 2 - Photo Enhancement (optional, improves accuracy)**
- Use face-api.js (browser-based) or DeepFace (server-side)
- Extract skin dominant color in LAB space
- Extract hair color and eye color
- Use LAB a*/b* channels for undertone (positive b* = warm, negative = cool)
- Cross-reference with questionnaire answers for higher confidence

**Phase 3 - AI Refinement**
- Use Claude to interpret combined questionnaire + extracted features
- Claude can handle edge cases (olive skin, neutral undertones, etc.)
- Provide confidence score and explain reasoning

### Output: User Profile
```json
{
  "season": "soft_summer",
  "confidence": 0.85,
  "dimensions": {
    "temperature": { "value": "cool", "strength": 0.6 },
    "value": { "value": "medium-light", "strength": 0.4 },
    "chroma": { "value": "muted", "strength": 0.9 }
  },
  "contrast_level": "low",
  "best_colors": ["#8E7F8E", "#7B9BAA", "#96A48B", ...],
  "avoid_colors": ["#FF0000", "#FFD700", "#FF4500", ...],
  "best_neutrals": ["#8E8E8E", "#6B5B73", "#7A8B7A"],
  "metals": "silver",
  "white": "soft_white",
  "black": "charcoal_or_navy"
}
```
