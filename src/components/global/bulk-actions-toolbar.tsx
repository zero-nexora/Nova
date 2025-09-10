import {
  Trash2,
  RotateCcw,
  X,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  BulkAction,
  EntityType,
} from "@/app/(admin)/admin/categories/hooks/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/stores/confirm-store";

interface BulkActionsToolbarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  isProcessing: boolean;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onExecuteBulkAction: (action: BulkAction) => void;
  entityType?: EntityType;

  // Search and filter props
  searchTerm: string;
  onSearch: (term: string) => void;
  filterDeleted: "all" | "active" | "deleted";
  onFilterChange: (filter: "all" | "active" | "deleted") => void;
  sortBy: "name" | "created_at" | "updated_at";
  onSortChange: (sort: "name" | "created_at" | "updated_at") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
}

export const BulkActionsToolbar = ({
  totalCount,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  isProcessing,
  onSelectAll,
  onClearSelection,
  onExecuteBulkAction,
  entityType = "category",
  searchTerm,
  onSearch,
  filterDeleted,
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: BulkActionsToolbarProps) => {
  const openConfirm = useConfirm((state) => state.open);
  const hasSelection = selectedCount > 0;
  const entityLabel =
    entityType === "category" ? "categories" : "subcategories";

  // Handle immediate bulk action execution
  const handleBulkActionSelect = (action: BulkAction) => {
    openConfirm({
      title:
        action === "delete_permanently"
          ? "Are you sure you want to permanently delete this item?"
          : "Do you want to toggle the status of this item?",
      description:
        action === "delete_permanently"
          ? "This action cannot be undone. The item will be permanently removed from the system."
          : "Toggling will change the visibility or state of the item, but it can be reverted anytime.",

      onConfirm: () => onExecuteBulkAction(action),
    });
  };

  if (!hasSelection) {
    return (
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 py-3 px-4 bg-muted/10 rounded-lg border">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${entityLabel}...`}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterDeleted} onValueChange={onFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Created</SelectItem>
                <SelectItem value="updated_at">Updated</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between py-4 px-6 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              ref={(ref) => {
                if (ref)
                  (ref as unknown as HTMLInputElement).indeterminate =
                    isIndeterminate;
              }}
              disabled={isProcessing}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All{" "}
              {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCount} {entityLabel} total
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 py-3 px-4 bg-muted/10 rounded-lg border">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${entityLabel}...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterDeleted} onValueChange={onFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created_at">Created</SelectItem>
              <SelectItem value="updated_at">Updated</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
            }
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between py-4 px-6 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              ref={(ref) => {
                if (ref)
                  (ref as unknown as HTMLInputElement).indeterminate =
                    isIndeterminate;
              }}
              disabled={isProcessing}
            />
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {selectedCount} selected
            </Badge>
          </div>

          <Select
            onValueChange={handleBulkActionSelect}
            disabled={isProcessing}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={`Bulk actions for ${entityLabel}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toggle_deleted">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Toggle Status
                </div>
              </SelectItem>
              <SelectItem value="delete_permanently">
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
