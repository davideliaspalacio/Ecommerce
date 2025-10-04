import { useState } from "react"
import Image from "next/image"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"

export default function ProductModal() {
    const { selectedProduct, selectedSize, currentImageIndex, setSelectedProduct, setSelectedSize, setCurrentImageIndex } = useUIStore()
    const { addToCart, openCart } = useCartStore()
    const [isProductModalClosing, setIsProductModalClosing] = useState(false)
    const [showAbout, setShowAbout] = useState(false)
    
    const handleAddToCart = () => {
        if (!selectedProduct || !selectedSize) return
        addToCart(selectedProduct, selectedSize)
        setSelectedProduct(null)
        openCart()
        setSelectedProduct(null)
        setSelectedSize("")
        setCurrentImageIndex(0)
    }
    const closeProductModal = () => {
        setIsProductModalClosing(true)
        setSelectedProduct(null)
        setSelectedSize("")
        setCurrentImageIndex(0)
        setTimeout(() => {
          setSelectedProduct(null)
          setIsProductModalClosing(false)
        }, 300) 
      }
      console.log(selectedProduct.image_back, "image back")
  if (!selectedProduct) return null

  return (
    <div className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${isProductModalClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeProductModal}>
    <div className={`bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto relative ${isProductModalClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={(e) => e.stopPropagation()}>
      {/* Banner Premium */}
      <div className="bg-[#4a5a3f] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-10">
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
              src={currentImageIndex === 0 ? selectedProduct.image : selectedProduct.image_back}
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
              className={`relative aspect-square bg-gray-100 border-2 width-[50%] ${
                currentImageIndex === 1 ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={selectedProduct.image_back || "/placeholder.svg"}
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
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-2xl font-medium">{selectedProduct.price}</p>
            {!selectedSize && (
                <div className="flex items-center gap-1 text-amber-600 text-sm mt-5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Selecciona una talla</span>
                </div>
              )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
                
              <p className="text-sm text-gray-600">{selectedProduct.description}</p>
            </div>
            <div className="flex gap-2 mb-4">
              {selectedProduct.sizes.map((size: string) => (
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
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-1xl">
                <p className="text-amber-800 text-[12px] flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Para agregar este producto al carrito, primero debes seleccionar una talla.</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
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
                <div>
                  <ul className="space-y-1">
                    {selectedProduct.specifications.map((spec: string, index: number) => (
                      <li key={index}>• {spec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">Especificaciones del producto</p>
                    <p className="text-gray-600">{selectedProduct.specifications.join(", ")}</p>
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