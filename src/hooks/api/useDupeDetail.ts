import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

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

export interface SkinTypeSuitability {
  dry: number;
  oily: number;
  sensitive: number;
  combination: number;
  normal: number;
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

export interface DupeProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  normalizedPriceInr: number;
  currency: string;
  platform: string;
  subcategory: string;
  image: string;
  sourceUrl: string | null;
  description: string | null;
  size: string | null;
  rawIngredients: string | null;
  ingredientsTokens: string[];
  ingredientBreakdown: IngredientBreakdown | null;
  skinTypeSuitability: SkinTypeSuitability | null;
  skinTypeRecommendedFor: string[];
  parsedIngredients: ParsedIngredient[];
}

export interface DupeDetail {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  priceRatio: number | null;
  dupeRank: number | null;
  dupeLabel: string | null;
  sharedActives: string[];
  category: string;
  totalVotes: number;
  avgRating: number;
  isFeatured: boolean;
  scoreConfidence: number | null;
  createdAt: string;
  original: DupeProduct;
  dupe: DupeProduct;
}

export function useDupeDetail(dupeId: string | undefined) {
  return useQuery({
    queryKey: ['dupe', dupeId],
    queryFn: () => api.get<DupeDetail>(`/dupes/${dupeId}`),
    enabled: !!dupeId,
  });
}
