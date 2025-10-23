import { useState, useEffect } from "react";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";

export default function WishlistModal() {
  const {
    wishlist,
    isLoading,
    error,
    isWishlistOpen,
    closeWishlist,
    removeFromWishlist,
    fetchWishlist,
    generateShareLink,
    copyShareLink,
    getShareId,
  } = useWishlistStore();
  
  // Debug: ver qué tipo de dato es wishlist
  console.log('Wishlist en WishlistModal:', wishlist, 'Tipo:', typeof wishlist, 'Es array:', Array.isArray(wishlist));
  
  const { setSelectedProduct, setSelectedSize, setCurrentImageIndex, openAuthModal } = useUIStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthContext();
  const [isWishlistClosing, setIsWishlistClosing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Cargar wishlist cuando se abre el modal
  useEffect(() => {
    if (isWishlistOpen && user) {
      fetchWishlist();
    }
  }, [isWishlistOpen, user, fetchWishlist]);

  const handleCloseWishlist = () => {
    setIsWishlistClosing(true);
    setTimeout(() => {
      closeWishlist();
      setIsWishlistClosing(false);
    }, 400);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentImageIndex(0);
    closeWishlist();
  };

  const handleAddToCart = (product: any, size?: string) => {
    const selectedSize = (product as any).size || size || (product.sizes && product.sizes[0]) || 'M';
    addToCart(product, selectedSize);
    setAddedProductName(product.name);
    setShowSuccessMessage(true);
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleShareWishlist = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (!Array.isArray(wishlist) || wishlist.length === 0) {
      alert('Tu wishlist está vacío. Agrega productos antes de compartir.');
      return;
    }

    setIsSharing(true);
    try {
      // Usar el primer item del wishlist para obtener el wishlist_id
      const wishlistId = wishlist[0].wishlist_id;
      const link = await generateShareLink(wishlistId, user);
      
      if (link) {
        setShareLink(link);
        setShowShareModal(true);
      } else {
        alert('Error al generar enlace de compartir');
      }
    } catch (error) {
      alert('Error al compartir wishlist');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
    } catch (error) {
      alert('Error al copiar enlace');
    }
  };

  if (!isWishlistOpen) return null;

  return (
    <>
      {/* Notificación de éxito */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[200] animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-3 rounded-1xl shadow-lg flex items-center gap-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-medium">¡Agregado al carrito!</p>
              <p className="text-sm opacity-90">{addedProductName}</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-[100] ${
          isWishlistClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
      >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 ${
          isWishlistClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleCloseWishlist}
      />

      {/* Panel del wishlist */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col ${
          isWishlistClosing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
      >
        {/* Header del wishlist */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">MIS FAVORITOS</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseWishlist}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del wishlist */}
        <div className="flex-1 overflow-y-auto p-6">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
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
              <p className="text-gray-500 text-lg mb-2">
                Inicia sesión para ver tus favoritos
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Los productos que marques como favoritos aparecerán aquí
              </p>
              <button
                onClick={openAuthModal}
                className="px-6 py-2 bg-[#4a5a3f] text-white font-medium rounded hover:bg-[#3d4a34] transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4">
                <img 
                  src="/favicon.png" 
                  alt="ENOUGHH" 
                  className="w-16 h-16 animate-spin"
                />
              </div>
              <p className="text-gray-500">Cargando favoritos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-red-300 mb-4"
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
              <p className="text-red-500 text-lg mb-2">Error al cargar favoritos</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          ) : (Array.isArray(wishlist) ? wishlist.length : 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
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
              <p className="text-gray-500 text-lg mb-2">
                Tu lista de favoritos está vacía
              </p>
              <p className="text-gray-400 text-sm">
                Agrega productos marcando el corazón ❤️
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(wishlist) ? wishlist : []).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex gap-4 pb-4 border-b animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="relative w-24 h-24 bg-gray-100 flex-shrink-0 cursor-pointer"
                    onClick={() => handleProductClick(item)}
                  >
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-sm mb-1 line-clamp-2 cursor-pointer hover:text-[#4a5a3f] transition-colors"
                      onClick={() => handleProductClick(item)}
                    >
                      {item.name}
                    </h3>
                    
                    {(item as any).size && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-[#4a5a3f] text-white text-xs font-medium rounded-1xl">
                          Talla: {(item as any).size}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col mb-2">
                      {isDiscountActive(item) ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold discount-price">
                              ${getCurrentPrice(item).toLocaleString("es-CO")}
                            </span>
                            <span className="px-2 py-1 discount-badge text-xs font-bold rounded-full">
                              -{getDiscountPercentage(item)}% OFF
                            </span>
                          </div>
                          <div className="text-sm original-price">
                            ${item.original_price?.toLocaleString("es-CO")}
                          </div>
                          <div className="text-xs savings-text font-medium">
                            Ahorras: ${getSavingsAmount(item).toLocaleString("es-CO")}
                          </div>
                        </>
                      ) : (
                        <span className="text-lg font-medium">
                          ${getCurrentPrice(item).toLocaleString("es-CO")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3 py-1 bg-[#4a5a3f]  text-white text-xs font-medium rounded-1xl hover:bg-[#3d4a34] transition-colors cursor-pointer"
                      >
                        Agregar al carrito
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del wishlist */}
        {Array.isArray(wishlist) && wishlist.length > 0 && (
          <div className="border-t p-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              {wishlist.length} producto{wishlist.length !== 1 ? 's' : ''} en favoritos
            </div>
            
            {/* Botón de compartir más grande */}
            {user && (
              <button
                onClick={handleShareWishlist}
                disabled={isSharing}
                className="w-full bg-[#4a5a3f] text-white py-3 px-4 font-medium rounded hover:bg-[#3d4a34] transition-colors cursor-pointer disabled:opacity-50 mb-3 flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <img 
                      src="/favicon.png" 
                      alt="ENOUGHH" 
                      className="w-4 h-4 animate-spin"
                    />
                    <span>Compartiendo...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span>COMPARTIR WISHLIST</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleCloseWishlist}
              className="w-full border border-gray-300 py-3 font-medium hover:border-black transition-colors cursor-pointer"
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Modal de compartir */}
    {showShareModal && (
      <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-1xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Compartir Wishlist</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Comparte tu wishlist con otros usuarios. Ellos podrán ver todos los productos que has guardado.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-1xl">
              <p className="text-xs text-gray-500 mb-1">Enlace de compartir:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink || ''}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-1xl bg-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-1xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={handleCopyShareLink}
                disabled={isCopied}
                className={`flex-1 px-4 py-2 rounded-1xl transition-colors cursor-pointer ${
                  isCopied 
                    ? 'bg-green-500 text-white cursor-not-allowed' 
                    : 'bg-[#4a5a3f] text-white hover:bg-[#3d4a34]'
                }`}
              >
                {isCopied ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Copiado!
                  </div>
                ) : (
                  'Copiar '
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
