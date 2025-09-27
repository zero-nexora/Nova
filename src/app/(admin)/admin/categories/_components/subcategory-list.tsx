import Image from "next/image";
import { cn } from "@/lib/utils";
import { Folder, Search, Filter } from "lucide-react";
import { useModal } from "@/stores/modal-store";
import { ActionMenu } from "@/components/global/action-menu";
import { Subcategory } from "@/stores/admin/categories-store";
import { SubcategoryDetailCard } from "./subcategory-detail-card";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";
import { BulkAction } from "@/app/(admin)/admin/categories/hooks/types";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubcategorySelection } from "../hooks/subcategories/use-subcategory-selection";
import { useDeleteImages } from "@/components/uploader/hooks/use-uploader";
import { useToggleSubcategoryDeleted } from "../hooks/subcategories/use-toggle-subcategory-deleted";
import { useDeleteSubcategory } from "../hooks/subcategories/use-delete-subcategory";
import { UpdateSubcategoryForm } from "@/components/forms/category/update-subcategory-form";
import { useCallback } from "react";
import { useConfirm } from "@/stores/confirm-store";
import { useToggleSubcategoryDeletedMultiple } from "../hooks/subcategories/use-toggle-subcategory-deleted-multiple";
import { useDeleteSubcategoryMultiple } from "../hooks/subcategories/use-delete-subcategory-multiple";
import { placeholderImage } from "@/lib/constants";

interface SubcategoryListProps {
  subcategories: Subcategory[];
}

export const SubcategoryList = ({ subcategories }: SubcategoryListProps) => {
  const openModal = useModal((state) => state.open);
  const openConfirm = useConfirm((state) => state.open);
  const closeConfirm = useConfirm((state) => state.close);

  const {
    selectedSubcategories,
    filteredSubcategories,

    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount,
    hasSubcategorySelection,

    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    handleSelectAllSubcategories,
    handleSelectSubcategory,
    clearSubcategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  } = useSubcategorySelection(subcategories);
  const { deleteImagesAsync } = useDeleteImages();
  const { toggleSubcategoryAsync } = useToggleSubcategoryDeleted();
  const { deleteSubcategoryAsync } = useDeleteSubcategory();
  const { toggleSubcategoryMultipleAsync } =
    useToggleSubcategoryDeletedMultiple();
  const { deleteSubcategoryMultipleAsync } = useDeleteSubcategoryMultiple();

  const handleUpdateSubcategory = useCallback(
    (subcategory: Subcategory) => {
      openModal({
        title: "Update Subcategory",
        description: "Update subcategory information",
        children: <UpdateSubcategoryForm data={subcategory} />,
      });
    },
    [openModal]
  );

  const handleToggleSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      try {
        openConfirm({
          title: subcategory.is_deleted
            ? "Restore Subcategory"
            : "Move to Trash",
          description: subcategory.is_deleted
            ? "Are you sure you want to restore this subcategory?"
            : "Are you sure you want to move this subcategory to trash?",
          onConfirm: async () => {
            await toggleSubcategoryAsync({ id: subcategory.id });
          },
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to toggle subcategory status");
        closeConfirm();
      }
    },
    [toggleSubcategoryAsync, openConfirm]
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      try {
        openConfirm({
          title: "Permanent Deletion Warning",
          description: `Permanently delete "${subcategory.name}"? This cannot be undone.
`,
          onConfirm: async () => {
            try {
              if (subcategory.public_id) {
                await deleteImagesAsync({ publicIds: [subcategory.public_id] });
              }
              await deleteSubcategoryAsync({ id: subcategory.id });
            } catch (error: any) {
              toast.error(
                error?.message || "Failed to permanently delete subcategory"
              );
              closeConfirm();
            }
          },
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to move subcategory to trash");
      }
    },
    [deleteSubcategoryAsync, deleteImagesAsync, openConfirm]
  );

  const handleSubcategoryBulkAction = async (action: BulkAction) => {
    if (!hasSubcategorySelection) {
      toast.error("No subcategories selected");
      return;
    }

    try {
      switch (action) {
        case "toggle_deleted":
          await toggleSubcategoryMultipleAsync({
            ids: Array.from(selectedSubcategories),
          });
          break;
        case "delete_permanently":
          await deleteSubcategoryMultipleAsync({
            ids: Array.from(selectedSubcategories),
          });
          break;
        default:
          toast.error("Unknown action");
          return;
      }
      clearSubcategorySelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to execute bulk action");
      closeConfirm();
    }
  };

  const handleViewSubcategory = (subcategory: Subcategory) => {
    openModal({
      title: "Subcategory Details",
      children: <SubcategoryDetailCard subcategory={subcategory} />,
    });
  };

  if (subcategories.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="relative mb-6">
          <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <div className="absolute -top-1 -right-4 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
            <Search className="w-2.5 h-2.5 text-primary/60" />
          </div>
        </div>
        <h4 className="font-semibold text-lg mb-2 text-foreground">
          No subcategories available
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Create subcategories to organize your content better and improve
          navigation
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Filter className="w-3 h-3" />
          <span>Try adjusting your search or filter settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BulkActionsToolbar
        totalCount={filteredSubcategories.length}
        selectedCount={selectedSubcategoriesCount}
        isAllSelected={isAllSubcategoriesSelected}
        isIndeterminate={isSubcategoriesIndeterminate}
        isProcessing={false}
        onSelectAll={handleSelectAllSubcategories}
        onClearSelection={clearSubcategorySelection}
        onExecuteBulkAction={handleSubcategoryBulkAction}
        entityType="subcategory"
        searchTerm={searchTerm}
        onSearch={handleSearch}
        filterDeleted={filterDeleted}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
      />

      <div className="grid">
        {filteredSubcategories.map((subcategory: Subcategory) => (
          <div
            key={subcategory.id}
            className={cn(
              "p-3 bg-muted/10 border-b rounded-none",
              subcategory.is_deleted &&
                "opacity-70 border-destructive/30 bg-destructive/10",
              selectedSubcategories.has(subcategory.id) &&
                "ring-1 ring-primary/30 bg-primary/5 rounded-md",
              subcategory.is_deleted &&
                selectedSubcategories.has(subcategory.id) &&
                "ring-1 ring-destructive/30 bg-destructive/5 rounded-md"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <Checkbox
                    id={`subcategory-${subcategory.id}`}
                    checked={selectedSubcategories.has(subcategory.id)}
                    onCheckedChange={(checked) =>
                      handleSelectSubcategory(
                        subcategory.id,
                        checked as boolean
                      )
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>

                <div className="relative group/image w-14 h-14">
                  <Image
                    src={subcategory.image_url || placeholderImage}
                    alt={subcategory.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>

                <h5
                  className={cn(
                    "font-semibold text-lg transition-colors duration-200",
                    selectedSubcategories.has(subcategory.id) && "text-primary",
                    selectedSubcategories.has(subcategory.id) &&
                      subcategory.is_deleted &&
                      "text-destructive"
                  )}
                >
                  {subcategory.name}
                </h5>
              </div>

              <div className="flex items-center gap-3">
                <div className="transition-transform">
                  {subcategory.is_deleted ? (
                    <Badge
                      variant="destructive"
                      className="px-3 py-1 font-medium shadow-sm transition-all"
                    >
                      Deleted
                    </Badge>
                  ) : (
                    <Badge
                      variant="default"
                      className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 font-medium shadow-sm transition-all"
                    >
                      Active
                    </Badge>
                  )}
                </div>

                <div className="transition-transform hover:scale-105">
                  <ActionMenu
                    onUpdate={() => handleUpdateSubcategory(subcategory)}
                    onDelete={() => handleDeleteSubcategory(subcategory)}
                    onToggle={() => handleToggleSubcategory(subcategory)}
                    onView={() => handleViewSubcategory(subcategory)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
