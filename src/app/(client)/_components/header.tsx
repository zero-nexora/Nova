"use client";

import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  User,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const products = [
    "iPhone 15 Pro Max",
    "Macbook Pro M3",
    "Samsung Galaxy S24",
    "AirPods Pro 2",
    "iPad Air 2024",
    "Apple Watch Series 9",
    "Nintendo Switch",
    "PlayStation 5",
    "Xbox Series X",
    "Surface Pro 10",
  ];

  // Lọc sản phẩm theo query
  const filtered =
    searchQuery.trim().length > 0
      ? products.filter((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  // Xử lý click outside để ẩn suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsDesktopSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Desktop searching for:", searchQuery);
      setShowSuggestions(false);
      setIsDesktopSearchFocused(false);
      // Thực hiện search logic ở đây
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Mobile searching for:", searchQuery);
      setIsMobileSearchOpen(false);
      // Thực hiện search logic ở đây
    }
  };

  const handleSuggestionSelect = (item: string) => {
    setSearchQuery(item);
    setShowSuggestions(false);
    setIsDesktopSearchFocused(false);
    console.log("Selected suggestion:", item);
    // Thực hiện search với suggestion
  };

  const handleDesktopInputFocus = () => {
    setIsDesktopSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleDesktopInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0 || isDesktopSearchFocused);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 border rounded-md flex items-center justify-center">
              <span className="font-semibold text-sm">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-semibold">Shop</span>
            </div>
          </Link>

          <div
            className="hidden md:flex flex-1 max-w-xl mx-8 relative"
            ref={desktopSearchRef}
          >
            <form onSubmit={handleDesktopSearch} className="w-full">
              <div className="relative">
                <div className="flex items-center border rounded-lg shadow-md bg-background">
                  <Search className="ml-3 mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleDesktopInputChange(e.target.value)}
                    onFocus={handleDesktopInputFocus}
                    className="border-0 focus-visible:ring-0 bg-transparent"
                  />
                </div>

                {/* Desktop Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {filtered.length > 0 ? (
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                          Suggestions
                        </div>
                        {filtered.map((item) => (
                          <button
                            key={item}
                            onClick={() => handleSuggestionSelect(item)}
                            className="w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                          >
                            <div className="flex items-center">
                              <Search className="mr-2 h-4 w-4 opacity-50" />
                              {item}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length > 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No products found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Start typing to see suggestions
                      </div>
                    )}
                  </div>
                )}
              </div>
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
              className="relative h-10 w-10 hidden sm:flex"
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
              className="relative h-10 w-10 hidden sm:flex"
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
            <div className="flex items-center space-x-2">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Profile"
                    href="/users/current"
                    labelIcon={<User className="size-4" />}
                  />
                  <UserButton.Link
                    label="Dashboard"
                    href="/admin/dashboard"
                    labelIcon={<LayoutDashboard className="size-4" />}
                  />
                </UserButton.MenuItems>
              </UserButton>
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
        <SheetContent side="top" className="h-auto border-0" showX={false}>
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

          <form onSubmit={handleMobileSearch} className="space-y-4">
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

            {(filtered.length > 0 || searchQuery.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {filtered.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      Suggestions
                    </div>
                    {filtered.slice(0, 5).map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setSearchQuery(item);
                          handleMobileSearch({
                            preventDefault: () => {},
                          } as React.FormEvent);
                        }}
                        className="w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                      >
                        <div className="flex items-center">
                          <Search className="mr-2 h-4 w-4 opacity-50" />
                          {item}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No products found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </form>
        </SheetContent>
      </Sheet>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-80 border" showX={false}>
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
                    <div className="font-medium">Carts</div>
                    <div className="text-xs text-muted-foreground">
                      Track & manage carts
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
