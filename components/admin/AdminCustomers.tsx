"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import AdminRouteGuard from "./AdminRouteGuard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api-client";

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: any;
  city?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  created_at: string;
  updated_at: string;
  last_login?: string;
  email_verified: boolean;
  phone_verified: boolean;
  birth_date?: string;
  gender?: string;
  preferences?: any;
  metadata?: any;
  // Campos calculados para la UI
  ordersCount?: number;
  totalSpent?: number;
  lastOrder?: string;
}

export default function AdminCustomers() {
  const { profile } = useAuthContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Obtener datos reales de usuarios desde el backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        const response = await apiClient.getAdminCustomers();

        if (!response.success) {
          alert('Error al cargar los usuarios: ' + response.error);
          return;
        }

        setCustomers(response.data || []);
      } catch (error) {
        alert('Error al cargar los usuarios: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleStatusChange = async (customerId: string, newStatus: Customer['status']) => {
    try {
      // Esta funcionalidad se maneja en el backend
      // Por ahora, solo actualizar el estado local
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, status: newStatus } : customer
      ));
    } catch (error) {
      alert('Error al actualizar el estado del cliente: ' + (error as Error).message);
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending_verification': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return 'Suspendido';
      case 'pending_verification': return 'Pendiente de verificación';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredCustomers = customers.filter(customer => {
    const statusMatch = statusFilter === "all" || customer.status === statusFilter;
    const searchMatch = searchTerm === "" || 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
    return statusMatch && searchMatch;
  });


  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando clientes..." fullScreen />
  }

  return (
    <AdminRouteGuard>
      <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label 
            className="text-sm font-medium text-gray-600 hover:text-[#4a5a3f] cursor-pointer transition-colors" 
            onClick={() => window.location.href = "/admin"}
          >
            ← Volver al Dashboard
          </label>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
        </div>
        <div className="text-sm text-gray-500">
          Administrar base de datos de clientes
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Inactivos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {customers.filter(c => c.status === 'inactive').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-md flex items-center justify-center">
              <span className="text-2xl">⏸️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-md shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar cliente:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, email o teléfono..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
            />
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
              <option value="pending_verification">Pendientes de verificación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-md shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Órdenes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#4a5a3f] rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cliente desde {formatDate(customer.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone || 'Sin teléfono'}</div>
                    <div className="text-sm text-gray-500">{customer.city || 'Sin ciudad'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.ordersCount} orden{customer.ordersCount !== 1 ? 'es' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(customer.totalSpent || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={customer.status}
                      onChange={(e) => handleStatusChange(customer.id, e.target.value as Customer['status'])}
                      className={`text-xs font-semibold rounded-md px-3 py-1 border-0 focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer ${getStatusColor(customer.status)}`}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="suspended">Suspendido</option>
                      <option value="pending_verification">Pendiente de verificación</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrder ? formatDate(customer.lastOrder) : 'Sin órdenes'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-[#4a5a3f] hover:text-[#3d4a34] cursor-pointer"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles del Cliente
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#4a5a3f] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedCustomer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedCustomer.full_name}</h4>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                  <p className="text-sm text-gray-500">Cliente desde {formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Información de Contacto</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.phone || 'Sin teléfono'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ciudad</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.city || 'Sin ciudad'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCustomer.address?.street || 'Sin dirección'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rol</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedCustomer.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Verificado</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCustomer.email_verified ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Historial de Compras</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Total de Órdenes</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.ordersCount || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Total Gastado</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(selectedCustomer.totalSpent || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Estado del Cliente</h5>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCustomer.status)}`}>
                  {getStatusText(selectedCustomer.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminRouteGuard>
  );
}
