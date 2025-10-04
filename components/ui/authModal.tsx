"use client"

import { useState } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isClosing, setIsClosing] = useState(false)

  const closeAuthModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
    }, 300)
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'login') {
      console.log('Login:', { email: authForm.email, password: authForm.password })
      closeAuthModal()
    } else {
      if (authForm.password !== authForm.confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }
      console.log('Register:', authForm)
      closeAuthModal()
    }
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeAuthModal}>
      <div className={`bg-white w-full max-w-md rounded-1xl shadow-2xl ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#4a5a3f] text-white px-6 py-4 rounded-t-1xl flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                required={authMode === 'register'}
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent transition-colors"
                placeholder="Tu nombre completo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                required={authMode === 'register'}
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#4a5a3f] text-white py-3 font-medium rounded-1xl hover:bg-[#3d4a34] transition-colors"
          >
            {authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </p>
            <button
              type="button"
              onClick={switchAuthMode}
              className="text-[#4a5a3f] font-medium hover:underline transition-colors"
            >
              {authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </div>

          {/* Social Login */}
          <div className="pt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-1xl shadow-sm bg-white text-sm font-medium text-[#4a5a3f] hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
          
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-1xl shadow-sm bg-white text-sm font-medium text-[#4a5a3f] hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}