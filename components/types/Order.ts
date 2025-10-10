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
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
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

