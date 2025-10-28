import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistWithProductType, SharedWishlistType } from '@/components/types/WishlistItem';
import { ProductType } from '@/components/types/Product';
import { apiClient } from '@/lib/api-client';

interface WishlistStore {
  wishlist: WishlistWithProductType[];
  sharedWishlist: SharedWishlistType | null;
  isLoading: boolean;
  error: string | null;
  isWishlistOpen: boolean;
  currentShareId: string | null;
  addToWishlist: (product: ProductType, size?: string, variantId?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => void;
  enableSharing: (wishlistId: string, user: any, options?: any) => Promise<boolean>;
  disableSharing: (wishlistId: string) => Promise<boolean>;
  generateShareLink: (wishlistId: string, user: any) => Promise<string | null>;
  fetchSharedWishlist: (shareId: string) => Promise<boolean>;
  copyShareLink: (shareLink: string) => Promise<boolean>;
  openWishlist: () => void;
  closeWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  toggleWishlist: (product: ProductType, size?: string, variantId?: string) => Promise<boolean>;
  getShareId: () => string | null;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      sharedWishlist: null,
      isLoading: false,
      error: null,
      isWishlistOpen: false,
      currentShareId: null,
      addToWishlist: async (product, size, variantId) => {
        try {
          set({ isLoading: true, error: null });

          if (!apiClient.isAuthenticated()) {
            set({ error: 'Debes iniciar sesión para agregar productos a favoritos' });
            return false;
          }

          const response = await apiClient.addToWishlist(product.id, size, variantId);

          if (!response.success) {
            set({ error: response.error || 'Error al agregar a favoritos' });
            return false;
          }

          await get().fetchWishlist();

          return true;
        } catch (error) {
          set({ 
            error: 'Error al agregar a favoritos', 
            isLoading: false 
          });
          return false;
        }
      },

      removeFromWishlist: async (productId) => {
        try {
          set({ isLoading: true, error: null });

          if (!apiClient.isAuthenticated()) {
            set({ error: 'Debes iniciar sesión' });
            return false;
          }

          const response = await apiClient.removeFromWishlist(productId);

          if (!response.success) {
            set({ error: response.error || 'Error al remover de favoritos' });
            return false;
          }

          await get().fetchWishlist();

          return true;
        } catch (error) {
          set({ 
            error: 'Error al remover de favoritos', 
            isLoading: false 
          });
          return false;
        }
      },

      fetchWishlist: async () => {
        try {
          set({ isLoading: true, error: null });

          if (!apiClient.isAuthenticated()) {
            set({ wishlist: [], isLoading: false });
            return;
          }

          const response = await apiClient.getWishlist();

          if (!response.success) {
            set({ error: response.error || 'Error al cargar favoritos', isLoading: false });
            return;
          }

          set({ 
            wishlist: response.data?.products || [], 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Error al cargar favoritos', 
            isLoading: false 
          });
        }
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      openWishlist: () => {
        set({ isWishlistOpen: true });
      },

      closeWishlist: () => {
        set({ isWishlistOpen: false });
      },

      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.id === productId);
      },

      getWishlistCount: () => {
        return get().wishlist.length;
      },

      toggleWishlist: async (product, size, variantId) => {
        const isInWishlist = get().isInWishlist(product.id);
        
        if (isInWishlist) {
          return await get().removeFromWishlist(product.id);
        } else {
          return await get().addToWishlist(product, size, variantId);
        }
      },

      enableSharing: async (wishlistId: string, user: any, options: any = {}) => {
        set({ currentShareId: 'mock-share-id' });
        return true;
      },

      disableSharing: async (wishlistId) => {
        set({ currentShareId: null });
        return true;
      },

      generateShareLink: async (wishlistId: string, user: any) => {
        try {
          const response = await apiClient.shareWishlist();

          if (!response.success) {
            set({ error: response.error || 'Error al generar enlace' });
            return null;
          }

          const shareId = response.data?.share_id;
          console.log('shareId', shareId);
          if (!shareId) return null;

          const baseUrl = window.location.origin;
          return `${baseUrl}/wishlist/${shareId}`;
        } catch (error) {
          set({ error: 'Error al generar enlace' });
          return null;
        }
      },

      fetchSharedWishlist: async (shareId) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.getSharedWishlist(shareId);

          if (!response.success) {
            set({ error: response.error || 'Error al cargar wishlist compartido', isLoading: false });
            return false;
          }

          set({ 
            sharedWishlist: response.data,
            isLoading: false 
          });

          return true;
        } catch (error) {
          set({ 
            error: 'Error al cargar wishlist compartido', 
            isLoading: false 
          });
          return false;
        }
      },

      // Copiar enlace al portapapeles
      copyShareLink: async (shareLink) => {
        try {
          if (!shareLink) return false;

          await navigator.clipboard.writeText(shareLink);
          return true;
        } catch (error) {
          set({ error: 'Error al copiar enlace' });
          return false;
        }
      },

      // Obtener share ID actual
      getShareId: () => {
        return get().currentShareId;
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        wishlist: state.wishlist,
        isWishlistOpen: state.isWishlistOpen 
      }),
    }
  )
);
