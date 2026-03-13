import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/hooks/auth/useAuth';

export interface ReviewWithProfile {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string | null;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  };
}

export function useReviews(dupeId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', dupeId],
    queryFn: (): Promise<ReviewWithProfile[]> =>
      api.get(`/reviews?dupeId=${dupeId}`),
    enabled: !!dupeId,
  });
}

export function useUserReview(dupeId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reviews', dupeId, 'user', user?.id],
    queryFn: (): Promise<ReviewWithProfile | null> =>
      api.get(`/reviews/my?dupeId=${dupeId}`),
    enabled: !!dupeId && !!user,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      dupeId,
      rating,
      comment,
    }: {
      dupeId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      return api.post('/reviews', { dupeId, rating, comment });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.dupeId] });
      queryClient.invalidateQueries({ queryKey: ['dupe', variables.dupeId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (dupeId: string) => {
      if (!user) throw new Error('Must be logged in');
      return api.delete(`/reviews/${dupeId}`);
    },
    onSuccess: (_, dupeId) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', dupeId] });
      queryClient.invalidateQueries({ queryKey: ['dupe', dupeId] });
    },
  });
}
