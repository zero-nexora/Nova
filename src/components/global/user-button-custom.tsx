"use client";

import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, User, Home } from "lucide-react";
import { getAdminLink, hasAnyManagementRole } from "@/lib/utils";
import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";

interface UserButtonCustomProps {
  isAdminPage?: boolean;
}

export const UserButtonCustom = ({
  isAdminPage = false,
}: UserButtonCustomProps) => {
  const { user } = useGetCurrentUser();

  if (!user) return null;

  const adminLink = getAdminLink(user);

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

          {!isAdminPage && hasAnyManagementRole(user) && (
            <UserButton.Link
              label="Dashboard"
              href={adminLink}
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
