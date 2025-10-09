import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductType, CreateProductType, ProductFilters } from '@/components/types/Product'

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async (filters?: ProductFilters) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.gender) {
        query = query.eq('gender', filters.gender)
      }
      if (filters?.min_price) {
        query = query.gte('price', filters.min_price)
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setProducts(data || [])
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data
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
      
      console.log('Creating product with data:', productData)
      
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el producto')
      }

      console.log('Product created successfully:', result.data)
      
      // Actualizar la lista de productos
      setProducts(prev => [result.data, ...prev])
      return { data: result.data, error: null }
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
      
      console.log('Updating product:', id, updates)
      
      const response = await fetch('/api/products/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el producto')
      }

      console.log('Product updated successfully:', result.data)

      // Actualizar la lista de productos
      setProducts(prev => 
        prev.map(product => product.id === id ? result.data : product)
      )
      return { data: result.data, error: null }
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
      
      console.log('Deleting product:', id)
      
      const response = await fetch(`/api/products/delete?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el producto')
      }

      console.log('Product deleted successfully')

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
    await fetchProducts({ category })
  }

  // Obtener productos por género
  const fetchProductsByGender = async (gender: string) => {
    await fetchProducts({ gender })
  }

  // Buscar productos
  const searchProducts = async (searchTerm: string) => {
    await fetchProducts({ search: searchTerm })
  }

  // Obtener estadísticas de productos (solo admin)
  const fetchProductStats = async () => {
    try {
      const { data, error } = await supabase
        .from('product_stats')
        .select('*')

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar estadísticas'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts()
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
