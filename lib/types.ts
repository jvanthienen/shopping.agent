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
}

export interface Outfit {
  id: string;
  name: string;
  vibe: string;
  items: Product[];
  totalPrice: string;
}
