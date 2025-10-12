import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { OrderStatusHistoryType, OrderCommunicationType, ShippingTrackingType, OrderNotificationType } from '@/components/types/Order';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useOrderTracking(orderId: string, userId: string) {
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistoryType[]>([]);
  const [communications, setCommunications] = useState<OrderCommunicationType[]>([]);
  const [shippingTracking, setShippingTracking] = useState<ShippingTrackingType | null>(null);
  const [notifications, setNotifications] = useState<OrderNotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;

      // Fetch communications
      const { data: commData, error: commError } = await supabase
        .from('order_communications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (commError) throw commError;

      // Fetch shipping tracking
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (shippingError && shippingError.code !== 'PGRST116') throw shippingError;

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('order_notifications')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;

      setStatusHistory(historyData || []);
      setCommunications(commData || []);
      setShippingTracking(shippingData);
      setNotifications(notifData || []);
    } catch (error: any) {
      console.error('Error fetching tracking data:', error);
      setError(error.message || 'Error al cargar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('order_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const sendMessage = async (message: string, attachments?: any) => {
    try {
      const { data, error } = await supabase
        .from('order_communications')
        .insert({
          order_id: orderId,
          sender_id: userId,
          sender_type: 'customer',
          message,
          attachments,
          is_internal: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCommunications(prev => [...prev, data]);

      return { success: true, data };
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
    statusHistory,
    communications,
    shippingTracking,
    notifications,
    loading,
    error,
    fetchTrackingData,
    markNotificationAsRead,
    sendMessage
  };
}
