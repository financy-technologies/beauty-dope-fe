import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import type { DupeWithProducts } from '@/integrations/supabase/types';

export function useSearchDupes(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: (): Promise<DupeWithProducts[]> =>
      api.get(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}
