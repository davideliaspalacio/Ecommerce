import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
  created_at: string
  updated_at: string
  last_login?: string
  email_verified: boolean
  phone_verified: boolean
  birth_date?: string
  gender?: string
  address?: any
  preferences?: any
  metadata?: any
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Supabase environment variables not loaded')
          setError('Error de configuración: variables de entorno no encontradas')
          setLoading(false)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        setError('Error al cargar la sesión')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setError(error.message)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Error in fetchProfile:', err)
      setError('Error al cargar el perfil')
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la cuenta'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      if (data.user) {
        await updateLastLogin(data.user.id)
      }

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { error }
      }

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
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      if (data) {
        setProfile(data)
      }

      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el perfil'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    }
  }

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    } catch (err) {
      console.error('Error updating last login:', err)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
        return { error }
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
  const isActive = () => profile?.status === 'active'
  const isEmailVerified = () => profile?.email_verified === true

  return {
    user,
    profile,
    loading,
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
    
    clearError: () => setError(null)
  }
}
