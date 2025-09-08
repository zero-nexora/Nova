"use client";

import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/stores/confirm-store";
import { SubcategoryList } from "./subcategory-list";
import { Category } from "@/stores/admin/categories-store";
import { CategoryDetailCard } from "./category-detail-card";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";
import { Folder, Image as ImageIcon, Calendar, Hash } from "lucide-react";
import {
  useBulkActions,
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

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const { removeImagesAsync } = useRemoveImages();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();

  // Use custom hooks for selection and bulk actions
  const {
    selectedCategories,
    selectedSubcategories,
    selectedCategoriesData,
    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount,
    hasCategorySelection,
    handleSelectAllCategories,
    handleSelectCategory,
    handleSelectSubcategory,
    handleSelectAllSubcategoriesInCategory,
    getCategorySubcategorySelection,
    clearSelection,
    clearCategorySelection,
  } = useCategorySelection(categories);

  const { bulkAction, setBulkAction, isProcessing, executeBulkAction } =
    useBulkActions();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

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

  // Bulk action handler
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction) {
      toast.error("Please select an action");
      return;
    }

    if (hasCategorySelection) {
      await executeBulkAction(
        bulkAction,
        "category",
        selectedCategoriesData,
        clearCategorySelection
      );
    }
  }, [
    bulkAction,
    hasCategorySelection,
    executeBulkAction,
    selectedCategoriesData,
    clearCategorySelection,
  ]);

  const handleViewCategory = useCallback((category: Category) => {
    openModal({
      title: "Category Details",
      children: <CategoryDetailCard category={category} />,
    });
  }, []);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Folder className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No categories found</h3>
        <p className="text-muted-foreground text-center">
          Get started by creating your first category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Bulk Actions Toolbar */}
      <BulkActionsToolbar
        totalCount={categories.length}
        selectedCount={selectedCategoriesCount}
        isAllSelected={isAllCategoriesSelected}
        isIndeterminate={isCategoriesIndeterminate}
        bulkAction={bulkAction}
        isProcessing={isProcessing}
        onSelectAll={handleSelectAllCategories}
        onBulkActionChange={setBulkAction}
        onExecuteBulkAction={handleBulkAction}
        onClearSelection={clearSelection}
        entityType="category"
      />

      {/* Categories List */}
      <div className="space-y-4">
        <Accordion type="multiple" className="w-full space-y-4">
          {categories.map((category) => {
            const {
              isAllSelected: isAllSubsSelected,
              isIndeterminate: isSubsIndeterminate,
            } = getCategorySubcategorySelection(category.id);

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border-0 shadow-none"
              >
                <Card
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    category.is_deleted && "opacity-60 border-destructive/20",
                    selectedCategories.has(category.id) &&
                      "ring-2 ring-primary/50 bg-primary/5",
                    isProcessing && "pointer-events-none opacity-75"
                  )}
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        {/* Category Checkbox */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.has(category.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCategory(
                                category.id,
                                checked as boolean
                              )
                            }
                            disabled={isProcessing}
                            className="transition-all"
                          />
                        </div>

                        {/* Category Image */}
                        <div className="relative">
                          {category.image_url ? (
                            <div className="relative">
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                width={48}
                                height={48}
                                className="object-cover rounded-lg border-2 border-background shadow-sm"
                              />
                              {category.is_deleted && (
                                <div className="absolute inset-0 bg-destructive/20 rounded-lg" />
                              )}
                              {selectedCategories.has(category.id) && (
                                <div className="absolute inset-0 bg-primary/10 rounded-lg" />
                              )}
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
                                selectedCategories.has(category.id)
                                  ? "border-primary/50 bg-primary/10"
                                  : "border-muted-foreground/25"
                              )}
                            >
                              <ImageIcon
                                className={cn(
                                  "w-5 h-5 transition-colors",
                                  selectedCategories.has(category.id)
                                    ? "text-primary/70"
                                    : "text-muted-foreground/50"
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* Category Info */}
                        <div className="flex flex-col items-start space-y-1">
                          <h3
                            className={cn(
                              "font-semibold text-lg transition-colors",
                              selectedCategories.has(category.id)
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(category.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {category.subcategories.length} subcategories
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isProcessing}
                          className="px-0"
                        >
                          {category.is_deleted ? (
                            <Badge
                              variant="destructive"
                              className="hover:bg-destructive/90"
                            >
                              Deleted
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Active
                            </Badge>
                          )}
                        </Button>

                        {/* Action Menu */}
                        <div onClick={(e) => e.stopPropagation()}>
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

                  <AccordionContent className="px-6 pb-4">
                    <div className="pl-4 border-l-2 border-muted">
                      {/* Subcategories with full functionality */}
                      <SubcategoryList
                        categoryId={category.id}
                        subcategories={category.subcategories}
                        selectedSubcategories={selectedSubcategories}
                        isProcessing={isProcessing}
                        onSelectSubcategory={handleSelectSubcategory}
                        onSelectAllSubcategories={
                          handleSelectAllSubcategoriesInCategory
                        }
                        onClearSelection={clearSelection}
                        isAllSelected={isAllSubsSelected}
                        isIndeterminate={isSubsIndeterminate}
                        formatDate={formatDate}
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

