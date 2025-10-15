"use client";

import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import { getAdminLink, hasAnyRole } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, User, Home } from "lucide-react";

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

          {!isAdminPage && hasAnyRole(user) && (
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
