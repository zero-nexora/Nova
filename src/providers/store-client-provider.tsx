"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetAllCategories } from "@/app/(client)/hooks/categories/use-get-all-categories";
import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import { useGetCart } from "@/app/(client)/cart/hooks/use-get-cart";
import { useUserStore } from "@/stores/client/user-store";
import { useCartStore } from "@/stores/client/carts-store";

interface StoreClientProviderProps {
  children: React.ReactNode;
}

export const StoreClientProvider = ({ children }: StoreClientProviderProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const {
    user,
    isPending: isUserPending,
    error: userError,
  } = useGetCurrentUser();
  const { cart, isPending: isCartPending, error: cartError } = useGetCart();
  const {
    setUser,
    setLoading: setUserLoading,
    setError: setUserError,
    clearUser,
  } = useUserStore();
  const {
    setCart,
    setLoading: setCartLoading,
    setError: setCartError,
    clearCart,
  } = useCartStore();

  // Preload categories
  useGetAllCategories();

  useEffect(() => {
    // Wait until Clerk authentication is loaded
    if (!isLoaded) return;

    // Handle user state
    setUserLoading(isUserPending);
    if (userError) {
      setUserError(userError.message || "Failed to fetch user data");
      return;
    }

    if (isSignedIn && user) {
      setUser(user);
    } else {
      clearUser();
    }

    // Handle cart state
    setCartLoading(isCartPending);
    if (cartError) {
      setCartError(cartError.message || "Failed to fetch cart data");
      return;
    }

    if (isSignedIn && cart) {
      setCart(cart);
    } else {
      clearCart();
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    isUserPending,
    userError,
    cart,
    isCartPending,
    cartError,
    setUser,
    setUserLoading,
    setUserError,
    clearUser,
    setCart,
    setCartLoading,
    setCartError,
    clearCart,
  ]);

  return <>{children}</>;
};
