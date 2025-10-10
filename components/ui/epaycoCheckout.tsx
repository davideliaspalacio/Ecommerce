"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { getCurrentPrice } from "@/components/types/Product";
import { ShippingInfoType } from "@/components/types/Order";
import ShippingForm from "./shippingForm";
import CreditCardForm from "./CreditCardForm";
import { Lock } from "lucide-react";

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
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfoType | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const SHIPPING_COST = 15000; // Costo fijo de envío (puedes hacerlo variable después)

  const handleShippingSubmit = async (shipping: ShippingInfoType) => {
    setShippingInfo(shipping);
    
    // Crear la orden antes de mostrar el formulario de pago
    if (!user) {
      setError("Debes iniciar sesión para realizar el pago");
      return;
    }

    if (cart.length === 0) {
      setError("El carrito está vacío");
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
          shipping_info: shipping,
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
      setCreatedOrderId(order.id);
      
      // Avanzar al paso de pago
      setStep('payment');
    } catch (err: any) {
      console.error("Error creando orden:", err);
      setError(err.message || "Error al crear la orden");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToShipping = () => {
    setStep('shipping');
  };

  const handleCardSubmit = async (cardData: any) => {
    if (!createdOrderId || !shippingInfo) {
      setError("Error: No se encontró la orden");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Procesar el pago con los datos de la tarjeta
      const paymentResponse = await fetch("/api/epayco/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: createdOrderId,
          card_data: {
            card_number: cardData.card_number,
            card_exp_year: cardData.card_exp_year,
            card_exp_month: cardData.card_exp_month,
            card_cvc: cardData.card_cvc,
          },
          customer_data: {
            doc_type: cardData.doc_type,
            doc_number: cardData.doc_number,
            name: shippingInfo.full_name.split(' ')[0],
            last_name: shippingInfo.full_name.split(' ').slice(1).join(' ') || '',
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            cell_phone: shippingInfo.phone,
          },
          dues: '1', // Pago en una sola cuota
        }),
      });

      const result = await paymentResponse.json();
      
      console.log('Resultado del pago:', result);

      if (!result.success) {
        // Mostrar información de debug si está disponible
        const errorMessage = result.message || result.error || "Error procesando el pago";
        const errorDetails = result.details ? ` (${result.details})` : '';
        
        console.error('Error en el pago:', {
          error: result.error,
          message: result.message,
          details: result.details,
          debug: result.debug,
        });
        
        setError(errorMessage + errorDetails);
        return;
      }

      // Pago exitoso
      if (result.payment_status === 'approved') {
        // Limpiar el carrito
        clearCart();
        
        // Cerrar el modal y mostrar éxito
        onSuccess();
        
        // Redirigir a la página de éxito
        window.location.href = `/payment-success?order_id=${createdOrderId}&ref_payco=${result.data.ref_payco}`;
      } else if (result.payment_status === 'pending') {
        // Pago pendiente
        setError("Tu pago está pendiente de confirmación. Te notificaremos cuando se procese.");
        
        setTimeout(() => {
          window.location.href = `/my-orders/${createdOrderId}`;
        }, 2000);
      } else {
        // Pago rechazado
        setError(result.data?.respuesta || "El pago fue rechazado. Por favor verifica los datos de tu tarjeta.");
      }
    } catch (err: any) {
      console.error("Error procesando pago:", err);
      setError(err.message || "Error al procesar el pago. Por favor verifica tu conexión e intenta nuevamente.");
      
      // Log adicional para debugging
      console.error('Stack trace:', err.stack);
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
                {step === 'shipping' ? 'Información de Envío' : 'Pagar con Tarjeta'}
              </h2>
              {step === 'payment' && (
                <p className="text-sm text-gray-600 mt-1">
                  Pago seguro procesado por ePayco
                </p>
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h3 className="font-semibold text-sm mb-2 text-green-900">📦 Envío a:</h3>
                  <div className="text-xs text-green-800 space-y-1">
                    <p><strong>{shippingInfo.full_name}</strong></p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.neighborhood && `${shippingInfo.neighborhood}, `}{shippingInfo.city}, {shippingInfo.department}</p>
                  </div>
                </div>
              )}

              {/* Resumen de la compra */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-2">Resumen de tu compra</h3>
                <div className="space-y-1">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.size}-${index}`}
                      className="flex justify-between text-xs"
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
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${getTotal().toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium">
                        ${SHIPPING_COST.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">IVA (19%)</span>
                      <span className="font-medium">
                        ${Math.round(getTotal() * 0.19).toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold mt-2 border-t pt-2">
                      <span>Total a pagar</span>
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

              {/* Formulario de tarjeta */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Datos de la tarjeta</h3>
                <CreditCardForm
                  onSubmit={handleCardSubmit}
                  onCancel={handleBackToShipping}
                  isProcessing={isProcessing}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

