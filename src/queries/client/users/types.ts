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
      name: RoleName; // Use Prisma enum
      description: string | null;
      permissions: {
        permission: {
          id: string;
          name: PermissionName; // Use Prisma enum
          description: string | null;
        };
      }[];
    };
  }[];
  cart: {
    id: string;
    items: {
      id: string;
      cart_id: string;
      product_variant_id: string;
      quantity: number;
      created_at: Date;
      updated_at: Date;
    }[];
  } | null;
  _count: {
    wishlists: number;
  };
}
