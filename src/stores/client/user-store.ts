import { User } from "@/queries/client/users/types";
import { PermissionName } from "@prisma/client";
import { create } from "zustand";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permissionName: PermissionName) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: User) => set({ user, isLoading: false, error: null }),

  clearUser: () => set({ user: null, isLoading: false, error: null }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  hasPermission: (permissionName: PermissionName) => {
    const user = get().user;
    if (!user) return false;

    return user.roles.some((userRole) =>
      userRole.role.permissions.some(
        (perm) => perm.permission.name === permissionName
      )
    );
  },
}));
