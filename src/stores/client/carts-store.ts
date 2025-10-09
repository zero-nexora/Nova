import { Cart, CartItem } from "@/queries/client/carts/types";
import { create } from "zustand";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  setCart: (cart: Cart) => void;
  addToCart: (newItem: CartItem) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  rollbackCartItemQuantity: (cartItemId: string, quantity: number) => void; // 🔹 mới thêm
  deleteCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  error: null,

  setCart: (cart) => set({ cart, loading: false, error: null }),

  addToCart: (newItem) =>
    set((state) => {
      if (!state.cart) {
        return {
          cart: null,
          loading: false,
          error: null,
        };
      }

      const existingItem = state.cart.items.find(
        (item) => item.id === newItem.id
      );

      if (existingItem) {
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id === newItem.id
                ? {
                    ...item,
                    quantity: item.quantity + newItem.quantity,
                  }
                : item
            ),
          },
          loading: false,
          error: null,
        };
      }

      return {
        cart: {
          ...state.cart,
          items: [...state.cart.items, newItem],
        },
        loading: false,
        error: null,
      };
    }),

  updateCartItemQuantity: (cartItemId, quantity) =>
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item
            ),
          }
        : state.cart,
      loading: false,
      error: null,
    })),

  rollbackCartItemQuantity: (cartItemId, quantity) =>
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item
            ),
          }
        : state.cart,
      loading: false,
      error: null,
    })),

  deleteCartItem: (cartItemId) =>
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.filter((item) => item.id !== cartItemId),
          }
        : state.cart,
      loading: false,
      error: null,
    })),

  clearCart: () => set({ cart: null, loading: false, error: null }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
