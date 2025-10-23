import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItemType, WishlistWithProductType, SharedWishlistType, CreateSharedWishlistType } from '@/components/types/WishlistItem';
import { ProductType } from '@/components/types/Product';
import { apiClient } from '@/lib/api-client';

interface WishlistStore {
  // Estado
  wishlist: WishlistWithProductType[];
  sharedWishlist: SharedWishlistType | null;
  isLoading: boolean;
  error: string | null;
  isWishlistOpen: boolean;
  currentShareId: string | null;

  // Acciones de wishlist
  addToWishlist: (product: ProductType, size?: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => void;

  // Acciones de compartir
  enableSharing: (wishlistId: string, user: any, options?: any) => Promise<boolean>;
  disableSharing: (wishlistId: string) => Promise<boolean>;
  generateShareLink: (wishlistId: string, user: any) => Promise<string | null>;
  fetchSharedWishlist: (shareId: string) => Promise<boolean>;
  copyShareLink: (shareLink: string) => Promise<boolean>;

  // Acciones de UI
  openWishlist: () => void;
  closeWishlist: () => void;

  // Utilidades
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  toggleWishlist: (product: ProductType, size?: string) => Promise<boolean>;
  getShareId: () => string | null;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      wishlist: [],
      sharedWishlist: null,
      isLoading: false,
      error: null,
      isWishlistOpen: false,
      currentShareId: null,

      // Agregar a wishlist
      addToWishlist: async (product, size) => {
        try {
          set({ isLoading: true, error: null });

          if (!apiClient.isAuthenticated()) {
            set({ error: 'Debes iniciar sesión para agregar productos a favoritos' });
            return false;
          }

          const response = await apiClient.addToWishlist(product.id, size);

          if (!response.success) {
            set({ error: response.error || 'Error al agregar a favoritos' });
            return false;
          }

          // Recargar wishlist desde la base de datos
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

      // Remover de wishlist
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

          // Recargar wishlist desde la base de datos
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

      // Obtener wishlist
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

      // Limpiar wishlist
      clearWishlist: () => {
        set({ wishlist: [] });
      },

      // Abrir wishlist
      openWishlist: () => {
        set({ isWishlistOpen: true });
      },

      // Cerrar wishlist
      closeWishlist: () => {
        set({ isWishlistOpen: false });
      },

      // Verificar si está en wishlist
      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.id === productId);
      },

      // Contar items en wishlist
      getWishlistCount: () => {
        return get().wishlist.length;
      },

      // Toggle wishlist (agregar/remover)
      toggleWishlist: async (product, size) => {
        const isInWishlist = get().isInWishlist(product.id);
        
        if (isInWishlist) {
          return await get().removeFromWishlist(product.id);
        } else {
          return await get().addToWishlist(product, size);
        }
      },

      // Habilitar compartir wishlist
      enableSharing: async (wishlistId: string, user: any, options: any = {}) => {
        // Esta funcionalidad se maneja en el backend
        set({ currentShareId: 'mock-share-id' });
        return true;
      },

      // Deshabilitar compartir wishlist
      disableSharing: async (wishlistId) => {
        // Esta funcionalidad se maneja en el backend
        set({ currentShareId: null });
        return true;
      },

      // Generar enlace de compartir
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

      // Obtener wishlist compartido
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
