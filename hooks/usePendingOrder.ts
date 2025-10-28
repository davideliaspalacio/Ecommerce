"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

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

interface PendingOrderResponse {
  order: PendingOrder | null;
  expires_at: string | null;
  expires_in_minutes: number | null;
  is_expired: boolean;
}

interface UsePendingOrderReturn {
  pendingOrder: PendingOrder | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number | null;
  isExpired: boolean;
  checkPendingOrder: () => Promise<void>;
  cancelPendingOrder: () => Promise<boolean>;
  clearError: () => void;
}

export function usePendingOrder(): UsePendingOrderReturn {
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  // Función para calcular tiempo restante
  const calculateTimeRemaining = useCallback((expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = Math.max(0, expires - now);
    
    if (remaining === 0) {
      setIsExpired(true);
      return 0;
    }
    
    setIsExpired(false);
    return remaining;
  }, []);

  // Función para verificar orden pendiente
  const checkPendingOrder = useCallback(async () => {
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPendingOrder();
      
      if (response.success && response.data) {
        const data: PendingOrderResponse = response.data;
        
        // Verificar si hay orden pendiente
        if (data.order && !data.is_expired) {
          setPendingOrder(data.order);
          setIsExpired(false);
          
          // Calcular tiempo restante usando expires_at
          if (data.expires_at) {
            const remaining = calculateTimeRemaining(data.expires_at);
            setTimeRemaining(remaining);
          } else {
            setTimeRemaining(null);
          }
        } else {
          // No hay orden pendiente o está expirada
          setPendingOrder(null);
          setTimeRemaining(null);
          setIsExpired(data.is_expired || false);
        }
      } else {
        setPendingOrder(null);
        setTimeRemaining(null);
        setIsExpired(false);
      }
    } catch (err) {
      console.error('Error checking pending order:', err);
      setError('Error al verificar orden pendiente');
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, [calculateTimeRemaining]);

  // Función para cancelar orden pendiente
  const cancelPendingOrder = useCallback(async (): Promise<boolean> => {
    if (!pendingOrder) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.cancelPendingOrder();
      
      if (response.success) {
        setPendingOrder(null);
        setTimeRemaining(null);
        setIsExpired(false);
        return true;
      } else {
        setError(response.error || 'Error al cancelar la orden');
        return false;
      }
    } catch (err) {
      console.error('Error canceling pending order:', err);
      setError('Error al cancelar la orden');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pendingOrder]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efecto para actualizar el tiempo restante cada segundo
  useEffect(() => {
    if (!pendingOrder || isExpired) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Necesitamos obtener el expires_at de la respuesta original
    // Por ahora, vamos a verificar la orden cada 30 segundos para actualizar el tiempo
    intervalRef.current = setInterval(async () => {
      await checkPendingOrder();
    }, 30000); // Verificar cada 30 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingOrder, isExpired, checkPendingOrder]);

  // Efecto para verificar orden pendiente al montar el componente
  useEffect(() => {
    checkPendingOrder();
  }, [checkPendingOrder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    pendingOrder,
    isLoading,
    error,
    timeRemaining,
    isExpired,
    checkPendingOrder,
    cancelPendingOrder,
    clearError,
  };
}
