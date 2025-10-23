"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import AdminOrders from "@/components/admin/AdminOrders";

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img 
            src="/favicon.png" 
            alt="ENOUGHH" 
            className="w-12 h-12 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminOrders />
      </div>
    </AdminRouteGuard>
  );
}
