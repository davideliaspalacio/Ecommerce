"use client";

import { useState } from "react";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  MessageCircle, 
  Bell,
  Calendar,
  User,
  AlertCircle,
  XCircle,
  RotateCcw,
  Send
} from "lucide-react";

interface OrderTrackingProps {
  orderId: string;
  userId: string;
}

export default function OrderTracking({ orderId, userId }: OrderTrackingProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'messages' | 'shipping'>('timeline');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const {
    statusHistory,
    communications,
    shippingTracking,
    notifications,
    loading,
    error,
    markNotificationAsRead,
    sendMessage
  } = useOrderTracking(orderId, userId);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    const result = await sendMessage(newMessage.trim());
    
    if (result.success) {
      setNewMessage('');
    } else {
      alert('Error al enviar mensaje: ' + result.error);
    }
    
    setSendingMessage(false);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { 
        icon: Clock, 
        label: "Pendiente de Pago", 
        color: "text-yellow-600", 
        bgColor: "bg-yellow-50", 
        borderColor: "border-yellow-200",
        description: "Esperando confirmación de pago"
      },
      payment_approved: { 
        icon: CheckCircle, 
        label: "Pago Aprobado", 
        color: "text-green-600", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        description: "Pago confirmado, preparando pedido"
      },
      processing: { 
        icon: Package, 
        label: "En Preparación", 
        color: "text-blue-600", 
        bgColor: "bg-blue-50", 
        borderColor: "border-blue-200",
        description: "Tu pedido está siendo preparado"
      },
      ready_to_ship: { 
        icon: Package, 
        label: "Listo para Enviar", 
        color: "text-indigo-600", 
        bgColor: "bg-indigo-50", 
        borderColor: "border-indigo-200",
        description: "Pedido empacado y listo para envío"
      },
      shipped: { 
        icon: Truck, 
        label: "Enviado", 
        color: "text-purple-600", 
        bgColor: "bg-purple-50", 
        borderColor: "border-purple-200",
        description: "Tu pedido está en camino"
      },
      in_transit: { 
        icon: Truck, 
        label: "En Tránsito", 
        color: "text-orange-600", 
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200",
        description: "Pedido en camino a su destino"
      },
      delivered: { 
        icon: MapPin, 
        label: "Entregado", 
        color: "text-emerald-600", 
        bgColor: "bg-emerald-50", 
        borderColor: "border-emerald-200",
        description: "Pedido entregado exitosamente"
      },
      completed: { 
        icon: CheckCircle, 
        label: "Completado", 
        color: "text-green-600", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        description: "Orden completada satisfactoriamente"
      },
      failed: { 
        icon: XCircle, 
        label: "Fallido", 
        color: "text-red-600", 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200",
        description: "Hubo un problema con tu pedido"
      },
      cancelled: { 
        icon: XCircle, 
        label: "Cancelado", 
        color: "text-gray-600", 
        bgColor: "bg-gray-50", 
        borderColor: "border-gray-200",
        description: "Este pedido fue cancelado"
      },
      returned: { 
        icon: RotateCcw, 
        label: "Devuelto", 
        color: "text-amber-600", 
        bgColor: "bg-amber-50", 
        borderColor: "border-amber-200",
        description: "Pedido devuelto"
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getSenderInfo = (senderType: string) => {
    const senderMap = {
      customer: { label: "Tú", color: "text-blue-600", bgColor: "bg-blue-100" },
      admin: { label: "Soporte", color: "text-green-600", bgColor: "bg-green-100" },
      system: { label: "Sistema", color: "text-gray-600", bgColor: "bg-gray-100" }
    };
    return senderMap[senderType as keyof typeof senderMap] || senderMap.system;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-1xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-1xl shadow-sm p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Error al cargar el seguimiento</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-1xl shadow-sm overflow-hidden">
      {/* Header con tabs */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Seguimiento de Orden</h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-white text-[#4a5a3f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'messages'
                  ? 'bg-white text-[#4a5a3f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Mensajes
              {communications.filter(c => !c.is_read && c.sender_type === 'admin').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {communications.filter(c => !c.is_read && c.sender_type === 'admin').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'shipping'
                  ? 'bg-white text-[#4a5a3f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Envío
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="p-6">
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Timeline de estados */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Historial de Estados
              </h4>
              <div className="space-y-4">
                {statusHistory.map((status, index) => {
                  const statusInfo = getStatusInfo(status.status);
                  const Icon = statusInfo.icon;
                  const isLast = index === statusHistory.length - 1;
                  
                  return (
                    <div key={status.id} className="relative flex items-start">
                      {/* Línea vertical */}
                      {!isLast && (
                        <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      
                      {/* Icono */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${statusInfo.color}`} />
                      </div>
                      
                      {/* Contenido */}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {new Date(status.created_at).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {statusInfo.description}
                        </p>
                        {status.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{status.notes}"
                          </p>
                        )}
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {status.updated_by_type === 'admin' ? 'Soporte' : 
                             status.updated_by_type === 'customer' ? 'Tú' : 'Sistema'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notificaciones recientes */}
            {notifications.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notificaciones Recientes
                </h4>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${
                      notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Conversación
            </h4>
            
            {communications.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay mensajes aún</p>
                <p className="text-sm text-gray-400">Los mensajes aparecerán aquí cuando haya comunicación sobre tu orden</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {communications.map((comm) => {
                  const senderInfo = getSenderInfo(comm.sender_type);
                  const isCustomer = comm.sender_type === 'customer';
                  
                  return (
                    <div key={comm.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCustomer 
                          ? 'bg-[#4a5a3f] text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center mb-1">
                          <span className={`text-xs font-medium ${isCustomer ? 'text-blue-200' : senderInfo.color}`}>
                            {senderInfo.label}
                          </span>
                          <span className={`text-xs ml-2 ${isCustomer ? 'text-blue-200' : 'text-gray-500'}`}>
                            {new Date(comm.created_at).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comm.message}</p>
                        {comm.attachments && (
                          <div className="mt-2 text-xs opacity-75">
                            📎 Archivo adjunto
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input para enviar mensaje */}
            <div className="border-t pt-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Escribe un mensaje para contactar con el soporte sobre tu orden
              </p>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Información de Envío
            </h4>
            
            {!shippingTracking ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Información de envío no disponible</p>
                <p className="text-sm text-gray-400">Los detalles de envío aparecerán cuando tu pedido sea despachado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Número de Seguimiento</h5>
                    <p className="text-lg font-mono text-[#4a5a3f]">{shippingTracking.tracking_number}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Transportadora</h5>
                    <p className="text-lg text-gray-900">{shippingTracking.carrier}</p>
                  </div>
                </div>
                
                {shippingTracking.carrier_service && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Servicio</h5>
                    <p className="text-gray-900">{shippingTracking.carrier_service}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingTracking.estimated_delivery && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Fecha Estimada de Entrega</h5>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(shippingTracking.estimated_delivery).toLocaleDateString("es-CO", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                  
                  {shippingTracking.actual_delivery && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Fecha de Entrega</h5>
                      <p className="text-gray-900 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {new Date(shippingTracking.actual_delivery).toLocaleDateString("es-CO", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  )}
                </div>
                
                {shippingTracking.location && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Ubicación Actual</h5>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {shippingTracking.location}
                    </p>
                  </div>
                )}
                
                {shippingTracking.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Notas</h5>
                    <p className="text-gray-900">{shippingTracking.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
