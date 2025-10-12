"use client";

import { hasAnyRole } from "@/lib/utils";
import { useUserStore } from "@/stores/client/user-store";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, User, Home } from "lucide-react";

interface UserButtonCustomProps {
  isAdminPage?: boolean;
}

export const UserButtonCustom = ({
  isAdminPage = false,
}: UserButtonCustomProps) => {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          {!isAdminPage && (
            <UserButton.Link
              label="Profile"
              href="/users/current"
              labelIcon={<User className="size-4" />}
            />
          )}

          {!isAdminPage && hasAnyRole(user) && (
            <UserButton.Link
              label="Dashboard"
              href="/admin/dashboard"
              labelIcon={<LayoutDashboard className="size-4" />}
            />
          )}

          {isAdminPage && (
            <UserButton.Link
              label="Home"
              href="/"
              labelIcon={<Home className="size-4" />}
            />
          )}
        </UserButton.MenuItems>
      </UserButton>
    </>
  );
};
