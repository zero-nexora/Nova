import { RoleName } from "@prisma/client";

export const roles = [
  {
    name: RoleName.ADMIN,
    description: "Full access to all resources",
  },
  {
    name: RoleName.MANAGE_PRODUCT,
    description: "Can manage products",
  },
  {
    name: RoleName.MANAGE_CATEGORY,
    description: "Can manage categories",
  },
  {
    name: RoleName.MANAGE_ORDER,
    description: "Can manage orders",
  },
];
