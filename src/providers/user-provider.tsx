"use client";

import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import { Error } from "@/components/global/error";
import { useUserStore } from "@/stores/client/user-store";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export const UserProvider = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, error } = useGetCurrentUser();
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [isLoaded, isSignedIn, user]);

  if (error) return <Error />;

  return null;
};
