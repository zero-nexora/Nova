"use client";

import { Forbidden } from "@/components/global/forbidden";
import {
  hasAnyRole,
  isAdmin,
  isAdminOrManageCategory,
  isAdminOrManageOrder,
  isAdminOrManageProduct,
  isAdminOrManageStaff,
} from "@/lib/utils";
import { useUserStore } from "@/stores/client/user-store";

type RoleCheckType =
  | "hasAnyRole"
  | "admin"
  | "adminOrManageProduct"
  | "adminOrManageCategory"
  | "adminOrManageStaff"
  | "adminOrManageOrder";

interface RoleGuardProps {
  check: RoleCheckType;
  children: React.ReactNode;
}

export const RoleGuardProvider = ({ check, children }: RoleGuardProps) => {
  const { user } = useUserStore();

  if (!user) return null;

  let allowed = false;

  switch (check) {
    case "hasAnyRole":
      allowed = hasAnyRole(user);
      break;
    case "admin":
      allowed = isAdmin(user);
      break;
    case "adminOrManageProduct":
      allowed = isAdminOrManageProduct(user);
      break;
    case "adminOrManageCategory":
      allowed = isAdminOrManageCategory(user);
      break;
    case "adminOrManageStaff":
      allowed = isAdminOrManageStaff(user);
      break;
    case "adminOrManageOrder":
      allowed = isAdminOrManageOrder(user);
      break;
    default:
      allowed = false;
  }

  if (!allowed) return <Forbidden />;

  return <>{children}</>;
};
