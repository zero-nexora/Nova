import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";

interface LocalImagePreviewProps {
  preview: LocalImagePreview;
  onRemove: (id: string) => void;
}

export const LocalImagePreviewCard = ({
  preview,
  onRemove,
}: LocalImagePreviewProps) => (
  <div className="relative size-20 group border rounded-md overflow-hidden bg-card">
    <img
      src={preview.base64Url}
      alt="Image preview"
      className="size-20 object-cover"
    />
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={() => onRemove(preview.id)}
      className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);
