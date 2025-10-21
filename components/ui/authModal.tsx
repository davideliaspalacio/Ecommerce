"use client"

import { useState } from "react"
import { useAuthContext } from "@/contexts/AuthContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, error, clearError } = useAuthContext()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isClosing, setIsClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const validateName = (name: string) => {
    const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0)
    return nameParts.length >= 2
  }

  const closeAuthModal = () => {
    setIsClosing(true)
    clearError()
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
      setLoading(false)
      setValidationErrors({})
    }, 300)
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    setValidationErrors({})

    if (authMode === 'register') {
      if (!validateName(authForm.name)) {
        setValidationErrors({ name: 'Por favor ingresa tu nombre completo (al menos 2 nombres)' })
        setLoading(false)
        return
      }
    }

    try {
      if (authMode === 'login') {
        const { error } = await signIn(authForm.email, authForm.password)
        if (error) {
          console.error('Login error:', error)
          return
        }
        closeAuthModal()
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setLoading(false)
          return
        }
        const { error } = await signUp(authForm.email, authForm.password, authForm.name)
        if (error) {
          console.error('Signup error:', error)
          return
        }
        setShowVerificationMessage(true)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
    clearError()
  }

  if (!isOpen) return null

  return (
    <div className={`fixed  inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeAuthModal}>
      <div className={`bg-white w-full max-w-md rounded-1xl shadow-2xl ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#4a5a3f] text-white px-6 py-4 rounded-t-1xl flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensaje de verificación de email */}
        {showVerificationMessage && (
          <div className="p-6  border-b border-green-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-[#4a5a3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#4a5a3f] mb-2">
                  ¡Registro exitoso!
                </h3>
                <p className="text-sm  mb-4">
                  Te hemos enviado un correo de verificación a <strong>{authForm.email}</strong>. 
                  Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta y poder iniciar sesión.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationMessage(false)
                      setAuthMode('login')
                      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
                    }}
                    className="bg-[#4a5a3f] text-white px-4 py-2 rounded-1xl text-sm font-medium hover:bg-[#3d4a34] transition-colors"
                  >
                    Entendido
                  </button>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-1xl text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showVerificationMessage && (
          <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-1xl text-sm">
              {error}
            </div>
          )}
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                required={authMode === 'register'}
                value={authForm.name}
                onChange={(e) => {
                  const value = e.target.value
                  setAuthForm({...authForm, name: value})
                  if (value.trim().length > 0) {
                    if (!validateName(value)) {
                      setValidationErrors({...validationErrors, name: 'Por favor ingresa tu nombre completo (al menos 2 nombres)'})
                    } else {
                      setValidationErrors({...validationErrors, name: ''})
                    }
                  } else {
                    setValidationErrors({...validationErrors, name: ''})
                  }
                }}
                className={`w-full px-4 py-3 border rounded-1xl focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent transition-colors ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre completo"
              />
              {validationErrors.name && (
                <p className="mt-2 text-[12px] text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {validationErrors.name}
                </p>
              )}
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
            disabled={loading}
            className="w-full bg-[#4a5a3f] text-white py-3 font-medium rounded-1xl hover:bg-[#3d4a34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {authMode === 'login' ? 'INICIANDO SESIÓN...' : 'CREANDO CUENTA...'}
              </div>
            ) : (
              authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'
            )}
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </p>
            <button
              type="button"
              onClick={switchAuthMode}
              className="text-[#4a5a3f] font-medium hover:underline transition-colors cursor-pointer"
            >
              {authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </div>

          {/* Social Login */}

        </form>
        )}
      </div>
    </div>
  )
}