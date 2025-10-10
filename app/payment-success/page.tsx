"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/ui/header";
import FooterSection from "@/components/ui/footerSection";
import ShoppingCart from "@/components/ui/shoppingCart";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [cartCleared, setCartCleared] = useState(false);

  const orderId = searchParams.get("order_id");
  const refPayco = searchParams.get("ref_payco");

  useEffect(() => {
    if (!orderId && !refPayco) {
      setPaymentStatus("error");
      return;
    }

    // Verificar el estado del pago y actualizarlo desde ePayco
    const verifyPayment = async () => {
      try {
        // Obtener TODOS los parámetros de ePayco de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlRefPayco = urlParams.get('ref_payco') || refPayco;
        const urlOrderId = urlParams.get('order_id') || orderId;
        
        // Capturar todos los parámetros que ePayco puede devolver
        const epaycoParams = {
          ref_payco: urlParams.get('ref_payco'),
          x_ref_payco: urlParams.get('x_ref_payco'),
          x_transaction_id: urlParams.get('x_transaction_id'),
          x_response: urlParams.get('x_response'),
          x_approval_code: urlParams.get('x_approval_code'),
          x_cod_response: urlParams.get('x_cod_response'),
          x_response_reason_text: urlParams.get('x_response_reason_text'),
        };

        console.log('Parámetros de ePayco recibidos:', epaycoParams);
        
        // Si tenemos ref_payco, actualizar con la API
        const finalRefPayco = epaycoParams.ref_payco || epaycoParams.x_ref_payco;
        
        if (finalRefPayco) {
          console.log('Consultando ePayco con ref_payco:', finalRefPayco);
          const checkResponse = await fetch(
            `/api/epayco/check-payment?ref_payco=${finalRefPayco}`
          );

          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            console.log('Estado actualizado desde ePayco:', checkData);
          }
        } else if (urlOrderId) {
          // Si no hay ref_payco pero sí order_id, actualizar manualmente
          console.log('No hay ref_payco, actualizando con los parámetros de URL');
          
          // Determinar estado basado en x_response
          const xResponse = epaycoParams.x_response;
          if (xResponse) {
            let paymentStatus: 'approved' | 'pending' | 'rejected' = 'pending';
            let orderStatus: 'pending' | 'completed' | 'failed' = 'pending';

            if (xResponse === 'Aceptada') {
              paymentStatus = 'approved';
              orderStatus = 'completed';
            } else if (xResponse === 'Rechazada' || xResponse === 'Fallida') {
              paymentStatus = 'rejected';
              orderStatus = 'failed';
            }

            // Actualizar directamente
            await fetch('/api/epayco/update-order-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: urlOrderId,
                payment_status: paymentStatus,
                order_status: orderStatus,
                epayco_data: epaycoParams,
              }),
            });
          }
        }

        // Esperar un poco para que se actualice la base de datos
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Ahora verificar el estado de la orden
        const response = await fetch(
          `/api/epayco/verify?${urlOrderId ? `order_id=${urlOrderId}` : `ref_payco=${finalRefPayco}`}`
        );

        if (!response.ok) {
          throw new Error("Error verificando pago");
        }

        const data = await response.json();
        setOrderDetails(data.order);

        // Determinar el estado basado en la respuesta
        if (data.payment_status === "approved") {
          setPaymentStatus("success");
          // Solo limpiar el carrito si el pago fue aprobado y no se ha limpiado ya
          if (!cartCleared) {
            clearCart();
            setCartCleared(true);
          }
        } else if (data.payment_status === "pending") {
          setPaymentStatus("pending");
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("Error verificando pago:", error);
        setPaymentStatus("error");
      }
    };

    verifyPayment();
  }, [orderId, refPayco]);

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4a5a3f] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-24">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu compra.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="font-semibold mb-2">Detalles de la orden:</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Orden:</strong> #{orderDetails.id.substring(0, 8)}</p>
                <p><strong>Total:</strong> ${orderDetails.total.toLocaleString("es-CO")}</p>
                {orderDetails.epayco_ref_payco && (
                  <p><strong>Ref. ePayco:</strong> {orderDetails.epayco_ref_payco}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#4a5a3f] text-white py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
            >
              Volver al Inicio
            </Link>
            <button
              onClick={() => router.push("/")}
              className="block w-full border border-gray-300 py-3 rounded-lg font-medium hover:border-black transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-24">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pago Pendiente
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme la transacción.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="font-semibold mb-2">Detalles de la orden:</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Orden:</strong> #{orderDetails.id.substring(0, 8)}</p>
                <p><strong>Total:</strong> ${orderDetails.total.toLocaleString("es-CO")}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Nota:</strong> Tu carrito se mantendrá hasta que el pago sea confirmado.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/my-orders"
              className="block w-full bg-[#4a5a3f] text-white py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
            >
              Ver Mis Órdenes
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-center py-3 rounded-lg font-medium hover:border-black transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-24">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
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
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Error en el Pago
        </h1>
        
          <p className="text-gray-600 mb-6">
            Hubo un problema al procesar tu pago. Por favor intenta nuevamente o contacta a soporte.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>No te preocupes:</strong> Tu carrito sigue intacto. Puedes intentar nuevamente.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#4a5a3f] text-white py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
            >
              Volver al Inicio
            </Link>
            <button
              onClick={() => router.back()}
              className="block w-full border border-gray-300 py-3 rounded-lg font-medium hover:border-black transition-colors"
            >
              Intentar de Nuevo
            </button>
          </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#4a5a3f] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      <FooterSection />
      <ShoppingCart />
    </>
  );
}

