import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderOpen,
  Calendar,
  Hash,
  Search,
  Filter,
} from "lucide-react";
import { useModal } from "@/stores/modal-store";
import { ActionMenu } from "@/components/global/action-menu";
import { Subcategory } from "@/stores/admin/categories-store";
import { SubcategoryDetailCard } from "./subcategory-detail-card";
import {
  useSubcategoryActions,
  useSubcategorySelection,
} from "../hooks/custom-hook-subcategory";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";
import { BulkAction } from "@/app/(admin)/admin/categories/hooks/types";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface SubcategoryListProps {
  subcategories: Subcategory[];
}

export const SubcategoryList = ({
  subcategories,
}: SubcategoryListProps) => {
  const openModal = useModal((state) => state.open);

  const {
    handleUpdateSubcategory,
    handleToggleSubcategory,
    handleDeleteSubcategory,
  } = useSubcategoryActions();

  // Use new separated subcategory selection hook
  const {
    // Selection state
    selectedSubcategories,
    selectedSubcategoriesData,
    filteredSubcategories, // Use filtered data instead of raw subcategories

    // Subcategory selection state
    isAllSubcategoriesSelected,
    isSubcategoriesIndeterminate,
    selectedSubcategoriesCount,
    hasSubcategorySelection,

    // Search and filter state
    searchTerm,
    filterDeleted,
    sortBy,
    sortOrder,

    // Handlers
    handleSelectAllSubcategories,
    handleSelectSubcategory,
    clearSubcategorySelection,
    handleSearch,
    handleFilterChange,
    handleSortChange,
    handleSortOrderChange,
  } = useSubcategorySelection(subcategories);

  // Bulk action handler - executes immediately when action is selected
  const handleSubcategoryBulkAction = async (action: BulkAction) => {
    if (!hasSubcategorySelection) {
      toast.error("No subcategories selected");
      return;
    }

    try {
      // Add your bulk action logic here based on action type
      switch (action) {
        case "toggle_deleted":
          // Execute toggle for all selected subcategories
          for (const subcategory of selectedSubcategoriesData) {
            await handleToggleSubcategory(subcategory);
          }
          toast.success(
            `Status toggled for ${selectedSubcategoriesData.length} subcategories`
          );
          break;
        case "delete_permanently":
          // Execute permanent delete for all selected subcategories
          for (const subcategory of selectedSubcategoriesData) {
            await handleDeleteSubcategory(subcategory);
          }
          toast.success(
            `${selectedSubcategoriesData.length} subcategories deleted permanently`
          );
          break;
        default:
          toast.error("Unknown action");
          return;
      }

      clearSubcategorySelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to execute bulk action");
    }
  };

  const handleViewSubcategory = (subcategory: Subcategory) => {
    openModal({
      title: "Subcategory Details",
      children: <SubcategoryDetailCard subcategory={subcategory} />,
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <span>Subcategories</span>
          <Badge
            variant="secondary"
            className="bg-muted/50 text-muted-foreground"
          >
            {filteredSubcategories.length}
          </Badge>
        </h4>
      </div>

      {/* Enhanced Bulk Actions for Subcategories */}
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

      {/* Enhanced Subcategories Grid */}
      <div className="grid gap-4">
        {filteredSubcategories.map((subcategory: Subcategory) => (
          <Card
            key={subcategory.id}
            className={cn(
              "p-5 bg-gradient-to-br from-muted/30 to-muted/10 border-muted transition-all duration-300",
              "hover:shadow-lg hover:from-muted/40 hover:to-muted/20",
              "border-l-4 border-l-transparent",
              subcategory.is_deleted &&
                "opacity-70 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/5",
              !subcategory.is_deleted && "hover:border-l-primary/50",
              selectedSubcategories.has(subcategory.id) &&
                "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 ring-2 ring-primary/20 shadow-md transform -translate-y-0.5 border-l-primary"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Enhanced Subcategory Checkbox */}
                <div className="transition-transform hover:scale-110">
                  <Checkbox
                    id={`subcategory-${subcategory.id}`}
                    checked={selectedSubcategories.has(subcategory.id)}
                    onCheckedChange={(checked) =>
                      handleSelectSubcategory(
                        subcategory.id,
                        checked as boolean
                      )
                    }
                    className="transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>

                {/* Enhanced Subcategory Image */}
                <div className="relative group/image">
                  {subcategory.image_url ? (
                    <div className="relative overflow-hidden">
                      <Image
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        width={48}
                        height={48}
                        className="object-cover rounded-lg border-2 border-background shadow-sm transition-all duration-300 group-hover/image:scale-105 group-hover/image:shadow-md"
                      />
                      {subcategory.is_deleted && (
                        <div className="absolute inset-0 bg-destructive/30 rounded-lg backdrop-blur-[1px]" />
                      )}
                      {selectedSubcategories.has(subcategory.id) && (
                        <div className="absolute inset-0 bg-primary/20 rounded-lg" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300",
                        "group-hover/image:border-solid group-hover/image:shadow-sm group-hover/image:scale-105",
                        selectedSubcategories.has(subcategory.id)
                          ? "border-primary/60 bg-primary/15"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50"
                      )}
                    >
                      <Folder
                        className={cn(
                          "w-5 h-5 transition-all duration-300",
                          selectedSubcategories.has(subcategory.id)
                            ? "text-primary/80"
                            : "text-muted-foreground/60 group-hover/image:text-muted-foreground"
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Enhanced Subcategory Info */}
                <div className="space-y-2">
                  <h5
                    className={cn(
                      "font-semibold text-lg transition-colors duration-200",
                      selectedSubcategories.has(subcategory.id)
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary/80"
                    )}
                  >
                    {subcategory.name}
                  </h5>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 rounded text-xs font-medium">
                      <Hash className="w-3 h-3" />
                      <span>{subcategory.slug}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(subcategory.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Enhanced Status Badge */}
                <div className="transition-transform hover:scale-105">
                  {subcategory.is_deleted ? (
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
          </Card>
        ))}
      </div>
    </div>
  );
};
