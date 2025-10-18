"use client";

import { Forbidden } from "@/components/global/forbidden";
import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import {
  hasAnyManagementRole,
  isAdmin,
  isAdminOrManageCategory,
  isAdminOrManageProduct,
  isAdminOrManageRole,
} from "@/lib/utils";

type RoleCheckType =
  | "hasAnyManagementRole"
  | "admin"
  | "adminOrManageProduct"
  | "adminOrManageCategory"
  | "adminOrManageRole";

interface RoleGuardProps {
  check: RoleCheckType;
  children: React.ReactNode;
}

export const RoleGuardProvider = ({ check, children }: RoleGuardProps) => {
  const { user } = useGetCurrentUser();

  if (!user) return null;

  let allowed = false;

  switch (check) {
    case "admin":
      allowed = isAdmin(user);
      break;
    case "adminOrManageProduct":
      allowed = isAdminOrManageProduct(user);
      break;
    case "adminOrManageCategory":
      allowed = isAdminOrManageCategory(user);
      break;
    case "adminOrManageRole":
      allowed = isAdminOrManageRole(user);
      break;
    case "hasAnyManagementRole":
      allowed = hasAnyManagementRole(user);
      break;
    default:
      allowed = false;
  }

  if (!allowed) return <Forbidden />;

  return <>{children}</>;
};
