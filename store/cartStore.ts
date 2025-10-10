import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType } from '@/components/types/CartItem';
import { ProductType, getCurrentPrice } from '@/components/types/Product';
import { supabase } from '@/lib/supabase';

interface CartStore {
  // Estado
  cart: CartItemType[];
  isCartOpen: boolean;
  showCartAnimation: boolean;

  // Acciones del carrito
  addToCart: (product: ProductType, size: string) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
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

      // Cargar carrito desde la base de datos
      loadCartFromDB: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ cart: data.data || [] });
            }
          }
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      },

      // Agregar al carrito
      addToCart: async (product, size) => {
        // Verificar si el usuario está logueado PRIMERO
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Solo abrir modal de login, NO hacer nada más
            const { useUIStore } = await import('./uiStore');
            useUIStore.getState().openAuthModal();
            return; // Salir inmediatamente, no ejecutar el resto
          }
        } catch (error) {
          console.error('Error checking session:', error);
          return; // Salir si hay error
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
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                product_id: product.id,
                size,
                quantity: 1,
              }),
            });
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

        // Actualizar localmente primero
        set({
          cart: cart.filter(
            item => !(item.product.id === productId && item.size === size)
          )
        });

        // Eliminar de la base de datos
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && cartItem?.id) {
            console.log('Removing cart item from database:', cartItem.id);
            
            const response = await fetch(`/api/cart/${cartItem.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            const result = await response.json();
            console.log('Remove response:', result);
          }
        } catch (error) {
          console.error('Error removing from database:', error);
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
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Buscar el item en el carrito para obtener su ID
            const cartItem = get().cart.find(
              item => item.product.id === productId && item.size === size
            );
            
            if (cartItem?.id) {
              await fetch(`/api/cart/${cartItem.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ quantity }),
              });
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
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch('/api/cart', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });
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
