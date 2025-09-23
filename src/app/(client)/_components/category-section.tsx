"use client";

import React, { useState } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
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

export const CategorySection = () => {
  const categories = useCategoriesStore((state) => state.categories);
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
              {categories.slice(0, 6).map((category) => (
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
            {categories.slice(0, 4).map((category) => (
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
                className="w-full flex items-center justify-center space-x-2"
              >
                <Menu className="h-4 w-4" />
                <span>Browse Categories</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
                <SheetDescription>
                  Browse all product categories
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {categories.map((category) => (
                    <AccordionItem key={category.id} value={category.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="font-medium text-left hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(category.slug);
                            }}
                          >
                            {category.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() =>
                                handleSubcategoryClick(subcategory.slug)
                              }
                              className="block w-full text-left py-2 px-2 text-sm rounded transition-colors"
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </SheetContent>
          </Sheet>
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
