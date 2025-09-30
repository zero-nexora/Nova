"use client";

import Link from "next/link";
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/global/theme-toggle";
import { useDebounce } from "@/hooks/use-debounce";
import { UserButtonCustom } from "@/components/global/user-button-custom";
import { useGetSuggest } from "../hooks/products/use-get-suggest";
import { useProductFilters } from "../hooks/products/use-product-fillter";

export function Header() {
  const [filters, setFilters] = useProductFilters();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState(filters.search || "");
  const debouncedSearchQuery = useDebounce(inputValue || "", 200);

  const { suggest, isPending, error } = useGetSuggest({
    search: debouncedSearchQuery,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setInputValue(filters.search || "");
  }, [filters.search]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add recent search to localStorage
  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const newList = [query, ...prev.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newList));
      return newList;
    });
  }, []);

  // Reset search UI state
  const resetSearchUI = useCallback((closeMobile: boolean = false) => {
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setSelectedIndex(-1);
    if (closeMobile) {
      setIsMobileSearchOpen(false);
    }
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent, isMobile: boolean) => {
      e.preventDefault();

      addRecentSearch(inputValue);
      setFilters({ ...filters, search: inputValue });
      resetSearchUI(isMobile);
    },
    [inputValue, addRecentSearch, setFilters, resetSearchUI]
  );

  // Handle suggestion selection - FIXED FOR MOBILE
  const handleSuggestionSelect = useCallback(
    (item: string, isMobile: boolean) => {
      // Use setTimeout to ensure event completes before state changes
      setTimeout(() => {
        setInputValue(item);
        addRecentSearch(item);
        setFilters({ ...filters, search: item });
        resetSearchUI(isMobile);
      }, 0);
    },
    [addRecentSearch, setFilters, resetSearchUI]
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      setShowSuggestions(value.length > 0 || isSearchFocused);
      setSelectedIndex(-1);
    },
    [isSearchFocused]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const currentSuggestions =
        debouncedSearchQuery.trim().length > 0 ? suggest : recentSearches;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = Math.min(prev + 1, currentSuggestions.length - 1);
            if (newIndex >= 0) {
              setInputValue(currentSuggestions[newIndex]);
            }
            return newIndex;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = Math.max(prev - 1, -1);
            if (newIndex === -1) {
              setInputValue(debouncedSearchQuery);
            } else {
              setInputValue(currentSuggestions[newIndex]);
            }
            return newIndex;
          });
          break;

        case "Enter":
          if (selectedIndex >= 0) {
            e.preventDefault();
            handleSuggestionSelect(currentSuggestions[selectedIndex], false);
          }
          break;

        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [
      debouncedSearchQuery,
      suggest,
      recentSearches,
      selectedIndex,
      handleSuggestionSelect,
    ]
  );

  // Highlight matching text in suggestions
  const highlightText = useCallback((text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-bold">
          {part}
        </span>
      ) : (
        <span key={i} className="text-muted-foreground">
          {part}
        </span>
      )
    );
  }, []);

  // Render suggestion dropdown
  const renderSuggestionDropdown = useCallback(
    (isMobile: boolean = false) => {
      const isSearching = debouncedSearchQuery.trim().length > 0;
      const title = isSearching ? "Suggestions" : "Recent Searches";

      // Loading state
      if (isSearching && isPending) {
        return (
          <div className="p-2 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        );
      }

      // Error state
      if (error) {
        return (
          <div className="p-4 text-center text-sm text-destructive">
            Error loading suggestions: {error.message}
          </div>
        );
      }

      // Suggestions from search
      if (isSearching && suggest.length > 0) {
        return (
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              {title}
            </div>
            {suggest.map((item, index) => (
              <button
                type="button"
                key={item}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                }}
                onClick={() => handleSuggestionSelect(item, isMobile)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSuggestionSelect(item, isMobile);
                }}
                className={`w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors cursor-pointer ${
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  {highlightText(item, debouncedSearchQuery)}
                </div>
              </button>
            ))}
          </div>
        );
      }

      // No results from search
      if (isSearching && suggest.length === 0) {
        return (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No products found for &quot;{debouncedSearchQuery}&quot;
          </div>
        );
      }

      // Recent searches
      if (recentSearches.length > 0) {
        return (
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              {title}
            </div>
            {recentSearches.map((item, index) => (
              <button
                type="button"
                key={item}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                }}
                onClick={() => handleSuggestionSelect(item, isMobile)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleSuggestionSelect(item, isMobile);
                }}
                className={`w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors cursor-pointer ${
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  {highlightText(item, debouncedSearchQuery)}
                </div>
              </button>
            ))}
          </div>
        );
      }

      // Empty state
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Start typing to see suggestions
        </div>
      );
    },
    [
      debouncedSearchQuery,
      isPending,
      error,
      suggest,
      recentSearches,
      selectedIndex,
      handleSuggestionSelect,
      highlightText,
    ]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md">
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
          <div
            className="hidden sm:flex flex-1 max-w-xl mx-8 relative"
            ref={desktopSearchRef}
          >
            <form
              onSubmit={(e) => handleSearchSubmit(e, false)}
              className="w-full"
            >
              <div className="relative">
                <div className="flex items-center border rounded-lg shadow-md bg-background">
                  <Search className="ml-3 mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search products..."
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    className="border-0 focus-visible:ring-0 bg-transparent"
                  />
                </div>

                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {renderSuggestionDropdown(false)}
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
              className="sm:hidden h-10 w-10"
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

            {/* User & Theme */}
            <div className="flex items-center space-x-2">
              <UserButtonCustom />
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
      <Sheet
        open={isMobileSearchOpen}
        onOpenChange={(open) => {
          setIsMobileSearchOpen(open);
          if (!open) {
            resetSearchUI(false);
          }
        }}
      >
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

          <form
            onSubmit={(e) => handleSearchSubmit(e, true)}
            className="space-y-4 relative"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                className="pl-10 h-12 text-base border-0 focus-visible:ring-1"
                autoFocus
              />
            </div>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {renderSuggestionDropdown(true)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
