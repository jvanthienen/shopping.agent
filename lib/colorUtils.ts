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
};

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
