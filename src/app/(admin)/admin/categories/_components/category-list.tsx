"use client";

import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";
import { useCallback } from "react";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/stores/confirm-store";
import { SubcategoryList } from "./subcategory-list";
import { Category } from "@/queries/admin/categories/types";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";

import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/global/empty";
import { placeholderImage } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryDetailCard } from "./category-detail-card";
import { ActionMenu } from "@/components/global/action-menu";
import { UpdateCategoryForm } from "@/components/forms/category/update-category-form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BulkAction } from "@/app/(admin)/admin/categories/hooks/types";
import { useDeleteCategory } from "../hooks/categories/use-delete-category";
import { useCategorySelection } from "../hooks/categories/use-category-selection";
import { useToggleCategoryDeleted } from "../hooks/categories/use-toggle-category-deleted";
import { useDeleteImage } from "@/components/uploader/hooks/use-uploader";
import { useDeleteCategoryMultiple } from "../hooks/categories/use-delete-category-multiple";
import { useToggleCategoryDeletedMultiple } from "../hooks/categories/use-toggle-category-deleted-multiple";
import { useGetAllCategories } from "../hooks/categories/use-get-all-categories";

export const CategoryList = () => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const { categories } = useGetAllCategories();

  const { deleteCategoryAsync } = useDeleteCategory();
  const { deleteCategoryMultipleAsync } = useDeleteCategoryMultiple();
  const { toggleCategoryAsync } = useToggleCategoryDeleted();
  const { toggleCategoryMultipleAsync } = useToggleCategoryDeletedMultiple();
  const { deleteImageAsync } = useDeleteImage();

  const {
    selectedCategories,
    selectedCategoriesData,
    filteredCategories,

    isAllCategoriesSelected,
    isCategoriesIndeterminate,
    selectedCategoriesCount,
    hasCategorySelection,

    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    handleSelectAllCategories,
    handleSelectCategory,
    clearCategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  } = useCategorySelection(categories);

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
          description: `Permanently delete "${category.name}"? This cannot be undone.`,
          onConfirm: async () => {
            try {
              if (category.public_id) {
                await deleteImageAsync({ publicId: category.public_id });
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
    [deleteCategoryAsync, deleteImageAsync, openConfirm]
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

  const handleViewCategory = useCallback(
    (category: Category) => {
      openModal({
        title: "Category Details",
        children: <CategoryDetailCard category={category} />,
      });
    },
    [openModal]
  );

  const handleCategoryBulkAction = useCallback(
    async (action: BulkAction) => {
      if (!hasCategorySelection) {
        toast.error("No categories selected");
        return;
      }

      try {
        switch (action) {
          case "toggle_deleted":
            await toggleCategoryMultipleAsync({
              ids: Array.from(selectedCategories),
            });
            break;
          case "delete_permanently":
            await deleteCategoryMultipleAsync({
              ids: Array.from(selectedCategories),
            });
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
      deleteImageAsync,
      deleteCategoryAsync,
      clearCategorySelection,
    ]
  );

  return (
    <div className="space-y-6">
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

      <div className="space-y-3">
        <Accordion type="multiple" className="w-full">
          {filteredCategories.length === 0 && (
            <Empty />
          )}
          {filteredCategories.map((category) => {
            return (
              <AccordionItem key={category.id} value={category.id}>
                <div
                  className={cn(
                    "bg-muted/10 rounded-md hover:bg-muted/15",
                    category.is_deleted &&
                      "opacity-70 border-destructive/30 bg-destructive/10 hover:bg-destructive/15",
                    selectedCategories.has(category.id) &&
                      "ring-1 ring-primary/30 bg-primary/5",
                    category.is_deleted &&
                      selectedCategories.has(category.id) &&
                      "ring-1 ring-destructive/30 bg-destructive/5 border-l-destructive"
                  )}
                >
                  <AccordionTrigger className="p-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-5">
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
                            className={cn(
                              "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            )}
                          />
                        </div>

                        <div className="relative group/image">
                          <div className="w-14 h-14 relative overflow-hidden">
                            <Image
                              src={category.image_url || placeholderImage}
                              alt={category.name}
                              fill
                              className="object-cover rounded-xl"
                            />
                            {category.is_deleted && (
                              <div className="absolute inset-0 bg-destructive/30 rounded-xl backdrop-blur-[1px]" />
                            )}
                            {selectedCategories.has(category.id) && (
                              <div className="absolute inset-0 bg-primary/20 rounded-xl" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>

                        <div className="flex flex-col items-start space-y-2">
                          <h3
                            className={cn(
                              "font-semibold text-xl text-foreground",
                              selectedCategories.has(category.id) &&
                                "text-primary",
                              selectedCategories.has(category.id) &&
                                category.is_deleted &&
                                "text-destructive"
                            )}
                          >
                            {category.name}
                          </h3>
                          <div
                            className={cn(
                              "flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md text-muted-foreground"
                            )}
                          >
                            <Hash className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {category.subcategories.length} subcategories
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          {category.is_deleted ? (
                            <Badge
                              variant="destructive"
                              className="px-3 py-1 font-medium"
                            >
                              Deleted
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 font-medium transition-all"
                            >
                              Active
                            </Badge>
                          )}
                        </div>

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

                  <AccordionContent className="px-6 pb-6">
                    <SubcategoryList subcategories={category.subcategories} />
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};
