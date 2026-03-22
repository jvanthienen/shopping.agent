// Shared color utilities — hex mapping for style profile color names

export const COLOR_HEX_MAP: Record<string, string> = {
  "dusty rose": "#D4A0A0", "old rose": "#C08081", "muted pink": "#D4A5A5", "mauve": "#C8A2C8",
  "powder pink": "#E8C4C4", "soft lavender": "#C4B7D7", "periwinkle": "#8E82C8", "steel blue": "#6B8BA4",
  "slate blue": "#6A7B8A", "storm blue": "#5B6D7E", "dusty teal": "#6B9B9B", "sage green": "#9BAA8E",
  "forest green": "#4A6B4A", "navy blue": "#2B3A5C", "cool burgundy": "#6B3040", "muted purple": "#7B6B8A",
  "taupe": "#9B8B7A", "sand": "#D4C4A8", "warm beige": "#D4C4A8", "pearl gray": "#B8B8B8",
  "light gray": "#C8C8C8", "iron": "#5A5A5A", "dark charcoal brown": "#3A3530", "icicle": "#E8E8F0",
  "birch": "#EDE8DA", "indigo": "#3A3D6B", "cherry red": "#A52A2A", "lilac": "#C8A2C8",
  "violet": "#7B4B8A", "orchid purple": "#9A4EAE", "mint green": "#A8D8B4", "pine green": "#3A6B4A",
  "chocolate brown": "#5C3A21", "buttermilk": "#F5E6C8",
  "satellite gray": "#8A8A8A", "plaza taupe": "#8A7B6A", "dark gray-brown": "#4A4038",
  "muted dark brown": "#5A4A3A", "gray quill": "#6A6A5A", "hawthorne rose": "#C08090",
  "muted teal": "#5A8A8A", "beryl green": "#8AAA8A", "graystone": "#7A8A7A",
  "key largo": "#5A8AAA", "cement green": "#7A8A7A", "english green": "#4A6A4A",
  "dark wash denim": "#2A3A5A", "medium wash denim": "#5A6A8A", "light wash denim": "#8A9ABA",
  // Common avoid-list colors
  "pure black": "#000000", "black": "#111111",
  "pure white": "#FFFFFF", "white": "#F5F5F5",
  "neon": "#39FF14", "electric blue": "#0066FF", "hot pink": "#FF69B4",
  "lime green": "#32CD32", "orange": "#FF8C00", "golden yellow": "#FFD700",
  "rust": "#B7410E", "emerald green": "#50C878", "bright red": "#FF0000",
  "coral": "#FF7F50", "fuchsia": "#FF00FF", "turquoise": "#40E0D0",
  "mustard": "#FFDB58", "bright yellow": "#FFE800", "scarlet": "#FF2400",
  "magenta": "#FF0090", "cobalt": "#0047AB", "chartreuse": "#7FFF00",
  "amber": "#FFBF00", "crimson": "#DC143C", "teal": "#008080",
  // Common single-word colors for AI-generated quiz text
  "navy": "#2B3A5C", "charcoal": "#36454F", "gray": "#8A8A8A", "grey": "#8A8A8A",
  "brown": "#5C3A21", "beige": "#D4C4A8", "cream": "#F5E6C8", "olive": "#6B6B3A",
  "camel": "#C19A6B", "khaki": "#C3B091", "ivory": "#FFFFF0", "blush": "#DE5D83",
  "burgundy": "#6B3040", "maroon": "#800000", "plum": "#8E4585", "pink": "#E8C4C4",
  "rose": "#C08081", "berry": "#8E3A59", "raspberry": "#9B2335", "wine": "#722F37",
  "dusty pink": "#D4A0A0", "salmon": "#E88B7A", "mauve pink": "#C8829B",
  "royal blue": "#4169E1", "bright coral": "#FF7F50", "emerald": "#50C878",
  "blue": "#5B6D7E", "green": "#4A6B4A", "red": "#C0392B", "yellow": "#FFD700",
  "purple": "#7B4B8A", "peach": "#FFDAB9", "lavender": "#C4B7D7", "sage": "#9BAA8E",
};

// Curated color families for common quiz option phrases
const COLOR_FAMILIES: Record<string, string[]> = {
  "black and white": ["#111111", "#F5F5F5"],
  "neutrals": ["#8A8A8A", "#2B3A5C", "#D4C4A8"],
  "neutral": ["#8A8A8A", "#2B3A5C", "#D4C4A8"],
  "earth tones": ["#5C3A21", "#6B6B3A", "#D4C4A8", "#B7410E"],
  "earth": ["#5C3A21", "#6B6B3A", "#D4C4A8", "#B7410E"],
  "earthy": ["#5C3A21", "#6B6B3A", "#D4C4A8", "#B7410E"],
  "muted": ["#D4A0A0", "#9BAA8E", "#C4B7D7"],
  "jewel tones": ["#6B3040", "#50C878", "#0047AB"],
  "jewel": ["#6B3040", "#50C878", "#0047AB"],
  "pastels": ["#A8D8B4", "#E8C4C4", "#8A9ABA"],
  "pastel": ["#A8D8B4", "#E8C4C4", "#8A9ABA"],
  "warm tones": ["#B7410E", "#FF8C00", "#FFD700", "#D4C4A8"],
  "warm": ["#B7410E", "#FF8C00", "#FFD700"],
  "cool tones": ["#0047AB", "#008080", "#5B6D7E"],
  "cool": ["#0047AB", "#008080", "#5B6D7E"],
  "neon": ["#39FF14", "#FF00FF", "#00FFFF", "#FF6600"],
  "bright": ["#FF0000", "#0066FF", "#FFE800", "#FF00FF"],
  "bold": ["#FF0000", "#0047AB", "#DC143C"],
  "monochrome": ["#111111", "#8A8A8A", "#F5F5F5"],
  "soft": ["#E8C4C4", "#C4B7D7", "#A8D8B4"],
  "deep": ["#2B3A5C", "#5C3A21", "#6B3040"],
  "rich": ["#6B3040", "#0047AB", "#5C3A21"],
};

/**
 * Extract representative hex colors from option text.
 * Individual color keywords take priority; families are a fallback
 * only when fewer than 2 individual matches are found.
 */
export function extractColorsFromText(text: string): string[] {
  const lower = text.toLowerCase();

  // 1. Try individual color keyword matches first (longer keys first to avoid partial hits)
  const found: string[] = [];
  const mapKeys = Object.keys(COLOR_HEX_MAP).sort((a, b) => b.length - a.length);
  for (const key of mapKeys) {
    if (lower.includes(key) && !found.includes(COLOR_HEX_MAP[key])) {
      found.push(COLOR_HEX_MAP[key]);
      if (found.length >= 4) break;
    }
  }
  if (found.length >= 2) return found;

  // 2. Fallback: try curated family phrases (longer keys first for specificity)
  const familyKeys = Object.keys(COLOR_FAMILIES).sort((a, b) => b.length - a.length);
  for (const key of familyKeys) {
    if (lower.includes(key)) return COLOR_FAMILIES[key];
  }

  return found;
}

export function colorToHex(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return hex;
  }
  // Fallback: generate a muted hue from the name
  let hash = 0;
  for (let i = 0; i < lower.length; i++) hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 25%, 60%)`;
}
