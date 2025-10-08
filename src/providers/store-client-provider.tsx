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
  const { user, isPending, error } = useGetCurrentUser();
  const { setUser, setLoading, setError, clearUser } = useUserStore();

  // Preload categories
  useGetAllCategories();

  useEffect(() => {
    if (!isLoaded) return;

    setLoading(isPending);

    // Handle error if present
    if (error) {
      setError(error.message || "An error occurred while fetching user data");
      return;
    }

    // Set or clear user based on auth status and user data
    if (isSignedIn && user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [isLoaded, isSignedIn, user, isPending, error?.message]);

  return <>{children}</>;
};
