"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetAllCategories } from "@/app/(client)/hooks/categories/use-get-all-categories";
import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import { useUserStore } from "@/stores/client/user-store";

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
  const {
    setUser,
    setLoading: setUserLoading,
    setError: setUserError,
    clearUser,
  } = useUserStore();

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
  }, [
    isLoaded,
    isSignedIn,
    user,
    isUserPending,
    userError,
    setUser,
    setUserLoading,
    setUserError,
    clearUser,
  ]);

  return <>{children}</>;
};
