"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";

export default function SharedWishlistPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const { 
    sharedWishlist, 
    isLoading, 
    error, 
    fetchSharedWishlist 
  } = useWishlistStore();
  
  const { setSelectedProduct, setSelectedSize, setCurrentImageIndex } = useUIStore();
  const { addToCart } = useCartStore();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (shareId) {
      fetchSharedWishlist(shareId).finally(() => {
        setIsLoadingPage(false);
      });
    }
  }, [shareId, fetchSharedWishlist]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentImageIndex(0);
  };

  const handleAddToCart = (product: any, size: string) => {
    addToCart(product, size);
  };

  const handlePurchaseWishlist = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!sharedWishlist) return;

    setIsPurchasing(true);
    try {
      // Agregar todos los productos del wishlist al carrito
      for (const product of sharedWishlist.products) {
        // Usar la primera talla disponible o una por defecto
        const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Única';
        addToCart(product, size);
      }
      
      setPurchaseSuccess(true);
      setShowPurchaseModal(false);
      
      // Redirigir al carrito después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
    } finally {
      setIsPurchasing(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!sharedWishlist) return 0;
    return sharedWishlist.products.reduce((total, product) => {
      return total + getCurrentPrice(product);
    }, 0);
  };

  const calculateTotalSavings = () => {
    if (!sharedWishlist) return 0;
    return sharedWishlist.products.reduce((total, product) => {
      return total + getSavingsAmount(product);
    }, 0);
  };

  if (isLoadingPage || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a5a3f] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando wishlist...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedWishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Wishlist no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Este wishlist no existe o no está disponible para compartir."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#4a5a3f] text-white rounded hover:bg-[#3d4a34] transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wishlist de {sharedWishlist.created_by_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {sharedWishlist.products.length} producto{sharedWishlist.products.length !== 1 ? 's' : ''} en favoritos
              </p>
              <div className="mt-2 flex items-center gap-4">
                <div className="text-lg font-semibold text-[#4a5a3f]">
                  Total: ${calculateTotalPrice().toLocaleString("es-CO")}
                </div>
                {calculateTotalSavings() > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Ahorras: ${calculateTotalSavings().toLocaleString("es-CO")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {sharedWishlist.products.length > 0 && (
                <button
                  onClick={handlePurchaseWishlist}
                  className="inline-flex items-center px-6 py-3 bg-[#4a5a3f] text-white font-medium rounded-lg hover:bg-[#3d4a34] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Comprar Wishlist
                </button>
              )}
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sharedWishlist.products.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Este wishlist está vacío
            </h2>
            <p className="text-gray-600">
              No hay productos en este wishlist compartido.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sharedWishlist.products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 
                    className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#4a5a3f] transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="mb-3">
                    {isDiscountActive(product) ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold discount-price">
                            ${getCurrentPrice(product).toLocaleString("es-CO")}
                          </span>
                          <span className="px-2 py-1 discount-badge text-xs font-bold rounded-full">
                            -{getDiscountPercentage(product)}% OFF
                          </span>
                        </div>
                        <div className="text-sm original-price">
                          ${product.original_price?.toLocaleString("es-CO")}
                        </div>
                        <div className="text-xs savings-text font-medium">
                          Ahorras: ${getSavingsAmount(product).toLocaleString("es-CO")}
                        </div>
                      </>
                    ) : (
                      <span className="text-lg font-medium">
                        ${getCurrentPrice(product).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product, product.sizes[0])}
                      className="flex-1 px-3 py-2 bg-[#4a5a3f] text-white text-sm font-medium rounded hover:bg-[#3d4a34] transition-colors cursor-pointer"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              ¿Te gusta este wishlist? Crea tu cuenta para guardar tus propios favoritos.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#4a5a3f] text-white font-medium rounded-lg hover:bg-[#3d4a34] transition-colors"
            >
              Explorar productos
            </a>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Compra */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Confirmar Compra del Wishlist
                </h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen de la compra:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Productos:</span>
                      <span>{sharedWishlist.products.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateTotalPrice().toLocaleString("es-CO")}</span>
                    </div>
                    {calculateTotalSavings() > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Ahorros:</span>
                        <span>-${calculateTotalSavings().toLocaleString("es-CO")}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${calculateTotalPrice().toLocaleString("es-CO")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">¿Qué sucede al confirmar?</p>
                      <p>Todos los productos de este wishlist se agregarán a tu carrito de compras. Podrás revisar y modificar tu pedido antes de finalizar la compra.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isPurchasing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isPurchasing}
                    className="flex-1 px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPurchasing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Agregando...
                      </>
                    ) : (
                      'Confirmar Compra'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {purchaseSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Compra Agregada al Carrito!
              </h3>
              <p className="text-gray-600 mb-6">
                Todos los productos del wishlist han sido agregados a tu carrito. Serás redirigido al inicio en unos segundos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseSuccess(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <a
                  href="/"
                  className="flex-1 px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] transition-colors text-center"
                >
                  Ir al Carrito
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
