import { User } from "@/queries/client/users/types";
import { PermissionName } from "@prisma/client";
import { create } from "zustand";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  hasPermission: (permissionName: PermissionName) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  setUser: (user: User) => set({ user }),

  clearUser: () => set({ user: null }),

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
