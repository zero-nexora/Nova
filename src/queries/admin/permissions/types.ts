export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export interface RolePermission extends Permission {
  isAssigned: boolean;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermission[];
}

export interface RolePermissionData {
  roles: RoleWithPermissions[];
  permissions: {
    group: string;
    permissions: Permission[];
  }[];
}

export interface PermissionUpdate {
  roleId: string;
  permissionId: string;
  assign: boolean;
}