// ── Shared API types used across hooks and components ─────────────────────────

export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
}

export interface DupeWithProducts {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  category: string;
  totalVotes: number;
  avgRating: number;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
  original: ProductInfo;
  dupe: ProductInfo;
}

export interface TrendingDupe {
  id: string;
  rank: number;
  original: { brand: string; name: string };
  dupe: { brand: string; name: string };
  savings: string;
  votes: number;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  image_url: string | null;
  created_at: string;
}
