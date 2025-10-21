"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  OrderType,
  OrderStatusHistoryType,
  OrderCommunicationType,
  ShippingTrackingType,
} from "@/components/types/Order";
import OrderDetailsModal from "./OrderDetailsModal";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Send,
  Plus,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await apiClient.getAdminOrders();

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar órdenes');
      }

      console.log("Orders fetched:", response.data?.length || 0);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shipping_full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      // Usar el endpoint que crea automáticamente el historial
      const response = await apiClient.changeOrderStatusAdmin(orderId, newStatus, notes);

      if (!response.success) {
        throw new Error(response.error || "Error al actualizar el estado");
      }

      console.log('Order status updated with history:', response.data);

      // Actualizar solo la orden específica en la lista local
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus as any,
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      // Actualizar la orden seleccionada si es la misma
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus as any,
                updated_at: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error al actualizar el estado");
    }
  };

  const sendMessageToCustomer = async (orderId: string, message: string) => {
    try {
      const response = await apiClient.sendAdminOrderMessage(orderId, message, false);

      if (!response.success) {
        throw new Error(response.error || "Error al enviar el mensaje");
      }

      // No necesitamos recargar toda la lista, el modal se actualizará solo
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar mensaje");
    }
  };

  const addShippingTracking = async (orderId: string, trackingData: any) => {
    try {
      const response = await apiClient.addShippingTracking(orderId, trackingData);

      if (!response.success) {
        throw new Error(response.error || "Error al agregar información de envío");
      }

      // No necesitamos recargar toda la lista, el modal se actualizará solo
    } catch (error) {
      console.error("Error adding shipping tracking:", error);
      alert("Error al agregar información de envío");
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        icon: Clock,
        label: "Pendiente",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      payment_approved: {
        icon: CheckCircle,
        label: "Pago Aprobado",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      processing: {
        icon: Package,
        label: "En Preparación",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      ready_to_ship: {
        icon: Package,
        label: "Listo para Enviar",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
      },
      shipped: {
        icon: Truck,
        label: "Enviado",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      in_transit: {
        icon: Truck,
        label: "En Tránsito",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      delivered: {
        icon: MapPin,
        label: "Entregado",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
      },
      completed: {
        icon: CheckCircle,
        label: "Completado",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      failed: {
        icon: XCircle,
        label: "Fallido",
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      cancelled: {
        icon: Ban,
        label: "Cancelado",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
      returned: {
        icon: RotateCcw,
        label: "Devuelto",
        color: "text-amber-600",
        bgColor: "bg-amber-100",
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const updateOrderInList = (updatedOrder: OrderType) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );

    // Actualizar la orden seleccionada si es la misma
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      payment_approved: orders.filter((o) => o.status === "payment_approved")
        .length,
      processing: orders.filter((o) => o.status === "processing").length,
      ready_to_ship: orders.filter((o) => o.status === "ready_to_ship").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      in_transit: orders.filter((o) => o.status === "in_transit").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      completed: orders.filter((o) => o.status === "completed").length,
      failed: orders.filter((o) => o.status === "failed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      returned: orders.filter((o) => o.status === "returned").length,
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <label
        className="text-sm font-medium text-gray-600 hover:text-[#4a5a3f] cursor-pointer transition-colors"
        onClick={() => (window.location.href = "/admin")}
      >
        ← Volver al Dashboard
      </label>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestión de Órdenes
        </h1>
        <p className="text-gray-600">
          Administra el estado y seguimiento de todas las órdenes
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-1xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por ID, email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro de estado */}
          <div className="lg:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent"
            >
              <option value="all">
                Todos los estados ({getStatusCounts().all})
              </option>
              <option value="pending">
                Pendiente ({getStatusCounts().pending})
              </option>
              <option value="payment_approved">
                Pago Aprobado ({getStatusCounts().payment_approved})
              </option>
              <option value="processing">
                En Preparación ({getStatusCounts().processing})
              </option>
              <option value="ready_to_ship">
                Listo para Enviar ({getStatusCounts().ready_to_ship})
              </option>
              <option value="shipped">
                Enviado ({getStatusCounts().shipped})
              </option>
              <option value="in_transit">
                En Tránsito ({getStatusCounts().in_transit})
              </option>
              <option value="delivered">
                Entregado ({getStatusCounts().delivered})
              </option>
              <option value="completed">
                Completado ({getStatusCounts().completed})
              </option>
              <option value="failed">
                Fallido ({getStatusCounts().failed})
              </option>
              <option value="cancelled">
                Cancelado ({getStatusCounts().cancelled})
              </option>
              <option value="returned">
                Devuelto ({getStatusCounts().returned})
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-1xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const Icon = statusInfo.icon;

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.length || 0} productos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.shipping_full_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {order.user_email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.shipping_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 bg-[#4a5a3f] text-white rounded-lg hover:bg-[#3d4a34] transition-colors cursor-pointer"
                        title="Ver detalles y gestionar"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay órdenes
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No se encontraron órdenes con los filtros aplicados"
                : "No hay órdenes en el sistema"}
            </p>
          </div>
        )}
      </div>

      {/* Modal unificado de detalles de orden */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onStatusUpdate={updateOrderStatus}
        onSendMessage={sendMessageToCustomer}
        onAddShipping={addShippingTracking}
        onOrderUpdate={updateOrderInList}
      />
    </div>
  );
}
