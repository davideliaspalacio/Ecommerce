import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/hooks/useAuth'

interface CachedProfile {
  profile: Profile
  timestamp: number
}

interface ProfileCacheState {
  cache: Map<string, CachedProfile>
  cacheDuration: number
  getCachedProfile: (userId: string) => Profile | null
  setCachedProfile: (userId: string, profile: Profile) => void
  clearProfileCache: (userId?: string) => void
  isProfileCached: (userId: string) => boolean
  isCacheValid: (userId: string) => boolean
  getCacheAge: (userId: string) => number | null
}

const CACHE_DURATION = 5 * 60 * 1000 

export const useProfileCacheStore = create<ProfileCacheState>()(
  persist(
    (set, get) => ({
      cache: new Map(),
      cacheDuration: CACHE_DURATION,

      getCachedProfile: (userId: string) => {
        const { cache, cacheDuration } = get()
        const cached = cache.get(userId)
        
        if (cached) {
          const age = Date.now() - cached.timestamp
          const isValid = age < cacheDuration
          console.log(`🔍 Verificando caché para ${userId}: edad=${Math.round(age/1000)}s, válido=${isValid}`)
          
          if (isValid) {
            console.log('✅ Perfil obtenido del caché Zustand')
            return cached.profile
          } else {
            console.log('⏰ Caché expirado, eliminando')
            cache.delete(userId)
            set({ cache: new Map(cache) })
          }
        } else {
          console.log(`❌ No hay caché para ${userId}`)
        }
        
        return null
      },

      setCachedProfile: (userId: string, profile: Profile) => {
        const { cache } = get()
        cache.set(userId, { profile, timestamp: Date.now() })
        set({ cache: new Map(cache) })
        console.log('Perfil guardado en caché Zustand')
      },

      clearProfileCache: (userId?: string) => {
        const { cache } = get()
        
        if (userId) {
          cache.delete(userId)
          console.log(`Caché del usuario ${userId} limpiado`)
        } else {
          cache.clear()
          console.log('Todo el caché de perfiles limpiado')
        }
        
        set({ cache: new Map(cache) })
      },

      isProfileCached: (userId: string) => {
        const { cache } = get()
        return cache.has(userId)
      },

      isCacheValid: (userId: string) => {
        const { cache, cacheDuration } = get()
        const cached = cache.get(userId)
        return cached ? Date.now() - cached.timestamp < cacheDuration : false
      },

      getCacheAge: (userId: string) => {
        const { cache } = get()
        const cached = cache.get(userId)
        return cached ? Date.now() - cached.timestamp : null
      }
    }),
    {
      name: 'profile-cache-storage',

      partialize: (state) => ({
        cache: Array.from(state.cache.entries()),
        cacheDuration: state.cacheDuration
      }),

      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.cache)) {
          console.log('🔄 Hidratando caché desde localStorage:', state.cache.length, 'perfiles')
          state.cache = new Map(state.cache as [string, CachedProfile][])
        } else {
          console.log('🆕 Inicializando caché vacío')
        }
      }
    }
  )
)


export const useCachedProfile = (userId: string) => 
  useProfileCacheStore((state) => state.getCachedProfile(userId))

export const useIsProfileCached = (userId: string) =>
  useProfileCacheStore((state) => state.isProfileCached(userId))

export const useIsCacheValid = (userId: string) =>
  useProfileCacheStore((state) => state.isCacheValid(userId))
