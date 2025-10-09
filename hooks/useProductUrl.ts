import { useRouter, useSearchParams } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { useProductsContext } from '@/contexts/ProductsContext'
import { useEffect, useState, useRef } from 'react'

export function useProductUrl() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedProduct, setSelectedSize, setCurrentImageIndex } = useUIStore()
  const { fetchProductById } = useProductsContext()
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  
  // Usar useRef para evitar re-renders y llamadas duplicadas
  const loadedProductIdRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)

  const openProductFromUrl = async (productId: string) => {
    // Evitar llamadas duplicadas para el mismo producto
    if (loadedProductIdRef.current === productId || isProcessingRef.current) {
      return
    }

    try {
      isProcessingRef.current = true
      setIsLoadingProduct(true)
      loadedProductIdRef.current = productId
      
      const product = await fetchProductById(productId)
      
      if (product) {
        setSelectedProduct(product)
        setSelectedSize('')
        setCurrentImageIndex(0)
      } else {
        console.warn(`❌ Producto con ID ${productId} no encontrado`)
        loadedProductIdRef.current = null
      }
    } catch (error) {
      console.error('❌ Error al cargar producto desde URL:', error)
      loadedProductIdRef.current = null
    } finally {
      isProcessingRef.current = false
      setIsLoadingProduct(false)
    }
  }

  const generateProductUrl = (productId: string) => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('product', productId)
    return currentUrl.toString()
  }

  const copyProductLink = async (productId: string) => {
    try {
      const url = generateProductUrl(productId)
      await navigator.clipboard.writeText(url)
      return { success: true, url }
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return { success: false, error }
    }
  }

  const closeProductAndClearUrl = () => {
    setSelectedProduct(null)
    setSelectedSize('')
    setCurrentImageIndex(0)
    loadedProductIdRef.current = null
    
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.delete('product')
    router.replace(currentUrl.pathname + currentUrl.search)
  }

  useEffect(() => {
    const productId = searchParams.get('product')
    
    if (productId && productId !== loadedProductIdRef.current) {
      openProductFromUrl(productId)
    } else if (!productId && loadedProductIdRef.current) {
      setSelectedProduct(null)
      setSelectedSize('')
      setCurrentImageIndex(0)
      loadedProductIdRef.current = null
    }
  }, [searchParams])

  return {
    openProductFromUrl,
    generateProductUrl,
    copyProductLink,
    closeProductAndClearUrl,
    isLoadingProduct
  }
}
