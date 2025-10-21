"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth, Profile } from '@/hooks/useAuth'

interface AuthContextType {
  user: any
  profile: Profile | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>
  isAdmin: () => boolean
  isModerator: () => boolean
  isActive: () => boolean
  isEmailVerified: () => boolean
  isAuthenticated: () => boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuthContext()
  
  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}

export function useRole() {
  const { profile, isAdmin, isModerator, isActive } = useAuthContext()
  
  return {
    profile,
    isAdmin: isAdmin(),
    isModerator: isModerator(),
    isActive: isActive(),
    role: profile?.role || null
  }
}
