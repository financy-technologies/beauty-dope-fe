import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import type { DupeWithProducts, TrendingDupe } from '@/integrations/supabase/types';

interface DupesResponse {
  data: DupeWithProducts[];
  total: number;
  limit: number;
  offset: number;
}

interface UseDupesOptions {
  category?: string;
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'similarity' | 'savings' | 'rating' | 'trending';
}

export function useDupes(options: UseDupesOptions = {}) {
  const { category, limit = 10, offset = 0, sort = 'created_at' } = options;

  return useQuery({
    queryKey: ['dupes', { category, limit, offset, sort }],
    queryFn: async (): Promise<DupeWithProducts[]> => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort });
      if (category) params.set('category', category);
      const res = await api.get<DupesResponse>(`/dupes?${params}`);
      return res.data;
    },
  });
}

export function useFeaturedDupes(limit = 4) {
  return useQuery({
    queryKey: ['dupes', 'featured', limit],
    queryFn: () => api.get<DupeWithProducts[]>(`/dupes/featured?limit=${limit}`),
  });
}

export function useTrendingDupes(limit = 5) {
  return useQuery({
    queryKey: ['dupes', 'trending', limit],
    queryFn: () => api.get<TrendingDupe[]>(`/dupes/trending?limit=${limit}`),
  });
}
