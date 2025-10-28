"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Clock, AlertTriangle, X, ShoppingCart, Timer } from 'lucide-react';
import CartLoadingSpinner from './CartLoadingSpinner';
import ConfirmModal from './ConfirmModal';

interface PendingOrder {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    variant_id: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  epayco_transaction_id: string | null;
  epayco_ref_payco: string | null;
  epayco_response: any | null;
  notes: string;
  created_at: string;
  updated_at: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_document_type: string;
  shipping_document_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_department: string;
  shipping_postal_code: string;
  shipping_neighborhood: string;
  shipping_additional_info: string;
  shipping_cost: number;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  internal_notes: string | null;
  customer_notes: string | null;
  stock_processed: boolean;
}

interface PendingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: () => Promise<void>;
  onContinueOrder: () => void;
  pendingOrder: PendingOrder | null;
  timeRemaining: number | null;
  isExpired: boolean;
  isLoading: boolean;
}

const PendingOrderModal = memo(function PendingOrderModal({
  isOpen,
  onClose,
  onCancelOrder,
  onContinueOrder,
  pendingOrder,
  timeRemaining,
  isExpired,
  isLoading
}: PendingOrderModalProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Update local timer for smooth countdown
  useEffect(() => {
    if (timeRemaining !== null) {
      setLocalTimeRemaining(timeRemaining);
      
      const interval = setInterval(() => {
        setLocalTimeRemaining(prev => {
          if (prev === null || prev <= 1000) {
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancelClick = useCallback(() => {
    setShowConfirmCancel(true);
  }, []);

  const handleConfirmCancelOrder = useCallback(async () => {
    setShowConfirmCancel(false);
    setIsCancelling(true);
    try {
      await onCancelOrder();
      router.push('/');
    } finally {
      setIsCancelling(false);
    }
  }, [onCancelOrder, router]);

  const handleContinueOrder = useCallback(() => {
    onContinueOrder();
  }, [onContinueOrder]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen || !pendingOrder) return null;

  return (
    <>
      {/* Modal principal de orden pendiente */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              {isExpired ? (
                <AlertTriangle className="h-12 w-12 text-red-500" />
              ) : (
                <Clock className="h-12 w-12 text-[#4a5a3f]" />
              )}
            </div>
            <CardTitle className="text-xl">
              {isExpired ? 'Orden Expirada' : 'Orden Pendiente'}
            </CardTitle>
            <CardDescription>
              {isExpired 
                ? 'Tu orden anterior ha expirado y ha sido cancelada automáticamente.'
                : 'Tienes una orden pendiente de pago. Debes completarla o cancelarla antes de crear una nueva orden.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Información de la orden */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Orden #{pendingOrder.id.slice(-8)}</span>
                <Badge 
                  variant={isExpired ? "destructive" : "default"}
                  className={!isExpired ? "bg-[#4a5a3f] text-white hover:bg-[#3d4a34]" : ""}
                >
                  {isExpired ? 'Expirada' : 'Pendiente'}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total: ${(pendingOrder.total || 0).toLocaleString('es-CO')}</p>
                <p>Items: {pendingOrder.items?.length || 0}</p>
                <p>Creada: {pendingOrder.created_at ? new Date(pendingOrder.created_at).toLocaleString('es-CO') : 'N/A'}</p>
              </div>
            </div>

            {/* Tiempo restante */}
            {!isExpired && (localTimeRemaining !== null || timeRemaining) && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="h-5 w-5 text-[#4a5a3f]" />
                  <div className="text-2xl font-bold text-[#4a5a3f]">
                    {formatTime(localTimeRemaining || timeRemaining || 0)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Tiempo restante para completar el pago
                </p>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#4a5a3f] h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((localTimeRemaining || timeRemaining || 0) / (30 * 60 * 1000)) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-2">
              {!isExpired ? (
                <>
                  <Button
                    onClick={handleContinueOrder}
                    className="w-full bg-[#4a5a3f] hover:bg-[#3d4a34] text-white cursor-pointer"
                    disabled={isLoading}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Continuar con esta orden
                  </Button>
                  
                  <Button
                    onClick={handleCancelClick}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                    disabled={isLoading || isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <CartLoadingSpinner size="sm" />
                        <span className="ml-2">Cancelando...</span>
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar esta orden
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleClose}
                  className="w-full bg-[#4a5a3f] hover:bg-[#3d4a34] text-white"
                >
                  Entendido, crear nueva orden
                </Button>
              )}
            </div>

            {/* Información adicional */}
            <div className="text-xs text-gray-500 text-center">
              {!isExpired ? (
                <p>
                  Si no completas el pago en el tiempo restante, la orden se cancelará automáticamente.
                </p>
              ) : (
                <p>
                  Puedes crear una nueva orden con los productos que desees.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmación para cancelar */}
      <ConfirmModal
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancelar Orden"
        message="¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar orden"
        cancelText="No, continuar"
        isDestructive={true}
      />
    </>
  );
});

export default PendingOrderModal;