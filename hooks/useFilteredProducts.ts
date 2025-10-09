import { useMemo, useState, useEffect, useRef } from 'react';
import { useProductsContext } from '@/contexts/ProductsContext';
import { useUIStore } from '@/store/uiStore';

export function useFilteredProducts() {
  const { products } = useProductsContext();
  const {
    genderFilter,
    appliedCategories,
    appliedPriceRange
  } = useUIStore();
  
  const [isFiltering, setIsFiltering] = useState(false);
  const isInitialLoad = useRef(true);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Filtro por género
      if (genderFilter !== "TODOS" && product.gender !== genderFilter) {
        return false;
      }

      // Filtro por categorías
      if (appliedCategories.length > 0 && !appliedCategories.includes(product.category)) {
        return false;
      }

      // Filtro por rango de precios
      if (appliedPriceRange) {
        const price = product.price;
        if (price < appliedPriceRange.min || price > appliedPriceRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [products, genderFilter, appliedCategories, appliedPriceRange]);

  // Simular animación de carga cuando cambian los filtros aplicados
  useEffect(() => {
    // No mostrar animación en la carga inicial
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Solo mostrar animación si hay filtros avanzados aplicados (no solo cambio de género)
    const hasAdvancedFilters = appliedCategories.length > 0 || 
                              appliedPriceRange !== null;

    if (hasAdvancedFilters) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setIsFiltering(false);
      }, 500); // Duración de la animación

      return () => clearTimeout(timer);
    }
  }, [appliedCategories, appliedPriceRange]);

  return { filteredProducts, isFiltering };
}
