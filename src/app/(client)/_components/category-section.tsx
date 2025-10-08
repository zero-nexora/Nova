"use client";

import React, { useState, useCallback } from "react";
import { Menu, ChevronRight, Grid3X3, Filter } from "lucide-react";
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
import ProductFilter from "./product-filter";

// ============================================================================
// Types
// ============================================================================

interface NavigationProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (categorySlug: string, subcategorySlug: string) => void;
  isFilterSheetOpen: boolean;
  setIsFilterSheetOpen: (open: boolean) => void;
  onFilterClose: () => void;
}

interface CategoryItemProps {
  category: Category;
  categories: Category[];
  onCategoryClick: (slug: string) => void;
  onSubcategoryClick: (categorySlug: string, subcategorySlug: string) => void;
}

interface MobileNavigationProps extends NavigationProps {
  isCategorySheetOpen: boolean;
  setIsCategorySheetOpen: (open: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_LIMITS = {
  DESKTOP: 8,
  LAPTOP: 6,
  TABLET: 4,
} as const;

// ============================================================================
// Main Component
// ============================================================================

export const CategorySection = () => {
  const router = useRouter();
  const { categories, loading: isLoading } = useCategoriesStore();
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const handleCategoryClick = useCallback(
    (categorySlug: string) => {
      router.push(`/categories/${categorySlug}`);
      setIsCategorySheetOpen(false);
      setIsFilterSheetOpen(false);
    },
    [router]
  );

  const handleSubcategoryClick = useCallback(
    (categorySlug: string, subcategorySlug: string) => {
      router.push(
        `/categories/${categorySlug}/subcategories/${subcategorySlug}`
      );
      setIsCategorySheetOpen(false);
      setIsFilterSheetOpen(false);
    },
    [router]
  );

  const handleFilterClose = useCallback(() => {
    setIsFilterSheetOpen(false);
  }, []);

  if (isLoading) {
    return <CategorySectionSkeleton />;
  }

  const navigationProps: NavigationProps = {
    categories,
    onCategoryClick: handleCategoryClick,
    onSubcategoryClick: handleSubcategoryClick,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    onFilterClose: handleFilterClose,
  };

  return (
    <div className="w-full border-b">
      <div className="container mx-auto">
        <DesktopNavigation {...navigationProps} />
        <LaptopNavigation {...navigationProps} />
        <TabletNavigation {...navigationProps} />
        <MobileNavigation
          {...navigationProps}
          isCategorySheetOpen={isCategorySheetOpen}
          setIsCategorySheetOpen={setIsCategorySheetOpen}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Responsive Navigation Components
// ============================================================================

const DesktopNavigation = (props: NavigationProps) => (
  <ResponsiveNavigation
    {...props}
    limit={CATEGORY_LIMITS.DESKTOP}
    className="hidden xl:flex"
  />
);

const LaptopNavigation = (props: NavigationProps) => (
  <ResponsiveNavigation
    {...props}
    limit={CATEGORY_LIMITS.LAPTOP}
    className="hidden lg:flex xl:hidden"
  />
);

const TabletNavigation = (props: NavigationProps) => (
  <ResponsiveNavigation
    {...props}
    limit={CATEGORY_LIMITS.TABLET}
    className="hidden md:flex lg:hidden"
  />
);

// ============================================================================
// Shared Responsive Navigation
// ============================================================================

interface ResponsiveNavigationProps extends NavigationProps {
  limit: number;
  className?: string;
}

const ResponsiveNavigation = ({
  categories,
  limit,
  className,
  onCategoryClick,
  onSubcategoryClick,
  isFilterSheetOpen,
  setIsFilterSheetOpen,
  onFilterClose,
}: ResponsiveNavigationProps) => (
  <div className={cn("items-center py-4", className)}>
    <div className="flex items-center space-y-2 mr-8 flex-col">
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 w-full"
          >
            <Filter className="h-4 w-4" />
            <span>Filter Products</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 sm:w-96 p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">
                  Product Filters
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your product search
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4">
              <ProductFilter onClose={onFilterClose} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>

    <div className="flex-1">
      <NavigationMenu>
        <NavigationMenuList className="flex-wrap gap-2 justify-start">
          {categories.slice(0, limit).map((category) => (
            <NavigationMenuItem key={category.id}>
              {category.subcategories.length > 0 ? (
                <CategoryWithSubmenu
                  category={category}
                  categories={categories}
                  onCategoryClick={onCategoryClick}
                  onSubcategoryClick={onSubcategoryClick}
                />
              ) : (
                <CategoryLink
                  category={category}
                  categories={categories}
                  onCategoryClick={onCategoryClick}
                  onSubcategoryClick={onSubcategoryClick}
                />
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>

    <AllCategoriesDropdown
      categories={categories}
      onCategoryClick={onCategoryClick}
      onSubcategoryClick={onSubcategoryClick}
    />
  </div>
);

// ============================================================================
// All Categories Dropdown
// ============================================================================

const AllCategoriesDropdown = ({
  categories,
  onCategoryClick,
  onSubcategoryClick,
}: Pick<
  NavigationProps,
  "categories" | "onCategoryClick" | "onSubcategoryClick"
>) => (
  <div className="flex items-center space-x-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Menu className="h-4 w-4" />
          <span>All Categories</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 h-72">
        <ScrollArea className="h-full">
          {categories.map((category) => (
            <CategoryDropdownItem
              key={category.id}
              category={category}
              categories={categories}
              onCategoryClick={onCategoryClick}
              onSubcategoryClick={onSubcategoryClick}
            />
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// ============================================================================
// Category Navigation Menu Items
// ============================================================================

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
        <NavigationMenuLink
          onClick={() => onCategoryClick(category.slug)}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none",
            "transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground",
            "cursor-pointer border-b"
          )}
        >
          <div className="text-sm font-medium leading-none">
            View All {category.name}
          </div>
        </NavigationMenuLink>

        {category.subcategories.map((subcategory) => (
          <NavigationMenuLink
            key={subcategory.id}
            onClick={() => onSubcategoryClick(category.slug, subcategory.slug)}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none",
              "transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground",
              "cursor-pointer"
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

const CategoryLink = ({ category, onCategoryClick }: CategoryItemProps) => (
  <NavigationMenuLink
    onClick={() => onCategoryClick(category.slug)}
    className={cn(
      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background",
      "px-3 py-2 text-sm font-medium transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
      "disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    )}
  >
    {category.name}
  </NavigationMenuLink>
);

// ============================================================================
// Dropdown Menu Items
// ============================================================================

const CategoryDropdownItem = ({
  category,
  onCategoryClick,
  onSubcategoryClick,
}: CategoryItemProps) => (
  <div>
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

    {category.subcategories.map((subcategory) => (
      <DropdownMenuItem key={subcategory.id} asChild>
        <button
          onClick={() => onSubcategoryClick(category.slug, subcategory.slug)}
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
// Mobile Navigation
// ============================================================================

const MobileNavigation = ({
  categories,
  isCategorySheetOpen,
  setIsCategorySheetOpen,
  isFilterSheetOpen,
  setIsFilterSheetOpen,
  onCategoryClick,
  onSubcategoryClick,
  onFilterClose,
}: MobileNavigationProps) => {
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + cat.subcategories.length,
    0
  );

  return (
    <div className="md:hidden py-4 flex flex-col gap-4">
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 h-12"
          >
            <Filter className="h-4 w-4" />
            <span>Filter Products</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 sm:w-96 p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">
                  Product Filters
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Refine your product search
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4">
              <ProductFilter onClose={onFilterClose} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 h-12"
          >
            <span className="font-medium">Browse Categories</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 sm:w-96 p-0">
          <MobileSheetHeader />

          <div className="overflow-auto p-2">
            <ScrollArea className="h-full">
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
                      categories={categories}
                      onCategoryClick={onCategoryClick}
                      onSubcategoryClick={onSubcategoryClick}
                    />
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </div>

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
          <CategoryImage
            src={category.image_url}
            alt={category.name}
            size="lg"
          />

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
            onClick={() => onSubcategoryClick(category.slug, subcategory.slug)}
            className={cn(
              "w-full group flex items-center justify-between p-3 text-left rounded-lg",
              "transition-all duration-200 border border-transparent hover:bg-accent/30"
            )}
          >
            <div className="flex items-center space-x-3">
              <CategoryImage
                src={subcategory.image_url}
                alt={subcategory.name}
                size="sm"
              />

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
// Shared Components
// ============================================================================

interface CategoryImageProps {
  src: string | null;
  alt: string;
  size: "sm" | "lg";
}

const CategoryImage = ({ src, alt, size }: CategoryImageProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-md",
    lg: "w-10 h-10 rounded-lg",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted flex items-center justify-center flex-shrink-0",
        sizeClasses[size]
      )}
    >
      <Image
        src={src || placeholderImage}
        alt={alt}
        className="object-cover"
        fill
      />
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const CategorySectionSkeleton = () => (
  <div className="w-full border-b">
    <div className="container mx-auto px-4">
      <SkeletonNavigation
        count={CATEGORY_LIMITS.DESKTOP}
        className="hidden xl:flex"
      />

      <SkeletonNavigation
        count={CATEGORY_LIMITS.LAPTOP}
        className="hidden lg:flex xl:hidden"
      />

      <SkeletonNavigation
        count={CATEGORY_LIMITS.TABLET}
        className="hidden md:flex lg:hidden"
      />

      <div className="md:hidden py-4">
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  </div>
);

interface SkeletonNavigationProps {
  count: number;
  className?: string;
}

const SkeletonNavigation = ({ count, className }: SkeletonNavigationProps) => (
  <div className={cn("items-center py-4", className)}>
    <div className="flex flex-col items-center space-y-2 mr-8">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="flex items-center space-x-4 flex-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24" />
      ))}
    </div>
  </div>
);
