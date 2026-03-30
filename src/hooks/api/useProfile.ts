import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/hooks/auth/useAuth';

export interface SkinProfile {
  skinType: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | null;
  skinConcerns: string[];
  skinSensitivities: string[];
  ageRange: 'under-20' | '20s' | '30s' | '40s' | '50s+' | null;
  skinQuizCompletedAt: string | null;
}

export interface FullProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  points: number;
  pointsEarnedTotal: number;
  createdAt: string;
  updatedAt: string;
  skinType: SkinProfile['skinType'];
  skinConcerns: string[];
  skinSensitivities: string[];
  ageRange: SkinProfile['ageRange'];
  skinQuizCompletedAt: string | null;
}

export interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  skinType?: SkinProfile['skinType'];
  skinConcerns?: string[];
  skinSensitivities?: string[];
  ageRange?: SkinProfile['ageRange'];
}

export interface SaveSkinQuizPayload {
  skinType: NonNullable<SkinProfile['skinType']>;
  skinConcerns: string[];
  skinSensitivities: string[];
  ageRange?: SkinProfile['ageRange'];
}

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery<FullProfile>({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get<FullProfile>(`/profiles/${user?.id}`),
    enabled: !!user?.id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<FullProfile>('/profiles/me', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

export function useSaveSkinQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveSkinQuizPayload) =>
      api.post<FullProfile>('/profiles/me/skin-quiz', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
      qc.invalidateQueries({ queryKey: ['rewards', 'points'] });
      qc.invalidateQueries({ queryKey: ['rewards', 'history'] });
    },
  });
}
