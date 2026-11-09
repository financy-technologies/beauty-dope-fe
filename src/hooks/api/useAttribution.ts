import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

export interface TrackingLink {
  id: string;
  slug: string;
  label: string;
  destinationPath: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string | null;
  utmContent: string | null;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  signups: { first: number; last: number };
}

export interface CreateTrackingLinkInput {
  label: string;
  slug?: string;
  destinationPath?: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign?: string;
  utmContent?: string;
}

export type AttributionModel = 'first' | 'last';

export interface AttributionReport {
  model: AttributionModel;
  days: number | null;
  totalSignups: number;
  attributedSignups: number;
  unattributedSignups: number;
  byChannel: { source: string; medium: string; campaign: string | null; signups: number }[];
  byLink: { slug: string; signups: number }[];
  byLandingPath: { landingPath: string; signups: number }[];
}

export function useTrackingLinks(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'tracking-links'],
    queryFn: () => api.get<TrackingLink[]>('/admin/links'),
    enabled,
  });
}

export function useAttributionReport(model: AttributionModel, days: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'attribution', model, days],
    queryFn: () => {
      const params = new URLSearchParams({ model });
      if (days) params.set('days', String(days));
      return api.get<AttributionReport>(`/admin/attribution?${params}`);
    },
    enabled,
  });
}

export function useCreateTrackingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrackingLinkInput) => api.post<TrackingLink>('/admin/links', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tracking-links'] }),
  });
}

export function useSetTrackingLinkActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<TrackingLink>(`/admin/links/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tracking-links'] }),
  });
}

export interface HeardAboutReport {
  days: number | null;
  answered: number;
  skipped: number;
  responseRate: number | null;
  byChannel: { channel: string; responses: number }[];
  recent: {
    createdAt: string;
    channel: string;
    detail: string | null;
    email: string;
    trackedSource: string | null;
    trackedMedium: string | null;
  }[];
}

export function useHeardAboutReport(days: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'heard-about', days],
    queryFn: () => api.get<HeardAboutReport>(`/admin/heard-about${days ? `?days=${days}` : ''}`),
    enabled,
  });
}
