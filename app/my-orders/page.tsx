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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        💳 {badge.label}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a5a3f] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus órdenes...</p>
          </div>
        </div>
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
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#4a5a3f] hover:text-[#3d4a34] flex items-center gap-2 mb-4"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
          <p className="text-gray-600 mt-2">
            Aquí puedes ver el estado de todos tus pedidos
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Lista de órdenes */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
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
              href="/"
              className="inline-block bg-[#4a5a3f] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/my-orders/${order.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Orden #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        📅 {new Date(order.created_at).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        📦 Envío a: {order.shipping_city}, {order.shipping_department}
                      </p>
                      <p>
                        📱 {order.shipping_phone}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} {order.items?.length === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-[#4a5a3f]">
                        ${order.total.toLocaleString("es-CO")}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400"
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
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
      <FooterSection />
      <ShoppingCart />
    </>
  );
}

