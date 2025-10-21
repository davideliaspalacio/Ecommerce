import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthModal from "./authModal";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";

export default function ShoppingCart() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    getItemPrice,
    backendTotal,
    backendSavings,
  } = useCartStore();
  const {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useUIStore();
  const { user } = useAuthContext();
  const [isCartClosing, setIsCartClosing] = useState(false);
  // Ya no necesitamos estado separado para el total, viene en el carrito
  const handleCloseCart = () => {
    setIsCartClosing(true);
    setTimeout(() => {
      closeCart();
      setIsCartClosing(false);
    }, 400);
  };

  // Ya no necesitamos fetchCartTotal, el total viene en el carrito

  const handleCheckoutClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Redirigir a la página de checkout
    closeCart();
    router.push("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] ${
          isCartClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 ${
            isCartClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={handleCloseCart}
        />

        {/* Panel del carrito */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col ${
            isCartClosing ? "animate-slide-out-right" : "animate-slide-in-right"
          }`}
        >
          {/* Header del carrito */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">CARRITO DE COMPRAS</h2>
            <button
              onClick={handleCloseCart}
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

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">
                  Tu carrito está vacío
                </p>
                <p className="text-gray-400 text-sm">
                  Agrega productos para comenzar tu compra
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => {
                  // Verificar que el producto existe antes de renderizar
                  if (!item.product) {
                    console.warn('Cart item missing product data:', item);
                    return null;
                  }
                  
                  return (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      className="flex gap-4 pb-4 border-b animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name || "Producto"}
                          fill
                          className="object-cover"
                        />
                      </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Talla: {item.size}
                      </p>
                      <div className="flex flex-col">
                        {isDiscountActive(item.product) ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                ${getCurrentPrice(item.product).toLocaleString("es-CO")}
                              </span>
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">
                                -{getDiscountPercentage(item.product)}% OFF
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              ${(item.product.original_price || getCurrentPrice(item.product)).toLocaleString("es-CO")}
                            </div>
                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                              💰 Ahorras: ${getSavingsAmount(item.product).toLocaleString("es-CO")}
                            </div>
                          </>
                        ) : (
                          <span className="text-lg font-medium">
                            ${getCurrentPrice(item.product).toLocaleString("es-CO")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.size)
                          }
                          className="text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer del carrito con total */}
          {cart.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="space-y-2">
                {backendSavings > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Ahorras</span>
                    <span>${backendSavings.toLocaleString("es-CO")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>${(backendTotal || getTotal()).toLocaleString("es-CO")}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className={`w-full cursor-pointer transition-all duration-300 ${
                  user 
                    ? 'bg-[#4a5a3f] hover:bg-[#3d4a34] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                    : 'bg-gray-400 cursor-not-allowed text-white'
                } py-4 px-6 rounded-1xl flex items-center justify-center gap-3 font-semibold`}
                disabled={!user}
              >
                {user ? (
                  <>
                    <span>Proceder al pago</span>
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                ) : (
                  <span className="font-medium">Iniciar sesión para pagar</span>
                )}
              </button>

              <button
                onClick={handleCloseCart}
                className="w-full border border-gray-300 py-3 font-medium hover:border-black transition-colors cursor-pointer "
              >
                SEGUIR COMPRANDO
              </button>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}
