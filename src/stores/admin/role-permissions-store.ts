import {
  Permission,
  RolePermissionData,
  RoleWithPermissions,
} from "@/queries/admin/roles-permissions/types";
import { create } from "zustand";

interface PermissionChange {
  roleId: string;
  permissionId: string;
  assign: boolean;
}

interface RolePermissionState {
  data: RolePermissionData;
  initialData: RolePermissionData | null;
  setInitialData: (data: RolePermissionData) => void;
  setData: (data: RolePermissionData) => void;
  updateRole: (roleId: string, updates: Partial<RoleWithPermissions>) => void;
  updatePermission: (
    roleId: string,
    permissionId: string,
    isAssigned: boolean
  ) => void;
  addRole: (role: RoleWithPermissions) => void;
  deleteRole: (roleId: string) => void;
  addPermissionGroup: (group: string, permissions: Permission[]) => void;
  getPermissionChanges: () => PermissionChange[];
  commitChanges: () => void;
  resetToInitial: () => void;
  clearStore: () => void;
}

// Utility to create a deep copy of the state
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useRolePermissionStore = create<RolePermissionState>(
  (set, get) => ({
    data: {
      roles: [],
      permissions: [],
    },
    initialData: null,

    setInitialData: (data: RolePermissionData) =>
      set(() => ({
        initialData: deepCopy(data),
      })),

    setData: (data: RolePermissionData) =>
      set(() => ({
        data: deepCopy(data),
      })),

    // Update role details
    updateRole: (roleId: string, updates: Partial<RoleWithPermissions>) =>
      set((state) => {
        const newRoles = state.data.roles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                ...updates,
                permissions: deepCopy(role.permissions),
              }
            : role
        );
        return { data: { ...state.data, roles: newRoles } };
      }),

    // Update permission assignment for a role
    updatePermission: (
      roleId: string,
      permissionId: string,
      isAssigned: boolean
    ) =>
      set((state) => {
        const newRoles = state.data.roles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions: role.permissions.map((perm) =>
                  perm.id === permissionId ? { ...perm, isAssigned } : perm
                ),
              }
            : role
        );
        return { data: { ...state.data, roles: newRoles } };
      }),

    // Add new role
    addRole: (role: RoleWithPermissions) =>
      set((state) => ({
        data: {
          ...state.data,
          roles: [...state.data.roles, deepCopy(role)],
        },
      })),

    // Delete role
    deleteRole: (roleId: string) =>
      set((state) => ({
        data: {
          ...state.data,
          roles: state.data.roles.filter((role) => role.id !== roleId),
        },
      })),

    // Add new permission group
    addPermissionGroup: (group: string, permissions: Permission[]) =>
      set((state) => {
        const newRoles = state.data.roles.map((role) => ({
          ...role,
          permissions: [
            ...role.permissions,
            ...permissions.map((perm) => ({
              ...perm,
              isAssigned: false,
            })),
          ],
        }));
        return {
          data: {
            roles: newRoles,
            permissions: [
              ...state.data.permissions,
              {
                group,
                permissions: deepCopy(permissions),
              },
            ],
          },
        };
      }),

    // Compute permission changes based on diff between initial and current data
    getPermissionChanges: () => {
      const state = get();
      if (!state.initialData) return [];
      const changes: PermissionChange[] = [];
      state.data.roles.forEach((role) => {
        const initialRole = state.initialData?.roles.find(
          (r) => r.id === role.id
        );
        if (initialRole) {
          role.permissions.forEach((perm) => {
            const initialPerm = initialRole.permissions.find(
              (p) => p.id === perm.id
            );
            if (initialPerm && initialPerm.isAssigned !== perm.isAssigned) {
              changes.push({
                roleId: role.id,
                permissionId: perm.id,
                assign: perm.isAssigned,
              });
            }
          });
        }
      });
      return changes;
    },

    // Commit changes (set initial to current after successful save)
    commitChanges: () =>
      set((state) => ({
        initialData: deepCopy(state.data),
      })),

    // Reset to initial data (rollback on error)
    resetToInitial: () =>
      set((state) => ({
        data: state.initialData ? deepCopy(state.initialData) : state.data,
      })),

    // Clear the store
    clearStore: () =>
      set(() => ({
        data: { roles: [], permissions: [] },
        initialData: null,
      })),
  })
);
