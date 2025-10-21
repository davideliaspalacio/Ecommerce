import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType } from '@/components/types/CartItem';
import { ProductType, getCurrentPrice } from '@/components/types/Product';
import { apiClient } from '@/lib/api-client';

interface CartStore {
  // Estado
  cart: CartItemType[];
  isCartOpen: boolean;
  showCartAnimation: boolean;
  backendTotal: number;
  backendSavings: number;

  // Acciones del carrito
  addToCart: (product: ProductType, size: string) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  removeFromCartByProductId: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCartFromDB: () => Promise<void>;

  // Acciones de UI
  openCart: () => void;
  closeCart: () => void;
  setShowCartAnimation: (show: boolean) => void;

  // Utilidades
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: string, size: string) => boolean;
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
            const transformedCart = (response.data?.items || []).map((item: any) => ({
              id: item.id,
              product: {
                id: item.product_id,
                name: item.product_name,
                price: item.price,
                image: item.image_url,
                // Agregar campos por defecto para compatibilidad
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
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
              },
              // Campos de promoción del backend
              price: item.price,
              original_price: item.original_price,
              discount_percentage: item.discount_percentage,
              is_on_discount: item.is_on_discount,
              final_price: item.final_price,
              size: item.size,
              quantity: item.quantity,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }));
            
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
      addToCart: async (product, size) => {
        // Verificar si el usuario está logueado PRIMERO
        if (!apiClient.isAuthenticated()) {
          // Solo abrir modal de login, NO hacer nada más
          const { useUIStore } = await import('./uiStore');
          useUIStore.getState().openAuthModal();
          return; // Salir inmediatamente, no ejecutar el resto
        }

        // Solo ejecutar si el usuario está logueado
        const { cart } = get();
        const existingItem = cart.find(
          item => item.product.id === product.id && item.size === size
        );

        // Actualizar localmente primero
        const newCart = [...cart];
        const existingItemIndex = newCart.findIndex(
          item => item.product.id === product.id && item.size === size
        );

        if (existingItemIndex !== -1) {
          // Si ya existe, incrementar cantidad
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + 1
          };
        } else {
          // Si no existe, agregar nuevo item
          newCart.push({ product, size, quantity: 1 });
        }

        set({
          cart: newCart,
          showCartAnimation: true
        });

        // Guardar en la base de datos
        try {
          const response = await apiClient.addToCart(product.id, 1, size);

          if (response.success) {
            await get().loadCartFromDB();
          }
        } catch (error) {
          console.error('Error saving to database:', error);
        }

        // Resetear animación después de un tiempo
        setTimeout(() => {
          set({ showCartAnimation: false });
        }, 1000);
      },

      // Remover del carrito
      removeFromCart: async (productId, size) => {
        const { cart } = get();
        
        // Buscar el item en el carrito para obtener su ID ANTES de eliminarlo
        const cartItem = cart.find(
          item => item.product.id === productId && item.size === size
        );

        console.log('Removing cart item:', { productId, size, cartItem });

        // Eliminar de la base de datos PRIMERO
        try {
          if (cartItem?.id) {
            console.log('Removing cart item from database by ID:', cartItem.id);
            
            const response = await apiClient.removeFromCart(cartItem.id);

            if (response.success) {
              // Solo actualizar localmente si la eliminación en BD fue exitosa
              set({
                cart: cart.filter(
                  item => !(item.product.id === productId && item.size === size)
                )
              });
            } else {
              console.error('Failed to remove from database by ID:', response.error);
              // Intentar con product_id y size como fallback
              await get().removeFromCartByProductId(productId, size);
            }
          } else {
            console.log('Cart item has no ID, removing by product_id and size:', { productId, size });
            // Si no hay ID, usar product_id y size
            await get().removeFromCartByProductId(productId, size);
          }
        } catch (error) {
          console.error('Error removing from database:', error);
          // En caso de error, intentar con product_id y size
          await get().removeFromCartByProductId(productId, size);
        }
      },

      // Remover del carrito por product_id y size
      removeFromCartByProductId: async (productId: string, size: string) => {
        try {
          console.log('Removing cart item by product_id and size:', { productId, size });
          
          const response = await apiClient.removeFromCartByProduct(productId, size);

          if (response.success) {
            // Actualizar localmente si la eliminación en BD fue exitosa
            set({
              cart: get().cart.filter(
                item => !(item.product.id === productId && item.size === size)
              )
            });
          } else {
            console.error('Failed to remove from database by product_id and size:', response.error);
            // En caso de error, actualizar localmente de todas formas
            set({
              cart: get().cart.filter(
                item => !(item.product.id === productId && item.size === size)
              )
            });
          }
        } catch (error) {
          console.error('Error removing from database by product_id and size:', error);
          // En caso de error, actualizar localmente de todas formas
          set({
            cart: get().cart.filter(
              item => !(item.product.id === productId && item.size === size)
            )
          });
        }
      },

      // Actualizar cantidad
      updateQuantity: async (productId, size, quantity) => {
        if (quantity < 1) {
          await get().removeFromCart(productId, size);
          return;
        }

        // Actualizar localmente primero
        set({
          cart: get().cart.map(item =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          )
        });

        // Actualizar en la base de datos
        try {
          // Buscar el item en el carrito para obtener su ID
          const cartItem = get().cart.find(
            item => item.product.id === productId && item.size === size
          );
          
          if (cartItem?.id) {
            const response = await apiClient.updateCartItem(cartItem.id, quantity);

            // Si el PUT fue exitoso, recargar el carrito desde la BD para sincronizar
            if (response.success) {
              await get().loadCartFromDB();
            }
          }
        } catch (error) {
          console.error('Error updating quantity in database:', error);
        }
      },

      // Limpiar carrito
      clearCart: async () => {
        // Limpiar localmente primero
        set({ cart: [] });

        // Limpiar en la base de datos
        try {
          const response = await apiClient.clearCart();

          // Si el DELETE fue exitoso, recargar el carrito desde la BD para sincronizar
          if (response.success) {
            await get().loadCartFromDB();
          }
        } catch (error) {
          console.error('Error clearing cart in database:', error);
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
      isInCart: (productId, size) => {
        return get().cart.some(
          item => item.product.id === productId && item.size === size
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
