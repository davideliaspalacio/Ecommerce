import { CartItemType } from "./CartItem";

// Información de envío
export interface ShippingInfoType {
  full_name: string;
  phone: string;
  email: string;
  document_type: 'cc' | 'ce' | 'nit' | 'passport';
  document_number: string;
  address: string;
  city: string;
  department: string;
  postal_code?: string;
  neighborhood?: string;
  additional_info?: string;
  notes?: string;
}

export interface OrderType {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  user_phone?: string;
  
  // Información de envío
  shipping_full_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_document_type: string;
  shipping_document_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_department: string;
  shipping_postal_code?: string;
  shipping_neighborhood?: string;
  shipping_additional_info?: string;
  
  items: CartItemType[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'payment_approved' | 'processing' | 'ready_to_ship' | 'shipped' | 'in_transit' | 'delivered' | 'completed' | 'failed' | 'cancelled' | 'returned';
  payment_method: 'epayco' | 'whatsapp' | 'other';
  payment_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  epayco_transaction_id?: string;
  epayco_ref_payco?: string;
  epayco_response?: any;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateOrderType {
  user_id: string;
  user_email: string;
  user_name?: string;
  user_phone?: string;
  
  // Información de envío
  shipping_info: ShippingInfoType;
  
  items: CartItemType[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  payment_method: 'epayco' | 'whatsapp' | 'other';
  notes?: string;
}

// Historial de estados de la orden
export interface OrderStatusHistoryType {
  id: string;
  order_id: string;
  status: string;
  previous_status?: string;
  notes?: string;
  updated_by?: string;
  updated_by_type: 'customer' | 'admin' | 'system';
  created_at: string;
}

// Comunicaciones de la orden
export interface OrderCommunicationType {
  id: string;
  order_id: string;
  sender_id: string;
  sender_type: 'customer' | 'admin' | 'system';
  message: string;
  is_internal: boolean;
  is_read: boolean;
  read_at?: string;
  attachments?: any;
  created_at: string;
}

// Seguimiento de envío
export interface ShippingTrackingType {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  carrier_service?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  status?: string;
  status_description?: string;
  location?: string;
  notes?: string;
  images?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Notificaciones de la orden
export interface OrderNotificationType {
  id: string;
  order_id: string;
  user_id: string;
  notification_type: 'status_change' | 'message_received' | 'shipping_update' | 'delivery_confirmation';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  sent_via: 'app' | 'email' | 'sms';
  metadata?: any;
  created_at: string;
}

