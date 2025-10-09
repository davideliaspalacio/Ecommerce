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
          
          if (isValid) {
            return cached.profile
          } else {
            cache.delete(userId)
            set({ cache: new Map(cache) })
          }
        } else {
        }
        
        return null
      },

      setCachedProfile: (userId: string, profile: Profile) => {
        const { cache } = get()
        cache.set(userId, { profile, timestamp: Date.now() })
        set({ cache: new Map(cache) })
      },

      clearProfileCache: (userId?: string) => {
        const { cache } = get()
        
        if (userId) {
          cache.delete(userId)
        } else {
          cache.clear()
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
          state.cache = new Map(state.cache as [string, CachedProfile][])
        } else {
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
