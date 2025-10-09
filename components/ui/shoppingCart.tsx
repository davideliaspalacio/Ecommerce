import { useState } from "react";
import Image from "next/image";
import PurchaseVerification from "./purchaseVerification";
import AuthModal from "./authModal";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";

export default function ShoppingCart() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    getItemPrice,
  } = useCartStore();
  const {
    isPurchaseModalOpen,
    openPurchaseModal,
    closePurchaseModal,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useUIStore();
  const { user } = useAuthContext();
  const [isCartClosing, setIsCartClosing] = useState(false);
  const handleCloseCart = () => {
    setIsCartClosing(true);
    setTimeout(() => {
      closeCart();
      setIsCartClosing(false);
    }, 400);
  };

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "";

    const total = getTotal();
    let message = `¡Hola! Me interesa comprar los siguientes productos:\n\n`;

    cart.forEach((item, index) => {
      const finalPrice = getCurrentPrice(item.product);
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Talla: ${item.size}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${finalPrice.toLocaleString("es-CO")}\n\n`;
    });

    message += `💰 Total: $${total.toLocaleString("es-CO")}\n\n`;
    message += `¿Podrían ayudarme con esta compra?`;

    return encodeURIComponent(message);
  };
  const handleWhatsAppClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    const message = generateWhatsAppMessage();
    const phoneNumber = "573182600115";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");

    setTimeout(() => {
      openPurchaseModal();
    }, 1000);
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
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.size}-${index}`}
                    className="flex gap-4 pb-4 border-b animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
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
                              <span className="text-lg font-bold discount-price">
                                ${getCurrentPrice(item.product).toLocaleString("es-CO")}
                              </span>
                              <span className="px-2 py-1 discount-badge text-xs font-bold rounded-full">
                                -{getDiscountPercentage(item.product)}% OFF
                              </span>
                            </div>
                            <div className="text-sm original-price">
                              ${item.product.original_price?.toLocaleString("es-CO")}
                            </div>
                            <div className="text-xs savings-text font-medium">
                              Ahorras: ${getSavingsAmount(item.product).toLocaleString("es-CO")}
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
                ))}
              </div>
            )}
          </div>

          {/* Footer del carrito con total */}
          {cart.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>${getTotal().toLocaleString("es-CO")}</span>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#4a5a3f] text-white py-3 font-medium hover:bg-[#3d4a34] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {user
                    ? "FINALIZAR COMPRA POR WHATSAPP"
                    : "INICIAR SESIÓN PARA COMPRAR"}
                </span>
                {user ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                ) : null}
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
      <PurchaseVerification
        isOpen={isPurchaseModalOpen}
        onClose={closePurchaseModal}
        onPurchaseComplete={() => useCartStore.getState().clearCart()}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}
