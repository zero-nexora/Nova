"use client";

import Link from "next/link";
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/global/theme-toggle";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setIsMobileSearchOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-xl opacity-90">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 border rounded-md flex items-center justify-center">
              <span className="font-semibold text-sm">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-semibold">Shop</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 h-10 border-0 focus-visible:ring-1"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-10 w-10"
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-0">
                  3
                </Badge>
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-10 w-10"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-0">
                  5
                </Badge>
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>

            {/* User Account */}
            <div className="hidden sm:flex items-center space-x-2">
              <UserButton />
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-10 w-10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Sheet */}
      <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
        <SheetContent side="top" className="h-auto border-0">
          <SheetHeader className="text-left pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">Search</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-0 focus-visible:ring-1"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12">
              Search
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-80 border-0">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border rounded flex items-center justify-center">
                  <span className="font-semibold text-xs">S</span>
                </div>
                <SheetTitle className="text-lg">Shop</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-2">
            {/* User Section */}
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <UserButton />
              <div className="flex-1">
                <div className="text-sm font-medium">My Account</div>
                <div className="text-xs text-muted-foreground">
                  Manage profile & settings
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start h-12 text-left"
                onClick={closeMobileMenu}
              >
                <Link href="/orders">
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Orders</div>
                    <div className="text-xs text-muted-foreground">
                      Track & manage orders
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="w-full justify-start h-12 text-left"
                onClick={closeMobileMenu}
              >
                <Link href="/wishlist">
                  <Heart className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">Wishlist</div>
                    <div className="text-xs text-muted-foreground">
                      Saved items
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                className="w-full justify-start h-12 text-left"
                onClick={closeMobileMenu}
              >
                <Link href="/help">
                  <div className="mr-3 h-5 w-5 flex items-center justify-center text-sm">
                    ?
                  </div>
                  <div>
                    <div className="font-medium">Help & Support</div>
                    <div className="text-xs text-muted-foreground">
                      Get assistance
                    </div>
                  </div>
                </Link>
              </Button>
            </nav>

            {/* Theme Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
