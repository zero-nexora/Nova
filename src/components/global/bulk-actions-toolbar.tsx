import { Trash2, RotateCcw, X } from "lucide-react";
import { BulkAction, EntityType } from "@/app/(admin)/admin/categories/hooks/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsToolbarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  bulkAction: BulkAction;
  isProcessing: boolean;
  onSelectAll: (checked: boolean) => void;
  onBulkActionChange: (action: BulkAction) => void;
  onExecuteBulkAction: () => void;
  onClearSelection: () => void;
  entityType?: EntityType;
}

export const BulkActionsToolbar = ({
  totalCount,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  bulkAction,
  isProcessing,
  onSelectAll,
  onBulkActionChange,
  onExecuteBulkAction,
  onClearSelection,
  entityType = "category",
}: BulkActionsToolbarProps) => {
  const hasSelection = selectedCount > 0;
  const entityLabel =
    entityType === "category" ? "categories" : "subcategories";
  const entityLabelSingular =
    entityType === "category" ? "category" : "subcategory";

  if (!hasSelection) {
    return (
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
    );
  }

  return (
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
          value={bulkAction}
          onValueChange={onBulkActionChange}
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
          onClick={onExecuteBulkAction}
          disabled={!bulkAction || isProcessing}
          variant={
            bulkAction === "delete_permanently" ? "destructive" : "default"
          }
          size="sm"
        >
          {isProcessing
            ? "Processing..."
            : `Apply to ${selectedCount} ${
                selectedCount === 1 ? entityLabelSingular : entityLabel
              }`}
        </Button>
      </div>

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
  );
};
