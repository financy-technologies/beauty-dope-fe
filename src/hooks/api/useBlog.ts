import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import type { BlogPostCard, BlogPostFull } from '@/lib/blog';

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog', 'posts'],
    queryFn: () => api.get<BlogPostCard[]>('/blog/posts'),
    staleTime: 60 * 1000,
  });
}

/** `notFound` is true only when the API says the post doesn't exist (vs. a network error). */
export function useBlogPost(slug: string | undefined) {
  const q = useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => api.get<BlogPostFull>(`/blog/posts/${encodeURIComponent(slug ?? '')}`),
    enabled: !!slug,
    staleTime: 60 * 1000,
    retry: (count, err) => !/not found/i.test((err as Error).message) && count < 2,
  });
  const notFound = q.isError && /not found/i.test((q.error as Error).message);
  return { ...q, notFound };
}
