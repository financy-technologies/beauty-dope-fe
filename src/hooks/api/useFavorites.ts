import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/hooks/auth/useAuth';
import type { DupeWithProducts } from '@/types/api';

export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: (): Promise<string[]> => api.get('/favorites'),
    enabled: !!user,
  });
}

export function useFavoritesDupes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', 'dupes', user?.id],
    queryFn: (): Promise<DupeWithProducts[]> => api.get('/favorites/dupes'),
    enabled: !!user,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ dupeId, isFavorite }: { dupeId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('Must be logged in');
      if (isFavorite) {
        await api.delete(`/favorites/${dupeId}`);
      } else {
        await api.post(`/favorites/${dupeId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
