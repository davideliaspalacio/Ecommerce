"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductType, CreateProductType, ProductFilters } from '@/components/types/Product'

interface ProductsContextType {
  // Estado
  products: ProductType[]
  loading: boolean
  error: string | null
  
  // Funciones
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  fetchProductById: (id: string) => Promise<ProductType | null>
  createProduct: (productData: CreateProductType) => Promise<{ data: any; error: any }>
  updateProduct: (id: string, updates: Partial<CreateProductType>) => Promise<{ data: any; error: any }>
  deleteProduct: (id: string) => Promise<{ error: any }>
  fetchProductsByCategory: (category: string) => Promise<void>
  fetchProductsByGender: (gender: string) => Promise<void>
  searchProducts: (searchTerm: string) => Promise<void>
  fetchProductStats: () => Promise<{ data: any; error: any }>
  clearError: () => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

interface ProductsProviderProps {
  children: ReactNode
}

export function ProductsProvider({ children }: ProductsProviderProps) {
  const products = useProducts()

  return (
    <ProductsContext.Provider value={products}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProductsContext() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider')
  }
  return context
}

// Hook de conveniencia para obtener productos por categoría
export function useProductsByCategory(category: string) {
  const { products, fetchProductsByCategory, loading } = useProductsContext()
  
  React.useEffect(() => {
    if (category) {
      fetchProductsByCategory(category)
    }
  }, [category, fetchProductsByCategory])

  return {
    products: products.filter(p => p.category === category),
    loading
  }
}

// Hook de conveniencia para búsqueda
export function useProductSearch() {
  const { searchProducts, loading } = useProductsContext()
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term)
    searchProducts(term)
  }, [searchProducts])

  return {
    searchTerm,
    setSearchTerm,
    handleSearch,
    loading
  }
}
