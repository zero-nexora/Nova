export interface LocalImagePreview {
  id: string;
  base64Url: string;
}

export interface UploadedImage {
  id: string;
  imageUrl: string;
}

export interface PreviewItem {
  id: string;
  url: string;
}

export type BulkAction = "toggle_deleted" | "delete_permanently" | "";
export type EntityType = "category" | "subcategory";

export function mapPreviewList(
  previewList: (LocalImagePreview | UploadedImage)[]
): PreviewItem[] {
  return previewList.map((item) => ({
    id: item.id,
    url: "base64Url" in item ? item.base64Url : item.imageUrl,
  }));
}
