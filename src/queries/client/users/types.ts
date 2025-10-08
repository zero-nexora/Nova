import { RoleName, PermissionName } from "@prisma/client"; // Import enums from Prisma schema

export interface User {
  id: string;
  clerkId: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
  updated_at: Date;
  roles: {
    role: {
      id: string;
      name: RoleName;
      description: string | null;
      permissions: {
        permission: {
          id: string;
          name: PermissionName;
          description: string | null;
        };
      }[];
    };
  }[];
  _count: {
    wishlists: number;
  };
}
