import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LocalImagePreview,
  UploadedImage,
} from "@/queries/admin/uploads/types";

interface LocalImagePreviewProps {
  preview: LocalImagePreview;
  onRemove: (id: string) => void;
}

export const LocalImagePreviewCard = ({
  preview,
  onRemove,
}: LocalImagePreviewProps) => (
  <div className="relative group border rounded-lg overflow-hidden bg-card">
    <img
      src={preview.base64Url}
      alt={preview.file.name}
      className="w-full h-32 object-cover"
    />
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={() => onRemove(preview.id)}
      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="h-4 w-4" />
    </Button>
    <div className="p-2">
      <p className="text-xs text-muted-foreground truncate">
        {preview.file.name}
      </p>
    </div>
  </div>
);

interface UploadedImagePreviewProps {
  image: UploadedImage;
  onDelete: (publicId: string) => void;
  isDeleting?: boolean;
}

export const UploadedImagePreviewCard = ({
  image,
  onDelete,
  isDeleting,
}: UploadedImagePreviewProps) => (
  <div className="relative group border rounded-lg overflow-hidden bg-card">
    <img
      src={image.url}
      alt={image.publicId}
      className="w-full h-32 object-cover"
    />
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={isDeleting}
      onClick={() => onDelete(image.publicId)}
      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="h-4 w-4" />
    </Button>
    <div className="p-2">
      <p className="text-[10px] text-muted-foreground break-all">
        {image.publicId}
      </p>
    </div>
  </div>
);
