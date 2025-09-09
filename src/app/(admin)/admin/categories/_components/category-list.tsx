"use client";

import Image from "next/image";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { useCallback } from "react";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/stores/confirm-store";
import { SubcategoryList } from "./subcategory-list";
import { Category } from "@/stores/admin/categories-store";
import { CategoryDetailCard } from "./category-detail-card";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";
import {
  Folder,
  Image as ImageIcon,
  Calendar,
  Hash,
  Search,
  Filter,
} from "lucide-react";
import {
  useCategorySelection,
  useDeleteCategory,
  useRemoveImages,
  useToggleDeleted,
} from "../hooks/custom-hook-category";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionMenu } from "@/components/global/action-menu";
import { UpdateCategoryForm } from "@/components/forms/update-category-form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BulkAction } from "@/app/(admin)/admin/categories/hooks/types";

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const { removeImagesAsync } = useRemoveImages();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();

  // Use new separated category selection hook
  const {
    // Selection state
    selectedCategories,
    selectedCategoriesData,
    filteredCategories, // Use filtered data instead of raw categories

    // Category selection state
    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount,
    hasCategorySelection,

    // Search and filter state
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    // Handlers
    handleSelectAllCategories,
    handleSelectCategory,
    clearCategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  } = useCategorySelection(categories);

  // Category actions
  const handleUpdateCategory = useCallback(
    (category: Category) => {
      openModal({
        children: <UpdateCategoryForm data={category} />,
        title: "Update Category",
        description: "Update category information",
      });
    },
    [openModal]
  );

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Are you absolutely sure you want to permanently delete "${category.name}"? This action CANNOT be undone and will:
- Remove the category forever
- Delete associated images
- Remove all relationships`,
          onConfirm: async () => {
            try {
              if (category.public_id) {
                await removeImagesAsync({ publicIds: [category.public_id] });
              }
              await deleteCategoryAsync({ id: category.id });
            } catch (error: any) {
              toast.dismiss();
              toast.error(
                error?.message || "Failed to permanently delete category"
              );
            }
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to move category to trash");
      }
    },
    [deleteCategoryAsync, removeImagesAsync, openConfirm]
  );

  const handleToggleCategory = useCallback(
    async (category: Category) => {
      try {
        openConfirm({
          title: category.is_deleted ? "Restore Category" : "Move to Trash",
          description: category.is_deleted
            ? "Are you sure you want to restore this category?"
            : "Are you sure you want to move this category to trash?",
          onConfirm: async () => {
            await toggleCategoryAsync({ id: category.id });
          },
        });
      } catch (error: any) {
        toast.dismiss();
        toast.error(error?.message || "Failed to toggle category status");
      }
    },
    [toggleCategoryAsync, openConfirm]
  );

  // Bulk action handler - executes immediately when action is selected
  const handleCategoryBulkAction = useCallback(
    async (action: BulkAction) => {
      if (!hasCategorySelection) {
        toast.error("No categories selected");
        return;
      }

      try {
        // Add your bulk action logic here based on action type
        switch (action) {
          case "toggle_deleted":
            // Execute toggle for all selected categories
            for (const category of selectedCategoriesData) {
              await toggleCategoryAsync({ id: category.id });
            }
            toast.success(
              `Status toggled for ${selectedCategoriesData.length} categories`
            );
            break;
          case "delete_permanently":
            // Execute permanent delete for all selected categories
            for (const category of selectedCategoriesData) {
              if (category.public_id) {
                await removeImagesAsync({ publicIds: [category.public_id] });
              }
              await deleteCategoryAsync({ id: category.id });
            }
            toast.success(
              `${selectedCategoriesData.length} categories deleted permanently`
            );
            break;
          default:
            toast.error("Unknown action");
            return;
        }

        clearCategorySelection();
      } catch (error: any) {
        toast.error(error?.message || "Failed to execute bulk action");
      }
    },
    [
      hasCategorySelection,
      selectedCategoriesData,
      toggleCategoryAsync,
      removeImagesAsync,
      deleteCategoryAsync,
      clearCategorySelection,
    ]
  );

  const handleViewCategory = useCallback(
    (category: Category) => {
      openModal({
        title: "Category Details",
        children: <CategoryDetailCard category={category} />,
      });
    },
    [openModal]
  );

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <Folder className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
            <Search className="w-3 h-3 text-primary/60" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          No categories found
        </h3>
        <p className="text-muted-foreground text-center max-w-md leading-relaxed">
          Get started by creating your first category to organize your content
          effectively.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground/70">
          <Filter className="w-4 h-4" />
          <span>Try adjusting your search or filter settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Category Bulk Actions Toolbar */}
      <BulkActionsToolbar
        totalCount={filteredCategories.length}
        selectedCount={selectedCategoriesCount}
        isAllSelected={isAllCategoriesSelected}
        isIndeterminate={isCategoriesIndeterminate}
        isProcessing={false}
        onSelectAll={handleSelectAllCategories}
        onClearSelection={clearCategorySelection}
        onExecuteBulkAction={handleCategoryBulkAction}
        entityType="category"
        searchTerm={searchTerm}
        onSearch={handleSearch}
        filterDeleted={filterDeleted}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
      />

      {/* Enhanced Categories List */}
      <div className="space-y-3">
        <Accordion type="multiple" className="w-full space-y-3">
          {filteredCategories.map((category) => {
            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border-0 shadow-none"
              >
                <Card
                  className={cn(
                    "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                    "border-l-4 border-l-transparent",
                    category.is_deleted &&
                      "opacity-70 border-destructive/30 bg-destructive/5",
                    !category.is_deleted && "hover:border-l-primary/50",
                    selectedCategories.has(category.id) &&
                      "ring-2 ring-primary/30 bg-primary/8 border-l-primary shadow-lg transform -translate-y-0.5"
                  )}
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-5">
                        {/* Enhanced Category Checkbox */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="transition-transform group-hover:scale-110"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.has(category.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCategory(
                                category.id,
                                checked as boolean
                              )
                            }
                            className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>

                        {/* Enhanced Category Image */}
                        <div className="relative group/image">
                          {category.image_url ? (
                            <div className="relative overflow-hidden">
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                width={56}
                                height={56}
                                className="object-cover rounded-xl border-2 border-background shadow-md transition-all duration-300 group-hover/image:scale-105 group-hover/image:shadow-lg"
                              />
                              {category.is_deleted && (
                                <div className="absolute inset-0 bg-destructive/30 rounded-xl backdrop-blur-[1px]" />
                              )}
                              {selectedCategories.has(category.id) && (
                                <div className="absolute inset-0 bg-primary/20 rounded-xl" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-300",
                                "group-hover/image:border-solid group-hover/image:shadow-md group-hover/image:scale-105",
                                selectedCategories.has(category.id)
                                  ? "border-primary/60 bg-primary/15"
                                  : "border-muted-foreground/30 hover:border-muted-foreground/50"
                              )}
                            >
                              <ImageIcon
                                className={cn(
                                  "w-6 h-6 transition-all duration-300",
                                  selectedCategories.has(category.id)
                                    ? "text-primary/80"
                                    : "text-muted-foreground/60 group-hover/image:text-muted-foreground"
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* Enhanced Category Info */}
                        <div className="flex flex-col items-start space-y-2">
                          <h3
                            className={cn(
                              "font-semibold text-xl transition-all duration-200",
                              selectedCategories.has(category.id)
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary/80"
                            )}
                          >
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {formatDate(category.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded-md">
                              <Hash className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {category.subcategories.length} subcategories
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Enhanced Status Badge */}
                        <div className="transition-transform group-hover:scale-105">
                          {category.is_deleted ? (
                            <Badge
                              variant="destructive"
                              className="px-3 py-1 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              Deleted
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              Active
                            </Badge>
                          )}
                        </div>

                        {/* Enhanced Action Menu */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="transition-transform group-hover:scale-105"
                        >
                          <ActionMenu
                            onUpdate={() => handleUpdateCategory(category)}
                            onDelete={() => handleDeleteCategory(category)}
                            onToggle={() => handleToggleCategory(category)}
                            onView={() => handleViewCategory(category)}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6">
                    <div className="pl-6 border-l-2 border-primary/20 ml-2">
                      {/* Enhanced Subcategories with full functionality */}
                      <SubcategoryList
                        categoryId={category.id}
                        subcategories={category.subcategories}
                      />
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
