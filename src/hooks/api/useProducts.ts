import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  category: string;
  subcategory?: string;
}

interface UseProductsOptions {
  search?: string;
  limit?: number;
  category?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { search = '', limit = 50, category } = options;

  return useQuery<Product[]>({
    queryKey: ['products-list', { category }],
    queryFn: async (): Promise<Product[]> => {
      const all = await api.get<Product[]>('/products');
      if (!Array.isArray(all)) return [];
      let filtered = all;
      if (category) {
        filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
      }
      return filtered;
    },
    select: (all) => {
      const lower = search.toLowerCase().trim();
      const matched = lower
        ? all.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              p.brand.toLowerCase().includes(lower),
          )
        : all;
      return matched.slice(0, limit);
    },
    staleTime: 1000 * 60 * 5,
  });
}
