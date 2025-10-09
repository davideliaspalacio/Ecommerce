import { useMemo } from 'react';
import { useProductsContext } from '@/contexts/ProductsContext';

export interface FilterOptions {
  categories: string[];
  genders: string[];
  priceRanges: { min: number; max: number; label: string }[];
}

export function useProductFilters() {
  const { products } = useProductsContext();

  const filterOptions = useMemo((): FilterOptions => {
    if (!products || products.length === 0) {
      return {
        categories: [],
        genders: [],
        priceRanges: []
      };
    }

    // Extraer categorías únicas
    const categories = Array.from(
      new Set(products.map(product => product.category).filter(Boolean))
    ).sort();

    // Extraer géneros únicos
    const genders = Array.from(
      new Set(products.map(product => product.gender).filter(Boolean))
    ).sort();

    // Calcular rangos de precios dinámicos
    const prices = products.map(product => product.price).filter(price => price > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Crear rangos de precios dinámicos
    const priceRanges = [];
    if (minPrice !== maxPrice) {
      const range = maxPrice - minPrice;
      const step = range / 4; // 4 rangos
      
      priceRanges.push({
        min: 0,
        max: minPrice + step,
        label: `$0 - $${Math.round(minPrice + step).toLocaleString()}`
      });
      
      priceRanges.push({
        min: minPrice + step,
        max: minPrice + (step * 2),
        label: `$${Math.round(minPrice + step).toLocaleString()} - $${Math.round(minPrice + (step * 2)).toLocaleString()}`
      });
      
      priceRanges.push({
        min: minPrice + (step * 2),
        max: minPrice + (step * 3),
        label: `$${Math.round(minPrice + (step * 2)).toLocaleString()} - $${Math.round(minPrice + (step * 3)).toLocaleString()}`
      });
      
      priceRanges.push({
        min: minPrice + (step * 3),
        max: maxPrice,
        label: `$${Math.round(minPrice + (step * 3)).toLocaleString()}+`
      });
    } else {
      priceRanges.push({
        min: 0,
        max: maxPrice,
        label: `$0 - $${maxPrice.toLocaleString()}`
      });
    }

    return {
      categories,
      genders,
      priceRanges
    };
  }, [products]);

  return filterOptions;
}
