"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { OrderType } from "@/components/types/Order";
import Link from "next/link";
import Header from "@/components/ui/header";
import FooterSection from "@/components/ui/footerSection";
import ShoppingCart from "@/components/ui/shoppingCart";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'cancelled'>('completed');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  // Animación de entrada desde abajo hacia arriba
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Filtrar órdenes cuando cambien los filtros
  useEffect(() => {
    let filtered = orders;

    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }

    setFilteredOrders(filtered);
  }, [orders, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError("Error al cargar tus órdenes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completado" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Fallido" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelado" },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-1xl text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const badges = {
      pending: { bg: "bg-blue-100", text: "text-blue-800", label: "Pendiente" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Aprobado" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rechazado" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelado" },
    };

    const badge = badges[paymentStatus as keyof typeof badges] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded-1xl text-xs font-medium ${badge.bg} ${badge.text}`}>
        💳 {badge.label}
      </span>
    );
  };

  const handleFilterChange = (newFilter: 'all' | 'completed' | 'pending' | 'failed' | 'cancelled') => {
    setFilter(newFilter);
  };

  const getFilterCounts = () => {
    return {
      all: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => o.status === 'pending').length,
      failed: orders.filter(o => o.status === 'failed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <section className="py-16 bg-gray-50 mt-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold">MIS ÓRDENES</h3>
            </div>
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-[#4a5a3f] rounded-full animate-spin"></div>
            </div>
          </div>
        </section>
        <FooterSection />
        <ShoppingCart />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <section className={`py-16 bg-gray-50 mt-20 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-16'
      }`}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className={`flex items-center justify-between mb-8 transition-all duration-1000 ease-out delay-200 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <div>
              <Link
                href="/"
                className="text-[#4a5a3f] hover:text-[#3d4a34] flex items-center gap-2 mb-4 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al inicio
              </Link>
              <h3 className="text-3xl font-bold">MIS ÓRDENES</h3>
              <p className="text-gray-600 mt-2 text-sm">
                Aquí puedes ver el estado de todos tus pedidos
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {filteredOrders.length > 0 && `${filteredOrders.length} ${filteredOrders.length === 1 ? 'orden' : 'órdenes'} mostradas`}
            </div>
          </div>

          {error && (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-6 transition-all duration-1000 ease-out delay-300 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Filtros */}
          {orders.length > 0 && (
            <div className={`bg-white rounded-1xl shadow-sm p-6 mb-6 transition-all duration-1000 ease-out delay-300 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filtrar por Estado
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Todas', count: getFilterCounts().all },
                    { key: 'completed', label: 'Completadas', count: getFilterCounts().completed },
                    { key: 'pending', label: 'Pendientes', count: getFilterCounts().pending },
                    { key: 'failed', label: 'Fallidas', count: getFilterCounts().failed },
                    { key: 'cancelled', label: 'Canceladas', count: getFilterCounts().cancelled },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => handleFilterChange(key as any)}
                      className={`px-4 py-2 rounded-1xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        filter === key
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de órdenes */}
          {orders.length === 0 ? (
            <div className={`bg-white rounded-1xl shadow-sm p-12 text-center transition-all duration-1000 ease-out delay-400 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Explora nuestra tienda y realiza tu primera compra
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#4a5a3f] text-white px-6 py-3 rounded-1xl font-medium hover:bg-[#3d4a34] transition-colors"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={`bg-white rounded-lg shadow-sm p-12 text-center transition-all duration-1000 ease-out delay-400 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay órdenes con estos filtros
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta cambiar los filtros para ver más órdenes
              </p>
              <button
                onClick={() => {
                  setFilter('all');
                }}
                className="inline-block bg-[#4a5a3f] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
              >
                Ver todas las órdenes
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-1000 ease-out delay-400 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}>
              {filteredOrders.map((order, index) => (
                <Link
                  key={order.id}
                  href={`/my-orders/${order.id}`}
                  className={`block bg-white rounded-1xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: `${400 + (index * 100)}ms`
                  }}
                >
                  <div className="p-6">
                    {/* Header de la orden */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#4a5a3f] transition-colors">
                          Orden #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusBadge(order.payment_status)}
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-[#4a5a3f] transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Información de la orden */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(order.created_at).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{order.shipping_city}, {order.shipping_department}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{order.shipping_phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>
                          {order.items?.length || 0} {order.items?.length === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>

                    {/* Footer con total */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="text-2xl font-bold text-[#4a5a3f]">
                          ${order.total.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <FooterSection />
      <ShoppingCart />
    </>
  );
}

