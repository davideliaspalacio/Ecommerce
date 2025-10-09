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

          // Obtener wishlist actual del usuario
          const { data: existingWishlist } = await supabase
            .from('wishlist')
            .select('products')
            .eq('user_id', user.id)
            .single();

          let products = existingWishlist?.products || [];
          
          // Verificar si el producto ya existe
          const productExists = products.some((p: any) => p.id === product.id);
          if (productExists) {
            set({ error: 'Este producto ya está en tu lista de favoritos', isLoading: false });
            return false;
          }

          // Agregar producto al array
          const productToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            discount_percentage: product.discount_percentage,
            is_on_discount: product.is_on_discount,
            discount_start_date: product.discount_start_date,
            discount_end_date: product.discount_end_date,
            image: product.image,
            image_back: product.image_back,
            category: product.category,
            gender: product.gender,
            description: product.description,
            specifications: product.specifications,
            sizes: product.sizes,
            sku: product.sku,
            stock_quantity: product.stock_quantity,
            status: product.status,
            tags: product.tags,
            created_at: product.created_at,
            updated_at: product.updated_at,
            added_at: new Date().toISOString()
          };

          products.push(productToAdd);

          // Actualizar o crear wishlist
          const { error } = await supabase
            .from('wishlist')
            .upsert({
              user_id: user.id,
              products: products,
              created_by_name: user.user_metadata?.full_name || user.email,
              created_by_email: user.email
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            set({ error: error.message });
            return false;
          }

          // Actualizar estado local
          set(state => ({
            wishlist: products.map((p: any) => ({ 
              ...p, 
              wishlist_id: 'single', 
              user_id: user.id 
            })),
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

          // Obtener wishlist actual
          const { data: existingWishlist } = await supabase
            .from('wishlist')
            .select('products')
            .eq('user_id', user.id)
            .single();

          if (!existingWishlist) {
            set({ error: 'No se encontró el wishlist', isLoading: false });
            return false;
          }

          // Filtrar producto del array
          const products = existingWishlist.products.filter((p: any) => p.id !== productId);

          // Actualizar wishlist
          const { error } = await supabase
            .from('wishlist')
            .update({ products: products })
            .eq('user_id', user.id);

          if (error) {
            set({ error: error.message });
            return false;
          }

          // Actualizar estado local
          set(state => ({
            wishlist: products.map((p: any) => ({ 
              ...p, 
              wishlist_id: 'single', 
              user_id: user.id 
            })),
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
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // No hay wishlist, crear uno vacío
              set({ wishlist: [], isLoading: false });
              return;
            }
            set({ error: error.message, isLoading: false });
            return;
          }

          // Los productos están en el array
          const products = data.products || [];

          set({ 
            wishlist: products.map((p: any) => ({ 
              ...p, 
              wishlist_id: data.id, 
              user_id: user.id 
            })), 
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
          // Obtener el wishlist del usuario
          const { data: wishlistData, error } = await supabase
            .from('wishlist')
            .select('share_id, is_public, share_enabled')
            .eq('user_id', user.id)
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

          // Obtener wishlist por share_id
          const { data: wishlistData, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('share_id', shareId)
            .eq('is_public', true)
            .eq('share_enabled', true)
            .single();

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (!wishlistData) {
            set({ error: 'Wishlist no encontrado o no es público', isLoading: false });
            return false;
          }

          // Los productos están en el array
          const products = wishlistData.products || [];

          const sharedWishlist: SharedWishlistType = {
            wishlist_id: wishlistData.id,
            user_id: wishlistData.user_id,
            share_id: wishlistData.share_id,
            is_public: wishlistData.is_public,
            share_enabled: wishlistData.share_enabled,
            purchase_enabled: wishlistData.purchase_enabled,
            created_by_name: wishlistData.created_by_name,
            created_by_email: wishlistData.created_by_email,
            added_at: wishlistData.created_at,
            wishlist_updated_at: wishlistData.updated_at,
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
