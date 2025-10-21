import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ProductType } from '@/components/types/Product';

interface UseProductsPaginationReturn {
  products: ProductType[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  totalCount: number;
}

export function useProductsPagination(limit: number = 8): UseProductsPaginationReturn {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const currentPage = Math.floor(currentOffset / limit) + 1;
      
      if (loading) {
        return;
      }
      
      // Obtener productos con paginación usando el nuevo API
      const response = await apiClient.getProducts({
        page: currentPage,
        limit: limit
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar los productos');
      }

      // El backend devuelve los productos directamente en data
      const newProducts = response.data || [];
      const totalCount = response.total || 0;
      
      setTotalCount(totalCount);
      
      if (reset) {
        setProducts(newProducts);
        setOffset(limit);
      } else {
        // Deduplicar productos basándose en el ID para evitar duplicados
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });
        setOffset(prev => prev + limit);
      }

      // Verificar si hay más productos
      setHasMore((currentOffset + limit) < totalCount);

    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [offset, limit]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchProducts(false);
    }
  }, [loading, hasMore, fetchProducts]);

  const reset = useCallback(() => {
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    fetchProducts(true);
  }, [fetchProducts]);

  // Cargar productos iniciales
  useEffect(() => {
    fetchProducts(true);
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    totalCount
  };
}
