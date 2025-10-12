"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
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

interface OrderDetailsModalProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string, notes?: string) => void;
  onSendMessage: (orderId: string, message: string) => void;
  onAddShipping: (orderId: string, trackingData: any) => void;
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

  // Auto-refresh cada 30 segundos cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      if (order) {
        fetchOrderDetails(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, order]);

  const fetchOrderDetails = async (isRefresh = false) => {
    if (!order) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch status history
      const { data: history } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      // Fetch communications
      const { data: comms } = await supabase
        .from("order_communications")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      // Fetch shipping info
      const { data: shipping } = await supabase
        .from("shipping_tracking")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a5a3f]"></div>
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
                  <div>
                    <h4 className="font-medium mb-3">Cambiar Estado</h4>
                    <div className="space-y-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                      >
                        <option value="">Seleccionar nuevo estado</option>
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
                      <textarea
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Notas adicionales (opcional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                        rows={2}
                      />
                      <button
                        onClick={async () => {
                          if (newStatus) {
                            await onStatusUpdate(order.id, newStatus, statusNotes);
                            setNewStatus("");
                            setStatusNotes("");
                            // Actualizar solo los datos del modal
                            fetchOrderDetails(true);
                          }
                        }}
                        disabled={!newStatus}
                        className="w-full px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Actualizar Estado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="font-medium mb-4">Historial de Estados</h4>
                  {statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {statusHistory.map((entry, index) => {
                        const entryStatusInfo = getStatusInfo(entry.status);
                        const EntryIcon = entryStatusInfo.icon;
                        return (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 ${entryStatusInfo.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <EntryIcon className={`w-4 h-4 ${entryStatusInfo.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${entryStatusInfo.color}`}>
                                  {entryStatusInfo.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(entry.created_at).toLocaleDateString("es-CO", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay historial de estados</p>
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
                    className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  >
                    {communications.length > 0 ? (
                      <>
                        {communications.map((comm, index) => (
                          <div key={index} className={`p-4 rounded-lg shadow-sm ${
                            comm.is_internal 
                              ? 'bg-blue-50 border-l-4 border-blue-400' 
                              : 'bg-gray-50 border-l-4 border-gray-400'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <MessageCircle className={`w-4 h-4 ${
                                  comm.is_internal ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  comm.is_internal ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                                  {comm.is_internal ? 'Mensaje Interno' : 'Mensaje al Cliente'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(comm.created_at).toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{comm.message}</p>
                          </div>
                        ))}
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
                              await onSendMessage(order.id, newMessage.trim());
                              setNewMessage("");
                              // Actualizar solo los datos del modal
                              fetchOrderDetails(true);
                            }
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">Ctrl + Enter para enviar</p>
                        <button
                          onClick={async () => {
                            if (newMessage.trim()) {
                              await onSendMessage(order.id, newMessage.trim());
                              setNewMessage("");
                              // Actualizar solo los datos del modal
                              fetchOrderDetails(true);
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
                <div className="space-y-4">
                  <h4 className="font-medium mb-4">Información de Envío</h4>
                  {shippingInfo.length > 0 ? (
                    <div className="space-y-3">
                      {shippingInfo.map((info, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {info.carrier}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(info.created_at).toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Número de seguimiento:</span> {info.tracking_number}</p>
                            {info.carrier_service && (
                              <p><span className="font-medium">Servicio:</span> {info.carrier_service}</p>
                            )}
                            {info.estimated_delivery && (
                              <p><span className="font-medium">Entrega estimada:</span> {new Date(info.estimated_delivery).toLocaleDateString("es-CO")}</p>
                            )}
                            {info.notes && (
                              <p><span className="font-medium">Notas:</span> {info.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay información de envío</p>
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
                    <button
                      onClick={async () => {
                        if (trackingData.tracking_number && trackingData.carrier) {
                          await onAddShipping(order.id, trackingData);
                          setTrackingData({
                            tracking_number: "",
                            carrier: "",
                            carrier_service: "",
                            estimated_delivery: "",
                            notes: ""
                          });
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
