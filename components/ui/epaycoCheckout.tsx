"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { getCurrentPrice } from "@/components/types/Product";
import { ShippingInfoType } from "@/components/types/Order";
import ShippingForm from "./shippingForm";
import { Lock } from "lucide-react";

// Declarar el objeto ePayco en el window
declare global {
  interface Window {
    ePayco: any;
  }
}

interface EpaycoCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EpaycoCheckout({
  isOpen,
  onClose,
  onSuccess,
}: EpaycoCheckoutProps) {
  const { user } = useAuthContext();
  const { cart, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epaycoLoaded, setEpaycoLoaded] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoType | null>(null);
  
  const SHIPPING_COST = 15000; // Costo fijo de envío (puedes hacerlo variable después)

  // Cargar el script de ePayco
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Verificar si ya está cargado
    if (window.ePayco) {
      setEpaycoLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout.js";
    script.async = true;
    script.onload = () => {
      setEpaycoLoaded(true);
    };
    script.onerror = () => {
      setError("Error al cargar ePayco. Por favor intenta nuevamente.");
    };

    document.body.appendChild(script);

    return () => {
      // No remover el script para evitar recargarlo múltiples veces
    };
  }, []);

  const handleShippingSubmit = (shipping: ShippingInfoType) => {
    setShippingInfo(shipping);
    setStep('payment');
  };

  const handleBackToShipping = () => {
    setStep('shipping');
  };

  const handlePayment = async () => {
    if (!user) {
      setError("Debes iniciar sesión para realizar el pago");
      return;
    }

    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    if (!shippingInfo) {
      setError("Debes completar la información de envío");
      setStep('shipping');
      return;
    }

    if (!epaycoLoaded || !window.ePayco) {
      setError("ePayco no está disponible. Por favor recarga la página.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Calcular totales
      const subtotal = getTotal();
      const tax = Math.round(subtotal * 0.19); // IVA del 19%
      const total = subtotal + tax + SHIPPING_COST;

      // Crear la orden en la base de datos
      const orderResponse = await fetch("/api/epayco/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          user_phone: user.user_metadata?.phone || "",
          shipping_info: shippingInfo,
          items: cart,
          subtotal,
          tax,
          shipping_cost: SHIPPING_COST,
          total,
          payment_method: "epayco",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Error al crear la orden");
      }

      const { order } = await orderResponse.json();

      // Preparar descripción de productos
      const productNames = cart
        .map((item) => `${item.product.name} (${item.size}) x${item.quantity}`)
        .join(", ");

      const description =
        productNames.length > 200
          ? productNames.substring(0, 197) + "..."
          : productNames;

      // Configurar el checkout de ePayco
      const handler = window.ePayco.checkout.configure({
        key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY,
        test: process.env.NODE_ENV === "development", // true para pruebas
      });

      const data = {
        // Información del producto
        name: "Compra en Mattelsa",
        description: description,
        invoice: order.id,
        currency: "cop",
        amount: total.toString(),
        tax_base: subtotal.toString(),
        tax: tax.toString(),
        country: "co",
        lang: "es",

        // URLs de respuesta
        external: "false",
        confirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/epayco/confirm`,
        response: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?order_id=${order.id}`,

        // Información del cliente (usar datos de envío)
        name_billing: shippingInfo.full_name,
        type_doc_billing: shippingInfo.document_type,
        number_doc_billing: shippingInfo.document_number,
        email_billing: shippingInfo.email,
        mobilephone_billing: shippingInfo.phone,
        address_billing: shippingInfo.address,

        // Campos extra para tracking
        extra1: order.id,
        extra2: user.id,
        extra3: cart.length.toString(),

        // Método de respuesta
        methodsDisable: [], // Vacío para mostrar todos los métodos
      };

      // Abrir el checkout
      handler.open(data);

      // NO limpiar el carrito aquí - solo cuando el pago sea exitoso
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Error procesando pago:", err);
      setError(err.message || "Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-slide-in-up">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {step === 'shipping' ? 'Información de Envío' : 'Pagar con ePayco'}
              </h2>
              {step === 'payment' && (
                <button
                  onClick={handleBackToShipping}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  ← Volver a envío
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
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

        <div className="p-6">
          {step === 'shipping' ? (
            <ShippingForm
              onSubmit={handleShippingSubmit}
              onCancel={onClose}
              initialData={shippingInfo || {
                full_name: user?.user_metadata?.full_name || "",
                phone: user?.user_metadata?.phone || "",
                email: user?.email || "",
                document_number: user?.user_metadata?.document || "",
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Información de envío */}
              {shippingInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-green-900">📦 Envío a:</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>{shippingInfo.full_name}</strong></p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.neighborhood && `${shippingInfo.neighborhood}, `}{shippingInfo.city}, {shippingInfo.department}</p>
                    <p>Tel: {shippingInfo.phone}</p>
                  </div>
                </div>
              )}

              {/* Resumen de la compra */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Resumen de tu compra</h3>
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.product.name} ({item.size}) x{item.quantity}
                      </span>
                      <span className="font-medium">
                        $
                        {(
                          getCurrentPrice(item.product) * item.quantity
                        ).toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${getTotal().toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium">
                        ${SHIPPING_COST.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (19%)</span>
                      <span className="font-medium">
                        ${Math.round(getTotal() * 0.19).toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Total</span>
                      <span>
                        $
                        {(getTotal() + Math.round(getTotal() * 0.19) + SHIPPING_COST).toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Métodos de pago disponibles:</strong>
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Tarjetas de crédito y débito</li>
                  <li>✓ PSE (Transferencia bancaria)</li>
                  <li>✓ Pago en efectivo (Baloto, Efecty, etc.)</li>
                  <li>✓ Corresponsal Bancolombia</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handleBackToShipping}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:border-black transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !epaycoLoaded}
                  className="flex-1 px-4 py-3 bg-[#4a5a3f] text-white rounded-lg font-medium hover:bg-[#3d4a34] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Procesando...
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Pagar Ahora
                    </>
                  )}
                </button>
              </div>

              {/* Seguridad */}
              <div className="text-center">
              <div className="flex items-center justify-center gap-2 pt-2">
                    <Lock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Pago seguro procesado por</span>
                    <img 
                      src="/logoEpayco.png" 
                      alt="ePayco" 
                      className="h-5 w-auto"
                    />
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

