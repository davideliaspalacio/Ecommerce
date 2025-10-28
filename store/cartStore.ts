import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType } from '@/components/types/CartItem';
import { ProductType, getCurrentPrice } from '@/components/types/Product';
import { apiClient } from '@/lib/api-client';

interface CartStore {
  cart: CartItemType[];
  isCartOpen: boolean;
  showCartAnimation: boolean;
  backendTotal: number;
  backendSavings: number;
  isLoading: boolean;
  loadingItemId: string | null;
  addToCart: (product: ProductType, variantId: string) => Promise<void>;
  removeFromCart: (productId: string, variantId: string) => Promise<void>;
  removeFromCartByProductId: (productId: string, variantId: string) => Promise<void>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCartFromDB: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  setShowCartAnimation: (show: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: string, variantId: string) => boolean;
  getItemPrice: (product: ProductType) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cart: [],
      isCartOpen: false,
      showCartAnimation: false,
      backendTotal: 0,
      backendSavings: 0,
      isLoading: false,
      loadingItemId: null,

      // Cargar carrito desde la base de datos
      loadCartFromDB: async () => {
        try {
          if (!apiClient.isAuthenticated()) return;

          const response = await apiClient.getCart();

          if (response.success) {
            // Extraer total y savings del backend
            const backendTotal = response.data?.total || 0;
            const backendSavings = response.data?.savings || 0;
            
            // Transformar la estructura plana a la estructura esperada
            const transformedCart = (response.data?.items || []).map((item: any) => {             
              return {
                id: item.id,
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  price: item.price,
                  image: item.image_url,
                  original_price: item.original_price || null,
                  discount_percentage: item.discount_percentage || null,
                  is_on_discount: item.is_on_discount || false,
                  discount_start_date: item.discount_start_date || null,
                  discount_end_date: item.discount_end_date || null,
                  current_price: item.current_price || item.price,
                  savings_amount: item.savings_amount || 0,
                  discount_active: item.discount_active || false,
                  image_back: item.image_back || null,
                  description: item.description || '',
                  category: item.category || '',
                  gender: item.gender || '',
                  sizes: item.sizes || [],
                  stock_quantity: item.stock_quantity || 0,
                  status: item.status || 'active',
                  specifications: item.specifications || [],
                  tags: item.tags || [],
                  variants: item.variants || [], 
                  created_at: item.created_at || null,
                  updated_at: item.updated_at || null,
                },
                price: item.price,
                original_price: item.original_price,
                discount_percentage: item.discount_percentage,
                is_on_discount: item.is_on_discount,
                final_price: item.final_price,
                size: item.size,
                variant_id: item.variant_id, 
                quantity: item.quantity,
                created_at: item.created_at,
                updated_at: item.updated_at,
              };
            });
            
            set({ 
              cart: transformedCart,
              backendTotal,
              backendSavings
            });
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      },

      // Agregar al carrito
      addToCart: async (product, variantId) => {
        if (!apiClient.isAuthenticated()) {
          const { useUIStore } = await import('./uiStore');
          useUIStore.getState().openAuthModal();
          return;
        }

        if (product.variants && product.variants.length > 0 && !variantId) {
          alert('Error: Este producto requiere seleccionar una talla. Por favor selecciona una talla e intenta nuevamente.');
          return;
        }

        set({ showCartAnimation: true });

        const response = await apiClient.addToCart(product.id, 1, variantId);
        
        if (response.success) {
          await get().loadCartFromDB();
        }

        setTimeout(() => {
          set({ showCartAnimation: false });
        }, 1000);
      },

      // Remover del carrito
      removeFromCart: async (productId, variantId) => {
        const cartItem = get().cart.find(
          item => item.product.id === productId && item.variant_id === variantId
        );

        // Activar loading para este item específico
        set({ 
          isLoading: true, 
          loadingItemId: `${productId}-${variantId}` 
        });

        try {
          if (cartItem?.size) {
            const response = await apiClient.removeFromCart(productId, cartItem.size);
            if (response.success) {
              await get().loadCartFromDB();
            }
          } else {
            await get().removeFromCartByProductId(productId, variantId);
          }
        } finally {
          // Desactivar loading
          set({ 
            isLoading: false, 
            loadingItemId: null 
          });
        }
      },

      // Remover del carrito por product_id y variantId
      removeFromCartByProductId: async (productId: string, variantId: string) => {
        const response = await apiClient.removeFromCartByProduct(productId, variantId);
        if (response.success) {
          await get().loadCartFromDB();
        }
      },

      // Actualizar cantidad
      updateQuantity: async (productId, variantId, quantity) => {
        if (quantity < 1) {
          await get().removeFromCart(productId, variantId);
          return;
        }

        const cartItem = get().cart.find(
          item => item.product.id === productId && item.variant_id === variantId
        );
        
        if (!cartItem?.size) {
          console.error('No cart item size found');
          return;
        }

        // Activar loading para este item específico
        set({ 
          isLoading: true, 
          loadingItemId: `${productId}-${variantId}` 
        });

        try {
          const response = await apiClient.updateCartItem(productId, cartItem.size, quantity);
          
          if (response.success) {
            await get().loadCartFromDB();
          }
        } finally {
          // Desactivar loading
          set({ 
            isLoading: false, 
            loadingItemId: null 
          });
        }
      },

      // Limpiar carrito
      clearCart: async () => {
        const response = await apiClient.clearCart();
        if (response.success) {
          await get().loadCartFromDB();
        }
      },

      // Abrir carrito
      openCart: () => {
        set({ isCartOpen: true });
        // Cargar datos actualizados cuando se abre
        get().loadCartFromDB();
      },

      // Cerrar carrito
      closeCart: () => {
        set({ isCartOpen: false });
      },

      // Mostrar animación del carrito
      setShowCartAnimation: (show) => {
        set({ showCartAnimation: show });
      },

      // Calcular total
      getTotal: () => {
        return get().cart.reduce((total, item) => {
          const finalPrice = getCurrentPrice(item.product);
          return total + (finalPrice * item.quantity);
        }, 0);
      },

      // Contar items
      getItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // Verificar si está en el carrito
      isInCart: (productId, variantId) => {
        return get().cart.some(
          item => item.product.id === productId && item.variant_id === variantId
        );
      },

      // Obtener precio final de un producto
      getItemPrice: (product) => {
        return getCurrentPrice(product);
      },
    }),
    {
      name: 'cart-storage', // Nombre único para localStorage
      partialize: (state) => ({ cart: state.cart }), // Solo persistir el carrito
    }
  )
);
