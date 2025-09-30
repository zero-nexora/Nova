"use client";

import React, { useState, useCallback } from "react";
import { Menu, ChevronDown, ChevronRight, Grid3X3 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Category, useCategoriesStore } from "@/stores/client/categories-store";
import { cn } from "@/lib/utils";
import { placeholderImage } from "@/lib/constants";

// ============================================================================
// Main Component
// ============================================================================

export const CategorySection = () => {
  const router = useRouter();
  const { categories, loading: isLoading } = useCategoriesStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Navigation handlers
  const handleCategoryClick = useCallback(
    (categorySlug: string) => {
      router.push(`/categories/${categorySlug}`);
      setIsSheetOpen(false);
    },
    [router]
  );

  const handleSubcategoryClick = useCallback(
    (subcategorySlug: string) => {
      router.push(`/subcategories/${subcategorySlug}`);
      setIsSheetOpen(false);
    },
    [router]
  );

  if (isLoading) {
    return <CategorySectionSkeleton />;
  }

  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation (lg and above) */}
        <DesktopNavigation
          categories={categories}
          onCategoryClick={handleCategoryClick}
          onSubcategoryClick={handleSubcategoryClick}
        />

        <LaptopNavigation
          categories={categories}
          onCategoryClick={handleCategoryClick}
          onSubcategoryClick={handleSubcategoryClick}
        />

        {/* Tablet Navigation (md to lg) */}
        <TabletNavigation
          categories={categories}
          onCategoryClick={handleCategoryClick}
          onSubcategoryClick={handleSubcategoryClick}
        />

        {/* Mobile Navigation */}
        <MobileNavigation
          categories={categories}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          onCategoryClick={handleCategoryClick}
          onSubcategoryClick={handleSubcategoryClick}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Desktop Navigation Component
// ============================================================================

interface NavigationProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (slug: string) => void;
}

const DesktopNavigation = ({
  categories,
  onCategoryClick,
  onSubcategoryClick,
}: NavigationProps) => (
  <div className="hidden xl:flex items-center py-4">
    {/* All Categories Dropdown */}
    <div className="flex items-center space-x-2 mr-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>All Categories</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <CategoryDropdownItem
              key={category.id}
              category={category}
              onCategoryClick={onCategoryClick}
              onSubcategoryClick={onSubcategoryClick}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Top Categories Navigation Menu */}
    <div className="flex-1">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap gap-2 justify-start">
          {categories.slice(0, 8).map((category) => (
            <NavigationMenuItem key={category.id}>
              {category.subcategories.length > 0 ? (
                <CategoryWithSubmenu
                  category={category}
                  onCategoryClick={onCategoryClick}
                  onSubcategoryClick={onSubcategoryClick}
                />
              ) : (
                <CategoryLink
                  category={category}
                  onCategoryClick={onCategoryClick}
                />
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
);

// ============================================================================
// Laptop Navigation Component
// ============================================================================

interface NavigationProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (slug: string) => void;
}

const LaptopNavigation = ({
  categories,
  onCategoryClick,
  onSubcategoryClick,
}: NavigationProps) => (
  <div className="hidden lg:flex xl:hidden items-center py-4">
    {/* All Categories Dropdown */}
    <div className="flex items-center space-x-2 mr-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>All Categories</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <CategoryDropdownItem
              key={category.id}
              category={category}
              onCategoryClick={onCategoryClick}
              onSubcategoryClick={onSubcategoryClick}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Top Categories Navigation Menu */}
    <div className="flex-1">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap gap-2 justify-start">
          {categories.slice(0, 6).map((category) => (
            <NavigationMenuItem key={category.id}>
              {category.subcategories.length > 0 ? (
                <CategoryWithSubmenu
                  category={category}
                  onCategoryClick={onCategoryClick}
                  onSubcategoryClick={onSubcategoryClick}
                />
              ) : (
                <CategoryLink
                  category={category}
                  onCategoryClick={onCategoryClick}
                />
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
);

// ============================================================================
// Tablet Navigation Component
// ============================================================================

const TabletNavigation = ({
  categories,
  onCategoryClick,
  onSubcategoryClick,
}: NavigationProps) => (
  <div className="hidden md:flex lg:hidden items-center py-4">
    {/* Categories Dropdown */}
    <div className="flex items-center space-x-2 mr-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>All Categories</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <CategoryDropdownItem
              key={category.id}
              category={category}
              onCategoryClick={onCategoryClick}
              onSubcategoryClick={onSubcategoryClick}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Top Categories Navigation Menu */}
    <div className="flex-1">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap gap-2 justify-start">
          {categories.slice(0, 4).map((category) => (
            <NavigationMenuItem key={category.id}>
              {category.subcategories.length > 0 ? (
                <CategoryWithSubmenu
                  category={category}
                  onCategoryClick={onCategoryClick}
                  onSubcategoryClick={onSubcategoryClick}
                />
              ) : (
                <CategoryLink
                  category={category}
                  onCategoryClick={onCategoryClick}
                />
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
);

// ============================================================================
// Mobile Navigation Component
// ============================================================================

interface MobileNavigationProps extends NavigationProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
}

const MobileNavigation = ({
  categories,
  isSheetOpen,
  setIsSheetOpen,
  onCategoryClick,
  onSubcategoryClick,
}: MobileNavigationProps) => {
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + cat.subcategories.length,
    0
  );

  return (
    <div className="md:hidden py-4">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 h-12 border-2 border-dashed hover:border-solid hover:bg-accent/10 transition-all duration-200 group"
          >
            <span className="font-medium">Browse Categories</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 sm:w-96 p-0">
          {/* Header */}
          <MobileSheetHeader />

          {/* Categories List */}
          <div className="overflow-auto p-2">
            <ScrollArea>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Featured Categories
                  </span>
                </div>

                <Accordion type="multiple" className="w-full">
                  {categories.map((category) => (
                    <MobileCategoryAccordion
                      key={category.id}
                      category={category}
                      onCategoryClick={onCategoryClick}
                      onSubcategoryClick={onSubcategoryClick}
                    />
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/10 p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total: {totalSubcategories} subcategories</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ============================================================================
// Category Navigation Components
// ============================================================================

interface CategoryItemProps {
  category: Category;
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (slug: string) => void;
}

const CategoryWithSubmenu = ({
  category,
  onCategoryClick,
  onSubcategoryClick,
}: CategoryItemProps) => (
  <>
    <NavigationMenuTrigger className="h-auto px-3 py-2 text-sm font-medium">
      {category.name}
    </NavigationMenuTrigger>
    <NavigationMenuContent className="min-w-[200px] p-0">
      <div className="grid gap-0">
        {/* View All Link */}
        <NavigationMenuLink
          onClick={() => onCategoryClick(category.slug)}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground cursor-pointer border-b"
          )}
        >
          <div className="text-sm font-medium leading-none">
            View All {category.name}
          </div>
        </NavigationMenuLink>

        {/* Subcategories */}
        {category.subcategories.map((subcategory) => (
          <NavigationMenuLink
            key={subcategory.id}
            onClick={() => onSubcategoryClick(subcategory.slug)}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground cursor-pointer"
            )}
          >
            <div className="text-sm leading-none text-muted-foreground">
              {subcategory.name}
            </div>
          </NavigationMenuLink>
        ))}
      </div>
    </NavigationMenuContent>
  </>
);

const CategoryLink = ({
  category,
  onCategoryClick,
}: Omit<CategoryItemProps, "onSubcategoryClick">) => (
  <NavigationMenuLink
    onClick={() => onCategoryClick(category.slug)}
    className={cn(
      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    )}
  >
    {category.name}
  </NavigationMenuLink>
);

// ============================================================================
// Dropdown Menu Components
// ============================================================================

const CategoryDropdownItem = ({
  category,
  onCategoryClick,
  onSubcategoryClick,
}: CategoryItemProps) => (
  <div>
    {/* Main Category */}
    <DropdownMenuItem asChild>
      <button
        onClick={() => onCategoryClick(category.slug)}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">{category.name}</span>
          {category.subcategories.length > 0 && (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>
      </button>
    </DropdownMenuItem>

    {/* Subcategories */}
    {category.subcategories.map((subcategory) => (
      <DropdownMenuItem key={subcategory.id} asChild>
        <button
          onClick={() => onSubcategoryClick(subcategory.slug)}
          className="w-full text-left cursor-pointer"
        >
          <span className="pl-4 text-sm text-muted-foreground">
            {subcategory.name}
          </span>
        </button>
      </DropdownMenuItem>
    ))}
  </div>
);

// ============================================================================
// Mobile Sheet Components
// ============================================================================

const MobileSheetHeader = () => (
  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
    <SheetHeader className="p-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Grid3X3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <SheetTitle className="text-xl font-bold">Categories</SheetTitle>
            <SheetDescription className="text-sm">
              Discover products by category
            </SheetDescription>
          </div>
        </div>
      </div>
    </SheetHeader>
  </div>
);

const MobileCategoryAccordion = ({
  category,
  onCategoryClick,
  onSubcategoryClick,
}: CategoryItemProps) => (
  <AccordionItem value={category.id}>
    <AccordionTrigger className="hover:no-underline hover:bg-accent/30 p-3">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {/* Category Image */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={category.image_url || placeholderImage}
              alt={category.name}
              className="object-cover"
              fill
            />
          </div>

          {/* Category Info */}
          <div className="text-left">
            <span
              className="font-semibold text-base hover:text-primary cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick(category.slug);
              }}
            >
              {category.name}
            </span>
            <p className="text-xs text-muted-foreground">
              {category.subcategories.length} subcategories
            </p>
          </div>
        </div>
      </div>
    </AccordionTrigger>

    <AccordionContent>
      <div className="space-y-1 mt-2">
        {category.subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategoryClick(subcategory.slug)}
            className="w-full group flex items-center justify-between p-3 text-left rounded-lg transition-all duration-200 border border-transparent hover:bg-accent/30"
          >
            <div className="flex items-center space-x-3">
              {/* Subcategory Image */}
              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Image
                  src={subcategory.image_url || placeholderImage}
                  alt={subcategory.name}
                  className="object-cover"
                  fill
                />
              </div>

              {/* Subcategory Info */}
              <div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {subcategory.name}
                </span>
                <p className="text-xs text-muted-foreground">Browse products</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);

// ============================================================================
// Loading Skeleton Component
// ============================================================================

const CategorySectionSkeleton = () => (
  <div className="w-full border-b">
    <div className="container mx-auto px-4">
      {/* Desktop Skeleton */}
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

      {/* Tablet Skeleton */}
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
