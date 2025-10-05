"use client"

import { useAuthContext } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function AuthStatus() {
  const { user, profile, loading, error, signOut } = useAuthContext()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Cargando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Error: {error}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-sm text-gray-600">
        No hay usuario logueado
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {profile?.full_name || user.email}
        </div>
        <div className="text-gray-500">
          {profile?.role && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {profile.role}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
