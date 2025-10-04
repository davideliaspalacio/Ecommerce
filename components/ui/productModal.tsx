import { useState } from "react"
import Image from "next/image"
import { ProductType } from "../types/Product"
import { CartItemType } from "../types/CartItem"


export default function ProductModal( {selectedProduct, selectedSize, currentImageIndex, setSelectedProduct, setSelectedSize, setCurrentImageIndex, cart, setCart, setIsCartOpen}: {selectedProduct: ProductType | null, selectedSize: string, currentImageIndex: number, setSelectedProduct: (product: ProductType | null) => void, setSelectedSize: (size: string) => void, setCurrentImageIndex: (index: number) => void, cart: CartItemType[], setCart: (cart: CartItemType[]) => void, setIsCartOpen: (open: boolean) => void} ) {
    const [isProductModalClosing, setIsProductModalClosing] = useState(false)
    const [showAbout, setShowAbout] = useState(false)
    const addToCart = () => {
        if (!selectedProduct || !selectedSize) return

        const existingItemIndex = cart.findIndex(
          (item) => item.product.id === selectedProduct.id && item.size === selectedSize,
        )
    
        if (existingItemIndex > -1) {
          const newCart = [...cart]
          newCart[existingItemIndex].quantity += 1
          setCart(newCart)
        } else {
          setCart([...cart, { product: selectedProduct, size: selectedSize, quantity: 1 }])
        }
        
        setSelectedProduct(null)
        setIsCartOpen(true)
    }
    const closeProductModal = () => {
        setIsProductModalClosing(true)
        setTimeout(() => {
          setSelectedProduct(null)
          setIsProductModalClosing(false)
        }, 300) 
      }
  if (!selectedProduct) return null

  return (
    <div className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${isProductModalClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeProductModal}>
    <div className={`bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto relative ${isProductModalClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={(e) => e.stopPropagation()}>
      {/* Banner Premium */}
      <div className="bg-[#4a5a3f] text-white px-6 py-3 flex items-center justify-between">
        <p className="text-sm">TELA PREMIUM | Una vez la tocas, notarás la diferencia</p>
        <button
          onClick={closeProductModal}
          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Imágenes del producto */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={currentImageIndex === 0 ? selectedProduct.image : selectedProduct.imageBack}
              alt={selectedProduct.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentImageIndex(0)}
              className={`relative aspect-square bg-gray-100 border-2 ${
                currentImageIndex === 0 ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={selectedProduct.image || "/placeholder.svg"}
                alt="Frente"
                fill
                className="object-cover"
              />
            </button>
            <button
              onClick={() => setCurrentImageIndex(1)}
              className={`relative aspect-square bg-gray-100 border-2 ${
                currentImageIndex === 1 ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={selectedProduct.imageBack || "/placeholder.svg"}
                alt="Espalda"
                fill
                className="object-cover"
              />
            </button>
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Item: {selectedProduct.id}9060</p>
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-2xl font-medium">{selectedProduct.price}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">El modelo mide 1.83m y tiene una talla M</p>
              {!selectedSize && (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Selecciona una talla</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2 border transition-all duration-200 ${
                    selectedSize === size
                      ? "border-[#4a5a3f] bg-[#4a5a3f] text-white scale-105"
                      : "border-gray-300 hover:border-[#4a5a3f] hover:scale-105"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Para agregar este producto al carrito, primero debes seleccionar una talla.</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={addToCart}
            disabled={!selectedSize}
            className={`w-full py-3 text-white font-medium transition-all duration-300 ${
              selectedSize 
                ? "bg-[#4a5a3f] hover:bg-[#3d4a34] hover:scale-105 active:scale-95" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {selectedSize ? "AGREGAR AL CARRITO" : "SELECCIONA UNA TALLA"}
          </button>

          {/* Sección "Sobre el producto" */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="w-full flex items-center justify-between py-2 font-medium"
            >
              <span>SOBRE EL PRODUCTO</span>
              <svg
                className={`w-5 h-5 transition-transform ${showAbout ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAbout && (
              <div className="pt-4 space-y-4 text-sm text-gray-700">
                <p>{selectedProduct.description}</p>

                <div>
                  <p className="font-medium mb-2">ESPECIFICACIONES</p>
                  <ul className="space-y-1">
                    {selectedProduct.specifications.map((spec, index) => (
                      <li key={index}>• {spec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">COMPOSICIÓN Y CUIDADOS</p>
                  <p className="text-gray-600">Tela principal/Main fabric</p>
                  <p>• 100% algodón/cotton</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}