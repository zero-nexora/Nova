// import { Cart } from "@/queries/client/carts/types";
// import { create } from "zustand";

// interface CartState {
//   cart: Cart | null;
//   isLoading: boolean;
//   error: string | null;
//   setCart: (cart: Cart) => void;
//   addItemToCart: (cartItemId: string,productVariantId: string, quantity: number) => void;
//   updateItemQuantity: (cartItemId: string, quantity: number) => void;
//   deleteItemFromCart: (cartItemId: string) => void;
//   clearCart: () => void;
// }

// export const useCartStore = create<CartState>((set) => ({
//   cart: null,
//   isLoading; false,
//   error: null,

//   setCart: (cart: Cart) => set({cart, isLoading: false, error: null}),
//   addItemToCart: (productVariantId: string, quantity: number) => {
//     set({ isLoading: false, error: null})

//   }
// }))