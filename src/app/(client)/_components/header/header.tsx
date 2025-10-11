"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetCurrentUser } from "@/app/(client)/users/hooks/use-get-current-user";
import { useUserStore } from "@/stores/client/user-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { Logo } from "@/components/global/logo";
import { DesktopSearch } from "./destop-search";
import { ActionButtons, ActionButtonsSkeleton } from "./action-buttons";
import { MobileSearchSheet } from "./mobile-search-sheet";
import { MobileMenuSheet } from "./mobile-menu-sheet";
import { Error } from "@/components/global/error";
import { Input } from "@/components/ui/input";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { user, error } = useGetCurrentUser();
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileSearchToggle = useCallback(() => {
    setIsMobileSearchOpen((prev) => !prev);
  }, []);

  if (error) return <Error />;

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Logo />
          </Link>

          <DesktopSearch />

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-10 w-10"
              onClick={handleMobileSearchToggle}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <ActionButtons user={user} />

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-10 w-10"
              onClick={handleMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      <MobileSearchSheet
        isOpen={isMobileSearchOpen}
        onOpenChange={setIsMobileSearchOpen}
      />

      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        user={user}
      />
    </header>
  );
}

export const HeaderSkeleton = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Logo />
          </Link>

          <div className="relative flex-1 max-w-xl mx-8">
            <div className="flex items-center border rounded-lg shadow-md bg-background">
              <Search className="ml-3 mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search products..."
                className="border-0 focus-visible:ring-0 bg-transparent"
                disabled
              />
            </div>
          </div>

          <ActionButtonsSkeleton />
        </div>
      </div>
    </header>
  );
};
