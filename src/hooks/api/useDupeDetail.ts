import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

export interface DupeDetail {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  category: string;
  totalVotes: number;
  avgRating: number;
  createdAt: string;
  original: { id: string; name: string; brand: string; price: number; image: string; description: string | null };
  dupe: { id: string; name: string; brand: string; price: number; image: string; description: string | null };
}

export function useDupeDetail(dupeId: string | undefined) {
  return useQuery({
    queryKey: ['dupe', dupeId],
    queryFn: () => api.get<DupeDetail>(`/dupes/${dupeId}`),
    enabled: !!dupeId,
  });
}
