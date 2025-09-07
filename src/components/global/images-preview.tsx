import { X } from "lucide-react";
import { Button } from "../ui/button";
import { PreviewItem } from "@/app/(admin)/admin/categories/hooks/types";

interface ImagesPreviewProps {
  disabled?: boolean;
  onClearAll?: () => void;
  showClearAllButton?: boolean;
  onRemove?: (id: string) => void;
  previewList: PreviewItem[];
}

export const ImagesPreview = ({
  onRemove,
  disabled,
  onClearAll,
  previewList,
  showClearAllButton,
}: ImagesPreviewProps) => (
  <div className="relative">
    <div className="flex flex-wrap gap-3 border p-2 rounded-md">
      {previewList.map((preview) => (
        <div
          className="relative size-20 group border rounded-md overflow-hidden bg-card"
          key={preview.id}
        >
          <img
            src={preview.url}
            alt="Image preview"
            className="size-20 object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => onRemove?.(preview.id)}
            className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>

    {showClearAllButton && (
      <button
        type="button"
        onClick={onClearAll}
        disabled={disabled}
        className="absolute top-0 right-0 bg-muted hover:bg-muted/90 text-white text-xs p-1.5 rounded-md transition-colors shadow-sm -translate-y-[100%] rounded-bl-none rounded-br-none"
      >
        Clear All
      </button>
    )}
  </div>
);
