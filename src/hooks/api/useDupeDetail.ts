import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

interface DupeProduct {
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
}

export interface DupeDetail {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  priceRatio: number | null;
  dupeRank: number | null;
  dupeLabel: string | null;  // 'exact-match' | 'close-dupe' | 'inspired-by'
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
