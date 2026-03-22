import { useQuery, useQueries } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

export interface IngredientAnalysisResponse {
  tokenCount: number;
  breakdown: {
    actives: Array<{ name: string; effects: string[]; comedogenicity: number }>;
    humectants: Array<{ name: string; effects: string[]; comedogenicity: number }>;
    emollients: Array<{ name: string; effects: string[]; comedogenicity: number }>;
    preservatives: Array<{ name: string; effects: string[]; comedogenicity: number }>;
    chelatingAgents: Array<{ name: string; effects: string[]; comedogenicity: number }>;
  };
  skinTypeSuitability: {
    dry: number;
    oily: number;
    sensitive: number;
    combination: number;
    normal: number;
  };
  recommendedFor: string[];
  warnings: {
    fungalAcneUnsafe: boolean;
    pregnancyUnsafe: boolean;
    irritants: string[];
    highComedogenicity: string[];
  };
  overallScore: number;
  synergies: { betweenIngredients: Array<{ ingredient1: string; ingredient2: string }> };
  conflicts: { avoidCombiningWith: Array<{ ingredient1: string; ingredient2: string }> };
}

export function useIngredientAnalysis(
  ingredientText: string,
  skinType?: string,
  enabled: boolean = true
) {
  return useQuery<IngredientAnalysisResponse>({
    queryKey: ['ingredients', 'analyze', ingredientText, skinType],
    queryFn: () =>
      api.post('/ingredients/analyze', {
        raw: ingredientText,
        preferredSkinType: skinType,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && ingredientText.length > 0,
  });
}

interface DupeProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  normalizedPriceInr?: number;
  currency?: string;
  image: string;
}

export interface FilteredDupesResponse {
  data: Array<{
    id: string;
    similarityScore: number;
    savingsPercent: number;
    category: string;
    dupeLabel?: string | null;
    sharedActives?: string[];
    original: DupeProduct;
    dupe: DupeProduct;
    skinTypeAdjustedScore?: number;
    ingredientMatches?: string;
  }>;
  total: number;
  filters_applied: {
    includeCount: number;
    excludeCount: number;
    forSkinType: string;
  };
}

export function useFilterDupesByIngredients(
  originalProductId: string | undefined,
  forSkinType: string,
  includeIngredients?: string[],
  excludeIngredients?: string[],
  enabled: boolean = true
) {
  return useQuery<FilteredDupesResponse>({
    queryKey: [
      'dupes',
      'filtered',
      originalProductId,
      forSkinType,
      includeIngredients?.join(','),
      excludeIngredients?.join(','),
    ],
    queryFn: () =>
      api.post('/dupes/filter-by-ingredients', {
        originalProductId,
        includeIngredients,
        excludeIngredients,
        forSkinType,
        limit: 10,
        offset: 0,
      }),
    enabled: enabled && !!originalProductId && !!forSkinType,
  });
}

export interface IngredientComparisonResponse {
  product1: {
    id: string;
    name: string;
    brand: string;
    price: number;
    currency: string;
    imageUrl?: string;
  };
  product2: {
    id: string;
    name: string;
    brand: string;
    price: number;
    currency: string;
    imageUrl?: string;
  };
  sharedIngredients: Array<{ name: string; effects: string[] }>;
  uniqueToProduct1: Array<{ name: string; effects: string[] }>;
  uniqueToProduct2: Array<{ name: string; effects: string[] }>;
  sharedEffects: string[];
  effectDifferences: { onlyIn1: string[]; onlyIn2: string[] };
  skinTypeComparison?: {
    product1_score_forSkinType: number;
    product2_score_forSkinType: number;
    betterFor: 1 | 2 | null;
  };
  pricePerUnit: {
    product1?: number;
    product2?: number;
  };
  overallSimilarity: number;
}

export function useCompareIngredients(
  productId1: string | undefined,
  productId2: string | undefined,
  skinType?: string,
  enabled: boolean = true
) {
  return useQuery<IngredientComparisonResponse>({
    queryKey: ['ingredients', 'compare', productId1, productId2, skinType],
    queryFn: () =>
      api.post('/dupes/compare-ingredients', {
        productId1,
        productId2,
        forSkinType: skinType,
      }),
    enabled: enabled && !!productId1 && !!productId2,
  });
}
