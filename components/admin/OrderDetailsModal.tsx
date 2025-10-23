"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { apiClient } from "@/lib/api-client";
import { OrderType, OrderStatusHistoryType, OrderCommunicationType, ShippingTrackingType } from "@/components/types/Order";
import { 
  XCircle, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  MessageCircle,
  Send,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin as LocationIcon,
  RefreshCw
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Función para obtener información del remitente
const getSenderInfo = (senderType: string) => {
  const senderMap = {
    customer: { label: "Cliente", color: "text-blue-600", bgColor: "bg-blue-100" },
    admin: { label: "Soporte", color: "text-green-600", bgColor: "bg-green-100" },
    system: { label: "Sistema", color: "text-gray-600", bgColor: "bg-gray-100" }
  };
  return senderMap[senderType as keyof typeof senderMap] || senderMap.system;
};

interface OrderDetailsModalProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string, notes?: string) => void;
  onSendMessage: (orderId: string, message: string) => void;
  onAddShipping: (orderId: string, trackingData: any, files?: File[]) => void;
  onOrderUpdate?: (updatedOrder: OrderType) => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  onSendMessage,
  onAddShipping,
  onOrderUpdate
}: OrderDetailsModalProps) {
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistoryType[]>([]);
  const [communications, setCommunications] = useState<OrderCommunicationType[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingTrackingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'messages' | 'shipping'>('details');
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [trackingData, setTrackingData] = useState({
    tracking_number: "",
    carrier: "",
    carrier_service: "",
    estimated_delivery: "",
    notes: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Refs para auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderDetails();
    }
  }, [isOpen, order]);

  // Auto-scroll para mensajes
  useEffect(() => {
    if (activeTab === 'messages' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communications, activeTab]);

  // Auto-refresh removido - usar botón de refresh manual

  const fetchOrderDetails = async (isRefresh = false) => {
    if (!order) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch status history using admin timeline endpoint
      const historyResponse = await apiClient.getAdminOrderStatusHistoryByOrder(order.id, 1, 100);
      console.log('Admin status history response:', historyResponse);
      
      // Manejar tanto formato paginado como array directo
      const history = historyResponse.success && historyResponse.data 
        ? (Array.isArray(historyResponse.data) ? historyResponse.data : historyResponse.data.data || [])
        : [];
      
      console.log('Admin status history data:', history);

      // Fetch communications
      const commsResponse = await apiClient.getAdminOrderCommunicationsByOrder(order.id, 1, 100);
      console.log('Admin communications response:', commsResponse);
      
      // Manejar tanto formato paginado como array directo
      const commsData = commsResponse.success && commsResponse.data 
        ? (Array.isArray(commsResponse.data) ? commsResponse.data : commsResponse.data.data || [])
        : [];
      
      const comms = commsData.map(comm => ({
        ...comm,
        read_at: comm.read_at || undefined
      }));
      
      console.log('Admin communications data:', comms);

      const shippingResponse = await apiClient.getOrderTracking(order.id);
      console.log('Shipping tracking response:', shippingResponse);
      
      const shipping = shippingResponse.success && shippingResponse.data 
        ? (Array.isArray(shippingResponse.data) ? shippingResponse.data : [shippingResponse.data])
        : [];
      
      console.log('Shipping tracking data:', shipping);
      console.log('Images in shipping data:', shipping.map(s => s.images));

      setStatusHistory(history || []);
      setCommunications(comms || []);
      setShippingInfo(shipping || []);
      
      // Si es una actualización automática, también actualizar la orden principal
      if (isRefresh && order && onOrderUpdate) {
        // Obtener la orden actualizada
        const { data: updatedOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("id", order.id)
          .single();
        
        if (updatedOrder) {
          onOrderUpdate(updatedOrder);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { icon: Clock, label: "Pendiente", color: "text-yellow-600", bgColor: "bg-yellow-100" },
      payment_approved: { icon: CheckCircle, label: "Pago Aprobado", color: "text-green-600", bgColor: "bg-green-100" },
      processing: { icon: Package, label: "En Preparación", color: "text-blue-600", bgColor: "bg-blue-100" },
      ready_to_ship: { icon: Package, label: "Listo para Enviar", color: "text-indigo-600", bgColor: "bg-indigo-100" },
      shipped: { icon: Truck, label: "Enviado", color: "text-purple-600", bgColor: "bg-purple-100" },
      in_transit: { icon: Truck, label: "En Tránsito", color: "text-orange-600", bgColor: "bg-orange-100" },
      delivered: { icon: MapPin, label: "Entregado", color: "text-emerald-600", bgColor: "bg-emerald-100" },
      completed: { icon: CheckCircle, label: "Completado", color: "text-green-600", bgColor: "bg-green-100" },
      failed: { icon: XCircle, label: "Fallido", color: "text-red-600", bgColor: "bg-red-100" },
      cancelled: { icon: XCircle, label: "Cancelado", color: "text-gray-600", bgColor: "bg-gray-100" },
      returned: { icon: Package, label: "Devuelto", color: "text-amber-600", bgColor: "bg-amber-100" }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  if (!isOpen || !order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-1xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Orden #{order.id.substring(0, 8).toUpperCase()}
              </h3>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.label}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchOrderDetails(true)}
                disabled={refreshing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'details', label: 'Detalles', icon: Package },
              { id: 'history', label: 'Historial', icon: Clock },
              { id: 'messages', label: 'Mensajes', icon: MessageCircle },
              { id: 'shipping', label: 'Envío', icon: Truck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#4a5a3f] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <img 
                src="/favicon.png" 
                alt="ENOUGHH" 
                className="w-8 h-8 animate-spin"
              />
            </div>
          ) : (
            <>
              {/* Detalles Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Información del cliente */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información del Cliente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Nombre:</span>
                        <p className="font-medium">{order.shipping_full_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {order.user_email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <p className="font-medium flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.shipping_phone}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Dirección:</span>
                        <p className="font-medium flex items-center">
                          <LocationIcon className="w-4 h-4 mr-1" />
                          {order.shipping_address}, {order.shipping_city}, {order.shipping_department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Productos
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-gray-600">
                              Talla: {item.size} | Cantidad: {item.quantity}
                            </p>
                            {item.product?.price && (
                              <p className="text-sm text-gray-500">
                                Precio unitario: ${item.product.price.toLocaleString("es-CO")}
                              </p>
                            )}
                          </div>
                          <p className="font-medium text-lg">
                            ${((item.product?.price || 0) * item.quantity).toLocaleString("es-CO")}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-[#4a5a3f] text-white rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total:</span>
                        <span className="text-2xl font-bold">
                          ${order.total.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cambiar estado */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Cambiar Estado</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).bgColor} ${getStatusInfo(order.status).color}`}>
                          Estado Actual: {getStatusInfo(order.status).label}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nuevo Estado
                        </label>
                        <select
                          value={newStatus || order.status}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent bg-white"
                        >
                          <option value={order.status} disabled>
                            Estado Actual: {getStatusInfo(order.status).label}
                          </option>
                          <option value="pending">Pendiente de Pago</option>
                          <option value="payment_approved">Pago Aprobado</option>
                          <option value="processing">En Preparación</option>
                          <option value="ready_to_ship">Listo para Enviar</option>
                          <option value="shipped">Enviado</option>
                          <option value="in_transit">En Tránsito</option>
                          <option value="delivered">Entregado</option>
                          <option value="completed">Completado</option>
                          <option value="failed">Fallido</option>
                          <option value="cancelled">Cancelado</option>
                          <option value="returned">Devuelto</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Selecciona un estado diferente al actual para actualizar la orden
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas Adicionales
                        </label>
                        <textarea
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          placeholder="Agrega notas sobre el cambio de estado (opcional)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent bg-white"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Las notas aparecerán en el historial de la orden
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={async () => {
                            if (newStatus && newStatus !== order.status) {
                              await onStatusUpdate(order.id, newStatus, statusNotes);
                              setNewStatus("");
                              setStatusNotes("");
                              // Actualizar solo los datos del modal
                              fetchOrderDetails(true);
                            }
                          }}
                          disabled={!newStatus || newStatus === order.status}
                          className="flex-1 px-6 py-3 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {newStatus && newStatus !== order.status ? 'Actualizar Estado' : 'Selecciona un estado diferente'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setNewStatus("");
                            setStatusNotes("");
                          }}
                          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial Tab */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Historial de Estados</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).bgColor} ${getStatusInfo(order.status).color}`}>
                        Estado Actual: {getStatusInfo(order.status).label}
                      </div>
                    </div>
                  </div>
                  
                  {statusHistory.length > 0 ? (
                    <div className="relative">
                      {/* Timeline vertical */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-6">
                        {statusHistory.map((entry, index) => {
                          const entryStatusInfo = getStatusInfo(entry.status);
                          const EntryIcon = entryStatusInfo.icon;
                          const isLast = index === statusHistory.length - 1;
                          
                          return (
                            <div key={index} className="relative flex items-start space-x-4">
                              {/* Icono del estado */}
                              <div className={`relative z-10 w-8 h-8 ${entryStatusInfo.bgColor} rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
                                <EntryIcon className={`w-4 h-4 ${entryStatusInfo.color}`} />
                              </div>
                              
                              {/* Contenido del historial */}
                              <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-semibold text-sm ${entryStatusInfo.color}`}>
                                      {entryStatusInfo.label}
                                    </span>
                                    {isLast && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Actual
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                      {new Date(entry.created_at).toLocaleDateString("es-CO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(entry.created_at).toLocaleTimeString("es-CO", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </div>
                                  </div>
                                </div>
                                
                                {entry.notes && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-700">{entry.notes}</p>
                                  </div>
                                )}
                                
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      entry.updated_by_type === 'admin' ? 'bg-blue-500' : 
                                      entry.updated_by_type === 'customer' ? 'bg-green-500' : 'bg-gray-500'
                                    }`}></div>
                                    <span className="text-xs text-gray-500">
                                      {entry.updated_by_type === 'admin' ? 'Actualizado por Soporte' : 
                                       entry.updated_by_type === 'customer' ? 'Actualizado por Cliente' : 'Actualizado por Sistema'}
                                    </span>
                                  </div>
                                  
                                  {entry.previous_status && (
                                    <div className="text-xs text-gray-400">
                                      Desde: {getStatusInfo(entry.previous_status).label}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial de estados</h3>
                      <p className="text-gray-500 mb-4">Los cambios de estado de la orden aparecerán aquí</p>
                      <p className="text-sm text-gray-400">El historial se actualiza automáticamente cuando cambias el estado</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mensajes Tab */}
              {activeTab === 'messages' && (
                <div className="space-y-4 h-[50vh] flex flex-col">
                  <h4 className="font-medium mb-4">Comunicaciones</h4>
                  
                  {/* Lista de mensajes con scroll */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  >
                    {communications.length > 0 ? (
                      <>
                        {communications.map((comm) => {
                          const senderInfo = getSenderInfo(comm.sender_type);
                          const isAdmin = comm.sender_type === 'admin';
                          
                          return (
                            <div key={comm.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                                isAdmin 
                                  ? 'bg-[#4a5a3f] text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <div className="flex items-center mb-2">
                                  <span className={`text-xs font-medium ${isAdmin ? 'text-blue-200' : senderInfo.color}`}>
                                    {isAdmin ? 'Soporte' : senderInfo.label}
                                  </span>
                                  <span className={`text-xs ml-2 ${isAdmin ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(comm.created_at).toLocaleDateString("es-CO", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed">{comm.message}</p>
                                {comm.attachments && (
                                  <div className="mt-2 text-xs opacity-75">
                                    📎 Archivo adjunto
                                  </div>
                                )}
                                {comm.is_internal && (
                                  <div className="mt-2 text-xs opacity-75">
                                    🔒 Mensaje interno
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No hay mensajes aún</p>
                        <p className="text-sm text-gray-400">Envía el primer mensaje al cliente</p>
                      </div>
                    )}
                  </div>

                  {/* Enviar mensaje - fijo en la parte inferior */}
                  <div className="bg-gray-50 rounded-lg p-4 border-t">
                    <h5 className="font-medium mb-3 flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje al Cliente
                    </h5>
                    <div className="space-y-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent resize-none"
                        rows={3}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            if (newMessage.trim()) {
                              try {
                                const response = await apiClient.sendAdminOrderMessage(order.id, newMessage.trim(), false);
                                if (response.success) {
                                  setNewMessage("");
                                  fetchOrderDetails(true);
                                } else {
                                  alert("Error al enviar el mensaje");
                                }
                              } catch (error) {
                                console.error("Error sending message:", error);
                                alert("Error al enviar el mensaje");
                              }
                            }
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">Ctrl + Enter para enviar</p>
                        <button
                          onClick={async () => {
                            if (newMessage.trim()) {
                              try {
                                const response = await apiClient.sendAdminOrderMessage(order.id, newMessage.trim(), false);
                                if (response.success) {
                                  setNewMessage("");
                                  fetchOrderDetails(true);
                                } else {
                                  alert("Error al enviar el mensaje");
                                }
                              } catch (error) {
                                console.error("Error sending message:", error);
                                alert("Error al enviar el mensaje");
                              }
                            }
                          }}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensaje
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Envío Tab */}
              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">Información de Envío</h4>
                    <div className="text-sm text-gray-500">
                      {shippingInfo.length} {shippingInfo.length === 1 ? 'registro' : 'registros'} de envío
                    </div>
                  </div>
                  
                  {shippingInfo.length > 0 ? (
                    <div className="space-y-4">
                      {shippingInfo.map((info, index) => (
                        <div key={info.id || index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-[#4a5a3f] rounded-full flex items-center justify-center">
                                <Truck className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{info.carrier}</h5>
                                <p className="text-sm text-gray-500">Registro #{index + 1}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(info.created_at).toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric"
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(info.created_at).toLocaleTimeString("es-CO", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Número de Seguimiento</label>
                                <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">{info.tracking_number}</p>
                              </div>
                              
                              {info.carrier_service && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio</label>
                                  <p className="text-sm">{info.carrier_service}</p>
                                </div>
                              )}
                              
                              {info.status && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
                                  <p className="text-sm">{info.status}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {info.estimated_delivery && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entrega Estimada</label>
                                  <p className="text-sm">{new Date(info.estimated_delivery).toLocaleDateString("es-CO")}</p>
                                </div>
                              )}
                              
                              {info.actual_delivery && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entrega Real</label>
                                  <p className="text-sm text-green-600 font-medium">{new Date(info.actual_delivery).toLocaleDateString("es-CO")}</p>
                                </div>
                              )}
                              
                              {info.location && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ubicación</label>
                                  <p className="text-sm">{info.location}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {info.status_description && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-md">
                              <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Descripción del Estado</label>
                              <p className="text-sm text-blue-900 mt-1">{info.status_description}</p>
                            </div>
                          )}
                          
                          {info.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Notas</label>
                              <p className="text-sm text-gray-900 mt-1">{info.notes}</p>
                            </div>
                          )}
                          
                          {(info as any).images && (info as any).images.length > 0 && (
                            <div className="mt-4">
                              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Imágenes</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                {(info as any).images.map((imageUrl: string, imgIndex: number) => (
                                  <img
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt={`Imagen de envío ${imgIndex + 1}`}
                                    className="w-full  object-contain rounded-lg"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>ID: {info.id.substring(0, 8)}...</span>
                              <span>Actualizado: {new Date(info.updated_at).toLocaleDateString("es-CO")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay información de envío</h3>
                      <p className="text-gray-500 mb-4">Los datos de seguimiento aparecerán aquí cuando se agreguen</p>
                      <p className="text-sm text-gray-400">Usa el formulario de abajo para agregar información de envío</p>
                    </div>
                  )}
                  {/* Agregar información de envío */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-3">Agregar Información de Envío</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Seguimiento
                        </label>
                        <input
                          type="text"
                          value={trackingData.tracking_number}
                          onChange={(e) => setTrackingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                          placeholder="Ej: 1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transportadora
                        </label>
                        <input
                          type="text"
                          value={trackingData.carrier}
                          onChange={(e) => setTrackingData(prev => ({ ...prev, carrier: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                          placeholder="Ej: Servientrega, Interrapidisimo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Servicio
                        </label>
                        <input
                          type="text"
                          value={trackingData.carrier_service}
                          onChange={(e) => setTrackingData(prev => ({ ...prev, carrier_service: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                          placeholder="Ej: Envío Express, Estándar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Estimada de Entrega
                        </label>
                        <input
                          type="date"
                          value={trackingData.estimated_delivery}
                          onChange={(e) => setTrackingData(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas
                      </label>
                      <textarea
                        value={trackingData.notes}
                        onChange={(e) => setTrackingData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                        rows={2}
                        placeholder="Notas adicionales sobre el envío"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imágenes (máximo 2 archivos)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 2) {
                            alert('Máximo 2 archivos permitidos');
                            return;
                          }
                          setSelectedFiles(files);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tipos permitidos: JPG, PNG, GIF, WEBP. Máximo 5MB por archivo.
                      </p>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Archivos seleccionados:</p>
                          <ul className="text-xs text-gray-500">
                            {selectedFiles.map((file, index) => (
                              <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (trackingData.tracking_number && trackingData.carrier) {
                          await onAddShipping(order.id, trackingData, selectedFiles);
                          setTrackingData({
                            tracking_number: "",
                            carrier: "",
                            carrier_service: "",
                            estimated_delivery: "",
                            notes: ""
                          });
                          setSelectedFiles([]);
                          // Actualizar solo los datos del modal
                          fetchOrderDetails(true);
                        }
                      }}
                      disabled={!trackingData.tracking_number || !trackingData.carrier}
                      className="mt-4 px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Agregar Información de Envío
                    </button>
                  </div>

                  {/* Lista de información de envío */}

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
