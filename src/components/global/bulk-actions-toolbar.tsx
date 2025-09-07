// components/bulk-actions-toolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, RotateCcw, Trash2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type BulkAction = "toggle_deleted" | "delete_permanently" | "";

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
  className?: string;
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
  className,
}: BulkActionsToolbarProps) => {
  const hasSelection = selectedCount > 0;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              disabled={isProcessing}
              className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
              {...(isIndeterminate && { "data-state": "indeterminate" })}
            />
            <label
              htmlFor="select-all"
              className={cn(
                "text-sm font-medium cursor-pointer transition-colors",
                isProcessing && "text-muted-foreground"
              )}
            >
              {isAllSelected
                ? `All ${totalCount} selected`
                : selectedCount > 0
                ? `${selectedCount} of ${totalCount} selected`
                : `Select all ${totalCount} categories`}
            </label>
          </div>

          {/* Selection Badge */}
          {hasSelection && (
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1 transition-all",
                isProcessing && "opacity-50"
              )}
            >
              <CheckSquare className="w-3 h-3" />
              {selectedCount} selected
            </Badge>
          )}
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="flex items-center gap-3">
            {/* Action Select */}
            <Select
              value={bulkAction}
              onValueChange={onBulkActionChange}
              disabled={isProcessing}
            >
              <SelectTrigger
                className={cn(
                  "w-48 transition-all",
                  isProcessing && "opacity-50"
                )}
              >
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toggle_deleted">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Toggle Status</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="delete_permanently"
                  className="text-destructive focus:text-destructive"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Execute Button */}
            <Button
              onClick={onExecuteBulkAction}
              disabled={!bulkAction || isProcessing}
              variant={
                bulkAction === "delete_permanently" ? "destructive" : "default"
              }
              size="sm"
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Apply Action"
              )}
            </Button>

            {/* Clear Selection Button */}
            <Button
              onClick={onClearSelection}
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {isProcessing && (
        <div className="mt-3 pt-3 border-t border-muted">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing {selectedCount} categories...
          </div>
        </div>
      )}
    </Card>
  );
};
