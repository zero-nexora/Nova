import { Cart, CartItem } from "@/queries/client/carts/types";
import { create } from "zustand";

interface CartState {
  cart: Cart | null;
  setCart: (cart: Cart) => void;
  addToCart: (newItem: CartItem) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  rollbackCartItemQuantity: (cartItemId: string, quantity: number) => void; // 🔹 mới thêm
  deleteCartItem: (cartItemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,

  setCart: (cart) => set({ cart }),

  addToCart: (newItem) =>
    set((state) => {
      if (!state.cart) {
        return {
          cart: null,
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
        };
      }

      return {
        cart: {
          ...state.cart,
          items: [...state.cart.items, newItem],
        },
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
    })),

  deleteCartItem: (cartItemId) =>
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.filter((item) => item.id !== cartItemId),
          }
        : state.cart,
    })),

  clearCart: () => set({ cart: null }),
}));
