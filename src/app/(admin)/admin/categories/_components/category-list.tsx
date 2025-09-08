"use client";

import { UpdateCategoryForm } from "@/components/forms/update-category-form";
import { ActionMenu } from "@/components/global/action-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, Subcategory } from "@/stores/admin/categories-store";
import { useConfirm } from "@/stores/confirm-store";
import { useModal } from "@/stores/modal-store";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import {
  useDeleteCategory,
  useRemoveImages,
  useToggleDeleted,
} from "../hooks/custom-hook-category";
import { toast } from "sonner";
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Calendar,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";

type BulkAction = "toggle_deleted" | "delete_permanently" | "";

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);

  const { removeImagesAsync } = useRemoveImages();
  const { deleteCategoryAsync } = useDeleteCategory();
  const { toggleCategoryAsync } = useToggleDeleted();

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [bulkAction, setBulkAction] = useState<BulkAction>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoized values
  const selectedCategoriesData = useMemo(() => {
    return categories.filter((category) => selectedCategories.has(category.id));
  }, [categories, selectedCategories]);

  const isAllSelected = useMemo(() => {
    return (
      categories.length > 0 && selectedCategories.size === categories.length
    );
  }, [categories.length, selectedCategories.size]);

  const isIndeterminate = useMemo(() => {
    return (
      selectedCategories.size > 0 && selectedCategories.size < categories.length
    );
  }, [selectedCategories.size, categories.length]);

  const selectedCount = selectedCategories.size;
  const hasSelection = selectedCount > 0;

  // Selection handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCategories(new Set(categories.map((cat) => cat.id)));
      } else {
        setSelectedCategories(new Set());
      }
    },
    [categories]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(categoryId);
        } else {
          newSet.delete(categoryId);
        }
        return newSet;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedCategories(new Set());
    setBulkAction("");
  }, []);

  // Bulk action handlers
  const handleBulkToggleDeleted = useCallback(async () => {
    if (selectedCategories.size === 0) return;

    const selectedCats = selectedCategoriesData;
    const activeCount = selectedCats.filter((cat) => !cat.is_deleted).length;
    const deletedCount = selectedCats.filter((cat) => cat.is_deleted).length;

    openConfirm({
      title: "Bulk Toggle Status",
      description: `Are you sure you want to toggle status for ${selectedCategories.size} categories?
  - ${activeCount} active categories will be moved to trash
  - ${deletedCount} deleted categories will be restored`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await Promise.all(
            selectedCats.map((category) =>
              toggleCategoryAsync({ id: category.id })
            )
          );
          clearSelection();
        } catch (error: any) {
          toast.error(error?.message || "Failed to toggle categories");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  }, [
    selectedCategories,
    selectedCategoriesData,
    openConfirm,
    toggleCategoryAsync,
    clearSelection,
  ]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedCategories.size === 0) return;

    const selectedCats = selectedCategoriesData;
    const categoryNames = selectedCats.map((cat) => cat.name).join(", ");

    openConfirm({
      title: "Permanent Bulk Deletion Warning",
      description: `Are you absolutely sure you want to permanently delete these ${selectedCategories.size} categories?
  
  Categories: ${categoryNames}
  
  This action CANNOT be undone and will:
  - Remove all categories forever
  - Delete associated images
  - Remove all relationships`,
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          // Remove images first
          const publicIds = selectedCats
            .filter((cat) => cat.public_id)
            .map((cat) => cat.public_id!);

          if (publicIds.length > 0) {
            await removeImagesAsync({ publicIds });
          }

          // Delete categories
          await Promise.all(
            selectedCats.map((category) =>
              deleteCategoryAsync({ id: category.id })
            )
          );

          clearSelection();
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete categories");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  }, [
    selectedCategories,
    selectedCategoriesData,
    openConfirm,
    deleteCategoryAsync,
    removeImagesAsync,
    clearSelection,
  ]);

  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedCategories.size === 0) {
      toast.error("Please select categories and an action");
      return;
    }

    switch (bulkAction) {
      case "toggle_deleted":
        await handleBulkToggleDeleted();
        break;
      case "delete_permanently":
        await handleBulkDelete();
        break;
    }
  }, [
    bulkAction,
    selectedCategories.size,
    handleBulkToggleDeleted,
    handleBulkDelete,
  ]);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

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
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        totalCount={categories.length}
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        bulkAction={bulkAction}
        isProcessing={isProcessing}
        onSelectAll={handleSelectAll}
        onBulkActionChange={setBulkAction}
        onExecuteBulkAction={handleBulkAction}
        onClearSelection={clearSelection}
      />

      {/* Categories List */}
      <div className="space-y-4">
        <Accordion type="multiple" className="w-full space-y-4">
          {categories.map((category) => (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCategory(category);
                        }}
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
                        />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-4">
                  <div className="pl-4 border-l-2 border-muted">
                    {category.subcategories.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-muted-foreground flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Subcategories ({category.subcategories.length})
                        </h4>
                        <div className="grid gap-3">
                          {category.subcategories.map(
                            (subcategory: Subcategory) => (
                              <Card
                                key={subcategory.id}
                                className={cn(
                                  "p-4 bg-muted/20 border-muted transition-all",
                                  selectedCategories.has(category.id) &&
                                    "bg-primary/5 border-primary/20"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {/* Subcategory Image */}
                                    {subcategory.image_url ? (
                                      <Image
                                        src={subcategory.image_url}
                                        alt={subcategory.name}
                                        width={40}
                                        height={40}
                                        className="object-cover rounded-md border shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                                        <Folder className="w-4 h-4 text-muted-foreground/50" />
                                      </div>
                                    )}

                                    {/* Subcategory Info */}
                                    <div className="space-y-1">
                                      <h5 className="font-medium text-foreground">
                                        {subcategory.name}
                                      </h5>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Slug: {subcategory.slug}</span>
                                        <span>•</span>
                                        <span>
                                          {formatDate(subcategory.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {subcategory.is_deleted ? (
                                      <Badge variant="destructive">
                                        Deleted
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Active</Badge>
                                    )}
                                    <ActionMenu />
                                  </div>
                                </div>
                              </Card>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Folder className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground font-medium">
                          No subcategories available
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Create subcategories to organize your content better
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CategoryList;
