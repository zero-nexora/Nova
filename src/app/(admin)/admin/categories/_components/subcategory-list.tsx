import Image from "next/image";
import { cn } from "@/lib/utils";
import { Folder, FolderOpen } from "lucide-react";
import { useModal } from "@/stores/modal-store";
import { ActionMenu } from "@/components/global/action-menu";
import { Subcategory } from "@/stores/admin/categories-store";
import { useBulkActions } from "../hooks/custom-hook-category";
import { SubcategoryDetailCard } from "./subcategory-detail-card";
import { useSubcategoryActions } from "../hooks/custom-hook-subcategory";
import { BulkActionsToolbar } from "@/components/global/bulk-actions-toolbar";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SubcategoryListProps {
  categoryId: string;
  subcategories: Subcategory[];
  selectedSubcategories: Set<string>;
  isProcessing: boolean;
  onSelectSubcategory: (subcategoryId: string, checked: boolean) => void;
  onSelectAllSubcategories: (categoryId: string, checked: boolean) => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  formatDate: (date: Date) => string;
}

export const SubcategoryList = ({
  categoryId,
  subcategories,
  selectedSubcategories,
  isProcessing,
  onSelectSubcategory,
  onSelectAllSubcategories,
  onClearSelection,
  isAllSelected,
  isIndeterminate,
  formatDate,
}: SubcategoryListProps) => {
  const openModal = useModal((state) => state.open);

  const {
    handleUpdateSubcategory,
    handleToggleSubcategory,
    handleDeleteSubcategory,
  } = useSubcategoryActions();

  const {
    bulkAction,
    setBulkAction,
    isProcessing: isBulkProcessing,
    executeBulkAction,
  } = useBulkActions();

  const selectedSubcategoriesData = subcategories.filter((sub) =>
    selectedSubcategories.has(sub.id)
  );
  const selectedCount = selectedSubcategoriesData.length;
  const hasSelection = selectedCount > 0;

  const handleBulkAction = async () => {
    await executeBulkAction(
      bulkAction,
      "subcategory",
      selectedSubcategoriesData,
      onClearSelection
    );
  };

  const handleViewSubcategory = (subcategory: Subcategory) => {
    openModal({
      title: "Subcategory Details",
      children: <SubcategoryDetailCard subcategory={subcategory} />,
    });
  };

  if (subcategories.length === 0) {
    return (
      <div className="py-8 text-center">
        <Folder className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-muted-foreground font-medium">
          No subcategories available
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Create subcategories to organize your content better
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-muted-foreground flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Subcategories ({subcategories.length})
        </h4>

        {/* Subcategory Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`select-all-subcategories-${categoryId}`}
            checked={isAllSelected}
            onCheckedChange={(checked) =>
              onSelectAllSubcategories(categoryId, checked as boolean)
            }
            ref={(ref) => {
              if (ref)
                (ref as unknown as HTMLInputElement).indeterminate =
                  isIndeterminate;
            }}
            disabled={isProcessing || isBulkProcessing}
          />
          <label
            htmlFor={`select-all-subcategories-${categoryId}`}
            className="text-sm text-muted-foreground"
          >
            Select All
          </label>
        </div>
      </div>

      {/* Bulk Actions for Subcategories */}
      {hasSelection && (
        <BulkActionsToolbar
          totalCount={subcategories.length}
          selectedCount={selectedCount}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          bulkAction={bulkAction}
          isProcessing={isBulkProcessing}
          onSelectAll={(checked) =>
            onSelectAllSubcategories(categoryId, checked)
          }
          onBulkActionChange={setBulkAction}
          onExecuteBulkAction={handleBulkAction}
          onClearSelection={onClearSelection}
          entityType="subcategory"
        />
      )}

      {/* Subcategories Grid */}
      <div className="grid gap-3">
        {subcategories.map((subcategory: Subcategory) => (
          <Card
            key={subcategory.id}
            className={cn(
              "p-4 bg-muted/20 border-muted transition-all hover:shadow-sm",
              subcategory.is_deleted && "opacity-60 border-destructive/20",
              selectedSubcategories.has(subcategory.id) &&
                "bg-primary/5 border-primary/20 ring-1 ring-primary/30",
              (isProcessing || isBulkProcessing) &&
                "pointer-events-none opacity-75"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Subcategory Checkbox */}
                <Checkbox
                  id={`subcategory-${subcategory.id}`}
                  checked={selectedSubcategories.has(subcategory.id)}
                  onCheckedChange={(checked) =>
                    onSelectSubcategory(subcategory.id, checked as boolean)
                  }
                  disabled={isProcessing || isBulkProcessing}
                  className="transition-all"
                />

                {/* Subcategory Image */}
                <div className="relative">
                  {subcategory.image_url ? (
                    <div className="relative">
                      <Image
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        width={40}
                        height={40}
                        className="object-cover rounded-md border shadow-sm"
                      />
                      {subcategory.is_deleted && (
                        <div className="absolute inset-0 bg-destructive/20 rounded-md" />
                      )}
                      {selectedSubcategories.has(subcategory.id) && (
                        <div className="absolute inset-0 bg-primary/10 rounded-md" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-md border-2 border-dashed flex items-center justify-center transition-colors",
                        selectedSubcategories.has(subcategory.id)
                          ? "border-primary/50 bg-primary/10"
                          : "border-muted-foreground/25"
                      )}
                    >
                      <Folder
                        className={cn(
                          "w-4 h-4 transition-colors",
                          selectedSubcategories.has(subcategory.id)
                            ? "text-primary/70"
                            : "text-muted-foreground/50"
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Subcategory Info */}
                <div className="space-y-1">
                  <h5
                    className={cn(
                      "font-medium transition-colors",
                      selectedSubcategories.has(subcategory.id)
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {subcategory.name}
                  </h5>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Slug: {subcategory.slug}</span>
                    <span>•</span>
                    <span>{formatDate(subcategory.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || isBulkProcessing}
                  className="px-0"
                >
                  {subcategory.is_deleted ? (
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
                <ActionMenu
                  onUpdate={() => handleUpdateSubcategory(subcategory)}
                  onDelete={() => handleDeleteSubcategory(subcategory)}
                  onToggle={() => handleToggleSubcategory(subcategory)}
                  onView={() => handleViewSubcategory(subcategory)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
