import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItemType, WishlistWithProductType, SharedWishlistType, CreateSharedWishlistType } from '@/components/types/WishlistItem';
import { ProductType } from '@/components/types/Product';
import { supabase } from '@/lib/supabase';

interface WishlistStore {
  // Estado
  wishlist: WishlistWithProductType[];
  sharedWishlist: SharedWishlistType | null;
  isLoading: boolean;
  error: string | null;
  isWishlistOpen: boolean;
  currentShareId: string | null;

  // Acciones de wishlist
  addToWishlist: (product: ProductType) => Promise<boolean>;
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
  toggleWishlist: (product: ProductType) => Promise<boolean>;
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
      addToWishlist: async (product) => {
        try {
          set({ isLoading: true, error: null });

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ error: 'Debes iniciar sesión para agregar productos a favoritos' });
            return false;
          }

          const { data, error } = await supabase
            .from('wishlist')
            .insert({
              user_id: user.id,
              product_id: product.id
            })
            .select(`
              *,
              product:products(*)
            `)
            .single();

          if (error) {
            if (error.code === '23505') { // Unique constraint violation
              set({ error: 'Este producto ya está en tu lista de favoritos' });
            } else {
              set({ error: error.message });
            }
            return false;
          }

          // Agregar a la lista local
          const newItem: WishlistWithProductType = {
            wishlist_id: data.id,
            user_id: data.user_id,
            added_at: data.created_at,
            updated_at: data.updated_at,
            ...data.product
          };

          set(state => ({
            wishlist: [...state.wishlist, newItem],
            isLoading: false
          }));

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

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ error: 'Debes iniciar sesión' });
            return false;
          }

          const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) {
            set({ error: error.message });
            return false;
          }

          // Remover de la lista local
          set(state => ({
            wishlist: state.wishlist.filter(item => item.id !== productId),
            isLoading: false
          }));

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

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ wishlist: [], isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('wishlist_with_products')
            .select('*')
            .eq('user_id', user.id)
            .order('added_at', { ascending: false });

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          set({ 
            wishlist: data || [], 
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
      toggleWishlist: async (product) => {
        const isInWishlist = get().isInWishlist(product.id);
        
        if (isInWishlist) {
          return await get().removeFromWishlist(product.id);
        } else {
          return await get().addToWishlist(product);
        }
      },

      // Habilitar compartir wishlist
      enableSharing: async (wishlistId: string, user: any, options: any = {}) => {
        try {
          set({ isLoading: true, error: null });

          if (!user) {
            set({ error: 'Debes iniciar sesión para compartir wishlist' });
            return false;
          }

          const { data, error } = await supabase
            .from('wishlist')
            .update({
              is_public: options.is_public ?? true,
              share_enabled: options.share_enabled ?? true,
              purchase_enabled: options.purchase_enabled ?? false,
              created_by_name: options.created_by_name ?? user.user_metadata?.full_name ?? user.email,
              created_by_email: options.created_by_email ?? user.email,
            })
            .eq('id', wishlistId)
            .eq('user_id', user.id)
            .select('share_id')
            .single();

          if (error) {
            set({ error: error.message });
            return false;
          }

          set({ 
            currentShareId: data.share_id,
            isLoading: false 
          });

          return true;
        } catch (error) {
          set({ 
            error: 'Error al habilitar compartir', 
            isLoading: false 
          });
          return false;
        }
      },

      // Deshabilitar compartir wishlist
      disableSharing: async (wishlistId) => {
        try {
          set({ isLoading: true, error: null });

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ error: 'Debes iniciar sesión' });
            return false;
          }

          const { error } = await supabase
            .from('wishlist')
            .update({
              is_public: false,
              share_enabled: false,
            })
            .eq('id', wishlistId)
            .eq('user_id', user.id);

          if (error) {
            set({ error: error.message });
            return false;
          }

          set({ 
            currentShareId: null,
            isLoading: false 
          });

          return true;
        } catch (error) {
          set({ 
            error: 'Error al deshabilitar compartir', 
            isLoading: false 
          });
          return false;
        }
      },

      // Generar enlace de compartir
      generateShareLink: async (wishlistId: string, user: any) => {
        try {
          // Obtener el share_id del wishlist directamente (sin verificar usuario)
          const { data: wishlistData, error } = await supabase
            .from('wishlist')
            .select('share_id, is_public, share_enabled')
            .eq('id', wishlistId)
            .single();

          if (error || !wishlistData) return null;

          // Si no está habilitado para compartir, habilitarlo
          if (!wishlistData.is_public || !wishlistData.share_enabled) {
            const enabled = await get().enableSharing(wishlistId, user);
            if (!enabled) return null;
          }

          const shareId = wishlistData.share_id || get().currentShareId;
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

          // Usar la vista wishlist_with_products para obtener datos públicos
          const { data, error } = await supabase
            .from('wishlist_with_products')
            .select('*')
            .eq('share_id', shareId)
            .eq('is_public', true)
            .eq('share_enabled', true);

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (!data || data.length === 0) {
            set({ error: 'Wishlist no encontrado o no es público', isLoading: false });
            return false;
          }

          // Agrupar datos del wishlist y productos
          const wishlistData = data[0];
          const products = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            original_price: item.original_price,
            discount_percentage: item.discount_percentage,
            is_on_discount: item.is_on_discount,
            discount_start_date: item.discount_start_date,
            discount_end_date: item.discount_end_date,
            image: item.image,
            image_back: item.image_back,
            category: item.category,
            gender: item.gender,
            description: item.description,
            specifications: item.specifications,
            sizes: item.sizes,
            sku: item.sku,
            stock_quantity: item.stock_quantity,
            status: item.status,
            tags: item.tags,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));

          const sharedWishlist: SharedWishlistType = {
            wishlist_id: wishlistData.wishlist_id,
            user_id: wishlistData.user_id,
            share_id: wishlistData.share_id,
            is_public: wishlistData.is_public,
            share_enabled: wishlistData.share_enabled,
            purchase_enabled: wishlistData.purchase_enabled,
            created_by_name: wishlistData.created_by_name,
            created_by_email: wishlistData.created_by_email,
            added_at: wishlistData.added_at,
            wishlist_updated_at: wishlistData.wishlist_updated_at,
            products,
          };

          set({ 
            sharedWishlist,
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
