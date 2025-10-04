import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType } from '@/components/types/CartItem';

interface CartStore {
  // Estado
  cart: CartItemType[];
  isCartOpen: boolean;
  showCartAnimation: boolean;

  // Acciones del carrito
  addToCart: (product: any, size: string) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;

  // Acciones de UI
  openCart: () => void;
  closeCart: () => void;
  setShowCartAnimation: (show: boolean) => void;

  // Utilidades
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: number, size: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cart: [],
      isCartOpen: false,
      showCartAnimation: false,

      // Agregar al carrito
      addToCart: (product, size) => {
        const { cart } = get();
        const existingItem = cart.find(
          item => item.product.id === product.id && item.size === size
        );

        if (existingItem) {
          // Si ya existe, incrementar cantidad
          set({
            cart: cart.map(item =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            showCartAnimation: true
          });
        } else {
          // Si no existe, agregar nuevo item
          set({
            cart: [...cart, { product, size, quantity: 1 }],
            showCartAnimation: true
          });
        }

        // Resetear animación después de un tiempo
        setTimeout(() => {
          set({ showCartAnimation: false });
        }, 1000);
      },

      // Remover del carrito
      removeFromCart: (productId, size) => {
        set({
          cart: get().cart.filter(
            item => !(item.product.id === productId && item.size === size)
          )
        });
      },

      // Actualizar cantidad
      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId, size);
          return;
        }

        set({
          cart: get().cart.map(item =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          )
        });
      },

      // Limpiar carrito
      clearCart: () => {
        set({ cart: [] });
      },

      // Abrir carrito
      openCart: () => {
        set({ isCartOpen: true });
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
          const price = Number.parseInt(item.product.price.replace(/[$.]/g, ""));
          return total + price * item.quantity;
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
    }),
    {
      name: 'cart-storage', // Nombre único para localStorage
      partialize: (state) => ({ cart: state.cart }), // Solo persistir el carrito
    }
  )
);
