import z from "zod";

export const uploadImageSchema = z.object({
  base64: z.string({ message: "Image is required " }),
  filename: z.string().optional(),
  folder: z.string().optional(),
});

export interface uploadedImage {
  url: string;
  publicId: string;
}

export interface LocalImagePreview {
  id: string;
  file: File;
  base64Url: string;
}

export interface UploadedImage {
  publicId: string;
  url: string;
  filename?: string;
}

export interface ImageUploaderProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxFiles?: number;
  folder?: string;
  disabled?: boolean;
  multiple?: boolean;
}
