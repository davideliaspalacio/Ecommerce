import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'user' | 'moderator'
          status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          created_at: string
          updated_at: string
          last_login: string | null
          email_verified: boolean
          phone_verified: boolean
          birth_date: string | null
          gender: string | null
          address: any | null
          preferences: any
          metadata: any
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'moderator'
          status?: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          birth_date?: string | null
          gender?: string | null
          address?: any | null
          preferences?: any
          metadata?: any
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'moderator'
          status?: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          birth_date?: string | null
          gender?: string | null
          address?: any | null
          preferences?: any
          metadata?: any
        }
      }
    }
  }
}
