import { useState, useEffect } from 'react'
import { apiClient, type AuthResponse, type User } from '@/lib/api-client'
import { useProfileCacheStore } from '@/store/profileCacheStore'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'user' | 'moderator'
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Usar el store de Zustand para el caché
  const { 
    getCachedProfile, 
    setCachedProfile, 
    clearProfileCache 
  } = useProfileCacheStore()

  useEffect(() => {
    let isMounted = true

    const getInitialSession = async () => {
      try {
        console.log('Verificando autenticación inicial...')
        
        // Verificar si hay token almacenado
        if (!apiClient.isAuthenticated()) {
          console.log('No hay token, usuario no autenticado')
          if (isMounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }
        
        console.log('Token encontrado, obteniendo usuario...')

        // Obtener usuario actual
        const response = await apiClient.getCurrentUser()
        console.log('Respuesta de getCurrentUser:', response)
        
        if (response.success && response.data) {
          console.log('Usuario obtenido:', response.data)
          if (isMounted) {
            setUser(response.data)
            setProfile(response.data)
            setCachedProfile(response.data.id, response.data)
            console.log('Estado actualizado con usuario')
          }
        } else {
          console.log('Error al obtener usuario:', response.error)
          // Token inválido, limpiar estado
          if (isMounted) {
            setUser(null)
            setProfile(null)
            clearProfileCache()
            apiClient.clearToken()
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        setError('Error al cargar la sesión')
        // En caso de error, limpiar token
        apiClient.clearToken()
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getInitialSession()
  }, [])

  const fetchProfile = async (userId: string, retryCount = 0) => {
    // Verificar caché antes de hacer la llamada
    const cachedProfile = getCachedProfile(userId)
    if (cachedProfile) {
      setProfile(cachedProfile)
      setProfileLoading(false)
      return
    }
    if (profileLoading) {
      return
    }
    setProfileLoading(true)
    
    try {
      const response = await apiClient.getCurrentUser()

      if (!response.success) {
        console.error('Error fetching profile:', response.error)
        
        if (retryCount < 2) {
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000 * (retryCount + 1))
          return
        }
        
        setError(response.error || 'Error al cargar el perfil')
        return
      }

      if (response.data) {
        // Guardar en caché y actualizar estado
        setCachedProfile(userId, response.data)
        setProfile(response.data)
        setError(null)
      }
    } catch (err: any) {
      console.error('Error in fetchProfile:', err)
      
      if (retryCount < 2) {
        setTimeout(() => fetchProfile(userId, retryCount + 1), 2000 * (retryCount + 1))
        return
      }
      
      setError('Error al cargar el perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      const response = await apiClient.signUp(email, password, fullName)

      if (!response.success) {
        setError(response.error || 'Error al crear la cuenta')
        return { data: null, error: { message: response.error } }
      }

      if (response.data) {
        // Guardar token usando el método del apiClient
        apiClient.setToken(response.data.access_token)
        
        setUser(response.data.user)
        setProfile(response.data.user)
        setCachedProfile(response.data.user.id, response.data.user)
      }

      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la cuenta'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await apiClient.signIn(email, password)

      if (!response.success) {
        setError(response.error || 'Error al iniciar sesión')
        return { data: null, error: { message: response.error } }
      }

      if (response.data) {
        // Guardar token usando el método del apiClient
        apiClient.setToken(response.data.access_token)
        
        setUser(response.data.user)
        setProfile(response.data.user)
        setCachedProfile(response.data.user.id, response.data.user)
      }

      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const response = await apiClient.signOut()
      
      if (!response.success) {
        setError(response.error || 'Error al cerrar sesión')
        return { error: { message: response.error } }
      }

      // Limpiar token usando el método del apiClient
      apiClient.clearToken()
      
      // Limpiar caché y estados
      clearProfileCache()
      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cerrar sesión'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      const errorMessage = 'No hay usuario logueado'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }

    try {
      setError(null)
      const response = await apiClient.updateProfile(updates)

      if (!response.success) {
        setError(response.error || 'Error al actualizar el perfil')
        return { data: null, error: { message: response.error } }
      }

      if (response.data) {
        // Actualizar caché con los nuevos datos
        setCachedProfile(user.id, response.data)
        setProfile(response.data)
        setUser(response.data)
      }

      return { data: response.data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el perfil'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const updateLastLogin = async (userId: string) => {
    try {
      // Esta funcionalidad ahora se maneja automáticamente en el backend
      // No necesitamos hacer una llamada adicional
    } catch (err) {
      console.error('Error updating last login:', err)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const response = await apiClient.resetPassword(email)

      if (!response.success) {
        setError(response.error || 'Error al enviar el email de recuperación')
        return { error: { message: response.error } }
      }

      return { error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al enviar el email de recuperación'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const isAdmin = () => profile?.role === 'admin'
  const isModerator = () => profile?.role === 'moderator' || isAdmin()
  const isActive = () => true // Asumimos que si hay usuario, está activo
  const isEmailVerified = () => true // Asumimos que si hay usuario, el email está verificado
  const isAuthenticated = () => !!user && apiClient.isAuthenticated()

  return {
    user,
    profile,
    loading: loading || profileLoading, 
    error,
    
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,    
    isAdmin,
    isModerator,
    isActive,
    isEmailVerified,
    isAuthenticated,
    
    clearError: () => setError(null)
  }
}
