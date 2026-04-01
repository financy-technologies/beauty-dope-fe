import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/hooks/auth/useAuth';
import type { QuizInsights } from '@/config/quiz.config';

export type SectionId = 'biology' | 'skin' | 'hair' | 'makeup';

export interface SkinStoryProgress {
  biologyAnswers: Record<string, string | string[]> | null;
  skinAnswers: Record<string, string | string[]> | null;
  hairAnswers: Record<string, string | string[]> | null;
  makeupAnswers: Record<string, string | string[]> | null;
  insights: QuizInsights | null;
  sectionsDone: SectionId[];
  completedAt: string | null;
}

export interface SaveSectionPayload {
  section: SectionId;
  answers: Record<string, string | string[]>;
  insights?: QuizInsights;
}

const STORAGE_KEY = 'skinevora_skin_story';

/** Persist answers in localStorage (works for non-logged-in users too) */
export function loadLocalProgress(): Partial<Record<SectionId, Record<string, string | string[]>>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalSection(
  section: SectionId,
  answers: Record<string, string | string[]>,
) {
  try {
    const current = loadLocalProgress();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [section]: answers }));
  } catch {
    // ignore storage errors
  }
}

export function clearLocalProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useGetSkinStory() {
  const { user } = useAuth();
  return useQuery<SkinStoryProgress>({
    queryKey: ['skin-story'],
    queryFn: () => api.get<SkinStoryProgress>('/profiles/me/skin-story'),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveSkinStorySection() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: SaveSectionPayload) => {
      // Always persist locally first
      saveLocalSection(payload.section, payload.answers);

      // Only sync to API when logged in
      if (user) {
        return api.post<SkinStoryProgress>('/profiles/me/skin-story', payload);
      }
      // Return a mock shape for unauthenticated users
      return {
        sectionsDone: Object.keys(loadLocalProgress()) as SectionId[],
        insights: payload.insights ?? null,
        biologyAnswers: null,
        skinAnswers: null,
        hairAnswers: null,
        makeupAnswers: null,
        completedAt: null,
      } as SkinStoryProgress;
    },
    onSuccess: () => {
      if (user) {
        qc.invalidateQueries({ queryKey: ['skin-story'] });
        qc.invalidateQueries({ queryKey: ['rewards', 'points'] });
        qc.invalidateQueries({ queryKey: ['rewards', 'history'] });
        qc.invalidateQueries({ queryKey: ['profile', 'me'] });
      }
    },
  });
}
