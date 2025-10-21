import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { OrderCommunicationType, ShippingTrackingType, OrderStatusHistoryType } from '@/components/types/Order';

export function useOrderTracking(orderId: string, userId: string) {
  const [communications, setCommunications] = useState<OrderCommunicationType[]>([]);
  const [shippingTracking, setShippingTracking] = useState<ShippingTrackingType | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch communications, shipping tracking, and status history
      const [commResponse, trackingResponse, statusResponse] = await Promise.all([
        apiClient.getOrderCommunications(orderId),
        apiClient.getOrderTracking(orderId),
        apiClient.getOrderStatusTimeline(orderId)
      ]);

      if (!commResponse.success) {
        throw new Error(commResponse.error || 'Error al cargar comunicaciones');
      }

      if (!trackingResponse.success) {
        throw new Error(trackingResponse.error || 'Error al cargar seguimiento');
      }

      if (!statusResponse.success) {
        throw new Error(statusResponse.error || 'Error al cargar historial de estados');
      }

      // El endpoint de comunicaciones devuelve { data: [...] }
      const communicationsData = Array.isArray(commResponse.data) 
        ? commResponse.data 
        : commResponse.data?.data || [];
      console.log('Communications response:', commResponse);
      console.log('Communications data:', communicationsData);
      
      // Ordenar mensajes por fecha de creación (más antiguos primero)
      const sortedCommunications = communicationsData
        .map((comm: any) => ({
          ...comm,
          read_at: comm.read_at || undefined
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      setCommunications(sortedCommunications);

      // El endpoint de tracking devuelve un array directamente
      const trackingData = Array.isArray(trackingResponse.data) 
        ? trackingResponse.data[0] || null 
        : trackingResponse.data;
      console.log('Tracking response:', trackingResponse);
      console.log('Tracking data:', trackingData);
      setShippingTracking(trackingData);

      // El endpoint de status timeline devuelve un array directamente
      const statusData = Array.isArray(statusResponse.data) ? statusResponse.data : [];
      console.log('Status response:', statusResponse);
      console.log('Status data:', statusData);
      setStatusHistory(statusData);
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error al cargar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, attachments?: any) => {
    try {
      const response = await apiClient.sendOrderMessage(orderId, message, false, attachments);
      
      if (response.success && response.data) {
        const convertedMessage = {
          ...response.data,
          read_at: response.data.read_at || undefined
        };
        setCommunications(prev => [...prev, convertedMessage]);
        return { success: true, data: convertedMessage };
      } else {
        return { success: false, error: response.error || 'Error al enviar mensaje' };
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  };


  useEffect(() => {
    if (orderId && userId) {
      fetchTrackingData();
    }
  }, [orderId, userId]);

  return {
    communications,
    shippingTracking,
    statusHistory,
    loading,
    error,
    fetchTrackingData,
    sendMessage
  };
}
