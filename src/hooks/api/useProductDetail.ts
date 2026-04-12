import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

// ── Shared sub-types ──────────────────────────────────────────────────────────

export interface SkinTypeSuitability {
  dry: number;
  oily: number;
  sensitive: number;
  combination: number;
  normal: number;
}

export interface IngredientBreakdown {
  tokenCount: number;
  actives: string[];
  humectants: string[];
  emollients: string[];
  preservatives: string[];
  chelatingAgents: string[];
  comedogenicCount: number;
  maxComedogenicity: number;
  fungalAcneSafe: boolean;
  pregnancySafe: boolean;
}

export interface ParsedIngredient {
  name: string;
  canonicalName?: string;
  category?: string;
  effects?: string[];
  comedogenicity?: number;
  fungalAcneSafe?: boolean;
  pregnancySafe?: boolean;
  skinTypeScores?: SkinTypeSuitability;
  description?: string;
}

export interface IngredientGroups {
  starActives: ParsedIngredient[];
  hydrators: ParsedIngredient[];
  barrierBuilders: ParsedIngredient[];
  botanicals: ParsedIngredient[];
  watchList: ParsedIngredient[];
  functional: ParsedIngredient[];
  other: ParsedIngredient[];
}

export interface SkinevoraScores {
  efficacy: number;        // 0–100
  irritancy: 'low' | 'medium' | 'high';
  value: number;           // 0–100
  clean: number;           // 0–100
}

export interface EthicsFlags {
  fragranceFree: boolean | null;
  alcoholFree: boolean | null;
  parabenFree: boolean | null;
  siliconeFree: boolean | null;
}

export interface DupeForProduct {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  dupeLabel: string | null;
  sharedActives: string[];
  missingActives: string[];
  dupeProduct: {
    id: string;
    name: string;
    brand: string;
    price: number;
    normalizedPriceInr: number;
    currency: string;
    imageUrl: string;
    sourceUrl: string | null;
    size: string | null;
    platform: string;
    ingredientBreakdown: IngredientBreakdown | null;
  };
}

export interface ReviewSummary {
  total: number;
  avgRating: number | null;
  ratingBreakdown: { star: number; count: number }[];
  items: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName: string;
  }[];
}

export interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  price: number;
  normalizedPriceInr: number;
  currency: string;
  imageUrl: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  size: string | null;
  quantity: number | null;
  sourceUrl: string | null;
  platform: string;
  store: string;
  ingredients: string | null;
  ingredientsTokens: string[];
  ingredientBreakdown: IngredientBreakdown | null;
  skinTypeSuitability: SkinTypeSuitability | null;
  skinTypeRecommendedFor: string[];
  parsedIngredients: ParsedIngredient[];
  ingredientGroups: IngredientGroups;
  skinevoraScores: SkinevoraScores;
  ethics: EthicsFlags;
  dupes: DupeForProduct[];
  reviews: ReviewSummary;
  createdAt: string;
  updatedAt: string;
}

export function useProductDetail(productId: string | undefined) {
  return useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => api.get<ProductDetail>(`/products/${productId}/detail`),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopBrands(limit = 20) {
  return useQuery({
    queryKey: ['top-brands', limit],
    queryFn: () => api.get<string[]>(`/products/brands?limit=${limit}`),
    staleTime: 1000 * 60 * 10, // 10 min — brands don't change often
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['product-search', query],
    queryFn: () => api.get<Pick<ProductDetail, 'id' | 'name' | 'brand' | 'price' | 'imageUrl' | 'category' | 'normalizedPriceInr' | 'currency'>[]>(
      `/products?q=${encodeURIComponent(query)}&limit=6`
    ),
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
}
