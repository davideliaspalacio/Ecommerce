"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, profile, loading, error } = useAuthContext();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !profile || profile.role !== "admin")) {
      const timer = setTimeout(() => {
        setShowAccessDenied(true);
      }, 500); 
      
      return () => clearTimeout(timer);
    }
  }, [loading, user, profile]);

  if (loading) {
    return <LoadingSpinner size="xl" text="Verificando acceso..." fullScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-md flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error de Conexión
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#4a5a3f] text-white px-6 py-3 rounded-md hover:bg-[#3d4a34] transition-colors cursor-pointer mr-4"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (showAccessDenied || (!user || !profile || profile.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-md flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Esta área está reservada para administradores.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-[#4a5a3f] text-white px-6 py-3 rounded-md hover:bg-[#3d4a34] transition-colors cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
