"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { OrderType } from "@/components/types/Order";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/ui/header";
import FooterSection from "@/components/ui/footerSection";
import ShoppingCart from "@/components/ui/shoppingCart";
import OrderTracking from "@/components/ui/OrderTracking";
import { BadgeCheck, X, Ban, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualRefPayco, setManualRefPayco] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, authLoading, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;

      setOrder(data);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError("Orden no encontrada");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPayment = async (customRefPayco?: string) => {
    if (!order?.id) return;

    try {
      setChecking(true);
      const refToUse = customRefPayco || order.epayco_ref_payco;
      
      const response = await fetch(
        `/api/epayco/check-payment?${refToUse ? `ref_payco=${refToUse}` : `order_id=${order.id}`}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Pago verificado:', data);
        
        // Recargar la orden para ver los cambios
        await fetchOrder();
        
        alert('✅ Estado actualizado correctamente');
        setShowManualInput(false);
        setManualRefPayco("");
      } else {
        const errorData = await response.json();
        console.error('Error en la verificación:', errorData);
        alert('⚠️ No se pudo verificar el pago. Intenta con el ref_payco de ePayco.');
        setShowManualInput(true);
      }
    } catch (err) {
      console.error('Error verificando pago:', err);
      alert('❌ Error al verificar el pago');
    } finally {
      setChecking(false);
    }
  };

  const handleManualCheck = () => {
    if (manualRefPayco.trim()) {
      handleCheckPayment(manualRefPayco.trim());
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        label: "Pendiente de Pago",
        color: "yellow",
      },
      payment_approved: {
        icon: <BadgeCheck className="w-4 h-4" />,
        label: "Pago Aprobado",
        color: "green",
      },
      processing: {
        icon: <Clock className="w-4 h-4" />,
        label: "En Preparación",
        color: "blue",
      },
      ready_to_ship: {
        icon: <Clock className="w-4 h-4" />,
        label: "Listo para Enviar",
        color: "indigo",
      },
      shipped: {
        icon: <Clock className="w-4 h-4" />,
        label: "Enviado",
        color: "purple",
      },
      in_transit: {
        icon: <Clock className="w-4 h-4" />,
        label: "En Tránsito",
        color: "orange",
      },
      delivered: {
        icon: <BadgeCheck className="w-4 h-4" />,
        label: "Entregado",
        color: "emerald",
      },
      completed: {
        icon: <BadgeCheck className="w-4 h-4" />,
        label: "Completado",
        color: "green",
      },
      failed: {
        icon: <X className="w-4 h-4" />,
        label: "Fallido",
        description: "Hubo un problema con tu pedido",
        color: "red",
      },
      cancelled: {
        icon: <Ban className="w-4 h-4" />,
        label: "Cancelado",
        description: "Este pedido fue cancelado",
        color: "gray",
      },
      returned: {
        icon: <Ban className="w-4 h-4" />,
        label: "Devuelto",
        description: "Este pedido fue devuelto",
        color: "amber",
      },
    };

    return statuses[status as keyof typeof statuses] || statuses.pending;
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a5a3f] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles...</p>
          </div>
        </div>
        <FooterSection />
        <ShoppingCart />
      </>
    );
  }

  if (!user || error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h2>
            <Link
              href="/my-orders"
              className="text-[#4a5a3f] hover:text-[#3d4a34] font-medium"
            >
              ← Volver a mis órdenes
            </Link>
          </div>
        </div>
        <FooterSection />
        <ShoppingCart />
      </>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          Inicio
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/my-orders" className="text-gray-600 hover:text-gray-900">
          Mis Órdenes
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Estado de la orden */}
      <div className={`bg-${statusInfo.color}-50 border border-${statusInfo.color}-200 rounded-lg p-6 mb-6`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{statusInfo.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{statusInfo.label}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Orden realizada el{" "}
              {new Date(order.created_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-white rounded-1xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Productos</h3>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                    <Image
                      src={item.product?.image || "/placeholder.svg"}
                      alt={item.product?.name || "Producto"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Talla: {item.size}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${((item.product?.price || 0) * item.quantity).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seguimiento de Orden */}
          <OrderTracking orderId={order.id} userId={user.id} />

          {/* Información de envío */}
          <div className="bg-white rounded-1xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">📦 Información de Envío</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Destinatario:</span>
                <span className="col-span-2 font-medium">{order.shipping_full_name}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Teléfono:</span>
                <span className="col-span-2">{order.shipping_phone}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Email:</span>
                <span className="col-span-2">{order.shipping_email}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Documento:</span>
                <span className="col-span-2">
                  {order.shipping_document_type?.toUpperCase()} {order.shipping_document_number}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Dirección:</span>
                <span className="col-span-2">{order.shipping_address}</span>
              </div>
              {order.shipping_neighborhood && (
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Barrio:</span>
                  <span className="col-span-2">{order.shipping_neighborhood}</span>
                </div>
              )}
              <div className="grid grid-cols-3">
                <span className="text-gray-600">Ciudad:</span>
                <span className="col-span-2">
                  {order.shipping_city}, {order.shipping_department}
                </span>
              </div>
              {order.shipping_postal_code && (
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Código Postal:</span>
                  <span className="col-span-2">{order.shipping_postal_code}</span>
                </div>
              )}
              {order.shipping_additional_info && (
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Info adicional:</span>
                  <span className="col-span-2 text-gray-500">{order.shipping_additional_info}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-white rounded-1xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Resumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>${order.shipping_cost.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (19%)</span>
                <span>${order.tax.toLocaleString("es-CO")}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#4a5a3f]">
                  ${order.total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

              {/* Información de pago */}
              <div className="bg-white rounded-1xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4"> Pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método:</span>
                    <span className="font-medium">{order.payment_method.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${
                      order.payment_status === 'approved' ? 'text-green-600' : 
                      order.payment_status === 'rejected' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {order.payment_status === 'approved' ? 'Aprobado' :
                       order.payment_status === 'rejected' ? 'Rechazado' :
                       order.payment_status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                    </span>
                  </div>
                  {order.epayco_ref_payco && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ref. ePayco:</span>
                      <span className="text-xs font-mono">{order.epayco_ref_payco}</span>
                    </div>
                  )}
                </div>
              </div>

              {order.payment_status === 'pending' && (
                <>
                  <button
                    onClick={() => handleCheckPayment()}
                    disabled={checking}
                    className="w-full bg-[#4a5a3f] text-white py-3 rounded-lg font-medium hover:bg-[#3d4a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {checking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        🔄 Verificar Estado de Pago
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Botón volver */}
              <Link
                href="/my-orders"
                className="block w-full bg-gray-100 text-center py-3 rounded-1xl font-medium hover:bg-gray-200 transition-colors"
              >
                ← Volver a mis órdenes
              </Link>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
      <ShoppingCart />
    </>
  );
}
