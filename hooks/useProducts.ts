import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { ProductType, CreateProductType, ProductFilters } from '@/components/types/Product'

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar productos al inicializar
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (filters?: ProductFilters) => {
    try {
      setLoading(true)
      setError(null)

      let response

      // Usar endpoints específicos según los filtros
      if (filters?.category) {
        response = await apiClient.getProductsByCategory(
          filters.category,
          filters?.offset ? Math.floor(filters.offset / (filters?.limit || 8)) + 1 : 1,
          filters?.limit || 8
        )
      } else if (filters?.gender) {
        if (filters?.search) {
          response = await apiClient.getProductsByGenderWithSearch(
            filters.gender,
            filters.search,
            filters?.offset ? Math.floor(filters.offset / (filters?.limit || 8)) + 1 : 1,
            filters?.limit || 8
          )
        } else {
          response = await apiClient.getProductsByGender(
            filters.gender,
            filters?.offset ? Math.floor(filters.offset / (filters?.limit || 8)) + 1 : 1,
            filters?.limit || 8
          )
        }
      } else if (filters?.min_price && filters?.max_price) {
        response = await apiClient.getProductsByPriceRange(
          filters.min_price,
          filters.max_price,
          filters?.offset ? Math.floor(filters.offset / (filters?.limit || 8)) + 1 : 1,
          filters?.limit || 8
        )
      } else {
        // Endpoint general con parámetros
        response = await apiClient.getProducts({
          page: filters?.offset ? Math.floor(filters.offset / (filters?.limit || 8)) + 1 : 1,
          limit: filters?.limit || 8,
          search: filters?.search,
          minPrice: filters?.min_price,
          maxPrice: filters?.max_price,
          gender: filters?.gender
        })
      }

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar los productos')
      }

      // El backend devuelve los productos directamente en data
      console.log('Productos recibidos:', response.data)
      setProducts(response.data || [])
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener un producto por ID
  const fetchProductById = async (id: string): Promise<ProductType | null> => {
    try {
      const response = await apiClient.getProduct(id)

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar el producto')
      }

      return response.data
    } catch (err: any) {
      console.error('Error fetching product:', err)
      setError(err.message || 'Error al cargar el producto')
      return null
    }
  }

  // Crear un nuevo producto (solo admin)
  const createProduct = async (productData: CreateProductType) => {
    try {
      setError(null)
      
      const response = await apiClient.createProduct(productData)

      if (!response.success) {
        throw new Error(response.error || 'Error al crear el producto')
      }

      // Actualizar la lista de productos
      setProducts(prev => [response.data, ...prev])
      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el producto'
      console.error('Error creating product:', err)
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  // Actualizar un producto (solo admin)
  const updateProduct = async (id: string, updates: Partial<CreateProductType>) => {
    try {
      setError(null)
      
      const response = await apiClient.updateProduct(id, updates)

      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar el producto')
      }

      // Actualizar la lista de productos
      setProducts(prev => 
        prev.map(product => product.id === id ? response.data : product)
      )
      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el producto'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  // Eliminar un producto (solo admin)
  const deleteProduct = async (id: string) => {
    try {
      setError(null)
      
      const response = await apiClient.deleteProduct(id)

      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar el producto')
      }

      // Remover de la lista de productos
      setProducts(prev => prev.filter(product => product.id !== id))
      return { error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar el producto'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  // Obtener productos por categoría
  const fetchProductsByCategory = async (category: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getProductsByCategory(category, 1, 8)

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar productos por categoría')
      }

      setProducts(response.data || [])
    } catch (err: any) {
      console.error('Error fetching products by category:', err)
      setError(err.message || 'Error al cargar productos por categoría')
    } finally {
      setLoading(false)
    }
  }

  // Obtener productos por género
  const fetchProductsByGender = async (gender: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getProductsByGender(gender, 1, 8)

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar productos por género')
      }

      setProducts(response.data || [])
    } catch (err: any) {
      console.error('Error fetching products by gender:', err)
      setError(err.message || 'Error al cargar productos por género')
    } finally {
      setLoading(false)
    }
  }

  // Buscar productos
  const searchProducts = async (searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getProducts({
        search: searchTerm,
        page: 1,
        limit: 8
      })

      if (!response.success) {
        throw new Error(response.error || 'Error al buscar productos')
      }

      setProducts(response.data || [])
    } catch (err: any) {
      console.error('Error searching products:', err)
      setError(err.message || 'Error al buscar productos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas de productos (solo admin)
  const fetchProductStats = async () => {
    try {
      const response = await apiClient.getAdminAnalytics()

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar estadísticas')
      }

      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estadísticas'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  // Cargar productos al montar el componente (limitado a 8 para la página principal)
  useEffect(() => {
    fetchProducts({ limit: 8, offset: 0 })
  }, [])

  return {
    // Estado
    products,
    loading,
    error,
    
    // Funciones
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductsByCategory,
    fetchProductsByGender,
    searchProducts,
    fetchProductStats,
    
    // Utilidades
    clearError: () => setError(null)
  }
}
