"use client";

import { useEffect, useState } from "react";
import { XCircle, CreditCard, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface PaymentErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
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

export default function PaymentErrorModal({
  isOpen,
  onClose,
  onRetry,
  data,
  total,
}: PaymentErrorModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('❌ Modal de error abriendo...', { data, total });
      // Delay para animación
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen, data, total]);

  if (!isOpen) {
    console.log('❌ Modal de error no está abierto');
    return null;
  }

  console.log('✅ Renderizando modal de error...', { isOpen, data, total });

  const handleRetry = () => {
    console.log('🔄 Reintentando pago...');
    onRetry();
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Modal de error */}
      <div className="relative bg-white rounded-1xl shadow-2xl max-w-md w-full p-6">
        {/* Header de error */}
        <div className="text-center mb-6">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pago Rechazado
          </h2>
          <p className="text-gray-600">
            No se pudo procesar tu pago
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Amount */}
          <div className="text-center bg-red-50 rounded-1xl p-4 border border-red-200">
            <p className="text-sm text-red-600 font-medium">Monto no procesado</p>
            <p className="text-3xl font-bold text-red-700">
              ${total.toLocaleString('es-CO')} COP
            </p>
          </div>

          {/* Error details */}
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
              <span className="text-red-600 font-semibold">{data.estado}</span>
            </div>
          </div>

          {/* Error message */}
          <div className="bg-red-50 border border-red-200 rounded-1xl p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Motivo del rechazo:</p>
                <p className="text-sm text-red-700 mt-1">{data.respuesta}</p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-1xl p-4">
            <p className="text-sm text-black font-medium mb-2"> Sugerencias:</p>
            <ul className="text-sm text-black space-y-1">
              <li>• Verifica los datos de tu tarjeta</li>
              <li>• Asegúrate de tener fondos suficientes</li>
              <li>• Contacta a tu banco si el problema persiste</li>
              <li>• Intenta con otra tarjeta de crédito</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleRetry}
              className="w-full !bg-[#4a5a3f] !hover:bg-[#3d4a34] text-white font-semibold py-3 rounded-1xl cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reintentar con otra tarjeta
            </Button>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

