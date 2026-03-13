import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import type { Category } from '@/integrations/supabase/types';

// Transform camelCase API response to match the Category type (snake_case image_url)
function transform(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    subcategories: c.subcategories ?? [],
    image_url: c.imageUrl ?? null,
    created_at: c.createdAt,
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const data = await api.get<any[]>('/categories');
      return data.map(transform);
    },
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<Category> => {
      const data = await api.get<any>(`/categories/${slug}`);
      return transform(data);
    },
    enabled: !!slug,
  });
}
