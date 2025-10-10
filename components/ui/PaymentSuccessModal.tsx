"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Package, CreditCard, Calendar, ExternalLink, X } from "lucide-react";
import { Button } from "./button";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCart: () => void;
  data: {
    ref_payco: number;
    transaction_id: string;
    authorization: string;
    estado: string;
    respuesta: string;
    order_id: string;
    cardTokenId?: string;
    customerId?: string;
  };
  total: number;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  onClearCart,
  data,
  total,
}: PaymentSuccessModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('🎊 Modal de éxito abriendo...', { data, total });
      // Delay para animación
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen, data, total]);

  if (!isOpen) {
    console.log('❌ Modal no está abierto');
    return null;
  }

  console.log('✅ Renderizando modal...', { isOpen, data, total });

  const handleViewOrder = () => {
    console.log('🛒 Limpiando carrito antes de ver pedido...');
    onClearCart();
    window.location.href = `/my-orders/${data.order_id}`;
  };

  const handleClose = () => {
    console.log('🛒 Limpiando carrito antes de cerrar...');
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Modal simple para debug */}
      <div className="relative bg-white rounded-1xl shadow-2xl max-w-md w-full p-6">

        {/* Header simple */}
        <div className="text-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso! 
          </h2>
          <p className="text-gray-600">
            Tu compra ha sido procesada correctamente
          </p>
        </div>

        {/* Content simple */}
        <div className="space-y-4">
          {/* Amount */}
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Monto pagado</p>
            <p className="text-3xl font-bold text-gray-900">
              ${total.toLocaleString('es-CO')} COP
            </p>
          </div>

          {/* Transaction details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Referencia:</span>
              <span className="font-semibold">{data.ref_payco}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Orden:</span>
              <span className="font-mono text-sm">{data.order_id.split('-')[0]}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className="text-[#4a5a3f] font-semibold">{data.respuesta}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleViewOrder}
              className="w-full !bg-[#4a5a3f] !hover:bg-[#3d4a34] text-white font-semibold py-3 rounded-1xl cursor-pointer"
            >
              Ver estado de mi pedido
            </Button>

            <div className="grid grid-cols-1 gap-3">

              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

