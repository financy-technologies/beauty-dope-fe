import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

export interface NewsletterPost {
  title: string;
  url: string;
  publishedAt: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
}

export type Newsletter =
  | { enabled: false }
  | {
      enabled: true;
      publicationUrl: string;
      subscribeUrl: string;
      embedUrl: string;
      title: string | null;
      posts: NewsletterPost[];
    };

/** Substack publication links + latest issues (the API caches the RSS feed). */
export function useNewsletter() {
  return useQuery({
    queryKey: ['newsletter'],
    queryFn: () => api.get<Newsletter>('/newsletter'),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
