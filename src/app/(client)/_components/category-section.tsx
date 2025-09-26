"use client";

import React, { useState } from "react";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Sparkles,
  Package,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Category, useCategoriesStore } from "@/stores/client/categories-store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const CategorySection = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.loading);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCategoryClick = (categorySlug: string) => {
    console.log(`Navigate to category: ${categorySlug}`);
    // Add your navigation logic here
  };

  const handleSubcategoryClick = (subcategorySlug: string) => {
    console.log(`Navigate to subcategory: ${subcategorySlug}`);
    setIsSheetOpen(false); // Close sheet on mobile after selection
    // Add your navigation logic here
  };

  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: { [key: string]: string } = {
      electronics: "📱",
      fashion: "👕",
      clothing: "👚",
      shoes: "👟",
      home: "🏠",
      garden: "🌱",
      kitchen: "🍳",
      sports: "⚽",
      fitness: "🏋️",
      books: "📚",
      toys: "🧸",
      beauty: "💄",
      health: "🏥",
      automotive: "🚗",
      jewelry: "💎",
      music: "🎵",
      gaming: "🎮",
      office: "🏢",
      pets: "🐕",
      travel: "✈️",
    };

    const key = categoryName.toLowerCase().split(" ")[0];
    return iconMap[key] || "📦";
  };

  // Helper function to determine if category is featured (e.g., has many subcategories)
  const isFeaturedCategory = (category: Category): boolean => {
    return category.subcategories.length >= 3;
  };

  if (isLoading) return <CategorySectionSkeleton />;

  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center py-4">
          <div className="flex items-center space-x-2 mr-8">
            {/* All Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Menu className="h-4 w-4" />
                  <span>All Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id}>
                    <DropdownMenuItemWithSubcategories
                      category={category}
                      onCategoryClick={handleCategoryClick}
                      onSubcategoryClick={handleSubcategoryClick}
                    />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation Menu for Categories */}
          <NavigationMenu className="flex-1">
            <NavigationMenuList className="flex-wrap gap-2">
              {categories.slice(0, 7).map((category) => (
                <NavigationMenuItem key={category.id}>
                  {category.subcategories.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="h-auto px-3 py-2 text-sm font-medium">
                        {category.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="min-w-[200px] p-0">
                        <div className="grid gap-0">
                          <NavigationMenuLink
                            onClick={() => handleCategoryClick(category.slug)}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer border-b"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              View All {category.name}
                            </div>
                          </NavigationMenuLink>
                          {category.subcategories.map((subcategory) => (
                            <NavigationMenuLink
                              key={subcategory.id}
                              onClick={() =>
                                handleSubcategoryClick(subcategory.slug)
                              }
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                              )}
                            >
                              <div className="text-sm leading-none text-muted-foreground hover:text-foreground">
                                {subcategory.name}
                              </div>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      onClick={() => handleCategoryClick(category.slug)}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                      )}
                    >
                      {category.name}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center py-4">
          <div className="flex items-center space-x-2 mr-4">
            {/* All Categories Dropdown for Tablet */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Menu className="h-4 w-4" />
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id}>
                    <DropdownMenuItemWithSubcategories
                      category={category}
                      onCategoryClick={handleCategoryClick}
                      onSubcategoryClick={handleSubcategoryClick}
                    />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick access to top categories */}
          <div className="flex items-center space-x-1 flex-wrap">
            {categories.slice(0, 7).map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryClick(category.slug)}
                className="text-xs px-2 py-1 h-8"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 h-12 border-2 border-dashed hover:border-solid hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="relative">
                  <Grid3X3 className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-medium">Browse Categories</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-80 sm:w-96 p-0">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <SheetHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Grid3X3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <SheetTitle className="text-xl font-bold">
                          Categories
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                          Discover products by category
                        </SheetDescription>
                      </div>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* Categories List */}
              <ScrollArea className="flex-1 px-6">
                <div className="py-6">
                  {/* Featured Categories Badge */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Featured Categories
                    </span>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-2"
                  >
                    {categories.map((category) => (
                      <AccordionItem
                        key={category.id}
                        value={category.id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              {/* Category Icon or Image */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                {category.image_url ? (
                                  <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl">
                                    {getCategoryIcon(category.name)}
                                  </span>
                                )}
                              </div>

                              {/* Category Info */}
                              <div className="text-left">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="font-semibold text-base hover:text-primary cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCategoryClick(category.slug);
                                    }}
                                  >
                                    {category.name}
                                  </span>
                                  {isFeaturedCategory(category) && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {category.subcategories.length} subcategories
                                </p>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-4 pb-4 bg-muted/20">
                          <div className="space-y-1 mt-2">
                            {category.subcategories.map(
                              (subcategory, index) => (
                                <button
                                  key={subcategory.id}
                                  onClick={() =>
                                    handleSubcategoryClick(subcategory.slug)
                                  }
                                  className="w-full group flex items-center justify-between p-3 text-left rounded-lg hover:bg-background hover:shadow-sm transition-all duration-200 border border-transparent hover:border-border"
                                >
                                  <div className="flex items-center space-x-3">
                                    {/* Subcategory Image or Icon */}
                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/50 flex items-center justify-center flex-shrink-0">
                                      {subcategory.image_url ? (
                                        <img
                                          src={subcategory.image_url}
                                          alt={subcategory.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>

                                    <div>
                                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {subcategory.name}
                                      </span>
                                      <p className="text-xs text-muted-foreground">
                                        Browse products
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </button>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t bg-muted/10 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Total:{" "}
                    {categories.reduce(
                      (acc, cat) => acc + cat.subcategories.length,
                      0
                    )}{" "}
                    subcategories
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

const CategorySectionSkeleton = () => {
  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4">
        <div className="hidden lg:flex items-center py-4">
          <div className="flex items-center space-x-2 mr-8">
            <div className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-background">
              <Menu className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 w-24" />
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-1">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-9 w-20" />
            ))}
          </div>
        </div>

        <div className="hidden md:flex lg:hidden items-center py-4">
          <div className="flex items-center space-x-2 mr-4">
            <div className="flex items-center space-x-2 border rounded-md px-2 py-1 bg-background text-sm">
              <Menu className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-4 w-16" />
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-wrap">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-8 w-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="md:hidden py-4">
          <div className="w-full flex items-center justify-center space-x-2 border rounded-md px-4 py-2 bg-background">
            <Menu className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for dropdown menu items with subcategories
const DropdownMenuItemWithSubcategories: React.FC<{
  category: Category;
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (slug: string) => void;
}> = ({ category, onCategoryClick, onSubcategoryClick }) => {
  return (
    <div>
      <DropdownMenuItemClickable onClick={() => onCategoryClick(category.slug)}>
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">{category.name}</span>
          {category.subcategories.length > 0 && (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>
      </DropdownMenuItemClickable>
      {category.subcategories.map((subcategory) => (
        <DropdownMenuItemClickable
          key={subcategory.id}
          onClick={() => onSubcategoryClick(subcategory.slug)}
        >
          <span className="pl-4 text-sm text-muted-foreground">
            {subcategory.name}
          </span>
        </DropdownMenuItemClickable>
      ))}
    </div>
  );
};

// Helper component for clickable dropdown menu items
const DropdownMenuItemClickable: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  return (
    <DropdownMenuItem asChild>
      <button onClick={onClick} className="w-full text-left cursor-pointer">
        {children}
      </button>
    </DropdownMenuItem>
  );
};
