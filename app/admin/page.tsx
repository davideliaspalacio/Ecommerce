"use client"

import { useAuthContext } from '@/contexts/AuthContext'
import AdminProducts from '@/components/admin/AdminProducts'

export default function AdminPage() {
  const { user, profile, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4a5a3f] mb-4">Acceso Requerido</h2>
          <p className="text-gray-600">Debes iniciar sesión para acceder al panel de administración.</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos de administrador para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminProducts />
    </div>
  )
}
